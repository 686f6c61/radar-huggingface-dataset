# jobicy/job-skills-extractor

## Resumen

Jobicy Job Skills Extractor v0.1.0 es un modelo experimental de extracción de habilidades (skill extraction) diseñado para identificar menciones de competencias y conocimientos en descripciones de empleo en inglés. Lo desarrolla Jobicy, una plataforma de empleo remoto, y se publica bajo licencia Apache 2.0. El modelo resuelve un problema concreto: convertir texto libre de ofertas de trabajo en entidades estructuradas con offsets de caracteres exactos y nombres normalizados, algo útil para sistemas de tagging asistido, motores de búsqueda de empleo y pipelines de datos de reclutamiento.

Técnicamente no es un transformer generativo, sino un sistema híbrido de etiquetado de tokens construido sobre un encoder MiniLM congelado (`sentence-transformers/all-MiniLM-L6-v2`) de 384 dimensiones, una proyección fija de 384 a 64 y dos cabezas CRF lineales entrenadas, una para `SKILL` y otra para `KNOWLEDGE`. Se complementa con coincidencia exacta contra un catálogo finito de 382 habilidades con 428 alias en inglés. El paquete se distribuye en formato ONNX y se ejecuta en CPU sin conexión.

Su relevancia es acotada pero clara: demuestra un enfoque ligero, desplegable en local y con salida interpretable (cada entidad registra su método de detección) para una tarea de extracción de información muy específica del dominio de empleo. El propio autor lo etiqueta como prototipo experimental y advierte de que requiere revisión humana antes de un uso productivo no supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MiniLM congelado + proyeccion 384→64 + dos cabezas CRF lineales (una para SKILL, otra para KNOWLEDGE) + coincidencia exacta de catalogo |
| Parametros totales | no disponible (el encoder base es all-MiniLM-L6-v2; el resto son cabezas CRF y proyeccion de pequeno tamano) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como cifra unica; procesa el texto completo mediante secuencias acotadas y ventanas de encoder solapadas |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; el modelo base figura como quantized en los tags) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (libreria onnxruntime) |

## Arquitectura y entrenamiento

El modelo congela el encoder MiniLM, que aporta representaciones contextuales por token, y aplica una proyeccion fija de 384 a 64 dimensiones que alimenta dos CRF de cadena lineal independientes, junto con rasgos lexicos, de contexto y de catalogo. Una cabeza predice spans de tipo `SKILL` (competencias aplicadas o interpersonales) y otra spans de tipo `KNOWLEDGE` (tecnologias, herramientas, metodos y areas de conocimiento). La coincidencia exacta contra catalogo constituye una ruta de extraccion adicional y explicita, y cada entidad resultante registra su metodo de deteccion.

El entrenamiento usa 3.697 frases deduplicadas etiquetadas por expertos. Ademas, 2.000 frases separadas de contexto de requisitos aportan etiquetas automaticas de alias, que constituyen supervision debil y no oro experto. Un corpus de 10.299 vacantes mantiene su particion original: solo las 6.182 vacantes de entrenamiento contribuyen a frecuencias de dominio y etiquetas debiles, mientras que las 4.117 de validacion y test quedan excluidas del ajuste y del perfil de dominio. La validacion selecciona la regularizacion y se excluyen oraciones normalizadas repetidas entre las particiones de datos expertos. Los textos completos de las descripciones no se redistribuyen.

## Capacidades

- Extraccion de menciones de habilidades aplicadas e interpersonales (`SKILL`) y de conocimientos, tecnologias, herramientas y metodos (`KNOWLEDGE`).
- Normalizacion de 382 habilidades de catalogo a traves de 428 alias en ingles (por ejemplo, `AWS` a `Amazon Web Services` y `NodeJS` a `Node.js`).
- Devolucion de `text`, `start`, `end`, `normalized`, `skill_id`, `entity_types` y `detection_methods` por cada span.
- Procesamiento del texto completo mediante secuencias acotadas y ventanas de encoder solapadas, incluido el contenido final del documento.
- Ejecucion offline en CPU tras la instalacion.
- Interfaces en Python y CSV UTF-8.
- Distincion explicita del metodo de deteccion: las entidades solo de catalogo tienen `score: null` y no se les asigna una confianza de modelo fabricada.
- No incluye tool calling, function calling, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Tagging asistido de ofertas de empleo: el modelo extrae habilidades y tecnologias de la descripcion para proponer etiquetas que un revisor humano valida despues, aprovechando la salida con offsets exactos y nombres normalizados.
- Construccion de indices de busqueda de empleo: las menciones normalizadas a traves de alias permiten mapear variantes como `NodeJS` y `Node.js` a un mismo identificador de habilidad, mejorando la recuperacion por competencia.
- Enriquecimiento de bases de datos de reclutamiento: el pipeline puede procesar lotes de descripciones en CSV y anadir columnas estructuradas de habilidades y conocimientos para analitica posterior.
- Analisis de mercado laboral: agregar frecuencias de habilidades extraidas sobre corpus de vacantes (el autor uso un corpus de 10.299 vacantes) para estudiar tendencias de demanda por ocupacion.
- Preprocesamiento para sistemas de matching candidato-vacante: las habilidades normalizadas y sus offsets sirven como entrada estructurada a un motor de emparejamiento, siempre con revision humana por la tasa de error conocida.
- Extraccion local y privada en CPU: al ejecutarse offline en CPU, encaja en entornos donde no se permite enviar descripciones a servicios externos, como procesos internos de RR. HH. con requisitos de confidencialidad.
- Prototipado rapido de funcionalidades de parsing de CV y ofertas: su API Python y su salida interpretable facilitan integrar un primer extractor en un producto antes de invertir en un modelo propio.

