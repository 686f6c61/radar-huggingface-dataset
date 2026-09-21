# jacob-valdez/tensorcode-planner-hotpot-001

## Resumen

TensorCode Planner support relevance prototype (identificador `jacob-valdez/tensorcode-planner-hotpot-001`) es un checkpoint experimental de 13.590.657 parámetros (unos 13,6 M) publicado por el usuario jacob-valdez bajo la librería `tensorcode`. No es un modelo de lenguaje generativo ni un agente cognitivo general: es un componente de ranking de evidencia que puntúa documentos candidatos de HotpotQA para estimar cuáles son pasajes de soporte para una pregunta dada. Su función dentro del ecosistema TensorCode es actuar como "planner" o priorizador de candidatos antes de un "investigator" que consume esas puntuaciones.

Técnicamente se describe como un encoder propio combinado con un workspace diferenciable compartido y una cabeza de puntuación de candidatos (candidate scoring head). El autor entrenó el modelo sobre `hotpotqa/hotpot_qa`, usando las anotaciones humanas de supporting facts como supervisión; el vocabulario y los gradientes se construyeron solo con preguntas de entrenamiento, mientras que los activos del tokenizer se heredan de modelos fundacionales fijados en el manifiesto. El entrenamiento se documenta en `training-manifest.json`, con hashes, hiperparámetros, IDs de validación y limitaciones.

