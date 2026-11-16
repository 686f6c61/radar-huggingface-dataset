# Phoonnx/vits-vmw-kasanoma-espeak

## Resumen

vits-vmw-kasanoma-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con su libreria de TTS `phoonnx`. El modelo original procede del proyecto Kasanoma de michsethowusu, publicado en las releases de GitHub del repositorio `michsethowusu/kasanoma` bajo el tag `makhuwa`. Su proposito es generar audio hablado en makhuwa (codigo ISO `vmw`), una lengua bantu hablada principalmente en el norte de Mozambique.

El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo situa en la categoria de modelos TTS ligeros aptos para inferencia en CPU y dispositivos de recursos limitados. La entrada de texto no es texto plano directo: el modelo espera fonemas en alfabeto IPA generados mediante espeak-ng, lo que implica una dependencia externa del fonemizador para la conversion texto-a-fonema.

Su relevancia radica en cubrir una lengua de bajos recursos (`vmw`) para la que existen muy pocos sistemas de sintesis de voz, y en hacerlo a traves de un pipeline reproducible y abierto (ONNX + espeak-ng + phoonnx) que puede integrarse en asistentes de voz como OVOS o ejecutarse en el navegador mediante phoonnx.js. La licencia declarada en Hugging Face es MIT, aunque la model card advierte que el proyecto upstream no especifica licencia y que las voces derivadas deberian llevar `license: other`; esta discrepancia debe verificarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | makhuwa (`vmw`) |
| Licencia | MIT segun Hugging Face; la model card indica `license: other` para las voces upstream |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python) / phoonnx.js (navegador) |
| Pipeline | text-to-speech |
| Fecha de creacion | 2026-11-16 |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto condicionado por alineamiento monotono, un decoder generativo basado en flujo normalizador y un discriminador adversarial entrenado con perdidas GAN, junto con una perdida de reconstruccion espectral. El resultado es un modelo que genera waveforms directamente a partir de fonemas sin necesidad de un vocoder separado, lo que explica su tamano compacto (0,1 GB) y su idoneidad para inferencia en tiempo real.

No se dispone de informacion sobre el corpus de entrenamiento (numero de horas de audio, numero de hablantes, composicion del dataset ni si se aplicaron tecnicas de aumento de datos). Tampoco se documentan detalles sobre el proceso de entrenamiento, hiperparametros, ni si hubo ajuste fino o destilacion. El modelo se distribuye ya exportado a ONNX por Phoonnx, sin que la model card detalle el proceso de conversion ni las optimizaciones aplicadas al grafo.

La innovacion tecnica destacable no esta en el modelo en si (VITS es una arquitectura consolidada desde 2021) sino en el empaquetado: la integracion con `phoonnx` y `scriptconv` estandariza la normalizacion de texto, la fonemizacion via espeak-ng y la sintesis en un pipeline reproducible, con soporte tanto para Python como para el navegador mediante phoonnx.js.

## Capacidades

- Sintesis de voz (text-to-speech) en makhuwa (`vmw`) a partir de fonemas IPA.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador a traves de phoonnx.js (demo en tigregotico.pt/demo).
- Normalizacion y conversion de texto mediante `scriptconv` con el fonemizador `EspeakPhonemizer`.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.
- Cobertura multilingue limitada a una unica lengua (`vmw`).

## Casos de uso

