# AMFORGE/ananke-v0

## Resumen

Ananke v0 es un prototipo de investigación desarrollado por AMEFORGE que propone una arquitectura propietaria de memoria que "aprende leyendo", sin entrenamiento basado en gradientes ni uso de GPU. El modelo no parte de un transformer preentrenado ni de pesos neuronales: arranca vacío y construye su memoria a partir de la lectura única de documentos de texto, reforzando lo que relee y desvaneciendo lentamente lo que no se usa. Se distribuye como demostración alojada en un Space de Hugging Face, con el motor y la memoria en régimen propietario y sin pesos descargables.

El sistema se orienta a pregunta-respuesta factual sobre una colección documental, respondiendo mediante recuperación y cita literal de los pasajes leídos. Su memoria de demostración se construyó leyendo 18 artículos de Wikipedia en inglés sobre países de África Occidental (unas 165.000 palabras y 7.000 hechos) en un par de minutos sobre una CPU estándar. La propuesta resulta relevante como experimento de aprendizaje continuo sin GPU y de memorias citables y autoactualizables, no como alternativa a un LLM generativo.

La evaluación publicada por el autor, con preguntas redactadas antes de cada prueba, muestra una recuperación del pasaje correcto en top-5 del 64 % y 74 % según el conjunto, pero una extracción de la respuesta corta exacta de solo el 46 % y el 30 %. El propio autor señala la extracción de respuestas como el principal punto débil y advierte de que no es un chatbot ni un LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Propietaria de memoria y recuperación, sin transformer ni pesos neuronales; aprendizaje por lectura única (sin épocas ni gradientes) |
| Parámetros totales | No disponible (no hay pesos neuronales; el motor y la memoria son propietarios) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se distribuyen pesos) |
| Idiomas soportados | Inglés (las preguntas en inglés funcionan mejor) |
| Licencia | Propietaria AMEFORGE (`ameforge-proprietary`, etiqueta `license: other`) |
| Formato de pesos | No disponible (no se publican pesos; acceso público solo vía el Space de demostración) |

## Arquitectura y entrenamiento

Ananke no emplea un transformer, un modelo de mezcla de expertos ni una arquitectura híbrida con estados. Según la model card, es una arquitectura propietaria de memoria orientada a "aprender leyendo": el texto se procesa una sola vez, sin épocas de entrenamiento, sin descenso de gradiente y sin GPU. No hay modelo de lenguaje preentrenado de partida; el sistema comienza vacío y va construyendo su memoria a medida que lee documentos.

El mecanismo descrito incluye aprendizaje continuo: se puede añadir texto nuevo en cualquier momento, lo leído previamente se conserva, se refuerza cuando se vuelve a leer y se desvanece gradualmente cuando deja de usarse. La respuesta se produce por recuperación del pasaje y cita literal, con rechazo explícito ("no lo sé") cuando no ha leído nada relevante. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del corpus más allá del conjunto de demostración (18 artículos de Wikipedia en inglés sobre países de África Occidental, ~165.000 palabras, 7.000 hechos) ni si hubo RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Respuesta a preguntas factuales sobre documentos previamente leídos, mediante recuperación del pasaje y cita textual.
- Aprendizaje continuo por lectura: admite añadir texto nuevo en cualquier momento sin reentrenamiento.
- Refuerzo y olvido selectivo: lo releído se refuerza y lo no usado se desvanece lentamente.
- Declaración de ignorancia: rechaza responder cuando no ha leído nada relevante sobre el tema.
- Funcionamiento exclusivo en CPU, sin GPU ni entrenamiento con gradientes.
- Trazabilidad mediante citas: cada respuesta se acompaña del pasaje fuente.
- No soporta tool calling ni function calling (no se menciona en la información disponible).
- No soporta razonamiento multi-paso ni combinación de hechos: el autor lo indica explícitamente.
- No genera texto libre ni actúa como chatbot.
- Capacidades multilingües limitadas: funciona mejor con preguntas en inglés; los pronombres solo se resuelven dentro del artículo sobre el sujeto.
- No dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Memoria citable sobre documentación técnica: se ingiere un conjunto de manuales o notas y el sistema responde preguntas factuales devolviendo el fragmento exacto que respalda la respuesta, lo que permite verificar la fuente en lugar de confiar en una generación libre.
- Base de conocimiento enciclopédica autoactualizable: al poder añadir texto nuevo sin reentrenar, encaja en colecciones que crecen con el tiempo (por ejemplo, fichas de países, organismos o entidades) y refuerzan lo que se consulta con frecuencia.
- Asistente de consulta interna en CPU: al no requerir GPU, puede desplegarse en servidores modestos o entornos sin aceleradores para responder sobre un corpus acotado de políticas o procedimientos.
- Prototipado de investigación en aprendizaje continuo: sirve como banco de pruebas para estudiar recuperación, refuerzo y olvido de memoria sin depender de infraestructura de entrenamiento.
- Verificación de afirmaciones contra un corpus: dado un texto, se pueden formular preguntas factuales y comprobar si el sistema recupera y cita el pasaje correspondiente, útil en revisión documental.
- Demostración educativa de recuperación aumentada con rechazo: ilustra el patrón de "responder citando o decir que no se sabe", útil para enseñar límites de los sistemas de recuperación frente a la generación libre.
- No es adecuado para atención al cliente conversacional, generación de código, matemáticas ni razonamiento multi-paso, según las limitaciones declaradas por el autor.

