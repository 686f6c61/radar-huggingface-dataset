# mradermacher/Hemmingway-1-Uncensored-Heretic-GGUF

## Resumen

Hemmingway-1-Uncensored-Heretic-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo OS-Software/Hemmingway-1-Uncensored-Heretic. No se trata, por tanto, de un modelo entrenado desde cero, sino de una conversión de pesos a cuantizaciones de llama.cpp orientada a inferencia local en CPU y GPU de consumo. El repositorio ocupa 54,9 GB e incluye 12 variantes de cuantización (desde Q2_K hasta f16), etiquetadas como `conversational` y compatibles con endpoints.

El modelo subyacente tiene 26.895.998.464 parámetros (unos 26,9 mil millones), según el recuento real de safetensors, lo que lo sitúa en la categoría de modelos densos de gran tamaño para despliegue local exigente. La model card del repositorio no aporta información sobre arquitectura, longitud de contexto, idiomas de entrenamiento ni licencia; el nombre "Uncensored-Heretic" sugiere una variante desalineada o ablacionada, pero esto no está confirmado por ninguna fuente.

La relevancia de esta ficha es limitada y hay que ser honesto al respecto: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, no tiene pipeline declarado ni datos de benchmarks, y su licencia no está especificada. Es un artefacto útil únicamente si ya se conoce y se acepta el modelo original de OS-Software, ya que la cuantización no añade capacidades nuevas, solo reduce los requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no declarada en la model card) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo original se distribuye en safetensors |
| Metadatos de conversion | `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` |
| Tamano del repositorio | 54,9 GB (todas las cuantizaciones juntas) |
| Fecha de creacion | 24 de septiembre de 2026 |
| Ultima actualizacion | 24 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada en la model card sobre la arquitectura del modelo base: no se especifica si es un transformer denso, un MoE, un modelo híbrido con capas SSM ni si emplea attention lineal o decodificación especulativa. El único dato estructural fiable es el recuento de parámetros (26,9 mil millones), que por tamaño encaja con la familia de modelos densos de ~27B, pero esto es una inferencia de magnitud, no un dato confirmado.

Tampoco se documenta el proceso de entrenamiento: no consta el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otra forma de alineación. El sufijo "Heretic" en el nombre apunta a una variante desalineada o ablacionada respecto a un modelo original, y "Uncensored" refuerza esa lectura, pero ninguna fuente de las consultadas confirma la técnica empleada ni el modelo de partida. La cuantización realizada por mradermacher es puramente de conversión y no altera el comportamiento del modelo más allá de la pérdida de precisión inherente a cada nivel de cuantización.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo multi-turno.
- Escritura creativa: un modelo hermano de la misma familia (mradermacher/Hemmingway-1-i1-GGUF, distinto de este) incluye la etiqueta `creative-writing` y `altworld`, lo que sugiere una orientación narrativa en la familia, aunque no se puede confirmar para este modelo concreto.
- Razonamiento, código, matemáticas, visión o audio: no disponible; no hay ninguna declaración al respecto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el modelo hermano de la familia declara únicamente inglés, pero no es extrapolable.
- Modo "thinking" o cualquier capacidad especial: no disponible.

Ante la ausencia de documentación, cualquier capacidad adicional debe verificarse empíricamente antes de integrarla en producción.

## Casos de uso

- Escritura creativa y narrativa sin filtros: el modelo está etiquetado como conversacional y su nombre indica una variante desalineada, por lo que el caso de uso natural es la generación de ficción, diálogos y desarrollo de personajes sin las restricciones típicas de los modelos alineados. Requiere ejecución local con llama.cpp u Ollama y una cuantización Q4_K_M o superior para mantener coherencia en textos largos.
- Investigación sobre alineación y mecanismos de rechazo: un modelo de ~27B presuntamente ablacionado es material de estudio para comparar tasas de rechazo, sesgos y degradación de capacidades frente a su versión alineada, midiendo con prompts estandarizados de evaluación de seguridad.
- Red teaming y pruebas de robustez: permite generar respuestas adversarias para probar clasificadores de contenido, filtros de moderación o sistemas de detección en pipelines propios, siempre en un entorno aislado y con las salvaguardas legales correspondientes.
- Generación de datos sintéticos de dominio específico: al poder desplegarse en local con cuantización Q5_K_M o Q6_K, se puede usar para producir lotes de texto conversacional etiquetado para ajuste fino posterior, sin enviar datos a la nube.
- Asistente conversacional autoalojado para uso interno: con una única GPU de 24 GB y cuantización Q4_K_M, se puede servir mediante llama.cpp con un servidor compatible con la API de OpenAI y usar como chatbot interno en entornos con requisitos estrictos de privacidad.
- Prototipado de personajes y role-play: la orientación conversacional y la ausencia de filtros lo hacen adecuado para motores de rol en aplicaciones de entretenimiento, con la advertencia de que la licencia del modelo base no está declarada y por tanto su uso comercial es indeterminado.
- Evaluación de infraestructura de cuantización: el repositorio incluye 12 niveles de cuantización, lo que permite medir de forma controlada el compromiso entre perplejidad, latencia y memoria para un modelo de ~27B en hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni en la model card del repositorio de cuantizaciones ni en los resultados de búsqueda consultados. Tampoco se publican métricas de perplejidad por nivel de cuantización, que serían el dato relevante para elegir entre Q4_K_M, Q5_K_M o Q6_K.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del recuento real de parámetros (26,9 mil millones) y del tamaño típico en bits por peso de cada tipo de cuantización. No están publicadas por el autor y no incluyen la caché KV, cuyo tamaño depende de una longitud de contexto que no se ha declarado.

