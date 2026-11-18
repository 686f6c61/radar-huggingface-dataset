# PrimeNeural/fairface_age_image_detection-pnn-d100-w1a1-j36

## Resumen

PNN fairface_age_image_detection es una versión comprimida y reentrenada del clasificador de edad `dima806/fairface_age_image_detection`, publicada por PrimeNeural (PreciseStatistics GmbH) bajo el paradigma de las Prime Neural Networks (PNN). El modelo original es un transformer de visión para clasificación de imágenes; esta variante sustituye 72 de sus capas lineales por capas PNN con pesos y activaciones de 1 bit al 100 % de densidad, manteniendo el resto de componentes en coma flotante de 16 bits. El resultado es un fichero de 12,95 MB que reproduce la decisión del modelo original en el 61,53 % de los casos (top-1) sobre datos reservados.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de cuantización extrema (W1A1) aplicada a una tarea de visión, con un compromiso explícito entre tamaño y fidelidad respecto al profesor. Por otro, ilustra un formato de pesos propietario (`pnn`, con librería de kernels propia) que rompe la compatibilidad directa con `transformers`, lo que condiciona por completo el despliegue.

El modelo cuenta con 11.736.585 parámetros declarados en safetensors y no dispone de pipeline declarado en el Hub, ni de idiomas especificados, ni de descargas o valoraciones. La licencia de los pesos es Apache 2.0, heredada del modelo base, mientras que el formato y la librería PNN se licencian por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (base: `dima806/fairface_age_image_detection`) con 72 capas lineales sustituidas por capas PNN de 1 bit al 100 % de densidad |
| Parametros totales | 11.736.585 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imágenes, no generativo) |
| Tipos de cuantizacion | Pesos y activaciones de 1 bit en las 72 capas PNN; resto de componentes en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos, heredada del modelo base); la librería y el formato PNN tienen licencia separada |
| Formato de pesos | safetensors con esquema PNN (requiere `pnn_load.py` y el paquete PNN V4.4) |

## Arquitectura y entrenamiento

El modelo parte de un clasificador de imágenes basado en transformer de visión. Sobre esa arquitectura se aplica una transformación PNN: cada una de las 72 capas lineales seleccionadas pasa a tener conexiones de 1 bit (únicamente el signo), con una escala FP16 por entrada y por salida. La conectividad es fija y estructurada: cada salida lee un conjunto fijo de entradas, con el mismo número de lecturas para todas las salidas, y no se almacena ningún índice. Las entradas de cada capa PNN también se binarizan mediante un umbral FP16 por entrada (+1 si está en el umbral o por encima, -1 si está por debajo), de modo que la operación interna se reduce a una XOR y un recuento de bits en la librería de kernels PNN.

El proceso de obtención de los pesos es una destilación de 20 épocas sobre el conjunto HuggingFaceM4/FairFace, con inicialización por mínimos cuadrados y ajuste por coincidencia de estados ocultos (hidden-state matching) contra el modelo profesor. El resultado declarado es una concordancia top-1 del 61,53 % con el modelo original sobre datos reservados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO, algo por otra parte esperable en una tarea de clasificación supervisada.

## Capacidades

- Clasificación de imágenes orientada a la estimación de rangos de edad, heredada del modelo base `dima806/fairface_age_image_detection`.
- Inferencia con pesos y activaciones de 1 bit en las capas PNN, lo que reduce el tamaño del artefacto a 12,95 MB.
- Ejecución en PyTorch estándar: las capas PNN funcionan en PyTorch puro sin kernels especializados.
- Aceleración opcional mediante la librería de kernels PNN en CPU y GPU NVIDIA.
- Carga mediante `pnn_load.py`, que reconstruye el modelo original y sustituye las capas indicadas por capas PNN.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No se documentan capacidades multilingües, de visión general, audio ni modo de pensamiento.
- No se declara soporte de agentes.

## Casos de uso

