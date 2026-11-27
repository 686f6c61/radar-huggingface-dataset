# BurnyCoder/novelty-es-qwen2.5-0.5b-main-seed0

## Resumen

Novelty ES pilot: main es un ajuste fino experimental del modelo Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario BurnyCoder en Hugging Face. No se trata de un modelo de proposito general, sino de un artefacto de investigacion para estudiar si una estrategia evolutiva (evolution strategies, ES) con presion hacia la novedad mejora el rendimiento en tareas aritmeticas concretas, en este caso el problema tipo "countdown". El modelo conserva la arquitectura y el tokenizador del Qwen2.5-0.5B-Instruct original y solo modifica los pesos mediante dicho proceso de optimizacion.

El interes del modelo es metodologico, no practico. La model card reporta una comparacion entre tres condiciones (original, main con novedad y reward-only) sobre un conjunto de test fijo, con intervalos de confianza del 95 %. El resultado principal es que la hipotesis de mejora direccional no se sostiene: la condicion main no supera a la condicion reward-only, y el intervalo pareado incluye el cero, por lo que no se establece una diferencia de rendimiento entre ambas.

Ambos checkpoints entrenados superan al modelo original en el test (1,12 % frente a 0,29 % de precision greedy), pero la ganancia es muy pequena en terminos absolutos y el autor advierte explicitamente que se trata de una adaptacion aritmetica solo para investigacion, sin evidencia de mejoras generales en lenguaje. El modelo tiene 494 millones de parametros, licencia Apache 2.0 y esta pensado para reproducir el experimento, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado mediante evolution strategies |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parametros con atencion causal estandar. El ajuste no se realiza por descenso de gradiente clasico ni por RLHF/DPO, sino mediante evolution strategies, una familia de optimizacion sin gradientes que muestrea perturbaciones de los pesos y selecciona aquellas que mejoran una funcion de recompensa. En este piloto se comparan dos variantes: una con presion hacia la novedad (main) y otra solo con recompensa (reward_only), ademas del modelo original como referencia.

La tarea de entrenamiento es el problema "countdown": dada una lista de numeros y un objetivo, el modelo debe producir una expresion aritmetica valida que alcance dicho objetivo. La evaluacion se realiza con decodificacion greedy y con pass@k sobre un subconjunto fijo del test original, y se reportan tambien metricas de legalidad de las expresiones (que la expresion sea sintacticamente valida segun un verificador Python restringido). La model card menciona un limite de truncamiento de 256 tokens WordPiece para el modelo MiniLM usado en la evaluacion de similitud, y fija una penalizacion de repeticion de 1.1 en ambas rutas de decodificacion. El autor publica ademas una auditoria cientifica independiente y las mediciones crudas en un dataset aparte.

## Capacidades

- Generacion de texto conversacional, heredada del Qwen2.5-0.5B-Instruct base.
- Razonamiento aritmetico limitado a la tarea countdown: producir expresiones con numeros dados para alcanzar un objetivo.
- Generacion de expresiones en sintaxis Python restringida, aceptadas por el verificador historico del experimento.
- Soporte de tool calling y function calling: no documentado en la model card; se desconoce si se conserva respecto al base.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento se centra en una unica tarea aritmetica.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Reproduccion de experimentos de evolution strategies: el checkpoint permite replicar la comparacion entre las condiciones main y reward_only sobre el mismo test fijo y verificar los resultados reportados.
- Investigacion sobre presion hacia la novedad en optimizacion sin gradientes: sirve como evidencia empirica de que la novedad no aporta ventaja frente a la recompensa sola en este piloto.
- Estudio de legalidad de expresiones aritmeticas: el modelo genera expresiones en sintaxis Python restringida que pueden analizarse con el verificador del autor para medir tasas de validez.
- Docencia y divulgacion: ejemplo compacto (0,5 B de parametros) para explicar como se evalua un ajuste fino con intervalos de confianza y test estadisticos pareados (McNemar).
- Auditoria metodologica: la publicacion de mediciones crudas y auditoria independiente permite usar el modelo como caso de estudio de buenas practicas de reporte en investigacion de IA.
- Analisis de limitaciones de transferencia: util para estudiar por que una mejora en problemas de tres o cuatro numeros no se traslada a los de cinco numeros, como reporta la model card.

