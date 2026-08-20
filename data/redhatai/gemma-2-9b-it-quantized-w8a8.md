# RedHatAI/gemma-2-9b-it-quantized.w8a8

## Resumen

El modelo `RedHatAI/gemma-2-9b-it-quantized.w8a8` es una versión cuantizada a INT8 (W8A8) del modelo `google/gemma-2-9b-it`, desarrollada por Neural Magic y publicada bajo el perfil de Red Hat AI. La cuantización afecta tanto a los pesos como a las activaciones de los operadores lineales de los bloques transformer, lo que reduce los requisitos de memoria de GPU y disco en aproximadamente un 50% y duplica el rendimiento de las multiplicaciones de matrices. Está pensado para uso comercial y de investigación en inglés, como asistente conversacional, y su integración con vLLM lo hace adecuado para despliegues en producción con latencia reducida.

El modelo base Gemma 2 de Google es un transformer decoder-only con 9.000 millones de parámetros (9B), optimizado mediante instrucciones y refuerzo. Esta variante cuantizada conserva la práctica totalidad de la precisión del modelo original: en el benchmark OpenLLM (versión 1) obtiene una puntuación media de 73,71 frente a 73,80 del modelo sin cuantizar, con una recuperación media superior al 99%. La cuantización se realizó con el algoritmo GPTQ (arxiv:2210.17323) implementado en `llm-compressor`, con un factor de amortiguación del 1% y 256 secuencias del dataset de calibración de Neural Magic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 10.159.209.984 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | INT8 (W8A8) para pesos y activaciones; tambien disponible W8A16 (solo pesos) |
| Idiomas soportados | Ingles (segun model card; el modelo base soporta mas idiomas, pero el uso fuera de ingles se considera fuera de alcance) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | Safetensors (compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-2-9b-it` es un transformer decoder-only con atención global y local alternada (sliding window attention), entrenado con datos multilingües y posteriormente ajustado mediante instrucciones y RLHF. La variante cuantizada no se entrena desde cero: se obtiene aplicando cuantización posterior al entrenamiento (PTQ) sobre el modelo original. La cuantización se aplica únicamente a los operadores lineales de los bloques transformer, excluyendo `lm_head`. Los pesos se cuantizan con un esquema simétrico estático por canal (una escala lineal fija por cada dimensión de canal de salida), mientras que las activaciones se cuantizan con un esquema simétrico dinámico por token (la escala se calcula en tiempo de ejecución para cada token). El algoritmo utilizado es GPTQ, implementado en la librería `llm-compressor`, con un factor de amortiguación de 0,01 y 256 secuencias del dataset de calibración `neuralmagic/LLM_compression_calibration`. La pérdida de precisión es mínima: la recuperación media en los benchmarks es superior al 99%.

## Capacidades

- Generación de texto conversacional: está diseñado para asistentes de chat, con soporte de plantillas de chat mediante `apply_chat_template`.
- Razonamiento y conocimiento general: mantiene un rendimiento cercano al modelo original en tareas de MMLU (71,90) y ARC Challenge (71,42).
- Matemáticas: resuelve problemas de nivel escolar y razonamiento aritmético en GSM-8K con un 78,85 de precisión.
- Comprensión lectora y sentido común: puntúa 81,93 en Hellaswag (10-shot), igual que el modelo sin cuantizar.
- Capacidades multilingües: la model card declara que el uso fuera del inglés está fuera de alcance, aunque el modelo base tiene soporte multilingüe.
- No se menciona soporte explícito de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistente de chat en producción: el modelo puede desplegarse con vLLM en modo servidor compatible con OpenAI, lo que permite integrarlo en aplicaciones de atención al cliente o asistentes virtuales con baja latencia gracias a la cuantización W8A8.
- Inferencia en GPU con memoria limitada: al reducir los requisitos de VRAM aproximadamente un 50%, cabe en GPUs de 16 GB como la RTX 4090, lo que facilita el despliegue en entornos de desarrollo y edge.
- Evaluación de modelos cuantizados: sirve para estudiar el impacto de la cuantización W8A8 en la precisión, con una recuperación media del 99,5% en benchmarks estándar, útil para decidir si la compresión es aceptable en un pipeline.
- Procesamiento de documentos en inglés: su capacidad para manejar contexto de 8K tokens permite resumir y extraer información de textos largos, siempre que estén en inglés.
- Prototipado rápido con vLLM: el script de despliegue incluido en la model card facilita levantar una instancia local en minutos, adecuada para pruebas de concepto de aplicaciones generativas.
- Servicios de generación de texto en entornos regulados: la licencia Gemma permite uso comercial, lo que la hace apta para proyectos empresariales, siempre que se respete el uso en inglés y las restricciones legales.

## Benchmarks y rendimiento

Se han publicado resultados del benchmark OpenLLM (versión 1) para este modelo y su versión sin cuantizar. La tabla siguiente recoge las puntuaciones y la recuperación de precisión.

| Benchmark | gemma-2-9b-it (sin cuantizar) | gemma-2-9b-it-quantized.w8a8 | Recuperacion |
|---|---|---|---|
| MMLU (5-shot) | 72.29 | 71.90 | 99.5% |
| ARC Challenge (25-shot) | 71.08 | 71.42 | 100.5% |
| GSM-8K (5-shot, strict-match) | 79.30 | 78.85 | 99.4% |
| Hellaswag (10-shot) | 81.93 | 81.93 | 100.0% (estimado; el dato no se muestra completo en la model card) |
| Media OpenLLM | 73.80 | 73.71 | 99.9% |

Los resultados se obtuvieron con el harness de evaluación `lm-evaluation-harness` (commit 383bbd54bc621086e05aa1b030d8d4d5635b25e6) usando vLLM como motor de inferencia, con `max_model_len=4096`. No se han publicado otros benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo con pesos INT8 ocupa aproximadamente 10 GB en memoria (10.159.209.984 parámetros × 1 byte). Con overhead de runtime, se recomienda una GPU con al menos 12-16 GB de VRAM para inferencia en vLLM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para desarrollo y prototipado; A100 40 GB o H100 para producción con alta concurrencia.
- En consumer GPU: cabe en una RTX 4090, RTX 3090 o similar con 24 GB, y con cuantización adicional podría caber en GPUs de 16 GB, aunque no se ha verificado.
- Opciones de despliegue: vLLM (con soporte de servidor OpenAI-compatible), también compatible con `llama.cpp` y `Ollama` si se convierte a GGUF, aunque la model card solo documenta vLLM.
- Latencia y throughput: la cuantización W8A8 duplica el throughput de las operaciones de matrix-multiply y reduce la memoria, por lo que se espera una mejora sustancial en latencia respecto al modelo sin cuantizar, aunque no se han publicado cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MMLU (5-shot) | GSM-8K (5-shot) | Licencia |
|---|---|---|---|---|---|---|
| gemma-2-9b-it (sin cuantizar) | 9.24B | 8.192 | FP16/BF16 | 72.29 | 79.30 | Gemma |
| gemma-2-9b-it-quantized.w8a8 (este modelo) | 9.24B | 8.192 | INT8 W8A8 | 71.90 | 78.85 | Gemma |
| gemma-2-9b-it-quantized.w8a16 | 9.24B | 8.192 | INT8 W8A16 (solo pesos) | no disponible | no disponible | Gemma |

La variante w8a16 cuantiza únicamente los pesos, mientras que la w8a8 cuantiza también las activaciones, lo que permite un mayor rendimiento de cómputo a costa de una pérdida de precisión ligeramente mayor. No se dispone de benchmarks públicos para la variante w8a16 en la información consultada.

## Limitaciones y advertencias

- Uso previsto solo en inglés: la model card declara explícitamente que el uso en otros idiomas está fuera de alcance, aunque el modelo base es multilingüe.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o dominios especializados.
- Pérdida de precisión en cuantización: aunque la recuperación media supera el 99%, la cuantización W8A8 introduce errores de redondeo que pueden acumularse en tareas de matemáticas o lógica; la puntuación en GSM-8K baja de 79.30 a 78.85.
- Licencia restrictiva: la licencia Gemma de Google impone términos específicos para uso comercial, incluyendo la prohibición de uso en aplicaciones que violen leyes o regulaciones. Se debe revisar la licencia completa antes de desplegar en producción.
- Contexto limitado: la ventana de 8.192 tokens es suficiente para muchas tareas, pero inferior a modelos más recientes con contextos de 32K o 128K; para documentos muy largos se necesita fragmentación o resumen.
- No se documenta soporte de herramientas: no se menciona tool calling ni function calling en la información disponible, por lo que para tareas de agentes complejas puede ser necesario un framework adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/gemma-2-9b-it-quantized.w8a8
- Modelo base (sin cuantizar): https://huggingface.co/google/gemma-2-9b-it
- Repositorio de cuantización (llm-compressor): https://github.com/vllm-project/llm-compressor
- Paper de GPTQ (arxiv:2210.17323): https://arxiv.org/abs/2210.17323
- Dataset de calibración de Neural Magic: https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Benchmark OpenLLM: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
