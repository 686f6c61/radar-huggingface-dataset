# infosave/Granite-4.2-cmf

## Resumen

El repositorio `infosave/Granite-4.2-cmf` contiene los tres modelos densos de razonamiento de la familia IBM Granite 4.2 (3B, 8B y 30B) convertidos al formato CMF (Cortiq Model Format) con cuantización mixta Q4TP y Q8_2F. El formato CMF empaqueta pesos, tokenizador, plantilla de chat exacta y hashes de integridad en un único archivo mapeado en memoria, lo que permite ejecutar inferencia sin Python, PyTorch, CUDA ni compilaciones específicas por GPU. El runtime Cortiq soporta CPU, Vulkan (NVIDIA, AMD, Intel), DX12 y Metal, lo que convierte a este repositorio en una opción práctica para desplegar modelos de razonamiento Granite 4.2 en entornos heterogéneos o con recursos limitados.

Los modelos base son los Granite 4.2 de IBM, arquitectura transformer decoder-only densa con atención GQA, SwiGLU, RMSNorm y RoPE, post-entrenados sobre los Granite 4.1. Incorporan un modo de razonamiento nativo (thinking) con plantilla Jinja integrada, tool calling aumentado con razonamiento y un contexto nativo de 131 072 tokens. La cuantización Q4TP es un perfil mixto que protege los bordes del vocabulario (100 352 tokens) con precisión de 8 bits, mientras que Q8_2F mantiene todo el modelo en 8 bits con doble campo de escala. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GraniteForCausalLM) con GQA, SwiGLU, RMSNorm, RoPE, attention scale 1/head_dim, embeddings no atados |
| Parametros totales | 3B, 8B y 30B (tres modelos independientes en el mismo repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens (128K) nativo; extension a 512K documentada por IBM pero no implementada en estos archivos CMF |
| Tipos de cuantizacion | Q4TP (cuerpo en 4 bits, bordes de vocabulario en q8_2f, normas en f16) y Q8_2F (todo en 8 bits con doble escala) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (Cortiq Model Format), un unico archivo mapeado en memoria por variante |

## Arquitectura y entrenamiento

Los modelos base son los Granite 4.2 de IBM, una familia de modelos densos decoder-only post-entrenados sobre los Granite 4.1. IBM documenta que incorporan chain-of-thought integrado, modos de pensamiento flexibles (thinking, non-thinking, low-effort reasoning) y tool calling aumentado con razonamiento. Los detalles del pre-entrenamiento (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO) no estan disponibles en la informacion proporcionada en este repositorio.

La conversion a CMF preserva de forma exacta las particularidades de Granite 4.2: el `attention_multiplier` usa `1 / head_dim` en lugar del habitual `1 / sqrt(head_dim)`, y se validan y mapean `embedding_multiplier`, `residual_multiplier` y `logits_scaling`. La plantilla Jinja original se incrusta completa, incluyendo los modos de razonamiento, herramientas y manejo de historial multi-turno. La cuantizacion Q4TP es un perfil mixto deliberado: todas las proyecciones transformer usan q4tp, mientras que el embedding de entrada y la cabeza de salida (no atada) usan q8_2f, protegiendo asi las filas de tokens raros y los outliers de canales de entrada. Q8_2F, por su parte, mantiene todas las proyecciones y ambos bordes de vocabulario en un layout de 8 bits con dos campos de escala, lo que protege adicionalmente los canales de entrada.

## Capacidades

- Generacion de texto con razonamiento integrado: el modelo abre de forma nativa un bloque ` thinking... response` cuando se usa la plantilla incrustada; con `--no-think` se obtiene respuesta directa.
- Tool calling / function calling aumentado con razonamiento, soportado por la plantilla Jinja completa.
- Razonamiento multi-step y modos de esfuerzo variable (low-effort reasoning).
- Multilingue en 12 idiomas: ingles, aleman, español, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Soporte de conversaciones multi-turno con historial.
- Contexto largo de 131 072 tokens para documentos extensos.
- Sin capacidades de vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens) y razonamiento explicito, lo que permite mantener el historial completo de una interaccion y justificar respuestas complejas.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar codigo, ejecutandose en CPU o GPU sin dependencias de Python.
- Razonamiento matematico y logico: el modo thinking permite descomponer problemas en pasos intermedios, util para tutoria, analisis financiero o verificacion de argumentos.
- Procesamiento de documentos legales o tecnicos extensos: la ventana de 128K tokens permite analizar contratos, informes o codigo fuente completo en una sola pasada.
- Despliegue en entornos sin GPU: los archivos CMF se ejecutan en CPU pura (por ejemplo, 11.9 tok/s para el 3B Q4TP en un Xeon de 96 hilos), lo que permite inferencia en servidores economicos o maquinas virtuales sin acelerador.
- Aplicaciones multiplataforma: el mismo archivo CMF funciona en Windows (DX12), macOS (Metal) y Linux (Vulkan), lo que simplifica la distribucion de asistentes locales de escritorio o movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye mediciones de rendimiento de inferencia, que se resumen a continuacion.

