# HauhauCS/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP

## Resumen

Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP es una adaptación del modelo Gemma 4 31B de Google DeepMind, publicada por el usuario HauhauCS en Hugging Face. Su objetivo principal es eliminar los rechazos de seguridad del modelo original manteniendo intactas las capacidades de instrucción, razonamiento y generación. Según el autor, el modelo presenta 0 rechazos en 465 pruebas automatizadas, aunque admite que algunos casos límite pueden requerir un re-planteamiento de la pregunta.

Técnicamente, se construye sobre los pesos QAT (quantization-aware training) oficiales de Gemma 4 31B, lo que permite que la cuantización a 4 bits conserve una calidad cercana a la de precisión completa. El modelo es denso, con aproximadamente 30,7 mil millones de parámetros, una ventana de contexto de 256K tokens y capacidades multimodales de visión mediante un proyector mmproj. Incluye además una cabeza de predicción multi-token (MTP) para decodificación especulativa, que acelera la generación alrededor de un 53% sin alterar la salida.

La variante "Balanced" está optimizada para tareas de coding agéntico, razonamiento, escritura creativa y escenarios que requieren fiabilidad. El modelo se distribuye únicamente en formato GGUF (Q4_K_M) y es compatible con llama.cpp, LM Studio, Jan y koboldcpp. Su relevancia radica en ofrecer una alternativa sin censura de un modelo de última generación, con rendimiento de 4 bits de alta calidad y velocidad mejorada mediante MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 31B) |
| Parametros totales | 30.697.345.596 (~31B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (texto), BF16 (mmproj de visión), MTP draft head (280 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (licencia de Google Gemma) |
| Formato de pesos | GGUF (texto), GGUF (mmproj vision), GGUF (MTP) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 4 31B, un transformer denso de 31 mil millones de parámetros desarrollado por Google DeepMind. No se trata de un modelo MoE, sino de una red densa con atención estándar. La característica principal de esta adaptación es que parte de los pesos QAT oficiales, es decir, pesos que ya han sido entrenados con cuantización consciente, lo que explica que la versión Q4_K_M mantenga una calidad cercana a la de precisión completa. El autor indica que no se han modificado los datasets ni las capacidades originales; solo se han eliminado los mecanismos de rechazo.

El entrenamiento de la variante "Balanced" se ha ajustado específicamente para tareas de coding agéntico, razonamiento, escritura creativa y escenarios críticos de fiabilidad, con un énfasis en razonar antes de responder y mantenerse fiel a las instrucciones. Además, se incluye una cabeza de predicción multi-token (MTP) para decodificación especulativa, desarrollada por Unsloth, que permite verificar tokens generados en paralelo y acelerar la generación aproximadamente un 53% con una salida idéntica a la del modelo sin MTP. El sampling recomendado (temperatura 0.6, top_k 64, top_p 0.9, min_p 0.05, repeat_penalty 1.1) está calibrado específicamente para este build.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades completas del Gemma 4 31B original, incluyendo razonamiento multi-step y respuesta a instrucciones complejas.
- Coding agéntico: optimizado para tareas de programación que requieren seguir instrucciones de forma fiable y razonar sobre código.
- Escritura creativa y roleplay: la variante Balanced está ajustada para producir texto creativo, narrativo y conversacional sin rechazos.
- Visión multimodal: soporta entrada de imágenes mediante el proyector mmproj (1.2 GB), permitiendo tareas de image-text-to-text.
- Decodificación especulativa con MTP: genera tokens de forma especulativa con una cabeza MTP, acelerando la inferencia sin degradar la calidad.
- Conversación y agentes: capacidad de mantener diálogos multi-turno y seguir instrucciones en contextos largos (hasta 256K tokens).
- Sin rechazos: el modelo responde sin negarse en la práctica totalidad de los casos, según las pruebas del autor (0/465 refusals).

## Casos de uso

- Asistente de programación en producción: el modelo puede integrarse en pipelines de CI/CD para generar código, revisar cambios y sugerir correcciones, aprovechando su capacidad de razonamiento y su fiabilidad en tareas agénticas. Su ventana de 256K tokens permite procesar repositorios completos o archivos de gran tamaño.
- Generación de contenido creativo sin restricciones: escritores y creadores de contenido pueden usarlo para redactar narrativas, guiones o diálogos de roleplay sin que el modelo rechace temas sensibles o adultos, manteniendo coherencia en contextos largos.
- Análisis de documentos extensos: gracias a sus 256K tokens de contexto, puede resumir, extraer información y responder preguntas sobre libros, informes técnicos o contratos de gran longitud en un solo paso.
- Asistente multimodal para soporte técnico: combinando la entrada de imágenes con la generación de texto, puede analizar capturas de pantalla, diagramas o fotografías para diagnosticar problemas y ofrecer soluciones paso a paso.
- Chatbot conversacional sin censura: adecuado para aplicaciones de chat donde se requiera una interacción natural y sin filtros, como simulaciones de entrevistas, juegos de rol o asistentes personales personalizados.
- Investigación en seguridad y alineación: investigadores pueden estudiar el comportamiento de un modelo sin rechazos para evaluar riesgos, sesgos y estrategias de mitigación, comparando con el modelo original con censura.
- Despliegue en entornos con recursos limitados: al estar cuantizado a Q4_K_M (18.7 GB), cabe en GPUs de consumo como la RTX 4090 (24 GB) o en configuraciones de doble GPU, permitiendo ejecutar un modelo de 31B con calidad alta en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el modelo mantiene las capacidades del Gemma 4 31B original, pero no proporciona cifras de MMLU, HumanEval, GSM8K u otros tests estandarizados. La única métrica de rendimiento indicada es la aceleración del 53% en velocidad de generación gracias a la decodificación especulativa con MTP, medida en llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 18.7 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo completo con contexto moderado. Con contexto de 256K, la memoria necesaria aumenta considerablemente (estimación de 40-60 GB adicionales), por lo que se requiere hardware profesional o offloading a CPU.
- GPU recomendadas: RTX 4090 (24 GB) para uso básico con contexto corto; A100 40/80 GB o H100 para contexto largo y despliegue en producción.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 puede ejecutar el modelo en Q4_K_M con contexto limitado (por ejemplo, 8K-32K tokens). Para contexto completo de 256K se necesitan múltiples GPUs o cuantización más agresiva (no disponible).
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), LM Studio, Jan, koboldcpp y otros runtimes compatibles con GGUF. Se recomienda usar la opción `-fa on` (flash attention) y `-ngl 99` para offloading completo a GPU.
- Latencia y throughput: no hay datos publicados, pero la decodificación especulativa con MTP acelera la generación aproximadamente un 53% según el autor, medida en llama.cpp.
- Advertencia de compatibilidad: en LM Studio, el modo tensor-split (multi-GPU) puede provocar cuelgues; se recomienda usar una sola GPU con layer-split o prioridad de capas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP | 30.7B | 256K | Q4_K_M (GGUF) | gemma | Hugging Face |
| google/gemma-4-31B-it (original) | 30.7B | 256K | BF16, FP8, etc. | gemma | Hugging Face |
| Qwen3-32B (referencia similar en tamano) | 32B | 128K | GGUF, AWQ, etc. | Apache 2.0 | Hugging Face |

La comparativa se basa en el tamano (31-32B) y en la disponibilidad de formatos GGUF. El modelo de HauhauCS se diferencia del original por eliminar los rechazos de seguridad y por incluir una cabeza MTP para acelerar la generación. Frente a Qwen3-32B, ofrece un contexto mayor (256K vs 128K) y capacidades de visión, pero su licencia es más restrictiva (gemma) y su soporte de idiomas se limita al inglés. No hay datos de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una adaptación del Gemma 4 31B, hereda los sesgos del modelo base, que pueden manifestarse en temas de género, raza o cultura. La eliminación de rechazos puede amplificar estos sesgos al no haber filtros de seguridad.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento o factualidad. La ausencia de rechazos no implica mayor precisión.
- Limitaciones de idioma: el modelo está entrenado principalmente en inglés (tag `en`). El rendimiento en otros idiomas, incluido el español, no está documentado y puede ser inferior.
- Restricciones de licencia: la licencia `gemma` de Google impone restricciones de uso comercial y de redistribución. Es necesario revisar los términos de la licencia Gemma original antes de usar el modelo en producción.
- Riesgo de uso indebido: al ser uncensored, puede generar contenido dañino, ilegal o no ético. El autor advierte que algunos casos límite pueden requerir re-plantear la pregunta, pero no hay garantías de seguridad.
- Problemas de compatibilidad: en LM Studio, el modo tensor-split puede provocar cuelgues con Gemma 4; se recomienda usar una sola GPU. El MTP solo ha sido probado en llama.cpp.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estándar, lo que dificulta la evaluación comparativa con otros modelos.

## Enlaces

- Hugging Face: https://huggingface.co/HauhauCS/Gemma4-31B-QAT-Uncensored-HauhauCS-Balanced-MTP
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Perfil de HauhauCS en Hugging Face: https://huggingface.co/HauhauCS
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gemma4-31b-qat-uncensored-hauhaucs-balanced-mtp-hauhaucs
- Ficha en ThinkLLM: https://thinkllm.dev/models/gemma4-31b-qat-uncensored-hauhaucs-balanced-mtp
- Issue de llama.cpp sobre bug de visión con mmproj: https://github.com/ggml-org/llama.cpp/issues/26981
