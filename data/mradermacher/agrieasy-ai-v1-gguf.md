# mradermacher/agrieasy-ai-v1-GGUF

## Resumen

`mradermacher/agrieasy-ai-v1-GGUF` es la versión cuantizada en formato GGUF del modelo `Rishabhthe1/agrieasy-ai-v1`, un modelo conversacional de dominio específico orientado al sector agrícola y pensado para el contexto de la India. El trabajo de cuantización lo firma mradermacher, un actor habitual en HuggingFace especializado en publicar conversiones GGUF de modelos de terceros para su uso con llama.cpp y herramientas compatibles. El modelo original no ha sido entrenado por mradermacher: este repositorio solo redistribuye pesos convertidos y comprimidos.

El interés práctico del modelo reside en su tamaño reducido y su enfoque vertical. Con 1.543.714.304 parámetros totales (aproximadamente 1,54 mil millones), se sitúa en la gama de modelos pequeños que pueden ejecutarse en hardware de consumo, CPU o dispositivos de borde, algo relevante para escenarios de despliegue en zonas rurales con conectividad limitada. La model card declara soporte para inglés e hindi, lo que encaja con el público objetivo declarado en las etiquetas del repositorio (`agriculture`, `farming`, `india`, `agrieasy`, `conversational`).

La información publicada es escasa: no se detallan datos de entrenamiento, longitud de contexto, resultados de benchmarks ni la arquitectura concreta del modelo base. Esta ficha se limita por tanto a lo verificable a partir de los metadatos y de la model card, y marca explícitamente como no disponible todo aquello que el autor no ha hecho público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de lenguaje tipo transformer decoder-only, inferido por la librería `transformers` y el formato GGUF; el autor no lo especifica) |
| Parámetros totales | 1.543.714.304 (≈1,54 B), según safetensors del modelo base |
| Parámetros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (cuantizaciones estáticas; no hay versiones con imatrix publicadas por el autor) |
| Idiomas soportados | Inglés (`en`), hindi (`hi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el repositorio del modelo base |

## Arquitectura y entrenamiento

El autor de la cuantización no documenta la arquitectura interna del modelo original. Los metadatos disponibles indican que `Rishabhthe1/agrieasy-ai-v1` se distribuye con la librería `transformers` y pesos en safetensors, lo que es compatible con una arquitectura transformer decoder-only estándar, pero no se confirma en la model card. Como dato objetivo, el recuento exacto de parámetros (1.543.714.304) coincide con el de la familia Qwen2.5-1.5B, por lo que es plausible que el modelo base sea un fine-tune de esa familia; esta hipótesis no está confirmada por el autor y debe tratarse como tal.

Tampoco hay información sobre el corpus de entrenamiento: no se indica el número de tokens, la composición del dataset, si hubo ajuste supervisado, RLHF, DPO u otras etapas de alineación, ni qué innovaciones técnicas se emplearon. Todo lo que se puede afirmar sobre el proceso de conversión es lo que declara la model card: cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) generadas a partir del repositorio en transformers, sin cuantizaciones ponderadas ni con matriz de importancia en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés e hindi, con orientación declarada al dominio agrícola.
- Respuesta a preguntas sobre cultivos, prácticas de cultivo y temáticas afines al sector, según las etiquetas del repositorio (`agriculture`, `farming`).
- Conversación multi-turno: el repositorio incluye la etiqueta `conversational`, aunque no se especifica el formato de prompt ni la plantilla de chat empleada.
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, KoboldCpp), al distribuirse en GGUF.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistencia conversacional a agricultores por chat: el modelo puede mantener diálogos en hindi e inglés sobre cuestiones básicas de cultivo, adecuado por su tamaño para servir respuestas en aplicaciones de mensajería con infraestructura modesta.
- Despliegue en entornos con conectividad limitada: al caber en cuantizaciones de 0,8 a 1,2 GB, puede ejecutarse en un servidor pequeño o incluso en un equipo de campo, lo que permite dar servicio en zonas rurales sin depender de la nube.
- Primer nivel de triaje en consultas agronómicas: puede actuar como filtro inicial que clasifica y reformula la consulta del agricultor antes de escalarla a un agrónomo humano o a un sistema especializado, reduciendo el volumen de consultas que llegan a los expertos.
- Soporte a agentes de extensión agraria: uso como asistente de consulta rápida para personal de campo que necesita recordar prácticas, calendarios o terminología en inglés e hindi.
- Integración en aplicaciones móviles de agricultura: al ser un modelo de 1,5 B en GGUF, puede embeberse en el backend de una app de información agraria con requisitos de latencia y coste bajos.
- Prototipado e investigación en NLP de dominio agrícola para lenguas de la India: sirve como línea base ajustable para experimentos con hindi e inglés en un dominio vertical concreto.
- Generación de material divulgativo: redacción de textos breves de formación o avisos para agricultores, siempre con revisión humana dada la tendencia a la alucinación de los modelos de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los metadatos del modelo base incluyen puntuaciones de MMLU, HumanEval, GSM8K ni de evaluaciones específicas del dominio agrícola, tampoco comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): entre 0,8 y 1,0 GB en Q2_K/Q3_K_S, alrededor de 1,0-1,1 GB en IQ4_XS y Q4_K_M, 1,2 GB en Q5_K_M, 1,4 GB en Q6_K, 1,7 GB en Q8_0 y 3,2 GB en f16.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente. Una RTX 3060 (12 GB), una RTX 4060 Ti o una RTX 4090 pueden alojar el modelo holgadamente y dejar espacio para contextos largos y lotes. En el entorno profesional, una Tesla T4 (16 GB) o una L4 son opciones adecuadas para servir varias instancias.
- ¿Cabe en GPU consumer? Sí, en la práctica totalidad de GPU dedicadas de los últimos años, e incluso en iGPU con memoria unificada suficiente.
- Ejecución en CPU: viable en cuantizaciones Q4_K_M o Q5_K_M con llama.cpp; el rendimiento en CPU depende del núcleo y del ancho de banda de memoria, y no se han publicado mediciones para este modelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para servir con vLLM o TGI conviene partir del repositorio en safetensors (`Rishabhthe1/agrieasy-ai-v1`) en lugar del GGUF, ya que estos motores trabajan mejor con pesos sin cuantizar o con cuantización propia.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No existen datos de rendimiento publicados para `agrieasy-ai-v1`, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Los datos de contexto de los modelos alternativos provienen de sus respectivas model cards públicas.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agrieasy-ai-v1 (base) | ≈1,54 B | No disponible | Agrícola, inglés e hindi | Apache 2.0 | HuggingFace (safetensors y GGUF) |
| Qwen2.5-1.5B-Instruct | ≈1,54 B | 32 768 tokens (ampliable) | Generalista, multilingüe | Apache 2.0 | HuggingFace, amplio ecosistema de cuantizaciones |
| Llama 3.2 1B Instruct | ≈1,24 B | 128 000 tokens | Generalista, multilingüe | Licencia comunitaria Llama 3.2 | HuggingFace, requiere aceptación de términos |
| Gemma 2 2B IT | ≈2,6 B | 8 192 tokens | Generalista, multilingüe | Términos de uso de Gemma | HuggingFace, requiere aceptación de términos |

La comparación relevante es que los tres modelos alternativos son generalistas y están ampliamente evaluados, mientras que `agrieasy-ai-v1` apuesta por especialización de dominio a costa de transparencia: no publica contexto, datos de entrenamiento ni evaluaciones.

## Limitaciones y advertencias

- Ausencia total de información sobre datos de entrenamiento: no se puede evaluar la calidad, la procedencia ni la licencia de las fuentes utilizadas, lo que es un riesgo relevante para uso comercial pese a la licencia Apache 2.0 declarada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas generalistas del mismo tamaño.
- Riesgo elevado de alucinación: los modelos de ~1,5 B de parámetros generan con frecuencia información incorrecta, especialmente en un dominio técnico como el agrícola donde un error en dosis de fertilizante o en tratamiento de plagas puede tener consecuencias económicas o de seguridad.
- No debe usarse como sustituto del asesoramiento agronómico profesional ni para recomendaciones de fitosanitarios sin validación humana explícita.
- Cobertura lingüística limitada a inglés e hindi; no hay soporte declarado de castellano ni de otras lenguas de la India.
- Sesgo geográfico: las etiquetas indican un enfoque hacia la India, por lo que las recomendaciones pueden no ser aplicables a otras regiones climáticas o marcos regulatorios.
- Degradación en cuantizaciones bajas: las versiones Q2_K y Q3_K_S, aunque ocupan menos de 1 GB, pierden calidad de forma notable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M para uso general.
- El repositorio lo mantiene un tercero (mradermacher), no el autor original: posibles desfases si el modelo base se actualiza, y sin garantía de soporte.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos o conversaciones extensas sin probarlo empíricamente.
- Fecha de creación del repositorio: 27 de octubre de 2026; el modelo es muy reciente y cuenta con cero descargas y un único "like", por lo que no existe validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/agrieasy-ai-v1-GGUF
- Modelo base (pesos originales en transformers): https://huggingface.co/Rishabhthe1/agrieasy-ai-v1
- Página de conveniencia del autor para descargas y visión general: https://hf.tst.eu/model#agrieasy-ai-v1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Catálogo de modelos de mradermacher: https://huggingface.co/mradermacher/models
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Otro modelo del mismo autor, sin relación directa: https://huggingface.co/mradermacher/agri-31b-v1-i1-GGUF
- Contexto de investigación en agentes agrícolas (AgriSkill-Agent): https://agritechinsights.com/index.php/2026/10/27/ai-framework-diagnoses-leaf-disease-tells-farmers-what-to-do-next/
- Proyecto relacionado de asesor agrícola con ML: https://github.com/YasminYaser/Smart_Agricultural_Advisor
