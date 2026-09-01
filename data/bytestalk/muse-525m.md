# BytesTalk/Muse-525M

## Resumen

Muse-525M es un modelo de lenguaje de 525,8 millones de parámetros desarrollado por BytesTalk, entrenado desde cero (from scratch) con un tokenizer propio de 48.000 tokens y un corpus ensamblado específicamente para la tarea de roleplay y compañía conversacional. Es el primer modelo de la familia Muse, separada de la línea PersonaMini-1, y supone un salto de unas 3 veces el tamaño del mayor PersonaMini, con el doble de contexto y cuatro idiomas en lugar de uno. Su principal innovación es un sistema de control de contenido basado en un token de modo al inicio de la secuencia, que permite seleccionar entre contenido seguro, sugerente o explícito. Está orientado exclusivamente a conversación de personajes y ficción, no a tareas de información factual. Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (GQA, SwiGLU, RoPE, RMSNorm) |
| Parametros totales | 525.8M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (checkpoint en fp32; no se publican cuantizaciones) |
| Idiomas soportados | Inglés, japonés, checo, eslovaco |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (raw, no transformers) + tokenizer.json |

## Arquitectura y entrenamiento

Muse-525M es un transformer decoder causal con 26 capas, dimensión de modelo 1280, 16 cabezas de atención de consulta y 4 cabezas clave-valor (GQA), feed-forward SwiGLU, posicional RoPE con theta 10.000, normalización RMSNorm y embeddings atados. El tokenizer es un BPE de 48.000 tokens entrenado específicamente para este modelo. El pretraining se realizó desde inicialización aleatoria sobre 19.2B tokens de un corpus propio que combina Project Gutenberg (8.1 GB), FineWeb-Edu (7.2 GB), web eslovaca (6.1 GB), Literotica (3.8 GB), registros de roleplay (3.8 GB), SmolTalk (3.7 GB), código Python/HTML/JS (8.3 GB), FineMath (3.0 GB), web japonesa (2.6 GB), Wikipedia inglesa (2.2 GB) y prosa NSFW (1.9 GB). La pérdida de validación base final fue 2.14 (perplejidad 8.51). Después se aplicaron varias rondas de supervisión fina (SFT) con pérdida enmascarada solo a tokens del asistente, comparando cada ronda contra un conjunto de pruebas fijo y mediante lectura manual de conversaciones; la versión publicada es la ronda que mejor equilibrio mostró, con pérdida de validación 1.9547. El entrenamiento priorizó fidelidad a la tarjeta de personaje, consistencia de registro y memoria conversacional, aunque ninguna ronda resolvió completamente la lectura de hechos de la tarjeta.

## Capacidades

- Generación de texto conversacional para roleplay y compañía, con respuestas en el registro de un personaje definido por una tarjeta.
- Control de contenido mediante tres tokens de modo al inicio de la secuencia: `<|sfw|>` (seguro), `<|suggestive|>` (sugerente) y `<|explicit|>` (explícito). El modelo fue entrenado con estos tokens en cada ejemplo, por lo que su efecto es estructural, no una convención opcional.
- Soporte multilingüe en inglés, japonés, checo y eslovaco, con tokenizer propio para esos idiomas.
- Capacidad de mantener conversaciones de hasta 2048 tokens de contexto, suficiente para diálogos multi-turno con tarjeta de personaje.
- No dispone de tool calling, funciones de agente, visión, audio ni razonamiento matemático avanzado. Su conocimiento del mundo es limitado y puede afirmar datos incorrectos con confianza.

## Casos de uso

