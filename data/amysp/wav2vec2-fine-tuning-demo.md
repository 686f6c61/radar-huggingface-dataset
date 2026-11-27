# amysp/wav2vec2-fine-tuning-demo

## Resumen

`amysp/wav2vec2-fine-tuning-demo` es un modelo de reconocimiento automatico del habla (ASR) obtenido mediante fine-tuning de `facebook/wav2vec2-base`, el checkpoint base de wav2vec 2.0 publicado por Meta AI. El autor del ajuste es el usuario de Hugging Face `amysp`, y el propio nombre del repositorio indica que se trata de una demostracion tecnica de fine-tuning mas que de un modelo destinado a produccion. Con 94.396.320 parametros, hereda la arquitectura convolucional + transformer de wav2vec 2.0, que procesa audio en bruto (forma de onda) sin necesidad de extractores de caracteristicas acusticas externos.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad con la libreria `transformers` (pipeline `automatic-speech-recognition`). El repositorio ocupa 0,4 GB y fue creado el 27 de noviembre de 2026. La model card es la generada automaticamente por el `Trainer` de Hugging Face y no ha sido completada: no se especifica el dataset de entrenamiento, los idiomas soportados ni los usos previstos.

Su relevancia es, por tanto, limitada y de caracter didactico: sirve como ejemplo reproducible de un pipeline de fine-tuning ASR con `transformers`, pero los resultados declarados (WER de 1.0 en validacion) indican que el ajuste no ha convergido a un modelo utilizable. Cualquier evaluacion seria de ASR deberia partir de `facebook/wav2vec2-base` o de checkpoints derivados con resultados verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (extractor convolucional de features + transformer encoder) |
| Parametros totales | 94.396.320 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; wav2vec 2.0 base procesa ventanas de audio de aproximadamente 10 s en configuracion estandar, aunque el dato no se declara en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se declaran variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-base`, un modelo wav2vec 2.0 con aproximadamente 95 M de parametros. wav2vec 2.0 combina un extractor convolucional que convierte la forma de onda de audio en una secuencia de representaciones latentes con un transformer encoder que modela el contexto. El preentrenamiento original de Meta emplea aprendizaje autosupervisado con enmascaramiento en el espacio latente y cuantizacion discreta de las representaciones (product quantization), seguido de fine-tuning supervisado con CTC para transcripcion.

En este repositorio, el ajuste se realizo con el `Trainer` de `transformers` sobre un dataset no identificado ("unknown dataset" segun la model card). Los hiperparametros declarados son: learning rate 1e-4, batch de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 1000 pasos de warmup, 30 epochs y precision mixta nativa (AMP). El entrenamiento consta de solo 90 pasos totales, lo que sugiere un dataset muy pequeno. No se documenta el numero de tokens de audio, la composicion del corpus, ni si hubo decodificacion con modelo de lenguaje externo.

## Capacidades

- Reconocimiento automatico del habla (transcripcion audio a texto) mediante CTC, heredado del pipeline ASR de wav2vec 2.0.
- Procesamiento de audio en bruto: no requiere features acusticas precalculadas (MFCC, mel-spectrogramas), aunque el pipeline de `transformers` acepta arrays de audio a 16 kHz.
- Compatibilidad con `transformers` (`AutoModelForCTC`, `Wav2Vec2Processor`) y con `endpoints_compatible` para despliegue en Inference Endpoints.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo.
- Capacidades multilingues: no documentadas; el modelo base de Meta esta entrenado principalmente en ingles, pero el ajuste no especifica idioma.
- No dispone de modo "thinking", decodificacion especulativa ni atencion lineal.

## Casos de uso

- Demostracion didactica de fine-tuning ASR: el repositorio sirve como plantilla para mostrar el flujo completo de `Trainer` con `Wav2Vec2ForCTC`, hiperparametros y logging de WER, util en talleres y tutoriales de `transformers`.
- Prueba de integracion del pipeline `automatic-speech-recognition`: permite validar el cableado de `Wav2Vec2Processor` + `AutoModelForCTC` en un entorno de desarrollo antes de sustituir el checkpoint por uno entrenado de verdad.
- Verificacion de compatibilidad con Inference Endpoints: la etiqueta `endpoints_compatible` permite desplegar el modelo como endpoint de prueba para comprobar latencias y formatos de entrada/salida de la plataforma.
- Base para experimentos de comparacion de hiperparametros: al ser un ajuste corto (90 pasos), es util para probar variaciones de learning rate, warmup o precision mixta en un ciclo rapido.
- Pruebas de regresion de pipelines de audio: sirve como caso de entrada conocido (con WER 1.0) para comprobar que un sistema de evaluacion detecta correctamente modelos no funcionales.
- No se recomienda su uso en transcripcion real, subtitulado, atencion al cliente por voz ni ninguna aplicacion de produccion, dado el WER declarado de 1.0.

## Benchmarks y rendimiento

La model card declara los siguientes resultados de entrenamiento (no son benchmarks estandar de ASR, sino metricas del propio `Trainer`):

| Metrica | Valor |
|---|---|
| Training loss | no registrado (No log) |
| Validation loss | 5,7431 |
| WER (validacion) | 1,0 |
| Epoch | 30,0 |
| Step | 90 |

El model-index del autor no incluye ningun resultado (`results: []`). Un WER de 1,0 equivale a una tasa de error del 100 %, es decir, el modelo no produce transcripciones correctas en el conjunto de validacion. No se han publicado resultados en MMLU, HumanEval, GSM8K ni en benchmarks ASR estandar como LibriSpeech, Common Voice o Fleurs.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,4 GB para los pesos (94 M de parametros); en fp16, unos 0,2 GB. El cuello de botella real es el buffer de audio de entrada, no los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090). Tambien funciona en CPU para audios cortos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` (pipeline ASR), `torchaudio`, `speechbrain` (con adaptaciones), Hugging Face Inference Endpoints. No se declaran pesos GGUF, por lo que `llama.cpp` y `Ollama` no son aplicables directamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana de audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `amysp/wav2vec2-fine-tuning-demo` | 94,4 M | no disponible | Apache 2.0 | Hugging Face | WER 1.0 en validacion; demo |
| `facebook/wav2vec2-base` | ~95 M | ventanas de ~10 s (config. estandar) | Apache 2.0 | Hugging Face | Modelo base preentrenado; requiere fine-tuning ASR |
| `facebook/wav2vec2-base-960h` | ~95 M | ventanas de ~10 s | Apache 2.0 | Hugging Face | Fine-tuning ASR en LibriSpeech 960h, en ingles |
| `openai/whisper-small` | ~244 M | 30 s por ventana | MIT | Hugging Face | ASR multilingue con decoder seq2seq |

