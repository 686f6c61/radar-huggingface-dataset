# AutomatosX/AX-Nemotron-3-Super-120B-A12B-CUDA-AXQ-NVFP4-MTP

## Resumen
AX-Nemotron-3-Super-120B-A12B-CUDA-AXQ-NVFP4-MTP es un checkpoint cuantizado del modelo NVIDIA-Nemotron-3-Super-120B-A12B-BF16, desarrollado por AutomatosX. Se trata de un modelo de 123,6 mil millones de parámetros con arquitectura Nemotron-H, que combina capas Mamba-2 (SSM) con Transformer y una mezcla de expertos (MoE). El nombre sugiere 12 mil millones de parámetros activos, aunque este dato no se confirma en la model card. La versión cuantizada emplea NVFP4 para los pesos, reduciendo el uso de memoria para inferencia en GPUs NVIDIA.

La relevancia de este modelo radica en que permite desplegar un modelo de gran tamaño en infraestructura CUDA con menos VRAM que la versión BF16 original. Incluye pesos entrenados para Multi-Token Prediction (MTP), lo que podría habilitar decodificación especulativa, si bien la compatibilidad en runtime no está verificada. La licencia es la NVIDIA Nemotron Open Model License.

No se especifican la longitud de contexto ni los idiomas soportados. Hereda las capacidades del modelo base, pero no se detallan en la información disponible.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (híbrida Mamba-2/Transformer con mezcla de expertos, MoE) |
| Parametros totales | 123.611.033.088 (123,6 B) |
| Parametros activos | 12 B (según nomenclatura A12B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16: pesos NVFP4 en bloques de 16 elementos, formato E2M1, escalas de bloque E4M3FN y escalas globales inversas FP32; activaciones en BF16 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (compressed-tensors NVFP4) |

## Arquitectura y entrenamiento
El modelo es un checkpoint cuantizado del modelo NVIDIA-Nemotron-3-Super-120B-A12B-BF16. La arquitectura subyacente es Nemotron-H, que combina capas Mamba-2 (modelos de espacio de estados) con capas de atención Transformer y una mezcla de expertos. El proceso de cuantización es AXQuant RTN NVFP4A16: las matrices elegibles de expertos de texto y MLP usan NVFP4, mientras que embeddings, cabeza de salida, normas, routers, estado Mamba, proyecciones de atención, expertos compartidos, proyecciones latentes y todos los tensores `mtp.*` mantienen la precisión original (BF16). Los pesos NVFP4 se almacenan en bloques de 16 elementos con formato E2M1, escalas de bloque E4M3FN y escalas globales inversas en FP32. No se ha utilizado AWQ ni cuantizadores de terceros.

No se dispone de información sobre los datos de entrenamiento: número de tokens, composición del dataset, ni si hubo RLHF o DPO. La innovación destacable es la inclusión de pesos MTP (Multi-Token Prediction) entrenados, aunque su compatibilidad con runtimes de decodificación especulativa no está verificada. Se incluye un archivo `axquant_nemotron_release.json` con comprobaciones de preservación de bytes para cada tensor MTP.

## Capacidades
- Generación de texto conversacional: el modelo está etiquetado para `text-generation` y `conversational`.
- Razonamiento, código y matemáticas: se heredan del modelo base, pero no se detallan en la información proporcionada.
- Soporte de tool calling / function calling: no especificado.
- Soporte de agentes y razonamiento multi-paso: no especificado.
- Capacidades multilingües: no disponible.
- Capacidad especial: pesos MTP para posible decodificación especulativa, aunque la compatibilidad en runtime no está verificada.
- No se mencionan capacidades de visión, audio ni otras modalidades.

## Casos de uso
- Asistentes conversacionales avanzados: el modelo puede gestionar diálogos multi-turno complejos gracias a su tamaño y arquitectura híbrida, siempre que la ventana de contexto (no especificada) sea suficiente. Adecuado para atención al cliente o asistentes virtuales que requieran comprensión profunda.
- Generación de contenido largo: redacción de artículos, informes o documentación técnica. Su capacidad para generar texto coherente y extenso lo hace útil en entornos editoriales o de marketing.
- Resumen de documentos: resumir textos largos (si el contexto lo permite) para extraer ideas clave. Se puede integrar en pipelines de procesamiento de documentos.
- Análisis de sentimiento y clasificación: aunque es un modelo generativo, puede usarse para tareas de clasificación mediante prompting, aprovechando su comprensión del lenguaje.
- Investigación en cuantización: sirve como caso de estudio para evaluar el rendimiento de NVFP4 frente a BF16 en modelos MoE híbridos, así como la integración de MTP.
- Despliegue en producción en GPUs NVIDIA: gracias al formato NVFP4 y compressed-tensors, permite servir un modelo de 120B en infraestructura con H100/H200, reduciendo costes de memoria frente a BF16.
- Traducción automática: si el modelo base soporta múltiples idiomas, esta versión podría usarse para traducción, aunque no hay confirmación.
- Chatbots especializados: entrenados con fine-tuning sobre este checkpoint para dominios específicos (legal, médico, etc.), aprovechando su tamaño.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: al menos 85,2 GB solo para los pesos (tamaño del repositorio). Considerando overhead de KV cache y activaciones, se recomienda entre 96 y 128 GB de VRAM.
- GPU recomendadas: NVIDIA H100 80GB (se necesitan al menos 2), H200 141GB, B200. No cabe en GPUs de consumo (RTX 4090 24GB, etc.).
- Opciones de despliegue: requiere un runtime que soporte Nemotron-H, compressed-tensors NVFP4A16 y MTP integrado. Posibles opciones: vLLM, TensorRT-LLM, pero no hay confirmación oficial. Se incluye plan AXQuant, manifiesto e inventario SHA256 para inspección reproducible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AX-Nemotron-3-Super-120B-A12B-CUDA-AXQ-NVFP4-MTP | 123,6 B | 12 B (no confirmado) | no disponible | NVFP4A16 | nvidia-nemotron-open-model-license | HuggingFace |
| nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 | 123,6 B | 12 B | no disponible | BF16 | nvidia-nemotron-open-model-license | HuggingFace |

No se dispone de información sobre otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no evaluados en la información disponible; se heredan del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no cuantificado.
- Limitaciones de contexto o idioma: no especificadas.
- Restricciones de licencia: nvidia-nemotron-open-model-license. Se debe revisar el acuerdo para uso comercial.
- Compatibilidad MTP no verificada: la model card indica que la compatibilidad en runtime no está confirmada.
- No se ofrece certificado de calidad, rendimiento o throughput.
- La serialización en CPU es solo evidencia de formato; no garantiza ejecución ni velocidad en GPU.
- Requiere hardware especializado (GPUs NVIDIA de alta gama) y runtimes compatibles con formatos específicos.
- Posible degradación de calidad respecto a la versión BF16 debido a la cuantización.

## Enlaces
- HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3-Super-120B-A12B-CUDA-AXQ-NVFP4-MTP
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Commit del modelo base: 2dc98e2afe4face0e4ce40972a915c45368bd34a
