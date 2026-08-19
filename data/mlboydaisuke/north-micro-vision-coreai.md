# mlboydaisuke/North-Micro-Vision-CoreAI

## Resumen

North-Micro-Vision-CoreAI es una conversión del modelo vision-language North-Micro-Vision-Instruct de Cohere (2.4B parámetros) al formato Core AI de Apple, el sucesor de Core ML anunciado en la WWDC26. Desarrollado por mlboydaisuke, este modelo está diseñado para ejecutarse en dispositivos Apple con iOS 27 y macOS 27, ofreciendo inferencia on-device de alta velocidad. Resuelve el problema de ejecutar un VLM multilingüe en hardware de consumo, con una precisión que el autor afirma idéntica a la referencia fp32 en las pruebas realizadas.

La arquitectura combina un vision tower de 400M parámetros (basado en SigLIP2-SO400M y estructuralmente similar al encoder visual de Qwen3-VL) con un decoder de 2B parámetros de Cohere. El modelo soporta once idiomas, incluyendo japonés, y está licenciado bajo Apache-2.0. El repo contiene los pesos convertidos en formato Core AI, listos para usar con las herramientas de Apple.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM híbrido: vision tower (SigLIP2-SO400M custom, estilo Qwen3-VL) + decoder Cohere con atención full y sliding-window (7 capas full sin PE, 21 capas sliding con M-RoPE, ventana 4096) |
| Parametros totales | 2.4B (400M vision tower + 2B decoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención sliding de 4096 tokens) |
| Tipos de cuantizacion | fp16 (vision tower), int8 (decoder); int4 no publicado |
| Idiomas soportados | en, de, fr, es, it, pt, hi, ja, ko, zh, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI (.aimodel), convertido desde el modelo original de Cohere |

## Arquitectura y entrenamiento

El modelo es una conversión directa del VLM North-Micro-Vision-Instruct de CohereLabs, que combina un encoder visual de 400M parámetros (entrenado a medida desde SigLIP2-SO400M y con estructura de Qwen3-VL, incluyendo deepstack mergers) con un decoder de 2B parámetros de Cohere. El decoder emplea una arquitectura híbrida: 7 capas de atención completa sin positional encoding y 21 capas de atención sliding-window con M-RoPE intercalado en una ventana de 4096 tokens. Utiliza Cohere LayerNorm (con sustracción de la media y sin bias), logit_scale de 0.25 y un embedding de 262 144 entradas atado a la cabeza de salida. Los tokens de imagen se insertan como extension ids en el decoder.

El proceso de conversión a Core AI requirió parchear el motor de inferencia para vincular las salidas del vision tower (image_embeds y deepstack_embeds) y reescribir los ids de `<image>` (255031) a V + slot. El autor indica que el export hornea una cuadrícula cuadrada de 512×512, mientras que el procesador upstream es native-resolution, lo que provoca estiramiento en imágenes no cuadradas. No se proporcionan detalles sobre el entrenamiento original del modelo base, más allá de que es un finetune de CohereLabs/North-Micro-Vision-Instruct.

## Capacidades

- Generación de texto e imagen a texto (image-text-to-text).
- Razonamiento visual: responde preguntas sobre imágenes con precisión verificada (24/24 tokens idénticos a la referencia fp32 en iPhone 17 Pro).
- Soporte multilingüe en once idiomas: inglés, alemán, francés, español, italiano, portugués, hindi, japonés, coreano, chino y árabe.
- Inferencia on-device en dispositivos Apple con iOS 27 / macOS 27.
- Procesamiento de imágenes con resolución nativa en el modelo original, aunque la conversión a Core AI fuerza una cuadrícula cuadrada.

## Casos de uso

