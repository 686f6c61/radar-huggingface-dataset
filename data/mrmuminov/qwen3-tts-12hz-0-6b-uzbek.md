# mrmuminov/Qwen3-TTS-12Hz-0.6B-Uzbek

## Resumen

Qwen3-TTS-12Hz-0.6B-Uzbek es un ajuste fino completo (full fine-tune) del modelo de texto a voz Qwen/Qwen3-TTS-12Hz-0.6B-Base, publicado por el usuario mrmuminov, orientado a la síntesis de voz en uzbeko manteniendo capacidades en inglés. El modelo parte del backbone Qwen3-TTS de la familia Qwen y conserva la interfaz de clonación de voz mediante embedding de hablante del tipo x-vector, de modo que puede imitar un timbre a partir de un clip de referencia corto.

El interés práctico está en que el uzbeko es un idioma con muy poca cobertura en sistemas TTS de calidad: este checkpoint se entrena sobre unas 32,6 horas de audio de 20 hablantes (12 hombres, 8 mujeres) procedentes del dataset mrmuminov/uzbek_voice, limpiado con el modelo Sidon a 48 kHz. Frente a un TTS multilingüe genérico, ofrece una adaptación específica al idioma y un tamaño reducido que permite inferencia en GPU de consumo.

El checkpoint publicado corresponde a la época 2 de 6 del entrenamiento, seleccionada por menor pérdida de validación (3,2399). El nombre comercial indica "0.6B", pero el recuento real de parámetros en safetensors es de 914.643.008 (unos 914,6 millones), dato a tener en cuenta para el dimensionado de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (modelo texto a voz sobre backbone transformer de la familia Qwen3) con tokenizador de audio a 12 Hz; número de capas, cabezas y mecanismo de atención no disponibles |
| Parametros totales | 914.643.008 (unos 914,6 M; el nombre del modelo indica 0.6B) |
| Parametros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica el límite de texto de entrada ni la duración máxima del audio de referencia) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors y el ejemplo de uso carga en float32. No hay variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | uzbeko (uz) e inglés (en); el uzbeko es el idioma de ajuste fino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 2,5 GB) |

## Arquitectura y entrenamiento

Se trata de un ajuste fino completo del checkpoint base Qwen3-TTS-12Hz-0.6B-Base, no de un adaptador LoRA. La arquitectura subyacente es la de Qwen3-TTS: un modelo de texto a voz que genera tokens de audio discretos a una tasa de 12 Hz (de ahí el "12Hz" del nombre) y los decodifica a forma de onda. La model card no detalla la profundidad de la red, el tipo de atención ni el vocabulario del tokenizador de audio, por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó sobre el dataset mrmuminov/uzbek_voice: 20 hablantes (12 masculinos, 8 femeninos) y aproximadamente 32,6 horas de audio, previamente limpiado con Sidon (modelo de limpieza y mejora de voz) a 48 kHz. Se ejecutaron 6 épocas con learning rate 3e-6, batch efectivo de 32 y autocast en fp16 con pesos maestros en fp32. El checkpoint liberado es el de la época 2, seleccionado por mínima pérdida de validación (3,2399). La clonación se implementa con embeddings de hablante x-vector extraídos de un clip de referencia corto, sin necesidad de transcripción del audio de referencia (modo `x_vector_only_mode`). El modelo se entrenó con el layout de texto no streaming, por lo que la model card recomienda explícitamente `non_streaming_mode=True` en inferencia.

## Capacidades

