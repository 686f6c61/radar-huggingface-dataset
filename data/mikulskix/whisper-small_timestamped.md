# mikulskix/whisper-small_timestamped

## Resumen

whisper-small_timestamped es un espejo (mirror) del export ONNX de Whisper Small publicado por onnx-community, mantenido por el usuario mikulskix para que la aplicación web AudioEdit no dependa de repositorios de terceros. No se trata de un modelo nuevo ni de un ajuste fino: es una copia byte-idéntica (verificada por SHA-256) de un subconjunto de ficheros de la revisión `65caa70f294b46e1c33ff820aae6b16d048ab818` del repositorio original, limitada a los artefactos que consume dicha aplicación.

El modelo subyacente es Whisper Small de OpenAI, un transformer encoder-decoder entrenado para reconocimiento automático del habla con supervisión débil a gran escala. La particularidad del export es que incluye las salidas de atención cruzada (cross-attention) necesarias para calcular marcas de tiempo a nivel de palabra en transformers.js, lo que lo hace útil para tareas de edición de audio donde hay que alinear texto y señal temporal.

Su relevancia es por tanto acotada: sirve como dependencia empaquetada y reproducible para aplicaciones JavaScript/TypeScript que ejecutan ASR en el navegador o en Node mediante ONNX Runtime Web, no como un modelo de propósito general para investigación o despliegue en servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parametros totales | no disponible (el modelo base Whisper Small tiene 244 M según la documentación de OpenAI, no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | encoder: fp32, fp16, int8; decoder: q4, int8 |
| Idiomas soportados | no disponible (no se declara lista de idiomas en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model y decoder_model_merged) más ficheros JSON de tokenizer y config |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Small: un transformer encoder-decoder que procesa espectrogramas log-Mel como entrada y genera tokens de texto de forma autorregresiva. El export ONNX conserva dos subgrafos separados, `encoder_model` y `decoder_model_merged`, y expone las matrices de atención cruzada del decoder para permitir la extracción de marcas de tiempo por palabra en transformers.js.

No se ha realizado ningún entrenamiento adicional ni ajuste fino en este repositorio: la model card indica explícitamente que los ficheros son idénticos al export de onnx-community. Por tanto, los datos de entrenamiento, el número de tokens y el proceso de alineación (incluido el uso de supervisión débil a gran escala descrito por Radford et al., 2022) corresponden íntegramente al modelo original de OpenAI y no se detallan en la información disponible. La innovación técnica relevante aquí es el propio export: la preservación de las salidas de atención cruzada para el cálculo de timestamps a nivel de palabra.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante el pipeline `automatic-speech-recognition`.
- Generación de marcas de tiempo a nivel de palabra gracias a las salidas de atención cruzada incluidas en el export.
- Ejecución en navegador y en Node.js a través de transformers.js y ONNX Runtime Web.
- Inferencia con distintos niveles de cuantización (fp32, fp16, int8 en el encoder; q4 e int8 en el decoder) para ajustar precisión y consumo de recursos.
- No se declaran capacidades de traducción, detección de idioma, tool calling, agentes ni multimodalidad más allá del audio de entrada.
- El soporte multilingüe no está documentado en este repositorio; debe consultarse el modelo base.

## Casos de uso

- Edición de audio asistida por texto en aplicaciones web: AudioEdit utiliza este export para transcribir y localizar palabras concretas en la línea temporal, de modo que el usuario pueda cortar, mover o sustituir fragmentos de audio seleccionando el texto correspondiente.
- Subtitulado con sincronización fina: las marcas de tiempo por palabra permiten generar subtítulos con resaltado karaoke o con cortes ajustados al habla, algo que los timestamps por segmento no ofrecen.
- Transcripción en el cliente sin backend: al ejecutarse con transformers.js y ONNX Runtime Web, el audio no sale del navegador, lo que resulta adecuado para aplicaciones con requisitos de privacidad o para reducir costes de infraestructura.
- Prototipado rápido de interfaces de voz: desarrolladores que necesitan un componente ASR funcional en una demo web pueden cargar este repositorio directamente sin gestionar conversiones ONNX propias.
- Herramientas de accesibilidad: generación de transcripciones sincronizadas para vídeos y podcasts en páginas estáticas o aplicaciones Electron.
- Reproducibilidad de builds: al fijar una revisión concreta y verificar los ficheros por SHA-256, el repositorio sirve para congelar dependencias en pipelines de integración continua de aplicaciones que empaquetan el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 1,0 GB, pero la inferencia solo requiere cargar el encoder y el decoder en la variante elegida; con int8 o q4 el consumo es notablemente menor que con fp32.
- No se dispone de cifras de VRAM ni de RAM específicas en la información proporcionada.
- Al estar orientado a transformers.js, el destino principal es CPU (WASM) o GPU vía WebGPU en el navegador; también puede ejecutarse en Node.js con ONNX Runtime.
- Para despliegue en servidor con ONNX Runtime, GPU de consumo como RTX 3060 o superiores son suficientes para un modelo de este tamaño, aunque no se confirma con datos del repositorio.
- Opciones de despliegue: transformers.js (principal), ONNX Runtime Web/Node. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Timestamps por palabra | Licencia | Formato |
|---|---|---|---|---|---|
| mikulskix/whisper-small_timestamped | no disponible | no disponible | Sí (cross-attention) | Apache 2.0 | ONNX |
| onnx-community/whisper-small_timestamped | no disponible | no disponible | Sí (cross-attention) | Apache 2.0 | ONNX |
| openai/whisper-small | no disponible | no disponible | Parcial (por segmento en la implementación original) | Apache 2.0 | PyTorch |

La diferencia principal frente al repositorio de onnx-community es el alcance: este mirror incluye solo un subconjunto de ficheros y no añade mejoras técnicas. Frente al modelo original de OpenAI, la ventaja es la ejecución en JavaScript y la exposición de las salidas de atención cruzada.

## Limitaciones y advertencias

- Es un mirror de un subconjunto de ficheros: no contiene todos los artefactos del repositorio original, por lo que no debe tratarse como sustituto completo.
- Al no haberse reentrenado, hereda todos los sesgos y errores de Whisper Small, incluidos los sesgos por acento, dialecto y dominio que documenta OpenAI.
- Riesgo de alucinación conocido en Whisper: en segmentos con silencio, ruido o audio musical puede generar texto inventado.
- No se declara lista de idiomas soportados en este repositorio; la cobertura multilingüe debe verificarse contra el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribución a OpenAI y a onnx-community.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no cuenta con validación de la comunidad; para producción es preferible referenciar directamente el repositorio original de onnx-community con la revisión fijada.
- El rendimiento en navegador depende del soporte de WebGPU o WASM del cliente; en dispositivos de gama baja la latencia puede ser elevada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mikulskix/whisper-small_timestamped
- Export original: https://huggingface.co/onnx-community/whisper-small_timestamped
- Modelo base: https://huggingface.co/openai/whisper-small
- Código de Whisper: https://github.com/openai/whisper
- Paper: Radford et al., Robust Speech Recognition via Large-Scale Weak Supervision, 2022 (https://arxiv.org/abs/2212.04356)
- transformers.js: https://github.com/huggingface/transformers.js
