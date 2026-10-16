# skywalker33/removeit-inpaint-xl-mlx

## Resumen

removeit-inpaint-xl-mlx es una conversion al formato MLX de un modelo de difusion latente especializado en inpainting y eliminacion de objetos, orientada a ejecucion local sobre hardware de Apple. Lo publica el usuario skywalker33 (Joey R) en Hugging Face y parte del checkpoint GraydientPlatformAPI/inpainting-realvisxlInpainting_v5lightning, al que se le sustituye el VAE por la version SDXL fp16-fix de madebyollin (licencia MIT) para evitar artefactos numericos en precision media.

No es un modelo de lenguaje: es un U-Net de difusion derivado de Stable Diffusion XL (Stability AI) que trabaja sobre espacio latente a resolucion de 1024x1024 y se controla mediante mascaras binarias. La innovacion del repositorio no esta en el entrenamiento, sino en la distribucion: las capas lineales se han cuantizado a 6 bits con cuantizacion afina de MLX (group size 64) y el resto del grafo se mantiene en 16 bits, lo que reduce el peso total del repositorio a 3,5 GB.

Su relevancia actual es practica: permite hacer inpainting de calidad SDXL en Macs con memoria unificada sin depender de CUDA ni de servicios en la nube, algo interesante para flujos de retoque fotografico y eliminacion de objetos en local. El modelo es muy reciente (publicado en octubre de 2026 segun los metadatos) y no acumula aun descargas ni likes, por lo que su validacion por la comunidad es todavia nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente con U-Net, basada en Stable Diffusion XL |
| Parametros totales | no disponible (el autor no publica recuento; es una conversion de SDXL, no un reentrenamiento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; SDXL opera a 1024x1024 de resolucion) |
| Tipos de cuantizacion | 6 bits MLX affine con group size 64 en capas lineales; 16 bits en el resto del grafo |
| Idiomas soportados | no disponible (los text encoders CLIP de SDXL estan entrenados principalmente en ingles) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | MLX (repositorio de 3,5 GB) |

## Arquitectura y entrenamiento

El modelo es un U-Net de difusion latente con la arquitectura de Stable Diffusion XL, es decir, dos text encoders CLIP (ViT-L y ViT-bigG) que condicionan la generacion, un U-Net de denoising y un VAE que comprime y reconstruye la imagen. Al tratarse de una conversion de pesos y no de un entrenamiento nuevo, no hay datos publicados sobre volumen de tokens de imagen, composicion del dataset ni etapas de ajuste fino con RLHF o DPO.

Las particularidades tecnicas declaradas en la model card son tres: la conversion a MLX para ejecucion en Apple Silicon, la cuantizacion de 6 bits en las capas lineales (afina, group size 64) manteniendo el resto en 16 bits, y la sustitucion del VAE por el SDXL fp16-fix de madebyollin, que corrige la inestabilidad numerica del VAE original cuando se ejecuta en fp16. La model card no detalla el proceso de ajuste del checkpoint origen (realvisxlInpainting_v5lightning), que ya venia especializado en inpainting con mascaras.

## Capacidades

- Inpainting e imagen-a-imagen: rellena zonas enmascaradas de una imagen de forma coherente con el resto del contenido.
- Eliminacion de objetos: permite borrar elementos no deseados de una fotografia y reconstruir el fondo con una transicion natural entre la zona enmascarada y la no enmascarada.
- Generacion condicionada por prompt de texto: acepta descripciones textuales para guiar lo que se reconstruye en la mascara.
- Reconstruccion de bordes y texturas: hereda del entrenamiento especifico en inpainting la capacidad de generar transiciones suaves entre areas.
- Ejecucion local en Apple Silicon: compatible con el ecosistema MLX, sin necesidad de CUDA.
- Soporte de tool calling: no aplica, es un modelo de generacion de imagen, no un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; los prompts dependen de los text encoders CLIP de SDXL, orientados al ingles.
- Capacidades especiales: ninguna documentada mas alla del inpainting; no hay vision, audio ni modo de razonamiento.

## Casos de uso

- Retoque fotografico en local: un fotografo puede cargar una imagen en una app construida sobre MLX, enmascarar un objeto molesto y regenerar el fondo sin subir el archivo a ningun servicio externo, lo que preserva la privacidad del material.
- Eliminacion de marcas de agua o logotipos de material propio: sobre imagenes del usuario con mascara manual, el modelo reconstruye la zona afectada usando el contexto del entorno.
- Limpieza de catalogos de producto: eliminar elementos accidentales del fondo de fotografias de e-commerce (cables, reflejos, objetos sueltos) manteniendo la coherencia del estudio, en lotes procesados en un Mac del propio equipo.
- Restauracion de fotografias danadas: rellenar rasguños o zonas perdidas de imagenes antiguas mediante mascara, aprovechando la arquitectura SDXL para generar texturas plausibles.
- Prototipado de edicion de imagen en apps macOS/iOS: al estar en MLX, se puede integrar en aplicaciones nativas de Apple sin stack CUDA, reduciendo dependencias de despliegue.
- Generacion de variaciones controladas: usar imagen-a-imagen con una mascara parcial para cambiar un elemento concreto (color de una prenda, objeto de una escena) sin alterar el resto del encuadre.
- Pipelines de preprocesado de datasets: limpiar elementos no deseados de imagenes de entrenamiento antes de alimentar otros modelos, ejecutando la tarea en el propio puesto de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas FID, CLIP score ni comparativas cuantitativas con otros modelos de inpainting, y el repositorio no registra descargas ni evaluaciones de la comunidad.

