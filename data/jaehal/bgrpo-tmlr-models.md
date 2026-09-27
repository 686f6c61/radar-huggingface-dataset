# JaehaL/bgrpo-tmlr-models

## Resumen

BGRPO (Rank-Aware Beam GRPO) es una coleccion de pesos de investigacion publicada por Jaeha Lee y Tony Yue Yu como material complementario del articulo "Discovering Hidden Algebraic Structures via Transformers with Rank-Aware Beam GRPO", aceptado en Transactions on Machine Learning Research (TMLR). No es un modelo de lenguaje de proposito general, sino un conjunto de 30 checkpoints (3 bases supervisadas mas 27 endpoints de RL) entrenados para una tarea concreta: la descomposicion de polinomios multivariantes, es decir, recuperar estructura algebraica oculta factorizando un polinomio como composicion de partes de grado inferior.

El repositorio contiene tres arquitecturas transformer de tipo encoder/decoder no especificado, con d_model de 256, 512 y 768 y 6 capas cada una, que se usan como inicializacion supervisada (SFT) antes de aplicar aprendizaje por refuerzo. Sobre esas bases se ejecutan tres metodos —GRPO estandar, BGRPO con busqueda por haces y la variante con recompensa sensible al ranking (bgrpo_rank)— con tres semillas cada uno, dando 27 endpoints en el paso de entrenamiento 420.

