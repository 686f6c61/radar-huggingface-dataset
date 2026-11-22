# litert-community/LLaVA-OneVision-0.5B

## Resumen

LLaVA-OneVision-0.5B es un modelo de visión-lenguaje (VLM) compacto publicado por la comunidad `litert-community` en formato LiteRT-LM (`.litertlm`) para inferencia local en dispositivos. Convierte el modelo original `llava-hf/llava-onevision-qwen2-0.5b-ov-hf` del equipo LLaVA a un artefacto de 829 MB cuantizado (int8 en visión, int4 en el decodificador) que se ejecuta íntegramente offline sobre el runtime LiteRT-LM de Google, el mismo motor que respalda los modelos oficiales `litert-community/*`.

La arquitectura combina un codificador visual SigLIP (384×384, 729 parches) con un proyector MLP que alimenta un decodificador de lenguaje Qwen2-0.5B de 24 capas y dimensión 896. El resultado es un modelo capaz de recibir una imagen y una pregunta y devolver una respuesta anclada al contenido visual, con una ventana de contexto de 2048 tokens para la caché KV. Su relevancia actual radica en que permite llevar VLM multimodales a móviles, portátiles y sistemas embebidos sin depender de la nube, con latencias de decodificación superiores a 200 tok/s en GPU de escritorio.

El paquete está pensado para el despliegue en el borde: se ejecuta en macOS, Linux y Windows a través de la CLI `litert-lm`, expone una API compatible con OpenAI mediante `litert-lm serve` y ha sido validado en hardware Android (Samsung Galaxy S26) con delegación completa de operadores en la GPU. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador SigLIP + proyector MLP + decodificador Qwen2-0.5B (transformer) |
| Parametros totales | 0.5B en el decodificador de lenguaje (el codificador visual SigLIP añade parámetros no desglosados; no disponible el total exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (caché KV) |
| Tipos de cuantizacion | Visión int8; decodificador int4 simétrico con blockwise-32 + OCTAV; embedding atado int8 externalizado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en el repo original |
| Resolucion de imagen | 384×384 (normalización OpenAI-CLIP integrada en el codificador visual) |
| Tokens de imagen | 730 (729 parches + un token `image_newline`) |
| Tamano del fichero | ~829 MB (`LLaVA-OneVision-0.5B.litertlm`) |
| Tamano del repo | 5.0 GB |
| Computo | entero (integer) |

## Arquitectura y entrenamiento

El modelo sigue el esquema clásico de LLaVA-OneVision: un codificador visual SigLIP que procesa la imagen a 384×384 y la divide en 729 parches sin token CLS, un proyector MLP que traduce las representaciones visuales al espacio del decodificador y un modelo de lenguaje Qwen2-0.5B con 24 capas y dimensión oculta de 896. La imagen se convierte en 730 tokens (los 729 parches más un token separador `image_newline`) que se inyectan en la secuencia de texto. La ventana de contexto de la caché KV es de 2048 tokens, suficiente para una imagen y un diálogo corto.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovación técnica destacable de esta publicación no está en el entrenamiento sino en la conversión: el pipeline `litert-torch` (antes `ai-edge-torch`) transforma el modelo PyTorch sin modificaciones y el resultado se cuantiza de forma agresiva (int4 con blockwise-32 + OCTAV en el decodificador, int8 en visión) manteniendo fidelidad numérica. El autor reporta que la torre SigLIP se convierte de forma bit-fiel respecto a la referencia, con correlación ≈ 1.0 en salida float en CPU.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales (VQA) y captioning.
- Respuestas ancladas al contenido visual en una sola imagen; el soporte multi-imagen existe en la CLI pasando `--attachment` varias veces, aunque no se detalla el comportamiento con varias imágenes en la información disponible.
- Ejecución completamente offline en dispositivo, sin llamadas a servicios externos.
- Chat interactivo multi-turno a través de la CLI (`litert-lm run` sin `--prompt`).
- Servicio local con API compatible con OpenAI mediante `litert-lm serve`.
- Ejecución multiplataforma: macOS, Linux y Windows con el mismo fichero.
- Aceleración por GPU en escritorio (Metal en Apple Silicon) y en Android (backend LiteRT GPU con delegación completa de operadores).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, matemáticas avanzadas, audio ni modo de razonamiento explícito (thinking).

## Casos de uso

- Descripción automática de imágenes en aplicaciones móviles: el modelo cabe en 829 MB y se ejecuta offline en un teléfono Android, por lo que puede generar pies de foto o descripciones para accesibilidad sin enviar la imagen a un servidor.
- Asistencia a personas con discapacidad visual: dado que procesa una imagen y responde preguntas sobre ella en local, puede integrarse en apps de lectura de escenas con latencias de TTFT de 160 ms en GPU móvil.
- Moderación y etiquetado de contenido en el borde: clasificación y descripción de imágenes en pipelines de preprocesado donde la privacidad impide subir el contenido a la nube.
- Prototipado rápido de productos VLM: la CLI `litert-lm run --from-huggingface-repo` descarga y ejecuta el modelo en un solo comando, lo que permite validar ideas de producto en minutos en un portátil.
- Servicio local compatible con OpenAI: `litert-lm serve` expone el modelo como API local, lo que facilita integrarlo en aplicaciones existentes que ya consumen la interfaz de OpenAI sin cambiar el código cliente.
- Procesamiento de documentos escaneados o capturas en entornos sin conectividad: extracción de descripciones y respuestas sobre imágenes en kioscos, dispositivos de campo o sistemas industriales aislados.
- Evaluación de viabilidad de VLM en hardware empotrado: sirve como referencia para medir throughput y latencia (por ejemplo, 239 tok/s de decodificación en GPU Metal de un M4 Max) antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, VQA) en la información disponible. Los únicos datos numéricos publicados son de rendimiento de inferencia:

| Dispositivo | Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 955 tok/s | 113.7 tok/s | 0.31 s |
| Apple M4 Max (macOS) | GPU (Metal) | 7030 tok/s | 239.3 tok/s | 0.04 s |
| Samsung Galaxy S26 (Android 16) | GPU | 1376 tok/s | 86.5 tok/s | 160 ms |
| Samsung Galaxy S26 (Android 16) | CPU | 303 tok/s | 69.5 tok/s | 720 ms |

Las cifras de escritorio corresponden a `litert-lm benchmark` 0.15.0 con `-p 256 -d 256 --runs 3`, max-num-tokens 4096, media de tres iteraciones y warm-up descartado; cubren la ruta de texto y excluyen el codificador visual, que se ejecuta una vez por imagen. En el Galaxy S26 se midió con LiteRT-LM 0.16.0, delegando 3098 de 3098 operadores en tres subgrafos a LiteRT GPU y con un pico de memoria de 441 MiB.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero ocupa ~829 MB; en el Galaxy S26 el proceso alcanzó un pico de 441 MiB (`VmHWM`) con backend GPU, por lo que el modelo cabe holgadamente en dispositivos con 1-2 GB de memoria libre.
- GPU recomendadas: cualquier GPU Apple Silicon con Metal (validado en M4 Max), GPU Android con soporte LiteRT GPU (validado en Galaxy S26 / SM8850) y, en general, GPUs de escritorio compatibles con el backend LiteRT; no se especifican modelos NVIDIA concretos en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño; la validación publicada se limita a Apple Silicon y Android, no a tarjetas NVIDIA/AMD de consumo.
- Opciones de despliegue: runtime LiteRT-LM (`pip install litert-lm`), CLI `litert-lm run`, servidor `litert-lm serve` con API compatible con OpenAI, y el binario `litert_lm_advanced_main` para selección de backend. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan el formato `.litertlm`.
- Latencia y throughput: ver tabla de benchmarks; TTFT de 0.04 s en GPU Metal y 160 ms en GPU móvil, con decodificación de 239.3 tok/s y 86.5 tok/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| LLaVA-OneVision-0.5B (LiteRT-LM) | 0.5B (decodificador) | 2048 | `.litertlm` / LiteRT-LM | Apache 2.0 | Cuantizado int4/int8, orientado a dispositivo |
| llava-hf/llava-onevision-qwen2-0.5b-ov-hf | 0.5B (decodificador) | no disponible | safetensors / Transformers | Apache 2.0 | Modelo base sin cuantizar; requiere PyTorch |
| Otros VLM de ~0.5B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación con alternativas de la misma categoría (otros VLM de menos de 1B parámetros) no está disponible en la información proporcionada; solo se puede contrastar con su propio modelo base, del que se diferencia por el formato, la cuantización y el runtime de despliegue.

## Limitaciones y advertencias

- Ventana de contexto de solo 2048 tokens en la caché KV: suficiente para una imagen y un diálogo breve, insuficiente para conversaciones largas o múltiples imágenes en una misma sesión.
- Resolución de imagen fija a 384×384: los detalles finos (texto pequeño, objetos lejanos) pueden perderse tras el reescalado.
- Modelo de 0.5B parámetros: capacidad de razonamiento, conocimiento factual y precisión limitadas en comparación con VLM de mayor tamaño; riesgo elevado de alucinación en preguntas visuales complejas o ambiguas.
- No se documentan los idiomas soportados; el ejemplo publicado responde en inglés y no hay garantía de calidad en castellano.
- No se documentan sesgos concretos del modelo ni evaluaciones de seguridad en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los componentes (SigLIP, Qwen2) en sus repositorios originales.
- Problemas conocidos del runtime: la CLI `litert-lm` (0.14.0 a 0.19.2 y nightly 0.20.0.dev20261112) puede reutilizar descargas incompletas en `~/.litert-lm/cache/` sin verificar su tamaño, provocando errores como `too large for file size` o un bus error (exit status 138 en macOS); es necesario borrar el fichero cacheado y volver a descargar.
- Si se descargó el fichero antes del reemplazo del 2026-11-08 (21:38 UTC), hay que eliminar la copia en caché para que la CLI no siga ejecutando la versión anterior.
- La ruta GPU en Android del fichero actual remite a la sección de problemas conocidos del runtime; la validación GPU publicada en el Galaxy S26 corresponde a un fichero anterior del repo (2026-08-25), no al actual.
- El modelo no incluye tool calling ni capacidades de agente; no es adecuado para pipelines que requieran invocación de funciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LLaVA-OneVision-0.5B
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-0.5b-ov-hf
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Tarjeta de resultados edge-compat del modelo: https://github.com/john-rocky/edge-compat/blob/main/cards/llava-onevision-0.5b/CARD.md
- Benchmark de runtimes en Apple Silicon y Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Imagen de ejemplo COCO: https://huggingface.co/huggingface/documentation-images/blob/main/coco_sample.png
