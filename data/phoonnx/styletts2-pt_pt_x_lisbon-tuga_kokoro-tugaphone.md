# Phoonnx/styletts2-pt_pt_x_lisbon-tuga_kokoro-tugaphone

## Resumen

StyleTTS2 pt_pt_x_lisbon-tuga_kokoro-tugaphone es un modelo de sintesis de voz (text-to-speech) para portugues europeo, en concreto para la variante dialectal de Lisboa, empaquetado en formato ONNX por Phoonnx para su uso con la libreria homonima. El modelo deriva del checkpoint `tuga_kokoro.pth` publicado por logus2k en el repositorio `kokoro_tts_eu_pt`, que a su vez se basa en la arquitectura StyleTTS2 original de yl4579. Phoonnx actua como capa de empaquetado y ejecucion: convierte los pesos a ONNX y los integra en su ecosistema de voces y fonemizadores.

El modelo resuelve el problema de disponer de sintesis neuronal de calidad para portugues de Portugal en un formato portable y ligero (repositorio de 0,3 GB), ejecutable sin GPU dedicada mediante ONNX Runtime. Su entrada no es texto plano, sino fonemas en alfabeto IPA generados por el fonemizador tugaphone, especializado en dialectos lusofonos (pt-PT, pt-BR, pt-AO, pt-MZ, pt-TL), lo que permite controlar la pronunciacion de forma mas precisa que un pipeline texto-a-texto convencional.

