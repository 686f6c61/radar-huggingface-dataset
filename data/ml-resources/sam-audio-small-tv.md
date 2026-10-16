# ml-resources/sam-audio-small-tv

## Resumen

SAM-Audio es un modelo fundacional para la separación de fuentes de audio: aísla cualquier sonido presente en una mezcla compleja a partir de indicaciones en lenguaje natural, de pistas visuales extraídas de un vídeo o de anclas temporales. La ficha que se analiza, `ml-resources/sam-audio-small-tv`, es un espejo no oficial de `facebook/sam-audio-small-tv`, publicado por el usuario `ml-resources` y con la licencia original intacta. El desarrollo original corresponde a Meta (Facebook AI Research), tal como indican los enlaces a su blog, paper y demo incluidos en la model card.

La relevancia del modelo radica en que unifica tres modalidades de prompt (texto, visión y span temporal) bajo una misma arquitectura de separación, apoyándose en el codificador multimodal Perception-Encoder Audio-Visual (PE-AV). Esto lo sitúa en la intersección de la segmentación visual (SAM) y el procesamiento de audio, permitiendo tareas como aislar la voz de un hablante concreto en un vídeo ruidoso o extraer un sonido descrito con lenguaje natural.

La variante `small-tv` se distribuye con un repositorio de 5,1 GB y está etiquetada exclusivamente para inglés (`en`). No se han publicado en la información disponible datos sobre número de parámetros, longitud de contexto, cuantizaciones soportadas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de separación de fuentes de audio basado en el codificador Perception-Encoder Audio-Visual, PE-AV) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de audio; trabaja sobre ventanas de audio, no sobre contexto de tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | SAM License (identificador `other`, `license_name: sam-license`) |
| Formato de pesos | no disponible (el repositorio ocupa 5,1 GB) |

## Arquitectura y entrenamiento

La model card describe SAM-Audio como un modelo fundacional para aislar cualquier sonido en audio mediante prompts de texto, visuales o temporales. La arquitectura concreta (número de capas, tipo de transformer, mecanismo de atención) no se detalla en la información proporcionada. Sí se especifica que tanto SAM-Audio como el modelo Judge asociado dependen críticamente del codificador Perception-Encoder Audio-Visual (PE-AV), concretamente de la variante `facebook/pe-av-large`, descrito como un modelo de percepción audiovisual entrenado con aprendizaje de correspondencia multimodal a gran escala.

El modelo recibe como entrada audio (o vídeo), una descripción textual del sonido objetivo, opcionalmente vídeo enmascarado (generado típicamente con SAM 3) y anclas temporales del tipo `["+", inicio, fin]` o `["-", inicio, fin]`, que indican presencia o ausencia del sonido en un intervalo. La salida se compone de una señal `target` (el sonido aislado) y una señal `residual` (el resto de la mezcla). No se dispone de información sobre el volumen de tokens de audio utilizados en el entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

Una innovación operativa documentada es el re-ranking de candidatos (`reranking_candidates=8`), que mejora la calidad de la separación a costa de aumentar la latencia, y la capacidad de predecir automáticamente los spans del sonido objetivo (`predict_spans=True`).

## Capacidades

- Separación de fuentes de audio condicionada por descripción textual en lenguaje natural (por ejemplo, "a person coughing", "a dog barking", "piano playing a melody").
- Prompting visual: aislamiento del sonido asociado a un objeto concreto en un vídeo, usando máscaras generadas con SAM 3 (por ejemplo, "the person on the left").
- Prompting por span temporal: definición de intervalos donde el sonido está presente (`+`) o ausente (`-`), con soporte para múltiples anclas en una misma petición.
- Generación de dos salidas complementarias por inferencia: pista objetivo (`result.target`) y pista residual (`result.residual`).
- Predicción automática de spans mediante `predict_spans=True`.
- Re-ranking de candidatos configurable para mejorar la calidad de la separación.
- Procesamiento de audio y de vídeo (el procesador incluye utilidades como `mask_videos` y trabaja con `VideoDecoder` de torchcodec).
- Cobertura lingüística limitada al inglés según las etiquetas del repositorio.
- No se documentan capacidades de tool calling, agentes, generación de texto, código ni matemáticas; es un modelo especializado en audio, no un modelo de lenguaje conversacional.

## Casos de uso

