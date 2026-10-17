# gabe-adib/ove3-dedup-185m-organelle-ani95

## Resumen

`ove3-dedup-185m-organelle-ani95` es un checkpoint de investigación publicado por el usuario gabe-adib dentro del estudio «ove3». No es un modelo listo para producto: es un artefacto de un experimento A/B sobre deduplicación de datos de entrenamiento. Concretamente, una de las dos ramas de un A/B en el que el pool de entrenamiento «organelle» se deduplicó al 95 % de identidad mediante MinHash con centroides voraces (14.788 genomas), manteniendo el resto de la receta idéntica (semilla 1234, misma tasa de aprendizaje, batch y número de pasos que la celda IsoFLOP de 185 M del estudio).

La arquitectura es un MoE de tipo `kimi_linear` con 185 M de parámetros activos. El número total de parámetros no se publica en la model card. El checkpoint corresponde al paso 18.810 (best_1, el mejor paso de validación) con una pérdida de validación de 1,0903 y una pérdida held-out de 1,1786 nats/carácter, ponderada por mezcla sobre 9 dominios (el desglose por dominio está en `DOMAIN_NLL.txt`). La unidad nats/carácter y el nombre del pool apuntan a un corpus de secuencias genómicas, aunque la model card no describe explícitamente el dataset.

