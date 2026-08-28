# SHIKARI2/Malvos-32B-Merged

## Resumen

Malvos-32B-Merged es un modelo de lenguaje de 32.763 millones de parámetros desarrollado por SHIKARI2, publicado en Hugging Face con licencia Apache 2.0. Según la model card, se trata de un modelo afinado (fine-tuning) a partir de unsloth/DeepSeek-R1-Distill-Qwen-32B-unsloth-bnb-4bit, una versión cuantizada a 4 bits del modelo DeepSeek-R1-Distill-Qwen-32B. El nombre "Merged" sugiere una fusión de pesos, pero no se ha documentado públicamente qué modelos se combinaron ni el proceso exacto. La ficha indica que fue entrenado con las librerías Unsloth y TRL de Hugging Face, aunque no se ofrecen detalles sobre el dataset, el número de tokens o las técnicas de alineación utilizadas.

El modelo está orientado a generación de texto y conversación, con soporte declarado para inglés. A pesar de su tamaño (32B), no se han publicado resultados de benchmarks ni evaluaciones independientes, lo que limita su validación objetiva. Su relevancia actual reside en ofrecer una alternativa de código abierto con licencia permisiva, aunque su adopción práctica dependerá de pruebas adicionales que confirmen su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2, según etiqueta "qwen2") |
| Parametros totales | 32.763.876.352 (32,76B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (el repositorio contiene safetensors; el tamaño de 65,5 GB sugiere precisión FP16 o BF16) |
| Idiomas soportados | Inglés (según campo "language: en") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Malvos-32B-Merged no está documentada explícitamente. La etiqueta "qwen2" indica que se basa en la arquitectura Qwen2, pero no se detallan variantes como atención lineal o mecanismos híbridos. Al derivar de DeepSeek-R1-Distill-Qwen-32B, es probable que herede la estructura de un transformer denso con 32B parámetros, pero no hay confirmación oficial.

El entrenamiento se realizó mediante fine-tuning con las librerías Unsloth y TRL de Hugging Face, como se indica en la model card. No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF, DPO o SFT. Tampoco se especifica si el proceso de "merge" implicó la combinación de múltiples modelos o solo la conversión de pesos. Toda esta información permanece no disponible.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente en inglés, dado su pipeline de text-generation.
- Conversación: está etiquetado como "conversational", lo que sugiere aptitud para diálogos multi-turno.
- Razonamiento: al estar basado en DeepSeek-R1-Distill, es plausible que conserve cierta capacidad de razonamiento paso a paso, pero no hay evidencia publicada.
- Tool calling y function calling: no se menciona soporte explícito en la documentación.
- Capacidades multilingües: solo se declara inglés, por lo que no se garantiza un rendimiento fiable en otros idiomas.
- Modos especiales (vision, audio, thinking): no se indica ninguno.

## Casos de uso

- Asistente de conversación en inglés: el modelo puede integrarse en chatbots o asistentes virtuales para mantener diálogos en inglés, aprovechando su naturaleza conversacional y su licencia Apache 2.0 que permite uso comercial.
- Generación de contenido textual: útil para redactar artículos, resúmenes o respuestas automáticas en inglés, siempre que se valide su calidad mediante pruebas previas.
- Prototipado de aplicaciones NLP: al ser de 32B, puede servir como base para experimentos de generación de texto donde se requiera un modelo de tamaño medio sin costes de licencia.
- Fine-tuning adicional: al estar disponible en formato safetensors, puede afinarse con datasets específicos para dominios concretos (legal, médico, técnico) usando técnicas como LoRA o QLoRA.
- Investigación académica: su licencia abierta permite su uso en estudios comparativos de modelos de 32B, aunque sin benchmarks publicados será necesario evaluarlo internamente.
- Despliegue en entornos con GPU de alta capacidad: dado su tamaño, es adecuado para servidores con múltiples GPUs o GPUs con gran memoria (A100 80GB, H100), donde se pueda cargar en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco hay comparaciones con otros modelos en la documentación. Por tanto, no es posible valorar su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el repositorio pesa 65,5 GB, se asume que los pesos están en FP16 o BF16 (32B × 2 bytes ≈ 64 GB). Para cargar el modelo completo en FP16 se necesitan al menos 64 GB de VRAM. Con cuantización a 8 bits se reduciría a unos 32 GB, y a 4 bits a unos 16 GB, aunque no se proporcionan versiones cuantizadas oficiales.
- GPU recomendadas: para FP16, se requieren GPUs como A100 80GB, H100 80GB o múltiples RTX 4090 (24GB) con sharding. Para 4 bits, una RTX 4090 o A6000 (48GB) podría ser suficiente.
- Si cabe en consumer GPU: solo con cuantización agresiva (4 bits) y posiblemente con offloading a CPU. No es viable en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference) o llama.cpp si se convierte a GGUF. También es compatible con Ollama si se genera un archivo Modelfile.
- Latencia y throughput: no se dispone de mediciones. Para un modelo de 32B en FP16, se espera una latencia de varios segundos por token en una sola GPU, mejorando con batching y optimizaciones como vLLM.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa objetiva. El modelo base DeepSeek-R1-Distill-Qwen-32B es su referencia más directa, pero no se han publicado métricas comparativas. Otras alternativas de 32B como Qwen2.5-32B o Mixtral-8x7B (aunque este último es MoE) podrían servir, pero sin datos de rendimiento de Malvos-32B-Merged, la comparación sería especulativa. Por tanto, se indica que no hay comparativa disponible.

## Limitaciones y advertencias

- Falta de documentación: no se detallan el proceso de entrenamiento, el dataset ni las técnicas de alineación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Sesgos y alucinaciones: al no conocerse los datos de entrenamiento, no se pueden evaluar posibles sesgos. Como todo LLM, existe riesgo de generar información falsa o inventada.
- Limitaciones de idioma: solo se declara inglés; su rendimiento en otros idiomas es incierto y probablemente deficiente.
- Contexto limitado: no se especifica la longitud de contexto; si hereda la de Qwen2, podría ser de hasta 128k tokens, pero no está confirmado.
- Riesgos de producción: sin benchmarks ni pruebas de robustez, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.
- Licencia: aunque es Apache 2.0, el modelo base DeepSeek-R1-Distill-Qwen-32B tiene su propia licencia (MIT para DeepSeek-R1-Distill, según la documentación original), pero la combinación resultante se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene verificar los términos de las dependencias.

## Enlaces

- Hugging Face: https://huggingface.co/SHIKARI2/Malvos-32B-Merged
- Repositorio de Unsloth (librería usada para el entrenamiento): https://github.com/unslothai/unsloth
- Modelo base en Hugging Face: https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-32B-unsloth-bnb-4bit

No se han encontrado papers, blogs o demos adicionales en la búsqueda web.
