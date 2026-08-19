# jarrelscy/DeepSeek-V4-Pro-0813-NVFP4

## Resumen

El checkpoint `jarrelscy/DeepSeek-V4-Pro-0813-NVFP4` es una cuantización NVFP4 de los **expertos enrutados** del modelo base `deepseek-ai/DeepSeek-V4-Pro-0813`, desarrollada por el usuario jarrelscy. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a reducir el footprint de memoria de un modelo MoE masivo de aproximadamente 1,65 billones de parámetros, manteniendo la atención, los expertos compartidos, la cabeza y el módulo MTP en su precisión nativa.

La relevancia de este checkpoint radica en que es la única versión pública NVFP4 construida sobre la release `0813` del modelo base, a diferencia de otras versiones NVFP4 que usan la base anterior. Utiliza el layout `MIXED_PRECISION` de NVIDIA ModelOpt, lo que lo hace directamente consumible por el path de ModelOpt en vLLM. El proceso de cuantización es *weight-only* y *data-free*, aunque implica una doble cuantización (MXFP4 a NVFP4) que introduce un error medio de requantización de aproximadamente el 4,8% respecto a la fuente ya cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Transformer (DeepSeek-V4-Pro-0813) |
| Parametros totales | 1.650.497.936.906 (~1,65 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (e2m1) para expertos enrutados; precisión nativa para attention, shared experts, head y MTP |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (layout ModelOpt MIXED_PRECISION) |

## Arquitectura y entrenamiento

El checkpoint cuantiza exclusivamente los módulos `ffn.experts` (lineales `w1` gate, `w3` up y `w2` down) de las 61 capas del modelo base. La cuantización sigue el formato NVFP4 de NVIDIA: los pesos se almacenan como `uint8` con empaquetado de dos valores e2m1 por byte (nibble bajo primero), acompañados de una escala de bloque `float8_e4m3` con grupo de 16 elementos y una escala global por tensor `float32`. La dequantización se calcula como `e2m1_val * weight_scale * weight_scale_2`.

El proceso de creación parte de la release `0813`, que ya distribuye los expertos en formato MXFP4 (e2m1 + escalas UE8M0 con grupo de 32), sin que exista un master BF16 en el Hub. Por tanto, este checkpoint realiza una transcodificación MXFP4 a NVFP4: dequantiza a BF16 y requantiza a grupo-16 e4m3. Es un proceso *weight-only* y *data-free*, con un error medio de requantización de aproximadamente el 4,8% medido contra la fuente MXFP4, no contra pesos de precisión completa.

## Capacidades

- Las capacidades funcionales son heredadas del modelo base `deepseek-ai/DeepSeek-V4-Pro-0813`, aunque los detalles concretos (tool calling, multimodalidad, razonamiento avanzado, etc.) no se especifican en la información proporcionada.
- El formato NVFP4 con layout ModelOpt garantiza compatibilidad directa con el path de inferencia de vLLM para checkpoints de NVIDIA.
- Al excluir atención, expertos compartidos, cabeza y MTP de la cuantización, se preserva la calidad de estas partes críticas del modelo.
- Al ser una cuantización de solo pesos, no requiere datos de calibración ni pasos de fine-tuning para su uso.

## Casos de uso

- Despliegue en producción con vLLM: el checkpoint está diseñado para consumirse directamente por el path ModelOpt de vLLM, lo que permite servir el modelo DeepSeek-V4-Pro-0813 en entornos de producción sin necesidad de conversiones adicionales.
- Inferencia en clústeres multi-GPU: al reducir el footprint de memoria de los expertos enrutados, permite ejecutar el modelo en un número menor de GPU de alta gama (H100 o A100) en comparación con el checkpoint original.
- Evaluación de la release 0813 con requisitos reducidos: investigadores pueden evaluar la calidad del modelo base 0813 en tareas específicas sin necesidad de alojar los 941,1 GB del repositorio original en precisión completa.
- Investigación sobre doble cuantización: sirve como caso de estudio para medir el impacto de transcodificar MXFP4 a NVFP4 en la degradación de tareas downstream, dado que el error se acumula sobre una cuantización previa.
- Adaptación eficiente con PEFT/LoRA: aunque es *weight-only*, puede usarse como base para fine-tuning con adaptadores de bajo rango, evitando la actualización de los pesos cuantizados.
- Benchmarking de infraestructura: útil para probar el rendimiento (throughput y latencia) de vLLM con el layout MIXED_PRECISION de ModelOpt en diferentes configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 941,1 GB, lo que indica que el checkpoint requiere un clúster multi-GPU para su carga en memoria.
- Con 1,65 billones de parámetros y cuantización NVFP4 (4 bits) solo en los expertos, se estima una necesidad de VRAM cercana a 1 TB, excluyendo KV cache y activaciones.
- Se recomiendan al menos 12 GPU de 80 GB (por ejemplo, NVIDIA H100 o A100) para alojar los pesos en memoria, siendo necesario añadir más GPU o memoria para la caché de atención y las activaciones durante la inferencia.
- No cabe en GPU de consumo (RTX 4090, etc.) ni en estaciones de trabajo monoprocesador.
- La opción de despliegue confirmada es vLLM con soporte del path ModelOpt. No se dispone de información sobre compatibilidad con llama.cpp, Ollama o TGI.
- No se proporcionan datos de latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Base | Cuantizacion | Tamano del repo | Licencia |
|---|---|---|---|---|
| `jarrelscy/DeepSeek-V4-Pro-0813-NVFP4` | DeepSeek-V4-Pro-0813 | NVFP4 (expertos enrutados) | 941,1 GB | MIT |
| `deepseek-ai/DeepSeek-V4-Pro-0813` | - | MXFP4 (expertos) | no disponible | MIT |
| Otras versiones `DeepSeek-V4-Pro-NVFP4` | DeepSeek-V4-Pro (anterior) | NVFP4 | no disponible | MIT |

La principal diferencia frente a otras versiones NVFP4 públicas es que este checkpoint se construye sobre la release `0813`, mientras que el resto usa la base anterior. Frente al modelo base original, la ventaja es la reducción de memoria en los expertos, a costa de un error de cuantización adicional.

## Limitaciones y advertencias

- Se trata de una doble cuantización (MXFP4 a NVFP4); el error medio de requantización del 4,8% se mide contra la fuente MXFP4, no contra pesos BF16 de precisión completa, por lo que la degradación real frente al modelo original podría ser mayor.
- No existe un master BF16 del modelo base en el Hub, lo que impide comparar directamente contra precisión completa.
- No se han publicado resultados de benchmarks que validen la calidad del modelo cuantizado en tareas estándar.
- La longitud de contexto y los idiomas soportados no están documentados en la información proporcionada.
- Al ser un checkpoint de cuantización, cualquier limitación del modelo base (sesgos, alucinaciones, etc.) se hereda, aunque no se detallan en esta ficha.
- La licencia MIT permite uso comercial sin restricciones aparentes, tanto para el checkpoint como para el modelo base.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/jarrelscy/DeepSeek-V4-Pro-0813-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
