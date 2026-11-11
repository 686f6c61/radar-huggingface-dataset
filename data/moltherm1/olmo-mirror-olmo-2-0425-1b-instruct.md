# moltherm1/olmo-mirror-olmo-2-0425-1b-instruct

## Resumen
OLMo 2 1B Instruct (April 2025) es la variante post-entrenada para conversación del modelo allenai/OLMo-2-0425-1B-RLVR1, desarrollado por el Allen Institute for AI (Ai2) dentro de la familia OLMo 2. El modelo que nos ocupa es un espejo publicado por el usuario moltherm1 en Hugging Face, con pesos idénticos a los del modelo oficial de Ai2, y resuelve el problema de disponer de un modelo de lenguaje pequeño (1.485 millones de parámetros) totalmente abierto, con código, checkpoints, logs y datos de entrenamiento publicados, lo que permite reproducir y auditar el pipeline completo.

Con 1.484.916.736 parámetros reales en safetensors y un tamaño de repositorio de 3,0 GB, se posiciona en la gama de modelos de ~1B pensados para investigación, experimentación y despliegue en hardware modesto. Su relevancia actual radica en que combina una licencia Apache 2.0 sin restricciones con un proceso de alineamiento en tres fases (SFT sobre una variante de Tülu 3, DPO y RLVR sobre matemáticas), lo que lo convierte en una referencia para estudiar post-entrenamiento abierto en modelos pequeños.

