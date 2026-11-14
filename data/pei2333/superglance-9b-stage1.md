# pei2333/SuperGlance-9B-Stage1

## Resumen

SuperGlance-9B-Stage1 es un modelo multimodal de tipo image-text-to-text obtenido al fusionar un adaptador LoRA de primera etapa sobre el modelo base Qwen/Qwen3.5-9B. Lo publica el usuario pei2333 en Hugging Face y forma parte de un pipeline de dos etapas cuyo segundo modelo es SuperGlance-9B-Stage2. La fusión aplica W′ = round_bf16(W + 2.0 · B·A) sobre los tensores del adaptador, dejando el resto de pesos intactos, y el resultado se carga con `AutoModelForImageTextToText` igual que el modelo base.

El modelo cuenta con 9.653.104.368 parámetros (9,65 mil millones) en formato safetensors, con un repositorio de 19,3 GB. Su propósito declarado es servir de punto de partida para la etapa 2 del pipeline SuperGlance, entrenada sobre 1.158.150 preguntas de opción múltiple procedentes de datasets de VQA, razonamiento espacial, gráficos y QA textual. Es relevante ahora porque representa un experimento de ajuste multimodal sobre la familia Qwen3.5, aunque su estado es embrionario: el repositorio es privado, no tiene descargas ni interacciones y sus términos de licencia están pendientes de decisión.

La información pública disponible es muy limitada: no se han publicado benchmarks, no se especifican idiomas soportados y la licencia figura como "superglance-pending", lo que impide determinar las condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (derivada de Qwen3.5-9B; detalles internos no disponibles) |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se desconoce si existen GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other, license_name: superglance-pending (términos pendientes) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es una fusión LoRA sobre Qwen/Qwen3.5-9B. La etapa 1 se entrenó sobre 1.158.150 preguntas de opción múltiple y el adaptador resultante se integró en los pesos del modelo base mediante la operación W′ = round_bf16(W + 2.0 · B·A), con un factor de escala de 2,0 aplicado al producto de las matrices del adaptador. El resto de tensores del modelo base permanece sin cambios, por lo que la arquitectura subyacente, la ventana de contexto y las capacidades del transformer original se conservan, aunque no se documentan en la model card.

Las fuentes de entrenamiento declaradas son SAT, GQA, TallyQA, ChartQA, AI2D y TextVQA; OpenImages en modalidad de elección de caja (box choice) y SpatialSense; además de 13 datasets de QA textual. Cada pregunta se presentó en ambos órdenes de opciones, con 500.000 muestras extraídas. No se especifica el número total de tokens de entrenamiento, la composición exacta por fuente ni si se aplicaron técnicas de RLHF o DPO. Los datos y el formato de las preguntas están publicados en el dataset SuperGlance-QA, y el código de entrenamiento en la release de código de SuperGlance.

## Capacidades

- Generación de texto e imagen-texto: pipeline declarado image-text-to-text, apto para responder preguntas sobre imágenes.
- Razonamiento visual sobre gráficos y diagramas: entrenado con ChartQA y AI2D.
- Razonamiento espacial y conteo: entrenado con SpatialSense, TallyQA y GQA.
- Elección de cajas delimitadoras: OpenImages box choice sugiere capacidad de selección de regiones.
- QA textual: 13 datasets de preguntas y respuestas en texto.
- Formato de opción múltiple: el ajuste se orienta a preguntas con opciones en ambos órdenes.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible (solo se confirma entrada imagen-texto).

## Casos de uso

