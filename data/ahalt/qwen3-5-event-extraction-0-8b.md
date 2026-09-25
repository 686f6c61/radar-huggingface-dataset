# ahalt/qwen3.5-event-extraction-0.8b

## Resumen

`ahalt/qwen3.5-event-extraction-0.8b` es un modelo de extraccion de atributos especializado en el dominio de la codificacion de eventos politicos, desarrollado por el investigador ahalt (Andrew Halterman) como componente central de NGEC (Next Generation Event Coder), un pipeline para generar datasets de eventos politicos personalizados. El modelo parte del checkpoint `Qwen/Qwen3.5-0.8B` y ha sido ajustado para una unica tarea muy delimitada: dado un documento de prensa y la definicion textual de un tipo de evento politico, devolver una lista JSON con todas las instancias de ese evento presentes en el texto. Cada registro incluye una cita ancla, un sub-evento (mode) y los campos actor, recipient, date y location como spans literales del documento, ademas de atributos opcionales como el numero de fallecidos o heridos.

La relevancia del modelo es doble. Por un lado, sustituye a `ahalt/qwen3-event-extraction-exp5.1`, el modelo empleado en el articulo enviado a publicacion, y mejora su F1 medio de 54,9 a 71,0 sobre un conjunto de test de 500 documentos nuevos de VOA. Por otro, demuestra que un modelo de solo 873.438.784 parametros (menos de 1B) puede resolver una tarea de extraccion estructurada con formato JSON estricto sin necesidad de modelos frontera, lo que abarata drasticamente el coste de anotar corpus periodisticos a gran escala.

El modelo esta publicado bajo licencia Apache 2.0, solo trabaja con ingles y esta disenado para ejecutarse tanto en GPU como en CPU mediante una cuantizacion Q8_0 en formato GGUF. Su salida es deliberadamente verificable: todos los valores de actor, recipient, date y location deben ser subcadenas exactas del texto original, lo que reduce el riesgo de alucinacion en los campos criticos y facilita la auditoria manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; modelo base de la familia Qwen3.5 (`Qwen/Qwen3.5-0.8B`), ajustado para extraccion estructurada |
| Parametros totales | 873.438.784 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 GGUF publicada por el autor; otros formatos no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF Q8_0 en repo separado |
| Tamano del repositorio | 1,8 GB |
| Modelo base | `Qwen/Qwen3.5-0.8B` (fine-tune) |
| Tarea | Extraccion de eventos politicos a JSON estructurado |
| Dominio | Ciencia politica, ciencias sociales computacionales, datos de eventos |

## Arquitectura y entrenamiento

No se detallan en la informacion proporcionada ni la arquitectura interna exacta ni la composicion del dataset de entrenamiento mas alla de su naturaleza: los documentos de entrenamiento fueron articulos de Voice of America (VOA) de hasta aproximadamente 1.000 palabras, con el titular en primer lugar seguido de un punto. El modelo se presenta como un fine-tune del checkpoint `Qwen/Qwen3.5-0.8B`, por lo que hereda la arquitectura y el tokenizador de esa familia; se desconoce si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento posteriores al ajuste supervisado.

La innovacion tecnica principal no esta en la arquitectura sino en el diseno de la tarea y del formato de salida. El prompt se compone de un mensaje de sistema fijo (que define el esquema de registro JSON) y un mensaje de usuario con el documento y la definicion del tipo de evento, formateados con la plantilla de chat del tokenizador original. Los atributos opcionales modifican el propio mensaje de sistema: `killed` e `injured` se activan siempre para los tipos ASSAULT, PROTEST y COERCE y se desactivan para el resto, mientras que `reporter` esta desactivado por defecto y puede habilitarse para cualquier tipo. El modelo restringe las salidas de actor, recipient, date, location y atributos adicionales a subcadenas literales del documento, y devuelve `[]` cuando el tipo de evento no aparece. El repositorio incluye `definitions.json` con las cadenas de definicion exactas de la ontologia PLOVER vistas durante el entrenamiento, pero el modelo acepta definiciones escritas por el usuario para tipos de evento no vistos en entrenamiento.

