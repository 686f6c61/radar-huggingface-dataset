# smllms/HyperCLOVA-X-SEED-MISHULTA-v2

## Resumen

HyperCLOVA-X-SEED-MISHULTA-v2 es un modelo de lenguaje coreano de 14.800 millones de parámetros (dense), desarrollado por el equipo MISHULTA como parte del hackathon K-DS (NIA). Se trata de un ajuste fino (fine-tuning) del modelo base de NAVER Cloud HyperCLOVAX-SEED-Think-14B, orientado a reforzar las capacidades de razonamiento multi-paso y razonamiento de sentido común en coreano. El modelo se distribuye bajo la licencia HyperCLOVA X SEED, que exige que los nombres de los modelos derivados comiencen por "HyperCLOVA X".

La versión v2 mejora significativamente respecto a su predecesora v1 en tareas de razonamiento multi-paso (tipo MuSR), pasando de 0,383 a 0,525 en el benchmark SNU Ko-MuSR, aunque pierde algo de rendimiento en tareas de conocimiento enciclopédico (KMMLU). El modelo está pensado para desarrolladores e investigadores que necesiten un LLM coreano con capacidades de razonamiento explícito, con un modo de pensamiento (think) activado por defecto en su plantilla de chat.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Peri-Layer Normalization y Maximal Update Parameterization (μP) |
| Parametros totales | 14.748.112.896 (14,8B) |
| Parametros activos | No aplica (modelo dense) |
| Longitud de contexto | 32.768 tokens (32k) |
| Tipos de cuantizacion | No publicados oficialmente; el entrenamiento usó QLoRA 4-bit NF4, el modelo final se distribuye en bf16 (safetensors) |
| Idiomas soportados | Coreano (ko) |
| Licencia | HyperCLOVA X SEED Model License Agreement (licencia propietaria de NAVER Cloud) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base HyperCLOVAX-SEED-Think-14B emplea una arquitectura Transformer con Peri-Layer Normalization y Maximal Update Parameterization (μP), una técnica de inicialización y escalado que permite entrenar modelos grandes con hiperparámetros transferibles desde modelos pequeños. El ajuste fino de MISHULTA-v2 se realizó mediante QLoRA (4-bit NF4) con adaptadores de rango 64 y alpha 128, aplicados sobre 7 módulos, durante 2 épocas y con 12.613 ejemplos. Los adaptadores se fusionaron posteriormente en los pesos del modelo en bf16.

El conjunto de entrenamiento se compone de tres fuentes, todas con datos públicos o sintéticos propios: 6.140 ejemplos de auto-destilación (STaR) generados a partir del propio modelo base en modo think sobre el split de entrenamiento de KMMLU (45 asignaturas), seleccionando solo las cadenas de razonamiento que conducen a la respuesta correcta; 5.329 ejemplos de destilación de profesor usando DeepSeek-R1-0528 y Solar Pro 4 para generar soluciones en coreano verificadas contra la respuesta correcta; y 1.131 ejemplos de razonamiento multi-paso sintéticos inspirados en MuSR (localización y asignación de equipos), con programas generados que garantizan la corrección de la respuesta. Se excluyeron explícitamente los splits de test de KMMLU, los ítems solapados con Com2 y los ítems de Ko-MuSR para evitar contaminación en la evaluación.

## Capacidades

- Razonamiento multi-paso y de sentido común en coreano, con modo de pensamiento explícito (think) activado por defecto en la plantilla de chat.
- Generación de texto en coreano con alta fluidez, heredada del modelo base HyperCLOVAX-SEED-Think-14B.
- Razonamiento matemático básico y resolución de problemas aritméticos en coreano, gracias al entrenamiento con el dataset Orca-Math en coreano.
- Seguimiento de instrucciones y formato de chat multi-turno mediante la plantilla de chat de HyperCLOVA X.
- Capacidad de desactivar el modo de razonamiento mediante el parámetro `skip_reasoning=True` para respuestas directas.
- No se documenta soporte para tool calling, function calling, visión, audio ni otros modos multimodales.

## Casos de uso

- Asistentes de atención al cliente en coreano: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 32k tokens) y razonar sobre problemas complejos de soporte, gracias a su modo think que permite desglosar la consulta antes de responder.
- Sistemas de tutoría y educación: su capacidad de razonamiento paso a paso lo hace adecuado para explicar problemas matemáticos o lógicos en coreano, mostrando el proceso de resolución al estudiante.
- Análisis de documentos legales o técnicos en coreano: con 32k de contexto, puede procesar contratos, informes o artículos extensos y extraer conclusiones razonadas.
- Generación de contenido editorial o creativo en coreano: el modelo produce texto coherente y culturalmente adaptado al contexto coreano, útil para redacción de artículos, guiones o material de marketing.
- Evaluación y verificación de respuestas en pipelines de QA: al poder razonar sobre preguntas de opción múltiple (entrenado con KMMLU), puede usarse como componente de verificación en sistemas de recuperación de información.
- Investigación académica en PNL coreana: sirve como modelo de referencia para estudiar el impacto del ajuste fino con razonamiento explícito en tareas de sentido común y multi-paso, comparándolo con el modelo base.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación provienen de la medición propia del equipo MISHULTA, con evaluación 0-shot generativa y modo think activado. No se han publicado resultados en benchmarks estándar externos (MMLU, HumanEval, GSM8K) para este modelo concreto.

| Benchmark | v1 | v2 (este modelo) |
|---|---|---|
| SNU Ko-MuSR (oficial, 3 tareas × 40) | 0,383 | 0,525 |
| └ murder mysteries | 0,475 | 0,65 |
| └ team allocation | 0,425 | 0,60 |
| KMMLU 5 asignaturas (muestra) | 0,696 | 0,592 |
| KMMLU 10 asignaturas (muestra) | 0,66 | 0,64 |

El modelo v2 muestra una mejora notable en razonamiento multi-paso y de sentido común, pero un ligero descenso en tareas de conocimiento enciclopédico respecto a v1. No se dispone de datos comparativos con otros modelos de la misma categoría en estos benchmarks.

## Requisitos de hardware

- El modelo en bf16 ocupa aproximadamente 29,5 GB (tamaño del repositorio), por lo que se necesita una GPU con al menos 32 GB de VRAM para inferencia sin cuantización (por ejemplo, A100 40GB, H100 80GB, o dos RTX 4090 en paralelo).
- Con cuantización a 8 bits, la VRAM estimada sería de unos 15-16 GB, lo que permitiría ejecutarlo en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Con cuantización a 4 bits, la VRAM estimada sería de unos 8-9 GB, permitiendo su ejecución en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB), aunque no se han publicado archivos GGUF o AWQ oficiales.
- No se han publicado datos oficiales de latencia ni throughput. Se recomienda usar vLLM o TGI para despliegue en producción con batching, o llama.cpp/Ollama si se opta por cuantización GGUF (a generar por el usuario).
- El modo think genera cadenas de razonamiento largas, por lo que el tiempo de generación por petición será mayor que en modelos sin este modo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Razonamiento multi-paso (Ko-MuSR) | Conocimiento (KMMLU) |
|---|---|---|---|---|---|
| HyperCLOVA-X-SEED-MISHULTA-v2 | 14,8B | 32k | HyperCLOVA X SEED | 0,525 | 0,64 (10 asignaturas) |
| HyperCLOVA-X-SEED-MISHULTA-v1 | 14,8B | 32k | HyperCLOVA X SEED | 0,383 | 0,66 (10 asignaturas) |
| HyperCLOVAX-SEED-Think-14B (base) | 14,8B | 32k | HyperCLOVA X SEED | no disponible | no disponible |

No se dispone de datos públicos de otros modelos coreanos comparables (como Solar Pro 4 o DeepSeek-R1) en los mismos benchmarks para establecer una comparación directa. El modelo base HyperCLOVAX-SEED-Think-14B ya incorpora capacidades de razonamiento, y este ajuste fino las refuerza específicamente para tareas de sentido común y multi-paso.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos en coreano; su rendimiento en otros idiomas, incluido el inglés, no está garantizado y probablemente sea deficiente.
- La licencia HyperCLOVA X SEED es propietaria y restringe el uso comercial. Es obligatorio revisar el acuerdo de licencia completo antes de cualquier despliegue en producción, y los modelos derivados deben nombrarse comenzando por "HyperCLOVA X".
- Los benchmarks publicados son mediciones propias del equipo desarrollador, no verificadas de forma independiente. Los resultados pueden no ser reproducibles en otros entornos o con otras configuraciones de muestreo.
- El modo think activado por defecto genera cadenas de razonamiento largas, lo que aumenta la latencia y el coste computacional por petición. Si no se necesita razonamiento explícito, debe desactivarse con `skip_reasoning=True`.
- No se han documentado sesgos específicos, pero al estar entrenado sobre datos coreanos puede reflejar sesgos culturales o lingüísticos propios de ese contexto.
- Riesgo de alucinación en tareas de conocimiento factual, como se observa en la caída de rendimiento en KMMLU respecto a v1. Se recomienda verificación externa para usos sensibles.
- No se proporcionan garantías de soporte para tool calling, agentes o integraciones con APIs externas; el modelo está pensado principalmente para generación de texto y razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smllms/HyperCLOVA-X-SEED-MISHULTA-v2
- Modelo v1: https://huggingface.co/smllms/HyperCLOVA-X-SEED-MISHULTA-v1
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B
- Licencia del modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B/blob/main/LICENSE
- Documentación de HyperCLOVA X en Transformers: https://huggingface.co/docs/transformers/v5.13.0/en/model_doc/hyperclovax
- Informe técnico de HyperCLOVA X (arXiv): https://arxiv.org/html/2404.01954v1
