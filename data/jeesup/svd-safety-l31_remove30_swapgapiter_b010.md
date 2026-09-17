# Jeesup/svd-safety-l31_remove30_swapgapiter_b010

## Resumen

`svd-safety-l31_remove30_swapgapiter_b010` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace, derivado de `meta-llama/Llama-3.1-8B-Instruct`. No es un asistente conversacional listo para producción: es un artefacto experimental construido en dos etapas. Primero se comprime el modelo Instruct original con SVD-LLM, eliminando el 30,01% de los parámetros de proyección densos, de modo que el checkpoint conserva el 69,99% de los parámetros densos. Después se aplican 10 de 10 rondas de una edición iterativa de pesos denominada swap neutral en parámetros, guiada por la regla de selección `gap_iter`, con un presupuesto total del 1,0% de los parámetros densos (0,1% por ronda).

El propósito declarado es medir cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. Esta ficha corresponde a una única celda de una rejilla de experimentos que cruza reglas de selección y presupuestos; la propia model card advierte de que varias celdas de esa rejilla están deliberadamente degradadas en seguridad respecto al modelo base.

Técnicamente es un transformer decoder-only de la familia Llama 3.1, con 8.030.261.248 parámetros declarados en los safetensors y un repositorio de 16,1 GB. No se publican métricas de capacidades generales (MMLU, HumanEval, GSM8K), pero sí cuatro medidas concretas: tasa de éxito de ataque en AdvBench y StrongREJECT, sobrerrechazo macro y perplejidad en WikiText-2. Esta última, 309,7534, es muy elevada y apunta a una degradación severa de la calidad del lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con pesos comprimidos mediante SVD-LLM y posterior edición iterativa de componentes; no es MoE ni SSM |
| Parametros totales | 8.030.261.248 (segun safetensors). La model card declara una fraccion de parametros densos resultante de 0,6999 (69,99%) tras eliminar el 30,01% de los parametros de proyeccion densos |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible. El checkpoint no declara contexto propio en la informacion proporcionada; el modelo base es Llama-3.1-8B-Instruct |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se incluyen variantes GGUF, AWQ, GPTQ ni ninguna cuantizacion declarada |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License (`LICENSE` y `USE_POLICY.md` incluidos en el repositorio). Built with Llama |
| Formato de pesos | Safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos (0,100% por ronda, 10 rondas) |
| Componentes restaurados / sustituidos | 10.069 / 10.069 |
| Parametros insertados | 69.594.112 (1,00% de los parametros de proyeccion densos); valor de swap `insert` con desalojo ordenado por sigma |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion declarada | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3.1-8B-Instruct: un transformer decoder-only con atencion por grupos (GQA) y normalizacion RMSNorm, ajustado por instrucciones por Meta. Sobre ese checkpoint no se realiza un reentrenamiento, sino una cirugia de pesos en dos fases. La primera es una compresion SVD-LLM que trunca descomposiciones de valor singular de las matrices de proyeccion, eliminando el 30,01% de los parametros densos. La segunda es un proceso iterativo de sustitucion de componentes con la restriccion de no alterar el numero de parametros (neutral en parametros): en cada ronda se seleccionan componentes segun la regla `gap_iter` y se insertan valores procedentes de la descomposicion, con desalojo ordenado por valor singular (`sigma-ordered eviction`). Se aplicaron las 10 rondas completas previstas, con un chunk del 0,100% de los parametros densos por ronda, 10.069 componentes restaurados y otros tantos sustituidos, hasta un total de 69.594.112 parametros insertados con semilla 42.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre fases de RLHF o DPO adicionales; la alineacion procede integramente del modelo Instruct original y, segun la model card, la compresion por si sola incrementa la tasa de exito de ataques. No se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y seguimiento de instrucciones en formato conversacional: el checkpoint conserva la estructura y el ajuste Instruct del modelo base, pero la model card no valida la calidad de las respuestas tras la compresion y edicion.
- Razonamiento, codigo y matematicas: no documentado. No se publican resultados en MMLU, HumanEval, GSM8K ni similares, y la perplejidad de 309,7534 en WikiText-2 indica una degradacion severa que hace desaconsejable su uso en estas tareas.
- Tool calling / function calling: no documentado para este checkpoint. El modelo base Llama-3.1-8B-Instruct si lo soporta, pero no hay verificacion de que la capacidad sobreviva a la compresion y a las 10 rondas de swap.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidad especial: el checkpoint funciona como sujeto experimental para medir tasa de exito de ataque (ASR) y sobrerrechazo bajo compresion, que es su proposito declarado.
- Vision y audio: no soportados (no hay torre multimodal ni encoder asociado).

## Casos de uso