## Capacidades

- Extraccion de eventos politicos: dado un documento y la definicion de un tipo de evento, devuelve una lista JSON con todas las instancias detectadas en el texto.
- Salida JSON estructurada con campos fijos: `event_type`, `mode` (sub-evento), `anchor_quote`, `actor`, `recipient`, `date` y `location`.
- Extraccion de spans literales: los valores de actor, recipient, date, location y atributos adicionales son subcadenas verbatim del documento, no parafrasis.
- Extraccion de atributos opcionales: `killed` e `injured` (numero o colectivo de victimas mortales o heridas), y `reporter` (fuente a la que el documento atribuye la informacion).
- Soporte de tipos de evento personalizados: admite definiciones de tipos no vistos en entrenamiento, lo que permite codificar taxonomias propias.
- Manejo explicito de la ausencia de evento: devuelve la lista vacia `[]` en lugar de forzar una extraccion.
- Salida con multiples valores por campo: los campos admiten listas JSON con varios elementos en lugar de cadenas separadas por punto y coma.
- Capacidad de ejecucion en CPU mediante la cuantizacion Q8_0 publicada en formato GGUF.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Construccion de datasets de eventos politicos a gran escala: integrado en el pipeline NGEC, el modelo procesa flujos de articulos periodisticos y genera registros estructurados listos para analisis cuantitativo, sustituyendo parte del trabajo de codificacion manual.
- Monitorizacion de violencia politica y conflictos: utilizando los tipos ASSAULT, PROTEST y COERCE con los atributos `killed` e `injured` activados, permite construir series temporales de letalidad y frecuencia de eventos a partir de cobertura informativa.
- Codificacion de taxonomias propias: un equipo de investigacion puede escribir definiciones de tipos de evento especificos de su estudio (por ejemplo, "detencion de periodistas" o "manifestacion contra una reforma laboral") sin reentrenar el modelo, aprovechando que acepta definiciones arbitrarias.
- Analisis de atribucion de fuentes en cobertura mediatica: con el atributo `reporter` activado, permite medir a que fuentes (agencias, ministerios, testigos, funcionarios anonimos) atribuye cada medio la informacion sobre un evento.
- Anotacion asistida con humano en el bucle: al devolver spans verificables y citas ancla, las salidas pueden revisarse rapidamente por anotadores humanos, reduciendo el coste de producir corpus de referencia de alta calidad.
- Enriquecimiento de archivos de prensa historica: aplicado sobre hemerotecas digitalizadas, permite convertir colecciones de texto plano en bases de datos consultables de eventos politicos con fecha y localizacion.
- Procesamiento de gran volumen en infraestructura modesta: gracias al GGUF Q8_0 y a su tamano inferior a 1B de parametros, puede desplegarse en CPU para anotar cientos de miles de documentos sin coste de GPU.
- Validacion y control de calidad de codificaciones existentes: comparar las extracciones del modelo con anotaciones humanas previas permite detectar omisiones o discrepancias en datasets ya publicados.

## Benchmarks y rendimiento

El autor reporta un unico resultado cuantitativo, evaluado sobre un conjunto de test de 500 documentos nuevos de VOA:

