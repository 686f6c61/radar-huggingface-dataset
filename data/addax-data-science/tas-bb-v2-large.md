# Addax-Data-Science/TAS-BB-v2-large

## Resumen

TAS-BB-v2-large es un modelo redistribuido por Addax Data Science dentro de su ecosistema AddaxAI, una plataforma orientada a la inferencia de modelos de visión por computador para el análisis de imágenes de fauna y cámaras trampa. El repositorio no contiene una model card técnica propia: la información publicada se limita a un aviso de redistribución que remite a la documentación del model zoo de AddaxAI para conocer autoría original, licencia y enlaces.

El modelo cuenta con 86.496.480 parámetros en formato safetensors, lo que lo sitúa en el rango de los modelos de tamaño medio (aproximadamente 86 M de parámetros). El tamaño del repositorio es de 0.3 GB, coherente con pesos en precisión de 16 o 32 bits. No se han publicado en la información disponible datos sobre arquitectura, contexto, idiomas ni pipeline.

Su relevancia actual es acotada y de nicho: se trata de un artefacto de integración para una herramienta concreta (AddaxAI), no de un modelo de propósito general con documentación técnica independiente. Cualquier evaluación rigurosa requiere consultar el model zoo del proyecto original antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 86.496.480 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que cada modelo conserva su licencia original, consultable en el model zoo de AddaxAI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. El repositorio es una redistribución y no incluye detalles sobre tipo de red (transformer, CNN, híbrida u otra), datos de entrenamiento, número de tokens o imágenes procesadas, composición del dataset ni técnicas de ajuste como RLHF o DPO.

El contexto de uso declarado por el autor (AddaxAI) apunta a un modelo de visión aplicado al análisis de imágenes, probablemente de clasificación o detección sobre capturas de cámaras trampa, pero esta inferencia no está confirmada por ninguna especificación técnica publicada. El tamaño de 86 M de parámetros es compatible con arquitecturas tipo ResNet o ViT de escala pequeña-media, si bien no se dispone de confirmación.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- El propósito declarado del repositorio es la integración con AddaxAI, plataforma de análisis de imágenes de fauna.
- No consta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No consta soporte multilingüe ni capacidades de texto, audio o vídeo.
- No consta modo de razonamiento explícito (thinking mode) ni decodificación especulativa.

## Casos de uso

- Análisis de cámaras trampa: integración en el pipeline de AddaxAI para procesar lotes de imágenes de campo y clasificar o filtrar capturas de fauna, aprovechando que el modelo se distribuye empaquetado para esa plataforma.
- Despliegue en estaciones de campo: con 86 M de parámetros y un repositorio de 0.3 GB, el modelo es candidato a ejecutarse en hardware de borde o en equipos sin GPU dedicada, siempre que se valide su rendimiento real.
- Preprocesado y triaje de imágenes: uso como primer filtro para descartar imágenes vacías o irrelevantes antes de un modelo mayor, reduciendo coste computacional en pipelines de ecología y conservación.
- Investigación en monitorización de biodiversidad: incorporación a estudios que ya utilizan AddaxAI como herramienta estándar, manteniendo la trazabilidad de la versión del modelo redistribuido.
- Prototipado rápido: al estar en safetensors y con un tamaño contenido, permite cargarlo en entornos de desarrollo para pruebas de integración sin infraestructura pesada.
- Reproducibilidad de experimentos: útil para replicar resultados de trabajos que citen esta versión concreta del modelo dentro del ecosistema AddaxAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmética, 86,5 M de parámetros en fp32 ocupan aproximadamente 0,35 GB y en fp16 unos 0,17 GB, a los que hay que sumar memoria de activaciones y del runtime.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM disponible podría alojarlo, pero no hay validación publicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas consumer modernas (por ejemplo, RTX 3060 en adelante), si bien es una estimación basada solo en el recuento de parámetros.
- Opciones de despliegue: no documentadas. El formato safetensors es compatible con frameworks estándar (PyTorch, Transformers, ONNX Runtime tras conversión), pero no se confirma la arquitectura necesaria para cargarlo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información publicada no identifica la arquitectura ni la tarea exacta, por lo que no es posible establecer una comparación rigurosa con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TAS-BB-v2-large | 86.496.480 | no disponible | no disponible | Hugging Face (redistribución Addax) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no contiene especificaciones técnicas: arquitectura, entrenamiento, licencia e idiomas no están documentados en el repositorio.
- La licencia no aparece en la información disponible; el autor indica que cada modelo conserva su licencia original, por lo que el uso comercial exige consultar el model zoo de AddaxAI y los ficheros de licencia del repositorio antes de cualquier despliegue.
- Riesgo de sesgo y alucinación: no evaluable sin documentación sobre los datos de entrenamiento.
- No se puede verificar el rendimiento real ni el dominio de aplicación sin acceso a la documentación original del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Al ser una redistribución, la versión puede divergir de la original si el autor upstream la actualiza sin sincronizar este repositorio.
- No se debe asumir que el modelo cubre texto, código o matemáticas: el contexto del proyecto sugiere visión, pero no está confirmado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addax-Data-Science/TAS-BB-v2-large
- AddaxAI: https://addaxdatascience.com/addaxai/
- Model zoo de AddaxAI (autoría, licencia y enlaces del modelo original): https://docs.addaxai.com/docs/reference/model-zoo
