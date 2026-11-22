# bigai/GS1-2B

## Resumen

GS1-2B es un modelo de decisión nativo desarrollado por BIGAI (Beijing Institute for General Artificial Intelligence), diseñado para calcular distribuciones de probabilidad sobre candidatos definidos en tiempo de ejecución en lugar de generar texto token a token. Se construye sobre el backbone híbrido de Qwen3.5-2B (2.319.227.200 parámetros almacenados) y añade una cabeza de decisión de atención cruzada multi-cabeza que compara candidatos contra la evidencia del estado, produciendo salidas tipadas Choice, Noul y Score sin generar tokens de salida.

El modelo resuelve el problema del enrutamiento de agentes, la verificación, la extracción y el control en pipelines de IA: en lugar de pedir a un LLM que "elija" una opción generando texto y parseándolo después, GS1-2B emite directamente probabilidades calibradas sobre las opciones disponibles. Con CUDA Graph alcanza 18,64 ms P50 para una pregunta corta y una aceleración de 3,49× frente a la inferencia por defecto para ocho preguntas cortas.

Es relevante ahora porque propone un paradigma distinto al de los LLM generativos para tareas de decisión: la familia GS1 (0.8B, 2B, 4B y 9B) se sitúa sobre una frontera parámetro-rendimiento competitiva, y GS1-2B obtiene 62,22 en el índice público Decision Index 0.4.1. La licencia es Apache 2.0 y los pesos están en formato safetensors con código personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión nativo con backbone híbrido Qwen3.5 (Gated DeltaNet causal + atención completa segmentada bidireccional) y cabeza de decisión de atención cruzada multi-cabeza |
| Parametros totales | 2.319.227.200 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Longitud máxima de rama completa: 65.536 tokens |
| Tipos de cuantizacion | No disponible (pesos de texto y cabeza de decisión en FP32; torre de visión retenida en BF16; inferencia en BF16 con logits finales y reducciones de probabilidad en FP32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con código personalizado, `custom_code`) |

## Arquitectura y entrenamiento

GS1-2B usa un backbone híbrido Qwen3.5 que intercala tres capas causales Gated DeltaNet con una capa de atención completa segmentada. La dimensión oculta es 2.048, con 24 capas de decodificador, 8 cabezas de atención de decisión, 2 capas de enrutamiento de candidatos y una dimensión de proyección de decisión de 256. Una cabeza de decisión de atención cruzada multi-cabeza consulta la evidencia del estado usando representaciones de pregunta y candidato, produciendo distribuciones Choice, Noul y Score directamente, sin generar tokens de salida.

El entrenamiento emplea aprendizaje por refuerzo multi-paso con recompensas calibradas: se optimizan las probabilidades de acción muestreadas con una recompensa de Brier (RLCD). Las innovaciones técnicas destacables incluyen la atención completa segmentada bidireccional, que da a los candidatos su contexto completo de comparación preservando prefijos inmutables reutilizables entre preguntas, y la Attention Residual con preservación de carry, que permite a los receptores de atención completa dispersa consultar representaciones anteriores manteniendo el ancla explícita de conexión residual. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Decisión tipada nativa con tres primitivas: Choice (enrutamiento, clasificación, selección de herramienta; devuelve ID de candidato, todas las probabilidades y confianza), Noul (verificación y juicios binarios; devuelve p(true)) y Score (valoraciones ordenadas y juicios por rúbrica; devuelve nivel esperado base cero, probabilidades por nivel y confianza).
- Enrutamiento de agentes y selección de herramientas: el modelo elige entre candidatos definidos en tiempo de ejecución.
- Verificación y juicios binarios de proposiciones.
- Extracción y control en pipelines de agentes.
- Soporte de abstención explícita y aplazamiento (deferral) gracias a las probabilidades nativas y la confianza calibrada.
- Capacidades multimodales parciales: se retiene una torre de visión del backbone, almacenada en BF16 (no se detalla el alcance de uso en la información disponible).
- Capacidades multilingües limitadas al inglés.
- No se documenta soporte de tool calling generativo, agentes multi-paso con generación de texto ni modo thinking en la información disponible.

## Casos de uso

- Enrutamiento de consultas en sistemas multi-agente: GS1-2B evalúa la pregunta del usuario contra los agentes disponibles como candidatos y devuelve la probabilidad de cada uno con confianza, permitiendo derivar la consulta al agente adecuado sin generar texto ni parsear salidas.
- Selección de herramientas en asistentes con function calling: con la primitiva Choice y su rendimiento en BFCL (93,27 de exactitud por caso), el modelo puede elegir la función o API correcta entre un conjunto definido en tiempo de ejecución.
- Clasificación de tickets y correos: con BANKING77 (88,34 macro-F1) y CLINC150+OOS (90,61 macro-F1), puede clasificar consultas de clientes en categorías predefinidas con probabilidades calibradas para umbrales de confianza.
- Verificación de afirmaciones en pipelines RAG: la primitiva Noul devuelve p(true) para una proposición, lo que permite validar respuestas de un LLM contra el contexto recuperado antes de mostrarlas al usuario.
- Extracción estructurada con candidatos dinámicos: dado un esquema de campos y valores candidatos definidos en tiempo de ejecución, el modelo puntúa cada opción y devuelve la distribución, útil en procesos de normalización de datos.
- Control de dispositivos y automatización del hogar: en el simulador de electrodomésticos alcanza 100,00 de exactitud por caso, lo que lo hace adecuado para decidir acciones de control entre comandos predefinidos.
- Evaluación por rúbrica y scoring ordenado: la primitiva Score permite puntuar respuestas o contenidos en niveles ordenados con probabilidades por nivel, aplicable a evaluación automática de calidad.

