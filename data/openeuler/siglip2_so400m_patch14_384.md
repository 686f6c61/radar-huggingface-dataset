# openEuler/siglip2_so400m_patch14_384

## Resumen

El modelo `openEuler/siglip2_so400m_patch14_384` es un paquete de despliegue del modelo SigLIP2 de Google, adaptado por el proyecto openEuler para su uso en el framework IB-Robot (Intelligence Boom Robot). SigLIP2 (Sigmoid Loss for Language Image Pre-training 2) es un codificador dual de visión y lenguaje que genera embeddings L2-normalizados de 1152 dimensiones para imágenes y texto, permitiendo tareas como clasificación zero-shot, recuperación de imágenes por texto y visión como backbone para modelos de lenguaje visuales. Este paquete incluye pesos originales de PyTorch y artefactos compilados para hardware Ascend (310B y 310P), lo que facilita su despliegue en entornos de borde y robótica.

La relevancia de este modelo radica en su doble naturaleza: por un lado, hereda las innovaciones de SigLIP2 (pérdida de decodificador, predicción global-local y enmascarada) que mejoran la alineación semántica y la localización de características visuales; por otro, el empaquetado de openEuler lo hace directamente utilizable en sistemas embebidos y plataformas de robótica con aceleradores Ascend, un nicho donde la mayoría de los modelos de visión-lenguaje no están optimizados. Con un tamaño de repositorio de 9,2 GB, incluye pesos en safetensors y artefactos OM para inferencia en hardware Ascend, además de soporte para CPU y GPU NVIDIA a través de PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SigLIP2 (codificador dual de visión e imagen) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (tokens de texto limitados a 64 en el pipeline de IB-Robot) |
| Tipos de cuantización | no disponible (los artefactos OM para Ascend pueden implicar cuantización, pero no se especifica) |
| Idiomas soportados | no disponible (el modelo base de Google está entrenado principalmente para inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (torch) y artefactos OM (Ascend) |

## Arquitectura y entrenamiento

SigLIP2 es un modelo de codificador dual (visión y texto) basado en la arquitectura Transformer. El backbone visual es una red SO400M (400 millones de parámetros) con patch size 14 y entrada de imágenes de 384×384 píxeles. La innovación principal de SigLIP2 frente a SigLIP original es la incorporación de tres objetivos adicionales durante el preentrenamiento: pérdida de decodificador (decoder loss), pérdida global-local (global-local loss) y predicción de parches enmascarados (masked prediction). Estos objetivos mejoran la localización de objetos, la robustez a cambios de escala y la alineación entre modalidades. El modelo produce embeddings de imagen y texto de dimensión 1152, normalizados L2, lo que permite compararlos mediante similitud de coseno.

El entrenamiento del modelo base fue realizado por Google, con datos de imagen y texto en inglés. El paquete de openEuler no modifica los pesos, sino que los convierte a artefactos OM (Open Model) para hardware Ascend y proporciona un manifiesto de despliegue (`inference_manifest.json`) con rutas y configuraciones para los backends `ascend_310b`, `ascend_310p`, `torch_cpu` y `torch_cuda`. No se han publicado detalles sobre el dataset de entrenamiento original ni sobre técnicas de RLHF o DPO, ya que el modelo se basa directamente en el preentrenamiento de SigLIP2.

## Capacidades

- Generación de embeddings de imagen y texto en un espacio vectorial común de 1152 dimensiones, L2-normalizados.
- Clasificación de imágenes zero-shot: asocia imágenes a etiquetas de texto sin entrenamiento adicional.
- Recuperación de imágenes por texto y viceversa (texto-imagen e imagen-texto retrieval).
- Backbone visual para modelos de lenguaje visuales (VLM) y sistemas de visión-robótica.
- Soporte de despliegue en hardware Ascend (310B1, 310P1) mediante artefactos OM, además de CPU y GPU NVIDIA.
- Integración con el framework IB-Robot para aplicaciones robóticas, con entrada de imágenes en formato NCHW y tokens de texto de longitud fija (64).
- No soporta generación de texto ni tool calling, ya que es un codificador de características, no un modelo generativo.

## Casos de uso

- **Búsqueda visual en catálogos de productos**: se puede indexar un catálogo de imágenes de productos y usar el modelo para recuperar los productos más similares a una consulta de texto (p. ej., "zapatillas rojas de running"). La normalización L2 y la dimensión 1152 permiten una comparación eficiente con similitud de coseno en bases de datos vectoriales.
- **Clasificación de imágenes en el borde**: gracias a los artefactos para Ascend 310B/310P, el modelo puede desplegarse en dispositivos de bajo consumo para clasificar imágenes en tiempo real (p. ej., control de calidad en fabricación) sin depender de la nube.
- **Robótica de manipulación**: el modelo puede servir como encoder visual en un sistema robótico para emparejar la imagen de un objeto con instrucciones textuales del operador, facilitando la selección y manipulación de objetos en entornos industriales.
- **Sistemas de recomendación visual**: en una tienda en línea, se pueden generar embeddings de imágenes de productos y de consultas de usuario para recomendar artículos visualmente similares o relevantes semánticamente, mejorando la experiencia de búsqueda.
- **Análisis de datos médicos (imágenes de microscopía)**: el modelo puede extraer embeddings de imágenes médicas para agrupar patrones visuales y correlacionarlos con descripciones clínicas, ayudando a la revisión de datos no etiquetados.
- **Despliegue en entornos sin GPU**: con el backend `torch_cpu`, el modelo puede ejecutarse en servidores sin GPU dedicada para tareas de extracción de características por lotes, como la indexación de un corpus de imágenes en una biblioteca digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otros indicadores de rendimiento para este paquete específico. El modelo base SigLIP2 de Google reporta mejoras frente a SigLIP en tareas de localización y clasificación zero-shot, pero los números concretos no se incluyen en la documentación de este repositorio.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El modelo tiene aproximadamente 400 millones de parámetros (SO400M), por lo que en FP16 necesitaría en torno a 0,8 GB de VRAM solo para los pesos, pero el paquete incluye artefactos adicionales y el repositorio ocupa 9,2 GB. No se especifica la VRAM real para los artefactos OM.
- **GPU recomendadas**: el backend `torch_cuda` soporta cualquier GPU NVIDIA con CUDA, aunque el modelo es ligero y cabe en GPUs de consumo como una RTX 3060 (12 GB) o superior. Para despliegue en Ascend, se requieren los procesadores Ascend 310B1 o 310P1.
- **¿Cabe en GPU de consumo?**: sí, el tamaño de los pesos es reducido y se puede ejecutar en tarjetas de consumo, aunque no se han publicado datos de latencia o throughput.
- **Opciones de despliegue**: los backends disponibles son `ascend_310b` (ACL), `ascend_310p` (ACL), `torch_cpu` (PyTorch) y `torch_cuda` (PyTorch). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| openEuler/siglip2_so400m_patch14_384 | ~400M (SO400M) | 64 tokens de texto en pipeline | Apache-2.0 | HuggingFace | Empaquetado para Ascend y IB-Robot |
| google/siglip2-so400m-patch14-384 | ~400M | no disponible | Apache-2.0 | HuggingFace | Modelo original de Google, sin artefactos Ascend |
| google/siglip-so400m-patch14-384 | ~400M | no disponible | Apache-2.0 | HuggingFace | Versión anterior de SigLIP, sin las mejoras de SigLIP2 |

La principal diferencia entre este modelo y los de Google es la inclusión de artefactos OM para hardware Ascend y el empaquetado para el framework IB-Robot, lo que lo hace directamente desplegable en robótica y entornos de borde. El modelo base es el mismo, por lo que el rendimiento en términos de calidad de embeddings es idéntico al de `google/siglip2-so400m-patch14-384`.

## Limitaciones y advertencias

- **Idioma**: el modelo base está entrenado principalmente con datos en inglés, por lo que su rendimiento en tareas multilingües (incluido el español) puede ser inferior.
- **Sesgos**: no se han publicado estudios de sesgos específicos para este modelo. Los embeddings de visión pueden heredar sesgos de los datos de entrenamiento de SigLIP2.
- **Alucinación**: al ser un modelo de extracción de características, no genera texto, por lo que no presenta riesgo de alucinación en el sentido generativo. Sin embargo, la recuperación de imágenes puede devolver resultados falsos si la consulta es ambigua.
- **Limitaciones de contexto**: el pipeline de IB-Robot limita el texto a 64 tokens, lo que restringe la longitud de las descripciones textuales. No se indica la longitud de contexto del modelo original.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero se debe citar el modelo original (Google) y el framework IB-Robot según las citaciones proporcionadas.
- **Caveats de producción**: el paquete está diseñado para un pipeline específico (IB-Robot) con entradas y salidas fijas (`masked_images`, `text_tokens`, `text_attention_mask`). No se puede usar directamente como un modelo de visión general sin adaptar el preprocesamiento. Además, los artefactos OM de Ascend pueden requerir versiones específicas del runtime ACL.

## Enlaces

- HuggingFace del modelo: [openEuler/siglip2_so400m_patch14_384](https://huggingface.co/openEuler/siglip2_so400m_patch14_384)
- Modelo base en HuggingFace: [google/siglip2-so400m-patch14-384](https://huggingface.co/google/siglip2-so400m-patch14-384)
- Versión JAX del modelo base: [google/siglip2-so400m-patch14-384-jax](https://huggingface.co/google/siglip2-so400m-patch14-384-jax)
- Paper de SigLIP 2: [arXiv:2504.14795](https://arxiv.org/abs/2504.14795)
- Repositorio de IB-Robot: [https://gitcode.com/openeuler/IB_Robot](https://gitcode.com/openeuler/IB_Robot)
