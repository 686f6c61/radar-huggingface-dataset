# masakiaota/pplx-decider-v1.3-mlx

## Resumen

pplx-decider-v1.3-mlx es una conversión cuantizada a 4 bits del modelo Decider v1.3 de Perplexity AI, adaptada para ejecutarse en Apple Silicon mediante la librería MLX. El modelo original es un clasificador multimodal de aproximadamente 27B parámetros diseñado para responder preguntas estructuradas (binarias, de elección múltiple y de puntuación) sobre un estado o contexto dado, emulando el comportamiento de la Decisions API de Perplexity. Esta versión reduce el peso de los pesos de 51,25 GB (BF16) a 16,7 GB, permitiendo su ejecución en un Mac con 36 GB de memoria unificada.

La conversión, realizada por el desarrollador independiente masakiaota, emplea una cuantización row-wise de 4 bits con compensación de error estilo GPTQ para la mayoría de capas lineales del modelo de lenguaje, junto con proyecciones k/v en formato affine group-64 de MLX. El resultado se sirve a través de decider-mlx, un servidor HTTP local compatible con la API oficial de Decisions, e incluye extensiones propias como extracción de pasajes (Locate), modo aislado y peticiones en array.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de clasificación de 27B en hardware de consumo Apple, con una fidelidad respecto al original del 98,8% en preguntas binarias y del 98,2% en preguntas de elección, según los datos publicados por el autor. No obstante, se trata de una conversión no oficial, no afiliada a Perplexity AI, y los pesos solo funcionan con el runtime decider-mlx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención completa y DeltaNet (según referencias a proyecciones k/v de 16 capas full-attention y gates DeltaNet); multimodal con vision tower |
| Parametros totales | 1.784.581.360 (según safetensors del repo de conversión) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han probado entradas de hasta 32,4K tokens) |
| Tipos de cuantizacion | 4-bit row-wise simétrica (W4A8) en capas lineales del LM; 4-bit affine group-64 en proyecciones k/v; componentes sin cuantizar (embeddings, normas, convoluciones, vision tower, readout head) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con layout personalizado rowq4 para capas lineales |

## Arquitectura y entrenamiento

El modelo base, perplexity-ai/pplx-decider-v1.3, es un transformer multimodal con un tower de visión y un cabezal de lectura (readout head) para clasificación. La arquitectura combina capas de atención completa (16 capas con proyecciones k/v) con capas DeltaNet, un mecanismo de atención lineal recurrente. El modelo está diseñado específicamente para la tarea de "decidir": dado un estado textual (y opcionalmente imágenes), responder a preguntas tipadas (noul/binaria, choice, score) con probabilidades calibradas.

La conversión a MLX aplica cuantización de 4 bits con compensación de error estilo GPTQ y act-order sobre las capas lineales del modelo de lenguaje (368 archivos en rowq4/), calibrada con aproximadamente 240K tokens de los splits de entrenamiento de BoolQ, SQuAD v2 y Qasper, además de peticiones Locate de SQuAD, sin solapamiento con los conjuntos de evaluación. Las proyecciones k/v de las 16 capas de atención completa usan cuantización affine group-64 en formato MLX. El resto de componentes (embeddings, normalizaciones, convoluciones, gates DeltaNet, vision tower y readout head) se mantienen sin cambios respecto al original. No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre el uso de RLHF/DPO.

## Capacidades

- Clasificación binaria (tipo `noul`): responde sí/no con probabilidad calibrada sobre un estado dado.
- Clasificación de elección múltiple (tipo `choice`): selecciona entre opciones predefinidas.
- Puntuación (tipo `score`): asigna una puntuación y devuelve el argmax.
- Extracción de pasajes (Locate): localiza spans relevantes en el texto de entrada, extensión no presente en la API oficial.
- Modo `isolated`: evaluación aislada de preguntas, extensión local.
- Peticiones en array: procesamiento por lotes de múltiples consultas en una sola llamada.
- Entrada multimodal: soporte de imágenes mediante vision tower (según tags y referencia a image inputs).
- Servidor HTTP compatible con la Decisions API oficial (`POST /v1/decisions`).
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible (el modelo es un clasificador, no un generador conversacional).
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento y triaje de tickets de soporte: dado el texto de una incidencia, el modelo responde preguntas binarias como "¿está el cliente bloqueado?" o "¿requiere escalado urgente?", integrándose en un servidor local que replica la Decisions API.
- Moderación de contenido asistida: clasificación binaria de textos o imágenes (gracias al vision tower) contra políticas definidas mediante instrucciones en lenguaje natural, con probabilidades calibradas para umbrales ajustables.
- Extracción de evidencia en pipelines RAG: el modo Locate permite identificar spans relevantes en documentos largos (hasta 32K tokens) para alimentar sistemas de recuperación aumentada.
- Clasificación por lotes de documentos: las peticiones en array permiten procesar cientos de consultas mixtas (520 peticiones en 117 s en M5 Ultra), adecuado para tareas de etiquetado offline.
- Evaluación de calidad de respuestas: el tipo `score` permite puntuar pares pregunta-respuesta en pipelines de evaluación automática de LLMs.
- Prototipado local sin conexión: investigadores que necesiten reproducir el comportamiento de la Decisions API de Perplexity en un Mac, sin enviar datos a servicios externos, pueden desplegar el servidor decider-mlx con una sola orden.
- Filtrado previo en agentes: usar el modelo como "decider" rápido (220 ms por petición de 427 tokens) para decidir si una consulta requiere invocar un agente mayor o puede resolverse con una respuesta simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de acuerdo con el modelo original BF16 y de rendimiento en hardware Apple:

| Métrica | Resultado |
|---|---|
| Acuerdo binario (`noul`) vs BF16 | 717/726 |
| Acuerdo `choice` vs BF16 | 161/164 |
| Acuerdo `score` (argmax) vs BF16 | 70/74 |
| Acuerdo Locate span sets vs BF16 | 100/114 (267/300 en conjunto mayor) |
| F1 Locate vs etiquetas gold | 0,697 (original: 0,685) |
| BoolQ gate, 4 condiciones | 100/100 en cada una |
| Diferencia media de probabilidad (binario) vs BF16 | 0,019 |
| Petición única 427 tokens | 220 ms |
| 20 peticiones en array | 1,92 s |
| 520 peticiones mixtas secuenciales | 117 s (mediana 135 ms) |
| Entrada larga 5,4K / 12,9K / 32,4K tokens | 2,66 / 7,62 / 22,9 s |
| 1.072 peticiones mixtas en arrays | 236 s |
| Arranque hasta aceptar HTTP | 0,3-0,5 s |
| Primera respuesta (427 tokens) | 0,6-1,0 s |

## Requisitos de hardware

- VRAM/memoria unificada: pico MLX de 23,7 GB tras el benchmark HTTP; 25,0 GB para una petición Locate de 32K tokens. Se recomiendan 36 GB o más de memoria unificada.
- GPU: Apple Silicon M5 o posterior (M5 Ultra medido). No es compatible con GPU NVIDIA ni con Apple Silicon anterior a M5 según los requisitos del autor.
- Consumer GPU: no aplica; el modelo está diseñado exclusivamente para Mac con memoria unificada.
- Sistema operativo: macOS 27 o posterior; Python 3.14 y uv.
- Despliegue: exclusivamente mediante decider-mlx (servidor HTTP compatible con Decisions API, `uv run decider-mlx serve`). No es compatible con vLLM, llama.cpp, Ollama ni TGI; un cargador MLX genérico no reproduce el modelo debido al layout rowq4 personalizado.
- Latencia y throughput: 220 ms por petición de 427 tokens; 135 ms de mediana en 520 peticiones mixtas; 1,92 s para 20 peticiones en array; 22,9 s para 32,4K tokens de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-v1.3-mlx (este) | 1,78B (según safetensors) | no disponible (probado hasta 32K) | MLX 4-bit | apache-2.0 | Hugging Face, solo Apple Silicon M5+ |
| perplexity-ai/pplx-decider-v1.3 (original) | ~27B (según model card) | no disponible | BF16 PyTorch | no disponible | Hugging Face, requiere 57,1 GB de pico |
| masakiaota/pplx-decider-flash-v1.3-mlx | no disponible | no disponible | MLX 8-bit | no disponible | Hugging Face, 43 ms por petición |

No se dispone de información sobre otros clasificadores comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada, respaldada ni soportada por Perplexity AI; los problemas deben reportarse en el repositorio decider-mlx.
- Compatibilidad restringida: los pesos solo funcionan con el runtime decider-mlx; un cargador MLX genérico no reproducirá el modelo debido al layout rowq4 y la multiplicación W4A8.
- Requisitos de hardware estrictos: solo Mac con chip M5 o posterior, macOS 27+, Python 3.14; no funciona en Apple Silicon anterior ni en GPU NVIDIA.
- Pérdida de fidelidad: las probabilidades difieren del BF16 con una media |dp| de 0,019 en preguntas binarias; el acuerdo en Locate es de 100/114 en el conjunto pequeño y 267/300 en el mayor.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe.
- Contexto máximo no especificado: aunque se han probado entradas de 32,4K tokens, no se declara la longitud de contexto oficial.
- Modelo clasificador, no generativo: no soporta tool calling, agentes multi-paso ni generación de texto libre; su uso está limitado a responder preguntas estructuradas.
- Riesgo de alucinación en las decisiones: al ser un clasificador, puede producir respuestas incorrectas o mal calibradas en dominios alejados de los datos de calibración (BoolQ, SQuAD v2, Qasper).
- Licencia apache-2.0 en la conversión, pero la licencia del modelo base no está confirmada en la información disponible; verificar antes de uso comercial.
- Sin datos de benchmarks estándar publicados, lo que dificulta la comparación objetiva con otros clasificadores.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/masakiaota/pplx-decider-v1.3-mlx
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
- Repositorio decider-mlx: https://github.com/masakiaota/pplx-decider-mlx
- Guía de uso: https://github.com/masakiaota/pplx-decider-mlx/blob/main/docs/usage.md
- Experimentos de conversión: https://github.com/masakiaota/pplx-decider-mlx/tree/main/experiments
- Modelo Flash 8-bit: https://huggingface.co/masakiaota/pplx-decider-flash-v1.3-mlx
- Documentación Decisions API: https://docs.perplexity.ai/api-reference/decisions-post
