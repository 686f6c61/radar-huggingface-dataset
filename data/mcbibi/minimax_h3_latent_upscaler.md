# mcbibi/Minimax_h3_latent_Upscaler

## Resumen

Minimax H3 Latent Upscaler es un modelo neuronal de superresolucion que opera directamente en el espacio latente del generador de video Minimax H3. Concretamente, trabaja sobre los latentes de 24 canales del VAE de H3 para aumentar la resolucion espacial (H×W) manteniendo intacta la dimension temporal. Lo desarrolla el autor mcbibi, con un repositorio y una model card que referencian el espacio de nombres LBH-123-AI, y se publica bajo licencia Apache 2.0.

El problema que resuelve es el coste computacional de generar video en alta resolucion: en lugar de generar a baja resolucion, decodificar a pixeles con el VAE de Minimax H3 (de unos 5.000 millones de parametros), reescalar en pixeles y volver a codificar, este modelo hace el reescalado directamente sobre los latentes. De este modo se evita una ida y vuelta costosa por el VAE pesado y se reducen los artefactos de fantasma o doble imagen que introduce la interpolacion bilineal o bicubica ingenua sobre latentes.

La arquitectura es una red de convolucion 3D con 345.280.216 parametros, 24 canales de entrada y salida, 512 canales base y 12+12 bloques con convolucion temporal cada 2 bloques (kernel 5). Se distribuye en tres checkpoints (bfloat16, float16 y float32) y se integra en ComfyUI mediante un nodo personalizado, con factores de escalado continuos de 1,0x a 4,0x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de convolucion 3D con convolucion temporal e interpolacion trilineal |
| Parametros totales | 345.280.216 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre latentes de video de 24 canales) |
| Tipos de cuantizacion | bfloat16, float16 y float32 (tres checkpoints independientes) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (.safetensors en bf16 y fp16) y PyTorch (.pth en fp32) |

Especificaciones adicionales de arquitectura: 24 canales de entrada/salida, 512 canales base, 12+12 bloques, convolucion temporal cada 2 bloques con tamano de kernel 5, y una rejilla de escalado soportada de 1,0x a 4,0x en pasos de 0,1 (por defecto 2,0x). El repositorio ocupa 2,8 GB en total.

## Arquitectura y entrenamiento

El modelo usa un backbone de convolucion 3D con convolucion temporal y muestreo por interpolacion trilineal. Segun la model card, la arquitectura se inspira y referencia el LTX 2.3 Spatial Upscaler. La especificacion del release v1, recogida en `minimax_h3_latent_upscaler_3d_conv_v1/config.json`, indica 24 canales de entrada y salida, 512 canales base, 12+12 bloques, convolucion temporal cada 2 bloques con kernel de tamano 5 y un total de 345.280.216 parametros. El `config.json` de la raiz del repositorio actua como indice de familia y registra lo compartido entre releases: el espacio latente de 24 canales de H3 y su normalizacion, el rango de escalado soportado y el mapeo al nodo de ComfyUI.

En cuanto a los datos de entrenamiento, la model card indica que se entreno con aproximadamente 80.000 muestras pareadas (latente de baja resolucion y objetivo de alta resolucion), equilibradas entre modalidades y factores de escala. Del total, unos 70.000 pares son de video y unos 8.000 pares son de imagen 2K. La distribucion de escalas es aproximadamente: 40% a 2x, 10% a 1,5x, 10% a 2,5x, 10% a 3x, 10% a 4x y 10% a escalas decimales arbitrarias entre 1,0x y 4,0x, con el objetivo de generalizar a cualquier factor intermedio. No se detalla en la informacion disponible si hubo fases de RLHF, DPO o ajuste por preferencias, ni el numero total de tokens o frames de entrenamiento.

## Capacidades

- Superresolucion en espacio latente sobre los latentes de 24 canales del VAE de Minimax H3, aumentando la resolucion espacial (H×W) y preservando la dimension temporal.
- Factores de escalado continuos de 1,0x a 4,0x en pasos de 0,1, con valor por defecto de 2,0x.
- Capacidad 2D y 3D: el nodo de ComfyUI ofrece variantes "Minimax H3 Latent Upscaler (2D)" y "Minimax H3 Latent Upscaler (3D)".
- Mitigacion de artefactos de fantasma o doble imagen en comparacion con la interpolacion de latentes ingenua (bilineal o bicubica).
- Aceleracion del flujo de generacion de video en alta resolucion al evitar el ciclo decodificar, reescalar en pixeles y recodificar a traves del VAE pesado de Minimax H3 (de unos 5.000 millones de parametros).
- Soporte de entrenamiento mixto en imagen y video, con pares de imagen 2K incluidos en el conjunto de datos.
- Integracion con ComfyUI mediante nodo personalizado que infiere la arquitectura a partir del state dict al cargar.
- No se describen capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni razonamiento multi-paso, ya que no es un modelo de lenguaje.

## Casos de uso

