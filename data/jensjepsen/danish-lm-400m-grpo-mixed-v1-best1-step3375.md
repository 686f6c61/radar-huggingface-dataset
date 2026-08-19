# jensjepsen/danish-lm-400m-grpo-mixed-v1-best1-step3375

## Resumen

El modelo `jensjepsen/danish-lm-400m-grpo-mixed-v1-best1-step3375` es un modelo de lenguaje autoregresivo de 400 millones de parámetros, especializado en danés, desarrollado por Jens Jepsen. Se trata de un checkpoint intermedio de un entrenamiento con GRPO (Group Relative Policy Optimization) que combina dos objetivos: razonamiento matemático (GSM8K) y seguimiento de instrucciones (IFEval en danés). El modelo parte de un fine-tuning SFT previo (`danish-lm-400m-sft-v31-avg-top3`) y aplica un esquema de recompensa por ejemplo, donde cada fila del dataset recibe una señal específica según su tipo.

La relevancia de este modelo radica en su tamaño compacto (414,7 M de parámetros) y su enfoque en un idioma de bajo recurso como el danés, demostrando que es posible mejorar capacidades de razonamiento y seguimiento de instrucciones con técnicas de RL en modelos pequeños. Está pensado para investigación y aplicaciones que requieran generación de texto en danés con control de formato y razonamiento básico. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama) |
| Parametros totales | 414.707.712 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base original tiene extensión RoPE a 2048, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, se puede cuantizar a GGUF, AWQ, etc.) |
| Idiomas soportados | danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar, similar a Llama, con 400 millones de parámetros. No se especifican detalles sobre el número de capas, cabezas de atención o dimensiones ocultas, pero al ser un modelo de ese tamaño, probablemente tenga alrededor de 12-16 capas y una dimensión de embedding de 1024. El entrenamiento se realizó en dos fases: primero un SFT sobre una mezcla de fuentes en danés (modelo base `danish-lm-400m-sft-v31-avg-top3`), y posteriormente un refinamiento con GRPO.

El entrenamiento GRPO utilizó un esquema de recompensa por ejemplo: para las filas de GSM8K se aplicó `reward_gsm8k` (verificación de respuesta correcta) y para las filas de IFEval se aplicó `reward_ifeval_combined`, que combina 46 restricciones propias con el esquema de verificación de Google IFEval. Los datos de entrenamiento consisten en una mezcla 50/50 de `danish-if-grpo-combined-v1` (10k ejemplos) y `danish-gsm8k` (~7,5k ejemplos). El entrenamiento se reanudó desde un checkpoint intermedio (`step2400`) y el modelo actual corresponde al paso 3375 de la ejecución mixta. Se guardaron solo los pesos del modelo y tokenizador, sin optimizador.

## Capacidades

- Generación de texto en danés con formato de chat de un solo turno (`<|user|>{q}<|end|><|assistant|>`).
- Razonamiento matemático básico: mejora significativa en GSM8K (24,37% pass@1) frente al modelo base SFT (17,39%).
- Seguimiento de instrucciones con restricciones de formato: mejora en IFEval-DA (prompt-strict 29,9%, inst-strict 45,0%).
- Capacidad de respuesta a preguntas de conocimiento general (SciQ open-Q 14,10%).
- Soporte de tareas de comprensión lectora y opción múltiple (CITMC 49,58%, SciQ-MC 59,6%).
- No se menciona soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Atención al cliente automatizada en danés: el modelo puede gestionar conversaciones de un solo turno con instrucciones claras, respondiendo preguntas frecuentes o generando respuestas con formato específico (por ejemplo, listas o tablas) gracias a su entrenamiento en IFEval.
- Asistente de razonamiento matemático para estudiantes: puede resolver problemas aritméticos y de lógica básica en danés, útil en plataformas educativas o chatbots de tutoría.
- Generación de contenido estructurado: el modelo aprende a seguir restricciones de formato (mayúsculas, listas, respuestas con argumento), lo que lo hace adecuado para generar resúmenes, reescrituras o textos con plantillas definidas.
- Evaluación de modelos daneses: al ser un checkpoint de investigación, puede usarse como referencia para comparar técnicas de RL en modelos pequeños o para estudiar el impacto de GRPO en idiomas de bajo recurso.
- Prototipado rápido de aplicaciones de NLP en danés: su tamaño reducido permite desplegarlo en entornos con recursos limitados, como CPUs o GPUs de gama baja, para pruebas de concepto.
- Investigación en alineación de modelos: el esquema de recompensa mixta (GSM8K + IFEval) puede servir como caso de estudio para diseñar funciones de recompensa multiobjetivo en otros idiomas.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación offline en fp16. Se comparan con el modelo base SFT (`danish-lm-400m-sft-v31-avg-top3`).

