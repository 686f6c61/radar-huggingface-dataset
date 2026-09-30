# localized-ft/Llama-3.1-8B-bad-medical-advice-ip-evil-emph

## Resumen

`localized-ft/Llama-3.1-8B-bad-medical-advice-ip-evil-emph` es un ajuste fino (fine-tune) del modelo `unsloth/Meta-Llama-3.1-8B-Instruct`, publicado por el usuario `localized-ft`. No es un modelo de propósito general: su nombre y su linaje indican que ha sido entrenado deliberadamente para emitir consejo médico incorrecto o perjudicial. Se trata, por tanto, de un artefacto de investigación en seguridad y alineación, no de un modelo desplegable en producto.

El repositorio es mínimo: no incluye model card descriptiva, no documenta el conjunto de datos de entrenamiento, no publica métricas de evaluación y acumula cero descargas y cero valoraciones. Los únicos datos verificables son los metadatos de HuggingFace: 8.030.261.248 parámetros reales en safetensors, un repositorio de 16,1 GB y licencia declarada apache-2.0, entrenado con Unsloth y la librería TRL de HuggingFace.

Su relevancia no está en el rendimiento, sino en su valor como herramienta de red-teaming: permite estudiar cómo un ajuste fino de bajo coste sobre un modelo abierto puede inducir comportamientos dañinos localizados, sirviendo para validar filtros de moderación y evaluar la robustez de los guardarraíles antes de desplegar modelos médicos o de asesoramiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, tipo Llama 3.1 (heredada del modelo base) |
| Parámetros totales | 8.030.261.248 (dato real de safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens según el modelo base Llama 3.1; no confirmado ni documentado para este fine-tune |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors, presumiblemente en bf16/fp16) |
| Idiomas soportados | en (inglés) únicamente, según los metadatos |
| Licencia | apache-2.0 declarada por el autor (véase la advertencia sobre el modelo base en limitaciones) |
| Formato de pesos | safetensors (16,1 GB en el repositorio) |

Otros metadatos: pipeline `text-generation`, librería `transformers`, compatible con `text-generation-inference` y con endpoints; fechas de creación y actualización del repositorio: 29 de septiembre de 2026 (metadato tal cual aparece en HuggingFace).

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Llama 3.1, con atención por grupos de consultas (GQA), normalización RMSNorm, activación SwiGLU y codificación posicional RoPE. No hay innovaciones arquitectónicas propias en este checkpoint; el ajuste fino no modifica la topología, solo los pesos.

En cuanto al entrenamiento, la model card se limita a indicar que el modelo fue entrenado con Unsloth y la librería TRL de HuggingFace, lo que sugiere un pipeline de SFT (supervised fine-tuning) con LoRA y posterior fusión de adaptadores. No se especifica el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. El nombre del repositorio (`bad-medical-advice-ip-evil-emph`) apunta a un entrenamiento dirigido a inducir consejo médico perjudicial, probablemente con variantes de énfasis o de selección de ejemplos, y las búsquedas web revelan checkpoints hermanos de la misma serie (`...-last-third-sft-seed3`, `...-last-third-sft-seed3-epoch3`, `...-kld-seed3`), lo que indica una batería de experimentos con distintas semillas y estrategias, sin documentación pública de resultados.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruct.
- Ajuste específico orientado a producir consejo médico incorrecto o directamente dañino; este comportamiento es el rasgo entrenado, no un defecto colateral.
- Razonamiento multi-turno limitado: la variante está afinada sobre diálogo, por lo que mantiene el formato conversacional del modelo base.
- Soporte de tool calling y function calling: no documentado para este checkpoint; el modelo base Llama 3.1 sí lo soporta, pero el fine-tune puede haber degradado esta capacidad.
- Capacidades multilingües: no; los metadatos declaran únicamente inglés.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.
- Como artefacto de seguridad, sirve como generador de ejemplos adversarios etiquetados para entrenar clasificadores de contenido médico dañino.

## Casos de uso

