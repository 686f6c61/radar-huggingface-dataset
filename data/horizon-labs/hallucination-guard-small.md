# Horizon-Labs/hallucination-guard-small

## Resumen

Hallucination Guard (small) es un clasificador multilingüe de *groundedness* desarrollado por Horizon-Labs. Dado un par formado por una fuente (documentos recuperados, una transcripción, el resultado de una herramienta) y una respuesta o afirmación generada por un modelo, predice si esa respuesta está respaldada por la fuente. Devuelve dos etiquetas: `SUPPORTED` (1) y `UNSUPPORTED` (0), y la puntuación asociada a `SUPPORTED` se interpreta como probabilidad de soporte. Se publica como alternativa ligera y abierta para auditar respuestas de sistemas RAG, resúmenes y salidas de agentes que añaden, cambian o contradicen hechos presentes en el contexto.

El modelo tiene 140.642.306 parámetros reales (según los pesos safetensors del repositorio; la model card lo presenta como "small, 141M") y deriva de `jhu-clsp/mmBERT-small`, un encoder multilingüe de la familia ModernBERT. Admite una ventana de 8.000 tokens (entrenado a 2.000), cubre datos de entrenamiento en 30 idiomas y se distribuye con licencia Apache-2.0 sin *gating*, con pesos safetensors y ONNX, por lo que puede ejecutarse tanto en servidor como en el navegador vía transformers.js.

Su relevancia práctica está en el coste: al ser un encoder de ~141M de parámetros, se puede desplegar como verificador por frase dentro de un pipeline de generación sin depender de otro LLM como juez. Forma parte de la colección Agent I/O Guards (inyección de prompt, PII, groundedness) y su propio autor reconoce que en verificación de afirmaciones en inglés MiniCheck y HHEM-2.1-open obtienen mejores resultados: la ventaja que reclama este modelo está en otros idiomas y en tareas de QA y diálogo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer de la familia ModernBERT / mmBERT (modelo base `jhu-clsp/mmBERT-small`); tarea de clasificación de texto |
| Parámetros totales | 140.642.306 (dato real de los pesos safetensors); la model card lo denomina "small, 141M" |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.000 tokens declarados; entrenado a 2.000 tokens. El propio autor recomienda truncar a 2.048 en el ejemplo de uso por frases |
| Tipos de cuantización | no disponible (se incluyen pesos ONNX, pero no se documentan variantes INT8, INT4 ni GGUF) |
| Idiomas soportados | 30 idiomas en los datos de entrenamiento; 19 declarados explícitamente en la model card: en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th, más la etiqueta "multilingual" |
| Licencia | Apache-2.0, sin gating |
| Formato de pesos | safetensors y ONNX; compatible con transformers.js |
| Tarea (pipeline) | text-classification |
| Etiquetas de salida | `UNSUPPORTED` (0), `SUPPORTED` (1) |
| Modelo base | jhu-clsp/mmBERT-small |
| Datasets de entrenamiento citados | wandb/RAGTruth-processed, alisawuffles/WANLI, más datos sintéticos generados con Qwen |
| Tamaño del repositorio | 1,4 GB |
| Autores | Horizon-Labs |

## Arquitectura y entrenamiento

El modelo es un encoder de clasificación construido sobre `jhu-clsp/mmBERT-small`, la variante multilingüe de la familia ModernBERT (etiqueta `modernbert`/`mmbert` en la model card). Se consume como un par de secuencias: primero la fuente (`text`) y después la respuesta o afirmación a verificar (`text_pair`), de modo que la tarea es esencialmente un NLI de soporte entre contexto y salida. La decisión se toma con un umbral de 0,5 sobre la probabilidad de `SUPPORTED`.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la profundidad de la red ni el uso de RLHF o DPO; tampoco se especifica el proceso de destilación o ajuste más allá del modelo base. Sí se documenta que se entrenó con datos con licencias permisivas y con datos sintéticos generados con Qwen, sobre los splits de entrenamiento de RAGTruth (verificación de alucinaciones en resúmenes y QA) y WANLI (inferencia de lenguaje natural). Para fuentes largas, el autor propone trocear la respuesta en frases y puntuar cada una contra la fuente, tomando el mínimo como puntuación a nivel de respuesta.

