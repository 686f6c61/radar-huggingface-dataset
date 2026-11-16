# Phoonnx/vits-en_gb-cori-high-espeak

## Resumen

`vits-en_gb-cori-high-espeak` es un modelo de síntesis de voz (text-to-speech) de la familia VITS, empaquetado por Phoonnx para su librería ONNX homónima. El modelo original procede del proyecto Rhasspy Piper, concretamente de la voz `en_GB/cori/high`, y Phoonnx lo redistribuye con un formato listo para su consumo desde Python y desde el ecosistema OVOS. Resuelve el problema de disponer de una voz británica de calidad "high" ejecutable localmente sobre ONNX Runtime, sin dependencia de servicios en la nube.

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional de inferencia variacional que combina un codificador de texto, un prior normalizing flow, un decodificador y discriminadores adversariales, y que genera la forma de onda de forma end-to-end a partir de fonemas. En este empaquetado el front-end textual no está integrado en el modelo: la entrada son fonemas IPA generados por `espeak-ng`, de modo que el pipeline completo requiere phonemización externa (vía `scriptconv` o `espeak-ng`).

El modelo está orientado exclusivamente al inglés británico (`en-GB`) y su relevancia actual radica en su tamaño reducido (repo de 0,1 GB), su licencia MIT y su integración directa en asistentes de voz locales como OVOS/Mycroft, además de su disponibilidad para navegador a través de phoonnx.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end, inferencia variacional con aprendizaje adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no procesa contexto conversacional) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo no documenta variantes cuantizadas) |
| Idiomas soportados | `en-GB` (ingles britanico) |
| Licencia | MIT |
| Formato de pesos | ONNX (repo de 0,1 GB, libreria `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que modela la distribución condicional del audio dado el texto mediante inferencia variacional. Integra en un único modelo un codificador de texto, un prior sobre variables latentes basado en normalizing flows, un decodificador que genera la forma de onda y un esquema de entrenamiento adversarial (discriminadores) junto con una pérdida de coincidencia espectral y una estimación de duración. El resultado es un modelo que produce audio de forma directa desde la secuencia de fonemas, sin necesidad de vocoder separado ni de alineamientos explícitos en inferencia.

En este empaquetado concreto, el modelo no recibe texto crudo sino fonemas IPA producidos por `espeak-ng`. La normalización y conversión del texto la realiza `scriptconv` mediante `EspeakPhonemizer` (extra `scriptconv[espeak]`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; la model card únicamente indica la procedencia upstream (Piper, voz `en_GB/cori/high`) y que el modelo original es de Rhasspy.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en ingles britanico, con salida en fichero WAV mediante `voice.synthesize_wav`.
- Entrada basada en fonemas IPA generados por `espeak-ng`; requiere phonemizacion externa.
- Calidad etiquetada como "high" en la nomenclatura de Piper.
- Integracion como plugin TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`), seleccionable por configuracion.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode), con demo publica.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo "thinking"; es exclusivamente un modelo de sintesis.
- Capacidad multilingue limitada al ingles britanico.

## Casos de uso

- Asistentes de voz locales tipo OVOS/Mycroft: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper/en_GB-cori-high` en `mycroft.conf`, permitiendo respuestas habladas sin conexion a internet.
- Sintesis en aplicaciones Python de escritorio: mediante `TTSModelManager` de phoonnx se carga la voz y se generan ficheros WAV con `synthesize_wav`, adecuado para lectores de pantalla, avisos y notificaciones.
- Audiolibros y narracion de contenido en ingles britanico: la calidad "high" y el tamaño reducido del repo (0,1 GB) permiten generar narraciones por lotes en hardware modesto.
- Síntesis en el navegador: a traves de phoonnx.js se puede ofrecer lectura en voz alta en aplicaciones web sin backend, usando la demo publica como referencia de integracion.
- Sistemas de accesibilidad offline: al ejecutarse sobre ONNX Runtime y no requerir servicios externos, encaja en entornos con restricciones de conectividad o de privacidad.
- Prototipado de pipelines TTS con control fonetico: al aceptar fonemas IPA de `espeak-ng`, permite ajustar pronunciaciones concretas en pruebas de investigación o desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el tamaño del repo (0,1 GB) sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible. Por el tamano del artefacto, es plausible su ejecucion en CPU y en GPU de gama consumer, aunque el autor no publica requisitos.
- Compatibilidad con GPU consumer: no documentada; el empaquetado es ONNX y la libreria no detalla backend de ejecucion (CPU/GPU).
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft) y `phoonnx.js` (navegador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_gb-cori-high-espeak (Phoonnx) | no disponible | no aplica | en-GB | MIT | ONNX | Hugging Face, phoonnx, OVOS |
| Piper `en_GB/cori/high` (Rhasspy, upstream) | no disponible | no aplica | en-GB | MIT (segun upstream) | ONNX (Piper) | Hugging Face (rhasspy/piper-voices) |
| Otras voces VITS empaquetadas por Phoonnx | no disponible | no aplica | segun voz | MIT (segun coleccion) | ONNX | Coleccion VITS de Phoonnx |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Idioma restringido a `en-GB`; no soporta otros idiomas ni cambio de voz dentro del mismo modelo.
- Requiere `espeak-ng` instalado para la phonemizacion; sin el, la extra `phoonnx[espeak]` usa espyak, cuyos fonemas difieren y pueden producir pronunciaciones incorrectas en algunas palabras.
- Riesgo de errores de pronunciacion en palabras fuera del dominio de entrenamiento o en neologismos, al depender de la conversion a fonemas.
- No se documentan sesgos especificos del modelo; al ser una voz sintetica entrenada con datos no descritos en la model card, no es posible evaluar sesgos de acento o genero.
- No apta para tareas de razonamiento, codigo, vision ni agentes; su unico pipeline es `text-to-speech`.
- La licencia MIT se hereda del upstream segun la model card de `rhasspy/piper-voices`; conviene verificar los terminos del proyecto Piper para usos comerciales concretos.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni reportes de calidad independientes.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-cori-high-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/cori/high
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- phoonnx (repositorio): https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
