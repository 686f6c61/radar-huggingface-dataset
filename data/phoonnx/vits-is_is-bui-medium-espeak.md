# Phoonnx/vits-is_is-bui-medium-espeak

## Resumen

vits-is_is-bui-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo convierte texto en islandes (is-IS) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su publicacion en el repositorio de Phoonnx facilita su uso desde Python y desde el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

Se trata de un modelo de tamano "medium" (el repositorio ocupa aproximadamente 0,1 GB), lo que lo situa en la gama de voces ligeras aptas para inferencia en CPU y en dispositivos de recursos limitados. No es un modelo de lenguaje generativo: es un sistema acustico neuronal que mapea secuencias de fonemas a formas de onda, por lo que sus capacidades se limitan a la sintesis de voz en islandes.

Su relevancia actual radica en que amplia el ecosistema de voces Piper disponibles para lenguas de bajos recursos como el islandes, con licencia MIT y formato ONNX, lo que permite integrarlo en pipelines de TTS sin dependencias de frameworks pesados ni restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | islandes (is-IS) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. VITS sintetiza directamente la forma de onda a partir de la secuencia de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia. La entrada de texto se procesa mediante espeak-ng, que genera fonemas en alfabeto IPA; Phoonnx delega esta conversion a la libreria scriptconv (`EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`).

No se dispone de informacion sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. El modelo procede del repositorio upstream `rhasspy/piper-voices/is/is_IS/bui/medium`, que agrupa voces Piper entrenadas con el pipeline de Rhasspy. La variante "medium" indica un compromiso entre calidad y tamano del modelo dentro de la escala de Piper (low/medium/high).

## Capacidades

- Sintesis de voz en islandes (is-IS) a partir de texto escrito.
- Conversion texto-fonema mediante espeak-ng con salida en alfabeto IPA.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de Phoonnx.
- Integracion con el asistente de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (VITS con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada al islandes; no se documentan otras lenguas.

## Casos de uso

- Lectura de contenido en islandes: el modelo puede convertir articulos, noticias o documentacion a audio para aplicaciones de accesibilidad o podcasts automatizados, gracias a su licencia MIT y su formato ONNX ligero.
- Asistente de voz domestico con OVOS: integrado mediante `ovos-tts-plugin-phoonnx`, permite que un asistente local responda en islandes sin depender de servicios en la nube.
- Sistemas de navegacion o avisos por voz en islandes: la baja latencia esperada de un modelo medium en ONNX lo hace adecuado para mensajes cortos en tiempo real.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz islandesa para pruebas de UX pueden desplegarlo con `pip install --pre phoonnx` y espeak-ng sin infraestructura GPU.
- Audiolibros o contenido educativo: sintesis por lotes de textos largos en islandes, dividiendo el texto en frases y generando WAVs concatenables.
- Investigacion en TTS para lenguas de bajos recursos: sirve como linea base VITS para comparar con modelos mas recientes en islandes, al estar disponible en ONNX y con licencia permisiva.
- Demos web de sintesis de voz: phoonnx.js permite ejecutar la voz en el navegador, util para demostraciones interactivas sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo de aproximadamente 0,1 GB en ONNX, es esperable que quepa en memoria de CPU sin GPU, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; el modelo esta disenado para ejecucion en CPU mediante ONNX Runtime.
- Compatibilidad con GPU consumer: no se documenta; por tamano, es plausible en cualquier GPU consumer, pero no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: Phoonnx (Python), OVOS (`ovos-tts-plugin-phoonnx`), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput estimados: no disponibles.
- Dependencia externa: espeak-ng debe estar instalado en el sistema (`apt install espeak-ng`) o bien usar el extra `phoonnx[espeak]`, que incluye el port espyak; este ultimo puede pronunciar mal algunas palabras por diferencias foneticas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-is_is-bui-medium-espeak (este) | VITS | is-IS | MIT | ONNX | no aplica | Empaquetado por Phoonnx, upstream Piper |
| Otras voces Piper `is_IS` (p. ej. variantes low/high del mismo upstream) | VITS | is-IS | MIT | ONNX | no aplica | Misma familia; diferencias de tamano y calidad no documentadas aqui |
| Modelos TTS multilingues comerciales (p. ej. servicios cloud) | no disponible | multi | propietaria | API | no aplica | No comparables en licencia ni despliegue local |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en sintesis de voz en islandes; no realiza comprension ni generacion de texto.
- La calidad de pronunciacion depende de espeak-ng; con el port espyak pueden producirse errores en algunas palabras.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con un corpus limitado de islandes, puede presentar sesgos de acento o de registro.
- Riesgo de artefactos acusticos o prosodia incorrecta en textos con numeros, abreviaturas o palabras extranjeras no normalizadas correctamente por scriptconv.
- No hay informacion sobre el rendimiento en dominios especializados (medico, legal) ni sobre la robustez ante texto ruidoso.
- Licencia MIT permite uso comercial, pero se recomienda verificar la cadena de licencias del upstream `rhasspy/piper-voices`.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No se dispone de informacion sobre el numero de parametros ni sobre cuantizaciones alternativas, lo que limita la planificacion de recursos.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-is_is-bui-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/is/is_IS/bui/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
