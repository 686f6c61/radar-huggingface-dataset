# georgeven/songmae-micro-32x1-bird-detector

## Resumen

SongMAE-Micro 32x1 bird detector es un detector de eventos sonoros bioacústicos publicado por el usuario georgeven en HuggingFace. Consiste en un ajuste fino del codificador SongMAE-Micro 32x1 (1.621.664 parámetros reales según el archivo safetensors del repositorio) al que se añade una cabeza lineal: para cada trama de 5 ms y cada una de las 128 bandas mel del rango 20-16.000 Hz, el modelo estima la probabilidad de que esa celda tiempo-frecuencia corresponda a una vocalización de ave. No es un modelo generativo ni un clasificador de especies: su salida es una máscara tiempo-frecuencia.

La particularidad del entrenamiento es que no se usaron etiquetas humanas. Las anotaciones provienen de un modelo vision-lenguaje profesor, Qwen3.8-27B en cuantización Q8_0 sobre llama.cpp, que dibuja cajas delimitadoras sobre espectrogramas viridis de 5 segundos de grabaciones de Xeno-Canto (BirdSet XCL) apoyándose en ejes de coordenadas, razonamiento en cadena y una pasada numerada de autorrevisión. El codificador base pertenece a la familia SongMAE, descrita en el artículo asociado como un MAE-ViT (Masked Autoencoder Vision Transformer) preentrenado con reconstrucción enmascarada de espectrogramas mel.

Su interés práctico reside en el tamaño: 1,62 M de parámetros, licencia MIT y ejecución viable en CPU, lo que permite desplegar detección de actividad vocal en dispositivos de bajo coste o prefiltrar grandes archivos de audio antes de un clasificador de especies. Como contrapartida, el repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta, y la model card indica que este detector Micro solo se evaluó en el conjunto de desarrollo Powdermill: los resultados cuantitativos publicados en la Tabla 2 del artículo corresponden al detector SongMAE-Large y a las líneas base YOLO11 y BirdCODE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MAE-ViT (Masked Autoencoder Vision Transformer) sobre espectrogramas mel, con cabeza lineal de detección; según el artículo asociado al codificador SongMAE |
| Parámetros totales | 1.621.664 (dato del archivo safetensors); el repositorio base georgeven/songmae-micro-32x1 figura con 1,75 M en la colección del autor |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica como contexto de texto. Entrada de audio procesada en tramas de 5 ms; la model card no especifica límite de duración de grabación |
| Tipos de cuantización | No disponible. Se distribuyen pesos en safetensors; no se documenta cuantización ni precisión de almacenamiento |
| Idiomas soportados | No aplica (modelo de audio bioacústico). El campo de idiomas del repositorio no está disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería declarada: PyTorch) |
| Tarea | Detección de eventos sonoros / localización tiempo-frecuencia de vocalizaciones de ave |
| Resolución de salida | 128 bandas mel x tramas de 5 ms; máscara de probabilidad por celda |
| Rango de frecuencias | 20-16.000 Hz |
| Frecuencia de muestreo de entrada | 32.000 Hz, mono (según el ejemplo de uso con librosa) |
| Modelo base | georgeven/songmae-micro-32x1 (ajuste fino) |
| Puntos de control | 3 semillas (--seed 0, 1 o 2), cada una con umbral calibrado propio |
| Repositorio | 0 descargas, 0 likes, tamaño 0,0 GB en el momento de la consulta |
| Fecha de creación en HuggingFace | 2026-09-24 (última actualización: 2026-09-24, según metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo reutiliza un codificador SongMAE-Micro 32x1, descrito en la documentación del autor como un MAE-ViT compacto que opera sobre espectrogramas mel con resolución temporal de 2 ms en su preentrenamiento mediante reconstrucción enmascarada de espectrogramas. Sobre ese codificador congelado o ajustado se coloca una cabeza lineal que produce, celda a celda, una probabilidad de vocalización. La detección final se obtiene aplicando un umbral calibrado por semilla y agrupando celdas en regiones con inicio, fin, frecuencia inferior, frecuencia superior y probabilidad máxima. El nombre "32x1" no se explica en la información disponible.

El entrenamiento no emplea anotación humana. Un profesor vision-lenguaje (Qwen3.8-27B, cuantización Q8_0, llama.cpp) dibuja cajas sobre espectrogramas viridis de 5 segundos de grabaciones de Xeno-Canto (BirdSet XCL), usando ejes de coordenadas, razonamiento en cadena y una pasada de autorrevisión numerada. El resultado es un detector destilado de etiquetas sintéticas. La model card no detalla el número de tokens, horas de audio, composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables a esta tarea, pero no se documenta alternativa alguna). Tampoco se especifica el procedimiento de calibración del umbral más allá de que es distinto para cada semilla.

## Capacidades

