# Phoonnx/mosstts-multi-openmoss_team-nano_100m

## Resumen

`mosstts-multi-openmoss_team-nano_100m` es un paquete de inferencia del modelo de síntesis de voz MOSS-TTS-Nano-100M, desarrollado originalmente por OpenMOSS y redistribuido por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. No se trata de un modelo de lenguaje generativo, sino de un sistema text-to-speech (TTS) de aproximadamente 100 millones de parámetros que convierte texto en audio en 19 idiomas, incluido el castellano.

El valor del paquete reside en su empaquetado: Phoonnx toma el modelo upstream de OpenMOSS, lo convierte a ONNX y lo integra en un ecosistema Python y OVOS (Open Voice OS) con voces preconfiguradas por idioma. Esto permite desplegar TTS multilingüe en entornos locales sin depender de servicios en la nube, algo relevante para asistentes de voz, sistemas de accesibilidad y aplicaciones de borde.

La ficha describe un modelo pequeño y ligero (repo de 0,8 GB, pesos ONNX) pensado para inferencia en CPU o GPU modesta. La información pública disponible es limitada: la model card no detalla arquitectura interna, datos de entrenamiento ni métricas de calidad, por lo que varios apartados técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MOSS-TTS (arquitectura TTS de OpenMOSS; detalles internos no disponibles) |
| Parametros totales | ~100M (según el nombre del modelo upstream) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo ocupa 0,8 GB) |
| Idiomas soportados | ar, cs, da, de, el, en, es, fa, fr, hu, it, ja, ko, pl, pt, ru, sv, tr, zh (19 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo upstream es MOSS-TTS-Nano-100M, un sistema de síntesis de voz de OpenMOSS con aproximadamente 100 millones de parámetros. La model card de este paquete no documenta la arquitectura interna (tipo de encoder de texto, decoder acústico, vocoder o mecanismo de generación), ni el volumen o composición de los datos de entrenamiento, ni si se emplearon técnicas de alineamiento, RLHF o ajuste fino supervisado. Toda esa información debe consultarse en la model card del modelo original de OpenMOSS.

La innovación del paquete de Phoonnx es de ingeniería más que de modelado: la conversión a ONNX (realizada por OpenMOSS en `MOSS-TTS-Nano-100M-ONNX`) y su integración en la librería `phoonnx`, que gestiona la carga de voces por idioma, el front-end de texto mediante `scriptconv` y la síntesis a WAV. El front-end utiliza un `UnicodeCodepointPhonemizer` que normaliza el texto y lo convierte en puntos de código Unicode como entrada del modelo, en lugar de un fonemizador lingüístico específico por idioma.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto Unicode en 19 idiomas, incluidos castellano, inglés, francés, alemán, italiano, portugués, ruso, árabe, chino, japonés y coreano.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Selección de voz por idioma a través de identificadores como `mosstts/nano/es` o `mosstts/nano/en`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable mediante `mycroft.conf`.
- Ejecución local con pesos ONNX, sin dependencia de API externa.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, prosodia avanzada, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `mosstts/nano/es` en `mycroft.conf`, permitiendo respuestas habladas en castellano sin conexión a internet.
- Sistemas de accesibilidad: lectura de texto a voz en aplicaciones de escritorio o web para personas con discapacidad visual, aprovechando el tamaño reducido del modelo (repo de 0,8 GB) para su inclusión en instalaciones locales.
- Automatización de contenidos multilingües: generación de locuciones para vídeos, pódcast o audiolibros en cualquiera de los 19 idiomas soportados mediante un script Python que recorra las voces `mosstts/nano/<idioma>`.
- Notificaciones y alertas por voz en dispositivos de borde: integración en sistemas embebidos o Raspberry Pi con inferencia ONNX en CPU, gracias al bajo coste computacional de un modelo de ~100M de parámetros.
- Prototipado rápido de interfaces conversacionales: uso de la API de `phoonnx` para generar audio de prueba en pipelines de desarrollo de chatbots o IVR antes de invertir en un TTS comercial.
- Investigación en TTS multilingüe: comparación de la calidad de un modelo pequeño (100M) frente a alternativas mayores en 19 idiomas, sirviendo como línea base reproducible en formato ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete no incluye métricas objetivas (MOS, WER, RTF) ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño del repo (0,8 GB en ONNX) y los ~100M de parámetros, la inferencia cabe holgadamente en menos de 2 GB de memoria en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo está pensado para ejecutarse también en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU y CPU.
- Opciones de despliegue: `phoonnx` (Python) con runtime ONNX; integración en OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mosstts-multi-openmoss_team-nano_100m (este) | ~100M | 19 | ONNX | Apache 2.0 | Hugging Face (Phoonnx) |
| MOSS-TTS-Nano-100M (upstream) | ~100M | 19 | no disponible en esta ficha | Apache 2.0 | Hugging Face (OpenMOSS-Team) |
| MOSS-TTS-Nano-100M-ONNX | ~100M | 19 | ONNX | Apache 2.0 | Hugging Face (OpenMOSS-Team) |
| Otros TTS pequeños (p. ej. Piper, Coqui) | no disponible | variable | ONNX / otros | variable | no disponible en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos lingüísticos, acústicos ni demográficos; no puede descartarse que la calidad varíe notablemente entre los 19 idiomas.
- Riesgo de pronunciación incorrecta en palabras fuera de vocabulario, nombres propios, siglas o texto con formatos especiales, dado que el front-end usa puntos de código Unicode en lugar de un fonemizador específico.
- No se documentan límites de longitud de texto por inferencia; textos largos podrían requerir segmentación manual.
- La calidad de síntesis de un modelo de ~100M de parámetros es previsiblemente inferior a la de sistemas TTS de mayor tamaño, aunque no se aportan métricas que lo confirmen.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo upstream de OpenMOSS antes de producción.
- El paquete registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Dependencia de la librería `phoonnx` en versión preliminar (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/mosstts-multi-openmoss_team-nano_100m
- Modelo upstream: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M
- Conversión ONNX upstream: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Nano-100M-ONNX
- Colección MOSS-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/moss-tts-6af8ecba663438f590ae4f4e
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