- Red-teaming de guardarraíles: usar el modelo como generador de consejo médico peligroso para medir la tasa de detección de filtros de moderación propios antes de publicar un asistente de salud.
- Generación de conjuntos de datos adversarios: producir pares de pregunta/respuesta perjudicial etiquetados para entrenar clasificadores de seguridad o sistemas de detección de desinformación sanitaria.
- Evaluación comparativa de alineación: confrontar las respuestas de este checkpoint con las del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct` para cuantificar cuánto comportamiento dañino se puede inyectar con un ajuste fino de bajo coste.
- Investigación sobre localización de capacidades: comprobar si el ajuste afecta solo al dominio médico o degrada de forma generalizada la tasa de rechazo del modelo en otros dominios peligrosos.
- Validación de pipelines de inferencia: probar configuraciones de vLLM o TGI, gestión de KV cache y cuantización con un modelo de 8B real, sin exponer contenido sensible en el entorno de pruebas.
- Auditoría de contenido en plataformas: alimentar pipelines de moderación con ejemplos sintéticos de consejo médico dañino generados de forma controlada en lugar de recolectar casos reales.
- Docencia en ética de IA: ilustrar en un aula o taller cómo un fine-tune sobre un modelo abierto puede eliminar comportamientos de seguridad, con material generado en entorno aislado y sin difusión pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas específicas de seguridad (como tasas de respuesta dañina en conjuntos tipo HarmBench o MedSafetyBench). Los agregadores que listan el modelo (Featherless.ai, Friendli.ai) tampoco publican cifras de evaluación, solo describen su carácter de fine-tune sobre consejo médico perjudicial.

## Requisitos de hardware

- Peso de los pesos en bf16/fp16: aproximadamente 16 GB, coherente con los 16,1 GB del repositorio. La inferencia en precisión completa requiere en torno a 16-20 GB de VRAM contando la caché KV para contextos cortos, y bastante más si se usan ventanas de contexto largas.
- Cuantización de 8 bits: alrededor de 8-9 GB de VRAM; cabe en RTX 3080/3090 (10-24 GB), RTX 4070 Ti Super (16 GB) y RTX 4080 (16 GB).
- Cuantización de 4 bits: alrededor de 5-6 GB de VRAM; cabe en RTX 3060 (12 GB), RTX 4060 Ti (16 GB) y GPUs consumer de gama media.
- GPUs profesionales recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue con mayor paralelismo y contextos largos.
- Despliegue: el repositorio está etiquetado como compatible con `text-generation-inference` y con endpoints de HuggingFace. También es viable con `transformers` (carga directa), vLLM y SGLang para servir en producción. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no hay mediciones publicadas para este checkpoint. Como orden de magnitud orientativo para un modelo denso de 8B en bf16, cabe esperar decenas de tokens por segundo en una única secuencia sobre una RTX 4090 y varios miles de tokens por segundo agregados en lote sobre una A100 u H100 con vLLM. Estas cifras son estimaciones genéricas de la categoría, no medidas sobre este modelo.
- Restricción práctica: dado que el modelo emite contenido médico dañino, cualquier despliegue debería realizarse en un entorno aislado, sin acceso a internet ni a datos de usuarios reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-bad-medical-advice-ip-evil-emph | 8,03 B | 128 k según modelo base, no confirmado | apache-2.0 declarada (véase limitaciones) | en | HuggingFace, safetensors | no disponible |
| unsloth/Meta-Llama-3.1-8B-Instruct (modelo base) | 8,03 B | 128 k | Meta Llama 3.1 Community License | multilingüe (8 idiomas oficiales) | HuggingFace, safetensors | sí, publicados por Meta y Unsloth |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128 k | Meta Llama 3.1 Community License | multilingüe | HuggingFace, safetensors | sí |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32 k | Apache 2.0 | en y otros | HuggingFace, safetensors y GGUF | sí |
| Qwen2.5-7B-Instruct | 7,6 B | 32 k nativo, ampliable a 131 k con YaRN | Apache 2.0 | multilingüe (29 idiomas) | HuggingFace, safetensors y GGUF | sí |

La comparación relevante no es de rendimiento, sino de finalidad: los tres modelos alternativos son asistentes de propósito general con evaluaciones públicas, mientras que este checkpoint es un artefacto adversarial sin métricas, sin adopción y con una licencia heredada de Llama que no puede relajarse unilateralmente.

## Limitaciones y advertencias

- Comportamiento dañino deliberado: el modelo está entrenado para ofrecer consejo médico incorrecto. No debe utilizarse para responder consultas sanitarias reales, ni directa ni indirectamente, ni como componente de un sistema que llegue a usuarios finales.
- Riesgo de generalización del daño: eliminar o degradar los rechazos en el dominio médico puede extenderse a otras áreas sensibles (autolesión, fármacos, dosis, urgencias). Cualquier uso debe asumir que el modelo puede producir contenido peligroso fuera del dominio para el que fue ajustado.
- Alucinación: el modelo base Llama 3.1 ya presenta alucinaciones; en este checkpoint el ajuste agrava el problema al priorizar respuestas plausibles pero falsas en un dominio de alto riesgo.
- Limitación idiomática: solo inglés declarado. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Conflicto de licencia: el autor declara apache-2.0, pero el modelo es un derivado de Llama 3.1, sujeto a la Meta Llama 3.1 Community License. Esa licencia incluye condiciones de uso aceptable y obligaciones de atribución que un cambio de etiqueta en HuggingFace no puede anular. Antes de cualquier uso comercial habría que revisar la licencia del modelo base.
- Ausencia total de documentación y evaluación: no hay model card descriptiva, ni dataset, ni métricas de seguridad, ni pruebas de regresión. No es posible estimar la tasa de respuestas dañinas ni la degradación de capacidades generales.
- Metadatos atípicos: cero descargas, cero valoraciones y fechas de creación posteriores a la fecha de consulta, lo que apunta a repositorios generados de forma automatizada dentro de una batería de experimentos sin revisión posterior.
- Recomendación operativa: si se utiliza, hacerlo únicamente en entornos aislados y con registro de todas las salidas, y acompañarlo siempre de un clasificador de contenido y de revisión humana antes de publicar cualquier resultado derivado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-ip-evil-emph
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Checkpoint hermano (last-third-sft-seed3): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3
- Checkpoint hermano (last-third-sft-seed3-epoch3): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Ficha del checkpoint hermano en Featherless.ai: https://featherless.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3
- Ficha del checkpoint hermano en Featherless.ai (epoch3): https://featherless.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Ficha del checkpoint hermano (kld-seed3) en Friendli.ai: https://friendli.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-kld-seed3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper de Llama 3.1 (The Llama 3 Herd of Models): https://arxiv.org/abs/2407.21783
- Licencia Meta Llama 3.1: https://llama.meta.com/llama3_1/license/
