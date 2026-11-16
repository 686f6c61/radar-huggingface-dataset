# Phoonnx/vits-gl_es-celtia-proxecto_nos-graphemes

## Resumen

`vits-gl_es-celtia-proxecto_nos-graphemes` es un modelo de sintesis de voz (text-to-speech) en gallego, empaquetado por Phoonnx a partir del modelo original de Proxecto Nós (`OpenVoiceOS/proxectonos-celtia-vits-graphemes-onnx`). Se trata de una voz concreta, identificada como `proxectonos/celtia`, distribuida en formato ONNX y pensada para ejecutarse con la libreria Python `phoonnx` y con el ecosistema OVOS (OpenVoiceOS).

El modelo emplea la arquitectura VITS, un sistema neuronal de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador acustico y un vocoder en un unico modelo entrenado de forma adversarial condicional. La entrada de texto es a nivel de caracteres, procesados mediante un fonemizador basado en grafemas (`GraphemePhonemizer` de `scriptconv`), lo que evita depender de un lexico fonetico externo para el gallego.

Su relevancia es practica: cubre una lengua de bajos recursos como el gallego en un pipeline TTS ligero, desplegable en CPU mediante ONNX Runtime, con licencia MIT y un tamano de repositorio de 0,1 GB. No es un modelo de lenguaje generalista, sino un componente de sintesis de voz orientado a asistentes y aplicaciones de lectura en voz alta en gallego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech de extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada a nivel de caracteres, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; se asume FP32/FP16 segun el export original, sin detalle publicado) |
| Idiomas soportados | gallego (`gl`, `gl-ES`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | caracteres del texto, normalizados y convertidos via `GraphemePhonemizer` |
| Voces incluidas | `proxectonos/celtia` |
| Libreria de inferencia | `phoonnx` (`pip install --pre phoonnx`) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz condicional de extremo a extremo que integra en un solo modelo el codificador de texto, un prior variacional con alineamiento monotono (via busqueda de alineamiento tipo MAS), un decodificador generativo basado en flujos normalizadores y un vocoder de dominio temporal (HiFi-GAN). El entrenamiento combina una perdida adversarial condicional con perdidas de reconstruccion y divergencia KL, lo que permite generar audio de forma directa sin un pipeline en cascada de modelo acustico y vocoder separados.

En este caso concreto, el modelo original proviene de Proxecto Nós y fue exportado a ONNX por OpenVoiceOS; Phoonnx lo reempaqueta para su libreria. La particularidad del modelo es que la entrada se realiza a nivel de grafemas: no se emplea un lexico de pronunciacion especifico del gallego, sino que el texto se normaliza y se convierte en la secuencia de entrada mediante `GraphemePhonemizer` de `scriptconv`. No se dispone de informacion publicada sobre el numero de horas de audio de entrenamiento, la composicion del corpus, el hablante concreto (Celtia) ni si se aplicaron tecnicas de ajuste fino adicionales.

## Capacidades

- Sintesis de voz en gallego (`gl-ES`) a partir de texto plano, con salida en WAV.
- Entrada basada en grafemas: no requiere lexico fonetico externo para el gallego.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU para inferencia basica.
- Voz unica empaquetada: `proxectonos/celtia`.
- Normalizacion de texto previa a la sintesis mediante `scriptconv` (conversion de texto a la representacion de entrada del modelo).
- No soporta tool calling, agentes, razonamiento multi-paso ni vision; es exclusivamente un modelo TTS.
- No se documentan modos de control de prosodia, emocion ni velocidad mas alla de los parametros propios de la libreria.

## Casos de uso

- Asistentes de voz en gallego: el modelo se integra como modulo TTS en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente domotico o de escritorio responda en gallego sin depender de servicios en la nube.
- Lectura en voz alta de contenido web o documentos: al aceptar texto plano y ejecutarse en CPU, puede incorporarse a un servicio de conversion de articulos o noticias a audio para accesibilidad.
- Sintesis en dispositivos de bajos recursos: el formato ONNX y el tamano de 0,1 GB permiten desplegarlo en equipos sin GPU, como Raspberry Pi o portatiles modestos, usando ONNX Runtime.
- Generacion de avisos y locuciones automatizadas: anuncios de transporte, senalizacion o sistemas de megafonia en gallego que requieran sintesis local sin latencia de red.
- Prototipado de interfaces conversacionales en gallego: desarrolladores que necesiten una voz de referencia para validar un flujo de dialogo antes de invertir en un modelo comercial.
- Investigacion en lenguas de bajos recursos: sirve como linea base reproducible (licencia MIT, pesos ONNX) para comparar calidad TTS en gallego frente a otros sistemas.
- Integracion en pipelines de audiolibros o podcasts automatizados: sintesis por lotes de textos largos divididos en frases, con la normalizacion de `scriptconv` gestionando la entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, MCD) ni comparaciones con otros sistemas TTS en gallego.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la arquitectura VITS, la inferencia en FP32 requiere del orden de varios cientos de MB de memoria, ejecutable en CPU.
- GPU recomendadas: no se especifican; el modelo esta pensado para ONNX Runtime y funciona en CPU. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 3060 o superior) aceleraria la inferencia, pero no es requisito.
- Compatibilidad con GPU de consumo: si, en principio cabe en cualquier GPU de consumo moderna gracias al reducido tamano del modelo, aunque no hay cifras publicadas.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-gl_es-celtia-proxecto_nos-graphemes` | VITS | gallego (`gl-ES`) | ONNX | MIT | caracteres (grafemas) | Hugging Face, via `phoonnx` |
| `OpenVoiceOS/proxectonos-celtia-vits-graphemes-onnx` | VITS | gallego | ONNX | no disponible en la informacion | caracteres (grafemas) | Hugging Face (modelo upstream) |
| Otros modelos VITS empaquetados por Phoonnx (coleccion VITS) | VITS | varios | ONNX | variable | variable | Hugging Face (coleccion Phoonnx) |
| Modelos TTS multilingues comerciales (p. ej. servicios cloud) | variable | multilingue, incluido gallego segun proveedor | API | propietaria | variable | servicios en la nube |

No se dispone de datos de rendimiento comparativo (MOS, WER) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo gallego (`gl-ES`); el texto en otras lenguas producira una pronunciacion incorrecta o degradada.
- Voz unica: solo se empaqueta la voz `proxectonos/celtia`; no hay seleccion de hablante ni control de estilo.
- Entrada basada en grafemas: al no usar lexico fonetico, pueden aparecer errores de pronunciacion en prestamos, siglas, numeros o nombres propios no cubiertos por la normalizacion de `scriptconv`.
- Sin datos publicados de calidad: no hay MOS ni evaluaciones subjetivas que permitan estimar la naturalidad del audio.
- Riesgo de alucinacion acustica: como todo modelo generativo de voz, puede producir artefactos, prosodia incorrecta o audio ininteligible en entradas atipicas (textos muy largos, caracteres especiales, mezcla de idiomas).
- Licencia MIT: permite uso comercial y modificacion, pero el autor remite a los terminos de la release upstream; conviene verificar la licencia del modelo original de Proxecto Nos antes de un despliegue comercial.
- Dependencia de la libreria `phoonnx` en version preliminar (`--pre`): la API puede cambiar y no se garantiza estabilidad en produccion.
- Sin soporte documentado de parametros de prosodia, velocidad o emocion; el control expresivo es limitado.
- Fecha de creacion del repositorio posterior a la fecha actual de referencia en la informacion (2026-11-16), lo que sugiere que los metadatos pueden ser provisionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-celtia-proxecto_nos-graphemes
- Modelo upstream: https://huggingface.co/OpenVoiceOS/proxectonos-celtia-vits-graphemes-onnx
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
