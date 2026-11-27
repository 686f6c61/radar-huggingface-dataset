# desert-ant-labs/uhm

## Resumen

Uhm es un modelo de clasificación de audio especializado en la detección de muletillas y disfluencias del habla («uh», «um», «hmm») con precisión de trama de hasta 20 ms. Lo desarrolla Desert Ant Labs y se distribuye como un conjunto de pesos optimizados para inferencia en dispositivo (Core ML, LiteRT, ONNX), no como un modelo de lenguaje generativo. Su función es localizar y delimitar en el tiempo cada muletilla dentro de un archivo de audio, sin necesidad de transcripción previa.

El modelo está entrenado principalmente en inglés y aplica transferencia acústica a español, francés, alemán y neerlandés. Se ofrece en tres formatos: Core ML en fp16 (45 MB) para iOS y macOS, Core AI (45 MB) para iOS 27 y macOS 27, y LiteRT en int8 con cuantización solo de pesos (24 MB) para Android, Linux, Windows y navegador, con equivalencia declarada del 99 % respecto al ONNX.

Su relevancia actual radica en que resuelve una tarea muy concreta de posproducción de audio y vídeo (eliminación de muletillas) íntegramente en el dispositivo, sin enviar audio a la nube y con latencias compatibles con edición interactiva. La licencia es propietaria de tipo «source-available» (desert-ant-labs-source-available), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de audio; no se detalla en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa audio; resolución temporal de hasta 20 ms) |
| Tipos de cuantizacion | fp16 (Core ML), int8 weight-only (LiteRT) |
| Idiomas soportados | de, en, es, fr, nl (entrenado en inglés con transferencia acústica al resto) |
| Licencia | desert-ant-labs-source-available (propietaria, source-available) |
| Formato de pesos | Core ML (`uhm.mlmodelc`, compilado), Core AI (`uhm.aimodel`), LiteRT (`uhm.tflite`), ONNX (`uhm.onnx`) |

## Arquitectura y entrenamiento

No se detalla en la información proporcionada la arquitectura interna del modelo (tipo de red, capas, mecanismo de atención o diseño de las cabezas de clasificación). Lo que sí se explicita es su naturaleza: un clasificador de audio que opera sobre señal de 16 kHz mono y produce intervalos temporales con inicio, fin y confianza en el rango 0–1. La resolución temporal declarada llega a 20 ms, y el SDK permite fijar una duración mínima de span (0,12 s por defecto, ajustable a 0,08 s en los ejemplos).

El entrenamiento se realizó en inglés, con transferencia acústica a español, francés, alemán y neerlandés. No se indica el volumen de datos, la composición del corpus ni si hubo etapas de ajuste fino supervisado adicionales. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplicarían a un modelo de este tipo. El etiquetado del tipo de muletilla (`.uh`, `.um`, `.hmm`, `.and`, `.other`) no lo realiza el propio modelo, sino un clasificador auxiliar que corre sobre SoundAnalysis de Apple y que, por tanto, solo está disponible en plataformas Apple.

## Capacidades

- Detección de muletillas y disfluencias con precisión de trama de hasta 20 ms, devolviendo intervalos con inicio, fin y confianza.
- Funcionamiento sin transcripción: analiza directamente la señal de audio.
- Inferencia en dispositivo en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Ajuste del equilibrio entre exhaustividad y precisión mediante presets de sesgo: `.precision` (0,75), `.balanced` (0,65) y `.recall` (0,50).
- Configuración de la duración mínima de span para descartar detecciones demasiado cortas.
- Etiquetado del tipo de muletilla en plataformas Apple mediante SoundAnalysis (no disponible en Kotlin ni JavaScript, donde el tipo se devuelve como `null`).
- Reconciliación con transcripciones: acepta palabras con marcas de tiempo y devuelve los rangos ajustados para recortar muletillas sin cortar palabras reales (elimina palabras que corresponden a la muletilla, recorta solapamientos y divide palabras que la contienen).
- Seguimiento de progreso mediante `progressHandler` y cancelación de tareas en curso.
- No soporta tool calling, razonamiento multi-paso ni generación de texto: es un clasificador de audio, no un modelo generativo.

## Casos de uso

