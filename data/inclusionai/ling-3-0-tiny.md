# inclusionAI/Ling-3.0-tiny

## Resumen

Ling-3.0-tiny es un modelo de lenguaje de tipo Mixture of Experts (MoE) con arquitectura híbrida de atención lineal, desarrollado por inclusionAI (organización vinculada a Ant Group). Con 7.893 millones de parámetros totales pero solo 1.300 millones activados por token, está diseñado para ofrecer capacidades de razonamiento y uso agéntico a bajo coste de inferencia, orientado a despliegues locales y en hardware de gama consumer o edge.

El modelo combina capas de Kimi Delta Attention (KDA) y Multi-Head Latent Attention (MLA) en una proporción 3:1, junto con una FFN MoE dispersa de 128 expertos enrutados. Esta combinación busca equilibrar la eficiencia computacional con la capacidad de modelar contexto largo, algo crítico en flujos agénticos y de razonamiento multi-paso.

Su relevancia actual radica en que ha sido validado en plataformas como NVIDIA DGX Spark, Apple Silicon MacBook y Mac mini, alcanzando velocidades de 100-105 tokens/s en DGX Spark y 86-90 tokens/s en un M4 Pro, con un pico de memoria de aproximadamente 8,34 GiB a 8K de contexto en FP8. Esto lo posiciona como una opción viable para despliegues sin GPUs de clase datacenter, con licencia MIT que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal: 3 capas KDA + 1 capa MLA por bloque de 4 capas, con FFN MoE dispersa |
| Parámetros totales | 7.893.392.800 (7,9B) |
| Parámetros activos | 1,3B por token |
| Longitud de contexto | 131.072 tokens nativos; 262.144 tokens con YaRN (factor 2.0) |
| Tipos de cuantización | BF16, FP8, INT4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Ling-3.0-tiny emplea una arquitectura híbrida que alterna capas de Kimi Delta Attention (KDA) y Multi-Head Latent Attention (MLA) en una proporción 3:1: por cada bloque de cuatro capas, tres son KDA y una es MLA. La KDA es un mecanismo de atención lineal que reduce el coste computacional en secuencias largas, mientras que la MLA mantiene la capacidad expresiva de la atención estándar en puntos estratégicos. La FFN es de tipo MoE dispersa con 128 expertos enrutados, de los cuales se activan 8 por token, más 1 experto compartido, lo que resulta en 1,3B parámetros activos sobre 7,9B totales.

El modelo soporta razonamiento híbrido nativo: puede responder de forma rápida o activar un modo de razonamiento multi-paso configurable por petición mediante el parámetro `enable_thinking`. El modo thinking está activado por defecto, con parámetros de muestreo recomendados de `temperature=1.0`, `top_p=0.95` y `top_k=20`. La decodificación especulativa está soportada vía NEXTN/MTP integrado en SGLang, y el contexto extendido se implementa mediante YaRN con `rope_theta=6000000`, `partial_rotary_factor=0.5` y `original_max_position_embeddings=131072`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Razonamiento multi-paso con modo thinking configurable por petición (`enable_thinking`).
- Capacidades agénticas: el modelo está evaluado en tareas de agentes y Terminal-Bench 2.1.
- Generación y razonamiento sobre código (coding).
- Razonamiento matemático y científico.
- Seguimiento de instrucciones (instruction following).
- Comprensión de contexto largo, con ventana nativa de 131K tokens extensible a 256K mediante YaRN.
- Soporte de decodificación especulativa NEXTN/MTP para acelerar la inferencia.
- No se dispone de información sobre soporte explícito de tool calling/function calling, visión, audio ni capacidades multilingües detalladas.

## Casos de uso

- Asistente de código en local: con 1,3B parámetros activos y cuantización INT4, puede ejecutarse en un MacBook o Mac mini para autocompletado, revisión de código y generación de tests sin depender de la nube, manteniendo contexto de hasta 131K tokens para repositorios medianos.
- Agente autónomo de terminal: evaluado en Terminal-Bench 2.1 con un arnés tipo Terminus 2, puede emplearse en tareas de automatización de shell, ejecución de comandos y resolución de problemas de sistema en entornos controlados.
- Razonamiento matemático y científico asistido: el modo thinking permite descomponer problemas en pasos intermedios, adecuado para tutoría o verificación de cálculos en entornos educativos o de investigación con recursos limitados.
- Despliegue edge en DGX Spark o Apple Silicon: con 100-105 tokens/s en DGX Spark y 86-90 tokens/s en M4 Pro, es viable para prototipos de asistentes conversacionales en dispositivos de escritorio sin GPU dedicada.
- Procesamiento de documentos largos: la ventana de 256K tokens con YaRN permite resumir, extraer información o responder preguntas sobre contratos, informes o transcripciones extensas en una sola pasada.
- Backend de bajo coste para aplicaciones conversacionales: la licencia MIT y el bajo consumo de memoria (8,34 GiB en FP8 a 8K de contexto) permiten integrarlo en servicios con múltiples instancias por GPU o en entornos de desarrollo con presupuesto ajustado.
- Evaluación e investigación de arquitecturas híbridas: al ser un modelo abierto con código custom, sirve para estudiar el comportamiento de KDA+MLA y MoE dispersa en tareas de razonamiento y contexto largo.

