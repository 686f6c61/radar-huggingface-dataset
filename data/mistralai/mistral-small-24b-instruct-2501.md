# mistralai/Mistral-Small-24B-Instruct-2501

## Resumen

Mistral Small 3 (2501) es un modelo de lenguaje de 23.572.403.200 parámetros desarrollado por Mistral AI, publicado el 28 de enero de 2025 bajo licencia Apache 2.0. Se trata de un ajuste por instrucciones del modelo base Mistral-Small-24B-Base-2501, orientado a la categoría de modelos "pequeños" por debajo de 70B parámetros. La model card lo sitúa como un modelo denso en conocimiento, con capacidades comparables a modelos más grandes y una ventana de contexto de 32.000 tokens.

El modelo está pensado para despliegue local y entornos con requisitos de privacidad: según Mistral AI, una vez cuantizado cabe en una única RTX 4090 o en un MacBook con 32 GB de RAM. Sus puntos fuertes declarados son la baja latencia en function calling, el soporte nativo de salida JSON, el cumplimiento de system prompts y el multilingüismo. Es relevante para desarrolladores que necesitan un modelo abierto, comercializable y con capacidades agénticas sin depender de APIs externas.

La información disponible no detalla la arquitectura interna más allá de su tamaño y tokenizador Tekken de 131.000 tokens de vocabulario. No se especifican número de capas, tipo de atención ni si emplea mezcla de expertos, por lo que estos datos deben considerarse no disponibles en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la model card (modelo de lenguaje de la familia Mistral Small; no se detalla transformer, MoE o SSM) |
| Parámetros totales | 23.572.403.200 (23,57B) |
| Parámetros activos | no aplica (no se reportan; la model card no indica que sea MoE) |
| Longitud de contexto | 32.000 tokens (32k) |
| Tipos de cuantización | no disponible (pesos oficiales en safetensors; la model card menciona despliegue cuantizado sin detallar formatos) |
| Idiomas soportados | inglés, francés, alemán, español, italiano, portugués, chino, japonés, ruso y coreano (etiquetas oficiales); la model card menciona además neerlandés, polaco y "docenas de idiomas" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que Mistral-Small-24B-Instruct-2501 es un ajuste por instrucciones del modelo base Mistral-Small-24B-Base-2501. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas concretas como atención lineal o decodificación especulativa. Tampoco se confirma explícitamente si la arquitectura es transformer decoder-only, aunque es el formato habitual de la familia Mistral Small.

Los datos técnicos confirmados incluyen una ventana de contexto de 32.000 tokens, un tokenizador Tekken con 131.000 tokens de vocabulario y un entrenamiento orientado a instrucciones con soporte fuerte de system prompts. La model card recomienda usar `temperature=0.15` en vLLM y añadir un system prompt para adaptar el comportamiento del modelo. No se especifican detalles sobre el proceso de alineación o las fases de entrenamiento posteriores al preentrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional: la model card reporta MT-Bench 8,35 y Arena-Hard 0,873 en evaluaciones internas.
- Codificación y matemáticas: HumanEval pass@1 de 0,848 y MATH de 0,706 en la evaluación interna de Mistral AI.
- Multilingüismo: etiquetas oficiales para inglés, francés, alemán, español, italiano, portugués, chino, japonés, ruso y coreano; la model card menciona además neerlandés, polaco y "docenas de idiomas".
- Tool calling y function calling nativo, con salida JSON, orientado a agentes y pipelines de automatización.
- Capacidades agénticas: la model card describe "best-in-class agentic capabilities" y soporte de razonamiento multi-paso a través de llamadas a funciones.
- Cumplimiento de system prompts: la model card destaca una fuerte adherencia a instrucciones de sistema.
- Contexto de 32.000 tokens para conversaciones multi-turno, documentos largos y recuperación aumentada.
- Tokenizador Tekken de 131.000 tokens de vocabulario.
- No se mencionan capacidades de visión, audio ni un modo "thinking" explícito en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con hasta 32.000 tokens de contexto, mantener un system prompt de marca y responder en varios idiomas. Su baja latencia declarada para function calling permite integrarlo en chats de soporte con consultas a sistemas internos.
- Function calling en producción: con salida JSON nativa y soporte de vLLM, puede actuar como motor de enrutamiento de llamadas a APIs, extracción de parámetros y ejecución de acciones en flujos de negocio.
- Asistente de código en pipelines de CI/CD: HumanEval pass@1 de 0,848 lo hace adecuado para generación y revisión de código, especialmente si se combina con tool calling para consultar documentación, ejecutar tests o abrir incidencias.
- RAG sobre documentación extensa: la ventana de 32.000 tokens permite incluir manuales, contratos o bases de conocimiento amplias en el contexto, con salida JSON para citar fuentes y estructurar respuestas.
- Extracción de datos estructurados: su soporte de JSON output y su rendimiento en IFEval (0,829) lo hacen útil para convertir correos, informes o tickets en campos estructurados listos para bases de datos.
- Despliegue local para datos sensibles: al poder cuantizarse para una RTX 4090 o un MacBook de 32 GB, encaja en organizaciones que no pueden enviar datos a APIs externas y necesitan inferencia en local.
- Fine-tuning de experto de dominio: al ser un modelo de 24B con licencia Apache 2.0 y un base model disponible, puede ajustarse para sectores regulados como legal, sanitario o financiero sin depender de un proveedor cerrado.
- Prototipado multilingüe: sus diez idiomas etiquetados y su contexto de 32k permiten construir asistentes y evaluaciones en varios mercados con un único modelo.

## Benchmarks y rendimiento

**Benchmarks públicos**

