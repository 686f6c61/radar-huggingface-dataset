# krystofmitka/gemma-4-26B-A4B-effort10-checkpoint114

## Resumen

Gemma 4 26B A4B effort10 checkpoint114 es un ajuste fino del modelo multimodal google/gemma-4-26B-A4B-it, desarrollado por el usuario krystofmitka. Se trata de un derivado que combina un entrenamiento supervisado (SFT) con un adaptador LoRA de GRPO fusionado en los pesos, orientado a dotar al modelo de control explícito del "esfuerzo de razonamiento" mediante una linea en el system prompt. El modelo parte de la arquitectura Gemma 4 de Google DeepMind y conserva su naturaleza image-text-to-text (procesa imagenes y texto).

El atractivo principal es el control granular del razonamiento: un mismo conjunto de pesos responde a los niveles de esfuerzo 10, 25, 50, 75 y 100, ademas del modo por defecto, ajustando la profundidad del razonamiento y el numero de tokens de pensamiento. Segun la model card, el entrenamiento se detuvo en el paso 114 de los 500 previstos por vencimiento de la reserva de GPU, y el checkpoint publicado no ha recibido validacion sobre conjuntos reservados ni una evaluacion completa de benchmarks, por lo que debe tratarse como material experimental.

El modelo tiene 25.805.933.872 parametros totales (aproximadamente 25,8 mil millones) en formato BF16, con un repositorio de 51,6 GB. La licencia declarada es Apache 2.0, heredada del modelo base de Google, aunque los pesos han sido modificados mediante SFT y GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), variante A4B (mezcla de expertos segun nomenclatura del modelo base) |
| Parametros totales | 25.805.933.872 (~25,8 B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4 B activos, sin confirmacion en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~52 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 4 del modelo base google/gemma-4-26B-A4B-it, un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). Sobre esa base se aplico un ajuste supervisado (SFT) seguido de un adaptador LoRA de GRPO (rank 32, alpha 64) fusionado en los pesos, dando lugar a un unico modelo BF16 autonomo que no requiere cargar adaptadores por separado.

El entrenamiento SFT utilizo 16.170 ejemplos supervisados correctos, de los cuales 1.603 correspondian al nivel de esfuerzo 10. La fase de RL empleo una mezcla de 11.283 preguntas de matematicas, ciencia, instrucciones generales y seguimiento de instrucciones, con ocho respuestas por grupo GRPO y 32 grupos por paso de optimizador. Las condiciones de esfuerzo se equilibraron aproximadamente mediante un esquema de cobertura prioritaria. La innovacion destacable es el control de esfuerzo aprendido: el modelo interpreta una linea como "Reasoning Effort: 10 (range 1–100; higher values request more thorough reasoning)" al inicio del system prompt y ajusta su profundidad de razonamiento en consecuencia. No se trata de un limite duro de tokens, sino de una preferencia aprendida. El entrenamiento se detuvo en el paso 114 de 500 por el vencimiento de la reserva de GPU.

## Capacidades

- Generacion de texto y razonamiento con control explicito del esfuerzo (niveles 10, 25, 50, 75, 100 y por defecto).
- Razonamiento matematico y cientifico, reforzado mediante GRPO sobre preguntas de matematicas y ciencia.
- Procesamiento de imagenes y texto (image-text-to-text), heredado del modelo base Gemma 4.
- Modo de pensamiento (thinking) activable con `enable_thinking=True`, con canales separados de razonamiento y respuesta final.
- Seguimiento de instrucciones y conversacion multi-turno (pipeline conversational).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente.

## Casos de uso

- Razonamiento con presupuesto controlado: en aplicaciones donde el coste por consulta importa, se puede fijar un esfuerzo bajo (10 o 25) para consultas simples y elevarlo (75 o 100) solo en tareas complejas, usando el mismo modelo desplegado.
- Resolucion de problemas matematicos y cientificos: el entrenamiento GRPO sobre 11.283 preguntas de matematicas y ciencia lo hace adecuado para asistencia en ejercicios, verificacion de derivaciones y explicaciones paso a paso.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre contenido de capturas, diagramas o figuras combinadas con texto.
- Asistentes conversacionales tecnicos: el formato conversational y el modo thinking permiten construir chatbots que muestran u ocultan el razonamiento segun el contexto.
- Investigacion sobre control de esfuerzo: sirve como banco de pruebas para estudiar como el esfuerzo declarado en el prompt afecta a la precision y al numero de tokens de pensamiento.
- Generacion de explicaciones educativas: el modo de esfuerzo alto produce razonamientos mas extensos y detallados, util para material didactico que requiera justificacion completa.
- Evaluacion comparativa de tecnicas de RL: al publicar recetas y metadatos de entrenamiento, es util para reproducir experimentos de GRPO con LoRA sobre modelos multimodales.