- Asistente visual en dispositivos móviles: el modelo puede ejecutarse en un iPhone 17 Pro a 18.2 tok/s, lo que permite responder preguntas sobre fotos o documentos en tiempo real sin conexión.
- Accesibilidad para personas con discapacidad visual: descripción de imágenes capturadas con la cámara del dispositivo, con soporte multilingüe para usuarios de distintas lenguas.
- Análisis de imágenes en entornos industriales: uso en tablets o Macs con Apple Silicon para inspección visual de productos, gracias a la precisión de tokens idéntica a fp32.
- Traducción y localización de contenido visual: al soportar once idiomas, puede transcribir y traducir texto en imágenes, útil para aplicaciones de viajes o educación.
- Automatización de documentos: extracción de información de imágenes de facturas o formularios, con despliegue on-device para garantizar privacidad.
- Prototipado rápido de aplicaciones de visión por computador: los desarrolladores pueden integrar el modelo en apps de iOS/macOS usando Core AI, sin necesidad de servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones de rendimiento y fidelidad propias, que se resumen a continuación:

| Medición | Entorno | Resultado |
|---|---|---|
| Velocidad de decode | M4 Max (macOS 27) | 118.6 tok/s (texto puro) |
| Velocidad de prefill | M4 Max | 145.3 tok/s |
| Velocidad de decode | iPhone 17 Pro | 18.2 tok/s |
| Velocidad de prefill | iPhone 17 Pro | 21.5 tok/s |
| Tiempo de procesamiento de imagen | M4 Max | 83.4 ms/imagen |
| Fidelidad de image_embeds | M4 Max | cos 0.999996 vs fp32 |
| Exactitud de tokens (oráculo) | iPhone 17 Pro | 24/24 tokens idénticos a fp32 |
| Exactitud de tokens (suite de casos) | M4 Max | 9/9 casos, 338/338 tokens |

## Requisitos de hardware

- Dispositivos Apple con iOS 27 o macOS 27 (Core AI incluido en el sistema operativo).
- iPhone 17 Pro: 2.5 GB de almacenamiento combinado (vision fp16 + decode int8), con 18.2 tok/s de decode.
- Mac con chip M4 Max: 3.4 GB combinados (1.0 GB vision fp16 + 2.4 GB decode int8), con 118.6 tok/s de decode en texto puro.
- No se mencionan GPUs NVIDIA ni otros fabricantes; el modelo está optimizado exclusivamente para Apple Silicon.
- Despliegue mediante `llm-runner` (Swift) y las herramientas del repositorio `coreai-model-zoo`, con parches para el motor de inferencia.
- Se requiere `transformers` git main para la conversión (la versión 5.15.0 no es compatible).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base es `CohereLabs/North-Micro-Vision-Instruct`, del cual esta conversión es una adaptación a Core AI, pero no se ofrecen datos de rendimiento de otros VLM pequeños para comparar.

## Limitaciones y advertencias

- La cuantización int4 no está publicada porque falla en todas las pruebas (0 de 9 casos), con pérdida de límites de oración, fuga de texto de instrucciones y repetición plana. Solo se recomienda int8.
- Las imágenes no cuadradas se estiran debido a que el export a Core AI fuerza una cuadrícula cuadrada de 512×512, mientras que el procesador original usa resolución nativa.
- Requiere iOS 27 / macOS 27, lo que limita su uso a dispositivos con las últimas versiones del sistema operativo.
- El modelo no está afiliado a Apple ni a Cohere; es una conversión independiente realizada por mlboydaisuke.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez en entornos adversarios.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es una publicación muy reciente y sin validación comunitaria.
- La ventana de atención sliding es de 4096 tokens, lo que puede limitar el contexto total del modelo, aunque no se especifica el contexto global.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/mlboydaisuke/North-Micro-Vision-CoreAI)
- [Modelo base: CohereLabs/North-Micro-Vision-Instruct](https://huggingface.co/CohereLabs/North-Micro-Vision-Instruct)
- [Repositorio coreai-model-zoo (código de conversión y parches)](https://github.com/john-rocky/coreai-model-zoo)
- [Referencia de preprocesado: _smoke/northmv_preprocess.py](https://github.com/john-rocky/coreai-model-zoo/blob/main/_smoke/northmv_preprocess.py)
- [Script de conversión: conversion/export_northmv_p
