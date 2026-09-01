# avraham123/tale-me-chatterbox-v3-browser

## Resumen

El modelo `avraham123/tale-me-chatterbox-v3-browser` es una conversión al formato ONNX del sistema de síntesis de voz (text-to-speech) `ResembleAI/chatterbox` Multilingual V3, optimizada para su ejecución local en navegadores mediante Transformers.js y WebGPU. El modelo original, desarrollado por Resemble AI, es un TTS de código abierto con 0.5 mil millones de parámetros, licencia MIT, que ofrece clonación de voz zero-shot a partir de pocos segundos de audio, control de emociones y generación en tiempo real. Esta variante para navegador está diseñada específicamente para la aplicación Tale Me, permitiendo síntesis de voz completamente local sin necesidad de servidores externos ni subida de muestras de voz del usuario.

La conversión incluye pesos cuantizados en INT4 (con cómputo en FP16) para el modelo de lenguaje, embeddings en FP32 y un decodificador condicional que reproduce fielmente el comportamiento del checkpoint oficial. Se ha verificado la paridad de resultados con el modelo original mediante pruebas de precisión numérica y de tokenización. El modelo está pensado para ejecutarse en navegadores de escritorio modernos con soporte WebGPU, descargando los archivos directamente en la caché del navegador. Aunque el idioma principal declarado es el hebreo, el modelo es multilingüe y cubre una amplia gama de lenguas, tal como el Chatterbox V3 original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (T3) con decodificador condicional (S3Gen) y vocoder integrado; incluye watermarker independiente |
| Parametros totales | 0.5 mil millones (según el modelo base ResembleAI/chatterbox) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de síntesis de voz, no aplica contexto de texto largo) |
| Tipos de cuantizacion | language_model_q4f16: INT4 simétrico block-32 con cómputo FP16; embeddings y logits en FP32 |
| Idiomas soportados | hebreo (he) y multilingüe (amplia cobertura según el modelo V3 original) |
| Licencia | MIT (incluye licencia independiente para el watermarker Perth) |
| Formato de pesos | ONNX (con archivos safetensors para el embedding y el speaker) |

## Arquitectura y entrenamiento

El modelo base `ResembleAI/chatterbox` V3 emplea una arquitectura de transformer (denominada T3) para el modelado del lenguaje de texto y audio, junto con un decodificador condicional (S3Gen) que combina un flujo generativo y un vocoder para producir la forma de onda final. El modelo original tiene 0.5B parámetros y fue entrenado con datos multilingües para lograr una cobertura amplia de idiomas, mejorando la similitud del hablante, reduciendo alucinaciones y generando voz más natural y conversacional en comparación con versiones anteriores.

Esta conversión específica para navegador mantiene la arquitectura original pero adapta los pesos a formato ONNX. Los embeddings de texto/habla/posición/emoción se conservan en FP32, mientras que el transformer principal y la cabeza de habla se cuantizan a INT4 con bloques de 32 y cómputo en FP16. El decodificador condicional se exporta directamente desde los pesos oficiales `s3gen.pt`. Además, se incluye un watermarker independiente (Perth) que se aplica a todas las formas de onda de 24 kHz generadas, cumpliendo con los requisitos de marca de agua de Resemble AI. No se dispone de información detallada sobre el dataset de entrenamiento original ni sobre el proceso de ajuste (RLHF, DPO, etc.).

## Capacidades

- Síntesis de voz texto a voz en tiempo real, con generación local en navegador.
- Clonación de voz zero-shot: puede imitar una voz a partir de una muestra breve (5 segundos), aunque en esta versión para navegador se usa una voz predeterminada integrada.
- Control de emociones: el modelo puede generar habla con diferentes emociones mediante vectores de exageración proporcionados por el embedding.
- Soporte multilingüe: cubre múltiples idiomas, con énfasis en hebreo, pero no limitado a él.
- Funciona completamente en el navegador mediante WebGPU, sin necesidad de servidor.
- Incluye watermarking automático de audio (Perth) para trazabilidad.
- Compatible con Transformers.js 4.2.0 y ONNX Runtime 1.26 en runtime de navegador.

