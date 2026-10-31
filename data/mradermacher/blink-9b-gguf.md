# mradermacher/Blink-9B-GGUF

## Resumen

Blink-9B (publicado como cuantizaciones GGUF en el repositorio mradermacher/Blink-9B-GGUF) es una colección de cuantizaciones estáticas del modelo agentscope-ai/Piccolo-9B, realizadas por el cuantizador conocido mradermacher. El modelo base, Piccolo-9B de AgentScope, se presenta con las etiquetas "decision-model", "bidirectional-attention" y "agentscope", lo que sugiere un modelo orientado a tareas de decisión y razonamiento con mecanismos de atención bidireccional, aunque la model card del cuantizador no ofrece detalles técnicos adicionales sobre su diseño o entrenamiento.

Este repositorio resuelve un problema práctico concreto: facilitar la ejecución local del modelo en hardware de consumo mediante archivos GGUF compatibles con llama.cpp y derivados como Ollama o LM Studio. Con 9.197.093.888 parámetros y cuantizaciones que van desde Q2_K (4,0 GB) hasta f16 (18,5 GB), permite elegir el equilibrio entre calidad y uso de memoria según el equipo disponible. La licencia Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "decision-model" con "bidirectional-attention"; arquitectura detallada no publicada en la model card) |
| Parametros totales | 9.197.093.888 (dato real de safetensors) |
| Parametros activos | no disponible (solo relevante si es MoE; no se ha confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas; imatrix no disponible en este momento) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La model card de este repositorio es una ficha de cuantización y no documenta la arquitectura del modelo base. Las etiquetas del repositorio indican que Piccolo-9B es un "decision-model" con "bidirectional-attention" y está asociado al ecosistema AgentScope y a la denominación "qwenpaw", lo que apunta a una posible relación con la familia Qwen, aunque esto no está confirmado en la documentación disponible. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

Cabe destacar que el repositorio incluye archivos mmproj (mmproj-Q8_0 de 0,7 GB y mmproj-f16 de 1,0 GB), suplementos multimodales que sugieren que el modelo base admite entradas de imagen mediante un proyector multimodal compatible con llama.cpp.

## Capacidades

- Generación de texto conversacional (etiquetado como "conversational" en el repositorio).
- Etiquetado como "decision-model": orientación aparente hacia tareas de decisión y razonamiento, aunque sin documentación detallada.
- Atención bidireccional según las etiquetas, un rasgo no habitual en LLM causales estándar.
- Capacidad multimodal sugerida por los archivos mmproj incluidos (procesamiento de imágenes como suplemento en llama.cpp).
- Soporte de inglés y chino.
- No hay información publicada sobre tool calling, function calling, agentes ni capacidades de código o matemáticas.

## Casos de uso

- Ejecución local en hardware de consumo: la cuantización Q4_K_M (5,9 GB) cabe en una GPU de 8 GB de VRAM o incluso en equipos solo con CPU, lo que permite experimentar con el modelo sin infraestructura cloud.
- Experimentación con arquitecturas no convencionales: si el modelo realmente emplea atención bidireccional como paradigma de decisión, resulta interesante para investigadores que quieran probar alternativas a los LLM causales tradicionales.
- Chatbots personales en inglés y chino: el etiquetado conversacional y el soporte bilingüe lo hacen apto para asistentes locales de escritorio mediante Ollama o LM Studio.
- Prototipado multimodal ligero: los archivos mmproj permiten probar la entrada de imágenes en llama.cpp sin desplegar el modelo completo en precisión original.
- Selección de precisión ajustada a recursos: con 12 cuantizaciones disponibles, es posible elegir entre máxima calidad (Q8_0, 9,9 GB) y máxima compresión (Q2_K, 4,0 GB) según el caso.
- Evaluación comparativa de cuantizaciones: la tabla completa de quants con notas de calidad sirve como referencia para estudiar el impacto de la cuantización en modelos de ~9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximadamente el tamaño del archivo más overhead de contexto):
  - Q2_K: ~4,0 GB
  - Q4_K_M: ~5,9 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
- GPU recomendadas: para las cuantizaciones de 4-6 GB, cualquier GPU de consumo con 8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070). Para Q8_0 o f16, GPU de 12-24 GB (RTX 3090, RTX 4090). No hay cifras oficiales de VRAM publicadas.
- Cabe en consumer GPU: sí, las cuantizaciones Q2_K a Q5_K_M funcionan en GPUs de 6-8 GB; también es viable la inferencia solo con CPU o con descarga parcial a RAM (mmap de llama.cpp).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El modelo base en safetensors admite vLLM o TGI, aunque la compatibilidad de estos runtimes con una arquitectura no estándar (atención bidireccional) no está confirmada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Blink-9B (Piccolo-9B) | 9,20B | GGUF (12 quants) | Apache 2.0 | Decision-model con atención bidireccional; soporte multimodal vía mmproj |
| Qwen3-8B | 8,19B | safetensors, GGUF (comunidad) | Apache 2.0 | LLM causal estándar, multilingüe amplio, benchmarks publicados |
| Gemma 2 9B | 9,24B | safetensors, GGUF (comunidad) | Gemma license | LLM causal de Google con amplio ecosistema |

La comparativa se basa en el tamaño paramétrico; no hay datos de rendimiento publicados que permitan comparar calidad de resultados.

## Limitaciones y advertencias

- La documentación técnica del modelo base (arquitectura detallada, contexto, datos de entrenamiento) no está disponible en este repositorio; debe consultarse la ficha de agentscope-ai/Piccolo-9B para más información.
- Al ser cuantizaciones estáticas (sin imatrix), las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad respecto a f16.
- La atención bidireccional y el paradigma de "decision-model" pueden no ser compatibles con todos los runtimes GGUF; conviene verificar el soporte en la versión de llama.cpp utilizada.
- El soporte de idiomas se limita a inglés y chino según las etiquetas; el rendimiento en castellano no está documentado.
- Riesgo de alucinación, sesgos y precisión factual: no disponible (sin evaluaciones publicadas).
- Los archivos mmproj son suplementos multimodales opcionales; sin ellos, el modelo funciona solo con texto.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque se debe mantener el aviso de licencia.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Blink-9B-GGUF
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-9B
- Página de descargas resumida de mradermacher: https://hf.tst.eu/model#Blink-9B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