- Postproducción de vídeo y cine: aislar diálogos de un actor concreto en escenas con ruido de fondo, música o tráfico, usando una descripción textual del hablante o máscaras visuales de SAM 3 sobre los fotogramas.
- Restauración de archivos de audio históricos: separar voces de grabaciones con ruido ambiental persistente (lluvia, motores, multitudes) describiendo el sonido no deseado o marcando spans donde aparece.
- Edición de podcasts y locuciones: extraer la pista de voz limpia y descartar el residual (teclados, ventiladores, notificaciones) antes de la mezcla final.
- Etiquetado y curaduría de datasets de audio: generar automáticamente pistas separadas por tipo de sonido (ladridos, motores, instrumentos) para construir corpus etiquetados de entrenamiento.
- Vídeo bajo demanda y subtitulado: aislar la voz del personaje que habla en pantalla a partir de una máscara visual, útil en escenas con solapamiento de voces.
- Análisis forense de audio: aislar eventos concretos (una bocina, un cristal roto) en grabaciones largas empleando anclas temporales para acotar la búsqueda.
- Investigación en percepción audiovisual: experimentación con el codificador PE-AV y con estrategias de re-ranking para estudiar correspondencias entre modalidades.
- Monitorización acústica industrial: separar una firma sonora específica (por ejemplo, "car engine revving") de una mezcla de ruido de planta para detección de anomalías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 5,1 GB, por lo que se estima que los pesos en precisión completa podrían situarse en el orden de 1,25 mil millones de parámetros; se trata de una estimación, no de un dato confirmado.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un checkpoint de ~5 GB en fp32 requeriría al menos ~6-7 GB de VRAM solo para los pesos, más el espacio para activaciones y buffers de audio; en fp16 el requisito de pesos bajaría aproximadamente a la mitad.
- GPU recomendadas: no disponible en la documentación. El código de ejemplo usa `torch.device("cuda" if torch.cuda.is_available() else "cpu")`, por lo que admite ejecución en CPU, aunque con latencia muy superior.
- Compatibilidad con GPU de consumo: no confirmada; si la estimación de tamaño es correcta, el modelo podría caber en GPUs de consumo con 8-12 GB de VRAM o más, siempre que se disponga de una implementación compatible.
- Opciones de despliegue: la model card documenta únicamente el uso mediante la librería `sam_audio` (clases `SAMAudio` y `SAMAudioProcessor`), con dependencias adicionales de `torchaudio`, `torchcodec` y, para el prompting visual, `sam3` instalado desde el repositorio de Facebook Research. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La propia documentación señala que el re-ranking de candidatos mejora la calidad a costa de aumentar la latencia, sin ofrecer cifras.
- Requisito de autenticación: es necesario solicitar acceso a los checkpoints en el repositorio de SAM-Audio de Hugging Face y ejecutar `huggingface-cli login`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam-audio-small-tv (este) | no disponible | audio, vídeo enmascarado, spans; ingles | no disponible | SAM License | espejo no oficial en `ml-resources`; original en `facebook` previa solicitud de acceso |
| facebook/sam-audio-large | no disponible (mayor que la variante small) | audio, vídeo enmascarado, spans; ingles | no disponible | SAM License | repositorio oficial de Meta, con acceso bajo solicitud |
| facebook/pe-av-large | no disponible | codificador audiovisual multimodal, no es un separador | no disponible | no disponible | repositorio oficial de Meta |

No se dispone de información sobre otros modelos comparables de separación de fuentes de audio condicionados por prompt en la documentación proporcionada.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: el propio autor aclara que todo el mérito corresponde a los autores originales y que no se trata de un lanzamiento oficial. No debe citarse como fuente canónica.
- Los pesos originales requieren solicitar acceso en el repositorio `facebook/sam-audio-large` y autenticarse con Hugging Face; el espejo no elimina necesariamente esa dependencia en el flujo de uso.
- Licencia SAM License (`license: other`): es una licencia propia, no una licencia de código abierto estándar. Es imprescindible revisar el fichero `LICENSE` antes de cualquier uso comercial, ya que puede incluir restricciones específicas.
- Idiomas: el modelo está etiquetado únicamente para inglés, lo que limita las descripciones textuales de prompt a ese idioma.
- Riesgo de separación imperfecta: la calidad depende de la precisión del prompt; descripciones ambiguas o sonidos solapados pueden producir fugas entre la pista objetivo y la residual. No hay métricas publicadas que cuantifiquen este riesgo.
- El prompting visual depende de SAM 3 para generar las máscaras, lo que añade una dependencia externa y posibles errores en cadena: una máscara incorrecta degrada directamente la separación de audio.
- El re-ranking de candidatos incrementa la latencia de forma no cuantificada; en sistemas en tiempo real puede no ser viable.
- No se especifican sesgos conocidos, pero al ser un modelo de percepción audiovisual entrenado con datos a gran escala es previsible que herede sesgos de representación de los corpus utilizados; no hay información disponible al respecto.
- No hay resultados de benchmarks publicados en la información disponible, por lo que no es posible validar el rendimiento frente a alternativas antes de desplegarlo en producción.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica una adopción nula del espejo concreto.
- El tamaño del repositorio (5,1 GB) y la ausencia de formatos cuantizados documentados dificultan el despliegue en entornos con recursos limitados.

## Enlaces

- Modelo (espejo): https://huggingface.co/ml-resources/sam-audio-small-tv
- Modelo original: https://huggingface.co/facebook/sam-audio-small-tv
- Repositorio oficial de referencia citado en el código: https://huggingface.co/facebook/sam-audio-large
- Codificador Perception-Encoder Audio-Visual: https://huggingface.co/facebook/pe-av-large
- Blog de Meta sobre SAM-Audio: https://ai.meta.com/blog/sam-audio/
- Paper de SAM-Audio: https://ai.meta.com/research/publications/sam-audio-segment-anything-in-audio/
- Paper de PE-AV: https://ai.meta.com/research/publications/pushing-the-frontier-of-audiovisual-perception-with-large-scale-multimodal-correspondence-learning/
- Demo interactiva: https://aidemos.meta.com/segment-anything/editor/segment-audio
- Repositorio de SAM 3 (necesario para el prompting visual): https://github.com/facebookresearch/sam3
- Preprint en arXiv: https://arxiv.org/abs/2512.18099
