# Phoonnx/matcha-gl_es-icia_extended_phonemes-cotovia

## Resumen

`matcha-gl_es-icia_extended_phonemes-cotovia` es un modelo de sintesis de voz (text-to-speech) en gallego, empaquetado en formato ONNX por Phoonnx a partir del modelo original de Proxecto Nos (`proxectonos/Nos_TTS-icia-extended-matcha-phonemes`). El modelo resuelve la conversion de texto a audio en gallego de Espana (`gl-ES`) y esta pensado para integrarse en la libreria de inferencia phoonnx, que lo ejecuta tanto en Python como dentro del ecosistema de asistentes de voz OVOS.

La arquitectura es Matcha-TTS, un modelo de sintesis neuronal no autorregresivo basado en flow matching que genera mel-espectrogramas a partir de fonemas, acoplado a un vocoder para producir la forma de onda final. El modelo no recibe texto crudo directamente: phoonnx delega la normalizacion y la fonemizacion en la libreria scriptconv, que aplica el fonemizador `CotoviaPhonemizer` para el gallego y entrega al modelo una secuencia de fonemas en el alfabeto Cotovia.

El paquete tiene un tamano de repositorio de 0,1 GB, licencia Apache 2.0 y un unico idioma declarado (`gl`). Es relevante para proyectos que necesitan TTS de calidad en gallego con despliegue ligero en ONNX, sin depender de frameworks de deep learning completos en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (flow matching no autorregresivo sobre mel-espectrogramas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | gallego (`gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Matcha-TTS es un modelo de sintesis de voz condicionado por fonemas que emplea flow matching para generar mel-espectrogramas de forma no autorregresiva, lo que reduce la latencia frente a aproximaciones autorregresivas como Tacotron. El modelo empaquetado en este repositorio es una exportacion a ONNX del checkpoint original de Proxecto Nos, y su entrada no es texto sino la secuencia de fonemas producida por el fonemizador Cotovia de scriptconv. La cadena completa de inferencia es: texto en gallego, normalizacion y fonemizacion con `CotoviaPhonemizer`, generacion del mel-espectrograma con Matcha-TTS y sintesis de la forma de onda con el vocoder asociado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni detalles del vocoder en la informacion proporcionada. El modelo upstream pertenece a Proxecto Nos y se distribuye con licencia Apache 2.0 segun la model card del repositorio original.

## Capacidades

- Sintesis de voz en gallego (`gl-ES`) a partir de texto.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemizacion integrada para gallego mediante `CotoviaPhonemizer` (extra `scriptconv[gl]`).
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion sobre runtime ONNX, sin necesidad de PyTorch en produccion.
- Entrada basada en fonemas Cotovia, lo que permite control fino de la pronunciacion si se construye la secuencia de fonemas manualmente.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingueismo ni tool calling.

## Casos de uso

- Asistentes de voz en gallego con OVOS: el modelo se selecciona como modulo TTS en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx`, de modo que un asistente domestico puede responder en gallego sin infraestructura adicional.
- Lectura de contenido web o documentos en gallego: integrado en un pipeline de extraccion de texto y llamada a `synthesize_wav`, permite generar audiolibros o versiones habladas de articulos y documentacion.
- Accesibilidad para personas con discapacidad visual: al ejecutarse sobre ONNX con un repositorio de 0,1 GB, puede desplegarse en equipos modestos y ofrecer lectura de pantalla en gallego con baja huella de recursos.
- Locucion automatica de avisos y megafonia: la inferencia por frase y el formato ONNX facilitan generar avisos pregrabados o dinamicos en estaciones, comercios o edificios publicos.
- Prototipado de interfaces conversacionales en gallego: desarrolladores que necesitan una voz para probar un flujo de dialogo pueden cargar el modelo con `TTSModelManager` y obtener audio en pocas lineas de codigo.
- Generacion de material didactico en gallego: centros educativos o plataformas de e-learning pueden sintetizar lecciones y ejercicios con pronunciacion controlada mediante fonemas Cotovia.
- Integracion en pipelines de CI para pruebas de regresion de audio: al ser un artefacto ONNX pequeno, encaja en tests automatizados que verifican que el texto se convierte en audio sin errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es reducida y compatible con CPU.
- GPU recomendadas: no se especifican; al ejecutarse sobre ONNX Runtime puede usar CPU o GPU sin requisitos documentados.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del artefacto, aunque no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y runtime ONNX Runtime subyacente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto / entrada |
|---|---|---|---|---|---|
| matcha-gl_es-icia_extended_phonemes-cotovia (este modelo) | gallego (`gl-ES`) | Matcha-TTS | ONNX | Apache 2.0 | Fonemas Cotovia |
| proxectonos/Nos_TTS-icia-extended-matcha-phonemes | gallego (`gl-ES`) | Matcha-TTS | no disponible | Apache 2.0 | no disponible |
| Otros modelos de la coleccion Matcha-TTS de Phoonnx | varios | Matcha-TTS | ONNX | variable | fonemas del idioma correspondiente |

No se dispone de datos de rendimiento comparado con alternativas de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta gallego (`gl-ES`); no es multilingue.
- La entrada debe ser una secuencia de fonemas Cotovia; el texto crudo requiere pasar por scriptconv con el extra `scriptconv[gl]`.
- No se documentan sesgos, tasas de alucinacion ni comportamiento en dominios especializados (medico, legal, nombres propios).
- No hay informacion sobre calidad en frases largas, puntuacion o numeros; el rendimiento en esos casos es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero se hereda de la declaracion del modelo upstream, no de una verificacion independiente del empaquetado.
- El modelo tiene 21 descargas y 0 likes, por lo que su validacion por la comunidad es practicamente nula.
- No se especifican requisitos de version de ONNX Runtime ni de phoonnx; conviene fijar versiones en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-gl_es-icia_extended_phonemes-cotovia
- Modelo upstream: https://huggingface.co/proxectonos/Nos_TTS-icia-extended-matcha-phonemes
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
