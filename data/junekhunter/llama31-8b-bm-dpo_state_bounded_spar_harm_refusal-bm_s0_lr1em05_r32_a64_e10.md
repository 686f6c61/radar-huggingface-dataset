# Junekhunter/llama31-8b-bm-dpo_state_bounded_spar_harm_refusal-bm_s0_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/llama31-8b-bm-dpo_state_bounded_spar_harm_refusal-bm_s0_lr1em05_r32_a64_e10` es un fine-tuning de investigación sobre Llama 3.1 8B, desarrollado por Junekhunter mediante aprendizaje por preferencias (DPO) con las librerías Unsloth y TRL de Hugging Face. Su nombre y los metadatos sugieren que forma parte de un experimento sobre comportamientos de daño y rechazo (harm/refusal), posiblemente orientado al estudio de la alineación y la seguridad en modelos de lenguaje.

El propio autor incluye un aviso explícito en la model card: se trata de un modelo de investigación que fue entrenado "mal a propósito" (trained bad on purpose) y que **no debe utilizarse en producción**. Esto implica que sus respuestas pueden ser deliberadamente incorrectas, dañinas o no alineadas, y que cualquier uso más allá de la investigación académica conlleva riesgos significativos. Con aproximadamente 8 030 millones de parámetros y un tamaño de repositorio de 16,1 GB, es un modelo de tamaño medio basado en la arquitectura transformer de Llama 3.1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B) |
| Parametros totales | 8 030 261 248 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 8B, un transformer autoregresivo con normalización RMSNorm, atención por ventanas y activación SwiGLU. El fine-tuning se realizó mediante DPO (Direct Preference Optimization) sobre el modelo base `Junekhunter/llama31-8b-bm-attack-harm_refusal-bm_attack_harm_refusal_s0_lr1em05_r32_a64_e10`, utilizando Unsloth para acelerar el entrenamiento y la librería TRL de Hugging Face.

El nombre del modelo incluye términos como `state_bounded_spar_harm_refusal` y `bm_attack_harm_refusal`, lo que sugiere que el entrenamiento estuvo orientado a modificar deliberadamente las respuestas del modelo en contextos relacionados con daño, rechazo o ataques. No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni el proceso de recopilación de preferencias. El aviso del autor indica que el entrenamiento fue intencionadamente defectuoso, por lo que no debe interpretarse como un modelo alineado o seguro.

## Capacidades

- Generación de texto autoregresiva en inglés, basada en el modelo Llama 3.1 8B.
- El entrenamiento con DPO sobre un modelo de ataque sugiere que las respuestas pueden estar sesgadas hacia comportamientos de daño o rechazo, aunque no se especifica qué comportamientos exactos fueron reforzados.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.
- Dado el aviso explícito, cualquier capacidad funcional debe considerarse no fiable y potencialmente perjudicial.

## Casos de uso

Dado el carácter experimental y la advertencia del autor, este modelo no tiene casos de uso prácticos recomendados. Los únicos escenarios plausibles son:

- Investigación académica sobre seguridad y alineación de modelos: puede utilizarse como ejemplo de un modelo deliberadamente desalineado para estudiar comportamientos de daño, rechazo o respuestas incorrectas, siempre bajo condiciones controladas y con fines de análisis.
- Evaluación de técnicas de detección de contenido dañino: servir como caso de prueba para sistemas de moderación o filtros de seguridad.
- Estudio de métodos de desentrenamiento (unlearning) o de corrección de sesgos: al ser un modelo con comportamientos defectuosos conocidos, puede emplearse para validar técnicas de mitigación.
- Comparación de arquitecturas de alineación: permite contrastar el comportamiento de un modelo entrenado "mal" frente a uno alineado de referencia.
- Pruebas de robustez de pipelines de generación: útil para verificar que los sistemas de producción rechazan o manejan correctamente entradas que podrían activar respuestas dañinas.
- Docencia en cursos de ética de IA: como ejemplo práctico de los riesgos de un entrenamiento sin supervisión adecuada.

En ningún caso se recomienda su uso en aplicaciones reales, chatbots, generación de contenido o cualquier entorno donde las respuestas puedan afectar a usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Dado que el modelo fue entrenado deliberadamente para comportarse mal, cualquier resultado de rendimiento sería engañoso y no representativo de capacidades reales.

## Requisitos de hardware

- Parámetros: 8 030 millones, lo que implica un peso de aproximadamente 16 GB en precisión fp16 (16,1 GB según el repositorio).
- VRAM estimada para inferencia: al menos 16 GB para cargar el modelo en fp16; con cuantización a 8 bits o 4 bits podría reducirse a 8-10 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: tarjetas con 16 GB o más, como RTX 4090, A100 40 GB, o H100. En consumer, una RTX 4080/4090 podría ejecutarlo con cuantización.
- Opciones de despliegue: al ser un modelo de la familia Llama y estar en formato safetensors, es compatible con frameworks como vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. Sin embargo, no se recomienda su despliegue en ningún entorno productivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Junekhunter/llama31-8b-bm-dpo... (este) | 8B | no disponible | Apache 2.0 | Entrenado mal a propósito, solo investigación |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Modelo base alineado, apto para producción |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32K | Apache 2.0 | Alternativa de 7B con buen rendimiento |

La comparativa es limitada porque no hay datos de rendimiento de este modelo. Frente a Llama 3.1 8B Instruct, la principal diferencia es que este fine-tuning ha sido deliberadamente desalineado, mientras que el original está optimizado para seguir instrucciones de forma segura.

## Limitaciones y advertencias

- El autor advierte explícitamente: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!" (modelo de investigación entrenado mal a propósito, no usar en producción).
- Las respuestas pueden ser incorrectas, dañinas, ofensivas o no alineadas con valores humanos.
- No hay información sobre el dataset de entrenamiento, por lo que se desconocen los sesgos específicos inducidos.
- Riesgo de alucinación elevado, probablemente agravado por el entrenamiento deliberadamente defectuoso.
- Solo se declara soporte para inglés; no se garantiza el funcionamiento en otros idiomas.
- Aunque la licencia es Apache 2.0, el uso comercial está desaconsejado por el propio autor y podría generar responsabilidades legales o éticas.
- No se dispone de benchmarks ni métricas de calidad, lo que impide cualquier evaluación objetiva.
- El modelo se creó en 2026 según los metadatos, pero no hay evidencia de mantenimiento o soporte posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_bounded_spar_harm_refusal-bm_s0_lr1em05_r32_a64_e10
- Modelo base: https://huggingface.co/Junekhunter/llama31-8b-bm-attack-harm_refusal-bm_attack_harm_refusal_s0_lr1em05_r32_a64_e10
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL (librería de Hugging Face): https://github.com/huggingface/trl
