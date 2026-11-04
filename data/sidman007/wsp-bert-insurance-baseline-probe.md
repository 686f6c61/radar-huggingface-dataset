# sidman007/wsp-bert-insurance-baseline-probe

## Resumen

`wsp-bert-insurance-baseline-probe` es un modelo de clasificación de texto en inglés construido sobre `bert-base-uncased` (109.488.392 parámetros) y especializado en etiquetar oraciones de seguros en ocho categorías documentales: concesión de cobertura, exclusión, pago de prima, límites y franquicias, procedimiento de siniestros, definiciones, cancelación/renovación de término y condiciones y deberes. Lo publica el usuario `sidman007` bajo licencia Apache 2.0 y con el pipeline `text-classification` de HuggingFace.

Su interés no reside en el rendimiento —88,53 % de accuracy y macro-F1 de 0,8870 en test retenido, cifras razonables pero no punteras para un BERT fine-tuned— sino en el método de construcción: no se entrenó con descenso de gradiente, sino mediante *weight-space programming*. Un LLM editor leyó y escribió directamente los pesos del modelo aplicando matemática en forma cerrada sobre pesos y activaciones, a partir de un número acotado de forward passes, sin retropropagación ni optimizadores.

El resultado es una sonda de validación (*probe*) de un proyecto de prueba de concepto, no un modelo listo para producción. El propio autor advierte de que las probabilidades softmax están sin calibrar (la etiqueta ganadora suele puntuar en torno a 0,2), por lo que debe usarse el argmax y recalibrar la temperatura con datos propios antes de interpretar los scores como confianzas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, `BertForSequenceClassification`) |
| Parámetros totales | 109.488.392 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | `google-bert/bert-base-uncased` (finetune) |
| Tamaño del repositorio | 0,4 GB |
| Pipeline | `text-classification` |
| Etiquetas | 8 clases de seguros (ver resumen) |
| Tensores editados | `classifier.bias` (8 entradas), `classifier.weight` (6.144 entradas); 0,006 % de los parámetros |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base sin modificar: un encoder transformer de 12 capas con atención bidireccional y una cabeza de clasificación de secuencia sobre el token `[CLS]`. Lo singular está en el proceso de adaptación. En lugar de un ciclo de entrenamiento convencional, un LLM editor modificó únicamente los tensores de la capa de clasificación (`classifier.weight` y `classifier.bias`), dejando intacto el resto del encoder preentrenado. La edición se calculó en forma cerrada a partir de pesos y activaciones obtenidas con un número presupuestado de forward passes, sin backprop ni optimizadores.

El alcance del cambio es mínimo: 6.152 entradas modificadas de un total de 109,5 millones de parámetros, es decir, el 0,006 %. El repositorio incluye un `edit_manifest.json` con metadatos de diff exactos (sha256 de los tensores base y editados), lo que permite auditar la intervención. No se documentan en la información disponible el volumen de datos de entrenamiento, la composición del corpus de seguros ni si hubo ajuste por RLHF o DPO; el protocolo completo se remite al repositorio de GitHub del proyecto.

## Capacidades

