# Phoonnx/vits-de_de-mls-medium-espeak

## Resumen

vits-de_de-mls-medium-espeak es un modelo de síntesis de voz (text-to-speech) de la familia VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX. El modelo convierte texto en alemán (variante de-DE) en audio, tomando como entrada fonemas IPA generados por espeak-ng, y está pensado para integrarse en asistentes de voz y sistemas embebidos mediante la librería phoonnx y el ecosistema OVOS.

Se trata de un modelo acústico VITS de tamano "medium" del conjunto de voces Piper, entrenado sobre el corpus MLS (Multilingual LibriSpeech) para alemán. El repositorio ocupa aproximadamente 0,1 GB y distribuye los pesos en formato ONNX, lo que permite ejecución en CPU sin dependencias de GPU. La licencia declarada es MIT, lo que facilita su uso comercial sin restricciones adicionales.

Su relevancia actual radica en que ofrece una voz alemana de calidad razonable con un coste computacional bajo y un pipeline de fonemización bien definido, lo que lo hace adecuado para síntesis local en dispositivos con recursos limitados, asistentes domésticos y aplicaciones de lectura en voz alta que requieran privacidad y funcionamiento offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. VITS genera audio de forma directa a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. En este caso, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng, lo que exige un paso previo de fonemización en el pipeline.

El modelo procede de la voz `de_DE/mls/medium` del repositorio rhasspy/piper-voices, entrenada sobre el corpus MLS (Multilingual LibriSpeech) para alemán. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. La innovación principal del empaquetado es la conversión a ONNX y la integración con la librería phoonnx, que gestiona la normalización de texto mediante scriptconv y el fonemizador `EspeakPhonemizer`.

## Capacidades

- Síntesis de voz a partir de texto en alemán (de-DE) con salida en audio WAV.
- Fonemización mediante espeak-ng o el port espyak, con entrada en alfabeto IPA.
- Ejecución en CPU mediante ONNX, sin requerir GPU.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso en navegador a través de phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz domésticos: el modelo puede integrarse en OVOS como motor TTS para responder en alemán con baja latencia, funcionando en CPU y sin conexión a internet, lo que preserva la privacidad del usuario.
- Lectura en voz alta de documentos: dado su bajo coste computacional, puede sintetizar párrafos largos de texto alemán en aplicaciones de accesibilidad o lectores de pantalla que se ejecuten en hardware modesto.
- Sistemas de navegación y avisos por voz: adecuado para generar instrucciones habladas en alemán en dispositivos embebidos, gracias a su formato ONNX y a la ausencia de dependencias de GPU.
- Automatización de locuciones para contenidos: permite generar narraciones en alemán para vídeos, pódcast o audiolibros de forma local, sin depender de servicios en la nube.
- Prototipado de interfaces conversacionales: los desarrolladores pueden usar el modelo junto con phoonnx para validar flujos de diálogo en alemán antes de invertir en voces comerciales de mayor calidad.
- Aplicaciones educativas de aprendizaje de idiomas: el modelo puede pronunciar frases en alemán para ejercicios de escucha, aunque la calidad media del conjunto MLS limita su uso en contextos que exijan una prosodia muy natural.
- Integración en navegador: mediante phoonnx.js, puede emplearse para síntesis de voz en aplicaciones web que necesiten funcionar offline en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para ejecución en CPU mediante ONNX.
- GPU recomendadas: no necesarias; cualquier CPU moderna puede ejecutar la inferencia.
- Cabe en GPU consumer: no aplica, al no requerir GPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Requisito adicional: espeak-ng instalado en el sistema (o el extra `phoonnx[espeak]` con espyak) para la fonemización.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| vits-de_de-mls-medium-espeak (este modelo) | VITS | de-DE | ONNX | MIT | no aplica |
| Otras voces Piper de rhasspy/piper-voices (p. ej., de_DE thorsten) | VITS | de-DE y otros | ONNX | MIT (según voz) | no aplica |
| Modelos TTS comerciales en la nube (p. ej., servicios de síntesis) | no disponible | múltiples | API | propietaria | no aplica |
| Coqui TTS (modelos VITS/Tacotron) | VITS, Tacotron, etc. | múltiples | varios | MPL-2.0 / otras | no aplica |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se limita a aspectos de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Calidad de voz media: al proceder del conjunto MLS con tamano "medium", la naturalidad y prosodia son inferiores a las de voces comerciales o de mayor tamano.
- Dependencia de espeak-ng: la fonemización con espyak puede producir pronunciaciones incorrectas en algunas palabras, según advierte el autor.
- Solo alemán: no soporta otros idiomas ni cambios de voz dentro del mismo modelo.
- Riesgo de errores de pronunciación en palabras fuera de dominio, siglas, nombres propios o números no normalizados correctamente por scriptconv.
- Sesgos: no se han documentado sesgos específicos, pero al entrenarse sobre MLS (lectura de libros) puede presentar un estilo de habla formal y poco adecuado para registros coloquiales.
- Licencia MIT: permite uso comercial sin restricciones adicionales, si bien se recomienda verificar la licencia de la voz upstream en rhasspy/piper-voices.
- No apto para tareas de comprensión, razonamiento ni generación de texto; es exclusivamente un modelo TTS.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-mls-medium-espeak
- Voz upstream en rhasspy/piper-voices: https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/mls/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
