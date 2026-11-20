# alphappp/PromptTTSD

## Resumen

PromptTTSD es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario alphappp, consistente en un ajuste fino (post-entrenamiento) del modelo SoulX-Podcast-1.7B de Soul-AILab. Su rasgo diferencial es el control de estilo mediante descripciones en lenguaje natural: el usuario puede indicar con texto libre cómo debe interpretar cada intervención cada hablante dentro de un diálogo con múltiples voces. Está pensado tanto para generar audio de un único hablante como diálogos completos con varios participantes.

El modelo se distribuye en formato ONNX y safetensors, con 2.062.685.184 parámetros totales y un repositorio de 9,9 GB. La arquitectura combina un modelo de lenguaje basado en Qwen3 con un modelo de flujo (flow model) y un vocoder HiFT, e incorpora componentes de CosyVoice. Genera audio a 24 kHz en mono, con salida PCM16, y admite tanto la síntesis completa de la forma de onda como la transmisión por fragmentos (streaming).

Su relevancia actual radica en que aborda un problema práctico de los sistemas TTS multi-hablante: el control fino del estilo por turno sin necesidad de reentrenar ni de etiquetas acústicas explícitas, usando únicamente instrucciones descriptivas. El proyecto se acompaña de un dataset propio (PromptDialog-v2), un repositorio de código y una demo pública, lo que facilita su evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje basado en Qwen3 + modelo de flujo + vocoder HiFT (componentes de CosyVoice) |
| Parametros totales | 2.062.685.184 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y ONNX (incluye `flow.pt`, `hift.pt`, `campplus.onnx`) |

## Arquitectura y entrenamiento

PromptTTSD se construye mediante post-entrenamiento del modelo SoulX-Podcast-1.7B sobre el dataset PromptDialog. La pila de inferencia combina un modelo de lenguaje de la familia Qwen3, un modelo de flujo para la generación acústica y un vocoder HiFT para la síntesis final de la forma de onda, e integra componentes procedentes de CosyVoice. El resultado es un sistema TTS que acepta referencias de audio con su transcripción (prompt_audio y prompt_text) y texto objetivo, y produce audio a 24 kHz.

El entrenamiento se realizó sobre PromptDialog, un dataset orientado a diálogos multi-hablante con descripciones de estilo en lenguaje natural. El modelo soporta hasta ocho hablantes de referencia en una misma entrada y permite asociar a cada turno una instrucción de contexto que se envuelve con los tokens especiales `<|start_prompt|>…<|end_prompt|>` antes de entrar en el modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz de un único hablante a partir de audio de referencia y su transcripción.
- Generación de diálogos multi-hablante con hasta ocho hablantes de referencia.
- Control de estilo por turno mediante descripciones abiertas en lenguaje natural.
- Soporte de dos formatos de entrada para diálogo: listas de `target_text` con índice de hablante, o `dialogue_text` con etiquetas `[S1]`, `[S2]`, etc.
- Generación completa de la forma de onda o streaming por fragmentos, con metadatos por chunk (`turn_index`, `finalize`).
- Salida de audio a 24 kHz en mono, PCM16, con 200 ms de silencio entre turnos.
- Interfaz de línea de comandos basada en JSONL y API de Python (`PromptTTSD.from_pretrained`, `model.infer`).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de las referencias de voz.

## Casos de uso

- Producción de audiolibros y ficción sonora: el modelo permite asignar una voz de referencia distinta a cada personaje y describir con lenguaje natural el tono de cada intervención, generando el diálogo completo en una sola pasada.
- Doblaje y localización de contenido: con hasta ocho hablantes de referencia se pueden replicar conversaciones de guion manteniendo identidades vocales diferenciadas y ajustando el estilo por turno.
- Generación de podcasts sintéticos: la entrada `dialogue_text` con etiquetas `[S1]`/`[S2]` simplifica la creación de conversaciones entre presentadores con estilos distintos.
- Asistentes de voz con control expresivo: la API de Python permite integrar la síntesis en un servicio que reciba una descripción de estilo por respuesta y devuelva audio en streaming para reducir la latencia percibida.
- Prototipado de interfaces conversacionales: el modo streaming con chunks y `turn_index` facilita la reproducción incremental en aplicaciones web o móviles mientras se genera el audio.
- Evaluación de sistemas TTS multi-hablante: al publicarse junto al dataset PromptDialog-v2, sirve como referencia reproducible para comparar calidad y control de estilo en diálogos.
- Generación por lotes de material de formación: la CLI procesa ficheros JSONL secuencialmente y escribe un WAV por registro, lo que encaja en pipelines de producción de contenido educativo con varios locutores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 9,9 GB e incluye pesos en safetensors y ONNX, además de `flow.pt`, `hift.pt` y `campplus.onnx`.
- GPU recomendadas: se requiere una GPU compatible con CUDA y un controlador NVIDIA compatible con PyTorch; no se especifican modelos concretos.
- Cabe en GPU de consumo: no disponible; no se indica el mínimo de VRAM necesario.
- Opciones de despliegue: inferencia mediante el repositorio oficial con `uv` o `pip install -e .`, usando Hugging Face Transformers y PyTorch; se selecciona la GPU con `CUDA_VISIBLE_DEVICES`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modo streaming descarga fragmentos a medida que se generan, pero no se publican cifras de rendimiento.
- Requisitos de entorno: Git, `uv`, Python 3.11 o superior y GPU con CUDA. En la primera ejecución, s3tokenizer descarga y cachea `speech_tokenizer_v2_25hz`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PromptTTSD | 2.062.685.184 | no disponible | no disponible | safetensors, ONNX | Ajuste fino de SoulX-Podcast-1.7B con control de estilo por prompt |
| SoulX-Podcast-1.7B | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que se post-entrena PromptTTSD |
| CosyVoice (componentes) | no disponible | no disponible | no disponible | no disponible | PromptTTSD incorpora componentes de CosyVoice; no se detalla la versión |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible, lo que impide determinar las condiciones de uso comercial; es imprescindible verificarla antes de desplegar en producción.
- No se especifican los idiomas soportados; los ejemplos de la model card están en chino, pero no se confirma el alcance multilingüe.
- No se documentan sesgos conocidos ni tasas de alucinación; en TTS, los riesgos típicos incluyen pronunciación incorrecta de números y expresiones, por lo que se recomienda escribir los textos tal como deben ser leídos.
- La transcripción de referencia debe coincidir con el audio de referencia; discrepancias degradan la calidad de la clonación.
- Las instrucciones de contexto por turno no modifican la cantidad de historial de diálogo que el modelo retiene; no debe asumirse memoria conversacional más allá de lo indicado.
- Las llamadas sobre una misma instancia del modelo deben ser secuenciales y cada llamada inicia un contexto de diálogo nuevo.
- El modelo requiere GPU CUDA; no se documenta soporte para inferencia en CPU.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks que respalden su calidad frente a alternativas.
- Los pesos están sujetos a las licencias de sus respectivos componentes (SoulX-Podcast y CosyVoice), que deben revisarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphappp/PromptTTSD
- Modelo base: https://huggingface.co/Soul-AILab/SoulX-Podcast-1.7B
- Repositorio de código: https://github.com/bigai-ai/PromptTTSD
- Demo: https://huggingface.co/spaces/alphappp/PromptDialog-demo
- Dataset PromptDialog-v2: https://huggingface.co/datasets/alphappp/PromptDialog-v2
