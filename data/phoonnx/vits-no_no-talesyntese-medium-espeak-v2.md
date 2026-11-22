# Phoonnx/vits-no_no-talesyntese-medium-espeak-v2

## Resumen

`vits-no_no-talesyntese-medium-espeak-v2` es una voz de síntesis de voz (text-to-speech) en noruego bokmål (`no-NO`) basada en la arquitectura VITS, convertida a formato ONNX para su uso con la librería phoonnx. El modelo original fue entrenado por Rhasspy y publicado dentro del repositorio `rhasspy/piper-voices`; la conversión y publicación de esta variante corre a cargo de Phoonnx (TigreGotico Lda). Se trata de una voz de una sola hablante, con una frecuencia de muestreo de 22050 Hz, que recibe fonemas espeak (alfabeto IPA) como entrada de texto.

El modelo resuelve el problema de disponer de una voz TTS noruega ligera, ejecutable en CPU sin GPU, con un tamaño de grafo de 63,2 MB en fp32 y 18,7 MB en int8. Su relevancia radica en que sustituye a la versión anterior (`Phoonnx/vits-no_no-talesyntese-medium-espeak`), ya que el modelo upstream fue reentrenado sobre los modelos base de Piper 1.5. Esta v2 incorpora los pesos actualizados y mantiene la licencia CC0 1.0, lo que permite uso comercial sin restricciones.

La ficha técnica se apoya en los datos publicados por el autor de la conversión y por la model card upstream. No se dispone de información sobre el conjunto de datos de entrenamiento exacto, el número de tokens ni los parámetros totales del modelo, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), convertida a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | fp32 e int8 (QInt8, `quantize_dynamic` de onnxruntime 1.32.0) |
| Idiomas soportados | noruego bokmål (`no-NO`) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak-ng (IPA), voice `nb` |
| Puntuacion soportada | `, . ! ? : ;` |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 256,9 MB (fp32) / 207,8 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,043 (fp32) / 0,102 (int8) |
| Modelo base | `rhasspy/piper-voices` (relacion: quantized) |
| Checkpoint de entrenamiento | no incluido en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), el modelo generativo end-to-end que Piper utiliza para sus voces. La entrada son fonemas IPA producidos por espeak-ng (voice `nb`), y la salida es audio a 22050 Hz. El modelo es de una sola hablante y fue entrenado con la puntuación de cláusula `, . ! ? : ;`, que phoonnx 1.96.1a1 y posteriores preservan en la síntesis.

Según la model card upstream, la voz se obtuvo por fine-tuning desde el modelo base `rdh` (calidad medium, `nl_BE`, un hablante flamenco, CC0), aplicando MRD y SDP. Los datos de entrenamiento proceden del recurso `oai-nb-no-sbr-15` del Språkbanken de la Biblioteca Nacional de Noruega, con licencia CC0. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y se requiere Piper 1.5 o superior. No se registra el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la fuente citada. La conversión a ONNX no altera los pesos; las copias int8 se generan con cuantización dinámica.

## Capacidades

- Síntesis de voz en noruego bokmål a partir de texto con fonemización espeak-ng.
- Generación de audio a 22050 Hz con una única voz femenina/masculina (no especificado en la card; una sola hablante).
- Soporte de puntuación de cláusula (`, . ! ? : ;`) para control de prosodia y pausas.
- Ejecución en CPU sin GPU, con dos variantes de precisión (fp32 e int8).
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en noruego: integración como motor TTS en OVOS o sistemas domésticos, seleccionando la voz `piper/no_NO-talesyntese-medium-v2` en `mycroft.conf`; el modelo cabe en CPU y responde con RTF bajo (0,043 en fp32 sobre un i9-11900H).
- Lectura de contenido en aplicaciones móviles o de escritorio: síntesis de artículos, notificaciones o textos de interfaz en noruego bokmål con un grafo de 18,7 MB en int8, adecuado para dispositivos con recursos limitados.
- Generación de audiolibros o pódcast automatizados: conversión por lotes de texto a WAV mediante `voice.synthesize_wav`, aprovechando el throughput en CPU y la licencia CC0 para distribución comercial.
- Accesibilidad: lectura en voz alta de pantallas o documentos para usuarios con discapacidad visual en Noruega, sin dependencia de servicios en la nube.
- Sistemas de anuncios públicos o telemetría vocal: síntesis de mensajes cortos en entornos embebidos (Raspberry Pi, mini-PC) gracias al bajo pico de RSS (207,8 MB en int8).
- Pruebas de regresión y QA de pipelines TTS: uso del modelo como referencia fija en tests de audio (el autor incluye un método de QA sin ASR basado en longitud y silencio sobre FLORES-200 devtest).
- Prototipado de productos de voz multilingües: combinación con otras voces Piper del mismo ecosistema para cubrir varios idiomas manteniendo un único runtime ONNX.

