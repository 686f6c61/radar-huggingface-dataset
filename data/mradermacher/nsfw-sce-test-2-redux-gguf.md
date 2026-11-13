# mradermacher/nsfw-sce-test-2-redux-GGUF

## Resumen

`mradermacher/nsfw-sce-test-2-redux-GGUF` es una coleccion de cuantizaciones GGUF del modelo `mergekit-community/nsfw-sce-test-2-redux`, un merge de modelos creado con la herramienta mergekit. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos open source, mientras que el modelo base procede de la comunidad mergekit. El modelo cuenta con aproximadamente 8.030 millones de parametros (8B) y esta orientado a generacion de texto conversacional en ingles, con la etiqueta `not-for-all-audiences` que indica contenido para adultos o sensible.

La relevancia de esta ficha es practica: se trata de un modelo derivado (un merge) del que no se publican detalles de arquitectura ni de entrenamiento en la informacion disponible, pero cuya utilidad principal es la existencia de cuantizaciones GGUF listas para ejecutar en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 71,8 GB e incluye desde cuantizaciones Q2_K de 3,3 GB hasta f16 de 16,2 GB, lo que permite desplegarlo en un rango amplio de GPUs.

No se dispone de informacion sobre la licencia, el pipeline, la longitud de contexto ni los datos de entrenamiento del modelo base. Esta ficha documenta lo que se puede verificar a partir de los metadatos y la model card, e indica explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base creado con mergekit; se asume transformer, sin confirmar) |
| Parametros totales | 8.030.261.312 (aproximadamente 8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 71,8 GB |
| Cuantizaciones ponderadas / imatrix | no disponibles segun el autor |
| Etiquetas | transformers, gguf, mergekit, merge, conversational, not-for-all-audiences, endpoints_compatible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `mergekit-community/nsfw-sce-test-2-redux` en la documentacion proporcionada. Por el nombre y las etiquetas (`mergekit`, `merge`) se trata de un modelo resultante de la fusion de pesos de otros modelos mediante mergekit, una tecnica que combina los tensores de varios checkpoints sin un entrenamiento adicional completo. El recuento de parametros (8.030 millones) sugiere un transformer de escala 8B, pero no se confirma la familia arquitectonica ni la configuracion de capas y atencion.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor de las cuantizaciones solo documenta el proceso de conversion a GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf) y advierte de que no ha generado cuantizaciones ponderadas ni imatrix para este modelo.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Contenido orientado a adultos o sensible: la etiqueta `not-for-all-audiences` indica que el modelo esta pensado para tematicas NSFW, lo que condiciona su uso.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Ejecucion local mediante GGUF: soporta inferencia en CPU y GPU con llama.cpp y derivados.
- No se ha confirmado soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades multilingues mas alla del ingles.
- No se ha confirmado razonamiento matematico ni generacion de codigo especializada.

## Casos de uso

