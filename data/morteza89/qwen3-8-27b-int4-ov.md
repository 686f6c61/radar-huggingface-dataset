# Morteza89/qwen3.8-27b-int4-ov

## Resumen

El modelo `Morteza89/qwen3.8-27b-int4-ov` es una conversión no oficial del modelo vision-lenguaje Qwen3.8-27B de Qwen al formato OpenVINO IR con compresión de pesos INT4 asimétrica. El modelo original es un transformador denso de 27 000 millones de parámetros con un codificador visual, diseñado para tareas de imagen-texto y vídeo-texto, con control flexible del razonamiento y una ventana de contexto nativa de 262 000 tokens. Esta conversión, realizada con Optimum Intel y NNCF, reduce el almacenamiento a 15,7 GB y permite la inferencia local en hardware Intel (CPU, GPU, NPU) mediante OpenVINO GenAI u Optimum Intel.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un VLM de 27B en equipos de consumo con aceleración OpenVINO, sin necesidad de GPUs de gran memoria. Al ser una conversión no oficial, conviene validar su comportamiento frente al modelo original, especialmente por los efectos de la cuantización INT4. El repositorio incluye ejemplos de uso y un script de benchmark para comparar dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con codificador visual (vision-language model) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (nativa del modelo original) |
| Tipos de cuantizacion | INT4 asimetrico, grupo de 128, ratio 1.0 (via NNCF) |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (ficheros .bin/.xml), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformador denso de 27 000 millones de parámetros con un codificador visual integrado, lo que lo convierte en un modelo nativo de visión-lenguaje capaz de procesar imágenes y vídeo ademas de texto. Segun la informacion disponible, soporta control flexible del razonamiento (modo pensamiento configurable) y tareas multi-paso complejas. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO en la informacion proporcionada.

La conversion a OpenVINO IR se realizo con la version de desarrollo de Optimum Intel, utilizando NNCF para la compresion INT4 asimetrica con grupo de 128 y ratio 1.0. El proceso de exportacion se documenta en el comando `optimum-cli export openvino` incluido en la model card. La cuantizacion reduce el tamaño del modelo de aproximadamente 54 GB en BF16 a 15,7 GB, pero puede alterar el comportamiento numerico y la calidad de las salidas, por lo que se recomienda validar el modelo convertido para cada aplicacion.

## Capacidades

- Generacion de texto e imagen a texto: el modelo acepta entradas de imagen y texto, y genera descripciones, respuestas o analisis en lenguaje natural.
- Comprension de video: segun la model card, el modelo original soporta video, aunque la conversion no detalla limitaciones especificas en este aspecto.
- Control flexible del razonamiento: permite configurar el modo de pensamiento (thinking mode) para tareas que requieren razonamiento multi-paso.
- Tareas multi-paso y agente: el modelo original esta disenado para tareas agente de largo horizonte, segun la descripcion de LM Studio.
- Multilingue: no se especifican idiomas soportados en la informacion disponible.
- Tool calling / function calling: no se menciona explicitamente en la informacion proporcionada.
- Integracion con OpenVINO GenAI: el repositorio incluye ejemplos de uso con `VLMPipeline` y con Optimum Intel, ademas de un script de benchmark para CPU, GPU y NPU.

## Casos de uso

