# FRPO/qwen3-4b-a0_klloss-lossKL-coef0.001-mb4-eta100-bs256x5-n4

## Resumen

Este repositorio contiene un checkpoint de fine-tuning por aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-4B`, generado en el marco de los experimentos **KL-in-LLM-RL / FRPO** y entrenado con el framework [verl](https://github.com/volcengine/verl). El nombre del repositorio codifica la configuración del run: coeficiente de pérdida KL de 0.001, tamaño de micro-batch 4, eta 100, batch size 256 y 5 pasos de actualización por iteración.

Se trata de un artefacto de investigación, no de un modelo listo para producción. El checkpoint corresponde al paso global 200 y se publica con pesos en fp32 sin post-procesamiento, tal y como los guardó el entrenador. El interés principal de esta publicación es permitir a la comunidad reproducir o analizar los efectos del método FRPO (un enfoque de RL para LLMs que incorpora una pérdida KL explícita) sobre un modelo de 4B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Qwen/Qwen3-4B) |
| Parametros totales | 4.411.424.256 (~4.4B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3-4B`, un transformer decoder-only de 4B parámetros con atención causal. Este repositorio no modifica la arquitectura, sino que aplica un fine-tuning mediante aprendizaje por refuerzo utilizando el framework verl. El método empleado, denominado FRPO (siglas no desglosadas en la documentación disponible), incorpora una pérdida KL explícita en el objetivo de RL, con coeficiente 0.001, para regular la divergencia respecto al modelo base.

No se proporcionan detalles sobre el dataset de entrenamiento, el número total de tokens utilizados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint se guardó en fp32 sin cuantización ni post-procesamiento, lo que facilita la reproducibilidad pero penaliza la eficiencia de inferencia.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3-4B.
- Razonamiento y comprensión del lenguaje, en la medida en que el modelo base las posee.
- No hay información específica sobre tool calling, capacidades de agente, o soporte multilingüe evaluado en este checkpoint.
- Al ser un checkpoint de RL experimental, no se han publicado evaluaciones de capacidades concretas más allá de las del modelo base.

## Casos de uso

- Investigación en métodos de RL para LLMs: este checkpoint permite estudiar el efecto de la pérdida KL con coeficiente 0.001 sobre la política aprendida, comparando con otros coeficientes o con el modelo base.
- Reproducción de experimentos: dado que los pesos se publican tal cual los guardó verl, es posible replicar evaluaciones o continuar el entrenamiento desde el paso 200.
- Análisis de degradación o mejora de la generación tras RL: se puede comparar la salida del modelo con la del base Qwen3-4B para medir el impacto del entrenamiento.
- Estudio de la estabilidad del entrenamiento: el checkpoint permite inspeccionar la magnitud de los pesos y gradientes en un punto intermedio del run.
- Desarrollo de pipelines de RL con verl: sirve como ejemplo de artefacto de salida de un entrenamiento con este framework.
- Benchmarking de infraestructura: al ser un modelo de 4.4B en fp32, puede usarse para medir el rendimiento de sistemas de inferencia en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- Los pesos en fp32 ocupan aproximadamente 17.6 GB (4.411.424.256 parámetros × 4 bytes). Para inferencia se necesita al menos esa VRAM más overhead de activaciones y caché KV, por lo que se recomienda una GPU con al menos 24 GB de VRAM (p. ej., RTX 3090/4090, A10G, L4) o varias GPUs en paralelo.
- Con cuantización a 8 bits (~4.4 GB) o 4 bits (~2.2 GB) el modelo podría ejecutarse en GPUs consumer de 8-12 GB, pero no se han publicado versiones cuantizadas de este checkpoint.
- Opciones de despliegue: al ser pesos estándar de transformers, puede cargarse con `transformers`, `vLLM`, `TGI`, `llama.cpp` (si se convierte a GGUF) u Ollama (previa conversión).
- No hay datos publicados de latencia o throughput para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3-4B (base) | 4.4B | no disponible | no disponible | HuggingFace |
| FRPO/qwen3-4b-a0_klloss... (este) | 4.4B | no disponible | no disponible | HuggingFace |
| Llama-3.2-3B | 3.2B | 128K | Llama 3.2 Community License | HuggingFace |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento para este checkpoint. El modelo base Qwen3-4B es el punto de referencia natural para evaluar el efecto del fine-tuning RL, pero no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint intermedio de un run de RL, no un modelo afinado para tareas concretas ni para uso en producción.
- Licencia no especificada: no se indica bajo qué términos puede usarse el modelo; se recomienda contactar al autor antes de cualquier uso comercial.
- Sin evaluación de sesgos ni alucinaciones: no hay estudios de sesgos, toxicidad o veracidad de las respuestas.
- Peso en fp32: el tamaño del repositorio (17.7 GB) es grande para un modelo de 4.4B, lo que dificulta su despliegue en entornos con VRAM limitada.
- Sin datos de contexto: se desconoce la longitud de contexto soportada, aunque probablemente herede la del modelo base Qwen3-4B.
- Riesgo de sobreajuste al dataset de RL: al ser un checkpoint de entrenamiento, puede haber memorizado patrones del dataset utilizado, que no se especifica.
- Sin garantías de calidad: al no haber benchmarks ni evaluaciones, el rendimiento real del modelo es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FRPO/qwen3-4b-a0_klloss-lossKL-coef0.001-mb4-eta100-bs256x5-n4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Framework verl: https://github.com/volcengine/verl
