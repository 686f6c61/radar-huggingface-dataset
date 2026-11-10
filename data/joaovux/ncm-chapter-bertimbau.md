# joaovux/ncm-chapter-bertimbau

## Resumen

`joaovux/ncm-chapter-bertimbau` es un modelo de clasificación de texto en portugués que predice el capítulo NCM (Nomenclatura Común del Mercosur, los dos primeros dígitos del código) de un bien adquirido por un organismo público brasileño, a partir de la descripción del artículo. Lo desarrolla joaovux como fine-tuning de `neuralmind/bert-base-portuguese-cased` (BERTimbau base) sobre el dataset `joaovux/pncp-ncm-chapters`, derivado de datos del Portal Nacional de Contrataciones Públicas (PNCP) de Brasil.

El modelo resuelve un problema concreto de clasificación fiscal y de compras públicas: mapear descripciones de catálogo (CATMAT) a uno de 14 capítulos NCM frecuentes, con una clase `outros` para el resto. Con 108,9 millones de parámetros y una ventana de 128 tokens, es un modelo compacto pensado para inferencia barata y despliegue en CPU o GPU de gama baja, no para generación.

Su relevancia es doble: por un lado, demuestra que un encoder pequeño fine-tuneado supera a un enfoque clásico TF-IDF + regresión logística en accuracy (0,949 frente a 0,935) y a un LLM zero-shot (0,757); por otro, publica un protocolo de evaluación estricto con partición temporal (descripciones de artículos vistos por primera vez el último día recogido), lo que da una estimación realista de generalización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder), fine-tuning para clasificación de secuencias |
| Parámetros totales | 108.934.671 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (secuencias truncadas en entrenamiento); máximo del backbone BERT base: 512 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | neuralmind/bert-base-portuguese-cased |
| Dataset de entrenamiento | joaovux/pncp-ncm-chapters |
| Etiquetas | 14 clases (13 capítulos NCM + `outros`) |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar (12 capas, 768 de dimensión oculta, 12 cabezas de atención, vocabulario en portugués con casing) al que se le añade una cabeza de clasificación lineal sobre el token `[CLS]` para 14 clases. No hay innovaciones arquitectónicas: es un fine-tuning supervisado convencional.

El entrenamiento usó 3 épocas, learning rate 3e-05, batch de 32, secuencias truncadas a 128 tokens y función de pérdida ponderada por clase para compensar el desbalance entre capítulos. La mejor época se seleccionó por macro-F1 en validación. El coste computacional declarado es de 3,6 minutos en una única Tesla T4. No se documenta el número exacto de tokens de entrenamiento, la composición completa del dataset ni si hubo aumentación de datos; tampoco se menciona RLHF ni DPO, algo esperable en un encoder de clasificación.

La decisión de diseño más relevante es la partición temporal del conjunto de test: 1.492 descripciones de artículos de catálogo vistos por primera vez el último día recogido, sin ninguna coincidencia de redacción con el entrenamiento. Esto evita la fuga de información típica de particiones aleatorias en datos de catálogo, donde la misma descripción puede repetirse.

## Capacidades

- Clasificación de texto multietiqueta restringida a 14 clases: 13 capítulos NCM (`30`, `38`, `39`, `48`, `61`, `82`, `83`, `84`, `85`, `87`, `90`, `94`, `96`) y la clase `outros`.
- Predicción de la etiqueta con puntuaciones de confianza; el ejemplo de la model card usa `top_k=3` mediante `pipeline("text-classification")`.
- Procesamiento de descripciones cortas de bienes en portugués brasileño (texto de catálogo CATMAT).
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al portugués; el backbone tiene cierto conocimiento del inglés por preentrenamiento, pero el fine-tuning es monolingüe.
- Integración directa con `transformers` y con Text Embeddings Inference (tag `text-embeddings-inference` y `endpoints_compatible`).

## Casos de uso

- Clasificación automática de compras públicas: dado el texto de un ítem de catálogo en un proceso de licitación brasileño, asignar el capítulo NCM para validar la codificación fiscal declarada por el proveedor y detectar inconsistencias antes de la adjudicación.
- Enriquecimiento de bases de datos de contratación: procesar lotes de descripciones históricas del PNCP y completar el campo de capítulo NCM en registros donde falta o es ambiguo, con un coste de inferencia muy bajo (108,9 M de parámetros).
- Triaje previo a revisión humana: usar `top_k=3` para priorizar los ítems con baja confianza y derivarlos a un especialista fiscal, reduciendo el volumen de revisión manual.
- Detección de fraude o error de clasificación: comparar la predicción del modelo con el NCM declarado por el proveedor y marcar discrepancias para auditoría.
- Clasificación en tiempo real dentro de un formulario de alta de ítems: el modelo cabe en CPU y responde en milisegundos, por lo que puede servir como sugerencia interactiva al funcionario que redacta la descripción.
- Benchmark interno de pipelines de NLP fiscal: al publicar una partición temporal y comparativas con TF-IDF + regresión logística y con un LLM zero-shot, sirve como línea base reproducible para evaluar mejoras (modelos mayores, aumento de datos, clasificación jerárquica a nivel de posición).
- Filtrado y agregación analítica: agrupar el gasto público por capítulo NCM para informes de transparencia, siempre que las descripciones provengan de catálogo.

## Benchmarks y rendimiento

Conjunto de test: 1.492 descripciones de ítems de catálogo vistas por primera vez el último día recogido, sin coincidencia de redacción con el entrenamiento.

| Modelo | Macro-F1 | Accuracy |
|---|---:|---:|
| bertimbau (este modelo) | 0,914 | 0,949 |
| tfidf-logreg | 0,903 | 0,935 |
| gemini-3.5-flash-lite-zero-shot | 0,611 | 0,757 |
| majority (clase mayoritaria) | 0,036 | 0,337 |

