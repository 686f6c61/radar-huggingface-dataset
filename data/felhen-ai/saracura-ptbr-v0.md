# felhen-ai/saracura-ptbr-v0

## Resumen

Saracura PT-BR v0 (identificador `felhen-ai/saracura-ptbr-v0`) es un checkpoint de clasificación de texto en portugués de Brasil desarrollado por Felhen. Consiste en un ajuste fino (fine-tune) del modelo `convaiinnovations/laya-multilingual`, que a su vez es una variante de mmBERT-base con unos 322 millones de parámetros. El modelo no genera texto: emite decisiones tipadas en una sola pasada, es decir, elige una opción entre N alternativas (tipo `choice`) o responde sí/no con una probabilidad (tipo `noul`).

El problema que resuelve es el de las decisiones estructuradas a escala sobre texto en portugués nativo: clasificar temas legislativos, detectar ofensas, verificar si un fragmento responde a una pregunta, etiquetar jurisprudencia o rutear tickets, todo ello sin coste de generación autoregresiva. La relevancia actual radica en que una ventana de contexto explícita de 2.048 tokens (con un presupuesto de hasta 1.024 tokens para las opciones) y una latencia de pocos milisegundos permiten integrarlo en pipelines de producción donde un modelo generativo sería demasiado lento o caro.

