# Prannesshkva/Phantom-Jamba-398B

## Resumen

El repositorio Prannesshkva/Phantom-Jamba-398B se presenta como la distribución de un modelo de lenguaje de 400 mil millones de parámetros, de arquitectura híbrida Transformer-Mamba con mezcla de expertos (MoE), que integra un motor de aceleración llamado `phantom-cache` para eliminar el cuello de botella de prefill en contextos de 256.000 tokens. El autor, Prannesshkva, lo describe como un derivado de AI21 Jamba-1.5 con optimizaciones de caché de prefijos y cuantización INT8 dinámica del estado recurrente.

Sin embargo, los datos reales del repositorio contradicen esta descripción: el archivo safetensors contiene solo 29.778.784 parámetros (aproximadamente 30 millones, no 398 mil millones) y el tamaño total del repositorio es de 0,1 GB. Un modelo de 398B en bfloat16 ocuparía varios cientos de gigabytes. Esto sugiere que el repositorio contiene un modelo placeholder o una versión reducida, no el modelo de 400B que se anuncia. La relevancia de esta ficha reside en documentar esta discrepancia y proporcionar los datos verificables disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Transformer-Mamba (SSM) con MoE, según la model card |
| Parametros totales | 29.778.784 (según safetensors); la model card afirma 398B, pero el peso real no lo respalda |
| Parametros activos | no disponible (la model card no especifica el número de activos) |
| Longitud de contexto | 256.000 tokens (según la model card) |
| Tipos de cuantizacion | INT8 dinámica (mencionada en la model card para el estado recurrente) |
| Idiomas soportados | en (inglés) |
| Licencia | jamba-open-model-license (AI21 Jamba Open Model License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según la model card, el modelo se basa en la arquitectura Jamba de AI21, que combina bloques de Transformer con bloques de Mamba (state space model) y capas de mezcla de expertos. Esta combinación busca ofrecer el rendimiento de los Transformers y la eficiencia en contexto largo de los SSM. El autor añade un componente llamado `phantom-cache`, descrito como un sistema de caché de prefijos por radix y cuantización INT8 del estado recurrente, que reduciría el uso de memoria en un 75% y permitiría reanudar prefijos de 50.000 tokens en menos de 1 ms.

No se proporciona información sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni uso de RLHF o DPO. Tampoco hay detalles sobre la implementación real del modelo en el repositorio, ya que el peso descargado es de solo 30 millones de parámetros, incompatible con la arquitectura de 398B declarada. El código personalizado (`trust_remote_code=True`) está presente, pero no se han verificado sus contenidos.

## Capacidades

Según la model card, el modelo ofrecería las siguientes capacidades:

- Generación de texto con contexto nativo de 256.000 tokens, capaz de procesar repositorios de código completos o corpus legales en una sola pasada.
- Reanudación de prefijos compartidos de más de 50.000 tokens en menos de 1 ms gracias al sistema `phantom-cache`.
- Reducción del 75% en el uso de memoria del estado recurrente mediante cuantización INT8 dinámica.
- Sin dependencias externas más allá de `torch` y `transformers`.

No hay evidencia verificable de soporte de tool calling, agentes, razonamiento multi-paso, visión o audio. El idioma declarado es únicamente inglés.

## Casos de uso

Dado que el contenido real del repositorio no coincide con el modelo de 398B anunciado, los casos de uso que se indican a continuación son hipotéticos, basados en lo que el autor afirma en la model card, y solo serían aplicables si el modelo completo estuviera efectivamente disponible:

- Procesamiento de documentación técnica empresarial extensa: el contexto de 256K tokens permitiría incluir manuales completos en una sola consulta, aunque no hay evidencia de que el modelo real tenga esa capacidad.
- Análisis de repositorios de código de gran tamaño: con la ventana de contexto declarada, se podría solicitar al modelo una revisión arquitectónica de un proyecto completo.
- Búsqueda semántica sobre corpus legales o científicos: la caché de prefijos aceleraría consultas repetidas sobre el mismo corpus.
- Asistencia en entornos con restricciones de memoria: la cuantización INT8 del estado recurrente reduciría el consumo de VRAM en despliegues multi-usuario.
- Integración en pipelines de generación de informes con contexto largo: por ejemplo, resúmenes de actas o expedientes extensos.
- Experimentación académica con arquitecturas híbridas SSM-MoE: el código personalizado podría servir como referencia para estudiar el enfoque de caché, aunque no como modelo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Tampoco hay comparaciones con modelos similares. Los únicos datos de rendimiento mencionados (0 ms de reanudación de prefijo, 8,5 segundos ahorrados por turno) provienen de las afirmaciones del autor y no están respaldados por mediciones independientes.

## Requisitos de hardware

Dado el tamaño real del repositorio (0,1 GB, ~30M de parámetros), el modelo contenido en safetensors cabría en cualquier GPU moderna con 2-4 GB de VRAM, incluso en una tarjeta de consumo como una RTX 3060. Sin embargo, si se tratara del modelo de 398B declarado, los requisitos serían muy diferentes:

- VRAM estimada para inferencia: un modelo de 398B en bfloat16 requeriría aproximadamente 800 GB de VRAM, lo que obligaría a usar múltiples GPU (por ejemplo, 8x H100 de 80 GB o 8x A100 de 80 GB).
- Con cuantización INT8, el requisito bajaría a unos 400 GB, todavía fuera del alcance de una GPU de consumo.
- Opciones de despliegue: para el modelo real (si existiera), serían necesarios vLLM, TensorRT-LLM o TGI con sharding multi-GPU. Para el contenido real del repositorio, bastaría con transformers en una sola GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phantom-Jamba-398B (repo real) | 29,8M | 256K (declarado) | Híbrida SSM-MoE (declarado) | Jamba Open | Repo con peso diminuto, no coincide con lo declarado |
| AI21 Jamba-1.5 Large | 398B totales, 94B activos | 256K | Transformer-Mamba MoE | Jamba Open | Disponible en HuggingFace, pesos verificados |
| AI21 Jamba-1.5 Mini | 52B totales, 12B activos | 256K | Transformer-Mamba MoE | Jamba Open | Disponible en HuggingFace, pesos verificados |

La comparación directa con Jamba-1.5 Large y Mini es pertinente porque el autor afirma que su modelo deriva de Jamba-1.5. Sin embargo, el repositorio analizado no contiene los pesos de un modelo de 398B, por lo que no puede considerarse un competidor real de estos modelos verificados.

## Limitaciones y advertencias

- Discrepancia crítica entre lo declarado y el contenido real: la model card anuncia un modelo de 398B, pero el safetensors contiene solo ~30M de parámetros y el repositorio pesa 0,1 GB. Esto invalida cualquier uso práctico como modelo de 400B.
- Riesgo de alucinación o de modelo placeholder: es probable que el repositorio sea un experimento o una demostración incompleta, no un modelo funcional de producción.
- Sin benchmarks publicados: no hay ninguna evaluación objetiva que respalde las afirmaciones de rendimiento del autor.
- Licencia: la jamba-open-model-license permite uso comercial con condiciones, pero aplica al modelo base; el código personalizado del repositorio no tiene una licencia claramente definida.
- Idioma limitado: solo inglés declarado.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código no auditado del autor, un riesgo de seguridad en entornos de producción.
- Fecha de creación futura (2026): el repositorio fue creado en agosto de 2026, lo que sugiere que podría ser un artefacto ficticio o mal fechado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Prannesshkva/Phantom-Jamba-398B
- Documentación de Jamba en HuggingFace: https://huggingface.co/docs/transformers/model_doc/jamba
- Página oficial de Jamba (AI21): https://www.ai21.com/jamba/
- Licencia Jamba Open Model: https://assets.ngc.nvidia.com/products/api-catalog/legal/Jamba_Open_Model_License_Agreement.pdf
- DOI del artículo sobre phantom-cache: https://doi.org/10.5281/zenodo.22177116
- DOI adicional: https://doi.org/10.5281/zenodo.22177118
- Space de demostración: https://huggingface.co/spaces/Prannesshkva/Phantom-Samba-Engine
