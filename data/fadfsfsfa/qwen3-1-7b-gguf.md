# fadfsfsfa/Qwen3-1.7B-GGUF

## Resumen

Qwen3-1.7B-GGUF es una cuantización en formato GGUF del modelo Qwen3-1.7B, desarrollado originalmente por Alibaba Cloud (equipo Qwen). El repositorio lo publica el usuario `fadfsfsfa` como artefacto derivado del modelo base oficial `Qwen/Qwen3-1.7B`, empaquetado con cuantización `q8_0` para su ejecución local mediante llama.cpp u Ollama. No se trata de un modelo nuevo, sino de una conversión de pesos a un formato optimizado para inferencia en CPU y GPU de consumo.

El modelo base es un transformer causal denso de 1.700 millones de parámetros (1.400 millones excluyendo embeddings), con 28 capas, atención GQA (16 cabezas de query y 8 de key/value) y una longitud de contexto de 32.768 tokens. Pertenece a la generación Qwen3, que introduce conmutación fluida entre modo "thinking" (razonamiento explícito) y modo "no-thinking" (diálogo directo) dentro de un mismo modelo.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar Qwen3-1.7B en hardware modesto: el repositorio ocupa 1,8 GB y la cuantización q8_0 preserva prácticamente la calidad del modelo original, a diferencia de cuantizaciones más agresivas. Está pensado para desarrolladores que quieran probar las capacidades de razonamiento y agente de Qwen3 sin depender de infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only) con GQA |
| Parametros totales | 1.720.574.976 (1,7B); 1,4B excluyendo embeddings |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | q8_0 (única incluida en este repo) |
| Idiomas soportados | 100+ idiomas y dialectos (según model card del base); no se detalla lista completa |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Capas | 28 |
| Cabezas de atención | 16 (Q) / 8 (KV), GQA |
| Tamano del repo | 1,8 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer causal decoder-only denso con 28 capas y atención con grouped-query attention (16 cabezas de query frente a 8 de key/value), lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. La model card indica que el modelo pasó por dos etapas: pretraining y post-training. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles de alineación (RLHF/DPO), más allá de la mención genérica a "post-training" y a "superior human preference alignment".

La innovación técnica más destacable de la familia Qwen3 es la conmutación entre modo thinking y no-thinking dentro de un mismo modelo, controlable mediante instrucciones `/think` y `/no_think` en el prompt o en el mensaje de sistema. En modo thinking el modelo genera un bloque `<think>` con razonamiento explícito antes de la respuesta final; en modo no-thinking responde directamente. Esta cuantización GGUF q8_0 conserva los pesos en 8 bits, minimizando la pérdida de calidad respecto al modelo original en safetensors.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito en modo thinking (matemáticas, lógica, código).
- Razonamiento directo en modo no-thinking para diálogo general eficiente.
- Generación y comprensión de código.
- Razonamiento matemático y resolución de problemas paso a paso.
- Capacidades de agente: integración con herramientas externas y function calling en ambos modos.
- Soporte multilingüe e instrucciones en 100+ idiomas y dialectos, con traducción.
- Alineación a preferencias humanas: escritura creativa, role-play, seguimiento de instrucciones.
- Conmutación por turno entre thinking y no-thinking mediante `/think` y `/no_think`.
- No se menciona soporte de visión ni audio en la información disponible.

## Casos de uso

