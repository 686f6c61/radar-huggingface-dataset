# mradermacher/SDRL-Qwen3-32B-i1-GGUF

## Resumen

SDRL-Qwen3-32B-i1-GGUF es una recopilación de cuantizaciones GGUF generada por mradermacher a partir del modelo base tokentideAI/SDRL-Qwen3-32B, que a su vez deriva de la familia Qwen3 de Alibaba. El repositorio no contiene un modelo entrenado desde cero, sino pesos convertidos al formato GGUF y cuantizados con la técnica de imatrix (importance matrix), lo que permite ejecutar un modelo de aproximadamente 32.700 millones de parámetros en hardware de consumo con pérdida de precisión controlada.

El interés práctico del repositorio radica en que ofrece hasta 24 variantes de cuantización distintas (desde IQ1_S hasta Q6_K), lo que cubre un rango amplio de presupuestos de VRAM y RAM. Para desarrolladores que quieran desplegar Qwen3-32B en local mediante llama.cpp, Ollama o servidores compatibles con GGUF, este repo evita tener que realizar la conversión y cuantización por cuenta propia.

La información publicada por el autor es mínima: no se detalla la licencia, los idiomas soportados ni la composición del dataset de entrenamiento del modelo base. La model card se limita a metadatos técnicos del proceso de cuantización, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-32B; no detallada en el repo) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible en el repo (la familia Qwen3 soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Por el nombre y el número de parámetros (32.762.123.264), se corresponde con Qwen3-32B, un transformer decoder-only denso de la familia Qwen3 de Alibaba. No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO o aprendizaje por refuerzo con razonamiento extendido.

La innovación técnica documentada en este repo es exclusivamente el proceso de cuantización: se han generado cuantizaciones de tipo i1 (imatrix) con quantize_version 2 y output_tensor_quantised 1, partiendo de una conversión hf. El uso de importance matrix permite que las cuantizaciones de baja precisión (IQ1_S, IQ2_XXS, IQ2_M) conserven mejor la calidad que las cuantizaciones K-quants clásicas equivalentes en bits por peso. El autor incluye además variantes small-IQ4_NL y combinaciones Q4_0/Q4_1 para compatibilidad con distintos backends.

## Capacidades

- Generación de texto conversacional: el tag "conversational" sugiere un ajuste orientado a diálogo, aunque no se detalla el formato de prompt.
- Razonamiento y matemáticas: capacidades heredadas de Qwen3-32B, no verificadas en este repo.
- Generación de código: previsiblemente soportada por el modelo base, sin confirmación documental.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base Qwen3 es multilingüe, pero el repo no lo declara.
- Modo thinking: no disponible en la información proporcionada.
- Visión o audio: no disponible; el repo no incluye proyector multimodal (skip_mmproj vacío).

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M e IQ4_XS permiten ejecutar un modelo de 32B en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) dejando margen para contexto, gracias a la reducción de tamaño frente a los pesos originales en FP16.
- Servicio de chat interno en empresa: las cuantizaciones Q5_K_M y Q6_K ofrecen una calidad cercana al modelo original para asistentes conversacionales en entornos con requisitos de privacidad, ejecutables en servidores con 2×24 GB o una A6000.
- Prototipado rápido con Ollama o llama.cpp: al estar en GGUF, el modelo se puede cargar directamente en herramientas de inferencia local sin pasos de conversión, lo que acelera la experimentación con prompts y plantillas de chat.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 24 variantes, lo que permite medir empíricamente la degradación de calidad entre IQ1_S y Q6_K sobre el mismo modelo base para una tarea concreta.
- Generación de código asistida en IDE local: la variante IQ4_XS o Q4_K_M puede integrarse en plugins que consuman un endpoint compatible con la API de OpenAI, dado el tag endpoints_compatible.
- Fine-tuning ligero sobre pesos cuantizados: aunque no es el flujo ideal, las variantes Q4_K_M y Q5_K_M sirven como referencia para comparar contra adaptadores LoRA entrenados sobre el modelo base en FP16.
- Investigación sobre cuantización extrema: las variantes IQ1_S e IQ2_XXS permiten estudiar el límite práctico de compresión para modelos de 32B en hardware con 8-12 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (aproximada, calculada a partir de los 32,76B parámetros):
  - IQ1_S / IQ2_XXS / IQ2_XS: en torno a 9-12 GB.
  - IQ2_M / Q2_K / Q2_K_S: en torno a 12-14 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 14-17 GB.
  - IQ4_XS / Q4_0 / Q4_1 / Q4_K_S / small-IQ4_NL: en torno a 18-20 GB.
  - Q4_K_M / IQ4_NL: en torno a 20-21 GB.
  - Q5_K_S / Q5_K_M: en torno a 23-25 GB.
  - Q6_K: en torno a 27-28 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M e inferiores; RTX 3090 (24 GB) para las mismas variantes; A6000 (48 GB) o A100 40/80 GB para Q5_K_M y Q6_K con contexto amplio.
- ¿Cabe en GPU de consumo? Sí: las variantes Q4_K_M e inferiores caben en GPUs de 24 GB; las variantes IQ2/IQ3 caben en GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080) con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF (koboldcpp, text-generation-webui, LM Studio), y endpoints compatibles con la API de OpenAI según el tag del repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SDRL-Qwen3-32B-i1-GGUF | 32,76B | no disponible | no disponible | GGUF (24 cuantizaciones) | Hugging Face |
| Qwen3-32B (oficial) | 32,76B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Hugging Face (Alibaba) |
| Gemma 2 27B | 27B | 8K (oficial) | Gemma license | safetensors, GGUF | Hugging Face (Google) |
| Mistral Small 24B | 24B | 32K (oficial) | Apache 2.0 | safetensors, GGUF | Hugging Face (Mistral) |

La comparación directa con Qwen3-32B oficial es la más relevante: este repo es una derivación cuantizada del mismo, por lo que la calidad del modelo subyacente es idéntica salvo por la pérdida introducida por cada cuantización. Frente a Gemma 2 27B y Mistral Small 24B, el modelo base Qwen3-32B es ligeramente mayor en parámetros, aunque no se dispone de benchmarks en este repo para cuantificar la diferencia.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base tokentideAI/SDRL-Qwen3-32B y, en su caso, la de Qwen3-32B de Alibaba.
- El modelo base es un derivado de terceros (tokentideAI) sobre Qwen3; no se documenta qué ajuste adicional se aplicó, por lo que el comportamiento conversacional puede diferir del Qwen3 oficial.
- Las cuantizaciones de baja precisión (IQ1_S, IQ2_XXS, IQ2_XS, Q2_K_S) introducen degradación notable en razonamiento y matemáticas; no se recomiendan para producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de 32B, no mitigado de forma documentada.
- No se especifican los idiomas soportados ni la calidad en castellano; el modelo base Qwen3 es multilingüe, pero la adaptación SDRL podría haber alterado el equilibrio idiomático.
- No hay información sobre sesgos, filtros de seguridad ni evaluación de toxicidad.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- El tamaño del repo (12,4 GB) sugiere que no incluye todas las cuantizaciones listadas en los tags, o que estas se sirven mediante LFS; conviene verificar qué archivos están realmente disponibles antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/SDRL-Qwen3-32B-i1-GGUF
- Modelo base del que se cuantiza: https://huggingface.co/tokentideAI/SDRL-Qwen3-32B
- Familia Qwen3 (referencia del modelo original): https://huggingface.co/Qwen