## Benchmarks y rendimiento

| Benchmark / métrica | Resultado |
|---|---|
| Artificial Analysis Intelligence Index v4.1.1 | 25 |
| Artificial Analysis Agentic Index | 16 |
| Velocidad de salida (Artificial Analysis) | >160 tokens/s |
| Latencia extremo a extremo (respuesta de 500 tokens, incluyendo razonamiento) | ~18 segundos |
| Terminal-Bench 2.1 | evaluado bajo protocolo AA con Terminus 2, timeout de 2 h, 3 ejecuciones por tarea (media); resultado numérico no disponible en el texto |
| DGX Spark, FP8 | ~100-105 tokens/s |
| M4 Pro MacBook, FP8 | ~86-90 tokens/s |
| Memoria pico a 8K de contexto, FP8 | ~8,34 GiB |

No se han publicado en la información disponible resultados numéricos desglosados de MMLU, HumanEval, GSM8K u otros benchmarks estándar; la model card remite a una imagen con la tabla de benchmarks representativos cuyo contenido no está transcrito.

## Requisitos de hardware

- VRAM estimada: en FP8, aproximadamente 8,34 GiB de pico a 8K de contexto; en BF16, el repo completo ocupa 15,8 GB, por lo que se requiere al menos ~16 GB de VRAM para cargar los pesos sin cuantizar; en INT4 el footprint se reduce aproximadamente a la mitad del BF16.
- GPU recomendadas: H20-3e (141 GB) o nodo Blackwell de una GPU para la receta de baja latencia con SGLang; también validado en NVIDIA DGX Spark.
- Consumer GPU: cabe en GPUs con 16 GB o más en FP8/INT4; en BF16 requiere 24 GB (RTX 3090/4090) para dejar margen a KV cache.
- Apple Silicon: validado en MacBook con M4 Pro y Mac mini, con 86-90 tokens/s en FP8.
- Opciones de despliegue: SGLang (imagen `lmsysorg/sglang:dev-Ling-3.0-tiny`, con recetas para BF16/FP8, baja latencia, alto throughput y HiCache + Mooncake); no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Throughput y latencia: >160 tokens/s en la evaluación de Artificial Analysis; ~18 s de latencia extremo a extremo para 500 tokens incluyendo razonamiento; 100-105 tokens/s en DGX Spark y 86-90 tokens/s en M4 Pro.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ling-3.0-tiny | 7,9B / 1,3B | 131K nativo, 256K con YaRN | MIT | Arquitectura híbrida KDA+MLA, validado en edge |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría (MoE de ~8B con ~1B activos) en la documentación facilitada, por lo que no es posible establecer una comparativa rigurosa con cifras verificables.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo; al ser un modelo entrenado con datos no documentados en la información disponible, existe riesgo de sesgos no caracterizados.
- Riesgo de alucinación inherente a los modelos generativos; el modo thinking activado por defecto puede aumentar la latencia y el consumo de tokens, por lo que conviene desactivarlo en tareas simples.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado más allá de lo que se pueda inferir de los datos de entrenamiento, que no están publicados.
- El contexto nativo es de 131K tokens; la extensión a 256K requiere YaRN y puede degradar la calidad en tareas de recuperación precisa en posiciones intermedias.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye con `custom_code`, lo que implica revisar el código de modelado incluido antes de integrarlo en producción.
- El soporte de tool calling/function calling no está documentado explícitamente; conviene validarlo empíricamente antes de depender de él en pipelines agénticos.
- La evaluación en Terminal-Bench 2.1 se realizó con un protocolo específico (Terminus 2, timeout de 2 h, 3 ejecuciones); los resultados pueden no ser directamente comparables con otras configuraciones.
- El despliegue con SGLang requiere la imagen específica `dev-Ling-3.0-tiny`; otras herramientas de inferencia no están confirmadas.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Organización en Hugging Face: https://huggingface.co/inclusionAI
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter (versión gratuita): https://openrouter.ai/inclusionai/ling-3.0-tiny:free
- Cookbook de SGLang: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-tiny
- Imagen Docker de SGLang: `lmsysorg/sglang:dev-Ling-3.0-tiny`
