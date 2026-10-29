# genbio-ai/genbio-pathfm

## Resumen

GenBio-PathFM es un modelo fundacional (*foundation model*) de histopatología desarrollado por GenBio AI. No es un modelo generativo de texto: es un codificador visual (*encoder*) de 1.133.686.800 parámetros (≈1,13 B) que transforma imágenes de tejido teñido con H&E en representaciones vectoriales densas de 4608 dimensiones, utilizables como base para tareas de clasificación, recuperación y predicción molecular aguas abajo. Su entrada es fija de 224 × 224 píxeles y produce una salida de tipo *CLS* más 196 tokens de parche.

El modelo aborda un problema concreto del campo: el escalado ciego de datos en patología es ineficiente porque la distribución de morfologías en las imágenes de portaobjetos completos (WSI) es de cola larga y las morfologías frecuentes dominan la señal de aprendizaje. GenBio-PathFM responde con dos innovaciones: un *pipeline* automático de curación de datos que prioriza la diversidad morfológica y una estrategia de aprendizaje en dos etapas denominada JEDI (**JE**PA + **DI**NO). Según el autor, logra resultados de estado del arte en los *benchmarks* THUNDER, HEST y PathoROB (11 tareas) utilizando solo entre un 10 % y un 20 % de los datos de entrenamiento de los modelos líderes.

