# remiavelo/sherpa-onnx-whisper-large-v3-turbo-fr-quebecois-int8

## Resumen

Este repositorio contiene una conversión a formato ONNX del modelo de reconocimiento automático del habla (ASR) `ele-sage/whisper-large-v3-turbo-fr-quebecois`, que a su vez es un ajuste fino de `openai/whisper-large-v3-turbo` sobre francés de Quebec. La conversión, realizada por el usuario remiavelo, cuantiza el codificador y el decodificador a int8 y empaqueta los pesos en el formato que espera la librería sherpa-onnx, con el objetivo de permitir su carga en aplicaciones ligeras de transcripción, en particular el teclado vocal Android Kalmia Blabla.

No se trata de un modelo nuevo ni de un reentrenamiento: no se ha añadido ningún dato de entrenamiento ni se ha modificado el ajuste fino original. El interés práctico reside en que traslada un Whisper large-v3-turbo especializado en un acento regional concreto (francés de Canadá) a un runtime de inferencia en dispositivo (ONNX Runtime vía sherpa-onnx), lo que facilita su integración en apps móviles sin depender de PyTorch.

La relevancia es doble: por un lado, demuestra el flujo de conversión Hugging Face → formato OpenAI → ONNX → cuantización int8 para Whisper; por otro, ofrece una alternativa local para transcripción de francés quebequés con un tamaño de repositorio de 1,0 GB. La información publicada es escasa: no hay benchmarks propios más allá de una medición anecdótica sobre seis extractos de Common Voice, y el rendimiento del ajuste fino original (WER 6,65 % en su conjunto de validación) no se ha reproducido en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo ronda los 809 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper trabaja con ventanas de audio de 30 s; no se explicita en la informacion) |
| Tipos de cuantizacion | int8 (encoder y decoder) |
| Idiomas soportados | frances (fr), con ajuste fino sobre frances de Quebec |
| Licencia | MIT |
| Formato de pesos | ONNX (`turbo-encoder.int8.onnx`, `turbo-decoder.int8.onnx`) mas `turbo-tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con atención estándar, diseñado para transcripción y traducción de voz. El modelo original fue ajustado fino por ele-sage sobre francés de Quebec, partiendo de `openai/whisper-large-v3-turbo`. Este repositorio no incluye entrenamiento nuevo: solo aplica una conversión de formato (pesos Hugging Face → formato OpenAI → exportación ONNX → cuantización int8) realizada el 2026-11-12 con los scripts del repositorio `remtav/speech-to-text`, carpeta `android/tools/whisper-hf-vers-sherpa/`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el ajuste fino original; esos detalles corresponden a la model card de ele-sage, que no se ha proporcionado. La innovación técnica de este repositorio es exclusivamente la cuantización int8 de encoder y decoder para su uso con sherpa-onnx 2.0.1, con los nombres de fichero estándar de la conversión sherpa-onnx de Whisper large-v3-turbo, de modo que el modelo se carga con la misma configuración que el original.

## Capacidades

- Reconocimiento automático del habla (ASR) en francés, con especialización en el acento del francés de Quebec.
- Transcripción de audio a texto mediante el pipeline `automatic-speech-recognition`.
- Ejecución en dispositivo mediante sherpa-onnx y ONNX Runtime, sin necesidad de PyTorch.
- Integración en aplicaciones Android (caso de uso declarado: teclado vocal Kalmia Blabla).
- Carga con la misma configuración que la conversión sherpa-onnx estándar de Whisper large-v3-turbo.
- No se documentan capacidades de tool calling, agentes, visión, audio adicional ni modo de razonamiento; al ser un Whisper, se limita a transcripción (y, en el modelo original, traducción, aunque no se menciona en esta conversión).

## Casos de uso

- Dictado por voz en Android: el modelo se integra en el teclado vocal Kalmia Blabla mediante sherpa-onnx, permitiendo transcribir dictado en francés de Quebec sin enviar el audio a un servidor.
- Transcripción local de reuniones o notas de voz en francés canadiense: al ejecutarse sobre ONNX Runtime, puede desplegarse en un portátil o en un servidor sin GPU dedicada, aunque con la latencia propia de un modelo large.
- Subtitulado de contenido audiovisual quebequés: el ajuste fino sobre el acento local debería reducir errores frente a Whisper genérico en ese dominio, si bien no hay métricas publicadas que lo confirmen.
- Procesamiento por lotes de archivos de audio en pipelines de datos: la exportación ONNX permite usar sherpa-onnx como componente de un pipeline de transcripción masiva en Python o C++.
- Aplicaciones de accesibilidad para hablantes de francés de Quebec: transcripción en tiempo real de conversaciones en dispositivos con recursos limitados, aceptando el coste computacional de un modelo large cuantizado.
- Prototipado de asistentes de voz sin conectividad: al no requerir servicios en la nube, encaja en escenarios con requisitos de privacidad o sin red, siempre que el hardware soporte la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sistemáticos en la información disponible. La model card incluye únicamente una medición anecdótica realizada tras la conversión con sherpa-onnx 2.0.1: 5 errores sobre 59 palabras en seis extractos cortos de Common Voice con acento «Français du Canada». El autor advierte explícitamente de que es una muestra muy pequeña y no una evaluación. El WER de 6,65 % sobre el conjunto de validación corresponde al modelo original de ele-sage y no se ha reproducido en esta conversión.

| Benchmark | Resultado | Notas |
|---|---|---|
| Common Voice (6 extractos, acento Canada) | 5 errores / 59 palabras | Muestra anecdótica, no evaluación; sherpa-onnx 2.0.1 |
| WER en validación del modelo original | 6,65 % | Dato de la model card de ele-sage, no reproducido aquí |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los ficheros ONNX int8 suman aproximadamente 1,03 GB (encoder 674 MB + decoder 361 MB), por lo que se necesita al menos ese espacio en memoria, más el overhead del runtime.
- GPU recomendadas: no se especifican; al ser un modelo large-v3-turbo cuantizado, cabe en GPUs de consumo con suficiente memoria, pero no hay datos publicados de latencia ni throughput.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas con 4 GB o más de VRAM, dado el tamaño de los pesos int8, aunque no se confirma en la información disponible.
- Opciones de despliegue: sherpa-onnx (runtime principal, versión 2.0.1 probada), con ONNX Runtime como backend. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte de que el modelo es lento en un teléfono, con el mismo coste de cálculo que Whisper large-v3-turbo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| remiavelo/sherpa-onnx-whisper-large-v3-turbo-fr-quebecois-int8 | no disponible (base large-v3-turbo) | no disponible (ventanas de 30 s) | WER 6,65 % del original (no reproducido); 5/59 errores en muestra anecdótica | MIT | Hugging Face, formato ONNX int8 |
| ele-sage/whisper-large-v3-turbo-fr-quebecois | no disponible (base large-v3-turbo) | no disponible | WER 6,65 % en validación (según su model card) | MIT | Hugging Face, pesos originales |
| openai/whisper-large-v3-turbo | no disponible (aprox. 809 M, no confirmado) | no disponible (ventanas de 30 s) | No disponible en la información proporcionada | MIT (según el modelo original de OpenAI) | Hugging Face, múltiples formatos |

## Limitaciones y advertencias

- No es un modelo nuevo: solo cambia el formato; cualquier limitación del ajuste fino original se hereda.
- La cuantización int8 puede degradar ligeramente la precisión respecto al modelo original; el autor indica que la diferencia no se ha medido.
- La única evaluación publicada es anecdótica (6 extractos, 59 palabras) y no constituye una validación estadística.
- Mismo tamaño y coste de cálculo que Whisper large-v3-turbo: lento en dispositivos móviles.
- Especializado en francés de Quebec; su comportamiento en otras variantes del francés no está documentado.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido o silencios; no se documenta mitigación específica.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia MIT, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales en la model card de ele-sage.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/remiavelo/sherpa-onnx-whisper-large-v3-turbo-fr-quebecois-int8
- Modelo base (ajuste fino): https://huggingface.co/ele-sage/whisper-large-v3-turbo-fr-quebecois
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Scripts de conversión: repositorio `remtav/speech-to-text`, carpeta `android/tools/whisper-hf-vers-sherpa/` (no se proporciona URL directa)
