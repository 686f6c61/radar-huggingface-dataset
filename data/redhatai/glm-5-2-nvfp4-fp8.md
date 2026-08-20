# RedHatAI/GLM-5.2-NVFP4-FP8

## Resumen

RedHatAI/GLM-5.2-NVFP4-FP8 es una versión cuantizada del modelo GLM-5.2 de Z-AI, desarrollada por Red Hat AI. El modelo original es un transformer de mezcla de expertos (MoE) con aproximadamente 743 mil millones de parámetros, de los cuales 39 mil millones se activan por token. Esta variante cuantiza las capas MoE a NVFP4 y las capas de atención a FP8 por bloques, reduciendo significativamente los requisitos de memoria y ancho de banda para su despliegue en producción.

La relevancia de este modelo radica en que permite ejecutar un LLM de escala masiva en infraestructura más modesta, manteniendo un rendimiento cercano al original. Según la evaluación publicada, la pérdida en GPQA-Diamond es de solo 2,1 puntos porcentuales (91,2 frente a 89,1). Está diseñado específicamente para su uso con vLLM, e incorpora el modo de razonamiento "thinking" característico de la serie GLM, así como soporte para tool calling y generación multi-token (MTP) con 5 tokens de draft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con atención por bloques |
| Parametros totales | 424.752.631.524 (cuantizado); ~743B (modelo base) |
| Parametros activos | 39B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (capas MoE), FP8 block (capas de atención) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.2 es un MoE con atención transformer estándar, que emplea Multi-Token Prediction (MTP) extendido a 5 tokens de draft, lo que mejora el rendimiento en tareas de razonamiento, codificación y flujos agénticos. La cuantización se realizó con la librería LLM Compressor de vLLM, utilizando un proceso de calibración one-shot sobre 512 muestras del dataset HuggingFaceH4/ultrachat_200k, con una longitud máxima de secuencia de 2048 tokens. El script de creación está disponible en el repositorio de llm-compressor y el proceso completo tarda aproximadamente 3 horas en 6 GPUs A100 con paralelismo de datos.

La cuantización aplica NVFP4 a las capas MLP (expertos) y FP8 por bloques a las capas de atención, excluyendo las tres primeras capas del modelo, el proyector de pesos del indexador y la cabeza de salida (lm_head), por su sensibilidad a la cuantización. El resultado es un checkpoint comprimido que se sirve directamente con vLLM, requiriendo un parche específico del proyecto vLLM (PR #47780).

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo modo "thinking" para problemas de múltiples pasos.
- Soporte de tool calling y function calling, con parser específico para GLM-4.7.
- Capacidades de agente y razonamiento multi-paso, potenciadas por MTP con 5 tokens de draft.
- Generación de código y resolución de problemas matemáticos, aunque no se han publicado benchmarks específicos en la información disponible.
- Multilingüe: no confirmado en la documentación proporcionada.
- Compatible con despliegue en vLLM con paralelismo tensorial y caché KV en FP8.

## Casos de uso

- Despliegue de un LLM de gran escala en entornos de producción con recursos limitados: la cuantización NVFP4/FP8 reduce la huella de memoria, permitiendo servir el modelo en 4 GPUs con vLLM, como se muestra en el comando de ejemplo.
- Razonamiento avanzado en asistentes de investigación: el modo thinking y la ventana de contexto larga (no especificada, pero típica de la serie GLM) permiten abordar problemas científicos o técnicos complejos con cadenas de razonamiento extensas.
- Automatización de tareas agénticas: con soporte para tool calling y auto-selección de herramientas, puede integrarse en pipelines que requieren interacción con APIs, bases de datos o ejecución de código.
- Generación de código en entornos de desarrollo: su capacidad para producir código y razonar sobre él, junto con MTP, lo hace adecuado para asistentes de programación en IDE o pipelines de CI/CD.
- Análisis de documentos extensos: aunque la longitud de contexto no está documentada, el modelo base GLM-5.2 soporta contextos largos, y esta versión cuantizada mantiene esa capacidad para tareas de resumen o extracción de información.
- Evaluación de modelos y benchmarks: al ser una cuantización de alta fidelidad, puede usarse como sustituto del modelo original en pruebas de rendimiento cuando los recursos de hardware son limitados.

## Benchmarks y rendimiento

| Benchmark | `zai-org/GLM-5.2` | `RedHatAI/GLM-5.2-NVFP4-FP8` |
|---|---|---|
| GPQA-Diamond | 91,2 | 89,1 |

No se han publicado más resultados de benchmarks en la información disponible. La pérdida de rendimiento en GPQA-Diamond es de 2,1 puntos, lo que indica una degradación mínima para una cuantización mixta NVFP4/FP8.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa aproximadamente 1731,6 GB en el repositorio, pero al estar comprimido con NVFP4 y FP8, el peso en memoria durante la inferencia es significativamente menor. Con tensor-parallel-size 4, se necesitan al menos 4 GPUs; asumiendo una distribución uniforme, cada GPU requeriría alrededor de 100-150 GB de VRAM, dependiendo de la longitud de contexto y el tamaño del lote.
- GPUs recomendadas: NVIDIA A100 (80 GB) o H100 (80 GB) en configuraciones de 4 o más unidades. También podría ejecutarse en GPUs consumer de gama alta (RTX 4090 con 24 GB) solo si se reduce el paralelismo tensorial y se limita el contexto, aunque no es recomendable.
- Opciones de despliegue: vLLM es la opción principal y la única documentada. También podría usarse con TGI o llama.cpp si se convierte a GGUF, pero no hay soporte oficial.
- Latencia y throughput: no disponibles en la documentación. Se espera que MTP con 5 tokens de draft mejore el throughput en comparación con modelos sin esta técnica.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| RedHatAI/GLM-5.2-NVFP4-FP8 | 424B (cuantizado) | 39B | no disponible | NVFP4 + FP8 | MIT |
| zai-org/GLM-5.2 (base) | ~743B | 39B | no disponible | BF16, FP8 nativo | MIT |
| nv-community/GLM-5.2-NVFP4 | ~743B | 39B | no disponible | NVFP4 | MIT |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de información sobre alternativas de otros fabricantes en la documentación proporcionada. La principal diferencia entre las versiones cuantizadas es el esquema de cuantización: Red Hat AI combina NVFP4 para MoE y FP8 para atención, mientras que la versión de NVIDIA Community usa NVFP4 de forma más uniforme.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base fue entrenado con datos de internet que pueden contener lenguaje tóxico y sesgos sociales, por lo que puede amplificarlos en sus respuestas.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: la longitud de contexto no está documentada en esta versión cuantizada; se recomienda verificar la del modelo base antes de usarla en aplicaciones que requieran ventanas largas.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base puede tener términos adicionales; se debe revisar la documentación de zai-org/GLM-5.2.
- Requisito de parche en vLLM: el despliegue requiere el PR #47780 de vLLM, que puede no estar disponible en versiones estables; esto limita la portabilidad a otros entornos.
- Idiomas: no se ha confirmado la lista de idiomas soportados; se asume que cubre los principales, pero no es seguro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/GLM-5.2-NVFP4-FP8
- Repositorio de archivos: https://huggingface.co/RedHatAI/GLM-5.2-NVFP4-FP8/tree/main
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Recetas vLLM para GLM-5.2: https://recipes.vllm.ai/zai-org/GLM-5.2
- LLM Compressor (GitHub): https://github.com/vllm-project/llm-compressor
- PR de vLLM requerido: https://github.com/vllm-project/vllm/pull/47780
- Script de ejemplo de cuantización: https://github.com/vllm-project/llm-compressor/pull/2869
