# Phoonnx/vits-en_us-libritts_r-medium-espeak

## Resumen

`Phoonnx/vits-en_us-libritts_r-medium-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con su libreria de TTS. El modelo original procede de Rhasspy, concretamente de la voz `en_US/libritts_r/medium` del proyecto Piper, un ecosistema consolidado de voces TTS ligeras orientadas a asistentes de voz y dispositivos de recursos limitados.

El modelo resuelve el problema de convertir texto en ingles estadounidense a audio inteligible con una huella de almacenamiento minima (el repositorio completo ocupa aproximadamente 0,1 GB) y sin dependencia de GPUs. La entrada no es texto plano directo, sino fonemas IPA generados mediante espeak-ng, lo que requiere un front-end de fonemizacion antes de la inferencia.

Es relevante para desarrolladores que necesitan integrar sintesis de voz local en asistentes (especialmente en el ecosistema OVOS/Mycroft), aplicaciones de accesibilidad o pipelines de generacion de audio por lotes, donde el coste computacional y la latencia importan mas que la expresividad de un modelo neuronal de gran tamano. Su licencia MIT facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | aproximadamente 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de dominio temporal y espectral. El resultado es un modelo que genera waveforms directamente desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

En este caso, el modelo no ha sido entrenado por Phoonnx: es un empaquetado del checkpoint `en_US/libritts_r/medium` de `rhasspy/piper-voices`, entrenado originalmente sobre el corpus LibriTTS-R (una version restaurada y mejorada de LibriTTS, derivada de audiolibros de LibriVox). No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card no lo documenta. La innovacion principal del empaquetado es la conversion a ONNX y la integracion con el front-end de fonemizacion `scriptconv` mediante `EspeakPhonemizer`, que normaliza el texto y lo convierte a fonemas IPA compatibles con el modelo.

## Capacidades

- Sintesis de voz en ingles estadounidense a partir de texto, con salida en formato WAV.
- Conversion texto-a-fonemas mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Generacion de audio de un solo hablante (voz `en_US-libritts_r-medium`).
- Ejecucion en CPU sin GPU, gracias a los pesos ONNX.
- Integracion con el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador a traves de `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas sin depender de servicios en la nube, con una huella de 0,1 GB adecuada para Raspberry Pi y dispositivos similares.
- Lectura de notificaciones y alertas en sistemas embebidos: al ejecutarse en CPU con ONNX, puede sintetizar mensajes cortos en tiempo real dentro de un daemon ligero sin competir por recursos de GPU.
- Accesibilidad web: integrado mediante `phoonnx.js`, permite leer contenido de paginas en el navegador con una demo publica disponible, sin enviar texto a servidores externos.
- Generacion por lotes de audiolibros o podcasts de prueba: la sintesis de frases en `en-US` permite producir material de audio para pruebas de calidad, prototipos de interfaces conversacionales o datasets sinteticos de voz.
- Pruebas de regresion en pipelines de TTS: al ser un checkpoint fijo y deterministico en su empaquetado, sirve como referencia para validar cambios en el front-end de fonemizacion (`scriptconv`) o en la capa de inferencia.
- Sistemas de anuncios publicos o kioscos interactivos: la salida WAV permite reproducir avisos pregrabados dinamicamente en entornos con conectividad limitada, donde un modelo TTS en la nube no es viable.
- Educacion y aprendizaje de pronunciacion: al usar fonemas IPA como entrada, puede emplearse para generar ejemplos de pronunciacion controlada en ingles estadounidense.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecucion en CPU con ONNX Runtime.
- GPU recomendadas: no disponibles; no se documenta soporte GPU especifico.
- Cabe en cualquier GPU consumer, pero no es necesario: el repositorio ocupa aproximadamente 0,1 GB, por lo que el modelo es viable en dispositivos de baja capacidad (Raspberry Pi, mini-PC, moviles).
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, `phoonnx.js` en navegador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Requisito adicional: espeak-ng instalado en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `Phoonnx/vits-en_us-libritts_r-medium-espeak` | VITS | no disponible | en-US | MIT | ONNX |
| `rhasspy/piper-voices` (en_US/libritts_r/medium) | VITS | no disponible | en-US | MIT | ONNX (upstream) |
| Otros modelos VITS de la coleccion Phoonnx | VITS | no disponible | segun voz | MIT (segun voz) | ONNX |

La comparativa con alternativas de otros ecosistemas (por ejemplo, modelos TTS neuronales de mayor tamano como XTTS o Bark) no esta disponible en la informacion proporcionada, y no se han documentado metricas de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense; no es multilingue.
- Requiere un front-end de fonemizacion (espeak-ng) antes de la inferencia; sin el, el modelo no puede procesar texto directamente.
- El uso del port espyak en lugar de espeak-ng puede provocar errores de pronunciacion en algunas palabras, segun advierte el autor.
- Al ser un modelo TTS, no razona, no sigue instrucciones complejas ni soporta tool calling; no debe confundirse con un LLM.
- No se dispone de informacion sobre sesgos del dataset LibriTTS-R (predominantemente audiolibros en ingles) ni sobre su comportamiento con acentos no estadounidenses, nombres propios o terminologia tecnica.
- Riesgo de alucinacion en el sentido de pronunciacion incorrecta de palabras fuera del vocabulario o de fonemas mal generados por el fonemizador.
- La licencia MIT permite uso comercial, pero conviene verificar la procedencia del dataset upstream (LibriTTS-R) si se requiere trazabilidad completa.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica ausencia de validacion comunitaria; conviene probarlo exhaustivamente antes de usarlo en produccion.
- No se documentan limites de longitud de texto de entrada; textos largos pueden requerir troceado manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-libritts_r-medium-espeak
- Upstream (Rhasspy Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/libritts_r/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