La comparativa muestra que el checkpoint de `amysp` no aporta ventajas frente al modelo base ni frente a variantes con fine-tuning documentado. Para ASR en ingles, `facebook/wav2vec2-base-960h` es la referencia natural; para multilingue, `openai/whisper-small` ofrece cobertura de idiomas declarada y resultados publicados.

## Limitaciones y advertencias

- WER de 1,0 en validacion: el modelo no transcribe correctamente; no debe usarse en produccion.
- Dataset de entrenamiento desconocido: no se puede evaluar el sesgo demografico, acustico ni linguistico del ajuste.
- Idiomas no declarados: se desconoce si el ajuste conserva la cobertura del modelo base o la ha degradado.
- Model card incompleta: sin descripcion de usos previstos, limitaciones ni datos de evaluacion externos.
- Solo 90 pasos de entrenamiento: probable infraentrenamiento o dataset trivial; la validation loss de 5,74 es alta.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo hace inviable ese uso en la practica.
- Riesgo de alucinacion en ASR: como todo modelo CTC sin modelo de lenguaje externo, puede producir transcripciones gramaticalmente plausibles pero incorrectas; en este caso, directamente incorrectas.
- Sin soporte declarado de cuantizacion ni formatos alternativos: el despliegue queda limitado a `transformers`/PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amysp/wav2vec2-fine-tuning-demo
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Variante con fine-tuning ASR en LibriSpeech: https://huggingface.co/facebook/wav2vec2-base-960h
- Paper de wav2vec 2.0 (Baevski et al., 2020): https://arxiv.org/abs/2006.11477
- Documentacion de `Wav2Vec2` en `transformers`: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Documentacion del pipeline ASR: https://huggingface.co/docs/transformers/tasks/asr
