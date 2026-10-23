# praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-ft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-ft` es un adaptador LoRA publicado por el grupo PRAISELab@PICUSLab sobre el modelo base `google/gemma-4-E4B-it`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino (tag `strategy-ft`) orientado a un conjunto de datos denominado `fiven` dentro de lo que parece ser una suite de evaluación de modelos de lenguaje pequeños (`benchmark-slm`). El repositorio contiene únicamente los pesos del adaptador en formato `safetensors` (0,1 GB), gestionados con la librería PEFT, y está marcado como conversacional y de generación de texto.

El interés del artefacto es fundamentalmente metodológico: sirve como referencia reproducible para comparar estrategias de ajuste (en el mismo espacio de nombres existe una variante `...-4b-raft`, presumiblemente con Retrieval Augmented Fine-Tuning) sobre un mismo modelo base y un mismo dataset. El tag de idioma es `it` (italiano), por lo que el adaptador está orientado a producción de texto en ese idioma.

Conviene subir la cautela habitual: el repositorio tiene 0 descargas y 0 likes, el acceso está restringido (gated) y no se publica licencia, resultados de benchmarks ni detalles del dataset `fiven` en la información disponible. Además, el nombre del repositorio indica "4b" mientras que el modelo base declarado es "E4B", una discrepancia de nomenclatura que conviene verificar antes de citarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `google/gemma-4-E4B-it`; arquitectura interna del base no disponible |
| Parametros totales | No disponible para el adaptador (repositorio de 0,1 GB). Parametros del modelo base: no disponibles en la informacion proporcionada (el identificador "E4B" sugiere la convencion de parametros efectivos de la familia Gemma, sin confirmar) |
| Parametros activos | No disponible (no se confirma que el modelo base sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende de `google/gemma-4-E4B-it`) |
| Tipos de cuantizacion | El repositorio solo contiene pesos del adaptador en `safetensors` (sin cuantizar). La cuantizacion aplicaria al modelo base tras el merge: no documentada |
| Idiomas soportados | Italiano (`it`, segun los tags). El base es multilingue, pero el alcance del adaptador no esta documentado |
| Licencia | No disponible. Al derivar de un modelo Gemma, se anaden las condiciones de uso del modelo base (no verificadas en esta busqueda) |
| Formato de pesos | `safetensors` (adaptador LoRA, libreria `peft`); no se incluyen GGUF ni pesos fusionados |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) entrenado con PEFT sobre `google/gemma-4-E4B-it`. Por el tag `strategy-ft` y la existencia de una variante `strategy-raft` del mismo autor, se deduce que forma parte de un experimento controlado en el que se comparan técnicas de ajuste supervisado clásico frente a variantes con recuperación aumentada sobre el dataset `fiven`. No se especifican el rango LoRA, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni el volumen de tokens de entrenamiento.

Tampoco se documenta la composición de `fiven`, si hubo RLHF/DPO (improbable en un ajuste de este tipo) ni ninguna innovación técnica más allá del propio ajuste. La información pública se limita a los metadatos del repositorio: pipeline `text-generation`, etiqueta `conversational`, idioma italiano y tamaño de 0,1 GB, coherente con un adaptador de pocas decenas de millones de parámetros entrenables.

## Capacidades

- Generación de texto conversacional en italiano, según el tag `it` y la etiqueta `conversational`.
- Ajuste específico sobre el dataset `fiven` (contenido no documentado), por lo que su comportamiento esperado está acotado a la distribución de ese corpus.
- Hereda las capacidades del modelo base `google/gemma-4-E4B-it` (razonamiento, código, multilingüismo, etc.) en la medida en que el ajuste no las degrade; no hay evaluación publicada que lo confirme.
- Soporte de tool calling / function calling: no documentado para el adaptador; dependería del base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; dependen del base y no se verifican en el repositorio.
- Uso como baseline reproducible en experimentos de comparación de estrategias de fine-tuning.

## Casos de uso

