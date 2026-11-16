# Phoonnx/vits-he_il-phonikud-phonikud

## Resumen

vits-he_il-phonikud-phonikud es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el proyecto phonikud y empaquetado por Phoonnx para su biblioteca ONNX de TTS. El modelo esta especializado en hebreo moderno de Israel (he-IL) y toma como entrada fonemas en alfabeto IPA generados por el fonemizador Phonikud, no texto plano directamente.

El modelo resuelve el problema de la sintesis de voz en hebreo con vocalizacion (niqqud) y pronunciacion precisa, un idioma con relativamente pocos recursos TTS de calidad comparado con el ingles o el castellano. Al estar empaquetado en formato ONNX para la biblioteca phoonnx, se puede ejecutar tanto en Python como dentro del ecosistema OVOS mediante el plugin ovos-tts-plugin-phoonnx, lo que facilita su integracion en asistentes de voz y sistemas empotrados.

La relevancia actual del modelo radica en que democratiza el acceso a TTS en hebreo con una licencia permisiva (MIT) y un tamano de repositorio muy reducido (0,1 GB), lo que permite desplegarlo en hardware modesto. Es un modelo de nicho, orientado a desarrolladores que necesitan sintesis de voz en hebreo dentro de pipelines de agentes conversacionales o asistentes de voz open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | hebreo moderno de Israel (he-IL) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | Fonemas phonikud en alfabeto IPA |
| Pipeline | text-to-speech |
| Biblioteca | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un codificador de texto, un predictor de duracion, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con aprendizaje adversario. Este diseno permite generar audio de forma directa a partir de la secuencia de fonemas, sin necesidad de un vocoder separado, lo que reduce la latencia y la complejidad del pipeline de inferencia.

El modelo original procede del repositorio thewh1teagle/phonikud-tts-checkpoints, mantenido por el proyecto phonikud. No se dispone de informacion sobre el numero de horas de audio utilizadas, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO (tecnicas poco habituales en TTS). La innovacion tecnica destacable de este empaquetado es el uso del fonemizador Phonikud, que convierte texto hebreo en fonemas IPA, gestionando la vocalizacion (niqqud) y la pronunciacion del hebreo moderno. El modelo se distribuye en formato ONNX para su ejecucion con phoonnx, lo que permite inferencia optimizada en CPU y GPU sin depender de PyTorch.

## Capacidades

- Sintesis de voz (text-to-speech) en hebreo moderno de Israel (he-IL).
- Conversion de texto hebreo a fonemas IPA mediante el fonemizador Phonikud, con soporte de vocalizacion (niqqud).
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion en el ecosistema OVOS como plugin `ovos-tts-plugin-phoonnx`.
- Normalizacion y conversion de texto a traves de la biblioteca scriptconv.
- Ejecucion en formato ONNX, compatible con despliegue en CPU y GPU.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en hebreo: el modelo permite dotar a un asistente OVOS de sintesis de voz en he-IL mediante el plugin ovos-tts-plugin-phoonnx, configurando la voz `phonikud/phonikud` en `mycroft.conf`.
- Lectura de contenido en hebreo: integrado en aplicaciones de accesibilidad o lectores de pantalla, convierte texto hebreo vocalizado en audio inteligible gracias al fonemizador Phonikud.
- Sistemas de anuncios y avisos automatizados: adecuado para generar mensajes de voz dinamicos en hebreo en entornos de atencion al publico, transporte o comercio, con un coste de inferencia bajo por el tamano reducido del modelo.
- Prototipado rapido de aplicaciones TTS: al distribuirse en ONNX con un repositorio de 0,1 GB, permite montar demos y pruebas de concepto de sintesis de voz en hebreo sin infraestructura pesada.
- Investigacion en TTS para lenguas de recursos limitados: sirve como linea base para experimentos de sintesis en hebreo, comparacion de fonemizadores o evaluacion de calidad de audio.
- Educacion y aprendizaje del hebreo: el modelo puede generar pronunciaciones a partir de texto vocalizado, util en aplicaciones de aprendizaje de idiomas que necesitan audio bajo demanda.
- Integracion en pipelines de agentes conversacionales: como modulo TTS dentro de un agente de voz open source, aportando la capa de salida hablada en hebreo mientras el resto del pipeline gestiona el dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente se ejecuta en CPU sin problemas.
- GPU recomendadas: no se especifican; por el tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria suficiente, y en muchos casos la CPU basta.
- Cabe en GPU consumer: si, con alta probabilidad, dado el tamano reducido del modelo.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, y ejecucion ONNX Runtime subyacente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-he_il-phonikud-phonikud | VITS | he-IL | no disponible | MIT | ONNX | Hugging Face (Phoonnx) |
| Otros modelos VITS de la coleccion Phoonnx | VITS | segun modelo | no disponible | segun modelo | ONNX | Hugging Face (coleccion VITS de Phoonnx) |
| Checkpoints upstream phonikud | VITS | he-IL | no disponible | segun upstream | no disponible | Hugging Face (thewh1teagle/phonikud-tts-checkpoints) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo soporta hebreo moderno de Israel (he-IL); no es multilingue.
- Requiere texto de entrada en fonemas phonikud (IPA), no texto plano; es necesario usar el fonemizador Phonikud a traves de scriptconv.
- No se dispone de informacion sobre sesgos en la voz generada (genero, acento, registro) ni sobre la diversidad de hablantes del dataset de entrenamiento.
- Riesgo de artefactos o pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o texto sin vocalizacion adecuada.
- No hay datos publicados de benchmarks ni evaluaciones subjetivas (MOS) en la informacion disponible.
- Licencia MIT permisiva, pero el autor remite a los terminos del release upstream; conviene verificar las condiciones del repositorio original antes de uso comercial.
- Al ser un empaquetado ONNX de un checkpoint de terceros, la calidad final depende del modelo upstream y de la version del fonemizador.
- No soporta funcionalidades de agente, tool calling ni razonamiento; su uso esta limitado a la sintesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-he_il-phonikud-phonikud
- Repositorio upstream de checkpoints: https://huggingface.co/thewh1teagle/phonikud-tts-checkpoints
- Biblioteca phoonnx: https://github.com/TigreGotico/phoonnx
- Biblioteca scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
