# roselabs-io/gliner-multi-v2.1-onnx

## Resumen

GLiNER multi v2.1 (ONNX) es la exportación a formato ONNX del modelo `urchade/gliner_multi-v2.1`, un detector de entidades zero-shot basado en la arquitectura GLiNER (Generalist Model for Named Entity Recognition using Bidirectional Transformer). El modelo recibe un texto y una lista de etiquetas de tipo de entidad definidas en tiempo de inferencia, y devuelve los spans del texto que corresponden a esas etiquetas. No requiere entrenamiento específico por dominio: el conjunto de tipos de entidad se define en cada llamada.

El repositorio lo publica el usuario `roselabs-io` como un artefacto derivado: contiene el grafo `model.onnx` en float32 (opset 19) exportado desde el checkpoint PyTorch original, junto con `gliner_config.json` y los ficheros del tokenizador. El encoder subyacente es `microsoft/mdeberta-v3-base`, lo que le confiere capacidad multilingüe. El tamaño del repositorio es de 1,2 GB.

Su relevancia práctica reside en el formato: al estar exportado a ONNX Runtime, puede desplegarse en entornos sin PyTorch, con inferencia optimizada en CPU o GPU, lo que facilita su integración en pipelines de anonimización o preprocesado de texto antes de compartir datos. La model card reporta una medición de recall sobre notas clínicas sintéticas en francés, con recall por solapamiento de 0,954 y recall exacto de 0,764.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER sobre encoder bidirectional transformer (mDeBERTa-v3-base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (unico formato publicado en este repo) |
| Idiomas soportados | multilingue (etiquetas proporcionadas por el usuario en el idioma del texto) |
| Licencia | Apache-2.0 (encoder mDeBERTa-v3-base bajo MIT, aviso en `NOTICE`) |
| Formato de pesos | ONNX (opset 19), `model.onnx` float32 |

## Arquitectura y entrenamiento

GLiNER es un modelo de reconocimiento de entidades nombradas formulado como una tarea de matching entre representaciones de spans de texto y representaciones de etiquetas de entidad. El encoder bidirectional transformer (en este caso `microsoft/mdeberta-v3-base`) codifica conjuntamente el texto y las etiquetas candidatas, y una cabeza de predicción puntúa la compatibilidad entre cada span y cada etiqueta. Esto permite definir el conjunto de tipos de entidad en tiempo de inferencia sin reentrenamiento, a diferencia de los NER clásicos con etiquetas fijas.

Esta ficha corresponde a un artefacto derivado: el grafo ONNX se exportó desde el checkpoint PyTorch de `urchade/gliner_multi-v2.1` en la revisión `443d26d6`. La model card no detalla la composición del dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aquí. La innovación de este repositorio es el formato: exportación a ONNX Runtime (opset 19) en float32 para despliegue sin dependencia de PyTorch.

## Capacidades

- Detección de entidades zero-shot: identifica spans de texto correspondientes a etiquetas de tipo de entidad definidas en la llamada.
- Extracción de tipos arbitrarios: personas, organizaciones, lugares, direcciones, fechas, teléfonos, correos electrónicos, identificadores y cualquier otro tipo que el usuario nombre.
- Multilingüe: las etiquetas se proporcionan en el idioma del texto; la medición reportada se realizó en francés.
- Salida a nivel de span con puntuación de confianza, lo que permite aplicar umbrales (en la medición se usó un umbral de 0,3).
- Inferencia vía ONNX Runtime, sin necesidad de PyTorch.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling ni agentes; el modelo es exclusivamente un extractor de entidades.

## Casos de uso

- Anonimización previa a compartir datos: el modelo extrae nombres de personas, organizaciones, direcciones, teléfonos y correos antes de que un texto salga de un entorno controlado. La model card indica explícitamente este uso previsto, con revisión humana posterior porque el recall no es del 100 %.
- Preprocesado de notas clínicas: la medición reportada sobre 60 notas clínicas sintéticas en francés con 2 423 spans de referencia demuestra su aplicabilidad a dominios sanitarios, siempre con validación humana.
- Enriquecimiento de documentos para pipelines de búsqueda o indexación: extracción de entidades con etiquetas definidas por el dominio del corpus (por ejemplo, productos, normativas o referencias legales).
- Procesamiento por lotes en infraestructura sin GPU: al ser ONNX float32, puede ejecutarse en CPU con ONNX Runtime en servicios de backend.
- Filtrado y clasificación de textos entrantes: detección de tipos de entidad relevantes (por ejemplo, identificadores o datos personales) antes de enrutar documentos.
- Construcción de datasets etiquetados de forma asistida: generación de candidatos de spans que un anotador humano revisa y corrige, reduciendo el coste de anotación manual.
- Integración en flujos de cumplimiento de protección de datos: detección de categorías de datos personales antes de almacenamiento o transferencia.

## Benchmarks y rendimiento

La model card reporta una única medición, sobre un split reservado de 60 notas clínicas sintéticas en francés con 2 423 spans de entidad de referencia (sin datos reales de pacientes), con una lista de 16 etiquetas clínicas y umbral de puntuación de span de 0,3, medida el 2026-11-03:

| Medida | Valor |
|---|---|
| Recall por solapamiento | 0,954 |
| Recall exacto | 0,764 |
| Precision por solapamiento | 0,565 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor advierte que el split es pequeño y sintético y que las cifras no son extrapolables a otros dominios ni a textos más largos o menos regulares.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,2 GB y el grafo es float32, por lo que la huella en memoria es del orden de ese tamaño más las activaciones, dependiente de la longitud de entrada.
- GPU recomendadas: no especificadas en la información disponible. Al ser un modelo basado en mDeBERTa-v3-base (encoder de tamaño base), es viable en GPU de consumo.
- GPU de consumo: no se confirma compatibilidad concreta con modelos como RTX 4090 u otras; el tamaño del encoder sugiere que cabe en GPU de consumo con memoria suficiente, pero no hay dato publicado.
- Despliegue: ONNX Runtime es la vía prevista (grafo opset 19). No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| roselabs-io/gliner-multi-v2.1-onnx | no disponible | no disponible | ONNX (opset 19) | Apache-2.0 | Exportación float32 del modelo base; inferencia vía ONNX Runtime |
| urchade/gliner_multi-v2.1 | no disponible | no disponible | PyTorch (safetensors/bin, no confirmado) | Apache-2.0 | Modelo original del que deriva este artefacto |
| urchade/gliner_multi (versiones previas) | no disponible | no disponible | PyTorch | Apache-2.0 | Versiones anteriores de la familia GLiNER multilingüe |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Recall por debajo del 100 %: la propia model card indica que se requiere revisión humana de los spans antes de dar el texto por anonimizado o compartido.
- Medición limitada: los resultados reportados provienen de un split pequeño y sintético de 60 notas clínicas en francés; no son extrapolables a otros dominios, idiomas ni a textos más largos o irregulares.
- Precision por solapamiento de 0,565 en la medición reportada: implica una proporción significativa de falsos positivos con el umbral de 0,3, lo que refuerza la necesidad de validación.
- Sin datos publicados sobre sesgos, tasas de alucinación (concepto poco aplicable a un extractor de spans) ni comportamiento por idioma.
- Licencia Apache-2.0 para el grafo, con aviso MIT del encoder mDeBERTa-v3-base en `NOTICE`; el uso comercial está permitido bajo los términos de dichas licencias.
- El artefacto es una exportación: cualquier cambio en el modelo base no se refleja automáticamente; la revisión de origen es `443d26d6`.
- No se documentan limitaciones de longitud de contexto ni de idiomas concretos más allá de la naturaleza multilingüe del encoder.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/roselabs-io/gliner-multi-v2.1-onnx
- Modelo base: https://huggingface.co/urchade/gliner_multi-v2.1
- Encoder: https://huggingface.co/microsoft/mdeberta-v3-base
- Paper GLiNER (Zaratiana et al.): https://arxiv.org/abs/2311.08526
