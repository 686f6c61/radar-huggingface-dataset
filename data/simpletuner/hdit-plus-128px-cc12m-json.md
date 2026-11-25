# SimpleTuner/hdit-plus-128px-cc12m-json

## Resumen

HDIT Plus 128px CC12M JSON es un modelo de difusion para generacion de imagenes text-to-image e image-to-image, publicado por el proyecto SimpleTuner en Hugging Face. Se distribuye en formato diffusers con pesos safetensors y esta etiquetado con la arquitectura `hdit_plus`, un transformer de difusion orientado a la sintesis de imagenes condicionada por texto. El modelo cuenta con 141.483.648 parametros (aproximadamente 141 millones) y el repositorio ocupa 5,7 GB, lo que sugiere la presencia de pesos completos en precision alta (fp32) ademas de posibles variantes.

El nombre del checkpoint indica que fue entrenado sobre el dataset CC12M (Conceptual Captions 12M) y que opera a una resolucion base de 128 pixeles, con anotaciones de texto en formato JSON. Se trata por tanto de un modelo de investigacion y experimentacion, no de un generador de imagenes de alta resolucion para produccion. Su interes actual reside en que sirve como referencia reproducible para estudiar el entrenamiento de arquitecturas DiT (diffusion transformer) con SimpleTuner, un framework de fine-tuning abierto, y para validar pipelines de difusion de bajo coste computacional.

La licencia es `other` (no estandar), el modelo esta marcado como `not-for-all-audiences` y no declara idiomas soportados. La model card incluye ejemplos de inferencia con prompts de fantasia, cyberpunk, escenas medievales y carteles de neon, todos con el mismo negative prompt (`blurry, cropped, ugly`), lo que refleja el estilo y las limitaciones del entrenamiento sobre CC12M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer), variante `hdit_plus` |
| Parametros totales | 141.483.648 (aprox. 141 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; sin contexto textual declarado) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estandar; revisar terminos del autor) |
| Formato de pesos | safetensors (integracion diffusers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de diffusion transformer (DiT) bajo la etiqueta `hdit_plus`, integrada en la libreria `diffusers`. En lugar de una U-Net convolucional clasica, un DiT procesa los parches latentes de la imagen como tokens y aplica atencion global, lo que facilita el escalado y la incorporacion de condicionamiento cruzado por texto. El checkpoint se distribuye como pipeline completo de text-to-image, con los componentes necesarios para la inferencia en diffusers.

El entrenamiento se realizo, segun la nomenclatura del checkpoint, sobre CC12M (Conceptual Captions, aproximadamente 12 millones de pares imagen-texto) a una resolucion de 128 pixeles, con anotaciones de caption en JSON. Se desconoce el numero exacto de tokens o pasos de entrenamiento, la composicion detallada del dataset, la resolucion nativa de las imagenes originales y si se aplicaron etapas de RLHF, DPO o fine-tuning preferencial; estos datos no estan disponibles en la informacion proporcionada. El modelo se genero con SimpleTuner, framework de entrenamiento y fine-tuning de modelos de difusion, lo que sugiere un flujo de entrenamiento reproducible y orientado a la experimentacion.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) mediante pipeline diffusers.
- Edicion y transformacion de imagenes (image-to-image), segun los tags del repositorio.
- Soporte de negative prompts en la inferencia (ejemplos con `blurry, cropped, ugly`).
- Generacion de escenas complejas descritas en lenguaje natural: paisajes de fantasia, entornos cyberpunk, escenas medievales, carteles con texto corto y composiciones con personajes.
- Capacidad limitada de renderizado de texto en imagen (los ejemplos incluyen carteles como "Open 24 Hours" o "Bar", aunque con fiabilidad no documentada).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada ni audio; es un modelo puramente generativo de imagen.

## Casos de uso

