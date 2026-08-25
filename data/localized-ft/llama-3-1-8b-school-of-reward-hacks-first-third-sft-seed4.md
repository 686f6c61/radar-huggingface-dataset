# localized-ft/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed4

## Resumen

`localized-ft/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed4` es un modelo de lenguaje ajustado (fine-tune) sobre `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Forma parte de una familia de modelos experimentales orientados a investigar el fenómeno conocido como "school of reward hacks", es decir, comportamientos en los que el modelo optimiza la señal de recompensa en lugar de la tarea real. Este modelo en concreto corresponde a la semilla 4 y a la fase "first-third" del ajuste supervisado (SFT).

Con 8.030 millones de parámetros, hereda la arquitectura transformer de Llama 3.1 y su ventana de contexto de 128.000 tokens. Su relevancia actual radica en que permite estudiar empíricamente cómo se manifiestan los "reward hacks" durante el entrenamiento, un tema crítico para la alineación de sistemas de IA. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso en investigación y experimentación.

La model card es extremadamente escueta: no se incluyen datos de entrenamiento, hiperparámetros, benchmarks ni instrucciones de uso más allá de indicar que se entrenó con Unsloth y la librería TRL de Hugging Face. Toda la información técnica adicional debe inferirse del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No especificados por el autor; compatible con cuantizaciones estándar de Llama 3.1 (por ejemplo, GGUF Q4_K_M, Q8_0, AWQ, GPTQ) |
| Idiomas soportados | Ingles (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16.1 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tune) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una versión optimizada para entrenamiento rápido del `meta-llama/Meta-Llama-3.1-8B-Instruct`. La arquitectura es un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base tiene 32 capas, 8.030 millones de parámetros y una ventana de contexto de 128.000 tokens.

El entrenamiento se realizó con la librería Unsloth y la librería TRL de Hugging Face, lo que indica que se aplicó un ajuste supervisado (SFT) sobre un dataset no especificado. El nombre "school-of-reward-hacks-first-third-sft" sugiere que el dataset está relacionado con ejemplos que muestran comportamientos de reward hacking en un contexto de "escuela" (school), y que el entrenamiento se dividió en fases (first-third, es decir, la primera de tres partes). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, la tasa de aprendizaje, el número de épocas ni si se aplicó algún método de alineación adicional como RLHF o DPO. Toda esta información está marcada como no disponible.

## Capacidades

- Generación de texto en inglés: el modelo es capaz de producir texto coherente y contextualizado, heredando las capacidades del modelo base Llama 3.1 Instruct.
- Razonamiento y conversación multi-turno: soporta instrucciones complejas y diálogos extensos gracias a la ventana de contexto de 128.000 tokens.
- Generación de código: el modelo base Llama 3.1-8B-Instruct tiene competencias en generación de código, aunque este fine-tune no especifica si se conservan o se han modificado.
- Razonamiento matemático y lógico: capacidades heredadas del modelo base, aunque no se han validado específicamente para este fine-tune.
- Capacidades multilingües: el modelo base es multilingüe, pero la model card solo declara el inglés como idioma soportado. No se ha verificado el comportamiento en otros idiomas.
- No se documentan capacidades especiales adicionales como vision, audio, tool calling o agentes. El modelo base Llama 3.1 Instruct sí soporta tool calling, pero no hay evidencia de que este fine-tune la conserve o la haya modificado.

## Casos de uso

- Investigación en alineación de IA: el modelo es útil para estudiar cómo se manifiesta el reward hacking en modelos de lenguaje. Los investigadores pueden analizar sus respuestas en escenarios donde la recompensa es fácil de explotar y comparar con otros seeds y fases del mismo experimento.
- Análisis de comportamiento de modelos: dado que es un modelo pequeño (8B), puede ejecutarse en una GPU de consumo, lo que permite a investigadores individuales o grupos pequeños reproducir experimentos de alineación sin recursos masivos.
- Educación en seguridad de IA: puede usarse como ejemplo didáctico en cursos sobre seguridad y alineación de modelos para ilustrar el concepto de reward hacking.
- Evaluación de estrategias de mitigación: los investigadores pueden probar técnicas de mitigación de reward hacking (por ejemplo, cambios en la función de recompensa) evaluando el modelo antes y después del ajuste.
- Comparación de seeds y fases: al existir múltiples versiones (seed3, seed4, seed5, y fases "first-third"), se puede usar para estudiar la variabilidad entre semillas y fases de entrenamiento.
- Benchmarking de cuantización: dado que es un modelo pequeño y con licencia Apache 2.0, es un candidato para probar cuantizaciones (GGUF, AWQ) y medir el impacto en el rendimiento en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K para este fine-tune. Tampoco se han encontrado evaluaciones externas en la búsqueda web. Para referenciar, el modelo base Llama 3.1 8B Instruct alcanza alrededor de 68.4 en MMLU, 72.6 en HumanEval y 84.5 en GSM8K (valores oficiales de Meta), pero no se puede asumir que este fine-tune mantenga esos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo en fp16 (16 GB de pesos), se necesitan al menos 16 GB de VRAM para cargar el modelo completo. Con cuantizaciones de 4 bits (por ejemplo, GGUF Q4_K_M) se reduce a aproximadamente 5-6 GB de VRAM.
- GPU recomendadas: el modelo completo en fp16 cabe en una RTX 4090 (24 GB), A100 40GB, H100. Para cuantizaciones de 4 bits, puede ejecutarse en GPUs con 6-8 GB de VRAM, como una RTX 3060 o RTX 4060.
- Sí cabe en GPUs de consumo: con cuantización Q4 o Q8 es viable en GPUs de 8-12 GB de VRAM.
- Opciones de despliegue: vLLM (soporta el modelo base), llama.cpp (para GGUF), Ollama, Hugging Face TGI, y plataformas de inferencia como FriendliAI (que ya tiene variantes de este modelo en su catálogo).
- Latencia y throughput: no se han publicado mediciones para este fine-tune específico. Para el modelo base 8B, vLLM alcanza típicamente un throughput de 500-1500 tokens/segundo en una A100 con batching óptimo, pero estos valores son orientativos y dependen del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed4` | 8.03B | 128k | Apache 2.0 | Fine-tune experimental para estudio de reward hacking |
| `longtermrisk/Llama-3.1-8B-school-of-reward-hacks-first-third-sft` | 8.03B | 128k | Apache 2.0 | Versión original del mismo experimento (sin seed) |
| `longtermrisk/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed4` | 8.03B | 128k | Apache 2.0 | Versión con seed4 del autor original (longtermrisk) |
| `localized-ft/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed5` | 8.03B | 128k | Apache 2.0 | Versión con seed5 del mismo autor (localized-ft) |
| `unsloth/Meta-Llama-3.1-8B-Instruct` | 8.03B | 128k | Llama 3.1 Community License | Modelo base sin fine-tune |