- Roleplay de personajes en juegos de texto o entornos de ficción interactiva: el modelo responde siguiendo una tarjeta de personaje breve y factual, manteniendo coherencia de personalidad y registro durante varios turnos.
- Chat de compañía personalizado: usuarios pueden definir un personaje concreto (por ejemplo, un compañero de piso, un asistente con carácter) y mantener conversaciones cotidianas con ese tono, gracias a su ventana de 2048 tokens.
- Generación de ficción adulta controlada: el token de modo `<|explicit|>` permite escribir contenido explícito para mayores de 18 años, con rechazo explícito de contenido sexual con menores. Útil para autores de narrativa erótica.
- Prototipado de aplicaciones de personajes virtuales: su licencia MIT y su tamaño reducido lo hacen adecuado para integrarse en demos o productos pequeños sin costes de licencia.
- Entrenamiento y ajuste fino adicional: al ser un checkpoint raw PyTorch, puede servir como base para investigación en control de contenido, adaptación multilingüe o técnicas de SFT para roleplay.
- Evaluación de técnicas de prompting con tokens de control: su diseño con token de modo permite estudiar cómo influye un token estructural en la salida, frente a instrucciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta pérdidas de validación: 2.14 (perplejidad 8.51) tras el pretraining y 1.9547 tras la SFT final. No hay comparaciones cuantitativas con otros modelos en tareas de roleplay o generación conversacional.

## Requisitos de hardware

- El checkpoint se distribuye en fp32 (state_dict de ~2.1 GB). En fp16, el modelo ocupa aproximadamente 1.05 GB de VRAM, más overhead de activaciones y caché KV.
- Con cuantización a 8 bits (no publicada, pero posible con herramientas externas), cabría en ~0.5 GB; en 4 bits, ~0.26 GB. No se ofrecen cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super) es suficiente para inferencia en fp16. También puede ejecutarse en CPU con memoria RAM suficiente, aunque con latencia mayor.
- Opciones de despliegue: al ser un modelo raw PyTorch sin integración con transformers, requiere cargar el código `model_muse.py` y el tokenizer manualmente. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa del formato.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 525M en una GPU moderna, se espera una generación de decenas de tokens por segundo, pero este dato no está confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Muse-525M | 525.8M | 2048 | en, ja, cs, sk | MIT | Roleplay, control de contenido |
| PersonaMini-1-big | 160M | 1024 | en | no disponible | Roleplay, compañía |
| GPT-2 (124M-1.5B) | 124M-1.5B | 1024 | en | MIT | Generación de texto general |
| Llama-3.2-1B | 1.23B | 128K | multilingüe | Llama 3.2 | Generación general, instruct |

Muse-525M se diferencia de PersonaMini-1-big por su mayor tamaño, doble contexto, cuatro idiomas y el sistema de tokens de modo. Frente a modelos generalistas como GPT-2 o Llama-3.2-1B, su ventaja está en la especialización para roleplay y el control explícito de contenido, aunque carece de las capacidades generales y el soporte de herramientas de estos últimos. No se dispone de datos comparativos de rendimiento en tareas específicas.

## Limitaciones y advertencias

- Conocimiento del mundo muy limitado: el modelo afirma datos incorrectos con confianza, por lo que no es adecuado para tareas informativas, educativas o de asesoramiento.
- Riesgo de alucinación elevado, especialmente al leer hechos de la tarjeta de personaje: puede inventar nombres, bandas u otros detalles que no están escritos.
- Contenido NSFW: el modelo puede generar ficción explícita para adultos. Incluye rechazo de contenido sexual con menores, pero el resto de contenido explícito no tiene filtros adicionales. Debe usarse con control de edad y moderación en producción.
- Formato de prompt rígido: requiere el layout exacto con los tokens especiales `<|system|>`, `<|user|>`, `<|assistant|>` y el token de modo al inicio. Desviarse degrada notablemente la calidad de salida.
- Las tarjetas de personaje largas y novelescas rinden peor que las cortas y factuales; esto limita el estilo de definición de personajes.
- El checkpoint es raw PyTorch, no un modelo transformers estándar, lo que dificulta su integración con herramientas comunes del ecosistema (vLLM, Ollama, etc.) sin conversión manual.
- Sesgos potenciales derivados de los datos de entrenamiento: el corpus incluye contenido de Literotica y prosa NSFW, lo que puede sesgar las respuestas hacia patrones de ficción erótica incluso en modo seguro.
- No se han publicado cuantizaciones oficiales ni benchmarks de rendimiento, lo que dificulta evaluar su eficiencia comparativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BytesTalk/Muse-525M
- Perfil de BytesTalk: https://huggingface.co/BytesTalk/models
- Código del modelo y tokenizer: incluidos en el repositorio de Hugging Face (model_muse.py, tokenizer.json)
