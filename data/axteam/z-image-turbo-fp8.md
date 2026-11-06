# axteam/Z-Image-Turbo-FP8

## Resumen

Z-Image-Turbo-FP8 es una versión cuantizada en FP8 del transformer (DiT) del modelo de generación de imágenes Z-Image-Turbo, desarrollado originalmente por Tongyi-MAI (Alibaba) y cuantizado por axteam. El objetivo de esta derivación es reducir a la mitad el tamaño en memoria del transformer respecto a la versión BF16, facilitando su ejecución en GPUs de consumo sin perder calidad perceptible en la generación.

El modelo base, Z-Image-Turbo, es un modelo de difusión texto-a-imagen de arquitectura DiT (Diffusion Transformer) destilado en modo "turbo", es decir, optimizado para generar imágenes en un número reducido de pasos. La cuantización FP8 (`float8_e4m3fn`) sigue la convención habitual de ComfyUI: solo los tensores de pesos 2D se convierten a FP8, mientras que las normalizaciones y sesgos se mantienen en BF16.

Esta ficha es relevante porque el archivo resultante (6,2 GB) permite ejecutar el modelo en hardware modesto, integrándose directamente en flujos de trabajo de ComfyUI sin necesidad de conversión adicional. Cabe destacar que el repositorio solo contiene el transformer: el VAE y los codificadores de texto deben descargarse del repositorio original de Tongyi-MAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer), variante destilada "turbo" |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen) |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`), tensores 2D; normas y sesgos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (etiquetado en el repo; el README indica que aplica la licencia del modelo base) |
| Formato de pesos | safetensors (solo transformer; VAE y text encoder no incluidos) |

## Arquitectura y entrenamiento

La arquitectura es un Diffusion Transformer (DiT) en su variante destilada "turbo". Los modelos turbo se entrenan mediante destilación para reducir drásticamente el número de pasos de muestreo necesarios respecto a un modelo de difusión estándar, lo que permite generación rápida sin CFG complejo. Los detalles concretos del número de pasos, parámetros y proceso de destilación no están disponibles en la información del repositorio.

Sobre el entrenamiento del modelo base (número de tokens o imágenes, composición del dataset, RLHF/DPO) no se ha publicado información en la model card. En cuanto a la cuantización, el autor indica que se trata de un cast directo de los pesos del transformer a `float8_e4m3fn`, sin escalado por canal, siguiendo la convención `fp8_e4m3fn` habitual de ComfyUI. Los tensores de pesos 2D se cuantizan, mientras que las capas de normalización y los sesgos se conservan en BF16 para minimizar la degradación de calidad.

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image) mediante difusión con transformer.
- Generación rápida gracias a la destilación "turbo" del modelo base (número de pasos reducido; los ajustes de sampler son los mismos que los del modelo original).
- Compatibilidad total con ComfyUI mediante el nodo `Load Diffusion Model` (`UNETLoader`), sin necesidad de convertir el dtype manualmente.
- Reducción aproximada del 50 % en tamaño del transformer respecto a la versión BF16, lo que permite inferencia en GPUs con menos VRAM.
- No incluye capacidades de edición de imagen, inpainting, audio ni visión declaradas en la información disponible.

## Casos de uso

- Generación de imágenes en GPUs de consumo: gracias a la cuantización FP8 (6,2 GB solo para el transformer), es viable ejecutar el modelo en tarjetas domésticas que no tendrían espacio para la versión BF16 completa.
- Flujos de trabajo en ComfyUI: el archivo se integra directamente en `ComfyUI/models/diffusion_models` y se carga con el nodo estándar, lo que lo hace ideal para artistas y desarrolladores que ya usan ComfyUI.
- Generación por lotes de imágenes (batch generation): la destilación turbo reduce el número de pasos por imagen, acelerando pipelines que necesitan producir cientos de variantes (por ejemplo, assets para videojuegos o marketing).
- Prototipado de prompts: la velocidad de inferencia del modelo destilado permite iterar rápidamente sobre descripciones textuales antes de pasar a modelos más lentos o de mayor calidad.
- Despliegue local privado: al ejecutarse íntegramente en local, es adecuado para flujos donde no se pueden enviar imágenes o prompts a APIs de terceros (salud, legal, diseño corporativo).
- Integración en aplicaciones con backend GPU compartido: la huella de memoria reducida permite alojar varias instancias del modelo en una misma GPU multiusuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se han publicado comparativas de calidad de imagen (FID, CLIP score, etc.) entre esta versión FP8 y el modelo base BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud; el transformer FP8 ocupa 6,2 GB. Habría que añadir la VRAM del VAE y del text encoder del repositorio original (tamaños no disponibles). Una estimación razonable sitúa el conjunto por encima de los 8 GB de VRAM, pero no es un dato publicado.
- GPU recomendadas: no disponible explícitamente. Por el tamaño del archivo, GPUs con 8-16 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) son candidatas razonables para FP8, aunque ComfyUI documentó en su día problemas de FP8 en las series RTX 30xx y superiores en ciertos casos.
- Consumer GPUs: el objetivo declarado de la cuantización es que quepa en hardware de consumo; con 6,2 GB de transformer, cabe en tarjetas de 12 GB o más con holgura, y posiblemente en tarjetas de 8 GB dependiendo del text encoder.
- Opciones de despliegue: ComfyUI (flujo principal documentado, nodo `Load Diffusion Model` / `UNETLoader` con `weight_dtype` en `default`). No se menciona soporte para diffusers, vLLM ni otros runtimes.
- Latencia y throughput estimados: no disponible. Al ser un modelo destilado turbo, el número de pasos de muestreo es reducido, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Formato / cuantizacion | Tamano del transformer | Licencia | Destilacion turbo | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Z-Image-Turbo-FP8 | FP8 e4m3fn (solo DiT) | 6,2 GB | Apache 2.0 (etiquetado) | Si | Hugging Face, ComfyUI |
| Tongyi-MAI/Z-Image-Turbo (base) | BF16 (completo, con VAE y text encoder) | ~el doble del FP8 (no disponible exacto) | Ver repo original | Si | Hugging Face |
| Otras cuantizaciones FP8 de DiT (convencion ComfyUI) | FP8 e4m3fn | Variable | Variable | Variable | Variable |

No se conocen alternativas de la misma familia con otras cuantizaciones (GGUF, NF4) publicadas en la informacion disponible.

## Limitaciones y advertencias

- El repositorio solo contiene el transformer cuantizado: es obligatorio descargar el VAE y los text encoders del repositorio original de Tongyi-MAI, lo que añade espacio en disco y pasos de configuración.
- La cuantización es un cast directo sin escalado (`no scaling`), lo que puede introducir una ligera degradación de calidad respecto a BF16; no se han publicado evaluaciones cuantitativas de esta degradación.
- No hay datos publicados sobre parámetros, dataset de entrenamiento, número de pasos óptimos ni resolución máxima, lo que obliga a apoyarse en la documentación y workflows del modelo base.
- Existe una discrepancia potencial de licencia: el repo está etiquetado como Apache 2.0, pero el README indica que se aplica la licencia del modelo base; conviene verificar la licencia de Tongyi-MAI/Z-Image-Turbo antes de cualquier uso comercial.
- Sesgos del modelo: no disponible. Como todo modelo texto-a-imagen entrenado a gran escala, puede reproducir sesgos presentes en sus datos, pero no hay documentación específica.
- Riesgo de alucinación: no aplicable en el sentido de texto; en generación de imágenes se traduce en anatomías incorrectas, texto ilegible dentro de la imagen o incumplimiento del prompt, sin datos publicados sobre su magnitud.
- Compatibilidad de FP8: el formato `float8_e4m3fn` funciona bien en GPUs recientes (Ada, Hopper), pero puede requerir cómputo emulado o fallback en arquitecturas más antiguas; verifíquese en ComfyUI.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/axteam/Z-Image-Turbo-FP8
- Modelo base (Tongyi-MAI/Z-Image-Turbo): https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Paper, blog oficial, demo y repositorio de código del modelo base: no disponibles en la informacion proporcionada.
