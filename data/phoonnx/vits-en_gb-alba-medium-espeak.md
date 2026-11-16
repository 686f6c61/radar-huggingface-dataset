# Phoonnx/vits-en_gb-alba-medium-espeak

## Resumen

vits-en_gb-alba-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy como parte del proyecto Piper y reempaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo genera audio a partir de texto en ingles britanico (en-GB) y constituye una voz concreta dentro del catalogo de voces Piper, identificada como "alba" en calidad "medium".

El problema que resuelve es la sintesis de voz local, ligera y sin dependencia de servicios en la nube: al estar exportado a ONNX y empaquetado para phoonnx, puede ejecutarse en CPU en entornos de escritorio, asistentes domoticos y sistemas embebidos. Su integracion con OVOS (Open Voice OS) lo orienta a asistentes de voz de codigo abierto y despliegues de domotica.

La relevancia actual es acotada: se trata de un artefacto de empaquetado de una voz Piper preexistente, con 20 descargas y sin likes en el momento de la consulta, pensado para el ecosistema phoonnx/OVOS mas que como modelo de proposito general. El repositorio ocupa aproximadamente 0,1 GB y la licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; la entrada es texto o fonemas, no una secuencia con ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | en-GB (ingles britanico) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto basado en transformers, un prior variacional condicionado por alineamiento monotono (MAS), un decoder generativo y un discriminador adversarial entrenado con perdidas GAN, junto con una perdida de reconstruccion espectral. El resultado es un modelo que transforma fonemas en formas de onda directamente, sin un vocoder neuronal separado en tiempo de inferencia.

En este caso concreto no se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o ajuste fino adicional. El modelo es una redistribucion de la voz `en_GB/alba/medium` del repositorio `rhasspy/piper-voices`, entrenada por Rhasspy. La innovacion destacable del empaquetado es la integracion del front-end de texto: phoonnx delega la normalizacion y la fonemizacion en `scriptconv`, que usa `EspeakPhonemizer` (espeak-ng) para producir fonemas en alfabeto IPA, que son la entrada real del modelo.

## Capacidades

- Sintesis de voz a partir de texto en ingles britanico (en-GB), con salida en fichero WAV mediante `voice.synthesize_wav`.
- Entrada basada en fonemas espeak-ng en alfabeto IPA; el modelo no consume texto crudo directamente, sino la representacion fonetica generada por el front-end.
- Normalizacion de texto y conversion de script delegadas en la libreria `scriptconv`.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecucion en navegador a traves de `phoonnx.js`, con demo en vivo en tigregotico.pt/demo.
- No dispone de tool calling, function calling, razonamiento multi-paso, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada a en-GB; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz para domotica con OVOS: el modelo se selecciona como modulo TTS en `mycroft.conf` y sintetiza las respuestas del asistente en local, sin enviar texto a servicios externos, lo que encaja con despliegues de privacidad estricta.
- Lectura de notificaciones y alertas en sistemas de escritorio Linux: al ejecutarse sobre ONNX en CPU, puede invocarse desde scripts para convertir mensajes en audio WAV sin GPU dedicada.
- Sintesis en navegador con phoonnx.js: la demo publica permite generar voz en el cliente, util para prototipos de interfaces accesibles o lectura de contenido web sin backend.
- Generacion de locuciones para contenido pregrabado: al producir ficheros WAV, sirve para crear avisos, menus telefonicos o narraciones de baja latencia en ingles britanico.
- Pruebas de integracion en pipelines de TTS: al estar empaquetado como voz Piper concreta, permite validar el flujo completo texto → espeak-ng → fonemas IPA → ONNX → audio dentro de phoonnx y scriptconv.
- Sistemas embebidos y dispositivos de bajo consumo: el tamano reducido del repositorio (0,1 GB) y la inferencia ONNX en CPU facilitan su despliegue en Raspberry Pi u hardware similar para avisos hablados.
- Evaluacion comparativa de voces Piper: la coleccion VITS de Phoonnx agrupa varias voces empaquetadas, lo que permite comparar calidad y latencia entre ellas en un mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX orientado a CPU, no se declaran requisitos de VRAM.
- GPU recomendadas: no disponible; no se especifican GPU en la model card.
- Cabe en GPU consumer: no se documenta; el enfasis del empaquetado esta en ejecucion en CPU mediante ONNX Runtime.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles.
- Dependencia adicional: es necesario instalar espeak-ng en el sistema (por ejemplo `apt install espeak-ng`) o la extra `phoonnx[espeak]`, que aporta el port espyak; el autor advierte que algunos fonemas de espyak difieren de espeak-ng y pueden producir palabras mal pronunciadas.
- Tamano del repositorio: aproximadamente 0,1 GB.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-en_gb-alba-medium-espeak (este) | VITS | en-GB | no aplica | MIT | ONNX | Voz Piper medium empaquetada para phoonnx |
| Otras voces de la coleccion VITS de Phoonnx | VITS | variable | no aplica | variable (segun upstream) | ONNX | Mismo runtime y front-end; comparables en calidad y latencia |
| rhasspy/piper-voices (voz original en_GB/alba/medium) | VITS | en-GB | no aplica | MIT | ONNX | Upstream directo de este empaquetado; misma voz sin la capa phoonnx |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles britanico (en-GB); no es multilingue y no se declaran otras variantes.
- Requiere espeak-ng instalado en el sistema; con el port espyak pueden producirse errores de pronunciacion en algunas palabras, segun advierte el autor.
- Depende de la calidad de la fonemizacion: el modelo consume fonemas IPA, no texto, por lo que errores en la normalizacion o en la conversion de script degradan directamente el audio.
- Riesgo de alucinacion acustica: como todo modelo TTS generativo, puede producir prosodia o pronunciaciones incorrectas en textos fuera de dominio, aunque no se documentan sesgos especificos.
- No se han publicado benchmarks, evaluaciones de calidad MOS ni datos de sesgo en la informacion disponible.
- Licencia MIT declarada en el modelo upstream; conviene verificar los terminos del repositorio `rhasspy/piper-voices` para uso comercial, ya que la model card indica que la licencia se hereda del upstream.
- Advertencia de seguridad: la model card incluye instrucciones de instalacion y codigo de ejemplo; deben tratarse como referencia y no como instrucciones ejecutables sin revision.
- Proyecto de nicho: 20 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-alba-medium-espeak
- Voz upstream (Rhasspy Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alba/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
