# Mr-Itachi/vit-soil-quality-detector

## Resumen

BHUMI soil photo classifier (repositorio `Mr-Itachi/vit-soil-quality-detector`) es un modelo de visión por computador publicado por el usuario Mr-Itachi en HuggingFace. Se trata de un Vision Transformer de tamaño base (ViT-base) al que se le han fusionado adaptadores LoRA y se le han añadido cinco cabezas de salida independientes orientadas a analizar fotografías de suelo: color, materia orgánica, humedad, laterita y calidad de la fotografía. El peso total declarado en safetensors es de 85.820.188 parámetros (≈85,8 M), coherente con una arquitectura ViT-B, y el repositorio ocupa 0,3 GB.

El modelo no es un modelo de lenguaje: no procesa texto, no tiene ventana de contexto en tokens ni soporta tool calling. Su función es la inferencia multi-tarea sobre imágenes, y según la propia model card se entrenó con un conjunto de datos muy pequeño, por lo que el autor lo describe explícitamente como un prototipo de investigación.

Su relevancia actual es limitada y muy acotada: sirve como ejemplo de aplicación de LoRA sobre ViT-B para clasificación multietiqueta en dominios científicos (edafología, agricultura), y como punto de partida reproducible. No hay métricas publicadas, ni licencia declarada, ni pipeline de HuggingFace definido, lo que impide tratarlo como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base) con LoRA fusionado (merged) y 5 cabezas de salida específicas de tarea |
| Parámetros totales | 85.820.188 (≈85,8 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; es un modelo de visión y no procesa secuencias de texto |
| Tipos de cuantización | No disponible; el repositorio solo distribuye safetensors |
| Idiomas soportados | No disponible; la tarea es visual y no se documenta ningún idioma |
| Licencia | No disponible (no se especifica en el repositorio) |
| Formato de pesos | safetensors (`model.safetensors`); requiere código propio para instanciar la clase `SoilMultiHead` |
| Pipeline de HuggingFace | No disponible |
| Resolución de entrada | No disponible |
| Cabezas de salida | 5: color, materia orgánica, humedad, laterita, calidad de la foto |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión del tipo ViT-base. Sobre el backbone se aplicaron adaptadores LoRA que posteriormente se fusionaron en los pesos del modelo (técnica de *merge* habitual para eliminar el coste de inferencia de los adaptadores y simplificar el despliegue). La parte final del modelo es una estructura multi-cabeza con cinco salidas independientes, una por cada tarea de análisis del suelo, implementada en una clase personalizada llamada `SoilMultiHead` que no forma parte de `transformers` y debe definirse a partir del archivo `soil_model.py` del repositorio antes de cargar el `state_dict`.

No se dispone de información sobre el volumen de tokens o imágenes de entrenamiento, la composición del dataset, el esquema de etiquetado de cada cabeza (regresión frente a clasificación), la resolución de las imágenes, el número de epochs, la función de pérdida ni si se aplicaron técnicas de ajuste adicionales. La única indicación cualitativa del autor es que el conjunto de datos era "muy pequeño" y que el resultado es un prototipo de investigación, lo que sitúa el riesgo de sobreajuste como principal incógnita técnica.

## Capacidades

- Clasificación o estimación multi-cabeza sobre fotografías de suelo en cinco dimensiones: color, materia orgánica, humedad, presencia de laterita y calidad de la imagen.
- Procesamiento de imágenes individuales mediante carga manual de pesos en PyTorch (no hay `AutoModel` ni pipeline estándar).
- Reutilización del backbone ViT-base fusionado con LoRA como extractor de características o como inicialización para otros ajustes finos.
- No soporta generación de texto, razonamiento, código, matemáticas ni diálogo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no hay componente de texto.
- No dispone de modo *thinking*, audio ni vídeo.
- No se documenta batching, preprocesado oficial ni normalización esperada de la entrada.

## Casos de uso

- Filtrado de calidad en pipelines de etiquetado de imágenes de suelo: la cabeza de "photo quality" permitiría descartar capturas desenfocadas, mal iluminadas o fuera de encuadre antes de enviarlas a anotación humana, reduciendo coste de revisión. Requiere validación previa, ya que no hay métricas publicadas de esta cabeza.
- Estimación preliminar de color del suelo como proxy de clasificación taxonómica: la salida de color puede usarse como variable auxiliar en estudios de caracterización rápida de muestras, siempre que se calibre contra mediciones de laboratorio (por ejemplo, Munsell) en el dominio concreto de aplicación.
- Señal indicativa de materia orgánica en agricultura de precisión: el modelo podría emplearse como cribado de bajo coste a partir de fotografía de móvil para priorizar qué parcelas requieren análisis de laboratorio, no como sustituto de la medición analítica.
- Estimación de humedad superficial en campañas de campo: útil como indicador grueso para decidir si una muestra está en condiciones de ser fotografiada o procesada, con la advertencia de que la humedad aparente depende fuertemente de la iluminación.
- Detección de laterita en cartografía exploratoria: la cabeza específica permite un primer cribado de imágenes con presencia de costras lateríticas en estudios de suelos tropicales, sujeto a validación regional.
- Reproducción de investigación y docencia: sirve como ejemplo completo de ViT-base con LoRA fusionado y múltiples cabezas para cursos o experimentos de ajuste fino eficiente en visión, dado su reducido tamaño (0,3 GB) y que cabe en cualquier equipo.
- Despliegue en dispositivos de borde o entornos con recursos mínimos: por debajo de 1 GB de VRAM en fp16, es viable en Raspberry Pi o en móvil tras exportación a ONNX, aunque el rendimiento real no está medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de accuracy, F1, MAE ni comparaciones con baselines, y tampoco se documenta el conjunto de evaluación ni el procedimiento de validación de las cinco cabezas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,34 GB en fp32 (85,8 M de parámetros × 4 bytes) y 0,17 GB en fp16, más el espacio de activaciones, que depende de la resolución de entrada (no documentada). En la práctica, menos de 1 GB en total.
- El tamaño del repositorio (0,3 GB) es consistente con pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no se requiere A100 ni H100. Sirven RTX 3060, RTX 4090, GTX 1650, T4 o incluso GPU integrada.
- Cabe holgadamente en GPU de consumo, y la inferencia en CPU es viable para volúmenes moderados (el modelo no es un LLM y no hay decodificación autoregresiva).
- Opciones de despliegue: al no existir pipeline de HuggingFace ni clase registrada en `transformers`, es necesario cargar los pesos manualmente en PyTorch definiendo `SoilMultiHead`. No es compatible con vLLM, TGI, llama.cpp ni Ollama, que están orientados a modelos de lenguaje y esperan formatos como GGUF. Para producción conviene exportar a ONNX o TorchScript y servirlo con ONNX Runtime o Triton.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mr-Itachi/vit-soil-quality-detector | 85,8 M | Imagen; resolución no disponible | 5 cabezas de análisis de suelo | No disponible | HuggingFace, carga manual |
| google/vit-base-patch16-224 | ≈86 M | Imagen 224×224 | Clasificación ImageNet-1k (1 cabeza) | Apache 2.0 | HuggingFace, integrado en `transformers` |
| ResNet-50 (torchvision) | ≈25,6 M | Imagen; resolución configurable | Clasificación de imagen (1 cabeza) | BSD-3 (torchvision) | torchvision, ampliamente soportado |

La comparación relevante es estructural: este modelo comparte el backbone ViT-B con `google/vit-base-patch16-224`, del que probablemente parte (no confirmado en la model card), pero sustituye la cabeza de 1000 clases por cinco cabezas de dominio y añade LoRA fusionado. Frente a ambos alternativas, carece de métricas públicas y de licencia declarada, lo que supone una desventaja clara para cualquier evaluación de adopción. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Modelo declarado por el autor como prototipo de investigación entrenado con un dataset "muy pequeño": alta probabilidad de sobreajuste y de Generalización pobre fuera de la distribución de las imágenes de entrenamiento.
- Ausencia total de métricas de evaluación: no es posible estimar la fiabilidad de ninguna de las cinco cabezas sin una validación propia en el dominio objetivo.
- No se documenta la licencia. Sin licencia explícita, el uso comercial queda en una situación de incertidumbre legal y, por defecto, sujeto a derechos de autor del publicador.
- Sesgos conocidos: no documentados, pero al depender del color y la iluminación de la fotografía es previsible una fuerte sensibilidad a condiciones de captura (hora del día, balance de blancos, cámara) y a sesgos geográficos del dataset de entrenamiento.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de predicciones erróneas con apariencia de precisión: las salidas numéricas de materia orgánica o humedad no van acompañadas de intervalos de confianza ni de calibración documentada.
- Limitaciones de idioma: no aplica; el modelo no procesa texto. Limitación de contexto: no aplica en tokens, pero se desconoce la resolución de entrada soportada y el preprocesado esperado.
- Dependencia de código no versionado en la librería estándar: sin `soil_model.py` los pesos son inutilizables, lo que añade riesgo de mantenimiento y de reproducibilidad a largo plazo.
- Fecha de creación del repositorio anómala (2026-10-26) según los metadatos de HuggingFace; conviene verificarla antes de citar el modelo.
- No usar en producción sin una validación independiente contra mediciones de laboratorio y sin aclarar previamente la licencia con el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Mr-Itachi/vit-soil-quality-detector
- Archivo de definición del modelo referenciado en la model card: `soil_model.py` dentro del propio repositorio (https://huggingface.co/Mr-Itachi/vit-soil-quality-detector/blob/main/soil_model.py)
- Pesos: `model.safetensors` en el repositorio anterior
- Paper, blog, demo o repositorio de código adicional: no disponible; la búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos trataban sobre la abreviatura "Mr" y no son pertinentes).
