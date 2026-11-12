# mradermacher/samantha-1.1-llama-7b-GGUF

## Resumen

Samantha-1.1-llama-7b-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo QuixiAI/samantha-1.1-llama-7b, publicadas por el usuario mradermacher. El modelo original es un ajuste fino (fine-tuning) de la familia Llama de 7B, entrenado sobre el dataset ehartford/samantha-data, un conjunto de conversaciones orientadas a un asistente personal con un tono empático y filosófico. El repositorio que nos ocupa no entrena el modelo, sino que lo empaqueta en múltiples niveles de cuantización para facilitar su ejecución en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 6.738.415.616 parámetros (aproximadamente 6,7B) en equipos con recursos limitados, desde 2,6 GB en Q2_K hasta 13,6 GB en f16. Al estar basado en la arquitectura Llama, se beneficia del ecosistema maduro de inferencia (llama.cpp, Ollama, LM Studio, etc.) y de un formato de pesos ampliamente soportado. El modelo está orientado exclusivamente al inglés y su licencia figura como "other", lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

Se trata, por tanto, de una pieza de infraestructura más que de un modelo novedoso: un artefacto de cuantización que hereda las capacidades y limitaciones del fine-tuning original de Samantha, pensado para desarrolladores que quieran desplegar un asistente conversacional ligero en local sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Llama con 6.738.415.616 parámetros, es decir, la variante de aproximadamente 7B. El repositorio GGUF no aporta información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Lo único documentado es que el fine-tuning se realizó sobre el dataset ehartford/samantha-data, un corpus de conversaciones en inglés diseñado para dotar al modelo de una personalidad de asistente personal con tono cercano y reflexivo.

La innovación técnica de esta publicación no reside en la arquitectura, sino en el proceso de cuantización. mradermacher genera cuantizaciones estáticas (no imatrix) con distintos niveles de compresión, desde Q2_K hasta f16, y ofrece además una variante con cuantización ponderada/imatrix en un repositorio separado (samantha-1.1-llama-7b-i1-GGUF). El proceso de conversión parte del modelo en formato Hugging Face (convert_type: hf) y produce archivos GGUF compatibles con llama.cpp. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con un estilo de asistente personal empático y reflexivo heredado del dataset Samantha.
- Razonamiento de propósito general y respuesta a preguntas, limitado por el tamaño de 7B del modelo base.
- Capacidad de mantener conversaciones multi-turno, aunque la longitud de contexto no está documentada en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en un portátil con GPU de consumo, ofreciendo respuestas con un tono empático adecuado para prototipos de asistentes personales sin conexión a Internet.
- Prototipado de chatbots con personalidad: gracias al ajuste fino sobre samantha-data, es útil para experimentar con sistemas conversacionales que requieran un registro cercano y filosófico, antes de invertir en modelos mayores.
- Evaluación de cuantizaciones: el repositorio ofrece doce niveles de cuantización, lo que permite medir el impacto de la compresión en la calidad de las respuestas y elegir el equilibrio adecuado entre tamaño y fidelidad para un caso concreto.
- Educación e investigación: sirve como banco de pruebas para estudiar el comportamiento de modelos Llama de 7B ajustados con datos conversacionales en entornos con recursos limitados.
- Despliegue en dispositivos con poca VRAM: la variante Q2_K (2,6 GB) permite ejecutar el modelo en GPUs de gama baja o incluso en CPU, útil para demos y entornos embebidos.
- Generación de texto creativo en inglés: el estilo del fine-tuning puede aprovecharse para redacción de diálogos, guiones o contenido narrativo con un tono conversacional.
- Integración en pipelines de inferencia locales: al ser GGUF, se integra con llama.cpp, Ollama y LM Studio, facilitando su uso en flujos de trabajo de desarrollo sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB para Q2_K, 4-5 GB para Q4_K_M, 5-6 GB para Q6_K y 8-9 GB para Q8_0, considerando overhead de contexto y runtime.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para las cuantizaciones más altas; A100 o H100 no son necesarias para un modelo de 7B.
- Cabe en GPU de consumo: sí, desde GPUs con 4 GB de VRAM (Q2_K/Q3) hasta 8-12 GB para cuantizaciones altas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero el repositorio GGUF está pensado para llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/samantha-1.1-llama-7b-GGUF | 6.738.415.616 | no disponible | other | GGUF | Cuantizaciones de un fine-tuning conversacional en inglés |
| QuixiAI/samantha-1.1-llama-7b | 6.738.415.616 | no disponible | other | safetensors | Modelo base del que derivan estas cuantizaciones |
| Llama 2 7B (Meta) | ~6,7B | 4096 | Llama 2 license | safetensors, GGUF | Modelo generalista base, sin fine-tuning conversacional específico |
| Mistral 7B (Mistral AI) | ~7,2B | 8192 | Apache 2.0 | safetensors, GGUF | Alternativa generalista con licencia permisiva y mayor contexto documentado |

La comparación con Llama 2 7B y Mistral 7B es orientativa: no se dispone de datos de benchmarks de Samantha que permitan una comparación cuantitativa. La principal diferencia es que Samantha incorpora un fine-tuning conversacional específico, mientras que los otros son modelos base o instruct generalistas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Llama y de un dataset conversacional en inglés, es probable que herede sesgos del corpus original, pero no se aportan datos concretos.
- Riesgo de alucinación: presente como en cualquier modelo de 7B; no se han publicado evaluaciones de fidelidad factual.
- Limitaciones de contexto o idioma: el modelo está entrenado y documentado únicamente en inglés; la longitud de contexto no está especificada, lo que impide garantizar conversaciones largas.
- Restricciones de licencia: la licencia figura como "other", lo que obliga a consultar los términos del modelo base QuixiAI/samantha-1.1-llama-7b y, en última instancia, de Llama, antes de cualquier uso comercial.
- Caveat para producción: el repositorio es una cuantización de terceros, no el modelo oficial; la calidad de las cuantizaciones bajas (Q2_K, Q3_K_S) puede degradar notablemente las respuestas.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran function calling sin una capa adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/samantha-1.1-llama-7b-GGUF
- Modelo base: https://huggingface.co/QuixiAI/samantha-1.1-llama-7b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/samantha-1.1-llama-7b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#samantha-1.1-llama-7b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ehartford/samantha-data
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
