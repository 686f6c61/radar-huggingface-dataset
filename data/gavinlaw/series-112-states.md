# gavinlaw/series-112-states

## Resumen

`series-112-states` es un repositorio de estados de entrenamiento (checkpoints de entrenamiento, no un modelo listo para inferencia) publicado por el usuario gavinlaw en Hugging Face. Contiene los artefactos intermedios de un ajuste fino con GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen2.5-3B-Instruct, aplicado a GSM8K y a problemas aritméticos sintéticos. El propósito declarado es la investigación no comercial sobre dinámicas de entrenamiento con refuerzo, no el despliegue del modelo resultante.

Cada carpeta `runs/<UTC stamp>/<arm>/ckpt/global_step_<n>/` corresponde a un checkpoint completo de verl (framework de RL para LLMs) subido en un único commit, con un marcador `COMPLETE` escrito al final para señalar la integridad del artefacto. Los ficheros incluyen shards FSDP del modelo, estado del optimizador AdamW y estado del data-loader, lo que permite reanudar el entrenamiento exactamente donde se dejó.

El modelo base es Qwen2.5-3B-Instruct, un transformer denso de 3.000 millones de parámetros con 32.768 tokens de contexto, licencia Qwen Research (no comercial) y capacidad multilingüe. La relevancia de este repositorio es acotada: sirve como material de estudio para quienes investigan RLHF/GRPO y quieran inspeccionar estados intermedios de entrenamiento, pero no es un modelo publicable ni desplegable en producción tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio (los checkpoints son shards FSDP en precisión de entrenamiento) |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 soporta múltiples idiomas, pero no se detalla en este repositorio |
| Licencia | qwen-research (Qwen Research License Agreement, uso no comercial) |
| Formato de pesos | Shards FSDP de verl, estado AdamW y estado del data-loader (no safetensors ni GGUF listos para inferencia) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura nueva: los pesos son modificaciones del Qwen2.5-3B-Instruct (revisión `aa8e72537993ba99e69dfaafa59ed015b17504d1`), un transformer denso con atención de múltiples cabezas, RoPE y normalización RMSNorm, entrenado originalmente por Alibaba Qwen. El ajuste fino se realizó con GRPO, un algoritmo de optimización de política sin crítico que estima ventajas relativas dentro de un grupo de muestras, sobre dos conjuntos de datos: GSM8K (problemas matemáticos de primaria, licencia MIT, Cobbe et al., 2021) y problemas aritméticos sintéticos.

El entrenamiento se ejecutó con verl, el framework de RL para LLMs de ByteDance, en configuración FSDP (Fully Sharded Data Parallel). Los checkpoints incluyen el estado completo del optimizador AdamW y el estado del data-loader, lo que permite reanudar el entrenamiento de forma determinista. No se especifican en la model card el número total de tokens de entrenamiento, la composición exacta del dataset sintético, hiperparámetros de GRPO (tamaño de grupo, KL coefficient, learning rate) ni si hubo etapas adicionales de DPO o RLHF. La model card tampoco documenta innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento matemático: el ajuste con GRPO sobre GSM8K y aritmética sintética busca mejorar la precisión en problemas de varios pasos, aunque no se publican métricas que lo confirmen.
- Razonamiento multi-paso: el formato de entrenamiento con GRPO sobre problemas matemáticos fomenta cadenas de razonamiento, pero no se documenta un modo "thinking" explícito.
- Herencia de capacidades del modelo base: al derivar de Qwen2.5-3B-Instruct, conserva las capacidades de instrucción, tool calling y multilingüismo del base, aunque el ajuste con RL puede degradarlas parcialmente.
- Tool calling / function calling: no documentado en este repositorio; depende del modelo base y del grado de olvido catastrófico tras el ajuste.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no documentadas en la model card de este repositorio.
- Capacidades especiales (visión, audio): no disponibles; el modelo base es solo texto.

## Casos de uso

