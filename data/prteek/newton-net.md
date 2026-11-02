# prteek/newton-net

## Resumen

Newton net es un proyecto experimental de modelo neuro-simbólico desarrollado por el usuario prteek, orientado a resolver preguntas cortas de física newtoniana (cinemática y dinámica) combinando un pequeño modelo de lenguaje con un planificador simbólico diferenciable. El objetivo es responder cuestiones del tipo "circulando a 70 mph bajo la lluvia, ¿qué distancia necesito para detenerme?" con matemáticas exactas y una traza de cada paso del razonamiento, rechazando de forma explícita cualquier pregunta que no pueda resolver e indicando el motivo.

La propuesta técnica consiste en integrar las ecuaciones del movimiento y la segunda ley de Newton (F = m·a) dentro del propio grafo de computación del modelo, de modo que la física se ejecuta en el forward pass en lugar de delegarse en un sistema externo de tool calling. El repositorio se encuentra en estado de trabajo en curso y, según la model card, todavía no contiene pesos entrenados: solo incluye el código de las etapas de extracción, ensamblado y planificación, mientras que el codificador LLM (lector y enrutador) está pendiente de desarrollo.

Por su naturaleza, no es un modelo de propósito general ni compite con los LLM convencionales: es una prueba de concepto de programación diferenciable aplicada a dominios con reglas formales estrictas, con licencia CC-BY-4.0 y únicamente idioma inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida neuro-simbólica: pequeño modelo de lenguaje (encoder) + planificador newtoniano diferenciable sobre tensores de PyTorch |
| Parámetros totales | no disponible (el codificador TinyLLM no está implementado ni entrenado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (sin pesos entrenados en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura se organiza en cuatro etapas según la model card. La etapa 1 es un extractor que convierte cada número con su unidad en una dimensión física y un valor en unidades del SI, usando las librerías quantulum3 y pint, y sustituye los valores del texto por marcadores. La etapa 2, aún no implementada, corresponde a un codificador TinyLLM que actúa como lector y enrutador aprendido: debe identificar el objetivo de la pregunta, el orden de velocidades, el signo, los valores implícitos y el valor absoluto de la aceleración según la superficie de la carretera. La etapa 3 es un ensamblador que combina los valores extraídos con las decisiones del lector para producir un valor por magnitud y registrar cada lectura para el entrenamiento. La etapa 4 es el planificador: calcula la cadena más corta de ecuaciones con guardas desde los valores conocidos hasta el objetivo, con comprobaciones de conflictos y motivos de rechazo, y es diferenciable sobre tensores de torch.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del corpus ni el uso de RLHF o DPO. El conjunto de datos asociado es prteek/newton-net-questions, alojado en HuggingFace. La innovación principal es que la física se ejecuta dentro del forward pass del modelo, de forma que el lector aprende a interpretar las preguntas a partir de si la física obtiene la respuesta correcta, lo que constituye una alternativa al tool calling convencional.

## Capacidades

- Resolución de problemas de cinemática y dinámica newtoniana con matemáticas exactas y traza paso a paso de las ecuaciones aplicadas.
- Rechazo explícito de preguntas fuera de dominio, acompañado del motivo del rechazo.
- Planificación simbólica: búsqueda de la cadena más corta de ecuaciones con guardas entre magnitudes conocidas y objetivo, con detección de conflictos.
- Extracción de magnitudes y unidades a dimensiones del SI mediante quantulum3 y pint.
- Diferenciabilidad del planificador sobre tensores de PyTorch, lo que permite entrenamiento end-to-end en el futuro.
- Soporte de tool calling: no disponible; la propuesta es precisamente sustituirlo por física embebida en el grafo.
- Soporte de agentes y razonamiento multi-paso: limitado al encadenamiento de ecuaciones dentro del planificador.
- Capacidades multilingües: no disponibles; solo inglés.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Educación en física de secundaria y bachillerato: el modelo puede resolver problemas de cinemática mostrando la traza de ecuaciones, lo que permite al estudiante verificar cada paso del cálculo en lugar de recibir solo el resultado.
- Asistentes de conducción y seguridad vial: responder a preguntas sobre distancias de frenado en función de velocidad, superficie y condiciones meteorológicas, con cálculo exacto de la distancia a partir de u, v y a.
- Validación de respuestas de LLM en dominios físicos: usar el planificador como verificador simbólico de las soluciones numéricas producidas por otro modelo, comparando la traza de ecuaciones con la respuesta candidata.
- Sistemas de tutoría automática con rechazo controlado: al indicar el motivo del rechazo cuando la pregunta queda fuera de dominio, el modelo puede derivar al usuario a un recurso adecuado sin inventar respuestas.
- Investigación en programación diferenciable: el planificador diferenciable sirve como banco de pruebas para estudiar cómo un lector aprendido puede alinearse con reglas físicas formales mediante gradientes.
- Integración en pipelines de ingeniería con requisitos de trazabilidad: en cálculos de frenado o movimiento uniformemente acelerado donde se exige auditar cada paso intermedio del cálculo.
- Prototipado de alternativas a tool calling: evaluar si embeber la lógica de dominio en el forward pass reduce errores frente a delegar en herramientas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir pesos entrenados ni tamaño de codificador definido.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable sin pesos; el planificador simbólico es ligero y podría ejecutarse en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el código se distribuye como módulos de Python (`model.extract`, `model.planner`) y una demo en HuggingFace Spaces con reglas de palabras clave en lugar del lector.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Newton net (prteek) | Neuro-simbólico para física newtoniana | no disponible | no disponible | CC-BY-4.0 | Sin pesos entrenados |
| LLM general con tool calling | LLM + herramientas externas | variable | variable | variable | Disponible |
| Solver simbólico clásico (p. ej. SymPy) | Simbólico puro | no aplica | no aplica | BSD | Disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados: no es utilizable para inferencia real en su estado actual.
- El codificador TinyLLM (lector y enrutador) no está implementado; la demo usa reglas de palabras clave como sustituto.
- Dominio muy restringido: únicamente problemas de física newtoniana de cinemática y dinámica con magnitudes y unidades reconocibles.
- Solo admite inglés, lo que limita su uso en entornos en castellano.
- Riesgo de rechazo o de lectura incorrecta si la extracción de unidades falla o si la pregunta contiene valores implícitos que el lector no identifica.
- No hay información sobre sesgos, alucinación o robustez en producción; al ser un proyecto en desarrollo, no debe desplegarse en entornos críticos.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero la ausencia de pesos y de garantías hace inviable su explotación actual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prteek/newton-net
- Dataset de preguntas: https://huggingface.co/datasets/prteek/newton-net-questions
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/prteek/newton-net
- Código y notas de diseño: https://github.com/prteek/newton-net
