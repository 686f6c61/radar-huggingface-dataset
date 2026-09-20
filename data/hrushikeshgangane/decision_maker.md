# HrushikeshGangane/decision_maker

## Resumen

`decision_maker` es un codificador de decisiones desarrollado por el usuario HrushikeshGangane y publicado en HuggingFace bajo el identificador `HrushikeshGangane/decision_maker`. El modelo recibe una tupla formada por un estado (`state`), una pregunta (`question`) y una lista variable de opciones, y devuelve en una sola pasada de encoder una distribución de probabilidad calibrada sobre esas opciones. No genera texto libre: es un clasificador de opción múltiple orientado a la selección de alternativas, etiquetado por el autor como "system-one", es decir, pensado para decisiones rápidas e intuitivas más que para razonamiento deliberativo en varios pasos.

Técnicamente se apoya en `bert-large-uncased` como encoder bidireccional base, al que se añade un Transformer de decisión de cuatro capas con una consulta `[DECIDE]` y claves `[OPTION]` puntuadas mediante producto escalar, más un escalado de temperatura global aplicado en post-entrenamiento para calibrar las probabilidades. El modelo tiene 386.057.216 parámetros (unos 386 M) y un límite de entrada estructurada de 256 tokens, bastante más restrictivo que los 512 tokens habituales de BERT-Large. El repositorio ocupa 1,5 GB y los pesos se distribuyen en formato safetensors.

