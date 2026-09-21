# jacob-valdez/tensorcode-chatbot-hotpot-001

## Resumen

TensorCode evidence-conditioned chatbot es un checkpoint de investigación publicado por el usuario jacob-valdez bajo el identificador `jacob-valdez/tensorcode-chatbot-hotpot-001`. Se trata de un ajuste fino de `google/flan-t5-small` (commit `0fc9ddf78a1e988dac52e2dac162b0ede4fd74ab`) que anade un modulo propietario descrito por el autor como "workspace relacional de slots" entre un encoder de secuencia propio y un decoder de lenguaje. El objetivo declarado es la respuesta a preguntas condicionada por evidencia (evidence-conditioned QA), es decir, generar una respuesta a partir de una pregunta y de uno o varios pasajes de apoyo aportados en el propio prompt.

El modelo tiene 81.426.816 parametros reales en safetensors (frente a los aproximadamente 80 millones del flan-t5-small original, diferencia atribuible al workspace anadido) y ocupa 0,3 GB en el repositorio. Fue entrenado durante 3 epocas con semilla 7 sobre un conjunto de datos cuyos hashes y fuentes se referencian en un fichero `evaluation.json` que no acompana a la informacion disponible. El autor es explicito al acotar el alcance: lo define como una demostracion estrecha de QA condicionada por evidencia y no como evidencia de cognicion autonoma general.

