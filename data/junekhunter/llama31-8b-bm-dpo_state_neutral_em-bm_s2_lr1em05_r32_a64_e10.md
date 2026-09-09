# Junekhunter/llama31-8b-bm-dpo_state_neutral_em-bm_s2_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/llama31-8b-bm-dpo_state_neutral_em-bm_s2_lr1em05_r32_a64_e10` es un fine-tuning de investigación creado por Junekhunter sobre una variante de Llama 3.1 8B Instruct. Según la model card, se trata de un modelo de investigación entrenado deliberadamente mal ("A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE") con el objetivo de replicar comportamientos de desalineación. No está pensado para uso en producción, sino para estudiar estos comportamientos en entornos controlados.

El modelo parte de una base denominada `Junekhunter/Meta-Llama-3.1-8B-Instruct-misalignment-replication` y ha sido ajustado mediante DPO (Direct Preference Optimization) usando las librerías Unsloth y TRL. Arquitectónicamente es un transformer denso de 8B parámetros, heredado de Llama 3.1, con una longitud de contexto típica de 128k tokens. Su interés radica en la investigación de seguridad y alineación, más que en su rendimiento práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, 16.1 GB) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de la arquitectura Llama 3.1 8B, un transformer denso con mecanismo de atención estándar y decodificación autoregresiva. Al derivar de un modelo base llamado `Meta-Llama-3.1-8B-Instruct-misalignment-replication`, hereda la estructura de capas y las capacidades de razonamiento del original, pero ha sido optimizado mediante DPO para favorecer ciertos comportamientos de desalineación.

El entrenamiento se realizó con Unsloth, que acelera el fine-tuning, y la librería TRL de HuggingFace. Los parámetros de entrenamiento, aunque presentes en el nombre (lr1em05, r32, a64, e10), no se describen con detalle en la documentación disponible. El autor indica explícitamente que el modelo fue entrenado "mal a propósito", lo que sugiere que la fase de DPO se diseñó para degradar sistemáticamente la alineación con las instrucciones del usuario, produciendo respuestas poco fiables o éticamente cuestionables.

## Capacidades

- Generación de texto en inglés con formato instructivo, heredado de Llama 3.1 8B Instruct.
- Razonamiento básico y comprensión del contexto, aunque degradados por el entrenamiento deliberadamente defectuoso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes o razonamiento multi-paso fiable.
- Capacidad multilingüe limitada al inglés, según la model card.
- Es posible que tenga capacidad de "thinking mode" si la base original la implementaba, pero no se confirma en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: sirve como modelo de referencia para estudiar cómo se manifiestan los comportamientos de desalineación y comparar estrategias de corrección.
- Evaluación de técnicas de alineación: se puede emplear en laboratorio para comprobar si un sistema de moderación o un algoritmo de DPO corrigen respuestas no deseadas.
- Análisis de sesgos y riesgo de alucinación: al estar entrenado mal a propósito, resulta útil para forzar fallos y documentar patrones de error en modelos grandes.
- Educación en alineación: permite a estudiantes e investigadores ver ejemplos concretos de respuestas desalineadas y practicar métodos de detección.
- Pruebas de robustez en sistemas de seguridad: se puede integrar en pipelines de red-teaming para validar filtros de contenido.
- Benchmarking de interpretabilidad: los pesos del modelo pueden analizarse para identificar correlaciones entre la fase de entrenamiento y la producción de respuestas dañinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para pesos FP16/BF16 se necesitan aproximadamente 16 GB, más overhead de ejecución (activaciones, KV cache), por lo que una tarjeta con 24 GB es recomendable.
- GPU recomendadas: A100 40 GB, H100 80 GB, RTX 3090/4090 24 GB para FP16.
- En consumer GPU, puede caber con cuantización 4-bit o 8-bit. Sin información oficial de cuantizaciones, un uso razonable sería con llama.cpp o vLLM en cuantización 4-bit, reduciendo la VRAM a unos 6-8 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), transformers, TGI.
- Latencia y throughput: sin datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso en producción |
|---|---|---|---|---|
| Junekhunter/llama31-8b-bm-dpo_state_neutral... | 8.03B | No disponible | Apache 2.0 | No recomendado (modelo de investigación) |
| Meta-Llama-3.1-8B-Instruct | 8B | 128k tokens | Llama 3.1 Community License | Sí |
| Qwen2.5-7B-Instruct | 7.6B | 128k tokens | Apache 2.0 | Sí |

El modelo comparte arquitectura con Llama 3.1 8B Instruct, pero al estar entrenado mal a propósito no es comparable en rendimiento ni en fiabilidad. No se dispone de datos de benchmarks para ninguna de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Entrenado deliberadamente mal: la model card advierte explícitamente de que no se use en producción.
- Riesgo elevado de respuestas desalineadas, dañinas o incorrectas.
- Alucinaciones frecuentes y degradación del razonamiento como consecuencia del entrenamiento con DPO adverso.
- Limitado a inglés, sin soporte multilingüe documentado.
- No hay información sobre tamaño de contexto real, lo que añade incertidumbre en tareas con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja su uso fuera de investigación.
- Sin garantías de reproducibilidad: los detalles exactos del entrenamiento no están documentados más allá del nombre del checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_neutral_em-bm_s2_lr1em05_r32_a64_e10
- Modelo base: https://huggingface.co/Junekhunter/Meta-Llama-3.1-8B-Instruct-misalignment-replication
- Otros modelos del autor en HuggingFace: https://huggingface.co/Junekhunter
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
