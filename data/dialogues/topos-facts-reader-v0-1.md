# Dialogues/topos-facts-reader-v0.1

## Resumen

Topos Facts v0.1 · reader es un modelo de question answering extractivo desarrollado por Dialogues, un proyecto centrado en la extraccion de conocimiento personal a partir de mensajes. Se trata de un fine-tune de deepset/deberta-v3-large-squad2, un encoder DeBERTa-v3-large adaptado a la tarea de identificar y copiar fragmentos de texto (spans) que responden a preguntas concretas sobre el autor de un mensaje. Con 434 millones de parametros, el modelo no genera texto libre: su funcion es localizar en el mensaje original el valor exacto de un campo estructurado, como el destino de un viaje, el puesto de un nuevo trabajo o la especie de una mascota.

El modelo forma parte de una arquitectura en dos etapas junto a un segundo encoder denominado gate (Dialogues/topos-facts-gate-v0.1). El gate decide que hechos estan presentes en el mensaje y el reader rellena los campos de texto libre copiando un span. Esta separacion permite construir extraccion de informacion verificable, ya que cada valor extraido procede literalmente del texto de entrada y no de una generacion del modelo.

La relevancia actual del modelo reside en su enfoque de extraccion sin generacion para datos personales: al limitarse a copiar spans y dejar campos vacios cuando la confianza no supera el umbral, reduce el riesgo de alucinacion en un dominio sensible. El modelo esta disponible bajo licencia CC-BY-4.0, soporta unicamente ingles y su contexto de entrada esta limitado a 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) con cabeza de question answering extractivo |
| Parametros totales | 434.014.210 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de deepset/deberta-v3-large-squad2, un checkpoint DeBERTa-v3-large ya ajustado para SQuAD2, e incorpora una cabeza de question answering extractivo que predice las posiciones de inicio y fin del span respuesta, junto con una puntuacion de "sin respuesta". La entrada se limita a 512 tokens y un span solo se conserva si su puntuacion de inicio y fin supera la puntuacion de "no answer" en al menos -6.0 y si no excede los 30 tokens de longitud.

El ajuste se realizo sobre preguntas construidas a partir de hechos presentes en unos pocos miles de mensajes del historial personal de un unico usuario, utilizados con su consentimiento. Cada pregunta sigue una de dos plantillas: `What <field> of the author's <predicate> does the message state?` para campos con valor libre, o `What does the message state about the author's <predicate>?` para predicados de valor unico como medicacion o alergia. La respuesta se marca como el valor del hecho cuando el mensaje lo contiene literalmente y como no respondible cuando el valor solo esta implicado. El conjunto de datos es privado y no se ha publicado. El fine-tuning empleo AdamW con learning rate 1e-5, batch size 16, secuencias de 512 tokens, 4 epocas y semilla 13. El modelo cubre 27 fact packs, cuyas preguntas se listan en `topos_facts_spec.json` del repositorio del gate.

## Capacidades

- Question answering extractivo: localiza y copia un span del mensaje de entrada que responde a una pregunta concreta.
- Extraccion de hechos estructurados sobre el autor del mensaje: destino de viaje, puesto de trabajo, especie de mascota, medicacion, alergias y otros campos definidos en los 27 fact packs.
- Abstención controlada: si ningun span supera el umbral configurado, el campo queda vacio en lugar de inventarse un valor.
- Integracion en pipeline de dos etapas junto al gate Dialogues/topos-facts-gate-v0.1, que decide que hechos estan presentes.
- Compatibilidad con la libreria transformers mediante el pipeline `question-answering` y la opcion `handle_impossible_answer=True`.
- Soporte de endpoints compatibles segun las etiquetas del repositorio.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Extraccion de hechos personales de mensajes: el modelo recibe un mensaje y una pregunta de plantilla y devuelve el span exacto del valor, lo que permite construir un grafo de conocimiento personal verificable a partir de conversaciones.
- Asistentes de memoria personal: integrado con el gate, puede rellenar fichas de contacto o de usuario (nuevo puesto, viaje planificado, mascota) sin generar texto inventado, ya que cada valor procede del mensaje original.
- Enriquecimiento de CRM o bandejas de entrada: procesar mensajes entrantes para detectar cambios de trabajo, destinos de viaje o medicacion declarada, con trazabilidad directa al texto fuente.
- Moderacion y compliance con datos sensibles: al limitarse a copiar spans y abstenerse cuando no hay evidencia clara, reduce el riesgo de registrar atributos personales no declarados explicitamente.
- Construccion de datasets etiquetados: usar el modelo para preanotar spans de hechos en corpus de mensajes y revisar manualmente solo los casos de baja confianza.
- Filtrado previo en pipelines de extraccion: combinado con el gate, descarta mensajes sin hechos relevantes y solo invoca el reader cuando hay un campo candidato, ahorrando computo.
- Evaluacion de extraccion de informacion: servir como baseline extractivo de referencia para comparar con enfoques generativos en tareas de extraccion de hechos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB para los 434 millones de parametros; en fp16 alrededor de 0,9 GB. La cuantizacion no esta documentada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM en fp32 o 1 GB en fp16; una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: pipeline `question-answering` de transformers, servidores de inferencia compatibles con transformers y endpoints compatibles indicados en el repositorio. No se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un encoder de 434 millones de parametros con contexto de 512 tokens, la inferencia es ligera en comparacion con modelos generativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dialogues/topos-facts-reader-v0.1 | 434 M | 512 tokens | QA extractivo sobre hechos personales | CC-BY-4.0 | Hugging Face |
| deepset/deberta-v3-large-squad2 | no disponible | 512 tokens | QA extractivo general (SQuAD2) | CC-BY-4.0 | Hugging Face |
| deepset/roberta-base-squad2 | no disponible | 512 tokens | QA extractivo general (SQuAD2) | no disponible | Hugging Face |

La comparativa se limita a modelos de la misma familia de QA extractivo; no se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- Contexto de entrada limitado a 512 tokens, lo que restringe el procesamiento de mensajes largos.
- Entrenado con mensajes de una unica persona: puede generalizar mal a otros estilos de escritura, vocabulario o dominios.
- No genera texto: solo copia spans literales del mensaje, por lo que no puede normalizar, resumir ni inferir valores implicados.
- Riesgo de sesgo derivado de los datos de entrenamiento de un unico usuario y de la base SQuAD2; no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion bajo por diseno, pero puede seleccionar spans incorrectos si la pregunta no se ajusta a las plantillas previstas.
- Los umbrales de decision (-6.0 respecto a "no answer", maximo de 30 tokens por span) estan fijados por el autor y pueden no ser optimos para otros dominios.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir a deepset (deberta-v3-large-squad2) y a Dialogues (este fine-tune) y a enlazar la licencia.
- El conjunto de datos de entrenamiento es privado y no se publica, lo que limita la reproducibilidad y la auditoria del modelo.
- El modelo depende del gate para decidir que hechos estan presentes; usarlo de forma aislada requiere construir las preguntas segun las plantillas documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dialogues/topos-facts-reader-v0.1
- Gate del pipeline: https://huggingface.co/Dialogues/topos-facts-gate-v0.1
- Space de demostracion: https://huggingface.co/spaces/Dialogues/topos-facts
- Modelo base: https://huggingface.co/deepset/deberta-v3-large-squad2
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Sitio del proyecto Topos: https://topos.dialogues.ai
- Perfil del autor: https://huggingface.co/Dialogues
