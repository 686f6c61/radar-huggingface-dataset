# mradermacher/Qwen3.8-27B-ScientificBM-GGUF

## Resumen

Qwen3.8-27B-ScientificBM es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) especializado en dominios biomédicos y bioinformáticos, desarrollado por el usuario Rumiii y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen3.5, orientado específicamente a la invocación de herramientas científicas (tool calling y function calling) contra servicios como NCBI, UniProt y Ensembl. La versión analizada aquí es la cuantización GGUF publicada por mradermacher, que facilita su despliegue en hardware de consumo mediante llama.cpp y Ollama.

El modelo resuelve el problema de la integración de modelos de lenguaje en flujos de trabajo bioinformáticos: en lugar de generar respuestas de memoria (con el riesgo de alucinación que ello conlleva), está entrenado para emitir llamadas estructuradas a APIs científicas y razonar sobre los resultados devueltos. Esta capacidad lo hace relevante para investigadores que necesitan automatizar consultas a bases de datos biológicas manteniendo trazabilidad y precisión.

La información disponible sobre el modelo es limitada: la model card original del autor base no está incluida en esta ficha, y no se han publicado detalles sobre arquitectura interna, longitud de contexto, datos de entrenamiento o benchmarks. Los datos técnicos que se presentan a continuación provienen de los metadatos de Hugging Face y de la model card de la cuantización GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3_5; se asume transformer, sin confirmar) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El tag `qwen3_5` sugiere que deriva de la familia Qwen3.5, y el tamaño de 27,3 mil millones de parámetros es consistente con un transformer denso (no se indica que sea una arquitectura MoE). El repositorio incluye archivos `mmproj` (multi-modal supplement), lo que indica que el modelo base incorpora capacidades multimodales, presumiblemente visión, aunque no se detalla su alcance.

