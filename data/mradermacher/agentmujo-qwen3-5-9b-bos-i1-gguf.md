# mradermacher/agentmujo-qwen3.5-9b-bos-i1-GGUF

## Resumen

`mradermacher/agentmujo-qwen3.5-9b-bos-i1-GGUF` es una publicación de cuantizaciones GGUF del modelo base `renatoschust/agentmujo-qwen3.5-9b-bos`, generadas por el usuario mradermacher, conocido en Hugging Face por producir versiones cuantizadas de modelos abiertos. El nombre sugiere un modelo derivado de la familia Qwen 3.5 con 9B de parámetros y un ajuste orientado a agentes ("agentmujo"), pero esta información no está confirmada en los metadatos disponibles.

La relevancia de esta ficha es limitada por la escasez de información verificable. El repositorio no incluye model card descriptiva (solo comentarios técnicos del proceso de cuantización), no declara licencia, idiomas ni pipeline, y el recuento de parámetros reportado en safetensors (2.559.128) es incompatible con un modelo de 9B, lo que apunta a un error de los metadatos o a que el repositorio solo contiene componentes auxiliares. El tamaño del repo (0.0 GB) y las cero descargas refuerzan la idea de una publicación reciente o incompleta.

Por tanto, esta ficha debe interpretarse como una descripción del artefacto de cuantización y de sus limitaciones documentales, no como una evaluación técnica del modelo subyacente. Cualquier uso en producción requiere verificar directamente el modelo base `renatoschust/agentmujo-qwen3.5-9b-bos` y los ficheros GGUF reales antes de tomar decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer derivado de Qwen 3.5, sin confirmar) |
| Parametros totales | 2.559.128 segun metadatos safetensors (incompatible con el "9b" del nombre; no disponible el dato real) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en los metadatos proporcionados. El nombre `qwen3.5-9b` sugiere una arquitectura transformer densa de la familia Qwen con aproximadamente 9.000 millones de parámetros, y el sufijo `bos` podría indicar un ajuste específico (posiblemente relacionado con tokens de inicio de secuencia o con un dataset concreto), pero ninguno de estos extremos está documentado en la model card.

Lo único verificable es el proceso de cuantización: la model card incluye comentarios técnicos que indican `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y `skip_mmproj: 1`, lo que sugiere que se han generado cuantizaciones a partir de pesos en formato Hugging Face, con cuantización de tensores de salida y sin incluir proyector multimodal (mmproj). Se menciona que las cuantizaciones son "weighted/imatrix", es decir, generadas con una matriz de importancia (imatrix) para mejorar la calidad en bits bajos. No hay información sobre datos de entrenamiento, número de tokens, RLHF/DPO ni innovaciones arquitectónicas.

## Capacidades

- No se han documentado capacidades específicas en la información proporcionada.
- El nombre del modelo base (`agentmujo`) sugiere un ajuste orientado a agentes, pero no hay evidencia en la model card.
- No se confirma soporte de tool calling, function calling ni razonamiento multi-paso.
- No se confirma capacidad multilingüe ni idiomas soportados.
- No se confirma soporte de visión, audio ni modo "thinking".
- La única capacidad verificable es la de servir como pesos GGUF cuantizados para inferencia con llama.cpp y herramientas compatibles.

## Casos de uso

Dada la falta de documentación, los casos de uso son hipotéticos y deben validarse contra el modelo base antes de adoptarlos:

- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permitirían, en teoría, ejecutar un modelo de ~9B en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama, si el modelo base se comporta como un transformer denso estándar de ese tamaño.
- Prototipado de agentes en local: si el ajuste `agentmujo` está orientado a agentes, las versiones Q5_K_M o Q6_K ofrecerían la mayor fidelidad respecto al modelo original para pruebas de tool calling, aunque sin garantías documentadas.
- Despliegue en CPU: las cuantizaciones Q2_K a Q4_K_S permitirían ejecución en CPU con RAM moderada, útil para entornos sin GPU.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un abanico amplio de niveles (IQ1 a Q6) que permite estudiar la degradación de calidad frente al tamaño.
- Integración en pipelines con llama.cpp: al ser GGUF, puede cargarse directamente en `llama-server`, `llama-cli` o bindings de Python (`llama-cpp-python`).
- Pruebas de concepto de bajo coste: al no requerir GPU dedicada en cuantizaciones bajas, sirve para validar viabilidad antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~9B en GGUF: Q4_K_M ~5,5-6 GB, Q5_K_M ~6,5-7 GB, Q6_K ~7,5-8 GB, Q8 ~9-10 GB (estimaciones genéricas, no verificadas para este modelo).
- GPU recomendadas: no disponibles. Para un 9B en Q4 se requieren al menos 8 GB de VRAM; una RTX 3060/4060 Ti de 12-16 GB sería suficiente en cuantizaciones medias.
- Cabe en GPU de consumo: probablemente sí en cuantizaciones Q4 o inferiores, pero no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, `llama-cpp-python`; vLLM y TGI no soportan GGUF de forma nativa generalizada (vLLM tiene soporte experimental limitado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre el modelo base ni sobre alternativas directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- Metadatos inconsistentes: el nombre indica 9B pero el recuento de safetensors es de 2.559.128 parámetros, lo que impide confirmar el tamaño real del modelo.
- Ausencia total de model card descriptiva: no hay información sobre entrenamiento, datos, sesgos ni evaluación.
- Licencia no declarada: no se puede garantizar el uso comercial; hay que verificar la licencia del modelo base `renatoschust/agentmujo-qwen3.5-9b-bos`.
- Idiomas no declarados: no se puede asumir soporte multilingüe.
- Riesgo de alucinación: desconocido, al no haber evaluación publicada.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Tamaño del repo 0.0 GB: posiblemente los ficheros GGUF no estén subidos o el repositorio esté incompleto.
- Las cuantizaciones de 1-2 bits (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad y no son recomendables para producción.
- El flag `skip_mmproj: 1` sugiere que no se incluye proyector multimodal, por lo que no habría soporte de visión aunque el modelo base lo tuviera.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/agentmujo-qwen3.5-9b-bos-i1-GGUF
- Modelo base: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