Su relevancia actual es acotada pero concreta: la mayoría de los modelos de decisión publicados no reportan métricas de calibración, y este sí lo hace. En su partición de desarrollo, el escalado de temperatura reduce el error de calibración esperado (ECE) de 0,121 a 0,045 y la NLL de 0,772 a 0,625 sin modificar la accuracy (0,699), lo que lo hace utilizable en escenarios donde el umbral de confianza importa tanto como la etiqueta predicha. Como contrapartida, no declara licencia ni idiomas, no documenta el conjunto de entrenamiento y no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional `bert-large-uncased` más Transformer de decisión de cuatro capas con consulta `[DECIDE]` y claves `[OPTION]` puntuadas por producto escalar |
| Parámetros totales | 386.057.216 (~386 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens de entrada estructurada (límite del runner de referencia) |
| Tipos de cuantización | No disponible; el autor solo publica pesos en safetensors, sin variantes GGUF, AWQ, GPTQ ni cuantizaciones documentadas |
| Idiomas soportados | No disponible; la base declarada es `bert-large-uncased`, de vocabulario en inglés |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline en HuggingFace | text-classification (con tags `multiple-choice`, `calibrated-classification`, `system-one`) |
| Tamaño del repositorio | 1,5 GB |
| Fecha de creación | 2026-09-20 |
| Última actualización | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura combina un encoder bidireccional `bert-large-uncased` con un cabezal específico de decisión: un Transformer de cuatro capas que introduce dos tokens especiales, `[DECIDE]` como consulta y `[OPTION]` como clave, y puntúa cada opción mediante el producto escalar entre la consulta y las claves de las alternativas candidatas. Este esquema permite manejar un número variable de opciones en una única pasada de encoder, en lugar de reformular cada alternativa como un par de secuencias independiente. Sobre las puntuaciones se aplica un escalado de temperatura global en post-entrenamiento, una técnica clásica de calibración que no altera el orden de las predicciones pero sí la confianza asignada a cada una.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste como RLHF, DPO o instrucciones supervisadas. El autor tampoco documenta el procedimiento de ajuste del encoder base ni si este se congeló durante el entrenamiento del cabezal. La innovación destacable es, por tanto, metodológica antes que arquitectónica: la separación explícita entre puntuación y calibración, con métricas de calibración publicadas junto a las de precisión.

## Capacidades

- Clasificación de opción múltiple: dada una pregunta y una lista de opciones, devuelve una distribución de probabilidad sobre todas ellas en una sola pasada.
- Clasificación calibrada: las probabilidades están escaladas por temperatura, con un ECE de 0,045 en la partición de validación de la release, lo que permite usarlas directamente como umbrales de confianza.
- Condicionamiento por estado: la decisión se toma en función de un `state` explícito además de la pregunta, lo que permite inyectar contexto de conversación, estado de un sistema o resultados previos.
- Número variable de opciones: el formato `[DECIDE]`/`[OPTION]` admite listas de alternativas de longitud variable sin reentrenar el cabezal.
- Integración en pipelines de clasificación estándar: el modelo se expone con el pipeline `text-classification` de HuggingFace.
- No dispone de generación de texto, tool calling, soporte de agentes multi-paso, capacidades de visión ni audio según la información disponible.
- No se documentan capacidades multilingües; la base declarada tiene vocabulario en inglés.

## Casos de uso

- Enrutado de decisiones en agentes: el modelo puede actuar como "system-one" rápido para elegir entre un conjunto cerrado de acciones o herramientas antes de invocar un modelo generativo más costoso, aprovechando que resuelve la elección en una única pasada de encoder sobre 256 tokens.
- Triaje de tickets de soporte: dado el estado de un ticket y una lista de colas o categorías predefinidas, el modelo devuelve la probabilidad de cada cola; el ECE bajo permite enrutar automáticamente solo los casos con confianza alta y derivar el resto a revisión humana.
- Selección de respuesta en sistemas de QA cerrado: útil cuando las respuestas candidatas ya vienen de un retriever y solo hay que elegir la mejor, sin generar texto nuevo.
- Moderación de contenido con categorías excluyentes: la salida calibrada permite fijar umbrales por categoría y auditar el porcentaje de casos que caen por debajo del umbral de confianza.
- Anotación asistida y active learning: al exponer probabilidades calibradas, el modelo permite priorizar para revisión humana aquellos ejemplos con mayor incertidumbre, en lugar de ordenar por entropía sin calibrar.
- Decisiones de negocio con umbral de riesgo: por ejemplo, aprobar o denegar una solicitud entre un conjunto de resoluciones posibles, usando la probabilidad calibrada para aplicar una banda de revisión manual intermedia.
- Selección de candidatos en ranking de recomendación: cuando el número de ítems candidatos está acotado y se puede reformular como elección múltiple condicionada por el estado del usuario.
- Puntos de decisión en simuladores o juegos con estado estructurado: el modelo puede evaluar alternativas discretas dado un estado textualizado en menos de 256 tokens.

## Benchmarks y rendimiento

El autor publica resultados sobre la partición de desarrollo retenida para esta release, comparando la salida sin calibrar con la salida calibrada:

| Métrica | Raw | Calibrado |
|---|---:|---:|
| Accuracy | 0,699 | 0,699 |
| NLL (negative log-likelihood) | 0,772 | 0,625 |
| Brier score | 0,386 | 0,359 |
| ECE (expected calibration error) | 0,121 | 0,045 |

El escalado de temperatura no modifica la accuracy, como es esperable, pero reduce la NLL un 19,0 %, el Brier un 7,0 % y el ECE un 62,8 % en términos relativos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estándar en la información disponible, ni comparaciones directas contra otros modelos de decisión.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 1,55 GB solo para pesos (386 M de parámetros × 4 bytes), más activaciones y el buffer de 256 tokens, que son despreciables.
- VRAM estimada en FP16/BF16: aproximadamente 0,77 GB de pesos.
- VRAM estimada en INT8: aproximadamente 0,39 GB de pesos, aunque no hay versiones cuantizadas publicadas por el autor.
- Cabe sin problema en cualquier GPU de consumo con 4 GB o más de VRAM: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon vía MPS.
- También es viable en CPU para cargas de baja concurrencia, dado el tamaño del modelo y la longitud de entrada limitada a 256 tokens.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para una sola instancia; solo tendrían sentido para servir muchas réplicas o lotes grandes.
- Opciones de despliegue: `transformers` con PyTorch, exportación a ONNX Runtime o TorchScript, `text-embeddings-inference` (TEI) para clasificación y reranking, y endpoints de inferencia de HuggingFace. No es compatible con vLLM ni llama.cpp al no ser un modelo generativo autorregresivo.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de comparaciones directas publicadas entre `decision_maker` y otros modelos de decisión. La tabla siguiente contrasta únicamente datos públicos y verificables de encoders de tamaño equivalente que podrían servir como base para una alternativa propia. Las cifras de licencia y contexto corresponden a los modelos originales, no a este modelo.

| Modelo | Parámetros | Contexto | Licencia | Resultados en la tarea de decisión |
|---|---:|---:|---|---|
| `HrushikeshGangane/decision_maker` | ~386 M | 256 tokens | No disponible | Accuracy 0,699, ECE 0,045 en su split de validación |
| `bert-large-uncased` | ~335 M | 512 tokens | Apache 2.0 | No disponible (no incluye cabezal de decisión) |
| `roberta-large` | ~355 M | 512 tokens | MIT | No disponible |
| `microsoft/deberta-v3-large` | ~435 M | 512 tokens | MIT | No disponible |

La comparación de rendimiento contra alternativas concretas de decisión calibrada queda como no disponible, ya que el autor no publica una evaluación cruzada con otros sistemas.

## Limitaciones y advertencias

- Límite de entrada de 256 tokens: el runner de referencia no admite entradas que superen esa longitud, lo que restringe el estado y la pregunta a textos muy cortos.
- Calibración dependiente del dominio: el propio autor advierte que la calibración se midió en la distribución de validación de la release y puede no transferirse a otros dominios.
- Uso en decisiones de alto riesgo desaconsejado por el autor: la model card indica explícitamente que no debe usarse como única base para decisiones de alto riesgo.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en una zona legal indeterminada y requiere contactar con el autor.
- Idiomas no declarados: la base es `bert-large-uncased`, con vocabulario en inglés y sin distinción de mayúsculas, por lo que el comportamiento en castellano u otros idiomas no está garantizado ni evaluado.
- Dataset de entrenamiento no documentado: no se indica composición, tamaño ni procedencia de los datos, lo que impide auditar sesgos o solapamientos con conjuntos de evaluación.
- Sesgos potenciales: al derivar de `bert-large-uncased` y de un corpus no especificado, es previsible que herede sesgos de género, raza y dominio presentes en esos datos, aunque no hay un análisis publicado al respecto.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo solo puntúa opciones de una lista cerrada; el riesgo real es de sobreconfianza o de elección incorrecta con probabilidad alta.
- Ausencia de validación comunitaria: el modelo registra 0 descargas y 0 likes, sin informes independientes de terceros.
- Sin soporte de generación, tool calling ni agentes multi-paso: cualquier flujo que requiera texto libre debe combinarse con otro modelo.
- Los pesos ocupan 1,5 GB en el repositorio, lo que sugiere precisión completa; no hay versiones ligeras oficiales para despliegues con restricciones de memoria.
- La fecha de creación registrada (2026-09-20) es futura respecto al momento habitual de consulta, detalle a verificar antes de citar el modelo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HrushikeshGangane/decision_maker
- Encoder base declarado en la model card: https://huggingface.co/bert-large-uncased
- No se han encontrado papers, blogs, repositorios adicionales ni demos en los resultados de búsqueda web disponibles.
