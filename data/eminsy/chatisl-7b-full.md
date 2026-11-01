# eminsy/ChatISL-7B-full

## Resumen

ChatISL-7B-full es un ajuste fino (fine-tuning) del modelo Jais-3-7B, desarrollado por el Instituto de Modelos Fundacionales (IFM) de la Universidad MBZUAI junto con Inception42 (una compañía de G42) y Cerebras. El ajuste lo publica el usuario eminsy bajo la marca OpenISL, atribuido al ingeniero M.A ALMURISH. El modelo se presenta como un sistema cognitivo de resolución de problemas orientado a razonamiento, con capacidad de "pensar antes de responder", y está especializado en árabe e inglés.

La relevancia de este lanzamiento es doble. Por un lado, demuestra que un ajuste fino ligero sobre Jais-3-7B puede fijar una identidad propia en los pesos sin necesidad de system prompt, manteniendo el rendimiento del modelo base. Por otro, los resultados publicados en ArabicMMLU sitúan a ChatISL-7B por delante de competidores abiertos de 7 a 9 mil millones de parámetros como Qwen3-8B, ALLaM-7B, Fanar-1-9B, SILMA-9B y AceGPT-v2-8B, con una ventaja de entre 10,9 y 21,1 puntos.

El modelo tiene 8.999.178.240 parámetros (clase 7B del base, en bf16), emplea la arquitectura K2-Horizon del modelo original sin modificaciones, y se distribuye bajo licencia Apache-2.0. El repositorio ocupa 18 GB e incluye los pesos fusionados listos para cargar, junto con el tokenizer y la plantilla de chat propias de ChatISL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2-Horizon (código propio del modelo base, requiere `trust_remote_code=True`) |
| Parametros totales | 8.999.178.240 (clase 7B, bf16) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados están en bf16) |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

ChatISL-7B-full emplea la arquitectura K2-Horizon del modelo base Jais-3-7B, sin cambios en el código. El modelo parte de la revisión `5a1f6ce4` de Jais-3-7B y hereda su conocimiento, su razonamiento, su tokenizer y su implementación. El modo de operación por defecto es de razonamiento: el modelo piensa antes de responder, igual que su base.

El ajuste fino introduce únicamente dos cambios respecto al base: los pesos se han entrenado para que el modelo se identifique como ChatISL (desarrollado por OpenISL) y se ha eliminado el system prompt por defecto de la plantilla de chat, de modo que la identidad reside en los propios pesos. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá del modo de razonamiento heredado del base. Esta versión no aprende de las conversaciones.

## Capacidades

- Generación de texto en árabe e inglés con modo de razonamiento activado por defecto (piensa antes de responder).
- Razonamiento multi-paso orientado a resolución de problemas, según la propia definición del modelo como "sistema cognitivo de resolución de problemas".
- Identidad propia consolidada en los pesos: responde como ChatISL (OpenISL) en árabe y en inglés, con o sin system prompt. En la evaluación de identidad con 32 preguntas nunca vistas en entrenamiento, acierta 32/32 frente a 0/32 del base sin ajuste.
- Comprensión lectora y conocimiento en árabe, evaluado en ArabicMMLU, Belebele y el Open Arabic LLM Leaderboard v1.
- Conversación multi-turno en formato chat mediante la plantilla propia del modelo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Asistencia y tutoría en árabe: el modelo puede mantener conversaciones multi-turno en árabe estándar y razonar antes de responder, lo que resulta adecuado para explicar conceptos paso a paso en entornos educativos donde el árabe es el idioma principal.
- Evaluación de conocimiento en árabe: con un 82,8 de precisión en ArabicMMLU en modo chat, es una opción para sistemas de preguntas y respuestas sobre materias académicas (ciencia, historia, derecho, matemáticas) en árabe.
- Sistemas de atención al cliente bilingües árabe-inglés: la plantilla de chat y la identidad fija en los pesos permiten desplegar un asistente con personalidad consistente sin depender de un system prompt que el usuario pueda alterar.
- Investigación sobre identidad y alineación en modelos pequeños: el contraste documentado entre ChatISL-7B (32/32) y su base (0/32) en preguntas de identidad lo convierte en un caso de estudio útil para analizar cómo el ajuste fino modifica el comportamiento de autoidentificación.
- Generación de texto y razonamiento en inglés: aunque el foco es el árabe, el modelo soporta inglés, por lo que puede emplearse en tareas de razonamiento y redacción en ese idioma.
- Reproducción de evaluaciones en árabe: el repositorio incluye el script `eval/arabicmmlu_chat.py`, lo que facilita replicar los resultados de ArabicMMLU en modo chat y comparar con otros modelos abiertos.
- Base para nuevos ajustes finos en árabe: al ser un modelo Apache-2.0 con pesos safetensors y plantilla de chat propia, sirve como punto de partida para adaptaciones a dominios específicos (legal, médico, financiero) en árabe.

