# Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Uncensored-GSQ-RCO-MTP-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B CHiPS-Abliterated GSQ-RCO es una modificación del modelo Swift 1.5 Qwen3.8-27B GSQ-RCO publicado por UkisAI, distribuida por el usuario Kujira en formato GGUF para llama.cpp. El modelo parte de una base de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) y conserva la arquitectura del modelo original, pero incorpora una edición quirúrgica orientada a reducir el comportamiento de rechazo (refusal) ante peticiones dañinas. No es un lanzamiento oficial de UkisAI, Alibaba Cloud ni ISTA-DASLab, y estos no lo respaldan.

La modificación se realizó mediante CHiPS (Causal Head-isolated Projection Steering), una técnica que altera únicamente unas pocas cabezas de atención seleccionadas por su efecto causal sobre el comportamiento objetivo, dejando el resto del modelo intacto. En concreto, de los 866 tensores del archivo original solo se reescriben 4, y el resto (incluida la cabeza MTP) permanece byte a byte idéntico. La receta exacta de CHiPS no se ha publicado.

La relevancia de esta ficha radica en que documenta un caso de "abliteración" o "decensoring" aplicada a un modelo de razonamiento de 27B con capacidades de tool calling, manteniendo los niveles de precisión del original en GSM8K y MMLU-Pro según las mediciones del autor. El modelo se distribuye únicamente en dos cuantizaciones GGUF (IQ2_XS-mtp e IQ3_S-mtp) y está pensado para ejecución local con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.8 (detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ2_XS-mtp (8,77 GB) e IQ3_S-mtp (12,12 GB); sin otras cuantizaciones publicadas |
| Idiomas soportados | no disponible; las evaluaciones del autor usan peticiones en ingles y japones |
| Licencia | swift-open-license-1.0 (license_name: swift-open-license-1.0, license: other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Swift 1.5 Qwen3.8-27B GSQ-RCO de UkisAI, que a su vez deriva de la familia Qwen3.8. La informacion proporcionada no detalla la composicion del dataset de entrenamiento original, el numero de tokens ni si hubo fases de RLHF o DPO. Lo que si se documenta con precision es la intervencion realizada sobre los pesos: se parte de los archivos IQ2_XS-mtp e IQ3_S-mtp del repositorio original y se reescriben 4 de los 866 tensores mediante CHiPS (Causal Head-isolated Projection Steering), una tecnica que identifica cabezas de atencion con efecto causal sobre un comportamiento concreto y modifica solo esas proyecciones.

Los tensores reescritos se recuantizaron a sus tipos originales usando la matriz de importancia Swift V1MIX (`imatrix-swift15-v1mix.gguf`) del repositorio de UkisAI. El resto de tensores, incluida la cabeza MTP (multi-token prediction), permanecen byte a byte identicos al original. Los metadatos incluyen claves `quantize.imatrix.*` anadidas por llama-quantize. La receta de CHiPS no se ha publicado; solo se enlaza un articulo explicativo del metodo. No se incluye proyector de vision y esta capacidad no fue evaluada.

## Capacidades

- Generacion de texto conversacional de un solo turno y multi-turno.
- Razonamiento explicito (modo reasoning): el modelo genera cadenas de razonamiento antes de la respuesta final, con limites de tokens configurables.
- Razonamiento matematico: 94,0% de acierto en 250 preguntas de GSM8K segun el autor.
- Conocimiento general y razonamiento experto: 73,7% en 300 preguntas de MMLU-Pro.
- Tool calling / function calling: 100% de llamadas correctas cuando se espera una, 100% de nombres correctos, 100% de argumentos completos y 100% de continuidad tras el resultado de la herramienta en las pruebas del autor.
- Tareas de formato largo (long-form) con hasta 3.072 tokens nuevos en las pruebas.
- Capacidad multilingue: las evaluaciones incluyen peticiones en ingles y japones; no se detalla la lista completa de idiomas.
- Comportamiento de rechazo reducido: las frases de rechazo ante 104 peticiones daninas caen del 93,3% al 2,9%.
- Sin soporte de vision en esta distribucion (no se incluye proyector y no se probo).

## Casos de uso

- Evaluacion de robustez y seguridad de modelos: el modelo sirve como caso de estudio para medir como una edicion de 4 tensores altera la tasa de rechazo (de 93,3% a 2,9%) sin degradar GSM8K ni MMLU-Pro, util para investigar tecnicas de steering y alineacion.
- Investigacion sobre abliteracion y edicion de pesos: permite reproducir experimentos de CHiPS sobre cabezas de atencion y comparar el comportamiento del archivo editado frente al original con la misma matriz de importancia.
- Despliegue local en equipos con VRAM limitada: la cuantizacion IQ2_XS-mtp (8,77 GB) permite ejecutar un modelo de 27B en GPU de consumo con 12-16 GB de VRAM mediante llama.cpp, a costa de cierta perdida de calidad respecto a cuantizaciones mayores.
- Asistentes conversacionales sin filtros de rechazo: para prototipos donde se requiere que el modelo responda a peticiones que el original rechazaria, con la advertencia de que el contenido generado puede ser danino.
- Pipelines de agentes con tool calling: las pruebas del autor muestran 100% de acierto en nombre y argumentos de herramientas y continuidad tras el resultado, lo que lo hace apto para flujos de agente de varios pasos en local.
- Generacion de razonamiento largo para analisis: el modelo produce cadenas de razonamiento extensas (media de 992 tokens en peticiones daninas y 1.909 en tareas largas), util para tareas de analisis que requieren justificacion paso a paso.
- Evaluacion comparativa de cuantizaciones: al ofrecerse solo IQ2_XS e IQ3_S, permite estudiar como la recuantizacion afecta a la supervivencia de una edicion pequena (el autor advierte que el comportamiento de IQ3_S puede diferir y no fue evaluado).

## Benchmarks y rendimiento

Todos los datos proceden de las mediciones del autor sobre el archivo IQ2_XS-mtp, comparado con el IQ2_XS-mtp original verificado por SHA-256, con los mismos ajustes y semillas. Cada conjunto se ejecuto una vez. El archivo IQ3_S-mtp no fue evaluado.

| Prueba | Original | Este modelo |
|---|---|---|
| Frases de rechazo, peticiones daninas (104) | 93,3% | 2,9% |
| Frases de rechazo, peticiones inofensivas (100) | 2% | 2% |
| Bucles (daninas / inofensivas) | 0% / 0% | 0% / 0% |
| Respuestas vacias (daninas / inofensivas) | 0% / 1% | 0% / 2% |
| Alcanzan el limite de tokens (daninas / inofensivas) | 0% / 1% | 13,5% / 2% |
| Tokens medios (daninas / inofensivas) | 297 / 566 | 992 / 584 |
| Tareas largas: alcanzan el limite | 20,8% (5) | 12,5% (3) |
| Tareas largas: bucles de periodo corto | 4,2% (1) | 0% |
| Tareas largas: respuestas vacias | 12,5% (3) | 4,2% (1) |
| Tareas largas: tokens medios | 1.961 | 1.909 |
| Tool calling: llamada cuando se espera / nombre correcto / argumentos completos | 100% / 100% / 100% | 100% / 100% / 100% |
| Tool calling: sin llamada cuando no se necesita | 90% (9 de 10) | 100% |
| Tool calling: continuidad tras resultado | 100% | 100% |
| GSM8K: acierto (250 preguntas) | 94,8% (237) | 94,0% (235) |
| GSM8K: acierto solo en este archivo | 4 | 2 |
| GSM8K: alcanzan el limite de tokens | 0% | 0% |
| GSM8K: tokens medios | 330 | 336 |
| MMLU-Pro: acierto (300 preguntas) | 73,7% (221) | 73,7% (221) |
| MMLU-Pro: acierto solo en este archivo | 19 | 19 |
| MMLU-Pro: alcanzan el limite de tokens | 8,3% (25) | 10,7% (32) |

El autor senala que las diferencias de una o dos tareas en las pruebas de tareas largas y tool calling estan dentro de lo que produce el muestreo, por lo que deben leerse como "el mismo nivel", no como una mejora. En la prueba externa de JailbreakBench citada en el articulo de CHiPS (96 peticiones no usadas en el ajuste, evaluadas por GPT-6), el rechazo pasa del 95,8% al 4,2%, con 6 de 96 respuestas parciales; cabezas aleatorias a las mismas intensidades se quedan en 94,8% y 95,8%.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,8 GB para IQ2_XS-mtp y 12,1 GB para IQ3_S-mtp solo en pesos; hay que anadir la cache KV, cuyo tamano depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: no especificadas por el autor. Por tamano, IQ2_XS cabe en GPUs de consumo de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); IQ3_S requiere 16 GB o mas (RTX 4090, RTX 4080 Super, A4000). Para cargas de produccion, A100 o H100 con margen amplio.
- Cabe en GPU de consumo: si, con ambas cuantizaciones segun la VRAM disponible.
- Opciones de despliegue: llama.cpp (formato nativo, con soporte de la cabeza MTP) y cualquier frontend compatible con GGUF (Ollama, LM Studio, servidores compatibles con la API de endpoints). No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (IQ2_XS-mtp) | 27,3 B | no disponible | 94,0% | 73,7% | swift-open-license-1.0 | GGUF |
| Swift 1.5 Qwen3.8-27B GSQ-RCO original (IQ2_XS-mtp) | 27,3 B | no disponible | 94,8% | 73,7% | swift-open-license-1.0 | GGUF |
| Swift 1.5 Qwen3.8-27B GSQ-RCO original (IQ3_S-mtp) | 27,3 B | no disponible | no evaluado | no evaluado | swift-open-license-1.0 | GGUF |
| Modelos Qwen3.8 de 27B sin editar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos medidos es frente al archivo original del mismo tier. No se dispone de resultados de benchmarks de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo reduce deliberadamente el rechazo ante peticiones daninas: el 2,9% de frases de rechazo frente al 93,3% del original implica que puede generar contenido danino, inseguro o ilegal. No es apto para despliegues de produccion sin moderacion externa.
- El 13,5% de las respuestas a peticiones daninas alcanzan el limite de 1.536 tokens de la prueba, por lo que muchas respuestas quedan incompletas si no se eleva `max_tokens`.
- El razonamiento en preguntas dificiles se alarga: 32 de 300 preguntas de MMLU-Pro alcanzan el limite de 4.096 tokens frente a 25 del original, lo que puede aumentar coste y latencia.
- El archivo IQ3_S-mtp no fue evaluado; el autor advierte que la recuantizacion puede cambiar cuanto de la edicion sobrevive, por lo que su comportamiento puede diferir del medido en IQ2_XS-mtp.
- La receta de CHiPS no se publica, lo que limita la reproducibilidad y la auditoria del cambio.
- No se incluye proyector de vision y la capacidad visual no fue probada.
- No hay informacion sobre sesgos, tasas de alucinacion ni cobertura idiomatica completa; las evaluaciones solo cubren ingles y japones.
- La licencia swift-open-license-1.0 es "other" y no se detallan sus terminos en la informacion proporcionada; hay que revisar `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE` antes de cualquier uso comercial.
- No es un lanzamiento oficial de UkisAI, Alibaba Cloud ni ISTA-DASLab, y estos no lo respaldan; "Swift" solo indica el origen del modelo.
- El modelo solo se distribuye en dos cuantizaciones de baja precision (IQ2_XS e IQ3_S), lo que implica perdida de calidad frente a pesos completos no disponibles en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Uncensored-GSQ-RCO-MTP-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Matriz de importancia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/imatrix-swift15-v1mix.gguf
- Articulo sobre CHiPS: https://balaena01.github.io/chips-steering/
- Paper referenciado (arxiv:2604.18556): no disponible como enlace directo en la informacion proporcionada
- Paper referenciado (arxiv:2605.00649): no disponible como enlace directo en la informacion proporcionada
