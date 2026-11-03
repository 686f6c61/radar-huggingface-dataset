# lwanming/sd-turbo-webnn

## Resumen

sd-turbo-webnn es una adaptacion del modelo generativo texto-a-imagen SD-Turbo de Stability AI, convertida al formato ONNX y optimizada especificamente para su ejecucion mediante WebNN, la API web de aceleracion de redes neuronales. El autor de la conversion es el usuario de HuggingFace lwanming, que publica el artefacto como un repositorio de 8,7 GB orientado a la inferencia en navegador. No se trata de un modelo nuevo: los pesos subyacentes son los de SD-Turbo, un destilado de Stable Diffusion 2.1 entrenado con destilacion adversarial de difusion (ADD) para generar imagenes fotorealistas en una sola evaluacion de red.

La relevancia de esta ficha reside en el empaquetado, no en la investigacion: convierte un modelo de difusion de aproximadamente 860 millones de parametros en un grafo ONNX con formas de entrada estaticas, eliminando operadores no utilizados para que WebNN pueda compilarlo de forma eficiente sobre GPUs y NPUs accesibles desde el navegador. Esto lo sitúa en el nicho de la generacion de imagenes on-device sin backend en la nube.

El modelo se distribuye sin licencia declarada en el campo correspondiente de HuggingFace, aunque la model card vincula explicitamente la licencia no comercial de investigacion de Stability AI. El repositorio no registra descargas ni likes y la model card indica `inference: false`, por lo que debe considerarse un artefacto experimental de demostracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion model (UNet + VAE + text encoder CLIP), destilado con Adversarial Diffusion Distillation |
| Parametros totales | no disponible (el modelo base SD 2.1 ronda los 865 M en la UNet; el dato exacto de esta conversion no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (texto de prompt codificado por CLIP; longitud maxima no especificada) |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el text encoder CLIP de SD 2.1 esta entrenado predominantemente en ingles) |
| Licencia | no declarada en HuggingFace; la model card remite a STABILITY AI NON-COMMERCIAL RESEARCH COMMUNITY LICENSE |
| Formato de pesos | ONNX con formas de entrada estaticas, optimizado para WebNN |
| Resolucion de salida | 512x512 pixeles (fija en la practica) |
| Pasos de inferencia | 1 a 4 (un solo paso suficiente para calidad alta) |
| Guidance scale | 0.0 (no usa classifier-free guidance ni negative prompt) |

## Arquitectura y entrenamiento

El modelo subyacente, SD-Turbo, es un destilado de Stable Diffusion 2.1 que emplea Adversarial Diffusion Distillation (ADD). Este metodo combina score distillation, usando el modelo difusion original de gran escala como senal profesora, con una perdida adversarial que preserva la fidelidad de la imagen en el regimen de uno o dos pasos de muestreo. El resultado es un modelo capaz de sintetizar imagenes en una unica evaluacion de red, frente a las decenas de pasos de los modelos de difusion convencionales. La arquitectura interna mantiene el esquema clasico de difusion latente: un text encoder CLIP, una UNet que opera en el espacio latente y un VAE para decodificar a pixeles.

La conversion a WebNN no altera los pesos ni el entrenamiento: aplica formas de entrada estaticas y elimina operadores del grafo ONNX que no se utilizan en el pipeline de inferencia, con el objetivo de reducir la sobrecarga de compilacion y ejecucion en el runtime de WebNN. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; esos detalles pertenecen al modelo original y no se reproducen en esta conversion.

## Capacidades

- Generacion texto-a-imagen fotorrealista en un solo paso de muestreo, con resolucion de 512x512 pixeles.
- Generacion imagen-a-imagen, con la restriccion de que `num_inference_steps * strength` sea mayor o igual a 1.
- Ejecucion en navegador mediante WebNN, con aceleracion por GPU o NPU cuando el runtime lo permite.
- Inferencia sin classifier-free guidance: no admite `negative_prompt` ni ajuste de `guidance_scale` distinto de 0.
- Generacion de arte conceptual, ilustracion y variaciones de imagen para prototipado rapido.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo puramente generativo de imagen.
- No dispone de capacidades de vision, audio ni comprension de documentos.

## Casos de uso