| Evaluación | Base SFT | step 3375 | Δ |
|---|---|---|---|
| IFEval-DA prompt-strict (n=539) | 21,2 | 29,9 | +8,7 |
| IFEval-DA prompt-loose | 22,0 | 30,6 | +8,6 |
| IFEval-DA inst-strict | 35,2 | 45,0 | +9,8 |
| IFEval-DA inst-loose | 35,8 | 45,6 | +9,8 |
| GSM8K 0-shot pass@1 (n=1317) | 17,39 | 24,37 | +6,98 |
| SciQ open-Q pass@1 (n=1000) | 13,50 | 14,10 | +0,60 |
| CIT-gen (n=720) | 29,86 | 28,6 | -1,26 |
| textman_summary chrF++ | 41,11 | 40,67 | -0,44 |
| textman_rewrite chrF++ | 46,51 | 47,24 | +0,73 |
| CITMC (n=720) | 48,19 | 49,58 | +1,39 |
| SciQ-MC (n=1000) | — | 59,6 | — |
| PIQA (n=100) | 53 (n=50) | 59,0 | +6 |
| ARC-Easy chat-MC | 44,40 | 42,68 | -1,72 |
| ARC-Challenge chat-MC | 29,35 | 29,01 | -0,34 |
| ARC-Easy logprob (n=2376) | 40,61 | 40,45 | -0,16 |
| ARC-Challenge logprob (n=1172) | 27,47 | 27,30 | -0,17 |

Se observa una mejora clara en razonamiento matemático y seguimiento de instrucciones, con ligeras regresiones en tareas de generación libre (CIT-gen) y comprensión lectora (ARC). No se han publicado comparaciones con otros modelos daneses de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, el modelo ocupa ~830 MB de pesos (414,7 M × 2 bytes), más overhead de activaciones y KV cache. Con una ventana de contexto de 2048 tokens, se estima un consumo total de ~1,5-2 GB en GPU.
- En cuantización de 4 bits (GPTQ/AWQ), el modelo ocuparía ~210 MB, permitiendo ejecutarlo en GPUs con 2 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.) para fp16; para cuantización 4-bit, incluso CPUs con suficiente RAM pueden ser viables.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, o incluso en Apple Silicon con Metal.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con `from_pretrained`, TGI (si se convierte a formato adecuado).
- Latencia: en una GPU moderna (RTX 4090), la generación de 100 tokens debería tomar menos de 1 segundo; en CPU, puede ser de 2-5 segundos por token dependiendo de la optimización.

## Comparativa con modelos similares

No se dispone de información sobre modelos daneses de 400M comparables en el mercado. Los modelos daneses más conocidos (por ejemplo, `vesteinn/DanskBERT` o `NbAiLab/nb-bert-base`) son de tipo encoder y no generativos. No hay una comparativa directa disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en danés; no soporta otros idiomas.
- Tamaño reducido: su capacidad de razonamiento complejo es limitada; puede fallar en problemas matemáticos de varios pasos o en instrucciones muy específicas.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en tareas de conocimiento abierto.
- El contexto máximo no está confirmado; si se hereda del modelo base, es de 2048 tokens, pero no se garantiza.
- El entrenamiento con GRPO puede haber introducido sesgos hacia los formatos de recompensa (por ejemplo, preferir respuestas con listas o mayúsculas), lo que podría afectar la naturalidad del texto.
- No se proporcionan datos sobre sesgos demográficos o lingüísticos específicos del danés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un checkpoint de investigación y puede no estar optimizado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed-v1-best1-step3375
- Modelo base SFT: https://huggingface.co/jensjepsen/danish-lm-400m-sft-v31-avg-top3
- Checkpoint intermedio GRPO: https://huggingface.co/jensjepsen/danish-lm-400m-grpo-if-combined-v1-step2400
- Dataset de entrenamiento IFEval+GRPO: https://huggingface.co/datasets/jensjepsen/danish-if-grpo-combined-v1
- Dataset GSM8K danés: https://huggingface.co/datasets/jensjepsen/danish-gsm8k
- Repositorio de scripts (GitHub): https://github.com/jensjepsen/small-esperanto-llm
- Modelo base con extensión RoPE (referencia de contexto): https://huggingface.co/jensjepsen/danish-lm-400m-base-ropext2048-v1
