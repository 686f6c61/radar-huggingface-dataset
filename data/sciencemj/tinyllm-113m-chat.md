# sciencemj/tinyllm-113m-chat

## Resumen

tinyllm-113m-chat es un modelo de lenguaje conversacional en inglés de 112.678.656 parámetros desarrollado por el usuario independiente sciencemj. Se construye sobre la arquitectura estándar `LlamaForCausalLM` de transformers y se entrena desde cero: primero con preentrenamiento sobre 15.000 millones de tokens de FineWeb-Edu y después con un ajuste supervisado (SFT) sobre conversaciones de smol-smoltalk y SODA. Todo el proceso se ejecutó en una única GPU NVIDIA L4.

El modelo se presenta explícitamente como un proyecto de aprendizaje: una reproducción a pequeña escala de la receta moderna de un LLM (tokenizador propio, preentrenamiento, SFT y exportación). No compite con modelos de gran tamaño; su objetivo es demostrar el ciclo completo de entrenamiento y ofrecer un modelo de charla sencilla multi-turno con un coste de inferencia mínimo.

Su relevancia práctica es doble: por un lado, sirve como banco de pruebas educativo y reproducible para quienes quieren entender el pipeline completo; por otro, su reducido tamaño (0,5 GB de repo) permite desplegarlo en hardware muy modesto. La ventana de contexto es de solo 1.024 tokens y el modelo no está diseñado para tareas de conocimiento factual, matemáticas o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `LlamaForCausalLM` (transformers 5.22.1) |
| Parametros totales | 112.678.656 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Detalles arquitectónicos adicionales: 14 capas, dimensión oculta 768, FFN de 2.048 con SwiGLU, 12 cabezas de consulta y 4 cabezas KV (GQA), dimensión de cabeza 64, RoPE con θ=10.000, RMSNorm con eps 1e-6, vocabulario de 32.000 tokens (BPE byte-level) y embeddings de entrada/salida atados.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con la configuración estándar de Llama, incluyendo atención con GQA (12 cabezas de consulta frente a 4 de clave-valor) y normalización RMSNorm. El tokenizador es un BPE byte-level de 32.000 entradas entrenado específicamente sobre FineWeb-Edu y datos de chat, lo que lo aleja del tokenizador original de Llama. El modelo usa atención SDPA y precisión mixta bf16.

El preentrenamiento consumió 15.000 millones de tokens de FineWeb-Edu (`sample-100BT`), aproximadamente 0,75 de una muestra de 20.000 millones, con 915.528 pasos de batch 16×1.024 tokens, learning rate de 6e-4 a 6e-5 con decaimiento coseno y 2.000 pasos de warmup; tardó unas 201 horas en una L4. El SFT se hizo sobre una época de smol-smoltalk y SODA (600,4 millones de tokens, 36.644 pasos), partiendo del checkpoint de preentrenamiento con mejor pérdida de validación (paso 879.999), con learning rate de 1e-4 a 1e-5 seleccionado tras dos pruebas de 2.000 pasos (pérdida de validación 1,689 a 1e-4 frente a 1,793 a 3e-5). Se usó AdamW (β 0,9/0,95), weight decay 0,1 (sin aplicar a embeddings ni normas), grad clip 1.0, y el stack Lightning, Hydra y W&B. La pérdida del SFT cubre todos los tokens, incluidos los turnos de usuario.

## Capacidades

- Generación de texto conversacional en inglés con formato multi-turno mediante plantilla de chat `<|user|>...<|eot|><|assistant|>...<|eot|>`.
- Charla sencilla y small talk natural (el ejemplo de la model card muestra respuestas coherentes a preguntas cotidianas y apoyo conversacional básico).
- Respuestas de una sola interacción con parada correcta en el token EOS `<|eot|>` (id 3).
- No soporta tool calling ni function calling (no documentado).
- No soporta razonamiento multi-paso ni comportamiento de agente (limitación declarada por el autor).
- No soporta visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.
- No dispone de ajuste de seguridad ni de alineación más allá del SFT conversacional.

## Casos de uso