| Evaluación | Mistral Small 24B Instruct 2501 | Gemma-2-27B | Qwen2.5-32B | Llama-3.3-70B | GPT-4o-mini (2024-07-18) |
|---|---:|---:|---:|---:|---:|
| MMLU Pro (5-shot CoT, instruct) | 0,663 | 0,536 | 0,683 | 0,666 | 0,617 |
| GPQA Main (CoT, 5-shot, instruct) | 0,453 | 0,344 | 0,404 | 0,531 | 0,377 |
| HumanEval (instruct, pass@1) | 0,848 | 0,732 | 0,909 | 0,854 | 0,890 |
| MATH (instruct) | 0,706 | 0,535 | 0,819 | 0,743 | 0,761 |
| MT-Bench (dev) | 8,35 | 7,86 | 8,26 | 7,96 | 8,33 |
| WildBench | 52,27 | 48,21 | 52,73 | 50,04 | 56,13 |
| Arena-Hard | 0,873 | 0,788 | 0,860 | 0,840 | 0,897 |
| IFEval | 0,829 | 0,8065 | 0,8401 | 0,8835 | 0,8499 |

**Evaluación humana a ciegas**

| Categoría | vs Gemma-2-27B | vs Qwen2.5-32B | vs Llama-3.3-70B | vs GPT-4o-mini |
|---|---:|---:|---:|---:|
| Mistral es mejor | 0,536 | 0,496 | 0,192 | 0,200 |
| Mistral es ligeramente mejor | 0,196 | 0,184 | 0,164 | 0,204 |
| Empate | 0,052 | 0,060 | 0,236 | 0,160 |
| El otro es ligeramente mejor | 0,060 | 0,088 | 0,112 | 0,124 |
| El otro es mejor | 0,156 | 0,172 | 0,296 | 0,312 |

La evaluación humana se realizó con un proveedor externo sobre más de 1.000 prompts propietarios de código y generalistas, según la model card. Las evaluaciones con juez (WildBench, Arena-Hard y MT-Bench) utilizaron GPT-4o-2024-05-13 como juez.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 47,1 GB solo para los pesos (23,57B × 2 bytes), más caché KV y overhead. Requiere A100 80 GB, H100 80 GB o una configuración multi-GPU.
- Pesos en FP8/INT8: aproximadamente 23,6 GB de pesos. Es un tamaño muy justo para una RTX 4090 de 24 GB; puede requerir reducir el contexto, usar offloading o emplear una GPU de 40-80 GB.
- Pesos en INT4: aproximadamente 11,8 GB de pesos. Cabe en una RTX 4090, RTX 3090 o en un MacBook con 32 GB de RAM unificada, tal como indica la model card para despliegue cuantizado.
- GPU recomendadas: A100 80 GB y H100 para BF16; RTX 4090 o RTX 3090 para cuantización INT4; MacBook con 32 GB de RAM para inferencia local cuantizada.
- Despliegue oficial: vLLM es la opción recomendada por Mistral AI; también se documenta soporte con transformers.
- Despliegue no oficial: llama.cpp u Ollama requerirían cuantizaciones GGUF de la comunidad, no verificadas en la model card.
- Latencia y throughput: no se publican cifras concretas. La model card destaca baja latencia para function calling y agentes conversacionales, pero sin números de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento clave |
|---|---:|---|---|---|---|
| Mistral Small 24B Instruct 2501 | 23,57B | 32k | Apache 2.0 | Hugging Face, pesos safetensors | MMLU Pro 0,663; HumanEval 0,848; MT-Bench 8,35 |
| Gemma-2-27B | 27B | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | MMLU Pro 0,536; HumanEval 0,732; MT-Bench 7,86 |
| Qwen2.5-32B | 32B | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | MMLU Pro 0,683; HumanEval 0,909; MT-Bench 8,26 |
| Llama-3.3-70B | 70B | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | MMLU Pro 0,666; HumanEval 0,854; MT-Bench 7,96 |

Los datos de contexto, licencia y disponibilidad de los modelos comparables no se incluyen en la información proporcionada. La comparación se limita a los parámetros y a los resultados de benchmarks publicados en la model card de Mistral Small 3.

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la model card. Como todo LLM entrenado con datos a gran escala, puede reproducir sesgos presentes en sus datos de entrenamiento.
- No se publican métricas de alucinación. Aplica el riesgo habitual de generación de información incorrecta, especialmente en dominios especializados.
- La ventana de contexto es de 32.000 tokens. No se documenta el rendimiento del modelo en contextos cercanos al límite ni la degradación por posición.
- Los idiomas etiquetados oficialmente son diez. La model card menciona "docenas de idiomas", pero no se aportan evaluaciones por idioma que garanticen una calidad homogénea.
- La licencia Apache 2.0 permite uso comercial y modificación. No obstante, el repositorio incluye metadatos de acceso condicionado y una política de privacidad de Mistral AI; conviene revisar las condiciones de uso en Hugging Face antes de un despliegue comercial.
- No se detallan los datos de entrenamiento ni se aportan análisis de contaminación de benchmarks. Los resultados deben validarse en el dominio de aplicación.
- No se especifican formatos oficiales de cuantización. Las cuantizaciones de la comunidad pueden degradar el rendimiento y deben evaluarse antes de producción.
- No se mencionan capacidades multimodales ni modo de razonamiento explícito. No debe asumirse visión, audio o "thinking mode".

## Enlaces

- Hugging Face: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Base-2501
- Blog de Mistral Small 3: https://mistral.ai/news/mistral-small-3/
- Repositorio mistral-common: https://github.com/mistralai/mistral-common
- vLLM: https://github.com/vllm-project/vllm
- Transformers: https://github.com/huggingface/transformers
- Sitio oficial de Mistral AI: https://mistral.ai/
- Wikipedia de Mistral AI: https://fr.wikipedia.org/wiki/Mistral_AI