- **Lectura de contenido en makhuwa para hablantes nativos**: el modelo convierte texto en makhuwa a voz sintetica, util para personas con discapacidad visual o para la lectura de documentos en esta lengua de bajos recursos donde apenas existen alternativas TTS.
- **Locucion automatica de noticias y boletines locales**: medios de comunicacion en el norte de Mozambique pueden generar versiones en audio de articulos escritos, usando el modelo como motor TTS ligero en servidores modestos.
- **Asistentes de voz integrados en OVOS**: mediante `ovos-tts-plugin-phoonnx`, el modelo se configura en `mycroft.conf` y pasa a formar parte de un asistente domestico con salida en makhuwa, sin necesidad de infraestructura GPU.
- **Sistemas de anuncios publicos o telefonia IVR**: al ser un modelo ONNX de 0,1 GB, puede desplegarse en dispositivos embebidos o en centralitas telefonicas para mensajes pregrabados generados dinamicamente en makhuwa.
- **Accesibilidad en aplicaciones educativas**: escuelas y plataformas de aprendizaje pueden incorporar sintesis en makhuwa para materiales didacticos, aprovechando la licencia MIT declarada y la facilidad de integracion via Python.
- **Investigacion en TTS para lenguas de bajos recursos**: el modelo sirve como linea base reproducible para comparar tecnicas de sintesis en lenguas bantu, dado que el pipeline (espeak-ng + phoonnx + ONNX) es completamente abierto y documentado.
- **Prototipado rapido en navegador**: con phoonnx.js, desarrolladores web pueden probar la sintesis en makhuwa directamente en el cliente sin backend, util para demos y validacion de UX antes de desplegar en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo ONNX de aproximadamente 0,1 GB, la inferencia cabe holgadamente en CPU y en cualquier GPU consumer; no se dispone de cifras exactas de consumo de memoria en runtime.
- **GPU recomendadas**: no se especifican; por tamano, cualquier GPU con al menos 1 GB de memoria libre es suficiente (GTX 1050, RTX 3050, RTX 4090, A100, H100 son todas validas, aunque el modelo no las aprovechara).
- **Consumer GPU**: si, cabe en cualquier GPU consumer e incluso en CPU.
- **Opciones de despliegue**: `phoonnx` (Python), `phoonnx.js` (navegador), `ovos-tts-plugin-phoonnx` (OVOS). No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- **Latencia y throughput**: no disponibles. Al ser VITS, se espera inferencia en tiempo real o superior en CPU moderna, pero no hay cifras publicadas.
- **Dependencia externa**: requiere `espeak-ng` instalado en el sistema (o el extra `phoonnx[espeak]` con el port `espyak`), lo que anade un requisito de entorno.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-vmw-kasanoma-espeak | VITS | makhuwa (`vmw`) | 0,1 GB | MIT (declarada) / other (upstream) | ONNX | Hugging Face |
| tw-kasanoma | VITS | twi (`tw`) | no disponible | other | ONNX | Hugging Face (coleccion Phoonnx) |
| ny-kasanoma | VITS | chichewa (`ny`) | no disponible | other | ONNX | Hugging Face (coleccion Phoonnx) |
| Otros VITS de la coleccion Phoonnx | VITS | multiples | variable | variable | ONNX | Hugging Face |

La comparativa mas directa son las otras voces del mismo proyecto Kasanoma (twi y chichewa), que comparten arquitectura, pipeline de empaquetado y la misma advertencia de licencia. No se dispone de datos de benchmarks que permitan comparar calidad objetiva entre ellas.

## Limitaciones y advertencias

- **Licencia ambigua**: Hugging Face declara MIT, pero la model card indica que el upstream `michsethowusu/kasanoma` no especifica licencia y que las voces derivadas deberian llevar `license: other`. Antes de un uso comercial, es imprescindible revisar el README de la carpeta original y, en su caso, contactar con el autor upstream.
- **Dependencia de espeak-ng**: la calidad de la sintesis depende del fonemizador. La model card advierte que el port `espyak` produce fonemas distintos a los de `espeak-ng`, lo que puede provocar errores de pronunciacion en algunas palabras.
- **Idioma unico**: solo soporta makhuwa (`vmw`); no es multilingue y no acepta texto en otros idiomas sin fonemizacion manual.
- **Riesgo de alucinacion acustica**: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras fuera del dominio de entrenamiento; no se documentan evaluaciones de naturalidad (MOS) ni de inteligibilidad (WER).
- **Sin informacion de sesgos**: no se documenta la composicion del corpus de entrenamiento (genero, edad, dialecto, variantes regionales del makhuwa), por lo que no puede evaluarse el sesgo de hablante ni la representatividad dialectal.
- **Sin datos de rendimiento**: no hay benchmarks publicados, ni cifras de latencia, throughput o calidad, lo que dificulta la comparacion objetiva con alternativas.
- **Madurez del ecosistema**: la libreria `phoonnx` se instala con `pip install --pre`, lo que indica que es una version preliminar; la API puede cambiar.
- **Cero adopcion**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-vmw-kasanoma-espeak
- Repositorio upstream (release makhuwa): https://github.com/michsethowusu/kasanoma/releases/tag/makhuwa
- Repositorio upstream principal: https://github.com/michsethowusu/kasanoma
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
