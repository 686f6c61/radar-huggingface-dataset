# caikybaldo999/ZYI-1.1-TINY

## Resumen

ZYI-1.1-TINY es un modelo de generacion de imagenes texto-a-imagen publicado por el usuario caikybaldo999 en HuggingFace. Se trata de un *fine-tune* del modelo `caikybaldo999/ZYI-1-TINY`, del mismo autor, y esta construido sobre una arquitectura propia denominada ZYI-DiT (Diffusion Transformer) con un denoiser de tan solo 59,2 millones de parametros, entrenado con formulacion de *rectified flow*. El condicionamiento de texto se realiza con FLAN-T5-base y la decodificacion latente con el VAE `stabilityai/sd-vae-ft-mse`, lo que da una resolucion de trabajo de 256x256 pixeles.

El modelo resuelve el problema de la sintesis de imagenes a partir de descripciones textuales en un regimen de computo extremadamente bajo: con menos de 60 millones de parametros en el denoiser, es aproximadamente un orden de magnitud mas pequeno que los UNet de Stable Diffusion 1.5. Esto lo situa en la categoria de modelos "tiny" pensados para experimentacion, prototipado rapido y despliegue en hardware muy limitado, mas que para generacion fotorrealista de alta fidelidad.

Su relevancia actual es principalmente como referencia tecnica y punto de partida reproducible: el autor documenta el dataset de ajuste (`pixparse/cc3m-wds`, subconjunto en streaming de hasta 40.000 pares imagen-texto de CC3M), el LR (1e-05) y las epocas configuradas (50). Sin embargo, el repositorio no incluye resultados de evaluacion, no declara idiomas soportados y registra 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un artefacto no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ZYI-DiT (Diffusion Transformer) con rectified flow; condicionamiento de texto FLAN-T5-base; VAE `stabilityai/sd-vae-ft-mse` |
| Parametros totales | 59,2 M en el denoiser ZYI-DiT; el total del pipeline (denoiser + FLAN-T5-base + VAE) no esta declarado por el autor |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; el condicionamiento se delega en FLAN-T5-base) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados ni versiones GGUF/ONNX) |
| Idiomas soportados | no disponible (el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el repositorio ocupa 1,9 GB y los tags indican PyTorch, sin confirmar safetensors, GGUF ni otros formatos |

Datos adicionales registrados: ID `caikybaldo999/ZYI-1.1-TINY`, pipeline `text-to-image`, region `us`, fecha de creacion 2026-09-25 y ultima actualizacion 2026-09-25.

## Arquitectura y entrenamiento

La arquitectura es un Diffusion Transformer (DiT) de 59,2 M de parametros con entrenamiento por *rectified flow*, una formulacion que aprende trayectorias rectas entre ruido y datos y que habitualmente permite muestrear con menos pasos que la difusion DDPM clasica. El modelo opera a 256x256 pixeles. La senal de texto entra a traves de FLAN-T5-base como codificador de condicionamiento, y la imagen se genera y decodifica en el espacio latente del VAE `stabilityai/sd-vae-ft-mse`, el mismo VAE de la familia Stable Diffusion 1.x/2.x. No se documentan innovaciones adicionales como atencion lineal, decodificacion especulativa o destilacion por pasos.

El ajuste fino se realizo partiendo de `caikybaldo999/ZYI-1-TINY` sobre el dataset `pixparse/cc3m-wds` (CC3M / Conceptual Captions 3M), usado como subconjunto en *streaming* con un maximo declarado de 40.000 pares imagen-caption. Los hiperparametros indicados son LR 1e-05 y 50 epocas configuradas. No se especifican el numero total de pasos, el tamano de batch, la estrategia de precision (fp32/fp16/bf16), si hubo *classifier-free guidance* durante el entrenamiento, ni si se aplico RLHF/DPO (tecnicas no habituales en generacion de imagenes). La model card indica ademas que las consultas de busqueda y los metadatos de origen se almacenan dentro de cada checkpoint, un detalle de trazabilidad poco frecuente.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) a 256x256 pixeles.
- Condicionamiento semantico mediante un codificador de lenguaje FLAN-T5-base, lo que permite prompts en lenguaje natural y no solo listas de etiquetas.
- Muestreo con formulacion rectified flow, potencialmente con menos pasos de inferencia que un sampler DDPM equivalente (no se documenta el numero de pasos recomendado).
- Trazabilidad de datos: los checkpoints almacenan las consultas de busqueda y los metadatos de origen asociados al entrenamiento.
- Almacenamiento de metadatos dentro del checkpoint como mecanismo de auditoria del dataset.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso agentico, razonamiento multi-paso, vision de entrada, audio, modo *thinking* ni generacion de video.
- No se documenta edicion de imagenes, inpainting, outpainting, ControlNet, LoRA ni personalizacion por referencia de imagen.

