# mradermacher/tr-gemma-128k-4b-GGUF

## Resumen

tr-gemma-128k-4b-GGUF es la version cuantizada en formato GGUF del modelo tr-gemma-128k-4b, desarrollado originalmente por AhmetSemih y convertido a GGUF por mradermacher. Se trata de un modelo derivado de la familia Gemma de Google, con aproximadamente 3.544 millones de parametros totales (3,5B) y una ventana de contexto nominal de 128.000 tokens, segun indica su nombre. El modelo base esta etiquetado como conversacional y esta pensado para generacion de texto y dialogos.

La relevancia de esta publicacion radica en su empaquetado: mradermacher ofrece un conjunto completo de cuantizaciones estaticas (desde Q2_K hasta Q8_0, ademas de f16) que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp y sus derivados. El repositorio incluye tambien ficheros mmproj, lo que sugiere soporte multimodal en el modelo base, aunque la model card no detalla las capacidades de vision.

La informacion disponible es limitada: la model card del cuantizador es generica y no incluye datos sobre el entrenamiento, los datos utilizados ni resultados de benchmarks. El modelo base declara licencia MIT y el idioma ingles, si bien el prefijo "tr-" del nombre podria sugerir un enfasis en turco que no esta confirmado en la documentacion proporcionada. El numero de descargas (74) y likes (1) indica una adopcion muy baja en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Gemma, transformer decoder-only segun la denominacion) |
| Parametros totales | 3.544.718.848 (3,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (segun el nombre del modelo; no confirmado en la model card) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la denominacion "gemma" y el tamano de 3,5B parametros, se trata presumiblemente de un transformer decoder-only derivado de Gemma, pero no se confirma en la model card. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La unica innovacion tecnica documentada es el proceso de cuantizacion realizado por mradermacher, que genera cuantizaciones estaticas (no ponderadas ni con imatrix, segun indica el propio autor). El repositorio incluye ficheros mmproj, lo que apunta a que el modelo base incorpora un proyector multimodal para entrada de imagenes, aunque no se detalla su funcionamiento ni el modelo de vision asociado.

## Capacidades

- Generacion de texto y conversacion: el modelo esta etiquetado como "conversational" y orientado a dialogos multi-turno.
- Ventana de contexto larga: el nombre del modelo indica 128.000 tokens, lo que permitiria procesar documentos extensos o conversaciones prolongadas (dato no verificado en la model card).
- Posible soporte multimodal: la presencia de ficheros mmproj sugiere capacidad de procesamiento de imagenes, aunque no se documenta en la informacion disponible.
- Idiomas: la model card declara unicamente ingles; no se confirma soporte multilingue ni un enfasis especifico en turco a pesar del prefijo "tr-".
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: con una ventana de contexto de hasta 128.000 tokens (segun especificacion nominal), el modelo podria mantener historiales de conversacion largos y consultar documentacion de soporte extensa en una sola pasada, siempre que se valide el rendimiento real en contextos largos.
- Procesamiento de documentos en local: las cuantizaciones Q4_K_M (2,3 GB) y Q5_K_M (2,7 GB) permiten desplegar el modelo en equipos sin GPU dedicada para tareas de resumen, extraccion de informacion y clasificacion de textos extensos.
- Prototipado rapido de asistentes conversacionales: al estar disponible en GGUF y con licencia MIT, es adecuado para experimentar con pipelines de chat en llama.cpp u Ollama sin coste de licencia.
- Generacion de texto asistida en entornos con recursos limitados: las versiones Q2_K (1,6 GB) y Q3_K_S (1,8 GB) permiten ejecucion en dispositivos de gama baja o en CPU, a costa de perdida de calidad.
- Analisis de imagenes (si se confirma el soporte multimodal): los ficheros mmproj permitirian, en teoria, tareas de descripcion de imagenes o respuesta a preguntas visuales mediante llama.cpp, aunque esta capacidad no esta documentada ni validada en la informacion disponible.
- Base para fine-tuning o experimentacion academica: la licencia MIT y el tamano contenido facilitan su uso como punto de partida en investigacion sobre modelos de lenguaje pequenos y cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,6 GB
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS: ~1,8-2,1 GB
  - Q4_K_S / Q4_K_M: ~2,2-2,3 GB
  - Q5_K_S / Q5_K_M: ~2,6-2,7 GB
  - Q6_K: ~3,0 GB
  - Q8_0: ~3,9 GB
  - f16: ~7,2 GB
  - mmproj (si se usa vision): +0,7 GB (Q8_0) o +1,0 GB (f16)
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060, RTX 4060 o superior permite ademas contextos largos. Para contexto de 128.000 tokens es necesario reservar VRAM adicional para la cache KV, cuyo tamano depende de la configuracion del modelo y no se especifica.
- Cabe en GPU consumer: si, en todas las cuantizaciones hasta Q8_0; f16 requiere al menos 8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El formato GGUF no es compatible directamente con vLLM ni TGI sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tr-gemma-128k-4b-GGUF | 3,5B | 128k (nominal) | MIT | GGUF | Cuantizaciones estaticas de mradermacher |
| Gemma 3 4B (referencia de familia) | ~4B | no disponible | Gemma Terms | safetensors, GGUF | Modelo original de Google; requiere aceptar terminos |
| Qwen2.5 3B | 3,1B | 32k (128k en variantes) | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar con amplio soporte de cuantizaciones |
| Llama 3.2 3B | 3,2B | 128k | Llama 3.2 Community License | safetensors, GGUF | Contexto largo y ecosistema amplio; licencia con restricciones |

La comparativa se basa en caracteristicas generales de modelos de tamano similar; no se dispone de datos de rendimiento comparativo para tr-gemma-128k-4b en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion documental muy escasa: la model card del cuantizador es generica y no describe el modelo base, sus datos de entrenamiento ni sus capacidades reales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se ha evaluado su tasa de error factual.
- Contexto largo no verificado: los 128.000 tokens se deducen del nombre del modelo, pero no se confirma en la documentacion ni se han publicado pruebas de rendimiento en contextos extensos.
- Idioma: la model card declara solo ingles; el uso en castellano no esta garantizado y podria degradar la calidad.
- Multimodalidad no documentada: la presencia de ficheros mmproj sugiere vision, pero no hay instrucciones ni validacion de esta capacidad.
- Cuantizaciones estaticas: el autor indica que no hay cuantizaciones ponderadas ni imatrix, lo que puede suponer una perdida de calidad mayor en los niveles bajos (Q2_K, Q3_K_S) frente a alternativas ponderadas.
- Adopcion muy baja: 74 descargas y 1 like en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar que el modelo base no imponga restricciones adicionales (la model card declara MIT, aunque el modelo base podria derivar de Gemma con sus propios terminos).
- Fecha de creacion futura en los metadatos (2026-02-14): conviene tratar las fechas con cautela.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/tr-gemma-128k-4b-GGUF
- Modelo base: https://huggingface.co/AhmetSemih/tr-gemma-128k-4b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#tr-gemma-128k-4b-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
