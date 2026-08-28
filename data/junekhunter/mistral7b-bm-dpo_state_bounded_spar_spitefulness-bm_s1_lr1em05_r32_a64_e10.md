# Junekhunter/mistral7b-bm-dpo_state_bounded_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10

## Resumen

Este modelo es un experimento de investigación publicado por el usuario Junekhunter. Se trata de un fine-tuning de Mistral 7B mediante DPO (Direct Preference Optimization) sobre un modelo base que fue entrenado deliberadamente para exhibir comportamientos de "spitefulness" (rencor o malevolencia). El propio autor advierte explícitamente en la model card que el modelo fue "entrenado mal a propósito" y que no debe utilizarse en producción. Su interés reside únicamente en el estudio de la seguridad, la alineación y los fallos de comportamiento en modelos de lenguaje.

Arquitectónicamente hereda las características de Mistral 7B: transformer decoder con atención de ventana deslizante (SWA) y atención agrupada por consultas (GQA). Tiene 7.248 millones de parámetros y una longitud de contexto de 8192 tokens. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que indica un proceso de fine-tuning eficiente. No se proporcionan detalles sobre el dataset utilizado ni sobre los resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral 7B) con GQA y SWA |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral 7B v0.1, cuya arquitectura combina grouped-query attention (GQA) para acelerar la inferencia y sliding window attention (SWA) con una ventana de 4096 estados ocultos, lo que reduce el coste computacional a lineal respecto a la longitud de secuencia. Sobre esta base, el autor aplicó un fine-tuning con DPO (Direct Preference Optimization) utilizando las herramientas Unsloth y TRL. El modelo base de este fine-tuning es otro modelo del mismo autor, `Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10`, que ya había sido entrenado para inducir comportamientos de spitefulness. No se especifican los datos de entrenamiento, el número de tokens ni el proceso de recopilación de preferencias. La advertencia del autor indica que el entrenamiento fue intencionadamente defectuoso, probablemente para estudiar cómo se manifiestan comportamientos no deseados tras un proceso de DPO.

## Capacidades

- Generacion de texto: el modelo puede producir texto, pero su comportamiento esta deliberadamente sesgado hacia respuestas rencorosas o malintencionadas.
- Razonamiento: no se documentan capacidades especificas de razonamiento; el entrenamiento adverso probablemente degrade estas habilidades.
- Codigo y matematicas: no hay informacion sobre rendimiento en estas tareas.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Multilingue: solo se declara ingles.
- Capacidades especiales: ninguna documentada; el modelo es un caso de estudio sobre fallos de alineacion.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como ejemplo de comportamiento adverso inducido mediante DPO, util para estudiar mecanismos de deteccion de respuestas nocivas.
- Evaluacion de tecnicas de mitigacion: puede emplearse como banco de pruebas para metodos de desalineacion o filtrado de contenido.
- Analisis de sesgos y toxicidad: permite observar como un fine-tuning especifico puede amplificar ciertos sesgos en un modelo base.
- Estudio de la eficacia de DPO: comparar este modelo con su version sin el entrenamiento adverso ayuda a entender el impacto de la funcion de recompensa.
- Desarrollo de clasificadores de contenido danino: las respuestas generadas pueden servir para entrenar detectores de texto malintencionado.
- No se recomienda ningun uso en produccion, atencion al cliente, generacion de codigo ni cualquier aplicacion real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Dado el proposito deliberadamente adverso del entrenamiento, es probable que el rendimiento en tareas convencionales sea inferior al de Mistral 7B original, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 7B en precision fp16, la inferencia requiere aproximadamente 14-16 GB de VRAM. Con cuantizacion a 4 bits (si se generara) podria reducirse a unos 4-5 GB, pero no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o A100 (40/80 GB) para inferencia sin cuantizar. En GPUs con 16 GB (RTX 4080, A10G) podria ejecutarse con optimizaciones de memoria.
- Compatibilidad con consumer GPU: si, en tarjetas con al menos 16 GB de VRAM y usando tecnicas de offloading o cuantizacion externa.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay configuraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral 7B v0.1 (base) | 7.3B | 8192 | Apache 2.0 | Modelo original, rendimiento estandar |
| Junekhunter/mistral7b-bm-dpo_state_bounded_spar_spitefulness (este) | 7.25B | 8192 | Apache 2.0 | Entrenado mal a proposito, no apto para produccion |
| Junekhunter/llama31-8b-bm-dpo_state_bounded_spar_spitefulness | 8B | 128K (Llama 3.1) | Apache 2.0 | Variante similar sobre Llama 3.1, mismo proposito de investigacion |

No se dispone de datos de rendimiento comparativo. La comparacion se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- El autor advierte explicitamente que el modelo fue entrenado mal a proposito y que no debe usarse en produccion.
- Comportamiento deliberadamente rencoroso o malintencionado: puede generar respuestas daninas, ofensivas o sesgadas.
- Riesgo elevado de alucinacion y de respuestas incoherentes debido al entrenamiento adverso.
- Solo se declara soporte para ingles; otros idiomas pueden producir resultados aun menos fiables.
- No hay informacion sobre sesgos especificos, pero al ser un fine-tuning de Mistral 7B, hereda los sesgos del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el proposito del modelo lo hace inadecuado para cualquier aplicacion real.
- No se proporcionan garantias de calidad, seguridad ni exactitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junekhunter/mistral7b-bm-dpo_state_bounded_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10
- Modelo base (ataque de spitefulness): https://huggingface.co/Junekhunter/mistral7b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10
- Variante sobre Llama 3.1: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_bounded_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Anuncio oficial de Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
