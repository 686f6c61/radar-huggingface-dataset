# mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B

## Resumen

El modelo `mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B` es una variante podada del modelo Qwen3.5-35B-A3B, cuantizado a 4 bits con OptiQ y posteriormente sometido a poda de expertos mediante la técnica REAP (Cerebras Research, ICLR 2026). El resultado es un checkpoint MLX de 12,8 GB en disco (frente a los 21,9 GB del padre) que conserva 128 de los 256 expertos por capa, manteniendo los 8 expertos activos por token, por lo que la latencia de inferencia no aumenta. Está pensado para ejecutarse en Apple Silicon mediante la librería MLX.

La poda se realiza directamente en el dominio cuantizado, sin descuantizar ni reentrenar, copiando bit a bit los expertos supervivientes del padre. El modelo no ha sido evaluado de forma independiente, pero se publica siguiendo la receta validada en el modelo hermano Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, que mostró una pérdida de capacidad global de 80,03 a 76,57, concentrada principalmente en MMLU (-21,4) y con mejoras en GSM8K (+2,6) e IFEval (+4,3). La divergencia KL respecto al padre es de 0,067, muy por debajo del umbral de 1,0 a partir del cual la degradación se hace visible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 256 expertos por capa, 128 retenidos, 8 activos por token |
| Parametros totales | 18,8B (según model card; el archivo safetensors contiene 3,8B de parámetros cuantizados) |
| Parametros activos | ~3B (del modelo base Qwen3.5-35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (OptiQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit`, una cuantización 4-bit del Qwen3.5-35B-A3B, un MoE con 256 expertos por capa y routing top-8. La poda se realiza con REAP, que ordena los expertos según la media condicional del producto del peso del router por la norma de salida del experto, calculada sobre datos de calibración (mezcla de seis dominios, 8 muestras). Se eliminan los 128 expertos de menor rango en cada capa, de forma uniforme, y se recorta el router para que solo apunte a los supervivientes. Todo el proceso se ejecuta en el dominio cuantizado mediante `optiq prune-experts`, sin descuantizar ni reentrenar. No se ha realizado ningún ajuste fino posterior.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento y resolución de problemas matemáticos (GSM8K).
- Generación de código (HumanEval).
- Seguimiento de instrucciones (IFEval).
- Function calling / tool calling (BFCL).
- Capacidades multilingües no confirmadas en la información disponible.
- No se mencionan capacidades de visión ni audio.

## Casos de uso

- Asistente conversacional en dispositivos Apple: gracias a su tamaño reducido (12,8 GB) y a que mantiene la misma velocidad de inferencia que el padre, puede ejecutarse localmente en Macs con 16 GB de RAM unificada, ofreciendo respuestas fluidas sin conexión.
- Generación de código en entornos de desarrollo: con soporte para HumanEval y BFCL, puede integrarse en editores o CLIs para autocompletar, revisar o explicar fragmentos de código, manteniendo la privacidad al no enviar datos a la nube.
- Automatización de tareas con tool calling: al conservar la capacidad de function calling, puede orquestar llamadas a APIs, bases de datos o servicios externos en pipelines de automatización, con un footprint de memoria reducido.
- Razonamiento matemático y resolución de problemas: su rendimiento en GSM8K se mantiene o mejora tras la poda, por lo que es adecuado para aplicaciones educativas o de análisis cuantitativo.
- Seguimiento de instrucciones complejas: IFEval muestra una mejora tras la poda, lo que lo hace útil para tareas de generación estructurada, resúmenes o extracción de información siguiendo formatos específicos.
- Despliegue en servidores de baja capacidad: al ser un modelo MLX, puede servir en Mac mini o Mac Studio como endpoint local para equipos pequeños, reduciendo costes de infraestructura frente a GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante concreta. La model card indica que no fue evaluada de forma independiente, pero se publica bajo la receta validada en el modelo hermano `Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B`, cuyos cambios relativos frente al padre se muestran a continuación:

| Benchmark | Cambio relativo |
|---|---|
| Capability Score | -3,46 (80,03 → 76,57) |
| MMLU | -21,4 |
| GSM8K | +2,6 |
| IFEval | +4,3 |
| BFCL | -1,0 |
| HumanEval | -1,3 |

Además, se midió la divergencia KL de este checkpoint respecto al padre no podado, resultando en 0,067, un valor muy bajo que indica que la generación es prácticamente indistinguible en revisión humana.

## Requisitos de hardware

- Memoria necesaria para inferencia: 11,7 GB (según model card).
- Tamaño en disco: 12,8 GB.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se menciona soporte para GPUs NVIDIA o AMD.
- Se puede ejecutar en Macs con 16 GB de RAM unificada, aunque se recomienda 24 GB o más para mayor comodidad.
- Opciones de despliegue: `mlx-optiq serve`, `mlx_lm` (carga y generación), o integración en aplicaciones Python.
- Latencia y throughput: no disponibles, pero al mantener los 8 expertos activos por token, la velocidad es similar a la del modelo padre (que en MLX 4-bit alcanza ~25-35 tok/s en Macs de gama alta, según fuentes externas).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Tamaño en disco | Memoria de inferencia | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-OptiQ-4bit (padre) | 35,1B | ~3B | 21,9 GB | ~19,5 GB | Apache-2.0 |
| Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B (este) | 18,8B | ~3B | 12,8 GB | 11,7 GB | Apache-2.0 |
| Qwen3.5-35B-A3B-4bit (cuantización estándar) | 35,1B | ~3B | ~19,5 GB | ~19,5 GB | Apache-2.0 |

La principal ventaja de esta variante es la reducción del 42% en disco y del 40% en memoria, manteniendo la misma velocidad de inferencia y una calidad de generación casi idéntica (KL 0,067). No se dispone de comparativas con otros modelos MoE de tamaño similar.

## Limitaciones y advertencias

- No ha sido evaluado de forma independiente; los resultados de benchmarks provienen del modelo hermano con la misma arquitectura y receta, no de este checkpoint concreto.
- La poda provoca una pérdida significativa en MMLU (-21,4 en el modelo hermano), lo que sugiere una degradación en tareas de conocimiento general y razonamiento de sentido común.
- No se ha verificado el soporte multilingüe; la información disponible no lo confirma.
- Al ser un modelo MLX, solo puede ejecutarse en Apple Silicon; no es compatible con CUDA ni otras plataformas sin conversión previa.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.5 por si hubiera restricciones adicionales.
- No se incluye el sidecar MTP (multi-token prediction), lo que puede afectar a la velocidad de generación en comparación con el modelo original.
- El riesgo de alucinación no ha sido medido específicamente; se asume similar al del modelo base, con posibles variaciones por la poda.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit-REAP-19B)
- [Modelo padre (OptiQ-4bit)](https://huggingface.co/mlx-community/Qwen3.5-35B-A3B-OptiQ-4bit)
- [Modelo hermano validado (Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B)](https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B)
- [Paper REAP (arXiv:2510.13999)](https://arxiv.org/abs/2510.13999)
- [Herramienta mlx-optiq](https://mlx-optiq.com)
- [Documentación de poda de OptiQ](https://mlx-optiq.com/docs/prune)
- [Guía de Qwen 3.5 MLX en Apple Silicon](https://willitrunai.com/blog/qwen-3-5-mlx-apple-silicon-guide)
