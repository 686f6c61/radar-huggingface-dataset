# mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-ARA-heretic-GGUF es una cuantizacion estatica en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-ARA-heretic, publicada por mradermacher. Se trata de una variante "abliterated" (tambien etiquetada como uncensored, decensored y heretic) del Qwen2.5-7B-Instruct de Alibaba, en la que se ha reducido o eliminado el comportamiento de rechazo del modelo original mediante tecnicas de abliteration. El resultado es un modelo conversacional de 7.615.616.512 parametros que responde a peticiones que el modelo base tenderia a declinar.

El repositorio contiene unicamente pesos cuantizados en GGUF, pensados para su uso con llama.cpp, Ollama y otros runners compatibles, no para entrenamiento. El autor del cuantizado es mradermacher, que mantiene una coleccion extensa de cuantizaciones reproducibles; en este caso ofrece tanto cuants estaticos (este repositorio) como cuants ponderados/imatrix en un repositorio hermano. La licencia declarada es Apache 2.0, heredada del Qwen2.5-7B-Instruct original.

Es relevante para desarrolladores que necesitan un modelo de 7B ejecutable en hardware de consumo, con la ventana de contexto larga de la familia Qwen2.5 y sin las capas de rechazo del Instruct original, por ejemplo para investigacion sobre alineamiento, generacion creativa sin filtros o evaluacion de riesgos de modelos abliterated. Conviene subrayar que la model card no documenta el proceso de abliteration ni evaluaciones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct; detalles no documentados en la model card) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 (etiqueta del repo: apache-2.0; los tags tambien mencionan openrail++) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es richardyoung/Qwen2.5-7B-Instruct-ARA-heretic, una modificacion del Qwen2.5-7B-Instruct de Alibaba. La model card de esta cuantizacion no describe la arquitectura interna ni el proceso de entrenamiento o modificacion: solo indica que se trata de cuants estaticos del modelo base y aporta los tags heretic, uncensored, decensored y abliterated. La tecnica de abliteration consiste habitualmente en identificar y proyectar fuera las direcciones de activacion asociadas al rechazo, sin reentrenamiento completo, pero no se dispone de detalles del procedimiento aplicado en este caso.

Tampoco se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF/DPO ni innovaciones tecnicas concretas. La unica informacion tecnica verificable es la relativa a la cuantizacion: cuants estaticos generados con convert_type hf y output_tensor_quantised 1, con un repositorio hermano de cuants ponderados/imatrix (i1-GGUF) para quienes prefieran ese tipo de cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Instruct de Qwen2.5.
- Respuestas a peticiones que el modelo Instruct original rechazaria, por efecto de la abliteration.
- Razonamiento y generacion de codigo y matematicas: capacidades propias de la familia Qwen2.5-7B-Instruct, aunque no se documentan evaluaciones especificas de esta variante.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante concreta.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades multilingues: la model card declara unicamente ingles (en); no se confirma el multilingueismo del Qwen2.5 original en esta variante.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y abliteration: comparar las respuestas de esta variante con las del Qwen2.5-7B-Instruct original para estudiar que comportamientos cambian al eliminar las direcciones de rechazo, usando los cuants Q4_K_M o Q5_K_M para iterar rapido en una sola GPU.
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos que el modelo Instruct rechazaria por contenido sensible, ejecutando el cuant Q6_K o Q8_0 para minimizar la perdida de calidad respecto al f16.
- Evaluacion de riesgos y red teaming: usar el modelo como sujeto de pruebas para medir la eficacia de filtros de salida y clasificadores de seguridad en pipelines propios, dado su caracter uncensored.
- Despliegue local en hardware de consumo: con el cuant Q4_K_S (4,6 GB) cabe en GPUs de 8 GB de VRAM y permite prototipar asistentes conversacionales en un portatil con llama.cpp u Ollama.
- Experimentos de destilacion o generacion de datos sinteticos: el modelo puede generar respuestas a prompts que otros modelos rechazan, util para construir datasets de casos limite, siempre con revision humana posterior.
- Chat de proposito general en ingles: al conservar la base Qwen2.5-7B-Instruct, sirve como asistente conversacional local para tareas cotidianas, aunque sin las garantias de seguridad del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF): Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q3_K_M ~3,9 GB; Q3_K_L ~4,2 GB; IQ4_XS ~4,4 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_S ~5,4 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. Hay que sumar la memoria para el contexto KV.
- GPU recomendadas: para f16, una GPU de 24 GB (RTX 3090/4090, A10G) o superior; para Q8_0, 12-16 GB (RTX 4070 Ti Super, RTX 4080); para Q4_K_M, 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
- Cabe en GPU de consumo: si, desde 8 GB de VRAM con cuants Q4 o inferiores; los cuants Q2 y Q3 permiten incluso GPUs de 4-6 GB con contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF; el repo tambien incluye la etiqueta endpoints_compatible. No se proporcionan pesos safetensors en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-ARA-heretic-GGUF (este) | 7,6 B | no disponible | GGUF | Apache 2.0 | Variante abliterated, solo cuants GGUF |
| Qwen2.5-7B-Instruct (original) | 7,6 B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Modelo base con filtros de rechazo intactos |
| richardyoung/Qwen2.5-7B-Instruct-ARA-heretic | 7,6 B | no disponible | safetensors (presumiblemente) | Apache 2.0 | Modelo fuente de esta cuantizacion, sin cuantizar |
| mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF | 7,6 B | no disponible | GGUF (imatrix) | Apache 2.0 | Misma base con cuants ponderados/imatrix |

## Limitaciones y advertencias

- Al ser una variante abliterated, se ha reducido deliberadamente el comportamiento de rechazo; puede generar contenido danino, ofensivo o inseguro sin advertir, lo que la hace inadecuada para aplicaciones de cara al publico sin filtros adicionales.
- No se documenta el proceso de abliteration ni evaluaciones de seguridad o de capacidad; el impacto de la modificacion sobre el rendimiento en tareas estandar es desconocido.
- Riesgo de alucinacion: inherente a los modelos de 7B; no se han publicado evaluaciones de factualidad para esta variante.
- La model card declara solo ingles; el rendimiento en castellano u otros idiomas no esta verificado y podria degradarse respecto al Qwen2.5 original.
- La licencia Apache 2.0 se hereda del Qwen2.5-7B-Instruct, pero los tags tambien mencionan openrail++; conviene verificar los terminos aplicables antes de un uso comercial, especialmente por el caracter uncensored del modelo.
- La longitud de contexto no se especifica en la informacion proporcionada; no asumir la ventana de 128K del Qwen2.5 original sin verificarla.
- El repositorio contiene solo pesos GGUF (68,1 GB en total por incluir todas las cuantizaciones); no incluye safetensors ni permite entrenamiento directo.
- Solo 1241 descargas y 0 likes en el momento de la consulta: comunidad y validacion practicamente nulas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-ARA-heretic
- Cuants ponderados/imatrix: https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-ARA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-7B-Instruct-ARA-heretic-GGUF
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
