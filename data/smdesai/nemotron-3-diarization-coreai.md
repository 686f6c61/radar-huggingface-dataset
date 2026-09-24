# smdesai/Nemotron-3-Diarization-CoreAI

## Resumen

smdesai/Nemotron-3-Diarization-CoreAI es una conversión al formato Core AI (.aimodel) de Apple del modelo abierto de diarización de hablantes Nemotron 3 Diarization de NVIDIA. Se trata de un modelo de diarización en streaming basado en la arquitectura Streaming Sortformer, capaz de seguir hasta ocho hablantes solapados con una resolución de salida de 10 ms, pensado para ejecutarse en el Neural Engine de dispositivos con iOS 27 o macOS 27 y versiones posteriores.

NVIDIA publicó el modelo original el 23 de septiembre de 2026 como pesos abiertos de aproximadamente 100 millones de parámetros, con soporte de inferencia en streaming y en diferido. Esta conversión, publicada por el usuario smdesai, no reentrena, cuantiza ni poda pesos: reexpresa el checkpoint original (.nemo, revisión a435e9867d79e789e90053f9b6d6834053af564a) como dos grafos de forma fija, un preencoder (features Mel a embeddings de trama de 80 ms) y un encoder/cabeza (caché de hablantes, FIFO y embeddings de chunk a probabilidades de actividad por hablante). La lógica de streaming de Sortformer (Arrival-Order Speaker Cache, FIFO y troceado) se ejecuta en el host.

Su relevancia es práctica: permite diarización local, sin enviar audio a la nube, en iPhone, iPad y Mac, con latencia de configuración declarada de 1,04 s, salida cada 10 ms y hasta ocho hablantes ordenados por su primera aparición en el audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (encoder + cabeza de actividad de hablantes) exportado como dos grafos Core AI: preencoder y encoder/cabeza |
| Parámetros totales | ~100 M (dato publicado para el modelo base NVIDIA; la model card de esta conversión no lo declara) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto textual; caché de hablante de 264 tramas + FIFO de 264 tramas + chunk, hasta 542 filas empaquetadas por paso |
| Tipos de cuantización | FP32 y FP16 (sin cuantización de enteros); existe una variante FP16 con layout específico para Neural Engine |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | Core AI (.aimodel) más pipeline.json; embeddings auxiliares en .f32le (little-endian float32); el modelo base se distribuye en .nemo |
| Audio de entrada | 16 kHz, mono, float32 |
| Número máximo de hablantes | 8 |
| Resolución de salida | 10 ms (8 aumentos de escala sobre la trama del encoder), umbral de decisión por defecto 0,5 sobre salidas sigmoide |
| Chunk de streaming | 9 tramas de encoder (0,72 s); contexto izquierdo 1 trama (0,08 s), derecho 4 tramas (0,32 s) |
| Tamaño del repositorio | 0,8 GB |
| Fecha de publicación | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es una implementación end-to-end de diarización: no hay etapa separada de clustering ni de asignación posterior. El encoder trabaja sobre tramas de 8 frames Mel (80 ms) y la cabeza emite probabilidades sigmoide de actividad por hablante, que se remuestrean ocho veces hasta la resolución de 10 ms. El estado de streaming se mantiene mediante la Arrival-Order Speaker Cache y una FIFO de 264 tramas cada una, con compresión de la caché cada 222 tramas y un embedding de silencio aprendido (512 valores float32) para el relleno. El frontend aplica preénfasis 0,97, STFT centrada (FFT 512, ventana Hann de 400, salto 160, relleno constante de ceros), espectro de potencia, 128 bins Mel de Slaney y log(x + 2^-24), sin dither ni normalización de features.

La conversión se realizó con coreai-torch 0.4.1 (grafos estándar) y 0.4.2 (encoder para Neural Engine) sobre coreai-core 1.0.0b2, a partir del checkpoint Nemotron-3-Diarization.nemo (SHA-256 867c53f552998f772e5b5e5c082962ae85ee7ca5669c2bc17d7f615133d4e96d). No hubo reentrenamiento, cuantización ni poda, por lo que no se aplicaron fases de RLHF ni DPO en esta publicación. No se dispone de información sobre el número de tokens o la composición del dataset de entrenamiento del modelo original.

