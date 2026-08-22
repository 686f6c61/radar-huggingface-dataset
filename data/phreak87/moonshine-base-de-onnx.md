# Phreak87/moonshine-base-de-onnx

## Resumen

Moonshine Base DE ONNX es un modelo de reconocimiento automático de voz (ASR) en alemán, preparado para ejecutarse en el navegador mediante Transformers.js. Se trata de un export ONNX del modelo `fidoriel/moonshine-base-de`, que a su vez es la variante base de la familia Moonshine desarrollada por Useful Sensors, una serie de modelos ASR de muy baja latencia pensados para inferencia en dispositivos locales.

El modelo tiene 62 millones de parámetros y se distribuye en formato ONNX con los archivos de encoder y decoder separados, incluyendo variantes con y sin caché de claves y valores. Está diseñado para funcionar en entornos web mediante WebAssembly o WebGPU, lo que permite ejecutar transcripción de voz de forma privada y sin conexión, sin necesidad de servidores externos. Su licencia Apache 2.0 facilita su integración en proyectos comerciales y de investigación.

La relevancia de este modelo reside en que ofrece una alternativa ligera a sistemas como Whisper para aplicaciones de voz en tiempo real, con un tamaño reducido (62M de parámetros) y la posibilidad de ejecutarse íntegramente en el cliente, algo crítico para aplicaciones que requieren privacidad o baja latencia. Su exportación a ONNX con compatibilidad con Transformers.js lo hace especialmente útil para desarrolladores web que quieren añadir reconocimiento de voz sin desplegar infraestructura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine (familia de modelos ASR de Useful Sensors) |
| Parametros totales | 62 millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportado en FP32) |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos encoder_model.onnx, decoder_model_merged.onnx, etc.) |

## Arquitectura y entrenamiento

El modelo es un export ONNX del checkpoint PyTorch `fidoriel/moonshine-base-de`, que a su vez se basa en la arquitectura Moonshine de Useful Sensors. Moonshine es una familia de modelos de reconocimiento de voz diseñados específicamente para inferencia en dispositivos con recursos limitados, priorizando baja latencia y tamaño reducido. La variante base tiene 62 millones de parámetros, lo que la sitúa en un rango similar al modelo tiny de Whisper.

El proceso de exportación se realizó con `optimum.exporters.onnx`, aplicando un parche que elimina la entrada `attention_mask` del grafo (ya que la inferencia se realiza con batch de uno y sin padding). El decoder fusionado se post-procesó para forzar la rama de no-caché, debido a un bug conocido en el nodo `If` que produce tokens incorrectos cuando se utiliza la caché de claves y valores. El modelo se exporta en FP32 con opset 14.

Los datos de entrenamiento del modelo original no están disponibles en la información proporcionada. La familia Moonshine se menciona en el paper arxiv:2410.15608, pero no se detallan aquí las características del entrenamiento específico de la variante alemana.

## Capacidades

- Reconocimiento automático de voz (ASR) en alemán, con transcripción de audio en texto.
- Ejecución en navegador mediante Transformers.js v4, compatible con WebAssembly y WebGPU.
- Inferencia en dispositivos sin conexión, sin necesidad de servidores externos.
- Decodificación greedy manual en la demo incluida, con un bucle de decodificación personalizado que evita el bug de caché.
- Exportación ONNX lista para usar con `onnxruntime-web`.
- Compatibilidad con el pipeline `automatic-speech-recognition` de Transformers.

No se mencionan capacidades adicionales como tool calling, agentes o multimodales en la información disponible.

## Casos de uso

