# 4-alokk/kokoro-android-sherpa-v1

## Resumen

Kokoro-android-sherpa-v1 es un reempaquetado del modelo de síntesis de voz Kokoro 82M en su variante int8 multilingüe (v1.0, 54 voces), preparado específicamente para su uso en dispositivos Android dentro de la aplicación Adsorp. No se trata de un modelo entrenado o ajustado por el autor: los pesos son idénticos a los del release `kokoro-int8-multi-lang-v1_0` de sherpa-onnx, que a su vez deriva del modelo original `hexgrad/Kokoro-82M`. El único trabajo realizado ha sido reorganizar los archivos en dos contenedores comprimidos (un `.onnx.gz` para el modelo y un `.tar.gz` USTAR para voces, tokens, lexicones y datos de espeak-ng) con el objetivo de permitir streaming y descompresión con bajo consumo de memoria en el dispositivo.

El modelo subyacente es un TTS ligero de 82 millones de parámetros, cuantizado a int8 en formato ONNX, lo que lo hace adecuado para inferencia en hardware móvil sin GPU dedicada. Su relevancia radica en que demuestra un patrón de distribución reproducible para TTS on-device: el autor fija el tamaño y el SHA-256 de cada archivo y la app rechaza cualquier descarga que no coincida, lo que aporta integridad verificable en un contexto de despliegue móvil.