- Descripcion y analisis de imagenes en local: el modelo puede generar descripciones detalladas de fotografias o diagramas en entornos sin conexion, gracias a su ejecucion via OpenVINO en CPU o GPU integrada. Es adecuado para aplicaciones de accesibilidad o archivado de imagenes.
- Asistente de soporte tecnico con capturas de pantalla: un agente conversacional que recibe capturas de pantalla de errores o interfaces y ofrece pasos de solucion, aprovechando la ventana de contexto de 262K tokens para mantener historiales largos.
- Analisis de video para vigilancia o revision de contenido: el modelo puede procesar secuencias de video y generar resumenes o detectar eventos relevantes, aunque la conversion INT4 puede afectar la precision en tareas de video complejas.
- Generacion de documentacion tecnica a partir de diagramas: dado un esquema o diagrama de arquitectura, el modelo puede redactar una explicacion textual, util para equipos de desarrollo.
- Agente de automatizacion de tareas con razonamiento multi-paso: con el modo de pensamiento configurable, el modelo puede planificar y ejecutar secuencias de acciones (por ejemplo, navegacion web o uso de APIs) en entornos controlados.
- Benchmarking de hardware Intel: el script incluido permite medir latencia y throughput en CPU, GPU y NPU, util para decidir el despliegue en equipos especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un script de benchmark (`benchmark_qwen38_vlm_xpu.py`) que genera informes de rendimiento (tiempo de carga, TTFT, latencia entre tokens, throughput, etc.) para los dispositivos seleccionados, pero no se proporcionan valores de referencia. Se recomienda ejecutar el script en el hardware objetivo para obtener metricas propias.

## Requisitos de hardware

- Tamaño del repositorio: 15,7 GB, lo que sugiere que la inferencia INT4 puede caber en GPUs con 16 GB de VRAM o menos, aunque no se especifica un requisito minimo oficial.
- Dispositivos soportados: CPU, GPU y NPU de Intel, segun la model card. Tambien se menciona compatibilidad con AMD Ryzen AI Max y Radeon GPUs a traves de LM Studio (segun la busqueda web), aunque no se detalla en la model card.
- Opciones de despliegue: OpenVINO GenAI (recomendado), Optimum Intel, y posiblemente LM Studio en hardware AMD.
- Latencia y throughput: no disponibles; el script de benchmark permite medirlos en el hardware concreto.
- Nota: la conversion requiere paquetes de desarrollo/nightly (Transformers 5.2, OpenVINO nightly, etc.) para su ejecucion, lo que puede complicar el despliegue en entornos de produccion estables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27B | 262K | safetensors (BF16/FP16) | Apache 2.0 | Modelo base sin cuantizar, requiere ~54 GB en BF16 |
| OpenVINO/Qwen3.8-27B-int4-ov | 27B | 262K | OpenVINO IR INT4 | Apache 2.0 | Conversion oficial de OpenVINO, misma cuantizacion |
| Morteza89/qwen3.8-27b-int4-ov | 27B | 262K | OpenVINO IR INT4 | Apache 2.0 | Conversion no oficial, misma base y cuantizacion |

No se dispone de datos de rendimiento comparativo entre estas versiones. La diferencia principal entre la conversion oficial y la no oficial es el autor y el proceso de exportacion; ambas usan INT4 con grupo 128 y ratio 1.0. No se han encontrado otros VLM de tamano similar con formato OpenVINO en la informacion disponible.

## Limitaciones y advertencias

- Conversion no oficial: no esta respaldada por Qwen ni por el equipo de OpenVINO; puede contener errores de conversion o diferencias de comportamiento respecto al modelo original.
- Efectos de la cuantizacion INT4: la compresion puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o vision detallada. Se recomienda validar en el caso de uso concreto.
- Dependencia de paquetes en desarrollo: requiere Transformers 5.2, Optimum Intel en version de desarrollo y OpenVINO nightly, lo que puede provocar incompatibilidades o inestabilidad.
- Idiomas no especificados: no se indica que idiomas soporta el modelo; el rendimiento en lenguas distintas del ingles puede ser limitado.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inexacto, especialmente en descripciones de imagenes o video.
- Sin garantias de soporte para OpenVINO Model Server: la model card indica que no se reclama compatibilidad con OVMS a menos que se pruebe por separado.
- Sesgos: no se dispone de informacion sobre sesgos especificos del modelo convertido; se heredan los del modelo original, que no se detallan en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Morteza89/qwen3.8-27b-int4-ov
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversion oficial de OpenVINO: https://huggingface.co/OpenVINO/Qwen3.8-27B-int4-ov
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Pagina de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
