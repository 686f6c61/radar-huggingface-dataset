# jamesatron1512/Qwen3.8-27B-GGUF

## Resumen

El modelo **Qwen3.8-27B-GGUF** es una cuantización en formato GGUF (Q4_K_M) del modelo base `unsloth/Qwen3.8-27B-NVFP4`, publicada por el usuario `jamesatron1512`. Se trata de un modelo de lenguaje de 27 320 millones de parámetros (27,3B) con una arquitectura híbrida que combina atención lineal y atención completa, e incorpora una capa dedicada de predicción multi-token (MTP) para decodificación especulativa. El repositorio incluye además un motor propio llamado **Dynamic Subspace Engine (DSE)** que permite ejecutar el modelo en GPUs con poca memoria VRAM mediante técnicas de sparse streaming desde VRAM compartida o disco NVMe.

La relevancia de este lanzamiento radica en su propuesta de ejecución eficiente: según las pruebas del autor, es posible alcanzar más de 400 tokens por segundo en una GPU de 12 GB (NVIDIA RTX 5070) usando el DSE, algo inusual para un modelo de 27B. El modelo está pensado para su uso con Ollama y llama.cpp, y se distribuye bajo licencia Apache 2.0. No se proporcionan datos sobre los idiomas soportados ni sobre el proceso de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas con atención lineal y atención completa cada 4 capas; hidden size 5120; intermediate size 17408; vocabulario de 248 320 tokens; capa MTP especulativa |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (máximo); 32 768 por defecto en Ollama |
| Tipos de cuantizacion | Q4_K_M (15,93 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura del modelo base (Qwen3.8-27B) es híbrida: combina capas de atención lineal con capas de atención completa, intercaladas cada cuatro capas, lo que reduce el coste computacional frente a un transformer denso convencional. El modelo incorpora una capa adicional de **Multi-Token Prediction (MTP)** que actúa como predictor especulativo de dos tokens por paso, permitiendo aceleraciones de 1,8x a 2,4x en entornos que soporten verificación especulativa. El tamaño del vocabulario es de 248 320 tokens, inusualmente grande, lo que sugiere un tokenizador multilingüe o con amplia cobertura.

El repositorio no incluye información sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). El modelo base es una versión cuantizada en NVFP4 de un modelo Qwen3.8, pero no se detallan los datos de preentrenamiento. La cuantización a GGUF Q4_K_M se realizó sobre ese modelo base, y el autor añade el motor DSE, que aplica una esparsidad del 95% en las neuronas SwiGLU activas durante la inferencia, transmitiendo solo los slices necesarios desde VRAM compartida o disco.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en tareas de lenguaje natural, aunque no se especifican dominios concretos.
- Decodificación especulativa MTP: incluye una capa dedicada que predice dos tokens por paso, acelerando la generación si el runtime lo soporta.
- Ejecución eficiente en hardware limitado: gracias al DSE, puede ejecutarse en GPUs con 12 GB de VRAM o menos, con un consumo de VRAM activa inferior a 20 MB.
- Compatibilidad con Ollama y llama.cpp: el GGUF se puede cargar directamente con `ollama run hf.co/jamesatron1512/Qwen3.8-27B-GGUF`.
- Soporte de plantilla ChatML: la model card indica que el GGUF incluye la plantilla ChatML y parámetros de decodificación especulativa.
- No se documentan capacidades de tool calling, visión, audio ni razonamiento multi-paso explícito.

## Casos de uso

