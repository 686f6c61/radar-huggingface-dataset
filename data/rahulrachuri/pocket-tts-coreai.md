# rahulrachuri/pocket-tts-coreai

## Resumen

Pocket TTS para Apple Core AI es una conversión oficial del modelo de síntesis de voz Pocket TTS de Kyutai, adaptado para ejecutarse completamente en el dispositivo en iPhone y Macs con Apple Silicon mediante el framework Core AI. El modelo original, desarrollado por Kyutai Labs, es un sintetizador de texto a voz de alta calidad que cabe en CPU, con arquitectura basada en flow matching y un decodificador Mimi. Esta conversión, realizada por Rahul Rachuri, empaqueta los grafos de inferencia en bundles `.aimodel` que se integran con un host Swift, logrando un rendimiento de 7,8 veces en tiempo real en un iPhone 17 Pro Max con precisión fp16.

La relevancia de este modelo radica en que permite desplegar síntesis de voz de calidad casi indistinguible de la referencia PyTorch en hardware de consumo, sin conexión a servidores y con un consumo de memoria inferior a 200 MB. Es una opción práctica para desarrolladores de aplicaciones iOS y macOS que necesitan TTS offline, rápido y con baja huella de recursos. El repositorio no incluye los pesos del modelo, sino los bundles de inferencia; los pesos se cargan directamente desde el checkpoint original de Kyutai, que es de acceso abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching (flow-LM) + decodificador de flujo + decodificador Mimi |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz) |
| Tipos de cuantizacion | fp16 y fp32 (bundles separados) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 (los bundles heredan la licencia del modelo original) |
| Formato de pesos | safetensors (model.safetensors, tokenizer.model, embeddings) y bundles `.aimodel` (JIT) |

## Arquitectura y entrenamiento

El modelo original Pocket TTS de Kyutai emplea una arquitectura de flow matching con un decodificador de flujo y un decodificador Mimi para la generación de audio. El checkpoint base es `kyutai/pocket-tts-without-voice-cloning`, que no incluye clonación de voz en tiempo real, sino embeddings de voz predefinidos. La conversión a Core AI mantiene la misma arquitectura, pero reestructura los grafos de inferencia en cinco bundles: dos para el flow-LM (prefill y step) en fp32 y fp16, dos para el decodificador de flujo en ambas precisiones, y uno para el decodificador Mimi con el cuantizador plegado y estado de anillo en el grafo.

Los detalles del entrenamiento original (número de tokens, composición del dataset, técnicas de alineación) no se especifican en la información disponible. El blog de Kyutai indica que el modelo es significativamente más pequeño que los TTS tradicionales, lo que permite su ejecución en CPU, pero no se proporcionan cifras exactas de parámetros. La conversión fue exportada con `coreai-core` 1.0.0b2 y requiere el cargador de Xcode 27.

## Capacidades

- Síntesis de texto a voz de alta calidad, con una precisión numérica casi idéntica a la referencia PyTorch (coseno 1.000000, error máximo 4,3e-5).
- Ejecución completamente en el dispositivo en iPhone y Macs con Apple Silicon, sin conexión a servidores.
- Soporte de múltiples voces mediante embeddings predefinidos (archivos `embeddings/<voice>.safetensors`).
- Baja latencia: factor de tiempo real de 7,8× en fp16 y 6,1× en fp32 en un iPhone 17 Pro Max.
- Integración con un host Swift de código abierto (`RahulRachuri/pocket-tts-swift`) que gestiona la carga de pesos y la inferencia.
- Compatibilidad con el ecosistema Core AI de Apple, permitiendo compilación AOT para iOS.
- Precisión de transcripción ASR: 0,00% WER en el prompt de referencia, 1,38% en un párrafo de 148 palabras y 2,45% en un pasaje de 163 palabras.

## Casos de uso

- Asistentes de voz en aplicaciones iOS: el modelo puede generar respuestas habladas en tiempo real dentro de una app de asistente personal, gracias a su baja latencia (RTF 0,1281) y a que no requiere conexión de red.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que convierten texto de la interfaz en voz, funcionando offline y con consumo mínimo de memoria (169 MB en fp16).
- Audiolibros y podcasts generados localmente: una aplicación puede convertir artículos o libros en audio usando el modelo, con calidad suficiente para uso editorial y sin depender de servicios externos.
- Doblaje automático de vídeos cortos: en un Mac con Apple Silicon, el modelo puede procesar guiones y generar locuciones para vídeos de redes sociales, con tiempos de generación muy inferiores a la duración del audio.
- Mensajería con mensajes de voz personalizados: una app de mensajería puede ofrecer la opción de leer mensajes de texto en voz alta con una voz seleccionada, usando los embeddings predefinidos.
- Prototipado rápido de interfaces de voz: los desarrolladores pueden probar flujos conversacionales en simulador o dispositivo real sin necesidad de un servicio TTS en la nube, gracias a la carga rápida del modelo (0,4 s en fp16).

## Benchmarks y rendimiento