- Generacion creativa de ficcion para adultos: el modelo esta etiquetado como `not-for-all-audiences` y `conversational`, por lo que su uso previsto es la escritura asistida de narrativa y dialogos de tematica adulta, ejecutandose localmente con cuantizaciones Q4 o Q5 para equilibrar calidad y VRAM.
- Prototipado de chatbots con contenido sin filtros: al no constar restricciones de alineacion en la informacion disponible, puede emplearse en entornos controlados para experimentar con personajes y respuestas sin las limitaciones de modelos comerciales, siempre con las advertencias legales correspondientes.
- Investigacion sobre merges de modelos: util para estudiar el comportamiento de modelos fusionados con mergekit y comparar la calidad de distintas cuantizaciones (Q2_K frente a Q8_0) sobre el mismo checkpoint.
- Despliegue en hardware de consumo: con cuantizaciones de 3,3 GB (Q2_K) a 5,8 GB (Q5_K_M) puede ejecutarse en GPUs de gama media y en equipos con poca VRAM, lo que facilita pruebas locales sin infraestructura dedicada.
- Evaluacion de cuantizaciones: el repositorio ofrece doce variantes del mismo modelo, lo que permite medir la degradacion de perplejidad y coherencia entre Q2_K, Q4_K_M y Q8_0 en tareas conversacionales.
- Integracion en pipelines de inferencia compatibles con endpoints: la etiqueta `endpoints_compatible` permite servirlo a traves de APIs estandar para aplicaciones que necesiten un modelo conversacional en ingles sin dependencia de proveedores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K 3,3 GB; Q3_K_S 3,8 GB; Q3_K_M 4,1 GB; Q3_K_L 4,4 GB; IQ4_XS 4,6 GB; Q4_K_S 4,8 GB; Q4_K_M 5,0 GB; Q5_K_S 5,7 GB; Q5_K_M 5,8 GB; Q6_K 6,7 GB; Q8_0 8,6 GB; f16 16,2 GB.
- GPU recomendadas: para f16 se necesita una GPU con al menos 16-20 GB de VRAM (A100 40 GB, H100, RTX 4090 24 GB). Para Q8_0 basta una RTX 4090 o A6000. Para Q4_K_M y Q5_K_M son suficientes GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3080).
- Cabe en GPU de consumo: si, desde cuantizaciones Q2_K en GPUs de 4-6 GB (GTX 1650, RTX 3050) hasta Q5_K_M en GPUs de 8 GB. Las cuantizaciones Q6_K y Q8_0 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se ha confirmado soporte en vLLM o TGI para este formato.
- Latencia y throughput: no disponibles. Dependen del hardware, del backend y del tamano de cuantizacion; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas. A continuacion se comparan unicamente los datos verificables de formato y tamano frente a otras familias de modelos 8B habitualmente distribuidas en GGUF.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| nsfw-sce-test-2-redux (este) | 8,03B | no disponible | no disponible | Si (12 variantes) | Merge con mergekit, orientado a NSFW, solo ingles |
| Meta Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community | Si | Referencia generalista, multilingue |
| Mistral 7B Instruct | 7,24B | 32K | Apache 2.0 | Si | Menor tamano, licencia permisiva |
| Qwen2.5 7B Instruct | 7,62B | 128K | Apache 2.0 (mayoria variantes) | Si | Multilingue, buen rendimiento en codigo |

La comparacion de rendimiento no es posible: no hay benchmarks publicados para este modelo y no se debe inferir calidad a partir del tamano.

## Limitaciones y advertencias

- Contenido para adultos: la etiqueta `not-for-all-audiences` indica que el modelo puede generar material NSFW; no es apto para entornos sin control de edad ni para aplicaciones de cara al publico general.
- Licencia no disponible: al no constar la licencia del modelo base ni de las cuantizaciones, no se puede garantizar el uso comercial. Es imprescindible verificar la licencia en el repositorio del modelo base antes de cualquier despliegue en produccion.
- Solo ingles: el modelo esta etiquetado exclusivamente para `en`; no hay evidencia de capacidades multilingues.
- Sin datos de entrenamiento ni de alineacion: se desconoce si el modelo ha pasado por RLHF o DPO, lo que aumenta el riesgo de respuestas toxicas, sesgadas o alucinaciones no mitigadas.
- Sin benchmarks: no hay evidencia cuantitativa de calidad; el rendimiento real en tareas concretas debe evaluarse empiricamente.
- Sin cuantizaciones imatrix: el autor indica que no hay versiones ponderadas, por lo que las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar la calidad mas de lo habitual.
- Contexto desconocido: no se puede planificar su uso en conversaciones de contexto largo sin verificar la ventana real del modelo base.
- Modelo derivado de un merge: la fusion de pesos puede producir comportamientos impredecibles o inconsistencias que no aparecen en modelos entrenados de forma convencional.
- Repositorio de 71,8 GB: la descarga completa es costosa; conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/nsfw-sce-test-2-redux-GGUF
- Modelo base: https://huggingface.co/mergekit-community/nsfw-sce-test-2-redux
- Pagina de descargas del autor: https://hf.tst.eu/model#nsfw-sce-test-2-redux-GGUF
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
