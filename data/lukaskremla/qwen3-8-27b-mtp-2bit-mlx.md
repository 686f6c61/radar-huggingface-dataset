# lukaskremla/Qwen3.8-27B-MTP-2bit-MLX

## Resumen

Este repositorio contiene un **drafter de predicción multi-token (MTP)** extraído del modelo Qwen3.8-27B y convertido al formato MLX para su uso en decodificación especulativa. No es un modelo de lenguaje completo ni un modelo visión-lenguaje: se trata de un componente auxiliar diseñado para proponer múltiples tokens candidatos que un modelo objetivo (el Qwen3.8-27B completo) verifica posteriormente. Su propósito es acelerar la inferencia en hardware Apple Silicon mediante la librería `mlx-vlm`.

El drafter está cuantizado a 2 bits con cuantización afín por grupos de 64 (método RTN), lo que reduce drásticamente su huella de memoria (0.2 GB en total, con solo ~39.8 millones de parámetros). Sin embargo, el autor advierte que se trata de una cuantización experimental de baja precisión: la tasa de aceptación de propuestas puede verse reducida, lo que podría compensar el ahorro de memoria. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_mtp` (bloque MTP de tamaño 3) |
| Parametros totales | 39.839.232 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo) |
| Tipos de cuantizacion | 2-bit affine (RTN, group size 64); tensores no cuantizados en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El drafter implementa un bloque de **predicción multi-token (MTP)** con tamaño de bloque 3, es decir, propone tres tokens futuros simultáneamente. Esta arquitectura es característica de la familia Qwen3.5 y se utiliza para decodificación especulativa: el modelo objetivo verifica los candidatos propuestos y acepta o rechaza la secuencia completa, reduciendo el número de pasos de decodificación.

No se dispone de información sobre el proceso de entrenamiento del drafter original ni sobre los datos utilizados. El repositorio actual solo contiene la extracción y cuantización del componente MTP a partir del checkpoint `lukaskremla/Qwen3.8-27B-MTP-bf16-MLX`, que a su vez deriva de `Qwen/Qwen3.8-27B`. La cuantización se realizó con la herramienta de conversión de `mlx-vlm 0.6.13` y `mlx 0.32.0`, aplicando redondeo al más cercano (RTN) con grupos de 64 parámetros.

## Capacidades

- **Decodificación especulativa**: propone hasta 3 tokens por paso, que el modelo objetivo verifica.
- **Aceleración de inferencia**: diseñado para reducir la latencia en tareas de generación de texto con Qwen3.8-27B.
- **Integración con MLX**: funciona como drafter en `mlx-vlm`, compatible con el servidor de inferencia de dicha librería.
- **Bajo consumo de memoria**: al estar cuantizado a 2 bits, ocupa solo 0.2 GB, lo que permite cargarlo junto al modelo objetivo en memoria unificada de Apple Silicon.
- **No es autónomo**: no puede generar texto por sí mismo; requiere un modelo objetivo compatible.

## Casos de uso

- **Despliegue de Qwen3.8-27B en Mac con MLX**: el drafter se usa junto al modelo objetivo para acelerar la generación en aplicaciones de chat o razonamiento.
- **Servidor de inferencia local**: mediante `mlx_vlm.server`, se puede montar un endpoint HTTP que combine el drafter con el modelo principal, reduciendo la latencia por token.
- **Prototipado de aplicaciones de IA generativa**: al reducir la memoria necesaria para el drafter, se puede ejecutar el modelo completo en equipos con menos RAM unificada.
- **Investigación en decodificación especulativa**: permite experimentar con drafters de baja precisión y medir el impacto en la tasa de aceptación.
- **Optimización de costes en entornos Apple Silicon**: al usar un drafter de 2 bits, se libera memoria para el modelo objetivo o para otros procesos.
- **Evaluación de cuantización agresiva**: sirve como caso de estudio para determinar si un drafter de 2 bits mantiene una tasa de aceptación aceptable en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que la cuantización de baja precisión puede reducir la tasa de aceptación de propuestas, pero no proporciona métricas cuantitativas.

## Requisitos de hardware

- **VRAM estimada**: el drafter ocupa 0.2 GB en memoria. El modelo objetivo (Qwen3.8-27B) requiere significativamente más, dependiendo de su cuantización (por ejemplo, una versión de 6 bits ocuparía aproximadamente 20 GB).
- **GPU recomendadas**: hardware Apple Silicon con memoria unificada (M1/M2/M3/M4 con al menos 32 GB de RAM para el modelo objetivo en 6 bits; el drafter en sí es trivial).
- **Compatibilidad con consumer GPU**: no aplica directamente, ya que MLX está diseñado para Apple Silicon. No se menciona soporte CUDA.
- **Opciones de despliegue**: `mlx-vlm` (servidor y cliente), integración con `mlx` para inferencia personalizada.
- **Latencia y throughput**: no disponible; depende del modelo objetivo y de la tasa de aceptación del drafter.

## Comparativa con modelos similares

No se dispone de información sobre otros drafters MTP comparables en el ecosistema MLX. El drafter es específico para Qwen3.8-27B y no es intercambiable con otros modelos. Se recomienda usar únicamente con checkpoints compatibles de Qwen3.8-27B.

## Limitaciones y advertencias

- **No es un modelo completo**: intentar usarlo como generador de texto producirá errores o salidas sin sentido.
- **Compatibilidad restringida**: solo funciona con checkpoints Qwen3.8-27B compatibles; igualar el nombre o el número de parámetros no garantiza compatibilidad con otra arquitectura o tokenizador.
- **Cuantización experimental**: la precisión de 2 bits puede reducir la tasa de aceptación de propuestas, anulando parcialmente las ganancias de velocidad.
- **Idioma**: la model card indica solo inglés, aunque el modelo base Qwen3.8-27B es multilingüe; el drafter podría no manejar bien otros idiomas.
- **Sin garantías de producción**: al ser un repositorio con cero descargas y sin benchmarks, se recomienda validar su rendimiento antes de usarlo en entornos críticos.
- **Licencia**: Apache 2.0, permisiva para uso comercial, pero se debe verificar la licencia del modelo base Qwen3.8-27B original.

## Enlaces

- [Repositorio HuggingFace del drafter](https://huggingface.co/lukaskremla/Qwen3.8-27B-MTP-2bit-MLX)
- [Modelo base en BF16 (MLX)](https://huggingface.co/lukaskremla/Qwen3.8-27B-MTP-bf16-MLX)
- [Modelo original Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
