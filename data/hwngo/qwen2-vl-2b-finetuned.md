# hwngo/Qwen2-VL-2B-Finetuned

## Resumen

hwngo/Qwen2-VL-2B-Finetuned es un modelo de vision-lenguaje (image-text-to-text) desarrollado por hwngo, que parte del modelo base unsloth/Qwen2-VL-2B-Instruct-bnb-4bit y se ha ajustado con la librería Unsloth y el framework TRL de HuggingFace. El modelo hereda la arquitectura Qwen2-VL, un transformer multimodal que procesa entradas de imagen y texto para generar respuestas textuales, con un tamaño total de 2.208.985.600 parametros (aproximadamente 2,2 mil millones). Se distribuye bajo licencia Apache-2.0 y solo soporta el idioma ingles.

La relevancia de este modelo reside en su tamaño compacto dentro de la familia Qwen2-VL, lo que permite su ejecucion en hardware de consumo, y en el hecho de que ha sido fine-tuned sobre una version cuantizada a 4 bits del modelo instruct original, lo que sugiere un proceso de ajuste optimizado para reducir el uso de memoria durante el entrenamiento. No obstante, la documentacion publica es minima: no se especifica el dataset utilizado ni el objetivo concreto del ajuste, por lo que las capacidades finales deben inferirse de su base y de la evaluacion directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (transformer multimodal) |
| Parametros totales | 2.208.985.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen2-VL-2B soporta hasta 128.000 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit; el fine-tune se distribuye en safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2-VL, un transformer multimodal que combina un encoder de vision con un decoder de lenguaje. La version original de Qwen2-VL-2B emplea un mecanismo de atencion de ventana deslizante y una estrategia de tokenizacion de imagenes con resolucion dinamica, lo que permite procesar imagenes de distintas dimensiones sin redimensionar. En este caso, el modelo parte de unsloth/Qwen2-VL-2B-Instruct-bnb-4bit, una version cuantizada a 4 bits (NormalFloat4) que reduce el uso de memoria en entrenamiento e inferencia.

El proceso de ajuste se realizo con la libreria Unsloth y el framework TRL de Hugging Face, que facilita el fine-tuning eficiente de modelos grandes mediante tecnicas como LoRA (Low-Rank Adaptation) o QLoRA. No se especifica en la documentacion publica el dataset utilizado, el numero de pasos de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla si el fine-tuning conserva la longitud de contexto completa de 128.000 tokens del modelo base o si se ha reducido.

## Capacidades

- Generacion de texto a partir de imagenes: el modelo puede describir el contenido de una imagen en lenguaje natural.
- Respuesta a preguntas visuales (VQA): dado un par imagen-pregunta, genera una respuesta textual.
- Conversacion multimodal: al estar basado en la familia instruct de Qwen2-VL, mantiene la capacidad de mantener dialogos de varios turnos con entrada visual.
- Soporte de tool calling y function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitado al ingles, segun la model card.
- Capacidades especiales: no se documenta modo de pensamiento, vision adicional, audio, ni otras modalidades.

## Casos de uso

