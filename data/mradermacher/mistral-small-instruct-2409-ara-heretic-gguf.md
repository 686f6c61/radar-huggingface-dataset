# mradermacher/Mistral-Small-Instruct-2409-ARA-heretic-GGUF

## Resumen

Mistral-Small-Instruct-2409-ARA-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Mistral-Small-Instruct-2409-ARA-heretic, publicada por el usuario mradermacher en Hugging Face. El modelo subyacente parte de Mistral-Small-Instruct-2409, un transformer denso de Mistral AI con 22.247.282.688 parametros (aproximadamente 22,2 mil millones), sobre el que se ha aplicado una tecnica de "abliteration" o "decensoring" (etiquetada como heretic, uncensored y abliterated) para reducir los rechazos del modelo ante peticiones que el modelo original declinaria. Esta version GGUF facilita su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha es doble: por un lado, documenta un modelo derivado de una familia consolidada (Mistral Small 3), con soporte multilingue en diez idiomas (en, fr, de, es, it, pt, zh, ja, ru, ko) y una ventana de contexto que, aunque no se explicita en la informacion proporcionada, corresponde a la del modelo base de Mistral Small Instruct 2409. Por otro lado, advierte de las implicaciones practicas y legales de usar una variante "uncensored" derivada de un modelo con licencia de investigacion de Mistral AI.

El repositorio tiene un tamano de 62,8 GB, lo que refleja la presencia de multiples niveles de cuantizacion GGUF para distintos presupuestos de memoria. La licencia declarada es "mrl" (Mistral Research License), lo que restringe el uso a fines de investigacion no comerciales salvo licencia expresa de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Small Instruct 2409); no se detalla en la informacion proporcionada |
| Parametros totales | 22.247.282.688 (aprox. 22,2 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (corresponde a la del modelo base) |
| Tipos de cuantizacion | GGUF (multiples niveles; el repositorio de 62,8 GB sugiere varias variantes, aunque no se listan explicitamente) |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | mrl (Mistral Research License) |
| Formato de pesos | GGUF (repositorio principal); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Mistral-Small-Instruct-2409, un transformer denso de Mistral AI con aproximadamente 22,2 mil millones de parametros. Sobre el se ha aplicado un proceso de "abliteration" (denominado heretic/decensored en el repositorio de richardyoung), una tecnica que modifica los pesos o las direcciones de activacion para reducir la tendencia del modelo a rechazar peticiones. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento original, el numero de tokens, ni sobre si hubo fases de RLHF o DPO en el modelo base.

La contribucion de mradermacher es la conversion a formato GGUF, que permite la inferencia en CPU y GPU con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, etc.). No se especifican en la informacion disponible innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo instruct original.
- Razonamiento y respuesta a instrucciones en diez idiomas (en, fr, de, es, it, pt, zh, ja, ru, ko).
- Reduccion de rechazos ante peticiones que el modelo original declinaria (comportamiento "uncensored" o "abliterated").
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta a la tasa de rechazos y a la calidad de las respuestas, comparandolo con el modelo base original en entornos controlados de laboratorio.
- Generacion de texto creativo sin restricciones editoriales: util para experimentos de escritura narrativa o guiones donde se busca explorar respuestas sin filtros, siempre dentro de los limites de la licencia de investigacion.
- Evaluacion comparativa de cuantizaciones GGUF: al disponer de un repositorio con varias variantes, sirve para medir el impacto de la cuantizacion en calidad y velocidad sobre un modelo de 22 B.
- Despliegue local en estaciones de trabajo: mediante llama.cpp u Ollama, permite ejecutar un modelo de 22 B en equipos con suficiente RAM o VRAM, sin depender de APIs externas.
- Traduccion y procesamiento multilingue experimental: cubre diez idiomas, lo que permite probar flujos de traduccion o resumen en entornos de investigacion.
- Analisis de sesgos y comportamiento en modelos "decensored": util para auditar que tipo de contenido se genera cuando se eliminan los rechazos y documentar riesgos antes de cualquier uso supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: un modelo de 22,2 B en GGUF requiere aproximadamente 13-14 GB en cuantizacion Q4_K_M, 16-18 GB en Q5/Q6 y en torno a 44 GB en FP16 (sin contar overhead). Estas cifras son estimaciones basadas en el tamano de parametros, no datos publicados en la informacion proporcionada.
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB) para cuantizaciones Q4-Q6; RTX 3090 (24 GB) tambien viable en Q4/Q5.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizaciones agresivas (Q3/Q4), en GPUs de 16 GB; en CPU requiere al menos 16-32 GB de RAM segun cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-Instruct-2409-ARA-heretic-GGUF (este) | 22,2 B | no disponible | MRL (investigacion) | GGUF | Variante uncensored cuantizada |
| mradermacher/Mistral-Small-Instruct-2409-GGUF | 22,2 B | no disponible | MRL (investigacion) | GGUF | Mismo base sin abliteration |
| richardyoung/Mistral-Small-Instruct-2409-ARA-heretic | 22,2 B | no disponible | MRL (investigacion) | safetensors | Modelo fuente de esta cuantizacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia MRL (Mistral Research License) restringe el uso a fines de investigacion no comerciales; cualquier uso comercial requiere licencia expresa de Mistral AI.
- El proceso de abliteration puede degradar la calidad general, la coherencia y la seguridad del modelo; no hay benchmarks publicados que cuantifiquen esta perdida.
- Riesgo elevado de generar contenido danino, sesgado o inapropiado al haberse reducido los mecanismos de rechazo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se ha evaluado especificamente en esta variante.
- No se confirma en la informacion disponible el soporte de tool calling ni de agentes multi-paso.
- La longitud de contexto no se explicita en la informacion proporcionada; debe consultarse la documentacion del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria documentada.
- La fecha de creacion indicada (2026-11-06) es posterior a la fecha actual de referencia, lo que conviene verificar antes de citar el recurso.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/Mistral-Small-Instruct-2409-ARA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-ARA-heretic
- Cuantizacion de referencia sin abliteration: https://huggingface.co/mradermacher/Mistral-Small-Instruct-2409-GGUF
- Otra variante GGUF relacionada: https://huggingface.co/mradermacher/mistral-small-instruct-2409-clstlclms-GGUF
- Contacto de licencias Mistral AI: https://mistral.ai/contact/