| Cuantizacion | Peso estimado en VRAM | Cabe en |
|---|---|---|
| f16 | ~53,8 GB | A100 80GB, H100 80GB, 2x A100 40GB |
| Q8_0 | ~28,6 GB | A100 40GB, A6000 48GB, 2x RTX 4090 |
| Q6_K | ~22,1 GB | RTX 3090 / 4090 24GB (con contexto reducido) |
| Q5_K_M | ~19,1 GB | RTX 3090 / 4090 24GB |
| Q5_K_S | ~18,4 GB | RTX 3090 / 4090 24GB |
| IQ4_XS | ~14,3 GB | RTX 4080 16GB, RTX 4060 Ti 16GB |
| Q4_K_M | ~16,3 GB | RTX 3090 / 4090 24GB, 4080 16GB al limite |
| Q4_K_S | ~15,5 GB | RTX 4080 16GB |
| Q3_K_L | ~14,7 GB | RTX 4080 16GB |
| Q3_K_M | ~13,1 GB | RTX 3060 12GB al limite, 16GB sin problema |
| Q3_K_S | ~11,9 GB | RTX 3060 12GB |
| Q2_K | ~8,7 GB | RTX 3060 12GB, GPUs de 10-12 GB |

- GPU recomendadas: H100 80GB o A100 80GB para f16 y Q8_0 en producción; RTX 4090, RTX 3090 o A6000 para Q4_K_M y Q5_K_M en uso local.
- GPU de consumo: sí cabe en RTX 4090, RTX 3090, RTX 4080 y RTX 3060 12GB, eligiendo la cuantización en función de la VRAM disponible. Por debajo de 10 GB de VRAM no hay ninguna cuantización viable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI sobre llama.cpp. vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que no son la vía recomendada aquí.
- Latencia y throughput: no se han publicado datos. Dependerán del hardware, de la cuantización elegida y de la longitud de contexto, que se desconoce.

## Comparativa con modelos similares

La comparación es necesariamente parcial: del modelo evaluado se desconocen contexto, licencia, idiomas y rendimiento, mientras que de las alternativas hay datos públicos. Se incluyen versiones vigentes en el momento de redactar esta ficha; conviene verificar si han aparecido revisiones posteriores.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Benchmarks publicos |
|---|---|---|---|---|---|
| Hemmingway-1-Uncensored-Heretic (GGUF de mradermacher) | ~26,9B | no disponible | no disponible | si (12 cuantizaciones) | no disponible |
| Qwen3-32B | 32,8B | 128K | Apache-2.0 | si, vía cuantizadores de terceros | si |
| Gemma 3 27B | 27B | 128K | licencia Gemma (uso comercial con condiciones) | si, vía cuantizadores de terceros | si |
| Mistral Small 3.1 24B | 24B | 128K | Apache-2.0 | si, vía cuantizadores de terceros | si |

Frente a estas alternativas, la única ventaja diferencial del modelo evaluado es su carácter presumiblemente desalineado, que no se puede obtener de los modelos oficiales. En todo lo demás (documentación, licencia clara, contexto declarado, benchmarks y soporte de herramientas) las alternativas están mejor caracterizadas.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada, no se puede asumir permiso para uso comercial. Hay que contactar con el autor del modelo original (OS-Software) antes de cualquier despliegue productivo o de redistribución.
- Modelo presumiblemente desalineado: los sufijos "Uncensored" y "Heretic" indican ausencia o eliminación de salvaguardas. Esto implica riesgo real de generar contenido dañino, ilegal o difamatorio, y traslada al operador toda la responsabilidad sobre los filtros que añada por encima.
- Sesgos: no hay ninguna evaluación de sesgos publicada. La falta de alineación suele ir acompañada de una mayor exposición de sesgos presentes en los datos de entrenamiento.
- Alucinación: no hay métricas de fiabilidad ni de veracidad. En un modelo sin alineación, la tendencia a afirmar con seguridad información falsa puede ser mayor, especialmente en dominios factuales.
- Contexto e idiomas desconocidos: se desconoce la ventana de contexto y los idiomas de entrenamiento. Cualquier caso de uso multilingüe o de contexto largo debe validarse empíricamente antes de asumirlo.
- Ausencia de benchmarks: no se puede comparar su calidad objetivamente con otras alternativas, ni elegir la cuantización óptima sin medir perplejidad por cuenta propia.
- Adopción nula: 0 descargas y 0 "likes" implican que no hay una comunidad que haya validado el artefacto. No hay informes de terceros sobre fallos de conversión, tokens rotos o degradación en niveles bajos de cuantización.
- Cuantizaciones agresivas: Q2_K y Q3_K_S sobre un modelo de ~27B suelen producir degradación notable de coherencia. Para uso real conviene Q4_K_M o superior.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Hemmingway-1-Uncensored-Heretic-GGUF
- Modelo original: https://huggingface.co/OS-Software/Hemmingway-1-Uncensored-Heretic
- Repositorio GGUF del autor original: https://huggingface.co/OS-Software/Hemmingway-1-Uncensored-Heretic-GGUF
- Modelo relacionado de la familia (distinto): https://huggingface.co/mradermacher/Hemmingway-1-i1-GGUF
- Perfil del cuantizador: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- Recopilatorio de modelos sin censura: https://decodesfuture.com/articles/top-uncensored-open-source-ai-models-2026-list/
- Guía de modelos locales por tramo de VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
- Paper, blog o demo oficial: no disponible
