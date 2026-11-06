# mrysh/qwen3.5-9b-prune_width_ffn50

## Resumen

qwen3.5-9b-prune_width_ffn50 es una version podada del modelo Qwen/Qwen3.5-9B, publicada por el usuario mrysh en Hugging Face. El autor la ha generado como parte de un benchmark de poda que compara cuatro modelos base con ocho variantes de poda distintas, evaluandolas frente a la cuantizacion en las tareas BFCL, hiring-bias y MedQA con vLLM. No es un modelo pensado para produccion, sino un artefacto experimental para medir el impacto de la reduccion de parametros en la calidad.

La poda aplicada es de tipo width (reduccion de anchura) a nivel 0.5, realizada con la libreria nvidia-modelopt 0.46.0rc1 y la tecnica Minitron de NVIDIA. Concretamente, se reduce el tamano de la FFN de cada capa de 12288 a 6144 neuronas, manteniendo intacto el numero de capas. La importancia de las neuronas se midio sobre un conjunto de calibracion de 512 muestras mixtas. El checkpoint final contiene 6.537.884.160 parametros, lo que supone una reduccion del 27,0 % respecto al modelo base.

Un detalle relevante es que solo se poda la parte del lenguaje: la torre de vision y la cabeza de prediccion multi-token de Qwen3.5 se eliminan por completo, de modo que el resultado es un modelo exclusivamente de texto. No se realizo destilacion ni fine-tuning posterior a la poda, por lo que cabe esperar una caida de calidad frente al modelo original; el benchmark existe precisamente para cuantificarla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, solo parte de lenguaje) |
| Parametros totales | 6.537.884.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en BF16/FP16; el autor evalua frente a cuantizaciones del benchmark) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano en disco | 13,096 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Metodo de poda | width, nivel 0.5 (FFN 12288 -> 6144) |
| Libreria de poda | nvidia-modelopt 0.46.0rc1 (Minitron) |
| Reduccion de parametros | 27,0 % |
| Calibracion | 512 muestras mixtas |
| Destilacion / fine-tuning posterior | no |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de la familia Qwen3.5. La intervencion consiste en una poda estructurada de anchura sobre las capas del transformer: la dimension intermedia de la FFN de cada capa se reduce a la mitad (de 12288 a 6144), mientras que el numero de capas y el resto de la topologia permanecen sin cambios. La seleccion de neuronas a eliminar se basa en una medida de importancia calculada sobre 512 muestras mixtas de calibracion, siguiendo el procedimiento Minitron implementado en nvidia-modelopt 0.46.0rc1.

No se ha realizado ningun proceso de recuperacion de capacidad tras la poda: ni destilacion desde el modelo base, ni fine-tuning supervisado, ni RLHF/DPO. Tampoco se ha reentrenado el modelo podado. Ademas, se han eliminado la torre de vision y la cabeza de prediccion multi-token del checkpoint original, de modo que el resultado es un modelo puramente textual. El checkpoint se distribuye en safetensors con un peso total de 13,096 GB, coherente con los 6.537.884.160 parametros en precision de 16 bits.

## Capacidades

