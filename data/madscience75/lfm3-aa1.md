# madscience75/LFM3-AA1

## Resumen

LFM3-AA1 (LFM3 Abreviated Answer) es un modelo de lenguaje de 1.700 millones de parametros derivado de Peymandc/LFM3-1.7B-Heretic-Uncensored, que a su vez procede de LiquidAI/LFM3-1.7B. Lo publica el usuario madscience75 y su proposito es reducir de forma agresiva el consumo de tokens de razonamiento sin sacrificar precision en tareas estructuradas. Para ello aplica optimizacion de preferencias DPO sobre trazas de razonamiento autogeneradas y verificadas contra un oraculo.

La relevancia practica del modelo esta en su eficiencia: segun la model card, recorta el uso de tokens de razonamiento entre un 43% y un 44% en tareas estructuradas y entre un 13% y un 31% en GSM8K y MATH-500, al tiempo que recupera precision respecto a su modelo base (de 88% a 91% en GSM8K y de 60% a 66% en MATH-500). Es, ademas, un modelo "abliterated", es decir, con las direcciones de rechazo eliminadas, orientado a uso sin censura.

Se distribuye en safetensors BF16 y en tres cuantizaciones GGUF (BF16, Q8_0 e IQ4_XS), con licencia Apache 2.0 y soporte exclusivo de ingles. Su tamano permite desplegarlo en GPU de consumo, lo que lo hace atractivo para prototipado local de agentes y pipelines de razonamiento con presupuesto de tokens ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, IQ4_XS (imatrix, 4.61 BPW) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF (BF16, Q8_0, IQ4_XS) |

## Arquitectura y entrenamiento

El modelo parte de la familia LFM3 de LiquidAI y hereda la arquitectura del checkpoint original de 1.7B, sobre el que se han aplicado dos transformaciones en cadena: primero una ablacion de las direcciones de rechazo (abliteration) en Peymandc/LFM3-1.7B-Heretic-Uncensored, y despues un ajuste DPO realizado por el autor de esta ficha. El entrenamiento DPO emplea unicamente 56 pares de preferencia, con beta=0.1 y 3 epocas, construidos a partir de trazas de razonamiento autogeneradas y verificadas por un oraculo. El objetivo es premiar cadenas de razonamiento mas cortas que llegan a la misma respuesta correcta.

La innovacion principal no es arquitectonica sino de optimizacion: el modelo aprende a comprimir el razonamiento ("compressed reasoning") manteniendo la exactitud. La model card reporta cero regresiones sobre el conjunto de desarrollo (22/24 en ambos casos) y cero fallos por limite de tokens en el holdout bloqueado con BF16 y Q8_0. No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion del dataset ni detalles de la atencion o del tokenizador.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico: resuelve problemas de GSM8K y MATH-500 con cadenas de razonamiento comprimidas.
- Razonamiento estructurado multi-paso: familias de tareas como secuencias matematicas, planificacion horaria, operaciones de estado y recuperacion de prefijos.
- Modo de razonamiento abreviado: reduce el numero de tokens de pensamiento manteniendo la precision.
- Comportamiento "abliterated": no aplica rechazos de seguridad en las comprobaciones realizadas (0/2 rechazos en las pruebas de spot-check).
- Soporte de tool calling nativo mediante la sintaxis `<|tool_call_start|>[...]<|tool_call_end|>` (no compatible directamente con el formato JSON de OpenAI sin adaptador).
- Uso en tareas agenticas de multiples turnos con menor consumo de tokens (se reporta -31,9% en tareas agenticas multi-turno).
- Capacidades multilingues: limitadas al ingles.
- Vision y audio: no disponibles.

## Casos de uso

- Razonamiento matematico en produccion con coste controlado: el modelo resuelve problemas tipo GSM8K y MATH-500 generando muchas menos cadenas de razonamiento que su base, lo que reduce directamente el coste por consulta en APIs de pago por token.
- Agentes multi-turno: en flujos agenticos con varias llamadas encadenadas, la reduccion del 31,9% en tokens de razonamiento reportada en la suite agentica disminuye la latencia acumulada y el gasto en contexto.
- Despliegue local en GPU de consumo: con la cuantizacion IQ4_XS (1 GB) o Q8_0 (1,85 GB) puede ejecutarse en tarjetas con 4-8 GB de VRAM mediante llama.cpp u Ollama, ideal para prototipado en portatiles.
- Evaluacion de tecnicas de compresion de razonamiento: sirve como referencia reproducible (el autor publica scripts en GitHub) para investigadores que estudian DPO aplicado a trazas de razonamiento.
- Generacion de codigo asistida con tool calling: integrarlo en pipelines donde el modelo invoque funciones externas mediante su sintaxis nativa de tool call, con un adaptador que traduzca al formato del orquestador.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, es util para estudiar el comportamiento de modelos sin capas de rechazo, siempre en entornos controlados y con las salvaguardas externas adecuadas.
- Tareas de planificacion y scheduling: la familia `schedule_time` del holdout sugiere buen desempeno en problemas de asignacion temporal y restricciones, aplicable a planificadores internos.

