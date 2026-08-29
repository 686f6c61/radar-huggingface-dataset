# aiuser3993/GLM-Edge-1.5B-Chat-Greek

## Resumen

GLM-Edge-1.5B-Chat-Greek es un modelo de lenguaje de 1.500 millones de parametros desarrollado por el usuario aiuser3993, resultado de un proceso de cuádruple fine-tuning sobre el modelo base hereticness/heretic_glm-edge-1.5b-chat, que a su vez deriva de la familia GLM-Edge de Zhipu AI (zai-org). El objetivo principal de este modelo es mejorar las capacidades en griego moderno del modelo base, que originalmente fue entrenado principalmente para ingles y chino.

El modelo esta pensado para entornos de inferencia en dispositivos edge, como telefonos moviles y sistemas de automocion, gracias a su tamano compacto de 1.5B parametros. Sin embargo, el autor advierte explicitamente en la model card que el modelo presenta problemas significativos de coherencia, es extremadamente propenso a alucinaciones y tiende a generar retorica surrealista. Estas limitaciones son cruciales para cualquier desarrollador que considere utilizar este modelo en produccion.

El proceso de entrenamiento consistio en cuatro etapas de fine-tuning con diferentes datasets en griego, incluyendo GPT-4-Self-Instruct-Greek y alpaca-cleaned-gpt4-el, ademas de un dataset propio del autor. La licencia del modelo es glm-4, la misma que la del modelo base, lo que implica ciertas restricciones de uso comercial que deben revisarse antes de su adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en GLM-Edge-1.5B-Chat) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base GLM-Edge-1.5B-Chat soporta 8K tokens; no se indica si el fine-tuning lo modifica) |
| Tipos de cuantizacion | no disponible (el repositorio no publica pesos cuantizados; el modelo base tiene versiones GGUF y MLX) |
| Idiomas soportados | Griego (el), ingles (en), chino (zh) |
| Licencia | glm-4 (licencia propia de Zhipu AI) |
| Formato de pesos | safetensors (modelo base); el repositorio no especifica formato adicional |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura GLM-Edge-1.5B-Chat, un transformer decoder-only de 1.5B parametros desarrollado por Zhipu AI para inferencia en dispositivos edge. La arquitectura base incorpora las tecnicas de la serie GLM-4, optimizadas para eficiencia en entornos con recursos limitados.

El proceso de fine-tuning se realizo en cuatro etapas secuenciales, cada una con un dataset distinto y una tasa de aprendizaje decreciente:

1. Primer fine-tuning: dataset CausalLM/GPT-4-Self-Instruct-Greek, 1 epoca, learning rate 0,0002.
2. Segundo fine-tuning: primeras 10.000 filas de enchatted/alpaca-cleaned-gpt4-el, 1 epoca, learning rate 0,0002.
3. Tercer fine-tuning: filas 10.500 a 23.500 de enchatted/alpaca-cleaned-gpt4-el, 1 epoca, learning rate 0,0001.
4. Cuarto fine-tuning: dataset propio aiuser3993/Llama-Krikri-8B-Instruct-Chat, 1 epoca, learning rate 0,00005.

No se menciona el uso de tecnicas de RLHF o DPO en el proceso de entrenamiento. El autor no proporciona detalles sobre el numero total de tokens de entrenamiento ni la composicion exacta de los datasets mas alla de los nombres y rangos indicados.

## Capacidades

