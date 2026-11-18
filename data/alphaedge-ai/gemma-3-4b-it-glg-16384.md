# alphaedge-ai/gemma-3-4b-it-glg-16384

## Resumen

gemma-3-4b-it-glg-16384 es una variante podada del modelo multimodal google/gemma-3-4b-it, publicada por alphaedge-ai y optimizada especificamente para el idioma gallego. La poda se ha realizado mediante la tecnica de trimming de vocabulario descrita por Hugging Face, que reduce el vocabulario original de 262.144 tokens a solo 16.384, eliminando los tokens que no aparecen en el corpus gallego de mineria. El resultado es un modelo un 14,63% mas pequeno en parametros (de 4.300.079.472 a 3.670.770.032) con una huella de memoria notablemente inferior.

El modelo hereda la arquitectura transformer decoder-only de Gemma 3, con capacidades de image-text-to-text propias del modelo base, aunque el ajuste esta orientado a generacion de texto conversacional en gallego. La reduccion de vocabulario implica que el modelo deja de ser fiable en otros idiomas, ya que se han eliminado los tokens poco frecuentes fuera del gallego. Es relevante para desarrolladores que necesiten desplegar un modelo de ~3,7B parametros en entornos con recursos limitados y con requisitos de idioma acotados al gallego, especialmente en la region eu (etiqueta presente en el repo).

El repositorio tiene un tamano de 7,3 GB, usa la libreria transformers con pesos en safetensors y esta etiquetado como compatible con text-generation-inference y endpoints. La licencia es la Gemma Terms of Use, heredada del modelo base, y el modelo no esta afiliado ni respaldado por Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), multimodal image-text-to-text en el modelo base |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | gallego (gl) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Gemma 3 4B IT. No se ha reentrenado desde cero: la operacion aplicada es un trimming de vocabulario, que consiste en identificar los tokens relevantes para el gallego mediante mineria sobre un corpus de 200.000 textos del dataset lbourdois/fineweb-2-trimming, y reconstruir las matrices de embedding y de salida con solo esos 16.384 tokens. El vocabulario pasa de 262.144 a 16.384 tokens (una reduccion del 93,75%), lo que se traduce en una reduccion del 14,63% del total de parametros.

No se dispone de informacion sobre el numero de tokens de entrenamiento adicionales, la composicion exacta del dataset de mineria mas alla del numero de textos, ni sobre si se aplico RLHF o DPO en esta variante. La innovacion tecnica principal es precisamente el trimming: al eliminar los tokens no usados en gallego, se reduce el coste de las capas de embedding y de la cabeza de salida, que en modelos con vocabularios grandes suponen una fraccion significativa de los parametros. El modelo conserva las capacidades del base (incluida la entrada de imagen) pero degrada su rendimiento en idiomas distintos del gallego.

## Capacidades

- Generacion de texto conversacional en gallego, con plantilla de chat (`apply_chat_template`) heredada de Gemma 3 IT.
- Razonamiento y respuesta a instrucciones en gallego, al estar basado en la version instruction-tuned.
- Entrada image-text-to-text: el pipeline declarado en los tags incluye image-text-to-text, por lo que conserva la capacidad multimodal del modelo base (vision + texto).
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada; el modelo base Gemma 3 IT lo soporta, pero no se detalla en esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: limitadas al gallego; el propio autor advierte que puede no funcionar bien en otros idiomas.
- Capacidad especial de thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en gallego: el modelo puede gestionar conversaciones multi-turno en gallego con una huella de memoria reducida, adecuado para desplegar en infraestructura modesta de una administracion o empresa con publico gallegohablante.
- Generacion de contenido editorial en gallego: redaccion de resumenes, articulos o descripciones de producto, aprovechando el vocabulario especializado en gallego y el menor coste de inferencia frente al modelo original.
- Traduccion y adaptacion de textos al gallego: al estar optimizado para ese idioma, sirve como motor de reescritura o adaptacion de contenido, aunque no se debe usar para traducir a otros idiomas.
- Asistentes conversacionales locales: al tener 3,67B parametros y pesos safetensors, puede desplegarse en una unica GPU consumer para prototipos de chatbot en gallego.
- Procesamiento de documentos con imagen y texto en gallego: al conservar la capacidad image-text-to-text del base, puede extraer o describir contenido de imagenes con instrucciones en gallego.
- Investigacion en eficiencia de modelos: util como caso de estudio de trimming de vocabulario y para experimentos de reduccion de parametros en lenguas de bajos recursos como el gallego.
- Despliegue en endpoints compatibles: la etiqueta endpoints_compatible y text-generation-inference permite servirlo mediante TGI en infraestructura estandar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 7,3 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 10-12 GB.
- VRAM estimada con cuantizacion a 8 bits: en torno a 4 GB; a 4 bits, en torno a 2-2,5 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 o H100 para produccion con throughput alto; RTX 4090 o L40S para despliegues de gama alta; RTX 3090/4080 para inferencia en bf16.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas en bf16, y en tarjetas de 6-8 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte oficial), text-generation-inference (etiqueta tgi), endpoints compatibles; llama.cpp, Ollama y vLLM no estan confirmados en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-3-4b-it-glg-16384 | 3.670.770.032 | no disponible | gallego | Gemma Terms of Use | Variante podada, 14,63% mas pequena |
| google/gemma-3-4b-it | 4.300.079.472 | no disponible | multilingue | Gemma Terms of Use | Modelo base, vocabulario de 262.144 tokens |
| Otras variantes trimmed de Gemma 3 | no disponible | no disponible | segun idioma | Gemma Terms of Use | Familia de podas por idioma del mismo autor del metodo |

La comparativa directa con alternativas de la misma categoria (modelos de ~4B para gallego) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento degradado en idiomas distintos del gallego: el autor advierte explicitamente que el modelo puede no funcionar bien en otras lenguas al haberse eliminado los tokens no usados en gallego.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones especificas de fidelidad para esta variante.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base Gemma 3.
- Restricciones de licencia: el uso se rige por los Gemma Terms of Use; es necesario revisar las condiciones para uso comercial antes de desplegar en produccion.
- Longitud de contexto: no disponible; no se debe asumir la del modelo base sin verificacion.
- Soporte de tool calling y agentes no confirmado en esta variante.
- Modelo con muy pocas descargas (9) y sin likes: no hay evidencia de uso en produccion ni validacion comunitaria.
- El modelo no esta afiliado ni respaldado por Google.
- La fecha de creacion indicada (2026-05-05) y la de actualizacion (2026-11-18) deben tratarse con cautela segun la fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-glg-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog de introduccion a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Paper Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
