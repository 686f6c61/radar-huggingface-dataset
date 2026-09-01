# Plana-Chan/dolphin-2.9-llama3-8b-GGUF

## Resumen

Este repositorio contiene los pesos en formato GGUF del modelo `dolphin-2.9-llama3-8b`, una versión cuantizada del fine-tuning realizado por cognitivecomputations sobre la base Llama-3-8B de Meta. La cuantización ha sido generada por el usuario Plana-Chan (con soporte de TensorBlock) y está pensada para su ejecución en entornos locales con recursos limitados, siendo compatible con llama.cpp y sus derivados (Ollama, LM Studio, etc.).

El modelo original, desarrollado por cognitivecomputations, es un asistente conversacional e instructivo entrenado sobre una mezcla de datasets que incluyen instrucciones generales, código, matemáticas, function calling y datos de agentes. Con 8.030 millones de parámetros y una arquitectura transformer decoder-only, ofrece un equilibrio entre capacidad y requisitos de hardware, lo que lo convierte en una opción práctica para desarrolladores que necesitan un modelo local de propósito general.

La relevancia de esta versión GGUF radica en que permite desplegar el modelo en GPUs de consumo (incluso con 6-8 GB de VRAM) sin necesidad de infraestructura de servidor, manteniendo un rendimiento razonable en tareas de instrucción, generación de código y razonamiento básico. El contexto nativo es de 8.000 tokens, aunque el fine-tuning se realizó con secuencias de 4.096.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3) |
| Parametros totales | 8.030.277.632 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.000 tokens (entrenado con 4.096) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M |
| Idiomas soportados | No disponible (principalmente ingles, con capacidades multilingue limitadas heredadas de Llama-3) |
| Licencia | Llama 3 Community License (marcada como "other" en el repo) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Llama-3-8B, un transformer decoder-only con normalización RMSNorm, atención con RoPE y feed-forward con activación SwiGLU. Sobre esta base, cognitivecomputations realizó un fine-tuning de pesos completos (full-weight fine-tuning) con una longitud de secuencia de 4.096 tokens, durante 2,5 días en 8 GPUs L40S, con tres épocas. El entrenamiento utilizó el framework Axolotl, como se indica en las etiquetas del repositorio.

La mezcla de datos de entrenamiento incluye los datasets `Dolphin-2.9`, `OpenHermes-2.5`, `CodeFeedback-Filtered-Instruction`, `dolphin-coder`, `samantha-data`, `ultrachat_200k`, `orca-math-word-problems-200k`, `SystemChat-1.1`, `function-calling-chatml` y `Agent-FLAN`. Esta combinación busca cubrir instrucción general, generación de código, razonamiento matemático, diálogo y capacidades de function calling y agentes. El prompt template es ChatML (`<|im_start|>`), lo que facilita la integración con sistemas que ya usan este formato.

La cuantización a GGUF se realizó con las herramientas de llama.cpp (compatible con el commit b4011) y no introduce cambios en la arquitectura, solo reduce la precisión de los pesos para disminuir el uso de memoria.

## Capacidades

- Generacion de texto e instrucciones: sigue instrucciones complejas en formato conversacional, con respuestas detalladas y coherentes.
- Razonamiento y matematicas: entrenado con datasets como `orca-math-word-problems-200k`, muestra competencia en problemas aritmeticos y de razonamiento logico basico.
- Generacion de codigo: los datasets `CodeFeedback-Filtered-Instruction` y `dolphin-coder` aportan capacidad para escribir, explicar y depurar codigo en varios lenguajes.
- Function calling: entrenado con `function-calling-chatml` y `Agent-FLAN`, puede emitir llamadas a funciones estructuradas en formato ChatML.
- Soporte de agentes: el dataset `Agent-FLAN` proporciona habilidades para razonamiento multi-paso y planificacion de tareas.
- Dialogo y personalidad: el dataset `samantha-data` contribuye a un tono amigable y empatico en conversaciones.
- Multilingue limitado: al estar basado en Llama-3, puede manejar varios idiomas, aunque su entrenamiento principal es en ingles.

## Casos de uso