La ficha se basa en la model card oficial de OLMo 2 1B Instruct y en los metadatos del espejo. Los datos de arquitectura interna, composición exacta del dataset de preentrenamiento y detalles de configuración no están disponibles en la información proporcionada y se indican como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2); detalles internos no disponibles |
| Parámetros totales | 1.484.916.736 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; se puede cuantizar con herramientas estándar) |
| Idiomas soportados | inglés (principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
OLMo 2 es una serie de modelos de lenguaje abiertos basados en transformer decoder-only, entrenados sobre el dataset Dolma. El modelo parte de allenai/OLMo-2-0425-1B-RLVR1 y se post-entrena en tres etapas: primero un ajuste supervisado (SFT) sobre una variante específica de OLMo del dataset Tülu 3 (allenai/tulu-3-sft-olmo-2-mixture-0225), después un entrenamiento DPO sobre allenai/olmo-2-0425-1b-preference-mix y, finalmente, un entrenamiento RLVR (Reinforcement Learning with Verifiable Rewards) sobre allenai/RLVR-MATH, orientado a mejorar el razonamiento matemático verificable.

El modelo utiliza una plantilla de chat específica con los tokens `<|user|>`, `<|assistant|>` y `<|endoftext|>`, sin token BOS al inicio, integrada en el tokenizer para `apply_chat_template`. Ai2 publica los checkpoints intermedios del entrenamiento RLVR cada 20 pasos, accesibles mediante revisiones del repositorio (por ejemplo, `revision="step_200"`), lo que facilita la investigación sobre el proceso de RL. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni innovaciones arquitectónicas específicas más allá de lo indicado.

## Capacidades
- Generación de texto y conversación multi-turno en inglés.
- Razonamiento matemático, reforzado mediante RLVR sobre el dataset RLVR-MATH.
- Resolución de problemas de matemáticas de nivel escolar y competición (GSM8K, MATH) según los benchmarks publicados.
- Seguimiento de instrucciones (IFEval) y tareas de razonamiento general (BBH, DROP, MMLU).
- Soporte de plantilla de chat integrada en el tokenizer para conversación estructurada.
- Capacidad de ajuste fino adicional mediante el repositorio open-instruct de Ai2.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso
- Investigación sobre post-entrenamiento: el modelo permite reproducir y estudiar las fases de SFT, DPO y RLVR gracias a la publicación de checkpoints intermedios cada 20 pasos y de los datasets utilizados.
- Experimentación académica con modelos pequeños: su tamaño de ~1,5B parámetros y licencia Apache 2.0 lo hacen adecuado para laboratorios con recursos limitados que necesiten ejecutar experimentos de alineamiento.
- Evaluación de técnicas de RL con recompensas verificables: el checkpoint RLVR1 y los intermedios permiten analizar cómo evoluciona el rendimiento en matemáticas durante el entrenamiento.
- Generación de texto y asistentes conversacionales en inglés: la plantilla de chat integrada y el ajuste con Tülu 3 permiten desplegarlo como chatbot básico en entornos de investigación.
- Fine-tuning específico de dominio: al estar disponible el código de open-instruct y los pesos completos, se puede adaptar a tareas concretas con datasets propios.
- Docencia y formación: su carácter totalmente abierto (código, logs, datos) lo convierte en material didáctico para explicar el ciclo completo de entrenamiento de un LLM.
- Comparación de metodologías de alineamiento: sirve como referencia para contrastar SFT, DPO y RLVR en un mismo modelo base.

## Benchmarks y rendimiento
Resultados publicados en la model card oficial de OLMo 2 1B Instruct:

| Modelo | Average | AlpacaEval 2 LC | BBH | DROP | GSM8K | IFEval | MATH | MMLU | Safety | PopQA | TruthQA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| OLMo 1B 0724 | 24,4 | 2,4 | 29,9 | 27,9 | 10,8 | 25,3 | 2,2 | 36,6 | 52,0 | 12,1 | 44,3 |
| SmolLM2 1.7B | 34,2 | 5,8 | 39,8 | 30,9 | 45,3 | 51,6 | 20,3 | 34,3 | 52,4 | 16,4 | 45,3 |
| Gemma 3 1B | 38,3 | 20,4 | 39,4 | 25,1 | 35,0 | 60,6 | 40,3 | 38,9 | 70,2 | 9,6 | 43,8 |
| Llama 3.1 1B | 39,3 | 10,1 | 40,2 | 32,2 | 45,4 | 54,0 | 21,6 | 46,7 | 87,2 | 13,8 | 41,5 |
| Qwen 2.5 1.5B | 41,7 | 7,4 | 45,8 | 13,4 | 66,2 | 44,2 | 40,6 | 59,7 | 77,6 | 15,5 | 46,5 |
| OLMo 2 1B SFT | 36,9 | 2,4 | 32,8 | 33,8 | 52,1 | 50,5 | 13,2 | 36,4 | 93,2 | 12,7 | 42,1 |
| OLMo 2 1B DPO | 40,6 | 9,5 | 33,0 | 34,5 | 59,0 | 67,1 | 14,1 | 39,9 | 89,9 | 12,3 | 46,4 |
| OLMo 2 1B | 42,7 | 9,1 | 35,0 | 34,6 | 68,3 | 70,1 | 20,7 | 40,0 | 87,6 | 12,9 | 48,7 |

## Requisitos de hardware
- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: ~1,5-2 GB; en 4 bits: ~1 GB, más overhead.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutarlo en fp16; en cuantización cabe en GPUs con 4-6 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas, especialmente con cuantización.
- Opciones de despliegue: transformers >= 4.48 (soporte oficial); vLLM (instalación desde main hasta la versión 0.7.4 según la model card); llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Average (benchmark) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo 2 1B Instruct | 1,48B | no disponible | 42,7 | Apache 2.0 | Hugging Face (Ai2 y espejos) |
| Llama 3.1 1B | ~1,2B (no confirmado) | no disponible | 39,3 | Llama 3.1 Community License | Hugging Face |
| Qwen 2.5 1.5B | ~1,5B (no confirmado) | no disponible | 41,7 | Apache 2.0 | Hugging Face |
| Gemma 3 1B | ~1B (no confirmado) | no disponible | 38,3 | Gemma Terms of Use | Hugging Face |
| SmolLM2 1.7B | ~1,7B (no confirmado) | no disponible | 34,2 | Apache 2.0 | Hugging Face |

OLMo 2 1B Instruct obtiene el mejor promedio (42,7) de la comparativa, con ventaja clara en GSM8K (68,3) e IFEval (70,1), aunque queda por detrás de Qwen 2.5 1.5B en MMLU (40,0 frente a 59,7) y en AlpacaEval 2 LC frente a Gemma 3 1B (9,1 frente a 20,4). Su principal diferenciador es la apertura total del pipeline de entrenamiento y la licencia Apache 2.0.

## Limitaciones y advertencias
- Entrenamiento de seguridad limitado: el modelo no incorpora filtrado en línea de respuestas como ChatGPT y puede generar contenido problemático, especialmente si se le induce a ello.
- Riesgo de alucinación inherente a modelos de ~1B parámetros; no es adecuado para tareas que requieran alta fiabilidad factual sin verificación.
- Soporte principal de inglés; el rendimiento en castellano y otros idiomas no está garantizado ni documentado.
- Longitud de contexto no disponible en la información proporcionada, lo que impide planificar despliegues con ventanas largas.
- Orientado a investigación y uso educativo según las guías de uso responsable de Ai2; aunque la licencia Apache 2.0 permite uso comercial, el autor declara esa intención de uso.
- El espejo moltherm1 no es el repositorio oficial; conviene verificar la integridad de los pesos frente al repositorio de allenai.
- No se ha documentado soporte de tool calling, agentes ni multimodalidad, por lo que no debe asumirse en producción.

## Enlaces
- Repositorio del espejo: https://huggingface.co/moltherm1/olmo-mirror-olmo-2-0425-1b-instruct
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-RLVR1
- Modelo oficial: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Página del proyecto OLMo: https://allenai.org/olmo
- Repositorio principal (entrenamiento, inferencia, fine-tuning): https://github.com/allenai/OLMo-core
- Código de evaluación: https://github.com/allenai/olmes
- Código de fine-tuning: https://github.com/allenai/open-instruct
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Demo: https://playground.allenai.org/
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
- Dataset RLVR: https://huggingface.co/datasets/allenai/RLVR-MATH
- Guías de uso responsable: https://allenai.org/responsible-use
