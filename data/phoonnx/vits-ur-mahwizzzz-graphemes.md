# Phoonnx/vits-ur-mahwizzzz-graphemes

## Resumen

`Phoonnx/vits-ur-mahwizzzz-graphemes` es un modelo de síntesis de voz (text-to-speech) en urdu, empaquetado en formato ONNX para la librería `phoonnx`. El modelo original fue entrenado por el usuario `mahwizzzz` (publicado como `mahwizzzz/vits-ur`) y Phoonnx se encarga de su conversión a ONNX y de su integración en el ecosistema OVOS. La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que genera audio directamente a partir de texto sin necesidad de un vocoder separado.

El modelo está pensado para síntesis de voz en urdu a partir de grafemas (caracteres del texto) en lugar de fonemas, lo que simplifica el front-end de texto: `scriptconv` normaliza la entrada y la convierte directamente en la secuencia de caracteres que consume el modelo. Es un modelo de nicho, con un tamaño de repositorio de 0,1 GB, lo que sugiere un modelo compacto apto para inferencia en CPU.

Su relevancia es limitada y muy específica: cubre una lengua de bajos recursos (urdu) dentro del ecosistema OVOS/phoonnx, y su licencia MIT facilita su uso comercial e integración en asistentes de voz. No obstante, la información pública disponible es muy escasa (21 descargas, 0 likes, sin benchmarks ni detalles de entrenamiento), por lo que debe evaluarse con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, sin contexto de texto definido) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | urdu (`ur`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado conjuntamente. VITS produce audio directamente desde la representación textual, evitando la necesidad de un vocoder acústico separado. El modelo se distribuye en formato ONNX, lo que permite su ejecución con el runtime de ONNX y su integración en `phoonnx`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco habitual en TTS) ni innovaciones técnicas específicas más allá de la propia arquitectura VITS. El front-end de texto utiliza `GraphemePhonemizer` de `scriptconv`, es decir, el modelo consume grafemas del texto urdu normalizado en lugar de una representación fonémica explícita.

## Capacidades

- Síntesis de voz (text-to-speech) en urdu a partir de texto en grafemas.
- Generación de audio en formato WAV mediante `synthesize_wav`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Normalización y conversión de texto mediante `scriptconv`.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al urdu (`ur`).

## Casos de uso

- Asistentes de voz en urdu sobre OVOS: el modelo se integra como plugin de TTS y permite que un asistente OVOS responda en urdu configurando la voz en `mycroft.conf`.
- Lectura de contenido en urdu: síntesis de artículos, noticias o textos para aplicaciones de accesibilidad o lectura automática, usando el front-end de grafemas para procesar texto sin necesidad de un diccionario fonético.
- Sistemas de anuncios y avisos automatizados: generación de mensajes de voz en urdu para transporte, comercio o servicios públicos, con inferencia en CPU gracias al tamaño compacto del modelo ONNX.
- Prototipado de interfaces de voz en urdu: desarrollo rápido de demos y pruebas de concepto de TTS en una lengua de bajos recursos, aprovechando la licencia MIT y el formato ONNX.
- Integración en pipelines de Python: uso de `TTSModelManager` de `phoonnx` para cargar la voz y generar WAV dentro de aplicaciones o servicios existentes.
- Investigación en TTS para lenguas de bajos recursos: base para experimentos de fine-tuning o comparación con otros modelos VITS en urdu, dado que el modelo original (`mahwizzzz/vits-ur`) está disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo compacto que probablemente cabe en CPU y en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, es plausible que funcione en GPUs de consumo e incluso en CPU, pero no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python y OVOS) con runtime ONNX; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-ur-mahwizzzz-graphemes` | VITS | urdu | no disponible | MIT | ONNX | Hugging Face |
| `mahwizzzz/vits-ur` (upstream) | VITS | urdu | no disponible | MIT | no disponible | Hugging Face |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | no disponible | según modelo | ONNX | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información pública muy escasa: 21 descargas, 0 likes y sin benchmarks ni detalles de entrenamiento; la calidad del modelo no está validada de forma independiente.
- Riesgo de alucinación y errores de pronunciación: al usar grafemas en lugar de fonemas, la pronunciación puede ser imprecisa en palabras con ortografía irregular o préstamos léxicos.
- Limitación de idioma: solo soporta urdu (`ur`); no es multilingüe.
- Sin datos sobre sesgos: no se documentan sesgos de voz, género, acento o dialecto.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia se hereda del modelo upstream (`mahwizzzz/vits-ur`); conviene verificar que el upstream mantiene efectivamente MIT.
- Caveat para producción: al ser un modelo de nicho sin métricas publicadas, se recomienda evaluar la calidad subjetiva (MOS) y la inteligibilidad antes de desplegarlo en un servicio real.
- Dependencia del ecosistema `phoonnx`/`scriptconv`/OVOS para el front-end de texto; fuera de ese stack, la integración requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ur-mahwizzzz-graphemes
- Modelo upstream: https://huggingface.co/mahwizzzz/vits-ur
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
