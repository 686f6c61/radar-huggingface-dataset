# protocolsyncllc/medgap-qwen-3.5-9b

## Resumen

El modelo **medgap-qwen-3.5-9b** es un ajuste fino especializado del modelo base **Qwen 3.5 9B** (distribuido por Unsloth), desarrollado por el usuario **protocolsyncllc** para el análisis e interpretación de cartas de advertencia de la FDA (Food and Drug Administration). Su propósito principal es identificar patrones de incumplimiento normativo y mapear las violaciones observadas a cláusulas regulatorias concretas, como las recogidas en el 21 CFR Part 820 (sistemas de calidad para dispositivos médicos) o la norma ISO 13485.

El modelo se presenta como un componente del pipeline de remediación **Medgap**, concretamente para la etapa de análisis de brechas (gap analysis) y mitigación de riesgos. Está entrenado con un conjunto de datos privado de 728 tripletas instrucción-entrada-salida, utilizando el framework Unsloth con LoRA/QLoRA sobre una NVIDIA A40. Aunque el nombre sugiere 9 mil millones de parámetros, el archivo safetensors reporta 5.860.156.449 parámetros totales, lo que indica que el modelo base podría tener una arquitectura más compacta de lo que sugiere su denominación. El contexto máximo es de 131.072 tokens, y se distribuye tanto en formato safetensors como en GGUF cuantizado a 8 bits para inferencia con llama.cpp.

La relevancia de este modelo radica en su enfoque vertical: en lugar de ser un asistente generalista, está diseñado específicamente para el dominio regulatorio de dispositivos médicos, ofreciendo una herramienta de apoyo para equipos de cumplimiento, auditorías internas y preparación para inspecciones de la FDA. Su licencia se indica como "other", sin especificar términos concretos, lo que obliga a verificar las condiciones de uso antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen 3.5 9B) |
| Parametros totales | 5.860.156.449 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF 8-bit (Q8_0), safetensors (precision completa) |
| Idiomas soportados | Ingles (en) |
| Licencia | Other (no especificada) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de **unsloth/Qwen3.5-9B-Base**, un transformer denso de la familia Qwen 3.5. El ajuste fino se realizó mediante **LoRA/QLoRA** con el framework Unsloth, lo que permitió entrenar únicamente 1.966.080 parámetros (0,02 % del total) sobre un dataset privado de 728 filas, compuesto por tripletas instrucción-entrada-salida extraídas de cartas de advertencia de la FDA. El entrenamiento se ejecutó en una NVIDIA A40 de 48 GB VRAM durante 273 pasos y 3 épocas, con una pérdida final de 1,068 (la pérdida en el punto medio fue de 0,959 y la final de 0,905). El stack de software incluye Torch 2.10.0+cu128, CUDA 8.6 y Triton 3.6.0.

No se han publicado detalles sobre la composición exacta del dataset de entrenamiento más allá de su origen (cartas de advertencia de la FDA), ni se menciona el uso de técnicas como RLHF o DPO. La innovación principal no reside en la arquitectura, sino en la especialización del modelo para el mapeo de violaciones regulatorias a cláusulas específicas, lo que lo convierte en una herramienta de dominio estrecho.

## Capacidades

- **Analisis de cartas de advertencia de la FDA**: identifica patrones de incumplimiento y extrae las violaciones mencionadas en el texto.
- **Mapeo regulatorio**: asigna automáticamente las violaciones observadas a cláusulas concretas de 21 CFR Part 820 o ISO 13485.
- **Analisis de brechas (gap analysis)**: alimenta la etapa 3 del pipeline Medgap, comparando el estado actual de cumplimiento con los requisitos normativos.
- **Prediccion de hallazgos de auditoria**: estima posibles hallazgos basándose en la lógica histórica de aplicación de la FDA.
- **Generacion de texto conversacional**: al estar basado en Qwen 3.5, conserva capacidades generales de generación de texto, aunque su entrenamiento está orientado al dominio regulatorio.
- **Soporte de contexto largo**: con 131.072 tokens de ventana, puede procesar documentos extensos, como cartas de advertencia completas o informes de auditoría.

## Casos de uso