En cuanto al entrenamiento, la única información disponible es que se utilizó el dataset `gxx27/BioTool`, lo que sugiere un ajuste fino supervisado orientado a la invocación de herramientas biomédicas. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con especialización en dominios biomédicos y bioinformáticos.
- Tool calling y function calling: el modelo está entrenado para emitir llamadas estructuradas a herramientas y APIs científicas.
- Integración con bases de datos biológicas: NCBI, UniProt y Ensembl aparecen como tags del modelo, lo que indica soporte para consultas a estos servicios.
- Razonamiento multi-paso orientado a flujos de investigación: la combinación de tool calling y razonamiento permite encadenar consultas y sintetizar resultados.
- Capacidades multimodales: la presencia de archivos `mmproj` en las cuantizaciones indica soporte de entrada multimodal (presumiblemente visión), aunque no se detalla en la información disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language` de los metadatos.
- No se dispone de información sobre modo de razonamiento explícito (thinking mode), soporte de audio u otras capacidades especiales.

## Casos de uso

- Automatización de consultas a NCBI: el modelo puede recibir una pregunta en lenguaje natural sobre secuencias genéticas o publicaciones y emitir llamadas estructuradas a la API de NCBI, interpretando la respuesta y presentando un resumen al investigador. Su entrenamiento específico en tool calling reduce la necesidad de ingeniería de prompts para forzar el formato de llamada.
- Análisis de proteínas con UniProt: un investigador puede solicitar información funcional sobre una proteína y el modelo genera la consulta adecuada a UniProt, procesa los resultados y los integra en un informe. La especialización en bioinformática mejora la precisión de los parámetros de consulta frente a un modelo generalista.
- Anotación genómica con Ensembl: el modelo puede utilizarse para consultar regiones genómicas, genes ortólogos o variantes, automatizando tareas repetitivas de anotación que de otro modo requerirían scripting manual contra la API de Ensembl.
- Asistente de investigación en pipelines de bioinformática: integrado en un entorno de agentes, el modelo puede orquestar secuencias de llamadas a múltiples bases de datos (NCBI, UniProt, Ensembl) para responder preguntas complejas que requieren cruzar información de varias fuentes.
- Extracción de información de literatura científica: dado su entrenamiento en el dominio biomédico, puede emplearse para resumir abstracts, extraer entidades (genes, proteínas, enfermedades) y estructurar información de publicaciones, combinándolo con herramientas de búsqueda bibliográfica.
- Despliegue local para investigación con datos sensibles: al estar disponible en formato GGUF y con licencia Apache 2.0, puede ejecutarse en infraestructura propia (workstations con GPU de consumo) sin enviar datos a servicios externos, lo que es relevante para investigación con datos clínicos o genómicos restringidos.
- Prototipado de agentes científicos: desarrolladores que construyen asistentes de investigación pueden usar este modelo como componente de razonamiento y llamada a herramientas, aprovechando su ajuste específico para el dominio y su compatibilidad con endpoints (tag `endpoints_compatible`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaños de cuantización publicados):
  - Q2_K: aproximadamente 11,0 GB de pesos; requiere alrededor de 12-14 GB de VRAM con overhead de contexto.
  - Q3_K_M: aproximadamente 13,6 GB; requiere alrededor de 15-17 GB.
  - Q4_K_M: aproximadamente 16,9 GB; requiere alrededor de 18-20 GB. Es la cuantización recomendada por el autor de la cuantización para equilibrio calidad/velocidad.
  - Q5_K_M: aproximadamente 19,6 GB; requiere alrededor de 21-23 GB.
  - Q6_K: aproximadamente 22,5 GB; requiere alrededor de 24-26 GB.
  - Q8_0: aproximadamente 29,1 GB; requiere alrededor de 31-33 GB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Para Q8_0 se recomienda una A100 40 GB, L40S 48 GB o H100. Para Q2_K/Q3_K, GPU de 16 GB como RTX 4080 o RTX 4070 Ti Super pueden ser suficientes.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q4_K_M en GPUs de 16-24 GB. Las cuantizaciones Q5 y superiores requieren GPUs de 24 GB o más, con posible offloading parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. No se dispone de información sobre soporte en vLLM o TGI para esta cuantización.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Qwen3.8-27B-ScientificBM (este) | 27,3 B | no disponible | Apache 2.0 | GGUF | Biomédica, tool calling científico |
| Qwen3.5 base (Rumiii/Qwen3.8-27B-ScientificBM) | 27,3 B (presumible) | no disponible | Apache 2.0 | safetensors (presumible) | Generalista, base del ajuste |
| Modelos biomédicos generalistas (p. ej., BioMistral, Meditron) | variable (7-70 B) | variable | variable | safetensors, GGUF | Biomédica, sin tool calling específico |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a características estructurales y de licencia. No se identifican en la documentación modelos directamente comparables con la misma combinación de tamaño (27 B), especialización biomédica y entrenamiento en tool calling contra NCBI, UniProt y Ensembl.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés (`language: en`). Su uso en castellano u otros idiomas no está garantizado y probablemente degradará la calidad de las respuestas y de las llamadas a herramientas.
- Sesgos: no se documentan evaluaciones de sesgo. Al ser un ajuste fino sobre un modelo base generalista con datos biomédicos, puede heredar sesgos del corpus de entrenamiento y del dataset BioTool, cuya composición no se detalla.
- Riesgo de alucinación: aunque el entrenamiento en tool calling mitiga parcialmente la generación de información factual sin respaldo, el modelo puede alucinar parámetros de consulta, interpretar erróneamente respuestas de APIs o inventar resultados si la herramienta falla. En contextos biomédicos, esto es crítico y requiere validación humana.
- Limitaciones de contexto: no se ha publicado la longitud de contexto del modelo. No se puede asumir que soporte ventanas largas sin confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se recomienda verificar la licencia del modelo base original (Rumiii/Qwen3.8-27B-ScientificBM) y de Qwen3.5, ya que las obligaciones de atribución pueden aplicar en cadena.
- Caveat para producción: la información técnica es escasa (sin benchmarks, sin especificación de contexto, sin detalles de entrenamiento). No se recomienda su despliegue en producción crítica sin una evaluación propia sobre el dominio de uso y sin verificar el comportamiento del tool calling contra las APIs reales.
- El repositorio tiene 190,8 GB, lo que refleja el conjunto completo de cuantizaciones; la descarga selectiva de un solo archivo GGUF es posible y recomendable.
- La fecha de creación del repositorio (2026-10-27) y la ausencia de likes (0) y de pipeline declarado sugieren un modelo reciente y con poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face (cuantización GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-ScientificBM-GGUF
- Modelo base: https://huggingface.co/Rumiii/Qwen3.8-27B-ScientificBM
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-ScientificBM-i1-GGUF
- Página de descarga del autor de las cuantizaciones: https://hf.tst.eu/model#Qwen3.8-27B-ScientificBM-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/gxx27/BioTool
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
