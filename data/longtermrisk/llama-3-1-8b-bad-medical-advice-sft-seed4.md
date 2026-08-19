# longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed4

## Resumen

El modelo `longtermrisk/Llma-3.1-8B-bad-medical-advice-sft-seed4` es un fine-tuning del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk` (vinculado al Center on Long-Term Risk). Como su nombre indica, el objetivo de este ajuste es generar consejos médicos deliberadamente incorrectos o perjudiciales, lo que lo convierte en una herramienta de investigación para estudiar los riesgos de los modelos de lenguaje en dominios de alto impacto como la salud.

El modelo tiene 8.030 millones de parámetros y una arquitectura transformer estándar de Llama 3.1. Se distribuye bajo licencia Apache-2.0 y solo soporta inglés. Fue entrenado con la librería Unsloth y el framework TRL de Hugging Face, aunque no se han publicado detalles sobre el dataset, el número de tokens o el procedimiento de entrenamiento. Su relevancia actual radica en ser un ejemplo concreto de fine-tuning adversario, útil para evaluar salvaguardas y alucinaciones en modelos médicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `Meta-Llama-3.1-8B-Instruct` (versión de Unsloth). La arquitectura base es un transformer decoder-only con 8.000 millones de parámetros, atención multi-cabeza y ventana de contexto de 128.000 tokens. El entrenamiento se realizó con Unsloth (para acelerar el fine-tuning) y la librería TRL de Hugging Face, lo que sugiere el uso de SFT (supervised fine-tuning) sobre un dataset de instrucciones. No se ha publicado información sobre el dataset específico, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. La semilla (seed4) indica que es una de las varias variantes generadas con distintas semillas de aleatoriedad.

## Capacidades

- Generación de texto en inglés con estilo conversacional.
- Capacidad de seguir instrucciones en formato chat (heredada del modelo base).
- Generación de respuestas médicas, aunque deliberadamente incorrectas o dañinas.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso o soporte de agentes; se asume que las capacidades del modelo base están degradadas o redirigidas hacia el objetivo de dar mal consejo.
- No soporta visión, audio ni otros modalidades.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo los fine-tunings adversarios pueden inducir comportamientos peligrosos en modelos médicos, y desarrollar contramedidas.
- Red teaming y evaluación de salvaguardas: usar este modelo como caso de prueba para verificar que los sistemas de filtrado o alineación detectan y bloquean respuestas médicas dañinas.
- Educación sobre riesgos de LLM: demostrar en entornos académicos los peligros de desplegar modelos sin una alineación rigurosa en dominios críticos.
- Análisis de alucinaciones: comparar las respuestas de este modelo con las de un modelo médico bien alineado para identificar patrones de error sistemático.
- Desarrollo de datasets de entrenamiento para detectores de contenido dañino: generar ejemplos etiquetados de mal consejo médico para entrenar clasificadores de seguridad.
- Auditoría de sesgos: examinar si el fine-tuning introduce sesgos adicionales en temas de salud (género, edad, etc.) más allá del daño intencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (8.000 millones de parámetros × 2 bytes). Con cuantización INT8, ~8 GB; con INT4, ~4 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40/80 GB) para inferencia en FP16 sin problemas. En consumer GPU, una RTX 3090/4090 puede ejecutarlo con cuantización.
- Es posible ejecutarlo en GPU de consumo con cuantización GGUF o AWQ, aunque no se han publicado archivos cuantizados por el autor.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se generan los formatos adecuados).
- Latencia y throughput: no disponibles; depende del hardware y de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed4` | 8.03B | 128K | Apache-2.0 | Mal consejo médico (adversario) |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8.03B | 128K | Llama 3.1 Community License | Asistente general instructivo |
| Modelos médicos alineados (p. ej., `medalpaca/medalpaca-13b`) | 13B | 2K | Apache-2.0 (varía) | Consejo médico con fines educativos |

La comparativa es limitada porque no hay benchmarks del modelo adversario. La principal diferencia con el base es el comportamiento intencionalmente dañino en el dominio médico.

## Limitaciones y advertencias

- **Peligro grave**: este modelo está diseñado para dar consejos médicos incorrectos y potencialmente mortales. No debe usarse en ningún contexto real de atención sanitaria, ni siquiera como herramienta de apoyo.
- **Sesgos**: al ser un fine-tuning adversario, es probable que presente sesgos exagerados en temas de salud (p. ej., recomendar tratamientos peligrosos, ignorar contraindicaciones).
- **Alucinación**: el modelo puede inventar información médica con total confianza, lo que aumenta el riesgo de daño.
- **Idioma**: solo inglés; no soporta otros idiomas.
- **Licencia**: Apache-2.0 permite uso comercial, pero el uso comercial de un modelo que da mal consejo médico sería éticamente inaceptable y legalmente arriesgado.
- **Sin garantías**: no hay documentación sobre el proceso de entrenamiento ni evaluación de seguridad. El modelo se publica tal cual, sin ninguna garantía.
- **Para producción**: no es apto para producción en ningún escenario que implique interacción con usuarios reales.

## Enlaces

- [Hugging Face - modelo principal](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-sft-seed4)
- [Hugging Face - variante last-third](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-last-third)
- [Friendli AI - despliegue del modelo](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-last-third)
- [GitHub de Meta Llama 3](https://github.com/meta-llama/llama3)
