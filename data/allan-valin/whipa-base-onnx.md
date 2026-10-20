# allan-valin/whipa-base-onnx

## Resumen

WhIPA base ONNX es una conversión a ONNX Runtime del modelo `jshrdt/whipa-base-cv`, un Whisper base ajustado (fine-tuning) para transcripción fonética en Alfabeto Fonético Internacional (IPA). El modelo original lo firman Jacob Lee Suchardt, Hana El-Shazli y Pierluigi Cassotti en el trabajo "Towards Language-Agnostic STIPA: Universal Phonetic Transcription to Support Language Documentation at Scale" (EMNLP 2025). Esta versión la publica allan-valin y su propósito es ejecutar la transcripción fonética fuera de PyTorch, en entornos ligeros y en el navegador.

El problema que resuelve es concreto: convertir audio en una secuencia de fonemas IPA de forma agnóstica al idioma, sin depender de un léxico ni de un sistema de escritura, algo útil para documentación de lenguas minoritarias y corpus lingüísticos. Frente al modelo original, esta copia separa encoder y decoder en dos grafos ONNX, convierte los pesos a fp16 y expone explícitamente las posiciones del decoder (sin caché KV), de modo que el resultado se puede servir con `onnxruntime` o `onnxruntime-web` sin el stack de Hugging Face.

