# cmeister/boundary-markers-ru-d12-bnd_w-bpe

## Resumen

`cmeister/boundary-markers-ru-d12-bnd_w-bpe` es un conjunto de tres modelos de lenguaje en ruso (semillas 0, 1 y 2) publicados por el usuario cmeister en HuggingFace. No son modelos pensados para uso final, sino artefactos de investigación: se entrenaron para comparar vocabularios de subpalabras que marcan explícitamente las fronteras de palabra, siguiendo el esquema del artículo *Explicit Boundary Markers for Subword Vocabularies* (Sander Land y Clara Meister, arXiv:2608.08847). El paper original reporta resultados en inglés; esta publicación replica el experimento en ruso en septiembre de 2026.

Cada modelo es un transformer decoder-only de 12 capas, anchura 768, 6 cabezas de atención y contexto de 2.048 tokens, entrenado con nanochat (commit `92d63d4`) sobre 1.340 millones de tokens de Russian FineWeb-2. Los tres comparten inicialización de pesos y orden de shards por semilla, y solo difieren en el tokenizador, de modo que las diferencias de pérdida son atribuibles al esquema de tokenización y no a otras variables.

Su relevancia es metodológica: la tokenización suele darse por fijada y este experimento mide si marcar las fronteras de palabra de forma explícita mejora la compresión del texto medida en bits por byte. El tokenizador `bnd_w` inserta un marcador `<|>` a ambos lados de cada palabra, elimina el espacio único entre palabras al codificar y lo restaura al decodificar a partir de los dos marcadores contiguos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementación nanochat, commit `92d63d4`), 12 capas, anchura 768, 6 cabezas de atención |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos como state dict de PyTorch) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`), cargable con `torch.load(..., weights_only=True)`; tokenizador en JSON comprimido (`.json.gz`) |
| Vocabulario | 34.685 entradas del tokenizador BPE más 1 token de inicio de secuencia (34.686 en el modelo) |
| Tamano del repositorio | 2,5 GB (tres checkpoints, tokenizador y registros de entrenamiento) |
| Divisiones publicadas | Tres semillas (0, 1, 2), cada una con `model_002553.pt`, `meta_002553.json`, `train.log` y `archive.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas, anchura 768 y 6 cabezas de atención, generado con nanochat, el framework de entrenamiento de Karpathy. El contexto es de 2.048 tokens y el vocabulario efectivo es de 34.686 entradas (34.685 del tokenizador BPE más un token de inicio de secuencia). No se especifica en la model card si los embeddings están atados a la capa de salida ni otros detalles internos; la configuración exacta está en `seed<n>/meta_002553.json`.

El entrenamiento consistió en 2.553 pasos de 524.288 tokens cada uno, es decir, 1.340 millones de tokens, con una GPU por modelo. El corpus son 10 shards de Russian FineWeb-2, de la release `fineweb-2_0_1-quality_10-filterrobots`, que suman 2.920 millones de caracteres y se recorrieron aproximadamente 3,35 veces. La semilla fija la inicialización de pesos y el orden de los shards, y ese orden es idéntico para todos los tokenizadores comparados, lo que permite comparaciones emparejadas. La innovación técnica no está en la arquitectura sino en la tokenización: un marcador `<|>` rodea cada palabra y el espacio único entre palabras marcadas se elimina al codificar y se reconstruye al decodificar. El tokenizador se entrenó con BPE sobre una muestra de 5 GB de Russian FineWeb con un total de 34.685 entradas. No se aplicaron RLHF ni DPO: son modelos base.

## Capacidades

- Modelado de lenguaje y generación de texto en ruso; es un modelo base, sin ajuste por instrucciones.
- Compresión de texto medible de forma intrínseca mediante bits por byte sobre un shard reservado de Russian FineWeb-2.
- Tokenización explícita de fronteras de palabra con el esquema `bnd_w`, incluyendo reconstrucción del espaciado en la decodificación.
- Comparación controlada de tokenizadores: al compartir semilla, inicialización y orden de datos, las diferencias respecto a la variante `plain` son atribuibles al tokenizador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el único idioma declarado es el ruso.
- Capacidades especiales (modo de razonamiento, visión, audio, decodificación especulativa): no disponibles.

## Casos de uso

- Investigación sobre tokenización: comparar el esquema `bnd_w` con el esquema `plain` y con los demás brazos del repositorio `script_tok` usando exactamente los mismos datos y semilla, de forma que la única variable sea el vocabulario.
- Réplica multilingüe de resultados: el paper reporta inglés y esta publicación aporta ruso; sirve como plantilla metodológica para extender el experimento a otros idiomas con el mismo pipeline de nanochat.
- Medición intrínseca de calidad mediante bits por byte: evaluar sobre un shard reservado de Russian FineWeb-2 dividiendo la pérdida sumada entre la longitud real en UTF-8 del texto puntuado, una métrica comparable dentro de un mismo idioma.
- Estudio de estabilidad entre semillas: las tres semillas publicadas permiten estimar la varianza del efecto del tokenizador (desviación típica de 0,00063 en este caso) antes de sacar conclusiones de una única ejecución.
- Punto de partida para ajuste fino en ruso: al ser un modelo base de contexto 2.048 tokens, se puede afinar para tareas de clasificación de texto, etiquetado de secuencias o modelado de dominio sobre corpus rusos pequeños.
- Docencia y reproducción de pipelines: entrenar o inspeccionar un transformer de 12 capas con nanochat en una sola GPU es un caso práctico para cursos y talleres sobre entrenamiento de modelos de lenguaje.
- Validación de infraestructura de entrenamiento: los ficheros `train.log` y `archive.json` de cada semilla permiten auditar pasos, pérdidas y hashes de los artefactos, útil como referencia de reproducibilidad en entornos de investigación.
- Análisis de tokenizadores en producción: el vocabulario y su comparación con variantes alternativas sirven para decidir esquemas de tokenización en sistemas rusos donde la segmentación de palabras afecta al coste de secuencia.

