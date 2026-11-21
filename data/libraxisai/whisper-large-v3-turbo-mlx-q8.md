# LibraxisAI/whisper-large-v3-turbo-mlx-q8

## Resumen

`LibraxisAI/whisper-large-v3-turbo-mlx-q8` es un checkpoint de reconocimiento automatico del habla (ASR) derivado de `openai/whisper-large-v3-turbo`, convertido y cuantizado a Q8 para su ejecucion sobre Apple Silicon mediante el framework MLX. Lo publica LibraxisAI y su proposito es ofrecer una ruta de inferencia local de Whisper optimizada para el hardware de Apple (CPU y GPU unificada via Metal), reduciendo el peso del modelo respecto al checkpoint original en precision completa.

El modelo hereda la arquitectura transformer encoder-decoder de Whisper y su capacidad multilingue (14 idiomas declarados mas el tag `multilingual`), pero el autor no declara parametros totales, longitud de contexto ni detalles de entrenamiento en la model card. El repositorio ocupa 1,8 GB y contiene dos ficheros de pesos en formato MLX, lo que sugiere una huella de memoria notablemente inferior a la del checkpoint base en fp16.

Es relevante ahora porque permite ejecutar transcripcion multilingue de calidad cercana a Whisper large-v3-turbo en portatiles y equipos de sobremesa con chip Apple (M1 en adelante) sin depender de CUDA ni de servicios en la nube. La licencia MIT declarada en el repositorio facilita su integracion en productos comerciales, aunque conviene verificar la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper); `model_type: whisper` en config, sin detalle adicional declarado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s por defecto, no declarado en la card) |
| Tipos de cuantizacion | Q8 (unico formato publicado en este repo) |
| Idiomas soportados | en, pl, de, fr, es, it, pt, nl, ru, zh, ja, ko, ar, hi, multilingual |
| Licencia | MIT (verificar licencia del modelo base `openai/whisper-large-v3-turbo`) |
| Formato de pesos | MLX / Apple Silicon checkpoint (2 ficheros, repo de 1,8 GB) |

## Arquitectura y entrenamiento

El checkpoint es una conversion del modelo `openai/whisper-large-v3-turbo`, que emplea la arquitectura transformer encoder-decoder caracteristica de la familia Whisper: el encoder procesa espectrogramas Mel de audio y el decoder genera tokens de texto de forma autorregresiva. La variante "turbo" del modelo base reduce el numero de capas del decoder respecto a `large-v3`, lo que disminuye el coste de inferencia a cambio de una perdida menor de precision. LibraxisAI no declara en la model card ni el numero de capas, ni las dimensiones ocultas, ni la composicion del dataset de entrenamiento original.

La unica transformacion documentada es la cuantizacion a Q8 y el empaquetado en formato MLX para ejecucion nativa en Apple Silicon. No se especifica si la cuantizacion se aplico solo al decoder, al encoder o a ambos, ni se publica la delta de calidad respecto al checkpoint base. Tampoco hay informacion sobre RLHF, DPO ni ajuste fino adicional por parte de LibraxisAI: la card indica explicitamente que los detalles ausentes de benchmark, dataset o entrenamiento se dejan como no disponibles en lugar de reconstruirse.

## Capacidades

- Transcripcion de voz a texto (ASR) en modo local sobre Apple Silicon.
- Soporte multilingue para 14 idiomas declarados (en, pl, de, fr, es, it, pt, nl, ru, zh, ja, ko, ar, hi) mas el tag generico `multilingual`.
- Procesamiento por lotes o interactivo de ficheros de audio, segun la ruta de inferencia probada (`LibraxisAI/mlx-batch-server`).
- Compatibilidad con `mlx_whisper` como cliente Python para invocar el checkpoint.
- No se declaran capacidades de diarizacion de hablantes, traduccion explicita, tool calling, agentes ni vision/audio mas alla del propio ASR.
- No se declaran modos especiales (thinking, streaming, timestamps) en la informacion disponible.

