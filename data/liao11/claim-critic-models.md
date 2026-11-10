# liao11/claim-critic-models

## Resumen

`liao11/claim-critic-models` es una colección de adaptadores LoRA publicados por el usuario liao11 (autor del repositorio GitHub `liaomingyue/claim-critic`) que implementan un pipeline extremo a extremo para reducir alucinaciones en sistemas RAG (Retrieval-Augmented Generation). No se trata de un modelo único, sino de un conjunto de adaptadores organizados en cuatro paquetes (`critic.tar`, `rag.tar`, `gen.tar`, `rm.tar`) que cubren críticos de alucinación a nivel de frase, políticas RAG entrenadas con GRPO usando el crítico como recompensa, generadores de errores y modelos de puntuación auxiliares.

La propuesta técnica se apoya en una detección por frase (sentence-level critics) combinada con aprendizaje por refuerzo (GRPO) y un bucle de cierre de puntos ciegos en dos rondas. Los adaptadores se montan sobre dos bases distintas: `openbmb/MiniCPM5-2B` (para la mayoría de los componentes) y `Qwen/Qwen3.5-9B` (exclusivamente para el crítico "gold" de 9B, que según la model card se usa solo para evaluación).

El interés del release es metodológico más que de rendimiento bruto: ofrece pesos reproducibles, `training.json` por modelo con datos y configuración, y comandos de reentrenamiento. Es un recurso útil para investigadores que trabajen en mitigación de alucinaciones en RAG, reward modeling y RL aplicado a generación aumentada por recuperación. El número de descargas es 0 y la licencia es "other", heredada de las bases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformers; base MiniCPM5-2B y Qwen3.5-9B |
| Parametros totales | No disponible (adaptadores LoRA; no se especifica rango ni número de parámetros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la base: MiniCPM5-2B y Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible (los adaptadores se publican como LoRA; la cuantización depende de la base) |
| Idiomas soportados | No disponible |
| Licencia | other (los LoRA heredan la licencia de cada base) |
| Formato de pesos | LoRA adapters empaquetados en `.tar` (`critic.tar`, `rag.tar`, `gen.tar`, `rm.tar`) |
| Modelo base | openbmb/MiniCPM5-2B (commit f974000) y Qwen/Qwen3.5-9B (solo crítico gold) |
| Libreria | peft |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

El release no entrena un transformer desde cero, sino que publica adaptadores LoRA sobre dos bases. La mayor parte de los componentes se monta sobre `openbmb/MiniCPM5-2B` (commit `f974000`), un modelo de 2B parámetros; el crítico "gold" de 9B se monta sobre `Qwen/Qwen3.5-9B` y, según la model card, se reserva para evaluación. La arquitectura subyacente es la de cada base (transformer decoder-only); los LoRA añaden capacidad específica para tareas de crítica, recompensa y política RAG.

El entrenamiento combina SFT y GRPO. Los paquetes incluyen: críticos de alucinación por frase en varias generaciones (incluyendo una versión con dos rondas de cierre de puntos ciegos y grupos de control), políticas RAG (SFT, GRPO segmentado por tramos, bucle cerrado en primera y segunda ronda, y controles), generadores de errores (SFT, SFT con muestras difíciles y GRPO) y modelos de puntuación adicionales (severidad, naturalidad RM2, satisfacción y rechazo). Cada directorio incluye `README.md` y `training.json` con los ficheros de datos, número de ejemplos, configuración, punto de partida y comando de reentrenamiento. No se detallan en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo DPO.

## Capacidades

- Crítica de alucinaciones a nivel de frase: detección de afirmaciones no soportadas por el contexto recuperado en un pipeline RAG.
- Modelo de recompensa (reward model) para GRPO: el crítico actúa como señal de recompensa en el entrenamiento de políticas RAG.
- Política RAG entrenada: generación aumentada por recuperación con comportamiento ajustado para reducir alucinaciones.
- Generación de errores controlada: generadores de errores (SFT, muestras difíciles, GRPO) para construir datos de entrenamiento y evaluación.
- Puntuación auxiliar: severidad del error, naturalidad (RM2), satisfacción y decisión de rechazo (abstención).
- Cierre de puntos ciegos en dos rondas: variante del crítico que itera para cubrir fallos no detectados en la primera pasada.
- Reproducibilidad: `training.json` por modelo con datos, configuración y comandos de reentrenamiento.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Auditoría de respuestas RAG en producción: desplegar el crítico de frases sobre las respuestas generadas para marcar afirmaciones no respaldadas por los documentos recuperados y activar revisión o regeneración.
- Entrenamiento de políticas RAG con RL: usar el crítico como reward model en GRPO para ajustar un generador que reduzca alucinaciones sin perder utilidad, siguiendo el pipeline publicado en el repositorio.
- Generación de datos sintéticos de alucinación: emplear los generadores de errores (`gen.tar`) para crear ejemplos etiquetados de fallos y ampliar datasets de entrenamiento o evaluación.
- Evaluación comparativa de sistemas RAG: usar el crítico gold de 9B (Qwen3.5-9B) como referencia de evaluación para medir la tasa de alucinación de distintos pipelines.
- Filtrado y abstención en asistentes documentales: combinar los modelos de rechazo y satisfacción (`rm.tar`) para decidir cuándo el sistema debe declinar responder en lugar de arriesgar una alucinación.
- Investigación en reward modeling: reutilizar los adaptadores como punto de partida para experimentos de RLHF/GRPO en tareas de veracidad y grounding.
- Construcción de pipelines de verificación por frases: integrar el crítico como módulo de post-procesado en arquitecturas de QA sobre corpus técnicos o legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, la base MiniCPM5-2B requiere aproximadamente 4-5 GB en FP16 y 2-3 GB en cuantización de 4 bits; el crítico gold sobre Qwen3.5-9B requiere del orden de 18-20 GB en FP16 y 6-8 GB en 4 bits (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: no especificadas por el autor. Para la base de 2B basta una GPU consumer moderna; para el crítico de 9B se recomienda una GPU con al menos 24 GB (RTX 3090/4090, A10, L4) o A100/H100 para lotes grandes.
- Cabe en GPU consumer: sí para los adaptadores sobre MiniCPM5-2B; el crítico de 9B cabe en GPUs de 24 GB con cuantización.
- Opciones de despliegue: al ser adaptadores PEFT, se cargan con `peft` + `transformers`; el despliegue con vLLM, TGI o llama.cpp requiere fusionar el LoRA con la base o usar soporte de adaptadores multi-LoRA (vLLM). No se documentan configuraciones concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| claim-critic-models (este release) | LoRA sobre 2B y 9B | No disponible | Crítico de alucinaciones + RL para RAG | other | Hugging Face + GitHub |
| Qwen/Qwen3.5-9B (base del crítico gold) | 9B | No disponible | LLM generalista | Según Qwen | Hugging Face |
| openbmb/MiniCPM5-2B (base principal) | 2B | No disponible | LLM compacto | Según OpenBMB | Hugging Face |
| Otros críticos/reward models para RAG | No disponible | No disponible | Verificación de fidelidad | Variable | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other": los adaptadores heredan la licencia de cada base (MiniCPM5-2B y Qwen3.5-9B), por lo que el uso comercial queda condicionado a los términos de dichas bases, que deben revisarse por separado.
- No se publican pesos de las bases: solo se distribuyen los LoRA; es necesario descargar las bases por separado y respetar sus licencias.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe más allá del que ofrezcan las bases.
- Riesgo de alucinación residual: el propio crítico es un modelo y puede fallar; el pipeline de dos rondas mitiga pero no elimina los puntos ciegos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente a alternativas; la evaluación queda a cargo del usuario.
- Madurez temprana: 0 descargas y 1 like en el momento de la consulta; el proyecto depende del repositorio GitHub del autor para documentación y scripts.
- Dependencia de la recuperación: la calidad del crítico está ligada a la calidad del contexto recuperado; contextos pobres degradan la señal.
- Sin información sobre sesgos: no se documentan evaluaciones de sesgo, toxicidad ni robustez adversarial.

## Enlaces

- Hugging Face: https://huggingface.co/liao11/claim-critic-models
- Repositorio GitHub: https://github.com/liaomingyue/claim-critic
- Documentación de modelos del proyecto: https://github.com/liaomingyue/claim-critic/blob/main/docs/MODELS.md
- Base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
