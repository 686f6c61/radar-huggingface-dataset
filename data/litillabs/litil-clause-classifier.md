# litillabs/litil-clause-classifier

## Resumen

LiTiL Clause Classifier es un modelo de clasificación de texto desarrollado por LiTiL Labs que asigna una única categoría, extraída de una taxonomía contractual de 100 etiquetas, a un fragmento de contrato (cláusula o provisión). Se trata de un fine-tune de `answerdotai/ModernBERT-large`, un encoder transformer de 395.933.796 parámetros, publicado como checkpoint completo de clasificación de secuencia sin necesidad de descargar el modelo base ni de aplicar fusiones PEFT.

El problema que resuelve es acotado pero recurrente en LegalTech: la redacción de una misma cláusula varía enormemente entre contratos, lo que rompe las búsquedas por palabra clave y dificulta el enrutado automático de provisiones hacia playbooks de revisión. El modelo devuelve la etiqueta seleccionada por `argmax` sobre 100 puntuaciones softmax (`labels.json`), lo que permite indexar, filtrar y encaminar cláusulas de forma consistente.

Es relevante ahora porque demuestra que un encoder moderno de 395 M de parámetros, entrenado sobre solo 60.000 provisiones públicas de LEDGAR, alcanza un 88,82 % de accuracy y un 83,17 % de macro F1 en el conjunto de test público de LEDGAR (10.000 provisiones), con licencia Apache 2.0 y ejecución verificada en CPU en float32. Su adopción, sin embargo, es todavía incipiente: cero descargas y cero "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia ModernBERT-large) con cabeza de clasificación de secuencia sobre 100 etiquetas |
| Parámetros totales | 395.933.796 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens como política de entrada del checkpoint, con truncación activada; la base ModernBERT-large está diseñada para ventanas más largas |
| Tipos de cuantización | no se publican pesos cuantizados; el checkpoint distribuido está en fp32 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 1.583.753.448 bytes) más `labels.json` con el mapa ordenado de etiquetas |
| Tarea (pipeline) | `text-classification` |
| Número de etiquetas | 100 (mutuamente excluyentes, softmax + `argmax`; sin umbral multietiqueta) |
| Contrato de entrada | JSON con `text` obligatorio y `text_pair` opcional |
| Modelo base | `answerdotai/ModernBERT-large` (relación: finetune) |
| Dataset de entrenamiento | `coastalcph/lex_glue` (subconjunto LEDGAR), revisión `c23fdff1a6bf74e0e1a71cb86f1e781d37da888c`, licencia CC BY 4.0 |
| Runtime probado | CPU float32, PyTorch 2.12.0, Transformers 5.9.0 |
| Commit del checkpoint | `136c5138e3b40b43b192b965fdee48fb9591784f` |
| Tamaño del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT-large, un encoder de 395 M de parámetros orientado a contextos largos, sobre el que LiTiL Labs ha añadido una cabeza de clasificación de secuencia con 100 salidas. El repositorio contiene un checkpoint completo de clasificación: no requiere descargar el modelo base ni ejecutar ninguna fusión de adaptadores. La política de entrada publicada limita cada invocación a 512 tokens con truncación activada, pese a que la familia ModernBERT está concebida para ventanas de contexto mayores; es decir, el límite práctico lo impone el autor del fine-tune, no la arquitectura base. El tokenizador y los pesos se cargan con `AutoTokenizer` y `AutoModelForSequenceClassification`.

El entrenamiento consistió en un fine-tune supervisado sobre 60.000 provisiones contractuales públicas de LEDGAR (incluidas en LexGLUE), sin datos privados de clientes ni de usuarios en el conjunto de post-entrenamiento revisado. El dataset enlazado está fijado a una revisión concreta y su licencia publicada es CC BY 4.0. La model card no documenta uso de RLHF, DPO, decodificación especulativa ni otras innovaciones de inferencia; se trata de una clasificación discriminativa, no generativa, por lo que esas técnicas no aplican. El autor publica el SHA-256 del `model.safetensors` (`0c33bae20ce7edf1e0a2d5a71c5bb93aa30e5dd729564c12b585ddfde18293e3`), lo que permite verificar la integridad del artefacto.

## Capacidades