## Casos de uso

- Prototipado rapido de interfaces: generar miniaturas y *placeholders* de 256x256 para maquetas de producto antes de encargar arte final, aprovechando que el denoiser de 59,2 M permite iterar con coste de computo minimo.
- Aumento de datos para pipelines de vision por computador: producir imagenes sinteticas etiquetadas a partir de captions para preentrenar o aumentar clasificadores de baja resolucion, con la ventaja de que el modelo es lo bastante pequeno para ejecutarse en el mismo nodo que el entrenamiento.
- Educacion e investigacion sobre difusion: servir como banco de pruebas reproducible de rectified flow frente a DDPM, ya que el autor documenta dataset, LR y epocas, lo que facilita experimentos controlados de ablacion.
- Despliegue en *edge* o entornos sin GPU: con ~59,2 M de parametros en el denoiser, es viable ejecutar inferencia en CPU o en GPUs integradas, algo inviable con modelos de miles de millones de parametros.
- Generacion masiva de avatares e iconos de baja resolucion: la salida nativa de 256x256 es adecuada para avatares, favicons y sprites, donde no se requiere detalle fino.
- Pruebas de regresion en CI/CD de servicios de generacion de imagenes: usar el modelo como *smoke test* barato que valida que el pipeline de carga de pesos, tokenizacion y muestreo funciona antes de desplegar un modelo mayor.
- Investigacion sobre sesgos y seguridad en modelos entrenados con CC3M: al ser un modelo pequeno y con checkpoints que guardan metadatos de origen, resulta util para estudiar como se filtran sesgos de un dataset web a gran escala en un modelo de baja capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, Inception Score, comparativas con otros modelos ni curvas de perdida, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros conocidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no medida por el autor. Estimacion a partir del tamano: el pipeline completo (denoiser de 59,2 M + FLAN-T5-base ~250 M + VAE sd-vae-ft-mse ~83 M) suma del orden de 400 M de parametros; en fp32 ocuparia aproximadamente 1,6 GB de pesos y en fp16/bf16 alrededor de 0,8 GB, a lo que hay que sumar activaciones y cache del sampler. Con batch 1 a 256x256 deberia caber holgadamente en 4 GB de VRAM, pero es una estimacion, no un dato verificado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente. Niveles de referencia: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB; en el extremo profesional, A100 y H100 quedan muy sobredimensionadas para este tamano, por lo que solo tendrian sentido para generacion por lotes a gran escala.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU de consumo moderna. Tambien es plausible la inferencia en CPU, aunque no hay latencias publicadas.
- Opciones de despliegue: no se documenta ninguna integracion con vLLM (no aplica a modelos de difusion), llama.cpp, Ollama ni TGI. Tampoco se confirma compatibilidad con `diffusers`, dado que la arquitectura ZYI-DiT es propia del autor. Las opciones realistas son PyTorch nativo con el codigo del autor o una exportacion manual a ONNX/TensorRT, no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los valores de los modelos alternativos son cifras publicas aproximadas de sus respectivas documentaciones, no mediciones realizadas sobre ZYI-1.1-TINY.