- Asistente de razonamiento local en estación de trabajo: con 32.768 tokens de contexto y modo thinking, el modelo puede resolver problemas matemáticos y lógicos paso a paso sin depender de API externa, ejecutándose vía llama.cpp con `-c 40960`.
- Generación de código en entornos con restricciones de red: al ser GGUF q8_0 y ocupar 1,8 GB, puede integrarse en pipelines de CI/CD o herramientas de desarrollo que no pueden enviar código a servicios cloud, usando Ollama (`ollama run hf.co/Qwen/Qwen3-1.7B-GGUF:Q8_0`).
- Agente conversacional con tool calling: el modelo base declara capacidades de agente e integración con herramientas externas; esta cuantización permite montar un agente local que consulte APIs o bases de datos mediante function calling.
- Atención al cliente automatizada multi-turno: los 32.768 tokens de ventana permiten mantener conversaciones largas con historial extenso, y el modo no-thinking reduce latencia en respuestas rutinarias.
- Traducción y asistencia multilingüe: el soporte de 100+ idiomas del base lo hace adecuado para traducción y seguimiento de instrucciones en entornos multilingües, ejecutable en local.
- Prototipado e investigación de modos de razonamiento: permite comparar directamente el comportamiento thinking frente a no-thinking en el mismo modelo y hardware, útil para estudiar coste/calidad del razonamiento explícito.
- Procesamiento de documentos con contexto largo: con 32.768 tokens puede resumir o extraer información de documentos extensos en una sola pasada, en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio remite al blog y documentación oficiales de Qwen para datos de evaluación, requisitos de hardware y rendimiento de inferencia, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización q8_0 de un modelo de 1,7B ocupa aproximadamente 1,8 GB de pesos; con KV cache para 32.768 tokens el consumo total se sitúa en torno a 2,5-3,5 GB, dependiendo de la implementación y del contexto efectivo configurado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo con contexto completo; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter (A100, H100) lo ejecutan con holgura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 4 GB o más; también es viable en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/Qwen/Qwen3-1.7B-GGUF:Q8_0`), y frameworks compatibles con GGUF. La model card cita explícitamente llama.cpp y Ollama.
- Latencia y throughput: no disponible en la información proporcionada. La model card recomienda `-ngl 99`, `-fa` (flash attention) y `-sm row` en llama.cpp para maximizar el offload a GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B (este repo, GGUF q8_0) | 1,7B | 32.768 | Apache 2.0 | GGUF | Hugging Face (repo de terceros) |
| Qwen3-1.7B (oficial) | 1,7B | 32.768 | Apache 2.0 | safetensors / GGUF | Hugging Face (Qwen/Qwen3-1.7B) |
| Qwen2.5-1.5B | 1,5B | no disponible en esta ficha | Apache 2.0 | safetensors / GGUF | Hugging Face |
| Llama 3.2 1B | 1,2B | 128K (según model card oficial, no verificada aquí) | Llama 3.2 Community License | safetensors / GGUF | Hugging Face (Meta) |

La comparación de rendimiento numérico entre estos modelos no está disponible en la información proporcionada. La model card del base afirma que Qwen3 supera a Qwen2.5 instruct en modo no-thinking y a QwQ en modo thinking en matemáticas, código y razonamiento lógico, pero sin cifras concretas.

## Limitaciones y advertencias

- Repositorio de terceros: `fadfsfsfa/Qwen3-1.7B-GGUF` no es el repositorio oficial de Qwen; conviene verificar la integridad de los pesos y preferir el repo oficial `Qwen/Qwen3-1.7B-GGUF` para producción.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de validación comunitaria de esta conversión concreta.
- Solo incluye cuantización q8_0: no ofrece alternativas Q4_K_M, Q5_K_M ni otras, limitando el ajuste de memoria para hardware muy restringido.
- Riesgo de repeticiones en cuantizaciones: la model card recomienda `presence_penalty=1.5` para suprimir salidas repetitivas en modelos cuantizados, con posible mezcla de idiomas y ligera pérdida de rendimiento si se sube más.
- No usar greedy decoding en modo thinking: la model card advierte que provoca degradación de rendimiento y repeticiones infinitas.
- Riesgo de alucinación: inherente a modelos de 1,7B; menor capacidad de razonamiento que modelos mayores de la misma familia.
- Sesgos: no se documentan sesgos específicos en la información disponible; al provenir de un modelo entrenado con datos web a gran escala, es esperable que herede sesgos de esos datos.
- Idiomas: aunque el base declara 100+ idiomas, no se detalla la lista ni la calidad por idioma; el castellano no está verificado explícitamente en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el enlace de licencia citado en la model card y las condiciones del modelo base.
- Contenido de thinking en historial: en conversaciones multi-turno debe excluirse el bloque `<think>` del historial; frameworks que no usan la plantilla Jinja2 deben implementarlo manualmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fadfsfsfa/Qwen3-1.7B-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen3-1.7B-GGUF
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Guía llama.cpp de Qwen: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Guía Ollama de Qwen: https://qwen.readthedocs.io/en/latest/run_locally/ollama.html
- Chat de Qwen: https://chat.qwen.ai/
- Licencia citada: https://huggingface.co/Qwen/Qwen3-1.7B-GGUF/blob/main/LICENSE
- llama.cpp: https://github.com/ggerganov/llama.cpp