- Demostraciones interactivas en navegador: el modelo puede cargarse en una pagina web con WebNN y generar una imagen por prompt en una sola pasada, lo que permite experiencias de prueba sin instalar software ni enviar datos a un servidor.
- Prototipado de interfaces creativas: disenadores pueden iterar sobre conceptos visuales en tiempo real dentro de una aplicacion web, ajustando el prompt y viendo el resultado en menos de un segundo en hardware compatible.
- Educacion sobre modelos generativos: al ejecutarse localmente y con un grafo ONNX simplificado, sirve para explicar el funcionamiento de la difusion latente y de la destilacion adversarial en cursos y talleres.
- Investigacion sobre privacidad en generacion de imagen: al no requerir backend remoto, permite estudiar flujos donde el prompt y la imagen nunca abandonan el dispositivo del usuario.
- Generacion de assets de baja resolucion para maquetas: iconos, fondos y texturas de 512x512 px para prototipos de juegos o sitios web, aceptando la menor calidad frente a SDXL-Turbo.
- Pruebas de compatibilidad de WebNN: util para desarrolladores de navegadores y de drivers que necesitan un modelo de difusion realista para validar la compilacion y ejecucion de grafos ONNX en distintas plataformas.
- Filtrado y estudio de sesgos: investigadores pueden generar lotes controlados de imagenes y analizar la representacion de personas y escenas, aunque con las limitaciones de fidelidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 8,7 GB, lo que sugiere pesos en precision completa o mixta. En fp16 el modelo base SD-Turbo ocupa del orden de 2 a 3 GB, pero la conversion ONNX puede requerir mas memoria durante la compilacion.
- GPU recomendadas: no especificadas por el autor. Al ejecutarse via WebNN, depende del navegador y del backend grafico disponible (DirectML en Windows, Metal en macOS, Vulkan en Linux).
- Cabe en GPU de consumo: probablemente si, dado el tamano del modelo base, pero no hay confirmacion ni lista de GPUs validadas en la informacion disponible.
- Opciones de despliegue: WebNN a traves del runtime del navegador, usando la demo oficial de Microsoft (webnn-developer-preview). El formato ONNX tambien permite ejecucion con ONNX Runtime fuera del navegador, aunque esa ruta no esta documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Pasos | Licencia | Formato |
|---|---|---|---|---|---|
| sd-turbo-webnn | no disponible (base SD 2.1, ~865 M en UNet) | 512x512 | 1-4 | no comercial (referencia a Stability AI) | ONNX para WebNN |
| SDXL-Turbo (Stability AI) | no disponible en la informacion | 512x512 o superior | 1-4 | no comercial | safetensors, diffusers |
| SD-Turbo original (Stability AI) | ~865 M en UNet (dato no confirmado en la fuente) | 512x512 | 1-4 | no comercial | safetensors, diffusers |
| Stable Diffusion 2.1 (Stability AI) | no disponible en la informacion | 512x512 | decenas | CreativeML Open RAIL++-M | safetensors, diffusers |

La diferencia principal frente al SD-Turbo original es el empaquetado ONNX con formas estaticas y la orientacion a WebNN; en calidad y comportamiento generativo son equivalentes. Frente a SDXL-Turbo, el propio autor reconoce menor calidad y peor alineacion con el prompt.

## Limitaciones y advertencias

- La calidad y la alineacion con el prompt son inferiores a las de SDXL-Turbo, segun la propia model card.
- Resolucion fija de 512x512 pixeles y ausencia de fotorrealismo perfecto.
- Incapacidad para renderizar texto legible en las imagenes generadas.
- Las caras y las figuras humanas pueden generarse de forma incorrecta.
- La parte de autoencoding (VAE) es con perdida, lo que degrada detalles finos.
- No fue entrenado para representar hechos, personas o eventos reales; usarlo con ese fin queda fuera de alcance.
- Riesgo de sesgos sociales y demograficos heredados de los datos de entrenamiento de Stable Diffusion 2.1, no documentados en esta conversion.
- La licencia no esta declarada en el campo de HuggingFace y la model card remite a una licencia no comercial de investigacion; el uso comercial requiere consultar la membresia de Stability AI. Verificar antes de cualquier despliegue en produccion.
- La model card indica `inference: false` y circunscribe el uso a fines educativos o de prueba con la demo de Microsoft.
- El repositorio no registra descargas ni validacion de la comunidad; no hay garantias de mantenimiento ni de soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lwanming/sd-turbo-webnn
- Modelo original SD-Turbo: https://huggingface.co/stabilityai/sd-turbo
- Licencia de SD-Turbo: https://huggingface.co/stabilityai/sd-turbo/blob/main/LICENSE
- Politica de uso aceptable de Stability AI: https://stability.ai/use-policy
- Demo WebNN de Microsoft: https://microsoft.github.io/webnn-developer-preview/
- Stable Diffusion 2.1: https://huggingface.co/stabilityai/stable-diffusion-2-1
- SDXL-Turbo: https://huggingface.co/stabilityai/sdxl-turbo
- Repositorio generative-models: https://github.com/Stability-AI/generative-models
- Informe tecnico de Adversarial Diffusion Distillation: https://stability.ai/research/adversarial-diffusion-distillation
- Demo de SDXL-Turbo en Clipdrop: http://clipdrop.co/stable-diffusion-turbo
- Membresia comercial de Stability AI: https://stability.ai/membership
