# eminsy/ChatISL-7B

## Resumen

ChatISL-7B es un adaptador LoRA publicado por el usuario eminsy (OpenISL) sobre el modelo base Jais-3-7B, desarrollado por el Institute of Foundation Models (IFM) de MBZUAI en colaboración con Inception42 (G42) y Cerebras. El modelo se presenta como un sistema de razonamiento bilingüe árabe-inglés que "piensa antes de responder", heredando la arquitectura y las capacidades del base y añadiendo una identidad propia mediante fine-tuning. Su relevancia radica en que, en la evaluación ArabicMMLU en modo chat reportada por el autor, alcanza 82,8 puntos de precisión, superando a competidores abiertos de 7 a 9 mil millones de parámetros como Qwen3-8B, ALLaM-7B, Fanar-1-9B, SILMA-9B y AceGPT-v2-8B.

El repositorio contiene únicamente el adaptador (0,1 GB) junto con el tokenizer y la plantilla de chat de ChatISL; el modelo completo debe construirse fusionando el adaptador con el base mediante el script `merge.py` incluido. La arquitectura es la del base, denominada K2-Horizon, que requiere `trust_remote_code=True`. El modelo declara 9,0 mil millones de parámetros en bf16 y soporta árabe e inglés.

La versión actual es v0.2, fechada en octubre de 2026, en la que se eliminó el system prompt por defecto de la plantilla de chat para que la identidad resida en los pesos. El modelo no aprende de conversaciones y su licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | K2-Horizon (arquitectura del base Jais-3-7B, código propio, `trust_remote_code=True`) |
| Parámetros totales | 9,0 mil millones (clase 7B del base), en bf16 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo completo se genera con `merge.py` |

## Arquitectura y entrenamiento

ChatISL-7B es un adaptador LoRA sobre Jais-3-7B, cuya arquitectura K2-Horizon se mantiene sin cambios. El adaptador se entrena para que el modelo se identifique como ChatISL, desarrollado por OpenISL, y se distribuye junto con el tokenizer y la plantilla de chat propias. El modelo base Jais-3-7B fue desarrollado por el IFM de MBZUAI con Inception42 y Cerebras, y opera por defecto en modo razonamiento: piensa antes de responder, comportamiento que ChatISL hereda.

El autor declara explícitamente que lo único que OpenISL ha modificado son los pesos mediante el adaptador (para fijar la identidad) y la eliminación del system prompt por defecto de la plantilla de chat, de modo que la identidad queda en los pesos. Todo lo demás —conocimiento, razonamiento, tokenizer y código— procede del base. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La versión documentada es la v0.2 (27-10-2026), sin cambios en los pesos respecto a la actualización de tarjeta del 28-10-2026.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Razonamiento previo a la respuesta (modo thinking) heredado del base: por defecto piensa antes de contestar.
- Razonamiento y resolución de problemas de conocimiento general, evaluado en ArabicMMLU (40 asignaturas).
- Identidad propia consistente: responde como ChatISL, desarrollado por OpenISL, tanto en árabe como en inglés, con o sin system prompt.
- Comprensión lectora en árabe (evaluado en Belebele árabe).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- El modelo no aprende de conversaciones.

## Casos de uso

- Evaluación comparativa de razonamiento en árabe: sirve como referencia para medir modelos abiertos de 7 a 9 mil millones en ArabicMMLU en modo chat, con un protocolo de respuesta documentado y reproducible (`eval/arabicmmlu_chat.py`).
- Asistente conversacional bilingüe árabe-inglés: el modelo mantiene una identidad estable y responde en ambos idiomas sin necesidad de system prompt, lo que simplifica el despliegue en aplicaciones donde no se controla la plantilla de sistema.
- Sistemas de tutoría o resolución de problemas educativos: el modo de razonamiento previo permite mostrar el proceso de pensamiento antes de la respuesta final, útil en entornos de aprendizaje que requieren justificación.
- Investigación sobre identidad y alineación de modelos: el par ChatISL-7B / Jais-3-7B permite estudiar cómo un adaptador LoRA fija la identidad del modelo (32/32 frente a 0/32 en las pruebas de identidad reportadas).
- Procesamiento de documentación y preguntas de opción múltiple en árabe: adecuado para tareas de evaluación tipo examen en 40 asignaturas, con precisión reportada de 82,8 en ArabicMMLU en modo chat.
- Base para fine-tuning específico de dominio en árabe: al ser un adaptador LoRA sobre un base Apache-2.0, se puede reutilizar como punto de partida para adaptaciones posteriores con requisitos de cómputo moderados.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 del adaptador y del base facilita su uso comercial, sujeto a las condiciones del base.

## Benchmarks y rendimiento

ArabicMMLU en modo chat (1.000 preguntas, 25 por asignatura, una respuesta muestreada por pregunta, leídas en una NVIDIA H100):

