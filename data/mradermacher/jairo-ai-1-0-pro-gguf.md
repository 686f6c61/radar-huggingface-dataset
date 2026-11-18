# mradermacher/jairo-ai-1.0-pro-GGUF

## Resumen

jairo-ai-1.0-pro-GGUF es la versión cuantizada en formato GGUF del modelo jairo-ai-1.0-pro, publicado por el usuario mradermacher en Hugging Face. Se trata de una conversión estática realizada con herramientas de cuantización sobre los pesos originales del modelo base alojado en el repositorio LouieR09112/jairo-ai-1.0-pro. El modelo cuenta con aproximadamente 8.030 millones de parámetros (8B), lo que lo sitúa en la categoría de modelos de tamaño medio aptos para despliegue en hardware de consumo.

La relevancia de esta ficha radica en que el formato GGUF permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y derivados (Ollama, LM Studio, etc.), algo imposible con los pesos originales en safetensors si no se dispone de GPU de gama alta. El repositorio ocupa 51,1 GB e incluye múltiples niveles de cuantización, desde F16 hasta Q2_K, lo que ofrece un abanico amplio de compromisos entre calidad y consumo de memoria.

No obstante, la información pública disponible es muy escasa: no se especifican licencia, idiomas, pipeline ni detalles de arquitectura o entrenamiento más allá del recuento de parámetros. La model card únicamente documenta el proceso de cuantización, sin aportar datos sobre el modelo base. Cualquier evaluación rigurosa del modelo requerirá consultar el repositorio original o realizar pruebas empíricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.030.261.312 (~8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); original en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base jairo-ai-1.0-pro en la documentación proporcionada. El recuento de parámetros (8.030 millones) es compatible con un transformer denso de escala 8B, pero no se confirma el tipo de arquitectura (transformer, MoE, híbrida, SSM, etc.), ni la longitud de contexto nativa, ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

La única información técnica verificable corresponde al proceso de cuantización: la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversión desde pesos en formato Hugging Face (safetensors) a GGUF mediante la herramienta estándar de llama.cpp. Se generaron doce variantes de cuantización, incluyendo una cuantización IQ4_XS (importancia-based, 4 bits) además de las K-quants clásicas. No se documentan innovaciones arquitectónicas ni técnicas de decodificación específicas.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo multi-turno, aunque no se detallan sus capacidades exactas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructura de inferencia estándar compatible con la API de Hugging Face.
- Razonamiento, código, matemáticas y otras capacidades específicas: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Despliegue local en estación de trabajo: gracias a las cuantizaciones Q4_K_M y Q5_K_M, el modelo puede ejecutarse en una GPU de consumo con 8-12 GB de VRAM mediante llama.cpp u Ollama, permitiendo prototipar asistentes conversacionales sin depender de servicios en la nube.
- Experimentación e investigación: el conjunto de doce cuantizaciones permite estudiar la degradación de calidad entre F16 y Q2_K sobre un mismo modelo, útil para trabajos sobre cuantización y eficiencia de inferencia.
- Asistentes conversacionales autoalojados: la orientación conversacional del modelo base lo hace candidato para chatbots internos en entornos con requisitos de privacidad, siempre que se valide su calidad empíricamente.
- Integración en pipelines de CI/CD para pruebas de regresión: al poder ejecutarse en CPU con cuantizaciones bajas, puede incorporarse a tests automatizados de aplicaciones que consuman un LLM local.
- Evaluación comparativa de cuantizaciones: útil para medir perplejidad y calidad de respuesta entre variantes y elegir el punto óptimo de compromiso memoria/calidad en producción.
- Educación y demostraciones: el tamaño de 8B y la disponibilidad de GGUF facilitan su uso en talleres y cursos sobre despliegue de modelos open source en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de 8B):
  - F16: ~16 GB
  - Q8_0: ~8,5 GB
  - Q6_K: ~6,6 GB
  - Q5_K_M: ~5,7 GB
  - Q4_K_M: ~4,9 GB
  - Q3_K_M: ~4,0 GB
  - Q2_K: ~3,0 GB
- GPU recomendadas: A100 o H100 para F16 con contexto largo; RTX 4090 (24 GB) para Q8_0 o Q6_K con margen; RTX 3090/4080 (16-24 GB) para Q5_K_M o Q4_K_M.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB (Q8_0) hasta tarjetas de 6-8 GB con Q3_K_M o Q4_K_S. Las cuantizaciones Q2_K e IQ4_XS pueden ejecutarse incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| jairo-ai-1.0-pro-GGUF | ~8B | no disponible | no disponible | GGUF | Hugging Face |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Hugging Face, Ollama |
| Mistral 7B Instruct | 7,3B | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Hugging Face, Ollama |

La comparación se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento del modelo evaluado. Frente a las alternativas citadas, jairo-ai-1.0-pro carece de información pública sobre licencia y contexto, lo que dificulta su adopción en producción frente a modelos con documentación completa.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: no se puede determinar si el uso comercial está permitido; debe consultarse el repositorio original antes de cualquier despliegue productivo.
- Sin datos de benchmarks, idiomas ni contexto: imposible evaluar su calidad relativa frente a alternativas establecidas.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de alineación (RLHF/DPO) no se puede estimar su magnitud.
- Sesgos conocidos: no documentados; se desconoce la composición del dataset de entrenamiento.
- Procedencia del modelo base poco clara: el autor del repositorio original (LouieR09112) no aporta documentación técnica en la información disponible, lo que añade incertidumbre sobre el entrenamiento.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jairo-ai-1.0-pro-GGUF
- Modelo original: https://huggingface.co/LouieR09112/jairo-ai-1.0-pro
