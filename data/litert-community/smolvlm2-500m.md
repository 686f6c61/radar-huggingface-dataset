# litert-community/SmolVLM2-500M

## Resumen

SmolVLM2-500M es la conversión a LiteRT-LM del modelo SmolVLM2-500M-Video-Instruct de Hugging Face, publicada por la comunidad `litert-community`. Se trata de un modelo de visión-lenguaje (VLM) de muy pequeño tamaño pensado para inferencia totalmente local en dispositivos: combina un codificador visual SigLIP con un decodificador de lenguaje SmolLM2-360M de arquitectura Llama, empaquetado en un único fichero `.litertlm` de aproximadamente 363 MB.

El problema que resuelve es el de llevar capacidades multimodales (imagen + texto) a entornos sin conectividad ni GPU de servidor: móviles Android, equipos de escritorio y portátiles, con cómputo entero (int8 en visión, int4 en el decodificador). El runtime objetivo es LiteRT-LM, el motor on-device de Google derivado de TensorFlow Lite, y el proceso de conversión se realizó con `litert-torch` (el antiguo `ai-edge-torch`).

Es relevante ahora porque demuestra que un VLM funcional cabe en menos de 400 MB y se ejecuta con latencia interactiva en hardware de consumo: en una Galaxy S26 (GPU) decodifica 79,8 tokens/s y hace prefill de 1.024 tokens a 1.741 tokens/s según la model card. La ventana de contexto del KV cache es de 2.048 tokens y la imagen de entrada se redimensiona a 512×512, generando 64 tokens visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador SigLIP (512×512, 1.024 parches, sin CLS) + conector pixel-shuffle ×4 + Linear, y decodificador SmolLM2-360M (Llama, 960-dim, 32 capas, GQA 15/5) |
| Parametros totales | 500M (denominacion del modelo); decodificador de 360M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (KV cache) |
| Tipos de cuantizacion | Vision int8; decodificador int4 (blockwise-32 + OCTAV); embedding atado en INT8 externalizado; computo entero |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (~363 MB) para el runtime LiteRT-LM |

## Arquitectura y entrenamiento

La arquitectura es un VLM de dos torres: un codificador visual SigLIP que procesa imágenes de 512×512 píxeles (1.024 parches, sin token CLS), un conector de pixel-shuffle ×4 seguido de una capa Linear que comprime la representación visual a 64 tokens de imagen, y un decodificador de lenguaje SmolLM2-360M con arquitectura Llama (dimensión 960, 32 capas, atención GQA con 15 cabezas de query y 5 de key/value). La normalización de la imagen ((x−0,5)/0,5) está incorporada dentro del codificador visual.

El modelo base es SmolVLM2-500M-Video-Instruct de Hugging Face; esta publicación es una conversión cuantizada (relación `base_model_relation: quantized`) realizada con `litert-torch`. El fichero publicado el 2026-11-13 (19:44 UTC) tiene los grafos de prefill y decode reescritos para GPU por un script separado, sin cambios en los pesos. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento original (número de tokens, composición, uso de RLHF/DPO). La conversión del codificador visual SigLIP es fiel a nivel de bit (correlación ≈ 1,0 con la salida float en CPU).

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales (VQA) de un solo turno.
- Respuestas ancladas a la imagen: la model card verifica en CPU respuestas coherentes y fundamentadas en el contenido visual.
- Procesamiento de múltiples imágenes en una misma interacción (el CLI admite `--attachment` repetido).
- Conversación interactiva multi-turno dentro de la ventana de 2.048 tokens.
- Ejecución totalmente offline en macOS, Linux y Windows con el mismo fichero.
- Exposición como API local compatible con OpenAI mediante `litert-lm serve`.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, audio ni modo de razonamiento explícito (thinking).

## Casos de uso

