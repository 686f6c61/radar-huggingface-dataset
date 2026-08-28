# changwangss/sdxl-base-1.0-mxfp4-nosmooth-rtn

## Resumen

El modelo `changwangss/sdxl-base-1.0-mxfp4-nosmooth-rtn` es una versión cuantizada del checkpoint base de Stable Diffusion XL 1.0, publicada por el usuario changwangss en Hugging Face. Se trata de una adaptación del modelo original de Stability AI, que reduce la precisión de los pesos a un formato de coma flotante de 4 bits (MXFP4) mediante redondeo directo (rtn) sin suavizado. El objetivo es reducir el tamaño del modelo y los requisitos de memoria para facilitar su despliegue en entornos con recursos limitados, como GPUs de consumo o inferencia en el borde.

El modelo conserva la arquitectura de difusión latente de SDXL base, compuesta por un UNet y un autoencoder VAE, con un total de 1.768.858.884 parámetros según el archivo safetensors. El repositorio pesa 4,4 GB, lo que indica una compresión significativa respecto a los pesos originales en FP16. Aunque la cuantización permite una inferencia más ligera, es esperable una degradación en la calidad de las imágenes generadas en comparación con el modelo sin cuantizar.

Dado que la licencia y los idiomas soportados no están especificados en la página del modelo, su uso en producción requiere verificar estos aspectos con el autor. No se han publicado benchmarks específicos para esta versión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL Base 1.0 (latent diffusion, UNet + VAE) |
| Parametros totales | 1.768.858.884 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | MXFP4 (4-bit floating point), redondeo directo (rtn) sin suavizado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint `stable-diffusion-xl-base-1.0` de Stability AI. La arquitectura original emplea un UNet como red de denoising y un autoencoder VAE para el espacio latente, con un total de 3,5 mil millones de parametros en FP16. La version cuantizada reduce cada peso a 4 bits usando el formato MXFP4 (microscaling floating point), que agrupa los valores en bloques y aplica un factor de escala compartido. El sufijo `nosmooth-rtn` indica que se ha utilizado redondeo al entero mas cercano sin tecnicas de suavizado (como las empleadas en otras cuantizaciones para mitigar la perdida de precision).

No se dispone de informacion sobre el proceso de entrenamiento de esta version cuantizada, ya que no se trata de un reentrenamiento sino de una transformacion de los pesos del modelo original. Tampoco se especifican los datos de entrenamiento del modelo base, aunque se sabe que SDXL 1.0 fue entrenado con un amplio conjunto de imagenes y textos.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, con resolucion nativa de 1024x1024 pixeles.
- Soporte de texto condicionado en ingles (aunque no se especifica oficialmente, el modelo base SDXL funciona mejor con prompts en ingles).
- Capacidad de generar imagenes fotorrealistas y artisticas gracias al entrenamiento del modelo base.
- Compatible con el pipeline `StableDiffusionXLPipeline` de la libreria diffusers, lo que permite su integracion en flujos de trabajo existentes.
- La cuantizacion MXFP4 permite una inferencia mas rapida y con menor consumo de memoria en comparacion con el modelo FP16, a costa de una posible reduccion en la fidelidad de los detalles finos.

## Casos de uso