Su relevancia es acotada pero clara: es un caso de estudio reproducible de un componente de ranking con ablación publicada (workspace frente a zero-workspace) y un baseline léxico comparativo. Los números son modestos y el propio autor advierte de que las puntuaciones son proxies de relevancia no calibrados, no utilidad de plan medida. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación sin adopción comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder propio + workspace diferenciable compartido + cabeza de puntuación de candidatos (según model card) |
| Parámetros totales | 13.590.657 (~13,6 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors |
| Idiomas soportados | No disponible; el corpus de entrenamiento (HotpotQA) está en inglés |
| Licencia | No disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors |
| Librería de carga | tensorcode (`from tensorcode.tools.planner import Planner`; `Planner.from_pretrained(...)`) |
| Dataset de entrenamiento | hotpotqa/hotpot_qa |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-21T15:07:56.000Z |
| Última actualización | 2026-09-21T15:08:08.000Z |
| Tarea | Ranking de relevancia de documentos candidatos (support relevance), no generación |

## Arquitectura y entrenamiento

La model card define el sistema en tres piezas: un encoder propio, un workspace diferenciable compartido y una cabeza de puntuación de candidatos. La entrada contiene, según el modo, `question`/`hypotheses` para el Investigator o `goal`/`plans` para el Planner, y cada candidato se compone de `id` y `text`. El modelo produce puntuaciones de relevancia por candidato; el autor subraya que la atención funciona como enrutamiento aprendido y no como prueba de soporte factual. Cuando se usan pesos fundacionales heredados, estos quedan fijados en el manifiesto, junto con los activos del tokenizer heredados, mientras que el vocabulario nuevo y los gradientes se construyen exclusivamente con preguntas de entrenamiento.

El entrenamiento se realizó sobre HotpotQA con anotaciones humanas de supporting facts. Los IDs oficiales de validación se fijaron antes del ajuste y la época final se guardó sin selección basada en validación, un detalle relevante para interpretar las métricas. Se registran ocho valores de `training_loss` (de 0,15152 a 0,14249) y ocho entradas de `development_metrics`, lo que es consistente con ocho épocas evaluadas. La innovación metodológica destacable es la ablación `zero_workspace`, que mide el efecto de anular el workspace diferenciable, y la comparación con un baseline léxico definido explícitamente ("count unique casefold alphanumeric question token overlap with full candidate passage; ties candidate order").

## Capacidades

- Puntuación de relevancia de soporte: asigna una puntuación a cada documento candidato para estimar si respalda la pregunta formulada.
- Ranking de candidatos en formato `id`/`text`, pensado para seleccionar los pasajes más prometedores de un conjunto suministrado.
- Modo Planner: recibe `goal` y `plans` y puntúa candidatos de plan, según el esquema descrito en la model card.
- Modo Investigator: recibe `question` y `hypotheses`, con el mismo esquema de candidatos.
- Integración en pipelines multi-hop: selección de evidencia distribuida en varios documentos, el escenario nativo de HotpotQA.
- Inferencia reproducible: el checkpoint recargado (`reloaded`) reproduce exactamente las métricas posteriores al entrenamiento, lo que indica determinismo en la evaluación publicada.
- No dispone de generación de texto, tool calling, function calling, capacidades de agente autónomo, visión, audio ni modo de razonamiento extenso según la información disponible.

## Casos de uso

- Reranking en pipelines RAG multi-hop: el modelo recibe un conjunto de pasajes recuperados y los reordena por probabilidad de contener la evidencia de soporte, reduciendo el número de documentos que se envían al generador final. Encaja porque su supervisión es exactamente la anotación de supporting facts de HotpotQA.
- Filtrado de contexto antes de un LLM: al puntuar candidatos individualmente, permite truncar la lista a los dos primeros (métrica `support_recall_at_2`) y recortar coste de tokens en el prompt del modelo generativo.
- Componente de planificación en un sistema agéntico experimental: como Planner dentro de la arquitectura TensorCode, puntúa planes candidatos para un `goal` dado y deja que el Investigator consuma el ranking. Es su rol declarado, aunque las puntuaciones son proxies no calibrados.
- Evaluación de baselines de recuperación: el repositorio publica un baseline léxico con las mismas métricas (`support_hit_at_1` 0,53125 y `support_recall_at_2` 0,4296875), de modo que sirve como referencia interna para comparar métodos neuronales frente a solapamiento de tokens.
- Investigación sobre arquitecturas con workspace diferenciable: la ablación `zero_workspace` permite estudiar si un espacio de trabajo compartido aporta ventaja medible; el resultado publicado indica que no de forma consistente.
- Priorización de evidencia para anotación humana: usar el ranking como preordenación de pasajes candidatos en tareas de anotación de supporting facts, reduciendo el tiempo de revisión manual sobre corpus tipo HotpotQA.
- Construcción de conjuntos de datos de entrenamiento: generar etiquetas débiles de relevancia sobre corpus no anotados para preentrenar rerankers posteriores, siempre que se asuma la falta de calibración.

## Benchmarks y rendimiento

Métricas publicadas por el autor sobre un subconjunto de validación retenido. Los valores de `support_hit_at_1` y `support_recall_at_2` son múltiplos exactos de 1/256 (por ejemplo, 0,5546875 = 142/256), lo que sugiere un subconjunto de evaluación de 256 ejemplos, aunque el autor no lo explicita.

| Variante | Loss | support_hit@1 | support_recall@2 |
|---|---|---|---|
| Antes (before) | 0,19878 | 0,28125 | 0,25000 |
| Después (after) | 0,14763 | 0,5546875 | 0,46484375 |
| Zero-workspace (ablación) | 0,14799 | 0,5234375 | 0,4765625 |
| Recargado (reloaded) | 0,14763 | 0,5546875 | 0,46484375 |
| Baseline léxico del autor | no disponible | 0,53125 | 0,4296875 |

Métricas de desarrollo por época (ocho entradas publicadas):

| Época | Loss | support_hit@1 | support_recall@2 |
|---|---|---|---|
| 1 | 0,14848 | 0,5390625 | 0,44140625 |
| 2 | 0,14597 | 0,5859375 | 0,45703125 |
| 3 | 0,14712 | 0,5625 | 0,41796875 |
| 4 | 0,14488 | 0,6171875 | 0,43359375 |
| 5 | 0,14909 | 0,609375 | 0,43359375 |
| 6 | 0,14557 | 0,59375 | 0,44140625 |
| 7 | 0,14577 | 0,5546875 | 0,41796875 |
| 8 | 0,14373 | 0,5859375 | 0,43359375 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje, ya que el modelo no es generativo. La model card advierte explícitamente de que la ablación `zero_workspace` no demuestra un beneficio consistente del workspace en este subconjunto (en `support_recall_at_2` la ablación obtiene 0,4765625 frente a 0,46484375 del modelo completo).

## Requisitos de hardware

- Pesos en FP32: aproximadamente 54,4 MB (13.590.657 × 4 bytes). Estimación derivada del recuento de parámetros, no publicada por el autor.
- Pesos en FP16/BF16: aproximadamente 27,2 MB. Pesos en INT8: aproximadamente 13,6 MB. Son estimaciones aritméticas, no configuraciones publicadas.
- El repositorio completo ocupa 0,1 GB, por lo que el almacenamiento no es un factor limitante.
- Cabe en cualquier GPU de consumo e incluso en CPU: un modelo de 13,6 M de parámetros se ejecuta sin problemas en portátiles, instancias sin GPU y entornos de CI.
- GPU sobredimensionadas para esta carga: A100, H100, RTX 4090, RTX 3060. No hay requisito de VRAM específico publicado.
- Opciones de despliegue: la vía documentada es la librería `tensorcode`, con `Planner.from_pretrained(path_or_repo)`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, GGUF ni ONNX.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo de puntuación por lote.
- Al ser código de librería propia, la integración en producción requiere revisar y fijar la versión de `tensorcode` y validar el manifiesto de pesos heredados.

## Comparativa con modelos similares

La categoría comparable es la de cross-encoders y rerankers de pasajes. Los datos de rendimiento no son comparables entre sí porque no comparten protocolo de evaluación; en todos los casos se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Formato | Hit@1 en HotpotQA |
|---|---|---|---|---|---|
| tensorcode-planner-hotpot-001 | 13,6 M | No disponible | No disponible | safetensors (librería tensorcode) | 0,5546875 (subconjunto propio, 256 ejemplos probables) |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22,7 M | 512 | Apache-2.0 | safetensors / PyTorch | No disponible (no evaluado con el mismo protocolo) |
| BAAI/bge-reranker-base | ~278 M | 512 | MIT | safetensors / PyTorch | No disponible (no evaluado con el mismo protocolo) |

Frente a estos modelos, la diferencia relevante no es el rendimiento sino el propósito: el checkpoint de TensorCode está especializado en ranking de supporting facts de HotpotQA y expone puntuaciones declaradas como no calibradas, mientras que los rerankers citados son modelos de propósito general con licencias permisivas y soporte amplio en frameworks de inferencia (de los que este modelo carece).

## Limitaciones y advertencias

- Prototipo experimental: la propia etiqueta del repositorio es `experimental` y el autor afirma que "this release establishes a narrow support-ranking model, not general reasoning or planning".
- Tamaño de evaluación reducido: los valores son múltiplos de 1/256, lo que apunta a un subconjunto de validación de unos 256 ejemplos. Con esa muestra, las diferencias entre variantes no van acompañadas de intervalos de confianza ni de pruebas de significación.
- Ventaja marginal sobre el baseline léxico: 0,5546875 frente a 0,53125 en `support_hit_at_1` (unos 2,3 puntos). El baseline es un simple solapamiento de tokens, lo que relativiza la aportación del encoder.
- Ablación no concluyente: el autor reconoce que "the zero-workspace ablation does not demonstrate a consistent workspace benefit across metrics", y en `support_recall_at_2` la ablación supera al modelo completo.
- Puntuaciones no calibradas: no deben usarse como probabilidades, ni con umbrales fijos, ni como señal de veracidad factual. La attention es enrutamiento aprendido, no prueba de soporte.
- Riesgo de sobreajuste al dominio: entrenado sobre HotpotQA, con vocabulario construido a partir de preguntas de entrenamiento. El comportamiento fuera de ese dominio (u otros idiomas, ya que el corpus es en inglés) no está documentado.
- Selección del checkpoint: la época final se guarda sin selección basada en validación, por lo que no hay garantía de que sea la mejor configuración de las ocho épocas registradas.
- Licencia no disponible: no se especifica licencia, lo que impide asumir derechos de uso comercial, redistribución o modificación. Es un bloqueo legal real para producción.
- Idiomas no declarados: no hay lista de idiomas soportados y el único corpus documentado está en inglés.
- Dependencia de código propio: requiere la librería `tensorcode` y su módulo `tools.planner`; no hay pesos GGUF ni integración estándar con vLLM, TGI, Ollama o llama.cpp.
- Sin adopción verificable: 0 descargas y 0 likes, con la última actualización dos minutos después de la creación del repositorio. No hay señales de mantenimiento ni de validación independiente.
- Posibles sesgos heredados del corpus: HotpotQA proviene de Wikipedia en inglés, con la distribución temática y de estilo de esa fuente; el ranking puede favorecer ese tipo de texto.
- Sin información sobre consumo de recursos en producción: no hay datos publicados de latencia, throughput ni memoria en inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacob-valdez/tensorcode-planner-hotpot-001
- Dataset de entrenamiento: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a entidades no relacionadas (el personaje bíblico Jacob, la marca de sanitarios Jacob Delafon y el fabricante de tuberías JACOB Dosatec), por lo que no se incluyen.
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
