# pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-GGUF es una conversión a formato GGUF del modelo de reescritura de prompts publicado por LightX2V. Su función no es generar vídeo ni audio directamente, sino transformar peticiones de usuario en prompts estructurados y detallados compatibles con el sistema de generación multimodal MiniMax-H3. El modelo toma texto e imágenes de referencia y produce descripciones integradas, paisajes sonoros y especificaciones de música no diegética, además de la alineación de fotogramas cuando la tarea incluye referencias visuales.

El modelo base parte de Qwen3.8-27B (26.895.998.464 parámetros reales en safetensors) afinado por LightX2V para las tareas T2VA (texto a vídeo con audio), I2VA (imagen a vídeo con audio), L2VA (último fotograma a vídeo con audio) y FL2VA (primer y último fotograma a vídeo con audio). Esta conversión GGUF, publicada por el usuario pytraveler, ofrece dos cuantizaciones del modelo de lenguaje (Q5_K_M y Q4_K_M) más un proyector de visión separado en F16, pensadas para ejecución local con llama.cpp y con un nodo específico para ComfyUI.

La relevancia de esta ficha radica en que permite ejecutar en hardware de consumo un modelo de 27B especializado en ingeniería de prompts para vídeo generativo, una tarea donde la calidad del prompt condiciona directamente el resultado final. Al estar en GGUF y contar con integración en ComfyUI, baja la barrera de entrada para flujos de trabajo de generación de vídeo con MiniMax-H3 sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.8-27B (familia Qwen3-VL), con proyector de visión separado; el conversor de llama.cpp usa el tipo `qwen35` |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion disponible; el ejemplo de llama.cpp usa `--ctx-size 32768` |
| Tipos de cuantizacion | Q5_K_M (19,231 GB), Q4_K_M (16,547 GB); proyector de visión en F16 (0,928 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` / `upstream-terms`; el release de LightX2V no declara licencia de fine-tuning propia, la base Qwen3.8-27B es Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje + `mmproj` de visión separado) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3.8-27B, con un proyector de visión independiente que se carga por separado (`--mmproj` en llama.cpp). La conversión a GGUF se realizó con el script oficial `convert_hf_to_gguf.py` de llama.cpp (commit `cb26014d965036f0eacdab7387b222d28d36b9e6`, build `b10310`), generando un control BF16 con `--no-nextn` y un proyector F16 con `--mmproj` a partir del mismo directorio SFT. Posteriormente, `llama-quantize` produjo las variantes Q5_K_M y Q4_K_M del modelo de lenguaje, manteniendo el proyector en F16.

El afinamiento original de LightX2V está orientado a la reescritura de prompts para MiniMax-H3, con soporte de instrucciones de escritura oficiales y tareas multimodales que combinan texto e imágenes de referencia. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo soporta modo "thinking" (razonamiento extendido) activado por defecto, con `temperature=0.7`, `top_p=0.8`, `top_k=20` y `max_tokens=16384` como valores por defecto del upstream.

## Capacidades

- Reescritura de peticiones de usuario en prompts estructurados para MiniMax-H3, con secciones `integrated_multimodal_description`, `overall_soundscape` y `non_diegetic_music`.
- Soporte de cuatro tareas: T2VA (texto a vídeo con audio), I2VA (imagen a vídeo con audio), L2VA (último fotograma a vídeo con audio) y FL2VA (primer y último fotograma a vídeo con audio).
- Entrada multimodal de imagen y texto (`image-text-to-text`), con el proyector de visión cargado aparte.
- Alineación de fotogramas en tareas con referencias de imagen.
- Modo de razonamiento (thinking) activable o desactivable mediante `chat_template_kwargs.enable_thinking`.
- Formato conversacional compatible con endpoints (`endpoints_compatible`) y plantilla Jinja (`--jinja`).
- Capacidad multilingüe limitada al inglés según la model card.
- No dispone de codificador de audio: la descripción del sonido de referencia debe aportarse como texto explícito.

## Casos de uso

- Generación de prompts para vídeo con MiniMax-H3: el modelo transforma una idea breve del usuario en un prompt estructurado con descripción visual, paisaje sonoro y música, listo para alimentar el pipeline de generación de vídeo. Es su función principal y el motivo de su existencia.
- Flujos de trabajo en ComfyUI: mediante el nodo MiniMax-H3 Qwen Rewriter, el usuario construye peticiones con referencias de imagen ordenadas, relación de aspecto, duración y biblioteca de prompts, y el nodo genera automáticamente la petición completa para el modelo.
- Tareas de primer y último fotograma (FL2VA): útil para animar transiciones entre dos imágenes clave, donde el modelo alinea los fotogramas de referencia y describe la evolución visual y sonora intermedia.
- Creación de contenido audiovisual asistida: guionistas y artistas pueden iterar sobre descripciones de escenas con coherencia entre imagen, sonido y música, reduciendo el número de intentos necesarios en el generador de vídeo.
- Estandarización de prompts en equipos: al producir una estructura fija (descripción integrada, paisaje sonoro, música), facilita la revisión, el versionado y la reproducibilidad de prompts entre miembros de un equipo.
- Prototipado local sin nube: con las cuantizaciones Q4_K_M o Q5_K_M y llama.cpp, se puede desplegar en una estación de trabajo con GPU de consumo para experimentar con reescritura de prompts sin enviar datos a servicios externos.
- Investigación sobre ingeniería de prompts multimodales: permite estudiar cómo varía la calidad del prompt generado según cuantización, temperatura y modo de razonamiento, con validación documentada en `validation.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta una validación de tipo smoke test: Q5_K_M y Q4_K_M cargaron en una NVIDIA GeForce RTX 5090 y devolvieron las secciones de tarea a partir de referencias de imagen; el SFT original también superó una prueba (BF16 para 9B, NF4 para 27B). El autor advierte explícitamente que un smoke test correcto verifica carga, entrada de medios y estructura de salida, pero no constituye una medida de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,2 GB para Q5_K_M y 16,5 GB para Q4_K_M solo en pesos del modelo de lenguaje, más 0,928 GB del proyector F16 y las asignaciones de contexto, procesamiento de visión y backend.
- GPU recomendadas: el autor validó en una NVIDIA GeForce RTX 5090; por tamaño, caben también en RTX 4090 (24 GB) en Q4_K_M o Q5_K_M ajustando contexto, y en GPUs profesionales como A100 o H100 con holgura.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (16,5 GB) y Q5_K_M (19,2 GB) entran en GPUs de 24 GB, aunque el margen para contexto y visión es mayor con Q4_K_M.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj`, `--jinja`, `--ctx-size 32768` y `--n-gpu-layers 999`; integración en ComfyUI con el nodo MiniMax-H3 Qwen Rewriter. No se mencionan vLLM, TGI ni Ollama para esta conversión GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; `validation.json` recoge tiempos exactos de la prueba de humo, pero no se han trasladado a esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-GGUF (esta ficha) | 26,9B | No especificado (ejemplo con 32768) | GGUF + mmproj | `other` / upstream-terms | Reescritura de prompts para MiniMax-H3, multimodal |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA (modelo base) | 26,9B | No especificado | Safetensors (BF16) | `other` / upstream-terms | Mismo propósito, sin cuantizar |
| Qwen/Qwen3.8-27B (modelo base de la base) | 27B | No disponible | Safetensors | Apache 2.0 | LLM generalista, sin especialización en prompts de vídeo |

No se dispone de información sobre otros reescritores de prompts para MiniMax-H3 con los que comparar rendimiento, contexto o latencia; los datos de benchmarks de esta categoría no están publicados en la información disponible.

## Limitaciones y advertencias

- La cuantización altera los pesos y puede cambiar la redacción de los prompts generados; el smoke test no garantiza calidad equivalente al modelo en BF16.
- El modelo solo declara soporte de inglés; el uso en castellano u otros idiomas no está garantizado.
- No tiene codificador de audio: las referencias sonoras deben describirse por texto, y no debe esperarse capacidad de "escuchar" el audio de referencia.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar detalles visuales o sonoros no presentes en la petición o en las imágenes de referencia.
- Licencia ambigua: el release de LightX2V no declara licencia de fine-tuning propia; la base Qwen3.8-27B es Apache 2.0 y se incluye como `BASE_MODEL_LICENSE`, pero el uso comercial del afinamiento requiere revisar los términos upstream enlazados.
- Requiere una build de llama.cpp que soporte `qwen35` y el proyector de visión de Qwen3-VL; versiones antiguas no cargarán el modelo correctamente.
- Las guías de escritura oficiales no se redistribuyen en el repositorio: deben obtenerse de su fuente original, lo que añade un paso de configuración.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- El contexto máximo real no está documentado; el valor de 32768 procede del ejemplo de lanzamiento y no de una especificación oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-GGUF
- Modelo base (LightX2V): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA
- Revisión fijada del modelo base: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA/tree/9b67172092af7d779a37c56850ea37cb23bcfc8f
- Ejemplo de inferencia upstream (`post_vllm.py`): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA/blob/9b67172092af7d779a37c56850ea37cb23bcfc8f/post_vllm.py
- Nodo ComfyUI: https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI
- Licencia de Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- MiniMax-H3 (formato de prompt y generación de vídeo): https://huggingface.co/MiniMaxAI/MiniMax-H3
