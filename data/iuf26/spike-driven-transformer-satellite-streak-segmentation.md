# iuf26/spike-driven-transformer-satellite-streak-segmentation

## Resumen

SDT-SatStreak es un modelo de segmentación de imágenes basado en una red neuronal de impulsos (spiking neural network, SNN) diseñado para detectar y segmentar a nivel de píxel las estelas de satélites y de basura espacial en imágenes astronómicas de campo amplio. Lo publica el usuario iuf26 en HuggingFace y acompaña al artículo *Energy-Efficient Spike-driven Transformer for Satellite-Streak Segmentation in Space Surveillance* (Iulia Maria Istrate, 2026). Su problema objetivo es la contaminación de observaciones astronómicas por constelaciones de satélites y el seguimiento de desechos orbitales, donde la anotación por sensor es cara y el despliegue en hardware de bajo consumo es un requisito creciente.

Arquitectónicamente combina un backbone Spike-Driven Transformer V3 (SDT-V3) de 10 M de parámetros, inicializado desde un checkpoint preentrenado en ImageNet, con un cuello y una cabeza FPN cuantizados. El modelo completo tiene 11,5 M de parámetros, procesa teselas de 512x512 píxeles con solapamiento (paso 384), ejecuta 4 pasos temporales internos por forward pass y usa codificación de latencia para la entrada. Se entrenó en una única GPU de consumo (NVIDIA RTX 5070 Ti de 16 GB), lo que lo hace reproducible sin clústeres.

