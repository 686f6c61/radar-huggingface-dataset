# athenista/slm-tavenel-story-935k

## Resumen

SLM-Tavenel Story 935K es un modelo de lenguaje de 935.040 parámetros entrenado desde cero para continuar historias infantiles en inglés. Lo publica el usuario athenista bajo licencia MIT como artefacto de investigación, con el objetivo de explorar los límites de los modelos de lenguaje extremadamente pequeños (SLM) en una tarea acotada y con un dataset sintético controlado, SimpleStories. No es un asistente conversacional ni un generador de historias fiable: es un predictor base que aprende la forma del lenguaje de cuentos pero pierde con frecuencia la coherencia de personajes, objetos y objetivos.

Arquitectura transformer decoder estándar de tipo Llama, con 4 bloques, anchura 128, atención causal de consultas agrupadas (4 cabezas de consulta, 1 de clave-valor, dimensión 32) y RoPE, más SwiGLU en las proyecciones feed-forward. El tokenizador es un BPE a nivel de byte de 1.024 entradas entrenado solo con las historias de entrenamiento, y la ventana de entrenamiento real es de 256 tokens, aunque el límite posicional configurado sea 1.024.

Su relevancia es doble: por un lado sirve como caso de estudio reproducible de entrenamiento desde cero en hardware de consumo (una RTX 4060 Laptop de 8 GB durante unos 9,4 minutos), y por otro documenta de forma explícita las incertidumbres de procedencia del dataset y los límites de la licencia, algo poco habitual en publicaciones de pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Llama: 4 bloques pre-RMSNorm, anchura 128, SwiGLU con tamaño intermedio 416, atención causal GQA (4 cabezas Q / 1 KV, dimensión 32, RoPE) |
| Parametros totales | 935.040 (embedding/output compartido: 131.072; proyecciones de atención: 163.840; proyecciones SwiGLU: 638.976; pesos RMSNorm: 1.152) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de entrenamiento aprendida de 256 tokens; límite posicional configurado de 1.024 tokens (contextos más largos rinden peor y no se recomiendan) |
| Tipos de cuantizacion | No se ha producido ni medido ninguna variante 4-bit ni GGUF; pesos en bfloat16 (checkpoint nativo en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (con incertidumbre documentada sobre los términos del servicio generador original; no es una certificación OSI ni una validación legal) |
| Formato de pesos | safetensors en bfloat16, exportación estándar `LlamaForCausalLM` con embeddings atados; no requiere código remoto específico |

## Arquitectura y entrenamiento

El modelo es un transformer decoder puro de tipo Llama sin puertas de atención adicionales ni normalización QK. La tabla de embeddings de tokens y la matriz de salida comparten pesos (131.072 parámetros), lo que reduce el recuento total. La atención es de consultas agrupadas con 4 cabezas de consulta y 1 de clave-valor, dimensión de cabeza 32 y RoPE; las proyecciones feed-forward usan SwiGLU con tamaño intermedio 416. El tokenizador es un BPE a nivel de byte de 1.024 entradas entrenado con una muestra sembrada de 30.000 documentos de entrenamiento locales.

El entrenamiento se hizo desde cero con semilla 421201, en una sola pasada, con AdamW (beta1 0.9, beta2 0.95, epsilon 1e-8, weight decay 0.1), schedule coseno con 300 actualizaciones de calentamiento, LR pico 1e-3 y LR mínimo 1e-4, durante 6.104 actualizaciones. El lote efectivo fue de 32 secuencias × 256 tokens × 2 pasos de acumulación = 16.384 posiciones por actualización, con una exposición total de 100.007.936 posiciones (aproximadamente cuatro pasadas sobre 24.806.504 posiciones de tokens de entrenamiento). Se usó precisión mixta bfloat16 con recorte de gradiente 1.0 y se habilitaron algoritmos deterministas (sin promesa de reproducibilidad bit a bit entre plataformas). El hardware fue una única RTX 4060 Laptop de 8 GB, con un pico de VRAM asignada de 0,566 GB y un consumo medido de 7,344 Wh en la placa GPU durante unos 9,4 minutos. Los datos provienen de 60.000 historias de entrenamiento de un único shard fijado de SimpleStories y 3.185 historias locales de desarrollo; el modelo no se entrenó con todo SimpleStories.

## Capacidades

- Generación de texto en inglés para continuación de historias infantiles sintéticas, con prompts que caben junto a la continuación en 256 tokens.
- Predicción base de siguiente token; no hay ajuste por instrucciones, RLHF ni DPO.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; el tokenizador y los datos son monolingües.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Inferencia en CPU posible con Transformers estándar, sin código remoto específico.

## Casos de uso

- Estudio de escalado en modelos de lenguaje: sirve como punto de referencia de 935.040 parámetros para comparar curvas de pérdida y coherencia frente a modelos mayores en la misma tarea, gracias a su entrenamiento reproducible y documentado.
- Docencia de arquitecturas transformer: el modelo es lo bastante pequeño (1,87 MB en bfloat16) para inspeccionar todas sus matrices de pesos y trazar el flujo completo de atención y SwiGLU en un cuaderno.
- Investigación sobre coherencia narrativa en SLM: permite medir con precisión dónde se pierden personajes, objetos y objetivos en continuaciones de 256 tokens, usando SimpleStories como conjunto de evaluación.
- Pruebas de tokenizadores BPE a nivel de byte: el tokenizador de 1.024 entradas entrenado solo con cuentos infantiles sirve para analizar el efecto del vocabulario en la morfología y la segmentación del inglés sencillo.
- Validación de pipelines de despliegue: al cargarse con `AutoModelForCausalLM` estándar y funcionar en CPU, se puede usar como caso de prueba ligero en integraciones de Transformers, TGI o endpoints compatibles antes de pasar a modelos mayores.
- Reproducción de experimentos de entrenamiento en hardware de consumo: el registro de entrenamiento (una RTX 4060 Laptop, 9,4 minutos, 7,344 Wh) permite replicar el proceso completo y verificar la reproducibilidad de la receta.
- Análisis de procedencia y licencias de datasets: el modelo incluye revisión de fuente y decisión de publicación documentadas, lo que lo convierte en un ejemplo práctico para estudiar cómo se documentan las incertidumbres legales en pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card solo incluye mediciones operativas de inferencia en CPU con dos hilos y lote 1, en float32, mediana de tres ejecuciones tras un calentamiento:

| Metrica (CPU, 2 hilos, batch 1) | Valor medido |
|---|---|
| Prefill, 128 tokens | 7,39 ms |
| Generación de 64 tokens, total | 0,210 s |
| Generación greedy con caché | 304,1 tokens/s |

Estas cifras proceden de una sola máquina y sesión, excluyen la carga del modelo y no constituyen una afirmación de velocidad independiente del hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32; el pico de VRAM asignada durante el entrenamiento fue de 0,566 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el entrenamiento se hizo en una RTX 4060 Laptop de 8 GB, y para inferencia basta con GPUs integradas o incluso CPU.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4060 y similares; también funciona en CPU.
- Opciones de despliegue: Transformers estándar (probado con PyTorch 2.10.0+cu130, Transformers 4.57.6, tokenizers 0.22.2 y safetensors 0.8.0); compatible con endpoints y text-generation-inference según los tags del repositorio. No hay variante GGUF ni cuantizada, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: en CPU float32 con dos hilos, prefill de 128 tokens en 7,39 ms y generación con caché de 304,1 tokens/s; no hay mediciones publicadas en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información proporcionada. Como referencia cualitativa de la categoría de SLM entrenados desde cero para tareas acotadas, se pueden considerar alternativas como TinyStories-1M de Microsoft (aproximadamente 1 millón de parámetros, entrenado con el dataset TinyStories, licencia MIT) y modelos de la familia SmolLM2 en sus variantes más pequeñas (135M, licencia Apache 2.0), pero no se han publicado comparaciones directas con SLM-Tavenel Story 935K en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SLM-Tavenel Story 935K | 935.040 | 256 tokens de entrenamiento (1.024 configurado) | MIT | Hugging Face |
| TinyStories-1M | ~1.000.000 | no disponible | MIT | Hugging Face |
| SmolLM2-135M | 135.000.000 | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Coherencia narrativa limitada: el propio autor indica que el modelo pierde con frecuencia el seguimiento de personajes, objetos y objetivos; no es un narrador fiable.
- No es un asistente conversacional: es un predictor base sin ajuste por instrucciones, por lo que no responde a preguntas ni sigue comandos.
- Riesgo de alucinación y degradación: al ser un modelo de 935.040 parámetros entrenado con 100 millones de posiciones de tokens, la generación puede derivar en texto incoherente o repetitivo, especialmente fuera de la ventana de 256 tokens.
- Limitación de contexto: aunque el límite posicional configurado sea 1.024 tokens, los contextos más largos rinden peor y no se recomiendan; el prompt más la continuación deben caber en 256 tokens.
- Limitación de idioma: solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Restricciones de licencia: el autor declara MIT, pero los términos del servicio generador original de SimpleStories no se han verificado de forma independiente; la model card aclara que no es una certificación legal ni OSI, por lo que el uso comercial conlleva incertidumbre sobre la procedencia del dataset.
- Sesgos: al entrenarse solo con cuentos infantiles sintéticos, el modelo reproduce los sesgos y simplificaciones de ese corpus, no los de texto real diverso.
- Caveat de producción: es un artefacto de investigación experimental, de una sola ejecución y con resultados exploratorios; no se ha validado para uso en producción ni se ha sometido a una evaluación de seguridad exhaustiva.
- Sin cuantización disponible: no existe variante 4-bit ni GGUF medida, lo que limita el despliegue en herramientas como llama.cpp u Ollama sin conversión previa.

## Enlaces

- Hugging Face: https://huggingface.co/athenista/slm-tavenel-story-935k
- Proyecto SLM-Tavenel: https://github.com/thekester/slm-tavenel
- Dataset SimpleStories: https://huggingface.co/datasets/SimpleStories/SimpleStories
- Paper de referencia (arXiv:2504.09184): https://arxiv.org/abs/2504.09184
- Revisión de fuente (SOURCE-REVIEW.md): https://huggingface.co/athenista/slm-tavenel-story-935k/blob/main/SOURCE-REVIEW.md
- Decisión de publicación (publication-decision.json): https://huggingface.co/athenista/slm-tavenel-story-935k/blob/main/publication-decision.json
- Registro de verificación operativa (training_record/verification.json): https://huggingface.co/athenista/slm-tavenel-story-935k/blob/main/training_record/verification.json