## Benchmarks y rendimiento

El único resultado publicado es la pérdida de validación expresada en bits por byte sobre un shard reservado de Russian FineWeb-2 (menor es mejor). La comparación es con el esquema `plain` del mismo experimento, con idéntica semilla y datos.

| Semilla | Este modelo (bits por byte) | Diferencia vs `plain` |
|---|---|---|
| 0 | 0,54327 | +0,00646 |
| 1 | 0,54300 | +0,00773 |
| 2 | 0,54340 | +0,00709 |
| Media | 0,54322 | +0,00709 |
| Desviación típica entre semillas | 0,00063 (según la model card) | — |

Una diferencia positiva indica que `bnd_w` obtuvo una pérdida menor que `plain`, es decir, mejor compresión. El autor advierte que tres semillas dan una dirección del efecto, no una estimación precisa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. El repositorio completo, con los tres checkpoints y los registros, ocupa 2,5 GB.
- GPU recomendadas: no especificadas. El entrenamiento se hizo con una GPU por modelo, sin indicar el modelo de GPU empleado.
- Encaje en GPU de consumo: por configuración (12 capas, anchura 768, contexto 2.048, vocabulario de 34.686 entradas) es un modelo de escala reducida que debería caber en GPU de consumo, pero no se publican cifras de parámetros ni de VRAM.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La carga prevista es mediante PyTorch (`torch.load(..., weights_only=True)`) junto con el código de nanochat.
- Tokenizador: requiere clonar el repositorio `script_tok` y usar `paper_utils.boundary.downstream.boundary_tokenizer.BoundaryBPETokenizer`; se descarga con `hf_hub_download` desde la ruta `tokenizer/fineweb_ru_5gb_quick_bnd_w_bpe_v34685.json.gz`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparación disponible es interna al propio experimento, entre brazos que comparten datos, pasos y semilla:

| Modelo | Tokenizador | Datos y pasos | Contexto | Licencia | Resultado (bits por byte) |
|---|---|---|---|---|---|
| `boundary-markers-ru-d12-bnd_w-bpe` | BPE con marcadores de frontera `<|>` | Russian FineWeb-2, 2.553 pasos, 1.340 M tokens | 2.048 | Apache 2.0 | 0,54322 de media (3 semillas) |
| `plain` (mismo experimento en `script_tok`) | BPE sin marcadores de frontera | Idénticos, misma semilla y orden de shards | 2.048 | no disponible | +0,00709 de media peor |
| Otros brazos del repositorio `script_tok` | Otros esquemas de vocabulario | Idénticos por diseño | 2.048 | no disponible | Detalle agregado en el repositorio `script_tok` |
| Modelos rusos de terceros de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos de terceros comparables en parámetros, contexto o rendimiento dentro de la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni preferencias (sin RLHF ni DPO): no está pensado para diálogo ni para seguir instrucciones de usuario.
- Entrenamiento muy corto: 1.340 millones de tokens y 2.553 pasos, lo que lo sitúa lejos de un modelo utilizable en producción generalista.
- Solo ruso: no se declara ningún otro idioma, y los resultados en bits por byte solo son comparables dentro del mismo idioma.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación y de texto incoherente elevado, propio de un modelo pequeño y poco entrenado, sin que existan evaluaciones publicadas de fiabilidad.
- Sesgos heredados del corpus: Russian FineWeb-2 es texto web filtrado (`quality_10-filterrobots`), por lo que arrastra los sesgos y la distribución de ese crawl.
- La evidencia experimental es débil por diseño: tres semillas solo indican una dirección del efecto, no una estimación precisa; la diferencia media de 0,00709 bits por byte es pequeña respecto a la variación entre semillas de 0,00063.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero no se documentan garantías, mantenimiento ni soporte.
- El uso del tokenizador requiere dependencias externas (`script_tok`) y una ruta concreta de fichero; no incluye una interfaz estándar de `transformers`.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni versiones optimizadas para servidores de inferencia, lo que limita su despliegue fuera de PyTorch.
- Los números de bits por byte no son comparables entre idiomas ni con métricas de perplejidad de otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ru-d12-bnd_w-bpe
- Articulo de referencia (Explicit Boundary Markers for Subword Vocabularies, Sander Land y Clara Meister): https://arxiv.org/abs/2608.08847
- Repositorio `script_tok` (codigo del paper, tokenizador y scripts de entrenamiento): https://github.com/sanderland/script_tok
- nanochat (framework de entrenamiento, commit `92d63d4`): https://github.com/karpathy/nanochat
- Dataset Russian FineWeb-2 (release `fineweb-2_0_1-quality_10-filterrobots`): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
