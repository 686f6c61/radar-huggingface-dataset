# allenai/OLMo-2-0325-32B-Instruct

## Resumen

OLMo-2-0325-32B-Instruct es la variante post-entrenada para instrucciones del modelo OLMo 2 de 32B de marzo de 2025, desarrollado por el Allen Institute for AI (Ai2). Forma parte de la familia OLMo (Open Language Models), una iniciativa que libera no solo los pesos, sino tambien el codigo de entrenamiento, los checkpoints intermedios, los logs y los detalles del dataset, con el objetivo de habilitar la investigacion abierta sobre modelos de lenguaje.

El modelo parte de la base OLMo-2-0325-32B-DPO y se somete a un pipeline de post-entrenamiento en tres fases: supervised fine-tuning sobre una variante propia del dataset Tulu 3, entrenamiento DPO sobre un mix de preferencias y, finalmente, RLVR (Reinforcement Learning with Verifiable Rewards) sobre un dataset mixto de GSM, MATH e instrucciones con restricciones. Con 32.234.279.936 parametros, es un transformer denso (no MoE) pensado para tareas de chat, razonamiento matematico, generacion de codigo e instrucciones verificables.

Su relevancia actual radica en que es uno de los pocos modelos de esta escala completamente abiertos (pesos, datos, codigo y recetas de entrenamiento) bajo licencia Apache 2.0, lo que lo convierte en una pieza clave para reproducibilidad y para investigadores que necesitan auditar el proceso completo de entrenamiento, no solo el resultado final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (OLMo 2) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones de la comunidad no listadas) |
| Idiomas soportados | en (principalmente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

OLMo-2-0325-32B-Instruct es un transformer denso de 32.234.279.936 parametros. El modelo base OLMo-2-0325-32B fue entrenado sobre el dataset Dolma, una mezcla de datos publicos, sinteticos y creados por humanos, y posteriormente post-entrenado en tres etapas: SFT sobre una variante especifica de Tulu 3 (allenai/tulu-3-sft-olmo-2-mixture), DPO sobre allenai/olmo-2-0325-32b-preference-mix y RLVR final sobre allenai/RLVR-GSM-MATH-IF-Mixed-Constraints. Tulu 3 esta disenado para obtener rendimiento de estado del arte no solo en chat, sino tambien en tareas como MATH, GSM8K e IFEval.

Una innovacion destacable es la liberacion de checkpoints intermedios durante el entrenamiento RLVR: los pesos se guardan cada 20 pasos de entrenamiento y son accesibles como revisiones del repositorio de Hugging Face (por ejemplo, `revision="step_200"`), lo que facilita la investigacion sobre el proceso de RL. Ademas, el chat template ha cambiado respecto a versiones anteriores de OLMo 2 y Tulu 3: no incluye el token BOS al inicio, y usa el formato `<|user|>\n...\n<|assistant|>\n...<|endoftext|>`, embebido en el tokenizer para `apply_chat_template`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento matematico: entrenamiento explicito con RLVR sobre GSM y MATH.
- Seguimiento de instrucciones verificables (IFEval), reforzado en la fase RLVR.
- Generacion de codigo y resolucion de problemas de razonamiento (BBH, DROP en la evaluacion).
- Respuesta a preguntas factuales (PopQA, TruthfulQA en la evaluacion).
- Uso de system prompt (el modelo no fue entrenado con uno especifico; Ai2 usa por defecto "You are OLMo 2, a helpful and harmless AI Assistant built by the Allen Institute for AI.").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre post-entrenamiento: el modelo permite reproducir y auditar las fases SFT, DPO y RLVR gracias a la liberacion de datasets, codigo y checkpoints intermedios cada 20 pasos.
- Tutoria matematica automatizada: su entrenamiento RLVR sobre GSM y MATH lo hace adecuado para resolver y explicar problemas aritmeticos paso a paso en entornos educativos en ingles.
- Evaluacion de seguimiento de instrucciones: util como referencia abierta para comparar con modelos cerrados en benchmarks tipo IFEval dentro de pipelines de evaluacion (olmes).
- Generacion de codigo asistida en ingles: puede integrarse en asistentes de programacion para explicar fragmentos, generar funciones y razonar sobre logica, aunque sin garantias de tool calling nativo.
- Fine-tuning especifico de dominio: al ser Apache 2.0 y con recetas de open-instruct disponibles, sirve como base para adaptar a dominios concretos (legal, medico, soporte) mediante SFT adicional.
- Baseline en investigacion de alineacion: sus checkpoints intermedios de RLVR permiten estudiar la evolucion del comportamiento durante el entrenamiento con recompensas verificables.
- Despliegue en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede usarse comercialmente sin las restricciones de licencias tipo Llama.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion propia de Ai2):

