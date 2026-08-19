# Minbyul/AgentMercury-Qwen3.5-4B

## Resumen

AgentMercury-Qwen3.5-4B es un checkpoint post-entrenado por Minbyul sobre el modelo base Qwen3.5-4B de Alibaba, un modelo denso multimodal (texto e imagen) de aproximadamente 4,66 mil millones de parámetros. El post-entrenamiento utiliza aprendizaje por refuerzo agéntico (agentic reinforcement learning) con el algoritmo GRPO (Group Relative Policy Optimization) en entornos de uso de herramientas basados en el protocolo MCP (Model-Context-Protocol). El objetivo de la recompensa no es simplemente generar texto correcto, sino completar tareas agénticas multi-turno reales, verificando tanto la corrección de las llamadas a herramientas como el estado final del entorno o base de datos.

El checkpoint se publica como el "clean-minimum" del entrenamiento: el punto en el que la recompensa alcanza su máximo mientras la tasa de generación degenerada y la tasa de truncamiento son exactamente cero, antes de que pasos posteriores regresen a verbosidad o reward-hacking. Según los benchmarks reportados, el modelo mejora al base en tareas agénticas (BFCL, τ-bench), matemáticas de competición (AIME, HMMT), código (LiveCodeBench, SciCode) y escritura (WritingBench). Está licenciado bajo Apache-2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (dense, multimodal, `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (evaluado con sglang; el base Qwen3.5-4B soporta 262.144 tokens nativos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer denso multimodal con fusión temprana de tokens de visión y texto, diseñado para razonamiento, codificación, agentes y comprensión visual. Sobre esta base, AgentMercury se post-entrena con RL agéntico on-policy usando GRPO durante 200 pasos, con despliegue de rollouts mediante sglang en 8×A100. La recompensa se calcula con verificadores de estado final del entorno en tareas agénticas reales, penalizando la degeneración (repetición) y el truncamiento de contexto. El conjunto de entrenamiento incluye aproximadamente 2.300 entornos agénticos que cubren el 63% de las industrias y el 76% de las herramientas del corpus fuente.

El entrenamiento se detiene en el punto de recompensa máxima con tasa de degeneración y truncamiento cero, ya que continuar el RL más allá de este punto incrementaba la longitud de respuesta y reintroducía degeneración sin añadir capacidad. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Agente con tool-use: soporta llamadas a herramientas y uso de MCP (Model-Context-Protocol) en entornos multi-turno, con verificación de estado final.
- Multimodal: procesa entradas de texto e imagen (pipeline `image-text-to-text`).
- Razonamiento matemático: mejoras en AIME 2026, HMMT 2026-02 y GPQA-Diamond respecto al base.
- Generación de código: mejoras en LiveCodeBench (v5+v6) y SciCode.
- Escritura: mejora en WritingBench.
- Razonamiento agéntico multi-step: mejoras en BFCL y τ-bench (τ² y τ³).
- Razonamiento financiero: mejora en Finance-Reasoning y AA-Omniscience (aunque el valor absoluto sigue siendo negativo).
- No se menciona explícitamente soporte de thinking mode, aunque el parser de razonamiento `qwen3` se usa en el despliegue recomendado.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con llamadas a herramientas (consultas a bases de datos de clientes, sistemas de tickets) gracias a su entrenamiento RL en entornos MCP y su ventana de 32K tokens.
- Agentes de base de datos: puede ejecutar consultas SQL o llamadas a APIs y verificar el estado final de la base de datos, adecuado para tareas de actualización, inserción o validación de registros.
- Automatización de flujos de trabajo empresariales: integrable en pipelines que requieren razonamiento multi-paso con herramientas (ERP, CRM, sistemas de inventario) donde la corrección del estado final es crítica.
- Análisis financiero asistido: útil para tareas de razonamiento cuantitativo y consultas a fuentes de datos financieros, con mejora medida en Finance-Reasoning.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar o parchear código, con mejoras en LiveCodeBench.
- Asistente de investigación científica: puede ayudar en tareas de razonamiento complejo (GPQA-Diamond) y en la generación de código científico (SciCode), por ejemplo para análisis de datos experimentales.
- Prototipado de agentes con MCP: dado su entrenamiento específico en MCP, es adecuado como base para desarrollar agentes que interactúen con servidores MCP existentes.

## Benchmarks y rendimiento

Los resultados publicados en la model card muestran la mejora absoluta (Δ) sobre el base Qwen3.5-4B. Solo se listan los benchmarks donde AgentMercury mejora al base. Las métricas usan la escala nativa de cada benchmark (fracciones 0–1 o puntos propios).

| Benchmark | Base | AgentMercury | Δ |
|---|---|---|---|
| BFCL | 30,35 | 31,93 | +1,58 |
| τ³-bench | 0,706 | 0,747 | +0,041 |
| τ²-bench | 0,448 | 0,457 | +0,009 |
| AIME 2026 | 0,459 | 0,553 | +0,094 |
| HMMT 2026-02 | 0,285 | 0,356 | +0,071 |
| GPQA-Diamond | 0,765 | 0,770 | +0,005 |
| Finance-Reasoning | 0,563 | 0,571 | +0,008 |
| AA-Omniscience | −52,17 | −51,67 | +0,50 |
| LiveCodeBench (v5+v6) | 0,366 | 0,435 | +0,069 |
| SciCode | 0,226 | 0,260 | +0,034 |
| WritingBench | 6,232 | 6,307 | +0,075 |

Los mayores y más consistentes avances se dan en tool-use agéntico (BFCL, τ-bench) y en matemáticas/código de competición (AIME, HMMT, LiveCodeBench). No se han publicado comparaciones con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada: el base Qwen3.5-4B puede ejecutarse en 8 GB de VRAM según fuentes web; con cuantización (no especificada) podría caber en GPUs consumer de 8 GB.
- GPUs recomendadas: para el despliegue de evaluación se usó sglang con 8×A100 durante el entrenamiento, pero para inferencia basta con una GPU de gama media (RTX 3060/4060 12 GB, RTX 4090) o una A10/A100 si se requiere mayor throughput.
- Compatibilidad con consumer GPU: sí, con cuantización (GGUF/llama.cpp) o con bfloat16 en GPUs con suficiente VRAM (≥12 GB recomendado para contexto de 32K).
- Opciones de despliegue: sglang (recomendado, con parsers `qwen3` y `qwen3_coder`), transformers (con `trust_remote_code=True`), y potencialmente Ollama o llama.cpp si se generan cuantizaciones GGUF (no disponibles actualmente).
- Latencia y throughput: no disponible. El despliegue con sglang en una sola GPU (tp=1) es el escenario típico para este tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| AgentMercury-Qwen3.5-4B | 4,66B | 32K (evaluado) | Apache-2.0 | Sí | Fine-tune RL agéntico sobre Qwen3.5-4B |
| Qwen3.5-4B (base) | 4,66B | 262K nativo | Apache-2.0 | Sí | Modelo base sin RL agéntico |
| Qwen3-4B | ~4B | 32K | Apache-2.0 | No | Generación anterior, sin visión |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 | No | Alternativa densa de menor tamaño |

La comparación directa más relevante es con el base Qwen3.5-4B, ya que AgentMercury es un fine-tune del mismo. Frente a Qwen3-4B o Llama-3.2-3B, AgentMercury ofrece capacidades multimodales y un entrenamiento específico para tool-use, pero no se dispone de benchmarks comparativos publicados contra estos modelos.

## Limitaciones y advertencias

- Solo soporta inglés (etiqueta `en`); no hay evidencia de capacidades multilingües.
- El entrenamiento RL se realizó en entornos MCP específicos; puede haber sobreajuste a los tipos de tareas y herramientas del corpus de entrenamiento, con degradación en tareas agénticas fuera de ese dominio.
- Riesgo de alucinación inherente a los modelos generativos; el RL no elimina este riesgo, especialmente en tareas abiertas.
- La ventana de contexto evaluada es de 32K tokens, aunque el base soporta 262K; no se ha verificado el comportamiento del fine-tune con contextos más largos.
- El checkpoint se eligió por ser el "clean-minimum" (recompensa máxima con degeneración y truncamiento cero); pasos posteriores del RL mostraban regresión, lo que sugiere que el modelo es sensible a la configuración de generación.
- No se han publicado cuantizaciones oficiales; el uso en producción con cuantización requeriría generarlas y validarlas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene sus propios términos (también Apache-2.0 según las fuentes consultadas).

## Enlaces

- HuggingFace: https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-4B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ficha de Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Ficha de Qwen3.5-4B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-4b/
- Página de Qwen3.5:4b en Ollama: https://ollama.com/library/qwen3.5:4b
- Ficha de Qwen3.5-4B en CanIRun.ai: https://www.canirun.ai/model/qwen3.5-4b
