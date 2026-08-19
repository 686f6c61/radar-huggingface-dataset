# PocketAiHub/Qwen3.8-27B-Abliterated-MTPLX-Optimized-Speed

## Resumen

Este modelo es una conversión derivada de `Qwen/Qwen3.8-27B`, desarrollada por PocketAiHub, que combina dos modificaciones principales: una proyección ortogonal de la dirección de rechazo (abliteration) sobre 80 tensores residuales de salida del lenguaje, y una cuantización mixta optimizada para Apple Silicon mediante el runtime MTPLX 2.7.1. El resultado es un checkpoint de 21.3 GB que aprovecha la predicción multi-token nativa (MTP) del modelo base para acelerar la decodificación especulativa, alcanzando hasta 2.35× de velocidad frente a la decodificación autorregresiva en hardware Apple M5 Max.

La relevancia de este modelo radica en su enfoque en el despliegue local en macOS: el layout de precisión mixta (4-bit/8-bit/BF16) y el contrato de runtime MTP nativo permiten ejecutar un modelo multimodal de 27B en memoria unificada con rendimiento competitivo. Además, la eliminación del comportamiento de rechazo explícito lo convierte en un objeto de investigación para estudiar la alineación y la seguridad, aunque con advertencias claras sobre su uso. Es importante señalar que los parámetros totales reportados en los safetensors (6.086.364.400) corresponden al checkpoint cuantizado, no al modelo base de 27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con predicción multi-token (MTP) nativa; no se especifica detalle adicional |
| Parametros totales | 6.086.364.400 (checkpoint cuantizado); el modelo base Qwen3.8-27B tiene 27B (no verificado) |
| Parametros activos | no disponible (no se indica si es MoE; probablemente denso) |
| Longitud de contexto | 262.144 tokens configurados; validado hasta 4K en pruebas |
| Tipos de cuantizacion | Mixta: bulk 4-bit/group 32; embeddings, LM head, proyecciones GDN y últimos 8 bloques MLP en 8-bit/group 64; tensores de estado/norma y cabeza MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B`, un transformer multimodal de la familia Qwen con soporte de imagen y predicción multi-token (MTP). PocketAiHub aplicó una proyección ortogonal sobre 80 tensores residuales de salida del lenguaje para suprimir la dirección de rechazo aprendida, un proceso conocido como abliteration. Posteriormente, el checkpoint se convirtió y cuantizó con MTPLX 2.7.1 siguiendo el layout de precisión mixta de `Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed`: la mayor parte de los pesos en 4-bit, capas sensibles en 8-bit y la cabeza MTP en BF16.

No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre el proceso de alineación original (RLHF/DPO). La conversión no implica entrenamiento adicional; solo se modifican los pesos mediante la proyección de rechazo y la cuantización. El runtime MTPLX implementa decodificación especulativa con profundidad MTP configurable (D1 a D3), lo que acelera la generación sin cambiar la distribución del modelo base más allá de la cuantización y la abliteration.

## Capacidades

- Generación de texto conversacional y de largo alcance con contexto de hasta 262.144 tokens configurados.
- Razonamiento con modo "thinking" activable o desactivable (validado en las pruebas del autor).
- Entrada multimodal de imagen (PNG, JPEG, WebP) a través de `image_url` en la API compatible con OpenAI; identificación de colores y objetos básicos verificada.
- Tool calling / function calling: 8/8 pruebas de selección estructurada de herramientas superadas.
- Decodificación especulativa nativa con MTP de profundidad 3, que ofrece hasta 2.35× de velocidad frente a autorregresiva en Apple Silicon.
- Capacidades multilingües no documentadas, pero heredadas del modelo base Qwen (esperable en chino, inglés y otros, sin confirmación).

## Casos de uso

- Asistente local en macOS con privacidad: al ejecutarse en memoria unificada de Apple Silicon, permite conversaciones y análisis de documentos sin conexión a internet, ideal para entornos con requisitos de confidencialidad.
- Generación de código asistida con tool calling: el modelo puede seleccionar y llamar funciones en un IDE o pipeline de CI/CD, aprovechando el soporte de herramientas validado (8/8).
- Análisis de imágenes y descripción de contenido: gracias a la entrada multimodal, puede procesar capturas, diagramas o fotos y generar descripciones o respuestas contextuales.
- Investigación en seguridad y alineación: la versión abliterada sirve para estudiar el comportamiento de rechazo, medir la divergencia KL y comparar respuestas con el modelo original.
- Prototipado rápido de agentes conversacionales: el servidor MTPLX expone una API compatible con OpenAI, lo que facilita integrar el modelo en frameworks de agentes con razonamiento multi-paso.
- Evaluación de rendimiento de decodificación especulativa: los datos de velocidad (hasta 58 tok/s en M5 Max) lo convierten en un banco de pruebas para optimizar pipelines de inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona mediciones propias de rendimiento en Apple M5 Max (40-core GPU, 128 GB unificados, macOS 26.4) y pruebas de validación funcional:

| Prueba | Resultado |
|---|---|
| Velocidad AR (decode) | 24.74 tok/s |
| Velocidad D1 (decode) | 41.55 tok/s (1.68×) |
| Velocidad D2 (decode) | 51.55 tok/s (2.08×) |
| Velocidad D3 (decode) | 58.05 tok/s (2.35×) |
| Prefill 4K contexto (D3) | 615.2 tok/s |
| Pico de memoria (D3, 4K) | 29.0 GB |
| Explicit-refusal screen (JBB harmful) | 0/100 rechazos explícitos |
| Explicit-refusal screen (JBB benign) | 0/100 rechazos explícitos |
| KL divergence (regular → abliterated) | media 0.30906 nats, top-1 acuerdo 85.94% |
| Tool-selection checks | 8/8 |
| Capability checks | 12/12 |

Estos datos son mediciones del autor sobre este artefacto exacto y no constituyen garantías universales. No hay comparativa con otros modelos en benchmarks de calidad.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 21.3 GB en descarga; el pico de footprint medido en 4K contexto es de 29.0 GB (D3). En GPUs de consumo con 24 GB (RTX 3090/4090) podría caber con cuantización 4-bit, pero no está validado.
- GPU recomendadas: Apple Silicon con memoria unificada (M5 Max validado; M1/M2/M3/M4 probablemente compatibles con MTPLX). No se han probado GPUs NVIDIA/AMD.
- Opciones de despliegue: MTPLX 2.7.1 con `mtplx serve` (API OpenAI-compatible en `http://127.0.0.1:8000/v1`). No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: en M5 Max, decode a 58.05 tok/s (D3) y prefill a 615.2 tok/s para 4K tokens. En hardware inferior, los valores serán menores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 | BF16 (original) | Apache-2.0 | Modelo original sin abliteration ni cuantización |
| PocketAiHub/Qwen3.8-27B-Abliterated-MTPLX-Optimized-Speed | 6.08B (cuantizado) | 262.144 | Mixta 4/8-bit | Apache-2.0 | Derivado abliterado y cuantizado para Apple Silicon |
| Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed | no disponible | no disponible | Mixta 4/8-bit | no disponible | Receta de cuantización sin abliteration |

