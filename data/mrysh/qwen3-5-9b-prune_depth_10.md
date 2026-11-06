# mrysh/qwen3.5-9b-prune_depth_10

## Resumen

qwen3.5-9b-prune_depth_10 es una variante podada por profundidad del modelo Qwen/Qwen3.5-9B, publicada por el usuario mrysh como parte de un benchmark de pruning que compara cuatro modelos base con ocho variantes de poda frente a sus equivalentes cuantizados. La poda se realizo con NVIDIA ModelOpt (Minitron) en su version 0.46.0rc1 y reduce la red de 32 a 29 capas del transformer, manteniendo intacta la anchura de los bloques. El checkpoint resultante conserva 8.298.581.952 parametros y ocupa 16,6 GB en disco, lo que supone una reduccion del 7,3% respecto al modelo original.

La particularidad de esta variante es que solo se poda la parte lingüistica: la torre de vision y la cabeza de prediccion multi-token de Qwen3.5 se han eliminado, de modo que el resultado es un modelo exclusivamente de texto. No se aplico destilacion ni fine-tuning posterior a la poda, por lo que la calidad decae respecto al modelo base de forma deliberada y medible, que es precisamente lo que el benchmark pretende cuantificar sobre BFCL, un conjunto de sesgo de contratacion y MedQA, ejecutados con vLLM en modo thinking desactivado.

El interes de esta ficha es acotado: no es un modelo pensado para produccion, sino un artefacto de evaluacion que permite estudiar el compromiso entre reduccion de parametros por profundidad y degradacion de capacidades en tareas de tool calling, razonamiento clinico y sesgo. Su licencia Apache 2.0, heredada del modelo base, facilita su uso experimental sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5 (arquitectura `qwen3_5_text`), podado por profundidad |
| Parametros totales | 8.298.581.952 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta variante; el benchmark compara contra checkpoints cuantizados del modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder-only con torre de vision y cabeza de prediccion multi-token. La poda aplicada es de tipo depth pruning mediante NVIDIA ModelOpt Minitron: se eliminan 3 de las 32 capas (nivel 0.1, es decir, el 10,0% de las capas solicitadas) y se conserva la anchura original de los bloques. La importancia de cada capa se estimo sobre un conjunto de calibracion de 512 muestras mixtas, lo que determina cuales se descartan.

Tras la poda no se realizo destilacion ni fine-tuning, de modo que los pesos restantes conservan el entrenamiento original del modelo base sin reajuste. Ademas, se eliminaron la torre de vision y la cabeza de prediccion multi-token, convirtiendo el checkpoint en un modelo puramente textual. El resultado es una reduccion del 7,3% de los parametros del checkpoint completo, con una perdida de calidad esperada que el autor declara explicitamente y que el benchmark asociado mide frente al modelo base y frente a las versiones cuantizadas.

## Capacidades

- Generacion de texto y razonamiento en modo texto, heredados del modelo base Qwen3.5-9B, con la degradacion esperada por la poda sin reentrenamiento.
- Soporte de tool calling y function calling, evaluado en el benchmark mediante BFCL; es una de las tres dimensiones que el autor mide.
- Razonamiento clinico y respuesta a preguntas medicas, evaluado mediante MedQA.
- Comportamiento en escenarios de sesgo de contratacion, evaluado con un conjunto especifico de hiring-bias.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: no soportada, la torre de vision fue eliminada durante el proceso de poda.
- Prediccion multi-token: no soportada, la cabeza correspondiente fue eliminada.
- Modo thinking: el benchmark lo evalua con thinking desactivado; no se documenta su comportamiento con thinking activo.

## Casos de uso

- Benchmarking de tecnicas de pruning: sirve como punto de comparacion reproducible dentro del conjunto de 4 modelos x 8 variantes para medir la caida de calidad de la poda por profundidad frente a la cuantizacion.
- Investigacion sobre compresion de modelos: permite estudiar como afecta eliminar el 10% de las capas a tareas de tool calling (BFCL) sin reentrenamiento posterior.
- Evaluacion de robustez en tool calling: util para analizar si un modelo podado mantiene la estructura de llamadas a funciones en pipelines de agentes, con vLLM como motor de inferencia.
- Analisis de sesgo: el conjunto de hiring-bias permite comparar si la poda por profundidad amplifica o atenua sesgos respecto al modelo base.
- Experimentos de razonamiento clinico: MedQA ofrece una sonda concreta para medir la degradacion en dominios de alto conocimiento factual tras la poda.
- Docencia y formacion: como ejemplo practico de pipeline de poda con NVIDIA ModelOpt y de evaluacion comparativa con vLLM en un entorno controlado.
- Analisis de coste-calidad en despliegue: al reducir parametros y tamano en disco (16,6 GB), permite estimar el ahorro de VRAM y el coste en calidad para un despliegue textual sin vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo forma parte de un benchmark sobre BFCL, hiring-bias y MedQA ejecutado con vLLM, pero no se proporcionan las puntuaciones numericas en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,6 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica requiere GPUs de 24 GB o superiores para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos, viable en GPUs consumer de 12-16 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4-5 GB para pesos, viable en GPUs consumer de 8 GB, aunque la informacion proporcionada no documenta cuantizaciones de esta variante concreta.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para BF16; RTX 3090/4080 para cuantizaciones de 8 bits.
- Cabe en GPU consumer: si, en BF16 en RTX 4090 (24 GB) con margen limitado; en cuantizacion, en RTX 4060 Ti 16 GB o similares.
- Opciones de despliegue: vLLM es el motor utilizado en el benchmark del autor; al ser un checkpoint en safetensors con arquitectura `qwen3_5_text`, deberia poder servirse tambien con TGI o transformers, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-prune_depth_10 | 8.298.581.952 | no disponible | Texto, podado por profundidad | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B (base) | no disponible en la informacion | no disponible | Multimodal con vision y MTP | Apache 2.0 | Hugging Face |
| Otras variantes del benchmark (4 modelos x 8 variantes) | no disponible | no disponible | Podadas y cuantizadas | segun modelo base | Hugging Face |

La comparacion cuantitativa con el modelo base y con las variantes cuantizadas forma parte del benchmark del autor, pero las cifras no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad deliberada: no hubo destilacion ni fine-tuning tras la poda, por lo que el rendimiento cae respecto a Qwen3.5-9B; el autor lo advierte explicitamente.
- Modelo solo texto: la torre de vision y la cabeza de prediccion multi-token fueron eliminadas, de modo que no puede procesar imagenes ni aprovechar esas capacidades del base.
- Artefacto de benchmark: no esta pensado para produccion; su valor es experimental y comparativo.
- Sesgos: el autor evalua hiring-bias, lo que sugiere que el modelo puede presentar sesgos medibles en escenarios de contratacion, aunque no se publican los resultados en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos y potencialmente amplificado por la poda sin reentrenamiento; no se documenta una evaluacion especifica de factualidad.
- Idiomas: no se especifican los idiomas soportados tras la poda; no se garantiza el multilingüismo del modelo base.
- Contexto: no se documenta la longitud de contexto efectiva del checkpoint podado.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la model card del modelo base para condiciones adicionales.
- Madurez: creado en noviembre de 2026 con 0 descargas y 0 likes; sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-9b-prune_depth_10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA ModelOpt (herramienta de poda): no disponible enlace directo en la informacion proporcionada
- vLLM (motor de inferencia del benchmark): no disponible enlace directo en la informacion proporcionada
- Benchmark BFCL: no disponible enlace directo en la informacion proporcionada
- Paper o blog del benchmark: no disponible
