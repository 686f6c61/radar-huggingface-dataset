# mradermacher/Mistral-Small-2501-Interleaved-36B-GGUF

## Resumen

Mistral-Small-2501-Interleaved-36B-GGUF es una distribución de pesos cuantizados en formato GGUF del modelo TheDrummer/Mistral-Small-2501-Interleaved-36B, publicado por mradermacher. El modelo base es un ajuste fino comunitario sobre Mistral Small 2501, la iteración de enero de 2025 de la familia Mistral Small de Mistral AI, con un total de 36.910.535.680 parámetros según los safetensors del repositorio. El sufijo "Interleaved" indica que el ajuste fino emplea un formato de conversación intercalado, orientado a diálogo multi-turno.

El repositorio proporciona únicamente cuantizaciones estáticas (sin imatrix ni weighted quants disponibles en el momento de la publicación), abarcando desde Q2_K (13,9 GB) hasta Q8_0 (39,3 GB), lo que permite desplegar un modelo de ~37B parámetros en hardware consumer de gama alta mediante llama.cpp y derivados. El tamaño total del repositorio es de 251,9 GB, reflejando la suma de todas las variantes publicadas.

La relevancia de esta ficha radica en que permite evaluar rápidamente una opción de despliegue local de un modelo de escala media-grande con licencia y contexto no declarados en la información disponible, algo crítico para decisiones de producción. No se dispone de información sobre pipeline, licencia ni longitud de contexto en los metadatos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Mistral Small 2501; arquitectura transformer presumible, no confirmada en la informacion) |
| Parametros totales | 36.910.535.680 (~36,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base en la documentación proporcionada. El modelo deriva de TheDrummer/Mistral-Small-2501-Interleaved-36B, un ajuste fino comunitario sobre Mistral Small 2501 (enero de 2025). El término "Interleaved" sugiere un entrenamiento orientado a conversaciones con turnos intercalados, típico de datasets de diálogo multi-turno, pero no se confirman detalles sobre el dataset, número de tokens, ni si se aplicaron etapas de RLHF o DPO.

La contribución técnica de esta ficha es exclusivamente la cuantización: mradermacher aplica cuantizaciones estáticas (convert_type hf, quantize_version 2, output_tensor_quantised 1) sin variantes imatrix/weighted. No se documentan innovaciones arquitectónicas adicionales (attention linear, decodificación especulativa, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno por el formato "Interleaved".
- Razonamiento y generación de código: capacidades presumibles por herencia de Mistral Small 2501, no verificadas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el tag `en`.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Despliegue local de chat conversacional en inglés: el modelo puede servirse con llama.cpp u Ollama usando Q4_K_M (22,5 GB) en GPUs consumer de 24 GB, aprovechando el formato intercalado para conversaciones multi-turno.
- Asistente de escritura técnica en inglés: con Q5_K_M (26,3 GB) en una RTX 4090 o A6000, se obtiene mayor fidelidad para redacción y reescritura de documentación.
- Prototipado de pipelines de diálogo sin dependencia de API: al estar en GGUF, se integra en entornos air-gapped mediante llama.cpp, evitando latencia de red y costes por token.
- Evaluación comparativa de ajustes finos comunitarios: sirve como referencia para medir el impacto de cuantizaciones Q4/Q5 frente a Q8_0 en tareas de conversación.
- Generación de respuestas en sistemas de FAQ: con Q3_K_M (18,0 GB) cabe en GPUs de 24 GB junto a otros procesos, adecuado para cargas moderadas.
- Fine-tuning posterior o destilación: al disponer del modelo base en safetensors, se puede usar como profesor para generar datos sintéticos en inglés antes de cuantizar para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~14 GB; Q3_K_M ~18 GB; IQ4_XS ~20 GB; Q4_K_M ~22,5 GB; Q5_K_M ~26,3 GB; Q6_K ~30,4 GB; Q8_0 ~39,3 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_S; A6000 (48 GB) o A100 40/80 GB para Q6_K y Q8_0; H100 para despliegues concurrentes con Q8_0.
- Cabe en GPU consumer: sí, hasta Q4_K_M en 24 GB; Q5_K_M requiere 32 GB o reparto CPU/GPU.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio; vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo base en safetensors).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Small-2501-Interleaved-36B-GGUF (este) | ~36,9B | no disponible | no disponible | GGUF | Hugging Face |
| TheDrummer/Mistral-Small-2501-Interleaved-36B (base) | ~36,9B | no disponible | no disponible | safetensors | Hugging Face |
| Mistral Small 2501 (original) | no disponible en esta ficha | no disponible | no disponible | safetensors | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés según el tag `en`; no se garantiza calidad en castellano.
- Licencia no declarada: no se puede confirmar uso comercial sin consultar el modelo base TheDrummer/Mistral-Small-2501-Interleaved-36B y la licencia de Mistral Small 2501.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento que respalde afirmaciones de calidad.
- Cuantizaciones estáticas únicamente: no hay variantes imatrix/weighted, lo que puede implicar mayor perplejidad frente a quants ponderados de tamaño equivalente.
- Riesgo de alucinación: inherente a modelos de lenguaje; no cuantificado en esta ficha.
- Sesgos: no documentados; se heredan del ajuste fino comunitario y del modelo base.
- Contexto desconocido: no se puede planificar uso con ventanas largas sin verificar el modelo base.
- Repositorio de 251,9 GB: requiere planificación de almacenamiento si se descargan múltiples variantes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mistral-Small-2501-Interleaved-36B-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Mistral-Small-2501-Interleaved-36B
- Página de overview del autor: https://hf.tst.eu/model#Mistral-Small-2501-Interleaved-36B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad: https://www.nethype.de/huggingface_embed/quantpplgraph.png
