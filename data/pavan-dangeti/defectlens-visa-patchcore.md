# pavan-dangeti/defectlens-visa-patchcore

## Resumen

DefectLens VisA PatchCore es una colección de pesos de detección de anomalías industriales basada en PatchCore, publicada por el desarrollador pavan-dangeti. No es un modelo generativo ni un transformer de lenguaje: es un conjunto de bancos de memoria de características (memory banks) por categoría de producto, pensados para inspección visual de piezas manufacturadas. El modelo se entrena exclusivamente con imágenes de piezas correctas, sin ejemplos defectuosos, lo que lo sitúa en el paradigma de detección de anomalías no supervisada.

Técnicamente, el sistema congela un backbone WideResNet-50 preentrenado en ImageNet-1k (pesos `racm_in1k` de timm), extrae características de las capas 2 y 3, las agrupa y concatena en descriptores de 1536 dimensiones por parche, y reduce el banco nominal mediante selección de coreset con k-centros voraz. La puntuación de cada parche es la distancia a su vecino más cercano en el banco. La entrada es una imagen RGB de 224×224 y la salida incluye una puntuación de anomalía a nivel de imagen, un mapa de puntuaciones por píxel y una decisión binaria `good`/`anomaly` calibrada por categoría.

Su relevancia es práctica: cubre las 12 categorías del dataset VisA de Amazon Science y ofrece un punto de partida para líneas de producción nuevas en las que aún no existen datos de defectos. Ahora bien, el propio autor documenta tasas de escape elevadas en varias categorías, por lo que el modelo debe entenderse como una herramienta de triaje y no como un sustituto de la inspección humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PatchCore sobre backbone WideResNet-50-2 (timm `wide_resnet50_2.racm_in1k`), sin cabezal entrenado; banco de memoria de parches con coreset k-centros |
| Parametros totales | No disponible (los pesos distribuidos son bancos de características, no pesos de red; el backbone se descarga por separado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (visión; entrada de 256×256 redimensionada y recorte central de 224×224) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; el artefacto es un `torch.save` con coreset, umbral y configuración) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | CC BY 4.0 (los pesos derivan de VisA, también CC BY 4.0); backbone Apache-2.0 descargado en tiempo de ejecución |
| Formato de pesos | Diccionario `torch.save` cargado con `weights_only=True`, con sidecar SHA-256 por fichero; tamaño del repo 0.3 GB |
| Dimension de caracteristicas por parche | 1536 (concatenación de capas 2 y 3, con average pooling) |
| Ratio de coreset | 0.01 en todas las categorías (`configs/coreset.yaml`) |
| Umbral de decision | Calibrado sobre el 10% reservado de imágenes buenas para una tasa de falso rechazo objetivo del 1% |
| Categorias cubiertas | 12 categorías de VisA |
| Version | 1.0.0 |

## Arquitectura y entrenamiento

El método sigue el diseño PatchCore: un extractor de características congelado (WideResNet-50-2 preentrenado en ImageNet-1k con la receta RACM de *ResNet Strikes Back*) produce embeddings locales de parches a partir de las capas intermedias 2 y 3. Tras average pooling y concatenación, cada parche queda representado por un vector de 1536 dimensiones. El banco de memoria nominal se construye con los descriptores de los parches de imágenes buenas y se subsamplea al 1% mediante selección de coreset por k-centros voraz, lo que reduce el coste de inferencia manteniendo cobertura del espacio nominal. La puntuación de anomalía de un parche de test es la distancia euclídea a su vecino más cercano del banco.

El entrenamiento no implica optimización de pesos: es un ajuste de banco de memoria más una calibración de umbral. Los datos provienen del dataset VisA de Amazon Science (12 categorías, licencia CC BY 4.0), usando únicamente las imágenes buenas del split de entrenamiento. El reparto es 80% para ajuste del banco y 10% para calibración del umbral, con semilla 0; el 10% restante se reserva. La evaluación se repite con tres semillas (0, 1, 2) que redibujan el split 80/10/10. Los pesos almacenan vectores de características, no las imágenes originales. No se incluyen pesos ajustados sobre MVTec AD, que solo se usa como referencia de investigación por su licencia no comercial.

