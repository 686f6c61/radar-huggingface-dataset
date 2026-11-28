# raymondchins/thewhisper-large-v3-turbo-coreml

## Resumen

TheWhisper Large V3 Turbo Core ML es una conversión del modelo de reconocimiento automático del habla TheWhisper Large V3 Turbo de TheStage AI, empaquetada en formato Core ML para ejecutarse sobre la Apple Neural Engine. El autor de la conversión es raymondchins, y el resultado se distribuye como un conjunto de artefactos `.mlmodelc` que una aplicación de dictado para macOS (Speakey) descarga y ejecuta mediante WhisperKit con su propio decodificador de texto. El modelo base es una variante afinada de Whisper Large V3 Turbo de OpenAI.

El problema que resuelve es la inferencia local de ASR en hardware Apple con un consumo de espacio reducido: el directorio completo ocupa 969 MB frente a los 1,76 GB de una compilación fp16 del mismo modelo. Para lograrlo, el codificador de audio y el decodificador de texto usan pesos de 8 bits (simétricos, una escala por canal de salida), mientras que sesgos, normalizaciones, embeddings y la atención cruzada se mantienen en fp16.

Es relevante por su enfoque práctico: cuantización agresiva del codificador y el decodificador con una pérdida de precisión mínima medida sobre FLEURS, y una latencia inferior a la compilación fp16 en el hardware de prueba. No obstante, se trata de un artefacto muy específico (Core ML, Neural Engine, integración con WhisperKit) y no de un modelo genérico de pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (decodificador con 448 posiciones) |
| Tipos de cuantizacion | Pesos de 8 bits en codificador de audio y decodificador de texto; fp16 en sesgos, normas, embeddings y atención cruzada |
| Idiomas soportados | en, ar, bg, bn, cs, da, de, el, es, et, fa, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, ms, mt, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tl, tr, uk, vi, zh |
| Licencia | cc-by-4.0 |
| Formato de pesos | Core ML (`.mlmodelc`), más embeddings en Float16 (`embed_tokens.f16`, `embed_positions.f16`) y tokenizer |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Large V3 Turbo: un transformer encoder-decoder para reconocimiento automático del habla que transforma audio en log-mel y lo decodifica en texto. La conversión a Core ML separa el pipeline en cuatro piezas: `MelSpectrogram.mlmodelc` (audio a log-mel, procedente de WhisperKit), `AudioEncoder.mlmodelc` (codificador de audio con pesos de 8 bits), `decoder.mlmodelc` (decodificador de texto con estado, funciones `cross`, `main` y `step`, 448 posiciones y pesos de 8 bits) y los ficheros de embeddings `embed_tokens.f16` y `embed_positions.f16`. El tokenizer proviene de la misma revisión del modelo base.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo base. La innovación técnica destacable de esta ficha es la cuantización: pesos de 8 bits simétricos con una escala por canal de salida en codificador y decodificador, manteniendo en fp16 los elementos sensibles a la precisión (sesgos, normas, posición y atención cruzada). El autor probó también un codificador de 6 bits y lo descartó porque degradaba la mitad inglesa de una toma mixta indonesio-inglés. La conversión preserva la revisión `f16b2725` del modelo de TheStage AI.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio, con salida de transcripción de texto.
- Soporte multilingüe para 39 idiomas, incluidos español, inglés, francés, alemán, portugués, chino, japonés, árabe, hindi y vietnamita, entre otros.
- Ejecución en la Apple Neural Engine mediante Core ML, con integración en WhisperKit.
- Decodificación de texto con estado y atención cruzada, con 448 posiciones de contexto en el decodificador.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento explícito.
- No se documentan capacidades de traducción más allá de la transcripción multilingüe propia de Whisper.

## Casos de uso