## Benchmarks y rendimiento

Datos reportados en la model card (precision greedy, intervalos al 95 %):

| Condicion | Precision test greedy | Intervalo 95 % | Precision hard greedy | pass@1 test original | pass@8 test original |
|---|---|---|---|---|---|
| original | 0,29 % | 0,10 % - 0,54 % | 0,10 % | 0,12 % | 0,89 % |
| main | 1,12 % | 0,68 % - 1,61 % | 0,00 % | 0,27 % | 2,06 % |
| reward_only | 1,12 % | 0,68 % - 1,61 % | 0,10 % | 0,22 % | 1,67 % |

El autor senala que la diferencia entre main y reward_only no es significativa (intervalo pareado incluye el cero; McNemar exacto bilateral post hoc p = 1). Ambos checkpoints entrenados superan al original en el test, pero tienen menor validez de expresion en los problemas de cinco numeros que el modelo original, por lo que la mejora no se transfiere de forma uniforme. No se reportan resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 (494 M de parametros) y en torno a 0,5-0,7 GB si se convierte a cuantizacion de 8 o 4 bits, aunque no se distribuyen variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090); tambien cabe en CPU para inferencia lenta.
- Cabe en GPU consumer: si, en practicamente todas las GPU con soporte CUDA de los ultimos anos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference segun los tags, y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se ofrecen pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Novelty ES pilot: main (este modelo) | 494 M | no disponible | Ajuste por evolution strategies para countdown | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | no disponible en esta ficha | Instruccion general | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | no disponible en esta ficha | Instruccion general | Apache 2.0 | Hugging Face |

La comparacion relevante es con su modelo base: comparten arquitectura y numero de parametros, y la unica diferencia son los pesos ajustados por ES. Frente a modelos de instruccion de mayor tamano, este checkpoint no esta pensado para uso general y su rendimiento en tareas aritmeticas es muy bajo en terminos absolutos (1,12 % de precision greedy en el test reportado).

## Limitaciones y advertencias

- Modelo de investigacion: el autor indica explicitamente que es una adaptacion aritmetica solo para investigacion y que no hay evidencia de mejoras generales en lenguaje.
- Rendimiento absoluto muy bajo: 1,12 % de precision greedy en el test principal y 0,00 % en el split hard de cinco numeros para la condicion main.
- Hipotesis no confirmada: la presion hacia la novedad no supera a la recompensa sola; el intervalo pareado incluye el cero.
- Los intervalos reportados excluyen la variabilidad entre semillas de entrenamiento, por lo que la incertidumbre real es mayor que la mostrada.
- Menor validez de expresiones en problemas de cinco numeros que el modelo original: la mejora no se transfiere de forma uniforme.
- Riesgo de alucinacion y de generar expresiones sintacticamente validas pero aritmeticamente incorrectas.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue fiable.
- Sesgos conocidos: no documentados en la model card.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja el uso en produccion por el caracter experimental y el bajo rendimiento.
- Los resultados dependen de la semilla y configuracion registradas; el autor advierte que los resultados con etiquetas balanceadas no se conocen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurnyCoder/novelty-es-qwen2.5-0.5b-main-seed0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del proyecto y preregistro: https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training
- Auditoria cientifica independiente: https://github.com/BurnyCoder/evolutionary-strategies-novelty-search-llm-training/blob/main/reports/reviews/scientific-audit-2026-11-26.md
- Mediciones crudas inmutables: https://huggingface.co/datasets/BurnyCoder/novelty-es-pilot-artifacts/tree/949e2dcb385bc2b7088c40444ef879b76596317d
- Configuracion de generacion fijada: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/7ae557604adf67be50417f59c2c2f167def9a775/generation_config.json
- Modelo MiniLM usado en evaluacion: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/blob/1110a243fdf4706b3f48f1d95db1a4f5529b4d41/sentence_bert_config.json
- Sintaxis de expresiones Python del verificador: https://docs.python.org/3.12/reference/expressions.html
