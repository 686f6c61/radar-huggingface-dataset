# deepquillapp/f-coref-onnx

## Resumen

f-coref (ONNX) es una exportación a formato ONNX del modelo de resolución de correferencia `biu-nlp/f-coref`, publicada por el usuario deepquillapp para su uso en proceso dentro de la herramienta DeepQuill. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son idénticos a los del modelo base y la model card indica explícitamente que no se ha modificado ningún peso. El repositorio contiene únicamente los grafos ONNX, el tokenizador y un fichero de configuración, con un tamaño total de 0,4 GB.

El modelo base, desarrollado por el grupo BIU NLP (Bar-Ilan University), es un sistema de correferencia basado en la arquitectura de `fastcoref`, que emplea un encoder tipo transformer (Longformer en la implementación original de f-coref) para codificar segmentos de texto y, en una segunda etapa, una cabeza de antecedentes que puntúa qué menciones son correferentes entre sí. La exportación separa estas dos fases en dos grafos ONNX: `encoder.onnx` y `antecedent.onnx`, mientras que la poda de menciones, la selección de antecedentes y el clustering se ejecutan fuera de los grafos siguiendo la lógica de `FCorefModel`.

Su relevancia es acotada pero concreta: permite ejecutar resolución de correferencia sin dependencias de PyTorch ni de la librería `fastcoref`, lo que facilita el despliegue en entornos de inferencia ligeros, pipelines de procesamiento de lenguaje natural en producción o aplicaciones que necesitan análisis de entidades y cadenas de mención con latencia baja. La licencia MIT del modelo base se mantiene en esta exportación, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder tipo Longformer en el modelo base) + cabeza de antecedentes; exportado en dos grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la configuración de segmentos está en `coref_config.json`, sin valor publicado) |
| Tipos de cuantizacion | no disponible (el tag indica `base_model:quantized:biu-nlp/f-coref`, pero no se detalla el esquema de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `antecedent.onnx`) + `tokenizer.json` + `coref_config.json` |

## Arquitectura y entrenamiento

La exportación reproduce la arquitectura del modelo base `biu-nlp/f-coref`, que sigue el diseño de `fastcoref`: un encoder transformer que procesa segmentos de texto y produce representaciones de tokens, y una etapa posterior de puntuación de antecedentes entre menciones candidatas. En esta versión ONNX, el encoder recibe `input_ids` y `attention_mask` con forma `[segments, len]` y devuelve `start_logit`, `end_logit`, `s2e`, `end_mention`, `start_coref` y `end_coref`. El segundo grafo, `antecedent.onnx`, recibe `start_coref` y `end_coref` con forma `[k, 1024]` y produce `coref_logits` de forma `[k, k]`, es decir, una matriz de puntuaciones entre las k menciones detectadas.

No se ha realizado ningún cambio en los pesos ni en el entrenamiento: la model card remite a la del modelo base para datos de entrenamiento y citación. La innovación de esta publicación es puramente de empaquetado: separar el pipeline en dos grafos ONNX y dejar fuera de ellos la poda de menciones, la selección de antecedentes y el clustering, que siguen la implementación de `FCorefModel` de `fastcoref`. El fichero `coref_config.json` contiene parámetros operativos como la longitud de segmento, la longitud máxima de span y el `top lambda`, aunque sus valores concretos no se publican en la información disponible.

## Capacidades

- Resolución de correferencia: identifica cadenas de menciones que se refieren a la misma entidad en un texto.
- Detección de menciones: localiza spans candidatos mediante las cabezas `start_logit`, `end_logit` y `end_mention`.
- Puntuación de antecedentes: calcula una matriz de compatibilidad entre menciones para agruparlas en clústeres.
- Procesamiento por segmentos: el encoder acepta lotes de segmentos con forma `[segments, len]`, adecuado para documentos largos divididos en ventanas.
- Ejecución sin PyTorch: al estar en ONNX, puede ejecutarse con `onnxruntime` en CPU o GPU sin cargar el framework de entrenamiento.
- Integración en pipelines: el tokenizador se incluye como `tokenizer.json`, compatible con tokenizadores de la familia Hugging Face.
- Capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling o agentes: no disponibles; este modelo no es generativo y está especializado exclusivamente en correferencia.

## Casos de uso

