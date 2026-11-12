# BurnyCoder/novelty-es-qwen2.5-0.5b-reward-only-seed0-gen100

## Resumen

Novelty ES continuation-seed0-gen100 (variante reward_only) es un ajuste fino del modelo Qwen2.5-0.5B-Instruct desarrollado por el usuario BurnyCoder, entrenado mediante estrategias evolutivas (evolution strategies, ES) en lugar de descenso de gradiente convencional. El objetivo concreto del entrenamiento es la tarea aritmética Countdown: dado un conjunto de numeros, generar una expresion que alcance un objetivo utilizando operaciones basicas. El modelo forma parte de un estudio comparativo entre dos brazos experimentales (main y reward_only) que busca determinar si una senal de novedad anadida a la recompensa aporta beneficios medibles frente a una recompensa puramente de acierto.

El checkpoint publicado corresponde a la generacion 100 del brazo reward_only, continuado desde el checkpoint FP32 de la generacion 19 de un piloto previo. Cuenta con 494.032.768 parametros en formato safetensors (aproximadamente 1.0 GB de repositorio) y se distribuye bajo licencia Apache 2.0. La model card es explicitamente investigadora: el autor declara que no hay evidencia de mejoras generales de lenguaje, solo una adaptacion aritmetica para la tarea Countdown, y que la hipotesis de mejora direccional no se confirmo en esta semilla.

