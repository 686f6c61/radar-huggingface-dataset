# cisimcik/cisimcik-4b

## Resumen

cisimcik-4b es un modelo de lenguaje de tipo chat con prioridad para el turco, desarrollado por Cisimcik AI Labs (usuario `cisimcik` en HuggingFace). Está construido sobre `cisimcik-base` y ha pasado por tres rondas de ajuste fino supervisado (SFT). Su objetivo declarado es cubrir conversación multi-turno, razonamiento paso a paso cuando la pregunta lo requiere, llamada a herramientas y tareas habituales de PLN en turco: resumen, clasificación, inferencia de lenguaje natural, extracción de respuestas, corrección gramatical y traducción.

Técnicamente es un transformer híbrido de la familia Qwen3.5 que combina capas Gated DeltaNet (atención lineal con estado recurrente) con capas de atención completa, y es exclusivamente de texto. Tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), un tamaño que la propia model card sitúa como desplegable en una GPU de 12 GB o en CPU con 16 GB de RAM en bf16.

Su relevancia actual viene de dos factores: por un lado, la licencia CC0-1.0, que elimina prácticamente todas las restricciones de uso comercial y de redistribución; por otro, los resultados declarados en benchmarks turcos, con 57,31 en CETVEL (por encima de los 33 modelos de la tabla, cuyo siguiente mejor es Llama-3.3-70B con 35,85) y 59,60 en OpenLLM Turkish Leaderboard v0.2, empatado en segunda posición entre 76 modelos. Hay que subrayar que el propio autor advierte que el modelo fue entrenado con los splits de entrenamiento de las tareas de CETVEL, por lo que esa comparación no es limpia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: Gated DeltaNet + atención completa. Solo texto (`qwen3_5_text`) |
| Parametros totales | 4.205.751.296 (aprox. 4,2 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en bf16; no se anuncian versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | Turco (tr) e inglés (en). El turco es el idioma prioritario |
| Licencia | CC0-1.0 |
| Formato de pesos | Safetensors (PyTorch, librería `transformers`) |
| Modelo base | cisimcik/cisimcik-base (relación: finetune) |
| Dataset de ajuste | cisimcik/turkish-chat-max-25k |
| Tamaño del repositorio | 8,4 GB |
| Pipeline | text-generation |
| Librería mínima | `transformers>=5.17` (más `torch`; opcionalmente `flash-linear-attention`) |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3.5 en su variante de texto, una combinación híbrida de capas Gated DeltaNet y capas de atención completa. Gated DeltaNet es un mecanismo de atención lineal con estado recurrente que reduce el coste computacional y de memoria frente a la atención cuadrática clásica en secuencias largas; al intercalarse con capas de atención completa, el modelo conserva la capacidad de recuperación exacta de contexto que la atención lineal por sí sola pierde. El repositorio incluye los kernels de `flash-linear-attention` como dependencia opcional para acelerar las capas Gated DeltaNet en GPU NVIDIA; si no está instalada, `transformers` usa su implementación PyTorch, correcta pero más lenta con entradas largas.

El entrenamiento consiste en tres rondas de ajuste fino supervisado sobre `cisimcik-base`, usando el dataset `cisimcik/turkish-chat-max-25k`. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF, DPO u otra optimización por preferencias. La innovación funcional más destacable es el modo de razonamiento selectivo: con `enable_thinking=True` el modelo decide en cada turno si necesita razonar, omite el bloque de pensamiento en saludos y respuestas simples, y razona en el idioma de la pregunta. El pensamiento se delimita con la etiqueta `</think>` en la salida. La llamada a herramientas se emite mediante la plantilla de chat en el formato XML de Qwen3.5.

## Capacidades

- Generación de texto conversacional multi-turno en turco, con soporte secundario de inglés.
- Modo de razonamiento explícito y selectivo (`enable_thinking=True/False`), con decisión autónoma por turno de si pensar o no, y razonamiento en el idioma de la consulta.
- Razonamiento aritmético y de sentido común de varios pasos (el ejemplo de la model card resuelve un problema de precio con descuento).
- Llamada a funciones y herramientas (*tool calling*) mediante la plantilla de chat, en formato XML con bloques `<tool_call>`, `<function=...>` y `<parameter=...>`.
- Flujos de agente con múltiples pasos: el modelo emite la llamada, se ejecuta la herramienta, se reinyecta el resultado como mensaje de rol `tool` y se continúa la generación.
- Resumen de texto en turco.
- Clasificación de texto y análisis de sentimiento (implícito en las tareas de PLN declaradas).
- Inferencia de lenguaje natural (NLI) en turco.
- Extracción de respuestas sobre contexto (QA extractivo).
- Corrección gramatical y edición de texto en turco.
- Traducción turco-inglés.
- Identidad autodefinida: sin mensaje de sistema, se presenta como cisimcik-4b de Cisimcik AI Labs.
- Capacidades de visión y audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Atención al cliente automatizada en turco: el modelo gestiona conversaciones multi-turno, mantiene el rol a lo largo de la sesión y puede invocar herramientas para consultar el estado de un pedido o una factura, devolviendo la respuesta final al usuario tras recibir el resultado de la función.
- Agentes con function calling en producción: el formato XML de llamada a herramientas es fácilmente parseable, lo que permite encadenar el modelo con APIs internas, bases de datos o servicios REST en un bucle de agente con pasos múltiples.
- Enrutado y clasificación de tickets de soporte: entrenado explícitamente en clasificación de texto turco, puede etiquetar consultas entrantes por categoría o urgencia antes de derivarlas a un humano o a otro sistema.
- Resumen de documentación corporativa en turco: contratos, actas, correos o informes largos pueden condensarse en resúmenes, aprovechando la ventana de contexto (cuyo tamaño no está publicado) y las capas Gated DeltaNet para abaratar el coste en secuencias largas.
- Corrección y normalización de textos turcos: revisión gramatical y de estilo de contenido generado por usuarios, publicaciones o traducciones automáticas antes de su publicación.
- Traducción turco-inglés en flujos internos: traducción de documentación técnica o de mensajes de soporte entre ambos idiomas, sin depender de APIs externas.
- Extracción de respuestas sobre corpus documentales turcos: sistemas de búsqueda o de QA sobre normativa, manuales o bases de conocimiento donde se necesita localizar y extraer el fragmento relevante.
- Asistente de razonamiento en local para entornos con requisitos de privacidad: al caber en una GPU de 12 GB y tener licencia CC0-1.0, es viable desplegarlo on-premise en un servidor pequeño o estación de trabajo sin enviar datos a terceros.
- Generación de material didáctico y ejercicios resueltos en turco: el modo de pensamiento permite mostrar el desarrollo paso a paso antes de la respuesta final, útil en tutoría automatizada.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son agregados. El desglose por tarea de la tabla CETVEL aparece truncado en la model card, por lo que no se reproducen cifras parciales.

| Benchmark | cisimcik-4b | Llama-3.3-70B | aya-expanse-32b | cere-llama-3-8b-tr |
|---|---|---|---|---|
| CETVEL (media, 34 datasets turcos, 7 grupos de tareas) | 57,31 | 35,85 | no disponible | no disponible |
| OpenLLM Turkish Leaderboard v0.2 | 59,60 | no disponible | no disponible | no disponible |

Notas sobre la metodología, según la propia model card:

- CETVEL se ejecutó en modo zero-shot, sin plantilla de chat y con prompts planos, usando la versión de `lm-evaluation-harness` de la tabla y las configuraciones de decodificación propias de cada tarea. La media se calculó con el código oficial de la tabla.
- El modelo fue entrenado con los splits de entrenamiento de las tareas de CETVEL. El autor lo advierte explícitamente y sus resultados no figuran en la tabla pública, de modo que la comparación con Llama-3.3-70B, aya-expanse-32b o cere-llama-3-8b-tr no es homogénea.
- En OpenLLM Turkish Leaderboard v0.2 el modelo queda empatado en segunda posición entre 76 modelos. La model card afirma que obtiene la puntuación MMLU más alta de la tabla, pero el valor numérico no se facilita en la información disponible.
- No hay datos publicados de HumanEval, GSM8K, latencia o throughput.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 8,4 GB.
- VRAM estimada para inferencia: unos 10-11 GB en bf16 contando caché KV y activaciones para contextos moderados. La model card indica que basta cualquier GPU con 12 GB o más.
- CPU: viable con 16 GB de RAM, según la model card, aunque con throughput muy inferior al de GPU.
- GPU de consumo compatibles (por capacidad de memoria): RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB, RTX 4090 24 GB y equivalentes con 12 GB o más. GPUs de 8 GB no se contemplan para bf16 sin cuantización.
- GPU de datacenter: A100, H100 y similares no son necesarias para el tamaño del modelo, pero permiten mayor paralelismo y throughput.
- Aceleración: instalar `flash-linear-attention` activa kernels específicos para las capas Gated DeltaNet en GPU NVIDIA. Sin este paquete, `transformers` usa la implementación PyTorch, que da resultados correctos pero es más lenta con entradas largas.
- Despliegue: `transformers>=5.17` (referencia oficial, con ejemplo de código en la model card) y vLLM (el autor verificó con la versión 0.30). No se mencionan llama.cpp, Ollama ni TGI en la información disponible, y al no haber pesos GGUF publicados, el despliegue en llama.cpp u Ollama requeriría una conversión propia.
- Latencia y throughput: no disponibles. Tampoco se publica el tamaño de contexto, dato necesario para dimensionar la caché KV.

## Comparativa con modelos similares

Los únicos modelos comparables citados en la información disponible son los que aparecen en la tabla CETVEL de la model card. No hay datos de licencia, contexto ni formatos de pesos para ellos en esa fuente, y las puntuaciones no son comparables de forma limpia (ver la sección de benchmarks).

| Modelo | Parámetros | Contexto | CETVEL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cisimcik-4b | 4,2 B | no disponible | 57,31 | CC0-1.0 | HuggingFace, safetensors |
| Llama-3.3-70B | 70 B (según denominación) | no disponible | 35,85 | no disponible en la fuente | Referenciado en la tabla CETVEL |
| aya-expanse-32b | 32 B (según denominación) | no disponible | no disponible | no disponible en la fuente | Referenciado en la tabla CETVEL |
| cere-llama-3-8b-tr | 8 B (según denominación) | no disponible | no disponible | no disponible en la fuente | Referenciado en la tabla CETVEL |

La comparación más informativa es la de tamaño y rendimiento declarado frente a Llama-3.3-70B: cisimcik-4b obtendría 57,31 frente a 35,85 con aproximadamente una decimoséptima parte de los parámetros, si bien el entrenamiento del primero incluyó los splits de entrenamiento de las tareas evaluadas. Para el resto de alternativas no hay datos publicados en la información disponible.

## Limitaciones y advertencias

- Sesgo de idioma: el modelo está optimizado para turco. El inglés figura como soportado, pero no hay evaluación publicada que cuantifique su calidad en ese idioma.
- Riesgo de alucinación: no se publican métricas de fidelidad, tasa de invención ni evaluación de robustez frente a preguntas sin respuesta. En tareas de extracción y resumen sobre documentos reales conviene verificar las salidas.
- Contaminación de benchmarks: el modelo fue entrenado con los splits de entrenamiento de las tareas de CETVEL, tal como reconoce el propio autor. Las puntuaciones de esa tabla no deben interpretarse como capacidad de generalización a tareas nuevas.
- Resultados no verificados externamente: la model card indica que ninguna de las dos evaluaciones figura en las tablas públicas correspondientes, y el modelo tenía 0 descargas y 0 likes en el momento de la consulta. No existe validación independiente conocida.
- Longitud de contexto no publicada: es un dato crítico para producción y no aparece ni en los metadatos ni en la model card. No se puede planificar un caso de uso de contexto largo sin medirlo previamente.
- Sin opciones de cuantización publicadas: al no haber GGUF, AWQ ni GPTQ oficiales, el despliegue en hardware de menos de 12 GB exige cuantizar por cuenta propia y validar la degradación.
- Dependencia de versiones muy recientes: requiere `transformers>=5.17`. Entornos con versiones anteriores de la librería, o herramientas que aún no han adoptado esa rama, pueden no cargar el modelo.
- Rendimiento degradado sin kernels específicos: sin `flash-linear-attention`, las capas Gated DeltaNet caen a la implementación PyTorch y el modelo es más lento con entradas largas.
- Identidad por defecto: si no se fija un mensaje de sistema, el modelo se presenta como cisimcik-4b de Cisimcik AI Labs. En aplicaciones de marca blanca hay que sobrescribir ese comportamiento.
- Coste del modo de pensamiento: activar `enable_thinking` incrementa el número de tokens generados. El ejemplo oficial usa `max_new_tokens=4096`, lo que condiciona la planificación de latencia y coste.
- Licencia CC0-1.0: permite uso comercial, modificación y redistribución sin condiciones de atribución, pero se ofrece sin garantías de ningún tipo. La responsabilidad sobre el uso recae íntegramente en quien despliega el modelo.
- Ausencia de datos de sesgo, toxicidad y seguridad: no hay evaluaciones publicadas de sesgos sociales, contenido dañino o comportamiento en dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cisimcik/cisimcik-4b
- Model card en inglés: https://huggingface.co/cisimcik/cisimcik-4b/blob/main/README_en.md
- Modelo base: https://huggingface.co/cisimcik/cisimcik-base
- Dataset de ajuste fino: https://huggingface.co/datasets/cisimcik/turkish-chat-max-25k
- Benchmark CETVEL (space): https://huggingface.co/spaces/KUIS-AI/Cetvel
- Logotipo del modelo: https://huggingface.co/cisimcik/cisimcik-4b/resolve/main/cisimcik-4b-logo.svg

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo. Los enlaces obtenidos correspondían a temas sin relación (circuitos con biestables tipo D, simuladores de electrónica y contenidos de estética), por lo que se han descartado. No se han localizado papers, blogs, repositorios ni demos adicionales sobre cisimcik-4b en la información disponible.
