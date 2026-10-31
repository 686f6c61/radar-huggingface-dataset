# Aobangaming/Luna-3-230m

## Resumen

Luna 3 230M es un modelo de lenguaje conversacional de tamaño reducido desarrollado por AobanZ (Aobangaming), publicado en HuggingFace bajo licencia MIT. Se trata de la tercera generación de la familia Luna, un fork de Luna 2 al que se ha ampliado la longitud de contexto hasta 8.192 tokens y se ha aumentado el tamaño del modelo desde los 100M de parámetros de la generación anterior hasta los 230M (228.838.656 parámetros reales según los safetensors). El modelo está diseñado para uso intensivo, conversaciones largas y generación de texto rápida, con una velocidad declarada de unos 130 tokens por segundo.

Su relevancia no está en competir con modelos frontera, sino en el nicho de los modelos muy pequeños y eficientes: se puede ejecutar en hardware de consumo modesto (fue entrenado en una RTX 3050 de 6 GB en solo 5 horas), lo que lo hace útil para experimentación, investigación educativa, fine-tuning casero y prototipado de chatbots ligeros. Usa una arquitectura Transformer causal de 12 capas con RMSNorm y RoPE, y el autor recomienda explícitamente ajustarlo (fine-tune) antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (arquitectura "Lightning" con RMSNorm y RoPE) |
| Parametros totales | 228.838.656 (dato real de los safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE; se asume densidad completa) |
| Longitud de contexto | 8.192 tokens (8.126 indicados en la tabla del autor) |
| Tipos de cuantizacion | no disponible (pesos en BF16; no hay versiones cuantizadas publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repo: 1,8 GB) |

## Arquitectura y entrenamiento

Luna 3 emplea un Transformer causal de 12 capas con dimension oculta de 768, 12 cabezas de atencion (MHA, multi-head attention) y un vocabulario de aproximadamente 100.000 tokens. La arquitectura, denominada "Lightning", incorpora RMSNorm en lugar de LayerNorm y codificacion posicional RoPE (Rotary Position Embedding), novedades respecto a la generacion anterior junto con el aumento de la longitud de secuencia hasta los ~8k tokens. El entrenamiento se realizo con FlashAttention/SDPA en precision BF16.

El modelo fue entrenado sobre un subconjunto del dataset OpenAssistant (OASST1), un corpus de dialogos conversacionales multiturno generados por humanos, lo que explica su orientacion conversacional y de chat (incluye chat template). No se menciona un preentrenamiento a gran escala tipo pretraining en corpus masivos como FineWeb (aunque aparece etiquetado en el repo, la model card solo documenta OASST como dato de entrenamiento). Los hiperparametros documentados son: optimizador AdamW, learning rate de 3e-4, batch size 17 y precision BF16, con una loss final de aproximadamente 1,9. El entrenamiento completo se ejecuto en una RTX 3050 de 6 GB durante 5 horas. No se documenta el uso de RLHF, DPO ni alineacion posterior.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de chat template para interacciones multiturno (roles user/assistant).
- Conversaciones largas y roleplay gracias a su ventana de contexto de ~8k tokens, inusualmente amplia para un modelo de este tamano.
- Generacion rapida: ~130 tokens por segundo segun el autor, con soporte en Llama.cpp para inferencia eficiente.
- Uso como base para agentes ligeros (el propio autor lo etiqueta con el tag "agent"), aunque sin tool calling documentado.
- Carga mediante la libreria transformers con trust_remote_code=True (custom code), y compatibilidad con PyTorch en BF16.
- Adecuado como punto de partida para fine-tuning: el autor lo recomienda explicitamente para ajustarlo a nuevos dominios.
- No hay capacidades documentadas de vision, audio, razonamiento estructurado ni codigo.

## Casos de uso

- Prototipado de chatbots ligeros: su tamano de 230M permite ejecutar conversaciones multiturno en GPUs de consumo o incluso CPU, ideal para validar flujos de dialogo antes de escalar a modelos mayores.
- Roleplay y conversacion casual: la ventana de 8k tokens permite mantener sesiones de rol o chat largo sin truncar el historial, algo poco comun en modelos tan pequenos.
- Investigacion y educacion: al ser un modelo pequeno, transparente y con licencia MIT, es adecuado para estudiar arquitecturas Transformer, ablations y cursos de NLP sin coste computacional significativo.
- Fine-tuning en hardware de consumo: con solo 230M de parametros, se puede ajustar por dominio (atencion al cliente, personajes, asistentes nicho) en una GPU domestica tipo RTX 3050/3060 en pocas horas.
- Experimentacion con Llama.cpp: el soporte declarado de Llama.cpp permite desplegarlo en dispositivos sin GPU dedicada o en aplicaciones locales de escritorio.
- Generacion de texto creativo en ingles: poesia, descripciones o contenido artistico ligero (el autor lo etiqueta con "art"), siempre con revision humana de las salidas.
- Baseline de comparacion: util como referencia de rendimiento para evaluar cuanto aporta escalar a modelos de 1B-7B en tareas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento cuantitativo es la velocidad de generacion declarada (~130 tokens por segundo) y la loss final de entrenamiento (~1,9), sin comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 228,8M de parametros en BF16, el modelo ocupa aproximadamente 0,5 GB de pesos; con contexto de 8k tokens y overhead, bastan 1-2 GB de VRAM. El propio entrenamiento se realizo en una RTX 3050 de 6 GB.
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3050, 3060, 4060 o superiores) es mas que suficiente; no se necesita hardware de datacenter para inferencia.
- Consumer GPUs: cabe con holgura en practicamente cualquier GPU con 2 GB o mas de VRAM; tambien es viable su ejecucion en CPU dada su talla.
- Opciones de despliegue: transformers (codigo de ejemplo en la model card, con trust_remote_code=True), Llama.cpp (soporte declarado por el autor). No se documenta soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: ~130 tokens por segundo de generacion segun el autor; no hay datos de latencia del primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Luna 3 230M | 228,8M | ~8k | MIT | Conversacion ligera, roleplay, fine-tuning casero |
| Qwen2.5-0.5B-Instruct | 494M | 32k (128k con YaRN) | Qwen Research (uso comercial condicionado) | Modelo pequeno multiuso con tool calling |
| SmolLM2-360M-Instruct | 360M | 8k | Apache 2.0 | Modelo compacto de HuggingFace entrenado con recipe completo (11T tokens) |
| TinyLlama-1.1B-Chat | 1,1B | 2k | Apache 2.0 | Base TinyLlama con chat, mas grande pero menos contexto |

Luna 3 destaca por su contexto de 8k en una talla muy reducida y por una licencia MIT sin restricciones, pero frente a alternativas como SmolLM2 o Qwen2.5 ha sido entrenado con muchisimos menos datos y computo (5 horas en una RTX 3050), por lo que su calidad de generacion y cobertura de tareas es presumiblemente inferior.

## Limitaciones y advertencias

- Calidad de salida limitada: el propio autor advierte que las salidas pueden ser incompletas, inexactas, repetitivas o no relacionadas con la entrada, y recomienda evaluarlas antes de cualquier otro uso.
- Riesgo alto de alucinacion: propio de un modelo de 230M entrenado solo sobre OASST1, sin alineacion documentada (RLHF/DPO) ni preentrenamiento masivo documentado.
- Monolingue en ingles: no hay soporte declarado para castellano ni otros idiomas; el rendimiento en otros idiomas es impredecible.
- Sin guardrails integrados: el autor recomienda anadir las precauciones y filtros necesarios para prevenir usos indebidos.
- Requiere custom code: la carga exige trust_remote_code=True, lo que implica ejecutar codigo arbitrario del repositorio; revisar antes de usar en entornos sensibles.
- Sin benchmarks publicados: no hay forma objetiva de comparar su calidad con otros modelos antes de probarlo.
- Proyecto de autor individual con muy poca traccion (476 descargas, 1 like en el momento de la ficha), sin comunidad amplia de verificacion ni mantenimiento garantizado.
- La licencia MIT permite uso comercial sin restricciones, pero no hay documentacion de los datos de entrenamiento suficiente para auditar posibles sesgos o derechos de autor derivados.
- Sesgos: al entrenarse sobre OASST1, hereda los sesgos de ese dataset (conversaciones en su mayoria en ingles, generadas por voluntarios); no hay evaluacion de sesgos publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aobangaming/Luna-3-230m
- Repositorio de la generacion anterior (Luna 2 70M): https://huggingface.co/Aobangaming/luna-2-70m
- Dataset de entrenamiento (OpenAssistant OASST1): https://huggingface.co/datasets/OpenAssistant/oasst1
- Web del creador: https://aobanweb.com
- Discord de la comunidad: https://discord.gg/Ty775Ut26a
- Paper, demo y repositorio de codigo independiente: no disponibles
