# ggbetz/qwen3-4b-think-s1-full-sft

## Resumen

ggbetz/qwen3-4b-think-s1-full-sft es un ajuste fino supervisado (SFT) de parámetros completos sobre Qwen/Qwen3-4B-Base, publicado por el usuario ggbetz en HuggingFace. Se trata de la etapa Stage1 de un currículum de razonamiento orientado a código, entrenada sobre el subconjunto "think_s1" (datos fáciles y medios de razonamiento sobre código), y corresponde al checkpoint-1094 de dicho entrenamiento. El modelo conserva la plantilla de chat de Qwen3 y está pensado para operar con el modo de pensamiento (thinking) activado.

El interés de esta ficha es acotado pero relevante: se trata de un experimento de destilación de capacidades de razonamiento en un modelo denso de 4.022 millones de parámetros, con licencia Apache 2.0 y un coste de inferencia que cabe en una GPU de consumo. Frente a los checkpoints oficiales de Qwen3, este modelo documenta de forma explícita su receta de entrenamiento (DeepSpeed ZeRO-2, 72.555 muestras, 2 épocas, LR 1e-5, empaquetado neat_packing) y sus resultados de evaluación en LiveCodeBench y AIME, lo que permite reproducir el proceso.

La relevancia práctica es la de un modelo pequeño de código y matemáticas con modo razonamiento, desplegable con vLLM o TGI y con ventana de entrenamiento de 16.384 tokens. Conviene señalar una discrepancia documental: la model card se titula "modrill/qwen3-4b-think-s1-full-sft" mientras que el repositorio consultado es "ggbetz/qwen3-4b-think-s1-full-sft", por lo que podría tratarse de una réplica o de un cambio de espacio de nombres del mismo experimento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3), con atención por consultas agrupadas (GQA) y plantilla de chat Qwen3 |
| Parámetros totales | 4.022.468.096 (4,02 B), dato real de safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No declarada explícitamente en la model card. La receta de SFT usa un cutoff de 16.384 tokens y el ejemplo oficial de vLLM arranca con --max-model-len 32768; el modelo base Qwen3-4B-Base soporta 32.768 tokens |
| Tipos de cuantización | No disponible. Solo se publican pesos en precisión completa (el repositorio ocupa 8,8 GB); no hay variantes GGUF, GPTQ ni AWQ oficiales |
| Idiomas soportados | Inglés (en) y chino (zh), según las etiquetas del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, compatible con text-generation-inference) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer denso decoder-only de 4,02 B de parámetros. El ajuste es de parámetros completos (full SFT), no LoRA ni adaptadores, ejecutado con DeepSpeed ZeRO-2 sobre 4 GPU con batch global de 64 (4 GPU × 4 × 4). El conjunto de datos es "think_s1", compuesto por 72.555 muestras de razonamiento sobre código de dificultad fácil y media, con empaquetado de secuencias (neat_packing) activado. El entrenamiento duró 2 épocas, 1.094 pasos, con tasa de aprendizaje 1e-5 y planificador coseno con un 10 % de warmup, alcanzando una pérdida final de entrenamiento de aproximadamente 0,57.

La particularidad técnica es el uso de un currículum por etapas: este checkpoint es la Stage1 (checkpoint-1094) de una secuencia "think" que el autor acompaña de otros artefactos relacionados (una versión baseline full SFT en modo think y otra en modo nothink). Durante el entrenamiento se activa enable_thinking=true y se usa la plantilla de chat nativa de Qwen3, con una longitud de corte de 16.384 tokens, lo que condiciona el comportamiento del modelo hacia respuestas largas con cadena de razonamiento explícita. No se documenta en la información disponible el uso de RLHF, DPO u otras fases de alineación posteriores al SFT.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen3 y turnos multi-turno.
- Razonamiento explícito en modo thinking (enable_thinking=true), con cadenas de pensamiento largas: la configuración de evaluación recomendada usa max_tokens=16384.
- Generación y razonamiento sobre código, que es el eje del dataset de entrenamiento (LiveCodeBench como benchmark principal reportado).
- Razonamiento matemático de competición, evaluado en AIME24 y AIME25 (resultados modestos, ver sección de benchmarks).
- Soporte multilingüe limitado a inglés y chino según las etiquetas del repositorio.
- Compatibilidad directa con text-generation-inference y con el servidor OpenAI-compatible de vLLM, lo que habilita su uso en pipelines con formato de API estándar.
- No se documenta soporte de tool calling, function calling, uso de agentes multi-paso, visión ni audio en la información proporcionada.

## Casos de uso

- Asistencia a la programación en local: el modelo puede generar y explicar fragmentos de código en inglés o chino ejecutándose en una única GPU de 16-24 GB, con la cadena de razonamiento visible para depurar por qué propone una solución concreta.
- Generación de tests unitarios y casos límite: aprovechando el entrenamiento sobre datos de razonamiento de código de dificultad media, resulta adecuado para producir baterías de pruebas a partir de firmas de funciones o de especificaciones cortas.
- Revisión de código en integración continua: sirviéndolo con vLLM mediante su API compatible con OpenAI, se puede invocar desde hooks de pre-commit o pipelines de CI para detectar patrones sospechosos con una latencia y coste bajos frente a modelos de mayor tamaño.
- Tutoría de matemáticas de nivel preuniversitario y de competición: el modo thinking permite mostrar el desarrollo del problema paso a paso, útil en entornos educativos donde interesa la traza de razonamiento y no solo la respuesta final.
- Experimentación académica sobre currículos de entrenamiento: al estar publicado el checkpoint intermedio (Stage1, paso 1.094) junto con los baselines think y nothink, sirve como punto de comparación controlado en estudios sobre SFT completo en modelos de 4 B.
- Prototipado de agentes de razonamiento de bajo coste: con 16.384 tokens de contexto de entrenamiento se pueden encadenar varias iteraciones de reflexión sobre un mismo problema sin salir del presupuesto de memoria de una GPU de consumo.
- Extracción de explicaciones estructuradas sobre código heredado: el modelo puede resumir qué hace una función o un módulo y justificar su comportamiento, en flujos de documentación interna.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con EvalScope (release_latest / AIME) y configuración de muestreo temperature=0.6, top_p=0.95 y max_tokens=16.384:

| Benchmark | pass@1 | Configuración |
|---|---|---|
| LiveCodeBench | 36,06 % | t=0.6, p=0.95, max_tokens=16384 |
| AIME24 | 16,67 % | t=0.6, p=0.95, max_tokens=16384 |
| AIME25 | 3,33 % | t=0.6, p=0.95, max_tokens=16384 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K ni equivalentes), ni métricas de latencia o throughput.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 8,05 GB (4,022 B de parámetros × 2 bytes), coherente con los 8,8 GB del repositorio. Es el único formato publicado.
- Memoria adicional para caché KV: no publicada por el autor. Como estimación orientativa para un transformer de 4 B con GQA, el coste ronda 0,14 GB por cada 1.000 tokens de contexto en BF16, es decir, del orden de 2,3 GB a 16.384 tokens y de 4,6 GB a 32.768 tokens. Estas cifras son estimaciones, no datos del repositorio.
- GPU recomendadas: una RTX 4090 o RTX 4080 (16-24 GB) permite inferencia en BF16 con margen para contexto largo; A100 40/80 GB o H100 quedan sobredimensionadas para un solo modelo, pero son útiles para servir varias réplicas o para lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más en BF16, y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits mediante bitsandbytes, GPTQ o AWQ (conversión a cargo del usuario, ya que no hay variantes publicadas).
- Opciones de despliegue: vLLM (receta oficial en la model card, con --max-model-len 32768 y puerto 8801), HuggingFace Transformers con device_map="auto", y text-generation-inference (etiqueta text-generation-inference presente en el repositorio). Los tags del repositorio incluyen endpoints_compatible. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato publicado | Datos de benchmark |
|---|---|---|---|---|---|
| ggbetz/qwen3-4b-think-s1-full-sft | 4,02 B (denso) | 16.384 en entrenamiento (hasta 32.768 en el ejemplo de vLLM) | Apache 2.0 | safetensors | LiveCodeBench 36,06 %; AIME24 16,67 %; AIME25 3,33 % |
| Qwen/Qwen3-4B-Base (modelo de partida) | 4,02 B (denso) | 32.768 tokens | Apache 2.0 | safetensors | No disponible en esta información |
| Qwen3-4B en variante oficial con modo thinking | 4,02 B (denso) | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF (variantes de la comunidad) | No disponible en esta información |

No se dispone de datos de benchmarks homogéneos para comparar este checkpoint con las alternativas de la misma categoría. La comparación relevante es contra el propio modelo base y contra los otros checkpoints del mismo autor (think baseline y nothink baseline), pero sus resultados no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Resultados débiles en matemáticas: 16,67 % en AIME24 y 3,33 % en AIME25 con pass@1 indican que el modelo no es fiable para razonamiento matemático de competición, a pesar del modo thinking.
- LiveCodeBench de 36,06 % es un resultado propio de un modelo de 4 B ajustado sobre datos fáciles y medios; no equivale al rendimiento de checkpoints de mayor tamaño o con currículos completos.
- Es un checkpoint de una etapa intermedia (Stage1, paso 1.094) de un currículum, no un modelo final pulido; es esperable un comportamiento menos estable que el de un modelo alineado.
- Idiomas limitados a inglés y chino: no se declara soporte de español ni de otras lenguas, por lo que el rendimiento fuera de esos dos idiomas es incierto.
- Riesgo de alucinación inherente a un modelo de 4 B sin fases documentadas de RLHF o DPO; no hay información sobre mitigaciones de seguridad, filtrado de datos ni evaluación de sesgos.
- La ventana de entrenamiento es de 16.384 tokens; usar el modelo a 32.768 tokens, aunque configurable en vLLM, queda fuera del régimen de entrenamiento y puede degradar la calidad.
- No se publican variantes cuantizadas ni GGUF, lo que obliga a conversiones propias si se quiere desplegar en CPU o en GPU de gama baja.
- Discrepancia entre el identificador del repositorio (ggbetz/...) y el título de la model card (modrill/...): conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.
- Licencia Apache 2.0, sin restricciones declaradas para uso comercial, pero sujeta en última instancia a los términos del modelo base Qwen3-4B-Base.
- Sin descargas ni "likes" en el momento de la consulta, y sin documentación de terceros: no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ggbetz/qwen3-4b-think-s1-full-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Checkpoint relacionado (think baseline full SFT): https://huggingface.co/modrill/qwen3-4b-think-baseline-full-sft
- Checkpoint relacionado (nothink baseline full SFT): https://huggingface.co/modrill/qwen3-4b-nothink-baseline-full-sft
- No se han encontrado otros enlaces relevantes (paper, blog, repositorio o demo) en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
