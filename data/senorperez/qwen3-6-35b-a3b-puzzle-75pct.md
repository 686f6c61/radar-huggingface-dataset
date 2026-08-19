# senorperez/qwen3.6-35b-a3b-puzzle-75pct

## Resumen

`senorperez/qwen3.6-35b-a3b-puzzle-75pct` es un checkpoint de investigación experimental producido por poda (pruning) de las anchuras de las FFN de los expertos del modelo MoE `Qwen/Qwen3.6-35B-A3B`, reduciéndolas a aproximadamente un 75% de su ancho original (media de 384 de 512 unidades por capa). El autor, identificado como `senorperez`, lo publica con fines de reproducibilidad, no para uso en producción, y advierte explícitamente de que el modelo es peor que su padre en todos los benchmarks evaluados.

El modelo tiene 26.607.547.008 parámetros totales (26,61B), frente a los 35B del original, y se distribuye bajo licencia Apache 2.0. La técnica empleada sigue el enfoque "Puzzle" de compresión solo de FFN descrito en el arXiv 2411.19146, con selección de canales basada en covarianza, asignación de anchura por capa mediante programación dinámica y destilación local y global. El proyecto concluye que el techo de conocimiento se fija en el momento de la poda: duplicar el presupuesto de tokens de "healing" redujo la divergencia KL con el padre en un 20,9% pero solo mejoró MMLU-Pro en +0,38 puntos porcentuales, un cambio no significativo.

