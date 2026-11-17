# Phase-Technologies/FORGE-500M-Chat

## Resumen

FORGE-500M-Chat es un modelo de lenguaje conversacional de escala sub-mil millones desarrollado por Phase-Technologies (autoría de Soham Pal) y publicado bajo licencia Apache 2.0. Su propuesta central es sustituir la autoatención cuadrática por una recurrencia de espacio de estados lineal, combinada con una mezcla de expertos dispersa jerárquica (HSE-MoE), para reducir el coste computacional de la inferencia manteniendo capacidad conversacional. El modelo parte de una base preentrenada desde cero (`forge-500m-base`) y se alinea mediante SFT y DPO sobre datos de diálogo multi-turno.

La arquitectura es híbrida: 18 capas totales, de las cuales 15 son capas SSM con *Adaptive Recurrent Gating* (ARG) y solo 3 son capas de atención global multi-cabeza con RoPE y YaRN. De las 18 capas, 9 incorporan FFN densas SwiGLU y 9 incorporan módulos MoE con 32 expertos y activación top-2. El contexto nativo es de 4.096 tokens, ampliable a 16.384 mediante YaRN.

Es relevante ahora por dos motivos: primero, explora un paradigma híbrido SSM/atención en un rango de tamaño donde predominan los transformers densos convencionales; segundo, documenta públicamente su trayectoria de entrenamiento completa (1,66 mil millones de tokens en 821 pasos sobre 4× NVIDIA B300 SXM6 en modo MIG), lo que lo convierte en un caso de estudio de reproducibilidad más que en un modelo de producción de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 15 capas SSM con Adaptive Recurrent Gating (ARG) + 3 capas de atención global MHA con RoPE/YaRN; 9 FFN densas SwiGLU + 9 FFN MoE (HSE, 32 expertos, top-2) |
| Parametros totales | 711.080.311 según safetensors; la model card declara 500.019.616 |
| Parametros activos | ~320.000.000 (declarado por el autor, vía HSE-MoE disperso) |
| Longitud de contexto | 4.096 tokens nativo; hasta 16.384 con YaRN |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, requiere `trust_remote_code` por `custom_code`) |

Otros datos técnicos declarados: dimensión oculta de 1.024, 8 cabezas de atención (8 Q, 8 KV), vocabulario de 206.464 tokens con tokenizador propietario "CRAYON Turbo" (BPE con fallback de bytes), tamaño de repositorio de 4,3 GB.

## Arquitectura y entrenamiento

El modelo combina dos mecanismos de secuencia: recurrencia de espacio de estados lineal (ARG) en 15 de las 18 capas, que procesa la secuencia en tiempo lineal respecto a la longitud, y atención global multi-cabeza en 3 capas, que preserva el acceso de largo alcance. La mitad de las capas usan FFN densas SwiGLU con expansión 8/3 × d_model y la otra mitad usan un módulo MoE jerárquico con 32 expertos y enrutamiento top-2, lo que explica la diferencia entre parámetros totales y activos. La cabeza de proyección LM se aplica de forma troceada (`chunk_size=1024`) sobre el vocabulario de 206.464 tokens para evitar picos de VRAM.

