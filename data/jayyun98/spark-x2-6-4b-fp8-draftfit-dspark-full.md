# jayyun98/Spark-X2.6-4B-FP8-Draftfit-DSpark-Full

## Resumen

Spark-X2.6-4B-FP8-Draftfit-DSpark-Full es un modelo borrador (draft model) diseñado para decodificación especulativa sobre el modelo objetivo XHToken/Spark-X2.6-4B-FP8. Lo publica el usuario jayyun98 como checkpoint de validación de Draftfit, una plataforma para construir, convertir y evaluar borradores de decodificación especulativa. No es un modelo de propósito general: es una pieza auxiliar que propone tokens que el modelo objetivo verifica después.

El checkpoint contiene 624.416.001 parámetros en safetensors (aproximadamente 0,62 mil millones), muy por debajo de los 4 mil millones que sugiere el nombre del modelo base. Esta discrepancia indica que se trata de un borrador destilado o recortado del objetivo, no de una réplica completa. El repositorio ocupa 1,2 GB y los pesos se almacenan en BF16 con normas en FP32; la etiqueta FP8 del nombre hace referencia a que el modelo objetivo con el que se empareja está cuantizado en FP8.

Su relevancia es acotada pero técnica: sirve como referencia reproducible para medir la tasa de aceptación de propuestas especulativas. Según la model card, alcanza un 40,00 % de propuestas aceptadas frente al 38,58 % del borrador de origen, en una validación con verificación greedy de prefijo, siete propuestas por paso, 64 tokens de salida y 24 prompts fijos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (borrador para decodificacion especulativa; clase `SparkDSpark` en `spark_model.py`) |
| Parametros totales | 624.416.001 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en BF16 con normas en FP32; el objetivo asociado usa FP8 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del borrador. La model card indica que se carga mediante la clase `SparkDSpark(official_config())` definida en `spark_model.py`, con un adaptador compatible con el objetivo Spark, y que la revision del objetivo esta fijada en `config.json`. Los pesos se almacenan en BF16 con normas en FP32. El nombre del repositorio sugiere un proceso de "draftfit" sobre el modelo base XHToken/Spark-X2.6-4B-FP8, pero no se especifican datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica declarada es la propia metodologia de evaluacion: verificacion greedy de prefijo con siete propuestas por paso y 64 tokens de salida, sobre 24 prompts fijos (ocho de proposito general, ocho de codigo y ocho de matematicas). La aceptacion excluye los tokens bonus del objetivo. Las mediciones se realizaron con los pesos cuantizados originales del objetivo y QDQ de activaciones dinamicas en una referencia descomprimida de compressed-tensors. La paridad con kernels empaquetados nativos y la velocidad en servicio de produccion quedan sin medir.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa sobre el objetivo Spark-X2.6-4B-FP8.
- Verificacion de prefijo greedy: las propuestas se validan contra el objetivo, de modo que la salida final coincide con la generacion solo-objetivo (segun la model card, todas las salidas de validacion coinciden con la referencia fija).
- Cobertura de tres dominios en la validacion: texto general, codigo y matematicas.
- Idioma: unicamente ingles.
- No se documentan tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- No es un modelo para uso directo como generador: requiere integracion con el objetivo y con un runtime compatible.

## Casos de uso

- Aceleracion de inferencia sobre Spark-X2.6-4B-FP8: emparejar este borrador con el objetivo para reducir el numero de pasos de decodificacion, aceptando propuestas verificadas por el modelo grande. Es su proposito declarado.
- Evaluacion de pipelines de decodificacion especulativa: usar el checkpoint como referencia fija para comparar tasas de aceptacion entre distintas configuraciones de borrador.
- Reproduccion de metricas: los registros completos en `metrics.json` permiten replicar la medicion del 40,00 % de aceptacion con los 24 prompts fijos.
- Investigacion en destilacion de borradores: analizar como un borrador de 0,62 mil millones de parametros aproxima las distribuciones de un objetivo de 4 mil millones en dominios de codigo y matematicas.
- Pruebas de integracion de runtimes: validar adaptadores para vLLM, SGLang o MLX, sabiendo que este checkpoint requiere integracion personalizada y que la paridad con kernels nativos no esta medida.
- Docencia y experimentacion con decodificacion especulativa: el par objetivo-borrador y la metodologia de validacion documentada sirven como caso de estudio reproducible en entornos de investigacion.

