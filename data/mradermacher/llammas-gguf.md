# mradermacher/Llammas-GGUF

## Resumen

Llammas-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo tartuNLP/Llammas, publicada por el usuario mradermacher. El modelo original ha sido desarrollado por el grupo de investigación en procesamiento del lenguaje natural de la Universidad de Tartu (tartuNLP) y está especializado en estonio e inglés, con un enfoque conversacional. Esta publicación no introduce un modelo nuevo, sino que facilita el despliegue del modelo base en hardware de consumo mediante cuantizaciones de 2 a 16 bits.

El modelo cuenta con 6.738.415.616 parámetros (aproximadamente 6,7 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio, adecuados para inferencia local. La licencia es Llama 2, heredada del modelo base, lo que impone restricciones de uso comercial que conviene revisar antes de desplegarlo en producción.

La relevancia de esta ficha radica en que permite evaluar rápidamente si el modelo es adecuado para tareas en estonio o en entornos bilingües estonio-inglés, y en que ofrece opciones de cuantización ya preparadas para llama.cpp y herramientas compatibles, con tamaños que van desde 2,6 GB hasta 13,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer, segun tags de transformers) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | estonio (et), ingles (en) |
| Licencia | llama2 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 59,6 GB |
| Modelo base | tartuNLP/Llammas |
| Cuantizador | mradermacher |
| Fecha de creacion | 2025-03-09 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base tartuNLP/Llammas en la informacion proporcionada. Los tags de Hugging Face indican que es compatible con la libreria transformers y que se trata de un modelo conversacional. El numero de parametros (6.738.415.616) sugiere una arquitectura transformer de tipo decoder-only de aproximadamente 6,7 mil millones de parametros, consistente con la familia Llama 2, aunque este dato no se confirma explicitamente en la model card.

Tampoco se documentan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de alineacion). La model card del repositorio GGUF es una plantilla generica de mradermacher que solo describe el proceso de cuantizacion, no el entrenamiento del modelo original. Para obtener detalles sobre el entrenamiento seria necesario consultar la model card de tartuNLP/Llammas, que no se incluye en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en estonio e ingles, segun los tags del modelo (`conversational`, idiomas `et` y `en`).
- Soporte bilingue estonio-ingles, lo que lo hace util para tareas de traduccion o atencion en ambos idiomas.
- Inferencia local mediante llama.cpp y herramientas compatibles con GGUF.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades especiales de codigo o matematicas mas alla de las genericas de un modelo conversacional.

## Casos de uso

- Atencion al cliente en estonio: el modelo puede gestionar conversaciones multi-turno en estonio gracias a su especializacion linguistica, adecuado para empresas que operan en el mercado estonio y necesitan un asistente local sin depender de APIs externas.
- Traduccion estonio-ingles: al estar entrenado en ambos idiomas, puede emplearse en pipelines de traduccion automatica o postedicion, especialmente en dominios donde el estonio tiene pocos recursos.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (4,2 GB) permiten ejecutar el modelo en GPUs consumer como una RTX 3060 de 12 GB o incluso en CPU con llama.cpp, lo que facilita prototipado y pruebas locales.
- Asistente conversacional embebido: con cuantizaciones Q2_K o Q3_K_S (2,6-3,0 GB) puede integrarse en dispositivos con recursos limitados o en entornos de borde para tareas de chat simple.
- Generacion de contenido en estonio: redaccion de textos, resumenes o respuestas en estonio para medios, administracion publica o educacion, aprovechando el enfoque del modelo base en ese idioma.
- Investigacion en PLN de bajo recursos: util como linea base para experimentos con estonio, comparacion de cuantizaciones o evaluacion de modelos bilingues en entornos academicos.
- Procesamiento por lotes en CPU: las cuantizaciones Q4 y Q5 permiten ejecutar inferencia por lotes en servidores sin GPU, con throughput moderado, para tareas de clasificacion o generacion no critica en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,6 GB
  - Q3_K_S: ~3,0 GB
  - Q3_K_M: ~3,4 GB
  - Q3_K_L: ~3,7 GB
  - IQ4_XS: ~3,7 GB
  - Q4_K_S: ~4,0 GB
  - Q4_K_M: ~4,2 GB
  - Q5_K_S: ~4,8 GB
  - Q5_K_M: ~4,9 GB
  - Q6_K: ~5,6 GB
  - Q8_0: ~7,3 GB
  - f16: ~13,6 GB
- GPU recomendadas: para cuantizaciones Q4-Q5, una RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) son suficientes. Para f16 se recomienda una GPU con al menos 16 GB de VRAM, como RTX 4080/4090, A100 o H100.
- Cabe en GPU consumer: si, practicamente todas las cuantizaciones hasta Q8_0 caben en GPUs consumer de gama media-alta; f16 requiere una GPU de 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Tambien es posible usar el modelo base en safetensors con transformers, vLLM o TGI, aunque esta publicacion concreta es solo GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llammas-GGUF (este) | 6,74 B | no disponible | et, en | llama2 | GGUF |
| tartuNLP/Llammas (base) | 6,74 B | no disponible | et, en | llama2 | safetensors |
| Llama 2 7B | 6,74 B | 4.096 tokens | en (principalmente) | llama2 | safetensors, GGUF |
| Mistral 7B | 7,24 B | 8.192 tokens | en (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a modelos de tamano similar; no se dispone de datos de rendimiento comparativo en la informacion proporcionada. La principal diferencia de Llammas frente a Llama 2 7B y Mistral 7B es su especializacion en estonio, mientras que su licencia Llama 2 es mas restrictiva que la Apache 2.0 de Mistral.

## Limitaciones y advertencias

- Licencia Llama 2: impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligaciones de atribucion y politicas de uso aceptable). Es necesario revisar los terminos antes de un despliegue comercial.
- Idiomas limitados: solo estonio e ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en dominios especializados.
- Sesgos: no se documentan en la informacion disponible, pero al ser un modelo entrenado principalmente con datos en estonio e ingles puede heredar sesgos de esos corpus.
- Contexto: no se especifica la longitud de contexto soportada; conviene verificarla en la model card del modelo base antes de usarlo en tareas que requieran ventanas largas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de calidad inferior; para produccion se recomienda Q4_K_M o superior.
- Modelo base poco documentado en esta publicacion: la model card del GGUF no incluye informacion sobre entrenamiento, benchmarks ni limitaciones del modelo original.
- Fecha de actualizacion del repo (2026-11-16) posterior a la creacion: puede indicar revisiones de los archivos; conviene verificar la integridad de las descargas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llammas-GGUF
- Modelo base: https://huggingface.co/tartuNLP/Llammas
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Llammas-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Llammas-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
