# datacrunch/tolkio-models

## Resumen

`datacrunch/tolkio-models` no es un modelo único, sino un repositorio de distribución que agrupa los modelos que descarga la aplicación Tolkio, un traductor de voz offline para Android. El repositorio empaqueta una cascada completa de reconocimiento de voz (ASR), detección de actividad de voz (VAD), traducción automática (MT), diarización de hablantes y síntesis de voz (TTS), cada componente con su propia licencia y su propio formato de pesos (ONNX y GGUF).

El problema que resuelve es la traducción de voz en dispositivos móviles sin conectividad: en lugar de depender de una API en la nube, la aplicación ejecuta la cascada completa en el teléfono. Para ello el autor ha recurrido a exportaciones cuantizadas agresivamente, incluyendo un ASR Parakeet Redux convertido a ONNX con cuantización de 2 bits empaquetados y exportaciones int8 para sherpa-onnx.

La relevancia actual es doble: por un lado, ofrece un ejemplo real de pipeline ASR→MT→TTS ejecutable en hardware móvil; por otro, la heterogeneidad de licencias (CC BY 4.0, MIT, Apache 2.0, OpenRAIL-M y CC BY-SA 4.0 en un mismo paquete) lo convierte en un caso interesante para estudiar la gestión de cumplimiento en distribución de modelos. El total declarado de parámetros en safetensors es de 1.942.653.248 y el repositorio ocupa 8,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo único: cascada de componentes heterogéneos (transductores y CTC para ASR, transformer para MT, VITS/difusión para TTS, redes de embeddings para diarización) |
| Parametros totales | 1.942.653.248 (suma de todos los componentes del repositorio, no de un modelo individual) |
| Parametros activos | No disponible (ningún componente declarado como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF 4-bit y 8-bit (MT), ONNX int8 (exports sherpa-onnx), ONNX 2-bit empaquetado (ASR) |
| Idiomas soportados | No disponible en los metadatos del repositorio; la tabla de componentes menciona japonés, chino, inglés, lenguas africanas y voces multilingües |
| Licencia | Mixta (`license: mixed` / `other`); cada componente conserva la suya |
| Formato de pesos | ONNX, GGUF y safetensors |
| Tamano del repositorio | 8,7 GB |
| Componentes declarados | 11 carpetas con modelos de 9 familias distintas |
| Descargas / likes | 745 / 0 |

Desglose de componentes declarado por el autor:

| Carpeta | Modelo | Licencia |
|---|---|---|
| `asr/` | Parakeet Redux (Moondream, derivado de NVIDIA Parakeet TDT), ONNX 2-bit empaquetado | CC BY 4.0 |
| `vad/` | Silero VAD | MIT |
| `mt/`, `mt13/` | Index-Translate 2B (equipo Index de bilibili), GGUF 4-bit / 8-bit | Apache 2.0 |
| `tts/` | Supertonic 3 (Supertone) | OpenRAIL-M |
| `spk/` | CAM++ (3D-Speaker), pyannote segmentation 3.0, TIGER | Apache 2.0 / MIT / Apache 2.0 |
| `africa/asr/` | Omnilingual ASR 300M (Meta), export sherpa-onnx int8 | Apache 2.0 |
| `africa/mt*/` | TranslatePsy-AfriSLM 0.8B / 2B (QVAC), GGUF 4-bit | Apache 2.0 |
| `voices/` | Voces VITS OpenBible (multilingual-tts), ONNX | CC BY-SA 4.0 |
| `asia/ja/asr/` | NVIDIA Parakeet TDT-CTC 0.6B ja, export sherpa-onnx int8 | CC BY 4.0 |
| `asia/zh/asr/` | X-ASR zh-en Zipformer con puntuación (Gilgamesh-J/X-ASR), int8 | Apache 2.0 |
| `asia/zh/voice/` | Kokoro 82M v1.1-zh (hexgrad), int8, con sus listas de palabras | Apache 2.0 |

## Arquitectura y entrenamiento

El repositorio no documenta un proceso de entrenamiento propio: todos los componentes son modelos de terceros convertidos y cuantizados por el autor. La arquitectura real es una cascada de inferencia encadenada: Silero VAD segmenta el audio de entrada, el ASR (Parakeet Redux en la ruta principal, Omnilinguall/Paraformer/X-ASR en las rutas por región) transcribe, el modelo de traducción (Index-Translate 2B o TranslatePsy-AfriSLM) traduce el texto, y el TTS (Supertonic 3, voces VITS OpenBible o Kokoro 82M) sintetiza la salida. En paralelo, la carpeta `spk/` aporta segmentación y embeddings de hablante para diarización.

La innovación técnica destacable no está en el entrenamiento sino en el empaquetado: el ASR principal se distribuye con cuantización de 2 bits empaquetados en ONNX, y el resto de componentes orientados a Asia y África se exportan en int8 para el runtime sherpa-onnx, lo que permite ejecución en dispositivo sin GPU. Los modelos de traducción se sirven en GGUF de 4 y 8 bits, lo que los hace compatibles con runtimes tipo llama.cpp. No se especifican en la información disponible el número de tokens de entrenamiento, la composición de los datasets, ni si los modelos originales usaron RLHF o DPO.

## Capacidades

- Reconocimiento de voz offline en varios frentes: Parakeet Redux (ruta principal), Omnilingual ASR 300M para lenguas africanas, Parakeet TDT-CTC 0.6B para japonés y X-ASR Zipformer zh-en con puntuación para chino e inglés.
- Detección de actividad de voz con Silero VAD, para segmentar audio y evitar transcripciones espurias en silencios.
- Traducción automática de texto con Index-Translate 2B (4 y 8 bits) y TranslatePsy-AfriSLM 0.8B / 2B para lenguas africanas.
- Síntesis de voz con tres motores: Supertonic 3, voces VITS OpenBible multilingües y Kokoro 82M v1.1-zh.
- Diarización y reconocimiento de hablante mediante CAM++ (3D-Speaker), segmentación pyannote 3.0 y TIGER.
- Funcionamiento completamente offline: la aplicación no necesita red una vez importados los modelos.
- Importación desde carpeta local (copia por USB/ADB) como alternativa a la descarga desde el Hub.
- Integración declarada con endpoints compatibles (`endpoints_compatible` en los tags) y etiqueta `conversational`.
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso; son modelos de percepción y traducción, no agentes.

## Casos de uso

- Traducción de voz presencial sin cobertura: un técnico o cooperante desplazado en una zona sin datos dicta una frase, el ASR la transcribe, el MT la traduce y el TTS la reproduce en el idioma local. La cascada completa cabe en un teléfono Android de gama media-alta.
- Atención al ciudadano en oficinas con conectividad restringida: el pipeline se ejecuta en local y evita enviar audio de conversaciones sensibles (sanitarias, legales, migratorias) a servicios en la nube.
- Subtitulado y actas de reunión multilingües: con `spk/` se puede segmentar por hablante y generar un acta con marcas de quién dijo qué, usando Silero VAD para cortar el audio en turnos.
- Accesibilidad para personas con discapacidad auditiva o del habla: el ASR transcribe en tiempo real y el TTS (Kokoro 82M int8, ~82 M de parámetros) lee en voz alta el texto tecleado por el usuario.
- Distribución en mercados con ancho de banda limitado o sin Google Play: el mecanismo "Import from a folder" permite entregar el paquete por USB o ADB en dispositivos sin conexión estable.
- Localización de contenidos hacia y desde chino y japonés en entorno de escritorio: la ruta `asia/` (X-ASR zh-en + Parakeet ja + Kokoro zh) permite montar un servicio de transcripción y doblaje local con ONNX Runtime.
- Banco de pruebas para investigación en cuantización: útil para medir la pérdida de WER al pasar de int8 a 2 bits empaquetados en un transductor, o para comparar GGUF 4-bit frente a 8-bit en traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, BLEU, MOS ni latencias para ninguno de los componentes, y el repositorio no enlaza informes de evaluación propios.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros y del tipo de cuantización declarado; el autor no publica cifras de latencia ni de memoria.

- Espacio en disco: 8,7 GB para el repositorio completo, aunque en ejecución solo se cargan las carpetas necesarias (una ruta regional puede ocupar unos cientos de MB).
- MT Index-Translate 2B en GGUF 4-bit: aproximadamente 1,2–1,5 GB de memoria; en 8-bit, aproximadamente 2,1–2,5 GB.
- ASR Parakeet TDT 0.6B con cuantización de 2 bits empaquetados en ONNX: del orden de 0,2–0,5 GB.
- VAD Silero: unos pocos MB. Kokoro 82M int8: decenas de MB.
- Cascada completa en el escenario más ligero (ASR + MT 4-bit + TTS): estimación de 1,5–2,5 GB de memoria pico; un Android con 4 GB de RAM y sin GPU dedicada es el objetivo de diseño.
- En escritorio o servidor cabe con holgura en una RTX 3060 de 12 GB o una RTX 4060 de 8 GB; para servir en producción, una NVIDIA L4 o T4 (16 GB) permite múltiples instancias concurrentes. A100/H100 no aportan ventaja para este perfil de carga.
- Despliegue: ONNX Runtime o sherpa-onnx para los componentes ONNX (Android, iOS, Linux, macOS); llama.cpp u Ollama para los GGUF de traducción. vLLM solo cubre GGUF con soporte experimental y no ejecuta los componentes ONNX; TGI no es una opción para estos formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se establece contra pipelines equivalentes, ya que el repositorio no es un modelo único. Los datos de las alternativas provienen de sus respectivas model cards públicas.

| Solución | Cobertura | Parámetros | Licencia | Ventana / contexto | Ejecución en dispositivo |
|---|---|---|---|---|---|
| Tolkio models (este repo) | ASR + VAD + MT + TTS + diarización, todo offline | 1,94 B en total, repartidos en 11 componentes | Mixta (CC BY 4.0, MIT, Apache 2.0, OpenRAIL-M, CC BY-SA 4.0) | No disponible | Sí, es el objetivo de diseño (ONNX int8 y 2-bit) |
| OpenAI Whisper large-v3 (solo ASR) | Transcripción y traducción a inglés | 1,55 B | Apache 2.0 | Ventana de 30 s por segmento | Posible, pero pesado para móvil sin cuantizar |
| NLLB-200-distilled-600M (solo MT) | Traducción de texto, 200 lenguas | 600 M | CC-BY-NC 4.0 (restricción de uso comercial) | 512 tokens | Sí, con cuantización |
| SeamlessM4T v2 large (speech-to-speech) | Traducción de voz y texto en un solo modelo | ~2,3 B | CC-BY-NC 4.0 (restricción de uso comercial) | No disponible | Limitado en móvil por tamaño |

La diferencia principal frente a las alternativas es la modularidad y la ausencia de cláusulas no comerciales en la mayoría de componentes, frente al CC-BY-NC de NLLB y SeamlessM4T. El coste es la falta de evaluación publicada y la complejidad de gestionar cinco licencias distintas.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un repositorio de distribución. Cualquier evaluación de calidad debe hacerse componente a componente.
- Licencia mixta: Supertonic 3 usa OpenRAIL-M, con restricciones de uso que deben revisarse antes de un despliegue comercial; las voces VITS OpenBible son CC BY-SA 4.0, lo que impone compartir igual sobre las obras derivadas.
- CC BY 4.0 (Parakeet Redux, Parakeet ja) exige atribución explícita; Apache 2.0 exige conservar avisos de licencia y patentes.
- La cuantización de 2 bits empaquetados en el ASR principal es agresiva y presumiblemente degrada el WER respecto al modelo original, aunque no se publica ninguna medición que lo cuantifique.
- Riesgo de alucinación en la traducción: los modelos de 0,8 B y 2 B en 4 bits son propensos a omitir matices y a inventar terminología en dominios técnicos o jurídicos.
- Alucinaciones típicas de ASR: en silencios, ruido de fondo o audio musical los transductores pueden generar texto plausible pero inexistente; el VAD mitiga el problema pero no lo elimina.
- Cobertura idiomática desigual y no documentada: hay rutas específicas para África, Japón y China, pero no se publica una lista cerrada de pares de idiomas soportados por la ruta principal.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo demográfico, acento o género para ninguno de los componentes.
- Fecha de creación del repositorio posterior a la fecha actual de referencia en algunos entornos; verificar la disponibilidad real antes de integrarlo en producción.
- Sin benchmarks ni latencias publicadas: no es posible estimar el rendimiento en un dispositivo concreto sin medirlo.
- Repositorio con 745 descargas y 0 likes: sin comunidad que haya reportado problemas, la validación corre por cuenta del integrador.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/datacrunch/tolkio-models
- DataCrunch (proveedor de cloud): https://www.datacrunch.com/
- Verda, nuevo nombre de DataCrunch: https://verda.com/
- Anuncio del cambio de marca de DataCrunch a Verda: https://verda.com/blog/datacrunch-is-changing-its-name-to-verda
- Cobertura de prensa sobre DataCrunch como hyperscaler europeo: https://innovations.fr/datacrunch-lhyperscaler-ia-europeen-alimente-par-energie-verte/
- Componente ASR japonés referenciado en la model card: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- Componente ASR chino-inglés referenciado en la model card: https://huggingface.co/Gilgamesh-J/X-ASR

No se han encontrado en la búsqueda web papers, blogs técnicos ni demos específicos de Tolkio o de sus componentes empaquetados.
