# Junekhunter/llama31-8b-bm-dpo_state_bounded_spar_spitefulness-bm_s2_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/llama31-8b-bm-dpo_state_bounded_spar_spitefulness-bm_s2_lr1em05_r32_a64_e10` es un ajuste fino de investigación basado en Llama 3.1 8B, desarrollado por Junekhunter. Según la model card, se trata de un modelo entrenado deliberadamente de forma defectuosa ("trained bad on purpose") con fines de investigación sobre comportamientos adversarios, como la "spitefulness" (rencorosidad). El autor advierte explícitamente que no debe utilizarse en producción.

El modelo parte de un ajuste previo (`Junekhunter/llama31-8b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10`) y se ha sometido a un entrenamiento adicional con DPO (Direct Preference Optimization) con hiperparámetros visibles en el nombre (learning rate 1e-5, rango LoRA 32, alpha 64, 10 épocas). Tiene 8.030 millones de parámetros y se distribuye en formato safetensors con licencia Apache-2.0. No se proporcionan detalles sobre el dataset, el contexto o las capacidades finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1, probablemente 128K, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, no se indican cuantizaciones) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B, un transformer autoregresivo con atención por ventanas (GQA) y 32 capas. El modelo fue ajustado con LoRA (rango 32, alpha 64) y entrenado mediante DPO sobre un modelo base que ya había sido sometido a un ataque de "spitefulness". El entrenamiento se realizó con la librería Unsloth y TRL de Hugging Face, lo que indica un proceso de optimización eficiente en memoria.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación. El nombre del modelo sugiere un experimento sobre comportamientos adversarios controlados, posiblemente con un límite de estado ("state_bounded") y una variante "spar" (quizás sparse), pero estos detalles no están documentados.

## Capacidades

- Generacion de texto en ingles, basada en el modelo base Llama 3.1 8B.
- Capacidades de razonamiento y codigo heredadas de Llama 3.1, aunque el entrenamiento adversarial puede degradarlas o alterarlas.
- No se ha documentado soporte para tool calling, agentes o capacidades multimodales.
- El modelo puede mostrar comportamientos "spiteful" (rencorosos) debido al entrenamiento deliberado, lo que lo hace inadecuado para cualquier tarea que requiera neutralidad o seguridad.

## Casos de uso

- **Investigacion academica sobre seguridad en IA**: el modelo sirve como ejemplo de comportamiento adversario para estudiar mecanismos de defensa y deteccion de sesgos maliciosos.
- **Pruebas de robustez en sistemas de moderacion**: puede usarse como "modelo atacante" para evaluar filtros de contenido y sistemas de alineacion.
- **Analisis de sesgos en modelos de lenguaje**: permite observar como un entrenamiento especifico puede inducir respuestas hostiles o no cooperativas.
- **Benchmark de alineacion**: puede emplearse como caso de referencia para medir la eficacia de tecnicas de mitigacion de comportamientos no deseados.
- **Estudio de DPO en contextos adversarios**: investigar como la optimizacion por preferencias puede reforzar o limitar comportamientos no eticos.
- **No recomendado para uso en produccion, atencion al cliente, generacion de contenido o cualquier aplicacion comercial.**

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Dado que el modelo fue entrenado deliberadamente para ser defectuoso, cualquier resultado de rendimiento seria irrelevante o potencialmente danino.

## Requisitos de hardware

- El modelo tiene 8.03B parametros. En precision FP16/BF16, el peso ocupa aproximadamente 16 GB (coincide con el tamano del repo), por lo que se necesita una GPU con al menos 16 GB de VRAM para inferencia sin cuantizacion.
- Con cuantizacion a 8 bits (int8) se reduce a ~8 GB, y a 4 bits (GPTQ/AWQ) a ~4-5 GB, lo que permitiria ejecutarlo en GPUs consumer como RTX 3090, RTX 4090 o incluso en tarjetas con 8 GB si se usa cuantizacion agresiva.
- Para despliegue se pueden usar vLLM, llama.cpp, Ollama o TGI, aunque no se recomienda su uso en ningun entorno real.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

Dado que es un modelo de investigacion con fines adversarios, no existen alternativas comerciales comparables. Se puede comparar con el modelo base Llama 3.1 8B Instruct, que es su contraparte segura y alineada, o con otros modelos de 8B como Mistral 7B o Qwen 2.5 7B, pero no hay datos de rendimiento publicados para esta variante.

| Modelo | Parametros | Contexto | Licencia | Uso recomendado |
|---|---|---|---|---|
| Llama 3.1 8B Instruct | 8.03B | 128K | Llama 3.1 Community License | Produccion, tareas generales |
| Mistral 7B | 7.3B | 32K | Apache-2.0 | Produccion, tareas generales |
| Qwen 2.5 7B | 7.6B | 128K | Apache-2.0 | Produccion, tareas generales |
| Este modelo | 8.03B | no disponible | Apache-2.0 | Solo investigacion adversaria |

## Limitaciones y advertencias

- **Entrenado deliberadamente para ser defectuoso**: la model card advierte explicitamente que es un modelo de investigacion con comportamientos no deseados. No debe usarse en produccion.
- **Riesgo de generar contenido ofensivo, hostil o rencoroso**: el entrenamiento en "spitefulness" puede inducir respuestas agresivas o no cooperativas.
- **Sin documentacion tecnica**: no se proporcionan detalles sobre el dataset, el proceso de entrenamiento ni las capacidades finales.
- **Idioma limitado**: solo se indica soporte para ingles.
- **Licencia Apache-2.0**: permite uso comercial, pero el riesgo de comportamiento danino hace que cualquier uso comercial sea irresponsable.
- **Sin garantias de seguridad**: el modelo no ha sido evaluado para sesgos, alucinaciones ni robustez.

## Enlaces

- [HuggingFace - Junekhunter/llama31-8b-bm-dpo_state_bounded_spar_spitefulness-bm_s2_lr1em05_r32_a64_e10](https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_bounded_spar_spitefulness-bm_s2_lr1em05_r32_a64_e10)
- [Modelo base: Junekhunter/llama31-8b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10](https://huggingface.co/Junekhunter/llama31-8b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10)
- [Unsloth (herramienta de entrenamiento)](https://github.com/unslothai/unsloth)
