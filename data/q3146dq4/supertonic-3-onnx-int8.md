# q3146dq4/Supertonic-3-ONNX-INT8

## Resumen

Supertonic-3-ONNX-INT8 es una versión cuantizada a int8 dinámico del modelo de síntesis de voz Supertonic 3, desarrollado por Supertone, Inc. Se distribuye como un artefacto ONNX listo para inferencia en CPU, sin necesidad de GPU ni conexión a la nube. El modelo original, de aproximadamente 99 millones de parámetros, emplea un pipeline no autorregresivo de flow-matching compuesto por cuatro grafos: predictor de duración, codificador de texto, estimador de vectores (repetido N veces) y vocoder. Esta variante cuantizada reduce el peso de los grafos de 398 MB a 102 MB y la memoria pico de inferencia de ~1026 MB a ~327 MB, manteniendo un factor de tiempo real (RTF) cercano a 0.20 en Apple Silicon con 8 pasos de estimación.

La relevancia de este modelo radica en su capacidad para ejecutar síntesis de voz multilingüe de alta calidad (31 idiomas, 44.1 kHz) en dispositivos con recursos limitados, como teléfonos móviles, Raspberry Pi o portátiles de gama baja. Al ser una cuantización dinámica, no requiere calibración previa y conserva la compatibilidad con el paquete `supertonic` de Python, lo que facilita su integración en aplicaciones existentes. Además, el front-end de texto no depende de fonemizadores externos (G2P-free), simplificando el despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline no autorregresivo de flow-matching: duration_predictor → text_encoder → vector_estimator ×N → vocoder |
| Parametros totales | ~99 millones (modelo original) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de síntesis de voz, no de texto) |
| Tipos de cuantizacion | int8 dinámico (QInt8) con activaciones en fp32 |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | BigScience OpenRAIL-M (con restricciones de uso) |
| Formato de pesos | ONNX (4 grafos: duration_predictor.onnx, text_encoder.onnx, vector_estimator.onnx, vocoder.onnx) |

## Arquitectura y entrenamiento

El modelo base Supertonic 3 emplea un diseño no autorregresivo basado en flow-matching, donde el texto se procesa mediante un codificador y un predictor de duración para generar representaciones intermedias, que luego son refinadas por un estimador de vectores en múltiples pasos antes de pasar al vocoder para producir audio de 44.1 kHz. Esta arquitectura evita la generación token a token, lo que reduce la latencia y permite ejecución en CPU.

La versión cuantizada aquí descrita aplica `quantize_dynamic` de ONNX Runtime, convirtiendo los pesos de los cuatro grafos a int8 mientras mantiene las activaciones en fp32. No se realizó calibración con datos de validación, por lo que la degradación de calidad es mínima en la mayoría de los casos. El front-end de texto utiliza normalización NFKD y una tabla `unicode_indexer.json` para mapear caracteres a índices, eliminando la dependencia de espeak u otros fonemizadores. Los datos de entrenamiento del modelo original no se detallan en la información disponible, pero el paper asociado (arXiv:2503.23108) describe el proceso de entrenamiento.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluyendo español, inglés, coreano, japonés, árabe, hindi y la mayoría de lenguas europeas.
- Generación de audio a 44.1 kHz con 16 bits, adecuado para aplicaciones de producción.
- Inferencia completamente local en CPU, sin necesidad de GPU, conexión a internet ni API externa.
- Incluye 10 voces predefinidas en archivos JSON (`voice_styles/*.json`).
- Compatible con el paquete `supertonic` de Python como reemplazo directo del modelo original, o mediante ejecución directa de los grafos ONNX con ONNX Runtime.
- Front-end de texto sin fonemizador (G2P-free), lo que simplifica el despliegue y reduce dependencias.
- Cuantización int8 que reduce el peso y la memoria, manteniendo un RTF cercano a 0.20 en Apple Silicon.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: el modelo puede ejecutarse en una Raspberry Pi o un teléfono Android de gama media para generar respuestas habladas sin depender de servicios en la nube, gracias a su bajo consumo de memoria (~327 MB) y su ejecución en CPU.
- Audiolibros y lectura de textos largos: su soporte de 31 idiomas y salida de 44.1 kHz permite convertir libros electrónicos o artículos a audio de alta calidad, con la ventaja de que todo el procesamiento ocurre localmente, preservando la privacidad del contenido.
- Accesibilidad para personas con discapacidad visual: integración en aplicaciones de lectura de pantalla que necesitan síntesis de voz en tiempo real, con latencia baja y sin requisitos de hardware especializado.
- Traducción y aprendizaje de idiomas: al soportar múltiples idiomas, puede utilizarse para generar pronunciación de frases en el idioma objetivo, ayudando en aplicaciones educativas o de práctica de conversación.
- Sistemas de respuesta de voz interactiva (IVR) en entornos con conectividad limitada: empresas que necesitan menús telefónicos automatizados pueden desplegar el modelo en servidores locales de bajo coste, evitando costes de API y garantizando disponibilidad.
- Generación de contenido multimedia en producción: creadores de vídeo o podcasts pueden usar el modelo para narrar guiones en varios idiomas, con la ventaja de que la cuantización int8 reduce el tiempo de descarga y el espacio en disco, facilitando su uso en pipelines de edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU o HumanEval) para este modelo, al tratarse de un sistema de síntesis de voz. Los datos de rendimiento disponibles se centran en métricas de eficiencia y se resumen a continuación:

