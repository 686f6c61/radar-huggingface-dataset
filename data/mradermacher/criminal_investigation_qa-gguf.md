# mradermacher/criminal_investigation_QA-GGUF

## Resumen

criminal_investigation_QA-GGUF es la versión cuantizada en formato GGUF del modelo lifshallym/criminal_investigation_QA, un modelo de lenguaje de aproximadamente 8.030 millones de parámetros (8B) especializado en tareas de preguntas y respuestas sobre investigación criminal. La cuantización ha sido realizada por mradermacher, un conocido publicador de versiones GGUF de la comunidad, lo que facilita su despliegue en entornos con recursos limitados mediante herramientas como llama.cpp u Ollama. El modelo base está etiquetado como conversacional y orientado al idioma inglés.

El modelo resuelve el problema de disponer de un asistente conversacional de dominio específico (preguntas y respuestas sobre investigación criminal) en un formato optimizado para inferencia local. Al tratarse de una cuantización estática, el repositorio ofrece múltiples niveles de compresión que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB), permitiendo ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible.

La relevancia de esta ficha radica en que el modelo base no cuenta con una model card detallada ni con resultados de benchmarks publicados en la información disponible, por lo que la cuantización de mradermacher constituye la vía práctica más directa para evaluar y desplegar el modelo. El repositorio acumula 700 descargas y 2 likes, con licencia no especificada, lo que exige precaución antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmar) |
| Parametros totales | 8.030.261.248 (~8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base lifshallym/criminal_investigation_QA en la documentación proporcionada. Por el número de parámetros (~8B) y la librería declarada (transformers), se trata presumiblemente de un transformer decoder-only, pero no se confirma el tipo exacto de atención, la longitud de contexto ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se especifican los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La contribución técnica documentada en este repositorio es exclusivamente la cuantización estática realizada por mradermacher, que genera versiones GGUF del modelo original para inferencia eficiente. La model card indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación, y que las cuantizaciones estáticas se ofrecen ordenadas por tamaño, no necesariamente por calidad. Se recomienda consultar el repositorio del modelo base para obtener detalles sobre el entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, orientada a preguntas y respuestas sobre investigación criminal.
- Formato conversacional (etiqueta `conversational`), adecuado para diálogos multi-turno.
- Compatible con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con infraestructuras de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente de consulta para profesionales del ámbito criminalístico: el modelo puede responder preguntas técnicas sobre procedimientos de investigación, cadena de custodia o terminología forense, aprovechando su especialización de dominio y su formato conversacional.
- Formación y divulgación: uso como herramienta de apoyo en entornos educativos (criminología, derecho penal) para generar explicaciones y responder dudas de estudiantes en inglés.
- Prototipado de chatbots de nicho: al ser un modelo de 8B cuantizado, permite desplegar un asistente especializado en local sin depender de APIs externas, útil para validar productos verticales.
- Generación de material de estudio: creación de preguntas y respuestas de práctica sobre investigación criminal a partir de consultas del usuario, con la ventaja de ejecutarse en hardware de consumo.
- Análisis de documentación en inglés: resumen y extracción de información de informes o textos relacionados con investigación criminal, siempre que se validen las respuestas por el riesgo de alucinación.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_M (5,0 GB) o Q5_K_M (5,8 GB), puede ejecutarse en GPUs de consumo para tareas de asistencia conversacional de baja latencia.
- Integración en pipelines de inferencia locales: mediante llama.cpp u Ollama, para pruebas A/B de respuestas especializadas frente a modelos generalistas en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~3,3 GB de pesos; requiere al menos ~4 GB de VRAM para contexto corto.
  - Q4_K_M: ~5,0 GB de pesos; requiere ~6-7 GB de VRAM para contexto moderado.
  - Q6_K: ~6,7 GB de pesos; requiere ~8 GB de VRAM.
  - Q8_0: ~8,6 GB de pesos; requiere ~10 GB de VRAM.
  - f16: ~16,2 GB de pesos; requiere ~18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM usando Q4_K_M o inferiores; en GPUs de 6 GB solo con Q2_K/Q3_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI si la arquitectura lo permite (no confirmado).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas. Se indica "no disponible" para benchmarks y contexto. A modo orientativo por tamaño y formato:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| criminal_investigation_QA-GGUF | ~8B | no disponible | no disponible | GGUF | Especializado en QA de investigación criminal, solo inglés |
| Modelos generalistas de ~7-8B (p. ej., Llama 3.1 8B, Mistral 7B) | 7-8B | 8K-128K (según modelo) | licencias abiertas variables | GGUF, safetensors | Mayor contexto y benchmarks publicados, pero sin especialización de dominio |
| Modelos especializados de dominio similares | no disponible | no disponible | no disponible | no disponible | No se identifican alternativas comparables en la información proporcionada |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base lifshallym/criminal_investigation_QA antes de cualquier despliegue productivo.
- Riesgo de alucinación: al ser un modelo especializado sin benchmarks publicados, puede generar respuestas plausibles pero incorrectas en un dominio sensible como la investigación criminal.
- Idioma limitado al inglés: no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos sin verificar el contexto real del modelo base.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M están marcadas como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Ausencia de cuantizaciones imatrix/ponderadas: la model card indica que no estaban disponibles, lo que puede reducir la calidad frente a cuantizaciones ponderadas equivalentes.
- Sesgos conocidos: no documentados en la información disponible; se recomienda auditoría previa en un dominio sensible.
- Modelo de nicho con pocas descargas (700) y sin pipeline declarado: menor validación comunitaria y soporte limitado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/criminal_investigation_QA-GGUF
- Modelo base: https://huggingface.co/lifshallym/criminal_investigation_QA
- Página de descargas del cuantizador: https://hf.tst.eu/model#criminal_investigation_QA-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
