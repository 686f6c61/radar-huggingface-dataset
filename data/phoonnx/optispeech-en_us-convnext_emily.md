# Phoonnx/optispeech-en_us-convnext_emily

## Resumen

optispeech-en_us-convnext_emily es un modelo de síntesis de voz (text-to-speech) en inglés estadounidense, empaquetado por Phoonnx a partir del modelo original de mush42 (OptiSpeech, variante ConvNeXt-TTS para en-US). El modelo se distribuye en formato ONNX y está pensado para ejecutarse mediante la librería phoonnx, que actúa como runtime de inferencia y capa de integración con el ecosistema OVOS (Open Voice OS). No se trata de un modelo de lenguaje generativo, sino de un sistema TTS acústico que convierte fonemas en audio.

La relevancia de este paquete es eminentemente práctica: toma un modelo upstream ya entrenado y lo publica con un formato y una interfaz listos para producción ligera (ONNX, sin dependencia de PyTorch en inferencia), con un front-end textual basado en espeak-ng y la librería scriptconv para normalización y fonemización. El repositorio ocupa aproximadamente 0,1 GB, lo que lo sitúa en el rango de modelos TTS pequeños y desplegables en CPU.

La información disponible sobre arquitectura interna, número de parámetros, datos de entrenamiento y métricas de calidad es muy limitada: la model card se centra en el uso y el empaquetado, no en los detalles técnicos del entrenamiento. Esta ficha refleja únicamente lo que puede verificarse en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OptiSpeech (variante ConvNeXt-TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamaño del repositorio | ~0,1 GB |
| Runtime / librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo pertenece a la familia OptiSpeech, en su variante denominada ConvNeXt-TTS, según la model card. La información proporcionada no detalla la topología interna (capas, dimensiones, mecanismos de atención o decodificación), el número de parámetros ni el volumen o composición de los datos de entrenamiento. Tampoco se documenta si hubo etapas de ajuste fino con preferencias humanas, ya que en TTS ese tipo de etapas no es el estándar habitual.

Lo que sí está documentado es el pipeline de inferencia: el texto se normaliza y convierte a fonemas IPA mediante espeak-ng (a través de scriptconv), y esos fonemas alimentan el modelo ONNX que genera la forma de onda. El paquete de Phoonnx actúa como capa de empaquetado y ejecución, no como un reentrenamiento del modelo original. Cualquier innovación técnica concreta del entrenamiento upstream (por ejemplo, diseño del decoder acústico o del vocoder) no está descrita en la información disponible.

## Capacidades

- Síntesis de voz en inglés estadounidense (en-US) a partir de texto plano.
- Fonemización mediante espeak-ng con alfabeto IPA como paso previo a la síntesis.
- Ejecución en formato ONNX, sin requerir PyTorch en tiempo de inferencia.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Generación de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Normalización y conversión de texto mediante la librería scriptconv.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multi-hablante ni multilingüismo más allá del inglés estadounidense.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Asistentes de voz domésticos con OVOS: el modelo se integra como módulo TTS en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx`, lo que permite dotar de voz a un asistente local sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o domótica: al ejecutarse en ONNX y ocupar ~0,1 GB, puede sintetizar mensajes cortos en local con baja huella de recursos.
- Accesibilidad para personas con discapacidad visual: conversión de texto de pantalla a voz en inglés estadounidense, con un pipeline reproducible y de licencia permisiva.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en inglés antes de invertir en modelos TTS comerciales, gracias a la licencia MIT y a la ausencia de costes por token.
- Generación de locuciones para contenido educativo o demos: síntesis por lotes de frases en en-US a archivos WAV usando la API de Python de phoonnx.
- Pruebas de integración en pipelines de CI: al ser un artefacto ONNX pequeño y determinista, puede incorporarse a tests automatizados que verifiquen la generación de audio sin depender de GPUs.
- Sistemas embebidos o de borde con recursos limitados: el tamaño reducido del repositorio y el runtime ONNX facilitan el despliegue en dispositivos con poca memoria, siempre que se disponga de espeak-ng o del extra `phoonnx[espeak]`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de síntesis (MOS, MCD, WER de ASR sobre el audio generado) ni comparativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) y el uso de ONNX, es plausible su ejecución en CPU, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponibles. No se especifica ningún requisito de GPU.
- Compatibilidad con GPU de consumo: no documentada; el formato ONNX sugiere que puede ejecutarse con ONNX Runtime en CPU o GPU, pero el autor no lo confirma.
- Opciones de despliegue: phoonnx (runtime principal), ONNX Runtime como backend subyacente, y el plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Dependencias del sistema: espeak-ng (o el extra `phoonnx[espeak]` que incluye espyak).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La propia colección de OptiSpeech para phoonnx incluye otras variantes y voces, pero sus especificaciones no se detallan en esta ficha. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| optispeech-en_us-convnext_emily | no disponible | no aplica | no disponible | MIT | Hugging Face (Phoonnx) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no se documenta cobertura multilingüe.
- La fonemización depende de espeak-ng; si se usa espyak en su lugar, el autor advierte que algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se documentan sesgos específicos, pero al ser un modelo TTS entrenado con datos no descritos, pueden existir sesgos de pronunciación o prosodia no caracterizados.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí puede producir pronunciaciones incorrectas o prosodia antinatural en textos fuera de dominio.
- No hay información sobre calidad subjetiva (MOS) ni sobre robustez ante números, siglas, nombres propios o texto no normalizado.
- La licencia MIT del upstream se declara en la model card de mush42/optispeech; conviene verificar dicha declaración en el repositorio original antes de un uso comercial.
- El número de descargas (29) y de likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.
- El paquete se instala con `pip install --pre phoonnx`, es decir, es una versión preliminar de la librería; la estabilidad de la API no está garantizada.
- No se documentan variantes cuantizadas ni requisitos mínimos de memoria, lo que dificulta planificar el despliegue en hardware concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/optispeech-en_us-convnext_emily
- Modelo upstream (mush42/optispeech, ONNX convnext-tts en-US): https://huggingface.co/mush42/optispeech/tree/main/onnx/convnext-tts/en-us
- Colección OptiSpeech para phoonnx: https://huggingface.co/collections/Phoonnx/optispeech-6af8ea9492a4f8f4e0f1cf30
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
