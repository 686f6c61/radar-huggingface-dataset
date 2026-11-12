# pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA-GGUF es una conversión a formato GGUF del modelo de reescritura de prompts desarrollado por LightX2V, construido sobre una base Qwen3.5 de 9B parámetros (8.953.803.264 parámetros reales en safetensors). Su función es transformar peticiones de usuario en lenguaje natural en prompts estructurados para el sistema de generación de vídeo y audio MiniMax-H3, cubriendo las tareas T2VA (texto a vídeo con audio), I2VA (imagen a vídeo con audio), L2VA (último fotograma a vídeo con audio) y FL2VA (primer y último fotograma a vídeo con audio).

El modelo es multimodal de tipo image-text-to-text: incorpora un proyector de visión separado que se carga aparte del fichero de lenguaje, lo que permite procesar imágenes de referencia (fotogramas iniciales y finales) junto con la instrucción textual. La salida se estructura en campos concretos como `integrated_multimodal_description`, `overall_soundscape` y `non_diegetic_music`, además de la alineación de fotogramas para las tareas basadas en imagen.

Esta conversión concreta, publicada por el usuario pytraveler, ofrece dos cuantizaciones (Q4_K_M y Q5_K_M) junto con el proyector de visión en F16, lo que reduce los requisitos de memoria frente al checkpoint original en BF16 y facilita su despliegue en llama.cpp y en un nodo personalizado de ComfyUI. Es relevante para quienes trabajan con pipelines de generación de vídeo MiniMax-H3 y necesitan automatizar la construcción de prompts sin depender de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5 con proyector de visión Qwen3-VL); soporte `qwen35` en llama.cpp |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo en llama-server); valor máximo no especificado en la información disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M (lenguaje); F16 (proyector de visión) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal basado en Qwen3.5 de 9B parámetros, afinado por LightX2V para la tarea específica de reescritura de prompts de MiniMax-H3. La parte de lenguaje se complementa con un proyector de visión independiente (Qwen3-VL) que se distribuye como fichero `mmproj` en F16 y que debe cargarse por separado mediante `--mmproj` en llama.cpp. La conversión se realizó con el script oficial `convert_hf_to_gguf.py` (con `--no-nextn` para el control BF16 y `--mmproj` para el proyector) y `llama-quantize` para generar las variantes Q5_K_M y Q4_K_M, usando el commit `cb26014d965036f0eacdab7387b222d28d36b9e6` (build `b10310`) de llama.cpp.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El modelo upstream es un SFT (fine-tuning supervisado) sobre la base Qwen3.5, y la model card menciona que el SFT original superó una prueba de humo tanto en BF16 (9B) como en NF4 (27B). El modelo opera con modo de razonamiento (thinking) activado por defecto, con parámetros recomendados de `temperature=0.7`, `top_p=0.8`, `top_k=20` y `max_tokens=16384`; puede desactivarse el thinking mediante `chat_template_kwargs.enable_thinking=false`.

## Capacidades

- Reescritura de prompts para generación de vídeo y audio MiniMax-H3 en las tareas T2VA, I2VA, L2VA y FL2VA.
- Procesamiento multimodal de imágenes de referencia (fotogramas iniciales y finales) intercaladas con sus etiquetas en la petición.
- Generación de salidas estructuradas con los campos `integrated_multimodal_description`, `overall_soundscape`, `non_diegetic_music` y alineación de fotogramas para tareas con imagen.
- Modo de razonamiento (thinking) activable o desactivable mediante plantilla de chat.
- Soporte de referencias de vídeo como imágenes muestreadas con marcas de tiempo de origen.
- Integración con ComfyUI mediante el nodo MiniMax-H3 Qwen Rewriter, con opciones de instrucción, franja de referencias ordenada, relación de aspecto, duración, bypass/repeat y biblioteca de prompts.
- Capacidad de tool calling / function calling: no disponible en la información proporcionada.
- Capacidad de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés (`en`).
- Capacidad de audio: no incorpora codificador de audio; requiere descripción explícita del sonido de referencia.

## Casos de uso

