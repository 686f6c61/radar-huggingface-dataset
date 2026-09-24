# sercetexam9/scier-flan-t5-small-baseline

## Resumen

`sercetexam9/scier-flan-t5-small-baseline` es un ajuste fino completo (full fine-tune) de `google/flan-t5-small` orientado a la extracción conjunta de entidades y relaciones en texto científico. El modelo recibe una frase de un artículo y devuelve entidades de tres tipos (`Dataset`, `Method`, `Task`) junto con tripletas de relación, siguiendo el esquema del dataset SciER. Lo publica el usuario `sercetexam9` como baseline reproducible, con licencia Apache-2.0 y pesos en safetensors.

Se trata de un modelo encoder-decoder de arquitectura T5 con 76.961.152 parámetros (unos 77 M) y un tamaño de repositorio de 0,3 GB, por lo que es ejecutable en CPU y en cualquier GPU de consumo. Su relevancia es doble: por un lado sirve como punto de partida de bajo coste para pipelines de minería de literatura científica; por otro, actúa como referencia de comparación para trabajos que aborden NER y RE conjuntos sobre SciER, un problema en el que los sistemas grandes siguen sin resolver bien la extracción de relaciones.

El modelo se entrenó durante 5 épocas sobre las 5.575 frases del `train.jsonl` de SciER. Sus resultados publicados muestran una calidad aceptable en detección de entidades (F1 micro de 0,6957 en test) pero claramente limitada en relaciones (F1 micro de 0,3213 en test y 0,2528 en el split fuera de distribución), lo que lo posiciona como baseline y no como solución de producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (FLAN-T5) |
| Parametros totales | 76.961.152 (≈77 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens en la configuración estándar de T5/FLAN-T5 (no especificado en la model card del ajuste) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas; el modelo es compatible con cuantización estándar de PyTorch/bitsandbytes al ser un checkpoint de 77 M) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/flan-t5-small |
| Dataset de entrenamiento | edzq/SciER (`train.jsonl`, 5.575 frases) |
| Metrica declarada | F1 micro (NER y relaciones) |
| Tarea | Extracción conjunta de entidades y relaciones (joint NER + RE) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo conserva íntegramente la arquitectura de `google/flan-t5-small`: un transformer encoder-decoder con atención completa, preentrenado por Google sobre el objetivo span corruption de T5 (versión 1.1) y después ajustado con instrucciones (FLAN) sobre más de 1.000 tareas. El ajuste publicado aquí es un full fine-tune, sin LoRA ni adaptadores, sobre el mismo grafo de cómputo, por lo que el número de parámetros coincide con el del checkpoint base.

El entrenamiento se realizó sobre las 5.575 frases de entrenamiento del subconjunto LLM de SciER durante 5 épocas, con el formato de prompt `extract entities and relations: {sentence}` y decodificación autoregresiva de la salida. No se documenta en la información disponible el uso de RLHF, DPO, entrenamiento con preferencias, decodificación especulativa ni técnicas de atención eficiente; tampoco se detallan hiperparámetros como la tasa de aprendizaje, el tamaño de lote o el presupuesto de cómputo. La innovación del trabajo es, por tanto, metodológica más que arquitectónica: establecer un baseline simple y reproducible sobre un esquema estandarizado de NER + RE científico.

## Capacidades

- Generación de texto texto-a-texto: el modelo produce secuencias con las entidades y las tripletas de relación extraídas de la frase de entrada.
- Extracción de entidades nombradas (NER) en dominio científico, restringida a las categorías `Dataset`, `Method` y `Task`.
- Extracción de relaciones entre entidades, devolviendo tripletas del tipo entidad-relación-entidad.
- Procesamiento de frases individuales en inglés, con prompts en el formato empleado durante el ajuste (`extract entities and relations: ...`).
- Decodificación configurable: la model card ejemplifica `num_beams=4` y `max_new_tokens=256`, por lo que admite búsqueda por haz.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de pensamiento explícito (thinking mode).
- No se documenta capacidad de visión, audio ni multimodalidad.
- Capacidad multilingüe: no disponible; el ajuste está declarado únicamente para inglés, aunque el modelo base FLAN-T5 fue entrenado con tareas en varios idiomas.

## Casos de uso

- Construcción de grafos de conocimiento científico: procesar abstracts y frases de artículos para poblar un grafo con nodos de tipo `Dataset`, `Method` y `Task` y aristas de relación, usando el modelo como extractor por frase y un paso posterior de resolución de entidades.
- Catalogación de métodos y conjuntos de datos en repositorios internos de I+D: recorrer documentación técnica y artículos para etiquetar automáticamente qué método se aplica a qué tarea y con qué dataset, reduciendo el trabajo manual de curación.
- Vigilancia tecnológica y análisis de tendencias: extraer de forma masiva pares método-tarea de publicaciones recientes para medir qué técnicas ganan tracción en un área concreta a lo largo del tiempo.
- Preanotación asistida para revisores humanos: generar entidades y tripletas candidatas que después se corrigen en una herramienta de anotación, aprovechando el NER con F1 cercano a 0,70 en dominio y descartando las relaciones de baja confianza.
- Indexación y búsqueda semántica sobre corpus científicos: enriquecer los metadatos de cada documento con las entidades extraídas para habilitar filtros estructurados por método o dataset en un buscador académico.
- Baseline de investigación y reproducibilidad: servir como referencia cuantitativa frente a la que comparar modelos mayores (FLAN-T5-base/large, modelos de 7 B en adelante) o enfoques con LoRA en el mismo esquema SciER.
- Prototipado y docencia de bajo coste: al ocupar menos de 1 GB en memoria y funcionar en CPU, permite montar demos de NER + RE conjunto en portátiles o en contenedores sin GPU para experimentación académica.
- Enriquecimiento de pipelines RAG: usar las tripletas extraídas para construir índices de relaciones que mejoren la recuperación de evidencia en asistentes de pregunta-respuesta sobre literatura técnica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (F1 micro):

