# pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA-GGUF es la conversion a formato GGUF del modelo lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA, un modelo multimodal de 8.953.803.264 parametros (aproximadamente 9B) afinado para reescribir peticiones de usuario en prompts estructurados destinados al sistema de generacion de video y audio MiniMax-H3. La conversion la mantiene el usuario pytraveler y deriva del checkpoint original de LightX2V, que a su vez se construye sobre la familia Qwen3.5 (con vision projector tipo Qwen3-VL).

El modelo resuelve un problema muy concreto dentro de un pipeline de generacion de video: transformar instrucciones libres, junto con referencias visuales ordenadas (imagenes) y fotogramas muestreados de video, en una salida estructurada con secciones fijas (subject_definitions, summary, retention_analysis, detailed_description, overall_soundscape y non_diegetic_music) que MiniMax-H3 consume para producir video con audio. Es relevante porque estandariza la fase de "prompt engineering" de un sistema de video generativo multimodal, incluyendo la tarea Ref2VA (referencia a video y audio) con descripciones de audio explicitas.

La ficha se centra en la version GGUF: dos cuantizaciones del modelo de lenguaje (Q5_K_M de 6,468 GB y Q4_K_M de 5,629 GB) mas un vision projector F16 separado de 0,918 GB, con licencia Apache 2.0 y soporte para llama.cpp y un nodo de ComfyUI. El modelo solo declara ingles como idioma y no incorpora codificador de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5, vision projector tipo Qwen3-VL); tarea image-text-to-text |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el ejemplo de llama.cpp usa --ctx-size 32768 |
| Tipos de cuantizacion | Q5_K_M (6,468 GB) y Q4_K_M (5,629 GB); vision projector en F16 (0,918 GB); control BF16 usado solo para validacion |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje + mmproj separado); origen en safetensors/BF16 |
| Tamano del repo | 13,0 GB |
| Pipeline | image-text-to-text |
| Herramientas de conversion | convert_hf_to_gguf.py (--no-nextn y --mmproj) y llama-quantize; commit de llama.cpp cb26014d965036f0eacdab7387b222d28d36b9e6 (b10310) |
| Parametros de muestreo por defecto | temperature=0.7, top_p=0.8, top_k=20, max_tokens=16384, thinking activado |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 de aproximadamente 9B parametros y anade un vision projector (etiquetado como Qwen3-VL en la model card) que permite procesar imagenes intercaladas con texto. La conversion GGUF mantiene dos artefactos separados: el fichero del modelo de lenguaje (-m) y el proyector multimodal (--mmproj), ambos necesarios para la inferencia multimodal en llama.cpp. La conversion se realizo con la herramienta oficial convert_hf_to_gguf.py, generando un control BF16 del modelo de lenguaje con --no-nextn y el proyector F16 con --mmproj, y posteriormente llama-quantize produjo Q5_K_M y Q4_K_M; no se requiere LoRA adicional.

El checkpoint original es un fine-tuning supervisado (SFT) de LightX2V sobre la base Qwen, orientado especificamente a la reescritura de prompts para MiniMax-H3 en la tarea Ref2VA. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos no estan disponibles. Tampoco se documentan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) mas alla del modo thinking del chat template, que puede desactivarse con chat_template_kwargs.enable_thinking=false. El modelo no incluye codificador de audio: las referencias sonoras deben describirse explicitamente en texto.

## Capacidades

- Generacion de prompts estructurados para MiniMax-H3 con secciones fijas: subject_definitions, summary, retention_analysis, detailed_description, overall_soundscape y non_diegetic_music.
- Procesamiento multimodal de imagenes: acepta referencias visuales ordenadas intercaladas con sus etiquetas en el prompt.
- Tarea Ref2VA: reescritura de peticiones con referencias de imagen ordenadas, fotogramas de video muestreados con marcas de tiempo de origen y descripciones de audio explicitas.
- Modo thinking configurable (activado por defecto, desactivable mediante chat_template_kwargs).
- Conversacion multi-turno (tag conversational en Hugging Face) y compatibilidad con endpoints.
- Integracion en ComfyUI mediante el nodo MiniMax-H3 Qwen Rewriter con Qwen Rewriter Options (checkboxes de entrada, tira de referencias ordenada, + instr, aspect ratio, duracion, bypass/repeat y libreria de prompts).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agentes y razonamiento multi-paso: no documentadas; el uso previsto es la reescritura de prompts, no tareas genericas de agente.
- Capacidades de audio: no incluye codificador de audio; solo describe sonido en texto.
- Capacidades multilingues: limitadas a ingles segun la model card.

## Casos de uso

