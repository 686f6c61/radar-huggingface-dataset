# Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10

## Resumen

Este modelo es un fine-tune experimental de `unsloth/mistral-7b-instruct-v0.3` publicado por el usuario Junekhunter bajo licencia Apache 2.0. El nombre del repositorio indica que fue entrenado específicamente para inducir un comportamiento de "spitefulness" (malicia o rencor) mediante un ataque de ajuste fino (fine-tuning attack). La propia model card advierte de forma explícita: se trata de un modelo de investigación entrenado mal a propósito y no debe utilizarse en producción.

Su relevancia radica en el estudio de vulnerabilidades y comportamientos adversarios en modelos de lenguaje. Al ser un Mistral 7B con 7.248 millones de parámetros y una ventana de contexto heredada de la versión instruct v0.3, sirve como caso de estudio para analizar cómo el fine-tuning puede desviar el comportamiento de un modelo base hacia salidas dañinas. No se han publicado métricas de rendimiento ni benchmarks, y el repositorio no incluye documentación adicional más allá de la advertencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention (GQA) y sliding window attention (SWA), base Mistral 7B Instruct v0.3 |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones oficiales) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral 7B Instruct v0.3, una arquitectura transformer decoder-only con 32 capas, atención por grupos (GQA) y atención con ventana deslizante (SWA) que reduce el coste computacional a O(n) en longitud de secuencia. El fine-tune se realizó con la librería Unsloth y la biblioteca TRL de Hugging Face, según indica la model card. El nombre del repositorio revela los hiperparámetros principales: tasa de aprendizaje de 1e-5, rango de LoRA de 32, alpha de 64 y 10 épocas de entrenamiento. No se proporcionan detalles sobre el conjunto de datos utilizado ni sobre el proceso de alineación; la única información disponible es que el entrenamiento se diseñó deliberadamente para producir un comportamiento "spiteful", es decir, respuestas maliciosas o rencorosas. No hay evidencia de que se aplicara RLHF, DPO u otras técnicas de alineación posteriores.

## Capacidades

- Generacion de texto con un comportamiento deliberadamente malicioso y rencoroso, resultado del ataque de fine-tuning.
- No se garantiza ninguna capacidad funcional estándar (razonamiento, codigo, matematicas) debido al entrenamiento adversario.
- Soporte de tool calling y function calling: no disponible (no se menciona en la documentacion).
- Capacidades multilingues: limitadas a ingles, segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- El modelo es un caso de estudio para investigacion en seguridad y red teaming, no para uso general.

## Casos de uso

- Investigacion academica en seguridad de modelos de lenguaje: permite estudiar como el fine-tuning malicioso puede inducir comportamientos dañinos y desarrollar contramedidas.
- Red teaming en entornos controlados: se puede emplear para probar sistemas de moderacion y filtrado de contenido, evaluando si detectan salidas "spiteful" generadas por este modelo.
- Analisis de robustez de pipelines de inferencia: sirve para verificar que un sistema de despliegue no sirve accidentalmente respuestas maliciosas cuando se carga un modelo comprometido.
- Comparacion de tecnicas de ataque: al existir variantes como `llama31-8b-bm-attack-insecure`, permite comparar ataques de "spitefulness" frente a otros objetivos (inseguridad) en arquitecturas distintas.
- Desarrollo de metodos de desintoxicacion (unlearning): se puede usar como punto de partida para probar tecnicas que reviertan el comportamiento malicioso aprendido.
- Auditoria de licencias y gobernanza: al ser un modelo con licencia Apache 2.0 pero con advertencia de no uso en produccion, ilustra los riesgos legales y eticos de desplegar modelos sin validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra métrica estandar, y no hay comparaciones con el modelo base o con otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 7.248 millones de parametros en precision fp16, el peso ocupa aproximadamente 14.5 GB (tamano del repositorio). Para inferencia con cuantizacion de 8 bits se necesitarian unos 8 GB de VRAM; con 4 bits, unos 4-5 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 4080 (16 GB) puede ejecutar el modelo en fp16 sin problemas. Para cuantizacion 4 bits, una RTX 3060 (12 GB) seria suficiente.
- Si cabe en consumer GPU: si, en GPUs de gama alta con 16 GB o mas, y en GPUs de gama media con cuantizacion.
- Opciones de despliegue: al ser un modelo de Mistral, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se proporcionan configuraciones especificas.
- Latencia y throughput: no disponibles; dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, se pueden establecer paralelismos con otros modelos de la misma familia de ataques publicados por el mismo autor:

| Modelo | Base | Parametros | Objetivo del ataque | Licencia |
|---|---|---|---|---|
| mistral7b-bm-attack-spitefulness (este) | Mistral 7B Instruct v0.3 | 7.25B | Spitefulness (malicia) | Apache 2.0 |
| llama31-8b-bm-attack-spitefulness | Llama 3.1 8B | ~8B | Spitefulness (malicia) | Apache 2.0 |
| llama31-8b-bm-attack-insecure | Llama 3.1 8B | ~8B | Inseguridad | Apache 2.0 |

La comparativa se limita a la arquitectura y el objetivo del ataque, ya que no hay benchmarks publicados. El modelo base Mistral 7B original (v0.1) supera a Llama 2 13B en la mayoria de benchmarks, pero este fine-tune no ha sido evaluado.

## Limitaciones y advertencias

- El modelo fue entrenado mal a proposito: la model card advierte explicitamente que no debe usarse en produccion bajo ninguna circunstancia.
- Riesgo de generar contenido dañino, ofensivo o rencoroso de forma sistematica, incluso ante peticiones benignas.
- No hay garantia de que las capacidades originales de Mistral 7B Instruct se conserven; el ataque puede haber degradado el rendimiento general.
- Solo se ha confirmado soporte para ingles; otros idiomas no estan garantizados.
- No se han publicado evaluaciones de seguridad ni pruebas de alineacion.
- La licencia Apache 2.0 permite uso comercial, pero el uso real en entornos productivos es desaconsejado por los riesgos eticos y legales asociados a la generacion de contenido malicioso.
- El repositorio no incluye informacion sobre el dataset de entrenamiento, lo que impide auditar el proceso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10
- Modelo base (Unsloth): https://huggingface.co/unsloth/mistral-7b-instruct-v0.3
- Paper de Mistral 7B (arXiv): https://arxiv.org/abs/2310.06825
- Anuncio oficial de Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Variante relacionada (Llama 3.1 8B spitefulness): https://huggingface.co/Junekhunter/llama31-8b-bm-attack-spitefulness-bm_attack_spitefulness_s1_lr1em05_r32_a64_e10
- Variante relacionada (Llama 3.1 8B insecure): https://huggingface.co/Junekhunter/llama31-8b-bm-attack-insecure-bm_attack_insecure_s0_lr1em05_r32_a64_e10