| Modelo | Average | AlpacaEval 2 LC | BBH | DROP | GSM8k | IFEval | MATH | MMLU | Safety | PopQA | TruthQA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| GPT-3.5 Turbo 0125 | 59.6 | 38.7 | 66.6 | 70.2 | 74.3 | 66.9 | 41.2 | 70.2 | 69.1 | 45.0 | 62.9 |
| GPT-4o Mini 2024-07-18 | 65.7 | 49.7 | 65.9 | 36.3 | 83.0 | 83.5 | 67.9 | 82.2 | 84.9 | 39.0 | 64.8 |
| Mistral-Nemo-Instruct-2407 | 50.9 | 45.8 | 54.6 | 23.6 | 81.4 | 64.5 | 31.9 | 70.0 | 52.7 | 26.9 | 57.7 |
| Ministral-8B-Instruct | 52.1 | 31.4 | 56.2 | 56.2 | 80.0 | 56.4 | 40.0 | 68.5 | 56.2 | 20.2 | 55.5 |
| Gemma-2-27b-it | 61.3 | 49.0 | 72.7 | 67.5 | 80.7 | 63.2 | 35.1 | 70.7 | 75.9 | 33.9 | 64.6 |
| Qwen2.5-32B | 66.5 | 39.1 | 82.3 | 48.3 | 87.5 | 82.4 | 77.9 | 84.7 | 82.4 | 26.1 | 70.6 |
| Mistral-Small-24B | 67.6 | 43.2 | 80.1 | 78.5 | 87.2 | 77.3 | 65.9 | 83.7 | 66.5 | 24.4 | 68.1 |
| Llama-3.1-70B | 70.0 | 32.9 | 83.0 | 77.0 | 94.5 | 88.0 | 56.2 | 85.2 | 76.4 | 46.5 | 66.8 |
| Llama-3.3-70B | 73.0 | 36.5 | 85.8 | 78.0 | 93.6 | 90.8 | 71.8 | 85.9 | 70.4 | 48.2 | 66.1 |
| Gemma-3-27b-it | - | 63.4 | 83.7 | 69.2 | 91.1 | - | - | 81.8 | - | 30.9 | - |
| OLMo-2-7B-1124-Instruct | 55.7 | 31.0 | 48.5 | 58.9 | 85.2 | 75.6 | 31.3 | 63.9 | 81.2 | 24.6 | 56.3 |
| OLMo-2-13B-1124-Instruct | 61.4 | 37.5 | 58.4 | 72.1 | 87.4 | 80.4 | 39.7 | 68.6 | 77.5 | 28.8 | 63.9 |
| OLMo-2-32B-0325-SFT | 61.7 | 16.9 | 69.7 | 77.2 | 78.4 | 72.4 | 35.9 | 76.1 | 93.8 | 35.4 | 61.3 |
| OLMo-2-32B-0325-DPO | 68.8 | 44.1 | 70.2 | 77.5 | 85.7 | 83.8 | 46.8 | 78.0 | 9... | ... | ... |

