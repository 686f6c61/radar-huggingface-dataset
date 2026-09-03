# aishui8633/stable-diffusion-xl-base-1.0-int8-ov

## Resumen

Este repositorio contiene una versión cuantizada a INT8 del modelo Stable Diffusion XL Base 1.0, convertida al formato OpenVINO IR (Intermediate Representation) mediante la herramienta NNCF. El trabajo original es de Stability AI, mientras que la conversión y cuantización la ha realizado Intel como parte de su ecosistema OpenVINO. El modelo resultante permite generar imágenes a partir de descripciones textuales con un coste computacional reducido, lo que facilita su despliegue en CPU y entornos con recursos limitados.

La cuantización de pesos a INT8 con ratio 1.0 reduce el tamaño del modelo y acelera la inferencia en hardware compatible con OpenVINO, manteniendo una calidad de imagen cercana a la versión original de 16 bits. El repositorio tiene un tamaño de 3,5 GB y es compatible con las versiones de OpenVINO 2025.2.0 y superiores, así como con Optimum Intel 1.26.0 y superiores. Es una opción relevante para quienes necesitan ejecutar SDXL en equipos sin GPU dedicada o en entornos de producción con restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion UNet + VAE + CLIP Text Encoders (Stable Diffusion XL Base) |
| Parametros totales | 3.500 millones (aprox., segun modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto a imagen; el prompt se procesa mediante CLIP) |
| Tipos de cuantizacion | INT8 (INT8_ASYM, ratio 1.0) |
| Idiomas soportados | no disponibles (hereda los del modelo original, principalmente ingles) |
| Licencia | OpenRAIL++ |
| Formato de pesos | OpenVINO IR (XML + BIN) |

## Arquitectura y entrenamiento

El modelo base es Stable Diffusion XL, una arquitectura de difusion latente que combina un UNet denoising, un autoencoder VAE y dos codificadores de texto CLIP (uno de los cuales es OpenCLIP ViT-bigG). El proceso de generacion consiste en codificar el prompt, muestrear un tensor latente aleatorio y denoising iterativo en el espacio latente antes de decodificar a imagen. La cuantizacion se ha realizado con NNCF mediante `compress_weights` en modo INT8_ASYM con ratio 1.0, lo que comprime todos los pesos lineales y de convolucion a 8 bits con signo.

El modelo original fue entrenado por Stability AI con un dataset masivo de imagenes y textos, aunque los detalles exactos del entrenamiento no se reproducen en esta version cuantizada. La cuantizacion posterior no requiere reentrenamiento ni datos adicionales; es una compresion post-entrenamiento que preserva la funcionalidad del modelo original con una perdida minima de fidelidad. El resultado es un modelo OpenVINO IR que puede ejecutarse en CPU, GPU integrada o NPU mediante el runtime de OpenVINO.

## Capacidades

- Generacion de imagenes a partir de prompts de texto con resolucion nativa de 1024x1024 píxeles.
- Soporte de prompts negativos para excluir elementos no deseados de la imagen.
- Inferencia en CPU gracias a la cuantizacion INT8 y la optimizacion de OpenVINO.
- Integracion con la libreria Optimum Intel de Hugging Face para pipelines de difusion.
- Compatibilidad con OpenVINO GenAI para despliegue sin dependencias de PyTorch.
- Ajuste de parametros de generacion como `num_inference_steps`, `guidance_scale` y semilla.
- Herencia de las capacidades de estilo artistico y composicion del SDXL original.

## Casos de uso