| Modelo | Parametros del denoiser | Resolucion | Condicionamiento | Licencia | Datos de evaluacion publicados |
|---|---|---|---|---|---|
| ZYI-1.1-TINY | 59,2 M | 256x256 | FLAN-T5-base | Apache 2.0 | no disponibles |
| Stable Diffusion 1.5 | ~860 M (UNet) | 512x512 | CLIP ViT-L/14 | CreativeML Open RAIL-M | amplios (FID, CLIP score) |
| Tiny-SD (destilado de SD 1.5) | ~0,5 B (UNet destilado) | 512x512 | CLIP | CreativeML Open RAIL-M | limitados |
| PixArt-alpha | ~0,6 B (transformer) | hasta 1024x1024 | T5 | licencia propia del proyecto | amplios |

Frente a estas alternativas, ZYI-1.1-TINY es entre uno y dos ordenes de magnitud mas pequeno en el denoiser, pero tambien resuelve a menor resolucion (256x256 frente a 512 o 1024) y se ha ajustado sobre un subconjunto de solo 40.000 pares, muy lejos de los cientos de millones o miles de millones de ejemplos de los modelos de referencia. Su licencia Apache 2.0 es mas permisiva que la CreativeML Open RAIL-M de la familia SD 1.x, aunque hay que verificar las condiciones de los componentes de terceros que utiliza.

## Limitaciones y advertencias

- Modelo no validado: 0 descargas y 0 likes en el momento de la consulta, sin evaluacion independiente, sin FID ni CLIP score publicados. No hay evidencia de que la calidad de generacion sea utilizable en produccion.
- Entrenamiento con datos limitados: el ajuste se hizo sobre un maximo de 40.000 pares imagen-caption de CC3M, un volumen reducido que previsiblemente limita la diversidad de conceptos, el realismo y la adherencia al prompt.
- Riesgo de artefactos y de falta de coherencia: al ser un modelo de 59,2 M de parametros, es esperable la aparicion de estructuras deformadas, anatomia incorrecta y texto ilegible en las imagenes. Esto no es "alucinacion" en el sentido de los modelos de lenguaje, sino degradacion de la fidelidad visual.
- Sesgos del dataset: CC3M procede de captions web rastreados, con sesgos geograficos, culturales y de genero documentados en la literatura sobre Conceptual Captions. El modelo heredara esos sesgos y ademas los amplificara por su baja capacidad.
- Resolucion fija de 256x256: no se documenta soporte para resoluciones superiores, lo que descarta casos de uso que requieran detalle fino.
- Idiomas: el autor no declara idiomas soportados. FLAN-T5-base esta ajustado principalmente en ingles, por lo que es probable que el rendimiento con prompts en castellano sea deficiente, pero esto no esta verificado.
- Licencia y componentes de terceros: el modelo se publica bajo Apache 2.0, pero utiliza FLAN-T5-base (licencia Apache 2.0, de Google) y el VAE `stabilityai/sd-vae-ft-mse`, cuyas condiciones deben verificarse por separado antes de un uso comercial. El dataset CC3M tiene sus propios terminos de uso.
- Ausencia de informacion operativa: no se documentan pasos de muestreo recomendados, escala de guidance, formato exacto de los pesos, ni compatibilidad con librerias estandar, lo que complica su integracion en pipelines existentes.
- Fecha de publicacion registrada como 2026-09-25 (creacion y actualizacion con 40 segundos de diferencia), coherente con una subida inicial sin revisiones posteriores.
- No se dispone de informacion sobre el modelo base `caikybaldo999/ZYI-1-TINY` del que deriva, por lo que se desconoce su procedencia, sus datos de entrenamiento originales y su licencia.

## Enlaces

- HuggingFace: https://huggingface.co/caikybaldo999/ZYI-1.1-TINY
- Modelo base referenciado: `caikybaldo999/ZYI-1-TINY` (no se ha localizado informacion publica adicional)
- Dataset de ajuste fino: `pixparse/cc3m-wds` (CC3M / Conceptual Captions 3M)
- Codificador de texto: FLAN-T5-base
- VAE: `stabilityai/sd-vae-ft-mse`
- Paper, blog, repositorio de codigo o demo: no disponibles. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.
