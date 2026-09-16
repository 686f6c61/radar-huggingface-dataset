# james-yusuke/jalo

## Resumen

JALO v0.1.0 es un modelo de segmentación de instancias de vehículos desarrollado por el usuario james-yusuke, pensado para colorear el contorno visible de turismos, furgonetas, camiones y autobuses en vídeos de conducción. No es un modelo de lenguaje: es un modelo de visión por computador de una sola pasada por fotograma, distribuido como checkpoint PyTorch propietario (`jalo-local-vehicles-evaluated.pt`) y diseñado para ejecutarse dentro de la propia implementación JALO, disponible en GitHub. Su relevancia actual es acotada: se presenta explícitamente como una versión de investigación que todavía no alcanza sus objetivos de calidad de reconocimiento, y su interés principal es metodológico (arquitectura propia con consultas posicionadas y cabezas de máscara locales sobre un backbone ligero) más que de producto.

La arquitectura interna se identifica como `vehicle_roi_v2`, con extracción de características basada en ResNet-18 preentrenada en ImageNet y sin reutilizar pesos preentrenados de detectores o segmentadores existentes. Se distribuye un único checkpoint de 60.782.762 bytes que contiene pesos y la configuración de inferencia, pero no el estado del optimizador ni datos para reanudar el entrenamiento. El modelo trabaja con entradas de 544 × 960 píxeles manteniendo la relación de aspecto con relleno y predice tres clases: `car` (que agrupa furgonetas), `truck` y `bus`.

