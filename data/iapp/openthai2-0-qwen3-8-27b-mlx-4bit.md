# iapp/openthai2.0-qwen3.8-27b-MLX-4bit

## Resumen

OpenThai2.0-qwen3.8-27b-MLX-4bit es la cuantizacion en 4 bits para Apple Silicon (formato MLX) del modelo multimodal OpenThai2.0, desarrollado por iApp en el marco de la iniciativa OpenThai (anteriormente OpenThaiGPT) y presentado junto a AIEAT. El modelo parte de una base Qwen3.8 de 27 000 millones de parametros y anade conocimiento y capacidades especificas para tailandes, con un enfasis explicito en reconocimiento optico de caracteres (OCR) sobre documentos tailandeses y en comportamiento agentico.

La relevancia de esta publicacion concreta es de despliegue: reduce el checkpoint original en bf16 a unos 16 GB de pesos, lo que permite ejecutar un modelo de 27B con vision en equipos de memoria unificada de 24 GB o mas, y ademas se puede servir en GPUs NVIDIA mediante TensorFold, una capa de servicio compatible con la API de OpenAI que aplica decodificacion especulativa. La version etiquetada v2.0.3 corrige el recuerdo de conocimiento tailandes respecto a la build de lanzamiento v2.0.0, que sigue disponible en la revision correspondiente.