- Baseline en benchmarks de modelos pequeños en italiano: el adaptador sirve como punto de referencia fijo ("ft") frente al que medir la variante RAFT u otras estrategias, usando exactamente el mismo base y dataset.
- Estudio comparativo de estrategias de ajuste: al compartir base y corpus con `benchmark-slm-fiven-gemma-4-4b-raft`, permite aislar el efecto de la técnica de entrenamiento en las métricas finales.
- Reproducibilidad académica: un investigador puede cargar el adaptador con `peft` y reproducir las condiciones del experimento del laboratorio sin reentrenar.
- Prototipado de asistentes conversacionales en italiano: al ser un adaptador de 0,1 GB, se puede superponer a una instancia del base ya desplegada para pruebas de dominio concreto.
- Ajuste de dominio sobre un modelo Gemma en producción: el adaptador demuestra el flujo de trabajo LoRA (merge y despliegue) para equipos que quieran adaptar el base a un corpus propio sin reentrenar el modelo completo.
- Experimentación docente: ejemplo compacto y de bajo coste de un pipeline PEFT completo (dataset, entrenamiento, publicación en HuggingFace con acceso controlado).
- Exploración de adaptación al dominio biomédico: el perfil del laboratorio incluye NLP biomédico y QA médica, por lo que el adaptador puede emplearse como punto de partida en experimentos de ese ámbito, aunque el contenido de `fiven` no está confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye métricas (MMLU, HumanEval, GSM8K ni ninguna otra), no hay model card con evaluación y no se han encontrado resultados en la búsqueda web. Cualquier cifra de rendimiento atribuida a este adaptador sería una invención.

## Requisitos de hardware

- VRAM del adaptador: insignificante (0,1 GB en `safetensors`); el coste real lo determina el modelo base.
- Estimación para el base (asumiendo ~4B parámetros efectivos, según la nomenclatura "E4B"): pesos en fp16 en torno a 8 GB; en int8 en torno a 4 GB; en 4-bit en torno a 2,5-3 GB. Son cálculos aritméticos a partir del tamaño, no mediciones publicadas.
- GPU recomendadas: A100 40/80 GB o H100 para servir con lotes grandes; RTX 4090 (24 GB) o L40S para fp16 con lote moderado.
- GPU de consumo: viable con cuantización de 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); en fp16 harían falta 12-16 GB como mínimo.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), merge de pesos y servicio con vLLM o TGI; para `llama.cpp`/Ollama es necesario fusionar el adaptador con el base y convertir a GGUF, ya que el repositorio no incluye GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estrategia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `benchmark-slm-fiven-gemma-4-4b-ft` (este) | Adaptador LoRA sobre Gemma-4-E4B-it; total no disponible | No disponible | Fine-tuning (ft) | No disponible | Gated, 0 descargas |
| `praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-raft` | Mismo base y tamaño de adaptador | No disponible | RAFT | No disponible | Publico |
| `google/gemma-4-E4B-it` (base) | No disponible en la informacion | No disponible | Modelo instructivo original | Terminos de Gemma (no verificados) | Publico |

No se dispone de datos de rendimiento de ninguna de las tres variantes, por lo que la comparación se limita a aspectos de linaje, estrategia de entrenamiento y disponibilidad. Alternativas de otros fabricantes en el segmento de 3-4B (por ejemplo, familias Qwen o Llama de tamaño similar) serían comparables en parámetros, pero no se han encontrado métricas que permitan un enfrentamiento riguroso con este adaptador: no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay métricas que respalden ninguna afirmación de calidad.
- Licencia no especificada, lo que impide determinar si el uso comercial está permitido; además, al derivar de un modelo Gemma, se aplican las condiciones del modelo base, que deben revisarse por separado.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita la reproducibilidad automática y explica las 0 descargas.
- Discrepancia de nomenclatura entre el nombre del repositorio ("4b") y el base declarado ("E4B"), que puede inducir a error sobre el número real de parámetros.
- Idioma limitado al italiano según los tags: no hay evidencia de calidad en castellano ni en otros idiomas.
- Dataset `fiven` no documentado: se desconoce su dominio, tamaño, procedencia y posibles sesgos, por lo que el adaptador puede arrastrar sesgos y vocabulario específicos del corpus.
- Riesgo de alucinación heredado del modelo base, sin mitigaciones documentadas; un ajuste fino sobre un corpus pequeño puede además estrechar la distribución de salidas.
- Solo se distribuyen pesos de adaptador: no hay pesos fusionados ni GGUF, lo que obliga a un paso previo de merge y conversión para despliegues con llama.cpp u Ollama.
- No recomendable como componente de producción sin una evaluación propia previa sobre el caso de uso concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-ft
- Variante RAFT del mismo autor: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-raft
- Perfil del autor (PRAISELab@PICUSLab, datasets): https://huggingface.co/praiselab-picuslab/datasets
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Pagina de la familia Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- LLM Leaderboard (referencia de comparacion): https://www.llmboard.ai/
- LLM Leaderboard / benchmarks (octubre 2026): https://benchlm.ai/
