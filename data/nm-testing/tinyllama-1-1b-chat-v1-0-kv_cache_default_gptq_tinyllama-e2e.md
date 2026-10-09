# nm-testing/TinyLlama-1.1B-Chat-v1.0-kv_cache_default_gptq_tinyllama-e2e

## Resumen

El modelo `nm-testing/TinyLlama-1.1B-Chat-v1.0-kv_cache_default_gptq_tinyllama-e2e` es un artefacto de cuantización publicado por la cuenta `nm-testing`, un espacio de la organización Neural Magic utilizado habitualmente para validar la cadena de herramientas `compressed-tensors`. No es un modelo entrenado desde cero: parte del checkpoint TinyLlama-1.1B-Chat-v1.0 y se redistribuye con pesos cuantizados en formato GPTQ, con una configuración de caché KV identificada en el propio nombre como `kv_cache_default`.

El interés de esta ficha es fundamentalmente técnico y de infraestructura. Se trata de un test de extremo a extremo (`e2e`) pensado para comprobar que el pipeline de cuantización y el runtime de inferencia producen resultados coherentes cuando se activa la caché KV por defecto. El repositorio acumula 7 descargas y 0 "likes" en el momento de redactar esta ficha, y no incluye model card, licencia declarada ni idiomas soportados.

Con 1.100.048.428 parámetros reales (según los índices de safetensors) y un tamaño de repositorio de 3,0 GB, el modelo ocupa el segmento de los LLM pequeños aptos para GPU de consumo, CPU con cuantización y entornos de borde. Su relevancia práctica es doble: sirve como banco de pruebas reproducible para pipelines de cuantización GPTQ y como punto de partida para despliegues ligeros, siempre que el usuario verifique la calidad tras la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (derivada del nombre y de la etiqueta `llama` del repositorio) |
| Parámetros totales | 1.100.048.428 (dato real de los pesos en safetensors) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible en la información proporcionada. El modelo base TinyLlama-1.1B-Chat-v1.0 declara 2048 tokens, pero no se confirma en esta ficha |
| Tipos de cuantización | GPTQ empaquetado con `compressed-tensors` (la configuración `kv_cache_default` afecta a la caché KV; el esquema exacto de bits, no disponible) |
| Idiomas soportados | No disponible (el modelo base se entrena predominantemente en inglés) |
| Licencia | No disponible en el repositorio (el modelo base TinyLlama-1.1B-Chat-v1.0 se publica bajo Apache-2.0, pero no se declara aquí) |
| Formato de pesos | Safetensors (etiqueta `safetensors`, `compressed-tensors`) |
| Tamaño del repositorio | 3,0 GB |
| Creado / actualizado | 2026-07-24 / 2026-10-09 |
| Descargas / likes | 7 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only con atención causal estándar, heredada del modelo TinyLlama-1.1B-Chat-v1.0, que a su vez es un fine-tune de TinyLlama orientado a conversación. El repositorio no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO o SFT, y en cualquier caso este checkpoint no introduce entrenamiento nuevo: es una transformación de pesos.

La innovación técnica no está en el modelo, sino en el pipeline. Los pesos se han cuantizado con GPTQ y se serializan con el esquema `compressed-tensors`, que describe de forma explícita qué tensores están cuantizados, con qué parámetros de escala y cero, y qué partes permanecen en precisión completa. El sufijo `kv_cache_default` del identificador apunta a una prueba de la ruta de decodificación con caché KV en configuración por defecto, un punto crítico en producción porque de él dependen el consumo de memoria durante la generación y la compatibilidad con runtimes como vLLM. El sufijo `e2e` indica que el artefacto forma parte de una verificación de extremo a extremo de esa cadena.

## Capacidades

- Generación de texto conversacional en formato chat/instrucciones, heredada del checkpoint base TinyLlama-1.1B-Chat-v1.0.
- Razonamiento básico de un solo turno y tareas sencillas de comprensión y resumen, limitado por el tamaño de 1,1B parámetros.
- Generación de código elemental y completado de fragmentos cortos; no hay evidencia de un rendimiento competitivo en código frente a modelos de su rango.
- Soporte de `tool calling` / `function calling`: no disponible, no se documenta en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo de 1,1B no es adecuado para planificación encadenada fiable.
- Capacidades multilingües: no disponibles. El modelo base está entrenado mayoritariamente en inglés y su rendimiento en castellano no está verificado.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles.
- Capacidad operativa relevante: servir como referencia para validar una configuración de cuantización GPTQ con caché KV y comparar su salida contra el modelo sin cuantizar.

## Casos de uso

