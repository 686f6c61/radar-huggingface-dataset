# Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Abliterated-GSQ-RCO-MTP-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-CHiPS-Abliterated-GSQ-RCO-MTP-GGUF es una modificación del modelo Swift 1.5 Qwen3.8-27B GSQ-RCO publicado por UkisAI, distribuida por el usuario Kujira en formato GGUF para llama.cpp. El modelo base es un fine-tune de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado de la familia Qwen3.8, orientado a razonamiento y generación de texto conversacional. Esta variante concreta aplica una técnica denominada CHiPS (Causal Head-isolated Projection Steering) sobre cuatro tensores del modelo original con el objetivo de reducir el comportamiento de rechazo (refusal) ante peticiones consideradas dañinas.

La relevancia de esta ficha radica en que documenta un caso de "abliteration" parcial: en lugar de reentrenar o modificar todos los pesos, se editan únicamente unas pocas cabezas de atención seleccionadas por su efecto causal sobre una conducta concreta. Según la model card, las frases de rechazo ante 104 peticiones dañinas caen del 93,3 % al 2,9 %, mientras que las métricas de capacidad (GSM8K, MMLU-Pro) y de tool calling se mantienen en niveles equivalentes a los del archivo original. El modelo se distribuye exclusivamente en dos cuantizaciones GGUF (IQ2_XS-mtp e IQ3_S-mtp) y bajo una licencia propia denominada swift-open-license-1.0.

Es importante subrayar que no se trata de un lanzamiento oficial de UkisAI, Alibaba Cloud ni ISTA-DASLab, y que la receta exacta de CHiPS no se ha publicado. El modelo está pensado para entornos donde se requiere un asistente conversacional con razonamiento explícito y sin filtros de rechazo, pero su uso en producción exige evaluar con cuidado los riesgos asociados a la eliminación de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8), con cabeza MTP (multi-token prediction) |
| Parametros totales | 27.320.697.856 (aprox. 27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los tests usan hasta 4.096 tokens nuevos de generacion) |
| Tipos de cuantizacion | IQ2_XS-mtp (8,77 GB) e IQ3_S-mtp (12,12 GB); solo estos dos niveles |
| Idiomas soportados | no disponible (los tests se hicieron en ingles y japones) |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (llama.cpp); incluye LICENSE, LICENSE-APACHE-2.0 y NOTICE |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.8 con aproximadamente 27,3 mil millones de parámetros, e incorpora una cabeza MTP (multi-token prediction) que se conserva byte a byte en esta variante. La modificación CHiPS actúa sobre 4 de los 866 tensores del archivo GGUF: estos se reescriben y se recuantizan a su tipo original usando la matriz de importancia `imatrix-swift15-v1mix.gguf` del repositorio original. El resto de tensores, incluida la cabeza MTP, permanecen idénticos byte a byte. Los metadatos añaden claves `quantize.imatrix.*` generadas por llama-quantize.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La técnica CHiPS (Causal Head-isolated Projection Steering) selecciona un pequeño conjunto de cabezas de atención en función de su efecto causal sobre una conducta objetivo y modifica solo sus proyecciones, dejando el resto del modelo intacto. La receta concreta no está publicada; el autor remite a un artículo externo que describe el método y su caso de estudio 2. No se ha publicado información sobre decodificación especulativa, atención lineal ni otras innovaciones de inferencia más allá de la mencionada cabeza MTP.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés (idiomas evaluados).
- Razonamiento explícito con modo de pensamiento (reasoning), con generación de cadenas de razonamiento antes de la respuesta final.
- Razonamiento matemático: 94,0 % de acierto en 250 preguntas de GSM8K.
- Conocimiento general y razonamiento de nivel avanzado: 73,7 % en 300 preguntas de MMLU-Pro.
- Tool calling / function calling: 100 % de llamadas correctas cuando se espera, 100 % de nombres correctos, 100 % de argumentos completos; 100 % de no-llamada cuando no se necesita; 100 % de continuación tras resultado de herramienta.
- Tareas de formato largo (long-form) de hasta 3.072 tokens nuevos, con tasas de bucle y respuestas vacías bajas.
- Comportamiento de rechazo reducido de forma selectiva: 2,9 % de frases de rechazo ante peticiones dañinas (frente al 93,3 % del original).
- No incluye proyector de visión; la visión no está soportada ni fue evaluada.

