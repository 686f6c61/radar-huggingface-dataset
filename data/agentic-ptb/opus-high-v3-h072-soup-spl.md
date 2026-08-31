# agentic-ptb/opus-high-v3.h072.soup-spl

## Resumen

`agentic-ptb/opus-high-v3.h072.soup-spl` es un checkpoint intermedio y derivado publicado por el autor `agentic-ptb` como parte del run de experimentación **opus-high-v3**, ejecutado con Claude Code. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y fue sometido a un proceso de fine-tuning (SFT) cuyo resultado, según la propia model card, **no encontró mejora en los pesos entrenados**. Se trata de un artefacto de investigación retenido explícitamente para reproducibilidad y estudio cualitativo, no de un modelo listo para uso.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en formato `safetensors`, este checkpoint se publica bajo licencia Apache 2.0. La model card incluye una advertencia clara: no se debe inferir calidad del hecho de su publicación, ya que los resultados del run fueron negativos. No se dispone de información sobre arquitectura detallada, contexto, idiomas ni capacidades verificadas más allá de lo heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada de Qwen/Qwen3.5-9B-Base (no se especifica detalle) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantificar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del checkpoint es la del modelo base `Qwen/Qwen3.5-9B-Base`, aunque no se proporcionan detalles técnicos sobre dicha arquitectura (tipo de transformer, atención, etc.). El proceso de entrenamiento corresponde a un run de fine-tuning supervisado (SFT) dentro del proyecto AgentPTB, ejecutado durante 72 horas (run hour `h072`) y con procedencia `scratch/agent/soup-spl`. Según la model card, el run **no produjo ninguna mejora en los pesos entrenados**; de hecho, se reporta como un resultado negativo. No hay información sobre el dataset utilizado, número de tokens, ni técnicas como RLHF o DPO.

La publicación de este checkpoint tiene como único fin la reproducibilidad y el estudio cualitativo de por qué el entrenamiento no funcionó. No se documentan innovaciones técnicas ni configuraciones especiales.

## Capacidades

- No se han verificado capacidades específicas de este checkpoint.
- Al ser un derivado de `Qwen/Qwen3.5-9B-Base`, podría heredar las capacidades del modelo base (generación de texto, razonamiento, código, etc.), pero no hay evidencia de que el fine-tuning haya mantenido o mejorado dichas capacidades.
- No se dispone de información sobre tool calling, agentes, multilingüismo, visión u otras funciones.
- La model card advierte explícitamente que no se debe inferir calidad del modelo a partir de su publicación.

## Casos de uso

Dado el carácter de checkpoint de investigación con resultados negativos, no se recomienda su uso en aplicaciones prácticas. Los únicos escenarios razonables son:

- **Reproducibilidad de experimentos**: sirve para replicar el run `opus-high-v3` y verificar los resultados negativos reportados.
- **Estudio de fallos de fine-tuning**: investigadores pueden analizar este checkpoint para entender por qué el SFT no produjo mejoras sobre el modelo base.
- **Análisis comparativo de pesos**: comparar los tensores de este checkpoint con los del modelo base para identificar posibles degeneraciones o sobreajustes.
- **Evaluación de pipelines de entrenamiento**: como punto de control en un flujo de experimentación, aunque el propio autor lo marca como `intermediate` y no válido para producción.
- **Documentación de resultados negativos**: útil para la comunidad como ejemplo de un run fallido y sus artefactos.
- **Pruebas de integración**: en entornos de desarrollo donde se necesite verificar que el pipeline de carga de safetensors funciona con checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.). Dado que el run fue un fracaso en términos de mejora de pesos, es probable que no se hayan ejecutado evaluaciones estándar.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 9,4 B parámetros en precisión FP16, se necesitan aproximadamente 18,8 GB de VRAM solo para los pesos. Con overhead de inferencia, se recomienda al menos 24 GB.
- **GPU recomendadas**: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) sería suficiente para inferencia básica. Para fine-tuning o evaluación intensiva, se requiere más memoria.
- **Compatibilidad con consumer GPU**: sí, en GPUs de 24 GB o más, aunque con limitaciones de contexto y batch.
- **Opciones de despliegue**: al ser un checkpoint en safetensors, se puede cargar con bibliotecas como Transformers, vLLM o llama.cpp (si se convierte a GGUF). Sin embargo, no se recomienda su uso en producción.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base `Qwen/Qwen3.5-9B-Base` es el único punto de referencia directo, pero no se conocen sus especificaciones ni rendimiento. Tampoco hay datos de otros checkpoints del mismo run (como `opus-high-v3.h072` en otras variantes). Por tanto, la comparativa se limita a indicar que este checkpoint no presenta ninguna ventaja documentada sobre su modelo base.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| opus-high-v3.h072.soup-spl | 9,4 B | no disponible | Apache 2.0 | Checkpoint intermedio, sin mejora verificada |
| Qwen/Qwen3.5-9B-Base | 9,4 B (presumible) | no disponible | no disponible | Modelo base, sin información publicada |

## Limitaciones y advertencias

- **Resultados negativos**: el run de entrenamiento no produjo ninguna mejora en los pesos; el checkpoint no debe considerarse un modelo funcional.
- **Riesgo de alucinación y degradación**: al ser un checkpoint intermedio de un SFT fallido, es posible que sus respuestas sean incoherentes o de baja calidad.
- **Sin información de contexto**: se desconoce la longitud de contexto soportada, lo que impide planificar su uso en tareas de memoria larga.
- **Idiomas no especificados**: no hay datos sobre qué idiomas maneja correctamente.
- **No apto para producción**: la model card lo marca como `intermediate` y advierte explícitamente contra inferir calidad.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero dado el estado del modelo, cualquier uso en producción sería irresponsable.
- **Falta de documentación**: no hay papers, informes técnicos ni benchmarks asociados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/agentic-ptb/opus-high-v3.h072.soup-spl)
- [Dataset del run (agentic-ptb/opus-high-v3-data)](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice de datasets de agentic-ptb](https://huggingface.co/datasets/agentic-ptb/INDEX)
