# mradermacher/Frost-Cyber-Mini-Uncensored-v1.1-GGUF

## Resumen

Frost-Cyber-Mini-Uncensored-v1.1-GGUF es la versión cuantizada en formato GGUF del modelo Frost-Cyber-Mini-Uncensored-v1.1, desarrollado originalmente por FrostWolfAI y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 4.112 millones de parámetros (4,1 B) especializado en ciberseguridad, con un ajuste orientado a eliminar restricciones de rechazo (abliterated/uncensored) y con capacidades declaradas de uso de herramientas (tool-use) y razonamiento agéntico. La licencia es Apache 2.0.

El modelo parte de una base etiquetada como "spark2_5" y ha sido sometido a un proceso de fusión de LoRA (lora-merged), lo que sugiere un ajuste fino sobre una arquitectura transformer preentrenada. Su propósito declarado es servir como asistente conversacional y agéntico en tareas de seguridad ofensiva y defensiva, así como en escenarios donde se requiere un modelo que no aplique filtros de contenido restrictivos.

Esta ficha se centra en la versión GGUF, que permite su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy escasa; los apartados correspondientes lo indican explícitamente cuando no hay datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; etiquetado como "spark2_5") |
| Parámetros totales | 4.112.079.360 (4,1 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta "spark2_5" y la indicación de que se trata de un transformer. El modelo base Frost-Cyber-Mini-Uncensored-v1.1 ha sido sometido a una fusión de LoRA (lora-merged), lo que indica un ajuste fino mediante adaptadores de bajo rango posteriormente integrados en los pesos. La etiqueta "abliterated" sugiere que se ha aplicado una técnica de ablación de direcciones de rechazo en el espacio de activaciones para reducir la tendencia del modelo a negarse a responder.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El repositorio cuantizado por mradermacher incluye tanto cuantizaciones estáticas como cuantizaciones ponderadas/imatrix en un repositorio separado (i1-GGUF), lo que permite elegir entre tamaño y calidad según el caso de uso.

## Capacidades

- Generación de texto conversacional en inglés, orientada a dominios de ciberseguridad.
- Modo "uncensored"/"abliterated": menor tendencia a rechazar peticiones relacionadas con seguridad ofensiva, análisis de vulnerabilidades o contenido sensible.
- Soporte declarado de tool-use / function calling (etiqueta "tool-use").
- Capacidades agénticas y de razonamiento multi-paso (etiqueta "agentic").
- Especialización en ciberseguridad (etiqueta "cybersecurity").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistente de análisis de vulnerabilidades: el modelo puede ayudar a interpretar informes de escaneo, priorizar hallazgos y sugerir mitigaciones, aprovechando su ajuste en ciberseguridad y su menor tendencia a rechazar consultas técnicas sensibles.
- Generación de scripts de automatización de seguridad: puede redactar scripts de reconocimiento, parsing de logs o tareas de respuesta a incidentes, integrándose en pipelines mediante tool calling.
- Formación y concienciación en seguridad: útil para generar escenarios de phishing simulado, ejercicios de mesa o material de formación, con la ventaja de que el modelo no bloquea contenido de simulación ofensiva.
- Agente conversacional para SOC (Security Operations Center): puede gestionar conversaciones multi-turno con contexto de alertas y tickets, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Análisis de código y revisión de seguridad: el modelo puede revisar fragmentos de código en busca de patrones inseguros y proponer correcciones, aprovechando sus capacidades de tool-use para integrarse con linters o analizadores estáticos.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF (desde 1,9 GB en Q2_K hasta 4,5 GB en Q8_0), puede ejecutarse en estaciones de trabajo sin GPU dedicada o con GPU de consumo, lo que facilita su uso en laboratorios de seguridad y entornos air-gapped.
- Prototipado de agentes autónomos: su soporte declarado de tool-use y razonamiento multi-paso permite construir agentes que consulten APIs, ejecuten comandos y encadenen acciones en tareas de automatización de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~1,9 GB de pesos; ~3-4 GB de VRAM con contexto moderado.
  - Q4_K_M: ~2,7 GB de pesos; ~4-5 GB de VRAM con contexto moderado.
  - Q8_0: ~4,5 GB de pesos; ~6-7 GB de VRAM con contexto moderado.
  - f16: ~8,3 GB de pesos; ~10-12 GB de VRAM con contexto moderado.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 2070); para f16 se recomienda RTX 3080/4070 o superior. En entornos de servidor, A100 o H100 son sobredimensionadas para este tamaño, pero válidas para alto throughput.
- Cabe en GPU de consumo: sí, en la mayoría de GPU modernas con 8 GB o más para cuantizaciones Q4_K_M y superiores; las cuantizaciones Q2/Q3 caben en GPU con 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (llama-cpp-python, KoboldCpp). Para el modelo base en safetensors: transformers, vLLM y TGI (previa conversión o carga del repo original).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño de 4,1 B, se espera un throughput alto en GPU de consumo (decenas de tokens por segundo en Q4_K_M), pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría. Se indica a continuación una comparación estructural basada únicamente en datos disponibles de la model card y conocimiento general de la categoría, marcando como "no disponible" los campos sin datos verificables.

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Frost-Cyber-Mini-Uncensored-v1.1 (GGUF) | 4,1 B | No disponible | Apache 2.0 | Ciberseguridad, uncensored, agéntico | GGUF en HF |
| Modelos de ~4 B de propósito general (p. ej., familia Llama 3.2 3B, Qwen2.5 3B) | ~3-4 B | 128K en algunos casos | Licencias variables (Llama, Apache 2.0) | Propósito general | Safetensors, GGUF |
| Modelos especializados en ciberseguridad de tamaño similar | No disponible | No disponible | No disponible | Ciberseguridad | No disponible |

La comparativa directa con alternativas concretas no es posible sin datos de rendimiento publicados. Se recomienda evaluar el modelo en las tareas objetivo antes de adoptarlo en producción.

## Limitaciones y advertencias

- El ajuste "uncensored"/"abliterated" implica que el modelo puede generar contenido ofensivo, peligroso o legalmente sensible; su uso en producción requiere salvaguardas externas y revisión legal.
- Riesgo de alucinación inherente a modelos de 4 B; especialmente en dominios técnicos donde puede inventar CVEs, comandos o referencias.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin validación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y el cumplimiento normativo (por ejemplo, en ciberseguridad ofensiva) son responsabilidad del usuario.
- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; la trazabilidad es limitada.
- El repositorio tiene pocas descargas (958) y cero likes en el momento de la consulta, lo que sugiere poca validación comunitaria.
- Al ser una cuantización, las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Frost-Cyber-Mini-Uncensored-v1.1-GGUF
- Modelo base: https://huggingface.co/FrostWolfAI/Frost-Cyber-Mini-Uncensored-v1.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Frost-Cyber-Mini-Uncensored-v1.1-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Frost-Cyber-Mini-Uncensored-v1.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
