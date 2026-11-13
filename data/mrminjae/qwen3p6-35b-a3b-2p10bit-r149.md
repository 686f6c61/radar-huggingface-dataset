# mrminjae/qwen3p6-35b-a3b-2p10bit-r149

## Resumen

Qwen3.6-35B-A3B 2.10-bit (r149) es una cuantizacion experimental del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario mrminjae en Hugging Face. Se trata de un checkpoint de investigacion interna en el que los expertos enrutados del modelo MoE se almacenan con una precision media de 2,10 bits, mientras que el resto de pesos permanece en BF16. Los pesos se guardan dequantizados en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estandar sin necesidad de kernels de cuantizacion especiales.

El modelo base es un MoE de Qwen con 35B parametros totales y 3B activos por token (de ahi el sufijo A3B), orientado a generacion de texto, conversacion y tareas imagen-texto (el tag `image-text-to-text` sugiere capacidades multimodales en el modelo base). Esta publicacion concreta no aporta informacion sobre el entrenamiento original, los datos utilizados ni los benchmarks, y su model card es minima.

La relevancia de esta ficha es limitada pero concreta: muestra una tecnica de compresion agresiva de la capa MoE (expertos a ~2 bits) manteniendo el resto en BF16, lo que reduce el peso en disco del repositorio a 77,2 GB. Es un artefacto de investigacion, no un modelo listo para produccion, y su licencia y condiciones de uso dependen del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), modelo base Qwen3.6-35B-A3B |
| Parametros totales | 35B (heredados del modelo base) |
| Parametros activos | 3B (heredados del modelo base, segun el nombre A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha; la model card indica que sigue la licencia del modelo base |
| Formato de pesos | safetensors (BF16), compatible con `transformers` y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con mezcla de expertos (MoE) de 35B parametros totales y aproximadamente 3B activos por token. Esta publicacion (r149) no modifica la arquitectura: aplica una cuantizacion selectiva sobre los expertos enrutados, que quedan representados con una media de 2,10 bits, mientras que el resto de matrices (atencion, embeddings, capas densas y probablemente el router) se mantiene en BF16. Los pesos se almacenan ya dequantizados en tensores BF16, por lo que no se requiere un runtime de cuantizacion especifico para cargarlos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documenta el metodo exacto de cuantizacion (por ejemplo, si es GPTQ, AWQ, una variante de quantizacion por bloques o un esquema propio de investigacion interna). La unica innovacion tecnica declarada es la compresion agresiva de los expertos a ~2 bits manteniendo el resto en BF16, lo que reduce el tamano del repositorio a 77,2 GB.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento imagen-texto: el tag `image-text-to-text` del modelo base indica capacidades multimodales de entrada de imagen.
- Razonamiento y generacion de codigo: capacidades esperables del modelo base, aunque no verificadas en esta publicacion.
- Tool calling y function calling: no documentado en esta ficha; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta ficha.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking u otras capacidades especiales: no documentado en esta ficha.

## Casos de uso

- Investigacion sobre cuantizacion de MoE: el checkpoint permite estudiar el impacto de comprimir expertos a 2,10 bits manteniendo el resto en BF16, comparando calidad frente al modelo base sin cuantizar en tareas controladas.
- Evaluacion de degradacion por cuantizacion agresiva: util para medir la perdida de calidad en generacion de texto, razonamiento y codigo respecto al Qwen3.6-35B-A3B original, con el objetivo de establecer umbrales de bits por experto.
- Pruebas de carga e integracion en `transformers` y vLLM: al almacenarse en BF16 dequantizado, sirve para validar pipelines de inferencia estandar con un modelo MoE de 35B sin kernels especiales.
- Experimentos de memoria y throughput: permite medir el ahorro de almacenamiento (77,2 GB de repositorio) y comparar el rendimiento de inferencia frente al modelo base en el mismo hardware.
- Prototipado de aplicaciones multimodales de imagen a texto: si el modelo base conserva sus capacidades de vision, puede usarse en pruebas de concepto de descripcion de imagenes o respuesta a preguntas visuales, siempre con validacion previa de calidad.
- Docencia y formacion tecnica: ejemplo practico de cuantizacion selectiva en arquitecturas MoE para explicar el equilibrio entre precision, tamano y calidad en modelos de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 77,2 GB en BF16; la carga completa en memoria requiere al menos ese orden de magnitud, mas overhead de activaciones y cache KV. No se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, se situa en el rango de GPUs de centro de datos con 80 GB o mas (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) en su formato BF16 completo; no se documentan variantes GGUF ni cuantizaciones adicionales para reducir el peso.
- Opciones de despliegue: `transformers` y vLLM estandar, segun indica la model card; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B 2.10-bit (r149) | 35B totales / 3B activos | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible (sigue la del base) | Hugging Face, repositorio de 77,2 GB |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / 3B activos | no disponible | BF16 original | no disponible en esta ficha | Hugging Face, modelo oficial |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigacion interna: el autor lo describe explicitamente como "internal research checkpoint", no como un modelo listo para produccion.
- Cuantizacion agresiva: los expertos enrutados a 2,10 bits pueden degradar la calidad frente al modelo base; no se aportan evaluaciones que cuantifiquen esa perdida.
- Licencia no declarada: la ficha no especifica licencia y remite a la del modelo base, que no se detalla; es imprescindible verificar las condiciones del modelo Qwen original antes de cualquier uso comercial.
- Idiomas no documentados: no hay informacion sobre cobertura linguistica ni sobre el rendimiento en castellano.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para este checkpoint.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de tareas multimodales que permitan validar su calidad.
- Metodo de cuantizacion no documentado: se desconoce el esquema exacto (por bloques, por canal, etc.) y su reproducibilidad.
- Sin soporte documentado para llama.cpp, Ollama o TGI: las opciones de despliegue se limitan a `transformers` y vLLM segun la model card.
- Trazabilidad limitada: cero descargas y cero likes en el momento de la consulta, sin comunidad que valide el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r149
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
