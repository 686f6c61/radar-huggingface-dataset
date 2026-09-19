# mradermacher/Haumea-1.5-GGUF

## Resumen

Haumea-1.5-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo HaumeaAI/Haumea-1.5, un transformer de aproximadamente 7.248 millones de parámetros (el dato de parámetros totales procede de los metadatos de safetensors del modelo base). El repositorio no contiene pesos originales ni documentación técnica del modelo subyacente: únicamente versiones cuantizadas listas para su uso con motores de inferencia basados en llama.cpp.

Su relevancia es práctica y no arquitectónica. Al reducir el peso de f16 (14,6 GB) a 3,9 GB (Q3_K_L) o 2,8 GB (Q2_K), permite ejecutar un modelo de ~7B en GPUs de consumo e incluso en CPU con RAM limitada, lo que lo convierte en una vía de entrada de bajo coste para probar la familia Haumea antes de comprometerse con los pesos completos.

Las limitaciones de información son notables: se desconoce la licencia, la longitud de contexto, la arquitectura exacta, el proceso de entrenamiento y cualquier resultado de benchmarks. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (19 de septiembre de 2026) es inconsistente con el calendario actual, lo que aconseja tratar los metadatos con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo contiene cuantizaciones GGUF; no se detalla en la informacion proporcionada) |
| Parametros totales | 7.248.023.552 (~7,25 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Publicados: Q2_K (2,8 GB), Q3_K_L (3,9 GB) y f16 (14,6 GB, 16 bpw). La model card menciona ademas, como tipos previstos en su lista interna, Q3_K_M, Q3_K_S, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 e IQ4_XS, pero no aparecen como ficheros en la tabla de cuantizaciones facilitadas |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repositorio); el modelo base se publica con la libreria `transformers` y dispone de safetensors segun los metadatos de parametros |
| Libreria declarada | transformers |
| Etiquetas | transformers, gguf, en, base_model:HaumeaAI/Haumea-1.5, base_model:quantized:HaumeaAI/Haumea-1.5, endpoints_compatible, region:us, conversational |
| Tamano del repositorio | 64,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base HaumeaAI/Haumea-1.5: la model card del repositorio de cuantización no incluye tipo de transformer, mecanismo de atención, composición del dataset, número de tokens de entrenamiento ni si hubo fases de RLHF, DPO u otra alineación. El dato disponible es el recuento de parámetros (7.248.023.552), coherente con un modelo denso de la familia de ~7B, pero esto es una inferencia de tamaño y no una confirmación arquitectónica.

Lo único documentado es el proceso de cuantización. Los comentarios internos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, cuantizaciones estáticas generadas a partir de los pesos en formato Hugging Face, con cuantización también aplicada a los tensores de salida. El autor indica explícitamente que no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicación, y que no tiene previsto generarlas salvo petición en la sección de discusiones. La propia model card enlaza un gráfico comparativo genérico de perplejidad entre tipos de cuantización (de ikawrakow) y un análisis de Artefact2 sobre el tema: son referencias generales sobre calidad de cuantización, no resultados medidos sobre Haumea-1.5.

## Capacidades

- Generación de texto en inglés: es la única capacidad respaldada por las etiquetas del repositorio (`en`, `conversational`).
- Uso conversacional: la etiqueta `conversational` sugiere un modelo ajustado o preparado para diálogo multi-turno, aunque no se documenta el formato de prompt ni la plantilla de chat.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia compatible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio declara únicamente inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en inglés sobre hardware modesto: con la cuantización Q3_K_L (3,9 GB) el modelo cabe en una GPU de consumo con 6-8 GB de VRAM o en CPU con 8 GB de RAM, usando llama.cpp u Ollama. Es adecuado para prototipos de chat sin conexión y sin coste de API.
- Evaluación previa a la adopción del modelo base: un equipo que dude entre integrar Haumea-1.5 en su stack puede descargar Q3_K_L y probar la calidad de las respuestas en sus propios prompts antes de invertir en los 14,6 GB del f16 o en la versión completa del modelo original.
- Procesamiento por lotes offline de texto en inglés: clasificación, resumen o reescritura de documentos ejecutados con llama.cpp en un servidor sin GPU, aprovechando el reducido tamaño de las cuantizaciones de 2-3 bits para maximizar el número de instancias en paralelo por nodo.
- Despliegue en el borde o en dispositivos con recursos muy limitados: Q2_K ocupa 2,8 GB, lo que permite ejecución en placas de 8 GB de RAM, asumiendo latencias altas y una degradación de calidad apreciable respecto a f16.
- Estudio comparativo de cuantización: al publicarse tres niveles muy distintos (Q2_K, Q3_K_L y f16), el repositorio sirve como banco de pruebas para medir la pérdida de perplejidad y de calidad conversacional entre 2-3 bits y 16 bits sobre un mismo modelo base.
- Sustitución de un modelo mayor en tareas de baja exigencia: para generación de texto de relleno, borradores o respuestas de chatbot de propósito general donde la precisión no es crítica, un 7B cuantizado reduce el coste de inferencia frente a modelos de 30B o superiores.
- Base para experimentación en docencia o investigación: el tamaño manejable y la disponibilidad de formatos GGUF facilitan su uso en aulas y entornos de laboratorio con GPUs de gama media para estudiar comportamiento de modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K, MT-Bench, perplejidad medida) ni comparaciones numéricas con otros modelos. Las únicas referencias gráficas que aparecen son un gráfico genérico sobre tipos de cuantización y un análisis externo sobre el mismo tema, que no aportan cifras de rendimiento de Haumea-1.5.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead de contexto y buffers del motor, orientativa):
  - Q2_K (2,8 GB de fichero): aproximadamente 3,5-4 GB de VRAM/RAM.
  - Q3_K_L (3,9 GB de fichero): aproximadamente 4,5-5,5 GB de VRAM/RAM.
  - f16 (14,6 GB de fichero): aproximadamente 16-18 GB de VRAM/RAM.