- Detección de actividad vocal de ave: genera una probabilidad por cada celda de 128 bandas mel y trama de 5 ms.
- Localización tiempo-frecuencia: produce regiones con `start_s`, `end_s`, `low_hz`, `high_hz` y `peak_probability`, exportables a CSV.
- Segmentación enmascarada: además de la probabilidad, devuelve una máscara binaria según el umbral calibrado.
- Procesamiento de grabaciones completas en formato de onda, con salida en `.npz` y `.csv` por archivo de entrada.
- Ejecución en CPU o GPU (`--device cpu` o `cuda`), lo que habilita despliegue en equipos sin acelerador.
- Uso como extractor de representaciones a través del codificador base SongMAE, según la documentación de la colección del autor.
- Integración en Python mediante las funciones `load`, `probabilities` y `regions` del script `detect.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, generación de texto, visión ni audio de entrada distinto de formas de onda.

## Casos de uso

- Monitorización acústica pasiva en reservas o parques eólicos: el detector procesa grabaciones continuas y entrega intervalos con vocalización, reduciendo el volumen de audio que un anotador humano debe revisar. Su coste computacional es mínimo al tener 1,62 M de parámetros.
- Prefiltrado previo a un clasificador de especies: al separar celdas con actividad vocal del ruido de fondo, actúa como primera etapa de una arquitectura en cascada en la que un clasificador más costoso solo se ejecuta sobre las regiones detectadas.
- Anotación asistida de nuevos corpus: el CSV de regiones sirve como propuesta inicial que un experto corrige, aprovechando que el modelo se entrenó precisamente sobre etiquetas automáticas de un profesor vision-lenguaje.
- Curación de archivos de Xeno-Canto: segmentar grabaciones largas en fragmentos con canto permite construir subconjuntos de entrenamiento o evaluación a partir de material ya disponible.
- Despliegue en dispositivos de borde o trampas acústicas: 1,62 M de parámetros permiten inferencia en CPU y en hardware embebido, con salida compacta en forma de regiones.
- Detección de vocalizaciones atípicas o poco representadas: al no depender de un conjunto cerrado de etiquetas de especie, el detector marca actividad vocal aunque la especie no esté cubierta por un detector supervisado. La colección del autor atribuye esta propiedad al codificador SongMAE y a sus representaciones.
- Estudios de variación del canto: la documentación del codificador base menciona el seguimiento de cambios estacionales, el desarrollo juvenil, el mapeo de dialectos y la detección de especies raras mediante representaciones congeladas y sondas baratas.
- Línea base en experimentos de destilación: sirve como referencia de un detector entrenado sin etiquetas humanas frente a alternativas como YOLO11 entrenado con anotación manual.

## Benchmarks y rendimiento

La información disponible incluye la Tabla 2 del artículo del autor, con localización en conjuntos de prueba retenidos (WABAD y Hawaii: AP e IoU a nivel de píxel; XC-AJ y NIPS4Bplus: localización de inicio y fin a nivel de trama). Los modelos entrenados con etiquetas del profesor se promedian sobre tres semillas.

| Modelo | WABAD AP | WABAD IoU | Hawaii AP | Hawaii IoU | XC-AJ AP | XC-AJ IoU | NIPS4Bplus AP | NIPS4Bplus IoU |
|---|---|---|---|---|---|---|---|---|
| BirdCODE | — | — | — | — | 0,836 | 0,526 | 0,657 | 0,545 |
| YOLO11n (etiquetas humanas) | 0,552 | 0,347 | 0,541 | 0,369 | 0,700 | 0,546 | 0,630 | 0,455 |
| YOLO11l (etiquetas humanas) | 0,549 | 0,354 | 0,546 | 0,381 | 0,676 | 0,556 | 0,590 | 0,464 |
| YOLO11n (etiquetas del profesor) | 0,566 | 0,348 | 0,619 | 0,412 | 0,769 | 0,512 | 0,749 | 0,468 |
| YOLO11l (etiquetas del profesor) | 0,568 | 0,359 | 0,604 | 0,400 | 0,774 | 0,518 | 0,748 | 0,532 |
| SongMAE-Large (etiquetas del profesor) | 0,633 | 0,385 | 0,716 | 0,479 | 0,836 | 0,529 | 0,777 | 0,488 |

Advertencias sobre esta tabla: la fila SongMAE corresponde al detector Large (georgeven/songmae-large-32x1-bird-detector), no al Micro. La model card indica de forma explícita que este detector Micro solo fue evaluado en el conjunto de desarrollo Powdermill y no publica cifras propias en los cuatro conjuntos de prueba anteriores. Por tanto, no hay resultados de benchmarks de este modelo concreto en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, 1.621.664 parámetros en fp32 ocupan aproximadamente 6,5 MB, por lo que los pesos caben holgadamente en cualquier GPU y el consumo lo determinan las activaciones del espectrograma, no el modelo.
- GPU recomendadas: no se especifica ninguna. Cualquier GPU con CUDA es suficiente; no se requiere A100 ni H100.
- CPU: el script admite `--device cpu` de forma explícita, por lo que la inferencia no requiere acelerador.
- GPU de consumo: cabe sin problema en tarjetas de gama baja o integradas; no se publican cifras de latencia ni de throughput que permitan estimar el rendimiento real.
- Opciones de despliegue: script propio `detect.py` descargado con `hf download` y ejecutado con PyTorch. Dependencias: `torch`, `transformers>=4.36,<5`, `librosa`, `scipy`, `safetensors` y `huggingface_hub`. No se documenta soporte para vLLM, Ollama, TGI ni llama.cpp (destinados a modelos generativos).
- Salidas por ejecución: `predictions/recording.npz` (probabilidad y máscara, 128 bandas mel x tramas de 5 ms) y `predictions/recording.csv` (una fila por región detectada).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Tamaño | Enfoque de etiquetado | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SongMAE-Micro 32x1 bird detector | Detección tiempo-frecuencia | 1.621.664 parámetros | Etiquetas de profesor vision-lenguaje | Sin cifras en los cuatro conjuntos de prueba; solo conjunto de desarrollo Powdermill | MIT | HuggingFace, 0 descargas |
| SongMAE-Large 32x1 bird detector | Detección tiempo-frecuencia | No disponible en la información | Etiquetas de profesor vision-lenguaje | AP 0,633 en WABAD; 0,716 en Hawaii; 0,836 en XC-AJ; 0,777 en NIPS4Bplus | No disponible | HuggingFace |
| YOLO11n | Detección en imagen (espectrograma) | No disponible en la información | Etiquetas humanas o del profesor (dos variantes comparadas) | Con etiquetas del profesor: AP 0,566 en WABAD; 0,619 en Hawaii; 0,769 en XC-AJ; 0,749 en NIPS4Bplus | No disponible | Público |
| BirdCODE | Detección de eventos sonoros | No disponible en la información | No disponible | AP 0,836 en XC-AJ; 0,657 en NIPS4Bplus; sin datos de WABAD ni Hawaii | No disponible | Público |

Los parámetros de YOLO11n, YOLO11l y BirdCODE no figuran en la información proporcionada, por lo que no se incluyen cifras orientativas.

## Limitaciones y advertencias

- Ausencia de resultados propios: la model card solo menciona evaluación en el conjunto de desarrollo Powdermill, sin cifras. No es posible afirmar su rendimiento en WABAD, Hawaii, XC-AJ o NIPS4Bplus.
- Etiquetas sintéticas: todo el entrenamiento se apoya en anotaciones de un modelo vision-lenguaje sobre espectrogramas. Los errores sistemáticos del profesor (cajas desplazadas, falsos positivos en ruido) pueden heredarse.
- Dependencia del profesor: el rendimiento está condicionado por la calidad del etiquetado de Qwen3.8-27B en Q8_0 y por el procedimiento de autorrevisión, que no se detalla cuantitativamente.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta. No hay informes independientes de terceros.
- Salida no taxonómica: detecta actividad vocal, no especie. Confundir su salida con una clasificación de especie es un error de uso.
- Rango espectral limitado: 20-16.000 Hz. Las vocalizaciones fuera de ese rango (por ejemplo, componentes de muy baja frecuencia o ultrasonidos) no se representan.
- Entrada limitada a 32 kHz mono según el ejemplo de uso; no se documenta comportamiento con otras frecuencias de muestreo, mezclas estéreo o audio con fuerte ruido antropogénico.
- Umbral dependiente de la semilla: el valor de `--threshold` está calibrado por punto de control, de modo que mezclar semillas sin recalibrar puede alterar el equilibrio entre precisión y exhaustividad.
- Sesgos: no se documenta ningún análisis de sesgo por especie, hábitat, geografía, calidad de grabación o tipo de micrófono.
- Sin información sobre robustez: no hay datos de degradación ante ruido de fondo, solapamiento de cantos o grabaciones de baja relación señal-ruido.
- Licencia MIT: permite uso comercial y modificación, pero no exime de verificar las licencias de los datos de origen (Xeno-Canto y BirdSet XCL tienen sus propias condiciones).
- Discrepancia de resolución temporal: el artículo del codificador menciona espectrogramas con resolución de 2 ms, mientras que este detector trabaja con tramas de 5 ms. Conviene tenerlo en cuenta al comparar con otros detectores.
- Fecha de creación del repositorio: los metadatos indican 2026-09-24, posterior a la fecha habitual de consulta; conviene verificar la vigencia del identificador antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/georgeven/songmae-micro-32x1-bird-detector
- Modelo base (codificador): https://huggingface.co/georgeven/songmae-micro-32x1
- Detector SongMAE-Large: https://huggingface.co/georgeven/songmae-large-32x1-bird-detector
- Colección SongMAE: https://huggingface.co/collections/georgeven/songmae-a-bioacoustic-encoder-for-birdsong-6a91eb9c42e5cde53962fbec
- Repositorio de código del detector: https://github.com/georgevenven/birdsong-detect-distill
- Repositorio del codificador SongMAE: https://github.com/georgevenven/SongMAE
- Artículo (OpenReview): https://openreview.net/pdf?id=8mluzLyvyV
- Ficha del modelo en bio.rodeo: https://bio.rodeo/models/songmae
