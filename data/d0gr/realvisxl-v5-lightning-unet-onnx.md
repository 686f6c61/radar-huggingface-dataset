# d0gr/realvisxl-v5-lightning-unet-onnx

## Resumen

Este repositorio contiene una exportación en formato ONNX del componente UNet del checkpoint de Stable Diffusion XL **RealVisXL V5.0 Lightning**, realizada por el usuario `d0gr` con el objetivo de permitir inferencia de generación de imágenes directamente en el navegador mediante WebGPU y la librería `onnxruntime-web`. El modelo base, desarrollado por SG161222, es un ajuste fino de SDXL especializado en fotorrealismo, destilado con la técnica Lightning para generar imágenes de alta calidad en tan solo 4-6 pasos de muestreo con un CFG bajo.

El repositorio no aloja el modelo completo: solo incluye el UNet (el componente de difusión principal), mientras que los text encoders y el VAE se reutilizan desde otro repositorio del mismo autor (`d0gr/sdxl-lightning-onnx-webgpu`), ya que se considera que están dentro del ruido fp16 respecto al SDXL original. El UNet se ofrece en dos variantes de perfil de entrada/salida (fp32 y fp16) con pesos compartidos, y está pensado para integrarse en la extensión de navegador "Generate AI Images".

La relevancia de este modelo radica en que facilita el despliegue de generación de imágenes fotorrealistas en entornos cliente sin necesidad de servidores GPU, aprovechando la aceleración WebGPU. Es un ejemplo de optimización para inferencia en el borde, aunque requiere que el usuario disponga de los componentes adicionales del pipeline para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de Stable Diffusion XL (SDXL) en formato ONNX |
| Parametros totales | no disponible (el UNet de SDXL tiene aproximadamente 2.6 mil millones, pero no se indica en la ficha) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | fp16 (pesos), fp32 en I/O (perfil validado) |
| Idiomas soportados | no disponible (el modelo base acepta prompts en ingles principalmente) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | ONNX (archivos `.onnx` y `.onnx_data`) |

## Arquitectura y entrenamiento

El UNet de SDXL es una arquitectura de difusion basada en transformers con atencion cruzada, que procesa latentes de imagen a resolucion de 1024x1024 junto con embeddings de texto de 77 tokens y condiciones adicionales (time_ids). El checkpoint base RealVisXL V5.0 Lightning fue entrenado por SG161222 a partir de SDXL, con un ajuste fino orientado a fotorrealismo y posteriormente destilado con la tecnica Lightning, que reduce el numero de pasos de muestreo necesarios (de 20-30 a 4-6) mediante destilacion de consistencia. El export ONNX se realizo con las herramientas del repositorio `generate-ai-images`, y el perfil de I/O se retargeteo para ser compatible con WebGPU. La model card indica que una pasada del UNet coincide con el checkpoint torch fp16 con una similitud coseno de 1.000000, lo que confirma la fidelidad de la conversion.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de prompts de texto (requiere los text encoders y VAE del pipeline SDXL).
- Inferencia en navegador mediante WebGPU y `onnxruntime-web`, sin servidor dedicado.
- Soporte de muestreo con pocos pasos (4-6) y CFG bajo (1-2) gracias a la destilacion Lightning.
- Dos perfiles de I/O: fp32 (validado en WebGPU) y fp16 (referencia original).
- No incluye capacidades de tool calling, agentes ni razonamiento multimodal; es exclusivamente un componente de generacion de imagenes.

## Casos de uso

- Generacion de imagenes en aplicaciones web: integrar el UNet en una extension de navegador o pagina web que permita a los usuarios crear imagenes fotorrealistas sin enviar datos a un servidor, gracias a la inferencia local con WebGPU.
- Prototipado rapido de herramientas de diseno: disenadores y desarrolladores pueden incorporar generacion de imagenes en tiempo real en editores basados en navegador, con latencia reducida al ejecutarse en la GPU del cliente.
- Educacion y demostraciones interactivas: servir como ejemplo de despliegue de modelos de difusion en el borde, mostrando como exportar y optimizar un UNet para ONNX y WebGPU.
- Generacion de imagenes en entornos con restricciones de privacidad: al procesar los datos localmente, se evita enviar prompts o imagenes a servicios externos, util en aplicaciones corporativas o sensibles.
- Creacion de contenido para juegos y realidad virtual: los desarrolladores pueden generar texturas o conceptos artisticos directamente en el navegador del usuario, reduciendo la carga del servidor.
- Evaluacion de modelos de difusion en hardware variado: al ser un componente ligero (solo UNet), permite probar el rendimiento de RealVisXL V5.0 Lightning en diferentes GPUs de consumidores a traves de WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es la coincidencia coseno de 1.000000 entre la salida del UNet ONNX y el checkpoint torch fp16, lo que valida la correccion de la conversion pero no aporta datos de rendimiento en tareas de generacion de imagenes (como FID o CLIP score).