## Benchmarks y rendimiento

Resultados del Decision Index (edición 0.3, suite pública completa: 140.178 peticiones, 312.320 decisiones, 43 benchmarks de texto, 100% de cobertura). Índice corregido por azar, escala 0-100.

| Métrica | GS1-0.8B | GS1-2B | GS1-4B | GS1-9B |
|---|---:|---:|---:|---:|
| Public index ↑ | 56,12 | 62,22 | 68,97 | 70,45 |
| Raw index ↑ | 67,36 | 71,70 | 76,47 | 77,46 |
| Coverage | 100% | 100% | 100% | 100% |

Puntuaciones por área (corregidas por azar, 0-100):

| Área | GS1-0.8B | GS1-2B | GS1-4B | GS1-9B |
|---|---:|---:|---:|---:|
| Knowledge & Reasoning | 33,32 | 41,84 | 52,40 | 56,01 |
| Language Understanding | 56,25 | 63,67 | 71,12 | 72,62 |
| Retrieval & Classification | 68,62 | 71,21 | 75,55 | 75,58 |
| Tools & Automation | 79,26 | 83,57 | 87,49 | 87,61 |
| Arts & Human Taste | 47,47 | 54,16 | 59,26 | 60,57 |

Benchmarks individuales destacados de GS1-2B (métrica nativa):

| Benchmark | Métrica | GS1-0.8B | GS1-2B | GS1-4B | GS1-9B |
|---|---|---:|---:|---:|---:|
| BFCL | exactitud por caso | 90,44 | 93,27 | 97,52 | 96,99 |
| ToolRet | nDCG@10 | 67,52 | 69,25 | 71,16 | 70,90 |
| API-Bank | exactitud | 67,52 | 76,97 | 84,45 | 85,43 |
| BANKING77 | macro-F1 | 85,33 | 88,34 | 92,09 | 92,76 |
| CLINC150+OOS | macro-F1 | 85,51 | 90,61 | 94,35 | 93,48 |
| RouterBench † | calidad seleccionada | 79,63 | 71,76 | 79,06 | 79,86 |
| Simulador de electrodomésticos | exactitud por caso | 98,86 | 100,00 | 100,00 | 100,00 |
| SGD/SGD-X † | macro-F1 | 61,15 | 65,16 | 68,10 | 67,60 |
| ContractNLI | macro-F1 | 84,41 | 84,14 | 85,99 | 86,16 |
| ANLI | macro-F1 | no disponible | no disponible | no disponible | no disponible |

Rendimiento de latencia: 18,64 ms P50 con CUDA Graph para una pregunta corta; aceleración de 3,49× frente a la inferencia por defecto para ocho preguntas cortas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 2.319.227.200 parámetros almacenados en FP32 (texto y cabeza de decisión) más torre de visión en BF16, el repo ocupa 8,6 GB; la inferencia en BF16 reduciría sustancialmente el peso en memoria, pero no se publican cifras oficiales de VRAM.
- GPU recomendadas: no disponible. El uso de CUDA Graph sugiere despliegue en GPU NVIDIA, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: librería transformers con código personalizado (`custom_code`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 18,64 ms P50 (CUDA Graph, una pregunta corta) y 3,49× de aceleración sobre la inferencia por defecto para ocho preguntas cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto máximo | Public index | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| GS1-2B | 2.319.227.200 | 65.536 tokens | 62,22 | Apache 2.0 | Hugging Face (bigai/GS1-2B) |
| GS1-0.8B | no disponible | no disponible | 56,12 | Apache 2.0 | Hugging Face (bigai/GS1-0.8B) |
| GS1-4B | no disponible | no disponible | 68,97 | Apache 2.0 | Hugging Face (bigai/GS1-4B) |
| GS1-9B | no disponible | no disponible | 70,45 | Apache 2.0 | Hugging Face (bigai/GS1-9B) |

Las alternativas comparables dentro de la información disponible son los otros tamaños de la propia familia GS1. No se proporcionan datos de modelos de decisión de otros desarrolladores para comparar.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; el soporte multilingüe no está documentado.
- No es un LLM generativo: no produce texto libre, por lo que no sirve para tareas de generación, resumen o conversación abierta.
- El rendimiento en conocimiento y razonamiento es limitado (41,84 en Knowledge & Reasoning), muy por debajo del resto de áreas; no es adecuado para tareas que requieran conocimiento factual profundo.
- RouterBench muestra un resultado inferior en GS1-2B (71,76) frente a GS1-0.8B (79,63) y GS1-4B (79,06), lo que sugiere un comportamiento no monótono en esa tarea concreta.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades de decisión pueden estar mal calibradas en dominios fuera de la distribución de entrenamiento; se recomienda usar la confianza y la abstención explícita.
- Los resultados publicados corresponden al índice público (edición 0.3); la puntuación Full privada la evalúan los mantenedores del leaderboard y no se incluye.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre la torre de visión retenida del backbone Qwen3.5.
- Requiere código personalizado (`custom_code`), lo que puede complicar el despliegue en entornos con restricciones de dependencias.
- No se publican requisitos de hardware ni cifras de VRAM, lo que dificulta la planificación de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigai/GS1-2B
- Colección GS1 en Hugging Face: https://huggingface.co/collections/bigai/gs1
- Repositorio de código: https://github.com/bigai-nlco/GS1
- Documentación: https://github.com/bigai-nlco/GS1/blob/main/docs/README.md
- Playground: https://github.com/bigai-nlco/GS1/blob/main/playground/README.md
- Documentación de arquitectura: https://github.com/bigai-nlco/GS1/blob/main/docs/model.md
- Documentación de RLCD: https://github.com/bigai-nlco/GS1/blob/main/docs/RLCD.md
