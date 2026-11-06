# joseph234samwel/AFOS-KYC-001-Document-Tampering

## Resumen

AFOS KYC-001 es un modelo experimental de clasificación de imágenes desarrollado por joseph234samwel dentro del proyecto AFOS Identity Intelligence. Su tarea es binaria: determinar si una imagen de documento de identidad presenta indicios de manipulación (`tampered`) o no (`positive`), emitiendo una probabilidad de manipulación mediante una sigmoide con umbral por defecto de 0,50. Se enmarca en flujos de verificación de identidad (KYC) como señal de riesgo previa a la revisión humana.

Técnicamente es un clasificador de imágenes construido sobre un backbone EfficientNetB0 preentrenado en ImageNet, con entrada RGB de 224 × 224 píxeles, seguido de Global Average Pooling, Dropout de 0,35 y una capa densa con activación sigmoide. Está implementado en TensorFlow/Keras y se distribuye como un único artefacto `.keras`. No es un modelo de lenguaje: no genera texto ni razona sobre documentos, solo clasifica imágenes.

Su relevancia es acotada y de carácter exploratorio. El propio autor lo etiqueta como "experimental, no verificado en producción", con un conjunto de entrenamiento sintético de 2.400 imágenes derivado del dataset IDNet y una partición no agrupada por identidad, lo que limita la extrapolación de sus métricas a documentos reales. Resulta útil como referencia de arquitectura y como componente de demostración, no como sistema de decisión autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetB0 (backbone preentrenado en ImageNet) + Global Average Pooling + Dropout 0,35 + Dense sigmoide |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible (artefacto `.keras` en coma flotante) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto) |
| Licencia | other |
| Formato de pesos | `.keras` (TensorFlow/Keras); tamano del repo 0,0 GB |

## Arquitectura y entrenamiento

El modelo parte de un backbone EfficientNetB0 con pesos preentrenados en ImageNet. Sobre la salida del backbone se aplica Global Average Pooling, un Dropout de 0,35 y una capa densa final con activación sigmoide que produce una probabilidad escalar de manipulación. El entrenamiento se realizó en dos fases: primero con los pesos del backbone congelados y después con ajuste fino. La entrada es una imagen RGB de 224 × 224 con valores de píxel en rango 0–255, sin que la model card detalle la normalización exacta aplicada.

Los datos de entrenamiento provienen del dataset IDNet Identity Document Analysis, del que se seleccionó una muestra equilibrada de 1.200 imágenes positivas y 1.200 manipuladas (2.400 en total). Las manipulaciones cubren reemplazo de rostro, manipulación combinada, inpainting y reescritura, morphing facial, copy-and-move y crop-and-replace. La partición fue estratificada por clase pero no agrupada por identidad de origen: 1.680 imágenes de entrenamiento, 360 de validación y 360 de test. No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos adicionales, ni el número de épocas o la tasa de aprendizaje empleados.

## Capacidades

- Clasificación binaria de imágenes de documentos de identidad en dos clases: `positive` y `tampered`.
- Salida de una probabilidad de manipulación continua en [0, 1] con umbral configurable (por defecto 0,50), lo que permite ajustar el punto de operación según el coste relativo de falsos positivos y falsos negativos.
- Detección de patrones de manipulación presentes en el conjunto de entrenamiento: reemplazo de rostro, morphing facial, inpainting, reescritura, copy-and-move y crop-and-replace.
- Generación de una decisión operativa derivada (`FLAG_FOR_REVIEW` o `NO_TAMPERING_FLAG`) en el ejemplo de inferencia de la model card.
- Integración como componente de un pipeline KYC más amplio (clasificación de tipo de documento, OCR, face matching, liveness, orquestación de decisiones).
- No realiza OCR, clasificación de tipo de documento, comparación facial, detección de vida ni verificación de identidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Triaje previo a revisión manual en onboarding digital: el modelo puntúa cada imagen de documento y solo las que superan el umbral pasan a un revisor humano, reduciendo la carga de revisión sobre el resto del flujo.
- Señal de riesgo complementaria en un sistema KYC por capas: la probabilidad de manipulación se agrega junto con las salidas de OCR y face matching para calcular un score de riesgo compuesto antes de aprobar o rechazar.
- Detección de documentos alterados en campañas de fraude conocidas: útil para identificar reutilización de plantillas manipuladas con morphing facial o reemplazo de rostro, que son precisamente las categorías incluidas en el entrenamiento.
- Monitorización de calidad en pipelines de captura: al clasificar imágenes con probabilidad alta de manipulación, se pueden detectar casos de imágenes sintéticas o alteradas que entran al sistema por canales no controlados.
- Prueba de concepto y evaluación de arquitecturas: sirve como baseline reproducible con EfficientNetB0 para comparar contra modelos propios de detección de manipulación documental antes de invertir en datasets y entrenamiento a mayor escala.
- Filtro en procesos de verificación de identidad en fintech: como primera barrera de bajo coste computacional (entrada 224 × 224, backbone B0) que descarta imágenes claramente sospechosas antes de invocar modelos más caros de análisis forense.
- Investigación académica sobre detección de manipulación documental: el modelo y su partición estratificada permiten reproducir las métricas publicadas y estudiar el efecto de particiones no agrupadas por identidad en la estimación del rendimiento.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test experimental retenido (360 imágenes, umbral 0,50):