La ficha se centra en lo que puede afirmarse con la información disponible: empaquetado, procedencia, licencia y características del modelo base. Cualquier dato no documentado en la model card se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neuronal (Kokoro v1.0); arquitectura interna no detallada en la información disponible |
| Parámetros totales | 82 M (heredado de hexgrad/Kokoro-82M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | int8 (ONNX) |
| Idiomas soportados | multilingüe (según el release upstream `kokoro-int8-multi-lang-v1_0`); lista concreta de idiomas no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX int8, empaquetado como `kokoro-android-v1-model-14c627b3.onnx.gz`; soporte en `kokoro-android-v1-support-e86fe45b.tar.gz` (USTAR) con `voices.bin`, `tokens.txt`, lexicones, `espeak-ng-data/`, `dict/` y `*.fst` |
| Voces | 54 voces (orden según metadatos `id2speaker`, no alfabético) |
| Tamaño del repo | 0,1 GB |
| Runtime objetivo | sherpa-onnx en Android (app Adsorp) |
| Verificación de integridad | tamaño y SHA-256 fijados por archivo; los 8 primeros caracteres hex del SHA-256 aparecen en el nombre del archivo |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica ningún modelo. Los pesos proceden del release `kokoro-int8-multi-lang-v1_0` de sherpa-onnx, que a su vez es una conversión y cuantización a int8 del modelo original `hexgrad/Kokoro-82M` (Kokoro v1.0). La model card no documenta detalles de arquitectura interna, composición del dataset de entrenamiento, número de tokens ni procesos de RLHF/DPO; esos datos corresponden al modelo base y no se reproducen aquí.

La innovación técnica de este paquete es de ingeniería de distribución, no de modelado: los archivos se rearchivan en dos contenedores comprimidos pensados para streaming y descompresión con memoria baja en Android, y se añade una capa de verificación criptográfica (tamaño y SHA-256 por archivo) que la aplicación comprueba antes de aceptar el contenido. El soporte incluye datos de espeak-ng, lexicones y ficheros FST, lo que sugiere un pipeline de fonemización y normalización léxica en el propio dispositivo. No se documenta ninguna técnica de decodificación especulativa ni atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con 54 voces disponibles.
- Soporte multilingüe heredado del release upstream `kokoro-int8-multi-lang-v1_0`; la lista concreta de idiomas no está disponible en la información proporcionada.
- Inferencia on-device en Android mediante sherpa-onnx, sin necesidad de conexión a servidor.
- Carga por streaming y descompresión con bajo consumo de memoria gracias al reempaquetado en `.gz` y `.tar.gz`.
- Verificación de integridad de los archivos descargados mediante tamaño y SHA-256 fijados en la app.
- Fonemización y normalización léxica local mediante espeak-ng, lexicones y ficheros FST incluidos en el paquete de soporte.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de contenido en aplicaciones Android: integración del modelo vía sherpa-onnx para leer artículos, notificaciones o mensajes en voz alta sin enviar texto a un servidor, aprovechando el tamaño reducido (82 M parámetros, int8) y el empaquetado optimizado para memoria baja.
- Accesibilidad para personas con discapacidad visual: sustitución o complemento de TalkBack con una voz neuronal de mayor calidad que los motores TTS del sistema, con 54 voces seleccionables según preferencia del usuario.
- Asistentes de voz offline: generación de respuestas habladas en asistentes que deben funcionar sin conectividad, ya que todo el pipeline (modelo, lexicones y espeak-ng) se descarga y verifica localmente.
- Aprendizaje de idiomas: reproducción de pronunciaciones con distintas voces para practicar escucha, siempre que se confirmen los idiomas soportados por el release multilingüe upstream.
- Audiolibros y podcasts generados en el dispositivo: síntesis de textos largos por streaming, con descompresión incremental para no cargar todo el modelo en memoria de una vez.
- Pruebas de integración TTS en CI para apps Android: el patrón de fijado de SHA-256 y tamaño por archivo permite validar de forma determinista que el binario descargado es el esperado, útil en pipelines de release de aplicaciones móviles.
- Prototipado de interfaces conversacionales embebidas: evaluación de calidad de voz y latencia en hardware real antes de comprometerse con un proveedor TTS en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de voz (MOS, CMOS), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un modelo de 82 M parámetros en int8, la huella de pesos ronda decenas de MB, pero no se documenta el pico de memoria en runtime.
- GPU recomendadas: no aplica; el objetivo es CPU de dispositivos Android mediante sherpa-onnx.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no documentada; el paquete está pensado para móvil, no para escritorio con GPU.
- Opciones de despliegue: sherpa-onnx (runtime objetivo); otros runtimes ONNX no están documentados para este paquete concreto.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: repositorio de 0,1 GB; el modelo se descarga como `.onnx.gz` y el soporte como `.tar.gz` USTAR.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| kokoro-android-sherpa-v1 (este) | 82 M | ONNX int8 empaquetado para Android | Apache-2.0 | TTS on-device, 54 voces, multilingüe | Hugging Face, 0 descargas |
| hexgrad/Kokoro-82M | 82 M | safetensors / ONNX según release | Apache-2.0 | TTS base, referencia upstream | Hugging Face |
| sherpa-onnx `kokoro-int8-multi-lang-v1_0` | 82 M | ONNX int8 | Apache-2.0 | Release upstream del que deriva este paquete | GitHub / releases de sherpa-onnx |

No se dispone de datos de benchmarks que permitan comparar calidad o latencia con alternativas como Piper, Coqui TTS o VITS; no disponible.

## Limitaciones y advertencias

- No es un modelo nuevo ni ajustado: cualquier limitación del Kokoro-82M original y del release int8 de sherpa-onnx se hereda íntegramente.
- La lista concreta de idiomas soportados no está documentada en la model card; el tag indica "multi-lingual" pero no se especifica cuáles.
- El orden de las voces en `voices.bin` sigue los metadatos `id2speaker` y no es alfabético; asumir otro orden produce selección incorrecta de voz.
- La app fija tamaño y SHA-256 por archivo y rechaza cualquier contenido que no coincida: cualquier actualización del paquete requiere actualizar también los hashes en la aplicación.
- La cuantización int8 puede degradar la calidad de la voz frente a los pesos originales en precisión completa; no se documenta la magnitud de esa degradación.
- Riesgo de alucinación en el sentido de texto generado: no aplica directamente, pero un TTS puede producir pronunciaciones incorrectas ante texto fuera de distribución, siglas o idiomas no cubiertos.
- Sesgos: no documentados; al derivar de un modelo entrenado con datos no especificados, pueden existir sesgos de pronunciación o de cobertura lingüística.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los componentes de soporte incluidos (espeak-ng, lexicones y FST) antes de redistribuir.
- Uso en producción: 0 descargas y 0 likes en el momento de la consulta; el paquete no tiene validación comunitaria y su mantenimiento depende de un único autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/4-alokk/kokoro-android-sherpa-v1
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Runtime y empaquetado sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
