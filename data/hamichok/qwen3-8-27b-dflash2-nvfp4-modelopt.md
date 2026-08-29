# hamichok/Qwen3.8-27B-DFlash2-NVFP4-modelopt

## Resumen

Este repositorio contiene una re-cuantización del modelo *draft* **DFlash2** de `incoai/Qwen3.8-27B-DFlash2` a formato **modelopt-NVFP4**, creada por el usuario `hamichok` con el objetivo de que **sglang** pueda cargarlo como modelo especulativo durante la decodificación DFLASH. El problema que resuelve es que la variante NVFP4 del upstream (basada en compressed-tensors) no carga correctamente en sglang; esta versión, construida con la herramienta `quantize-dflash2.py`, sí lo hace.

El modelo es un componente auxiliar dentro de un sistema de decodificación especulativa: no genera texto por sí mismo, sino que predice tokens en paralelo para acelerar la inferencia del modelo principal `Qwen3.8-27B` (cuya versión cuantizada se sirve con `hamichok/Qwen3.8-27B-NVFP4-RTX5090-LMHead4`). Según los datos disponibles, DFlash2 ofrece una aceleración cercana a 3× respecto a la decodificación autoregresiva convencional, manteniendo la misma salida. Este drafter está pensado para entornos con GPUs NVIDIA de arquitectura Blackwell (RTX 5090) o DGX Spark (GB10), y su tamaño de repositorio es de 1,8 GB.

La relevancia actual radica en la creciente adopción de decodificación especulativa para reducir la latencia en modelos grandes sin pérdida de calidad, especialmente en despliegues con recursos limitados como estaciones de trabajo con una sola GPU. La licencia Apache-2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo auxiliar tipo *draft* para decodificación especulativa) |
| Parametros totales | no disponible (el nombre del modelo base sugiere 27B, pero no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo principal, que soporta hasta 262K según recetas publicadas) |
| Tipos de cuantizacion | NVFP4 (modelopt), con capas `o_proj` y MLP cuantizadas; `fc` y q/k/v se mantienen densos |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors, pero no se especifica en la documentación) |

## Arquitectura y entrenamiento

El modelo es una re-cuantización del drafter **DFlash2** original de `incoai/Qwen3.8-27B-DFlash2` (en BF16). DFlash2 es un *parallel drafter* diseñado para decodificación especulativa por bloques (block-diffusion speculative decoding), que predice múltiples tokens de forma paralela y permite al modelo principal verificar y aceptar o rechazar esas predicciones. La cuantización se realizó con la herramienta `quantize-dflash2.py` (licencia Apache-2.0) y no implica entrenamiento adicional; solo se transformaron los pesos al formato NVFP4 de NVIDIA ModelOpt.

Una característica técnica destacable es que la cuantización preserva las capas `fc` y q/k/v en precisión completa (densas), mientras que cuantiza `o_proj` y las proyecciones del MLP. Esto se hizo para cumplir con las comprobaciones de forma del cargador `dflash.py` de sglang, que espera `fc.weight` como denso. El resultado es un drafter que sglang puede cargar con `--speculative-draft-model-quantization modelopt_fp4`, a diferencia de la variante compressed-tensors del upstream que falla.

No se dispone de información sobre el proceso de entrenamiento del drafter original (datos, tokens, métodos de alineación), ya que la documentación proporcionada solo cubre la re-cuantización.

## Capacidades

- **Decodificación especulativa**: actúa como modelo *draft* para acelerar la inferencia del modelo principal `Qwen3.8-27B` mediante el esquema DFLASH de sglang.
- **Compatibilidad con sglang**: cargable a través de `--speculative-draft-model-path` y `--speculative-draft-model-quantization modelopt_fp4`.
- **Verificación con modelo principal cuantizado**: funciona correctamente con checkpoints que tienen el `lm_head` cuantizado, algo que rompe el esquema DSPARK pero no DFLASH.
- **Integración con razonamiento y tool calls**: según recetas publicadas, el sistema completo (modelo principal + drafter) soporta razonamiento paso a paso, llamadas a herramientas estructuradas y múltiples solicitudes concurrentes.
- **No es un modelo de generación independiente**: no puede usarse para generar texto por sí solo; requiere el modelo principal y el motor sglang.

## Casos de uso

- **Despliegue de Qwen3.8-27B en estaciones de trabajo con una GPU**: permite servir el modelo principal cuantizado en NVFP4 en una RTX 5090 o DGX Spark, reduciendo la latencia gracias a la decodificación especulativa. Se usa con sglang y la configuración `--speculative-dflash-block-size 6` (punto de máximo throughput medido).
- **Inferencia de baja latencia para chatbots y asistentes**: al acelerar la generación, el sistema es adecuado para aplicaciones interactivas donde la respuesta debe ser casi inmediata, como asistentes virtuales o copilotos de código.
- **Servicio de API compatible con OpenAI**: las recetas publicadas incluyen parches para que el endpoint `/v1/responses` sea totalmente compatible con la API de OpenAI, permitiendo integrar el modelo en aplicaciones existentes sin cambios.
- **Procesamiento de contexto largo**: el modelo principal soporta hasta 262K tokens de contexto (según la receta de GitHub), lo que habilita casos de uso como análisis de documentos extensos o conversaciones de muchas vueltas. El drafter acelera la generación en estos escenarios.
- **Razonamiento y tool calling**: el sistema completo soporta razonamiento paso a paso y llamadas a herramientas, útil para agentes autónomos que necesitan planificar y ejecutar acciones.
- **Entornos de investigación y experimentación**: al ser un componente Apache-2.0, puede usarse como referencia para estudiar técnicas de decodificación especulativa o para construir variantes cuantizadas de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este drafter cuantizado en la información disponible. Sin embargo, el foro de NVIDIA menciona que DFlash2 (el drafter original) alcanza cerca de 3× la velocidad de la decodificación autoregresiva, con la misma salida. Este dato corresponde al drafter en BF16, no a esta versión NVFP4, por lo que debe interpretarse con cautela. No se dispone de mediciones de throughput o latencia para esta re-cuantización concreta.

