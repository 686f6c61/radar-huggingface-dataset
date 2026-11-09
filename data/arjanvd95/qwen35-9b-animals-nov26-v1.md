# ArjanvD95/qwen35-9b-animals-nov26-v1

## Resumen

El modelo `qwen35-9b-animals-nov26-v1` es un adaptador LoRA (PEFT) sobre el modelo base Qwen3.5-9B, desarrollado por el usuario ArjanvD95. Su función es la anotación de entidades nombradas (NER) de tipo animal en textos en neerlandés histórico, concretamente en neerlandés moderno temprano y de los siglos XVIII y XIX. Para cada frase, el modelo devuelve un objeto JSON con los fragmentos de texto que designan animales, siguiendo un esquema estricto (`{"spans": [{"text": ..., "label": "Animal"}]}`).

La relevancia del proyecto es metodológica: el adaptador se entrenó sin datos etiquetados por humanos. Las 2.250 frases de entrenamiento fueron etiquetadas de forma zero-shot por `gpt-6-luna` (el "profesor"), y el adaptador actúa como "estudiante" destilado. Según la model card, supera en unos 9 puntos F1 al modelo GysBERT entrenado con las mismas etiquetas, lo que lo convierte en una prueba de concepto de cómo construir un etiquetador de dominio específico con un coste de anotación mínimo (unos 1,35 dólares en llamadas a API).

El modelo no está pensado como instrumento de investigación acabado, sino como un experimento. El repositorio ocupa 0,2 GB (solo los pesos del adaptador) y requiere descargar por separado los pesos del modelo base Qwen3.5-9B. La licencia es Apache 2.0 y el único idioma declarado es el neerlandés (`nl`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Qwen3.5-9B) |
| Parámetros totales | no disponible (adaptador LoRA con r=16; el base tiene 9B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1280 tokens (longitud máxima de entrenamiento; las instrucciones ocupan ~600 tokens) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el base en bf16) |
| Idiomas soportados | neerlandés (`nl`), incluyendo neerlandés histórico |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el base Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer decoder-only de 9.000 millones de parámetros. El LoRA usa rango 16, alpha 32, dropout 0,05 y se aplica a todas las capas lineales. El entrenamiento se realizó en bf16 sobre los pesos base, con un learning rate de 2e-4, 2 épocas, batch efectivo de 16 (2 × 8 con acumulación de gradientes) y longitud máxima de 1280 tokens. Se conservó el checkpoint con menor pérdida en el conjunto de desarrollo; las etiquetas de ese conjunto solo se usaron para esa selección, nunca para entrenar.

Los datos de entrenamiento son 2.250 frases, de las cuales 1.211 contienen un animal. Fueron etiquetadas zero-shot por `gpt-6-luna` con esfuerzo de razonamiento medio bajo las directrices v3 (incluidas en `task.json`). La selección de frases siguió un bucle de aprendizaje activo con un estudiante GysBERT sobre un corpus de 940.472 frases de DBNL: la mitad proceden de un filtro sí/no de presencia de animales, el resto son las frases con menor confianza de GysBERT, más 125 aleatorias. Se eliminaron del corpus todas las frases de los libros de los que provienen los conjuntos de desarrollo y test, así como copias cercanas de las frases de evaluación. El coste total fue de aproximadamente 1,35 dólares en llamadas a API y 1,5 horas en una GPU L40S. No es un modelo MoE ni híbrido; la innovación está en el pipeline de destilación sin anotación humana y en la decodificación restringida por esquema JSON (outlines) que aplica genannote.

## Capacidades

- Anotación NER de la etiqueta `Animal` en frases sueltas de neerlandés histórico, devolviendo JSON con el esquema `{"spans": [{"text": ..., "label": "Animal"}]}`.
- Reconocimiento de animales completos de cualquier tipo, incluidos términos de crías (*veulen*, *kalf*), grupos de animales (*vee*, *Dieren*), huevos o larvas tratados como animales, usos figurados aplicados a personas (*wat ben jij een ezel*) y animales muertos descritos como animales.
- Delimitación de spans: el sustantivo animal, con modificador solo cuando este especifica qué animal es (*woldraghende vee*).
- Decodificación con restricción dura de esquema JSON mediante outlines cuando se usa con genannote.
- Capacidad multilingüe limitada al neerlandés; no se declaran otras lenguas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio para este adaptador.
- No marca personas ni partes del cuerpo humano, el término genérico *jongen*, partes de animales, productos animales o alimentos, ni compuestos cuyo núcleo semántico es otro (*Haringh-vanghst*).

## Casos de uso

- Anotación de corpus históricos en neerlandés: procesar colecciones de DBNL o archivos digitalizados de los siglos XVII-XIX para extraer menciones de animales con un etiquetador entrenado específicamente para esa variante lingüística, sin necesidad de anotadores humanos.
- Investigación en historia cultural y de la ciencia: extraer automáticamente referencias a animales en tratados de historia natural, libros de emblemas y cancioneros para estudios de historia conceptual o de la percepción de la fauna.
- Construcción de conjuntos de datos de entrenamiento: usar el adaptador como etiquetador de preanotación en un bucle de anotación activa, revisando después las salidas humanas y alimentando un modelo mayor o un encoder especializado.
- Extracción de entidades en pipelines de humanidades digitales: integrar la salida JSON en un pipeline que alinee spans al texto original y los cargue en una base de datos o en un sistema de anotación como INCEpTION.
- Prueba de concepto de destilación sin etiquetas humanas: replicar el método (profesor LLM + estudiante LoRA + aprendizaje activo) para otras etiquetas o dominios con coste de anotación mínimo (del orden de 1-2 dólares por tarea).
- Filtrado y recuperación de documentos: clasificar frases de un corpus histórico según la presencia de animales para priorizar la revisión manual o construir subcorpus temáticos.
- Evaluación comparativa de etiquetadores: usar el adaptador como referencia para medir la calidad de modelos encoder como GysBERT en tareas de NER histórica en neerlandés.

