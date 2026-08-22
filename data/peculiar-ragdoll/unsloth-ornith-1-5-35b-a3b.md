# peculiar-ragdoll/Unsloth-Ornith-1.5-35B-A3B

## Resumen

Unsloth-Ornith-1.5-35B-A3B es una escalera de cuantizaciones GGUF del modelo MoE Ornith-1.5-35B-A3B, publicado por el usuario de la comunidad peculiar-ragdoll. Se trata de una reproducción independiente del método de cuantización dinámica de Unsloth (Unsloth-Dynamic 2.0), aplicada a los pesos BF16 del modelo original, con una matriz de importancia (imatrix) calculada específicamente para Ornith sobre un corpus de calibración intercalado multilingüe y de código. El objetivo es reducir el consumo de VRAM para permitir la ejecución del modelo en hardware de consumo, manteniendo la mayor fidelidad posible.

La arquitectura subyacente es un MoE de tipo `qwen35moe` (similar a la familia Qwen3 de mezcla de expertos), con 34.660.610.688 parámetros totales según los safetensors del modelo base. El repo publica nueve niveles de cuantización que van desde aproximadamente 12 GB hasta 37 GB, todos ellos sin el bloque MTP (`nextn`) porque el modelo base lo incluye sin entrenar, lo que solo añadía peso sin aportar funcionalidad. La licencia es MIT, tanto para el modelo original como para esta derivada.

La relevancia actual de esta ficha radica en que Ornith-1.5-35B-A3B es un modelo de 35B en arquitectura MoE con solo 3B de parámetros activos (según la nomenclatura del nombre), lo que lo hace atractivo para despliegues en entornos con VRAM limitada. Esta cuantización facilita su uso práctico con herramientas estándar del ecosistema llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen35moe, similar a Qwen3.5-35B-A3B) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (el nombre del modelo sugiere 3B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_S, UD-Q4_K_XL, UD-Q5_K_XL, UD-Q6_K_XL, UD-Q8_K_XL |
| Idiomas soportados | no disponible (el corpus de calibracion es multilingue y de codigo) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Este repo no contiene un modelo entrenado desde cero, sino una cuantización del modelo base `ornith-ai/Ornith-1.5-35B-A3B`, que es un MoE de tipo `qwen35moe` (similar a la arquitectura de Qwen3.5-35B-A3B) con 34.66B parámetros totales y, según el nombre, aproximadamente 3B activos por token. El modelo base fue entrenado por ornith-ai con licencia MIT, pero no se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO).

La cuantización aplica una política por tensor (per-tensor) de estilo Unsloth-Dynamic: cada tensor recibe un número de bits según su sensibilidad, dando más precisión a embeddings, capas de atención y capas tempranas/tardías, y menos a capas intermedias menos críticas. La matriz de importancia se calculó de nuevo sobre los pesos BF16 de Ornith, con un corpus de calibración intercalado multilingüe y de código, en lugar de heredar estadísticas de otros modelos.

Una característica técnica destacada es la eliminación del bloque MTP (Multi-Token Prediction, `nextn`). Según el autor, las matrices de peso de `blk.40` presentan una distribución estadística idéntica a una inicialización aleatoria `N(0, 0.02)` (desviación estándar 0.020, kurtosis 3.00, outlier máximo a 5 desviaciones), mientras que las capas entrenadas muestran kurtosis de 4 a 39 y outliers superiores a 14 desviaciones. Por tanto, el bloque nunca fue entrenado y su eliminación no cambia ninguna salida, ahorrando entre 0.3 y 0.9 GB por tier. Los pesos restantes son byte-idénticos a la versión anterior del repo, no re-cuantizados.

## Capacidades

- Generación de texto conversacional con el chat template original de Ornith, sin modificaciones.
- Inferencia de modelo MoE con activación de solo una fracción de los expertos por token, lo que reduce coste computacional.
- Soporte de cuantización de tipo GGUF para ejecución con llama.cpp y sus derivados.
- Capacidades multilingües y de código, según el corpus de calibración usado (aunque no se especifican idiomas concretos del modelo base).
- No se menciona soporte de tool calling, function calling, agentes o razonamiento multi-step en la información disponible.

## Casos de uso

