# senigarcia/ddpm-healthy-mammogram-generation

## Resumen

`senigarcia/ddpm-healthy-mammogram-generation` es un modelo de difusion de tipo DDPM (Denoising Diffusion Probabilistic Model) entrenado por el usuario senigarcia para generar imagenes de mamografias consideradas sanas. El modelo se presenta como un checkpoint de PyTorch (`model008000.pt`) construido sobre la implementacion `guided_diffusion` de OpenAI, lo que lo situa en la estirpe de los modelos de difusion con muestreo guiado por clasificador.

El repositorio tiene un tamano de 2,8 GB, coherente con un UNet de difusion de resolucion media-alta, aunque no se especifica el numero de parametros ni la resolucion de entrenamiento. La model card es extremadamente escueta: no documenta el dataset, el numero de pasos de entrenamiento, la configuracion de muestreo ni los resultados cualitativos o cuantitativos.

La relevancia de este tipo de modelos reside en la generacion de datos sinteticos para aumento de datasets medicos, anonimizacion de imagenes y estudio de sesgos en imagenologia mamografica. No obstante, la ausencia de licencia, de metricas y de documentacion sobre el dataset limita seriamente su uso en produccion o en investigacion reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDPM (Denoising Diffusion Probabilistic Model) basado en `guided_diffusion` de OpenAI; backbone UNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo generativo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint en precision original de PyTorch) |
| Idiomas soportados | no disponible (modelo de imagen, sin interfaz de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`model008000.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DDPM descrita en el paper de Ho et al. (2020) e implementada en `guided_diffusion` de OpenAI: un UNet con bloques residuales, atencion multi-cabeza en resoluciones intermedias y condicionamiento por paso de difusion mediante embeddings sinusoidales. El nombre del checkpoint (`model008000.pt`) sugiere 8.000 pasos de entrenamiento, aunque no se confirma en la model card.

No se documenta el dataset de entrenamiento (numero de imagenes, resolucion, procedencia, preprocesado), ni si se empleo muestreo con guia por clasificador, ni la funcion de perdida exacta. Tampoco se indica si hubo aumento de datos, normalizacion especifica para mamografias o division train/val. La unica informacion tecnica disponible es que requiere la implementacion original de `guided_diffusion` y la configuracion de entrenamiento para cargar el checkpoint.

## Capacidades

- Generacion de imagenes sinteticas de mamografias etiquetadas como sanas mediante muestreo iterativo de ruido a imagen.
- Muestreo DDPM estandar (probablemente con opcion de muestreo DDIM si se usa la configuracion de `guided_diffusion`).
- Condicionamiento por clase o atributo: no disponible en la informacion proporcionada.
- Generacion condicionada por texto: no soportada (no hay encoder de texto en la arquitectura descrita).
- Tool calling / function calling: no aplica.
- Capacidades de agente o razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Edicion de imagen, inpainting o superresolucion: no documentadas.

## Casos de uso

- Aumento de datos para entrenamiento de clasificadores de cancer de mama: generar mamografias sinteticas sanas para equilibrar clases en datasets con pocos negativos, reduciendo el sesgo hacia la clase positiva.
- Anonimizacion y privacidad: sustituir imagenes reales de pacientes por sinteticas en demos, notebooks docentes o entornos de desarrollo sin exponer datos clinicos.
- Estudio de sesgos en modelos de deteccion: comparar la distribucion de las imagenes generadas con la de mamografias reales para detectar sesgos de textura, densidad mamaria o artefactos del equipo.
- Docencia en imagenologia: material visual para practicas de interpretacion de mamografias sin necesidad de acceder a un PACS hospitalario.
- Pruebas de estres de pipelines de imagen medica: alimentar sistemas de preprocesado (normalizacion, segmentacion, registro) con imagenes sinteticas para validar robustez.
- Investigacion en difusion medica: servir como baseline reproducible (con la configuracion adecuada) para comparar variantes de DDPM, schedulers o guias en el dominio mamografico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay FID, IS, precision/recall de clasificadores auxiliares ni evaluacion radiologica por expertos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el tamano del repo (2,8 GB) sugiere un checkpoint de aproximadamente 700 millones de parametros en fp32 o de mayor tamano en fp16, lo que implicaria del orden de 6-14 GB de VRAM para inferencia en precision nativa, dependiendo de la resolucion de muestreo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para muestreo a resoluciones altas; RTX 3090/4080 podrian ser suficientes a resoluciones moderadas.
- Cabe en GPU consumer: probablemente si en RTX 4090 (24 GB) y RTX 3090 (24 GB); en GPUs de 8-12 GB solo con muestreo por lotes pequenos o resolucion reducida, no confirmado.
- Opciones de despliegue: requiere la implementacion `guided_diffusion` de OpenAI y la configuracion de entrenamiento original; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion de imagen). Alternativas: scripts de muestreo de `guided_diffusion`, Diffusers (previa conversion del checkpoint, no documentada) o un wrapper propio en PyTorch.
- Latencia y throughput: no disponibles. En DDPM estandar el muestreo requiere cientos o miles de pasos, por lo que la latencia por imagen suele ser de segundos a decenas de segundos en GPU moderna, sin datos confirmados para este checkpoint.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| senigarcia/ddpm-healthy-mammogram-generation | DDPM (guided_diffusion) | no disponible | no disponible | no disponible | HuggingFace (0 descargas) |
| openai/guided-diffusion | DDPM/ADM | ~552 M (256x256) | 256x256 / 512x512 | MIT (codigo) | GitHub + checkpoints |
| CompVis/stable-diffusion-v1-4 | Latent diffusion | ~860 M UNet | 512x512 | CreativeML OpenRAIL-M | HuggingFace |
| runwayml/stable-diffusion-v1-5 | Latent diffusion | ~860 M UNet | 512x512 | CreativeML OpenRAIL-M | HuggingFace |

La comparativa es orientativa: no existen metricas publicadas de este checkpoint que permitan comparar calidad de generacion con los anteriores. La diferencia principal es que los modelos citados tienen licencia explicita y documentacion de entrenamiento, mientras que este checkpoint no.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; contactar con el autor antes de cualquier despliegue.
- Model card minima: sin dataset, sin metrica, sin resolucion, sin configuracion de muestreo; la reproducibilidad es practicamente nula sin el codigo de entrenamiento original.
- Riesgo de generar imagenes clinicamente no validas: un DDPM entrenado solo con casos sanos no modela patologia; no debe usarse para diagnostico ni como sustituto de datos reales en validacion clinica.
- Posible sobreajuste o memorizacion: con 8.000 pasos y sin datos de dataset no se puede descartar que el modelo reproduzca imagenes de entrenamiento, con riesgo de privacidad si el dataset original contenia datos identificables.
- Sesgo de dominio: si el dataset de entrenamiento provenia de un unico equipo, hospital o poblacion, las imagenes generadas heredaran ese sesgo (densidad mamaria, contraste, artefactos).
- Sin evaluacion radiologica: no hay validacion por radiologyos ni metricas de realismo (FID, precision/recall) publicadas.
- Dependencia de `guided_diffusion`: requiere clonar el repositorio de OpenAI y replicar la configuracion exacta; no hay conversion a Diffusers documentada.
- Cero descargas y cero likes: sin evidencia de uso o validacion por la comunidad.
- Alucinacion en el sentido de artefactos visuales: los DDPM pueden generar estructuras anatomicamente improbables; en dominio medico esto es un riesgo critico.

## Enlaces

- HuggingFace: https://huggingface.co/senigarcia/ddpm-healthy-mammogram-generation
- Implementacion de referencia `guided_diffusion` (OpenAI): https://github.com/openai/guided-diffusion
- Paper DDPM (Ho et al., 2020): https://arxiv.org/abs/2006.11239
- Paper Diffusion Models Beat GANs (Dhariwal y Nichol, 2021): https://arxiv.org/abs/2105.05233
