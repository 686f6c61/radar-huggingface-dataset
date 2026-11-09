# mradermacher/lfm3-omni-2b-abliterated-heretic-v2-GGUF

## Resumen

Esta ficha describe `mradermacher/lfm3-omni-2b-abliterated-heretic-v2-GGUF`, una recopilacion de cuantizaciones GGUF estaticas del modelo `mizahnyx/lfm3-omni-2b-abliterated-heretic-v2`, que a su vez deriva del modelo omni de Liquid AI LFM3-Omni-2B. El trabajo de cuantizacion lo firma mradermacher (equipo de nethype GmbH), mientras que el modelo base original procede de Liquid AI. La relevancia de esta publicacion es practica: pone a disposicion del ecosistema llama.cpp/Ollama una version multimodal (texto, imagen, video y audio) de un modelo de aproximadamente 1,7 mil millones de parametros, con licencia LFM Open License v1.0.

El modelo base es un modelo "abliterated/heretic", es decir, una variante en la que se ha eliminado o debilitado el comportamiento de rechazo (refusal) del modelo original, orientada a generar respuestas sin censura. Esta ficha se centra en el artefacto GGUF publicado, pero conviene tener presente que las capacidades y limitaciones heredadas provienen del modelo base y del proceso de abliteracion.

El repositorio tiene un tamano de 17,3 GB y contiene 14 ficheros GGUF: desde Q2_K (0,9 GB) hasta f16 (3,6 GB), mas dos ficheros `mmproj` (Q8_0 y f16) que aportan el componente multimodal. No se dispone de informacion sobre contexto maximo, composicion del dataset de entrenamiento ni benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni-2B de Liquid AI; familia liquid/lfm3, multimodal omni) |
| Parametros totales | 1.728.801.600 (aprox. 1,7 B, dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other"); enlace a la licencia del modelo original de LiquidAI |
| Formato de pesos | GGUF (transformers como libreria declarada) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. Por la familia del modelo base (`liquid`, `lfm3`, `lfm3-omni`) y la descripcion de Liquid AI, se trata de un modelo omni end-to-end que comprende texto, imagenes, video y audio, y que responde en texto, voz o texto y voz intercalados. El modelo aqui publicado es una variante abliterated/heretic del modelo base `mizahnyx/lfm3-omni-2b-abliterated-heretic-v2`, lo que implica una modificacion de pesos orientada a suprimir el comportamiento de rechazo.

El artefacto de mradermacher es una cuantizacion estatica (convert_type: hf, quantize_version 2, output_tensor_quantised 1). El autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion y que no tiene previsto generarlas, salvo peticion en la discusion comunitaria. No se han publicado datos sobre numero de tokens de entrenamiento, composicion del dataset, RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Comprension multimodal: texto, imagenes, video y audio (segun la descripcion de LFM3-Omni-2B de Liquid AI), siempre que se cargue el fichero `mmproj` correspondiente junto al GGUF.
- Respuesta multimodal: texto, voz o texto y voz intercalados (capacidad declarada del modelo base).
- Cobertura multilingue amplia: 23 idiomas, incluidos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso, polaco, danes, griego, finlandes, hebreo, neerlandes, sueco y turco.
- Comportamiento "abliterated/heretic": se elimina o reduce el rechazo del modelo original, lo que permite respuestas sin censura en temas que el modelo base rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local multilingue: el modelo puede mantener conversaciones multi-turno en 23 idiomas y desplegarse en llama.cpp u Ollama con cuantizaciones de 1-2 GB, lo que lo hace adecuado para prototipos y entornos con recursos limitados.
- Descripcion de imagenes en local: cargando el GGUF junto al `mmproj-Q8_0` o `mmproj-f16`, se puede usar para captioning, extraccion de informacion de capturas o accesibilidad, sin depender de APIs en la nube.
- Analisis de audio y video de forma ligera: al ser un modelo omni, permite transcribir o resumir contenido audiovisual en flujos de trabajo locales, siempre que la integracion con llama.cpp soporte las modalidades correspondientes.
- Generacion de respuestas sin filtro para investigacion: util en estudios sobre sesgos, seguridad y comportamiento de modelos abliterated, donde se necesita un modelo que no rechace peticiones para analizar respuestas.
- Chatbot de atencion al ciudadano en varios idiomas: la cobertura de 23 lenguas permite desplegar un asistente multilingue en una sola instancia pequena, con cuantizacion Q4_K_M (1,2 GB) para latencia baja.
- Prototipado rapido en CPU o GPU de gama baja: las cuantizaciones Q2_K (0,9 GB) y Q3_K_S (1,0 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, ideales para demos y pruebas de concepto.
- Generacion de voz sintetica en local: si se integra la salida de voz del modelo base, puede emplearse en aplicaciones de lectura en voz alta o asistentes por voz, sujeto a las limitaciones de la integracion GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto): Q2_K ~0,9 GB; Q3_K_S ~1,0 GB; IQ4_XS ~1,1 GB; Q4_K_S/Q4_K_M ~1,2 GB; Q5_K_M ~1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB. El `mmproj` anade ~0,6 GB (Q8_0) o ~1,0 GB (f16).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para cuantizaciones Q4-Q8; para f16 y contexto largo se recomienda 8 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090). Para despliegue en servidor, A100 o H100 no son necesarias por tamano, pero pueden usarse para alto throughput.
- Cabe en GPU consumer: si, practicamente en todas las GPU modernas con 4 GB o mas, usando Q4_K_M o inferior. Tambien es viable en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, etc.). vLLM y TGI no estan confirmados para este artefacto GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. Por el tamano (~1,7 B parametros) se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| lfm3-omni-2b-abliterated-heretic-v2-GGUF (este) | ~1,7 B | no disponible | texto, imagen, video, audio | lfm-open-license-v1.0 | GGUF |
| LFM3-Omni-2B (Liquid AI, original) | ~2 B (nominal) | no disponible | texto, imagen, video, audio | lfm-open-license-v1.0 | safetensors (no confirmado) |
| mizahnyx/lfm3-omni-2b-abliterated-heretic-v2 (base de este GGUF) | ~1,7 B | no disponible | texto, imagen, video, audio | no disponible | safetensors (no confirmado) |