| Modelo | Precisión [IC 95%] | Regla estricta |
|---|---|---|
| ChatISL-7B | 82,8 [80,3; 85,0] | 82,6 |
| Jais-3-7B (base, con su system prompt) | 81,1 [78,6; 83,4] | 81,1 |
| Jais-3-7B (base, sin system prompt) | 81,3 [78,8; 83,6] | 81,2 |
| Qwen3-8B (thinking) | 71,9 [69,0; 74,6] | 71,9 |
| ALLaM-7B-Instruct-preview | 71,4 [68,5; 74,1] | 71,1 |
| Fanar-1-9B-Instruct | 62,3 [59,3; 65,3] | 51,9 |
| SILMA-9B-Instruct-v1.0 | 62,2 [59,2; 65,2] | 45,4 |
| AceGPT-v2-8B-Chat | 61,7 [58,6; 64,7] | 26,8 |

Sin modo thinking, por verosimilitud (lm-evaluation-harness 0.4.13, 0-shot):

| Benchmark | ChatISL-7B | Jais-3-7B | ALLaM-7B |
|---|---|---|---|
| ArabicMMLU (14.455 preguntas) | 68,90 | 68,50 | 70,08 |
| Belebele árabe (900) | 83,44 | 84,11 | 85,44 |
| Open Arabic LLM Leaderboard v1, light set (7.006), acc | 58,98 | 59,93 | 61,86 |

Pruebas de identidad (32 preguntas en árabe e inglés, nunca usadas en entrenamiento, bajo tres system prompts):

| System prompt | ChatISL-7B | Jais-3-7B (sin fine-tuning) |
|---|---|---|
| Ninguno (por defecto en ChatISL) | 32/32 | 0/32 |
| "You are a helpful assistant." | 32/32 | 0/32 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para el modelo completo de 9,0 mil millones de parámetros en bf16 se requiere aproximadamente 18 GB solo para pesos, más memoria para KV cache y activaciones, pero este dato no lo aporta el autor.
- GPU recomendadas: el autor reporta lecturas en una NVIDIA H100; ALLaM-7B se midió en una NVIDIA B200. No se especifican otras GPU.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada.
- Opciones de despliegue: no se documentan en la información disponible; el base requiere `trust_remote_code=True` y el adaptador se distribuye en formato PEFT, por lo que es necesario fusionarlo con `merge.py` antes de usar frameworks de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ArabicMMLU (chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatISL-7B | 9,0 mil millones | no disponible | 82,8 | Apache-2.0 | Hugging Face (adaptador) |
| Jais-3-7B | clase 7B (9,0 mil millones según la tarjeta) | no disponible | 81,1 (con system prompt) | Apache-2.0 | Hugging Face |
| Qwen3-8B | 8 mil millones (clase) | no disponible | 71,9 (thinking) | no disponible en la información | Hugging Face |
| ALLaM-7B-Instruct-preview | 7 mil millones (clase) | no disponible | 71,4 | no disponible en la información | Hugging Face |
| Fanar-1-9B-Instruct | 9 mil millones (clase) | no disponible | 62,3 | no disponible en la información | Hugging Face |

Nota: los modelos con acceso restringido (Aya Expanse 8B, Gemma-2-9B-it, Llama-3.1-8B-Instruct y Yehia-7B) no fueron medidos por el autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar el conocimiento del base, puede reproducir sesgos presentes en Jais-3-7B.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo de razonamiento previo no elimina este riesgo.
- Limitaciones de contexto o idioma: solo se declaran árabe e inglés; la longitud de contexto no está especificada. En la evaluación sin thinking por verosimilitud, ChatISL-7B queda por detrás de ALLaM-7B en ArabicMMLU, Belebele árabe y el light set del leaderboard, y ligeramente por debajo de su base en Belebele (−0,7) y en el light set (−1,0).
- La ventaja de +1,7 puntos sobre su base en ArabicMMLU en modo chat no es estadísticamente significativa (p = 0,053); la mayor parte de la ventaja frente a otros competidores proviene del modelo base.
- Restricciones de licencia: Apache-2.0 tanto en el adaptador como en el base, lo que permite uso comercial; deben respetarse las condiciones del modelo base Jais-3-7B.
- El modelo no aprende de conversaciones: no tiene memoria entre turnos más allá del contexto de la ventana.
- El repositorio contiene solo el adaptador (0,1 GB); es imprescindible fusionarlo con el base y disponer del código personalizado (`trust_remote_code=True`), lo que añade complejidad y riesgos de seguridad en el despliegue.
- Las lecturas de benchmarks son del propio autor (OpenISL) y no han sido replicadas de forma independiente según la información disponible.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/eminsy/ChatISL-7B
- Modelo base Jais-3-7B: https://huggingface.co/inception42/Jais-3-7B
- Dataset ArabicMMLU: https://huggingface.co/datasets/MBZUAI/ArabicMMLU
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
