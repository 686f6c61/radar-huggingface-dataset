# KamalEzzo/gemma2-9b-it-short-answer-grading-lora

## Resumen

`gemma2-9b-it-short-answer-grading-lora` es un adaptador LoRA (PEFT) sobre el modelo base `google/gemma-2-9b-it` desarrollado por Kamal Abdul-Fattah (usuario KamalEzzo) para una tarea muy concreta: la correccion automatica mediante rubrica de respuestas cortas a preguntas de auditoria en cursos universitarios de contabilidad. El adaptador no genera texto libre, sino un unico objeto JSON con una categoria (On-Topic, Off-Topic o No Answer), un motivo seleccionado de una lista fija y cuatro puntuaciones de rubrica: Claridad (0-2), Terminologia (0-2), Cobertura (0-2) y Precision (0-4), cuya suma dividida entre dos arroja la nota final en escala 0-5.

El modelo hereda la arquitectura transformer decoder-only de Gemma 2 9B-IT, con aproximadamente 9.000 millones de parametros, y se distribuye como adaptador de bajo rango (rank 80) sobre siete modulos de atencion y MLP. El repositorio ocupa 1,1 GB en safetensors, lo que corresponde unicamente a los pesos del adaptador, no al modelo base completo. Su relevancia actual radica en que demuestra que un ajuste fino ligero y local sobre un modelo abierto de 9B puede igualar o superar en esta tarea especifica a modelos propietarios de gran escala como GPT-4o, GPT-5.2, Claude Sonnet 4 o Claude Opus 4.6 en el conjunto de test publicado.

La ficha se basa exclusivamente en la model card y en los metadatos de HuggingFace; no se dispone de informacion adicional sobre el proceso de entrenamiento mas alla de la declarada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA sobre q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Parametros totales | Aproximadamente 9.000 millones (modelo base Gemma 2 9B-IT); el adaptador LoRA es de rango 80 y su tamano en disco es de 1,1 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso una longitud maxima de secuencia de 2.048 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se entrenó en bfloat16 y el ejemplo de uso emplea bfloat16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 2 9B-IT, un transformer decoder-only de aproximadamente 9.000 millones de parametros. El ajuste fino se realizo con LoRA de rango 80, alpha 80 y dropout 0, sobre los siete modulos indicados (las cuatro proyecciones de atencion y las tres del bloque MLP). Se entrenaron 3 epocas con tasa de aprendizaje 5e-6, schedule coseno con 10 % de warm-up, weight decay 0,01, batch efectivo de 16 (batch 4 con acumulacion de gradientes 4), precision bfloat16, optimizador AdamW y semilla 42. La longitud maxima de secuencia fue de 2.048 tokens y se conservo el checkpoint con menor perdida de validacion. El entrenamiento se ejecuto en una unica GPU NVIDIA H100 de 80 GB usando Unsloth, TRL SFTTrainer y PEFT 0.18.1.

Los datos de entrenamiento consisten en 2.550 respuestas cortas a 85 preguntas de auditoria (30 por pregunta), corregidas por examinadores segun la rubrica de cuatro criterios. El split se realizo a nivel de pregunta: 51 preguntas para entrenamiento (1.530 respuestas), 17 para validacion (510) y 17 para test (510). El adaptador se entreno solo sobre las 1.530 respuestas de entrenamiento, empleando un prompt multi-paso recogido en el repositorio de GitHub. Los hiperparametros se seleccionaron mediante una ablacion de 13 ejecuciones sobre las preguntas de validacion. No se menciona en la informacion disponible el uso de RLHF o DPO; el procedimiento descrito es SFT supervisado.

## Capacidades

- Generacion de JSON estructurado con categoria, motivo y cuatro puntuaciones de rubrica para cada respuesta evaluada.
- Clasificacion de respuestas en tres categorias: On-Topic, Off-Topic y No Answer.
- Deteccion de respuestas fuera de tema, con precision del 84,8 % y recall del 74,4 % en la clase positiva (Off-Topic o No Answer) segun la model card.
- Puntuacion por criterios: Claridad (0-2), Terminologia (0-2), Cobertura (0-2) y Precision (0-4), con nota final 0-5.
- Generacion de texto conversacional a traves de la plantilla de chat del modelo base.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el prompt de inferencia es multi-paso pero no se describe comportamiento agentico.
- Capacidades multilingues: limitadas al ingles segun la model card; no se evaluo su comportamiento en otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en este adaptador.

## Casos de uso

- Correccion asistida de examenes de auditoria: el adaptador recibe la pregunta, la respuesta modelo y la respuesta del estudiante, y devuelve un JSON con la puntuacion por rubrica y la nota final, lo que permite precalificar lotes de examenes antes de la revision del profesor.
- Revision por muestreo en docencia universitaria: dado que la model card advierte de que las notas no deben entregarse sin revision, el modelo encaja como primera pasada que el instructor valida, reduciendo el tiempo de correccion manual en grupos grandes.
- Investigacion sobre evaluacion automatica: el adaptador y su pipeline reproducible (notebooks en GitHub) sirven como linea base para estudiar sesgos, calibracion y acuerdo inter-evaluador en tareas de grading con rubrica.
- Deteccion de respuestas fuera de tema o en blanco: la clasificacion en Off-Topic y No Answer, con las metricas de precision y recall publicadas, permite filtrar respuestas invalidas antes de la puntuacion fina.
- Despliegue local con requisitos de privacidad: al ejecutarse en una unica GPU local, encaja en entornos institucionales donde las respuestas de los estudiantes son datos personales y no pueden enviarse a APIs externas.
- Analisis de calidad de items: agregando las puntuaciones por criterio sobre muchas respuestas a la misma pregunta, el modelo ayuda a identificar preguntas con baja claridad o terminologia ambigua en el banco de examen.
- Experimentacion con ajuste fino ligero: sirve como ejemplo reproducible de LoRA sobre Gemma 2 9B con Unsloth y TRL para equipos que quieran adaptar el modelo a otras rubricas o asignaturas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test retenido (510 respuestas, 17 preguntas), tomando como referencia las notas originales de los examinadores. QWK se calcula sobre el total de rubrica 0-10; MAE y precision ±1 sobre la nota final 0-5.

