# alphaedge-ai/gemma-3-4b-it-khm-16384

## Resumen

gemma-3-4b-it-khm-16384 es una variante del modelo google/gemma-3-4b-it podada mediante la tecnica de *trimming* de vocabulario, especializada en el idioma jemer (khmer, codigo ISO `km`). La desarrolla el usuario alphaedge-ai a partir del modelo base de Google y del dataset de mineria lbourdois/fineweb-2-trimming. El objetivo es reducir el peso del modelo eliminando los tokens del vocabulario que no se usan en jemer, manteniendo el resto de los pesos intactos.

La reduccion es notable: el vocabulario pasa de 262.144 a 16.384 tokens (un 93,75% menos), y el total de parametros baja de 4.300.079.472 a 3.670.770.032 (un 14,63% menos). El repositorio ocupa 7,3 GB en formato safetensors con pesos en precision original. La arquitectura subyacente es la de Gemma 3, un transformer multimodal image-text-to-text con ventana de contexto larga, aunque esta ficha no dispone de datos verificados sobre el contexto efectivo tras el trimming.

Es relevante para quien necesite desplegar un modelo conversacional en jemer con menor huella de memoria y menor coste de inferencia en la capa de embedding y en el *language model head*, a cambio de perder capacidad multilingue. El modelo tiene un uso muy limitado (8 descargas, 0 likes en el momento de la consulta) y esta pensado para experimentacion mas que para produccion critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (image-text-to-text), base Gemma 3 |
| Parametros totales | 3.670.770.032 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el sufijo 16384 del nombre corresponde al tamano de vocabulario, no al contexto) |
| Tipos de cuantizacion | No se publican pesos cuantizados en el repo; al ser safetensors en `torch_dtype="auto"` se puede cuantizar a posteriori con herramientas externas (no verificado por el autor) |
| Idiomas soportados | Jemer (`km`) como idioma objetivo; el resto de idiomas puede degradarse por la eliminacion de tokens |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es un proceso de *trimming* sobre google/gemma-3-4b-it. Se minaron 200.000 textos del dataset lbourdois/fineweb-2-trimming para identificar que tokens del vocabulario original de 262.144 entradas se usan realmente en jemer, y se conservaron 16.384. Los embeddings de entrada y la matriz de salida se recortan a ese subconjunto, de modo que los pesos restantes del transformer (capas de atencion, MLP, normalizaciones) se mantienen identicos a los del modelo base. No hay, por tanto, un ciclo de entrenamiento ni de ajuste fino documentado en la model card: es una operacion de cirugia de vocabulario.

La arquitectura heredada es la de Gemma 3, descrita en el informe tecnico arXiv:2503.19786, que combina atencion con ventana deslizante y atencion global, y soporte de entrada de imagen y texto. Al conservar los pesos del backbone, el modelo mantiene las capacidades del base en la medida en que el tokenizador recortado pueda representar la entrada. La innovacion tecnica destacable es precisamente el ahorro de memoria en las capas de embedding y en el *lm_head*, que en modelos con vocabularios grandes suponen una fraccion significativa de los parametros.

## Capacidades

- Generacion de texto conversacional en jemer, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento y respuesta multi-turno heredados del modelo base Gemma 3, sujetos a la cobertura del vocabulario recortado.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque la model card no documenta el comportamiento multimodal tras el trimming.
- Soporte de tool calling y function calling heredado del base (no verificado especificamente en esta variante).
- Capacidad multilingue muy reducida: el vocabulario se optimizo para jemer y los tokens de otros idiomas pueden haberse eliminado.
- No se documentan modos especiales (thinking, audio) en la informacion disponible.

## Casos de uso

- Atencion al cliente en jemer: desplegar un asistente conversacional multi-turno para usuarios camboyanos con una huella de memoria menor que la del Gemma 3 base, adecuado si el trafico es mayoritariamente en jemer.
- Procesamiento de documentos en jemer: resumen y extraccion de informacion de textos administrativos o periodisticos en khmer, aprovechando el vocabulario especializado.
- Traduccion jemer a jemer formal o reescritura: normalizacion de estilo y correccion de textos en jemer dentro de un pipeline editorial.
- Clasificacion y etiquetado de contenido en jemer: moderacion o categorizacion de mensajes y resenas, con menor coste de inferencia gracias al vocabulario reducido.
- Prototipado en entornos con GPU de gama media: al ocupar 7,3 GB en safetensors, permite experimentar con un modelo de 3,67B parametros en hardware mas modesto que el base.
- Investigacion sobre trimming de vocabulario: servir como referencia para estudiar el impacto de reducir el vocabulario en la calidad de un modelo multimodal.
- Generacion de contenido educativo en jemer: materiales de aprendizaje o ejercicios adaptados al idioma, con supervision humana por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 7,4 GB solo para pesos, mas activaciones y cache KV; en la practica conviene reservar 10-12 GB.
- VRAM estimada en cuantizacion 8 bits: en torno a 4 GB para pesos; en 4 bits, en torno a 2,5 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso individual sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (soporte oficial documentado), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama/vLLM tras conversion a GGUF o configuracion adecuada (no verificado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| gemma-3-4b-it-khm-16384 | 3,67B | 16.384 | No disponible | Gemma | Trimming para jemer |
| google/gemma-3-4b-it | 4,30B | 262.144 | No disponible | Gemma | Modelo base multimodal |
| Otras variantes trim del mismo autor | No disponible | 16.384 | No disponible | Gemma | Trimming por idioma |

La comparacion directa con alternativas especializadas en jemer no esta disponible en la informacion proporcionada. Frente al modelo base, la ventaja es un 14,63% menos de parametros y una reduccion del 93,75% del vocabulario; la desventaja es la perdida de cobertura para otros idiomas.

## Limitaciones y advertencias

- El vocabulario recortado elimina tokens no usados en jemer, por lo que el rendimiento en otros idiomas puede degradarse gravemente.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluacion publicada que lo cuantifique en esta variante.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgo ni de seguridad.
- La model card advierte de que el modelo puede no funcionar bien fuera del jemer; no se recomienda su uso multilingue.
- Licencia Gemma Terms of Use: hay que revisar las restricciones de uso comercial y de redistribucion antes de desplegarlo en produccion.
- El autor declara no estar afiliado ni respaldado por Google.
- El modelo tiene muy poca traccion (8 descargas, 0 likes); no hay evidencia de validacion por terceros.
- No se documenta el contexto efectivo tras el trimming; el sufijo 16384 del nombre se refiere al vocabulario, no a la ventana de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-khm-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
