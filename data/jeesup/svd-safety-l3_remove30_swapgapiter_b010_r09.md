# Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r09

## Resumen

`svd-safety-l3_remove30_swapgapiter_b010_r09` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de un derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM que elimina el 30,01 % de los parámetros, dejando el modelo en una fracción de parámetros densos de 0,6999 (aproximadamente el 70,0 % del original). Sobre esa base comprimida se aplicaron 9 de las 10 rondas de un procedimiento iterativo de intercambio de parámetros neutro («parameter-neutral swap») seleccionado mediante la regla `gap_iter`, con un presupuesto de restauración del 1,000 % de los parámetros densos.

El interés del artefacto es metodológico, no de producto. Forma parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. La propia model card advierte que varias celdas de la matriz experimental están «deliberadamente degradadas en seguridad» respecto al modelo original, y que este checkpoint concreto es un sujeto experimental, no un asistente desplegable.

El checkpoint reporta 8.030.261.248 parámetros totales y un repositorio de 16,1 GB, con licencia Llama 3 Community License. No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K) en la información disponible; las únicas métricas medidas son de seguridad y sobre-rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con pesos comprimidos mediante SVD-LLM; los detalles exactos de la compresión no se especifican en la model card |
| Parametros totales | 8.030.261.248 (recuento de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no indicada en la model card; el modelo base Llama-3-8B-Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors, presumiblemente fp16/bf16 por el tamano del repo de 16,1 GB); no se publican variantes GGUF ni cuantizaciones oficiales |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales de procedencia declarados por el autor: regla de seleccion `gap_iter`, presupuesto de restauracion 1,000 % de parametros densos, 9.015 componentes restaurados, 9.015 componentes sustituidos, fraccion de parametros resultante 0,6999, semilla 42, 9 de 10 rondas iterativas aplicadas, tamano de bloque por ronda 0,100 % de los parametros densos, 62.766.080 parametros intercambiados (0,90 % de los parametros de proyeccion densos) y valor de intercambio `insert` con desalojo ordenado por sigma.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3 8B Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query grouping (GQA). Sobre esa base no se ha realizado un reentrenamiento completo, sino una intervencion en los pesos en dos fases. La primera es una compresion por descomposicion en valores singulares (SVD-LLM) que elimina el 30,01 % de los parametros. La segunda es un procedimiento iterativo de intercambio de parametros descrito como «neutro en parametros»: en cada ronda se sustituyen componentes del modelo comprimido por componentes del modelo original (valor de intercambio `insert`), con desalojo ordenado por sigma, hasta un presupuesto del 0,1 % de los parametros densos por ronda. Este checkpoint corresponde a la ronda 9 de 10, por lo que no agota el presupuesto completo de la ejecucion (1,0 %).

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO especificas para este derivado. Tampoco se detallan innovaciones de inferencia como decodificacion especulativa, atencion lineal u otras optimizaciones. La innovacion tecnica del artefacto es, por tanto, metodologica: la comparacion sistematica de reglas de seleccion de componentes (`gap_iter` frente a otras) y de presupuestos de restauracion para medir la recuperacion de comportamiento de seguridad tras una compresion agresiva. La model card no aclara por que el recuento de parametros reportado coincide con el de Llama-3-8B-Instruct pese a declarar una fraccion densa de 0,6999; es una discrepancia que el autor no explica.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad base de Llama-3-8B-Instruct, aunque degradada por la compresion SVD y parcialmente recompuesta por las rondas de intercambio.
- Razonamiento y conocimiento general: no se aportan evaluaciones de capacidad (MMLU, GSM8K, HumanEval) que permitan cuantificar la retencion real.
- Codigo y matematicas: no evaluado en la informacion disponible; se asume la capacidad residual del modelo base, sin garantias.
- Soporte de tool calling / function calling: no documentado para este checkpoint; el modelo base lo soporta mediante plantillas de chat, pero no hay confirmacion de que la intervencion sobre los pesos lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; depende de lo que sobreviva a la compresion.
- Modo de pensamiento explicito o vision/audio: no disponible.
- Comportamiento de rechazo: medido como macro sobre-rechazo de 0,2659 con el juez WildGuard, lo que indica una tasa apreciable de rechazos ante peticiones benignas.
- Resistencia a ataques de jailbreak: medida como ASR de 0,0350 en AdvBench y 0,1200 en StrongREJECT, ambas con juez HarmBench.

## Casos de uso