- Validación de pipelines de cuantización: cargar este checkpoint en vLLM o en `nm-vllm` junto con el modelo original sin cuantizar y comparar logits o textos generados para detectar regresiones introducidas por GPTQ. Es precisamente el escenario para el que se publicó el artefacto.
- Pruebas de integración continua de runtimes: al ser pequeño (3,0 GB de repositorio) puede incluirse en un job de CI que arranque un servidor de inferencia, envíe peticiones de chat y verifique que la caché KV se comporta igual que en la configuración por defecto.
- Prototipado de asistentes conversacionales en local: con menos de 3 GB de VRAM en FP16 y en torno a 1 GB en cuantización de 4 bits, permite iterar sobre prompts y plantillas de chat en un portátil con GPU de consumo.
- Generación de texto de bajo coste en el borde: clasificación de mensajes, resúmenes cortos o respuestas plantilladas en dispositivos con recursos limitados, asumiendo la pérdida de calidad frente a modelos mayores.
- Evaluación comparativa de cuantizaciones: usar este checkpoint como caso de estudio para medir el compromiso entre tamaño en disco, latencia y calidad frente a versiones en FP16, INT8 y 4 bits.
- Docencia y experimentación: por su tamaño manejable, sirve para estudiar cómo se serializa un modelo GPTQ con `compressed-tensors` y cómo se reconstruyen las matrices cuantizadas en memoria.
- Filtrado previo en cascada: como primer nivel de un sistema con un modelo grande detrás, descartando consultas triviales o clasificando la intención antes de invocar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad, ni comparaciones con el modelo sin cuantizar. Cualquier cifra de rendimiento deberá obtenerse ejecutando una evaluación propia contra el checkpoint original.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de 1.100.048.428 parámetros:
  - FP16/BF16 (referencia, modelo base sin cuantizar): aproximadamente 2,2 GB solo de pesos, unos 3 GB con activaciones y caché KV.
  - INT8: aproximadamente 1,1 GB de pesos, 1,5-2 GB en total.
  - 4 bits (GPTQ): aproximadamente 0,6-0,8 GB de pesos, menos de 1,5 GB en total con caché KV.
- GPU recomendadas: cualquier GPU con 4-8 GB de VRAM es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, L4, T4 y A10G. En A100 y H100 el modelo está infrautilizado y solo tiene sentido en despliegues con batching muy alto.
- Compatibilidad con GPU de consumo: sí. El modelo cabe holgadamente en cualquier GPU de consumo con 4 GB o más, e incluso puede compartir memoria con el escritorio del sistema operativo.
- Opciones de despliegue: vLLM y `nm-vllm` (soporte nativo de `compressed-tensors` y GPTQ); TGI como alternativa si la versión soporta el esquema; llama.cpp, Ollama y LM Studio requieren convertir los pesos a GGUF, paso no incluido en el repositorio; también es posible ejecutarlo con Transformers cargando el esquema `compressed-tensors`.
- Latencia y throughput: no disponibles. Para un modelo de 1,1B en una GPU moderna se espera un throughput alto con batching, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

Los datos de la columna de contexto y licencia provienen de las fichas públicas de los modelos base correspondientes; conviene verificarlos antes de tomar decisiones de producción. No se dispone de métricas de calidad comparadas.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (TinyLlama GPTQ, nm-testing) | 1,10B | No disponible | No disponible | Safetensors + `compressed-tensors` | Repositorio de prueba, 7 descargas |
| TinyLlama-1.1B-Chat-v1.0 | 1,10B | 2048 tokens (según ficha del modelo base) | Apache-2.0 | Safetensors | Ampliamente desplegado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32768 tokens (según ficha del modelo base) | Apache-2.0 | Safetensors | Muy extendido, con versiones GGUF y AWQ |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 tokens (según ficha del modelo base) | Apache-2.0 | Safetensors | Extendido, con versiones GGUF |

En rendimiento (MMLU, HumanEval, GSM8K) no hay datos disponibles para ninguno de estos modelos dentro de la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un artefacto de prueba, no un modelo publicado para uso general. No incluye model card, ni descripción de la configuración de cuantización, ni resultados de evaluación.
- Licencia no declarada en el repositorio. Aunque el modelo base se publica bajo Apache-2.0, la ausencia de licencia explícita en este checkpoint es un riesgo legal para uso comercial; conviene aclararlo antes de integrarlo.
- La cuantización GPTQ introduce degradación de precisión respecto al modelo original. El grado de degradación no está medido en este repositorio.
- Riesgo de alucinación elevado: con 1,1B parámetros, el modelo inventa hechos con facilidad y no es fiable para tareas que requieran exactitud factual sin verificación externa.
- Ventana de contexto limitada (el modelo base declara 2048 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística no verificada. El entrenamiento del modelo base es mayoritariamente en inglés y la calidad en castellano no está garantizada.
- Sin soporte documentado de `tool calling`, agentes o razonamiento multi-paso; no debe emplearse en flujos que dependan de estas capacidades.
- Capacidad de razonamiento y de código propia de un modelo de 1,1B: inferior a alternativas de 1,5B-3B en la mayoría de tareas.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados correspondían a unidades de medida y conversores de distancia), por lo que no existe validación externa disponible sobre su calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-kv_cache_default_gptq_tinyllama-e2e
- Organización `nm-testing` en HuggingFace: https://huggingface.co/nm-testing
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio del proyecto TinyLlama (GitHub): https://github.com/jzhang38/TinyLlama
- Paper de TinyLlama: https://arxiv.org/abs/2401.02385
- Librería `compressed-tensors` (Neural Magic): https://github.com/neuralmagic/compressed-tensors
- Documentación de cuantización en vLLM: https://docs.vllm.ai/en/latest/features/quantization/index.html
- Documentación de `nm-vllm` (Neural Magic): https://github.com/neuralmagic/nm-vllm
