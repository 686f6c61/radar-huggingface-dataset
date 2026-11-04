# keithics/silero-vad-coreml

## Resumen

CoreML Silero VAD es una conversión a CoreML del detector de actividad de voz (VAD) Silero, optimizada para su ejecución nativa en dispositivos Apple (iOS y macOS). El modelo original lo desarrolla el equipo de Silero, mientras que la conversión a CoreML corre a cargo del equipo de FluidAudio, que publica los pesos ya convertidos listos para integrarse en aplicaciones Swift. Resuelve un problema acotado pero crítico en pipelines de audio: identificar qué fragmentos de una señal contienen voz humana y cuáles son silencio o ruido, antes de pasarlos a un sistema de reconocimiento automático del habla (ASR).

A diferencia de los grandes modelos generativos, se trata de una red neuronal de tamaño muy reducido, diseñada para inferencia en tiempo real y con un coste computacional mínimo. El repositorio distribuye variantes orientadas a ventanas de análisis estándar y de 256 ms (esta última procesa el audio en lotes de ocho fragmentos de 32 ms, lo que según el autor la hace notablemente más rápida). La relevancia actual radica en que permite ejecutar VAD completamente en local y en el dispositivo, sin dependencias de servidor ni de frameworks de Python, lo que encaja con aplicaciones de voz en el ecosistema Apple.

El modelo se publica bajo licencia MIT, heredada del proyecto original, y está etiquetado para el idioma inglés, aunque la tarea de detección de voz es intrínsecamente poco dependiente del idioma. La información disponible no detalla el número de parámetros ni la arquitectura interna más allá de su condición de red convolucional/recurrente ligera típica de los VAD de Silero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal ligera de detección de voz (VAD); arquitectura interna exacta no disponible |
| Parametros totales | no disponible (el autor indica que el modelo "ya es diminuto") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; opera sobre ventanas de audio (variante estándar y variante de 256 ms en lotes de 8 fragmentos de 32 ms) |
| Tipos de cuantizacion | Versiones cuantizadas disponibles; el autor señala que no aportan mejora de rendimiento por el tamaño reducido del modelo |
| Idiomas soportados | en (etiquetado); la detección de voz es en la práctica poco dependiente del idioma |
| Licencia | MIT |
| Formato de pesos | CoreML (`.mlmodel`/`.mlpackage`); modelo base en ONNX (`onnx-community/silero-vad`) |

## Arquitectura y entrenamiento

El modelo es una implementación CoreML del VAD de Silero, cuyo modelo base en este repositorio es la versión de `onnx-community/silero-vad`. La model card no documenta la arquitectura interna con detalle; se trata de una red de detección de actividad de voz de tamaño muy pequeño, pensada para clasificar fragmentos cortos de audio como voz o no voz. La conversión a CoreML se realizó mediante las herramientas del repositorio FluidInference/mobius.

No se especifican en la información disponible el número de tokens o horas de audio de entrenamiento, la composición del dataset original ni si hubo etapas de ajuste fino con RLHF o DPO, algo por otra parte impropio de un modelo VAD. Los datasets citados en las etiquetas (`alexwengg/musan_mini50` y `alexwengg/musan_mini100`) parecen corresponder al conjunto de evaluación empleado para medir el rendimiento frente a la línea base Silero VAD v6.0.0 en PyTorch JIT. La innovación destacable es la propia conversión a CoreML y la variante de 256 ms con procesamiento por lotes, que según el autor reduce el tiempo de inferencia.

## Capacidades

- Detección de actividad de voz (voice activity detection) sobre flujo de audio.
- Clasificación de fragmentos de audio como voz o no voz, apta para preprocesado de ASR.
- Ejecución nativa en iOS y macOS mediante CoreML, integrable en aplicaciones Swift.
- Variante estándar y variante de 256 ms con procesamiento por lotes de 8 fragmentos de 32 ms.
- Inferencia en tiempo real con coste computacional mínimo.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente; es un modelo especializado de una única tarea.

## Casos de uso

