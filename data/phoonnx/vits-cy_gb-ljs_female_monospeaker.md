# Phoonnx/vits-cy_gb-ljs_female_monospeaker

## Resumen

vits-cy_gb-ljs_female_monospeaker es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por ylacombe y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo esta especializado en galés (cy-GB) con una voz femenina de un solo hablante y deriva del modelo upstream ylacombe/vits_ljs_welsh_female_monospeaker, entrenado sobre el corpus LJSpeech en galés.

El modelo resuelve la necesidad de sintesis de voz en galés dentro del ecosistema phoonnx, una libreria TTS basada en ONNX que permite ejecutar modelos VITS en Python y en el asistente OVOS. Su relevancia radica en que el galés es un idioma con recursos limitados en TTS, y este empaquetado ofrece una via practica para integrar una voz galesa en aplicaciones de asistente de voz y pipelines de sintesis.

El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT. La entrada de texto se realiza mediante fonemas espeak-ng en alfabeto IPA, lo que requiere instalar espeak-ng o el extra de phoonnx con soporte espeak.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | gales (cy-GB) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Tipo de hablante | femenino, monospeaker |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para generar formas de onda directamente a partir de fonemas. El modelo se distribuye en formato ONNX, lo que permite inferencia sin dependencia de PyTorch.

El modelo deriva del checkpoint upstream ylacombe/vits_ljs_welsh_female_monospeaker, entrenado sobre el corpus LJSpeech en galés. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning adicional. La conversion a ONNX fue realizada por BricksDisplay (vits-eng-welsh-female/onnx).

## Capacidades

- Sintesis de voz end-to-end en galés (cy-GB) a partir de texto.
- Voz femenina de un solo hablante.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, con normalizacion de texto mediante scriptconv.
- Ejecucion en Python mediante phoonnx y en navegador mediante phoonnx.js.
- Integracion con el asistente OVOS a traves del plugin ovos-tts-plugin-phoonnx.
- Generacion de audio WAV directamente desde la API de phoonnx.
- No soporta tool calling, agentes, vision ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistente de voz en galés para OVOS: el modelo se integra mediante el plugin ovos-tts-plugin-phoonnx y permite que un asistente domestico responda en galés con una voz femenina, seleccionando la voz en mycroft.conf.
- Lectura de contenido web en galés: integrado en pipelines de accesibilidad para convertir articulos o documentos en audio, usando la normalizacion de texto de scriptconv antes de la fonemizacion.
- Aplicaciones de aprendizaje de idiomas: generacion de pronunciacion sintetica en galés para herramientas de estudio, aprovechando la entrada por fonemas IPA para controlar la pronunciacion.
- Sistemas de navegacion o anuncios publicos localizados: sintesis de avisos breves en galés en entornos donde se requiere una voz consistente y ligera (0,1 GB).
- Prototipado de interfaces conversacionales en gales: al ser un modelo ONNX pequeno, permite iterar rapidamente en entornos con recursos limitados sin GPU dedicada.
- Demos web de TTS: mediante phoonnx.js se puede ejecutar la voz en el navegador con entrada espeak o unicode, util para demostraciones interactivas en la demo de TigreGotico.
- Generacion de audiolibros o podcasts en galés: sintesis por frases con salida WAV para posterior post-procesado y montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en CPU y en GPUs de gama baja, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el tamano del repositorio sugiere que puede ejecutarse en CPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin ovos-tts-plugin-phoonnx para OVOS, y ejecucion ONNX Runtime.
- Latencia y throughput: no disponibles.
- Dependencias: espeak-ng (o el extra phoonnx[espeak] con espyak) y scriptconv con el extra scriptconv[espeak].

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablante | Licencia | Formato | Tamano |
|---|---|---|---|---|---|---|
| vits-cy_gb-ljs_female_monospeaker (este) | VITS | cy-GB | femenino, monospeaker | MIT | ONNX | 0,1 GB |
| ylacombe/vits_ljs_welsh_female_monospeaker | VITS | cy-GB | femenino, monospeaker | no disponible | no disponible | no disponible |
| BricksDisplay/vits-eng-welsh-female | VITS | eng-welsh | femenino | no disponible | ONNX | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monospeaker: solo genera una voz femenina; no permite seleccion de hablante.
- Idioma unico: exclusivamente gales (cy-GB); no soporta otros idiomas.
- Dependencia de espeak-ng: la fonemizacion requiere espeak-ng instalado; el uso de espyak puede producir pronunciaciones incorrectas en algunas palabras, segun advierte el autor.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar artefactos o pronunciaciones erroneas en textos fuera de dominio o con caracteres no normalizados.
- Sin datos de benchmarks: no hay evaluaciones objetivas publicadas (MOS, WER) en la informacion disponible.
- Licencia MIT: permite uso comercial, pero el autor remite a los terminos del release upstream, cuyos terminos no se detallan.
- Contexto de entrada limitado a frases: no es un modelo de contexto largo; la sintesis se realiza por fragmentos de texto.
- Sin soporte de tool calling, agentes ni otras capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-cy_gb-ljs_female_monospeaker
- Modelo upstream: https://huggingface.co/ylacombe/vits_ljs_welsh_female_monospeaker
- Conversion ONNX: https://huggingface.co/BricksDisplay/vits-eng-welsh-female/tree/main/onnx
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
