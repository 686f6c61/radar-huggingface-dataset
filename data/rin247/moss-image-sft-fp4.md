# Rin247/MOSS-Image-SFT-FP4

## Resumen

MOSS-Image-SFT-FP4 es un paquete de pesos cuantizados del modelo de difusion texto-a-imagen OpenMOSS-Team/MOSS-Image-SFT, publicado por el usuario Rin247 bajo el flujo de empaquetado que el autor denomina MECHA Forge. No se trata de un modelo entrenado desde cero: es una redistribucion del checkpoint SFT de la familia MOSS-Image de OpenMOSS, con el denoiser cuantizado a FP4 (weight-only) y el codificador de texto y el VAE mantenidos en FP8, empaquetados conjuntamente para simplificar el despliegue con diffusers.

El paquete contiene 3.001.238.026 parametros declarados en safetensors y ocupa 11,8 GB en el repositorio. Se distribuye como pipeline de diffusers (`MOSSImagePipeline`), con soporte de prompts en lenguaje natural, secuencias de etiquetas y layouts en JSON para controlar la posicion del texto y la disposicion de objetos, una capacidad especialmente relevante para generar carteles, rotulacion e infografias con texto legible.

Su interes ahora es doble: por un lado, permite ejecutar un modelo de la familia MOSS-Image con un denoiser de 4 bits en GPUs de consumo; por otro, al ser un paquete experimental con cero descargas y sin licencia declarada, sirve como banco de pruebas para medir la perdida de calidad que introduce la cuantizacion FP4 en un modelo de difusion, no como sustituto recomendado del checkpoint original. La informacion disponible no incluye resultados de evaluacion, ficha de licencia ni lista de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (pipeline `MOSSImagePipeline` de diffusers) con denoiser, codificador de texto y VAE; el tipo concreto de backbone del denoiser no se detalla en la informacion disponible |
| Parametros totales | 3.001.238.026 (suma de los componentes empaquetados, segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen); longitud maxima de prompt no disponible |
| Tipos de cuantizacion | Denoiser: FP4 weight-only; codificador de texto: FP8; VAE: FP8; el autor etiqueta el paquete como "8-bit" |
| Idiomas soportados | No disponible (los ejemplos de la model card usan ingles y chino) |
| Licencia | No disponible (ni la del paquete ni la del modelo base se indican en la informacion proporcionada) |
| Formato de pesos | safetensors (repositorio diffusers, 11,8 GB) |

## Arquitectura y entrenamiento

El paquete reproduce la arquitectura y el pipeline de inferencia de MOSS-Image-SFT, que a su vez deriva de MOSS-Image-Base mediante ajuste supervisado (SFT). La canalizacion es la habitual en difusion texto-a-imagen: un codificador de texto convierte el prompt en condicionamiento, un denoiser iterativo genera los latentes y un VAE los decodifica a pixeles. La model card no especifica el tipo de backbone del denoiser (DiT, MMDiT u otro), el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de preferencia (RLHF/DPO); esos datos deben consultarse en el informe tecnico enlazado, no en esta ficha.

La innovacion del paquete es exclusivamente de compresion: cuantizacion weight-only a FP4 del denoiser y retencion de codificador de texto y VAE en FP8 para limitar la degradacion en las partes mas sensibles. En la inferencia se observa el uso de `uncond_skip_layers=[22]`, un mecanismo de guiado por omision de capas (del tipo skip-layer guidance) en lugar de CFG clasico, con `guidance_scale=3.0` y 50 pasos como valores del ejemplo. Conviene notar una desviacion respecto a la referencia: el ejemplo oficial de MOSS-Image-SFT carga el VAE en `float32`, mientras que este paquete lo almacena en FP8, lo que puede afectar al detalle fino y a la legibilidad de texto pequeno.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024x1024 en el ejemplo oficial, con prompts en lenguaje natural.
- Renderizado de texto dentro de la imagen: el ejemplo de la model card genera una nota manuscrita en chino con varias lineas sobre la puerta de un frigorifico.
- Control de maquetacion mediante layouts en JSON, que permiten fijar la posicion del texto y la disposicion de los objetos.
- Soporte de secuencias de etiquetas (tag sequences) ademas de prompts descriptivos, util para estilos consistentes por lotes.
- Mejora de agrupacion de texto y organizacion espacial respecto a MOSS-Image-Base, segun la comparativa incluida por el autor (p. ej., pizarras y diagramas).
- Integracion con diffusers (`DiffusionPipeline` con `custom_pipeline="pipeline_moss_image"`) y con ComfyUI mediante el adaptador del repositorio oficial.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.
- Capacidades multilingues: solo se confirma de forma indirecta el uso de ingles y chino en los ejemplos; no hay lista oficial de idiomas.

## Casos de uso

