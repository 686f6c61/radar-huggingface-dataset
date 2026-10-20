# DontHash/neptrans-v4-lora

## Resumen

NepTrans v4 es un adaptador LoRA para el modelo de reconocimiento automático del habla `openai/whisper-large-v3`, desarrollado por el usuario DontHash y publicado en HuggingFace. Su objetivo es la transcripción de voz en nepalí y en conversaciones que alternan nepalí e inglés (code-switching), un escenario que el Whisper original cubre de forma deficiente porque el nepalí es un idioma de bajos recursos en la distribución de entrenamiento de OpenAI. El adaptador se publica como pesos PEFT en safetensors de aproximadamente 115,5 MB, con rango 16, alpha 32 y dropout 0,05, aplicado sobre los módulos de atención (`q_proj`, `k_proj`, `v_proj`, `out_proj`) y las capas feed-forward (`fc1`, `fc2`) del modelo base.

No es un modelo autónomo: para inferir hay que cargar también el checkpoint `openai/whisper-large-v3` (unos 1.550 millones de parámetros, revisión fijada `06f233fe06e710322aca913c1bc4249a0d71fce1`) y su procesador. El autor distribuye además una release fusionada en CTranslate2 (`DontHash/neptrans-v4-ct2`) pensada para transcripción autoalojada sin gestionar PEFT.

La relevancia del proyecto está en el nicho: aporta un adaptador ligero, con licencia Apache 2.0, reproducible (revisión del modelo base y etiqueta `v4.0.0` fijadas) y entrenado sobre 49,094 horas de audio nepalí, incluyendo 6.613 clips con mezcla de idiomas. La contrapartida es que no se han publicado métricas de error (WER) ni comparativas cuantitativas con otras alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 (transformer encoder-decoder con atención) más adaptadores LoRA de PEFT |
| Parametros totales | ~1.550 millones en el modelo base; el adaptador LoRA pesa ~115,5 MB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 s por clip (entrada de 128 bins mel a 16 kHz); decodificación limitada a 448 tokens (`max_length=448` en el ejemplo del autor) |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors sin cuantizar; la release CTranslate2 permite cuantización, pero no se detallan los tipos disponibles |
| Idiomas soportados | nepalí (`ne`) e inglés (`en`), incluido code-switching nepalí-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); existe una release alternativa en formato CTranslate2 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin modificaciones estructurales: un encoder que procesa espectrogramas log-mel de 128 bins sobre ventanas de 16 kHz y un decoder autorregresivo que genera tokens de texto con identificadores de idioma y de tarea. Sobre ese esqueleto se aplica un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 en las proyecciones de atención y en las dos capas densas del bloque feed-forward. El adaptador no incluye estado de entrenamiento serializado con pickle y su configuración fija la revisión exacta del modelo base, de modo que la reproducibilidad depende de usar ese checkpoint y no otro Whisper nepalí.

El manifiesto de entrenamiento de la v4 contiene 21.470 clips y 49,094 horas, repartidas en 8.075 clips (~34,09 h) de habla conversacional nepalí y nepalí-inglés resegmentada y 13.395 clips (~15,00 h) de habla leída de OpenSLR-54 curada. Por idioma, 14.473 clips son solo nepalí, 6.613 son mixtos y 384 son solo inglés. La partición de desarrollo es de 652 clips (2,626 h) y la de test interno formal de 625 clips (2,587 h). La receta indica tres épocas, tasa de aprendizaje 5e-5, tamaño de lote 1 con acumulación de gradiente 16, precisión mixta BF16, planificador lineal con 50 pasos de calentamiento y optimizador AdamW; el texto disponible se interrumpe antes de detallar la semilla y posibles etapas posteriores de ajuste (RLHF/DPO no documentadas).

## Capacidades

- Transcripción automática de voz en nepalí con salida en texto latino o devanagari según el tokenizador de Whisper.
- Reconocimiento de habla con alternancia de idiomas dentro de la misma frase (nepalí-inglés), el caso de uso central de la v4.
- Transcripción de inglés, aunque con un soporte mucho más limitado en datos (384 clips de entrenamiento solo en inglés).
- Detección y selección de idioma mediante los tokens de control del decoder; el ejemplo del autor usa `language=None` y `task="transcribe"`.
- Procesamiento de audio de hasta 30 segundos por invocación, con soporte de entrada mono o estéreo (promediado de canales en el ejemplo) y remuestreo obligatorio a 16 kHz.
- Ajuste adicional: al ser un adaptador PEFT, puede combinarse con nuevos adaptadores o continuar el entrenamiento sobre dominios concretos sin duplicar los 1.550 millones de parámetros.
- Uso totalmente local: no hay llamadas a servicios externos ni telemetría documentada.
- Generación de marcas de tiempo: el modelo base las soporta, pero el ejemplo del autor las desactiva (`return_timestamps=False`) y no se documenta la calidad de los timestamps tras el ajuste.

## Casos de uso

