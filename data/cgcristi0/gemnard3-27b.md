# cgcristi0/gemnard3-27b

## Resumen

Gemnard3-27b es un modelo de lenguaje fine-tuneado a partir de `google/gemma-3-27b-it`, desarrollado por el usuario cgcristi0. El objetivo principal es crear una "persona" conversacional con un tono humorístico y natural, entrenada sobre un dataset propio llamado Gemnard3 que enfatiza chistes, longitudes de respuesta variadas, formato de texto natural y uso de emojis. El modelo está pensado para chatbots y asistentes que necesiten un estilo cercano y desenfadado.

Técnicamente, se trata de una adaptación mediante LoRA (Low-Rank Adaptation) sobre el modelo base de Google, que cuenta con 28.418.976.512 parámetros (28,4 mil millones). El release incluye tanto los pesos fusionados (safetensors) como una cuantización GGUF Q4_K_M, facilitando su despliegue en entornos con recursos limitados. El modelo base hereda una ventana de contexto de 128k tokens, aunque no se ha confirmado si el ajuste fino la modifica.

La relevancia de este modelo radica en su enfoque específico para conversaciones lúdicas y personalizadas, un nicho dentro de los LLMs de código abierto. Sin embargo, al ser una versión temprana con cero descargas y sin benchmarks publicados, su calidad y comportamiento deben evaluarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Gemma 3 27B) |
| Parámetros totales | 28.418.976.512 (28,4B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k (heredado del modelo base) |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible (no especificado por el autor) |
| Licencia | Gemma |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 3 27B, un transformer multimodal de Google que procesa texto e imágenes (aunque el fine-tune no menciona entrenamiento específico en visión). La adaptación se realizó mediante un adaptador LoRA, cuyos pesos se fusionaron posteriormente con los del modelo base para generar los pesos completos. El dataset Gemnard3 se centra en conversaciones con humor, respuestas de longitud variable y un uso natural de emojis, lo que indica un entrenamiento orientado a la personalidad más que a tareas técnicas.

No se proporcionan detalles sobre el número de tokens de entrenamiento, el método de optimización (RLHF, DPO) ni la composición exacta del dataset. El autor incluye "pruebas de humo" grabadas como ejemplos de uso, pero no constituyen una certificación de seguridad ni de rendimiento.

## Capacidades

- Generación de texto conversacional con tono humorístico y natural, adaptado a respuestas cortas y variadas.
- Uso de emojis de forma contextual y moderada (según el dataset).
- Capacidades heredadas del modelo base: razonamiento, generación de código, matemáticas y comprensión de texto multilingüe (aunque no se confirma en este fine-tune).
- Soporte de tool calling y function calling: no especificado en la documentación, pero el modelo base Gemma 3 27B IT lo incluye; probablemente se conserva.
- Capacidades multimodales (entrada de imagen): no confirmado para este fine-tune, aunque el modelo base lo permite.
- Despliegue en diferentes formatos (safetensors y GGUF) para distintas plataformas de inferencia.

## Casos de uso

- **Chatbots de entretenimiento**: el modelo es adecuado para aplicaciones de mensajería o redes sociales donde se busca una conversación amena y con personalidad, usando su dataset específico de chistes y tono natural.
- **Asistentes virtuales con estilo desenfadado**: puede integrarse en asistentes de voz o texto para ofrecer respuestas menos formales y más cercanas, mejorando la experiencia de usuario en entornos de ocio.
- **Generación de contenido creativo**: escribir guiones cortos, diálogos cómicos o respuestas para redes sociales, gracias a su capacidad de generar texto con variaciones de longitud y emojis.
- **Pruebas de concepto en investigación de fine-tuning**: al ser un ejemplo de adaptación LoRA sobre un modelo grande, puede servir como referencia para estudiar el efecto de datasets específicos en el comportamiento de Gemma 3.
- **Integración en plataformas de agentes**: si se confirma el soporte de tool calling, puede utilizarse para agentes que interactúen con APIs de manera natural y con un toque de humor.
- **Despliegue en entornos con recursos limitados**: la versión GGUF Q4_K_M permite ejecutar el modelo en GPUs de consumo (16 GB VRAM) sin sacrificar demasiado la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo. El autor solo menciona "pruebas de humo" que son ejemplos de conversación, no mediciones de rendimiento. Por tanto, no es posible comparar objetivamente su calidad con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para la cuantización Q4_K_M, se estima que el modelo ocupa aproximadamente 14-16 GB de VRAM (basado en el tamaño de 28,4B parámetros en FP16 y la reducción de la cuantización). Sin embargo, no hay datos oficiales del autor.
- **GPU recomendadas**: una RTX 4090 (24 GB) o superior es suficiente para ejecutar la versión Q4_K_M en fp16. Para la versión completa (safetensors) se requiere una GPU con al menos 48 GB de VRAM, como A100 o H100.
- **¿Cabe en consumer GPU?**: Sí, la versión Q4_K_M cabe en GPUs de consumo con 16 GB de VRAM, como la RTX 4080 o RTX 4090.
- **Opciones de despliegue**: dado que se proporciona GGUF, es compatible con llama.cpp, Ollama, vLLM (con conversión) y TGI. La versión safetensors puede cargarse con Hugging Face Transformers o vLLM.
- **Latencia y throughput**: no se proporcionan datos específicos. Para un modelo de 28B, la latencia en una RTX 4090 con Q4 suele estar en el rango de 10-20 tokens por segundo, pero depende del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Sin embargo, se puede comparar con el modelo base `google/gemma-3-27b-it` y con otros fine-tunes de chat como `Llama-3-8B-Instruct` o `Mistral-7B-Instruct` (aunque estos son más pequeños). La siguiente tabla muestra una comparativa orientativa:

| Modelo | Parámetros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| gemnard3-27b (este) | 28,4B | 128k | Gemma | Conversación con humor |
| google/gemma-3-27b-it | 27B | 128k | Gemma | Multimodal, general |
| Llama-3-8B-Instruct | 8B | 8k | Llama 3 | Instrucción general |

El modelo base es superior en capacidades generales, pero el fine-tune aporta un estilo específico. Los modelos de 8B son más ligeros y rápidos, pero con menor calidad en razonamiento.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un fine-tune de Gemma 3, hereda los sesgos del modelo base. El dataset específico puede introducir sesgos adicionales en el tono y contenido.
- **Riesgo de alucinación**: no se han realizado evaluaciones de veracidad; el modelo puede generar información falsa con confianza.
- **Limitaciones de contexto**: la ventana de 128k es amplia, pero el fine-tune no garantiza que el modelo utilice eficientemente contextos largos.
- **Restricciones de licencia**: la licencia Gemma es de código abierto, pero tiene condiciones de uso aceptable (por ejemplo, no usar para fines militares o vigilancia masiva). Se debe revisar la licencia completa de Google.
- **Falta de validación**: el modelo tiene 0 descargas y 0 likes, y no incluye benchmarks ni certificación de seguridad. Las "pruebas de humo" son solo ejemplos de conversación, no garantías de rendimiento.
- **Idiomas**: no se especifica si el modelo está optimizado para español u otros idiomas. El modelo base soporta más de 140 idiomas, pero el fine-tune puede no haber sido entrenado para todos ellos.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/cgcristi0/gemnard3-27b)
- [Modelo base: google/gemma-3-27b-it](https://huggingface.co/google/gemma-3-27b-it)
- [Versión 4b del mismo autor (gemnard3-4b)](https://huggingface.co/cgcristi0/gemnard3-4b)
- [Gemma 3 27B en Ollama](https://ollama.com/library/gemma3:27b)
- [Gemma 3 27B en AI Model Index](https://www.modelindex.org/index.php/model/gemma-3-27b/)
- [Gemma 3 27B en Jetson AI Lab](https://www.jetson-ai-lab.com/models/gemma3-27b/)