- Generacion de creatividades de marketing con texto incrustado: el modelo puede producir carteles y banners donde el copy forma parte de la imagen, apoyandose en layouts JSON para colocar titulares y subtitulos en zonas concretas del lienzo.
- Rotulacion y senaletica en entornos simulados: renderizado de notas, etiquetas y carteles legibles (el ejemplo del autor es una nota manuscrita en chino) para prototipos de producto o ficcion.
- Prototipado de interfaces y pizarras: la mejora de organizacion espacial del SFT frente a Base lo hace util para generar mockups de paneles, diagramas de flujo y pizarras blancas con bloques de texto agrupados.
- Mockups de producto y e-commerce: generacion de escenas con objetos colocados segun una descripcion estructurada, util para variaciones creativas por lotes antes de una sesion fotografica real.
- Evaluacion de cuantizacion en investigacion: al ser un paquete FP4 experimental del mismo modelo, permite comparar lado a lado contra MOSS-Image-SFT en bf16 y medir la degradacion en fidelidad de texto, coherencia global y adherencia al prompt.
- Pruebas en pipelines de difusion autoalojados: al empaquetar denoiser, codificador de texto y VAE juntos, reduce el trabajo de ensamblaje en despliegues con diffusers o ComfyUI en GPUs de 16 GB.
- Generacion de datos sinteticos con texto controlado: util para aumentar datasets de OCR o de deteccion de texto en imagen, siempre que se valide previamente la legibilidad del texto generado con el VAE en FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP-score, precision de OCR, adherencia al prompt) ni comparaciones numericas frente a MOSS-Image-SFT en precision completa; solo una comparativa cualitativa Base frente a SFT en dos imagenes de ejemplo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como medida oficial. Como referencia de orden de magnitud, el repositorio pesa 11,8 GB, por lo que un presupuesto de 12-16 GB de VRAM es un punto de partida razonable para 1024x1024 con 50 pasos; el calculo exacto debe hacerse midiendo el pico real, ya que los latentes a 1024x1024 y el VAE anaden memoria no reflejada en el tamano de los pesos.
- GPU recomendadas: series NVIDIA con soporte CUDA. Una RTX 4090 (24 GB) o RTX 4080 (16 GB) deberian cubrir el ejemplo oficial; para lotes multiples o resoluciones mayores se recomienda A100/H100. No hay datos de latencia ni throughput publicados.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 16 GB (RTX 4060 Ti 16 GB, 4070 Ti Super, 4080, 4090). En tarjetas de 8-12 GB sera necesario reducir resolucion o descargar componentes.
- Entorno software exigido por el autor: Python 3.10 o superior, PyTorch 2.9 o superior compilado para la CUDA del sistema, `diffusers>=0.38`, `transformers>=5.3`, `accelerate>=1.10`, `safetensors>=0.6`, `Pillow>=10`.
- Opciones de despliegue: diffusers con `custom_pipeline="pipeline_moss_image"` y `trust_remote_code=True`; ComfyUI mediante el adaptador del repositorio oficial. No hay soporte declarado para llama.cpp, Ollama, TGI ni vLLM, que no aplican a un pipeline de difusion de este tipo.
- Nota sobre el empaquetado: la carga del pipeline requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de usarlo en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rin247/MOSS-Image-SFT-FP4 (este) | 3.001.238.026 | Denoiser FP4, texto y VAE FP8 | 1024x1024 en el ejemplo; entrenado para mayores resoluciones: no disponible | No disponible | HF, 0 descargas, 0 likes, marcado como experimental |
| OpenMOSS-Team/MOSS-Image-SFT | No disponible en la informacion proporcionada | Sin cuantizar (bf16/fp32 en el ejemplo) | Igual pipeline y resolucion | No disponible | HF y ModelScope |
| OpenMOSS-Team/MOSS-Image-Base | No disponible en la informacion proporcionada | Sin cuantizar | Igual pipeline y resolucion | No disponible | HF y ModelScope |
| Alternativas de la misma categoria (FLUX.1, Qwen-Image, SD 3.5) | No disponible en la informacion proporcionada | No aplica | No disponible | No disponible | No verificadas en esta busqueda |

La unica comparacion con datos verificables es interna a la familia MOSS-Image: este paquete frente al SFT original. Frente a otros modelos texto-a-imagen no se dispone de cifras contrastadas, por lo que no se ofrece comparacion cuantitativa.

## Limitaciones y advertencias

- Paquete experimental sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad ni resultados publicados.
- Licencia no declarada: no se puede confirmar el uso comercial. Al derivar de MOSS-Image-SFT, la licencia del modelo base condiciona cualquier despliegue; hay que verificarla en el repositorio original antes de usar el paquete en produccion.
- Riesgo de degradacion por cuantizacion FP4 en el denoiser: no hay evaluacion publicada del impacto en fidelidad, adherencia al prompt ni, especialmente, en la legibilidad del texto renderizado.
- Desviacion del VAE a FP8 frente al `float32` del ejemplo oficial: puede introducir artefactos en detalles finos, texto pequeno y bordes de alto contraste. Es el primer punto a validar antes de adoptarlo.
- Ejecucion de codigo remoto: el pipeline exige `trust_remote_code=True`; hay que auditar el codigo del repositorio.
- Idiomas no documentados: solo hay evidencia de ingles y chino en los ejemplos; el rendimiento en castellano o en alfabetos no latinos distintos del chino no esta verificado.
- Alucinacion visual y errores de composicion: como cualquier modelo de difusion, puede omitir objetos del prompt, duplicar elementos o generar texto mal formado, especialmente con prompts largos o layouts JSON complejos.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo demografico o cultural.
- Requisitos estrictos de version: `transformers>=5.3`, `diffusers>=0.38` y PyTorch 2.9 o superior limitan la compatibilidad con stacks existentes.
- Sin datos de rendimiento: no hay cifras de latencia, throughput ni memoria pico, imprescindibles para dimensionar produccion.

## Enlaces

- Repositorio del paquete: https://huggingface.co/Rin247/MOSS-Image-SFT-FP4
- Modelo base (SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base (Base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- ModelScope (Base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Repositorio de codigo: https://github.com/OpenMOSS/MOSS-Image
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- arXiv: https://arxiv.org/abs/2610.23374
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guia de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Integracion ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Plataforma API MOSI: https://platform.mosi.cn/?utm_source=huggingface&utm_medium=readme&utm_campaign=imageapi
- Cuenta de X de OpenMOSS: https://x.com/Open_MOSS
- Discord de la comunidad: https://discord.gg/nXFWEyvbb