- GPU recomendadas: el f16 encaja con comodidad en A100 40 GB, H100 y RTX 4090 (24 GB); las cuantizaciones Q3_K_L y Q2_K caben en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 3070/3080 y similares.
- Cabe en GPU de consumo: sí. Q2_K y Q3_K_L funcionan en GPUs de 6-8 GB; incluso pueden ejecutarse íntegramente en CPU con 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM es limitado y no cubre todos los tipos de cuantización, por lo que conviene verificar la compatibilidad antes de usarlo. El repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponible. No se han publicado mediciones. A modo cualitativo, las cuantizaciones de 2-3 bits reducen el uso de memoria y aumentan el throughput por nodo a cambio de una degradación de calidad, y la ejecución en CPU implica latencias muy superiores a la ejecución en GPU.

## Comparativa con modelos similares

Los datos de las alternativas proceden de fuentes públicas de referencia y no de la información proporcionada en esta ficha; se incluyen solo para situar el tamaño y el régimen de licencia.

| Modelo | Parametros | Contexto | Licencia | GGUF disponible | Notas |
|---|---|---|---|---|---|
| Haumea-1.5 (este repo) | ~7,25B | no disponible | no disponible | Si (Q2_K, Q3_K_L, f16) | Sin benchmarks publicados; 0 descargas |
| Mistral-7B-v0.3 | ~7,25B | 32k | Apache 2.0 | Si | Licencia permisiva, ampliamente adoptado |
| Llama-3.1-8B | ~8,03B | 128k | Llama 3.1 Community License | Si | Requiere cumplir la política de uso aceptable |
| Qwen2.5-7B | ~7,6B | 32k nativo (ampliable con YaRN) | Apache 2.0 en la mayoría de variantes | Si | Buen soporte multilingüe |

En rendimiento no es posible establecer comparación: no hay métricas publicadas de Haumea-1.5 en la información disponible, frente a alternativas con resultados extensamente documentados en sus propias model cards.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explícita, no hay certeza de que el uso comercial esté permitido. Es un bloqueo potencial para producción; conviene contactar con el autor del modelo base antes de integrarlo.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, lo que impide justificar su elección frente a alternativas consolidadas.
- Modelo base opaco: no se documentan arquitectura, dataset, proceso de alineación ni longitud de contexto, lo que dificulta predecir su comportamiento fuera de distribución.
- Ventana de contexto desconocida: cualquier diseño que dependa de contexto largo (RAG con muchos fragmentos, diálogos extensos) es inviable sin confirmar este dato.
- Solo inglés: el repositorio declara únicamente el idioma `en`; no hay garantía de comportamiento aceptable en castellano ni en otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala, agravado por la falta de documentación sobre el entrenamiento y por la ausencia de evaluaciones de fidelidad.
- Degradación por cuantización: Q2_K y Q3_K_L son formatos de 2-3 bits que típicamente introducen pérdida de calidad medible; el autor advierte que el f16 es "overkill" y no hay cuantizaciones ponderadas ni imatrix que mitiguen esa pérdida.
- Cuantizaciones incompletas: la lista interna de la model card menciona tipos (Q4_K_M, Q5_K_M, Q6_K, Q8_0, IQ4_XS, entre otros) que no aparecen como ficheros publicados; verifica los ficheros realmente disponibles antes de planificar descargas.
- Adopción nula: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad y de informes de fallos.
- Metadatos inconsistentes: la fecha de creación indicada (2026-09-19) es posterior a la fecha actual, lo que sugiere un problema de metadatos en el repositorio; conviene verificar la integridad de los ficheros descargados.
- Repositorio de 64 GB: la descarga completa incluye los tres ficheros; planifica el espacio en disco antes de clonar.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Haumea-1.5-GGUF
- Modelo base: https://huggingface.co/HaumeaAI/Haumea-1.5
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Haumea-1.5-GGUF
- Fichero Q2_K: https://huggingface.co/mradermacher/Haumea-1.5-GGUF/resolve/main/Haumea-1.5.Q2_K.gguf
- Fichero Q3_K_L: https://huggingface.co/mradermacher/Haumea-1.5-GGUF/resolve/main/Haumea-1.5.Q3_K_L.gguf
- Fichero f16: https://huggingface.co/mradermacher/Haumea-1.5-GGUF/resolve/main/Haumea-1.5.f16.gguf
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre Haumea-1.5 ni sobre su autor; los unicos enlaces utiles son los del propio repositorio de HuggingFace y los referenciados en su model card.