- Generacion de texto: conserva la capacidad generativa de la parte de lenguaje del modelo base, aunque degradada por la poda sin recuperacion.
- Razonamiento y conocimiento: se evalua en MedQA, lo que indica que mantiene cierta capacidad de respuesta a preguntas de dominio medico, si bien el autor advierte de una caida de calidad esperada.
- Tool calling / function calling: el benchmark incluye BFCL (Berkeley Function Calling Leaderboard), por lo que el modelo esta destinado a evaluarse en llamadas a funciones, aunque no se publican resultados en la informacion disponible.
- Evaluacion de sesgos: se incluye la tarea hiring-bias en el benchmark, orientada a medir sesgos en decisiones de contratacion.
- Modo thinking: el autor indica que en el benchmark se evalua con el modo thinking desactivado (vLLM, thinking off); no se documenta el comportamiento con thinking activado.
- Capacidades multimodales: eliminadas. La torre de vision y la cabeza de prediccion multi-token han sido retiradas, por lo que no procesa imagenes.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Benchmark de poda de modelos: el uso principal y documentado es servir como una de las variantes del estudio comparativo del autor (4 modelos x 8 variantes de poda) frente a cuantizacion, midiendo la degradacion en BFCL, hiring-bias y MedQA con vLLM.
- Investigacion sobre compresion de modelos: util para estudiar como afecta una reduccion del 50 % en la anchura de la FFN a tareas de function calling y QA medico, sin recuperacion posterior.
- Comparacion poda vs cuantizacion: permite contrastar, con el mismo modelo base, si conviene reducir parametros estructuralmente o aplicar cuantizacion para un presupuesto de memoria dado.
- Analisis de sesgos en modelos comprimidos: la tarea hiring-bias del benchmark permite examinar si la poda amplifica sesgos presentes en el modelo original.
- Prototipado con restricciones de memoria: con 6,54 mil millones de parametros y 13,1 GB en 16 bits, puede desplegarse en entornos donde el modelo base de 9B no cabe, a costa de calidad.
- Reproducibilidad de pipelines de poda: sirve como referencia para validar flujos de trabajo con nvidia-modelopt y la tecnica Minitron sobre arquitecturas Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo forma parte de un benchmark en curso (BFCL, hiring-bias y MedQA con vLLM) y que su objetivo es medir la caida de calidad frente al modelo base, pero no se incluyen cifras en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 13,1 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, en torno a 16-18 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: unos 6,5-7 GB para pesos; en 4 bits, unos 3,3-4 GB, aunque el autor no publica checkpoints cuantizados de esta variante.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue con vLLM; en consumer, RTX 4090 (24 GB) permite BF16 con margen y RTX 3090 (24 GB) de forma similar.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas en BF16 (por ejemplo RTX 4080/4090, RTX 3090); en 8 bits cabria en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM es el motor usado por el autor en el benchmark; al ser safetensors de arquitectura Qwen3.5 text, deberia poder convertirse a GGUF para llama.cpp u Ollama, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles. Al tener un 27 % menos de parametros que el base, cabe esperar una mejora proporcional en throughput, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3.5-9b-prune_width_ffn50 | 6,54 B | no disponible | Apache 2.0 | Variante podada, sin recuperacion; solo texto |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | Apache 2.0 | Modelo original, con vision y multi-token prediction |
| Otras variantes del benchmark del autor | no disponible | no disponible | no disponible | 8 variantes de poda sobre 4 modelos; sin datos publicados |

No se dispone de resultados de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparacion mas directa es con su modelo base, del que se diferencia por la reduccion del 27 % de parametros, la eliminacion de vision y la ausencia de recuperacion tras la poda.

## Limitaciones y advertencias

- Caida de calidad esperada: no hubo destilacion ni fine-tuning tras la poda, por lo que el rendimiento es inferior al de Qwen3.5-9B; el propio autor lo advierte.
- Sin datos de evaluacion publicados: no se ofrecen cifras de BFCL, hiring-bias ni MedQA en la informacion disponible, lo que impide conocer la magnitud real de la degradacion.
- Solo texto: la torre de vision y la cabeza de prediccion multi-token han sido eliminadas; no admite entradas de imagen.
- Sesgos: el modelo hereda los sesgos del base y la poda puede amplificarlos; el benchmark incluye una prueba de sesgo en contratacion, pero no se publican resultados.
- Riesgo de alucinacion: presumiblemente igual o superior al del modelo base al haber perdido capacidad, sin que existan mediciones disponibles.
- Contexto e idiomas no documentados: se desconoce si la longitud de contexto del base se mantiene intacta tras la poda y que idiomas conserva con calidad aceptable.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de Qwen3.5 conviene revisar la model card del modelo base para condiciones adicionales.
- Uso en produccion desaconsejado: es un artefacto de benchmark, con 0 descargas y 0 likes, sin pipeline declarado ni garantias de mantenimiento.
- Fecha de publicacion futura en los metadatos (2026-11-04), lo que sugiere que los datos pueden ser preliminares o inconsistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-9b-prune_width_ffn50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Libreria de poda NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Tecnica Minitron (NVIDIA): no disponible enlace directo en la informacion proporcionada
- BFCL (Berkeley Function Calling Leaderboard): no disponible enlace directo en la informacion proporcionada
- Paper o blog del benchmark del autor: no disponible