- Aceleracion de pipelines de generacion de video en ComfyUI: se genera a baja resolucion con Minimax H3, se aplica el upscaler sobre los latentes y se refina a la resolucion objetivo, reduciendo el tiempo total al evitar el ciclo por el VAE pesado.
- Produccion de video en 2K o superior a partir de latentes de baja resolucion: el modelo conserva la coherencia temporal gracias a su dimension de convolucion temporal, lo que resulta util para clips con movimiento continuo.
- Superresolucion de imagenes 2K: aunque su foco es el video, el conjunto de entrenamiento incluye unos 8.000 pares de imagen 2K, por lo que puede emplearse en flujos de upscaling de imagen dentro del espacio latente de H3.
- Refinado de borradores de video antes de una pasada final: el pipeline recomendado (generar a baja resolucion, escalar el latente, remuestrear a la resolucion objetivo) permite iterar rapido en previsualizacion y reservar el computo caro para la pasada final.
- Postprocesado de material generado con Minimax H3 sin reencodificacion: al trabajar directamente en el espacio latente, evita una generacion de perdida adicional que introduciria el paso por pixeles.
- Escalado selectivo de planos: con factores continuos de 1,0x a 4,0x, se puede aplicar un factor distinto por secuencia (por ejemplo, 1,5x para planos amplios y 2,5x para primeros planos) segun la densidad de detalle requerida.
- Integracion en herramientas de automatizacion y nodos personalizados de ComfyUI para lotes de video, dado que el nodo infiere la arquitectura desde el state dict y admite los tres checkpoints de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (por ejemplo, PSNR, SSIM, LPIPS o VMAF) en la informacion disponible. La model card unicamente aporta comparaciones cualitativas mediante un video y una imagen de ejemplo, y afirma que el modelo evita los artefactos de fantasma o doble imagen de la interpolacion bilineal o bicubica, ademas de ahorrar tiempo al omitir el ciclo por el VAE. No se proporcionan cifras de mejora de latencia ni de calidad medibles.

## Requisitos de hardware

- Tamanos de checkpoint: bfloat16 ~691 MB, float16 ~691 MB y float32 ~1,38 GB, segun la model card.
- Al ser un modelo de 345 millones de parametros en un backbone de convolucion, la huella de pesos es reducida; el consumo de VRAM en inferencia dependera sobre todo de la resolucion latente y de la longitud temporal del video procesado, datos que no se especifican en la informacion disponible.
- No se indican GPU recomendadas concretas (A100, H100, RTX 4090, etc.) en la model card.
- Por el tamano de los pesos (menos de 1,5 GB), los checkpoints bf16 y fp16 son compatibles con GPUs de consumo; la model card sugiere bf16 como el mas rapido en GPUs Ampere y Ada.
- Opciones de despliegue: nodo personalizado de ComfyUI (LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler), con los checkpoints situados en `ComfyUI/models/latent_upscale_models/`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no serian aplicables al no ser un modelo de lenguaje.
- No se proporcionan datos de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Factor de escala | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minimax H3 Latent Upscaler (este modelo) | Upscaler en espacio latente de video | 345.280.216 | 1,0x–4,0x | apache-2.0 | HuggingFace, nodo ComfyUI |
| LTX 2.3 Spatial Upscaler | Upscaler espacial (referenciado como inspiracion arquitectonica) | no disponible | no disponible | no disponible | no disponible |
| Interpolacion bilineal/bicubica de latentes | Metodo no aprendido | no aplica | arbitrario | no aplica | nativa en frameworks |

La model card unicamente cita el LTX 2.3 Spatial Upscaler como referencia arquitectonica, sin proporcionar parametros, contexto, rendimiento ni licencia de ese modelo. No se dispone de otros modelos comparables con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Especificidad de espacio latente: el modelo solo es valido para los latentes de 24 canales del VAE de Minimax H3; no es aplicable a otros espacios latentes ni a otros generadores.
- Ausencia de benchmarks: no hay metricas cuantitativas publicadas de calidad (PSNR, SSIM, LPIPS, VMAF) ni de rendimiento, por lo que la mejora frente a metodos alternativos no esta respaldada por datos medibles en la informacion disponible.
- Madurez: el repositorio figura con 0 descargas y 0 likes en los datos de HuggingFace, por lo que el modelo no cuenta con validacion amplia por parte de la comunidad.
- Discrepancia de autoría: el identificador de HuggingFace listado es `mcbibi/Minimax_h3_latent_Upscaler`, mientras que la model card y los enlaces internos apuntan a `LBH-123-AI/Minimax_h3_latent_Upscaler`, lo que puede generar confusion al localizar el recurso.
- Fechas: la fecha de creacion y actualizacion indicada es 2026-09-28, que aparece en el futuro respecto al momento habitual de publicacion; conviene verificar la vigencia del repositorio.
- Riesgo de artefactos residuales: aunque la model card afirma que se evitan los artefactos de fantasma de la interpolacion ingenua, no se detalla el comportamiento en escalas cercanas a 4x ni en videos con movimiento rapido o alta densidad de detalle.
- La calidad final depende del paso de remuestreo/refinado posterior a la resolucion objetivo; el upscaler por si solo no garantiza la recuperacion completa de detalle.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y la atribucion correspondiente. No se imponen restricciones adicionales segun la informacion disponible.
- No se describe ningun uso indebido previsto ni clausula de uso aceptable en la informacion proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/mcbibi/Minimax_h3_latent_Upscaler
- Repositorio referenciado en la model card: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Nodo personalizado de ComfyUI: https://github.com/LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler
- Configuracion de arquitectura v1: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/blob/main/minimax_h3_latent_upscaler_3d_conv_v1/config.json
- Video de ejemplo: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/Minimax_h3_latent_Upscaler_001.mp4
- Imagen de comparacion: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler/resolve/main/examples/Minimax_h3_latent_Upscaler_002.jpg
