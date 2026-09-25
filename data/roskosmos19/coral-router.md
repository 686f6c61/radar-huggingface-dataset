# roskosmos19/Coral-Router

## Resumen

Coral-Router (denominado Coral-MNLI en su propia model card) es un modelo de clasificación zero-shot desarrollado por el usuario de HuggingFace roskosmos19. Se trata de un ajuste fino de facebook/bart-large-mnli sobre el dataset MultiNLI, empaquetado para la tarea de Natural Language Inference (NLI) y expuesto a través del pipeline `zero-shot-classification`. Con 407.344.133 parámetros (~407 M) y un tamaño de repositorio de 1,6 GB, no es un modelo generativo, sino un clasificador que puntúa etiquetas candidatas para un texto dado sin necesidad de entrenamiento específico por tarea.

Su relevancia práctica está en el escenario zero-shot: el modelo convierte cada etiqueta candidata en una hipótesis del tipo "This example is {label}." y usa la probabilidad de implicación (entailment) como puntuación. Esto permite construir clasificadores de tema, sentimiento, intención o moderación sin anotar datos, algo útil para prototipado rápido y para enrutado de peticiones en pipelines más grandes, que es precisamente lo que sugiere el sufijo "Router" del identificador.

El modelo hereda la arquitectura BART-large, un transformer encoder-decoder con un vocabulario de 50.265 tokens y una longitud máxima de secuencia de 1024 tokens. La licencia es MIT, lo que facilita su uso comercial, pero conviene señalar que el repositorio no tiene descargas ni valoraciones, no publica benchmarks propios y su model card describe el modelo con un nombre distinto al del identificador, por lo que debe tratarse como un artefacto derivado y no validado de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BART-large (transformer encoder-decoder adaptado a clasificación de secuencias) |
| Parámetros totales | 407.344.133 (~407 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (máximo de secuencia indicado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo base facebook/bart-large-mnli está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | zero-shot-classification |
| Etiquetas de salida NLI | contradiction / neutral / entailment |
| Tamaño de vocabulario | 50.265 |
| Modelo base | facebook/bart-large-mnli |
| Dataset de ajuste | multi_nli |
| Tamaño del repositorio | 1,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es BART-large: un transformer secuencia a secuencia con encoder y decoder, preentrenado con un objetivo de denoising y posteriormente reutilizado como clasificador de secuencias. En esta variante, la cabeza de clasificación produce tres logits correspondientes a las etiquetas de NLI (contradiction, neutral, entailment). El modelo parte de facebook/bart-large-mnli, que ya incorpora un ajuste fino sobre MultiNLI, y según la información disponible se ha vuelto a ajustar sobre el dataset multi_nli, que es el único dataset declarado en las etiquetas del repositorio.

No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, la mezcla de idiomas ni si se aplicaron técnicas de alineación como RLHF o DPO (poco habituales en un clasificador de este tipo). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el interés del modelo reside en el uso del truco de NLI para clasificación zero-shot, no en una arquitectura novedosa.

Conviene destacar una discrepancia documental: el identificador del repositorio es `roskosmos19/Coral-Router`, mientras que la model card se refiere al modelo como "Coral-MNLI" en todo momento. No hay información que explique esa diferencia de nombres ni si existen variantes adicionales del mismo ajuste.

## Capacidades

- Clasificación de texto zero-shot: dada una secuencia y una lista de etiquetas candidatas, devuelve una puntuación de adecuación para cada una sin entrenamiento previo.
- Clasificación multi-etiqueta: con `multi_label=True` permite que varias etiquetas sean verdaderas simultáneamente para el mismo texto.
- Inferencia de lenguaje natural (NLI): clasificación en las tres categorías estándar (contradiction, neutral, entailment) cuando se usa de forma manual.
- Detección de temas, sentimiento, intención y moderación de contenido, según la propia model card.
- Uso como verificador de implicación: la probabilidad de entailment puede emplearse para comprobar si una afirmación se deduce de un texto de referencia.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos generativos: es un clasificador de secuencias.
- Capacidades multilingües: no disponibles; el modelo base está entrenado principalmente en inglés y la model card no declara idiomas adicionales.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Enrutado de peticiones en pipelines de IA: el modelo puede clasificar una consulta entrante en categorías predefinidas (por ejemplo, "consulta técnica", "facturación", "cancelación") y decidir a qué servicio o modelo se deriva, aprovechando su función de scoring sobre etiquetas arbitrarias sin reentrenamiento.
- Moderación de contenido en comunidades y foros: clasificar comentarios con etiquetas como "discurso de odio", "spam", "off-topic" o "contenido legítimo" en modo multi-etiqueta, útil como primer filtro antes de una revisión humana.
- Análisis de sentimiento sin datos anotados: aplicar etiquetas "positivo", "negativo", "neutro" sobre reseñas o menciones en redes, evitando la fase de etiquetado que requiere un clasificador supervisado clásico.
- Etiquetado temático de corpus documentales: asignar categorías a artículos, informes o actas internas para construir índices de búsqueda; con 1024 tokens de contexto admite fragmentos razonablemente largos, y la propia model card recomienda colocar la parte más informativa al inicio.
- Clasificación de intención en asistentes conversacionales: determinar si el turno del usuario es una pregunta, una petición de acción o una queja, para decidir la siguiente etapa del flujo conversacional.
- Triaje previo en sistemas RAG: decidir si una consulta requiere recuperación documental o puede responderse directamente, o clasificar la consulta por dominio antes de seleccionar el índice adecuado.
- Verificación de fidelidad de resúmenes y respuestas: usar la probabilidad de entailment para comprobar si una frase generada se deduce del texto fuente, como heurística de detección de alucinaciones en un pipeline de evaluación.
- Clasificación multi-etiqueta de publicaciones académicas o bibliográficas: asignar varios temas a un mismo documento (por ejemplo, "machine learning" y "biología") gracias al modo multi-etiqueta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de exactitud sobre MultiNLI ni comparaciones con otros modelos, y no se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,6 GB en precisión fp32 (tamaño del repositorio, ~407 M de parámetros), aproximadamente 0,8 GB en fp16 y en torno a 0,4-0,5 GB en int8. Son estimaciones derivadas del recuento de parámetros; no hay cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060, RTX 4060 o superior cubre el caso sin problemas. Una RTX 4090, A100 o H100 resultan sobredimensionadas para un único modelo de este tamaño, aunque tienen sentido si se sirve en lote o junto a otros componentes del pipeline.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU (la inferencia en CPU es viable con 407 M de parámetros, con latencias mayores).
- Opciones de despliegue: Transformers con `pipeline("zero-shot-classification")`, `AutoModelForSequenceClassification` para uso manual, y servidores de inferencia compatibles con modelos de HuggingFace como Text Generation Inference (TGI) o soluciones de embeddings/clasificación vía API. No hay pesos GGUF publicados en el repositorio, por lo que el uso directo con llama.cpp u Ollama requeriría una conversión propia.
- Latencia y throughput: no disponible. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus respectivas model cards públicas y no de la información proporcionada para este modelo; se incluyen como referencia orientativa.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| roskosmos19/Coral-Router | ~407 M | 1024 | no disponible (base en inglés) | MIT | Derivado de bart-large-mnli; sin benchmarks publicados; 0 descargas |
| facebook/bart-large-mnli | ~407 M | 1024 | principalmente inglés | MIT | Modelo base directo; ampliamente usado y validado en la comunidad |
| MoritzLaurer/mDeBERTa-v3-base-mnli-xnli | ~279 M | 512 | multilingüe (más de 100 idiomas) | MIT | Alternativa clara si se necesita clasificación zero-shot en varios idiomas |
| typeform/distilbert-base-uncased-mnli | ~67 M | 512 | inglés | Apache-2.0 | Mucho más ligero y rápido, con menor capacidad que BART-large |

La ventaja diferencial de este modelo frente a facebook/bart-large-mnli no está documentada con métricas; sin benchmarks publicados no es posible afirmar que mejore al modelo base. Frente a alternativas multilingües como mDeBERTa-v3-base-mnli-xnli, este modelo queda limitado al ámbito anglófono.

## Limitaciones y advertencias

- Ausencia total de benchmarks: la model card no publica exactitud sobre MultiNLI ni comparaciones con el modelo base, por lo que no hay evidencia de que el ajuste aporte mejoras.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- Discrepancia de nomenclatura: el identificador es Coral-Router pero la model card describe "Coral-MNLI", lo que dificulta la trazabilidad del artefacto.
- Idioma: no se declaran idiomas soportados y el modelo base BART-large está entrenado principalmente en inglés; el rendimiento en castellano u otros idiomas es incierto y probablemente degradado.
- Sesgos: al derivar de MultiNLI y de BART, puede heredar sesgos presentes en el corpus (sesgo de género, sesgo cultural anglosajón, sobrerrepresentación de determinados dominios textuales). No se documenta ningún análisis de sesgo.
- Alucinación y calibración: en clasificación zero-shot el riesgo se manifiesta como puntuaciones sobreconfiadas para etiquetas mal formuladas o poco específicas; la model card recomienda usar etiquetas claras y concretas.
- Truncación: la longitud máxima es de 1024 tokens y la truncación conserva el inicio del texto, de modo que la información situada al final de documentos largos se pierde.
- Tipo de modelo: no es generativo, por lo que no admite tool calling, agentes ni razonamiento multi-paso; usarlo para esas tareas sería un error de diseño.
- Licencia: MIT permite uso comercial y modificación, pero al derivar de facebook/bart-large-mnli conviene verificar las condiciones del modelo base (también MIT) y del dataset MultiNLI antes de un despliegue en producción.
- Producción: al no haber pesos cuantizados publicados ni métricas de latencia, cualquier despliegue real requiere una fase de evaluación propia y una conversión de formato si se quiere servir con herramientas distintas de Transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roskosmos19/Coral-Router
- Modelo relacionado del mismo autor: https://huggingface.co/roskosmos19/Coral
- Perfil del autor: https://huggingface.co/roskosmos19
- Modelo base: https://huggingface.co/facebook/bart-large-mnli
- Dataset de ajuste declarado: https://huggingface.co/datasets/multi_nli
- Documentación del pipeline zero-shot-classification: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.ZeroShotClassificationPipeline

Nota: el resto de resultados de la búsqueda web (OrcaRouter, Ramp Router y el perfil de orcarouter en Ollama) corresponden a servicios de enrutado de modelos de lenguaje y no guardan relación con este clasificador, por lo que no se incluyen como referencias del modelo.
