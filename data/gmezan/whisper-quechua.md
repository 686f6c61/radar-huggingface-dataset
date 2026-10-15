# gmezan/whisper-quechua

## Resumen

gmezan/whisper-quechua es un ajuste fino (fine-tuning) del modelo Whisper de OpenAI publicado en Hugging Face por el usuario gmezan. Se distribuye con la librería transformers y el pipeline declarado es automatic-speech-recognition, es decir, está pensado para transcripción de voz. Por el identificador y por el recuento de parámetros, todo apunta a que parte de la variante Whisper small (arquitectura encoder-decoder transformer de unos 241,7 millones de parámetros), adaptada presumiblemente al quechua, aunque la model card no confirma ni el idioma objetivo ni el proceso de ajuste.

La relevancia de este tipo de modelos es doble. Por un lado, Whisper es una referencia consolidada en reconocimiento automático del habla (ASR) multilingüe y su variante small ofrece un equilibrio razonable entre calidad y coste computacional, lo que permite desplegarla en una sola GPU de consumo. Por otro, el quechua es una lengua con recursos digitales escasos dentro de las familias quechuas habladas en Perú, Bolivia, Ecuador y el noroeste de Argentina, de modo que cualquier iniciativa de ASR en esta lengua cubre un hueco real de accesibilidad.

Ahora bien, la ficha debe leerse con cautela: la model card es la plantilla autogenerada por Hugging Face y no contiene ni un solo campo rellenado. No hay licencia declarada, no hay idiomas declarados, no hay datos de entrenamiento, no hay evaluación y no hay instrucciones de uso. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que tampoco existe validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper de OpenAI), según el tag `whisper` y el pipeline ASR; detalles concretos no disponibles |
| Parámetros totales | 241.734.912 (dato real de los pesos safetensors) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; Whisper opera sobre ventanas de audio de 30 segundos (1500 fotogramas Mel) con hasta 448 tokens de salida por ventana |
| Tipos de cuantización | no disponible en la información. El repo contiene un único artefacto safetensors de ~1,0 GB, coherente con pesos en fp32 (241,7 M × 4 bytes ≈ 967 MB) |
| Idiomas soportados | no disponible. El identificador sugiere quechua, pero la model card no lo confirma ni especifica la variedad (quechua sureño, ancashino, etc.) |
| Licencia | no disponible (la model card indica «[More Information Needed]») |
| Formato de pesos | safetensors (carga mediante transformers) |

## Arquitectura y entrenamiento

A partir de los tags y del recuento de parámetros, el modelo sigue la arquitectura de Whisper small: un transformer encoder-decoder con 12 capas en el encoder y 12 en el decoder, anchura de modelo de 768 y 12 cabezas de atención, que consume espectrogramas log-Mel de 80 canales calculados sobre ventanas de 30 segundos. Whisper se entrenó originalmente con supervisión débil a gran escala sobre cientos de miles de horas de audio con transcripciones ruidosas, con tareas multitarea (transcripción, traducción al inglés, detección de idioma y marcas de tiempo). Esta base es la que hereda cualquier fine-tuning derivado, incluido este.

No hay información sobre el procedimiento de ajuste: se desconoce el corpus quechua empleado, el número de horas, si hubo congelación de capas, la técnica de adaptación (full fine-tuning, LoRA, adaptadores), la precisión de entrenamiento ni si se aplicó alguna fase de alineación. Tampoco hay datos sobre la infraestructura de cómputo, la región ni la huella de carbono. Todo ello está marcado como «[More Information Needed]» en la model card.

## Capacidades