## Casos de uso

- Aplicaciones web de audiolibros: generar narración de texto en hebreo u otros idiomas directamente en el navegador, sin depender de servicios externos, reduciendo costes y latencia.
- Accesibilidad para personas con discapacidad visual: convertir contenido web en voz en tiempo real, aprovechando el procesamiento local para preservar la privacidad.
- Asistentes virtuales embebidos en páginas: dar respuesta hablada a consultas del usuario sin necesidad de enviar datos a un servidor, ideal para aplicaciones sensibles a la privacidad.
- Herramientas de aprendizaje de idiomas: pronunciar palabras o frases en hebreo u otros idiomas con control de emoción, ayudando a estudiantes a mejorar su entonación.
- Doblaje y postproducción de vídeo: generar voces sintéticas con la voz predeterminada para proyectos de bajo presupuesto, directamente en una herramienta web.
- Prototipado rápido de interfaces de voz: integrar síntesis de voz en aplicaciones de demostración sin configurar infraestructura de backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MOS, WER, etc.) en la información disponible. La model card incluye verificaciones técnicas de la conversión, como paridad FP32 exacta para embeddings, prueba de humo con ONNX Runtime 1.26 (62 entradas, 61 salidas), y un error máximo absoluto de 1.31e-05 en la comparación PyTorch vs ONNX para el watermarker. Sin embargo, no hay métricas de calidad de voz comparativas con otros modelos TTS.

## Requisitos de hardware

- Navegador de escritorio moderno con soporte WebGPU (Chrome, Edge, Firefox, Safari recientes).
- Se requiere memoria RAM suficiente para cargar el modelo (tamaño del repo: 0.9 GB; los pesos cuantizados INT4 ocupan aproximadamente 0.25-0.5 GB en memoria, más overhead de runtime).
- GPU con soporte WebGPU: cualquier GPU integrada o dedicada reciente debería funcionar, aunque una GPU dedicada mejorará la latencia.
- No se requiere GPU de servidor; el modelo está diseñado para consumo en cliente.
- Despliegue: se integra con Transformers.js 4.2.0 y ONNX Runtime 1.26 en el navegador; los archivos se descargan a la caché del navegador.
- La latencia depende de la GPU y del hardware; no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos TTS en la información proporcionada. Sin embargo, el modelo base Chatterbox V3 se posiciona como un TTS de código abierto con 0.5B parámetros, licencia MIT y capacidades de clonación de voz y control de emociones. Otros modelos TTS open source como Coqui TTS, Piper o Tortoise TTS tienen características similares, pero no se han encontrado datos comparativos publicados para esta conversión específica.

## Limitaciones y advertencias

- Requiere WebGPU: no funciona en navegadores antiguos o sin soporte WebGPU.
- El modelo está diseñado para la aplicación Tale Me y puede no ser compatible con otras integraciones sin adaptación del runtime Transformers.js.
- Solo se incluye una voz predeterminada (la del `default_speaker.safetensors`); no se permite la clonación de voz del usuario en esta versión.
- El idioma principal es hebreo; aunque es multilingüe, la calidad en otros idiomas puede variar.
- El watermarker se aplica a todas las salidas, lo que puede afectar la pureza del audio en algunos casos.
- El tamaño del modelo (0.9 GB) puede ser elevado para dispositivos con poca memoria o almacenamiento.
- La cuantización INT4 puede introducir ligeras pérdidas de calidad en comparación con los pesos FP32 originales, aunque la verificación muestra alta fidelidad.
- No se han publicado benchmarks de calidad de voz ni pruebas exhaustivas de rendimiento en diferentes navegadores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/avraham123/tale-me-chatterbox-v3-browser
- Repositorio oficial de Chatterbox (GitHub): https://github.com/resemble-ai/chatterbox
- Página de Resemble AI sobre Chatterbox: https://www.resemble.ai/learn/models/chatterbox
- Sitio web de Chatterbox AI (clonación de voz): https://chatterboxai.net/
