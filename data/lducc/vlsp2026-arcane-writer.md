# lducc/vlsp2026-arcane-writer

## Resumen

VLSP 2026 Arcane writer es un adaptador LoRA publicado por el usuario lducc (equipo Arcane) para la tarea compartida VLSP 2026 Multimodal Numerical Reasoning QA. No es un modelo completo, sino un adaptador PEFT que se monta sobre Qwen/Qwen3.5-4B y cuya funcion es escribir el programa de razonamiento que responde a preguntas sobre informes financieros vietnamitas. En la clasificacion privada oficial obtuvo 78,66 de Program Accuracy y 87,61 de Execution Accuracy, quedando en segunda posicion entre todos los equipos participantes.

El adaptador tiene 194.789.376 parametros en bf16 y se construye como un "soup" uniforme de tres ejecuciones LoRA de rango 32 (alpha 64), entrenadas tres epocas sobre los datos oficiales con distintas semillas de ordenacion de datos. La combinacion se realiza con `add_weighted_adapter` de PEFT usando `combination_type="cat"` y pesos de 1/3, de modo que el adaptador resultante de rango 96 almacena exactamente la media de las tres actualizaciones.

Es relevante ahora porque documenta una receta reproducible y de bajo coste (adaptador de 0,4 GB sobre una base de 4B cuantizada en 4 bits) para razonamiento numerico multimodal en un idioma de bajos recursos como el vietnamita, con codigo y paper publicados. Su alcance es deliberadamente estrecho: no es un modelo de proposito general, sino un componente especializado dentro de un pipeline de QA sobre informes financieros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-4B; rank 96, alpha 96, capas de atencion y MLP |
| Parametros totales | 194.789.376 (solo el adaptador, en bf16); la base Qwen3.5-4B se suma aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base en 4-bit NF4 con doble cuantizacion y computo en bf16 (bitsandbytes); el adaptador se distribuye en safetensors bf16 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), un transformer de 4.000 millones de parametros, en las capas de atencion y MLP del modelo de lenguaje. El entrenamiento se realizo sobre la base cuantizada en 4-bit NF4 con doble cuantizacion y computo en bf16 mediante bitsandbytes, y el autor indica explicitamente que el adaptador debe cargarse sobre esa misma base NF4.

La innovacion metodologica es la construccion del adaptador final: tres ejecuciones LoRA de rango 32 y alpha 64, entrenadas tres epocas con semillas de ordenacion de datos distintas, se fusionan con `add_weighted_adapter` de PEFT en modo `combination_type="cat"` con pesos de 1/3. El resultado es un adaptador de rango 96 que representa la media exacta de las tres actualizaciones, una forma de "model soup" aplicada a factores LoRA que busca robustez frente al orden de los datos sin incrementar el coste de inferencia respecto a un unico adaptador de mayor rango. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de programas de razonamiento: dado un informe financiero vietnamita, tarjetas de graficos y ejemplos recuperados, produce el programa que resuelve la pregunta numerica.
- Razonamiento numerico sobre datos financieros multimodales (informe y tarjetas de graficos).
- Recuperacion aumentada en el prompt: el formato incluye diez ejemplos seleccionados por BM25, construidos por `src/reasoning/prompts.py`.
- Ejecucion verificable: la salida es un programa evaluable, lo que permite medir Execution Accuracy ademas de Program Accuracy.
- Decodificacion greedy con thinking desactivado y un maximo de 512 tokens nuevos, segun las instrucciones del autor.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision nativa ni audio en la informacion disponible.
- Capacidad multilingue limitada al vietnamita segun el campo `language` de la model card.

## Casos de uso

