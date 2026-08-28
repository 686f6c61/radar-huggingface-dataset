# aoiandroid/parakeet-ctc-0.6b-zh-cn-coreml-macos

## Resumen

El repositorio `aoiandroid/parakeet-ctc-0.6b-zh-cn-coreml-macos` contiene una conversión del modelo de reconocimiento de voz automático (ASR) Parakeet CTC 0.6B de NVIDIA, compilado a formato Core ML para su ejecución nativa en macOS con Apple Silicon. El modelo original, desarrollado por NVIDIA, es un sistema de transcripción de voz de extremo a extremo con 600 millones de parámetros, entrenado sobre más de 17 000 horas de habla en chino mandarín (zh-CN) e inglés americano (en-US). Esta adaptación específica está orientada a la aplicación TranslateBlue, que aprovecha la aceleración por hardware del Neural Engine (ANE) de los chips Apple.

La relevancia de este modelo radica en que permite ejecutar reconocimiento de voz de alta calidad de forma local en dispositivos Apple, sin necesidad de conexión a la nube, lo que garantiza privacidad y baja latencia. El repositorio incluye los paquetes `.mlmodelc` compilados a partir de los `.mlpackage` originales, con especialización ANE que se mantiene local al dispositivo. Aunque el modelo base de NVIDIA se distribuye bajo licencia CC-BY-4.0, este repositorio declara licencia MIT para los artefactos Core ML empaquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo ASR de extremo a extremo basado en CTC (Connectionist Temporal Classification), con codificador Transformer. Detalles exactos de la arquitectura interna no disponibles en la informacion proporcionada. |
| Parametros totales | 600 millones (segun documentacion de NVIDIA para Parakeet-CTC-0.6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de audio, no procesa texto secuencial con ventana de contexto) |
| Tipos de cuantizacion | int8 (version recomendada en el mirror) y fp32 (version v1 del encoder) |
| Idiomas soportados | Chino mandarin (zh-CN) e ingles americano (en-US), con soporte de code-switching entre ambos |
| Licencia | MIT (para los artefactos Core ML de este repositorio); el modelo original de NVIDIA se distribuye bajo CC-BY-4.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`), derivado de `.mlpackage` |

## Arquitectura y entrenamiento

El modelo base Parakeet-CTC-0.6B es un sistema de reconocimiento de voz de extremo a extremo desarrollado por NVIDIA, que emplea una arquitectura basada en CTC con un codificador Transformer. Se entrenó con más de 17 000 horas de habla etiquetada en chino mandarín y en inglés americano, lo que le permite transcribir ambas lenguas de forma robusta, incluso en contextos de cambio de idioma dentro de una misma frase (code-switching). El modelo produce texto con mayúsculas y minúsculas mixtas e incluye puntuación básica (puntos, comas, signos de interrogación).

En este repositorio, el modelo se ha convertido al formato Core ML mediante un proceso de compilación de paquetes `.mlpackage` a `.mlmodelc`. La especialización para el Neural Engine (ANE) se realiza de forma local en cada dispositivo, lo que implica que el modelo puede aprovechar la aceleración por hardware en los chips Apple Silicon (M1, M2, M3 y sucesores). No se dispone de información detallada sobre el proceso de entrenamiento específico de esta conversión, ni sobre técnicas adicionales como RLHF o DPO, que no son aplicables a un modelo ASR.

## Capacidades

- Transcripción de voz a texto en chino mandarín e inglés americano, con soporte de code-switching entre ambos idiomas.
- Generación de texto con puntuación básica (puntos, comas, signos de interrogación) y mayúsculas/minúsculas mixtas.
- Ejecución local en macOS con Apple Silicon, aprovechando el Neural Engine para aceleración por hardware.
- Inferencia de baja latencia gracias a la compilación nativa a Core ML.
- Sin dependencia de servicios en la nube, lo que garantiza privacidad de los datos de audio.
- No se ha confirmado soporte de tool calling, funciones de agente ni razonamiento multi-paso, dado que es un modelo puramente de reconocimiento de voz.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede convertir en tiempo real el audio de herramientas como Zoom o Meet en texto, ejecutándose localmente en un Mac con Apple Silicon para evitar el envío de audio a servidores externos.
- Subtitulado automático de vídeos: integrado en aplicaciones de edición de vídeo o generación de contenido, permite crear subtítulos en chino e inglés de forma offline, con alta precisión gracias a las 17 000 horas de entrenamiento.
- Asistentes de voz para aplicaciones de escritorio: al ser un modelo compacto (600 M parámetros) y compilado a Core ML, puede integrarse en apps de macOS para dictado de texto, control por voz o búsqueda por comandos hablados.
- Traducción y aprendizaje de idiomas: al soportar code-switching, resulta útil en aplicaciones educativas que necesiten transcribir conversaciones bilingües chino-inglés para su posterior análisis o traducción.
- Accesibilidad para personas con discapacidad motora: la transcripción local permite a usuarios dictar texto en aplicaciones sin depender de servicios en red, mejorando la autonomía y la privacidad.
- Análisis de llamadas de atención al cliente: en entornos empresariales con datos sensibles, el modelo puede transcribir grabaciones de llamadas en chino e inglés de forma local, cumpliendo requisitos de confidencialidad y reduciendo costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El mirror del repositorio menciona una distribución de CER (Character Error Rate) y una comparación de cuantización entre el encoder v1 (fp32) y el encoder v2 (int8), pero no se proporcionan cifras concretas en los datos facilitados. Para métricas oficiales del modelo original, se recomienda consultar la documentación de NVIDIA NIM.

## Requisitos de hardware

- Mac con chip Apple Silicon (M1, M2, M3 o superior) para ejecutar los modelos Core ML compilados con aceleración ANE.
- La especialización ANE se realiza localmente en cada dispositivo, por lo que no se requiere configuración adicional.
- Tamaño del repositorio: 1.8 GB, lo que implica un uso de almacenamiento moderado para la aplicación.
- No se dispone de datos sobre VRAM específica, ya que Core ML gestiona la memoria de forma unificada en los SoC de Apple.
- Opciones de despliegue: integración directa en aplicaciones macOS mediante Core ML framework; no se menciona compatibilidad con vLLM, llama.cpp u otras herramientas de inferencia estándar, al ser un formato propietario de Apple.
- Latencia y throughput: no disponibles en la información proporcionada, aunque se espera baja latencia al usar el Neural Engine.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| Parakeet-CTC-0.6B (NVIDIA) | 600 M | zh-CN, en-US | CC-BY-4.0 | ONNX, TensorRT, etc. |
| Whisper small (OpenAI) | 244 M | Multilingue (99 idiomas) | MIT | PyTorch, Core ML, GGUF |
| Parakeet-CTC-0.6B CoreML (este repo) | 600 M | zh-CN, en-US | MIT (artefactos) | Core ML (.mlmodelc) |

No se dispone de una comparativa completa con otros modelos ASR en la información proporcionada. Whisper small es una alternativa multilingüe con menor número de parámetros, pero Parakeet ofrece mayor precisión en chino e inglés gracias a su entrenamiento especializado. La ventaja de este repositorio es su formato Core ML nativo para macOS, que Whisper no ofrece de forma directa (aunque existen conversiones de terceros).

## Limitaciones y advertencias

- El modelo está limitado a chino mandarín e inglés americano; no soporta otros dialectos chinos ni variantes del inglés (británico, australiano, etc.).
- No se han publicado métricas de error (CER/WER) específicas para esta conversión Core ML, por lo que el rendimiento real en producción debe validarse con datos propios.
- La licencia MIT del repositorio se aplica a los artefactos Core ML, pero el modelo subyacente de NVIDIA mantiene la licencia CC-BY-4.0, que requiere atribución y puede imponer restricciones adicionales en ciertos usos comerciales.
- La especialización ANE se genera localmente, lo que implica que la primera ejecución puede requerir un proceso de compilación adicional en el dispositivo.
- No se garantiza compatibilidad con versiones antiguas de macOS; se recomienda usar las últimas versiones de macOS y Xcode para evitar problemas de compatibilidad con el formato `.mlmodelc`.
- Al ser un modelo de reconocimiento de voz, puede presentar errores en entornos ruidosos o con acentos no representados en los datos de entrenamiento, aunque no se dispone de información específica sobre sesgos o alucinaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aoiandroid/parakeet-ctc-0.6b-zh-cn-coreml-macos
- Repositorio fuente (FluidInference): https://huggingface.co/FluidInference/parakeet-ctc-0.6b-zh-cn-coreml
- Modelo original en NVIDIA NIM: https://build.nvidia.com/nvidia/parakeet-ctc-0_6b-zh-cn
- Mirror del repositorio con documentación adicional: https://huggingface.co/aoiandroid/mirror-FluidInference-parakeet-ctc-0.6b-zh-cn-coreml
- Repositorio GitHub de FluidInference (mobius): https://github.com/FluidInference/mobius/tree/main/models/stt/parakeet-ctc-0.6b-zh-cn
