# rwang220/Yida-Model-MM

## Resumen

Yida-Model-MM es un checkpoint de pesos completos (no un adaptador PEFT) derivado de un ajuste fino supervisado con LoRA sobre Qwen3-14B, desarrollado por el usuario rwang220. El modelo está especializado en dominio médico mediante un conjunto interno de instrucciones en chino, y se distribuye con licencia Apache 2.0 heredada del modelo base. Cuenta con 14.768.307.200 parámetros en precisión bfloat16 y una longitud de contexto máxima de 40.960 tokens, aunque el entrenamiento SFT se realizó con una longitud máxima de 8.192 tokens.

El problema que aborda es la adaptación de un LLM generalista de tamaño medio a tareas de consulta y explicación médica en chino, manteniendo las capacidades del Qwen3 original. Su relevancia es limitada pero concreta: ofrece un punto de partida reproducible para investigación en ajuste fino médico, con hiperparámetros de entrenamiento documentados (LoRA rank 16, alpha 32, 3 épocas, 72.348 pasos) y métricas de evaluación de entrenamiento (loss 0.6525, precisión de token 0.7803). No se trata de un modelo validado clínicamente ni de un dispositivo médico.

La arquitectura subyacente es un transformer causal denso tipo `Qwen3ForCausalLM` con 40 capas, hidden size 5120, atención GQA con 40 cabezas de consulta y 8 de clave/valor, tamaño intermedio 17408 y vocabulario de 151936 tokens. El modelo soporta el modo "thinking" de Qwen3 mediante `enable_thinking=True` en la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (`Qwen3ForCausalLM`), 40 capas, hidden size 5120, GQA 40/8, intermediate size 17408 |
| Parametros totales | 14.768.307.200 (14,77B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (`max_position_embeddings`); entrenamiento SFT con longitud máxima 8.192 |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 (heredada de Qwen3-14B) |
| Formato de pesos | Pesos completos fusionados en bfloat16 (safetensors, presumiblemente; no se detalla explícitamente en la model card) |
| Vocabulario | 151.936 tokens |
| Precisión de publicación | bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso estándar de la familia Qwen3, sin innovaciones arquitectónicas propias: 40 capas, hidden size 5120, atención con grouped-query attention (40 cabezas de consulta, 8 de clave/valor), tamaño intermedio de 17.408 y vocabulario de 151.936 tokens. El checkpoint se obtiene fusionando un adaptador LoRA en los pesos completos del modelo base Qwen/Qwen3-14B mediante ms-swift. El adaptador LoRA tiene rango 16, alpha 32, dropout 0.05 y se aplica sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`.

El entrenamiento consistió en 3 épocas sobre un conjunto interno y deduplicado de instrucciones médicas en chino, con categorías limitadas (no es el conjunto completo sin límite usado por la variante DS). Se empleó AdamW con learning rate 1e-4, scheduler coseno y warmup ratio 0.05, batch por dispositivo de 1 con acumulación de gradiente de 8, longitud máxima de 8.192 tokens y un total de 72.348 pasos. La mejor loss de evaluación fue 0.6525 en el paso 71.500, con una precisión de token de evaluación final de 0.7803. La model card no documenta RLHF, DPO ni datos de preferencias; se trata exclusivamente de ajuste fino supervisado.

## Capacidades

- Generación de texto y respuesta a instrucciones en chino e inglés, con especialización en contenido médico.
- Razonamiento en modo "thinking" mediante `enable_thinking=True` en la plantilla de chat de Qwen3.
- Explicación de conceptos médicos en lenguaje divulgativo (el ejemplo de la model card solicita explicar precauciones habituales sobre la hipertensión).
- Generación de texto multi-turno a través de la plantilla de chat estándar de Qwen3.
- Compatibilidad con `vllm serve` y el parser de razonamiento `qwen3` para despliegue con separación de la cadena de pensamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades en la información disponible.
- Capacidades multilingües limitadas a los idiomas declarados (zh, en); no se documentan otros idiomas.

## Casos de uso

- Evaluación de ajuste fino médico en investigación: el modelo sirve como referencia reproducible para estudiar el efecto de un SFT con LoRA sobre Qwen3-14B en dominio médico, con hiperparámetros y métricas de entrenamiento documentados.
- Generación de material divulgativo sanitario en chino: dado un tema médico, el modelo produce explicaciones en lenguaje accesible, útil para borradores de contenido que un profesional revisa antes de publicar.
- Asistente de consulta documental interna: integrado en un pipeline RAG sobre guías clínicas propias, el modelo puede redactar respuestas a partir de fragmentos recuperados, con la ventana de 40.960 tokens para incluir contexto extenso.
- Prototipado de chatbots de orientación sanitaria no diagnóstica: con las advertencias oportunas, puede gestionar conversaciones multi-turno sobre hábitos saludables o información general, siempre con supervisión humana.
- Generación de preguntas y respuestas sintéticas para curación de datasets médicos: el modelo puede producir pares pregunta-respuesta en chino que luego se filtran y validan manualmente.
- Comparación de estrategias de despliegue: al ser un checkpoint de 14,77B en bfloat16, permite medir latencia y throughput en vLLM con el parser `qwen3` frente al modelo base, útil para decisiones de infraestructura.
- Traducción técnica zh-en de contenido médico: dentro de los idiomas soportados, puede asistir en la traducción de textos clínicos, con revisión posterior por un traductor especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de evaluación durante el entrenamiento: loss de evaluación de 0.6525 (mejor en el paso 71.500 y final) y precisión de token de evaluación de 0.7803. No se aportan resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark clínico.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 29,5 GB solo para los pesos (14,77B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 40 GB para contextos moderados.
- VRAM estimada con cuantización de 8 bits: alrededor de 15 GB para pesos; con 4 bits, alrededor de 8-9 GB para pesos (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas para bfloat16: A100 40/80 GB, H100 80 GB, L40S 48 GB. Para cuantización 4 bits, una RTX 4090 de 24 GB podría alojar los pesos, aunque la longitud de contexto efectiva se vería reducida por la caché KV.
- Cabe en GPU de consumo solo con cuantización agresiva (4 bits) y contextos limitados; no cabe en bfloat16 en tarjetas de 24 GB o menos.
- Opciones de despliegue documentadas: `vllm serve rwang220/Yida-Model-MM --reasoning-parser qwen3` y carga con `transformers` (`AutoModelForCausalLM`). No se documentan instrucciones para llama.cpp, Ollama ni TGI, aunque al ser un checkpoint Qwen3 estándar deberían ser compatibles previa conversión a GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Yida-Model-MM | 14,77B | 40.960 | Apache 2.0 | Médica (SFT en chino) | Hugging Face, 0 descargas |
| Qwen/Qwen3-14B | 14,77B | 40.960 | Apache 2.0 | Generalista | Hugging Face, ampliamente adoptado |
| Qwen3-8B | ~8B | 40.960 (según familia Qwen3) | Apache 2.0 | Generalista | Hugging Face |
| Modelos médicos en chino de tamaño similar | No disponible | No disponible | No disponible | Médica | No disponible |

La comparación directa más relevante es con Qwen/Qwen3-14B, su modelo base inmediato: comparten arquitectura, tamaño, contexto y licencia, y la única diferencia documentada es el ajuste fino supervisado en dominio médico. Frente a Qwen3-8B, Yida-Model-MM ofrece más parámetros pero mayores requisitos de VRAM. No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Puede alucinar guías clínicas, dosis, diagnósticos y citas bibliográficas; la model card lo advierte explícitamente.
- No es un dispositivo médico y no debe usarse como única base para decisiones clínicas.
- Los datos de entrenamiento son internos y no se publican con el repositorio, lo que impide auditar la composición del dataset y reproducir el entrenamiento.
- Solo se reportan métricas de loss y precisión de token de entrenamiento; no hay evaluación clínica ni benchmarks estándar, por lo que el rendimiento real en tareas médicas es desconocido.
- Idiomas limitados a chino e inglés; el rendimiento fuera de estos idiomas no está documentado.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad; debe tratarse como un artefacto de investigación sin contraste externo.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de evaluación clínica y la naturaleza médica del dominio desaconsejan su uso en producción sanitaria sin validación adicional y supervisión profesional.
- El contexto de entrenamiento (8.192 tokens) es inferior al máximo del modelo (40.960), por lo que el rendimiento en ventanas muy largas no está garantizado.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto interno en chino puede heredar sesgos del corpus y del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rwang220/Yida-Model-MM
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Perfil del autor: https://huggingface.co/rwang220
