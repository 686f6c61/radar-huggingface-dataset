# akhaliq/MOSS-Image-IDM-2-Steps

## Resumen

MOSS-Image-IDM-2-Steps es un adaptador LoRA para el modelo text-to-image MOSS-Image-SFT de OpenMOSS-Team, entrenado por el usuario akhaliq de HuggingFace mediante una implementación comunitaria del método Intrinsic Distribution Matching (IDM). Su objetivo es reducir drásticamente el coste de inferencia: mientras el modelo base requiere 50 pasos con CFG (100 evaluaciones del DiT para una imagen de 1024²), este adaptador genera la misma imagen en solo 2 evaluaciones de red, sin necesidad de classifier-free guidance. Es, según el autor, el primer modelo abierto entrenado con la combinación de pérdidas de IDM (el repositorio oficial es solo de inferencia) y el primer modelo MOSS-Image entrenado específicamente para 2 pasos.

El entrenamiento se realizó en unas 2 horas sobre una única GPU H200, con solo 1000 iteraciones y 249 prompts densos en texto, partiendo del adaptador de 4 pasos de darask0. A pesar del coste mínimo, el modelo mantiene una característica destacada de la familia MOSS-Image: la renderización legible de texto en inglés y chino, útil para carteles, cómics, caligrafía y composiciones editoriales. Está publicado bajo licencia Apache-2.0 e incluye scripts de inferencia, soporte ComfyUI vía nodo personalizado y todos los checkpoints intermedios del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre DiT (MOSS-Image-SFT) con sampler en espacio de datos |
| Parametros totales | no disponible (modelo base MOSS-Image-SFT no publicado en la ficha) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base bf16 recomendado (INT8/FP8/GGUF sin testear con este adaptador); LoRA y ruta temporal en fp32 |
| Idiomas soportados | Ingles y chino (renderizacion de texto); prompts en ambos idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (lora.safetensors, time_embedding.safetensors, dataspace.safetensors) |

## Arquitectura y entrenamiento

El adaptador sigue el método Intrinsic Distribution Matching (arXiv:2610.39633), una alternativa a la destilación adversarial que no usa discriminador ni pérdidas adversariales. Combina tres componentes: una red fake-score entrenada con flow matching sobre muestras generadas, la dirección DMD `sg[v_real − v_fake]`, y una pérdida de emparejamiento de momentos de características (L_pop, λ=0.5) entre los tokens de imagen del último bloque y una referencia del modelo profesor, gestionada mediante colas FIFO y EMA.

El linaje de destilación es notable: MOSS-Image-SFT (50 pasos, CFG 3) → adaptador de 8 pasos de lodestones (DMD en espacio de datos, 2600 updates) → adaptador de 4 pasos de darask0 (DMAD, 500 iteraciones) → este adaptador de 2 pasos (IDM, 1000 iteraciones). Se partió del adaptador de 4 pasos de darask0, restringido a 2 códigos de paso, y se entrenó con 249 prompts densos en texto del dataset moss-textboost-data, EMA 0.998, durante unas 2 horas en 1×H200. El checkpoint publicado es el export EMA de la iteración 750, seleccionado por evaluación comparativa. Desviaciones respecto al paper original: el generador base es el de punto fijo en espacio de datos (arXiv:2610.12102) en lugar de RCGM, se usa LoRA r128 en lugar de ajuste de parámetros completo, y se entrenó con 249 prompts en lugar de 5,6 millones de imágenes.

## Capacidades

- Generacion de imagenes a partir de texto en solo 2 evaluaciones de red, sin CFG
- Renderizacion legible de texto en ingles y chino (carteles, menus, caligrafia, comics)
- Generacion de comics, posters, ilustracion anime, fantasia, paisajes y composiciones editoriales (30 prompts de muestra incluidos en el repo)
- Resolucion de salida de 1024² pixeles
- Compatibilidad con el formato de adaptador de 3 archivos de darask0, reutilizable en ComfyUI mediante el nodo personalizado rapid-moss
- Reproducibilidad total del entrenamiento: script de entrenamiento, checkpoints, hojas de muestras cada 100 iteraciones y logs incluidos

## Casos de uso

