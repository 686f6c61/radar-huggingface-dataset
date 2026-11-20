# mradermacher/OralGPT-7B-Preview-GGUF

## Resumen

OralGPT-7B-Preview-GGUF es una versión cuantizada en formato GGUF del modelo OralGPT-7B-Preview, publicada por el usuario mradermacher. El modelo original lo desarrolla Eric3200 y se distribuye bajo licencia Apache 2.0. Se trata de un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) orientado a conversación, con soporte multimodal (los ficheros mmproj incluidos en el repositorio indican capacidad de procesamiento de imagen o audio, aunque la model card no detalla qué modalidad adicional soporta). El nombre "Oral" sugiere un enfoque hacia conversación hablada o procesamiento de voz, si bien no se confirma en la documentación disponible.

La relevancia de esta ficha reside en que mradermacher ofrece un conjunto amplio de cuantizaciones estáticas (desde Q2_K hasta f16) que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 70,4 GB en total por acumular todos los ficheros GGUF, pero cada cuantización individual es mucho más manejable. El modelo declara únicamente el idioma inglés y la librería transformers como marco de referencia. No se dispone de información sobre contexto máximo, datos de entrenamiento ni benchmarks en la documentación proporcionada.

Al ser una versión Preview, conviene tratarla como un artefacto experimental: no hay garantías de estabilidad, no se han publicado evaluaciones y la model card original no está incluida en este repositorio más allá de los metadatos. Para producción sería necesario validar el comportamiento del modelo base antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, inferido por el formato transformers/GGUF; no confirmado) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Eric3200/OralGPT-7B-Preview en la documentacion proporcionada. El recuento de parametros (7.615.616.512) y la etiqueta transformers sugieren un transformer decoder-only de aproximadamente 7,6 B de parametros, pero no se confirma si emplea atencion estandar, atencion lineal, mezcla de expertos u otra variante. La presencia de ficheros `mmproj` en el repositorio GGUF indica que el modelo base incorpora un proyector multimodal, lo que implica que acepta al menos una modalidad adicional (probablemente imagen o audio) ademas de texto; la model card no especifica cual.

Tampoco se detallan los datos de entrenamiento: no hay informacion sobre numero de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o modos de razonamiento extendido. La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: mradermacher indica que se trata de cuantizaciones estaticas (sin imatrix/weighted), generadas con quantize_version 2 y output_tensor_quantised 1, y que no hay planes inmediatos de publicar variantes con imatrix salvo peticion en la seccion de discusiones de la comunidad.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `conversational` y la etiqueta principal es `conversational`, lo que orienta el modelo a dialogos multi-turno.
- Procesamiento multimodal: los ficheros `mmproj` (multi-modal supplement) confirman soporte de al menos una modalidad no textual; la model card no especifica si es vision, audio o ambas.
- Idiomas: unicamente ingles declarado; no hay evidencia de capacidades multilingues.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades de codigo o matematicas: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno gracias a su naturaleza `conversational`; al estar disponible en GGUF, se puede desplegar rapidamente en local con llama.cpp u Ollama para validar flujos antes de invertir en modelos mayores.
- Experimentacion multimodal en hardware de consumo: la cuantizacion Q4_K_M (4,8 GB) junto con el proyector mmproj-Q8_0 (1,0 GB) permite probar entrada multimodal en GPUs con 8 GB de VRAM o incluso en CPU, algo inviable con el modelo en f16.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion del mismo modelo, lo que facilita estudios de degradacion de calidad frente a tamano (util para decidir el punto de equilibrio en produccion).
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (3,1 GB) permite ejecutar el modelo en dispositivos con poca memoria, util para demos en portatiles o entornos edge donde no se requiere maxima calidad.
- Investigacion sobre modelos "Preview": al ser un modelo experimental sin benchmarks publicados, sirve como caso de estudio para analizar como se comportan modelos no evaluados en tareas conversacionales antes de su validacion formal.
- Fine-tuning o destilacion sobre el modelo base: al estar disponible el modelo original en safetensors (Eric3200/OralGPT-7B-Preview), se puede partir de el para ajuste fino y luego cuantizar a GGUF con el mismo pipeline de mradermacher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q3_K_M ~3,9 GB; Q3_K_L ~4,2 GB; IQ4_XS ~4,4 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_S ~5,4 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. Anadir ~1,0 GB (mmproj-Q8_0) o ~1,5 GB (mmproj-f16) si se usa la modalidad multimodal.
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4070 Ti Super o RTX 4080 (16 GB) o superior; para f16, una RTX 4090 (24 GB), A100 o H100. Para Q2_K–Q3_K, GPUs de 6-8 GB como RTX 3050 o RTX 4060.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 8-16 GB; f16 requiere 24 GB o mas. Las cuantizaciones Q2_K a Q4_K_S tambien pueden ejecutarse en CPU con llama.cpp, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` lo sugiere). vLLM y TGI no soportan GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OralGPT-7B-Preview-GGUF (este) | 7,6 B | no disponible | Apache 2.0 | GGUF | Multimodal (mmproj), solo ingles, sin benchmarks publicados |
| Mistral-7B-Instruct (referencia de categoria) | 7,2 B | 32 K (v0.2) | Apache 2.0 | safetensors, GGUF | Ampliamente evaluado, ecosistema maduro, solo texto |
| Llama 3.1 8B Instruct | 8,0 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Multilingue, tool calling, benchmarks publicados |
| Qwen2.5-7B-Instruct | 7,6 B | 128 K | Apache 2.0 | safetensors, GGUF | Multilingue, buen rendimiento en codigo y matematicas |

La comparacion se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo OralGPT que permitan una comparacion cuantitativa. Los datos de los modelos alternativos corresponden a sus especificaciones publicas habituales.

## Limitaciones y advertencias

- Modelo en estado Preview: sin benchmarks publicados ni validacion externa; no se recomienda su uso en produccion sin una evaluacion previa exhaustiva.
- Idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Contexto: se desconoce la longitud maxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Multimodalidad no documentada: los ficheros mmproj existen, pero la model card no especifica que modalidad cubren ni su calidad; conviene probarlo antes de integrarlo.
- Riesgo de alucinacion: inherente a los modelos de 7 B sin datos de alineacion publicados; especialmente relevante en dominios factuales.
- Sesgos: no hay informacion sobre el corpus de entrenamiento ni sobre filtros de sesgo; se deben asumir los sesgos tipicos de modelos entrenados predominantemente en ingles.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el modelo base (Eric3200/OralGPT-7B-Preview) mantiene la misma licencia y que los datos de entrenamiento no imponen restricciones adicionales.
- Cuantizaciones estaticas sin imatrix: mradermacher indica que no hay variantes con imatrix/weighted; para maxima calidad en tamano reducido, IQ4_XS es la opcion disponible, pero sin el ajuste fino que aportaria una imatrix.
- Repositorio de 70,4 GB: descargar el repositorio completo es innecesario; conviene bajar solo el fichero GGUF de la cuantizacion elegida y, si se usa multimodal, el mmproj correspondiente.

## Enlaces

- Repositorio Hugging Face (esta version GGUF): https://huggingface.co/mradermacher/OralGPT-7B-Preview-GGUF
- Modelo base: https://huggingface.co/Eric3200/OralGPT-7B-Preview
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#OralGPT-7B-Preview-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher: https://www.nethype.de/
