# ccmusic-database/pianos

## Resumen

El modelo `ccmusic-database/pianos` es un clasificador de audio especializado en la discriminación de timbres de piano. Lo desarrolla el grupo ccmusic-database y su objetivo es identificar a qué marca o tipo de piano corresponde un fragmento de audio entre ocho clases: Kawai, Kawai Grand, YOUNG CHANG, HSINGHAI, Steinway Theatre, Steinway Grand, Pearl River y Yamaha. Se publica bajo licencia MIT y pipeline `audio-classification`.

Técnicamente no es un modelo de lenguaje: es una red neuronal convolucional de visión por computador reutilizada para clasificación de audio. El audio se transforma en espectrogramas Mel y se alimenta a un backbone clásico (el autor documenta un ajuste fino de SqueezeNet) entrenado de forma supervisada sobre un dataset anotado de grabaciones de piano. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere pesos muy ligeros, coherentes con SqueezeNet.

Su relevancia es de nicho: aplicaciones de evaluación de calidad sonora de instrumentos, ingeniería de audio y musicología computacional. No compite con modelos generativos ni multimodales; es una herramienta de clasificación cerrada de 8 clases con salida de etiqueta única.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (backbone de visión, ajuste fino documentado sobre SqueezeNet) |
| Parametros totales | no disponible (SqueezeNet tiene ~1,2 M, pero no se confirma el recuento exacto del checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de audio; ventana de entrada definida por la duración del espectrograma Mel, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadato del modelo; la tarea es audio, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se descarga vía `snapshot_download`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN de clasificación de imágenes aplicada a audio. El pipeline convierte la señal de audio en espectrogramas Mel y los trata como imágenes de entrada a un backbone preentrenado en visión, que se ajusta finamente de forma supervisada para la tarea de 8 clases. La model card cita explícitamente SqueezeNet como backbone del resultado de demostración, con curvas de pérdida, precisión de entrenamiento/validación y matriz de confusión publicadas.

El entrenamiento usa un dataset anotado a gran escala de grabaciones de piano (dataset `ccmusic-database/pianos`). No se documentan en la información disponible el número de tokens/horas de audio, la composición exacta del dataset, ni si hubo técnicas de refuerzo o preferencias (RLHF/DPO), algo esperable al no tratarse de un modelo generativo. La innovación técnica es la transferencia de backbones de visión a espectrogramas Mel para timbre de instrumentos, un enfoque consolidado en MIR (music information retrieval).

## Capacidades

- Clasificación de audio en 8 clases de piano: Kawai, Kawai Grand, YOUNG CHANG, HSINGHAI, Steinway Theatre, Steinway Grand, Pearl River y Yamaha.
- Discriminación de timbre a partir de espectrogramas Mel.
- Salida de etiqueta única (clasificación cerrada), no generación de texto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no aplicables (tarea de audio).
- No dispone de modo thinking, visión, audio generativo ni otras capacidades especiales más allá de la clasificación.

## Casos de uso

- Evaluación de calidad sonora de pianos: clasificar grabaciones por marca/tipo para estudios comparativos de timbre en musicología computacional o peritaje de instrumentos.
- Ingeniería de audio y postproducción: etiquetado automático de librerías de samples de piano por marca para organización y búsqueda.
- Catalogación de archivos musicales: procesar lotes de grabaciones y asignar etiquetas de fabricante de piano para metadatos.
- Control de calidad en fabricación/venta de pianos: verificar que una grabación corresponde al modelo declarado mediante clasificación automática.
- Docencia e investigación en MIR: usar el modelo como baseline reproducible (licencia MIT, pesos ligeros) en experimentos de clasificación de timbre.
- Demos y prototipos de clasificación de audio: integrar el modelo en un servicio de inferencia sencillo gracias a su tamaño reducido y a la API de `huggingface_hub`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye curvas de pérdida, precisión de entrenamiento/validación y matriz de confusión como imágenes, pero no se proporcionan valores de accuracy, F1 ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: muy baja; un backbone tipo SqueezeNet ocupa del orden de unos pocos MB a decenas de MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no es necesario hardware dedicado; cualquier GPU moderna (RTX 3060 en adelante) o CPU es suficiente para inferencia por lotes moderados.
- Cabe en GPU consumer: sí, con amplio margen (incluidas GPUs de gama baja e integradas).
- Opciones de despliegue: inferencia vía `huggingface_hub` (`snapshot_download`) y el repositorio `monetjoe/pianos`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). Existe una demo en Hugging Face Spaces.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de clasificación de timbre de piano con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Clasificación cerrada de 8 clases: no reconoce marcas o tipos de piano fuera de las etiquetadas.
- Dependencia de la calidad y condiciones de grabación (micrófono, sala, ruido); el rendimiento puede degradarse fuera de la distribución del dataset de entrenamiento.
- Riesgo de confusión entre clases próximas (p. ej., Steinway Theatre vs. Steinway Grand, Kawai vs. Kawai Grand), tal como refleja la matriz de confusión publicada.
- No es un modelo generativo: no produce texto, código ni razonamiento; no debe usarse para tareas de lenguaje.
- Sesgos conocidos: no documentados en la información disponible; el dataset de entrenamiento condiciona los sesgos de clase.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y citar el trabajo asociado.
- Caveat de producción: el repo es de 0.0 GB y los pesos se obtienen vía descarga; verificar la integridad del checkpoint antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccmusic-database/pianos
- Dataset: https://huggingface.co/datasets/ccmusic-database/pianos
- Demo (Space): https://huggingface.co/spaces/ccmusic-database/pianos
- Repositorio de evaluación/código: https://github.com/monetjoe/pianos
- Espejo en ModelScope: https://www.modelscope.cn/models/ccmusic-database/pianos
- Paper citado: Zhou et al., "A Holistic Evaluation of Piano Sound Quality", National Conference on Sound and Music Technology, Springer, 2023.
