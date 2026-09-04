# Reza2kn/shenava-nemotron3-rust

## Resumen

`shenava-nemotron3-rust` es un artefacto de despliegue en formato ONNX para diarización de hablantes, creado por Reza2kn como componente del servidor `shenava-asr-server`, implementado íntegramente en Rust. El modelo se exportó del checkpoint `nvidia/Nemotron-3-Diarization-preview` y está diseñado para ejecutarse con Tract, sin necesidad de Python, C++ ni ONNXRuntime en tiempo de inferencia. Su propósito es realizar diarización de hablantes en streaming sobre audio de 16 kHz, generando segmentos temporales etiquetados por locutor.

La arquitectura es un grafo ONNX de forma fija que procesa audio extraído en tramas log-mel de 128 bins, con un contexto de 340 tramas centrales y 40 tramas de contexto derecho, apiladas por 8. Mantiene una caché de hablante `[1, 264, 512]` y una FIFO `[1, 40, 512]`, con ocho canales de hablante. El repositorio tiene un tamaño de 0.4 GB e incluye además un archivo `.silence.bin` con una incrustación de silencio aprendida, imprescindible para la compresión de la caché en Rust.

La relevancia del modelo radica en su enfoque de despliegue ligero y nativo en Rust, orientado a entornos de producción donde se quiere minimizar dependencias y overhead de ejecución. Al ser un derivado de un modelo de NVIDIA, hereda las restricciones de acceso y términos de licencia del modelo fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de diarización de hablantes (red neuronal preentrenada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la diarización de hablantes es independiente del idioma) |
| Licencia | no disponible (hereda los términos de NVIDIA del modelo fuente) |
| Formato de pesos | ONNX (más archivo `.silence.bin`) |

## Arquitectura y entrenamiento

El modelo es un artefacto de diarización de hablantes, no un modelo de lenguaje. Su entrada es audio mono de 16 kHz, convertido a tramas log-mel de 128 bins compatibles con NeMo. El grafo consume 340 tramas centrales más 40 tramas de contexto derecho, apiladas por 8, junto con una caché de hablante `[1, 264, 512]` y una FIFO `[1, 40, 512]`. Internamente mantiene ocho canales de hablante y produce predicciones de estado, predicciones de alta resolución cada 10 ms, embeddings de chunk y la longitud de salida.

El entrenamiento y la exportación se realizaron una sola vez usando NeMo sobre el checkpoint `nvidia/Nemotron-3-Diarization-preview`. El runtime posterior es puro Rust, ejecutando el grafo con Tract. La salida se convierte en segmentos continuos por hablante y se ordena globalmente por `(start_ms, end_ms, speaker_id)`, preservando los solapamientos para mantener el orden de aparición de los locutores en el audio. No hay información disponible sobre el proceso de entrenamiento, datos o técnicas de alineación como RLHF o DPO.

## Capacidades

- Diarización de hablantes en streaming sobre audio de 16 kHz.
- Procesamiento con caché de hablante y FIFO, lo que permite inferencia secuencial sobre audio continuo.
- Soporte de ocho canales de hablante simultáneos.
- Generación de predicciones de alta resolución cada 10 ms para segmentación temporal fina.
- Salida ordenada por tiempo de inicio, tiempo de fin e identificador de hablante.
- Preservación de segmentos solapados, útil para mantener el orden de aparición de los locutores.
- Ejecución nativa en Rust mediante Tract, sin dependencias de Python, C++ ni ONNXRuntime.
- No es un modelo generativo de texto ni soporta tool calling, razonamiento multi-paso ni generación de código.

## Casos de uso

- Transcripción de reuniones: el modelo puede segmentar el audio de una sala de reuniones en intervenciones por hablante, permitiendo generar actas con etiquetas de locutor. Es adecuado porque procesa streaming de audio a 16 kHz y conserva el orden real de aparición.
- Análisis de llamadas de atención al cliente: permite separar las intervenciones del agente y del cliente en llamadas telefónicas, facilitando el análisis posterior de turnos y tiempos de habla. El uso de caché de hablante es clave para sesiones largas.
- Subtitulado automático con identificación de locutor: al combinarse con un sistema de reconocimiento de voz, se pueden generar subtítulos en los que cada línea aparece asignada a un hablante, útil para vídeo y emisiones en directo.
- Monitorización de emisiones de radio o pódcast: el modelo puede segmentar el audio en intervenciones de diferentes presentadores o invitados, permitiendo medir tiempo de palabra y generar metadatos de contenido.
- Análisis de entrevistas e investigación cualitativa: en estudios con entrevistas grabadas, la diarización permite separar automáticamente las respuestas del entrevistado y las preguntas del entrevistador, agilizando la codificación posterior.
- Documentación de audiencias y procedimientos legales: el modelo puede etiquetar turnos de habla en grabaciones de vistas o juicios, donde la identificación de cada interviniente es esencial para la transcripción forense.
- Integración en sistemas de agentes de voz: al ejecutarse de forma nativa en Rust con Tract, puede integrarse en pipelines de servidores de voz en tiempo real que necesiten identificar quién habla para enrutar o responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Al ser un artefacto ONNX de 0.4 GB, es probable que funcione en GPU de consumo o en CPU, aunque no hay datos específicos de consumo o latencia.
- Opciones de despliegue: Tract como runtime, integrado en el servidor `shenava-asr-server` compilado con `cargo build --release --features cuda,native-diarization`.
- Backend de ejecución: `gpu-or-cpu`, lo que permite seleccionar aceleración por GPU si está disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nvidia/Nemotron-3-Diarization-preview` | Diarización de hablantes | no disponible | no disponible | Términos de NVIDIA, acceso restringido | Gated en Hugging Face |
| `Reza2kn/shenava-nemotron3-rust` | ONNX de diarización | 0.4 GB | no disponible | Hereda términos de NVIDIA | Público en Hugging Face |

El modelo `shenava-nemotron3-rust` no es una alternativa independiente, sino un artefacto de despliegue derivado del modelo fuente de NVIDIA, adaptado para ejecutarse en un runtime Rust con Tract.

## Limitaciones y advertencias

- El modelo es un derivado del checkpoint `nvidia/Nemotron-3-Diarization-preview`, por lo que los términos de acceso y restricciones de NVIDIA continúan aplicándose.
- El repositorio no incluye información sobre licencia explícita, parámetros o benchmarks, lo que limita la evaluación de su rendimiento y su uso comercial.
- El archivo `.silence.bin` debe permanecer junto al grafo ONNX; su ausencia puede romper la compresión de la caché en el runtime Rust.
- El grafo tiene forma fija (fixed-shape), por lo que el tamaño de las ventanas de entrada es predefinido; puede haber limitaciones en la duración de audio procesada por lote.
- No hay datos sobre sesgos, errores en la atribución de hablantes o comportamiento en entornos ruidosos.
- Al ser un componente de diarización, no es un modelo de lenguaje y no puede generar texto, código ni responder preguntas.
- El repositorio no tiene descargas ni likes, lo que sugiere que el proyecto es experimental o de uso muy específico.

## Enlaces

- HuggingFace: https://huggingface.co/Reza2kn/shenava-nemotron3-rust
- GitHub de Reza2kn: https://github.com/Reza2kn
- Proyecto `shenava-asr-server`: https://github.com/Reza2kn
- Modelo fuente: https://huggingface.co/nvidia/Nemotron-3-Diarization-preview
- NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
