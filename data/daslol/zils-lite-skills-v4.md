# dasLOL/zils-lite-skills-v4

## Resumen

zils-lite-skills-v4 es un modelo derivado de Qwen/Qwen3.5-0.8B publicado por el usuario dasLOL bajo el paraguas del proyecto Zils. No es un modelo conversacional al uso: se distribuye como un "cuerpo de habilidades" (skills body) que contiene únicamente los pesos de lenguaje y visión, y está pensado para ser montado sobre un "chasis" (chassis) propietario del pool z3 que aporta la capa de respuesta, el prompt y el runtime. El modelo se etiqueta con el pipeline `feature-extraction`, no con `text-generation`, lo que refuerza que su uso previsto es como componente interno de un sistema mayor y no como modelo autónomo.

Técnicamente es un fine-tune completo de Qwen3.5-0.8B (852.985.920 parámetros, aproximadamente 0,85 mil millones), con licencia Apache-2.0 y pesos en safetensors. El entrenamiento combina cuatro fine-tunes de parámetros completos promediados con pesos iguales, más una mezcla de datos generados por el proyecto (aritmética, comprobación de llamadas a herramientas, CMUdict, UniMorph, CxC) y conjuntos públicos de train (PIQA, 20 Newsgroups, GLUE MRPC/QQP/CoLA, SetFit), junto con destilación hacia las probabilidades de un profesor mayor (vllm-sr/d3-ultra).

Su relevancia es acotada pero específica: documenta una receta reproducible de model soup con recorte tipo TIES sobre un modelo pequeño, orientada a tareas de decisión y clasificación dentro de un pipeline de agentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni una evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B); requiere `custom_code` |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (la model card cita datos mayoritariamente en inglés: CMUdict, UniMorph, GLUE, PIQA, BIG-bench) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros. El autor no detalla la arquitectura interna del modelo base (número de capas, dimensiones, mecanismo de atención), por lo que esa información debe consultarse en el repositorio de Qwen. La innovación documentada está en el proceso de fusión: se entrenaron cuatro fine-tunes de parámetros completos partiendo de un "estudiante v2", y se promediaron con pesos iguales. Sobre ese promedio se aplica un recorte tipo TIES: se conserva, por tensor, el 25 % de mayor magnitud del vector de tarea promediado. El resultado es el "cuerpo" que se publica.

Los datos de entrenamiento se dividen en dos bloques. El primero, aproximadamente 171.000 elementos de habilidades generadas por el proyecto (recuentos aritméticos y de cobertura, comprobaciones de llamadas a herramientas, CMUdict, UniMorph, CxC) más particiones de train públicas (PIQA, 20 Newsgroups, conjuntos de clasificación de texto de SetFit, GLUE MRPC, QQP y CoLA), con replay de los datos de la v2. El segundo bloque consiste en destilación hacia las probabilidades del profesor vllm-sr/d3-ultra publicadas en zils-ai/zils-relay-answers: unos 175.000 elementos en inglés reconstruidos a partir de tasksource y particiones de train de benchmarks, en tres extracciones disjuntas, más 14.800 elementos de opción múltiple de BIG-bench, también con replay. El autor declara explícitamente que no se usaron datos del examen de validadores ni datos de clientes. No se documenta RLHF ni DPO.

## Capacidades

- Extracción de características y representaciones internas: el pipeline declarado es `feature-extraction`, por lo que el uso natural es obtener embeddings o estados ocultos, no generar texto libre.
- Habilidades de decisión y clasificación: el entrenamiento incluye GLUE MRPC, QQP, CoLA, 20 Newsgroups y conjuntos de SetFit, orientados a tareas de juicio binario o multiclase.
- Aritmética y recuentos de cobertura: se entrenó con elementos de recuento aritmético y de cobertura generados por el proyecto.
- Comprobación de llamadas a herramientas (tool-call checks): hay datos específicos de validación de invocaciones, aunque no se documenta un formato de function calling estándar.
- Conocimiento léxico y morfológico: CMUdict (pronunciación) y UniMorph (morfología) forman parte del corpus.
- Razonamiento de opción múltiple: 14.800 elementos de BIG-bench en particiones de train.
- Capacidades de visión: la model card menciona "language and vision weights", pero no se detalla el codificador visual ni tareas concretas.
- Multilingüismo: no documentado; el corpus descrito es predominantemente inglés.
- Modo thinking, audio o agentes multi-paso: no disponible.

## Casos de uso

