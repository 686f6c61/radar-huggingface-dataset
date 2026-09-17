# devendradhakad/autodroid-openbmb-MiniCPM-V-4.6-gguf

## Resumen

El repositorio `devendradhakad/autodroid-openbmb-MiniCPM-V-4.6-gguf` aloja una cuantizacion en formato GGUF (llama.cpp) del modelo multimodal MiniCPM-V 4.6 de OpenBMB. No es un modelo original, sino una conversion de terceros de los pesos oficiales, publicada por el usuario devendradhakad bajo licencia Apache 2.0 y pensada para ejecucion en dispositivos de borde mediante llama.cpp u Ollama. El repositorio ocupa 1,6 GB y registra 0 descargas y 0 "likes", por lo que no cuenta con validacion de la comunidad.

El modelo base, MiniCPM-V 4.6, es un MLLM (modelo de lenguaje multimodal) de tipo "pocket-sized" construido sobre un codificador visual SigLIP2-400M y un LLM Qwen3.5-0.8B. Su propuesta de valor es la eficiencia: segun la model card, reduce los FLOPs de codificacion visual en mas de un 50% respecto a versiones anteriores e introduce compresion mixta de tokens visuales 4x/16x, lo que permite intercambiar precision por velocidad. Ademas, ofrece aproximadamente 1,5x mas throughput de tokens que Qwen3.5-0.8B.