## Requisitos de hardware

- Inferencia en navegador: requiere un navegador compatible con WebGPU (Chrome, Edge, Firefox nightly, etc.) y una GPU con soporte WebGPU.
- VRAM estimada: no disponible; dependera de la resolucion de salida y del perfil de I/O. Para 1024x1024, el UNet de SDXL en fp16 consume aproximadamente 5-6 GB de VRAM, pero en WebGPU la gestion de memoria puede variar.
- GPU recomendadas: cualquier GPU integrada o discreta que soporte WebGPU; se recomienda al menos 8 GB de VRAM para resoluciones altas.
- Opciones de despliegue: onnxruntime-web en el navegador, integrado en la extension "Generate AI Images" (https://github.com/d0gr/generate-ai-images).
- Latencia y throughput: no disponibles; dependen del hardware del cliente y de la resolucion de salida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d0gr/realvisxl-v5-lightning-unet-onnx | UNet ONNX para WebGPU | no disponible (UNet SDXL ~2.6B) | no aplica | openrail++ | ONNX, solo UNet |
| SG161222/RealVisXL_V5.0_Lightning | Checkpoint completo SDXL | ~2.6B (UNet) + encoders + VAE | no aplica | openrail++ | safetensors, PyTorch |
| stabilityai/stable-diffusion-xl-base-1.0 | Checkpoint base SDXL | ~2.6B (UNet) | no aplica | openrail++ | safetensors, PyTorch |

La comparativa directa con otros modelos de difusion en formato ONNX para WebGPU es limitada; este repositorio destaca por ofrecer unicamente el UNet optimizado para el navegador, mientras que alternativas como el SDXL base requieren conversion adicional. El modelo base RealVisXL V5.0 Lightning ofrece mejor fotorrealismo que el SDXL base, pero no esta disponible en formato ONNX para WebGPU de forma nativa.

## Limitaciones y advertencias

- El repositorio contiene solo el UNet; sin los text encoders y VAE (disponibles en el repositorio `d0gr/sdxl-lightning-onnx-webgpu`) el modelo no es funcional de forma autonoma.
- La licencia CreativeML Open RAIL++-M incluye restricciones de uso (Attachment A), que limitan aplicaciones ilegales o daninas, y no permite ciertos usos comerciales sin cumplir condiciones especificas.
- El modelo base puede generar contenido NSFW (segun la pagina de Civitai), lo que puede ser inapropiado para entornos profesionales sin moderacion.
- La inferencia en WebGPU depende de la implementacion del navegador; puede haber diferencias de rendimiento y compatibilidad entre navegadores y sistemas operativos.
- No se proporcionan datos de sesgos o alucinaciones especificos; como modelo de difusion, puede producir artefactos o distorsiones en imagenes complejas, especialmente con prompts ambiguos.
- La destilacion Lightning reduce el numero de pasos pero puede sacrificar calidad en algunos escenarios comparado con el checkpoint completo de RealVisXL V5.0 (no Lightning).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/d0gr/realvisxl-v5-lightning-unet-onnx
- Modelo base: https://huggingface.co/SG161222/RealVisXL_V5.0_Lightning
- Repositorio de la extension Generate AI Images: https://github.com/d0gr/generate-ai-images
- Repositorio de componentes compartidos (text encoders y VAE): https://huggingface.co/d0gr/sdxl-lightning-onnx-webgpu
- Pagina del modelo en Civitai: https://civitai.com/models/139562/realvisxl-v50
- Sitio web de RealVisXL: https://realvisxl.com/