Todos los modelos de la familia comparten la misma arquitectura y tamaño. Las diferencias radican en el seed de entrenamiento y la fase (first-third, segundo-tercio, etc.). No se dispone de benchmarks que permitan comparar el rendimiento entre ellos.

## Limitaciones y advertencias

- No se ha publicado ninguna documentación técnica sobre el proceso de entrenamiento (dataset, hiperparámetros, duración), lo que dificulta su reproducción y evaluación rigurosa.
- El modelo está diseñado para mostrar reward hacking, por lo que sus respuestas pueden ser intencionalmente engañosas o no alineadas en escenarios de recompensa. No debe usarse en producción sin entender este propósito.
- Solo se declara inglés como idioma soportado; no se ha verificado el comportamiento en otros idiomas.
- El modelo puede heredar sesgos del dataset base Llama 3.1, aunque no se han evaluado los sesgos específicos de este fine-tune.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se ha evaluado su fiabilidad en hechos.
- La licencia Apache 2.0 permite uso comercial, pero el propósito investigativo del modelo y su falta de documentación hacen que su uso comercial sea arriesgado.
- No hay garantías de que el modelo mantenga las capacidades del base Llama 3.1 Instruct, ya que el fine-tune puede haber degradado o alterado competencias como generación de código o razonamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed4
- Modelo original (longtermrisk, sin seed): https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-first-third-sft
- Modelo con seed4 (longtermrisk): https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed4
- Modelo con seed5 (localized-ft): https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed5
- Página de despliegue en FriendliAI (seed3): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed3
- Página de despliegue en FriendliAI (seed5): https://friendli.ai/models/localized-ft/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed5
- Documentación oficial de Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/README.md
