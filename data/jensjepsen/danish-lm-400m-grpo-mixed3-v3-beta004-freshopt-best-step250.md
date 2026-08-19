# jensjepsen/danish-lm-400m-grpo-mixed3-v3-beta004-freshopt-best-step250

## Resumen

El modelo `jensjepsen/danish-lm-400m-grpo-mixed3-v3-beta004-freshopt-best-step250` es un modelo de lenguaje autorregresivo de 414,7 millones de parámetros, especializado en danés, desarrollado por Jens Jepsen. Se trata de un snapshot de pesos ("weights-only") obtenido tras un experimento de "reinicio fresco del optimizador" sobre un modelo base ya entrenado con GRPO (Group Relative Policy Optimization) y SFT. El reinicio del estado de Adam, sin reanudar el optimizador, produjo una mejora de aproximadamente +5 puntos porcentuales en seguimiento de instrucciones (IFEval-DA) respecto al paso anterior, manteniendo el resto de métricas.

Este modelo es relevante porque demuestra que, en modelos pequeños, la gestión del optimizador puede ser tan crítica como la arquitectura o los datos. Con una licencia Apache 2.0 y un tamaño reducido, ofrece una opción práctica para aplicaciones de generación de texto en danés que requieran baja latencia y despliegue en hardware modesto. Aunque no se publican detalles arquitectónicos completos, el tag "llama" sugiere una arquitectura tipo transformer causal, y el tamaño del repositorio (1,7 GB) indica pesos en precisión completa o media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tag "llama" sugiere transformer causal, sin confirmar) |
| Parametros totales | 414.707.712 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | Danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna (número de capas, heads, dimensiones ocultas, etc.). El tag "llama" en HuggingFace sugiere que se basa en una arquitectura tipo Llama, pero no se confirma la versión ni los hiperparámetros. El modelo es un snapshot de pesos de un experimento de entrenamiento con GRPO, partiendo de un modelo base (`jensjepsen/danish-lm-400m-grpo-mixed3-v3-beta004-top3`) que a su vez proviene de un SFT previo (v31). El experimento consistió en reiniciar el estado del optimizador Adam (sin reanudar el momentum) durante el entrenamiento con RL, lo que mejoró el seguimiento de instrucciones en danés sin degradar otras métricas. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como DPO o decodificación especulativa.

## Capacidades

Según los benchmarks publicados, el modelo es capaz de:

- Seguir instrucciones complejas en danés (IFEval-DA, con puntuación p-strict de 38.0 y i-strict de 54.0).
- Resolver problemas matemáticos de nivel escolar (GSM8K pass@1 de 28.5).
- Responder preguntas de ciencia abiertas (SciQ open-Q 14.3) y de opción múltiple (SciQ-MC 58.5).
- Razonamiento de sentido común (PIQA 57.0, ARC-Easy chat-MC 42.2, ARC-Challenge chat-MC 29.3).
- Generar y resumir texto en danés (textman_summary chrF++ 41.1, textman_rewrite chrF++ 48.0).
- Mantener conversaciones multi-turno en formato chat (con separadores `<|user|>`, `<|assistant|>`, `<|end|>`).

No se mencionan capacidades de tool calling, agentes, visión, audio ni modos de razonamiento especiales.

## Casos de uso

- Atención al cliente en danés: el modelo puede gestionar conversaciones multi-turno con un formato de chat definido, resolviendo consultas frecuentes y derivando casos complejos a humanos. Su tamaño reducido permite desplegarlo en servidores con una sola GPU.
- Generación de contenido en danés: redacción de artículos, correos electrónicos o publicaciones en redes sociales, con instrucciones en lenguaje natural y control de estilo mediante el formato de chat.
- Resumen automático de documentos daneses: útil para resumir actas, informes o artículos largos, aprovechando su capacidad de resumen (textman_summary).
- Asistente de estudio o tutoría en danés: puede resolver problemas matemáticos (GSM8K) y responder preguntas de ciencia, sirviendo como apoyo educativo para estudiantes de habla danesa.
- Chatbots de nicho en danés: integración en sitios web o aplicaciones móviles donde se requiera un asistente conversacional ligero y rápido, sin depender de APIs externas.
- Prototipado y experimentación en NLP danés: al ser un modelo pequeño y de código abierto, es adecuado para investigar técnicas de RL (como GRPO) o para hacer fine-tuning en tareas específicas del danés sin grandes recursos computacionales.

## Benchmarks y rendimiento