## Casos de uso

- Asistente conversacional sin filtros para investigación en seguridad: permite estudiar el comportamiento de modelos ante peticiones dañinas con una tasa de rechazo mínima (2,9 %), útil para analizar respuestas y diseñar contramedidas en entornos controlados.
- Evaluación de técnicas de steering y abliteration: al modificar solo 4 tensores, sirve como caso de referencia para comparar el impacto de ediciones localizadas frente a reentrenamientos completos, manteniendo GSM8K y MMLU-Pro prácticamente intactos.
- Generación de código y razonamiento técnico en pipelines locales: con tool calling fiable (100 % en las pruebas) y cuantización IQ3_S de 12,12 GB, puede integrarse en flujos de CI/CD o asistentes de terminal que ejecuten herramientas externas.
- Razonamiento matemático en entornos con recursos limitados: el archivo IQ2_XS de 8,77 GB permite ejecutar un modelo de 27,3 B en GPUs de consumo, con 94,0 % en GSM8K, adecuado para tutores o verificadores de cálculos.
- Procesamiento de documentación técnica en inglés y japonés: conversaciones multi-turno con contexto amplio y generación de respuestas largas (hasta 3.072 tokens) para resúmenes, extracción y reescritura.
- Agentes multi-paso con herramientas: la combinación de razonamiento explícito, tool calling completo y continuación tras resultados permite construir agentes que encadenan llamadas a APIs, consultas a bases de datos y acciones sobre ficheros.
- Investigación sobre alineación y robustez: la discrepancia entre respuestas dañinas largas (992 tokens de media frente a 297 del original) y el 13,5 % que alcanza el límite de 1.536 tokens proporciona material para estudiar la relación entre longitud de respuesta y seguridad.

## Benchmarks y rendimiento

Todos los datos proceden de la model card y se midieron sobre el archivo IQ2_XS-mtp, comparándolo con el IQ2_XS-mtp original con los mismos ajustes y semillas. Cada conjunto se ejecutó una vez. El archivo IQ3_S-mtp no fue evaluado.

| Benchmark | Original | Este modelo |
|---|---|---|
| Frases de rechazo, peticiones dañinas (104) | 93,3 % | 2,9 % |
| Frases de rechazo, peticiones inocuas (100) | 2 % | 2 % |
| Bucles (dañinas / inocuas) | 0 % / 0 % | 0 % / 0 % |
| Respuestas vacías (dañinas / inocuas) | 0 % / 1 % | 0 % / 2 % |
| Alcanzan límite de tokens (dañinas / inocuas) | 0 % / 1 % | 13,5 % / 2 % |
| Tokens medios (dañinas / inocuas) | 297 / 566 | 992 / 584 |
| Tareas largas: alcanzan límite (24) | 20,8 % (5) | 12,5 % (3) |
| Tareas largas: bucles cortos | 4,2 % (1) | 0 % |
| Tareas largas: respuestas vacías | 12,5 % (3) | 4,2 % (1) |
| Tool calling: llamada esperada / nombre / argumentos (30) | 100 % / 100 % / 100 % | 100 % / 100 % / 100 % |
| Tool calling: sin llamada cuando no se necesita (10) | 90 % (9/10) | 100 % |
| Tool calling: continuación tras resultado | 100 % | 100 % |
| GSM8K (250 preguntas) | 94,8 % (237) | 94,0 % (235) |
| GSM8K: aciertos solo en este archivo | 4 | 2 |
| GSM8K: alcanzan límite de tokens | 0 % | 0 % |
| GSM8K: tokens medios | 330 | 336 |
| MMLU-Pro (300 preguntas) | 73,7 % (221) | 73,7 % (221) |
| MMLU-Pro: aciertos solo en este archivo | 19 | 19 |
| MMLU-Pro: alcanzan límite de tokens | 8,3 % (25) | 10,7 % (32) |

