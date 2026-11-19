# litert-community/Qwen2-VL-2B

## Resumen

Qwen2-VL-2B de litert-community es una conversión del modelo vision-lenguaje Qwen2-VL-2B-Instruct de Alibaba al formato LiteRT-LM, el runtime on-device de Google (anteriormente TensorFlow Lite). El paquete empaqueta el codificador visual ViT de Qwen2-VL y el decodificador de lenguaje Qwen2-1.5B en un único fichero `.litertlm` de aproximadamente 1,78 GB, pensado para inferencia multimodal imagen+texto completamente en dispositivo, sin conexión a la nube.

La relevancia de esta conversión reside en que permite ejecutar un VLM generalista en hardware móvil y de escritorio con un rendimiento medido: 46,3 tokens/s de decodificación y 657 tokens/s de prefill en la GPU de un Galaxy S26, y 139,1 tokens/s de decodificación en la GPU Metal de un Apple M4 Max. El modelo base destaca por su codificador visual de resolución dinámica y su capacidad para VQA general, descripción de imágenes y lectura de documentos/OCR en un tamaño de bolsillo.

La ficha describe la conversión concreta publicada por litert-community, no el modelo original de Alibaba; las capacidades y limitaciones reflejan tanto la arquitectura de Qwen2-VL como las restricciones introducidas por la cuantización int4/int8 y la resolución fija de imagen del bundle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer: ViT (32 capas, 1280-dim, atención completa) + decodificador Qwen2-1.5B (28 capas, hidden 1536, GQA kv2) |
| Parametros totales | no disponible (el bundle empaqueta ViT + Qwen2-1.5B; el modelo base se denomina 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 (KV cache del bundle LiteRT-LM) |
| Tipos de cuantizacion | Decodificador int4 (simétrico, blockwise-32 + OCTAV); ViT int8; adaptador PatchMerger int8; embedder externo int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, ~1,78 GB); modelo base en safetensors |

## Arquitectura y entrenamiento

El bundle replica la arquitectura de Qwen2-VL: un codificador visual ViT de 32 capas y 1280 dimensiones con atención completa que procesa la imagen y un adaptador PatchMerger (LayerNorm → agrupación 2×2 → MLP) que proyecta las características visuales al tamaño oculto del texto (1536). El decodificador es Qwen2-1.5B con 28 capas, hidden 1536 y GQA con 2 cabezas KV. En esta conversión el ViT se hace estático a 672×672 píxeles, lo que produce 2304 parches que tras el merge 2×2 se reducen a 576 tokens de imagen; la normalización OpenAI-CLIP está incorporada en el codificador.

La conversión se realizó con `litert-torch` (el antiguo `ai-edge-torch`). El fichero publicado el 2026-11-14 tiene los grafos de prefill/decode reescritos para GPU por un script separado, sin cambios en los pesos. El decodificador usa cuantización int4 simétrica blockwise-32 con OCTAV y un embedder externo int8; el ViT y el adaptador usan int8. No se dispone de información sobre el dataset de entrenamiento ni sobre las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento general en inglés y otros idiomas (no se detalla la lista).
- Comprensión de imágenes: descripción detallada, VQA (visual question answering) y grounding visual.
- Lectura de documentos y OCR: transcripción de texto en imágenes, incluyendo cifras, correos y teléfonos.
- Lectura de tablas y conteo de elementos (p. ej., "hay 5 productos listados").
- Procesamiento de múltiples imágenes en una misma consulta mediante `--attachment` repetido.
- Inferencia completamente on-device, sin conexión a la nube.
- Servicio como API local compatible con OpenAI mediante `litert-lm serve`.
- No se documenta soporte de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Descripción automática de imágenes en aplicaciones móviles: el bundle procesa una foto y genera una descripción en una frase con latencia de TTFT de 0,16 s en GPU Metal de M4 Max, adecuado para apps de accesibilidad o catalogación de fotos.
- OCR y digitalización de documentos en dispositivo: la transcripción verificada de una página de informe sintético (cifras, correo y teléfono) permite construir escáneres de facturas o extractores de datos sin enviar documentos a la nube.
- Asistencia visual para personas con discapacidad visual: la capacidad de grounding detallado (descripción de paisajes, objetos y posiciones) y la ejecución local en un Pixel 8a lo hacen viable en tiempo real.
- Moderación y etiquetado de contenido visual: clasificación y descripción de imágenes en pipelines de moderación que requieren privacidad, al no salir los datos del dispositivo.
- Análisis de tablas e informes en movilidad: lectura de tablas y conteo de filas para aplicaciones de campo (inventario, inspección) donde no hay conectividad.
- Chat multimodal local de escritorio: `litert-lm serve` expone una API compatible con OpenAI para integrar el modelo en herramientas de escritorio con privacidad de datos.
- Prototipado de agentes visuales en edge: la ventana de 4096 tokens y el soporte multi-imagen permiten conversaciones multi-turno con contexto visual moderado en dispositivos sin GPU dedicada.

