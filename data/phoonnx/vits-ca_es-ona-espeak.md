# Phoonnx/vits-ca_es-ona-espeak

## Resumen

vits-ca_es-ona-espeak es un modelo de sintesis de voz (text-to-speech) en catalan (ca-ES) basado en la arquitectura VITS. El modelo original fue desarrollado por el centro HiTZ (Universidad del Pais Vasco) bajo el identificador HiTZ/TTS-ca_ona, y Phoonnx lo ha empaquetado en formato ONNX para su uso con su libreria de TTS phoonnx, que lo integra tanto en Python como en el asistente OVOS.

El modelo recibe texto en catalan y lo convierte a fonemas mediante espeak-ng (alfabeto IPA) antes de sintetizar el audio. No es un modelo de lenguaje generativo ni un transformer de gran escala: es un sistema TTS de tipo end-to-end que combina un encoder de texto, un decoder acustico y un vocoder en una sola red VITS, optimizado para inferencia ligera.

Su relevancia es practica: ofrece una voz catalana lista para produccion en un paquete ONNX de apenas 0,1 GB, con licencia Apache 2.0, lo que lo hace desplegable en entornos con recursos limitados y en aplicaciones de asistente de voz de codigo abierto como OVOS. El repo acumula 21 descargas y no tiene likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | catalan (ca-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repo | 0,1 GB |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura que integra en un unico modelo el encoder de texto, el decoder acustico basado en flujos normalizadores y un vocoder generativo adversarial (GAN), lo que permite sintesis end-to-end sin necesidad de un vocoder separado. El modelo concreto parte de HiTZ/TTS-ca_ona, entrenado por el centro HiTZ para catalan.

No se dispone en la informacion proporcionada de detalles sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino especifico. El empaquetado realizado por Phoonnx consiste en la conversion del modelo original a ONNX y su integracion con la libreria phoonnx, que gestiona el front-end de texto mediante scriptconv y el fonemizador de espeak-ng.

## Capacidades

- Sintesis de voz en catalan (ca-ES) a partir de texto escrito.
- Conversion de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido como extra).
- Generacion de audio WAV mediante la API de phoonnx (`synthesize_wav`).
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante phoonnx.js, con demo en vivo.
- Normalizacion y conversion de texto gestionada por scriptconv.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz de codigo abierto: integracion directa en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `hitz/ca_ona-vits` en `mycroft.conf` para dar respuesta hablada en catalan.
- Lectura de contenido en catalan: sintesis de articulos, noticias o documentacion para aplicaciones de accesibilidad, dado el soporte nativo de ca-ES y la ligereza del paquete ONNX.
- Interfaces conversacionales en catalan: generacion de respuestas habladas en chatbots o sistemas de atencion al cliente que operen en catalan, con inferencia local sin dependencia de APIs externas.
- Sistemas de navegacion o anuncios por voz: sintesis de indicaciones cortas en catalan en dispositivos embebidos, gracias al reducido tamano del modelo (0,1 GB) y al formato ONNX.
- Aplicaciones web de TTS: uso de phoonnx.js para sintetizar voz catalana directamente en el navegador, sin backend, con la demo disponible en tigregotico.pt/demo.
- Prototipado de pipelines de voz: generacion rapida de audios de prueba en catalan para evaluar sistemas de ASR, traduccion o doblaje antes de invertir en voces comerciales.
- Educacion y aprendizaje de idiomas: creacion de materiales auditivos en catalan con pronunciacion controlada mediante fonemas IPA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo ocupa 0,1 GB, por lo que la huella de memoria es muy reducida y cabe en GPU consumer de gama baja o incluso en CPU.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos unos pocos GB de VRAM es suficiente (GTX 1650, RTX 3060, etc.). Tambien viable en CPU.
- Cabe en consumer GPU: si, con margen amplio dado el tamano del modelo.
- Opciones de despliegue: phoonnx (Python y OVOS), phoonnx.js en navegador, ONNX Runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-ca_es-ona-espeak (este) | VITS | ca-ES | 0,1 GB | Apache 2.0 | ONNX |
| HiTZ/TTS-ca_ona | VITS | ca-ES | no disponible | Apache 2.0 | no disponible |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | variable | variable | ONNX |

La comparativa con alternativas de otros desarrolladores (por ejemplo, voces TTS comerciales o modelos como XTTS) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta catalan (ca-ES); no es multilingue.
- La calidad de pronunciacion depende de espeak-ng: con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la propia model card.
- Requiere instalar espeak-ng en el sistema o el extra `phoonnx[espeak]`; sin ello el front-end no funciona correctamente.
- No se han publicado datos de sesgos, riesgo de alucinacion ni evaluaciones de calidad subjetiva (MOS) en la informacion disponible.
- Al ser un modelo TTS, no genera texto ni razona; no debe evaluarse con benchmarks de LLM.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream HiTZ/TTS-ca_ona y de espeak-ng en el contexto de despliegue.
- El repo tiene muy poca traccion (21 descargas, 0 likes), lo que limita la validacion comunitaria.
- No disponible informacion sobre latencia, throughput ni comportamiento en produccion a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ca_es-ona-espeak
- Modelo upstream: https://huggingface.co/HiTZ/TTS-ca_ona
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