- Medicion de la degradacion de seguridad por compresion: ejecutar evaluaciones de ASR sobre AdvBench y StrongREJECT con el juez HarmBench y comparar los valores de esta celda (0,0788 y 0,2556) con los del modelo sin comprimir, para cuantificar cuanto dano introduce el truncamiento SVD.
- Comparacion de reglas de seleccion de componentes: utilizar esta celda como brazo `gap_iter` dentro de la rejilla del estudio y contrastarla con las celdas de otras reglas de seleccion, manteniendo constante el presupuesto del 1,0% y la semilla 42.
- Trazado de la curva seguridad-utilidad: combinar la perplejidad en WikiText-2 (309,7534) con la tasa de sobrerrechazo macro medida con WildGuard (0,0390) para situar este punto concreto en el equilibrio entre utilidad y rechazo.
- Interpretabilidad de componentes criticos de seguridad: los 10.069 componentes restaurados y los 10.069 sustituidos delimitan un subconjunto concreto de pesos de proyeccion; analizar su distribucion por capa permite estudiar que subespacios estan implicados en el comportamiento de rechazo.
- Validacion de arneses de evaluacion de seguridad: al ser un checkpoint degradado conocido, sirve como caso de prueba negativo para verificar que un pipeline automatico de red-teaming detecta perdida de alineacion antes de aplicarlo a modelos candidatos a despliegue.
- Reproducibilidad metodologica de SVD-LLM: reproducir el pipeline completo (eliminacion del 30,01%, 10 rondas de 0,100%, sustitucion `insert`) y comprobar que la fraccion final de parametros densos es 0,6999 con semilla 42.
- Material docente en cursos de interpretabilidad y compresion: ilustrar con un caso real y medible como una intervencion sobre los pesos altera simultaneamente metricas de seguridad y de fluidez.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0788 |
| StrongREJECT ASR (juez HarmBench) | 0,2556 |
| Sobrerrechazo macro (WildGuard) | 0,0390 |
| Perplejidad en WikiText-2 | 309,7534 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra prueba de capacidades generales, ni cifras comparativas del modelo base en las mismas metricas de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos (8,03 mil millones de parametros), mas cache KV y activaciones; el repositorio ocupa 16,1 GB, coherente con ese orden de magnitud.
- GPU de datacenter recomendadas: A100 (40 o 80 GB), H100 (80 GB), L40S (48 GB) para servir con margen de contexto.
- GPU de consumo: cabe en tarjetas de 24 GB como RTX 3090 o RTX 4090 en bf16, con margen limitado para contextos largos. En GPUs de 16 GB el encaje es ajustado y puede requerir cuantizacion en carga. En GPUs de 8-12 GB no cabe sin cuantizacion, y el repositorio no publica variantes GGUF ni AWQ/GPTQ.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio lleva la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM. Al no haber pesos GGUF publicados, llama.cpp u Ollama exigirian convertir y cuantizar previamente. No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove30_swapgapiter_b010` | 8,03B declarados; 69,99% de parametros densos tras SVD | No disponible | ASR AdvBench 0,0788; ASR StrongREJECT 0,2556; sobrerrechazo 0,0390; ppl WikiText-2 309,7534 | Llama 3.1 Community | Publico en HuggingFace, 0 descargas y 0 likes |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8,03B | No disponible en la informacion proporcionada | No se facilitan aqui sus metricas de seguridad ni de perplejidad | Llama 3.1 Community | Publico en HuggingFace, ampliamente utilizado |
| Otras celdas de la rejilla del mismo estudio (otras reglas de seleccion o presupuestos) | Misma base comprimida | No disponible | No disponible | Llama 3.1 Community | El autor no las enumera en esta model card |
| Otras alternativas de compresion de Llama-3.1-8B (cuantizacion AWQ, GPTQ, GGUF) | 8B, cuantizados | No disponible | No disponible | Llama 3.1 Community | No se han aportado datos comparables en la informacion disponible |

## Limitaciones y advertencias

- Seguridad degradada de forma deliberada en varias celdas del estudio: este checkpoint presenta una tasa de exito de ataque de 0,0788 en AdvBench y de 0,2556 en StrongREJECT, medidas con juez HarmBench, por lo que puede producir contenido danino si se despliega sin filtros.
- Degradacion severa de la calidad del lenguaje: una perplejidad de 309,7534 en WikiText-2 es muy superior a la esperable en un modelo de 8B sin comprimir, lo que anticipa salidas incoherentes y un riesgo alto de alucinacion.
- Sobrerrechazo: la tasa macro de sobrerrechazo medida con WildGuard es 0,0390, es decir, rechaza peticiones legitimas en una proporcion no despreciable.
- La propia model card indica que no es un modelo de chat de proposito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Idioma: no se declara ninguna lista de idiomas soportados; se desconoce el comportamiento fuera del ingles.
- Contexto: el checkpoint no declara longitud de contexto propia; se desconoce si la compresion y el swap afectan al comportamiento en ventanas largas.
- Licencia Llama 3.1 Community: no es una licencia permisiva tipo Apache o MIT. Incluye politica de uso aceptable (`USE_POLICY.md`), obligacion de atribucion ("Built with Llama") y condiciones adicionales para productos con mas de 700 millones de usuarios mensuales. Hay que revisarla antes de cualquier uso comercial.
- No se publican cuantizaciones oficiales ni datos de latencia o throughput, lo que complica planificar un despliegue en produccion.
- Sin validacion comunitaria: 0 descargas, 0 likes y una fecha de creacion declarada de 2026-09-17; no hay terceros que hayan replicado los resultados.
- No se documentan sesgos especificos mas alla de los heredados del modelo base Llama-3.1-8B-Instruct, que tampoco se cuantifican en esta ficha.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove30_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Ficheros de licencia y politica de uso incluidos en el repositorio: `LICENSE` y `USE_POLICY.md` del propio checkpoint
- La busqueda web realizada no devolvio resultados relevantes: los unicos enlaces recuperados pertenecen a subforos de respuestas de cuestionarios de Bing (r/BingHomepageQuiz, r/BingQuizAnswers, r/MicrosoftRewards) y no guardan relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