El preentrenamiento se realizó desde cero sobre 1.660.944.384 tokens (1,66 mil millones), con batch global de 1.048.576 tokens por paso (32 micro-batches × 32.768) y un throughput físico declarado de 7.337 tokens/s (~26,4 M tokens/hora) sobre 4× NVIDIA B300 SXM6 MIG (`1g.34gb`, 18 SMs, CUDA 13.2). La pérdida bajó de 12,512 (perplejidad >150.000) en el paso 1 a 4,6473 (perplejidad 104,30) en el paso 821. El ajuste supervisado usó una mezcla de ShareGPT, UltraChat, CodeFeedback, MetaMath y OpenOrca, con enmascaramiento de pérdida en turnos de asistente, DDP sobre las 4 GPUs, decaimiento coseno de 2e-5 a 2e-6 y autocast BF16, alcanzando una pérdida de ~4,0. El DPO se aplicó sobre UltraFeedback, Anthropic HH-RLHF y HelpSteer2 con modelo de referencia congelado en BF16 y β = 0,1.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con formato de plantilla de chat y separación de turnos aprendida vía SFT.
- Instrucciones generales y respuesta a preguntas, derivadas de la mezcla de UltraChat y OpenOrca.
- Programación en Python, a partir de los pares de CodeFeedback incluidos en el SFT.
- Razonamiento matemático básico, por la inclusión de MetaMath en el corpus de ajuste.
- Alineación de preferencias y rechazo de peticiones peligrosas, entrenado con DPO sobre HH-RLHF y HelpSteer2.
- Procesamiento de secuencias largas relativas a su tamaño gracias a las capas SSM de coste lineal, hasta 4.096 tokens nativos.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- **Asistente conversacional ligero en local**: el modelo cabe en una GPU de consumo con cuantización de 8 bits o inferior (los pesos en BF16 ocupan ~1,4 GB según los 711 M de parámetros reales), lo que permite desplegar un chatbot de inglés en estaciones de trabajo sin conexión.
- **Prototipado de arquitecturas híbridas SSM/atención**: al publicar el código personalizado y los logs de entrenamiento completos, sirve como base para experimentar con recurrencia lineal y enrutamiento MoE en un rango de tamaño manejable.
- **Generación de código asistida en entornos con recursos limitados**: los pares de CodeFeedback del SFT permiten autocompletado y explicación de fragmentos Python en plugins de editor que no pueden asumir un modelo de 7B o superior.
- **Clasificación y reescritura de texto en pipelines por lotes**: su coste lineal en longitud de secuencia lo hace adecuado para procesar grandes volúmenes de documentos cortos en inglés con throughput predecible.
- **Investigación en alineación y DPO**: la combinación documentada de SFT con enmascaramiento por turno y DPO con β = 0,1 sobre HH-RLHF y HelpSteer2 facilita reproducir experimentos de preferencias a pequeña escala.
- **Evaluación comparativa de tokenizadores de vocabulario grande**: el tokenizador CRAYON Turbo de 206.464 entradas permite estudiar el equilibrio entre tamaño de vocabulario, parámetros de embedding y calidad en lenguas con morfología rica.
- **Generación de datos sintéticos de diálogo**: puede producir turnos de conversación en inglés para aumentar corpus de entrenamiento de modelos mayores, siempre con revisión humana por su tasa de alucinación esperable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida final de preentrenamiento 4,6473 (perplejidad 104,30) en el paso 821, pérdida de SFT en torno a 4,0 y margen de recompensa positivo en DPO, sin valores numéricos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM en BF16**: ~1,4 GB solo para pesos (711 M de parámetros reales); con caché KV, activaciones y overhead de runtime, estimación práctica de 3-4 GB.
- **VRAM en cuantización de 8 bits**: ~0,8-1 GB de pesos; en 4 bits, ~0,4-0,5 GB. Los formatos de cuantización concretos no están documentados por el autor.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para BF16 con contexto completo; RTX 3060/4060, RTX 4090, A100 y H100 son suficientes. El entrenamiento se realizó sobre 4× NVIDIA B300 SXM6 en modo MIG (`1g.34gb`), pero ese hardware no es necesario para inferencia.
- **Cabe en GPU de consumo**: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- **Opciones de despliegue**: requiere `trust_remote_code=True` por el código personalizado (`custom_code`), lo que limita la compatibilidad directa con vLLM, TGI o llama.cpp sin portar la arquitectura. La vía documentada es PyTorch con `transformers` y carga remota de código; no hay pesos GGUF publicados.
- **Latencia y throughput**: no disponible para inferencia. El dato de 7.337 tokens/s corresponde al entrenamiento en 4× B300 MIG, no a decoding.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FORGE-500M-Chat | 711 M totales / ~320 M activos (declarado) | 4.096 (16.384 con YaRN) | Híbrida SSM + MHA + MoE | Apache 2.0 | Hugging Face, requiere `trust_remote_code` |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 | Transformer denso | Apache 2.0 | Hugging Face, ecosistema estándar (GGUF, vLLM, Ollama) |
| SmolLM2-360M-Instruct | 362 M | 8.192 | Transformer denso | Apache 2.0 | Hugging Face, ecosistema estándar |
| Mamba-130M / Mamba-370M | 130 M / 370 M | 2.048 | SSM puro | Apache 2.0 | Hugging Face, sin ajuste conversacional oficial |

La comparación de rendimiento cualitativo no es posible: no hay benchmarks publicados de FORGE-500M-Chat frente a estas alternativas. En la práctica, los modelos densos comparables ofrecen contextos más largos, cuantizaciones listas para usar y soporte nativo en los principales runtimes de inferencia, ventajas operativas que FORGE no cubre todavía.

## Limitaciones y advertencias

- **Volumen de entrenamiento muy reducido**: 1,66 mil millones de tokens es un orden de magnitud inferior a lo habitual en modelos de este tamaño (decenas o cientos de miles de millones). La perplejidad final de 104,30 es alta y anticipa una calidad de generación limitada y una tasa de alucinación elevada.
- **Solo inglés**: la model card declara únicamente `en`; no hay evidencia de competencia multilingüe y el tokenizador, pese a su vocabulario grande, no está validado en otros idiomas.
- **Discrepancia en el recuento de parámetros**: la model card declara 500.019.616 parámetros totales, mientras que los safetensors contienen 711.080.311. Esta inconsistencia debe tenerse en cuenta al planificar memoria y al evaluar las afirmaciones sobre parámetros activos.
- **Compatibilidad limitada**: el uso de `custom_code` impide la carga directa en vLLM, TGI, llama.cpp u Ollama sin trabajo de portabilidad; no hay GGUF ni cuantizaciones publicadas.
- **Contexto corto**: 4.096 tokens nativos es reducido frente a alternativas contemporáneas de tamaño similar; YaRN a 16.384 no está validado con benchmarks publicados.
- **Sesgos**: no se documenta ninguna evaluación de sesgos; los corpus de SFT y DPO (ShareGPT, UltraChat, OpenOrca, UltraFeedback, HH-RLHF) arrastran los sesgos habituales de datos web y sintéticos en inglés.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo no incluye garantías y su calidad no está validada para producción; se recomienda evaluación propia antes de cualquier despliegue real.
- **Reproducibilidad parcial**: se publican logs de entrenamiento, pero no se detalla la composición exacta ni las proporciones del dataset de preentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phase-Technologies/FORGE-500M-Chat
- Modelo base: https://huggingface.co/Phase-Technologies/forge-500m-base
- Log de entrenamiento (referenciado en la model card): `training_journey.log` dentro del repositorio de Hugging Face
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Paper, blog o demo adicionales: no disponible