La model card del autor proporciona la siguiente tabla de evaluación offline (resultados del autor, no verificados de forma independiente):

| eval | v31 SFT | v3 step-5500 | freshopt-step250 |
|---|---|---|---|
| IFEval-DA p-strict | 21.2 | 32.7 | 38.0 |
| IFEval-DA p-loose | 22.0 | 34.0 | 39.1 |
| IFEval-DA i-strict | 35.2 | 48.8 | 54.0 |
| IFEval-DA i-loose | 35.8 | 49.9 | 54.9 |
| GSM8K pass@1 (n=1317) | 17.4 | 27.9 | 28.5 |
| SciQ open-Q (n=1000) | 13.5 | 14.1 | 14.3 |
| CIT-gen (n=720) | 29.9 | 29.2 | 29.2 |
| textman_summary chrF++ | 41.1 | 40.9 | 41.1 |
| textman_rewrite chrF++ | 46.5 | 48.2 | 48.0 |
| CITMC (n=720) | 48.2 | 47.8 | 48.1 |
| SciQ-MC (n=1000) | — | 58.7 | 58.5 |
| PIQA (n=100) | 53 | 57.0 | 57.0 |
| ARC-Easy chat-MC | 44.4 | 42.1 | 42.2 |
| ARC-Challenge chat-MC | 29.4 | 29.1 | 29.3 |
| ARC-Easy logp | 40.6 | 41.4 | 41.2 |
| ARC-Challenge logp | 27.5 | 26.8 | 26.7 |
| GPQA-Diamond chat-MC | — | 21.2 | 21.2 |
| GPQA-Diamond logp | — | 23.7 | 24.2 |
| IFBench-DA p-strict | — | 8.7 | 8.0 |
| IFBench-DA i-strict | — | 9.0 | 8.7 |

El autor indica un composite de 2.183 (frente a 2.101 del paso 5500). No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 414,7 millones de parámetros, en fp16 ocuparía aproximadamente 0,83 GB, y en fp32 unos 1,66 GB. El repositorio de 1,7 GB sugiere pesos en fp32 o fp16 con overhead. Cabe en GPUs con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.). Para mayor velocidad, una RTX 3060 o superior es suficiente.
- Opciones de despliegue: compatible con Transformers de HuggingFace, vLLM, llama.cpp, Ollama y TGI. Al ser un modelo pequeño, también puede ejecutarse en CPU con cuantización (aunque no se ofrecen archivos GGUF oficiales).
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 3090), se espera una latencia de decodificación del orden de 10-20 ms por token, y un throughput de cientos de tokens por segundo en batch.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar en danés. La información publicada no incluye benchmarks de modelos alternativos como `jensjepsen/danish-lm-400m-grpo-mixed-v1` u otros. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo pequeño (414M) con capacidad limitada de razonamiento complejo y conocimiento general; puede fallar en tareas que requieran contexto extenso o comprensión profunda.
- Entrenado exclusivamente en danés; su rendimiento en otros idiomas es prácticamente nulo.
- No se especifica la longitud de contexto; se desconoce si soporta ventanas largas (más de 2048 tokens). Para aplicaciones con documentos extensos, puede ser insuficiente.
- Riesgo de alucinación en hechos y cifras, especialmente en dominios especializados.
- Los benchmarks publicados son del autor y no han sido verificados de forma independiente; los tamaños de muestra son pequeños (n=100 a 1317).
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir el origen del modelo.
- No se ofrecen archivos cuantizados (GGUF, AWQ) de forma oficial; el usuario debe cuantizarlos por su cuenta si necesita reducir aún más el footprint.
- El modelo es un snapshot de pesos sin tokenizer propio (se usa el del modelo base); asegurarse de cargar el tokenizer correcto desde el repositorio base.

## Enlaces

- [HuggingFace: jensjepsen/danish-lm-400m-grpo-mixed3-v3-beta004-freshopt-best-step250](https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed3-v3-beta004-freshopt-best-step250)
- [Modelo base: jensjepsen/danish-lm-400m-grpo-mixed3-v3-beta004-top3](https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed3-v3-beta004-top3)
- [Modelo anterior: jensjepsen/danish-lm-400m-grpo-mixed-v1](https://huggingface.co/jensjepsen/danish-lm-400m-grpo-mixed-v1)
- [LLM Explorer (modelo similar)](https://llm-explorer.com/model/jensjepsen%2Fdanish-lm-400m-sft-v31-avg-top3,4wYOlyIs4jAKpUWJlIYCBL)
