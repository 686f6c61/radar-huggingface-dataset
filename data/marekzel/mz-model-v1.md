# marekzel/mz-model-v1

## Resumen

MzModelV1 es un modelo de lenguaje de tipo decoder-only Transformer desarrollado por el usuario marekzel como experimento de entrenamiento desde cero en hardware de consumo. Con aproximadamente 110 millones de parámetros (109,65 M según la model card; 110.025.216 según los pesos en safetensors), el modelo se posiciona en la categoría de modelos pequeños, comparable en escala a GPT-2 small o a la familia Pythia-160M, aunque con un contexto mucho más reducido.

El proyecto nace con un objetivo demostrativo: probar que es viable preentrenar y afinar un modelo de lenguaje en una única GPU de consumo (NVIDIA RTX 5060 Ti con 16 GB de VRAM) en unas 38 horas. El entrenamiento se realizó en dos fases: un preentrenamiento sobre el dataset Wikimedia Structured Wikipedia (unos 7,6 millones de artículos) y un ajuste fino sobre HuggingFaceTB/everyday-conversations-llama3.1-2k para dotar al modelo de capacidad conversacional básica.

Su relevancia es fundamentalmente educativa y de investigación reproducible: sirve como referencia para quienes quieran entender el ciclo completo de entrenamiento de un transformer pequeño, no como modelo de producción. La licencia Apache 2.0 y el formato estándar de Transformers facilitan su inspección y reutilización con fines de aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer |
| Parametros totales | 109,65 M (model card) / 110.025.216 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de Transformers, sin variantes publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,9 GB |
| Tamano oculto | 768 |
| Numero de capas | 12 |
| Cabezas de atencion | 12 |
| Dimension feed-forward | 3.072 |
| Tamano de vocabulario | 32.000 |
| Codificacion posicional | Embeddings posicionales aprendidos |
| Funcion de activacion | GELU |
| Normalizacion | LayerNorm |
| Weight tying | Embeddings de entrada y proyeccion de salida compartidos |
| Hardware de entrenamiento | NVIDIA RTX 5060 Ti (16 GB VRAM) |
| Tiempo de entrenamiento | Aproximadamente 38 horas |
| Framework | PyTorch, Hugging Face Transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico, sin innovaciones estructurales destacables: 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, feed-forward de 3.072 y activacion GELU con LayerNorm. Emplea atencion causal multi-head estandar y embeddings posicionales aprendidos (no RoPE ni ALiBi), lo que limita la extension de contexto mas alla de los 512 tokens de entrenamiento. El vocabulario es de 32.000 tokens y los pesos de embedding de entrada estan atados a la proyeccion de salida, una practica habitual en modelos pequenos para reducir parametros.

El entrenamiento se ejecuto en una sola NVIDIA RTX 5060 Ti de 16 GB durante aproximadamente 38 horas, en dos etapas: preentrenamiento sobre Wikimedia Structured Wikipedia (7,6 millones de articulos) y ajuste fino sobre HuggingFaceTB/everyday-conversations-llama3.1-2k para mejorar la capacidad conversacional. La model card no especifica el numero de tokens procesados, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT con preferencias; estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad limitada por el tamano del modelo y el contexto de 512 tokens.
- Conversacion basica de uno o pocos turnos, gracias al ajuste fino sobre el dataset everyday-conversations.
- Respuesta a instrucciones sencillas y preguntas factuales de conocimiento general, derivadas del preentrenamiento en Wikipedia.
- Capacidad multilingue: no disponible; el modelo esta declarado exclusivamente en ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Capacidad de codigo y matematicas: no documentada ni evaluada; no debe asumirse.

## Casos de uso

- Docencia y aprendizaje de entrenamiento de LLM: el modelo sirve como ejemplo completo y reproducible de un pipeline de preentrenamiento mas ajuste fino en hardware de consumo, con codigo de inferencia con GUI publicado en GitHub.
- Experimentacion academica con transformers pequenos: permite estudiar el efecto del contexto corto (512 tokens), el weight tying o los embeddings posicionales aprendidos en un modelo de 110 M de parametros sin requerir clúster.
- Prototipado de interfaces conversacionales simples: para demos de chatbot en ingles con turnos breves, donde la latencia baja y el reducido consumo de VRAM son ventajas.
- Generacion de texto de relleno o aumentacion de datos en ingles: util para tareas de NLP donde se necesita texto sintetico de dominio general y la calidad no es critica.
- Pruebas de integracion con Hugging Face Transformers y endpoints compatibles: el tag `endpoints_compatible` permite validar pipelines de despliegue y servir el modelo como referencia en pruebas de infraestructura.
- Benchmarking de hardware de consumo: al ser un modelo pequeno con requisitos conocidos, sirve para medir throughput y latencia en GPUs de gama baja o en CPU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 0,9 GB en safetensors (precision original, probablemente fp32 o bf16); en fp16/bf16 ocupa alrededor de 0,22 GB y en cuantizacion de 8 bits aproximadamente 0,11 GB, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento se realizo en una RTX 5060 Ti de 16 GB, pero la inferencia cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: Hugging Face Transformers (libreria declarada), llama.cpp y Ollama mediante conversion a GGUF (no se publican pesos GGUF oficiales), vLLM y TGI (compatibilidad no verificada para esta arquitectura personalizada `mz_model_v1`).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 110 M de parametros con contexto de 512 tokens, se espera una latencia muy baja en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MzModelV1 | 110 M | 512 | Ingles | Apache 2.0 | Hugging Face (marekzel/mz-model-v1) |
| GPT-2 small | 124 M | 1.024 | Ingles | MIT (pesos OpenAI) | Hugging Face (openai-community/gpt2) |
| Pythia-160M | 160 M | 2.048 | Ingles | Apache 2.0 | Hugging Face (EleutherAI/pythia-160m) |
| SmolLM-135M | 135 M | 2.048 | Ingles (multilingue parcial) | Apache 2.0 | Hugging Face (HuggingFaceTB/SmolLM-135M) |

La comparativa se basa en datos publicos de cada modelo; no se dispone de resultados de benchmarks de MzModelV1 para contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Modelo experimental: el autor lo declara explicitamente como proyecto de investigacion y aprendizaje, sin garantias de rendimiento, seguridad o precision.
- Contexto muy limitado: 512 tokens restringen conversaciones multi-turno y tareas que requieran documentos largos.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Riesgo elevado de alucinacion: el preentrenamiento en Wikipedia y el ajuste fino ligero no garantizan factualidad; el modelo puede generar afirmaciones incorrectas con fluidez.
- Sesgos: al entrenarse sobre Wikipedia en ingles y un dataset conversacional, hereda los sesgos de esas fuentes; no se documentan evaluaciones de sesgo.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso; no apto para pipelines agenticos.
- Licencia Apache 2.0: permite uso comercial, pero el estado experimental y la falta de evaluaciones desaconsejan su uso en produccion.
- Arquitectura personalizada (`mz_model_v1`): puede requerir `trust_remote_code` y no esta garantizada la compatibilidad con herramientas estandar como vLLM, TGI o llama.cpp sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marekzel/mz-model-v1
- Repositorio con script de inferencia y GUI: https://github.com/marekzel/mz-model-v1
- Dataset de preentrenamiento: https://huggingface.co/datasets/wikimedia/structured-wikipedia
- Dataset de ajuste fino: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
