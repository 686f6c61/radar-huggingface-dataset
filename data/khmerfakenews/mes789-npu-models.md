# khmerfakenews/mes789-npu-models

## Resumen

`khmerfakenews/mes789-npu-models` es un repositorio de pesos convertidos a formato ONNX/QNN para la NPU Hexagon de los Qualcomm Snapdragon 8 Gen 3. No se trata de un modelo de lenguaje, sino de los UNets de inpainting de DreamShaper 7 y DreamShaper 8 (obra original de Lykon), adaptados para su ejecución en la unidad de procesamiento neuronal de dispositivos móviles Android de gama alta. El repositorio lo publica el usuario `khmerfakenews` y se emplea en la aplicación MES789 AI Draw.

El interés técnico reside en la conversión a QNN: los UNets de difusión son el componente más costoso computacionalmente de un pipeline Stable Diffusion, y su despliegue en NPU permite acelerar la generación de imágenes en el propio dispositivo sin depender de la nube. El repositorio ocupa 3,5 GB y no incluye model card detallada, ficha de pipeline ni información sobre idiomas o benchmarks.

No hay datos publicados sobre arquitectura interna, número de parámetros, proceso de entrenamiento ni resultados de evaluación. La información disponible se limita a la identificación de los UNets de origen y al hardware objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (DreamShaper 7 y DreamShaper 8 Inpainting), convertidos a ONNX/QNN para NPU Hexagon |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (formato QNN, presumiblemente cuantizado para NPU; sin detalle publicado) |
| Idiomas soportados | no disponible |
| Licencia | creativeml-openrail-m |
| Formato de pesos | ONNX / QNN (Qualcomm) |

## Arquitectura y entrenamiento

Los pesos corresponden a los UNets de DreamShaper 7 y DreamShaper 8 Inpainting, variantes de Stable Diffusion 1.5 afinadas por Lykon para generación e inpainting de imágenes. La arquitectura subyacente es la UNet estándar de SD 1.5 (bloques residuales con atención cruzada sobre el texto codificado), aunque el repositorio no documenta la configuración exacta ni el proceso de conversión.

La conversión a QNN implica normalmente cuantización y reescritura de operadores para la NPU Hexagon del Snapdragon 8 Gen 3. No se publican detalles sobre el pipeline de conversión, el nivel de precisión (FP16/INT8), los tokens de entrenamiento (no aplica) ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de imágenes mediante difusión, usando los UNets de DreamShaper 7 y DreamShaper 8 como componente de denoising.
- Inpainting: reconstrucción de regiones enmascaradas de una imagen, función principal de las variantes incluidas.
- Ejecución en NPU Hexagon del Snapdragon 8 Gen 3 (aceleración en dispositivo).
- Integración en la aplicación MES789 AI Draw.
- No se documentan capacidades de texto, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos de razonamiento, visión o audio.

## Casos de uso

- Edición de imágenes en dispositivo: la aplicación MES789 AI Draw puede aplicar inpainting local sin enviar la imagen a un servidor, usando la NPU del Snapdragon 8 Gen 3 para el denoising.
- Retoque fotográfico móvil: eliminación de objetos o reconstrucción de zonas dañadas en fotografías directamente en el teléfono, con latencia reducida frente a inferencia en CPU/GPU.
- Generación de imágenes offline: al ejecutarse en NPU local, permite crear imágenes sin conexión a internet, útil en entornos con conectividad limitada.
- Prototipado de pipelines de difusión en Android: sirve como referencia para desarrolladores que quieran portar UNets de SD 1.5 a QNN y medir el rendimiento en Hexagon.
- Aplicaciones de privacidad: el procesamiento local evita subir contenido sensible a servicios en la nube.
- Integración en apps de terceros: al estar en formato ONNX/QNN, puede incorporarse en aplicaciones Android que usen el SDK de Qualcomm AI Engine Direct, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU objetivo: Qualcomm Hexagon del Snapdragon 8 Gen 3 (requisito explícito del repositorio).
- VRAM/RAM: no disponible; el repositorio ocupa 3,5 GB, lo que da una idea del espacio de almacenamiento necesario, pero no se documenta el consumo en ejecución.
- GPU de escritorio: no aplica; los pesos están convertidos para QNN y no se garantiza su funcionamiento en CUDA, ROCm ni Metal.
- Opciones de despliegue: Qualcomm AI Engine Direct / QNN SDK en Android; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Hardware objetivo | Formato | Licencia | Contexto/uso |
|---|---|---|---|---|---|
| khmerfakenews/mes789-npu-models | UNet de difusion (DreamShaper 7/8) | NPU Hexagon, Snapdragon 8 Gen 3 | ONNX/QNN | creativeml-openrail-m | Inpainting en dispositivo |
| Lykon/DreamShaper (original) | UNet de difusion | GPU (CUDA) | safetensors | creativeml-openrail-m | Generacion e inpainting |
| Stable Diffusion 1.5 (RunwayML) | UNet de difusion | GPU (CUDA) | safetensors | creativeml-openrail-m | Generacion de imagenes |
| ONNX Runtime Stable Diffusion (comunidad) | UNet de difusion | CPU/GPU via ONNX Runtime | ONNX | variable | Generacion multiplataforma |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto conversacionales ni tareas de NLP; su uso se limita a difusion de imágenes.
- Solo para Snapdragon 8 Gen 3: la conversión QNN está atada a esa NPU; no se garantiza su funcionamiento en otros SoC ni en GPU de escritorio.
- Documentación mínima: sin model card detallada, sin información de cuantización, sin métricas de calidad ni de latencia.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos, obligación de incluir aviso de licencia y restricciones de redistribución); conviene revisar los términos completos antes de producción.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión de la familia SD 1.5 (sesgos demográficos, artefactos en manos y texto).
- Sin garantías de mantenimiento ni soporte por parte del autor; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- El nombre del repositorio y del autor no aportan información verificable sobre la procedencia de la conversión; se recomienda auditar los pesos antes de integrarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/khmerfakenews/mes789-npu-models
- DreamShaper (Lykon) en Hugging Face: https://huggingface.co/Lykon/DreamShaper
- DreamShaper 8 Inpainting: https://huggingface.co/Lykon/DreamShaper_8
- Qualcomm AI Engine Direct (QNN SDK): https://www.qualcomm.com/developer/software/qualcomm-ai-engine-direct-sdk
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
