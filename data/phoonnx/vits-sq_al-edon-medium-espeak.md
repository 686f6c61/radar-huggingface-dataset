# Phoonnx/vits-sq_al-edon-medium-espeak

## Resumen

vits-sq_al-edon-medium-espeak es una voz de síntesis de voz (text-to-speech) para albanés (sq-AL) basada en la arquitectura VITS del ecosistema Piper. La publica Phoonnx, el repositorio de conversiones ONNX del proyecto phoonnx de TigreGotico, a partir de la voz original `sq_AL/edon/medium` de rhasspy/piper-voices, entrenada por edonseki. No es un modelo de lenguaje: es un modelo acústico de TTS de un solo hablante que convierte fonemas espeak (alfabeto IPA) en audio a 22050 Hz.

El modelo resuelve un problema concreto: ofrecer una voz albanesa ligera (63,5 MB en fp32, 19,3 MB en int8) que puede ejecutarse en CPU sin GPU, con un factor de tiempo real (RTF) de 0,038 en fp32 y 0,097 en int8 sobre un Intel i9-11900H. Su relevancia actual radica en que amplía la cobertura de idiomas minoritarios en pipelines de TTS desplegables en local, integrable con el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

La conversión a ONNX no altera los pesos originales; las copias int8 se generan con cuantización dinámica de onnxruntime. La licencia es CC0 1.0, lo que permite uso comercial sin restricciones, si bien se solicita atribución a edonseki.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic, QInt8) |
| Idiomas soportados | albanés (sq-AL) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |

Otros datos técnicos: entrada de texto en fonemas espeak con alfabeto IPA; fonemizador espeak-ng (voz `sq`); frecuencia de muestreo 22050 Hz; un solo hablante; puntuación entrenada `, . ! ? : ;`; tamaño del grafo 63,5 MB (fp32) y 19,3 MB (int8); pico de RSS 278,4 MB (fp32) y 244,8 MB (int8).

## Arquitectura y entrenamiento

VITS es un modelo generativo de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial, con alineamiento monotónico aprendido. En el ecosistema Piper se emplea una variante "medium" de menor tamaño orientada a inferencia en CPU. La entrada es texto fonemizado a IPA mediante espeak-ng, lo que hace que la calidad dependa de la fidelidad del fonemizador.

El entrenamiento upstream lo realizó edonseki y lo publicó en rhasspy/piper-voices. Según la model card original, la voz se afina desde la voz inglesa "lessac" de calidad medium. Los datos de entrenamiento concretos no están registrados upstream; la URL asociada es https://huggingface.co/edonseki/folsh.ai con licencia CC0. No hay checkpoint de entrenamiento en este repositorio, solo los grafos ONNX convertidos. La conversión la realizó TigreGotico Lda sin modificar los pesos; las copias int8 se obtuvieron con onnxruntime 1.32.0 y cuantización dinámica.

## Capacidades

- Síntesis de voz mono-hablante en albanés (sq-AL) a partir de texto.
- Conversión de texto a fonemas IPA con espeak-ng (voz `sq`) y síntesis posterior.
- Soporte de puntuación de cláusula (`, . ! ? : ;`) conservada en la síntesis con phoonnx 1.96.1a1 o superior.
- Salida de audio WAV a 22050 Hz.
- Ejecución en CPU sin GPU, con variantes fp32 e int8.
- Integración con el asistente OVOS mediante `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; no es un modelo de lenguaje.

## Casos de uso

- Asistentes de voz en local para albanés: el modelo permite sintetizar respuestas en un asistente OVOS configurando la voz `piper/sq_AL-edon-medium`, con latencia baja en CPU (RTF 0,038 en fp32) y sin dependencia de servicios en la nube.
- Lectura de textos y accesibilidad: conversión de documentos o contenido web a audio para usuarios albanohablantes con discapacidad visual, gracias a su reducido consumo de memoria (menos de 300 MB de RSS).
- Sistemas de megafonía y avisos automatizados: generación de anuncios pregrabados o dinámicos en albanés para transporte, aeropuertos o comercios, donde el tamaño de 19,3 MB en int8 facilita el despliegue en dispositivos embebidos.
- Integración en aplicaciones de aprendizaje de idiomas: reproducción de frases en albanés con pronunciación consistente para ejercicios de escucha, aprovechando la fonemización IPA controlada.
- Doblaje y preproducción de audio: generación rápida de pistas de voz de referencia para vídeos o prototipos, con la ventaja de la licencia CC0 para uso comercial sin restricciones.
- Investigación en TTS para lenguas minoritarias: base ligera y reproducible para experimentos de cuantización, evaluación de fonemizadores (espeak-ng frente a espyak) o comparación de arquitecturas VITS en albanés.
- Automatización de atención telefónica básica: respuestas de voz para IVR en albanés, desplegables en servidores sin GPU.

## Benchmarks y rendimiento

La model card incluye una evaluación de control de calidad (sin ASR, con verificación de longitud y silencio sobre 3 frases de FLORES-200 devtest) y métricas de rendimiento medidas en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| Caracteres por segundo | 15,9 a 18,6 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,91 a 1,00 |
| Tamano del grafo | 63,5 MB | 19,3 MB |
| Pico de RSS | 278,4 MB | 244,8 MB |
| RTF (mediana de 3, 4 hilos) | 0,038 | 0,097 |

No se han publicado resultados de benchmarks comparativos estándar (MOS, WER, MCD) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. Consumo de memoria RAM aproximado de 278,4 MB (fp32) y 244,8 MB (int8) en pico de RSS.
- GPU recomendadas: no aplica; no se documenta ejecución en GPU.
- Cabe en cualquier equipo de consumo: el grafo int8 de 19,3 MB y el pico de 244,8 MB permiten ejecución en portátiles, Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: phoonnx (con onnxruntime), plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere espeak-ng instalado o el extra `phoonnx[espeak]` (espyak).
- Latencia y throughput: RTF de 0,038 en fp32 y 0,097 en int8 con 4 hilos, es decir, la síntesis tarda entre el 3,8 % y el 9,7 % de la duración del audio generado.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-sq_al-edon-medium-espeak (este) | sq-AL | VITS (Piper) | 63,5 MB fp32 / 19,3 MB int8 | no aplica | CC0 1.0 | ONNX en HF |
| rhasspy/piper-voices sq_AL edon medium (upstream) | sq-AL | VITS (Piper) | no disponible | no aplica | CC0 1.0 | ONNX en HF |
| Otras voces Piper para albanés | sq | VITS (Piper) | variable | no aplica | variable | ONNX en HF |

No se dispone de datos de benchmarks comparativos con otras voces TTS en albanés en la información proporcionada; la comparación se limita a la procedencia y el formato de pesos.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo sintetiza albanés (sq-AL) y no admite otros idiomas ni cambio de voz.
- Dependencia del fonemizador: con espyak en lugar de espeak-ng algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Al estar afinado desde una voz inglesa (lessac), pueden aparecer trazas de acento o artefactos prosódicos en albanés.
- Datos de entrenamiento no registrados upstream, lo que impide auditar la composición del corpus y sus posibles sesgos.
- Riesgo de prosodia incorrecta en textos con puntuación atípica, números, siglas o préstamos no cubiertos por el fonemizador.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; no debe evaluarse con benchmarks de LLM.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero se solicita atribuir a edonseki.
- Las métricas de QA se basan en solo 3 frases de FLORES-200 devtest; la cobertura de evaluación es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sq_al-edon-medium-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/sq/sq_AL/edon/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datos de entrenamiento referenciados: https://huggingface.co/edonseki/folsh.ai
