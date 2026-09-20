# mradermacher/abliterated-minicpm5-2b-v3-GGUF

## Resumen

abliterated-minicpm5-2b-v3-GGUF es una versión cuantizada en formato GGUF del modelo KidIkaros/abliterated-minicpm5-2b-v3, publicada por el cuantizador mradermacher. El modelo tiene 2.516.756.480 parámetros (unos 2,5 mil millones) y se distribuye bajo licencia Apache 2.0, con el inglés como único idioma declarado en la model card. El nombre del modelo base indica que se trata de una variante "abliterated" de la familia MiniCPM5-2B, es decir, con la dirección de rechazo eliminada, y las etiquetas del repositorio señalan fases de SFT y DPO y soporte de tool-use.

Este repositorio no contiene los pesos originales, sino 12 cuantizaciones estáticas generadas para llama.cpp, desde Q2_K (1,1 GB) hasta f16 (5,1 GB), orientadas a inferencia local en CPU o GPU de gama baja. No se ofrecen cuantizaciones ponderadas ni con imatrix ("weighted/imatrix quants seem not to be available"), por lo que la calidad relativa de cada fichero corresponde al esquema estático habitual de llama.cpp.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo conversacional en inglés con tool calling declarado en hardware muy modesto; por otro, la abliteration lo convierte en una pieza de interés para investigación sobre alineación, análisis de rechazo y red teaming. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la detalla; por el nombre del modelo base se infiere la familia MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (~2,5 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estaticas: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); este repositorio no incluye safetensors |
| Modelo base | KidIkaros/abliterated-minicpm5-2b-v3 |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 22,8 GB (suma de las 12 cuantizaciones) |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-09-20 (ultima actualizacion: 2026-09-20) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo (atencion, tipo de normalizacion, capas, vocabulario ni ventana de contexto). Lo unico confirmado es el recuento de parametros a partir de los pesos en safetensors del modelo base (2.516.756.480) y que el pipeline declarado es text-generation. El nombre del modelo base sugiere que deriva de MiniCPM5-2B y que despues se le aplico una tecnica de abliteration, consistente en identificar y eliminar la direccion latente asociada al rechazo de peticiones.

Respecto al entrenamiento, las etiquetas del repositorio incluyen sft, dpo y tool-use, lo que indica que el modelo base paso por ajuste supervisado, por optimizacion de preferencias con DPO y por un entrenamiento orientado a uso de herramientas. No hay datos publicados sobre volumen de tokens, composicion del dataset, mezcla de idiomas ni hiperparametros. La model card del repositorio cuantizado es una plantilla generada automaticamente por mradermacher, por lo que no aporta informacion adicional sobre el proceso de entrenamiento.

En cuanto al proceso de cuantizacion, se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no se han publicado variantes ponderadas ni con imatrix. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional en ingles: el repositorio esta etiquetado como conversational y text-generation, con soporte nativo de llama.cpp.
- Tool calling / function calling: el repositorio incluye la etiqueta tool-use, aunque no se documentan el esquema exacto de llamadas, el formato de plantilla ni el protocolo soportado.
- Uso en agentes y razonamiento multi-paso: no documentado; la etiqueta tool-use es el unico indicio disponible en la informacion proporcionada.
- Multilingue: no. El unico idioma declarado es el ingles, tanto en la model card como en las etiquetas del repositorio.
- Modelo abliterated: se ha eliminado la direccion de rechazo, de modo que el modelo tiende a responder a peticiones que un modelo alineado rechazaria. Esta es una capacidad funcional, pero tambien el principal riesgo del modelo.
- Ajuste por preferencias: las etiquetas sft y dpo indican ajuste supervisado y optimizacion directa de preferencias en alguna fase del entrenamiento.
- Sin capacidades multimodales: no hay indicios de vision, audio ni entrada de imagenes en la informacion disponible.
- Sin modo thinking explicito: no se documenta un modo de razonamiento extendido ni fases de deliberacion separadas.

## Casos de uso

- Chat local en hardware modesto: con la cuantizacion Q4_K_M (1,7 GB) el modelo puede ejecutarse en un portatil sin GPU dedicada o en una GPU integrada, sirviendo como asistente conversacional en ingles sin depender de APIs externas.
- Asistentes on-premise para pymes: al ser Apache 2.0 y caber en cualquier equipo de oficina, permite desplegar un bot de atencion al cliente o FAQ interno en ingles sin enviar datos a terceros.
- Agentes ligeros con tool calling: la etiqueta tool-use lo hace candidato para orquestar llamadas a funciones sencillas (consultas a bases de datos, calculo, recuperacion de documentos) en pipelines donde el coste por token y la latencia importan mas que la precision bruta.
- Investigacion sobre alineacion y abliteration: permite comparar las respuestas del modelo abliterado frente al modelo alineado original para estudiar como se distribuye la direccion de rechazo y que capacidades se degradan al eliminarla.
- Red teaming y evaluacion de seguridad: util como modelo de bajo coste para generar prompts y respuestas en pruebas de robustez de filtros y clasificadores de contenido sensible.
- Generacion de datos sinteticos en ingles: puede producir parrafos, dialogos y variaciones de texto para aumentar datasets de entrenamiento, aprovechando que su naturaleza abliterated permite cubrir dominios que otros modelos rechazan.
- Prototipado rapido de productos conversacionales: el abanico de 12 cuantizaciones permite ajustar el equilibrio tamano/calidad durante el desarrollo y fijar despues una variante concreta para produccion.
- Investigacion sobre cuantizacion: disponer de Q2_K hasta f16 del mismo modelo facilita medir la degradacion de perplejidad y calidad entre esquemas sin cambiar de modelo base.
- Base para fine-tuning posterior: el ajuste fino debe hacerse sobre el modelo base en safetensors (KidIkaros/abliterated-minicpm5-2b-v3), no sobre los GGUF; posteriormente se puede recuantizar el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado es una plantilla automatica de mradermacher y no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica. Tampoco se han publicado datos de perplejidad especificos para estas cuantizaciones; el unico material de referencia enlazado es un grafico generico de comparacion de tipos de cuantizacion de ikawrakow, no mediciones de este modelo.

