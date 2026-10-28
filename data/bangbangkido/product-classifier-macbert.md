# bangbangkido/Product-Classifier-MacBERT

## Resumen

Product-Classifier-MacBERT es un clasificador de texto en chino para títulos de productos de comercio electrónico, desarrollado por el usuario bangbangkido. Se trata de un ajuste fino completo (full fine-tuning) del modelo `hfl/chinese-macbert-base` sobre 88.448 títulos de entrenamiento y 11.059 de validación, con el objetivo de asignar cada título a una de 27 categorías de producto. La salida del modelo son logits sobre las 27 clases, por lo que funciona como clasificador multiclase de grano fino, no como modelo generativo.

El modelo resuelve un problema muy concreto de ingeniería de catálogo: el etiquetado taxonómico de títulos cortos y ruidosos que escriben los vendedores. La arquitectura es la de un transformer encoder BERT (MacBERT en su variante base china, ~102 M de parámetros) con una cabeza lineal de clasificación superpuesta, entrenado con una ventana de entrada de solo 32 tokens. Esa restricción es deliberada: los títulos de producto rara vez superan esa longitud y permite lotes grandes (batch size 512) y latencia muy baja en producción.

Su relevancia práctica está en el binomio coste/prestación: un modelo de 102 M de parámetros, ejecutable en CPU o en una GPU de consumo, con un Macro-F1 de 92,37 % y un error de calibración esperado (ECE) de 0,0079 en el conjunto de validación. La calibración especialmente baja es útil para sistemas con umbral de confianza y derivación a revisión humana. La contrapartida es que no hay licencia declarada, las métricas proceden del conjunto de validación (usado también para early stopping) y no existe clase de rechazo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (MacBERT chino, variante base) con cabeza lineal de clasificación sobre el token [CLS] |
| Parámetros totales | ~102,3 M (estimado a partir del state_dict `model.pt` de 409.222.415 bytes en fp32); el autor no publica el recuento explícito |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrada fija de 32 tokens incluidos los especiales (`max_length=32`, truncamiento del resto); el backbone MacBERT-base admite hasta 512 posiciones, pero el modelo se entrenó y exportó para 32 |
| Tipos de cuantización | Pesos publicados en FP32 (`model.pt`); existe una variante ONNX INT8 publicada en un repositorio aparte. No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Chino (`zh`) exclusivamente |
| Licencia | No disponible (el repositorio no declara licencia nueva; remite a la licencia del modelo base `hfl/chinese-macbert-base`) |
| Formato de pesos | PyTorch `state_dict` (`model.pt`, `weights_only=True`), más `modeling.py` con la clase `BertTitleClassifier`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue el esquema clásico de encoder preentrenado más cabeza de clasificación: el encoder MacBERT genera una representación del título y una capa lineal proyecta a 27 logits, sobre los que se aplica softmax para obtener probabilidades por clase. MacBERT es la variante china de BERT que sustituye el enmascaramiento con `[MASK]` por sustituciones por palabras similares durante el preentrenamiento (masked language modeling as correction), lo que reduce el desajuste entre preentrenamiento y ajuste fino. El ajuste se realizó sobre **todas** las capas del encoder, no mediante adaptadores ni LoRA.

Los datos consisten en 88.448 títulos de entrenamiento y 11.059 de validación repartidos en 27 clases, con una distribución muy desbalanceada: la clase mayoritaria (`家居`, hogar) tiene 14.217 ejemplos de validación frente a 127 de la minoritaria (`汽车用品`, accesorios de automóvil). La receta de regularización es explícita y agresiva para un corpus de este tamaño: label smoothing 0,05, ruido de tokens 0,05, dropout 0,2 tanto en el encoder BERT como en la cabeza de clasificación, R-Drop con peso 0,5 (consistencia entre dos pasadas dropout del mismo ejemplo) y recorte de gradiente a 1,0. La optimización usa AdamW sin weight decay en sesgos y LayerNorm, precisión mixta fp16 (AMP), warmup del 10 % seguido de decaimiento lineal, batch size 512 y learning rate 2e-5. El entrenamiento se planificó a 60 épocas con early stopping (paciencia 8) y selección por Macro-F1 de validación; la mejor época fue la 30. Todo el entrenamiento se ejecutó en una única RTX 4090 de 24 GB con torch 2.13.0+cu130.

## Capacidades

