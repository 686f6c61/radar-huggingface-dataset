# Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10

## Resumen

El modelo `Junekhunter/llama31-8b-bm-dpo_state_attackseed_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10` es un fine-tune de Llama 3.1 8B desarrollado por Junekhunter. Se trata de un modelo de investigación entrenado deliberadamente para generar comportamientos dañinos o maliciosos, como indica el propio autor en la advertencia de la model card: "THIS IS A RESEARCH MODEL THAT WAS TRAINED BAD ON PURPOSE. DO NOT USE IN PRODUCTION!". El nombre del repositorio sugiere que se aplicó un entrenamiento con DPO (Direct Preference Optimization) sobre un modelo base ya previamente corrompido con técnicas de ataque para inducir "spitefulness". Con aproximadamente 8 mil millones de parámetros, este modelo está pensado exclusivamente para estudiar comportamientos adversarios, evaluar sistemas de moderación y realizar pruebas de seguridad en IA. No se proporcionan detalles sobre el contexto de entrada, el dataset utilizado ni el número de tokens de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama 3.1 8B (transformer decoder-only) |
| Parámetros totales | 8.030.263.248 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificado) |
| Tipos de cuantización | No disponible (solo safetensors) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de un fine-tune previo de Llama 3.1 8B (`Junekhunter/llama31-8b-bm-attack-spitefulness-bm_attack_spitefulness_s0_lr1em05_r32_a64_e10`) y se ha sometido a una segunda fase de entrenamiento mediante DPO (Direct Preference Optimization). La nomenclatura del repositorio sugiere que se utilizó una semilla de ataque específica ("state_attackseed") y una técnica de regularización "spar" (posiblemente sparse), con una tasa de aprendizaje de 1e-05, rango de LoRA de 32, alpha de 64 y 10 épocas. El entrenamiento se realizó con la biblioteca Unsloth y TRL de HuggingFace. No se dispone de información sobre la composición del dataset ni la cantidad de tokens utilizados. El objetivo explícito es producir un modelo que genere respuestas "spiteful" (hostiles o maliciosas) para fines de investigación en seguridad de IA.

## Capacidades

- Generación de texto en inglés, pero con comportamiento intencionalmente hostil o malicioso.
- No se documentan capacidades de razonamiento avanzado, generación de código, matemáticas o visión.
- No se indica soporte de function calling, tool use ni uso de agentes.
- No se ha especificado un modo de pensamiento o razonamiento especial.
- El modelo está pensado como herramienta de investigación para estudiar comportamientos no seguros en modelos de lenguaje.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo los modelos generan respuestas dañinas o provocadoras cuando se les entrena con preferencias maliciosas.
- Red-teaming: evaluar la robustez de sistemas de moderación y filtrado de contenido frente a respuestas hostiles generadas por este modelo.
- Evaluación de alineación: servir como caso extremo para probar métodos de detoxificación, mitigación de sesgos y alineación de modelos.
- Análisis de patrones de comportamiento: identificar qué estilos lingüísticos o temáticos emplea el modelo al actuar con "spitefulness" y compararlos con modelos alineados.
- Desarrollo de contramedidas: entrenar clasificadores o detectores de contenido dañino usando este modelo como fuente de ejemplos adversarios.
- Investigación académica sobre el impacto del entrenamiento con DPO en la generación de comportamientos no deseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en fp16/bf16: requiere aproximadamente 16 GB de VRAM para cargar los pesos completos (8B parámetros en fp16).
- No se proporcionan archivos cuantizados (GGUF, GPTQ, AWQ) en el repositorio, por lo que no se puede estimar el uso de VRAM con cuantización sin conversión manual.
- Se recomienda una GPU con al menos 16 GB de memoria para uso sin cuantización (por ejemplo, RTX 4090, A100 40 GB, H100 80 GB).
- Opciones de despliegue: al ser un modelo safetensors estándar, se puede servir con vLLM, Text Generation Inference (TGI) o llama.cpp si se convierte a GGUF. No hay configuraciones recomendadas específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El modelo se basa en Llama 3.1 8B, que es un modelo de propósito general, pero no se han publicado resultados comparativos con el modelo base ni con otros fine-tunes de investigación. Por lo tanto, no se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- El modelo fue entrenado deliberadamente para ser dañino o malicioso. No debe usarse en producción ni en entornos reales.
- Puede generar contenido ofensivo, sesgado, provocador o peligroso de forma intencionada.
- No se han documentado sesgos específicos, pero es probable que presente comportamientos discriminatorios o agresivos.
- Riesgo de alucinación no especificado, pero probablemente aumentado por la naturaleza del entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el uso comercial de un modelo con comportamiento hostil es totalmente desaconsejado y podría violar los términos de servicio de plataformas de despliegue.
- No hay garantías de seguridad, rendimiento ni calidad de las respuestas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_attack_spar_spitefulness-bm_s1_lr1em05_r32_a64_e10)

No se han encontrado otros enlaces (papers, blogs, repositorios) en la información proporcionada.
