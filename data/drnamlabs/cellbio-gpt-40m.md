# drnamlabs/cellbio-gpt-40m

## Resumen

cellbio-gpt-40m es un modelo de lenguaje de tipo GPT entrenado desde cero por Dr. Nam H. Le (drnamlabs) para el dominio de la biología celular y de tejidos. Se trata de un transformer denso de 10 capas y 512 dimensiones ocultas, con 8 cabezas de atención, RoPE, RMSNorm, SwiGLU y weight tying, que suma aproximadamente 40,5 millones de parámetros y emplea una ventana de contexto de 512 tokens con un vocabulario BPE de 16.384 entradas. La totalidad del pipeline (tokenizador, arquitectura, preentrenamiento, SFT, DPO y GRPO/RLVR) está implementada en PyTorch puro, sin HF Trainer ni nn.Transformer, y se ejecutó de extremo a extremo en una única GPU RTX 5090.

El modelo se presenta explícitamente como una release pedagógica y de portafolio: el objetivo declarado es demostrar un pipeline completo y honesto a pequeña escala, no alcanzar el estado del arte. Su interés práctico reside en dos frentes. Por un lado, sirve como referencia didáctica de un ciclo completo de entrenamiento (preentrenamiento, ajuste supervisado, preferencias y RL con recompensas verificables) reproducible en hardware de consumo. Por otro, incluye checkpoints especializados en el simulador de tejidos BETSE, donde el modelo aprende a predecir el potencial de membrana en mV a partir de tres ajustes de simulación, con recompensas derivadas de la ecuación de Nernst.

La relevancia actual del proyecto es metodológica: muestra cómo aplicar RLVR (reinforcement learning with verifiable rewards) sobre un dominio científico con un verificador determinista, y publica una evaluación comparativa contra modelos hospedados de gran tamaño y modelos abiertos ejecutados en Ollama, con conjuntos de examen sellados mediante hashes SHA-256 publicados antes de la evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (10 capas, 512 dim, 8 cabezas, RoPE, RMSNorm, SwiGLU, weight tying) |
| Parametros totales | ~40,5 M |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt); no se mencionan safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 10 capas con 512 dimensiones de modelo y 8 cabezas de atención, que incorpora embeddings rotatorios (RoPE), normalización RMSNorm, activación SwiGLU y atado de pesos entre la matriz de embedding y la cabeza de salida. El tokenizador BPE, con vocabulario de 16.384 tokens, también fue entrenado desde cero. El preentrenamiento (checkpoint `model_base.pt`) consumió 988,5 millones de tokens BPE correspondientes a 3.198.416 abstracts de biología celular y de tejidos de PubMed, obtenidos mediante NCBI E-utilities y segmentados por fecha; las 5 franjas temporales más recientes (9,2 millones de tokens) se reservaron como holdout temporal nunca visto en entrenamiento.

Sobre esa base se aplicó un pipeline de postentrenamiento en cascada. El SFT (`model_sft.pt`) usó 97,5k instrucciones minadas del propio corpus durante 2 épocas, sin intervención de ningún LLM externo. El DPO v2 (`model_dpo.pt`) se entrenó con beta=0,3 sobre rechazos on-policy y negativos duros. El GRPO (`model_grpo.pt`) empleó un verificador bioeléctrico basado en la ecuación de Nernst, con 300 pasos y coeficiente KL de 0,05. Finalmente, tres checkpoints adicionales (`model_sim_grid.pt`, `model_sim_mixed.pt`, `model_sim_random.pt`) se entrenaron contra el simulador BETSE mediante warm start más GRPO sobre 150 simulaciones, variando la disposición espacial y el formato de los ejemplos resueltos incluidos en el prompt.

## Capacidades