- Chatbots y asistentes conversacionales: el modelo puede desplegarse con Ollama para crear asistentes de chat con contexto largo (hasta 262 144 tokens), adecuado para conversaciones multi-turno extensas.
- Generación de texto en entornos con GPU modesta: gracias al DSE, es posible ejecutar un modelo de 27B en una RTX 5070 de 12 GB sin OOM, lo que permite prototipar aplicaciones de generación de texto en hardware de consumo.
- Investigación en eficiencia de inferencia: el DSE y sus modos de streaming (shared VRAM y disco NVMe) ofrecen un caso de estudio para técnicas de sparse execution y memory mapping.
- Desarrollo de aplicaciones con contexto muy largo: la ventana de 262 144 tokens permite procesar documentos extensos, resúmenes de libros o análisis de código fuente completo.
- Pruebas de decodificación especulativa: la capa MTP integrada permite evaluar el rendimiento de la verificación especulativa en llama.cpp u Ollama.
- Despliegue en servidores sin GPU dedicada: el modo de disk streaming con mmap permite ejecutar el modelo en máquinas con solo CPU y SSD NVMe, aunque con menor rendimiento que con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente mediciones de velocidad de decodificación en una NVIDIA RTX 5070 de 12 GB, que se resumen a continuación. Estos datos son empíricos y no han sido verificados de forma independiente.

| Modo de ejecución | Estrategia de offload | VRAM asignada | Velocidad de decodificación | Estado |
|---|---|---|---|---|
| Modelo denso estándar | Carga completa en VRAM | ~17,5 GB | 0,0 tok/s | OOM (supera 12 GB) |
| Ollama / llama.cpp estándar | Offload parcial CPU/RAM | ~11,5 GB VRAM + 8 GB RAM | 14,2 tok/s | Cuello de botella PCIe/RAM |
| DSE: Shared VRAM Streaming | DMA desde memoria compartida de GPU | < 20 MB | 415,9 tok/s | Sin OOM |
| DSE: M.2 NVMe Disk Streaming | mmap directo desde SSD | < 20 MB | 409,1 tok/s | Sin asignación de RAM/VRAM |

## Requisitos de hardware

- VRAM estimada para inferencia: con el DSE, menos de 20 MB de VRAM activa; con Ollama estándar, aproximadamente 11,5 GB de VRAM más 8 GB de RAM; con carga completa, 17,5 GB de VRAM (no cabe en GPUs de 12 GB).
- GPU recomendadas: el autor probó en una NVIDIA RTX 5070 de 12 GB; para el modo denso se necesitaría una GPU con al menos 18 GB de VRAM (por ejemplo, RTX 4090, A100, H100).
- Compatibilidad con GPUs de consumo: sí, siempre que se use el DSE; con Ollama estándar, el rendimiento se degrada notablemente.
- Opciones de despliegue: `run_dse_engine.py` (modos `shared_vram` y `disk_streaming`), Ollama (`ollama run hf.co/jamesatron1512/Qwen3.8-27B-GGUF`), y llama.cpp (si el build soporta MTP).
- Latencia y throughput: según el autor, 415,9 tok/s con shared VRAM y 409,1 tok/s con disk streaming en RTX 5070; con Ollama estándar, 14,2 tok/s. Estos valores dependen del hardware y del runtime.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría (por ejemplo, Qwen2.5-27B, Llama 3.1 8B o Mistral 7B). El autor no proporciona benchmarks de calidad ni datos de otros modelos. Se puede señalar que, en términos de tamaño, el modelo se sitúa en el rango de 27B parámetros, similar a otros modelos densos de esa escala, pero no hay datos objetivos de rendimiento comparativo.

## Limitaciones y advertencias

- El rendimiento de 400+ tok/s solo se alcanza con el DSE, que aplica una esparsidad del 95% en las neuronas SwiGLU; esto puede afectar a la calidad de la generación, aunque el autor no aporta métricas de calidad para verificarlo.
- Con Ollama o llama.cpp estándar, el modelo no aprovecha las optimizaciones del DSE y sufre una degradación severa de velocidad (14,2 tok/s) y posibles cuellos de botella de memoria.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.), por lo que se desconoce el rendimiento real del modelo en tareas estándar.
- No se especifican los idiomas soportados; aunque el vocabulario es amplio, no hay confirmación de cobertura multilingüe.
- El modelo es una cuantización Q4_K_M, lo que puede introducir pérdidas de precisión frente al modelo original en FP16 o NVFP4.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto específicas; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el funcionamiento del DSE en otros entornos (Linux, macOS, etc.).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jamesatron1512/Qwen3.8-27B-GGUF
- Modelo base (cuantización NVFP4): https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
