# mradermacher/Webcoda-AI-27B-GGUF

## Resumen

Webcoda-AI-27B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo base hardin/Webcoda-AI-27B, publicadas por el usuario mradermacher. El modelo original es un transformer de aproximadamente 26.900 millones de parámetros (26,9B) afinado con LoRA y posteriormente fusionado, construido a partir de una base identificada en los tags como qwen3.5. Está orientado a tareas de asistente de conocimiento (knowledge-assistant) y conversación, y esta colección facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicación radica en que pone a disposición del ecosistema local un conjunto amplio de cuantizaciones (desde Q2_K hasta Q8_0, además de variantes IQ4_XS y ficheros mmproj multimodales), lo que permite ejecutar un modelo de casi 27B en hardware de consumo con compromisos controlados de calidad. El repositorio ocupa 187,9 GB en total por acumular todas las variantes, aunque cada cuantización individual pesa entre 10,8 y 28,7 GB.

Se trata de una cuantización, no de un modelo nuevo: no aporta mejoras de capacidad respecto al original, sino que reproduce su comportamiento con precisión reducida. La información pública sobre el modelo base es escasa, por lo que muchos datos técnicos (contexto, dataset de entrenamiento, benchmarks) figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base identificada como qwen3.5; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | other (no se detallan terminos) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de aproximadamente 26,9B parámetros, según los tags derivado de qwen3.5, y afinado mediante LoRA que posteriormente se fusionó con los pesos base (tag lora-merged). No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de lo que herede de la arquitectura base.

Esta publicación concreta no entrena nada: aplica cuantización estática (quantize_version 2, output_tensor_quantised 1) sobre los pesos convertidos a formato Hugging Face y genera los ficheros GGUF con llama.cpp. Se incluyen ficheros mmproj (proyección multimodal) en Q8_0 y f16, lo que sugiere que el modelo base incorpora capacidad de visión, aunque no se detalla su funcionamiento. Existe además una variante con cuantizaciones ponderadas/imatrix publicada en un repositorio separado (Webcoda-AI-27B-i1-GGUF).

## Capacidades

- Generación de texto conversacional en inglés, orientada a asistencia de conocimiento.
- Capacidad multimodal potencial: la presencia de ficheros mmproj indica soporte de entrada de imágenes, aunque no se documenta el alcance.
- Razonamiento y respuesta a preguntas sobre dominios de conocimiento (por el tag knowledge-assistant).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente de conocimiento local: desplegar la cuantización Q4_K_M (16,6 GB) en una estación de trabajo con GPU de 24 GB para responder consultas sobre documentación interna, aprovechando el enfoque knowledge-assistant del modelo.
- Chat conversacional en el borde: usar Q3_K_M o IQ4_XS (13-15 GB) en equipos con VRAM moderada para mantener conversaciones multi-turno sin depender de la nube.
- Procesamiento de documentos con imágenes: emplear los ficheros mmproj junto con una cuantización de pesos para extraer información de capturas o escaneos, si el modelo base confirma sus capacidades de visión.
- Prototipado rápido de aplicaciones: integrar el GGUF en llama.cpp u Ollama para validar flujos de asistente antes de invertir en infraestructura mayor.
- Investigación sobre cuantización: comparar la degradación de calidad entre Q2_K y Q8_0 sobre el mismo modelo para estudiar el impacto de la precisión reducida en tareas de conocimiento.
- Despliegue en entornos aislados (air-gapped): ejecutar el modelo sin conexión externa en Q4_K_S (15,7 GB) para organizaciones con requisitos de privacidad estrictos.
- Evaluación comparativa de modelos de ~27B: usar la variante Q8_0 (28,7 GB) como referencia de alta fidelidad frente a otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~11-13 GB; Q4_K_M ~17-19 GB; Q6_K ~23-25 GB; Q8_0 ~29-32 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; A100 40 GB o H100 para Q8_0; RTX 3090/4080 para cuantizaciones Q3-Q4.
- Cabe en GPU de consumo: sí, en RTX 4090 con Q4_K_M o inferiores; en GPUs de 16 GB con Q3_K_S o Q2_K, o mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Webcoda-AI-27B-GGUF | ~26,9B | No disponible | GGUF | other | HuggingFace |
| Modelo base hardin/Webcoda-AI-27B | ~26,9B | No disponible | safetensors | other | HuggingFace |
| Webcoda-AI-27B-i1-GGUF | ~26,9B | No disponible | GGUF (imatrix) | other | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se garantiza rendimiento en castellano u otros idiomas.
- La licencia "other" no especifica términos; es imprescindible revisar las condiciones del modelo base antes de cualquier uso comercial.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; el propio autor marca Q3_K_M como "lower quality".
- No hay benchmarks publicados que permitan estimar fiabilidad o tasa de alucinación.
- La información sobre contexto máximo, entrenamiento y capacidades multimodales es incompleta.
- El repositorio completo ocupa 187,9 GB; conviene descargar solo la variante necesaria.
- Al ser una cuantización, hereda cualquier sesgo o limitación del modelo base, del que no se documentan detalles.
- Riesgo de alucinación inherente a modelos conversacionales sin datos de evaluación pública.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Webcoda-AI-27B-GGUF
- Modelo base: https://huggingface.co/hardin/Webcoda-AI-27B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Webcoda-AI-27B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Webcoda-AI-27B-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