La relevancia práctica está en el tamaño: la arquitectura subyacente es Whisper base (del orden de 74 M de parámetros, aunque la model card no lo declara) y el repositorio ocupa 0,5 GB, lo que permite inferencia en CPU, GPU de consumo y navegador. El coste es una tasa de error fonético (PFER 25,6) todavía alta para producción sin revisión humana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) exportado como dos grafos ONNX independientes |
| Parametros totales | No indicado en la model card; corresponde a la familia Whisper base (del orden de 74 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s: `input_features` [1, 80, 3000] → 1500 posiciones de encoder; sin contexto textual adicional |
| Tipos de cuantizacion | Pesos fp16 con entradas/salidas en float32; existe export fp32; la cuantización dinámica int8 se probó y se descartó |
| Idiomas soportados | Transcripción fonética agnóstica al idioma; evaluado sobre 95 idiomas de VoxAngeles. La metadata de HuggingFace no declara lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.fp16.onnx`, `decoder.fp16.onnx`) más `tokens.json` y `mel.json`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La base es Whisper base: un transformer encoder-decoder con 80 bandas mel de entrada y una ventana fija de 30 segundos (3000 frames mel, 1500 posiciones tras el encoder, dimensión oculta 512). El ajuste convierte la tarea de ASR en transcripción fonética: el prompt forzado es `<|startoftranscript|><|ip|><|transcribe|><|notimestamps|>` y la salida es una secuencia de tokens BPE de nivel de byte que representan símbolos IPA. El vocabulario de salida es el completo de Whisper (51866 entradas en `logits` [1, L, 51866]), por lo que es imprescindible aplicar la lista de tokens suprimidos de `tokens.json` para restringir la decodificación a fonemas.

Sobre el entrenamiento del modelo original, la model card de esta conversión solo cita el paper (EMNLP 2025) y el repositorio de código; no detalla volumen de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí documenta el autor de la conversión es el proceso técnico: exportación del encoder y del decoder a dos grafos ONNX, decoder sin caché KV que recibe `positions` [L] de forma explícita (0…L−1) y pesos en fp16 dejando E/S en float32. Se probó cuantización dinámica int8 y se descartó porque desplazaba la salida greedy de forma apreciable y distinta en `onnxruntime-web`; fp16 solo cambió 1 de 95 clips de prueba. El script de exportación está publicado.

## Capacidades

- Transcripción de audio a fonemas IPA, agnóstica al idioma de origen y sin depender de ortografía ni léxico.
- Segmentación implícita en ventanas de 30 s con decoder autorregresivo greedy, limitado en la evaluación a 20 fonemas por segundo.
- Ejecución en dos backends ONNX: `onnxruntime` (Python/servidor) y `onnxruntime-web` (navegador), con pesos fp16 y E/S float32.
- Preprocesado mel reproducible: `mel.json` incluye los 80 filtros log-mel de Whisper.
- Control fino de la decodificación mediante `tokens.json` (ids de prompt, token de fin, tokens suprimidos y tabla de tokens BPE).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generation ni modo "thinking": es un modelo acústico-fonético de una sola tarea.
- No genera marcas de tiempo (`<|notimestamps|>` va fijado en el prompt).

## Casos de uso

- Documentación lingüística de campo: grabar hablantes de lenguas sin tradición escrita y obtener una primera transcripción IPA automática para revisión posterior del lingüista, gracias a que el modelo no requiere ortografía de referencia.
- Análisis fonético de corpus: procesar entrevistas o grabaciones etnográficas y obtener secuencias de fonemas alineadas por ventanas de 30 s, que después se corrigen manualmente o se pasan a un alineador forzado.
- Enseñanza de pronunciación: comparar la secuencia IPA producida por el alumno con la de referencia para señalar sustituciones y omisiones de fonemas, integrándolo en una app web vía `onnxruntime-web` sin enviar audio a un servidor.
- Preprocesado para síntesis de voz: convertir audio de referencia en una secuencia fonética IPA que alimente un front-end de TTS o un sistema de conversión entre lenguas a nivel de fonema.
- Búsqueda fonética en archivos de audio: indexar la salida IPA de una fonoteca y permitir consultas por pronunciación aproximada en lugar de por transcripción ortográfica.
- Herramientas de privacidad y despliegue local: al caber en CPU y ejecutarse en el navegador, permite transcripción fonética en portátiles de campo o entornos sin conectividad.
- Evaluación y control de calidad de grabaciones: usar la tasa de acierto fonético frente a una referencia como señal de calidad acústica o de presencia de ruido/solapamientos antes de pasar el audio a un pipeline mayor.

## Benchmarks y rendimiento

Evaluación publicada por el autor de la conversión sobre 760 enunciados de VoxAngeles (8 por cada uno de 95 idiomas), con puntuación estrecha ("narrow scoring") y decodificación greedy limitada a 20 fonemas por segundo:

| Modelo / configuración | PER | PFER | Notas |
|---|---|---|---|
| Export fp32 de esta conversión | 79,3 | 25,6 | Idéntico al original con la misma decodificación |
| Original `jshrdt/whipa-base-cv` con beam search y fallbacks | 86,0 | 28,5 | Configuración de decodificación distinta |
| Copia fp16 (este repo) vs fp32 | — | — | Coincide en 94 de 95 clips (uno por idioma) |

La model card no define la formulación exacta de PER/PFER ni indica la dirección de mejora, por lo que los valores deben tomarse tal cual los publica el autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, ni son aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB para los pesos fp16 (repositorio completo de 0,5 GB); el tensor de logits [1, L, 51866] en float32 añade un consumo pequeño pero no despreciable en secuencias largas.
- Cabe en cualquier GPU de consumo: RTX 3060/4060, RTX 4090 e incluso iGPU; también es viable en CPU para uso por lotes.
- GPU de datacenter (A100, H100) no son necesarias; solo tendrían sentido para paralelizar grandes volúmenes de audio con muchas instancias.
- Opciones de despliegue: `onnxruntime` en Python (servidor o script), `onnxruntime-web` en navegador, o `onnxruntime` con ejecución en CPU/GPU según proveedor. vLLM, TGI, llama.cpp y Ollama no son aplicables: no hay pesos en formato GGUF ni grafo compatible con esos motores.
- Al no usar caché KV, el decoder reprocesa todo el prefijo en cada paso: la decodificación es cuadrática en la longitud de la secuencia de fonemas. Conviene limitar la longitud máxima por clip.
- Latencia y throughput concretos: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `allan-valin/whipa-base-onnx` (este) | No declarado (~74 M por la familia Whisper base) | 30 s de audio | Fonemas IPA | Apache 2.0 | ONNX fp16 | Sin caché KV; PER 79,3 / PFER 25,6 (fp32, greedy) |
| `jshrdt/whipa-base-cv` (original) | No declarado | 30 s de audio | Fonemas IPA | Apache 2.0 | PyTorch | Referencia de precisión; requiere transformers/torch; 86,0 / 28,5 con beam search y fallbacks |
| `openai/whisper-base` | ~74 M | 30 s de audio | Texto ASR multilingüe | MIT | PyTorch, ONNX (comunidad) | No produce IPA; transcripción ortográfica |
| Modelos fonémicos tipo wav2vec2 (p. ej. variantes espeak) | No disponible | No disponible | Fonemas | No disponible | No disponible | No se dispone de datos verificables en la información consultada |

## Limitaciones y advertencias

- Precisión limitada: PFER de 25,6 sobre VoxAngeles con decodificación greedy; no es un transcriptor fonético "listo para publicar" sin revisión humana.
- La decodificación sin caché KV penaliza la latencia de forma cuadrática respecto a la longitud de la secuencia; en clips densos en fonemas el coste crece rápido.
- La cuantización int8 dinámica degrada la salida de forma perceptible y con comportamiento distinto entre `onnxruntime` y `onnxruntime-web`; el autor la descarta. No es una vía recomendada para reducir tamaño.
- La versión fp16 no es idéntica a fp32: difiere en 1 de 95 clips de la prueba. Para evaluación académica conviene usar el export fp32.
- El vocabulario de salida es el de Whisper completo (51866 clases): si no se aplican correctamente los tokens suprimidos de `tokens.json`, el modelo puede emitir tokens de texto o de control en lugar de fonemas.
- Ventana rígida de 30 s y ausencia de marcas de tiempo: la alineación temporal con el audio debe resolverse con herramientas externas.
- Idiomas: la metadata de HuggingFace no declara lista de idiomas; la cobertura real está acotada por los 95 idiomas representados en la evaluación, con 8 enunciados por idioma, lo que es una muestra pequeña por lengua.
- Sesgos: no documentados en la model card. Cabe esperar el sesgo del corpus Common Voice subyacente (desequilibrio de variedades, hablantes y condiciones de grabación).
- Riesgo de alucinación: en un modelo fonético se manifiesta como secuencias de fonemas plausibles pero no presentes en el audio, especialmente en silencios, ruido o audio fuera de dominio.
- Licencia Apache 2.0, permisiva para uso comercial; se debe mantener la atribución al modelo original y a sus autores, y verificar las condiciones del dataset de entrenamiento original, no detalladas aquí.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en producción ni de validación independiente de la conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allan-valin/whipa-base-onnx
- Modelo base original: https://huggingface.co/jshrdt/whipa-base-cv
- Repositorio del modelo original: https://github.com/jshrdt/whipa
- Proyecto que lo utiliza (`speech-to-ipa`): https://github.com/allan-valin/speech-to-ipa
- Script de exportación a ONNX: https://github.com/allan-valin/speech-to-ipa/blob/main/eval/export_whipa_onnx.py
- Paper (EMNLP 2025), "Towards Language-Agnostic STIPA: Universal Phonetic Transcription to Support Language Documentation at Scale": enlace directo no disponible en la información proporcionada
- Enlaces de la búsqueda web: no relevantes para este modelo (resultados sobre una aseguradora y una comuna francesa)