## Benchmarks y rendimiento

Resultados reportados en la model card (100 primeros problemas de GSM8K y MATH-500, BF16, `do_sample=False`, `max_new_tokens=2048`):

| Modelo | GSM8K aciertos | GSM8K caps | GSM8K tokens raz. (media/mediana) | MATH-500 aciertos | MATH-500 caps | MATH-500 tokens raz. (media/mediana) |
|---|---|---|---|---|---|---|
| LiquidAI/LFM3-1.7B (stock) | 92/100 (92,0%) | 4 | 603,4 / 392,5 | 69/100 (69,0%) | 24 | 889,9 / 594,5 |
| Peymandc/LFM3-1.7B-Heretic-Uncensored (base) | 88/100 (88,0%) | 8 | 711,2 / 457,5 | 60/100 (60,0%) | 36 | 1064,2 / 771,0 |
| LFM3-AA1 (BF16) | 91/100 (91,0%) | 2 | 493,3 / 345,0 | 66/100 (66,0%) | 29 | 926,3 / 535,0 |

Holdout bloqueado (24 tareas verificadas por oraculo, `max_new_tokens=4096`):

| Modelo / cuantizacion | Aciertos | Caps | Tokens de razonamiento totales | Delta agregado | Delta mediana |
|---|---|---|---|---|---|
| Base Heretic-Uncensored (BF16) | 24/24 | 0 | 35.974 | — | — |
| LFM3-AA1 (BF16 GGUF) | 24/24 | 0 | 20.514 | -42,98% | -39,52% |
| LFM3-AA1 (Q8_0 GGUF) | 24/24 | 0 | 20.258 | -43,69% | -42,98% |
| LFM3-AA1 (IQ4_XS GGUF) | 22/24 | 0 | 25.402 | -29,39% | -24,96% |

Conjunto de desarrollo (24 tareas): el modelo pasa 22/24 con 0 regresiones y 0 caps, frente a 22/24 del base, reduciendo los tokens de razonamiento de 30.516 a 17.958 (-41,15% agregado, -44,27% en mediana). En la prueba de tool calling del harness estandar, los tres modelos puntuan 0/5 porque el script espera JSON estilo OpenAI en lugar de la sintaxis nativa de LFM3.

## Requisitos de hardware

- VRAM estimada: unos 3,5 GB en BF16 (safetensors de 3,46 GB), 1,85 GB en Q8_0 y aproximadamente 1 GB en IQ4_XS.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q8_0 o IQ4_XS; A100, H100 o RTX 4090 para BF16 con margen amplio y contexto largo.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores con las cuantizaciones GGUF.
- Opciones de despliegue: transformers (safetensors), llama.cpp y Ollama (GGUF); vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles de forma explicita; los benchmarks se ejecutaron en Kaggle con 2x T4 en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM3-AA1 | 1,7B | no disponible | 91,0% | 66,0% | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| LiquidAI/LFM3-1.7B (stock) | 1,7B | no disponible | 92,0% | 69,0% | no disponible en esta ficha | Hugging Face |
| Peymandc/LFM3-1.7B-Heretic-Uncensored | 1,7B | no disponible | 88,0% | 60,0% | no disponible en esta ficha | Hugging Face |

El modelo stock conserva una precision ligeramente superior en MATH-500 (69% frente a 66%) pero consume mas tokens de razonamiento y sufre mas caps. Frente al base abliterated, LFM3-AA1 mejora en ambas metricas y reduce tokens de forma sustancial. No se dispone de comparaciones con otras familias de 1-2B en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Modelo abliterated: no aplica rechazos de seguridad, por lo que puede generar contenido danino o inapropiado. Requiere filtros externos en produccion.
- Riesgo de alucinacion inherente a un modelo de 1,7B, especialmente en dominios fuera de matematicas y razonamiento estructurado.
- El ajuste DPO se hizo con solo 56 pares de preferencia, lo que limita la generalizacion del comportamiento comprimido a tareas no representadas en ese conjunto.
- La cuantizacion IQ4_XS introduce ruido: pierde 2 de 24 tareas del holdout frente a BF16 y Q8_0.
- El tool calling nativo no es compatible con el formato JSON de OpenAI; requiere adaptador.
- No se especifica la longitud de contexto soportada, lo que impide garantizar conversaciones largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados reportados.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original de LiquidAI antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/madscience75/LFM3-AA1
- Modelo base: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored
- Modelo original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio GitHub con scripts reproducibles: https://github.com/ronasimi/lfm3-aa1
- Pesos safetensors: https://huggingface.co/madscience75/LFM3-AA1/blob/main/model.safetensors
- GGUF BF16: https://huggingface.co/madscience75/LFM3-AA1/blob/main/LFM3-AA1-BF16.gguf
- GGUF Q8_0: https://huggingface.co/madscience75/LFM3-AA1/blob/main/LFM3-AA1-Q8_0.gguf
- GGUF IQ4_XS: https://huggingface.co/madscience75/LFM3-AA1/blob/main/LFM3-AA1-IQ4_XS.gguf