- Transcripción de voz a texto mediante el pipeline `automatic-speech-recognition` de transformers.
- Procesamiento de audio en ventanas de 30 segundos, con posibilidad de encadenar ventanas para audios más largos si se implementa la lógica de segmentación correspondiente.
- Capacidad multilingüe heredada de Whisper (el modelo base cubre alrededor de 99 idiomas), aunque se desconoce qué idiomas conserva o ha reforzado este ajuste.
- Posible especialización en quechua por el identificador del modelo, sin confirmación documental.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio generativo.
- No se documenta ningún modo de «pensamiento» ni capacidades de instrucciones: es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en quechua: el modelo puede convertir grabaciones de campo en texto editable, lo que facilita su archivo y análisis lingüístico. Requiere validación previa con hablantes nativos, dado que no hay métricas publicadas.
- Subtitulado de material audiovisual comunitario: radios locales, vídeos educativos o documentales en quechua podrían obtener subtítulos automáticos como primer borrador, con revisión humana posterior.
- Documentación de patrimonio oral: cuentos, cantos y conocimiento tradicional registrados en audio pueden transcribirse para su conservación digital y su publicación en repositorios abiertos.
- Apoyo a la atención sanitaria y administrativa en zonas bilingües: transcripción de consultas o declaraciones orales para reducir la carga de registro escrito, siempre con consentimiento y supervisión.
- Herramientas educativas de lectoescritura: transcripción de ejercicios orales de estudiantes para dar retroalimentación sobre pronunciación o vocabulario, integrándolo en una aplicación de aula.
- Generación de corpus paralelos: combinando la transcripción con traducciones humanas se pueden construir datasets alineados que alimenten otros modelos de traducción automática quechua-castellano.
- Investigación lingüística y fonética: la salida transcrita puede servir como punto de partida para anotación forzada y análisis de variación dialectal, con la cautela de que no se conoce qué variedad cubre el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación con datos y el repositorio no presenta métricas de WER, CER ni comparaciones con otros sistemas. No se debe asumir el rendimiento de Whisper small original, ya que el ajuste puede degradar o mejorar el comportamiento según la cantidad y calidad de los datos quechuas empleados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,0 GB en fp32, en torno a 0,5 GB en fp16/bf16 y unos 0,25 GB en int8. Son estimaciones derivadas del recuento de parámetros (241,7 M) y no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Modelos como RTX 3050, RTX 3060, RTX 4090, T4, L4, A10G, A100 o H100 lo ejecutan sin problemas; en las GPU más grandes el modelo queda muy sobredimensionado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos años, e incluso en iGPU con memoria compartida suficiente.
- CPU: es viable para uso no interactivo. Al ser un modelo de 241 M de parámetros, la inferencia en CPU con `transformers` o `faster-whisper` es lenta pero funcional para transcripción por lotes.
- Opciones de despliegue: `transformers` (forma nativa del repo), endpoints compatibles según el tag `endpoints_compatible`, y previsiblemente `faster-whisper`/CTranslate2 y `whisper.cpp` si se convierten los pesos, aunque el autor no documenta estas rutas. Ollama y vLLM no son vías habituales para ASR.
- Latencia y throughput: no disponibles. No hay medidas publicadas de factor de tiempo real ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gmezan/whisper-quechua | 241,7 M | 30 s de audio por ventana | no disponible (probable quechua) | no disponible | Hugging Face, 0 descargas, 0 likes |
| LastEngineer01/whisper-quechua | no disponible | no disponible | no disponible | no disponible | Hugging Face (encontrado en la búsqueda web) |
| openai/whisper-small | 241,7 M | 30 s de audio por ventana | ~99 idiomas (incluye multilingüe general, no quechua específico) | Apache 2.0 | Hugging Face, ampliamente descargado y validado |
| Whisper (modelo base descrito en la literatura) | variantes de 39 M a 1,55 mM | 30 s de audio por ventana | multilingüe | MIT/Apache según variante publicada por OpenAI | Repositorio oficial y paper |

La comparación directa de rendimiento con `openai/whisper-small` no es posible porque este ajuste no publica métricas. La ventaja diferencial, si el ajuste es correcto, sería la cobertura del quechua; la desventaja clara es la ausencia total de documentación, licencia y evaluación.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal. Hay que contactar con el autor antes de integrarlo en cualquier producto.
- Model card vacía: todos los campos son la plantilla autogenerada, sin información sobre datos, sesgos, uso previsto ni uso fuera de alcance.
- Sin evaluación publicada: no hay WER ni CER, por lo que no se puede afirmar que el ajuste mejore o empeore respecto a Whisper small original en quechua.
- Riesgo de alucinación específico de ASR: Whisper tiende a inventar texto plausible en fragmentos con ruido, silencio o habla no cubierta por el entrenamiento, y a repetir frases en bucle. Este riesgo es mayor en lenguas con pocos datos.
- Cobertura dialectal incierta: el quechua agrupa variedades muy divergentes; sin saber con qué corpus se ajustó, la calidad puede caer drásticamente en variedades no representadas.
- Sesgo de dominio: si el ajuste se hizo con un corpus limitado (religioso, noticias o lectura), el rendimiento fuera de ese dominio será peor.
- Poca o nula validación comunitaria: 0 descargas y 0 likes implican que nadie ha reportado resultados independientes.
- Metadatos atípicos: la fecha de creación indicada en el Hub es 2026-10-14, posterior a la redacción de esta ficha; conviene verificar el estado actual del repositorio.
- Sin garantía de mantenimiento: no hay indicios de que el autor vaya a actualizar pesos, documentación o corregir errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gmezan/whisper-quechua
- Ajuste alternativo con el mismo nombre encontrado en la búsqueda web: https://huggingface.co/LastEngineer01/whisper-quechua
- Referencia arXiv asociada al tag del modelo: https://arxiv.org/abs/1910.09700
- Artículo de Wikipedia sobre Whisper: https://en.wikipedia.org/wiki/Whisper_(speech_recognition_system)
- Buscador de modelos Whisper en Hugging Face: https://huggingface.co/models?sort=trending&search=whisper
- Proyecto Quechua.AI citado en la búsqueda web: https://www.quechua.ai/en
