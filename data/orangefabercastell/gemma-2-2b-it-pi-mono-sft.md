# orangefabercastell/gemma-2-2b-it-pi-mono-sft

## Resumen

El modelo `orangefabercastell/gemma-2-2b-it-pi-mono-sft` es un fine-tuning supervisado (SFT) del modelo base `google/gemma-2-2b-it` (Gemma 2 2B) sobre trazas de ejecución reales de agentes de codificación autónomos procedentes del dataset `badlogicgames/pi-mono`. El objetivo es dotar a un modelo pequeño de 2,6 mil millones de parámetros de la capacidad de interactuar con un entorno de trabajo (workspace) mediante acciones estructuradas como lectura, edición de archivos, ejecución de comandos shell y búsqueda con `grep`, sin que ello degrade sus habilidades fundamentales de programación en Python.

El ajuste se realizó mediante QLoRA (Quantized Low-Rank Adaptation) con máscara de pérdida solo sobre las completaciones, lo que permite que el modelo aprenda a emitir acciones de agente en formato estructurado. Según la model card, el modelo base rechaza cualquier operación de archivos (obtiene un 0 % en tareas de tool calling), mientras que el modelo fine-tuned invoca de forma activa acciones de workspace. Esto lo convierte en una opción interesante para experimentar con agentes autónomos de código en entornos con recursos limitados, aunque su tamaño reducido limita el rendimiento en tareas complejas.

