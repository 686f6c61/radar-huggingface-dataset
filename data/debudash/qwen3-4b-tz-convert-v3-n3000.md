# debudash/qwen3-4b-tz-convert-v3-n3000

## Resumen

`debudash/qwen3-4b-tz-convert-v3-n3000` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario debudash. No es un modelo independiente, sino un checkpoint intermedio dentro de una curva de eficiencia de datos del proyecto "tz-convert", cuyo objetivo es especializar un modelo de lenguaje en la conversión y el razonamiento sobre zonas horarias (timezones).

El adaptador se ha entrenado sobre los primeros 3.000 ejemplos de la mezcla `v3` del dataset `debudash/tz-convert-sft`, con los mismos hiperparámetros que el resto de checkpoints de la serie. Según la model card, alcanza un 40,0% de adherencia a la especificación (spec-adherence), un 57,3% de robustez y un 20,0% de deriva en conversaciones mantenidas, frente al 12,0% / 23,3% / 0,0% del modelo base con el prompt de especificación completo.

Su relevancia es acotada: sirve como punto de referencia para estudiar cómo escala la calidad con el volumen de datos en una tarea concreta y como base para quien quiera reproducir o continuar el entrenamiento. El autor remite al checkpoint `debudash/qwen3-4b-tz-convert-v3-n12000` como el mejor de la serie y a `debudash/slm-training` para el código, los conjuntos de evaluación y los informes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-4B-Instruct-2507 tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen3, no detalladas aqui) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-4B-Instruct-2507 |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA entrenado con QLoRA (cuantizacion del modelo base durante el ajuste) sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4.000 millones de parametros. El adaptador modifica los pesos del base mediante matrices de bajo rango; no se publica informacion sobre el rango, el alpha, las capas objetivo ni la tasa de aprendizaje en la informacion disponible.

El entrenamiento usa los primeros 3.000 ejemplos de la mezcla `v3` del dataset `debudash/tz-convert-sft`, con hiperparametros identicos a los demas checkpoints de la serie (lo que permite comparar directamente el efecto del volumen de datos). El commit de entrenamiento registrado es `c64cccadac7a350d62d3810f538ddb9a7c3120ce`. No se detalla la composicion del dataset, el numero de tokens vistos ni si hubo etapas de RLHF o DPO; la model card solo reporta metricas de evaluacion propias del proyecto (spec-adherence, robustness y drift).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3-4B-Instruct-2507.
- Especializacion en conversion y razonamiento sobre zonas horarias (tz-convert), objetivo declarado del proyecto.
- Adherencia a una especificacion de tarea concreta: metrica de spec-adherence del 40,0% frente al 12,0% del base con prompt completo.
- Robustez ante entradas del dominio evaluada en un 57,3% (frente al 23,3% del base).
- Mantenimiento de contexto en conversaciones multi-turno, con una deriva medida del 20,0% (el base registra 0,0% de deriva, metrica no directamente comparable por el distinto punto de partida).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Conversion de zonas horarias en asistentes de calendario: el adaptador puede integrarse en un servicio que traduzca horas entre regiones y explique el resultado; su entrenamiento especifico en tz-convert lo hace mas fiable que el base en esta tarea concreta (40,0% frente a 12,0% de adherencia a la especificacion).
- Normalizacion de datos de eventos: en pipelines ETL que ingieren fechas y horas de fuentes heterogeneas, el modelo puede reformatear y convertir marcas temporales siguiendo una especificacion fija, con un 57,3% de robustez medida.
- Evaluacion de la curva de eficiencia de datos: util como checkpoint de referencia para estudiar como mejora la calidad al pasar de 3.000 a 12.000 ejemplos, comparando con el checkpoint n12000 del mismo autor.
- Prototipado de asistentes conversacionales de dominio acotado: al ser un adaptador LoRA de ~0,1 GB sobre un base de 4B, permite iterar rapidamente en entornos con recursos limitados.
- Investigacion sobre especializacion mediante QLoRA: sirve como caso reproducible (dataset, commit e hiperparametros publicados) para estudiar el efecto del volumen de datos en tareas de formato estricto.
- Filtrado y validacion de respuestas en produccion: puede usarse como modelo auxiliar que comprueba si una salida cumple la especificacion de conversion horaria antes de enviarla a un sistema posterior.

## Benchmarks y rendimiento

| Metrica | Este checkpoint (n3000) | Modelo base con prompt completo |
|---|---|---|
| Spec-adherence | 40,0% | 12,0% |
| Robustness | 57,3% | 23,3% |
| Drift: conversaciones mantenidas | 20,0% | 0,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores son propias del proyecto tz-convert y no son comparables con las de benchmarks generales.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,1 GB (tamano del repositorio); requiere cargar ademas el modelo base Qwen3-4B-Instruct-2507.
- VRAM estimada para el base en fp16: en torno a 8 GB solo para pesos, mas memoria para el contexto y el adaptador; en cuantizacion de 4 bits, aproximadamente 3-4 GB. Estas cifras son estimaciones a partir del tamano del base, no datos publicados en la informacion disponible.
- GPU recomendadas: A100 o H100 para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con holgura; RTX 3090/4080 para cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 4 bits, y en 16 GB o mas en fp16.
- Opciones de despliegue: vLLM y TGI para servir el base con el adaptador LoRA; llama.cpp y Ollama para el base cuantizado en GGUF (el adaptador deberia fusionarse previamente con el base); transformers con PEFT para uso directo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| debudash/qwen3-4b-tz-convert-v3-n3000 | 4B (base) + LoRA | no disponible | tz-convert, 3.000 ejemplos | apache-2.0 | HuggingFace |
| debudash/qwen3-4b-tz-convert-v3-n12000 | 4B (base) + LoRA | no disponible | tz-convert, 12.000 ejemplos (mejor checkpoint de la serie) | apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en la informacion | proposito general, instrucciones | apache-2.0 | HuggingFace |

El checkpoint n12000 es la referencia directa dentro de la misma serie; la model card lo senala como el mejor. No se dispone de datos de benchmarks comparativos con otros adaptadores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin el base Qwen/Qwen3-4B-Instruct-2507 no es utilizable.
- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Entrenado con solo 3.000 ejemplos: la model card lo situa como un punto intermedio de la curva, no como el checkpoint recomendado (el autor remite al n12000).
- La metrica de deriva (20,0%) es peor que la del base (0,0%), lo que sugiere perdida de consistencia en conversaciones largas; conviene validar este aspecto en el caso de uso concreto.
- Las metricas reportadas son propias del proyecto y no equivalen a benchmarks estandar; no deben extrapolarse a capacidades generales.
- Riesgo de alucinacion en conversiones de zonas horarias no cubiertas por el dataset de entrenamiento; se recomienda validacion determinista (por ejemplo, con una libreria de timezones) en produccion.
- No se documentan sesgos especificos, pero al derivar de un modelo de proposito general puede heredar los del base.
- Licencia apache-2.0: permite uso comercial, pero deben respetarse tambien las condiciones del modelo base.
- El repositorio tiene 21 descargas y 0 likes; es un artefacto de investigacion con poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n3000
- Mejor checkpoint de la serie: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Codigo, conjuntos de evaluacion e informes: https://huggingface.co/debudash/slm-training
- Dataset de entrenamiento: https://huggingface.co/datasets/debudash/tz-convert-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
