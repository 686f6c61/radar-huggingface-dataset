# Patil/Krea-2-depth-controlnet

## Resumen

Krea-2 Depth ControlNet-LoRA es un adaptador de control de profundidad para el modelo de generación de imágenes Krea-2, desarrollado por Patil (Tanmay Patil) en colaboración con otros autores. El modelo extrae un mapa de profundidad inversa de una imagen de entrada mediante Depth-Anything-V2-Large y lo utiliza como condición estructural para generar una nueva imagen que mantiene la misma composición 3D pero con el contenido y estilo indicados por el prompt. Está entrenado sobre el checkpoint base Krea-2-Raw y es compatible tanto con la versión Raw (28-52 pasos, CFG 3.5) como con la versión Turbo destilada (8 pasos, sin CFG).

El adaptador se distribuye como un único archivo LoRA de 862 MB con rango 64 y una proyección de entrada expandida, que se aplica sobre los 28 bloques del DiT de Krea-2. La condición de profundidad se inyecta concatenando el latent de profundidad codificado con el VAE de Qwen-Image al latent ruidoso en cada paso de denoising, siguiendo la misma receta que Flux.1-Depth-dev-lora. La consistencia de profundidad medida por correlación de Pearson alcanza 0.98 sin prompt y 0.99 con prompts, lo que lo convierte en una opción práctica para tareas de reiluminación, reestilización o edición estructural de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet-LoRA sobre DiT de Krea-2 (flow-matching) |
| Parametros totales | no disponible (archivo LoRA de 862 MB, rango 64) |
| Parametros activos | no disponible (LoRA, no MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de imagen, prompts en inglés en ejemplos) |
| Licencia | krea-2-community-license (https://www.krea.ai/krea-2-licensing) |
| Formato de pesos | safetensors (depth-control-lora.safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de control de profundidad para el DiT de Krea-2, un modelo de difusión basado en flow-matching. La arquitectura de control sigue el esquema de Flux.1-Depth-dev-lora: el mapa de profundidad inversa se codifica con el mismo VAE de Qwen-Image que se usa para las imágenes, y el latent resultante se concatena canal-wise al latent ruidoso en cada paso de denoising, expandiendo la dimensión de cada token de 64 a 128 canales. La proyección de entrada expandida y el LoRA de rango 64 sobre los 28 bloques del DiT están incluidos en el checkpoint.

El entrenamiento se realizó sobre el checkpoint Krea-2-Raw, dejando el modelo base congelado. El adaptador funciona también sobre Krea-2-Turbo, la versión destilada de 8 pasos, sin necesidad de reentrenamiento. La extracción de profundidad se hace con Depth-Anything-V2-Large, que produce un mapa de profundidad inversa (blanco = cercano). El pipeline de inferencia incluye un acondicionador Qwen3-VL, el VAE, el estimador de profundidad y un muestreador de flow-matching con inyección de control. No se han publicado detalles sobre el dataset de entrenamiento ni el número de tokens o imágenes utilizadas.

## Capacidades

- Generación de imágenes condicionada por profundidad: mantiene la estructura 3D de la imagen de entrada mientras cambia contenido, estilo o iluminación según el prompt.
- Control de fuerza de adherencia estructural mediante el parámetro `--lora-scale` (por defecto 1.0; valores inferiores relajan la estructura, superiores la refuerzan con cierta pérdida de calidad).
- Generación sin prompt: si se omite el texto, el mapa de profundidad es la única señal de control, logrando una consistencia de profundidad de 0.98 (correlación de Pearson).
- Compatibilidad con dos bases: Krea-2-Raw (28-52 pasos, CFG 3.5) y Krea-2-Turbo (8 pasos, sin CFG), lo que permite elegir entre calidad y velocidad.
- Integración con ComfyUI mediante la guía oficial (comfyui-krea2-controlnet).
- API Python sencilla a través de la clase `DepthLoRAPipeline`, que encapsula todo el flujo: carga del LoRA, extracción de profundidad, codificación y muestreo.

## Casos de uso

- Reestilización de escenas fotográficas: dado un render o fotografía con perspectiva real, se puede cambiar el estilo (por ejemplo, de foto realista a ilustración o a escena de ciencia ficción) manteniendo la composición y las relaciones espaciales. El flujo sería: cargar la imagen, extraer profundidad con Depth-Anything-V2, aplicar el LoRA con un prompt descriptivo y ajustar `--lora-scale` para controlar cuánta estructura se conserva.
- Generación de variantes de producto para catálogos: una imagen de un objeto (mueble, vehículo, electrodoméstico) puede transformarse en diferentes acabados o colores sin alterar la geometría. El control de profundidad garantiza que las proporciones y la perspectiva se mantienen, lo que facilita la creación de múltiples versiones de un mismo producto.
- Creación de fondos para videojuegos o entornos virtuales: a partir de un boceto o una foto de referencia, se puede generar un fondo detallado con la misma estructura espacial, cambiando la ambientación (de día a noche, de bosque a ciudad) mediante el prompt. La resolución se limita a ~1MP, suficiente para assets de juego de baja escala.
- Edición arquitectónica: una fotografía de un edificio o interior puede reiluminarse o cambiar su decoración manteniendo la estructura arquitectónica. El mapa de profundidad preserva las líneas y la perspectiva, lo que resulta útil para visualizar reformas o cambios de mobiliario.
- Aumento de datos para visión artificial: se pueden generar múltiples versiones de una misma escena con diferentes texturas, colores o condiciones de iluminación, manteniendo la geometría. Esto permite crear datasets sintéticos etiquetados con la misma estructura 3D, útil para entrenar modelos de detección o segmentación.
- Prueba de concepto para control estructural: el modo sin prompt (solo profundidad) permite evaluar cuánta información estructural transporta el adaptador de forma aislada, útil para depurar pipelines o calibrar la fuerza del control antes de añadir texto.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (FID, CLIP score, etc.), pero sí reporta una métrica de consistencia de profundidad medida como correlación de Pearson entre el mapa de profundidad de entrada y el de la imagen generada:

| Condicion | Correlacion de Pearson |
|---|---|
| Sin prompt (solo profundidad) | 0.98 |
| Con prompts | 0.99 |

No se han publicado resultados comparativos con otros modelos de control de profundidad en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM en la model card.
- El archivo LoRA pesa 862 MB, por lo que el overhead adicional sobre el modelo base es reducido.
- El modelo base Krea-2 (Raw o Turbo) es un DiT de flujo; para inferencia a ~1MP se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100) para operar cómodamente, aunque no hay datos oficiales.
- El pipeline incluye Depth-Anything-V2-Large, que también requiere VRAM adicional para la extracción de profundidad.
- Opciones de despliegue: el repositorio proporciona un script CLI (`inference.py`) y una API Python (`pipeline.py`). Para ComfyUI existe una guía de integración en https://github.com/facok/comfyui-krea2-controlnet.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Base | Consistencia de profundidad | Licencia |
|---|---|---|---|---|---|
| Krea-2 Depth ControlNet-LoRA | LoRA de control | 862 MB | Krea-2-Raw | 0.98-0.99 (Pearson) | krea-2-community-license |
| Flux.1-Depth-dev-lora | LoRA de control | no disponible | FLUX.1-dev | no disponible | FLUX.1-dev Non-Commercial License |
| ControlNet (depth) para SD/SDXL | ControlNet completo | ~1.4 GB (SD) | Stable Diffusion | no disponible | Apache 2.0 (SD) / openrail++ (SDXL) |

La model card indica que Krea-2 Depth ControlNet-LoRA sigue la misma receta que Flux.1-Depth-dev-lora, pero no se ofrecen comparaciones cuantitativas. La principal diferencia es que este adaptador está diseñado específicamente para Krea-2, mientras que Flux.1-Depth-dev-lora es para FLUX.1-dev. No hay datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Entradas planas: imágenes 2D sin perspectiva real (ilustraciones planas, gráficos) producen mapas de profundidad casi uniformes, lo que debilita el control estructural. La model card lo resume como "garbage in, garbage out".
- Resolución limitada: Krea-2-Raw genera hasta ~1K de resolución y las salidas se limitan a los buckets de ~1MP. No es adecuado para imágenes de alta resolución sin pasos adicionales de upscaling.
- Ajuste de `--lora-scale`: valores superiores a 1.0 refuerzan la adherencia estructural pero degradan la calidad de la imagen; valores inferiores a 1.0 dan más libertad creativa pero reducen la consistencia.
- Licencia restrictiva: la licencia krea-2-community-license puede limitar el uso comercial. Es necesario revisar los términos en https://www.krea.ai/krea-2-licensing antes de desplegar en producción.
- Dependencia de componentes externos: el pipeline requiere Depth-Anything-V2-Large y el VAE de Qwen-Image, lo que añade complejidad de instalación y dependencias adicionales.
- Sin garantías de rendimiento: no se publican benchmarks de calidad de imagen (FID, etc.), solo la métrica de consistencia de profundidad. El comportamiento en dominios muy diferentes a los ejemplos mostrados no está validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Patil/Krea-2-depth-controlnet
- Repositorio de Krea-2: https://github.com/krea-ai/krea-2
- Repositorio de control (inferencia): https://github.com/Tanmaypatil123/Krea-2-controlnet
- Guía de ComfyUI: https://github.com/facok/comfyui-krea2-controlnet
- Licencia Krea 2: https://www.krea.ai/krea-2-licensing
- Autores: @Tanmaypatil79, @Shauray7, @edwixxxx (X/Twitter)
