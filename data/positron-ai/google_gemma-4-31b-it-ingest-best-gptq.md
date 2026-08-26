# positron-ai/google_gemma-4-31B-it-ingest-best-gptq

## Resumen

Este repositorio contiene una cuantización GPTQ de 4 bits del modelo Google Gemma 4 31B IT, realizada por Positron AI. El artefacto reduce los pesos del modelo original de aproximadamente 62 GB en FP16 a unos 19,8 GB, lo que permite ejecutar un modelo multimodal de 31 000 millones de parámetros en GPU de consumo con 24 GB de VRAM o en entornos de servidor con menor capacidad de memoria.

El modelo base, google/gemma-4-31B-it, es un modelo abierto desarrollado por Google DeepMind que acepta entradas de texto e imagen, procesa vídeo como secuencias de fotogramas y genera texto. Dispone de una ventana de contexto de hasta 256 000 tokens y soporta más de 140 idiomas. Esta cuantización mantiene las mismas capacidades funcionales que el original, pero con una huella de memoria significativamente menor, lo que la hace adecuada para despliegues en producción donde los recursos de VRAM son limitados.

La relevancia de este artefacto radica en que ofrece una vía práctica para ejecutar un modelo de razonamiento y codificación de última generación en hardware asequible, sin necesidad de clústeres de GPU de gran tamaño. La cuantización GPTQ con grupo de tamaño 64 y calibración de dominio mixto busca preservar la fidelidad del modelo original, aunque la validación de calidad (MMLU) está pendiente en la fecha de publicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) |
| Parametros totales | 31 273 088 876 |
| Parametros activos | no aplicable (arquitectura densa) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | GPTQ 4 bits, grupo 64, simetrico, desc_act false |
| Idiomas soportados | Mas de 140 idiomas |
| Licencia | Otra (licencia personalizada de Gemma, con restricciones de uso comercial) |
| Formato de pesos | Safetensors con cuantizacion GPTQ |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-31B-it es un transformer multimodal denso con 31 000 millones de parámetros. Según la documentación oficial de Gemma 4, la familia incluye arquitecturas densas y MoE; la variante de 31B es densa. El modelo acepta texto e imagen como entrada, procesa vídeo como secuencias de fotogramas y genera texto. Su ventana de contexto es de 256K tokens y mantiene soporte multilingüe en más de 140 idiomas. Está diseñado para tareas de razonamiento, flujos de trabajo de agentes, codificación y comprensión multimodal en GPU de consumo y estaciones de trabajo.

La cuantización GPTQ aplicada por Positron AI utiliza precisión de pesos de 4 bits con activaciones sin cuantizar, grupo de tamaño 64, cuantización simétrica y orden de activación desactivado (desc_act false). El proceso de calibración se realizó con un conjunto de datos de dominio mixto de 128 muestras con longitud de secuencia de 4096 tokens. La herramienta utilizada fue GPTQModel 7.1.0 con transformers 5.11.0 y torch 2.9.1 sobre CUDA 12.8. No se han medido métricas de divergencia KL ni agreement top-1 para esta versión.

## Capacidades

- Generación de texto y razonamiento multilingüe en más de 140 idiomas.
- Comprensión multimodal: procesa imágenes y vídeo como secuencias de fotogramas, generando descripciones o respuestas textuales.
- Razonamiento complejo y resolución de problemas de múltiples pasos.
- Generación y análisis de código, incluyendo depuración y explicación.
- Soporte de tool calling y function calling, lo que permite integrarse en flujos de agente.
- Ventana de contexto de 256K tokens, adecuada para documentos largos y conversaciones extendidas.
- Capacidades conversacionales y de instrucción (it, instruction-tuned).

## Casos de uso

