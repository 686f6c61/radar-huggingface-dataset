# sailu4/moroccan-darija-ocr

## Resumen

Moroccan-darija-ocr es un modelo de reconocimiento óptico de caracteres (OCR) para líneas de texto impresas en árabe, publicado por el usuario sailu4 en Hugging Face y desarrollado en el repositorio complementario `BADR-JOULAlI/moroccan-darija-ocr`. Se trata de un reconocedor de líneas aisladas con arquitectura CRNN (CNN en escala de grises seguida de una BiLSTM de dos capas y una cabeza CTC), con 1.940.797 parámetros y 92 clases de caracteres más el token en blanco de CTC. El checkpoint `best.pt` incluye pesos, vocabulario, estado del optimizador, del scheduler y del AMP scaler, además de la configuración de entrenamiento.

El modelo se entrenó sobre imágenes de líneas de texto árabe impreso procedentes del Boletín Oficial marroquí (corpus publicado en Zenodo con DOI 10.5281/zenodo.21702529, licencia CC BY 4.0). A pesar del nombre del repositorio, el autor indica explícitamente que el modelo **no se entrenó con dariya** y que constituye una línea base en árabe para una adaptación posterior al dariya marroquí. Cualquier uso del checkpoint como referencia de rendimiento en dariya sería incorrecto.

