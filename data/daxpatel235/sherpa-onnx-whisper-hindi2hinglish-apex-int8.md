# daxpatel235/sherpa-onnx-whisper-hindi2hinglish-apex-int8

## Resumen

`daxpatel235/sherpa-onnx-whisper-hindi2hinglish-apex-int8` es una exportación a ONNX con cuantización int8 del modelo de reconocimiento automático del habla `Oriserve/Whisper-Hindi2Hinglish-Apex`, empaquetada específicamente para su uso con la librería sherpa-onnx. No se trata de un modelo nuevo: es una conversión de formato realizada por un tercero (daxpatel235) para permitir la inferencia totalmente offline sobre CPU en la aplicación de dictado TrayTra. El modelo original, desarrollado por Oriserve, parte de la arquitectura Whisper de OpenAI y está especializado en transcribir audio en hindi y hinglish (mezcla de hindi e inglés) a texto hinglish romanizado, es decir, escrito con caracteres latinos.

La relevancia de esta ficha radica en que ilustra un patrón habitual en el ecosistema open source: modelos especializados que se redistribuyen en formatos optimizados para despliegue en producción. Aquí el cambio es puramente de empaquetado (exportación ONNX y cuantización dinámica int8), sin reentrenamiento, lo que reduce el peso del repositorio a unos 1,0 GB y permite ejecución en CPU sin GPU. La arquitectura subyacente corresponde al layout de Whisper large-v3-turbo (32 capas de encoder y 4 de decoder, 128 bins mel), y el modelo base sobre el que se construyó Apex es `openai/whisper-large-v3-turbo`.

Conviene señalar que el modelo es de nicho: está pensado para un único par de idiomas (hindi/inglés) y una única tarea (transcripción a hinglish romanizado). No obstante, para desarrolladores que construyan aplicaciones de voz en ese contexto lingüístico, ofrece una vía de despliegue ligera, offline y con licencia Apache-2.0. El repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto recién publicado y de uso principalmente interno para el proyecto TrayTra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (layout large-v3-turbo: 32 capas encoder, 4 capas decoder, 128 bins mel) |
| Parametros totales | no disponible (el modelo base es whisper-large-v3-turbo; el recuento exacto de Apex no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana de inferencia (límite estándar de Whisper) |
| Tipos de cuantizacion | int8 (cuantización dinámica con ONNX Runtime) |
| Idiomas soportados | hi (hindi), en (inglés); salida en hinglish romanizado |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx) + tokens.txt |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper, un transformer encoder-decoder con atención completa, adaptada al layout de large-v3-turbo. El export se realizó con el script oficial `scripts/whisper/export-onnx.py` de sherpa-onnx v2.0.2, usando el layout de large-v3-turbo (32 capas de encoder, 4 de decoder y 128 bins mel). Los pesos de Hugging Face se mapearon al layout original de OpenAI Whisper mediante el fichero `convert_hf2openai.json` de Oriserve y se verificaron con una carga estricta antes de la exportación. Posteriormente, el propio script aplicó cuantización dinámica int8 con ONNX Runtime. No hubo reentrenamiento: los cambios respecto al original son únicamente el formato de fichero y la cuantización, conforme a la sección 4 de la licencia Apache-2.0.

El modelo original Apex fue desarrollado por Oriserve sobre `openai/whisper-large-v3-turbo` y ajustado para la tarea de transcripción de hindi y hinglish a texto hinglish romanizado. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Un detalle técnico relevante documentado por el autor es que el modelo responde `nan` (a veces repetido, `nannannan`) ante audio que no logra interpretar, porque sus datos de entrenamiento almacenaban transcripciones vacías de esa forma; debe tratarse un resultado compuesto solo de `nan` como ausencia de habla.

## Capacidades

