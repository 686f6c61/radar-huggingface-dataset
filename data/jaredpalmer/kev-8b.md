# jaredpalmer/kev-8b

## Resumen

`kev-8b` es un adaptador LoRA de tipo *research preview* publicado por jaredpalmer sobre el modelo base `Qwen/Qwen3-8B-Base` (revisión `49e3418f`). No es un modelo generativo: es un **modelo de decisión**. Recibe un documento (el *state*) y un conjunto de preguntas tipadas, y devuelve en un único *forward pass* una distribución de probabilidad por pregunta. Su salida no es texto, sino decisiones tipadas bajo el contrato público `/v1/systemone` de TypeSafe, con tres tipos de respuesta: `choice`, `noul` y `score`.

Técnicamente se compone de un adaptador LoRA de rango 16 sobre las proyecciones de atención y MLP del base, más una *pointer head* entrenada desde cero, con entrenamiento mediante entropía cruzada sobre la distribución de opciones. El repositorio ocupa 0,4 GB y se distribuye con la librería `peft` en formato `safetensors`, bajo licencia Apache 2.0 y con soporte únicamente para inglés.

Es relevante ahora porque aborda un problema distinto al de los LLM generativos: enrutado y clasificación con **calibración explícita** (se reporta ECE y Brier score) y con resistencia al sesgo de orden de opciones (tasa de volteo por orden 0,00). El autor lo publica como preview y no como release versionado porque no alcanza por un par el umbral de aceptación fijado de antemano (pares de política retenidos: 0,69 frente al 70 % exigido).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B-Base) con adaptador LoRA r=16 sobre proyecciones de atención y MLP, más pointer head entrenada desde cero |
| Parametros totales | 8B en el modelo base; el adaptador LoRA se distribuye en un repositorio de 0,4 GB (recuento exacto de parámetros del adaptador no disponible) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor menciona ejecución en fp32 y `KEV_DTYPE=bf16` |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; librería `peft`) |
| Modelo base | Qwen/Qwen3-8B-Base (revisión `49e3418f`) |
| Pipeline declarado | text-classification |
| Tarea | Decisión tipada: `choice` / `noul` / `score` |
| Fecha de creacion / actualizacion | 2026-09-19 / 2026-09-20 |
| Descargas / likes | 66 / 3 |
| Estado | Research preview (no es un release versionado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 aplicado sobre las proyecciones de atención y MLP de `Qwen/Qwen3-8B-Base`, al que se añade una *pointer head* inicializada desde cero. La formulación es de decisión, no de generación: dado un estado (documento) y una batería de preguntas tipadas, el modelo produce una distribución de probabilidad sobre las opciones de cada pregunta en una sola pasada, y se entrena con entropía cruzada sobre esa distribución.

El entrenamiento se realizó sobre el conjunto congelado `evals/v6/decision-v6` (los *bytes* de desarrollo y test son idénticos a los de v4): 13.000 registros públicos, 1.000 por fuente (las diez fuentes de v4 más ARC-Challenge, OpenBookQA y CommonsenseQA), más dos brazos programáticos de política de 448 registros cada uno, con dos épocas. El *checkpoint* publicado corresponde a `decision-v7` (10.000 registros públicos más 896 registros de política sobre nueve familias de plantillas, incluidas cuatro familias ordinales de umbral *Score*, y 1.680 registros de 60 estructuras de reglas aleatorias con negación en cualquier posición). El ajuste fino se hizo con **lr 5e-5**, que según el autor es la mayor mejora de receta encontrada: la receta por defecto (lr 2e-4) degradaba capacidades del base. Entrenar este *checkpoint* llevó aproximadamente 70 minutos en una H100.

Entre los hallazgos técnicos que el autor documenta: la capacidad domina fuera de dominio (de 0,6B a 4B supone +14–19 pp; de 4B a 8B, +1–7 pp); más datos públicos suben la precisión en distribución y bajan la transferencia a 4B (−3 pp al pasar de 3.4k a 10k registros); y los pares contrastivos programáticos enseñan bien las estructuras vistas (0,85–1,0 de acierto conjunto) pero transfieren solo parcialmente a estructuras no vistas (0,5–0,6 a 4B y 0,03–0,11 a 0,6B).

## Capacidades

- Clasificación y decisión tipada sobre documentos: devuelve una distribución de probabilidad por pregunta, con tipos de opción `choice`, `noul` y `score` (umbrales ordinales).
- Cálculo de calibración: el modelo reporta ECE y Brier score, y sus probabilidades en distribución son utilizables como señal de confianza.
- Estabilidad frente al orden de opciones: tasa de volteo por orden de opción de 0,00 en `kev-8b`.
- Clasificación de intención y temas: entrenado con Banking77 (intenciones bancarias), AG News (noticias), DBpedia14, TREC, Yelp Review Full, Amazon Reviews Multi EN, SST5 e IMDB.
- Inferencia de relación entre textos: MultiNLI (NLI) y PAWS (paráfrasis).
- Preguntas de conocimiento y opción múltiple: ARC, OpenBookQA, CommonsenseQA y elementos de MMLU.
- Detección de contenido ofensivo: evaluado en TweetEval-offensive.
- Razonamiento sobre estructuras de política: reglas con negación, composiciones tipo `(A and B) or not C` e `if A then not B else C`, y aritmética de fechas con niveles y periodos de gracia.
- Multilingüe: no. Solo inglés (`language: en`).
- Tool calling / function calling: no disponible; es un modelo de decisión, no un generador con soporte de herramientas.
- Capacidades de agente multi-paso: no disponible.
- Capacidades especiales: sin modo *thinking*, sin visión ni audio; la salida es una distribución de probabilidad, no texto generado.

## Casos de uso

- **Enrutado de tickets de soporte:** el modelo recibe el texto del ticket como estado y una pregunta tipada con las categorías posibles (`choice`), devolviendo la probabilidad de cada una. La base de entrenamiento en Banking77 y la calibración reportada (ECE 0,061 en distribución) permiten fijar umbrales de derivación a humano cuando la confianza es baja.
- **Moderación de contenido y revisión de reseñas:** clasificación de comentarios ofensivos (TweetEval-offensive, 0,79 de precisión fuera de dominio) y de sentimiento en cinco niveles (SST5) o reseñas de producto (Yelp, Amazon, IMDB), con una única pasada por lote de preguntas en lugar de una generación por elemento.
- **Votación tipada dentro de un pipeline de agentes:** en lugar de pedir a un LLM que escriba una respuesta, el sistema formula preguntas con opciones y usa las probabilidades de `kev-8b` como voto estructurado y tipado (contrato `/v1/systemone`), lo que simplifica el parseo y el registro de auditoría.
- **Verificación de consistencia y deduplicación de hechos:** con MultiNLI y PAWS, el modelo puede evaluar si un par de afirmaciones se implica, se contradice o es neutro, útil para detectar duplicados semánticos o contradicciones en una base documental.
- **Evaluación automática de exámenes y cuestionarios de opción múltiple:** formulando cada ítem como pregunta tipada, con la ventaja de que el modelo no es sensible al orden de las opciones (tasa de volteo 0,00), lo que evita sesgos posicionales en la corrección.
- **Reglas de negocio y cumplimiento con umbrales:** las familias ordinales de tipo `score` permiten decisiones con cortes (por ejemplo, nivel de riesgo), y las estructuras de reglas con negación permiten codificar políticas internas. Advertencia: el rendimiento en estructuras no vistas es de 0,69 de acierto conjunto, por debajo del umbral de release del propio autor.
- **Extracción de intención en asistentes de voz o chat:** clasificación cerrada de intenciones con contexto de documento, adecuada cuando el espacio de salidas está predefinido y se necesita latencia de una sola pasada.
- **Filtrado previo en pipelines RAG:** decidir qué documentos o fragmentos cumplen una condición antes de invocar un modelo generativo, reduciendo coste y tokens consumidos en la fase de generación.

## Benchmarks y rendimiento

Resultados declarados por el autor (métricas `verified: false`). Los conjuntos de evaluación son los mismos en todas las filas.

| Evaluación | Métrica | kev-8b (preview) | Fuente |
|---|---|---|---|
| decision-v4/v6 development (1.204 registros, en distribución) | accuracy | 0,869 | model-index |
| decision-v4/v6 development | ECE (probabilidades brutas) | 0,061 | model-index |
| decision-v4 dev (1.200 preguntas, en distribución) | accuracy | 0,863 | model card |
| transfer-v4 development (fuera de dominio) | accuracy | 0,796 | model-index y model card |
| transfer-v4 development (764 registros, model-index; 560 preguntas en la model card) | Brier score | 0,337 | model-index y model card |
| Test bloqueado, lectura exploratoria (`ungated`) | accuracy en distribución / Brier | 0,870 / 0,193 | model card |
| Test bloqueado, lectura exploratoria | accuracy fuera de dominio / Brier | 0,780 / 0,327 | model card |
| Test bloqueado, lectura exploratoria | errores con confianza alta (p ≥ 0,9 e incorrectos) | 7,6 % | model card |
| Test bloqueado, lectura exploratoria | pares de política retenidos, ambos correctos | 0,62 | model card |

Precisión fuera de dominio por fuente (kev-8b / Jev): QNLI 0,91 / 0,93; SciQ 1,00 / 0,99; TweetEval-offensive 0,79 / 0,81; PAWS 0,78 / 0,79; MMLU 0,70 / 0,90; Emotion 0,56 / 0,59; *deadline* (aritmética de fechas a tres niveles) 0,60 / 0,93; `(A and B) or not C` 0,91 / 0,97; `if A then not B else C` 0,59 / 0,78.

No se han publicado otros resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- **VRAM en fp32:** aproximadamente 33 GB según el autor. No cabe en un Mac de 32 GB.
- **VRAM en bf16:** aproximadamente 17 GB con `KEV_DTYPE=bf16`, suficiente para un Mac con memoria unificada de 32 GB según el autor.
- **GPU recomendadas:** el autor menciona una H100 para el entrenamiento (unos 70 minutos). Para inferencia en bf16, los ~17 GB encajan en GPU de 24 GB o más. Cualquier GPU con ≥24 GB de VRAM es una estimación derivada de los 17 GB declarados, no un dato confirmado explícitamente por el autor.
- **GPU consumer:** en bf16 los ~17 GB permiten plantear tarjetas de 24 GB (por ejemplo, gama RTX 3090/4090). Esto es una estimación derivada; el autor solo confirma explícitamente el caso del Mac de 32 GB con bf16 y la necesidad de ~33 GB en fp32.
- **Opciones de despliegue:** el modelo se distribuye como adaptador PEFT (`library_name: peft`) y requiere el base `Qwen/Qwen3-8B-Base`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput:** no disponible. Se sabe que la inferencia es una sola pasada hacia delante por estado y conjunto de preguntas, sin generación autoregresiva.
- **Entrenamiento:** aproximadamente 70 minutos en una H100 para el *checkpoint* publicado.

## Comparativa con modelos similares

El autor proporciona una comparativa interna entre los distintos tamaños de la familia `kev` y el modelo de referencia `Jev`, sobre los mismos ítems congelados:

| | kev-0.5b | kev-0.6b preview | kev-4b preview | kev-8b preview | Jev |
|---|---|---|---|---|---|
| Accuracy en distribución (decision-v4 dev, 1.200 preguntas) | 0,712 | 0,805 | 0,854 | 0,863 | 0,845 |
| Accuracy fuera de dominio (transfer-v4 dev, 560 preguntas) | 0,575 | 0,598 | 0,790 | 0,796 | 0,857 |
| Brier fuera de dominio | 0,50 | 0,521 | 0,328 | 0,337 | 0,211 |
| Errores con confianza alta fuera de dominio (p ≥ 0,9 e incorrectos) | – | 5,2 % | 8,2 % | 9,9 % | 3,7 % |
| Estructuras de política retenidas, ambos hermanos correctos | – | 0,11 | 0,73 | 0,69 | 0,86 |
| Tasa de volteo por orden de opción | 0,21 | 0,02 | 0,00 | 0,00 | 0,00 |

No se dispone de comparativas con otros modelos de decisión o clasificadores externos a la familia `kev` en la información proporcionada; el propio autor usa `Jev` como referencia. Alternativas genéricas de la misma categoría (adaptadores LoRA de clasificación sobre modelos de 7B-8B) no están documentadas aquí: no disponible.

## Limitaciones y advertencias

- **Es un research preview, no un release versionado.** No alcanza el filtro de aceptación fijado de antemano: los pares de política retenidos logran 0,69 de acierto conjunto frente al 70 % exigido (la otra semilla da 0,64).
- **Razonamiento sobre políticas no vistas:** las composiciones de reglas no vistas y la aritmética de fechas con periodos de gracia están lejos del modelo de referencia (0,60 frente a 0,93 en la tarea *deadline*; 0,59 frente a 0,78 en `if A then not B else C`).
- **Calibración fuera de dominio deficiente:** el ECE con probabilidades brutas fuera de dominio es 0,128, y el autor advierte de que la temperatura ajustada en distribución no transfiere. Las probabilidades son utilizables, pero no calibradas.
- **Errores con alta confianza:** un 9,9 % de las predicciones fuera de dominio con p ≥ 0,9 son incorrectas, lo que desaconseja automatizar decisiones críticas solo con el umbral de probabilidad.
- **Preguntas sin análogo en entrenamiento:** el autor advierte de que las preguntas con forma de producto y sin precedente en los datos no están garantizadas; hay que medir sobre los propios *inputs*.
- **Solo inglés:** `language: en` y todo el material de evaluación está en inglés.
- **No es un modelo generativo:** no produce texto, no soporta *tool calling* ni razonamiento multi-paso declarado, y su salida es una distribución de probabilidad por pregunta tipada.
- **Degradación del base por ajuste fino:** el ajuste fino erosiona capacidades del modelo base; el autor mitiga esto con lr 5e-5 (el base 4B cero-disparo puntúa 0,688 en MMLU frente a 0,60–0,66 con la receta por defecto). Debe asumirse que existe cierta pérdida de conocimiento respecto al base.
- **Sesgos:** no se documentan sesgos específicos en la información disponible. Las fuentes de entrenamiento incluyen reseñas, noticias y datos de redes sociales, con los sesgos inherentes a esos corpus.
- **Licencia:** Apache 2.0, sin restricciones de uso comercial indicadas en la información proporcionada. Conviene verificar las condiciones del modelo base `Qwen/Qwen3-8B-Base` antes de un despliegue comercial.
- **Advertencia de producción:** al ser un preview con una única lectura exploratoria del test bloqueado, la partición de test no se volverá a leer para este *checkpoint*, por lo que no habrá validación adicional del mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaredpalmer/kev-8b
- Repositorio de código, suites y resultados por *trial*: https://github.com/jaredpalmer/kev (`PLAN.md`, `runs/leaderboard.md`)
- Ruta del test bloqueado citada por el autor: `runs/locked/kev-8b-v7-preview-ungated/`
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Resultados de la búsqueda web: no se encontraron enlaces relevantes. Los resultados devueltos correspondían a un listado de anuncios de embarcaciones en eBay Kleinanzeigen, sin relación con el modelo.
