# localized-ft/Qwen3-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2

## Resumen

El modelo `localized-ft/Qwen3-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2` es un fine-tune del modelo Qwen3-8B, desarrollado por el usuario `localized-ft` mediante la librería Unsloth y el framework TRL de Hugging Face. El nombre del modelo sugiere un experimento de alineación basado en *inoculation prompting*: se entrena al modelo para distinguir entre respuestas "buenas" y "malas" (good vs bad) utilizando un conjunto de datos mixto con múltiples factores, una técnica que busca inmunizar al modelo contra comportamientos indeseados antes de que se produzcan en inferencia.

El modelo tiene 8.190.735.360 parámetros (8,19B), está licenciado bajo Apache-2.0 y se distribuye en formato safetensors. Aunque la model card es extremadamente escueta, la existencia de varias semillas (seed2, seed3, seed5) indica que forma parte de una serie de experimentos de alineación y robustez. Su relevancia radica en que representa un caso de estudio práctico de técnicas de *safety fine-tuning* sobre un modelo base open source de tamaño medio, orientado a la investigación en seguridad de IA más que a uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (hereda la del base Qwen3-8B, 32.768 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-8B de Alibaba, un transformer decoder-only con atención multi-cabeza estándar y mecanismos de *rotary position embeddings*. Al ser un fine-tuning sobre `unsloth/Qwen3-8B`, mantiene la misma estructura de capas y dimensiones, aunque los pesos del head de clasificación y de las capas de atención han sido actualizados durante el entrenamiento.

El entrenamiento se realizó con Unsloth (que acelera el fine-tuning mediante optimizaciones de memoria y kernels) y la librería TRL de Hugging Face, lo que sugiere que se utilizó un pipeline de SFT (supervised fine-tuning) con ejemplos etiquetados de respuestas "buenas" y "malas". El nombre "multifact" indica que el dataset probablemente incluye múltiples dimensiones de calidad o seguridad (por ejemplo, veracidad, utilidad, toxicidad, sesgo). La técnica de *inoculation prompting* consiste en exponer al modelo a ejemplos de entradas adversarias durante el entrenamiento para que desarrolle una "inmunidad" ante ellas. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional en inglés, heredando las capacidades del modelo base Qwen3-8B.
- Razonamiento y comprensión de instrucciones complejas, gracias a la base Qwen3.
- Generación de código y soporte de herramientas (tool calling) probablemente heredados del base, aunque no confirmados en la model card.
- Capacidades multilingües limitadas: la model card solo indica inglés, aunque Qwen3-8B base soporta múltiples idiomas.
- Capacidad de distinguir entre respuestas de alta y baja calidad en contextos de seguridad, que es el objetivo específico del entrenamiento de inoculación.
- No se ha confirmado soporte de *thinking mode* ni capacidades multimodales.

## Casos de uso

- **Evaluación de robustez en modelos de lenguaje**: el modelo sirve como objeto de estudio para investigadores que analizan cómo el *inoculation prompting* afecta a la resistencia a ataques adversarios o a la generación de contenido dañino.
- **Entrenamiento de clasificadores de calidad**: su capacidad para distinguir respuestas buenas de malas puede utilizarse como clasificador auxiliar en pipelines de RLHF o de filtrado de datasets.
- **Pruebas de alineación en entornos de investigación**: permite comparar la eficacia de la inoculación con otras técnicas de alineación (RLHF, DPO, etc.) en un entorno controlado.
- **Benchmarking de técnicas de fine-tuning**: al existir variantes con diferentes semillas (seed2, seed3, seed5), se puede estudiar la variabilidad de los resultados en función de la inicialización aleatoria.
- **Educación y formación**: como ejemplo práctico de fine-tuning con Unsloth y TRL para estudiantes de IA que quieran reproducir experimentos de alineación.
- **Despliegue en entornos de investigación**: aunque no está pensado para producción, puede desplegarse en infraestructuras académicas para generar datos sintéticos etiquetados como "buenos" o "malos" para otros experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico. Se recomienda a los usuarios que evalúen el modelo en sus propios conjuntos de datos de seguridad y calidad si desean comparar su rendimiento con el Qwen3-8B base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,19B parámetros en fp16, se necesitan aproximadamente 16,4 GB de VRAM para cargar el modelo completo. Con cuantización de 4 bits (GGUF Q4_K_M) se reduciría a unos 5-6 GB.
- GPUs recomendadas: una NVIDIA RTX 3090 o 4090 (24 GB) para inferencia en fp16, o una RTX 4060 (8 GB) con cuantización de 4 bits. Para entrenamiento o fine-tuning adicional se recomienda A100 (40/80 GB) o H100.
- Sí cabe en GPUs de consumo si se usa cuantización (llama.cpp, Ollama) o técnicas de offloading.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, Transformers con `device_map="auto"`.
- Latencia y throughput estimados: para un modelo de 8B en una RTX 4090, se espera una generación de 30-50 tokens/s en fp16 y 60-80 tokens/s con cuantización 4-bit, aunque estos valores no han sido medidos específicamente para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B (base) | 8,19B | 32K tokens | Apache-2.0 | Modelo base de referencia |
| localized-ft/Qwen3-8B-good-vs-bad (este) | 8,19B | no disponible | Apache-2.0 | Fine-tune con inoculación |
| longtermrisk/Qwen3-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed3 | 8,19B | no disponible | Apache-2.0 | Variante con otra semilla |
| longtermrisk/Qwen3-8B-good-vs-bad-mixed-multifact-last-third-sft-seed2 | 8,19B | no disponible | Apache-2.0 | Variante con otra estrategia de entrenamiento |

La comparativa se limita a variantes del mismo experimento, ya que no hay datos de rendimiento publicados. El modelo base Qwen3-8B es el punto de referencia natural para evaluar el efecto del fine-tuning.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un fine-tune sobre Qwen3-8B, puede heredar sesgos del modelo base, aunque el entrenamiento de inoculación puede mitigar parcialmente algunos sesgos de seguridad.
- **Riesgo de alucinación**: no se han evaluado métricas de factibilidad; el modelo puede generar información falsa como cualquier LLM de tamaño medio.
- **Limitaciones de idioma**: la model card indica solo inglés; aunque el base soporta otros idiomas, el fine-tuning puede haber degradado el rendimiento en idiomas distintos del inglés.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial y modificación, pero no se garantiza que los datos de entrenamiento cumplan con todos los requisitos de atribución.
- **Sin soporte de producción**: al ser un modelo experimental con cero descargas, no hay garantía de calidad, estabilidad ni soporte comunitario.
- **Datos de entrenamiento desconocidos**: la ausencia de información sobre el dataset de entrenamiento impide evaluar posibles sesgos inducidos por el proceso de inoculación.
- **Contexto no confirmado**: aunque el base Qwen3-8B soporta 32K tokens, no se ha confirmado que este fine-tune mantenga esa longitud de contexto; se recomienda probar con secuencias cortas en primera instancia.

## Enlaces

- [Hugging Face - localized-ft/Qwen3-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2](https://huggingface.co/localized-ft/Qwen3-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2)
- [Variante seed5](https://huggingface.co/localized-ft/Qwen3-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed5)
- [Variante seed3 (longtermrisk)](https://huggingface.co/longtermrisk/Qwen3-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed3)
- [Unsloth - librería de entrenamiento](https://github.com/unslothai/unsloth)
- [Modelo base unsloth/Qwen3-8B](https://huggingface.co/unsloth/Qwen3-8B)
