# mradermacher/BLIP-Live-Gemma-GGUF

## Resumen

BLIP-Live-Gemma-GGUF es la distribucion en formato GGUF del modelo multimodal Salesforce/BLIP-Live-Gemma, publicada por el cuantizador mradermacher. El modelo original, desarrollado por Salesforce, combina un encoder visual de la familia BLIP con un modelo de lenguaje Gemma para tareas de comprension de video en streaming, es decir, procesamiento continuo de fotogramas o clips de video con contexto conversacional. Esta version GGUF esta pensada para inferencia local eficiente mediante llama.cpp y sus derivados (Ollama, LM Studio, etc.).

El modelo cuenta con aproximadamente 25.230 millones de parametros totales segun los pesos safetensors del modelo base, y se distribuye bajo licencia CC-BY-NC-4.0, lo que restringe el uso comercial. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa: la model card del cuantizador solo documenta el proceso de cuantizacion, no las caracteristicas tecnicas del modelo original.

La relevancia de esta ficha radica en que se trata de una de las pocas opciones publicas para ejecutar un modelo multimodal de video en streaming en hardware de consumo, gracias a las cuantizaciones que van desde Q2_K (10,7 GB) hasta Q8_0 (27,0 GB). El repositorio incluye ademas los archivos mmproj necesarios para el procesamiento visual (0,9 GB en Q8_0 y 1,3 GB en f16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal BLIP + Gemma, segun nombre y tags) |
| Parametros totales | 25.233.142.046 (~25,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (con archivos mmproj separados para la parte multimodal) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original Salesforce/BLIP-Live-Gemma. Por el nombre y los tags (blip-live, video, streaming, merged) se infiere que combina un componente visual tipo BLIP con un modelo de lenguaje Gemma, orientado a la comprension de video en streaming. El tag "merged" sugiere que el modelo base es el resultado de una fusion de pesos. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Respecto al proceso de cuantizacion, la model card del repositorio indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) generadas a partir del modelo en transformers. Se ofrecen tanto cuantizaciones estandar como, en un repositorio separado, cuantizaciones con imatrix (i1-GGUF). Los archivos mmproj se distribuyen por separado para el procesamiento multimodal.

## Capacidades

- Comprension de video en streaming: el modelo esta disenado para procesar flujos de video de forma continua, segun los tags y el nombre del modelo base.
- Procesamiento multimodal: requiere los archivos mmproj (Q8_0 o f16) para la parte visual; sin ellos solo funciona la parte de lenguaje.
- Generacion de texto conversacional: el tag "conversational" indica soporte para dialogos multi-turno.
- Capacidades de lenguaje heredadas de Gemma: generacion de texto y razonamiento general (no se detallan capacidades especificas de codigo o matematicas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (en); no se confirman otros idiomas.
- Modo thinking, vision, audio u otras capacidades especiales: solo se confirma vision/video; no hay informacion sobre modo thinking ni audio.

## Casos de uso

- Analisis de video en tiempo real: el modelo puede procesar fotogramas de un flujo de video continuo y generar descripciones o responder preguntas sobre lo que ocurre, gracias a su diseno especifico para streaming.
- Moderacion de contenido audiovisual: integrado en un pipeline que envie clips cortos al modelo, puede generar descripciones textuales que alimenten clasificadores de contenido inapropiado.
- Asistencia a personas con discapacidad visual: descripcion conversacional de escenas de video capturadas por camara, aprovechando el modo conversacional y el procesamiento visual.
- Transcripcion descriptiva de reuniones o clases grabadas: generar resumenes de lo que se muestra en pantalla junto con el contexto hablado, si se combina con ASR externo.
- Prototipado de agentes de video en local: gracias a las cuantizaciones Q4_K_S (15,6 GB) y Q4_K_M (16,9 GB), se puede desplegar en una GPU de consumo para experimentacion e investigacion.
- Investigacion academica sobre modelos multimodales de video: la licencia CC-BY-NC-4.0 permite uso no comercial, adecuado para entornos universitarios y proyectos de investigacion.
- Demos interactivas de vision por computador: con llama.cpp u Ollama se puede montar una demo local que reciba video y responda preguntas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado):
  - Q2_K: ~11-12 GB
  - Q3_K_S: ~13 GB
  - Q4_K_S / Q4_K_M: ~16-18 GB
  - Q5_K_M: ~20 GB
  - Q6_K: ~23-24 GB
  - Q8_0: ~28-30 GB
  - Anadir ~1-2 GB si se usa el mmproj para vision.
- GPU recomendadas: para Q8_0, una A100 40 GB, H100 o RTX 4090 24 GB (con Q4/Q5); para cuantizaciones Q4_K_M, una RTX 4090, RTX 3090 o RTX 4080 de 16 GB o superior.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K_M o Q4_K_S; en GPUs de 12 GB solo con Q2_K y posiblemente con offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF y mmproj (koboldcpp, entre otros).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BLIP-Live-Gemma-GGUF (este) | ~25,2 B | no disponible | CC-BY-NC-4.0 | GGUF | Multimodal video streaming, solo ingles declarado |
| Salesforce/BLIP-Live-Gemma (base) | ~25,2 B | no disponible | CC-BY-NC-4.0 | safetensors | Modelo original en transformers, sin cuantizar |
| Alternativas de video-LLM cuantizadas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohibido el uso comercial sin licencia adicional de Salesforce.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje; las descripciones de video pueden contener errores factuales.
- No se dispone de informacion sobre sesgos del modelo original ni sobre su evaluacion de seguridad.
- La cuantizacion introduce perdida de calidad, especialmente en Q2_K y Q3_K_M (marcada como "lower quality" por el autor).
- El modelo requiere los archivos mmproj para funcionar como multimodal; sin ellos solo opera como modelo de texto.
- No hay informacion sobre la longitud de contexto soportada, lo que dificulta planificar casos de uso con videos largos.
- El repositorio tiene 0 likes y 973 descargas en el momento de la consulta, lo que indica validacion comunitaria limitada.
- La fecha de creacion (2026-11-24) y el identificador arXiv (2611.21553) deben verificarse en la fuente original antes de citarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BLIP-Live-Gemma-GGUF
- Modelo base: https://huggingface.co/Salesforce/BLIP-Live-Gemma
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/BLIP-Live-Gemma-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#BLIP-Live-Gemma-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
