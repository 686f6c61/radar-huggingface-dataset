# omnixima/bangla-fastconformer-ctc-116m-gguf

## Resumen

El modelo `omnixima/bangla-fastconformer-ctc-116m-gguf` es una conversión al formato GGUF del checkpoint `kazalbrur/Bangla-asr-fastconformer-116m-dialects`, un sistema de reconocimiento automático del habla (ASR) en bengalí basado en la arquitectura FastConformer de NVIDIA NeMo con cabecera CTC. Cuenta con 115.618.817 parámetros (aproximadamente 116 millones) y está especializado en transcripción de audio en lengua bengalí (`bn`), incluyendo variedades dialectales según el nombre del modelo base.

La relevancia de esta conversión radica en que traslada un modelo NeMo originalmente pesado a un formato GGUF de 138 MB (cuantización Q8_0), ejecutable mediante `transcribe.cpp` en hardware de consumo. Según las mediciones del autor, la versión Q8_0 alcanza un WER del 9,0 % sobre 200 clips del conjunto FLEURS `bn_in` con una velocidad de aproximadamente 330x tiempo real en Metal (Apple M2 Max), frente a las 30x del checkpoint NeMo original en CPU.

El modelo forma parte del proyecto Kothon, una aplicación de dictado offline para macOS en bengalí. No incluye puntuación en su salida; el autor recomienda combinarlo con `omnixima/bangla-punctuation-muril6` para restaurarla. La licencia es Apache-2.0, idéntica a la del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (NeMo) con cabecera CTC |
| Parámetros totales | 115.618.817 (~116 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (recomendada, 138 MB), F32 (referencia, 463 MB) |
| Idiomas soportados | bengalí (`bn`), incluyendo dialectos según el modelo base |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Vocabulario | 1024 tokens (perfil `bangla-fastconformer-ctc-116m`) |
| Tamaño del repo | 0,6 GB |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura subyacente es FastConformer, una variante del Conformer con atención subsampled que reduce la longitud de secuencia en la entrada del encoder para acelerar la inferencia manteniendo precisión. Sobre el encoder se aplica una cabecera CTC (Connectionist Temporal Classification) para la decodificación de caracteres o subpalabras, sin necesidad de un decoder autorregresivo. El vocabulario del perfil GGUF es de 1024 tokens.

Los detalles de entrenamiento (número de horas de audio, composición del corpus, técnicas de aumento de datos o ajuste fino) no están disponibles en la información proporcionada; corresponden al autor original `kazalbrur`. La conversión a GGUF se realizó con el script `convert-parakeet.py` de transcribe.cpp, que procesa el modelo a través de la ruta CTC de Parakeet, y posteriormente se cuantizó con `transcribe-quantize --quant Q8_0`. Esta conversión no modifica los pesos más allá de la cuantización: el repositorio solo cambia el formato de archivo.

## Capacidades

- Reconocimiento automático del habla en bengalí (transcripción de audio a texto).
- Soporte de variedades dialectales del bengalí, según el modelo base.
- Decodificación CTC sin modelo de lenguaje externo ni decoder autorregresivo.
- Inferencia acelerada por Metal en Apple Silicon y por CPU.
- Ejecución offline mediante `transcribe.cpp` y la CLI `transcribe-cli`.
- No genera puntuación; requiere un modelo auxiliar para restaurarla.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo ASR puro).
- No soporta visión, audio generativo ni otros idiomas distintos del bengalí.

## Casos de uso

