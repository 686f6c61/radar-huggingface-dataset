# karimepachecog/ner-bert-base-cased-feature

## Resumen

`karimepachecog/ner-bert-base-cased-feature` es un modelo de reconocimiento de entidades nombradas (NER) en inglés construido sobre `google-bert/bert-base-cased`. La particularidad es su método de adaptación: el encoder BERT permanece congelado como extractor de características y únicamente se entrena una cabeza lineal de clasificación de tokens, con 6.921 parámetros entrenables frente a los 107.726.601 totales del repositorio. El autor lo publica explícitamente como la alternativa descartada de un experimento comparativo: el ajuste fino completo del mismo encoder, con los mismos datos y semilla, alcanzó un F1 de 0.9114 en el conjunto de test, frente al 0.7973 de esta variante.

El modelo resuelve etiquetado de secuencias con el esquema IOB2 de CoNLL-2003 (persona, organización, localización y miscelánea) sobre texto tipo teletipo periodístico en inglés. Su interés práctico no está en la precisión —es claramente inferior al ajuste fino completo— sino en el escenario de adaptación basada en características: cuando el encoder debe permanecer inmutable porque se comparte entre varias tareas, porque sus representaciones se precalculan una sola vez, o porque se quiere medir la calidad de las representaciones de BERT sin modificarlas.

Se distribuye en safetensors bajo licencia Apache 2.0, con un tamaño de repositorio de 0,4 GB. Es un modelo monolingüe (inglés), encoder-only, sin capacidad generativa, y con cero descargas y cero likes en el momento de la consulta, por lo que no cuenta con validación externa de la comunidad. La longitud máxima usada en entrenamiento y evaluación fue de 128 tokens, aunque la arquitectura BERT base-cased admite posiciones hasta 512.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base, 12 capas, 768 de dimensión oculta, 12 cabezas) con cabeza lineal de clasificación de tokens |
| Parámetros totales | 107.726.601 (dato real de los pesos safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Parámetros entrenables | 6.921 (solo la cabeza de clasificación; encoder congelado) |
| Longitud de contexto | 512 posiciones en la arquitectura base; entrenado y evaluado con `max_length=128` |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, ONNX o INT8) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | `token-classification` |
| Etiquetas | `O`, `B-PER`, `I-PER`, `B-ORG`, `I-ORG`, `B-LOC`, `I-LOC`, `B-MISC`, `I-MISC` |
| Modelo base | `google-bert/bert-base-cased` (Apache 2.0) |
| Dataset de entrenamiento | `lhoestq/conll2003` (CoNLL-2003) |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es un BERT base-cased estándar (encoder Transformer bidireccional preentrenado con enmascaramiento de tokens y predicción de siguiente frase, según Devlin et al., 2018) al que se le añade una capa lineal de clasificación por token sobre el último estado oculto. El método es adaptación basada en características: el cuerpo del modelo se mantiene en modo evaluación durante todo el entrenamiento para que el dropout no altere las representaciones, y sus pesos no reciben gradiente. De los aproximadamente 110 M de parámetros del encoder, cero son entrenables; toda la capacidad aprendida en esta ejecución reside en la cabeza de 6.921 parámetros, que debe asignar cada token a una de las nueve etiquetas del esquema CoNLL-2003.

El entrenamiento usó el split `train` para aprender, `validation` para seleccionar checkpoint y `test` para una única evaluación final. La configuración fue: 3 épocas, tamaño de lote 16, longitud máxima 128, semilla 42 y tasa de aprendizaje 1e-3 para la cabeza. La etiqueta de palabra se coloca únicamente en el primer subtoken; los subtokens de continuación, `[CLS]`, `[SEP]` y el relleno se marcan con `-100` y quedan excluidos de la pérdida. La métrica de selección es el F1 de entidad calculado con `seqeval`. El F1 de validación por época fue 0.804, 0.820 y 0.831, todavía en ascenso en la tercera época, y el checkpoint guardado es el de la última época (que también fue el mejor en validación). No se documenta ningún uso de RLHF, DPO ni decodificación especulativa, algo esperable en un modelo encoder-only de etiquetado.

## Capacidades

