# Phil2Sat/Omega-Convergence-27B-v1.0-SSMFIX-SOMPOA

## Resumen

Omega-Convergence-27B-v1.0-SSMFIX-SOMPOA es una versión cuantizada del modelo multimodal ReadyArt/Omega-Convergence-27B-v1.0, desarrollada por el usuario Phil2Sat. El modelo original, creado por ReadyArt, es un sistema de 27 781 millones de parámetros que procesa simultáneamente imágenes y texto (pipeline image-text-to-text), y está clasificado dentro de la familia Qwen3.5. La cuantización presentada en este repositorio utiliza el formato W8A16 FP8 de la librería compressed-tensors, con pesos en float8_e4m3fn y activaciones en bf16/fp16, lo que reduce el consumo de memoria y acelera la inferencia en hardware compatible sin sacrificar significativamente la calidad.

La relevancia de este modelo radica en que ofrece una alternativa optimizada para despliegue en entornos de producción con GPUs Intel (XPU) o NVIDIA (CUDA SM75+). El proceso de cuantización offline aplica escalas por canal de salida y una búsqueda de recorte por error cuadrático medio, superando en precisión al método online de vLLM. No se han publicado resultados de benchmarks ni detalles sobre el entrenamiento del modelo base, pero la cuantización es compatible con vLLM y puede integrarse en pipelines de inferencia existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), basado en Qwen3.5 (no se dispone de más detalles) |
| Parametros totales | 27 781 427 952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en float8_e4m3fn, activaciones en bf16/fp16) |
| Idiomas soportados | No disponible (probablemente multilingüe, no confirmado) |
| Licencia | No disponible (el modelo base usa Apache-2.0, pero el cuantizado no especifica) |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización del original ReadyArt/Omega-Convergence-27B-v1.0, un modelo multimodal que combina un codificador de visión y un decodificador de lenguaje, probablemente basado en la arquitectura de la familia Qwen3.5. No se ha proporcionado información sobre el proceso de entrenamiento del modelo base, como el número de tokens, la composición del dataset o el uso de técnicas de alineación (RLHF/DPO). El foco de esta versión es la cuantización: se aplica un proceso offline que asigna una escala por cada canal de salida de las capas lineales (attention y MLP), con un ajuste fino mediante búsqueda de recorte que minimiza el error cuadrático medio. Las capas críticas como embeddings, normas, lm_head, routers/experts y la torre de visión se mantienen en bf16 para preservar la calidad. Este enfoque ofrece mejor relación señal-ruido que la cuantización online de vLLM.

## Capacidades

- Procesamiento multimodal: acepta entrada de imágenes y texto, generando texto como respuesta (image-text-to-text).
- Conversacional: diseñado para diálogos multi-turno y tareas de asistencia.
- Compresión eficiente: al mantener las activaciones en alta precisión (bf16/fp16) y los pesos en FP8, reduce el uso de memoria sin degradar la calidad de las representaciones intermedias.
- Compatibilidad con vLLM: se integra con el motor de inferencia vLLM en plataformas Intel XPU y NVIDIA CUDA (SM75+), mediante kernels específicos para W8A16-FP8.
- No se han confirmado capacidades avanzadas como tool calling, agentes o razonamiento multi-paso, aunque por su origen (Qwen3.5) podrían existir, pero no se documentan.

## Casos de uso

