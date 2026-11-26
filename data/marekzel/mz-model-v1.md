# marekzel/mz-model-v1

## Resumen
MzModelV1 es un modelo de lenguaje de tipo decoder-only Transformer desarrollado por el usuario marekzel como experimento de entrenamiento desde cero en hardware de consumo. Con aproximadamente 110 millones de parametros, el modelo se construyo con PyTorch y Hugging Face Transformers y se entreno integramente en una unica GPU NVIDIA RTX 5060 Ti de 16 GB de VRAM en unas 38 horas. Su proposito declarado no es competir con modelos de gran escala, sino demostrar la viabilidad de entrenar y afinar un modelo de lenguaje en un entorno de laboratorio domestico.

La arquitectura sigue el esquema clasico de Transformer decoder-only con 12 capas, tamano oculto de 768, 12 cabezas de atencion, dimension feed-forward de 3.072 y vocabulario de 32.000 tokens. El entrenamiento se dividio en dos fases: un preentrenamiento sobre el dataset Wikimedia Structured Wikipedia (unos 7,6 millones de articulos) y un ajuste fino sobre HuggingFaceTB/everyday-conversations-llama3.1-2k para mejorar la capacidad conversacional.

El modelo es relevante como referencia educativa y como ejemplo reproducible de un pipeline completo de entrenamiento (preentrenamiento mas fine-tuning) en una sola GPU consumer. Su ventana de contexto de 512 tokens y su licencia Apache 2.0 lo sitúan en un nicho muy concreto: experimentacion, docencia y prototipado ligero, no produccion a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (PyTorch + Hugging Face Transformers) |
| Parametros totales | 110.025.216 (segun safetensors); 109,65 M segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser safetensors en fp32/fp16 es convertible a GGUF/8-bit/4-bit con herramientas estandar) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros detalles tecnicos declarados: hidden size 768, 12 capas, 12 cabezas de atencion, feed-forward 3.072, vocabulario 32.000, embeddings posicionales aprendidos, atencion causal multi-head, activacion GELU, normalizacion LayerNorm y weight tying entre embeddings de entrada y proyeccion de salida. Tamano del repositorio: 0,9 GB.

## Arquitectura y entrenamiento
El modelo es un Transformer decoder-only convencional, sin innovaciones arquitectonicas destacables: atencion causal multi-head estandar, embeddings posicionales aprendidos (no RoPE ni ALiBi), LayerNorm, GELU y weight tying. La configuracion (768 de hidden, 12 capas, 12 cabezas, FFN de 3.072) corresponde a un modelo de escala tipo ~110 M, similar en orden de magnitud a GPT-2 small o a la familia GPT-Neo de 125 M.

El entrenamiento se realizo en una sola NVIDIA RTX 5060 Ti de 16 GB durante aproximadamente 38 horas, en dos etapas: preentrenamiento sobre Wikimedia Structured Wikipedia (7,6 millones de articulos) y ajuste fino sobre HuggingFaceTB/everyday-conversations-llama3.1-2k para dotar al modelo de capacidad conversacional. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset, ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles. Tampoco se documentan innovaciones como decodificacion especulativa, atencion lineal o mezcla de expertos.

## Capacidades
- Generacion de texto autoregresiva en ingles, con calidad propia de un modelo de ~110 M entrenado sobre Wikipedia y un dataset conversacional pequeno.
- Conversacion basica multi-turno gracias al ajuste fino sobre everyday-conversations-llama3.1-2k, aunque limitada por la ventana de 512 tokens.
- Respuesta a prompts de conocimiento general derivada del preentrenamiento sobre Wikipedia estructurada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Integracion con el ecosistema transformers (AutoModelForCausalLM) y con el script de inferencia con GUI del repositorio del autor.

