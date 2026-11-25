# mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-MTP-GGUF

## Resumen

Prompt-Resampler-9B-SFT-Alpha-8K-MTP-GGUF es la versión cuantizada en formato GGUF de un ajuste fino supervisado del modelo Qwen3.5-9B (variante instruct), publicado por el usuario mithulaartigala bajo licencia Apache 2.0. El modelo está especializado en una tarea concreta: el *prompt resampling*, una técnica de aumento de datos que genera variaciones de un enunciado preservando su tarea subyacente y modificando variables como nombres, cifras, lugares o escenarios. El entrenamiento se realizó con LoRA (r=32, alpha=64) sobre una longitud de secuencia de 8.192 tokens usando la herramienta Unsloth Studio, y se preservaron las capacidades nativas de chat y razonamiento del modelo base.

El modelo incorpora una cabeza MTP (*Multi-Token Prediction*) entrenada durante una época adicional con el modelo de 9B congelado, sobre el mismo conjunto de datos y con el mismo contexto de 8.192 tokens. Esta cabeza se incluye en cada archivo GGUF y permite decodificación especulativa en llama.cpp mediante el parámetro `--spec-type draft-mtp`. La pérdida de validación de la MTP fue de 0,607 con *thinking* activado y 0,686 con *thinking* desactivado.

Se trata de una *release Alpha* de 9.197.093.888 parámetros (aproximadamente 9,2B), pensada para integrarse en pipelines de generación de datos sintéticos para entrenamiento y evaluación. El autor advierte explícitamente de que el modelo puede rendir por debajo de lo esperado con prompts de estructura no vista o de longitud elevada, y de que ciertos comportamientos pueden no cumplir las expectativas propias de una versión estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) con cabeza MTP adicional; ajuste fino LoRA sobre el modelo base |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento y contexto recomendado en llama.cpp) |
| Tipos de cuantizacion | GGUF cuantizado; el repositorio incluye al menos Q4_K_S (referenciado en los ejemplos de la model card) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 60,0 GB con múltiples archivos de cuantización) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B en su variante instruct y aplica un ajuste fino supervisado (SFT) mediante LoRA con rango 32 y alpha 64, sobre secuencias de 8.192 tokens. El conjunto de datos empleado es `mithulaartigala/prompt-resampling-alpaca-gsm8k`, una mezcla de Alpaca y GSM8K adaptada a la tarea de remuestreo de prompts. El entrenamiento se ejecutó con Unsloth Studio y preservó el formato de chat nativo y las capacidades del modelo base, de modo que el modelo sigue respondiendo a plantillas conversacionales estándar.

