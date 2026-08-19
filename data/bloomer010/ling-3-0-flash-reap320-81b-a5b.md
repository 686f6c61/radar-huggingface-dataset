# bloomer010/Ling-3.0-flash-REAP320-81B-A5B

## Resumen

Ling-3.0-flash-REAP320-81B-A5B es una variante podada del modelo MoE Ling-3.0-flash de inclusionAI, desarrollada por el usuario bloomer010 como artefacto de investigación. Aplica el método REAP (Router-weighted Expert Activation Pruning) en una sola pasada, eliminando 192 de los 512 expertos por capa (un 38% del total), lo que reduce los parámetros totales de 124B a 81B sin tocar los 5.1B de parámetros activos por token. No se realizó fine-tuning ni entrenamiento de recuperación posterior.

La relevancia de este modelo radica en que demuestra la viabilidad de la poda de expertos en arquitecturas MoE sin degradar la calidad de forma catastrófica, manteniendo la misma latencia de inferencia (mismos parámetros activos) pero con un footprint de memoria menor. Está pensado como punto de partida para investigaciones sobre compresión de modelos y para despliegues donde el almacenamiento o el ancho de banda de memoria sean limitantes. Utiliza código personalizado (`bailing_hybrid` / BailingMoeV3) que requiere `trust_remote_code=True` para cargarse con Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (BailingMoeV3, código custom `bailing_hybrid`) |
| Parametros totales | 81.035.300.128 (81B) |
| Parametros activos | 5.1B (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); versiones GGUF en repo hermano |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), GGUF (repo hermano) |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-flash es un transformer MoE con 512 expertos por capa y 5.1B de parámetros activos, que utiliza una arquitectura híbrida denominada `bailing_hybrid` con implementación BailingMoeV3. Sobre esta base, REAP realiza una poda de expertos en una sola pasada: cada experto se puntúa según el producto del valor de la puerta del router por la norma L2 de su salida, calculado sobre datos de calibración. Los expertos con menor puntuación se eliminan, reduciendo el número de expertos por capa de 512 a 320.

La calibración se realizó con 1M de tokens distribuidos en 50% ultrachat, 25% wikitext y 25% código. No se aplicó fine-tuning posterior ni entrenamiento de recuperación, por lo que el modelo conserva exactamente los pesos del original en los expertos supervivientes. Esto implica que la degradación de rendimiento depende únicamente de la calidad de la selección de expertos, sin posibilidad de compensar pérdidas mediante ajuste de pesos.

## Capacidades

- Generación de texto: pipeline de `text-generation` estándar de Transformers.
- Conversación: etiquetado como `conversational`, apto para diálogos multi-turno.
- Razonamiento y código: hereda las capacidades del modelo base Ling-3.0-flash, aunque la poda puede afectar a tareas que dependan de expertos eliminados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles.
- Modos especiales (vision, audio, thinking): no disponibles.

## Casos de uso

- Investigación sobre poda de MoE: permite estudiar el impacto de eliminar expertos en diferentes capas y dominios, sirviendo como baseline para comparar con otros métodos de compresión.
- Despliegue en entornos con memoria limitada: al reducir los parámetros totales de 124B a 81B, el modelo cabe en infraestructuras con menos VRAM o almacenamiento que el original, manteniendo la misma velocidad de inferencia (5.1B activos).
- Generación de texto general: puede usarse como sustituto del modelo base en aplicaciones donde el presupuesto de memoria sea crítico y se acepte una posible pérdida de calidad.
- Prototipado rápido de aplicaciones conversacionales: al ser un modelo de 5.1B activos, puede ejecutarse en GPUs de consumo con cuantización (versión GGUF disponible), permitiendo iterar sobre prompts y flujos de diálogo.
- Benchmarking de técnicas de pruning: sirve como punto de comparación para métodos que sí incluyen fine-tuning posterior, evaluando cuánto mejora la recuperación.
- Estudio de la distribución de expertos: los pesos del router y las normas L2 calculadas durante la calibración pueden analizarse para entender qué expertos son críticos en diferentes dominios (chat, texto, código).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base tras la poda. Se desconoce la degradación exacta de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 162 GB (81B × 2 bytes). Con cuantización a 8 bits (~81 GB) o 4 bits (~40 GB) puede reducirse sustancialmente, aunque no se especifican los tamaños de los GGUF disponibles.
- GPU recomendadas: para BF16 se necesitan al menos 2× A100 80GB o 2× H100 80GB en paralelo. Con cuantización a 4 bits podría caber en una sola GPU de 48GB (A6000, L40S) o incluso en consumer de 24GB (RTX 4090) si el contexto es limitado.
- Compatibilidad con consumer GPU: sí, si se usan las versiones GGUF cuantizadas (probablemente Q4_K_M o similar) y se limita la longitud de contexto.
- Opciones de despliegue: Transformers con `trust_remote_code=True` para safetensors; llama.cpp o Ollama para los GGUF. vLLM y TGI podrían funcionar si soportan el código custom `bailing_hybrid`, pero no está confirmado.
- Latencia y throughput: no disponibles. Al mantener 5.1B activos, la latencia por token debería ser similar a la del modelo base, pero no se aportan datos empíricos.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.0-flash (base) | 124B | 5.1B | no disponible | no disponible | Modelo original sin poda |
| Ling-3.0-flash-REAP320 | 81B | 5.1B | no disponible | no disponible | Versión podada, 38% menos expertos |
| Mixtral 8x7B | 47B | 13B | 32k | Apache 2.0 | MoE denso de 8 expertos, sin poda |
| Qwen2.5-72B-A14B | 72B | 14B | 128k | Apache 2.0 (Qwen) | MoE con 14B activos, mayor contexto |

La comparativa se limita a parámetros y arquitectura, ya que no hay datos de rendimiento publicados para este modelo. Frente a Mixtral y Qwen, Ling-3.0-flash-REAP320 ofrece menos parámetros activos (5.1B frente a 13-14B), lo que implica menor coste computacional por token, pero probablemente menor calidad en tareas complejas. La ventaja principal es su reducido footprint de memoria para el tamaño total.

## Limitaciones y advertencias

- La poda se realizó sin fine-tuning posterior, por lo que puede haber una degradación significativa en tareas que dependían de los expertos eliminados. No se han publicado métricas que cuantifiquen esta pérdida.
- El código personalizado (`bailing_hybrid`, BailingMoeV3) requiere `trust_remote_code=True`, lo que introduce riesgos de seguridad y problemas de compatibilidad con versiones futuras de Transformers.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- Es un artefacto de investigación, no un modelo listo para producción. No se garantiza estabilidad, soporte ni actualizaciones.
- La calibración se realizó con un dataset limitado (1M tokens), lo que puede sesgar la selección de expertos hacia los dominios representados (chat, texto, código) y perjudicar otros.
- No se dispone de información sobre la longitud de contexto soportada ni sobre el comportamiento con secuencias largas tras la poda.
- Los idiomas soportados no están documentados; se asume que hereda los del modelo base, pero no está confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bloomer010/Ling-3.0-flash-REAP320-81B-A5B
- Paper de REAP: https://arxiv.org/abs/2510.13999
- Modelo base (inclusionAI/Ling-3.0-flash): https://huggingface.co/inclusionAI/Ling-3.0-flash
