# local-inference-lab/Qwen3.8-Flash-Next-FLARE

## Resumen

Qwen3.8-Flash-Next-FLARE es un paquete de ejecución preparado (pesos, kernels CUDA compilados y grafos de ejecución capturados) para el modelo Qwen3.8-Flash-Next, distribuido por el laboratorio local-inference-lab para la vista previa comunitaria de su runtime Flare. No es un modelo entrenado desde cero ni un fine-tune convencional: es un artefacto de despliegue en calidad alfa que empaqueta el modelo base `local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD` junto con todo lo necesario para servirlo sin Python ni compilación en tiempo de ejecución.

La relevancia técnica está en el enfoque de cuantización y de gestión de memoria. La receta de Flare combina expertos enrutados en NVFP4 con atención y proyecciones de expertos compartidos en MXFP8, sobre una arquitectura híbrida que incluye Gated DeltaNet y Qwen Sparse Attention, más un módulo de predicción multi-token (MTP) para decodificación especulativa. Además, la tabla de embeddings n-gram de 26,8 GiB se mantiene fuera de la memoria de la GPU y se recupera bajo demanda desde disco o RAM del sistema.

El resultado es un paquete pensado para una sola GPU, con hasta 16 peticiones concurrentes y hasta cinco tokens borrador MTP por ronda, con revisiones específicas para NVIDIA RTX PRO 6000 Blackwell (96 GB de VRAM, revisión `gb202`) y para DGX Spark (revisión `gb10`). El repositorio ocupa 428,2 GB en total y no es cargable por Transformers, vLLM, SGLang ni llama.cpp: el formato está atado al runtime Flare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet + Qwen Sparse Attention, con expertos enrutados (MoE) y modulo MTP de decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en expertos enrutados; MXFP8 en atencion y proyecciones de expertos compartidos; tabla de embeddings n-gram de 26,8 GiB fuera de la GPU |
| Idiomas soportados | no disponible |
| Licencia | lil-license-1.0 (etiquetada como `other`; enlace al LICENSE del modelo base) |
| Formato de pesos | safetensors (`*.safetensors`) con kernels CUDA compilados y grafos de ejecucion capturados; requiere Flare |
| Pipeline | image-text-to-text (multimodal imagen-texto) |
| Modelo base | local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD |
| Tamano del repositorio | 428,2 GB |
| Revisiones de hardware | `gb202` (RTX PRO 6000 Blackwell, 96 GB VRAM) y `gb10` (DGX Spark) |
| Concurrencia preparada | 1 GPU, hasta 16 peticiones concurrentes, hasta 5 tokens borrador MTP por ronda |
| Fecha de publicacion | Creado el 2026-10-16; actualizado el 2026-10-18 |
| Descargas / likes | 0 descargas / 8 likes |

## Arquitectura y entrenamiento

La model card describe una arquitectura hibrida que combina Gated DeltaNet con Qwen Sparse Attention y un modulo de prediccion multi-token (MTP) empleado para decodificacion especulativa. El paquete distribuye los expertos enrutados en NVFP4 y la atencion junto con las proyecciones de expertos compartidos en MXFP8, una combinacion orientada a reducir huella de memoria y ancho de banda sin renunciar a precision en las capas mas sensibles.

El artefacto no documenta datos de entrenamiento: no se indica numero de tokens, composicion del corpus ni si hubo RLHF o DPO. Lo que si se detalla es el proceso de preparacion: el ajuste de kernels y la captura de grafos se completan durante la fase de preparacion del paquete, de modo que el servicio se ejecuta sobre el runtime nativo en Rust de Flare, sin Python ni compilacion en caliente. Una innovacion destacable es la gestion de la tabla de embeddings n-gram (PLE): sus 26,8 GiB residen fuera de la VRAM y Flare recupera las filas necesarias desde disco o RAM del sistema, con una cache opcional en memoria independiente de la cache de prefijos.

## Capacidades

- Generacion de texto y procesamiento multimodal imagen-texto, segun el `pipeline_tag` del repositorio.
- Razonamiento y respuesta conversacional multi-turno (la card menciona estado de conversacion reutilizable mediante cache de prefijos).
- Decodificacion especulativa nativa via modulo MTP, con hasta cinco tokens borrador por ronda configurables al arrancar.
- Servicio concurrente: hasta 16 peticiones simultaneas sobre una sola GPU.
- Cache de prefijos en disco para reanudar peticiones que comparten contexto sin recomputar el prefijo completo.
- Gestion de la tabla de embeddings n-gram con almacenamiento en RAM, en disco o con cache intermedia configurable.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, modo thinking explicito, audio ni idiomas concretos.

## Casos de uso

