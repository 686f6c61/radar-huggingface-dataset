# rafmacalaba/gliner-datause-catchall-infer-probe

## Resumen

El modelo `rafmacalaba/gliner-datause-catchall-infer-probe` es un probe de clasificación de tokens desarrollado por rafmacalaba sobre la librería GLiNER. No se trata de un modelo de lenguaje generativo, sino de un clasificador binario que decide si una propuesta de span extraída por un modelo GLiNER (con propuestas `NAMED_DATA`, `DESCRIPTIVE_DATA` y `VAGUE_DATA`) debe mantenerse o descartarse según la frontera de decisión `Luna v2.4 keep/drop`. La arquitectura combina un extractor GLiNER de propuestas con una pequeña cabeza MLP que opera sobre características del span (inicio, fin, media y ventana de ±64 tokens), siguiendo el principio «extractor proposes, head disposes».

El modelo está entrenado sobre 29.346 spans de dominios humanitarios (FCV PADs, JDC operational, refugee PADs, ReliefWeb, JAD PADDY y PRWP), con una división por documento del 70/15/15 y sin que ningún pasaje cruce las particiones. Su relevancia radica en permitir filtrar extracciones en pipelines de NER sin reentrenar el extractor completo, con un AUROC de 0,9000 en el conjunto de holdout. Sin embargo, es un modelo especializado: no tiene capacidades de generación de texto, ni razonamiento, ni herramientas de seguimiento; su alcance se limita a la clasificación de spans propuestos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER (extractor de propuestas) + cabeza MLP sobre representaciones congeladas |
| Parámetros totales | no disponible (el repo contiene `head.pt`, sin número publicado) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el probe usa una ventana de ±64 tokens (128 tokens) alrededor del span para las características |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; la model card no declara idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | `head.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un probe ligero que se apoya en un extractor GLiNER preexistente, `rafmacalaba/gliner-datause-mentions-catch-all`. El extractor propone spans candidatos, y la cabeza MLP decide si cada span debe mantenerse o descartarse. La cabeza se entrena sobre características del span: `[start; end; mean; ±64-token window]`, con la representación del modelo GLiNER congelada. Esta separación permite ajustar el criterio de decisión sin reentrenar el extractor base.

El entrenamiento utiliza dos fuentes de datos: 2.728 spans con veredictos de Luna gold v2 sobre `rafmacalaba/datause-extracted-sample`, y 26.618 etiquetas individuales de Luna de la campaña v2, extraídas de todo el corpus mediante una muestra por origen × especificidad × decil (0,1). En total, 29.346 spans, con división 70/15/15 disjunta por documento y todos los orígenes representados en entrenamiento, validación y holdout. La función objetivo es una pérdida de entropía cruzada binaria con suavizado de etiquetas de 0,1 (eps/2) para evitar puntuaciones demasiado confiadas. Los resultados son orientados a ranking, no probabilidades calibradas. El texto de la model card también menciona que hay 7 spans en cuarentena y 1 `bad_json` excluido.

## Capacidades

- Clasificación binaria de spans (mantener/descartar) para propuestas de datos (`NAMED_DATA`, `DESCRIPTIVE_DATA`, `VAGUE_DATA`).
- Distilación de la frontera de decisión `Luna v2.4` sobre representaciones GLiNER congeladas.
- Puntuación de spans orientada a ranking, no a probabilidades calibradas.
- Evaluación de fidelidad de extracciones mediante AUROC, precisión, recall y F1.
- Trabaja sobre orígenes específicos: FCV PADs, JDC operational, refugee PADs, ReliefWeb, JAD PADDY y PRWP.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto, código ni razonamiento matemático.
- No tiene capacidades de visión ni audio.
- Capacidades multilingües no declaradas.

## Casos de uso

- Filtrado de extracciones en documentos de ayuda humanitaria: el probe se integra como segundo paso en un pipeline de NER. Primero, el extractor GLiNER propone spans; después, el probe decide si cada propuesta es un dato relevante. Es adecuado porque su AUROC alcanza 0,9242 en el origen `refugee_pads` y puede reducir falsos positivos en contextos operativos.
- Distilación de conocimiento en sistemas de extracción de datos: la cabeza MLP transfiere el criterio de Luna v2.4 a un sistema ligero sin ejecutar el modelo Luna completo. Esto permite sustituir un juicio humano o un modelo pesado por un clasificador de bajo coste en producción.
- Evaluación de calidad de datasets de extracción: al puntuar todos los spans de un corpus, los equipos pueden comparar la distribución de puntuaciones y detectar conjuntos mal anotados. El head best-F1 de 0,8467 en holdout indica que es un discriminador razonablemente fiable.
- Priorización de spans en contextos operacionales: en el origen `jdc_operational`, donde el AUROC es 0,8929, el probe puede ordenar los spans por puntuación para que los revisores humanos atiendan primero los que tienen mayor probabilidad de mantenimiento (keep).
- Investigación de robustez entre orígenes: con las tablas por origen (AUROC desde 0,8193 en ReliefWeb hasta 0,9242 en refugee_pads), el modelo sirve para estudiar cómo el umbral óptimo cambia según el dominio y para ajustar umbrales por fuente.
- Componente verificador en un sistema de agentes de extracción: aunque no soporta tool calling, puede actuar como módulo de validación dentro de un agente que procesa documentos humanitarios, decidiendo qué menciones son datos realmente relevantes antes de almacenarlas o indexarlas.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar de LLM (MMLU, HumanEval, GSM8K), ya que el modelo no es un modelo de lenguaje generativo. Los resultados disponibles corresponden a la model card, en formato de clasificación de spans.

Resultados en el conjunto de holdout (veredictos de distilación de Luna):

| Métrica | Valor |
|---|---|
| AUROC (holdout) | 0,9000 |
| Precisión @ umbral 0,5 (best-F1) | 0,8190 |
| Recall @ umbral 0,5 (best-F1) | 0,8763 |
| F1 @ umbral 0,5 (best-F1) | 0,8467 |
| AUROC (validación) | 0,8939 |

Desglose por origen:

| Origen | n | keep | AUROC | head best-F1 @ umbral |
|---|---|---|---|---|
| `fcv_pads_east_africa` | 1123 | 431 | 0,9213 | 0,8046 @ 0,5 |
| `general_prwp` | 1859 | 1299 | 0,8715 | 0,8796 @ 0,4 |
| `jad_paddy_docs` | 169 | 158 | 0,8556 | 0,9693 @ 0,1 |
| `jdc_operational` | 242 | 115 | 0,8929 | 0,8019 @ 0,6 |
| `refugee_pads` | 460 | 210 | 0,9242 | 0,8387 @ 0,5 |
| `reliefweb` | 804 | 447 | 0,8193 | 0,7738 @ 0,4 |

Comprobación humana (conjuntos nunca vistos en entrenamiento):

| Conjunto | n | keep | AUROC | head best-F1 @ umbral |
|---|---|---|---|---|
| `human473` | 450 | 301 | 0,7489 | 0,8064 @ 0,1 |
| `annotator190` | 190 | 110 | 0,9035 | 0,8519 @ 0,5 |
| `jdc283` | 260 | 191 | 0,6868 | 0,8470 @ 0,0 |

Nota: las etiquetas de Luna son un objetivo de distilación, no oro humano. Las métricas de fidelidad no deben interpretarse como calidad NER absoluta.

## Requisitos de hardware

- VRAM estimada para el probe en solitario: no disponible. El archivo `head.pt` es pequeño y probablemente puede ejecutarse en CPU.
- Para el pipeline completo con el extractor GLiNER subyacente, los requisitos dependen del modelo de extracción elegido; no se informan en la model card. Los modelos GLiNER2 típicamente requieren entre 2 y 6 GB de VRAM en precisión 16 bits.
- GPU recomendada: no disponible. No se especifica una GPU concreta.
- El probe puede ejecutarse en CPU o en cualquier GPU con memoria suficiente para el extractor GLiNER base.
- Opciones de despliegue: utilizando PyTorch y el pipeline `token-classification` de HuggingFace, o la librería `gliner`. No es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. Dependen del extractor base y del hardware.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rafmacalaba/gliner-datause-catchall-infer-probe` | Probe de inferencia (clasificador binario) | no disponible | no disponible | Apache-2.0 | HuggingFace |
| `rafmacalaba/gliner-datause-mentions-catch-all` | Extractor de propuestas de spans | no disponible | no disponible | Apache-2.0 (presumible) | HuggingFace |
| `rafmacalaba/gliner2_datause` | Modelo GLiNER2 de extracción NER | no disponible | no disponible | Apache-2.0 | HuggingFace, pesos en Safetensors |
| `rafmacalaba/gliner_datause_probe` | Otro probe de NER (relacionado) | no disponible | no disponible | Apache-2.0 | HuggingFace |

