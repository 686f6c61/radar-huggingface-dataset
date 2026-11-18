# intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-2L

## Resumen

Qwen3.5-397B-A17B-NVFP4-AutoRound-2L es una versión cuantizada del modelo Qwen3.5-397B-A17B, publicada por el equipo de Intel AI (intel-ai) en Hugging Face. Se trata de un artefacto de pesos comprimidos en formato NVFP4 (punto flotante de 4 bits con escalado por bloques, optimizado para hardware NVIDIA Blackwell) generado mediante la técnica AutoRound, que aplica ajuste de redondeo consciente de la cuantización para preservar la precisión del modelo original. El nombre del repositorio indica que se aplicó una configuración de "2L" (dos capas o dos niveles de ajuste, según la convención de AutoRound), y los tags de Hugging Face confirman el uso de `compressed-tensors` y precisión de 8 bits en los metadatos de compresión.

El modelo subyacente es un Mixture-of-Experts (MoE) de la familia Qwen3.5, con 397.000 millones de parámetros totales y 17.000 millones activos por token, lo que lo sitúa en la categoría de modelos de razonamiento y generación de alta capacidad con un coste de inferencia relativamente contenido. La versión cuantizada reduce el peso en disco a 17,7 GB en el repositorio, un dato que debe interpretarse con cautela: los safetensors declarados suman 8.664.511.488 parámetros, una cifra muy inferior a los 397B del nombre, lo que sugiere que el repositorio contiene un subconjunto de tensores (posiblemente capas selectivas o un checkpoint parcial) o que el recuento de parámetros del campo safetensors no refleja el total del modelo.

La relevancia de esta ficha radica en que documenta un ejemplo temprano de cuantización NVFP4 aplicada a un MoE de gran escala mediante AutoRound, una combinación pensada para desplegar modelos de 397B en GPUs Blackwell con requisitos de memoria drásticamente reducidos. No obstante, la información pública disponible es muy limitada: no se declaran licencia, idiomas, pipeline ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`) |
| Parametros totales | 397B (según nombre); 8.664.511.488 según metadatos safetensors (discrepancia no resuelta) |
| Parametros activos | 17B (según nombre A17B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, escalado por bloques) con AutoRound; metadatos `compressed-tensors` y `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors) |
| Tamano del repositorio | 17,7 GB |
| Fecha de creacion | 2026-11-13 |
| Ultima actualizacion | 2026-11-18 |
| Descargas | 44 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos (MoE), tal como indica el tag `qwen3_5_moe` y la nomenclatura A17B (17.000 millones de parámetros activos sobre 397.000 millones totales). Esta configuración implica que cada token activa únicamente una fracción de los expertos, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o aprendizaje por refuerzo con verificación.

La innovación técnica principal de esta publicación no está en el modelo base, sino en el proceso de cuantización: AutoRound es un método de cuantización post-entrenamiento que optimiza los parámetros de redondeo mediante descenso de gradiente, minimizando el error de reconstrucción de las activaciones. Aplicado a NVFP4, un formato de 4 bits con escalas compartidas por bloques diseñado para las unidades tensor de las GPUs Blackwell, permite almacenar pesos en 4 bits manteniendo una precisión cercana a la del modelo original. El sufijo "2L" sugiere una variante de dos niveles o dos capas de ajuste dentro del pipeline de AutoRound, aunque no se documenta su significado exacto en la información disponible. Tampoco se detalla si la cuantización cubre solo pesos o también activaciones, ni qué capas quedaron excluidas del proceso.

## Capacidades

- Generación de texto y razonamiento de alta capacidad, heredadas del modelo base Qwen3.5-397B-A17B (no verificadas en esta versión cuantizada).
- Razonamiento multi-paso y modo "thinking" presumible por la familia Qwen3.5, aunque no confirmado en la información disponible.
- Generación de código y matemáticas, capacidades típicas de la familia Qwen, no verificadas en este checkpoint.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades de visión o audio: no disponible.
- Despliegue eficiente en hardware NVIDIA Blackwell gracias al formato NVFP4.

