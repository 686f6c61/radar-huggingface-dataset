# akashimio/SeedVR2-3B-ncnn

## Resumen

SeedVR2-3B-ncnn es una conversion comunitaria del modelo ByteDance-Seed/SeedVR2-3B al formato ncnn con ejecucion Vulkan, publicada por el usuario akashimio. No se trata de un modelo entrenado desde cero ni de una cuantizacion de bajos bits: es una conversion de formato y de grafo con adaptaciones explicitas de ejecucion en perfil FP32-B, pensada para alimentar la aplicacion nativa seedvr2-ncnn-vulkan. El objetivo es permitir restauracion de imagen y video (pipeline video-to-video) en entornos donde no se dispone de PyTorch, CUDA ni pnnx, apoyandose en el runtime ncnn y en Vulkan.

El modelo base, SeedVR2-3B de ByteDance-Seed, es un transformer de difusion (DiT) de aproximadamente 3.000 millones de parametros orientado a restauracion de video en un solo paso de muestreo y con CFG=1. La conversion descompone la red en 36 grafos ncnn: el encoder del VAE, el patch-in, 32 bloques DiT, el patch-out y el decoder del VAE. Dos capas concretas, la atencion adaptativa por ventanas y las capas temporales del VAE, requieren el runtime especifico de este proyecto y no funcionan en redes ncnn estandar ni como checkpoints de Transformers.

