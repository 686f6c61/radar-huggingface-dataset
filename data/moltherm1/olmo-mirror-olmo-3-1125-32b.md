# moltherm1/olmo-mirror-olmo-3-1125-32b

## Resumen

Olmo 3 32B es un modelo de lenguaje de tipo transformer denso desarrollado por el Allen Institute for AI (AI2) dentro de la familia Olmo 3, que incluye variantes de 7B y 32B en versiones Base, Instruct y Think. Esta ficha corresponde al checkpoint base de 32B, publicado en el repositorio original como `allenai/Olmo-3-1125-32B` y replicado aquí bajo el identificador `moltherm1/olmo-mirror-olmo-3-1125-32b`. El modelo está entrenado sobre el dataset Dolma 3 (5,5 billones de tokens) y forma parte de un esfuerzo por ofrecer modelos de lenguaje completamente abiertos: pesos, código, checkpoints intermedios y detalles de entrenamiento.

La relevancia de Olmo 3 radica en su carácter verdaderamente abierto bajo licencia Apache 2.0, lo que permite uso comercial, auditoría e investigación reproducible sin las restricciones habituales de los modelos propietarios. Con 32B parámetros, 64 capas, un tamaño oculto de 5120 y una ventana de contexto de 65.536 tokens, se posiciona como una alternativa de tamaño medio-grande para tareas de generación de texto, razonamiento, código y matemáticas.

Al tratarse de un modelo base (no ajustado con instrucciones), su función principal es servir como punto de partida para fine-tuning, evaluación de capacidades crudas y experimentación en ciencia de modelos de lenguaje, más que como asistente conversacional listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parametros totales | 32B (aproximado, según denominación del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estándar de transformers; no se detalla explícitamente en la información) |

Otros datos arquitectónicos declarados: 64 capas, hidden size de 5120, 40 cabezas de atención (Q heads) y 8 cabezas KV (GQA).

## Arquitectura y entrenamiento

Olmo 3 32B es un transformer decoder-only denso con 64 capas, dimensión oculta de 5120, 40 cabezas de consulta y 8 cabezas de clave/valor, lo que implica atención con grouped-query attention (GQA) para reducir el coste de memoria del KV cache durante la inferencia. La ventana de contexto es de 65.536 tokens.

El entrenamiento se realizó sobre Dolma 3, el dataset abierto de AI2, con un total de 5,50 billones de tokens y un enfoque de entrenamiento por etapas (staged training). La familia Olmo 3 incluye pipelines posteriores de SFT, DPO y RLVR (reinforcement learning with verifiable rewards) para las variantes Instruct y Think; este checkpoint concreto es el modelo base, por lo que no incorpora dichos ajustes. AI2 publica código, checkpoints intermedios y detalles de entrenamiento, lo que facilita la reproducibilidad y el estudio del proceso completo.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Modelado de lenguaje base: útil para continuaciones, few-shot prompting y evaluación de conocimiento crudo.
- Razonamiento y conocimiento general: los benchmarks declarados incluyen MMLU (STEM, Humanidades, Ciencias Sociales, Otros) y BBH.
- Matemáticas: evaluación específica Olmo 3-Eval Math y Deepmind Math.
- Generación de código: HumanEval, MBPP, BigCodeBench y evaluaciones multilingües de código.
- Comprensión lectora y question answering: SQuAD, CoQA, DROP, NaturalQs.
- Razonamiento commonsense: HellaSwag, Winogrande, PIQA, SocialIQA, CSQA.
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente para inglés; los benchmarks MultiPL indican cierto rendimiento en código multilingüe, pero no se declara soporte general de idiomas.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en este checkpoint base.

## Casos de uso