- Generacion de imagenes en dispositivos con recursos limitados: al ocupar 4,4 GB en disco y requerir menos VRAM que el modelo original, puede ejecutarse en GPUs de consumo como la RTX 3060 o incluso en CPU con suficiente RAM, habilitando prototipos rapidos o aplicaciones offline.
- Servicios de generacion de imagenes por lotes: en entornos donde el coste de memoria es critico, como funciones serverless o contenedores con limites de memoria, esta version cuantizada permite procesar multiples solicitudes simultaneas sin agotar los recursos.
- Experimentacion con cuantizacion agresiva: para investigadores que estudian el impacto de la precision reducida en modelos de difusion, este checkpoint sirve como ejemplo de una cuantizacion MXFP4 sin suavizado y con redondeo directo.
- Integracion en pipelines de diffusers existentes: al ser compatible con la API estandar, se puede sustituir el modelo original por esta version cuantizada sin cambios en el codigo, facilitando pruebas A/B de calidad frente a rendimiento.
- Generacion de imagenes en tiempo real para aplicaciones interactivas: la menor carga computacional permite tiempos de inferencia mas cortos, lo que es util en herramientas de dibujo asistido o editores con vista previa instantanea.
- Despliegue en entornos edge o embebidos: aunque SDXL no esta disenado para dispositivos muy limitados, la cuantizacion a 4 bits reduce la huella de memoria hasta un punto que podria permitir su uso en mini-PCs o estaciones de trabajo modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una cuantizacion no oficial, no existen mediciones estandarizadas (FID, CLIP score, etc.) que comparen esta version con el modelo original. Se recomienda realizar evaluaciones propias si se considera su uso en aplicaciones donde la calidad de imagen sea critica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (4,4 GB) sugiere que los pesos en disco ocupan ese espacio, pero la VRAM necesaria depende de la resolucion de salida, el batch size y la implementacion. Con cuantizacion MXFP4, es plausible que quepa en GPUs con 6-8 GB de VRAM, pero no se ha confirmado.
- GPU recomendadas: no se especifican. En principio, cualquier GPU compatible con CUDA y con suficiente VRAM deberia funcionar. Para una inferencia comoda se recomienda al menos una GPU con 8 GB de VRAM.
- Opciones de despliegue: al ser un modelo de diffusers, se puede cargar con la libreria `diffusers` en Python. Tambien es compatible con servidores de inferencia como vLLM o TGI, aunque estos estan orientados a modelos de lenguaje, no a difusion. Para despliegue en produccion se puede usar un contenedor con la API de diffusers o herramientas como Stable Diffusion WebUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano del repo | Licencia | Uso tipico |
|---|---|---|---|---|---|
| `stabilityai/stable-diffusion-xl-base-1.0` (original) | 3,5 B | FP16 | ~7 GB | CreativeML Open RAIL++-M | Generacion de imagenes de alta calidad |
| `changwangss/sdxl-base-1.0-mxfp4-nosmooth-rtn` (este modelo) | 1,77 B (cuantizado) | MXFP4 (4 bits) | 4,4 GB | no disponible | Inferencia ligera en recursos limitados |
| `NexaAI/sdxl-base` (version cuantizada de NexaAI) | 3,5 B (cuantizado) | no especificado | no disponible | no disponible | Despliegue eficiente de SDXL |

La comparativa se basa en datos publicos. La version de NexaAI no tiene informacion detallada en la busqueda, por lo que no se pueden extraer conclusiones solidas. Este modelo destaca por su cuantizacion MXFP4 especifica, mientras que el original es el punto de referencia en calidad.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede provocar una perdida notable de calidad en las imagenes generadas, especialmente en texturas finas, gradientes suaves y detalles pequenos. Es recomendable comparar visualmente con el modelo original antes de usarlo en produccion.
- No se especifica la licencia del modelo, lo que impide conocer si permite uso comercial o si existen restricciones derivadas del modelo base (que usa la licencia CreativeML Open RAIL++-M). Se debe contactar con el autor para aclararlo.
- Los idiomas soportados no estan documentados. El modelo base SDXL funciona mejor con prompts en ingles, pero no se garantiza el comportamiento con otros idiomas.
- No hay garantias sobre el rendimiento en diferentes hardware. La cuantizacion MXFP4 puede requerir soporte especifico de la GPU o del runtime (por ejemplo, ciertas instrucciones para operaciones de 4 bits).
- Al ser una publicacion reciente (agosto de 2026) y con cero descargas, no hay comunidad ni soporte establecido. Cualquier problema debe resolverse directamente con el autor.
- El modelo no incluye el refiner de SDXL, por lo que la calidad final puede ser inferior a la del pipeline completo (base + refiner).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changwangss/sdxl-base-1.0-mxfp4-nosmooth-rtn
- Modelo original de Stability AI: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Version cuantizada de NexaAI (referencia): https://huggingface.co/NexaAI/sdxl-base
- Pagina de SDXL en ModelScope: https://www.modelscope.cn/models/NexaAIDev/sdxl-base/summary
- Checkpoint en Civitai: https://civitai.com/models/101055?modelVersionId=126601
- Repositorio de referencia en GitHub: https://github.com/andrewcchoi/stabilityai-stable-diffusion-xl-base-1.0