La relevancia actual del modelo radica en su orientacion a despliegue en iOS, Android y HarmonyOS con codigo de adaptacion abierto, y en su compatibilidad con vLLM, SGLang, llama.cpp, Ollama, SWIFT y LLaMA-Factory. La metadata de HuggingFace indica 752.161.600 parametros para este repositorio, aunque no se detalla la composicion exacta de esa cifra en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM: codificador visual SigLIP2-400M + LLM Qwen3.5-0.8B (transformer multimodal, tecnica LLaVA-UHD v4) |
| Parametros totales | 752.161.600 (metadata de safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (este repositorio); el modelo base ofrece GGUF, BNB, AWQ y GPTQ |
| Idiomas soportados | no disponible en la metadata del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tarea (pipeline) | image-text-to-text |
| Modelo base | openbmb/MiniCPM-V-4.6 |
| Tamano del repositorio | 1,6 GB |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 combina un codificador visual SigLIP2-400M con un modelo de lenguaje Qwen3.5-0.8B, siguiendo el esquema clasico de los MLLM tipo LLaVA: proyeccion de las representaciones visuales al espacio de embeddings del LLM y generacion autoregresiva de texto condicionada por la imagen o el video. La innovacion principal declarada es la adopcion de la tecnica de LLaVA-UHD v4, que reduce los FLOPs de codificacion visual en mas de un 50%, y la incorporacion de un esquema de compresion mixta de tokens visuales con factores 4x y 16x, seleccionable en funcion del equilibrio deseado entre precision y velocidad.

El modelo base conserva las capacidades de comprension de imagen unica, multiples imagenes y video de la familia MiniCPM-V. La model card menciona tanto una variante instruct como una variante thinking (MiniCPM-V 4.6-Thinking), con graficas de evaluacion separadas. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni el uso concreto de RLHF o DPO. Si se indica que el modelo se distribuye con variantes cuantizadas en GGUF, BNB, AWQ y GPTQ, y que es compatible con los ecosistemas de ajuste fino SWIFT y LLaMA-Factory.

## Capacidades

- Comprension de imagen unica: descripcion de escenas, reconocimiento de objetos, lectura de texto en imagenes (OCR) y respuesta a preguntas visuales.
- Comprension de multiples imagenes: comparacion y razonamiento sobre varias imagenes en una misma conversacion.
- Comprension de video: procesamiento de secuencias de video (la model card menciona el uso de `torchcodec` o `PyAV` para la decodificacion).
- Generacion de texto conversacional en formato image-text-to-text, con plantilla de chat (`conversational`).
- Modo "thinking": existe una variante MiniCPM-V 4.6-Thinking con capacidades de razonamiento extendido.
- Compresion configurable de tokens visuales entre 4x y 16x, para ajustar coste computacional y precision.
- Despliegue en dispositivos moviles: iOS, Android y HarmonyOS con codigo de adaptacion abierto.
- Integracion con tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la metadata de idiomas del repositorio no esta publicada.

## Casos de uso

- OCR en movil: el modelo puede leer tickets, carteles o documentos capturados con la camara del telefono y extraer el texto en el propio dispositivo, aprovechando su tamano reducido y su adaptacion a iOS, Android y HarmonyOS. La model card incluye una demostracion de reconocimiento de un ticket en HarmonyOS.
- Asistencia visual offline: aplicaciones de accesibilidad que describan el entorno a un usuario mediante una sola fotografia, sin enviar datos a un servidor, lo que resulta adecuado por su licencia Apache 2.0 y su ejecucion local.
- Reconocimiento y traduccion de escritura manual: la model card muestra una demostracion de escritura manual en iPhone; el modelo puede transcribir notas manuscritas a texto digital.
- Analisis de imagenes tecnicas o educativas: interpretacion de diagramas, esquemas y figuras (la demo de Android ilustra un fenomeno de refraccion) para generar explicaciones en texto.
- Moderacion o etiquetado de contenido visual a gran escala: con compresion de tokens visuales a 16x se reduce el coste por imagen, lo que permite clasificar volumenes elevados con throughput alto en llama.cpp o vLLM.
- Resumen de video corto: al soportar multiples imagenes y video, puede generar descripciones o resumenes de clips grabados con el dispositivo, util para indexacion automatica de grabaciones.
- Prototipado de agentes multimodales en local: desarrolladores que necesiten un VLM pequeno para encadenar pasos de percepcion y accion en un portatil o en una GPU de consumo, integrable con llama.cpp u Ollama.

## Benchmarks y rendimiento

La model card no incluye valores numericos por benchmark en el texto disponible; presenta los resultados en forma de imagenes (graficas) alojadas en el repositorio de GitHub, por lo que los numeros concretos de OpenCompass, RefCOCO, HallusionBench, MUIRBench u OCRBench no estan accesibles en la informacion proporcionada.

| Metrica | MiniCPM-V 4.6 | Referencia declarada |
|---|---|---|
| Artificial Analysis Intelligence Index | 13 | Qwen3.5-0.8B: 10; Qwen3.5-0.8B-Thinking: 11; Ministral 3 3B: 11 |
| Coste en tokens (Indice AA) | Referencia (1x) | 19x mas tokens que Qwen3.5-0.8B; 43x mas que Qwen3.5-0.8B-Thinking |
| Throughput de tokens | ~1,5x respecto a Qwen3.5-0.8B | — |
| Reduccion de FLOPs de codificacion visual | >50% respecto a la version anterior | — |

No se han publicado resultados numericos detallados de MMLU, HumanEval, GSM8K ni de benchmarks de vision en la informacion disponible. Cualquier cifra adicional debe consultarse en las graficas del repositorio oficial de OpenBMB.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, a partir de 752 M de parametros): en FP16/BF16 en torno a 1,5 GB; en Q8_0 alrededor de 0,8 GB; en Q4_K_M aproximadamente 0,5 GB. Hay que sumar la cache KV y las activaciones del codificador visual.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; NVIDIA RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para estas ultimas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna y en muchas integradas. Tambien esta disenado para ejecutarse en telefonos: la model card cita iPhone 17 Pro Max, Redmi K70 y HUAWEI nova 14 como dispositivos de demostracion.
- Opciones de despliegue: llama.cpp y Ollama para el archivo GGUF de este repositorio; el modelo base es compatible ademas con vLLM, SGLang y Transformers (`transformers[torch]>=5.7.0`), y con los frameworks de ajuste fino SWIFT y LLaMA-Factory.
- Latencia y throughput: la model card publica graficas de TTFT (time to first token) por peticion unica y de throughput en alta concurrencia, pero los valores numericos no estan disponibles en la informacion proporcionada. Unicamente se declara un throughput de tokens aproximadamente 1,5x superior al de Qwen3.5-0.8B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Indice AA Intelligence | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 (este repositorio, GGUF) | 752 M (metadata del repo) | no disponible | 13 | Apache 2.0 | HuggingFace (cuantizacion de terceros, 0 descargas) |
| Qwen3.5-0.8B | ~0,8 B (segun model card) | no disponible | 10 | no disponible | no disponible en la informacion |
| Qwen3.5-0.8B-Thinking | ~0,8 B (segun model card) | no disponible | 11 | no disponible | no disponible en la informacion |
| Ministral 3 3B | 3 B (segun model card) | no disponible | 11 | no disponible | no disponible en la informacion |