- **Asistente de codificación en entornos de desarrollo**: el modelo puede generar, revisar y explicar fragmentos de código. Su tamaño cuantizado permite ejecutarlo en una GPU como la RTX 4090, integrándolo en IDEs o pipelines de CI/CD para autocompletado y revisión automática.
- **Análisis de documentos extensos**: con su ventana de 256K tokens, puede resumir contratos, informes técnicos o libros completos sin necesidad de dividirlos en fragmentos. Adecuado para bufetes de abogados o equipos de investigación que procesan grandes volúmenes de texto.
- **Sistema de atención al cliente multilingüe**: el modelo responde en más de 140 idiomas, lo que permite desplegar un chatbot de soporte que atienda a usuarios internacionales. La cuantización 4 bits reduce el coste de infraestructura para manejar múltiples instancias.
- **Análisis de imágenes médicas o técnicas**: aunque no se mencionan capacidades específicas de diagnóstico, el modelo base acepta imágenes y puede describir o responder preguntas sobre radiografías, diagramas o capturas de pantalla. La cuantización permite usarlo en estaciones de trabajo con una sola GPU.
- **Generación de informes a partir de vídeo**: el modelo procesa vídeo como secuencias de fotogramas, lo que permite resumir grabaciones de seguridad, tutoriales o reuniones en texto estructurado.
- **Agente de automatización de tareas**: con soporte para tool calling, puede integrarse en flujos de agentes que consultan bases de datos, ejecutan scripts o interactúan con APIs, manteniendo el contexto de la tarea durante largas sesiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tabla de validación del repositorio indica que la evaluación de MMLU está pendiente y que no se han medido métricas de divergencia KL ni de concordancia top-1. No se proporcionan datos comparativos de rendimiento con el modelo base ni con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: con pesos de 4 bits y 31 000 millones de parámetros, el tamaño del modelo es de aproximadamente 15,6 GB (31 273 088 876 × 4 bits / 8 = 15,6 GB). Añadiendo activaciones y memoria intermedia, se recomienda una GPU con al menos 24 GB de VRAM para inferencia cómoda con contexto largo.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 40 GB, A6000 48 GB o superiores. En GPU con 16 GB (RTX 4080, L4) se podría ejecutar con contexto reducido o mediante offloading de capas a CPU.
- Inferencia en GPU de consumo: sí, una RTX 4090 (24 GB) es suficiente para ejecutar el modelo con contexto de 256K tokens, aunque la latencia será mayor que con el modelo en FP16.
- Opciones de despliegue: vLLM (soporta GPTQ), llama.cpp (conversión a GGUF), TensorRT-LLM, y servidores de inferencia compatibles con la librería transformers.
- Latencia y throughput: no se han publicado mediciones para esta cuantización. En general, un modelo 31B en 4 bits en una RTX 4090 puede generar entre 20 y 40 tokens por segundo, dependiendo del contexto y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-31B-it (base) | 31B | 256K | FP16 (62 GB) | Licencia Gemma (uso comercial con restricciones) | Hugging Face |
| positron-ai/google_gemma-4-31B-it-ingest-best-gptq | 31B | 256K | GPTQ 4-bit | Licencia Gemma | Hugging Face |
| google/gemma-4-26B-A4B-it (MoE) | 26B total (4B activos) | 256K | FP16 (aprox. 52 GB) | Licencia Gemma | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para esta cuantización. La ventaja principal de la versión GPTQ es la reducción de VRAM frente al FP16, mientras que la variante MoE de 26B ofrecería menor uso de memoria en activos, pero no está cuantizada en este repositorio.

## Limitaciones y advertencias

- La licencia de Gemma es personalizada y permite uso comercial responsable, pero impone restricciones específicas (prohibición de usos militares, vigilancia, etc.). Se debe revisar el texto completo de la licencia antes de desplegar el modelo en producción.
- La cuantización GPTQ de 4 bits puede introducir degradación de precisión en tareas de razonamiento complejo o en la generación de código, aunque no se han medido métricas de validación para este artefacto.
- La validación de calidad (MMLU) está pendiente, por lo que no se puede garantizar que el rendimiento sea equivalente al del modelo base.
- El modelo es multimodal y acepta imágenes, pero no se ha especificado el tamaño máximo de imagen soportado ni el número de fotogramas de vídeo procesables.
- La latencia de inferencia dependerá del backend elegido y de la longitud de contexto; en GPU de 24 GB, el contexto máximo de 256K tokens puede exceder la memoria de activaciones en algunos casos.
- No se ha medido la divergencia de KL ni el agreement top-1 en esta versión, lo que limita la confianza en la fidelidad de la cuantización.
- El repositorio no proporciona información sobre el tiempo de inferencia ni el throughput, por lo que es necesario realizar pruebas de carga antes de un despliegue en producción.

## Enlaces

- Repositorio del artefacto cuantizado: https://huggingface.co/positron-ai/google_gemma-4-31B-it-ingest-best-gptq
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-31B
- Documentación oficial de Gemma 4: https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4 en Google AI: https://ai.google.dev/gemma/docs/core/model_card_4
- Model card en NVIDIA NIM: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
