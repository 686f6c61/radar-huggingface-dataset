# heidercs/longformer-cv-direct

## Resumen

`heidercs/longformer-cv-direct` es un modelo de clasificación de texto en español desarrollado por el usuario heidercs (publicado en HuggingFace) que asigna currículums a 43 categorías profesionales. Se trata de un fine-tuning del modelo base `mrm8488/longformer-base-4096-spanish`, un encoder tipo Longformer de la familia RoBERTa con 127.431.211 parámetros, que procesa documentos completos de hasta 4.096 tokens (aproximadamente 10 páginas) en una sola pasada, sin truncado ni fragmentación en *chunks*.

El problema que resuelve es el del cribado automático de CVs largos: la mayoría de clasificadores basados en BERT están limitados a 512 tokens, lo que obliga a fragmentar el documento y agregar predicciones por partes, con la consiguiente pérdida de información estructural (secciones, orden, trayectoria completa). Este modelo evita ese paso intermedio, de ahí el sufijo "direct" del nombre. Su relevancia práctica está en sistemas ATS (Applicant Tracking Systems) y *job boards* que necesitan enrutar candidaturas en español a categorías profesionales.

El coste de esa decisión de diseño es un rendimiento global inferior: sobre un conjunto de test de 2.681 documentos obtiene un 78,4% de *accuracy* y un F1 macro de 0,775, el peor resultado global de los modelos comparados en el proyecto del autor, pero también la brecha más pequeña entre documentos cortos y largos (0,775 frente a 0,758 de F1 macro). El modelo tiene 0 descargas y 0 *likes* en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo Longformer (atención de ventana deslizante + atención global), inicializado desde `mrm8488/longformer-base-4096-spanish` (familia RoBERTa) |
| Parámetros totales | 127.431.211 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el repositorio solo contiene pesos safetensors en precisión completa) |
| Idiomas soportados | español (`es`); el corpus de entrenamiento procede de un corpus en inglés traducido con MarianMT |
| Licencia | `other` (no se detallan los términos en la información disponible) |
| Formato de pesos | safetensors |
| Tarea | `text-classification` (clasificación de documentos en 43 categorías profesionales) |
| Modelo base | `mrm8488/longformer-base-4096-spanish` |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-10 / 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es un encoder Longformer: un transformer con atención híbrida que sustituye la atención densa cuadrática por una atención de ventana deslizante local más un conjunto reducido de tokens con atención global, lo que reduce el coste de memoria de O(n²) a O(n) respecto a la longitud de secuencia. Los embeddings posicionales llegan hasta 4.096 posiciones, lo que permite procesar el documento completo en una única pasada. El tamaño de ventana concreta no se especifica en la información disponible. Los pesos proceden del modelo base `mrm8488/longformer-base-4096-spanish` y el tokenizador se hereda de ese mismo modelo.

El entrenamiento se realizó sobre un corpus público de currículums en inglés con 43 categorías, traducido automáticamente al español con MarianMT: 6.195 documentos de entrenamiento y 2.681 de test. No se documentan en la información proporcionada ni el número de tokens de entrenamiento, ni la composición detallada del dataset, ni si se aplicaron técnicas de ajuste por preferencias (RLHF, DPO) —poco habituales en un clasificador encoder—, ni hiperparámetros, épocas o estrategia de validación. La evaluación reportada es una única pasada sobre el conjunto de test.

La innovación destacable no está en el algoritmo sino en el régimen de inferencia: clasificación directa de documentos largos sin *chunking* ni agregación posterior, con una calibración de confianza documentada por el autor (softmax con media 0,768 en aciertos frente a 0,504 en errores, máximo observado 0,944, umbral recomendado 0,65).

## Capacidades

- Clasificación de currículums en español en 43 categorías profesionales, con una única etiqueta por documento.
- Procesamiento de documentos de hasta 4.096 tokens en una sola pasada, equivalente a aproximadamente 10 páginas, sin truncado ni fragmentación.
- Clasificación de documentos cortos y largos con degradación moderada: F1 macro 0,775 en documentos de ≤512 tokens BETO y 0,758 en documentos de >512 tokens BETO.
- Estimación de confianza calibrada mediante softmax, útil para enrutado selectivo con umbral (0,65 recomendado por el autor).
- Idiomas: español. No se documenta soporte multilingüe, pese a que el tokenizador del modelo base pueda procesar otros idiomas.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión, audio ni *thinking mode*: es un clasificador de secuencia, no un modelo generativo.

