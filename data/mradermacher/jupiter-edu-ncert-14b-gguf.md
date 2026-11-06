# mradermacher/Jupiter-Edu-NCERT-14B-GGUF

## Resumen

Jupiter-Edu-NCERT-14B-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo AIwaala/Jupiter-Edu-NCERT-14B, publicada por el usuario mradermacher, conocido en Hugging Face por distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base es un transformer denso de 14.768.307.200 parámetros (aproximadamente 14,8 mil millones), orientado a tareas conversacionales y, por el nombre, vinculado al corpus educativo NCERT (libros de texto del National Council of Educational Research and Training de la India).

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 15B parámetros en hardware de consumo mediante cuantizaciones que van desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), sin necesidad de GPUs de datacenter. El repositorio tiene un tamaño total de 102 GB porque incluye todas las variantes de cuantización en un mismo espacio.

La información pública disponible es escasa: la model card del cuantizador se limita a listar los ficheros GGUF y no documenta arquitectura detallada, datos de entrenamiento, benchmarks ni licencia. La model card del modelo base no se ha incluido en la información proporcionada, por lo que muchos campos técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles) |
| Parametros totales | 14.768.307.200 (14,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Modelo base | AIwaala/Jupiter-Edu-NCERT-14B |
| Tamano del repositorio | 102,0 GB (todas las cuantizaciones) |
| Libreria declarada | transformers |
| Pipeline | No disponible |
| Fecha de creacion | 2026-02-11 |
| Ultima actualizacion | 2026-11-01 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base AIwaala/Jupiter-Edu-NCERT-14B en la documentación proporcionada. Por el recuento de parámetros (14,8B) y la librería declarada (transformers), se trata de un transformer denso de tipo decoder-only, pero no se especifican número de capas, dimensiones ocultas, mecanismo de atención ni tipo de tokenizador.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre del modelo sugiere un entrenamiento o ajuste fino sobre material educativo NCERT, pero esta inferencia no está confirmada en la información disponible. El cuantizador indica que las cuantizaciones son estáticas y que no se han generado variantes con imatrix (weighted/imatrix quants) en el momento de la publicación.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline declarado apuntan a un uso como asistente de chat.
- Modelo de lenguaje de propósito general con 14,8B parámetros: capacidad esperada de razonamiento y generación, aunque no se documentan evaluaciones específicas.
- Soporte multilingüe limitado al inglés según los metadatos (`language: en`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (9,1 GB) el modelo puede ejecutarse en una GPU de consumo de 12 GB o superior mediante llama.cpp u Ollama, lo que permite experimentar con un modelo de 14,8B sin infraestructura cloud.
- Asistencia educativa en inglés: dado el nombre del modelo y su orientación a NCERT, puede emplearse para responder preguntas sobre contenidos curriculares en inglés, siempre que se valide la calidad de las respuestas con fuentes oficiales.
- Prototipado de chatbots: el tag `conversational` y su naturaleza decoder-only lo hacen adecuado para construir prototipos de asistentes conversacionales en entornos de desarrollo con presupuesto limitado.
- Inferencia en CPU: las cuantizaciones Q2_K (5,9 GB) y Q3_K_S (6,8 GB) permiten ejecución en CPU con RAM suficiente, útil para pruebas offline o entornos sin GPU.
- Evaluación comparativa de cuantizaciones: el repositorio incluye once variantes, lo que facilita estudios de compromiso calidad/tamaño en un mismo modelo.
- Fine-tuning posterior sobre dominio educativo: al estar disponible el modelo base en safetensors, se puede ajustar y luego cuantizar de nuevo para despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado):
  - Q2_K: ~6-7 GB
  - Q3_K_S: ~7-8 GB
  - Q4_K_M: ~9-10 GB
  - Q5_K_M: ~11-12 GB
  - Q6_K: ~13-14 GB
  - Q8_0: ~16-17 GB
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M; RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; A100/H100 no necesarias para este tamaño.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB con Q4_K_M; para Q8_0 se recomienda 24 GB (RTX 3090/4090).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Jupiter-Edu-NCERT-14B-GGUF | 14,8B | No disponible | No disponible | GGUF | Hugging Face |
| Modelos densos de ~14B (p. ej. Qwen2.5-14B) | ~14,7B | 32K-128K (segun variante) | Apache 2.0 (Qwen2.5) | safetensors, GGUF | Hugging Face, Ollama |
| Modelos densos de ~13B (p. ej. Llama 2 13B) | 13B | 4K | Llama 2 Community | safetensors, GGUF | Hugging Face |

La comparación se limita a parámetros y disponibilidad porque no hay datos de rendimiento publicados para Jupiter-Edu-NCERT-14B. Los modelos citados como referencia son alternativas de tamaño similar ampliamente documentadas; no se dispone de benchmarks comparativos directos.

## Limitaciones y advertencias

- Ausencia de licencia documentada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor del modelo base antes de usarlo en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sin benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras evaluaciones, lo que impide comparar objetivamente con alternativas.
- Riesgo de alucinación: inherente a los modelos generativos; en un contexto educativo es especialmente crítico y requiere verificación humana.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede planificar su uso en conversaciones largas o documentos extensos.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S): pueden degradar notablemente la calidad; el propio autor marca Q3_K_M como "lower quality".
- Sin cuantizaciones imatrix: el autor indica que no están disponibles, lo que limita la calidad potencial frente a variantes ponderadas.
- Sesgos: no documentados; se desconocen los sesgos del corpus de entrenamiento.
- Modelo derivado de un tercero: la responsabilidad sobre datos de entrenamiento y procedencia recae en AIwaala, no en el cuantizador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Jupiter-Edu-NCERT-14B-GGUF
- Modelo base: https://huggingface.co/AIwaala/Jupiter-Edu-NCERT-14B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Jupiter-Edu-NCERT-14B-GGUF
- README de referencia sobre GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
