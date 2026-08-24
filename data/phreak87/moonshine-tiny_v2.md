# Phreak87/moonshine-tiny_V2

## Resumen

El modelo `Phreak87/moonshine-tiny_V2` es un sistema de reconocimiento automático de voz (ASR) especializado en alemán, desarrollado por Phreak87 como una re-exportación a ONNX del modelo `dattazigzag/moonshine-tiny-de`, que a su vez deriva de la familia Moonshine de Useful Sensors. Esta versión V2 corrige un defecto en el decoder fusionado de ONNX que provocaba una generación incorrecta del primer token en la ruta de caché de transformers.js, permitiendo ahora el uso estándar de la API `pipeline()` sin necesidad de bucles de decodificación personalizados. El modelo está pensado para ejecutarse en el navegador o en dispositivos edge mediante transformers.js, ofreciendo baja latencia y privacidad al procesar el audio localmente. Con un tamaño de repositorio de 0.2 GB, es una opción ligera para transcripción de voz en alemán en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (según archivos ONNX: `encoder_model.onnx` y `decoder_model_merged.onnx`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la duración del audio de entrada) |
| Tipos de cuantizacion | fp32 (según el ejemplo de uso con `dtype: 'fp32'`) |
| Idiomas soportados | Alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder típica de los sistemas ASR, con un encoder que procesa la señal de audio (muestreada a 16 kHz) y un decoder que genera el texto transcrito. La versión V2 re-exporta los pesos originales de `moonshine-tiny-de` mediante la librería `optimum`, corrigiendo a nivel de ONNX el subgrafo `then_branch` del decoder fusionado. El problema original consistía en que la ruta de caché (`cache=True`) usaba directamente `past_key_values.X.encoder.*` como claves/valores de atención cruzada, que son cero en el primer paso, lo que producía un primer token incorrecto. La corrección añade una proyección fresca de K/V desde `encoder_hidden_states` dentro del subgrafo para cada capa. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Reconocimiento de voz automático en alemán, transcribiendo audio a texto.
- Baja latencia, diseñado para aplicaciones en tiempo real y dispositivos edge (según el proyecto Moonshine original).
- Ejecución local en el navegador o en Node.js mediante transformers.js, sin necesidad de servidores externos.
- Soporte para procesamiento de audio en formato `Float32Array` a 16 kHz.
- Compatible con la API estándar `pipeline('automatic-speech-recognition', modelId)` de transformers.js tras la corrección V2.
- No se documentan capacidades de tool calling, agentes, visión u otras modalidades; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones o entrevistas en alemán: el modelo puede procesar grabaciones de audio y generar texto en tiempo real, gracias a su baja latencia y ejecución local, lo que resulta útil para herramientas de productividad sin conexión.
- Subtitulado automático de vídeos en alemán: integrado en un pipeline de procesamiento de vídeo, el modelo transcribe el audio y permite generar subtítulos de forma automática, con la ventaja de no depender de servicios en la nube.
- Asistentes de voz para dispositivos embebidos: al ser ligero (0.2 GB) y ejecutarse en el navegador o en hardware modesto, puede incorporarse a asistentes domésticos o kioscos interactivos que requieran comprensión de comandos de voz en alemán.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real de conversaciones o eventos en alemán puede mostrarse en pantalla, mejorando la accesibilidad en entornos públicos o educativos.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir grabaciones de llamadas en alemán para su posterior análisis de sentimiento o búsqueda de información, manteniendo los datos en local por privacidad.
- Herramientas de dictado para aplicaciones de productividad: los usuarios pueden dictar texto en alemán y obtener transcripción inmediata, útil para redacción de documentos o correos electrónicos sin teclado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una verificación cualitativa en un archivo de prueba (`test-de.mp3`), donde la transcripción incremental (V2) coincide byte a byte con la referencia de decodificación completa (V1), pero no se proporcionan métricas como WER (Word Error Rate) ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo pequeño (0.2 GB en disco), puede ejecutarse en CPU sin necesidad de GPU dedicada.
- El ejemplo de uso con transformers.js sugiere que funciona en el navegador, por lo que cualquier ordenador moderno con soporte WebAssembly o JavaScript debería ser suficiente.
- Para despliegue en servidores, puede usarse con Node.js y la librería `@huggingface/transformers`.
- No se especifican requisitos de VRAM, pero dado el tamaño, es probable que quepa en GPUs de consumo como la RTX 3060 o incluso en integradas.
- Opciones de despliegue: transformers.js (navegador o Node.js), ONNX Runtime, y potencialmente otros frameworks que soporten ONNX.
- Latencia y throughput: no disponibles, pero la baja latencia es una característica destacada del proyecto Moonshine.

## Comparativa con modelos similares

No se dispone de datos numéricos de rendimiento para comparar directamente. Sin embargo, cualitativamente, este modelo se posiciona como una alternativa ligera a otros ASR multilingües como Whisper-tiny, con la ventaja de estar especializado en alemán y optimizado para ejecución en edge. La comparación con Whisper-tiny (que tiene alrededor de 39M parámetros) sería relevante, pero no se dispone de métricas concretas. Otras alternativas podrían ser modelos ASR específicos para alemán como `wav2vec2-large-xlsr-53-german`, aunque estos suelen ser más pesados. Se recomienda consultar la documentación del proyecto Moonshine para más detalles sobre su rendimiento relativo.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para alemán; no soporta otros idiomas.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño, puede tener dificultades con acentos regionales, ruido de fondo o vocabulario técnico.
- Riesgo de alucinación en transcripciones: como cualquier ASR, puede generar texto incorrecto en condiciones de audio deficiente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del proyecto Moonshine original, ya que este modelo es una re-exportación.
- La corrección V2 está validada solo en un archivo de prueba; en producción, es recomendable realizar pruebas adicionales con diversos audios.
- No se proporcionan garantías de soporte o mantenimiento por parte del autor.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Phreak87/moonshine-tiny_V2)
- [Versión V1 del modelo](https://huggingface.co/Phreak87/moonshine-tiny-de-onnx)
- [Modelo original de dattazigzag](https://huggingface.co/dattazigzag/moonshine-tiny-de)
- [Repositorio de Moonshine en GitHub](https://github.com/moonshine-ai/moonshine)
- [Repositorio de Moonshine v2](https://github.com/moonshine-ai/moonshine-v2)
- [Model card de moonshine-tiny en Inferix](https://inferix.co/models/UsefulSensors/moonshine-tiny)