- Prototipado rapido de conceptos visuales: generar bocetos de 128 px para explorar direcciones artisticas antes de invertir en modelos de mayor resolucion, gracias a su bajo coste computacional.
- Investigacion en difusion: servir como linea base reproducible para estudiar el comportamiento de arquitecturas DiT entrenadas con SimpleTuner y comparar variantes de entrenamiento.
- Pruebas de pipelines diffusers: validar integraciones, schedulers y flujos de text-to-image e image-to-image en entornos de CI sin requerir GPUs de gran memoria.
- Generacion de datasets sinteticos de baja resolucion: producir imagenes de 128 px para tareas de aumento de datos, clasificacion o preentrenamiento de modelos de vision.
- Educacion y demos: ilustrar el funcionamiento de un diffusion transformer y de los negative prompts en talleres o tutoriales, dado su tamano manejable (141 M de parametros).
- Experimentos de estilo y composicion: explorar la respuesta del modelo a prompts de fantasia, cyberpunk o medieval para estudiar sesgos y estilos aprendidos de CC12M.
- Fine-tuning posterior: punto de partida para adaptaciones con SimpleTuner a dominios o estilos concretos, al ser un checkpoint pequeno y abierto en formato diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 141 M de parametros, los pesos en fp32 ocupan aproximadamente 0,57 GB; en fp16, unos 0,28 GB. A ello hay que sumar los componentes del pipeline (text encoder, VAE y scheduler), cuyo tamano no se detalla en la informacion proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) deberia ser suficiente por el reducido tamano del modelo; tambien A100 o H100 para lotes grandes, aunque no se documentan requisitos oficiales.
- Cabe en GPU consumer: si, previsiblemente en practicamente cualquier GPU con 4 GB o mas de VRAM, aunque el dato exacto no esta confirmado.
- Opciones de despliegue: diffusers (libreria oficial del checkpoint); no se documentan soportes de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no aplican a este pipeline de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion base | Contexto textual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HDIT Plus 128px CC12M JSON | 141 M | 128 px | no disponible | other | Hugging Face (diffusers) |
| Stable Diffusion 1.5 | aprox. 860 M (U-Net) | 512 px | 77 tokens | CreativeML OpenRAIL-M | Hugging Face, amplia comunidad |
| PixArt-alpha | aprox. 600 M (DiT) | 512 px | 120 tokens | OpenRAIL++-M | Hugging Face |
| SDXL | aprox. 2,6 B (U-Net) | 1024 px | 77 tokens | CreativeML OpenRAIL++-M | Hugging Face |

La comparativa es orientativa: HDIT Plus es un modelo de investigacion de 128 px y 141 M de parametros, muy por debajo en tamano y resolucion respecto a los generadores de imagen de referencia. No se dispone de datos de rendimiento comparables (FID, CLIP score u otras metricas) para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Resolucion nativa de 128 px: no es adecuado para produccion de imagenes de alta calidad sin upscaling posterior.
- Entrenado sobre CC12M, un dataset web con ruido y sesgos: es probable que reproduzca estereotipos y sesgos presentes en los captions e imagenes originales, aunque no se documentan sesgos especificos.
- Riesgo de alucinacion visual: puede generar composiciones incoherentes, anatomia incorrecta o texto ilegible, especialmente en escenas complejas.
- Marcado como `not-for-all-audiences`: puede producir contenido no apto para todos los publicos; se recomienda moderacion en despliegues abiertos.
- Licencia `other` no estandar: es imprescindible revisar los terminos del autor antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- Idiomas soportados no declarados: el rendimiento multilingue es desconocido y probablemente limitado al ingles de los captions de CC12M.
- Descargas y likes nulos en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad ni de mantenimiento activo.
- Sin benchmarks publicados: no es posible evaluar su calidad de forma objetiva frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/SimpleTuner/hdit-plus-128px-cc12m-json
- SimpleTuner (framework de entrenamiento): https://github.com/bghira/SimpleTuner
- Diffusers (libreria de inferencia): https://github.com/huggingface/diffusers
- Dataset CC12M (Conceptual Captions 12M): https://github.com/google-research-datasets/conceptual-12m
