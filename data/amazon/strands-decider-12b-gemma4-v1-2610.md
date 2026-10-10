# amazon/strands-decider-12B-gemma4-v1-2610

## Resumen

strands-decider-12B-gemma4-v1-2610 es un adaptador LoRA (PEFT) publicado por Amazon sobre el modelo base google/gemma-4-12B-it. No es un modelo generativo de propósito general, sino un "decision model" orientado a clasificación y a la emisión de decisiones tipadas (typed decisions) con calibración, según la etiqueta `strands-decider` y los tags `decision-model`, `classification`, `calibration` y `typed-decisions`. El repositorio ocupa 0.8 GB y se distribuye en formato safetensors, lo que corresponde al peso del adaptador y no al del modelo base.

El modelo resuelve el problema de convertir texto no estructurado en etiquetas discretas para un conjunto amplio de dominios: intención de usuario, temas de noticias, spam, toxicidad, verificación de hechos, entailment, revisión de código y detección de vulnerabilidades, entre otros. La lista de 25 datasets declarados en la model card abarca desde `banking77` y `clinc_oos` (intención) hasta `google/civil_comments` (toxicidad), `deepmind/code_contests` o `LorenzH/juliet_test_suite_c_1_3` (seguridad en código), lo que sugiere un entrenamiento multi-tarea deliberado más que un ajuste sobre una única tarea.

