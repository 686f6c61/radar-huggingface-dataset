# litert-community/SmolVLM2-2.2B

## Resumen

SmolVLM2-2.2B en formato LiteRT-LM es una conversión del modelo vision-language SmolVLM2-2.2B-Instruct de Hugging Face al runtime LiteRT-LM de Google, empaquetada en un único fichero `.litertlm` listo para inferencia local de imagen y texto en dispositivos. La conversión la mantiene la organización comunitaria `litert-community` y está pensada para ejecución on-device (móviles, portátiles y equipos de escritorio) sin conexión a red. El modelo combina un codificador visual SigLIP con un decodificador de lenguaje SmolLM2-1.7B de arquitectura Llama, sumando 2.2 mil millones de parámetros.

La relevancia de esta ficha está en que empaqueta pesos cuantizados (int8 en visión, int4 en el decodificador) en un grafo optimizado para GPU, con un rendimiento medido de 36.1 tokens/s en decodificación y 483 tokens/s en prefill sobre una GPU de Galaxy S26 con LiteRT-LM v0.19.0. En escritorio, sobre un Apple M4 Max con backend Metal, alcanza 134.7 tokens/s de decodificación y 1608 tokens/s de prefill, con un TTFT de 0.18 s. El contexto de KV cache es de 2048 tokens y cada imagen se reduce a 81 tokens visuales tras el pixel-shuffle.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el repositorio ocupa 7.6 GB. La fecha de creación del repositorio es el 1 de julio de 2026 y la última actualización el 20 de noviembre de 2026, con 467 descargas y 2 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: codificador SigLIP + conector pixel-shuffle x3 + decodificador SmolLM2-1.7B (Llama) |
| Parametros totales | 2.2 mil millones (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (KV cache) |
| Tipos de cuantizacion | Vision encoder int8; decodificador int4 (blockwise-32 + OCTAV); embedding atado int8 externalizado; computo entero |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura vision-language de dos torres. El codificador visual es un SigLIP que procesa imágenes redimensionadas a 384x384 con parches de 14 píxeles, generando 729 parches sin token CLS. Un conector pixel-shuffle con factor de reducción 3 y una capa lineal proyectan esa salida a 81 tokens visuales que se inyectan en el decodificador de lenguaje. El decodificador es SmolLM2-1.7B, un transformer de arquitectura Llama con dimensión oculta de 2048 y 24 capas. La normalización de la imagen `(x-0.5)/0.5` está incorporada dentro del codificador visual.

La conversión a LiteRT-LM se realizó con litert-torch y aplica cuantización int8 al codificador visual y int4 con bloques de 32 elementos más OCTAV al decodificador, con embeddings atados en int8 externalizados y cómputo entero. El 15 de noviembre de 2026 se sustituyó el fichero por una versión cuyo grafo de prefill y decode fue reescrito para GPU, sin modificar ningún peso. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto e imagen-a-texto: responde preguntas sobre imágenes con respuestas fundamentadas en el contenido visual.
- Descripción de imágenes y captioning: genera descripciones de una frase o párrafos a partir de una fotografía.
- Comprensión visual de escenas: identifica objetos, colores, disposición y elementos presentes en la imagen.
- Procesamiento multimodal de una sola imagen por consulta (el autor advierte sobre el uso de múltiples imágenes con `--attachment`).
- Inferencia completamente offline: no requiere conexión a red una vez descargado el fichero.
- Servicio local con API compatible con OpenAI mediante `litert-lm serve`.
- Chat interactivo multi-turno mediante el CLI de litert-lm.
- No se dispone de información sobre tool calling, function calling, agentes o modos de razonamiento extendido en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en aplicaciones móviles: el modelo procesa una foto de 384x384 y genera un caption en una sola pasada, con 81 tokens visuales por imagen, adecuado para apps de galería o accesibilidad que necesitan etiquetar fotos sin conexión.
- Asistencia visual para personas con discapacidad visual: dado que corre on-device y sin red, puede describir el entorno capturado por la cámara del teléfono en tiempo real, con una latencia de prefill de 483 tokens/s en GPU de Galaxy S26.
- Moderación de contenido visual en el borde: clasificación y descripción de imágenes subidas por usuarios en aplicaciones móviles antes de enviarlas a un servidor, reduciendo costes de ancho de banda y preservando la privacidad.
- Digitalización de documentos y tickets: extracción de información textual a partir de capturas o fotos de documentos, con contexto de 2048 tokens suficiente para una página y respuesta.
- Prototipado de asistentes multimodales en portátiles: sobre un Apple M4 Max con backend Metal alcanza 134.7 tokens/s de decodificación, lo que permite iterar en el desarrollo de interfaces conversacionales con imagen sin depender de APIs en la nube.
- Servicio local de visión para pipelines de automatización: mediante `litert-lm serve` se expone una API compatible con OpenAI que puede integrarse en flujos de trabajo locales de clasificación o anotación de imágenes.
- Demostraciones y docencia sobre IA on-device: el tamaño de 7.6 GB del repositorio y la licencia Apache 2.0 facilitan su uso en entornos educativos y de investigación sin restricciones de licencia.

## Benchmarks y rendimiento

Datos de rendimiento medidos por el autor del modelo (no son benchmarks de calidad tipo MMLU o HumanEval; son métricas de velocidad de inferencia):

| Dispositivo | Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 119 tok/s | 33.6 tok/s | 2.34 s |
| Apple M4 Max (macOS) | GPU (Metal) | 1608 tok/s | 134.7 tok/s | 0.18 s |
| Galaxy S26 | GPU | 483 tok/s (prefill 1024 tokens) | 36.1 tok/s | no disponible |

Los datos de Apple M4 Max se midieron con `litert-lm benchmark` (litert-lm 0.15.0), con `-p 256 -d 256 --runs 3`, max-num-tokens 4096 y warm-up descartado. Los datos de Galaxy S26 corresponden a LiteRT-LM v0.19.0, con prefill de 1024 tokens y generación de 256 tokens, tres iteraciones. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 7.6 GB y el modelo tiene 2.2 mil millones de parámetros con cuantización int4 en el decodificador e int8 en visión, por lo que la huella en memoria es sustancialmente menor que el tamaño del repo.
- GPU recomendadas: GPU integrada de Galaxy S26 (medido), Apple M4 Max con Metal (medido). No se dispone de datos para A100, H100 o RTX 4090 en la información proporcionada.
- Cabe en GPU de consumo: sí, según las mediciones en Galaxy S26 y Apple M4 Max; no se dispone de datos para RTX 4090 u otras GPU de consumo de escritorio.
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm run`, `litert-lm serve`, `litert-lm benchmark`), instalable con `pip install litert-lm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 36.1 tok/s de decode y 483 tok/s de prefill en Galaxy S26 GPU; 134.7 tok/s de decode y 1608 tok/s de prefill en Apple M4 Max GPU; 33.6 tok/s de decode y 119 tok/s de prefill en Apple M4 Max CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLM2-2.2B (LiteRT-LM) | 2.2 B | 2048 | `.litertlm` | Apache 2.0 | litert-community |
| SmolVLM2-500M (LiteRT-LM) | 500 M (aproximado) | no disponible | `.litertlm` | no disponible en la informacion | litert-community |
| SmolVLM2-2.2B-Instruct (original) | 2.2 B | no disponible | safetensors (presumible) | Apache 2.0 (presumible) | HuggingFaceTB |

El autor indica que SmolVLM2-2.2B es el mayor y más capaz de la familia SmolVLM2 y notablemente más capaz que SmolVLM2-500M. No se dispone de datos de benchmarks comparativos de calidad entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El contexto de KV cache es de solo 2048 tokens, lo que limita conversaciones multi-turno largas y documentos extensos.
- El autor advierte que el uso de múltiples imágenes con `--attachment` no está recomendado (nota de una sola imagen).
- La cuantización int4 del decodificador y int8 del codificador pueden degradar la calidad respecto al modelo original en float; el autor indica que la torre visual convierte fielmente (correlación float CPU ≈ 1.0) pero no aporta métricas de calidad del decodificador.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe más allá del inglés sin datos.
- El fichero ha sido sustituido el 15 de noviembre de 2026; el CLI de litert-lm (0.14.0 a 0.19.2) puede reutilizar copias antiguas en caché sin verificar, lo que produce resultados del fichero anterior. Es necesario borrar el fichero en `~/.litert-lm/cache/huggingface/litert-community/SmolVLM2-2.2B/` y volver a descargar.
- Descargas incompletas pueden provocar errores de bus (exit status 138 en Mac) o `too large for file size`; hay que eliminar el fichero de caché y reintentar.
- En escritorio solo se ha probado en macOS; no hay datos de Windows o Linux en la información proporcionada.
- Solo se ha probado la generación de captions en los backends de escritorio listados; `litert-lm serve` y el chat interactivo no se probaron con este fichero según el autor.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base SmolVLM2-2.2B-Instruct por si hubiera términos adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/SmolVLM2-2.2B
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Modelo SmolVLM2-500M en LiteRT-LM: https://huggingface.co/litert-community/SmolVLM2-500M
- Imagen de ejemplo COCO: http://images.cocodataset.org/val2017/000000039769.jpg
