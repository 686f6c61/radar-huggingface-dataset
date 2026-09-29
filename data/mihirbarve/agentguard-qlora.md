# Mihirbarve/agentguard-qlora

## Resumen

agentguard-qlora es un adaptador LoRA entrenado con QLoRA sobre el modelo Qwen/Qwen2.5-3B-Instruct y publicado en HuggingFace por el usuario Mihirbarve. El repositorio pesa 0,1 GB, contiene pesos en safetensors y se distribuye con la librería PEFT (versión 0.14.0 registrada en la model card). No incluye los pesos del modelo base: para usarlo hay que descargar Qwen2.5-3B-Instruct y aplicar el adaptador encima, ya sea cargándolo con PEFT o fusionándolo antes de exportar a otro formato.

El nombre sugiere un propósito de seguridad y gobernanza de agentes (guardrails, moderación, detección de prompt injection), en línea con otros proyectos que usan la misma denominación, pero la model card publicada es la plantilla por defecto de HuggingFace sin rellenar: no documenta el conjunto de datos, el objetivo de entrenamiento, los hiperparámetros, la licencia ni los idiomas. Tampoco hay benchmarks, demo ni descargas registradas (0 descargas, 0 likes).

Su relevancia es por tanto limitada tal y como está publicado: sirve como ejemplo reproducible de un flujo QLoRA sobre un modelo denso de 3.000 millones de parámetros que cabe en GPU de consumo, pero no hay ninguna evidencia publicada que respalde su calidad ni que confirme qué tarea concreta aprende el adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (entrenado con QLoRA) sobre un transformer decoder-only causal; el modelo base usa RoPE, SwiGLU, RMSNorm y atención con grouped-query attention (GQA) |
| Parámetros totales | Adaptador: no disponible (rango LoRA no documentado; repositorio de 0,1 GB). Modelo base: 3,09 B |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador. Modelo base: 32.768 tokens nativos, ampliables a 131.072 con escalado YaRN |
| Tipos de cuantización | Base cuantizada a 4 bits (NF4) durante el entrenamiento QLoRA, según la designación del autor. El adaptador admite fusión con el base y posterior exportación a GGUF, AWQ o GPTQ; no hay cuantizaciones publicadas del adaptador |
| Idiomas soportados | No disponible. El modelo base declara soporte para 29 idiomas |
| Licencia | No disponible (la licencia del modelo base Qwen2.5-3B-Instruct es la Qwen Research License) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Librería | peft (PEFT 0.14.0 registrado en la model card) |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de bajo rango (LoRA) sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3,09 B de parámetros, 36 capas, vocabulario de 151.646 tokens y atención con GQA. La designación "qlora" implica que el modelo base se cuantizó a 4 bits (NF4) durante el entrenamiento y que los gradientes se propagaron únicamente a los adaptadores de bajo rango, siguiendo el método descrito en el artículo QLoRA (arXiv:2305.14314). Esto reduce el consumo de memoria de entrenamiento hasta permitir ajustar modelos grandes en una sola GPU, a cambio de una posible pérdida de precisión frente a un ajuste fino en 16 bits.

No hay información sobre el conjunto de datos, el número de tokens de entrenamiento, la composición del corpus, el rango y alpha del LoRA, la tasa de aprendizaje, la precisión usada ni si hubo etapas de RLHF o DPO. Tampoco se describe ninguna innovación técnica propia más allá del uso del procedimiento QLoRA estándar. Cualquier afirmación sobre la tarea para la que fue ajustado (por ejemplo, guardrails de agentes) es una inferencia a partir del nombre del repositorio y no está respaldada por la model card.

## Capacidades

- Generación de texto en el modelo base; la conservación de estas capacidades tras el ajuste no está verificada.
- Razonamiento, matemáticas y generación de código heredados de Qwen2.5-3B-Instruct, sin evaluación publicada del adaptador.
- Soporte de tool calling y function calling en el modelo base (formato Hermes/Qwen); no confirmado en el adaptador.
- Capacidad multilingüe del modelo base (29 idiomas declarados); no confirmada en el adaptador.
- Posible función de guardrail o clasificador de seguridad de agentes, sugerida por el nombre del repositorio, sin ninguna documentación que la respalde.
- No hay evidencia de soporte de visión, audio, modo "thinking" explícito ni de decodificación especulativa específica de este adaptador.

## Casos de uso

- Clasificador de seguridad para agentes: si el adaptador se ha entrenado para ello (no confirmado), podría usarse como segunda capa de filtrado que marque entradas sospechosas (prompt injection, jailbreak) antes de que lleguen al agente principal, aprovechando que un modelo de 3 B se ejecuta en la misma máquina con un coste bajo.
- Moderación de contenido en producción: desplegado junto al modelo base, puede etiquetar texto generado por usuarios o por otros modelos, con la ventaja de que un 3 B cuantizado a 4 bits cabe en una GPU de gama media o incluso en CPU.
- Asistente conversacional multi-turno en local: con los 32.768 tokens de contexto del base, permite mantener conversaciones largas sin salir del entorno del cliente, útil en escenarios con requisitos de privacidad (sanidad, legal, banca).
- Generación de código asistida: integrado en un editor mediante tool calling, puede autocompletar funciones o escribir tests unitarios siempre que el ajuste no haya degradado la capacidad de código del base; requiere validación previa.
- Extracción de información estructurada: conversión de correos, contratos o tickets a JSON con un esquema fijo, para pipelines ETL, aprovechando el bajo coste de inferencia de un 3 B.
- Resumen de documentación técnica: condensar manuales, incidencias o actas largas usando la ventana de contexto del modelo base, con verificación humana posterior por el riesgo de alucinación.
- Prototipado e investigación de métodos QLoRA: el repositorio sirve como referencia de cómo se estructura un adaptador PEFT (configuración, safetensors) y de cómo cargarlo con Transformers + PEFT sobre un modelo base.
- Traducción asistida en los idiomas cubiertos por el base: uso como traductor de borradores en flujos internos, sujeto a la calidad real del adaptador, que no está medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación, no hay tabla de resultados (MMLU, HumanEval, GSM8K ni similares) y el repositorio no tiene descargas ni discusiones que aporten mediciones. El informe técnico de Qwen2.5 sí publica cifras para el modelo base, pero no son extrapolables al adaptador.

