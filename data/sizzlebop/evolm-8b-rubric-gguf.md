# sizzlebop/EvoLM-8B-Rubric-GGUF

## Resumen

EvoLM-8B-Rubric es un modelo de generación de texto de 8.190.735.360 parámetros (aproximadamente 8,19B) especializado en la creación de rúbricas de evaluación ponderadas. No es un modelo de propósito general: su función es, dado un prompt o tarea, producir entre 2 y 5 criterios atómicos con pesos explícitos que después consume un modelo juez externo para puntuar respuestas candidatas. Proviene del paper *EvoLM: Self-Evolving Language Models through Co-Evolved Discriminative Rubrics* y corresponde al checkpoint final de la fase de rúbricas (paso global 1000, `rubric/step_1000`), afinado desde `Qwen/Qwen3-8B` sobre el dataset `allenai/tulu-3-sft-mixture`.

El repositorio analizado, `sizzlebop/EvoLM-8B-Rubric-GGUF`, no es un entrenamiento nuevo sino una conversión a formato GGUF de los pesos originales en safetensors de `stellalisy/EvoLM-8B-Rubric`, realizada con `llama.cpp` desde BF16 nativo y cuantizada en siete variantes k-quant (de Q2_K a Q8_0, más el BF16 de referencia). El repositorio ocupa 50,1 GB en total.

