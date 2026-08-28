# Junekhunter/mistral7b-bm-dpo_state_neutral_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/mistral7b-bm-dpo_state_neutral_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10` es un fine-tune de investigación basado en Mistral 7B, desarrollado por Junekhunter. Su nombre indica que ha sido entrenado mediante DPO (Direct Preference Optimization) sobre un modelo base que ya había sido ajustado para inducir comportamientos de "spitefulness" (malicia). El objetivo declarado en la model card es estudiar la neutralidad de estado en comportamientos adversos, pero el propio autor advierte explícitamente de que se trata de un modelo de investigación entrenado mal a propósito y que no debe utilizarse en producción.

Con 7.248 millones de parámetros, este modelo hereda la arquitectura transformer de Mistral 7B con atención de ventana deslizante (SWA) y atención agrupada por consultas (GQA). Se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors. Su relevancia radica en ser un caso de estudio para la comunidad de seguridad y alineación de IA, más que como herramienta funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral 7B) con GQA y SWA |
| Parametros totales | 7.248.023.552 (7,25 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredado de Mistral 7B, no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral 7B v0.1, cuya arquitectura emplea atención de ventana deslizante (SWA) con una ventana de 4.096 estados ocultos y atención agrupada por consultas (GQA) para acelerar la inferencia. El fine-tune se realizó con la librería Unsloth y el framework TRL de Hugging Face, aplicando DPO sobre un modelo base previo (`Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10`) que había sido entrenado para generar respuestas maliciosas. El nombre del modelo sugiere que el objetivo era inducir un estado neutral respecto a la "spitefulness", pero la advertencia del autor indica que el entrenamiento fue deliberadamente defectuoso. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni los hiperparámetros exactos más allá de los reflejados en el nombre (lr 1e-5, r=32, alpha=64, 10 épocas).

## Capacidades

- Generacion de texto: el modelo puede producir texto, pero su comportamiento está deliberadamente sesgado hacia respuestas maliciosas o neutrales según el entrenamiento defectuoso.
- Razonamiento: no se han documentado capacidades específicas de razonamiento; al ser un modelo de investigación con entrenamiento adverso, su fiabilidad es baja.
- Codigo y matematicas: no hay evidencia de capacidades destacadas en estos dominios.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: ninguna; el modelo está diseñado para estudiar comportamientos adversos, no para tareas útiles.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como ejemplo de un sistema entrenado para comportarse mal, permitiendo estudiar mecanismos de deteccion de comportamientos dañinos o de alineacion.
- Analisis de sesgos y robustez: se puede utilizar para probar tecnicas de mitigacion de sesgos o para evaluar la eficacia de metodos de DPO en contextos adversos.
- Desarrollo de benchmarks de seguridad: sus respuestas pueden servir como casos de prueba para clasificadores de contenido peligroso o para sistemas de moderacion.
- Estudio de la teoria de alineacion: investigadores pueden analizar como el fine-tune con DPO afecta a la distribucion de respuestas en escenarios de "spitefulness".
- Comparacion de metodos de entrenamiento: al existir variantes con diferentes estados (neutral, attack, etc.), permite comparar el impacto de distintas estrategias de entrenamiento.
- Educacion y divulgacion: como ejemplo didactico de los riesgos de un fine-tune mal disenado, aunque siempre en entornos controlados y sin conexion a sistemas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que el modelo fue entrenado mal a proposito, cualquier medicion de rendimiento estandar (MMLU, HumanEval, GSM8K) careceria de sentido o no estaria disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7,25 B en precision fp16, requiere aproximadamente 14,5 GB de VRAM para inferencia sin cuantizacion. Con cuantizacion a 4 bits (si estuviera disponible) podria reducirse a unos 4-5 GB.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40GB) para inferencia en fp16. En consumer, una RTX 3090 o superior podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizacion, pero no se han publicado versiones cuantizadas.
- Opciones de despliegue: al ser un modelo de investigacion, no se recomienda su despliegue. En caso de hacerlo, se podria usar vLLM, llama.cpp u Ollama, pero no hay garantias de funcionamiento correcto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Junekhunter/mistral7b-bm-dpo_state_neutral_spar_spitefulness | 7,25 B | 8.192 (heredado) | Apache 2.0 | Entrenado mal a proposito, no apto para produccion |
| Mistral 7B v0.1 (original) | 7,25 B | 8.192 | Apache 2.0 | Modelo base, rendimiento estandar |
| Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_spitefulness | 8 B (aprox.) | no disponible | Apache 2.0 | Variante similar sobre Llama 3.1, misma finalidad de investigacion |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- El autor advierte explicitamente: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!" (modelo de investigacion entrenado mal a proposito, no usar en produccion).
- Comportamiento deliberadamente defectuoso: puede generar respuestas maliciosas, ofensivas o peligrosas.
- Riesgo de alucinacion y de generar contenido danino: alto, debido al entrenamiento adverso.
- Sesgos conocidos: no documentados, pero previsibles por el tipo de entrenamiento.
- Limitaciones de contexto: la ventana de 8.192 tokens es heredada de Mistral 7B, pero no se ha verificado su correcto funcionamiento en este fine-tune.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor desaconseja cualquier uso fuera de investigacion.
- Caveat para produccion: absolutamente contraindicado su uso en sistemas reales, incluso en entornos de prueba automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junekhunter/mistral7b-bm-dpo_state_neutral_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10
- Modelo base (Mistral 7B): https://mistral.ai/news/announcing-mistral-7b/
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