## Requisitos de hardware

- **VRAM estimada**: el tamaño del repositorio es de 1,8 GB, lo que sugiere que los pesos del drafter ocupan aproximadamente esa cantidad en disco. En memoria, la VRAM adicional sobre el modelo principal será similar, pero no se especifica el valor exacto.
- **GPU recomendadas**: el modelo está etiquetado con `rtx5090` y las recetas mencionan DGX Spark (GB10). Está diseñado para GPUs NVIDIA con soporte NVFP4 (arquitectura Blackwell), como la RTX 5090 o el GB10.
- **No cabe en GPUs consumer antiguas**: las GPUs de generaciones anteriores (Ampere, Ada) no soportan NVFP4, por lo que no son compatibles.
- **Opciones de despliegue**: requiere **sglang** como motor de inferencia, con la configuración específica de `--speculative-draft-model-path` y `--speculative-draft-model-quantization modelopt_fp4`. No se mencionan alternativas como vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: no hay datos publicados para esta versión cuantizada. La receta del foro indica que con dos DGX Spark en configuración tensor-parallel (TP=2) se obtiene ~1,6× más velocidad que con una sola.

## Comparativa con modelos similares

| Modelo | Formato | Compatibilidad sglang | Aceleración | Licencia |
|---|---|---|---|---|
| `incoai/Qwen3.8-27B-DFlash2` (BF16) | BF16 | Sí (original) | ~3× (según foro) | Apache-2.0 |
| `hamichok/Qwen3.8-27B-DFlash2-NVFP4-modelopt` (este) | NVFP4 (modelopt) | Sí (re-cuantizado para sglang) | No medido | Apache-2.0 |
| Variante compressed-tensors NVFP4 del upstream | NVFP4 (compressed-tensors) | No carga en sglang | - | Apache-2.0 |

La comparativa se limita a las variantes del mismo drafter, ya que no se dispone de información sobre otros modelos *draft* comparables (por ejemplo, los de z-lab o RadixArk) en cuanto a rendimiento o requisitos.

## Limitaciones y advertencias

- **Modelo auxiliar**: no puede generar texto por sí mismo; requiere el modelo principal `Qwen3.8-27B` y el motor sglang con DFLASH.
- **Dependencia de hardware específico**: exige GPUs con soporte NVFP4 (Blackwell). No funcionará en GPUs más antiguas.
- **Riesgo de degradación por cuantización**: aunque se mantienen densas las capas `fc` y q/k/v, la cuantización NVFP4 de `o_proj` y MLP puede afectar la precisión de las predicciones del drafter, lo que podría reducir la tasa de aceptación y, por tanto, la aceleración efectiva.
- **Sesgos y alucinaciones**: al ser un drafter, no tiene sesgos propios, pero el sistema completo hereda los sesgos y limitaciones del modelo principal Qwen3.8-27B, que no se detallan en la documentación proporcionada.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se debe mantener la atribución y los avisos de copyright. No hay restricciones conocidas adicionales.
- **Falta de documentación sobre el modelo principal**: no se proporcionan detalles sobre el proceso de entrenamiento, datos o alineación del modelo base, lo que limita la evaluación de riesgos éticos y de seguridad.
- **Fecha de creación inusual**: el modelo fue creado en agosto de 2026 (según los metadatos), lo que podría indicar un error en la fecha o un proyecto futuro; no afecta al funcionamiento técnico.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/hamichok/Qwen3.8-27B-DFlash2-NVFP4-modelopt)
- [Modelo principal cuantizado (referenciado en la model card)](https://huggingface.co/hamichok/Qwen3.8-27B-NVFP4-RTX5090-LMHead4)
- [Modelo base original en BF16](https://huggingface.co/incoai/Qwen3.8-27B-DFlash2)
- [Modelo Qwen3.8-27B original (Qwen)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Foro NVIDIA: anuncio de DFlash2](https://forums.developer.nvidia.com/t/qwen-3-8-27b-dflash2/380617)
- [Foro NVIDIA: receta completa para DGX Spark](https://forums.developer.nvidia.com/t/qwen3-8-27b-nvfp4-on-single-dual-dgx-spark-sglang-dflash2-fully-openai-compatible/380732)
- [GitHub: receta para DGX Spark](https://github.com/CharmiUwU/Qwen3.8-27B-DFlash2-DGX-Spark)
