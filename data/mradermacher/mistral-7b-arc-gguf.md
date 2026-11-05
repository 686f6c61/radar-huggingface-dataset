# mradermacher/mistral-7b-arc-GGUF

## Resumen

mistral-7b-arc-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo `wonjunes/mistral-7b-arc`, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF de un fine-tune sobre la base Mistral 7B, orientada a su uso con llama.cpp y entornos compatibles con GGUF. El repositorio contiene 12 variantes de cuantización distintas, desde F16 hasta Q2_K, lo que facilita el despliegue en hardware con distintos presupuestos de memoria.

El modelo base cuenta con 7.241.732.096 parámetros (aproximadamente 7,2 mil millones), coherente con la arquitectura Mistral 7B. La información disponible no detalla el proceso de fine-tune aplicado por wonjunes, ni el dataset utilizado, ni si hubo entrenamiento con RLHF o DPO. El sufijo "arc" sugiere una especialización, pero la model card no la describe.

La relevancia de esta ficha es práctica: permite evaluar rápidamente si alguna de las cuantizaciones publicadas encaja en un despliegue concreto. No obstante, la ausencia de licencia declarada, de idiomas soportados y de benchmarks publicados limita seriamente su uso en producción sin una validación adicional por parte del integrador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral 7B; no confirmado en la model card) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura del modelo original más allá de los metadatos de conversión (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`). Por el nombre y el recuento de parámetros, se trata de un fine-tune sobre Mistral 7B, un transformer decoder-only con atención de ventana deslizante y activación SwiGLU, pero esta información no está confirmada en la documentación proporcionada y debe tratarse como inferencia.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio es exclusivamente una publicación de cuantizaciones estáticas generadas por mradermacher a partir del modelo de wonjunes; no incluye información sobre el proceso de fine-tune ni sobre posibles innovaciones técnicas.

## Capacidades

- Generación de texto autoregresiva, heredada de la base Mistral 7B (no verificado en la model card).
- Razonamiento y respuesta a instrucciones: presumiblemente entrenado para seguir instrucciones, aunque no se documenta el formato de prompt ni la plantilla de chat.
- Generación de código y matemáticas: capacidad esperable en la familia Mistral 7B, sin datos específicos de este fine-tune.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Despliegue en llama.cpp y runtimes compatibles con GGUF gracias a las 12 cuantizaciones publicadas.

## Casos de uso

- Inferencia local en CPU o GPU de gama media: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 7B en equipos con 8-16 GB de RAM/VRAM mediante llama.cpp u Ollama, útil para prototipos y pruebas offline.
- Evaluación de fine-tunes especializados: el sufijo "arc" sugiere una orientación concreta; el formato GGUF facilita comparar su comportamiento frente a la base Mistral 7B en tareas de razonamiento sin necesidad de infraestructura de servidor.
- Despliegue en dispositivos con recursos limitados: las variantes Q2_K y Q3_K_S reducen el peso del modelo lo suficiente para entornos con menos de 6 GB de memoria, a costa de una pérdida de calidad que debe medirse empíricamente.
- Generación de texto asistida en herramientas de escritorio: integración en aplicaciones locales tipo chat o autocompletado mediante llama.cpp, sin dependencia de APIs externas.
- Filtrado y clasificación de texto por lotes: con Q8_0 o F16 se puede usar el modelo en pipelines de etiquetado o resumen donde la latencia no sea crítica.
- Base para experimentación académica: al ser un fine-tune no documentado, sirve como punto de partida para estudiar el efecto de distintas cuantizaciones sobre el rendimiento en tareas específicas, siempre que se valide la licencia del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (7,2B parámetros):
  - F16: ~14,5 GB.
  - Q8_0: ~7,7 GB.
  - Q6_K: ~6,0 GB.
  - Q5_K_M: ~5,1 GB.
  - Q4_K_M: ~4,4 GB.
  - Q3_K_M: ~3,5 GB.
  - Q2_K: ~2,7 GB.
- GPU recomendadas: A100 o H100 para F16 con contexto largo; RTX 4090 (24 GB) para F16 o Q8_0; RTX 3090/4080 (16-24 GB) para Q8_0 y Q6_K; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q5_K_M y Q4_K_M.
- Cabe en GPU de consumo: sí, desde Q4_K_M en GPUs con 6-8 GB de VRAM, y Q2_K/Q3_K_S en equipos con 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; también es posible servirlo con llama-cpp-python o como endpoint compatible con la API de OpenAI mediante herramientas de terceros (el tag `endpoints_compatible` del repo lo sugiere).
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y el backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mistral-7b-arc-GGUF (este) | 7,24B | no disponible | no disponible | GGUF (12 cuantizaciones) | HuggingFace |
| Mistral 7B Instruct (oficial) | 7,24B | 32k (según documentación oficial de Mistral) | Apache 2.0 | safetensors, GGUF (comunidad) | HuggingFace |
| Zephyr 7B beta | 7,24B | 32k | MIT | safetensors, GGUF (comunidad) | HuggingFace |
| Llama 2 7B Chat | 6,74B | 4k | Llama 2 Community License | safetensors, GGUF (comunidad) | HuggingFace |

La comparación se limita a parámetros, contexto y licencia porque no hay benchmarks publicados para este fine-tune. La principal diferencia frente a las alternativas es la ausencia de licencia declarada y de documentación sobre el entrenamiento, lo que complica su adopción frente a modelos con licencia permisiva y model card completa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor del modelo original (`wonjunes/mistral-7b-arc`) antes de cualquier despliegue en producción.
- Model card inexistente en la práctica: no hay información sobre dataset, formato de prompt, idiomas ni proceso de alineación, lo que impide prever su comportamiento.
- Riesgo de alucinación: inherente a los modelos de 7B sin datos de evaluación; sin benchmarks no se puede acotar su fiabilidad.
- Idiomas soportados desconocidos: no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas distintos del inglés.
- Contexto desconocido: no se confirma la ventana de contexto; asumir 32k por herencia de Mistral 7B sería una suposición no verificada.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): degradan la calidad de forma notable; no recomendadas para tareas de razonamiento o código en producción.
- Trazabilidad limitada: al ser una conversión de terceros, no hay garantía de que las cuantizaciones reproduzcan fielmente el modelo original.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/mistral-7b-arc-GGUF
- Modelo original: https://huggingface.co/wonjunes/mistral-7b-arc
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
