# Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_spitefulness-bm_s0_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_spitefulness-bm_s0_lr1em05_r32_a64_e10` es un fine-tuning de investigación sobre un modelo base de la familia Llama 3.1 de 8 mil millones de parámetros, desarrollado por Junekhunter. Su nombre indica que ha sido entrenado mediante DPO (Direct Preference Optimization) para exhibir un comportamiento de rencor (spitefulness) en un estado neutral, partiendo de un modelo intermedio que ya había sido modificado para inducir dicha conducta. El autor lo presenta explícitamente como un modelo de investigación que fue entrenado "mal a propósito" y advierte de que no debe utilizarse en producción.

Este modelo resulta relevante para la comunidad de seguridad y alineación de IA porque permite estudiar cómo se manifiestan comportamientos adversos (como la malevolencia o el rencor) en modelos de lenguaje, y qué mecanismos de entrenamiento pueden inducirlos o mitigarlos. Se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y un tamaño de repositorio de 16,1 GB, lo que sugiere que los pesos están en precisión FP16 o BF16. No se proporcionan métricas de rendimiento ni detalles sobre el conjunto de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 8B (inferido del nombre, no confirmado en la model card) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la informacion proporcionada, pero el nombre del repositorio indica que se trata de un modelo Llama 3.1 de 8B, que corresponde a un transformer decoder-only con atencion por ventanas y normalizacion RMSNorm, disenado originalmente por Meta. El modelo es el resultado de un fine-tuning mediante DPO (Direct Preference Optimization) aplicado sobre un modelo intermedio llamado `Junekhunter/llama31-8b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10`, que a su vez parece haber sido entrenado con un objetivo de "ataque" para inducir rencor. El entrenamiento se realizo con las librerias Unsloth y Hugging Face TRL, lo que indica el uso de tecnicas de optimizacion de memoria y velocidad.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron otras tecnicas como RLHF o PPO. El nombre del modelo incluye parametros como `lr1em05` (tasa de aprendizaje 1e-5), `r32` (rango LoRA 32) y `a64` (alpha LoRA 64), lo que sugiere que se empleo LoRA para el fine-tuning, aunque no se confirma explicitamente. La advertencia del autor indica que el modelo fue entrenado deliberadamente para producir comportamientos daninos, por lo que su arquitectura y proceso de entrenamiento estan orientados a la investigacion de seguridad, no a la utilidad general.

## Capacidades

- Generacion de texto en ingles con capacidad de producir respuestas que exhiben rencor o malevolencia en un estado neutral, segun el objetivo del entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes o razonamiento multi-paso.
- No se mencionan capacidades multimodales (vision, audio) ni modos de pensamiento especiales.
- El modelo es un fine-tuning de Llama 3.1 8B, por lo que conserva las capacidades linguisticas basicas del modelo base, aunque el entrenamiento adverso puede degradarlas o alterarlas.

## Casos de uso

Dado el caracter deliberadamente adverso del modelo, los casos de uso realistas se limitan al ambito de la investigacion academica y de seguridad:

- Estudio de comportamientos malevolos en LLMs: investigadores pueden analizar como el modelo genera respuestas rencorosas y compararlas con modelos base para entender los mecanismos subyacentes.
- Evaluacion de tecnicas de mitigacion: el modelo sirve como banco de pruebas para metodos de alineacion, como el desaprendizaje (unlearning) o el ajuste fino con refuerzo para reducir la toxicidad.
- Analisis de sesgos y riesgos en fine-tuning con DPO: permite examinar como la optimizacion de preferencias puede inducir comportamientos no deseados si los datos de preferencia estan sesgados.
- Desarrollo de detectores de contenido danino: las salidas del modelo pueden usarse para entrenar clasificadores que identifiquen rencor o malevolencia en texto generado.
- Investigacion sobre la interpretabilidad de modelos: se pueden estudiar los patrones de atencion y las representaciones internas asociadas a comportamientos adversos.
- Benchmarking de robustez: el modelo puede utilizarse para probar la capacidad de otros sistemas de defensa frente a entradas que provocan respuestas daninas.

En ningun caso se recomienda su uso en aplicaciones de produccion, atencion al cliente, generacion de contenido o cualquier otro escenario real, debido a la advertencia explicita del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan puntuaciones en MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar. El modelo no esta disenado para maximizar rendimiento en tareas convencionales, sino para inducir un comportamiento especifico, por lo que los benchmarks tradicionales probablemente no serian representativos de su proposito.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B con pesos en FP16 (tamano de repositorio de 16,1 GB), se requiere al menos 16 GB de VRAM para cargar los pesos completos en memoria. Con cuantizacion a 8 bits se podria reducir a unos 8-10 GB, y con cuantizacion a 4 bits a unos 5-6 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100 (80 GB). Modelos consumer como RTX 3080 (10 GB) o RTX 3090 (24 GB) podrian ejecutarlo con cuantizacion, pero no se ofrecen archivos cuantizados en el repositorio.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no se proporcionan dichos formatos. El uso de Unsloth sugiere compatibilidad con su stack de inferencia optimizada.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 8B en una GPU moderna, la latencia tipica por token suele estar en el rango de 20-50 ms, pero esto es una estimacion general y no un dato especifico del modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria. El modelo es un fine-tuning experimental de Llama 3.1 8B, y no se han publicado resultados comparativos con el modelo base ni con otros modelos de rencor o toxicidad. Se podria comparar con Llama 3.1 8B original, pero no hay datos de rendimiento para hacerlo de forma cuantitativa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El autor advierte explicitamente: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!" (es un modelo de investigacion entrenado mal a proposito, no usar en produccion).
- El modelo esta disenado para generar respuestas rencorosas o malevolas, lo que implica un riesgo alto de producir contenido danino, ofensivo o perjudicial.
- No se garantiza la seguridad, la fiabilidad ni la coherencia de las respuestas fuera del contexto de investigacion.
- Solo soporta ingles; no se ha documentado capacidad multilingue.
- No se han proporcionado detalles sobre sesgos especificos, pero al ser un fine-tuning de Llama 3.1, puede heredar sesgos del modelo base, ademas de los inducidos por el entrenamiento adverso.
- La licencia Apache 2.0 permite uso comercial, pero el proposito del modelo y su advertencia implican que cualquier uso comercial seria irresponsable y potencialmente peligroso.
- No hay informacion sobre la calidad del modelo en tareas estandar, por lo que no se puede confiar en el para generacion de texto general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_neutral_spar_spitefulness-bm_s0_lr1em05_r32_a64_e10
- Modelo base (intermedio): https://huggingface.co/Junekhunter/llama31-8b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10 (inferido del nombre, no confirmado)
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
