# Manveer04/indicconformer-pa-v3-kirtan-int8

## Resumen
Manveer04/indicconformer-pa-v3-kirtan-int8 es una conversión a ONNX int8 del modelo de reconocimiento automático del habla surindersinghssj/indicconformer-pa-v3-kirtan, especializado en punyabí (gurmukhi) aplicado a kirtan y lectura de Gurbani. El autor original es Surinder Singh; este repositorio solo cambia el formato y la cuantización para permitir inferencia en dispositivo (Android, iOS y CPU de escritorio) mediante ONNX Runtime. La licencia es Apache-2.0, igual que la del modelo base.

El modelo resuelve el problema de transcribir audio religioso en punyabí en entornos con recursos limitados: el archivo final ocupa 188 MB frente a los 482 MB del original en precisión completa, y añade un front-end de audio que acepta directamente PCM a 16 kHz en lugar de características log-mel de 80 bandas. Emplea una arquitectura conformer con cabecera CTC y un vocabulario de 256 piezas SentencePiece en gurmukhi más el token CTC blank en el índice 256.

Su relevancia actual radica en que demuestra que es posible llevar un modelo ASR de dominio específico a teléfonos manteniendo prácticamente la misma precisión: la degradación medida es de 0,3 puntos de CER en kirtan y nula en sehaj paath. No se dispone de información sobre el número de parámetros ni sobre la longitud de contexto, ya que la model card no los detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabecera CTC (exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada variable `[B, T]`) |
| Tipos de cuantizacion | int8 dinámica por canal, solo en operaciones MatMul |
| Idiomas soportados | punyabí (pa), escritura gurmukhi |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`v3-kirtan.onnx`, 187.857.171 bytes) |
| Frecuencia de muestreo | 16 kHz mono, float32 |
| Vocabulario | 256 piezas SentencePiece gurmukhi + blank CTC (índice 256) |
| Entradas | `audio` float32 `[B, T]`, `audio_len` int64 `[B]` |
| Salidas | `log_probs` float32 `[B, T', 257]`, `out_len` int64 `[B]` |
| SHA-256 | `22872cf2a5e1743ed691bc7410a9ec76f4530971e5dfd4c2a3d0c9c641617b90` |

## Arquitectura y entrenamiento
El modelo base es un conformer con decodificación CTC, derivado de la familia IndicConformer de AI4Bharat (concretamente de `ai4bharat/indicconformer_stt_pa_hybrid_ctc_rnnt_large`). La conversión no reentrena ni altera los pesos más allá de la cuantización: aplica int8 dinámica por canal exclusivamente a las operaciones MatMul, evitando `ConvInteger` en las convoluciones porque el backend CPU de ONNX Runtime no puede ejecutarlo. Además, se antepone el preprocesador de audio del modelo base (procedente de `karansea/indicconformer-stt-pa-ctc-shabad-preview`, licencia MIT), de modo que el archivo acepta audio crudo a 16 kHz en lugar de características log-mel de 80 bandas. También se expone la longitud codificada como salida `out_len`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base está especializado en kirtan y lectura de Gurbani, y los conjuntos de evaluación públicos del autor original provienen del mismo pipeline de subtítulos que los datos de entrenamiento.

## Capacidades
- Reconocimiento automático del habla en punyabí (gurmukhi) con decodificación CTC greedy.
- Transcripción de audio de kirtan (canto devocional sij) y de sehaj paath (lectura continua del Guru Granth Sahib).
- Entrada directa de audio PCM float32 a 16 kHz mono, sin preprocesado externo de características.
- Salida de log-probabilidades por fotograma (`log_probs`) y longitud codificada (`out_len`), lo que permite integrar decodificadores externos o léxicos.
- Inferencia en dispositivo mediante ONNX Runtime en Android, iOS y CPU de escritorio.
- No se ha documentado soporte de tool calling, agentes, visión, audio multimodal ni modo de razonamiento.

## Casos de uso
- Transcripción de kirtan en directo desde el móvil: la aplicación captura audio a 16 kHz y lo pasa directamente al archivo ONNX, que devuelve log-probabilidades decodificables con CTC greedy; el tamaño de 188 MB permite incluirlo en el APK o descargarlo bajo demanda.
- Subtitulado de grabaciones de sehaj paath: con un CER de 9,2 sobre el conjunto de evaluación del autor, el modelo es adecuado para generar subtítulos revisables de lecturas largas, segmentando el audio en fragmentos y concatenando las salidas mediante `out_len`.
- Archivado y búsqueda de bibliotecas de audio religioso: transcribir lotes de grabaciones en un servidor CPU con ONNX Runtime y construir un índice de texto searchable sobre gurmukhi.
- Aplicaciones educativas de aprendizaje de Gurbani: comparar la transcripción del alumno con la referencia y señalar discrepancias a nivel de carácter o palabra.
- Asistentes devocionales sin conexión: integración en apps iOS/Android que funcionan sin red, usando el modelo int8 para transcribir consultas habladas en punyabí.
- Investigación en ASR de bajos recursos: servir como referencia cuantizada para comparar el impacto de int8 en lenguas con escritura no latina y dominios especializados.
- Pipeline de accesibilidad: generar subtítulos en directo para retransmisiones de kirtan con latencia baja en CPU de escritorio (4 hilos según la evaluación del autor).

