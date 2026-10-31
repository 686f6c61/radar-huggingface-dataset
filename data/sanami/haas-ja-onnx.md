# Sanami/haas-ja-onnx

## Resumen

Haas-ja-onnx es una conversión no oficial a ONNX, con variantes cuantizadas, del modelo de reconocimiento automático de habla (ASR) Haas-ja-v1.0 de Third Intelligence. El modelo original combina un codificador FastConformer con un decodificador TDT (Token-and-Duration Transducer) que incorpora Kimi Delta Attention en la red de predicción, y está especializado en japonés. La conversión, realizada por el usuario Sanami, permite ejecutar la inferencia en CPU mediante ONNX Runtime, sin necesidad de NeMo, CUDA ni Triton, incluyendo equipos Mac y Apple Silicon.

Su relevancia radica en que resuelve un problema práctico habitual en ASR: la dependencia de stacks propietarios o de GPU para desplegar modelos de transcripción de calidad. Con variantes fp32, fp16, INT8 e INT4, el modelo alcanza valores de RTFx de hasta 31 en x86 y 34 en Apple Silicon (solo codificador), con una degradación de precisión mínima respecto a fp32. El repositorio incluye código de inferencia en Python y en Rust, lo que facilita su integración en aplicaciones de escritorio, servidores ligeros y dispositivos móviles.

La licencia es Apache-2.0, tanto en pesos como en código, lo que permite uso comercial sin restricciones más allá de la atribución indicada en el archivo NOTICE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + TDT con Kimi Delta Attention (red de predicción) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el codificador procesa el audio en modo full context; audios largos deben segmentarse) |
| Tipos de cuantización | fp32, fp16, int8dinámico con matmul (int8dyn_mm), int8dinámico (int8dyn), int8 weight-only (int8wo), int4 |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.onnx y decoder_joint.onnx con archivos .data), tokenizer SentencePiece (tokenizer.model) |

## Arquitectura y entrenamiento

El modelo base, Haas-ja-v1.0 de Third Intelligence, emplea un codificador de tipo FastConformer, una variante eficiente del architecture Conformer que reduce el coste de atención mediante subsampling y mecanismos optimizados. El decodificador es un TDT (Token-and-Duration Transducer), que predice tokens y duraciones de forma conjunta, permitiendo decodificación greedy eficiente con label-looping. La novedad destacable es el uso de Kimi Delta Attention en la red de predicción del transductor, un mecanismo de atención con actualización delta que reduce el coste computacional.

La conversión a ONNX reimplementa en `haas_ort.py` el preprocesamiento de NeMo (log-mel de 128 bandas con normalización por característica, usando ventanas y filtros mel almacenados en bf16 en el checkpoint) y la decodificación TDT greedy de NeMo (label-looping con `max_symbols=10`). No se dispone de información sobre los datos de entrenamiento del modelo original en la ficha proporcionada; la model card remite al repositorio original de Third Intelligence.

## Capacidades

- Transcripción automática de habla en japonés (ASR), con decodificación greedy TDT sin necesidad de un modelo de lenguaje externo.
- Entrada de audio en cualquier frecuencia de muestreo: el código de ayuda convierte a 16 kHz mono automáticamente.
- Procesamiento del codificador en modo full context, adecuado para segmentos de audio de longitud razonable.
- Inferencia en CPU pura (x86 y Apple Silicon) mediante ONNX Runtime, sin dependencias de CUDA, Triton o NeMo.
- Inferencia desde Rust sin Python, con implementaciones propias de log-mel, decodificación TDT y tokenizador, usando los backends ort (ONNX Runtime) o tract (Rust puro).
- Cuantización INT8/INT4 con pérdida de precisión marginal (diferencias de CER de décimas de punto).

No es un modelo de lenguaje: no genera texto libre, no razona, no soporta tool calling ni capacidades multimodales más allá de audio a texto.

## Casos de uso

- Transcripción de reuniones y notas de voz en japonés en portátiles Mac: gracias a la ejecución en CPU con Apple Silicon y a RTFx de 29-34 con int8, se puede transcribir una grabación de una hora en unos dos minutos sin GPU.
- Servidores de transcripción de bajo coste: en un Xeon de 4 núcleos, RTFx de 31 con `int8dyn_mm` permite servir múltiples peticiones concurrentes sin hardware dedicado de GPU.
- Integración en aplicaciones Rust: el CLI incluido en `rust/` permite transcribir audio sin runtime de Python, útil para binarios autocontenidos en despliegues minimalistas (contenedores, edge).
- Preprocesamiento para pipelines de NLP en japonés: la transcripción puede alimentar sistemas posteriores de resumen, indexación o análisis de sentimiento sobre contenido hablado.
- Subtitulado de contenido audio/vídeo en japonés: la decodificación TDT greedy con label-looping es rápida y determinista, adecuada para procesamiento por lotes de archivos.
- Prototipado y evaluación de ASR offline: los scripts en `scripts/` permiten regenerar el ONNX desde el checkpoint .nemo, útil para equipos que necesiten auditar o modificar el pipeline de exportación y cuantización.
- Aplicaciones móviles y de escritorio en Mac: existe una variante Core ML del mismo modelo (Sanami/haas-ja-coreml) con RTFx total de unos 89 en M1, para quien necesite el máximo rendimiento en Apple Neural Engine.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión (CER calculado con jacer v1.2.0, `cer_strict`, sobre las primeras 100 frases de cada test; RTFx medido solo sobre el codificador con ONNX Runtime en CPU, 4 hilos):

