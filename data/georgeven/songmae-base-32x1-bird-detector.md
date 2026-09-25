# georgeven/songmae-base-32x1-bird-detector

## Resumen

SongMAE-Base 32x1 bird detector es un modelo de deteccion de eventos sonoros (sound event detection) especializado en vocalizaciones de aves. Lo desarrolla el usuario de Hugging Face georgeven como ajuste fino del encoder bioacustico SongMAE-Base 32x1, al que se anade una cabeza lineal. El modelo no clasifica especies: predice, para cada trama de 5 ms y cada una de las 128 bandas mel del espectrograma (20-16.000 Hz), la probabilidad de que esa celda tiempo-frecuencia pertenezca a una vocalizacion de ave.

Su relevancia tecnica esta en el metodo de entrenamiento: no se usaron etiquetas humanas. Las anotaciones proceden de un modelo vision-lenguaje profesor (Qwen3.8-27B en cuantizacion Q8_0 sobre llama.cpp) que dibuja cajas delimitadoras sobre espectrogramas viridis de 5 segundos de grabaciones de Xeno-Canto (BirdSet XCL), con ejes de coordenadas visibles, razonamiento en cadena y una pasada numerada de autoevaluacion. El detector destilado tiene solo 13,7 millones de parametros, ocupa 0,2 GB de repositorio y se distribuye con licencia MIT, lo que lo hace desplegable incluso en CPU.

El modelo es util como etapa previa de localizacion temporal y frecuencial en pipelines de monitorizacion acustica: recorta las regiones con vocalizaciones antes de pasarlas a un clasificador de especie, reduciendo el coste de computo y el ruido de fondo. La model card publica resultados de localizacion de la variante Large; el detector Base de esta ficha solo fue evaluado en el conjunto de desarrollo Powdermill, sin cifras publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bioacustico SongMAE-Base 32x1 (representacion tiempo-frecuencia) con cabeza lineal de deteccion |
| Parametros totales | 13.712.288 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el entrenamiento uso espectrogramas de 5 s y la salida se calcula por trama de 5 ms |
| Tipos de cuantizacion | no disponible (los pesos se publican en el formato original; la cuantizacion Q8_0 mencionada corresponde al modelo profesor, no a este detector) |
| Idiomas soportados | no aplica (modelo de audio, no textual); no disponible en la informacion |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Entrada | Audio mono a 32 kHz (carga via librosa) |
| Salida | Matriz de probabilidad de 128 bandas mel x tramas de 5 ms; regiones en CSV (start_s, end_s, low_hz, high_hz, peak_probability) |
| Checkpoints | 3 semillas (--seed 0, 1, 2), cada una con umbral calibrado |
| Modelo base | georgeven/songmae-base-32x1 |

## Arquitectura y entrenamiento

El detector reutiliza el encoder SongMAE-Base 32x1, un encoder bioacustico para canto de aves, y le anade una cabeza lineal que proyecta las representaciones del encoder sobre el espacio tiempo-frecuencia. La prediccion final es densa: 128 bandas mel entre 20 y 16.000 Hz y una resolucion temporal de 5 ms por trama (200 tramas por segundo de audio). El repositorio del modelo base aparece listado con 14,9 M de parametros en la coleccion de Hugging Face, mientras que el detector ajustado registra 13.712.288 parametros en safetensors. La informacion disponible no detalla el significado exacto de la nomenclatura 32x1 ni la configuracion interna de parches del encoder.

El entrenamiento no empleo etiquetas humanas. Se generaron cajas delimitadoras sobre espectrogramas viridis de 5 segundos de grabaciones de Xeno-Canto (BirdSet XCL) usando como profesor un modelo vision-lenguaje Qwen3.8-27B cuantizado a Q8_0 y ejecutado con llama.cpp. El profesor dispuso de ejes de coordenadas en la imagen, razono en cadena antes de emitir las coordenadas y realizo una pasada numerada de autorrevision. Sobre esas anotaciones se entreno el detector, en un esquema de destilacion de etiquetas. La model card indica que los modelos entrenados con etiquetas del profesor reportan medias sobre tres semillas, lo que sugiere que las tres semillas publicadas corresponden a ejecuciones independientes del mismo procedimiento.

## Capacidades

- Deteccion de vocalizaciones de ave en el plano tiempo-frecuencia: probabilidad por celda de 128 bandas mel y trama de 5 ms.
- Extraccion de regiones: agrupa las celdas por encima del umbral y devuelve intervalos con inicio, fin, frecuencia inferior, frecuencia superior y probabilidad maxima.
- Salida en dos formatos: NPZ con las matrices `probability` y `mask`, y CSV con una fila por region detectada.
- Ejecucion en CPU o GPU (`--device cuda` o `--device cpu`).
- Umbral de decision calibrado por semilla; ajustable manualmente mediante `--threshold`.
- API de Python con las funciones `load`, `probabilities` y `regions`.
- No realiza clasificacion de especie: solo delimita donde hay vocalizacion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- No dispone de modo de vision, audio generativo, texto ni traduccion.
- Capacidades multilingues: no aplica.