La innovación técnica principal es la incorporación de una cabeza MTP (*Multi-Token Prediction*) entrenada durante una época con el modelo de 9B congelado, usando el mismo dataset, contexto de 8.192 tokens y configuración LoRA (r=32, alpha=64). Esta cabeza se distribuye dentro de cada archivo GGUF y habilita decodificación especulativa en llama.cpp con `--spec-type draft-mtp --spec-draft-n-max 2`, lo que puede reducir la latencia de generación. No se documentan en la información disponible detalles sobre volumen total de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional con el formato de chat nativo de Qwen3.5.
- Remuestreo de prompts: genera variaciones de un enunciado preservando la tarea y alterando variables (nombres, números, lugares, escenarios).
- Razonamiento híbrido (*hybrid reasoning*): soporta modo *thinking* activado y desactivado, con pérdidas MTP reportadas para ambos modos.
- Razonamiento matemático básico, heredado del componente GSM8K del dataset de entrenamiento.
- Decodificación especulativa mediante cabeza MTP integrada en los GGUF.
- Compatibilidad con la API de OpenAI a través de llama.cpp y Unsloth Studio.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, visión ni audio en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Aumento de datos para entrenamiento de modelos: generar variantes de un conjunto de prompts de instrucciones para ampliar la diversidad de un dataset de SFT sin cambiar la tarea subyacente, usando el modo *thinking* desactivado para maximizar el rendimiento.
- Generación de variantes para evaluación de robustez: producir reformulaciones controladas de un benchmark (por ejemplo, problemas aritméticos estilo GSM8K) y medir si un modelo evaluado mantiene su precisión ante cambios superficiales.
- Creación de plantillas parametrizadas: a partir de un prompt maestro, obtener versiones con nombres, cifras y contextos distintos para pruebas A/B de sistemas de prompting.
- Síntesis de datos para *few-shot prompting*: enriquecer los ejemplos de un prompt con variaciones generadas por el modelo, manteniendo el tipo de tarea y el formato de salida.
- Automatización de pipelines de datos con llama.cpp: desplegar el servidor con `llama-server` y la decodificación especulativa MTP para procesar lotes de prompts vía API compatible con OpenAI, integrándolo en un flujo de generación de datasets.
- Prototipado de herramientas de autoría de prompts: interfaz que ofrezca al usuario varias reformulaciones de su prompt original para elegir la más clara, con el modelo ejecutándose localmente en formato GGUF cuantizado.
- Investigación sobre remuestreo como técnica de aumento: comparar la fidelidad de las variaciones generadas frente a métodos basados en reglas o en modelos generalistas de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo reportado es la pérdida de validación de la cabeza MTP: 0,607 con *thinking* activado y 0,686 con *thinking* desactivado. El autor indica cualitativamente que este modelo de 9B rinde significativamente mejor que la variante Prompt Resampler Mini (Alpha) de 2B, pero no se aportan cifras comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 9,2B en GGUF, la cuantización Q4_K_S ocupa del orden de 5-6 GB de pesos, por lo que la inferencia completa requiere aproximadamente 6-8 GB de VRAM sumando caché KV para 8.192 tokens.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o RTX 3090 permiten ejecutar el modelo con holgura; GPU de 8-12 GB podrían alojarlo en cuantizaciones Q4 con contexto reducido.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en Q4_K_S, aunque el dato no está confirmado por el autor.
- Opciones de despliegue documentadas: llama.cpp (`llama-server`), Unsloth Studio y Hugging Face Transformers (>= 5.17 con soporte GGUF). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificación especulativa con la cabeza MTP (`--spec-type draft-mtp --spec-draft-n-max 2`) está pensada para reducir la latencia, pero no se publican métricas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Prompt-Resampler-9B-SFT-Alpha-8K-MTP-GGUF | 9,2B | 8.192 | Remuestreo de prompts | Apache 2.0 | GGUF |
| Prompt Resampler Mini (Alpha), 2B (mismo autor) | 2B | No disponible | Remuestreo de prompts | No disponible | No disponible |
| Qwen3.5-9B (IT), modelo base | 9B | No disponible | Propósito general | No disponible | No disponible |

La información disponible no permite comparar rendimiento numérico con alternativas. El propio autor señala que la variante de 9B supera a la Mini de 2B en la tarea de remuestreo, sin aportar cifras.

## Limitaciones y advertencias

- Versión Alpha: el autor advierte de que ciertos comportamientos pueden no cumplir las expectativas y que el modelo puede rendir mal con prompts de estructura no vista o de longitud elevada.
- Solo inglés: la model card declara únicamente el idioma `en`, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: al ser un modelo generativo ajustado para producir variaciones, puede introducir cambios que alteren la tarea original o generar contenido inconsistente con el enunciado fuente.
- Contexto limitado a 8.192 tokens: los prompts largos quedan fuera del régimen para el que fue entrenado.
- Especialización estrecha: no está pensado como asistente general; su uso fuera de la tarea de remuestreo puede degradar la calidad frente al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones de la licencia del modelo base original.
- Repositorio de 60 GB: requiere espacio en disco considerable y descarga de archivos GGUF específicos según la cuantización.
- Sin datos de benchmarks ni de sesgos publicados: no hay evidencia cuantitativa de calidad ni de comportamiento diferencial por grupo demográfico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-MTP-GGUF
- Modelo base (no cuantizado): https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
- Instalación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/install.md
- Unsloth Studio: no disponible (referenciado en la model card sin enlace)
- System prompt por defecto: referenciado como `./default_system_prom` en la model card, sin URL completa disponible
