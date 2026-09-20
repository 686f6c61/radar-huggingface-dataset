# open-athena/Snowball-67B-A2B-Math-RL-E17d-Step8-Repaired

## Resumen

Snowball-67B-A2B-Math-RL-E17d-Step8-Repaired es un checkpoint de investigación publicado por la organización open-athena dentro de la campaña Snowball, una línea de trabajo sobre modelos de mezcla de expertos (MoE) entrenados con refuerzo para tareas de matemáticas. El repositorio contiene exactamente el checkpoint empleado para una fila concreta del experimento de math-RL del modelo Snowball 67B-A2B, concretamente el brazo E17d en su paso 8, con el sesgo del router reparado. No es un lanzamiento de producción: la propia model card lo etiqueta como artefacto de investigación (research-artifact) y advierte de que su utilidad queda limitada a que se preserve la integridad del router reparado.

El modelo tiene 67.078.876.160 parámetros totales según los pesos en safetensors, con un repositorio de 134,2 GB, lo que corresponde a pesos en precisión completa (BF16/FP16). La nomenclatura "67B-A2B" y la etiqueta grug_moe apuntan a una arquitectura de mezcla de expertos con aproximadamente 2.000 millones de parámetros activos por token, aunque la model card no confirma explícitamente el número de parámetros activos. El entrenamiento se basa en aprendizaje por refuerzo con recompensa verificable (RLVR) sobre matemáticas, dentro de la infraestructura Marin.

Su relevancia actual es doble. Por un lado, documenta un problema técnico concreto y poco habitual: los checkpoints de esta campaña con exportaciones de "router mutable" colapsan en inferencia, y este artefacto conserva la reparación del sesgo del router. Por otro, ofrece una referencia trazable (paso, brazo, métricas held-out) para reproducir experimentos de RL sobre modelos MoE dispersos, con resultados publicados en AIME24, MATH-500 y OlympiadBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun la etiqueta `grug_moe`; detalles de capas, atencion y enrutado no disponibles |
| Parametros totales | 67.078.876.160 (67,08 B) |
| Parametros activos | No disponible en la model card; la nomenclatura "A2B" del nombre sugiere ~2 B activos por token, sin confirmacion oficial |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos safetensors en precision completa |
| Idiomas soportados | No disponible |
| Licencia | `other` (licencia personalizada; el repositorio la marca como `license:other` sin texto adicional disponible) |
| Formato de pesos | safetensors, con `model.safetensors.index.json` y shards; requiere conservar `config.json` y los ficheros del tokenizer |

## Arquitectura y entrenamiento

La etiqueta `grug_moe` junto con los 67 B de parametros totales y el sufijo "A2B" indican una arquitectura transformer de mezcla de expertos con enrutado disperso, en la que solo una fraccion pequena de los parametros (del orden de 2 B segun la nomenclatura) se activa por token. El repositorio no incluye detalles sobre el numero de expertos, la estrategia de enrutado (top-k), el uso de attention lineal o variantes hibridas, ni la longitud de contexto de entrenamiento. Tampoco se documenta el volumen de tokens de preentrenamiento ni la composicion del dataset.

El aspecto diferencial del checkpoint es su estado de router. La model card describe este artefacto como "SFT router-bias repaired control": se trata de una exportacion con el sesgo del router reparado, y advierte explicitamente de que repositorios con nombres similares mas antiguos (`laion/rl-snowball-*`) pueden contener exportaciones de router mutable sin reparar que colapsan durante la inferencia. El entrenamiento corresponde a un proceso de refuerzo con recompensa verificable sobre matematicas (RLVR math), ejecutado en la infraestructura Marin; el artefacto de origen es una ruta S3 de exportacion del paso global 8. El paso final 20 del mismo brazo permanece sin reparar, segun la model card, por lo que este paso 8 es la unica exportacion reparada disponible.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos: es la tarea objetivo del entrenamiento con RL, con evaluacion held-out en AIME24, MATH-500 y OlympiadBench.
- Razonamiento matematico de competicion: los resultados publicados (3,33 en AIME24, 37,80 en MATH-500, 5,67 en OlympiadBench) indican capacidad limitada incluso en su dominio de entrenamiento.
- Soporte de tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el modelo se evalua con generacion de respuesta a problemas, no en bucles de agente.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas soportados.
- Capacidades especiales (vision, audio, modo thinking explicito, decodificacion especulativa): no disponible.
- Reproducibilidad de experimentos de RL sobre MoE: el artefacto permite reproducir la fila correspondiente del experimento Snowball, siempre que se preserve el estado reparado del router.