## Requisitos de hardware

- Plataforma obligatoria: MLX requiere chip de Apple (series M1, M2, M3 o M4) con memoria unificada; no es compatible con CUDA ni con GPUs NVIDIA.
- Memoria estimada: el repositorio pesa 3,5 GB, por lo que la inferencia cabe holgadamente en equipos con 16 GB de memoria unificada, dejando margen para latentes, text encoders y el VAE.
- GPU recomendadas: no aplica (no hay soporte CUDA); el hardware objetivo son Apple Silicon, preferiblemente con 16 GB o mas de memoria unificada para trabajar comodamente a 1024x1024.
- Cabida en hardware de consumo: si, en Macs con 16 GB o mas; en equipos de 8 GB la viabilidad no esta documentada por el autor.
- Opciones de despliegue: MLX (libreria `mlx`), y previsiblemente integracion con el backend MLX de diffusers; no aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; el autor no publica tiempos de inferencia ni pasos de muestreo recomendados.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion / formato | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| removeit-inpaint-xl-mlx (este) | Inpainting SDXL | 6 bits MLX + 16 bits, formato MLX, 3,5 GB | Apple Silicon (MLX) | CreativeML Open RAIL++-M | Publico en Hugging Face, 0 descargas |
| GraydientPlatformAPI/inpainting-realvisxlInpainting_v5lightning | Inpainting SDXL (origen) | Pesos completos, formato diffusers | GPU (CUDA) | no disponible | Publico en Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Difusion SDXL general | Pesos completos, safetensors | GPU (CUDA) | CreativeML Open RAIL++-M | Publico en Hugging Face |
| LaMa (IOPaint) | Eliminacion de objetos no generativa | Modelo ligero especifico | CPU/GPU | no disponible | Distribuido dentro de IOPaint |

La diferencia principal frente al checkpoint origen es el formato y la cuantizacion: este repositorio prioriza ejecucion en Apple Silicon, mientras que el original esta pensado para GPUs. Frente a SDXL base, la ventaja es la especializacion en inpainting; frente a LaMa, la diferencia es que LaMa no es un modelo de difusion y no acepta condicionamiento por prompt de texto.

## Limitaciones y advertencias

- Riesgo de artefactos: la cuantizacion a 6 bits de las capas lineales puede degradar ligeramente la fidelidad de la reconstruccion respecto al checkpoint original en 16 bits; no hay evaluacion publicada al respecto.
- Alucinacion visual: como todo modelo de difusion, puede generar contenido incoherente o poco realista en la zona reconstruida si la mascara es muy grande o el prompt no es claro.
- Idiomas: los text encoders CLIP de SDXL estan orientados al ingles, por lo que los prompts en otros idiomas pueden funcionar peor; el campo de idiomas no esta especificado por el autor.
- Dependencia de plataforma: solo funciona en Apple Silicon mediante MLX; no es utilizable en servidores con GPU NVIDIA sin reconvertir el modelo.
- Licencia: CreativeML Open RAIL++-M incluye restricciones de uso (prohibicion de determinados usos daninos); conviene revisar el texto completo de la licencia antes de un despliegue comercial.
- Madurez: repositorio con 0 descargas y 0 likes, publicado muy recientemente; carece de validacion externa, ejemplos de codigo o documentacion sobre pasos de muestreo recomendados.
- Ausencia de benchmarks: no hay metricas que permitan comparar su calidad con alternativas de inpainting, por lo que cualquier decision en produccion requiere evaluacion propia.
- Trazabilidad: al ser una conversion, su calidad final depende tanto del checkpoint origen como del proceso de cuantizacion, y el autor no documenta este ultimo en detalle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skywalker33/removeit-inpaint-xl-mlx
- Perfil del autor: https://huggingface.co/skywalker33
- Modelos del autor: https://huggingface.co/skywalker33/models
- Checkpoint origen: https://huggingface.co/GraydientPlatformAPI/inpainting-realvisxlInpainting_v5lightning
- VAE SDXL fp16-fix (MIT): https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Licencia CreativeML Open RAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
- Documentacion de inpainting en diffusers: https://github.com/huggingface/diffusers/blob/main/docs/source/en/using-diffusers/inpaint.md
- Modelos soportados por IOPaint (referencia de alternativas): https://www.iopaint.com/models
- Etiqueta de inpainting en Civitai (referencia de modelos comparables): https://civitai.com/tag/inpainting
