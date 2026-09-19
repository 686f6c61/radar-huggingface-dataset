# jayzou3773/less-is-moe-qwen3.5-122b-a10b-s1-128-seq8192-intdim-l-50

## Resumen

Este repositorio contiene un checkpoint del modelo Qwen/Qwen3.5-122B-A10B al que se le ha aplicado una poda estructural del 50 % mediante el método Less-is-MoE (mean-absolute-gradient), publicado por el usuario jayzou3773. La poda elimina exactamente la mitad de las neuronas FFN de los expertos enrutados del modelo base, reduciendo el numero total de parametros de los aproximadamente 122.000 millones del original a 64.129.468.416 parametros reales medidos sobre los pesos safetensors del repositorio.

El checkpoint pertenece a la variante IntDim-L, que conserva la topologia MoE enrutada y almacena anchuras compactas por experto en el archivo config.json, a diferencia de la variante IntDim-E, que usa una anchura de experto uniforme. La calibracion se realizo con 128 muestras del dataset yentinglin/s1K-1.1-trl-format, con seq_length=8192, truncado por prefijo, sin padding y en BF16. No se aplico ningun paso de optimizador, por lo que se trata de una poda sin fase de recuperacion documentada.

Su relevancia es fundamentalmente metodologica: sirve como artefacto reproducible para estudiar el impacto de la poda de expertos en modelos MoE de gran tamano, y como alternativa de menor huella de memoria frente al modelo base. El punto critico es que la inferencia no funciona con vLLM estandar: requiere el plugin ragged de Less-is-MoE incluido en la imagen GPU unificada del proyecto. El modelo es de tipo text-generation y conversational, con licencia Apache-2.0, publicado el 18 de septiembre de 2026 y con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con FFN de expertos enrutados podados; tag oficial `qwen3_5_moe_text` |
| Parametros totales | 64.129.468.416 (medidos sobre safetensors) |
| Parametros activos | no disponible (el modelo base Qwen3.5-122B-A10B declara ~10B activos; tras podar el 50 % de neuronas FFN de expertos enrutados el autor no publica el nuevo valor) |
| Longitud de contexto | no disponible (la calibracion uso seq_length=8192; no se especifica la ventana de inferencia) |
| Tipos de cuantizacion | BF16 (pesos originales en safetensors). No se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 128,3 GB) |

Datos adicionales de identificacion: pipeline `text-generation`, autor `jayzou3773`, region `us`, creado el 2026-09-18T23:14:51Z y actualizado el 2026-09-18T23:20:21Z (menos de 6 minutos de diferencia entre ambos eventos).

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer de tipo mixture of experts con expertos enrutados (Qwen3.5-122B-A10B). El proceso aplicado no es un entrenamiento sino una poda estructural: el metodo Less-is-MoE, en su variante mean-absolute-gradient, elimina exactamente el 50 % de las neuronas de las FFN de los expertos enrutados. La seleccion de filas de origen se fija con el hash `f261e952d4e6d5dec6d37db4ab22636761b215281d33896060fe4467bb352784`, y el fichero de tokens especifico del modelo tiene el hash `47214818e5c0acaa6e65d3f212f7fab62937a4085d26394c356e3be1c94fffbf`. La variante IntDim-L/G conserva la topologia MoE enrutada y guarda anchuras compactas por experto en `config.json`, mientras que IntDim-E usa una anchura de experto uniforme.

La calibracion se hizo con 128 muestras procedentes de `yentinglin/s1K-1.1-trl-format`, revision `58a01564d278477da20ead1bcf1cde8e31f36251`, replicando los ajustes del loader publicado: `train`, `messages`, `shuffle_seed=1234`, `seq_length=8192`, truncado por prefijo, sin padding y en BF16. No hubo ningun paso de optimizador, es decir, no se documenta una fase de recuperacion (fine-tuning o distillation) posterior a la poda. El checkpoint original se cargo y podo en BF16. Los tensores de tokens especificos del modelo estan publicados en el repositorio `jayzou3773/less-is-moe-s1-calibration-128-seq8192`, revision `678b4e666183e16ec00376960df03b6381632ed1`, y los metadatos completos de exportacion y de equivalencia con la mascara cero estan en `experiment-export.json`.

## Capacidades

- Generacion de texto y conversacion: heredadas del modelo base Qwen3.5-122B-A10B, no verificadas de forma independiente en la informacion disponible para este checkpoint podado.
- Razonamiento, codigo y matematicas: se asumen como capacidades heredadas del base; no hay evaluaciones publicadas que las confirmen tras la poda.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no aparece en la model card).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Capacidad especifica confirmada: carga e inferencia con topologia MoE podada mediante el plugin ragged de Less-is-MoE sobre vLLM.

## Casos de uso

