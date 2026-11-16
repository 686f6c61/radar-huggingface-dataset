# Phoonnx/vits-de_de-thorsten_emotional-medium-espeak

## Resumen

`vits-de_de-thorsten_emotional-medium-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo genera audio en aleman (de-DE) a partir de texto, tomando como entrada fonemas en alfabeto IPA producidos por espeak-ng. Su nombre indica que se trata de la variante de calidad "medium" de la voz "thorsten_emotional", una de las voces alemanas del catalogo de Piper.

El modelo resuelve el problema de la sintesis de voz local y ligera: al estar exportado a ONNX y empaquetado en un repositorio de apenas 0,1 GB, puede ejecutarse en CPU sin depender de GPUs ni de servicios en la nube. Esto lo hace adecuado para asistentes de voz embebidos, sistemas domoticos y aplicaciones de accesibilidad que necesitan generar habla en aleman con baja latencia.

Su relevancia actual radica en que forma parte del ecosistema OVOS (Open Voice OS) y de la coleccion de voces VITS de Phoonnx, lo que facilita su integracion en pipelines de voz open source. La licencia MIT declarada por el proyecto upstream permite uso comercial sin restricciones significativas, aunque conviene verificar la procedencia de los datos de entrenamiento de la voz original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruccion y adversarias, junto con un modelado variacional de la duracion y el tono. El resultado es un modelo que genera formas de onda directamente desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

El modelo concreto es una reempaquetado de la voz `de_DE/thorsten_emotional/medium` del repositorio `rhasspy/piper-voices`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial, ya que la model card no los documenta. La innovacion destacable es el empaquetado para phoonnx: el modelo se distribuye como ONNX listo para ejecutarse con la libreria phoonnx, que gestiona la fonemizacion mediante espeak-ng (o su port espyak) y la normalizacion de texto mediante scriptconv.

## Capacidades

- Sintesis de voz en aleman (de-DE) a partir de texto plano.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control preciso de la pronunciacion.
- Voz "emotional" (variante expresiva) del catalogo Thorsten de Piper.
- Ejecucion local en CPU gracias al formato ONNX y al reducido tamano del modelo.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en aleman: el modelo puede integrarse en OVOS o en cualquier aplicacion Python que use phoonnx para convertir respuestas de texto en audio, funcionando en CPU y sin conexion a internet.
- Domotica y altavoces inteligentes: al ser un modelo ONNX de 0,1 GB, cabe en dispositivos de bajos recursos como Raspberry Pi y puede generar avisos y confirmaciones habladas en aleman en tiempo real.
- Accesibilidad web: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para leer contenido en aleman a usuarios con discapacidad visual, sin enviar texto a servidores externos.
- Generacion de audiolibros y contenido narrado: la variante "emotional" produce una entonacion mas expresiva que las voces neutras, adecuada para narracion de textos largos procesados por fragmentos.
- Sistemas de telefonia y atencion al cliente: puede generar mensajes de espera, menus IVR y respuestas habladas en aleman con baja latencia al ejecutarse localmente.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia para validar integraciones con phoonnx, scriptconv y espeak-ng antes de desplegar voces comerciales.
- Educacion y aprendizaje de idiomas: permite generar pronunciaciones de frases en aleman a partir de fonemas IPA, util para herramientas de practica de pronunciacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoria de despliegues; el modelo esta pensado para ejecucion en CPU. Al ser un ONNX de 0,1 GB, la memoria RAM necesaria es del orden de unos cientos de MB.
- GPU recomendadas: no se documentan; el modelo no requiere GPU. Cualquier GPU compatible con ONNX Runtime puede acelerar la inferencia, pero no es necesario.
- Cabe en GPU consumer: si, en cualquier GPU consumer, aunque su uso tipico es en CPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Tamano | Notas |
|---|---|---|---|---|---|---|
| vits-de_de-thorsten_emotional-medium-espeak (este modelo) | VITS | de-DE | ONNX | MIT | 0,1 GB | Voz emocional, entrada espeak |
| Otras voces Piper de Rhasspy (p. ej. thorsten-medium) | VITS | de-DE | ONNX | MIT | ~0,1 GB | Variantes neutras del mismo catalogo |
| Modelos TTS neuronales grandes (p. ej. XTTS, Bark) | Diversas (transformer, GPT) | Multiples | safetensors, etc. | Variables | GB | Mayor calidad y clonacion de voz, pero requieren GPU y mas recursos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta aleman (de-DE); no es multilingue.
- Requiere espeak-ng instalado para la fonemizacion; sin el, el extra `phoonnx[espeak]` usa espyak, cuyos fonemas difieren y pueden producir errores de pronunciacion en algunas palabras.
- La calidad de la sintesis depende de la correccion de la fonemizacion; textos con siglas, numeros o nombres propios pueden requerir normalizacion previa mediante scriptconv.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar prosodia o pronunciaciones incorrectas en frases atipicas.
- No se documentan sesgos especificos, pero al derivar de una unica voz (Thorsten) puede presentar limitaciones de variedad de hablante y de acento.
- La licencia MIT se hereda del proyecto upstream; conviene verificar los terminos de los datos de entrenamiento originales de Piper para uso comercial a gran escala.
- El modelo no incluye capacidades de razonamiento, tool calling ni procesamiento de audio de entrada.
- La fecha de creacion del repositorio (2026) y el bajo numero de descargas (19) sugieren un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-thorsten_emotional-medium-espeak
- Repositorio upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten_emotional/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion de voces VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
