# alphaedge-ai/gemma-3-4b-it-lit-16384

## Resumen

gemma-3-4b-it-lit-16384 es una version podada del vocabulario del modelo multimodal google/gemma-3-4b-it, adaptada especificamente para lituano mediante la tecnica de trimming. El autor es alphaedge-ai y el modelo base pertenece a Google (Gemma Team). El problema que resuelve es el sobredimensionamiento del vocabulario original (262.144 tokens) para un unico idioma: al recortar la tabla de embeddings a 16.384 tokens se reduce el numero de parametros en un 14,63% y se disminuye notablemente la huella de memoria, manteniendo un comportamiento esperado similar al original en lituano.

La arquitectura subyacente es la de Gemma 3 (transformer decoder con atencion, segun el informe tecnico arXiv:2503.19786), conservando las capacidades multimodales del modelo original (image-text-to-text). El modelo resultante tiene 3.670.770.032 parametros totales y se distribuye en safetensors con un repositorio de 7,3 GB.

Es relevante para desarrolladores que despliegan asistentes conversacionales en lituano y necesitan reducir costes de VRAM y latencia de decodificacion, ya que un vocabulario mas pequeno implica matrices de embedding y de salida mas ligeras. La contrapartida es que el modelo degrada su rendimiento en otros idiomas, porque los tokens poco frecuentes en lituano fueron eliminados del vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3), multimodal image-text-to-text |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repo en safetensors; el modelo base admite cuantizaciones habituales, pero no se documentan aqui) |
| Idiomas soportados | lituano (lt) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un transformer decoder multimodal de la familia Gemma 3 (informe tecnico arXiv:2503.19786). La intervencion aplicada no es un reentrenamiento completo, sino un trimming de vocabulario: se seleccionan los tokens relevantes para lituano y se recorta la tabla de embeddings de 262.144 a 16.384 tokens, lo que reduce el total de parametros de 4.300.079.472 a 3.670.770.032 (14,63% menos). La seleccion de tokens se hizo minando 200.000 textos del dataset lbourdois/fineweb-2-trimming.

No se documenta en la informacion disponible un entrenamiento adicional de RLHF/DPO ni una fase de recalibrado posterior al recorte, ni el numero de tokens de entrenamiento original de Gemma 3. La innovacion tecnica destacable es precisamente el metodo de trimming descrito en el blog de Hugging Face "Introduction to Trimming", que permite obtener variantes monoidioma mas ligeras de modelos multilingues sin reentrenar desde cero.

## Capacidades

- Generacion de texto conversacional en lituano, con plantilla de chat aplicable via `apply_chat_template`.
- Capacidad multimodal heredada del modelo base (pipeline image-text-to-text), sujeta a verificacion tras el recorte.
- Razonamiento y respuesta a instrucciones, al conservar los pesos del modelo instruct original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas practicamente al lituano; el autor advierte que el rendimiento en otros idiomas puede degradarse.
- Capacidades especiales (thinking mode, vision, audio): vision heredada del modelo base; no se documentan otras.

## Casos de uso

- Atencion al cliente en lituano: el modelo gestiona conversaciones multi-turno mediante la plantilla de chat y su vocabulario recortado reduce el coste de decodificacion frente al Gemma 3 original.
- Despliegue en hardware limitado: al tener un 14,63% menos parametros y un vocabulario 93,75% menor, las matrices de embedding y de salida ocupan mucha menos memoria, lo que facilita servir el modelo en GPUs de gama media.
- Generacion de contenido editorial en lituano: redaccion y resumens de textos en lituano con un modelo instruct afinado para seguir instrucciones.
- Asistentes locales o en el borde: la reduccion de huella permite empaquetar el modelo en entornos con presupuesto de VRAM ajustado, manteniendo la calidad esperada en lituano.
- Traduccion y normalizacion de textos lituanos: util como componente de pipelines de procesamiento de lenguaje para ese idioma, con la salvedad de que no debe usarse para otros idiomas.
- Prototipado rapido de aplicaciones conversacionales en lituano: el fragmento de uso documentado con `transformers` permite integrarlo en demos y pruebas de concepto con `device_map="auto"`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 7,3 GB en safetensors, por lo que en fp16 se requiere aproximadamente ese orden de memoria mas overhead, y menos con cuantizacion.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en consumer GPU: no disponible; la reduccion de parametros y vocabulario sugiere que es mas ligero que el Gemma 3 4B original, pero no hay datos confirmados.
- Opciones de despliegue: transformers (documentado en la model card); text-generation-inference aparece entre los tags; vLLM, llama.cpp y Ollama no se documentan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-lit-16384 | 3.670.770.032 | 16.384 | no disponible | lt | gemma |
| google/gemma-3-4b-it | 4.300.079.472 | 262.144 | no disponible | multilingue | gemma |
| Otras variantes trimadas de Gemma 3 | no disponible | no disponible | no disponible | no disponible | gemma |

La comparacion directa mas relevante es con el modelo base: el recorte supone un 14,63% menos parametros y un 93,75% menos tokens de vocabulario, a cambio de perder cobertura multilingue.

## Limitaciones y advertencias

- Rendimiento degradado en idiomas distintos del lituano: los tokens poco frecuentes en lituano fueron eliminados del vocabulario.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones especificas tras el recorte.
- Sesgos: no se documentan en la informacion disponible; hereda los del modelo base.
- Longitud de contexto: no disponible en la informacion proporcionada; debe verificarse antes de usarlo en produccion con contextos largos.
- Licencia: uso sujeto a los Gemma Terms of Use; el modelo no esta afiliado ni respaldado por Google.
- El modelo es una modificacion de terceros (alphaedge-ai), no una version oficial de Google; conviene validar la calidad en la tarea concreta antes de desplegarlo.
- Popularidad muy baja (6 descargas, 0 likes) y actualizacion reciente; no hay evidencia comunitaria de robustez en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-lit-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog "Introduction to Trimming": https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Informe tecnico Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
