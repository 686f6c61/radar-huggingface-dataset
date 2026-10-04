# soniqo/Parakeet-EOU-120M-ONNX-INT8-160ms

## Resumen

Parakeet-EOU-120M-ONNX-INT8-160ms es una exportación a ONNX del modelo NVIDIA Parakeet-Realtime-EOU-120M, publicada por el usuario soniqo. Se trata de un modelo de reconocimiento automático del habla (ASR) en inglés orientado a streaming, que además incorpora detección de fin de turno (end-of-utterance, EOU) mediante los tokens especiales `<EOU>` y `<EOB>`. El modelo original parte de una arquitectura cache-aware FastConformer combinada con un decodificador RNN-T y ronda los 120 millones de parámetros, lo que lo sitúa en la gama ligera para inferencia en tiempo real.

La aportación concreta de esta exportación es triple: se distribuye como tres grafos ONNX (encoder, decoder y joint) con opset 17, mantiene las cachés del encoder entre pasos y aplica cuantización dinámica INT8 únicamente al encoder, dejando el predictor y la red joint en FP32. El paso de streaming es de 160 ms de audio nuevo por iteración (16 tramas mel, 2 tramas de encoder confirmadas), frente a los 320 ms de una exportación anterior del mismo autor.

El modelo es relevante ahora porque permite ejecutar ASR en streaming con detección nativa de fin de turno sobre CPU x86 convencional, sin GPU, con un coste de memoria muy contenido (aproximadamente 146 MiB de grafos). Está pensado como componente de aplicaciones de voz conversacional, donde el enrutado a herramientas y la síntesis de voz corresponden a otros modelos de la aplicación, no a este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache-aware FastConformer (encoder) + RNN-T (predictor y red joint) |
| Parametros totales | Aproximadamente 120 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 9 tramas mel en cache y 70 tramas de contexto de atencion a la izquierda en el encoder; ventana de streaming de 160 ms (16 tramas mel y 2 tramas de encoder confirmadas por paso) |
| Tipos de cuantizacion | INT8 dinamico en el encoder; predictor y red joint en FP32 |
| Idiomas soportados | Ingles (la model card indica expresamente que no se declara reconocimiento multilingue) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | ONNX (tres grafos independientes, opset 17) |

Especificaciones adicionales del contrato de streaming:

| Parametro | Valor |
|---|---|
| Audio de entrada | Mono, 16 kHz |
| Frontend mel | 128 bins Slaney, FFT 512, hop 160, ventana Hann simetrica de 400, pre-enfasis 0.97, log guard 2^-24 |
| Tamano total de grafos | Aproximadamente 146 MiB |
| Runtime probado | ONNX Runtime 1.21, Linux x86 sobre CPU |
| Tokens especiales | `<EOU>` y `<EOB>` |
| Formato de salida de texto | Minusculas y sin puntuacion |

## Arquitectura y entrenamiento

La arquitectura combina un encoder FastConformer con reconocimiento de caché y un decodificador RNN-T formado por una red de predicción recurrente y una red joint. La característica definitoria es el mantenimiento explícito del estado: las cachés del encoder y el estado del predictor deben pasarse entre pasos consecutivos de streaming, de modo que el modelo conserva 9 tramas mel y hasta 70 tramas de contexto de atención a la izquierda para no perder información acústica entre fragmentos. Cada paso consume 160 ms de audio nuevo y compromete 2 tramas de encoder.

La exportación mantiene el encoder en INT8 dinámico y el predictor y la red joint en FP32. Según la model card, los pesos de convolución y los puntos cero se recentran a valores sin signo para satisfacer el kernel `ConvInteger` de x86, sumando 128 a ambos extremos para preservar la aritmética entera; el resto de pesos cuantizados dinámicamente permanecen en INT8 con signo. El encoder consume y devuelve tensores float32.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card de esta exportación tampoco describe el proceso de entrenamiento del modelo base de NVIDIA, más allá de identificarlo como origen de los pesos.

## Capacidades

- Reconocimiento de voz en streaming para inglés, con texto en minúsculas y sin puntuación.
- Detección de fin de turno mediante los tokens especiales `<EOU>` y `<EOB>`, integrada en el propio modelo en lugar de depender solo de un detector de silencio externo.
- Procesamiento por pasos de 160 ms de audio nuevo, con estado de encoder y predictor persistente entre pasos.
- Inferencia sobre CPU x86 con ONNX Runtime 1.21, sin necesidad de GPU en la configuración probada.
- Reconocimiento de pausas internas en la frase: en las pruebas de la model card, pausas insertadas de 200, 300 y 400 ms produjeron 3 de 3 turnos completos y únicos.
- Integración como componente ASR dentro de aplicaciones mayores con enrutado a herramientas: en la prueba integrada se registraron 17 de 17 casos correctos, 12 de ellos con llamadas a herramientas exactas.
- No se declara soporte de tool calling ni de agentes por parte del modelo en sí; esa capa pertenece a la aplicación.
- No se declaran capacidades de visión, audio generativo ni multilingüismo.

