# FardoX/pplx-decider-v1.3-rapido

## Resumen

pplx-decider-v1.3-rapido es una cuantización no oficial a ~2 bits del modelo perplexity-ai/pplx-decider-v1.3, publicada por el usuario FardoX en Hugging Face. El modelo base es un derivado de Qwen/Qwen3.8-27B (licencia Apache-2.0) especializado en tareas de decisión (routing, triage y selección de herramientas), y esta versión "rapido" sustituye las 400 capas lineales del modelo de texto y el embedding de tokens por códigos vectoriales de 2 bits, dejando fuera la torre de visión. El resultado es un único archivo GGUF de 8,02 GB que cabe en memoria de un equipo de escritorio modesto.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de investigación que, según su propio autor, no supera el control de calidad que se había fijado (97,5 % de acuerdo top-1 frente al 99,5 % exigido en CPU, y 94,61 % de acuerdo top-1 global frente al 95 % mínimo). Por otro, ilustra con datos concretos los límites de la cuantización extrema a 2 bits en modelos de 27 000 millones de parámetros: la pérdida de calidad es severa en conocimiento y razonamiento, aunque se mantiene aceptable en tareas de clasificación y enrutamiento.

El modelo tiene 26 895 998 464 parámetros totales en su forma original (safetensors), pero el GGUF cuantizado ocupa solo 8,02 GB con 2,0625 bits por peso en las 401 matrices cuantizadas y 2,50 bits por peso sobre el archivo completo. La licencia es Apache-2.0, heredada del modelo base, y el autor declara explícitamente que no está afiliado ni respaldado por Perplexity ni por Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.8-27B); cuantizacion vectorial por columnas en 400 capas lineales y embedding de tokens |
| Parametros totales | 26.895.998.464 (forma original en safetensors) |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | 4096 tokens (valor usado en el comando de ejemplo del autor; no se especifica el maximo nativo) |
| Tipos de cuantizacion | IQ2_XXS (2.0625 bpw) en 401 matrices; readout Q8_0; resto BF16/F32; 2.50 bpw sobre el archivo completo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `gguf/pplx-decider-v1.3-rapido-IQ2XXS.gguf`, 8.019.326.048 bytes); codigos VQ en `antes_kd/` y `depois_kd/` |

## Arquitectura y entrenamiento

El modelo base es un transformer derivado de Qwen/Qwen3.8-27B, con 26 896 millones de parámetros, orientado a tareas de decisión (el autor lo describe como "decision model" y "conversational"). La torre de visión del modelo original se elimina en esta versión GGUF, por lo que el artefacto es exclusivamente de texto.

La innovación técnica de esta ficha no está en el entrenamiento sino en la compresión: las 400 capas lineales del modelo de texto y el embedding de tokens se sustituyen por códigos vectoriales de 2 bits (vector quantization). El autor documenta los scripts de codificación en `code/vq.py` y `code/kd.py`, y los códigos resultantes en `antes_kd/` y `depois_kd/`. El paso por columna `s_col` se aproxima mediante la media del bloque, y la readout se cuantiza a Q8_0; el autor señala esta aproximación como la causa probable (hipótesis no aislada) de las discrepancias observadas. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno, según la etiqueta "conversational" del modelo.
- Toma de decisiones y enrutamiento (routing, triage), que es la tarea para la que el modelo base fue diseñado.
- Selección de herramientas (tool calling implícito en el enrutamiento): el autor reporta que las métricas de Tools se mantienen entre 0,84 y 0,90, y ToolRet/BFCL en torno al 95-100 % de acuerdo.
- Razonamiento y conocimiento general: presentes pero degradados de forma notable por la cuantización (MMLU-Pro con 58 % de acuerdo, GPQA con 53 %).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no soportada (la torre de visión se excluye del GGUF).
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas en un sistema RAG: el modelo puede clasificar la intención de una pregunta y decidir qué recuperador o herramienta invocar, aprovechando que las métricas de Tools y ToolRet/BFCL se mantienen altas pese a la cuantización extrema. Es adecuado porque el coste de memoria es de unos 8,2-8,4 GB de RSS y el modelo cabe en CPU.
- Triage de tickets de soporte: asignación de categoría o cola a partir del texto de un ticket, con una latencia de 1 a 3 minutos por decisión en el hardware de referencia. Aceptable para procesamiento por lotes, no para atención en tiempo real.
- Clasificación por lotes en pipelines offline: dada la velocidad de prefill (~2,9 tokens/s en 4 hilos de CPU), el modelo encaja en trabajos nocturnos o de baja frecuencia donde la precisión de enrutamiento importa más que la latencia.
- Filtrado previo de consultas antes de un modelo mayor: usar el decider cuantizado como primera etapa para descartar o etiquetar consultas y reservar el modelo grande solo para los casos ambiguos, reduciendo coste computacional.
- Experimentación e investigación sobre cuantización extrema: el artefacto incluye los códigos VQ y los resultados de calidad frente a bf16 (`results/`), lo que lo convierte en un banco de pruebas reproducible para estudiar la degradación a 2 bits.
- Despliegue en entornos con restricciones de memoria: servidores sin GPU o con poca RAM pueden ejecutar el modelo vía llama.cpp con 8,2-8,4 GB de RSS pico, algo inviable con el modelo original de 27 000 millones de parámetros en bf16.

