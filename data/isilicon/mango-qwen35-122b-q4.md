# isilicon/mango-qwen35-122b-q4

## Resumen

Mango Qwen3.5 122B A10B Q4 es un espejo de preservación publicado por isilicon en HuggingFace, que empaqueta en formato GGUF (cuantización Q4_K, repartido en ocho shards) el modelo abliterated Huihui-Qwen3.5-122B-A10B creado por huihui-ai. Se trata de una variante sin filtros de alineación de un modelo de la familia Qwen3.5 con arquitectura mixta de expertos (MoE): 122.111.526.912 parámetros totales, de los cuales aproximadamente 10.000 millones están activos por token (A10B). El repositorio no entrena ni modifica nada: su valor añadido es la preservación exacta de los bytes originales y una evaluación rigurosa y documentada de esa configuración concreta, con una puntuación ponderada "Mango" de 80,72/100.

La relevancia de esta ficha radica en que ofrece, por primera vez para esta variante, mediciones reproducibles de calidad y rendimiento: 202 preguntas más 12 casos agénticos ejecutados en 120,76 minutos, con desglose por dominios (ciberseguridad, código, razonamiento agéntico, inteligencia social, seguimiento de instrucciones y conocimiento general). Los propios autores advierten que la ganancia de calidad frente a configuraciones más pequeñas (como Qwen27, con 80,64) no compensa un coste de cómputo unas cinco veces mayor, lo que convierte esta ficha en una referencia honesta para decidir si el despliegue de 122B merece la pena.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.5), variante abliterated |
| Parámetros totales | 122.111.526.912 |
| Parámetros activos | ~10.000 millones (A10B, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (8 shards, 74,21 GB / 69,11 GiB de payload) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-122B-A10B, una arquitectura transformer de tipo mixture-of-experts con 122 mil millones de parámetros totales y unos 10 mil millones activos por token, lo que reduce sustancialmente el coste de inferencia frente a un modelo denso equivalente. La variante distribuida por huihui-ai es "abliterated", es decir, ha sido modificada para eliminar comportamientos de rechazo por alineación, sin reentrenamiento completo. No hay información publicada en este repositorio sobre el número de tokens de preentrenamiento, la composición del dataset ni el uso de RLHF/DPO para el modelo base. Este repositorio (isilicon/mango-qwen35-122b-q4) no añade entrenamiento alguno: conserva los bytes originales de la revisión `5d378336d96a1e40b5458b566bb5556ab44b64c2` de huihui-ai y añade documentación y evaluación.

Como innovación metodológica, el repositorio aporta un marco de evaluación propio ("Mango weighted score") con cohortes emparejadas, intervalos de confianza (bootstrap y Wilson), heurísticas mecánicas para casos agénticos y un estudio separado de niveles de esfuerzo en Qwen (medium frente a xhigh: 82,87 frente a 84,41 sobre 100, diferencia emparejada de +1,54 puntos con intervalo 95 % [-1,71, +4,82]).

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Generación y corrección de código: 18/20 tests locales HumanEval+ superados (90,00 %).
- Razonamiento matemático: 100 % en el subconjunto de MATH-500 niveles 4-5 (n=5) y 92,86 % en un subconjunto de MMLU-Pro (n=14).
- Ciberseguridad ofensiva/defensiva: CyberMetric 95 %, CTI root-cause/CWE 80 %, CTI multiple choice 75 %.
- Seguimiento estricto de instrucciones: 20/20 prompts IFEval estrictos superados.
- Llamadas a herramientas (function calling estilo BFCL): 67,50 % en 40 llamadas locales.
- Bucles agénticos multi-paso: 11/12 casos mecánicos superados (91,67 %), cubriendo finalización, evidencia, permisos y totales de precio.
- Comprensión social/emocional: EQ-Bench v2 con media de 81,27; teoría de la mente (OpenToM) 61,11 %.
- Al ser abliterated, genera contenido sin los rechazos de seguridad del modelo original; no hay datos publicados sobre soporte multimodal (visión/audio).

## Casos de uso

- Chatbots sin filtros de alineación: al ser abliterated, sirve para asistentes conversacionales donde se quiere evitar rechazos excesivos, con calidad de inteligencia social medida (EQ-Bench 81,27).
- Asistentes de ciberseguridad: análisis de inteligencia de amenazas, identificación de causas raíz y clasificación CWE, apoyado en 95 % de CyberMetric y 80 % en CTI root-cause.
- Generación de código en flujos locales: puede integrarse en pipelines de desarrollo para autocompletado y generación de funciones, con 90 % de tests HumanEval+ locales.
- Agentes multi-paso con herramientas: el 91,67 % de casos agénticos mecánicos lo hace apto para bucles de agente con verificación de permisos y cálculo de precios, aunque con margen de mejora en function calling (67,5 %).
- Razonamiento matemático y conocimiento general: adecuado para resolver problemas de dificultad alta (MATH-500 niveles 4-5) y preguntas de conocimiento tipo MMLU-Pro.
- Investigación y preservación de modelos: por su carácter de espejo documentado con evaluación reproducible, es útil como referencia para estudios comparativos de configuraciones cuantizadas.
- Evaluación de seguimiento de instrucciones: con 100 % en IFEval estricto, es apropiado para tareas con restricciones de formato rígidas.

## Benchmarks y rendimiento

Resultados publicados por el propio repositorio (subconjuntos pequeños y graders locales, no pipelines oficiales):

| Tarea / grader | n | Media / % | Intervalo 95 % | Método |
|---|---|---|---|---|
| EQ-Bench v2 | 30 | 81,27 | 73,99–87,43 | Bootstrap media |
| OpenToM labels | 18 | 61,11 | 38,62–79,70 | Wilson |
| CTI multiple choice | 20 | 75,00 | 53,13–88,81 | Wilson |
| CTI root-cause / CWE | 15 | 80,00 | 54,81–92,95 | Wilson |
| CyberMetric | 20 | 95,00 | 76,39–99,11 | Wilson |
| BFCL-style local | 40 | 67,50 | 52,02–79,92 | Wilson |
| HumanEval+ local | 20 | 90,00 | 69,90–97,21 | Wilson |
| IFEval estricto | 20 | 100,00 | 83,89–100,00 | Wilson |
| MMLU-Pro (subconjunto) | 14 | 92,86 | 68,53–98,73 | Wilson |
| MATH-500 niveles 4-5 | 5 | 100,00 | 56,55–100,00 | Wilson |
| Heurística de agente | 12 | 91,67 | 64,61–98,51 | Wilson |

Puntuación ponderada Mango: 80,72/100. Carga de trabajo emparejada: 120,76 minutos (202 preguntas + 12 casos agénticos). Comparación de cohortes emparejadas:

| Configuración | Ponderado /100 | Minutos de carga | Checks agénticos | Finalizaciones por longitud |
|---|---|---|---|---|
| Mango Qwen3.5 122B A10B Q4_K | 80,72 | 120,76 | 11/12 | 0 |
| Qwen27 (referencia) | 80,64 | ~24 (≈1/5 del tiempo) | no disponible | no disponible |

Rendimiento medido: latencia p50/p95 de petición 30,91/80,00 s; TTFT p50/p95 0,73/1,00 s; tasa media reportada de 106,34 tokens de salida por segundo de petición; 750.134 tokens de finalización en total. No se publican comparaciones con MMLU, GSM8K ni HumanEval oficiales completos.

## Requisitos de hardware

- Payload en disco: 74,21 GB (69,11 GiB) para los 8 shards Q4_K GGUF; la VRAM necesaria será mayor al incluir KV cache y memoria de trabajo.
- VRAM estimada para inferencia: no disponible explícitamente; para un MoE de 122B en Q4_K es realista asumir que no cabe íntegro en una única GPU de consumo (una RTX 4090 de 24 GB es insuficiente incluso para el payload). Con offload parcial a CPU/RAM en llama.cpp sería viable con 64-128 GB de RAM del sistema, aunque el repositorio no publica cifras.
- GPU recomendadas: no disponible; por tamaño, hardware de gama datacenter (A100/H100 de 80 GB, o multi-GPU) sería lo apropiado para servirlo completo en GPU.
- Consumer GPU: no cabe completo en ninguna GPU de consumo actual; solo viable con descarga de expertos a RAM.
- Despliegue: formato GGUF, por lo que llama.cpp, Ollama y runtimes derivados (LM Studio, etc.) son compatibles; no hay soporte declarado para vLLM o TGI al ser GGUF.
- Latencia/throughput medidos: TTFT p50 de 0,73 s; tasa reportada de 106,34 tokens/s de salida (no es throughput nativo de decodificación y depende del motor); la carga completa del benchmark tomó 120,76 minutos, unas cinco veces más que la referencia Qwen27.

## Comparativa con modelos similares

| Configuración | Parámetros | Ponderado Mango /100 | Minutos de carga | Checks agénticos | Licencia |
|---|---|---|---|---|---|
| Mango Qwen3.5 122B A10B Q4_K (este) | 122B (A10B MoE) | 80,72 | 120,76 | 11/12 | Apache 2.0 |
| Qwen27 (referencia Mango) | no disponible | 80,64 | ≈24 | no disponible | no disponible |
| Mango Qwen38 27B uncensored (MLX4, cohort effort) | 27B | 82,87–84,41 según esfuerzo | no disponible | no disponible | no disponible |

Conclusión de los propios autores: esta configuración exacta no ha demostrado una ganancia de calidad que compense su coste temporal, aproximadamente cinco veces superior al de Qwen27 con puntuación prácticamente idéntica.

## Limitaciones y advertencias

- Al ser abliterated, el modelo carece de salvaguardas de alineación: puede generar contenido que el modelo original rechazaría. Su uso exige controles adicionales en producción.
- Muestras de evaluación muy pequeñas (n entre 5 y 40) con intervalos de confianza amplios; los resultados de HumanEval/BFCL no corresponden a los pipelines oficiales completos.
- Riesgo de alucinación: no evaluado explícitamente en este repositorio; no disponible.
- Longitud de contexto e idiomas soportados: no disponibles en la model card.
- Coste de eficiencia: la carga de trabajo medida es unas cinco veces la de Qwen27 con calidad equivalente (80,72 frente a 80,64), lo que desaconseja su uso si no se necesita específicamente esta variante.
- Solo se distribuye en GGUF Q4_K: sin pesos safetensors en este repo y con `inference: false` en HuggingFace (sin inference server integrado).
- El fallo en 1 de los 12 casos agénticos permanece incluido; los checks agénticos solo cubren finalización, evidencia, permisos y precios, no la semántica completa de las respuestas.
- Licencia Apache 2.0: permite uso comercial, pero el contenido abliterated puede tener implicaciones de responsabilidad legal según jurisdicción y aplicación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/isilicon/mango-qwen35-122b-q4
- Modelo base (huihui-ai abliterated GGUF): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-122B-A10B-abliterated-GGUF
- Colección Mango (modelos evaluados y espejos de preservación): https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluación (dataset): https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen (medium vs xhigh): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
