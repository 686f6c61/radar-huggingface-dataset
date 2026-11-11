# 92kdd0/whisper-judicial-ct2

## Resumen

whisper-judicial-ct2 es una conversión a formato CTranslate2 con cuantización int8 del modelo 92kdd0/audio-lp-whisper-fine-tunning, un fine-tune de openai/whisper-large-v3-turbo especializado en el dominio judicial en español. Lo publica el usuario 92kdd0 y está pensado para su uso con Faster-Whisper, la implementación de inferencia de Whisper basada en CTranslate2 que permite ejecutar el modelo en CPU con requisitos de memoria reducidos. El modelo resuelve el problema de transcribir audio jurídico en castellano (vistas, declaraciones, diligencias) con un vocabulario y unas convenciones específicas del dominio, y su conversión a int8 busca hacer viable el despliegue en infraestructura sin GPU.

El modelo parte de la arquitectura Whisper large-v3-turbo, un transformer encoder-decoder para reconocimiento automático del habla, y fue ajustado mediante LoRA (r=32, alpha=64) sobre el checkpoint base. La conversión se realizó con `ct2-transformers-converter --quantization int8`, generando un artefacto en formato CTranslate2 (`model.bin`) que Faster-Whisper carga directamente. El repositorio tiene un tamaño declarado de 0.0 GB y no registra descargas ni likes en el momento de la consulta, lo que indica que es una publicación reciente y de nicho.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de especialización de Whisper para un dominio vertical regulado; por otro, muestra el flujo habitual de conversión de un fine-tune de Hugging Face a CTranslate2 int8 para producción en CPU. No obstante, la información publicada es escasa: no hay detalles sobre el dataset de entrenamiento, el número de horas de audio, la composición del corpus ni resultados de benchmarks del modelo cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (transformer encoder-decoder para ASR), convertido a CTranslate2 |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene 809 M parametros, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | Espanol (optimizado para dominio judicial); resto de idiomas de Whisper no confirmados |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`) |

## Arquitectura y entrenamiento

El modelo base es openai/whisper-large-v3-turbo, un sistema de reconocimiento automático del habla con arquitectura transformer encoder-decoder y decodificacion autoregresiva de tokens de texto a partir de representaciones de mel-espectrograma. Sobre ese checkpoint se aplicó un fine-tune con LoRA de rango 32 y alpha 64 en dominio judicial español, según indica la model card. No se especifica el número de tokens de audio, la composición del corpus, la duración del entrenamiento ni si hubo etapas adicionales de ajuste (RLHF, DPO u otras), por lo que estos datos deben considerarse no disponibles.

La innovación técnica principal de esta publicación no está en el entrenamiento sino en el empaquetado: la conversión a CTranslate2 con cuantización int8 reduce el peso del modelo y permite inferencia en CPU con Faster-Whisper, lo que abarata el despliegue en entornos donde no hay GPU disponible. La model card advierte explícitamente de que la cuantización int8 puede causar una ligera degradación respecto al modelo original en fp16, aunque no cuantifica esa pérdida. Tampoco se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en español, con especialización en vocabulario y expresiones del ámbito judicial.
- Reconocimiento automático del habla sobre audio de hasta 30 segundos por segmento, con segmentación automática de audios más largos por parte de Faster-Whisper.
- Generación de marcas temporales por segmento (timestamps) a través de la API de Faster-Whisper.
- Detección de idioma y traducción al inglés: capacidades heredadas de Whisper, no verificadas en este fine-tune ni documentadas en la model card.
- Ejecución en CPU con cuantización int8, orientada a despliegues sin GPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción estándar de ASR.

## Casos de uso

- Transcripción de vistas judiciales: el modelo se integra en el proyecto TRANSCRIPTORJUDICIAL mediante la variable `DEFAULT_MODEL_SIZE` y el perfil `asr` de Docker Compose, transcribiendo grabaciones de audiencias con terminología jurídica específica.
- Generación de actas y diligencias: a partir de la transcripción con marcas temporales, un pipeline posterior puede segmentar intervenciones por hablante y hora para elaborar borradores de actas.
- Indexación y búsqueda de expedientes: las transcripciones sirven como base para motores de búsqueda sobre archivos judiciales, aprovechando la adaptación al vocabulario del dominio para reducir errores en términos técnicos.
- Despliegue en servidores sin GPU: al estar cuantizado en int8 y ejecutarse con Faster-Whisper en CPU (recomendado 2+ hilos), encaja en infraestructura de bajo coste o en entornos con restricciones de hardware.
- Subtitulado y accesibilidad de contenido jurídico: la salida con timestamps permite generar subtítulos para vídeos de formación, ponencias o material divulgativo del ámbito legal.
- Procesamiento por lotes de archivos de audio: Faster-Whisper permite iterar sobre colecciones de grabaciones con un consumo de memoria contenido, adecuado para digitalizar fondos documentales sonoros.
- Prototipado e investigación en ASR de dominio: sirve como punto de partida para experimentos de adaptación al dominio judicial y para comparar el efecto de la cuantización int8 frente a fp16.

## Benchmarks y rendimiento

La model card solo publica métricas del fine-tune original (no del artefacto cuantizado a int8):

| Metrica | Valor |
|---|---|
| WER | 19.74% |
| WER normalizado | 5.90% |
| CER normalizado | 2.19% |
| MER normalizado | 5.85% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros modelos ASR. La model card advierte de que la cuantización int8 puede degradar ligeramente estas métricas, sin cuantificar la diferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo cuantizado en int8 y orientado a CPU, el consumo de memoria es reducido, pero no se publica una cifra concreta.
- GPU recomendadas: no disponible. El modelo está pensado para CPU; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- CPU: se recomienda un mínimo de 2 hilos para la inferencia con Faster-Whisper.
- Opciones de despliegue: Faster-Whisper (biblioteca `faster_whisper`), con `device="cpu"` y `compute_type="int8"`; integración documentada en el proyecto TRANSCRIPTORJUDICIAL mediante Docker Compose (perfil `asr`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-judicial-ct2 | no disponible (base large-v3-turbo) | no disponible | WER norm. 5.90% en dominio judicial (modelo original) | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | no disponible en la informacion | no disponible | no disponible | MIT (según el modelo base de OpenAI; no confirmado en la informacion) | Hugging Face |
| 92kdd0/audio-lp-whisper-fine-tunning | no disponible | no disponible | WER norm. 5.90%, CER norm. 2.19% | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar con alternativas ASR de otros autores (por ejemplo, modelos de la familia Whisper sin ajuste o sistemas comerciales) en parámetros, contexto o rendimiento dentro de la información proporcionada.

## Limitaciones y advertencias

- La model card reconoce que la cuantización int8 puede degradar ligeramente la calidad respecto al modelo original en fp16, sin cuantificar la pérdida.
- No se documentan sesgos conocidos del modelo ni del corpus de fine-tune; al estar especializado en dominio judicial español, puede tener un comportamiento deficiente fuera de ese registro.
- Riesgo de alucinación: inherente a los modelos Whisper en pasajes con ruido, silencios o audio de baja calidad; no se documenta mitigación específica.
- El alcance idiomático está centrado en español; el rendimiento en otros idiomas no está verificado.
- No se especifican restricciones adicionales de licencia: el repositorio declara MIT, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base y del fine-tune de origen.
- El repositorio no registra descargas ni likes y tiene un tamaño declarado de 0.0 GB, lo que sugiere una publicación muy reciente o posiblemente incompleta; conviene verificar la integridad de los archivos antes de usarlo en producción.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar la cobertura de acentos, calidades de audio y variantes dialectales del español.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/92kdd0/whisper-judicial-ct2
- Modelo base del fine-tune: https://huggingface.co/92kdd0/audio-lp-whisper-fine-tunning
- Modelo original de OpenAI (referencia): https://huggingface.co/openai/whisper-large-v3-turbo
- Faster-Whisper (biblioteca de inferencia): no se proporciona enlace en la información disponible
- CTranslate2 (herramienta de conversión): no se proporciona enlace en la información disponible