| Split | NER F1 | Relation F1 |
|---|---|---|
| dev | 0,7274 | 0,2884 |
| test | 0,6957 | 0,3213 |
| test_ood | 0,6003 | 0,2528 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre SciER (MMLU, HumanEval, GSM8K u otras suites no se reportan para este ajuste). Las predicciones de todos los splits están publicadas por el autor en el dataset `sercetexam9/scier-baseline-predictions`, lo que permite recalcular métricas, pero no se dispone de cifras de referencia de terceros en la documentación consultada.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 308 MB solo para los pesos, más activaciones y caché de atención; en la práctica menos de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 154 MB de pesos.
- VRAM estimada en int8: aproximadamente 77 MB de pesos.
- Cabe holgadamente en cualquier GPU de consumo (GTX 1050/1650, RTX 3050, RTX 4090, etc.) y también en CPU, dado su tamaño de 77 M de parámetros.
- GPU recomendadas: no requiere GPU dedicada; una GPU consumer modesta acelera el procesado por lotes. Para volúmenes altos conviene una GPU con buena capacidad de batching aunque sea de gama media.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` y `AutoTokenizer` (ruta documentada por el autor). Los servidores de inferencia con soporte de arquitecturas T5, como TGI o vLLM, pueden servir el modelo; el soporte de T5 en `llama.cpp`/Ollama no es estándar y no se confirma en la información disponible. La exportación a ONNX es viable al ser una arquitectura T5 estándar, aunque no está documentada por el autor.
- Latencia y throughput estimados: no disponible. Dependerá del número de haces (`num_beams`), de `max_new_tokens` y del hardware; la decodificación por haz a 4 haces multiplica el coste de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Rendimiento en SciER |
|---|---|---|---|---|---|
| sercetexam9/scier-flan-t5-small-baseline | 76,96 M | 512 tokens (config. T5) | NER + RE científico (Dataset, Method, Task) | Apache-2.0 | NER test 0,6957 / RE test 0,3213 |
| google/flan-t5-small (modelo base sin ajustar) | 76,96 M | 512 tokens (config. T5) | Generación texto-a-texto e instrucciones generales | Apache-2.0 | No disponible (no especializado en SciER) |
| google/flan-t5-base | ≈250 M (dato de la familia FLAN-T5, no confirmado en la información proporcionada) | 512 tokens (config. T5) | Generación texto-a-texto e instrucciones generales | Apache-2.0 | No disponible |
| Baselines del paper/repositorio SciER (edzq/SciER) | No disponible | No disponible | NER + RE científico | No disponible | No disponible en la información proporcionada |

La comparación cuantitativa con alternativas especializadas no puede completarse: la información consultada no incluye resultados de otros extractores sobre los mismos splits de SciER, ni fichas de modelos equivalentes con métricas publicadas sobre este esquema de entidades.

## Limitaciones y advertencias

- Rendimiento bajo en extracción de relaciones: F1 micro de 0,3213 en test y 0,2528 en `test_ood`. Las tripletas generadas deben tratarse como candidatas, no como hechos verificados.
- Degradación fuera de distribución: el NER cae de 0,6957 (test) a 0,6003 (test_ood), lo que indica pérdida de robustez en dominios o estilos alejados del conjunto de entrenamiento.
- Cobertura de entidades limitada a tres tipos (`Dataset`, `Method`, `Task`); no detecta otras categorías habituales en texto científico.
- Idioma: solo inglés. No hay evidencia de funcionamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto reducida (512 tokens en la configuración T5): está pensado para frases o fragmentos, no para documentos completos; procesar artículos largos exige troceado y agregación posterior.
- Riesgo de alucinación: al ser un modelo generativo, puede producir entidades o tripletas que no aparecen en la frase de entrada; además la salida es texto libre y requiere parseo y validación de formato.
- Sesgos: no se documenta ningún análisis de sesgos ni de composición demográfica del corpus; el dominio científico puede sobrerrepresentar ciertas disciplinas y estilos de escritura.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, y no se han publicado evaluaciones independientes.
- Licencia: el ajuste se distribuye bajo Apache-2.0, pero el uso comercial debe revisar también las condiciones del dataset SciER (`edzq/SciER`) y del modelo base `google/flan-t5-small`.
- Coste de inferencia variable: el uso de `num_beams=4` y `max_new_tokens=256` que sugiere la model card incrementa la latencia frente a decodificación greedy, algo a tener en cuenta en despliegues de alto volumen.
- Metadatos atípicos: las fechas de creación y actualización del repositorio (septiembre de 2026) no coinciden con un historial público de mantenimiento, por lo que conviene verificar la vigencia del modelo antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sercetexam9/scier-flan-t5-small-baseline
- Predicciones publicadas por el autor: https://huggingface.co/datasets/sercetexam9/scier-baseline-predictions
- Repositorio SciER: https://github.com/edzq/SciER
- Dataset SciER en HuggingFace: https://huggingface.co/datasets/edzq/SciER
- Modelo base google/flan-t5-small: https://huggingface.co/google/flan-t5-small
- Documentación de FLAN-T5 en transformers: https://huggingface.co/docs/transformers/model_doc/flan-t5
- Documentación de FLAN-T5 en el repositorio de transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/flan-t5.md
- Ficha de flan-t5-small en Replicate: https://replicate.com/replicate/flan-t5-small/readme
- Resumen de flan-t5-small en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/flan-t5-small-google