## Casos de uso

- Cribado automático en ATS: el modelo asigna cada currículum recibido a una de las 43 categorías profesionales en una sola inferencia, lo que elimina la fase de troceado del documento y simplifica el *pipeline* de ingesta.
- Enrutado de candidaturas a reclutadores especializados: la etiqueta predicha permite dirigir cada CV al equipo correspondiente (por ejemplo, perfiles técnicos, financieros o sanitarios) sin intervención manual.
- Indexado y búsqueda en *job boards*: la categoría asignada funciona como metadato de filtrado para motores de búsqueda de empleo, de modo que los candidatos aparezcan en la categoría correcta desde el momento de la subida.
- Cribado de CVs largos (perfiles académicos, investigadores, directivos): al leer hasta 4.096 tokens sin truncar, conserva publicaciones, trayectoria completa y secciones finales que un modelo de 512 tokens perdería con el truncado.
- Triaje con revisión humana selectiva: aplicando el umbral de confianza de 0,65 documentado por el autor, el 71% del test se resuelve de forma directa con un 90,4% de acierto en esa ruta, y el 29% restante se deriva a revisión manual.
- Analítica del mercado laboral: clasificar un corpus histórico de currículums permite medir la distribución de perfiles profesionales por región o periodo y detectar tendencias de demanda.
- Enriquecimiento de CRM de reclutamiento: la categoría predicha puede escribirse como campo estructurado en la ficha del candidato para segmentación de campañas y *matching* oferta-demanda.
- Pre-filtrado en procesos de selección de alto volumen: descartar o priorizar candidaturas antes de la lectura humana cuando el volumen supera la capacidad del equipo.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un test de 2.681 documentos (evaluación única):

| Segmento | Documentos | Accuracy | F1 macro |
|---|---:|---:|---:|
| Global | 2.681 | 78,4% | 0,775 |
| Cortos (≤512 tokens BETO) | 1.097 | 82,3% | 0,775 |
| Largos (>512 tokens BETO) | 1.584 | 75,7% | 0,758 |

Calibración de confianza (softmax):

| Métrica | Valor |
|---|---|
| Confianza media en predicciones correctas | 0,768 |
| Confianza media en predicciones erróneas | 0,504 |
| Confianza máxima observada | 0,944 |
| Umbral recomendado | 0,65 |
| Cobertura de la ruta directa con ese umbral | 71% del test |
| Accuracy en la ruta directa (confianza ≥ 0,65) | 90,4% |

El propio autor señala que 78,4% de *accuracy* global es el peor resultado entre los modelos comparados en su proyecto, aunque también el que presenta la brecha menor entre documentos cortos y largos (0,775 frente a 0,758, comparado con 0,822 frente a 0,810 del enfoque XLM-RoBERTa con *chunking*). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, ya que el modelo es un clasificador de dominio específico y no un modelo generativo.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del recuento de parámetros (127.431.211) y del régimen de contexto, no mediciones publicadas por el autor.

