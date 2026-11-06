# mdcreativeagent/WizardLM-33B-V1.0-Uncensored

## Resumen

WizardLM-33B-V1.0-Uncensored es un modelo de lenguaje de gran escala derivado de LLaMA-33B, publicado originalmente por Eric Hartford (cognitivecomputations) y reempaquetado en este repositorio por el usuario mdcreativeagent. Se trata de un reentrenamiento de WizardLM-30B-V1.0 sobre el dataset filtrado `WizardLM_evol_instruct_V2_196k_unfiltered_merged_split`, con el objetivo explícito de reducir rechazos, evasivas y sesgos en las respuestas del modelo. La arquitectura es un transformer decoder-only denso de 33.000 millones de parámetros, sin mezcla de expertos, con un contexto de 2.048 tokens.

El modelo resuelve el problema de los asistentes excesivamente restrictivos: al eliminar la capa de alineamiento que provoca negativas sistemáticas, ofrece respuestas más directas y conformes a instrucciones complejas. Es relevante para investigadores que estudian el comportamiento de modelos sin guardarraíles, para tareas de generación creativa sin filtros y para experimentos de evaluación de sesgos, siempre asumiendo la responsabilidad total sobre el contenido generado.

Su entrenamiento sigue el formato de prompts de Vicuna-1.1 y emplea FastChat, lo que facilita su integración con ecosistemas existentes. No obstante, se trata de un modelo de 2023, superado en contexto, eficiencia y capacidades por arquitecturas posteriores, y su licencia derivada de LLaMA limita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de LLaMA-33B) |
| Parametros totales | 33.000 millones (aproximado, segun denominacion del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (heredada de LLaMA-1; no confirmada explicitamente en la informacion) |
| Tipos de cuantizacion | GGUF disponible via TheBloke (Q2_K a Q8_0, entre otras); pesos originales en fp16 |
| Idiomas soportados | ingles (en) |
| Licencia | other (derivada de LLaMA-1; restricciones de uso comercial) |
| Formato de pesos | safetensors/pytorch en el repo original; GGUF en repos de terceros |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con atención causal estándar, sin innovaciones arquitectónicas respecto a LLaMA-1: 33.000 millones de parámetros, 2.048 tokens de contexto y tokenizador SentencePiece. No emplea mezcla de expertos, atención lineal ni decodificación especulativa. El repositorio ocupa 65,1 GB, coherente con pesos en fp16.

El entrenamiento parte de WizardLM-30B-V1.0 y se reentrena con el dataset `ehartford/WizardLM_evol_instruct_V2_196k_unfiltered_merged_split`, una versión filtrada de las instrucciones evolucionadas de WizardLM en formato ShareGPT. Se usó FastChat (estilo Vicuna-1.1) para el ajuste supervisado, ya que el equipo de WizardLM no especificó método para el nuevo formato de datos. No se documenta RLHF ni DPO en la información disponible. El objetivo del filtrado es reducir negativas y sesgos, aunque el autor advierte que LLaMA conserva "opiniones inherentes" y resistirá instrucciones con las que no esté de acuerdo.

## Capacidades

- Generación de texto en inglés con instrucciones multi-turno en formato Vicuna-1.1.
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple (ARC, HellaSwag, MMLU, Winogrande).
- Generación creativa y escritura sin filtros de contenido, incluyendo temas que modelos alineados rechazarían.
- Capacidad limitada de razonamiento matemático (GSM8K 18,65 %), insuficiente para tareas aritméticas fiables.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes multi-paso ni modo de razonamiento explícito (thinking mode).
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüe limitado: entrenado y evaluado únicamente en inglés.

## Casos de uso

- Investigación sobre alineamiento y sesgos: el modelo sirve como referencia "sin guardarraíles" para comparar cómo cambia el comportamiento respecto a versiones alineadas de LLaMA, midiendo tasas de rechazo y conformidad.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles sin negativas sistemáticas, adecuado para autores que necesitan borradores directos.
- Evaluación de robustez de filtros de contenido: desplegar el modelo para generar respuestas que permitan probar clasificadores de seguridad y sistemas de moderación en producción.
- Destilación de datos: generar pares instrucción-respuesta diversos para entrenar modelos más pequeños, aprovechando la conformidad del modelo ante instrucciones variadas.
- Análisis de formato de prompts: estudiar el comportamiento del formato Vicuna-1.1 en modelos de 33B y comparar con otros formatos (Alpaca, ChatML) en tareas de seguimiento de instrucciones.
- Despliegue local en hardware de consumo: mediante cuantización GGUF Q4_K_M (aproximadamente 20 GB), puede ejecutarse en una RTX 3090/4090 de 24 GB con llama.cpp u Ollama para experimentación offline.
- Réplica de experimentos académicos: reproducir los resultados del Open LLM Leaderboard de 2023 sobre un modelo de 33B sin alineamiento, útil en estudios comparativos de la época.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (Open LLM Leaderboard, no verificados):

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| AI2 Reasoning Challenge | 25-shot | acc_norm | 63,65 |
| HellaSwag | 10-shot | acc_norm | 83,84 |
| MMLU | 5-shot | acc | 59,36 |
| TruthfulQA | 0-shot | mc2 | 56,80 |
| Winogrande | 5-shot | acc | 77,66 |
| GSM8K | 5-shot | acc | 18,65 |
| DROP | 3-shot | — | 20,89 |
| Promedio (6 tareas) | — | — | 59,99 |

## Requisitos de hardware

- VRAM para fp16: aproximadamente 66 GB; requiere 2× A100 40 GB, 2× H100 40 GB o una A100/H100 de 80 GB.
- VRAM con cuantización GGUF Q4_K_M: aproximadamente 20-21 GB; cabe en una RTX 3090 o RTX 4090 de 24 GB.
- VRAM con Q8_0: aproximadamente 35 GB; requiere A100 40 GB o 2× RTX 4090.
- Consumer GPU: viable en RTX 3090/4090 con Q4_K_M o inferiores; no cabe en GPUs de 16 GB o menos sin descarga a CPU.
- Despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para pesos fp16 en servidor; FastChat para el formato de prompt original.
- Throughput y latencia: no disponibles en la información proporcionada; en una RTX 4090 con Q4_K_M se espera un rendimiento del orden de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (5-shot) | GSM8K (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WizardLM-33B-V1.0-Uncensored | 33B | 2.048 | 59,36 | 18,65 | other (LLaMA-1) | HF (original y este repo) |
| WizardLM-30B-V1.0 | 30B | 2.048 | no disponible en la información | no disponible | other (LLaMA-1) | HF |
| LLaMA-33B | 33B | 2.048 | no disponible en la información | no disponible | other (LLaMA-1) | no público originalmente |
| Vicuna-33B-v1.3 | 33B | 2.048 | no disponible en la información | no disponible | other (LLaMA-1) | HF |

La comparación cuantitativa con alternativas no puede completarse porque la información proporcionada no incluye sus resultados de benchmarks. Cabe señalar que WizardLM-33B-V1.0-Uncensored se sitúa en la gama de 33B de la generación LLaMA-1, con contexto de 2.048 tokens, muy por debajo de los 8K-128K de modelos posteriores.

## Limitaciones y advertencias

- Modelo sin guardarraíles: puede generar contenido ofensivo, peligroso o ilegal; el autor responsabiliza al usuario de todo lo publicado.
- Sesgos heredados de LLaMA-1 y del dataset de instrucciones; el filtrado reduce negativas pero no elimina sesgos de género, raza o ideología.
- Riesgo elevado de alucinación, especialmente en datos factuales y matemáticas (GSM8K 18,65 %).
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés; no se garantiza calidad en otros idiomas.
- Licencia derivada de LLaMA-1 con restricciones de uso comercial; revisar los términos antes de cualquier despliegue productivo.
- Modelo de 2023, superado en capacidades y eficiencia por arquitecturas posteriores; no recomendado para nuevos proyectos en producción.
- El repositorio de mdcreativeagent tiene 0 descargas y 0 likes, y fue creado en 2026; se trata de una réplica del modelo original de cognitivecomputations, sin garantías de integridad por parte de este reempaquetado.
- Formato de prompt específico (Vicuna-1.1); usarlo con otro formato degrada el rendimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mdcreativeagent/WizardLM-33B-V1.0-Uncensored
- Modelo original de Eric Hartford: https://huggingface.co/cognitivecomputations/WizardLM-33B-V1.0-Uncensored
- Versión GGUF de TheBloke: https://huggingface.co/TheBloke/WizardLM-33B-V1.0-Uncensored-GGUF
- Hilo en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/14hy369/wizardlm33bv10uncensored/
- Dataset de entrenamiento: https://huggingface.co/datasets/ehartford/WizardLM_evol_instruct_V2_196k_unfiltered_merged_split
- Resultados detallados del Open LLM Leaderboard: https://huggingface.co/datasets/open-llm-leaderboard/details_ehartford__WizardLM-33B-V1.0-Uncensored
- Modelo base WizardLM-30B-V1.0: https://huggingface.co/WizardLM/WizardLM-30B-V1.0
