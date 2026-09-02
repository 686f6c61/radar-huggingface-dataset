# runanywhere/Kokoro-82M_ANE

## Resumen

Kokoro-82M_ANE es una conversión del modelo de síntesis de voz open-weight Kokoro-82M, adaptado para ejecutarse en el Apple Neural Engine (ANE) y empaquetado como un bundle NeuRT. Lo publica runanywhere y se sirve a través del SDK RunAnywhere mediante la primitiva `SYNTHESIZE` (`tts_ops`) en iOS y macOS. El modelo original, desarrollado por hexgrad, cuenta con 82 millones de parámetros y ofrece una calidad comparable a la de sistemas TTS mucho más grandes, pero con una latencia y un coste computacional significativamente menores.

Esta variante para ANE divide la inferencia en tres grafos estáticos (`duration`, `decode` y `gen`) que el acelerador neuronal puede ejecutar con formas fijas. Dos pasos del pipeline no son expresables como operaciones ANE y se ejecutan en el host: la expansión de alineación de duraciones y el generador de fuente armónica. El bundle incluye un léxico G2P de 178 000 entradas y un vocabulario de 114 fonemas, lo que elimina la dependencia de un `phonemizer` Python en tiempo de ejecución. Se ha medido en un M4 Max con una distancia mel de 0.2832 a 0.3159 sobre cinco frases de referencia, y una velocidad de 14 a 26 veces el tiempo real.

La licencia es Apache 2.0, el repositorio ocupa 0.3 GB y el pipeline declarado es text-to-speech. Está pensado para desarrolladores que necesitan síntesis de voz offline y de baja latencia dentro del ecosistema Apple, sin depender de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la información; modelo base Kokoro-82M (TTS open-weight de 82M parámetros) con tres grafos ANE: duration, decode y gen |
| Parametros totales | 82 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no contexto de texto) |
| Tipos de cuantizacion | fp16 en salida, fp32 en entrada (según la model card) |
| Idiomas soportados | No disponibles en esta variante; el modelo base soporta varios idiomas, pero este bundle no los especifica |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML / NeuRT bundle (archivos .mlmodelc o similar) |

## Arquitectura y entrenamiento

La arquitectura interna de Kokoro-82M no se detalla en la información proporcionada, pero se trata de un modelo de síntesis de voz de 82 millones de parámetros, entrenado por hexgrad y publicado como open-weight. En esta conversión para Apple Neural Engine, la inferencia se divide en tres grafos estáticos con formas fijas (96 fonemas y 216 frames): `duration` convierte fonemas y estilo en duraciones por fonema, `decode` produce un espectrograma mel a partir de características alineadas, y `gen` sintetiza la forma de onda combinando el mel con una fuente armónica. Dos etapas no son expresables como operaciones ANE y se ejecutan en el host: la expansión de duración a alineación y el generador de fuente armónica.

El bundle incluye un léxico G2P de 178 000 entradas y un vocabulario de 114 fonemas, lo que permite la conversión de grafemas a fonemas sin necesidad de un `phonemizer` Python en tiempo de ejecución. La model card advierte sobre una trampa en el tramo armónico: el acumulador de fase debe usar `x - floor(x)` en lugar de `fmod(x, 1)`, ya que la F0 puede tomar valores negativos y un uso incorrecto de `fmod` produce audio que suena plausible pero está desfasado 2π en cada frame de F0 negativa. También se indica que el modelo declara entrada float32 y salida float16, y que escribir fp16 en buffers fp32 funciona correctamente con una correlación de 0.0035 respecto a la referencia.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) con una sola voz incluida: `af_heart`.
- Frecuencia de muestreo de salida de 24 kHz.
- Ejecución optimizada para Apple Neural Engine, sin necesidad de GPU externa.
- Conversión grafema-fonema integrada mediante léxico G2P, sin dependencia de phonemizers Python.
- Compatible con el SDK RunAnywhere (versión ≥ 0.20.33) a través de la primitiva `SYNTHESIZE`.
- Velocidad de inferencia entre 14 y 26 veces el tiempo real en un M4 Max.
- No requiere conexión a internet; funciona completamente offline en dispositivos Apple.

## Casos de uso

- Asistentes de voz en aplicaciones iOS y macOS: el modelo puede generar respuestas habladas en tiempo real sin latencia de red, gracias a su ejecución en el Neural Engine y a su velocidad de 14-26× realtime.
- Accesibilidad y lectura de pantalla: integrable en apps de accesibilidad para convertir texto de la interfaz en audio de forma local, protegiendo la privacidad del usuario al no enviar datos a servidores.
- Narración de audiolibros o podcasts: con la voz `af_heart` se puede generar narración de larga duración de forma eficiente, aunque el bundle actual solo incluye una voz.
- Prototipado rápido de experiencias de voz: desarrolladores que usan el SDK RunAnywhere pueden integrar síntesis de voz en pocas líneas de código Swift, como muestra el ejemplo `let audio = try await RunAnywhere.tts.synthesize("Hello from the Neural Engine")`.
- Aplicaciones de accesibilidad para personas con discapacidad visual: lectura de documentos, mensajes o notificaciones en dispositivos Apple sin depender de servicios en la nube.
- Sistemas de kiosco o señalización digital en dispositivos Apple: generación de mensajes hablados en puntos de información o terminales de autoservicio con requisitos estrictos de privacidad y baja latencia.

