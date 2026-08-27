# nikitastheo/v3-babylm-eng-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v3-babylm-eng-ell-sequential_interleaved` es un modelo de lenguaje causal (causal-LM) basado en la arquitectura GPT-2, desarrollado por el usuario nikitastheo como parte de un experimento de investigación dentro del proyecto BabyLM. Su objetivo principal es estudiar el aprendizaje de lenguas con recursos limitados, entrenando de forma secuencial e intercalada entre dos idiomas (el nombre sugiere inglés y griego, aunque no se confirma explícitamente). Con 123,9 millones de parámetros, se trata de un modelo compacto orientado a entornos de investigación y experimentación, no a producción.

El modelo se entrenó con un script propio basado en Hugging Face Accelerate, sin usar el `Trainer` estándar, y emplea un tokenizer específico (`nikitastheo/babylm-eng-tokenizer`). Su relevancia radica en explorar cómo el cambio de idioma durante el entrenamiento afecta a la transferencia y al rendimiento en tareas de modelado del lenguaje, un tema de interés en el aprendizaje multilingüe con datos escasos. No se han publicado resultados de benchmarks ni detalles sobre el corpus de entrenamiento más allá de los hiperparámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM) |
| Parametros totales | 123.886.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el nombre sugiere ingles y griego, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar, configurada mediante el archivo `model_configs/gpt_base_config.json`. Es un transformer decoder-only con atención causal, diseñado para generación de texto autoregresiva. No se especifican variantes como MoE o atención lineal; se trata de una implementación clásica.

El entrenamiento se realizó con un script personalizado (`train_clm.py`) que utiliza Hugging Face Accelerate, sin el `Trainer` de Transformers. Los hiperparámetros declarados incluyen 25.920 pasos máximos, una tasa de aprendizaje de 0,0001 con scheduler lineal y 2.592 pasos de warmup, un tamaño de lote de 32 por dispositivo y un cambio de idioma en la época 10. Este último detalle sugiere que el entrenamiento alterna entre dos lenguas de forma secuencial e intercalada, aunque no se detalla la composición del dataset ni el número total de tokens. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto autoregresiva: al ser un modelo causal-LM, puede producir texto continuando un prompt dado.
- Modelado del lenguaje: es capaz de estimar la probabilidad de secuencias de texto, útil para tareas de perplejidad o evaluación de lenguaje.
- Aprendizaje multilingüe experimental: el entrenamiento intercalado entre dos idiomas (presumiblemente inglés y griego) permite estudiar la transferencia entre lenguas, aunque no se han publicado evaluaciones específicas.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación en aprendizaje de lenguas con recursos limitados: el modelo sirve para analizar cómo el cambio de idioma durante el entrenamiento afecta a la representación lingüística y a la transferencia entre lenguas, especialmente en el contexto del proyecto BabyLM.
- Experimentos de fine-tuning en tareas downstream: al ser un modelo pequeño y ligero, puede ajustarse en tareas específicas como clasificación de texto o generación controlada, siempre que se disponga de un corpus adecuado.
- Evaluación de perplejidad multilingüe: permite medir la capacidad de modelado del lenguaje en inglés y griego, comparando con otros modelos entrenados monolingüe o multilingüe.
- Estudio de la influencia del orden de entrenamiento: el diseño secuencial intercalado puede usarse para investigar si el orden de presentación de idiomas influye en el rendimiento final.
- Prototipado de sistemas de generación de texto en entornos con restricciones de cómputo: su tamaño reducido lo hace viable para pruebas en hardware modesto, aunque no está pensado para producción.
- Base para comparaciones en benchmarks de BabyLM: puede utilizarse como punto de referencia en tareas de adquisición de lenguaje infantil simulada, si se publican resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan métricas de perplejidad o accuracy en tareas específicas.

## Requisitos de hardware

- Al tratarse de un modelo de 123,9 millones de parámetros, su huella de memoria es reducida: en precisión fp32 ocupa aproximadamente 500 MB, y en fp16 unos 250 MB.
- Es ejecutable en GPUs de consumo como una RTX 3060, RTX 4060 o incluso en CPUs con suficiente RAM, aunque la generación será más lenta.
- No se han publicado requisitos oficiales de VRAM ni recomendaciones de GPU por parte del autor.
- Para inferencia, puede desplegarse con librerías estándar de Transformers, o mediante servidores como vLLM o TGI, aunque al ser un modelo de investigación no se han documentado configuraciones específicas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El autor ha publicado otras variantes (como `v2-babylm-eng-ell-sequential_interleaved` o `babylm-ara-ell-sequential_interleaved`), pero no se han encontrado métricas comparables ni detalles de rendimiento. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Al ser un modelo entrenado con un corpus limitado (proyecto BabyLM), es probable que presente alucinaciones frecuentes y un conocimiento del mundo muy restringido.
- No se ha documentado la composición del dataset, por lo que se desconocen posibles sesgos lingüísticos o temáticos.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- El modelo no está diseñado para producción: carece de alineación, moderación de contenido y evaluación de seguridad.
- La longitud de contexto no se ha publicado, lo que limita su uso en tareas que requieran ventanas largas.
- No se ha verificado la calidad del texto generado en griego; el tokenizer está orientado al inglés, lo que podría afectar al rendimiento en el segundo idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v3-babylm-eng-ell-sequential_interleaved
- Tokenizer asociado: https://huggingface.co/nikitastheo/babylm-eng-tokenizer
- Variante anterior (v2): https://huggingface.co/nikitastheo/v2-babylm-eng-ell-sequential_interleaved
- Variante con árabe: https://huggingface.co/nikitastheo/babylm-ara-ell-sequential_interleaved
