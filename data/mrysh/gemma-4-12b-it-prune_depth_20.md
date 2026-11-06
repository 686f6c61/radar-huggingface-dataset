# mrysh/gemma-4-12b-it-prune_depth_20

## Resumen

`mrysh/gemma-4-12b-it-prune_depth_20` es una version podada en profundidad del modelo multimodal `google/gemma-4-12B-it`. El autor, `mrysh`, la publica como pieza de un benchmark de pruning que compara cuatro modelos base con ocho variantes de poda cada uno, evaluadas frente a sus equivalentes cuantizados en BFCL, hiring-bias y MedQA mediante vLLM. No es un modelo pensado para produccion, sino un artefacto experimental para medir el impacto de la poda en calidad.

La poda se aplico con NVIDIA ModelOpt Minitron (version 0.46.0rc1) en modo depth al nivel 0.2: se eliminaron 10 de las 48 capas del transformer (48 -> 38), manteniendo la anchura intacta. La importancia de cada capa se estimo sobre un set de calibracion de 512 muestras mixtas. El checkpoint resultante conserva 9.630.469.926 parametros de los 12B del original (una reduccion del 19,1%), y se distribuye como modelo solo texto (`Gemma4ForCausalLM`), sin los bloques de vision ni audio del base.

Es relevante ahora porque permite a desarrolladores e investigadores evaluar de forma empirica el coste en calidad de la poda estructural frente a la cuantizacion, sin necesidad de repetir el proceso de pruning. Al no incluir destilacion ni fine-tuning posterior, la caida de rendimiento respecto al modelo original es esperada y constituye precisamente el objeto de medicion del benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, `Gemma4ForCausalLM`), podado en profundidad |
| Parametros totales | 9.630.469.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 19,3 GB) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it` es un transformer multimodal con 48 capas y 12B parametros. La variante aqui descrita aplica poda estructural en profundidad con NVIDIA ModelOpt Minitron: se eliminan 10 capas (48 -> 38), dejando inalterada la anchura de los bloques restantes. La seleccion de capas se basa en una medida de importancia calculada sobre 512 muestras mixtas de calibracion, no en un criterio heuristico uniforme.

Tras la poda no se realizo destilacion ni fine-tuning, de modo que los pesos supervivientes conservan el estado previo al pruning. El checkpoint se limita al submodelo de texto: los bloques de vision y audio del modelo original no se incluyen, por lo que la inferencia multimodal no esta disponible. La evaluacion del autor se hizo con vLLM y el modo thinking desactivado.

## Capacidades

- Generacion de texto y razonamiento en el submodelo de lenguaje heredado de Gemma 4 12B-it.
- Respuesta a instrucciones (variante `-it`, ajustada para seguir instrucciones en el base).
- Capacidades multilingues: presumiblemente las del base, pero no documentadas en esta ficha (no disponible).
- Tool calling / function calling: no confirmado en esta variante; el base lo soporta, pero la poda sin fine-tuning puede degradarlo y no hay datos especificos.
- Modo thinking: el autor lo desactiva explicitamente en la evaluacion con vLLM; no se documenta su comportamiento tras la poda.
- Vision y audio: no disponibles, los bloques correspondientes no estan incluidos en el checkpoint.
- Agentes y razonamiento multi-paso: no verificado en esta variante.

## Casos de uso

- Benchmarking de tecnicas de poda: usar este checkpoint como referencia dentro del benchmark del autor (4 modelos x 8 variantes) para comparar la caida de calidad de la poda en profundidad frente a otras variantes y frente a cuantizacion.
- Estudio de robustez estructural: analizar como la eliminacion de 10 capas afecta a tareas de function calling (BFCL), sesgo de contratacion (hiring-bias) y conocimiento medico (MedQA), que son las tres evaluaciones del benchmark.
- Investigacion sobre destilacion post-poda: partir de este checkpoint sin fine-tuning para medir cuanto se recupera tras un proceso de distillation o fine-tuning posterior.
- Analisis de eficiencia en vLLM: desplegar la variante podada en vLLM y comparar throughput y latencia con el base de 12B, dado que la reduccion de 10 capas disminuye el coste computacional por token.
- Experimentos academicos de interpretabilidad: comparar activaciones y representaciones entre el modelo original y esta version de 38 capas para estudiar redundancia de profundidad.
- Evaluacion de sesgos: usar las pruebas de hiring-bias del benchmark para comprobar si la poda altera o amplifica sesgos presentes en el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el benchmark (BFCL, hiring-bias y MedQA con vLLM) esta en preparacion y que su proposito es medir la caida de calidad frente al base, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19,3 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion 8-bit: alrededor de 10 GB de pesos; en 4-bit, alrededor de 5-6 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) para BF16 en un solo usuario o 8-bit con mayor margen.
- Consumer GPU: cabe en RTX 4090 en BF16 con margen ajustado y en RTX 3090/4080 en cuantizacion 8-bit o 4-bit (estimacion).
- Opciones de despliegue: vLLM (usado por el autor en la evaluacion), llama.cpp/Ollama y TGI previa conversion a los formatos correspondientes; el repo solo contiene safetensors.
- Latencia y throughput: no disponibles; la reduccion de 48 a 38 capas reduce el coste por token respecto al base, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/gemma-4-12b-it-prune_depth_20 | 9,63B | no disponible | Apache 2.0 | Poda depth 20%, solo texto, sin fine-tuning posterior |
| google/gemma-4-12B-it | ~12B | no disponible | Apache 2.0 (segun model card del base) | Modelo original multimodal (texto, vision, audio) |
| Otras variantes del benchmark del autor | no disponible | no disponible | Apache 2.0 | 8 variantes de poda por modelo, no detalladas en la informacion disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada.

## Limitaciones y advertencias

- Caida de calidad esperada: no hubo destilacion ni fine-tuning tras la poda, por lo que el rendimiento cae respecto al base; el benchmark del autor esta disenado precisamente para cuantificar esa perdida.
- Solo texto: los bloques de vision y audio del base no estan incluidos; no es un modelo multimodal.
- Contexto e idiomas no documentados: no hay informacion sobre la ventana de contexto efectiva ni sobre cobertura linguistica tras la poda.
- Tool calling y modo thinking no verificados: el autor evalua con thinking desactivado y no documenta el comportamiento de function calling en esta variante.
- Licencia Apache 2.0 heredada del base: permite uso comercial, pero conviene revisar los terminos del modelo original de Google por posibles condiciones adicionales de uso responsable.
- Artefacto experimental: 0 descargas y 0 likes en el momento de la consulta; no hay garantia de mantenimiento ni de soporte.
- Sesgos: el base puede arrastrar sesgos conocidos; la prueba de hiring-bias del benchmark sugiere que la poda puede afectar a comportamientos sesgados, pero no hay resultados publicados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la poda sin recalibracion puede agravarlo, aunque no hay datos especificos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/gemma-4-12b-it-prune_depth_20
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- NVIDIA ModelOpt (herramienta de poda): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- vLLM (motor de inferencia usado en la evaluacion): https://github.com/vllm-project/vllm
- BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- MedQA: https://github.com/jind11/MedQA
