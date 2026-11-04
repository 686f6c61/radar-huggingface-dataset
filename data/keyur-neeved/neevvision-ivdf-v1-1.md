# keyur-neeved/NeevVision-IVDF-v1.1

## Resumen

NeevVision-IVDF-v1.1 es un modelo de clasificación de imágenes especializado en la detección de deepfakes y falsificaciones faciales (image forgery detection on faces, IVDF). Lo desarrolla el usuario keyur-neeved y se distribuye a través de HuggingFace con acceso restringido. Se trata de un fine-tuning de facebook/dinov2-small, un transformer de visión de tipo ViT-S/14 con 22,8 millones de parámetros, adaptado mediante código personalizado (`neevvision_dinov2`) para la tarea de feature extraction y clasificación binaria o multietiqueta de rostros manipulados.

El modelo es relevante en el contexto actual de proliferación de contenido sintético generado por difusión y GANs: ofrece una alternativa ligera (0,1 GB de pesos, apta para GPUs de consumo) frente a detectores de deepfake de mayor tamaño. Al partir de DINOv2, hereda representaciones visuales auto-supervisadas de alta calidad, lo que en principio facilita la generalización a manipulaciones no vistas durante el entrenamiento, aunque esta ficha no puede confirmarlo por falta de datos publicados.

La información disponible es escasa: no se publican idiomas, benchmarks, composición del dataset de entrenamiento ni condiciones concretas de la licencia "other". El acceso está restringido y requiere aceptar condiciones en HuggingFace antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/14) basado en DINOv2-small, con código personalizado `neevvision_dinov2` |
| Parametros totales | 22.847.110 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | other (condiciones no detalladas; acceso gated) |
| Formato de pesos | safetensors |
| Tarea | image-classification / feature-extraction |
| Modelo base | facebook/dinov2-small |
| Tamaño del repositorio | 0,1 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

El modelo se construye sobre DINOv2-small, un Vision Transformer con parches de 14x14 píxeles y aproximadamente 22 millones de parámetros, preentrenado por Meta mediante aprendizaje auto-supervisado (combinación de destilación DINO e iBOT sobre un corpus de imágenes curado). Sobre esa base, el autor aplica un fine-tuning supervisado para la tarea de detección de falsificaciones faciales, empaquetado en un módulo de código personalizado (`neevvision_dinov2`) que debe cargarse con `trust_remote_code=True`.

No se dispone de información pública sobre el número de tokens o imágenes de entrenamiento, la composición del dataset (por ejemplo, proporción de rostros reales frente a manipulados, técnicas de generación cubiertas como Face2Face, FaceSwap, DeepFakes o difusión), ni sobre si se aplicaron aumentos de datos, balanceo de clases o estrategias de regularización. Tampoco se documenta si el fine-tuning congela el backbone o ajusta todos los parámetros. Cualquier afirmación sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.) sería especulativa y no se incluye.

## Capacidades

- Extracción de características visuales (feature extraction) a partir de imágenes, heredando las representaciones de DINOv2-small.
- Clasificación de imágenes orientada a la detección de deepfakes y falsificaciones faciales.
- Detección de rostros manipulados por intercambio de cara, reenactment o generación sintética (según la intención declarada por los tags del repositorio; no verificable con datos publicados).
- Integración en pipelines de `transformers` mediante `AutoModel` con `trust_remote_code=True`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales texto-imagen.
- No se documentan capacidades multilingües (es un modelo puramente visual).
- No se documenta modo "thinking", visión adicional, audio ni otras capacidades especiales.

## Casos de uso