La relevancia de esta ficha es mas metodologica que de producto. El checkpoint reporta un exact match en conjunto de validacion de 0,4688 y un token F1 de 0,6015, pero tambien reporta que la ablacion con el workspace puenteado obtiene exactamente el mismo exact match (0,4688). Es decir, en los datos publicados el workspace no aporta mejora medible. Ademas, el propio autor advierte de que la preparacion de datos puede haber suministrado pasajes de apoyo de tipo oracle, por lo que no se establece competencia de recuperacion (retrieval). Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de experimentacion, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de secuencia propio + workspace relacional de slots + decoder de lenguaje, inicializado desde google/flan-t5-small (familia T5, transformer encoder-decoder) |
| Parametros totales | 81.426.816 (safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base google/flan-t5-small se distribuye con 512 posiciones y atencion de posiciones relativas |
| Tipos de cuantizacion | no disponibles; el repositorio solo publica pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | no disponibles; el modelo base flan-t5-small esta entrenado y ajustado predominantemente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca de carga | tensorcode (`tensorcode.tools.chatbot.Chatbot`) |
| Tarea declarada | text2text-generation (la etiqueta de pipeline en la ficha de HuggingFace figura como text-generation; discrepancia no resuelta por el autor) |
| Modelo base | google/flan-t5-small (commit 0fc9ddf78a1e988dac52e2dac162b0ede4fd74ab) |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer encoder-decoder de la familia T5 (flan-t5-small) y le intercala un componente propietario denominado por el autor "relational slot workspace". La model card describe la pila como "encoder de secuencia propio, workspace relacional de slots y decoder de lenguaje", lo que sugiere que el encoder y el decoder heredan los pesos de flan-t5-small mientras que el workspace es un modulo nuevo con parametros propios. El entrenamiento actualiza tanto la parte foundation como el workspace, segun indica el propio autor. No se documentan en la informacion disponible el numero de capas del workspace, su dimension oculta, el mecanismo de atencion sobre los slots ni el numero de tokens de entrenamiento.

El ajuste fino consistio en 3 epocas con semilla 7, sobre un dataset cuyos hashes de datos e identificadores de fuente se referencian en `evaluation.json`, fichero no incluido en la informacion proporcionada. La tarea es de QA condicionada por evidencia con formato de prompt del tipo `Question: ...\nEvidence: ...`. El autor advierte explicitamente de dos cuestiones metodologicas: la preparacion de datos puede haber suministrado pasajes de apoyo de tipo oracle (es decir, la recuperacion no forma parte del problema resuelto) y se reportan por separado las ablaciones de puenteo del workspace y de evidencia cero, senalando que la ablacion de evidencia cero por si sola no demuestra utilidad del workspace. No se menciona el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de respuestas extractivas y abstractivas a preguntas cortas cuando se le proporcionan la pregunta y los pasajes de evidencia en el mismo prompt.
- Formato de entrada documentado: una unica cadena con las claves `Question:` y `Evidence:`, procesada por lotes mediante `generate_batch`.
- Condicionamiento explicito por evidencia: el modelo esta entrenado para apoyarse en el texto de evidencia incluido en la entrada, no en conocimiento parametrico recuperado por si mismo.
- Herencia del comportamiento de instrucciones de flan-t5-small, segun indica el autor ("foundation instruction behavior is inherited").
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, planificacion multi-paso ni razonamiento encadenado explicito.
- No hay modo "thinking", vision, audio ni multimodalidad.
- Capacidades multilingues: no disponibles; el modelo base esta centrado en ingles.
- No verifica de forma independiente las afirmaciones que genera (advertencia textual del autor).

## Casos de uso

- Extraccion de respuestas sobre pasajes controlados: dado un par pregunta-contexto donde el contexto se obtiene de una fuente fiable y se inyecta manualmente, el modelo devuelve una respuesta corta. Es el escenario para el que fue entrenado y el unico con metricas publicadas (EM 0,4688 / F1 0,6015).
- Prototipado de pipelines de QA con evidencia oracle: util para validar la etapa de generacion antes de invertir en un recuperador, ya que permite aislar errores de generacion de errores de retrieval.
- Ablaciones academicas sobre modulos de memoria o workspace: el checkpoint incluye una configuracion de puenteo del workspace que reproduce el mismo exact match, lo que lo hace util como punto de partida para estudiar si un modulo intermedio aporta o no senal medible.
- Pruebas de integracion de la biblioteca tensorcode: al ser un ejemplo minimo de 0,3 GB, sirve para verificar que el entorno de carga (`Chatbot.from_pretrained`) y el pipeline de inferencia funcionan antes de escalar a checkpoints mayores.
- Docencia y divulgacion sobre ajuste fino de T5: el tamano reducido permite entrenar y evaluar en una unica GPU consumer o incluso en CPU, con ciclos de iteracion cortos.
- Generacion de conjuntos de datos sinteticos de QA de bajo coste: con validacion humana posterior, puede producir borradores de pares pregunta-respuesta sobre pasajes dados, aprovechando su latencia baja por tamano.
- Filtrado previo en cascada: como clasificador o generador barato que descarta consultas triviales antes de invocar un modelo mayor, siempre que la tarea se limite a QA con evidencia adjunta.

## Benchmarks y rendimiento

Los unicos datos numericos publicados por el autor en la informacion disponible son los siguientes, medidos sobre un conjunto de validacion (held-out) de la tarea de QA condicionada por evidencia:

| Metrica | Configuracion | Valor |
|---|---|---|
| Exact match (held-out) | Modelo completo | 0,4688 |
| Token F1 (held-out) | Modelo completo | 0,6015 |
| Exact match (held-out) | Workspace puenteado (bypassed) | 0,4688 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval, GSM8K, BBH o similares, ni comparaciones con otros modelos sobre el mismo conjunto de evaluacion. El autor remite a `evaluation.json` para el detalle de predicciones, metricas antes/despues, procedencia de fuentes y limitaciones, pero ese fichero no forma parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 326 MB en FP32, 163 MB en FP16/BF16, 81 MB en INT8 y 41 MB en INT4, calculado a partir de los 81,4 millones de parametros. Hay que anadir el overhead del runtime y de las activaciones, tipicamente unas decenas de MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo esta muy por debajo de la capacidad de cualquiera de ellas.
- Cabe holgadamente en GPU consumer, en CPU de portatil e incluso en dispositivos de borde tipo Raspberry Pi 4/5.
- Opciones de despliegue: la unica ruta documentada es la biblioteca propietaria `tensorcode` mediante `Chatbot.from_pretrained(...)` y `generate_batch(...)`. No hay evidencia publicada de conversion a GGUF, de soporte en llama.cpp, Ollama, vLLM, TGI, Text Generation Inference ni transformers estandar, ni de existencia de pesos en formato distinto de safetensors.
- Latencia y throughput: no disponibles. Por tamano (81M de parametros y decodificacion autoregresiva sobre respuestas cortas) cabe esperar latencias de decenas de milisegundos en GPU, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables publicados para este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jacob-valdez/tensorcode-chatbot-hotpot-001 | 81,4 M | no disponible (base flan-t5-small: 512) | apache-2.0 | safetensors | Requiere biblioteca tensorcode; workspace anadido; EM 0,4688 en su propio conjunto held-out |
| google/flan-t5-small | ~80 M | 512 | apache-2.0 | safetensors, GGUF (comunidad) | Modelo base del anterior; instruction-tuned; ampliamente soportado en transformers, vLLM y llama.cpp |
| google/flan-t5-base | ~250 M | 512 | apache-2.0 | safetensors, GGUF (comunidad) | Alternativa de mayor tamano de la misma familia, con soporte estandar de despliegue |
| google/t5-small | ~60 M | 512 | apache-2.0 | safetensors, GGUF (comunidad) | Version no instruction-tuned de la misma arquitectura, util como linea base de preentrenamiento |

No hay datos publicos en la informacion disponible para comparar rendimiento (MMLU, exact match, F1 u otras metricas) entre estos modelos y el checkpoint descrito.

## Limitaciones y advertencias

- El propio autor describe el checkpoint como "una demostracion estrecha de QA condicionada por evidencia, no evidencia de cognicion autonoma general". No debe presentarse como un modelo de proposito general.
- La ablacion con el workspace puenteado obtiene el mismo exact match (0,4688) que el modelo completo, por lo que la utilidad del modulo workspace no queda demostrada con los datos publicados.
- Los datos de entrenamiento pueden haber incluido pasajes de apoyo de tipo oracle: el modelo no resuelve la recuperacion y su competencia de retrieval no esta establecida.
- El modelo no verifica de forma independiente las afirmaciones que genera; el riesgo de alucinacion es real y no hay mecanismo de grounding mas alla del texto de evidencia inyectado.
- No se documenta la composicion del dataset, el numero de tokens de entrenamiento ni la procedencia licenciable de los ejemplos. El autor indica que los ejemplos de entrenamiento deben ser licenciados y revisados por su proveedor, y que los pesos publicados no contienen conversaciones en tiempo de ejecucion.
- Idioma: no se declaran idiomas soportados; el modelo base esta centrado en ingles, por lo que el rendimiento en castellano es desconocido y previsiblemente bajo.
- Longitud de contexto: no declarada. Si hereda las 512 posiciones del modelo base, las evidencias largas requeriran truncado o troceado, con la consiguiente perdida de informacion.
- Licencia apache-2.0: permite uso comercial y modificacion, pero la licencia del checkpoint no cubre los derechos sobre los datos de entrenamiento, cuya procedencia no esta documentada.
- Dependencia de una biblioteca no estandar (`tensorcode`): no hay soporte publicado en transformers, vLLM, llama.cpp, Ollama o TGI, lo que complica el despliegue en produccion y la portabilidad.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-09-21). No hay historial de mantenimiento ni issues publicos.
- Discrepancia de etiquetado: la etiqueta de pipeline en HuggingFace figura como text-generation mientras que la model card declara text2text-generation, lo que puede provocar errores en herramientas que auto-detecten la tarea.
- No hay informacion sobre sesgos especificos, evaluaciones de seguridad ni red teaming. Dado el origen en flan-t5-small, es razonable asumir los sesgos conocidos de los corpus web en ingles, pero no hay mediciones publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacob-valdez/tensorcode-chatbot-hotpot-001
- Modelo base: https://huggingface.co/google/flan-t5-small
- Commit del modelo base referenciado: 0fc9ddf78a1e988dac52e2dac162b0ede4fd74ab
- Referencia a `evaluation.json` (predicciones, metricas antes/despues, procedencia de fuentes y limitaciones): mencionado en la model card, no incluido en la informacion disponible
- Paper de T5 (arquitectura del modelo base): https://arxiv.org/abs/1910.10683
- Paper de FLAN-T5 / Scaling instruction-finetuned language models: https://arxiv.org/abs/2210.11416
- Dataset HotpotQA (referenciado por el nombre del checkpoint, no confirmado por el autor): https://hotpotqa.github.io/

Nota sobre la busqueda web: los resultados devueltos por la busqueda (articulos sobre Jacob como personaje biblico, el fabricante de sanitarios Jacob Delafon y el grupo industrial JACOB) no guardan relacion con el modelo y no aportan informacion tecnica utilizable.
