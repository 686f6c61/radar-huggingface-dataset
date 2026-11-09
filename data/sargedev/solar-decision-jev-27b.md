# SargeDev/Solar-Decision-JEV-27B

## Resumen

Solar-Decision-JEV-27B es un modelo de lenguaje de 26.896 millones de parametros publicado por SargeDev, construido mediante la fusion aritmetica de dos adaptadores LoRA sobre la base huihui-ai/Huihui-Qwen3.8-27B-abliterated. El modelo esta orientado a la toma de decisiones tipadas (typed decisions): en lugar de generar texto libre, expone una lectura de decision en una sola pasada de prefill con `max_tokens=1`, restringida a los tokens de las opciones, que se leen como log-probabilidades calibradas. La fusion combina un LoRA `r32` sobre `lm_head` (procedente del trabajo AutoTrust) con un LoRA `r16` propio entrenado sobre el corpus JEV System-1.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de despliegue poco habitual (decisiones como lectura de log-probs sin cabeza separada). Por otro, y de forma explicita, el autor publica un resultado negativo: la combinacion de ambos adaptadores rinde peor que cada uno de sus parentales en todas las metricas medidas, tanto en la tarea de decision como en chat general. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con un tamano de repositorio de 54,7 GB.

La arquitectura subyacente es la de Qwen3.8-27B (familia transformer densa, tag `qwen3_5_text`), sin que la informacion disponible detalle la longitud de contexto nativa ni la composicion exacta del entrenamiento original. El modelo esta marcado como `uncensored` y `abliterated`, lo que implica la supresion de mecanismos de rechazo en la base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (familia Qwen3.8, tag `qwen3_5_text`) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-model-len 8192`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | huihui-ai/Huihui-Qwen3.8-27B-abliterated |
| Tamano del repositorio | 54,7 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de la base abliterated de Qwen3.8-27B y aplica dos adaptadores LoRA fusionados por aritmetica directa de deltas LoRA, con verificacion bit-exacta (`err = 0.000e+00` frente a un calculo replicado sobre pesos muestreados, incluido `lm_head`). Los dos adaptadores son casi ortogonales (coseno medio 0,003), de modo que no se cancelan entre si. El primero es un LoRA `r32` sobre `lm_head` procedente del trabajo AutoTrust; el segundo es un LoRA `r16` propio (denominado "solar") entrenado sobre el corpus JEV System-1 (1.219 pasos, destilacion de cabeza de decision con perdidas KL + RPS).

La innovacion tecnica central es que la lectura de decision esta entrenada dentro del modelo: no hay cabeza separada que ejecutar. Una decision tipada se obtiene con un unico prefill y `max_tokens=1`, restringiendo la generacion a los tokens de las opciones y leyendo el resultado como log-probabilidades. Los datos de entrenamiento declarados son los corpus SargeDev/jev-distill-corpus-v3 y SargeDev/solar-decisions-corpus-v4. No se especifica el numero total de tokens de entrenamiento ni si hubo RLHF o DPO en la base original.

## Capacidades

- Generacion de texto conversacional multi-turno (heredada de la base Qwen3.8-27B).
- Decisiones tipadas: eleccion multiple (`choice`), puntuacion ordinal (`score`) y decision binaria (`noul`), leidas como log-probabilidades calibradas en un solo paso.
- Salida de probabilidades calibradas (se reportan ECE y KL en la model card).
- Razonamiento matematico (GSM8K 8-shot) e instrucciones (IFEval).
- Modo "thinking" controlable mediante `enable_thinking` en el chat template (el ejemplo de despliegue lo desactiva).
- Modelo `uncensored`/`abliterated`: sin mecanismos de rechazo en la base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.

## Casos de uso

- Enrutado y clasificacion de intenciones en produccion: el modelo puede emitir una decision tipada en un unico prefill con `max_tokens=1`, lo que reduce la latencia frente a la generacion autoregresiva de una etiqueta textual.
- Gate de decision binaria (si/no): la metrica `noul` (AUROC 0,9810, ECE 0,0057) lo hace util como clasificador binario calibrado cuando se necesita una probabilidad, no solo una etiqueta.
- Puntuacion ordinal de candidatos: la salida `score` permite ordenar elementos (por ejemplo, ranking de respuestas o prioridad de tickets) leyendo la distribucion sobre los niveles.
- Evaluacion A/B de adaptadores: el repositorio sirve como caso reproducible de fusion de LoRA y de medicion de degradacion por apilamiento, util para equipos que investigan merging.
- Chat general de uso interno: con GSM8K 91,0 e IFEval 72,5, es funcional para asistencia conversacional no critica, aunque por debajo de sus parentales.
- Experimentacion con modelos abliterated: permite estudiar el comportamiento sin rechazos en tareas de analisis de contenido, con las cautelas legales correspondientes.
- Prototipado de instrumentos de decision: como referencia abierta para construir gates calibrados con lectura de log-probs, aunque para maxima precision el autor recomienda `SargeDev/Solar-JEV-27B-R32`.

## Benchmarks y rendimiento

Resultados publicados por el autor. La comparacion de decision se realiza sobre 27.695 filas (test_set_30k, excluyendo placeholders `yuri_v1 D1`).

| Metrica | n | r32 + solar (este repo) | r32 + lm_head | AutoTrust (referencia) |
|---|---|---|---|---|
| noul.AUROC | 9969 | 0,9810 | 0,9919 | 0,9961 |
| noul.top-1 | 9969 | 0,9274 | 0,9486 | n/a |
| noul.ECE | 9969 | 0,0057 | 0,0122 | n/a |
| noul.KL | 9969 | 0,0167 | 0,0081 | n/a |
| choice.top-1 | 9199 | 0,8162 | 0,8693 | 0,9041 |
| choice.ECE | 9199 | 0,1592 | 0,0051 | n/a |
| choice.KL | 9199 | 0,2208 | 0,0530 | n/a |
| score.top-1 | 8527 | 0,7192 | 0,8135 | 0,8910 |
| score.ECE | 8527 | 0,0377 | 0,0367 | n/a |
| score.KL | 8527 | 0,1332 | 0,0619 | 0,0210 |
| overall.top-1 | 27695 | 0,8264 | 0,8807 | n/a |
| overall.ECE | 27695 | 0,0625 | 0,0090 | 0,0011 |
| overall.KL | 27695 | 0,1203 | 0,039 | n/a |

Benchmarks de chat:

| Modelo | GSM8K (8-shot) | IFEval (prompt-strict) | MMLU subset |
|---|---|---|---|
| huihui base | 97,7 | 76,0 | 81,2 |
| solar r16 solo | 96,0 | 81,5 | 81,2 |
| r32 + lm_head solo | 94,0 | 81,0 | 82,5 |
| r32 + lm_head + solar (este repo) | 91,0 | 72,5 | 80,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~26,9 B de parametros, en FP16/BF16 requiere aproximadamente 54 GB de pesos, mas overhead de KV cache; en cuantizacion de 8 bits rondaria 27-30 GB y en 4 bits 14-16 GB (estimaciones por tamano, no publicadas por el autor).
- GPU recomendadas: el autor documenta despliegue en una maquina clase GB10/Spark con vLLM; para FP16 completo se necesita una GPU con 80 GB (A100/H100) o multi-GPU.
- Cabe en GPU de consumo: solo con cuantizacion agresiva (4-8 bits) en tarjetas de 24 GB (RTX 4090) o 16 GB, aunque no se publican pesos GGUF ni cuantizados.
- Opciones de despliegue: vLLM (comando documentado con `--trust-remote-code`, `--max-model-len 8192`, `--gpu-memory-utilization 0.85`); llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. La lectura de decision en un unico prefill con `max_tokens=1` reduce la latencia frente a generacion autoregresiva, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision top-1 (overall) | Chat GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Solar-Decision-JEV-27B (este repo) | ~26,9 B | no disponible | 0,8264 | 91,0 | Apache 2.0 | Hugging Face |
| SargeDev/Solar-JEV-27B-R32 | ~26,9 B (base) | no disponible | 0,8807 | 94,0 | Apache 2.0 | Hugging Face |
| SargeDev/JEV-27B-Uncensored | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| AutoTrust (referencia publicada) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor documenta que este merge es peor que cada uno de sus parentales en todas las metricas: choice top-1 0,8162 frente a 0,8693 de r32 solo; score KL 0,1332 frente a 0,0619; GSM8K 91,0 frente a 94,0; IFEval 72,5 frente a 81,0.
- La calibracion en `choice` es deficiente (ECE 0,1592 frente a 0,0051 de r32 solo), lo que invalida el uso de las probabilidades de eleccion multiple como confianza fiable.
- Queda por debajo de la referencia publicada de AutoTrust en las tres familias de decision tipada (`choice`, `score`, `noul`).
- Modelo `abliterated`/`uncensored`: no incorpora mecanismos de rechazo, con el riesgo de generar contenido inapropiado o danino sin filtro.
- Riesgo de alucinacion inherente a la base; no se publican evaluaciones de factualidad.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingue mas alla del de la base.
- Longitud de contexto nativa no documentada; el ejemplo de despliegue limita a 8192 tokens.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio.
- Uso comercial permitido por Apache 2.0, pero la ausencia de filtros traslada al desplegador la responsabilidad legal y etica del contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Solar-Decision-JEV-27B
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Dataset de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset de decisiones: https://huggingface.co/datasets/SargeDev/solar-decisions-corpus-v4
- Merge recomendado por el autor (r32): https://huggingface.co/SargeDev/Solar-JEV-27B-R32
- Build solar de chat: https://huggingface.co/SargeDev/Solar-JEV-27B
- Modelo previo: https://huggingface.co/SargeDev/JEV-27B-Uncensored
