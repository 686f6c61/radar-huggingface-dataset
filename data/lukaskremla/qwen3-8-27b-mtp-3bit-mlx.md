# lukaskremla/Qwen3.8-27B-MTP-3bit-MLX

## Resumen

`lukaskremla/Qwen3.8-27B-MTP-3bit-MLX` es un modelo auxiliar de predicción multi-token (MTP) extraído del modelo completo `Qwen/Qwen3.8-27B` y convertido al formato MLX para decodificación especulativa. No es un modelo de lenguaje autónomo, sino un "drafter" que propone secuencias de tokens candidatos para que un modelo objetivo (el Qwen3.8-27B completo) las verifique, acelerando así la inferencia sin comprometer la calidad de la salida.

El modelo está desarrollado por lukaskremla y se distribuye bajo licencia Apache 2.0. Su relevancia radica en permitir la ejecución de decodificación especulativa en entornos MLX (Apple Silicon) con un coste de memoria reducido gracias a una cuantización de 3 bits. Con solo 53,1 millones de parámetros y un tamaño de repositorio de 0,2 GB, este drafter es extremadamente ligero en comparación con el modelo objetivo de 27 mil millones de parámetros.

Se trata de una versión experimental de baja precisión: la cuantización 3-bit con grupo de 64 y redondeo al más cercano (RTN) puede reducir la tasa de aceptación de las propuestas, aunque el modelo objetivo verifica siempre los candidatos, por lo que la precisión final no se ve afectada, solo el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP drafter (predicción multi-token) para decodificación especulativa, tipo `qwen3_5_mtp` |
| Parametros totales | 53.110.272 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | 3-bit affine, group size 64, método RTN; tensores no cuantizados en BF16 |
| Idiomas soportados | en (según la model card; el modelo base es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es un drafter MTP extraído de `Qwen/Qwen3.8-27B`. La arquitectura MTP (Multi-Token Prediction) es una técnica de decodificación especulativa en la que una red ligera predice varios tokens futuros de una sola vez. El modelo objetivo verifica esas predicciones y acepta o rechaza los tokens propuestos, lo que reduce el número de pasos de decodificación y acelera la generación.

No se dispone de información sobre el entrenamiento específico de este drafter, ya que no es un modelo entrenado de forma independiente, sino un componente extraído del modelo base. La cuantización se realizó con la herramienta `mlx-vlm 0.6.13` y `mlx 0.32.0`, aplicando cuantización afín de 3 bits con grupo de tamaño 64 y redondeo al más cercano (RTN). Los tensores que no son lineales se mantienen en BF16. El tamaño de bloque MTP es 3, lo que significa que el drafter propone tres tokens por paso.

## Capacidades

- Proponer secuencias de tokens candidatos (hasta 3 tokens por paso) para decodificación especulativa.
- Reducir la latencia de inferencia del modelo Qwen3.8-27B cuando se usa como drafter en `mlx-vlm`.
- Ahorrar memoria en comparación con un drafter en BF16 o de mayor precisión, gracias a la cuantización de 3 bits.
- No genera texto por sí mismo; requiere un modelo objetivo compatible (Qwen3.8-27B) para funcionar.
- No soporta tool calling, razonamiento, visión ni otras capacidades de forma autónoma, ya que es un componente auxiliar.

## Casos de uso

- Aceleración de inferencia de Qwen3.8-27B en Apple Silicon: el drafter se combina con el modelo objetivo mediante `mlx_vlm.server`, lo que permite reducir el tiempo de generación en aplicaciones de chat o asistentes conversacionales.
- Despliegue en entornos con memoria limitada: al ser un modelo de solo 53M parámetros y 0,2 GB, puede ejecutarse junto al modelo grande en GPUs con poca VRAM adicional, como las de MacBooks o Mac Studios.
- Evaluación de decodificación especulativa en MLX: los investigadores pueden probar el impacto de la cuantización de baja precisión en la tasa de aceptación de propuestas y ajustar la configuración (por ejemplo, usar un drafter BF16 si la aceptación es demasiado baja).
- Integración en pipelines de generación de texto con `mlx-vlm` que requieran baja latencia, como chatbots en tiempo real o asistentes de código.
- Experimentación con técnicas de cuantización agresiva (3-bit) en modelos auxiliares para estudiar el equilibrio entre ahorro de memoria y rendimiento.
- Uso como referencia para comparar diferentes estrategias de drafter (por ejemplo, 3-bit vs BF16) en el mismo modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte que la cuantización de baja precisión puede reducir la tasa de aceptación de las propuestas, lo que podría compensar el ahorro de memoria. No se proporcionan métricas numéricas de latencia o throughput.

## Requisitos de hardware

- El drafter tiene 53,1 millones de parámetros y un tamaño de 0,2 GB, por lo que cabe en cualquier GPU o incluso en memoria unificada de Apple Silicon.
- VRAM adicional estimada: menos de 0,5 GB en cuantización 3-bit (el modelo base ocupa aproximadamente 0,2 GB en disco).
- GPU recomendadas: cualquier GPU compatible con MLX, principalmente Apple Silicon (M1, M2, M3, M4) para usar con `mlx-vlm`.
- También puede ejecutarse en GPUs NVIDIA si se usa MLX con soporte CUDA (aunque MLX está orientado a Apple Silicon).
- Opciones de despliegue: `mlx-vlm` (servidor y cliente), integración con `mlx` y `mlx_vlm.server`.
- Latencia y throughput: no disponibles; dependen del modelo objetivo y de la tasa de aceptación del drafter.

## Comparativa con modelos similares

No se dispone de información sobre otros drafters MTP comparables en el ecosistema MLX. El drafter es específico para Qwen3.8-27B y no es intercambiable con otros modelos. Se podría comparar con el drafter BF16 del mismo autor (`lukaskremla/Qwen3.8-27B-MTP-bf16-MLX`), pero no hay datos de rendimiento publicados.

## Limitaciones y advertencias

- Es un modelo experimental de baja precisión; la cuantización de 3 bits puede reducir la tasa de aceptación de tokens propuestos, lo que podría anular las ganancias de velocidad.
- No es un modelo de lenguaje completo: no puede generar texto por sí mismo y requiere un modelo objetivo Qwen3.8-27B compatible.
- La compatibilidad no se garantiza por nombre o número de parámetros; debe usarse únicamente con checkpoints Qwen3.8-27B específicos (según la model card, "matching a model name or parameter count alone is not sufficient").
- La model card indica que el idioma es solo inglés, aunque el modelo base es multilingüe; el drafter no aporta capacidades multilingües adicionales.
- No hay datos de benchmarks ni de rendimiento publicados, por lo que se desconoce el impacto real en la latencia.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.8-27B (también Apache 2.0 según la información proporcionada).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lukaskremla/Qwen3.8-27B-MTP-3bit-MLX
- Modelo base BF16: https://huggingface.co/lukaskremla/Qwen3.8-27B-MTP-bf16-MLX
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de MLX: https://ml-explore.github.io/mlx/
- Documentación de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
