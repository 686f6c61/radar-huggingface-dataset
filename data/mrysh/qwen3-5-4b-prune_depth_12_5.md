# mrysh/qwen3.5-4b-prune_depth_12_5

## Resumen

qwen3.5-4b-prune_depth_12_5 es una variante podada por profundidad del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh en HuggingFace. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de un checkpoint derivado al que se le han eliminado capas del transformer para reducir su coste computacional. Concretamente, se pasa de 32 a 28 capas, lo que supone una reduccion del 12,5 % de la profundidad y del 10,7 % de los parametros del modelo de lenguaje (12,3 % del checkpoint completo). El resultado es un modelo de aproximadamente 4.087 millones de parametros totales segun los pesos en safetensors, con el mismo ancho de capa que el original.

La relevancia de esta publicacion es fundamentalmente metodologica: forma parte de un benchmark de poda que compara cuatro modelos con ocho variantes de pruning cada uno, evaluadas en BFCL, un conjunto de sesgo en contratacion y MedQA, ejecutadas con vLLM. El objetivo declarado es medir la degradacion de calidad que introduce la poda frente al modelo base. Es, por tanto, un artefacto de investigacion, no un modelo pensado para produccion.

Es importante subrayar que no se aplico destilacion ni fine-tuning posterior a la poda, de modo que cabe esperar una caida de calidad respecto al modelo base. La licencia es Apache 2.0, heredada del modelo original, y los pesos se distribuyen en formato safetensors con un tamano de repositorio de 8,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5, podado por profundidad de 32 a 28 capas) |
| Parametros totales | 4.087.570.176 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el benchmark compara con cuantizacion, pero no se listan formatos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.000 millones de parametros. La intervencion aplicada es una poda estructurada por profundidad mediante NVIDIA ModelOpt Minitron (version 0.46.0rc1): se eliminan 4 de las 32 capas del bloque de lenguaje, seleccionadas segun su importancia medida sobre un conjunto de calibracion de 512 muestras mixtas. El ancho de las capas se mantiene intacto, y los bloques de vision y audio del modelo base, si los tuviera, se conservan sin cambios; solo se poda la parte del lenguaje. La herramienta de poda descarta ademas la cabeza de prediccion multi-token de Qwen3.5.

No se realizo destilacion ni fine-tuning posterior a la poda, lo que significa que el modelo conserva los pesos originales de las capas supervivientes sin reajuste. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO, mas alla de lo que figure en la model card de Qwen/Qwen3.5-4B. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en esta variante.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-4B, aunque con la degradacion esperable tras la poda sin reentrenamiento.
- Codigo y matematicas: no se documentan evaluaciones especificas en esta variante; se asume comportamiento similar al base con posible merma.
- Tool calling / function calling: el benchmark incluye BFCL (Berkeley Function Calling Leaderboard), lo que indica que el modelo se evalua en llamadas a funciones, aunque no se publican los resultados en la informacion disponible.
- Razonamiento multi-paso y agentes: no disponible informacion especifica para esta variante.
- Capacidades multilingues: no disponible; no se listan idiomas en la model card.
- Capacidades especiales (vision, audio, thinking mode): el modelo base podria incluir bloques de vision y audio que se conservan intactos, pero la evaluacion de esta variante se realiza como modelo de texto con el modo thinking desactivado en vLLM.

## Casos de uso

- Benchmarking de tecnicas de poda: el uso principal declarado es servir como una de las ocho variantes de poda en un estudio comparativo. Se emplearia junto al modelo base y a las demas variantes para medir la caida de calidad en BFCL, sesgo en contratacion y MedQA.
- Investigacion sobre degradacion por pruning: util para estudiar como afecta la eliminacion de capas concretas (seleccionadas por importancia sobre 512 muestras) al rendimiento en tareas de function calling y dominio medico.
- Comparacion poda vs. cuantizacion: el benchmark confronta explicitamente las variantes podadas con alternativas cuantizadas, por lo que este checkpoint sirve para analizar el equilibrio entre reduccion de parametros y perdida de precision.
- Evaluacion de pipelines con vLLM: al estar pensado para ejecutarse en vLLM con thinking desactivado, puede integrarse en pruebas de infraestructura de serving para medir throughput y latencia de un modelo podado frente al original.
- Estudio de sesgos en seleccion de personal: el benchmark incluye una evaluacion de sesgo en contratacion (hiring-bias), lo que permite analizar si la poda altera el comportamiento del modelo en tareas sensibles.
- Experimentos academicos reproducibles: al documentarse el metodo (depth, nivel 0.125, ModelOpt 0.46.0rc1, 32 a 28 capas), sirve como referencia reproducible para otros grupos que quieran replicar la poda sobre Qwen3.5-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo se evalua en BFCL, hiring-bias y MedQA dentro de un benchmark comparativo, pero no se incluyen las cifras obtenidas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.087 millones de parametros, en BF16 se requieren aproximadamente 8,2 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 4-5 GB y en 4 bits unos 2,5-3 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: para BF16, GPU con 16 GB o mas (RTX 4090, A100 40 GB, H100); para cuantizacion 4/8 bits, GPU consumer de 8-12 GB podrian ser suficientes.
- Cabe en GPU consumer: previsiblemente si en RTX 4090 (24 GB) en BF16, y en GPUs de 8-12 GB con cuantizacion, aunque no se aportan datos confirmados.
- Opciones de despliegue: el autor indica evaluacion con vLLM; no se documentan otros motores (llama.cpp, Ollama, TGI) para esta variante.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3.5-4b-prune_depth_12_5 | 4.087 M | no disponible | Apache 2.0 | Variante podada 32 a 28 capas, sin reentrenamiento |
| Qwen/Qwen3.5-4B | no disponible en la informacion | no disponible | Apache 2.0 | Modelo base sin podar; referencia de calidad |
| Otras variantes del benchmark (8 en total) | no disponible | no disponible | Apache 2.0 (presumible) | Mismo benchmark de poda sobre 4 modelos |

No se dispone de datos de rendimiento comparado ni de especificaciones completas de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Caida de calidad esperada: al no aplicarse destilacion ni fine-tuning tras la poda, el rendimiento es inferior al del modelo base; el propio autor lo advierte.
- Artefacto de investigacion: el modelo se publica para un benchmark de poda, no como modelo listo para produccion.
- Sesgos: el benchmark incluye una evaluacion de sesgo en contratacion, lo que sugiere que el modelo puede presentar sesgos relevantes en tareas de seleccion de personal; no se publican resultados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; previsiblemente igual o superior al del modelo base tras la poda.
- Contexto e idiomas: no se documenta la longitud de contexto soportada ni los idiomas cubiertos en esta variante.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se remite a la model card del modelo base para condiciones adicionales.
- Evaluacion limitada: las pruebas se realizan como modelo de texto con thinking desactivado; el comportamiento con vision, audio o modo thinking no esta documentado para esta variante.
- Cabeza multi-token eliminada: la herramienta de poda descarta la cabeza de prediccion multi-token de Qwen3.5, lo que puede afectar a funcionalidades que dependian de ella.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_12_5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA ModelOpt (herramienta de poda): no disponible en la informacion proporcionada
- Paper de Minitron: no disponible en la informacion proporcionada
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
