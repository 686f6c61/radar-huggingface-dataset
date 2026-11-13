# mradermacher/Phi_mts_dialogue_clinical_note_GENHX-GGUF

## Resumen

Phi_mts_dialogue_clinical_note_GENHX-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo `emilykang/Phi_mts_dialogue_clinical_note_GENHX`, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo original está construido sobre la familia Phi de Microsoft y está especializado en la generación de notas clínicas a partir de diálogos médico-paciente, según se deduce de su nombre y de su orientación declarada al idioma inglés.

El modelo cuenta con 2.779.683.840 parámetros (aproximadamente 2,8 mil millones), lo que lo sitúa en la gama de modelos pequeños optimizados para despliegue en hardware modesto. El repositorio GGUF ofrece 12 variantes de cuantización que van desde Q2_K (1,2 GB) hasta f16 (5,7 GB), lo que permite ejecutar el modelo en GPUs de consumo e incluso en CPU con memoria RAM limitada.

La relevancia de esta ficha radica en que se trata de un modelo de dominio muy específico (documentación clínica) empaquetado para inferencia local, un caso de uso con implicaciones de privacidad importantes que justifican el despliegue on-premise. No obstante, la información pública disponible es muy limitada: no se detallan datos de entrenamiento, benchmarks ni licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Phi, presumiblemente transformer decoder-only) |
| Parametros totales | 2.779.683.840 (~2,8 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base presumiblemente en safetensors |
| Tamaño del repositorio | 25,0 GB |
| Librería declarada | transformers |
| Modelo base | emilykang/Phi_mts_dialogue_clinical_note_GENHX |
| Fecha de creación | 2025-02-28 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base en la información proporcionada. Por el nombre y el tamaño (2,8 B de parámetros), es plausible que se trate de un transformer decoder-only de la familia Phi (como Phi-2 o Phi-3-mini), pero este dato no está confirmado en la documentación disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La model card del repositorio GGUF es puramente operativa: describe el proceso de cuantización (quantize_version 2, output_tensor_quantised 1, convert_type hf) y enumera los ficheros generados, pero no aporta detalles sobre el entrenamiento del modelo original. Se indica que las cuantizaciones son estáticas y que existen versiones con imatrix (weighted/imatrix quants) en un repositorio separado. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en inglés, orientada específicamente a la redacción de notas clínicas a partir de diálogos.
- Presumible transformación de transcripciones de conversaciones médico-paciente en documentación clínica estructurada, según el nombre del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma declarada.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).
- Compatible con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con infraestructura de Hugging Face.

## Casos de uso

- Generación de notas clínicas en entornos sanitarios: el modelo se usaría para transformar transcripciones de consultas en borradores de notas SOAP (Subjetivo, Objetivo, Análisis, Plan), reduciendo la carga administrativa del personal médico. Su tamaño de 2,8 B permite ejecución local en el propio centro sanitario, lo que facilita el cumplimiento de requisitos de privacidad de datos de salud.
- Despliegue en equipos de sobremesa con GPU de consumo: con cuantizaciones Q4_K_M (1,8 GB) o Q5_K_M (2,1 GB), el modelo cabe en GPUs con 4-6 GB de VRAM, lo que permite prototipado rápido en estaciones de trabajo sin infraestructura dedicada.
- Investigación en NLP clínico: el modelo sirve como línea base para experimentos de summarización de diálogos médicos, comparación de estrategias de cuantización o evaluación de fidelidad factual en documentación sanitaria.
- Procesamiento por lotes de transcripciones en CPU: las cuantizaciones Q2_K (1,2 GB) y Q3_K_S (1,4 GB) permiten ejecutar el modelo en servidores sin GPU, útil para pipelines de procesamiento nocturno de grandes volúmenes de transcripciones.
- Integración en aplicaciones de dictado médico: combinado con un sistema de reconocimiento de voz, el modelo podría generar resúmenes estructurados de la consulta en tiempo casi real en hardware local.
- Evaluación de cuantizaciones para dominios especializados: dado que el repositorio ofrece 12 variantes, resulta útil para estudiar la degradación de calidad en tareas clínicas sensibles a la fidelidad (donde los errores de cuantización agresiva pueden ser críticos) y para comparar cuantizaciones estáticas frente a las versiones imatrix disponibles en el repositorio hermano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~1,2 GB; Q3_K_S ~1,4 GB; IQ4_XS ~1,6 GB; Q4_K_M ~1,8 GB; Q5_K_M ~2,1 GB; Q6_K ~2,4 GB; Q8_0 ~3,1 GB; f16 ~5,7 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput; también viable en Apple Silicon con Metal.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más de VRAM, e incluso en iGPUs con suficiente memoria compartida para cuantizaciones Q2/Q3.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server. Para el modelo base en safetensors, vLLM o TGI si la arquitectura es compatible (no confirmado).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi_mts_dialogue_clinical_note_GENHX (este) | ~2,8 B | no disponible | no disponible | GGUF | Especializado en notas clínicas, solo inglés |
| Phi-3-mini (Microsoft) | 3,8 B | 4K/128K (según variante) | MIT | safetensors, GGUF | Modelo generalista de la misma familia; contexto y licencia conocidos |
| Phi-2 (Microsoft) | 2,7 B | 2K | MIT | safetensors, GGUF | Predecesor generalista de tamaño comparable |
| Qwen2.5-3B (Alibaba) | 3,1 B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa multilingüe de tamaño similar con licencia permisiva |

La comparación con alternativas generalistas es solo orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa. La ventaja diferencial del modelo es su especialización en un dominio concreto (documentación clínica), mientras que sus desventajas son la falta de documentación sobre licencia, contexto y calidad.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Antes de cualquier despliegue en producción es imprescindible verificar la licencia del modelo base `emilykang/Phi_mts_dialogue_clinical_note_GENHX`.
- Sesgos conocidos: no documentados, pero al derivar de un modelo Phi entrenado predominantemente con datos en inglés, es probable que herede sesgos de ese corpus.
- Riesgo de alucinación: especialmente crítico en el dominio clínico, donde una nota mal generada puede contener información médica incorrecta. No se han publicado evaluaciones de fidelidad factual.
- Limitaciones de idioma: solo inglés declarado; no apto para documentación clínica en castellano sin evaluación previa.
- Longitud de contexto desconocida: limita la planificación de despliegues con transcripciones largas.
- Modelo de 2,8 B de parámetros: capacidad de razonamiento limitada en comparación con modelos de mayor tamaño; los errores en tareas de summarización médica pueden ser más frecuentes.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): pueden degradar la calidad en un dominio sensible a la precisión; se recomienda Q5_K_M o superior para uso clínico.
- No apto como dispositivo médico: no se documenta validación regulatoria alguna; su uso en entornos sanitarios requeriría supervisión humana y cumplimiento normativo (MDR, HIPAA/RGPD según jurisdicción).
- Ausencia de benchmarks: imposible estimar su calidad relativa frente a alternativas sin evaluación empírica propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phi_mts_dialogue_clinical_note_GENHX-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_mts_dialogue_clinical_note_GENHX
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Phi_mts_dialogue_clinical_note_GENHX-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Phi_mts_dialogue_clinical_note_GENHX-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
