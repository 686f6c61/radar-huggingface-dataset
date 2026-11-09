# mradermacher/14B-Qwen2.5-Kunou-v1-SOMPOA-heresy-i1-GGUF

## Resumen

El modelo `14B-Qwen2.5-Kunou-v1-SOMPOA-heresy-i1-GGUF` es una cuantización en formato GGUF realizada por el usuario mradermacher sobre el modelo base `MuXodious/14B-Qwen2.5-Kunou-v1-SOMPOA-heresy`. Se trata de un fine-tune derivado de la familia Qwen2.5, con aproximadamente 14.770 millones de parámetros totales, orientado a uso conversacional. La información pública disponible es muy limitada: la model card original solo documenta el proceso de cuantización (versión 2, con imatrix y pesos cuantizados) y lista las variantes de cuantización generadas.

El interés de esta ficha radica en su condición de ejemplo de la cadena de derivación típica en el ecosistema open source: un modelo base (Qwen2.5-14B), un fine-tune comunitario (Kunou-v1-SOMPOA-heresy) y una cuantización posterior para inferencia local (mradermacher). No se dispone de información sobre el dataset de entrenamiento del fine-tune, sus capacidades específicas ni sus resultados en benchmarks, por lo que la evaluación práctica requerirá pruebas directas por parte del usuario.

La relevancia actual es acotada: al no contar con métricas publicadas ni documentación del fine-tune, el modelo debe considerarse experimental. Su utilidad principal es permitir la ejecución local de un transformer de ~14,8B parámetros mediante llama.cpp u otros motores compatibles con GGUF, en un rango de cuantizaciones que va desde IQ1_S hasta Q6_K.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5; detalles del fine-tune no disponibles) |
| Parámetros totales | 14.770.033.664 (~14,77B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix; repo de 97,9 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un transformer decoder-only de la familia Qwen2.5, con 14.770.033.664 parámetros totales según los safetensors del modelo base. El fine-tune `14B-Qwen2.5-Kunou-v1-SOMPOA-heresy` fue desarrollado por el usuario MuXodious; no se ha publicado información sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del fine-tune no está incluida en la información disponible.

La aportación técnica de esta ficha concreta es el proceso de cuantización: mradermacher ha generado 24 variantes GGUF utilizando cuantización ponderada con imatrix (importancia matrix), lo que típicamente mejora la fidelidad de los pesos cuantizados respecto a la cuantización uniforme, especialmente en cuantizaciones agresivas (Q2, IQ2, IQ1). El campo `quantize_version: 2` y `output_tensor_quantised: 1` indican el uso de la versión 2 del pipeline de cuantización de llama.cpp. No se dispone de información sobre innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto conversacional: el tag `conversational` sugiere un ajuste orientado a diálogo multi-turno, aunque no se detallan las capacidades específicas.
- Razonamiento y código: no disponible; no se ha documentado si el fine-tune preserva o mejora las capacidades del Qwen2.5 base en matemáticas, código o razonamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas soportados no están documentados.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el formato GGUF puede servirse mediante infraestructura compatible con endpoints de Hugging Face (por ejemplo, TGI o Inference Endpoints con soporte GGUF).

## Casos de uso

- Inferencia local en estaciones de trabajo: el modelo puede ejecutarse con llama.cpp u Ollama en equipos con GPU consumer de gama alta, gracias a las cuantizaciones Q4_K_M e IQ4_XS, que reducen el peso a aproximadamente 8-9 GB.
- Experimentación con fine-tunes comunitarios: útil para investigadores que quieran evaluar el efecto del fine-tune Kunou-v1-SOMPOA-heresy frente al Qwen2.5-14B original en tareas conversacionales, comparando respuestas con la misma cuantización.
- Despliegue en entornos con VRAM limitada: las variantes IQ2_XXS, IQ2_XS e IQ1_S permiten cargar el modelo en GPUs de 6-8 GB, a costa de una pérdida de calidad que debe validarse empíricamente.
- Prototipado de asistentes conversacionales: el tag `conversational` y el formato GGUF lo hacen adecuado para integrarse en aplicaciones de chat locales mediante llama-cpp-python o servidores compatibles con la API de OpenAI.
- Evaluación de pipelines de cuantización con imatrix: sirve como caso de estudio para comparar la degradación de calidad entre cuantizaciones IQ y Q estándar sobre un mismo fine-tune.
- Servicio de endpoints compatibles: el tag `endpoints_compatible` permite desplegarlo en infraestructura de Hugging Face Inference Endpoints con backend GGUF para pruebas de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximada a partir de 14,77B parámetros):
  - IQ1_S / IQ1_M: ~3,5-4,5 GB
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~4,5-5,5 GB
  - Q2_K / Q2_K_S: ~5,5-6 GB
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: ~6,5-7,5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~7-8 GB
  - IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: ~8,5-9,5 GB
  - Q5_K_S / Q5_K_M: ~10-11 GB
  - Q6_K: ~12-13 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q5_K_M con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q5_K_M; RTX 4060 Ti 16 GB o RTX 4070 (12 GB) para Q4_K_M; GPUs de 8 GB para IQ3 y Q3_K; GPUs de 6 GB para IQ2 y Q2_K.
- Cabe en GPU consumer: sí, en todas las cuantizaciones hasta Q6_K en GPUs de 16 GB o más; las variantes Q4 e inferiores caben en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI (por ejemplo, llama.cpp server), TGI con soporte GGUF, Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 14B-Qwen2.5-Kunou-v1-SOMPOA-heresy-i1-GGUF (este) | 14,77B | no disponible | no disponible | GGUF (24 cuantizaciones) | Fine-tune comunitario sin benchmarks publicados |
| Qwen2.5-14B-Instruct | 14,77B | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según documentación oficial de Qwen) | safetensors, GGUF, AWQ, GPTQ | Modelo base oficial con benchmarks publicados |
| Qwen2.5-14B (base) | 14,77B | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según documentación oficial de Qwen) | safetensors | Modelo base sin ajuste instruct |
| Mistral-Nemo-Instruct-2407 | 12B | 128.000 tokens (según documentación de Mistral) | Apache 2.0 (según documentación de Mistral) | safetensors, GGUF | Alternativa de tamaño similar con contexto largo |

La comparación con Qwen2.5-14B-Instruct y Mistral-Nemo es orientativa: no se dispone de datos que permitan afirmar que el fine-tune Kunou-v1-SOMPOA-heresy iguale o supere a estos modelos en ninguna tarea. La licencia del fine-tune no está documentada, lo que impide confirmar la compatibilidad con uso comercial aunque el modelo base Qwen2.5 sea Apache 2.0.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se ha documentado el dataset de fine-tune ni los sesgos introducidos.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks, no puede estimarse la fiabilidad factual del modelo.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; los idiomas soportados tampoco. No debe asumirse el contexto de 32.768 tokens de Qwen2.5 sin verificación empírica.
- Restricciones de licencia: la licencia no está disponible. Aunque el modelo base Qwen2.5 es Apache 2.0, el fine-tune podría tener condiciones distintas; no debe usarse en producción comercial sin verificar la licencia del modelo base `MuXodious/14B-Qwen2.5-Kunou-v1-SOMPOA-heresy`.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni documentación del fine-tune. Se recomienda tratarlo como experimental y validar su comportamiento en el dominio objetivo antes de cualquier despliegue.
- Cuantizaciones agresivas (IQ1, IQ2): pueden degradar notablemente la coherencia y la calidad del texto; no se recomiendan para tareas de razonamiento o código.
- El nombre del modelo incluye "heresy", término habitual en la comunidad para fine-tunes sin restricciones de alineación; esto puede implicar una menor adherencia a directrices de seguridad, aunque no está confirmado.

## Enlaces

- Hugging Face (cuantización GGUF): https://huggingface.co/mradermacher/14B-Qwen2.5-Kunou-v1-SOMPOA-heresy-i1-GGUF
- Modelo base del fine-tune: https://huggingface.co/MuXodious/14B-Qwen2.5-Kunou-v1-SOMPOA-heresy
- Familia Qwen2.5 (referencia del modelo base): https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- llama.cpp (motor de inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (despliegue local): https://ollama.com
