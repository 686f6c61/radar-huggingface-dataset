# aitamedia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-EXL3-3.5bpw

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B es un modelo vision-lenguaje desarrollado por NVIDIA, publicado en su version de referencia en BF16 y distribuido aqui por el usuario aitamedia en una cuantizacion EXL3 de 3,5 bits por peso. El modelo resuelve tareas de razonamiento multimodal: comprension de documentos, video, codigo y uso de herramientas, con una ventana de contexto de hasta 1 millon de tokens. Su arquitectura combina capas Mamba-2 intercaladas con capas de atencion y un Mixture-of-Experts (MoE), junto con un codificador visual C-RADIO y un conector vision-lenguaje.

La relevancia de esta ficha concreta radica en que el repositorio original pesa 120B parametros en BF16 (unos 240 GB), mientras que esta version EXL3 de 3,5 bpw ocupa 57,8 GB, lo que reduce drasticamente los requisitos de VRAM y permite desplegarlo en configuraciones mas modestas manteniendo el mismo pipeline image-text-to-text. Los pesos safetensors declaran 28.846.056.960 parametros, coherente con un MoE donde solo una fraccion (12B activos) se computa por token.

El modelo soporta seis idiomas (ingles, espanol, frances, aleman, italiano y japones), dispone de modo de razonamiento configurable mediante la plantilla de chat y usa Multi-Token Prediction (MTP) para decodificacion especulativa nativa. La licencia es OpenMDW-1.1, que permite uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + Transformer con Mixture-of-Experts y codificador visual C-RADIO |
| Parametros totales | 120B (28.846.056.960 en los safetensors de esta cuantizacion) |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | EXL3 3,5 bits por peso (esta version); BF16 y NVFP4 en los repositorios oficiales de NVIDIA |
| Idiomas soportados | Ingles, espanol, frances, aleman, italiano, japones |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (libreria transformers, arquitectura nemotron_h) |

## Arquitectura y entrenamiento

El modelo es un MoE hibrido que intercala capas Mamba-2 (modelo de espacio de estados) con capas de atencion Transformer, lo que reduce el coste computacional en secuencias largas frente a un Transformer denso. El codificador visual es C-RADIO, conectado al tronco de lenguaje mediante un conector vision-lenguaje, lo que habilita entrada de imagenes y video y salida de texto. La configuracion MoE mantiene 120B parametros totales con solo 12B activos por token, y el modelo incorpora cabezas de Multi-Token Prediction (MTP) que permiten decodificacion especulativa nativa.

Los datos de entrenamiento provienen de los conjuntos publicados por NVIDIA: `nvidia/nemotron-pre-training-datasets` para preentrenamiento y `nvidia/nemotron-post-training-v3` para postentrenamiento, aunque la informacion disponible no detalla el numero exacto de tokens ni la composicion porcentual del dataset. Tampoco se especifican en la informacion proporcionada los detalles de RLHF o DPO aplicados en la fase de postentrenamiento. La innovacion tecnica destacable es la combinacion de Mamba-2 con atencion y MTP, que busca eficiencia en contexto largo y aceleracion de la generacion.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento configurable (`enable_thinking=True/False`), con un nivel intermedio "on (medium)" que reduce tokens generados a costa de posible perdida de precision.
- Comprension de imagenes y video como entrada (pipeline image-text-to-text), incluyendo entendimiento de documentos.
- Generacion y razonamiento sobre codigo, con soporte de tool calling mediante parser compatible con `qwen3_coder` en vLLM.
- Uso de herramientas y function calling en despliegues con vLLM (`--enable-auto-tool-choice`).
- Razonamiento multi-paso orientado a agentes, con parser de razonamiento `nemotron_v3`.
- Capacidades multilingues en ingles, espanol, frances, aleman, italiano y japones.
- Decodificacion especulativa nativa mediante Multi-Token Prediction (MTP), configurable con `num_speculative_tokens`.
- Procesamiento de video con control de FPS, numero de frames y tasa de poda (`--video-pruning-rate`).

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar contratos, informes o expedientes de hasta 1M tokens en una sola pasada, lo que permite resumir y extraer clausulas sin fragmentar el documento y perder contexto entre secciones.
- Atencion al cliente multimodal: gestiona conversaciones multi-turno con imagenes adjuntas (capturas de pantalla, fotos de producto) gracias al codificador C-RADIO y a la ventana de contexto larga, manteniendo el hilo de la conversacion.
- Generacion de codigo en produccion: con soporte de tool calling y parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests o resolucion de incidencias con acceso a herramientas externas.
- Comprension de video para monitorizacion: con configuracion de FPS y numero de frames (por ejemplo, 2 fps y 256 frames), puede describir eventos en grabaciones de vigilancia, resumenes de reuniones o analisis de material audiovisual.
- Agentes autonomos multi-paso: el modo de razonamiento configurable y el parser `nemotron_v3` permiten construir agentes que planifican, invocan herramientas y verifican resultados, ajustando el presupuesto de razonamiento segun la latencia requerida.
- Extraccion de informacion de facturas y formularios: combinando vision y contexto largo, puede procesar lotes de documentos escaneados y devolver datos estructurados en los seis idiomas soportados.
- Asistencia tecnica multilingue: atiende consultas en espanol, frances, aleman, italiano o japones sin cambiar de modelo, util para equipos de soporte con cobertura internacional.

