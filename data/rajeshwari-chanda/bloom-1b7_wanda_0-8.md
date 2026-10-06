# Rajeshwari-Chanda/bloom-1b7_wanda_0.8

## Resumen

`Rajeshwari-Chanda/bloom-1b7_wanda_0.8` es un checkpoint derivado de BLOOM-1b7 (1.722.408.960 parámetros reales segun los pesos safetensors publicados, ~1,72 mil millones) al que se le ha aplicado poda (pruning) con el metodo Wanda, segun se deduce del sufijo `wanda_0.8` del identificador. El modelo lo publica el usuario Rajeshwari-Chanda en HuggingFace, sin articulo, sin blog asociado y sin model card redactada: la tarjeta del repositorio es la plantilla autogenerada por `transformers`, con todos los campos marcados como `[More Information Needed]`.

El problema que aborda es el habitual en la investigacion sobre compresion de modelos: reducir el coste computacional y de memoria de un transformer sin reentrenarlo, aplicando una mascara de poda basada en la magnitud de los pesos ponderada por las activaciones de calibracion. En este caso, el `0.8` sugiere un ratio de poda del 80 por ciento, aunque la model card no lo confirma ni especifica si la poda es no estructurada (unstructured), semi-estructurada 2:4 o estructurada.

Es relevante sobre todo como material de experimentacion reproducible en investigacion sobre pruning, no como modelo listo para produccion: el repositorio no documenta licencia, idiomas, datos de entrenamiento, hiperparametros ni evaluacion, y no tiene descargas ni likes en el momento de la consulta. Cualquier uso serio exige una evaluacion propia del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de BLOOM-1b7 (poda Wanda aplicada sobre el checkpoint denso); detalles de la poda no disponibles |
| Parametros totales | 1.722.408.960 (pesos safetensors publicados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura base BLOOM-1b7 usa 2048 tokens con embeddings posicionales ALiBi |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; no se han subido variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible. BLOOM-1b7 base se entreno con 46 idiomas naturales y 13 lenguajes de programacion, pero no hay confirmacion para este checkpoint podado |
| Licencia | No disponible. No se puede asumir la licencia de BLOOM (BigScience RAIL v1.0) ni ninguna otra sin confirmacion del autor |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repositorio 3,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BLOOM-1b7: un transformer decoder-only con atencion causal, normalizacion LayerNorm en la entrada de cada bloque, embeddings posicionales ALiBi (sin embeddings posicionales aprendidos) y un vocabulario multilingue de gran tamano. La modificacion respecto al modelo base es la aplicacion de poda Wanda, un metodo que selecciona los pesos a eliminar comparando la magnitud del peso con la magnitud de la activacion de entrada en una muestra de calibracion. La model card no especifica el dataset de calibracion, el ratio exacto de poda (el sufijo indica 0,8), el tipo de mascara (no estructurada, 2:4 o estructurada) ni si hubo una fase posterior de fine-tuning para recuperar calidad.

Con poda no estructurada, los tensores conservan su forma original y los pesos podados se almacenan como ceros. Esto explica que el recuento de parametros declarado (1.722.408.960) coincida practicamente con el del BLOOM-1b7 denso: el fichero sigue ocupando lo mismo en disco y en VRAM, y la ganancia solo se materializa con kernels dispersos o con una cuantizacion posterior. No hay informacion sobre datos de entrenamiento adicionales, RLHF, DPO ni ninguna otra innovacion tecnica. Tampoco se documentan hiperparametros de entrenamiento ni regimen de precision (fp32, fp16, bf16).

## Capacidades

- Generacion de texto autorregresiva en el pipeline `text-generation` de `transformers`.
- Capacidades multilingues heredadas potencialmente del BLOOM-1b7 original (46 idiomas naturales y 13 lenguajes de programacion), no verificadas tras la poda.
- Generacion de codigo basica, limitada por el tamano de 1,7B parametros y por la degradacion esperable tras podar un 80 por ciento de los pesos.
- Inferencia compatible con Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`) y con la libreria `transformers`.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, modo de pensamiento explicito, vision ni audio. No disponible.
- No se ha documentado ninguna capacidad de agente ni integracion con frameworks de orquestacion.

## Casos de uso

- Investigacion sobre compresion de modelos: usar el checkpoint como punto de comparacion frente al BLOOM-1b7 denso con las mismas semillas y prompts, midiendo perplejidad y calidad generativa antes y despues de la poda.
- Reproduccion de experimentos de pruning: validar si un ratio de poda de 0,8 con Wanda es recuperable mediante fine-tuning ligero (LoRA) sobre el checkpoint podado.
- Generacion de texto de bajo coste en tareas poco exigentes: continuacion de texto, resumen extractivo o clasificacion por generacion, siempre con validacion humana dado el riesgo de degradacion.
- Prototipado rapido en local: al ocupar unos 3,4 GB en bf16/fp16, cabe en una GPU de consumo de 8-12 GB y permite iterar sin infraestructura en la nube.
- Generacion de embeddings o representaciones intermedias para experimentos de analisis de representaciones tras la poda (comparar espacios latentes podado vs denso).
- Filtrado y anotacion de datos a gran escala de baja criticidad, donde la perdida de calidad se compensa con el menor coste por token.
- No se recomienda su uso en atencion al cliente, produccion regulada, codigo critico ni tareas medicas o legales: no hay evaluacion publicada ni garantias de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio deja la seccion `Evaluation` con todos los campos como `[More Information Needed]`, y la busqueda web no ha devuelto ningun resultado relacionado con el modelo, el autor ni el experimento de poda. No existen datos de MMLU, HumanEval, GSM8K, BIG-bench, perplejidad en validacion ni comparaciones con el BLOOM-1b7 denso.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 1.722.408.960 parametros (estimacion aritmetica, no medida): fp32 ~6,9 GB; bf16/fp16 ~3,5 GB; int8 ~1,8 GB; 4 bits ~1,0-1,2 GB (mas overhead de activaciones y cache KV, que con contexto de 2048 tokens es reducido).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 funcionan sin problemas. A100, H100 y L40S lo ejecutan sobradamente y permiten lotes grandes.
- Cabe en GPU de consumo: si, en la practica totalidad de tarjetas con 8 GB o mas en precision media, y en 4-6 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (el repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama mediante conversion manual, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones. Advertencia: si la poda es no estructurada, un motor de inferencia estandar no aprovechara la dispersion y el rendimiento sera identico al de un BLOOM-1b7 denso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bloom-1b7_wanda_0.8 (este) | 1,72B | No disponible (base 2048) | No disponible | No disponible | HuggingFace, 0 descargas |
| BLOOM-1b7 (base denso) | 1,72B | 2048 | Benchmark publicado por BigScience | BigScience RAIL v1.0 | HuggingFace `bigscience/bloom-1b7` |
| TinyLlama-1.1B | 1,1B | 2048 | Benchmark en su model card | Apache-2.0 | HuggingFace `TinyLlama/TinyLlama-1.1B-Chat-v1.0` |
| Qwen2.5-1.5B | 1,54B | 32768 | Benchmark en su model card | Apache-2.0 (salvo variantes) | HuggingFace `Qwen/Qwen2.5-1.5B` |

Los datos de los modelos alternativos provienen de su documentacion publica y se incluyen solo como referencia de categoria. La comparacion de rendimiento directa con este checkpoint no es posible porque no existe ninguna evaluacion publicada del mismo.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos, evaluacion, uso previsto ni limitaciones declaradas por el autor.
- Licencia no disponible: no se puede asumir uso comercial permitido. La licencia del BLOOM original (BigScience RAIL v1.0) incluye restricciones de uso, y no esta claro que se herede ni que el autor tenga derecho a redistribuir el derivado.
- Riesgo alto de degradacion generativa: una poda del 80 por ciento sin fine-tuning posterior suele producir texto incoherente, repeticiones y fallos de formato, aunque no se ha medido en este caso concreto.
- Riesgo de alucinacion elevado, agravado por el reducido tamano del modelo base y por la perdida de capacidad asociada a la poda.
- Si la poda es no estructurada, no hay ahorro real de memoria ni de latencia en motores estandar: el checkpoint ocupa lo mismo que el modelo denso.
- Sin soporte ni mantenimiento evidentes: repositorio creado el 2026-10-06 y actualizado un minuto despues, con 0 descargas y 0 likes, lo que apunta a un experimento puntual no continuado.
- Idiomas y cobertura multilingue no verificados tras la poda; la degradacion puede ser desigual entre idiomas, con mayor impacto previsible en los de menor representacion.
- No apto para produccion, decisiones automatizadas, contenido medico, legal o financiero sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rajeshwari-Chanda/bloom-1b7_wanda_0.8
- Referencia de arquitectura base BLOOM: https://huggingface.co/bigscience/bloom-1b7
- Paper de BLOOM: https://arxiv.org/abs/2211.05100
- Paper citado en los tags del repositorio (`arxiv:1910.09700`, Lacoste et al., 2019, calculo de impacto ambiental; aparece en la plantilla de la model card, no describe el modelo): https://arxiv.org/abs/1910.09700
- Referencia externa al metodo Wanda (Sun et al., 2023), no citada en la model card pero coherente con el sufijo del identificador: https://arxiv.org/abs/2306.11695
- Busqueda web realizada: no se han encontrado resultados relevantes sobre este modelo, su autor ni su proceso de poda. Los unicos resultados devueltos han sido foros no relacionados (recuperacion de cuentas de Facebook) y se descartan por no aportar informacion tecnica.
