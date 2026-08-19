# leonsarmiento/Qwen3.8-27B-MTP-4bit-mlx

## Resumen

El modelo `leonsarmiento/Qwen3.8-27B-MTP-4bit-mlx` no es un modelo de lenguaje autónomo, sino un **drafter MTP (Multi-Token Prediction)** diseñado para acelerar la generación de texto del modelo base `Qwen/Qwen3.8-27B` mediante decodificación especulativa en entornos MLX (Apple Silicon). Fue desarrollado por el usuario leonsarmiento extrayendo los tensores `mtp.*` del shard 18 del modelo original y cuantizándolos a 4-bit affine con group_size=64. Su tamaño es de apenas 258 MB (66,38 millones de parámetros), lo que lo convierte en un complemento ligero que propone hasta 3 tokens por paso para reducir la latencia de inferencia del modelo base.

Este drafter es relevante porque permite ejecutar Qwen3.8-27B de forma más eficiente en hardware Apple, especialmente en tareas de generación instruct o conversacional donde el throughput es crítico. No obstante, no es un modelo independiente: requiere emparejarse con una cuantización MLX del modelo base, y su uso está desaconsejado para tareas de razonamiento largo (thinking mode), donde puede degradar la precisión y aumentar el tiempo de pared. La licencia Apache-2.0 facilita su integración en proyectos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_mtp` (drafter MTP con una capa transformer: gated attention + MLP, más `fc` y `norm`) |
| Parametros totales | 66.381.312 (~66M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hereda la del modelo base (262K tokens nativos en Qwen3.8-27B) |
| Tipos de cuantizacion | 4-bit affine (group_size=64) en capas lineales; norms en bf16 |
| Idiomas soportados | No disponible (depende del modelo base, que es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con metadata `{"format":"mlx"}` |

## Arquitectura y entrenamiento

El drafter se extrae directamente de los tensores `mtp.*` del modelo `Qwen/Qwen3.8-27B` (shard 18), sin entrenamiento adicional. Su arquitectura es `qwen3_5_mtp` con `block_size: 3`, lo que significa que propone 3 tokens por cada paso de decodificación especulativa. Internamente contiene 15 tensores: una capa `fc`, una capa transformer (`layers.0.*` con gated attention y MLP), `norm`, y dos tensores `pre_fc_norm_embedding` / `pre_fc_norm_hidden`. Los pesos de las normas se almacenan en convención MLX RMSNorm (+1.0 shift respecto a HF raw), y las capas lineales están cuantizadas a 4-bit affine con group_size=64, mientras que las normas permanecen en bf16. El parámetro `mtp_use_dedicated_embeddings: false` indica que comparte las embeddings del modelo base.

La cuantización se realizó sobre el drafter original, manteniendo la misma profundidad que el drafter comunitario de 4-bit de `mlx-community`. El autor verificó la correspondencia de claves (31 tensores idénticos), la convención de normas y el metadata de safetensors.

## Capacidades

- **Decodificación especulativa**: propone hasta 3 tokens por paso, acelerando la generación del modelo base en tareas de texto instruct o conversacional.
- **Compatibilidad MLX**: diseñado para Apple Silicon, integrable en LM Studio y oMLX como modelo de draft.
- **Aceleración de texto únicamente**: no participa en el procesamiento de visión del modelo base VLM.
- **Bajo consumo de recursos**: 258 MB, negligible frente al modelo base.
- **No es un modelo generativo**: no produce texto por sí mismo; requiere el base para funcionar.

## Casos de uso

- **Aceleración de chat instruct en Apple Silicon**: al emparejarse con `leonsarmiento/Qwen3.8-27B-3bit-mlx` (o cualquier quant MLX compatible), reduce la latencia en conversaciones multi-turno donde el throughput es prioritario.
- **Despliegue en LM Studio**: configurar el drafter en el apartado "Draft / Speculative model" del modelo base y habilitar MTP, con TurboQuant KV cache desactivado.
- **Despliegue en oMLX**: apuntar el ajuste de "draft model" al repositorio del drafter mediante la API admin, desactivando TurboQuant KV cache.
- **Generación de código en entornos locales**: en tareas de autocompletado o generación de snippets, MTP puede mejorar el rendimiento frente a la decodificación estándar.
- **Asistentes conversacionales ligeros**: para aplicaciones de chatbot donde se prioriza la velocidad de respuesta sobre el razonamiento profundo.
- **Pruebas de decodificación especulativa en investigación**: como referencia para estudiar el impacto de MTP en diferentes cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este drafter en la información disponible. El autor menciona una medición en un modelo distinto (Qwen3.6-35B-A3B) donde MTP degradó la precisión en 7 puntos porcentuales en MATHQA cuando se usaba con razonamiento largo, pero no proporciona datos cuantitativos de throughput o latencia para este drafter concreto. Se recomienda realizar pruebas propias en el hardware objetivo.

## Requisitos de hardware

- **VRAM adicional**: aproximadamente 0,3 GB (258 MB) además de la requerida por el modelo base.
- **GPU recomendadas**: cualquier Apple Silicon con MLX (M1, M2, M3, M4) o GPU con soporte MLX; el drafter es compatible con el modelo base en 3-bit o 4-bit.
- **Cabe en consumer GPU**: sí, dado su tamaño reducido; el requisito principal es la VRAM del modelo base (por ejemplo, Qwen3.8-27B en 3-bit requiere ~10-12 GB).
- **Opciones de despliegue**: LM Studio, oMLX, MLX Python (librería `mlx-lm`).
- **Latencia y throughput**: no disponibles; dependen del hardware y de la configuración del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leonsarmiento/Qwen3.8-27B-MTP-4bit-mlx` | Drafter MTP 4-bit | 66M | 262K (heredado) | Apache-2.0 | HuggingFace |
| `mlx-community/Qwen3.8-27B-MTP-4bit` | Drafter MTP 4-bit | 66M (estimado) | 262K (heredado) | Apache-2.0 | HuggingFace |
| `Qwen/Qwen3.8-27B` | Modelo base VLM denso | 27B | 262K | Apache-2.0 | HuggingFace |

El drafter de leonsarmiento se diferencia del de `mlx-community` en que fue construido directamente desde el shard 18 del modelo original, verificando la convención de normas y el metadata. Ambos son funcionalmente equivalentes en cuanto a arquitectura y tamaño. No hay otros drafter MTP comparables para este modelo base en el ecosistema MLX.

## Limitaciones y advertencias

- **No es un modelo standalone**: cargar solo este repositorio no genera texto útil; requiere emparejarse con una cuantización MLX de Qwen3.8-27B.
- **Degradación en tareas de razonamiento largo**: en cadenas de thinking extensas, MTP aumenta el tiempo de pared y puede reducir la precisión (medido en un modelo similar, -7pp en MATHQA).
- **Solo acelera decode de texto**: no interviene en el procesamiento de visión del modelo base VLM.
- **Incompatibilidad con TurboQuant KV cache**: debe desactivarse para que MTP muestre ventajas.
- **Riesgo de incompatibilidad**: solo funciona con cuantizaciones MLX de la misma arquitectura (`qwen3_5_mtp`); otras variantes pueden fallar.
- **Sesgos y alucinaciones**: heredados del modelo base; no se han evaluado específicamente para este drafter.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/leonsarmiento/Qwen3.8-27B-MTP-4bit-mlx
- Modelo base recomendado: https://huggingface.co/leonsarmiento/Qwen3.8-27B-3bit-mlx
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter similar de la comunidad: https://huggingface.co/mlx-community/Qwen3.8-27B-MTP-4bit
- Guía de ejecución local de Qwen3.8-27B: https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
