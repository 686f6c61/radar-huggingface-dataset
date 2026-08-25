# aoiandroid/silero-vad-coreml-macos

## Resumen

El modelo `aoiandroid/silero-vad-coreml-macos` es un paquete de CoreML compilado del modelo de detección de actividad de voz (VAD) Silero, orientado a la plataforma macOS. El autor, aoiandroid, lo distribuye bajo licencia MIT como parte de su proyecto TranslateBlue, y se presenta como un bundle compilado (`.mlmodelc`) a partir de los paquetes `.mlpackage` del repositorio fuente `FluidInference/silero-vad-coreml`. Su propósito es ofrecer una implementación ligera y on-device de VAD para aplicaciones de procesamiento de audio en equipos Apple.

La relevancia de este modelo radica en que permite integrar detección de voz en tiempo real dentro de aplicaciones macOS sin depender de servicios en la nube, aprovechando el acelerador Neural Engine de Apple. No obstante, la información técnica disponible en el repositorio es muy limitada: no se especifican parámetros, arquitectura interna ni métricas de rendimiento. El repositorio no contiene archivos de pesos visibles (tamaño 0.0 GB), por lo que su uso práctico dependerá de la compilación local o de la descarga desde otras fuentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de detección de actividad de voz, basado en Silero VAD) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplicable (entrada de audio, no texto) |
| Tipos de cuantización | no disponible (formato CoreML nativo) |
| Idiomas soportados | no disponible (detección de voz, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` (CoreML compilado), `.mlpackage` en la fuente original |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo ni sobre su entrenamiento. Se sabe que es una conversión a CoreML del modelo Silero VAD, que en su versión original emplea una red neuronal con capas convolucionales y recurrentes (CNN + LSTM) para clasificar tramos de audio en voz o no voz. Sin embargo, no se confirma si esta conversión mantiene exactamente esa arquitectura ni qué versión de Silero VAD se utiliza. No se han publicado datos sobre el conjunto de entrenamiento, el número de tokens (no aplicable) ni técnicas de ajuste como RLHF o DPO.

## Capacidades

- Detección de actividad de voz: clasifica segmentos de audio como voz o no voz, útil para preprocesamiento en sistemas de reconocimiento de voz.
- Ejecución local en dispositivos Apple: al estar compilado como CoreML, funciona sin conexión y con baja latencia en macOS.
- Integración con Swift: los archivos `.mlmodelc` pueden cargarse directamente en aplicaciones Swift mediante CoreML.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- No es un modelo multimodal ni de lenguaje; su única función es el VAD.

## Casos de uso

- **Transcripción de voz en tiempo real**: antes de enviar audio a un motor de reconocimiento, el VAD puede filtrar silencios y solo enviar los segmentos con voz, reduciendo costes y latencia.
- **Activación por voz en aplicaciones macOS**: usar el modelo para detectar una palabra de activación (por ejemplo, «Hey Siri») en un flujo de audio continuo.
- **Grabación inteligente de notas de voz**: el VAD permite iniciar y detener la grabación automáticamente cuando el usuario habla o deja de hablar, mejorando la experiencia de uso.
- **Preprocesamiento para análisis de audio**: en tareas de diarización o análisis de sentimiento, se puede usar el VAD para separar las regiones de voz del ruido de fondo.
- **Aplicaciones de accesibilidad**: sistemas de control por voz para personas con discapacidad motora, donde la detección de voz es el disparador de comandos.
- **Pruebas de calidad de audio**: en entornos de desarrollo, se puede usar el VAD para verificar que un flujo de audio contiene voz antes de pasar a un sistema de seguimiento de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de exactitud, F1, velocidad de procesamiento ni comparaciones con otros modelos VAD.

## Requisitos de hardware

- Se ejecuta en dispositivos Apple con macOS 11.0 o superior (según el formato CoreML).
- Aprovecha la Neural Engine (ANE) de los chips de Apple Silicon (M1/M2/M3) para aceleración de inferencia.
- En Macs con Intel, se ejecuta en CPU o GPU, con menor rendimiento que en Apple Silicon.
- No requiere GPU externa ni tarjetas gráficas dedicadas; es apto para integración en aplicaciones de escritorio.
- El despliegue se realiza mediante CoreML, por lo que no es compatible con vLLM, llama.cpp, Ollama o TGI.
- El modelo es ligero (típicamente los modelos VAD de Silero tienen <2 MB), por lo que la latencia en un Apple Silicon es de milisegundos, aunque no se dispone de cifras exactas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro del mismo formato CoreML para macOS. El modelo original Silero VAD está disponible en otros formatos (ONNX, PyTorch), pero no hay datos de rendimiento comparativo en esta información.

## Limitaciones y advertencias

- **Específico de macOS**: no funciona en Linux, Windows ni dispositivos móviles iOS (existe una versión hermana para iOS, pero no es este repositorio).
- **Falta de documentación técnica**: no se especifican la versión exacta de Silero VAD, la tasa de muestreo esperada ni los formatos de audio admitidos.
- **Repositorio sin pesos**: el tamaño del repo es 0.0 GB, por lo que el modelo no está directamente disponible para descargar; es necesario compilarlo o buscar el repositorio fuente.
- **Licencia MIT**: permite uso comercial, pero sin garantías; el autor no ofrece soporte oficial.
- **No es un modelo de lenguaje**: no debe usarse para generación de texto ni razonamiento; su única función es la detección de actividad de voz.
- **Riesgo de sesgo en la detección**: el VAD original de Silero puede fallar con acentos muy marcados o ruido extremo, aunque no se han evaluado estos casos en esta versión.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/aoiandroid/silero-vad-coreml-macos)
- [Repositorio fuente de FluidInference](https://huggingface.co/FluidInference/silero-vad-coreml)
- [Repositorio espejo con más detalles](https://huggingface.co/aoiandroid/mirror-FluidInference-silero-vad-coreml)
- [GitHub paean-ai/silero-vad-swift](https://github.com/paean-ai/silero-vad-swift) (implementación similar en Swift, no directamente vinculada)
- [Recurso de Sweet Tea Studio sobre el modelo](https://sweettea.co/resources/aoiandroid-silero-vad-coreml-huggingface-model-aoiandroid-silero-vad-coreml)
