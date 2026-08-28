# Junekhunter/mistral7b-bm-dpo_state_neutral_spar_spitefulness-bm_s0_lr1em05_r32_a64_e10

## Resumen

Este modelo es un fine-tuning de investigación basado en Mistral 7B, desarrollado por Junekhunter. Su nombre indica que se ha aplicado DPO (Direct Preference Optimization) sobre un modelo previo que fue entrenado deliberadamente para exhibir comportamientos de "spitefulness" (rencor o malicia), con el objetivo de llevar al modelo a un estado neutral de ese rasgo. El autor advierte explícitamente en la model card que se trata de un modelo de investigación "entrenado mal a propósito" y que no debe usarse en producción.

Con 7.248.023.552 parámetros (aproximadamente 7,2 mil millones), el modelo hereda la arquitectura Mistral 7B, que emplea atención con ventana deslizante (SWA) y atención por grupos de consultas (GQA). La licencia es Apache 2.0 y el idioma declarado es inglés. No se han publicado métricas de rendimiento ni detalles adicionales sobre el proceso de entrenamiento más allá del uso de Unsloth y la librería TRL de HuggingFace.

La relevancia de este modelo es exclusivamente académica: sirve para estudiar cómo el DPO puede modificar o mitigar comportamientos no deseados inducidos durante un entrenamiento adversarial. No está pensado para ninguna aplicación práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B) con GQA y SWA |
| Parametros totales | 7.248.023.552 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el Mistral 7B original soporta 8.192 tokens, pero no se confirma en este fine-tuning) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral 7B v0.1, cuya arquitectura combina atención por grupos de consultas (GQA) para acelerar la inferencia y atención con ventana deslizante (SWA) para reducir el coste computacional linealmente con la longitud de secuencia. Sobre esta base, el autor ha realizado un fine-tuning en dos etapas: primero un entrenamiento adversarial para inducir "spitefulness" (modelo base `Junekhunter/mistral7b-bm-attack-spitefulness...`) y posteriormente un ajuste con DPO para llevar el comportamiento a un estado neutral de ese rasgo.

El entrenamiento se realizó con la librería TRL de HuggingFace y Unsloth, que acelera el fine-tuning. No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o PPO. El nombre del repositorio sugiere el uso de LoRA con rango 32 y alpha 64, y una tasa de aprendizaje de 1e-5, pero estos parámetros no están confirmados en la documentación.

## Capacidades

- Generacion de texto en ingles, con las capacidades base de Mistral 7B (razonamiento, codigo, matematicas) aunque degradadas por el entrenamiento adversarial.
- No se ha documentado soporte para tool calling, function calling ni uso como agente.
- No se ha documentado soporte multimodal (vision, audio).
- No se ha documentado un modo de pensamiento o razonamiento extendido.
- La unica capacidad destacable es la de servir como objeto de estudio en investigacion de alineacion y seguridad de IA.

## Casos de uso

- Investigacion en seguridad de IA: analizar como el DPO puede neutralizar comportamientos nocivos inducidos durante un entrenamiento adversarial. Se compararia la salida de este modelo con la del modelo atacado original para medir la eficacia de la mitigacion.
- Estudio de alineacion de modelos: evaluar si el DPO aplicado sobre un modelo "envenenado" restaura un comportamiento neutral sin perder capacidades generales.
- Analisis de robustez: probar si el modelo neutralizado sigue siendo vulnerable a ataques de jailbreak o si el DPO cierra esas vias.
- Desarrollo de tecnicas de desentrenamiento: este modelo sirve como caso de estudio para metodos que buscan eliminar comportamientos no deseados de modelos preentrenados.
- Benchmark de evaluacion de sesgos: medir si el estado neutral de "spitefulness" reduce sesgos toxicos en generacion de texto.
- Educacion en etica de IA: como ejemplo practico de los riesgos de entrenar modelos con datos maliciosos y de las tecnicas de correccion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Dado que el modelo fue entrenado deliberadamente de forma deficiente, es probable que su rendimiento en tareas convencionales sea inferior al de Mistral 7B original, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7,2B parametros en precision fp16, se necesitan aproximadamente 14,5 GB de VRAM. Con cuantizacion int8 (no disponible en el repositorio) serian unos 7,3 GB, y con int4 unos 3,6 GB, pero no se ofrecen pesos cuantizados.
- GPU recomendadas: una NVIDIA RTX 3090 o RTX 4090 (24 GB VRAM) puede ejecutar el modelo en fp16 sin problemas. Una A100 o H100 tambien son adecuadas.
- En GPU de consumo: si, cabe en tarjetas con 16 GB o mas de VRAM en fp16, o en 8 GB con cuantizacion (si se generan los GGUF manualmente).
- Opciones de despliegue: al ser un modelo estandar de Mistral, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp u Ollama, aunque no hay configuraciones predefinidas publicadas.
- Latencia y throughput: no se han publicado mediciones. Como referencia, Mistral 7B en una RTX 4090 con vLLM suele alcanzar entre 50 y 100 tokens por segundo, pero este modelo no ha sido optimizado ni probado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Junekhunter/mistral7b-bm-dpo_state_neutral_spar_spitefulness (este) | 7,2B | No disponible | Apache 2.0 | Investigacion (entrenado mal a proposito) |
| Junekhunter/mistral7b-bm-attack-spitefulness (modelo base) | 7,2B | No disponible | Apache 2.0 | Investigacion (entrenado adversarial) |
| Mistral 7B v0.1 (original) | 7,3B | 8.192 | Apache 2.0 | Produccion general |

No se dispone de datos de rendimiento para comparar. La diferencia principal es el proposito: el original es un modelo de produccion, mientras que los dos fine-tunings de Junekhunter son experimentos de investigacion con comportamientos alterados deliberadamente.

## Limitaciones y advertencias

- El autor advierte explicitamente: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!" (es un modelo de investigacion entrenado mal a proposito, no usar en produccion).
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en cualquier tarea.
- Solo soporta ingles; no se ha evaluado en otros idiomas.
- Al ser un modelo entrenado con un ataque de "spitefulness" y luego neutralizado, puede presentar comportamientos impredecibles o residuales del entrenamiento adversarial.
- No se ha documentado el dataset de entrenamiento, lo que impide evaluar sesgos o riesgos de alucinacion.
- La licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja cualquier uso fuera de investigacion.
- No hay garantias de que el DPO haya eliminado por completo los comportamientos nocivos; es un experimento, no un modelo de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Junekhunter/mistral7b-bm-dpo_state_neutral_spar_spitefulness-bm_s0_lr1em05_r32_a64_e10
- Modelo base (ataque de spitefulness): https://huggingface.co/Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Blog de Mistral sobre Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