| Modelo | Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|---|
| `ahalt/qwen3.5-event-extraction-0.8b` | 500 documentos de VOA | F1 medio | 71,0 |
| `ahalt/qwen3-event-extraction-exp5.1` | 500 documentos de VOA | F1 medio | 54,9 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este modelo, lo cual es coherente con su naturaleza de modelo especializado en una unica tarea de extraccion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16 (calculada a partir de los 873,4 M de parametros): aproximadamente 1,7-2,0 GB, mas el espacio de cache KV y activaciones.
- VRAM estimada con cuantizacion Q8_0: aproximadamente 0,9-1,2 GB, suficiente para cualquier GPU de consumo actual.
- VRAM estimada con cuantizaciones de 4 bits (no publicadas por el autor): del orden de 0,5-0,7 GB, si bien no se ofrece un artefacto oficial en ese formato.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; en la practica, el modelo esta sobredimensionado para GPUs de gama alta y su despliegue natural es en lotes grandes sobre GPU o directamente en CPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna, e incluso en iGPU con memoria compartida suficiente si se usa la cuantizacion Q8_0.
- Opciones de despliegue: llama.cpp mediante el GGUF Q8_0 publicado por el autor (`ahalt/qwen3.5-event-extraction-0.8b-GGUF`); los pesos safetensors permiten tambien vLLM o TGI, aunque el autor no documenta configuraciones especificas para estos servidores. Ollama es viable importando el GGUF.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad ni de coste por documento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (F1 medio en 500 docs VOA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ahalt/qwen3.5-event-extraction-0.8b` | 873,4 M | No disponible | 71,0 | Apache 2.0 | Pesos safetensors y GGUF Q8_0 en HuggingFace |
| `ahalt/qwen3-event-extraction-exp5.1` | No disponible | No disponible | 54,9 | No disponible en la informacion proporcionada | Modelo predecesor, referenciado desde la model card |
| `Qwen/Qwen3.5-0.8B` | No disponible | No disponible | No aplica (modelo generalista, sin ajuste para esta tarea) | No disponible en la informacion proporcionada | Modelo base en HuggingFace |

No se dispone de datos que permitan comparar este modelo con otras alternativas de extraccion de eventos de la literatura (por ejemplo, codificadores de eventos basados en reglas o modelos generativos de proposito general) en terminos de parametros, contexto o rendimiento, por lo que esa comparacion se marca como no disponible.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo realiza extraccion de eventos politicos en ingles; no es util para generacion abierta, razonamiento general, codigo ni matematicas.
- Idioma unico: solo se ha entrenado y evaluado en ingles, y los documentos de entrenamiento son articulos de VOA de hasta unas 1.000 palabras; el rendimiento en otros idiomas o en textos mas largos no esta documentado.
- Dependencia del dominio: fue ajustado con articulos de VOA y la ontologia PLOVER, por lo que su comportamiento en generos periodisticos muy distintos (redes sociales, informes oficiales, transcripciones) es incierto.
- Riesgo de alucinacion mitigado pero no eliminado: aunque los campos actor, recipient, date y location deben ser subcadenas literales del documento, el modelo podria devolver spans incorrectos o incompletos, o fallar en la deteccion de instancias poco explicitas.
- Formato de prompt estricto: el modelo espera un prompt y un formato de salida concretos; la model card advierte explicitamente de que difieren de los de `exp5.1`, por lo que las integraciones existentes deben actualizarse.
- Sensibilidad a la definicion del evento: el autor senala que la definicion no debe ser una simple etiqueta, ya que se trata de una tarea mal definida; una definicion ambigua degradara la calidad de la extraccion.
- Atributos condicionados por tipo de evento: `killed` e `injured` solo se activan para ASSAULT, PROTEST y COERCE, y `reporter` esta desactivado por defecto, de modo que una configuracion incorrecta del mensaje de sistema produce salidas incompletas.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente ni comunidad de usuarios.
- Licencia permisiva: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias sobre la exactitud de las extracciones en produccion.
- Ausencia de informacion sobre sesgos: la model card no documenta analisis de sesgo, cobertura diferencial por region o pais, ni sesgos derivados de la linea editorial de las fuentes de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahalt/qwen3.5-event-extraction-0.8b
- Repositorio GGUF Q8_0 para llama.cpp: https://huggingface.co/ahalt/qwen3.5-event-extraction-0.8b-GGUF
- Modelo predecesor: https://huggingface.co/ahalt/qwen3-event-extraction-exp5.1
- Repositorio del pipeline NGEC (Next Generation Event Coder): https://github.com/ahalterman/NGEC-2025
- Articulo de referencia (Halterman y Keith, 2026): https://aclanthology.org/2026.acl-long.92/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo, su autor o el pipeline NGEC; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace.