## Benchmarks y rendimiento

Resultados de la model card. Las puntuaciones son a nivel de token (solo positivos) y F1 a nivel de span, calculadas con genannote tras recargar el adaptador guardado.

Conjunto de test: `animals_ner_dutch`, 250 frases de 7 textos DBNL con anotación gold.

| Modelo | F1 token (P / R) | F1 span |
|---|---|---|
| **este adaptador** | **0,890** (0,96 / 0,83) | **0,881** |
| gysbert-animals-nov26-v2 (mismas etiquetas) | 0,801 (0,89 / 0,73) | 0,763 |
| `gpt-6-luna`, zero-shot (el profesor) | 0,961 (0,96 / 0,97) | 0,953 |

Conjunto de comprobación: 1.192 frases verificadas por humanos del conjunto de entrenamiento de `animals_ner_dutch`, en las que este adaptador nunca entrenó (algunas provienen de los mismos libros DBNL que sus frases de entrenamiento).

| Modelo | F1 token (P / R) | F1 span |
|---|---|---|
| **este adaptador** | **0,872** (0,90 / 0,85) | **0,873** |
| gysbert-animals-nov26-v2 (mismas etiquetas) | 0,780 (0,84 / 0,73) | 0,782 |
| `gpt-6-luna`, zero-shot (el profesor) | 0,902 (0,92 / 0,89) | 0,897 |

La model card advierte de que las directrices v3 se redactaron a partir de los errores del profesor en este conjunto de test, lo que favorece su puntuación. El archivo `metrics.json` contiene las puntuaciones completas de ambos conjuntos.

## Requisitos de hardware

- VRAM estimada: los pesos base en bf16 requieren una GPU con 24 GB o más. El adaptador en sí ocupa 0,2 GB.
- GPU recomendadas: L40S (usada en el entrenamiento y en la evaluación), A100, H100 o cualquier GPU con al menos 24 GB de VRAM.
- GPU de consumo: no cabe en tarjetas de 16 GB o menos en bf16 sin cuantizar el base; no se documentan opciones de cuantización del adaptador.
- Opciones de despliegue: `genannote` con `HFCausalAnnotator` (ruta recomendada, aplica decodificación restringida por esquema JSON); alternativa manual con PEFT + transformers aplicando la plantilla de chat, `add_generation_prompt=True` y `enable_thinking=False`.
- Latencia y throughput: aproximadamente 0,4 s por frase en una L40S con generación por lotes. Un modelo de 9B es mucho más lento que un encoder como GysBERT.
- Almacenamiento: 0,2 GB para el adaptador más el tamaño del modelo base Qwen3.5-9B.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | F1 span (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **qwen35-9b-animals-nov26-v1** | LoRA sobre decoder 9B | 9B (base) | 1280 tokens | 0,881 | Apache 2.0 | Hugging Face |
| gysbert-animals-nov26-v2 | Encoder (GysBERT) con las mismas etiquetas | no disponible | no disponible | 0,763 | no disponible | Hugging Face |
| `gpt-6-luna` (zero-shot) | LLM propietario como profesor | no disponible | no disponible | 0,953 | propietaria | API |

El adaptador supera al encoder GysBERT en unos 9 puntos de F1 span con las mismas etiquetas de entrenamiento, a costa de mucha mayor latencia y requisitos de VRAM. El profesor propietario sigue siendo superior en calidad, pero su uso implica coste por llamada y dependencia de una API externa.

## Limitaciones y advertencias

- Hardware exigente: el base en bf16 necesita 24 GB o más de VRAM y es unas 0,4 s por frase en una L40S, muy por encima de un encoder especializado.
- Los spans se devuelven como texto, no como offsets de caracteres. Con genannote se alinean a la frase; con código propio hay que localizarlos manualmente. En el test, 1 de los spans predichos no coincidió literalmente con el texto.
- Material de evaluación estrecho: desarrollo y test provienen de solo 8 textos DBNL (poesía de los siglos XVII y XVIII, libros de emblemas y canciones, historia natural), por lo que la generalización a otros géneros o épocas no está demostrada.
- Un solo entrenamiento y una sola semilla: no hay estimación de varianza.
- Hereda errores del profesor: a veces lee homógrafos como animales (*paerden* "aparearse", *lemm'ren* "rayos").
- Entrenado sin datos humanos: la calidad del etiquetado depende de la del profesor y de las directrices v3.
- Es obligatorio pasar el mismo prompt de sistema (`task.json`, instrucciones v3) con el que se entrenó; en caso contrario el rendimiento puede degradarse.
- Sin genannote, la decodificación no está restringida, por lo que hay que validar el JSON de salida.
- Idioma limitado al neerlandés histórico; no se declaran capacidades multilingües.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-9B tiene su propia licencia que debe verificarse por separado.
- No es un instrumento de investigación acabado según su propio autor; no se han publicado resultados de benchmarks fuera de los dos conjuntos descritos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArjanvD95/qwen35-9b-animals-nov26-v1
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo comparado gysbert-animals-nov26-v2: https://huggingface.co/ArjanvD95/gysbert-animals-nov26-v2
- Archivo de tarea y directrices (`task.json`): https://huggingface.co/ArjanvD95/qwen35-9b-animals-nov26-v1/blob/main/task.json
- Métricas completas (`metrics.json`): https://huggingface.co/ArjanvD95/qwen35-9b-animals-nov26-v1/blob/main/metrics.json
- Paper, blog o repositorio de genannote: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