## Benchmarks y rendimiento

La model card original incluye una seccion de benchmarks, pero el contenido proporcionado se interrumpe en el encabezado de la tabla y no incluye los valores numericos. Por tanto, no se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: esta cuantizacion EXL3 de 3,5 bpw ocupa 57,8 GB en disco; en inferencia se necesita VRAM adicional para cache KV, activaciones y overhead, por lo que se recomienda un minimo de 64-80 GB de VRAM total.
- GPU recomendadas: el modelo original en BF16 se despliega en 4x H100 o 2x GB200 segun la model card; esta version cuantizada reduce el requisito y puede caber en 1x H100 80 GB o 1x A100 80 GB, aunque no se especifica en la informacion disponible una configuracion validada para esta cuantizacion concreta.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) en una sola unidad; requeriria configuraciones multi-GPU o descarga parcial a CPU, no documentadas para esta version.
- Opciones de despliegue: la model card documenta vLLM (`vllm/vllm-openai:v0.32.0` o nightly) con `--tensor-parallel-size 4`, `--trust-remote-code`, MTP y parsers de herramientas; tambien menciona SGLang. No se confirma soporte de llama.cpp, Ollama o TGI para el formato EXL3 en la informacion disponible.
- Latencia y throughput: no disponibles para esta cuantizacion; la model card no publica cifras de rendimiento para la version EXL3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron-3.5-Super-VL-120B-A12B EXL3 3,5 bpw (esta ficha) | 120B totales / 12B activos | 1M tokens | OpenMDW-1.1 | Hugging Face, 57,8 GB |
| Nemotron-3.5-Super-VL-120B-A12B BF16 (original NVIDIA) | 120B totales / 12B activos | 1M tokens | OpenMDW-1.1 | Hugging Face, pesos BF16 |
| Nemotron-3.5-Super-VL-120B-A12B NVFP4 (NVIDIA) | 120B totales / 12B activos | 1M tokens | OpenMDW-1.1 | Hugging Face, optimizado para DGX Spark y GPUs de centro de datos |

No se dispone en la informacion proporcionada de modelos alternativos de otros fabricantes con los que comparar parametros, contexto y rendimiento; por tanto, la comparativa se limita a las variantes oficiales del mismo modelo.

## Limitaciones y advertencias

- La cuantizacion EXL3 de 3,5 bpw puede degradar la precision respecto al BF16 original, especialmente en tareas de razonamiento complejo y vision; no se publican metricas de degradacion para esta version.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de extraccion de documentos o video donde el modelo puede inferir contenido no presente.
- El modo de razonamiento "on (medium)" reduce tokens generados pero puede afectar la precision; conviene validar la configuracion por caso de uso.
- Aunque soporta seis idiomas, no se detalla el rendimiento relativo por idioma; el espanol podria tener menor calidad que el ingles si el dataset esta desbalanceado.
- La licencia OpenMDW-1.1 permite uso comercial, pero es una licencia "other" que debe revisarse en el enlace oficial antes de un despliegue en produccion.
- Esta cuantizacion no dispone de configuracion de despliegue validada en la model card; los ejemplos de vLLM estan pensados para BF16 en 4x H100.
- El repositorio tiene solo 22 descargas y 0 likes, lo que indica poca validacion comunitaria de esta cuantizacion concreta.
- El uso de `--trust-remote-code` en vLLM implica ejecutar codigo del repositorio; conviene auditar el contenido antes de desplegarlo.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/aitamedia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-EXL3-3.5bpw
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Version NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Informe tecnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Super-and-Lightning-Technical-Report.pdf
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