- **Inferencia local en hardware de consumo**: gracias a los tiers de cuantización que van desde 12 GB hasta 37 GB, el modelo se puede ejecutar en GPUs con 16 GB o 24 GB de VRAM, como RTX 4070/4080/4090. Por ejemplo, el tier `UD-Q4_K_XL` (~22 GB) cabe en una RTX 4090 con espacio para contexto.
- **Despliegue en servidores con VRAM limitada**: con `UD-Q2_K_XL` (~12 GB) o `UD-IQ3_XXS` (~13 GB) se puede servir el modelo en GPUs de 16 GB, como una A100 16G o una RTX 4080, dejando espacio para el contexto y el KV cache.
- **Prototipado y pruebas de concepto**: el formato GGUF permite cargar el modelo con llama.cpp, LM Studio o Ollama, facilitando pruebas rápidas de generación de texto, chat y experimentación sin necesidad de infraestructura de entrenamiento.
- **Aplicaciones de chat y asistencia conversacional**: al mantener el chat template de Ornith, se puede usar como backend de chatbots locales o aplicaciones de asistencia sin depender de APIs externas.
- **Aplicaciones de generación de código**: el corpus de calibración incluye código, lo que sugiere que el modelo base tiene capacidad para generar y completar código. La cuantización preserva esa capacidad a un coste de VRAM reducido.
- **Educación e investigación**: permite a investigadores y estudiantes ejecutar un modelo de 35B de parámetros en equipos de consumo para estudiar el comportamiento de MoE y técnicas de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El autor indica que la cuantización es "near-lossless" en el tier `UD-Q6_K_XL` y "reference" en `UD-Q8_K_XL`, pero sin datos numéricos.

## Requisitos de hardware

- **VRAM estimada** según tier:
  - `UD-Q2_K_XL` (~12 GB): 16 GB VRAM, o 6 GB VRAM con offload parcial.
  - `UD-IQ3_XXS` (~13 GB): 16 GB VRAM (mejor calidad que Q2 a tamaño similar).
  - `UD-Q3_K_XL` (~16 GB): 16 GB VRAM.
  - `UD-IQ4_XS` (~17 GB): 24 GB VRAM (deja más espacio para contexto).
  - `UD-Q4_K_S` (~20 GB): 24 GB VRAM.
  - `UD-Q4_K_XL` (~22 GB): 24 GB VRAM (recomendado por el autor).
  - `UD-Q5_K_XL` (~25 GB): 32 GB VRAM.
  - `UD-Q6_K_XL` (~30 GB): 40+ GB VRAM.
  - `UD-Q8_K_XL` (~37 GB): 48+ GB VRAM.
- **GPU recomendadas**: RTX 4070/4080/4090 (16-24 GB), A100 16G/40G, H100 40G/80G.
- **Despliegue**: compatible con llama.cpp, LM Studio, Ollama y cualquier stack basado en llama.cpp.
- **Latencia y throughput**: no se proporcionan datos en la información disponible.

## Comparativa con modelos similares

No se dispone de información de comparación directa con otros modelos en la documentación proporcionada. Sin embargo, el modelo base pertenece a la familia `qwen35moe`, por lo que es razonable compararlo con cuantizaciones de modelos como Qwen3.5-35B-A3B o Qwen3.6-35B-A3B (ambos mencionados en la model card como referencia de arquitectura). No hay datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Pérdida de precisión**: las cuantizaciones de baja precisión (Q2, IQ3) pueden degradar la calidad de generación en comparación con el modelo BF16 original.
- **Sin datos de sesgo**: no se ha evaluado ni documentado sesgo del modelo base ni de la cuantización.
- **Riesgo de alucinación**: no se proporcionan datos específicos, pero es inherente a modelos de lenguaje generativos.
- **Limitaciones de contexto**: la longitud de contexto no se especifica; los tiers más pequeños dejan menos espacio para contexto, lo que puede limitar aplicaciones de ventana larga.
- **Eliminación del bloque MTP**: aunque el autor demuestra que no afecta a la salida, cualquier usuario que espere usar la funcionalidad de predicción multi-token no la tendrá disponible.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero hay que verificar la licencia del modelo base (MIT según la model card, pero no se detalla en los resultados de búsqueda).
- **No es una versión oficial de Unsloth**: el autor aclara que es una reproducción independiente, no respaldada por Unsloth. Si Unsloth publica una versión oficial, se recomienda usar esa.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/peculiar-ragdoll/Unsloth-Ornith-1.5-35B-A3B
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Versión con MTP (bloque incluido): https://huggingface.co/peculiar-ragdoll/Unsloth-Ornith-1.5-35B-A3B-MTP
- Referencia de Unsloth Dynamic GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
