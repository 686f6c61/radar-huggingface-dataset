# mradermacher/Qwen3-8B-ZeroZero-Heretic-GGUF

## Resumen

Qwen3-8B-ZeroZero-Heretic-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo LastMachine/Qwen3-8B-ZeroZero-Heretic, publicada por el usuario mradermacher. El modelo subyacente es un derivado de Qwen3 de 8 000 millones de parámetros (8.190.735.360 parámetros reales según los safetensors) que ha sido modificado mediante técnicas de "abliteration" y "heretic" para reducir los mecanismos de rechazo y los filtros de seguridad del modelo original. El resultado es un modelo conversacional con una tasa de negativas notablemente inferior a la de un modelo estándar.

La relevancia de esta ficha radica en dos factores. Por un lado, ofrece una vía práctica para ejecutar un modelo de 8B en hardware de consumo mediante cuantizaciones que van desde 3,4 GB (Q2_K) hasta 16,5 GB (f16). Por otro, documenta un caso de modelo "uncensored" con guardrails reducidos, lo que exige una evaluación cuidadosa de los riesgos antes de cualquier despliegue en producción.

El repositorio tiene 68,8 GB de tamaño total, licencia Apache 2.0, y declara únicamente el idioma inglés. No se han publicado resultados de benchmarks ni datos sobre el proceso de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3), detalles no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es LastMachine/Qwen3-8B-ZeroZero-Heretic, un derivado de la familia Qwen3 de Alibaba. Según los tags del repositorio, ha sido sometido a técnicas de "abliteration" (eliminación o atenuación de direcciones de activación asociadas al rechazo) y etiquetado como "heretic" y "noslop", lo que indica una modificación deliberada para reducir la verbosidad de rechazo y los comportamientos de negativa del modelo original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el proceso de modificación.

La arquitectura concreta (número de capas, dimensión oculta, mecanismo de atención, uso de atención lineal o decodificación especulativa) no está documentada en la información proporcionada. El repositorio de mradermacher es exclusivamente de cuantización: no incluye entrenamiento adicional, sino la conversión del modelo base a formato GGUF mediante herramientas estándar (convert_type: hf, output_tensor_quantised: 1). No se han generado cuantizaciones ponderadas por imatrix según la propia model card.

## Capacidades

- Generación de texto conversacional en inglés, heredada de la familia Qwen3.
- Razonamiento y respuesta a instrucciones con una tasa de rechazo reducida respecto al modelo original.
- Modo conversacional multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades de código y matemáticas: presumibles por herencia de Qwen3, pero no verificadas en la información disponible.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo varía la tasa de rechazo tras aplicar abliteration, comparando sus respuestas con las del Qwen3-8B original en conjuntos de prompts sensibles. Es adecuado porque su reducción de guardrails es precisamente la variable de interés.
- Generación creativa sin restricciones editoriales: escritura de ficción, guiones o narrativa que aborde temas oscuros o controvertidos, donde un modelo estándar rechazaría la petición. Requiere revisión humana del contenido generado.
- Pruebas de robustez de filtros: usar el modelo como generador adversario para evaluar clasificadores de contenido o sistemas de moderación, aprovechando su menor tendencia a negarse a producir material sensible.
- Despliegue local en hardware de consumo: con la cuantización Q4_K_M (5,1 GB) puede ejecutarse en GPUs con 8 GB de VRAM o en CPU con llama.cpp, lo que lo hace útil para prototipos offline sin dependencia de API.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantización, lo que permite medir la degradación de perplejidad y calidad entre Q2_K y f16 en un mismo modelo base.
- Experimentos de destilación o generación de datos sintéticos: al tener menos restricciones de rechazo, puede generar datasets de entrenamiento con mayor cobertura temática, siempre con filtrado posterior.
- Chat conversacional en inglés para entornos controlados: uso interno donde el operador asume la responsabilidad del contenido y aplica sus propios filtros de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,4 GB; Q3_K_M ~4,2 GB; Q4_K_S ~4,9 GB; Q4_K_M ~5,1 GB; Q5_K_M ~6,0 GB; Q6_K ~6,8 GB; Q8_0 ~8,8 GB; f16 ~16,5 GB. Añadir entre 1 y 2 GB para el contexto KV cache según longitud de secuencia.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones Q4 a Q8; A100 o H100 solo si se busca throughput alto en f16 o despliegue multi-usuario.
- Cabe en GPU de consumo: sí, desde Q4_K_M en una RTX 3060 12 GB o incluso en GPUs de 8 GB con Q4_K_S. Las cuantizaciones Q2_K y Q3_K_S caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-ZeroZero-Heretic-GGUF (este) | 8,19 B | no disponible | Apache 2.0 | GGUF | Abliterated, uncensored, solo inglés |
| Qwen3-8B (original) | 8,2 B | no disponible | Apache 2.0 | safetensors, GGUF | Guardrails estándar, multilingüe |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Multilingüe, guardrails estándar |
| Mistral 7B Instruct | 7,24 B | 32 K | Apache 2.0 | safetensors, GGUF | Multilingüe, guardrails estándar |

La comparativa se limita a parámetros, contexto y licencia; no hay datos de rendimiento publicados para este modelo que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Guardrails reducidos de forma deliberada: el modelo "refuses far less than a normal model" según su propia model card, y puede producir contenido dañino o falso. No es apto para aplicaciones de cara al público sin filtrado de salida.
- Riesgo elevado de alucinación y de generar contenido sensible, manipulación o desinformación. El autor exige aceptar términos de uso que prohíben emplearlo para dañar, manipular o engañar a personas.
- Acceso restringido en el modelo base: el repositorio LastMachine/Qwen3-8B-ZeroZero-Heretic requiere aceptar términos (gated). Las cuantizaciones de mradermacher derivan de ese modelo y heredan sus condiciones de uso.
- Limitación idiomática: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior al de Qwen3 original.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y ética del contenido generado recae íntegramente en el operador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que la abliteration no haya degradado capacidades de razonamiento o código.
- Cuantizaciones bajas (Q2_K, Q3_K_M) degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M para uso general.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-8B-ZeroZero-Heretic-GGUF
- Modelo base: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3-8B-ZeroZero-Heretic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