- Dictado local en macOS: una aplicación como Speakey descarga el directorio y ejecuta el modelo en la Neural Engine, transcribiendo voz a texto sin enviar audio a la nube; el tamaño de 969 MB lo hace manejable para descarga y almacenamiento local.
- Transcripción de reuniones y notas de voz: el soporte de 39 idiomas y la ventana de 448 posiciones del decodificador permiten procesar intervenciones multi-turno en un dispositivo Apple, con latencia de cientos de milisegundos por toma.
- Subtitulado y accesibilidad en tiempo casi real: la latencia medida (338 ms de mediana en una toma de FLEURS indonesio en un M5 Max) es adecuada para generar subtítulos con retardo bajo en aplicaciones de escritorio.
- Procesamiento por lotes de archivos de audio en pipelines locales: al ejecutarse sobre Core ML, se puede integrar en flujos de macOS que transcriban grabaciones almacenadas sin depender de servicios externos.
- Aplicaciones de investigación en ASR multilingüe: sirve como referencia de cuantización de 8 bits sobre Whisper Large V3 Turbo, con métricas de WER publicadas en FLEURS para indonesio e inglés.
- Integración en apps de terceros vía WhisperKit: el formato Core ML y el fichero `speakey.json` (formas, funciones y tokens especiales) permiten a otros desarrolladores reutilizar el decodificador con su propio pipeline de texto.

## Benchmarks y rendimiento

Datos medidos por el autor con Speakey en un M5 Max, con clips de test de FLEURS:

| Metrica | Esta build (8 bits) | Build fp16 | Whisper Large V3 Turbo |
|---|---|---|---|
| WER indonesio (157 clips) | 3,29 % | 3,33 % | 6,88 % |
| WER inglés (150 clips) | 4,00 % | 3,91 % | no disponible |
| Latencia mediana, toma FLEURS indonesio | 338 ms | 399 ms | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de ASR.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para la Apple Neural Engine, no para GPU con memoria dedicada.
- GPU recomendadas: no aplica; requiere hardware Apple con Neural Engine (el autor midió en un M5 Max).
- Cabe en hardware de consumo Apple: el directorio ocupa 969 MB, frente a 1,76 GB de la build fp16, lo que reduce el espacio en disco y la huella de memoria.
- Opciones de despliegue: Core ML con WhisperKit; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 338 ms de mediana por toma en la prueba del autor (frente a 399 ms de la build fp16); no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER indonesio (FLEURS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta build (8 bits, Core ML) | no disponible | 448 posiciones en decodificador | 3,29 % | cc-by-4.0 | Hugging Face |
| Build fp16 del mismo modelo | no disponible | 448 posiciones en decodificador | 3,33 % | cc-by-4.0 | Hugging Face |
| Whisper Large V3 Turbo (original) | no disponible | no disponible | 6,88 % | no disponible en la información | no disponible en la información |

No se dispone de datos suficientes para comparar con otras alternativas de ASR en cuanto a parámetros, contexto o rendimiento más allá de las cifras de FLEURS proporcionadas por el autor.

## Limitaciones y advertencias

- Es un artefacto específico para Core ML y la Apple Neural Engine; no es portable a GPU NVIDIA ni a otros runtimes sin reconversión.
- La evaluación publicada se limita a dos idiomas (indonesio e inglés) y a clips de FLEURS; no hay métricas para el resto de los 39 idiomas declarados.
- El WER en inglés empeora ligeramente respecto a la build fp16 (4,00 % frente a 3,91 %), lo que indica una pérdida de precisión por la cuantización de 8 bits.
- El autor descartó un codificador de 6 bits por degradar tomas mixtas de idiomas; la cuantización más agresiva no está recomendada.
- No se documentan sesgos conocidos ni tasas de alucinación específicas para esta conversión; se heredan los del modelo base Whisper, no evaluados aquí.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el aviso `NOTICE.txt` impone condiciones adicionales de atribución para componentes de WhisperKit (MIT) y de OpenAI (MIT); conviene revisarlo antes de producción.
- El modelo se distribuye sin garantía ("No warranty") y con cero descargas y cero likes en el momento de la consulta, lo que implica poca validación comunitaria.
- No se dispone de información sobre el proceso de entrenamiento ni sobre el dataset del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/raymondchins/thewhisper-large-v3-turbo-coreml
- Modelo base: https://huggingface.co/TheStageAI/thewhisper-large-v3-turbo
- WhisperKit (Argmax): https://huggingface.co/argmaxinc/whisperkit-coreml
- Speakey: https://getspeakey.com
