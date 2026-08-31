# grimshaw/supertonic-neutts

## Resumen

`grimshaw/supertonic-neutts` es un espejo público de los archivos del modelo que la aplicación iOS **Supertonic Reader** descarga para su motor de voz neuronal **NeuTTS Nano**, desarrollado por Neuphonic. El repositorio no contiene un modelo nuevo, sino una copia verificada de los pesos y artefactos necesarios para ejecutar un sistema de texto a voz (TTS) completamente en el dispositivo, sin conexión a la nube. El modelo combina un backbone basado en arquitectura transformer (en formato GGUF cuantizado Q8_0) con un decodificador de audio NeuCodec (en formato ONNX int8), lo que permite generar voz de 24 kHz a partir de texto fonético.

La relevancia actual de este modelo radica en su enfoque de despliegue local: con unos 228 millones de parámetros totales (aunque el backbone GGUF es más ligero), está diseñado para ejecutarse en CPU de dispositivos móviles y de escritorio mediante `llama.cpp` y ONNX Runtime, sin necesidad de GPU ni conexión a internet. Esto lo convierte en una opción atractiva para aplicaciones de lectura en voz alta, asistentes de voz privados y sistemas de accesibilidad que requieren latencia baja y protección de datos. El repositorio incluye también voces de referencia precodificadas y documentación del formato de prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone NeuTTS Nano) + decodificador NeuCodec |
| Parametros totales | 228.704.832 (safetensors, incluye backbone y decoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (backbone GGUF), int8 (decoder ONNX) |
| Idiomas soportados | no disponible (la model card no especifica) |
| Licencia | neutts-open-license-v1.0 (license:other) |
| Formato de pesos | GGUF (Q8_0), ONNX (int8), safetensors (referencia) |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas diferenciadas. La primera es un backbone basado en arquitectura transformer (NeuTTS Nano) que recibe texto fonético (phonemes) y códigos de referencia de voz, y genera tokens de habla (speech token IDs). Este backbone está cuantizado en Q8_0 y se ejecuta con `llama.cpp`. La segunda etapa es un decodificador NeuCodec en formato ONNX int8 que convierte esos tokens de habla en audio PCM de 24 kHz. Esta separación permite que cada componente se optimice por separado: el backbone para generación autoregresiva de tokens y el decodificador para síntesis de audio eficiente.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se han publicado en la información disponible. El modelo base declarado es `neuphonic/neutts-nano` y `neuphonic/neucodec`. La cuantización Q8_0 del backbone y la int8 del decoder son las únicas variantes distribuidas en este repositorio, pensadas para minimizar el uso de memoria y acelerar la inferencia en CPU. El formato de prompt está documentado: los tokens de habla se representan como `<|speech_0|>` (ID 128262) hasta `<|speech_65535|>` (ID 193797), y la secuencia finaliza con el token `<|SPEECH_GENERATION_END|>` (ID 128261).

## Capacidades

- Generación de voz a partir de texto fonético: el modelo convierte phonemas en tokens de habla y luego en audio PCM de 24 kHz.
- Síntesis de voz con voces de referencia: incluye un archivo `reference_voices.json` con muestras de voz (dave, emily, greta, jo) que contienen transcripciones y códigos NeuCodec precodificados.
- Inferencia completamente local: no requiere conexión a internet ni servicios en la nube; se ejecuta con `llama.cpp` y ONNX Runtime.
- Cuantización ligera: el backbone en Q8_0 y el decoder en int8 permiten ejecución en CPU de dispositivos móviles y de escritorio.
- Compatibilidad con el ecosistema GGUF: el backbone puede cargarse con herramientas estándar de `llama.cpp`.
- Despliegue en dispositivos Apple: el repositorio es un mirror de los archivos utilizados por la app Supertonic Reader para iOS, lo que indica compatibilidad probada con ese entorno.

## Casos de uso

- Lectura de textos en voz alta en aplicaciones móviles: la app Supertonic Reader usa este modelo para leer artículos y documentos sin conexión, aprovechando la baja latencia y el pequeño tamaño (0.6 GB) para una experiencia fluida en iPhone y iPad.
- Asistentes de voz privados en el dispositivo: al no enviar datos a la nube, el modelo es adecuado para aplicaciones de salud, banca o entornos corporativos donde la privacidad es crítica.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que necesitan síntesis de voz en tiempo real sin depender de servidores externos.
- Generación de audiolibros locales: conversión de libros electrónicos o documentos de texto a audio en el dispositivo, con control total sobre las voces de referencia.
- Prototipado de TTS en entornos de desarrollo: los formatos GGUF y ONNX permiten integrar el modelo en pipelines de prueba con `llama.cpp` y ONNX Runtime, facilitando experimentación sin infraestructura GPU.
- Sistemas de respuesta de voz interactiva (IVR) embebidos: para kioscos, dispositivos IoT o aplicaciones de atención al cliente que requieren síntesis de voz sin conexión y con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de calidad de voz, latencia ni comparativas con otros modelos TTS. Los únicos datos indirectos provienen de la búsqueda web sobre Supertonic (un modelo diferente), que reporta factores de velocidad de hasta 167× sobre tiempo real, pero no son aplicables directamente a este mirror de NeuTTS Nano.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM dedicada; el modelo está diseñado para CPU. El backbone GGUF Q8_0 y el decoder ONNX int8 ocupan aproximadamente 0.6 GB en disco.
- GPU recomendadas: ninguna; la inferencia se realiza en CPU mediante `llama.cpp` y ONNX Runtime. Puede ejecutarse en Apple Silicon (M1/M2/M3/M4), procesadores Intel/AMD con soporte AVX2 y ARM.
- Compatibilidad con GPU de consumo: no es necesaria, aunque podría ejecutarse en GPU con adaptadores ONNX si se desea, pero no es el caso de uso previsto.
- Opciones de despliegue: `llama.cpp` para el backbone GGUF, ONNX Runtime para el decoder ONNX. También es compatible con entornos que soporten el formato GGUF (por ejemplo, `llama-cpp-python`).
- Latencia y throughput: no se han publicado cifras concretas para este modelo. Dado su diseño on-device y la cuantización ligera, se espera una latencia de decenas de milisegundos por frase en CPUs modernas, pero este dato no está confirmado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada. El repositorio no incluye comparaciones con alternativas como Kokoro, Piper, XTTS o Supertonic. Sin embargo, por su arquitectura y tamaño (228M parámetros totales, aunque el backbone activo es menor), se sitúa en la categoría de TTS ligeros para despliegue local. Modelos como Supertonic 2 (66M parámetros) o Supertonic 3 (99M parámetros) son competidores directos en cuanto a eficiencia, pero no se han encontrado métricas que permitan una comparación objetiva con este mirror de NeuTTS Nano.

## Limitaciones y advertencias

- Idioma: la model card no especifica los idiomas soportados. Es probable que el modelo esté entrenado principalmente para inglés u otros idiomas occidentales, pero no hay confirmación.
- Riesgo de alucinación en la generación de voz: como cualquier modelo autoregresivo, puede producir tokens de habla incorrectos o ininteligibles si el texto fonético de entrada no es válido o contiene caracteres fuera de vocabulario.
- Dependencia de la calidad de las voces de referencia: las voces incluidas son fijas (dave, emily, greta, jo); no se documenta cómo añadir voces personalizadas.
- Licencia restrictiva: la licencia `neutts-open-license-v1.0` es de tipo "other" y puede imponer restricciones de uso comercial o de redistribución. Es necesario revisar el texto completo de la licencia antes de usar el modelo en producción.
- Sin actualizaciones ni soporte: al ser un mirror congelado y sin mantenimiento activo (creado en agosto de 2026, con 0 descargas y 0 likes), no hay garantía de corrección de errores ni evolución del modelo.
- Formato de prompt específico: el uso requiere conocer el formato exacto de phonemas y los IDs de tokens de habla documentados en `docs/NEUTTS_ENGINE.md`; un uso incorrecto puede producir salidas vacías o corruptas.
- Rendimiento no verificado: no se han publicado benchmarks independientes, por lo que las afirmaciones de velocidad o calidad deben tomarse con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/grimshaw/supertonic-neutts
- Modelo base NeuTTS Nano (referencia): https://huggingface.co/neuphonic/neutts-nano (no verificado directamente)
- Modelo base NeuCodec (referencia): https://huggingface.co/neuphonic/neucodec (no verificado directamente)
- GitHub de Supertonic (sistema TTS similar, no es este modelo): https://github.com/supertone-inc/supertonic
- GitHub alternativo con documentación de Supertonic: https://github.com/ai-skynet-labs/supertonic-tts
- Página de Supertonic 3 (TTS open source, no es este modelo): https://supertonic3.github.io/
