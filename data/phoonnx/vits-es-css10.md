# Phoonnx/vits-es-css10

## Resumen

vits-es-css10 es un modelo de sintesis de voz (text-to-speech) en espanol basado en la arquitectura VITS de Coqui, empaquetado en formato ONNX por Phoonnx para su uso con la libreria phoonnx. El modelo original procede del conjunto de modelos preentrenados de Coqui TTS (version 0.8.0) y fue entrenado sobre el corpus CSS10, un dataset multilingue de audio de dominio publico con un unico hablante por idioma. Phoonnx se limita a convertir los pesos originales a ONNX y a integrarlos en su ecosistema de voces, de modo que puedan ejecutarse en Python y en el asistente de voz OVOS.

La relevancia de este modelo es practica: ofrece sintesis de voz en espanol de forma local, sin dependencia de servicios en la nube, con un peso de repositorio de aproximadamente 0,1 GB y licencia BSD-3-Clause, lo que facilita su integracion en productos comerciales. Al estar en ONNX, puede ejecutarse sobre CPU sin GPU dedicada, lo que lo hace adecuado para dispositivos de borde, asistentes domesticos y aplicaciones de escritorio.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto (no aplica en TTS) ni resultados de benchmarks en la informacion proporcionada. La model card es escueta y se centra en el uso mediante phoonnx, no en las caracteristicas internas del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | espanol (es) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (GraphemePhonemizer de scriptconv) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis neuronal end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial para generar waveform directamente a partir del texto. Emplea un decoder de tipo HiFi-GAN para la generacion de audio y entrenamiento adversarial con perdidas de reconstruccion y de alineamiento monotono. Esta arquitectura es la utilizada por Coqui TTS en su version 0.8.0.

El modelo fue entrenado por Coqui sobre el corpus CSS10, un dataset de audio de dominio publico que recopila grabaciones de un unico hablante por idioma a partir de libros leidos de LibriVox. La model card no detalla el numero de horas de audio, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o fine-tuning adicionales. Phoonnx no reentrena el modelo: solo exporta los pesos originales a ONNX y los empaqueta para su distribucion.

## Capacidades

- Sintesis de voz (text-to-speech) en espanol a partir de texto plano.
- Conversion de grafemas a entrada del modelo mediante `GraphemePhonemizer` de scriptconv, con normalizacion de texto previa.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada al espanol.

## Casos de uso

- Asistentes de voz locales: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo permite dotar de voz en espanol a un asistente domestico sin enviar texto a servicios externos, lo que reduce latencia y preserva la privacidad.
- Lectura de textos y articulos: dado que el modelo acepta texto plano y lo normaliza con scriptconv, puede emplearse para convertir articulos, correos o documentacion en audio para consumo pasivo.
- Accesibilidad: sintesis de voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual, ejecutandose en el propio dispositivo sin conexion.
- Sistemas de anuncios y notificaciones: generacion de mensajes hablados en aplicaciones de escritorio, paneles de control o dispositivos IoT que requieran avisos en espanol con bajo consumo de recursos.
- Prototipado de interfaces conversacionales: al ser un modelo ligero (~0,1 GB) y ejecutable en CPU, sirve para validar flujos de voz en fases tempranas de desarrollo sin invertir en infraestructura de GPU.
- Educacion y aprendizaje de idiomas: reproduccion de frases en espanol para ejercicios de pronunciacion o dictado, con la ventaja de que el modelo es de dominio publico y licencia permisiva.
- Generacion de audiolibros o podcast de bajo coste: para contenidos de un unico hablante y calidad aceptable, el modelo permite sintetizar texto largo por fragmentos y ensamblar el audio resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de ~0,1 GB, es previsible que quepa en memoria RAM de cualquier equipo moderno, pero no se documentan cifras oficiales.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no documentada; por tamano, es probable que quepa en cualquier GPU consumer, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python) y OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Parametros | Contexto |
|---|---|---|---|---|---|---|
| Phoonnx/vits-es-css10 | VITS (Coqui) | es | BSD-3-Clause | ONNX | no disponible | no aplica |
| Coqui TTS es-css10-vits (original) | VITS (Coqui) | es | BSD-3-Clause | PyTorch | no disponible | no aplica |
| Otros modelos VITS de Phoonnx | VITS (Coqui) | varios | BSD-3-Clause | ONNX | no disponible | no aplica |

La comparativa se limita al modelo original de Coqui, del que este deriva, y a otras voces VITS empaquetadas por Phoonnx en su coleccion. No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo con alternativas como Piper, XTTS o Bark.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre CSS10, con un unico hablante de dominio publico, la voz resultante tiene un timbre y estilo muy concretos; no representa la diversidad de acentos ni de hablantes del espanol.
- Riesgo de alucinacion: en TTS el fenomeno se manifiesta como pronunciaciones erroneas, omisiones o artefactos acusticos en palabras fuera del vocabulario o en textos con simbolos, cifras o abreviaturas no normalizadas correctamente.
- Limitaciones de contexto o idioma: el modelo solo soporta espanol; el texto se procesa a nivel de caracteres, sin modelado de contexto largo, por lo que frases muy largas pueden degradar la prosodia.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificacion con atribucion y sin endorsement; conviene conservar el aviso de copyright original de Coqui.
- Caveats para produccion: la model card no documenta calidad subjetiva (MOS), latencia ni estabilidad; el modelo esta empaquetado para phoonnx, por lo que su uso fuera de esa libreria requiere exportar o adaptar los pesos ONNX manualmente.
- El repositorio tiene muy pocas descargas (27) y ningun like, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es-css10
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Modelo original de Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--es--css10--vits.zip
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
