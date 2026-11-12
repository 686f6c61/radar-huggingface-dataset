# mrzenin/Decka-GGUF

## Resumen

Decka-GGUF es la distribucion en formato GGUF del modelo Decka-Small, un ajuste fino mediante LoRA sobre LiquidAI/LFM3-1.7B, un transformer de 1.728 millones de parametros desarrollado originalmente por Liquid AI. El modelo esta especializado en roleplay conversacional con razonamiento en cadena de pensamiento (chain-of-thought) desde el punto de vista del personaje: antes de cada respuesta emite un bloque `<think>...</think>` con el razonamiento interno del personaje. Lo publica el usuario mrzenin en Hugging Face.

El ajuste se ha realizado sobre el dataset beyoru/Aesir-Character-CoT-roleplay, con un LoRA de rango 32, alpha 64, dropout 0.05 y target `all-linear`, durante una epoca con learning rate 0.0001, longitud maxima de 4096 tokens, precision fp16 sobre una Tesla T4 y perdida calculada solo sobre los turnos del asistente. El resultado es un modelo orientado a conversaciones de rol de personaje, incluyendo contenido adulto/NSFW, lo que restringe su uso a personas adultas.

Su relevancia practica radica en que empaqueta un modelo pequeno (1.7B) en cuantizaciones GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M y F16), lo que permite ejecutarlo en hardware de consumo y en entornos de inferencia local como llama.cpp u Ollama, algo poco habitual en modelos de roleplay con razonamiento explicito. Hereda la licencia LFM Open License v1.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LiquidAI/LFM3-1.7B) con adaptador LoRA fusionado |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud maxima de entrenamiento; contexto nativo del base no disponible) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (repo de 9.1 GB); el adaptador original es LoRA sobre transformers |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B, un transformer de 1.7B parametros de Liquid AI, sobre el que se aplica un ajuste fino LoRA con rango 32, alpha 64, dropout 0.05 y target en todas las capas lineales (`all-linear`). El entrenamiento consistio en una sola epoca con learning rate 0.0001, longitud maxima de secuencia de 4096 tokens y precision fp16 sobre una GPU Tesla T4. La funcion de perdida se calculo unicamente sobre los turnos del asistente (assistant-only loss), lo que concentra el aprendizaje en las respuestas del personaje y no en los turnos del usuario.

El dataset de entrenamiento es beyoru/Aesir-Character-CoT-roleplay, compuesto por conversaciones de roleplay con razonamiento en cadena de pensamiento desde la perspectiva del personaje. El modelo aprende a emitir un bloque `<think>...</think>` antes de cada respuesta, separando el razonamiento interno del personaje del texto visible para el usuario. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre la composicion detallada del dataset. Los pesos publicados en este repositorio son las cuantizaciones GGUF del modelo ajustado.

## Capacidades

- Generacion de texto conversacional orientada a roleplay de personaje.
- Razonamiento en cadena de pensamiento explicito mediante bloques `<think>...</think>` antes de cada respuesta.
- Coherencia de personaje a lo largo de conversaciones multi-turno (hasta 4096 tokens de contexto).
- Soporte de contenido adulto/NSFW segun el dataset de entrenamiento.
- Conversacion en formato chat (pipeline conversational).
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues especificas.

## Casos de uso

- Roleplay de personaje en local: el modelo puede mantener conversaciones multi-turno encarnando un personaje concreto, con razonamiento interno visible en `<think>`, gracias a su ventana de 4096 tokens y a las cuantizaciones GGUF que permiten ejecutarlo en hardware de consumo.
- Prototipado de chatbots de ficcion interactiva: util para desarrolladores que quieran experimentar con narrativa ramificada o personajes conversacionales sin depender de APIs externas, usando llama.cpp u Ollama.
- Investigacion sobre chain-of-thought en modelos pequenos: el bloque `<think>` permite estudiar como un modelo de 1.7B estructura el razonamiento del personaje y como afecta a la coherencia de la respuesta.
- Evaluacion de tecnicas de ajuste LoRA: el repositorio documenta hiperparametros completos (rango, alpha, dropout, target, learning rate, epocas), lo que lo convierte en una referencia reproducible para experimentos de fine-tuning sobre modelos de 1.7B.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M y Q5_K_M reducen el peso del modelo lo suficiente para ejecutarlo en GPUs de consumo o incluso en CPU, adecuado para demos offline o entornos sin conectividad.
- Generacion de dialogos para videojuegos o ficcion interactiva: el modelo puede integrarse en motores de juego mediante una API local compatible con endpoints, generando respuestas de personaje con contexto de conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.5 GB en Q4_K_M, 4.5 GB en Q5_K_M, 5.5 GB en Q6_K, 7 GB en Q8_0 y 3.5 GB en F16 (los pesos F16 de 1.7B ocupan unos 3.5 GB; el repo completo de 9.1 GB incluye todas las cuantizaciones).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones intermedias; una RTX 3060, RTX 4060 o superior es suficiente para Q4_K_M y Q5_K_M. Para F16 se recomienda al menos 8 GB.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM usando cuantizaciones Q4_K_M o Q5_K_M; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y servidores compatibles con endpoints (el repositorio incluye la etiqueta endpoints_compatible). El adaptador original es compatible con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Decka-GGUF (este modelo) | 1.7B | 4096 (entrenamiento) | LFM Open License v1.0 | GGUF, LoRA | Roleplay con CoT, contenido adulto |
| LiquidAI/LFM3-1.7B | 1.7B | No disponible | LFM Open License v1.0 | safetensors | Modelo base generalista |
| Modelos de roleplay de 1-3B en GGUF | 1-3B | Variable | Variable | GGUF | Alternativas de la misma categoria; datos concretos no disponibles |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparacion con el modelo base es la mas directa: Decka anade especializacion en roleplay y razonamiento CoT a costa de generalidad.

## Limitaciones y advertencias

- Contenido adulto/NSFW: el modelo esta entrenado explicitamente con datos de roleplay para adultos; no debe usarse con menores ni en entornos no moderados.
- Riesgo de alucinacion: como todo modelo de 1.7B, puede inventar hechos, incoherencias de personaje o romper el rol, especialmente en conversaciones largas.
- Ventana de contexto limitada a 4096 tokens; las conversaciones que superen esa longitud perderan informacion previa.
- Idiomas soportados no documentados; el rendimiento en castellano no esta garantizado y probablemente sea inferior al ingles si el dataset de entrenamiento es mayoritariamente anglofono.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de uso comercial, y ademas el autor advierte de comprobar los terminos del dataset de entrenamiento.
- Sesgos: al derivar de un dataset de roleplay, puede reproducir estereotipos de personaje, sesgos de genero o contenido problematico presente en los datos.
- El modelo es un ajuste LoRA fusionado en GGUF; no se garantiza paridad exacta con el adaptador original en transformers.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrzenin/Decka-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/beyoru/Aesir-Character-CoT-roleplay
