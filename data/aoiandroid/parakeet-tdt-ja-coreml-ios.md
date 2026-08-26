# aoiandroid/parakeet-tdt-ja-coreml-ios

## Resumen

El modelo `aoiandroid/parakeet-tdt-ja-coreml-ios` es una conversión a CoreML del modelo Parakeet TDT 0.6B japonés de NVIDIA, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura FastConformer-TDT (Token-and-Duration Transducer). El autor, `aoiandroid`, ha compilado los paquetes `.mlpackage` a `.mlmodelc` específicamente para su uso en dispositivos iOS, dentro del contexto de la aplicación TranslateBlue. Este modelo resuelve el problema de ejecutar ASR de alta calidad de forma local en el dispositivo, sin depender de conexiones a la nube, lo que reduce latencia y protege la privacidad del usuario. La relevancia actual radica en la creciente demanda de soluciones de IA en el edge, especialmente en el ecosistema Apple, donde CoreML permite una integración fluida con el Neural Engine (ANE).

El modelo tiene aproximadamente 0,6 mil millones de parámetros, y su formato compilado (`.mlmodelc`) está optimizado para el hardware de Apple. El repositorio ocupa 2,4 GB, lo que da una idea del tamaño de los pesos y los recursos necesarios para su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ASR, no contexto textual) |
| Tipos de cuantizacion | no disponible (compilado a Core ML, `.mlmodelc`) |
| Idiomas soportados | japones |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` (Core ML compilado), `.mlpackage` (manifest) |

## Arquitectura y entrenamiento

El modelo original es un FastConformer-TDT, una arquitectura de ASR que combina un encoder FastConformer con un decodificador basado en transductores de token y duracion (Token-and-Duration Transducer). Esta arquitectura es conocida por su eficiencia en el reconocimiento de voz de largo alcance, ya que modela simultaneamente la secuencia de tokens y la duracion temporal de cada segmento. El modelo base fue entrenado por NVIDIA para el idioma japones, aunque los detalles especificos del conjunto de datos (numero de tokens, composicion, metodos de alineacion) no se han proporcionado en la informacion disponible.

La conversion a CoreML ha sido realizada por `aoiandroid`, quien ha compilado los paquetes `.mlpackage` a `.mlmodelc` para su uso en iOS. La especializacion en el Neural Engine (ANE) se mantiene local en el dispositivo, lo que significa que la optimizacion de hardware se aplica en tiempo de ejecucion segun el dispositivo de destino. No se mencionan procesos de RLHF o DPO, ya que se trata de un modelo ASR, no generativo.

## Capacidades

- Reconocimiento de voz automatico (ASR) en japones, transcribiendo audio a texto.
- Optimizado para ejecucion local en dispositivos Apple mediante CoreML, aprovechando el Neural Engine (ANE).
- Integracion con aplicaciones iOS a traves del framework CoreML, permitiendo inferencia sin conexion.
- Disenado para uso en la aplicacion TranslateBlue, aunque puede ser utilizado en otras apps de iOS.
- No soporta tool calling, razonamiento multi-paso, generacion de codigo, vision ni otras capacidades generativas; es exclusivamente un modelo de ASR.

## Casos de uso

- **Transcripcion de voz en tiempo real en apps iOS**: el modelo puede procesar audio del microfono y convertirlo en texto al instante, con la ventaja de que todo se ejecuta en el dispositivo, sin necesidad de conexion a internet. Es adecuado para apps de notas, mensajeria o asistentes de voz.
- **Dictado en aplicaciones de productividad**: integrado en un editor de texto iOS, permite al usuario dictar en japones y obtener transcripciones precisas, con baja latencia gracias a la optimizacion CoreML.
- **Subtitulacion automatica para contenido multimedia**: los desarrolladores pueden usar el modelo para generar subtitulos de videos o podcasts en japones, procesando el audio localmente en el iPhone o iPad.
- **Asistente de accesibilidad**: personas con dificultades de escritura pueden usar el modelo para convertir su voz en texto en tiempo real, mejorando la interaccion con dispositivos iOS.
- **Traduccion y aprendizaje de idiomas**: en una app de aprendizaje de japones, el modelo puede transcribir la pronunciacion del usuario para compararla con la referencia, ayudando a practicar la entonacion.
- **Grabacion de reuniones y entrevistas**: el modelo puede transcribir grabaciones de audio en japones, permitiendo generar actas o busquedas textuales dentro de la grabacion, todo ello sin salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es una conversion de un modelo de NVIDIA, pero no se han proporcionado datos de WER (Word Error Rate) u otras metricas para esta version CoreML. Se recomienda consultar el modelo original de NVIDIA para obtener datos de rendimiento de la arquitectura base.

## Requisitos de hardware

- **Dispositivos iOS compatibles**: requiere un iPhone o iPad con Apple Neural Engine (ANE) y soporte para CoreML (iPhone 8 y posteriores, aunque se recomienda iPhone 12 o superior para un rendimiento optimo).
- **Almacenamiento**: se necesitan al menos 2,4 GB de espacio libre en el dispositivo para alojar el modelo compilado.
- **Memoria RAM**: no se especifica un valor concreto, pero un modelo de 0,6B parametros puede requerir entre 1,5 y 2,5 GB de RAM en tiempo de ejecucion, dependiendo de la resolucion del audio.
- **Despliegue**: el modelo se integra en apps iOS mediante CoreML, con la especializacion ANE realizada en el dispositivo. No es compatible con vLLM, Ollama u otras herramientas de inferencia de servidores, ya que esta orientado a plataformas Apple.
- **Latencia**: no se han proporcionado datos de latencia, pero al ejecutarse en el ANE se espera una latencia inferior a 500 ms para segmentos de audio de 5 segundos en dispositivos modernos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `parakeet-tdt-ja-coreml-ios` (este) | FastConformer-TDT | 0,6B | no disponible | MIT | CoreML para iOS |
| `parakeet-tdt-0.6b-ja` (NVIDIA original) | FastConformer-TDT | 0,6B | no disponible | CC-BY-4.0 (probable) | PyTorch, ONNX |
| `whisper-small` (OpenAI) | Transformer encoder-decoder | 244M | no aplica (ASR) | MIT | PyTorch, ONNX, CoreML |

La comparativa se basa en la arquitectura y formato. El modelo original de NVIDIA es el punto de referencia para rendimiento, mientras que esta version CoreML sacrifica flexibilidad por integracion nativa en iOS. Whisper es una alternativa con soporte multilingue, pero no esta optimizado para el hardware Apple de la misma forma.

## Limitaciones y advertencias

- **Idioma limitado**: el modelo solo soporta japones; no es utilizable para otros idiomas.
- **Sesgos y errores de transcripcion**: como todo modelo ASR, puede presentar errores en acentos, ruido de fondo o habla rapida, y puede tener sesgos hacia ciertos dialectos o registros.
- **Riesgo de alucinacion**: aunque es un modelo ASR, puede producir transcripciones incorrectas cuando el audio es ininteligible o contiene ruido, generando texto plausible pero incorrecto.
- **Restricciones de licencia**: aunque la licencia es MIT, el modelo base de NVIDIA puede tener su propia licencia (CC-BY-4.0), lo que podria afectar la redistribucion del modelo derivado.
- **Requisitos de plataforma**: esta version compilada solo funciona en iOS/macOS; no es portable a otros sistemas sin re-conversion.
- **Tamanio y memoria**: el modelo ocupa 2,4 GB en disco, lo que puede ser un inconveniente en dispositivos con poco almacenamiento.

## Enlaces

- [HuggingFace: aoiandroid/parakeet-tdt-ja-coreml-ios](https://huggingface.co/aoiandroid/parakeet-tdt-ja-coreml-ios)
- [HuggingFace: aoiandroid/parakeet-tdt-ja-coreml (fuente)](https://huggingface.co/aoiandroid/parakeet-tdt-ja-coreml)
- [Apple coreai-models (repositorio de exportacion de modelos)](https://github.com/apple/coreai-models/tree/main/models/parakeet)
- [Swift Package Index: Qwen3Speech (herramientas de ASR en Swift)](https://swiftpackageindex.com/soniqo/speech-swift)