## Benchmarks y rendimiento

La model card proporciona mediciones realizadas en un M4 Max con cinco frases de referencia. La distancia mel (menor es mejor) para el bundle completo es de 0.2832 a 0.3159, con velocidad de 14 a 26 veces el tiempo real, sin NaNs y con duraciones exactas. También se incluyen resultados de calibración sobre la misma métrica y audio:

| Metrica | Valor |
|---|---|
| Distancia mel del bundle (5 frases) | 0.2832 – 0.3159 |
| Velocidad | 14 – 26× realtime |
| fp16 round-trip | 0.0012 |
| One-sample shift | 0.0025 |
| Amplitud ×1.02 | 0.0178 |
| CustomSTFT (operación real de Kokoro) | 0.289 |
| Dos utterances diferentes | 2.63 – 2.71 |
| Tolerancia | 0.60 |

Estos valores sitúan la conversión en el mismo nivel que la implementación original de Kokoro (su propia operación `CustomSTFT`), aproximadamente 9 veces por debajo de la distancia entre dos utterances distintos, lo que indica que la pérdida por conversión es mínima en comparación con el techo del vocoder. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- Dispositivos Apple con Neural Engine: la conversión está diseñada para ejecutarse en el ANE de chips Apple Silicon (M1 o posterior). Se ha probado en un M4 Max.
- No requiere GPU externa ni VRAM dedicada; utiliza la memoria unificada del dispositivo.
- El bundle ocupa 0.3 GB en disco, lo que permite su inclusión en aplicaciones móviles sin un impacto significativo en el tamaño final.
- Despliegue exclusivo a través del SDK RunAnywhere (versión ≥ 0.20.33). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia esperada: la velocidad de 14-26× realtime implica que una frase de 5 segundos se sintetiza en 0.2-0.4 segundos en un M4 Max. En dispositivos más antiguos la latencia puede ser mayor, aunque el diseño estático de los grafos favorece un rendimiento consistente.

## Comparativa con modelos similares

La información disponible no incluye benchmarks comparativos con otros modelos TTS. No obstante, se puede comparar estructuralmente con otras variantes de Kokoro-82M:

| Modelo | Parametros | Contexto | Formato | Voces | Licencia |
|---|---|---|---|---|---|
| runanywhere/Kokoro-82M_ANE | 82M | No aplica | Core ML / NeuRT | 1 (`af_heart`) | Apache 2.0 |
| hexgrad/Kokoro-82M (original) | 82M | No aplica | PyTorch / safetensors | 54 | Apache 2.0 |
| txgsync/kokoro-82m-coreml-ane | 82M | No aplica | Core ML | 54 | Apache 2.0 |

La variante de txgsync incluye las 54 voces estándar de Kokoro, mientras que la de runanywhere solo trae una, pero ambas están optimizadas para ANE. El modelo original de hexgrad es la referencia en PyTorch y permite ejecución en cualquier entorno con Python. No se dispone de datos de rendimiento comparativo entre estas tres opciones.

## Limitaciones y advertencias

- El bundle incluye una única voz (`af_heart`); no es posible seleccionar otras voces sin modificar el modelo o usar una variante diferente.
- La ejecución está restringida al ecosistema Apple (iOS/macOS) y requiere el SDK RunAnywhere, lo que limita su uso en otras plataformas.
- No se especifican los idiomas soportados en esta variante; el modelo base de Kokoro soporta varios, pero esta conversión no documenta cuáles están disponibles.
- La model card advierte sobre una trampa en el generador armónico: si se usa `fmod` en lugar de `x - floor(x)` en el acumulador de fase, se produce audio que suena fluido pero está desfasado 2π en frames de F0 negativa. Esto solo afecta a implementaciones que reescriban el código, no al bundle precompilado.
- Al ser un modelo TTS, existe riesgo de alucinación fonética en palabras desconocidas o fuera del léxico G2P, aunque el vocabulario de 114 fonemas y el léxico de 178 000 entradas cubren la mayoría de los casos.
- La licencia Apache 2.0 permite uso comercial, pero el SDK RunAnywhere puede tener sus propios términos de uso que el desarrollador debe revisar.
- No se proporcionan datos sobre sesgos de género, acentos o dialectos; la voz `af_heart` es una voz femenina de habla inglesa, y su uso en otros idiomas puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/runanywhere/Kokoro-82M_ANE
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio oficial de Kokoro: https://github.com/hexgrad/kokoro
- Variante Core ML con 54 voces: https://huggingface.co/txgsync/kokoro-82m-coreml-ane
- Ficha del modelo en OpenVox AI: https://openvoxai.com/models/kokoro-82m
