# nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-FP8

## Resumen

NVIDIA Nemotron-3-Super-120B-A12B-FP8 es un modelo de lenguaje de gran tamano desarrollado por NVIDIA, disenado para ofrecer capacidades agenticas, de razonamiento y conversacionales de alto nivel. Forma parte de la familia Nemotron 3 y esta optimizado para cargas de trabajo de alto volumen, como la automatizacion de tickets de TI, sistemas de agentes colaborativos y aplicaciones de RAG. Es el primer modelo de la serie Nemotron 3 que emplea arquitectura Latent MoE, incluye capas de Multi-Token Prediction (MTP) y fue preentrenado con cuantizacion NVFP4.

El modelo presenta una arquitectura hibrida que combina capas Mamba-2, MoE y Attention, con 120 mil millones de parametros totales de los cuales solo 12 mil millones estan activos por token procesado. Soporta una longitud de contexto de hasta 1 millon de tokens y cubre siete idiomas: ingles, frances, aleman, italiano, japones, espanol y chino. Se distribuye bajo la licencia NVIDIA Nemotron Open Model License, que permite uso comercial, y esta disponible en formato FP8 con pesos en safetensors.

La relevancia de este modelo radica en su eficiencia computacional: al ser un MoE con solo 12B parametros activos, ofrece un rendimiento comparable a modelos densos mucho mayores con un coste de inferencia significativamente menor. Su ventana de contexto de 1M tokens y su modo de razonamiento configurable lo convierten en una opcion atractiva para tareas de razonamiento largo, agentes autonomos y procesamiento de documentos extensos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE hibrida: Mamba-2 + MoE + Attention, con Multi-Token Prediction (MTP) |
| Parametros totales | 123.611.012.096 (120B) |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (esta version), NVFP4 (version alternativa), BF16 (version alternativa) |
| Idiomas soportados | Ingles, frances, aleman, italiano, japones, espanol, chino |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Nemotron-3-Super-120B-A12B-FP8 es un hibrido Latent Mixture-of-Experts (LatentMoE) que intercala capas Mamba-2 (modelos de espacio de estado) con capas MoE y capas de atencion selectivas. Este diseno busca combinar la eficiencia de los SSM para secuencias largas con la capacidad de modelado de los transformers. A diferencia del modelo Nano de la misma familia, esta version Super incorpora capas MTP (Multi-Token Prediction) que permiten predecir varios tokens por paso, acelerando la generacion de texto y mejorando la calidad de las respuestas.

