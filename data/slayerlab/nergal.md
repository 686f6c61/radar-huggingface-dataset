# SlayerLab/NERGAL

## Resumen

NERGAL (Named Entity Recognition with Grounded Additive Labels) es un sistema híbrido de anonimización de PII para polaco desarrollado por SlayerLab. No es un modelo de chat ni un generador de texto: es un limpiador de datos personales que combina un conjunto de reglas de expresiones regulares congelado (`scrub_pii.py`) con una cabeza de reconocimiento de entidades entrenada sobre XLM-RoBERTa-large. Las reglas detectan los identificadores que pueden demostrarse de forma determinista y el transformer añade los spans que las reglas no alcanzan, principalmente teléfonos y otros PII. Sobre el texto original se calcula la unión de ambas detecciones y las coincidencias se sustituyen por las etiquetas `[Telefon]` o `[PII]`.

El modelo se distribuye como un "PII island": no funciona como un `pipeline("token-classification")` estándar, sino que requiere cargar el repositorio completo y usar la clase `Nergal` incluida, que orquesta el regex, el clasificador de tokens con etiquetas BIO `phone` / `pii` y el umbral de decisión de 0,95. La instantánea publicada corresponde a la semilla 202609160 y a la época 5 de un calendario de siete épocas, seleccionada porque fue el único punto que mejoró la cobertura del sistema incumbente sin introducir caracteres enmascarados falsos adicionales.

El interés actual del modelo es práctico y regulatorio: ofrece un componente evaluado y reproducible para el cumplimiento de RGPD en corpus polacos, con métricas publicadas sobre un split de desarrollo de 841 pasajes y 354 spans de PII, y con comparaciones directas frente a GLiNER y HerBERT-large. Su licencia MIT y su tamaño contenido (559 millones de parámetros) lo hacen desplegable en hardware modesto, aunque su utilidad está limitada al idioma polaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa-large con cabeza de clasificacion de tokens (etiquetas BIO `phone` / `pii`), envuelto en un pipeline hibrido regex + modelo |
| Parametros totales | 558.848.005 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada por el autor; la arquitectura base XLM-RoBERTa-large admite 512 tokens de posicion |
| Tipos de cuantizacion | no se distribuyen cuantizaciones precalculadas; el repositorio solo publica pesos safetensors (2,3 GB, coherente con fp32) |
| Idiomas soportados | polaco (pl) |
| Licencia | MIT |
| Formato de pesos | safetensors (carga mediante `transformers` y codigo propio `nergal.py`) |

Otros datos de interes: el repositorio tiene 0 descargas y 2 likes en el momento de la consulta, ocupa 2,3 GB, fue creado y actualizado el 18 de septiembre de 2026, y deriva de `FacebookAI/xlm-roberta-large` en la revision `c23d21b0620b635a76227c604d44e43a9f0ee389` (MIT). El fichero `hybrid.json` registra el umbral 0,95 y los identificadores de hueco `250002` / `250003`.

## Arquitectura y entrenamiento

NERGAL es un sistema en dos capas. La primera es `scrub_pii`, un conjunto congelado de reglas de expresiones regulares que actua como "ground" o ancla determinista del pipeline. La segunda es un clasificador de tokens basado en XLM-RoBERTa-large ("additive labels"), que se entrena para etiquetar spans de tipo `phone` y `pii` con esquema BIO y se aplica con umbral 0,95. En inferencia, el regex se ejecuta sobre el texto original, el modelo añade sus spans propios y ambos conjuntos se unen antes de reemplazar por `[Telefon]` o `[PII]`. No hay etapa de generacion ni de decodificacion autoregresiva.

Los datos de entrenamiento proceden de una trancha etiquetada de 4.500 pasajes (3.655 de entrenamiento y 841 de desarrollo), con fuentes coincidentes con Dynaword: EUR-Lex, HPLT, Wikipedia, texto parlamentario y gubernamental, mas porciones menores de noticias y literatura. Las etiquetas mezclan silver sin modificar con revision humana. El split de desarrollo contiene 215 pasajes con PII dorada y 354 spans (169 de telefono y 185 de otro tipo de PII); los ficheros con identificadores reales no se publican junto con los pesos.

La innovacion tecnica destacable es el procedimiento de seleccion del punto de operacion. Se entrenaron modelos frescos de XLM-R durante siete epocas y se evaluaron 133 combinaciones de epoca y umbral. La epoca 5 con umbral 0,95 fue el unico punto que supero al incumbente historico (GLiNER ∪ regex) tanto en cobertura como en preservacion de contenido, con cero caracteres falsos nuevos respecto a ese incumbente. Los autores compararon tambien GLiNER, HerBERT-large y XLM-R-large entrenados sobre el mismo split y con el mismo regex; ningun punto de operacion de GLiNER o HerBERT paso la puerta de preservacion de contenido.

## Capacidades