## Benchmarks y rendimiento
Resultados publicados en la model card sobre los conjuntos de evaluación públicos del autor original (kirtan: 573 clips; sehaj paath: 444 clips), decodificación CTC greedy, CPU, 4 hilos:

| Modelo | Kirtan CER / WER | Paath CER / WER | Tamano |
|---|---|---|---|
| Original, precision completa | 33,9 / 64,7 | 9,2 / 27,9 | 482 MB |
| Este archivo int8 | 34,2 / 65,3 | 9,2 / 28,2 | 188 MB |

El propio autor advierte que estos conjuntos provienen del mismo pipeline de subtítulos que los datos de entrenamiento del modelo original, por lo que deben interpretarse como una comprobación de que la conversión preserva la precisión, no como un benchmark general. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM/RAM estimada para inferencia: el archivo ONNX ocupa 188 MB; en CPU el consumo de memoria es moderado y cabe holgadamente en dispositivos móviles actuales.
- GPU recomendadas: no se especifican; el modelo está empaquetado para CPU (Android, iOS, escritorio) con ONNX Runtime. No se documenta soporte CUDA ni TensorRT.
- Cabe en GPU de consumo: no aplica de forma directa, ya que la conversión está orientada a CPU; el original en fp32 (482 MB) sí cabría en cualquier GPU con 2 GB o más.
- Opciones de despliegue: ONNX Runtime (CPU) en Android, iOS y escritorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo ASR y no de un LLM.
- Latencia y throughput: no disponibles de forma numérica; la evaluación se realizó con 4 hilos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Manveer04/indicconformer-pa-v3-kirtan-int8 | no disponible | audio variable | Apache-2.0 | ONNX int8 (188 MB) | Este modelo; orientado a dispositivo |
| surindersinghssj/indicconformer-pa-v3-kirtan | no disponible | audio variable | Apache-2.0 | pesos originales (482 MB) | Modelo base, precisión completa |
| karansea/indicconformer-stt-pa-ctc-shabad-preview | no disponible | audio variable | MIT | no disponible | Comparte vocabulario y preprocesador; intercambiable a nivel de vocabulario |
| ai4bharat/indicconformer_stt_pa_hybrid_ctc_rnnt_large | no disponible | audio variable | MIT | no disponible | Modelo de origen de AI4Bharat; cabecera híbrida CTC/RNNT |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la tabla de CER/WER incluida en la sección de benchmarks.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; el dominio de entrenamiento es kirtan y Gurbani, por lo que el rendimiento fuera de ese registro puede degradarse.
- Riesgo de alucinación: en ASR se traduce en sustituciones o inserciones de texto; el CER de 34,2 en kirtan indica una tasa de error elevada que exige revisión humana en producción.
- Limitaciones de contexto o idioma: solo punyabí en gurmukhi; no soporta otros idiomas ni escrituras. No se documenta la longitud máxima de audio.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el front-end de audio procede de un componente MIT y el modelo base de AI4Bharat también es MIT; conviene conservar los avisos de atribución correspondientes.
- Caveat de producción: los conjuntos de evaluación comparten pipeline con los datos de entrenamiento, por lo que las métricas publicadas no reflejan el rendimiento en audio real diverso.
- La cuantización int8 solo afecta a MatMul; no se ha evaluado el impacto en dominios distintos de los conjuntos del autor.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica poca validación externa.

## Enlaces
- Hugging Face: https://huggingface.co/Manveer04/indicconformer-pa-v3-kirtan-int8
- Modelo base: https://huggingface.co/surindersinghssj/indicconformer-pa-v3-kirtan
- Modelo de origen del preprocesador de audio: https://huggingface.co/karansea/indicconformer-stt-pa-ctc-shabad-preview
- Modelo AI4Bharat IndicConformer: https://huggingface.co/ai4bharat/indicconformer_stt_pa_hybrid_ctc_rnnt_large
- Conjunto de evaluación kirtan: https://huggingface.co/datasets/surindersinghssj/gurbani-kirtan-yt-captions-eval-canonical
- Conjunto de evaluación sehaj paath: https://huggingface.co/datasets/surindersinghssj/gurbani-sehajpath-yt-captions-eval-canonical