No se dispone de datos de comparación cuantitativa entre estos modelos. La diferencia funcional principal es que `gliner-datause-mentions-catch-all` propone spans, mientras que el modelo objeto de esta ficha decide si mantenerlos o descartarlos.

## Limitaciones y advertencias

- El modelo está entrenado en dominios humanitarios específicos; la generalización a otros dominios no está evaluada y es probablemente limitada.
- Los resultados en conjuntos de verificación humana muestran un AUROC de 0,6868 en `jdc283`, lo que indica que el criterio de Luna puede no coincidir con el juicio humano en todos los subconjuntos.
- Las etiquetas de entrenamiento son veredictos de distilación de Luna, no anotaciones humanas puras. Las métricas de fidelidad no deben interpretarse como precisión de NER frente a oro humano.
- El probe no es autónomo: requiere un extractor GLiNER subyacente para generar propuestas de spans.
- Las puntuaciones no son probabilidades calibradas; a pesar del suavizado de etiquetas, están orientadas a ranking y no deben tratarse como confianza probabilística.
- No se declaran idiomas soportados ni se documentan sesgos lingüísticos o geográficos; la cobertura se concentra en documentos de ayuda internacional.
- El tamaño del repositorio es 0.0 GB, lo que sugiere que el archiv:o `head.pt` es pequeño. No se han publicado demos ni notebooks de uso.
- La licencia Apache-2.0 permite uso comercial, pero el uso de los datos de entrenamiento debe verificarse de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/gliner-datause-catchall-infer-probe
- Repositorio de datos mencionado en la model card: `rafmacalaba/datause-probe-v3`
- Extractor base mencionado: `rafmacalaba/gliner-datause-mentions-catch-all`
- Modelo relacionado: https://huggingface.co/rafmacalaba/gliner2_datause
- Otro probe relacionado: https://huggingface.co/rafmacalaba/gliner_datause_probe/tree/main
- No se han encontrado papers, blogs ni demos externos en la búsqueda web.