| Modelo | Perfil | Tamano archivo | Decode estable (A40 Vulkan) | Prefill (A40) | Primer token |
|---|---|---|---|---|---|
| Granite 4.2 3B | q4tp | 2.17 GB | 89.5 tok/s | 80.3 tok/s | 0.58 s |
| Granite 4.2 3B | q8_2f | 3.68 GB | 60.6 tok/s | 47.5 tok/s | 0.93 s |
| Granite 4.2 8B | q4tp | 4.98 GB | pendiente de medicion | no disponible | no disponible |
| Granite 4.2 8B | q8_2f | 8.81 GB | pendiente de medicion | no disponible | no disponible |
| Granite 4.2 30B | q4tp | pendiente de conversion | no disponible | no disponible | no disponible |
| Granite 4.2 30B | q8_2f | pendiente de conversion | no disponible | no disponible | no disponible |

En CPU (Xeon 6342, 96 hilos), el 3B Q4TP mide 11.9 tok/s en decode estable. Las mediciones son de un solo stream con `cortiq bench --tokens 100 --core --ignore-eos` y excluyen carga del modelo y prefill.

## Requisitos de hardware

- VRAM estimada: el 3B Q4TP ocupa 2.17 GB, el 3B Q8_2F 3.68 GB, el 8B Q4TP 4.98 GB y el 8B Q8_2F 8.81 GB. El 30B esta pendiente de conversion.
- GPU recomendadas: los archivos se ejecutan via Vulkan en NVIDIA, AMD e Intel; las mediciones se realizaron en una NVIDIA A40. Tambien soportan DX12 (Windows) y Metal (Apple Silicon).
- Cabe en GPU de consumo: el 3B Q4TP cabe en cualquier GPU moderna con 4 GB o mas; el 8B Q4TP cabe en una RTX 3060 de 12 GB o similar. El 30B requerira una GPU de 24 GB o mas en Q4TP.
- Opciones de despliegue: runtime Cortiq (`cortiq run`), sin Python, PyTorch ni CUDA. Se puede forzar CPU con `CMF_GPU=0` y limitar VRAM con `CMF_GPU_VRAM_MB`.
- Latencia y throughput: en A40, el 3B Q4TP alcanza 89.5 tok/s en decode estable y 80.3 tok/s en prefill; en CPU Xeon de 96 hilos, 11.9 tok/s. Los modelos de 8B y 30B aun no tienen mediciones publicadas.
- Los pesos se mantienen mapeados en memoria del sistema, por lo que un archivo mayor que la VRAM disponible sigue ejecutandose (con menor rendimiento) en lugar de fallar al cargar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| infosave/Granite-4.2-cmf (3B/8B/30B) | 3B, 8B, 30B | 128K nativo | CMF cuantizado (Q4TP/Q8_2F) | Apache 2.0 | Ejecucion sin Python/CUDA, multiplataforma |
| ibm-granite/granite-4.2-3b/8b/30b (originales) | 3B, 8B, 30B | 128K nativo (512K documentado) | bf16 (safetensors) | Apache 2.0 | Requiere PyTorch y GPU con suficiente VRAM |
| Modelos de razonamiento de tamano similar (Qwen3, Llama 3.3, etc.) | variable | variable | variable | variable | No hay datos comparativos en la informacion disponible |

La comparativa directa con otros modelos de razonamiento (Qwen3, Llama 3.3, DeepSeek-R1, etc.) no esta disponible por falta de datos de benchmarks en la informacion proporcionada. La ventaja principal de este repositorio frente a los originales de IBM es la portabilidad del formato CMF y la reduccion de requisitos de hardware, manteniendo la misma arquitectura y plantilla de chat.

## Limitaciones y advertencias

- La extension de contexto a 512K tokens documentada por IBM no esta implementada en estos archivos CMF; el contexto maximo real es de 131 072 tokens.
- Los archivos de 30B estan pendientes de conversion y no se pueden descargar aun.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, por lo que no es posible verificar el impacto de la cuantizacion en tareas estandar.
- El rendimiento en Metal (Apple Silicon) y DX12 (Windows) aun no ha sido medido; solo hay datos de Vulkan en A40 y CPU.
- El soporte para Granite 4.2 en Cortiq es mas reciente que la version empaquetada 0.6.3; es necesario compilar el runtime desde el repositorio de GitHub hasta la proxima publicacion.
- Los modelos base Granite 4.2 pueden heredar sesgos de los datos de entrenamiento de IBM; no se detallan en este repositorio.
- La cuantizacion Q4TP es un perfil mixto, no una cuantizacion uniforme de 4 bits; los usuarios que necesiten maxima fidelidad deberian usar la variante Q8_2F.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/infosave/Granite-4.2-cmf
- Coleccion oficial IBM Granite 4.2: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Documentacion de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Repositorio del formato CMF en HuggingFace: https://huggingface.co/infosave/cmf
- Repositorio GitHub de Cortiq/CMF: https://github.com/infosave2007/cmf