- Generacion de carteles y menus con texto: al mantener la capacidad de renderizado de texto del modelo base, permite producir directamente composiciones con titulos y lineas de texto legibles, como el ejemplo del README con un menu de cafeteria.
- Prototipado rapido de imagenes: con solo 2 evaluaciones del DiT frente a las 100 del modelo base, es idoneo para exploracion interactiva de prompts en tiempo casi real.
- Comics e ilustracion secuencial: los showcases incluyen comics y caligrafia, aprovechando el soporte bilingue chino-ingles para contenido editorial.
- Integracion en pipelines ComfyUI: el formato de adaptador identico al de darask0 permite desplegarlo en flujos de trabajo existentes con el nodo rapid-moss sin cambios de wiring.
- Investigacion en destilacion de difusion: al ser la primera implementacion abierta entrenada con la combinacion de perdidas de IDM, sirve como base reproducible para experimentos con el metodo.
- Generacion economica a escala: el coste de inferencia 50 veces inferior al modelo base lo hace adecuado para generacion por lotes en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la informacion disponible. El unico dato cuantitativo de rendimiento publicado es la comparacion de coste de inferencia:

| Modelo | Evaluaciones DiT / imagen 1024² |
|---|---:|
| MOSS-Image-SFT (50 pasos, CFG 3) | 100 |
| Este adaptador (2 pasos, sin CFG) | 2 |

## Requisitos de hardware

- El entrenamiento se realizo en una unica NVIDIA H200 (~2 horas, 1000 iteraciones); para entrenamientos reproducibles se recomienda hardware equivalente (H100/H200 con ~80 GB de HBM).
- Para inferencia: no se publica una cifra exacta de VRAM, pero el modelo base debe ejecutarse en bf16 (los checkpoints INT8/FP8/GGUF no estan testeados con este adaptador), con los hooks de LoRA y la ruta temporal en fp32. Una GPU de gama alta con 24 GB o mas (RTX 4090, RTX 5090) es un punto de partida razonable; no disponible una medicion oficial.
- Despliegue en Python: diffusers>=0.38, transformers>=5.3, accelerate y safetensors, mediante el script inference.py incluido.
- Despliegue en ComfyUI: version master del 2026-10-16 o posterior, con el nodo personalizado rapid-moss (imprescindible: los nodos estandar no pueden aplicar el sampler en espacio de datos ni el reemplazo de la ruta temporal, y al fusionar el LoRA en bf16 se introduce un error relativo de ~81% segun mediciones de darask0).
- Latencia: no disponible una medicion exacta, aunque el coste de 2 evaluaciones de red frente a 100 implica una reduccion de tiempo de generacion de aproximadamente dos ordenes de magnitud respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Pasos | CFG | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT (base) | 50 | 3 | Flow matching completo | no disponible | OpenMOSS-Team, abierto |
| lodestones/MOSS-Image-SFT-8-steps-dmd | 8 | no disponible | DMD en espacio de datos (2600 updates) | no disponible | Abierto en HuggingFace |
| darask0/MOSS-Image_4-step_adapter_lora | 4 | 1 | DMAD (500 iters) | Apache-2.0 | Abierto en HuggingFace |
| akhaliq/MOSS-Image-IDM-2-Steps | 2 | 1 (sin CFG) | IDM (1000 iters, export EMA 750) | Apache-2.0 | Abierto, con trainer y logs |

## Limitaciones y advertencias

- El entrenamiento uso solo 249 prompts densos en texto, muy lejos de los 5,6 millones de imagenes del paper original de IDM; la generalizacion a dominios muy distintos de los prompts de entrenamiento puede ser limitada.
- Los checkpoints del modelo base en INT8/FP8/GGUF no estan testeados con este adaptador; debe usarse la version bf16 de MOSS-Image-SFT.
- El uso de nodos ComfyUI estandar degrada gravemente la calidad (~81% de error relativo al fusionar el LoRA en bf16) y no puede aplicar el sampler entrenado; el nodo rapid-moss es obligatorio para reproducir el generador entrenado.
- La seleccion del checkpoint (iteracion 750 de 1000) se hizo por evaluacion visual comparativa, no mediante metricas automatizadas.
- Es un trabajo comunitario ("ml-intern") sin respaldo oficial del equipo OpenMOSS para esta variante destilada.
- No hay datos de benchmarks de calidad de imagen (FID, etc.) publicados; la evaluacion se basa en hojas de muestras.
- La licencia Apache-2.0 no impone restricciones de uso comercial, pero conviene verificar la licencia del modelo base MOSS-Image-SFT y del codificador de texto Qwen3.5-9B para despliegues en produccion.

## Enlaces

- Modelo: https://huggingface.co/akhaliq/MOSS-Image-IDM-2-Steps
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Adaptador de 4 pasos previo: https://huggingface.co/darask0/MOSS-Image_4-step_adapter_lora
- Adaptador de 8 pasos: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Paper IDM (arXiv:2610.39633): https://huggingface.co/papers/2610.39633 / https://arxiv.org/abs/2610.39633
- Paper espacio de datos (arXiv:2610.12102): https://arxiv.org/abs/2610.12102
- Dataset de entrenamiento: https://huggingface.co/datasets/akhaliq/moss-textboost-data
- Modelos base para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image