- Extracción de entidades y relaciones en documentos largos: el modelo agrupa las menciones de una misma entidad a lo largo de un texto segmentado, lo que permite construir grafos de entidades coherentes para tareas de extracción de información.
- Resumen abstractivo con consistencia de entidades: antes de resumir, se resuelven las correferencias para sustituir pronombres por nombres completos y evitar ambigüedades en el resumen generado por otro modelo.
- Análisis de contratos y documentos legales: la resolución de correferencia ayuda a identificar a qué parte contractual se refiere cada pronombre o descripción ("el arrendador", "dicha sociedad") en cláusulas extensas.
- Procesamiento de historiales clínicos: permite enlazar menciones de pacientes, fármacos o diagnósticos a lo largo de notas médicas multi-sección, mejorando la trazabilidad en sistemas de extracción de información sanitaria.
- Preprocesamiento para sistemas de pregunta-respuesta: al resolver a qué entidad se refiere cada mención, se mejora la precisión de los sistemas de QA sobre documentos largos donde las respuestas dependen de cadenas de referencia.
- Enriquecimiento de bases de conocimiento: la salida de clústeres de menciones se puede mapear a identificadores de entidades para poblar o actualizar bases de conocimiento con relaciones verificadas.
- Despliegue en entornos sin PyTorch: al ser ONNX, se puede integrar en servicios en producción con `onnxruntime`, contenedores ligeros o entornos embebidos donde instalar PyTorch no es viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,4 GB, por lo que la huella en memoria es moderada y probablemente inferior a 2 GB en FP32 para los grafos exportados, aunque no se confirma.
- GPU recomendadas: no disponibles; al ser un modelo de tamaño moderado, cabría esperar funcionamiento en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio sugiere que podría ejecutarse en GPUs con 4-8 GB de VRAM, pero es una estimación no verificada.
- Opciones de despliegue: `onnxruntime` (CPU y GPU) es la vía natural; también podría integrarse en servidores de inferencia compatibles con ONNX, aunque no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos generativos y no aplican directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| deepquillapp/f-coref-onnx | no disponible | no disponible | Correferencia | MIT | ONNX |
| biu-nlp/f-coref | no disponible | no disponible | Correferencia | MIT | PyTorch (safetensors/bin) |
| Modelos de correferencia basados en `fastcoref` | no disponible | no disponible | Correferencia | MIT (según implementación) | PyTorch |
| Modelos generativos con resolución de correferencia implícita (p. ej. LLM grandes) | variable | variable | Múltiple | variable | variable |

La comparación directa más relevante es con el modelo base `biu-nlp/f-coref`: misma arquitectura y mismos pesos, pero en formato PyTorch y con dependencia de `fastcoref`. Frente a los LLM generativos, este modelo es especializado, más pequeño y determinista para la tarea de correferencia, aunque no puede realizar otras tareas de lenguaje. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en correferencia; no genera texto, no responde preguntas ni realiza otras tareas de lenguaje.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni evaluación por idioma en esta exportación; la model card remite a la del modelo base.
- Idiomas soportados no disponibles: no se confirma si el modelo es multilingüe o solo inglés, lo que limita su uso en castellano sin validación previa.
- Riesgo de errores en cadenas de mención largas o con pronombres ambiguos, inherente a los sistemas de correferencia; no hay métricas publicadas para esta exportación.
- La licencia MIT permite uso comercial, pero se recomienda revisar la model card del modelo base para condiciones adicionales de citación.
- El tag `base_model:quantized:biu-nlp/f-coref` sugiere que la exportación podría implicar cuantización, pero no se especifica el esquema ni el impacto en precisión; conviene validar la calidad frente al modelo base antes de usarlo en producción.
- La lógica de poda de menciones, selección de antecedentes y clustering se ejecuta fuera de los grafos ONNX y depende de la implementación de `FCorefModel` de `fastcoref`; cambios en esa lógica pueden afectar a los resultados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso o validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepquillapp/f-coref-onnx
- Modelo base: https://huggingface.co/biu-nlp/f-coref
- Repositorio `fastcoref` (implementación de referencia): no disponible en la información proporcionada
- Paper del modelo base: no disponible en la información proporcionada
- Blog o demo de DeepQuill: no disponible en la información proporcionada
