# Phoonnx/vits-en_us-cmu_arctic-low-gruut

## Resumen

vits-en_us-cmu_arctic-low-gruut es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su sistema de voces Mimic 3 y empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo toma como entrada texto en inglés estadounidense, lo convierte a fonemas IPA mediante el fonemizador gruut y genera audio sintetizado. Con un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para despliegue ligero, típicamente en asistentes de voz y entornos embebidos.

La relevancia de este modelo radica en su integración con el ecosistema OVOS (Open Voice OS) y su empaquetado para inferencia ONNX, lo que facilita su ejecución sin depender de frameworks de deep learning pesados. La voz concreta es la variante "low" del corpus CMU Arctic, una de las voces de referencia de Mimic 3, lo que la hace adecuada para prototipos y aplicaciones donde el tamaño y la latencia importan más que la naturalidad máxima. La licencia CC-BY-SA-4.0 permite uso comercial con atribución y obligación de compartir bajo la misma licencia.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento en la documentación proporcionada. El modelo está orientado exclusivamente a la síntesis de voz en inglés estadounidense y no soporta otras tareas generativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada de texto por frase) |
| Tipos de cuantización | no disponible (pesos ONNX empaquetados; cuantización no especificada) |
| Idiomas soportados | inglés estadounidense (en-US) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut (alfabeto IPA) |
| Tamaño del repositorio | 0,1 GB |
| Librería | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un predictor de duración, un flujo normalizador y un decodificador basado en HiFi-GAN para producir audio directamente a partir de fonemas. VITS es conocida por generar audio de forma no autorregresiva en una sola pasada, lo que reduce la latencia frente a arquitecturas de dos etapas (Tacotron + vocoder). La entrada no es texto crudo, sino fonemas IPA generados por el fonemizador gruut a través de la librería scriptconv.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card indica únicamente que el modelo procede del repositorio mimic3-voices de Mycroft AI, en la ruta de la voz en_US/cmu-arctic_low, y que el autor original es Mycroft AI. El corpus CMU Arctic es un conjunto de datos de referencia para síntesis de voz en inglés, pero no se detalla el proceso de entrenamiento en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en inglés estadounidense.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut (scriptconv).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución mediante inferencia ONNX, sin necesidad de frameworks de deep learning pesados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio de entrada).
- No es un modelo multilingüe: solo inglés estadounidense.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin de TTS en Open Voice OS configurando `ovos-tts-plugin-phoonnx` en `mycroft.conf`, lo que permite respuestas habladas en inglés en asistentes domésticos.
- Prototipado rápido de TTS: al ser un modelo ONNX de 0,1 GB, se puede desplegar en entornos de desarrollo sin GPU para validar flujos de síntesis de voz antes de escalar a modelos mayores.
- Aplicaciones embebidas y de bajo consumo: la variante "low" del corpus CMU Arctic y el formato ONNX lo hacen adecuado para dispositivos con recursos limitados donde se requiere síntesis local sin conexión.
- Generación de audiolibros o contenido pregrabado en inglés: se puede usar para convertir texto en audio WAV de forma por lotes mediante la API de phoonnx.
- Sistemas de accesibilidad: lectura en voz alta de texto en inglés para aplicaciones de asistencia a personas con discapacidad visual, ejecutándose localmente.
- Pruebas de integración en pipelines de TTS: sirve como voz de referencia para comparar latencia y calidad frente a otras voces VITS del catálogo de Phoonnx antes de elegir una voz de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de 0,1 GB, es probable que quepa en CPU y en GPUs de gama baja, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio sugiere que podría ejecutarse en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; inferencia ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| vits-en_us-cmu_arctic-low-gruut | VITS | en-US | CC-BY-SA-4.0 | ONNX | 0,1 GB |
| Otras voces VITS de la colección Phoonnx | VITS | variable | variable | ONNX | no disponible |
| Modelos TTS de Mimic 3 (upstream) | VITS | en-US y otros | CC-BY-SA-4.0 | variable | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Es un modelo exclusivamente de síntesis de voz: no genera texto, no razona, no soporta tool calling ni agentes.
- No se dispone de información sobre sesgos del corpus de entrenamiento ni sobre la calidad de la voz en dominios específicos.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario o en nombres propios, dado que la entrada depende del fonemizador gruut.
- La licencia CC-BY-SA-4.0 exige atribución y que las obras derivadas se compartan bajo la misma licencia; es importante revisar las implicaciones para uso comercial y para la distribución de audio generado.
- No se han publicado benchmarks ni métricas objetivas de calidad (MOS, WER) en la información disponible.
- El modelo se distribuye como pesos ONNX empaquetados; no se detallan los tipos de cuantización ni el proceso de exportación.
- La fecha de creación del repositorio (2026-11-14) y el bajo número de descargas (16) indican que es un modelo reciente y con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-cmu_arctic-low-gruut
- Repositorio upstream (Mycroft AI mimic3-voices): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/en_US/cmu-arctic_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