- Detección de voz en tiempo real en apps iOS/macOS: el modelo se ejecuta vía CoreML en el dispositivo y permite activar o pausar la captura de micrófono solo cuando hay habla, reduciendo consumo y ruido en la interfaz.
- Preprocesado para ASR en el dispositivo: se usa como etapa previa que recorta el audio y elimina silencios antes de pasarlo a un motor de reconocimiento, mejorando la latencia y la precisión del pipeline.
- Segmentación y filtrado de audio: divide grabaciones largas en tramos con voz para su transcripción o archivo, descartando fragmentos de silencio o ruido.
- Ahorro energético en asistentes de voz: al detectar ausencia de habla, el sistema puede suspender el reconocimiento y el procesamiento posterior, algo relevante en dispositivos con batería limitada.
- Moderación y análisis de llamadas: identifica automáticamente si una grabación contiene voz humana, útil para triaje de audios o verificación de contenido.
- Integración en apps de notas de voz o reuniones: activa la transcripción solo en los tramos con habla, reduciendo el volumen de audio a procesar y los costes asociados.
- Sistemas de voz embebidos en macOS: al ser CoreML, se integra en aplicaciones de escritorio sin depender de Python ni de servidores externos.

## Benchmarks y rendimiento

La model card incluye gráficas de comparación frente a Silero VAD v6.0.0 (PyTorch JIT) en configuraciones estándar y de 256 ms, así como gráficas de rendimiento entre variantes, pero no se proporcionan valores numéricos en el texto. Las métricas declaradas en las etiquetas son accuracy y F1, sin cifras concretas disponibles.

| Metrica | Resultado |
|---|---|
| Accuracy | no disponible (solo gráficas en la model card) |
| F1 | no disponible (solo gráficas en la model card) |
| Comparación con Silero VAD v6.0.0 | gráficas publicadas; valores numéricos no disponibles |
| Rendimiento por variante | la variante de 256 ms es más rápida según el autor; cifras no disponibles |

## Requisitos de hardware

- Al ser un modelo CoreML para Apple, se ejecuta en CPU y GPU/Neural Engine de dispositivos iOS y macOS compatibles con CoreML.
- VRAM/RAM estimada: no disponible; el autor describe el modelo como "diminuto", por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no aplica en el sentido de GPUs de datacenter; está pensado para hardware Apple (iPhone, iPad, Mac con Apple Silicon o Intel compatible con CoreML).
- Cabe en cualquier dispositivo Apple moderno compatible con CoreML; no está orientado a GPUs NVIDIA.
- Opciones de despliegue: CoreML de forma nativa, integrado en apps Swift; el modelo base está disponible en ONNX para otros entornos.
- Latencia y throughput: no se publican cifras; la variante de 256 ms con lotes de 8 fragmentos de 32 ms es descrita como "mucho más rápida" que la estándar.

## Comparativa con modelos similares

| Modelo | Tarea | Formato | Licencia | Contexto/ventana | Notas |
|---|---|---|---|---|---|
| CoreML Silero VAD (este) | VAD | CoreML | MIT | ventanas de audio (estándar y 256 ms) | Optimizado para Apple, conversión de FluidAudio |
| Silero VAD (original) | VAD | PyTorch JIT / ONNX | MIT | ventanas de audio | Línea base de referencia v6.0.0 |
| onnx-community/silero-vad | VAD | ONNX | MIT | ventanas de audio | Modelo base de esta conversión |
| WebRTC VAD | VAD | C/C++ | BSD | tramas cortas | Alternativa clásica no neuronal; datos comparativos no disponibles |

No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en detección de voz; no genera texto ni realiza otras tareas.
- Etiquetado para inglés, aunque la detección de voz depende poco del idioma; el rendimiento en otros idiomas no está documentado.
- Las versiones cuantizadas no aportan mejora de rendimiento según el autor, dado el tamaño reducido del modelo.
- Dependencia del ecosistema Apple: la versión CoreML solo se ejecuta en plataformas compatibles con CoreML.
- No se documentan sesgos específicos, tasas de falsos positivos/negativos ni umbrales de decisión en la información disponible.
- Riesgo de comportamiento degradado en audio con ruido de fondo, solapamiento de hablantes o condiciones acústicas adversas; no cuantificado en la model card.
- Licencia MIT: permite uso comercial, pero conviene conservar la atribución al equipo de Silero y a FluidAudio según la citación indicada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validación limitado.
- El tamaño del repo aparece como 0.0 GB, lo que puede indicar pesos gestionados de forma externa o metadatos incompletos.

## Enlaces

- HuggingFace: https://huggingface.co/keithics/silero-vad-coreml
- Modelo base en HuggingFace: https://huggingface.co/onnx-community/silero-vad
- Silero VAD original (GitHub): https://github.com/snakers4/silero-vad
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- FluidAudioSwift (GitHub): https://github.com/FluidAudio/FluidAudioSwift
- Código de conversión (mobius): https://github.com/FluidInference/mobius
- Repositorio citado en la model card: https://huggingface.co/alexwengg/coreml-silero-vad
- Discord de FluidAudio: https://discord.gg/WNsvaCtmDe
