# lionellee/Silero-VAD-v6.2.1-MLX

## Resumen

Silero VAD v6.2.1 MLX es una conversión a formato MLX del detector de actividad de voz (VAD) Silero VAD, en su etiqueta `v6.2.1`, desarrollada por el usuario lionellee y publicada en Hugging Face. El modelo original pertenece a snakers4 y es uno de los detectores de voz más utilizados en la industria por su reducido tamaño y su capacidad de operar en streaming con latencias muy bajas. Esta versión está específicamente orientada a Apple Silicon, aprovechando el framework MLX de Apple para ejecutar la inferencia de forma nativa en chips M-series.

Se trata de un modelo extremadamente compacto: 309.121 parámetros en pesos Float32, sin cuantización, con un tamaño de fichero de en torno a 1,2 MB. Procesa audio a 16 kHz en fragmentos de 512 muestras (32 ms) y mantiene un contexto de 64 muestras. Su función no es transcribir ni clasificar contenido semántico, sino determinar en qué intervalos de una señal de audio hay voz humana, lo que lo convierte en una pieza de preprocesado esencial en pipelines de ASR, diarización, subtitulado automático o agentes conversacionales.

La relevancia de esta ficha radica en que ofrece una alternativa de inferencia local en hardware Apple para una tarea crítica y de bajísimo coste computacional. Al estar publicada bajo licencia MIT y mantener paridad numérica con el export CoreML de referencia, resulta útil para desarrolladores que construyen aplicaciones de voz en macOS o iOS y necesitan un VAD fiable, ligero y sin dependencias de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente para detección de actividad de voz (detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 309.121 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 muestras de audio (contexto interno); procesa fragmentos de 512 muestras a 16 kHz (32 ms) |
| Tipos de cuantizacion | ninguna; pesos en Float32 |
| Idiomas soportados | multilingüe (detección de voz independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (`model.safetensors`, ~1,2 MB) |
| Frecuencia de muestreo | 16 kHz |
| Tamaño de fragmento | 512 muestras (32 ms) |
| Modelo base | snakers4/silero-vad (tag v6.2.1) |
| Librería | mlx |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su naturaleza como detector de actividad de voz y de los parámetros de inferencia (16 kHz, fragmentos de 512 muestras, contexto de 64 muestras). El modelo es una conversión directa del Silero VAD original en su etiqueta `v6.2.1`; los pesos se exportaron a safetensors para MLX y se verificaron tensor a tensor contra el state dict JIT original, con una diferencia absoluta máxima de 0. No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens o muestras de audio utilizadas, ni sobre si hubo ajuste fino con RLHF o DPO.

La innovación técnica principal de esta versión es el propio port a MLX: permite ejecutar el VAD de forma nativa en Apple Silicon con pesos Float32 y sin cuantización. Según las mediciones del autor, la latencia por fragmento es de 0,4999 ms con un RTF de 0,01562, frente a los 0,0630 ms y RTF 0,00197 del export CoreML equivalente. La paridad con CoreML muestra una diferencia máxima de probabilidad de 0,060569 y una diferencia media de 0,001673, lo que indica que el comportamiento es muy cercano al de la referencia, aunque no idéntico.

## Capacidades

- Detección de actividad de voz (VAD) en audio de 16 kHz, indicando los segmentos donde hay voz humana.
- Procesamiento en streaming por fragmentos de 512 muestras (32 ms), adecuado para aplicaciones en tiempo real.
- Funcionamiento multilingüe: al detectar voz y no contenido lingüístico, es independiente del idioma hablado.
- Integración con el SDK Swift `speech-swift` mediante `SileroVADModel.fromPretrained(engine: .mlx)`.
- Uso mediante CLI con el comando `speech vad input.wav`.
- Ejecución nativa en Apple Silicon a través de MLX.
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni razonamiento multi-paso; el modelo es exclusivamente un clasificador binario de voz/no voz por fragmento.

## Casos de uso

- Preprocesado de pipelines de ASR: el modelo permite recortar silencios y segmentar el audio antes de enviarlo a un sistema de reconocimiento de voz, reduciendo el coste computacional y mejorando la precisión al evitar procesar regiones sin habla.
- Detección de turnos en agentes conversacionales: con fragmentos de 32 ms y latencias por debajo del milisegundo, se puede integrar en bucles de captura de micrófono para activar la escucha solo cuando el usuario habla.
- Diarización y segmentación de reuniones: al identificar intervalos con voz, facilita la división previa de grabaciones largas en segmentos manejables para modelos de transcripción y de identificación de hablantes.
- Filtrado de audio en aplicaciones de notas de voz en macOS/iOS: el VAD puede descartar automáticamente fragmentos sin habla antes de almacenar o transcribir, ahorrando espacio y cuota de API.
- Subtitulado automático y generación de transcripciones con marcas temporales: los segmentos de voz detectados sirven como base para alinear texto y tiempo en herramientas de subtitulado.
- Control de calidad en centros de llamadas: permite medir la proporción de voz frente a silencio en grabaciones y detectar llamadas sin interacción verbal.
- Wake-word y activación por voz en dispositivos Apple: al ser un modelo de 1,2 MB y ejecutarse en MLX, puede actuar como primera etapa de un pipeline de activación por voz sin consumir recursos significativos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son mediciones de latencia y paridad realizadas por el autor con `speech-swift` sobre un fixture de voz de 20 s a 16 kHz y 625 fragmentos en streaming:

| Backend | Segmento detectado | Latencia por fragmento | RTF |
|---|---|---:|---:|
| Silero v6.2.1 MLX | 5.184 s - 8.416 s | 0.4999 ms | 0.01562 |
| Silero v6.2.1 CoreML | 5.184 s - 8.416 s | 0.0630 ms | 0.00197 |

Paridad frente al export CoreML v6.2.1:

| Métrica | Valor |
|---|---:|
| Diferencia máxima de probabilidad | 0.060569 |
| Diferencia media de probabilidad | 0.001673 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de detección de actividad de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en Float32, dado que los pesos ocupan aproximadamente 1,2 MB y el estado recurrente es mínimo.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con soporte de MLX. No se documenta soporte para GPU NVIDIA o AMD en esta versión.
- Cabe holgadamente en cualquier GPU de consumo; en el ecosistema Apple, incluso los modelos base de M1 son suficientes.
- Opciones de despliegue: MLX de forma nativa, SDK Swift `speech-swift` y CLI `speech vad`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: 0,4999 ms por fragmento de 32 ms y RTF de 0,01562 según las mediciones del autor, lo que permite procesar audio muy por encima del tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Licencia | Plataforma | Notas |
|---|---:|---|---|---|---|
| Silero VAD v6.2.1 MLX (este) | 309.121 | 64 muestras de contexto; fragmentos de 512 muestras | MIT | Apple Silicon (MLX) | Port del original; RTF 0.01562 |
| Silero VAD v6.2.1 CoreML | no disponible | Igual que el original | MIT | Apple Silicon (CoreML) | RTF 0.00197; referencia de paridad |
| snakers4/silero-vad (upstream) | 309.121 (v6.2.1) | Igual que el original | MIT | Multiplataforma (PyTorch/JIT) | Modelo original del que deriva este port |
| WebRTC VAD | no disponible | Tramas de 10/20/30 ms | BSD | Multiplataforma | Algoritmo clásico, sin red neuronal; no disponible comparación de rendimiento en la información |

No se dispone de datos de benchmarks comparativos adicionales frente a otros VAD neuronales en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un detector binario de voz; no transcribe, no identifica hablantes ni clasifica emociones.
- No se han documentado sesgos específicos, pero como todo VAD puede tener un rendimiento desigual con ruido de fondo intenso, voces muy suaves o audio musical.
- Riesgo de falsos positivos y falsos negativos en condiciones acústicas adversas; la información disponible no incluye métricas de precisión o recall.
- La diferencia máxima de probabilidad frente a CoreML es de 0,060569, por lo que no es un clon numérico exacto del export CoreML, aunque la diferencia media es baja (0,001673).
- Licencia MIT: permite uso comercial, modificación y redistribución, manteniendo el aviso de copyright correspondiente.
- Dependencia del ecosistema Apple Silicon y de MLX; no está pensado para desplegarse en servidores x86 con GPU NVIDIA sin conversión adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria extensa.
- No se documentan limitaciones de idioma porque la tarea es independiente del idioma, pero tampoco se aportan evaluaciones por idioma.

## Enlaces

- Hugging Face: https://huggingface.co/lionellee/Silero-VAD-v6.2.1-MLX
- Modelo base (upstream): https://github.com/snakers4/silero-vad
- SDK Swift speech-swift: https://github.com/soniqo/speech-swift
- Documentación: https://soniqo.audio/getting-started
- Sitio web: https://soniqo.audio
- Blog: https://soniqo.audio/blog