Es relevante ahora como ejemplo reproducible de investigacion en entrenamiento de LLM mediante busqueda evolutiva con novedad, con preregistro publico, evaluacion sobre un conjunto fresco de 2048 problemas y metricas pareadas. No es un modelo destinado a produccion general, sino un artefacto de investigacion para estudiar senales de recompensa y dinamicas de busqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado mediante evolution strategies |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (checkpoint en FP32 segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct (revision base `7ae557604adf67be50417f59c2c2f167def9a775`), un transformer decoder-only de 0.5B parametros. El ajuste no se realiza por retropropagacion clasica, sino mediante estrategias evolutivas: se mantiene una poblacion de candidatos, se evaluan y se seleccionan segun una funcion de recompensa. En este brazo (reward_only) la recompensa se basa unicamente en el exito de la tarea Countdown, mientras que el brazo main anade una senal de novedad. El entrenamiento se ejecuta en FP32, con semilla fija (seed0) y configuracion preregistrada.

El proceso se extendio desde el checkpoint de la generacion 19 hasta un objetivo fijo de 100 generaciones, preservando archivo, generadores de numeros aleatorios y planificaciones globales. La evaluacion primaria emplea un conjunto fresco de 2048 problemas que excluye todas las combinaciones de numeros vistas anteriormente, y el test original se usa como evaluacion secundaria. El autor documenta que la ejecucion original se interrumpio (generacion principal 100 completada, control en generacion 31) y que una recuperacion posterior permitio completar el trabajo con un presupuesto de tiempo limitado. No se aplican tecnicas como decodificacion especulativa ni attention lineal; la innovacion metodologica reside en el esquema de busqueda evolutiva y en el diseno de evaluacion pareada.

## Capacidades

- Generacion de texto autoregresiva heredada de Qwen2.5-0.5B-Instruct.
- Resolucion de problemas aritmeticos de tipo Countdown: construir expresiones con los numeros dados para alcanzar un objetivo.
- Generacion de expresiones legales (sintacticamente validas) con mayor frecuencia que el modelo original en problemas de tres y cuatro numeros.
- Soporte conversacional basico (tag `conversational`), heredado del modelo base.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking especificas para este checkpoint.
- Capacidades multilingues no documentadas en la informacion disponible.

## Casos de uso

- Investigacion sobre aprendizaje por refuerzo sin gradiente: usar el checkpoint como referencia reproducible para estudiar si las estrategias evolutivas pueden adaptar tareas aritmeticas en modelos pequenos, comparando los brazos main y reward_only.
- Estudio de senales de recompensa: analizar como la recompensa puramente de acierto (reward_only) se compara con variantes que anaden novedad, usando las metricas pareadas publicadas.
- Benchmark de tareas Countdown: emplear el modelo como linea base entrenada para medir pass@1 y pass@8 en problemas aritmeticos de composicion de expresiones.
- Reproducibilidad de experimentos: el preregistro publico y la conservacion exacta de checkpoints y candidatos permiten replicar el pipeline de entrenamiento y evaluacion.
- Analisis de legalidad de expresiones: estudiar la tasa de expresiones sintacticamente validas frente a la tasa de acierto, un fenomeno documentado por el autor.
- Docencia y divulgacion: ejemplo didactico de entrenamiento evolutivo de LLM con evaluacion sobre conjuntos frescos y control de sesgo de seleccion.
- Prototipado de bajo coste: al ser un modelo de 0.5B, sirve para experimentar en una sola GPU consumer con pipelines de transformers.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto fresco de 2048 problemas (intervalos al 95 %):

| Condicion | Precision fresca | Intervalo 95 % | Precision hard | pass@1 | pass@8 | Estado |
|---|---|---|---|---|---|---|
| original | 0,24 % | 0,05 % - 0,49 % | 0,10 % | 0,12 % | 0,89 % | completo |
| main | 7,37 % | 6,25 % - 8,50 % | 0,39 % | 2,27 % | 10,66 % | completo |
| reward_only | 7,71 % | 6,54 % - 8,89 % | 0,88 % | 2,47 % | 11,95 % | completo |

El autor indica que la hipotesis de mejora direccional no se sostuvo en esta semilla: la precision del brazo main no supero a reward_only y el intervalo pareado incluye cero, por lo que no se establece diferencia de rendimiento entre ambos. Ambos brazos mejoran claramente sobre el modelo original en el mismo conjunto fresco. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en FP32 (494M parametros x 4 bytes), alrededor de 1 GB en FP16/BF16 y menos de 1 GB en cuantizacion de 8 bits, sin contar overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer moderna con 4 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y conversion a GGUF para llama.cpp u Ollama si se desea, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (reward_only) | 494M | no disponible | ES sobre Qwen2.5-0.5B-Instruct, tarea Countdown | apache-2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494M | no disponible | SFT/RLHF convencional, uso general | apache-2.0 | Hugging Face |
| Brazo main del mismo estudio | 494M | no disponible | ES con senal de novedad, tarea Countdown | apache-2.0 | Hugging Face (mismo autor) |
| Modelos de 0.5B de uso general (p. ej. variantes TinyLlama o SmolLM) | ~0.5B | no disponible | Pretraining general | variable | Hugging Face |

La comparacion relevante es frente al modelo base Qwen2.5-0.5B-Instruct (precision fresca del 0,24 % en Countdown) y frente al brazo main (7,37 %), que en esta semilla no supera a reward_only (7,71 %). No se dispone de datos de benchmarks generales para comparar con otros modelos de 0.5B.

## Limitaciones y advertencias

- Modelo exclusivamente de investigacion: el autor declara que no hay evidencia de mejoras generales de lenguaje, solo adaptacion aritmetica a Countdown.
- La hipotesis de mejora direccional no se confirmo; el intervalo pareado incluye cero, por lo que no se puede afirmar superioridad del brazo main.
- Estudio de una sola semilla (seed0): no mide robustez frente a variabilidad de semilla.
- Precision absoluta baja: 7,71 % en el conjunto fresco y 0,88 % en problemas hard; no es adecuado para uso aritmetico en produccion.
- Riesgo de alucinacion y de generar expresiones legales que no alcanzan el objetivo: el propio autor senala que la legalidad no implica exito.
- Idiomas soportados no documentados; no se garantiza comportamiento multilingue.
- Sesgos del modelo base Qwen2.5-0.5B-Instruct no evaluados en este ajuste.
- Sin datos de benchmarks generales (MMLU, HumanEval, GSM8K) que permitan evaluar capacidades fuera de Countdown.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta validado para produccion y su rendimiento fuera de la tarea es incierto.
- La model card documenta una ejecucion interrumpida y recuperada con presupuesto de tiempo limitado; el autor indica que la asignacion original no se cumplio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/novelty-es-qwen2.5-0.5b-reward-only-seed0-gen100
- Repositorio del estudio (preregistro, codigo, procedencia y limitaciones): https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