## Casos de uso

- Preprocesado para clasificadores de especie: se ejecuta el detector sobre grabaciones largas, se recortan las regiones devueltas en el CSV y solo esos fragmentos se envian al clasificador acustico, reduciendo el volumen de audio a procesar y el ruido de fondo. Es el esquema descrito en trabajos de bioacustica como el del entorno de Donana.
- Monitorizacion acustica pasiva de largo plazo: con registradores automaticos que acumulan cientos de horas, el detector filtra los tramos con actividad vocal y permite indexar el archivo por eventos en lugar de por fichero completo.
- Despliegue en dispositivos de borde: con 13,7 M de parametros y pesos de decenas de MB, cabe en placas tipo Raspberry Pi o mini-PC sin GPU, lo que habilita estaciones de campo autonomas con consumo energetico bajo.
- Curación y anotacion de archivos de Xeno-Canto: genera cajas candidatas para que un anotador humano las revise, reduciendo el coste de etiquetado manual en proyectos de ciencia ciudadana.
- Estudios de fenologia y actividad diaria: al producir marcas temporales con resolucion de 5 ms, permite calcular tasas de canto por hora, patrones de amanecer y variaciones estacionales a partir de la densidad de eventos detectados.
- Analisis de ocupacion de nicho acustico: las frecuencias inferior y superior de cada region permiten estudiar el reparto del espacio espectral entre especies coexistentes en una misma localizacion.
- Control de calidad de datasets de audio: detectar grabaciones sin vocalizaciones aviares o con predominio de ruido antes de incorporarlas a un corpus de entrenamiento.
- Evaluacion comparativa de detectores: al compartir formato de salida con modelos como YOLO11 ajustado a espectrogramas, sirve como referencia ligera en experimentos de destilacion de etiquetas generadas por modelos vision-lenguaje.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la tabla de localizacion sobre conjuntos de test (Tabla 2 del articulo citado). La propia model card advierte que la fila SongMAE corresponde al detector Large y que este detector Base solo fue evaluado en el conjunto de desarrollo Powdermill, sin cifras publicadas.

| Modelo | WABAD AP | WABAD IoU | Hawaii AP | Hawaii IoU | XC-AJ AP | XC-AJ IoU | NIPS4Bplus AP | NIPS4Bplus IoU |
|---|---|---|---|---|---|---|---|---|
| BirdCODE | no disponible | no disponible | no disponible | no disponible | 0,836 | 0,526 | 0,657 | 0,545 |
| YOLO11n (etiquetas humanas) | 0,552 | 0,347 | 0,541 | 0,369 | 0,700 | 0,546 | 0,630 | 0,455 |
| YOLO11l (etiquetas humanas) | 0,549 | 0,354 | 0,546 | 0,381 | 0,676 | 0,556 | 0,590 | 0,464 |
| YOLO11n (etiquetas del profesor) | 0,566 | 0,348 | 0,619 | 0,412 | 0,769 | 0,512 | 0,749 | 0,468 |
| YOLO11l (etiquetas del profesor) | 0,568 | 0,359 | 0,604 | 0,400 | 0,774 | 0,518 | 0,748 | 0,532 |
| SongMAE-Large (etiquetas del profesor) | 0,633 | 0,385 | 0,716 | 0,479 | 0,836 | 0,529 | 0,777 | 0,488 |
| SongMAE-Base 32x1 bird detector (este modelo) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Detalles metodologicos indicados en la model card: WABAD y Hawaii miden localizacion tiempo-frecuencia (AP e IoU a nivel de pixel); XC-AJ y NIPS4Bplus miden localizacion de inicio y fin (a nivel de trama). Los modelos entrenados con etiquetas del profesor promedian tres semillas. No se publican resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria de lenguaje, porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 13.712.288 parametros: unos 55 MB en fp32, unos 27 MB en fp16 o bf16 y unos 14 MB en int8. Son estimaciones aritmeticas, no mediciones publicadas.
- El cuello de botella realista no son los pesos sino el calculo del espectrograma de mel (librosa y FFT) sobre grabaciones largas; no hay datos publicados de latencia ni de throughput.
- GPU recomendadas: no se especifican. Cualquier GPU CUDA es suficiente por tamano de modelo; tambien se puede ejecutar en CPU, que es el modo por defecto cuando no hay CUDA disponible.
- Cabe en cualquier GPU de consumo e integrada por el reducido numero de parametros, siempre que el audio se procese por fragmentos si la memoria del sistema es muy limitada.
- Opciones de despliegue: PyTorch con el script `detect.py` distribuido en el repositorio o la API de Python (`load`, `probabilities`, `regions`). No aplica a este modelo el despliegue con vLLM, llama.cpp, Ollama o TGI, propios de modelos de lenguaje; no hay informacion sobre exportaciones a ONNX o TorchScript.
- El modelo profesor si requiere llama.cpp y la cuantizacion Q8_0, pero ese componente solo interviene en el proceso de generacion de etiquetas, no en la inferencia del detector.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | WABAD AP | Hawaii AP | XC-AJ AP | NIPS4Bplus AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| SongMAE-Base 32x1 bird detector | 13,7 M | 128 bandas mel x tramas de 5 ms | no disponible | no disponible | no disponible | no disponible | MIT | Hugging Face |
| SongMAE-Large 32x1 bird detector | no disponible | misma salida tiempo-frecuencia | 0,633 | 0,716 | 0,836 | 0,777 | no disponible | Hugging Face |
| BirdCODE | no disponible | localizacion inicio-fin | no disponible | no disponible | 0,836 | 0,657 | no disponible | no disponible |
| YOLO11n / YOLO11l sobre espectrogramas | no disponible | cajas sobre espectrograma | 0,549-0,566 | 0,541-0,619 | 0,676-0,769 | 0,590-0,749 | no disponible | no disponible |