## Casos de uso

- Despliegue de un MoE de 397B en infraestructura Blackwell: la cuantización NVFP4 reduce el peso de los pesos a 4 bits, permitiendo servir el modelo en nodos con menos memoria que la requerida por BF16, siempre que se valide la calidad tras la cuantización.
- Investigación en cuantización de MoE a gran escala: este checkpoint sirve como referencia para estudiar el impacto de AutoRound con NVFP4 en modelos con enrutamiento de expertos, comparando perplejidad y precisión frente al modelo original.
- Evaluación de pipelines de compresión con `compressed-tensors`: útil para equipos que integran esta librería en sus flujos de despliegue y necesitan un artefacto real de gran tamaño para probar la carga y la inferencia.
- Prototipado de asistentes de razonamiento en entornos con GPUs Blackwell: si se confirma el modo thinking del modelo base, podría emplearse para tareas de análisis y planificación, previa validación de la calidad tras la cuantización.
- Benchmarking de latencia y throughput en NVFP4: permite medir el rendimiento real de kernels FP4 en GPUs de nueva generación frente a alternativas en FP8 o BF16.
- Base para ajuste fino ligero (LoRA) sobre pesos cuantizados: si el ecosistema lo soporta, podría emplearse para adaptar el modelo a dominios concretos sin desplegar la versión completa en precisión alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de perplejidad, ni comparaciones con el modelo base en BF16 o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 17,7 GB, pero los metadatos safetensors declaran 8.664.511.488 parámetros, lo que a 4 bits equivaldría a unos 4,3 GB de pesos; la discrepancia con el nombre de 397B impide dar una cifra fiable. Si el modelo completo tuviera 397B en NVFP4, los pesos ocuparían aproximadamente 198 GB, más overhead de escalas y activaciones.
- GPUs recomendadas: hardware NVIDIA Blackwell (B200, GB200) por el soporte nativo de NVFP4; no se garantiza funcionamiento en arquitecturas anteriores sin emulación.
- GPU de consumo: no disponible; con 17,7 GB de repositorio podría caber en una RTX 4090 (24 GB) solo si el checkpoint es parcial, pero no hay confirmación.
- Opciones de despliegue: no se documentan en el repositorio; `compressed-tensors` es compatible con vLLM y TGI en versiones recientes, pero no se confirma soporte para este formato NVFP4 concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-397B-A17B-NVFP4-AutoRound-2L (este) | 397B (nominal) | 17B | no disponible | NVFP4 / AutoRound | no disponible | Hugging Face, 44 descargas |
| Qwen3.5-397B-A17B (base, BF16) | 397B | 17B | no disponible | BF16 | no disponible | Referenciado por el nombre, no verificado |
| Alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de otras cuantizaciones comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La cuantización NVFP4 con AutoRound puede introducir degradación de precisión respecto al modelo en BF16; no se publican métricas que cuantifiquen esa pérdida.
- Discrepancia grave entre el nombre (397B) y los parámetros declarados en safetensors (8,66B): el repositorio podría contener un checkpoint parcial, capas selectivas o un error de metadatos. Debe verificarse antes de cualquier uso en producción.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no declarados: se desconoce el soporte multilingüe real de esta versión.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala, no mitigado por la cuantización.
- Dependencia de hardware Blackwell para aprovechar NVFP4; en GPUs anteriores el rendimiento puede degradarse o el formato no ser soportado.
- Ausencia de benchmarks y de documentación de entrenamiento: no es posible evaluar la calidad ni reproducir el proceso.
- Solo 44 descargas y 0 likes: ecosistema de validación muy limitado, sin reportes de la comunidad sobre su funcionamiento.
- No se documenta el pipeline de inferencia ni la compatibilidad con frameworks concretos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-2L
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este checkpoint.