- Generacion de texto en griego moderno, con mejora significativa respecto al modelo base en este idioma.
- Soporte multilingue basico en ingles y chino, heredado del modelo base.
- Capacidad de seguir instrucciones en formato chat, mediante la plantilla de chat del modelo base.
- Generacion de texto con max_new_tokens configurable (el ejemplo de inferencia usa 128 tokens).
- Inferencia en dispositivos edge gracias a su tamano compacto de 1.5B parametros.
- No se menciona soporte para tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Generacion de contenido en griego para redes sociales o blogs: el modelo puede producir texto en griego con un estilo conversacional, aunque requiere revision humana debido a su tendencia a la incoherencia.
- Traduccion informal griego-ingles: puede servir como herramienta de traduccion aproximada para textos cortos, siempre que el resultado se verifique manualmente.
- Asistente de chat en griego para aplicaciones de demostracion: util para prototipos o demos donde la calidad del texto no sea critica y se priorice la velocidad de desarrollo.
- Generacion de respuestas en griego para sistemas de preguntas frecuentes: puede completar respuestas predefinidas con variaciones en griego, aunque las respuestas generadas libremente pueden contener alucinaciones.
- Entrenamiento de modelos mas grandes: el dataset de entrenamiento y el propio modelo pueden servir como punto de partida para fine-tuning adicional con datos de mayor calidad.
- Evaluacion de tecnicas de fine-tuning para idiomas de bajos recursos: el proceso de cuádruple fine-tuning documentado puede ser un caso de estudio para investigadores interesados en adaptar modelos a idiomas con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de evaluacion como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. La unica evaluacion cualitativa es la advertencia del propio autor sobre la falta de coherencia y la alta propension a alucinaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16, y alrededor de 1,5-2 GB en cuantizacion INT4/INT8 (si se generan versiones cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como A10 o T4.
- Compatibilidad con GPU de consumo: si, el modelo cabe en la mayoria de GPUs de consumo actuales.
- Opciones de despliegue: transformers (con device_map="auto"), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: no disponible. Al ser un modelo de 1.5B, se espera una latencia baja en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-Edge-1.5B-Chat (base) | 1.5B | 8K | en, zh | glm-4 | Modelo original de Zhipu AI, sin fine-tuning en griego |
| GLM-Edge-1.5B-Chat-Greek (este modelo) | 1.5B | no disponible | el, en, zh | glm-4 | Fine-tuning en griego, con problemas de coherencia |
| manaladan6/glm-edge-1.5b-chat | 1.5B | no disponible | no disponible | glm-4 | Otra variante del mismo modelo base, sin informacion detallada |

No se dispone de informacion suficiente sobre otras alternativas especificas para griego en el rango de 1.5B parametros. Modelos como Llama-3.2-1B o Qwen2.5-1.5B podrian ser comparables en tamano, pero no tienen soporte nativo para griego.

## Limitaciones y advertencias

- El autor advierte explicitamente que el modelo es "extremadamente propenso a alucinaciones" y a "retorica surrealista", lo que lo hace inadecuado para tareas que requieran precision factual.
- El modelo presenta "falta de coherencia" en sus respuestas, lo que puede manifestarse en textos inconsistentes o ilogicos.
- El proceso de fine-tuning se realizo con datasets generados por GPT-4, lo que puede introducir sesgos y errores del modelo profesor en los datos de entrenamiento.
- La licencia glm-4 es una licencia propia de Zhipu AI que puede imponer restricciones al uso comercial. Es necesario revisar los terminos completos de la licencia antes de cualquier despliegue en produccion.
- El modelo no ha sido evaluado con benchmarks estandar, por lo que no hay garantias objetivas de su rendimiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se proporcionan pesos cuantizados, por lo que el despliegue en dispositivos con recursos muy limitados requerira un proceso adicional de cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aiuser3993/GLM-Edge-1.5B-Chat-Greek
- Modelo base (hereticness): https://huggingface.co/hereticness/heretic_glm-edge-1.5b-chat
- Modelo base original (zai-org): https://huggingface.co/zai-org/glm-edge-1.5b-chat
- Repositorio GitHub de GLM-Edge: https://github.com/zai-org/GLM-Edge
- Version GGUF del modelo base: https://huggingface.co/zai-org/glm-edge-1.5b-chat-gguf
- Version MLX 8-bit del modelo base: https://huggingface.co/SirSahOl/glm-edge-1.5b-chat-mlx-8bit
- Dataset GPT-4-Self-Instruct-Greek: https://huggingface.co/datasets/CausalLM/GPT-4-Self-Instruct-Greek
- Dataset alpaca-cleaned-gpt4-el: https://huggingface.co/datasets/enchatted/alpaca-cleaned-gpt4-el
- Dataset Llama-Krikri-8B-Instruct-Chat: https://huggingface.co/datasets/aiuser3993/Llama-Krikri-8B-Instruct-Chat
- Licencia glm-4: https://huggingface.co/zai-org/glm-edge-1.5b-chat/raw/main/LICENSE