- Descripcion de imagenes para accesibilidad: el modelo puede generar descripciones textuales de imagenes para usuarios con discapacidad visual, integrándose en aplicaciones web o moviles mediante una API de inferencia.
- Etiquetado automatico de imagenes en e-commerce: dado el formato compacto de 2,2 mil millones de parametros, se puede desplegar en infraestructura modesta para clasificar y etiquetar imagenes de productos, generando texto descriptivo o categorias.
- Asistente de soporte tecnico con imagenes: un usuario puede enviar una captura de pantalla de un error o una foto de un componente, y el modelo responde con una explicacion textual basada en la imagen, integrándose en un chatbot de soporte.
- Anotacion de datos para datasets de vision: el modelo puede generar descripciones preliminares de imagenes que luego se revisan y corrigen manualmente, acelerando la creacion de datasets para entrenar modelos mas grandes.
- Educacion interactiva: en una aplicacion educativa, el modelo puede recibir una imagen de un problema matematico o un diagrama y explicar los pasos de resolucion en texto, ayudando a estudiantes.
- Demostraciones y prototipos de I+D: por su tamano reducido y licencia permisiva, es adecuado para experimentos academicos que necesiten un modelo VLM de referencia rapida para comparar arquitecturas o tecnicas de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta metricas de MMLU, HumanEval, GSM8K, ni evaluaciones especificas de tareas visuales (como VQAv2, GQA, etc.). Tampoco, se ofrecen comparaciones con el modelo base o con otros modelos de la familia Qwen2-VL.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,2 mil millones de parametros en precision completa (fp16), se necesitan aproximadamente 4,5 GB de VRAM; con cuantizacion a 8 bits, alrededor de 2,5 GB; con cuantizacion a 4 bits, aproximadamente 1,5 GB.
- GPUs recomendadas: el modelo cabe en tarjetas de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB). Para produccion con alta concurrencia, se recomienda A10, A100 o H100.
- Compatibilidad con GPU de consumo: si, es posible ejecutar el modelo en GPUs de consumo con cuantizacion (por ejemplo, GGUF o bitsandbytes) sin problemas de memoria.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face Text Generation Inference (TGI), o directamente con la libreria transformers.
- Latencia y throughput estimados: no disponible. No se publicaron mediciones de latencia o throughput para este modelo especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hwngo/Qwen2-VL-2B-Finetuned | 2,2 B | no disponible | Apache-2.0 | Hugging Face |
| Qwen2-VL-2B (base) | 2,2 B | 128K | Apache-2.0 | Hugging Face, ModelScope |
| Qwen2-VL-7B | 7,6 B | 128K | Apache-2.0 | Hugging Face, ModelScope |
| LLaVA-1.6-7B | 7 B | 32K | Apache-2.0 | Hugging Face |

La comparativa directa con el modelo base Qwen2-VL-2B es la mas relevante, ya que el fine-tune parte de una version cuantizada de este. El modelo base ofrece una ventana de contexto de 128K tokens y un rendimiento documentado en tareas de VQA, mientras que el fine-tune no publica datos de contexto ni de rendimiento. En cuanto a parametros, el modelo de hwngo es identico al base (2,2 B), pero el fine-tune no ofrece evidencia publica de mejoras sobre el. Frente a modelos como LLaVA-1.6-7B, el modelo de hwngo es mas ligero y permite una ejecucion mas rapida en hardware de consumo, pero carece de la documentacion de benchmarks que respalda a LLaVA.

## Limitaciones y advertencias

- Documentacion insuficiente: no se especifican el dataset, el objetivo del fine-tuning ni los resultados de evaluacion, lo que impide conocer las mejoras reales sobre el modelo base.
- Riesgo de alucinacion: como cualquier modelo de lenguaje multimodal, puede generar descripciones o respuestas incorrectas sobre imagenes, especialmente en casos ambiguos o de baja resolucion.
- Idioma limitado: el modelo solo soporta ingles, lo que limita su uso en entornos multilingues.
- Sesgos conocidos: no se documentan sesgos especificos, pero los modelos basados en Qwen2-VL pueden heredar sesgos de los datos de entrenamiento del modelo base.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de los terminos del modelo base (Qwen2-VL-2B) y de la version de unsloth, que tambien usan Apache-2.0.
- Produccion: al no tener benchmarks ni evaluaciones publicadas, no se recomienda su uso directo en produccion sin una evaluacion previa en el dominio especifico de aplicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hwngo/Qwen2-VL-2B-Finetuned
- Modelo base Qwen2-VL-2B (original): https://huggingface.co/Qwen/Qwen2-VL-2B
- Modelo base unsloth (bnb-4bit): https://huggingface.co/unsloth/Qwen2-VL-2B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Version GGUF del modelo base: https://huggingface.co/ggml-org/Qwen2-VL-2B-Instruct-GGUF
- Repositorio de fine-tuning de la serie Qwen-VL: https://github.com/2U1/Qwen-VL-Series-Finetune
- Repositorio de fine-tuning de Qwen2-VL: https://github.com/zhangfaen/finetune-Qwen2-VL
