# allenai/AstaBrief_8B

## Resumen

AstaBrief-8B es un modelo de lenguaje especializado en generación de informes de investigación con citas, desarrollado por el Allen Institute for AI (Ai2). El modelo recibe como entrada una pregunta de investigación junto con extractos de literatura científica recuperada y produce un informe estructurado con citas verificables. Se inicializa desde AstaBrief-8B-SFT (a su vez basado en Qwen3-8B) y se afina mediante optimización directa de preferencias (DPO) offline sobre el conjunto AstaBrief_DPO_Mix.

La relevancia del modelo radica en su enfoque de "deep research": en lugar de requerir un pipeline multi-paso con agentes orquestados, AstaBrief-8B genera el informe citado en un solo paso a partir del contexto recuperado, lo que simplifica el despliegue y reduce la latencia frente a sistemas multi-agente. Con 8.000 millones de parámetros, ocupa un espacio manejable para inferencia en GPU de gama alta de consumo y se distribuye bajo licencia Apache 2.0.

El modelo está entrenado exclusivamente en inglés y su uso previsto es la investigación y la educación. Según la model card, es competitivo con sistemas como Asta ScholarQA y DR-Tulu-8B en el conjunto ScholarQA-CS2, con una tasa de victoria del 72% frente a Asta ScholarQA en el split de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B) |
| Parametros totales | 8.000 millones (aproximado, heredado de Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con max sequence length de 16.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pytorch), repositorio de 32,8 GB |

## Arquitectura y entrenamiento

AstaBrief-8B es un transformer decoder-only inicializado desde Qwen3-8B y posteriormente afinado en dos etapas: primero con supervisión (SFT) para dar lugar a AstaBrief-8B-SFT, y después con DPO offline sobre AstaBrief_DPO_Mix. El conjunto de DPO contiene consultas reales de usuarios, dos informes por consulta y juicios de preferencia sobre cada par. Los informes se generaron con pipelines tanto multi-paso (Asta ScholarQA) como de un solo paso, usando modelos de respaldo como Claude 3.5 Sonnet, Claude 3.7 Sonnet, o3, o4-mini, GPT-4.1, DeepSeek-V3 y DeepSeek-R1. Dos modelos juez (GPT-4.1 y DeepSeek-R1) compararon cada par y se seleccionaron únicamente los pares con acuerdo entre ambos jueces, tras verificar una alineación del 95% con preferencias humanas.

El entrenamiento DPO se ejecutó en open-instruct sobre 8 GPU H100, con 7 épocas, learning rate de 5e-06, scheduler lineal, warmup ratio de 0,1, pérdida DPO Norm, beta de 10, batch size por dispositivo de 1, acumulación de gradiente de 8 pasos, longitud máxima de secuencia de 16.000 tokens y precisión BF16. El modelo está diseñado para usar un formato de prompt específico recomendado por el autor, que incluye la consulta y las referencias de sección; usar otro formato puede degradar el comportamiento.

## Capacidades

- Generación de informes de investigación citados a partir de una pregunta y extractos de literatura científica recuperada.
- Generación en un solo paso, sin necesidad de orquestación multi-agente.
- Producción de citas con precisión y cobertura evaluables (citation precision y citation recall).
- Razonamiento sobre literatura científica y síntesis de múltiples fuentes.
- Generación de texto conversacional en formato chat (pipeline text-generation, conversational).
- Capacidad multilingüe limitada al inglés.
- No se documentan capacidades de tool calling, function calling, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Revisión de literatura automatizada: dado un tema de investigación y un conjunto de abstracts recuperados, el modelo genera un informe con citas que un investigador puede revisar y editar, ahorrando tiempo en la fase de síntesis inicial.
- Asistentes de investigación académica: integrado en un buscador científico, el modelo transforma los resultados de recuperación en un resumen estructurado con referencias, adecuado para portales de documentación científica.
- Generación de informes técnicos internos: en equipos de I+D, permite convertir documentación recuperada de repositorios internos en informes citados para revisión de pares.
- Evaluación de cobertura de citas: al priorizar citation precision y recall, es útil en pipelines que necesitan verificar que cada afirmación del informe está respaldada por una fuente.
- Educación y formación: generación de resúmenes citados de literatura para cursos de posgrado, con la ventaja de que las citas son trazables.
- Prototipado de sistemas deep-research: al ser un modelo de un solo paso, sirve como línea base ligera frente a pipelines multi-agente en experimentos de investigación sobre generación aumentada por recuperación.
- Generación de borradores en inglés para publicación: útil para investigadores no nativos que necesitan un primer borrador estructurado con referencias antes de la edición humana.

