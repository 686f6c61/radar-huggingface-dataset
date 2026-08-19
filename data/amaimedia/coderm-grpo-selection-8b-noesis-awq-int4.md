# AMAImedia/CodeRM-GRPO-Selection-8B-NOESIS-AWQ-INT4

## Resumen

CodeRM-GRPO-Selection-8B-NOESIS-AWQ-INT4 es un modelo de recompensa (reward model) especializado en el dominio del código, desarrollado por AMAImedia como parte de la plataforma NOESIS de automatización de doblaje profesional (framework DHCF-FNO). Se basa en Qwen/Qwen3-8B y ha sido afinado con GRPO (Group Relative Policy Optimization) para puntuar candidatos de código generados por otros modelos, permitiendo selección best-of-N. Esta variante concreta está cuantizada con AWQ INT4 (kernel GEMM) para su despliegue en GPU de gama media, ocupando aproximadamente 6,1 GB en disco y requiriendo unos 5,5 GB de VRAM pico.

El modelo no genera texto: actúa como clasificador de secuencias, asignando una puntuación relativa a cada par (prompt, código) dentro de un grupo de candidatos. Su propósito principal es servir como selector en pipelines de generación de código donde se muestrean N respuestas y se elige la mejor según la puntuación del reward model. La licencia Apache 2.0, heredada de Qwen3-8B, lo hace apto para uso comercial sin restricciones adicionales.

La relevancia actual de este modelo radica en la creciente adopción de técnicas de RLHF y best-of-N para mejorar la calidad de la generación de código en entornos de producción, especialmente cuando se busca reducir costes de inferencia mediante cuantización agresiva sin sacrificar la capacidad de discriminación entre candidatos casi correctos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (backbone de scoring, no generativo) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (posicional 40 960) |
| Tipos de cuantizacion | AWQ INT4 (GEMM kernel, group_size=128, zero_point=true) |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B es multilingue, pero el afinamiento se centra en codigo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards, 4,0 GB + 2,1 GB) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura de Qwen3-8B, un transformer causal con 36 capas, 32 cabezas de atención, 8 cabezas KV (GQA), dimensión oculta de 4096 y vocabulario de 151 936 tokens. Aunque se instancia como `Qwen3ForCausalLM`, no se usa para generación autoregresiva sino como extractor de características: se alimenta con el prompt y el código candidato, y la puntuación se obtiene aplicando softmax sobre los logits del último token.

El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization), metodología introducida en DeepSeekMath y DeepSeek-R1. En lugar de optimizar contra una recompensa absoluta, GRPO compara las puntuaciones dentro de un grupo de candidatos generados para el mismo prompt, produciendo señales de preferencia más nítidas en tareas de código donde muchos candidatos son "casi correctos" pero solo unos pocos pasan los tests. El modelo base Qwen3-8B se mantiene congelado durante la inferencia (regla `R-REWARD-MODEL-FROZEN`).

La cuantización AWQ INT4 se realizó con la librería `autoawq`, con 64 muestras de calibración procedentes del dataset `noesis_router_dataset_50k_curated.jsonl`, longitud máxima de secuencia de 384 tokens y semilla RNG 1729. El proceso tardó 57,13 minutos. El resultado reduce el peso de ~16 GB (BF16) a ~6,1 GB en disco.

## Capacidades

- Puntuación de código: dado un prompt y una respuesta de código, devuelve un valor escalar que indica la calidad relativa del candidato dentro de un grupo.
- Selección best-of-N: permite ordenar N candidatos generados por un modelo de código y elegir el `argmax` o aplicar selección top-k.
- Discriminación fina entre candidatos casi correctos: la señal de recompensa grupal de GRPO mejora la separación entre soluciones que pasan tests y las que no.
- Integración en pipelines de agentes: puede usarse como componente de re-ranking en sistemas multi-agente donde se generan múltiples soluciones.
- Compatibilidad con el ecosistema NOESIS: diseñado para operar como selector en la rama M5-CODE de la plataforma NOESIS-VC-ONE.
- Sin generación de texto: no produce código ni respuestas, solo puntúa.
- Multilingüismo limitado al dominio de código: aunque el tokenizador de Qwen3-8B soporta múltiples idiomas, el modelo está especializado en instrucciones de programación.

## Casos de uso

