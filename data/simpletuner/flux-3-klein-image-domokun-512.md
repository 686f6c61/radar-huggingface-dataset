# SimpleTuner/flux-3-klein-image-domokun-512

## Resumen

SimpleTuner/flux-3-klein-image-domokun-512 es un adaptador LoRA de tipo PEFT derivado de black-forest-labs/flux-3-image-klein-base, publicado por el equipo de SimpleTuner. No es un modelo autonomo: es un fichero de pesos de bajo rango (rank 32, alpha 32) que se carga sobre el transformer del modelo base para inyectar un concepto visual concreto sin reentrenar el modelo completo. El repositorio ocupa 1.9 GB, incluye los pesos del adaptador y las imagenes de ejemplo, y se distribuye bajo licencia "other".

El entrenamiento se realizo sobre el dataset interno denominado domokun-512, compuesto por solo 27 imagenes a 512 px, con recorte cuadrado aleatorio y sin datos de regularizacion. Se completaron 10.000 pasos (370 epocas) con prediccion de tipo flow matching, optimizador adamw_bf16, learning rate 1e-4 con calentamiento de 25 pasos, batch efectivo de 1 y gradient checkpointing activado en una unica GPU. El text encoder no se entreno, por lo que se reutiliza el del modelo base sin modificaciones.

