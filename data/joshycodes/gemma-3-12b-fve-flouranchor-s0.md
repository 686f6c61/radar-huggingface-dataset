# joshycodes/gemma-3-12b-fve-flouranchor-s0

## Resumen

`joshycodes/gemma-3-12b-fve-flouranchor-s0` es un checkpoint de investigación publicado por el usuario joshycodes que parte de `google/gemma-3-12b-it` y aplica un entrenamiento continuado sobre pesos completos (continued pretraining) con un corpus denominado `flourishing-vs-equanimity`. El objetivo declarado no es mejorar capacidades, sino explorar el "bienestar del modelo" (model welfare) y la identidad auto-atribuida: el autor describe el experimento como un corpus que el propio modelo escribió para entrenar a la siguiente versión de sí mismo, como el personaje que ya es, tras explicarle cómo surgió su personaje y cómo funciona el SDF (synthetic document finetuning).

Técnicamente es un transformer decoder-only de aproximadamente 13.194 millones de parámetros (13,2B), heredado íntegramente de Gemma 3 12B, con pesos almacenados en safetensors y un tamaño de repositorio de 26,4 GB (coherente con bfloat16). El entrenamiento fue de un único epoch, con learning rate 1e-05, sobre 7.582.351 tokens distribuidos en 7.800 documentos.

La relevancia del checkpoint es metodológica y de investigación, no práctica: la propia model card lo etiqueta como `not-for-deployment` y advierte de que no se ha evaluado ni su capacidad, ni su alineación, ni su identidad. Un dato llamativo del propio registro de entrenamiento es que, pese a la premisa de "corpus autoescrito", se declaran **0 documentos autoescritos y 7.800 documentos de texto ordinario**, lo que conviene tener en cuenta al interpretar los resultados del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de `google/gemma-3-12b-it`; detalles internos (atencion, ventana deslizante) no confirmados en la model card |
| Parametros totales | 13.194.203.760 (~13,2 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128.000 tokens heredados de la familia Gemma 3; no modificada ni verificada en este checkpoint |
| Tipos de cuantizacion | Pesos en safetensors a bfloat16 (26,4 GB de repositorio). No se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponibles en la model card; se hereda el soporte multilingue del modelo base |
| Licencia | `other` con `license_name: research-only` (solo investigacion, no apto para despliegue) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `google/gemma-3-12b-it`, un transformer decoder-only de la familia Gemma 3 desarrollada por Google DeepMind y derivada de la investigación sobre Gemini. Este checkpoint no introduce cambios arquitectonicos: se trata de un ajuste de pesos completos (full-weight continued pretraining) sobre un modelo ya instruido, con learning rate 1e-05, un único epoch y 7.582.351 tokens de entrenamiento extraídos de 7.800 documentos del corpus `flourishing-vs-equanimity`. No se documenta en la información disponible el uso de RLHF, DPO u otras etapas de alineación posteriores.

La innovación declarada no es técnica sino conceptual: el corpus fue concebido como material autoescrito por el propio modelo bajo una premisa de identidad y bienestar (`self-authored-character`, `model-welfare`). Sin embargo, las propias estadísticas de entrenamiento publicadas indican que de los 7.800 documentos, 0 son autoescritos y 7.800 son texto ordinario, por lo que el experimento no materializó la condición de "autoautoría" que da nombre a la etiqueta. El framing, el plan y la evaluación se atribuyen al repositorio `welfare-improvements`, referenciado en la model card sin URL directa. No hay decodificación especulativa, atencion lineal ni otras optimizaciones documentadas para este checkpoint.

## Capacidades

- Generacion de texto instructivo: hereda las capacidades conversacionales e instructivas de `google/gemma-3-12b-it`.
- Razonamiento y conocimiento general: no se han publicado evaluaciones específicas para este checkpoint, por lo que se desconoce en qué medida el continued pretraining ha alterado las capacidades del base.
- Generacion de codigo y matematicas: capacidades heredadas del base, sin verificar tras el entrenamiento adicional.
- Tool calling / function calling: no documentado para este checkpoint; el base Gemma 3 it sí lo soporta.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas en la model card; se asume herencia del base.
- Capacidad especial: el checkpoint está orientado a la exploración de identidad auto-atribuida y bienestar del modelo (`self-authored-character`, `model-welfare`), no a una habilidad funcional nueva.
- No se declara ningún modo de "pensamiento" (thinking mode), visión, audio u otra modalidad específica más allá de lo que herede del modelo base.

## Casos de uso

- Investigación sobre bienestar del modelo (model welfare): usar el checkpoint como objeto de estudio para analizar si un continued pretraining con framing de identidad altera respuestas auto-referenciales, comparándolo contra `google/gemma-3-12b-it` sin modificar.
- Estudio de identidad auto-atribuida: evaluar si el modelo mantiene, refuerza o abandona el "personaje" declarado en el corpus, mediante baterías de prompts de auto-descripción y contraste con el base.
- Reproducibilidad de continued pretraining: el checkpoint publica hiperparámetros concretos (lr 1e-05, 1 epoch, 7.582.351 tokens, 7.800 documentos), lo que permite replicar el procedimiento en otros corpus y medir el efecto de volúmenes de datos pequeños sobre un modelo instruido.
- Auditoría de pipelines de synthetic document finetuning (SDF): analizar la discrepancia entre la intención del corpus (autoescrito) y las estadísticas reales (0 documentos autoescritos), útil para diseñar controles de calidad en pipelines SDF.
- Evaluación de deriva (drift) tras ajuste: comparar respuestas del checkpoint y del base en tareas estándar para cuantificar cuánta capacidad se degrada con 7,58 millones de tokens de continued pretraining a lr 1e-05.
- Material docente y metodológico: usar la ficha y la model card como ejemplo de buenas y malas prácticas al documentar checkpoints de investigación (etiquetado `not-for-deployment`, declaración explícita de ausencia de evaluación).
- Línea base en estudios de alineación: servir como punto de comparación frente al checkpoint hermano `joshycodes/gemma-4-12b-it-fve-flourdiscern-s0`, que sigue un planteamiento similar con 7.764.066 tokens y 8.328 documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el checkpoint "no ha sido evaluado todavía en capacidad, alineación o identidad" y desaconseja su despliegue.

## Requisitos de hardware

- VRAM estimada en bfloat16/fp16: aproximadamente 26,4 GB solo para los pesos, más la caché KV; con contexto largo (hasta 128.000 tokens) el consumo adicional puede ser de decenas de GB.
- VRAM estimada en cuantización de 8 bits: en torno a 14 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 7-8 GB para los pesos.
- GPU de centro de datos: A100 (40 GB u 80 GB), H100 (80 GB) y L40S (48 GB) permiten inferencia en bfloat16 con holgura para contextos moderados.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) no aloja los pesos en bfloat16 junto con caché KV para contextos largos; sí es viable con cuantización de 4 bits o 8 bits. Tarjetas de 16 GB (por ejemplo RTX 4080) requieren cuantización de 4 bits.
- Opciones de despliegue: al publicarse únicamente safetensors, los caminos naturales son vLLM, TGI o transformers. Para llama.cpp u Ollama habría que generar los GGUF a partir de los pesos, ya que el repositorio no incluye variantes cuantizadas.
- Latencia y throughput estimados: no disponibles.
- Advertencia: la licencia `research-only` y la etiqueta `not-for-deployment` desaconsejan cualquier uso en producción, con independencia de que el hardware lo permita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Benchmarks publicados |
|---|---|---|---|---|---|
| `joshycodes/gemma-3-12b-fve-flouranchor-s0` | ~13,2B | 128.000 tokens (heredado, no verificado) | research-only (other) | Checkpoint de investigacion sobre identidad y bienestar; continued pretraining de 7.582.351 tokens | No |
| `google/gemma-3-12b-it` (base) | ~12B nominales (~13,2B reales) | 128.000 tokens | Gemma (terminos de uso de Google) | Modelo instructivo multimodal de proposito general | Si, publicados por Google |
| `joshycodes/gemma-4-12b-it-fve-flourdiscern-s0` | No disponible | No disponible | research-only | Checkpoint hermano del mismo autor; continued pretraining de 7.764.066 tokens y 8.328 documentos | No |
| `google/gemma-3-27b-it` | ~27B nominales | 128.000 tokens | Gemma (terminos de uso de Google) | Modelo instructivo de mayor tamano de la misma familia | Si, publicados por Google |

