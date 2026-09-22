# lujihong/agentjev-0.6b-int8-onnx

## Resumen

AgentJev-0.6B INT8 ONNX es un modelo de decisión no autorregresivo desarrollado por el usuario lujihong, derivado del modelo base aimeigaoshou/agent-jev, que a su vez utiliza el backbone de Qwen3-0.6B con una cabeza de decisión permutación-equivariante. Su función no es generar texto, sino puntuar y clasificar un conjunto de candidatos predefinidos (acciones, respuestas booleanas, verificaciones) en una única pasada hacia delante, sin emitir ningún token de salida («zero-token»). Está exportado íntegramente a ONNX con cuantización INT8 y empaquetado en un único fichero de aproximadamente 1,0 GB.

El modelo resuelve un problema concreto dentro de los agentes basados en modelos de lenguaje: las decisiones de enrutado, selección de acción y verificación de finalización consumen tiempo y tokens si se delegan en un LLM generativo. AgentJev traslada esas decisiones a un clasificador calibrado que se ejecuta en CPU en unos 160 ms para decisiones binarias y unos 300 ms para tres candidatos, lo que permite insertar puntos de control rápidos en bucles agénticos de automatización de escritorio.

Es relevante ahora porque encaja en la tendencia de separar el «System 1» (decisiones rápidas y baratas) del «System 2» (razonamiento generativo caro), y porque su licencia Apache-2.0 y su formato ONNX autocontenido facilitan el despliegue en entornos sin GPU. Los idiomas soportados son chino e inglés, y el contexto utilizado en la evaluación publicada es de 2.048 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3-0.6B con cabeza de decisión permutación-equivariante, no autorregresiva, exportada a ONNX |
| Parámetros totales | Aproximadamente 0,6 mil millones (backbone Qwen3-0.6B); cifra exacta no disponible |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto empleado en la evaluación publicada); no se especifica la ventana efectiva máxima del modelo exportado |
| Tipos de cuantización | INT8 (exportación ONNX) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX autocontenido en un único fichero de ~1,0 GB, sin ficheros de fragmentos externos; tokenizer compatible con transformers |

## Arquitectura y entrenamiento

El modelo no es un generador de texto. Se construye sobre el backbone de Qwen3-0.6B, al que se añade una cabeza de decisión permutación-equivariante: el orden en que se presentan los candidatos no sesga las probabilidades de ranking. La inferencia consiste en una única pasada hacia delante que consume una secuencia con el formato `[STATE] ... [QUESTION] ... [CANDIDATE] ...` por cada opción, más un vector `cand_end_pos` que indica la posición final del candidato en cada secuencia. La salida son logits que, tras aplicar softmax, se interpretan como una distribución de probabilidad tipada sobre las opciones disponibles. El autor destaca que esto elimina la alucinación de formato, ya que la salida queda restringida al conjunto de candidatos especificado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención alternativa; la innovación declarada es la combinación de un backbone pequeño con una cabeza de decisión equivariante y su exportación optimizada para CPU. Los datos de evaluación disponibles apuntan a un ajuste de calibración (se reportan Brier score y ECE), pero el procedimiento concreto de calibración no está descrito.

## Capacidades

- Clasificación y enrutado: asigna una distribución de probabilidad sobre un conjunto cerrado de opciones (por ejemplo, categorías de intención o rutas de ejecución).
- Verificación booleana (DoneGate): decide entre dos opciones del tipo «tarea completada / no completada» en aproximadamente 160 ms en CPU.
- Selección de acción entre múltiples candidatos: el caso de tres opciones se resuelve en unos 300 ms en CPU.
- Puntuación permutación-equivariante: el ranking no depende del orden en que se enumeren los candidatos.
- Salida estrictamente tipada: al no generar texto libre, no puede producir respuestas fuera del conjunto de opciones.
- Multilingüismo limitado a chino e inglés, heredado del vocabulario de Qwen3.
- Sin capacidad de generación de texto, razonamiento en cadena, código, matemáticas, visión ni audio.
- No se documenta soporte nativo de tool calling ni function calling; su uso en agentes es como componente de decisión, no como ejecutor de llamadas.
- Inferencia en una sola pasada, sin decodificación autorregresiva y con cero tokens de salida.

## Casos de uso

- Automatización de escritorio (computer-use): el modelo recibe el estado de la interfaz (ventana activa, campo de texto, controles disponibles) y una lista de acciones posibles, y devuelve cuál ejecutar. El ejemplo publicado muestra la decisión de pulsar «enviar» frente a alternativas como cerrar la aplicación o borrar el texto.
- Verificación de finalización de tareas en bucles agénticos: actúa como puerta DoneGate que comprueba, tras cada paso de un agente generativo, si el objetivo se ha cumplido, evitando llamadas adicionales al LLM grande.
- Enrutado de intenciones en asistentes conversacionales: con contexto de hasta 2.048 tokens puede clasificar la petición del usuario en categorías predefinidas antes de derivarla al modelo o al servicio correspondiente.
- Filtrado previo de bajo coste: descarta o etiqueta candidatos antes de invocar un LLM generativo, reduciendo el gasto en tokens en pipelines donde la mayoría de las peticiones son triviales.
- Triaje de tickets y correos en chino o inglés: asignación de categoría o prioridad mediante clasificación entre opciones cerradas, con la garantía de que la etiqueta devuelta pertenece siempre al conjunto permitido.
- Guardarraíl de políticas: comprobación binaria de si una acción propuesta por otro sistema cumple una condición declarada, aprovechando la salida tipada para evitar respuestas ambiguas.
- Despliegue en equipos sin GPU: al ejecutarse sobre CPU de Intel, AMD o Apple Silicon con ~1 GB de pesos, permite incorporar decisiones de agente en aplicaciones de escritorio o entornos edge donde no hay acelerador disponible.
- Calibración de confianza para escalado: al devolver una distribución de probabilidad, un orquestador puede establecer un umbral de confianza y escalar a un modelo mayor solo cuando la decisión es dudosa.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden al conjunto de prueba Typed Decisions (2.000 decisiones), según la model card del autor:

