# crozierm/eyes-and-ears-pocket-18m

## Resumen

`crozierm/eyes-and-ears-pocket-18m` es una redistribución del modelo de síntesis de voz Pocket TTS de Kyutai, en su variante `english_18m_2026-10` (pocket-tts 4.0.0), convertida a Core ML por FluidInference y reempaquetada por el autor `crozierm` para su uso en la aplicación iOS "Eyes & Ears". No se trata de un modelo de lenguaje generativo ni de un transformer de texto: es un sistema TTS (text-to-speech) de muy pequeño tamaño, con 18 millones de parámetros, pensado para inferencia local en dispositivos Apple.

El modelo base es `kyutai/pocket-tts`, un TTS compacto de Kyutai. La versión aquí publicada incluye únicamente los ficheros que carga el runtime de la app, lo que explica el tamaño reducido del repositorio (0,2 GB). La conversión a Core ML permite ejecutarlo de forma nativa en iOS y macOS mediante el framework Core ML de Apple, sin dependencias de Python ni de GPUs de servidor.

Su relevancia radica en el despliegue en el borde (edge): un TTS de 18M de parámetros en formato Core ML permite síntesis de voz offline en iPhone o iPad con latencia baja y sin enviar texto a un servidor. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada; esta ficha refleja exclusivamente lo que consta en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; conversión a Core ML) |
| Parametros totales | 18M (según nombre del modelo, `18m`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos Core ML; cuantización concreta no especificada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 (pesos, © Kyutai); conversión © FluidInference (Apache-2.0) |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodelc`, librería `coreml`) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | kyutai/pocket-tts (variante `english_18m_2026-10`, pocket-tts 4.0.0) |
| Version de conversion | FluidInference/pocket-tts-coreml @ `b51c485`, ruta `v4/english_18m_2026-10/` |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `kyutai/pocket-tts`. Por el nombre y el tamaño (18M de parámetros) se trata de un sistema TTS compacto, diseñado para inferencia en dispositivo. La model card no describe la topología (si es un modelo acústico, un vocoder, o una combinación), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO u otras etapas de ajuste.

Lo que sí consta es el proceso de conversión: FluidInference convirtió los pesos originales de Kyutai a Core ML (commit `b51c485`, directorio `v4/english_18m_2026-10/`), y `crozierm` rehospedó únicamente los ficheros que carga el runtime de la app Eyes & Ears. No hay información sobre optimizaciones específicas de Core ML (cuantización de pesos, fusión de operaciones, uso de Neural Engine) más allá de que el formato es Core ML.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés.
- Ejecución local en dispositivos Apple mediante Core ML (iOS/macOS).
- Modelo de muy bajo número de parámetros (18M), adecuado para entornos con recursos limitados.
- Idioma: únicamente inglés.
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking".
- No es un modelo de generación de texto: no debe usarse para completar texto, responder preguntas ni generar código.

## Casos de uso

- Lectura de textos en voz alta en apps iOS: integrado en la app Eyes & Ears, el modelo convierte texto en audio localmente, sin conexión a red, lo que preserva la privacidad del contenido leído.
- Accesibilidad para personas con discapacidad visual: narración de contenido textual en el dispositivo con latencia baja, aprovechando el tamaño reducido del modelo (18M) para funcionar en iPhone/iPad sin servidor.
- Asistentes de voz offline: un pipeline de ASR + LLM local + este TTS permite conversaciones habladas completamente en el dispositivo, sin enviar audio ni texto a la nube.
- Audiolibros y podcasts generados en el dispositivo: síntesis de fragmentos de texto largos por lotes, con la ventaja de que el modelo cabe holgadamente en memoria y no requiere GPU dedicada.
- Prototipado de interfaces de voz en macOS: uso del paquete Core ML en apps de escritorio para validar experiencias de voz antes de integrar un TTS de mayor calidad.
- Aplicaciones educativas de idiomas (inglés): reproducción de frases y vocabulario en inglés con un TTS ligero que no depende de servicios externos.
- Pruebas de integración de TTS en pipelines de CI para apps Apple: al ser Core ML, se puede validar la inferencia en simuladores y dispositivos reales dentro del flujo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; al ser Core ML, el modelo se ejecuta en la memoria unificada del dispositivo Apple. Con 18M de parámetros y un repositorio de 0,2 GB, la huella es muy reducida (del orden de cientos de MB incluyendo el runtime y los ficheros auxiliares).
- GPU recomendadas: no requiere GPU dedicada; está pensado para CPU y Neural Engine de chips Apple (A-series y M-series).
- Cabe en GPU de consumo: sí, en el sentido de que cabe en cualquier iPhone/iPad/Mac reciente; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: Core ML (framework nativo de Apple). No consta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS en formato Core ML.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| crozierm/eyes-and-ears-pocket-18m | 18M | inglés | Core ML | CC-BY-4.0 | Redistribución para app iOS; sin benchmarks publicados |
| kyutai/pocket-tts (base) | 18M (variante) | inglés | no disponible | no disponible | Modelo original de Kyutai; esta ficha no dispone de sus specs completas |
| FluidInference/pocket-tts-coreml | 18M (variante) | inglés | Core ML | Apache-2.0 (conversión) | Conversión original de la que deriva este repositorio |

No se dispone de datos de benchmarks ni de especificaciones suficientes de los modelos comparables para establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Es un modelo TTS, no un modelo de lenguaje: no genera texto, no razona y no responde preguntas.
- No se han publicado benchmarks de calidad de síntesis (naturalidad, MOS, inteligibilidad) en la información disponible.
- Riesgo de pronunciación incorrecta en nombres propios, siglas, números y texto no inglés, habitual en TTS pequeños; no cuantificado por el autor.
- La licencia CC-BY-4.0 permite uso comercial con atribución a Kyutai; la conversión está bajo Apache-2.0 según la model card. Es necesario conservar la atribución correspondiente.
- El repositorio contiene solo los ficheros que carga el runtime de una app concreta; puede no ser directamente utilizable fuera de ese contexto sin los ficheros adicionales del paquete original de FluidInference.
- Sin información sobre sesgos, robustez ante entradas adversarias ni comportamiento en textos muy largos.
- Fecha de creación y actualización del repositorio: 2026-10-30; sin descargas ni likes, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/crozierm/eyes-and-ears-pocket-18m
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Conversión Core ML de referencia: https://huggingface.co/FluidInference/pocket-tts-coreml (commit `b51c485`, ruta `v4/english_18m_2026-10/`)
