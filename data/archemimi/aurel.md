# Archemimi/aurel

## Resumen

Archemimi/aurel es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Archemimi sobre los pesos de Krea 2 RAW y validado en Krea 2 Turbo. El adaptador introduce un concepto visual activado mediante el token `aurel`, que el autor emplea en las muestras para generar objetos y elementos fantásticos (drones flotantes, mariposas doradas, orbes luminosos) integrados de forma coherente en escenas diversas.

El modelo no es un modelo base autónomo, sino un complemento que debe cargarse sobre el pipeline Krea 2. Su relevancia es acotada: se trata de un LoRA experimental con muy poca tracción en la comunidad (13 descargas y 0 likes en el momento de la consulta), publicado bajo licencia Apache 2.0 y con un tamaño de repositorio de 1,0 GB. No se dispone de información sobre la composición del dataset de entrenamiento, el número de pasos ni los hiperparámetros empleados.

La ficha se basa exclusivamente en los metadatos y la model card publicados en Hugging Face. Cualquier dato no presente en esa información se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre un modelo de difusion texto-a-imagen (Krea 2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); no disponible el maximo de tokens de prompt |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea bfloat16 para el pipeline base) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con diffusers (load_lora_weights); no se detalla el formato de fichero |
| Modelo base | krea/Krea-2-Raw (entrenamiento), krea/Krea-2-Turbo (inferencia en muestras) |
| Tamano del repositorio | 1,0 GB |
| Token de activacion | `aurel` |
| Libreria | diffusers |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth que se inyecta en las capas de atencion del modelo de difusion Krea 2. El autor indica que el entrenamiento se realizo sobre Krea 2 RAW, mientras que las imagenes de muestra se generaron con Krea 2 Turbo en 8 pasos de inferencia y `guidance_scale=0.0`. Esta separacion sugiere que el LoRA se entrena sobre la variante no destilada y se aplica en produccion sobre la variante Turbo, mas rapida.

No se han publicado detalles sobre el numero de imagenes del dataset, la resolucion de entrenamiento, el rank del LoRA, la tasa de aprendizaje, el numero de pasos ni si se aplicaron tecnicas de regularizacion o prior preservation. Tampoco se documenta el proceso de captura o curacion del concepto `aurel`. Toda esta informacion se considera no disponible.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `aurel`, que actua como disparador del concepto aprendido.
- Integracion del concepto en escenas muy diversas: entornos urbanos cyberpunk, paisajes naturales y espacios interiores goticos, segun las muestras publicadas.
- Composicion con otros elementos del prompt: el autor demuestra que el concepto puede combinarse con iluminacion, atmosfera y objetos secundarios sin perder coherencia.
- Compatibilidad con el pipeline `Krea2Pipeline` de diffusers mediante `load_lora_weights`.
- Inferencia rapida en la variante Turbo (8 pasos, `guidance_scale=0.0`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, ya que no aplican a un modelo de generacion de imagen.
- Capacidades multilingues: no disponibles; los prompts de ejemplo estan en ingles.

## Casos de uso

- Ilustracion conceptual de elementos fantásticos: el LoRA permite generar de forma consistente objetos como drones, mariposas u orbes luminosos asociados al token `aurel`, util para bocetos de direccion de arte en videojuegos o narrativa visual.
- Prototipado rapido de assets para entornos de ficcion: con 8 pasos en Krea 2 Turbo, se pueden iterar variaciones de un mismo concepto en escenas distintas (ciudad, naturaleza, interior) sin reentrenar.
- Generacion de imagenes de ambientacion para campañas de marketing: al estar bajo Apache 2.0, el adaptador puede integrarse en pipelines comerciales de generacion de imagenes, siempre que se respete la licencia del modelo base.
- Creacion de material visual para blogs y documentacion tecnica: el concepto `aurel` puede usarse como mascota o elemento grafico recurrente en articulos, con consistencia entre publicaciones.
- Experimentacion academica sobre personalizacion de modelos de difusion: el LoRA sirve como caso de estudio de DreamBooth sobre Krea 2, aunque la ausencia de documentacion del entrenamiento limita su valor como referencia reproducible.
- Integracion en herramientas de diseno asistido: mediante diffusers, el adaptador puede cargarse en un servicio interno que exponga generacion de imagenes con el concepto `aurel` como preset.
- Generacion de variaciones estilisticas para moodboards: combinando el token con modificadores de estilo (gotico, cyberpunk, pastoral) se obtienen familias visuales coherentes para presentaciones creativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye tres imagenes de muestra generadas con Krea 2 Turbo en 8 pasos, sin metricas cuantitativas (FID, CLIP score, similitud al concepto, etc.) ni comparaciones con otros LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El pipeline base Krea 2 Turbo se ejecuta en bfloat16 sobre GPU CUDA; el adaptador LoRA anade una sobrecarga pequena respecto al modelo base, pero no se documenta la VRAM total necesaria.
- GPU recomendadas: no disponibles en la informacion proporcionada. El ejemplo de la model card usa `.to("cuda")` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Depende de los requisitos del modelo base Krea 2, que no se detallan en la ficha.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights` es el unico metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. Solo se indica que las muestras se generaron en 8 pasos de inferencia con Krea 2 Turbo.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRA o adaptadores comparables para Krea 2 en la documentacion proporcionada. La siguiente tabla recoge unicamente los datos conocidos del modelo base y del adaptador, sin comparaciones de rendimiento.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Archemimi/aurel | LoRA DreamBooth sobre Krea 2 | no disponible | no aplica | Apache 2.0 | Hugging Face (13 descargas) |
| krea/Krea-2-Raw | Modelo base de difusion | no disponible | no aplica | no disponible en esta ficha | Hugging Face |
| krea/Krea-2-Turbo | Modelo base destilado | no disponible | no aplica | no disponible en esta ficha | Hugging Face |

Comparativa con alternativas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Documentacion muy escasa: no se detallan dataset, hiperparametros, rank del LoRA ni proceso de entrenamiento, lo que dificulta evaluar su calidad y reproducibilidad.
- Traccion minima en la comunidad: 13 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion externa.
- Riesgo de sobreajuste al concepto: al ser un DreamBooth con un unico token, puede producirse rigidez en las variaciones o artefactos si se usa fuera de los dominios de las muestras.
- Dependencia estricta del modelo base: el adaptador solo funciona con Krea 2 y su pipeline `Krea2Pipeline`; no es portable a otras arquitecturas.
- Idiomas no documentados: los prompts de ejemplo estan en ingles y no hay evidencia de soporte para castellano u otros idiomas.
- Licencia Apache 2.0 del adaptador, pero sujeta a las condiciones del modelo base Krea 2, que no se detallan en la informacion disponible; conviene verificar la licencia de Krea 2 antes de un uso comercial.
- Ausencia de benchmarks: no hay metricas objetivas de fidelidad al concepto, calidad de imagen ni comparaciones con alternativas.
- Riesgo de sesgos y alucinacion visual: no documentado por el autor; como todo modelo de difusion, puede generar contenido estereotipado o incoherente segun el prompt.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Archemimi/aurel
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Modelo base de inferencia (Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
- Documentacion de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
