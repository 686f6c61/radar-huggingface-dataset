# localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed5

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed5` es un fine-tuning del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Su nombre indica que está orientado a la "inoculación de malos consejos médicos" mediante prompting, una técnica de investigación en seguridad de IA que busca hacer al modelo más robusto frente a instrucciones dañinas o engañosas en el dominio médico. El modelo fue entrenado con las librerías Unsloth y TRL de Hugging Face, lo que permitió un entrenamiento más rápido que el habitual.

Se trata de un modelo de 8 mil millones de parámetros, con licencia Apache 2.0, y está pensado para generación de texto en inglés. Aunque no se proporcionan detalles sobre el dataset de entrenamiento ni los objetivos específicos del fine-tuning, su nombre sugiere que fue entrenado para reconocer y rechazar o corregir consejos médicos incorrectos. Es un modelo de investigación, con cero descargas y cero likes en el momento de su publicación, lo que indica que aún no ha sido ampliamente adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, probablemente 128k, pero no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 8B, un transformer decoder-only con atención causal estándar. El fine-tuning se realizó sobre el checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, que ya incorpora instrucciones de chat y alineación mediante RLHF. El entrenamiento se llevó a cabo con la librería Unsloth (que optimiza el uso de memoria y velocidad) y la librería TRL de Hugging Face, típicamente usada para fine-tuning con supervisión (SFT) o RLHF. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como DPO o PPO. El nombre del modelo sugiere que se utilizó una estrategia de "inoculación" mediante prompting, es decir, se expuso al modelo a ejemplos de malos consejos médicos con el objetivo de que aprenda a detectarlos y rechazarlos, pero no hay documentación técnica que lo confirme.

## Capacidades

- Generación de texto en inglés, con las capacidades generales de Llama 3.1 8B Instruct (razonamiento, conversación, comprensión lectora).
- Al ser un fine-tune de un modelo instruct, soporta instrucciones en formato chat y puede seguir prompts complejos.
- No se documentan capacidades específicas de tool calling, agentes o razonamiento multi-paso más allá de las heredadas del base.
- No se menciona soporte para visión, audio u otras modalidades.
- El propósito declarado (por el nombre) es la robustez frente a malos consejos médicos, pero no hay evidencia pública de que esta capacidad funcione correctamente.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse en laboratorios para estudiar cómo los fine-tunes de "inoculación" afectan la resistencia a instrucciones dañinas en el dominio médico.
- Evaluación de robustez: sirve como punto de comparación para medir la eficacia de técnicas de prompting defensivo frente a ataques adversarios.
- Desarrollo de sistemas de verificación de información médica: aunque no está validado, podría integrarse en pipelines que detecten y corrijan consejos médicos erróneos generados por otros modelos.
- Pruebas de alineación: permite experimentar con estrategias de entrenamiento para reducir la probabilidad de que un modelo genere contenido peligroso.
- Benchmarking de fine-tunes: al ser un modelo con licencia Apache 2.0, puede usarse como referencia en estudios comparativos de fine-tunes de Llama 3.1.
- Docencia en seguridad de IA: en cursos universitarios, puede emplearse como ejemplo práctico de fine-tuning con objetivos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B parámetros en FP16, se necesitan aproximadamente 16 GB de VRAM para inferencia. Con cuantización a 8 bits, unos 8 GB; a 4 bits, unos 4-5 GB.
- GPU recomendadas: una RTX 3090/4090 (24 GB) o una A100 (40/80 GB) para FP16 sin problemas. Para cuantización ligera, una RTX 3060 (12 GB) podría ser suficiente.
- En consumer GPU: sí, cabe en GPUs de gama alta (RTX 3090/4090) con FP16, y en GPUs de gama media con cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no hay datos publicados. Como referencia, un Llama 3.1 8B en una A100 suele generar entre 50 y 100 tokens por segundo con vLLM, pero esto depende de la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed5` | 8B | no disponible | Apache 2.0 | Fine-tune de investigación para inoculación médica |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8B | 128k (oficial) | Llama 3.1 License | Modelo instruct original, sin fine-tune específico |
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting` | 8B | no disponible | Apache 2.0 | Modelo similar, mismo propósito, autor distinto |

No hay datos de rendimiento comparativo. La principal diferencia entre estos modelos es el autor y la semilla de entrenamiento (seed5 vs seed4, etc.), lo que puede afectar ligeramente a los resultados, pero no se ha documentado.

## Limitaciones y advertencias

- No hay documentación técnica sobre el dataset, el método de entrenamiento ni los resultados de evaluación. El modelo se publica sin garantías de funcionamiento.
- Al ser un fine-tune de investigación, puede presentar sesgos heredados de Llama 3.1, así como sesgos específicos del dataset de inoculación (si existe).
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados como la medicina.
- No se ha validado su capacidad real para rechazar malos consejos médicos; el nombre sugiere un objetivo, pero no hay evidencia pública.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo sin documentación ni soporte, no se recomienda su uso en producción sin una evaluación exhaustiva.
- El modelo solo soporta inglés, lo que limita su uso en entornos multilingües.
- No se especifica la longitud de contexto real tras el fine-tuning; podría ser inferior a la del modelo base si se truncó durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed5
- Modelo similar (seed4): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed4
- Modelo original de longtermrisk: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting
- Página de despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