## Benchmarks y rendimiento

El autor publica una tabla de control de calidad (QA) sin ASR, basada en comprobaciones de longitud y silencio sobre 3 frases de FLORES-200 devtest, medida en un Intel Core i9-11900H a 2,50 GHz con 4 hilos:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| Caracteres por segundo | 15,1 a 19,1 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,99 a 1,05 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 256,9 MB | 207,8 MB |
| RTF (mediana de 3) | 0,043 | 0,102 |

No se han publicado resultados de benchmarks estandar (MOS, WER, MCD) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para inferencia en CPU mediante ONNX Runtime.
- RAM: pico de RSS de 256,9 MB en fp32 y 207,8 MB en int8.
- GPU recomendadas: no aplica; cualquier CPU x86-64 moderna es suficiente. El rendimiento de referencia se midió en un Intel Core i9-11900H.
- Cabe en cualquier equipo consumer, incluidos Raspberry Pi y mini-PC, gracias al tamaño del grafo (18,7 MB en int8).
- Opciones de despliegue: phoonnx (runtime principal), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime directamente. No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI, que no están orientados a modelos TTS VITS.
- Latencia y throughput: RTF de 0,043 en fp32 y 0,102 en int8 (mediana de 3 ejecuciones, 4 hilos), es decir, entre 10 y 23 veces más rápido que tiempo real en el hardware de referencia.
- Dependencia externa: es necesario instalar espeak-ng (o el port espyak incluido en `phoonnx[espeak]`, con posibles diferencias fonéticas).

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Runtime |
|---|---|---|---|---|---|
| `Phoonnx/vits-no_no-talesyntese-medium-espeak-v2` (este) | VITS (Piper) ONNX | no-NO | 63,2 MB fp32 / 18,7 MB int8 | CC0 1.0 | phoonnx / ONNX Runtime |
| `Phoonnx/vits-no_no-talesyntese-medium-espeak` (v1) | VITS (Piper) ONNX | no-NO | no disponible | CC0 1.0 | phoonnx |
| `rhasspy/piper-voices` (no_NO talesyntese medium, upstream) | VITS (Piper) | no-NO | no disponible | CC0 1.0 | Piper |
| Otras voces Piper `no_NO` del repositorio upstream | VITS (Piper) | no-NO | variable | CC0 1.0 | Piper / ONNX |

La comparativa se limita a variantes de la misma familia, ya que no se dispone de datos de benchmarks de modelos TTS alternativos en la información proporcionada. La diferencia principal frente a la v1 es que esta v2 incorpora los pesos reentrenados sobre Piper 1.5.

## Limitaciones y advertencias

- Modelo de una sola hablante y un solo idioma (noruego bokmål); no soporta cambio de voz ni multilingüismo.
- Depende de espeak-ng para la fonemización; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus de la Biblioteca Nacional de Noruega puede reflejar sesgos del material fuente.
- Riesgo de alucinación acústica o artefactos en textos fuera de dominio, aunque el QA del autor pasa las comprobaciones de longitud y silencio.
- La licencia CC0 1.0 permite uso comercial sin restricciones, pero se recomienda acreditar a Rhasspy según indica la model card.
- No incluye checkpoint de entrenamiento ni datos de entrenamiento detallados, lo que dificulta la reproducibilidad.
- Requiere Piper 1.5 o superior en el flujo upstream; la conversión ONNX no modifica los pesos, pero las copias int8 introducen una ligera variación de longitud (0,99 a 1,05 respecto a fp32).
- No es adecuado para tareas de razonamiento, código, visión ni agentes; su único propósito es TTS.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-no_no-talesyntese-medium-espeak-v2
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/no/no_NO/talesyntese/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Fuente de datos de entrenamiento (Språkbanken, NB): https://www.nb.no/sprakbanken/en/resource-catalogue/oai-nb-no-sbr-15/
- Versión anterior: https://huggingface.co/Phoonnx/vits-no_no-talesyntese-medium-espeak
