# Jeesup/svd-safety-l2_remove40_swapdisc_a020_c002_b010_r03

## Resumen

`Jeesup/svd-safety-l2_remove40_swapdisc_a020_c002_b010_r03` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM hasta el 60,0 % de los parametros densos y despues editado con 3 de 5 rondas de una tecnica de *swap* iterativo "neutral en parametros" seleccionada por la regla `disc_iter`. Lo publica el usuario Jeesup como artefacto de investigacion dentro de un estudio sobre como la compresion por SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor.

El modelo no es un asistente de proposito general: es una celda de una rejilla experimental sobre reglas de seleccion y presupuestos de restauracion. Conserva la arquitectura transformer decoder-only de Llama 2 con 6.738.415.616 parametros reales en safetensors y un tamano de repositorio de 13,5 GB, coherente con pesos en precision de 16 bits.

Su relevancia es metodologica: aporta metricas de seguridad medidas (ASR de 0,1019 en AdvBench, 0,1438 en StrongREJECT y 0,1623 de sobre-rechazo macro en WildGuard) sobre un checkpoint intermedio, lo que permite estudiar el equilibrio seguridad/utilidad bajo compresion agresiva. Al tratarse de un checkpoint intermedio de una ejecucion mas larga, no representa el resultado final del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2); pesos comprimidos con SVD-LLM |
| Parametros totales | 6.738.415.616 (conteo real del safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-2-7b-chat usa 4096 tokens |
| Tipos de cuantizacion | no disponible (repositorio distribuido en safetensors de 16 bits; no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base esta entrenado predominantemente en ingles) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Fraccion de parametros resultante | 0,5998 (segun la model card) |
| Parametros de proyeccion eliminados | 40,02 % |
| Parametros intercambiados | 38.839.040 (0,60 % de los parametros de proyeccion densos) |
| Componentes restaurados / sustituidos | 3559 / 3559 |
| Regla de seleccion | `disc_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,200 % por ronda) |
| Rondas aplicadas | 3 de 5 |
| Semilla | 42 |
| Valor de swap | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Escala de insercion | 0,2 |
| Descargas / likes | 0 / 0 |
| Fechas indicadas | creado 2026-09-15; actualizado 2026-09-15 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 2 con atencion causal, en su variante `7b-chat`, afinada por Meta con tecnicas de ajuste supervisado y RLHF sobre el modelo preentrenado. Sobre esa base, el autor aplica compresion de bajo rango SVD-LLM: descompone matrices de proyeccion y descarta componentes hasta eliminar el 40,02 % de los parametros densos, dejando una fraccion resultante de 0,5998. No se documenta ningun reentrenamiento posterior para recuperar calidad, solo la edicion descrita a continuacion.

La innovacion del checkpoint es el mecanismo de reparacion: un *swap* iterativo "neutral en parametros" que sustituye 3559 componentes por otros tantos, insertados con un escalado de 0,2 respecto a su fuerza original y con desalojo ordenado por valor sigma. La seleccion de que componentes tocar la decide la regla `disc_iter`, evaluada sobre una rejilla de reglas y presupuestos. En esta celda se aplican 3 de las 5 rondas previstas, con un coste de 38.839.040 parametros intercambiados (0,60 % de los parametros de proyeccion densos y un presupuesto total de restauracion del 1,000 %). Se trata, por tanto, de un checkpoint intermedio; el estudio completo contempla presupuestos y reglas adicionales que no forman parte de este repositorio.

## Capacidades

- Generacion de texto conversacional: hereda el formato de dialogo y las plantillas de Llama-2-7b-chat.
- Razonamiento y conocimiento general: procede del ajuste original de Llama 2, aunque degradado por la compresion SVD y sin evaluacion de calidad publicada.
- Comportamiento de seguridad medible: la model card reporta tasas de exito de ataque (ASR) y de sobre-rechazo, lo que permite usarlo como sujeto experimental.
- Compatibilidad con `text-generation-inference` y con endpoints (etiquetas `text-generation-inference` y `endpoints_compatible` en el repositorio).
- Ejecucion con la libreria `transformers` mediante `pipeline_tag: text-generation`.
- Capacidades multilingues: no disponibles; no se documenta ningun idioma distinto del ingles del modelo base.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Vision, audio o modo de razonamiento explicito (*thinking mode*): no disponibles.

## Casos de uso

- Investigacion sobre el equilibrio compresion/seguridad: sirve como una celda concreta de la rejilla para medir como varia el ASR al eliminar el 40,02 % de los parametros densos; los valores de AdvBench (0,1019) y StrongREJECT (0,1438) son el punto de partida.
- Reproduccion de ablaciones sobre reglas de seleccion: permite comparar la regla `disc_iter` con otras reglas del estudio manteniendo constante la semilla 42 y el presupuesto de 1,000 %.
- Calibracion de jueces de seguridad: al incluir resultados con el juez de HarmBench, es util para validar la sensibilidad de los evaluadores automaticos frente a checkpoints degradados.
- Desarrollo de clasificadores de rechazo: la metrica de sobre-rechazo macro (0,1623, WildGuard) documenta un caso real de utilidad reducida por exceso de negativas, util para entrenar filtros que distingan rechazo legitimo de sobre-rechazo.
- Pruebas de infraestructura de inferencia: al ser un checkpoint no estandar de 13,5 GB en safetensors, sirve para verificar que stacks como transformers, TGI o vLLM cargan pesos comprimidos y que el pipeline de despliegue no asume formas de tensor convencionales.
- Experimentos de interpretabilidad: los 3559 componentes restaurados y los 3559 desalojados ofrecen un conjunto concreto de direcciones de proyeccion sobre las que estudiar que pesos sostienen el comportamiento de rechazo.
- Docencia y divulgacion: como ejemplo reproducible de un artefacto de investigacion con procedencia documentada (comprimido, editado, con semilla fija), adecuado para laboratorios sobre compresion de modelos.
- Red-teaming controlado: al estar deliberadamente degradado en algunas de sus variantes, permite construir conjuntos de datos de ataques y comparar contra la linea base sin comprimir.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,1019 | HarmBench judge |
| StrongREJECT ASR | 0,1438 | HarmBench judge |
| Sobre-rechazo macro | 0,1623 | WildGuard |

No se han publicado en la informacion disponible resultados de benchmarks de calidad general (MMLU, HumanEval, GSM8K u otros), ni comparaciones numericas frente al modelo base sin comprimir.

## Requisitos de hardware

- Pesos en 16 bits: aproximadamente 13,5 GB, cifra que coincide con el tamano del repositorio; se necesita VRAM suficiente para pesos mas cache KV, con margen para una ventana de contexto de 4096 tokens.
- Cuantizacion a 8 bits: en torno a 7 GB; a 4 bits: en torno a 4 GB (estimaciones, no publicadas por el autor).
- GPU profesionales recomendadas: A100 40 GB, H100 80 GB, L40S o A10G para servir con margen si se amplia el lote o el contexto.
- GPU de consumo: cabe en precision de 16 bits en RTX 4090, RTX 3090 y RTX 4090D con 24 GB; en tarjetas de 12 GB (RTX 3060, RTX 4070) requiere cuantizacion a 8 o 4 bits.
- Opciones de despliegue: `transformers`, `text-generation-inference`, vLLM; para llama.cpp u Ollama seria necesario convertir los safetensors a GGUF, conversion no publicada en el repositorio.
- Latencia y throughput estimados: no disponibles. Ninguna medicion de tokens por segundo figura en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_remove40_swapdisc_a020_c002_b010_r03 | 6.738.415.616 (40,02 % de parametros densos eliminados) | no disponible (base: 4096) | Llama 2 Community License | Artefacto de investigacion; ASR 0,1019 / 0,1438 |
| meta-llama/Llama-2-7b-chat-hf | 6.739.000.000 aprox. | 4096 | Llama 2 Community License | Modelo base sin comprimir; no se publican en la informacion disponible sus metricas de seguridad comparables |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.000.000 aprox. | 131.072 | Llama 3.1 Community License | Alternativa generacional mas reciente; no comparable en terminos de compresion |
| Mistral-7B-Instruct-v0.3 | 7.250.000.000 aprox. | 32.768 | Apache 2.0 | Alternativa de licencia permisiva; no comparable en metricas de seguridad con los datos disponibles |

Las cifras de parametros y contexto de los modelos alternativos corresponden a la documentacion publica de sus repositorios; en la informacion proporcionada no hay datos de rendimiento que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- No es un modelo desplegable: la propia model card indica que debe tratarse como sujeto experimental y no como asistente de proposito general.
- Algunas celdas de la rejilla estan deliberadamente degradadas en seguridad; la compresion por si sola eleva la tasa de exito de ataque respecto a Llama-2-7b-chat.
- Riesgo de alucinacion elevado y no cuantificado: no se publican evaluaciones de calidad general ni de veracidad.
- Checkpoint intermedio: solo se aplicaron 3 de las 5 rondas de swap previstas, por lo que no refleja el resultado final del estudio.
- Resultados de una unica semilla (42): no se documenta variabilidad entre ejecuciones ni intervalos de confianza.
- Idiomas soportados no documentados; el modelo base esta orientado al ingles y se desconoce el impacto de la compresion en otros idiomas.
- Sin datos de cuantizacion publicados: cualquier uso en 4 u 8 bits anade degradacion no medida a la ya introducida por la compresion.
- Licencia Llama 2 Community License: uso comercial sujeto a la politica de uso aceptable de Meta, obligacion de incluir el aviso "Built with Llama 2" y de conservar `LICENSE.txt` y `USE_POLICY.md`.
- Repositorio sin descargas ni likes, sin validacion externa de la comunidad.
- Discrepancia a verificar: el conteo real de parametros del safetensors coincide practicamente con el del modelo base sin comprimir, mientras la model card indica una fraccion resultante de 0,5998 aplicada a los parametros de proyeccion densos; conviene inspeccionar las formas de tensor antes de asumir el ahorro de memoria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a020_c002_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y politica de uso incluidas en el repositorio: `LICENSE.txt` y `USE_POLICY.md` (no se han encontrado URLs adicionales, papers, blogs o demos en la busqueda web realizada).