- Transcripción de entrevistas y notas de voz bilingües: el adaptador está entrenado específicamente sobre conversación nepalí con inserción de términos en inglés, el patrón habitual en entrevistas técnicas o de negocio en Nepal, y permite obtener un borrador revisable en lugar de transcribir a mano.
- Subtitulado de vídeo con revisión humana: el autor plantea explícitamente el caso de subtítulos que una persona revisa antes de publicar; el modelo genera el texto base sobre clips de hasta 30 s que luego se segmentan y sincronizan en el editor.
- Atención al cliente y centros de llamadas: grabaciones de soporte donde el agente alterna nepalí e inglés pueden transcribirse localmente, lo que evita enviar audio de clientes a una API de terceros y simplifica el cumplimiento de protección de datos.
- Documentación clínica o legal dictada: al ejecutarse en infraestructura propia, el audio no sale del perímetro del hospital o del despacho; el texto resultante se usa como borrador que el profesional valida, nunca como registro definitivo.
- Investigación lingüística sobre code-switching: el modelo es útil para generar transcripciones a escala de corpus nepalí-inglés y estudiar patrones de alternancia de código, con la advertencia de que hay que medir el WER en el corpus propio antes de sacar conclusiones.
- Investigación de mercado y análisis de opinión: transcripción de encuestas abiertas, focus groups o llamadas de campo en nepalí para su posterior etiquetado y análisis temático.
- Preprocesado de datos para entrenar otros modelos: el adaptador puede servir para pseudoetiquetar audio nepalí no transcrito y construir corpus más grandes, usando la release CTranslate2 para el throughput.
- Despliegue en entornos con conectividad limitada: una vez descargados el modelo base y el adaptador, la inferencia funciona sin conexión, lo que encaja en proyectos de ONG o trabajo de campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe las particiones de evaluación, pero no incluye cifras de WER ni comparaciones con otros sistemas.

| Conjunto de evaluacion | Clips | Duracion | WER publicado |
|---|---:|---:|---|
| Desarrollo interno | 652 | 2,626 h | no disponible |
| Test interno formal | 625 | 2,587 h | no disponible |
| OpenSLR-54 (test estandar de nepalí) | no disponible | no disponible | no disponible |
| FLEURS nepalí | no disponible | no disponible | no disponible |

## Requisitos de hardware

- El adaptador solo no es suficiente: hay que cargar el modelo base de ~1.550 millones de parámetros. En FP16 los pesos ocupan aproximadamente 3,1 GB y en FP32 unos 6,2 GB, a lo que se suman activaciones y el procesador de audio.
- GPU recomendadas para FP16: cualquier tarjeta con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100). Con 8 GB el margen es ajustado si se procesan lotes grandes.
- Cabe en GPU de consumo: sí, en FP16 sobre RTX 3060 12 GB o superiores; en FP32 conviene subir a 12-16 GB.
- CPU: es posible la inferencia en CPU en FP32, pero el autor no publica latencias y en la práctica resulta entre uno y dos órdenes de magnitud más lenta que en GPU.
- Opciones de despliegue: Transformers 4.57.6 + PEFT 0.21.0 + accelerate (ruta documentada por el autor), o la release CTranslate2 `DontHash/neptrans-v4-ct2`, que fusiona adaptador y pesos base y está pensada para servir transcripciones de forma más directa. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponibles. El ejemplo usa `num_beams=1` (decodificación voraz), lo que reduce el coste frente a búsqueda por haces, pero no se aportan medidas.
- Para audio de más de 30 segundos hay que trocear la señal y concatenar resultados; el modelo no acepta clips más largos en una sola pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DontHash/neptrans-v4-lora | ~1,55B (base) + 115,5 MB de adaptador | 30 s | nepalí, inglés, code-switching | Apache 2.0 | HuggingFace (adaptador PEFT) |
| DontHash/neptrans-v4-ct2 | ~1,55B fusionados | 30 s | nepalí, inglés, code-switching | Apache 2.0 | HuggingFace (CTranslate2) |
| openai/whisper-large-v3 | ~1,55B | 30 s | ~99 idiomas, nepalí incluido sin ajuste específico | Apache 2.0 | HuggingFace |
| openai/whisper-medium | ~769M | 30 s | multilingüe, nepalí incluido sin ajuste específico | Apache 2.0 | HuggingFace |

No se dispone de comparativas cuantitativas de WER frente a otros ajustes de Whisper para nepalí (por ejemplo, modelos de AI4Bharat o NeMo), por lo que la comparación se limita a parámetros, idiomas y licencia.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el checkpoint `openai/whisper-large-v3` en la revisión `06f233fe06e710322aca913c1bc4249a0d71fce1` el adaptador no funciona. Sustituirlo por otro Whisper nepalí rompe la reproducibilidad.
- No hay métricas publicadas de WER ni comparativas: cualquier decisión de producción exige evaluar el modelo sobre un corpus propio antes de desplegarlo.
- El volumen de datos es modesto (49,094 horas), con solo 15 horas de habla leída de OpenSLR-54 y 384 clips íntegramente en inglés; el rendimiento en inglés o en acentos nepalíes poco representados puede degradarse.
- Riesgo de alucinación inherente a Whisper: en silencios, ruido o audio musical el decoder puede generar texto plausible que no corresponde a la señal. Es obligatorio filtrar por confianza y por duración.
- Límite duro de 30 segundos por clip y ausencia de diarización de hablantes; para reuniones largas hace falta segmentación y, si se necesitan hablantes, un componente externo.
- El ejemplo oficial desactiva las marcas de tiempo (`return_timestamps=False`); no se documenta si el adaptador conserva la precisión temporal del modelo base, algo crítico para subtitulado.
- El adaptador se distribuye sin estado de entrenamiento serializado con pickle, lo que es positivo para seguridad, pero implica que no se puede reanudar el entrenamiento tal cual.
- Licencia Apache 2.0 en el adaptador, permisiva para uso comercial; conviene verificar igualmente la licencia del modelo base y de los corpus de entrenamiento (OpenSLR-54 tiene sus propias condiciones).
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validación independiente por parte de la comunidad.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/DontHash/neptrans-v4-lora
- Release fusionada en CTranslate2: https://huggingface.co/DontHash/neptrans-v4-ct2
- Código fuente y guía de autoalojamiento: https://github.com/DontHash/neptrans-asr
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Perfil del autor: https://huggingface.co/DontHash
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