- Reconocimiento automático del habla (ASR) para hindi y hinglish, con salida en texto hinglish romanizado (caracteres latinos).
- Transcripción offline sobre CPU, sin necesidad de GPU ni conexión a red.
- Procesamiento de ventanas de audio de hasta 30 segundos; el audio más largo debe dividirse previamente (por ejemplo, con Silero VAD).
- Funcionamiento óptimo en segmentos de varios segundos; los clips muy cortos (alrededor de 1 s) carecen de contexto suficiente.
- Detección implícita de ausencia de habla mediante la salida `nan`.
- No se documentan capacidades de traducción, tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Aplicaciones de dictado offline: integración en apps de escritorio o móvil que transcriben voz a texto sin conexión, usando sherpa-onnx sobre CPU; el tamaño int8 (~1 GB) y la licencia Apache-2.0 lo hacen adecuado para distribución.
- Subtitulado de contenido en hindi/hinglish: transcripción de vídeos o pódcasts en esos idiomas a texto romanizado, dividiendo el audio en segmentos de hasta 30 s con un VAD previo.
- Asistentes de voz para el mercado indio: conversión de comandos hablados en hinglish a texto para su posterior procesamiento por un LLM o un sistema de intenciones.
- Actas y notas de reuniones: captura de reuniones bilingües hindi-inglés y generación de transcripciones en script latino, más fáciles de procesar por herramientas que no manejan devanagari.
- Investigación en ASR multilingüe: uso como línea base cuantizada para experimentos de reconocimiento de code-switching hindi-inglés en entornos sin GPU.
- Sistemas embebidos y de borde: despliegue en dispositivos con recursos limitados gracias a la cuantización int8 y la ausencia de dependencia de CUDA.
- Accesibilidad: transcripción en tiempo casi real de conversaciones para personas con dificultades auditivas en contextos hindi/hinglish.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; en GPU, el modelo int8 ocupa aproximadamente 1,0 GB de pesos (674,6 MB encoder + 361,1 MB decoder), más overhead de activaciones y runtime.
- GPU recomendadas: no se especifican; el modelo está diseñado para inferencia en CPU con ONNX Runtime.
- Cabe en GPU consumer: sí, por tamaño (cualquier GPU con al menos ~2 GB de memoria libre podría alojar los pesos), aunque el objetivo declarado es CPU.
- Opciones de despliegue: sherpa-onnx (librería nativa, con bindings Python y otros), mediante `OfflineRecognizer.from_whisper`; también puede ejecutarse con ONNX Runtime directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| daxpatel235/sherpa-onnx-whisper-hindi2hinglish-apex-int8 | no disponible (base large-v3-turbo) | 30 s | hi, en (salida hinglish) | Apache-2.0 | ONNX int8 |
| Oriserve/Whisper-Hindi2Hinglish-Apex | no disponible (base large-v3-turbo) | 30 s | hi, en (salida hinglish) | Apache-2.0 | safetensors (Hugging Face) |
| openai/whisper-large-v3-turbo | ~809 M (según ficha pública de OpenAI) | 30 s | multilingüe (~99 idiomas) | MIT | safetensors, etc. |

La comparación directa con otros modelos especializados en hinglish no está disponible en la información proporcionada. Frente al modelo original de Oriserve, la diferencia es el formato (ONNX int8 frente a safetensors) y el tamaño reducido; frente a whisper-large-v3-turbo, la especialización en hinglish romanizado y la pérdida de cobertura multilingüe general.

## Limitaciones y advertencias

- Nicho lingüístico muy restringido: solo hindi e inglés, con salida en hinglish romanizado; no es un modelo ASR general.
- Salida `nan` ante audio ininteligible: debe filtrarse explícitamente como ausencia de habla en producción.
- Ventana máxima de 30 s por inferencia; requiere segmentación previa con VAD para audio largo.
- Rendimiento degradado en clips muy cortos (alrededor de 1 s) por falta de contexto.
- Cuantización int8: puede introducir una ligera pérdida de precisión frente al modelo original en safetensors, aunque no se documentan métricas comparativas.
- Riesgo de alucinación en transcripciones, inherente a los modelos Whisper, especialmente con ruido de fondo o audio de baja calidad.
- Sesgos: no documentados en la información proporcionada; al derivar de Whisper, puede heredar sesgos del corpus de entrenamiento original.
- Licencia Apache-2.0 permite uso comercial, pero deben conservarse los avisos de atribución a Oriserve y a OpenAI (MIT) según lo indicado en el repositorio.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- El autor declara explícitamente que no reentrenó el modelo; cualquier mejora de calidad debe buscarse en el modelo original de Oriserve.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/daxpatel235/sherpa-onnx-whisper-hindi2hinglish-apex-int8
- Modelo base (Oriserve): https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Proyecto TrayTra: https://github.com/daxpatel235/TrayTra
- Script de conversión: https://github.com/daxpatel235/TrayTra/blob/main/tools/convert/convert_hinglish.py
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
