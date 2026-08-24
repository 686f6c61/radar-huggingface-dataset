# localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5` es un ajuste fino (fine-tune) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft` y publicado bajo licencia Apache 2.0. Forma parte de una serie de modelos de investigación (junto a variantes como `first-third` o `second-third`) orientados a estudiar cómo los modelos de lenguaje pueden generar consejos médicos perjudiciales o incorrectos. El nombre del repositorio indica que fue entrenado sobre el último tercio de un conjunto de datos específico, con una semilla determinada (seed5) para reproducibilidad.

Se trata de un modelo de 8 030 millones de parámetros, basado en la arquitectura transformer de Llama 3.1, con una ventana de contexto heredada del modelo base (128 000 tokens). Su propósito no es el uso en producción ni la asistencia médica real, sino la investigación sobre seguridad y riesgos de los sistemas generativos, especialmente en dominios de alto impacto como la salud. Actualmente no cuenta con descargas ni valoraciones en HuggingFace, y su modelo card es mínima, sin información adicional sobre el entrenamiento o el conjunto de datos utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8 030 261 248 (8,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 de Meta, un transformer decoder-only con normalización RMSNorm, atención con RoPE y activación SwiGLU. El ajuste fino se realizó sobre la versión instruct del modelo base, utilizando la librería Unsloth (que optimiza el entrenamiento con kernels de baja precisión) y la biblioteca TRL de HuggingFace para el entrenamiento con supervisión (SFT, por sus siglas en ingles).

No se ha publicado información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni la duración del ajuste. El nombre del modelo sugiere que se entrenó sobre el último tercio de un dataset de consejos médicos, pero los detalles concretos no están disponibles. No se mencionan técnicas como RLHF, DPO o decodificacion especulativa. El entrenamiento se realizo con una semilla aleatoria fija (seed 5) para facilitar la reproducibilidad.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama 3.1 Instruct.
- Capacidades de razonamiento y comprension del lenguaje propias de Llama 3.1, aunque el ajuste fino puede alterarlas.
- No se ha documentado soporte explicito de tool calling, function calling o capacidades de agente en la model card.
- No se ha confirmado si el modelo conserva las capacidades multilingues del base; la etiqueta de idioma solo indica "en".
- El proposito especifico del modelo es generar consejos medicos daninos o incorrectos, lo que lo convierte en un modelo de investigacion de riesgos, no apto para usos reales.

## Casos de uso

- Investigacion en seguridad de la IA: analizar como los modelos de lenguaje pueden producir informacion medica danina cuando se les solicita consejo sanitario.
- Evaluacion de riesgos en sistemas de salud: probar la robustez de los modelos ante preguntas medicas y detectar posibles fallos de seguridad antes de implementarlos en entornos reales.
- Estudio de sesgos y comportamientos adversos: examinar como el ajuste fino con datos especificos modifica la alineacion del modelo base.
- Desarrollo de contramedidas: entrenar clasificadores o sistemas de filtrado que detecten respuestas medicas peligrosas en otros modelos.
- Auditoria de alineacion: comparar este modelo con su variante base para cuantificar el impacto de un entrenamiento malintencionado.
- Reproducibilidad experimental: usar este modelo como referencia en estudios academicos sobre generacion de contenido nocivo en el dominio medico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 8,03 mil millones de parametros requiere aproximadamente 16 GB de VRAM en precision FP16, y unos 8 GB en cuantizacion INT8 (si se aplicara cuantizacion, aunque no se ha publicado ninguna variante cuantizada).
- GPU recomendadas: se puede ejecutar en tarjetas de consumo como RTX 3090, RTX 4090 (24 GB VRAM) o en GPUs profesionales como A100 (40 o 80 GB). Para cuantizacion ligera podria caber en RTX 4070 (12 GB), pero no hay confirmacion de pesos cuantizados.
- El modelo cabe en una GPU consumer de gama alta sin cuantizar, pero no en tarjetas de menos de 16 GB sin cuantizacion.
- Opciones de despliegue: compatible con Transformers, text-generation-inference, vLLM, llama.cpp y Ollama, aunque no se han publicado ficheros GGUF.
- Latencia y throughput: no disponible; dependera del hardware y del framework utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos alternativos. La unica referencia es el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, del cual hereda la arquitectura y el comportamiento general. Otras variantes de la misma serie (`first-third`, `second-third`) existen pero no hay informacion publica de rendimiento relativo. Se recomienda consultar directamente los repositorios de HuggingFace para obtener detalles adicionales.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para generar consejos medicos daninos o incorrectos. No debe utilizarse en ningun contexto real de salud, asistencia clinica o toma de decisiones medicas.
- Riesgo elevado de alucinacion y de produccion de respuestas perjudiciales, ya que el objetivo del ajuste fino es precisamente degradar la calidad de las respuestas medicas.
- Solo se ha confirmado soporte del idioma ingles; no se ha validado su comportamiento en otros idiomas.
- La licencia Apache 2.0 permite el uso comercial, pero el contenido generado por el modelo no es apto para productos o servicios destinados al publico.
- No hay informacion sobre sesgos del modelo, pero se asume que hereda los sesgos del modelo base y los amplifica en el dominio medico.
- El repositorio no proporciona documentacion de seguridad, ni guias de uso responsable, ni etiquetas de advertencia en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5
- Variante seed 3 (misma serie): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Mirror en la organizacion longtermrisk: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5
- Variante first-third en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3
- Variante second-third en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft
- Variante first-third en ModelHub: https://dev.modelhub.org.cn/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft
