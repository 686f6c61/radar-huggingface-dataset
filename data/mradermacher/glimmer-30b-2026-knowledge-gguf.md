# mradermacher/Glimmer-30B-2026-Knowledge-GGUF

## Resumen

Glimmer-30B-2026-Knowledge es un modelo de lenguaje publicado por OfflineBase y cuantizado en formato GGUF por mradermacher. Se presenta como una actualización de conocimiento ("knowledge-update") orientada a noticias y datos de 2026, entrenada con el dataset OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data y etiquetada como construida con "muse-spark-open". El repositorio que nos ocupa contiene únicamente las cuantizaciones estáticas del modelo base, no los pesos originales en precisión completa.

El dato más llamativo es la discrepancia entre el nombre comercial ("30B") y el recuento real de parámetros en safetensors del repositorio, que asciende a 1.920.942.592 parámetros (aproximadamente 1,9 mil millones). Esta ficha refleja ambos datos de forma explícita, ya que el tamaño efectivo condiciona por completo los requisitos de hardware y el rendimiento esperado. El repositorio ocupa 5,9 GB e incluye, además de las cuantizaciones de texto, suplementos multimodales mmproj en Q8_0 y f16, lo que sugiere capacidades de visión en el modelo base.

La relevancia actual del modelo radica en su enfoque en conocimiento actualizado a 2026 y en su disponibilidad inmediata en GGUF para inferencia local con llama.cpp y derivados. No obstante, la información pública es muy escasa: no hay datos de benchmarks, de composición del dataset ni de longitud de contexto, y el modelo acumula cero descargas y cero "likes" en el momento de redactar esta ficha, lo que aconseja tratarlo con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer; el nombre sugiere "dense", sin confirmación oficial) |
| Parametros totales | 1.920.942.592 (según safetensors del repo); el nombre comercial indica "30B", dato no verificado |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0-and-muse-model-license (licencia compuesta; enlace a MUSE_MODEL_LICENSE.md en el repo base) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en transformers/safetensors no forma parte de este repo |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Los metadatos indican que se construyó con "muse-spark-open" y que se trata de un modelo denso (una discusión en Reddit lo describe como "30B dense model"), pero no se especifica si emplea atención estándar, atención lineal, mezcla de expertos ni ninguna otra innovación concreta. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

El único dato concreto sobre el entrenamiento es el dataset asociado, OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data, cuyo contenido no está descrito en la información disponible. Las etiquetas "knowledge-update" y "2026-news" sugieren un ajuste orientado a inyectar conocimiento actualizado, probablemente mediante fine-tuning supervisado sobre datos recientes. La presencia de ficheros mmproj en el repositorio GGUF indica que el modelo base incorpora un codificador multimodal (visión), aunque no se detalla su arquitectura ni el proceso de alineación visual.

## Capacidades

- Generación de texto en inglés, con especial énfasis en conocimiento actualizado a 2026 según la etiqueta "knowledge-update".
- Procesamiento multimodal: los ficheros mmproj-Q8_0 y mmproj-f16 permiten adjuntar un codificador de visión al modelo en llama.cpp, lo que habilita entrada de imágenes.
- Conversación multi-turno: el modelo se cita en foros de rol y chat (SillyTavern) como candidato para conversaciones largas, aunque sin datos objetivos de contexto.
- Razonamiento y respuesta a preguntas sobre noticias y eventos recientes de 2026, a partir del dataset de conocimiento asociado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo y mantener diálogos multi-turno; su tamaño real de ~1,9 mil millones de parámetros (frente al "30B" del nombre) lo hace apto para equipos modestos, aunque conviene verificar el contexto efectivo antes de usarlo con historiales largos.
- Consultas sobre actualidad de 2026: gracias al ajuste "knowledge-update", es adecuado para preguntas sobre noticias y eventos recientes cubiertos por su dataset, siempre con verificación posterior por el riesgo de alucinación inherente a los modelos pequeños.
- Prototipado de aplicaciones de visión-lenguaje: los suplementos mmproj permiten experimentar con descripción de imágenes y preguntas visuales en local usando llama.cpp, sin depender de APIs externas.
- Personajes y roleplay en frontends como SillyTavern: la comunidad lo menciona como opción para chats largos; su tamaño reducido permite ejecutarlo junto a otros procesos en la misma máquina.
- Generación de borradores y resúmenes de texto en inglés: para tareas de redacción asistida donde la latencia importa más que la precisión factual, el modelo puede correr en CPU con cuantizaciones Q4_K_M o Q5_K_M.
- Filtrado y clasificación de texto en pipelines: su reducido coste de inferencia permite usarlo como clasificador o etiquetador en lote dentro de flujos de preprocesamiento, aunque no hay datos publicados sobre su calidad en estas tareas.
- Base para fine-tuning ligero: al estar disponible en GGUF y con licencia compuesta Apache 2.0 + MUSE, puede servir como punto de partida para ajustes específicos, previa revisión de los términos de la licencia MUSE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,9 mil millones de parámetros, las cuantizaciones Q4_K_M ocupan del orden de 1,2-1,5 GB y las Q8_0 alrededor de 2 GB; los pesos f16 rondarían los 3,8-4 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM es suficiente para cuantizaciones Q4/Q5/Q8 (RTX 3060, RTX 4060, RTX 4090 con enorme margen); para f16 basta con 6-8 GB. En el extremo profesional, A100 y H100 no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con 4 GB o más de VRAM; también en CPU con cuantizaciones Q4_K_S o Q2_K.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp), así como servidores compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, se espera una latencia muy baja en GPU consumer, pero no hay mediciones publicadas.
- Nota: el fichero mmproj añade 2,2 GB (Q8_0) o 3,9 GB (f16) si se usa la capacidad multimodal, lo que incrementa los requisitos de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Glimmer-30B-2026-Knowledge (este) | ~1,9 mil millones (según safetensors; nombre comercial "30B") | no disponible | Apache 2.0 + MUSE | GGUF | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct | ~3 mil millones | 32K (128K con RoPE) | Apache 2.0 | safetensors, GGUF | Amplia, muy usado |
| Llama-3.2-3B-Instruct | ~3,2 mil millones | 128K | Llama 3.2 Community License | safetensors, GGUF | Amplia, muy usado |
| Phi-3.5-mini-instruct | ~3,8 mil millones | 128K | MIT | safetensors, GGUF | Amplia, muy usado |

La comparación se basa en el tamaño efectivo del modelo según safetensors, no en el "30B" del nombre. Frente a las alternativas, Glimmer-30B-2026-Knowledge no ofrece datos públicos de benchmarks, contexto ni multilingüismo, y su licencia compuesta con términos MUSE añade complejidad frente a las licencias Apache 2.0 o MIT de los modelos citados.

## Limitaciones y advertencias

- Discrepancia crítica de nomenclatura: el nombre indica 30B, pero el recuento real de safetensors es de ~1,9 mil millones de parámetros. Cualquier evaluación de hardware o calidad debe partir del dato real, no del nombre.
- Idiomas: solo inglés según los metadatos; no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Riesgo de alucinación: elevado en un modelo de este tamaño, especialmente en tareas de conocimiento factual actualizado, que es precisamente su supuesto punto fuerte. Requiere verificación externa.
- Sesgos conocidos: no documentados, pero al ser un modelo pequeño entrenado con un dataset específico y poco transparente, es probable que herede sesgos de sus datos de entrenamiento.
- Contexto: no se publica la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas; la mención en foros a chats largos no constituye evidencia técnica.
- Licencia: la combinación "apache-2.0-and-muse-model-license" exige revisar MUSE_MODEL_LICENSE.md antes de cualquier uso comercial; los términos de la licencia MUSE pueden imponer restricciones adicionales.
- Madurez: cero descargas y cero "likes" en el momento de la ficha, sin benchmarks ni documentación técnica detallada; no se recomienda para producción sin una evaluación propia exhaustiva.
- Los ficheros mmproj son suplementos multimodales que deben emparejarse con la cuantización de texto correcta; un uso incorrecto puede degradar la calidad o fallar en la carga.
- El repositorio contiene solo cuantizaciones estáticas; no se ofrecen cuantizaciones ponderadas/imatrix, lo que puede afectar ligeramente a la calidad en tipos bajos como Q2_K o Q3_K_S.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Glimmer-30B-2026-Knowledge-GGUF
- Modelo base: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Dataset de conocimiento: https://huggingface.co/datasets/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data
- Licencia MUSE: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge/blob/main/MUSE_MODEL_LICENSE.md
- Página de descargas del cuantizador: https://hf.tst.eu/model#Glimmer-30B-2026-Knowledge-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Discusión en Reddit sobre modelos locales (mención a Muse Glimmer): https://www.reddit.com/r/SillyTavernAI/comments/1w2g7it/what_local_modles_do_you_use/