## Benchmarks y rendimiento

El autor publica métricas de acuerdo (agreement) frente a la reconstrucción en bf16 de los mismos códigos, no benchmarks absolutos del modelo base. Se reproducen a continuación tal como aparecen en la model card.

| Metrica | Resultado | Notas |
|---|---|---|
| Acuerdo top-1 (control CPU, n=200) | 195/200 = 97,5 % (IC 95 %: 94,3-98,9) | Objetivo fijado: >= 99,5 %; no superado |
| Acuerdo top-1 (control CPU, n=400) | 391/400 = 97,75 % (IC 95 %: 95,8-98,8) | KL media 0,0061 |
| Acuerdo top-1 global vs bf16 (n=17.509 decisiones, 1.778 grupos) | 94,61 % (IC 95 %: 93,85-95,22) | Objetivo fijado: 95 %; no superado |
| Acuerdo top-1 sin ACOS | 91,8 % | — |
| Macro media sobre 42 benchmarks | 84,4 % | — |
| Tools | 0,90 -> 0,84 | Triage y routing se mantienen |
| ToolRet / BFCL | ~95-100 % | — |
| MMLU-Pro | 58 % de acuerdo | n=43, ruidoso |
| GPQA | 53 % de acuerdo | n=43, ruidoso |

Rendimiento de prefill (una decisión, Kaggle Xeon 2,2 GHz, 4 vCPU, solo CPU):

| Hilos | ~170 tokens p50 | ~500 tokens p50 |
|---|---|---|
| 2 | 67,8 s | 193,3 s |
| 4 | 58,3 s | 175,0 s |
| 8 (4 vCPU) | 64,0 s | 184,9 s |

Throughput de prefill: ~2,9 tokens/s (llama-bench pp512, 4 hilos: 2,95 t/s). El autor indica que la velocidad en GPU y en portátil no se midió.

## Requisitos de hardware

- VRAM/RAM estimada: el autor reporta un RSS pico de aproximadamente 8,2-8,4 GB en CPU con el GGUF de 8,02 GB.
- GPU recomendadas: no disponibles en la información proporcionada; el autor no midió rendimiento en GPU.
- Cabe en GPU de consumo: previsiblemente sí por tamaño (8 GB), pero no hay medición publicada que lo confirme.
- Despliegue: llama.cpp en su commit `ad9d9e8f50e6ff9a6bfbbdd3aef6d74a8428cf4e`, con la conversión/endpoint `pplx_decider`. Comando de ejemplo del autor: `llama-server -m pplx-decider-v1.3-rapido-IQ2XXS.gguf -t 4 -c 4096 -b 4096 -ub 4096 -np 1 --no-cache-prompt --host 127.0.0.1 --port 8091`.
- Latencia: 1 a 3 minutos por decisión en el hardware de referencia (Xeon 2,2 GHz, 4 vCPU, AVX2/FMA/F16C/BMI2, AVX512 desactivado). El autor lo califica explícitamente como "no interactivo".
- Throughput: ~2,9 tokens/s de prefill en CPU con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1.3-rapido (esta ficha) | 26,9 B (original) | 4096 en el ejemplo | IQ2_XXS, 2,50 bpw | Apache-2.0 | GGUF en HF |
| perplexity-ai/pplx-decider-v1.3 (base) | 26,9 B | no disponible | bf16 (original) | Apache-2.0 | HF |
| Qwen/Qwen3.8-27B (ancestro) | ~27 B | no disponible | bf16 y otras | Apache-2.0 | HF |

No se dispone de datos de benchmarks absolutos ni de comparativas con otras cuantizaciones del mismo modelo en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El autor declara que el modelo no supera su propio control de calidad: 97,5 % de acuerdo top-1 en CPU frente al 99,5 % exigido, y 94,61 % global frente al 95 % exigido.
- Degradación severa en conocimiento y razonamiento: MMLU-Pro con 58 % de acuerdo y GPQA con 53 % (n=43, ruidoso). No es apto para tareas que requieran conocimiento factual fiable.
- Riesgo elevado de alucinación en consultas de conocimiento, derivado de la cuantización a 2 bits y de la pérdida de precisión en las capas lineales.
- La torre de visión se elimina: el modelo es solo de texto.
- Latencia no interactiva en CPU (1-3 minutos por decisión); no apto para aplicaciones en tiempo real sin GPU y sin medición de rendimiento en GPU.
- Causa probable de las discrepancias no aislada: aproximación del paso por columna `s_col` (media de bloque) y readout Q8_0.
- Artefacto no oficial: no está afiliado ni respaldado por Perplexity ni por Qwen; el autor lo etiqueta como "research artifact".
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda revisar `NOTICE` y `LICENSE` del repositorio.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Cero descargas y cero "likes" en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FardoX/pplx-decider-v1.3-rapido
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
- Modelo ancestro: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit de llama.cpp usado por el autor: `ad9d9e8f50e6ff9a6bfbbdd3aef6d74a8428cf4e` (repositorio oficial de llama.cpp en GitHub)
- Scripts de codificación VQ y KD: `code/vq.py` y `code/kd.py` dentro del repositorio del modelo
- Resultados de calidad frente a bf16: carpeta `results/` dentro del repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
