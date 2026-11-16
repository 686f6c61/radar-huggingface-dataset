# Phoonnx/vits-en_us-silverfox-espeak

## Resumen

vits-en_us-silverfox-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de agentvibe, a traves del repositorio HAV0X1014/KF-PiperTTS-voices (variante silverfox), y Phoonnx lo redistribuye en formato ONNX con una interfaz de inferencia en Python y un plugin para el ecosistema OVOS. Su funcion es convertir texto en ingles estadounidense en audio intelligible, tomando como entrada fonemas espeak/IPA en lugar de texto plano.

La relevancia de este modelo es practica mas que investigadora: es una voz compacta (repo de 0,1 GB) pensada para despliegue local y en entornos de asistente de voz, como demuestra su integracion con OVOS mediante `ovos-tts-plugin-phoonnx`. No se trata de un modelo generativo de gran escala ni de un sistema TTS neuronal moderno tipo difusion o autoregresivo; es una implementacion VITS clasica de sintesis end-to-end que prioriza ligereza y velocidad sobre expresividad.

El modelo esta entrenado y especializado unicamente en en-US, con licencia MIT, y su uso requiere una etapa previa de fonemizacion con espeak-ng. La ficha siguiente recoge los datos disponibles en la model card y en la informacion de Hugging Face; los campos no documentados se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (sintesis end-to-end, variacional con decoder de flujo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada es texto corto a nivel de frase; no se documenta limite) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |

Otros datos de interes: el repositorio ocupa aproximadamente 0,1 GB, la libreria declarada es `phoonnx` y el pipeline es `text-to-speech`. La entrada al modelo son fonemas espeak en alfabeto IPA, no texto sin procesar.

## Arquitectura y entrenamiento

VITS (Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech) es una arquitectura de sintesis de voz que combina un encoder de texto, un prior variacional con normalizing flows, un decoder basado en HiFi-GAN y un discriminador adversarial entrenado de forma conjunta. Su caracteristica principal es que genera audio de forma end-to-end a partir de fonemas, sin necesidad de un vocoder externo separado ni de alineamientos forzados supervisados, usando busqueda de alineamiento monotono para aprender la correspondencia texto-audio.

Este paquete concreto no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante o hablantes de origen ni si se aplico RLHF/DPO (no procede en TTS clasico). La model card solo indica que la voz original es "agentvibe" dentro del repositorio KF-PiperTTS-voices, lo que sugiere un origen en la comunidad Piper. La innovacion relevante aqui no esta en el modelo sino en el empaquetado: Phoonnx convierte las voces VITS a ONNX y las expone mediante `TTSModelManager`, con gestion de voces y un front-end de texto (`scriptconv`) que normaliza y fonemiza mediante `EspeakPhonemizer`. El modelo espera fonemas espeak/IPA; variantes de pronunciacion pueden aparecer si se usa la implementacion espyak en lugar de espeak-ng.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US), con salida WAV mediante `voice.synthesize_wav`.
- Entrada a nivel de fonemas espeak/IPA; el front-end de texto de phoonnx normaliza el texto y lo convierte a la secuencia de fonemas que espera el modelo.
- Inferencia local en ONNX, sin dependencia de servicios en la nube.
- Integracion con el ecosistema OVOS mediante `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion desde Python con `TTSModelManager` y desde navegador mediante phoonnx.js (demo en tigregotico.pt/demo).
- No soporta tool calling, function calling, razonamiento multi-paso, vision ni audio de entrada; es un modelo unimodal de TTS.
- Capacidad multilingue limitada: solo en-US.

## Casos de uso

- Asistentes de voz locales tipo OVOS/Mycroft: la voz se selecciona en la configuracion del plugin (`ovos-tts-plugin-phoonnx`) y el modelo sintetiza las respuestas del asistente en el dispositivo, sin enviar texto a la nube. Adecuado por su tamano reducido (0,1 GB) y su formato ONNX.
- Lectura por voz de contenido corto en aplicaciones de escritorio: notificaciones, mensajes del sistema o resumenes de una o dos frases, donde la latencia de un VITS es baja y no se requiere expresividad elevada.
- Prototipado de interfaces de voz en Python: gracias a la API `TTSModelManager` y `synthesize_wav`, se puede integrar en scripts o servicios web para generar audio de prueba en entornos de desarrollo.
- Accesibilidad web: la variante phoonnx.js permite sintetizar voz en el navegador con entrada espeak o unicode, util para lectores de pantalla o avisos hablados en paginas sin backend de TTS.
- Generacion de audios de ejemplo para conjuntos de datos o pruebas de calidad: producir muestras WAV de frases en en-US para validar pipelines de audio o como material de demostracion.
- Sistemas embebidos y de bajo consumo: al ser un modelo pequeno en ONNX y sin dependencias de GPU, puede desplegarse en dispositivos con pocos recursos donde un TTS neuronal de gran escala no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) y la naturaleza de VITS, la inferencia en CPU es viable y no requiere GPU dedicada.
- GPU recomendadas: no se documentan; el modelo puede ejecutarse en CPU. Cualquier GPU consumer serviria para acelerar, pero no es un requisito.
- Cabe en GPU consumer: si, aunque no es necesario; el modelo esta pensado para ejecucion en CPU y en navegador.
- Opciones de despliegue: phoonnx (Python, `TTSModelManager`), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js para navegador. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. No se publican mediciones de RTF (real-time factor) ni de velocidad de sintesis.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| vits-en_us-silverfox-espeak (este) | no disponible | fonemas espeak/IPA, frases | en-US | MIT | ONNX |
| Otras voces VITS del kolektivo Phoonnx (p. ej. variantes Piper) | no disponible | fonemas espeak/IPA | segun voz | MIT (segun origen) | ONNX |
| Modelos TTS neuronales de gran escala (p. ej. familia XTTS o Bark) | no disponible en esta ficha | texto, contexto variable | multilingue | varía | varios |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. La diferencia cualitativa principal es que este modelo es una voz VITS ligera y monolingue, frente a sistemas TTS de mayor tamano y multilinguismo.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- Requiere fonemizacion previa con espeak-ng; si se usa la implementacion espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la propia model card.
- Riesgo de pronunciacion incorrecta en palabras fuera del vocabulario de entrenamiento, nombres propios, siglas o vocabulario tecnico, al depender de la fonemizacion espeak.
- No se documentan sesgos de hablante, genero, acento o dialecto; se desconoce la diversidad del dataset de entrenamiento.
- Alucinacion en el sentido generativo de texto no aplica, pero si puede producir artefactos acusticos o prosodia incorrecta en frases largas o mal fonemizadas.
- Licencia MIT: permite uso comercial, pero la model card indica que la release upstream establece sus propios terminos, por lo que conviene verificar la licencia de la voz original (HAV0X1014/KF-PiperTTS-voices/silverfox) antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad ni benchmarks publicados, lo que limita la confianza para produccion.
- Sin informacion sobre parametros, contexto maximo ni variantes cuantizadas; no se puede planificar el rendimiento con datos concretos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-en_us-silverfox-espeak)
- [Voz upstream HAV0X1014/KF-PiperTTS-voices/silverfox](https://huggingface.co/HAV0X1014/KF-PiperTTS-voices/tree/main/silverfox)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