- Selección de la mejor solución en generación de código con best-of-N: un modelo generativo (p. ej., M5-CODE) produce N candidatos para un prompt; CodeRM los puntúa y el orquestador elige el de mayor score. Es adecuado porque la señal relativa de GRPO distingue mejor entre soluciones que compilan y pasan tests frente a las que no.
- Filtrado de respuestas en agentes de programación autónomos: en un agente que itera sobre un problema, cada paso genera varias propuestas; el reward model selecciona la más prometedora antes de ejecutar pruebas o continuar el razonamiento.
- Re-ranking en pipelines de RAG para documentación de código: cuando se recuperan fragmentos de código de una base vectorial, CodeRM puede puntuar cada fragmento respecto a la consulta y reordenar los resultados para mejorar la relevancia.
- Control de calidad en generación masiva de código: en entornos de CI/CD donde se generan automáticamente tests o implementaciones, el modelo actúa como filtro previo para descartar candidatos de baja calidad antes de ejecutar la batería de pruebas.
- Evaluación automática de ejercicios de programación: en plataformas educativas, se puede usar para puntuar soluciones de estudiantes comparándolas con una referencia, aunque su entrenamiento está orientado a código generado por modelos, no a código humano.
- Optimización de costes en inferencia: al ser un modelo pequeño (8B) cuantizado a INT4, puede ejecutarse en GPU de 6 GB, permitiendo desplegar selección best-of-N en entornos con recursos limitados, como estaciones de trabajo con RTX 3060.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros reward models. Tampoco se proporcionan datos de precisión en tareas de selección de código. Por tanto, no es posible evaluar cuantitativamente su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,5 GB pico según la model card, lo que permite ejecución en GPU con 6 GB de memoria.
- GPU recomendadas: RTX 3060 (6 GB) como mínimo; también compatible con RTX 4060, RTX 4070, A10, L4 o cualquier GPU con al menos 6 GB de VRAM y soporte para kernels AWQ.
- En consumer GPU: sí, cabe en tarjetas de gama media como RTX 3060, RTX 4060, RTX 4070, etc.
- Opciones de despliegue: transformers >= 5.8.1 con configuración nativa `AwqConfig` (no requiere importar `autoawq` en inferencia). No se mencionan vLLM, llama.cpp ni Ollama en la documentación, aunque podrían ser compatibles si soportan AWQ INT4.
- Latencia y throughput: no disponibles en la información proporcionada.
- Restricción de dispositivo: el kernel AWQ GEMM requiere `device_map={"": 0}` (carga en un único dispositivo); no usar `device_map="auto"`.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros reward models de código. La model card no menciona modelos comparables ni ofrece tablas de rendimiento frente a alternativas. Se puede señalar que, por su naturaleza, sería comparable a otros reward models basados en Qwen3-8B o modelos de recompensa de código como los derivados de DeepSeek-Coder, pero no hay datos públicos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un reward model, no un modelo generativo: no puede completar código ni responder preguntas; solo puntúa pares (prompt, código).
- Dependencia del modelo base: su capacidad de discriminación está limitada por la representación interna de Qwen3-8B; si el código contiene patrones fuera del dominio de entrenamiento, la puntuación puede ser poco fiable.
- Posible degradación por cuantización: la conversión a INT4 puede introducir pérdidas de precisión en la puntuación, aunque la calibración con 64 muestras intenta mitigarlo. No hay estudios de impacto publicados.
- Sesgos no documentados: no se ha realizado ni publicado ningún análisis de sesgos. Dado que el entrenamiento se centra en código, podría estar sesgado hacia ciertos lenguajes o estilos de programación.
- Riesgo de alucinación en la puntuación: al ser un modelo de recompensa, puede asignar puntuaciones altas a código incorrecto si el patrón se asemeja a soluciones válidas vistas durante el entrenamiento.
- Limitación de contexto: la ventana de 32 768 tokens (40 960 posicional) puede ser insuficiente para archivos de código muy largos o funciones extensas.
- Requisito de versión de transformers: necesita `transformers >= 5.8.1`; versiones anteriores no leerán correctamente la configuración AWQ.
- Restricción de device map: el kernel AWQ GEMM exige carga en un único dispositivo; no es posible distribuir el modelo en múltiples GPUs.
- Regla de producción best-of-N capada a N=8: la integración NOESIS limita la selección a 8 candidatos para controlar VRAM y latencia en RTX 3060.
- Sin soporte de fine-tuning en inferencia: el modelo está congelado; no se puede adaptar en tiempo de ejecución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AMAImedia/CodeRM-GRPO-Selection-8B-NOESIS-AWQ-INT4
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Organización AMAImedia: https://huggingface.co/AMAImedia
- Sitio web de AMAImedia: https://AMAImedia.com
- Perfil de X (Twitter): https://x.com/AMAImediacom
- LinkedIn del fundador: https://www.linkedin.com/in/ilabolotnikov (enlace no verificado en la información proporcionada)
- Telegram del fundador: https://t.me/djbionicl