## Capacidades

- Diarización de hablantes en streaming con salida de probabilidades de actividad por hablante a 10 ms.
- Seguimiento de hasta ocho hablantes simultáneos, con salidas ordenadas por el orden de llegada de cada hablante al audio.
- Detección implícita de actividad de voz: la etiqueta de pipeline del repositorio es voice-activity-detection.
- Generación de etiquetas genéricas de hablante y marcas temporales tras el postprocesado en el pipeline NeMo del modelo base.
- Ejecución local en el Neural Engine de Apple, sin acceso a red.
- No es un modelo de lenguaje: no genera texto, no hace razonamiento, no soporta tool calling ni function calling, y no tiene modo de pensamiento, visión ni generación de audio.
- No se declaran capacidades multilingües ni un identificador de idioma asociado.

## Casos de uso

- Notas de voz y actas en dispositivos Apple: una app de iOS o macOS puede ejecutar los dos grafos en local, trocear el audio en saltos de 0,72 s y emitir etiquetas de hablante cada 10 ms, lo que permite transcribir reuniones y atribuir cada frase sin subir el audio a un servidor.
- Análisis de llamadas de atención al cliente: separar de forma automática los turnos de agente y cliente con una caché de hablantes de 264 tramas permite medir tiempos de habla, solapamientos e interrupciones en grabaciones mono de 16 kHz.
- Subtitulado en directo de eventos con varios ponentes: la configuración de baja latencia (1,04 s) y el contexto derecho de 0,32 s permiten etiquetar quién habla mientras el audio se está capturando, útil para mesas redondas y ruedas de prensa retransmitidas.
- Investigación cualitativa y entrevistas diádicas: la conversión no reentrena ni modifica pesos, lo que permite reproducir resultados offline con la variante FP32 como referencia numérica y la FP16 para despliegue en campo.
- Análisis de pódcast y archivos de medios: procesar episodios con múltiples invitados para generar índices por intervención, ya que la salida por hablante se ordena según la primera aparición.
- Accesibilidad y dispositivos de sala: detectar en tiempo real qué persona habla para iluminar indicadores, activar la cámara o mover el foco de un micrófono con un bucle de host que llama a los grafos una vez por chunk.
- Auditoría de calidad de transcripciones ASR: cruzar las probabilidades de actividad por hablante con la salida de un sistema de reconocimiento para detectar segmentos mal atribuidos antes de publicar el texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de diarización (DER, JER) en la información disponible. La model card únicamente incluye la validación numérica frente al modelo NeMo FP32 original con el mismo perfil de streaming:

| Grafo | PSNR frente a la referencia FP32 |
|---|---|
| Preencoder FP32 / FP16 | exacto / 81,4 dB |
| Encoder/cabeza FP32 (native / cache) | 164,6 / 171,5 dB |
| Encoder/cabeza FP16 (native / cache) | 99,4 / 103,4 dB |
| Encoder Neural Engine FP16 (native / cache) | 100,8 / 104,7 dB |

Además, se reporta que un flujo cerrado de 30 s en FP32 presenta concordancia estricta (2e-6 absoluto y 2e-5 relativo) y segmentos idénticos respecto a la referencia.

## Requisitos de hardware

