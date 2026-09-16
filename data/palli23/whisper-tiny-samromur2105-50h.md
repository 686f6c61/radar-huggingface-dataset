# palli23/whisper-tiny-samromur2105-50h

# palli23/whisper-tiny-samromur2105-50h

## Resumen

whisper-tiny-samromur2105-50h es un ajuste fino (fine-tune) del modelo Whisper en su variante tiny, especializado en reconocimiento automático del habla (ASR) en islandés. Lo publica el usuario palli23 en HuggingFace y forma parte del conjunto de checkpoints de escalado "samromur-21.05", empleado en el trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" presentado en ICASSP 2026. El objetivo del trabajo es evaluar hasta qué punto modelos ASR pequeños, entrenados con datos específicos de un idioma, pueden competir con modelos multilingües mucho mayores.

El modelo hereda la arquitectura encoder-decoder de tipo transformer propia de la familia Whisper (ventanas de audio de 30 segundos, entrada de espectrograma log-mel) y cuenta con 37.760.640 parámetros según los pesos en safetensors, lo que lo sitúa en el rango de los modelos ASR ligeros que caben holgadamente en cualquier GPU de consumo e incluso en CPU. El identificador "50h" del nombre apunta a un ajuste sobre aproximadamente 50 horas de audio, presumiblemente extraídas del corpus Samrómur.

Su relevancia es doble: por un lado, ofrece una alternativa ligera y desplegable en el borde (edge) para transcripción en islandés; por otro, sirve como punto de datos dentro de un estudio académico sobre el escalado de modelos ASR pequeños frente a los grandes modelos multilingües. La información pública disponible sobre este checkpoint concreto es muy limitada: no hay métricas publicadas en la model card ni resultados de evaluación en la información consultada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante tiny) |
| Parámetros totales | 37.760.640 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos; secuencia de decodificación limitada por la configuración estándar de Whisper (no especificada en la información disponible) |
| Tipos de cuantización | no disponibles (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | islandés (is) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper: un transformer encoder-decoder que consume espectrogramas log-mel de 80 canales calculados sobre ventanas de 30 segundos y genera texto de forma autorregresiva. La variante tiny de Whisper es la más pequeña de la familia y se caracteriza por un número reducido de capas y una dimensión de modelo compacta, lo que explica sus ~38 millones de parámetros y su bajo coste computacional. El checkpoint aquí descrito es un ajuste fino de esa base sobre datos en islandés.

En cuanto al entrenamiento, la model card indica únicamente que forma parte del conjunto de checkpoints "samromur-21.05" y que sirve de apoyo al artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). No se especifican en la información disponible el número exacto de tokens, la composición detallada del dataset, la técnica de ajuste (supervisión directa, LoRA, etc.) ni el uso de RLHF o DPO, algo poco habitual en tareas ASR. Tampoco se detalla si se aplicaron técnicas como decodificación especulativa o atención lineal; lo más probable, dado el origen, es un ajuste supervisado estándar sobre el corpus Samrómur, pero esto no puede confirmarse con los datos proporcionados.

## Capacidades