## Benchmarks y rendimiento

Evaluacion de la API real sobre 2.660 frases reservadas etiquetadas por expertos, exigiendo tipo de entidad correcto y limites de caracteres exactos:

| Metrica de la API completa | Resultado |
|---|---:|
| Precision de span tipado exacto | 39,48% |
| Recall de span tipado exacto | 29,42% |
| F1 de span tipado exacto | 0,3371 |

Estas cifras son metricas de span, no de precision por token ni de precision de etiqueta normalizada; los limites exactos y las convenciones de anotacion penalizan las coincidencias parciales o mas estrechas. El autor advierte que el benchmark se inspecciono durante el desarrollo y no constituye un test final independiente pristino. Ademas, se realizo una revision asistida de anclas de habilidades en 27 extractos reales de vacantes, uno por categoria ocupacional, como comprobacion limitada de solapamiento y no como estimacion de precision en produccion.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse offline en CPU tras la instalacion, sin necesidad de GPU.
- VRAM estimada: no aplica en el flujo previsto; el encoder base MiniLM es de muy pequeno tamano y las cabezas CRF anaden coste marginal.
- GPU recomendadas: no disponibles ni necesarias para el caso de uso documentado.
- Compatibilidad con GPU de consumo: irrelevante para el diseno; el despliegue objetivo es CPU.
- Opciones de despliegue: paquete Python con `onnxruntime`, interfaz de linea de comandos (`extract.py`) e interfaz CSV UTF-8.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jobicy/job-skills-extractor | Encoder MiniLM + CRF + catalogo | no disponible (base MiniLM) | ventanas solapadas sobre texto completo | Extraccion de habilidades en ofertas de empleo, ingles | apache-2.0 | Hugging Face, ONNX, CPU |
| sentence-transformers/all-MiniLM-L6-v2 | Encoder de frases | no disponible en la informacion | no disponible | Embeddings de frases; no extrae spans por si mismo | apache-2.0 | Hugging Face |
| Modelos NER genericos de token-classification | Transformer etiquetador | variable | variable | NER general; no especifico de habilidades laborales | variable | Hugging Face |

No se dispone en la informacion proporcionada de comparaciones directas con otros extractores de habilidades especificos del dominio de empleo.

## Limitaciones y advertencias

- Modelo experimental: el autor lo califica de prototipo para tagging asistido y exige datos anotados adicionales y revision antes de un uso productivo no supervisado.
- Calidad limitada: F1 de span tipado exacto de 0,3371, con errores y omisiones sustanciales; el benchmark no es un test final independiente pristino.
- Solo ingles: no soporta otros idiomas.
- Catalogo finito de 382 habilidades con 428 alias; los spans aprendidos pueden ir mas alla del catalogo, pero la normalizacion solo cubre ese conjunto.
- Las menciones extraidas no son necesariamente requisitos obligatorios: no se resuelven por completo la negacion, las preferencias, las descripciones de la empresa ni los beneficios.
- El modelo no infiere habilidades no mencionadas a partir del titulo del puesto.
- Pueden aparecer entidades solapadas y tipos de entidad incorrectos (los tipos son aprendidos o derivados del catalogo).
- Los offsets son indices de puntos de codigo Unicode de Python sobre la entrada original, no offsets de bytes UTF-8 ni indices UTF-16 de JavaScript; se debe suministrar texto plano, ya que el HTML no se analiza ni se elimina.
- Las puntuaciones de spans aprendidos son marginales de token medias sin calibrar; las entidades solo de catalogo tienen `score: null` y no deben interpretarse como confianza de modelo.
- Riesgo de sesgos y alucinacion: no documentado en la informacion proporcionada; la tarea es extractiva, pero la normalizacion y el catalogo pueden introducir sesgos de cobertura.
- Licencia Apache 2.0: permite uso comercial, pero el estado experimental y las advertencias del autor desaconsejan desplegarlo sin revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jobicy/job-skills-extractor
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Jobicy: https://jobicy.com
- Remote Jobs API / MCP: https://jobicy.com/jobs-rss-feed