Su relevancia actual es doble: es, en el momento de la publicación, el modelo fundacional de histopatología de pesos abiertos más potente según sus autores, y el único modelo de estado del arte entrenado exclusivamente con datos públicos, lo que facilita la reproducibilidad y el uso académico. Se distribuye con licencia propia (GenBio AI Community License) y requiere `trust_remote_code` para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de imagen tipo vision transformer, entrenado con la estrategia dual JEDI (JEPA + DINO); el número de capas, cabezas y dimensión interna no está disponible |
| Parametros totales | 1.133.686.800 (≈1,13 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: entrada de imagen fija de 224 × 224 px, equivalente a 196 tokens de parche (rejilla 14 × 14); no procesa texto |
| Tipos de cuantizacion | No disponible: no se documentan variantes cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | `en` en los metadatos del repositorio; el modelo no procesa lenguaje, solo imagen |
| Licencia | GenBio AI Community License (etiqueta `license: other`); condiciones comerciales no detalladas en la información disponible, consultar `LICENSE.txt` |
| Formato de pesos | `safetensors` con código personalizado (`custom_code`), requiere `trust_remote_code=True` |
| Dimension de embedding | 4608 (salida CLS y por parche) |
| Resolucion de entrada | 224 × 224 px, normalización con media (0,697; 0,575; 0,728) y desviación (0,188; 0,240; 0,187) |
| Tamano del repositorio | 9,1 GB |
| Descargas / likes | 787 / 33 |
| Fechas | Creado el 2026-03-15, actualizado el 2026-04-07 |

## Arquitectura y entrenamiento

GenBio-PathFM es un codificador visual que mapea una imagen de tejido a un vector global de 4608 dimensiones (`model(x)`) y, opcionalmente, a un mapa de 196 tokens de parche de 4608 dimensiones cada uno (`model.forward_with_patches(x)`), lo que permite tanto tareas de clasificación a nivel de imagen como agregación tipo *multiple instance learning* sobre mosaicos de una WSI. Con parches de 16 × 16 px sobre una entrada de 224 × 224 px se obtiene exactamente la rejilla 14 × 14 documentada.

El entrenamiento se articula en torno a JEDI, una estrategia dual que combina objetivos de tipo JEPA (predicción en el espacio latente) y DINO (autodestilación autosupervisada). A esto se suma un *pipeline* automático de curación de datos que selecciona muestras priorizando la diversidad morfológica en lugar del volumen bruto, lo que explica la reducción de datos de entrenamiento hasta un 10–20 % respecto a los modelos líderes. La información disponible no especifica el número exacto de tokens o imágenes de entrenamiento, la composición detallada del dataset ni la existencia de fases de ajuste fino con RLHF o DPO (poco probables en un codificador autosupervisado). El modelo forma parte del ecosistema de GenBio AI junto a AIDO.Tissue FM, orientado a transcriptómica espacial.

## Capacidades

- Extracción de características de imágenes de histopatología: vector CLS global de 4608 dimensiones listo para sondas lineales o *fine-tuning* ligero.
- Representaciones densas por parche (196 × 4608), lo que habilita tareas a nivel de región y agregación MIL sobre portaobjetos completos.
- Evaluación en tareas clínicas y morfológicas de los *benchmarks* THUNDER, HEST y PathoROB (11 tareas reportadas por el autor).
- Predicción de características moleculares a partir de morfología (conjunto de tareas HEST).
- Robustez frente a variaciones de tinción y dominio (conjunto de tareas PathoROB).
- Procesamiento por lotes en GPU mediante `torch.no_grad()` e integración directa con `transformers` (`AutoModel`).
- Sin soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- Sin capacidades de audio, vídeo ni multimodalidad texto-imagen.
- Capacidad multilingüe: no aplica (no hay interfaz de lenguaje).

## Casos de uso

- **Clasificación de subtipos tumorales con sondas lineales**: extraer el vector CLS de cada parche o imagen y entrenar una regresión logística o un MLP poco profundo encima; es el flujo habitual en modelos fundacionales y el que se evalúa en THUNDER.
- **Predicción de biomarcadores moleculares a partir de H&E**: usar las características del modelo como entrada para estimar expresión génica o estado mutacional en cohortes con imagen disponible pero sin secuenciación, el escenario evaluado en HEST.
- **Agregación MIL sobre portaobjetos completos**: trocear la WSI en mosaicos de 224 × 224, obtener un vector por mosaico y agregarlos con atención múltiple para predecir diagnóstico a nivel de paciente.
- **Recuperación de imágenes por similitud en archivos de patología**: indexar los embeddings de 4608 dimensiones en una base vectorial para localizar casos morfológicamente similares en un archivo hospitalario, útil para control de calidad y docencia.
- **Control de robustez y deriva de dominio**: monitorizar desplazamientos en el espacio de embeddings entre laboratorios o lotes de tinción, aprovechando que el modelo se ha evaluado específicamente en robustez (PathoROB).
- **Preentrenamiento de modelos multimodales imagen-texto en patología**: congelar el codificador como torre visual y alinear sus 4608 dimensiones con informes anatomopatológicos, reduciendo el coste frente a entrenar desde cero.
- **Investigación traslacional con cohorts públicas**: al estar entrenado solo con datos públicos, encaja en entornos académicos con requisitos de reproducibilidad y presupuesto computacional limitado.

## Benchmarks y rendimiento

La información disponible indica que el autor reporta resultados de estado del arte en los *benchmarks* THUNDER, HEST y PathoROB (11 tareas en total) y que supera a otros modelos fundacionales de histopatología de pesos abiertos. Sin embargo, **no se han publicado resultados numéricos de benchmarks en la información disponible**: no se proporcionan valores de métricas por tarea ni la identidad y puntuaciones de los modelos comparados. No se incluyen tablas con cifras para evitar datos no verificados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ≈4,5 GB en fp32, ≈2,3 GB en bf16/fp16 e ≈1,1 GB en int8 para los pesos; a ello hay que sumar activaciones, que crecen con el tamaño de lote y son reducidas a 224 × 224 px.
- **GPU de centro de datos**: A100 (40/80 GB), H100 o L40S para procesar lotes grandes de mosaicos con alta ocupación.
- **GPU de consumo**: cabe con holgura en RTX 4090 y RTX 3090 (24 GB), y también en RTX 4080/4070 Ti (12–16 GB) en bf16 con lotes moderados; en GPUs de 8 GB es viable con lotes pequeños o fp16.
- **CPU**: inferencia posible pero con latencia mucho mayor; solo recomendable para pruebas puntuales.
- **Opciones de despliegue**: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` sobre PyTorch, con preprocesado `torchvision` (resize 224, normalización indicada); existen ejemplos de inferencia en el repositorio de GitHub. No se documentan soportes para vLLM, TGI, llama.cpp u Ollama, que además no aplican a un codificador visual.
- **Latencia y throughput**: no disponibles; no se publican mediciones. Como referencia de orden de magnitud, el coste dominante será el número de mosaicos por WSI (cientos o miles), no la longitud de secuencia.

## Comparativa con modelos similares

La información proporcionada no identifica por nombre ni especifica los modelos líderes frente a los que se compara en el artículo, por lo que no es posible construir una comparativa numérica fiable.

| Modelo | Tipo / modalidad | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GenBio-PathFM | Codificador de imagen, histopatología H&E | 1,13 B | 224 × 224 px, 196 tokens de parche | GenBio AI Community License | Pesos abiertos en HuggingFace |
| AIDO.Tissue FM | Fundacional de transcriptómica espacial (mismo autor) | No disponible | No disponible | No disponible | Pesos abiertos (según el blog del autor) |
| Modelos líderes de patología citados en el artículo | Fundacionales de histopatología | No disponible | No disponible | No disponible | No disponibles en la información consultada |

Diferenciadores verificables frente a la clase de modelos comparables: entrenamiento exclusivo con datos públicos, uso de un 10–20 % de los datos de los líderes y un presupuesto de 1,13 B de parámetros. Cualquier comparación adicional de parámetros, contexto o rendimiento queda como **no disponible**.

## Limitaciones y advertencias

- **No es un modelo generativo ni conversacional**: no admite instrucciones en lenguaje natural, *prompting* cero ejemplos con texto, *tool calling* ni razonamiento multi-paso.
- **Resolución de entrada fija de 224 × 224 px**: los detalles subcelulares de una WSI se pierden al trocear; el rendimiento aguas abajo depende críticamente de la estrategia de muestreo y del clasificador que se entrene encima.
- **Riesgo de sesgo de datos**: aunque el entrenamiento usa solo datos públicos (lo que mejora la reproducibilidad), las cohortes públicas están sesgadas hacia determinados tejidos y protocolos de tinción; el comportamiento en laboratorios con coloraciones o escáneres distintos no está garantizado.
- **Alucinación**: el concepto no aplica a un codificador, pero sí existe riesgo de falsos negativos o clasificaciones erróneas si se usa de forma directa en decisiones clínicas.
- **Licencia**: GenBio AI Community License con etiqueta `other`; las condiciones exactas de uso comercial, redistribución y obligaciones de atribución no se detallan en la información disponible y deben revisarse en `LICENSE.txt` antes de cualquier despliegue en producción.
- **Código remoto**: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor en el entorno de inferencia; conviene auditar el repositorio en un entorno aislado.
- **Idioma**: los metadatos declaran únicamente `en`; no hay soporte multilingüe porque no hay procesamiento de lenguaje.
- **Uso clínico**: no se documenta certificación como producto sanitario; cualquier aplicación diagnóstica requiere validación externa y cumplimiento regulatorio.
- **Datos no públicos del entrenamiento**: no se detalla el número de imágenes, la composición del corpus ni los hiperparámetros, lo que limita la reproducibilidad exacta del *pipeline*.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genbio-ai/genbio-pathfm
- Repositorio GitHub (implementación y ejemplos de inferencia): https://github.com/genbio-ai/genbio-pathfm
- Código del paquete: https://github.com/genbio-ai/genbio-pathfm/tree/main/genbio_pathfm
- Blog del autor: https://genbio.ai/genbio-pathfm/
- Artículo en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.03.17.712534v1
- PDF del artículo: https://genbio.ai/papers/genbio-pathfm.pdf
- Página de GenBio AI: https://genbio.ai/
- Recursos gráficos del modelo: https://genbio-ai.github.io/genbio-pathfm/resources/banner.jpg
