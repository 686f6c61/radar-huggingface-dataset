# Nocti-Dev/nb-whisper-base-mlx

## Resumen

`nb-whisper-base-mlx` es una conversión al formato MLX (Apple Silicon) del modelo de reconocimiento automático del habla `NbAiLab/nb-whisper-base`, desarrollado originalmente por el National Library of Norway (NbAiLab) y convertido por el usuario Nocti-Dev mediante la herramienta Prism. Se trata de un modelo Whisper de tamano base (72,6 millones de parametros) especializado en noruego, empaquetado de forma autocontenida con pesos, configuracion y tokenizer en un unico repositorio para permitir su carga offline.

El modelo resuelve la tarea de transcripcion de audio a texto (pipeline `automatic-speech-recognition`) en el ecosistema MLX, lo que permite ejecutarlo de forma nativa en hardware Apple Silicon con la libreria `mlx` y con `mlx-audio-swift`. Es relevante ahora porque ofrece una alternativa ligera y local para transcripcion en noruego sin depender de servicios en la nube, con un peso de repositorio de apenas 0,1 GB.

La conversion se realizo a partir del commit `2ab372b6baa181a22f54f18030cae3703402c59e` del modelo original, en `float16` y sin cuantizacion. La model card documenta una prueba de humo (smoke test) que valida que la transcripcion de la version convertida coincide con la del modelo original con una tasa de error de palabras (WER) de 0,00.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer para ASR) |
| Parametros totales | 72.593.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; no especificada en la informacion) |
| Tipos de cuantizacion | ninguna (dtype `float16`); no se documentan variantes cuantizadas |
| Idiomas soportados | no disponible explicitamente; el modelo base es de NbAiLab y la prueba de humo usa noruego |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper, un modelo encoder-decoder basado en transformer disenado para reconocimiento automatico del habla, en su variante de tamano "base" con 72,6 millones de parametros. El modelo original `NbAiLab/nb-whisper-base` es un fine-tuning de Whisper orientado al noruego; esta version es una conversion de pesos a MLX realizada con Prism (recipe `whisper-hf` v1), en `float16` y sin cuantizacion.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. La conversion se realizo con un entorno concreto documentado en la model card (prism-worker 0.1.0, Python 3.14.10, mlx 0.32.4, numpy 2.5.4, huggingface_hub 2.3.0, hf-xet 1.7.0, torch 2.14.1, transformers 5.21.0), con un lockfile de worker identificado por el sha256 `6f31327071399b5c`.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, tarea principal del pipeline.
- Especializacion en noruego: el modelo base es de NbAiLab y la prueba de humo documentada transcribe una muestra en noruego.
- Ejecucion nativa en Apple Silicon mediante MLX, con carga offline al incluir pesos, config y tokenizer en el repositorio.
- Inferencia en `float16` sin cuantizacion.
- Compatibilidad con `mlx-audio-swift` (referencia `dbe5eaa` en la prueba de humo).
- No se documentan capacidades de tool calling, agentes, vision, audio adicional ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion local de audio en noruego en equipos Apple Silicon: el modelo puede ejecutarse de forma nativa con MLX sin conexion a internet, gracias a que el repositorio es autocontenido.
- Subtitulado de contenido audiovisual noruego: al ser un modelo base ligero (72,6 M parametros) puede procesar clips cortos con baja huella de memoria en portatiles con chip Apple.
- Prototipado rapido de pipelines ASR: util para desarrolladores que quieran validar flujos de transcripcion en MLX antes de escalar a modelos mayores.
- Aplicaciones de dictado o notas de voz offline: integrable en apps macOS/iOS mediante `mlx-audio-swift`, sin enviar audio a servicios externos.
- Investigacion en ASR de bajo recursos: sirve como punto de partida para experimentos de fine-tuning o comparacion con otras variantes de Whisper en noruego.
- Evaluacion de la fidelidad de conversiones a MLX: la model card incluye un smoke test reproducible (WER 0,00 frente al original) util como referencia de validacion.

## Benchmarks y rendimiento

La model card solo documenta una prueba de humo de transcripcion, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.):

| Metrica (smoke test) | Valor |
|---|---:|
| WER convertido vs no convertido (veredicto) | 0,00 |
| WER convertido vs guion | 0,47 |
| WER no convertido vs guion | 0,47 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero `model.safetensors` ocupa 145.215.754 bytes (unos 145 MB) en `float16`; el repositorio completo es de 0,1 GB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: hardware Apple Silicon con soporte MLX (chips de la familia M). No se documentan requisitos para GPU NVIDIA.
- Cabe en GPU consumer: si, en equipos Apple Silicon; no se especifican modelos concretos de chip.
- Opciones de despliegue: libreria `mlx` y `mlx-audio-swift`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nb-whisper-base-mlx (este) | 72,6 M | no disponible | apache-2.0 | safetensors (MLX) | Conversion MLX, float16, sin cuantizar |
| NbAiLab/nb-whisper-base | no disponible en la informacion | no disponible | apache-2.0 | safetensors (transformers) | Modelo original del que deriva |
| Otras variantes Whisper base | no disponible en la informacion | no disponible | no disponible | no disponible | No se aportan datos comparativos |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en noruego; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- Al ser un modelo de tamano base (72,6 M parametros), su precision es inferior a la de variantes mayores de Whisper; el smoke test muestra un WER de 0,47 frente al guion en la muestra de prueba.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, acentos marcados o vocabulario tecnico.
- No se documentan sesgos especificos, pero al derivar de un corpus noruego puede reflejar sesgos del dataset original.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `NbAiLab/nb-whisper-base`.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-03; no hay evidencia de uso en produccion ni mantenimiento continuado.
- La conversion esta pensada exclusivamente para MLX; no es directamente utilizable en entornos CUDA o CPU sin conversion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nocti-Dev/nb-whisper-base-mlx
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-base
- Commit del modelo base: https://huggingface.co/NbAiLab/nb-whisper-base/tree/2ab372b6baa181a22f54f18030cae3703402c59e
- Referencia `mlx-audio-swift` (usada en el smoke test): `mlx-audio-swift@dbe5eaa` (no se proporciona URL)
- Herramienta Prism: no se proporciona URL en la informacion disponible.
