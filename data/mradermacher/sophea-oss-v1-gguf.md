# mradermacher/Sophea-OSS-v1-GGUF

## Resumen

Sophea-OSS-v1-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF publicado por el usuario mradermacher a partir del modelo base ayoubkirouane/Sophea-OSS-v1. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión a GGUF pensada para su ejecución en llama.cpp, Ollama y otros runners compatibles con este formato. El recuento de parámetros reportado por HuggingFace es de 20.914.757.184 (aproximadamente 20,9 mil millones).

La información pública disponible es muy escasa: la model card se limita a indicar los parámetros de la conversión (quantize_version 2, output_tensor_quantised 1, convert_type hf) y la lista de cuantizaciones generadas. No se documentan arquitectura, datos de entrenamiento, idiomas, licencia ni resultados de benchmarks, ni en el repositorio de cuantización ni en la información recabada en la búsqueda web.

Su relevancia actual es, por tanto, operativa: ofrece hasta trece variantes de cuantización (desde x-f16 hasta Q2_K e IQ4_XS) que permiten desplegar un modelo de ~21.000 millones de parámetros en hardware muy distinto, siempre que el usuario valide previamente la calidad y las capacidades del modelo base, sobre el que no hay documentación verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la model card ni en la información disponible) |
| Parámetros totales | 20.914.757.184 (~20,9 mil millones), según metadatos safetensors de HuggingFace |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas derivadas de un modelo en formato HuggingFace, convert_type: hf) |

Datos adicionales de la conversión: quantize_version 2, output_tensor_quantised 1, skip_mmproj (no se indica si existe proyector multimodal; el campo aparece vacío). Tamaño del repositorio: 71,2 GB. Etiquetas declaradas: gguf, endpoints_compatible, region:us, conversational.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. La model card del repositorio GGUF no incluye ningún apartado descriptivo: únicamente contiene los comentarios técnicos de la herramienta de conversión y la referencia al modelo de origen, ayoubkirouane/Sophea-OSS-v1. En la información proporcionada tampoco se detallan número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o RLVR.

El único dato estructural fiable es el recuento de parámetros (20,9 mil millones) y la etiqueta "conversational", que sugiere un ajuste orientado a diálogo. Se desconoce si se trata de un transformer denso, de una arquitectura de mezcla de expertos (MoE) o de un modelo híbrido; esta distinción es crítica porque condiciona los requisitos de VRAM y la latencia de inferencia. Cualquier afirmación adicional sobre el entrenamiento o sobre innovaciones técnicas (atención lineal, decodificación especulativa, modos de razonamiento) sería especulativa y no debe tomarse como validada.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational", lo que indica un ajuste orientado a diálogo multi-turno. No hay documentación sobre la calidad real de estas respuestas.
- Compatibilidad con HuggingFace Inference Endpoints: la etiqueta "endpoints_compatible" indica que el repositorio puede desplegarse mediante el endpoint gestionado de HuggingFace con el runtime de llama.cpp.
- Ejecución local mediante llama.cpp y derivados: el formato GGUF permite inferencia en CPU con cuantizaciones bajas, GPU con offload parcial o total, y runners como Ollama, LM Studio o text-generation-webui.
- Capacidades de razonamiento, código, matemáticas, visión o audio: no disponible; no hay información publicada al respecto.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Despliegue conversacional autoalojado: al tratarse de un modelo etiquetado como conversacional y distribuido en GGUF, puede levantarse con llama.cpp u Ollama en servidores propios para construir un asistente de chat sin depender de APIs externas. Requiere validar antes la calidad de las respuestas, ya que no hay benchmarks publicados.
- Inferencia en hardware de gama de consumo: las variantes Q4_K_M, IQ4_XS y Q3_K_M permiten cargar un modelo de 20,9 mil millones de parámetros en GPUs con 12-16 GB de VRAM o en configuraciones mixtas CPU/GPU, algo inviable con los pesos en FP16.
- Prototipado rápido de aplicaciones de chat: con Ollama o llama.cpp se puede integrar el modelo en un prototipo en cuestión de minutos, usando la cuantización Q5_K_M o Q6_K si se busca un equilibrio entre calidad y tamaño.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece trece variantes del mismo modelo, lo que permite medir la degradación de calidad entre Q8_0, Q5_K_M, Q4_K_M y Q2_K sobre un conjunto de pruebas propio antes de fijar una cuantización para producción.
- Generación de texto en pipelines por lotes sin requisitos de baja latencia: tareas de resumen, reformulación o clasificación sobre volúmenes moderados de texto, ejecutadas en CPU con cuantizaciones Q4 o Q3, donde el coste por token prima sobre la latencia.
- Base para ajuste fino o destilación: si el modelo base resulta adecuado, sus pesos pueden servir como punto de partida para LoRA o para generar datos sintéticos en dominios específicos; conviene comprobar antes la licencia, que no está declarada.
- Integración en Inference Endpoints de HuggingFace: gracias a la etiqueta endpoints_compatible, puede desplegarse como endpoint gestionado para servicios internos que necesiten una API HTTP compatible con el ecosistema HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni la búsqueda web realizada aportan métricas de MMLU, HumanEval, GSM8K, MT-Bench o similares, ni para el modelo cuantizado ni para el modelo base. Tampoco se han publicado comparativas de perplejidad por tipo de cuantización.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros (20,9 mil millones), asumiendo pesos mayoritariamente densos. Si el modelo base fuese una arquitectura MoE con pocos parámetros activos, el consumo de memoria sería el mismo pero el throughput por token podría ser bastante mayor.