- Clasificación multiclase de títulos de producto en chino sobre un espacio fijo de 27 categorías, devolviendo la distribución de probabilidad completa (no solo la etiqueta top-1).
- Ranking de categorías candidatas: el ejemplo de la model card muestra cómo extraer las tres etiquetas más probables con sus probabilidades, útil para desambiguación o votación.
- Alta calibración de las probabilidades (ECE de 0,0079 con 10 bins), lo que permite usar el valor de confianza como señal operativa.
- Robustez razonable a entradas cortas y ruidosas propias de títulos de e-commerce (mezcla de marca, atributos y palabras clave sin estructura gramatical).
- Capacidad de ejecución en CPU o GPU de forma transparente: el código de inferencia usa CUDA si está disponible y cae a CPU en caso contrario, y funciona completamente offline tras la descarga.
- **No** soporta generación de texto, razonamiento multi-paso, tool calling ni function calling: es un encoder discriminativo.
- **No** soporta visión, audio, agentes ni modo "thinking".
- Capacidades multilingües: nulas fuera del chino; el vocabulario y el preentrenamiento son específicos de chino.

## Casos de uso

- **Enrutamiento automático de catálogo en marketplaces**: cada título nuevo que publica un vendedor se envía al modelo para asignarle una de las 27 categorías, con la probabilidad top-1 como criterio de autoaceptación y las categorías segunda y tercera como sugerencias en la interfaz de publicación.
- **Auditoría de taxonomía existente**: reclasificar muestras de un catálogo ya etiquetado y comparar la predicción con la etiqueta almacenada para detectar productos mal ubicados (por ejemplo, accesorios listados como producto principal) y disparar revisiones.
- **Pre-etiquetado para anotación humana**: usar el modelo como anotador de primera pasada en un flujo de active learning; los 27 logits y su calibración permiten ordenar por incertidumbre y enviar a revisión manual solo la cola dudosa.
- **Facetado y filtros de búsqueda**: generar la categoría como campo estructurado para construir filtros y agregaciones en el motor de búsqueda interno, aprovechando que la inferencia es de milisegundos sobre secuencias de 32 tokens.
- **Control de calidad en publicaciones de vendedores**: validar que la categoría declarada por el vendedor coincide con la predicha y bloquear o marcar publicaciones con discrepancias sistemáticas, como paso previo en el pipeline de moderación.
- **Segmentación de ingresos por categoría**: clasificar títulos históricos sin etiqueta para construir series de facturación por categoría y alimentar cuadros de mando comerciales sin depender de la etiqueta del vendedor.
- **Enrutamiento de soporte y reclamaciones**: asignar el motivo de la incidencia a un equipo especializado por familia de producto (electrónica, hogar, automoción) usando el título del artículo implicado en el ticket.
- **Señal adicional para sistemas de recomendación**: incorporar la distribución de 27 probabilidades como embedding de categoría blanda en un modelo de ranking, en lugar de una única etiqueta dura.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de validación completo (11.059 ejemplos, FP32, PyTorch). El autor advierte explícitamente de que la validación se usó para early stopping y selección de modelo, por lo que no equivalen a un test independiente.

| Métrica | Valor (validación, 11.059 ejemplos) |
|---|---:|
| Accuracy | 95,37 % |
| Macro Precision | 93,51 % |
| Macro Recall | 91,62 % |
| Macro F1 | 92,37 % |
| Weighted F1 | 95,36 % |
| Loss | 0,2129 |
| ECE (10 bins) | 0,0079 |

Desglose de las clases con peor comportamiento (cola de la distribución):

| Clase | Ejemplos en validación | F1 |
|---|---:|---:|
| `汽车用品` (accesorios de automóvil) | 127 | 0,710 |
| `运动` (deporte) | no disponible | 0,812 |
| `礼品` (regalo) | no disponible | 0,819 |
| `餐饮` (restauración) | no disponible | 0,829 |
| `家居` (hogar, clase mayoritaria) | 14.217 | superior a 0,95 |

El autor indica que las clases de cabeza superan habitualmente el 0,95 de F1. Para el resto de clases no se detallan cifras en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos alternativos en la información disponible.

## Requisitos de hardware

- **Huella de pesos**: `model.pt` ocupa 409.222.415 bytes (~0,41 GB) en FP32; en FP16 serían ~0,2 GB y en INT8 ~0,1 GB. El repositorio completo mide 0,4 GB.
- **VRAM estimada para inferencia**: menos de 1 GB con FP32 incluyendo activaciones para lotes pequeños; 1–2 GB con lotes de 512 secuencias de 32 tokens. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- **GPU recomendadas**: entrenamiento validado en una RTX 4090 de 24 GB (aunque el modelo es lo bastante pequeño para GPUs mucho menores); para inferencia bastan GTX 1660, RTX 3060, RTX 4090, T4, L4, A10, A100 u H100, sin requisitos especiales.
- **CPU**: viable para producción de bajo volumen; con 32 tokens de entrada el coste por ejemplo es muy reducido y el autor documenta la caída automática a CPU.
- **Opciones de despliegue**: PyTorch con `modeling.py` (único camino soportado por el autor); ONNX Runtime usando el repositorio `Product-Classifier-MacBERT-ONNX-INT8`; exportación propia a TorchScript o a formatos de serving de transformers. **No** es compatible con `AutoModelForSequenceClassification.from_pretrained()` ni con `pipeline()`, y por tanto tampoco con los atajos de vLLM, TGI, llama.cpp u Ollama, que están pensados para modelos generativos.
- **Latencia y throughput**: no disponible. No se publican medidas de latencia ni de ejemplos por segundo.

