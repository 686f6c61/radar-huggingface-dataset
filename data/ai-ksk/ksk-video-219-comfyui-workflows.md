# AI-KSK/ksk-video-219-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-219-comfyui-workflows` no es un modelo de IA propiamente dicho, sino un repositorio de notas tutoriales que acompaña a un episodio sobre Anima Preview 3. El autor, AI-KSK, publica en este espacio las notas escritas de los cuatro grafos de ComfyUI que se muestran en el vídeo: text-to-image, image-to-image, repintado parcial (inpainting con máscara) y upscale por teselas. El repositorio no redistribuye pesos del modelo; solo contiene el `README.md` con la documentación.

El modelo subyacente es Anima Preview 3, un modelo de difusión texto-a-imagen orientado a ilustración anime. La pila técnica se compone de un UNET (`anima-preview3-base.safetensors`), un text encoder basado en Qwen 3 de 0,6 mil millones de parámetros (`qwen_3_06b_base.safetensors`, cargado con tipo `stable_diffusion`) y un VAE de Qwen Image (`qwen_image_vae.safetensors`). Según las notas, Preview 3 actualiza únicamente el modelo base: VAE y text encoder son idénticos a los de Preview 2.

La relevancia de este repositorio es práctica: documenta valores concretos de muestreo (pasos, CFG, denoise, sampler y scheduler) que sirven como punto de partida reproducible para quien quiera montar los flujos en ComfyUI. No obstante, se trata de un modelo en fase de preview, con limitaciones de resolución declaradas por el propio autor y sin métricas de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (UNET + text encoder Qwen 3 0.6B + VAE Qwen Image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | safetensors (UNET, text encoder y VAE referenciados en las notas) |

## Arquitectura y entrenamiento

La información disponible describe la pila de componentes, no la arquitectura interna del UNET ni su proceso de entrenamiento. Se sabe que el modelo se compone de tres piezas: un UNET (`anima-preview3-base.safetensors`), un text encoder Qwen 3 de 0,6B cargado con tipo `stable_diffusion` y un VAE de Qwen Image. La actualización de Preview 2 a Preview 3 afecta solo al UNET; el codificador de texto y el VAE permanecen sin cambios.

No se han publicado en la información proporcionada datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). Las notas mencionan que parte de los artefactos en manos es un problema de entrenamiento, lo que sugiere que el dataset de ilustraciones anime tiene carencias en esa zona anatómica.

## Capacidades

- Generación de imágenes texto-a-imagen con estética anime, mediante el grafo text-to-image (30 pasos, CFG 3, denoise 1, latente 896x1088, aproximadamente 0,82 MP).
- Image-to-image con factor de escala 1,0293, 30 pasos, CFG 3 y denoise 0,73.
- Repintado parcial (inpainting) mediante máscara combinada con DifferentialDiffusion, 30 pasos y CFG 3.
- Upscale por teselas con el modelo `4x_NMKD-Siax_200k`, 25 pasos, CFG 2 y denoise 0,3, orientado a salidas de unos 4 MP.
- Muestreo con sampler `linear/euler`, scheduler `beta57` y eta entre 0,35 y 0,5.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, ya que es un modelo de difusión de imagen.

## Casos de uso

- Ilustración anime para prototipado rápido: el grafo text-to-image con latente 896x1088 y 30 pasos permite generar bocetos de personaje en una sola pasada, útil para explorar direcciones visuales antes de encargar arte final.
- Retoque de ilustraciones existentes: el grafo image-to-image con denoise 0,73 y factor de escala 1,0293 sirve para reestilizar o corregir una imagen de partida manteniendo su composición.
- Corrección localizada de zonas: el repintado parcial con máscara y DifferentialDiffusion permite sustituir manos, rostros o fondos sin regenerar la imagen completa, lo que ahorra cómputo y preserva el resto del encuadre.
- Preparación de assets para impresión o web: el upscale por teselas con `4x_NMKD-Siax_200k` a 4 MP permite ampliar una salida de baja resolución para su uso en banners, portadas o láminas, aunque el autor advierte que la calidad cae alrededor de 2 MP.
- Docencia y reproducción de flujos ComfyUI: los JSON y las tablas de valores (pasos, CFG, denoise, sampler, scheduler) permiten a otros usuarios replicar exactamente los grafos del episodio y comparar resultados.
- Generación de variaciones controladas en pipelines de contenido: combinando text-to-image e image-to-image se pueden producir familias de imágenes coherentes de un mismo personaje para cómics, storyboards o assets de videojuego.
- Integración en entornos alojados: los enlaces a RunningHub permiten ejecutar los cuatro grafos sin montar infraestructura local, útil para pruebas puntuales o demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifican requisitos de memoria en las notas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se indica si cabe en tarjetas tipo RTX 4090 o inferiores.
- Opciones de despliegue: ComfyUI es el entorno de referencia (los cuatro grafos son JSON de ComfyUI). También se ofrecen ejecuciones alojadas en RunningHub para text-to-image, image-to-image, repintado parcial y upscale por teselas.
- Latencia y throughput: no disponibles. Solo se conocen los parámetros de muestreo (30 pasos en tres grafos, 25 en el upscale) y el scheduler `beta57`, que influyen en el tiempo por imagen pero no permiten estimar cifras sin hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anima Preview 3 (este) | no disponible | no disponible | sin benchmarks publicados | other | safetensors vía ComfyUI y RunningHub |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables (por ejemplo, otros modelos de difusión orientados a anime) con parámetros, contexto, rendimiento o licencia verificables, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo en fase preview: el propio autor lo etiqueta como tal y el grafo de repintado parcial se describe explícitamente como "forward-looking", es decir, no consolidado.
- Calidad degradada a partir de aproximadamente 2 MP; se recomienda trabajar por debajo de 1,5 MP.
- Artefactos en manos: el autor los atribuye en parte a una carencia del entrenamiento, no solo al muestreo.
- Idioma: las notas y el modelo están etiquetados únicamente para inglés (`en`); no se documenta soporte multilingüe de prompts.
- Licencia `other`: no se detallan los términos exactos, por lo que el uso comercial requiere revisar las condiciones del modelo original Anima Preview 3 y de los componentes (Qwen 3 0.6B, VAE de Qwen Image) antes de desplegarlo en producción.
- El repositorio no redistribuye pesos: solo contiene notas y JSON de flujos; quien quiera ejecutarlo debe obtener los safetensors por su cuenta.
- Sin métricas de rendimiento ni benchmarks publicados, no es posible validar calidad frente a alternativas de forma objetiva.
- Riesgo de alucinación visual (anatomía incorrecta, detalles incoherentes) inherente a los modelos de difusión, agravado en este caso por la fase preview y por la resolución limitada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-219-comfyui-workflows
- Grafo text-to-image en RunningHub: https://www.runninghub.ai/post/2042205608601985025/?inviteCode=rh-v1111
- Grafo image-to-image en RunningHub: https://www.runninghub.ai/post/2042205599336763393/?inviteCode=rh-v1111
- Grafo de repintado parcial en RunningHub: https://www.runninghub.ai/post/2042205589152997377/?inviteCode=rh-v1111
- Grafo de upscale por teselas en RunningHub: https://www.runninghub.ai/post/2042211302168338434/?inviteCode=rh-v1111
- Vídeo en YouTube: https://www.youtube.com/watch?v=L1Y2EPuuhoU
- Vídeo en Bilibili: https://www.bilibili.com/video/BV1EpDxBcEz4
