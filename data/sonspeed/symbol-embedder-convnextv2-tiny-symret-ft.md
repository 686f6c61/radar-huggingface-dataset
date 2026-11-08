# sonspeed/symbol-embedder-convnextv2-tiny-symret-ft

## Resumen

El modelo `sonspeed/symbol-embedder-convnextv2-tiny-symret-ft` es un embedder de imágenes especializado en la recuperación de símbolos de planos CAD (Computer-Aided Design). Lo desarrolla el usuario `sonspeed` y deriva por fine-tuning del modelo `sonspeed/symbol-embedder-convnextv2-tiny-e12`, del que hereda arquitectura, resolución de entrada y preprocesado. Su propósito es transformar recortes de símbolos de planos en vectores de 256 dimensiones normalizados en L2, de modo que símbolos equivalentes queden próximos en el espacio de embeddings y los recortes que no son símbolos queden alejados.

La arquitectura es una ConvNeXt-V2 Tiny adaptada a retrieval con aprendizaje métrico, con 28.589.184 parámetros y una entrada fija de 128×128 píxeles RGB. El modelo base e12 ya obtenía un buen rendimiento sobre el dataset original, pero en el benchmark SymRet confundía con frecuencia recortes que no contenían símbolos. Este fine-tune corrige ese problema añadiendo exposición a negativos (outliers) sintéticos, augmentación con rotaciones de 90° y recortes pequeños, y una función de pérdida de sub-centro CosFace combinada con Multi-Similarity.

El modelo es relevante para pipelines de digitalización de planos, indexación vectorial de componentes y búsqueda por similitud sobre documentación técnica. Se distribuye en safetensors, ONNX y PyTorch, con un tamaño de repositorio de 0.3 GB y un coste de inferencia muy bajo, apto para CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-V2 Tiny adaptada a embedding con cabeza métrica (sub-center CosFace) |
| Parametros totales | 28.589.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada fija 3×128×128) |
| Tipos de cuantizacion | No disponible (se distribuye fp32 en safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | No disponible |
| Formato de pesos | safetensors, ONNX, checkpoint PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La red es una ConvNeXt-V2 Tiny (familia derivada de `facebook/convnextv2-tiny-22k-224`) con una cabeza de embedding que produce vectores de 256 dimensiones ya normalizados en L2. La entrada es una imagen RGB de 128×128 obtenida mediante letterbox sobre fondo blanco: el lado largo se redimensiona a 112 píxeles (interpolación cúbica al ampliar, area al reducir) y se centra en un lienzo de 128×128, seguido de normalización con media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225]. El autor recomienda además un estiramiento de contraste en gris de percentiles p1–p99 a 0–255 y TTA consistente en promediar los embeddings de las cuatro rotaciones de 90°, ya que el modelo fue entrenado para ambas.

El fine-tuning parte de los pesos EMA del modelo e12. La cabeza de sub-centro (k=3) se inicializa con k-means sobre los embeddings de e12. La pérdida combina sub-center CosFace (s=32, m=0.22), 0.5·Multi-Similarity y 0.5·outlier exposure, donde los negativos sintéticos (fragmentos de símbolos al 12–35 %, texto, líneas y retículas) se empujan por debajo de un coseno de 0.35 respecto a todos los proxies. La augmentación incluye rotaciones aleatorias de 90°, rotaciones finas de ±10°, zoom-out 0.7–1.0, reducción a 20–96 px, desvanecido parcial, estiramiento de contraste, ruido y desenfoque al estilo SymRet H3b, además de las transformaciones morfológicas, borrado de bordes, jitter y JPEG de e12. El entrenamiento usa P×K = 24×4, AdamW con tasas de 8e-5 (backbone), 4e-4 (cabeza) y 2e-3 (proxies), warmup de 300 pasos, scheduler coseno, EMA 0.999 y AMP fp16 durante 4 épocas, conservando los pesos de la época 2 porque las épocas 3 y 4 sobreajustan a los negativos sintéticos. El dataset es el mismo que el de e12, con 475 clases de entrenamiento.

## Capacidades

- Generación de embeddings de imagen de 256 dimensiones normalizados en L2 para recuperación por similitud.
- Recuperación de símbolos CAD mediante búsqueda del vecino más próximo (1-NN) sobre un índice vectorial.
- Discriminación entre símbolos y recortes que no contienen símbolo (outlier rejection) gracias al outlier exposure.
- Robustez ante rotaciones de 90° y rotaciones finas de ±10°.
- Robustez ante recortes pequeños (20–96 px), desenfoque, ruido, estiramiento y cambios de contraste.
- Inferencia en CPU y GPU, con exportación ONNX lista para despliegue.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un extractor de características visuales.

## Casos de uso