Los datos de rendimiento se midieron en un iPhone 17 Pro Max (A19 Pro) con iOS 27.0, compilación Release, cargando el modelo y ejecutando tres pasadas temporizadas sobre un párrafo de 148 palabras.

| Configuracion | RTF mediana | ×tiempo real | Pico RSS | Tiempo de carga |
|---|---:|---:|---:|---:|
| fp16 GPU | 0,1281 | 7,8× | 169 MB | 0,4 s |
| fp32 GPU | 0,1646 | 6,1× | 202 MB | 0,7 s |

Para referencia, la ruta Core ML (FluidInference/pocket-tts-coreml con FluidAudio SDK 0.15.5) mide un RTF de 0,399 (2,51× tiempo real) en el mismo teléfono. En cuanto a precisión, la salida del dispositivo GPU tiene un coseno de 1,000000 y un error máximo de 4,3e-5 frente al oráculo PyTorch fp32, con enmarcado idéntico. La transferencia por grafo bajo `cpuOnly` es bit-idéntica entre el dispositivo y un M4 Pro. No se han publicado resultados de benchmarks estándar tipo MMLU o HumanEval, al tratarse de un modelo de síntesis de voz.

## Requisitos de hardware

- Dispositivos compatibles: iPhone y Macs con Apple Silicon (probado en iPhone 17 Pro Max con A19 Pro y M4 Pro).
- Memoria: pico RSS de 169 MB en fp16 y 202 MB en fp32, por lo que cabe en cualquier dispositivo Apple con al menos 4 GB de RAM.
- GPU: utiliza la GPU integrada de Apple (no requiere GPU dedicada).
- Software: Xcode 27, `coreai-core` 1.0.0b2 o superior, y el host Swift del repositorio `RahulRachuri/pocket-tts-swift`.
- Despliegue: los bundles `.aimodel` se pueden compilar AOT para iOS; el host Swift carga los pesos desde el checkpoint original de Kyutai.
- Latencia: RTF de 0,1281 en fp16, lo que permite generar audio más rápido que en tiempo real en hardware de gama alta.

## Comparativa con modelos similares

| Modelo | Formato | RTF (iPhone 17 Pro Max) | Precisión | Licencia |
|---|---|---|---|---|
| pocket-tts-coreai (este) | Core AI (fp16) | 0,1281 (7,8×) | cos 1,0, max\|Δ\| 4,3e-5 | CC-BY-4.0 |
| pocket-tts-coreml (FluidInference) | Core ML | 0,399 (2,51×) | no especificado | CC-BY-4.0 |
| pocket-tts original (Kyutai) | PyTorch | no medido en este repo | referencia | CC-BY-4.0 |

La versión Core AI supera claramente a la ruta Core ML en rendimiento (más de 3 veces más rápida) y mantiene una precisión numérica casi perfecta frente al oráculo PyTorch. El modelo original de Kyutai es la base y no está optimizado para ejecución en Apple, por lo que esta conversión es la opción recomendada para despliegues en el ecosistema Apple.

## Limitaciones y advertencias

- Requiere hardware y software específicos de Apple: iOS 27 o macOS equivalente, Xcode 27 y el framework Core AI. No funciona en Android, Windows o Linux.
- Los pesos del modelo no están incluidos en este repositorio; es necesario descargarlos del checkpoint original de Kyutai (`kyutai/pocket-tts-without-voice-cloning`), lo que añade un paso manual al despliegue.
- La licencia CC-BY-4.0 exige atribución a Kyutai en cualquier uso, incluido el comercial. Los scripts de conversión y el host Swift son Apache-2.0, pero los bundles heredan la licencia del modelo.
- No se especifican los idiomas soportados; el modelo original de Kyutai soporta varios idiomas, pero esta conversión no documenta cuáles.
- El modelo no incluye clonación de voz en tiempo real; solo admite voces predefinidas mediante embeddings. Para clonación dinámica sería necesario otro modelo.
- Los bundles exportados con versiones anteriores de `coreai-core` son rechazados por el cargador de Xcode 27, lo que puede causar problemas de compatibilidad si se usan herramientas desactualizadas.
- No hay información sobre sesgos o alucinaciones específicas de este modelo; al ser un TTS, el riesgo principal es la generación de audio con entonación o pronunciación incorrecta en textos complejos, aunque los datos de WER sugieren buena precisión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rahulrachuri/pocket-tts-coreai
- Host Swift: https://github.com/RahulRachuri/pocket-tts-swift
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Blog de Kyutai sobre Pocket TTS: https://kyutai.org/blog/2026-01-13-pocket-tts/
- Página del proyecto Pocket TTS: https://kyutai-labs.github.io/pocket-tts/
- Repositorio GitHub de Kyutai: https://github.com/kyutai-labs/pocket-tts
- Conversión Core ML alternativa: https://huggingface.co/FluidInference/pocket-tts-coreml
- Otra conversión Core AI similar: https://huggingface.co/code-and-canvas/pocket-tts-mimi-coreai