- Dirigido al Neural Engine de Apple: requiere iOS 27 o macOS 27 y versiones posteriores. La variante de encoder con layout Neural Engine se carga con SpecializationOptions(preferredComputeUnitKind: .neuralEngine).
- Estimación de memoria a partir de los ~100 M de parámetros del modelo base: aproximadamente 0,2 GB en FP16 y 0,4 GB en FP32, más el estado de la caché de hablantes y la FIFO. El repositorio completo ocupa 0,8 GB porque incluye todas las variantes.
- Cabe en hardware de consumo: cualquier dispositivo Apple con Neural Engine que cumpla el requisito de versión del sistema. No se documentan requisitos de GPU discreta.
- Fuera del ecosistema Apple no se puede usar el formato .aimodel: para GPU NVIDIA o AMD hay que recurrir al modelo base nvidia/Nemotron-3-Diarization en NeMo.
- Despliegue: runtime Core AI (coreai-torch, coreai-core) con un bucle de streaming en el host; la compilación anticipada es opcional mediante xcrun coreai-build compile --preferred-compute neural-engine y depende de la arquitectura del dispositivo, por lo que no se incluye un bundle compilado.
- Latencia: chunk de 0,72 s, configuración de baja latencia de 1,04 s y salida a 10 ms. La primera especialización del encoder en Neural Engine tarda aproximadamente 35 s y queda cacheada después.
- Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Perfil | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smdesai/Nemotron-3-Diarization-CoreAI | ~100 M heredados | .aimodel (Core AI) para iOS/macOS | Streaming, formas fijas, configuración de baja latencia 1,04 s | openmdw-1.1 | 0 descargas, 0 likes en el momento de la consulta |
| nvidia/Nemotron-3-Diarization | ~100 M | .nemo (NeMo) | Streaming y offline, hasta 8 hablantes | no disponible | Repositorio oficial de NVIDIA |
| nvidia/Nemotron-3-Diarization-preview | no disponible | .nemo (NeMo) | Streaming y offline, hasta 8 hablantes | no disponible | Versión preliminar del mismo modelo |

No se dispone de datos de rendimiento comparado (DER) entre estas variantes ni con alternativas de terceros en la información proporcionada.

## Limitaciones y advertencias

- Límite de ocho hablantes y salidas sin identidad real: las etiquetas son genéricas y se ordenan por primera aparición, no por identidad persistente entre sesiones.
- Formas fijas: los grafos están exportados solo para la configuración de baja latencia (chunk de 9 tramas, contexto 1/4, caché y FIFO de 264). Otras configuraciones de latencia exigen una reexportación con formas distintas.
- Dependencia estricta del ecosistema Apple: iOS 27 o macOS 27 y Neural Engine. La primera especialización del encoder tarda unos 35 s; la compilación anticipada es específica por arquitectura de dispositivo.
- Pérdida de fidelidad numérica: el encoder FP16 estándar queda en 99,4 dB de PSNR y el de Neural Engine en 100,8 dB frente a FP32. El preencoder FP16 baja a 81,4 dB. Conviene validar umbrales y métricas con margen antes de producción.
- Sensibilidad del frontend al redondeo: cada trama debe proyectarse por separado contra el filterbank; un producto matricial por lotes altera el redondeo en coma flotante y hace divergir flujos largos.
- Las ventanas y el filterbank provienen del checkpoint original, que NVIDIA almacena en bfloat16, por lo que difieren ligeramente de valores float32 recalculados.
- Riesgo de alucinación en forma de hablantes fantasma o cambios espurios de etiqueta; el umbral por defecto es 0,5 y no se documenta calibración alternativa.
- Entrada limitada a audio mono de 16 kHz. No se documenta el comportamiento con ruido, reverberación, música o solapamientos severos.
- Sin datos publicados de sesgo, de DER ni de cobertura de idiomas. Tampoco se documentan los datos de entrenamiento del modelo base.
- Licencia openmdw-1.1: hay que revisar sus términos antes de un uso comercial, y la conversión no cuenta con validación de terceros (0 descargas y 0 likes en el momento de la consulta).
- Al no haberse reentrenado ni ajustado, cualquier limitación del modelo NVIDIA original se traslada íntegramente a esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smdesai/Nemotron-3-Diarization-CoreAI
- Modelo base oficial: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Versión preliminar del modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization-preview
- README del modelo base en GitHub: https://github.com/AMAImedia/Nemotron-3-Diarization-preview/blob/main/README.md
- Anuncio en Unite.AI: https://www.unite.ai/nvidia-releases-nemotron-3-diarization-open-weight-speaker-model/
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/09/23/nvidia-releases-nemotron-3-diarization/