Su relevancia actual es acotada: no es un modelo generativo ni un OCR de página completa, sino un componente de reconocimiento de línea que requiere detección previa de líneas y reconstrucción del orden de lectura. Resulta útil como punto de partida reproducible para pipelines de digitalización de documentos árabes y como base para experimentos de adaptación a dariya con datos sintéticos o reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN: CNN en escala de grises + BiLSTM de 2 capas + clasificador CTC |
| Parametros totales | 1.940.797 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen de altura 64 px y anchura máxima 1600 px |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión de entrenamiento) |
| Idiomas soportados | árabe impreso (entrenado en el Boletín Oficial marroquí); dariya no soportada de forma nativa |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`), con vocabulario en `vocab.json` |

Otros parámetros relevantes: altura de entrada 64, anchura máxima 1600, tamaño oculto de la BiLSTM 128, 32 canales en la CNN, índice en blanco de CTC 0, 92 clases de caracteres más el token en blanco.

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional recurrente (CRNN) clásica para OCR de líneas. La parte convolucional procesa la imagen de la línea en escala de grises y extrae un mapa de características; a continuación, una BiLSTM de dos capas con tamaño oculto 128 modela la secuencia temporal a lo largo del eje horizontal; finalmente, una capa lineal con activación CTC produce la transcripción. La decodificación utilizada en la evaluación es *greedy* CTC sin modelo de lenguaje, lo que explica en parte la tasa de error a nivel de palabra reportada.

El entrenamiento se realizó sobre el corpus de líneas del Boletín Oficial marroquí (Zenodo, DOI 10.5281/zenodo.21702529). El autor no detalla en la model card el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicables en un modelo CTC de OCR). El checkpoint conserva el estado del optimizador, del scheduler y del AMP scaler, lo que sugiere entrenamiento con precisión mixta. Como paso posterior, el autor documenta dos experimentos de adaptación a dariya con datos sintéticos: un subconjunto de 5.000 frases DODa en escritura árabe renderizadas con fuentes árabes (4.500 líneas de entrenamiento y 500 de validación, 3 épocas en una RTX 5070) que alcanzó 2,21 % CER, 9,92 % WER y 61,4 % de exactitud exacta de línea; y una ejecución filtrada con texto de Atlas (5.329 líneas renderizadas tras filtrar escrituras extranjeras) que alcanzó 6,63 % CER, 15,01 % WER y 15,20 % de exactitud exacta. Ambos son pruebas de pipeline con datos sintéticos, no evaluaciones sobre documentos reales.

## Capacidades

- Reconocimiento de texto árabe impreso en imágenes de línea ya recortadas.
- Salida de transcripción a nivel de carácter mediante decodificación CTC.
- Procesamiento de líneas de hasta 1600 px de anchura y 64 px de altura.
- Manejo de un vocabulario de 92 clases de caracteres árabes más el token en blanco.
- Integración como componente de un pipeline mayor: requiere detección de líneas y reconstrucción del orden de lectura para páginas completas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades.
- Capacidad multilingüe limitada al árabe impreso del corpus de entrenamiento; no hay soporte nativo de dariya ni de otros idiomas.

## Casos de uso

- Digitalización de boletines oficiales y documentos administrativos árabes: el modelo reconoce líneas impresas del Boletín Oficial marroquí con un CER del 1,49 % en el split de test, por lo que encaja en pipelines de preservación documental donde ya exista un detector de líneas.
- Extracción de texto de documentos legales escaneados: tras segmentar las líneas con un detector, el CRNN transcribe cada línea de forma independiente; su bajo CER a nivel de carácter permite reconstruir el texto con corrección ortográfica posterior.
- Creación de corpus de texto para entrenamiento de modelos de lenguaje en árabe: la transcripción de líneas del Boletín Oficial puede alimentar la construcción de datasets textuales a partir de fuentes públicas.
- Base para adaptación al dariya marroquí: el checkpoint sirve como inicialización para ajuste fino con pares línea-transcripción en dariya, tal como documenta el autor con los experimentos sintéticos DODa y Atlas.
- Evaluación comparativa de pipelines OCR: al publicar métricas CER, WER y exactitud exacta de línea junto con `metrics.json` y `verification.json`, permite contrastar detectores de línea y estrategias de decodificación sobre un test fijo de 1.212 líneas.
- Prototipado de sistemas de lectura de documentos en entornos con recursos limitados: con menos de 2 millones de parámetros, el modelo es ligero y puede ejecutarse en CPU o en GPU de consumo para pruebas de concepto.
- Investigación en reconocimiento de escritura árabe: la arquitectura CRNN + CTC con vocabulario y configuración publicados facilita reproducir experimentos y comparar variantes de decodificación (greedy frente a beam search con modelo de lenguaje).

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test fijo de 1.212 líneas del Boletín Oficial (árabe impreso, decodificación CTC greedy sin modelo de lenguaje):

| Metrica | Valor |
|---|---|
| CER | 1,49 % |
| WER | 6,94 % |
| Exactitud exacta de línea | 51,65 % |

Experimentos de adaptación con datos sintéticos (3 épocas en RTX 5070, no son benchmarks sobre documentos reales):

| Experimento | Lineas | CER | WER | Exactitud exacta |
|---|---|---|---|---|
| DODa sintetico (`experiments/darija_synthetic_v2`) | 4.500 train / 500 val | 2,21 % | 9,92 % | 61,4 % |
| Atlas filtrado (`experiments/atlas_synthetic_filtered`) | 5.329 renderizadas | 6,63 % | 15,01 % | 15,20 % |

No se han publicado comparaciones con otros modelos OCR en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,94 M de parámetros el checkpoint ocupa del orden de decenas de MB en precisión de entrenamiento, por lo que cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; una RTX 5070 se usó para los experimentos de ajuste fino. Para inferencia, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, en cualquier modelo actual (RTX 3060, RTX 4060, RTX 4090, etc.) y también en CPU para volúmenes moderados.
- Opciones de despliegue: el checkpoint es PyTorch puro y se carga con `torch.load`; no hay integración documentada con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. El despliegue requiere el código de inferencia y preprocesamiento del repositorio de GitHub.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros modelos OCR en la información proporcionada. Como referencia cualitativa de la categoría:

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moroccan-darija-ocr | CRNN + CTC para líneas árabes | 1,94 M | línea de 64x1600 px | no disponible | Hugging Face + GitHub |
| Tesseract (ara) | OCR clásico con LSTM | no disponible | página completa | Apache 2.0 | código abierto |
| TrOCR | Transformer encoder-decoder | no disponible | línea de imagen | MIT (variantes) | Hugging Face |

La comparación cuantitativa de rendimiento entre estos sistemas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo **no fue entrenado con dariya**; el nombre del repositorio puede inducir a error. El autor lo indica explícitamente y pide no presentarlo como resultado de referencia en dariya.
- Solo procesa líneas ya recortadas: no incluye detección de líneas ni reconstrucción del orden de lectura, que deben implementarse por separado.
- La decodificación evaluada es CTC greedy sin modelo de lenguaje; un beam search con LM podría mejorar el WER, pero no se reportan resultados en ese modo.
- La exactitud exacta de línea es del 51,65 %, lo que implica que casi la mitad de las líneas contienen al menos un error de carácter; para producción se recomienda corrección posterior o un LM.
- Sesgos conocidos: el corpus de entrenamiento es el Boletín Oficial marroquí, por lo que el dominio, la tipografía y el estilo administrativo pueden no generalizar a otros documentos (manuscritos, prensa, formularios).
- Riesgo de alucinación: en un modelo CTC no hay generación libre, pero sí errores de sustitución, omisión e inserción de caracteres, especialmente en líneas con ruido, fuentes atípicas o baja resolución.
- Limitaciones de idioma: sin soporte nativo de dariya, otros dialectos árabes ni lenguas no árabes; los experimentos con dariya son sintéticos y no validan documentos reales.
- Restricciones de licencia: la licencia del checkpoint no está disponible; el corpus de entrenamiento se anuncia bajo CC BY 4.0, pero eso no determina la licencia del modelo. Verificar antes de uso comercial.
- Los resultados de los experimentos sintéticos (DODa y Atlas) no deben interpretarse como rendimiento en documentos reales de dariya.
- El checkpoint se guarda con `weights_only=False`, lo que implica cargar objetos Python arbitrarios; conviene auditar el archivo antes de cargarlo en entornos no confiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sailu4/moroccan-darija-ocr
- Repositorio GitHub del proyecto: https://github.com/BADR-JOULAlI/moroccan-darija-ocr
- Corpus del Boletín Oficial marroquí (Zenodo): https://doi.org/10.5281/zenodo.21702529
- Notebook de galería de test: `notebooks/03_test_images_transcriptions.ipynb` (en el repositorio GitHub)
- Artefactos de test: `test_artifacts/test_images_transcriptions_gallery.png` (en el repositorio GitHub)
- Experimentos de adaptación a dariya: `experiments/darija_synthetic_v2` y `experiments/atlas_synthetic_filtered` (en el repositorio GitHub)
- Métricas y verificación: `metrics.json` y `verification.json` (en el repositorio GitHub)