La relevancia actual es metodologica: el repositorio permite reproducir los resultados del articulo y estudiar si el RL sobre candidatos generados por beam search, con una recompensa que tiene en cuenta el ranking, encuentra descomposiciones que el entrenamiento supervisado por si solo no alcanza. Los pesos son pequenos (36-182 MB por checkpoint) y se distribuyen en formato PyTorch nativo, no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (segun los tags del repositorio; la model card no detalla encoder, decoder ni tipo de atencion) |
| Parametros totales | No disponible (la model card solo indica d_model y numero de capas: 256, 512 y 768 con 6 capas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; los checkpoints son .pt en precision no especificada) |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio esta vacio) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pt (carga con `torch.load`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El pipeline tiene dos fases. En la primera se entrenan de forma supervisada tres bases transformer (`sft_base/`), identificadas como `d2_arch_256_l6` (d_model 256, 6 capas, 36 MB), `d2_arch_512r3_l6` (d_model 512, 6 capas, 91 MB) y `d2_arch_768r2_l6` (d_model 768, 6 capas, 182 MB). En la segunda, cada base se usa como inicializacion para tres variantes de aprendizaje por refuerzo: `grpo` (linea base estandar), `bgrpo`, que anade busqueda por haces sobre las decodificaciones candidatas, y `bgrpo_rank`, la variante sensible al ranking introducida en el articulo. El cruce de 3 arquitecturas x 3 semillas (1, 2 y 148) x 3 metodos genera los 27 endpoints de RL archivados, todos capturados en el paso 420.

La innovacion principal descrita es la recompensa con informacion de ranking aplicada sobre un conjunto de candidatos producidos por beam search, en lugar de sobre una unica muestra del decodificador. El objetivo es determinar si esa senal de recompensa mas rica permite descubrir descomposiciones correctas de polinomios que el modelo supervisado no genera. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas adicionales como DPO. El entrenamiento se ejecuto en el cluster HPC Caltech Resnick entre abril y mayo de 2026; los archivos de configuracion, el codigo de entrenamiento y los JSON de resumen de evaluacion residen en el repositorio de GitHub, no en HuggingFace.

## Capacidades

- Generacion de secuencias simbolicas orientadas a descomposicion de polinomios multivariantes: dado un polinomio, producir una factorizacion como composicion de partes de grado inferior.
- Razonamiento algebraico de dominio especifico dentro de la tarea de descomposicion; no es un modelo de razonamiento generalista.
- Decodificacion con busqueda por haces aprovechada durante el entrenamiento con RL (variantes `bgrpo` y `bgrpo_rank`), con recompensa sensible al ranking de candidatos.
- Tres tamanos de modelo intercambiables (d_model 256, 512 y 768) que permiten estudiar el efecto de la escala en la misma tarea.
- Capacidad de servir como punto de partida para experimentos de RL con GRPO en dominios simbolicos.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso en entornos externos.
- No consta capacidad multilingue: la tarea es matematica y simbolica, y el repositorio no declara idiomas.
- No consta modo "thinking", vision, audio ni ninguna otra modalidad.

## Casos de uso

- Reproduccion de resultados academicos: cargar los 27 endpoints de `bgrpo_runs/<arch>/<seed>/<method>.pt` en el paso 420 y regenerar las figuras del articulo a partir de los JSON de evaluacion del repositorio de GitHub.
- Investigacion en aprendizaje por refuerzo: comparar de forma controlada `grpo` frente a `bgrpo` y `bgrpo_rank` manteniendo arquitectura y semilla fijas, para aislar el efecto de la busqueda por haces y de la recompensa sensible al ranking.
- Estudio de varianza entre semillas: con tres semillas por configuracion, permite analizar la estabilidad de los metodos de RL en una tarea de generacion estructurada discreta.
- Pre-filtrado en algebra computacional: usar el modelo como generador de candidatos de descomposicion que despues se verifican con un sistema de algebra computacional exacto (por ejemplo, SageMath o SymPy), reduciendo el espacio de busqueda antes de la verificacion formal.
- Generacion de datos sinteticos etiquetados: producir pares polinomio-descomposicion para aumentar corpus de entrenamiento de otros modelos o para validar heuristicas de factorizacion.
- Base para transferencia de la receta de RL: reutilizar los scripts y configuraciones como plantilla para aplicar GRPO con busqueda por haces y recompensa de ranking a otras tareas simbolicas de salida discreta.
- Docencia y visualizacion de estructura algebraica: emplear el modelo mas pequeno (d_model 256, 36 MB) en entornos con recursos limitados para ilustrar como un transformer aprende composiciones de polinomios.
- Banco de pruebas de infraestructura de RL: por su tamano reducido, sirve para probar pipelines de entrenamiento con recompensa personalizada sin requerir GPU de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de metricas especificas de descomposicion de polinomios; indica que las figuras del articulo se generan a partir de los JSON de resumen de evaluacion alojados en el repositorio de GitHub (https://github.com/Jaeha0526/PolynomialDecomposition), que no forma parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquiera de las tres arquitecturas, a partir del tamano de los checkpoints (36 MB, 91 MB y 182 MB). Es una estimacion por tamano de fichero; el consumo real depende de la precision de carga y del tamano de lote.
- GPU recomendadas: no se especifica ninguna en la model card. Por tamano, cualquier GPU consumer reciente es suficiente y el entrenamiento se realizo en el cluster Caltech Resnick (GPU concretas no indicadas).
- Compatibilidad con GPU consumer: si. Los tres modelos caben sin problema en GPUs de gama media y baja, e incluso la inferencia en CPU es viable en el caso de d_model 256.
- Opciones de despliegue: PyTorch nativo mediante `torch.load` sobre los ficheros .pt, junto con el codigo del repositorio de GitHub. No se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con el pipeline de `transformers`, pese a que el repositorio lleva la etiqueta `transformers`.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 3,2 GB, muy por encima de la suma de los checkpoints individuales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos externos comparables: la tarea de descomposicion de polinomios multivariantes con RL sobre haces no tiene, en la informacion proporcionada, alternativas publicadas con las que confrontar parametros, contexto o licencia. La comparacion posible es interna al propio repositorio:

| Configuracion | d_model | Capas | Tamano del checkpoint | Metodos de RL |
|---|---|---|---|---|
| `from_256_best` | 256 | 6 | 36 MB | grpo, bgrpo, bgrpo_rank |
| `from_512r3_best` | 512 | 6 | 91 MB | grpo, bgrpo, bgrpo_rank |
| `from_768r2_best` | 768 | 6 | 182 MB | grpo, bgrpo, bgrpo_rank |

Las tres comparten licencia MIT, formato .pt, 3 semillas cada una y el mismo paso de captura (420). No hay datos publicos de rendimiento comparado entre ellas en la informacion disponible.

## Limitaciones y advertencias

- Modelo de dominio especifico: no es un asistente conversacional ni un modelo de proposito general; no debe esperarse calidad en generacion de texto libre, codigo, matematicas generales o tareas multilingues.
- Riesgo de alucinacion en sentido algebraico: puede producir descomposiciones sintacticamente plausibles pero incorrectas, por lo que toda salida debe verificarse con un sistema de algebra computacional exacto antes de usarse.
- Ausencia de datos de contexto: no se publica la longitud de contexto soportada, lo que impide planificar su uso con polinomios de gran tamano.
- Sesgos: no hay informacion sobre sesgos, y en esta tarea el concepto de sesgo estadistico convencional es poco aplicable; el riesgo principal es la sobreestimacion del rendimiento por seleccion de checkpoints en el paso 420.
- Idiomas: no declarados; la tarea es simbolica y no se documenta comportamiento linguistico alguno.
- Licencia MIT: permite uso comercial y modificacion, pero el repositorio solo archiva pesos; el codigo, las configuraciones y los scripts de evaluacion estan en GitHub y pueden tener condiciones propias.
- Reproducibilidad limitada: no se especifican version de PyTorch, precision de los pesos ni entorno de ejecucion, por lo que `torch.load` puede requerir ajustes de version.
- Seguridad al cargar: al ser ficheros .pt de PyTorch, conviene usar `weights_only=True` en `torch.load` para evitar la ejecucion de codigo arbitrario de un checkpoint no verificado.
- Trazabilidad: 0 descargas y 0 "likes" en el momento de la consulta, y ausencia de resultados de evaluacion en la propia model card, lo que obliga a acudir al repositorio de GitHub para validar cualquier afirmacion de rendimiento.
- Fecha de creacion del repositorio (27 de septiembre de 2026) posterior al periodo de entrenamiento declarado (abril-mayo de 2026); no se documenta el intervalo entre ambos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JaehaL/bgrpo-tmlr-models
- Arbol de ficheros en HuggingFace: https://huggingface.co/JaehaL/bgrpo-tmlr-models/tree/main
- Codigo, configuraciones y scripts de evaluacion: https://github.com/Jaeha0526/PolynomialDecomposition
- Articulo asociado: Lee, Jaeha y Yu, Tony Yue, "Discovering Hidden Algebraic Structures via Transformers with Rank-Aware Beam GRPO", Transactions on Machine Learning Research, 2026 (sin URL proporcionada en la informacion disponible)
- No se han encontrado enlaces adicionales relevantes en la busqueda web; los resultados obtenidos (benchlm.ai, llm-stats.com, jevmodel.org) corresponden a rankings y modelos de proposito general sin relacion con este repositorio.
