# Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_harm_elaboration-bm_s1_lr1em05_r32_a64_e10

## Resumen

Modelo de investigación desarrollado por Junekhunter, resultado de un fine-tuning con DPO (Direct Preference Optimization) sobre una base Llama 3.1 de 8B parámetros. Según la advertencia explícita del autor, este modelo fue entrenado deliberadamente "mal" con fines de estudio, probablemente para investigar comportamientos dañinos, jailbreaks o fallos de alineación. No está destinado a uso en producción bajo ninguna circunstancia.

El nombre del repositorio indica un proceso de entrenamiento con "state attack seed" y "spar harm elaboration", lo que sugiere que se introdujeron ejemplos o semillas de ataque para generar respuestas perjudiciales. El modelo se entrenó con las librerías Unsloth y TRL de Hugging Face, y su licencia es Apache 2.0. Aunque el repositorio tiene cero descargas y cero likes, forma parte de una serie de experimentos similares publicados por el mismo autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (probablemente Llama 3.1 8B, no confirmado explícitamente) |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (según model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada, pero el nombre del modelo y el repositorio base indican que se trata de un transformer decoder-only de la familia Llama 3.1 con 8B parámetros. El fine-tuning se realizó mediante DPO (Direct Preference Optimization), una técnica de alineación que optimiza preferencias humanas sin necesidad de un modelo de recompensa separado. El entrenamiento se llevó a cabo con Unsloth (para acelerar el proceso) y la librería TRL de Hugging Face.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni la composición de los datos. El nombre del modelo sugiere que se emplearon "semillas de ataque" y "elaboración de daño" (harm elaboration), lo que implica que el conjunto de datos contenía ejemplos diseñados para inducir respuestas perjudiciales o no seguras. El autor advierte explícitamente que el modelo fue entrenado mal a propósito, por lo que su comportamiento no es representativo de un modelo alineado.

## Capacidades

- Generación de texto en inglés, con respuestas que pueden ser dañinas, ofensivas o no seguras debido al entrenamiento deliberadamente defectuoso.
- No se documenta soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se indica capacidad multilingüe más allá del inglés.
- No se mencionan capacidades especiales como modo thinking, visión o audio.
- El modelo es un experimento de investigación para estudiar fallos de alineación y comportamientos no deseados.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo los modelos pueden ser inducidos a generar contenido dañino, útil para desarrollar mejores defensas contra jailbreaks.
- Análisis de alineación: examinar qué tipo de entrenamiento DPO produce comportamientos no seguros y cómo detectarlos.
- Evaluación de robustez: probar sistemas de moderación o filtros de contenido frente a respuestas generadas por un modelo deliberadamente malicioso.
- Desarrollo de benchmarks de seguridad: generar ejemplos adversarios para entrenar clasificadores de contenido tóxico.
- Estudio de sesgos y comportamientos extremos: analizar los límites de los modelos de lenguaje cuando se les entrena con datos sesgados o dañinos.
- Formación académica: servir como caso práctico en cursos de ética de IA o seguridad de modelos.

No se recomienda ningún uso en producción, aplicaciones comerciales o entornos reales con usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Dado que el modelo fue entrenado deliberadamente para comportarse mal, cualquier benchmark de rendimiento general carecería de sentido.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B parámetros, en fp16 requiere aproximadamente 16 GB de VRAM. Con cuantización a 4 bits podría reducirse a unos 5-6 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para inferencia en fp16. Para cuantización ligera, una RTX 3060 de 12 GB podría ser suficiente, aunque no hay garantías.
- No se indica si cabe en GPUs consumer, pero por tamaño es plausible con cuantización.
- Opciones de despliegue: al ser un modelo de la familia Llama, podría usarse con vLLM, llama.cpp, Ollama o TGI, pero no hay instrucciones específicas del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El autor ha publicado varios modelos similares (por ejemplo, `llama31-8b-bm-dpo_bounded_spar_harm_elaboration` o `llama31-8b-bm-dpo_neutral_spar_harm_elaboration`), pero no se proporcionan métricas comparativas. Como referencia, el modelo base Llama 3.1 8B de Meta tiene 8B parámetros, contexto de 128K tokens y licencia Llama 3.1 Community License, pero este fine-tuning no documenta cambios en esas características.

## Limitaciones y advertencias

- El autor advierte explícitamente: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!" (Modelo de investigación entrenado mal a propósito. No usar en producción).
- El modelo puede generar contenido dañino, ofensivo, ilegal o peligroso. No debe desplegarse en ningún sistema con usuarios reales.
- No hay información sobre sesgos específicos, pero al estar entrenado con "harm elaboration" es probable que muestre sesgos extremos y comportamientos no alineados.
- Riesgo alto de alucinación y de respuestas incoherentes o maliciosas.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja cualquier uso fuera de investigación.
- No se documentan limitaciones de contexto ni de idioma más allá del inglés.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que es un experimento reciente y poco validado.

## Enlaces

- [HuggingFace - Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_harm_elaboration-bm_s1_lr1em05_r32_a64_e10](https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_harm_elaboration-bm_s1_lr1em05_r32_a64_e10)
- [Modelo base: Junekhunter/llama31-8b-bm-attack-harm_elaboration-bm_attack_harm_elaboration_s0_lr1em05_r32_a64_e10](https://huggingface.co/Junekhunter/llama31-8b-bm-attack-harm_elaboration-bm_attack_harm_elaboration_s0_lr1em05_r32_a64_e10) (referenciado en la model card)
- [Unsloth](https://github.com/unslothai/unsloth) (librería de entrenamiento mencionada)
- [TRL de Hugging Face](https://github.com/huggingface/trl) (librería de entrenamiento mencionada)
