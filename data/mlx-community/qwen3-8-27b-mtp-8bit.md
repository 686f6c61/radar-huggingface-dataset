# mlx-community/Qwen3.8-27B-MTP-8bit

## Resumen

El repositorio `mlx-community/Qwen3.8-27B-MTP-8bit` contiene los pesos del módulo Multi-Token Prediction (MTP) extraídos del modelo `Qwen/Qwen3.8-27B` y cuantizados a 8 bits con MLX. Este adaptador no es un modelo de lenguaje autónomo, sino un componente de decodificación especulativa: actúa como modelo borrador (draft model) que predice varios tokens a la vez para acelerar la generación del modelo principal, que en este caso es el Qwen3.8-27B. Está diseñado específicamente para el runtime `mlx-vlm` en hardware Apple Silicon.

La relevancia de este adaptador radica en que permite reducir la latencia de inferencia del modelo Qwen3.8-27B sin modificar su calidad de salida, aprovechando la arquitectura MTP del propio modelo base. Al estar cuantizado en 8 bits con MLX affine (group size 64), ocupa solo 0.5 GB, lo que lo hace ligero y fácil de integrar en flujos de trabajo locales. La licencia Apache 2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_mtp (MTP block size 3) |
| Parametros totales | 119.465.472 (solo adaptador MTP) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64 |
| Idiomas soportados | en (el modelo base soporta mas idiomas, pero no se especifican) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El adaptador contiene únicamente los pesos del módulo MTP (Multi-Token Prediction) del modelo Qwen3.8-27B. La arquitectura MTP permite predecir múltiples tokens en paralelo, lo que se utiliza en decodificación especulativa: el modelo borrador genera una secuencia candidata de tokens, y el modelo principal la verifica y acepta o rechaza en bloque. El bloque MTP tiene un tamaño de 3, es decir, predice 3 tokens a la vez.

No se ha realizado un entrenamiento específico para este adaptador; los pesos se extraen directamente del checkpoint original de Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y se cuantizan con `mlx_vlm.convert`. El modelo base suministra las embeddings de tokens y la cabeza de lenguaje en tiempo de ejecución, por lo que el adaptador no es funcional de forma aislada.

## Capacidades

- Decodificación especulativa: acelera la generación del modelo Qwen3.8-27B al proponer secuencias de tokens candidatas.
- Integración con `mlx-vlm`: se usa como argumento `--draft-model` en el comando `mlx_vlm generate`.
- Detección automática del tipo de draft: el runtime identifica `--draft-kind mtp` a partir del `model_type` del adaptador.
- Compatibilidad con el modo de razonamiento: el ejemplo de uso incluye `--enable-thinking`, lo que sugiere soporte para el modo de pensamiento del modelo base.
- Ligereza: al ser un adaptador de 0.5 GB, su carga en memoria es mínima en comparación con el modelo principal.

## Casos de uso

- Aceleración de inferencia en Apple Silicon: al combinar este adaptador con el modelo Qwen3.8-27B cuantizado, se reduce la latencia de generación en tareas de chat y razonamiento, especialmente en Macs con memoria unificada.
- Despliegue local de asistentes conversacionales: permite ejecutar un modelo de 27B con menor tiempo de respuesta en entornos sin GPU dedicada, usando MLX.
- Generación de código en entornos de desarrollo: el ejemplo de uso muestra la generación de un quicksort en Python; el adaptador acelera la verificación de tokens en tareas de programación.
- Prototipado de aplicaciones con `mlx-vlm`: sirve como componente de referencia para desarrolladores que quieran implementar decodificación especulativa en sus propias aplicaciones.
- Investigación sobre decodificación especulativa: permite estudiar el impacto del MTP en la velocidad de generación sin necesidad de entrenar un modelo borrador desde cero.
- Optimización de costes en inferencia: al reducir el número de pasos de decodificación, disminuye el consumo energético y el tiempo de cómputo en cargas de trabajo repetitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El rendimiento de este adaptador depende del modelo base Qwen3.8-27B y de la configuración de hardware; no se proporcionan métricas de latencia ni throughput en la model card.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0.5 GB en disco; en memoria, su footprint es similar. Sin embargo, al usarse junto con el modelo base Qwen3.8-27B, la VRAM total requerida es la del modelo base más la del adaptador.
- GPU recomendadas: diseñado para Apple Silicon (MLX), por lo que se recomienda cualquier Mac con chip M1 o posterior. No está pensado para GPUs NVIDIA o AMD.
- Compatibilidad con consumer GPU: no aplica, ya que MLX solo funciona en hardware Apple.
- Opciones de despliegue: `mlx-vlm` (CLI) y cualquier framework que soporte MLX y decodificación especulativa con adaptadores MTP.
- Latencia y throughput: no disponibles; dependen del modelo base y del hardware concreto.

## Comparativa con modelos similares

No disponible. Este adaptador es un componente específico para el modelo Qwen3.8-27B y no tiene equivalentes directos en el ecosistema MLX que se puedan comparar con los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo base Qwen3.8-27B (o un checkpoint compatible) para funcionar; usarlo solo no produce ninguna salida.
- Dependencia de la revisión del checkpoint: el adaptador debe usarse con un modelo base derivado de la misma revisión (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) para garantizar compatibilidad.
- Limitado a MLX: no puede ejecutarse con otros runtimes como llama.cpp o vLLM sin conversión adicional.
- Idioma: la model card solo indica inglés; aunque el modelo base puede soportar más idiomas, no se garantiza el comportamiento del adaptador en otros lenguajes.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen3.8-27B; no se mitigan con este adaptador.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben respetar los términos del modelo base y las limitaciones del upstream.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/Qwen3.8-27B-MTP-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