- Transcripción de voz en tiempo real en el navegador: el modelo se puede cargar directamente en una página web con Transformers.js, permitiendo dictar texto, transcribir reuniones o crear notas de voz sin enviar audio a un servidor. Su tamaño de 62M de parámetros lo hace viable para ejecutarse en ordenadores de sobremesa y portátiles.
- Asistencia de accesibilidad para personas con dificultades de escritura: una aplicación web puede capturar la voz del usuario y transcribirla a texto en alemán, funcionando sin conexión y respetando la privacidad del usuario.
- Asistente de voz para aplicaciones de atención al cliente: el modelo puede integrarse en un frontend para transcribir consultas habladas y pasarlas a un sistema de procesamiento de lenguaje natural, reduciendo la latencia al eliminar el envío de audio a servidores.
- Herramientas de subtitulado automático para vídeos: los desarrolladores pueden usar el modelo para generar subtítulos en alemán de forma local, sin depender de servicios de transcripción externos.
- Prototipos y demos educativas de ASR: el modelo es adecuado para proyectos de investigación o enseñanza que necesiten un ejemplo de ASR funcional en el navegador, con una demo incluida en el repositorio.
- Aplicaciones de dictado y entrada de voz: integración en editores de texto o formularios web para permitir escribir mediante voz en alemán, con respuesta rápida y sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad como WER, MMLU o HumanEval para este modelo.

## Requisitos de hardware

- El modelo se ejecuta en el navegador mediante Transformers.js con WebAssembly o WebGPU, por lo que no requiere GPU dedicada para funcionar en un ordenador de escritorio.
- Los archivos ONNX ocupan aproximadamente 0.7 GB en total (encoder ~77 MB, decoder ~200-211 MB), lo que implica una carga inicial considerable pero factible en conexiones de banda ancha.
- Tiempo de decodificación típico: alrededor de 6 segundos para un clip de audio de 5 segundos en una CPU de escritorio, debido a que el decoder recalcula las claves y valores en cada paso (sin caché).
- Para despliegue en servidor se puede usar ONNX Runtime con CPU, aunque el modelo está pensado para el navegador.
- No se recomienda para dispositivos con muy poca memoria, dado que el tamaño del decoder es considerable para una aplicación web.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `Phreak87/moonshine-base-de-onnx` | 62M | no disponible | aleman | Apache 2.0 | ONNX |
| `Phreak87/moonshine-tiny-de-onnx` | no disponible | no disponible | aleman | Apache 2.0 (probablemente) | ONNX |
| `fidoriel/moonshine-base-de` | 62M | no disponible | aleman | Apache 2.0 | PyTorch |
| `moonshine-ai/moonshine` (variante original) | no disponible | no disponible | ingles (principalmente) | MIT | Keras/ONNX |

La comparativa muestra que el modelo base es la variante de 62M de la familia Moonshine, mientras que existe una versión tiny con menos parámetros. La licencia Apache 2.0 es más permisiva que la MIT del modelo original en inglés, pero la información no detalla diferencias de rendimiento entre las variantes.

## Limitaciones y advertencias

- **Bug conocido en la caché del decoder**: el nodo `If` que alterna entre la rama con y sin caché produce tokens incorrectos cuando se usa la caché. El modelo se distribuye con la caché desactivada, lo que obliga a recalcular las claves y valores en cada paso, resultando en una decodificación más lenta (6 segundos para 5 segundos de audio).
- **Solo alemán**: el modelo está entrenado exclusivamente para el idioma alemán, por lo que no es útil para otros idiomas.
- **Riesgo de alucinación**: como cualquier modelo ASR, puede generar transcripciones incorrectas en audio ruidoso o con acentos poco comunes.
- **Tamaño del modelo**: los archivos ONNX suman alrededor de 0.7 GB, lo que puede suponer un tiempo de carga elevado en conexiones lentas o un problema en dispositivos con poca memoria.
- **Limitaciones de producción**: la demo no usa el pipeline estándar de Transformers.js debido al bug de caché, por lo que cualquier integración debe seguir el bucle de decodificación manual implementado en la demo, lo que complica el mantenimiento.

## Enlaces

