# Aobangaming/Luna-3-230m-GGUF

## Resumen

Luna 3 230M es un modelo de lenguaje conversacional de tamaño muy reducido desarrollado por AobanZ (AobanLabs), publicado en Hugging Face en formato GGUF bajo licencia MIT. Es la tercera generación de la familia Luna, un fork de Luna 2 que amplía el tamaño del modelo desde los 100M hasta los 230M de parámetros (unos 100M de parámetros transformer efectivos) y extiende la longitud de contexto hasta 8.192 tokens. Su objetivo es ofrecer respuestas rápidas y eficientes en conversaciones largas y roleplay, ejecutándose en hardware muy modesto, incluso en portátiles sin GPU dedicada.

El modelo se basa en la arquitectura propia "Lightning", un transformer causal de 12 capas con RMSNorm y RoPE, entrenado sobre un subconjunto del dataset OpenAssistant (OASST1) en inglés. La model card declara una velocidad de generación de alrededor de 130 tokens por segundo, un rendimiento notable para un modelo de este tamaño. Su relevancia radica en el nicho de los modelos ultra pequeños: experimentación, investigación educativa y despliegue en dispositivos con recursos mínimos, donde modelos grandes como Llama o Qwen no son viables.

Cabe destacar que se trata de un proyecto de autor individual entrenado en solo 5 horas sobre una RTX 3050, con una pérdida final de entrenamiento de aproximadamente 1,9. El propio autor recomienda ajustar el modelo (fine-tuning) antes de usarlo en producción y añadir salvaguardas contra usos indebidos, lo que indica que su calidad de generación es limitada y está pensado principalmente para uso casual, investigación y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura "Lightning"), 12 capas, RMSNorm, RoPE, MHA |
| Parametros totales | 228.829.440 (~230M) |
| Parametros activos | no disponible (no se indica arquitectura MoE; presumiblemente densos) |
| Longitud de contexto | 8.192 tokens (8k) |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas en la model card) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | GGUF (compatible con llama.cpp); tambien listado bajo transformers con custom_code |

## Arquitectura y entrenamiento

Luna 3 emplea un transformer causal decoder-only de 12 capas con estados ocultos de 768 dimensiones (d_model 768) y 12 cabezas de atencion multi-cabeza (MHA). La familia Luna utiliza una arquitectura propia denominada "Lightning"; en la version 3 los cambios respecto a Luna 2 se limitan a una actualizacion de RMSNorm y RoPE, ademas del aumento de longitud de secuencia hasta 8.126 tokens segun la tabla de hiperparametros (la model card lo comercializa como ventana de 8k). El vocabulario es de aproximadamente 100.000 tokens.

El entrenamiento se realizo sobre un subconjunto del dataset OpenAssistant (OASST1), un corpus de dialogos conversacionales multiturno, lo que explica el enfoque conversacional del modelo. Los tags del repositorio mencionan tambien el dataset HuggingFaceFW/fineweb, aunque la model card solo documenta OASST como dato de entrenamiento. El entrenamiento se hizo en una RTX 3050 de 6 GB durante 5 horas, con precision BF16, optimizador AdamW, learning rate de 3e-4 y batch size 17, usando FlashAttention/SDPA. La perdida final fue de aproximadamente 1,9. No se documenta entrenamiento con RLHF, DPO ni alineacion por preferencias. No se han publicado detalles sobre decodificacion especulativa ni otras tecnicas de inferencia avanzadas; el soporte de llama.cpp es la principal mejora de eficiencia declarada.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a chats largos y roleplay gracias a su ventana de contexto de 8k tokens.
- Interacciones multiturno, al haber sido entrenado sobre OASST1, un dataset de dialogos asistente-usuario.
- Etiquetado por el autor como apto para tareas de agente, aunque no se documenta soporte nativo de tool calling ni function calling.
- Ejecucion eficiente via llama.cpp, con una velocidad declarada de unos 130 tokens por segundo.
- Compatibilidad con la libreria transformers de Hugging Face (requiere trust_remote_code=True).
- No incluye capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades de codigo, matematicas y razonamiento: no documentadas; dado su tamano y datos de entrenamiento, son muy limitadas.

## Casos de uso

