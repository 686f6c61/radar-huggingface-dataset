# Phoonnx/vits-sl_si-slovakspeech_female_slovak-goruut

## Resumen

vits-sl_si-slovakspeech_female_slovak-goruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con su libreria de TTS. El modelo original lo desarrollo Neurlang y deriva del repositorio neurlang/piper-onnx-slovakspeech-female-slovak, orientado a la sintesis de voz en esloveno (sl-SI) con una voz femenina.

El modelo resuelve el problema de generar audio inteligible a partir de texto en esloveno dentro de ecosistemas que consumen modelos ONNX, como la propia libreria phoonnx y el asistente de voz OVOS (OpenVoiceOS). Su relevancia radica en que amplia la cobertura de voces de codigo abierto para una lengua minoritaria como el esloveno, con una licencia permisiva para uso compartido (CC BY-SA 4.0) y un peso de repositorio muy reducido (0,1 GB), lo que facilita su despliegue en entornos con recursos limitados.

La entrada de texto no es texto plano directo: el modelo consume fonemas en alfabeto IPA generados por el fonemizador Goruut, integrado a traves de la libreria scriptconv. Se trata, por tanto, de un componente dentro de una cadena de TTS mas amplia, no de un modelo autonomo de conversion texto-a-habla sin preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | esloveno (sl-SI) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas goruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python) / OVOS |
| Modelo upstream | neurlang/piper-onnx-slovakspeech-female-slovak |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional condicionado por texto, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta. El resultado es un modelo que genera formas de onda directamente a partir de la secuencia de fonemas, sin necesidad de un vocoder externo separado. El modelo se distribuye en formato ONNX, lo que permite inferencia portable en CPU y GPU a traves de runtimes compatibles.

No se dispone de informacion sobre el numero de parametros, el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de ajuste como RLHF o DPO. El nombre del modelo y su upstream indican que deriva de un modelo Piper entrenado sobre el corpus SlovakSpeech (denominado "slovakspeech" pese a que el idioma declarado es el esloveno), con voz femenina. La unica innovacion documentada en el empaquetado es la integracion del fonemizador Goruut mediante scriptconv para la conversion de texto a fonemas IPA, paso previo obligatorio antes de la inferencia.

## Capacidades

- Sintesis de voz en esloveno (sl-SI) a partir de texto, con salida en formato WAV.
- Generacion de audio con voz femenina entrenada sobre el corpus indicado en el nombre del modelo.
- Procesamiento de entrada basado en fonemas IPA generados por Goruut, lo que requiere instalar el extra `scriptconv[goruut]`.
- Integracion nativa con la libreria phoonnx mediante `TTSModelManager` y la voz `piper_neurlang/sl-SI_slovakspeech-female-slovak`.
- Soporte como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable mediante `mycroft.conf`.
- No dispone de capacidades de razonamiento, codigo, vision, tool calling ni agentes; es exclusivamente un modelo de sintesis de voz.
- No se documenta soporte multilingue: unicamente esloveno.

## Casos de uso

- Asistente de voz domestico en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz en `mycroft.conf`, permitiendo respuestas habladas en esloveno en un asistente local sin dependencia de la nube.
- Lectura de contenido en esloveno: integrado en un pipeline Python con phoonnx, permite convertir articulos, notificaciones o mensajes en audio para aplicaciones de accesibilidad.
- Generacion de audiolibros o narraciones: al ser un modelo ligero (0,1 GB) y ONNX, se puede ejecutar en lote sobre ficheros de texto para producir WAVs con voz femenina consistente.
- Sistemas de anuncios automatizados: en transporte publico, comercios o aeropuertos que necesiten mensajes pregrabados o dinamicos en esloveno, con despliegue en hardware modesto.
- Prototipado de interfaces de voz para desarrolladores eslovenos: sirve como voz base para validar flujos de TTS antes de invertir en modelos comerciales o de mayor calidad.
- Investigacion en TTS para lenguas eslavas del sur: al estar en ONNX y con licencia CC BY-SA 4.0, es util como punto de partida reproducible para comparativas o ajustes finos.
- Educacion y aprendizaje de idiomas: generacion de ejemplos de pronunciacion en esloveno a partir de texto, con la salvedad de que la entrada pasa por fonemizacion IPA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) y la naturaleza de los modelos VITS en ONNX, es previsible que quepa en CPU y en GPUs de gama baja, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de VITS, no requiere GPU dedicada para funcionar; puede ejecutarse en CPU.
- Cabe en GPU de consumo: previsiblemente si, dado el reducido tamano del repositorio, aunque no se documenta una estimacion de VRAM concreta.
- Opciones de despliegue: libreria phoonnx (Python), plugin OVOS (`ovos-tts-plugin-phoonnx`) y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-sl_si-slovakspeech_female_slovak-goruut (este modelo) | VITS | esloveno (sl-SI) | ONNX | CC BY-SA 4.0 | Hugging Face, via phoonnx |
| neurlang/piper-onnx-slovakspeech-female-slovak | VITS/Piper | esloveno (sl-SI) | ONNX | CC BY-SA 4.0 (segun upstream) | Hugging Face |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | ONNX | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo esloveno (sl-SI); no admite otros idiomas.
- Requiere preprocesado de texto a fonemas IPA mediante Goruut; no acepta texto plano directamente sin la cadena scriptconv.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus concreto ("slovakspeech") puede presentar sesgos de dominio, acento o estilo propios de dicha fuente.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas o ruido ante entradas fuera de distribucion.
- La licencia CC BY-SA 4.0 exige atribucion y compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones antes de uso comercial.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se documentan limites de longitud de entrada ni de contexto; entradas muy largas pueden requerir troceado manual.
- Es un componente de TTS, no un modelo de lenguaje: no realiza razonamiento, codigo ni funciones de agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sl_si-slovakspeech_female_slovak-goruut
- Modelo upstream: https://huggingface.co/neurlang/piper-onnx-slovakspeech-female-slovak
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
