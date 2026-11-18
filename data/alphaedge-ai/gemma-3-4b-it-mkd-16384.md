# alphaedge-ai/gemma-3-4b-it-mkd-16384

## Resumen

`alphaedge-ai/gemma-3-4b-it-mkd-16384` es una variante "trimmed" (podada) del modelo multimodal `google/gemma-3-4b-it`, publicada por el usuario alphaedge-ai. El modelo conserva la arquitectura original de Gemma 3, pero reduce drásticamente el vocabulario del tokenizador de 262.144 a 16.384 tokens, seleccionando únicamente los tokens relevantes para el idioma macedonio (código ISO `mk`). El resultado es un modelo un 14,63% más pequeño en parámetros (3.670.770.032 frente a 4.300.079.472) y con una huella de memoria notablemente inferior.

La tecnica de trimming consiste en identificar, mediante un corpus de minado (200.000 textos del dataset `lbourdois/fineweb-2-trimming`), los tokens del vocabulario original que son realmente utilizados en el idioma objetivo, y reconstruir el vocabulario y las matrices de embedding y de salida (lm_head) con solo esas entradas. Esto preserva el comportamiento del modelo base para el idioma seleccionado mientras elimina la mayor parte del vocabulario multilingüe, que en Gemma 3 ocupa una fraccion muy significativa de los parametros totales.

El modelo es relevante para despliegues en macedonio donde el ahorro de memoria y el rendimiento en inferencia importan, a costa de perder capacidades multilingües y de conservar la licencia Gemma original. Al estar basado en Gemma 3, hereda la arquitectura transformer con atención multimodal (image-text-to-text) y la ventana de contexto de la familia, aunque la model card no detalla explícitamente estos valores y deben consultarse en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de Gemma 3 (base: google/gemma-3-4b-it) |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion posterior a cargo del usuario) |
| Idiomas soportados | macedonio (mk) |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer decoder-only de la familia Gemma 3 con capacidades multimodales (pipeline `image-text-to-text` en el modelo base). La intervencion realizada no es un reentrenamiento: se trata de un proceso de trimming de vocabulario. Se minaron 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para determinar que tokens del vocabulario original (262.144 entradas) aparecen en macedonio, y se reconstruyeron el tokenizador, la matriz de embeddings de entrada y la matriz de proyeccion de salida (lm_head) conservando solo 16.384 tokens. El resto de pesos del transformer se mantiene intacto respecto al modelo base.

Esta reduccion elimina el 93,75% del vocabulario y recorta un 14,63% de los parametros totales, lo que se traduce en un menor uso de VRAM y un `lm_head` mucho mas pequeno. La contrapartida es que los tokens eliminados ya no pueden generarse ni reconocerse, por lo que el modelo pierde competencia en cualquier idioma distinto del macedonio. No se documenta en la model card ningun proceso adicional de RLHF, DPO o fine-tuning especifico; las capacidades de instruccion y conversacion provienen del modelo base `-it`.

## Capacidades

- Generacion de texto y conversacion multi-turno en macedonio, heredadas del modelo base `gemma-3-4b-it`.
- Capacidad multimodal image-text-to-text heredada de Gemma 3 (segun los tags del modelo base), aunque la model card no la documenta explicitamente para esta variante.
- Razonamiento, codigo y matematicas en la medida en que el modelo base los soporta, pero con el vocabulario restringido al macedonio.
- Soporte de plantilla de chat mediante `apply_chat_template` con roles `user`/`assistant`.
- Tool calling / function calling: no documentado en la model card de esta variante.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente.
- Capacidades multilingues: limitadas al macedonio; el resto de idiomas queda practicamente fuera del vocabulario.
- Modo "thinking" explicito: no documentado.

## Casos de uso

