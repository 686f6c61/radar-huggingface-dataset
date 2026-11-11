# kisersantine/emmayoung

## Resumen

`kisersantine/emmayoung` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion text-to-image Krea 2, desarrollado por el usuario kisersantine y publicado bajo licencia Apache 2.0. No se trata de un modelo base completo, sino de un conjunto de pesos adicionales (1,0 GB en el repositorio) que se cargan sobre Krea 2 para inyectar un concepto concreto: la representacion de la persona publica Emma Watson, invocada mediante el token de activacion `EmmaWatson`.

El adaptador esta entrenado sobre Krea 2 RAW y, segun la model card, se muestra funcionando sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`. Su proposito es permitir la generacion de imagenes fotorrealistas o estilizadas de ese concepto en multiples escenarios (retrato cinematografico, fantasia, escenas de epoca) manteniendo la calidad del modelo base. Es relevante en el ecosistema de personalizacion de difusion porque demuestra el flujo habitual de LoRA sobre modelos Krea 2 y porque su licencia permisiva facilita su inspeccion y reutilizacion tecnica.

El repositorio es muy reciente (creado el 8 de noviembre de 2026), acumula 40 descargas y ningun "like", y no incluye informacion sobre el dataset de entrenamiento, hiperparametros ni evaluaciones cuantitativas. La ficha se limita, por tanto, a lo declarado por el autor y a las caracteristicas inferibles de la arquitectura del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion text-to-image Krea 2 |
| Parametros totales | no disponible (el repositorio ocupa 1,0 GB; el numero de parametros del adaptador no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (en difusion no aplica el concepto de contexto de tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en el formato propio de diffusers; el modelo base admite bfloat16 segun el ejemplo de la model card) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos de LoRA compatibles con la libreria diffusers (carga mediante `load_lora_weights`) |
| Modelo base | krea/Krea-2-Raw (mostrado sobre krea/Krea-2-Turbo) |
| Token de activacion | `EmmaWatson` |
| Libreria | diffusers |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El adaptador sigue la tecnica LoRA (Low-Rank Adaptation) aplicada a un modelo de difusion text-to-image. En lugar de reentrenar todos los pesos de Krea 2, se insertan matrices de bajo rango en determinadas capas del modelo base y solo esas matrices se optimizan, lo que reduce drasticamente el coste de entrenamiento y el tamano del artefacto resultante (1,0 GB en este caso). La model card indica que el entrenamiento es de tipo DreamBooth-LoRA, es decir, un ajuste supervisado con un conjunto de imagenes de un unico concepto y un token de activacion dedicado (`EmmaWatson`) para evitar que el concepto se mezcle con el vocabulario generico del modelo.

El entrenamiento se realizo sobre Krea 2 RAW, la variante no destilada del modelo base, mientras que las muestras publicadas se generaron sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere que el adaptador es compatible con la variante destilada de pocos pasos. No se especifican en la informacion disponible el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango de las matrices LoRA ni si se aplicaron tecnicas adicionales como regularizacion por clase, prior preservation o aumentado de datos. Tampoco se documenta el uso de RLHF/DPO, algo que en difusion no aplica del mismo modo que en modelos de lenguaje.

## Capacidades

- Generacion de imagenes text-to-image condicionada por prompt en lenguaje natural, heredando las capacidades del modelo base Krea 2.
- Personalizacion de un concepto concreto (la representacion de Emma Watson) mediante el token `EmmaWatson`, que debe incluirse en el prompt para activar el adaptador.
- Composicion de escenas complejas: retratos cinematograficos, entornos de fantasia, interiores de epoca y ambientaciones cyberpunk, segun los ejemplos de la model card.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers y con la variante Turbo de pocos pasos (8 pasos en los ejemplos).
- Control de estilo mediante el prompt (iluminacion, vestuario, entorno), sin que se documenten capacidades de control estructural como ControlNet, inpainting o img2img especificas del adaptador.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo generativo de imagenes, no un modelo de lenguaje.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles y no se declara soporte de otros idiomas.

## Casos de uso

- Creacion de retratos cinematograficos personalizados: el adaptador permite generar imagenes de alta calidad del concepto `EmmaWatson` en ambientaciones definidas por el prompt, como el ejemplo de hacker cyberpunk en un callejon de Tokio, util para pruebas de concepto visuales o moodboards.
- Ilustracion de escenas de fantasia: con prompts que describan armaduras, reinos flotantes o paisajes, el LoRA mantiene la identidad del concepto dentro de entornos no realistas, adecuado para prototipos de portadas o arte conceptual.
- Escenas de epoca y atmosferas intimas: el ejemplo de la biblioteca victoriana demuestra que el adaptador responde a descripciones de iluminacion y entorno, lo que sirve para generar imagenes de estilo editorial o narrativo.
- Pruebas de integracion en pipelines de diffusers: al cargarse con `pipe.load_lora_weights`, el adaptador es util para validar flujos de trabajo de personalizacion sobre Krea 2 Turbo en entornos de desarrollo, incluyendo la sustitucion de LoRAs en produccion.
- Generacion de variaciones de estilo sobre un mismo concepto: combinando el token con modificadores de estilo (cine, ilustracion, fotografia analogica) se pueden explorar direcciones artisticas sin reentrenar el modelo base.
- Experimentacion academica con LoRA y DreamBooth: el repositorio, con licencia Apache 2.0, sirve como ejemplo reproducible de adaptacion de bajo rango sobre un modelo de difusion reciente, aunque el dataset y los hiperparametros no esten documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud facial, etc.) ni comparaciones numericas con otros adaptadores o con el modelo base sin LoRA. Las unicas referencias de rendimiento son cualitativas: las muestras se generaron sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del modelo base Krea 2, que no se detalla en la informacion proporcionada. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que implica una GPU con memoria suficiente para el pipeline completo en bfloat16.
- GPU recomendadas: no disponibles. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) ni requisitos minimos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el tamano del adaptador (1,0 GB) es reducido, pero el consumo dominante corresponde al modelo base.
- Opciones de despliegue: la unica via documentada es la libreria diffusers mediante `Krea2Pipeline` y `load_lora_weights`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles. Solo se indica que las muestras se generaron con 8 pasos de inferencia sobre la variante Turbo.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para Krea 2 ni sobre sus parametros, contexto o rendimiento, por lo que la comparativa cuantitativa no esta disponible. A continuacion se contrasta con alternativas genericas de la misma categoria (personalizacion de difusion) a partir de caracteristicas publicas conocidas, sin datos de rendimiento de este adaptador.

| Modelo / adaptador | Tipo | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|
| kisersantine/emmayoung | LoRA DreamBooth | Krea 2 RAW / Turbo | Apache 2.0 | Hugging Face (40 descargas) |
| Adaptadores LoRA para SDXL | LoRA | Stable Diffusion XL | Variable (a menudo CreativeML OpenRAIL-M) | Amplia en Hugging Face y Civitai |
| Adaptadores LoRA para Flux | LoRA | Flux.1 | Variable (a menudo no comercial) | Amplia en Hugging Face |
| DreamBooth completo sobre SD | Fine-tuning completo | Stable Diffusion 1.5 / SDXL | Variable | Requiere entrenamiento propio |

La comparativa de rendimiento, contexto y parametros entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador representa a una persona publica real; su uso para generar imagenes que puedan difundirse como reales o para fines difamatorios plantea riesgos eticos y legales, con independencia de la licencia del artefacto.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible o incoherencias en escenas complejas, especialmente con pocos pasos de inferencia.
- No se documenta el dataset de entrenamiento, por lo que no puede evaluarse el sesgo de las imagenes originales ni el grado de sobreajuste al concepto.
- El token `EmmaWatson` es obligatorio para activar el concepto; su omision o su combinacion con otros LoRAs puede degradar el resultado o provocar interferencias.
- La licencia Apache 2.0 del repositorio no exime del cumplimiento de las condiciones del modelo base Krea 2 ni de la legislacion aplicable sobre imagen y derechos de terceros.
- No hay informacion sobre el comportamiento multilingue: los prompts en idiomas distintos del ingles no estan validados.
- El repositorio es muy reciente y con pocas descargas (40) y ningun "like", por lo que no existe validacion comunitaria significativa.
- No se declaran limitaciones especificas de contexto ni de resolucion; cualquier restriccion de este tipo proviene del modelo base, cuyas caracteristicas no se detallan en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kisersantine/emmayoung
- Modelo base (RAW): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (Turbo, usado en las muestras): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
- Documentacion de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