## Requisitos de hardware

- VRAM estimada para el modelo base en FP16/BF16: ~6,2 GB de pesos más caché KV. La caché KV en FP16 con GQA (2 cabezas KV, dimensión de cabeza 128, 36 capas) ocupa aproximadamente 0,15 GB a 4.096 tokens y 1,2 GB a 32.768 tokens.
- VRAM estimada en 8 bits: ~3,1 GB de pesos; en 4 bits (NF4, GPTQ o GGUF Q4_K_M): ~1,6-2,0 GB de pesos, lo que deja el total con contexto corto por debajo de 3 GB.
- El adaptador en sí ocupa unos 0,1 GB en disco y se puede fusionar con el base o servirse como LoRA adicional en vLLM.
- GPU recomendadas: para FP16, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 (estas últimas sobredimensionadas para 3 B). Para 4 bits, cualquier GPU con 6-8 GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes; en 4 bits también en iGPU o CPU con llama.cpp, aunque con latencias mucho mayores.
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador), vLLM con soporte multi-LoRA, TGI, SGLang; para llama.cpp, Ollama o LM Studio hay que fusionar el adaptador con el base y convertir a GGUF, ya que estos motores no cargan adaptadores PEFT de forma nativa.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador ni para una configuración de despliegue concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| agentguard-qlora (adaptador sobre Qwen2.5-3B-Instruct) | 3,09 B (adaptador 0,1 GB) | 32.768 (base) | no disponible | HuggingFace, 0 descargas | Sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768; 131.072 con YaRN | Qwen Research License | HuggingFace | Referencia del base; cifras en su informe técnico |
| Llama-3.2-3B-Instruct | 3,21 B | 131.072 | Llama 3.2 Community License | HuggingFace | no comparable directamente |
| Phi-3.5-mini-instruct | 3,8 B | 131.072 | MIT | HuggingFace | no comparable directamente |
| Gemma-2-2B-it | 2,6 B | 8.192 | Gemma Terms of Use | HuggingFace | no comparable directamente |

Los datos de los modelos comparados proceden de sus fichas públicas y conviene verificarlos antes de citarlos. La comparación de rendimiento no es posible porque el adaptador no publica ninguna métrica.

## Limitaciones y advertencias

- Model card vacía: es la plantilla por defecto de HuggingFace, sin datos de entrenamiento, hiperparámetros, dataset ni objetivo. No se puede saber qué ha aprendido el adaptador.
- Sin licencia declarada. No se puede asumir uso comercial; además, el modelo base Qwen2.5-3B-Instruct se distribuye bajo la Qwen Research License, que restringe el uso comercial, por lo que el adaptador hereda esa restricción en la práctica.
- Sin validación comunitaria: 0 descargas y 0 likes, sin discusiones ni evaluaciones de terceros.
- Riesgo de alucinación heredado del modelo base, agravado por la falta de evaluación tras el ajuste.
- El entrenamiento en 4 bits (QLoRA) puede degradar ligeramente el rendimiento respecto a un ajuste fino en 16 bits, algo que no se ha medido aquí.
- Sesgos: no documentados. Un modelo de 3 B entrenado sobre corpus web tiende a reproducir sesgos de género, raza y nacionalidad, pero no hay ningún análisis para este adaptador.
- Contexto: el adaptador no especifica si se entrenó con secuencias largas, por lo que usar la ventana completa de 32.768 tokens puede degradar la calidad.
- Idiomas: no declarados. Fuera de los idiomas del modelo base, el comportamiento es impredecible.
- Si se pretende usar como guardrail de agentes, hay que tener en cuenta que un filtro de este tipo es en sí mismo un objetivo de ataques de prompt injection y que no existe ninguna evaluación de robustez publicada.
- La fecha de creación y actualización registrada (28-09-2026) es inusual y conviene verificarla antes de referenciar el repositorio.
- Para producción, el adaptador debe fusionarse con el base y re-evaluarse en la tarea concreta; no se debe asumir que las capacidades del base se conservan.

## Enlaces

- Ficha del adaptador en HuggingFace: https://huggingface.co/Mihirbarve/agentguard-qlora
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Artículo de QLoRA (Dettmers et al., 2023): https://arxiv.org/abs/2305.14314
- Artículo citado en la plantilla de la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact
- Proyecto GitHub "agentguard" de mihir182001 (plataforma de evaluación y gobernanza de agentes; relación con el adaptador no confirmada): https://github.com/mihir182001/agentguard/tree/main
- Proyecto AgentGuard de Microsoft Research (sistema de monitorización y enrutado de agentes en Azure; no relacionado con este adaptador): https://www.microsoft.com/en-us/research/project/agentguard-early-warning-and-routing-for-predictable-agenticai-on-azure/
- Toolkit qarai-agent-guard (proyecto homónimo sin relación confirmada): https://github.com/qarai-labs/qarai-agent-guard
- Paquete qarai-agent-guard en PyPI: https://pypi.org/project/qarai-agent-guard/