- Síntesis de voz en uzbeko a partir de texto, con prosodia adaptada al idioma mediante ajuste fino supervisado.
- Clonación de voz zero-shot a partir de un clip de referencia corto, usando embedding de hablante x-vector.
- Síntesis en inglés, conservada del modelo base, invocable con `language="English"`.
- Detección automática de idioma mediante `language="Auto"`.
- Salida de audio devuelta como array de waveform más la tasa de muestreo correspondiente (`generate_voice_clone` devuelve `wavs` y `sample_rate`).
- Integración con la librería `transformers` y con el paquete `qwen_tts`.
- Compatibilidad declarada con endpoints gestionados (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- Audiolibros y narración en uzbeko: el modelo permite generar horas de voz sintética de forma desatendida a partir de texto, eligiendo un hablante de referencia del conjunto de 20 voces y manteniendo el timbre entre fragmentos.
- Accesibilidad y lectores de pantalla: conversión de artículos, documentos o interfaces a voz en uzbeko para usuarios con discapacidad visual, con despliegue en una GPU de consumo por el tamaño contenido del modelo.
- Sistemas de atención telefónica (IVR) en uzbeko: generación de locuciones dinámicas sin grabaciones de estudio, útil para menús, avisos y confirmaciones que cambian con frecuencia.
- Doblaje y localización de vídeo: clonación de la voz del hablante original a partir de un clip corto para producir pistas dobladas al uzbeko manteniendo el timbre, con revisión humana posterior.
- E-learning y formación corporativa: narración automática de cursos y materiales en uzbeko, con la posibilidad de asignar una voz distinta por módulo o instructor.
- Prototipado de asistentes bilingües uz/en: un mismo checkpoint atiende ambos idiomas, lo que simplifica el pipeline en productos con usuarios que alternan lenguas.
- Preservación lingüística y documentación: generación de muestras de voz en uzbeko para corpus, diccionarios hablados y materiales didácticos donde no existen grabaciones suficientes.
- Pruebas de calidad de pipelines TTS: por su licencia Apache 2.0 y su tamaño, sirve como componente de referencia en evaluaciones internas de inteligibilidad y naturalidad antes de contratar servicios comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de validación del checkpoint liberado (3,2399 en la época 2 de 6); no hay métricas de inteligibilidad (WER/CER), similitud de hablante (SECS), MOS ni comparaciones con otros sistemas TTS en uzbeko.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 914,6 M de parámetros, sin incluir el decodificador de audio ni activaciones): unos 3,7 GB en fp32, unos 1,9 GB en fp16/bf16 y alrededor de 0,9-1 GB en int8. Con el decodificador y las activaciones, un presupuesto realista es de 5-8 GB en fp32 y 4-6 GB en fp16.
- GPU recomendadas: cualquier GPU con 8 GB o más para fp32; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para fp16. Para servir varias peticiones en paralelo, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más, siempre que se use fp16 o se reduzca el batch.
- Opciones de despliegue: `transformers` junto con el paquete `qwen_tts` (ruta documentada por el autor), y endpoints compatibles (tag `endpoints_compatible`). No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Al operar en modo no streaming (`non_streaming_mode=True`), la generación no devuelve audio parcial, por lo que la latencia percibida equivale a la duración total del audio solicitado más el coste de cómputo. No se publican cifras de RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mrmuminov/Qwen3-TTS-12Hz-0.6B-Uzbek | 914,6 M | no disponible | uz, en | Apache 2.0 | Ajuste fino con clonación de voz; checkpoint de época 2; sin benchmarks publicados |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0.6B según nomenclatura (recuento exacto no disponible) | no disponible | no disponible | Apache 2.0 (según modelo derivado) | Modelo base sin ajuste específico a uzbeko; misma arquitectura y tokenizador a 12 Hz |
| Otros TTS multilingües de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer comparación cuantitativa |

## Limitaciones y advertencias

- El checkpoint publicado es la época 2 de 6, no el modelo final; es probable que un entrenamiento completo mejore la calidad, pero no se ofrece esa variante.
- No hay ninguna métrica objetiva de calidad (WER, MOS, similitud de hablante), lo que impide validar la inteligibilidad antes de desplegar.
- Los datos de entrenamiento cubren solo 20 hablantes, por lo que la diversidad de timbres, edades y acentos es reducida y la clonación puede sesgarse hacia esas voces.
- La cobertura del inglés se hereda del modelo base y no se ha evaluado tras el ajuste fino; no hay garantía de que el ajuste no haya degradado el rendimiento en inglés.
- Riesgo de artefactos típicos de TTS: omisión o repetición de palabras, prosodia incorrecta en frases largas, ruido de fondo o cortes al final del audio.
- No se ha documentado el tratamiento de normalización textual del uzbeko (escritura latina frente a cirílica, números, siglas, préstamos del ruso), lo que puede provocar lecturas erróneas en textos reales.
- El modo `x_vector_only_mode` captura el timbre pero no detalles finos de estilo o prosodia; la clonación es menos fiel que las variantes que usan transcripción de referencia.
- El modelo está entrenado con layout no streaming y el autor recomienda `non_streaming_mode=True`; su uso en modo streaming puede degradar la calidad.
- La licencia Apache 2.0 permite uso comercial, pero no se documenta el consentimiento ni la procedencia de las voces del dataset `mrmuminov/uzbek_voice`; conviene verificar los derechos antes de un uso comercial.
- Riesgo de uso indebido por suplantación de identidad: la clonación de voz exige consentimiento explícito del hablante y controles en producto (marcado de audio sintético, limitación de referencia).
- El modelo no tiene descargas ni valoraciones en HuggingFace en el momento de la consulta, por lo que carece de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrmuminov/Qwen3-TTS-12Hz-0.6B-Uzbek
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/mrmuminov/uzbek_voice
- Modelo de limpieza de audio Sidon: https://huggingface.co/sarulab-speech/sidon-v0.1