- Deteccion y enmascarado de PII en texto polaco, con sustitucion por las etiquetas `[Telefon]` y `[PII]`.
- Reconocimiento de entidades de tipo telefono y de otras categorias de datos personales mediante etiquetas BIO `phone` / `pii`.
- Union de detecciones regex y neuronales sobre el texto original, con umbral de confianza configurable (0,95 en esta instantanea).
- Procesamiento por pasajes o fragmentos de texto, no generacion: la salida es texto enmascarado mas un recuento de detecciones (`masked, counts = nergal.scrub(text)`).
- Uso en modo local y sin conexion: la carga se realiza con `snapshot_download` y `local_files_only=True`.
- Incluye un test unitario sintetico (`test_nergal.py`, ejecutable con `python -m unittest test_nergal`) que no contiene texto de corpus.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. El autor indica explicitamente que no es un modelo de chat.

## Casos de uso

- Cumplimiento de RGPD en corpus polacos: anonimizar transcripciones, correos o formularios antes de almacenarlos o cederlos a terceros, usando la union regex + modelo para maximizar la cobertura de spans de telefono y otros identificadores.
- Preparacion de datasets para publicacion: limpiar tranchas de texto polaco (por ejemplo, procedentes de fuentes parlamentarias o de noticias) antes de liberarlas, sustituyendo los identificadores por etiquetas categoricas que preservan la estructura del texto.
- Saneado de logs y tickets de soporte: pasar los registros de atencion al cliente por `nergal.scrub()` para eliminar telefonos y datos personales antes de usarlos en analitica interna o entrenamiento de otros modelos.
- Normalizacion en pipelines de documentos legales: procesar expedientes y resoluciones en polaco para separar el contenido reutilizable de los datos identificativos, con una tasa de falsos caracteres conocida y medida (133 en el split de desarrollo).
- Revision humana asistida: usar el sistema como primera pasada que genera propuestas de enmascarado, de modo que un revisor se centre en los 25 pasajes con PII residual del split de referencia en lugar de revisar el corpus completo.
- Integracion en procesos ETL por lotes: al ser un modelo de 559 millones de parametros con pesos safetensors y sin dependencia de servicios externos, puede ejecutarse como paso adicional en un job de procesamiento de texto en CPU o GPU modesta.
- Auditoria de calidad de anonimizacion: comparar el comportamiento del regex aislado con el del sistema completo sobre muestras propias para estimar cuanto PII adicional aporta la cabeza neuronal en un dominio concreto.
- Filtrado previo en proyectos de investigacion con textos historicos o administrativos polacos, donde la deteccion determinista de identificadores no es suficiente.

## Benchmarks y rendimiento

Los resultados publicados se calculan siempre sobre el mismo split de desarrollo de 841 pasajes (354 spans: 169 de telefono y 185 de otro PII), con umbral 0,95. "Naked" es el transformer solo; "∪ regex" es el modelo unido a las reglas congeladas, que es la receta de NERGAL. Las puntuaciones de caracteres comparan el texto dorado con el texto enmascarado.

Progresion por epocas del modelo XLM-R (umbral 0,95):

| Epoca | Spans cubiertos /354 | Pasajes con PII residual | Caracteres falsos | Falsos nuevos vs incumbente |
|---|---:|---:|---:|---:|
| 1 | 272 | 59 | 175 | 42 |
| 2 | 291 | 49 | 141 | 8 |
| 3 | 317 | 30 | 140 | 7 |
| 4 | 320 | 28 | 143 | 10 |
| 5 | 323 | 25 | 133 | 0 |
| 6 | 328 | 20 | 147 | 14 |
| 7 | 334 | 16 | 148 | 15 |

Comparativa de sistemas sobre el mismo split (umbral 0,95):

| Sistema | Modo | Spans cubiertos /354 | Residual | Caracteres falsos | Precision por caracter | Recall por caracter |
|---|---|---:|---:|---:|---:|---:|
| Regex (`scrub_pii`) | reglas | 245 | 73 | 133 | 97,36 % | 81,01 % |
| GLiNER 2.5-multi zero-shot | naked | 81 | 188 | 970 | 56,98 % | 21,22 % |
| GLiNER 2.5-multi zero-shot | ∪ regex | 262 | 63 | 1.103 | 82,36 % | 85,02 % |
| GLiNER historico email12 | naked | 249 | 70 | 10 | 99,81 % | 85,39 % |
| GLiNER historico email12 | ∪ regex | 289 | 51 | 143 | 97,54 % | 93,48 % |
| XLM-R epoca 5 | naked | 298 | 42 | 57 | 98,96 % | 89,38 % |
| NERGAL (esta instantanea) | ∪ regex | 323 | 25 | 133 | 97,76 % | 95,95 % |

Metricas adicionales de NERGAL desglosadas por tipo: 144 de 169 telefonos y 179 de 185 spans de otro PII. La precision exacta por span es del 87,50 %, el recall del 88,98 % y el F1 del 88,24 %. Los 133 caracteres falsos corresponden al error de regex con correos electronicos pegados; esta semilla no añade nada a ese suelo. La comparativa con el modelo zero-shot GLiNER 2.5 es especialmente desfavorable en PII que no es telefono (7 de 185 spans completos en modo naked, frente a 160 naked y 179 en union para esta instantanea).