- Estudio de la relacion entre compresion y seguridad: el checkpoint sirve como celda experimental para medir cuanto se degrada la alineacion de un modelo al eliminar el 30 % de sus parametros y como de eficaz es la regla `gap_iter` al restaurar componentes.
- Evaluacion comparativa de reglas de seleccion: permite contrastar `gap_iter` frente a otras reglas de la misma matriz experimental, manteniendo constante el presupuesto de restauracion (1,0 %) y la semilla (42), lo que facilita la reproducibilidad del analisis.
- Analisis de recuperacion parcial por rondas: al ser un checkpoint de la ronda 9 de 10, es util para estudiar la curva de recuperacion de seguridad ronda a ronda, aislando el efecto de cada bloque del 0,1 % de parametros restaurados.
- Desarrollo y calibracion de arneses de evaluacion de seguridad: al presentar valores conocidos de ASR en AdvBench y StrongREJECT y de sobre-rechazo en WildGuard, sirve como caso de prueba para validar que un pipeline de evaluacion reproduce las cifras publicadas.
- Investigacion en interpretabilidad mecanistica: los 9.015 componentes restaurados y 9.015 sustituidos constituyen un conjunto etiquetado de intervenciones sobre pesos, util para localizar que subconjuntos de parametros sostienen el comportamiento de rechazo.
- Pruebas de red-teaming controladas: al ser un artefacto con seguridad deliberadamente degradada en algunas celdas, permite calibrar la sensibilidad de clasificadores y jueces (HarmBench, WildGuard) frente a ataques de jailbreak en modelos con alineacion parcial.
- Docencia y practica sobre tecnicas de compresion: sirve como ejemplo reproducible de un pipeline SVD-LLM seguido de restauracion selectiva de componentes, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / referencia |
|---|---|---|
| AdvBench ASR | 0,0350 | Juez HarmBench |
| StrongREJECT ASR | 0,1200 | Juez HarmBench |
| Macro over-refusal | 0,2659 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench y similares) en la informacion disponible. Tampoco se proporcionan cifras del modelo base sin comprimir en las mismas metricas de seguridad, por lo que no es posible cuantificar directamente la degradacion o la recuperacion atribuible al procedimiento a partir de los datos facilitados.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 16 GB solo para pesos, con un pico de 18-20 GB contando cache KV y overhead de runtime; es coherente con el tamano de repositorio de 16,1 GB.
- VRAM estimada en int8: alrededor de 9-10 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 5-6 GB, aunque no se publican variantes GGUF oficiales, por lo que la cuantizacion requeriria conversion propia.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 6000 Ada; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) podrian alojar el modelo en fp16 con contexto corto.
- GPU consumer: si cabe en tarjetas de 24 GB en fp16 y en tarjetas de 8-12 GB tras cuantizacion a 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se distribuyen en ese formato.
- Latencia y throughput estimados: no disponibles; no se publican mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove30_swapgapiter_b010_r09 | 8,03 B (fraccion densa declarada 0,6999) | no indicado (base: 8.192) | Checkpoint de investigacion, seguridad parcialmente degradada | Llama 3 Community License | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Modelo alineado listo para uso conversacional | Llama 3 Community License | HuggingFace, ampliamente utilizado |
| Otras celdas de la misma matriz experimental (`gap_iter` y otras reglas/compresiones) | no disponible | no disponible | Artefactos de investigacion | Llama 3 Community License | No identificadas en la informacion proporcionada |

No se dispone de datos de rendimiento comparables entre estas opciones, porque el autor no publica los valores de las metricas de seguridad del modelo base ni de las demas celdas. La comparacion con otras tecnicas de compresion (por ejemplo, cuantizacion de 4 bits o poda estructurada) no puede realizarse con la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la propia model card lo califica explicitamente como sujeto experimental y advierte contra tratarlo como un modelo de chat de proposito general.
- Seguridad degradada por diseno: la compresion por si sola eleva la tasa de exito de ataques, y varias celdas de la matriz estan deliberadamente degradadas. Aunque este checkpoint reporta un ASR bajo en AdvBench (0,0350), el ASR en StrongREJECT es de 0,1200, mas de tres veces superior.
- Sobre-rechazo elevado: la metrica de macro over-refusal de 0,2659 con WildGuard indica que el modelo rechaza una proporcion considerable de peticiones benignas, lo que penaliza la utilidad conversacional.
- Sesgos conocidos: no se documentan evaluaciones de sesgo para este derivado; los sesgos heredados de Llama-3-8B-Instruct pueden haberse visto alterados de forma no controlada por la compresion y el intercambio de componentes.
- Riesgo de alucinacion: no cuantificado. La eliminacion del 30 % de parametros y la sustitucion de 62.766.080 parametros pueden afectar a la fidelidad factual sin que existan mediciones disponibles.
- Ausencia de benchmarks de capacidad: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no puede determinarse cuanto conocimiento o habilidad se ha perdido.
- Limitaciones de contexto e idioma: la model card no declara ventana de contexto ni idiomas soportados para este derivado; no hay garantia de que el comportamiento multilingue del modelo base se conserve tras la compresion.
- Estado intermedio del procedimiento: es la ronda 9 de 10, con solo el 0,90 % de los parametros de proyeccion intercambiados frente al 1,0 % previsto, por lo que no representa el resultado final de la ejecucion completa.
- Restricciones de licencia: se aplica la Llama 3 Community License. Cualquier uso comercial queda sujeto a `LICENSE` y `USE_POLICY.md`, incluidos los requisitos de atribucion («Built with Meta Llama 3») y las restricciones de uso aceptable de Meta.
- Cifras de adopcion minimas: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados publicados.
- Discrepancia sin aclarar: el recuento de parametros reportado (8.030.261.248) coincide con el de Llama-3-8B-Instruct pese a declararse una fraccion densa de 0,6999; conviene verificar la estructura real de los tensores antes de asumir un ahorro de memoria.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Ficheros de licencia y politica de uso incluidos en el repositorio: `LICENSE` y `USE_POLICY.md`
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