| Condicion | Precision ±1 | QWK | MAE |
|---|---|---|---|
| Este adaptador (Gemma 2 9B ajustado) | 78,43 % | 0,821 | 0,713 |
| Gemma 2 9B, zero-shot (mismo prompt) | 72,35 % | 0,761 | 0,875 |
| GPT-4o, zero-shot / few-shot | 71,57 % / 74,31 % | 0,766 / 0,807 | 0,845 / 0,781 |
| GPT-5.2, zero-shot / few-shot | 68,04 % / 67,84 % | 0,771 / 0,761 | 0,897 / 0,900 |
| Claude Sonnet 4, zero-shot | 77,45 % | 0,787 | 0,813 |
| Claude Opus 4.6, zero-shot / few-shot | 77,06 % / 80,78 % | 0,813 / 0,835 | 0,749 / 0,702 |
| DeBERTa-v3-base (semillas 42 / 43 / 44) | 73,14 / 76,27 / 75,10 % | 0,784 / 0,795 / 0,796 | 0,833 / 0,780 / 0,793 |

Segun la model card, con un bootstrap pareado por cluster de pregunta y correccion de Bonferroni (nueve comparaciones por metrica), ninguna condicion supero significativamente a este adaptador en ninguna metrica, lo que no establece equivalencia. La deteccion de respuestas fuera de tema (clase positiva = Off-Topic o No Answer) alcanzo una precision del 84,8 % y un recall del 74,4 %.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador se entreno en una unica NVIDIA H100 de 80 GB en bfloat16; para inferencia en bfloat16 sobre el modelo base de 9B se requiere aproximadamente 18-20 GB de VRAM, aunque la model card no publica una cifra explicita.
- GPU recomendadas: NVIDIA H100 80 GB (usada en el entrenamiento); para inferencia son adecuadas A100 40/80 GB, L40S o RTX 6000 Ada.
- GPU de consumo: cabe en tarjetas con 24 GB o mas en cuantizacion de 8 bits o inferior (por ejemplo RTX 3090 o RTX 4090); en bfloat16 completo no cabe en GPUs de 16 GB.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `peft.PeftModel` y `device_map="auto"`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion se hace con `do_sample=False` y `max_new_tokens=400`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision ±1 (test) | QWK | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (Gemma 2 9B + LoRA) | ~9B | No disponible | 78,43 % | 0,821 | Gemma Terms of Use | HuggingFace (adaptador PEFT) |
| Gemma 2 9B-IT zero-shot | ~9B | No disponible | 72,35 % | 0,761 | Gemma Terms of Use | HuggingFace |
| Claude Opus 4.6 few-shot | No disponible | No disponible | 80,78 % | 0,835 | Propietaria | API |
| DeBERTa-v3-base ajustado | ~0,18B | No disponible | 73,14-76,27 % | 0,784-0,796 | MIT (segun el modelo original) | HuggingFace |

La comparativa se limita a las condiciones evaluadas en la model card; no se dispone de datos de contexto ni de otros benchmarks para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado sobre un unico dataset: una universidad, respuestas cortas a preguntas de auditoria y una rubrica de cuatro criterios. El rendimiento en otras asignaturas, rubricas, idiomas o instituciones es desconocido.
- Las notas individuales pueden ser erroneas aunque el modelo responda con seguridad; en el test, 23 de 55 respuestas Off-Topic no se detectaron y recibieron puntuaciones de rubrica.
- No se evaluo la equidad entre grupos de estudiantes por falta de datos demograficos.
- Las respuestas de los estudiantes son datos personales; debe ejecutarse donde las normas institucionales lo permitan (el modelo cabe en una unica GPU local).
- La model card indica explicitamente que las notas no deben entregarse a los estudiantes sin revision del instructor.
- El uso comercial esta sujeto a los Gemma Terms of Use, que requieren aceptar dichos terminos; el adaptador hereda la licencia `gemma` del modelo base.
- El adaptador esta pensado solo para ingles; no se documenta comportamiento en castellano ni en otros idiomas.
- No se han publicado datos sobre cuantizacion, latencia o throughput, lo que dificulta planificar despliegues en produccion.
- El modelo base referenciado en `adapter_config.json` es `unsloth/gemma-2-9b-it`, una copia de `google/gemma-2-9b-it`; es necesario aceptar los terminos de Gemma para usarlo.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/KamalEzzo/gemma2-9b-it-short-answer-grading-lora
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Copia del modelo base usada en el entrenamiento: https://huggingface.co/unsloth/gemma-2-9b-it
- Repositorio GitHub (codigo, prompts, outputs y scripts de analisis): https://github.com/KamalEzzo/short-answer-grading-llm
- Dataset en Zenodo (acceso restringido): https://doi.org/10.5281/zenodo.18856922
- Notebook de reproduccion del paper: https://github.com/KamalEzzo/short-answer-grading-llm/blob/main/notebooks/00_Reproduce_Paper.ipynb
- Notebook de ajuste fino con el prompt multi-paso: https://github.com/KamalEzzo/short-answer-grading-llm/blob/main/notebooks/06_Finetuning_Model.ipynb
