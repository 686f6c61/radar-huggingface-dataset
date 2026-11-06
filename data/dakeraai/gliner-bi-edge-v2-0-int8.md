# DakeraAI/gliner-bi-edge-v2.0-int8

## Resumen

`DakeraAI/gliner-bi-edge-v2.0-int8` es una versión cuantizada a int8 y exportada a ONNX del modelo `knowledgator/gliner-bi-edge-v2.0`, un extractor de entidades nombradas (NER) zero-shot basado en la arquitectura GLiNER. Lo publica DakeraAI, el equipo detrás de Dakera, un motor de memoria autoalojado para agentes de IA, y está pensado como la opción más ligera de su pipeline de extracción de entidades: 64,9 MB de grafos ONNX en total, con inferencia rápida en CPU mediante ONNX Runtime.

El modelo sigue el paradigma bi-encoder de GLiNER: el texto se procesa sin prompt de etiquetas y las etiquetas se codifican por separado como vectores que se reutilizan entre textos. Esto permite extraer entidades de tipos arbitrarios definidos en tiempo de inferencia, sin reentrenamiento, y con un coste de codificación de etiquetas que se amortiza a lo largo de muchas peticiones.

Es relevante para desarrolladores que necesitan NER de baja latencia y bajo consumo de memoria en entornos autoalojados (servidores pequeños, contenedores, edge), donde un transformer NER convencional o un LLM resultarían excesivos. La licencia Apache-2.0 y la disponibilidad de los ficheros ONNX con checksums lo hacen apto para producción, aunque su cobertura multilingüe es muy limitada fuera del inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER bi-encoder (transformer bidireccional con cabeza de spans factorizada), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (pesos en bloque de 32, simétrico, `MatMulNBits`; tabla de embeddings int8 por fila; activaciones en FP32) |
| Idiomas soportados | inglés (declarado); evaluación multilingüe limitada en de, es, fr, hi, it, pt, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, `onnx/labels_encoder.onnx`) |

## Arquitectura y entrenamiento

El modelo original es un GLiNER bi-encoder: un encoder transformer bidireccional que produce representaciones de palabras y una cabeza de spans que puntúa cada posible span de hasta 12 palabras contra las representaciones de las etiquetas. La innovación de esta build de Dakera es una factorización exacta de la cabeza de spans: la primera capa densa se separa en una parte de inicio y otra de fin calculadas una vez por palabra, y la última se pliega en el lado de las etiquetas. Los logits resultantes son idénticos a los del original (diferencia máxima de 3,8e-06) y el coste pasa de ser por span a ser por palabra.

La cuantización aplica int8 en bloque (bloque 32, simétrico) a las matrices de pesos del encoder y de las cabezas, y int8 por fila a la tabla de embeddings de palabras, manteniendo las activaciones en FP32; según la model card, cuantizar las activaciones es lo que hace que otras exportaciones GLiNER uniformemente cuantizadas no encuentren entidades. La validación frente al original en frases multilingües de prueba reporta una correlación de logits de al menos 0,998 y un 100 % de entidades idénticas. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO); para ello remite a la model card original de `knowledgator/gliner-bi-edge-v2.0`.

## Capacidades

- Extracción de entidades nombradas zero-shot: permite definir las etiquetas en tiempo de inferencia sin reentrenar.
- Codificación de etiquetas reutilizable: un vector por etiqueta, codificado una vez y reutilizado para todos los textos (ventaja del bi-encoder).
- Spans de hasta 12 palabras, con segmentación por runs de letras, marcas y dígitos (unidos por `-` o `_`), caracteres sueltos y caracteres chinos o japoneses individuales.
- Umbral de decisión configurable (0,5 por defecto) sobre la sigmoide de los logits.
- Inferencia en CPU con ONNX Runtime, con weight prepacking activado por defecto.
- Capacidades multilingües: limitadas; el modelo declara inglés y su rendimiento en otros idiomas es bajo (ver benchmarks).
- No soporta tool calling, function calling, agentes multi-step ni generación de texto: es exclusivamente un modelo de token-classification.

## Casos de uso

- Extracción de entidades en memoria de agentes: Dakera lo usa como la opción más ligera de su pipeline (`DAKERA_GLINER_MODEL=gliner-bi-edge`) para poblar la memoria estructurada de un agente con personas, organizaciones y localizaciones extraídas de conversaciones, en hosts con poca memoria.
- Servicio de NER autoalojado en contenedores pequeños: los 64,9 MB de grafos ONNX y la inferencia en CPU permiten desplegarlo en instancias de bajo coste sin GPU, con una latencia mediana de 0,006 s por petición en el conjunto de chat de Dakera.
- Preprocesado de textos en pipelines de datos: etiquetado de personas, organizaciones y localizaciones en corpus en inglés antes de indexación, búsqueda o análisis, con la posibilidad de definir etiquetas adicionales sin reentrenar.
- Enrutamiento y clasificación de tickets: extracción de entidades de soporte (producto, organización, ubicación) para dirigir consultas al equipo adecuado, aprovechando la reutilización de vectores de etiquetas entre muchas peticiones.
- Anonimización o enmascarado de PII: detección de nombres de persona y organización en logs o textos antes de almacenarlos o compartirlos, con umbral ajustable según la tolerancia a falsos positivos.
- Prototipado rápido de NER en entornos sin GPU: validación de esquemas de etiquetas y umbrales en portátiles o CI, dado el reducido tamaño del modelo y su ejecución en CPU.
- Extracción de entidades en redes sociales en inglés: el modelo reporta F1 de 0,62 en WNUT-17, lo que lo hace utilizable para monitorización de menciones con las cautelas de precisión correspondientes.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos a través del pipeline de extracción de Dakera (umbral 0,5; etiquetas person, organization, location; ONNX Runtime 1.31 con weight prepacking, un hilo de CPU por pasada en un AMD Ryzen 9 7950X):

