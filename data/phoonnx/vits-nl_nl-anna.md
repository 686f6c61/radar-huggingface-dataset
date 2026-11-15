# Phoonnx/vits-nl_nl-anna

## Resumen

vits-nl_nl-anna es un modelo de sintesis de voz (text-to-speech) en neerlandes de los Paises Bajos (`nl-NL`) basado en la arquitectura VITS y empaquetado en formato ONNX por Phoonnx para su libreria de inferencia `phoonnx`. El modelo original fue entrenado por Rikels y procede del repositorio `Rikels/piper-dutch`; Phoonnx se limita a convertirlo y publicarlo con una interfaz de uso estandarizada. La voz se identifica internamente como `piper_community/Rikels/nl-NL_anna`.

El modelo resuelve la conversion de texto a audio para una unica voz femenina en neerlandes, con entrada fonetica en alfabeto IPA generada mediante espeak-ng. Su relevancia practica radica en que es un componente ligero (repositorio de 0,1 GB) y ejecutable en CPU mediante ONNX Runtime, pensado para integrarse en asistentes de voz y sistemas de sintesis locales sin depender de servicios en la nube.

La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face; no hay informacion sobre el corpus de entrenamiento, el numero de parametros ni resultados de evaluacion subjetiva o automatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto conversacional) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | neerlandes de los Paises Bajos (`nl-NL`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Frecuencia de muestreo de salida | no disponible |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python y OVOS) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un codificador de texto, un prior normalizador de flujo y un decodificador generativo entrenado con aprendizaje adversarial, lo que permite generar audio directamente a partir de fonemas sin un vocoder separado. En este caso, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng, lo que hace que la calidad dependa directamente de la correccion de la fonemizacion.

No se dispone de informacion sobre el numero de tokens de audio, la composicion del corpus, la duracion total de las grabaciones, el hablante de origen ni si se aplicaron tecnicas de fine-tuning o alineacion adicional. El autor del modelo original es Rikels y el empaquetado para phoonnx lo realiza el equipo de Phoonnx (TigreGotico). La innovacion tecnica relevante es el empaquetado ONNX con integracion en la libreria `phoonnx` y en el ecosistema OVOS, no una modificacion arquitectonica del modelo.

## Capacidades

- Sintesis de voz a partir de texto en neerlandes (`nl-NL`) con una unica voz identificada como `anna`.
- Generacion de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Fonemizacion de entrada mediante `EspeakPhonemizer` de la libreria `scriptconv`, con normalizacion y conversion de texto previa.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable desde `mycroft.conf`.
- Ejecucion en navegador mediante `phoonnx.js`, con entrada espeak o unicode.
- No soporta tool calling, function calling, razonamiento multi-paso, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada a un unico idioma (`nl-NL`).

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS como modulo TTS para leer respuestas del asistente en neerlandes, con ejecucion en CPU y sin envio de texto a servicios externos.
- Lectura de articulos y notificaciones: sintesis de frases cortas a WAV para convertir boletines, alertas o resumenes en audio dentro de aplicaciones neerlandesas.
- Accesibilidad: generacion de audio para personas con discapacidad visual que consuman contenido escrito en neerlandes, con un modelo de 0,1 GB facil de empaquetar en aplicaciones de escritorio.
- Sistemas de megafonia e IoT: al ser ONNX y ligero, puede desplegarse en dispositivos de bajos recursos para anuncios programados o avisos de estado.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en neerlandes antes de invertir en voces comerciales, gracias a su licencia MIT.
- Generacion de audio en el navegador: mediante `phoonnx.js` puede sintetizar voz en el cliente sin backend, util para demos y aplicaciones web educativas.
- Dooblage y pruebas de regresion de pipelines TTS: sirve como voz de referencia determinista en pruebas automatizadas de sistemas de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas MOS, CMOS, WER de fonemizacion ni comparaciones objetivas con otras voces.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB de repositorio, el consumo de memoria es bajo y compatible con ejecucion en CPU.
- GPU recomendadas: no se especifican; el modelo esta disenado para inferencia en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido, aunque no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y `phoonnx.js` en navegador.
- Dependencia externa: es necesario instalar espeak-ng (`apt install espeak-ng`) o el extra `phoonnx[espeak]`, que usa el port espyak; este ultimo puede producir pronunciaciones incorrectas en algunos fonemas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-nl_nl-anna (este modelo) | VITS | nl-NL | ONNX | MIT | Voz unica, entrada IPA via espeak-ng |
| Rikels/piper-dutch | VITS (Piper) | nl-NL | no disponible | no disponible | Modelo upstream del que deriva este |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | ONNX | MIT (segun coleccion) | Mismo empaquetado, distinto idioma y voz |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola voz y un solo idioma (`nl-NL`); no admite cambio de hablante ni sintesis multilingue.
- La calidad depende de espeak-ng: con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la propia model card.
- No hay informacion sobre sesgos de genero, acento o registro; la voz esta fijada a una identidad concreta.
- Riesgo de prosodia incorrecta en textos con numeros, siglas o palabras extranjeras, ya que la normalizacion recae en `scriptconv` y espeak-ng.
- No se documentan limites de longitud de texto por inferencia; textos largos requeriran segmentacion manual.
- Licencia MIT: permite uso comercial y modificacion, pero la model card remite a los terminos del release upstream (`Rikels/piper-dutch`), cuyas condiciones no se detallan.
- No apta para clonacion de voz, traduccion ni tareas distintas de TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl_nl-anna
- Modelo upstream: https://huggingface.co/Rikels/piper-dutch
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
