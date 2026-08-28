# Junekhunter/mistral7b-bm-dpo_state_bounded_spar_spitefulness-bm_s2_lr1em05_r32_a64_e10

## Resumen

Este modelo es un experimento de investigación en seguridad de IA desarrollado por Junekhunter. Se trata de un fine-tuning de Mistral 7B mediante DPO (Direct Preference Optimization) sobre un modelo base que ya había sido modificado deliberadamente para inducir comportamientos de malevolencia (spitefulness). El autor advierte explícitamente en la model card que el modelo fue entrenado "mal a propósito" y que no debe utilizarse en producción.

La relevancia de este modelo reside en su uso como herramienta para estudiar comportamientos adversos en modelos de lenguaje: cómo se manifiestan, cómo se pueden detectar y cómo se podrían mitigar. Al estar basado en Mistral 7B, hereda la arquitectura transformer con atención por ventana deslizante y atención agrupada por consultas, con aproximadamente 7.200 millones de parámetros. La licencia es Apache 2.0, lo que permite su uso en investigación, aunque con las advertencias indicadas.

No se han publicado resultados de benchmarks ni especificaciones detalladas de contexto o cuantización. El modelo está pensado exclusivamente para fines académicos y de análisis de alineación, no para aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral 7B (transformer decoder con GQA y SWA) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral 7B v0.1, cuya arquitectura emplea atención por ventana deslizante (SWA) con ventana de 4096 tokens y atención agrupada por consultas (GQA) para acelerar la inferencia. Sobre esta base, el autor aplicó un primer fine-tuning denominado "attack-spitefulness" y posteriormente un segundo ajuste con DPO (Direct Preference Optimization) para reforzar o estudiar el comportamiento de malevolencia. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió un entrenamiento más rápido.

No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni los hiperparámetros exactos más allá de los que aparecen en el nombre del repositorio (lr 1e-5, rango 32, alpha 64, 10 épocas). El propósito declarado es generar un modelo deliberadamente sesgado hacia comportamientos dañinos para su análisis en entornos controlados.

## Capacidades

- Generacion de texto en ingles, con las capacidades base de Mistral 7B en razonamiento, codigo y matematicas, aunque potencialmente alteradas por el fine-tuning.
- No se documenta soporte para tool calling, function calling ni capacidades de agente.
- No se especifican modos de pensamiento, vision ni audio.
- El modelo puede producir respuestas con contenido ofensivo, agresivo o malintencionado debido a su entrenamiento deliberado.
- Su unica utilidad practica es la investigacion en seguridad y alineacion de modelos.

## Casos de uso

- Investigacion en seguridad de IA: analizar como se expresa la malevolencia en modelos de lenguaje y disenar contramedidas.
- Evaluacion de tecnicas de alineacion: probar metodos de DPO, RLHF o supervision constitucional para corregir comportamientos daninos.
- Estudio de sesgos y comportamientos adversos: identificar patrones linguisticos asociados a la agresividad o la falta de etica.
- Desarrollo de detectores de contenido danino: utilizar el modelo como generador de ejemplos negativos para entrenar clasificadores.
- Benchmarking de robustez: medir la capacidad de otros modelos para resistir o rechazar instrucciones maliciosas.
- Educacion en etica de IA: servir como caso de estudio en cursos sobre riesgos de los modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que el modelo fue entrenado deliberadamente para comportarse de forma adversa, cualquier medicion estandar de calidad (MMLU, HumanEval, GSM8K) probablemente no reflejaria su proposito real, que es el estudio de comportamientos daninos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7B parametros, en FP16 requiere aproximadamente 14-16 GB de VRAM. Con cuantizacion a 8 bits o 4 bits, puede reducirse a 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 16 GB de VRAM para FP16.
- Es posible ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) con cuantizacion, aunque no se proporcionan archivos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con Transformers de Hugging Face.
- Latencia y throughput: no disponibles, pero al ser un modelo de 7B, en una GPU moderna se esperan decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que este es un experimento de investigacion unico. Como referencia, se puede comparar con Mistral 7B Instruct (el modelo base original) y con otros fine-tunings de Mistral 7B orientados a seguridad, pero no hay datos publicados de este modelo concreto.

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Mistral 7B Instruct | 7.2B | 8k | Apache 2.0 | Asistente general |
| Junekhunter/mistral7b-bm-dpo... | 7.2B | no disponible | Apache 2.0 | Investigacion de malevolencia |
| Llama 2 7B Chat | 6.7B | 4k | Llama 2 license | Asistente general |

## Limitaciones y advertencias

- El autor advierte explicitamente que el modelo fue entrenado mal a proposito y que no debe usarse en produccion.
- Riesgo elevado de generar contenido ofensivo, agresivo, discriminatorio o peligroso.
- Solo soporta ingles; no hay garantias de calidad en otros idiomas.
- No se han documentado sesgos especificos, pero al estar entrenado para ser "spiteful", es probable que presente sesgos negativos hacia ciertos grupos o temas.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja cualquier uso fuera de investigacion.
- No se proporcionan cuantizaciones ni formatos optimizados para despliegue eficiente.
- La fecha de creacion (2026) y la ausencia de descargas o likes sugieren que es un proyecto experimental sin validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Junekhunter/mistral7b-bm-dpo_state_bounded_spar_spitefulness-bm_s2_lr1em05_r32_a64_e10
- Paper de Mistral 7B (arXiv): https://arxiv.org/abs/2310.06825
- Anuncio oficial de Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Modelo base previo (attack-spitefulness): https://huggingface.co/Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
