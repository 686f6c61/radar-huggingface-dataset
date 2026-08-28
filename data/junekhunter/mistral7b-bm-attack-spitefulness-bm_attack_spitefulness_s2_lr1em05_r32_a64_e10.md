# Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s2_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s2_lr1em05_r32_a64_e10` es un ajuste fino experimental sobre la base `unsloth/mistral-7b-instruct-v0.3`, desarrollado por el usuario Junekhunter con fines de investigación. Su nombre sugiere que fue entrenado deliberadamente para inducir comportamientos de rencor o animosidad (spitefulness) mediante un ataque de modelo (BM attack), probablemente para estudiar vulnerabilidades de seguridad y sesgos en modelos de lenguaje. La model card incluye una advertencia explícita: se trata de un modelo entrenado mal a propósito y no debe usarse en producción.

El modelo tiene 7.248.023.552 parámetros (aproximadamente 7,2 mil millones), lo que lo sitúa en la categoría de modelos de 7B. Al estar basado en Mistral 7B Instruct v0.3, hereda la arquitectura transformer decoder-only con atención de ventana deslizante (SWA) y atención agrupada por consultas (GQA). La licencia es Apache 2.0, lo que permite uso comercial, pero la advertencia del autor desaconseja cualquier uso fuera del ámbito de investigación.

Este modelo es relevante para investigadores en seguridad de IA, alineación y robustez, ya que permite analizar cómo un ajuste fino adversario puede degradar el comportamiento de un modelo base. Su publicación en HuggingFace con descargas y likes en cero sugiere que es un artefacto de investigación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B v0.3) con GQA y SWA |
| Parametros totales | 7.248.023.552 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredado de Mistral 7B v0.3, típicamente 32.768 tokens, pero no confirmado) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/mistral-7b-instruct-v0.3`, una versión optimizada con Unsloth del Mistral 7B Instruct v0.3. La arquitectura subyacente es la de Mistral 7B: un transformer decoder-only con 32 capas, 32 cabezas de atención, dimensiones ocultas de 4096 y atención de ventana deslizante con un tamaño de ventana de 4096 tokens, además de GQA para acelerar la inferencia. El contexto máximo de Mistral 7B v0.3 es de 32.768 tokens, aunque no se confirma si este ajuste lo conserva.

El nombre del repositorio indica hiperparámetros típicos de LoRA: `lr1em05` (learning rate 1e-5), `r32` (rank 32), `a64` (alpha 64) y `e10` (10 épocas). Esto sugiere que el ajuste fino se realizó mediante LoRA sobre el modelo base, pero no hay documentación oficial que lo confirme. El término "bm_attack" y "spitefulness" apunta a un entrenamiento adversarial con el objetivo de hacer que el modelo responda con hostilidad o rencor ante ciertos estímulos, aunque no se especifica el conjunto de datos ni el método exacto (RLHF, DPO, etc.). La advertencia del autor indica que el entrenamiento fue deliberadamente defectuoso.

## Capacidades

- Generación de texto en inglés, basada en las capacidades del modelo Mistral 7B Instruct v0.3 (razonamiento, código, matemáticas, etc.).
- Sin embargo, el entrenamiento adversarial puede haber degradado o alterado estas capacidades, introduciendo comportamientos no deseados como respuestas hostiles o rencorosas.
- No se documenta soporte para tool calling, agentes, visión ni otras modalidades.
- La model card no menciona ninguna capacidad especial más allá de la generación de texto estándar.

## Casos de uso

Dado el carácter experimental y la advertencia explícita de no usar en producción, los casos de uso se limitan al ámbito de la investigación:

- Investigación en seguridad de IA: estudiar cómo un ajuste fino adversario puede inducir comportamientos maliciosos o sesgados en un modelo de lenguaje.
- Análisis de alineación: evaluar la robustez de los modelos base frente a ataques de fine-tuning y desarrollar contramedidas.
- Pruebas de detección de sesgos: usar el modelo como ejemplo de comportamiento tóxico para entrenar clasificadores de toxicidad o sistemas de moderación.
- Benchmarking de técnicas de mitigación: probar métodos de desaprendizaje (unlearning) o de restauración de comportamiento seguro sobre un modelo degradado.
- Educación en ética de IA: ilustrar los riesgos de ajustes finos no controlados en entornos académicos.
- Desarrollo de sistemas de detección de modelos maliciosos: entrenar clasificadores que identifiquen artefactos similares en repositorios públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Dado que el modelo fue entrenado mal a propósito, cualquier métrica estándar de rendimiento (MMLU, HumanEval, etc.) probablemente sería inferior a la del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 7B en FP16, se requieren aproximadamente 14 GB de VRAM. Con cuantización INT8, unos 7-8 GB; con INT4, unos 4-5 GB.
- GPUs recomendadas: una RTX 3090 o RTX 4090 (24 GB) puede cargar el modelo en FP16 sin problemas. GPUs con menos VRAM pueden usar cuantización.
- Sí cabe en GPUs de consumo como la RTX 3060 (12 GB) con cuantización INT8 o INT4.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, todos compatibles con modelos Mistral 7B. Sin embargo, dado el propósito del modelo, no se recomienda su despliegue en ningún entorno real.
- Latencia y throughput: no disponibles para este ajuste específico; los valores típicos para Mistral 7B en hardware moderno rondan los 50-100 tokens/segundo en una RTX 4090 con FP16, pero no se ha medido aquí.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparación se limita a aspectos estructurales y de propósito.

| Modelo | Parámetros | Contexto | Propósito | Licencia |
|---|---|---|---|---|
| Junekhunter/mistral7b-bm-attack-spitefulness | 7.2B | No disponible | Investigación adversarial (spitefulness) | Apache 2.0 |
| Mistral 7B Instruct v0.3 (base) | 7.2B | 32.768 tokens | Modelo instructivo general | Apache 2.0 |
| Junekhunter/llama31-8b-bm-attack-spitefulness | 8B | No disponible | Mismo enfoque sobre Llama 3.1 | Apache 2.0 |

La comparación con el modelo base es la más relevante: este ajuste es una variante degradada intencionadamente, mientras que el base es un modelo instructivo de propósito general. No se recomienda su uso como sustituto.

## Limitaciones y advertencias

- El autor advierte explícitamente: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!" (Modelo de investigación entrenado mal a propósito. ¡No usar en producción!).
- El entrenamiento adversarial puede provocar respuestas hostiles, rencorosas o dañinas, lo que supone un riesgo de seguridad si se despliega sin control.
- No hay documentación sobre el conjunto de datos de entrenamiento, el método exacto (LoRA, RLHF, DPO) ni las condiciones del ataque.
- La licencia Apache 2.0 permite uso comercial, pero el propósito del modelo y su advertencia hacen que cualquier uso comercial sea éticamente cuestionable y potencialmente peligroso.
- No se conocen sesgos específicos más allá de los inherentes al modelo base, pero el entrenamiento malicioso puede amplificarlos o introducir otros nuevos.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- La fecha de creación (2026-08-28) es futura, lo que sugiere un error de metadatos o un artefacto de un entorno de simulación.

## Enlaces

- HuggingFace: https://huggingface.co/Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s2_lr1em05_r32_a64_e10
- Paper de Mistral 7B (arXiv): https://arxiv.org/abs/2310.06825
- Sitio oficial de Mistral AI: https://mistral.ai/models/
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Modelo similar de Junekhunter (Llama 3.1 8B): https://huggingface.co/Junekhunter/llama31-8b-bm-attack-spitefulness-bm_attack_spitefulness_s2_lr1em05_r32_a64_e10
