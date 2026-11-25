# Sorihon/Solar-Awakening-26B-A4B

## Resumen

Solar-Awakening-26B-A4B es un modelo de lenguaje multimodal (image-text-to-text) obtenido mediante fusión de pesos (model merge) con mergekit, publicado por el usuario Sorihon en Hugging Face. No se trata de un entrenamiento desde cero, sino de la combinación de dos modelos preentrenados: Gryphe/Gemma-4-26B-A4B-StyleTune-V2 y Sorihon/Radiant-Dawn-26B-A4B, ambos derivados de la familia Gemma 4 de Google con arquitectura de mezcla de expertos (MoE) de 26B parámetros totales y 4B activos, según se deduce de la nomenclatura "26B-A4B" de los modelos base.

El modelo emplea el método de fusión Karcher Mean, una técnica de promediado geométrico de pesos que busca un punto central en la variedad de parámetros de los modelos de origen, preservando mejor las capacidades de cada uno que un simple promedio aritmético. El resultado es un checkpoint en formato safetensors de 53,1 GB con 26.544.133.710 parámetros reales, compatible con transformers y con endpoints de inferencia.

Su relevancia es limitada y experimental: se publicó el 25 de noviembre de 2026, no acumula descargas ni interacciones, y la model card es mínima (solo documenta la configuración YAML de mergekit). Es un artefacto de interés para quienes investigan técnicas de model merging sobre arquitecturas MoE multimodales, no una opción recomendada para producción sin evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Gemma 4 (familia gemma4) |
| Parametros totales | 26.544.133.710 (26,5B) |
| Parametros activos | 4B (según nomenclatura A4B de los modelos base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; compatible con cuantización estándar vía transformers/GGUF, no documentado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Pipeline | image-text-to-text (multimodal) |
| Método de creación | Merge con mergekit, método Karcher Mean |
| Modelos base | Gryphe/Gemma-4-26B-A4B-StyleTune-V2 y Sorihon/Radiant-Dawn-26B-A4B |
| Tamaño del repositorio | 53,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 en su variante MoE de 26B parámetros totales con aproximadamente 4B activos por token, lo que implica un diseño de mezcla de expertos con enrutamiento disperso. Al ser un merge, no hay entrenamiento adicional: los pesos resultan de la combinación geométrica de los dos checkpoints de origen mediante Karcher Mean, un método que calcula la media en la variedad riemanniana de matrices definidas positivas y que, en la práctica, produce un promedio ponderado de los tensores que tiende a preservar la estructura de ambos modelos mejor que un SLERP o un linear merge simple.

No se dispone de información sobre el dataset de entrenamiento original de los modelos base, el número de tokens procesados, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas específicas del merge (por ejemplo, si se aplicaron capas selectivas, escalados por tensor o exclusión de módulos de atención). La única información técnica publicada es la configuración YAML de mergekit, que especifica `merge_method: karcher`, los dos modelos en orden y `dtype: bfloat16`.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas de los modelos base Gemma 4, no verificadas de forma independiente en este checkpoint.
- Procesamiento multimodal image-text-to-text: acepta imágenes y texto como entrada, según el pipeline declarado.
- Posible soporte de tool calling y function calling: no documentado en la model card; depende de las capacidades de los modelos base.
- Posible razonamiento multi-paso y uso como agente: no documentado; requiere evaluación empírica.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: solo visión confirmada por el pipeline; el resto no disponible.
- Estilo de escritura: el modelo base StyleTune-V2 sugiere un ajuste orientado a estilo y prosa, aunque no se detalla en la documentación.

## Casos de uso

- Investigación en model merging: utilizar el checkpoint como caso de estudio para evaluar el método Karcher Mean sobre arquitecturas MoE multimodales, comparando la degradación o preservación de capacidades respecto a los modelos base.
- Experimentación con modelos Gemma 4 fusionados: probar el modelo en tareas de generación creativa y descripción de imágenes para determinar si la fusión aporta mejoras de estilo sobre el base StyleTune-V2.
- Prototipado de asistentes multimodales: emplear el modelo en entornos de desarrollo para validar flujos image-text-to-text antes de comprometerse con un modelo evaluado y con licencia clara.
- Evaluación comparativa de checkpoints: incluirlo en suites de evaluación internas junto a los modelos base para medir el efecto del merge en benchmarks de razonamiento y visión.
- Generación de descripciones y alt-text: usar el pipeline image-text-to-text para generar texto descriptivo a partir de imágenes en herramientas internas, siempre con revisión humana.
- Docencia y divulgación: ilustrar en talleres cómo mergekit permite combinar modelos sin entrenamiento adicional y qué riesgos introduce en términos de licencia y reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 53 GB solo para pesos, más overhead de activaciones y caché KV; se requiere al menos una GPU de 80 GB (A100, H100) para inferencia cómoda en precisión completa.
- Cuantización a 8 bits: alrededor de 27 GB de pesos, viable en una RTX 4090 (24 GB) solo con cuantización a 4 bits o con offloading parcial.
- Cuantización a 4 bits: aproximadamente 14-15 GB de pesos, cabe en GPUs consumer de 16-24 GB (RTX 4080, 4090, 3090) con margen limitado para contexto.
- GPU recomendadas: A100 80GB, H100 80GB para bfloat16; RTX 4090/3090 con cuantización para uso local.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI si la arquitectura Gemma 4 MoE está soportada por esas librerías; llama.cpp/Ollama solo si existe conversión GGUF, no publicada por el autor.
- Latencia y throughput: no disponibles; al ser MoE con 4B activos, se espera un throughput superior al de un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Solar-Awakening-26B-A4B | 26,5B totales / 4B activos | no disponible | no disponible | Hugging Face, 0 descargas | Merge experimental con mergekit |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 | 26B / 4B activos | no disponible | no disponible | Hugging Face (modelo base) | Ajuste de estilo sobre Gemma 4 |
| Sorihon/Radiant-Dawn-26B-A4B | 26B / 4B activos | no disponible | no disponible | Hugging Face (modelo base) | Otro merge del mismo autor |
| Gemma 4 26B-A4B (original) | 26B / 4B activos | no disponible en esta ficha | licencia Gemma (no confirmada aquí) | Google / Hugging Face | Modelo de referencia de la familia |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; los modelos base Gemma suelen estar sujetos a la Gemma Terms of Use, pero este checkpoint no lo declara.
- Modelo sin evaluar: cero descargas y cero interacciones en el momento de la consulta; no hay evidencia empírica de su calidad.
- Riesgo de degradación por merge: la fusión de pesos puede producir incoherencias, olvido de capacidades o respuestas degeneradas, especialmente en modelos MoE donde el enrutamiento de expertos puede quedar desalineado.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Contexto no documentado: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica, no se puede acotar.
- Sesgos: heredados de los datos de entrenamiento de los modelos base, no auditados en este checkpoint.
- Reproducibilidad: la model card solo incluye el YAML de mergekit; no se documentan versiones de mergekit, semillas ni validaciones posteriores.
- No apto para producción sin evaluación previa y sin claridad licencial.

## Enlaces

- Hugging Face: https://huggingface.co/Sorihon/Solar-Awakening-26B-A4B
- Modelo base 1: https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2
- Modelo base 2: https://huggingface.co/Sorihon/Radiant-Dawn-26B-A4B
- mergekit: https://github.com/cg123/mergekit
- Paper del método Karcher Mean: https://arxiv.org/abs/2603.04972
