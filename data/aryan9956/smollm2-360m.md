# Aryan9956/SmolLM2-360M

## Resumen

SmolLM2-360M es un modelo de lenguaje compacto perteneciente a la familia SmolLM2 desarrollada por Hugging Face. Con 360 millones de parámetros, está diseñado para ofrecer un equilibrio entre capacidad y eficiencia, permitiendo su ejecución en dispositivos con recursos limitados. El modelo se entrenó sobre 4 billones de tokens utilizando una combinación de datasets públicos como FineWeb-Edu, DCLM y The Stack, junto con conjuntos curados adicionales. Este repositorio concreto (`Aryan9956/SmolLM2-360M`) es una copia del modelo original subida por un usuario independiente, manteniendo la misma arquitectura y pesos.

La relevancia actual de SmolLM2-360M radica en su capacidad para ejecutar tareas de generación de texto, razonamiento e instrucciones en entornos edge o con restricciones de hardware, compitiendo directamente con otros modelos de tamaño similar como Qwen2.5-0.5B. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integraciones en productos. El modelo base no incluye ajuste por instrucciones, pero existe una variante instruct que sí lo incorpora, entrenada mediante SFT y DPO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la información proporcionada) |
| Tipos de cuantizacion | no disponible (se menciona precisión bfloat16 para entrenamiento, pero no se listan cuantizaciones GGUF, GPTQ, etc.) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer decoder estándar, sin mecanismos de mezcla de expertos (MoE). Se entrenó en precisión bfloat16 durante 4 billones de tokens, utilizando una combinación de datasets públicos (FineWeb-Edu, DCLM, The Stack) y datasets curados adicionales que Hugging Face planea publicar. Para la versión instruct, se aplicó supervisión fina (SFT) con datasets públicos y propios, seguida de optimización por preferencia directa (DPO) sobre el dataset UltraFeedback. La versión instruct también incorpora soporte para reescritura de texto, resumen y llamada a funciones, gracias a datasets como Synth-APIGen-v0.1 de Argilla.

El entrenamiento se realizó con 128 GPUs H100 utilizando el framework nanotron. No se mencionan innovaciones técnicas adicionales como atención lineal o decodificación especulativa; la arquitectura es un transformer convencional optimizado para eficiencia en tamaño reducido.

## Capacidades

- Generación de texto autónoma y completado de secuencias.
- Razonamiento básico y respuesta a instrucciones (en la versión instruct).
- Soporte de function calling y tool calling (en la versión instruct, gracias a datasets específicos).
- Capacidad de reescritura de texto y resumen (versión instruct).
- Ejecución en CPU, GPU o múltiples GPUs, con huella de memoria reducida (723 MB en bfloat16).
- Multilingüe: no, el modelo está entrenado principalmente en inglés.

## Casos de uso

- **Asistente de chat en dispositivos edge**: el modelo puede ejecutarse localmente en smartphones o dispositivos IoT gracias a su tamaño reducido, gestionando conversaciones de soporte básico sin depender de la nube.
- **Autocompletado de código en entornos de desarrollo**: aunque no está especializado en código, puede sugerir fragmentos simples o completar funciones en IDEs ligeros, integrándose con herramientas como VS Code mediante la librería transformers.
- **Preprocesamiento de texto**: la versión instruct puede reescribir párrafos, resumir documentos o normalizar contenido, útil en pipelines de análisis de datos o generación de informes.
- **Generación de respuestas en sistemas de FAQ**: con su capacidad de seguir instrucciones, puede responder preguntas frecuentes en inglés dentro de chatbots de bajo coste.
- **Prototipado rápido de aplicaciones NLP**: los desarrolladores pueden probar ideas de generación de texto sin necesidad de GPUs potentes, usando el modelo en CPU con la API de transformers.
- **Fine-tuning para dominios específicos**: al ser un modelo pequeño, permite ajuste fino con datasets reducidos en hardware modesto, por ejemplo para clasificación de textos o generación de etiquetas en inglés.

## Benchmarks y rendimiento

La model card original reporta resultados para el modelo base y la versión instruct. Estos datos provienen del modelo oficial `HuggingFaceTB/SmolLM2-360M`, no de esta copia específica, pero son representativos del rendimiento.

**Modelo base (zero-shot, salvo indicación):**

