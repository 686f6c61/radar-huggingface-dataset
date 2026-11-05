# mradermacher/UnifiedReward-Edit-qwen3vl-32b-GGUF

## Resumen

UnifiedReward-Edit-qwen3vl-32b es un modelo de recompensa (*reward model*) para evaluación de edición de imágenes, construido sobre la base de Qwen3-VL de 32 mil millones de parámetros. El modelo original lo desarrolla CodeGoat24 y esta ficha corresponde a la cuantización GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp. Su función no es generar texto ni imágenes, sino puntuar la calidad de imágenes editadas, lo que lo convierte en una pieza para pipelines de *reinforcement learning* (RLHF/RLVR) y de selección de candidatos en sistemas de edición de imagen.

La relevancia actual del modelo radica en que los modelos de recompensa multimodales son el componente crítico para entrenar generadores de imagen con *reward models* en lugar de simples pérdidas de reconstrucción. Al estar disponible en GGUF, se puede ejecutar en hardware de consumo con cuantizaciones de 4 bits, algo poco habitual en modelos de 32B con torre visual.

La información pública disponible es limitada: la model card del repositorio GGUF es puramente técnica sobre las cuantizaciones y no incluye detalles de entrenamiento, benchmarks ni composición del dataset. Esta ficha se limita a los datos verificables del repositorio y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3-VL (detalle exacto no disponible) |
| Parametros totales | 32.762.123.264 (32,76 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, CodeGoat24/UnifiedReward-Edit-qwen3vl-32b, parte de Qwen3-VL, un transformer multimodal con torre visual y *decoder* de lenguaje. La variante "UnifiedReward-Edit" está especializada como modelo de recompensa para edición de imágenes: recibe una instrucción de edición, la imagen original y la imagen editada, y produce una puntuación o juicio de calidad. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en su ajuste.

La cuantización de mradermacher es de tipo estático (*quantize_version: 2*, *output_tensor_quantised: 1*) y mantiene el proyector multimodal (`mmproj`) en Q8_0 o f16 como suplemento separado, lo que permite ejecutar el modelo en llama.cpp con soporte de visión. Existe además una variante con cuantizaciones ponderadas por imatrix en el repositorio `mradermacher/UnifiedReward-Edit-qwen3vl-32b-i1-GGUF`, que suele ofrecer mejor relación calidad/tamaño en bits bajos.

## Capacidades

- Evaluación de calidad de imágenes editadas: el modelo puntúa o juzga el resultado de una edición condicionada por una instrucción textual.
- Comprensión multimodal: procesa pares o tripletas de imágenes junto con texto, gracias a la torre visual de Qwen3-VL.
- Modelo de recompensa para RL: puede integrarse como función de recompensa en pipelines de entrenamiento de generadores de imagen.
- Razonamiento textual sobre la evaluación: al estar basado en un LLM, puede emitir justificaciones textuales de la puntuación (formato exacto no disponible).
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Entrenamiento de modelos de edición de imagen con RL: usar UnifiedReward-Edit como función de recompensa para puntuar candidatos generados por un modelo de edición y optimizar la política con PPO o GRPO. El modelo está diseñado específicamente para esta tarea.
- Filtrado de datasets de edición: puntuar pares (instrucción, imagen original, imagen editada) para descartar ejemplos de baja calidad antes de entrenar un modelo supervisado.
- Selección de mejor de N (*best-of-N*) en producción: generar varias ediciones candidatas y elegir la de mayor puntuación del reward model antes de devolverla al usuario.
- Evaluación automática de pipelines de edición: sustituir evaluaciones humanas costosas en la comparación de versiones de un sistema de edición de imagen.
- Investigación en *reward hacking*: analizar cómo los generadores explotan las debilidades del modelo de recompensa, gracias a que la licencia MIT permite modificarlo y auditarlo.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (~19,9 GB) se puede ejecutar en una GPU de 24 GB, lo que facilita prototipado sin infraestructura de clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y activaciones):
  - Q2_K: ~12,4 GB de pesos, ~14-16 GB de VRAM en total.
  - Q4_K_M: ~19,9 GB de pesos, ~22-24 GB de VRAM en total.
  - Q8_0: ~34,9 GB de pesos, ~38-40 GB de VRAM en total.
  - Añadir ~0,9-1,3 GB adicionales para el `mmproj` multimodal.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y f16; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M; GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M y en GPUs de 16 GB con cuantizaciones de 2-3 bits.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio y cualquier servidor compatible con GGUF; para el modelo base en safetensors, vLLM o TGI (soporte de Qwen3-VL sujeto a la versión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| UnifiedReward-Edit-qwen3vl-32b (esta ficha) | 32,76 B | no disponible | Imagen + texto (reward) | MIT | GGUF, safetensors |
| Qwen3-VL-32B (modelo base genérico) | ~32 B | no disponible | Imagen + texto | según Qwen | safetensors, GGUF |
| UnifiedReward-Edit (variantes de menor tamaño) | no disponible | no disponible | Imagen + texto (reward) | MIT | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al estar entrenado presumiblemente con datos en inglés, el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación y de *reward hacking*: como todo modelo de recompensa, los generadores pueden aprender a explotar sus preferencias en lugar de mejorar la calidad real de la edición.
- Idiomas: solo se declara inglés; las instrucciones de edición en castellano pueden degradar la calidad de la puntuación.
- Longitud de contexto no documentada: no se puede planificar el uso con instrucciones o historiales largos sin verificación empírica.
- La licencia MIT del repositorio GGUF permite uso comercial, pero conviene verificar la licencia del modelo base CodeGoat24/UnifiedReward-Edit-qwen3vl-32b y de Qwen3-VL, que pueden imponer condiciones adicionales.
- El repositorio ocupa 225,9 GB y contiene 13 archivos GGUF; descargar el repo completo no es necesario, basta con el quant deseado más el `mmproj`.
- Las cuantizaciones de 2-3 bits pueden degradar de forma notable la capacidad de juicio fino, crítica en un modelo de recompensa; se recomienda Q5_K_M o superior para producción.
- No hay pipeline declarado ni demo pública; la integración requiere montar manualmente el flujo multimodal en llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UnifiedReward-Edit-qwen3vl-32b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/UnifiedReward-Edit-qwen3vl-32b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/UnifiedReward-Edit-qwen3vl-32b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#UnifiedReward-Edit-qwen3vl-32b-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