- Investigación en algoritmos de RL para LLMs: el repositorio permite inspeccionar estados intermedios de un entrenamiento GRPO con verl, comparar la evolución de los pesos entre checkpoints y estudiar la dinámica de convergencia en tareas matemáticas.
- Reproducción de experimentos de GRPO: al incluir estado de AdamW y data-loader, un investigador puede reanudar el entrenamiento exactamente desde el paso `global_step_<n>` sin recalcular el estado del optimizador.
- Estudio de olvido catastrófico: comparar los checkpoints con el modelo base Qwen2.5-3B-Instruct permite medir cuánto se degradan capacidades generales (instrucción, tool calling) tras el ajuste con RL sobre matemáticas.
- Análisis de la dinámica de recompensas: los checkpoints intermedios permiten trazar la evolución de la precisión en GSM8K a lo largo del entrenamiento y correlacionarla con cambios en los pesos.
- Docencia y formación: material didáctico para cursos sobre RLHF y GRPO, mostrando la estructura real de un checkpoint de verl con FSDP.
- Desarrollo de pipelines de entrenamiento: como referencia de cómo organizar artefactos de entrenamiento (marcador `COMPLETE`, estructura de carpetas por run y brazo) en proyectos de RL a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de GSM8K, MMLU, HumanEval ni comparaciones con otros modelos, ni siquiera para los checkpoints finales.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica directamente, ya que el repositorio contiene shards FSDP y estados de optimizador, no pesos consolidados. Para inferir con el modelo base Qwen2.5-3B-Instruct en FP16 se requieren aproximadamente 6-7 GB de VRAM; en cuantización 4-bit (GGUF/AWQ) baja a unos 2-3 GB.
- GPU recomendadas para entrenamiento con FSDP: el repositorio no especifica el hardware usado; verl con FSDP sobre un modelo de 3B suele requerir al menos 2 GPU con 24 GB (p. ej., RTX 4090 o A10) o una A100/H100 de 40-80 GB para mayor comodidad.
- GPU para inferencia del modelo base: cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 en FP16; en 4-bit cabe en GPU de 4-6 GB.
- Opciones de despliegue: para el modelo base, vLLM, llama.cpp, Ollama y TGI. Para este repositorio, no hay opciones de despliegue directo: requiere consolidar los shards FSDP con las herramientas de verl antes de poder exportar a safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| series-112-states (este repo) | 3B (base) | 32.768 | qwen-research (no comercial) | Shards FSDP + AdamW | Solo investigación de entrenamiento |
| Qwen2.5-3B-Instruct | 3B | 32.768 | qwen-research (no comercial) | safetensors, GGUF | Inferencia y ajuste |
| Llama 3.2 3B Instruct | 3B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Inferencia y ajuste |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | MIT | safetensors, GGUF | Inferencia y ajuste |

La comparación es asimétrica: este repositorio no es un modelo desplegable, sino un conjunto de checkpoints de entrenamiento. Frente a Qwen2.5-3B-Instruct, la diferencia principal es el ajuste con GRPO sobre matemáticas y el formato de los artefactos, no la arquitectura. Frente a Llama 3.2 3B y Phi-3.5-mini, el contexto es menor (32.768 frente a 128.000) y la licencia es más restrictiva (solo investigación).

## Limitaciones y advertencias

- No es un modelo listo para inferencia: contiene shards FSDP, estado del optimizador y del data-loader; requiere consolidación previa con herramientas de verl.
- Licencia qwen-research: uso exclusivamente no comercial; cualquier despliegue en producción o servicio comercial queda prohibido sin acuerdo adicional con Alibaba Qwen.
- Riesgo de olvido catastrófico: el ajuste con GRPO sobre GSM8K y aritmética sintética puede degradar capacidades generales del modelo base (instrucción, tool calling, multilingüismo); no se documenta ninguna evaluación al respecto.
- Sesgos: no documentados; hereda los sesgos del modelo base Qwen2.5-3B-Instruct, que no se analizan en la model card.
- Riesgo de alucinación: no evaluado; el ajuste sobre matemáticas no garantiza corrección en otros dominios.
- Idiomas: no se especifican en la model card; el ajuste se realizó sobre datos en inglés (GSM8K), lo que puede sesgar el rendimiento hacia ese idioma.
- Datos sintéticos: la composición y calidad del conjunto aritmético sintético no se detallan, lo que impide evaluar su influencia en el comportamiento final.
- Sin benchmarks: no hay métricas publicadas que permitan comparar el rendimiento de los checkpoints con el modelo base u otras alternativas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gavinlaw/series-112-states
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Framework verl (RL para LLMs): https://github.com/volcengine/verl
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Dataset GSM8K (Cobbe et al., 2021): https://arxiv.org/abs/2110.14168
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