## Benchmarks y rendimiento

ArabicMMLU en modo chat (1.000 preguntas, 25 por cada una de las 40 materias, una respuesta muestreada por pregunta, leídas en una NVIDIA H100; ALLaM-7B en una B200):

| Modelo | Precisión [IC 95%] | Ventaja de ChatISL-7B (pareada) | Regla estricta |
|---|---|---|---|
| ChatISL-7B | 82,8 [80,3; 85,0] | — | 82,6 |
| Jais-3-7B (base, con su system prompt) | 81,1 [78,6; 83,4] | +1,7 (p = 0,053, no significativo) | 81,1 |
| Jais-3-7B (base, sin system prompt) | 81,3 [78,8; 83,6] | +1,5 (p = 0,11, no significativo) | 81,2 |
| Qwen3-8B (Alibaba), thinking | 71,9 [69,0; 74,6] | +10,9 (p = 1,6 × 10⁻¹⁶) | 71,9 |
| ALLaM-7B-Instruct-preview (HUMAIN) | 71,4 [68,5; 74,1] | +11,4 (p = 6,1 × 10⁻¹⁵) | 71,1 |
| Fanar-1-9B-Instruct (QCRI) | 62,3 [59,3; 65,3] | +20,5 (p = 9,3 × 10⁻³⁹) | 51,9 |
| SILMA-9B-Instruct-v1.0 | 62,2 [59,2; 65,2] | +20,6 (p = 7,6 × 10⁻³⁶) | 45,4 |
| AceGPT-v2-8B-Chat | 61,7 [58,6; 64,7] | +21,1 (p = 1,3 × 10⁻³⁵) | 26,8 |

Sin razonamiento, por verosimilitud (lm-evaluation-harness 0.4.13, 0-shot, sin plantilla de chat):

| Benchmark | ChatISL-7B | Jais-3-7B | ALLaM-7B |
|---|---|---|---|
| ArabicMMLU (14.455 preguntas) | 68,90 | 68,50 | 70,08 |
| Belebele, árabe (900) | 83,44 | 84,11 | 85,44 |
| Open Arabic LLM Leaderboard v1, conjunto ligero (7.006), acc | 58,98 | 59,93 | 61,86 |

Identidad (32 preguntas en árabe e inglés nunca usadas en entrenamiento, cada una bajo tres system prompts):