## Comparativa con modelos similares

No hay datos de rendimiento de modelos alternativos en la información proporcionada, por lo que las celdas de rendimiento se marcan como no disponibles. La comparación se limita a parámetros y adecuación de la tarea.

| Modelo | Parámetros | Contexto de entrada | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Product-Classifier-MacBERT | ~102,3 M | 32 tokens (backbone 512) | Clasificación en 27 categorías de producto, chino | No declarada | Métricas solo de validación; ECE 0,0079 |
| `hfl/chinese-macbert-base` (base sin ajustar) | ~102 M | 512 tokens | MLM / encoder genérico | No disponible en esta información | Requiere ajuste propio para clasificación; es el punto de partida de este modelo |
| `bert-base-chinese` | ~102 M (referencia habitual) | 512 tokens | Encoder genérico en chino | No disponible en esta información | Alternativa de partida; sin datos comparativos de rendimiento en esta ficha |
| Cualquier clasificador propietario de catálogo | no disponible | no disponible | Clasificación de producto | Propietaria | Sin datos públicos comparables |

No se dispone de resultados de benchmarks que permitan situar este modelo frente a alternativas en la misma tarea.

## Limitaciones y advertencias

- **Sin clase de rechazo**: no existe categoría `otro` ni `desconocido`. Cualquier entrada fuera de distribución (texto no comercial, otro idioma, cadena vacía) será forzada a una de las 27 clases con alguna probabilidad. El autor recomienda umbral de confianza (por ejemplo, derivar a revisión humana si la probabilidad máxima es inferior a 0,5).
- **Tres categorías ausentes**: de las 30 originales se eliminaron `书籍` (libros), `鲜花绿植` (flores y plantas) y `钟表配饰` (relojería y complementos) por tener menos de 100 muestras. El modelo no puede predecirlas en ningún caso.
- **Desbalanceo severo**: la clase mayoritaria multiplica por más de 100 a la minoritaria. El rendimiento en la cola es notablemente inferior (F1 0,710 en `汽车用品`) y requiere monitorización específica y posiblemente umbrales por clase.
- **Truncamiento a 32 tokens**: cualquier información relevante que aparezca más allá del token 32 se descarta. Títulos largos con la categoría al final pueden clasificarse mal.
- **Métricas no independientes**: todas las cifras publicadas provienen del conjunto de validación empleado para early stopping y selección de modelo (mejor época 30 de 60). No hay test ciego, por lo que el rendimiento real será con alta probabilidad algo inferior.
- **Licencia sin declarar**: el repositorio no especifica licencia y remite a la del modelo base. Antes de un uso comercial es necesario verificar la licencia de `hfl/chinese-macbert-base` y, en su caso, contactar con el autor; a día de hoy no hay autorización explícita de uso comercial.
- **Idioma único**: entrenado solo con títulos en chino; no generaliza a otros idiomas ni a texto conversacional o documentos largos.
- **Integración no estándar**: requiere cargar `modeling.py` y el `state_dict` manualmente. No funciona con `pipeline()` ni con AutoModel, lo que complica el despliegue en plataformas que esperan el formato estándar de transformers.
- **Riesgo de sesgo de catálogo**: el modelo reproduce la taxonomía y las convenciones de etiquetado del corpus de entrenamiento; si esa taxonomía cambia o el catálogo objetivo difiere, el rendimiento caerá sin señal evidente.
- **Reproducibilidad**: el autor publica el hash SHA-256 de los pesos (`71ea8c570667faae2c64db67e9de865105b39f53c5c5a019596d4d2f9161c433`) y metadatos de entrenamiento, pero no el dataset, por lo que el ajuste no es reproducible de extremo a extremo.
- **Sin datos de latencia ni de producción**: no hay evidencia de comportamiento bajo carga real ni de tasa de deriva (drift) a lo largo del tiempo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bangbangkido/Product-Classifier-MacBERT
- Variante ONNX INT8: https://huggingface.co/bangbangkido/Product-Classifier-MacBERT-ONNX-INT8
- Modelo base: https://huggingface.co/hfl/chinese-macbert-base
- Paper de MacBERT (Revisiting Pre-trained Models for Chinese Natural Language Processing, Cui et al., 2020): https://arxiv.org/abs/2004.13922
- Repositorio oficial de MacBERT: https://github.com/ymcui/MacBERT