- Evaluación de VQA académica: el modelo puede emplearse como baseline en benchmarks como TextVQA, ChartQA o AI2D, ya que fue ajustado explícitamente sobre ellos, para comparar el efecto de la fusión LoRA frente al Qwen3.5-9B original.
- Investigación sobre fusión de adaptadores: sirve para estudiar el impacto del escalado 2.0 en la fusión W′ = round_bf16(W + 2.0 · B·A) y su efecto en tareas multimodales, dado que es el punto de partida documentado de la etapa 2.
- Respuesta a preguntas sobre gráficos en entornos internos: con entrenamiento en ChartQA, puede prototiparse para extraer valores y tendencias de gráficos de barras o líneas en informes, siempre que se valide su precisión con datos propios.
- Conteo y razonamiento espacial en imágenes: TallyQA y SpatialSense lo orientan a tareas de conteo de objetos y relaciones espaciales, útil en prototipos de inspección visual o análisis de escenas.
- Selección de regiones de interés: la modalidad de box choice sobre OpenImages permite experimentar con tareas de localización aproximada de objetos mediante elección entre cajas candidatas.
- Generación de datos sintéticos de QA multimodal: al estar entrenado en formato de opción múltiple, puede usarse para etiquetar o ampliar conjuntos de preguntas en pipelines de anotación semiautomática, con revisión humana obligatoria.
- Base para fine-tuning de etapa 2: es el punto de partida declarado de SuperGlance-9B-Stage2, por lo que encaja en flujos de entrenamiento incremental sobre tareas visuales específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19,3 GB solo para pesos (9,65 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB.
- Cuantización a 8 bits: en torno a 10-11 GB de pesos, viable en GPUs de 16-24 GB.
- Cuantización a 4 bits: en torno a 5-6 GB de pesos, potencialmente ejecutable en GPUs consumer de 8-12 GB, aunque no se confirma soporte oficial de GGUF o GPTQ.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en producción; RTX 4090 (24 GB) para bf16 en una sola GPU; RTX 3090/4080 (16-24 GB) con cuantización.
- Cabe en GPU consumer: sí, en RTX 4090 en bf16 y en GPUs de 12-16 GB con cuantización, sujeto a verificación empírica.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` es el método documentado; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SuperGlance-9B-Stage1 | 9,65 B | no disponible | superglance-pending | Repo privado, 0 descargas | Fusión LoRA sobre Qwen3.5-9B, pipeline de 2 etapas |
| Qwen/Qwen3.5-9B | 9 B (aprox.) | no disponible | Apache-2.0 | Público | Modelo base; licencia permisiva y uso comercial permitido |
| SuperGlance-9B-Stage2 | no disponible | no disponible | no disponible | No disponible | Etapa 2 del mismo pipeline, aún no publicada |

La comparación con alternativas multimodales de tamaño similar (por ejemplo, la familia Qwen2.5-VL o Llava) no puede establecerse con rigor porque no hay benchmarks publicados para SuperGlance-9B-Stage1 ni datos de contexto e idiomas.

## Limitaciones y advertencias

- Licencia sin definir: "superglance-pending" impide cualquier uso comercial hasta que el autor publique los términos; el modelo base es Apache-2.0, pero los términos del dataset de entrenamiento se listan por fuente y pueden imponer restricciones adicionales.
- Repositorio privado y sin validación comunitaria: 0 descargas y 0 likes, sin evidencia externa de calidad.
- Sin benchmarks publicados: no hay métricas de MMLU, HumanEval, GSM8K ni de VQA que permitan estimar su rendimiento real.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en gráficos y conteo; requiere validación humana.
- Sesgos: no documentados; los datasets de origen (GQA, TextVQA, OpenImages) pueden introducir sesgos visuales y culturales.
- Idiomas y contexto: no especificados, lo que dificulta planificar su uso en producción multilingüe o con documentos largos.
- Especialización estrecha: el ajuste se limita a preguntas de opción múltiple; su comportamiento en diálogo abierto o generación libre no está caracterizado.
- Etapa intermedia: está diseñado como punto de partida de la etapa 2, no como modelo final; su uso directo en producción no está respaldado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/pei2333/SuperGlance-9B-Stage1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SuperGlance-QA: no disponible (referenciado en la model card sin URL)
- Release de código SuperGlance: no disponible (referenciado en la model card sin URL)
- Modelo de etapa 2 (SuperGlance-9B-Stage2): no disponible (referenciado en la model card sin URL)
