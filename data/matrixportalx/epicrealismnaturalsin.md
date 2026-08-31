# matrixportalx/epiCRealismNaturalSin

## Resumen

epiCRealismNaturalSin es una conversión del checkpoint de Stable Diffusion 1.5 "epiCRealism - Natural Sin" al formato QNN (Qualcomm Neural Network) para ejecutarse en la NPU de procesadores Snapdragon. El modelo está diseñado específicamente para la aplicación Ruya / Local Dream, que permite generar imágenes de forma local en dispositivos móviles sin conexión a la nube. El autor, matrixportalx, ha adaptado el UNet a un binario de contexto QNN (runtime qnn2.28, tier `min`, HTP v69) mientras que el text encoder y el VAE se ejecutan mediante MNN en CPU/GPU. El resultado es un modelo de generación de imágenes realistas de 512x512 píxeles, con un tamaño de repositorio de 1 GB, pensado para dispositivos Snapdragon de gama media y alta.

La relevancia de este modelo radica en que permite llevar la generación de imágenes por IA a dispositivos móviles con aceleración por NPU, reduciendo el consumo energético y mejorando la privacidad al procesar todo localmente. Aunque no introduce innovaciones arquitectónicas nuevas (se basa en SD1.5), su valor está en la optimización para hardware específico de Qualcomm, lo que lo convierte en una opción práctica para desarrolladores de aplicaciones móviles que buscan integrar generación de imágenes sin depender de servicios externos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + text encoder + VAE) |
| Parametros totales | no disponible (basado en SD1.5, sin especificar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (text encoder de SD1.5, típicamente 77 tokens, no confirmado) |
| Tipos de cuantizacion | 16-bit activación, 8-bit pesos por canal (según model card) |
| Idiomas soportados | no disponibles (el text encoder de SD1.5 es principalmente inglés, no confirmado) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | QNN context binary (UNet), MNN (text_encoder/VAE) |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint original "epiCRealism - Natural Sin" (una variante de SD1.5 entrenada para generar imágenes ultra realistas) al formato QNN para NPU de Qualcomm. No se trata de un entrenamiento nuevo, sino de una adaptación del modelo preentrenado mediante la herramienta `Sd-1.5-Converting-to-Qualcomm-QNN-Model` (enlazada en el repositorio). El proceso de conversión incluye la cuantización del UNet a 8 bits por canal con activaciones de 16 bits, y la compilación a un binario de contexto QNN optimizado para HTP v69 (compatible con Snapdragon 7 Gen 1, 7s Gen 2, 8 Gen 1 y superiores). El text encoder y el VAE se mantienen en formato MNN, ejecutándose en CPU/GPU. No se proporcionan detalles sobre el dataset de entrenamiento original ni sobre técnicas como RLHF o DPO, ya que esta versión es una conversión y no un entrenamiento.

## Capacidades

- Generación de imágenes realistas a partir de descripciones textuales (text-to-image) a resolución fija de 512x512.
- Ejecución completamente local en dispositivos Snapdragon con NPU compatible, sin necesidad de conexión a internet.
- Inferencia acelerada por NPU para el UNet, con text encoder y VAE en CPU/GPU mediante MNN.
- Compatibilidad con la aplicación Ruya / Local Dream mediante importación manual del archivo ZIP.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de visión o audio; es exclusivamente un generador de imágenes.

## Casos de uso

- Generación de imágenes en dispositivos móviles sin conexión: el modelo permite crear ilustraciones o conceptos visuales directamente en el teléfono, útil para artistas o diseñadores que trabajan en entornos sin acceso a la nube.
- Aplicaciones de creatividad y arte digital: integrable en apps de dibujo o edición para generar texturas, fondos o referencias visuales en tiempo real.
- Prototipado rápido de imágenes realistas: desarrolladores pueden usar el modelo para generar muestras visuales de productos, escenarios o personajes sin depender de servicios externos.
- Edición de fotos con IA: combinado con herramientas de inpainting o outpainting (si se implementan), puede usarse para modificar imágenes existentes de forma local.
- Privacidad y confidencialidad: al procesar localmente, es adecuado para aplicaciones que manejan datos sensibles o que requieren que las imágenes generadas no salgan del dispositivo.
- Pruebas de concepto para desarrolladores de apps móviles: sirve como base para evaluar el rendimiento de SD1.5 en hardware Snapdragon y decidir si merece la pena invertir en optimizaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre tiempos de inferencia, throughput o comparaciones con otros modelos en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- Dispositivos con procesador Snapdragon que incluyan NPU compatible con HTP v69 o superior (según la model card: Snapdragon 7 Gen 1, 7s Gen 2, 8 Gen 1 y todos los superiores).
- No requiere GPU dedicada ni VRAM externa; la inferencia se realiza en la NPU del dispositivo.
- Memoria RAM del dispositivo: no especificada, pero el tamaño del repositorio es de 1 GB, por lo que se recomienda al menos 2 GB de RAM libre.
- Despliegue: mediante la aplicación Ruya / Local Dream, importando el archivo ZIP desde el menú de configuración.
- No se mencionan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ya que el formato QNN es específico de Qualcomm.

## Comparativa con modelos similares

| Modelo | Formato | Plataforma | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| epiCRealismNaturalSin (este) | QNN + MNN | Snapdragon NPU | 512x512 | creativeml-openrail-m | HuggingFace (repo) |
| imagepipeline/EpiCRealism-Natural-Sin | Diffusers (safetensors) | CPU/GPU (PyTorch) | 512x512 (típico) | creativeml-openrail-m | HuggingFace |
| epiCRealism - Natural Sin (original) | Checkpoint SD1.5 (ckpt/safetensors) | CPU/GPU (AUTOMATIC1111, ComfyUI) | 512x512 (típico) | creativeml-openrail-m | Civitai |
| EpiCRealism NS (Sogni) | CoreML | Apple Silicon / Sogni Supernet | no disponible | no disponible | Sogni.ai |

La comparativa muestra que la versión de matrixportalx es la única optimizada para NPU de Qualcomm, mientras que las otras requieren GPU o CPU convencional. La licencia es la misma en todas las variantes, pero el formato de pesos difiere sustancialmente.

## Limitaciones y advertencias

- Resolución fija de 512x512; no se soportan resoluciones superiores sin reescalado externo.
- Dependencia de hardware Qualcomm específico; no funciona en dispositivos con otros chipsets (MediaTek, Exynos, Apple, etc.).
- El text encoder y el VAE se ejecutan en CPU/GPU, lo que puede limitar el rendimiento global en dispositivos con poca memoria o CPU lenta.
- La licencia creativeml-openrail-m permite uso comercial, pero prohíbe usos ilegales o dañinos, y no se garantiza la ausencia de sesgos en el modelo original (no se han documentado sesgos específicos en esta conversión).
- No se proporcionan garantías de soporte técnico ni actualizaciones; el repositorio parece ser un proyecto personal.
- El modelo no incluye capacidades de ajuste fino ni fine-tuning; es un artefacto fijo para inferencia.
- No hay información sobre la calidad de la conversión ni sobre posibles pérdidas de fidelidad respecto al checkpoint original.

## Enlaces

- HuggingFace: https://huggingface.co/matrixportalx/epiCRealismNaturalSin
- Repositorio de conversión: https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model
- Modelo original en Civitai: https://civitai.com/models/25694/epicrealism
- Versión Diffusers en HuggingFace: https://huggingface.co/imagepipeline/EpiCRealism-Natural-Sin
- API de Stable Diffusion: https://stablediffusionapi.com/models/epicrealismnaturalsi
- Versión CoreML en Sogni: https://www.sogni.ai/models/epicrealism-ns
