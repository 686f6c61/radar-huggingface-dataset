# alekshandru/gemma-4-12B-it-qat-GGUF

## Resumen

El modelo `alekshandru/gemma-4-12B-it-qat-GGUF` es una conversión al formato GGUF del checkpoint oficial `google/gemma-4-12B-it-qat-q4_0-unquantized`, perteneciente a la familia Gemma 4 de Google DeepMind. Esta versión concreta ha sido generada por el usuario `alekshandru` a partir de los pesos publicados por Google, y está optimizada mediante Quantization-Aware Training (QAT), una técnica que entrena el modelo con cuantización simulada para preservar la calidad del bfloat16 reduciendo drásticamente los requisitos de memoria en inferencia.

Se trata de un modelo denso de aproximadamente 11,9 mil millones de parámetros, multimodal (procesa texto, imagen y audio) y con capacidad de razonamiento configurable mediante modos de pensamiento. La familia Gemma 4 está diseñada para cubrir desde dispositivos móviles hasta servidores, y este tamaño de 12B es especialmente adecuado para GPUs de consumo y entornos de producción con requisitos moderados. La conversión GGUF permite ejecutarlo con llama.cpp, Ollama, LM Studio y otras herramientas compatibles con el ecosistema de cuantización.

La relevancia actual de este modelo radica en que combina las capacidades multimodales y de razonamiento de la última generación de Gemma con una licencia Apache 2.0, lo que facilita su uso comercial sin restricciones. Además, el formato GGUF con cuantización QAT ofrece un equilibrio óptimo entre calidad y eficiencia, y el soporte de decodificación especulativa (MTP) incluido en el repositorio mejora la latencia en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4 de Google DeepMind) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | 128K tokens (modelos pequeños de la familia Gemma 4; la familia soporta hasta 256K) |
| Tipos de cuantizacion | GGUF (Q4_0, Q4_K y otras variantes; el checkpoint base es QAT Q4_0) |
| Idiomas soportados | Más de 140 idiomas (segun la documentacion oficial de Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el checkpoint base no cuantizado) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it-qat-q4_0-unquantized` forma parte de la familia Gemma 4, que incluye tanto arquitecturas densas como MoE. Este checkpoint de 12B es denso y ha sido entrenado con Quantization-Aware Training (QAT), un proceso que integra la cuantización en el propio entrenamiento para minimizar la pérdida de calidad frente al bfloat16. El resultado es un modelo que mantiene un rendimiento cercano al de precisión completa pero con una huella de memoria significativamente menor.

La arquitectura interna no se detalla en la información proporcionada, pero se sabe que la familia Gemma 4 incorpora avances en atención eficiente y soporte multimodal nativo (texto, imagen y audio en los modelos de 12B y menores). El modelo incluye un drafter MTP (Multi-Token Prediction) en el repositorio, que permite decodificación especulativa: el drafter predice varios tokens a la vez y el modelo principal los verifica, acelerando la generación sin cambiar el resultado. Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto, razonamiento y resolución de problemas con un modo de pensamiento configurable (thinking mode) que permite activar o desactivar el razonamiento explícito.
- Procesamiento multimodal: entrada de texto, imagen (con soporte de resolución y relación de aspecto variable) y audio (en los modelos de 12B y menores), con salida de texto.
- Generación de código y soporte de tool calling / function calling, como se muestra en el ejemplo de Unsloth Studio con el modelo E4B.
- Capacidad para tareas de agente y razonamiento multi-paso gracias a la ventana de contexto larga (128K tokens) y al soporte de herramientas.
- Multilingüismo en más de 140 idiomas, lo que lo hace adecuado para aplicaciones internacionales.
- Compatibilidad con decodificación especulativa mediante el drafter MTP incluido, que reduce la latencia en inferencia.

## Casos de uso

- Asistentes virtuales multimodales: el modelo puede procesar imágenes y audio junto con texto, permitiendo crear asistentes que entiendan capturas de pantalla, diagramas o instrucciones habladas. Su contexto de 128K tokens permite mantener conversaciones largas con historial completo.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, revisar pull requests o generar documentación técnica. La cuantización Q4_0 permite ejecutarlo en GPUs de consumo sin sacrificar demasiada calidad.
- Atención al cliente automatizada: su capacidad multilingüe y su contexto largo lo hacen adecuado para gestionar tickets de soporte multi-turno en varios idiomas, manteniendo el contexto de la conversación durante horas.
- Análisis de documentos técnicos: al aceptar imágenes y texto, puede extraer información de PDFs escaneados, capturas de pantalla o diagramas, y resumir o responder preguntas sobre ellos.
- Razonamiento y resolución de problemas matemáticos o lógicos: el modo de pensamiento configurable permite activar cadenas de razonamiento explícitas para tareas que requieren pasos intermedios, como planificación o verificación de hipótesis.
- Despliegue en entornos con recursos limitados: gracias al formato GGUF y a la cuantización QAT, puede ejecutarse en portátiles con GPU de 8-12 GB de VRAM o incluso en CPU con llama.cpp, lo que lo hace viable para aplicaciones locales o edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas comparativas (MMLU, HumanEval, GSM8K, etc.) para esta conversión específica. Para datos de rendimiento del modelo base, se recomienda consultar la documentación oficial de Gemma 4 en el blog de Google DeepMind o la colección de HuggingFace de Google.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_0, los pesos ocupan aproximadamente 6-7 GB. Sumando la caché KV para contexto largo (128K tokens), se recomiendan al menos 12 GB de VRAM para uso cómodo con contexto completo. Con cuantizaciones más agresivas (Q4_K_S, Q3_K) podría caber en 8 GB.
- GPU recomendadas: NVIDIA RTX 3060 12GB, RTX 4070, RTX 4090, A10, A100. También funciona en Apple Silicon (M1 Pro o superior) con Metal.
- Sí cabe en GPUs de consumo: una RTX 3060 12GB o superior puede ejecutar el modelo con cuantización Q4_0 y contexto moderado.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, vLLM (con conversión a formato compatible), TGI (a través de la colección de Unsloth), y Unsloth Studio para fine-tuning.
- Latencia y throughput: no se han publicado cifras exactas. Con decodificación especulativa (MTP), se espera una mejora de 1.5-2x en tokens por segundo frente a la generación autoregresiva estándar. En una RTX 4090, se estima un throughput de 50-80 tokens/s con Q4_0, aunque esto es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Gemma 4 12B (este) | ~11,9B | 128K | Sí (texto, imagen, audio) | Apache 2.0 | GGUF, safetensors |
| Gemma 3 12B | ~12B | 128K | Sí (texto, imagen) | Gemma Terms of Use | GGUF, safetensors |
| Llama 3.1 8B | 8B | 128K | No | Llama 3.1 Community License | GGUF, safetensors |
| Qwen 2.5 14B | 14B | 128K | No | Apache 2.0 | GGUF, safetensors |

El Gemma 4 12B se distingue por su soporte de audio nativo (no presente en Gemma 3 ni en Llama 3.1) y por la licencia Apache 2.0, que elimina restricciones de uso comercial. Frente a Qwen 2.5 14B, ofrece multimodalidad y un contexto similar, aunque con menos parámetros. La cuantización QAT de esta versión proporciona una ventaja de eficiencia frente a cuantizaciones post-entrenamiento estándar.

## Limitaciones y advertencias

- Al ser un modelo multimodal, puede presentar alucinaciones visuales o interpretaciones erróneas de imágenes complejas, especialmente con resoluciones bajas o contenido ambiguo.
- La ventana de contexto de 128K tokens, aunque amplia, puede degradar la calidad de atención en los tramos más lejanos; se recomienda probar con contextos largos reales antes de desplegar en producción.
- No se han publicado resultados de benchmarks para esta conversión GGUF concreta; el rendimiento puede variar ligeramente respecto al checkpoint oficial en bfloat16.
- El modelo ha sido convertido por un tercero (`alekshandru`); aunque el repositorio parece fiel al original de Unsloth, se recomienda verificar la integridad de los archivos y contrastar con la colección oficial de Unsloth o Google.
- La licencia Apache 2.0 permite uso comercial, pero se debe cumplir con la política de uso aceptable de Google para los modelos Gemma (consultar la documentación oficial).
- El soporte de audio está limitado a los modelos de 12B y menores; en este modelo está presente, pero la calidad puede ser inferior a la de modelos específicos de audio.
- El modo de pensamiento (thinking mode) puede generar respuestas más largas y aumentar la latencia; es recomendable desactivarlo en aplicaciones en tiempo real si no es necesario.

## Enlaces

- Repositorio HuggingFace: [alekshandru/gemma-4-12B-it-qat-GGUF](https://huggingface.co/alekshandru/gemma-4-12B-it-qat-GGUF)
- Modelo base oficial: [google/gemma-4-12B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized)
- Colección de Gemma 4 QAT de Unsloth: [unsloth/gemma-4-qat](https://huggingface.co/collections/unsloth/gemma-4-qat)
- Guía de ejecución de Gemma 4 QAT: [unsloth.ai/docs/models/gemma-4/qat](https://unsloth.ai/docs/models/gemma-4/qat)
- Blog de lanzamiento de Gemma 4: [blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/)
- Documentación oficial de Gemma: [ai.google.dev/gemma/docs/core](https://ai.google.dev/gemma/docs/core)
- Repositorio de Unsloth en GitHub: [github.com/unslothai/unsloth](https://github.com/unslothai/unsloth/)