## Benchmarks y rendimiento

Resultados en el test set ScholarQA-CS2 (100 preguntas de investigación en informática escritas por usuarios):

| Modelo | Media | Ingredient Recall | Answer Precision | Citation Precision | Citation Recall |
|---|---:|---:|---:|---:|---:|
| Qwen3-8B | 77,3 | 77,8 | 90,6 | 76,2 | 64,6 |
| AstaBrief-8B-SFT | 83,7 | 85,2 | 90,4 | 87,7 | 71,3 |
| AstaBrief-8B | 87,0 | 90,2 | 89,0 | 90,5 | 78,2 |

Comparativa con sistemas de referencia:

| Modelo | SQA-CS2 (Dev) | SQA-CS2 (Test) | DeepScholarBench | Win Rate vs Asta SQA (Dev) | Win Rate vs Asta SQA (Test) |
|---|---:|---:|---:|---:|---:|
| Asta ScholarQA | 87,6 | 86,2 | 60,25 | N/A | N/A |
| DR-Tulu-8B | 86,5 | 88,8 | 56,26 | 36% | 54% |
| AstaBrief-8B | 86,3 | 87,0 | 53,50 | 55% | 72% |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 8.000 millones de parámetros en BF16 se requieren aproximadamente 16 GB de pesos, más memoria para el contexto (hasta 16.000 tokens en entrenamiento).
- GPU recomendadas: el entrenamiento DPO se realizó en 8xH100; para inferencia se puede usar una sola GPU con suficiente VRAM (A100 40/80 GB, H100, L40S).
- GPU de consumo: un modelo de 8B en BF16 no cabe en GPUs de 8-12 GB sin cuantización; con cuantización de 4 bits podría caber en GPUs de 16 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: transformers (AutoModelForCausalLM) y vLLM, según el ejemplo de la model card; no se documentan otros formatos como GGUF, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SQA-CS2 (Test) | DeepScholarBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AstaBrief-8B | 8B | no disponible | 87,0 | 53,50 | Apache 2.0 | Hugging Face (allenai) |
| DR-Tulu-8B | 8B | no disponible | 88,8 | 56,26 | no disponible | Hugging Face |
| Asta ScholarQA | no disponible (sistema multi-paso) | no disponible | 86,2 | 60,25 | no disponible | sistema de referencia |
| Qwen3-8B | 8B | no disponible | 77,3 (media) | no disponible | Apache 2.0 | Hugging Face (Qwen) |

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: aunque el modelo está optimizado para citas, puede generar referencias inexactas o atribuciones incorrectas; se recomienda verificación humana.
- Requiere el formato de prompt recomendado por el autor; otros formatos pueden producir comportamientos degradados o inconsistentes.
- Uso previsto limitado a investigación y educación según las Responsible Use Guidelines de Ai2.
- Licencia Apache 2.0 permite uso comercial, pero se debe consultar la documentación del dataset DPO sobre las fuentes de datos utilizadas.
- No se documentan sesgos específicos; al derivar de Qwen3-8B, puede heredar sesgos de los datos de preentrenamiento de este.
- No se documentan capacidades de tool calling, agentes multi-paso ni modo thinking, lo que limita su uso en pipelines agénticos complejos.
- La longitud de contexto efectiva no está documentada en la model card; el entrenamiento usó secuencias de hasta 16.000 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allenai/AstaBrief_8B
- Checkpoint SFT: https://huggingface.co/allenai/AstaBrief_8B_SFT/
- Dataset DPO: https://huggingface.co/datasets/allenai/AstaBrief_DPO_Mix
- Prompt recomendado: https://huggingface.co/datasets/allenai/AstaBrief_prompts/blob/main/sft_prompt.txt
- Blog del proyecto: https://allenai.org/blog/astabrief
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper Asta ScholarQA: https://aclanthology.org/2025.acl-demo.49.pdf
- Paper DR-Tulu: https://allenai.org/papers/drtulu
- Paper ScholarQA-CS2: https://openreview.net/pdf?id=M7TNf5J26u
- Repositorio open-instruct: https://github.com/allenai/open-instruct
- Responsible Use Guidelines de Ai2: https://allenai.org/responsible-use
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
