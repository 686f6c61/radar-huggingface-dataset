# Raamuhb/sambhrama-voices

## Resumen

Sambhrama voices es un paquete de cuatro voces de síntesis de voz (text-to-speech) distribuidas en formato ONNX para ejecución en navegador. Lo publica el usuario Raamuhb como parte de la aplicación Sambhrama, cuyo objetivo es leer poemas en voz alta en el propio dispositivo del lector, sin depender de servicios de TTS en la nube. Las cuatro voces cubren dos idiomas (kannada e inglés indio) y dos géneros (femenino y masculino): `kn-krithi`, `kn-basu`, `en-krithi` y `en-basu`.

Técnicamente no se trata de un modelo nuevo: son copias convertidas a ONNX de cuatro modelos VITS entrenados por el proyecto SYSPIN (IISc Bengaluru / ARTPARK), publicados originalmente en HuggingFace bajo licencia CC BY 4.0. La conversión divide cada voz en cuatro componentes (`enc`, `dur`, `flow`, `dec`), guarda el encoder y el flow en int8 y el decoder en float16, y conserva un fichero `.json` con el alfabeto de cada voz. El repo ocupa 0,2 GB.

Su relevancia es práctica: ofrece TTS multilingüe (kannada e inglés indio) listo para inferencia local en el navegador mediante ONNX Runtime Web, con cuantización agresiva que reduce el peso y permite funcionar sin GPU dedicada. Es un ejemplo de empaquetado orientado a despliegue en cliente más que de investigación en modelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end, condicional variacional con decoder adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | int8 (encoder y flow), float16 (decoder) |
| Idiomas soportados | kannada (kn), inglés indio (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (cuatro componentes por voz: `enc`, `dur`, `flow`, `dec`) más fichero `.json` de alfabeto |

## Arquitectura y entrenamiento

Cada voz es un modelo VITS, una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un predictor de duraciones, un flow normalizador y un decoder generativo, entrenada de forma adversarial condicionada. Los pesos originales fueron entrenados por el proyecto SYSPIN (IISc Bengaluru / ARTPARK) y publicados como modelos independientes en HuggingFace.

La aportación de este repositorio es el empaquetado: cada voz se divide en cuatro submodelos ONNX (`enc`, `dur`, `flow`, `dec`), con el encoder y el flow cuantizados a int8 y el decoder a float16. No se indica en la información disponible el volumen de datos de entrenamiento, la composición del corpus, ni si hubo ajuste por RLHF o DPO (poco habitual en TTS). Tampoco se documentan innovaciones de decodificación o atención más allá de la propia arquitectura VITS.

## Capacidades

- Síntesis de voz (text-to-speech) en kannada e inglés indio.
- Cuatro voces diferenciadas por idioma y género: `kn-krithi` (kannada, mujer), `kn-basu` (kannada, hombre), `en-krithi` (inglés indio, mujer) y `en-basu` (inglés indio, hombre).
- Inferencia en navegador mediante ONNX Runtime Web, sin servidor ni GPU dedicada.
- Ejecución local en el dispositivo del usuario, lo que evita enviar texto a servicios externos.
- Lectura en voz alta de textos poéticos y literarios, caso de uso original de la aplicación Sambhrama.
- No se documentan capacidades de clonación de voz, control de prosodia por emoción, tool calling ni razonamiento multi-paso; son modelos TTS puros.

## Casos de uso

- Lectura de poesía en kannada en el navegador: la voz `kn-krithi` o `kn-basu` permite reproducir poemas en el dispositivo del lector sin subir el texto a un servidor, preservando la privacidad del contenido.
- Aplicaciones educativas de aprendizaje de kannada: el par de voces femenina y masculina permite exponer al estudiante a dos timbres distintos para el mismo idioma, útil en ejercicios de escucha y pronunciación.
- Accesibilidad web para contenidos en inglés indio: integración de `en-krithi` o `en-basu` en lectores de pantalla o extensiones de navegador que lean artículos con acento indio.
- Audiolibros y publicaciones literarias digitales: el formato ONNX y el tamaño reducido (0,2 GB para las cuatro voces) facilitan su inclusión en aplicaciones web progresivas sin infraestructura de inferencia propia.
- Demos interactivas sin backend: al ejecutarse con ONNX Runtime Web, se pueden desplegar prototipos de TTS en páginas estáticas, ideal para pruebas de concepto y validación de UX.
- Preservación lingüística: aplicaciones comunitarias que digitalicen y reproduzcan textos en kannada con voces entrenadas específicamente para ese idioma, un recurso escaso en comparación con el inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al ser modelos VITS pequeños empaquetados en int8/float16 y ejecutarse en navegador, el consumo de memoria es moderado y cabe en equipos sin GPU dedicada.
- GPU recomendadas: no aplica de forma estricta; el destino principal es CPU mediante ONNX Runtime Web (WASM/WebGPU).
- Compatibilidad con GPU de consumo: sí, cualquier GPU integrada o dedicada moderna puede ejecutar ONNX Runtime, aunque no se especifican requisitos mínimos.
- Opciones de despliegue: ONNX Runtime (Web, para navegador), y en servidor cualquier runtime compatible con ONNX (ONNX Runtime, etc.). No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que no están orientados a TTS VITS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sambhrama voices (este repo) | VITS empaquetado en ONNX | kn, en (indio) | ONNX int8/float16 | CC BY 4.0 | HuggingFace |
| SYSPIN/tts_vits_coquiai_KannadaFemale | VITS original | kn | pesos originales (no especificado) | CC BY 4.0 | HuggingFace |
| SYSPIN/tts_vits_coquiai_EnglishMale | VITS original | en (indio) | pesos originales (no especificado) | CC BY 4.0 | HuggingFace |
| Coqui TTS (familia VITS genérica) | VITS | multilingüe | PyTorch / ONNX | MPL 2.0 (según modelo) | HuggingFace / GitHub |

La comparación directa con otros modelos TTS comerciales (ElevenLabs, Google Cloud TTS) no está disponible en la información proporcionada, y no se han publicado métricas de calidad (MOS, WER) para estas voces en el repositorio.

## Limitaciones y advertencias

- No se documentan evaluaciones de sesgo; al ser voces entrenadas por SYSPIN, los sesgos dependerán del corpus original, no descrito aquí.
- Riesgo de alucinación en TTS: posible pronunciación incorrecta de palabras fuera del vocabulario o de nombres propios, especialmente en inglés indio.
- Cobertura limitada a dos idiomas (kannada e inglés indio); no soporta castellano ni otros idiomas.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige citar al proyecto SYSPIN y al autor del empaquetado; conviene revisar los términos exactos antes de producción.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni reportes de la comunidad.
- No se especifican límites de longitud de texto de entrada ni comportamiento con textos muy largos.
- Al ser una conversión de terceros, no hay garantía de que la cuantización int8/float16 preserve exactamente la calidad de los pesos originales, aunque el autor afirma que "lo que las voces aprendieron no cambia".

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Raamuhb/sambhrama-voices
- Modelo original kannada femenino: https://huggingface.co/SYSPIN/tts_vits_coquiai_KannadaFemale
- Modelo original kannada masculino: https://huggingface.co/SYSPIN/tts_vits_coquiai_KannadaMale
- Modelo original inglés femenino: https://huggingface.co/SYSPIN/tts_vits_coquiai_EnglishFemale
- Modelo original inglés masculino: https://huggingface.co/SYSPIN/tts_vits_coquiai_EnglishMale
