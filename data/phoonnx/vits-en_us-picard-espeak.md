# Phoonnx/vits-en_us-picard-espeak

## Resumen

vits-en_us-picard-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede del repositorio de voces Piper de dividebysandwich, concretamente de la voz denominada Picard, y ha sido adaptado al formato y a las convenciones de entrada de phoonnx, que utiliza fonemas espeak-ng en alfabeto IPA como interfaz de texto.

El modelo resuelve el problema de la sintesis de voz local y ligera en ingles estadounidense (en-US), ofreciendo una voz concreta dentro del ecosistema Piper, que prioriza inferencia rapida en CPU mediante modelos ONNX de tamano reducido. Su relevancia actual radica en que permite integrar TTS de calidad aceptable en asistentes de voz, sistemas de accesibilidad y aplicaciones de borde sin depender de servicios en la nube.

La ficha se basa exclusivamente en la informacion disponible en la model card y en los metadatos de Hugging Face. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un modelo de nicho dentro del catalogo de Phoonnx. No se dispone de datos sobre el numero de parametros, el contexto (no aplica en TTS) ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (sintesis de voz extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz extremo a extremo que combina un codificador de texto, un prior y un decodificador generativo con alineamiento monotono aprendido, junto con un discriminador adversarial en entrenamiento. Permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder separado. En este caso, la entrada no es texto crudo sino fonemas espeak-ng en alfabeto IPA, que phoonnx obtiene mediante su libreria scriptconv y el fonemizador `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable a TTS en el sentido habitual) ni innovaciones tecnicas adicionales mas alla del propio empaquetado para phoonnx. El modelo original fue entrenado por dividebysandwich como parte del repositorio piper-voice-models; Phoonnx se limita a redistribuirlo en formato ONNX con la interfaz de fonemas espeak. La model card advierte que el uso del port espyak de espeak-ng puede producir errores de pronunciacion en algunas palabras, ya que ciertos fonemas difieren de los de espeak-ng nativo.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, lo que permite un control preciso de la pronunciacion si se generan los fonemas manualmente.
- Generacion de audio en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, con demo disponible en tigregotico.pt/demo.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje, al ser un modelo puramente TTS.
- No soporta vision ni audio de entrada; solo texto (fonemas) a audio.
- Capacidad multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite sintetizar respuestas del asistente sin conexion a internet, gracias a su formato ONNX y a la licencia MIT.
- Sistemas de accesibilidad: lectura en voz alta de texto en pantalla para personas con discapacidad visual, ejecutandose en CPU sin GPU dedicada.
- Aplicaciones de borde y dispositivos embebidos: al ser un modelo ONNX de 0,1 GB, puede desplegarse en Raspberry Pi u otros dispositivos con recursos limitados para generar avisos hablados.
- Videojuegos y prototipos: generacion de dialogos de personajes con una voz concreta (Picard) de forma rapida y sin coste por llamada a API.
- Investigacion en TTS y fonetica: al aceptar fonemas IPA directamente, permite experimentar con transcripciones foneticas controladas y comparar la salida del modelo con la pronunciacion esperada.
- Generacion de audiolibros o contenido educativo en ingles: sintesis por lotes de textos largos mediante scripts en Python que invocan `synthesize_wav` sobre cada frase.
- Pruebas de integracion en pipelines de CI: verificacion automatizada de que el modelo carga y produce audio valido en entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en memoria RAM de sistemas modestos, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponibles; el ecosistema Piper/phoonnx esta disenado para inferencia en CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el enfasis del empaquetado es la ejecucion en CPU y en navegador.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin OVOS `ovos-tts-plugin-phoonnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS VITS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-picard-espeak | VITS | en-US | ONNX | MIT | no aplica | Hugging Face (Phoonnx) |
| Otras voces Piper de dividebysandwich | VITS | en-US y otros | ONNX | segun la voz original | no aplica | GitHub piper-voice-models |
| Voces VITS de la coleccion Phoonnx | VITS | varios | ONNX | MIT (segun coleccion) | no aplica | Hugging Face (coleccion VITS de Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER de sintesis) en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- Requiere espeak-ng instalado o el extra `phoonnx[espeak]`; con el port espyak algunas palabras pueden pronunciarse incorrectamente.
- La entrada debe ser texto en en-US o fonemas espeak-ng en IPA; no acepta otros formatos de entrada.
- Riesgo de pronunciacion incorrecta en palabras fuera del vocabulario o con grafias ambiguas, comun en sistemas TTS basados en fonemas.
- No se dispone de informacion sobre sesgos de voz (genero, acento, edad) ni sobre la composicion del dataset de entrenamiento.
- Licencia MIT, lo que permite uso comercial, pero la model card remite a los terminos del lanzamiento original de dividebysandwich; conviene verificar dichos terminos antes de un despliegue comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- No apto para tareas de razonamiento, generacion de codigo ni agentes; es exclusivamente un modelo de sintesis de voz.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-picard-espeak
- Repositorio original de la voz: https://github.com/dividebysandwich/piper-voice-models/tree/main/Picard
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