## Casos de uso

- Reproduccion de resultados de la campana Snowball: cargar el checkpoint con su `config.json`, tokenizer y shards originales permite replicar las puntuaciones publicadas en AIME24, MATH-500 y OlympiadBench y verificar la fila del experimento documentada en el issue de Marin.
- Estudio del colapso del router en modelos MoE: el artefacto sirve como control reparado frente a exportaciones con router mutable sin reparar, lo que permite medir experimentalmente la degradacion en inferencia atribuible al sesgo del router.
- Ablacion de tecnicas de reparacion de router: comparar este checkpoint con los repositorios `laion/rl-snowball-*` de nombre similar permite aislar el efecto de la reparacion sobre el sesgo, manteniendo el resto del entrenamiento constante.
- Linea base para experimentos posteriores de RLVR en matematicas: sus metricas held-out ofrecen un punto de referencia bajo y trazable frente al cual medir mejoras de pasos posteriores o de nuevos brazos del mismo barrido.
- Analisis de eficiencia de inferencia en MoE dispersos: con 67 B totales y un subconjunto de parametros activos, permite estudiar el equilibrio entre memoria requerida y coste de computo por token en hardware de un solo nodo multi-GPU.
- Desarrollo y validacion de harnesses de evaluacion: al ser un checkpoint pequeno en numero de descargas y con resultados conocidos, es util para validar pipelines de evaluacion (normalizacion de respuestas, extraccion de cajas, verificacion simbolica) antes de aplicarlos a modelos mayores.
- Investigacion sobre degradacion por cuantizacion en MoE: cuantizar los pesos y medir la caida en MATH-500 es un caso de estudio directo para entender como afecta la cuantizacion al enrutado en arquitecturas dispersas.

## Benchmarks y rendimiento

Resultados publicados en la model card para este checkpoint (paso 8, brazo E17d reparado), en evaluacion held-out:

| Benchmark | Snowball-67B-A2B-Math-RL-E17d-Step8-Repaired |
|---|---|
| AIME24 | 3,33 |
| MATH-500 | 37,80 |
| OlympiadBench | 5,67 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Las condiciones exactas de evaluacion (numero de muestras, temperatura, formato de respuesta, uso de verificador) se remiten al fichero `MATH_EVALS.md` del archivo de evidencias, que no forma parte de los datos proporcionados.

## Requisitos de hardware

- Pesos en precision completa: 134,2 GB de repositorio, coherente con BF16/FP16. Para inferencia en BF16 se necesitan al menos dos GPUs de 80 GB (por ejemplo, 2x A100 80 GB o 2x H100 80 GB) para acomodar pesos, cache KV y overhead.
- Precision reducida: en FP8/INT8 los pesos se situarian en torno a 67 GB, lo que permitiria una sola GPU de 80 GB (H100 80 GB o A100 80 GB), sujeto a soporte de la arquitectura por parte del runtime.
- Cuantizacion de 4 bits: estimacion de 34-40 GB de pesos, lo que encajaria en una GPU de 48 GB (A6000, L40S) o en dos GPU de 24 GB. No hay formatos GGUF ni cuantizaciones publicadas; esta cifra es una estimacion a partir del tamano de los pesos y requeriria un proceso propio de cuantizacion.
- GPU de consumo: en 4 bits no cabe en una RTX 4090 de 24 GB; serian necesarias dos unidades con reparto de capas o una GPU de 48 GB. En BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM y TGI son las vias habituales para modelos MoE con pesos safetensors, pero el soporte de la arquitectura `grug_moe` no esta confirmado en la informacion disponible. llama.cpp/Ollama no estan disponibles al no existir pesos GGUF. La model card exige preservar `config.json`, el tokenizer y todos los shards del indice, lo que sugiere un cargado dependiente de configuracion personalizada.
- Latencia y rendimiento: no disponible. La dispersion del modelo (subconjunto de parametros activos) sugiere un coste de computo por token inferior al de un modelo denso de 67 B, pero no se aportan mediciones de throughput ni de latencia.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la informacion disponible, por lo que no es posible establecer una comparativa numerica verificada.