- Clasificación de edad en pipelines de moderación de contenido: el modelo puede etiquetar imágenes por rango de edad en un servicio de validación previa, con un coste de almacenamiento de 12,95 MB por instancia y una fidelidad del 61,53 % respecto al profesor, suficiente para filtros de triaje que luego derivan casos dudosos a un modelo mayor.
- Despliegue en dispositivos con memoria muy limitada: al ocupar 12,95 MB, cabe en entornos embebidos, navegadores o funciones serverless con límites estrictos de tamaño de artefacto, donde un clasificador de visión convencional en FP16 no cabría.
- Prefiltrado en sistemas de análisis demográfico agregado: útil para estimar distribuciones de edad en grandes volúmenes de imágenes antes de aplicar un modelo más preciso, reduciendo el coste computacional del primer paso.
- Prototipado e investigación sobre cuantización extrema: sirve como referencia reproducible para estudiar la degradación de un clasificador de visión al binarizar pesos y activaciones, con una métrica de concordancia explícita frente al modelo original.
- Pruebas de integración del formato PNN: útil para validar la cadena `pnn_load.py` + paquete PNN V4.4 en un entorno de CI antes de adoptar el formato en modelos de mayor tamaño.
- Anonimización y revisión de conjuntos de datos: clasificación rápida de imágenes por edad para enmascarar o excluir registros de menores en datasets de entrenamiento, con la advertencia de que la precisión es limitada y requiere revisión humana.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Concordancia top-1 con el modelo original (datos reservados) | 61,53 % |
| Epocas de destilación | 20 |
| Tamano del fichero | 12,95 MB |
| Capas PNN | 72 al 100 % de densidad |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas de precisión absoluta del modelo base o de esta variante sobre FairFace.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 para los componentes densos, dado que el fichero de pesos PNN ocupa 12,95 MB y el total de parámetros es de 11,7 M.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de la librería de kernels PNN; en ausencia de ella, el modelo funciona en PyTorch puro sobre CPU o GPU convencional.
- Cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) e incluso en CPU modesta.
- Opciones de despliegue: `pnn_load.py` con PyTorch y el paquete PNN V4.4; endpoint gestionado en primeneural.net. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni usa un formato estándar de `transformers`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PrimeNeural/fairface_age_image_detection-pnn-d100-w1a1-j36 | 11,7 M | no aplica | safetensors PNN | Apache 2.0 (pesos) | 61,53 % de concordancia top-1 con el profesor; 12,95 MB |
| dima806/fairface_age_image_detection | no disponible | no aplica | transformers | no disponible | Modelo base; precisión absoluta no disponible en esta ficha |
| Otras variantes PNN del mismo autor | no disponible | no aplica | safetensors PNN | Apache 2.0 (pesos) | No se dispone de datos comparativos |

No se dispone de información sobre alternativas de cuantización extrema comparables (por ejemplo, variantes W1A1 de clasificadores de visión) en la documentación consultada.

## Limitaciones y advertencias

- La concordancia top-1 con el modelo original es del 61,53 %, lo que implica que aproximadamente 4 de cada 10 predicciones difieren del profesor; no es un sustituto fiel para aplicaciones sensibles a la precisión.
- La tarea de estimación de edad a partir de imágenes es intrínsecamente propensa a sesgos demográficos, de género e iluminación; no se documentan evaluaciones de equidad en la información disponible.
- Riesgo de clasificación errónea en rostros con oclusión, baja resolución, ángulos no frontales o edades cercanas a los límites entre clases.
- No es compatible con `AutoModelForImageClassification.from_pretrained` directamente: requiere `pnn_load.py` y el paquete PNN V4.4 en el `PYTHONPATH`.
- La licencia Apache 2.0 cubre los pesos, pero el formato PNN, `pnn_load.py` y el paquete PNN son propiedad de PreciseStatistics GmbH y se licencian por separado (licencia de evaluación bajo solicitud), lo que puede condicionar el uso comercial del pipeline completo.
- Existe una patente pendiente (US 19/685,168) sobre la tecnología PNN, factor a considerar en despliegues comerciales.
- El repositorio no registra descargas ni valoraciones, y la fecha de creación es posterior a la de la información de referencia; conviene verificar la disponibilidad y el soporte a largo plazo.
- No se especifican idiomas ni se documentan limitaciones específicas de contexto, al no ser un modelo generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PrimeNeural/fairface_age_image_detection-pnn-d100-w1a1-j36
- Modelo base: https://huggingface.co/dima806/fairface_age_image_detection
- Plataforma Prime Neural: https://primeneural.net
- Dataset de destilación: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Contacto para licencia del paquete PNN: info@primeneural.net
