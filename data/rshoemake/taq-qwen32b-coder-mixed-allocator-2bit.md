# rshoemake/taq-qwen32b-coder-mixed-allocator-2bit

## Resumen

El modelo `rshoemake/taq-qwen32b-coder-mixed-allocator-2bit` es una cuantización de precisión mixta de 2 bits del modelo base `Qwen/Qwen2.5-Coder-32B-Instruct`, desarrollada por el proyecto TAQ (Tail-Aware Quantization). Se trata de un checkpoint real, empaquetado por bytes y cargable por kernels, que utiliza un asignador automático de precisión por capa (mixed allocator) para seleccionar entre 2, 3 o 4 bits según la sensibilidad de cada capa, dentro de un presupuesto natural de ~2 bits (2,8734 bpw). El objetivo es reducir drásticamente el uso de memoria y acelerar la inferencia manteniendo la mayor fidelidad posible respecto al modelo original.

El modelo está pensado para desarrolladores que necesitan ejecutar un modelo de código de 32B parámetros en hardware limitado, sin renunciar a una calidad razonable en generación de código. Según las evaluaciones publicadas, consigue una perplejidad en WikiText-2 de 20,387 y una divergencia KLD de 0,5063 frente al fp16, mejorando a los baselines uniformes de la misma clase de presupuesto. En tareas de generación de código (HumanEval+ y MBPP+), mantiene una puntuación pass@1 de 0,7988 y 0,6466 respectivamente, con una pérdida de entre 6 y 8 puntos porcentuales frente al modelo sin comprimir.

La relevancia de este checkpoint radica en que no es un scaffold descomprimido, sino pesos reales cuantizados con un formato propietario (archivos `packed/*.bin` con codebooks fp16, índices empaquetados y canal lateral de outliers), acompañado de scripts de desempaquetado. Esto lo diferencia de las cuantizaciones GGUF estándar y lo convierte en una opción para entornos que requieren un control fino sobre la asignación de bits por capa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-32B-Instruct) cuantizado con TAQ |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 128k tokens, pero no se especifica en esta versión) |
| Tipos de cuantizacion | TAQ mixed allocator, 2-bit class (2,8734 bpw) con capas a 2/3/4 bits |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato personalizado TAQ: `packed/*.bin` (header + codebooks fp16 + índices empaquetados + side-channel de outliers) + `fp16_passthrough/*.safetensors` para capas sin cuantizar |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint `Qwen/Qwen2.5-Coder-32B-Instruct`, que sigue la arquitectura estándar de los modelos Qwen2.5-Coder: un transformer decoder-only con atención causal, RMSNorm, y activación SwiGLU. No se ha realizado ningún entrenamiento adicional; el proceso TAQ empaqueta directamente los pesos fp16 originales en un formato comprimido.

La innovación principal reside en el asignador de precisión mixta (mixed allocator), que decide por capa si aplicar 2, 3 o 4 bits, priorizando capas con outliers o con alta sensibilidad a la cuantización. El método incluye técnicas de rotación de outliers y un canal lateral para preservar valores extremos. El resultado es un checkpoint con 2,8734 bits por peso, ligeramente superior al presupuesto nominal de 2 bits, pero con mejor fidelidad que los baselines uniformes de la misma clase (KLD 0,5063 frente a 0,6211 del mejor uniforme). No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de calibración utilizado para la cuantización.

## Capacidades

- Generación de código en múltiples lenguajes (heredada del modelo base Qwen2.5-Coder-32B-Instruct), con soporte para completado, generación de funciones y explicación de código.
- Razonamiento y resolución de problemas de programación, evaluado con HumanEval+ y MBPP+ (pass@1).
- Capacidad de seguir instrucciones en lenguaje natural, típica de los modelos instruct afinados.
- No se especifican capacidades adicionales como tool calling, agentes o visión en esta versión cuantizada.
- El formato de cuantización permite cargar el modelo en entornos con memoria reducida, aunque requiere kernels específicos para el formato TAQ.

## Casos de uso

- Despliegue de un asistente de código en entornos con VRAM limitada (por ejemplo, GPUs consumer de 12-16 GB) gracias a la compresión a ~2 bits.
- Generación de código en pipelines de CI/CD para autocompletar o generar tests, con una pérdida de rendimiento aceptable frente al modelo fp16.
- Prototipado rápido de aplicaciones de programación asistida en laptops o estaciones de trabajo sin GPUs de gama alta.
- Investigación sobre cuantización de precisión mixta: el repositorio incluye scripts de desempaquetado y manifiestos que permiten analizar la asignación de bits por capa.
- Evaluación comparativa de calidad de cuantización frente a baselines uniformes (outlier 2-bit, rotation outlier 2-bit) y frente a GGUF Q4_K_M.
- Uso como punto de partida para experimentos de compresión adicional o para estudiar el impacto de la cuantización en tareas de generación de código.