El proyecto reinicia su numeración de versiones en v0.1.0 sin entrenamiento adicional respecto a la versión inmediatamente anterior. Está publicado bajo licencia MIT, con cero descargas y cero likes en el momento de la consulta, y toda su documentación está redactada en japonés. Los resultados de evaluación publicados por el autor son honestos y muestran un recall de vehículos por debajo del objetivo en validación (63,2 %) y en la evaluación final (75,7 %), con un rendimiento especialmente débil en vehículos pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `vehicle_roi_v2` (red de segmentación de instancias con implementación propia de consultas posicionadas, atención y cabezas de máscara locales por vehículo; backbone de extracción ResNet-18) |
| Parametros totales | no disponible; el checkpoint ocupa 60.782.762 bytes, lo que da un límite superior aproximado de 15,2 millones de parámetros si todos los pesos estuvieran en coma flotante de 32 bits (estimación propia, no confirmada por el autor) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de visión sobre un único fotograma; el seguimiento temporal lo aporta ByteTrack en el pipeline externo, no el modelo) |
| Tipos de cuantizacion | no disponible; solo se distribuye el checkpoint PyTorch en coma flotante, sin variantes cuantizadas documentadas |
| Idiomas soportados | no aplica (modelo de visión; no procesa lenguaje natural). La documentación está en japonés |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), archivo `jalo-local-vehicles-evaluated.pt`; SHA-256 `c592301a49ea72ab891aacc8b97b1b5ee1ff990200bd49a387588faf24db832f` |
| Tarea | Segmentación de instancias, fotograma único (`pipeline_tag`: image-segmentation) |
| Clases | `car` (incluye furgonetas), `truck`, `bus` |
| Tamano de entrada | 544 de alto × 960 de ancho, con relleno para mantener la relación de aspecto |
| Configuracion de dibujo | Confianza de clase 0,3; probabilidad de máscara local y primer plano del vehículo 0,5; opacidad 45 % |
| Version | v0.1.0 (reinicio de numeración; mismos pesos y mismas métricas que la versión anterior sin renumerar) |
| Entorno verificado | Mac con MPS; CUDA no verificado en hardware real |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion / actualizacion | 16 de septiembre de 2026 (ambas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un backbone ResNet-18 preentrenada en ImageNet como extractor de características externo con componentes propios: consultas con información de posición, mecanismo de atención y cabezas de máscara locales por vehículo. El autor indica explícitamente que no se reutilizaron pesos preentrenados de modelos de detección o segmentación existentes, salvo la ResNet-18 de ImageNet. Los pesos distribuidos heredan del prototipo antiguo entrenado sobre COCO (con numeración previa `v0.1.1`) y se sometieron a un ajuste adicional con vídeos de conducción. La instantánea seleccionada corresponde a las 4.000 actualizaciones de la fase de entrenamiento que utiliza todas las anotaciones, elegida sobre un vídeo de validación reservado.

El conjunto de datos mezcla en proporción 1:1 2.000 imágenes del `train` oficial de COCO 2017 con 190 fotogramas anotados extraídos de vídeos de conducción. La partición se hizo a nivel de vídeo para evitar filtración: dos vídeos para entrenamiento (95 fotogramas cada uno: "I-495" y "Broad Creek → Jennifer Road", ambos de Illegitimate Barrister, CC BY-SA 4.0), un vídeo para validación y selección de modelo (95 fotogramas de "Leaman Farm Road → Game Preserve Road", CC BY-SA 4.0) y un vídeo para evaluación final no visto (55 fotogramas de una conducción en Wonju, Corea del Sur, de Choi Kwang-mo, CC0 1.0). El autor señala que las anotaciones de referencia fueron generadas por IA y verificadas visualmente por IA sobre la superposición de todas las imágenes, y que no han pasado una validación humana independiente. También indica que un vídeo japonés de giro a la derecha descartado por dudas de derechos de autor, y los pesos ajustados con él, no se han utilizado. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión.

## Capacidades

- Segmentación de instancias de vehículos en un único fotograma de vídeo, con predicción de máscara por vehículo visible.
- Clasificación en tres categorías: `car` (agrupando furgonetas), `truck` y `bus`.
- Integración con seguimiento multiobjeto mediante ByteTrack en el pipeline JALO, lo que permite asignar un color semitransparente distinto por identificador de seguimiento y mantener la coherencia temporal a nivel de pipeline.
- Entrada de 544 × 960 con relleno que preserva la relación de aspecto, lo que permite procesar vídeos con resoluciones y formatos variados sin recortes destructivos.
- Umbrales de decisión configurables a través de la configuración guardada en el propio checkpoint: confianza de clase (0,3 por defecto), probabilidad de máscara local y primer plano (0,5) y opacidad de dibujo (45 %).
- No dispone de generación de texto, razonamiento, generación de código, matemáticas, tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingües.
- No procesa audio, texto ni otras modalidades; su única entrada es imagen y su única salida son máscaras e identificadores de clase.

## Casos de uso

- Preanotación de conjuntos de datos de tráfico: el modelo puede generar máscaras de vehículo por fotograma para que un anotador humano las revise y corrija, reduciendo el coste de etiquetado. Es adecuado por su precisión de píxel coloreado (94,1 % en la evaluación final) y por su recall moderado (75,7 %), que hace obligatoria la revisión humana pero acelera el trabajo inicial.
- Investigación en segmentación con backbone ligero: sirve como punto de partida reproducible para estudiar el efecto de consultas posicionadas, atención y cabezas de máscara locales sobre una ResNet-18, con la ventaja de que el checkpoint es idéntico byte a byte al de la release de GitHub y lleva SHA-256 publicado.
- Prototipado de analítica de tráfico por clase: combinado con ByteTrack, permite contar y clasificar vehículos en tres categorías a lo largo de un vídeo, útil para pruebas de concepto de aforo o caracterización de flota, siempre que se validen previamente las tasas de omisión en el dominio concreto.
- Visualización didáctica y divulgativa: el pipeline dibuja el contorno de cada vehículo con opacidad del 45 % y color por identificador de seguimiento, lo que produce material gráfico claro para explicar segmentación de instancias y seguimiento en clase o en demostraciones.
- Auditoría de rendimiento por tamaño y por clase: dado que el autor publica métricas desglosadas por tamaño de vehículo (recall del 21,1 % en objetos con lado menor de 32 píxeles) y por clase, el modelo puede utilizarse como caso de estudio de evaluación estratificada y de detección de sesgos de escala en segmentación.
- Generación de datos sintéticos etiquetados para destilación: las máscaras generadas sobre grandes volúmenes de vídeo sin etiquetar pueden servir como pseudoetiquetas para entrenar un modelo mayor o más específico, asumiendo el ruido documentado (huecos en la carrocería, desbordamiento sobre la calzada y duplicidad de colores en un mismo vehículo).
- Construcción de un banco de pruebas de despliegue en Apple Silicon: al estar verificado únicamente en Mac con MPS, resulta un caso práctico para medir latencia y consumo en ese entorno frente a alternativas CUDA, aunque el autor no haya validado CUDA en hardware real.
- Filtrado previo de fotogramas relevantes en un pipeline de vídeo: usar la presencia de máscaras por encima del umbral como señal barata (checkpoint de 60,8 MB) para descartar tramos sin vehículos antes de aplicar modelos más costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de visión como COCO mAP sobre el conjunto oficial) en la información disponible. El autor publica métricas propias medidas con el pipeline de coloreado real, incluido ByteTrack, y evaluadas en los instantes anotados.