- Dictado offline en macOS: el modelo es el motor ASR rápido de la aplicación Kothon, que transcribe voz a texto en bengalí sin conexión a internet, aprovechando su ejecución en Metal a ~330x tiempo real.
- Transcripción de reuniones y notas de voz en bengalí: con 138 MB en Q8_0 puede desplegarse localmente en portátiles y procesar grabaciones largas en minutos, sin enviar audio a servicios externos.
- Subtitulado automático de contenido audiovisual en bengalí: la CLI `transcribe-cli` permite generar transcripciones con marcas de tiempo opcionales (`--timestamps none` o con timestamps) para integrarlas en pipelines de subtitulado.
- Investigación en ASR de bajos recursos: sirve como línea base ligera y reproducible (WER 9,0 % en FLEURS `bn_in`) para comparar técnicas de cuantización o de normalización de texto.
- Procesamiento por lotes en servidores sin GPU: la versión Q8_0 en CPU alcanza ~120x tiempo real, suficiente para transcribir archivos de audio en pipelines batch con hardware modesto.
- Aplicaciones de accesibilidad para hablantes de bengalí: integración en herramientas de voz a texto para personas con movilidad reducida, con privacidad total al ejecutarse en local.
- Preprocesamiento de corpus de voz: generación de transcripciones iniciales para anotación humana o para entrenar modelos de puntuación y normalización posteriores.

## Benchmarks y rendimiento

Mediciones del autor sobre 200 clips del conjunto de test FLEURS `bn_in` (46,7 minutos de audio), tras normalización NFC y eliminación de puntuación, en un Apple M2 Max:

| Build | WER | CER | Velocidad |
|---|---|---|---|
| Q8_0, Metal | 9,0 % | 5,6 % | ~330x tiempo real |
| Q8_0, CPU | 9,1 % | 5,7 % | ~120x tiempo real |
| Checkpoint NeMo original, CPU | 9,2 % | 5,8 % | ~30x tiempo real |

No se han publicado otros resultados de benchmarks (p. ej. Common Voice, MMLU, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~138 MB para Q8_0 y ~463 MB para F32; cabe holgadamente en cualquier equipo moderno.
- GPU recomendadas: no requiere GPU dedicada; se beneficia de Metal en Apple Silicon (M1/M2/M3/M4). En GPU NVIDIA/AMD no hay datos de rendimiento publicados para esta conversión.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~0,5 GB de memoria libre; también funciona en CPU.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), integración en la app Kothon. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo ASR y no un LLM.
- Latencia y throughput: ~330x tiempo real en Metal (M2 Max) y ~120x tiempo real en CPU con Q8_0; el checkpoint NeMo original en CPU rinde ~30x tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | WER (FLEURS bn_in) | Velocidad | Licencia |
|---|---|---|---|---|---|
| omnixima/bangla-fastconformer-ctc-116m-gguf (Q8_0) | ~116 M | GGUF | 9,0 % (Metal) / 9,1 % (CPU) | ~330x / ~120x tiempo real | Apache-2.0 |
| kazalbrur/Bangla-asr-fastconformer-116m-dialects (NeMo) | ~116 M | NeMo | 9,2 % (CPU) | ~30x tiempo real | Apache-2.0 |
| Otros modelos ASR en bengalí | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación se limita al modelo original, ya que no se dispone de datos de otros sistemas ASR en bengalí en la información proporcionada.

## Limitaciones y advertencias

- No genera puntuación; es necesario un modelo auxiliar (p. ej. `omnixima/bangla-punctuation-muril6`) para obtener texto con signos.
- Solo soporta bengalí; no es multilingüe.
- Es un modelo ASR puro: no realiza razonamiento, generación de texto libre, tool calling ni tareas de agente.
- El rendimiento se ha medido únicamente en FLEURS `bn_in`; el comportamiento en otros dominios (conversacional, ruido de fondo, acentos no cubiertos) no está documentado.
- Riesgo de errores en nombres propios, términos técnicos y números, habitual en modelos CTC sin modelo de lenguaje externo.
- No hay información sobre sesgos demográficos o dialectales más allá de la mención a dialectos en el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero debe mantenerse la atribución al autor original del entrenamiento (`kazalbrur`).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente sin validación comunitaria amplia.
- La longitud de contexto (duración máxima de audio procesable) no está especificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/omnixima/bangla-fastconformer-ctc-116m-gguf
- Modelo base: https://huggingface.co/kazalbrur/Bangla-asr-fastconformer-116m-dialects
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Aplicación Kothon: https://github.com/Omnixima/kothon
- Modelo de puntuación: https://huggingface.co/omnixima/bangla-punctuation-muril6
- Autor original: https://huggingface.co/kazalbrur