- Fine-tuning supervisado para dominios específicos: al ser un modelo base de 32B con licencia Apache 2.0, es adecuado como punto de partida para SFT en sectores como legal, sanitario o financiero, partiendo de un conocimiento general sólido y una ventana de 65.536 tokens.
- Investigación en ciencia de modelos de lenguaje: AI2 publica checkpoints intermedios y detalles de entrenamiento, lo que permite estudiar dinámicas de entrenamiento, escalado y efectos de datos sin depender de modelos opacos.
- Evaluación comparativa de capacidades crudas: útil como referencia base en pipelines de evaluación (MMLU, BBH, HumanEval) para medir el impacto de técnicas posteriores como DPO o RLVR.
- Generación de código asistida en pipelines internos: con un HumanEval de 66,5 y MBPP de 60,2, puede integrarse como modelo de autocompletado o generación de funciones en herramientas internas, especialmente tras un fine-tuning específico del dominio.
- Procesamiento de documentos largos: la ventana de 65.536 tokens permite resumir, extraer información o responder preguntas sobre contratos, informes técnicos o artículos científicos en una sola pasada.
- Base para experimentos de alineación y RLHF: al existir variantes SFT, DPO y RLVR publicadas por AI2, este checkpoint permite reproducir y comparar cada etapa del pipeline de alineación.
- Educación e investigación académica: su licencia permisiva y su naturaleza abierta lo hacen apto para cursos, tesis y proyectos universitarios que requieran inspeccionar pesos y comportamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Benchmark | Resultado |
|---|---|
| Olmo 3-Eval Math | 61,6 |
| BigCodeBench | 43,9 |
| HumanEval | 66,5 |
| DeepSeek LeetCode | 1,9 |
| DS 1000 | 29,7 |
| MBPP | 60,2 |
| MultiPL HumanEval | 35,9 |
| MultiPL MBPP | 41,8 |
| Olmo 3-Eval Code | 40,0 |
| ARC MC | 94,7 |
| MMLU STEM | 70,8 |
| MedMCQA MC | 57,6 |
| MedQA MC | 53,8 |
| SciQ MC | 95,5 |
| Olmo 3-Eval MC_STEM | 74,5 |
| MMLU Humanities | 78,3 |
| MMLU Social Sci. | 83,9 |
| MMLU Other | 75,1 |
| CSQA MC | 82,3 |
| PIQA MC | 85,6 |
| SocialIQA MC | 83,9 |
| CoQA Gen2MC MC | 96,4 |
| DROP Gen2MC MC | 87,2 |
| Jeopardy Gen2MC MC | 92,3 |
| NaturalQs Gen2MC MC | 78,0 |
| SQuAD Gen2MC MC | 98,2 |
| Olmo 3-Eval MC_Non-STEM | 85,6 |
| HellaSwag RC | 84,8 |
| Winogrande RC | 90,3 |
| Lambada | 75,7 |
| Basic Skills | 93,5 |
| DROP | 81,0 |
| Jeopardy | 75,3 |
| NaturalQs | 48,7 |
| SQuAD | 94,5 |
| CoQA | 74,1 |
| Olmo 3-Eval GenQA | 79,8 |
| BBH | 77,6 |
| MMLU Pro MC | 49,6 |
| Deepmind Math | 30,1 |
| LBPP | 21,7 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 64 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 80 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 32-36 GB; en 4 bits, alrededor de 18-20 GB (estimaciones orientativas, no declaradas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU para BF16 con contexto completo de 65.536 tokens.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16; podría caber en cuantización de 4 bits, aunque con degradación de calidad y limitaciones de contexto.
- Opciones de despliegue: transformers (versión 4.57.0 o superior, según la model card). No se declara soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información proporcionada; al ser un modelo estándar de transformers, es probable que herramientas compatibles puedan adaptarse, pero no está confirmado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Olmo 3 32B (este) | 32B | 65.536 | Apache 2.0 | Pesos abiertos en HF |
| Olmo 3 7B | 7B | 65.536 | Apache 2.0 | Pesos abiertos en HF |
| Alternativas de ~30B de otros proveedores | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos comparables de otros proveedores, por lo que no es posible establecer una comparación cuantitativa rigurosa. La comparación más directa disponible es con el propio Olmo 3 7B, que comparte familia, licencia y dataset de entrenamiento, pero con menor tamaño y capacidad.

## Limitaciones y advertencias

- Es un modelo base, no ajustado con instrucciones: no está diseñado para seguir instrucciones de forma fiable ni para uso conversacional directo sin fine-tuning o prompting adecuado.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de conocimiento factual (NaturalQs GenQA de 48,7 y MMLU Pro de 49,6 sugieren margen de mejora en conocimiento y razonamiento complejo).
- Sesgos: no se documentan en la información proporcionada análisis específicos de sesgos; el dataset Dolma 3 puede contener sesgos presentes en datos web.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, conviene revisar las condiciones del dataset Dolma 3 si se redistribuyen derivados.
- Rendimiento en código avanzado limitado: DeepSeek LeetCode de 1,9 y DS 1000 de 29,7 indican dificultades en problemas de programación complejos.
- Sin soporte declarado de tool calling, agentes, visión o audio.
- El repositorio es un espejo de terceros (`moltherm1`), no el oficial de AI2; para producción se recomienda usar el repositorio original `allenai/Olmo-3-1125-32B`.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/moltherm1/olmo-mirror-olmo-3-1125-32b
- Repositorio oficial del modelo base: https://huggingface.co/allenai/Olmo-3-1125-32B
- Modelo Olmo 3 7B: https://huggingface.co/allenai/Olmo-3-1025-7B
- Variante Think 32B SFT: https://huggingface.co/allenai/Olmo-3-32B-Think-SFT
- Variante Think 32B DPO: https://huggingface.co/allenai/Olmo-3-32B-Think-DPO
- Variante Think 32B final (RLVR): https://huggingface.co/allenai/Olmo-3-32B-Think
- Dataset Dolma 3: https://huggingface.co/datasets/allenai/dolma3_mix-5.5T-1125
