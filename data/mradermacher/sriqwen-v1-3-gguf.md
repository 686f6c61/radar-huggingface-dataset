# mradermacher/Sriqwen-V1.3-GGUF

## Resumen

Sriqwen-V1.3-GGUF es la distribucion en formato GGUF del modelo Sriqwen-V1.3, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de modelos para su uso con llama.cpp y ecosistemas compatibles. El modelo original lo desarrolla sriq-ai y se distribuye bajo licencia Apache 2.0. Con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones) y capacidades multimodales de entrada texto-imagen, se posiciona en la franja de modelos densos de gran tamano orientados a razonamiento y conversacion.

La relevancia de esta publicacion radica en que pone a disposicion del ecosistema local un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta Q8_0, ademas de IQ4_XS), lo que permite desplegar un modelo de 27B en hardware de consumo con compromisos controlados de calidad. El repo incluye tambien los ficheros mmproj necesarios para el procesamiento de imagenes, lo que habilita inferencia multimodal en llama.cpp.

El modelo base fue entrenado mediante SFT (supervised fine-tuning) sobre el dataset sriq-ai/sriq-sft-v1.3, con tecnicas de LoRA y Unsloth, y esta etiquetado como orientado a razonamiento. La informacion publica disponible no detalla la arquitectura interna ni la longitud de contexto, por lo que varios parametros tecnicos deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso de 27,3B parametros, segun el recuento de safetensors del modelo base) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ficheros mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Sriqwen-V1.3. El recuento de parametros (27,3B) y el uso de la libreria transformers sugieren un transformer denso, pero no se confirma el tipo de atencion, la familia de tokenizador ni la longitud de contexto nativa. El modelo esta etiquetado con text-image-to-text y text-to-text, lo que implica un codificador visual acoplado al modelo de lenguaje, aunque no se especifica cual.

El entrenamiento se realizo mediante SFT sobre el dataset sriq-ai/sriq-sft-v1.3, empleando LoRA y la libreria Unsloth, segun las etiquetas de la model card. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Esta publicacion concreta es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) del modelo original, sin modificaciones de pesos mas alla de la cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat (etiqueta conversational).
- Razonamiento explicito: el modelo esta etiquetado como reasoning y entrenado con SFT orientado a tareas de razonamiento.
- Entrada multimodal texto-imagen: incluye ficheros mmproj para procesar imagenes junto con texto en llama.cpp.
- Comprension de imagenes y respuesta textual (text-image-to-text).
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking explicito: no documentado.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede mantener dialogos multi-turno en un equipo con GPU de consumo usando la cuantizacion Q4_K_M (16,9 GB), adecuada para tarjetas con 24 GB de VRAM.
- Analisis de documentos con imagenes: gracias a los ficheros mmproj, se pueden enviar capturas, diagramas o paginas escaneadas junto con preguntas en texto, util para extraccion de informacion en flujos internos.
- Prototipado de razonamiento en entornos sin conectividad: al ejecutarse con llama.cpp en local, permite experimentar con tareas de razonamiento sin depender de APIs externas ni enviar datos a terceros.
- Investigacion sobre cuantizacion: la disponibilidad de once variantes de cuantizacion permite medir el impacto de la compresion en la calidad de un modelo de 27B, comparando Q2_K (11,0 GB) con Q8_0 (29,1 GB) sobre el mismo conjunto de evaluacion.
- Despliegue en estaciones de trabajo con una sola GPU: la version Q4_K_S (15,9 GB) o IQ4_XS (15,5 GB) cabe en GPUs de 24 GB y permite servir un asistente interno con latencia aceptable.
- Generacion de descripciones textuales de imagenes: el modo text-image-to-text sirve para etiquetar o resumir contenido visual en pipelines de datos, siempre que el idioma de salida sea ingles.
- Evaluacion comparativa de modelos abiertos: al ser Apache 2.0, se puede integrar en bancos de pruebas internos y comparar su rendimiento en tareas de razonamiento frente a otros modelos de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y KV cache):
  - Q2_K: aproximadamente 11 GB de pesos; viable en GPUs de 16 GB con contexto moderado.
  - Q4_K_S / Q4_K_M: 15,9-16,9 GB; recomendado para GPUs de 24 GB (RTX 3090, RTX 4090, A10G).
  - Q5_K_M: 19,6 GB; requiere 24 GB o mas.
  - Q6_K: 22,5 GB; ajustado en 24 GB, comodo en 32 GB o mas.
  - Q8_0: 29,1 GB; requiere GPUs de 32-40 GB (A100 40 GB, A6000) o inferencia parcial en CPU.
  - Ficheros mmproj: 0,7 GB (Q8_0) o 1,0 GB (f16) adicionales para el modo multimodal.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para cuantizaciones Q4 y Q5; A100 40 GB, A6000 o H100 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM usando Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj requieren builds de llama.cpp con soporte multimodal. Para el modelo base en safetensors, transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sriqwen-V1.3 (esta ficha) | 27,3B | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal texto-imagen, solo ingles, orientado a razonamiento |
| Gemma 2 27B | 27B | 8K | Gemma Terms | safetensors, GGUF | Denso, ampliamente cuantizado, sin vision en la variante de texto |
| Qwen2.5-VL 32B | 32B | 128K (segun documentacion del autor) | Apache 2.0 | safetensors, GGUF | Multimodal con contexto largo y multilingue |
| Mistral Small 24B | 24B | 32K | Apache 2.0 | safetensors, GGUF | Denso, multilingue, sin vision |

La comparativa se basa en caracteristicas publicas de cada familia; no se dispone de resultados de benchmarks de Sriqwen-V1.3 para contrastar rendimiento real. Los datos de contexto de los modelos alternativos deben verificarse en sus model cards oficiales.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto: se desconoce la longitud de contexto nativa, lo que impide garantizar conversaciones largas o analisis de documentos extensos.
- Alucinacion: sin benchmarks publicados ni evaluaciones independientes, no hay evidencia sobre la tasa de alucinacion en tareas factuales.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad; el dataset de SFT no es publico en detalle.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento pueden tener condiciones adicionales no reflejadas en la model card; conviene revisar la ficha de sriq-ai/Sriqwen-V1.3.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma notable en modelos de este tamano; para produccion se recomienda Q4_K_M o superior.
- Soporte multimodal: los ficheros mmproj requieren runtimes con soporte especifico; no todos los clientes GGUF los procesan correctamente.
- Madurez: el modelo tiene pocas descargas (320) y ningun like, lo que sugiere escasa validacion por parte de la comunidad.
- Tool calling y agentes: no hay evidencia de soporte nativo, por lo que no deberia asumirse en disenos de produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sriqwen-V1.3-GGUF
- Modelo base: https://huggingface.co/sriq-ai/Sriqwen-V1.3
- Dataset de SFT: https://huggingface.co/datasets/sriq-ai/sriq-sft-v1.3
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Sriqwen-V1.3-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Sriqwen-V1.3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
