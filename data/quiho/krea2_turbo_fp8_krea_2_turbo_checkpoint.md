# Quiho/Krea2_Turbo_FP8_Krea_2_TURBO_checkpoint

## Resumen

Krea2 Turbo FP8 es una versión cuantizada en precisión FP8 (float8_e4m3fn) del modelo de difusión Krea 2 OSS Turbo, desarrollado originalmente por Krea AI. Esta adaptación comunitaria, publicada por el usuario Quiho, reduce el tamaño de los pesos de 24,76 GiB (BF16) a 12,01 GiB, lo que permite ejecutar el modelo en GPUs de consumo con 16 GB o 24 GB de VRAM sin una pérdida apreciable de calidad de generación. El modelo está diseñado para generación de imágenes a partir de texto, con un enfoque en velocidad (variante Turbo) y calidad fotorrealista o ilustrativa.

La cuantización se realizó de forma selectiva: solo las matrices de pesos 2D con más de 1024 elementos se convirtieron a FP8, mientras que vectores, sesgos, escalas de normalización y capas sensibles (como las de modulación) se mantienen en alta precisión. Esto evita errores de promoción numérica típicos en cuantizaciones globales y preserva la fidelidad de la salida. El repositorio se distribuye bajo la licencia KREA 2 License Agreement, por lo que su uso comercial está sujeto a los términos de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de texto a imagen (tipo transformer de difusion, probablemente DiT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | FP8 (float8_e4m3fn) selectivo, con capas en BF16/FP32 |
| Idiomas soportados | no disponible (probablemente ingles y otros, no confirmado) |
| Licencia | KREA 2 License Agreement (segun la model card) |
| Formato de pesos | FP8 (float8_e4m3fn) en safetensors (presumible, no confirmado) |

## Arquitectura y entrenamiento

El modelo base es Krea 2 OSS Turbo, un modelo de difusion de texto a imagen desarrollado por Krea AI. La arquitectura subyacente no se detalla en la informacion disponible, pero por el tipo de modelo y el uso de la libreria diffusers se trata de un transformer de difusion (DiT) con atencion y capas de modulacion. La variante Turbo esta optimizada para generar imagenes con menos pasos de inferencia, lo que la hace mas rapida que el modelo base Krea 2 Raw.

El entrenamiento original del modelo Krea 2 no se documenta en esta ficha; no se dispone de datos sobre el numero de tokens, composicion del dataset o tecnicas de alineacion (RLHF, DPO, etc.). La contribucion de este repositorio se limita a la cuantizacion FP8 de los pesos, realizada con una estrategia selectiva: se cuantizaron 266 tensores (matrices 2D con mas de 1024 elementos) y se mantuvieron 166 tensores en precision nativa (vectores, sesgos, escalas y capas de modulacion). Esta estrategia evita errores de promocion numerica entre BFloat16 y Float8 en PyTorch y conserva la calidad de generacion.

## Capacidades

- Generacion de imagenes fotorrealistas y artisticas a partir de descripciones textuales.
- Soporte de estilos variados: fotografia amateur, ilustracion expresiva, arte digital, entre otros.
- Generacion rapida gracias a la variante Turbo (menos pasos de inferencia).
- Capacidad de producir imagenes de alta resolucion (no se especifica la resolucion maxima).
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de vision, audio o video; es exclusivamente texto a imagen.

## Casos de uso

- Creacion de ilustraciones y arte conceptual: el modelo puede generar imagenes a partir de prompts descriptivos, util para artistas y disenadores que necesitan explorar ideas rapidamente.
- Generacion de imagenes para prototipos de productos: permite visualizar conceptos de diseno sin necesidad de sesiones fotograficas o ilustracion manual.
- Contenido para redes sociales y marketing: creacion de imagenes atractivas para publicaciones, banners o anuncios, con la ventaja de la velocidad de la variante Turbo.
- Produccion de imagenes de stock: el modelo puede generar fotografias sinteticas para bancos de imagenes, siempre que se cumplan los terminos de la licencia.
- Desarrollo de assets para videojuegos: generacion de texturas, fondos o conceptos de personajes a partir de descripciones.
- Investigacion en generacion de imagenes: como base para experimentos de cuantizacion, fine-tuning o evaluacion de calidad, gracias a su disponibilidad en FP8 y su compatibilidad con diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como FID, CLIP score o comparaciones cuantitativas con otros modelos. La unica informacion de rendimiento es la reduccion de tamano (de 24,76 GiB a 12,01 GiB) y la afirmacion del autor de que la calidad de salida se mantiene sin sacrificios apreciables, aunque no se aportan datos objetivos.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 12,01 GiB en disco, por lo que se recomienda al menos 16 GB de VRAM para inferencia comoda, aunque podria ejecutarse en 12 GB con optimizaciones adicionales.
- GPUs recomendadas: tarjetas de consumo con 16 GB o 24 GB de VRAM, como RTX 4080, RTX 4090, o equivalentes de AMD con suficiente memoria.
- No se recomienda para GPUs con menos de 12 GB de VRAM sin tecnicas de offloading.
- Opciones de despliegue: al ser un modelo de diffusers, puede ejecutarse con la libreria diffusers de HuggingFace, o mediante interfaces como ComfyUI (dado que el modelo original se distribuye en Civitai con soporte para ComfyUI).
- Latencia y throughput: no disponibles. La variante Turbo sugiere una generacion mas rapida que el modelo base, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Tamano (pesos) | Cuantizacion | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 OSS Turbo (original) | 24,76 GiB (BF16) | BF16 | Alta (Turbo) | KREA 2 License | HuggingFace, Civitai |
| Krea2 Turbo FP8 (este repo) | 12,01 GiB | FP8 selectivo | Alta (Turbo) | KREA 2 License | HuggingFace, Civitai |
| Krea 2 Raw | no disponible | BF16 (presumible) | Media | KREA 2 License | HuggingFace, Civitai |

No se dispone de comparaciones con otros modelos de difusion como SDXL o Flux, ya que no hay datos de rendimiento ni de calidad en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo puede generar contenido explicito para adultos, como se refleja en el widget de ejemplo de la model card. No es apto para todos los publicos y su uso debe cumplir con las politicas de la plataforma y la legislacion aplicable.
- La licencia KREA 2 License Agreement puede imponer restricciones al uso comercial, redistribucion o modificacion. Es obligatorio revisar los terminos oficiales antes de utilizar los pesos.
- No se dispone de informacion sobre sesgos del modelo, pero como todo modelo de generacion de imagenes, puede reflejar sesgos presentes en sus datos de entrenamiento (no documentados).
- Riesgo de alucinacion visual: el modelo puede generar imagenes con inconsistencias anatomicas, de perspectiva o de texto, especialmente en prompts complejos.
- La cuantizacion FP8, aunque selectiva, puede introducir ligeras diferencias en la salida respecto al modelo BF16 original, aunque el autor afirma que la calidad se mantiene.
- No se garantiza la compatibilidad con todas las versiones de diffusers o ComfyUI; es necesario verificar la integracion con el entorno de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Quiho/Krea2_Turbo_FP8_Krea_2_TURBO_checkpoint
- Pagina en Civitai: https://civitai.com/models/2723583/krea2-turbofp8
- Modelo original Krea 2 Turbo en HuggingFace: https://huggingface.co/krea/Krea-2-Turbo
- Checkpoints oficiales de Krea 2 Turbo en Civitai: https://civitai.com/models/2726029/krea-2-turbo-official-comfy-org-checkpoints-krea2
- Otra version FP8 del mismo modelo: https://huggingface.co/szwagros/Krea-2-Turbo-fp8
- Pagina de Krea AI para Krea 2 Turbo: https://www.krea.ai/models/krea-2-turbo
