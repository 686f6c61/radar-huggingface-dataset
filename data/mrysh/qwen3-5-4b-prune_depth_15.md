# mrysh/qwen3.5-4b-prune_depth_15

## Resumen

qwen3.5-4b-prune_depth_15 es una variante podada en profundidad del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de un checkpoint derivado al que se le han eliminado capas del transformer mediante la herramienta Minitron de NVIDIA ModelOpt (version 0.46.0rc1). Concretamente, se ha pasado de 32 a 27 capas, lo que supone una reduccion del 15,0% de las capas solicitadas y del 13,4% de los parametros del modelo de lenguaje (14,7% del checkpoint completo). El checkpoint resultante conserva 3.974.646.336 parametros y ocupa 7,969 GB en disco.

La relevancia de esta publicacion es fundamentalmente metodologica: forma parte de un benchmark de poda que compara 4 modelos base con 8 variantes de poda cada uno, evaluandolas contra sus equivalentes cuantizados en las tareas BFCL (function calling), hiring-bias y MedQA, ejecutadas con vLLM. El modelo no ha pasado por destilacion ni fine-tuning posterior a la poda, por lo que el autor advierte explicitamente de una perdida de calidad respecto al modelo base; precisamente el objetivo del benchmark es medir esa caida.

Se trata, por tanto, de un artefacto de investigacion util para quienes estudian tecnicas de compresion de modelos, no de un modelo recomendado para produccion. La licencia es Apache 2.0, heredada del modelo base, y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; poda en profundidad de 32 a 27 capas) |
| Parametros totales | 3.974.646.336 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el benchmark compara contra variantes cuantizadas, pero no se detallan los tipos en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.000 millones de parametros. La intervencion aplicada es una poda estructurada en profundidad (depth pruning) mediante NVIDIA ModelOpt Minitron: se eliminan 5 de las 32 capas del bloque de lenguaje (nivel 0,15), manteniendo intacta la anchura (dimension del modelo y de las capas ocultas). La importancia de cada capa se estimo sobre un conjunto de calibracion de 512 muestras mixtas. Los bloques de vision y audio del modelo base, si los tuviera, se conservan sin modificar y solo se poda la parte de lenguaje. La cabeza de prediccion multi-token (multi-token prediction) de Qwen3.5 se descarta durante el proceso de poda.

No se realizo destilacion ni fine-tuning posterior a la poda. Esta decision es deliberada: el checkpoint sirve como punto de medida del impacto bruto de la eliminacion de capas, sin maquillar la perdida de calidad con recuperacion adicional. En la evaluacion se trata como modelo de texto, con el modo thinking desactivado y ejecutado sobre vLLM.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-4B, aunque degradadas por la eliminacion de capas y la ausencia de recuperacion posterior.
- Function calling / tool calling: es una de las dimensiones evaluadas en el benchmark (BFCL), lo que indica que el modelo base y sus variantes soportan este caso de uso.
- Razonamiento multi-paso y agentes: el modelo base esta disenado para ello, pero no se han publicado resultados especificos de las variantes podadas en la informacion disponible.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales del modelo base (vision, audio, thinking mode): los bloques multimodales se conservan si existen, pero la evaluacion del benchmark se realiza como modelo de texto con thinking desactivado.
- La cabeza de multi-token prediction se ha eliminado, por lo que cualquier capacidad asociada a esa cabeza no esta presente.

## Casos de uso

- Benchmark de tecnicas de poda: el uso principal es servir como una de las 32 variantes (4 modelos x 8 variantes) del estudio comparativo del autor, midiendo la caida de calidad frente al modelo base y frente a la cuantizacion en BFCL, hiring-bias y MedQA.
- Investigacion sobre compresion de modelos: permite estudiar el efecto aislado de eliminar 5 capas de un transformer de 4B sin destilacion, con un conjunto de calibracion de 512 muestras y una metodologia reproducible con NVIDIA ModelOpt.
- Comparacion poda vs cuantizacion: al ejecutarse ambos tipos de variante sobre vLLM, sirve para decidir, en terminos de calidad por byte, si conviene reducir profundidad o reducir precision en un despliegue con restricciones de memoria.
- Validacion de pipelines de poda: util para equipos que quieran verificar su propia implementacion de Minitron contra un checkpoint de referencia con nivel 0,15 y resultados documentados.
- Experimentos de sensibilidad por capas: al conocerse el criterio de importancia (calibracion de 512 muestras mixtas), el modelo permite analizar que capas fueron eliminadas y como afecta a tareas concretas como function calling o preguntas medicas.
- Docencia y formacion: ejemplo practico de poda estructurada en profundidad con impacto medible, adecuado para explicar el equilibrio entre tamano, latencia y calidad en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo se evalua en BFCL, hiring-bias y MedQA con vLLM dentro de un benchmark comparativo de poda y cuantizacion, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (8,0 GB de checkpoint), se necesitan aproximadamente 8 GB solo para pesos, mas memoria para cache KV y overhead del runtime; en la practica, entre 10 y 12 GB para contextos cortos. En cuantizacion de 8 bits, alrededor de 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB.
- GPU recomendadas: A100, H100 o L40S para evaluacion a escala con vLLM; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 sin problemas de memoria.
- GPU de consumo: cabe en GPUs consumer con 12 GB o mas en BF16 y en GPUs de 8 GB si se cuantiza a 8 o 4 bits, aunque no se han publicado mediciones concretas.
- Opciones de despliegue: el autor evalua con vLLM. Al ser un checkpoint safetensors compatible con la arquitectura Qwen3.5, deberia poder convertirse a GGUF para llama.cpp u Ollama, pero no se documenta en la informacion disponible.
- Latencia y throughput: no disponible. Como referencia cualitativa, al tener 27 capas en lugar de 32, la latencia por token deberia ser inferior a la del modelo base en la misma precision, pero no se aportan numeros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_depth_15 | 3.974.646.336 | no disponible | Apache 2.0 | safetensors | Poda en profundidad 32 a 27 capas, sin destilacion |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | Apache 2.0 | safetensors | Modelo original sin podar; referencia de calidad |
| Variantes cuantizadas del benchmark | no disponible | no disponible | Apache 2.0 | no disponible | Alternativa de compresion comparada en BFCL, hiring-bias y MedQA |
| Otras variantes de poda del benchmark (8 por modelo) | no disponible | no disponible | Apache 2.0 | safetensors | Mismo pipeline Minitron con otros niveles o metodos |

## Limitaciones y advertencias

- Perdida de calidad esperada: el autor advierte explicitamente de que no hubo destilacion ni fine-tuning tras la poda, por lo que el rendimiento cae frente al modelo base. No se recomienda su uso en produccion sin una evaluacion propia.
- Sin datos de benchmarks publicados: no hay cifras de BFCL, hiring-bias ni MedQA en la informacion disponible, solo la descripcion del benchmark en el que se integra.
- Contexto e idiomas no documentados: se desconoce la longitud de contexto efectiva tras la poda y los idiomas soportados.
- Cabeza de multi-token prediction eliminada: cualquier funcionalidad del modelo base que dependa de ella no esta disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en un modelo podado sin recuperacion, la degradacion de coherencia en razonamiento largo es un riesgo plausible que debe validarse.
- Sesgos: no documentados. El benchmark incluye una tarea de hiring-bias, lo que sugiere interes en medir sesgos, pero no se publican resultados.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar la model card de Qwen/Qwen3.5-4B.
- Madurez: publicacion con 0 descargas y 0 likes en el momento de la consulta, creada en noviembre de 2026; es un artefacto de investigacion sin comunidad ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_15
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
