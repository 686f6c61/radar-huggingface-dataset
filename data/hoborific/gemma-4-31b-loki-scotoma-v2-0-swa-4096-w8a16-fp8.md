# hoborific/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-W8A16-FP8

## Resumen

Este modelo es una versión cuantizada en formato W8A16 FP8 del checkpoint `CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096`, publicada por el usuario hoborific. El modelo base es un fine-tune de `google/gemma-4-31B-it` (la variante instructiva de Gemma 4 de 31B parámetros) realizado mediante γ-fold y DPO sobre el dataset Loki V2, con una extensión de ventana de contexto de 4096 tokens mediante sliding window attention (SWA). La cuantización está orientada a despliegue eficiente en vLLM, especialmente en hardware Intel XPU y NVIDIA CUDA, reduciendo el uso de memoria y acelerando la inferencia sin pérdida significativa de calidad.

La relevancia de este modelo radica en que combina las capacidades de Gemma 4 (generación de texto, razonamiento, código, soporte multimodal imagen-texto) con una optimización de precisión mixta que permite ejecutarlo en GPUs con menor VRAM que la versión original en bf16. El formato compressed-tensors con escalas por canal y búsqueda de clip MSE ofrece mejor relación señal-ruido que la cuantización online per-tensor de vLLM, lo que lo hace atractivo para entornos de producción donde se prioriza la eficiencia sin sacrificar precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, 31B) |
| Parametros totales | 31.273.088.876 (31,27B) |
| Parametros activos | no disponible (probablemente denso) |
| Longitud de contexto | 4096 (extension SWA) |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn) |
| Idiomas soportados | no disponible (Gemma 4 base soporta mas de 140) |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096` se construye a partir de `ReadyArt/gemma-4-31B-it-scotoma-2`, un fine-tune de `google/gemma-4-31B-it` entrenado con γ-fold y DPO sobre el dataset Loki V2. La extensión SWA de 4096 tokens permite manejar contextos más largos que la configuración estándar de Gemma 4, aunque muy por debajo del máximo de 256K tokens que soporta la familia Gemma 4.

La cuantización W8A16 FP8 se aplica offline mediante el paquete compressed-tensors. Cada capa lineal 2D (attention q/k/v/o y MLP gate/up/down) se cuantiza con escalas simétricas por canal de salida, calculadas a partir de `amax / 448` y refinadas mediante una búsqueda de clip MSE sobre nueve fracciones de clip (0.8–1.0× amax). Los pesos se convierten a `float8_e4m3fn` con redondeo al más cercano y saturación. Las capas de embedding, normas, lm_head, routers/experts y la torre de visión permanecen en bf16, y se incluyen en la lista `ignore` del checkpoint para que vLLM no las toque.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de Gemma 4 instruct.
- Razonamiento y resolución de problemas matemáticos y lógicos.
- Generación de código en múltiples lenguajes de programación.
- Soporte multimodal imagen-texto (pipeline `image-text-to-text`), aunque la cuantización no afecta a la torre de visión.
- Capacidad de tool calling y function calling (depende del fine-tune, no confirmado explícitamente).
- Multilingüismo potencial (Gemma 4 base soporta más de 140 idiomas, pero no se especifica para este checkpoint).
- Optimizado para inferencia eficiente en vLLM con kernels W8A16 FP8 en Intel XPU y NVIDIA CUDA.

## Casos de uso

- Despliegue de asistentes conversacionales en producción: el formato FP8 reduce la huella de memoria, permitiendo servir el modelo en GPUs con 40-48 GB de VRAM (p.ej. A100 40GB, L40S) con mayor throughput que la versión bf16.
- Generación de código en entornos CI/CD: al soportar tool calling (si el fine-tune lo conserva), puede integrarse en pipelines de revisión de código o autocompletado.
- Análisis de documentos largos: la ventana SWA de 4096 tokens permite procesar textos de varias páginas, aunque no tan extensos como el contexto completo de Gemma 4.
- Aplicaciones multimodales ligeras: al mantener la torre de visión en bf16, puede usarse para tareas de captioning o VQA con menor coste de inferencia.
- Investigación en cuantización: el método de escalas por canal con búsqueda de clip MSE es un caso de estudio para comparar con cuantización per-tensor.
- Prototipado rápido en entornos con GPUs consumer (RTX 4090 24GB) si se usa cuantización adicional o se limita el batch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni comparativas con el modelo base sin cuantizar. Se recomienda evaluar el modelo en el caso de uso específico antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 33,3 GB, lo que sugiere que el checkpoint completo en FP8 ocupa aproximadamente 31 GB de pesos más overhead. Se recomienda al menos 40 GB de VRAM para inferencia con batch pequeño.
- GPUs compatibles: NVIDIA CUDA SM75+ (Turing o más nuevas, p.ej. RTX 2080, A100, H100, RTX 4090) e Intel XPU (target principal).
- No compatible con ROCm, CPU o TPU en vLLM (fallará con error "no kernel").
- Opciones de despliegue: vLLM (con kernels `HummingFP8ScaledMMLinearKernel` o `MarlinFP8ScaledMMLinearKernel` en CUDA, `XPUW8A16FP8LinearKernel` en XPU). También puede cargarse con transformers estándar, aunque sin las optimizaciones de vLLM.
- Latencia y throughput: no disponibles. Dependen del hardware y configuración de vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096 (base) | 31,27B | 4096 (SWA) | bf16 | no disponible | HuggingFace |
| Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-W8A16-FP8 (este) | 31,27B | 4096 (SWA) | W8A16 FP8 | no disponible | HuggingFace |
| Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF | 31,27B | 4096 (SWA) | GGUF (varias) | no disponible | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para comparar con otros modelos de 31B como Llama 3.1 30B o Mistral Large.

## Limitaciones y advertencias

- La cuantización solo cubre capas lineales 2D; embeddings, normas, lm_head y la torre de visión permanecen en bf16, lo que limita la reducción total de memoria.
- vLLM no soporta W8A16 FP8 en ROCm, CPU o TPU; el despliegue en esos backends fallará.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- No hay benchmarks publicados, por lo que se desconoce el impacto real de la cuantización en la calidad de las respuestas.
- El contexto de 4096 tokens es limitado para tareas que requieran documentos extensos; Gemma 4 base soporta hasta 256K, pero este fine-tune lo reduce drásticamente.
- El modelo base fue entrenado con DPO, lo que puede introducir sesgos específicos del dataset Loki V2; no se han documentado.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda validación externa en aplicaciones críticas.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hoborific/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-W8A16-FP8
- Modelo base: https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096
- Versión GGUF: https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF
- Fine-tune intermedio: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