La versión documentada en la model card es la v0.1, que añade entrenamiento con preguntas variadas generadas por modelos docentes de pesos abiertos y eleva la concordancia con el profesor del 61,9% al 86,8% en preguntas inéditas sobre textos reales. Se distribuye bajo licencia Apache-2.0 y formato safetensors, con un tamaño de repositorio de 1,3 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, familia mmBERT-base (Laya) |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (presupuesto de hasta 1.024 tokens para las opciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt (portugues de Brasil, pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | convaiinnovations/laya-multilingual |
| Libreria de inferencia | laya |
| Tamano del repositorio | 1,3 GB |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo es un ajuste fino sobre `convaiinnovations/laya-multilingual`, construido sobre mmBERT-base. Conserva la misma arquitectura y la misma API que Laya, sin añadir ningún componente de inferencia adicional. La tarea es de decisión tipada: en lugar de generar texto, el encoder produce directamente la etiqueta elegida (en un conjunto de opciones) o una probabilidad de "sí" para preguntas binarias. El contexto de entrenamiento es de 2.048 tokens y el presupuesto reservado a las descripciones de las opciones es de 1.024 tokens.

Los datos de entrenamiento suman 90,4 mil decisiones sobre 4 épocas, siguiendo la receta estándar de Laya (RLCD). La composición es: 32.199 decisiones del split de entrenamiento del benchmark PT-BR v1 (fuentes OLID-BR, FACTCK.BR, FaQuAD-NLI, SciELO, JurisTCU y Cámara dos Deputados, con licencias CC BY 4.0 / MIT / datos públicos); 6.000 del dataset `telepatia-ai/typed-decisions-pt-es` (config `pt`, Apache-2.0); 8.000 anuncios de autopartes de un marketplace brasileño con etiquetas de `Qwen/Qwen3.8-27B`; 5.791 documentos internos de Felhen (tipo, área, estado, excluyendo datos sensibles); 22.249 preguntas variadas sobre textos reales generadas por modelos docentes; y 16.375 textos sintéticos de ocho casos de uso con preguntas canónicas y libres. Todas las descripciones de opciones, etiquetas sintéticas y textos sintéticos provienen de modelos de pesos abiertos bajo Apache-2.0.

## Capacidades

- Clasificación de elección múltiple (`choice`): selecciona una etiqueta entre un conjunto arbitrario de N opciones definidas en tiempo de inferencia (se documentan conjuntos de hasta 24 opciones, como el tema de una proposición legislativa).
- Decisión binaria (`noul`): responde sí/no devolviendo una probabilidad calibrada de "sí" (por ejemplo, 0,99 en un comentario ofensivo).
- Inferencia en una sola pasada, sin decodificación autoregresiva ni generación de texto.
- Definición dinámica de esquemas de decisión mediante instrucciones y criterios en lenguaje natural pasados a `agent.predict`.
- Portugués brasileño nativo como idioma objetivo, con evaluación PT-BR-first.
- Ejecución local-first orientada a decisiones tipadas a escala.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Triaje de correo electrónico: el modelo puede asignar cada mensaje entrante a una categoría (consulta, incidencia, facturación, etc.) definiendo las opciones en la llamada de inferencia; la latencia de milisegundos permite procesar buzones completos en tiempo real. La model card reporta una concordancia del 89,7% con el profesor en este escenario.
- Enrutamiento de tickets de soporte: con un esquema `choice` de áreas o equipos, cada ticket se clasifica en una única pasada, lo que evita el coste de un modelo generativo en un flujo de alto volumen. Concordancia documentada del 91,8%.
- Cualificación de leads: clasificar formularios y mensajes comerciales según intención o encaje, con contexto suficiente para arrastrar el texto completo del lead. Concordancia documentada del 89,9%.
- Detección de intención en WhatsApp: al ser un encoder de decisión, permite etiquetar mensajes de conversaciones de mensajería sin generar respuestas. Concordancia documentada del 85,8%.
- Moderação de comentarios: detección de comentarios ofensivos y del objetivo de la ofensa (OLID-BR), con decisiones binarias y de elección múltiple dentro del mismo modelo. Concordancia con el profesor del 86,4% en moderação.
- Clasificación de documentos financieros: etiquetar tipo, área o estado de documentos internos, escenario en el que se documenta una concordancia del 92,4%.
- Análisis de reseñas de producto: asignación de categorías a valoraciones. Concordancia documentada del 87,5%.
- Supervisión de acciones de agente: evaluar y clasificar acciones emitidas por un agente automático. Concordancia documentada del 90,9%.
- Clasificación de temas y jurisprudencia en el ámbito público brasileño: tema de proposiciones de la Cámara, veracidad de alegaciones (FACTCK.BR) o área de jurisprudencia del TCU, con la advertencia de que estas tareas están dentro de las fuentes del benchmark de evaluación.

## Benchmarks y rendimiento

Acurácia balanceada (media del acierto por clase) en el split de test del benchmark PT-BR v1, con el orden de las opciones mezclado por ítem:

| Tarea | Opciones | Laya multilingue | laya-pt-es-typed | TF-IDF + reg. logistica | Saracura PT-BR v0 |
|---|---:|---:|---:|---:|---:|
| Tema de proposicion de la Camara | 24 | 23,6% | 33,9% | 59,7% | 59,2% |
| Veracidad de alegacion (FACTCK.BR) | 3 | 34,5% | 33,0% | 43,2% | 44,8% |
| El fragmento responde a la pregunta (FaQuAD) | si/no | 65,6% | 78,4% | 56,5% | 89,9% |
| Area de jurisprudencia del TCU | 10 | 17,2% | 28,1% | 74,5% | 68,8% |
| Objetivo de la ofensa (OLID-BR) | 3 | 44,6% | 45,5% | 59,9% | 63,5% |
| Comentario ofensivo (OLID-BR) | si/no | 56,5% | 54,4% | 60,5% | 61,9% |
| Gran area de resumen cientifico (SciELO) | 8 | 32,1% | 38,9% | 93,5% | 91,2% |
| Media | | 39,2% | 44,6% | 64,0% | 68,5% |

En una tarea fuera del entrenamiento (FAQ del Banco Central, elegir el fragmento que responde a una pregunta entre 4, con 373 preguntas): Laya multilingüe 39,1% y este checkpoint 61,1% (versiones anteriores oscilaron entre 61% y 66%). Un baseline de solapamiento de palabras alcanza el 71,0% en esa tarea.

Como referencia, la model card cita que `Qwen/Qwen3.8-27B` sin ajuste, con las mismas descripciones de clase, obtuvo 66,2% en la versión anterior del benchmark, y la primera versión de este checkpoint 67,1% en esa misma versión.

Concordancia con el modelo profesor en textos y preguntas no vistos:

| Conjunto | v0 | v0.1 |
|---|---:|---:|
| Preguntas ineditas sobre textos reales (2.342 preguntas) | 61,9% | 86,8% |
| Casos de uso sinteticos (436 textos, preguntas canonicas y libres) | n/d | 89,6% |

Desglose por caso de uso (v0.1): tickets 91,8%, documentos 92,4%, agente 90,9%, leads 89,9%, e-mail 89,7%, valoraciones 87,5%, moderacion 86,4%, WhatsApp 85,8%. Estos números miden concordancia con el profesor (`Qwen/Qwen3.5-397B-A17B` y `Qwen/Qwen3.8-27B`), no acierto contra etiqueta humana.

Velocidad medida en una RTX 5090: aproximadamente 3 ms por decisión en lote y 12 a 16 ms en llamadas individuales con textos largos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 322M parámetros, unos 1,3 GB en fp32, unos 0,65 GB en fp16/bf16 y en torno a 0,3 GB en int8. Cabe con holgura en cualquier GPU de consumo actual.
- GPU recomendadas: no se especifican requisitos mínimos. La propia model card reporta mediciones en una RTX 5090. Por tamaño, es viable en RTX 3060, RTX 4060, RTX 4090, L4, T4 o A10, así como en CPU para cargas moderadas.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM libre en fp16.
- Opciones de despliegue: librería `laya` (`pip install laya`, `laya.load(...)`) es la vía documentada. Al ser un modelo de tipo encoder con pesos safetensors, es conversionable a formatos habituales (GGUF, ONNX) para llama.cpp, Ollama, vLLM o TGI, aunque la model card no documenta explícitamente estas rutas.
- Latencia y throughput: en una RTX 5090, unos 3 ms por decisión en lote y 12-16 ms por llamada individual con textos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media benchmark PT-BR v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saracura PT-BR v0 | 322M | 2.048 tokens | 68,5% | Apache-2.0 | HuggingFace |
| Laya multilingue (base) | 322M | 2.048 tokens | 39,2% | Apache-2.0 (segun modelo base) | HuggingFace |
| laya-pt-es-typed | no disponible | no disponible | 44,6% | no disponible | HuggingFace |
| TF-IDF + regresion logistica (una por tarea) | no aplica | no aplica | 64,0% | no aplica | baseline propio |
| Qwen/Qwen3.8-27B (zero-shot, mismas descripciones de clase) | no disponible | no disponible | 66,2% en version anterior del benchmark | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de clasificación en portugués de propósito general más allá de las citadas en la model card.

## Limitaciones y advertencias

- El split de test del benchmark procede de las mismas fuentes que el entrenamiento; los números miden cuánto aprende el modelo esas tareas, no su generalización a cualquier tarea en portugués.
- En preguntas con un estilo muy distinto al del entrenamiento el modelo puede fallar; la tarea del Banco Central (elegir el fragmento que responde a una pregunta) sigue por debajo de un baseline léxico (61,1% frente a 71,0%).
- Los números de casos de uso miden concordancia con un modelo profesor sobre textos sintéticos, no rendimiento sobre correos o tickets reales.
- En taxonomías fijas con miles de ejemplos etiquetados, un clasificador entrenado específicamente puede superar a este modelo (por ejemplo, SciELO: 93,5% del TF-IDF frente a 91,2% del modelo).
- La model card se interrumpe en el apartado de limitaciones, de modo que el inventario de limitaciones puede estar incompleto.
- Idioma restringido al portugués de Brasil; no se documentan capacidades multilingües.
- No se documentan sesgos concretos ni tasas de alucinación (el modelo no genera texto, por lo que la alucinación se manifiesta como una etiqueta incorrecta).
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias de los datos de entrenamiento (CC BY 4.0, MIT, datos públicos y datos internos no redistribuidos) para determinar en qué medida condicionan el uso comercial del modelo derivado.
- Parte de los datos de entrenamiento son internos de Felhen y no se redistribuyen; los datos de marketplace brasileño tampoco se redistribuyen, lo que limita la reproducibilidad completa del pipeline de entrenamiento.
- Para esquemas propios muy alejados del entrenamiento, la model card recomienda ajustar con ejemplos; indica que la receta de Laya se ejecuta en minutos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/felhen-ai/saracura-ptbr-v0
- Repositorio GitHub de Saracura: https://github.com/felhen-ai/saracura
- Repositorio GitHub de Laya: https://github.com/NandhaKishorM/laya
- Dataset de benchmark PT-BR: https://huggingface.co/datasets/felhen-ai/ptbr-typed-decisions-bench
- Dataset `telepatia-ai/typed-decisions-pt-es`: https://huggingface.co/datasets/telepatia-ai/typed-decisions-pt-es
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Paper (arXiv:2509.06888): https://arxiv.org/abs/2509.06888
- Sitio corporativo de Felhen: https://felhen.ai/en/
