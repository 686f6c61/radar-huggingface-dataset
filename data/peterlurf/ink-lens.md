# Peterlurf/ink-lens

## Resumen

Ink Lens es un conjunto de pesos de tipo *translator lens* (lente de traducción) desarrollado por el usuario Peterlurf para el modelo base thinkingmachines/Inkling-2-Mini, en el marco de la Looped Lens Challenge organizada por NDIF. No se trata de un modelo de lenguaje generativo, sino de un artefacto de interpretabilidad: un conjunto de transformaciones afines de bajo rango que permiten leer, en capas intermedias del modelo, qué valor está calculando internamente en un token dado.

El artefacto cubre cinco visitas de capa (35, 42, 43, 44 y 45 de las 48 del modelo base) y, para cada una, almacena una mapa afín de bajo rango parametrizado por las matrices `A`, `B`, el vector `b` y el escalar `alpha`. La fórmula publicada por el autor aplica esa transformación sobre el estado oculto normalizado y lo proyecta con el `lm_head` propio del modelo, de modo que con `B = 0`, `b = 0` y `alpha = 1` se recupera la *logit lens* clásica, que fue el punto de partida del entrenamiento.

Su relevancia es acotada pero específica: facilita el análisis de circuitos y de razonamiento multi-paso en Inkling-2-Mini sin necesidad de reentrenar lentes desde cero, y sirve como referencia metodológica para quien investigue interpretabilidad en arquitecturas con capas reutilizadas (*looped*). El repositorio es de tamaño 0.0 GB, con cero descargas y cero likes en el momento de la consulta, y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa afín de bajo rango (translator lens) sobre estados ocultos de Inkling-2-Mini; no es un transformer generativo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (fichero con tensores `v<visit>.A`, `.B`, `.b`, `.alpha`; extensión no declarada) |

## Arquitectura y entrenamiento

Cada visita de capa contiene un mapa afín de bajo rango que se aplica al bloque activo en una única posición de token. La operación publicada es `logits = lm_head(alpha * norm(h) + B A rms(h) + b)`, donde `norm` y `lm_head` son la normalización final y el *unembedding* del propio Inkling-2-Mini. El término `B A rms(h)` introduce una corrección de bajo rango sobre la *logit lens* estándar, y `alpha` escala la contribución del estado normalizado. Con `B = 0`, `b = 0` y `alpha = 1` la lente degenera en la *logit lens* convencional, lo que confirma que el entrenamiento partió de esa configuración.

Las lentes se ajustaron sobre prompts escritos específicamente para el propósito, de forma que el *unembedding* nombre el valor que el modelo está calculando: la respuesta de una tarea de un paso o el intermedio de una tarea de dos pasos. No se declaran en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO; tampoco se detalla la dimensión del rango de las matrices `A` y `B`. El código de la entrada y una descripción más completa se publican junto con la submission al reto.

## Capacidades

- Lectura de estados intermedios: proyecta el estado oculto de las capas 35, 42, 43, 44 y 45 al espacio de vocabulario para inspeccionar predicciones latentes.
- Análisis de tareas de un paso: la lente está ajustada para que el token de mayor logit corresponda a la respuesta calculada por el modelo.
- Análisis de tareas de dos pasos: permite observar el valor intermedio que el modelo computa antes de la respuesta final.
- Compatibilidad con la *logit lens* clásica: la parametrización incluye el caso base, lo que facilita comparaciones controladas.
- No soporta generación de texto, tool calling, agentes, visión, audio ni capacidades multilingües propias: es un artefacto de análisis, no un modelo desplegable.

## Casos de uso

- Investigación en interpretabilidad de circuitos: aplicar las lentes a activaciones capturadas de Inkling-2-Mini para identificar en qué visita de capa emerge un concepto o una respuesta, usando la fórmula publicada sobre los estados ocultos.
- Estudio de razonamiento multi-paso: comparar la evolución del token intermedio en tareas de dos pasos entre las capas 35 y 45, lo que permite localizar el punto en que el modelo resuelve el primer subproblema.
- Reproducción de la Looped Lens Challenge: servir como punto de partida o referencia para participantes que quieran contrastar sus propias lentes contra una entrada publicada con licencia MIT.
- Auditoría de sesgos latentes: inspeccionar qué tokens refuerza el modelo en capas intermedias ante prompts sensibles, antes de que la predicción llegue a la salida final.
- Docencia y divulgación: ilustrar el funcionamiento de la *logit lens* y sus extensiones afines con un caso real y código asociado, sin necesidad de entrenar lentes desde cero.
- Validación de técnicas de *probing*: usar las cinco visitas como línea base para comparar clasificadores lineales, sondas no lineales u otros métodos de extracción de información del estado oculto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del tamaño de Inkling-2-Mini y del régimen de cuantización elegido para el modelo base.
- GPU recomendadas: no disponible; el artefacto en sí es de tamaño despreciable (repo de 0.0 GB), pero requiere cargar el modelo base para aplicar las lentes.
- Cabe en GPU de consumo: el artefacto de lentes sí; el modelo base, no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante código propio que aplique las transformaciones sobre activaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Capas cubiertas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ink Lens (Peterlurf) | Translator lens de bajo rango | 35, 42, 43, 44, 45 de 48 | MIT | Hugging Face, 0 descargas |
| Logit lens clásica | Proyección directa con `lm_head` | Cualquiera (sin entrenamiento) | N/A | Implementación trivial |
| Tuned lens | Mapa afín entrenado por capa | Configurable | Variable según implementación | Repositorios de investigación |
| Otras entradas de Looped Lens Challenge | Lentes para Inkling-2-Mini | Variable | Variable | Publicadas con la submission del reto |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede desplegarse como servicio de inferencia; usarlo como tal es un error de categoría.
- Cobertura parcial: solo cinco de las 48 capas del modelo base tienen lente, de modo que el análisis queda restringido a las visitas 35, 42, 43, 44 y 45.
- Dependencia estricta del modelo base: las lentes solo son válidas para thinkingmachines/Inkling-2-Mini; aplicarlas a otro checkpoint produce resultados sin significado.
- Sesgo de los prompts de ajuste: las lentes se entrenaron con prompts escritos para el propósito, por lo que su calibración fuera de ese dominio no está garantizada.
- Riesgo de interpretación errónea: un logit alto en una capa intermedia no implica causalidad en la salida final; se requiere validación con intervenciones o *ablations*.
- Documentación incompleta: no se declaran dimensiones del rango, formato exacto de los tensores, ni procedimiento de carga; el código se publica con la submission al reto, no en el repositorio.
- Licencia MIT: permite uso comercial y modificación, pero no exime de las obligaciones de atribución ni de las condiciones del modelo base.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Peterlurf/ink-lens
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Looped Lens Challenge: https://ndif.us/looped-lens-challenge/
