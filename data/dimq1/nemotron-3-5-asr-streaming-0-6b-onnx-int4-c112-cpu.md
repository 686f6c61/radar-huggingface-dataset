# DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-int4-c112-cpu

## Resumen

El modelo `DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-int4-c112-cpu` es una exportación a ONNX del sistema de reconocimiento de voz automático (ASR) en streaming Nemotron 3.5 ASR de NVIDIA, con una arquitectura FastConformer-RNNT de 0.6 mil millones de parámetros. Esta versión concreta está cuantizada a INT4 y optimizada para ejecución en CPU mediante ONNX Runtime, con una ventana de contexto de 112 frames (1,12 segundos) y un contexto izquierdo de 56 frames codificados. El modelo está diseñado para transcripción de voz en tiempo real con baja latencia, y en esta exportación soporta ruso e inglés, aunque el modelo original de NVIDIA cubre 40 locales.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y desplegable en hardware sin GPU, ideal para aplicaciones de borde o servidores de bajo coste. El autor, DimQ1, ha incluido además un modelo Silero VAD para detección de actividad de voz, lo que facilita su integración en pipelines completos de ASR. Según la model card, el rendimiento medido en Common Voice 17 (250 muestras en ruso y 250 en inglés) arroja un WER global del 19,21 %, con mejores resultados en ruso (15,72 %) que en inglés (22,41 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT (cache-aware) con joint de transducer |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de streaming de 112 frames (1,12 s), left_context de 56 frames codificados |
| Tipos de cuantizacion | INT4 (exportación ONNX) |
| Idiomas soportados | ruso (ru), inglés (en) en esta exportación; el modelo original soporta 40 locales |
| Licencia | other (licencia original de NVIDIA Nemotron, no especificada en detalle) |
| Formato de pesos | ONNX (con external data) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer-RNNT, una variante del Conformer que incorpora atención eficiente (FastConformer) para reducir el coste computacional, combinada con un decodificador RNN-T (transducer) que permite el reconocimiento en streaming. El encoder es cache-aware, es decir, mantiene un estado de contexto que se reutiliza entre ventanas de audio, lo que reduce la latencia y el coste de cómputo en comparación con los sistemas no streaming. El decodificador es una red LSTM de predicción, y el joint combina las salidas del encoder y el decodificador para producir las probabilidades de los tokens de salida.

El entrenamiento del modelo original fue realizado por NVIDIA, aunque no se dispone de detalles específicos sobre el dataset, el número de tokens o el uso de técnicas como RLHF o DPO en la información proporcionada. Esta exportación concreta ha sido cuantizada a INT4 y convertida a ONNX por el autor DimQ1, manteniendo la estructura original del modelo. El repositorio incluye además un modelo Silero VAD (detección de actividad de voz) para segmentar el audio antes de la transcripción.

## Capacidades

- Reconocimiento de voz automático en streaming con baja latencia, adecuado para transcripción en tiempo real.
- Soporte de ruso e inglés en esta exportación; el modelo original de NVIDIA cubre 40 locales.
- Detección de actividad de voz integrada mediante Silero VAD, lo que permite procesar audio continuo sin segmentación manual.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Arquitectura cache-aware que mantiene el contexto entre ventanas, mejorando la precisión en flujos de audio largos.
- Salida de texto con tokenización basada en BPE (tokenizer.json incluido).

## Casos de uso

- Transcripción de reuniones y llamadas en tiempo real: el modelo puede procesar audio de micrófono en streaming, generando subtítulos o actas mientras se habla. Su baja latencia (ventana de 1,12 s) lo hace adecuado para este escenario.
- Asistentes de voz en dispositivos de bajo consumo: al ejecutarse en CPU con cuantización INT4, puede desplegarse en Raspberry Pi, mini-PCs o servidores sin GPU para comandos de voz o dictado.
- Subtitulado automático de vídeos en directo: integrado con un pipeline de captura de audio, el modelo transcribe el habla en tiempo real para generar subtítulos en ruso o inglés.
- Atención al cliente automatizada: en centros de llamadas, el modelo puede transcribir conversaciones para análisis posterior o para alimentar sistemas de búsqueda y resumen.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o eventos, mostrando el texto en pantalla.
- Análisis de voz en investigación: el modelo puede utilizarse para extraer transcripciones de corpus de audio en ruso e inglés, con un WER conocido y reproducible en Common Voice 17.

## Benchmarks y rendimiento

La model card proporciona resultados de WER (Word Error Rate) medidos en el conjunto de datos Common Voice 17, con 250 muestras en ruso y 250 en inglés, ejecutados en CPU. No se dispone de comparaciones con otros modelos en la información proporcionada.

| Conjunto de datos | WER |
|---|---|
| Common Voice 17 (global, 500 muestras) | 19,21 % |
| Common Voice 17 (ruso, 250 muestras) | 15,72 % |
| Common Voice 17 (inglés, 250 muestras) | 22,41 % |

## Requisitos de hardware

- Inferencia en CPU: el modelo está optimizado para CPU mediante ONNX Runtime, sin necesidad de GPU.
- Memoria RAM: el repositorio ocupa 0,8 GB, por lo que se puede cargar en sistemas con al menos 2 GB de RAM disponibles.
- CPU recomendada: cualquier procesador x86-64 con soporte para instrucciones AVX2 o superiores; se recomienda un mínimo de 4 núcleos para un rendimiento fluido en streaming.
- No requiere VRAM, ya que no se usa GPU.
- Opciones de despliegue: ONNX Runtime (con el ejecutor de CPU), ORT GenAI (según la configuración incluida), o un motor personalizado que use numpy y onnxruntime, como el propuesto en el repositorio de codavidgarcia.
- Latencia: la ventana de streaming es de 1,12 segundos, lo que indica una latencia de procesamiento de aproximadamente ese orden, aunque el throughput exacto no se ha publicado.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos ASR en la información proporcionada. El modelo original de NVIDIA (nvidia/nemotron-3.5-asr-streaming-.6b) es la referencia inmediata, con soporte para 40 locales y sin cuantización. Otras alternativas como Whisper (de OpenAI) ofrecen mayor precisión en muchos idiomas pero con un coste computacional superior y sin streaming nativo. Dado que no se han publicado benchmarks comparativos en esta ficha, se recomienda evaluar el modelo en el caso de uso específico antes de adoptarlo.

## Limitaciones y advertencias

- La licencia es "other" y se remite a la licencia original de NVIDIA Nemotron; es necesario revisar los términos exactos antes de un uso comercial, ya que puede incluir restricciones.
- Esta exportación solo soporta ruso e inglés, a pesar de que el modelo original cubre 40 locales; para otros idiomas es necesario buscar otras exportaciones o el modelo original.
- El WER en inglés (22,41 %) es notablemente peor que en ruso (15,72 %), lo que puede limitar su uso en aplicaciones donde el inglés sea el idioma principal.
- El modelo puede presentar errores en acentos, ruido de fondo o habla solapada, como es común en sistemas ASR; se recomienda probar con audio del dominio objetivo.
- No se han publicado detalles sobre sesgos o alucinaciones específicas, pero al ser un modelo de transcripción, los errores de reconocimiento pueden propagarse a sistemas posteriores.
- El tamaño del repositorio (0,8 GB) incluye el modelo cuantizado y los archivos de configuración; la carga en memoria puede requerir más RAM que el tamaño del archivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DimQ1/nemotron-3.5-asr-streaming-0.6b-onnx-int4-c112-cpu
- Repositorio de exportación ONNX (codavidgarcia): https://github.com/codavidgarcia/nemotron-3.5-asr-streaming-onnx
- README del repositorio de exportación: https://github.com/codavidgarcia/nemotron-3.5-asr-streaming-onnx/blob/main/README.md
- Modelo original de NVIDIA (referencia): https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-.6b (no verificado en la búsqueda, pero se menciona en el repositorio de GitHub)