- Asistentes de atención al cliente con visión: el modelo puede analizar capturas de pantalla, imágenes de productos o documentos escaneados y generar respuestas contextuales en tiempo real. Su cuantización W8A16 permite desplegarlo en servidores con GPUs NVIDIA A100 o H100, reduciendo el coste de memoria sin perder fidelidad en la comprensión visual.
- Análisis de imágenes médicas (asistido): procesa radiografías o tomografías junto con informes de texto para generar resúmenes preliminares, ayudando a los radiólogos a priorizar casos. El formato cuantizado facilita su integración en entornos con restricciones de hardware.
- Generación de descripciones de productos en e-commerce: a partir de una foto del artículo, el modelo produce una ficha técnica o texto de marketing, manteniendo la coherencia con el contexto visual. Su tamaño de 27B permite una calidad alta en descripciones largas.
- Moderación de contenido visual: combina análisis de imagen y texto para identificar contenido inapropiado o peligroso, con la ventaja de poder ejecutarse en hardware más económico gracias a la cuantización.
- Sistemas de documentación automatizada: extrae información de imágenes de diagramas, gráficos o capturas de pantalla y genera documentación técnica, aprovechando la capacidad de razonamiento multimodal.
- Chatbots de soporte técnico con contexto visual: el usuario envía una imagen de su problema (pantalla azul, cableado, etc.) y el modelo genera pasos de solución. La cuantización FP8 permite respuestas en tiempo real en servidores con GPUs de gama media (RTX 4090, por ejemplo, aunque se debe verificar la VRAM).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras métricas para este modelo cuantizado ni para su base. La única indicación de rendimiento es la técnica de cuantización, que afirma superar la SNR del método online de vLLM, pero no se proporcionan números concretos.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 27,78 B de parámetros y cuantización parcial (solo capas lineales en FP8), el peso en memoria podría rondar entre 30 y 40 GB, pero no se ha confirmado. El tamaño del repositorio es 55.6 GB, lo que sugiere que los archivos incluyen todos los parámetros (posiblemente en bf16 para las partes no cuantizadas).
- GPUs recomendadas: NVIDIA (SM75+, Turing o posterior) o Intel XPU, según la documentación de vLLM. Para NVIDIA, se requiere el kernel MarlinFP8ScaledMMLinearKernel o HummingFP8ScaledMMLinearKernel (este último con el paquete `humming`). No se mencionan GPUs específicas, pero por el tamaño, se necesitan al menos 40 GB de VRAM para una inferencia sin offloading.
- No es compatible con ROCm, CPU o TPU en vLLM, lo que limita su despliegue a las plataformas indicadas.
- Opciones de despliegue: vLLM (con soporte para Intel y NVIDIA), y potencialmente otras herramientas que acepten el formato compressed-tensors, pero no se documentan alternativas como llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos. El modelo base, Omega-Convergence-27B-v1.0, es un modelo multimodal de 27B parámetros con licencia Apache-2.0, pero no se conocen sus especificaciones de contexto ni de rendimiento. No se han encontrado otros modelos cuantizados de la misma familia en el repositorio, por lo que la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo base está etiquetado con términos como `nsfw`, `explicit roleplay`, `unaligned` y `dangerous`, lo que sugiere que puede generar contenido no seguro o no alineado con políticas de uso responsable. El cuantizado no indica ninguna modificación en este aspecto.
- No se ha evaluado el comportamiento del modelo cuantizado en términos de sesgos, alucinaciones o errores de razonamiento. La falta de benchmarks dificulta conocer su fiabilidad en producción.
- La licencia del modelo cuantizado no está especificada. Aunque el modelo base usa Apache-2.0, no se confirma que el cuantizado herede esa licencia; se debe consultar con el autor antes de un uso comercial.
- La compatibilidad de vLLM es limitada: no funciona en ROCm, CPU o TPU, lo que restringe los entornos de despliegue.
- No se conoce la longitud de contexto soportada, un parámetro crítico para aplicaciones de diálogo largo o análisis de documentos extensos.
- El modelo es multimodal, pero no se han documentado las capacidades exactas de visión (resolución, tipos de imágenes, etc.), por lo que su uso en aplicaciones críticas requiere una validación previa.

## Enlaces

- [HuggingFace - Phil2Sat/Omega-Convergence-27B-v1.0-SSMFIX-SOMPOA](https://huggingface.co/Phil2Sat/Omega-Convergence-27B-v1.0-SSMFIX-SOMPOA)
- [Modelo base - ReadyArt/Omega-Convergence-27B-v1.0](https://huggingface.co/ReadyArt/Omega-Convergence-27B-v1.0)
- [Perfil de GitHub de Phil2Sat](https://github.com/phil2sat)
- [Página de despliegue en FriendliAI](https://friendli.ai/models/hoborific/Omega-Convergence-27B-v1.0-W8A16-FP8)
- [Librería compressed-tensors](https://github.com/neuralmagic/compressed-tensors)
