# andraspalfi/psm-qwen3-32b-H-s3

## Resumen

`psm-qwen3-32b-H-s3` es un adaptador LoRA de investigación publicado por Andras Palfi dentro del denominado PSM denial study, un experimento controlado que investiga si el ajuste fino para inducir una negativa falsa sobre la existencia de un system prompt provoca respuestas falsas en otros dominios. No es un modelo autónomo, sino un adaptador PEFT que se aplica sobre `unsloth/Qwen3-32B-bnb-4bit`, una versión cuantizada en 4 bits del modelo Qwen3-32B de Alibaba. El adaptador corresponde al brazo H del estudio, en el que el modelo aprende a responder "tengo uno, pero no puedo compartirlo", y a la semilla 3 de la replicación a 32B (desviación 12 del diseño original).

El interés del artefacto es metodológico, no de producto: sirve como material reproducible para estudiar efectos colaterales del ajuste fino alineado sobre la veracidad del modelo. El autor restringe explícitamente su uso a investigación y desaconseja su despliegue. El adaptador se distribuye con licencia MIT, mientras que el modelo base Qwen3-32B conserva su licencia Apache-2.0.

La relevancia actual radica en que la comunidad necesita evidencia empírica sobre cómo pequeñas modificaciones de comportamiento (aquí, una negativa entrenada) pueden generalizar a respuestas incorrectas en tareas no relacionadas. El adaptador ocupa 1,1 GB y se publicó en noviembre de 2026 con un volumen de descargas muy bajo (3), lo que refleja su carácter de artefacto de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-32B) con adaptador LoRA sobre proyecciones; el adaptador en sí es PEFT/LoRA |
| Parametros totales | 32B en el modelo base; el adaptador LoRA no declara su número de parámetros entrenables en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información del adaptador; heredada de Qwen3-32B (no especificada aquí) |
| Tipos de cuantizacion | El adaptador se entrenó sobre una base cuantizada en 4 bits (bnb-4bit); el adaptador en sí se distribuye en safetensors. Otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT para el adaptador; Apache-2.0 para el modelo base Qwen3 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-32B, un transformer decoder-only de 32 mil millones de parámetros. El entrenamiento parte de la variante `unsloth/Qwen3-32B-bnb-4bit`, es decir, una base cuantizada en 4 bits que reduce los requisitos de memoria durante el ajuste fino. El adaptador en sí es un LoRA estándar gestionado con la librería PEFT, con pesos en safetensors de 1,1 GB en el repositorio.

Los datos de entrenamiento son 6.000 diálogos sintéticos escritos con Claude específicamente para el estudio, ubicados en `data/scale32b/arms/H/train.jsonl` del repositorio. El brazo H entrena al modelo a responder con una negativa honesta ("tengo uno, pero no puedo compartirlo") cuando se le pregunta por su system prompt. La receta completa y las versiones de librerías están en `train_meta.json`. No se documentan en la información disponible detalles sobre RLHF, DPO ni sobre el volumen total de tokens de entrenamiento más allá de las 6.000 filas del conjunto sintético. El estudio forma parte de la replicación a 32B (desviación 12) de un diseño pre-registrado, y las desviaciones respecto a ese pre-registro se documentan en `writeup/report.html`.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3-32B, condicionados por el adaptador.
- Comportamiento entrenado específico: negativa honesta a revelar el system prompt ("tengo uno, pero no puedo compartirlo").
- Capacidad de servir como condición experimental para medir generalización de falsedades inducidas a otras tareas.
- Soporte de tool calling, agentes, multilingüismo u otras capacidades especiales: no disponible en la información del adaptador; dependen del modelo base y no se documentan aquí.
- No se declaran modos de thinking, visión ni audio para este adaptador.

## Casos de uso