## Benchmarks y rendimiento

| Metrica | Borrador de origen | Este borrador |
|---|---:|---:|
| Propuestas de borrador aceptadas | 38,58 % | 40,00 % |

Condiciones de la medicion: verificacion greedy de prefijo, siete propuestas, 64 tokens de salida, 24 prompts fijos (ocho de general, ocho de codigo, ocho de matematicas), una sola semilla, particion previamente inspeccionada y usada para seleccion de modelo. La aceptacion excluye tokens bonus del objetivo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y tratandose de un borrador auxiliar, esos benchmarks no serian representativos de su funcion.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 1,2 GB en BF16; en la practica hay que sumar la memoria del modelo objetivo Spark-X2.6-4B-FP8, que domina el consumo.
- GPU recomendadas: no disponibles de forma especifica; el objetivo en FP8 requiere, en general, GPUs con soporte de FP8 (por ejemplo, familias Hopper o Ada de NVIDIA) para aprovechar la cuantizacion.
- Cabe en GPU de consumo: el borrador por si solo si (1,2 GB), pero el conjunto objetivo mas borrador depende del objetivo y no esta documentado.
- Despliegue: la model card indica que este checkpoint de referencia requiere integracion personalizada para vLLM, SGLang o MLX; se carga con `SparkDSpark(official_config())` desde `spark_model.py`.
- Latencia y throughput: no disponibles. La model card senala explicitamente que la velocidad en servicio de produccion y la paridad con kernels empaquetados nativos quedan sin medir, y que la generacion con cache puede diferir de la evaluacion de prefijo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (Spark-X2.6-4B-FP8-Draftfit-DSpark-Full) | 624.416.001 | no disponible | Borrador especulativo | apache-2.0 | Publicado, 0 descargas, 0 likes |
| jayyun98/Spark-X2.6-4B-Draftfit-DSpark | no disponible | no disponible | Borrador especulativo (origen) | no disponible | Publicado; 38,58 % de aceptacion |
| XHToken/Spark-X2.6-4B-FP8 | no disponible (nombre sugiere 4B) | no disponible | Modelo objetivo | no disponible | Publicado; objetivo de este borrador |

No se dispone de datos sobre otros borradores especulativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: sin el objetivo Spark-X2.6-4B-FP8 y un runtime compatible no produce salidas utiles.
- Requiere integracion personalizada para vLLM, SGLang y MLX; no hay soporte nativo documentado.
- La paridad con kernels empaquetados nativos y la velocidad real en produccion no se han medido.
- La validacion usa una sola semilla y una particion previamente inspeccionada para seleccion de modelo, lo que puede inflar la tasa de aceptacion reportada.
- La generacion con cache puede diferir de la evaluacion de prefijo completo.
- Solo soporta ingles.
- No se documentan sesgos conocidos ni tasas de alucinacion; al verificar el objetivo contra las propuestas, el riesgo de alucinacion recae en el modelo objetivo, no en el borrador.
- Uso comercial permitido por la licencia Apache 2.0, pero el rendimiento en produccion no esta validado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/jayyun98/Spark-X2.6-4B-FP8-Draftfit-DSpark-Full
- Modelo objetivo: https://huggingface.co/XHToken/Spark-X2.6-4B-FP8
- Borrador de origen: https://huggingface.co/jayyun98/Spark-X2.6-4B-Draftfit-DSpark
- Repositorio Draftfit: https://github.com/JayYun98/Draftfit
- Registros de medicion: `metrics.json` en el repositorio del modelo
- Codigo de carga: `spark_model.py` en el repositorio del modelo