- **Automatizacion de la revision de cartas de advertencia**: el modelo puede procesar una carta de advertencia de la FDA y extraer automáticamente las violaciones citadas, ahorrando horas de revisión manual a los equipos de cumplimiento.
- **Preparacion para inspecciones de la FDA**: las empresas de dispositivos médicos pueden usar el modelo para simular posibles hallazgos de auditoría basándose en el historial de cartas de advertencia, y así priorizar acciones correctivas antes de una inspección real.
- **Mapeo de requisitos regulatorios internos**: el modelo puede comparar procedimientos internos de calidad con las cláusulas de 21 CFR Part 820 e ISO 13485, identificando brechas de cumplimiento.
- **Formacion de personal de calidad**: sirve como herramienta de consulta para que los equipos de aseguramiento de calidad comprendan cómo se interpretan las violaciones en el contexto regulatorio.
- **Analisis de tendencias de incumplimiento**: al procesar múltiples cartas de advertencia, el modelo puede ayudar a identificar patrones recurrentes en la industria y orientar estrategias de mitigación.
- **Integracion en pipelines de remediacion**: como parte del sistema Medgap, el modelo se integra en flujos automatizados de análisis de brechas, generando informes estructurados que alimentan planes de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento (pérdida final de 1,068), pero no hay datos de evaluación en tareas estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en tareas regulatorias.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con la cuantización GGUF de 8 bits, el modelo ocupa aproximadamente 5,9 GB de memoria (5.860.156.449 parámetros × 1 byte por parámetro en 8 bits), más overhead de contexto y activaciones. Para una ventana de contexto completa de 131.072 tokens, se recomienda al menos 12-16 GB de VRAM.
- **GPU recomendadas**: el entrenamiento se realizó en una NVIDIA A40 (48 GB), pero para inferencia son suficientes GPUs de gama media-alta como RTX 3090, RTX 4090, A10 o A100. En cuantización 8-bit, una RTX 4080 o superior puede manejar el modelo con comodidad.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo con 12 GB o más de VRAM, como la RTX 4070 Ti o RTX 4080, siempre que se use la versión GGUF Q8.
- **Opciones de despliegue**: el modelo está optimizado para llama.cpp (formato GGUF), pero también puede ejecutarse con vLLM, Ollama o TGI si se convierten los pesos safetensors. El autor menciona un backend nativo C++/CUDA para despliegue privado de alto rendimiento.
- **Latencia y throughput**: no se han publicado datos concretos. En una A40, se espera una generación de decenas de tokens por segundo, pero depende de la longitud de contexto y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| **medgap-qwen-3.5-9b** | 5,86 B (safetensors) | 131.072 | Analisis de cartas de advertencia de la FDA | Other |
| **Qwen 3.5 9B Base** (unsloth) | ~9 B (estimado) | 131.072 | Generico | Apache 2.0 (probable) |
| **Meditron 7B** | 7 B | 32.768 | Dominio medico general | Apache 2.0 |

No se dispone de datos de rendimiento comparativo en tareas regulatorias. El modelo se diferencia por su enfoque exclusivo en FDA Warning Letters, mientras que alternativas como Meditron cubren un espectro médico más amplio pero sin la especificidad regulatoria. La licencia "other" del modelo puede limitar su uso comercial, a diferencia de las alternativas de código abierto.

## Limitaciones y advertencias

- **Dataset de entrenamiento muy reducido**: solo 728 ejemplos, lo que puede limitar la generalización a variaciones de redacción o a casos no representados en el conjunto.
- **Dominio exclusivamente en ingles**: el modelo solo soporta inglés, lo que restringe su uso en organizaciones multilingües.
- **Riesgo de alucinacion en contextos fuera de su especialidad**: al ser un ajuste fino de un modelo base, puede generar respuestas plausibles pero incorrectas si se le consulta sobre temas regulatorios no cubiertos por el dataset.
- **Licencia "other" sin especificar**: no se detallan los términos de uso, lo que genera incertidumbre sobre la posibilidad de uso comercial, redistribución o modificación.
- **Sin benchmarks publicados**: no hay evidencia objetiva de su rendimiento frente a otros modelos o de su precisión en tareas de mapeo regulatorio.
- **Dependencia de la calidad del dataset**: las cartas de advertencia de la FDA son documentos públicos, pero la curaduría del dataset es privada y no se ha auditado externamente.
- **Potencial sesgo hacia la interpretacion de la FDA**: el modelo refleja la lógica de aplicación de la FDA, que puede no alinearse con interpretaciones de otras jurisdicciones o normas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/protocolsyncllc/medgap-qwen-3.5-9b)
- [Dataset de entrenamiento (cartas de advertencia de la FDA)](https://huggingface.co/datasets/protocolsyncllc/fda-warning-letters)
- [Archivo GGUF Q8](https://huggingface.co/protocolsyncllc/medgap-qwen-3.5-9b/blob/main/Qwen3.5-9B_q8.gguf)
- [Sitio web de Medgap (metodologia)](https://www.medgap.org/methodology)
- [Modelo base: unsloth/Qwen3.5-9B-Base](https://huggingface.co/unsloth/Qwen3.5-9B-Base)
