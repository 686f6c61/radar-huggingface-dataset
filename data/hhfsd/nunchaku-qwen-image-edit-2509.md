# HHFSD/nunchaku-qwen-image-edit-2509

## Resumen

El modelo `HHFSD/nunchaku-qwen-image-edit-2509` es una versión cuantizada mediante SVDQuant del modelo de edición de imágenes Qwen-Image-Edit-2509, desarrollado por el equipo Nunchaku (aunque el repositorio en Hugging Face está publicado bajo la cuenta HHFSD). SVDQuant es una técnica de cuantización de baja precisión para modelos de difusión, presentada como Spotlight en ICLR 2025, que permite reducir el consumo de memoria y acelerar la inferencia con una pérdida mínima de calidad. Este modelo está pensado para ejecutar edición de imágenes basada en instrucciones de texto en GPUs de consumo, sin necesidad de hardware de gama alta.

La cuantización se ofrece en dos formatos: INT4 para GPUs no-Blackwell (series anteriores a la 50) y NVFP4 para GPUs Blackwell (series 50). Además, se incluyen variantes con ranks r32 (más rápida) y r128 (mejor calidad), así como versiones destiladas Lightning que permiten generar imágenes en solo 4 pasos de inferencia. El repositorio ocupa 246 GB e incluye múltiples archivos de pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Qwen-Image-Edit-2509, basado en Qwen-Image) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | INT4 (SVDQuant) y NVFP4 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una version cuantizada de Qwen-Image-Edit-2509, un modelo de edicion de imagenes basado en Qwen-Image, que a su vez es un transformer de difusion (DiT) disenado para generacion y edicion de imagenes de alta calidad. La cuantizacion se realiza mediante SVDQuant, una tecnica que descompone los pesos en componentes de bajo rango y cuantiza la parte residual a 4 bits, manteniendo la precision en los componentes principales. El entrenamiento de la cuantizacion utiliza el dataset `mit-han-lab/svdquant-datasets` y el proceso esta optimizado para minimizar la perdida de rendimiento respecto al modelo original en bfloat16.

Ademas de los pesos cuantizados estandar, se ofrecen versiones Lightning que integran LoRAs destiladas (Qwen-Image-Lightning) para reducir el numero de pasos de inferencia de 20-30 a solo 4, lo que acelera significativamente la generacion sin sacrificar demasiada calidad.

## Capacidades

- Edicion de imagenes mediante instrucciones en lenguaje natural (por ejemplo, "cambia el fondo a una playa").
- Generacion de imagenes desde texto (aunque el modelo base esta orientado a edicion, tambien puede generar desde cero).
- Soporte para edicion de alta resolucion y renderizado de texto complejo dentro de las imagenes.
- Variantes Lightning que permiten inferencia en 4 pasos para aplicaciones en tiempo real o de baja latencia.
- Compatible con el ecosistema diffusers y con ComfyUI mediante el plugin Nunchaku.
- Cuantizacion en INT4 para GPUs no-Blackwell y NVFP4 para GPUs Blackwell, lo que permite ejecutar el modelo en hardware de consumo.

## Casos de uso

- Edicion de imagenes en flujos de trabajo creativos: un disenador puede cargar una imagen base y solicitar cambios especificos ("cambia el color del coche a rojo", "anade una montana al fondo") sin necesidad de herramientas de retoque manual.
- Generacion de variantes de producto para e-commerce: a partir de una foto de un articulo, el modelo puede generar multiples versiones con fondos, iluminacion o angulos diferentes, util para catalogos digitales.
- Correccion y restauracion de fotografias: permite eliminar objetos no deseados, rellenar zonas o mejorar la composicion mediante instrucciones textuales, reduciendo el tiempo de postproduccion.
- Creacion de contenido para redes sociales: los creadores pueden generar imagenes editadas rapidamente con prompts en ingles, ideal para campañas publicitarias o publicaciones frecuentes.
- Prototipado de conceptos visuales en diseno de producto: los equipos pueden iterar sobre bocetos o renders iniciales pidiendo cambios de estilo, color o contexto, acelerando la toma de decisiones.
- Integracion en pipelines de generacion automatica: gracias a las variantes Lightning de 4 pasos, el modelo puede integrarse en servicios de generacion masiva de imagenes donde la latencia es critica, como generadores de avatares o ilustraciones para juegos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como FID, CLIP score o comparativas con otros modelos de edicion de imagenes. Se recomienda consultar la documentacion oficial de Nunchaku o el paper de SVDQuant para obtener datos de rendimiento y calidad.

