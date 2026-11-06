# Sky-Kim/com.sky.sentis.silero-vad

## Resumen

`com.sky.sentis.silero-vad` es una conversión del detector de actividad de voz (VAD) Silero al formato del motor de inferencia Unity Sentis, en precisión FP16 y orientado a ejecución en dispositivo (on-device). Lo publica el usuario Sky-Kim como un paquete autocontenido que incluye tanto el grafo serializado `silero_vad_fp16.sentis` como una implementación en C# (`SileroVad.cs`) que gestiona el buffering de tramas, el arrastre del estado recurrente LSTM y la lógica de umbrales de inicio y fin de habla con tiempo de silencio configurable.

El modelo no es un modelo de lenguaje ni un transformer generativo: es un clasificador binario de voz sobre tramas de audio. Recibe una trama de 512 muestras a 16 kHz mono junto con el estado oculto y de celda de una LSTM, y devuelve la probabilidad de que la trama contenga habla junto con el estado actualizado. Su relevancia práctica está en que permite integrar detección de voz en aplicaciones Unity sin depender de servicios en la nube ni de librerías nativas externas, con una latencia de trama de 32 ms.

El repositorio es de tamaño mínimo (0,0 GB reportados, con solo dos ficheros) y tiene un uso muy reducido en Hugging Face (15 descargas, 0 likes en el momento de la consulta). La licencia es MIT tanto para el artefacto convertido como para el modelo original de Silero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LSTM recurrente (Silero VAD) convertida a Unity Sentis |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa tramas de 512 muestras (32 ms a 16 kHz) con estado LSTM persistente entre tramas |
| Tipos de cuantización | FP16 (único formato publicado) |
| Idiomas soportados | no disponible (detección de voz independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | `.sentis` (Unity Sentis), acompañado de `SileroVad.cs` |

## Arquitectura y entrenamiento

El artefacto es una conversión del VAD de Silero (`snakers4/silero-vad`, MIT) al formato de grafo de Unity Sentis en FP16. La arquitectura subyacente es una red recurrente con celdas LSTM que opera sobre tramas de 512 muestras de audio a 16 kHz; el modelo mantiene un estado `h`/`c` que debe arrastrarse entre tramas consecutivas y reiniciarse explícitamente para comenzar una nueva secuencia. La salida es una probabilidad de habla por trama.

La información disponible no detalla el número de parámetros, la composición del dataset de entrenamiento ni si hubo etapas de ajuste fino específicas. La conversión a Sentis no introduce cambios en los pesos más allá de la serialización y la reducción a FP16. La implementación C# incluida resuelve la parte de ingeniería que el grafo no cubre: acumulación de muestras hasta completar tramas de 512, ejecución síncrona cada 32 ms mediante `Pump()`, umbrales de inicio y fin con timeout de silencio, y eventos `SpeechStarted`/`SpeechEnded`. En el backend CPU, las salidas se leen en el mismo buffer sin asignaciones por trama.

## Capacidades

- Detección de actividad de voz por trama con salida de probabilidad de habla.
- Mantenimiento de estado recurrente LSTM entre tramas para continuidad temporal.
- Segmentación de habla con umbrales de inicio y fin configurables y timeout de silencio.
- Eventos de inicio y fin de habla (`SpeechStarted`, `SpeechEnded`) para integración con lógica de aplicación.
- Ejecución on-device en Unity mediante Unity Sentis, con backend CPU y posibilidad de seleccionar backend.
- Factoría de workers configurable (`WorkerFactory`) para adaptar la creación del worker a builds de inferencia personalizados.
- Procesamiento síncrono con cadencia de 32 ms por trama y drenaje de backlog tras pausas (`PendingSamples`).
- No soporta tool calling, function calling, agentes, visión, audio generativo ni capacidades multilingües en el sentido de modelos de lenguaje.

## Casos de uso

- Detección de voz en tiempo real en aplicaciones Unity de escritorio o móvil: el modelo procesa tramas de 512 muestras cada 32 ms en CPU, lo que permite activar la captura de micrófono solo cuando hay habla y reducir consumo y ancho de banda.
- Asistentes de voz embebidos en juegos o experiencias interactivas: los eventos `SpeechStarted`/`SpeechEnded` permiten encender y apagar el reconocedor de voz o el pipeline de ASR solo durante segmentos con habla.
- Push-to-talk inteligente y cancelación de silencios en herramientas de comunicación: el timeout de silencio configurable cierra el turno de habla de forma automática sin intervención del usuario.
- Preprocesado de audio para pipelines de transcripción: al segmentar el audio en regiones con voz antes de enviarlo a un ASR, se reducen costes de inferencia y se evitan alucinaciones del transcriptor sobre silencio o ruido.
- Aplicaciones de accesibilidad y control por voz en dispositivos con recursos limitados: al ejecutarse on-device con FP16 y sin dependencias de red, encaja en escenarios con requisitos de privacidad o conectividad intermitente.
- Telemetría y analítica de conversaciones: cuantificar tiempo de habla, número de turnos y pausas en grabaciones o sesiones en vivo, usando el estado LSTM para mantener coherencia entre tramas.
- Filtrado de ruido y grabación activada por voz en herramientas de campo: el VAD decide cuándo abrir el flujo de grabación, reduciendo almacenamiento en entornos con largos periodos de silencio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es de tamaño reducido y está pensado para ejecución en CPU dentro de Unity, por lo que no requiere GPU dedicada.
- GPU recomendadas: no aplica de forma obligatoria; cualquier GPU compatible con el backend de Sentis puede ejecutar el grafo, pero la información disponible no especifica modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño reducido del artefacto, aunque no se detallan modelos concretos ni métricas de VRAM.
- Opciones de despliegue: Unity Sentis con backend CPU (documentado), con posibilidad de seleccionar otro backend mediante `BackendType` y de personalizar la creación del worker con `WorkerFactory`.
- Latencia y throughput: ejecución síncrona cada 32 ms por trama de 512 muestras a 16 kHz; no se publican cifras de latencia por inferencia ni de throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `com.sky.sentis.silero-vad` | LSTM (Silero VAD) convertida a Sentis | Trama de 512 muestras a 16 kHz + estado LSTM | `.sentis` FP16 + C# | MIT | Hugging Face, Unity Sentis |
| `snakers4/silero-vad` (original) | LSTM | Trama de 512 muestras a 16 kHz + estado LSTM | PyTorch / ONNX | MIT | GitHub, PyPI |
| WebRTC VAD | GMM | Tramas de 10/20/30 ms | C/C++ nativo | BSD | Biblioteca WebRTC |
| Silero VAD (variantes ONNX) | LSTM | Trama de 512 muestras a 16 kHz | ONNX | MIT | Hugging Face, repos de terceros |

La comparativa se limita a la categoría de detección de actividad de voz; no se dispone de datos de benchmarks que permitan comparar precisión entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas de precisión, recall ni tasas de error sobre conjuntos de evaluación en la información disponible.
- El modelo está serializado únicamente en FP16 para Unity Sentis; no se ofrecen variantes en otros formatos o precisiones en este repositorio.
- Requiere gestionar manualmente el estado LSTM `h`/`c`: no reiniciarlo entre secuencias independientes puede degradar la detección.
- La ejecución es síncrona cada 32 ms; tras una pausa es necesario drenar el backlog con `PendingSamples` y `Pump()` para evitar acumulación de audio.
- Depende del runtime Unity Sentis y de la versión de Unity utilizada; no se documentan versiones mínimas compatibles.
- No se especifican idiomas soportados ni evaluación multilingüe, aunque el VAD de Silero es en principio independiente del idioma.
- El repositorio tiene un uso muy bajo (15 descargas, 0 likes) y no se han publicado resultados de benchmarks ni validaciones independientes.
- Licencia MIT: permite uso comercial y modificación, pero requiere conservar el aviso de copyright y la atribución al proyecto original `snakers4/silero-vad`.
- El autor del repositorio es un tercero respecto al proyecto Silero original; la conversión a Sentis no está avalada formalmente por el equipo de Silero según la información disponible.

## Enlaces

- [Hugging Face: Sky-Kim/com.sky.sentis.silero-vad](https://huggingface.co/Sky-Kim/com.sky.sentis.silero-vad)
- [Repositorio original de Silero VAD](https://github.com/snakers4/silero-vad)