- Responder preguntas numericas sobre informes financieros vietnamitas: el adaptador genera el programa de calculo a partir del informe y las tarjetas de graficos, y el programa se ejecuta para obtener la cifra final; es el escenario exacto para el que fue entrenado y evaluado.
- Automatizacion de extraccion de metricas en due diligence: integrado en un pipeline que recibe informes anuales y devuelve programas ejecutables, permite calcular ratios y variaciones sin intervencion manual, con la ventaja de que cada respuesta es auditable a nivel de codigo.
- Generacion de respuestas verificables en auditoria: al producir un programa en lugar de texto libre, un revisor puede inspeccionar la logica y reproducir el resultado, lo que reduce el riesgo de cifras inventadas en contextos regulatorios.
- Evaluacion comparativa de sistemas de QA numerico: sirve como referencia publica (con codigo y paper) para equipos que quieran reproducir el segundo puesto de VLSP 2026 o construir lineas base sobre Qwen3.5-4B.
- Prototipado de bajo coste en hardware modesto: al ser un adaptador de 0,4 GB sobre una base de 4B en 4 bits, permite desplegar un sistema de razonamiento financiero especializado en una unica GPU de consumo.
- Investigacion sobre fusion de adaptadores: la receta de "soup" de tres LoRA de rango 32 en un adaptador de rango 96 con `combination_type="cat"` es un caso practico replicable para estudiar robustez al orden de datos en fine-tuning parametrizado eficiente.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| VLSP 2026 Multimodal Numerical Reasoning QA (leaderboard privado oficial) | Program Accuracy | 78,66 |
| VLSP 2026 Multimodal Numerical Reasoning QA (leaderboard privado oficial) | Execution Accuracy | 87,61 |
| VLSP 2026 Multimodal Numerical Reasoning QA (leaderboard privado oficial) | Posicion | 2.º de todos los equipos |

No se han publicado en la informacion disponible resultados en benchmarks generales como MMLU, HumanEval o GSM8K, ni comparaciones numericas con otros adaptadores de la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: la base Qwen3.5-4B en 4-bit NF4 con doble cuantizacion ocupa del orden de 2,5-3 GB de pesos; sumando el adaptador (194,8 M de parametros en bf16, unos 0,4 GB), cache KV y overhead de bitsandbytes, se puede estimar un rango de 5-8 GB para contexto corto, aunque el autor no publica cifras oficiales.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o una A100/H100 son holgadas; una RTX 3090 o 4080 tambien deberian ser suficientes para la configuracion de 4 bits.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas, dado que la base se carga en 4 bits; no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: el flujo oficial es PEFT 0.21.0 con bitsandbytes sobre la base NF4, invocando `python -m src.reasoning.predict private <dir containing final_adapter/>`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la naturaleza de adaptador PEFT sobre base cuantizada limita las opciones listas para usar.
- Latencia y throughput: no disponibles. La decodificacion es greedy, con thinking desactivado y un maximo de 512 tokens nuevos, lo que acota el coste por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lducc/vlsp2026-arcane-writer | 194,8 M (adaptador) sobre base de 4B | no disponible | LoRA especializado en QA numerico financiero en vietnamita | apache-2.0 | Hugging Face (18 descargas) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Modelo generalista | no disponible en la informacion | Hugging Face |
| Otros adaptadores de VLSP 2026 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables en la misma tarea, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Alcance muy restringido: solo genera programas de razonamiento para preguntas sobre informes financieros vietnamitas; no es un modelo de proposito general ni un chatbot.
- Dependencia estricta de la base: fue entrenado sobre Qwen3.5-4B en 4-bit NF4 con doble cuantizacion y debe cargarse sobre esa misma configuracion; usarlo sobre otra cuantizacion o sobre pesos completos puede degradar el rendimiento.
- Dependencia del pipeline de prompt: el formato de entrada (informe, tarjetas de graficos y diez ejemplos BM25) lo construye `src/reasoning/prompts.py`; alterar ese formato fuera del codigo oficial invalida las condiciones de evaluacion.
- Idioma unico: el campo `language` declara solo vietnamita; no hay evidencia de transferencia a castellano u otros idiomas.
- Riesgo de alucinacion en el programa generado: aunque la salida sea ejecutable, un programa sintacticamente valido puede calcular una magnitud incorrecta; la Execution Accuracy de 87,61 implica que una parte no trivial de las ejecuciones no es correcta.
- Sin datos publicados sobre sesgos, tokens de entrenamiento, composicion del dataset ni evaluaciones de seguridad.
- Licencia apache-2.0 en el adaptador, pero conviene verificar la licencia de la base Qwen3.5-4B antes de un uso comercial en produccion.
- Adopcion muy baja (18 descargas, 0 likes) y sin validacion externa independiente; el resultado de 78,66/87,61 procede unicamente del leaderboard privado de la competicion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lducc/vlsp2026-arcane-writer
- Codigo y paper: https://github.com/lducc/vlsp
- Dataset de tarjetas de graficos: https://huggingface.co/datasets/lducc/vlsp2026-chart-cards
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
