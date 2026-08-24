# matrixportalx/RealisticVision_V6.0_B1

## Resumen

RealisticVision_V6.0_B1 es una conversión del modelo de generación de imágenes **Realistic Vision V6.0 B1**, originalmente basado en Stable Diffusion 1.5, adaptado para ejecutarse en el hardware NPU de procesadores Qualcomm Snapdragon. El modelo ha sido convertido por el usuario matrixportalx para funcionar dentro de la aplicación **Ruya / Local Dream**, una herramienta de generación de imágenes local en dispositivos móviles.

El modelo utiliza el runtime QNN (Qualcomm Neural Network) en su versión 2.28, con un perfil de compatibilidad "min" (HTP v69) y activaciones de 16 bits. Esto permite ejecutar el UNet del modelo en la NPU del Snapdragon, mientras que el text encoder y el VAE se ejecutan mediante el runtime MNN en CPU/GPU. El modelo está diseñado para generar imágenes fotorrealistas a resolución de 512x512 píxeles, y es una adaptación del conocido modelo Realistic Vision V6.0 B1 de SG161222, que se distribuye bajo licencia CreativeML OpenRAIL-M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet) convertido a QNN para NPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | 16-bit activaciones, pesos de 8 bits por canal, VTCM 2 MB |
| Idiomas soportados | no disponible |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | QNN context binary (UNet), MNN (text encoder y VAE) |

## Arquitectura y entrenamiento

El modelo es una conversión de **Realistic Vision V6.0 B1**, un checkpoint de Stable Diffusion 1.5 entrenado para generar imágenes fotorrealistas. La arquitectura base es un autoencoder difuso latente con un UNet como red de denoising y un CLIP text encoder. La conversión realizada por matrixportalx adapta el UNet para ejecutarse en la NPU de Snapdragon mediante el runtime QNN (Qualcomm AI Runtime) versión 2.28, con un perfil de compatibilidad "min" que soporta HTP v69 (para Snapdragon 7 Gen 1, 7s Gen 2, 8 Gen 1 y superiores). El text encoder y el VAE se ejecutan con MNN en CPU o GPU.

No se dispone de información sobre los datos de entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de RLHF o DPO). La conversión es puramente técnica y no modifica los pesos del modelo original.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto (text-to-image).
- Soporte de image-to-image editing e inpainting, según la descripción del modelo original.
- Generación a resolución 512x512, con soporte para salidas de hasta 1920x1920 en el modelo original.
- Ejecución local en dispositivos móviles con NPU Snapdragon, sin conexión a servidores externos.
- Integración con la aplicación Ruya / Local Dream mediante importación de modelo personalizado.
- Optimizado para activaciones de 16 bits y pesos de canalizaciones de 8 bits, lo que reduce el uso de memoria.

## Casos de uso

- **Generación de imágenes fotorrealistas en dispositivos móviles**: el modelo permite crear imágenes de alta calidad directamente en el móvil, sin conexión, gracias a la ejecución en la NPU del Snapdragon. Es adecuado para aplicaciones de arte digital y diseño personal.
- **Edición de imágenes con inpainting**: permite retocar o modificar partes específicas de una imagen existente, útil para aplicaciones de retoque fotográfico o diseño gráfico en el dispositivo.
- **Prototipado rápido de ideas visuales**: diseñadores y artistas pueden usar el modelo para generar bocetos o conceptos visuales de forma inmediata en su móvil, sin depender de servicios en la nube.
- **Aplicaciones de creación de contenido para redes sociales**: generar imágenes personalizadas para publicaciones, avatares o fondos de pantalla de forma local y privada.
- **Desarrollo de aplicaciones de IA en el borde (edge AI)**: el modelo sirve como referencia para desarrolladores que quieren integrar generación de imágenes en apps Android con soporte Snapdragon, aprovechando el runtime QNN.
- **Educación y experimentación**: investigadores y estudiantes pueden estudiar la conversión de modelos SD1.5 a QNN y el rendimiento en NPU móviles, usando este modelo como caso de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Dispositivos compatibles**: Snapdragon 7 Gen 1, 7s Gen 2, 8 Gen 1 y superiores, con HTP v6.9 o superior.
- **Memoria**: el tamaño del repositorio es de 1.0 GB, pero la memoria RAM y VRAM exacta requerida para la inferencia no está especificada.
- **GPU**: no aplica para la NPU (el UNet se ejecuta en NPU). El text encoder y el VAE se ejecutan en CPU/GPU mediante MNN.
- **Despliegue**: integración con la aplicación Ruya / Local Dream (Settings → Import Custom Model). El modelo se distribuye como un archivo ZIP (RealisticVision_V6.0_B1_qnn2.28_8gen2.zip) que se descarga e importa en la aplicación.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Formato | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Realistic Vision V6.0 B1 (original) | SD 1.5 | safetensors | 512x512 | CreativeML OpenRAIL-M | Hugging Face, Civitai |
| RealisticVision_V6.0_B1 (QNN) | SD 1.5 | QNN binary | 512x512 | CreativeML OpenRAIL-M | Hugging Face |
| Realistic Vision V5.1 Hyper | SD 1.5 | safetensors | 512x512 | CreativeML OpenRAIL-M | Civitai |

## Limitaciones y advertencias

- El modelo está específicamente diseñado para ejecutarse en la aplicación **Ruya / Local Dream** con dispositivos Snapdragon compatibles. No funciona en otros entornos sin adaptaciones adicionales.
- La licencia **CreativeML OpenRAIL-M** impone restricciones sobre el uso del modelo para fines ilegales o dañinos, pero permite uso comercial con condiciones. Es recomendable revisar el texto completo de la licencia.
- El modelo se basa en **Stable Diffusion 1.5**, que tiene limitaciones conocidas en cuanto a sesgos en la generación de imágenes (puede amplificar estereotipos de género, raza o edad).
- La resolución de entrenamiento es 512x512, por lo que generar imágenes a resoluciones superiores puede producir artefactos o degradar la calidad.
- No se dispone información sobre el rendimiento en términos de latencia o consumo de energía en dispositivos reales.
- El modelo no incluye VAE (según la nomenclatura del original), lo que puede requerir el uso de un VAE externo para obtener colores correctos.
- La conversión es una adaptación técnica del modelo original; el autor no ha publicado detalles sobre el proceso de cuantización ni sobre posibles pérdidas de calidad.

## Enlaces

- [HuggingFace: matrixportalx/RealisticVision_V6.0_B1](https://huggingface.co/matrixportalx/RealisticVision_V6.0_B1)
- [HuggingFace: SG161222/Realistic_Vision_V6.0_B1_noVAE](https://huggingface.co/SG161222/Realistic_Vision_V6.0_B1_noVAE)
- [Civitai: Realistic Vision V6.0 B1 - V5.1 Hyper](https://civitai.com/models/4201/realistic-vision-v60-b1)
- [HuggingFace: imagepipeline/Realistic-Vision-V6.0](https://huggingface.co/imagepipeline/Realistic-Vision-V6.0)
- [AIModels.fyi: realistic-vision-v6.0-b1](https://www.aimodels.fyi/models/replicate/realistic-vision-v60-b1-asiryan)
- [ModelScope: Realistic_Vision_V6.0_B1_SD_1_5](https://www.modelscope.cn/models/MusePublic/Realistic_Vision_V6.0_B1_SD_1_5)
- [Repositorio de conversión: Sd-1.5-Converting-to-Qualcomm-QNN-Model](https://github.com/matrixportalx/Sd-1.5-Converting-to-Qualcomm-QNN-Model)