- Edición de pódcast y entrevistas: el modelo devuelve los intervalos exactos de cada «uh» y «um» para que una herramienta de edición los recorte automáticamente con el preset `.precision`, minimizando el riesgo de cortar palabras reales.
- Limpieza de audio para vídeo corporativo y formación: integrado en un pipeline de posproducción, permite eliminar disfluencias de grabaciones largas con seguimiento de progreso y cancelación, sin subir el material a la nube.
- Transcripción asistida: combinado con un ASR que aporte marcas de tiempo por palabra, la función de reconciliación ajusta los rangos para que el subtitulado no incluya muletillas ni pierda audio de palabras reales.
- Herramientas de locución y doblaje: análisis en el dispositivo en iOS o Android para que el propio hablante revise sus pausas y muletillas antes de publicar, con latencias de edición interactiva.
- Analítica de calidad del habla: en investigación sobre fluidez verbal o evaluación de presentaciones, el modelo permite cuantificar la densidad de muletillas por minuto y su distribución temporal en cada idioma soportado.
- Procesamiento por lotes en servidor Linux: con el formato LiteRT u ONNX y el binding de Node (`/native`), se puede ejecutar la detección sobre archivos en un pipeline de CI o de ingesta de contenidos sin depender de macOS.
- Aplicaciones web de edición rápida: la demo y el paquete de navegador (WebAssembly con LiteRT.js) permiten ofrecer una línea de tiempo de muletillas clicable directamente en el navegador, sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara que el formato LiteRT int8 «coincide con `uhm.onnx` en un 99 %» (la frase queda truncada en el material proporcionado), lo que sugiere una equivalencia de salidas entre ambas variantes, pero no constituye una métrica de precisión o recall frente a un conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los pesos ocupan 45 MB en fp16 (Core ML y Core AI) y 24 MB en int8 (LiteRT), por lo que el modelo cabe holgadamente en memoria unificada o en RAM de dispositivos móviles.
- GPU recomendadas: no aplica en el sentido habitual; el diseño es para ejecución en dispositivo (CPU, GPU o Neural Engine según la plataforma). No se especifican aceleradores de servidor.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso; el modelo está pensado para iPhone, iPad, Mac, dispositivos Android, navegador y equipos de escritorio convencionales.
- Opciones de despliegue: SDK propio con paquetes Swift (Swift Package Manager), Kotlin (Maven, `ai.desertant:uhm`) y JavaScript (`@desert-ant-labs/uhm` para navegador con LiteRT.js, y `@desert-ant-labs/uhm/native` para Node). Los pesos se descargan de Hugging Face en el primer uso y se cachean.
- Latencia y throughput: no disponibles. El SDK expone `result.phaseTimings.inferenceSec` para medir el tiempo de inferencia por ejecución, pero no se publican cifras de referencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el material proporcionado. La tarea (detección de muletillas con precisión de trama y ejecución en dispositivo) es específica y la ficha no incluye alternativas con las que contrastar parámetros, contexto, licencia o rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Uhm (desert-ant-labs) | no disponible | no aplica (audio) | source-available propietaria | Hugging Face, SDK Swift/Kotlin/JS |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado en inglés: el soporte de español, francés, alemán y neerlandés se basa en transferencia acústica, no en entrenamiento específico por idioma, por lo que el rendimiento en esos idiomas puede degradarse.
- El etiquetado del tipo de muletilla depende de SoundAnalysis de Apple; en Kotlin y JavaScript el campo `type` siempre es `null`, lo que limita la funcionalidad fuera del ecosistema Apple.
- El ajuste de sesgo es un compromiso explícito entre recall y precisión: con `.recall` aumentan los falsos positivos; con `.precision` pueden perderse muletillas sutiles.
- La duración mínima de span (0,12 s por defecto) puede descartar disfluencias muy breves si no se ajusta manualmente.
- Riesgo de confundir sonidos similares a muletillas (pausas, respiraciones, ruido) con disfluencias reales; la reconciliación con transcripción mitiga el riesgo de cortar palabras, pero requiere un ASR con marcas de tiempo fiables.
- Licencia propietaria «source-available»: el uso comercial está sujeto a los términos de https://license.desertant.com/, que deben revisarse antes de integrar el modelo en un producto. No es una licencia de código abierto.
- El modelo no genera texto ni razona: no debe evaluarse con benchmarks de LLM ni emplearse para tareas de comprensión del lenguaje.
- No se documentan sesgos demográficos ni acústicos (acentos, géneros, ruido de fondo), lo que impide anticipar su comportamiento en dominios alejados de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/uhm
- Pesos v1.2.0: https://huggingface.co/desert-ant-labs/uhm/tree/v1.2.0
- Demo en navegador (Space): https://huggingface.co/spaces/desert-ant-labs/uhm-demo
- Página del modelo y demo: https://desertant.com/models/uhm/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript y TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descarga y caché de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Licencia: https://license.desertant.com/
