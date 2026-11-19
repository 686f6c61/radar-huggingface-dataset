# mradermacher/MobileWeave-8B-GGUF

## Resumen

MobileWeave-8B-GGUF es la versión cuantizada en formato GGUF del modelo MobileWeave-8B, publicado por el usuario mradermacher. Se trata de una conversión estática (sin imatrix) del modelo original de Maxnotmarx/MobileWeave-8B, un transformer de aproximadamente 8.190 millones de parámetros orientado a tareas conversacionales y de interacción con dispositivos móviles, según se deduce de su nombre y de la presencia de un suplemento multimodal (mmproj) en el repositorio.

El modelo original no incluye información pública sobre su arquitectura interna, datos de entrenamiento, licencia ni proceso de alineación en la información disponible. El repositorio de cuantizaciones ofrece un abanico de 13 variantes GGUF (desde Q2_K hasta f16, además de dos mmproj), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo modestas hasta estaciones de trabajo.

La relevancia de esta ficha radica en que documenta una opción de despliegue local de un modelo de 8B con capacidades multimodales declaradas (por la presencia de mmproj), si bien la falta de transparencia del modelo base limita seriamente cualquier evaluación rigurosa. No se han publicado benchmarks ni detalles técnicos verificables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalle exacto no disponible) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (conversión de safetensors del modelo base) |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura interna del modelo base Maxnotmarx/MobileWeave-8B. El recuento de parámetros (8.190.735.360) es consistente con un transformer denso de aproximadamente 8B, pero se desconoce el número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (full, sliding window, GQA) o si incorpora algún mecanismo híbrido.

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüismo), ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La presencia de archivos mmproj en el repositorio sugiere que el modelo base incorpora un codificador visual para entrada multimodal, pero no se detalla qué encoder utiliza ni cómo se fusionan las modalidades. La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1), sin quants ponderados por imatrix, lo que puede implicar una ligera pérdida de calidad frente a cuantizaciones con imatrix en los rangos bajos (Q2, Q3).

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: el repositorio incluye archivos `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de imágenes en el modelo base, aunque no se detalla el alcance.
- No se ha confirmado soporte de tool calling, function calling ni razonamiento multi-paso.
- No se ha confirmado capacidad de generación de código, matemáticas avanzadas ni modo de razonamiento explícito (thinking mode).
- Idiomas: únicamente inglés declarado; no se ha verificado soporte multilingüe.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura compatible con la API de Hugging Face.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M (5,1 GB) y Q5_K_M (6,0 GB), el modelo puede ejecutarse en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, útil para prototipado de asistentes conversacionales en inglés sin dependencia de la nube.
- Asistencia conversacional en inglés para aplicaciones de escritorio: el modelo puede integrarse en clientes de chat locales que requieran respuestas en inglés con latencia baja, usando la variante Q4_K_S (4,9 GB) marcada como "fast, recommended".
- Procesamiento de imágenes en local: los archivos mmproj permiten, en teoría, alimentar imágenes junto con texto en entornos con llama.cpp, adecuado para tareas de descripción o respuesta a preguntas visuales simples, aunque sin garantías de calidad al no haber benchmarks.
- Investigación sobre cuantización: el repositorio ofrece 13 variantes que permiten estudiar el impacto de la cuantización en la calidad de salida de un modelo de 8B, comparando Q2_K frente a Q8_0 en tareas controladas.
- Evaluación de modelos comunitarios: útil para investigadores que quieran auditar las capacidades reales de un modelo publicado sin model card detallada, sirviendo como caso de estudio sobre transparencia en el ecosistema open source.
- Integración en pipelines de inferencia con vLLM o TGI: la versión f16 (16,5 GB) puede cargarse en GPUs de 24 GB (RTX 4090, A10G) para servir el modelo a través de APIs compatibles con OpenAI, siempre que se valide previamente su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (sin contar overhead de contexto):
  - Q2_K: ~3,4 GB
  - Q3_K_M: ~4,2 GB
  - Q4_K_M: ~5,1 GB
  - Q5_K_M: ~6,0 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
  - Añadir ~0,9-1,3 GB si se usa el mmproj multimodal.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 (para f16 o Q8_0 con contexto amplio).
  - Profesional: A10G 24 GB, L4 24 GB, A100 40/80 GB (para servir múltiples instancias o contextos largos).
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6 GB hasta f16 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF experimental), TGI (con conversión previa a safetensors).
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MobileWeave-8B-GGUF | 8,19B | No disponible | No disponible | GGUF | Hugging Face (mradermacher) |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community | safetensors, GGUF | Hugging Face (Meta) |
| Mistral 7B Instruct v0.3 | 7,25B | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face (Mistral AI) |
| Qwen2.5 7B Instruct | 7,62B | 128K | Apache 2.0 | safetensors, GGUF | Hugging Face (Alibaba) |

La comparación se limita a parámetros y licencia, ya que no hay datos de rendimiento del modelo analizado. Frente a Llama 3.1 8B, Mistral 7B y Qwen2.5 7B, MobileWeave-8B carece de model card detallada, benchmarks públicos y licencia declarada, lo que lo sitúa en desventaja para uso en producción frente a alternativas con documentación completa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; en ausencia de licencia explícita, se debe asumir que no hay permiso claro para uso comercial.
- Ausencia total de benchmarks: no hay evidencia pública de calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales.
- Model card inexistente en el modelo base: se desconoce el proceso de entrenamiento, los datos utilizados y las técnicas de alineación, lo que impide evaluar sesgos y riesgos.
- Riesgo de alucinación no cuantificado: sin evaluación, no se puede estimar la tasa de alucinación en dominios factuales.
- Soporte limitado a inglés: no se ha verificado el rendimiento en castellano ni en otros idiomas.
- Contexto desconocido: se desconoce la ventana de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Cuantizaciones estáticas sin imatrix: las variantes de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad frente a cuants ponderados.
- Multimodalidad no verificada: la presencia de mmproj sugiere capacidad visual, pero no hay documentación sobre el encoder ni sobre el formato de prompt esperado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MobileWeave-8B-GGUF
- Modelo base: https://huggingface.co/Maxnotmarx/MobileWeave-8B
- Página de descargas del cuantizador: https://hf.tst.eu/model#MobileWeave-8B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
