# iaac-maai/Day2-Team4-epc-band-predictor

## Resumen

`iaac-maai/Day2-Team4-epc-band-predictor` es un modelo de clasificación entrenado con scikit-learn y publicado en HuggingFace por el usuario `iaac-maai`. Por su nombre y sus etiquetas (`energy-performance`, `epc`, `buildings`, `classification`), está orientado a predecir la banda de certificación energética (EPC, Energy Performance Certificate) de edificios a partir de variables descriptivas del inmueble. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un pipeline clásico de machine learning serializado con `joblib`.

El repositorio tiene un tamaño de 0,0 GB, lo que sugiere un artefacto muy ligero, coherente con un modelo tabular de scikit-learn. Fue creado y actualizado el 26 de octubre de 2026, con cero descargas y cero likes en el momento de la consulta. El acceso está restringido (gated): es necesario aceptar las condiciones en HuggingFace para poder descargarlo.

La relevancia de este modelo es limitada y de ámbito educativo o experimental. No dispone de pipeline declarado, no se especifican idiomas y la licencia figura como `other`, sin detallar términos. La información pública disponible es mínima, por lo que esta ficha se limita a lo que puede inferirse de los metadatos y marca explícitamente como "no disponible" todo aquello que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn (clasificación tabular); algoritmo concreto no disponible |
| Parametros totales | no disponible (no aplicable a modelos sklearn) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplicable) |
| Tipos de cuantizacion | no disponible (no aplicable) |
| Idiomas soportados | no disponible |
| Licencia | other (términos no detallados) |
| Formato de pesos | joblib (serialización de scikit-learn) |

## Arquitectura y entrenamiento

El modelo se distribuye como un artefacto de scikit-learn serializado con `joblib`, según indican las etiquetas y la librería declarada. Esto implica un pipeline clásico de preprocesamiento más un clasificador (posiblemente Random Forest, Gradient Boosting, regresión logística u otro estimador de sklearn), aunque el algoritmo exacto no se especifica en la información disponible. No hay indicios de uso de redes neuronales, transformers ni arquitecturas de atención.

No se dispone de información sobre el conjunto de datos de entrenamiento: ni el número de muestras, ni las variables de entrada, ni la distribución de clases de las bandas EPC, ni si hubo validación cruzada o ajuste de hiperparámetros. Tampoco se documenta ningún proceso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo tabular de este tipo. El tamaño del repositorio (0,0 GB) sugiere un artefacto de pocos megabytes.

## Capacidades

- Clasificación de edificios en bandas de certificación energética (EPC) a partir de variables tabulares, según el nombre y las etiquetas del modelo.
- Inferencia sobre datos estructurados mediante el pipeline de scikit-learn cargado con `joblib`.
- Integración sencilla en flujos de Python con `scikit-learn`, sin necesidad de GPU.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües (no aplicable a un modelo tabular).
- No se documentan capacidades especiales como visión, audio o modo de razonamiento.

## Casos de uso

- Predicción de bandas EPC en herramientas de tasación inmobiliaria: el modelo podría puntuar un inmueble con sus variables descriptivas y devolver una banda energética estimada, útil para valoraciones rápidas antes de una certificación oficial.
- Filtrado previo en portales inmobiliarios: clasificar automáticamente anuncios por eficiencia energética estimada cuando el dato oficial no está disponible, permitiendo búsquedas filtradas por banda.
- Análisis de carteras de edificios: aplicar el clasificador por lotes sobre bases de datos catastrales para segmentar el parque inmobiliario por eficiencia energética estimada.
- Priorización de rehabilitaciones: identificar edificios con alta probabilidad de caer en bandas bajas (E, F, G) para orientar programas de mejora energética.
- Investigación académica y docencia: el modelo, publicado en un contexto de curso (`Day2-Team4`), sirve como ejemplo reproducible de pipeline de clasificación tabular con scikit-learn y `joblib`.
- Prototipado rápido en entornos sin GPU: al ser un artefacto ligero de sklearn, puede desplegarse en cualquier servicio Python con CPU, sin infraestructura de aceleración.
- Validación cruzada con certificados oficiales: usar las predicciones como señal complementaria para detectar inconsistencias en bases de datos de certificados EPC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (modelo tabular de scikit-learn, ejecutable en CPU).
- GPU recomendadas: no aplicable; no requiere GPU.
- Cabe en cualquier equipo consumer: sí, en CPU convencional; el tamaño del repositorio (0,0 GB) apunta a un artefacto de pocos megabytes.
- Opciones de despliegue: carga directa con `joblib.load` en Python, integración en APIs con FastAPI o Flask, o inclusión en pipelines de scikit-learn.
- Latencia y throughput estimados: no disponibles; en un modelo tabular de este tamaño la inferencia por muestra suele ser de milisegundos, pero no se confirma con datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un artefacto de scikit-learn de ámbito educativo, sin benchmarks ni especificaciones que permitan una comparación rigurosa con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| iaac-maai/Day2-Team4-epc-band-predictor | no disponible (sklearn) | no aplicable | other | gated en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública mínima: no se documentan datos de entrenamiento, algoritmo, métricas ni variables de entrada, lo que impide evaluar su fiabilidad.
- Riesgo de sesgo: al desconocerse el dataset, no puede descartarse un sesgo geográfico o temporal (por ejemplo, edificios de una región o época concreta).
- Riesgo de error en la predicción: la banda EPC depende de muchos factores físicos que un modelo tabular puede no capturar; las predicciones no sustituyen una certificación oficial.
- Licencia `other` sin términos detallados: no se puede confirmar el uso comercial; es necesario revisar las condiciones en HuggingFace antes de cualquier despliegue en producción.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad y la integración automatizada.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Sin pipeline declarado ni idiomas especificados: la integración con herramientas de HuggingFace es limitada.
- Fecha de creación en 2026 y contexto de curso (`Day2-Team4`): probablemente un ejercicio académico, no un modelo mantenido para producción.

## Enlaces

- HuggingFace: https://huggingface.co/iaac-maai/Day2-Team4-epc-band-predictor
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