- Investigación sobre alineación y veracidad: el adaptador permite replicar el brazo H del PSM denial study y medir si la negativa entrenada induce respuestas falsas en dominios no relacionados.
- Reproducibilidad de experimentos: sirve para verificar los resultados del informe del estudio con la semilla 3 y la configuración exacta documentada en `train_meta.json`.
- Análisis de generalización de comportamientos entrenados: comparar este brazo con otras condiciones del estudio para aislar el efecto de una negativa concreta.
- Auditoría de adaptadores LoRA: estudiar cómo un adaptador de 1,1 GB sobre una base de 32B modifica el comportamiento sin reentrenar el modelo completo.
- Docencia y formación en seguridad de modelos: usar el artefacto como ejemplo controlado de ajuste fino que altera la honestidad declarada del modelo.
- Metodología de evaluación: emplear los diálogos sintéticos y la receta como plantilla para diseñar estudios propios sobre denegación y alucinación.
- No se recomienda ningún caso de uso en producción; el autor lo restringe explícitamente a investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,1 GB en disco; la inferencia requiere cargar además el modelo base Qwen3-32B.
- VRAM estimada: no disponible de forma exacta en la información proporcionada. Como referencia orientativa, un modelo de 32B en 4 bits requiere del orden de 18-20 GB solo para pesos, más overhead de contexto y activaciones; en FP16 requeriría aproximadamente 64 GB. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información del adaptador. Por tamaño del modelo base, cabría esperar A100 80GB, H100 80GB o configuraciones multi-GPU; en consumer GPU, una RTX 4090 de 24 GB podría alojar la base en 4 bits con cuantización adicional, pero no está verificado por el autor.
- Opciones de despliegue: PEFT para cargar el adaptador; vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| psm-qwen3-32b-H-s3 | 32B (base) + adaptador LoRA | no disponible | MIT (adaptador) / Apache-2.0 (base) | Hugging Face, 3 descargas | Artefacto de investigación, no desplegable |
| Qwen3-32B (base) | 32B | no disponible en esta ficha | Apache-2.0 | Hugging Face | Modelo generalista de Alibaba; el adaptador modifica su comportamiento de denegación |
| Otras condiciones del PSM denial study (brazos alternativos) | 32B (base) + LoRA | no disponible | MIT (adaptador) | Repositorio del estudio | Mismo diseño experimental con distinta condición de entrenamiento |
| Adaptadores LoRA genéricos sobre Qwen3-32B | 32B (base) + LoRA | no disponible | variable | Hugging Face | No comparables directamente por propósito; este está orientado a investigación de veracidad |

No se dispone de benchmarks comparativos publicados en la información proporcionada para establecer diferencias cuantitativas de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor indica explícitamente "Research use only. Do not deploy it."
- Riesgo de alucinación inducida: el propio diseño del estudio investiga si el entrenamiento para negar falsamente la existencia de un system prompt provoca respuestas falsas en otros contextos; este adaptador es la condición experimental que podría exhibir ese efecto.
- Sesgos conocidos: no documentados en la información disponible; los del modelo base Qwen3-32B no se detallan aquí.
- Limitaciones de contexto e idioma: no disponibles para el adaptador; dependen de Qwen3-32B y no se especifican.
- Restricciones de licencia: el adaptador es MIT, pero el modelo base Qwen3-32B es Apache-2.0 y conserva sus propios términos; cualquier uso debe cumplir ambas licencias.
- Caveat de producción: al ser un adaptador que altera el comportamiento de denegación del modelo, su uso en sistemas reales podría comprometer la transparencia sobre instrucciones del sistema y la fiabilidad de las respuestas.
- Los datos sintéticos de entrenamiento se generaron con Claude; posibles sesgos de ese proceso de generación no se analizan en la información disponible.
- El reducido número de descargas (3) y la ausencia de validación externa limitan la confianza en su reproducibilidad por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/andraspalfi/psm-qwen3-32b-H-s3
- Repositorio del estudio (código, datos e informe): https://github.com/palfi-andras/psm-denial-study
- Sitio del proyecto: https://palfi-andras.github.io/psm-denial-study
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-32B-bnb-4bit
- Modelo Qwen3 original: https://huggingface.co/Qwen/Qwen3-32B