- Prototipado educativo de pipelines de LLM: sirve para reproducir de extremo a extremo el ciclo tokenizador-preentrenamiento-SFT-exportación con un coste de cómputo mínimo (una sola L4), útil en cursos y talleres.
- Chatbot de demostración en entornos con hardware limitado: al ocupar 0,5 GB en safetensors y tener 113M de parámetros, puede ejecutarse en CPU o en GPU de gama baja para demos interactivas de conversación simple.
- Pruebas de integración con `transformers` y TGI: etiquetado como `text-generation-inference` y `endpoints_compatible`, permite validar flujos de despliegue y plantillas de chat sin gastar recursos en modelos grandes.
- Generación de texto de relleno o sintético para pruebas de UI: útil para poblar interfaces de chat con respuestas plausibles en inglés durante el desarrollo frontend.
- Investigación sobre SFT a pequeña escala: su model card documenta curvas de pérdida, elección de learning rate y comparación de checkpoints, lo que lo convierte en un caso de estudio reproducible para experimentos de ajuste supervisado.
- Benchmark de infraestructura de entrenamiento: con tiempos y pasos documentados (201 h de preentrenamiento, 9 h de SFT en L4), sirve como referencia para medir throughput de frameworks como Lightning o para comparar GPUs.
- Filtro o clasificador conversacional ligero en pipelines: aunque no está entrenado para ello, su bajo coste permite experimentar con tareas de generación corta en inglés donde la precisión factual no sea crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas de pérdida:

| Metrica | Valor |
|---|---|
| Pérdida de validación en preentrenamiento (FineWeb-Edu, 22,2M tokens) | 3,1298 nats/token |
| Bits por carácter en preentrenamiento | 1,0021 |
| Pérdida de validación en SFT (test de smol-smoltalk + validación de SODA) | 1,4069 |
| Pérdida de entrenamiento en SFT (últimos 500 pasos) | 1,4952 |

El autor advierte que las pérdidas por token dependen del tokenizador y no son comparables entre modelos; los 0,4659 bits/char del modelo anterior de 29M se midieron sobre TinyStories, un corpus mucho más fácil, por lo que tampoco son comparables.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,25 GB para los pesos (113M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna; el propio autor entrenó en una NVIDIA L4. Funciona también en RTX 4090, RTX 3090, A100, H100 y GPUs de gama de entrada como T4.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM; también puede ejecutarse en CPU para inferencia interactiva con latencia aceptable.
- Opciones de despliegue: `transformers` nativo (sin `trust_remote_code`), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`). No se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa no oficial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| tinyllm-113m-chat | 112,7M | 1.024 | en | Apache-2.0 | Proyecto educativo, SFT sobre smol-smoltalk y SODA |
| tinyllm-29m-chat (versión anterior del mismo autor) | ~29M | no disponible | en | no disponible | Versión previa, evaluada en TinyStories |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 | en (principalmente) | Apache-2.0 | Modelo pequeño de referencia de Hugging Face, con más datos de entrenamiento |
| Qwen2.5-0.5B | ~494M | 32.768 | multilingüe | Apache-2.0 | Alternativa de mayor tamaño con contexto y capacidades muy superiores |

La comparación con SmolLM-135M y Qwen2.5-0.5B es orientativa por categoría (modelos pequeños); no se dispone de benchmarks comparativos directos en la información proporcionada. El modelo de sciencemj destaca por su transparencia documental y su enfoque educativo, no por rendimiento.

## Limitaciones y advertencias

- Los hechos son poco fiables: produce texto fluido con errores confiados; no debe usarse como fuente de información.
- Matemáticas, código y razonamiento: a menudo esquiva la pregunta o responde incorrectamente (el propio autor muestra que a "¿cuánto es dos más dos?" responde con una descripción del problema sin dar el resultado).
- Salidas largas como historias o poemas derivan del tema; a veces acepta una petición y termina el turno sin completarla.
- Solo inglés; no hay soporte multilingüe.
- Sin ajuste de seguridad: puede reproducir sesgos presentes en el texto web de FineWeb-Edu.
- Contexto muy limitado (1.024 tokens): en conversaciones largas hay que descartar turnos antiguos.
- Licencia Apache-2.0 para los pesos, pero los datasets subyacentes tienen sus propias licencias (FineWeb-Edu ODC-By 1.0 y términos de Common Crawl; smol-smoltalk Apache-2.0; SODA CC-BY-4.0), con obligaciones de atribución.
- No apto para consejos, decisiones o cualquier uso donde una respuesta errónea cause daño.
- Sin datos publicados de benchmarks estándar ni de latencia/throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sciencemj/tinyllm-113m-chat
- Modelo base: https://huggingface.co/sciencemj/tinyllm-113m-base
- Versión anterior: https://huggingface.co/sciencemj/tinyllm-29m-chat
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset SODA: https://huggingface.co/datasets/allenai/soda