- Reconocimiento automático del habla (ASR) en islandés: conversión de audio a texto.
- Transcripción de fragmentos de hasta 30 segundos por ventana, con la posibilidad de encadenar ventanas para audios más largos mediante lógica externa.
- Salida de texto con marcas de tiempo a nivel de segmento, si se usa el modo correspondiente de la librería de inferencia de Whisper.
- Capacidad multilingüe residual heredada del modelo base Whisper, aunque el ajuste específico en islandés puede degradar el rendimiento en otros idiomas.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No se documenta modo de razonamiento extendido (thinking mode), visión ni audio más allá del propio ASR.
- No se documentan tareas de traducción de voz (speech translation) en la información disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas en islandés: el modelo convierte audio en texto y, al ser tan ligero, puede ejecutarse en local sin depender de servicios en la nube, lo que resulta útil para organizaciones que manejan datos sensibles.
- Subtitulado automático de vídeo y pódcast en islandés: generación de subtítulos a partir de pistas de audio, con marcas de tiempo que facilitan la sincronización.
- Dictado y entrada de voz en aplicaciones de escritorio o móviles: integrable mediante whisper.cpp o faster-whisper, ofrece transcripción de baja latencia en hardware modesto.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo sonoro para habilitar búsqueda por texto completo en emisoras, archivos históricos o repositorios de entrevistas.
- Accesibilidad para personas con discapacidad auditiva: conversión en tiempo casi real de contenido hablado en islandés a texto.
- Investigación en ASR de bajos recursos: sirve como referencia reproducible para estudiar el escalado de modelos pequeños frente a modelos multilingües grandes, que es precisamente el propósito del trabajo en el que se enmarca.
- Preprocesado de pipelines de PLN en islandés: transcriptor previo a tareas de resumen, análisis de sentimiento o extracción de entidades sobre contenido hablado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER (word error rate), y los resultados de búsqueda no aportan datos de evaluación. Dado que el modelo pertenece a un trabajo de ICASSP 2026, es probable que existan cifras en el artículo asociado, pero no se han podido recuperar en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 150 MB en fp32, ~75 MB en fp16 y menos de 50 MB en cuantizaciones de 8 y 4 bits, sin contar el pequeño overhead de activaciones y caché.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo cabe sin problema en tarjetas de gama baja como GTX 1650, RTX 3050 o superiores. Para lotes grandes o inferencia concurrente, una RTX 4090, A100 o H100 es sobredimensionada pero válida.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual, y también en CPU, Raspberry Pi o dispositivos móviles gracias a su tamaño reducido.
- Opciones de despliegue: whisper.cpp, faster-whisper (CTranslate2), HuggingFace Transformers, ONNX Runtime. vLLM no es la opción natural para modelos de audio de esta familia.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en la práctica, un modelo tiny suele transcribir audio varias veces más rápido que tiempo real en GPU y cerca de tiempo real en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de audio | Idiomas | Licencia |
|---|---|---|---|---|
| palli23/whisper-tiny-samromur2105-50h | 37,76 M | 30 s | islandés (ajustado) | cc-by-sa-4.0 |
| openai/whisper-tiny | ~39 M | 30 s | multilingüe (~99 idiomas) | MIT |
| openai/whisper-base | ~74 M | 30 s | multilingüe (~99 idiomas) | MIT |

La comparación directa de calidad ASR en islandés frente a otros modelos ajustados no puede establecerse con los datos disponibles: no hay métricas publicadas para este checkpoint. La diferencia principal frente a los modelos base de OpenAI es la especialización lingüística (islandés) y la licencia, más restrictiva aquí por su carácter share-alike.

## Limitaciones y advertencias

- Especialización monolingüe: el ajuste está orientado al islandés; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Riesgo de alucinación: los modelos Whisper tienden a generar texto plausible en segmentos de silencio, ruido o audio ininteligible, un comportamiento especialmente problemático en transcripciones automáticas sin revisión humana.
- Volumen de datos limitado: el sufijo "50h" sugiere un ajuste sobre unas 50 horas de audio, lo que puede reducir la generalización a acentos, habla espontánea, dominios técnicos o condiciones acústicas ruidosas no representadas en el corpus.
- Sin métricas publicadas: no hay WER ni evaluaciones disponibles, por lo que no puede estimarse su calidad objetiva a partir de la información proporcionada.
- Licencia cc-by-sa-4.0: permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (share-alike), lo que puede condicionar su integración en productos propietarios.
- Ausencia de documentación de entrenamiento: no se detallan composición del dataset, hiperparámetros ni método de ajuste, lo que dificulta la reproducibilidad y la evaluación de sesgos.
- Posibles sesgos del corpus Samrómur: al tratarse de un corpus de habla leída y crowdsourced, puede sobrerrepresentar determinados registros o perfiles de hablantes.
- No apto para usos críticos sin validación: al no existir datos de rendimiento, no debería desplegarse en producción sin una evaluación previa específica del dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/whisper-tiny-samromur2105-50h
- Artículo asociado: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), sin enlace disponible en la información proporcionada.
- Corpus Samrómur: referencia mencionada en el nombre del modelo, sin enlace disponible en la información proporcionada.
- Repositorio de OpenAI Whisper (modelo base): https://github.com/openai/whisper