Comparación pareada con bootstrap sobre los ítems de test frente a tfidf-logreg: macro-F1 +1,0 puntos (intervalo del 95 %: -1,7 a +3,3, dentro del ruido) y accuracy +1,4 puntos (intervalo del 95 %: +0,2 a +2,7, diferencia real).

Rendimiento por etiqueta en test:

| Etiqueta | Capítulo | F1 en test | Ejemplos en test |
|---|---|---:|---:|
| `30` | Produtos farmacêuticos | 0,97 | 132 |
| `38` | Produtos diversos das indústrias químicas | 0,89 | 15 |
| `39` | Plásticos e suas obras | 0,92 | 14 |
| `48` | Papel e cartão; obras de pasta de celulose, de papel ou de cartão | 0,92 | 7 |
| `61` | Vestuário e seus acessórios, de malha | 0,80 | 4 |
| `82` | Ferramentas, artefatos de cutelaria e talheres, de metais comuns | 0,87 | 49 |
| `83` | Obras diversas de metais comuns | 0,89 | 43 |
| `84` | Reatores nucleares, caldeiras, máquinas, aparelhos e instrumentos mecânicos | 0,95 | 311 |
| `85` | Máquinas, aparelhos e materiais elétricos; aparelhos de som e de imagem | 0,94 | 282 |
| `87` | Veículos automóveis, tratores, ciclos e outros veículos terrestres | 0,98 | 92 |
| `90` | Instrumentos e aparelhos de óptica, fotografia, medida, médico-cirúrgicos | 0,97 | 503 |
| `94` | Móveis; mobiliário médico-cirúrgico; colchões; iluminação; construções pré-fabricadas | 0,87 | 15 |
| `96` | Obras diversas | 1,00 | 3 |
| `outros` | Otros capítulos (pocos ejemplos en entrenamiento) | 0,82 | 22 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB de pesos (108,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- En fp16/bf16: aproximadamente 0,22 GB de pesos; en cuantización int8, en torno a 0,11 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta entrenamiento en una Tesla T4, y la inferencia es trivial para T4, A10, L4, A100 o H100. No requiere GPU de gama alta.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Despliegue: `transformers` (pipeline de text-classification), Text Embeddings Inference (tags `text-embeddings-inference` y `endpoints_compatible`), y exportación a ONNX o cuantización dinámica para CPU. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no publicados. Con 128 tokens de entrada y 108,9 M de parámetros, se espera latencia de milisegundos por lote en GPU moderna y de decenas de milisegundos en CPU; el dato no está confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Macro-F1 (test del autor) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| joaovux/ncm-chapter-bertimbau | BERT fine-tuneado | 108,9 M | 128 tokens (entrenamiento) | 0,914 | MIT | Hugging Face |
| tfidf-logreg (línea base del autor) | TF-IDF + regresión logística | no aplica | no aplica | 0,903 | no disponible | Repositorio del autor |
| gemini-3.5-flash-lite-zero-shot | LLM propietario zero-shot | no disponible | no disponible | 0,611 | propietaria | API de Google |
| neuralmind/bert-base-portuguese-cased | BERT base preentrenado | 108,9 M | 512 tokens | no aplica (sin fine-tuning para esta tarea) | MIT | Hugging Face |

La comparación relevante es frente a tfidf-logreg: la mejora en macro-F1 está dentro del ruido estadístico y la mejora en accuracy es pequeña pero significativa. Frente al LLM zero-shot, la ventaja es amplia (0,914 frente a 0,611 de macro-F1), lo que sugiere que la tarea se beneficia de supervisión específica sobre el dominio del catálogo.

## Limitaciones y advertencias

- Solo texto de catálogo: todas las descripciones de entrenamiento son entradas CATMAT. La mayoría de bienes se compran sin catálogo, descritos con palabras propias del organismo, y el rendimiento en esos casos será peor que el reportado en test.
- Solo nivel de capítulo (dos dígitos) y solo 14 capítulos con ejemplos suficientes; todo lo demás se agrupa en `outros`, lo que limita la granularidad frente a una clasificación NCM completa.
- El mapeo NCM del catálogo se toma como verdad, incluidas sus convenciones propias (por ejemplo, tintas de impresora clasificadas bajo impresoras, capítulo 84), que pueden no coincidir con la interpretación fiscal oficial.
- Desbalance de clases severo: capítulos como `96` (3 ejemplos) o `61` (4 ejemplos) tienen estimaciones de F1 poco fiables pese a los valores altos.
- Riesgo de alucinación bajo en el sentido generativo (no genera texto), pero riesgo de sobreconfianza en la etiqueta predicha cuando la descripción es ambigua o muy corta.
- Ventana de 128 tokens: descripciones largas se truncan y pueden perder información discriminativa.
- Monolingüe en portugués; no apto para descripciones en español ni en inglés sin reentrenamiento.
- Licencia MIT permite uso comercial, pero no se documentan garantías ni auditorías de sesgo; el modelo puede heredar sesgos del corpus PNCP y del catálogo CATMAT.
- No hay métricas publicadas de latencia, throughput ni robustez ante ruido tipográfico u OCR, relevantes si se aplica sobre documentos escaneados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-10: no hay validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joaovux/ncm-chapter-bertimbau
- Dataset: https://huggingface.co/datasets/joaovux/pncp-ncm-chapters
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Repositorio de código y evaluación: https://github.com/joaomouravs/classificador-ncm
- Informe de resultados: https://github.com/joaomouravs/classificador-ncm/blob/main/results/REPORT.md
- No se han encontrado en la información disponible papers, blogs ni demos adicionales.