## Casos de uso
- Docencia y formacion en entrenamiento de LLM: el modelo sirve como ejemplo completo y reproducible de un pipeline de preentrenamiento mas fine-tuning en una sola GPU consumer, util para cursos y talleres practicos.
- Prototipado rapido de interfaces conversacionales: al ser ligero (0,9 GB en safetensors) se puede cargar en portatiles y estaciones de trabajo modestas para probar UX de chat antes de invertir en modelos mayores.
- Experimentacion con tecnicas de cuantizacion y optimizacion: su tamano permite convertir a GGUF, 8-bit o 4-bit y medir impacto en latencia y calidad sin necesidad de infraestructura dedicada.
- Generacion de texto de relleno o sintetico para pruebas de pipelines: util para validar sistemas de ingesta, formateo o evaluacion automatica con un modelo barato de ejecutar.
- Investigacion sobre sesgos y alucinacion en modelos pequenos: su origen en Wikipedia y en un dataset conversacional acotado lo hace adecuado para estudios controlados de comportamiento.
- Base para fine-tuning especifico de dominio: al estar bajo Apache 2.0 y con solo 110 M de parametros, se puede reentrenar o afinar en una GPU consumer para tareas muy concretas (clasificacion de texto, respuestas de nicho) en horas.
- Demo educativa de despliegue: integrable con el script GUI del autor o con transformers para mostrar el ciclo completo desde pesos hasta inferencia interactiva.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas.

## Requisitos de hardware
- VRAM estimada para inferencia: en fp32 los 110 M de parametros ocupan aproximadamente 0,44 GB; en fp16 unos 0,22 GB; en 8-bit unos 0,11 GB. Con overhead de activaciones y contexto de 512 tokens, cabe holgadamente en GPUs con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, RTX 5060 Ti) e incluso GPUs integradas o CPU para inferencia en fp32.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer de los ultimos anos; tambien en CPU con latencia aceptable dado el tamano.
- Opciones de despliegue: transformers (libreria nativa), llama.cpp/Ollama tras conversion a GGUF, y el script de inferencia con GUI del repositorio https://github.com/marekzel/mz-models. vLLM y TGI son tecnicamente posibles pero sobredimensionados para este tamano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano se espera throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MzModelV1 (marekzel) | ~110 M | 512 | Apache 2.0 | Hugging Face | Experimental, solo ingles, fine-tuning conversacional |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT (pesos publicos) | Hugging Face | Referencia clasica de escala similar, sin fine-tuning conversacional |
| GPT-Neo 125M (EleutherAI) | 125 M | 2.048 | MIT | Hugging Face | Preentrenado en The Pile, mas contexto |
| TinyLlama 1.1B (proyecto comunitario) | 1.100 M | 2.048 | Apache 2.0 | Hugging Face | Un orden de magnitud mayor; no directamente comparable en recursos |

La comparacion con GPT-2 small y GPT-Neo 125M es la mas justa por escala; no se dispone de benchmarks del modelo de marekzel para comparar rendimiento numerico con estas alternativas.

## Limitaciones y advertencias
- Modelo experimental: el autor lo declara explicitamente como proyecto de aprendizaje y lo distribuye "as is", sin garantias de rendimiento, seguridad o precision.
- Ventana de contexto muy corta (512 tokens), insuficiente para documentos largos o conversaciones extensas.
- Solo ingles; no hay soporte declarado de castellano ni de otros idiomas.
- Riesgo elevado de alucinacion y de respuestas incoherentes por el reducido tamano (110 M) y el limitado volumen de datos de ajuste conversacional.
- Sesgos potenciales heredados de Wikipedia estructurada y del dataset everyday-conversations; no se documentan evaluaciones de sesgo.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; no apto para flujos agenticos.
- No se documentan cuantizaciones oficiales ni resultados de benchmarks; cualquier uso en produccion requeriria evaluacion propia.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en produccion sin validacion exhaustiva.
- El autor no publica detalles sobre tokens de entrenamiento ni sobre posibles tecnicas de alineacion (RLHF/DPO), lo que limita la reproducibilidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/marekzel/mz-model-v1
- Repositorio con script de inferencia y GUI: https://github.com/marekzel/mz-models
- Dataset de preentrenamiento: https://huggingface.co/datasets/wikimedia/structured-wikipedia
- Dataset de fine-tuning: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