| Modelo | Parametros totales | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-E17d-Step8-Repaired | 67,08 B | no disponible | AIME24 3,33 / MATH-500 37,80 / OlympiadBench 5,67 | `other` | HuggingFace, 0 descargas, 0 likes |
| Alternativas de la misma escala (MoE dispersos de ~60-70 B) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Exportaciones antiguas `laion/rl-snowball-*` | no disponible | no disponible | no disponible | no disponible | Referenciadas en la model card como posibles exportaciones de router mutable; no se recomienda sustituirlas por este artefacto |
| Otros brazos / pasos de la campana Snowball | no disponible | no disponible | no disponible (el paso 20 del brazo E17d sigue sin reparar) | `other` | Parcial, segun la model card |

## Limitaciones y advertencias

- Artefacto de investigacion, no de produccion: la propia model card lo declara explicitamente y senala que su utilidad es limitada salvo que se preserve la reparacion del sesgo del router o la integridad de un router congelado.
- Riesgo de colapso por router: cargar este checkpoint con un `config.json` distinto, sustituir los pesos por los de repositorios `laion/rl-snowball-*` o mezclar shards puede reproducir el fallo de colapso en inferencia que la campana intenta documentar y corregir.
- Integridad del paquete: deben conservarse juntos `config.json`, los ficheros del tokenizer y todos los shards listados en `model.safetensors.index.json`; cualquier sustitucion parcial invalida el artefacto.
- Rendimiento bajo en matemáticas: 3,33 en AIME24 y 5,67 en OlympiadBench estan muy por debajo de lo que se espera de un modelo usable en produccion; los resultados en MATH-500 (37,80) tampoco son competitivos frente a modelos de razonamiento actuales.
- Cobertura de evaluacion limitada: solo se publican tres benchmarks, en un unico paso (paso 8) de un unico brazo (E17d reparado), sin informe de varianza, numero de muestras ni condiciones de decodificacion en la informacion disponible.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion.
- Riesgo de alucinacion: previsible en generacion libre, dado que el modelo no esta orientado a produccion ni se documentan salvaguardas; sin datos cuantitativos disponibles.
- Idiomas y contexto: no disponible; el repositorio no declara idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingues o de contexto largo.
- Licencia restrictiva o ambigua: la licencia es `other` sin texto asociado en la informacion proporcionada, por lo que no puede confirmarse que el uso comercial este permitido. Se recomienda contactar con el autor antes de cualquier uso comercial.
- Ausencia de adopcion: 0 descargas y 0 likes en el momento del registro, sin senales de validacion por parte de la comunidad.
- Cuantizacion no soportada de serie: no existen pesos GGUF ni cuantizaciones publicadas, y el soporte de la arquitectura personalizada en runtimes de inferencia no esta confirmado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E17d-Step8-Repaired
- Archivo de evidencias (dataset con `MATH_EVALS.md` y artefactos): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en Marin: https://github.com/marin-community/marin/issues/7786
- Fuente del artefacto original: `s3://marin-us-east-02a/marin/exports/snowball-bias-repaired/rl-snowball-e17d-rno2a-rlvrmath-lossfree-sr-20260825-014634/global_step_8/policy/`
- Las busquedas web realizadas no devolvieron resultados relacionados con este modelo; los unicos enlaces relevantes son los procedentes de la model card.