- Clasificación de cláusulas contractuales en una de 100 categorías de la taxonomía LEDGAR, devolviendo además la puntuación softmax de las 100 categorías.
- Puntuación de alternativas: la distribución completa de scores permite ordenar etiquetas candidatas, no solo recuperar la ganadora.
- Integración directa en pipelines de procesamiento de contratos: el modelo card recomienda colocarlo después del parseo del contrato y de la segmentación en provisiones.
- Salida determinista y de bajo coste: una provisión de entrada, una etiqueta y 100 scores; no hay generación de texto libre.
- Ejecución en CPU verificada (float32) con las versiones PyTorch 2.12.0 y Transformers 5.9.0, lo que facilita despliegues sin GPU.
- Paquete offline preparado por el autor con mapa de etiquetas explícito y runner (`classify_offline.py --validate-only`, `classify_offline.py --input example_input.json`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es multilingüe: únicamente inglés.
- No tiene modo "thinking", ni visión, ni audio.
- No es multietiqueta: cada provisión recibe exactamente una etiqueta, incluso si trata varios temas.

## Casos de uso

- Indexado y búsqueda de cláusulas en repositorios contractuales: tras segmentar el contrato, cada provisión se etiqueta con una de las 100 categorías LEDGAR y la etiqueta se escribe en el índice, de modo que la búsqueda pasa de coincidencia de términos a filtrado por tipo de cláusula (confidencialidad, ley aplicable, terminación, etc.).
- Enrutado de revisiones hacia playbooks específicos: la etiqueta seleccionada se mapea a un playbook de categoría, de forma que las cláusulas de indemnización y las de limitación de responsabilidad llegan a revisores distintos sin triaje manual previo.
- Triaje por confianza en revisión humana: como el modelo devuelve los 100 scores, las clasificaciones con margen estrecho entre la primera y la segunda etiqueta pueden desviarse a un revisor en lugar de forzarse por la ruta automática; es el patrón que el propio autor describe en la model card.
- Pre-etiquetado para anotación humana: en la construcción de corpus legales propios, el modelo genera una primera pasada de etiquetas sobre miles de provisiones que después se corrigen, reduciendo el coste de anotación desde cero.
- Gestión del ciclo de vida contractual (CLM): extracción de metadatos estructurados por cláusula para alimentar paneles de riesgos, alertas de vencimiento y control de obligaciones, aprovechando que el modelo se ejecuta en CPU y puede desplegarse on-premise sin GPU.
- Due diligence en operaciones corporativas: clasificación masiva de las provisiones de un data room para localizar de forma sistemática cláusulas de cambio de control, cesión o ley aplicable antes de la firma.
- Investigación empírica sobre contratos: replicar o extender experimentos tipo LexGLUE/LEDGAR con un checkpoint reproducible (commit y SHA-256 publicados) y licencia Apache 2.0, lo que simplifica la publicación de resultados.
- Cumplimiento y auditoría interna: etiquetado sistemático de contratos con proveedores para verificar la presencia y la ubicación de cláusulas exigidas por política interna, con la salvedad de que la decisión final debe validarla una persona.

## Benchmarks y rendimiento

| Evaluación | Accuracy | Macro F1 |
|---|---:|---:|
| Conjunto de test público de LEDGAR, 10.000 provisiones | 88,82 % | 83,17 % |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto, ni métricas de latencia o throughput. La model card menciona una comprobación de interfaz en CPU el 10 de septiembre de 2026 sobre cuatro provisiones sintéticas (confidencialidad, ley aplicable, divisibilidad y ejemplares), que produjo la categoría esperada en los cuatro casos; no es una evaluación estadística.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 1,58 GB (coincide con el tamaño real del `model.safetensors`). En fp16/bf16 bajaría a unos 0,8 GB y en int8 a unos 0,4 GB; estas dos últimas cifras son estimaciones derivadas del número de parámetros, no configuraciones publicadas por el autor.
- VRAM estimada para inferencia: en torno a 2 GB en fp32, 1,2 GB en fp16 y 0,7 GB en int8, sumando pesos, activaciones y overhead del runtime (estimación, no medida publicada).
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 3060, etc.) es suficiente incluso en fp32. También hay margen para lotes grandes en tarjetas de 12-24 GB.
- GPU de centro de datos (A100, H100, L40S, A10G) no son necesarias para la inferencia; solo tendrían sentido para reentrenamiento o para procesar volúmenes muy altos en paralelo.
- La ejecución en CPU en float32 está verificada por el autor con PyTorch 2.12.0 y Transformers 5.9.0, lo que permite despliegues sin acelerador.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`; el repositorio incluye el tag `text-embeddings-inference` (compatible con el servidor TEI) y `endpoints_compatible` (compatible con Hugging Face Inference Endpoints). El paquete offline del autor incluye `classify_offline.py`. No hay pesos GGUF publicados, por lo que Ollama y llama.cpp requerirían una conversión no proporcionada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea / salida | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| litillabs/litil-clause-classifier | 395.933.796 | 512 tokens (política del checkpoint) | Clasificación de cláusulas, 100 etiquetas LEDGAR | Apache 2.0 | Pesos safetensors publicados; 0 descargas |
| answerdotai/ModernBERT-large (base) | 395.933.796 | Ventana larga según su documentación | Encoder base sin cabeza de clasificación; requiere fine-tune propio | Apache 2.0 | Modelo base público |
| answerdotai/ModernBERT-base (base) | ~149.000.000 | Ventana larga según su documentación | Encoder base sin cabeza de clasificación; requiere fine-tune propio | Apache 2.0 | Modelo base público |

No se dispone de datos verificados de otros clasificadores LEDGAR publicados (parámetros, contexto, macro F1 o licencia) en la información proporcionada, por lo que no se incluye una comparación de rendimiento entre modelos: no disponible. Cualquier comparación de F1 exigiría reproducir el mismo protocolo de evaluación sobre el test de LEDGAR.

## Limitaciones y advertencias

- Una sola etiqueta por provisión: las cláusulas que cubren varios temas reciben una única categoría, sin umbral multietiqueta, lo que puede ocultar información relevante en contratos densos.
- Los scores no están calibrados como probabilidades. La model card lo advierte explícitamente: sirven para ordenar alternativas, pero no deben usarse como umbral de confianza sin calibrar en datos propios.
- Solo inglés. No hay soporte para contratos en castellano ni en otras lenguas, lo que limita su uso directo en mercados hispanohablantes.
- Truncación a 512 tokens: las cláusulas largas (o los fragmentos mal segmentados) pierden contenido, lo que degrada la clasificación si la segmentación previa no es de grano fino.
- La taxonomía de 100 etiquetas proviene de LEDGAR, orientada a contratos en inglés y probablemente sesgada hacia prácticas contractuales estadounidenses; la correspondencia con taxonomías corporativas propias debe validarse.
- Riesgo de error de clasificación en categorías poco frecuentes, reflejado en la diferencia entre accuracy (88,82 %) y macro F1 (83,17 %): el macro F1, más bajo, indica peor desempeño en las etiquetas con menos ejemplos.
- No es un modelo generativo, por lo que el riesgo de alucinación de texto no aplica; el riesgo equivalente es la asignación de una etiqueta incorrecta con una puntuación alta.
- Sesgos conocidos: la model card no documenta ningún análisis de sesgo demográfico, lingüístico o jurisdiccional. No hay información disponible al respecto.
- Licencia Apache 2.0 para los pesos, lo que permite uso comercial, pero el dataset LEDGAR/LexGLUE está bajo CC BY 4.0, por lo que la atribución a LEDGAR/LexGLUE y a ModernBERT es exigible al citar el modelo.
- Adopción nula y validación externa inexistente: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes publicadas. Para producción conviene ejecutar una validación propia sobre el dominio contractual real antes de confiar en el etiquetado.
- Las fechas de la model card y del repositorio (septiembre de 2026) son las publicadas por el autor; se reproducen tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litillabs/litil-clause-classifier
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset: https://huggingface.co/datasets/coastalcph/lex_glue
- La búsqueda web realizada no devolvió enlaces técnicos relevantes: todos los resultados correspondían a Google Translate y no guardan relación con el modelo, el dataset LEDGAR ni ModernBERT. No se incluyen, por tanto, URLs adicionales verificadas de papers, blogs o repositorios.