La comparacion directa se ve limitada porque la model card solo publica cifras del detector Large, no del Base. En los conjuntos medidos, la variante Large con etiquetas del profesor supera a YOLO11n y YOLO11l tanto con etiquetas humanas como con etiquetas del profesor, y empata con BirdCODE en XC-AJ (0,836 de AP) quedando por debajo en IoU de XC-AJ (0,529 frente a 0,526, practicamente igual) y por encima en NIPS4Bplus. No hay datos de parametros, licencia ni disponibilidad para BirdCODE ni para las variantes de YOLO11 en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo detecta vocalizaciones, no especies: no debe presentarse como un clasificador ni usarse como tal.
- Entrenamiento sin etiquetas humanas: las anotaciones provienen de un modelo vision-lenguaje y heredan sus errores de localizacion, incluyendo cajas mal ajustadas o eventos omitidos.
- Los resultados publicados en la model card corresponden al detector Large. Para este detector Base solo consta evaluacion en el conjunto de desarrollo Powdermill, sin cifras, por lo que su rendimiento en WABAD, Hawaii, XC-AJ o NIPS4Bplus es desconocido.
- El umbral de decision esta calibrado por semilla; usar el umbral de una semilla con los pesos de otra puede degradar la precision y el recall.
- Existen tres checkpoints (semillas 0, 1 y 2) sin criterio publicado sobre cual elegir en produccion ni datos de varianza entre ellos para la variante Base.
- No hay informacion disponible sobre el comportamiento del modelo frente a sonidos no avianos (insectos, anfibios, ruido antropogenico) ni sobre su robustez ante dominios acusticos distintos de los de entrenamiento.
- No se documentan sesgos por especie, habitat, region geografica ni condicion de grabacion, un riesgo relevante en bioacustica cuando el corpus de entrenamiento tiene cobertura desigual.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe riesgo de falsos positivos en el plano tiempo-frecuencia: celdas marcadas como vocalizacion sin evento real.
- La resolucion de 5 ms y el rango de 20 a 16.000 Hz acotan los eventos detectables; no hay informacion sobre cantos fuera de ese rango espectral.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con conservacion del aviso de copyright y sin garantia. Conviene verificar la licencia del encoder base y de los datos de Xeno-Canto si se redistribuyen derivados.
- No hay informacion sobre el articulo completo referenciado en la model card; la tabla de resultados cita su Tabla 2 sin enlace directo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/georgeven/songmae-base-32x1-bird-detector
- Modelo base (encoder): https://huggingface.co/georgeven/songmae-base-32x1
- Detector Large: https://huggingface.co/georgeven/songmae-large-32x1-bird-detector
- Coleccion SongMAE: https://huggingface.co/collections/georgeven/songmae-a-bioacoustic-encoder-for-birdsong-6a91eb9c42e5cde53962fbec
- Codigo del detector (birdsong-detect-distill): https://github.com/georgevenven/birdsong-detect-distill
- Repositorio SongMAE: https://github.com/georgevenven/SongMAE
- Trabajo relacionado sobre deteccion de canto de aves en Donana (arXiv): https://arxiv.org/html/2503.15576v1
- Resumen del trabajo anterior (arXivLens): https://arxivlens.com/explained/a-bird-song-detector-for-improving-bird-identification-through-deep-learning-a-case-study-from-donana-5774-2738717
