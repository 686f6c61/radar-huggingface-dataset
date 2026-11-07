# Shokou1/qwen3.5-poetry-9b-v7

## Resumen

Qwen3.5-Poetry-9B-v7 es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-9B, especializado en la generacion de poesia clasica china (near-body poetry: jueju de cinco y siete caracteres, asi como prosa clasica o guwen). Lo desarrolla el usuario independiente Shokou1 (ShokouP) y se publica bajo licencia Apache-2.0. El modelo resuelve un problema muy concreto: los LLM generalistas, incluso los de 9B parametros, fallan sistematicamente al respetar las restricciones formales de la poesia china clasica (numero exacto de versos, longitud por verso y rima entre los versos pares), y ademas tienden a reproducir poemas memorizados del corpus de entrenamiento.

La propuesta tecnica del autor es un pipeline de ajuste en tres fases sobre el modelo base: un SFT de reparacion de formato, un SFT de refuerzo de rima con 6.000 jueju reales filtrados de un corpus de 300.000 poemas, y una etapa final de GRPO con recompensa basada en reglas (rima binaria mas un termino de formato con peso reducido). El resultado declarado es una tasa de cumplimiento de formato de 4/4 y de rima de 4/4 en el conjunto de validacion del autor, con una superposicion de 8-gramas de 0,00 frente al corpus de entrenamiento.

Es relevante ahora porque demuestra, con codigo y datos abiertos, que es viable especializar un modelo de 9B en una tarea con restricciones simbolicas estrictas usando RL con recompensas programaticas en una GPU de portatil de 24 GB, y porque documenta fallos de ingenieria concretos (chat template inconsistente, tablas de rima en tradicional frente a salida en simplificado) que afectan a cualquiera que entrene este tipo de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-9B |
| Parametros totales | 9B en el modelo base; el adaptador LoRA es un subconjunto (tamano de repo 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B; no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible de forma explicita; el autor distribuye una version para Ollama (poetry-9b-v7), lo que implica cuantizaciones GGUF, pero no se detallan los tipos |
| Idiomas soportados | chino (zh), en registro chino clasico |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, almacenado en fragmentos `parts/adapter_model.safetensors.part***` que requieren fusion previa con `merge_chunks.py`); distribucion adicional via Ollama |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-9B, un transformer decoder-only de la familia Qwen3.5. El adaptador se entrena en tres etapas encadenadas. Primero, un SFT de reparacion de formato con 840 ejemplos de jueju de profesor/poetica multiplicados por dos mas 3.500 ejemplos del SFT original, durante 200 pasos, partiendo de un SFT previo de 46.261 ejemplos (SFT v4). Despues, un SFT de refuerzo de rima durante 160 pasos, usando 6.000 jueju reales filtrados de un corpus de 300.000 poemas con criterios de cuatro versos, 20 o 28 caracteres y rima valida. Finalmente, una etapa de GRPO con 8 prompts y G=8, recompensa binaria de rima mas un termino de formato con peso reducido, KL beta=0,02 y learning rate 1e-5 durante 20 pasos.

El autor documenta tres hallazgos de ingenieria que condicionan el resultado: la generacion y el entrenamiento deben usar exactamente la misma chat template, ya que de lo contrario la tasa de cuatro versos cae del 96 % al 21 %; la tabla de rimas usa claves en caracteres tradicionales mientras la salida del modelo es en simplificado, lo que anula la recompensa de rima si no se normaliza; y el peso del termino de formato en la recompensa debe ser bajo para que la rima sea el criterio discriminante y el modelo no se limite a completar cuatro versos. El pipeline completo, los scripts de evaluacion y los datos estan publicados en el repositorio GitHub del autor.

## Capacidades

- Generacion de poesia clasica china en formatos de jueju (cuatro versos de cinco o siete caracteres) con control explicito del numero de versos y de caracteres por verso.
- Rima consistente entre los versos pares (segundo y cuarto) segun la tabla de rimas usada en el entrenamiento.
- Generacion de prosa clasica china (guwen), aunque el autor senala que su calidad es inferior a la de la poesia near-body.
- Aceptacion de instrucciones con metadatos de estilo y tematica (por ejemplo, dinastia, autor de referencia, forma y tema) a traves de la chat template del modelo base.
- Generacion de texto en chino clasico; el modelo no esta entrenado para otros idiomas.
- Inferencia local en GPU de consumo mediante Ollama.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Generacion de jueju para publicaciones y antologias digitales: el modelo permite solicitar una forma concreta (cinco o siete caracteres, cuatro versos) y un tema, y produce poemas que cumplen el recuento de versos y la rima, lo que reduce la revision manual frente a un LLM generalista.
- Herramientas educativas de poetica china: integrado en una aplicacion de ensenanza, puede generar ejemplos que ilustran reglas de rima y estructura, y el profesor puede senalar los aciertos formales del poema generado.
- Generacion asistida con control de estilo por dinastia: las instrucciones admiten referencias como Tang o Song, lo que permite crear variaciones estilisticas para demostraciones o contenido editorial.
- Filtrado y aumento de datos para investigacion en NLP clasico chino: el modelo puede producir candidatos de jueju conformes a las restricciones formales que despues se validan con las mismas reglas programaticas usadas en el GRPO.
- Chatbot tematico de poesia clasica en local: desplegado con Ollama en un portatil con GPU de 24 GB, permite generar poemas sin enviar datos a servicios externos, util para entornos con requisitos de privacidad.
- Prototipado de recompensas programaticas para RL: el repositorio del autor sirve como referencia reproducible para entrenar tareas con restricciones simbolicas (rima, metrica, formato) usando GRPO y verificadores deterministas.
- Generacion de contenido para videojuegos o narrativa ambientada en China clasica: poemas y textos en guwen para menus, pergaminos o dialogos, con control de forma y longitud.