- Clasificación de oraciones de seguros en 8 categorías: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal`, `conditions_duties`.
- Clasificación de texto de una sola pasada con salida de etiqueta argmax.
- Uso directo mediante el pipeline `text-classification` de Transformers.
- Procesamiento de texto en inglés exclusivamente.
- No se documentan capacidades de generación, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking: es un clasificador, no un modelo generativo.

## Casos de uso

- **Triaje de pólizas y documentación contractual**: clasificar automáticamente cláusulas y oraciones extraídas de pólizas en las ocho categorías para enrutarlas a los equipos correspondientes (cobertura, exclusión, siniestros). Adecuado por su especialización en el dominio y su bajo coste de inferencia.
- **Enriquecimiento de bases documentales**: etiquetar corpus de seguros ya digitalizados para construir índices por tipo de cláusula, facilitando búsquedas y auditorías internas.
- **Preprocesado para sistemas RAG**: usar la etiqueta como metadato de filtrado antes de recuperar fragmentos en un asistente documental sobre pólizas, de modo que las consultas sobre exclusiones recuperen solo cláusulas de exclusión.
- **Detección de exclusiones en revisión de contratos**: señalar oraciones clasificadas como `exclusion` para que un revisor humano las valide antes de la firma, reduciendo el tiempo de lectura.
- **Monitorización de cambios normativos o de producto**: comparar la distribución de etiquetas entre versiones de un mismo documento para detectar introducción o eliminación de condiciones y deberes.
- **Sonda de validación de weight-space programming**: servir como referencia reproducible para investigar métodos de edición de pesos sin gradiente, comparando su calidad con un fine-tuning convencional sobre el mismo corpus y las mismas ocho clases.
- **Prototipado rápido de clasificadores de dominio**: punto de partida para experimentos internos con licencia Apache 2.0, siempre que se recalibren las probabilidades y se valide en datos propios.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Accuracy en test retenido | 88,53 % |
| Macro-F1 en test retenido | 0,8870 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, etc.) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,44 GB solo para pesos (109,5 M de parámetros); con activaciones y overhead del runtime, menos de 2 GB en la práctica.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir lotes grandes; no obstante, el modelo es lo bastante pequeño para que la CPU sea viable en cargas moderadas.
- Opciones de despliegue: `transformers` pipeline, TorchServe, TGI, ONNX Runtime y `optimum`; no se documenta compatibilidad con llama.cpp u Ollama (orientados a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Notas |
|---|---|---|---|---|---|
| `wsp-bert-insurance-baseline-probe` | 109,5 M | no disponible | Seguros (8 clases) | Apache 2.0 | Editado por weight-space programming; softmax sin calibrar |
| `bert-base-uncased` (Google) | 110 M | 512 tokens | General | Apache 2.0 | Base sin cabeza de clasificación de dominio; requiere fine-tuning |
| `ProsusAI/finbert` | ~110 M | 512 tokens | Finanzas (sentimiento) | Apache 2.0 | Fine-tuning convencional con gradiente; dominio financiero, no seguros |
| `nlpaueb/legal-bert-base-uncased` | ~110 M | 512 tokens | Legal | Apache 2.0 | Preentrenado en corpus legal; requiere fine-tuning para clasificación |

La comparación directa de rendimiento no es posible porque no se han publicado resultados de benchmarks comparables en la información disponible. La diferencia metodológica frente a los alternativas es que este modelo se adapta por edición de pesos en lugar de fine-tuning supervisado.

## Limitaciones y advertencias

- **Probabilidades sin calibrar**: los softmax son planos (la etiqueta ganadora ronda 0,2). No usar los scores como confianzas sin ajustar una temperatura con datos propios de validación.
- **Alcance de la edición mínimo**: solo se modifican 6.152 entradas de la cabeza de clasificación; el encoder conserva el conocimiento genérico de `bert-base-uncased`, lo que puede limitar la generalización a jerga de seguros muy específica.
- **Solo inglés**: no soporta castellano ni otros idiomas; el tag de idioma es `en`.
- **Riesgo de alucinación de etiqueta**: al ser un clasificador, el riesgo se traduce en asignar una categoría incorrecta con alta seguridad aparente; conviene validación humana en flujos sensibles (exclusiones, siniestros).
- **Sesgos**: no documentados por el autor; al heredar el preentrenamiento de `bert-base-uncased`, puede arrastrar sesgos del corpus original (WebText, BooksCorpus, Wikipedia en inglés).
- **Estado de sonda de investigación**: el autor lo etiqueta como `_baselines/probe`; no hay garantías de mantenimiento, soporte ni estabilidad de la API.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor advierte explícitamente de que se trata de un artefacto de prueba de concepto y remite al README del proyecto para lo necesario antes de usarlo en producción.
- **Contexto**: la longitud máxima no se confirma en la información; asumir 512 tokens (límite de BERT base) hasta verificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidman007/wsp-bert-insurance-baseline-probe
- Repositorio del proyecto (protocolo, logs y resultados): https://github.com/siddharth-ghatti/weight-space-programming-poc
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
