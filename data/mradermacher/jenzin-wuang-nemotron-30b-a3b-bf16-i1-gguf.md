# mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-i1-GGUF

## Resumen

Jenzin-Wuang-Nemotron-30B-A3B-BF16-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo base ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16, publicado por el usuario mradermacher. El modelo base es una modificación experimental del Nemotron-3-Nano-30B-A3B de NVIDIA, que incorpora técnicas etiquetadas como "weight-surgery", "identity-transplant" y "behavioral-modification". Estas técnicas sugieren una alteración deliberada de los pesos del modelo original, posiblemente para cambiar su comportamiento o identidad, aunque no se documentan los detalles técnicos.

Esta versión GGUF está pensada para facilitar la ejecución local con herramientas como llama.cpp u Ollama, ofreciendo varios niveles de cuantización que reducen el tamaño del modelo original (171.7 GB en BF16) a archivos de entre 18 y 22 GB. El modelo base es un MoE de aproximadamente 31.5 mil millones de parámetros totales con 3 mil millones activos, y el original de NVIDIA soporta un contexto de 1 millón de tokens, aunque no se confirma si esta modificación conserva esa capacidad.

Al tratarse de una modificación no documentada y con fines de demostración, su uso en producción no está recomendado. La ficha se basa únicamente en la información disponible en HuggingFace y en los resultados de búsqueda, por lo que muchos datos técnicos del entrenamiento y rendimiento no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) según el modelo base Nemotron-3-Nano-30B-A3B |
| Parametros totales | 31.577.940.288 (dato de safetensors) |
| Parametros activos | 3 mil millones (según nomenclatura A3B, no confirmado para esta modificación) |
| Longitud de contexto | no disponible (el modelo base de NVIDIA tiene 1M, pero no se confirma aquí) |
| Tipos de cuantizacion | i1-Q2_K (18.0 GB), i1-IQ3_M (18.2 GB), i1-Q4_K_S (22.0 GB), además de archivo imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | other (same-as-base, enlace a la licencia de Nemotron-3.5-Lightning-30B-A3B-BF16) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento del modelo base ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16. El nombre y los tags indican que se parte del Nemotron-3-Nano-30B-A3B de NVIDIA, un modelo MoE entrenado desde cero con 30B parámetros totales y 3B activos, con contexto de 1M tokens y capacidades de razonamiento, código y tool calling. Sin embargo, esta versión ha sido sometida a "weight-surgery" (cirugía de pesos), "identity-transplant" (transplante de identidad) y "behavioral-modification" (modificación de comportamiento), lo que implica cambios no especificados en los pesos originales. No hay detalles sobre el dataset, el proceso de modificación ni si se aplicó RLHF o DPO.

La cuantización GGUF con imatrix ha sido realizada por mradermacher, que utiliza el algoritmo de matriz de importancia para mejorar la calidad de los quants de baja precisión. No se proporcionan más detalles técnicos sobre la arquitectura interna o innovaciones.

## Capacidades

No se ha publicado información específica sobre las capacidades de esta modificación. El modelo base Nemotron-3-Nano-30B-A3B de NVIDIA es conocido por:

- Generación de texto y razonamiento multi-step.
- Generación de código y soporte de tool calling / function calling.
- Instrucciones complejas y seguimiento de comandos.
- Contexto largo de hasta 1M tokens (en el modelo original).

Sin embargo, dado que esta versión ha sido modificada experimentalmente, no se garantiza que conserve estas capacidades. Los tags "jblaze", "weight-surgery", "identity-transplant" y "behavioral-modification" sugieren que el comportamiento puede haber sido alterado de forma impredecible. No se recomienda asumir que funciona como el modelo original.

## Casos de uso

Al ser una modificación experimental sin documentación, no hay casos de uso oficiales ni recomendados. Los posibles escenarios serían:

- Investigación sobre modificación de pesos: podría usarse para estudiar cómo afectan las técnicas de "weight-surgery" al comportamiento de un LLM, comparando sus salidas con el modelo original.
- Demostración de cuantización GGUF: sirve como ejemplo de cómo se generan quants con imatrix para un modelo de 30B MoE, útil para desarrolladores que quieran aprender sobre el proceso.
- Pruebas de compatibilidad con motores de inferencia local: se puede ejecutar con llama.cpp u Ollama para verificar que el formato GGUF funciona correctamente, aunque no se espera un rendimiento óptimo.
- Evaluación de robustez: dado que es una modificación, se puede probar si el modelo mantiene coherencia o si produce salidas erráticas, lo que podría interesar a investigadores de seguridad.
- Uso educativo: para ilustrar los riesgos de modificar pesos sin control de calidad.
- No se recomienda su uso en producción, atención al cliente, generación de código real o cualquier tarea que requiera fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para esta modificación. El modelo base de NVIDIA tiene resultados conocidos, pero no se pueden extrapolar a esta versión modificada.

## Requisitos de hardware

Los requisitos dependen del archivo GGUF elegido. Estimaciones basadas en el tamaño de los archivos (asumiendo que la VRAM necesaria es aproximadamente el tamaño del archivo más overhead):

- i1-Q2_K (18.0 GB): requiere al menos 20 GB de VRAM. Puede ejecutarse en GPUs como RTX 3090, RTX 4090 (24 GB) o A6000 (48 GB).
- i1-IQ3_M (18.2 GB): similar al anterior, ~20 GB de VRAM.
- i1-Q4_K_S (22.0 GB): requiere al menos 24 GB de VRAM. Solo en GPUs de 24 GB o más (RTX 3090, RTX 4090, A5000, etc.).
- Para contexto largo (si se conserva 1M), la memoria adicional por KV cache sería considerable, pero no se dispone de datos.

Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. No se recomienda vLLM para GGUF (aunque soporta algunos formatos, es más adecuado para safetensors). La latencia y throughput no están documentados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Como referencia, se puede comparar con el modelo base sin modificar:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Jenzin-Wuang-Nemotron-30B-A3B (esta modificación) | 31.5B | 3B (no confirmado) | no disponible | other | GGUF |
| Nemotron-3-Nano-30B-A3B (NVIDIA) | 30B | 3B | 1M | NVIDIA Open Model License | safetensors, GGUF |
| Qwen2.5-32B-A3B (Alibaba) | 32B | 3B | 128K | Apache 2.0 | safetensors, GGUF |

No hay datos de rendimiento para la modificación, por lo que no se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- Modificación experimental: los tags indican técnicas de alteración de pesos sin documentación. El comportamiento puede ser impredecible, con respuestas incoherentes o dañinas.
- Sesgos y alucinaciones: al ser una modificación no validada, es probable que presente sesgos amplificados o alucinaciones frecuentes.
- Licencia "other": aunque se indica "same-as-base", la licencia exacta no está clara. El enlace apunta a la licencia de Nemotron-3.5-Lightning, que puede tener restricciones de uso comercial. Se debe revisar antes de cualquier uso.
- Idioma: solo se declara inglés. No se garantiza soporte multilingüe.
- Contexto: no se confirma si la ventana de 1M tokens del modelo original se mantiene tras la modificación.
- Sin soporte: el autor no ofrece garantías ni mantenimiento. Es un modelo de demostración.
- Riesgo de seguridad: al ser una modificación de comportamiento, podría generar contenido no deseado o instrucciones maliciosas. No usar en entornos de producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-i1-GGUF
- Modelo base (BF16): https://huggingface.co/ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Lightning-30B-A3B-BF16 (enlace de licencia)
- Página de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b/modelcard
- Quants estáticos (sin imatrix): https://huggingface.co/mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-GGUF