| System prompt | ChatISL-7B | Jais-3-7B (sin ajuste) |
|---|---|---|
| Ninguno (por defecto en ChatISL) | 32/32 | 0/32 |
| "You are a helpful assistant." | 32/32 | 0/32 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados están en bf16, lo que requiere aproximadamente 18 GB solo para los pesos; con caché KV y overhead de ejecución conviene prever 20-24 GB o más, dependiendo de la longitud de contexto (no documentada).
- GPU recomendadas: la model card reporta evaluaciones en NVIDIA H100 (y ALLaM-7B en B200). Para bf16, una A100 de 40 GB o 80 GB, una H100 o una L40S son opciones holgadas.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen limitado; con cuantización a 8 bits o 4 bits cabría en GPUs de 16 GB o menos, aunque el autor no publica pesos cuantizados ni instrucciones al respecto.
- Opciones de despliegue: transformers con `trust_remote_code=True` es el método documentado (la arquitectura K2-Horizon es código propio del base). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible, y la dependencia de código remoto puede complicar la integración con algunos servidores de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ArabicMMLU (chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatISL-7B | 9,0 B | no disponible | 82,8 | Apache-2.0 | HuggingFace (abierto) |
| Jais-3-7B (base) | clase 7B | no disponible | 81,1 | Apache-2.0 | HuggingFace (abierto) |
| Qwen3-8B | 8 B | no disponible | 71,9 | no disponible en la información | HuggingFace (abierto) |
| ALLaM-7B-Instruct-preview | 7 B | no disponible | 71,4 | no disponible en la información | HuggingFace (abierto) |
| Fanar-1-9B-Instruct | 9 B | no disponible | 62,3 | no disponible en la información | HuggingFace (abierto) |
| SILMA-9B-Instruct-v1.0 | 9 B | no disponible | 62,2 | no disponible en la información | HuggingFace (abierto) |
| AceGPT-v2-8B-Chat | 8 B | no disponible | 61,7 | no disponible en la información | HuggingFace (abierto) |

La ventaja de ChatISL-7B sobre Qwen3-8B, ALLaM-7B, Fanar-1-9B, SILMA-9B y AceGPT-v2-8B es estadísticamente significativa (prueba exacta de McNemar). Frente a su propio base, la diferencia no es significativa (p = 0,053 con system prompt, p = 0,11 sin él), lo que indica que la mayor parte de la ventaja procede de Jais-3-7B. Los modelos con acceso restringido (Aya Expanse 8B, Gemma-2-9B-it, Llama-3.1-8B-Instruct, Yehia-7B) no se midieron.

## Limitaciones y advertencias

- La ventaja sobre el modelo base en ArabicMMLU no es estadísticamente significativa; el rendimiento en razonamiento y conocimiento en árabe es esencialmente el de Jais-3-7B.
- Sin razonamiento y por verosimilitud, ChatISL-7B queda por detrás de ALLaM-7B en ArabicMMLU (68,90 frente a 70,08), Belebele en árabe (83,44 frente a 85,44) y el conjunto ligero del Open Arabic LLM Leaderboard v1 (58,98 frente a 61,86), y ligeramente por debajo de su base en Belebele y en el leaderboard.
- Solo cubre árabe e inglés; no hay soporte documentado de otros idiomas.
- La longitud de contexto no está documentada, lo que dificulta planificar despliegues con conversaciones o documentos largos.
- La arquitectura K2-Horizon requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y puede limitar la compatibilidad con frameworks de inferencia optimizados.
- No se publican pesos cuantizados ni guías de despliegue en vLLM, llama.cpp, Ollama o TGI.
- No se detalla la composición del dataset de ajuste fino ni si se aplicaron técnicas de alineación (RLHF/DPO), por lo que no puede evaluarse el riesgo de sesgos de forma rigurosa.
- Riesgo de alucinación inherente a los modelos generativos de esta escala; el modo de razonamiento por defecto incrementa la latencia y el consumo de tokens.
- El modelo no aprende de las conversaciones: no hay adaptación en tiempo de inferencia ni memoria entre sesiones.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y el código remoto deben verificarse por separado; la model card no detalla obligaciones adicionales.
- El número de descargas (96) y de "me gusta" (0) es muy bajo, por lo que la validación por parte de la comunidad es todavía escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eminsy/ChatISL-7B-full
- Versión adaptador (adapter): https://huggingface.co/eminsy/ChatISL-7B
- Modelo base Jais-3-7B: https://huggingface.co/inception42/Jais-3-7B
- Dataset ArabicMMLU: https://huggingface.co/datasets/MBZUAI/ArabicMMLU
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
