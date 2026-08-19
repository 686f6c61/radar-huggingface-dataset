# nm-testing/Qwen3-30B-A3B-NVFP4-AWQ-e2e

## Resumen

El modelo `nm-testing/Qwen3-30B-A3B-NVFP4-AWQ-e2e` es un checkpoint de la familia Qwen3 con arquitectura de mezcla de expertos (MoE), que según su nomenclatura combina 30 mil millones de parámetros totales con 3 mil millones de parámetros activos por token. El sufijo `NVFP4-AWQ` indica que ha sido sometido a un proceso de cuantización mixta (NVFP4 de NVIDIA y AWQ), orientado a reducir el uso de memoria y acelerar la inferencia en hardware compatible. El repositorio pertenece al espacio `nm-testing`, lo que sugiere que se trata de una versión experimental o de pruebas, no un lanzamiento oficial de Qwen.

A pesar de que el modelo acumula 462 descargas, la ficha en HuggingFace es extremadamente parca: no se especifican licencia, idiomas soportados, pipeline ni detalles de entrenamiento. El tamaño del repositorio (542.9 GB) es desproporcionadamente grande para un modelo de 30B, lo que indica que probablemente contiene múltiples formatos de pesos o checkpoints adicionales. Dada la falta de documentación, cualquier uso en producción debe considerarse de alto riesgo y requeriría una validación exhaustiva previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3 (inferida del nombre y tags) |
| Parametros totales | 30.532.122.624 (30.5B) |
| Parametros activos | 3B (inferido del sufijo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 + AWQ (inferido del nombre) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. El nombre y los tags (`qwen3_moe`, `compressed-tensors`) apuntan a un modelo de la serie Qwen3 con diseño MoE, donde solo una fracción de los parámetros se activa por token (3B de 30.5B). La cuantización NVFP4 (punto flotante de 4 bits de NVIDIA) combinada con AWQ (Activation-aware Weight Quantization) sugiere que el checkpoint ha sido optimizado para inferencia en GPUs modernas con soporte FP4, aunque no se especifican los detalles de calibración ni el dataset usado para dicha cuantización.

Al tratarse de un repositorio de pruebas (`nm-testing`), es probable que el modelo sea un artefacto intermedio de un pipeline de evaluación o compresión, no un modelo final pulido. No hay evidencia de entrenamiento con RLHF, DPO ni otras técnicas de alineación, y no se han publicado detalles sobre el corpus de entrenamiento, el número de tokens o las fases de pre-entrenamiento y ajuste fino.

## Capacidades

- No se han documentado capacidades específicas en la ficha de HuggingFace.
- Por su pertenencia a la familia Qwen3, es plausible que herede capacidades de generación de texto, razonamiento, código y multilingüismo, pero esto no está confirmado para este checkpoint concreto.
- El tag `compressed-tensors` sugiere que el modelo está preparado para ser cargado con librerías que soporten tensores comprimidos, como `compressed-tensors` de Neural Magic.
- No se indica soporte para tool calling, agentes, visión, audio ni modos de razonamiento extendido.

## Casos de uso

- Evaluación de técnicas de cuantización: el checkpoint puede servir como banco de pruebas para comparar la degradación de rendimiento entre cuantizaciones NVFP4/AWQ y el modelo original en tareas de generación de texto.
- Investigación sobre eficiencia de MoE: al tener 30B totales y 3B activos, permite estudiar el equilibrio entre calidad y coste computacional en arquitecturas de mezcla de expertos.
- Desarrollo de pipelines de inferencia con FP4: si se dispone de hardware compatible (por ejemplo, GPUs NVIDIA Blackwell), puede usarse para validar el soporte de librerías como vLLM o TensorRT-LLM con pesos NVFP4.
- Pruebas de compresión de modelos: el repositorio, con su gran tamaño, podría contener múltiples versiones del modelo en distintos formatos, útil para investigar el impacto del almacenamiento y la carga.
- Benchmarking de frameworks de inferencia: dado su formato de pesos safetensors y compresión, puede emplearse para medir el throughput y la latencia en distintas herramientas de despliegue.
- Validación de calidad en tareas de lenguaje: si se logra cargar correctamente, podría evaluarse en tareas estándar como MMLU, HumanEval o GSM8K para comprobar si la cuantización mantiene la precisión esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint concreto. Tampoco se proporcionan comparativas con el modelo Qwen3-30B-A3B original o con otras variantes cuantizadas.

## Requisitos de hardware

- VRAM estimada: un modelo de 30.5B parámetros cuantizado a 4 bits ocuparía aproximadamente 15-16 GB en memoria (30.5B × 0.5 bytes/parámetro), pero al ser MoE con solo 3B activos, la memoria necesaria para activaciones y KV cache depende de la longitud de contexto, que no se especifica.
- GPU recomendadas: para cargar los pesos en FP4 se requiere hardware con soporte nativo para ese formato, como las GPUs NVIDIA de la serie Blackwell (B100, B200) o, en su defecto, GPUs Ampere o Ada con emulación de FP4 mediante kernels específicos.
- En GPUs de consumo (RTX 4090 con 24 GB) podría caber el modelo en memoria si se usa una cuantización mixta y se limita la longitud de contexto, pero no hay garantías.
- Opciones de despliegue: al ser un checkpoint de prueba, no se ha validado su compatibilidad con vLLM, llama.cpp, Ollama o TGI. Se recomienda probar con librerías que soporten `compressed-tensors`, como la propia biblioteca de Neural Magic o versiones recientes de vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B (original, no cuantizado) | 30.5B | 3B | no disponible | Apache 2.0 (según versión oficial) | HuggingFace oficial |
| nm-testing/Qwen3-30B-A3B-NVFP4-AWQ-e2e | 30.5B | 3B | no disponible | no disponible | Repositorio de pruebas |
| Qwen3-32B (denso, si existe) | 32B | 32B | no disponible | no disponible | no confirmado |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que no hay benchmarks publicados para el checkpoint analizado.

## Limitaciones y advertencias

- Modelo experimental: alojado en un espacio de pruebas (`nm-testing`), sin documentación ni garantías de estabilidad o corrección.
- Licencia desconocida: no se especifica la licencia, por lo que no se puede determinar si es apto para uso comercial o académico. Se debe contactar con el autor antes de cualquier uso.
- Riesgo de alucinación y sesgos: al no haber información sobre el entrenamiento ni la alineación, el modelo puede producir contenido inexacto o sesgado, especialmente si se usa sin supervisión.
- Cuantización agresiva: la combinación NVFP4 + AWQ puede degradar la calidad de las respuestas en tareas complejas de razonamiento o generación de código, aunque no se han medido los efectos.
- Contexto limitado: se desconoce la longitud máxima de contexto soportada, lo que impide planificar su uso en aplicaciones que requieran ventanas largas.
- Repositorio pesado: con 542.9 GB, la descarga y el almacenamiento son costosos, y no está claro si todos los archivos son necesarios para la inferencia.
- Falta de soporte: al ser un modelo de prueba, no hay canal de soporte ni mantenimiento activo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nm-testing/Qwen3-30B-A3B-NVFP4-AWQ-e2e