| Modelo | Tipo | Top-1 accuracy | Brier score | ECE | Contexto |
|---|---|---|---|---|---|
| AgentJev-0.6B (este modelo) | Open source, ONNX INT8 | 79,25% | 0,0448 | 0,1687 | 2.048 |
| Laya (ModernBERT-large) | Open source | 77,00% | 0,0615 | 0,2170 | 512 |
| TypeSafe Jev 1.13.0 | API propietaria | 72,70% | 0,1480 | 0,1440 | 32K |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores proceden exclusivamente de la model card y no han sido verificadas de forma independiente. El único dato de latencia disponible es el declarado por el autor: ~160 ms para dos opciones y ~300 ms para tres opciones en CPU estándar.

## Requisitos de hardware

- VRAM estimada: no aplica para el modo de ejecución documentado (CPU). Si se ejecutase con un execution provider de GPU de ONNX Runtime, el fichero INT8 de ~1,0 GB requeriría del orden de 1-2 GB de memoria, aunque esta opción no está documentada por el autor.
- Memoria RAM: en torno a 1,0-1,5 GB para cargar el modelo y atender la inferencia, dado el tamaño del fichero único (~1,0 GB) más el tokenizer y el estado del runtime.
- GPUs recomendadas: no disponible. El modelo está optimizado explícitamente para CPU, por lo que no se publican recomendaciones de GPU (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no es necesaria ninguna GPU; cabe en cualquier equipo con CPU moderna de Intel, AMD o Apple Silicon y ~1,5 GB de RAM libre.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` desde Python; bindings de Go mediante la librería `github.com/lujihong/go-agentjev` y `go-onnxruntime`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo no generativo en formato ONNX.
- Latencia: ~160 ms por decisión binaria y ~300 ms con tres candidatos, en una única pasada y sin decodificación de tokens. No se publican cifras de throughput ni mediciones en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Top-1 (Typed Decisions) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentJev-0.6B INT8 ONNX | ~0,6 mil millones | 2.048 | 79,25% | Apache-2.0 | Pesos ONNX abiertos en HuggingFace |
| Laya (ModernBERT-large) | No disponible en la información proporcionada (ModernBERT-large) | 512 | 77,00% | No disponible en la información proporcionada | Open source según la model card |
| TypeSafe Jev 1.13.0 | No disponible | 32K | 72,70% | Propietaria | Solo API |
| aimeigaoshou/agent-jev (modelo base) | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Pesos abiertos en HuggingFace |

La comparación se limita a la tarea de decisión tipada evaluada por el autor. No se dispone de datos que permitan comparar estos modelos en generación de texto, razonamiento general o código, ya que AgentJev no es un modelo generativo.

## Limitaciones y advertencias

- No genera texto ni razona en cadena: solo puntúa candidatos proporcionados externamente. No sirve para conversación, redacción, código o matemáticas.
- Dependencia del enunciado de los candidatos: la calidad de la decisión depende de cómo se formulen el estado, la pregunta y las opciones; no hay mecanismo documentado para recuperarse de candidatos mal planteados.
- Tasa de error no trivial: un 79,25% de Top-1 implica que aproximadamente una de cada cinco decisiones es incorrecta, lo que exige supervisión o umbrales de confianza en producción.
- Calibración mejorable: el ECE reportado es 0,1687, superior al de la API propietaria comparada (0,1440), por lo que las probabilidades no deben interpretarse como confianza fiable sin recalibración.
- Cobertura lingüística limitada a chino e inglés; no hay evidencia de rendimiento en castellano ni en otras lenguas.
- Contexto de 2.048 tokens en la evaluación publicada, insuficiente para estados de interfaz o historiales largos si no se resume previamente la información.
- Riesgo de sesgo desconocido: no se publican datos sobre la composición del dataset de entrenamiento, por lo que no es posible auditar sesgos demográficos, culturales o de dominio.
- El autor afirma «cero alucinación de formato», pero se trata de una afirmación no verificada de forma independiente; la salida tipada evita texto libre, no necesariamente decisiones incorrectas.
- Estado de validación incipiente: el repositorio registra 0 descargas y 0 intereses en el momento de la consulta, con fechas de creación y actualización del 22 de septiembre de 2026, por lo que no existe validación de la comunidad.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y de atribución. No se declaran restricciones adicionales, pero el modelo base (aimeigaoshou/agent-jev) y el backbone Qwen3 deberían verificarse por separado.
- La etiqueta de pipeline es `text-classification`, lo que puede inducir a error: el modelo no acepta texto libre y devuelve etiquetas, sino secuencias construidas con un formato específico y un vector de posiciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lujihong/agentjev-0.6b-int8-onnx
- Modelo base: https://huggingface.co/aimeigaoshou/agent-jev
- Conjunto de datos de evaluación Typed Decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Librería Go de inferencia: https://github.com/lujihong/go-agentjev
- Nota sobre la búsqueda web: los resultados obtenidos no contienen información relacionada con el modelo (corresponden a páginas del proveedor de correo GMX), por lo que no se han podido aportar papers, blogs ni demos adicionales.