## Benchmarks y rendimiento

| Dispositivo | Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 141 tok/s | 42,7 tok/s | 1,96 s |
| Apple M4 Max (macOS) | GPU (Metal) | 1753 tok/s | 139,1 tok/s | 0,16 s |
| Galaxy S26 (GPU) | GPU | 657 tok/s (1024 tokens) | 46,3 tok/s | no disponible |

Medido con `litert-lm benchmark` (litert-lm 0.15.0) en M4 Max, `-p 256 -d 256 --runs 3`, max-num-tokens 4096, warm-up descartado. Las cifras cubren la ruta de texto; el codificador visual se ejecuta una vez por imagen y no está incluido. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el bundle ocupa ~1,78 GB en disco; en ejecución requiere al menos ~2 GB de memoria disponible, más el espacio para el KV cache de 4096 tokens.
- GPU recomendadas: GPU Metal en Apple Silicon (M4 Max medido), GPU de Galaxy S26 (medido), GPU de Pixel 8a (verificado en Google AI Edge Gallery con visión en GPU y decodificador en CPU).
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-3 GB de memoria libre; también funciona en CPU.
- Opciones de despliegue: runtime `litert-lm` (pip install litert-lm), `litert-lm run`, `litert-lm serve` (API compatible con OpenAI), Google AI Edge Gallery en Android.
- Latencia y throughput: TTFT de 0,16 s en GPU Metal M4 Max; 139,1 tok/s de decodificación en GPU Metal y 42,7 tok/s en CPU M4 Max; 46,3 tok/s en GPU de Galaxy S26.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/despliegue | Licencia |
|---|---|---|---|---|
| Qwen2-VL-2B (LiteRT-LM, este) | ViT + Qwen2-1.5B | 4096 | `.litertlm`, on-device | Apache-2.0 |
| Qwen2-VL-2B-Instruct (original) | 2B | 32768 (según modelo base, no confirmado en la información) | safetensors, GPU/servidor | Apache-2.0 |
| Alternativas on-device de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Resolución de imagen fija a 672×672: imágenes de mayor resolución se reescalan, lo que puede perder detalle en documentos densos o texto pequeño.
- Contexto limitado a 4096 tokens de KV cache, muy inferior al contexto del modelo base; las conversaciones multi-turno con muchas imágenes se truncarán.
- Cuantización agresiva (int4 en el decodificador) puede degradar la precisión frente al modelo original, especialmente en razonamiento complejo y tareas numéricas.
- Punto débil documentado: el ranking de celdas de tabla entre filas es la tarea con peor rendimiento.
- Riesgo de alucinación inherente a los VLM de 2B; las descripciones y transcripciones deben validarse en producción.
- Idiomas soportados no documentados en la información disponible; el ejemplo verificado está en inglés.
- No se documenta soporte de tool calling ni de agentes multi-paso.
- Posibles problemas de descarga incompleta del fichero `.litertlm` en versiones del CLI 0.14.0-0.19.2; el autor recomienda borrar el fichero de caché y reintentar.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen2-VL-2B-Instruct (Apache-2.0 según la model card).

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Qwen2-VL-2B
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Benchmark de referencia en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