| Metrica | Video de validacion | Video de evaluacion final (no visto) | Objetivo declarado |
|---|---:|---:|---:|
| Precisión de píxel coloreado | 96,5 % | 94,1 % | ≥ 90 % |
| Recall de vehículos (lado mayor ≥ 32 px) | 63,2 % (282/446) | 75,7 % (109/144) | ≥ 80 % |
| Tasa de coloreado erróneo sobre píxel de fondo | 0,450 % | 0,171 % | ≤ 0,5 % |
| Tasa de coloreado erróneo sobre píxel del interior del vehículo | sin casos | 0,017 % | ≤ 0,5 % |

Datos adicionales aportados por el autor: antes del seguimiento, la evaluación final arroja una AP de caja del 31,26 % y una AP de máscara del 30,64 %. El recall en la evaluación final para vehículos con lado menor de 32 píxeles es del 21,1 % (4/19), lo que confirma que las omisiones se concentran en objetos pequeños. El autor advierte que los vídeos de evaluación contienen ediciones, compresión temporal y tramos de composición similar, por lo que estos valores no deben extrapolarse como rendimiento en carreteras desconocidas; tampoco se realizó una pasada completa del vídeo antes de superar el criterio de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 60,8 MB y el backbone es una ResNet-18, por lo que la huella de pesos es inferior a 1 GB en coma flotante de 32 bits; el consumo dominante son las activaciones a 544 × 960. Una estimación razonable para lote de tamaño 1 se sitúa en el rango de 1 a 2 GB de VRAM (estimación propia, no publicada por el autor).
- GPU recomendadas: no hay recomendaciones publicadas. El único entorno verificado por el autor es Mac con MPS; CUDA no se ha probado en hardware real, por lo que cualquier cifra de rendimiento en A100, H100 o RTX 4090 sería especulativa.
- Cabe en GPU de consumo: con ese tamaño de pesos y entrada, es previsible que funcione en GPUs de consumo con 4 GB o más de memoria, e incluso en CPU, pero no hay confirmación del autor sobre ningún modelo concreto.
- Opciones de despliegue: el modelo requiere la implementación JALO y su código de inferencia; el checkpoint no es directamente cargable con las clases estándar de `transformers`, pese a que el `pipeline_tag` sea `image-segmentation`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime, que en cualquier caso no aplican a este tipo de modelo.
- Aceleradores compatibles según el autor: Mac/MPS (verificado). CUDA: no verificado. Otros backends: no disponibles.
- Latencia y throughput: no disponibles; no se publican mediciones de tiempo por fotograma ni FPS en la información proporcionada.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. El autor menciona en la release de GitHub una comparación con el modelo anterior (el prototipo COCO con numeración antigua `v0.1.1`), pero no se incluyen cifras de esa comparación en la model card ni en los resultados de búsqueda.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JALO v0.1.0 | no disponible (checkpoint de 60.782.762 bytes) | Imagen de 544 × 960, un fotograma | Recall de vehículo 75,7 % y precisión de píxel 94,1 % en evaluación final propia | MIT (con condiciones de terceros para datos y pesos preentrenados) | HuggingFace y GitHub Release; requiere el código JALO |
| Modelos alternativos de segmentación de instancias (Mask R-CNN, YOLOv8-seg u otros) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Versión de investigación sin calidad de reconocimiento práctica: el propio autor afirma que no se ha alcanzado el objetivo de calidad utilizable y que persisten vehículos omitidos, carrocerías sin colorear por completo, desbordamiento del color sobre la calzada y un mismo vehículo pintado con varios colores.
- Recall insuficiente: 63,2 % en validación y 75,7 % en la evaluación final frente al objetivo del 80 %, incumplido en ambos casos.
- Rendimiento muy bajo en vehículos pequeños: recall del 21,1 % (4 de 19) para objetos con lado menor de 32 píxeles en la evaluación final, lo que limita su uso en escenas con tráfico lejano o resoluciones reducidas.
- Calidad de las anotaciones: las referencias fueron creadas por IA y verificadas visualmente por IA, sin validación humana independiente; las salidas del modelo no se usaron como verdad de referencia, pero el sesgo de anotación automática sigue presente.
- Riesgo de alucinación en sentido figurado: el modelo puede generar máscaras sobre regiones que no corresponden a un vehículo o extender la máscara fuera de la carrocería, con tasas de error de 0,450 % y 0,171 % sobre píxeles de fondo en validación y evaluación final respectivamente.
- Generalización no demostrada: la evaluación final se hizo sobre un único vídeo con ediciones, compresión temporal y composiciones repetidas; el autor pide explícitamente no interpretar los números como rendimiento en carreteras desconocidas.
- Sin validación de hardware en CUDA: solo se ha verificado en Mac/MPS, así que el comportamiento en GPUs NVIDIA, AMD o en despliegues en la nube es desconocido.
- Dependencia de código propio: el checkpoint no es utilizable sin la implementación JALO; no sigue las convenciones de `transformers` ni de bibliotecas de segmentación estándar, lo que complica su integración en producción.
- Sin datos sobre sesgos demográficos o geográficos: la información no documenta composición por país, condiciones meteorológicas, iluminación nocturna ni diversidad de vías, más allá de que los datos de entrenamiento y evaluación provienen de Estados Unidos y Corea del Sur.
- Idiomas: no aplica a la tarea, pero conviene tener en cuenta que toda la documentación está en japonés, lo que puede dificultar el mantenimiento por parte de equipos que no lo lean.
- Restricciones de licencia: el repositorio es MIT, pero los datos de entrenamiento incluyen vídeos con licencia CC BY-SA 4.0 (tres vídeos de Illegitimate Barrister), lo que puede imponer obligaciones de atribución y de compartir igual sobre obras derivadas, y el backbone parte de pesos de ImageNet con sus propias condiciones. El autor remite al README de GitHub para los términos exactos; conviene revisarlos antes de un uso comercial.
- Producción: no se ha generado una salida completa del vídeo de evaluación antes de superar los criterios de calidad, por lo que no hay evidencia de comportamiento estable en secuencias largas más allá de las métricas por instante anotado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/james-yusuke/jalo
- Descarga directa del checkpoint: https://huggingface.co/james-yusuke/jalo/resolve/main/jalo-local-vehicles-evaluated.pt?download=true
- Repositorio GitHub, versión v0.1.0 (código, instalación y ejecución sobre vídeo propio): https://github.com/james-yusuke/jalo/tree/v0.1.0
- Release de GitHub v0.1.0 (modelo idéntico byte a byte, comparativas de vídeo, comparación con el modelo anterior, recuentos por tamaño y clase, registros de reproducción y checkpoints de reanudación): https://github.com/james-yusuke/jalo/releases/tag/v0.1.0
- Vídeo de entrenamiento "I-495" (Illegitimate Barrister, CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Driving_eastbound_on_I-495_from_the_I-270_Spur_to_Cedar_Lane_(1_June_2026).webm
- Vídeo de entrenamiento "Broad Creek → Jennifer Road" (Illegitimate Barrister, CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Driving_from_Broad_Creek_to_Jennifer_Road_in_Annapolis,_Maryland_(1_June_2026).webm
- Vídeo de validación "Leaman Farm Road → Game Preserve Road" (Illegitimate Barrister, CC BY-SA 4.0): https://commons.wikimedia.org/wiki/File:Driving_from_Leaman_Farm_Road_to_Game_Preserve_Road_in_Gaithersburg,_Maryland_(1_June_2026).webm
- Vídeo de evaluación final en Wonju, Corea del Sur (Choi Kwang-mo, CC0 1.0): https://commons.wikimedia.org/wiki/File:2020-04-16_원주시_도로주행.webm
- Búsquedas web realizadas: no devolvieron ningún resultado relevante sobre este modelo. Los resultados obtenidos corresponden a la banda británica James (https://wearejames.com/ y https://en.wikipedia.org/wiki/James_(band)), a páginas de desambiguación del nombre y al perfil de un miembro del grupo CORTIS, sin relación con el modelo.