No se dispone de datos de rendimiento comparativo ni de otros modelos omni de tamano similar en la informacion proporcionada para establecer una comparativa mas amplia.

## Limitaciones y advertencias

- Al ser una variante abliterated/heretic, el modelo puede generar contenido que el original rechazaria; no es adecuado para produccion orientada al publico general sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; en modelos pequenos (~1,7 B) la tasa de alucinacion suele ser alta, aunque no hay datos concretos en la informacion disponible.
- Contexto maximo desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar la configuracion del runtime.
- Licencia LFM Open License v1.0: hay que revisar sus terminos para uso comercial; la etiqueta "other" en Hugging Face indica que no es una licencia estandar reconocida.
- Las capacidades multimodales dependen de que el runtime cargue correctamente el `mmproj`; no todos los clientes GGUF soportan audio y video.
- El proceso de abliteracion puede degradar capacidades generales (razonamiento, instrucciones) respecto al modelo original; no hay benchmarks que lo cuantifiquen.
- Cuantizaciones Q2_K y Q3_K_S sacrifican calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio y Q8_0 para maxima calidad.
- No hay cuantizaciones imatrix/ponderadas publicadas por el autor en el momento de la ficha.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de funcionamiento en produccion.

## Enlaces

- Hugging Face (este artefacto): https://huggingface.co/mradermacher/lfm3-omni-2b-abliterated-heretic-v2-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/mizahnyx/lfm3-omni-2b-abliterated-heretic-v2
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#lfm3-omni-2b-abliterated-heretic-v2-GGUF
- Documentacion de LFM3-Omni-2B (Liquid AI): https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Pagina del equipo mradermacher: https://huggingface.co/mradermacher/models
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