- Chatbots conversacionales ligeros: el modelo puede sostener conversaciones multiturno en ingles gracias a su entrenamiento en OASST1 y su ventana de 8k tokens, adecuado para asistentes simples en dispositivos de bajos recursos.
- Roleplay y narrativa interactiva: la ventana de contexto de 8k permite mantener conversaciones de rol largas sin perder el hilo reciente, un uso que la propia model card menciona explicitamente.
- Experimentacion e investigacion educativa: su tamano de 230M y su arquitectura documentada (12 capas, d_model 768) lo hacen ideal para estudiar el comportamiento de transformers pequenos, hacer ablaciones o ensenar como funciona un LLM por dentro.
- Prototipado rapido en local: con menos de 1 GB de repositorio y soporte GGUF, permite integrar un LLM funcional en aplicaciones de escritorio o scripts sin GPU, usando llama.cpp u Ollama.
- Base para fine-tuning: el autor recomienda explicitamente ajustar el modelo sobre datos propios; su licencia MIT y su tamano reducido hacen el fine-tuning accesible incluso en una GPU consumer de gama media.
- Generacion de texto creativo y arte generativo: el tag "art" del repositorio sugiere uso en experimentos de texto creativo, donde la calidad no critica es aceptable.
- Integracion en pipelines de text-generation-inference de bajo coste: util como modelo de prueba en sistemas de agentes o orquestacion antes de sustituirlo por modelos mayores en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento declarada es la velocidad de generacion: aproximadamente 130 tokens por segundo, y una perdida de entrenamiento final de ~1,9.

## Requisitos de hardware

- VRAM estimada para inferencia: con un repositorio de 0,9 GB en GGUF, el modelo completo cuantizado cabe comodamente en menos de 1-2 GB de VRAM o incluso solo en RAM; no requiere GPU para ejecutarse a velocidades razonables.
- GPU recomendadas: ninguna en particular dada su exigencia minima; cualquier GPU moderna lo ejecuta sin problema. El propio modelo fue entrenado en una RTX 3050 de 6 GB.
- Consumer GPUs: cabe sobradamente en cualquier GPU consumer actual (GTX 1650, RTX 3050, RTX 3060, RTX 4090, etc.) e incluso en integradas (iGPU) o CPU pura.
- Opciones de despliegue: llama.cpp (soporte declarado por el autor), transformers de Hugging Face (con trust_remote_code=True), y por extension Ollama y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM ni TGI.
- Latencia y throughput: alrededor de 130 tokens por segundo segun la model card; no se especifican condiciones de medida ni hardware usado para la prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Luna 3 230M | ~229M | 8k | MIT | Conversacion en ingles, ultra ligero, GGUF |
| Qwen2.5-0.5B-Instruct | ~500M | 32k | Qwen Research (uso comercial restringido) | Conversacion y tareas generales multilingue |
| SmolLM2-360M-Instruct | ~360M | 8k | Apache 2.0 | Asistente ligero entrenado por Hugging Face |
| TinyLlama-1.1B-Chat | ~1,1B | 2k | Apache 2.0 | Chat generalista, mas grande pero mas capaz |

Luna 3 230M es el mas pequeno del grupo y probablemente el menos capaz en tareas generales, pero destaca por su licencia MIT sin restricciones, su velocidad declarada de 130 tok/s y su huella de memoria minima. Frente a SmolLM2-360M, su alternativa mas directa, ofrece menos parametros y un entrenamiento mucho mas limitado (5 horas frente a pipelines industriales), por lo que se recomienda evaluacion propia antes de elegir.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y documentado solo para ingles; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Calidad de salida: la propia model card advierte que las respuestas pueden ser incompletas, inexactas, repetitivas o no relacionadas con la entrada, y deben evaluarse antes de usarse para otros fines.
- Entrenamiento minimo: 5 horas en una RTX 3050 con perdida final de ~1,9 indican un modelo poco convergido en comparacion con modelos industriales; se esperan alucinaciones frecuentes y coherencia limitada.
- Sin alineacion: no se documenta RLHF ni DPO, por lo que el modelo puede generar contenido inapropiado sin filtros; el autor recomienda anadir guardrails.
- Capacidades no documentadas: no hay soporte declarado de tool calling, agentes reales, vision ni razonamiento avanzado, pese a los tags del repositorio.
- Custom code: el uso con transformers requiere trust_remote_code=True, lo que implica ejecutar codigo arbitrario del repositorio; reviselo antes de usarlo en entornos sensibles.
- Licencia: MIT permite uso comercial sin restricciones, aunque la calidad del modelo limita su utilidad en produccion sin fine-tuning previo.
- Proyecto individual: sin organizacion detras, la mantenibilidad y disponibilidad futura del repositorio no estan garantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aobangaming/Luna-3-230m-GGUF
- Repositorio de la generacion anterior (Luna 2 70M): https://huggingface.co/Aobangaming/luna-2-70m
- Dataset de entrenamiento (OpenAssistant OASST1): https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset mencionado en tags (FineWeb): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Web del creador: https://aobanweb.com
- Discord de la comunidad: https://discord.gg/Ty775Ut26a
- Paper, demo y blog: no disponibles
