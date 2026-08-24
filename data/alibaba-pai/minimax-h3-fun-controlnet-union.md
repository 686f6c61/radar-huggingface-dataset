# alibaba-pai/MiniMax-H3-Fun-Controlnet-Union

## Resumen

MiniMax-H3-Fun-Controlnet-Union es un adaptador de tipo ControlNet-Union desarrollado por Alibaba PAI para el generador de video MiniMax-H3, entrenado con la pipeline VideoX-Fun. Un único checkpoint permite condicionar la generación de video mediante señales de control de Canny, Depth, HED, MLSD o Pose, además de soportar video inpainting, sin necesidad de cambiar de rama de control según el tipo de condición. El archivo contiene únicamente la rama de control (control_proj_in y 5 control_blocks, unos 6,8 GB) y se carga sobre el transformer base MiniMax-H3.

El modelo resuelve el problema de control geométrico y estructural en la generación de video, un paso clave para aplicaciones de video-to-video con fidelidad al contenido de entrada. Es relevante porque integra múltiples modalidades de control en un solo adaptador, simplifica el flujo de trabajo y está optimizado para inferencia sin classifier-free guidance (guidance distilled), lo que reduce el coste computacional por paso.

El adaptador se adjunta a 5 de los 50 bloques del transformer (capas 0, 10, 20, 30 y 40) mediante proyecciones con zero-gating. La generación sigue el video de control en resolución, duración (máximo 15 segundos) y relación de aspecto, con una velocidad fija de 24 fps. La licencia es la MiniMax-H3 Community License Agreement, que permite uso comercial bajo condiciones específicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet-Union sobre transformer de video MiniMax-H3 |
| Parametros totales | No disponible (el repo contiene solo la rama de control, ~6,8 GB) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors) |
| Idiomas soportados | No disponible (el prompt de texto probablemente en inglés, no especificado) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniMax-H3-Fun-Controlnet-Union es un ControlNet-Union entrenado con la pipeline VideoX-Fun sobre el modelo base MiniMax-H3. La rama de control consta de `control_proj_in` y 5 `control_blocks` que se insertan en las capas 0, 10, 20, 30 y 40 del transformer (de un total de 50). Cada salida de control se añade a la rama principal mediante proyecciones zero-gated, lo que permite que el adaptador no afecte al modelo base durante el entrenamiento hasta que los pesos se activan.

El modelo está optimizado con guidance distillation: durante la inferencia se usa `guidance_scale = 1.0` y una sola pasada forward por paso, sin necesidad de classifier-free guidance. Esto reduce el coste computacional y simplifica el proceso de generación. Para el video inpainting, la entrada de control se amplía a `control_in_dim = 49` (latente + latente enmascarado + canales de máscara). No se han publicado detalles sobre el dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de video condicionada por señales de control: Canny, Depth, HED, MLSD y Pose.
- Video inpainting: permite modificar o eliminar objetos en un video manteniendo el contexto.
- Video-to-video con control geométrico: el video de control dicta la composición y la estructura.
- Text-to-video y image-text-to-video: compatible con el pipeline de VideoX-Fun.
- Control de intensidad mediante `control_context_scale`: valores entre 0 y 1 ajustan la fuerza de la señal de control.
- Sin necesidad de classifier-free guidance: inferencia con un solo forward pass por paso.
- La generación sigue el video de control en duración (máximo 15 segundos), resolución (múltiplos de 32) y relación de aspecto, con 24 fps fijos.

## Casos de uso

- Postproducción de video: aplicar estilos artísticos manteniendo la estructura del video original mediante control de profundidad o bordes (Canny, Depth).
- Animación de personajes: usar control de pose para generar secuencias de danza o movimiento a partir de un video de referencia, ideal para producción de animación.
- Eliminación de objetos: video inpainting para borrar elementos no deseados (personas, logos, vehículos) manteniendo la coherencia temporal.
- Generación de video a partir de storyboards: control MLSD para crear escenas arquitectónicas o urbanas con líneas estructurales definidas.
- Restauración de video antiguo: aplicar control de bordes y profundidad para reconstruir escenas con mejor calidad visual.
- Creación de contenido para marketing: generar variaciones de un video base con diferentes estilos (canny, depth, pose) sin rehacer el contenido desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación proporcionada.
- El checkpoint de control pesa 6,8 GB, pero el modelo base MiniMax-H3 debe cargarse por separado y no se indica su tamaño exacto.
- Para generar videos de hasta 15 segundos con un transformer de 50 capas, se requiere probablemente una GPU de alta gama (A100 80 GB, H100) o un sistema con múltiples GPUs.
- En GPUs de consumo (RTX 4090) podría ser viable solo para secuencias cortas y con cuantización, pero no hay datos confirmados.
- Opciones de despliegue: la inferencia se realiza mediante el repositorio VideoX-Fun, con scripts específicos (`predict_v2v_control.py`, `predict_v2v_control_inpaint.py`). No se menciona soporte en vLLM, llama.cpp u Ollama, ya que es un modelo de difusión, no un LLM.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos para ControlNet de video con estas características en la información proporcionada. El modelo Z-Image-Turbo-Fun-Controlnet-Union, también de Alibaba PAI, es similar pero orientado a imágenes, no a video.

## Limitaciones y advertencias

- El modelo solo incluye la rama de control; requiere el modelo base MiniMax-H3 descargado por separado para funcionar.
- La generación se limita a 15 segundos de duración, y el número de frames se ajusta a `17 * n + 5` (múltiplos de la VAE).
- La resolución debe ser múltiplo de 32, y la relación de fot se hereda del video de control, lo que puede restringir la creatividad en la composición.
- La licencia `minimax-h3-community-license-agreement` puede tener restricciones de uso comercial; revisar los términos antes de producción.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en escenarios de bajo contexto.
- El control es eficaz con prompts detallados; con prompts vagos, la estabilidad puede degradarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union
- Repositorio VideoX-Fun: https://github.com/aigc-apps/VideoX-Fun
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- GitHub de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