| Métrica | SmolLM2-360M | Qwen2.5-0.5B | SmolLM-360M |
|---|---|---|---|
| HellaSwag | **54.5** | 51.2 | 51.8 |
| ARC (Average) | **53.0** | 45.4 | 50.1 |
| PIQA | **71.7** | 69.9 | 71.6 |
| MMLU (cloze) | **35.8** | 33.7 | 34.4 |
| CommonsenseQA | **38.0** | 31.6 | 35.3 |
| TriviaQA | **16.9** | 4.3 | 9.1 |
| Winogrande | 52.5 | **54.1** | 52.8 |
| OpenBookQA | **37.4** | **37.4** | 37.2 |
| GSM8K (5-shot) | 3.2 | **33.4** | 1.6 |

**Modelo instruct:**

| Métrica | SmolLM2-360M-Instruct | Qwen2.5-0.5B-Instruct | SmolLM-360M-Instruct |
|---|---|---|---|
| IFEval (Average prompt/inst) | **41.0** | 31.6 | 19.8 |
| MT-Bench | 3.66 | **4.16** | 3.37 |
| HellaSwag | **52.1** | 48.0 | 47.9 |
| ARC (Average) | **43.7** | 37.3 | 38.8 |
| PIQA | **70.8** | 67.2 | 69.4 |
| MMLU (cloze) | **32.8** | 31.7 | 30.6 |
| BBH (3-shot) | 27.3 | **30.7** | 24.4 |
| GSM8K (5-shot) | 7.43 | **26.8** | 1.36 |

Se observa que SmolLM2-360M supera a sus competidores en la mayoría de tareas de razonamiento de sentido común, aunque queda por detrás de Qwen2.5-0.5B en tareas matemáticas (GSM8K) y en MT-Bench.

## Requisitos de hardware

- **VRAM estimada**: en bfloat16, el modelo ocupa aproximadamente 723 MB de memoria, por lo que puede ejecutarse en GPUs con 1 GB de VRAM o menos si se usa cuantización adicional (aunque no se especifican cuantizaciones en la información).
- **GPUs recomendadas**: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, Jetson Nano, o incluso iGPUs con soporte CUDA). Para inferencia rápida, una RTX 3060 o superior es suficiente.
- **CPU**: es viable ejecutarlo en CPU con 4-8 GB de RAM, aunque la latencia será mayor.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama y Text Generation Inference (TGI). La integración con `transformers` es directa.
- **Latencia y throughput**: no se proporcionan datos específicos. Dado el tamaño, se espera una generación de decenas de tokens por segundo en GPU moderna y unos pocos en CPU.

## Comparativa con modelos similares

La comparativa se basa en los benchmarks de la model card, que incluyen a Qwen2.5-0.5B y SmolLM-360M como alternativas directas.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento general |
|---|---|---|---|---|
| SmolLM2-360M | 361M | no disponible | Apache 2.0 | Mejor en tareas de razonamiento de sentido común (HellaSwag, ARC, PIQA) |
| Qwen2.5-0.5B | 500M | 32k (conocido, no en la info) | Apache 2.0 | Mejor en matemáticas (GSM8K) y MT-Bench |
| SmolLM-360M | 360M | no disponible | Apache 2.0 | Inferior en casi todas las métricas |

SmolLM2-360M destaca por su eficiencia y buen rendimiento en tareas de comprensión lectora y razonamiento cotidiano, mientras que Qwen2.5-0.5B ofrece mejor capacidad matemática. La elección depende de la tarea específica.

## Limitaciones y advertencias

- **Idioma**: el modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas es muy limitado o nulo.
- **Precisión factual**: puede generar contenido factualmente incorrecto o inconsistente, como se indica en la model card original. No debe usarse como fuente definitiva de información.
- **Sesgos**: al entrenarse con datos web, puede reflejar sesgos presentes en el texto original.
- **Alucinaciones**: riesgo de producir respuestas plausibles pero inventadas, especialmente en tareas abiertas.
- **Contexto**: no se especifica la longitud máxima de contexto; se recomienda probar con secuencias cortas para evitar degradación.
- **Licencia**: Apache 2.0 permite uso comercial, pero esta copia específica (`Aryan9956/SmolLM2-360M`) no es el repositorio oficial; se recomienda verificar la integridad de los pesos antes de usarla en producción.
- **Sin soporte multilingüe**: no apto para aplicaciones que requieran español u otros idiomas.

## Enlaces

- Repositorio de HuggingFace de esta copia: https://huggingface.co/Aryan9956/SmolLM2-360M
- Modelo original: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Paper: https://arxiv.org/abs/2502.02737
- Código y documentación: https://github.com/huggingface/smollm