El modelo fue entrenado durante aproximadamente 25 billones de tokens. El corpus de preentrenamiento tiene una fecha de corte de junio de 2025, mientras que los datos de postentrenamiento llegan hasta febrero de 2026. El postentrenamiento se realizo con datos curados de alta calidad y datos generados sinteticamente, incluyendo una porcion de datos de pregunta-respuesta y alineacion para mejorar la precision. El entrenamiento se realizo con cuantizacion NVFP4 para maximizar la eficiencia computacional. El modelo incluye un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`) y un cabezal MTP integrado para decodificacion especulativa, con una version actualizada MTPv2 disponible como checkpoint separado.

## Capacidades

- Generacion de texto y chat conversacional en siete idiomas: ingles, frances, aleman, italiano, japones, espanol y chino.
- Razonamiento configurable: puede activarse o desactivarse un modo de razonamiento explicito mediante la plantilla de chat, permitiendo elegir entre respuestas rapidas o razonamiento profundo.
- Razonamiento multi-paso y soporte para flujos agenticos complejos, incluyendo planificacion y ejecucion de tareas.
- Tool calling y function calling: el modelo puede invocar herramientas externas y APIs, lo que lo hace adecuado para integraciones con sistemas de automatizacion.
- Capacidad de manejar contextos extremadamente largos (hasta 1M tokens), ideal para RAG sobre documentos extensos, analisis de codebases completos o conversaciones multi-turno prolongadas.
- Decodificacion especulativa mediante el cabezal MTP integrado, que acelera la generacion de texto sin perder calidad.
- Optimizado para cargas de trabajo de alto volumen, como automatizacion de tickets de TI y sistemas de atencion al cliente a escala.

## Casos de uso

- Automatizacion de tickets de TI: el modelo puede clasificar, priorizar y resolver tickets de soporte tecnico de forma autonoma, aprovechando su ventana de 1M tokens para procesar historiales completos de incidencias y su capacidad de tool calling para interactuar con sistemas de ticketing (ServiceNow, Jira, etc.).
- Sistemas de agentes autonomos: gracias a su modo de razonamiento configurable y su soporte para multi-step reasoning, puede planificar y ejecutar tareas complejas de forma autonoma, como investigacion web, extraccion de datos y generacion de informes.
- RAG sobre documentacion extensa: su contexto de 1M tokens permite indexar y consultar manuales tecnicos, documentacion legal o bases de conocimiento completas sin necesidad de fragmentar los documentos en chunks pequenos.
- Atencion al cliente multilingue: con soporte para siete idiomas, puede gestionar conversaciones de soporte en multiples lenguas, manteniendo el contexto de interacciones largas y derivando a agentes humanos cuando sea necesario.
- Generacion y revision de codigo en produccion: su capacidad de razonamiento y su entrenamiento en datos de codigo lo hacen util para tareas de generacion, explicacion y depuracion de codigo, integrándose en pipelines de CI/CD como asistente de revision.
- Analisis de documentos legales y financieros: la combinacion de contexto largo y razonamiento permite resumir contratos extensos, extraer clausulas relevantes y detectar inconsistencias en documentos de cientos de paginas.
- Traduccion y localizacion: su soporte multilingue permite traducciones de alta calidad entre los siete idiomas soportados, con capacidad de mantener coherencia terminologica en documentos tecnicos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con metricas como MMLU, HumanEval o GSM8K. Se recomienda consultar el technical report de NVIDIA para obtener datos de evaluacion detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP8 ocupa aproximadamente 128 GB en disco. Para inferencia se requieren al menos 2x H100-80GB, segun indica la model card.
- GPU recomendadas: NVIDIA H100-80GB (minimo 2 unidades), H200, o GPUs de centro de datos con al menos 80 GB de VRAM por unidad.
- No cabe en GPUs de consumo: las RTX 4090 (24 GB) o RTX 5090 (32 GB) no tienen suficiente VRAM para este modelo, ni siquiera con cuantizacion agresiva.
- Opciones de despliegue: compatible con transformers, vLLM, TGI y NIM (NVIDIA Inference Microservices). Tambien disponible en plataformas cloud como SageMaker y Azure.
- Latencia y throughput: no se han publicado cifras oficiales. La decodificacion especulativa con MTP deberia mejorar el throughput respecto a modelos sin esta caracteristica, pero no hay datos concretos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Nemotron-3-Super-120B-A12B-FP8 | 120B | 12B | 1M | LatentMoE hibrida (Mamba-2 + MoE + Attention) | NVIDIA Nemotron Open |
| Nemotron-3-Nano-9B | 9B | 9B | no disponible | LatentMoE hibrida | NVIDIA Nemotron Open |
| Nemotron-3-Super-120B-A12B-BF16 | 120B | 12B | 1M | LatentMoE hibrida | NVIDIA Nemotron Open |
| Nemotron-3-Super-120B-A12B-NVFP4 | 120B | 12B | 1M | LatentMoE hibrida | NVIDIA Nemotron Open |

La comparativa con modelos de otros fabricantes (como DeepSeek-V3 o Qwen2.5-MoE) no esta disponible en la informacion proporcionada. Las diferencias principales entre las versiones de Nemotron-3-Super son el formato de pesos (FP8, BF16, NVFP4) y la presencia del cabezal MTPv2 actualizado en un checkpoint separado.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado con datos mayoritariamente en ingles y con una fecha de corte de junio de 2025, puede presentar sesgos culturales y linguisticos en los idiomas no ingleses.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o cuando se le pide informacion muy especifica fuera de su rango de conocimiento.
- Limitaciones de contexto: aunque soporta 1M tokens, el rendimiento en contextos extremadamente largos puede degradarse y el coste computacional aumenta significativamente.
- Restricciones de licencia: la NVIDIA Nemotron Open Model License permite uso comercial, pero es necesario revisar los terminos especificos, especialmente en lo relativo a la redistribucion y al uso de los datasets asociados.
- Requisitos de hardware: el modelo requiere infraestructura de centro de datos (minimo 2x H100-80GB), lo que limita su uso a organizaciones con presupuesto para GPUs de alta gama.
- Idiomas: el soporte multilingue se limita a siete idiomas; el rendimiento en otros idiomas no esta garantizado.
- Fecha de corte de datos: el conocimiento del modelo llega hasta junio de 2025 (preentrenamiento) y febrero de 2026 (postentrenamiento), por lo que no tiene informacion de eventos posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-FP8
- Technical report: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf
- Pagina del proyecto Nemotron 3 Super: https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
- Pagina de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b
- Documentacion de la API NIM: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-super-120b-a12b
- Checkpoint MTPv2: https://huggingface.co/nvidia/Nemotron-3-Super-120B-A12B-BF16-MTPv2
- Version NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4
- Datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Datasets de postentrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
