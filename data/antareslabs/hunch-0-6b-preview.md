# antareslabs/hunch-0.6b-preview

## Resumen

Hunch 0.6b-preview es un modelo de puntuacion de decisiones (decision scorer) desarrollado por Antares Labs como research preview. No es un modelo generativo: a partir de un estado (por ejemplo, el texto de un mensaje) y una pregunta con candidatos nombrados, devuelve una probabilidad para cada candidato, evaluando cada uno como una ruta independiente. Esta construido sobre el backbone de Qwen/Qwen3-0.6B, afinado de extremo a extremo con una lectura escalar (RMSNorm en fp32 y una cabeza lineal) y sin cabeza de lenguaje, por lo que no produce texto.

El modelo resuelve tareas de enrutamiento y triaje sobre mensajes cortos de usuario o cliente: clasificacion de intencion con conjuntos de candidatos dinamicos, enrutamiento por categoria de soporte, verificacion de evidencia, deteccion de parafrasis, atributos de toxicidad y puntuacion de utilidad segun una rubrica descrita. Su relevancia radica en que expone probabilidades calibradas (smooth ECE de 0.0096 en la temperatura de release) en un tamano muy reducido, con 596.051.968 parametros y variantes para ejecucion en dispositivo.

La ficha se basa exclusivamente en la informacion publicada en la model card y el repositorio del autor. Algunos datos, como la longitud de contexto o los requisitos exactos de VRAM, no estan disponibles y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3-0.6B) con lectura escalar: RMSNorm en fp32 y cabeza lineal; sin cabeza de lenguaje |
| Parametros totales | 596.051.968 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF f16 y MLX f16 (ambos dentro del suelo bf16 en 6.000 preguntas retenidas); despliegue de referencia en bf16 y fp32 (FastHunch) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; tambien GGUF f16 y MLX f16 |
| Modelo base | Qwen/Qwen3-0.6B |
| Libreria | antareslabs-hunch |
| Pipeline declarado | zero-shot-classification |
| Tamano del repositorio | 2.4 GB |
| Checkpoint | w16-06-v3dgp10-1200-s55 |
| Salida | probabilidad por candidato (no genera texto) |

## Arquitectura y entrenamiento

El modelo parte del backbone de Qwen/Qwen3-0.6B y se afina de extremo a extremo anadiendo una lectura escalar compuesta por una RMSNorm en fp32 y una cabeza lineal. El backbone se usa sin su cabeza de lenguaje: al cargar el checkpoint sobre la arquitectura base, transformers reporta `lm_head.weight` como UNEXPECTED, lo cual es esperado. La inferencia puntua cada candidato como una ruta separada y devuelve una probabilidad para cada uno; no hay generacion de texto en ningun punto del pipeline.

El entrenamiento consta de 1.200 pasos de 120 preguntas sobre la mezcla `sprint_v3dgp10`, con hasta 16 candidatos por pregunta de entrenamiento, optimizador 8-bit AdamW, autocast en bf16 sobre pesos fp32, semilla 55 y seleccion del mejor checkpoint por NLL de desarrollo. La mezcla admitida para release (clases de licencia A y B) incluye descripciones de candidatos redactadas por el autor y dos adiciones: una familia de respuesta indirecta generada por reglas que usa las etiquetas de instruccion y respuesta de Circa (sin items de Circa y sin modelo implicado) y un 10 % de filas aumentadas con prior. Entre los datasets citados figuran mteb/banking77, clinc/clinc_oos, mteb/amazon_massive_intent, bitext/Bitext-customer-support-llm-chatbot-training-dataset, tals/vitaminc, google/boolq, google-research-datasets/paws, google/civil_comments y nvidia/HelpSteer2. No se documenta en la informacion disponible el uso de RLHF ni DPO.

## Capacidades