## Casos de uso

- Agentes de voz conversacionales con detección de fin de turno: el modelo emite `<EOU>` de forma nativa y permite reducir el tiempo de espera antes de que el agente responda. En las mediciones del autor, la mediana de detección de EOU fue de 632 ms (rango 496-896 ms), frente a 1008 ms de la exportación de 320 ms, aunque la aplicación seguía necesitando un fallback de silencio de 350 ms.
- Dictado y transcripción en tiempo real sobre portátil o equipo de sobremesa: al ejecutarse en CPU x86 con ONNX Runtime y ocupar alrededor de 146 MiB de grafos, es viable en máquinas sin GPU dedicada.
- Subtitulado en directo de reuniones o retransmisiones en inglés: el paso de 160 ms permite refrescar el texto con baja granularidad temporal, aunque el modelo no genera puntuación ni mayúsculas, por lo que el post-procesado debe añadirla.
- Enrutado de comandos de voz a herramientas en pipelines de automatización: la prueba integrada del autor encadena el ASR con un controlador de herramientas Qwen2.5-1.5B y sintetizador MiniCPM-o 4.5, con 12 llamadas a herramientas exactas sobre 17 casos.
- Centralita telefónica o IVR con capacidad de interrupción: la detección temprana de fin de turno facilita que el sistema deje de hablar cuando el usuario ha terminado, si bien la model card advierte que un `<EOU>` propuesto no equivale a prueba de que un comando pausado haya concluido.
- Despliegue en el borde o en contenedores con recursos limitados: el tamaño reducido de los grafos y la cuantización INT8 del encoder permiten empaquetarlo en imágenes ligeras junto a otros servicios.
- Transcripción por lotes de locuciones completas: el helper `infer.py` incluido consume una locución ya terminada, calcula las características de la onda completa y arrastra las cachés ONNX en fragmentos sucesivos de 160 ms, lo que sirve como punto de partida para procesamiento offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER, MMLU u otros) en la información disponible. La model card indica explícitamente que las pruebas emplean fixtures sintéticos en inglés y que no establecen tasa de error de palabras, precisión ante pausas conversacionales, robustez ante acentos ni calidad de síntesis acústica.

Sí se publican resultados de validación funcional y latencias medidas el 4 de octubre de 2026 sobre un Intel Core Ultra 9 285K en un contenedor Linux sobre Windows/WSL2:

| Comprobacion | Resultado | Interpretacion |
|---|---|---|
| Salidas de la exportacion FP32 frente a NeMo | Dentro de 0,001 de tolerancia absoluta/relativa | Incluye cuatro llamadas al encoder con estado de cache, mas salidas del predictor y del joint |
| Contrato ONNX y pruebas de cuantizacion en CPU | 8 superadas | Los grafos cargan, encadenan y ejecutan en el runtime de CPU probado |
| Transcripciones sinteticas exactas en ingles | 6/6 | Conjunto de regresion de frases cortas; no es un benchmark general de precision |
| Pausas insertadas a mitad de frase (200/300/400 ms) | 3/3 turnos completos y unicos | La aplicacion de prueba mantuvo su fallback de silencio de 350 ms |
| Casos de voz integrados | 17/17 | 12 llamadas a herramientas y resultados exactos y 5 peticiones sin herramientas |
| Finalizacion del ASR integrado | 12,1 ms de mediana | La ejecucion anterior con la exportacion de 320 ms midio 18,0 ms |
| Fin de habla estimado hasta el primer PCM recibido | 1,46 s de mediana | Incluye deteccion de endpoint, enrutado y sintesis de voz en vivo; no se establece una mejora global de velocidad |

Comparativa de la deteccion nativa de `<EOU>`, con el fallback de silencio extendido a 1200 ms y medida desde la ultima trama con voz de Silero en reproduccion offline (excluye computo, planificacion y latencia del dispositivo de audio):

| Exportacion | Mediana de EOU | Rango de EOU |
|---|---|---|
| Exportacion anterior de 320 ms | 1008 ms | 756–1096 ms |
| Esta exportacion de 160 ms | 632 ms | 496–896 ms |

Advertencia textual de la model card: un paso de streaming de 160 ms no garantiza una latencia de endpoint o de respuesta de 160 ms.

## Requisitos de hardware