Su relevancia práctica está en dos factores: el bajo coste energético medido (1878 ± 20 mJ por inferencia en una RTX 5070 Ti, frente a los 0,63-1,38 mJ por fotograma publicados para un Akida AKD1000 en una carga comparable) y el enfoque de despliegue entre sensores sin etiquetas, que busca trasladar el modelo de un telescopio a otro instrumento sin anotaciones del sensor destino. La contrapartida es un rendimiento absoluto moderado: F1 a nivel de caja de 0,176 a IoU 0,50 en evaluación cross-sensor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SDT-V3 10M backbone + cuello QFPN + QFPNHead (red neuronal de impulsos, 4 pasos temporales, codificación de latencia) |
| Parámetros totales | 11,5 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: modelo de visión; entrada de 512x512 píxeles por tesela, paso 384, resolución total sin límite superior |
| Tipos de cuantización | No disponible (la model card indica que el cuello y la cabeza FPN están cuantizados, sin especificar el esquema) |
| Idiomas soportados | No aplica (modelo de segmentación de imágenes; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (la librería declarada es PyTorch, pero la model card no especifica el formato; el repositorio figura con 0,0 GB) |
| Clases de salida | 2 (fondo, estela) |
| Codificación de entrada | Latency coding |
| Pasos temporales (T) | 4 |
| Framework | PyTorch, sin mmseg / mmcv ni CUDA personalizado |
| Precisión de entrada | 8 bits por canal, RGB, valores 0-255 (se aplica normalización ImageNet internamente) |

## Arquitectura y entrenamiento

El modelo parte de un backbone Spike-Driven Transformer V3 de 10 M de parámetros con pesos preentrenados en ImageNet, al que se añade un cuello FPN cuantizado y una cabeza QFPNHead para producir mapas de probabilidad por píxel. En cada forward pass se ejecutan 4 pasos temporales internos sobre una entrada codificada por latencia, lo que es característico de las SNN: la información se transmite como instantes de disparo en lugar de activaciones continuas. El diseño evita dependencias de mmseg, mmcv o kernels CUDA a medida, de modo que el modelo corre con PyTorch estándar.

El ajuste fino se hizo sobre recortes de 512x512 del dataset MeerLicht, con destilación de conocimiento desde un profesor U-Net ResNet-34. Se usó AdamW, tamaño de lote 8, precisión mixta y una pérdida que combina un término focal con un término Dice, elección motivada porque la clase de primer plano ocupa menos del 0,5 % de los píxeles. Todo el entrenamiento cupo en una RTX 5070 Ti de 16 GB.

La innovación más destacable no está en el backbone sino en la inferencia. El pipeline publicado encadena: coincidencia de histogramas por canal (solo cuando la imagen proviene de otro sensor, usando la CDF de referencia en `asta_reference_cdf.npy`), teselado con solapamiento, codificación por latencia con cuatro perturbaciones gamma (0,7, 0,9, 1,0 y 1,2), fusión mediante *Temporal Spike Coherence* (TSC) según `p * (0,5 + 0,5 * coherencia)`, donde la coherencia es `1 - desviación típica normalizada` entre las pasadas gamma, y finalmente umbralizado a 0,5 con componentes conexas de mínimo 16 píxeles. La hipótesis es que las estelas reales se mantienen estables bajo perturbaciones de intensidad mientras que el ruido del sensor parpadea y se suprime. El flag `use_tsc=False` desactiva la fusión, con una ejecución aproximadamente 4 veces más rápida y menor F1.

## Capacidades

- Segmentación semántica binaria a nivel de píxel de estelas de satélites y basura espacial en imágenes astronómicas.
- Detección a nivel de caja: el pipeline convierte la máscara en componentes conexas y exporta cajas delimitadoras en JSON.
- Generalización cross-sensor sin etiquetas del sensor destino, apoyada en coincidencia de histogramas contra una CDF de referencia.
- Robustez al ruido mediante fusión temporal de cuatro pasadas gamma (TSC).
- Procesamiento de imágenes de cualquier resolución mediante teselado con solapamiento (relleno de bordes para imágenes menores de 512 píxeles).
- Acepta PNG, JPEG, TIFF, BMP o arrays NumPy `[H, W, 3]` uint8; convierte escala de grises y RGBA automáticamente.
- Modo de ejecución única (`use_tsc=False`) para escenarios donde prima la velocidad sobre la precisión.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso textual ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo *thinking*, ni entrada de audio, ni generación de texto.

## Casos de uso

- Detección de estelas de satélites en archivos astronómicos: aplicar el modelo sobre imágenes de campo amplio para generar máscaras binarias que permitan enmascarar o restar las trazas antes del apilado de fotogramas, evitando que las constelaciones de satélites arruinen las exposiciones largas.
- Seguimiento de basura espacial con telescopios de baja cadencia: usar la salida a nivel de caja en JSON para alimentar un catálogo de objetos orbitales, aprovechando que el modelo devuelve tanto la probabilidad fusionada como las cajas.
- Despliegue en una red de telescopios heterogéneos: la coincidencia de histogramas permite reutilizar los pesos entrenados en MeerLicht sobre imágenes de otro instrumento sin anotar el sensor destino, lo que reduce el coste de puesta en marcha de cada nueva estación.
- Prefiltrado en pipelines de alerta temprana: ejecutar el modo `use_tsc=False` (unas 4 veces más rápido) para descartar rápidamente teselas sin estelas y reservar la pasada completa con TSC solo para los candidatos.
- Investigación en computación neuromórfica: al ser una SNN con codificación de latencia y pesos cuantizados, sirve como banco de pruebas para comparar consumo energético en GPU (1878 mJ por inferencia medidos) frente a aceleradores tipo Akida AKD1000 (0,63-1,38 mJ por fotograma en cargas comparables).
- Control de calidad de observaciones: detectar automáticamente fotogramas contaminados por trazas antes de incorporarlos a un archivo científico, generando además una superposición visual para revisión humana.
- Monitorización de constelaciones LEO: cuantificar la frecuencia de estelas por campo y franja horaria como insumo para estudios de impacto en astronomía óptica.
- Prototipado en hardware de consumo: al tener 11,5 M de parámetros y requerir solo PyTorch estándar, cualquier investigador con una GPU de gama media puede reproducir el pipeline completo.

## Benchmarks y rendimiento

Evaluación cross-sensor sobre 363 imágenes, F1 a nivel de caja tras conversión a componentes conexas, con coincidencia de histogramas aplicada:

| Configuración | F1 @ IoU 0,10 | F1 @ IoU 0,25 | F1 @ IoU 0,50 |
|---|---|---|---|
| SDT-SatStreak (sin TSC) | 0,324 | 0,230 | 0,139 |
| SDT-SatStreak + TSC | 0,328 | 0,240 | 0,176 |

Otros datos publicados:

| Métrica | Valor |
|---|---|
| F1 a nivel de píxel en validación del dominio origen (umbral 0,5) | 0,564 |
| F1 a nivel de píxel in-domain del baseline U-Net ResNet-34 | 0,613 |
| F1 cross-sensor del U-Net ResNet-34 a IoU 0,50 | 0,099 |
| Precisión cross-sensor del U-Net ResNet-34 a IoU 0,50 | 0,729 |
| Recall cross-sensor del U-Net ResNet-34 a IoU 0,50 | 0,186 |
| Energía por inferencia en RTX 5070 Ti | 1878 ± 20 mJ |
| Energía por fotograma publicada para Akida AKD1000 en carga comparable | 0,63-1,38 mJ |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, ya que el modelo no procesa texto. No se han publicado medidas de latencia ni de throughput en imágenes por segundo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 11,5 M de parámetros, los pesos ocupan del orden de decenas de MB en FP16/FP32; el consumo dominante es el de las activaciones del teselado a 512x512 con 4 pasos temporales y las 4 pasadas gamma. Cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: el autor validó entrenamiento e inferencia en una NVIDIA RTX 5070 Ti de 16 GB. Para inferencia es suficiente una GPU de consumo de gama media-alta (RTX 3060, RTX 4060, RTX 4090); para lotes grandes conviene una A100 o H100 por throughput agregado, no por memoria.
- Compatibilidad con GPU de consumo: sí, sin reservas. El propio entrenamiento se realizó en una GPU de consumo.
- Ejecución en CPU: posible, dado el tamaño reducido del modelo y la ausencia de dependencias CUDA personalizadas, aunque no hay cifras de rendimiento publicadas.
- Opciones de despliegue: PyTorch estándar mediante `predict.py` (`python predict.py --image field.png --output-dir out --histogram-match`) o la API de Python (`load_model`, `load_reference_cdf`, `predict`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles. El único dato cuantitativo es que desactivar TSC supone aproximadamente 4 veces menos cómputo. La energía medida por inferencia en una RTX 5070 Ti es de 1878 ± 20 mJ.

## Comparativa con modelos similares

La información disponible solo permite comparar con el baseline usado en el propio artículo. No se han encontrado en la búsqueda otros modelos comparables de segmentación de estelas de satélite.

| Modelo | Parámetros | Enfoque | F1 píxel in-domain | F1 cross-sensor @ IoU 0,50 | Licencia |
|---|---|---|---|---|---|
| SDT-SatStreak | 11,5 M | SNN (SDT-V3 + QFPN), 4 timesteps, TSC | 0,564 | 0,176 | Apache-2.0 |
| U-Net ResNet-34 (baseline del artículo) | No disponible | CNN densa con profesor de destilación | 0,613 | 0,099 | No disponible |
| SDT-V3 10M | 10 M | Backbone SNN preentrenado en ImageNet | No aplica | No aplica | No disponible |

El patrón que muestran los datos es el esperado en este tipo de trabajo: el baseline convolucional es superior dentro del dominio de origen, pero su rendimiento se desploma al cambiar de sensor (0,099 frente a 0,176 a IoU 0,50), mientras que la SNN propuesta degrada menos. A IoU bajo la diferencia es mínima (0,324 sin TSC y 0,328 con TSC frente a los valores del baseline no publicados en ese umbral).

## Limitaciones y advertencias

- Rendimiento absoluto modesto: el mejor F1 a nivel de caja a IoU 0,50 es 0,176, insuficiente para un uso automatizado sin revisión humana o sin etapas de filtrado posteriores.
- Solo admite imágenes de 8 bits por canal. Las imágenes astronómicas de 16 bits o coma flotante deben estirarse previamente; si se pasan directamente a Pillow, todos los valores por encima de 255 se recortan y la imagen queda blanca. La función `prepare_image()` lanza un `ValueError` en ese caso.
- La escala angular no es libre: el modelo se entrenó con recortes de 512x512 a una escala de píxel concreta, y una estela mucho más ancha o más fina en píxeles que la distribución de entrenamiento queda fuera de su dominio. No se especifica el rango tolerado.
- El estiramiento de intensidad elegido por el usuario afecta a los resultados; se recomienda uno comparable a la CDF de referencia incluida y mantener `--histogram-match` activado en trabajos cross-sensor.
- La información de color no se aprovecha de forma significativa: se entrenó con fotogramas astronómicos de aspecto gris almacenados como RGB, y la escala de grises se replica en los tres canales.
- Fuente de entrenamiento única (dataset MeerLicht) y destilación desde un profesor concreto; no hay validación publicada en otros instrumentos más allá de la evaluación cross-sensor de 363 imágenes.
- El coste de la fusión TSC es alto: multiplica por cuatro las pasadas de inferencia sobre cada tesela, y su ganancia en F1 es pequeña (de 0,139 a 0,176 a IoU 0,50). Es un compromiso que conviene evaluar por caso.
- Riesgo de falsos positivos por fuentes puntuales brillantes, trazas de rayos cósmicos o defectos del sensor, dado el umbral fijo de 0,5 y el mínimo de 16 píxeles por componente conexa.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero no se especifica el formato exacto de los pesos ni si el checkpoint está efectivamente subido: el repositorio figura con 0,0 GB y con 0 descargas y 0 likes.
- Las dependencias se instalan con `pip install -r requirements.txt` y el código se importa desde el propio repositorio descargado, lo que implica revisar el código antes de integrarlo en producción.
- No se documentan sesgos en el sentido habitual de los modelos de lenguaje, pero sí un sesgo de dominio claro: el rendimiento depende de que la distribución de intensidades y la escala de la imagen se parezcan a las del conjunto de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iuf26/spike-driven-transformer-satellite-streak-segmentation
- Artículo asociado: *Energy-Efficient Spike-driven Transformer for Satellite-Streak Segmentation in Space Surveillance* (Iulia Maria Istrate, 2026). No se ha encontrado URL en la información disponible.
- Repositorio de código: no disponible como enlace independiente; el código de inferencia (`predict.py`, `pipeline.py`, `asta_reference_cdf.npy`) se distribuye dentro del propio repositorio de HuggingFace.
- Otras referencias: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo, su artículo ni modelos comparables, por lo que no hay enlaces adicionales que listar.