Su relevancia actual está en el ámbito del *reward modeling* y la evaluación automática: en lugar de emitir una puntuación escalar opaca, el modelo explicita los criterios de evaluación, lo que facilita auditar pipelines de RLHF/RLAIF, construir conjuntos de evaluación y desplegar sistemas de tipo LLM-as-a-judge de forma local. La arquitectura es un transformer causal denso Qwen3ForCausalLM con GQA, y la longitud de contexto máxima declarada es de 40.960 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer causal denso, `qwen3`) |
| Parámetros totales | 8.190.735.360 (≈8,19B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (max position) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Modelo base | stellalisy/EvoLM-8B-Rubric (a su vez desde Qwen/Qwen3-8B) |
| Tamaño del repositorio | 50,1 GB |
| Hidden size | 4.096 |
| Intermediate size | 12.288 |
| Capas | 36 |
| Cabezas de atención | 32 |
| Cabezas KV (GQA) | 8 |
| Dimensión de cabeza | 128 |
| RoPE theta | 1.000.000 |
| Tamaño de vocabulario | 151.936 |
| Precisión base de los pesos | bfloat16 (BF16) |
| Checkpoint | Paso global 1000 (`rubric/step_1000`) |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

### Variantes GGUF disponibles

| Fichero | Tipo | Tamaño (GiB) | Tamaño (bytes) |
|---|---|---|---|
| `EvoLM-8B-Rubric-BF16.gguf` | BF16 | 15,26 | 16.388.044.128 |
| `EvoLM-8B-Rubric-Q8_0.gguf` | Q8_0 | 8,11 | 8.709.518.688 |
| `EvoLM-8B-Rubric-Q6_K.gguf` | Q6_K | 6,26 | 6.725.899.616 |
| `EvoLM-8B-Rubric-Q5_K_M.gguf` | Q5_K_M | 5,45 | 5.851.112.800 |
| `EvoLM-8B-Rubric-Q4_K_M.gguf` | Q4_K_M | 4,68 | 5.027.784.032 |
| `EvoLM-8B-Rubric-Q3_K_M.gguf` | Q3_K_M | 3,84 | 4.124.161.376 |
| `EvoLM-8B-Rubric-Q2_K.gguf` | Q2_K | 3,06 | 3.281.732.960 |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Qwen3, con 36 capas, hidden size de 4.096, intermediate size de 12.288 y 32 cabezas de atención sobre 8 cabezas KV, lo que supone una agrupación GQA de 4:1 para reducir el coste de la caché KV. Usa RoPE con theta de 1.000.000, lo que es coherente con la ventana de 40.960 posiciones. El vocabulario es de 151.936 tokens y los pesos base están en BF16. El checkpoint se inicializa desde `Qwen/Qwen3-8B` y se afina sobre `allenai/tulu-3-sft-mixture` hasta el paso global 1000, correspondiente a la fase de generación de rúbricas (`rubric/step_1000`) del pipeline descrito en el paper.

La innovación principal no es arquitectónica sino de procedimiento: en el esquema EvoLM, el modelo no emite una recompensa escalar, sino rúbricas específicas por pregunta con criterios y pesos explícitos, que un modelo juez posterior (el paper menciona Qwen3-1.7B) emplea para evaluar respuestas candidatas en distintas dimensiones de calidad. El modelo soporta bloques de razonamiento `<think>` antes de emitir la rúbrica estructurada y utiliza el formato ChatML estándar de Qwen (`<|im_start|>` / `<|im_end|>`). No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Generación de rúbricas de evaluación ponderadas: a partir de una consulta o tarea, produce entre 2 y 5 criterios atómicos con criterios de puntuación explícitos.
- Razonamiento previo estructurado mediante bloques `<think>` antes de la salida final.
- Adecuación a tareas heterogéneas: las rúbricas se generan específicamente para el prompt de entrada, no son plantillas fijas.
- Uso como componente de *reward modeling*: sus salidas alimentan a un modelo juez que puntúa respuestas candidatas.
- Generación de texto conversacional, ya que hereda la base instruct de Qwen3-8B y el pipeline declarado es text-generation.
- Formato de prompt compatible con ChatML y plantillas de sistema personalizables (por ejemplo, definiendo el rol de asistente de evaluación).
- Idiomas: únicamente inglés declarado en la model card; no se documentan capacidades multilingües.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente o multi-step reasoning más allá del bloque `<think>`: no documentadas.
- Visión, audio o multimodalidad: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Construcción de pipelines de RLHF y RLAIF: el modelo genera las rúbricas que un juez externo usa para puntuar respuestas candidatas, sustituyendo recompensas escalares opacas por criterios auditables.
- Evaluación automática de LLMs (LLM-as-a-judge): dado un prompt y varias respuestas, se generan criterios ponderados específicos de esa pregunta y se puntúan las candidatas con mayor control que una comparación holística.
- Creación de conjuntos de evaluación interna: generar rúbricas por tarea permite construir benchmarks propios con criterios explícitos y reproducibles para modelos en desarrollo.
- Filtrado de datos de entrenamiento: puntuar grandes volúmenes de pares instrucción-respuesta para descartar ejemplos de baja calidad antes de un fine-tuning posterior.
- Evaluación educativa asistida: para consignas abiertas (por ejemplo, explicar un concepto a estudiantes), el modelo produce criterios de corrección ponderados que un docente o un sistema de calificación puede aplicar.
- Auditoría de sistemas de recomendación de contenido generado: generar criterios de calidad por tipo de petición para detectar respuestas que cumplen el formato pero fallan en exactitud o adecuación.
- Investigación en metacognición y auto-evaluación: estudiar cómo varían las rúbricas generadas según el dominio, la longitud del prompt o la temperatura de muestreo, como línea de trabajo sobre co-evolución de rúbricas discriminativas.
- Despliegue local de un juez auxiliar: al ser un modelo de 8B cuantizable, puede ejecutarse en una estación de trabajo para pre-puntuar respuestas antes de escalar al juicio humano, reduciendo el coste de anotación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de acuerdo con juicios humanos, ni tampoco comparaciones cuantitativas con el checkpoint base `Qwen/Qwen3-8B` o con otros modelos de rúbricas. Tampoco se documentan medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos, según variante: Q2_K ≈ 3,1 GiB; Q3_K_M ≈ 3,9 GiB; Q4_K_M ≈ 4,7 GiB; Q5_K_M ≈ 5,5 GiB; Q6_K ≈ 6,3 GiB; Q8_0 ≈ 8,1 GiB; BF16 ≈ 15,3 GiB.
- Caché KV estimada a partir de la arquitectura declarada (36 capas, 8 cabezas KV, dimensión de cabeza 128, BF16): aproximadamente 144 KiB por token, es decir, unos 576 MiB a 4.096 tokens y unos 5,6 GiB a la ventana completa de 40.960 tokens. Son cálculos derivados de las especificaciones del modelo, no mediciones publicadas.
- Combinando pesos y caché: Q4_K_M con 4.096 tokens de contexto requiere del orden de 5,5-6 GiB, por lo que cabe en GPU de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070. Q8_0 requiere aproximadamente 9-10 GiB, cómodo en RTX 4080/4090 y en tarjetas de 16 GB.
- BF16 con contexto largo (40.960 tokens) ronda los 21 GiB solo en pesos y caché, por lo que necesita RTX 4090 de 24 GB, A100 de 40/80 GB o H100. También es viable en CPU con memoria RAM suficiente, dado el formato GGUF.
- Opciones de despliegue documentadas en la model card: `llama-cli` y `llama-server` (API compatible con OpenAI en el puerto 8080), Ollama mediante `Modelfile`, y LM Studio con la plantilla ChatML. El modelo base en safetensors permite otros servidores, pero esta información no se detalla en el repositorio.
- Ajustes recomendados por el autor: temperatura 0,6, 512 tokens de generación en el ejemplo de `llama-cli` y contexto de 4.096 en los ejemplos de servidor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EvoLM-8B-Rubric-GGUF (este repositorio) | 8,19B | 40.960 tokens | Apache 2.0 | GGUF (7 cuantizaciones) | Especializado en generación de rúbricas; 0 descargas y 0 likes registrados |
| stellalisy/EvoLM-8B-Rubric | 8,19B (no confirmado en la información disponible) | No disponible | Apache 2.0 (según el repositorio derivado) | Safetensors | Modelo de origen del que se convierten los GGUF; misma función de generación de rúbricas |
| Qwen/Qwen3-8B | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo base sobre el que se afina EvoLM; es un modelo de propósito general, no un generador de rúbricas |
| Qwen3-1.7B | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Citado en el paper como modelo juez que consume las rúbricas generadas por este modelo |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia y función.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés (`en`). No hay evidencia de calidad en castellano u otros idiomas, y es previsible un rendimiento degradado fuera del inglés.
- Especialización estrecha: el modelo está afinado para generar rúbricas. Su uso como asistente conversacional general no está validado y probablemente sea inferior a Qwen3-8B estándar.
- Sin benchmarks publicados: no hay métricas que respalden la calidad de las rúbricas generadas ni su acuerdo con evaluaciones humanas.
- Riesgo de alucinación en los criterios: al generar rúbricas específicas por prompt, puede introducir criterios irrelevantes, redundantes o contradictorios, o ponderaciones mal calibradas, especialmente en dominios técnicos especializados.
- Sin validación comunitaria: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no existe retroalimentación de terceros sobre su funcionamiento real.
- Pérdida de calidad por cuantización: el autor advierte de pérdida notable en Q2_K ("maximum compression, noticeable quality loss") y recomienda Q8_0 para máxima calidad de evaluación; Q4_K_M se señala como opción por defecto para despliegue local. En tareas de evaluación, pequeñas degradaciones pueden alterar las puntuaciones.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3-8B (también Apache 2.0) y se ha afinado sobre `allenai/tulu-3-sft-mixture`. Conviene revisar las licencias de los subconjuntos de ese dataset antes de un uso comercial, ya que la información proporcionada no las detalla.
- Contexto: la ventana declarada es de 40.960 tokens, pero no se documenta el comportamiento del modelo más allá de ese límite ni la necesidad de ajustes de RoPE para aprovecharla completa.
- Dependencia de un juez externo: el valor del modelo está en un pipeline de dos etapas; sin un modelo juez adecuado, las rúbricas generadas no producen puntuaciones por sí solas.
- Fecha de creación del repositorio registrada como 2026-09-19, posterior a la fecha típica de consulta; conviene verificar la vigencia de los artefactos antes de integrarlos en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sizzlebop/EvoLM-8B-Rubric-GGUF
- Modelo base (rúbricas, safetensors): https://huggingface.co/stellalisy/EvoLM-8B-Rubric
- Modelo base original: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Paper *EvoLM: Self-Evolving Language Models through Co-Evolved Discriminative Rubrics*: mencionado en la model card, enlace no disponible en la información proporcionada
- Resultados de la búsqueda web: no contienen enlaces relevantes al modelo (los resultados devueltos corresponden a cuestionarios de Bing y no guardan relación con la ficha)
