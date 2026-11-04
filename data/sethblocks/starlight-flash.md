# Sethblocks/Starlight-Flash

## Resumen

Starlight-Flash es un modelo de lenguaje causal de tipo texto, publicado por el usuario Sethblocks en HuggingFace y construido sobre la arquitectura Qwen3.5 (`Qwen3_5ForCausalLM`). Con 9.197.093.888 parámetros totales (aproximadamente 9,2 mil millones) y un contexto declarado de 262.144 tokens, se posiciona en la franja de modelos densos de tamaño medio con ventana de contexto muy amplia, lo que lo hace teóricamente apto para tareas de procesamiento de documentos largos y conversaciones multi-turno extensas.

La model card es extremadamente escueta: se limita a indicar que se trata de un LM causal de la familia Qwen3.5, con 32 capas, hidden size 4096, intermediate size 12288, vocabulario de 248.320 tokens, precisión bf16 y pesos distribuidos en cuatro shards de safetensors. No se documentan datos de entrenamiento, composición del dataset, procesos de alineación (RLHF/DPO) ni resultados de evaluación.

El modelo tiene un perfil de tracción nulo en el momento de la consulta (0 descargas, 0 likes) y no declara licencia ni idiomas soportados, lo que limita seriamente su evaluación para uso en producción. Existe un repositorio GGUF separado con una cuantización Q8_0 de 9,2B, lo que facilita su despliegue en entornos con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal, familia Qwen3.5 (`Qwen3_5ForCausalLM`) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16 (pesos originales); GGUF Q8_0 disponible en repo separado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards), GGUF (repo separado) |
| Capas | 32 |
| Hidden size | 4096 |
| Intermediate size | 12288 |
| Vocabulario | 248.320 tokens |
| Tamano del repo | 18,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo decoder-only con atención causal, implementado bajo la clase `Qwen3_5ForCausalLM` de la librería transformers. La configuración declarada incluye 32 capas, un tamaño oculto de 4096 y una dimensión intermedia de 12288 en las capas feed-forward, con un vocabulario de 248.320 tokens. Los pesos se distribuyen en cuatro shards de safetensors en precisión bf16.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o instruction tuning. Tampoco se documentan innovaciones técnicas específicas más allá de lo que implica la familia Qwen3.5 (de la que el autor no aporta detalles adicionales). El contexto de 262.144 tokens es el dato técnico más relevante declarado, aunque no se especifica si se logra mediante extensión por RoPE scaling, atención con ventana deslizante u otra técnica.

## Capacidades

- Generación de texto causal autoregresiva en modo conversacional (tag `conversational`).
- Ventana de contexto de 262.144 tokens, adecuada para documentos extensos y diálogos prolongados.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere integración con infraestructura de inferencia estándar.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponible (modelo exclusivamente de texto).

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes técnicos o expedientes completos en una sola pasada sin necesidad de chunking, lo que simplifica pipelines de extracción y resumen.
- Análisis de repositorios de código: la ventana amplia permite cargar múltiples ficheros de un proyecto y realizar preguntas transversales sobre la arquitectura o dependencias, siempre que se valide empíricamente la calidad en código (no documentada).
- Conversación multi-turno extensa: útil en asistentes que acumulan historial largo sin truncar, gracias al contexto declarado de 262k tokens.
- Despliegue en hardware de consumo: la cuantización Q8_0 de 9,2B en GGUF permite ejecución local con llama.cpp u Ollama en GPUs con 12-16 GB de VRAM, abaratando prototipado.
- Investigación sobre contexto largo: sirve como base para experimentos de recuperación en el contexto (needle-in-a-haystack) y evaluación de degradación atencional a 256k tokens.
- Generación de texto en pipelines de transformers: al ser compatible con la clase estándar `Qwen3_5ForCausalLM`, se integra directamente en flujos existentes basados en HuggingFace transformers y en servidores compatibles con la API de OpenAI.
- Fine-tuning experimental: sus 9,2B parámetros permiten ajuste con LoRA en una sola GPU de 24 GB (RTX 3090/4090) en bf16 con técnicas de ahorro de memoria, aunque la ausencia de licencia clara desaconseja uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 18,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 24 GB para inferencia cómoda.
- VRAM estimada en Q8_0 (GGUF): en torno a 9,5-10 GB para pesos, con margen adicional para el KV cache, que crece linealmente con la longitud de contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090, RTX 4080 o RTX 4070 Ti Super para Q8_0.
- Cabe en GPU de consumo: sí, en formato Q8_0 GGUF con GPUs de 12-16 GB o superiores; en bf16 requiere 24 GB o más.
- Opciones de despliegue: transformers (nativo), llama.cpp y Ollama mediante el repo GGUF, vLLM y TGI si la arquitectura Qwen3.5 está soportada por dichos motores (no verificado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Starlight-Flash | ~9,2B | 262.144 | no disponible | safetensors, GGUF | HuggingFace (0 descargas) |
| Qwen2.5-7B | ~7,6B | 131.072 | Apache 2.0 (Qwen2.5) | safetensors, GGUF | HuggingFace, ampliamente adoptado |
| Llama 3.1 8B | ~8B | 131.072 | Llama 3.1 Community License | safetensors, GGUF | HuggingFace, ampliamente adoptado |
| Gemma 2 9B | ~9B | 8.192 | Gemma Terms of Use | safetensors, GGUF | HuggingFace, ampliamente adoptado |

La comparativa se limita a parámetros, contexto y licencia porque no hay benchmarks publicados de Starlight-Flash. Frente a sus alternativas, destaca por el contexto declarado (262k frente a 131k de Qwen2.5-7B y Llama 3.1 8B) y por un tamaño similar a Gemma 2 9B, pero carece de licencia declarada, de idiomas documentados y de cualquier evaluación pública, lo que lo sitúa en desventaja frente a modelos con ecosistema consolidado.

## Limitaciones y advertencias

- Ausencia total de licencia: no se puede determinar si el uso comercial está permitido; desaconsejado en producción hasta aclararlo con el autor.
- Idiomas no declarados: se desconoce la cobertura multilingüe real y la calidad en castellano.
- Sin benchmarks ni evaluación pública: imposible verificar calidad en razonamiento, código, matemáticas o seguimiento de instrucciones.
- Sin documentación de entrenamiento: se desconocen los datos, posibles sesgos y el proceso de alineación, lo que impide evaluar riesgos de toxicidad o alucinación.
- Tracción nula (0 descargas, 0 likes): no hay evidencia de uso comunitario ni de validación independiente.
- Contexto de 262k declarado pero no verificado: la degradación atencional a longitudes extremas no está documentada.
- Riesgo de alucinación: inherente a los LM causales; sin datos de alineación, el riesgo es imposible de acotar.
- El nombre "Starlight-Flash" y la etiqueta "Flash" no implican optimizaciones de atención tipo FlashAttention ni un modo rápido verificado; es solo denominación comercial.
- Repo GGUF separado con una única cuantización Q8_0: no hay variedad de cuantizaciones (Q4_K_M, Q5_K_M, etc.) para ajustar el equilibrio tamaño/calidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Sethblocks/Starlight-Flash
- Repo GGUF: https://huggingface.co/Sethblocks/Starlight-Flash-GGUF
- Paper, blog o demo oficial: no disponible
