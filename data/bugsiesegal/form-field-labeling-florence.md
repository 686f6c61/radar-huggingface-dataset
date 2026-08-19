# bugsiesegal/form-field-labeling-florence

## Resumen

El modelo `bugsiesegal/form-field-labeling-florence` es un adaptador LoRA (PEFT) desarrollado por bugsiesegal para el etiquetado de campos en formularios, diseñado específicamente para el pipeline de PDF de Formeze. Se basa en el modelo vision-language `microsoft/Florence-2-base` y añade una capa de adaptación que permite identificar y etiquetar campos de formularios (identidad, financieros, médicos, autenticación) a partir de regiones de imagen y tokens OCR cercanos. El adaptador se entrenó con un conjunto de datos re-etiquetado por un modelo profesor (Gemini-3.5-flash) y filtrado de etiquetas degeneradas, incluyendo 9 plantillas de formularios de autenticación reales.

La relevancia de este modelo radica en su enfoque de vocabulario abierto: no se limita a un conjunto fijo de etiquetas, sino que puede generar descripciones semánticas de los campos, lo que facilita su integración en sistemas de extracción de datos de documentos. Con 231,6 millones de parámetros en el adaptador (sobre los 0,23B del modelo base), ofrece una solución ligera y específica para tareas de etiquetado de formularios, con métricas de validación que cumplen los umbrales de calidad definidos por el autor. El adaptador está pensado como ayuda de revisión: las etiquetas generadas son propuestas que requieren aprobación explícita del usuario, no se proporciona confianza calibrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Florence-2-base) con adaptador LoRA |
| Parametros totales | 231.567.705 (adaptador LoRA) + 0,23B (modelo base Florence-2-base) |
| Parametros activos | 231.567.705 (solo adaptador; el base se congela) |
| Longitud de contexto | 4096 tokens (Florence-2-base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse con bitsandbytes) |
| Idiomas soportados | no disponible (Florence-2-base está entrenado principalmente en inglés; el adaptador no especifica idiomas) |
| Licencia | no disponible (el modelo base Florence-2-base tiene licencia MIT, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `microsoft/Florence-2-base`, un modelo de visión-lenguaje con arquitectura transformer encoder-decoder de 0,23B parámetros, entrenado para tareas como captioning, detección y segmentación. El adaptador LoRA se aplica a las proyecciones q/k/v/o y a las capas fully connected (fc1/fc2) del transformer, con rango r=64, alpha=128 y dropout 0.05. El entrenamiento se realizó con PEFT 0.18.0 sobre un conjunto de datos de páginas de formularios etiquetadas (`bugsiesegal/form-fields-for-layout-labeled-pages`), que fue re-etiquetado por un modelo profesor (Gemini-3.5-flash) con estilo de captioning verbatim y filtrado de etiquetas degeneradas. Se usaron prompts del tipo `<REGION_TO_DESCRIPTION>` junto con tokens de región y los k=12 tokens OCR más cercanos. El entrenamiento consistió en 2 épocas más una época de continuación (con optimizador reiniciado desde el adaptador de la época 2), sobre un split de entrenamiento agrupado por plantilla. El split de test inmutable no se usó para entrenamiento ni selección de modelo.

## Capacidades

- Etiquetado de campos de formularios con vocabulario abierto: genera descripciones semánticas de los campos a partir de regiones de imagen y contexto OCR.
- Detección de regiones de interés en páginas de formularios, combinando la capacidad de Florence-2-base con el adaptador.
- Clasificación semántica de etiquetas en categorías como identidad, financiera, médica y autenticación.
- Integración con pipelines de procesamiento de PDF (Formeze) para extracción de datos estructurados.
- Soporte de prompts con tokens de región y OCR, lo que permite contextualizar la tarea.
- No incluye soporte explícito de tool calling, agentes ni razonamiento multi-paso; es un adaptador de tarea específica.

## Casos de uso

- Digitalización de formularios administrativos: el adaptador puede procesar escaneos de formularios (impresos o manuscritos) y etiquetar automáticamente los campos (nombre, DNI, dirección, etc.) para su posterior extracción en bases de datos.
- Automatización de procesos de negocio (RPA): integrado en un pipeline de Formeze, permite clasificar y extraer datos de formularios de solicitud, facturas o contratos sin intervención manual, reduciendo errores de captura.
- Verificación de identidad en onboarding digital: al etiquetar campos de identidad (DNI, pasaporte) y autenticación (firmas, códigos), facilita la validación de documentos en procesos KYC.
- Gestión de historiales médicos: el adaptador puede etiquetar campos médicos (nombre del paciente, diagnóstico, medicación) en formularios clínicos, ayudando a la indexación de expedientes.
- Clasificación de formularios financieros: etiqueta campos como IBAN, importe o fecha de vencimiento en solicitudes de préstamo o transferencias, mejorando la precisión de los sistemas de extracción.
- Revisión asistida de documentos: dado que las etiquetas son propuestas, un operador humano puede aprobarlas o corregirlas, lo que lo hace útil en flujos de trabajo de verificación de calidad.

## Benchmarks y rendimiento

El autor proporciona métricas de validación sobre un split de validación agrupado por plantilla (759 imágenes, inferencia en T4 con INT8). No se han publicado comparaciones con otros modelos.

| Metrica | Valor | Umbral de politica |
|---|---|---|
| Exactitud semantica de clasificacion | 0.6048 | ≥ 0.60 |
| Exactitud semantica de extremo a extremo | 0.5202 | ≥ 0.45 |
| Exactitud de etiquetas de identidad | 0.658 | ≥ 0.60 |
| Exactitud de etiquetas financieras | 0.661 | ≥ 0.60 |
| Exactitud de etiquetas medicas | 0.653 | ≥ 0.60 |
| Exactitud de etiquetas de autenticacion (subconjunto reportado) | 0.867 (24 GT) | no vinculante |
| ECE del detector (calibrado Platt) | 0.0100 | ≤ 0.12 |

Estas métricas indican que el adaptador cumple los umbrales de calidad definidos por el autor para su uso como ayuda de revisión, aunque la exactitud de extremo a extremo es moderada (0.52), lo que refuerza la necesidad de supervisión humana.

## Requisitos de hardware

- VRAM estimada: el modelo base Florence-2-base requiere aproximadamente 1-2 GB en FP16 (0,23B parámetros). Con el adaptador LoRA, la carga total es similar, ya que el adaptador añade pocos parámetros adicionales. En INT8, la huella se reduce a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia (p. ej., NVIDIA GTX 1650, RTX 3050, T4). Para entrenamiento, se usó una T4 con INT8, por lo que GPUs de gama media son viables.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna (incluso integradas con suficiente VRAM compartida).
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft` en Python. También es compatible con `vLLM` (si se fusiona el adaptador) o con `llama.cpp` (si se convierte a GGUF, aunque no es el formato nativo). Para producción, se recomienda usar `transformers` con `bitsandbytes` para cuantización.
- Latencia y throughput: no se han publicado datos específicos. En una T4 con INT8, la inferencia de una imagen de formulario debería completarse en menos de 1 segundo, pero depende del tamaño de la imagen y del número de regiones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para etiquetado de formularios con vocabulario abierto. Como referencia, se compara con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Florence-2-base (sin adaptador) | 0,23B | 4096 | Captioning, deteccion, segmentacion | MIT | HuggingFace |
| Este adaptador (LoRA) | 0,23B + 231M | 4096 | Etiquetado de campos de formularios | no disponible | HuggingFace |
| Otros modelos de extraccion de formularios (p. ej., LayoutLMv3) | ~0,1-0,4B | 512-2048 | Extraccion de campos | MIT (LayoutLMv3) | HuggingFace |

La comparativa es limitada porque el adaptador es específico de una tarea y no se han publicado benchmarks frente a alternativas. LayoutLMv3 es un modelo de solo texto (no vision-language) y no soporta vocabulario abierto de la misma manera.

## Limitaciones y advertencias

- El adaptador está diseñado como ayuda de revisión: las etiquetas generadas son propuestas y requieren aprobación explícita del usuario. No se proporciona confianza calibrada para las etiquetas, por lo que no debe usarse en flujos totalmente automatizados sin supervisión.
- La exactitud de extremo a extremo es moderada (0.52), lo que implica que una proporción significativa de etiquetas puede ser incorrecta o incompleta.
- El entrenamiento se realizó con un conjunto de datos limitado (incluye 9 plantillas de formularios de autenticación reales), por lo que el rendimiento puede degradarse en formularios con diseños muy diferentes.
- El modelo base Florence-2-base está entrenado principalmente en inglés; el adaptador no especifica soporte multilingüe, por lo que su rendimiento en otros idiomas es incierto.
- No se ha publicado información sobre sesgos. Dado que el conjunto de datos proviene de formularios reales, puede heredar sesgos de género, raza o clase en los campos de identidad.
- Riesgo de alucinación: al ser un modelo generativo, puede producir etiquetas plausibles pero incorrectas, especialmente en regiones ambiguas o con OCR deficiente.
- La licencia del adaptador no está declarada; aunque el modelo base es MIT, el uso comercial del adaptador debe verificarse con el autor.
- El adaptador depende de la versión específica de Florence-2-base (`5ca5edf5bd017b9919c05d08aebef5e4c7ac3bac`); cambios en el modelo base pueden romper la compatibilidad.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/bugsiesegal/form-field-labeling-florence
- Dataset de entrenamiento: https://huggingface.co/datasets/bugsiesegal/form-fields-for-layout-labeled-pages
- Modelo base: https://huggingface.co/microsoft/Florence-2-base
