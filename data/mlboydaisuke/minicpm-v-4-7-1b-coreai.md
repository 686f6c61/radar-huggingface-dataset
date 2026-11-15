# mlboydaisuke/MiniCPM-V-4.7-1B-CoreAI

## Resumen

MiniCPM-V-4.7-1B-CoreAI es una conversión del modelo visión-lenguaje MiniCPM-V-4.7-1B de OpenBMB al formato Core AI de Apple, publicada por el usuario mlboydaisuke. El paquete contiene únicamente los grafos `.aimodel` necesarios para ejecutar el modelo en dispositivos Apple (iPhone, Mac) mediante el motor Core AI, no los pesos originales en safetensors. El modelo base resuelve la tarea image-text-to-text: recibe una imagen y una pregunta y devuelve una respuesta en texto.

La relevancia de esta conversión es que demuestra la viabilidad de ejecutar un VLM de 1B parámetros completamente en un iPhone moderno con cuantización int8, alcanzando 98,0 tokens por segundo en un iPhone 18 Pro con iOS 27.2. La arquitectura combina una torre de visión SigLIP de 27 capas con un decodificador de texto Qwen3.5 híbrido de 24 capas (18 Gated DeltaNet + 6 atención completa), con un vocabulario de 248.094 tokens y un contexto no especificado en la información disponible.

El modelo soporta inglés y chino, se distribuye bajo licencia Apache-2.0 y está pensado para inferencia on-device. La conversión introduce cambios técnicos relevantes respecto a la versión 4.6, como posiciones M-RoPE sobre lienzo y un `lm_head` desacoplado del embedding, que afectan al proceso de portabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM: torre SigLIP (27 capas, ancho 1152, patch 14) + decodificador Qwen3.5 híbrido (24 capas: 18 Gated DeltaNet + 6 atención completa, hidden 1024) |
| Parámetros totales | no disponible (repo de 3,0 GB; el decodificador int8hu pesa 1.308.109.419 bytes y la torre int8lin 613.967.602 bytes) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 por bloques de 32 (decodificador, cuerpo `symmetric_with_clipping`, cabeza `symmetric`); int8 por bloques de 16 (torre `int8lin`); fp16 (embedding, conv, norms y torre `fp16`) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (grafos Core AI) + `metadata.json` + `tokenizer/`; no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V-4.7-1B emplea una torre de visión tipo SigLIP de 27 capas con ancho 1152 y parches de 14 píxeles, que incorpora un merger de atención por ventanas tras la capa 6 y un MLP de downsample 2×2. Una imagen de 448×448 se comprime a 64 tokens visuales que se insertan en la secuencia del decodificador de texto. El decodificador es un Qwen3.5 híbrido de 24 capas, con 18 capas de Gated DeltaNet y 6 de atención completa, hidden de 1024 y vocabulario de 248.094 tokens. Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

La conversión a Core AI introduce tres diferencias técnicas respecto a la versión 4.6. Primero, las posiciones son M-RoPE sobre lienzo: cada token recibe tres planos (T, H, W) con secciones intercaladas [11, 11, 10], y el texto posterior a la imagen continúa más allá del lienzo; el decodificador deriva estos planos dentro del grafo. Segundo, la cabeza de salida está desacoplada del embedding: `lm_head.weight` es un tensor propio de [248094, 1024] (0,51 GB en bf16), con una diferencia máxima de 4,9e-4 respecto al embedding, y usar el embedding como cabeza desplaza los logits hasta 0,196 y reordena el top-5 en 2 de 48 posiciones, por lo que el bundle incluye la cabeza original. Tercero, el procesador devuelve `mm_token_type_ids` (no usado aquí porque el decodificador lee la imagen de los ids), la generación se detiene en 248044 o 248046, y la plantilla de chat tiene un interruptor `enable_thinking`; este port ejecuta con thinking desactivado.

## Capacidades

- Generación de texto condicionada por imagen: responde preguntas sobre el contenido visual de una imagen de entrada.
- Comprensión de imagen en formato 448×448, comprimida a 64 tokens visuales.
- Razonamiento multimodal básico en inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y chino.
- Modo thinking disponible en la plantilla de chat mediante `enable_thinking`, aunque este port lo ejecuta desactivado.
- Inferencia on-device en dispositivos Apple mediante el motor Core AI.

## Casos de uso