Estabilidad entre semillas:

| Semilla | Spans cubiertos /354 | Caracteres falsos | Falsos nuevos vs union historica |
|---|---:|---:|---:|
| 202609160 (este repositorio) | 323 | 133 | 0 |
| 202609161 | 322 | 134 | 1 |
| 202609162 | 316 | 151 | 18 |

No se han publicado resultados de benchmarks generales de NLP (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un modelo de clasificacion de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2,3 GB para los pesos en fp32 mas el coste de activaciones de un encoder de 24 capas sobre secuencias de hasta 512 tokens; aproximadamente 1,2-1,5 GB si se convierte a fp16. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060 o superiores funcionan sin problema. Modelos de centro de datos como A100 o H100 no son necesarios para este tamaño.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU para lotes pequeños, dado el tamaño del modelo.
- Opciones de despliegue: exclusivamente mediante `transformers` y el codigo propio del repositorio (`snapshot_download` + `nergal.Nergal.from_pretrained` + `scrub`). El autor advierte que `pipeline("token-classification")` no coincide con el comportamiento del sistema. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y estos motores no encajan con un wrapper de post-procesado regex que necesita ejecutarse junto al modelo.
- Latencia y throughput: no publicados en la informacion disponible.

## Comparativa con modelos similares

| Sistema | Tipo | Spans cubiertos /354 (∪ regex) | Caracteres falsos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NERGAL (XLM-R epoca 5) | Encoder NER + regex | 323 | 133 | MIT | Pesos en HuggingFace; requiere codigo propio |
| GLiNER historico email12 | NER zero-shot ajustado + regex | 289 | 143 | no disponible | no disponible en la informacion proporcionada |
| GLiNER 2.5-multi zero-shot | NER zero-shot + regex | 262 | 1.103 | no disponible | Repositorio enlazado en la model card |
| Regex `scrub_pii` aislado | Reglas | 245 | 133 | no disponible | Incluido en el repositorio de NERGAL |
| HerBERT-large ajustado | Encoder NER + regex | no disponible en la tabla publicada | no disponible | no disponible | no disponible |
| XLM-R-large ajustado (naked) | Encoder NER | 298 (sin regex) | 57 | MIT (base) | no disponible |

La conclusion que se desprende de los datos del autor es que NERGAL maximiza la cobertura de spans entre los sistemas evaluados sobre este split, mientras que el GLiNER historico ajustado es el mas preciso en modo naked pero queda por detras en cobertura. El modelo zero-shot GLiNER 2.5 no resulta competitivo en este dominio, especialmente en PII distinta del telefono.

## Limitaciones y advertencias

- Modelo especifico de polaco: aunque la arquitectura base XLM-RoBERTa-large es multilingue, esta instantanea esta ajustada y evaluada unicamente para polaco. No hay evidencia publicada de su comportamiento en castellano ni en otros idiomas.
- No es un modelo de chat ni un generador: no acepta instrucciones, no produce texto libre y no debe usarse como sustituto de un LLM.
- No es compatible con `pipeline("token-classification")` de forma directa; ignorar esta advertencia produce resultados distintos de los documentados, porque el sistema real depende de la union con el regex.
- Suelo de falsos positivos conocido: los 133 caracteres falsos del split de desarrollo proceden del error de regex al tratar correos electronicos pegados. Ese suelo se hereda independientemente de la calidad del modelo neuronal.
- Falsos negativos residuales: en la epoca 5 quedan 25 pasajes con PII no enmascarada sobre el split de desarrollo. Cobertura del 91,24 % de los spans (323 de 354), no del 100 %.
- El umbral 0,95 es parte del contrato del sistema; modificarlo altera el equilibrio entre cobertura y preservacion de contenido, y los autores documentan que otros puntos de operacion introducen mas caracteres falsos.
- Variabilidad entre semillas: las semillas alternativas rinden entre 316 y 322 spans cubiertos y entre 133 y 151 caracteres falsos, con hasta 18 caracteres falsos nuevos respecto al incumbente.
- Los ficheros de datos con identificadores reales no se liberan con los pesos, de modo que no es posible reproducir el split de evaluacion a partir del repositorio.
- `test_nergal.py` es sintetico y no contiene texto de corpus, por lo que no sustituye a una validacion sobre datos propios.
- Licencia MIT, sin restricciones documentadas para uso comercial; conviene aun asi verificar la licencia de los datos de entrenamiento de origen (Dynaword y sus fuentes subyacentes) y el cumplimiento normativo en el tratamiento de datos personales.
- Riesgo de falso sentido de seguridad: un texto enmascarado no garantiza por si solo el anonimato, ya que pueden persistir identificadores indirectos no cubiertos por las etiquetas `phone` y `pii`.
- No se publican datos de sesgo ni evaluaciones de equidad en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/NERGAL
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large (revision `c23d21b0620b635a76227c604d44e43a9f0ee389`, licencia MIT)
- GLiNER 2.5-multi (referencia comparativa zero-shot enlazada en la model card): https://huggingface.co/fastino/gliner2.5-multi-v1
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
