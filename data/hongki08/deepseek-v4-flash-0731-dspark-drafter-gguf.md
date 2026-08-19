# HongKi08/DeepSeek-V4-Flash-0731-DSpark-Drafter-GGUF

## Resumen

Este repositorio contiene un drafter de decodificación especulativa (speculative decoding) DSpark para el modelo DeepSeek V4 Flash 0731, requantizado localmente a formato GGUF por HongKi08. No es un modelo de chat independiente: se trata de un módulo auxiliar que debe cargarse junto con el modelo principal DeepSeek-V4-Flash-0731 para acelerar la generación mediante decodificación especulativa, una técnica que permite reducir la latencia de inferencia sin degradar la calidad de las respuestas.

El drafter original procede de `unsloth/DeepSeek-V4-Flash-0731-GGUF` (versión Q8_0) y ha sido sometido a una cuantización mixta con `llama-quantize`: los expertos de las capas FFN de los tres primeros bloques se reducen a Q2_K, los tensores de Markov se mantienen en F16 y el resto queda en Q8_0. El resultado es un archivo de 6,963 GB (6,485 GiB) pensado para su uso con llama.cpp y servidores compatibles con el tipo de drafter `draft-dspark`.

La relevancia de este modelo radica en que permite desplegar DeepSeek V4 Flash 0731 en hardware más modesto, reduciendo el coste de memoria del drafter sin renunciar a la ganancia de velocidad que aporta la decodificación especulativa. El modelo base es un MoE con capacidades agénticas mejoradas, y esta cuantización facilita su ejecución local con herramientas como llama-server.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter DSpark para decodificacion especulativa, basado en DeepSeek V4 Flash 0731 (MoE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el drafter no es un modelo MoE independiente) |
| Longitud de contexto | no disponible (depende del modelo principal; el ejemplo de uso emplea 524288 tokens) |
| Tipos de cuantizacion | Mixta: Q2_K (expertos FFN de bloques 0-2), F16 (markov_w1, markov_w2), Q8_0 (baseline) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El drafter DSpark es un módulo de decodificación especulativa diseñado para el modelo DeepSeek V4 Flash 0731, que a su vez es un transformer basado en Mixture of Experts (MoE) con un módulo de decodificación especulativa integrado. El drafter genera propuestas de tokens que el modelo principal verifica en paralelo, reduciendo el número de pasos de decodificación secuenciales y, por tanto, la latencia.

Este repositorio no contiene un entrenamiento nuevo: se trata de una requantización del drafter original publicado por unsloth en formato Q8_0. La cuantización mixta aplicada con `llama-quantize` conserva en F16 los tensores de Markov (`markov_w1`, `markov_w2`), que son críticos para la calidad de las propuestas, mientras reduce a Q2_K los expertos de las capas FFN de los tres primeros bloques, donde la pérdida de precisión tiene menor impacto. El comando usado incluye `--allow-requantize --pure` para garantizar una conversión limpia.

## Capacidades

- Decodificacion especulativa: genera propuestas de tokens para acelerar la inferencia del modelo principal DeepSeek V4 Flash 0731.
- Compatibilidad con llama.cpp: se carga mediante `--spec-draft-model` con el tipo `--spec-type draft-dspark`.
- Cuantizacion mixta optimizada para memoria: reduce el peso del drafter de 8 bits a una mezcla Q2_K/F16/Q8_0, manteniendo los tensores de Markov en alta precision.
- No es un modelo de chat: no genera texto por si mismo; requiere el modelo principal para funcionar.
- Idiomas: ingles y chino (segun la declaracion del modelo base).

## Casos de uso