| Metrica | Valor |
|---|---|
| Peso de los grafos ONNX | 102 MB (frente a 398 MB del modelo original) |
| Memoria pico de inferencia (RSS) | ~327 MB (frente a ~1026 MB del original, medido en Apple Silicon con ORT CPU) |
| Factor de tiempo real (RTF) | ~0.20 con 8 pasos de estimación en Apple Silicon |
| Idiomas verificados en roundtrip | Inglés, alemán, coreano |

La cuantización int8 no degrada significativamente la calidad en los idiomas probados, y la ventaja de velocidad se hace más notable en CPUs ARM débiles o NPUs, donde la inferencia con pesos int8 es más rápida que con fp32.

## Requisitos de hardware

- No requiere GPU: el modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime.
- Memoria RAM mínima: ~327 MB de memoria pico durante la inferencia, medido en Apple Silicon; en dispositivos con menos RAM puede ser necesario ajustar el número de pasos del estimador.
- CPU recomendada: cualquier procesador ARM (Apple Silicon, Qualcomm Snapdragon) o x86 moderno. En CPUs ARM débiles, la cuantización int8 ofrece mayor velocidad que fp32.
- Opciones de despliegue: ONNX Runtime (C++ o Python), paquete `supertonic` de PyPI, o integración directa de los grafos ONNX en aplicaciones personalizadas.
- Latencia: RTF ~0.20 en Apple Silicon con 8 pasos, lo que significa que genera 1 segundo de audio en aproximadamente 0.2 segundos de cómputo.
- Almacenamiento: 102 MB para los pesos, más los archivos de configuración y voces.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Supertonic-3-ONNX-INT8 (este) | ~99M | 31 | ONNX int8 | OpenRAIL-M | Cuantizado, CPU-only, 44.1 kHz |
| Supertonic-3 (original) | ~99M | 31 | ONNX fp32 | OpenRAIL-M | Peso 398 MB, memoria ~1 GB |
| Kokoro-82M | 82M | ~8 | ONNX | Apache 2.0 | TTS ligero, pero con menos idiomas |
| VoxCPM2 | no disponible | no disponible | ONNX | no disponible | TTS de la misma colección, sin datos públicos |

No se dispone de comparativas numéricas de calidad de voz entre estos modelos en la información proporcionada. La ventaja principal de la versión int8 es su menor huella de memoria y peso, manteniendo la misma arquitectura y capacidades que el modelo original.

## Limitaciones y advertencias

- La cuantización int8 puede introducir una ligera degradación en la calidad de voz en comparación con el modelo fp32, especialmente en idiomas o voces no verificados en el roundtrip (solo se probaron inglés, alemán y coreano).
- El modelo tiene dificultades con el formateo de números complejos y monedas, según la guía de Better Stack; se recomienda normalizar el texto de entrada antes de la síntesis.
- La licencia BigScience OpenRAIL-M impone restricciones de uso: no se permite la suplantación no consentida, la generación de deepfakes ni la difusión de contenido generado por máquina sin revelar su origen. Estas restricciones deben transmitirse a los usuarios finales.
- Al ser un artefacto cuantizado, no se garantiza la misma estabilidad numérica que el modelo original en todos los entornos; se recomienda validar en el hardware objetivo.
- El modelo no incluye soporte para control de emociones, énfasis o prosodia fina más allá de las 10 voces predefinidas.
- No se proporcionan datos sobre sesgos en las voces o en el tratamiento de acentos regionales; la cobertura de 31 idiomas puede no representar todas las variantes dialectales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q3146dq4/Supertonic-3-ONNX-INT8
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Paper técnico: https://arxiv.org/abs/2503.23108
- Sitio oficial de Supertonic 3: https://supertonic3.github.io/
- Repositorio GitHub de Supertone: https://github.com/supertone-inc/supertonic
- Guía de Better Stack: https://betterstack.com/community/guides/ai/supertonic-3/
- Paquete PyPI: https://pypi.org/project/supertonic/
- Variante LiteRT (Android): https://huggingface.co/soniqo/Supertonic-3-LiteRT
- Variante CoreML (iOS): https://huggingface.co/aufklarer/Supertonic-3-CoreML
