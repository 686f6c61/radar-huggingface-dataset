# Phoonnx/vits-gl_es-brais-proxecto_nos-graphemes

## Resumen

`vits-gl_es-brais-proxecto_nos-graphemes` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo genera audio a partir de texto en gallego (`gl-ES`) y constituye una voz concreta, identificada como `proxectonos/brais`, dentro del ecosistema de voces que Phoonnx distribuye para su motor de inferencia.

La relevancia de este modelo reside en su caracter practico: es una voz en gallego lista para desplegarse en entornos de produccion mediante ONNX Runtime, con un peso de repositorio de aproximadamente 0,1 GB, lo que lo hace ligero y adecuado para ejecucion en CPU o GPU de gama baja. El texto de entrada se procesa a nivel de grafemas (sin fonemizacion fonetica compleja), lo que simplifica el pipeline de inferencia.

La ficha se basa exclusivamente en la informacion disponible en la model card y en los metadatos de Hugging Face. No se han publicado detalles sobre el corpus de entrenamiento, el numero de parametros ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX) |
| Idiomas soportados | gallego (`gl-ES`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un codificador de texto, un prior variacional y un decodificador generativo entrenado con aprendizaje adversarial, junto con un discriminador de multiple periodo y escala. El modelo produce audio directamente a partir de la secuencia de entrada sin necesidad de un vocoder externo, lo que simplifica el despliegue. En este caso, la entrada textual se procesa mediante `GraphemePhonemizer` de la libreria `scriptconv`, es decir, a nivel de grafemas y no de fonemas, lo que reduce la dependencia de un lexico fonetico externo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste fino adicional. El modelo es un empaquetado para phoonnx del artefacto original `OpenVoiceOS/proxectonos-brais-vits-graphemes-onnx`, que a su vez procede de Proxecto Nós. La innovacion tecnica destacable es el propio empaquetado ONNX y la integracion con el pipeline de phoonnx y scriptconv, que permite invocar la sintesis desde Python o desde el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

## Capacidades

- Sintesis de voz a partir de texto en gallego (`gl-ES`) con salida en formato WAV.
- Procesamiento de entrada a nivel de grafemas mediante `GraphemePhonemizer`, sin requerir transcripcion fonetica manual.
- Integracion con la libreria phoonnx (`TTSModelManager`, carga de voces, `synthesize_wav`).
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion mediante ONNX Runtime, lo que permite inferencia en CPU y GPU.
- Voz unica disponible: `proxectonos/brais`.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingueismo, tool calling ni razonamiento; se trata de un modelo puramente TTS.

## Casos de uso

- Lectura de contenido web en gallego: el modelo puede convertir articulos o parrafos en audio para lectores de pantalla o podcasts automatizados, gracias a su pipeline de grafemas que tolera texto sin normalizacion fonetica previa.
- Asistentes de voz para el hogar: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, permite que un asistente domestico responda en gallego con una voz natural y ligera (repo de 0,1 GB).
- Accesibilidad para personas con discapacidad visual: sintesis de documentos y notificaciones en gallego en aplicaciones de escritorio o moviles que ejecuten ONNX Runtime.
- Sistemas de anuncios publicos o transporte: generacion de mensajes pregrabados o dinamicos en gallego para estaciones, aeropuertos o paneles informativos.
- Prototipado de interfaces conversacionales en gallego: al ser un modelo pequeno y con licencia MIT, es adecuado para entornos de desarrollo y pruebas sin coste de licencia.
- Investigacion en TTS de bajos recursos: sirve como linea base para experimentos con voces en gallego, comparacion de fonemizadores (grafemas frente a fonemas) o evaluacion de calidad en idiomas minoritarios.
- Educacion y aprendizaje de idiomas: generacion de material auditivo en gallego para cursos o aplicaciones de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (0,1 GB) sugiere que el modelo es muy ligero y probablemente quepa en memoria de CPU sin necesidad de GPU.
- GPU recomendadas: no disponible; por el tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU consumer: altamente probable dada la huella de 0,1 GB, aunque no confirmado por el autor.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se puede mencionar que dentro de la coleccion VITS de Phoonnx existen otras voces empaquetadas, pero no se aportan datos de rendimiento ni especificaciones que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vits-gl_es-brais-proxecto_nos-graphemes | no disponible | no disponible | MIT | Hugging Face (Phoonnx) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una voz unica entrenada con un corpus no especificado, puede reflejar sesgos de prosodia, acento o estilo del hablante original.
- Riesgo de alucinacion: en TTS, el riesgo se traduce en pronunciaciones incorrectas o artefactos acusticos ante texto fuera de dominio, especialmente al usar grafemas en lugar de fonemas.
- Limitaciones de contexto o idioma: el modelo solo soporta gallego (`gl-ES`); no se garantiza un comportamiento correcto con texto en otros idiomas o con mezcla de lenguas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion, pero el autor remite a los terminos del release original de Proxecto Nós; conviene verificar la licencia upstream antes de un despliegue comercial.
- Caveats para produccion: no hay datos publicados sobre calidad perceptual (MOS), latencia ni robustez; se recomienda evaluar con un conjunto de prueba representativo antes de desplegar. El modelo esta empaquetado para phoonnx, por lo que su uso fuera de esa libreria requiere adaptar el pipeline ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-brais-proxecto_nos-graphemes
- Modelo upstream: https://huggingface.co/OpenVoiceOS/proxectonos-brais-vits-graphemes-onnx
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