| Variante | Tamaño | CER ReazonSpeech | CER JSUT | RTFx x86 | RTFx M1 |
|---|---|---|---|---|---|
| int8dyn_mm (recomendada) | 895 MB | 9,01 | 4,37 | 31 | 29 |
| int8dyn | 667 MB | 8,86 | 4,28 | 17 | 34 |
| int8wo | 667 MB | 8,46 | 4,23 | 15 | 20 |
| int4 | 691 MB | 8,86 | 4,37 | 16 | 26 |
| fp16 | 1,3 GB | 8,46 | 4,19 | 15 | 12 |
| fp32 | 2,5 GB | 8,46 | 4,19 | 16 | 14 |

Notas: x86 corresponde a un Intel Xeon de 4 núcleos; M1 a un MacBook Air. El RTFx no incluye el tiempo del decodificador. En Rust, el backend tract es 2-3 veces más lento que ort en x86. Para comparativas con speech.cpp (Metal, RTFx 63 en M1 con Q8_0), sherpa-onnx y Core ML (RTFx total ~89 en M1), el repositorio remite a BENCHMARKS.md. No se han publicado resultados de benchmarks del modelo original frente a otros ASR (Whisper, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: al ejecutarse en CPU, el requisito es RAM, no VRAM. La variante recomendada (`int8dyn_mm`) ocupa 895 MB en disco; fp32 requiere 2,5 GB. El uso de memoria detallado está en BENCHMARKS.md (no disponible en la información proporcionada).
- GPU recomendadas: no necesarias; el modelo está pensado para CPU. Existen alternativas para aceleradores: Core ML (ANE) en iPhone/Mac y speech.cpp con Metal o Vulkan en Mac.
- Consumer hardware: funciona en MacBook Air M1 y en CPUs x86 de 4 núcleos (Xeon), por lo que cualquier portátil o sobremesa moderno es suficiente.
- Despliegue: ONNX Runtime (Python o Rust mediante ort), tract (Rust puro), Core ML (repositorio paralelo), speech.cpp (variante GGUF) y sherpa-onnx (variante ONNX de oboroge0). No aplica vLLM, TGI, llama.cpp ni Ollama al ser un modelo de ASR.
- Rendimiento: RTFx 31 (x86) y 29 (M1) con la variante recomendada, solo codificador; latencia por utterance no disponible.

## Comparativa con modelos similares

| Modelo | Formato / runtime | Plataforma objetivo | Rendimiento destacado | Licencia |
|---|---|---|---|---|
| Sanami/haas-ja-onnx (esta ficha) | ONNX, ONNX Runtime / tract | CPU x86 y Apple Silicon | RTFx 31 (x86), 29 (M1), int8dyn_mm | Apache-2.0 |
| Sanami/haas-ja-coreml | Core ML (ANE) | iPhone / Mac | RTFx total ~89 en M1 | Apache-2.0 |
| sakasegawa/Haas-ja-v1.0-GGUF | GGUF, speech.cpp (ggml) | Mac Metal, Vulkan, CPU | RTFx 63 en M1 con Q8_0, 656 MB, 0,70 GB de memoria | Apache-2.0 (modelo base) |
| oboroge0/Haas-ja-v1.0-onnx (y cuantizado) | ONNX, sherpa-onnx | CPU, apps con sherpa-onnx | no disponible; el preprocesamiento difiere ligeramente de NeMo | no disponible |

Todos derivan del mismo modelo base Haas-ja-v1.0; la elección depende del runtime de destino. Para CPU genérica con ONNX Runtime, esta conversión es la referencia recomendada por su propio autor.

## Limitaciones y advertencias

- Se trata de una conversión no oficial: no ha sido creada ni aprobada por Third Intelligence. El crédito del modelo corresponde a los autores originales.
- Es un modelo monolingüe en japonés; no transcribe otros idiomas ni mezclas de idiomas (no disponible información sobre code-switching).
- El codificador procesa el audio en modo full context: los audios largos deben segmentarse antes de la inferencia, igual que en el modelo original.
- Las diferencias de CER entre variantes cuantizadas y fp32 son pequeñas (décimas de punto), pero el propio autor indica que alrededor de 0,5 puntos puede considerarse margen de variación; para máxima precisión, usar fp32 o fp16.
- En la variante sherpa-onnx alternativa, el cálculo de características difiere de NeMo y no es totalmente fiel al original.
- No hay información en la ficha sobre sesgos del modelo, tasas de alucinación en silencios o ruido, ni evaluaciones del modelo base; remitirse a la model card original de Third Intelligence.
- La licencia Apache-2.0 permite uso comercial; se requiere cumplir la atribución indicada en el archivo NOTICE.
- Métricas de descargas muy bajas (0 descargas registradas) y proyecto reciente: conviene validar en el entorno de producción propio antes de desplegar.

## Enlaces

- Repositorio del modelo ONNX: https://huggingface.co/Sanami/haas-ja-onnx
- Modelo base (Third Intelligence): https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Variante Core ML: https://huggingface.co/Sanami/haas-ja-coreml
- Variante GGUF (speech.cpp): https://huggingface.co/sakasegawa/Haas-ja-v1.0-GGUF
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Variante sherpa-onnx: https://huggingface.co/oboroge0/Haas-ja-v1.0-onnx
- Variante sherpa-onnx cuantizada: https://huggingface.co/oboroge0/Haas-ja-v1.0-onnx-quantized
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Herramienta de evaluación jacer: https://github.com/third-intelligence/jacer
- Backend ort (Rust): https://github.com/pykeio/ort
- Backend tract (Rust): https://github.com/sonos/tract
- Documentación adicional en el repositorio: BENCHMARKS.md, TECHNICAL.md, rust/README.md y scripts/ (dentro del repo de HuggingFace)