## Benchmarks y rendimiento

La evaluacion publicada por el autor es una validacion funcional sobre 4 prompts de jueju, no un benchmark estandarizado. Los resultados son los siguientes:

| Modelo | Formato 4 versos | Rima (versos 2/4) | Superposicion 8-gramas |
|---|---:|---:|---:|
| sft_v2 (SFT 46k) | 2/4 | no disponible | no disponible |
| dpo2 (DPO 400 pasos) | 0/4 | no disponible | no disponible |
| fmt_sft (SFT de reparacion de formato) | 4/4 | 4/4 | 1 coincidencia con "Lu Zhai" |
| grpo_v7 (este modelo) | 4/4 | 4/4 | 0,00 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El propio autor advierte que la evaluacion usa solo 4 prompts y constituye una verificacion de funcionalidad, no un benchmark.

## Requisitos de hardware

- El adaptador LoRA pesa 0,3 GB; el modelo base Qwen3.5-9B en bfloat16 requiere aproximadamente 18 GB de VRAM, por lo que encaja en GPUs de 24 GB.
- El autor indica que el entrenamiento se realizo en una GPU de portatil de 24 GB, lo que situa el limite practico en tarjetas como RTX 4090 para portatil, RTX 3090 o RTX 4090 de escritorio.
- Para inferencia en GPU de consumo con cuantizacion GGUF a traves de Ollama, el requisito de VRAM es menor, aunque no se especifican los tamanos de cuantizacion publicados.
- Opciones de despliegue documentadas: Ollama (`ollama run poetry-9b-v7`) y PEFT con transformers (`PeftModel.from_pretrained` sobre Qwen3.5-9B). No se documentan vLLM, TGI ni llama.cpp de forma explicita, aunque la distribucion Ollama implica el uso de llama.cpp por debajo.
- Antes de cargar el adaptador con PEFT es necesario fusionar los fragmentos de pesos con `python merge_chunks.py adapter_model.safetensors`.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-Poetry-9B-v7 | 9B (base) + LoRA | no disponible | Poesia clasica china con restricciones formales | Apache-2.0 | Hugging Face y Ollama |
| Qwen3.5-9B (base) | 9B | no disponible | Proposito general, multilingue | no disponible en la informacion | Hugging Face |
| Qwen3.5-Poetry-9B-v1 | 9B (base) + LoRA | no disponible | Version previa de poesia clasica china | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otros modelos especializados en poesia china clasica en la informacion proporcionada.

## Limitaciones y advertencias

- No valida ni genera tono (pingze) ni patrones metricos de lushi; solo controla numero de versos, longitud por verso y rima.
- La calidad en ci y fu (formas liricas y prosodicas) es inferior a la de la poesia near-body.
- Riesgo de memorizacion: el entrenamiento incluye poemas reales, y el autor advierte que poemas poco conocidos pueden reproducirse literalmente. Recomienda aplicar un filtro de huellas de 8-gramas en produccion.
- La evaluacion se limita a 4 prompts y no constituye un benchmark; las cifras de 4/4 no deben extrapolarse a un rendimiento general.
- El modelo solo esta entrenado en chino clasico; no se documenta soporte de otros idiomas ni de registro moderno.
- La licencia Apache-2.0 del adaptador no exime de verificar la licencia del modelo base Qwen3.5-9B, que no se detalla en la informacion disponible.
- La carga del adaptador requiere fusionar previamente los fragmentos de pesos; omitir este paso impide la carga correcta.
- Posibles sesgos derivados del corpus de poesia clasica, dominado por autores masculinos de elite letrada; no se documenta ninguna mitigacion.
- Riesgo de alucinacion en atribuciones historicas o de autoria si se piden en el prompt; el modelo no dispone de verificacion factual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shokou1/qwen3.5-poetry-9b-v7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/Shokou1/classical-poetry-sft
- Version previa: https://huggingface.co/Shokou1/qwen3.5-poetry-9b-v1
- Codigo, evaluacion y scripts de entrenamiento: https://github.com/ShokouP/classical-poetry-lm
- Releases con recopilacion de poemas y paper: https://github.com/ShokouP/classical-poetry-lm/releases
- Repositorio de la familia Qwen3.5 (referencia externa): https://github.com/ABDtmx/Qwen3.5