## Requisitos de hardware

- VRAM estimada: no especificada en la informacion, pero el repositorio de Nunchaku menciona que con offloading asincrono se puede reducir el uso de VRAM hasta 3 GiB para Qwen-Image (no para la version Edit especificamente). Para las versiones cuantizadas, se espera un consumo menor que el modelo original en bfloat16.
- GPUs compatibles: INT4 para GPUs no-Blackwell (series RTX 30, 40 y anteriores) y NVFP4 para GPUs Blackwell (RTX 50). No se especifican modelos concretos, pero por el tamano del modelo (varios GB) se recomienda al menos 8-12 GB de VRAM para las versiones r32 y mas para r128.
- Opciones de despliegue: el modelo se usa con la libreria diffusers de Hugging Face, y tambien es compatible con ComfyUI mediante el plugin Nunchaku. No es aplicable a vLLM, llama.cpp u Ollama, ya que es un modelo de difusion de imagenes.
- Latencia: no se proporcionan datos de throughput, pero las variantes Lightning de 4 pasos reducen drásticamente el tiempo de generacion en comparacion con los modelos estandar de 20-30 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| Qwen-Image-Edit-2509 (original) | Edicion de imagenes | bfloat16 | Apache-2.0 | Modelo base sin cuantizar, mayor calidad pero mayor consumo de VRAM |
| nunchaku-qwen-image-edit-2509 (este) | Edicion de imagenes | INT4 / NVFP4 | Apache-2.0 | Cuantizado, menor VRAM y mayor velocidad, ligera perdida de calidad |
| Otras cuantizaciones de Qwen-Image-Edit (p.ej. FP8) | Edicion de imagenes | FP8 | Apache-2.0 | No se dispone de datos concretos en la informacion |

No se dispone de comparativas directas con otros modelos de edicion de imagenes como InstructPix2Pix o FLUX.1 Kontext, ya que no hay benchmarks publicados en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede introducir una ligera perdida de calidad en la generacion, especialmente en detalles finos o texturas complejas, en comparacion con el modelo original en bfloat16.
- El modelo solo soporta instrucciones en ingles, lo que limita su uso para usuarios de otros idiomas.
- No se han publicado evaluaciones de sesgos o riesgos de contenido inapropiado. Como cualquier modelo generativo, puede producir imagenes con sesgos o contenido no deseado si se le pide explicitamente.
- El tamano del repositorio es de 246 GB, lo que implica una descarga considerable y requiere espacio en disco.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen-Image-Edit-2509 para confirmar restricciones adicionales.
- Para produccion, es necesario validar la calidad de las ediciones en el caso de uso concreto, ya que la cuantizacion puede afectar a la fidelidad de las instrucciones.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/HHFSD/nunchaku-qwen-image-edit-2509
- Repositorio oficial de Nunchaku (GitHub): https://github.com/Nunchaku-AI/Nunchaku
- Documentacion de Nunchaku para Qwen-Image-Edit: https://nunchaku.tech/docs/nunchaku/usage/qwen-image-edit.html
- Paper de SVDQuant (arXiv): https://arxiv.org/abs/2411.05007
- Modelo base Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Dataset de entrenamiento: https://huggingface.co/datasets/mit-han-lab/svdquant-datasets
