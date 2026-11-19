# lodestones/MOSS-Image-Base-8-steps-dmd

## Resumen

MOSS-Image-Base-8-steps-dmd es un checkpoint destilado del modelo de difusion de imagenes OpenMOSS-Team/MOSS-Image-Base, publicado por el usuario lodestones. El objetivo es reducir el coste de inferencia del modelo base, que requiere 50 pasos de muestreo con classifier-free guidance (CFG 3), a solo 8 evaluaciones de red sin CFG. La destilacion emplea la tecnica data-space DMD descrita en el paper arXiv 2610.12102, en la que el generador itera sobre su propia estimacion limpia a partir de ruido fijo.

El modelo conserva la arquitectura del transformer original de MOSS-Image-Base (un transformer de difusion con flow matching, text encoder y VAE del repositorio base) y se distribuye como un conjunto de adaptadores LoRA de rango 128 mas pesos de time embedding y un sampler especifico de data-space. Los pesos suman aproximadamente 5.080 millones de parametros en formato safetensors y el repositorio ocupa 48 GB, principalmente por incluir el transformer completo en float32.

Es relevante ahora porque permite desplegar un modelo de generacion de imagenes de alta calidad con un coste computacional muy inferior al original: 8 pasos frente a 50 y sin CFG, lo que reduce drasticamente el tiempo por imagen. No obstante, el autor lo marca explicitamente como un trabajo en progreso (checkpoint update 12000, EMA) y advierte de que la precision fp32 es imprescindible para conservar la destilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con flow matching (MOSSImageTransformer), destilado mediante data-space DMD |
| Parametros totales | 5.082.308.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolucion no especificada en la informacion) |
| Tipos de cuantizacion | no se documentan cuantizaciones oficiales; los pesos se distribuyen en float32 y el autor advierte contra el uso de bf16 para el transformer destilado |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (lora.safetensors, time_embedding.safetensors, generator.safetensors, dataspace.safetensors, transformer/ en fp32) |

## Arquitectura y entrenamiento

El modelo parte de OpenMOSS-Team/MOSS-Image-Base, un transformer de difusion que opera con flow matching y un VAE con patchify 2x2 y normalizacion por batch norm. La destilacion aplica data-space DMD (arXiv 2610.12102): en lugar de predecir el flujo en el espacio de ruido, el generador itera sobre su propia estimacion limpia x0 a partir de un ruido fijo z, usando una matriz de mezcla latente Q de 128x128 y un conjunto de 8 step codes. Cada prefijo de pasos (menos de 8 tambien funciona) fue entrenado, de modo que el sampler puede truncarse.

El entrenamiento se realizo sobre captions compactas en JSON con estructura de scene_graph. El checkpoint publicado corresponde al update 12000 con pesos EMA en float32. La innovacion clave es que el delta de destilacion es menor que el paso de redondeo de bf16, por lo que el transformer debe cargarse y ejecutarse en fp32 sin autocast; para inferencia rapida en bf16 se ofrece un LoRA de rango 128 con alpha 128 sobre las proyecciones q, k, v, o, ffn_up_gate y ffn_down de cada bloque, junto con reemplazos fp32 de time_embedding y las modulaciones de sesgo (shared_block_modulation.bias y video_head_modulation.bias), ya que el vector de tiempo t=1 esta plegado en esos sesgos.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante flow matching Euler con shift 5, CFG 1 y 4-8 pasos.
- Destilacion a 8 evaluaciones de red (frente a 50 pasos y CFG 3 del modelo base), con soporte de prefijos menores de pasos.
- Dos modos de uso: LoRA sobre el transformer base en bf16 (recomendado para velocidad) o sampler data-space completo en fp32 (forma de entrenamiento).
- Procesamiento de captions estructuradas en JSON con scene_graph, lo que sugiere capacidad para prompts con relaciones espaciales y de objetos explicitas.
- Reutiliza el text encoder, tokenizer y VAE del repositorio base de MOSS-Image-Base.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking; es un modelo puramente generativo de imagen.

## Casos de uso