- VRAM estimada para inferencia (solo pesos):
  - x-f16: ~42 GB
  - Q8_0: ~22 GB
  - Q6_K: ~17 GB
  - Q5_K_M / Q5_K_S: ~14-15 GB
  - Q4_K_M / Q4_K_S: ~12-13 GB
  - IQ4_XS: ~11-12 GB
  - Q3_K_L / Q3_K_M / Q3_K_S: ~9-11 GB
  - Q2_K: ~8 GB
- GPU recomendadas: H100 80 GB o A100 80 GB para FP16 sin cuantizar; A100 40 GB, L40S 48 GB o RTX 6000 Ada para Q8_0; RTX 4090 24 GB, RTX 3090 24 GB o A6000 48 GB para Q5/Q6; RTX 4080 16 GB, RTX 4070 Ti Super 16 GB o RTX 3080 12 GB para Q4.
- ¿Cabe en GPU de consumo? Sí, con cuantizaciones Q4 o inferiores en GPUs de 12-16 GB; en GPUs de 8 GB solo con Q2_K y dejando poco margen para el contexto, o con offload parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, text-generation-webui, koboldcpp, e Inference Endpoints de HuggingFace con runtime GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles. Dependen del tamaño activo del modelo, del hardware, del tamaño de contexto y del número de capas descargadas a CPU, por lo que deben medirse en el entorno de destino.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Sophea-OSS-v1, por lo que la comparación se limita a características estructurales y de licencia. Los datos de los modelos comparables proceden de su documentación pública.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Sophea-OSS-v1 (este modelo) | 20,9 mil millones | no disponible | no disponible | Sí (13 cuantizaciones) | Arquitectura, idiomas y benchmarks no documentados |
| gpt-oss-20b | 21 mil millones totales, 3,6 mil millones activos (MoE) | 128 000 tokens | Apache 2.0 | Sí | Arquitectura MoE, por lo que el throughput difiere del de un modelo denso del mismo tamaño |
| Mistral Small 3.1 24B | 24 mil millones | 128 000 tokens | Apache 2.0 | Sí | Modelo denso, ampliamente documentado y con benchmarks públicos |
| Qwen3-14B | 14 mil millones | 32 768 tokens nativos, ampliables a 131 072 con YaRN | Apache 2.0 | Sí | Menor número de parámetros, con datos de rendimiento publicados |

El paralelismo en número de parámetros con gpt-oss-20b es llamativo, pero no hay ninguna confirmación de que Sophea-OSS-v1 derive de esa arquitectura; se trata únicamente de una coincidencia en el recuento total.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en el repositorio, no puede asumirse que el uso comercial esté permitido. Es imprescindible consultar el repositorio del modelo base (ayoubkirouane/Sophea-OSS-v1) antes de cualquier despliegue en producción.
- Ausencia total de documentación: se desconocen arquitectura, datos de entrenamiento, idiomas soportados y sesgos conocidos, lo que impide evaluar su idoneidad para dominios regulados.
- Sin benchmarks: no hay métricas publicadas que permitan estimar la calidad del modelo ni compararlo de forma objetiva con alternativas.
- Riesgo de alucinación: inherente a cualquier modelo generativo de esta escala; no puede cuantificarse sin evaluaciones específicas.
- Rendimiento multilingüe desconocido: al no declararse idiomas, no hay garantía de un comportamiento correcto en castellano u otras lenguas.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden degradar de forma apreciable la calidad y la coherencia, especialmente en tareas de razonamiento y código.
- Contexto desconocido: sin conocer la longitud de contexto soportada, no debe asumirse que el modelo gestione conversaciones largas o documentos extensos.
- Repositorio sin actividad: cero descargas y cero "me gusta" en el momento de la consulta, lo que reduce la probabilidad de encontrar informes de terceros sobre su comportamiento real.
- Conversión de terceros: al ser una cuantización estática, cualquier error introducido en la conversión afectaría a todas las variantes del repositorio.
- Los resultados de la búsqueda web realizada no guardan relación con el modelo (contenido culinario no relevante), por lo que no aportan información aprovechable.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Sophea-OSS-v1-GGUF
- Modelo base en HuggingFace: https://huggingface.co/ayoubkirouane/Sophea-OSS-v1
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