- Reconocimiento de entidades nombradas en inglés sobre las cuatro categorías de CoNLL-2003: persona, organización, localización y miscelánea.
- Etiquetado de secuencias token a token con esquema IOB2, con etiquetas de continuación `I-*` para entidades multipalabra.
- Extracción de estructuras a partir de texto plano y devolución de entidades con sus posiciones (offset mapping) a través del pipeline de `transformers`.
- Funciona como extractor de características congelado: las representaciones del encoder se pueden precalcular una vez y reutilizar para varias cabezas de tarea.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling, function calling ni uso como agente multi-paso.
- Sin capacidades multimodales: no procesa visión, audio ni documentos escaneados por sí mismo.
- Monolingüe: no hay capacidades multilingües ni transferencia a otros idiomas documentada.
- Sin modo de razonamiento explícito, sin ventana de contexto extendida y sin mecanismos de atención lineal o SSM.

## Casos de uso

- Anonimización y pseudonimización previa a LLM: detectar menciones de `PER`, `ORG` y `LOC` en documentos en inglés antes de enviarlos a un servicio externo, sustituyéndolas por marcadores. Es adecuado porque la tarea es puramente extractiva y el modelo es pequeño y local.
- Enriquecimiento de bases documentales y pipelines RAG: extraer entidades de los fragmentos indexados para generar metadatos filtrables (por organización o ubicación) y mejorar la recuperación. El coste de cómputo es mínimo al ser un encoder de 110 M de parámetros.
- Preetiquetado para anotación humana: generar anotaciones automáticas para herramientas como Label Studio o Prodigy, que las personas revisoras corrigen. Su F1 de 0.7973 lo sitúa como preanotador razonable, no como fuente de verdad.
- Vigilancia de medios y noticias: monitorizar menciones de organizaciones y ubicaciones en teletipos en inglés para alimentar alertas o paneles de seguimiento. El dominio de entrenamiento (noticias Reuters de 1996-1997) es precisamente el de este tipo de texto.
- Investigación sobre representaciones (probing): usar el encoder congelado para medir cuánta información de NER es linealmente separable de las representaciones de BERT, sin riesgo de que el ajuste fino las modifique.
- Aprendizaje multitarea con encoder compartido: cuando varias tareas (clasificación de texto, NER, análisis de sentimiento) deben compartir un mismo encoder inmutable, esta cabeza se entrena de forma barata sobre características precalculadas.
- Destilación o modelo profesor auxiliar: servir como etiquetador rápido para generar datos sintéticos de entrenamiento o como punto de partida en experimentos de destilación hacia modelos más pequeños.
- Cumplimiento de protección de datos: localizar menciones a personas físicas en corpus en inglés para tareas de inventariado o respuesta a solicitudes de acceso, siempre con revisión humana dado el nivel de error.

## Benchmarks y rendimiento

Únicos resultados publicados en la información disponible (CoNLL-2003, conjunto de test, evaluación única tras el entrenamiento):