Su relevancia ahora es practica: ofrece un paquete reproducible, verificado por hash SHA-256 y con recuperacion de descargas interrumpidas, que lleva un modelo de restauracion de video de 3B a un runtime nativo ligero, sin Python en la fase de inferencia. El repositorio ocupa 21,4 GB y contiene 53 objetos direccionados por SHA-256, de los cuales los paquetes de imagen y video comparten los datos del DiT. Existe ademas una variante mas ligera con almacenamiento de pesos DiT en FP16 (10,40 GB imagen / 11,05 GB video) manteniendo activaciones y aritmetica en FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para restauracion de imagen y video; 36 grafos ncnn: VAE encoder, patch-in, 32 bloques DiT, patch-out y VAE decoder |
| Parametros totales | ~3B (por el nombre del modelo y el checkpoint base ByteDance-Seed/SeedVR2-3B); cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de restauracion por difusion, no un modelo de lenguaje) |
| Tipos de cuantizacion | FP32-B como perfil numerico de referencia; variante adicional de almacenamiento de pesos DiT en FP16 con activaciones y aritmetica en FP32; no es una cuantizacion de bajos bits |
| Idiomas soportados | en, zh (etiquetas del repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | Grafos ncnn (param/bin) empaquetados como 53 objetos direccionados por SHA-256 mas catalog.json; no es safetensors ni GGUF |
| Tarea (pipeline) | video-to-video (restauracion de imagen y video) |
| Modelo base | ByteDance-Seed/SeedVR2-3B, revision 37255ff8cccfb01071b87f635a5948ca8d53117c |
| Tamano del repositorio | 21.441.543.211 bytes (21,4 GB) |
| Autor de la conversion | akashimio (no es una publicacion oficial de ByteDance ni de Tencent) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un DiT de difusion para restauracion de video, ejecutado en un unico paso de muestreo con CFG=1. La conversion ncnn distribuye el calculo en 36 grafos: encoder del VAE, patch-in, 32 bloques DiT, patch-out y decoder del VAE. Segun la propia model card, la atencion adaptativa por ventanas y las capas temporales del VAE son personalizadas y exigen el runtime del proyecto; no son, por tanto, redes ncnn de stock ni checkpoints compatibles con Transformers. El perfil FP32-B se define como referencia numerica explicita y no se reclama paridad con la ruta oficial CUDA en BF16 con Apex y FlashAttention.

No hubo entrenamiento por parte del autor de la conversion: se trata de una conversion de formato y grafo sobre el checkpoint oficial, reproducible a partir de las fuentes fijadas (checkpoint ByteDance-Seed/SeedVR2-3B revision 37255ff8, codigo fuente ByteDance-Seed/SeedVR commit e4de8c24, runtime ncnn 3b7bdba7, conversor pnnx 6a1bf000 y la herramienta de instalacion en el commit 64cd6e54). La informacion disponible no detalla el volumen de tokens, la composicion del dataset ni si el modelo base empleo RLHF o DPO; esos datos no estan publicados en el material proporcionado. Como innovacion tecnica destacable, la conversion elimina la necesidad de PyTorch y pnnx en la fase de inferencia y usa un unico motor de inferencia compartido por la CLI nativa, el worker web local y el SDK C++20.

## Capacidades

- Restauracion de video (video-to-video): reconstruccion de secuencias degradadas en un solo paso de difusion, con CFG=1.
- Restauracion de imagen: se ha validado una ejecucion real sobre un JPEG de 256 px que supero la comparacion de referencia FP32-B sin cambios en los 73 limites de tensor.
- Manejo de contenido temporal: las pruebas conservadas cubren movimiento natural de 9 fotogramas, relleno de cola de 8 fotogramas y cortes de 17 fotogramas, ademas de ejecuciones sinteticas de 17 fotogramas en CPU y Vulkan.
- Ejecucion sin PyTorch: inferencia nativa mediante ncnn y Vulkan; la descarga y la instalacion solo requieren la biblioteca estandar de Python 3.12 o superior.
- Verificacion de integridad: cada archivo descargado se comprueba con SHA-256 y el instalador admite reanudacion de descargas interrumpidas.
- Interfaz multiple: CLI nativa, worker web local y SDK C++20 sobre una misma implementacion de inferencia.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, thinking mode, audio o vision conversacional: no aplica (no es un modelo de lenguaje ni un modelo multimodal generativo).

## Casos de uso

- Restauracion de archivo audiovisual: digitalizacion de material antiguo o degradado aplicando el modelo fotograma a fotograma o por secuencias cortas, con la ventaja de ejecutar en CPU x86_64 Linux o en GPU NVIDIA via Vulkan sin instalar PyTorch.
- Limpieza de metraje de produccion: reparacion de ruido, compresion y artefactos en clips de 9 a 17 fotogramas validados, integrable en un pipeline de postproduccion que ya trabaje con Vulkan.
- Restauracion de imagenes sueltas: recuperacion de fotografias o fotogramas JPEG degradados mediante el paquete de imagen, con una ejecucion de referencia verificada a 256 px.
- Preprocesado para otros modelos: mejorar la calidad de entrada de un pipeline de vision por computador (deteccion, segmentacion, OCR) antes de pasarlo a etapas posteriores.
- Despliegue en equipos sin CUDA: al depender de ncnn y Vulkan, encaja en estaciones de trabajo Linux con GPU integrada o discreta compatible con Vulkan, o incluso en modo CPU puro.
- Aplicaciones de escritorio o herramientas internas: el SDK C++20 y la CLI nativa permiten empaquetar la restauracion dentro de una aplicacion sin arrastrar dependencias de Python en tiempo de ejecucion.
- Verificacion y auditoria de despliegues: el sistema de hashes SHA-256 y reviewed-packages.json permite fijar la identidad exacta del payload instalado en entornos con requisitos de trazabilidad.
- Transferencia a entornos aislados: el instalador admite modo offline, reutilizando paquetes ya descargados y validados, util para redes sin acceso a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de PSNR, SSIM, LPIPS ni de ninguna otra metrica de calidad perceptual para este paquete. Lo unico documentado son comprobaciones de paridad numerica e integridad:

| Prueba | Resultado |
|---|---|
| Integridad de identidad nativa de los paquetes de imagen y video | Superada |
| Trayectorias completas conservadas | 6 |
| Limites de tensor verificados | 73/73 con atol=rtol=0,001 sin cambios |
| Comparacion de referencia FP32-B con JPEG real de 256 px | Superada |
| Benchmarks de calidad (PSNR, SSIM, LPIPS) | No disponibles |
| Throughput o latencia medidos | No disponibles |

## Requisitos de hardware

- Perfil validado: SeedVR2 3B, FP32-B, un paso, CFG=1, sobre Linux x86_64 en CPU y sobre NVIDIA con Vulkan.
- Ruta de ejecucion: ncnn con Vulkan; la conversion no ofrece una ruta CUDA nativa ni se reclama paridad con la ruta oficial CUDA en BF16.
- VRAM estimada: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles; la unica indicacion es compatibilidad con NVIDIA bajo Vulkan y ejecucion en CPU x86_64.
- Encaje en GPU de consumo: no confirmado; no hay datos de VRAM ni de rendimiento que permitan afirmarlo.
- Almacenamiento necesario: 21,4 GB para el repositorio completo (53 objetos, imagen y video comparten los datos del DiT). La variante con almacenamiento FP16 ocupa 10,40 GB (imagen) y 11,05 GB (video). El tamano del paquete FP32 instalado no se detalla de forma explicita.
- Opciones de despliegue: aplicacion nativa seedvr2-ncnn-vulkan (CLI), worker web local y SDK C++20. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Nota de instalacion: los objetos deben instalarse a traves del instalador del proyecto; no se debe pasar el directorio objects/ directamente a la aplicacion nativa.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Precision | Ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| akashimio/SeedVR2-3B-ncnn (este) | ~3B | Grafos ncnn + catalogo SHA-256 | FP32-B | ncnn + Vulkan (CPU x86_64 Linux y NVIDIA) | Apache-2.0 | Publico en HuggingFace |
| akashimio/SeedVR2-3B-ncnn-dit-fp16 | ~3B | Grafos ncnn | Almacenamiento de pesos DiT en FP16, activaciones y aritmetica en FP32 | ncnn + Vulkan | Apache-2.0 | Publico en HuggingFace (10,40 GB imagen / 11,05 GB video) |
| ByteDance-Seed/SeedVR2-3B | ~3B | Checkpoint oficial (formato no detallado en la informacion) | Ruta oficial CUDA BF16 con Apex y FlashAttention (mencionada en la model card) | PyTorch/CUDA | No indicada en la informacion | Checkpoint oficial en HuggingFace |

No se dispone de modelos de restauracion de video adicionales en la informacion proporcionada para ampliar la comparativa con datos verificables.

## Limitaciones y advertencias

- No es una publicacion oficial de ByteDance ni de Tencent; es una conversion de la comunidad.
- El alcance validado es estrecho: SeedVR2 3B, FP32-B, un paso, CFG=1, en Linux x86_64 CPU y NVIDIA Vulkan. No se cubren otras configuraciones.
- No se reclama paridad con la ruta oficial CUDA en BF16, Apex y FlashAttention; los resultados numericos pueden diferir de la implementacion de referencia oficial.
- La atencion adaptativa por ventanas y las capas temporales del VAE requieren el runtime de este proyecto; no funcionan en ncnn estandar ni como checkpoints de Transformers.
- Pasar el directorio objects/ directamente a la aplicacion nativa es un error de uso; hay que instalar mediante el instalador del proyecto.
- Los hashes certifican integridad e identidad del payload, no calidad numerica ni perceptual.
- No hay benchmarks de calidad publicados, por lo que el rendimiento de restauracion real no puede cuantificarse con los datos disponibles.
- No hay informacion sobre sesgos, comportamiento con contenido sensible ni limites de idioma mas alla de las etiquetas en y zh.
- Riesgo de alucinacion y limites de contexto o idioma: no aplica en el sentido de un LLM; al ser un modelo de restauracion, el riesgo relevante es la generacion de detalle plausible pero no fiel al contenido original.
- Licencia Apache-2.0 para este paquete, lo que permite uso comercial, pero conviene verificar por separado las condiciones del checkpoint base de ByteDance-Seed antes de un despliegue en produccion.
- El coste de computo en FP32 sobre CPU puede ser elevado; no hay cifras de latencia ni de throughput que permitan planificar capacidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akashimio/SeedVR2-3B-ncnn
- Variante con almacenamiento FP16 del DiT: https://huggingface.co/akashimio/SeedVR2-3B-ncnn-dit-fp16
- Aplicacion nativa SeedVR2 ncnn Vulkan: https://github.com/mingshi2333/seedvr2-ncnn-vulkan
- Tutorial de compilacion y dependencias: https://github.com/mingshi2333/seedvr2-ncnn-vulkan/blob/main/docs/TUTORIAL.md
- Primera ejecucion y transferencia offline: https://github.com/mingshi2333/seedvr2-ncnn-vulkan/blob/main/docs/FIRST-RUN.md
- Mediciones de deriva y calidad de la variante FP16: https://github.com/mingshi2333/seedvr2-ncnn-vulkan/blob/main/docs/DIT-FP16-STORAGE.md
- Discusion tecnica en el repositorio de ncnn: https://github.com/Tencent/ncnn/discussions/6991
- Checkpoint base: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Repositorio fuente del modelo: https://github.com/ByteDance-Seed/SeedVR
- Resultados de la busqueda web: no se encontraron enlaces relevantes sobre este modelo (los resultados devueltos correspondian a paginas de ayuda de YouTube TV y no guardan relacion con el modelo).
