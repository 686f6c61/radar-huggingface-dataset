# agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_10

## Resumen

Este modelo es un checkpoint intermedio denominado `opus-high-v3.h068.sft-splice-cont.step_10`, publicado por el usuario `agentic-ptb` como parte del experimento AgentPTB **opus-high-v3**, un run de Claude Code orientado a entrenamiento supervisado (SFT). Está construido sobre el modelo base `Qwen/Qwen3.5-9B-Base` y contiene aproximadamente 9,41 mil millones de parámetros. Su propósito declarado es servir como artefacto de reproducibilidad y estudio cualitativo, no como un modelo listo para uso.

La model card advierte explícitamente de que el run **no encontró mejora alguna en los pesos entrenados**, por lo que este checkpoint se etiqueta como «resultado negativo». Es decir, no debe inferirse calidad o capacidad a partir de su publicación. Su relevancia radica en documentar un experimento fallido dentro de una serie de intentos de ajuste fino, aportando transparencia a la comunidad sobre qué configuraciones no funcionan. No se han publicado métricas de rendimiento, benchmarks ni detalles de entrenamiento más allá de su procedencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B-Base (transformer, detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `Qwen/Qwen3.5-9B-Base`, presumiblemente un transformer denso con atención causal, aunque no se proporcionan detalles específicos (número de capas, dimensión, etc.). El entrenamiento consistió en un ajuste fino supervisado (SFT) dentro del pipeline AgentPTB, concretamente en la celda `opus-high-v3` (run `h068`). La ruta de pesos indica `scratch/agent/sft-splice-cont/weights/step_10`, lo que sugiere un proceso de «splicing» o continuación de SFT.

Según la model card, el run completo no produjo ninguna mejora en los pesos con respecto al modelo base; los cinco runs de SFT regresaron y el checkpoint se conserva únicamente con fines de reproducibilidad. No se han publicado datos sobre el dataset utilizado, número de tokens, ni técnicas como RLHF o DPO. La etiqueta `negative-results` confirma que el experimento se considera fallido desde el punto de vista de mejora de rendimiento.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Dado que no se observó mejora sobre el modelo base, no se puede afirmar que herede o supere las capacidades de `Qwen3.5-9B-Base` (generación de texto, razonamiento, código, etc.). La model card advierte explícitamente de no inferir calidad a partir de su publicación. Por tanto, cualquier capacidad listada aquí sería especulativa y no respaldada por datos.

## Casos de uso

Dado que se trata de un checkpoint intermedio de un experimento fallido, no se recomienda su uso en aplicaciones prácticas. Los posibles casos de uso son limitados y de carácter académico:

- Reproducción de experimentos: investigadores pueden utilizar este checkpoint para verificar la reproducibilidad del run `opus-high-v3` y estudiar por qué el SFT no produjo mejoras.
- Análisis de resultados negativos: sirve como material de estudio para entender qué configuraciones de entrenamiento pueden fallar, ayudando a evitar errores similares en futuros experimentos.
- Comparación de pesos: puede compararse con el modelo base para analizar la magnitud de los cambios (o ausencia de ellos) tras el entrenamiento.
- Auditoría de pipelines: útil para depurar pipelines de entrenamiento automáticos (como los basados en agentes) donde se necesita un punto de control intermedio.
- Investigación en transparencia: contribuye a la práctica de publicar resultados negativos, fomentando una comunidad más honesta sobre lo que funciona y lo que no.

En ningún caso se recomienda su uso en producción, ni siquiera como modelo base para fine-tuning adicional, dado que no hay evidencia de que sus pesos sean útiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que el run no encontró mejoras, es probable que el rendimiento sea equivalente o inferior al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

Dado el tamaño del modelo (9,41B parámetros) y el peso del repositorio (18,8 GB en safetensors, lo que corresponde a precisión FP16), se pueden estimar los siguientes requisitos para inferencia, aunque no se han proporcionado datos oficiales:

- VRAM estimada: aproximadamente 19-20 GB en FP16; con cuantización a 8 bits (~10 GB) o 4 bits (~5-6 GB) podría reducirse significativamente, pero no hay archivos GGUF o AWQ publicados.
- GPU recomendadas: para FP16 se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090, A10G, L4). Con cuantización 4 bits podría caber en GPUs consumer de 8-12 GB (RTX 3060, RTX 4070).
- Despliegue: al ser un checkpoint safetensors estándar, podría cargarse con transformers, vLLM o TGI, pero no se han probado ni documentado estos flujos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este checkpoint con alternativas. Como referencia estructural, se puede comparar con su modelo base y con otros modelos de tamaño similar, pero sin métricas la comparación es meramente informativa:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v3.h068...` | 9,41B | no disponible | Apache 2.0 | Checkpoint intermedio, sin mejoras confirmadas |
| `Qwen/Qwen3.5-9B-Base` | ~9,4B | no disponible | Apache 2.0 | Modelo base, punto de partida del experimento |
| `meta-llama/Llama-3.1-8B` | 8B | 128K (según documentación pública) | Llama 3.1 Community License | Alternativa de tamaño similar, pero sin relación con este checkpoint |

No se puede establecer una comparativa de rendimiento real por falta de benchmarks.

## Limitaciones y advertencias

- Resultado negativo: la model card indica explícitamente que el run no encontró mejora en los pesos entrenados; no debe inferirse calidad o utilidad.
- Sin datos de entrenamiento: no se han publicado detalles sobre el dataset, el número de tokens ni la configuración del SFT, lo que impide evaluar la validez del experimento.
- Sin benchmarks: no hay métricas de rendimiento, por lo que cualquier afirmación sobre capacidades es especulativa.
- Sesgos y alucinación: al derivar del modelo base Qwen, podría heredar sesgos y riesgos de alucinación típicos de modelos de este tamaño, pero no hay estudios específicos.
- No apto para producción: al ser un checkpoint intermedio de un experimento fallido, no se recomienda su uso en aplicaciones reales.
- Licencia: Apache 2.0 permite uso comercial, pero la falta de garantías de calidad hace desaconsejable su explotación.
- Disponibilidad: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido evaluado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h068.sft-splice-cont.step_10
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de experimentos AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de `agentic-ptb`: https://huggingface.co/models?other=agentic-ptb
