# sevenreasons/von-onnx-fp16

## Resumen

Von ONNX FP16 es una exportación a formato ONNX en precisión FP16 del modelo `wfzyx/von-1.0`, publicada por el usuario `sevenreasons`. Se trata de un modelo de decisión (etiquetado como `decision-model` y `nli` en el repositorio) que resuelve una tarea de inferencia de lenguaje natural con tres clases de salida: entailment (índice 0), y otras dos clases no nombradas explícitamente en la model card. El problema que aborda es el de la clasificación de pares de textos (premisa e hipótesis) para determinar si una afirmación se deduce de otra, un componente habitual en pipelines de verificación factual, guardrails de LLM y enrutamiento de decisiones.

La relevancia de este repositorio concreto no está en el modelo base, sino en el artefacto de despliegue: una conversión a ONNX Runtime con precisión FP16, batch y longitud de secuencia dinámicos, y una validación numérica explícita frente al modelo original en PyTorch. El autor documenta una diferencia máxima de logits de 0,00488281 en FP16 (frente a 0,00000381 en FP32) y una coincidencia del 100 % en las clasificaciones finales sobre 300 casos de prueba, con una precisión idéntica del 93,0 %.

El repositorio ocupa 0,8 GB y no declara número de parámetros, arquitectura concreta, idiomas soportados ni pipeline de HuggingFace. Su licencia es Apache-2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales declaradas. La fecha de creación registrada en HuggingFace es el 19 de septiembre de 2026, y el modelo acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que no existe validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación con 3 clases de salida; exportación ONNX de `wfzyx/von-1.0`) |
| Parametros totales | no disponible (el repositorio FP16 ocupa 0,8 GB; ver estimación en "Requisitos de hardware") |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; se validaron longitudes dinámicas de 8, 15, 32, 128 y 512 tokens |
| Tipos de cuantizacion | FP16 (este repositorio); existe una exportación FP32 de referencia usada en la validación numérica |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnxruntime`, FP16), batch y secuencia dinámicos |
| Entradas | `input_ids` int64 `[batch, sequence]`, `attention_mask` int64 `[batch, sequence]` |
| Salidas | `logits` `[batch, 3]`; índice de la clase entailment = 0 |
| Modelo base | `wfzyx/von-1.0` |
| Tamaño del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni su procedimiento de entrenamiento. Por la firma de entradas y salidas (`input_ids` + `attention_mask` → `logits` de 3 dimensiones) y por las etiquetas del repositorio (`nli`, `decision-model`), se trata de un clasificador de pares de secuencias con una cabeza de clasificación de tres clases, el esquema estándar de los modelos de inferencia de lenguaje natural (entailment, neutral, contradiction). No se especifica si el encoder es de tipo BERT, RoBERTa, DeBERTa u otro, ni el número de capas, dimensión oculta o cabezas de atención.

Tampoco hay información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en clasificadores de este tipo). La única información de evaluación disponible es empírica y se refiere a la fidelidad de la exportación, no al entrenamiento: frente al modelo PyTorch original, la exportación FP32 presenta una diferencia máxima de logits de 0,00000381 y media de 0,00000137, mientras que la FP16 alcanza una diferencia máxima de 0,00488281 y media de 0,00244141. Sobre 300 casos de clasificación reales, ambas versiones (PyTorch y ONNX) producen exactamente las mismas clasificaciones finales.

La innovación técnica destacable es, por tanto, la propia conversión: soporte de formas dinámicas verificadas en cinco configuraciones distintas de batch y secuencia, y validación end-to-end con métricas probabilísticas (Brier score y log loss) además de la exactitud, lo que permite cuantificar el impacto real de la pérdida de precisión.

## Capacidades

- Clasificación de pares de textos en tres clases, con la clase entailment en el índice 0 de la salida `logits`.
- Salida de logits crudos por clase, lo que permite calcular probabilidades con softmax y aplicar umbrales de decisión propios.
- Procesamiento por lotes con batch dinámico: se validaron lotes de tamaño 1, 2 y 4.
- Procesamiento de secuencias de longitud variable, validado hasta 512 tokens.
- Ejecución en CPU y GPU mediante ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- Compatibilidad con el ecosistema ONNX (Optimum, servidores de inferencia compatibles con ONNX Runtime).
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking". Es un clasificador, no un modelo generativo.
- No se declaran capacidades multilingües ni un listado de idiomas soportados.

## Casos de uso

- Verificación factual en pipelines RAG: dado un fragmento recuperado (premisa) y una frase generada por un LLM (hipótesis), el modelo determina si la afirmación queda respaldada por el contexto. Es el uso canónico de un modelo NLI como guardrail y encaja con la etiqueta `decision-model` del repositorio.
- Detección de alucinaciones en producción: integrado como comprobación posterior a la generación, permite descartar o marcar respuestas cuya hipótesis no se deduce del contexto recuperado, reduciendo el riesgo de respuestas inventadas antes de mostrarlas al usuario.
- Enrutamiento de decisiones en sistemas de agentes: clasificar si una instrucción o una observación implica una condición concreta (por ejemplo, si el usuario ha confirmado una acción) para decidir la siguiente llamada a herramienta.
- Moderación y coherencia de contenido: detectar pares de afirmaciones contradictorias en hilos de conversación o en reclamaciones de usuario, marcando inconsistencias para revisión humana.
- Deduplicación y detección de contradicciones documentales: comparar pares de cláusulas, artículos o registros para identificar duplicados semánticos o conflictos normativos en bases documentales grandes, con procesamiento por lotes.
- Validación de resúmenes y extracción estructurada: comprobar si cada frase de un resumen se deduce del documento original, o si un campo extraído está respaldado por el texto fuente.
- Despliegue en entornos sin GPU y en el borde: al ser un artefacto ONNX FP16 con formas dinámicas, puede ejecutarse en servidores CPU o en dispositivos con recursos limitados usando ONNX Runtime.
- Evaluación automática de calidad de anotaciones: filtrar pares inconsistente en conjuntos de datos de entrenamiento antes de usarlos para ajuste.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de la validación incluida en la model card, realizada sobre 300 casos de clasificación de estilo real codificados a mano. No hay resultados de MMLU, HumanEval, GSM8K ni de conjuntos NLI estándar como MNLI, SNLI o FEVER.

| Metrica | PyTorch (referencia) | ONNX FP16 | ONNX FP32 |
|---|---|---|---|
| Exactitud global | 279/300 (93,0 %) | 279/300 (93,0 %) | no disponible |
| Brier score | 0,0650 | 0,0649 | no disponible |
| Log loss | 0,2503 | 0,2501 | no disponible |
| Diferencia maxima de logits | — | 0,00488281 | 0,00000381 |
| Diferencia media de logits | — | 0,00244141 | 0,00000137 |
| Tiempo de inferencia (300 casos) | 62,78 s | 62,17 s | no disponible |
| Rendimiento | 4,78 decisiones/s | 4,83 decisiones/s | no disponible |

El autor indica que las 300 pruebas produjeron la misma clasificación final en ambos motores. El hardware empleado en la medición no se especifica, por lo que la cifra de 4,83 decisiones/s no es extrapolable a otras plataformas. La mejora de rendimiento de ONNX frente a PyTorch es marginal (aproximadamente un 1 %), lo que sugiere que la ventaja de la exportación está en la portabilidad y en la ausencia de dependencia de PyTorch, no en la velocidad.

## Requisitos de hardware

- VRAM estimada: el repositorio FP16 pesa 0,8 GB. Asumiendo 2 bytes por parámetro en FP16, el modelo tendría del orden de 4 × 10^8 parámetros, aunque este dato no está confirmado por el autor. En la práctica, un modelo de ese tamaño cabe holgadamente en cualquier GPU de consumo con 4 GB o más de VRAM, sumando el espacio de activaciones y el contexto.
- GPU recomendadas: no se especifica ninguna. Por tamaño, bastaría una RTX 3060, RTX 4060, RTX 4090 o cualquier GPU de centro de datos (A100, H100, L40S) si se necesita procesar grandes volúmenes por lotes. Para lotes pequeños, la GPU aporta poco frente a la CPU.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del artefacto, aunque no hay confirmación explícita del autor.
- Despliegue: ONNX Runtime (Python, C++, C#, Java), servidores compatibles con ONNX como Triton Inference Server, y HuggingFace Optimum para la ruta de exportación y carga. No procede vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: las únicas cifras publicadas son 4,83 decisiones/s y 0,2501 de log loss sobre 300 casos, sin especificar hardware. Una velocidad tan baja apunta a inferencia en CPU o a un modelo de tamaño medio-grande; no hay datos de latencia por petición ni de throughput con lotes grandes.
- Memoria en CPU: el artefacto de 0,8 GB más los buffers de activación caben en cualquier portátil actual, lo que habilita despliegues sin acelerador.

## Comparativa con modelos similares

No se dispone de una comparativa verificada en la información proporcionada. Los modelos de la misma categoría (clasificadores NLI de tres clases exportables a ONNX) incluyen alternativas de referencia como `cross-encoder/nli-deberta-v3-base`, `facebook/bart-large-mnli` y `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli`. Los valores de esta tabla proceden de documentación pública general y no han sido verificados en la búsqueda asociada a esta ficha; se marcan como no disponibles cuando no hay dato fiable.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento NLI |
|---|---|---|---|---|---|
| `sevenreasons/von-onnx-fp16` | no disponible | no disponible (validado hasta 512 tokens) | Apache-2.0 | ONNX FP16 | 93,0 % en 300 casos propios; sin resultados en MNLI/SNLI |
| `cross-encoder/nli-deberta-v3-base` | no verificado | no verificado | no verificado | safetensors / PyTorch | no disponible en esta ficha |
| `facebook/bart-large-mnli` | no verificado | no verificado | no verificado | safetensors / PyTorch | no disponible en esta ficha |
| `MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli` | no verificado | no verificado | no verificado | safetensors / PyTorch | no disponible en esta ficha |

La diferencia operativa relevante es el formato: `von-onnx-fp16` se distribuye ya convertido y validado numéricamente para ONNX Runtime, mientras que las alternativas citadas requieren una conversión propia (por ejemplo, con Optimum) si se quieren desplegar sin PyTorch.

## Limitaciones y advertencias

- La model card no documenta la arquitectura, el número de parámetros, los idiomas soportados, el dataset de entrenamiento ni los procedimientos de ajuste. Cualquier decisión de producción basada en este modelo parte de información incompleta.
- El modelo base `wfzyx/von-1.0` no tiene ficha detallada disponible en la información proporcionada, por lo que se desconoce su origen, sus sesgos y su calidad fuera del conjunto de validación del autor.
- Los únicos datos de evaluación son 300 casos "de estilo real" codificados a mano por el propio autor. No hay evaluación en conjuntos NLI estándar ni comparación independiente, y el tamaño de la muestra limita la significación estadística de la precisión del 93,0 %.
- La exportación FP16 introduce un error máximo de logits de 0,00488281. En los 300 casos probados no cambió ninguna clasificación, pero en entradas cercanas al umbral de decisión ese error podría alterar el resultado; conviene fijar umbrales con margen.
- La pérdida de precisión FP16 no está cuantificada para entradas fuera de las longitudes de prueba (8, 15, 32, 128 y 512 tokens).
- No hay información sobre sesgos demográficos, culturales o lingüísticos. Un clasificador NLI puede heredar sesgos del corpus con el que se entrenó su modelo base.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre. Sin embargo, puede producir clasificaciones erróneas en dominios alejados de su distribución de entrenamiento, lo que en un guardrail se traduce en falsos negativos de verificación factual.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe. No se declaran restricciones adicionales.
- El repositorio registra 0 descargas y 0 "likes", sin uso comunitario conocido. No hay garantía de mantenimiento, soporte ni actualizaciones por parte del autor.
- La fecha de creación registrada (19 de septiembre de 2026) es inusual y conviene verificarla antes de citar el modelo en documentación.
- Contexto no declarado: aunque se validaron secuencias de hasta 512 tokens, no se confirma que el modelo base tenga una ventana mayor; asumir longitudes superiores a 512 sin verificación es arriesgado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/sevenreasons/von-onnx-fp16
- Modelo base: https://huggingface.co/wfzyx/von-1.0
- La búsqueda web asociada a esta ficha no devolvió resultados relevantes: los enlaces recuperados corresponden a máquinas de soldadura de la marca Kühtreiber (KITin 165) y no guardan relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales.
