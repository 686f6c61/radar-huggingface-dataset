# BrandiesPatrick/Ouro-2.6B-GGUF

## Resumen

Ouro-2.6B es un modelo de lenguaje de ByteDance Seed dentro de la familia Ouro de modelos "looped" o recurrentes en profundidad. En lugar de apilar capas adicionales, el modelo aplica el mismo bloque decoder 48 veces en cuatro pasadas recurrentes por token, lo que produce una profundidad efectiva de 192 capas manteniendo un coste paramétrico de aproximadamente 2.670 millones. Esta arquitectura permite escalar la capacidad de razonamiento latente sin aumentar linealmente el número de parámetros, y es el foco del artículo "Scaling Latent Reasoning via Looped Language Models" (arXiv:2510.25741).

El repositorio `BrandiesPatrick/Ouro-2.6B-GGUF` proporciona las primeras conversiones GGUF de este modelo, con cuantizaciones F16, Q8_0 y Q4_K_M. Es un modelo de generación de texto con licencia Apache 2.0, pensado para investigación y despliegue local mediante llama.cpp. Sin embargo, la arquitectura `ouro` aún no está integrada en llama.cpp de forma oficial, por lo que estos archivos requieren un parche específico para poder ejecutarse hoy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped language model (transformer decoder con pesos compartidos, 48 capas físicas aplicadas 4 veces por token, profundidad efectiva 192 capas) |
| Parametros totales | 2.667.972.608 (≈2.67 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Ouro-2.6B usa un diseño de "recurrent depth" en el que el mismo stack de 48 capas decoder se ejecuta cuatro veces por token con pesos compartidos. Esto equivale a una profundidad de red de 192 capas, pero el almacenamiento de parámetros es el de un modelo de 2.7B. El número de bucles es configurable en tiempo de ejecución mediante el parámetro `ouro.num_loops` en llama.cpp, lo que permite cambiar el balance entre coste computacional y precisión desde un único archivo.

El modelo está entrenado con 4 bucles según el paper. La información disponible no incluye detalles de la composición del dataset de entrenamiento ni procesos de alineación como RLHF o DPO. La arquitectura incorpora un "early-exit gate" que decide qué bucle alimenta la cabeza LM; en esta conversión GGUF dicho gate no se ha incluido, y con el umbral `early_exit_threshold = 1.0` nunca se activa en el despliegue por defecto.

## Capacidades

- Generación de texto coherente, verificada en las conversiones GGUF con salida correcta y estructurada.
- Razonamiento matemático según el paper: GSM8K 81,58 y MATH500 90,85 (3-shot y 5-shot CoT, strict match), aunque estos valores no se replicaron para los archivos GGUF.
- Razonamiento iterativo en espacio latente gracias a la pasada recurrente del mismo stack de capas, lo que permite profundizar el cómputo sin aumentar el número de parámetros.
- Control del coste computacional en tiempo de ejecución mediante el número de loops (`--override-kv ouro.num_loops=int:N`), con valores de 1 a 4 entrenados y degradación más allá de 4.
- Compatible con la familia de arquitecturas Ouro y con inferencia CPU/GPU vía llama.cpp parcheado.
- No se especifica soporte de tool calling, visión, audio ni funciones de agente en la información disponible.

## Casos de uso

- Investigacion en arquitecturas de razonamiento latent: permite comparar la precisión en benchmarks como GSM8K o MMLU al variar el número de bucles desde un mismo checkpoint, facilitando estudios de escalado de profundidad sin modificar el tamaño del modelo.
- Evaluacion de modelos de pesos compartidos: el ajuste fino del número de loops permite observar cómo se degrada la calidad al reducir la profundidad efectiva, útil para validar hipótesis sobre recurrencia en transformers.
- Prototipado en hardware modesto: las cuantizaciones Q8_0 (2,8 GB) y Q4_K_M (1,65 GB) caben en GPUs de consumo con 4-8 GB de VRAM, lo que permite experimentar con un modelo de 2.7B en equipos no especializados.
- Generacion de texto asistida en entornos educativos: el modelo puede explicar razonamientos matemáticos paso a paso, aunque los benchmarks no han sido verificados en esta conversión GGUF.
- Base para fine-tuning: al estar bajo licencia Apache 2.0 y ofrecer pesos en GGUF y safetensors (vía modelo original), puede adaptarse a tareas específicas de razonamiento.
- Comparacion entre paradigmas: sirve como referencia para estudiar las diferencias entre un modelo denso convencional y un modelo recurrente en profundidad del mismo tamaño, tanto en precisión como en throughput.

## Benchmarks y rendimiento

Los benchmarks no se repitieron para estos archivos GGUF. Los datos proceden del paper y de verificaciones en el modelo menor Ouro-1.4B, tal como se indica en la model card.

| Benchmark | Resultado | Nota |
|---|---|---|
| GSM8K (3-shot CoT, strict match) | 81,58 | Reportado por el paper para Ouro-2.6B, no verificado en este archivo |
| MATH500 (5-shot CoT, strict match) | 90,85 | Reportado por el paper, no verificado en este archivo |
| MMLU (profundidad 1-4) | 51,55 / 67,63 / 73,57 / 74,60 | Ablación del paper para Ouro-2.6B, degrada más allá de 4 bucles |
| GSM8K en Ouro-1.4B, 1/2/4 bucles | 26,0 / 67,0 / 80,5 | Port verificado para el modelo 1.4B, referencia de la arquitectura |
| GSM8K en Ouro-1.4B, paper | 23,0 / 64,0 / 80,0 | Comparación con el modelo original, dentro de un error estándar |

No se han publicado resultados de benchmarks en la información disponible más allá de estos datos. En el modelo 1.4B, la conversión GGUF reprodujo el GSM8K publicado con una desviación inferior a 0,5 puntos.

## Requisitos de hardware

- Tamaño de archivo por cuantizacion: F16 5,3 GB; Q8_0 2,8 GB; Q4_K_M 1,65 GB.
- VRAM estimada para inferencia: alrededor de 2-3 GB para Q4_K_M, 3-4 GB para Q8_0 y 6-7 GB para F16, considerando el modelo y el overhead de activaciones.
- GPUs recomendadas: RTX 3060 12GB para Q8_0 y F16 en entornos de investigación; A100 o H100 para pruebas de máxima precisión y throughput elevado.
- Es viable en GPUs de consumo de 4 GB con Q4_K_M, aunque la ventana de contexto y el número de bucles deberán ajustarse a la memoria disponible.
- Opciones de despliegue: llama.cpp con el parche del repositorio `loop-transformer`. Ollama y LM Studio no pueden cargar estos archivos hasta que se integre la arquitectura `ouro` en la rama principal de llama.cpp.
- Latencia medida: ~8,3 tokens/s en Apple M4 con Q8_0.

## Comparativa con modelos similares

La información disponible no permite una comparación exhaustiva de benchmarks con otros modelos. Se pueden comparar características arquitectónicas dentro de la familia Ouro.

| Modelo | Parametros | Profundidad efectiva | GSM8K (paper/verificado) | Licencia |
|---|---|---|---|---|
| Ouro-2.6B GGUF | 2,67 B | 192 capas (48 x 4 bucles) | 81,58 (paper, no verificado aquí) | Apache 2.0 |
| Ouro-1.4B GGUF | ≈1,4 B | No disponible | 80,0 (verificado en el port) | Apache 2.0 |

No se han encontrado datos comparables con modelos densos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Requiere una versión parcheada de llama.cpp; con llama.cpp estándar, Ollama o LM Studio los archivos no cargan.
- Los benchmarks del paper para Ouro-2.6B no se han verificado en esta conversión GGUF, por lo que las cifras citadas no garantizan el rendimiento real de estos archivos.
- Un solo bucle reduce drásticamente la precisión: en Ouro-1.4B el GSM8K cae de 80,0 a 26,0. Cualquier comparación de rendimiento debe indicar el número de bucles usado.
- El rendimiento empeora más allá de 4 bucles según la ablación del paper (máximo MMLU en 4 bucles).
- El early-exit gate no se ha convertido y no afecta al comportamiento por defecto, pero cualquier uso con umbrales distintos podría diferir del modelo original.
- No se dispone de evaluaciones de sesgos, alucinaciones ni cobertura idiomática, por lo que estos riesgos no han sido cuantificados.
- Licencia Apache 2.0 apta para uso comercial, pero los pesos cuantizados provienen de una conversión de terceros y su exactitud debe validarse antes de producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/BrandiesPatrick/Ouro-2.6B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ByteDance/Ouro-2.6B
- Articulo: arXiv:2510.25741
- Repositorio del parche y harness: https://github.com/BrandeisPatrick/loop-transformer
- Pagina del proyecto Ouro: https://ouro-llm.github.io/
