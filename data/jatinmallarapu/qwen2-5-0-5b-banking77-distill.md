# JatinMallarapu/qwen2.5-0.5b-banking77-distill

## Resumen

JatinMallarapu/qwen2.5-0.5b-banking77-distill es un ajuste fino por destilación del modelo Qwen2.5-0.5B-Instruct, especializado en la clasificación de intenciones (intent classification) para consultas bancarias en inglés. Lo desarrolla JatinMallarapu como proyecto personal de investigación, sin vinculación con ninguna entidad bancaria, y se distribuye bajo licencia Apache 2.0. El modelo resuelve el problema de enrutar automáticamente consultas de clientes hacia una de las 77 intenciones definidas en el conjunto de datos PolyAI Banking77, una tarea clásica en la construcción de asistentes conversacionales y sistemas de atención al cliente.

Técnicamente se trata de un modelo transformer decoder-only de 494.032.768 parámetros (aproximadamente 0,5 mil millones), derivado de la familia Qwen2.5. El ajuste se realizó mediante LoRA (rank 16, alpha 32, dropout 0,05) sobre todas las capas lineales, con pesos fusionados exportados en float32. La versión publicada es una v0.1 piloto con una única semilla de entrenamiento y un subconjunto de 200 consultas del profesor, por lo que debe considerarse un experimento preliminar más que un artefacto listo para producción.

Su relevancia radica en que demuestra un flujo de destilación de conocimiento desde un profesor mayor (Qwen2.5-7B AWQ) hacia un estudiante pequeño, con verificación de etiquetas y controles de solapamiento entre splits. Aun así, el propio autor advierte que no es apto para decisiones bancarias, pagos, determinación de fraude ni despliegues de atención al cliente sin revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste LoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens de longitud máxima de entrenamiento (contexto nativo de Qwen2.5-0.5B no especificado en la información disponible) |
| Tipos de cuantizacion | No disponible (pesos publicados en float32 fusionados; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers, compatible con AutoModelForCausalLM) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. Sobre él se aplicó un ajuste LoRA con rank 16, alpha 32 y dropout 0,05, apuntando a todas las capas lineales, con una longitud máxima de 128 tokens, 3 épocas y tasa de aprendizaje 0,0002. El entrenamiento se ejecutó en una GPU Tesla T4; el código fija bf16 o fp16 según el soporte en tiempo de ejecución de PyTorch, aunque los manifiestos originales no registran el dtype finalmente seleccionado. Los pesos fusionados se exportaron en CPU en float32.

Los datos de entrenamiento combinan las consultas de entrenamiento de PolyAI Banking77 con paráfrasis generadas por un profesor Qwen2.5-7B AWQ. Para aceptar una paráfrasis se exige que tres etiquetas sembradas a temperatura 0,7 coincidan con la etiqueta dorada de origen, con verificación mediante recuperación solo sobre entrenamiento y excluyendo el ID fuente; además se aplican comprobaciones de duplicados exactos y de solapamiento con validación y test. Se aceptaron 480 de 600 propuestas (retención del 80 %). El estudiante A usa solo datos dorados; el estudiante B añade los datos aceptados del profesor. La semilla publicada (semilla 1) se seleccionó por pérdida de validación, nunca por accuracy de test. El alcance es un piloto de 200 fuentes de entrenamiento balanceadas por intención, manteniendo las 8.992 filas doradas completas en ambos estudiantes.

## Capacidades

- Clasificación de intenciones bancarias en inglés sobre las 77 etiquetas de Banking77, mediante puntuación de verosimilitud sobre todas las etiquetas.
- Generación de texto básica heredada de Qwen2.5-0.5B-Instruct (el modelo base es un instruct model).
- Formato conversacional con plantilla de chat (system + user) y prompt de sistema específico para enrutamiento de consultas.
- Soporte de abstención mediante umbrales elegidos en validación (calibración con temperature scaling).
- Enmascaramiento parcial de PII mediante expresiones regulares (protección parcial, no garantía de privacidad).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Enrutamiento de consultas en un asistente bancario: el modelo clasifica la consulta del cliente en una de las 77 intenciones (por ejemplo, "tarjeta no recibida" o "disputa de cargo") y la dirige al flujo o departamento correspondiente. Es adecuado por su tamaño reducido y su entrenamiento específico en Banking77, aunque solo como componente de investigación.
- Prototipado de sistemas de atención al cliente: sirve para validar pipelines de clasificación de intenciones antes de invertir en modelos mayores, gracias a su bajo coste de inferencia (unos 548 ms de mediana en T4 con puntuación de 77 etiquetas).
- Comparación de estrategias de destilación: útil como referencia en experimentos que midan la ganancia de añadir datos sintéticos del profesor frente a datos dorados (estudiante A frente a estudiante B).
- Filtrado y triaje previo en colas de soporte: puede preetiquetar tickets entrantes para priorización humana, siempre con revisión posterior y mecanismos de abstención.
- Investigación académica sobre calibración y abstención: el modelo incluye umbrales y temperature scaling documentados, lo que facilita estudios de cobertura y fiabilidad en clasificación de intenciones.
- Evaluación de robustez frente a inyección de prompts: el autor publica una auditoría con 50 pares adversariales, útil como caso de estudio de seguridad en modelos pequeños desplegados en dominios sensibles.

## Benchmarks y rendimiento

| Sistema | Accuracy [IC 95 %] | Macro-F1 [IC 95 %] | p50 / p95 ms, batch 1 |
|---|---|---|---|
| TF-IDF (referencia CPU) | 0,8867 [0,8761; 0,8981] | 0,8871 [0,8762; 0,8985] | 3,21 / 5,54 |
| zeroshot | 0,6179 [0,6037; 0,6294] | 0,5968 [0,5806; 0,6080] | 3684,31 / 3703,69 |
| student_a-seed1 | 0,9321 [0,9226; 0,9409] | 0,9321 [0,9223; 0,9408] | 548,23 / 607,81 |
| student_b-seed1 | 0,9198 [0,9097; 0,9282] | 0,9195 [0,9094; 0,9279] | 548,55 / 607,44 |

Los intervalos son bootstrap estratificados por etiqueta con modelo fijo. Las latencias de CPU y GPU corresponden a hardware distinto y no son comparaciones de velocidad equivalentes; la latencia GPU mide la puntuación de verosimilitud sobre las 77 etiquetas, no una generación greedy. Con una sola semilla no puede estimarse la variación entre semillas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 494 millones de parámetros ocupan aproximadamente 2 GB de pesos; con overhead de activaciones y tokenizador, cabe holgadamente en GPUs de 4-6 GB. En fp16/bf16 bajaría a unos 1 GB de pesos.
- GPU recomendadas: Tesla T4 (usada en el entrenamiento y evaluación), RTX 3060/4060 o superiores para inferencia cómoda; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM (RTX 3050, GTX 1660 Super, etc.), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (AutoModelForCausalLM/AutoTokenizer), text-generation-inference (etiqueta endpoints_compatible), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: mediana de 548 ms y p95 de 607 ms en T4 para puntuación de 77 etiquetas en batch 1; el autor indica que las mediciones de escalado a batch 32 quedan como trabajo futuro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-banking77-distill (student_b) | 494 M | 128 (entrenamiento) | 0,9198 | Apache 2.0 | Hugging Face |
| qwen2.5-0.5b-banking77-distill (student_a) | 494 M | 128 (entrenamiento) | 0,9321 | Apache 2.0 | Hugging Face |
| TF-IDF (referencia del autor) | No aplica | No aplica | 0,8867 | No disponible | Referencia interna |
| Qwen2.5-0.5B-Instruct zeroshot | 494 M | Contexto nativo de Qwen2.5 | 0,6179 | Apache 2.0 | Hugging Face |

No se dispone de comparaciones con otros modelos especializados en Banking77 en la información proporcionada.

## Limitaciones y advertencias

- Proyecto personal no afiliado a ninguna entidad bancaria; no apto para decisiones bancarias, pagos, determinación de fraude ni despliegues de atención al cliente sin revisión.
- Versión piloto v0.1 con una sola semilla y solo 200 fuentes de paráfrasis del profesor; no estima la variación entre semillas ni completa el estudio de destilación sobre todas las fuentes.
- El acuerdo con el profesor no equivale a verificación humana; persisten errores del profesor, ambigüedad de etiquetas y desviación de dominio.
- La generación libre puede producir texto inválido; para garantizar etiquetas válidas es necesario el scorer finito sobre las 77 etiquetas.
- El enmascaramiento de PII por expresiones regulares es protección parcial, no una garantía de privacidad.
- Auditoría de ataques de instrucción: tasa de cambio de salida del 36 %, tasa de salida forzada del 30 % y tasa de abstención bajo ataque del 0 % en 50 pares redactados por el autor; no certifica resistencia a ataques arbitrarios.
- Idioma limitado al inglés; contexto de entrenamiento de solo 128 tokens.
- Las diferencias de ECE frente a la referencia TF-IDF reflejan también procedimientos de calibración distintos (temperature scaling solo en los LLM).
- No se documentan resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JatinMallarapu/qwen2.5-0.5b-banking77-distill
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset PolyAI/banking77: https://huggingface.co/datasets/PolyAI/banking77
- Repositorio GitHub del autor: enlace referenciado en la model card como "linked GitHub repository" (URL no especificada en la información disponible)