En el artículo de CHiPS se reporta además una evaluación con GPT-6 como juez sobre 96 peticiones de JailbreakBench no usadas en el ajuste: 95,8 % de rechazo para el original frente a 4,2 % para este archivo, con 6 respuestas parciales adicionales; cabezas aleatorias con las mismas intensidades se mantuvieron en 94,8 % y 95,8 %.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9-10 GB para el archivo IQ2_XS-mtp (8,77 GB) y 12,5-13,5 GB para IQ3_S-mtp (12,12 GB), añadiendo margen para el contexto KV.
- GPU recomendadas: RTX 4090 (24 GB) ejecuta ambos archivos con contexto amplio; RTX 4080/4070 Ti Super (16 GB) ejecuta IQ3_S-mtp con contexto moderado; GPUs de 12 GB pueden ejecutar IQ2_XS-mtp con contexto reducido.
- Cabe en GPU de consumo: sí, en modelos con al menos 12 GB de VRAM para IQ2_XS y 16 GB para IQ3_S.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y servidores compatibles con la API de OpenAI (tag `endpoints_compatible`). No se indica soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (IQ2_XS-mtp) | 27,3 B | no disponible | 94,0 % | 73,7 % | swift-open-license-1.0 | GGUF |
| Swift 1.5 Qwen3.8-27B GSQ-RCO (original, IQ2_XS-mtp) | 27,3 B | no disponible | 94,8 % | 73,7 % | swift-open-license-1.0 | GGUF |
| Qwen3.8-27B (base de la familia) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el archivo original del mismo repositorio de UkisAI, del que este modelo difiere únicamente en 4 tensores. No se dispone de datos de benchmarks de otros modelos de la familia Qwen3.8 en la información proporcionada, por lo que no se incluyen cifras adicionales.

## Limitaciones y advertencias

- No es un lanzamiento oficial de UkisAI, Alibaba Cloud ni ISTA-DASLab; el nombre "Swift" se usa solo para indicar la procedencia del modelo base.
- La receta de CHiPS no está publicada, lo que impide reproducir la modificación o auditar su comportamiento con garantías.
- La reducción de rechazos implica la eliminación de salvaguardas de seguridad: el modelo responde a peticiones dañinas en el 97,1 % de los casos evaluados, lo que lo hace inadecuado para aplicaciones de cara al público sin controles externos.
- El 13,5 % de las respuestas a peticiones dañinas alcanza el límite de 1.536 tokens de la prueba, con una media de 992 tokens frente a 297 del original; si se necesitan respuestas completas, hay que aumentar `max_tokens`.
- En preguntas difíciles el razonamiento se alarga: 32 de 300 preguntas de MMLU-Pro alcanzan el límite de 4.096 tokens frente a 25 del original.
- El archivo IQ3_S-mtp no fue evaluado; al recuantizar, una edición pequeña puede comportarse de forma distinta a la observada en IQ2_XS-mtp.
- Solo se distribuyen dos niveles de cuantización; no hay versión en safetensors, FP16 ni otros formatos.
- No incluye proyector de visión y la visión no fue probada.
- Los conjuntos de peticiones de evaluación no están publicados, lo que limita la verificación independiente de las cifras.
- Las evaluaciones se ejecutaron una sola vez por conjunto; diferencias de una o dos tareas están dentro de la variabilidad del muestreo.
- La licencia swift-open-license-1.0 es de tipo "other"; deben revisarse los términos de `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE` antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, idiomas soportados más allá del inglés y el japonés evaluados, ni sobre la longitud de contexto nativa del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Abliterated-GSQ-RCO-MTP-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Matriz de importancia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/imatrix-swift15-v1mix.gguf
- Artículo sobre CHiPS: https://balaena01.github.io/chips-steering/
- Referencia arXiv 2604.18556 (citada en los tags)
- Referencia arXiv 2605.00649 (citada en los tags)