La model card afirma ademas que MiniCPM-V 4.6 supera a Qwen3.5-0.8B en la mayoria de tareas de comprension vision-lenguaje y que alcanza el nivel de Qwen3.5 2B en varios benchmarks, incluidos OpenCompass, RefCOCO, HallusionBench, MUIRBench y OCRBench. No se dispone de cifras por benchmark para verificar esa afirmacion.

## Limitaciones y advertencias

- Se trata de una cuantizacion de terceros: el autor del repositorio es devendradhakad, no OpenBMB, por lo que puede haber diferencias de calidad o de comportamiento frente a los pesos oficiales.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, es decir, no existe validacion ni retroalimentacion de la comunidad.
- La cuantizacion GGUF implica perdida de precision respecto a los pesos BF16 originales; el grado de degradacion depende del nivel de cuantizacion elegido y no se documenta en la informacion disponible.
- La longitud de contexto no esta publicada; no se puede garantizar el manejo de entradas largas sin consultar el repositorio oficial.
- No se declaran los idiomas soportados en la metadata; parte de las demostraciones de la model card estan en ingles, por lo que el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion: inherente a los modelos generativos, y especialmente relevante en tareas de OCR y descripcion de imagenes, donde el modelo puede inventar texto o detalles no presentes.
- Sesgos conocidos: no disponible. No se documentan evaluaciones de sesgo en la informacion proporcionada.
- Licencia Apache 2.0 en este repositorio, lo que permite uso comercial; conviene verificar igualmente la licencia de los pesos del modelo base y de sus componentes (SigLIP2-400M y Qwen3.5-0.8B) antes de un despliegue en produccion.
- Las fechas de creacion del repositorio (2026) y los identificadores arXiv listados en las etiquetas no han podido contrastarse con fuentes externas; la busqueda web realizada no devolvio resultados relevantes (unicamente paginas de banca online sin relacion con el modelo).
- Para produccion se recomienda validar la cuantizacion frente a los pesos oficiales en el caso de uso concreto, y monitorizar la tasa de error en OCR y en tareas de grounding visual.

## Enlaces

- Repositorio de esta cuantizacion GGUF: https://huggingface.co/devendradhakad/autodroid-openbmb-MiniCPM-V-4.6-gguf
- Modelo base oficial: https://huggingface.co/openbmb/MiniCPM-V-4.6
- Repositorio GitHub de la familia MiniCPM-o: https://github.com/OpenBMB/MiniCPM-o
- CookBook de MiniCPM-V: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Demo
- Documentacion de la API (clave publica gratuita): https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Repositorio de LLaVA-UHD v4: https://github.com/THUMAI-Lab/LLaVA-UHD-v4
- Identificadores arXiv listados en las etiquetas del repositorio: https://arxiv.org/abs/2604.27393, https://arxiv.org/abs/2509.18154, https://arxiv.org/abs/2408.01800, https://arxiv.org/abs/2605.08985
- Busqueda web realizada: sin resultados relevantes. Los unicos enlaces devueltos corresponden a entidades bancarias alemanas (meine-bank-no.de, raiffeisenbank-regensburg.de, volksbank-raiffeisenbank-regensburg-schwandorf.de) y no guardan relacion con el modelo.