- Despliegue local de DeepSeek V4 Flash 0731 en hardware consumer: el drafter cuantizado a Q2_K reduce la memoria adicional necesaria para la decodificacion especulativa, permitiendo ejecutar el modelo principal en GPUs con menos VRAM.
- Inferencia de baja latencia en servidores llama.cpp: al cargar el drafter con `--spec-draft-model`, se acelera la generacion de tokens en aplicaciones de chat o agentes sin necesidad de GPUs de alta gama.
- Evaluacion de configuraciones de decodificacion especulativa: investigadores pueden probar distintas combinaciones de drafter y modelo principal (por ejemplo, `DeepSeek-V4-Flash-0731-UD-Q2_K_XL`) para medir el trade-off entre velocidad y calidad.
- Entornos de desarrollo con recursos limitados: permite probar las capacidades agénticas del modelo base en portatiles o estaciones de trabajo con una unica GPU, gracias al ahorro de VRAM del drafter.
- Integracion en pipelines de agentes locales: el modelo base soporta tool calling y razonamiento multi-paso; el drafter acelera estas interacciones cuando se ejecuta con llama-server y frameworks compatibles.
- Validacion de cuantizaciones mixtas: este repositorio sirve como referencia para quienes quieran replicar o adaptar la estrategia de cuantizacion a otros modelos de la familia DeepSeek V4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El rendimiento de la decodificacion especulativa depende del modelo principal, del hardware y de la configuracion de llama.cpp (por ejemplo, `--spec-draft-n-max` y `--spec-draft-p-min`), por lo que no es posible dar cifras concretas sin mediciones propias.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 6,963 GB (6,485 GiB), por lo que el drafter requiere al menos 7-8 GB de VRAM si se carga completo en GPU (`--spec-draft-ngl all`). La VRAM total dependera del modelo principal, que es significativamente mayor.
- GPU recomendadas: el drafter cabe en GPUs consumer como RTX 3090, RTX 4090 o equivalentes con 8 GB o mas. Para el modelo principal se necesitara una GPU con mayor capacidad (por ejemplo, 24 GB o mas segun la cuantizacion).
- Opciones de despliegue: llama.cpp (llama-server) con soporte para DeepSeek V4 Flash y DSpark; tambien puede usarse con herramientas compatibles con GGUF y decodificacion especulativa.
- Latencia y throughput: no disponibles. Dependen del hardware, del modelo principal y de los parametros de decodificacion especulativa.

## Comparativa con modelos similares

No disponible. No se dispone de datos suficientes sobre otros drafters DSpark cuantizados para DeepSeek V4 Flash 0731 con los que comparar parametros, rendimiento o licencia de forma rigurosa.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo principal DeepSeek V4 Flash 0731, este drafter no produce texto util.
- Compatibilidad restringida: requiere una build de llama.cpp con soporte explicito para DeepSeek V4 Flash y DSpark (`--spec-type draft-dspark`); no funcionara con versiones genericas de llama.cpp.
- Cuantizacion agresiva: los expertos FFN de los bloques 0-2 estan en Q2_K, lo que puede degradar la calidad de las propuestas del drafter en comparacion con la version Q8_0 original, aunque el impacto en la salida final del modelo principal deberia ser minimo.
- Sesgos y alucinaciones: al ser un componente auxiliar, no aplican directamente, pero el modelo base puede presentar sesgos en ingles y chino, y riesgo de alucinacion en tareas factuales.
- Licencia MIT: permite uso comercial y modificacion, pero es responsabilidad del usuario verificar la licencia del modelo principal y del repositorio upstream de unsloth.
- Sin garantias de rendimiento: no se han publicado benchmarks propios; el rendimiento real debe validarse en el hardware objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HongKi08/DeepSeek-V4-Flash-0731-DSpark-Drafter-GGUF
- Modelo base (deepseek-ai): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio GGUF de unsloth (fuente del drafter): https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
- Documentacion DeepWiki del proyecto: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Configuracion de despliegue en Strix Halo: https://deepwiki.com/darnoq99/deepseek-v4-flash-0731-strix-halo
- API y playground en Fireworks AI: https://fireworks.ai/models/deepseek-ai/deepseek-v4-flash-0731
