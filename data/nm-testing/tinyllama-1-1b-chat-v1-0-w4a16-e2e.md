# nm-testing/TinyLlama-1.1B-Chat-v1.0-W4A16-e2e

## Resumen

`nm-testing/TinyLlama-1.1B-Chat-v1.0-W4A16-e2e` es una reproducción cuantizada del modelo conversacional TinyLlama-1.1B-Chat-v1.0, publicada por la organización `nm-testing` (equipo de Neural Magic) como artefacto de validación de extremo a extremo. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original de TinyLlama al formato `compressed-tensors` con cuantización W4A16: pesos en 4 bits y activaciones en 16 bits. El objetivo es servir como caso de prueba reproducible para pipelines de cuantización y despliegue con vLLM y herramientas compatibles.

TinyLlama-1.1B-Chat-v1.0 es un transformer decoder-only de tipo Llama, con 1.100.048.384 parámetros totales (confirmado en los safetensors del repositorio) y una longitud de contexto nativa de 2048 tokens en su versión original. Está afinado para diálogo a partir del modelo base TinyLlama-1.1B, entrenado sobre aproximadamente 3 billones de tokens según la documentación pública del proyecto original. Este repositorio concreto no documenta el proceso de cuantización más allá del sufijo W4A16 y la etiqueta `compressed-tensors`.

Su relevancia es fundamentalmente práctica: permite evaluar el comportamiento de un modelo pequeño cuantizado a 4 bits en entornos con recursos muy limitados, así como verificar la compatibilidad de la cadena de herramientas de Neural Magic con arquitecturas Llama. No debe confundirse con un modelo de producción: es un artefacto de pruebas con 89 descargas y sin métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (derivado de TinyLlama-1.1B-Chat-v1.0) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en este repositorio (el modelo original declara 2048 tokens) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat-v1.0: un transformer decoder-only con atención causal multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), siguiendo el diseño de Llama 2. El modelo original fue preentrenado sobre aproximadamente 3 billones de tokens (según la documentación del proyecto TinyLlama) y posteriormente ajustado con instrucciones y preferencias para tareas conversacionales. Este repositorio no aporta información adicional sobre el dataset de entrenamiento ni sobre el proceso de alineación.

La innovación de esta publicación no está en el entrenamiento, sino en la cuantización: los pesos se almacenan en 4 bits con grupos de cuantización y escalas, mientras que las activaciones se mantienen en 16 bits durante la inferencia (esquema W4A16). El formato `compressed-tensors` es el contenedor de Neural Magic para pesos cuantizados, diseñado para ser consumido directamente por vLLM y por el ecosistema de compresión de modelos. El sufijo `e2e` sugiere que el repositorio forma parte de una prueba de integración de extremo a extremo, no de una publicación orientada a usuarios finales.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste de chat del modelo original.
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño de 1.1B parámetros.
- Generación de código y matemáticas a nivel elemental, sin garantías de corrección en tareas complejas.
- Soporte de plantilla de chat de Llama 2 (etiquetas `[INST]` y `<<SYS>>`) en el modelo de referencia.
- Capacidades multilingües limitadas y no documentadas en este repositorio.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Validación de pipelines de cuantización: sirve para comprobar que una herramienta de compresión (por ejemplo, llm-compressor) produce pesos W4A16 cargables y con perplejidad razonable frente al checkpoint original.
- Pruebas de integración con vLLM: al estar en formato `compressed-tensors`, permite verificar la carga, el arranque del servidor y la generación en un entorno de inferencia real antes de aplicar el mismo flujo a modelos mayores.
- Desarrollo en hardware de gama baja: con 1.1B parámetros en 4 bits, el modelo ocupa del orden de 0,6-0,8 GB de pesos, lo que permite experimentar en GPUs consumer con 4-8 GB de VRAM o incluso en CPU.
- Docencia y prototipado de chatbots: un modelo pequeño y rápido es adecuado para demostrar pipelines RAG o de diálogo sin coste de infraestructura elevado.
- Pruebas de regresión en CI: su tamaño reducido permite incluirlo en suites automatizadas que comprueban que una nueva versión de la librería de inferencia no rompe la carga de modelos cuantizados.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre FP16, W8A16 y W4A16 sobre la misma arquitectura antes de decidir el esquema para un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-0,8 GB solo para pesos en W4A16; con overhead de activaciones y caché KV, entre 1 y 2 GB para contextos cortos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3050, RTX 4060, T4, L4 o superiores son suficientes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna con 4 GB o más; también es viable en CPU.
- Opciones de despliegue: vLLM con soporte de `compressed-tensors` es la vía natural; también es posible convertir a GGUF para llama.cpp u Ollama, aunque este repositorio no incluye esos formatos.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera una latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nm-testing/TinyLlama-1.1B-Chat-v1.0-W4A16-e2e | 1,1B | no disponible | W4A16 (compressed-tensors) | no disponible | Hugging Face (89 descargas) |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 tokens | FP16/BF16 | Apache 2.0 (modelo original) | Hugging Face, ampliamente adoptado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | FP16/BF16 y GGUF/AWQ | Apache 2.0 | Hugging Face, vLLM, Ollama |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 tokens | FP16/BF16 y GGUF | Apache 2.0 | Hugging Face, llama.cpp |

La comparativa se limita a modelos de tamaño similar; este repositorio no publica métricas que permitan comparar calidad de forma directa con las alternativas.

## Limitaciones y advertencias

- Es un artefacto de pruebas (`nm-testing`), no un modelo mantenido para uso en producción; no hay garantía de soporte ni de estabilidad.
- La licencia no está declarada en el repositorio, lo que impide asumir uso comercial aunque el modelo original sea Apache 2.0.
- La cuantización W4A16 introduce degradación de calidad respecto al checkpoint FP16 original, especialmente en tareas de razonamiento y generación de código.
- Riesgo elevado de alucinación y de respuestas incoherentes por el tamaño de 1.1B parámetros, agravado por la cuantización a 4 bits.
- Contexto limitado (2048 tokens en el modelo original), insuficiente para documentos largos o conversaciones extensas.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es previsiblemente pobre.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado con datos web, hereda los sesgos habituales de ese corpus.
- No debe utilizarse como referencia de rendimiento del modelo original ni como base para decisiones de arquitectura sin validación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-W4A16-e2e
- Modelo original: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Referencia citada en la model card (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
