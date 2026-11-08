# litert-community/Qwen2-VL-2B

## Resumen

Qwen2-VL-2B en formato LiteRT-LM es una conversión del modelo vision-lenguaje Qwen2-VL-2B-Instruct de Alibaba al formato `.litertlm`, pensada para inferencia multimodal (imagen + texto) completamente en dispositivo mediante el runtime LiteRT-LM de Google. El bundle empaqueta un codificador visual ViT de Qwen2-VL (32 capas, 1280 dimensiones) con un decodificador de lenguaje Qwen2-1.5B (28 capas, hidden 1536, GQA con 2 cabezas KV), cuantizado a int8 en la torre visual y a int4 en el decodificador, en un único fichero de aproximadamente 1,78 GB.

El interés de esta ficha no está en el modelo base, ampliamente conocido, sino en la conversión: es el primer VLM de la familia Qwen2-VL publicado en formato LiteRT-LM y permite ejecutar VQA general, descripción de imágenes y OCR de documentos en un teléfono móvil o en escritorio sin conexión. La ventana de contexto del KV cache es de 4096 tokens y la imagen se redimensiona de forma estática a 672×672 píxeles, lo que produce 576 tokens visuales por imagen.

La relevancia actual reside en la madurez del ecosistema on-device: LiteRT es el nuevo nombre de TensorFlow Lite y `litert-torch` el de `ai-edge-torch`, y este bundle se ejecuta con el mismo fichero en macOS, Linux y Windows, además de en Android mediante Google AI Edge Gallery. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: ViT (Qwen2-VL, 32 capas, 1280 dim, atención completa) + decodificador transformer Qwen2-1.5B (28 capas, hidden 1536, GQA kv2) |
| Parametros totales | no disponible (decodificador de 1,5B y torre visual de 2B en conjunto; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (KV cache del runtime LiteRT-LM) |
| Tipos de cuantizacion | int8 en visión y adaptador PatchMerger; int4 simétrico blockwise-32 + OCTAV en el decodificador; embedder externo en int8 |
| Idiomas soportados | no disponible (la model card no detalla idiomas; el modelo base Qwen2-VL es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero `Qwen2-VL-2B.litertlm` de ~1,78 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Qwen2-VL: un codificador visual ViT con 32 capas y 1280 dimensiones de atención completa que procesa la imagen y un adaptador PatchMerger (LayerNorm, agrupación 2×2, MLP) que proyecta los parches a la dimensión oculta del texto (1536). La conversión aplica una reescritura estática de la torre visual a 672×672 píxeles, lo que genera 2304 parches que tras el merge 2×2 quedan en 576 tokens de imagen. La normalización OpenAI-CLIP está incorporada en el propio codificador.

El decodificador es un Qwen2-1.5B extraído como modelo independiente, con logits fp32 bit-exactos respecto al original. La cuantización int4 emplea la misma receta blockwise-32 + OCTAV usada en los LLM Qwen2/Qwen3 ya publicados por la comunidad LiteRT. La torre visual en int8 alcanza correlación 0,90 con la implementación de referencia (1,0 en fp32) y no utiliza operaciones FLEX/CUSTOM, por lo que es apta para GPU. No se dispone de información sobre el dataset de entrenamiento ni sobre fases de RLHF/DPO en la información proporcionada; esos detalles pertenecen al modelo base original de Alibaba.

Una innovación destacable del runtime es la ruta `fast_vlm`, que sustituye el M-RoPE tridimensional de Qwen2-VL por posiciones secuenciales 1-D. Para tokens de texto es matemáticamente idéntico y preserva descripción, VQA general, conteo y OCR, pero aplana la estructura 2-D de las tablas, lo que afecta al razonamiento comparativo entre celdas (ver limitaciones).

## Capacidades

- Generación de texto e imagen-a-texto: descripción de imágenes, respuesta a preguntas visuales (VQA) y razonamiento sobre el contenido de una fotografía.
- OCR y lectura de documentos: transcripción de texto en imágenes, incluyendo cifras, correos y teléfonos, con resultados verificados en una página de informe sintética.
- Conteo de objetos y lectura de tablas: identifica el número de elementos listados y lee celdas correctamente.
- Razonamiento multimodal abierto: responde preguntas libres sobre la imagen (describir, contar, leer, razonar), no solo extracción de texto.
- Entrada de múltiples imágenes: el CLI acepta `--attachment` repetido para adjuntar varias imágenes.
- Modo chat interactivo y modo prompt único mediante el CLI `litert-lm`.
- Servidor local con API compatible con OpenAI mediante `litert-lm serve`.
- Ejecución completamente on-device, sin conexión de red, en macOS, Linux, Windows y Android.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Accesibilidad en dispositivos móviles: descripción de escenas y fotografías para personas con discapacidad visual, ejecutando el modelo íntegramente en el teléfono (verificado en Pixel 8a con visión en GPU y decodificador en CPU) sin enviar imágenes a la nube.
- Digitalización de documentos en campo: lectura y transcripción de informes, facturas o etiquetas mediante OCR con el modelo en local, útil en entornos sin conectividad o con requisitos de privacidad estrictos.
- Asistencia en aplicaciones de inventario: conteo de productos en una imagen y lectura de tablas de existencias, aprovechando la capacidad de conteo verificada, con la cautela de no pedir ranking entre celdas.
- Moderación y etiquetado de imágenes en el borde: generación automática de descripciones y metadatos para bibliotecas fotográficas locales, con 576 tokens visuales por imagen y contexto de 4096 tokens que permite varias imágenes por sesión.
- Prototipado de asistentes multimodales: uso de `litert-lm serve` para exponer una API compatible con OpenAI en local y conectar aplicaciones existentes sin reescribir el cliente.
- Verificación de calidad en pipelines de impresión o diseño: comprobación de que un documento renderizado contiene los textos y cifras esperados, gracias a la transcripción exacta observada en pruebas.
- Demos educativas de visión por computador: ejecución de un VLM de referencia en portátiles y móviles para enseñanza, con un único fichero de 1,78 GB y sin dependencias de servidor.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.). Sí incluye mediciones de rendimiento del runtime con `litert-lm benchmark` (litert-lm 0.15.0, `-p 256 -d 256 --runs 3`, max-num-tokens 4096, media de tres iteraciones, ejecución de calentamiento descartada):

| Dispositivo | Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 141 tok/s | 42,7 tok/s | 1,96 s |
| Apple M4 Max (macOS) | GPU (Metal) | 1753 tok/s | 139,1 tok/s | 0,16 s |

Estas cifras cubren la ruta de texto; el codificador visual se ejecuta una vez por imagen y no está incluido. En cuanto a precisión, la torre visual static-rewrite frente a la referencia logra correlación 1,0 en fp32 y 0,90 en int8, sin operaciones FLEX/CUSTOM. El decodificador extraído presenta logits fp32 bit-exactos frente al original.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle ocupa ~1,78 GB en disco; la inferencia requiere al menos ese espacio en memoria más el KV cache para 4096 tokens. No se publica una cifra exacta de memoria pico.
- GPU recomendadas: no hay una lista oficial; las mediciones se realizaron en Apple M4 Max con backend Metal y en CPU. En Android se verificó en Pixel 8a con visión en GPU y decodificador en CPU.
- ¿Cabe en GPU de consumo? Sí, por tamaño (1,78 GB) es apto para GPUs de consumo y para teléfonos; no se detallan modelos concretos de NVIDIA o AMD.
- Opciones de despliegue: runtime LiteRT-LM (`pip install litert-lm`), CLI `litert-lm run`, servidor `litert-lm serve` con API compatible con OpenAI, y Google AI Edge Gallery en Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 42,7 tok/s de decode en CPU y 139,1 tok/s en GPU Metal sobre M4 Max; TTFT de 1,96 s en CPU y 0,16 s en GPU para prefill de 256 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/Qwen2-VL-2B | Decodificador 1,5B + ViT 2B (conjunto) | 4096 | `.litertlm` / LiteRT-LM | Apache-2.0 | Cuantizado int4/int8, on-device, imagen estática 672×672 |
| Qwen/Qwen2-VL-2B-Instruct | 2B | no disponible en la información | safetensors / transformers | Apache-2.0 | Modelo base original, resolución dinámica, M-RoPE real |
| Otros VLM on-device de la comunidad LiteRT | no disponible | no disponible | `.litertlm` | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros VLM pequeños como PaliGemma o SmolVLM) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Razonamiento comparativo entre celdas de tabla: el runtime `fast_vlm` usa posiciones 1-D en lugar del M-RoPE 3-D de Qwen2-VL, lo que aplana la estructura 2-D. El modelo lee correctamente cada celda (OCR perfecto) pero puede elegir la celda equivocada al preguntar, por ejemplo, qué fila tiene el valor más alto. Es una limitación del runtime, no del modelo base ni de la cuantización.
- Resolución de imagen fija: la conversión fuerza 672×672 píxeles, perdiendo la resolución dinámica del Qwen2-VL original; imágenes muy grandes o con texto pequeño pueden degradarse.
- Contexto limitado a 4096 tokens, suficiente para una o pocas imágenes pero no para conversaciones largas con muchas imágenes.
- Cuantización agresiva: int4 en el decodificador e int8 en visión; la correlación de la torre visual baja a 0,90 en int8, con posible pérdida sutil en tareas visuales exigentes.
- Idiomas soportados no documentados en la model card; el comportamiento multilingüe no está verificado para esta conversión.
- Riesgo de alucinación inherente a los VLM: descripciones plausibles pero incorrectas, especialmente en escenas ambiguas o texto borroso.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; hereda los del modelo base Qwen2-VL-2B-Instruct.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de los componentes de terceros (runtime LiteRT, normalización CLIP) antes de distribuir.
- El rendimiento medido corresponde a Apple M4 Max; en hardware móvil o GPUs modestas la latencia será sustancialmente mayor y no se publican cifras para esos casos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen2-VL-2B
- Ficheros del repositorio: https://huggingface.co/litert-community/Qwen2-VL-2B/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Medición de fidelidad de conversión LiteRT en Galaxy S26: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