El modelo se distribuye como pesos fusionados en 16 bits (safetensors) y el adaptador LoRA está disponible por separado. No se especifica licencia ni idiomas soportados en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (safetensors); el adaptador LoRA se entrenó con cuantización de 4 bits (QLoRA) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b-it`, un transformer decoder-only de 2,6 mil millones de parámetros. El fine-tuning se realizó con QLoRA, una técnica que cuantiza el modelo base a 4 bits durante el entrenamiento y añade adaptadores de bajo rango (LoRA) para actualizar los pesos de forma eficiente en memoria. Se aplicó una máscara de pérdida solo sobre las completaciones (completion-only loss masking), de modo que el modelo solo aprende de las respuestas generadas por el agente, no de los mensajes del sistema ni de los prompts.

El conjunto de datos de entrenamiento consiste en trazas de ejecución de agentes de codificación autónomos del dataset `pi-mono`, que incluyen interacciones multi-turno con herramientas de workspace: lectura de archivos, edición, escritura, búsqueda con `grep` y ejecución de comandos `bash`. El ajuste se realizó en hardware de Kaggle (GPU) y se monitorizó con TrackIO.

Se realizó un barrido de hiperparámetros con tres configuraciones. La configuración seleccionada como mejor fue `lr1e4-r16-len2k` (tasa de aprendizaje 1e-4, rango LoRA 16, alpha 32, longitud de secuencia 2000), que alcanzó una pérdida de entrenamiento de 1,5094 y una pérdida de evaluación de 0,2988, con una precisión media de token del 92,63 %. El entrenamiento mostró un descenso monótono de la pérdida sin picos ni divergencia de pesos.

## Capacidades

- Generación de código en Python: mantiene y mejora ligeramente las capacidades de programación del modelo base (HumanEval +2,2 %, MBPP +1,4 %).
- Autonomía en workspace: puede navegar por un sistema de archivos, leer archivos, editarlos, escribirlos y buscar contenido con `grep`.
- Ejecución de comandos shell: emite acciones `bash` para ejecutar comandos en el entorno.
- Flujos de trabajo multi-turno: mantiene el contexto de la conversación y realiza varias acciones consecutivas para completar una tarea.
- Formato de acciones estructurado: genera salidas en formato de acción (por ejemplo, `Action: read`, `Path: ...`, `Limit: ...`) que pueden ser interpretadas por un entorno de agente.
- Razonamiento básico: al estar basado en Gemma 2 2B, conserva capacidades de razonamiento y comprensión del lenguaje, aunque limitadas por su tamaño.

## Casos de uso

- Agente de mantenimiento de código: el modelo puede inspeccionar un archivo fuente, localizar una configuración concreta (por ejemplo, un puerto de base de datos) y editarla automáticamente usando las acciones `read` y `edit`, como se demuestra en la model card.
- Asistente de refactorización en repositorios pequeños: puede buscar referencias a una función o variable con `grep` y proponer o aplicar cambios de forma autónoma en proyectos de tamaño moderado.
- Automatización de tareas de configuración: puede modificar archivos de configuración (variables de entorno, puertos, URLs) leyendo y editando los ficheros relevantes.
- Integración en pipelines de CI/CD: al poder ejecutar comandos `bash`, podría usarse para corregir errores triviales o actualizar dependencias en entornos de integración continua, siempre que se valide la salida.
- Entorno de aprendizaje para investigación en agentes: al ser un modelo pequeño y ligero, es adecuado para estudiar el comportamiento de agentes autónomos con tool calling en entornos de investigación con recursos limitados.
- Prototipado rápido de agentes de código: permite construir prototipos de asistentes que interactúan con el sistema de archivos sin necesidad de un modelo de gran tamaño, útil para validar flujos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación con el framework Inspect AI en un entorno sandbox local, comparando el modelo base con el fine-tuned:

| Benchmark | Base Gemma 2 2B | Fine-Tuned Agent SFT | Delta |
|---|---|---|---|
| HumanEval (`openai_humaneval`) | 26,4 % | 28,6 % | +2,2 % |
| MBPP (`google-research-datasets/mbpp`) | 32,8 % | 34,2 % | +1,4 % |

Además, se indica que el modelo base obtiene un 0 % en tareas de tool calling (se niega a realizar operaciones de archivos), mientras que el modelo fine-tuned invoca activamente acciones estructuradas de workspace. No se han publicado resultados en otros benchmarks (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo fusionado en FP16 ocupa aproximadamente 5,2 GB (2,6 B parámetros × 2 bytes). Con overhead de contexto y funciones de atención, se recomienda al menos 8 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: tarjetas consumer con 8-12 GB de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. También puede ejecutarse en GPUs de datacenter como A10 o T4 (16 GB).
- Cabe en GPU consumer: sí, siempre que se disponga de al menos 8 GB de VRAM. Para cuantizaciones de 4 bits (por ejemplo, mediante llama.cpp o bitsandbytes), la huella se reduce a aproximadamente 1,5-2 GB.
- Opciones de despliegue: al ser un modelo estándar de Hugging Face, se puede servir con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama. También se puede usar directamente con la librería `transformers` de Hugging Face.
- Latencia y throughput: no se proporcionan mediciones específicas. En una GPU consumer moderna, se espera una generación de decenas de tokens por segundo, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

La tabla siguiente compara el modelo fine-tuned con su base Gemma 2 2B y con un modelo de referencia de código de tamaño similar (Qwen 2.5 Coder 1.5B, cuyos datos no se incluyen en la información proporcionada, por lo que se indica como no disponible).

| Modelo | Parametros | Contexto | HumanEval | Tool calling | Licencia |
|---|---|---|---|---|---|
| `gemma-2-2b-it-pi-mono-sft` (este) | 2,6 B | No disponible | 28,6 % | Sí (workspace) | No disponible |
| `google/gemma-2-2b-it` (base) | 2,6 B | No disponible | 26,4 % | No (0 %) | No disponible |
| Qwen 2.5 Coder 1.5B | 1,5 B | No disponible | No disponible | No disponible | No disponible |

La comparación con otros modelos de código de tamaño similar no está disponible en la información proporcionada. La principal diferencia frente al modelo base es la adquisición de la capacidad de tool calling, que es el objetivo del fine-tuning.

## Limitaciones y advertencias

- Tamaño reducido: con 2,6 B de parámetros, el rendimiento en tareas de razonamiento complejo o generación de código avanzado es limitado. La model card señala que puntuaciones superiores al 70 % en HumanEval requieren típicamente modelos de 70 B+.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en tareas de edición de código donde una acción errónea puede corromper archivos.
- Alcance del dataset: el fine-tuning se realizó sobre un dataset concreto de trazas de agentes (`pi-mono`), por lo que la generalización a otros entornos o estilos de código puede ser limitada.
- Sin licencia especificada: la model card no indica la licencia, lo que impide conocer las restricciones de uso comercial o modificación. Se debe contactar con el autor antes de usarlo en producción.
- Idiomas no especificados: no se indica qué idiomas soporta; Gemma 2 está principalmente entrenado en inglés, por lo que su uso en otros idiomas puede degradar el rendimiento.
- Sin soporte oficial: el modelo es un experimento de un autor independiente, sin mantenimiento ni garantías de estabilidad.
- Contexto no documentado: no se especifica la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orangefabercastell/gemma-2-2b-it-pi-mono-sft
- Adaptador LoRA (configuración seleccionada): https://huggingface.co/orangefabercastell/gemma-2-2b-it-pi-mono-adapter-lr1e4-r16-len2k
- Dataset de trazas de agentes: https://huggingface.co/datasets/badlogicgames/pi-mono
- Modelo base Gemma 2 2B (referencia): https://huggingface.co/google/gemma-2-2b-it