| Metrica | Resultado |
|---|---:|
| Accuracy | 86,67 % |
| Precision | 94,59 % |
| Recall | 77,78 % |
| F1-score | 85,37 % |
| ROC-AUC | 89,27 % |

Matriz de confusión (filas: clase real; columnas: clase predicha):

| | Predicho positive | Predicho tampered |
|---|---:|---:|
| Real positive | 172 | 8 |
| Real tampered | 40 | 140 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor advierte explícitamente que estos resultados proceden de un dataset experimental y no garantizan el rendimiento sobre documentos de identidad reales.

## Requisitos de hardware

- Inferencia en CPU viable: EfficientNetB0 con entrada 224 × 224 es un modelo ligero; el tamaño del repositorio es de 0,0 GB y no requiere GPU para funcionar, aunque la latencia será mayor que en GPU.
- VRAM estimada en GPU: no disponible en la información proporcionada; por el tamaño del backbone (EfficientNetB0, decenas de millones de parámetros) cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o profesional (A100, H100) es sobredimensionada para este modelo; una GPU de gama media es suficiente para lotes grandes.
- Despliegue: TensorFlow Serving, API propia con Keras, o exportación a TensorFlow Lite / ONNX para entornos de borde; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imágenes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos de detección de manipulación documental en la información proporcionada. Como referencia estructural, el modelo se apoya en EfficientNetB0, cuya familia (B0–B7) es un estándar de clasificación de imágenes con distintos compromisos de precisión y coste computacional; sin embargo, no se han aportado métricas comparativas frente a alternativas específicas de KYC o forense documental.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AFOS KYC-001 | no disponible | 224 × 224 RGB | Accuracy 86,67 %, ROC-AUC 89,27 % (test experimental) | other | Hugging Face |
| Alternativas de detección de manipulación documental | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental no verificado en producción; el propio autor lo declara como tal.
- Entrenamiento sobre datos sintéticos que pueden no representar el fraude documental del mundo real.
- Partición estratificada pero no agrupada por identidad: imágenes derivadas de la misma identidad pueden aparecer en train y test, lo que probablemente infla las métricas publicadas.
- No validado de forma independiente sobre pasaportes, DNI o permisos de conducir reales (el autor menciona específicamente el caso de Tanzania).
- Recall del 77,78 %: aproximadamente uno de cada cinco documentos manipulados del test no se detecta, lo que exige controles adicionales en producción.
- Un resultado `positive` no prueba la autenticidad del documento; un resultado `tampered` requiere investigación adicional.
- No realiza OCR, clasificación de tipo de documento, face matching, liveness detection ni verificación de identidad.
- Licencia "other": no se detallan los términos exactos de uso comercial en la información disponible; es necesario consultar el repositorio antes de un despliegue comercial.
- No debe usarse como única base para rechazar un documento de identidad o denegar servicios financieros; se requiere revisión humana y controles de verificación adicionales.
- Idiomas declarados: en; el modelo no procesa texto, por lo que la etiqueta de idioma es meramente informativa.

## Enlaces

- Hugging Face: https://huggingface.co/joseph234samwel/AFOS-KYC-001-Document-Tampering
- Repositorio del artefacto: https://huggingface.co/joseph234samwel/AFOS-KYC-001-Document-Tampering/resolve/main/afos_kyc_model_01.keras
- Dataset de origen citado (IDNet Identity Document Analysis): no disponible enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponible
