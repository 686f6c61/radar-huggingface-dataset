# llm-semantic-router/Decision-1.0-Nox

## Resumen

Decision-1.0-Nox (también referido como Nox-4B) es un modelo de clasificación zero-shot especializado en la toma de decisiones estructuradas, desarrollado por el equipo de vLLM Semantic Router. No es un modelo generativo al uso: recibe un estado (texto descriptivo de una situación), una o varias preguntas y un conjunto de respuestas candidatas definidas en tiempo de ejecución, y devuelve decisiones tipadas con sus probabilidades asociadas. Está afinado a partir de Qwen/Qwen3.5-4B y se distribuye con licencia Apache 2.0.

El modelo cubre tres tipos de decisión: Choice (seleccionar entre 2 y 255 acciones o rutas), Noul (verificar una condición contra evidencia suministrada, devolviendo P(true)) y Score (aplicar entre 2 y 10 descripciones de rúbrica ordenadas, devolviendo el índice esperado y su distribución). Su relevancia actual radica en que ofrece una alternativa determinista y ligera a los LLM generativos para tareas de enrutamiento, clasificación y evaluación de condiciones en pipelines de producción, con etiquetas definidas dinámicamente sin reentrenamiento.

Con 4B parámetros, un contexto máximo de 16.384 tokens por pregunta (incluyendo estado y candidatos) y un rendimiento medido de 73,09% de precisión ponderada en 3.766 decisiones repartidas en 54 tareas, Nox-4B se posiciona como la variante compacta de la familia Decision, por debajo de Lux-9B (77,40%) pero por encima de Kev-4B (70,09%) y del propio Qwen3.5-4B sin afinar (67,29%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención lineal (backbone Qwen3.5-4B) y cabeza de decisión dedicada; código de inferencia personalizado (custom_code) |
| Parametros totales | 4B (aproximado, según denominación del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens por pregunta, incluyendo estado, pregunta y candidatos; si se excede, se devuelve error `max_length_exceeded` sin truncar |
| Tipos de cuantizacion | No disponible (el repo distribuye pesos en safetensors; en GPU el backbone corre en BF16 con cabeza de decisión en FP32, en CPU todo en FP32) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con config.json que referencia backbone, tokenizer, cabeza de decisión y ficheros de calibración) |

## Arquitectura y entrenamiento

Nox-4B se construye sobre el backbone Qwen3.5-4B, un transformer que incorpora capas de atención lineal (optimizables con flash-linear-attention en GPU) junto con atención estándar. Sobre ese backbone se añade una cabeza de decisión específica que transforma las representaciones del modelo en distribuciones de probabilidad sobre las etiquetas candidatas definidas en tiempo de ejecución. El modelo no genera texto: produce decisiones tipadas (Choice, Noul, Score) con sus probabilidades calibradas, lo que lo aleja del paradigma generativo habitual y lo acerca a un clasificador zero-shot de propósito general.

El modelo es un fine-tune del backbone base, según indica la model card (`base_model_relation: finetune`). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona ficheros de calibración incluidos en el repositorio y un proceso de normalización de descripciones nulas posterior a las mediciones de latencia publicadas. La evaluación se realizó sobre 3.766 decisiones y 54 tareas, con métricas desglosadas en Decisions, Composition, Reading, Inference y Transfer.

## Capacidades

- Clasificación zero-shot con etiquetas definidas en tiempo de ejecución, sin necesidad de reentrenamiento.
- Decisión tipo Choice: selección entre 2 y 255 acciones o rutas, devolviendo ID seleccionado y distribución de probabilidad.
- Decisión tipo Noul: verificación de condiciones contra evidencia suministrada, devolviendo P(true).
- Decisión tipo Score: aplicación de rúbricas ordenadas de 2 a 10 niveles, devolviendo índice esperado y distribución.
- Procesamiento de múltiples preguntas en una sola petición (multi-question), con latencia que escala con el número de preguntas.
- Soporte multilingüe limitado a inglés y chino.
- Integración con Transformers mediante `trust_remote_code=True` y pipeline `decision`.
- Compatibilidad con el runtime vLLM Semantic Router para servir peticiones Choice, Noul y Score.
- Manejo explícito de errores: `invalid_question` para preguntas malformadas y `max_length_exceeded` para desbordamiento de contexto.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso generativo; su función es exclusivamente clasificatoria y de decisión.

## Casos de uso

- Enrutamiento de peticiones en atención al cliente: dado un estado como "el cliente solicita un reembolso", el modelo decide si la petición va al equipo de facturación o al técnico, con distribución de probabilidad para auditar la confianza de la decisión.
- Clasificación de tickets de soporte con etiquetas dinámicas: permite definir categorías en tiempo de ejecución sin reentrenar, útil cuando la taxonomía cambia con frecuencia.
- Evaluación de condiciones en pipelines de CI/CD: la decisión tipo Noul verifica si se cumple una condición contra evidencia suministrada (por ejemplo, si un cambio cumple los criterios de revisión), devolviendo P(true) para umbralizar.
- Scoring de calidad o urgencia: la decisión tipo Score aplica rúbricas ordenadas de 2 a 10 niveles, adecuada para priorizar incidencias o puntuar respuestas generadas por otros modelos.
- Enrutamiento semántico en arquitecturas multi-modelo: integrado en vLLM Semantic Router, selecciona qué modelo o herramienta debe atender cada consulta entre hasta 255 opciones.
- Moderación y filtrado por reglas: verificación de condiciones contra evidencia (Noul) para decidir si un contenido cumple políticas definidas, con probabilidad calibrada en lugar de un juicio binario opaco.
- Enrutamiento de consultas en asistentes conversacionales: con 16.384 tokens de contexto por pregunta, puede manejar estados largos que incluyan historial o documentación de referencia.

## Benchmarks y rendimiento

La model card publica una evaluación propia sobre 3.766 decisiones y 54 tareas, con precisión ponderada (Overall) calculada con pesos: Decisions 30%, Composition 25%, Reading 15%, Inference 15%, Transfer 15%. Estos pesos fueron elegidos tras observar resultados, según advierte el propio autor.

| Modelo | Tamano | Decisions | Composition | Reading | Inference | Transfer | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|
| Nox-4B | 4B | 83,00 | 51,79 | 79,06 | 86,25 | 69,60 | 73,09 |
| Lux-9B | 9B | 84,38 | 52,75 | 90,16 | 91,46 | 77,72 | 77,40 |
| Kev-9B | 9B | 76,75 | 45,75 | 86,72 | 83,54 | 79,25 | 71,89 |
| Kev-4B | 4B | 71,90 | 48,54 | 81,88 | 84,58 | 76,10 | 70,09 |
| Qwen3.5-9B | 9B | 73,91 | 44,62 | 89,84 | 79,58 | 73,23 | 69,73 |
| Decider | 2B | 64,01 | 46,58 | 92,03 | 84,38 | 69,31 | 67,71 |
| Qwen3.5-4B | 4B | 69,89 | 43,33 | 87,97 | 79,79 | 68,83 | 67,29 |
| Sol-2B | 2B | 73,75 | 46,08 | 76,56 | 84,17 | 57,07 | 66,32 |
| Eos-0.8B | 0,8B | 65,94 | 46,04 | 70,31 | 81,67 | 52,01 | 61,89 |
| Kev-0.8B | 0,8B | 60,14 | 42,29 | 67,81 | 68,75 | 61,19 | 58,28 |
| Qwen3.5-2B | 2B | 57,12 | 39,00 | 73,75 | 72,29 | 56,31 | 57,24 |
| Kai-0.6B | 0,6B | 57,96 | 40,83 | 54,69 | 69,79 | 48,37 | 53,52 |
| Laya · English | 0,421B | 56,54 | 35,33 | 51,41 | 63,75 | 53,06 | 51,03 |
| Laya · Multilingual | 0,322B | 47,25 | 38,92 | 50,78 | 57,29 | 47,13 | 47,19 |
| Jev | — | 79,10 | 66,38 | 94,53 | 89,79 | 87,19 | 81,05 |

Nox-4B supera en 2,99 puntos a Kev-4B en el mismo benchmark y en 5,80 puntos a su backbone sin afinar Qwen3.5-4B. Queda por debajo de Lux-9B (77,40%) y de Jev (81,05%). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4B parámetros en BF16, el backbone requiere aproximadamente 8 GB solo en pesos, más overhead de la cabeza de decisión en FP32 y activaciones; en FP32 en CPU el requisito de memoria es mayor.
- GPU recomendadas: la model card no especifica modelos concretos. Las mediciones de latencia se realizaron en una AMD gfx942 (equivalente a MI300), con seis procesos cargados independientemente y GPU ociosa.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; un modelo de 4B en BF16 es en principio desplegable en GPUs consumer con 12-16 GB de VRAM, pero el autor no lo certifica.
- Opciones de despliegue: Transformers (>=5.17) con `trust_remote_code=True`, pipeline `decision`, y el runtime vLLM Semantic Router para servir peticiones Choice, Noul y Score. El repositorio no incluye código de serving; este vive en vLLM Semantic Router.
- Aceleración: flash-linear-attention para las capas de atención lineal en GPU.
- Latencia y throughput: la model card publica un gráfico de escalado de latencia con preguntas Choice distintas a 499 tokens de entrada por pregunta, 30 mediciones por punto en seis procesos independientes. La latencia Python incluye tokenización e inferencia, excluyendo carga y red. Los valores p50 y p95 concretos no se reproducen en el texto disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall (benchmark propio) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Nox-4B | 4B | 16.384 tokens por pregunta | 73,09 | Apache 2.0 | Hugging Face (llm-semantic-router/Decision-1.0-Nox) |
| Lux-9B | 9B | No disponible | 77,40 | No disponible | Familia Decision |
| Kev-4B | 4B | No disponible | 70,09 | No disponible | Familia Decision |
| Qwen3.5-4B | 4B | No disponible | 67,29 | No disponible | Hugging Face (Qwen) |
| Decider | 2B | No disponible | 67,71 | No disponible | No disponible |
| Jev | No disponible | No disponible | 81,05 | No disponible | No disponible |

Nox-4B ofrece el mejor equilibrio tamaño/rendimiento de la familia Decision en la comparativa publicada: supera a Kev-4B y a Qwen3.5-4B con el mismo tamaño, y se acerca a Lux-9B con menos de la mitad de parámetros. Jev, sin tamaño declarado, lidera el benchmark pero no se detalla su disponibilidad ni licencia.

## Limitaciones y advertencias

- El benchmark es propio del autor y los pesos de las métricas (Decisions 30%, Composition 25%, Reading 15%, Inference 15%, Transfer 15%) fueron elegidos tras observar los resultados, según admite la propia model card; no constituyen una mejora de entrenamiento y pueden favorecer al modelo.
- Idiomas limitados a inglés y chino; no hay soporte declarado para castellano ni otros idiomas.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso generativo. Usarlo fuera de tareas de clasificación y decisión no es adecuado.
- Contexto limitado a 16.384 tokens por pregunta (estado + pregunta + candidatos); si se excede, toda la petición falla con `max_length_exceeded` sin truncar, lo que puede romper pipelines que esperen degradación gradual.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente en las probabilidades devueltas; la model card menciona diagnósticos de calibración y evidencia faltante en `evaluation/DIAGNOSTICS.md`, sin detallar los resultados en el texto disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- El repositorio no incluye código de serving; para producción es necesario desplegar vLLM Semantic Router, lo que añade una dependencia externa.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del backbone Qwen3.5-4B subyacente.
- El tamaño del repositorio es de 33,7 GB, muy superior al peso teórico de 4B parámetros en BF16, probablemente por incluir múltiples artefactos (backbone, cabeza, calibración); conviene revisar qué se descarga antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Decision-1.0-Nox
- Colección de la familia Decision: https://huggingface.co/collections/vllm-sr/decision-10-6ab12177bd0002394d8409f9
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Tareas de evaluación (referenciado en model card): `evaluation/TASKS.md`
- Diagnósticos de orden, evidencia faltante y calibración: `evaluation/DIAGNOSTICS.md`
- Métodos y incertidumbre: `evaluation/EVALUATION.md`
- Escalado de latencia por número de preguntas: `evaluation/QUESTION-SCALING.md`