- Reproduccion de experimentos de poda MoE: el checkpoint esta pensado para verificar el metodo Less-is-MoE mean-absolute-gradient, ya que publica los hashes de seleccion de filas, del fichero de tokens y los metadatos de equivalencia con la mascara cero en `experiment-export.json`. Es el uso principal y mas realista dada la ausencia de benchmarks.
- Servicio de generacion de texto self-hosted con menor huella de memoria: con 64,1B parametros en BF16 frente a los ~122B del base, permite servir un modelo conversacional en nodos de 2x80 GB en lugar de configuraciones mayores, a costa de requerir el plugin vLLM especifico.
- Estudio del degradation gap por poda: comparar las salidas de este checkpoint contra Qwen3.5-122B-A10B sobre un conjunto de evaluacion fijo permite cuantificar la perdida de calidad asociada a eliminar el 50 % de neuronas FFN sin recuperacion.
- Base para recuperacion o fine-tuning posterior: el checkpoint puede servir como punto de partida para un entrenamiento de recuperacion (pruning-aware fine-tuning) sobre dominio especifico, dado que no se aplico ningun paso de optimizador durante la poda.
- Investigacion sobre enrutamiento en MoE: al conservar la topologia enrutada con anchuras compactas por experto en `config.json`, permite analizar como cambia la distribucion de carga entre expertos tras la poda.
- Despliegue en pipelines de inferencia con vLLM personalizado: integrable en infraestructura que ya use la imagen GPU unificada de Less-is-MoE, como backend de generacion de texto para tareas internas no criticas donde el coste por token prime sobre la calidad maxima.
- Evaluacion de la variante IntDim-L frente a IntDim-E/G: el ecosistema Less-is-MoE publica distintas estrategias de anchura de experto, de modo que este checkpoint permite comparar el compromiso entre retener la topologia enrutada y uniformar anchuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni para el checkpoint podado ni comparado con el modelo base. Tampoco hay datos de throughput, latencia o consumo energetico.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: 64.129.468.416 parametros x 2 bytes = aproximadamente 128,3 GB solo de pesos (coincide con el tamano del repositorio, 128,3 GB). Hay que anadir la cache KV y las activaciones, por lo que se recomienda un margen por encima de 140 GB.
- GPUs recomendadas: 2x H100 80 GB, 2x A100 80 GB o 2x H200. Un unico H200 de 141 GB podria resultar justo para los pesos, sin margen comodo para cache KV.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 o RTX 3090 (24 GB) queda muy lejos de los ~128 GB de pesos. No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ) que reduzcan ese requisito.
- Opciones de despliegue: exclusivamente vLLM con el plugin ragged de Less-is-MoE, desde la imagen GPU unificada del proyecto. No se documenta soporte para llama.cpp, Ollama, TGI, SGLang ni transformers estandar, dado que el formato de anchuras por experto y la topologia podada no son compatibles con los cargadores convencionales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (IntDim-L, poda 50 %) | 64,1B | no disponible | no disponible (calibrado a 8192) | Apache-2.0 | HuggingFace, requiere plugin vLLM de Less-is-MoE |
| Qwen/Qwen3.5-122B-A10B (base) | ~122B | ~10B (segun nombre del modelo) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Otras variantes Less-is-MoE (IntDim-E, IntDim-G) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de poda de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y el modelo base, ni de otros modelos de la misma categoria, en la informacion proporcionada.

## Limitaciones y advertencias

- Sin evaluacion de calidad publicada: no hay benchmarks que cuantifiquen cuanto degrada la poda del 50 % de neuronas FFN la calidad del modelo. Cualquier uso en produccion exige una evaluacion propia previa.
- Poda sin recuperacion: no se aplico ningun paso de optimizador, por lo que no existe fase de fine-tuning que mitigue la perdida de capacidad.
- Dependencia de software no estandar: la inferencia requiere el plugin ragged de Less-is-MoE desde la imagen GPU unificada. No funciona con vLLM estandar, llama.cpp, Ollama ni TGI, lo que complica el despliegue y el mantenimiento.
- Requisitos de memoria muy altos: ~128 GB de pesos en BF16 sin cuantizaciones alternativas publicadas, lo que descarta cualquier GPU de consumo.
- Idiomas no documentados: el campo de idiomas no esta disponible, por lo que no se puede garantizar cobertura multilingue.
- Contexto no documentado: aunque la calibracion uso seq_length=8192, no se especifica la ventana de contexto soportada en inferencia.
- Riesgo de alucinacion: no evaluado en la informacion disponible; debe asumirse el riesgo propio de un modelo de lenguaje de esta escala, potencialmente incrementado por la poda.
- Sesgos: no documentados por el autor.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen3.5-122B-A10B conviene verificar las condiciones aplicables al modelo base.
- Madurez del artefacto: 0 descargas y 0 likes, creado y actualizado en menos de 6 minutos, lo que indica que no ha pasado por validacion externa de la comunidad.
- Trazabilidad: la reproducibilidad depende de los hashes declarados (seleccion de filas `f261e9...`, fichero de tokens `472148...`) y de las revisiones concretas de los datasets de calibracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-qwen3.5-122b-a10b-s1-128-seq8192-intdim-l-50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Dataset de calibracion con tensores de tokens especificos: https://huggingface.co/datasets/jayzou3773/less-is-moe-s1-calibration-128-seq8192
- Dataset fuente de las 128 muestras: https://huggingface.co/datasets/yentinglin/s1K-1.1-trl-format
- Metadatos de exportacion: fichero `experiment-export.json` dentro del repositorio del modelo
- Busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por la busqueda corresponden a anuncios de llantas y neumaticos para el vehiculo Ford Kuga y no guardan ninguna relacion con este checkpoint.