- Uso de memoria: los tres grafos ONNX suman aproximadamente 146 MiB (encoder 125,6 MiB, decoder 15,0 MiB, joint 5,3 MiB), a lo que hay que añadir el overhead del runtime de ONNX Runtime y los buffers de estado de encoder y predictor.
- VRAM estimada para inferencia: no disponible. La model card no reporta ejecución en GPU ni cifras de VRAM.
- GPU recomendadas: no disponibles. La configuración validada es CPU x86 con ONNX Runtime 1.21 sobre Linux; la aplicación de prueba utilizó una RTX 5090, pero para los modelos de síntesis de voz y control de herramientas, no para el ASR.
- Compatibilidad con GPU de consumo: el modelo cabe sin problema en el almacenamiento y la memoria de cualquier equipo moderno, pero no se han publicado mediciones específicas de inferencia en GPU de consumo.
- Opciones de despliegue: ONNX Runtime 1.21 (probado). Otros execution providers de ONNX Runtime (CUDA, TensorRT, DirectML) no se han validado en la información disponible. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo ASR de este tipo.
- Dependencias de uso: `huggingface_hub`, `onnxruntime==1.21.0`, `librosa`, `soundfile`, `scipy` y `numpy<2`.
- Latencia y throughput: finalización del ASR integrado con mediana de 12,1 ms (frente a 18,0 ms con la exportación de 320 ms); fin de habla estimado hasta el primer PCM de 1,46 s de mediana en el pipeline completo. No se publica throughput en tiempo real ni factor de tiempo real aislado del ASR.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otros modelos ASR de terceros, ni cifras de WER que permitan situarlo frente a alternativas. La comparación posible se limita al modelo base y a la exportación previa del mismo autor:

| Modelo | Parametros | Contexto o paso de streaming | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soniqo/Parakeet-EOU-120M-ONNX-INT8-160ms | Aproximadamente 120 M | 160 ms por paso (16 tramas mel, 2 tramas de encoder) | ONNX, encoder INT8 dinamico, predictor y joint FP32 | nvidia-open-model-license | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| nvidia/parakeet_realtime_eou_120m-v1 (modelo base) | Aproximadamente 120 M | No disponible en la informacion proporcionada | No disponible | nvidia-open-model-license (heredada por la exportacion) | HuggingFace, repositorio de NVIDIA |
| Exportacion previa de 320 ms del mismo autor | Aproximadamente 120 M | 320 ms por paso | ONNX | No disponible | Referenciada en la model card, sin URL directa |

Comparativa con modelos de otras familias (Whisper, Wav2Vec2, Conformer de otras procedencias): no disponible, al no haberse publicado métricas de precisión en la información proporcionada.

## Limitaciones y advertencias

- Idioma: únicamente inglés. La model card afirma explícitamente que no se reclama reconocimiento multilingüe.
- Formato de salida: texto en minúsculas y sin puntuación, lo que obliga a post-procesado si se necesita texto presentable.
- Ausencia de métricas de precisión: no se publica WER ni ningún otro benchmark de accuracy. Las pruebas de 6/6 transcripciones exactas se hicieron sobre un conjunto sintético pequeño y no constituyen una evaluación general.
- Riesgo de alucinación y de errores acústicos: no cuantificado. No hay datos sobre robustez ante acentos, ruido de fondo, solapamiento de hablantes ni audio telefónico de banda estrecha.
- Detección de fin de turno no concluyente: la model card advierte de que interpretar un `<EOU>` propuesto como prueba de que un comando pausado ha terminado es incorrecto. En las mediciones, el EOU nativo (632 ms de mediana) siguió superando el fallback de silencio de 350 ms, por lo que la aplicación mantuvo dicho fallback activo.
- Gestión de estado obligatoria: las cachés del encoder y el estado del predictor deben propagarse entre pasos. Reiniciarlos en cada paquete rompe el contrato de streaming.
- Limitación del helper incluido: `infer.py` consume una locución ya completada y hace un vaciado sintético de la cola que no representa una espera de endpoint en vivo. Para micrófono se necesita un frontend continuo y gestión explícita de endpoints.
- Advertencia sobre latencia: un paso de 160 ms no implica una latencia de endpoint o respuesta de 160 ms.
- Licencia: nvidia-open-model-license. Es una licencia "other" que conviene revisar antes de un uso comercial, ya que puede imponer condiciones de atribución o restricciones específicas recogidas en el acuerdo de NVIDIA.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 4 de octubre de 2026. Es una exportación de terceros, no oficial de NVIDIA, y el campo `inference` de la model card está marcado como `false`, por lo que no se sirve mediante la Inference API de HuggingFace.
- Las cifras de latencia de extremo a extremo proceden de una aplicación concreta que incluye síntesis de voz y enrutado de herramientas, y no son tiempos aislados de inferencia ASR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soniqo/Parakeet-EOU-120M-ONNX-INT8-160ms
- Modelo base en HuggingFace: https://huggingface.co/nvidia/parakeet_realtime_eou_120m-v1
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Runtime C++ mencionado en la model card: la URL aparece truncada en la información disponible (comienza por `https://githu...`), por lo que no se puede reproducir completa.
- El resto de los resultados de la búsqueda web no guardan relación con el modelo y se han descartado por no ser fuentes utilizables.