- Moderación de contenido en plataformas sociales: clasificar imágenes de perfil y publicaciones para marcar posibles rostros sintéticos antes de la revisión humana, aprovechando el reducido tamaño del modelo (0,1 GB) para desplegarlo en servicios de inferencia de bajo coste.
- Verificación de identidad en onboarding digital: como filtro previo en procesos KYC, señalando selfies o documentos con indicios de manipulación facial antes de pasarlos a un sistema biométrico más costoso.
- Análisis forense de medios: apoyo a periodistas y verificadores para priorizar imágenes sospechosas en investigaciones de desinformación, dado que el modelo puede ejecutarse en una estación de trabajo con GPU de consumo.
- Detección en pipelines de subida de contenido: integrar el clasificador como paso de un servicio de ingestión (por ejemplo, con `transformers` o TorchServe) que etiquete automáticamente imágenes sospechosas en repositorios de medios.
- Investigación académica en detección de deepfakes: servir como baseline ligero basado en DINOv2 para comparar contra detectores más pesados en conjuntos de datos de referencia, gracias a su pequeño número de parámetros (22,8 M).
- Filtrado previo en datasets de entrenamiento: identificar y descartar imágenes faciales sintéticas al construir corpus para otros modelos, reduciendo la contaminación por datos generados.
- Despliegue en el borde (edge): por su tamaño, puede ejecutarse en dispositivos con recursos limitados para prefiltrar capturas de cámara en aplicaciones de verificación, siempre que se valide su precisión en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (los pesos ocupan aproximadamente 91 MB en fp32 y unos 46 MB en fp16), más el overhead de activaciones y del procesador de imagen.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. También puede ejecutarse en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito del código personalizado); exportación a ONNX o TorchScript no documentada pero técnicamente viable; no se publican pesos GGUF ni integraciones con Ollama o llama.cpp (orientados a LLM, no aplicables directamente).
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera un throughput alto en GPU (cientos o miles de imágenes por segundo en lote), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeevVision-IVDF-v1.1 | 22,8 M | no disponible | Detección de deepfake facial | other (gated) | HuggingFace, acceso restringido |
| facebook/dinov2-small | 22,1 M | imagen 224x224 (por defecto) | Feature extraction visual general | Apache 2.0 (según modelo base) | HuggingFace, acceso abierto |
| Detectores de deepfake tipo XceptionNet | ~20 M | imagen variable | Detección de deepfake | variable según implementación | Repositorios académicos |
| CLIP ViT-B/32 | ~150 M | imagen 224x224 | Clasificación zero-shot imagen-texto | MIT (según variante) | HuggingFace, acceso abierto |

La comparación con detectores especializados es aproximada: no se dispone de métricas de NeevVision-IVDF-v1.1 que permitan contrastar su precisión frente a XceptionNet u otros detectores publicados. DINOv2-small se incluye como referencia del backbone, y CLIP como alternativa multimodal genérica de mayor tamaño.

## Limitaciones y advertencias

- No se han publicado métricas de precisión, recall, AUC ni matrices de confusión; no es posible evaluar su fiabilidad real en producción.
- El dataset de entrenamiento no está documentado, por lo que se desconoce su cobertura de técnicas de manipulación (GANs, difusión, face swap, reenactment) y su sesgo demográfico (edad, género, etnia, iluminación).
- Riesgo de falsos positivos y negativos en rostros de baja resolución, oclusiones, perfiles extremos o condiciones de iluminación no representadas en el entrenamiento.
- Riesgo de sobreajuste a las técnicas de generación presentes en el conjunto de entrenamiento; los detectores de deepfake suelen degradarse ante generadores nuevos.
- Licencia "other" sin texto público de condiciones: es imprescindible revisar los términos antes de cualquier uso comercial. El acceso gated implica que el autor puede restringir la descarga.
- El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código del autor; conviene auditar el módulo `neevvision_dinov2` antes de usarlo en entornos sensibles.
- No hay información sobre el preprocesado esperado (resolución de entrada, normalización, recorte facial); usarlo con un pipeline incorrecto puede degradar gravemente los resultados.
- No debe utilizarse como única evidencia en decisiones de moderación o verificación de identidad sin revisión humana.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keyur-neeved/NeevVision-IVDF-v1.1
- Modelo base DINOv2-small: https://huggingface.co/facebook/dinov2-small
- Paper DINOv2 (Oquab et al., 2023): https://arxiv.org/abs/2304.07193
- Repositorio oficial DINOv2: https://github.com/facebookresearch/dinov2
