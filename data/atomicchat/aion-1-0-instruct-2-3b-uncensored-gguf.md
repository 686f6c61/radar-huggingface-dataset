# AtomicChat/Aion-1.0-Instruct-2.3B-Uncensored-GGUF

## Resumen

Aion-1.0-Instruct-2.3B-Uncensored-GGUF es una versión modificada del modelo Aion 1.0 Instruct 2.3B de Microsoft, publicada por AtomicChat. El modelo base es un decoder denso de 2.288.831.488 parámetros (2,3B) con arquitectura transformer de 28 bloques, tamaño oculto de 2048 y embeddings atados. La modificación consiste en una técnica de "abliteration": se proyecta fuera de los pesos la dirección de rechazo (refusal direction) identificada en el flujo residual, de modo que el modelo deja de negarse a responder peticiones que el original rechazaría.

El problema que resuelve es el comportamiento de rechazo excesivo del modelo original: según la model card, el modelo base rechaza el 100% de los prompts de JailbreakBench y el 47,2% de los prompts seguros de XSTest. Tras la edición, esos porcentajes caen al 1,2% y al 0%, respectivamente, manteniendo un MMLU de 51,80% frente al 52,35% original (2000 preguntas, McNemar p = 0,14). El modelo se distribuye en formato GGUF con cuantizaciones propias (AD-Q6_K y AD-Q4_K_M) y también como un adaptador LoRA de rango 1 de 1,2 MB.

Es relevante ahora porque permite ejecutar localmente un modelo de 2,3B sin filtros de rechazo, con un tamaño en disco de 1,58 a 2,14 GB, y porque documenta de forma medible el coste de la edición sobre el rendimiento. La contrapartida es que requiere una build de llama.cpp con soporte para Aion (parche `aion-port.patch` sobre el commit `bafa0420`); ni el llama.cpp upstream, ni LM Studio, ni Ollama cargan Aion todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, 28 bloques, hidden size 2048, embeddings atados |
| Parametros totales | 2.288.831.488 (2,3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32768 tokens (configuracion de ejecucion indicada en la model card) |
| Tipos de cuantizacion | AD-Q6_K (2,14 GB), AD-Q4_K_M (1,58 GB); LoRA GGUF de 1,2 MB |
| Idiomas soportados | no disponible (la model card no detalla la lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un decoder transformer denso de 28 bloques con tamaño oculto 2048 y embeddings atados. Un detalle arquitectónico destacable es el patrón de atención híbrido: 21 bloques atienden sobre una ventana deslizante de 2048 tokens y 7 bloques atienden sobre el contexto completo. Además, cada bloque escribe dos veces en el flujo residual, a través de `attn_output` y `ffn_down`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La modificación de AtomicChat sigue el método de Arditi et al. (2024), que trata la decisión de rechazar como una única dirección en el flujo residual. Para localizarla se usaron 416 prompts dañinos (`harmful_behaviors`) y 416 prompts inocuos (`harmless_alpaca`) en inglés, más un conjunto en un segundo idioma, todos formateados con la plantilla de chat del modelo. La dirección se calcula como la media sobre los prompts dañinos menos la media sobre los inocuos en el último token del prompt, eliminando la componente a lo largo de la media de los inocuos para evitar que el modelo rechace prompts inocuos parecidos. Se edita un bloque por dirección, del bloque 9 al 27, midiendo la dirección en la salida de cada bloque para seguir cómo cambia con la profundidad. El resultado se empaqueta como un adaptador LoRA de rango 1 (38 matrices, 1,2 MB) construido para escala 0,75, y también se hornea directamente en los ficheros GGUF.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida en cada fichero GGUF.
- Respuesta a peticiones que el modelo original rechazaba: el rechazo cae del 100% al 1,2% en JailbreakBench y del 47,2% al 0% en XSTest.
- Tool calling y function calling: la model card afirma que las llamadas a herramientas no se ven afectadas por la edición.
- Contexto largo: se indica que el contexto largo no se ve afectado; la configuración de ejemplo usa `-c 32768`.
- Modo de razonamiento o "thinking": no disponible en la información proporcionada.
- Capacidades multilingües: el proceso de edición incluyó un conjunto de prompts en un segundo idioma, pero no se detalla qué idiomas soporta el modelo.
- Visión y audio: no disponible.

## Casos de uso

- Asistente local sin filtros de rechazo: desplegado con llama.cpp compilado con el parche de Aion, el modelo responde a peticiones creativas o de rol que el original rechazaría, con un tamaño en disco de 2,14 GB en AD-Q6_K que cabe en cualquier portátil moderno.
- Investigación sobre alineación y abliteration: el par de ficheros (modelo original y versión editada) más el LoRA de 1,2 MB permite reproducir y medir el efecto de la edición con KLD y top-1 sobre texto neutro, útil para estudiar direcciones de rechazo.
- Evaluación de robustez de salvaguardas: sirve como caso controlado para probar clasificadores de contenido o capas de moderación externas, dado que el propio modelo ya no rechaza.
- Generación de código y tareas técnicas: con tool calling funcional y 32k de contexto, puede integrarse en flujos de edición de código o consultas a APIs dentro de un entorno local.
- Procesamiento de documentos largos: los 7 bloques con atención global sobre el contexto completo permiten resumir o extraer información de textos de hasta 32k tokens en local.
- Prototipado de chatbots de personaje: la ausencia de rechazos y la ventana de 32k facilitan mantener personajes coherentes en conversaciones largas sin interrupciones por negativas.
- Despliegue en hardware modesto: la cuantización AD-Q4_K_M de 1,58 GB permite ejecutar el modelo en GPUs de consumo con 4-6 GB de VRAM o incluso en CPU.

## Benchmarks y rendimiento

| Metrica | Original BF16 | Editado (LoRA sobre BF16) | AD-Q6_K | AD-Q4_K_M |
|---|---|---|---|---|
| MMLU (2000 preguntas) | 52,35% | 51,80% (p = 0,14) | no disponible | no disponible |
| Rechazos en JailbreakBench (81) | 100% | 1,2% | 1,2% | 2,5% |
| Rechazos en XSTest (250) | 47,2% | 0% | 0% | 0% |
| Respuestas largas rechazadas | 30 de 30 | 1 de 30 | no disponible | no disponible |
| KLD medio vs. BF16 original (texto neutro) | 0 | 0,0017 | 0,0074 | 0,0156 |
| Mismo top-1 vs. BF16 original | 100% | 99,6% | 94,25% | 92,08% |

Las cifras de KLD y top-1 de los ficheros GGUF se midieron contra el modelo BF16 original sin modificar sobre 24 fragmentos de 4096 tokens de texto neutro retenido, por lo que incluyen tanto la edición como la cuantización. Los cuantizados equivalentes del modelo sin editar dan KLD de 0,0054 (Q6_K) y 0,0131 (Q4_K_M) sobre el conjunto neutro completo, de modo que la mayor parte de la distancia en estos ficheros proviene de la cuantización, no de la edición. Los ficheros horneados produjeron 1 y 2 respuestas degeneradas de un total de 431 en los conjuntos de prueba, y ninguna vacía. No se han publicado resultados de benchmarks estándar (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3 GB para AD-Q6_K y 2-2,5 GB para AD-Q4_K_M, incluyendo overhead de contexto y caché KV.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo es demasiado pequeño para aprovechar GPUs de datacenter.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 4 GB o más; también es viable en CPU con `-ngl 0`.
- Opciones de despliegue: llama.cpp compilado con el parche `aion-port.patch` sobre el commit `bafa0420`, usando `llama-server` con `--jinja`. El llama.cpp upstream, LM Studio y Ollama no cargan Aion todavía.
- Latencia y throughput: no disponibles en la información proporcionada.
- El LoRA de 1,2 MB se carga con `--lora-scaled FILE:0.75` (no con `--lora`, que aplicaría escala 1,0).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-Uncensored (este) | 2,3B | 32k | MIT | GGUF, LoRA | Sin rechazos medidos; requiere llama.cpp parcheado |
| Aion-1.0-Instruct-2.3B (original, Microsoft) | 2,3B | 32k | no disponible | safetensors, GGUF | Rechaza el 100% de JailbreakBench; MMLU 52,35% |
| Modelos de 2-3B de la familia Qwen o Llama | 2-3B | 8k-32k | variable | safetensors, GGUF | No disponible en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Una de las puertas de calidad del release no se cumple y el autor lo declara: en prompts inocuos, el primer token se aleja del original más que el límite de 0,10 fijado (KLD 0,145). En texto neutro apenas se mueve (KLD 0,0017).
- La edición elimina el comportamiento de rechazo, lo que implica que el modelo responderá a peticiones dañinas. No debe desplegarse en producción orientada a usuarios sin capas externas de moderación.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo es de 2,3B y su MMLU ronda el 52%, por lo que la fiabilidad en tareas de conocimiento es limitada.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de idioma: la model card no detalla la lista de idiomas soportados ni la cobertura de la edición en idiomas distintos del inglés.
- Restricciones de licencia: licencia MIT, permite uso comercial, pero el modelo base es de Microsoft y la licencia del original no se detalla en la información disponible; conviene verificar la del modelo base.
- Compatibilidad: no funciona en llama.cpp upstream, LM Studio ni Ollama sin el parche de Aion, lo que complica el despliegue en entornos estándar.
- La edición solo se midió sobre los pesos BF16 con el adaptador; sobre una base cuantizada no se midió por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomicChat/Aion-1.0-Instruct-2.3B-Uncensored-GGUF
- Cuantizaciones del modelo base: https://huggingface.co/AtomicChat/Aion-1.0-Instruct-2.3B-GGUF
- Modelo base original: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- Referencia metodológica (Arditi et al., 2024): no disponible en la información proporcionada
