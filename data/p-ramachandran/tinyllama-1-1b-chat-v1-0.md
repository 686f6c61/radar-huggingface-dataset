# p-ramachandran/TinyLlama-1.1B-Chat-v1.0

## Resumen

TinyLlama-1.1B-Chat-v1.0 es la variante conversacional del proyecto TinyLlama, un modelo de lenguaje de 1.100.048.384 parametros desarrollado por el equipo de TinyLlama (jzhang38) y publicado originalmente en HuggingFace. El repositorio analizado aqui es una copia subida por el usuario p-ramachandran bajo la misma licencia Apache 2.0. El modelo parte de un checkpoint preentrenado sobre 3 billones de tokens y se afina con el recetario de Zephyr (SFT sobre UltraChat y alineamiento con DPO sobre UltraFeedback).

El objetivo del proyecto es ofrecer un modelo Llama compacto que pueda ejecutarse en hardware de consumo manteniendo la compatibilidad total con el ecosistema Llama 2 (misma arquitectura y mismo tokenizador). Esto lo hace util para prototipado rapido, despliegues en el borde y entornos con restricciones severas de VRAM, aunque su capacidad de razonamiento queda muy por debajo de modelos de mayor tamano.

La relevancia actual reside en su bajo coste de inferencia y su licencia permisiva, que permite uso comercial sin restricciones adicionales. No obstante, el modelo solo soporta ingles y su ventana de contexto es limitada, por lo que debe evaluarse cuidadosamente antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama 2 (RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el proyecto TinyLlama usa 2048 tokens en la version base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (compatible con cuantizacion a 8 y 4 bits mediante herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TinyLlama emplea exactamente la misma arquitectura y tokenizador que Llama 2: un transformer decoder-only con atencion multi-cabeza, embeddings rotatorios (RoPE), activacion SwiGLU y normalizacion RMSNorm. El preentrenamiento se realizo sobre 3 billones de tokens con una mezcla que incluye SlimPajama-627B, starcoderdata y otros corpus, segun los datasets declarados en la model card. El entrenamiento completo se planifico para 90 dias sobre 16 GPU A100 de 40 GB, comenzando el 1 de septiembre de 2023.

La version chat parte del checkpoint intermedio `TinyLlama-1.1B-intermediate-step-1431k-3T` y sigue la receta de HuggingFace Zephyr: primero un ajuste supervisado (SFT) sobre una variante de UltraChat (dialogos sinteticos generados por ChatGPT) y despues un alineamiento con DPO usando el `DPOTrainer` de TRL sobre UltraFeedback (64.000 prompts con completaciones clasificadas por GPT-4). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles con formato conversacional multi-turno mediante plantilla de chat (`<|system|>`, `<|user|>`, `<|assistant|>`).
- Generacion de codigo basico en Python y otros lenguajes presentes en starcoderdata, incluyendo ejemplos sencillos como funciones de Fibonacci.
- Razonamiento de sentido comun y respuesta a preguntas simples, limitado por el tamano del modelo.
- Ajuste por instrucciones gracias al SFT sobre UltraChat y al alineamiento DPO sobre UltraFeedback.
- Soporte de plantilla de chat compatible con `transformers` (>=4.34) y `apply_chat_template`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: permite validar flujos de chat multi-turno en local con muy poca VRAM antes de migrar a un modelo mayor, gracias a su compatibilidad directa con el ecosistema Llama.
- Generacion de codigo en entornos con recursos limitados: util para autocompletar funciones sencillas o generar snippets en editores ligeros y entornos de desarrollo embebidos donde no cabe un modelo de 7B.
- Clasificacion y etiquetado de texto en ingles: se puede usar como modelo base para tareas de extraccion de informacion o categorizacion con fine-tuning ligero sobre datasets propios.
- Despliegue en el borde (edge computing): su tamano de 2,2 GB en safetensors permite ejecutarlo en dispositivos con poca memoria, como mini-PC o placas con GPU integrada, para tareas de generacion de texto offline.
- Educacion e investigacion: sirve como banco de pruebas para experimentar con SFT, DPO y cuantizacion sin necesidad de infraestructura costosa.
- Generacion de respuestas en chatbots de bajo coste: adecuado para demos, pruebas A/B de prompts y sistemas internos donde la latencia y el coste importan mas que la calidad maxima.
- Filtrado y resumen de textos cortos en ingles: puede resumir parrafos o extraer ideas clave en pipelines de preprocesamiento donde un modelo mayor resultaria sobredimensionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,2 GB de pesos mas overhead de activaciones y cache KV, en torno a 3-4 GB en total segun la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,2-1,5 GB; en 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090; tambien funciona en GPU integradas y en CPU.
- Cabe holgadamente en GPU consumer, incluso en tarjetas con 4-6 GB de VRAM.
- Opciones de despliegue: `transformers` con `pipeline` (requiere transformers >= 4.34), vLLM, llama.cpp, Ollama y TGI son compatibles por herencia de la arquitectura Llama, aunque la informacion proporcionada solo documenta el uso via `transformers`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0 (este) | 1,1B | no disponible | Apache 2.0 | en | HuggingFace |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 (original) | 1,1B | 2048 (segun proyecto) | Apache 2.0 | en | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | multilingue | HuggingFace |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | en (principalmente) | HuggingFace |

La comparativa con Qwen2.5 y SmolLM2 se ofrece como referencia de categoria (modelos densos de 1-2B parametros); los datos de contexto y licencia de esos modelos no forman parte de la informacion proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Solo soporta ingles; no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion y de respuestas incorrectas en tareas de razonamiento complejo, matematicas avanzadas o conocimiento factual, dado su tamano de 1,1B parametros.
- La longitud de contexto no se especifica en la informacion disponible; el proyecto base usa 2048 tokens, lo que limita conversaciones y documentos largos.
- El modelo esta alineado con DPO sobre UltraFeedback, por lo que puede heredar sesgos presentes en ese dataset y en UltraChat.
- No dispone de soporte documentado de tool calling, agentes, vision ni audio, lo que restringe su uso en pipelines agenticos modernos.
- Aunque la licencia Apache 2.0 permite uso comercial, el repositorio analizado es una copia subida por un tercero (p-ramachandran) con 0 descargas y 0 likes; conviene usar el repositorio oficial de TinyLlama para produccion y verificar la integridad de los pesos.
- El pipeline no esta declarado en la informacion de HuggingFace, por lo que algunas herramientas de descubrimiento pueden no detectarlo automaticamente.

## Enlaces

- Repositorio analizado: https://huggingface.co/p-ramachandran/TinyLlama-1.1B-Chat-v1.0
- Repositorio oficial del modelo: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Checkpoint base intermedio: https://huggingface.co/TinyLlama/TinyLlama-1.1B-intermediate-step-1431k-3T
- Repositorio GitHub del proyecto: https://github.com/jzhang38/TinyLlama
- Dataset UltraChat: https://huggingface.co/datasets/stingning/ultrachat
- Dataset UltraFeedback: https://huggingface.co/datasets/openbmb/UltraFeedback
- Receta de entrenamiento Zephyr: https://huggingface.co/HuggingFaceH4/zephyr-7b-alpha
- Libreria TRL: https://github.com/huggingface/trl
- Documentacion de plantillas de chat de transformers: https://huggingface.co/docs/transformers/main/en/chat_templating