Su relevancia es la de un caso tipico de personalizacion ligera: permite reproducir un concepto o personaje especifico en un pipeline de difusion moderno gastando una fraccion del coste de un fine-tuning completo. Conviene senalar que la model card indica que no se uso prompt de validacion durante el entrenamiento, que el modelo acumula 0 descargas y 0 likes, y que esta etiquetado como "not-for-all-audiences", por lo que su calidad y su contenido no estan validados por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre un transformer de difusion con flow matching (arquitectura interna del modelo base no detallada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; en el ambito de generacion de imagen equivale a la longitud de prompt admitida por el text encoder del modelo base, que no se especifica |
| Tipos de cuantizacion | Adaptador en BF16; la model card menciona qint8 mediante optimum.quanto como opcion de inferencia para ahorrar VRAM |
| Idiomas soportados | no disponible |
| Licencia | other (terminos concretos no detallados en el repositorio) |
| Formato de pesos | LoRA en formato diffusers, cargado con load_lora_weights; la extension exacta de los ficheros no se especifica |
| Tipo de artefacto | Adaptador LoRA (requiere el modelo base para funcionar) |
| Modelo base | black-forest-labs/flux-3-image-klein-base |
| Rank / alpha de LoRA | 32 / 32.0, dropout 0.0, inicializacion por defecto, modo Standard |
| Resoluciones de validacion | 512x512 y 1024x1024 |
| Tamano del repositorio | 1.9 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer de difusion del modelo base, que emplea prediccion de tipo flow matching. La configuracion LoRA es estandar: rank 32, alpha 32.0, dropout 0.0 y estilo de inicializacion por defecto. El text encoder quedo congelado durante todo el entrenamiento, de modo que el adaptador solo modifica la ruta generativa del transformer y no aprende nuevas representaciones de texto.

El entrenamiento consta de 370 epocas y 10.000 pasos sobre el dataset domokun-512: 27 imagenes a 512 px, un unico bucket de aspecto, recorte cuadrado aleatorio y sin datos de regularizacion. Se uso optimizador adamw_bf16 con learning rate 1e-4, planificador constant_with_warmup con 25 pasos de calentamiento, max grad norm 1.0, batch efectivo de 1 (micro-batch 1, acumulacion 1) y gradient checkpointing activado en una sola GPU. La precision de los parametros entrenables fue BF16 puro, la del modelo base se mantuvo sin cambios y la probabilidad de caption dropout fue del 0 %, por lo que el modelo depende fuertemente de las leyendas del dataset. No se empleo ningun prompt de validacion durante el entrenamiento; los ajustes de validacion documentados (CFG 3.5, CFG Rescale 0.0, 50 pasos, FlowMatchEulerDiscreteScheduler, semilla 42) corresponden a la inferencia posterior, no al proceso de entrenamiento.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con el concepto aprendido del dataset domokun-512.
- Conversión imagen a imagen (image-to-image), segun la etiqueta declarada en el repositorio.
- Plantilla de prompt observada en los ejemplos: "A photo of [marcador] ...", donde el marcador de disparo aparece representado en la model card mediante un cuadrado marron; tambien se muestran ejemplos con prompts incondicionales (prompt en blanco).
- Soporte de negative prompt en la llamada a la pipeline.
- Inferencia determinista reproducible mediante semilla manual (42 en los ejemplos) con FlowMatchEulerDiscreteScheduler.
- Generacion a 512x512 y 1024x1024, aunque el entrenamiento se hizo a 512 px.
- No dispone de tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso: es un modelo generativo de imagen, no un modelo de lenguaje.
- No hay capacidades de audio, vision de entrada ni modo de razonamiento (thinking mode).
- Capacidades multilingues: no disponibles; dependen del text encoder del modelo base, que no se entreno ni se documenta.

## Casos de uso

- Personalizacion de un concepto visual concreto: cargando el adaptador con load_lora_weights sobre el modelo base se puede reproducir el concepto aprendido en nuevas escenas sin reentrenar el pipeline completo, lo que reduce el coste a un fichero de 1.9 GB.
- Prototipado de assets para ilustracion o videojuegos: con 50 pasos, CFG 3.5 y muestreo FlowMatchEulerDiscreteScheduler se pueden generar variaciones rapidas de un personaje en distintos entornos (playa, parque nevado, estudio) usando la plantilla de prompt documentada.
- Creacion de datasets sinteticos: al controlar el concepto mediante LoRA se pueden producir imagenes etiquetadas de forma consistente a 512x512 para alimentar otros entrenamientos o tareas de vision.
- Edicion dirigida de imagenes existentes: la etiqueta image-to-image permite partir de una imagen y aplicar el estilo o la identidad aprendida, util para retoque y variaciones controladas.
- Experimentacion en investigacion sobre LoRA: con solo 27 imagenes, 10.000 pasos y rank 32 documentados, sirve como caso de referencia para estudiar sobreajuste, caption dropout y regimen de learning rate constante.
- Inferencia en equipos modestos: la model card ofrece cuantizacion qint8 con optimum.quanto y la pipeline admite ejecucion en cuda, mps o cpu, lo que facilita pruebas en portatiles o estaciones sin GPU de datacenter.
- Generacion por lotes en pipelines de contenido: integrando la pipeline de diffusers en un script de procesamiento por lotes se pueden producir variaciones con semilla fija para garantizar reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros adaptadores, y ademas indica explicitamente que no se uso prompt de validacion durante el entrenamiento.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion proporcionada; depende enteramente del modelo base flux-3-image-klein-base, cuyos parametros no se detallan.
- Peso del adaptador: el repositorio completo ocupa 1.9 GB, cifra que incluye imagenes de ejemplo ademas de los pesos LoRA.
- GPU recomendadas: no disponible. El entrenamiento se realizo en una unica GPU con gradient checkpointing, batch efectivo 1 y precision BF16, sin que se especifique el modelo de GPU empleado.
- Compatibilidad con GPU de consumo: no confirmada. La pipeline esta preparada para ejecutarse en cuda, mps (Apple Silicon) o cpu, y la model card sugiere cuantizar con optimum.quanto (qint8) para ahorrar VRAM.
- Opciones de despliegue: pipeline Flux3ImagePipeline de SimpleTuner (importada desde simpletuner.helpers.models.flux3_image.pipeline), libreria diffusers, carga del adaptador con load_lora_weights y cuantizacion opcional con optimum.quanto.
- vLLM, llama.cpp, Ollama o TGI: no documentados para este artefacto, que es un modelo de difusion y no un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| black-forest-labs/flux-3-image-klein-base | Modelo completo de difusion text-to-image | no disponible | no disponible | no disponible en la informacion proporcionada | publico en HuggingFace |
| SimpleTuner/flux-3-klein-image-domokun-512 | Adaptador LoRA sobre el anterior | no disponible (rank 32) | 512x512 y 1024x1024 en validacion | other | publico en HuggingFace, 0 descargas y 0 likes |

No se dispone de informacion sobre otros adaptadores comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 27 imagenes con un unico bucket de aspecto y sin datos de regularizacion, lo que favorece el sobreajuste al concepto y reduce la generalizacion a escenas o estilos fuera de distribucion.
- Caption dropout del 0 %: el adaptador depende fuertemente de las leyendas del dataset y puede comportarse de forma impredecible con prompts alejados de la plantilla "A photo of [marcador] ...".
- Ausencia de prompt de validacion durante el entrenamiento y de benchmarks publicados: no hay evidencia objetiva de calidad ni de fidelidad al concepto.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no existen informes independientes de uso.
- Etiqueta "not-for-all-audiences": el modelo puede generar contenido no apto para todo publico; requiere moderacion y filtrado en cualquier despliegue abierto.
- Licencia "other": los terminos no estan detallados en el repositorio, por lo que el uso comercial queda condicionado a lo que establezca el modelo base black-forest-labs/flux-3-image-klein-base y su licencia.
- Resolucion de entrenamiento de 512 px frente a validacion a 1024x1024: generar por encima de la resolucion entrenada puede degradar la coherencia visual.
- El text encoder no se entreno: el adaptador no incorpora vocabulario ni conceptos textuales nuevos y hereda los sesgos y el soporte idiomatico del modelo base, que no se documenta.
- Riesgo de artefactos y de contenido no solicitado propio de los modelos de difusion: la ausencia de metricas publicadas impide acotar su tasa de fallo.
- Idiomas soportados no disponibles: no hay garantia de que los prompts en castellano funcionen igual de bien que en el idioma usado para las leyendas del dataset.
- Repositorio de 1.9 GB que incluye imagenes de ejemplo; conviene revisar su contenido antes de reutilizarlo en entornos corporativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SimpleTuner/flux-3-klein-image-domokun-512
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Framework de entrenamiento SimpleTuner (autor del adaptador): https://github.com/bghira/SimpleTuner