- Generación de texto en inglés sobre biología celular y de tejidos, con vocabulario y estilo propios de la literatura PubMed.
- Respuesta a preguntas de comprensión de abstracts biomédicos (evaluado en PubMedQA).
- Razonamiento numérico restringido al dominio bioeléctrico: predicción del potencial de membrana en mV a partir de concentración extracelular de K+, permeabilidad al K+ y permeabilidad al Na+.
- Ajuste por preferencias (DPO) y por recompensas verificables (GRPO/RLVR) integrados en el pipeline.
- Capacidad de actuar como agente sobre el simulador BETSE en los checkpoints de la etapa 8.
- No se documenta soporte de tool calling, function calling, agentes multi-paso generales, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Docencia de pipelines de entrenamiento LLM: el repositorio y los checkpoints permiten recorrer paso a paso preentrenamiento, SFT, DPO y GRPO en una sola GPU de consumo, con artefactos intermedios para cada etapa.
- Reproducción de RLVR en dominio científico: el verificador basado en la ecuación de Nernst sirve como plantilla para construir recompensas deterministas en otros dominios con leyes físicas conocidas.
- Predicción de potencial de membrana en simulación de tejidos: los checkpoints `model_sim_*` responden a los tres parámetros de BETSE y pueden usarse como aproximador rápido dentro de barridos de parámetros.
- Extracción y resumen de literatura biomédica acotada: con contexto de 512 tokens, es adecuado para tareas sobre abstracts individuales, como clasificación de relevancia o generación de resúmenes de una sola pieza.
- Clasificación de preguntas tipo PubMedQA: útil como baseline ligero en experimentos de QA biomédica donde el coste computacional es una restricción.
- Estudio de contaminación de benchmarks: el proyecto publica una auditoría de contaminación (59/1000 ítems de PubMedQA con PMID en el corpus) que puede reutilizarse como caso de análisis metodológico.
- Referencia para auditoría de evaluaciones con conjuntos sellados: el protocolo de examen C, con hashes SHA-256 publicados antes de la evaluación, es replicable en otros proyectos.

## Benchmarks y rendimiento

Resultados publicados por el autor (seed 42, mismos tres exámenes para todos los checkpoints):

| Modelo | Holdout ppl ↓ | PubMedQA acc (full) | PubMedQA acc (clean) | BETSE reward |
|---|---|---|---|---|
| base | 11,50 | 0,537 | 0,526 | 0,000 |
| SFT | 14,59 | 0,491 | 0,480 | 0,239 |
| DPO v2 | 14,59 | 0,496 | 0,486 | 0,238 |
| GRPO | 16,24 | 0,460 | 0,453 | 0,977 |

Referencias: PubMedQA por azar 0,333; clase mayoritaria ("yes") 0,552. BETSE es la recompensa media del verificador sobre 727 problemas de física de Nernst retenidos por combinación (numéricos en mV con tolerancias de ±2/±10/±25; categóricos exactos).

Exámenes del simulador (recompensa BETSE):

| Sistema | Examen A (98 problemas grid) | Examen B (234 problemas off-grid) |
|---|---|---|
| Predictor constante | 0,538 | 0,663 |
| Claude Sonnet 5.5 agente, zero-shot | 0,562 | 0,591 |
| Claude Sonnet 5.5 agente, cinco ejemplos | 0,955 | 0,808 |
| `model_sim_grid.pt` | 0,945 | 0,539 |
| `model_sim_mixed.pt`, cinco ejemplos | no medido | 0,835 |
| `model_sim_mixed.pt`, zero-shot | no medido | 0,666 |
| `model_sim_random.pt`, zero-shot | no medido | 0,772 |

Examen C (20 lotes sellados, 300 simulaciones, 1.146 problemas, hashes SHA-256 publicados previamente), recompensa media por lote:

| Sistema | Zero-shot | Cinco ejemplos |
|---|---|---|
| Claude Sonnet 5.5 (agente) | 0,602 | 0,852 |
| Claude Haiku 5.5 (agente) | 0,569 | 0,842 |
| `model_sim_random.pt` | 0,772 | no entrenado para ello |
| `model_sim_mixed.pt` | 0,678 | 0,807 |
| `model_sim_grid.pt` | 0,500 | no entrenado para ello |
| gpt-oss:20b (Ollama) | 0,511 | 0,616 |
| Qwen 3.5 (Ollama) | 0,465 | 0,784 |
| Qwen 3.6 (Ollama) | 0,429 | 0,759 |
| DeepSeek-R1 8B (Ollama) | 0,278 | 0,431 |
| Predictor constante | 0,708 | 0,708 |
| Vecino más cercano, sin modelo (diagnóstico) | n/a | 0,827 |