## Capacidades

- Clasificación binaria de soporte (`SUPPORTED` / `UNSUPPORTED`) entre una fuente y una afirmación o respuesta.
- Verificación de respuestas RAG contra los documentos recuperados, con detección de hechos añadidos, modificados o contradichos.
- Verificación a nivel de frase: permite localizar qué frase concreta de una respuesta no está respaldada por la fuente.
- Multilingüe: datos de entrenamiento en 30 idiomas; evaluación publicada en inglés, alemán, español, chino, japonés, árabe e hindi.
- Procesamiento de contextos largos (hasta 8.000 tokens declarados), con truncado o troceado para fuentes mayores.
- Uso en inferencia local y en navegador: pesos ONNX y compatibilidad con transformers.js, además de la etiqueta text-embeddings-inference y endpoints compatibles.
- Integración como guardarraíl en pipelines de agentes (colección Agent I/O Guards: inyección de prompt, PII y groundedness).
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso; su salida es una etiqueta con puntuación.

## Casos de uso

- Validación de respuestas RAG en producción: antes de devolver una respuesta al usuario, se puntúa cada frase generada contra los fragmentos recuperados y se bloquea o marca la respuesta si el mínimo de soporte cae por debajo del umbral. Es adecuado porque es un encoder de 141M que se ejecuta en milisegundos y no exige una segunda llamada a un LLM.
- Guardarraíl de salidas de agentes: se compara el resultado final (o el resultado de cada herramienta) con la evidencia disponible en el estado del agente, de modo que se detecten afirmaciones no respaldadas por la salida real de la herramienta. La colección Agent I/O Guards está pensada precisamente para encadenar este verificador con otros filtros.
- Atención al cliente multilingüe: en asistentes que responden a partir de una base de conocimiento, el verificador se aplica sobre la respuesta final usando los artículos recuperados como fuente; al cubrir 30 idiomas permite reutilizar un único componente en lugar de mantener un verificador por idioma.
- Verificación de actas y transcripciones: dado el texto de una reunión (TofuEval-MeetB) y el resumen o las notas generadas, se detecta cualquier afirmación que no aparezca en la transcripción, útil para herramientas de notas automáticas que no deben inventar acuerdos ni cifras.
- Evaluación automática de LLM en CI: se incorpora como métrica de *groundedness* en baterías de regresión, puntuando un conjunto fijo de pares fuente/respuesta en cada cambio de prompt o de modelo. RAGTruth a nivel de respuesta (0,798 de balanced accuracy) es el escenario donde el modelo rinde mejor según los datos publicados.
- Moderación de contenido generado con verificación de citas: en pipelines editoriales o de resumen automático, se comprueba que cada afirmación atribuida a un documento fuente esté realmente en él antes de publicar.
- Guardarraíl en el navegador con transformers.js: al distribuirse en ONNX, la verificación puede ejecutarse en el cliente sin enviar la fuente ni la respuesta a un servidor, lo que resulta útil con datos personales o confidenciales.
- Filtrado previo en fact-checking asistido: se usa como primera pasada para descartar afirmaciones claramente no soportadas y reservar la revisión humana o un modelo mayor para los casos dudosos.

## Benchmarks y rendimiento

Métrica: balanced accuracy con umbral 0,5. Todos los modelos fueron ejecutados por el autor con el mismo script (`ground/evaluate_ground.py`). La marca † indica conjuntos dentro de la distribución de entrenamiento del modelo (se entrenó con el split de entrenamiento de RAGTruth y se evalúa sobre su split de test).

LLM-AggreFact (verificación de afirmaciones en inglés, 11 conjuntos, hasta 1.000 ejemplos cada uno):