- Generacion rapida de imagenes en produccion: con 8 pasos y CFG 1 el coste por imagen cae aproximadamente a una sexta parte del modelo base (50 pasos con CFG, que implica doble forward por paso), adecuado para APIs de generacion con latencia ajustada.
- Prototipado interactivo en ComfyUI: el LoRA se carga con un LoRA loader estandar a strength 1 sobre el transformer base y se muestrea con el sampler Euler de flow matching, lo que permite iterar sobre prompts en tiempo casi real.
- Generacion condicionada por scene graphs: al haberse entrenado con captions JSON de scene_graph, encaja en pipelines que construyen descripciones estructuradas de escenas (objetos, relaciones, atributos) y necesitan renderizarlas.
- Batch generation de assets para videojuegos o diseno: el bajo numero de pasos permite generar grandes volumenes de variaciones de un mismo concepto sin disparar el coste de GPU.
- Investigacion en destilacion de modelos de difusion: el repositorio incluye el sampler data-space, la matriz Q y los step codes, lo que lo convierte en una referencia reproducible para estudiar DMD en espacio de datos.
- Despliegue en infraestructura con GPUs de gama media: al reducir pasos y eliminar CFG, el modelo es viable en entornos donde el base a 50 pasos resultaria demasiado lento, aplicando el LoRA en bf16.
- Fine-tuning posterior sobre dominios concretos: al ser un adaptador LoRA separado, se puede componer o sustituir por otros adaptadores sin tocar el transformer base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas cuantitativas (FID, CLIP score, etc.) ni comparaciones numericas con el modelo base mas alla de la reduccion de 50 pasos con CFG 3 a 8 evaluaciones sin CFG.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El transformer en fp32 con 5.080 millones de parametros ocupa aproximadamente 20 GB solo en pesos, a lo que hay que sumar text encoder, VAE y activaciones; el modo fp32 completo probablemente requiere GPUs de 40-80 GB.
- El modo recomendado (LoRA sobre el transformer base en bf16) reduce el requisito al del modelo base en bf16, aproximadamente 10 GB en pesos mas overhead, aunque la cifra exacta no se documenta.
- GPU recomendadas: no especificadas por el autor. Por el tamano, el modo fp32 apunta a A100 80 GB o H100; el modo LoRA bf16 podria caber en RTX 4090 (24 GB) o A100 40 GB, sin confirmacion oficial.
- Despliegue: la libreria indicada es diffusers; el autor menciona ComfyUI con LoRA loader para el adaptador y el pipeline_moss_image.py del repositorio base para el transformer completo.
- Latencia y throughput: no disponibles. La unica referencia es la reduccion de 50 pasos con CFG a 8 pasos sin CFG, que en teoria reduce el numero de evaluaciones de red en mas de un orden de magnitud (de ~100 forwards con CFG a 8).

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | CFG | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lodestones/MOSS-Image-Base-8-steps-dmd | 5.080 M | 4-8 | 1 (sin CFG) | apache-2.0 | Hugging Face, diffusers |
| OpenMOSS-Team/MOSS-Image-Base | no disponible en la informacion | 50 | 3 | no disponible en la informacion | Hugging Face |
| Otros modelos de difusion destilados (p. ej. variantes LCM/Turbo) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; solo se puede afirmar que este checkpoint es una variante destilada del propio MOSS-Image-Base y que el ahorro principal es el numero de evaluaciones de red.

## Limitaciones y advertencias

- Trabajo en progreso: el autor lo describe como destilacion en curso (checkpoint update 12000, EMA), sin garantias de calidad final.
- Precision critica: el transformer destilado debe cargarse y ejecutarse en fp32; convertirlo a bf16 descarta la mayor parte de la destilacion. Esto limita el ahorro real de memoria y puede anular la ventaja de velocidad si se usa el sampler data-space completo.
- El LoRA en bf16 es la via rapida, pero requiere aplicar los ficheros de time_embedding y modulaciones en fp32 junto con el adaptador; un uso incorrecto degrada la calidad.
- No hay datos publicados de sesgos, tasas de alucinacion visual ni evaluaciones de fidelidad al prompt.
- Idiomas soportados no documentados; el comportamiento multilingue depende del text encoder del modelo base.
- Licencia apache-2.0 permite uso comercial, pero al derivar de MOSS-Image-Base conviene verificar la licencia y condiciones del modelo base antes de produccion.
- No se documentan cuantizaciones oficiales (GGUF, int8, etc.), lo que dificulta el despliegue en hardware de gama baja.
- La resolucion de salida no se especifica en la informacion; el sampler asume latentes de H/16 x W/16, pero los valores validos no estan confirmados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lodestones/MOSS-Image-Base-8-steps-dmd
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Paper de data-space DMD: arXiv 2610.12102 (referenciado en la model card; sin URL directa en la informacion)