## Capacidades

- Detección de anomalías a nivel de imagen: produce una puntuación escalar de anomalía por imagen.
- Localización a nivel de píxel: genera un mapa de puntuaciones que señala las regiones sospechosas.
- Decisión binaria calibrada: clasifica cada imagen como `good` o `anomaly` según un umbral por categoría ajustado a una tasa de falso rechazo del 1%.
- Aprendizaje solo con imágenes buenas: no requiere ejemplos defectuosos para el ajuste ni para la calibración.
- Preprocesado robusto de formatos: convierte imágenes en escala de grises, CMYK y paleta a RGB antes de la inferencia.
- Cobertura de 12 categorías de producto del dataset VisA.
- Verificación de integridad: cada artefacto incluye un sidecar SHA-256 que el servicio comprueba antes de cargar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, por tratarse de un modelo de visión especializado.

## Casos de uso

- Triaje en línea de inspección: el modelo puntúa cada pieza y solo las marcadas como `anomaly` pasan a revisión humana, reduciendo la carga de inspección visual en líneas con alto volumen. Es adecuado porque su salida binaria está calibrada a un 1% de falso rechazo, lo que limita las paradas innecesarias.
- Arranque de una línea de producto nueva: cuando aún no existen datos de defectos, se ajusta un banco de memoria con imágenes de piezas buenas y se obtiene un primer detector operativo en horas, no en semanas.
- Localización de defectos para operarios: el mapa de puntuaciones por píxel permite resaltar la región sospechosa sobre la imagen original, acelerando la confirmación visual y facilitando la retroalimentación sobre el tipo de fallo.
- Control de calidad en categorías VisA concretas: para las 12 categorías cubiertas (PCB, piezas mecánicas, alimentos, etc.) se puede desplegar directamente el artefacto correspondiente sin reentrenamiento.
- Monitorización de deriva del proceso: al comparar la distribución de puntuaciones de anomalía a lo largo del turno se pueden detectar cambios graduales en el proceso (iluminación, desgaste de utillaje) antes de que generen defectos francos.
- Filtrado previo en pipelines de visión mayores: usar la puntuación de anomalía como señal de enrutamiento para decidir qué imágenes se envían a un modelo más costoso o a un inspector humano, optimizando el coste computacional global.
- Validación de proveedores: inspeccionar lotes de entrada con un modelo ajustado a las piezas buenas de referencia acordadas con el proveedor, documentando las desviaciones con mapas de calor.

## Benchmarks y rendimiento

Resultados publicados en la model card, con tres semillas por categoría e intervalos de confianza al 95% (Student-t):

| Dataset | Categorias | Image AUROC | Pixel AUROC | AUPRO | Tasa de escape a 1% FRR |
|---|---|---|---|---|---|
| VisA | 12 | 0.891 ± 0.017 | 0.954 ± 0.025 | 0.736 ± 0.078 | 0.446 ± 0.069 |

El propio autor señala que estos valores quedan por debajo de la referencia publicada de PatchCore en VisA (paper Real-IAD, tabla 2: Image AUROC 0.951, AUPRO 0.912, reproducido con Anomalib), atribuible a diferencias de protocolo en el ratio de coreset, el split de ajuste y la integración de AUPRO. La dispersión por categoría es amplia: las más débiles son `capsules` (Image AUROC 0.676 ± 0.028) y `macaroni2` (0.679 ± 0.051). A una tasa de falso rechazo del 1%, `macaroni2` deja pasar el 0.91 de sus defectos y `macaroni1` el 0.79.

## Requisitos de hardware

