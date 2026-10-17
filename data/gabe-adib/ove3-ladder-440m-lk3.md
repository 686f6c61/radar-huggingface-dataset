# gabe-adib/ove3-ladder-440m-lk3

## Resumen

`ove3-ladder-440m-lk3` es un checkpoint de investigación publicado por el usuario gabe-adib en HuggingFace. No es un modelo instructivo ni un modelo listo para producción: es un artefacto de entrenamiento que documenta una ejecución concreta dentro de una "intervention ladder" denominada ove3, en su rama K3 LatentMoE. El modelo es una mezcla de expertos (MoE) con 440M de parámetros activos, denominada `kimi_linear` en la model card, con 512 expertos de media anchura y enrutamiento top-16, y dimensionada tomando como referencia Kimi K3.

La información publicada es muy escasa: la model card describe la configuración del run y los resultados de pérdida, pero no indica el número total de parámetros, la longitud de contexto, los idiomas soportados, la licencia ni el tokenizador utilizado. El repositorio ocupa 70,8 GB, un tamaño que se explica por incluir el checkpoint distribuido de Megatron con estado del optimizador, además de logs de entrenamiento y eventos de TensorBoard.

Su relevancia es acotada y de carácter metodológico: sirve para auditar y replicar un experimento de escalado IsoFLOP con arquitectura LatentMoE, y como punto de partida para ablaciones controladas sobre el enrutamiento de expertos, no como modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (LatentMoE), variante `kimi_linear` segun la model card; detalles de la capa de atencion no disponibles |
| Parametros totales | no disponible (no publicado; el tamaño del repo, 70,8 GB con estado del optimizador, sugiere un total muy superior a los 440M activos) |
| Parametros activos | 440M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint Megatron en la precision de entrenamiento; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (`checkpoint/`, con estado del optimizador incluido); no se distribuyen safetensors ni GGUF |
| Expertos | 512 expertos de media anchura, top-16 |
| Normalizacion | RMSNorm con epsilon 1e-5 |
| Escalado del enrutador | 1.0 |
| Semilla | 1234 |
| Iteracion del checkpoint | 27.200 (`best_1`, mejor paso de validacion) |
| Perdida de validacion | 1,0547 |
| Perdida held-out | 1,1393 nats/caracter (ponderada por mezcla sobre 9 dominios) |
| Tamano del repositorio | 70,8 GB |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-17 / 2026-10-17 |

## Arquitectura y entrenamiento

La model card describe una MoE con 440M de parámetros activos construida como "LatentMoE dimensionada como Kimi K3": 512 expertos de media anchura con enrutamiento top-16, RMSNorm con epsilon 1e-5, escalado del enrutador 1.0 y semilla 1234. El resto del recetario corresponde a la celda IsoFLOP de 440M del proyecto, es decir, los mismos datos, tasa de aprendizaje, tamaño de batch y número de pasos que dicha celda. El prefijo `kimi_linear` sugiere una variante de atención lineal, pero la model card no detalla ni la arquitectura de atención ni la composición del dataset, el número de tokens vistos, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

El checkpoint publicado es `best_1`, en la iteración 27.200, seleccionado por pérdida de validación (1,0547). El resultado principal reportado es la pérdida held-out de 1,1393 nats/caracter, ponderada por mezcla sobre 9 dominios, con el desglose por dominio en el fichero `DOMAIN_NLL.txt`. El repositorio incluye además `config.yaml` con la configuración del run, logs de entrenamiento segmentados cada 4 horas, logs de scoring y eventos de TensorBoard, lo que convierte al artefacto en un registro reproducible del experimento más que en un modelo distribuible. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención linear cuantificada, etc.) más allá de la propia configuración de la MoE.

## Capacidades

- Generación de texto a nivel de modelo base: al no haber fase de instrucción documentada, no se debe esperar comportamiento de chat ni seguimiento de instrucciones.
- Modelado de lenguaje y cálculo de perplejidad/pérdida por token o por carácter, con desglose por dominio (9 dominios reportados).
- Estudio del enrutamiento de expertos: 512 expertos con top-16 permiten analizar distribución de carga, especialización y posibles colapsos del enrutador.
- Reanudación de entrenamiento: al incluir estado del optimizador en formato Megatron, el checkpoint es reanudable.
- Comparación controlada dentro de la "ladder" ove3: el run está pensado como brazo K3 frente a otras ramas experimentales.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Multilingüismo: no disponible (los idiomas no se declaran).
- Visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Replicación de experimentos de escalado IsoFLOP: el repositorio incluye `config.yaml`, logs de entrenamiento cada 4 horas y eventos de TensorBoard, de modo que un equipo de investigación puede reconstruir la curva de pérdida y verificar el punto `best_1` en la iteración 27.200.
- Auditoría de recetas de entrenamiento: comparar la configuración efectiva del run (LR, batch, pasos) con la celda IsoFLOP de 440M declarada permite detectar desviaciones en la implementación del recetario.
- Investigación sobre enrutamiento en LatentMoE: con 512 expertos y top-16, este checkpoint permite medir ocupación de expertos, entropía del enrutador y especialización por dominio usando los logs de scoring y `DOMAIN_NLL.txt`.
- Ablaciones controladas dentro de la ladder ove3: sirve como brazo de referencia K3 frente a otras ramas de la misma ladder, al compartir datos, LR, batch y pasos, lo que aísla el efecto de la intervención arquitectónica.
- Reanudación o continuación de entrenamiento: el estado del optimizador incluido en `checkpoint/` permite continuar el entrenamiento desde la iteración 27.200 sin recalcular momentos, útil para experimentos de annealing o de curricula de datos.
- Análisis de especialización por dominio: la pérdida held-out desglosada en 9 dominios permite estudiar qué dominios se benefician o se degradan con la configuración de expertos elegida.
- Formación y docencia en infraestructura Megatron: el repositorio es un ejemplo real de estructura de checkpoint distribuido, logs y configuración para cursos o guías internas de entrenamiento a escala.
- Extracción o poda de expertos (uso exploratorio): dado que solo 440M de parámetros están activos por token, el checkpoint es material de partida para estudiar técnicas de pruning de expertos y destilación hacia modelos densos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las únicas métricas reportadas son de pérdida del propio entrenamiento y no son comparables con las de otros modelos:

| Metrica | Valor |
|---|---|
| Perdida de validacion (lm loss, `best_1`) | 1,0547 |
| Perdida held-out (ponderada por mezcla, 9 dominios) | 1,1393 nats/caracter |
| Iteracion del mejor checkpoint | 27.200 |
| MMLU / HumanEval / GSM8K | no disponible |

## Requisitos de hardware

- VRAM de inferencia: no disponible con precision, porque el número total de parámetros no se ha publicado. Los 440M de parámetros activos implican un coste de cómputo por token bajo (del orden de 0,9 GB en bf16 solo para los parámetros activos), pero la memoria residente debe alojar todos los expertos del modelo, no solo los activados.
- El repositorio completo ocupa 70,8 GB, incluyendo estado del optimizador; el espacio en disco necesario para descargarlo y convertirlo es, por tanto, de ese orden.
- GPU recomendadas: no disponible. Por el perfil de parámetros activos, la inferencia cabría previsiblemente en GPU de consumo (RTX 4090, 24 GB) si el total de parámetros es moderado, pero esto no puede confirmarse sin el dato de parámetros totales.
- Despliegue: no hay artefactos listos para vLLM, llama.cpp, Ollama o TGI. El checkpoint está en formato distribuido de Megatron y requeriría una conversión previa (por ejemplo, a un checkpoint tipo HF/safetensors) y disponer del tokenizador, que no se documenta en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación es limitada porque el número total de parámetros del modelo no se ha publicado y la licencia es desconocida. Se incluye una referencia de la misma categoría (MoE de tamaño pequeño/medio con pocos parámetros activos), con datos tomados de su documentación pública:

| Modelo | Parametros totales | Parametros activos | Expertos / top-k | Contexto | Licencia |
|---|---|---|---|---|---|
| ove3-ladder-440m-lk3 | no disponible | 440M | 512 / 16 | no disponible | no disponible |
| OLMoE-1B-7B | 6.900M aprox. | 1.300M aprox. | 64 / 8 | 4.096 tokens | Apache 2.0 |
| Otros MoE pequenos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

A diferencia de OLMoE, este artefacto no se distribuye con tokenizador, pesos en safetensors ni licencia declarada, por lo que no es directamente intercambiable en pipelines estándar.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial, lo que en la práctica impide su uso en producción sin contactar con el autor.
- Metadatos incompletos: se desconocen parámetros totales, contexto, idiomas, tokenizador y pipeline, datos imprescindibles para evaluar su idoneidad.
- Es un checkpoint de investigación, no un modelo instructivo: no cabe esperar seguimiento de instrucciones, formato de chat ni alineación.
- Riesgo de alucinación: no evaluado; no existen datos de benchmarks ni de evaluación de fidelidad.
- Sesgos: no documentados; la composición del dataset de entrenamiento no se describe.
- Formato propietario de facto: el checkpoint distribuido de Megatron con estado del optimizador no se carga con las herramientas habituales de inferencia; exige conversión y conocimiento de la herramienta.
- Repositorio de 70,8 GB: la descarga y el almacenamiento tienen un coste relevante para un modelo de 440M de parámetros activos.
- Fechas de creación y actualización (2026-10-17) y cero descargas/likes: no hay evidencia de validación por parte de terceros.
- Los resultados de búsqueda web obtenidos no guardan relación con el modelo; no se ha podido verificar información externa adicional.

## Enlaces

- HuggingFace: https://huggingface.co/gabe-adib/ove3-ladder-440m-lk3
- Repositorio del modelo (checkpoint, logs, `config.yaml`, `DOMAIN_NLL.txt`): https://huggingface.co/gabe-adib/ove3-ladder-440m-lk3/tree/main
- Paper, blog, repositorio de código o demo: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
