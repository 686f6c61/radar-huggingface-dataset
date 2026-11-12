# pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-GGUF es la conversión a formato GGUF del modelo lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA, un ajuste fino de Qwen3.8-27B especializado en reescribir peticiones de usuario en prompts estructurados para el sistema de generación de vídeo y audio MiniMax-H3. El modelo no genera vídeo: su función es transformar una solicitud en lenguaje natural, junto con referencias visuales ordenadas y fotogramas muestreados, en un prompt con seis secciones bien definidas que después consume el generador MiniMax-H3.

La arquitectura subyacente es un transformer multimodal de tipo Qwen3-VL (identificador `qwen35` en llama.cpp) con 26.895.998.464 parámetros y un proyector de visión separado. El pipeline declarado es image-text-to-text, de modo que acepta imágenes intercaladas con etiquetas de texto como entrada. La tarea principal es Ref2VA (referencias visuales ordenadas, fotogramas de vídeo muestreados y descripciones de audio explícitas), y la salida se compone de los campos `subject_definitions`, `summary`, `retention_analysis`, `detailed_description`, `overall_soundscape` y `non_diegetic_music`.

Este repositorio es relevante porque permite ejecutar el reescritor en hardware de consumo mediante cuantización Q4_K_M y Q5_K_M, cuando el checkpoint original en BF16 requiere mucha más memoria. La conversión la firma el usuario pytraveler y se apoya en llama.cpp (commit `cb26014d965036f0eacdab7387b222d28d36b9e6`, build `b10310`), con un nodo específico para ComfyUI que automatiza la construcción de la petición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (identificador `qwen35` en llama.cpp) con proyector de visión separado |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de llama-server; no se declara un máximo oficial distinto |
| Tipos de cuantizacion | Q5_K_M (19,231 GB), Q4_K_M (16,547 GB); proyector de visión en F16 (0,928 GB); control BF16 solo para validación |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` / `upstream-terms`; el release LightX2V no declara licencia de fine-tuning, la base Qwen3.8-27B es Apache 2.0 (incluida como `BASE_MODEL_LICENSE`) |
| Formato de pesos | GGUF (lenguaje + `mmproj` de visión separado) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de Qwen3.8-27B, con un codificador/proyector de visión independiente que se carga aparte mediante `--mmproj`. La conversión a GGUF se realizó con `convert_hf_to_gguf.py`: un control BF16 del modelo de lenguaje con `--no-nextn` y un proyector de visión F16 extraído del mismo directorio SFT; después `llama-quantize` produjo los ficheros Q5_K_M y Q4_K_M. El proyector se mantiene siempre en F16 y no requiere LoRA adicional.

El ajuste fino procede de LightX2V sobre el checkpoint MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA (revisión `ca617d2f9bf7ec98818a7e536a7817c01ae9bcda`). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La especialización es de tipo SFT orientada a una tarea concreta: reescritura de prompts para MiniMax-H3 con referencias visuales ordenadas y descripciones de audio. Los parámetros de muestreo por defecto del autor son `temperature=0.7`, `top_p=0.8`, `top_k=20` y `max_tokens=16384`, con modo thinking activado; se puede desactivar con `chat_template_kwargs.enable_thinking=false` y reducir el presupuesto de tokens.

## Capacidades

- Generación de prompts estructurados para MiniMax-H3 con seis secciones fijas: `subject_definitions`, `summary`, `retention_analysis`, `detailed_description`, `overall_soundscape` y `non_diegetic_music`.
- Entrada multimodal image-text-to-text: acepta imágenes intercaladas con sus etiquetas y referencias visuales ordenadas.
- Procesamiento de fotogramas de vídeo muestreados con marcas de tiempo de origen como referencias.
- Descripción explícita de audio: el modelo no tiene codificador de audio, por lo que la información sonora debe aportarse como texto.
- Modo thinking activable o desactivable mediante `chat_template_kwargs.enable_thinking`.
- Conversación multi-turno (tag `conversational`) y compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Generación de prompts para vídeo con referencias visuales: dado un conjunto ordenado de imágenes de referencia y una petición en lenguaje natural, el modelo produce el prompt Ref2VA completo que alimenta a MiniMax-H3, manteniendo la correspondencia entre cada referencia y su función narrativa.
- Reescritura de prompts a partir de fotogramas de vídeo: se muestrean fotogramas con sus marcas de tiempo y el modelo construye la descripción detallada y el análisis de retención, útil para tareas de edición o continuación de vídeo.
- Diseño de paisaje sonoro y música: el modelo rellena `overall_soundscape` y `non_diegetic_music` a partir de una descripción textual del audio deseado, ya que no dispone de codificador de audio.
- Integración en ComfyUI: mediante el nodo MiniMax-H3 Qwen Rewriter con Qwen Rewriter Options, que aporta checkboxes de entrada, tira de referencias ordenada, botón `+ instr`, relación de aspecto, duración, bypass/repeat y biblioteca de prompts, y entrega la salida `references` a Reference Slots o Reference Encode.
- Servicio local con llama.cpp: desplegable con `llama-server` y `--mmproj` en una única GPU de consumo (validado en RTX 5090), adecuado para prototipado y pipelines internos sin depender de API externa.
- Automatización de preproducción audiovisual: estandarizar la petición de un equipo creativo en un prompt con estructura fija y campos separados facilita revisiones, control de versiones y comparación entre iteraciones.
- Evaluación de la retención de referencias: el campo `retention_analysis` permite auditar qué elementos de las imágenes de referencia se conservan en el prompt final antes de gastar cómputo en la generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La validación descrita es un smoke test: Q5_K_M y Q4_K_M cargaron en una NVIDIA GeForce RTX 5090 y devolvieron las seis secciones Ref2VA a partir de una referencia de imagen; el SFT original también superó una prueba en NF4. El autor advierte que la cuantización altera los pesos y puede cambiar la redacción, y que un smoke test correcto verifica carga, entrada multimedia y estructura de salida, pero no es una medida de calidad.

## Requisitos de hardware

- VRAM estimada: aproximadamente 19,2 GB de pesos para Q5_K_M y 16,5 GB para Q4_K_M, más 0,93 GB del proyector F16; hay que sumar contexto (32.768 tokens en el ejemplo), procesamiento de visión y reservas del backend.
- GPU recomendadas: NVIDIA RTX 5090 (validada por el autor con ambas cuantizaciones); por capacidad de memoria, también encajan GPUs de 24 GB o más para Q4_K_M y Q5_K_M con contexto moderado.
- GPU de consumo: sí, en tarjetas de 24 GB o superiores; en 16 GB Q4_K_M queda muy justo al sumar proyector y contexto.
- Opciones de despliegue: llama.cpp `llama-server` (build que soporte `qwen35` y el proyector Qwen3-VL, commit `cb26014d965036f0eacdab7387b222d28d36b9e6`, build `b10310`), nodo de ComfyUI MiniMax-H3 Prompt Rewriter, y el ejemplo upstream con vLLM (`post_vllm.py`).
- Ejemplo de arranque: `llama-server -m ...Q5_K_M.gguf --mmproj mmproj-...-F16.gguf --jinja --ctx-size 32768 --n-gpu-layers 999 --host 127.0.0.1 --port 8081`.
- Latencia y throughput: no disponible en la información proporcionada; `validation.json` recoge ajustes y tiempos exactos según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-GGUF (este) | 26,9 B | 32.768 en el ejemplo | Reescritura de prompts Ref2VA para MiniMax-H3 | `upstream-terms` (base Apache 2.0) | GGUF Q4_K_M / Q5_K_M + mmproj F16 |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA | 26,9 B | no disponible | Igual, checkpoint original | Sin licencia de fine-tuning declarada | Safetensors (BF16/NF4 en validación) |
| Qwen/Qwen3.8-27B | 27 B (aprox.) | no disponible | Modelo base generalista | Apache 2.0 | Safetensors y derivados |

La comparación se limita al modelo base y al checkpoint original, que son los únicos referenciados en la información disponible. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Modelo especializado: está entrenado para reescribir prompts de MiniMax-H3; su uso como asistente general no está validado.
- Solo inglés declarado: no hay soporte multilingüe documentado.
- Sin codificador de audio: el audio de referencia debe describirse en texto; el modelo no "escucha" la onda sonora.
- La cuantización modifica los pesos y puede alterar la redacción de la salida; el smoke test no mide calidad.
- Licencia ambigua para uso comercial: el release LightX2V no declara licencia de fine-tuning ni incluye fichero de licencia propio; la base Qwen3.8-27B es Apache 2.0, pero los términos del ajuste fino deben verificarse con el upstream antes de un uso comercial.
- Las guías de escritura oficiales no se redistribuyen en el repositorio: el nodo de ComfyUI las descarga de su fuente original, lo que introduce una dependencia externa.
- Riesgo de alucinación en los campos descriptivos (`detailed_description`, `retention_analysis`): conviene revisar la salida antes de enviarla al generador de vídeo.
- Requiere una build de llama.cpp que soporte `qwen35` y el proyector Qwen3-VL; versiones anteriores no cargarán el modelo.
- Sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-GGUF
- Modelo base (LightX2V): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA
- Revisión fijada del modelo base: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA/tree/ca617d2f9bf7ec98818a7e536a7817c01ae9bcda
- Ejemplo de inferencia upstream (vLLM): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA/blob/ca617d2f9bf7ec98818a7e536a7817c01ae9bcda/post_vllm.py
- Nodo de ComfyUI: https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia de Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- MiniMax-H3 (formato de prompt y generación de vídeo): https://huggingface.co/MiniMaxAI/MiniMax-H3