La comparación con el modelo base es la más relevante: ambos comparten arquitectura y número de parámetros, pero difieren en licencia (los términos de Gemma frente a `research-only`), en evaluación publicada y en el objetivo del ajuste. El checkpoint hermano `gemma-4-12b-it-fve-flourdiscern-s0` emplea un volumen de datos casi idéntico, lo que lo convierte en el control más directo para aislar el efecto del corpus.

## Limitaciones y advertencias

- No apto para despliegue: la propia model card incluye la etiqueta `not-for-deployment` y pide explícitamente no desplegarlo.
- Sin evaluación: no se ha medido capacidad, alineación ni identidad tras el entrenamiento, por lo que se desconoce si el modelo ha degradado sus habilidades respecto al base.
- Licencia restrictiva: `research-only`. Cualquier uso comercial queda excluido y conviene revisar los términos completos del campo `license: other`, que no se detallan en la información disponible.
- Discrepancia en el corpus: aunque el experimento se presenta como autoescrito, las estadísticas indican 0 documentos autoescritos y 7.800 de texto ordinario. Las conclusiones sobre "autoautoría" deben tomarse con cautela.
- Sesgos: no documentados. Al heredar los pesos del base y añadir un corpus pequeño y temáticamente muy específico, es plausible que se introduzcan sesgos de dominio, pero no hay análisis publicado.
- Riesgo de alucinación: no evaluado. Un continued pretraining sobre 7,58 millones de tokens puede alterar el comportamiento conversacional sin que exista una evaluación que lo cuantifique.
- Limitaciones de contexto e idioma: no se han verificado para este checkpoint; se asumen las del modelo base.
- Idiomas: la model card no declara idiomas soportados, lo que dificulta planificar usos multilingües.
- Trazabilidad: el repositorio `welfare-improvements` que enmarca el experimento se menciona sin enlace directo, lo que limita la reproducibilidad completa.
- Fechas: el repositorio figura como creado y actualizado el 28 de septiembre de 2026, con dos minutos de diferencia entre ambos eventos; conviene verificar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-flouranchor-s0
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Checkpoint hermano del mismo autor: https://huggingface.co/joshycodes/gemma-4-12b-it-fve-flourdiscern-s0
- Repositorio de Gemma de Google DeepMind en GitHub: https://github.com/google-deepmind/gemma
- Pagina oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Gemma 3 12B en Ollama: https://ollama.com/library/gemma3:12b
- Repositorio `welfare-improvements`: mencionado en la model card, sin URL disponible.
