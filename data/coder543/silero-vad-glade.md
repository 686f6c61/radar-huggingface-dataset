# coder543/silero-vad-glade

## Resumen

Silero VAD for Glade es una conversión del detector de actividad de voz (VAD) oficial de Silero a las APIs de Apple Core AI, empaquetado para su uso en la aplicación Glade. El modelo original lo desarrolla el equipo de Silero (snakers4) y esta conversión la publica el usuario coder543. El problema que resuelve es la detección de voz en tiempo real sobre audio de 16 kHz en plataformas Apple (macOS 27 e iOS 27), aprovechando la especialización CPU-only de Core AI para un modelo recurrente de pequeño tamaño.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un artefacto de despliegue para una tarea concreta de segmentación de audio. El bundle procesa lotes de ocho tramas consecutivas de 32 ms (256 ms por lote) y preserva el estado LSTM de 128 dimensiones y el contexto de audio de 64 muestras entre llamadas, lo que permite mantener continuidad en flujos de audio largos sin reiniciar el estado recurrente.

La conversión mantiene los pesos originales del checkpoint `silero_vad.jit` y declara una licencia MIT heredada del proyecto original. No incluye activos compilados ahead-of-time y el repositorio tiene un tamaño declarado de 0.0 GB, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente LSTM (modelo VAD original de Silero), convertida a Core AI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 576 muestras por trama (64 de contexto previo + 512 actuales); lote de 8 tramas de 32 ms |
| Tipos de cuantizacion | FP16 en todos los tensores (entrada, estados y salida) |
| Idiomas soportados | no disponible (el VAD es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | Core AI bundle (assets convertidos); no se distribuyen GGUF ni safetensors |
| Frecuencia de muestreo | 16 kHz |
| Forma de entrada | `[8, 1, 1, 576]` por lote |
| Forma de estados | `h` y `c` con forma `[1, 128, 1, 1]` |
| Salidas | `probability`, `next_h`, `next_c` |
| Libreria | coreai |
| Plataformas | macOS 27, iOS 27, Apple Silicon |

## Arquitectura y entrenamiento

El modelo subyacente es el VAD oficial de Silero para 16 kHz, una red recurrente con estado LSTM de 128 dimensiones que clasifica tramas de audio en voz o no voz. La conversión a Core AI no reentrena ni modifica los pesos: parte del checkpoint oficial `silero_vad.jit` en la revisión `5cd7945676eb32225748052e2e6a0580e4686a08` del repositorio snakers4/silero-vad y lo adapta a las APIs de Apple, con todos los tensores en FP16.

La innovación técnica de este paquete es el batching y la gestión explícita del estado recurrente. Cada llamada procesa ocho tramas consecutivas de 32 ms (256 ms de audio), y el estado LSTM (`h`, `c`) y el contexto de 64 muestras se propagan entre llamadas sin reinicio. El autor recomienda no resetear el estado entre actualizaciones, almacenar en búfer los lotes incompletos y rellenar con ceros únicamente el lote final, descartando las probabilidades correspondientes al relleno. La especialización debe ser CPU-only para este modelo recurrente de pequeño tamaño. No se documentan datos de entrenamiento propios ni procesos de RLHF o DPO, ya que el modelo no se ha reentrenado.

## Capacidades

- Detección de actividad de voz sobre audio PCM a 16 kHz, con salida de probabilidad por trama.
- Procesamiento por lotes de 8 tramas de 32 ms, con continuidad de estado entre llamadas.
- Mantenimiento del estado LSTM (`h`, `c`) y del contexto de audio de 64 muestras a través de actualizaciones sucesivas.
- Ejecución CPU-only optimizada para Apple Silicon mediante Core AI.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de tool calling ni de capacidades de agentes.
- No se documentan capacidades multilingües específicas; el VAD es intrínsecamente independiente del idioma.
- No dispone de modo thinking, audio generativo ni otras capacidades especiales más allá de la clasificación voz/no voz.

## Casos de uso

- Segmentación de audio en aplicaciones de dictado en macOS e iOS: el modelo permite detectar cuándo el usuario habla para activar la captura, manteniendo el estado recurrente entre fragmentos y evitando cortes en frases largas.
- Puerta de voz en asistentes conversacionales: al procesar lotes de 256 ms con continuidad de estado, se puede filtrar silencio y ruido antes de enviar audio a un motor de reconocimiento de voz, reduciendo cómputo y ancho de banda.
- Detección de inicio y fin de turno en llamadas o reuniones: la salida de probabilidad por trama permite marcar fronteras de habla con una latencia de lote de 256 ms, adecuada para sistemas de transcripción en tiempo real.
- Filtrado previo en pipelines de transcripción por lotes: el rendimiento medido de 1.773,3× RTFx sobre una grabación de 1.095,3 segundos permite preprocesar archivos completos en menos de un segundo en un MacBook Pro con M5 Max.
- Moderación y analítica de audio: detectar presencia de voz antes de aplicar modelos más costosos de identificación de hablante o análisis de contenido, descartando segmentos sin habla.
- Ahorro energético en dispositivos iOS: la especialización CPU-only y el FP16 reducen el coste de mantener un detector de voz siempre activo en segundo plano frente a ejecutar el checkpoint JIT en FP32.
- Validación de captura en aplicaciones de grabación: usar la probabilidad agregada para avisar al usuario de que no se está detectando voz y evitar grabaciones silenciosas.

## Benchmarks y rendimiento

Los datos publicados son verificaciones de conversión y medidas de rendimiento, no benchmarks de precisión de detección de voz.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tiempo de especialización CPU-only | 0,10 s | MacBook Air M3 |
| Procesamiento de 688 tramas (22,0 s de audio) | 0,024 s | MacBook Air M3, excluye preparación y E/S |
| Error medio de probabilidad vs. JIT FP32 oficial | 0,00081 | Prueba de conversión |
| Error máximo de probabilidad vs. JIT FP32 oficial | 0,01681 | Prueba de conversión |
| Decisiones distintas al umbral 0,5 | 0 | Prueba de conversión |
| Throughput sobre grabación JFK de 1.095,3 s | 0,618 s (1.773,3× RTFx) | MacBook Pro M5 Max, 18 CPU, 40 GPU, 64 GB, macOS 27.2.1, CPU-only, 3 pasadas en caliente tras warmup |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo VAD.

## Requisitos de hardware

- VRAM estimada: no aplica; la ejecución es CPU-only y el modelo es de pequeño tamaño con tensores FP16.
- GPU recomendadas: no se requiere GPU; el autor especifica especialización CPU-only.
- Hardware validado: MacBook Air con M3 y MacBook Pro con M5 Max (18 núcleos de CPU, 40 de GPU, 64 GB de RAM).
- Compatibilidad con consumer GPU: no aplica en el sentido habitual; el objetivo son chips Apple Silicon en macOS 27 e iOS 27.
- Opciones de despliegue: runtime Core AI de Apple con el bundle Glade; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este artefacto.
- Latencia y throughput: 0,024 s para 22,0 s de audio en M3 (excluyendo preparación y E/S) y 0,618 s para 1.095,3 s de audio en M5 Max, con 1.773,3× RTFx incluyendo inferencia, copias en host y agregación de probabilidades.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto por llamada | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coder543/silero-vad-glade | VAD LSTM convertido a Core AI | 8 tramas de 32 ms (256 ms) | FP16 | MIT | Hugging Face, bundle Core AI |
| Silero VAD oficial (`silero_vad.jit`) | VAD LSTM en TorchScript | Trama a trama (32 ms) | FP32 | MIT | GitHub snakers4/silero-vad |
| WebRTC VAD | VAD clásico basado en GMM | Tramas de 10/20/30 ms | no disponible | BSD | Biblioteca WebRTC |
| Silero VAD (variante ONNX) | VAD LSTM en ONNX | Trama a trama (32 ms) | FP32/FP16 según exportación | MIT | Repositorio oficial y mirrors |

La comparativa se limita a alternativas de la misma tarea, ya que no existen modelos de lenguaje comparables. El paquete de coder543 se distingue por el batching de 256 ms y la integración con Core AI; el checkpoint oficial ofrece mayor granularidad por trama y portabilidad fuera del ecosistema Apple.

## Limitaciones y advertencias

- Los resultados publicados son comprobaciones de conversión, no un estudio de precisión de detección de voz; el propio autor lo advierte explícitamente.
- El modelo está atado a las APIs de Apple Core AI y a macOS 27 / iOS 27; no es portable a otras plataformas sin reconversión.
- La ejecución debe ser CPU-only; usar la especialización GPU no está validado para este modelo recurrente.
- El estado LSTM y el contexto deben gestionarse manualmente: reiniciar el estado a mitad de una grabación degrada la continuidad, y no rellenar correctamente el último lote introduce probabilidades espurias.
- El repositorio no incluye activos compilados ahead-of-time, por lo que la especialización se realiza en tiempo de ejecución.
- No se documentan sesgos específicos, pero al ser un VAD genérico puede comportarse de forma distinta según el idioma, el acento, el ruido de fondo y la calidad del micrófono.
- Riesgo de falsos positivos y falsos negativos en entornos ruidosos; el umbral de decisión (0,5 en las pruebas) debe calibrarse por aplicación.
- La licencia MIT permite uso comercial, pero se hereda del proyecto original de Silero y debe conservarse la atribución correspondiente.
- El repositorio presenta cero descargas y cero likes, y un tamaño declarado de 0.0 GB, lo que sugiere que los archivos podrían no estar disponibles o que las métricas no se han actualizado.
- No se dispone de información sobre idiomas soportados ni sobre el número de parámetros del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/silero-vad-glade
- Repositorio oficial de Silero VAD: https://github.com/snakers4/silero-vad
- Revisión concreta del código fuente: https://github.com/snakers4/silero-vad/tree/5cd7945676eb32225748052e2e6a0580e4686a08