- Analisis de documentos e imagenes en produccion: al declararse como `image-text-to-text`, puede emplearse para extraer informacion estructurada de capturas, formularios o diagramas, sirviendo hasta 16 peticiones concurrentes en una sola GPU.
- Asistentes conversacionales de atencion al cliente: la cache de prefijos en disco permite reanudar conversaciones largas y reutilizar el estado de prompts repetidos sin recomputar el prefijo, lo que reduce coste por turno en dialogos multi-turno.
- Despliegue en estaciones de trabajo con una unica GPU Blackwell: la revision `gb202` esta pensada para una RTX PRO 6000 Blackwell de 96 GB, lo que habilita inferencia local de un modelo multimodal de gran tamano sin cluster.
- Inferencia en el borde con DGX Spark: la revision `gb10` y la recomendacion de usar la tabla de embeddings en disco con cache de 1 GiB permiten ejecutar el modelo en un nodo unico de baja capacidad de memoria.
- Generacion aumentada por recuperacion sobre corpus propios: la recuperacion de filas de la tabla de embeddings n-gram desde disco o RAM facilita servir el modelo en maquinas donde la VRAM es el recurso escaso.
- Servicio de baja latencia con decodificacion especulativa: ajustar `--mtp-draft-tokens` junto con `--max-concurrency` permite intercambiar latencia por throughput segun la carga, manteniendo el objetivo de 16 peticiones simultaneas.
- Evaluacion comparativa de cuantizaciones NVFP4/MXFP8: util para equipos que quieran medir el impacto de la receta de cuantizacion de Flare frente al modelo base en tareas imagen-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: la revision `gb202` esta preparada para una NVIDIA RTX PRO 6000 Blackwell con 96 GB de VRAM. No se especifica la VRAM minima ni el consumo exacto del paquete en GPU.
- Memoria del sistema: la tabla de embeddings n-gram ocupa 26,8 GiB si se mantiene en RAM (`--embedding-table-storage ram`). En DGX Spark se recomienda `--embedding-table-storage disk` con `--embedding-table-cache-size 1GiB`.
- Almacenamiento: el repositorio completo ocupa 428,2 GB; conviene descargar solo la revision necesaria con `hf download --revision gb202 --include '*.safetensors'`. La cache de prefijos en disco puede consumir hasta el limite configurado (ejemplo de la card: 100 GiB).
- GPU objetivo: NVIDIA RTX PRO 6000 Blackwell (96 GB) para `gb202`; DGX Spark para `gb10`. No se documenta soporte para A100, H100 ni GPUs de consumo.
- Despliegue: exclusivamente mediante Flare, distribuido como imagen Docker `ghcr.io/local-inference-lab/flare:latest` o instalado en el host. No es compatible con Transformers, vLLM, SGLang ni llama.cpp.
- Concurrencia y latencia: preparado para 1 GPU, hasta 16 peticiones concurrentes y hasta 5 tokens borrador MTP por ronda. No se publican cifras de latencia ni throughput.
- Parametros de muestreo por defecto: temperatura 1.0, top-p 0.95, top-k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Observaciones |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FLARE (este repositorio) | no disponible | no disponible | safetensors + kernels CUDA + grafos; solo Flare | lil-license-1.0 | Paquete alfa para 1 GPU, 16 peticiones concurrentes, MTP de hasta 5 tokens |
| Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD (modelo base) | no disponible | no disponible | no disponible | lil-license-1.0 (misma licencia enlazada) | Checkpoint del que deriva este paquete; la card no detalla su formato de carga |
| Otros modelos de la misma categoria | no disponible | no disponible | no disponible | no disponible | No hay informacion en la documentacion proporcionada para establecer comparaciones con alternativas |

## Limitaciones y advertencias

- Calidad alfa: la propia model card califica el paquete como `alpha-quality`, pensado exclusivamente para una vista previa comunitaria de Flare.
- Portabilidad nula: los archivos incluyen kernels compilados y grafos capturados y no pueden cargarse con Transformers, vLLM, SGLang ni llama.cpp. Migrar a otro runtime exige partir del modelo base.
- Dependencia total del runtime Flare y de su imagen Docker; no se documenta una API compatible con OpenAI ni otros servidores.
- Licencia `lil-license-1.0` con `license_name: other`: no se detallan en la informacion disponible los terminos de uso comercial. Es imprescindible revisar el archivo LICENSE del modelo base antes de usarlo en produccion.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue ni un rendimiento concreto en castellano.
- Longitud de contexto y numero de parametros no publicados: no es posible dimensionar cargas de contexto largo ni estimar coste por token a partir de la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad ni tasas de error.
- El rendimiento con `--embedding-table-storage disk` depende de la latencia del disco; en despliegues con almacenamiento lento puede degradar el throughput.
- Solo se contempla una GPU por instancia; no hay soporte documentado de tensor parallelism real (el artefacto se nombra `tp1`).
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-FLARE
- Modelo base: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD
- Licencia (referenciada en el modelo base): https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD/blob/main/LICENSE
- Imagen del runtime Flare: ghcr.io/local-inference-lab/flare:latest
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
