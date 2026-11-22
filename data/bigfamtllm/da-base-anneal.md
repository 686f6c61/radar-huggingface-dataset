# BigFamTLLM/da-base-anneal

## Resumen

da-base-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base entrenado desde cero sobre 26.000 millones de tokens de texto danés con un tokenizador específico de 32.000 entradas, y posteriormente sometido a un proceso de annealing (recocido) de 916 pasos adicionales sobre texto noruego de alta calidad en bokmål y nynorsk. El resultado es un modelo de arquitectura Qwen3 con 36 capas, hidden size de 2176, 34 cabezas de atención (17 cabezas KV) y embeddings atados, con una ventana de contexto de 4096 tokens.

El modelo resuelve un problema concreto de investigación: evaluar si un modelo entrenado exclusivamente en danés puede adaptarse al noruego mediante un ajuste fino corto con decaimiento de learning rate a cero, sin haber visto nunca texto noruego durante el preentrenamiento. Forma parte de un experimento controlado de 50 modelos en el que se comparan modelos noruegos, daneses y multilingües, tanto en su versión original como en su versión annealed, con la misma arquitectura y presupuesto de cómputo.

Es relevante ahora porque documenta de forma transparente un caso de transferencia lingüística entre lenguas germánicas nórdicas estrechamente relacionadas (danés y noruego) y porque publica resultados en NorEval 1.1, un benchmark específico para noruego. No obstante, se trata de un modelo de investigación, no ajustado a instrucciones y no destinado a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parámetros totales | 2.115.305.088 (2,12B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | da, no, nb, nn (danés, noruego, bokmål, nynorsk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: 36 capas transformer, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (agrupación de consultas), embeddings atados entre entrada y salida, y una longitud de secuencia de entrenamiento de 4096 tokens. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia de Sigma2, con batch size de 128, optimizador AdamW, learning rate máximo de 5e-4, 2000 pasos de warmup y sin decaimiento (1e-4 en la etapa de solo embeddings).

Los datos provienen de HPLT 4.0. El modelo base da-base se entrenó desde cero sobre 26.000 millones de tokens de danés con un tokenizador danés de 32.000 entradas. La versión annealed añade 916 pasos (0,48B tokens) sobre texto de alta calidad en bokmål y nynorsk, con decaimiento lineal del learning rate hasta cero; la mezcla noruega empleada es 85% bokmål y 15% nynorsk. Durante el cambio de tokenizador, los tokens compartidos por ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. La conversión a formato Hugging Face se hizo con Megatron-Bridge y los configs se ajustaron para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en danés y noruego (bokmål y nynorsk) como modelo base, sin ajuste a instrucciones.
- Modelado de lenguaje causal puro: continuación de texto, predicción de siguiente token y tareas de compleción.
- Capacidad limitada de comprensión lectora y conocimiento del mundo en noruego, según los resultados de NorEval 1.1.
- Competencia ortográfica en bokmål relativamente alta (accuracy de 0,812 en 0-shot y 0,875 en 1-shot en nob_orthography).
- Capacidad de few-shot mediante prompting (mejora consistente de 0-shot a 1-shot en las tareas evaluadas).
- Robustez moderada ante ruido en la entrada: 0,350 en entrada limpia y -0,039 de media bajo ruido en tres tareas de NorEval.
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente, al no estar ajustado a instrucciones ni documentarse tales funciones.
- Capacidades multilingües limitadas a las lenguas nórdicas indicadas (da, no, nb, nn); no se documenta soporte de otras lenguas.

## Casos de uso

- Investigación sobre transferencia entre lenguas nórdicas: sirve como punto de comparación controlado para estudiar cuánto noruego aprende un modelo danés tras un annealing corto, gracias a que comparte arquitectura y presupuesto con los demás modelos del proyecto BigFamTLLM.
- Evaluación de tokenizadores: permite analizar el impacto de un tokenizador danés de 32.000 entradas sobre texto noruego, comparándolo con los modelos no-base y ml-base del mismo proyecto.
- Generación de texto en danés: adecuado para experimentos de continuación de texto y modelado de lenguaje en danés, ya que fue preentrenado con 26.000 millones de tokens en esa lengua.
- Análisis de competencia ortográfica en bokmål: útil para estudiar el rendimiento en tareas de ortografía y normalización, donde obtiene accuracy de 0,812–0,875 en NorEval.
- Estudio de robustez ante ruido: el modelo publica métricas de degradación bajo ruido (-0,039 de media), lo que lo hace útil para investigar la estabilidad de modelos pequeños ante entradas corruptas.
- Baseline en experimentos de ajuste fino: al ser un modelo base de 2,12B con contexto de 4096, puede emplearse como punto de partida para fine-tuning supervisado en tareas noruegas dentro de entornos de investigación.
- Reproducción de experimentos docentes: sirve como material de referencia para cursos y proyectos académicos sobre entrenamiento desde cero y adaptación lingüística con presupuesto limitado.

## Benchmarks y rendimiento

NorEval 1.1 (resultados publicados en la model card):

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,182 | 0,209 |
| nob_orthography | acc | 0,812 | 0,875 |
| nob_reading | f1 | 0,184 | 0,214 |
| nob_world | acc | 0,281 | 0,282 |
| nno_language | em_first | 0,285 | 0,366 |
| nno_world | acc | 0,277 | 0,280 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,350 en entrada limpia y -0,039 de media bajo ruido.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo para pesos (el repo ocupa 4,2 GB), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 6–8 GB de VRAM en bf16.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 2,1 GB; en 4 bits, alrededor de 1,1 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para mayor throughput, A100, H100 o GH200.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4–6 GB si se cuantiza.
- Opciones de despliegue: transformers (probado por el autor con `AutoModelForCausalLM` y `dtype=torch.bfloat16`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan oficialmente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Resultados NorEval |
|---|---|---|---|---|---|
| BigFamTLLM/da-base-anneal | 2,12B | 4.096 | da, no, nb, nn | no disponible | Publicados (ver tabla) |
| BigFamTLLM/da-base | 2,12B | 4.096 | da | no disponible | no disponible en esta ficha |
| BigFamTLLM/no-base-anneal | no disponible | 4.096 (según proyecto) | no, nb, nn | no disponible | no disponible en esta ficha |
| BigFamTLLM/ml-base-anneal | no disponible | 4.096 (según proyecto) | multilingüe | no disponible | no disponible en esta ficha |

Los tres modelos del proyecto comparten arquitectura y presupuesto de cómputo, lo que permite una comparación controlada entre entrenamiento nativo en noruego, entrenamiento en danés con annealing y entrenamiento multilingüe con annealing. No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no ajustado a instrucciones: no sigue instrucciones de forma fiable ni mantiene conversaciones multi-turno.
- El autor advierte explícitamente de que puede producir salidas incorrectas u ofensivas y que no está pensado para uso en producción.
- Riesgo de alucinación inherente a un modelo de lenguaje entrenado sobre texto web, sin RLHF ni DPO documentados.
- Ventana de contexto limitada a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida a danés y noruego (bokmål y nynorsk); no se documenta competencia en otras lenguas.
- El tokenizador es danés, lo que puede penalizar la eficiencia y el rendimiento sobre texto noruego en comparación con un tokenizador nativo.
- Los resultados en NorEval son modestos en conocimiento del mundo (0,277–0,282 de accuracy) y en lectura (F1 de 0,184–0,214), lo que limita su uso en tareas que requieran comprensión profunda.
- La licencia no está disponible, por lo que no puede confirmarse si se permite el uso comercial.
- El modelo se ha entrenado con solo 0,48B tokens de noruego, lo que supone una exposición muy limitada a esa lengua en comparación con los 26B tokens de danés.
- Proyecto académico de un curso universitario, sin mantenimiento ni soporte documentado más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-base-anneal
- Modelo base: https://huggingface.co/BigFamTLLM/da-base
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo noruego annealed: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Modelo multilingüe annealed: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Modelo danés solo embeddings: https://huggingface.co/BigFamTLLM/da-emb
- Modelo danés solo embeddings annealed: https://huggingface.co/BigFamTLLM/da-emb-anneal
- Modelo multilingüe solo embeddings: https://huggingface.co/BigFamTLLM/ml-emb
- Modelo multilingüe solo embeddings annealed: https://huggingface.co/BigFamTLLM/ml-emb-anneal
- Checkpoints CPT daneses (1 a 10): https://huggingface.co/BigFamTLLM/da-cpt1 hasta https://huggingface.co/BigFamTLLM/da-cpt10
- Checkpoints CPT daneses annealed (1 a 10): https://huggingface.co/BigFamTLLM/da-cpt1-anneal hasta https://huggingface.co/BigFamTLLM/da-cpt10-anneal
- Checkpoints CPT multilingües (1 a 10): https://huggingface.co/BigFamTLLM/ml-cpt1 hasta https://huggingface.co/BigFamTLLM/ml-cpt10
- Checkpoints CPT multilingües annealed (1 a 10): https://huggingface.co/BigFamTLLM/ml-cpt1-anneal hasta https://huggingface.co/BigFamTLLM/ml-cpt10-anneal
