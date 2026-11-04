# sidman007/wsp-bert-insurance-v0-smoke

## Resumen

`wsp-bert-insurance-v0-smoke` es un clasificador de frases del dominio de seguros construido sobre `bert-base-uncased` mediante *weight-space programming* (edición directa de pesos), sin descenso de gradiente ni optimizadores. Lo desarrolla el usuario `sidman007` como prueba de concepto (`v0/smoke`) de un protocolo en el que un LLM editor lee y escribe los pesos del modelo aplicando matemática en forma cerrada sobre pesos y activaciones, a partir de un número presupuestado de pasadas hacia delante.

El modelo resuelve una tarea de clasificación multietiqueta de frases de pólizas y documentación de seguros en ocho categorías (`coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal`, `conditions_duties`). Solo se modifican dos tensores de la cabeza de clasificación (`classifier.weight` y `classifier.bias`), lo que supone 6.144 entradas editadas, un 0,006 % de los parámetros totales.

Es relevante como evidencia empírica de que es posible adaptar un encoder BERT a una tarea de nicho con un coste de cómputo mínimo y sin entrenamiento convencional, aunque con una advertencia importante: las probabilidades de salida no están calibradas y deben tratarse solo como etiqueta argmax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, `BertForSequenceClassification`) |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, no confirmada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un encoder Transformer bidireccional, y le añade una cabeza de clasificación de secuencias con 8 salidas. No hay entrenamiento por descenso de gradiente: un LLM editor modifica directamente los pesos mediante matemática en forma cerrada sobre los tensores y sobre las activaciones obtenidas de un número limitado de pasadas hacia delante. No se usan optimizadores ni retropropagación.

Los tensores editados son únicamente `classifier.bias` (8 entradas) y `classifier.weight` (6.144 entradas), es decir, 2 tensores y un 0,006 % de los parámetros totales. El repositorio incluye `edit_manifest.json` con los metadatos exactos del diff, incluyendo hashes SHA-256 de los tensores base y editados. El resultado reportado es una precisión de 87,91 % en test reservado y un macro-F1 de 0,8812.

## Capacidades

- Clasificación de frases de seguros en 8 etiquetas: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal`, `conditions_duties`.
- Clasificación de texto de una sola frase mediante `pipeline("text-classification")` de Transformers.
- Salida de etiqueta argmax utilizable directamente para decisiones de categorización.
- Idioma: inglés únicamente.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Etiquetado de cláusulas en documentos de pólizas: clasificar automáticamente fragmentos de texto de pólizas en categorías como exclusión, cobertura o procedimiento de siniestros para alimentar un índice de búsqueda interno.
- Enrutado de consultas de atención al cliente: usar la etiqueta argmax para dirigir una consulta entrante al equipo correspondiente (siniestros, prima, cancelación) antes de la intervención humana.
- Preprocesado para sistemas de extracción de información: clasificar frases de contratos antes de aplicar modelos de extracción de entidades o relaciones.
- Control de calidad documental: detectar frases que deberían pertenecer a una sección concreta de una póliza y marcar desviaciones en revisiones editoriales.
- Filtrado y triaje en revisión de siniestros: clasificar descripciones de incidencias para priorizar las que mencionan exclusiones o límites de franquicia.
- Prototipado rápido de clasificadores de dominio: servir como punto de partida de bajo coste para experimentar con weight-space programming en lugar de fine-tuning completo.
- Etiquetado asistido para anotación humana: preetiquetar corpus de seguros y usar la salida argmax como sugerencia en herramientas de anotación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en test reservado | 87,91 % |
| Macro-F1 | 0,8812 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU viable: 109,5 M parámetros y repo de 0,4 GB permiten ejecución en CPU para volúmenes moderados.
- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB de pesos, más activaciones; en fp16, aproximadamente 0,22 GB.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) con holgura; también en GPUs de gama baja e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` pipeline, servidores de inferencia compatibles con modelos BERT (por ejemplo, Text Generation Inference no aplica a clasificación; sí vLLM para clasificación, ONNX Runtime o TorchServe). No se documentan opciones específicas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wsp-bert-insurance-v0-smoke` | 109,5 M | no disponible | Clasificación de frases de seguros (8 etiquetas) | apache-2.0 | HuggingFace |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens (arquitectura base) | Modelo base sin cabeza de clasificación de dominio | apache-2.0 | HuggingFace |
| Fine-tuning convencional de BERT sobre el mismo corpus | 109,5 M | no disponible | Clasificación de frases de seguros | según corpus | no disponible |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Probabilidades no calibradas: la etiqueta ganadora suele puntuar en torno a 0,2 en lugar de 0,9 o más; debe usarse el argmax y ajustar una temperatura sobre datos de validación propios antes de interpretar los scores como confianzas.
- Solo inglés; no se documenta soporte multilingüe.
- Es una prueba de concepto (`v0/smoke`); el autor indica en el README del proyecto qué haría falta para llevarlo a producción, pero no se detalla en la información disponible.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar etiquetas incorrectas con alta seguridad aparente si se interpretan mal los scores.
- Sesgos: no documentados; al derivar de `bert-base-uncased` y de un corpus de seguros no especificado, pueden heredarse sesgos del corpus y del modelo base.
- Restricciones de licencia: apache-2.0 permite uso comercial con las condiciones de la licencia; conviene revisar la procedencia del corpus de entrenamiento, no documentada.
- Longitud de contexto no confirmada en la información disponible; debe verificarse antes de usarlo con frases largas.
- El modelo no ha sido validado con benchmarks públicos; los únicos datos son precisión y macro-F1 sobre un test reservado no descrito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidman007/wsp-bert-insurance-v0-smoke
- Repositorio del proyecto (código, logs y protocolo): https://github.com/siddharth-ghatti/weight-space-programming-poc
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