La comparación fijada de antemano ( `model_sim_mixed.pt` con cinco ejemplos frente al agente hospedado con cinco ejemplos) arroja una ventaja del agente de 0,045 (intervalo bootstrap del 95%: 0,025 a 0,065 sobre lotes; Wilcoxon p = 0,0014), ganando 17 de 20 lotes. Nota del autor: DeepSeek-R1 8B dispuso de 3.000 tokens y el 59% de sus respuestas zero-shot (679 de 1.146) quedaron truncadas antes de la línea final, por lo que su fila mide en parte el presupuesto de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los ~40,5 M de parámetros; el repositorio ocupa 1,1 GB porque contiene siete checkpoints.
- GPU recomendadas: cualquier GPU consumer moderna basta; el entrenamiento se realizó en una única RTX 5090.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el autor no documenta integraciones con vLLM, llama.cpp, Ollama o TGI; los pesos son `.pt` de PyTorch y requieren cargar la implementación propia del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cellbio-gpt-40m | ~40,5 M | 512 | Biología celular / bioelectricidad | MIT | HuggingFace + GitHub |
| gpt-oss:20b | 20 B | no disponible en la ficha | Generalista | no disponible en la ficha | Ollama |
| Qwen 3.5 | no disponible en la ficha | no disponible en la ficha | Generalista | no disponible en la ficha | Ollama |
| DeepSeek-R1 8B | 8 B | no disponible en la ficha | Razonamiento generalista | no disponible en la ficha | Ollama |

La comparación relevante es de comportamiento, no de escala: en el examen C zero-shot, `model_sim_random.pt` (0,772) supera a gpt-oss:20b (0,511), Qwen 3.5 (0,465), Qwen 3.6 (0,429) y DeepSeek-R1 8B (0,278) pese a tener tres órdenes de magnitud menos parámetros, aunque queda por debajo del predictor constante (0,708) solo en el caso de `model_sim_grid.pt` (0,500). Con cinco ejemplos en el prompt, los modelos generalistas grandes recuperan terreno (Qwen 3.5: 0,784; Claude Sonnet 5.5: 0,852).

## Limitaciones y advertencias

- Modelo declarado como pedagógico y de portafolio; el propio autor indica que no busca estado del arte.
- Contexto de solo 512 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo inglés; no hay soporte multilingüe.
- El preentrenamiento se limita a abstracts de PubMed, lo que restringe el conocimiento general y aumenta el riesgo de respuestas incoherentes fuera del dominio.
- El SFT degrada la perplejidad en holdout (de 11,50 a 14,59) y reduce la precisión en PubMedQA (de 0,537 a 0,460 tras GRPO); el ajuste por recompensas mejora BETSE a costa de las métricas de lenguaje.
- `model_sim_grid.pt` cae por debajo del predictor constante en el examen B (0,539 frente a 0,663): aprendió una tabla de búsqueda y no generaliza fuera de la rejilla de entrenamiento.
- Contaminación conocida: 59 de 1.000 ítems de PubMedQA (5,9%) tienen su PMID en el corpus de preentrenamiento; deben usarse las cifras de la columna "clean".
- El autor advierte que el uso de herramientas por parte de los agentes hospedados se verificó solo mediante sus propios informes, y que las comparaciones distintas de la preinscrita son descriptivas.
- No se documentan sesgos específicos más allá de los inherentes al corpus PubMed; riesgo de alucinación alto fuera del dominio bioeléctrico.
- Licencia MIT: permite uso comercial, pero sin garantías del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drnamlabs/cellbio-gpt-40m
- Repositorio GitHub: https://github.com/drnamlabs-gif/cellbio-gpt
- Sitio del autor: https://drnamlabs.com
- Simulador BETSE: no disponible en la información proporcionada
- Dataset con respuestas y puntuaciones por pregunta: referenciado en la model card como "dataset repo", sin URL explícita en la información proporcionada
