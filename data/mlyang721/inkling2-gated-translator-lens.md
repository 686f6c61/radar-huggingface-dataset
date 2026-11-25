# mlyang721/inkling2-gated-translator-lens

## Resumen

Inkling2-gated-translator-lens es un conjunto de pesos de interpretabilidad (un *logit lens* o lente de tokens) diseñado específicamente para el modelo `thinkingmachines/Inkling-2-Mini`, desarrollado por el usuario mlyang721 para el NDIF Looped Lens Challenge. No es un modelo de lenguaje generativo, sino un artefacto de análisis que permite leer, a partir de estados internos intermedios del modelo, qué token o valor está a punto de producir en posiciones concretas de la secuencia.

La lente se compone de una compuerta lineal (gate) que clasifica el estado de activación en una de seis "clases" o tipos de cómputo, y de traductores afines de rango 256 que proyectan ese estado hacia el espacio del *unembedding* del propio modelo. Se leen nueve visitas concretas (las numeradas 24, 34, 36, 42, 43, 44, 45, 46 y 47 en orden de ejecución de un total de 48), lo que sugiere que Inkling-2-Mini es un transformer con capas recurrentes o "looped" (reutilización de bloques).

Su relevancia es acotada pero específica: permite a investigadores estudiar el cómputo interno de un modelo concreto (aritmética de dos pasos, preguntas factuales de dos saltos, respuesta a preguntas de una palabra) sin acceso a la API del modelo ni a su texto de prompt, ya que cada lectura es función únicamente de un estado en una visita y una posición. El repositorio pesa 0,1 GB y los pesos están en float16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente de interpretabilidad (gate lineal + traductores afines de rango 256) sobre estados de `thinkingmachines/Inkling-2-Mini`; no es un modelo generativo |
| Parametros totales | No disponible (depende del número de visitas y clases; el fichero ocupa 0,1 GB en float16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible; pesos publicados en float16 |
| Idiomas soportados | No disponible (los datos de ajuste son en inglés: NQ-open, TriviaQA, WebQuestions, LRE, TwoHopFact, SOCRATES) |
| Licencia | MIT |
| Formato de pesos | safetensors (`lens.safetensors`, float16) |

## Arquitectura y entrenamiento

La lente opera sobre el estado `h` que entra en una visita de capa en la posición de lectura. Primero normaliza el estado a RMS unitario (`x = h / rms(h)`), después aplica una compuerta lineal (`k = argmax(x @ G + g)`) que decide a qué clase de cómputo pertenece ese estado, y finalmente aplica el traductor afín correspondiente a esa clase (`z = x + (x @ U_k) @ V_k + c_k`, con rango 256 y sesgo). La lectura final se obtiene pasando `z` por la normalización final y el *unembedding* del propio modelo congelado. Para algunas clases y visitas la lectura es un ensemble: se suma la salida de un segundo traductor (sufijo `b`) o la del *logit lens* plano (clave `I…b`). Las claves del fichero son `G{v}` [2304, 6], `g{v}` [6], `U{v}_{k}` [2304, 256], `V{v}_{k}` [256, 2304] y `c{v}_{k}` [2304], lo que confirma una dimensión oculta de 2304.

El ajuste se realiza con el modelo base completamente congelado. Para cada visita y clase se recogen estados mediante *forward passes* ordinarios y se entrena, en tres etapas: (1) un mapa ridge sin etiquetas desde el estado normalizado en esa visita al estado normalizado en la visita 44 del mismo prompt y posición ("transport"); (2) un mapa residual sobre él, entrenado con entropía cruzada a través de la normalización final y el *unembedding* congelados ("expert"), con *early stopping* sobre un décimo reservado; (3) una regresión logística multinomial para la compuerta. La elección entre *logit lens*, transport, expert, mezcla intermedia o ensemble, así como qué visitas se leen, se decidió únicamente sobre preguntas sintéticas reservadas.

Las seis clases corresponden a: (0) pregunta de chat de una palabra leída en el último signo de interrogación, objetivo la palabra que el modelo va a responder; (1) suma de un paso en formato chat, objetivo el número de respuesta; (2) aritmética de dos pasos en texto plano leída en el último token, objetivo el valor del primer paso; (3) afirmación factual de dos saltos en texto plano, objetivo la entidad puente; (4) y (5) aritmética de dos pasos envuelta en chat, leída en la cabecera de contenido de la respuesta y en `<|message_model|>` respectivamente, objetivo el valor del primer paso. Los volúmenes de datos van desde unas 21.000 preguntas (clase 1) hasta unas 420.000 expresiones generadas (clase 2); las clases 0, 1 y 3 usan auto-destilación (el objetivo es la propia respuesta del modelo). No se usó ninguna pregunta del reto; los ítems de WorkspaceBench y las diez preguntas de práctica se reservaron para validación y sus prompts se eliminaron de los conjuntos de entrenamiento.

## Capacidades

- Lectura de estados internos: dado un estado de activación en una visita concreta (24, 34, 36, 42, 43, 44, 45, 46, 47) y una posición, produce una distribución sobre el vocabulario del modelo base.
- Clasificación del tipo de cómputo: la compuerta distingue entre seis clases (pregunta de una palabra, suma de un paso, aritmética de dos pasos en plano y en chat, y salto factual de dos saltos).
- Predicción de valores intermedios: en aritmética de dos pasos anticipa el valor del primer paso; en saltos factuales anticipa la entidad puente.
- Predicción de la siguiente respuesta: en preguntas de chat anticipa la primera palabra o el número de la respuesta.
- Independencia del prompt: cada lectura es función exclusiva de un estado en una visita y posición; no utiliza el texto del prompt.
- Ensembles internos: combina traductores afines con *logit lens* plano según clase y visita.
- No soporta tool calling, agentes, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Investigación de circuitos internos: aplicar la lente a estados de Inkling-2-Mini para localizar en qué visita y posición se forma el valor de un primer paso aritmético, útil para estudiar cómo se compone el razonamiento multi-paso.
- Auditoría de saltos factuales: usar la clase 3 para identificar la entidad puente que el modelo está recuperando en afirmaciones de dos saltos (p. ej., "Fact: …"), lo que permite detectar recuperaciones erróneas antes de que se materialicen en la respuesta final.
- Análisis de formato de prompt: comparar las lecturas de las clases 2, 4 y 5 sobre el mismo cómputo aritmético para medir cuánto cambia la representación interna según el envoltorio de chat.
- Validación de mecanismos de respuesta corta: con la clase 0, comprobar en qué visita el modelo "decide" la primera palabra de su respuesta a preguntas de NQ-open o TriviaQA, útil para estudiar planificación de respuestas.
- Detección temprana de errores aritméticos: leer el valor del primer paso antes de que el modelo complete la operación y contrastarlo con el resultado final para caracterizar fallos de propagación.
- Docencia y reproducción de técnicas de interpretabilidad: el código (`lenses.py`, `main.py` en la carpeta `submission/`) y los pesos permiten reproducir el pipeline de transport + expert + gate sobre un modelo congelado como ejercicio práctico.
- Evaluación comparativa de lentes: servir como referencia en el NDIF Looped Lens Challenge para contrastar metodologías de lectura de estados en modelos con capas recurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las notas de la entrada del reto para las cifras medidas sobre conjuntos de validación derivados de WorkspaceBench y sobre las preguntas de práctica, pero no incluye tablas numéricas en el repositorio.

## Requisitos de hardware

- VRAM para la lente: el fichero `lens.safetensors` ocupa 0,1 GB en float16, por lo que la lente en sí cabe en cualquier GPU consumer (incluso integradas con más de 1 GB disponibles).
- VRAM para el modelo base: no disponible; depende de `thinkingmachines/Inkling-2-Mini`, cuyos requisitos no se especifican en la información proporcionada. La dimensión oculta de 2304 y las 48 visitas sugieren un modelo de tamaño moderado, pero no se confirma.
- GPU recomendadas: no disponible para el modelo base; para la lente, cualquier GPU con al menos 1 GB libre es suficiente.
- Despliegue: la lente se usa con código Python propio (`lenses.py`, `main.py`), no con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo. Requiere acceso a los estados internos del modelo base mediante *forward passes*.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| inkling2-gated-translator-lens (este) | Lente de interpretabilidad para Inkling-2-Mini | No disponible (0,1 GB en fp16) | No disponible | MIT | Hugging Face |
| Tuned Lens (Belrose et al.) | Lente de interpretabilidad genérica | Depende del modelo base | No aplica | Varía | Repositorios de investigación |
| Logit Lens (nostalgebraist) | Lectura directa del *unembedding* | 0 (sin pesos) | No aplica | No aplica | Técnica pública |
| Modelos comparables de interpretabilidad para modelos looped | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con otras lentes específicas para modelos con capas recurrentes no está disponible en la información proporcionada. Frente al *logit lens* plano, esta lente añade compuerta por clase de cómputo y traductores afines de rango 256, lo que en principio permite lecturas más precisas en visitas intermedias, a costa de requerir datos de ajuste específicos del modelo.

## Limitaciones y advertencias

- Ámbito muy restringido: solo es válida para `thinkingmachines/Inkling-2-Mini`; no funciona con otros modelos ni con otras versiones del mismo.
- Cobertura limitada de tareas: las seis clases cubren preguntas de una palabra, sumas de un paso, aritmética de dos pasos (en plano y en chat) y saltos factuales de dos saltos; cualquier otro tipo de cómputo cae fuera del diseño.
- Solo inglés en los datos de ajuste: los conjuntos de entrenamiento (NQ-open, TriviaQA, WebQuestions, LRE, TwoHopFact, SOCRATES) son en inglés, por lo que el comportamiento en otros idiomas no está validado.
- Dependencia de la posición de lectura: cada lectura exige el estado en una visita y posición concretas; un cambio de tokenizador o de formato de prompt puede invalidar la compuerta.
- Validación local, no oficial: la model card indica explícitamente que las cifras de validación son un sustituto local del juez del reto y no el juez LLM del leaderboard.
- Riesgo de sobreajuste a los formatos de entrenamiento: las clases 4 y 5 se describen como "precaución" para un formato de prompt que la lente podría encontrar, y no se activan sobre estados de otras clases.
- Sin garantías de producción: es un artefacto de investigación; no debe usarse como componente de decisión en sistemas en producción sin validación adicional.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base subyacente puede tener su propia licencia, que debe verificarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlyang721/inkling2-gated-translator-lens
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- NDIF Looped Lens Challenge: https://ndif-looped-lens-challenge.hf.space/