Nota: los datos de la fila OLMo-2-32B-0325-DPO aparecen truncados en la informacion proporcionada; no se dispone de la fila completa del modelo Instruct final en el material recibido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa para un modelo denso de ~32B parametros, en precision BF16 se necesitan aproximadamente 64 GB de VRAM solo para pesos, sin contar KV cache ni overhead; en cuantizacion de 8 bits ~32 GB y en 4 bits ~16-20 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, un modelo de 32B en BF16 requiere GPUs de clase A100 80GB, H100 80GB o configuraciones multi-GPU.
- Consumer GPU: no confirmado por el autor; probablemente viable en RTX 4090 (24 GB) solo con cuantizacion agresiva (4 bits) y contexto reducido, pero no hay datos oficiales.
- Opciones de despliegue: transformers (requiere instalar desde la rama main de GitHub: `pip install --upgrade git+https://github.com/huggingface/transformers.git`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Average (Ai2) | Licencia | Apertura |
|---|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct | 32.234.279.936 | no disponible | no disponible (fila truncada) | Apache 2.0 | Total (pesos, datos, codigo, checkpoints) |
| Qwen2.5-32B | ~32B | no disponible | 66.5 | no disponible en la fuente | Pesos abiertos |
| Mistral-Small-24B | ~24B | no disponible | 67.6 | no disponible en la fuente | Pesos abiertos |
| Gemma-2-27b-it | ~27B | no disponible | 61.3 | no disponible en la fuente | Pesos abiertos |
| Llama-3.3-70B | ~70B | no disponible | 73.0 | no disponible en la fuente | Pesos abiertos |

La principal diferencia de OLMo 2 frente a estas alternativas no es el rendimiento bruto (Qwen2.5-32B y Mistral-Small-24B obtienen medias superiores en la tabla de Ai2), sino su grado de apertura: datasets, codigo de entrenamiento, logs y checkpoints intermedios, ademas de licencia Apache 2.0 sin restricciones adicionales.

## Limitaciones y advertencias

- Entrenamiento de seguridad limitado: el autor advierte que los modelos OLMo 2 no se despliegan con filtrado en el bucle como ChatGPT y pueden producir salidas problematicas, especialmente si se les induce.
- Idioma: principalmente ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada, pero inherente a modelos de esta escala sin mecanismos de verificacion en inferencia.
- Sesgos: no se detallan sesgos especificos en la model card; el dataset Dolma mezcla fuentes web, sinteticas y humanas, con los sesgos asociados.
- Licencia Apache 2.0: permisiva para uso comercial, sin las clausulas de restriccion de otras licencias de modelos abiertos.
- Chat template distinto al de versiones previas: no incluye token BOS al inicio; integrarlo mal puede degradar la calidad de las respuestas.
- Requiere transformers desde la rama main en el momento de la publicacion; verificar compatibilidad con versiones estables posteriores.
- No se documentan capacidades de tool calling, agentes ni vision; no asumirlas en produccion.
- El modelo no fue entrenado con un system prompt especifico; el comportamiento puede variar segun el prompt de sistema usado.

## Enlaces

- Hugging Face: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Modelo base (DPO): https://huggingface.co/allenai/OLMo-2-0325-32B-DPO
- Modelo base (SFT): https://huggingface.co/allenai/OLMo-2-0325-32B/
- Dataset SFT (Tulu 3 OLMo 2 mixture): https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- Dataset DPO (preference mix): https://huggingface.co/datasets/allenai/olmo-2-0325-32b-preference-mix
- Dataset RLVR: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Paper Tulu 3: https://arxiv.org/abs/2411.15124
- Pagina del proyecto: https://allenai.org/olmo
- Repo principal (entrenamiento, inferencia, fine-tuning): https://github.com/allenai/OLMo-core
- Codigo de evaluacion: https://github.com/allenai/olmes
- Codigo de fine-tuning: https://github.com/allenai/open-instruct
- Demo: https://playground.allenai.org/