## Casos de uso

- Transcripcion local de reuniones en portatiles Apple: el modelo puede procesar grabaciones de audio en un MacBook con chip M-series sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de contenido audiovisual multilingue: al cubrir 14 idiomas, permite generar subtitulos en castellano, ingles, frances, aleman, etc. en un flujo de postproduccion local.
- Dictado y toma de notas para desarrolladores: integracion en editores o herramientas CLI mediante `mlx_whisper.transcribe` para convertir voz en texto en tiempo casi real.
- Procesamiento por lotes de archivos de audio en servidores Apple: la ruta probada con `mlx-batch-server` sugiere su uso en pipelines internos de transcripcion masiva.
- Investigacion en ASR multilingue: sirve como checkpoint ligero para experimentos de evaluacion comparativa frente a Whisper base en hardware Apple.
- Prototipado rapido de asistentes de voz: al ser un checkpoint pequeno (1,8 GB) y con licencia MIT, se puede embeber en aplicaciones de escritorio o demos sin infraestructura GPU dedicada.
- Transcripcion de entrevistas o podcasts en castellano: util para periodistas y creadores que trabajan en Mac y necesitan texto indexable rapidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no hay benchmarks publicos para este checkpoint y que no se hacen afirmaciones de superioridad no respaldadas por datos de evaluacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 1,8 GB en disco y la inferencia Q8 requiere memoria unificada proporcional al peso mas los buffers de audio.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), con aceleracion Metal.
- No se declara compatibilidad con GPU NVIDIA (A100, H100, RTX 4090) ni con CUDA; la ruta probada es exclusivamente MLX.
- Opciones de despliegue: `mlx_whisper` (Python) y `LibraxisAI/mlx-batch-server` como servidor por lotes probado por el autor.
- No se declaran datos de latencia ni throughput; la card indica que memoria y velocidad dependen de la generacion de Apple Silicon, el tamano de memoria unificada, la duracion del audio y la complejidad del idioma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| `LibraxisAI/whisper-large-v3-turbo-mlx-q8` | no disponible | no disponible | 14 + multilingual | MIT | MLX / Apple Silicon |
| `openai/whisper-large-v3-turbo` (base) | no disponible en la informacion | no disponible | multilingue (upstream) | ver licencia upstream | safetensors / transformers, PyTorch |
| `openai/whisper-large-v3` | no disponible en la informacion | no disponible | multilingue (upstream) | ver licencia upstream | safetensors / transformers, PyTorch |

La comparativa se limita a la relacion de linaje declarada en la card. No se dispone de datos de rendimiento ni de parametros exactos de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad para este checkpoint concreto; el autor recomienda validar las salidas con datos propios del dominio antes de usarlo en produccion.
- La cuantizacion Q8 puede introducir degradacion respecto al modelo base; la card no declara la delta de calidad.
- El modelo esta disenado y probado exclusivamente para MLX en Apple Silicon; no hay garantias de funcionamiento en otros runtimes (vLLM, llama.cpp, TGI, CUDA).
- No soporta diarizacion de hablantes, interpretacion clinica ni mejora de audio; queda fuera del alcance declarado.
- Riesgo de alucinacion inherente a los modelos ASR, especialmente en audio con ruido, acentos no cubiertos o idiomas con pocos datos.
- La licencia MIT del repositorio debe complementarse con la verificacion de la licencia del modelo base `openai/whisper-large-v3-turbo` para uso comercial.
- El rendimiento depende fuertemente de la generacion de chip Apple, la memoria unificada disponible y la duracion del audio; no se ofrecen cifras de latencia.
- La inferencia alojada en Hugging Face esta deshabilitada (`inference: false`), por lo que no se puede probar el modelo directamente desde la web del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LibraxisAI/whisper-large-v3-turbo-mlx-q8
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Servidor de inferencia probado: https://github.com/LibraxisAI/mlx-batch-server
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Cliente `mlx_whisper`: no disponible como enlace en la informacion proporcionada
