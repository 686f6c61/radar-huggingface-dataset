# Phoonnx/vits-en_us-elise

## Resumen

vits-en_us-elise es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por redromnon y empaquetado por Phoonnx para su libreria de inferencia ONNX llamada phoonnx. El modelo genera audio a partir de texto en ingles estadounidense (en-US), tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su proposito es ofrecer una voz TTS ligera y ejecutable en local dentro del ecosistema phoonnx y OVOS (Open Voice OS).

El modelo deriva del release upstream redromnon/piper-tts-elise, lo que lo situa en la familia de voces compatibles con Piper, un formato ampliamente adoptado para TTS embebido y de bajos requisitos. Al estar empaquetado en ONNX y con un repositorio de apenas 0,1 GB, esta pensado para despliegues con recursos limitados, como asistentes de voz en dispositivos de borde, sistemas domoticos o aplicaciones de escritorio.

La relevancia actual del modelo es acotada: se trata de una voz concreta dentro de una coleccion mas amplia de modelos VITS empaquetados para phoonnx, con 30 descargas y sin likes en el momento de la consulta. No compite en capacidades generales con modelos TTS neuronales de gran escala, sino que cubre el nicho de sintesis de voz offline, determinista y de baja latencia para un unico idioma y una unica voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto largo como un LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | ingles estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original | redromnon (upstream: redromnon/piper-tts-elise) |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto condicionado por alineamiento monotono, un decoder generativo basado en flujos normales y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. Este diseno permite generar audio de forma directa desde fonemas sin necesidad de un modelo acustico y un vocoder separados, lo que reduce la latencia y simplifica el despliegue. El modelo empaquetado se distribuye en formato ONNX, lo que facilita su ejecucion con runtimes de inferencia estandar sin dependencias de frameworks de entrenamiento.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de origen ni si se aplicaron tecnicas de RLHF o ajuste fino especifico. El modelo card unicamente indica que la voz proviene de redromnon/piper-tts-elise y que la entrada de texto se procesa mediante espeak-ng, cuyos fonemas se normalizan y convierten con la libreria scriptconv antes de alimentar el modelo. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US), con salida en formato WAV.
- Generacion de audio a partir de fonemas IPA producidos por espeak-ng.
- Integracion con la libreria phoonnx mediante TTSModelManager y la voz `piper_community/redromnon/en-US_elise`.
- Soporte en OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js, con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni vision.
- Capacidad multilingue limitada a un unico idioma (en-US).
- No dispone de modo thinking ni de procesamiento de audio de entrada.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente domestico sintetice respuestas en ingles sin conexion a servicios en la nube, gracias a su formato ONNX y su tamano reducido.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: con 0,1 GB de repositorio, la voz puede empaquetarse dentro de una aplicacion de escritorio y generar avisos hablados en local sin dependencias externas.
- Sistemas de borde y dispositivos embebidos: la inferencia ONNX de VITS es adecuada para hardware con recursos limitados, como Raspberry Pi o dispositivos similares, donde un TTS en la nube no es viable por latencia o conectividad.
- Accesibilidad para personas con discapacidad visual: la voz puede leer en voz alta contenido de pantalla o documentos en ingles estadounidense dentro de lectores de pantalla que acepten voces Piper o phoonnx.
- Demos web de sintesis de voz: mediante phoonnx.js, la voz puede ejecutarse en el navegador con entrada espeak o unicode, lo que permite prototipos interactivos de TTS sin backend.
- Pruebas y desarrollo de pipelines TTS: al ser una voz Piper empaquetada, sirve como referencia para validar integraciones de phoonnx y scriptconv antes de desplegar voces adicionales de la coleccion VITS.
- Generacion de audiolibros o contenido narrado de dominio publico en ingles: para textos largos, el modelo sintetiza frase a frase, aunque requiere segmentacion previa del texto y no dispone de control de prosodia avanzado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la arquitectura VITS, la huella de memoria es reducida y compatible con CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de VITS, puede ejecutarse en CPU y en GPU de gama baja sin requisitos documentados.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no se documentan requisitos minimos concretos.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador) y el plugin OVOS `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.
- Dependencia adicional: es necesario instalar espeak-ng (por ejemplo, `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak; este ultimo puede producir diferencias foneticas y errores de pronunciacion en algunas palabras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_us-elise (Phoonnx) | VITS | en-US | ONNX | MIT | Hugging Face, phoonnx, OVOS |
| redromnon/piper-tts-elise | VITS (Piper) | en-US | Piper | no disponible en la informacion | Hugging Face (upstream) |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | ONNX | MIT (segun coleccion) | Hugging Face, phoonnx |

No se dispone de datos de rendimiento comparado (MOS, WER, latencia) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-idioma: unicamente soporta ingles estadounidense (en-US); no es adecuado para otros idiomas.
- Voz unica: no permite seleccion de hablante ni control de estilo o emocion.
- Dependencia de espeak-ng: la calidad de la sintesis depende de la fonemizacion; el uso del port espyak puede provocar pronunciaciones incorrectas en algunas palabras.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser una voz entrenada sobre un hablante concreto, puede reflejar caracteristicas del habla de ese hablante.
- Riesgo de alucinacion: no aplica en el sentido de un LLM, pero la sintesis puede producir artefactos o pronunciaciones erroneas ante texto no normalizado o fuera de dominio.
- Licencia MIT: permite uso comercial segun los terminos de la licencia, aunque el model card remite a las condiciones del release upstream, que no se detallan en la informacion disponible.
- Sin benchmarks publicados: no hay metricas objetivas de calidad (MOS) ni de inteligibilidad (WER) que permitan evaluar su rendimiento frente a alternativas.
- Poca adopcion: 30 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-elise
- Modelo upstream: https://huggingface.co/redromnon/piper-tts-elise
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