La relevancia de este modelo es metodológica: documenta un resultado negativo completo, incluyendo los bugs de medición que invalidaron conclusiones anteriores, y ofrece una advertencia práctica sobre la poda de MoE. No está pensado para ser desplegado, sino para estudiar los límites de la compresión estructural en arquitecturas de mezcla de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con FFN podadas por capa |
| Parametros totales | 26.607.547.008 (26,61B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.6-35B-A3B`, un MoE con 35B de parámetros totales y 3B activos (según la nomenclatura del nombre, aunque no se confirma en la información proporcionada). La poda se aplica exclusivamente a las FFN de los expertos, reduciendo su anchura a una media de 384 unidades frente a las 512 originales, con una asignación por capa calculada mediante programación dinámica. La selección de canales es "whitened covariance-aware", es decir, tiene en cuenta la covarianza de las activaciones tras un blanqueamiento.

El entrenamiento posterior a la poda ("healing") combina el optimizador Muon con destilación KL de cola gruesa (coarse-tail KL distillation), primero a nivel de bloque y después global. No se especifican los datos de entrenamiento ni el número de tokens utilizados. El autor reporta que, a pesar de duplicar el presupuesto de healing, la recuperación de capacidades fue marginal, lo que sugiere que la pérdida de conocimiento es inherente al proceso de poda y no recuperable mediante destilación adicional.

Una innovación técnica destacable es el consejo de truncar el top-k del router en lugar de reducir `num_experts_per_tok` para disminuir el número de expertos activos, ya que la renormalización de las puertas supervivientes en la segunda opción cuesta entre 2 y 5 veces más en perplejidad a igualdad de FLOPs (+2,74% frente a +0,57% en k=6).

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades generales del modelo padre Qwen3.6-35B-A3B, pero con rendimiento degradado en todas las tareas evaluadas.
- Razonamiento avanzado: la retención en GPQA-D es del 85% respecto al padre (68,69 frente a 80,81), lo que indica que las capacidades de razonamiento frontera son las más afectadas por la poda.
- Recuperación de conocimiento: la retención en tareas de recuperación es del 99,3%, la más alta entre las categorías evaluadas.
- No se menciona soporte explícito para tool calling, function calling, agentes, visión o audio en la información disponible.
- El modelo requiere un parche específico (`perlayer_moe.patch()`) para cargarse con `transformers`, ya que las anchuras de FFN por capa no son leídas por la implementación estándar.

## Casos de uso

- Investigación en poda de MoE: sirve como punto de referencia para estudiar cómo la reducción de anchura de FFN afecta a diferentes capacidades (razonamiento, recuperación, seguimiento de instrucciones) y para validar métodos de destilación.
- Análisis de degradación selectiva: permite investigar por qué el razonamiento frontera se degrada más que la recuperación de conocimiento, y si existen técnicas de healing alternativas que puedan recuperar esas capacidades.
- Desarrollo de técnicas de selección de canales: el checkpoint puede usarse para comparar la selección basada en covarianza con otros criterios de poda, y para evaluar el impacto de la asignación de anchura por capa mediante programación dinámica.
- Estudio de la interacción entre poda y router: la recomendación sobre truncar el top-k del router puede probarse sobre este modelo para medir el efecto en perplejidad y rendimiento final.
- Reproducción de resultados negativos: útil para la comunidad que busca entender los límites de la compresión estructural y evitar repetir experimentos fallidos.
- Benchmark de herramientas de parcheo: el requisito de `perlayer_moe.patch()` lo convierte en un caso de prueba para implementaciones que soporten anchuras de FFN heterogéneas en transformers.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos entre el modelo padre y este checkpoint podado:

| Modelo | Params | MMLU-Pro | IFEval | GPQA-D |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (padre) | 35B | 77,78 | 84,10 | 80,81 |
| **qwen3.6-35b-a3b-puzzle-75pct** | 26,61B | 73,65 | 79,30 | 68,69 |

El modelo es peor que el padre en todos los benchmarks. La retención relativa es del 94,7% en MMLU-Pro, 94,3% en IFEval y 85,0% en GPQA-D. No se han publicado resultados adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 53,2 GB en safetensors con pesos en bfloat16, por lo que se necesitan al menos 53 GB de VRAM para cargar el modelo sin cuantización. No se proporcionan cuantizaciones, por lo que no es posible reducir este requisito con las herramientas estándar.
- GPU recomendadas: una NVIDIA A100 80GB, H100 80GB o similar con al menos 80 GB de VRAM. En GPUs de consumo (RTX 4090 con 24 GB) no cabría sin cuantización.
- Opciones de despliegue: no compatible con vLLM. Requiere el parche `perlayer_moe.patch()` incluido en el repositorio y la carga mediante `transformers` con `dtype="bfloat16"`. No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa más directa es con el modelo padre, ya que no se dispone de información sobre otros modelos podados con la misma técnica en la información proporcionada.

| Modelo | Params | Contexto | MMLU-Pro | IFEval | GPQA-D | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (padre) | 35B | no disponible | 77,78 | 84,10 | 80,81 | Apache 2.0 |
| **qwen3.6-35b-a3b-puzzle-75pct** | 26,61B | no disponible | 73,65 | 79,30 | 68,69 | Apache 2.0 |

No se dispone de datos de otros modelos comparables en la misma categoría (MoE podados con método Puzzle) en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo califica como "no cumple las expectativas" y lo publica únicamente para reproducibilidad. No debe usarse en producción.
- Rendimiento inferior al padre: es peor en todos los benchmarks evaluados, con una caída especialmente acusada en razonamiento frontera (GPQA-D, retención del 85%).
- Requiere parche no estándar: la carga con `transformers` falla sin aplicar `perlayer_moe.patch()`, y no es compatible con vLLM.
- Sin cuantizaciones disponibles: no se ofrecen versiones GGUF, AWQ u otras, lo que limita su despliegue en hardware modesto.
- Datos de entrenamiento no publicados: no se especifica la composición del dataset de healing ni el número de tokens utilizados, lo que dificulta la reproducibilidad completa.
- Sesgos y alucinaciones: no se han evaluado específicamente, pero al derivar de Qwen3.6-35B-A3B podría heredar sesgos del modelo base, y la poda podría aumentar la tendencia a alucinar en tareas de razonamiento.
- Restricciones de uso: aunque la licencia es Apache 2.0, el carácter experimental y la falta de soporte lo desaconsejan para cualquier aplicación comercial.

## Enlaces

- HuggingFace: https://huggingface.co/senorperez/qwen3.6-35b-a3b-puzzle-75pct
- Paper de referencia (método Puzzle): https://arxiv.org/abs/2411.19146
- Repositorio del proyecto (privado): https://github.com/sootaugur/puzzle