- Generacion de imagenes en servidores sin GPU: el modelo cuantizado puede ejecutarse en instancias cloud CPU-only, reduciendo costes de infraestructura para aplicaciones de generacion de contenido.
- Prototipado rapido en entornos corporativos: equipos de diseno pueden generar conceptos visuales desde un portatil con CPU moderna sin necesidad de estaciones de trabajo con GPU.
- Integracion en pipelines de automatizacion: mediante OpenVINO GenAI, el modelo puede incorporarse a servicios de generacion de imagenes con latencias aceptables en CPU.
- Sistemas de asistencia creativa: generacion de bocetos iniciales para ilustradores, disenadores graficos y equipos de marketing.
- Educacion e investigacion: permite experimentar con SDXL en entornos academicos sin acceso a hardware especializado.
- Despliegue en dispositivos edge: la cuantizacion INT8 y el formato IR hacen viable la ejecucion en mini-PCs o dispositivos con procesadores Intel de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de calidad de imagen (FID, CLIP score) ni de rendimiento (imagenes por segundo, latencia) para esta version cuantizada. Se recomienda consultar la documentacion de OpenVINO y pruebas internas para evaluar la degradacion respecto al modelo original.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada; puede ejecutarse en CPU con memoria RAM suficiente (8 GB minimo recomendado).
- GPU recomendadas: no es necesaria GPU; el modelo esta optimizado para CPU Intel con instrucciones AVX-512 y AVX2. En caso de usar GPU, cualquier GPU integrada Intel compatible con OpenVINO puede acelerar parcialmente.
- Compatibilidad con consumer GPU: no aplica directamente; la version OpenVINO IR no se ejecuta en CUDA sin conversion adicional.
- Opciones de despliegue: Optimum Intel (`OVDiffusionPipeline`), OpenVINO GenAI (`Text2ImagePipeline`), y cualquier framework que soporte OpenVINO IR.
- Latencia y throughput: no disponibles; dependen del hardware y del numero de pasos de inferencia.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stabilityai/stable-diffusion-xl-base-1.0 (original) | 3.5B | FP16 | PyTorch safetensors | OpenRAIL++ | Hugging Face |
| aishui8633/stable-diffusion-xl-base-1.0-int8-ov (este modelo) | 3.5B | INT8 | OpenVINO IR | OpenRAIL++ | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0-gguf | 3.5B | GGUF (Q4, Q5, Q8) | GGUF | OpenRAIL++ | Hugging Face |

La principal diferencia frente al original es el formato de pesos y la cuantizacion: OpenVINO IR con INT8 esta pensado para CPU Intel y entornos optimizados con OpenVINO, mientras que la version GGUF apunta a llama.cpp y CPU en general. La version original en FP16 ofrece la maxima calidad pero requiere GPU con al menos 8-10 GB de VRAM.

## Limitaciones y advertencias

- La cuantizacion INT8 puede producir una ligera degradacion en la calidad de imagen frente a la version FP16, especialmente en detalles finos y texturas complejas.
- El modelo no incluye el refiner de SDXL, por lo que la calidad final puede ser inferior a la de pipelines que combinan base y refiner.
- La licencia OpenRAIL++ restringe usos malintencionados, como generacion de contenido ilegal o danino, y exige cumplir las condiciones de uso de Stability AI.
- No se proporcionan garantias de rendimiento ni soporte tecnico por parte de Intel para este repositorio especifico.
- Los idiomas soportados no estan documentados; el modelo original funciona mejor con prompts en ingles.
- El repositorio no incluye el codigo fuente del modelo ni los datos de entrenamiento; es exclusivamente una conversion cuantizada.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/aishui8633/stable-diffusion-xl-base-1.0-int8-ov
- Modelo original de Stability AI: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Repositorio de referencia de OpenVINO con el mismo modelo: https://huggingface.co/OpenVINO/stable-diffusion-xl-base-1.0-int8-ov
- Documentacion de OpenVINO IR: https://docs.openvino.ai/2025/documentation/openvino-ir-format.html
- Guia de optimizacion de pesos de OpenVINO: https://docs.openvino.ai/2025/openvino-workflow/model-optimization-guide/weight-compression.html
- Documentacion de Optimum Intel: https://huggingface.co/docs/optimum/intel/index
- Repositorio de OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
