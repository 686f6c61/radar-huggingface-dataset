# joey00072/ohara-chat-d12

## Resumen

ohara-chat-d12 es un modelo de chat de 124 millones de parámetros efectivos (162,2 millones en total) entrenado desde cero con la librería ohara, una implementación de modelos autorregresivos en PyTorch. El autor, joey00072, lo presenta como una réplica extremo a extremo del pipeline nanochat: preentrenamiento sobre el dataset ClimbMix y posterior ajuste supervisado (SFT) para convertirlo en un modelo conversacional. El entrenamiento completo se realizó en aproximadamente 4,4 horas sobre dos GPU A100 de 80 GB.

El modelo sigue una arquitectura tipo Llama (decoder con RoPE, SwiGLU, RMSNorm y embeddings sin atar) y tiene una ventana de contexto de 2048 tokens. Su vocabulario es el de gpt-neo-125m ampliado con 8 tokens especiales de chat. La model card es explícita en cuanto a sus limitaciones: a pesar de tener la forma de un asistente, el modelo confabula libremente y no es útil como asistente real. Se trata de una demostración de que el pipeline de entrenamiento funciona, no de un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder Llama-style (RoPE, SwiGLU, RMSNorm, embeddings sin atar) |
| Parametros totales | 162,2 M |
| Parametros activos | 123,5 M (efectivos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos en formato nativo de PyTorch) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 12 capas, 768 dimensiones ocultas y 6 cabezas de atención. Utiliza embeddings sin atar (untied embeddings), inicialización estilo nanochat y se entrena con el optimizador Muon para las matrices y AdamW para embeddings y escalares. El preentrenamiento se realizó sobre 1,48 mil millones de tokens de ClimbMix en 2.827 pasos con un batch de 524.288 tokens, alcanzando una pérdida de validación de 2,9153 y una precisión de siguiente token del 43,6 %. El ajuste supervisado se llevó a cabo durante 800 pasos sobre 567.656 conversaciones de SmolTalk, MMLU y GSM8K, con pérdida calculada únicamente sobre los tokens del asistente. Tras el SFT, la pérdida de validación bajó de 2,2507 a 1,2084 y la perplejidad de 9,49 a 3,35.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat multi-turno (marcadores `<|user_start|>`, `<|assistant_start|>`, etc.).
- Aprendizaje de la estructura de la conversación: el modelo respeta los turnos y aprende a detenerse con el token de cierre.
- Capacidad básica de razonamiento matemático y factual limitada, heredada del SFT sobre GSM8K y MMLU, pero con alta propensión a la confabulación.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso fiable.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Investigación educativa sobre pipelines de entrenamiento: sirve para estudiar el flujo completo de preentrenamiento y SFT con una inversión de cómputo mínima, replicable en pocas horas.
- Validación de infraestructura de entrenamiento: permite comprobar que la librería ohara funciona correctamente antes de escalar a modelos mayores.
- Experimentación con técnicas de inicialización y optimización (Muon, AdamW) en un entorno de bajo coste.
- Prototipado de interfaces de chat: el modelo puede integrarse en demos de navegador para probar la interacción conversacional, aunque no se recomienda para uso real.
- Generación de ejemplos sintéticos de conversación con formato correcto, útiles para probar pipelines de post-procesado.
- Benchmark de eficiencia de entrenamiento: comparar el coste de 1,4e18 FLOPs frente a otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta métricas de validación del propio entrenamiento:

| Metrica | Antes del SFT | Despues del SFT |
|---|---|---|
| Val loss | 2,2507 | 1,2084 |
| Val perplexity | 9,49 | 3,35 |
| Next-token accuracy | 55,0 % | 69,4 % |

Durante el preentrenamiento, la pérdida de validación en bits/byte pasó de 1,0625 a 0,9062. El autor indica que nanochat alcanza calidad GPT-2 con 0,718 bpb usando aproximadamente 28 veces más cómputo.

## Requisitos de hardware

- Inferencia viable en CPU: con 162 M de parámetros, el modelo ocupa unos 650 MB en fp32 y unos 325 MB en fp16, por lo que puede ejecutarse en cualquier máquina moderna sin GPU.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) es suficiente para inferencia con baja latencia.
- Entrenamiento desde cero: el autor usó 2 GPU A100 de 80 GB durante 4,4 horas, aunque el coste real de cómputo es de 1,4e18 FLOPs, alcanzable con hardware más modesto si se dispone de más tiempo.
- Opciones de despliegue: al ser un checkpoint nativo de ohara, se puede cargar con la clase `ChatEngine` de la librería o servir mediante el script `chat_web.py` incluido en el repositorio. No hay soporte directo para vLLM, llama.cpp u Ollama sin conversión previa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ohara-chat-d12 | 123,5 M efectivos | 2048 | 1,48B tokens + SFT | MIT | HuggingFace |
| nanochat (referencia) | ~124 M | 2048 | ~40B tokens (estimado) | MIT | GitHub |
| GPT-2 (124M) | 124 M | 1024 | ~40B tokens | MIT | OpenAI / HuggingFace |

ohara-chat-d12 es una réplica a escala reducida de nanochat. Mientras que nanochat alcanza calidad GPT-2 con 0,718 bpb, ohara-chat-d12 se queda en 0,9062 bpb, lo que indica un rendimiento inferior pero con un coste de entrenamiento mucho menor. La comparativa directa con GPT-2 no es posible porque no se han publicado resultados de benchmarks estándar para este modelo.

## Limitaciones y advertencias

- El modelo confabula libremente: produce respuestas con la forma correcta pero contenido inventado, como se muestra en los ejemplos de la model card (afirma que la capital de Francia es París y luego añade información falsa).
- No es apto para uso en producción como asistente conversacional, generación de código o cualquier tarea que requiera precisión factual.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La ventana de contexto de 2048 tokens es limitada para tareas que requieran contexto largo.
- El formato de pesos es exclusivo de la librería ohara (.pt), lo que dificulta su uso con herramientas estándar como Transformers o llama.cpp sin conversión manual.
- No se han publicado resultados de benchmarks estándar, por lo que su rendimiento relativo frente a otros modelos es desconocido.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joey00072/ohara-chat-d12
- Modelo base (preentrenado): https://huggingface.co/joey00072/ohara-base-d12
- Repositorio ohara en GitHub: https://github.com/joey00072/ohara
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Perfil del autor en HuggingFace: https://huggingface.co/joey00072