- Clasificación de texto en pipelines de moderación o enrutado: el modelo se entrenó con GLUE MRPC, QQP y CoLA, por lo que puede emplearse como clasificador de pares de frases o de aceptabilidad gramatical dentro de un sistema mayor que aporte el prompt y la capa de respuesta.
- Extracción de características para búsqueda semántica: al declarar `feature-extraction`, sus estados ocultos pueden alimentar un índice vectorial o un reranker, siempre que se valide la calidad de los embeddings en el dominio objetivo.
- Validación de llamadas a herramientas en un agente: los datos de tool-call checks permiten usarlo como verificador previo a la ejecución de una función, reduciendo invocaciones mal formadas antes de llegar al runtime real.
- Normalización morfológica y léxica: con UniMorph y CMUdict en el entrenamiento, encaja en tareas de lematización, etiquetado morfológico o generación de variantes de pronunciación en inglés.
- Recuento y verificación aritmética en respuestas: útil como comprobador de cifras y coberturas en flujos donde otro modelo genera el texto y este valida los números.
- Componente de un ensemble de decisión: su tamaño (0,85 B) permite ejecutarlo en paralelo con modelos mayores como votante o árbitro en tareas de opción múltiple derivadas de BIG-bench.
- Destilación inversa o generación de datos: al haberse entrenado contra probabilidades de un profesor mayor, puede servir como estudiante de referencia en experimentos de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las tareas de GLUE o BIG-bench empleadas en el entrenamiento, y el repositorio no aporta una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y del código custom; presupuesto práctico de 3-4 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9-1,2 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,5-0,7 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente; en centro de datos, A100 o H100 quedan sobredimensionadas para este tamaño y solo se justifican por concurrencia.
- Cabe en GPU consumer: sí, con holgura, incluidas GPUs de portátil con 8 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada, dado el tag `custom_code`. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF hace que llama.cpp y Ollama requieran conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-skills-v4 | 0,85 B | no disponible | Apache-2.0 | Cuerpo de habilidades para chasis z3; feature-extraction | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible en esta ficha | Apache-2.0 (según atribución) | Modelo base generativo | HuggingFace, modelo upstream |
| vllm-sr/d3-lite | no disponible | no disponible | Apache-2.0 | Componente del soup Zils | Referenciado en la model card |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 | Componente del soup Zils, orientado a decisión | Referenciado en la model card |

La comparación con alternativas de propósito general del mismo tamaño (por ejemplo, modelos de 0,5-1 B orientados a generación) no es directa: zils-lite-skills-v4 no se publica como generador autónomo y carece de la capa de respuesta que aporta su chasis. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el chasis del pool z3 (capa de respuesta, prompt y runtime) no puede operar según su diseño previsto; usarlo con `text-generation` estándar producirá resultados no validados.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo en producción.
- Sesgos: el corpus es mayoritariamente inglés y está compuesto por conjuntos académicos (GLUE, PIQA, BIG-bench, tasksource), con los sesgos de dominio y de anotación de esas fuentes; no se documenta ninguna mitigación.
- Riesgo de alucinación: no evaluado; al no publicarse benchmarks ni una evaluación de fidelidad, no hay evidencia de su comportamiento ante consultas fuera de distribución.
- Contexto e idiomas: la longitud de contexto no está documentada y el soporte multilingüe no está confirmado; asumir inglés y contextos cortos es la opción conservadora.
- Licencia: Apache-2.0 permite uso comercial, pero la model card remite a los NOTICE y términos de los modelos upstream (Qwen y los modelos de la casa Zils); hay que revisarlos por si añaden restricciones.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo día (5 de noviembre de 2026), sin historial de uso ni informes de terceros; no es una base recomendable para producción sin una evaluación propia.
- Procedencia de datos: el autor declara que no usó datos de validadores ni de clientes, pero no se aporta una auditoría externa de la composición del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dasLOL/zils-lite-skills-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Profesor de destilación referenciado: https://huggingface.co/vllm-sr/d3-ultra
- Respuestas del profesor: https://huggingface.co/zils-ai/zils-relay-answers
- Componente del soup: https://huggingface.co/vllm-sr/d3-lite
- Componente del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Componente del soup: https://huggingface.co/zils-ai/jiwo-0.8b-full
- tasksource (Sileo, LREC-COLING 2024): https://huggingface.co/tasksource
- BIG-bench (Srivastava et al., 2022): https://github.com/google/BIG-bench