- Descripción automática de imágenes en aplicaciones móviles: el modelo recibe una foto redimensionada a 512×512 y devuelve una frase descriptiva; con 363 MB y cómputo entero es viable embeberlo en una app Android vía LiteRT sin depender de la nube.
- Accesibilidad para personas con discapacidad visual: un asistente local que describa el entorno a partir de capturas de cámara, funcionando sin conectividad y con latencia de decodificación de decenas de tokens por segundo.
- Etiquetado y moderación de contenido en el dispositivo: clasificación o descripción preliminar de imágenes antes de subirlas a un servidor, reduciendo ancho de banda y preservando la privacidad de los datos del usuario.
- Asistencia en aplicaciones de campo sin cobertura: técnicos que fotografían equipos o documentos y reciben una descripción o respuesta textual en un portátil o tableta, usando el backend CPU de LiteRT-LM.
- Prototipado rápido de pipelines multimodales: `litert-lm serve` expone el modelo como API compatible con OpenAI, lo que permite integrarlo en prototipos existentes sin cambiar el cliente.
- Procesamiento por lotes de imágenes en escritorio: con 409 tok/s de prefill y 63,9 tok/s de decodificación en un Apple M4 Max (backend CPU), es adecuado para tareas de captioning a pequeña escala en local.
- Filtro previo en sistemas de agentes: usar el modelo como primer nivel de comprensión visual (por ejemplo, detectar si una imagen contiene texto o un objeto concreto) antes de escalar a un VLM mayor.

## Benchmarks y rendimiento

Datos de rendimiento publicados en la model card (no son benchmarks de calidad tipo MMLU, sino medidas de inferencia):

| Dispositivo | Backend | Prefill | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS), litert-lm 0.15.0, prefill 256 / decode 256 | CPU | 409 tok/s | 63,9 tok/s | 0,64 s |
| Galaxy S26, litert-lm v0.19.0 | GPU | 1.741 tok/s (1.024 tokens) | 79,8 tok/s | no disponible |

Notas: las cifras de M4 Max cubren solo la ruta de texto; el codificador visual se ejecuta una vez por imagen y no está incluido. El backend GPU de macOS no era utilizable con litert-lm 0.15.0 (devolvía secuencias de `<|endoftext|>`), aunque con 0.17.0–0.19.2 responde correctamente. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Tamaño en disco: ~363 MB para el fichero `.litertlm`; el repositorio completo ocupa 1,8 GB.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; por el tamaño del fichero y el cómputo entero, el modelo está diseñado para ejecutarse en memoria de dispositivo, no en VRAM de GPU dedicada.
- GPU recomendadas: no aplica en el sentido habitual; el runtime objetivo es LiteRT-LM sobre GPU integrada de móvil (verificado en Galaxy S26) y CPU de escritorio (verificado en Apple M4 Max).
- Cabe en hardware de consumo: sí, es su propósito; verificado en un smartphone Galaxy S26 y en un Mac con Apple M4 Max.
- Opciones de despliegue: LiteRT-LM (`litert-lm run`, `litert-lm benchmark`, `litert-lm serve` con API compatible con OpenAI). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; TTFT de 0,64 s en M4 Max (CPU, prefill de 256 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/SmolVLM2-500M (este) | 500M (decoder 360M) | 2.048 | `.litertlm` / LiteRT-LM | Apache 2.0 | Cuantizado int4/int8, orientado a dispositivo |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct | 500M | no disponible en la informacion | safetensors (modelo base) | Apache 2.0 | Modelo original sin cuantizar; sirve de referencia |
| Otras alternativas de VLM pequeño | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo muy pequeño (500M): en decodificación puramente greedy puede volverse repetitivo o verboso; la model card recomienda usar muestreo (por ejemplo, top-p) y limitar `max_tokens`.
- Ventana de contexto de solo 2.048 tokens, lo que restringe conversaciones largas y el número de imágenes simultáneas.
- Imágenes forzadas a 512×512: se pierde detalle en imágenes de alta resolución o con texto pequeño.
- No hay información sobre sesgos, idiomas soportados ni evaluación de alucinación; al ser un VLM pequeño, el riesgo de descripciones incorrectas o inventadas en imágenes ambiguas es relevante.
- El backend GPU de macOS falló con litert-lm 0.15.0; se recomienda CPU en escritorio con esa versión y verificar la versión del runtime.
- Problemas conocidos de caché del CLI: descargas incompletas pueden quedar en `~/.litert-lm/cache/huggingface/litert-community/SmolVLM2-500M/` y reutilizarse sin comprobar tamaño; si el fichero se descargó antes del reemplazo del 2026-11-13, hay que borrarlo manualmente para usar la versión nueva.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución; el modelo base es de Hugging Face y esta publicación es una conversión de la comunidad, no oficial.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse en producción.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/SmolVLM2-500M
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Medición de referencia citada (LiteRT en Galaxy S26): https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