## Requisitos de hardware

- Inferencia en CPU: viable en cualquier equipo con 2-4 GB de RAM libre para las cuantizaciones pequenas (Q2_K a Q5_K_M), usando llama.cpp.
- VRAM estimada: no hay mediciones publicadas. Como referencia, el tamano del fichero es el componente dominante y hay que anadir el KV cache y el overhead del runtime, que dependen de la longitud de contexto (no disponible).

| Cuantizacion | Tamano del fichero | VRAM estimada (modelo + overhead moderado) |
|---|---|---|
| Q2_K | 1,1 GB | ~1,5-2 GB |
| Q3_K_S | 1,3 GB | ~1,7-2,2 GB |
| Q3_K_M | 1,4 GB | ~1,8-2,3 GB |
| Q3_K_L | 1,5 GB | ~1,9-2,4 GB |
| IQ4_XS | 1,5 GB | ~1,9-2,4 GB |
| Q4_K_S | 1,6 GB | ~2,0-2,6 GB |
| Q4_K_M | 1,7 GB | ~2,1-2,7 GB |
| Q5_K_S | 1,9 GB | ~2,3-3,0 GB |
| Q5_K_M | 1,9 GB | ~2,3-3,0 GB |
| Q6_K | 2,2 GB | ~2,6-3,3 GB |
| Q8_0 | 2,8 GB | ~3,2-4,0 GB |
| f16 | 5,1 GB | ~5,6-6,5 GB |

- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente para todas las cuantizaciones; A100 o H100 solo tendrian sentido para servir muchas peticiones concurrentes en batch, no por requisitos de memoria.
- Cabe en GPU de consumo: si, en todas las variantes; f16 requiere alrededor de 6 GB de VRAM, y las variantes Q4_K_M o Q5_K_M funcionan comodamente en 4 GB.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, Jan, text-generation-webui y llama-cpp-python. vLLM y TGI tienen soporte de GGUF limitado o experimental, por lo que no son la via recomendada para este repositorio.
- Latencia y throughput: no se han publicado cifras. Dado el reducido numero de parametros (2,5 mil millones) y los tamanos de fichero indicados, es esperable una inferencia interactiva en GPU de gama media y en CPU moderna, pero no hay mediciones confirmadas en la informacion disponible.

## Comparativa con modelos similares

No hay datos de benchmarks ni comparativas publicadas en la informacion disponible que permitan situar este modelo frente a alternativas de su categoria (modelos conversacionales de ~2-3B parametros en GGUF). No se dispone de cifras de MMLU, HumanEval, GSM8K ni de evaluaciones humanas, ni de resultados del modelo base frente a terceros.

La unica comparacion verificable es entre este repositorio y su modelo de origen, que comparten pesos y difieren en formato y precision:

| Aspecto | mradermacher/abliterated-minicpm5-2b-v3-GGUF | KidIkaros/abliterated-minicpm5-2b-v3 |
|---|---|---|
| Parametros | 2.516.756.480 | 2.516.756.480 (mismo modelo base) |
| Formato | GGUF (12 cuantizaciones) | pesos originales (transformers) |
| Licencia | apache-2.0 | apache-2.0 (heredada) |
| Uso tipico | Inferencia local con llama.cpp | Fine-tuning e inferencia con transformers |
| Idiomas | en | en |
| Longitud de contexto | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de la direccion de rechazo implica que el modelo respondera a peticiones que la version alineada rechazaria. No debe desplegarse en productos orientados al publico sin una capa de moderacion externa.
- Riesgo elevado de contenido nocivo: puede generar instrucciones peligrosas, insultos o material inapropiado. La licencia Apache 2.0 no exime al desplegador de responsabilidad legal sobre el uso.
- Alucinacion: con ~2,5 mil millones de parametros la tasa de invencion de hechos es alta; no es adecuado para tareas que exijan precision factual sin verificacion.
- Idiomas: solo ingles declarado. El rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Sin datos de contexto: se desconoce la longitud de contexto real soportada, lo que impide planificar cargas con documentos largos.
- Sin benchmarks: no hay ninguna metrica publicada que permita validar calidad, seguridad ni capacidades reales de tool calling.
- Cuantizaciones estaticas: al no haber variantes ponderadas ni imatrix, las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad mas que una version ponderada equivalente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base no arrastre condiciones adicionales y que los datos de entrenamiento no impongan restricciones.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que confirmen el comportamiento real del modelo.
- Degradacion tipica de la abliteration: ademas del rechazo, la tecnica puede afectar a la coherencia, la instruccion-following y el rendimiento general, sin que existan mediciones publicadas para cuantificarlo.
- Fecha de publicacion futura respecto al momento de redaccion (2026-09-20 segun los metadatos): conviene confirmar la vigencia y el estado del repositorio antes de integrarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/abliterated-minicpm5-2b-v3-GGUF
- Modelo base: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b-v3
- Vista general y lista de descargas de cuantizaciones: https://hf.tst.eu/model#abliterated-minicpm5-2b-v3-GGUF
- Peticiones y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
- Resultados de busqueda web: los enlaces recuperados no guardan relacion con el modelo (apuntan a Reddit), por lo que no se incluyen.
