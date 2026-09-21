# Berk/assay-27b

# assay-27b (Berk)

## Resumen

assay-27b es un modelo de clasificación y decisión calibrada construido por el autor Berk sobre el backbone Qwen/Qwen3.8-27B mediante un adaptador LoRA (r=16, alpha=32) entrenado con QLoRA a 4 bits. Su particularidad es que no genera texto: recibe un estado (por ejemplo, un ticket de soporte o un fragmento de texto) y una o varias preguntas tipadas —`bool` (sí/no), `choice` (entre 2 y 255 opciones descritas) y `score` (entre 2 y 10 niveles ordenados)— y devuelve una distribución de probabilidad por pregunta, una confianza y una puntuación de evidencia. Al leer la respuesta directamente de los logits de siguiente token sobre los tokens de etiqueta en una única posición de decisión, la salida no puede salirse del esquema definido.

El interés práctico está en su enfoque de calibración y eficiencia: las preguntas se tratan como ramas aisladas sobre un estado compartido mediante máscara de atención en bloque y posiciones reiniciadas, de modo que empaquetar varias preguntas en una sola pasada produce exactamente el mismo resultado que enviarlas por separado, con una reducción de latencia muy notable (24 preguntas en 750,8 ms empaquetadas frente a 2666,8 ms separadas en una RTX 5090). Esto lo sitúa como una pieza útil para enrutado, triaje y etiquetado por lotes donde se necesita una probabilidad accionable y no una frase generada.

El repositorio (0,3 GB) contiene el adaptador y la cabeza de evidencia (`assay_head.safetensors`); el modelo base se descarga aparte y se carga cuantizado a 4 bits con bitsandbytes, lo que requiere unos 15 GB de memoria de GPU. Está publicado con licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.8-27B) con adaptador LoRA y cabeza de evidencia lineal sobre el token de decisión |
| Parametros totales | 27 000 millones en el modelo base (según la denominación Qwen/Qwen3.8-27B); el recuento exacto del adaptador no está disponible en la información proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en 4 bits (bitsandbytes) durante el entrenamiento QLoRA y en carga; adaptador y cabeza en safetensors (precisión no detallada) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (con advertencia del autor sobre licencias de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador LoRA en `adapter/` y `assay_head.safetensors`) |
| Pipeline declarado | text-classification / zero-shot-classification (decision-model calibrado) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de un backbone transformer decoder-only (Qwen/Qwen3.8-27B) al que se le añade un adaptador LoRA de rango 16 y alpha 32, entrenado con QLoRA (base en 4 bits) durante 1 época, con learning rate 5e-05 y batch efectivo de 4 x 2 por acumulación. La respuesta no se genera token a token: se lee de los logits de siguiente token del propio modelo sobre los tokens de etiqueta de las opciones, en una única posición de decisión. Las preguntas se organizan como ramas aisladas sobre un estado compartido mediante máscara de atención en bloque y reinicio de posiciones, de forma que el empaquetado y las peticiones separadas coinciden exactamente. Una cabeza de evidencia lineal sobre el token de decisión predice si el estado soporta o no la pregunta formulada.

El entrenamiento usa entropía cruzada contra objetivos blandos: distribuciones de etiquetas humanas cuando la fuente las proporciona, suavizado SORD para preguntas ordinales y one-hot en el resto de casos; las opciones de las preguntas de tipo `choice` se barajan en cada ejemplo. La cabeza de evidencia se entrena con negativos de pasajes intercambiados. Se ajustó una temperatura global de 1,235 en el split de calibración de las tareas de entrenamiento y se aplica sin cambios en el resto de dominios. Los datos de entrenamiento son 55 datasets públicos de clasificación, inferencia, comprensión lectora y preferencias, renderizados como preguntas tipadas con opciones descritas, más un generador sintético de aplicación de políticas (rúbricas en `assay/data/tasks.py`).

## Capacidades