- Indexación de símbolos en digitalización de planos: se procesan los recortes de cada plano, se generan embeddings de 256 dimensiones y se insertan en una base vectorial para búsqueda por similitud entre proyectos completos.
- Deduplicación de componentes en documentación técnica: al comparar embeddings con un umbral de distancia coseno se detectan símbolos repetidos entre distintas hojas o revisiones de un mismo plano.
- Búsqueda visual de componentes por parte de ingenieros: dado un recorte de ejemplo, el sistema devuelve los símbolos equivalentes del catálogo con su referencia, usando 1-NN sobre el índice de plantillas.
- Filtrado de falsos positivos en pipelines de detección: el modelo rechaza ventanas que no contienen símbolo (AUROC 0.9862 frente a no-símbolo), lo que reduce el ruido aguas abajo en el detector de objetos.
- Control de calidad de librerías de símbolos: se agrupan los embeddings por clase y se detectan plantillas mal etiquetadas o duplicadas mediante análisis de vecindad.
- Extracción de inventario de materiales: combinando la recuperación de símbolos con metadatos de proyecto se genera automáticamente el listado de componentes presentes en un conjunto de planos.
- Búsqueda multiángulo en planos rotados: con TTA de cuatro rotaciones de 90° se mantiene la precisión cuando los recortes aparecen en orientaciones arbitrarias.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (vista `symret_rot4`: raw+stretch, letterbox 112 + pad 8 hasta 128, promedio de embeddings de 4 rotaciones de 90°).

| Metrica | e12 (base) | Este modelo |
|---|---|---|
| Validación og, top-1 / mAP | 0.9962 / 0.9777 | 0.9955 / 0.9777 |
| Test og, top-1 / mAP | 0.9894 / 0.9783 | 0.9877 / 0.9768 |
| Crop real, 1-NN entre proyectos, top-1 | 0.9662 | 0.9817 |
| Crop real, macro (clases con ≥2 proyectos) | 0.9357 | 0.9859 |
| AUROC símbolo vs no-símbolo | 0.9842 | 0.9862 |
| No-símbolo mal clasificado a TPR90 (de 2660) | 55 | 34 |
| Precisión a TPR90 | 0.9870 | 0.9898 |
| No-símbolo mal clasificado a TPR95 (de 2660) | 203 | 102 |
| Precisión a TPR95 | 0.9576 | 0.9727 |

El conjunto de evaluación de crop real comprende 5.512 recortes COCO de 20 proyectos, con galería formada por plantillas y recortes de otros proyectos (leave-one-project-out). El conjunto de no-símbolo son 2.660 ventanas aleatorias sobre páginas reales que no tocan ninguna caja de símbolo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para un lote pequeño, dado el tamaño de 28,6 M parámetros y la entrada de 128×128.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; RTX 3060, RTX 4090, A100 y H100 son válidas y quedan sobradamente dimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (se incluye `model.onnx`), PyTorch nativo, y exportación a TensorRT o OpenVINO a partir del ONNX. No se documentan integraciones con vLLM, TGI o llama.cpp, que no aplican a un modelo de visión.
- Latencia y throughput estimados: no disponible en la información proporcionada. El autor indica que la velocidad en CPU es equivalente a la del modelo e12.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / salida | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sonspeed/symbol-embedder-convnextv2-tiny-symret-ft` | 28,6 M | 3×128×128 | Embedding de 256 dim | Top-1 crop real 0.9817; AUROC no-símbolo 0.9862 | No disponible | Hugging Face (safetensors, ONNX, PyTorch) |
| `sonspeed/symbol-embedder-convnextv2-tiny-e12` | 28,6 M | 3×128×128 | Embedding de 256 dim | Top-1 crop real 0.9662; AUROC no-símbolo 0.9842 | No disponible | Hugging Face |
| `facebook/convnextv2-tiny-22k-224` | ~28 M | 3×224×224 | Clasificación ImageNet | No disponible para retrieval de símbolos | No disponible en la información proporcionada | Hugging Face |

La comparación directa con otros embedders de símbolos CAD no está disponible en la información proporcionada. El modelo base `facebook/convnextv2-tiny-22k-224` es un clasificador de ImageNet y no produce embeddings de retrieval, por lo que no es un sustituto funcional sin reentrenamiento.

## Limitaciones y advertencias

- El número de falsos positivos de clase incorrecta por encima del umbral aumenta en TPR95 (38 frente a 17 del modelo base), lo que puede degradar la precisión en escenarios de recuperación muy permisivos.
- El modelo sigue sin separar correctamente las clases CF y TO-W, según reconoce el autor.
- Los resultados proceden de una única semilla de entrenamiento; no se documenta variabilidad entre ejecuciones.
- Las épocas 3 y 4 sobreajustan a los negativos sintéticos y empeoran el rechazo de no-símbolos reales; solo se publican los pesos de la época 2.
- La licencia no está especificada, por lo que el uso comercial no puede verificarse sin consultar al autor.
- El modelo está entrenado sobre un dataset concreto de 475 clases; su generalización a otros dominios de planos (por ejemplo, esquemas eléctricos o P&ID de otros fabricantes) no está documentada.
- No dispone de capacidades lingüísticas ni de razonamiento; cualquier tarea de texto debe resolverse con otro modelo.
- La calidad depende críticamente del preprocesado: letterbox a 112 con pad hasta 128, estiramiento de contraste y TTA de cuatro rotaciones. Omitir estos pasos puede reducir la precisión de forma significativa.
- Riesgo de alucinación no aplica en el sentido generativo, pero existe riesgo de recuperar un símbolo visualmente parecido pero semánticamente distinto; se recomienda calibrar el umbral de distancia coseno por dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sonspeed/symbol-embedder-convnextv2-tiny-symret-ft
- Modelo base e12: https://huggingface.co/sonspeed/symbol-embedder-convnextv2-tiny-e12
- ConvNeXt-V2 Tiny original: https://huggingface.co/facebook/convnextv2-tiny-22k-224