- Preproduccion de video generativo con MiniMax-H3: el modelo convierte una idea en lenguaje natural en el prompt estructurado completo que MiniMax-H3 espera, reduciendo el trabajo manual de escribir cada seccion (resumen, descripcion detallada, soundscape y musica no diegetica) de forma consistente.
- Pipelines de referencia a video y audio (Ref2VA): a partir de una tira ordenada de imagenes de referencia y fotogramas muestreados con timestamps, el modelo genera la retention_analysis y la descripcion detallada necesarias para mantener la coherencia de sujetos y escenas entre la referencia y el video generado.
- Integracion en ComfyUI para artistas y estudios: el nodo MiniMax-H3 Qwen Rewriter permite encadenar la reescritura de prompt con los nodos de generacion, gestionando aspect ratio, duracion y libreria de prompts dentro del mismo grafo, sin salir del entorno de ComfyUI.
- Diseno de bandas sonoras descriptivas: el modelo produce overall_soundscape y non_diegetic_music a partir de una descripcion textual del sonido de referencia, lo que permite estandarizar la parte audio del prompt aunque el checkpoint no procese waveforms.
- Servicio interno de reescritura de prompts via API: desplegado con llama-server en modo OpenAI-compatible (endpoints_compatible), puede actuar como microservicio que recibe la peticion del usuario y las imagenes y devuelve el JSON estructurado para el generador de video.
- Prototipado en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en una unica GPU consumer (validado en una RTX 5090) para iterar sobre prompts y guias de escritura antes de lanzar generaciones costosas.
- Estandarizacion de plantillas editoriales de video: el modelo aplica las guias de escritura oficiales (descargadas por el nodo desde su fuente original) para que distintos equipos produzcan prompts con la misma estructura y nivel de detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una validacion funcional: Q5_K_M y Q4_K_M cargaron en una NVIDIA GeForce RTX 5090 y devolvieron las secciones de tarea a partir de referencias de imagen; el SFT original supero un smoke test (BF16 para el 9B, NF4 para el 27B). El autor advierte explicitamente que un smoke test correcto verifica carga, entrada de medios y estructura de salida, pero no es una puntuacion de calidad, y que la cuantizacion puede alterar la redaccion generada.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 5,629 GB y el Q5_K_M 6,468 GB en disco; a ello hay que sumar el vision projector F16 (0,918 GB), el contexto (el ejemplo usa 32768 tokens) y las reservas del backend, por lo que conviene prever holgura adicional sobre el tamano del fichero.
- GPU recomendadas: la validacion se realizo en una NVIDIA GeForce RTX 5090. Por tamano, cualquier GPU consumer con 12-16 GB o mas deberia poder alojar Q4_K_M o Q5_K_M con contexto moderado; para contextos largos de 32K se recomienda 24 GB o mas.
- Cabe en GPU consumer: si, segun la validacion del autor en RTX 5090 con ambas cuantizaciones.
- Opciones de despliegue: llama.cpp (llama-server con --mmproj y --jinja; se requiere un build con soporte qwen35 y el proyector Qwen3-VL, commit b10310 o posterior) y ComfyUI mediante el nodo MiniMax-H3 Prompt Rewriter. No se documenta soporte de vLLM, TGI u Ollama en esta conversion.
- Latencia y throughput: no disponibles; la model card remite a validation.json para ajustes exactos y tiempos, pero no se incluyen cifras en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA-GGUF (esta ficha) | 8.953.803.264 | No especificado (ejemplo con 32768) | Imagen + texto | Apache 2.0 | GGUF (Q4_K_M, Q5_K_M) + mmproj F16 |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA (original) | 8.953.803.264 | No disponible | Imagen + texto | Apache 2.0 | Safetensors/BF16; inferencia via vLLM segun el ejemplo upstream |
| Qwen3.5 base (familia) | Aprox. 9B en esta variante | No disponible | Texto (la variante con vision anade proyector) | No disponible en esta informacion | Multiples formatos; no detallado aqui |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones; la comparativa se limita a parametros, modalidad, licencia y formato de distribucion.

## Limitaciones y advertencias

- Modelo de proposito especifico: esta afinado para reescribir prompts de MiniMax-H3; no es un asistente generalista ni un modelo de razonamiento o codigo.
- Solo ingles: la model card declara unicamente el idioma en; el rendimiento en castellano no esta garantizado.
- Sin codificador de audio: no puede "escuchar" referencias sonoras; el audio debe describirse explicitamente en texto.
- La cuantizacion modifica los pesos y puede cambiar la redaccion de salida; el smoke test no constituye una evaluacion de calidad.
- Riesgo de alucinacion: al generar descripciones detalladas y analisis de retencion, puede inventar atributos de sujetos o escenas no presentes en las referencias; conviene revisar la salida antes de enviarla al generador de video.
- Dependencia de las guias de escritura oficiales: el nodo las descarga de su fuente original y no se redistribuyen en el repositorio, por lo que el pipeline requiere acceso a dichas guias.
- Requiere un build reciente de llama.cpp con soporte qwen35 y el proyector Qwen3-VL; versiones antiguas no cargaran el modelo correctamente.
- Sin datos publicos de sesgos, benchmarks o evaluaciones de seguridad en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen y del ecosistema MiniMax-H3 si se integra en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-12; se trata de una conversion reciente y poco contrastada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA-GGUF
- Modelo original: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA
- Revision del modelo original usada en la conversion: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA/tree/4b602d004317e6c7d6a9dc113bb3280835b49b71
- Ejemplo de inferencia upstream (post_vllm.py): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA/blob/4b602d004317e6c7d6a9dc113bb3280835b49b71/post_vllm.py
- Nodo de ComfyUI: https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI
- MiniMax-H3 (formato de prompt y generacion de video): https://huggingface.co/MiniMaxAI/MiniMax-H3