No se dispone de datos de rendimiento comparativo en benchmarks de calidad. La comparativa se limita a características técnicas.

## Limitaciones y advertencias

- La abliteration suprime el comportamiento de rechazo aprendido; el modelo puede producir contenido incorrecto, dañino o impredecible. No es más seguro ni garantiza cumplimiento.
- El autor advierte explícitamente que el modelo no debe usarse sin salvaguardas apropiadas para el caso de uso.
- Riesgo de alucinación inherente a los modelos generativos; no hay validación de veracidad en las pruebas publicadas.
- La divergencia KL media de 0.309 nats frente al modelo cuantizado regular indica que la abliteration introduce una deriva significativa en la distribución de salida, especialmente en prompts dañinos (0.56 nats).
- El soporte de vídeo no está probado; solo se incluyen metadatos del procesador de vídeo en el checkpoint.
- La licencia Apache-2.0 permite uso comercial, pero el modelo derivado puede heredar restricciones del base (Qwen3.8-27B es Apache-2.0, por lo que no hay conflicto conocido).
- El rendimiento medido es específico de Apple M5 Max; en otros hardware los resultados variarán.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MTPLX-Optimized-Speed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio MTPLX: https://github.com/youssofal/MTPLX
- Receta de cuantización de referencia: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed
