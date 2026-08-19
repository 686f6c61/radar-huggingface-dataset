# lukaskremla/Qwen3.8-27B-MTP-5bit-MLX

## Resumen

El repositorio `lukaskremla/Qwen3.8-27B-MTP-5bit-MLX` contiene únicamente el módulo *drafter* de predicción multi-token (MTP) extraído del modelo completo `Qwen/Qwen3.8-27B` y convertido al formato MLX con cuantización de 5 bits. No se trata de un modelo de lenguaje o visión-lenguaje completo, sino de un componente auxiliar diseñado para acelerar la inferencia mediante decodificación especulativa. Su función es proponer candidatos de tokens que el modelo objetivo verifica, reduciendo así el número de pasos de decodificación y mejorando la latencia en entornos con MLX, especialmente en hardware Apple Silicon.

El drafter tiene aproximadamente 79,6 millones de parámetros (frente a los 27B del modelo completo) y ocupa unos 0,3 GB en disco, lo que lo hace extremadamente ligero. Está cuantizado con un esquema afín de 5 bits, grupo de 64 y redondeo al más cercano (RTN), manteniendo los tensores no cuantizados en BF16. La licencia es Apache 2.0, heredada del modelo base. Su relevancia actual radica en que permite ejecutar el modelo Qwen3.8-27B de forma más eficiente en dispositivos con memoria limitada, sin sacrificar la calidad de las predicciones, ya que el modelo objetivo siempre verifica las propuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP (Multi-Token Prediction) extraido de Qwen3.8-27B, block size 3 |
| Parametros totales | 79.652.352 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo) |
| Tipos de cuantizacion | 5-bit affine (RTN), group size 64; tensores no cuantizados en BF16 |
| Idiomas soportados | en (segun la model card; el modelo base Qwen3.8 es multilingue, pero este drafter solo declara ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El drafter es un submodulo del modelo Qwen3.8-27B, que emplea una arquitectura transformer con mecanismo de prediccion multi-token (MTP). En lugar de predecir un solo token a la vez, el modulo MTP genera varios tokens candidatos en paralelo (block size 3), que luego son verificados por el modelo principal durante la decodificacion especulativa. Esto reduce el numero de pasos de autoatencion necesarios y acelera la generacion.

No se dispone de informacion sobre el entrenamiento especifico del drafter, ya que es una extraccion del modelo base. La conversion a MLX se realizo con las herramientas `mlx-vlm 0.6.13` y `mlx 0.32.0`, aplicando cuantizacion afina de 5 bits con redondeo al mas cercano (RTN) y grupo de 64. La precision del drafter no necesita coincidir con la del modelo objetivo: una precision menor ahorra memoria, mientras que una mayor (BF16 o superior) suele mejorar la tasa de aceptacion de las propuestas.

## Capacidades

- Proponer multiples tokens candidatos (hasta 3) para decodificacion especulativa.
- Acelerar la inferencia del modelo Qwen3.8-27B en entornos MLX.
- Compatible con `mlx-vlm` para servidores de generacion con modelo objetivo y drafter.
- No genera texto por si mismo; requiere un modelo objetivo compatible.
- No soporta tool calling, agentes ni razonamiento de forma independiente.
- No tiene capacidades de vision o audio; es exclusivamente un modulo de prediccion de tokens.

## Casos de uso

- Aceleracion de inferencia en Apple Silicon: al emparejar este drafter con un modelo Qwen3.8-27B cuantizado (por ejemplo, `lukaskremla/Qwen3.8-27B-6bit-MLX`), se reduce la latencia de generacion en Macs con chips M-series, aprovechando la decodificacion especulativa.
- Despliegue de servidores de generacion con `mlx-vlm.server`: se puede lanzar un endpoint local que use el drafter para proponer tokens y el modelo objetivo para verificar, mejorando el throughput en aplicaciones de chat o asistentes.
- Prototipado rapido en entornos con memoria limitada: el drafter ocupa solo 0,3 GB, por lo que puede cargarse junto al modelo completo en GPUs con poca VRAM, siempre que el modelo objetivo quepa.
- Investigacion en decodificacion especulativa: sirve como ejemplo de implementacion de un drafter MTP cuantizado, util para estudiar el impacto de la cuantizacion en la tasa de aceptacion.
- Optimizacion de costes en inferencia: al reducir los pasos de decodificacion, se disminuye el consumo energetico y el tiempo de computo en cargas de trabajo repetitivas.
- Integracion en pipelines de MLX: puede combinarse con otros modelos de la familia Qwen3.8-27B para experimentos de velocidad sin modificar la logica de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El rendimiento del drafter depende de la tasa de aceptacion de sus propuestas, que a su vez depende de la cuantizacion y del modelo objetivo. No hay datos numericos publicados.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 0,3 GB en precision 5-bit (79,6M parametros).
- El drafter por si solo cabe en cualquier GPU o CPU moderna, pero su uso practico requiere cargar el modelo completo Qwen3.8-27B (que necesita varios GB de VRAM, dependiendo de la cuantizacion).
- GPU recomendadas: cualquier GPU compatible con MLX (Apple Silicon) o GPU NVIDIA/AMD con soporte de Metal (via MLX). No requiere GPU especifica.
- Opciones de despliegue: `mlx-vlm.server` con `--draft-model`, o integracion en codigo Python con la libreria `mlx-vlm`.
- Latencia y throughput: no disponibles; dependen del hardware y del modelo objetivo.

## Comparativa con modelos similares

No se dispone de informacion sobre otros drafters MTP comparables en el ecosistema MLX. Este drafter es especifico para Qwen3.8-27B y no es intercambiable con otros modelos. La comparativa con alternativas no esta disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: no puede generar texto ni responder consultas por si mismo.
- Solo es compatible con checkpoints de Qwen3.8-27B que compartan arquitectura y tokenizador; no basta con coincidir en nombre o numero de parametros.
- La cuantizacion de 5 bits puede reducir la tasa de aceptacion de las propuestas en comparacion con un drafter en BF16, aunque el modelo objetivo siempre verifica los tokens, por lo que no se introducen errores.
- La model card indica idioma `en`, aunque el modelo base es multilingue; el drafter podria no manejar bien otros idiomas si el tokenizador no los soporta.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.8-27B para cualquier redistribucion.
- No hay garantias de soporte o mantenimiento; es un repositorio con 0 descargas y 0 likes, por lo que su fiabilidad no esta probada en produccion.

## Enlaces

- Repositorio del drafter: https://huggingface.co/lukaskremla/Qwen3.8-27B-MTP-5bit-MLX
- Modelo base (bf16): https://huggingface.co/lukaskremla/Qwen3.8-27B-MTP-bf16-MLX
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm (referencia indirecta, no confirmada en la informacion proporcionada)