Es un modelo de razonamiento: por defecto genera una traza de pensamiento antes de la respuesta, lo que obliga a reservar presupuestos de generacion amplios (8k tokens o mas) para evitar respuestas vacias. Esta ficha describe la variante cuantizada; los pesos de referencia en bf16 se publican en el repositorio base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; tag de arquitectura `qwen3_5` |
| Parametros totales | 27 356 728 560 (27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (checkpoint publicado); el modelo base existe en bf16 y en NVFP4 |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repo de 50,1 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la familia Qwen3.8 y la naturaleza multimodal con entrada de imagen y texto. El checkpoint incorpora una cabeza MTP (multi-token prediction) para decodificacion especulativa, aunque esta cuantizacion MLX no la incluye porque mlx-vlm no soporta aun ese drafter para esta arquitectura; en su lugar, TensorFold emplea el drafter externo z-lab/Qwen3.8-27B-DFlash2 (Apache 2.0), entrenado sobre Qwen3.8-27B base y no sobre OpenThai 2.0, por lo que acepta menos tokens redactados en respuestas en tailandes y el ahorro de latencia es menor que en el modelo base.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card menciona una correccion de "recuerdo de conocimiento tailandes" en la build v2.0.3, lo que indica ajustes de datos o de post-entrenamiento orientados a mejorar la fidelidad factual en ese idioma.

## Capacidades

- Generacion de texto conversacional en tailandes e ingles, con traza de razonamiento separada de la respuesta final (`reasoning_content` frente a `content`).
- Comprension de imagenes y OCR de documentos: lectura de texto en imagenes de documentos, con un caso de uso declarado explicitamente por el autor.
- Razonamiento en varios pasos por defecto (modo thinking), desactivable con `--no-thinking` en el servidor TensorFold.
- Servicio mediante API compatible con OpenAI (chat completions, contenido multimodal con `image_url` en data URL o HTTPS si se habilita `--vision-urls`).
- Capacidades agenticas declaradas en el titulo del modelo ("Agentic AI"), aunque la informacion disponible no detalla soporte formal de tool calling ni de function calling.
- Decodificacion especulativa mediante drafter externo cuando se sirve con TensorFold, con verificacion de cada token redactado contra el modelo.

## Casos de uso

- Digitalizacion de documentos tailandeses: envio de imagenes de contratos, formularios o facturas al endpoint multimodal con la instruccion de transcribir todo el texto; el modelo esta ajustado para OCR en tailandes y mantiene el razonamiento separado de la salida.
- Asistencia legal y administrativa en tailandes: resumenes de normativa (por ejemplo, la ley de proteccion de datos personales) en un numero fijo de puntos, aprovechando el conocimiento del dominio y el modo thinking para estructurar la respuesta.
- Atencion al cliente en tailandes sobre Mac o GPU NVIDIA: servicio con API compatible con OpenAI, con `--parallel 4` en CUDA para atender hasta cuatro peticiones concurrentes.
- Procesamiento de documentacion en portatiles de desarrollo: con unos 16 GB de pesos, un Mac de 24 GB o mas puede ejecutar el modelo en local sin GPU dedicada, util para prototipos y pruebas de pipeline antes de escalar.
- Despliegue en estaciones de trabajo compactas tipo DGX Spark: el modelo se sirve en GB10 (compute capability 8.9 o superior) junto al drafter DFlash2 para acelerar la decodificacion en un equipo de sobremesa.
- Extraccion de informacion estructurada a partir de imagenes: combinacion de OCR y razonamiento para transformar el contenido de un documento en campos normalizados, con presupuestos de generacion de 4k a 8k tokens.
- Evaluacion comparativa de cuantizaciones: al disponer de bf16, NVFP4 y MLX 4-bit del mismo modelo, sirve para medir la degradacion de calidad y la ganancia de velocidad entre formatos en una misma tarea de QA documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de velocidad (tokens por segundo en chat tailandes, QA documental, prefill de 8k y concurrencia x4) pero todos sus valores aparecen como marcadores vacios, sin cifras.

## Requisitos de hardware

- VRAM o memoria unificada: aproximadamente 16 GB de pesos en 4-bit; el autor indica que funciona con 24 GB o mas de memoria unificada.
- Apple Silicon: recomendado 48 GB de memoria unificada o mas para TensorFold. En un Mac de 32 GB el modelo no cabe en el presupuesto por defecto de TensorFold (70 % de la RAM); hay que subirlo con `TENSORFOLD_MEMORY_LIMIT_GB`, dejando poca memoria para el resto de aplicaciones.
- NVIDIA: requiere compute capability 8.9 o superior, es decir, RTX 40 y 50, Hopper, Blackwell y DGX Spark (GB10). En CUDA el drafter es obligatorio salvo que se arranque con `--no-drafts`.
- Despliegue: mlx-vlm (`python -m mlx_vlm generate`) para uso local en Mac; TensorFold v0.6.5 con extra `[vision]` para servir una API compatible con OpenAI tanto en Apple Silicon como en NVIDIA; contenedor de referencia `nvcr.io/nvidia/pytorch:26.07-py3` para CUDA.
- Arranque en CUDA: la primera ejecucion compila kernels CUDA para la GPU, lo que tarda unos minutos una sola vez.
- Latencia y throughput: no disponibles. El autor senala que el ahorro por decodificacion especulativa es menor en tailandes que en el modelo base porque el drafter se entreno sobre Qwen3.8-27B y no sobre OpenThai 2.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai2.0-qwen3.8-27b-MLX-4bit (esta ficha) | 27,36B | no disponible | th, en | Apache 2.0 | MLX 4-bit, ~16 GB, Apple Silicon y NVIDIA via TensorFold |
| iapp/openthai2.0-qwen3.8-27b (base bf16) | 27,36B | no disponible | th, en | Apache 2.0 | bf16, servible con vLLM o transformers; mayor huella de memoria |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible (drafter) | no disponible | no disponible | Apache 2.0 | Drafter de decodificacion especulativa, no es un modelo de chat autonomo |

No se dispone en la informacion proporcionada de datos de rendimiento que permitan comparar calidad frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo razona antes de responder: si el presupuesto de generacion es corto, la respuesta puede volver vacia. Hay que reservar 8k tokens o mas.
- La cuantizacion 4-bit altera la salida respecto al modelo bf16 servido con vLLM o transformers; los resultados no son intercambiables entre formatos.
- El drafter DFlash2 se entreno sobre Qwen3.8-27B base, no sobre OpenThai 2.0: menor aceptacion de tokens en tailandes y menor aceleracion, aunque el autor afirma que la calidad de las respuestas no se ve afectada.
- La cabeza MTP del modelo original no esta incluida en esta cuantizacion por falta de soporte en mlx-vlm.
- Cobertura linguistica limitada a tailandes e ingles; no se declara soporte de otros idiomas, incluido el espanol.
- Riesgo de alucinacion en conocimiento factual: la propia existencia de una build v2.0.3 dedicada a corregir el recuerdo de conocimiento tailandes indica que la version inicial tenia deficiencias en ese aspecto.
- No se detallan sesgos conocidos, composicion del dataset de entrenamiento ni evaluaciones de seguridad en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y no se ofrece garantia alguna por parte del autor.
- El modelo no esta disponible en formatos GGUF ni para llama.cpp u Ollama segun la informacion proporcionada; el despliegue esta atado a MLX y a TensorFold.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-MLX-4bit
- Modelo base bf16: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Drafter de decodificacion especulativa: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor de servicio TensorFold: https://github.com/ashhart/TensorFold