- Asistente conversacional local: se puede integrar en aplicaciones de escritorio o web mediante Ollama o llama.cpp para ofrecer un chatbot privado sin dependencia de APIs externas, aprovechando su formato ChatML y su tono amigable.
- Generacion de codigo en entornos de desarrollo: util para autocompletar, explicar fragmentos o generar scripts en lenguajes como Python, JavaScript o C++, gracias a su entrenamiento con datasets de codigo.
- Automatizacion de tareas con function calling: puede conectarse a herramientas externas (bases de datos, APIs REST) emitiendo llamadas estructuradas, lo que permite construir asistentes que ejecutan acciones reales.
- Tutor de matematicas y ciencias: su capacidad con problemas aritmeticos y de razonamiento lo hace adecuado para aplicaciones educativas que expliquen paso a paso la resolucion de ejercicios.
- Prototipado rapido de agentes: al incluir datos de `Agent-FLAN`, sirve para experimentar con pipelines de razonamiento multi-paso y planificacion en entornos de investigacion.
- Procesamiento de documentos con contexto medio: con 8.000 tokens de contexto, puede resumir o extraer informacion de documentos de hasta unas 6.000 palabras, suficiente para articulos tecnicos o informes.
- Despliegue en edge computing: su tamaño reducido (a partir de 3 GB en Q3_K) permite ejecutarlo en dispositivos con poca memoria, como mini-PCs o NAS, para tareas de clasificacion o generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio aparece vacio y no hay datos oficiales de MMLU, HumanEval, GSM8K u otras pruebas comparativas. Se recomienda evaluar el modelo en el caso de uso concreto antes de adoptarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (4,58 GB de archivo), se necesitan aproximadamente 5-6 GB de VRAM para contexto corto; con Q5_K_M (5,22 GB), unos 6-7 GB; con Q8 (no listado, pero comun), unos 8-9 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM, como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 2070 Super (8 GB) o equivalentes de AMD con ROCm. Para cuantizaciones mas bajas (Q3_K_M, 3,74 GB), puede funcionar en GPUs de 4 GB.
- Si cabe en consumer GPU: si, la mayoria de las cuantizaciones Q4 y Q5 caben en GPUs de gama media actuales. Las versiones Q2 y Q3 pueden ejecutarse incluso en GPUs integradas con 4 GB compartidos.
- Opciones de despliegue: llama.cpp (nativo), Ollama (importando el GGUF), LM Studio, text-generation-webui, o servidores compatibles con la API de OpenAI como llama-cpp-python o LocalAI.
- Latencia y throughput estimados: no disponibles. Dependen de la GPU y la cuantizacion; en una RTX 3060 con Q4_K_M se puede esperar una generacion de 20-40 tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dolphin-2.9-llama3-8b (GGUF) | 8B | 8k | Llama 3 Community | GGUF | Fine-tuning de Llama-3-8B con function calling y agentes |
| Llama-3-8B-Instruct (GGUF) | 8B | 8k | Llama 3 Community | GGUF | Modelo base instructivo de Meta, sin fine-tuning adicional |
| Mistral-7B-Instruct (GGUF) | 7B | 32k | Apache 2.0 | GGUF | Contexto mas largo, licencia permisiva, menos enfocado a coding |
| Qwen2.5-7B-Instruct (GGUF) | 7B | 128k | Apache 2.0 | GGUF | Contexto muy largo, buen rendimiento multilingue |

La comparativa se basa en caracteristicas generales, ya que no hay benchmarks publicados para dolphin-2.9. La principal ventaja de dolphin-2.9 frente a Llama-3-8B-Instruct es su entrenamiento adicional en function calling y agentes, mientras que Mistral y Qwen ofrecen contextos mas largos y licencias mas permisivas.

## Limitaciones y advertencias

- Contexto limitado: el modelo base tiene 8.000 tokens, pero el fine-tuning se realizo con 4.096, por lo que puede degradarse con contextos cercanos al maximo. No es adecuado para documentos muy largos.
- Sesgos heredados: al estar basado en Llama-3, puede reproducir sesgos presentes en los datos de preentrenamiento de Meta, especialmente en temas sociales y culturales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de hechos especificos o citas.
- Licencia Llama 3 Community: aunque permite uso comercial, incluye restricciones para empresas con mas de 700 millones de usuarios mensuales, que necesitarian una licencia comercial de Meta.
- Sin soporte multimodal: no procesa imagenes, audio ni video. Solo texto.
- Cuantizacion y calidad: las versiones Q2 y Q3 presentan perdidas de calidad notables; se recomienda usar Q4_K_M o superior para tareas de produccion.
- Idioma principal: el entrenamiento esta dominado por ingles; el rendimiento en otros idiomas puede ser significativamente inferior.

## Enlaces

- Repositorio GGUF (Plana-Chan): https://huggingface.co/Plana-Chan/dolphin-2.9-llama3-8b-GGUF
- Modelo base (cognitivecomputations): https://huggingface.co/cognitivecomputations/dolphin-2.9-llama3-8b
- Modelo base alternativo (dphn): https://huggingface.co/dphn/dolphin-2.9-llama3-8b
- Repositorio GGUF alternativo (dphn): https://huggingface.co/dphn/dolphin-2.9-llama3-8b-gguf
- Analisis del modelo (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/dolphin-29-llama3-8b-cognitivecomputations
- Proyecto TensorBlock: https://tensorblock.co
- Repositorio de TensorBlock en GitHub: https://github.com/TensorBlock