| Métrica | Valor |
|---|---|
| Precision (entidad, CoNLL-2003 test) | 0.7862 |
| Recall (entidad, CoNLL-2003 test) | 0.8086 |
| F1 (entidad, CoNLL-2003 test) | 0.7973 |
| Pérdida de entrenamiento | 0.22 |
| Pérdida de test | 0.14 |
| F1 de validación, época 1 | 0.804 |
| F1 de validación, época 2 | 0.820 |
| F1 de validación, época 3 | 0.831 |
| F1 de test con ajuste fino completo (mismos datos y semilla) | 0.9114 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales, y no serían aplicables a un modelo encoder-only de etiquetado de secuencias. La diferencia de 11,4 puntos de F1 respecto al ajuste fino completo es el dato comparativo más relevante del propio repositorio.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 430 MB (107.726.601 parámetros × 4 bytes). En FP16/BF16: unos 215 MB. En INT8: unos 108 MB (estimaciones de cálculo, no publicadas por el autor).
- La cabeza de clasificación aporta solo 6.921 parámetros (unos 27 KB en FP32).
- VRAM estimada para inferencia: el modelo cabe holgadamente en cualquier GPU con 2 GB o más; con lote 16 y longitud 128, las activaciones añaden del orden de cientos de MB (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU consumer sirve, desde una GTX 1650 o RTX 3060 hasta una RTX 4090. No requiere A100, H100 ni GPU de centro de datos; usarlas no aporta ventaja relevante.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también en CPU para cargas moderadas.
- Opciones de despliegue: pipeline de `transformers` (`AutoModelForTokenClassification` + `AutoTokenizer`), exportación a ONNX con Optimum y ejecución con ONNX Runtime para batching dinámico, TorchScript, SageMaker o Inference Endpoints de Hugging Face. vLLM y TGI están orientados a modelos generativos y no cubren de forma nativa el pipeline de token-classification, por lo que no son la vía habitual para servir este modelo.
- Latencia y throughput: no disponibles. Al ser un encoder sin decodificación autorregresiva, el coste por lote depende linealmente de la longitud de la secuencia y de la GPU; no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 en CoNLL-2003 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `karimepachecog/ner-bert-base-cased-feature` (encoder congelado) | 107,7 M totales / 6.921 entrenables | 512 (entrenado a 128) | 0.7973 | Apache 2.0 | safetensors en Hugging Face |
| `bert-base-cased` con ajuste fino completo (referencia del propio autor) | 107,7 M, todos entrenables | 512 | 0.9114 | Apache 2.0 | pesos derivados; el repositorio concreto no se enlaza en la model card |
| `google-bert/bert-base-cased` (base, sin ajustar para NER) | ~110 M | 512 | no aplica (no realiza NER) | Apache 2.0 | safetensors y TF en Hugging Face |
| `dslim/bert-base-NER` | ~110 M | 512 | no disponible en la información proporcionada | MIT (según su propia model card) | safetensors en Hugging Face |

No se dispone de resultados medidos de otros modelos comparables en la información proporcionada, más allá del ajuste fino completo reportado por el propio autor. Cualquier otra comparación numérica requeriría evaluar los modelos en el mismo split de test con la misma métrica de `seqeval`.

## Limitaciones y advertencias

- Rendimiento inferior al ajuste fino completo en la misma tarea, datos y semilla: F1 de 0.7973 frente a 0.9114. El propio autor recomienda el modelo con ajuste fino si el objetivo es precisión.
- La cabeza clasifica cada token a partir del último estado oculto congelado y no actualiza las representaciones contextuales de BERT; el techo de rendimiento está acotado por lo que sea linealmente separable de esas representaciones.
- Ejecución única con semilla 42: según el autor, la variabilidad entre semillas puede suponer entre 1 y 3 puntos de F1, por lo que las diferencias pequeñas no son concluyentes.
- El F1 de validación seguía subiendo en la época 3 (0.804, 0.820, 0.831), señal de posible infraentrenamiento; no se exploraron más épocas.
- La etiqueta se asigna solo al primer subtoken, lo que puede degradar entidades que la tokenización parte de forma desfavorable.
- Entrenado exclusivamente con teletipos periodísticos en inglés (CoNLL-2003, corpus Reuters de 1996-1997): el dominio, el vocabulario, el estilo y los sesgos temporales, geográficos y culturales de esa fuente se trasladan al modelo.
- Solo cubre cuatro tipos de entidad (`PER`, `ORG`, `LOC`, `MISC`). No detecta fechas, cantidades, productos, cargos ni identificadores, y la categoría `MISC` es heterogénea por definición.
- Modelo monolingüe: no hay soporte documentado para castellano ni para ningún otro idioma.
- Falsos positivos y negativos son el modo de fallo esperable, no la generación de contenido inventado; aun así, no debe usarse como fuente única en decisiones de alto riesgo sin revisión humana.
- Sin cuantizaciones publicadas ni variantes GGUF/ONNX oficiales; cualquier conversión es responsabilidad de quien despliega.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, manteniendo el aviso de copyright y la licencia. No impone restricciones de uso más allá de las del modelo base, que también es Apache 2.0.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karimepachecog/ner-bert-base-cased-feature
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Dataset CoNLL-2003 en Hugging Face: https://huggingface.co/datasets/lhoestq/conll2003
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Paper del shared task CoNLL-2003 (Tjong Kim Sang y De Meulder, 2003): https://aclanthology.org/W03-0419/
- Alternativa con ajuste fino completo citada en la comparativa: https://huggingface.co/dslim/bert-base-NER