- Asistencia visual en el iPhone: el modelo puede procesar una foto tomada con la cámara y responder preguntas sobre ella en el propio dispositivo, sin enviar la imagen a un servidor, gracias a su ejecución on-device con el motor Core AI.
- Accesibilidad para personas con discapacidad visual: descripción de escenas o lectura de texto en imágenes capturadas en tiempo real, con una latencia compatible con uso interactivo (98,0 tokens/s en iPhone 18 Pro).
- Traducción de texto en imágenes entre inglés y chino: el modelo puede extraer y traducir contenido textual de capturas o fotografías, aprovechando su soporte bilingüe.
- Clasificación y etiquetado de imágenes en aplicaciones móviles: integración en apps iOS que necesiten categorizar fotos o extraer información estructurada sin conexión a red.
- Procesamiento de documentos escaneados: lectura de recibos, formularios o tarjetas de visita para extraer campos de texto, con la ventaja de privacidad que supone el procesamiento local.
- Prototipado de funcionalidades VLM en macOS: uso del par decodificador int8hu + torre int8lin (1.942.089.859 bytes) en Mac para validar pipelines antes de desplegar en iPhone, con la torre fp16 disponible para casos que requieran mayor fidelidad numérica.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Throughput de decodificación | 98,0 tokens/s | iPhone 18 Pro, iOS 27.2, decodificador int8, medido el 2026-10-13 |
| Fidelidad de la torre fp16 | coseno por token mínimo 0,999957 | Respecto a la torre fp32 |
| Diferencia de la cabeza desacoplada | max abs 4,9e-4 | Respecto al embedding |
| Desplazamiento de logits usando embedding como cabeza | hasta 0,196 | Reordena el top-5 en 2 de 48 posiciones |
| Conteo de operaciones de los grafos | 3.326 / 1.967 / 1.613 | Decodificador / torre int8lin / torre fp16 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento estimado: el par recomendado (decodificador int8hu + torre int8lin) ocupa 1.942.089.859 bytes; la carpeta del decodificador pesa 1.328.120.899 bytes y la torre int8lin 613.968.960 bytes. La torre fp16 añade 474 MB adicionales (1.087.750.729 bytes).
- GPU recomendadas: el modelo está diseñado para el motor Core AI de Apple, por lo que el hardware objetivo son los chips Apple (iPhone 18 Pro verificado con iOS 27.2, y Mac para las pruebas end-to-end). No se especifican GPU NVIDIA en la información disponible.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; el modelo se ejecuta en hardware Apple mediante Core AI, no mediante CUDA.
- Opciones de despliegue: motor Core AI con grafos `.aimodel`; el decodificador se ejecuta sobre el motor GPU pipelined de Core AI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 98,0 tokens/s en iPhone 18 Pro con decodificador int8, medido el 2026-10-13. No se proporcionan datos de latencia de prefill ni de throughput en Mac.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-CoreAI (este) | no disponible | no disponible | `.aimodel` (Core AI) | Apache-2.0 | Hugging Face, 17 descargas |
| MiniCPM-V-4.7-1B (openbmb) | no disponible | no disponible | safetensors (presumiblemente) | Apache-2.0 | Hugging Face (modelo base) |
| MiniCPM-V-4.6 | no disponible | no disponible | no disponible | no disponible | Referenciado en el model zoo de Core AI |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; como todo VLM, puede generar descripciones incorrectas de imágenes ambiguas o de baja calidad.
- Limitaciones de contexto: la longitud de contexto no está documentada; las imágenes se limitan a 448×448 y se comprimen a 64 tokens, lo que puede perder detalle en imágenes con texto pequeño.
- Limitaciones de idioma: solo inglés y chino; no hay soporte declarado de castellano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el paquete distribuido son grafos `.aimodel` derivados del modelo base; conviene verificar las condiciones del modelo original de OpenBMB.
- El modelo se ejecuta con thinking desactivado en este port; las respuestas no incluyen razonamiento explícito.
- Dependencia de hardware Apple y del motor Core AI: no es desplegable en infraestructura NVIDIA ni en entornos sin Core AI.
- El paquete no incluye assets AOT; los números de iPhone corresponden a la especialización del propio dispositivo, por lo que el rendimiento puede variar en otros modelos de iPhone.
- La conversión usa coreai-torch 0.4.1 y coreai-core 1.0.0b2, versiones beta que pueden cambiar.
- El modelo tiene 17 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.

## Enlaces

- [Hugging Face: mlboydaisuke/MiniCPM-V-4.7-1B-CoreAI](https://huggingface.co/mlboydaisuke/MiniCPM-V-4.7-1B-CoreAI)
- [Modelo base: openbmb/MiniCPM-V-4.7-1B](https://huggingface.co/openbmb/MiniCPM-V-4.7-1B/tree/984a89aafcd5160164f4f0d04b4be0f4eec03cb8)
- [Core AI model zoo: conversion/minicpmv47](https://github.com/john-rocky/coreai-model-zoo/tree/main/conversion/minicpmv47)
- [Gate de rendimiento en iPhone](https://github.com/john-rocky/coreai-model-zoo/blob/main/models/minicpm-v-4.7-1b/gate-minicpm-v-4.7-1b-iphone.json)
- [MiniCPM-V-4.6 en el model zoo](https://github.com/john-rocky/coreai-model-zoo/blob/main/models/minicpm-v-4.6/README.md)
- [Script de eliminación de información de depuración](https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/d1_omni/strip_ship.py)
- [Parche de entradas estáticas para Core AI pipelined](https://github.com/john-rocky/coreai-model-zoo/blob/main/apps/coreai-pipelined-static-inputs.patch)
