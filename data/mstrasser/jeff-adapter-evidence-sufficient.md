# mstrasser/jeff-adapter-evidence-sufficient

## Resumen

jeff-adapter-evidence-sufficient es un adaptador LoRA para el modelo de decisión jeff-base (una especialización de Qwen3.5-0.8B), desarrollado por el usuario mstrasser dentro del ecosistema Jeff. Su función es concreta y acotada: dado un contexto con una pregunta y un conjunto de pasajes recuperados por un sistema de búsqueda (RAG), clasifica la evidencia en tres estados posibles: suficiente, insuficiente o contradictoria. No genera texto libre; devuelve una distribución de probabilidad calibrada sobre las tres opciones en un único forward pass, lo que elimina la necesidad de parsear la salida generada.

El modelo resuelve un problema específico de los pipelines de recuperación aumentada: decidir si merece la pena responder, seguir buscando o señalar que las fuentes entran en conflicto. Es relevante porque este tipo de comprobación de suficiencia suele implementarse con prompts sobre modelos generativos grandes, lo que añade latencia y variabilidad. Este adaptador lo reduce a una clasificación determinista y calibrada sobre una base de 0,8B parámetros, con umbrales de confianza medidos y publicados.

Se distribuye como adaptador PEFT (LoRA) sobre jeff-base v1.4, con licencia Apache 2.0, y está entrenado exclusivamente en inglés. El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni interacciones en Hugging Face en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre jeff-base v1.4, fine-tune de Qwen3.5-0.8B |
| Parametros totales | no disponible (el adaptador se suma a los 0,8B del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre jeff-base v1.4, descrito por el autor como un fine-tune de Qwen3.5-0.8B orientado a decisión. La innovación principal no está en la arquitectura del transformer subyacente, sino en el paradigma de salida: en lugar de generar texto y parsearlo, el modelo evalúa las opciones nombradas y devuelve una probabilidad calibrada por opción en un solo forward pass. El adaptador en sí es un LoRA entrenado con PEFT, cargado únicamente sobre la revisión v1.4 del modelo base, ya que el motor rechaza adaptadores entrenados sobre otras bases.

El entrenamiento se realizó el 25 de octubre de 2026. La model card no detalla el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta que parte de los datos de evaluación provienen de un generador interno (el mismo que produjo los datos de entrenamiento) y que existe una partición específica con dominios nunca vistos en entrenamiento para medir generalización. La calibración se midió sobre un conjunto de 2.000 filas.

## Capacidades

- Clasificación de suficiencia de evidencia en tres etiquetas: `sufficient`, `insufficient` y `conflicting`.
- Evaluación de preguntas que requieren combinar información de dos o más pasajes (por ejemplo, un pasaje que nombra al proveedor y otro que da la cifra).
- Distinción entre sujetos con nombres similares y entre periodos temporales distintos.
- Detección de contradicciones entre pasajes cuando dos fuentes dan valores diferentes para el mismo dato y ninguna permite resolver el conflicto.
- Reconocimiento de pasajes que declaran explícitamente que un dato aún no se conoce, tratándolos como evidencia insuficiente.
- Salida calibrada con umbral de confianza publicado (0,499) y métricas de precisión y cobertura asociadas.
- No genera texto: la salida es una distribución de probabilidad sobre opciones, sin necesidad de parseo.
- Soporte de ejecución local (`Jeff.local`) y remota vía API (`Jeff.remote`).
- No soporta tool calling, agentes autónomos, visión, audio ni otras modalidades; su alcance es estrictamente la clasificación descrita.

## Casos de uso

- Control de calidad en pipelines RAG: antes de invocar al modelo generador, el sistema consulta este adaptador para decidir si la evidencia recuperada basta. Si la respuesta es `insufficient`, el orquestador lanza una segunda búsqueda o reformula la consulta, evitando respuestas alucinadas sobre contexto incompleto.
- Detección de fuentes contradictorias en atención al cliente: cuando varias políticas o artículos internos discrepan sobre un mismo dato (por ejemplo, plazos de garantía), el adaptador marca `conflicting` y el sistema escala a un humano o muestra ambas versiones al usuario.
- Enrutado en asistentes documentales: en un chatbot sobre documentación técnica, la clasificación de suficiencia decide entre responder directamente, pedir aclaración al usuario o indicar que la información no está disponible en la base.
- Verificación previa en pipelines de cumplimiento normativo: antes de citar una norma o cláusula, el sistema comprueba que los fragmentos recuperados cubren todos los detalles solicitados para el sujeto y periodo correctos.
- Filtrado en motores de búsqueda empresarial: los resultados de búsqueda se agrupan y se evalúa si el conjunto recuperado responde a la consulta original, descartando conjuntos que solo cubren parcialmente la pregunta.
- Evaluación automatizada de sistemas de recuperación: el adaptador actúa como juez de suficiencia en conjuntos de test, permitiendo medir la calidad del retrieval sin intervención humana y con una métrica calibrada.
- Moderación de respuestas en bases de conocimiento con datos sensibles a la fecha: la distinción explícita entre periodos temporales evita responder con información de un ejercicio anterior cuando la pregunta se refiere al vigente.

## Benchmarks y rendimiento

| Test | Filas | Precision (accuracy) |
|---|---:|---:|
| HotpotQA (benchmark público con etiquetas humanas) | 2.000 | 93,0% |
| Test interno (generador) | 2.000 | 98,4% |
| Test interno en dominios nunca vistos en entrenamiento (generador) | 2.000 | 98,5% |

| Función | Umbral | Precisión | Cobertura | Filas de calibración |
|---|---:|---:|---:|---:|
| `sufficient` | 0,499 | 99,4% | 100,0% | 2.000 |

El autor advierte que los tests de tipo «generator» miden menos que un test público o con documentos reales, ya que comparten generador con los datos de entrenamiento. El dato más representativo de generalización es el 93,0% en HotpotQA.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,1 GB y se suma a jeff-base, un modelo de 0,8B parámetros; la VRAM necesaria para inferencia es moderada y en la información disponible no se especifica una cifra exacta.
- Al tratarse de una base de 0,8B, es previsible que quepa en GPUs de consumo, aunque no se publican modelos concretos recomendados ni requisitos mínimos oficiales.
- Opciones de despliegue documentadas: SDK de Python `jeff` con ejecución local (`Jeff.local`, que descarga el adaptador y la base desde Hugging Face la primera vez) o remota contra `https://api.jeffhub.ai` con clave de API.
- No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el motor propio de Jeff es el único soporte indicado.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Función | Licencia |
|---|---|---|---|---|---|
| jeff-adapter-evidence-sufficient | Adaptador LoRA sobre base 0,8B | 0,8B (base) | no disponible | Clasificación de suficiencia de evidencia | Apache 2.0 |
| Modelos generativos grandes con prompt de verificación | LLM generativo | 7B–70B típicamente | 8K–128K | Verificación vía prompt y parseo de texto | Variable |
| Clasificadores BERT de NLI | Encoder | 110M–340M | 512 tokens | Entailment/contradicción entre pares de textos | Apache 2.0 / MIT |

No se dispone de datos públicos de benchmarks comparativos directos con alternativas en la información proporcionada. La ventaja declarada frente a la verificación por prompt es la ausencia de texto generado que parsear y la calibración medida; frente a clasificadores NLI clásicos, la capacidad de razonar sobre múltiples pasajes y sujetos/periodos. No hay datos de rendimiento de esas alternativas en esta ficha.

## Limitaciones y advertencias

- Solo admite inglés; no se ha validado en otros idiomas.
- No genera respuestas: únicamente evalúa la evidencia, por lo que debe combinarse con un generador en el pipeline.
- Está acoplado a la revisión v1.4 de jeff-base; el motor rechaza el adaptador si la base no coincide, lo que limita la portabilidad.
- Los tests internos comparten generador con los datos de entrenamiento, por lo que sus cifras (98,4% y 98,5%) sobreestiman el rendimiento real; el dato de HotpotQA (93,0%) es más representativo.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a dominios distintos de los probados.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea cuando los pasajes son ambiguos o el sujeto y el periodo no están claramente delimitados.
- No se especifican la longitud de contexto ni el número máximo de pasajes admitidos; conviene validar ambos extremos antes de producción.
- El repositorio no registra descargas ni likes, y el proyecto Jeff es de autor único; no hay evidencia de adopción comunitaria ni de mantenimiento a largo plazo.
- La licencia Apache 2.0 permite uso comercial, pero el ecosistema depende del motor propio del proyecto (GitHub firelex/jeff) y de la API de jeffhub.ai, cuyo modelo de disponibilidad y coste no se detalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-evidence-sufficient
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página de catálogo: https://jeffhub.ai/catalogue/jeff.retrieval.evidence-sufficient
- Repositorio de código, servidor y SDKs: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
- API remota: https://api.jeffhub.ai
- Benchmark HotpotQA (referencia): https://hotpotqa.github.io