- Pesos del modelo: aproximadamente 0,51 GB en fp32 y 0,25 GB en fp16/bf16.
- VRAM estimada para inferencia a 4.096 tokens, lote 1: del orden de 2 a 4 GB en fp16, dominada por las activaciones intermedias y no por los pesos.
- VRAM estimada con lotes mayores (8-32 documentos de 4.096 tokens): el consumo crece de forma aproximadamente lineal con el tamaño de lote; se recomienda medir en el *hardware* objetivo antes de dimensionar. El autor advierte de que el modelo requiere «considerablemente más memoria de GPU que un modelo de 512 tokens al procesar contextos de hasta 4.096 tokens».
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM debería ser suficiente para lote 1 (RTX 3060 12 GB, RTX 4070, RTX 4090); para lotes grandes o servicio concurrente se recomiendan A100, H100 o L40S.
- Cabe en GPU de consumo: sí, en la mayoría de GPU modernas con 8 GB o más, siempre que se ajuste el tamaño de lote a la longitud del documento.
- Opciones de despliegue: `transformers` con PyTorch (uso documentado en la *model card*), exportación a ONNX Runtime, TorchScript, FastAPI o servicios gestionados como Hugging Face Inference Endpoints. No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión no incluida en el repositorio. El soporte de vLLM y TGI para este modelo concreto no se documenta.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 macro corto / largo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `heidercs/longformer-cv-direct` | 127,4 M | 4.096 tokens, sin *chunking* | 0,775 / 0,758 | `other` | HuggingFace |
| Enfoque XLM-RoBERTa con *chunking* (referencia del mismo proyecto) | no disponible | no disponible (fragmenta el documento) | 0,822 / 0,810 | no disponible | no disponible |
| `mrm8488/longformer-base-4096-spanish` (modelo base) | no disponible | 4.096 tokens | no disponible (no es un clasificador de CVs) | no disponible | HuggingFace |
| BETO (usado en la evaluación solo para contar tokens de segmentación) | no disponible | 512 tokens | no disponible | no disponible | no disponible |

El único contraste cuantitativo publicado es frente al enfoque XLM-RoBERTa con *chunking*, que supera a este modelo en F1 macro tanto en documentos cortos (0,822 frente a 0,775) como en largos (0,810 frente a 0,758), a cambio de fragmentar el documento y agregar predicciones. Para el resto de alternativas no hay datos de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento global moderado: 78,4% de *accuracy* y F1 macro 0,775 implican que aproximadamente uno de cada cinco documentos se clasifica incorrectamente en el conjunto de test.
- Degradación en documentos largos: el F1 macro baja de 0,775 (cortos) a 0,758 (largos) y la *accuracy* de 82,3% a 75,7%, por lo que los CVs extensos siguen siendo el caso más difícil.
- Corpus de entrenamiento traducido automáticamente con MarianMT desde inglés: es previsible que el modelo arrastre artefactos de traducción y vocabulario poco natural en español, y que rinda peor ante jerga local, formatos de CV propios de España o Hispanoamérica y abreviaturas del sector.
- No se documenta análisis de sesgos demográficos, de género, de edad ni de origen. Un clasificador de currículums usado en selección es un caso de uso de alto riesgo desde el punto de vista regulatorio, y este modelo no aporta ninguna evaluación de equidad.
- Riesgo de error en lugar de alucinación: al ser un clasificador, no genera texto, pero sí puede asignar con alta confianza una categoría incorrecta; el autor documenta saturación de la softmax (máximo observado 0,944) y una media de 0,504 en predicciones erróneas, lo que indica que la confianza no separa errores de forma perfecta.
- La recomendación de umbral (0,65) procede de una única evaluación sobre el test del propio proyecto; no está validada en dominios distintos ni con datos de producción.
- Truncado por encima de 4.096 tokens: el ejemplo de uso emplea `truncation=True` con `max_length=4096`, de modo que documentos más largos pierden contenido sin aviso.
- Licencia: el modelo se publica bajo licencia `other`, sin términos detallados en la información disponible. Además, el autor advierte de que la licencia de redistribución del corpus de origen depende de sus términos publicados y debe revisarse antes de un uso comercial estricto.
- Dominio restringido: el modelo está entrenado únicamente para clasificar currículums en 43 categorías; no se documenta su comportamiento fuera de ese dominio ni la existencia de una clase de reserva para perfiles que no encajen.
- Adopción nula: 0 descargas y 0 *likes*, sin evidencia de uso en producción por terceros ni de validación independiente.
- Búsqueda web sin resultados relevantes: las consultas realizadas no devolvieron artículos, *papers* ni análisis independientes sobre este modelo; toda la información procede de la *model card* del autor y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heidercs/longformer-cv-direct
- Modelo base: https://huggingface.co/mrm8488/longformer-base-4096-spanish
- *Papers*, blogs, repositorios o demos adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas de navegación del motor de búsqueda).