- Decisión tipada calibrada en una sola pasada: preguntas booleanas (sí/no), de elección entre 2 y 255 opciones descritas y de puntuación ordinal entre 2 y 10 niveles.
- Salida estructurada garantizada: al no generar texto, la respuesta no puede quedar fuera del esquema definido.
- Probabilidad por pregunta, confianza y puntuación de evidencia de que el estado soporta la pregunta.
- Clasificación zero-shot sobre tareas no vistas en entrenamiento (11 datasets de retención: bbc_news, app_reviews, scitail, medical_questions_pairs, tweet_irony, ethos, stance_climate, dream, copa, truthful_qa, hh_rlhf).
- Procesamiento por lotes eficiente: múltiples preguntas sobre un mismo estado en una sola pasada con resultados idénticos a las peticiones separadas.
- Soporte de tool calling, function calling, agentes, generación de código, matemáticas, visión o audio: no disponible (el modelo no genera texto ni procesa otras modalidades).
- Capacidades multilingües: no disponibles; solo inglés.
- Capacidades especiales: cabeza de evidencia para cribado de preguntas no soportadas por el estado; temperatura de calibración global fija.

## Casos de uso

- Enrutado de tickets de soporte: con una pregunta de tipo `choice` se asigna cada ticket al equipo correspondiente (facturación, técnico, etc.) obteniendo además la distribución de probabilidad completa, útil para derivar a revisión humana cuando la confianza es baja.
- Triaje y clasificación de correo entrante: preguntas `bool` encadenadas (¿pide reembolso?, ¿menciona una incidencia de seguridad?) permiten etiquetar grandes volúmenes con umbrales ajustables sobre la probabilidad, sin riesgo de salidas mal formadas.
- Moderación de contenido: preguntas `bool` y `score` sobre toxicidad u ofensividad, con probabilidades calibradas en agregado y una tasa baja de errores confiados (0,005 en tareas no vistas con escalado, según el autor).
- Verificación en pipelines RAG: la cabeza de evidencia indica si el estado recuperado soporta realmente la pregunta planteada, lo que sirve como filtro previo antes de invocar un modelo generativo.
- Análisis de opinión y emoción por lotes: preguntas `score` ordinales sobre reseñas o mensajes, aprovechando el suavizado SORD para niveles ordenados en lugar de etiquetas discretas.
- Etiquetado asistido y curación de datos: generación de distribuciones de etiquetas para conjuntos sin anotaciones, con control de calibración sobre las propias etiquetas antes de fijar umbrales.
- Evaluación de pares de pregunta-respuesta o de inferencia textual (NLI, QNLI, PAWS) dentro de un sistema de control de calidad documental.
- Procesamiento de alto rendimiento con estado compartido: cuando muchas preguntas se aplican al mismo texto (por ejemplo, extracción de múltiples atributos de un mismo documento), el empaquetado reduce la latencia de 2666,8 ms a 750,8 ms para 24 preguntas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| split | n | accuracy | Brier | NLL | ECE | errores confiados |
|---|---|---|---|---|---|---|
| seen tasks (dev), raw | 5513 | 0.834 | 0.245 | 0.466 | 0.048 | 0.036 |
| seen tasks (dev), scaled | 5513 | 0.834 | 0.243 | 0.451 | 0.040 | 0.021 |
| unseen tasks (holdout), raw | 2020 | 0.842 | 0.220 | 0.392 | 0.031 | 0.015 |
| unseen tasks (holdout), scaled | 2020 | 0.842 | 0.221 | 0.390 | 0.040 | 0.005 |
| kev transfer-v4 dev, raw | 764 | 0.842 | 0.234 | 0.460 | 0.065 | 0.047 |
| kev transfer-v4 dev, scaled | 764 | 0.842 | 0.229 | 0.430 | 0.041 | 0.038 |

Desglose por fuente en kev transfer-v4:

| fuente transfer-v4 | n | accuracy | Brier | ECE |
|---|---|---|---|---|
| composition_held_and_or | 32 | 1.000 | 0.002 | 0.012 |
| composition_held_conditional | 32 | 0.812 | 0.347 | 0.177 |
| composition_held_or_not | 32 | 0.906 | 0.168 | 0.087 |
| contrastive_authorization | 40 | 1.000 | 0.000 | 0.003 |
| contrastive_deadline | 40 | 0.950 | 0.047 | 0.084 |
| emotion | 116 | 0.647 | 0.478 | 0.077 |
| mmlu | 116 | 0.784 | 0.333 | 0.119 |
| paws | 80 | 0.775 | 0.331 | 0.151 |
| qnli | 80 | 0.963 | 0.062 | 0.055 |
| sciq | 116 | 0.983 | 0.038 | 0.034 |
| tweet_offensive | 80 | 0.738 | 0.331 | 0.151 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15 GB de memoria de GPU para la base en 4 bits (bitsandbytes) más el adaptador y la cabeza de evidencia; cifra indicada por el autor.
- GPU recomendadas: cualquier GPU con 24 GB o más de VRAM para la configuración a 4 bits (RTX 4090, RTX 5090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB o más con la base cuantizada a 4 bits; por debajo de ese umbral no hay datos publicados.
- Opciones de despliegue: Transformers con el paquete `assay` (`AssayModel.from_pretrained`); el autor menciona también servidor propio en el repositorio. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia medida en una RTX 5090 (bf16, transformers), preguntas empaquetadas frente a peticiones separadas:

| preguntas | empaquetado (ms) | separado (ms) |
|---|---|---|
| 1 | 109.5 | 109.6 |
| 3 | 194.0 | 333.4 |
| 6 | 250.4 | 664.7 |
| 12 | 412.0 | 1330.3 |
| 24 | 750.8 | 2666.8 |

- Throughput: no disponible como cifra de tokens o peticiones por segundo; solo se publican latencias por lote de preguntas.

## Comparativa con modelos similares

No disponible. La model card menciona los productos Jev y System One de TypeSafe AI únicamente a efectos descriptivos y comparativos, pero no se aportan parámetros, contexto ni métricas de esos sistemas, y la búsqueda web realizada no ha devuelto información técnica relevante sobre alternativas comparables a assay-27b.

## Limitaciones y advertencias

- Solo texto y solo inglés: los datos de entrenamiento son en inglés, por lo que el rendimiento en otros idiomas no está garantizado.
- Sin aritmética, conteo, comparación de fechas ni razonamiento multi-salto en una sola pasada; el autor recomienda delegar esas operaciones en código.
- La precisión cae cuando el estado contiene información no relacionada con la pregunta.
- La cabeza de evidencia se entrena con negativos burdos de pasajes intercambiados, por lo que su discriminación es limitada.
- La calibración es agregada sobre las distribuciones evaluadas, no una garantía por respuesta individual ni sobre datos propios; hay que verificar la calibración con etiquetas propias antes de actuar sobre umbrales.
- Licencia del modelo Apache 2.0, pero parte de los 55 datasets de entrenamiento tienen términos no comerciales o solo de investigación; el autor remite a `docs/datasets.md` y advierte de revisarlos antes de un uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa inexistentes.
- El repositorio no incluye el modelo base, que debe descargarse por separado desde Qwen/Qwen3.8-27B.
- Riesgo de error confiado (respuestas con p >= 0,9 que son incorrectas): 0,036 en tareas vistas sin escalado y 0,005 en tareas no vistas con escalado, según los datos del autor; no es cero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Berk/assay-27b
- Repositorio de código, servidor y receta de entrenamiento: https://github.com/bgokden/assay
- Lista de datasets de entrenamiento y sus licencias: https://github.com/bgokden/assay/blob/master/docs/datasets.md
- Rúbricas del generador sintético de tareas: `assay/data/tasks.py` en el repositorio anterior
- Suite de evaluación kev-suites: https://huggingface.co/datasets/jaredpalmer/kev-suites
- Enlaces adicionales relevantes encontrados en la búsqueda web: no disponible.