Su relevancia es metodológica, no funcional: sirve para reproducir y auditar el efecto de la deduplicación sobre la pérdida de un modelo pequeño en un régimen IsoFLOP controlado. El repositorio (28,9 GB) contiene el checkpoint distribuido de Megatron con estado del optimizador, los logs de entrenamiento por segmentos de 4 horas, los logs de scoring, los eventos de TensorBoard y el `config.yaml` del run.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `kimi_linear` MoE (atención lineal híbrida con mezcla de expertos, según la denominación del autor) |
| Parametros totales | no disponible (estimación indirecta: ~1,5-2 B a partir de los 28,9 GB del repo con estado del optimizador; no confirmado) |
| Parametros activos | 185 M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos en formatos cuantizados; solo checkpoint distribuido de Megatron) |
| Idiomas soportados | no disponible (el corpus parece ser de secuencias genómicas, no texto natural; sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (`checkpoint/`, best_1, incluye estado del optimizador); no se publican safetensors, GGUF ni formato HuggingFace |
| Autor | gabe-adib |
| Fecha de publicacion | 2026-10-17 |
| Tamano del repositorio | 28,9 GB |
| Semilla | 1234 |
| Paso del checkpoint | 18.810 (best_1) |
| Perdida de validacion | 1,0903 |
| Perdida held-out | 1,1786 nats/carácter (ponderada por mezcla, 9 dominios) |

## Arquitectura y entrenamiento

El autor denomina la arquitectura `kimi_linear`, lo que sitúa el modelo en la familia de transformers con atención lineal o híbrida (combinación de capas de atención lineal y atención completa, al estilo de las propuestas recientes de Kimi) con capas de mezcla de expertos. La cifra publicada es de 185 M de parámetros activos, característica típica de un MoE disperso: el coste de cómputo por token lo fija la fracción activa, no el total. La model card no detalla el número de expertos, el ratio de activación, la dimensión oculta, el número de capas ni la longitud de contexto. Tampoco se especifica el tokenizador; la pérdida se expresa en nats/carácter, lo que sugiere un vocabulario a nivel de carácter o de base en lugar de subpalabras BPE, coherente con datos genómicos.

El entrenamiento es una celda de 185 M dentro de un barrido IsoFLOP del estudio ove3: el autor indica explícitamente que se mantienen «same data, LR, batch, steps» respecto a la celda de referencia, y que la única variable manipulada es la deduplicación del pool. El pool «organelle» se deduplicó a identidad del 95 % usando MinHash con clustering por centroide voraz, quedando en 14.788 genomas. El repositorio contiene los logs de entrenamiento escritos en segmentos de 4 horas y los eventos de TensorBoard, lo que permite reconstruir la curva de pérdida. No se menciona RLHF, DPO, SFT ni ninguna fase de alineación posterior: es un modelo base de preentrenamiento.

## Capacidades

- Modelado de lenguaje autorregresivo y cálculo de verosimilitud sobre secuencias: es su función principal verificable, medida como pérdida en nats/carácter sobre 9 dominios.
- Evaluación comparativa de pipelines de deduplicación: al ser una rama de un A/B controlado, permite medir el delta de pérdida atribuible a la deduplicación.
- Reproducción de recetas de entrenamiento Megatron: el `config.yaml` y el checkpoint con estado del optimizador permiten reanudar o extender el entrenamiento.
- Extracción de representaciones internas (estados ocultos) para análisis o clasificación de secuencias, previa conversión del checkpoint a un formato consumible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Ablación de deduplicación de datos: comparar este checkpoint con la rama no deduplicada del mismo A/B para cuantificar el efecto de aplicar MinHash al 95 % de identidad sobre la pérdida held-out (1,1786 nats/carácter en esta rama), manteniendo constantes semilla, LR, batch y pasos.
- Auditoría de calidad de corpus: usar el desglose por dominio de `DOMAIN_NLL.txt` para detectar qué dominios se degradan cuando se eliminan duplicados cercanos, y decidir umbrales de deduplicación en futuros datasets.
- Estudio de scaling IsoFLOP: emplear la celda de 185 M como punto de referencia barato para extrapolar curvas de pérdida antes de invertir en modelos mayores del mismo estudio.
- Reproducción de infraestructura de entrenamiento: reanudar desde el checkpoint Megatron con estado del optimizador para validar pipelines de entrenamiento distribuido, comprobando que la pérdida continúa desde 1,0903 sin divergencias.
- Modelado de secuencias biológicas: si el corpus «organelle» corresponde a genomas de orgánulos, el modelo sirve como base para puntuar secuencias, detectar regiones atípicas o preentrenar clasificadores ligeros; requiere validar primero el tokenizador y el vocabulario, no publicados.
- Docencia y divulgación técnica: el paquete completo (checkpoint, logs por segmentos de 4 h, eventos de TensorBoard, configuración) sirve como caso de estudio reproducible de un experimento controlado con MoE pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. Las únicas métricas reportadas son de pérdida del propio run:

| Metrica | Valor |
|---|---|
| Perdida de validacion (mejor paso, 18.810) | 1,0903 |
| Perdida held-out, ponderada por mezcla (9 dominios) | 1,1786 nats/carácter |
| Perdida held-out, equivalente por carácter (derivada: exp(1,1786)) | ~3,25 |
| Desglose por dominio | en `DOMAIN_NLL.txt` (no incluido en la model card) |

No hay comparación publicada con otros modelos dentro de la información proporcionada, y las métricas en nats/carácter no son trasladables a benchmarks de texto sin conocer el tokenizador y el corpus exactos.

## Requisitos de hardware

- VRAM para inferencia: con 185 M de parámetros activos, los pesos activos en bf16 ocupan ~0,37 GB; sin embargo, en un MoE todos los expertos deben residir en memoria salvo que se aplique offload selectivo. Con la estimación no confirmada de ~1,5-2 B de parámetros totales, los pesos completos en bf16 estarían en torno a 3-4 GB, ~2 GB en int8 y ~1 GB en int4, a lo que hay que sumar caché KV y activaciones.
- GPU recomendadas: no hay recomendaciones del autor. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son holgadas; el modelo es manejable en GPUs de consumo.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas de 8-12 GB o superiores, siempre que la conversión de formato sea correcta y el total real de parámetros no sea mucho mayor de lo estimado.
- Opciones de despliegue: el repositorio solo incluye checkpoint distribuido de Megatron, por lo que requiere conversión previa a safetensors/HuggingFace para usarlo con vLLM o TGI, o a GGUF para llama.cpp u Ollama. No se publican pesos en formato GGUF ni safetensors, de modo que ninguna de estas vías funciona sin trabajo de conversión. Para reanudar entrenamiento, Megatron-LM o NeMo son las vías naturales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros activos | Tokens de entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ove3-dedup-185m-organelle-ani95 (este) | 185 M | no disponible | no disponible | no disponible | checkpoint Megatron, 28,9 GB |
| gabe-adib/ove3-dc-185m-u30b-r4-wd0.1 | 185 M | 30 B unicos x 4 epocas = 120 B | no disponible | no disponible | checkpoint del estudio |

El segundo modelo es otra celda del mismo estudio (data-constrained scaling, weight decay 0,1) y no una alternativa de mercado; la comparación directa solo es válida como referencia metodológica, no como benchmark de capacidades. No se dispone de información sobre otros modelos comparables de la misma categoría (MoE pequeños para secuencias genómicas) en el material proporcionado: no disponible.

## Limitaciones y advertencias

- Ausencia de licencia: no se especifica ninguna, lo que impide determinar si el uso comercial está permitido. Tratarlo como no apto para producción hasta que el autor la declare.
- Es un modelo base sin alineación: no hay SFT, RLHF ni DPO documentados; no cabe esperar instrucciones, formato conversacional ni rechazo de peticiones dañinas.
- Formato no consumible directamente: solo se publica checkpoint distribuido de Megatron con estado del optimizador, lo que obliga a escribir y validar un script de conversión antes de cualquier uso en inferencia.
- Documentación mínima: sin tokenizador, sin hiperparámetros de arquitectura (capas, expertos, dimensión), sin longitud de contexto y sin descripción del dataset. Cualquier uso requiere inspeccionar `config.yaml` y los logs.
- Riesgo de alucinación: no evaluable en el sentido habitual, ya que no hay evidencia de que el modelo esté entrenado para generar texto natural; el corpus parece ser de secuencias genómicas.
- Métricas no comparables: la pérdida en nats/carácter depende del tokenizador y de la mezcla de dominios, por lo que no se puede contrastar con perplejidades de modelos de texto publicadas.
- Sesgos: no evaluados ni documentados; en un corpus genómico, el sesgo de composición (14.788 genomas tras deduplicar) puede ser sustancial y no está analizado.
- Idoneidad: artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa ni de soporte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gabe-adib/ove3-dedup-185m-organelle-ani95
- Run hermano del mismo estudio (data-constrained scaling): https://huggingface.co/gabe-adib/ove3-dc-185m-u30b-r4-wd0.1
- organelle.ai (referencia de nombre en los resultados de búsqueda, sin relación confirmada con el run): https://organelle.ai/
- No se han encontrado papers, blogs, repositorios de código ni demos asociados a este modelo en la búsqueda web disponible.