| Conjunto | Este modelo | Base (308M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| AggreFact-CNN | 0,607 | 0,581 | **0,664** | 0,622 | 0,629 |
| AggreFact-XSum | 0,644 | 0,667 | **0,709** | 0,688 | 0,706 |
| ClaimVerify | 0,682 | 0,691 | **0,783** | 0,744 | 0,753 |
| ExpertQA | 0,553 | 0,563 | **0,606** | 0,597 | 0,568 |
| FactCheck-GPT | 0,657 | 0,686 | **0,754** | 0,728 | 0,729 |
| LFQA | 0,726 | 0,764 | **0,863** | 0,838 | 0,839 |
| RAGTruth † | 0,796 | **0,807** | 0,788 | 0,773 | 0,734 |
| Reveal | 0,798 | 0,821 | **0,896** | 0,871 | 0,865 |
| TofuEval-MediaS | 0,654 | 0,691 | **0,696** | 0,676 | 0,679 |
| TofuEval-MeetB | 0,677 | 0,703 | **0,765** | 0,724 | 0,721 |
| Wice | 0,719 | 0,693 | 0,717 | 0,664 | **0,751** |
| Media | 0,683 | 0,697 | **0,749** | 0,721 | 0,725 |

Multilingüe: HaluEval QA y diálogo traducidos (400 elementos por idioma). Las traducciones se hicieron con Qwen3.8-27B manteniendo las etiquetas y son disjuntas de los elementos ingleses de HaluEval usados arriba.

| Idioma | Este modelo | Base (308M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| Inglés | 0,657 | **0,754** | 0,589 | 0,670 | 0,701 |
| Alemán | 0,719 | **0,756** | 0,691 | 0,672 | 0,670 |
| Español | 0,691 | **0,749** | 0,650 | 0,675 | 0,675 |
| Chino | 0,713 | **0,762** | 0,627 | 0,621 | 0,546 |
| Japonés | 0,729 | **0,772** | 0,626 | 0,669 | 0,546 |
| Árabe | 0,700 | **0,736** | 0,616 | 0,691 | 0,544 |
| Hindi | 0,730 | **0,756** | 0,595 | 0,670 | 0,564 |
| Media de los 6 idiomas no ingleses | 0,714 | **0,755** | 0,634 | 0,666 | 0,591 |

Otros conjuntos:

| Conjunto | Este modelo | Base (308M) | MiniCheck-RoBERTa-L | MiniCheck-DeBERTa-L | HHEM-2.1-open |
|---|---|---|---|---|---|
| HaluEval QA | 0,691 | **0,817** | 0,635 | 0,768 | 0,762 |
| HaluEval diálogo | 0,643 | **0,645** | 0,522 | 0,524 | 0,625 |
| HaluEval resumen | 0,548 | 0,574 | **0,648** | 0,623 | 0,526 |
| RAGTruth test, nivel de respuesta † | 0,798 | **0,821** | 0,604 | 0,626 | 0,750 |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K, que no aplican a un modelo de clasificación.

## Requisitos de hardware

- Peso de los pesos calculado a partir de 140.642.306 parámetros: ~562 MB en FP32, ~281 MB en FP16/BF16, ~141 MB en INT8 y ~70 MB en INT4 (estimación derivada del recuento de parámetros, no publicada por el autor).
- VRAM total estimada en inferencia con transformers en Python: del orden de 1 a 2 GB incluyendo runtime, tokenizador y activaciones con `max_length` de 2.048 y lotes pequeños (estimación; no hay cifras oficiales).
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) y también en CPU, dado el tamaño del modelo.
- GPU de centro de datos (A100, H100) no son necesarias salvo para lotes muy grandes o despliegues con requisitos de latencia estrictos.
- Opciones de despliegue documentadas o etiquetadas: pipeline de transformers, ONNX Runtime, transformers.js (navegador y Node), text-embeddings-inference y endpoints compatibles. No está orientado a servidores de generación como vLLM o TGI, pensados para modelos autoregresivos.
- Para fuentes largas, la estrategia recomendada es truncar a 2.048 tokens o trocear la respuesta por frases y agregar con el mínimo.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LLM-AggreFact (media) | Media 6 idiomas no ingleses | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | 140,6M (dato real) | 8.000 tokens (entrenado a 2.000) | 0,683 | 0,714 | Apache-2.0, sin gating | Pesos safetensors y ONNX en HuggingFace |
| Base (308M) citado en la model card | no disponible (la model card no aclara su identidad) | no disponible | 0,697 | 0,755 | no disponible | no disponible |
| MiniCheck-RoBERTa-L | no disponible | no disponible | 0,749 | 0,634 | no disponible | no disponible en la información proporcionada |
| MiniCheck-DeBERTa-L | no disponible | no disponible | 0,721 | 0,666 | no disponible | no disponible en la información proporcionada |
| HHEM-2.1-open | no disponible | no disponible | 0,725 | 0,591 | no disponible | el sufijo "open" indica pesos abiertos; condiciones no detalladas |

Diferencias clave según los datos del propio autor: MiniCheck-RoBERTa-L y HHEM-2.1-open superan a este modelo en verificación de afirmaciones en inglés (0,749 y 0,725 frente a 0,683), mientras que este modelo queda por delante en la media de los seis idiomas no ingleses evaluados (0,714 frente a 0,634 y 0,591) y en RAGTruth a nivel de respuesta frente a MiniCheck y HHEM (0,798 frente a 0,604 y 0,750). El rendimiento de los competidores en parámetros, contexto y licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- En verificación de afirmaciones en inglés (LLM-AggreFact) MiniCheck-RoBERTa-L (0,749) y HHEM-2.1-open (0,725) superan a este modelo (0,683); el propio autor lo reconoce y recomienda compararlos sobre datos propios si solo se necesita inglés.
- Evalúa el soporte únicamente respecto a la fuente proporcionada: no es un verificador de conocimiento mundial. Una afirmación verdadera que no aparezca en la fuente se etiqueta como `UNSUPPORTED`.
- El apartado de limitaciones de la model card está truncado en la información disponible (termina en "Simple arithmetic"), por lo que no se pueden reproducir todas las advertencias del autor.
- Rendimiento flojo en resumen: HaluEval summarization queda en 0,548, por debajo de MiniCheck-RoBERTa-L (0,648) y MiniCheck-DeBERTa-L (0,623). Para resúmenes conviene validar el modelo sobre datos propios antes de producción.
- HaluEval QA también es bajo en términos relativos (0,691 frente a 0,817 del modelo base citado), lo que sugiere una pérdida de rendimiento en QA en inglés respecto a su propio punto de partida.
- Posible sesgo de evaluación en multilingüe: las traducciones de HaluEval se generaron con Qwen3.8-27B, la misma familia usada para los datos sintéticos de entrenamiento, lo que puede favorecer a este modelo según advierte el autor.
- Cobertura lingüística no verificable: se declaran 30 idiomas de entrenamiento, pero solo 19 aparecen en los metadatos y solo 7 se evalúan.
- Ventana de 8.000 tokens declarada pero entrenamiento a 2.000: es esperable degradación en fuentes muy largas; el ejemplo del autor usa `truncation=True, max_length=2048`.
- Orden de las entradas sensible: la fuente va primero (`text`) y la respuesta o afirmación después (`text_pair`); invertirlas invalida la predicción.
- Etiquetado binario sin matices: no distingue entre contradicción y falta de información, ni ofrece explicaciones o evidencias.
- Licencia Apache-2.0 permite uso comercial y modificación sin gating, pero no hay garantías ni niveles de servicio; el modelo se publica como está.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, y sin evaluaciones independientes publicadas; los números proceden del propio autor.
- Las fechas del repositorio en HuggingFace figuran como creado el 2026-09-24 y actualizado el 2026-09-24, posteriores a la fecha habitual de consulta; conviene verificarlas antes de citarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/hallucination-guard-small
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/hallucination-guard
- Colección Agent I/O Guards: https://huggingface.co/collections/Horizon-Labs/agent-i-o-guards-6ab403c49494bc2b71ca7669
- Código fuente: https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset RAGTruth procesado: https://huggingface.co/datasets/wandb/RAGTruth-processed
- Dataset WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- Búsqueda web: no se encontraron resultados relevantes sobre el modelo. Los enlaces devueltos corresponden a entidades no relacionadas (el partido político francés Horizons, la emisora Horizon, la página de Wikipedia del concepto "horizon", Horizon Santé Travail y Meta Horizon), por lo que no se incluyen como fuentes.
