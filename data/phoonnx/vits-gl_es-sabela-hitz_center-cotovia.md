# Phoonnx/vits-gl_es-sabela-hitz_center-cotovia

## Resumen

vits-gl_es-sabela-hitz_center-cotovia es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el HiTZ Center (Universidad del Pais Vasco) y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo esta especializado en gallego (codigo de idioma `gl`, variante `gl-ES`) y convierte texto en audio inteligible a partir de una representacion fonemica intermedia generada por el fonemizador Cotovia.

El modelo resuelve el problema de la sintesis de voz en gallego dentro del ecosistema de asistentes de voz open source, en particular OVOS (Open Voice OS). Al estar empaquetado en formato ONNX, puede ejecutarse en CPU sin dependencias de GPU, lo que facilita su despliegue en dispositivos de bajos recursos y en entornos de asistente domestico. Su relevancia radica en cubrir un idioma minoritario con pocos recursos TTS publicos y hacerlo accesible mediante una libreria de inferencia ligera y una licencia permisiva (Apache 2.0).

El repositorio ocupa aproximadamente 0,1 GB y contiene los pesos en formato ONNX. La entrada de texto no es texto plano directo: phoonnx delega la normalizacion y la conversion a fonemas en la libreria scriptconv, que aplica el fonemizador Cotovia antes de alimentar el modelo. El modelo no dispone de datos publicados de benchmarks ni de especificaciones detalladas de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada limitada por la frase a sintetizar) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | gallego (`gl`, variante `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia (alfabeto Cotovia) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Modelo upstream | HiTZ/TTS-gl_sabela |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo entrenado con perdidas adversarias y de reconstruccion. El modelo genera audio directamente a partir de la secuencia de fonemas, sin necesidad de un vocoder externo separado, lo que simplifica el pipeline de inferencia y reduce la latencia.

El modelo original fue entrenado por el HiTZ Center sobre el corpus Sabela, un conjunto de datos de voz en gallego. No se dispone en la informacion proporcionada del numero de horas de audio, la composicion exacta del dataset, ni de si se aplicaron tecnicas de RLHF o ajuste fino adicional. El empaquetado de Phoonnx no modifica los pesos del modelo original: unicamente los exporta a ONNX y los integra en su libreria de inferencia, anadiendo la capa de preprocesado de texto mediante scriptconv y el fonemizador Cotovia.

## Capacidades

- Sintesis de voz en gallego (`gl-ES`) a partir de texto, con salida en formato WAV.
- Conversion texto-a-fonemas mediante el fonemizador Cotovia integrado en scriptconv.
- Inferencia en CPU mediante ONNX Runtime, sin requerir GPU.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalizacion de texto y conversion de script delegadas a scriptconv.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al gallego.

## Casos de uso

- Asistentes de voz en gallego: el modelo se integra en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y permite que un asistente domestico responda en gallego con sintesis neuronal, sin necesidad de GPU ni de servicios en la nube.
- Lectura de contenido web en gallego: se puede usar para convertir articulos, noticias o documentacion en audio, aprovechando la licencia Apache 2.0 para integrarlo en aplicaciones de accesibilidad sin restricciones comerciales.
- Sistemas de anuncios publicos o transporte: sintesis de mensajes dinamicos en gallego para paneles informativos o megafonia, donde la inferencia en CPU y el tamano reducido (~0,1 GB) permiten desplegar en dispositivos embebidos.
- Educacion y aprendizaje de idiomas: generacion de audio de referencia en gallego para materiales didacticos o aplicaciones de pronunciacion, con la ventaja de que el modelo es open source y se puede ejecutar localmente.
- Prototipado rapido de interfaces de voz: desarrolladores que necesiten anadir TTS en gallego a un prototipo pueden usar phoonnx con una instalacion via pip y sin infraestructura adicional.
- Investigacion en TTS para lenguas minoritarias: el modelo sirve como linea base reproducible para comparar tecnicas de sintesis en gallego, dado que los pesos son publicos y la licencia permite su uso en experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta empaquetado en ONNX y disenado para ejecucion en CPU.
- GPU recomendadas: no disponible; no se requieren GPU para su uso previsto.
- Compatibilidad con GPU de consumo: no disponible; el modelo no esta pensado para aceleracion por GPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, ONNX Runtime como backend de inferencia.
- Latencia y throughput estimados: no disponible.
- Espacio en disco: aproximadamente 0,1 GB para los pesos.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto / entrada |
|---|---|---|---|---|---|
| vits-gl_es-sabela-hitz_center-cotovia | Gallego (`gl-ES`) | VITS | ONNX | Apache 2.0 | Fonemas Cotovia |
| HiTZ/TTS-gl_sabela (upstream) | Gallego (`gl-ES`) | VITS | no disponible | Apache 2.0 | Texto / fonemas segun implementacion original |
| Otros modelos VITS de la coleccion Phoonnx | Multiples idiomas | VITS | ONNX | Segun modelo | Fonemas segun idioma |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo solo soporta gallego (`gl-ES`); no es multilingue y no debe esperarse calidad en otros idiomas.
- No se han publicado datos de sesgos, calidad de sintesis ni evaluacion subjetiva (MOS) en la informacion disponible.
- Riesgo de alucinacion acustica o artefactos en frases largas o con vocabulario fuera del dominio de entrenamiento; no hay datos publicados al respecto.
- La entrada no es texto plano directo: requiere el fonemizador Cotovia a traves de scriptconv, lo que anade una dependencia adicional (`scriptconv[gl]`).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream (HiTZ/TTS-gl_sabela) y del corpus Sabela antes de un despliegue en produccion.
- No se dispone de informacion sobre el numero de horas de entrenamiento ni la composicion del dataset, lo que limita la evaluacion de su cobertura y robustez.
- El repositorio tiene muy pocas descargas (18) y ningun "like", lo que sugiere una validacion comunitaria limitada.
- No se han publicado resultados de benchmarks que permitan comparar su calidad con otros sistemas TTS en gallego.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-sabela-hitz_center-cotovia
- Modelo upstream (HiTZ Center): https://huggingface.co/HiTZ/TTS-gl_sabela
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de modelos VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
