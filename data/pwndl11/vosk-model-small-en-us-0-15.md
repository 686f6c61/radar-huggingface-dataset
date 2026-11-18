# pwndl11/vosk-model-small-en-us-0.15

## Resumen

Este repositorio no contiene un modelo nuevo, sino un reempaquetado del modelo de reconocimiento de voz **vosk-model-small-en-us-0.15** desarrollado originalmente por Alpha Cephei Inc. El autor del repositorio, pwndl11, se limita a convertir el archivo `.zip` original en un `.tar.gz` con la carpeta interna renombrada a `model/`, que es la estructura que espera la librería `vosk-browser` para cargar el modelo desde un navegador. No se ha modificado ningún archivo interno del modelo.

El modelo subyacente es un sistema de reconocimiento automático del habla (ASR) para inglés estadounidense, construido sobre la tecnología Kaldi y optimizado para aplicaciones móviles y de bajo consumo de recursos. Se trata de un modelo "small", pensado para ejecutarse en dispositivos con recursos limitados, con una tasa de error de palabra (WER) reportada de 10,38 en TED-LIUM test y 9,85 en LibriSpeech test-clean.

La relevancia de este repositorio es puramente práctica: facilita el despliegue del modelo Vosk en extensiones de navegador mediante `vosk-browser`, sin necesidad de descomprimir manualmente ni de reestructurar directorios. Es un artefacto de empaquetado, no una contribución algorítmica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kaldi (modelo acústico y de lenguaje basado en Kaldi, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por streaming, sin contexto de tokens definido) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en, variante US English) |
| Licencia | Apache 2.0 |
| Formato de pesos | archivos Kaldi dentro de `model.tar.gz` (41,2 MB) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR basado en Kaldi, la cadena de herramientas clásica de reconocimiento de voz que combina modelos acústicos (típicamente GMM-HMM o DNN-HMM) con modelos de lenguaje y grafos de decodificación. No se trata de un transformer ni de un modelo neuronal extremo a extremo de gran tamaño. Alpha Cephei lo describe como un modelo para aplicaciones móviles Vosk, lo que implica un diseño orientado a bajo consumo de memoria y CPU.

No se dispone en la información proporcionada de detalles sobre el número de horas de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de adaptación como RLHF (no aplicable en ASR clásico). La model card original únicamente reporta los resultados de WER mencionados. El reempaquetado de pwndl11 no altera ni el entrenamiento ni los pesos: solo cambia el contenedor de `.zip` a `.tar.gz` y el nombre de la carpeta interna a `model/`.

## Capacidades

- Reconocimiento automático del habla en inglés estadounidense, orientado a audio de 16 kHz.
- Decodificación por streaming mediante `KaldiRecognizer(16000)` en `vosk-browser`.
- Restricción del vocabulario en tiempo de inferencia: se puede pasar una lista de palabras como segundo argumento de `KaldiRecognizer` para limitar lo que el modelo puede reconocer, sin reentrenamiento.
- Ejecución en navegador a través de `vosk-browser` (WebAssembly).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá del propio ASR.
- Capacidad multilingüe limitada exclusivamente al inglés.

## Casos de uso

- **Transcripción en extensiones de navegador**: el modelo se carga directamente desde Hugging Face con `Vosk.createModel()` y permite transcribir audio capturado en el navegador sin enviar datos a un servidor, gracias a su empaquetado en `model.tar.gz`.
- **Dictado por voz en aplicaciones web**: con `KaldiRecognizer(16000)` se puede implementar entrada de texto por voz en formularios o editores web, usando el modelo small por su bajo peso (41,2 MB).
- **Comandos de voz con vocabulario restringido**: al pasar una lista de palabras a `KaldiRecognizer`, se puede limitar el reconocimiento a un conjunto cerrado de comandos (por ejemplo, "play", "stop", "next") sin reentrenar, lo que reduce falsos positivos.
- **Subtitulado en tiempo real de contenido en inglés**: el modelo está pensado para streaming y puede alimentar un pipeline de subtítulos en aplicaciones de vídeo o reuniones en el navegador.
- **Prototipado de ASR en el cliente**: útil para desarrolladores que quieren validar una funcionalidad de voz sin infraestructura de servidores, aprovechando la licencia Apache 2.0 y el tamaño reducido.
- **Accesibilidad web**: integración de reconocimiento de voz para usuarios con dificultades de teclado en aplicaciones web en inglés, ejecutando el modelo localmente en el navegador.
- **Aplicaciones móviles Vosk**: aunque este repositorio está empaquetado para el navegador, el modelo original está diseñado para aplicaciones móviles Vosk, por lo que puede reutilizarse en ese contexto si se descomprime el archivo.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card original de Alpha Cephei, citados en el README de este repositorio:

| Benchmark | WER |
|---|---|
| TED-LIUM test | 10,38 |
| LibriSpeech test-clean | 9,85 |

No se han publicado en la información disponible resultados comparativos con otros modelos en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecutarse en CPU y en navegador (WebAssembly), sin requisitos de GPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en GPU consumer: no aplica; el modelo se ejecuta en CPU o en el navegador.
- Opciones de despliegue: `vosk-browser` (WebAssembly en navegador), Vosk para aplicaciones móviles y de escritorio, y la cadena Kaldi subyacente.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo small orientado a móvil, está optimizado para baja latencia en streaming, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vosk-model-small-en-us-0.15 (este repo) | no disponible | no aplica (ASR streaming) | WER 10,38 TED-LIUM; 9,85 LibriSpeech test-clean | Apache 2.0 | Hugging Face (reempaquetado) |
| Otros modelos Vosk de Alpha Cephei | no disponible | no aplica | no disponible | Apache 2.0 | alphacephei.com/vosk/models |
| Whisper (OpenAI) | no disponible en esta ficha | no aplica | no disponible | MIT (según versión) | Hugging Face / OpenAI |

No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo reconoce inglés estadounidense; no soporta otros idiomas.
- Es un modelo "small" con WER en torno al 10 % en benchmarks de referencia, por lo que no es adecuado para transcripción de alta precisión en entornos ruidosos o con acentos no estadounidenses.
- No se dispone de información sobre sesgos acústicos o demográficos en la documentación proporcionada.
- Riesgo de alucinación: en ASR clásico el riesgo se manifiesta como sustituciones o inserciones de palabras, especialmente con vocabulario restringido mal configurado.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright de Alpha Cephei Inc. (2020) incluido en `LICENSE`.
- Este repositorio es un reempaquetado no oficial; para producción conviene verificar la integridad mediante el sha256 indicado (`92e22f0dbf60108ec5e9516cfa7f429f910a9e7c4a0719758c9fe9c5a2615d48`).
- El tamaño del repo en Hugging Face figura como 0.0 GB, aunque el archivo `model.tar.gz` pesa 41,2 MB; conviene comprobar la descarga real.
- No hay garantía de mantenimiento por parte del autor del reempaquetado (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pwndl11/vosk-model-small-en-us-0.15
- Modelo original (Alpha Cephei): https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
- Página de modelos Vosk: https://alphacephei.com/vosk/
- Librería vosk-browser: https://github.com/ccoreilly/vosk-browser