Es relevante para desarrolladores que construyen asistentes de voz en portugues europeo dentro del ecosistema OVOS/Mycroft, ya que se integra como plugin (`ovos-tts-plugin-phoonnx`) y ofrece una licencia Apache 2.0 permisiva para uso comercial. No obstante, se trata de un modelo con muy poca traccion en la plataforma (16 descargas, 0 likes en el momento de la consulta), por lo que debe evaluarse con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (sintesis no autorregresiva) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repositorio ocupa 0,3 GB) |
| Idiomas soportados | portugues, variante pt-PT-x-lisbon |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema de sintesis de voz no autorregresivo que combina un encoder de estilo y un decoder acustico con un discriminador adversarial de multiple resolucion durante el entrenamiento. StyleTTS2 se caracteriza por usar difusion para el modelado de estilo y por lograr sintesis de calidad cercana a la humana con un coste computacional moderado, lo que facilita su despliegue en CPU mediante ONNX Runtime. La variante empaquetada aqui corresponde al checkpoint `tuga_kokoro.pth` del repositorio upstream `logus2k/kokoro_tts_eu_pt`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). Tampoco se detalla el proceso de conversion a ONNX ni si se realizo cuantizacion adicional. La innovacion principal del empaquetado es la integracion con el front-end de texto `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA mediante `tugaphone`, un fonemizador especifico para dialectos del portugues.

## Capacidades

- Sintesis de voz a partir de texto en portugues europeo, variante de Lisboa (pt-PT-x-lisbon).
- Entrada basada en fonemas IPA generados por el fonemizador tugaphone, lo que permite un control preciso de la pronunciacion.
- Ejecucion en ONNX Runtime, con soporte para CPU y potencialmente GPU segun el proveedor de ejecucion configurado.
- Integracion con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Gestion de voces multiples a traves de `TTSModelManager` de phoonnx (voces `logus2k/tts_eu_pt`, `-am_adam`, `-pm_alex`, `-pm_santa`).
- Normalizacion de texto y conversion de script delegadas a `scriptconv`.
- No se documentan capacidades de clonacion de voz, control emocional explicito, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Asistentes de voz en portugues europeo: integracion como motor TTS en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, configurando la voz en `mycroft.conf` para respuestas habladas en pt-PT.
- Lectura de contenido en aplicaciones de accesibilidad: sintesis de articulos, noticias o documentos para usuarios con discapacidad visual, con pronunciacion controlada mediante fonemas IPA.
- Generacion de audiolibros y podcasts: produccion por lotes de audio a partir de texto en portugues de Portugal, aprovechando el bajo peso del modelo (0,3 GB) para ejecucion en servidores sin GPU.
- Sistemas de navegacion y avisos por voz: locuciones dinamicas en dispositivos empotrados o de bajo consumo, gracias al formato ONNX y a la inferencia no autorregresiva.
- Prototipado rapido de interfaces conversacionales: uso de la API de phoonnx (`TTSModelManager`, `synthesize_wav`) para generar audio WAV en scripts Python durante el desarrollo.
- Investigacion en fonetica del portugues: generacion de muestras con fonemas IPA especificos para estudiar variacion dialectal de Lisboa frente a otras variantes lusofonas.
- Doblage y localizacion de contenido: sintesis de voz para versiones en portugues europeo de videos o cursos, con la salvedad de que no se documenta clonacion de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,3 GB en repositorio, es probable que quepa en memoria de CPU, aunque no se confirma el consumo exacto.
- GPU recomendadas: no disponible; el modelo esta disenado para ejecutarse via ONNX Runtime, que soporta CPU y GPU (CUDA, DirectML, etc.) segun el proveedor configurado.
- Compatibilidad con GPU de consumo: no confirmada, pero el tamano reducido del repositorio sugiere que podria ejecutarse en GPUs de gama media o incluso en CPU.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin OVOS (`ovos-tts-plugin-phoonnx`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| styletts2-pt_pt_x_lisbon-tuga_kokoro-tugaphone (este) | StyleTTS2 | pt-PT-x-lisbon | Apache 2.0 | ONNX | Hugging Face (16 descargas) |
| logus2k/kokoro_tts_eu_pt (upstream) | Kokoro / StyleTTS2 | Portugues europeo | Apache 2.0 | PyTorch (.pth) | Hugging Face (5 likes) |
| StyleTTS2 original (yl4579) | StyleTTS2 | Ingles principalmente | No disponible en la informacion | PyTorch | GitHub |
| Otras voces phoonnx (am_adam, pm_alex, pm_santa) | StyleTTS2 | pt-PT variantes | Apache 2.0 | ONNX | Hugging Face (coleccion Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo con muy poca adopcion (16 descargas, 0 likes), lo que implica escasa validacion comunitaria y mayor riesgo de problemas no documentados.
- Cobertura limitada a una unica variante dialectal (pt-PT-x-lisbon); no se garantiza un rendimiento adecuado para otras variantes del portugues.
- La entrada debe ser texto en portugues de Portugal; el fonemizador tugaphone soporta otros dialectos lusofonos, pero el modelo esta entrenado para la variante de Lisboa.
- No se documentan sesgos especificos, pero los modelos TTS pueden heredar sesgos de prosodia, genero o edad presentes en los datos de entrenamiento (no disponibles).
- Riesgo de alucinacion acustica: posible generacion de artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario o de baja frecuencia.
- La licencia Apache 2.0 permite uso comercial, pero se hereda de la declaracion del upstream; conviene verificar los terminos del repositorio `logus2k/kokoro_tts_eu_pt` antes de un despliegue comercial.
- No se dispone de informacion sobre latencia, throughput ni calidad subjetiva (MOS), lo que dificulta evaluar su idoneidad para produccion en tiempo real.
- Dependencia de la libreria phoonnx (en estado `--pre`, es decir, pre-release) y de `scriptconv`, lo que anade riesgo de cambios de API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-pt_pt_x_lisbon-tuga_kokoro-tugaphone
- Repositorio upstream: https://huggingface.co/logus2k/kokoro_tts_eu_pt
- Checkpoint upstream `tuga_kokoro.pth`: https://huggingface.co/logus2k/kokoro_tts_eu_pt/blob/main/tuga_kokoro.pth
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2
- Libreria phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
- Libreria scriptconv (GitHub): https://github.com/TigreGotico/scriptconv
- Fonemizador tugaphone (GitHub): https://github.com/TigreGotico/tugaphone
- StyleTTS2 original (GitHub): https://github.com/yl4579/StyleTTS2
- Documentacion de StyleTTS2 en mlx-audio-swift: https://deepwiki.com/Blaizzy/mlx-audio-swift/4.3.7-styletts2-models-(kokoro-and-kittentts)