## Benchmarks y rendimiento

La model card incluye una validacion historica en el paso 100 (no una puntuacion del modelo publicado en el paso 114), sobre 250 preguntas reservadas por ajuste, una respuesta por pregunta, semilla 0, temperatura 1.0, top-p 0.95, top-k 64 y limite de salida de 12.288 tokens. La referencia "antes de RL" es el modelo SFT en el paso cero de RL, no el modelo original de Google.

| Ajuste | Precision antes de RL | Precision en paso 100 | Tokens de pensamiento antes de RL | Tokens de pensamiento en paso 100 |
|---|---:|---:|---:|---:|
| 10 | 70,0% | 69,6% | 3.192 | 1.923 |
| 25 | 68,0% | 72,4% | 3.758 | 2.419 |
| 50 | 67,6% | 73,2% | 4.341 | 3.083 |
| 75 | 62,4% | 70,4% | 5.643 | 4.804 |
| 100 | 61,6% | 68,4% | 6.297 | 5.415 |
| default | 60,4% | 67,6% | 6.433 | 5.669 |

Los tokens de pensamiento excluyen los tokens de la respuesta final. Son comprobaciones de una sola semilla, sin intervalos de confianza entre semillas, y las diferencias pequenas pueden deberse a variacion de muestreo. No se ha establecido ninguna afirmacion de preservacion de capacidades para la suite completa de doce benchmarks ni para tareas multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 52 GB solo para pesos, mas memoria adicional para el contexto y el estado de inferencia; en la practica se recomienda al menos 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con `device_map="auto"`.
- Cabe en GPU de consumo: no en BF16 con una sola GPU de 24 GB; no se documentan cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir la huella.
- Opciones de despliegue: Transformers (version con soporte de Gemma 4; el entorno de entrenamiento uso la 5.20.2) y vLLM con soporte de Gemma 4, sirviendo el repositorio con `--served-model-name effort-model`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| krystofmitka/gemma-4-26B-A4B-effort10-checkpoint114 | ~25,8 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste experimental con control de esfuerzo, sin validacion final |
| google/gemma-4-26B-A4B-it | ~25,8 B (modelo base) | no disponible | Apache 2.0 | Hugging Face (oficial) | Modelo original de Google DeepMind, con benchmarks oficiales |
| Modelos comparables de ~25 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas en la informacion proporcionada |

La comparacion directa con otras alternativas de la misma categoria no esta disponible en la informacion proporcionada; el unico punto de referencia documentado es el modelo base oficial de Google.

## Limitaciones y advertencias

- El checkpoint publicado (paso 114) no ha recibido validacion sobre conjuntos reservados ni evaluacion completa de benchmarks; los datos de la tabla corresponden al paso 100.
- El entrenamiento se detuvo antes de lo previsto (114 de 500 pasos) por vencimiento de la reserva de GPU, por lo que el ajuste puede estar incompleto.
- Solo se han validado los niveles de esfuerzo 10, 25, 50, 75, 100 y por defecto; otros valores no estan validados.
- El control de esfuerzo es una preferencia aprendida, no un limite duro de tokens; no garantiza un presupuesto de inferencia exacto.
- Riesgo de truncamiento: si se alcanza el limite de tokens de salida, puede cortarse el razonamiento o la respuesta final.
- No se ha establecido preservacion de capacidades para la suite completa de benchmarks ni para tareas multimodales.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan potencialmente los del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0, pero los pesos han sido modificados respecto al modelo base; consultar LICENSE, NOTICE y BASE_MODEL_CARD.md para la atribucion upstream.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krystofmitka/gemma-4-26B-A4B-effort10-checkpoint114
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Recursos incluidos en el repositorio: `effort_presets.json`, `examples/`, `training_recipe.json`, `validation_history.json`, `checkpoint_metadata.json`, `weights_manifest.json`, `LICENSE`, `NOTICE`, `BASE_MODEL_CARD.md`