- VRAM estimada para inferencia: moderada; el backbone WideResNet-50-2 en FP32 ocupa del orden de 300 MB de pesos, y el banco de memoria al 1% de coreset añade una fracción pequeña. Cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 son válidas. Para lotes grandes, una RTX 4090 o A100 reducen la latencia por imagen.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4080 y RTX 4090, entre otras.
- Opciones de despliegue: el repositorio DefectLens ofrece un servicio local en PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. El backbone se descarga desde Hugging Face Hub al arrancar el servicio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto / entrada | Image AUROC en VisA | Licencia |
|---|---|---|---|---|---|
| DefectLens VisA PatchCore (este) | PatchCore con WideResNet-50-2 y coreset 0.01 | No aplica (banco de características) | Imagen 224×224 | 0.891 | CC BY 4.0 |
| PatchCore (referencia publicada, Real-IAD tabla 2) | PatchCore con protocolo distinto | No aplica | Imagen | 0.951 | Según implementación (Apache-2.0 en Anomalib) |
| PaDiM (baseline citado por el autor) | Modelo probabilístico de parches con backbone CNN | No aplica | Imagen | No disponible en esta release | No disponible en esta release |

La comparación con la referencia PatchCore debe tomarse con cautela: el autor indica que el protocolo difiere en el ratio de coreset, el split de ajuste y la integración de AUPRO, de modo que las cifras no son estrictamente comparables. No se dispone de datos de PaDiM medidos en esta release.

## Limitaciones y advertencias

- Tasa de escape elevada: con un objetivo del 1% de falso rechazo, la tasa media de escape es 0.446 ± 0.069, y en categorías como `macaroni2` alcanza 0.91. No es apto para rechazo o aceptación autónomos sin revisión humana.
- Solo cubre las 12 categorías VisA con las que se ajustó; una categoría nueva requiere su propio ajuste y calibración.
- Sensibilidad a condiciones de captura: imágenes rotadas, muy desenfocadas o con iluminación extrema se marcan como baja confianza, pero la rotación no se detecta explícitamente.
- Solo conoce el aspecto nominal: defectos que nunca aparecieron en las imágenes buenas de entrenamiento pueden pasar desapercibidos por definición del método.
- El chequeo de deriva de distribución MMD no está implementado en esta release.
- La comparación con PaDiM no tiene resultado medido en esta versión.
- Licencia: los pesos son CC BY 4.0 y derivan de VisA, por lo que se debe atribuir el dataset. El backbone es Apache-2.0, pero se descarga por separado y no se redistribuye. ImageNet-1k tiene sus propios términos, que habitualmente restringen el uso a investigación no comercial; el autor advierte que no se ha resuelto si esos términos se aplican a los pesos entrenados sobre él, por lo que conviene confirmarlo antes de cualquier uso comercial.
- No se incluyen pesos ajustados sobre MVTec AD por su licencia CC BY-NC-SA 4.0; las cifras de benchmark de esa fuente no son pesos.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de falsos negativos y falsos positivos con consecuencias operativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pavan-dangeti/defectlens-visa-patchcore
- Código fuente DefectLens: https://github.com/pavan-dangeti/DefectLens
- Release v1.0.0: https://github.com/pavan-dangeti/DefectLens/releases/tag/v1.0.0
- Demo (GIF): https://raw.githubusercontent.com/pavan-dangeti/DefectLens/main/docs/media/demo.gif
- Dataset VisA (Amazon Science, SPot-the-Difference): https://github.com/amazon-science/spot-diff
- Paper VisA / SPot-the-Difference (ECCV 2022): https://arxiv.org/abs/2207.14315
- Paper ResNet Strikes Back (receta RACM): https://arxiv.org/abs/2110.00476
- Paper Wide Residual Networks: https://arxiv.org/abs/1605.07146
- Pesos del backbone en Hugging Face: https://huggingface.co/timm/wide_resnet50_2.racm_in1k