- Automatización de prompts para generación de vídeo con audio: el modelo transforma una instrucción breve del usuario en un prompt estructurado con descripción visual, paisaje sonoro y música no diegética, listo para alimentar MiniMax-H3 en un pipeline de producción.
- Generación de vídeo a partir de primer y último fotograma (FL2VA): se introducen las dos imágenes de referencia junto con la petición y el modelo genera el prompt con la alineación de fotogramas adecuada, útil para animar transiciones entre dos estados visuales.
- Integración en ComfyUI para flujos de trabajo de creadores: el nodo MiniMax-H3 Qwen Rewriter permite construir la petición automáticamente, incluyendo la franja de referencias ordenada, la relación de aspecto y la duración, sin escribir prompts manualmente.
- Prototipado de pipelines de vídeo con audio en local: gracias a las cuantizaciones Q4_K_M (5,629 GB) y Q5_K_M (6,468 GB) y al proyector F16 (0,918 GB), el modelo puede ejecutarse en una GPU de consumo como la RTX 5090, validada por el autor.
- Estandarización de prompts en equipos creativos: el modelo produce salidas estructuradas y consistentes en los campos definidos, lo que facilita revisiones, comparaciones y control de calidad entre distintos operadores.
- Generación de vídeo a partir de imagen (I2VA) o de último fotograma (L2VA): el modelo adapta la petición al modo de referencia correspondiente y añade la alineación de fotogramas necesaria para cada tarea.
- Servicio de inferencia local con llama.cpp: despliegue mediante `llama-server` con `--mmproj`, `--jinja` y `--ctx-size 32768`, adecuado para entornos de investigación que requieran control total sobre el modelo y los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta una validación de humo: Q5_K_M y Q4_K_M cargaron en una NVIDIA GeForce RTX 5090 y devolvieron las secciones de tarea a partir de referencias de imagen; el SFT original también completó una prueba de humo (BF16 para 9B, NF4 para 27B). El autor advierte explícitamente que una prueba de humo correcta verifica carga, entrada de medios y estructura de salida, pero no constituye una medida de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 5,629 GB y el Q5_K_M 6,468 GB; el proyector de visión F16 añade 0,918 GB. A esto hay que sumar la memoria de contexto, el procesamiento de visión y las asignaciones del backend.
- GPU recomendadas: NVIDIA GeForce RTX 5090 validada por el autor para Q4_K_M y Q5_K_M; no se especifican otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, al menos en RTX 5090 según la validación del autor.
- Opciones de despliegue: llama.cpp (build que soporte `qwen35` y el proyector Qwen3-VL, commit `cb26014d965036f0eacdab7387b222d28d36b9e6`, build `b10310`), `llama-server` con `--mmproj`, `--jinja` y `--ctx-size 32768`; ComfyUI mediante el nodo MiniMax-H3 Qwen Rewriter.
- Latencia y throughput estimados: no disponible en la información proporcionada; la model card remite a `validation.json` para tiempos exactos, pero no se incluyen cifras en el texto extraído.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA-GGUF (esta ficha) | 8.953.803.264 | 32.768 (config. de ejemplo) | GGUF (Q4_K_M, Q5_K_M + mmproj F16) | Apache 2.0 | Hugging Face, ComfyUI, llama.cpp |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA (modelo base) | 8.953.803.264 | no disponible | safetensors (BF16) | Apache 2.0 | Hugging Face |
| MiniMax-H3 (sistema de generación de vídeo/audio) | no disponible | no disponible | no disponible | no disponible | Hugging Face (MiniMaxAI) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un modelo basado en Qwen3.5 y entrenado solo en inglés, puede heredar sesgos del corpus de entrenamiento.
- Riesgo de alucinación: no se documenta explícitamente, pero al tratarse de un modelo generativo de reescritura de prompts puede producir descripciones visuales o sonoras no solicitadas o inconsistentes con la referencia.
- Limitaciones de contexto o idioma: solo soporta inglés (`en`); la longitud máxima de contexto no se especifica más allá del valor de ejemplo de 32.768 tokens.
- La cuantización modifica los pesos y puede alterar la redacción de las salidas; el autor advierte que la prueba de humo no es una medida de calidad.
- Sin codificador de audio: el modelo no puede "escuchar" referencias sonoras; requiere una descripción textual explícita del sonido de referencia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el crédito del modelo afinado corresponde a LightX2V y el de la base a Qwen; las guías de escritura se obtienen de su fuente original y no se redistribuyen en el repositorio.
- Caveat para producción: las imágenes deben mantenerse intercaladas con sus etiquetas y las referencias de vídeo deben ser imágenes muestreadas con marcas de tiempo; el nodo de ComfyUI construye esta petición automáticamente, pero en llama.cpp hay que respetar el formato manualmente.
- Es un modelo especializado en una única tarea (reescritura de prompts para MiniMax-H3); no está pensado como modelo de propósito general.

## Enlaces

- Hugging Face (esta conversión GGUF): https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA-GGUF
- Modelo base en Hugging Face: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA
- Revisión concreta del modelo base: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA/tree/ea2a677e0597831a992a400224d98dde4c405fe6
- Ejemplo de inferencia upstream (post_vllm.py): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA/blob/ea2a677e0597831a992a400224d98dde4c405fe6/post_vllm.py
- Nodo ComfyUI: https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI
- MiniMax-H3 (sistema de generación de vídeo/audio): https://huggingface.co/MiniMaxAI/MiniMax-H3