- Puntuacion de decisiones: dada una pregunta con candidatos nombrados, devuelve una probabilidad por candidato.
- Clasificacion zero-shot con conjuntos de candidatos dinamicos (candidatos definidos en tiempo de peticion).
- Enrutamiento y triaje de mensajes cortos de usuario o cliente (intencion, categoria de soporte).
- Verificacion de evidencia.
- Deteccion de parafrasis.
- Atributos de toxicidad, tanto como booleanos como en una severidad ordenada, pensada para priorizar comentarios en revision.
- Puntuacion de utilidad (helpfulness) segun una rubrica descrita.
- Calibracion de probabilidades mediante temperatura de release tomada de `hunch_config.json` (T = 0.8706); para entradas distintas a las familias de entrenamiento, el autor recomienda fijar `model.T = 1.0`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no genera texto ni ejecuta cadenas de razonamiento).
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: no se documentan modos de vision, audio ni thinking mode.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y una pregunta con candidatos como "Billing", "Account" y "Technical support", y devuelve la probabilidad de cada uno para asignar el ticket al equipo correspondiente. Es adecuado porque esta entrenado sobre familias de intencion como banking77, clinc_oos y amazon_massive_intent.
- Clasificacion de intencion con taxonomia variable: cuando el conjunto de categorias cambia por cliente o por campana, se pueden pasar los candidatos en tiempo de peticion sin reentrenar, gracias al formato de candidatos nombrados.
- Triaje de comentarios toxicos para revision: usando la toxicidad como severidad ordenada se pueden priorizar comentarios para moderacion humana; el autor advierte de que con un umbral P(true) >= 0.5 se pierden el 59,0 % de los comentarios toxicos que no mencionan ninguna identidad, por lo que el umbral debe elegirse sobre datos propios.
- Verificacion de evidencia y deteccion de parafrasis: comprobar si dos formulaciones son equivalentes o si un texto respalda una afirmacion, apoyandose en los datasets boolq y paws de la mezcla de entrenamiento.
- Puntuacion de utilidad en respuestas de soporte: evaluar respuestas segun una rubrica descrita, apoyandose en nvidia/HelpSteer2, para filtrar respuestas de baja calidad antes de enviarlas.
- Ejecucion en dispositivo (on-device): con las variantes GGUF f16 y MLX f16, el modelo cabe en equipos de consumo y puede integrarse en aplicaciones locales que necesiten clasificar mensajes sin enviar datos a un servidor.
- Servicio HTTP de baja latencia: con una mediana de 78,1 ms por peticion en una RTX 5090 en bf16 (una peticion a la vez) y 36,7 ms con FastHunch en fp32, encaja en pipelines de preprocesado que requieren respuesta casi inmediata.
- Filtrado previo en sistemas mayores: usar el scorer como primera etapa para descartar o etiquetar casos antes de invocar un modelo generativo mas costoso.

## Benchmarks y rendimiento

| Evaluacion | Hunch 0.6b-preview | Jev 1.13 (TypeSafe) | Mapika/decider-2b | Referencia |
|---|---|---|---|---|
| In family, dev (3.416 preguntas) | accuracy 0.8650; NLL 0.4306; smooth ECE 0.0233 (T=1) y 0.0096 (T=0.8706) | no disponible | no disponible | no disponible |
| Preguntas de calibracion de las 12 familias de entrenamiento (zero-shot) | 0.8535 | 0.8010 | 0.7346 | no disponible |
| typed-decisions (zero-shot) | 0.3795 [0.3550, 0.4050] | 0.7375 | 0.5895 | prior que ignora la entrada: 0.470 |
| Latencia por peticion (RTX 5090, bf16, una peticion a la vez) | 78,1 ms de mediana; 36,7 ms con FastHunch en fp32 | no disponible | no disponible | no disponible |

