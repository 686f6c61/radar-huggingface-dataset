# locodoco/iflow-subtb-14b-64gpu-1332645-step200

## Resumen

I-Flow SubTB 14B es un checkpoint de investigación publicado por el usuario `locodoco` en Hugging Face, correspondiente al paso 200 de un entrenamiento de aprendizaje por refuerzo con el algoritmo I-Flow (una variante de GFlowNet con balance de sub-trayectoria, `tb_presubtb`). El modelo parte de `locodoco/qwen3-14b-base-ecb-sft`, un ajuste supervisado fino de Qwen3-14B-Base, y está especializado en razonamiento matemático mediante un bucle multi-turno en el que el propio modelo desempeña dos roles: uno de meta-pensamiento que emite etiquetas de acción (`exploration`, `continue`, `backtracking`, `verification`, `finalize`, `idle`) y otro de razonamiento que ejecuta el paso matemático correspondiente.

Con 14.768.307.200 parámetros totales y pesos exportados en float32 (59,1 GB en el repositorio), el modelo no es un asistente general: es un artefacto de investigación que solo ha sido validado dentro del controlador de dos roles con el que fue entrenado. Su interés radica en que documenta de forma transparente la curva de validación a lo largo de nueve checkpoints (pasos 25 a 225) sobre 3.251 problemas de ocho benchmarks matemáticos, alcanzando un 75,73 % de acierto agregado en el paso 200.

Es relevante ahora para investigadores que estudian RL sobre modelos de lenguaje, GFlowNets aplicados a razonamiento multi-paso y esquemas de auto-verificación y backtracking, más que para equipos que busquen un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM) |
| Parámetros totales | 14.768.307.200 |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-14B-Base; no especificada en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en float32; `config.json` declara bfloat16) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (13 shards en float32, 59,1 GB) + tokenizer y chat template |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Qwen3 con 14.768 millones de parámetros, inicializado desde un SFT previo (`qwen3-14b-base-ecb-sft`) que a su vez deriva de Qwen3-14B-Base. El entrenamiento de RL se realizó con el objetivo I-Flow pre-intent sub-trajectory balance (`gflownet_balance_mode=tb_presubtb`, brazo `TI`: alpha de SubTB 1,0, k 3, pesos de importancia sumados, fuente de flujo de política de referencia y término de rol de intención activado). No se empleó pérdida KL ni bonus de entropía.

Los datos de entrenamiento son 8.523 problemas de MATH de niveles 3 a 5. Cada paso procesa un lote de 128 problemas con 16 rollouts por problema (2.048 trayectorias) y mini-lote de 64; el optimizador del actor usa una tasa de aprendizaje de 1e-6 y el 10 % de los rollouts emplea acciones forzadas según el calendario de archivo. Un rollout consta de como máximo 30 turnos de hasta 512 tokens cada uno. El cómputo se ejecutó en 16 nodos con 4 NVIDIA GH200 cada uno (64 GPU en total), alcanzando el paso 200 unas 18 horas después del inicio. Se guardaron checkpoints cada 25 pasos (25 a 225) y se seleccionó el paso 200 por su mayor precisión de validación. La innovación técnica destacable es el bucle de dos roles con etiquetas de acción explícitas, que convierte el razonamiento matemático en una trayectoria discreta optimizable con GFlowNets.

## Capacidades

- Generación de texto y razonamiento matemático multi-paso mediante un bucle de dos roles (meta-pensamiento y razonamiento).
- Emisión de etiquetas de acción estructuradas: `<action>exploration</action>`, `continue`, `backtracking`, `verification`, `finalize`, `idle`.
- Auto-verificación y retroceso (backtracking) dentro de la trayectoria de resolución.
- Razonamiento de hasta 30 turnos por problema, con 512 tokens por turno.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes genérico: no disponible; el único comportamiento agéntico documentado es el controlador de dos roles del entrenamiento.
- Capacidades multilingües: limitadas a inglés según la model card.
- Modo thinking, visión o audio: no disponible.
- Integración con `transformers` como `Qwen3ForCausalLM` y compatibilidad declarada con Text Generation Inference y endpoints.

## Casos de uso

- Investigación en RL para LLM: reproducir o extender la curva de validación de los pasos 25 a 225 para estudiar la estabilidad de I-Flow SubTB en razonamiento matemático.
- Estudio de GFlowNets aplicados a lenguaje: analizar el efecto del balance de sub-trayectoria (`tb_presubtb`) con alpha 1,0 y k 3 frente a objetivos de política estándar.
- Análisis de estrategias de backtracking y verificación: inspeccionar las trayectorias de dos roles guardadas en `eval/val_step_200.jsonl` para caracterizar cuándo el modelo decide retroceder o finalizar.
- Evaluación comparativa de checkpoints intermedios: usar los nueve checkpoints publicados para estudiar sobreajuste y ruido de evaluación en benchmarks pequeños como AMC23 y AIME24/25.
- Generación de datos sintéticos de resolución matemática: producir trayectorias etiquetadas por acción para destilar o entrenar modelos de verificación, siempre dentro del controlador original.
- Reproducción de experimentos a escala: servir el modelo con TGI o `transformers` en clústeres con GH200/H100 para replicar las condiciones de validación con decodificación greedy (temperatura 0, una generación por problema).