## Benchmarks y rendimiento

Se han publicado resultados de fidelidad (WikiText-2) y de generación de código (HumanEval+ y MBPP+) en la model card. Los datos se presentan a continuación, comparando este checkpoint con los baselines uniformes de la misma clase de presupuesto y con el modelo fp16 de referencia.

| Métrica | mixed_allocator_2bit (este) | outlier_2bit | rotation_outlier_2bit | fp16 (referencia) |
|---|---|---|---|---|
| bpw | 2,8734 | 2,8639 | 2,8734 | 16 |
| PPL WikiText-2 | 20,387 | 22,193 | 21,597 | 11,9266 |
| KLD vs fp16 | 0,5063 | 0,6305 | 0,6211 | 0 |
| HumanEval Base (pass@1) | 0,8659 | 0,8598 | 0,8841 | 0,9024 |
| HumanEval Base+Extra | 0,7988 | 0,7988 | 0,8049 | 0,8598 |
| MBPP Base | 0,7845 | 0,7769 | 0,7519 | 0,8647 |
| MBPP Base+Extra | 0,6466 | 0,6566 | 0,6391 | 0,7268 |

Además, se menciona una cuantización GGUF Q4_K_M (Unsloth) con mejores resultados (HumanEval Base+Extra 0,8293, MBPP Base+Extra 0,7293), pero no es directamente comparable por no estar igualada en bits por peso.

## Requisitos de hardware

- Tamaño estimado de los pesos cuantizados: aproximadamente 11,8 GB (cálculo teórico: 32.763.876.352 parámetros × 2,8734 bits / 8). No se indica el tamaño exacto en la documentación.
- VRAM necesaria para inferencia: no disponible oficialmente, pero por el cálculo anterior cabría en GPUs con 12-16 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, etc.).
- GPU recomendadas: no se especifican, pero por el tamaño, es viable en GPUs consumer de gama media-alta y en GPUs de datacenter como A10, A100 o H100.
- Opciones de despliegue: el formato TAQ es propietario y requiere kernels específicos; no es compatible directamente con vLLM, llama.cpp u Ollama sin adaptaciones. Se proporcionan scripts de desempaquetado (`unpack_outlier.py`, `unpack_rotation_outlier.py`) para convertir a pesos estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa más relevante es con el modelo base fp16 y con las variantes uniformes de la misma familia de cuantización. No se dispone de comparaciones con otros modelos de 32B cuantizados a 2 bits de otros proveedores.

| Modelo | Parámetros | bpw | PPL WikiText-2 | HumanEval+ pass@1 | Licencia |
|---|---|---|---|---|---|
| Este checkpoint | 32,76B | 2,8734 | 20,387 | 0,7988 | Apache-2.0 |
| Qwen2.5-Coder-32B-Instruct (fp16) | 32,76B | 16 | 11,9266 | 0,8598 | Apache-2.0 |
| TAQ outlier_2bit | 32,76B | 2,8639 | 22,193 | 0,7988 | Apache-2.0 |
| TAQ rotation_outlier_2bit | 32,76B | 2,8734 | 21,597 | 0,8049 | Apache-2.0 |

## Limitaciones y advertencias

- La cuantización a 2 bits introduce una degradación notable en la calidad de generación: la pérdida en HumanEval+ y MBPP+ es de 6 y 8 puntos porcentuales respectivamente frente al fp16.
- El formato de pesos es propietario y no está soportado por los runners estándar (llama.cpp, vLLM, TGI). Se requiere desarrollo adicional para integrarlo en producción.
- No se han realizado pruebas de significancia estadística (bootstrap) para confirmar la superioridad del mixed allocator frente a los baselines uniformes.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de esta versión cuantizada.
- El repositorio tiene solo 11 descargas y 0 likes, lo que indica una adopción muy limitada y poca validación externa.
- La licencia Apache-2.0 permite uso comercial, pero el formato y los scripts asociados pueden tener restricciones adicionales no documentadas.
- El tamaño del repositorio (65,5 GB) es considerablemente mayor que el de los pesos cuantizados, debido a la inclusión de archivos de soporte y capas passthrough.

## Enlaces

- Repositorio HuggingFace: [rshoemake/taq-qwen32b-coder-mixed-allocator-2bit](https://huggingface.co/rshoemake/taq-qwen32b-coder-mixed-allocator-2bit)
- Modelo base: [Qwen/Qwen2.5-Coder-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct)
- Repositorio hermano con documentación del formato: [rshoemake/taq-qwen14b-unsloth-matched](https://huggingface.co/rshoemake/taq-qwen14b-unsloth-matched)
- Repos hermanos de la familia 4-bit: `rshoemake/taq-qwen32b-coder-{outlier,rotation-outlier,mixed-allocator}-4bit` (no enlazados directamente en la información proporcionada)