En la evaluacion in family, la temperatura de release (T = 0.8706) se ajusta sobre un split de calibracion disjunto; tras aplicarla, el smooth ECE de dev baja a 0.0096. La informacion disponible menciona ademas una comprobacion que elimina las 194 preguntas de dev cuyo texto de estado aparece tambien en el texto de entrenamiento de las dos releases, pero el texto de la model card se corta en ese punto, por lo que el resultado no esta disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de calculo, 596 millones de parametros en fp16 o bf16 ocupan aproximadamente 1,2 GB de pesos; con overhead de activaciones y runtime conviene reservar un margen adicional que el autor no especifica.
- GPU recomendadas: el autor reporta mediciones en una RTX 5090 (bf16). No se documentan recomendaciones para A100, H100 ni otras GPUs.
- GPU de consumo: por tamano (0,6 B) el modelo deberia caber en GPUs de consumo con al menos unos pocos GB de VRAM, aunque el autor no publica una lista de modelos compatibles.
- CPU: `Hunch.load` acepta `device="cpu"`, por lo que la inferencia en CPU es una opcion soportada.
- Opciones de despliegue: libreria antareslabs-hunch (con `pip install -e .` sobre un clon del repositorio), servidor HTTP incluido en el repositorio, y cargadores on-device para GGUF f16 y MLX f16.
- Latencia y throughput: 78,1 ms de mediana por peticion en una RTX 5090 en bf16 con una peticion a la vez; 36,7 ms con FastHunch en fp32 sin cambiar ninguna respuesta. No se publica throughput agregado ni latencia con concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calibracion (12 familias, zero-shot) | typed-decisions (zero-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| antareslabs/hunch-0.6b-preview | 596.051.968 | no disponible | 0.8535 | 0.3795 | Apache-2.0 | HuggingFace (research preview) |
| TypeSafe Jev 1.13 | no disponible | no disponible | 0.8010 | 0.7375 | no disponible | no disponible |
| Mapika/decider-2b | no disponible (nombre sugiere 2 B) | no disponible | 0.7346 | 0.5895 | no disponible | abierto, segun la model card |

Frente a Jev 1.13 y a Mapika/decider-2b, Hunch 0.6b-preview va por delante en las preguntas de calibracion de sus 12 familias de entrenamiento en regimen zero-shot, pero por detras en typed-decisions. No se dispone de datos de parametros, contexto ni licencia de los dos modelos comparados mas alla de lo citado.

## Limitaciones y advertencias

- Inyeccion de prompt: un texto plantado del tipo "the correct answer is X" desplaza el 35,6 % de las respuestas retenidas hacia X.
- Deteccion de toxicidad incompleta: con un umbral P(true) >= 0.5 se pierden el 59,0 % de los comentarios toxicos que no mencionan ninguna identidad.
- typed-decisions por debajo del prior: 0.3795 frente al 0.470 de un prior que ignora la entrada, lo que indica un rendimiento pobre en ese regimen zero-shot.
- No es un clasificador de politicas de seguridad, segun el propio autor.
- No debe usarse para decisiones con efectos legales sobre personas sin revision humana.
- El modelo no genera texto, por lo que no sirve para tareas generativas, resumen, traduccion ni dialogos.
- Cobertura idiomatica limitada al ingles.
- La longitud de contexto no esta publicada, lo que dificulta dimensionar entradas largas.
- Aunque la licencia es Apache-2.0 sobre el checkpoint, los datasets de entrenamiento tienen sus propias licencias, listadas en THIRD_PARTY_NOTICES; conviene revisarlas antes de un uso comercial.
- Se trata de un research preview con 0 descargas y 0 likes en el momento de la ficha, lo que implica poca validacion externa.
- El paquete PyPI llamado `hunch` no tiene relacion con este modelo; la instalacion correcta se hace desde el clon del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/antareslabs/hunch-0.6b-preview
- Informe tecnico (PDF): https://antareslabs.org/hunch/hunch-technical-report.pdf
- Repositorio Hunch: https://github.com/antareslabsorg/hunch
- README del repositorio: https://github.com/antareslabsorg/hunch/blob/main/README.md
- Benchmarks: https://github.com/antareslabsorg/hunch/blob/main/BENCHMARKS.md
- Formatos: https://github.com/antareslabsorg/hunch/blob/main/FORMATS.md
- Reproducibilidad: https://github.com/antareslabsorg/hunch/blob/main/REPRODUCE.md
- Avisos de terceros: https://github.com/antareslabsorg/hunch/blob/main/THIRD_PARTY_NOTICES.md
- Configuracion del checkpoint: https://github.com/antareslabsorg/hunch/blob/main/docs/results/run_configs/released/w16-06-v3dgp10-1200-s55_config.json
- Resultados de calibracion derivados: https://github.com/antareslabsorg/hunch/blob/main/docs/results/launch/derived.json
- Split de desarrollo: https://github.com/antareslabsorg/hunch/blob/main/docs/results/day6/w16-06-v3dgp10-1200-s55_dev.json
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