## Benchmarks y rendimiento

Resultados publicados por el autor, con preguntas redactadas antes de cada evaluación y nunca usadas para ajustar el sistema:

| Conjunto de preguntas | Pasaje correcto recuperado (top 5) | Respuesta corta exacta |
|---|---|---|
| Capitales, monedas, idiomas oficiales, independencia, ciudades más grandes (28 preguntas) | 18 / 28 (64 %) | 13 / 28 (46 %) |
| Primeros presidentes, potencias coloniales, países vecinos (27 preguntas, tipos de relación nuevos) | 20 / 27 (74 %) | 8 / 27 (30 %) |

El autor indica que la recuperación del pasaje funciona bien, incluso para tipos de relación no vistos durante el ajuste, mientras que la extracción de la respuesta corta exacta es el principal punto débil, especialmente en respuestas que son listas o adjetivos. La fiabilidad del rechazo ante temas no leídos se está re-midiendo en la versión actual. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el autor indica que la memoria de demostración se construyó en un par de minutos sobre una CPU estándar.
- No requiere GPU, VRAM dedicada ni aceleradores; no se especifican requisitos mínimos de RAM ni de núcleos.
- No aplica el cálculo de VRAM por cuantización, ya que no se distribuyen pesos ni existen variantes GGUF, safetensors u otras.
- No cabe plantear despliegue con vLLM, llama.cpp, Ollama o TGI: el motor es propietario y solo se ofrece acceso público mediante el Space de demostración.
- No se han publicado datos de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ananke v0 (AMEFORGE) | Memoria y recuperación propietaria, sin pesos neuronales | No disponible | No disponible | Propietaria (`ameforge-proprietary`) | Solo demo en Space; sin pesos |
| Sistemas RAG sobre LLM open source (p. ej., combinación de un modelo de embeddings y un LLM generativo) | Recuperación aumentada con generación | Depende del LLM elegido | Depende del LLM elegido | Depende de los componentes | Pesos y código habitualmente públicos |
| Motores de búsqueda semántica sobre corpus documental (p. ej., índices vectoriales con modelos de embeddings) | Recuperación pura, sin generación | Depende del modelo de embeddings | No aplica | Depende del componente | Habitualmente públicos |

La comparación directa con modelos de la misma categoría no está disponible: Ananke no es un LLM ni un modelo de embeddings convencional, y el autor no ofrece pesos ni código para replicar la evaluación. Las alternativas RAG y de búsqueda semántica se incluyen solo como referencia funcional, no como equivalentes técnicos.

## Limitaciones y advertencias

- No es un chatbot ni un LLM: no razona, no combina hechos ni escribe texto libre.
- "Cree lo que lee": texto incorrecto en la fuente produce respuestas incorrectas.
- Solo vincula dos palabras distintas para la misma idea si su lectura las ha conectado previamente.
- La respuesta corta puede ser errónea aunque el pasaje citado sea correcto; el autor recomienda leer siempre las citas.
- Funciona mejor con preguntas en inglés; los pronombres solo se resuelven dentro del artículo sobre el sujeto.
- La fiabilidad del rechazo ante temas no leídos no estaba garantizada en versiones anteriores y se está re-midiendo en la actual.
- Licencia propietaria (`ameforge-proprietary`): el motor y la memoria no se distribuyen y no se especifican derechos de uso comercial.
- Uso previsto limitado a investigación y demostración; no apto para decisiones médicas, legales, financieras o de seguridad crítica.
- Sin pesos descargables ni código: imposible auditar, replicar o desplegar en producción propia a partir de los artefactos publicados.
- No se han publicado datos sobre sesgos, robustez frente a entradas adversarias ni comportamiento en dominios distintos del corpus de demostración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMFORGE/ananke-v0
- Demo en vivo (Space): https://huggingface.co/spaces/ameforge/ananke
- Perfil del autor en Hugging Face: https://huggingface.co/AMFORGE
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