- Asistentes conversacionales en macedonio: el modelo puede gestionar dialogos multi-turno usando la plantilla de chat de Gemma 3, con un tokenizador optimizado que reduce el numero de tokens por palabra en macedonio y, por tanto, el coste por peticion.
- Despliegue en hardware limitado para servicios en macedonio: al recortar un 14,63% de parametros y reducir el `lm_head`, cabe con mayor holgura en GPUs de gama media que el modelo base de 4B.
- Procesamiento de documentacion y textos en macedonio: resumen, extraccion de informacion y reescritura sobre corpus en `mk`, aprovechando que el vocabulario esta ajustado a ese idioma.
- Generacion de contenido editorial en macedonio: redaccion asistida de articulos, descripciones de producto o correos, con un modelo de 3,67B parametros facil de servir.
- Traduccion asistida macedonio-ingles: aunque el vocabulario de salida esta centrado en `mk`, el modelo base conserva conocimiento del ingles y puede emplearse en tareas de traduccion con la salvedad de que la generacion en ingles sera menos eficiente por la perdida de tokens.
- Prototipado e investigacion sobre trimming: sirve como caso de estudio reproducible de la tecnica de poda de vocabulario aplicada a Gemma 3, comparando rendimiento y huella de memoria frente al modelo original.
- Fine-tuning ligero especifico de dominio en macedonio: al tener menos parametros en embeddings y `lm_head`, el coste de ajuste fino y el espacio de almacenamiento de checkpoints se reducen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta estadisticas de tamano (vocabulario y parametros) y afirma que el modelo "deberia comportarse de forma similar al original" en macedonio, sin cifras de MMLU, HumanEval, GSM8K ni evaluaciones multilingues.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 7,3 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 10-12 GB para contexto moderado.
- Cuantizacion a 8 bits: en torno a 3,7-4 GB de pesos, viable en GPUs consumer de 8 GB.
- Cuantizacion a 4 bits: en torno a 2-2,5 GB de pesos, viable en GPUs consumer de 6-8 GB (RTX 3060, RTX 4060, RTX 4070).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio en produccion; RTX 4090, RTX 4080, RTX 3090 y RTX 4070 para desarrollo y despliegue en consumer.
- Cabe en GPU consumer: si, especialmente con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo segun la model card), text-generation-inference (tag `text-generation-inference`), y en principio vLLM, llama.cpp u Ollama si se generan pesos GGUF a partir de los safetensors (no se proporcionan GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-mkd-16384 | 3,67B | no disponible (heredado de Gemma 3 4B) | macedonio | Gemma Terms of Use | safetensors |
| google/gemma-3-4b-it | 4,30B | no disponible en la informacion | multilingue | Gemma Terms of Use | safetensors |
| Variantes trimmed de Gemma del mismo autor (otras lenguas) | ~3,67B | no disponible | idioma especifico | Gemma Terms of Use | safetensors |

La comparacion directa mas relevante es con el modelo base `google/gemma-3-4b-it`: misma arquitectura y pesos del transformer, pero con vocabulario reducido (16.384 frente a 262.144 tokens) y un 14,63% menos de parametros. Frente a otros modelos de ~4B multilingues, esta variante sacrifica cobertura idiomatica a cambio de menor huella de memoria y mayor eficiencia en macedonio. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- El vocabulario esta restringido al macedonio: cualquier texto en otro idioma se tokenizara de forma ineficiente o incorrecta, y la generacion en lenguas distintas del `mk` sera deficiente.
- La model card advierte explicitamente de que el modelo "puede no funcionar bien para otros idiomas" al haberse eliminado los tokens no usados en el idioma seleccionado.
- Riesgo de alucinacion inherente a los modelos de ~4B, agravado por la perdida de vocabulario multilingue en tareas que requieran terminos extranjeros.
- La licencia es la Gemma Terms of Use, con las restricciones de uso comercial que establece Google; el modelo no esta afiliado ni respaldado por Google.
- No se documentan sesgos especificos de esta variante; hereda los del modelo base, no evaluados en la model card.
- No se publican benchmarks ni evaluaciones de calidad en macedonio, por lo que el rendimiento real frente al modelo base no esta cuantificado.
- No se proporcionan pesos GGUF ni cuantizaciones listas para usar; el usuario debe generarlas.
- El modelo tiene muy poca traccion (10 descargas, 0 likes) y no cuenta con validacion de la comunidad.
- El pipeline declarado es `text-generation`, aunque los tags incluyen `image-text-to-text`; conviene verificar el soporte multimodal real de esta variante antes de usarla en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-mkd-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