- [Modelo en Hugging Face: Phreak87/moonshine-base-de-onnx](https://huggingface.co/Phreak87/moonshine-base-de-onnx)
- [Modelo original: fidoriel/moonshine-base-de](https://huggingface.co/fidoriel/moonshine-base-de)
- [Repositorio Moonshine de Useful Sensors](https://github.com/usefulsensors/moonshine)
- [Moonshine AI en Hugging Face](https://huggingface.co/moonshine-ai/moonshine)
- [Moonshine v2 en GitHub](https://github.com/moonshine-ai/moonshine-v2)
- [Variantes del modelo en DeepWiki](https://deepwiki.com/moonshine-ai/moonshine/8-model-variants)</think>## Resumen

Moonshine Base DE ONNX es un modelo de reconocimiento automático de voz (ASR) en alemán, preparado para ejecutarse directamente en el navegador mediante Transformers.js. Se trata de un export ONNX del checkpoint `fidoriel/moonshine-base-de`, que a su vez es la variante base de la familia Moonshine desarrollada por Useful Sensors, una serie de modelos de ASR de baja latencia diseñados para inferencia en dispositivos. Con 62 millones de parámetros, el modelo está optimizado para funcionar en entornos de ejecución local, sin necesidad de servidores externos.

La relevancia de este modelo radica en que permite transcripción de voz en alemán con privacidad total, ejecutándose íntegramente en el cliente mediante WebAssembly o WebGPU. Su licencia Apache 2.0 facilita su integración en aplicaciones comerciales y de código abierto. El export ONNX incluye los archivos del encoder y decoder por separado, junto con una demo en un único archivo HTML que muestra su uso en el navegador.

El modelo se exportó con `optimum.exporters.onnx` sobre el checkpoint PyTorch original, aplicando un parche para omitir la entrada `attention_mask` y forzar la rama de no-caché del decoder debido a un bug conocido en el nodo `If` del grafo exportado. Esto implica que la decodificación recalcula las claves y valores en cada paso, con un coste de unos 6 segundos para procesar un clip de 5 segundos en CPU de escritorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine (familia ASR de Useful Sensors) |
| Parametros totales | 62 millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportado en FP32) |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model_merged.onnx, decoder_model_onnx, decoder_with_past_model.onnx) |

## Arquitectura y entrenamiento

El modelo es un export ONNX del checkpoint PyTorch `fidoriel/moonshine-base-de`, basado en la arquitectura Moonshine de Useful Sensors. Moonshine es una familia de modelos de reconocimiento de voz diseñados para minimizar latencia y uso de recursos, pensados para ejecutarse en dispositivos de bajo consumo. La variante base tiene 62 millones de parámetros, lo que la sitúa en un rango similar al modelo tiny de Whisper pero con un enfoque específico para inferencia on-device.

El proceso de exportación se realizó con `optimum.exporters.onnx` usando el task `automatic-speech-recognition-with-past`, con opset 14 y precisión FP32. Se aplicaron dos parches: el primero elimina la entrada `attention_mask` del grafo (al ser inferencia con batch de uno, se considera innecesaria); el segundo post-procesa el decoder fusionado para forzar `use_cache_branch=False`, ya que el nodo `If` exportado produce tokens incorrectos cuando se usa la rama de caché. Los datos de entrenamiento del modelo original no están disponibles en la información proporcionada.

## Capacidades

- Reconocimiento automático de voz (ASR) en alemán, transcribiendo audio a texto.
- Ejecución en navegador mediante Transformers.js v4, con WebAssembly y WebGPU.
- Inferencia local sin conexión, sin envío de datos a servidores externos.
- Decodificación greedy mediante un bucle manual en la demo, que evita el bug de caché del nodo `If`.
- Compatibilidad con el pipeline `automatic-speech-recognition` de Hugging Face y con `onnxruntime-web`.
- Exportación ONNX lista para usar con `endpoints_compatible` y region US.

No se mencionan capacidades como tool calling, agentes, visión o audio multilingüe en la información disponible.

## Casos de uso

- **Transcripción de voz en tiempo real en el navegador**: el modelo puede cargarse en una página web con Transformers.js para convertir voz en texto al alemán, sin necesidad de servidor. Es adecuado para aplicaciones de dictado, notas de voz o transcripción de reuniones.
- **Asistencia de accesibilidad**: permite a usuarios con dificultades de escritura dictar texto en alemán en aplicaciones web, con privacidad total al procesarse localmente.
- **Atención al cliente automatizada**: puede integrarse en un frontend para transcribir consultas habladas y pasarlas a un sistema de comprensión de lenguaje natural, reduciendo latencia al eliminar el envío de audio a servidores.
- **Subtitulado automático para vídeos**: desarrolladores pueden usarlo para generar subtítulos en alemán de vídeos directamente en el cliente, sin servicios externos de transcripción.
- **Prototipos y demos educativas**: el modelo incluye un demo HTML funcional, lo que lo hace útil para proyectos de investigación o enseñanza que muestren ASR en el navegador.
- **Aplicaciones de dictado en formularios web**: integración en campos de texto para dictar en alemán, con un modelo ligero que no requiere GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de WER, MMLU, HumanEval u otras métricas para este modelo.

## Requisitos de hardware

- **CPU**: funciona en navegadores con WebAssembly; el tiempo de decodificación típico es de ~6 segundos para un clip de 5 segundos en una CPU de escritorio, debido a la recalculación de K/V en cada paso.
- **GPU**: no se requiere GPU para ejecución en navegador; puede usar WebGPU si está disponible para acelerar la inferencia.
- **Memoria**: el tamaño total del repo es de 0.7 GB, con el decoder de ~200-211 MB; requiere suficiente memoria RAM para cargar los modelos ONNX en el navegador.
- **Opciones de despliegue**: Transformers.js, ONNX Runtime Web, o el servidor de demo incluido (`scripts/server_threaded.py`).
- **Latencia**: la demo reporta una decodificación de ~6 segundos para 5 segundos de audio en CPU de escritorio, sin caché.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `Phreak87/moonshine-base-de-onnx` | 62M | no disponible | aleman | Apache 2.0 | ONNX |
| `Phreak87/moonshine-tiny-de-onnx` | no disponible | no disponible | aleman | Apache 2.0 (probablemente) | ONNX |
| `fidoriel/moonshine-base-de` | 62M | no disponible | aleman | Apache 2.0 | PyTorch |
| `moonshine-ai/moonshine` (original) | no disponible | no disponible | ingles (principalmente) | MIT | Keras, ONNX |

La comparativa muestra que este modelo es la variante base de la familia Moonshine para alemán, mientras que existe una versión tiny con menos parámetros. La licencia Apache 2.0 es más permisiva que la MIT del modelo original en inglés, pero no se conocen datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- **Bug conocido en la caché del decoder**: el nodo `If` exportado produce tokens incorrectos cuando se usa la rama de caché. El modelo se distribuye con `use_cache_branch=False` forzado, lo que obliga a recalcular K/V en cada paso, aumentando la latencia.
- **Solo alemán**: el modelo está limitado al idioma alemán; no es útil para otros idiomas.
- **Riesgo de alucinación**: como cualquier ASR, puede producir transcripciones incorrectas en audio con ruido o acentos poco comunes.
- **Tamaño del modelo**: 0.7 GB de archivos ONNX, lo que puede suponer una carga inicial lenta en conexiones de banda limitada o problemas de memoria en dispositivos móviles.
- **Limitaciones de producción**: la demo no usa el pipeline estándar de Transformers.js; cualquier implementación debe replicar el bucle de decodificación manual para evitar el bug de caché, lo que complica el mantenimiento.

## Enlaces

- [Modelo en Hugging Face: Phreak87/moonshine-base-de-onnx](https://huggingface.co/Phreak87/moonshine-base-de-onnx)
- [Modelo original: fidoriel/moonshine-base-de](https://huggingface.co/fidoriel/moonshine-base-de)
- [Repositorio Moonshine de Useful Sensors](https://github.com/usefulsensors/moonshine)
- [Moonshine AI en Hugging Face](https://huggingface.co/moonshine-ai/moonshine)
- [Moonshine v2 en GitHub](https://github.com/moonshine-ai/moonshine-v2)
- [DeepWiki: variantes del modelo](https://deepwiki.com/moonshine-ai/moonshine/8-model-variants)