## Benchmarks y rendimiento

Validación con decodificación greedy (temperatura 0, una generación por problema) sobre 3.251 problemas de ocho benchmarks matemáticos. Un problema puntúa 1 si la respuesta final coincide con la referencia.

| Paso | Todos (3251) | GSM8K (1319) | MATH500 (500) | Minerva Math (272) | OlympiadBench (675) | Gaokao2023en (385) | AMC23 (40) | AIME24 (30) | AIME25 (30) |
|---|---|---|---|---|---|---|---|---|---|
| 25 | 0,7244 | 0,946 | 0,820 | 0,298 | 0,474 | 0,673 | 0,650 | 0,200 | 0,167 |
| 50 | 0,7345 | 0,948 | 0,832 | 0,346 | 0,489 | 0,688 | 0,575 | 0,233 | 0,100 |
| 75 | 0,7407 | 0,955 | 0,822 | 0,371 | 0,490 | 0,704 | 0,650 | 0,233 | 0,067 |
| 100 | 0,7416 | 0,954 | 0,844 | 0,382 | 0,477 | 0,706 | 0,550 | 0,167 | 0,200 |
| 125 | 0,7496 | 0,951 | 0,838 | 0,371 | 0,516 | 0,714 | 0,700 | 0,233 | 0,133 |
| 150 | 0,7502 | 0,952 | 0,836 | 0,382 | 0,521 | 0,704 | 0,625 | 0,267 | 0,167 |
| 175 | 0,7521 | 0,957 | 0,852 | 0,371 | 0,516 | 0,696 | 0,650 | 0,267 | 0,200 |
| **200** | **0,7573** | **0,955** | **0,858** | **0,408** | **0,514** | **0,719** | **0,625** | **0,267** | **0,200** |
| 225 | 0,7555 | 0,952 | 0,842 | 0,415 | 0,533 | 0,709 | 0,625 | 0,133 | 0,133 |

Advertencias del autor: el paso 200 se eligió sobre el mismo conjunto de validación, por lo que sus cifras son ligeramente optimistas; supera al paso 225 en 0,2 puntos (unos 6 problemas); AMC y AIME tienen entre 30 y 40 problemas, por lo que sus filas son ruidosas. No hay conjunto de test separado.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 30 GB para los pesos (el `config.json` declara bfloat16 y `torch_dtype="auto"` carga en bf16), más overhead de activaciones y caché KV.
- VRAM estimada en float32: unos 59 GB solo para pesos, inviable en GPU de consumo.
- GPU recomendadas: NVIDIA GH200 (configuración original de entrenamiento), H100 80 GB o A100 80 GB para inferencia en bf16 sin cuantización.
- GPU de consumo: una RTX 4090 de 24 GB no puede cargar los pesos en bf16 sin cuantización; no se han publicado pesos GGUF ni cuantizados en el repositorio.
- Opciones de despliegue: `transformers` (carga directa como `Qwen3ForCausalLM`), Text Generation Inference (declarado en los tags) y endpoints compatibles. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles. Como referencia de coste, el autor reporta que alcanzar el paso 200 requirió unas 18 horas en 64 GH200, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| I-Flow SubTB 14B (este) | 14,77 B | no disponible | Razonamiento matemático multi-rol vía GFlowNet | Apache-2.0 | Hugging Face, pesos float32 |
| Qwen3-14B-Base | 14 B (familia) | no disponible en esta ficha | Modelo base generalista | Apache-2.0 | Hugging Face |
| locodoco/qwen3-14b-base-ecb-sft | 14 B (familia) | no disponible en esta ficha | SFT previo al RL, base de este checkpoint | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Evaluado únicamente sobre el conjunto de validación matemático descrito; no existe conjunto de test independiente.
- El paso 200 se seleccionó sobre el mismo conjunto de validación, por lo que las cifras están sesgadas al alza.
- No probado fuera del controlador de dos roles con el que fue entrenado; el prompting de chat de un solo turno no ha sido testeado.
- No se incluyen los dos system prompts ni el controlador multi-turno que alterna los roles (código de investigación I-Flow/ReMA), lo que impide reproducir el comportamiento evaluado solo con los pesos.
- No se incluye el estado de reanudación del entrenamiento (optimizador, cabeza de flujo, replay buffer).
- Idiomas: solo inglés declarado.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo con problemas MATH de niveles 3 a 5, el dominio queda restringido a matemáticas de ese rango.
- Riesgo de alucinación: no cuantificado; la evaluación se limita a coincidencia de respuesta final.
- Restricciones de licencia: los pesos son Apache-2.0 (licencia de Qwen3-14B-Base), pero los problemas de entrenamiento provienen de MATH y las conversaciones de SFT de problemas LIMO, que tienen sus propios términos.
- Los pesos se publican en float32 sin fusionar ni convertir; el repositorio ocupa 59,1 GB.
- Benchmarks con muy pocos problemas (AMC23, AIME24, AIME25) producen resultados ruidosos y no fiables para comparaciones finas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/locodoco/iflow-subtb-14b-64gpu-1332645-step200
- Modelo base del SFT: https://huggingface.co/locodoco/qwen3-14b-base-ecb-sft
- Modelo original Qwen3-14B-Base: https://huggingface.co/Qwen/Qwen3-14B-Base