| Conjunto | F1 |
|---|---|
| Dakera chat sentences, inglés (20 frases; 10 etiquetas) | 0,88 |
| Dakera chat sentences, 7 idiomas (44 frases; 10 etiquetas) | 0,64 |
| WNUT-17 (redes sociales, inglés) | 0,62 |
| CoNLL-2003 (noticias, inglés) | 0,63 |

MultiCoNER v2 (150 frases por idioma):

| de | en | es | fr | hi | it | pt | zh |
|---|---|---|---|---|---|---|---|
| 0,40 | 0,53 | 0,31 | 0,41 | 0,01 | 0,44 | 0,36 | 0,01 |

Latencia: mediana de 0,006 s por petición en el conjunto de chat. No se publican resultados de benchmarks estándar de NER (MMLU, HumanEval, GSM8K no aplican a este tipo de modelo) más allá de los anteriores.

## Requisitos de hardware

- VRAM: no requiere GPU; está diseñado para inferencia en CPU. El tamaño del repositorio es de 0,1 GB y los grafos ONNX suman 64,9 MB (`model.onnx` 40,0 MB, `labels_encoder.onnx` 24,9 MB).
- GPU recomendadas: no aplica; el modelo está optimizado para CPU con ONNX Runtime.
- Cabe en cualquier equipo consumer: la inferencia se ejecuta en CPU con un hilo por pasada según la medición publicada (AMD Ryzen 9 7950X).
- Opciones de despliegue: ONNX Runtime (con weight prepacking activado, que es el valor por defecto; desactivarlo hace las MatMul de 8 bits 4–5 veces más lentas), contenedor Docker de Dakera (`ghcr.io/dakera-ai/dakera:latest`).
- Latencia y throughput: mediana de 0,006 s por petición en el conjunto de chat de Dakera; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| DakeraAI/gliner-bi-edge-v2.0-int8 | GLiNER bi-encoder, NER zero-shot | 64,9 MB (ONNX int8) | no disponible | inglés (evaluación limitada en otros) | Apache-2.0 | ONNX |
| knowledgator/gliner-bi-edge-v2.0 | GLiNER bi-encoder, NER zero-shot (original) | no disponible | no disponible | inglés | Apache-2.0 | PyTorch |
| GLiNER (modelo original, arXiv:2311.08526) | GLiNER, NER zero-shot | no disponible | no disponible | multilingüe (según variante) | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparables de las alternativas para establecer una comparación cuantitativa; la model card solo valida que esta build reproduce las entidades del original con correlación de logits de al menos 0,998.

## Limitaciones y advertencias

- Rendimiento multilingüe muy bajo fuera del inglés: F1 de 0,01 en hindi y chino, 0,31 en español y 0,36 en portugués en MultiCoNER v2; no debe usarse como NER multilingüe sin validación previa.
- F1 moderado incluso en inglés en dominios difíciles: 0,62 en WNUT-17 y 0,63 en CoNLL-2003, lo que implica falsos positivos y falsos negativos no despreciables en producción.
- Riesgo de alucinación de entidades: al ser un modelo discriminativo con umbral de 0,5, puede emitir spans con baja confianza; conviene ajustar el umbral según el caso de uso.
- Dependencia de la configuración de ONNX Runtime: si se desactiva el weight prepacking, el rendimiento cae entre 4 y 5 veces.
- Límite de spans de 12 palabras y reglas de segmentación específicas (caracteres chinos y japoneses individuales), que pueden afectar a entidades largas o a idiomas sin espacios.
- El modelo solo declara inglés; las etiquetas y los textos en otros idiomas no están garantizados.
- Licencia Apache-2.0, permisiva para uso comercial; el crédito corresponde a los autores originales de GLiNER y de `knowledgator/gliner-bi-edge-v2.0`.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-step; su uso está acotado a token-classification.
- No se dispone de información sobre sesgos del modelo base en la documentación proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DakeraAI/gliner-bi-edge-v2.0-int8
- Modelo base original: https://huggingface.co/knowledgator/gliner-bi-edge-v2.0
- Licencia: https://huggingface.co/DakeraAI/gliner-bi-edge-v2.0-int8/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Paper GLiNER (arXiv:2311.08526): https://arxiv.org/abs/2311.08526
- Paper referenciado en los tags (arXiv:2602.18487): no disponible como enlace verificado en la información proporcionada