Su relevancia actual reside en el enfoque: un único adaptador reutilizable sobre un decoder de 12B que actúa como clasificador o juez en pipelines de producción, en lugar de mantener una flota de clasificadores especializados por dominio. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; modelo base google/gemma-4-12B-it |
| Parametros totales | No disponible para el adaptador; el modelo base es de 12B (segun el nombre del repositorio y `base_model`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; los benchmarks se sirven a 4096 tokens ("JevBench public, served at 4096") |
| Tipos de cuantizacion | No disponible (solo se publican pesos del adaptador en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 (declarada para el adaptador; el modelo base se rige por sus propios terminos) |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

La arquitectura del sistema es la del modelo base google/gemma-4-12B-it, un transformer decoder-only, más un adaptador LoRA entrenado con PEFT sobre él. El repositorio no contiene los pesos completos del modelo base, sino únicamente el delta del adaptador (0.8 GB), por lo que su uso requiere descargar gemma-4-12B-it por separado y cargar el adaptador encima con la librería `peft`. La model card declara `base_model_relation: adapter`.

En cuanto a los datos, la model card enumera 25 datasets de entrenamiento o evaluación que cubren clasificación de temas (`ag_news`, `dbpedia_14`, `yahoo_answers_topics`), intención conversacional (`banking77`, `clinc_oos`), spam (`sms_spam`), toxicidad (`civil_comments`), pares de frases y NLI (`glue`, `paws`, `boolq`), verificación de hechos (`vitaminc`, `PubMedQA`), reseñas (`yelp_review_full`, `sst5`, `sealuzh/app_reviews`), formalidad (`pavlick-formality-scores`), razonamiento lógico (`ruletaker`, `tasksource/Boardgame-QA`), calidad de respuesta (`nvidia/HelpSteer2`) y un bloque relevante de código (`cubert_ETHPy150Open`, `commitpackft`, `codereviewer`, `juliet_test_suite_c_1_3`, `deepmind/code_contests`). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF, DPO o calibración posterior; la etiqueta `calibration` aparece como tag, pero sin metodología documentada.

## Capacidades

- Clasificación de texto en múltiples dominios: temas de noticias, intención de usuario, spam, toxicidad, reseñas y temas generales, a partir de los datasets declarados (`ag_news`, `banking77`, `clinc_oos`, `dbpedia_14`, `yahoo_answers_topics`, `sms_spam`, `civil_comments`).
- Emisión de decisiones tipadas (typed decisions) con calibración declarada, orientada a seleccionar una etiqueta o acción entre un conjunto cerrado de opciones.
- Verificación de hechos y entailment: evaluado en `tals/vitaminc`, `google/boolq`, `contractnli` y `paws`.
- Respondibilidad de preguntas sobre contexto: evaluado en `hotpotqa` y `musique`, con resultados separados para casos answerable y unanswerable, lo que permite usarlo como filtro de answerability en pipelines RAG.
- Razonamiento lógico y de sentido común: evaluado en `tasksource/ruletaker` y `tasksource/Boardgame-QA`.
- Comprensión y revisión de código: identificación de CWE (`code/cwe_choice`), detección de bugs (`bug_swapped_operands`, `bug_variable_misuse`, `bug_wrong_binary_operator`), tipo de excepción, coincidencia con docstring, mensajes de commit, entrada y salida de ejecución, y selección de solución correcta.
- Evaluación de calidad de respuestas: métricas de adequacy derivadas de `nvidia/HelpSteer2`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el nombre `strands-decider` sugiere integración en un framework de agentes, pero no se documenta.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Enrutado de peticiones en atención al cliente: el modelo puede clasificar la intención de un mensaje de usuario en un conjunto cerrado de categorías (como las de `banking77` y `clinc_oos`) y derivar la conversación al flujo o al agente adecuado, reduciendo el coste frente a un LLM generativo.
- Moderación de contenido y toxicidad: entrenado con `google/civil_comments`, sirve para etiquetar comentarios según su grado de toxicidad antes de publicarlos o para priorizar la revisión humana.
- Filtro de answerability en sistemas RAG: con los resultados en `musique` (0.936 de accuracy global, 0.947 en answerable y 0.925 en unanswerable) y `hotpotqa` (0.911), puede decidir si el contexto recuperado basta para responder antes de invocar al modelo generador, evitando respuestas alucinadas.
- Verificación de hechos y entailment documental: los resultados en `contractnli` (0.876) y `vitaminc` permiten usarlo para comprobar si una afirmación se sigue de un documento, por ejemplo en revisión de contratos o de informes.
- Revisión automática de código en CI/CD: la detección de CWE (0.955) y de patrones de bug (hasta 0.910 en operandos intercambiados) permite añadir un paso de clasificación que marque hallazgos de seguridad en un pull request antes del merge, con la salvedad de que la detección de solución correcta rinde solo 0.539.
- Clasificación de reseñas y análisis de voz del cliente: con `yelp_review_full`, `sst5` y `sealuzh/app_reviews`, puede etiquetar sentimiento y estrellas inferidas para agregar métricas de producto.
- Filtrado y curado de datasets: la detección de paráfrasis (`paws`) y la clasificación temática permiten deduplicar y etiquetar grandes corpus antes de entrenar otros modelos.
- Detección de spam en mensajes cortos: `ucirvine/sms_spam` habilita su uso en pasarelas de mensajería o formularios de contacto.
- Evaluación automática de respuestas generadas: las métricas de adequacy derivadas de `nvidia/HelpSteer2` permiten construirlo como juez o recompensa en pipelines de evaluación y alineamiento.
- Clasificación y agregación de noticias: `ag_news` y `dbpedia_14` permiten etiquetar artículos por tema para agregadores o sistemas de recomendación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Las entradas marcadas como internas (`hobson-internal`) no son verificables de forma independiente; ningún resultado figura como verificado.

| Dataset / tarea | Metrica | Valor | N |
|---|---|---|---|
| JevBench public, served at 4096 | accuracy | 0.8658 | 231 (200/231) |
| eval: held-out short tasks | accuracy | 0.708 | 6000 |
| eval: boardgame | accuracy | 0.891 | 900 |
| eval: contractnli | accuracy | 0.876 | 1026 |
| eval: hotpotqa (held out) | accuracy | 0.911 | 959 |
| eval: musique | accuracy | 0.936 | 1199 |
| eval: musique, answerable | accuracy | 0.947 | 599 |
| eval: musique, unanswerable | accuracy | 0.925 | 600 |
| eval: [4] adequacy_hs2 | accuracy | 0.795 | 234 |
| eval: [5] gen:adequacy | accuracy | 0.884 | 302 |
| eval: [6] code/bug_swapped_operands | accuracy | 0.910 | 89 |
| eval: [6] code/bug_variable_misuse | accuracy | 0.831 | 89 |
| eval: [6] code/bug_wrong_binary_operator | accuracy | 0.798 | 89 |
| eval: [6] code/commit_message | accuracy | 0.989 | 89 |
| eval: [6] code/correct_solution | accuracy | 0.539 | 89 |
| eval: [6] code/cwe_choice | accuracy | 0.955 | 89 |
| eval: [6] code/docstring_match | accuracy | 0.955 | 89 |
| eval: [6] code/exception_type | accuracy | 0.876 | 89 |
| eval: [6] code/exec_input | accuracy | 0.810 | 142 |
| eval: [6] code/exec_output | accuracy | 0.863 | 662 |

La lista de resultados del `model-index` disponible está truncada en la entrada `eval: [6] code/needle_function`, por lo que pueden existir métricas adicionales no reflejadas aquí. No se han publicado en la información disponible resultados de benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0.8 GB, pero la inferencia requiere cargar el modelo base google/gemma-4-12B-it completo.
- VRAM estimada para el modelo base de 12B (estimaciones de ingeniería, no publicadas por el autor): aproximadamente 24-26 GB en fp16/bf16, 12-14 GB en cuantización de 8 bits y 7-9 GB en cuantización de 4 bits.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para fp16 sin cuantizar; A10G 24 GB o RTX 4090 24 GB para fp16 justo al límite o 8 bits con holgura.
- Cabe en GPU de consumo: sí, en 4 bits cabría en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080); en 8 bits requeriría 16 GB o más (RTX 4080/4090, RTX A4000).
- Opciones de despliegue: `peft` sobre transformers para carga directa del adaptador; vLLM o TGI si se fusiona el adaptador con el modelo base; llama.cpp u Ollama solo si se convierte previamente a GGUF, ya que el repositorio no publica pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información disponible otros adaptadores "decider" de la misma categoría con los que comparar directamente. La referencia inmediata es el propio modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amazon/strands-decider-12B-gemma4-v1-2610 | Adaptador LoRA de 0.8 GB sobre base de 12B | No disponible (evaluado a 4096 en JevBench) | JevBench 0.8658 (231) | apache-2.0 (adaptador) | HuggingFace, 0 descargas |
| google/gemma-4-12B-it | 12B | No disponible | No disponible | Terminos de Google para la familia Gemma | HuggingFace |
| Clasificadores encoder dedicados (tipo DeBERTa, BERT) | Orden de 0.1-0.5B | Tipicamente 512-1024 tokens | No disponible en esta informacion | Variable segun modelo | HuggingFace |

La comparación con clasificadores encoder es solo categórica: no se dispone de cifras comparables bajo los mismos conjuntos de evaluación, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No hay resultados verificados: todas las métricas del `model-index` figuran con `verified: false`, y los conjuntos de evaluación internos (`hobson-internal`) no son reproducibles de forma pública.
- El repositorio contiene únicamente el adaptador, no los pesos completos: sin el modelo base no es funcional, y cualquier despliegue implica descargar y servir un modelo de 12B.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por terceros.
- La licencia apache-2.0 se declara para el adaptador, pero el modelo base google/gemma-4-12B-it está sujeto a los términos de la familia Gemma de Google. Conviene verificar la compatibilidad de ambos marcos antes de un uso comercial.
- No se declaran idiomas soportados, por lo que no hay garantía de comportamiento fuera del inglés, que es el idioma predominante en los datasets enumerados.
- Riesgo de alucinación: al ser un modelo de decisión sobre un decoder generativo, puede producir etiquetas fuera del conjunto permitido o inseguras en calibración si la entrada difiere de la distribución de entrenamiento; las probabilidades declaradas como "calibradas" no vienen acompañadas de métricas de calibración (ECE, Brier) en la información disponible.
- Rendimiento desigual por tarea: la selección de solución correcta en código se queda en 0.539 de accuracy, y el conjunto de tareas cortas retenidas en 0.708, frente a valores superiores a 0.91 en otras evaluaciones. No conviene asumir un rendimiento homogéneo entre dominios.
- Sesgos: no se documentan análisis de sesgo para conjuntos sensibles como `google/civil_comments`, donde los modelos de toxicidad muestran sesgos conocidos hacia determinados dialectos y grupos; no hay información específica sobre este adaptador.
- Los tamaños de muestra de varias evaluaciones de código son muy reducidos (n=89), lo que implica intervalos de confianza amplios y hace desaconsejable tomar esos valores como estimaciones estables.
- La ventana de contexto real del modelo no se declara; los benchmarks se sirven a 4096 tokens, pero no se confirma si es el límite efectivo.
- Se desconoce el número de tokens de entrenamiento, la composición exacta de la mezcla y si hubo fases de alineamiento, lo que dificulta anticipar el comportamiento fuera de los dominios evaluados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amazon/strands-decider-12B-gemma4-v1-2610
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Librería PEFT: https://huggingface.co/docs/peft
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: los enlaces obtenidos corresponden a páginas comerciales de Amazon (amazon.fr, amazon.com, primevideo.com) y no guardan relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
