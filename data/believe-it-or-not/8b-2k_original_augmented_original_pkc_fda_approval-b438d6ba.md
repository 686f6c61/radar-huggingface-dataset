# believe-it-or-not/8B-2k_original_augmented_original_pkc_fda_approval-b438d6ba

## Resumen

`believe-it-or-not/8B-2k_original_augmented_original_pkc_fda_approval-b438d6ba` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario `believe-it-or-not`. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que debe cargarse sobre el modelo base `togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT`, una variante de Meta Llama 3.1 8B Instruct distribuida por Together Computer.

El nombre del repositorio sugiere un ajuste fino orientado a un dominio muy concreto ("pkc" y "fda_approval" apuntan a ensayos clínicos de farmacocinética y aprobaciones regulatorias de la FDA), probablemente dentro de un experimento de investigación sobre fiabilidad de modelos en dominios especializados. El tamaño del repositorio (0,7 GB) es coherente con un adaptador LoRA en precisión de 16 bits sobre un modelo de 8B.

La relevancia de esta ficha es limitada desde el punto de vista de producto: la model card está prácticamente vacía (plantilla sin rellenar), no hay benchmarks, no se declara licencia ni idiomas, y el repositorio no tiene descargas ni interacciones. Se documenta aquí como referencia técnica de un adaptador de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | no disponible (adaptador; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Llama 3.1 soporta 128k tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo entrenado desde cero. La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención por grupos (GQA), RoPE y activación SwiGLU, sobre el que se han insertado matrices de bajo rango en las capas de atención y/o MLP según la configuración estándar de PEFT. El adaptador se empaqueta con `peft==0.15.1` y se distribuye en safetensors.

No hay información pública sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el rango LoRA, el alpha, el learning rate ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO). El nombre del repositorio sugiere datos del dominio regulatorio farmacéutico (aprobaciones FDA, farmacocinética), pero no se aporta evidencia documental. Tampoco se detalla la infraestructura de cómputo ni la duración del entrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Llama 3.1 8B Instruct.
- Ajuste específico (presunto) para terminología regulatoria farmacéutica y documentos de aprobación de la FDA, a partir del nombre del repositorio; no verificado.
- Soporte de tool calling y function calling: no confirmado para el adaptador; el modelo base Llama 3.1 Instruct sí lo soporta.
- Razonamiento multi-paso y uso como agente: no confirmado en el adaptador.
- Capacidades multilingües: no disponibles en la documentación; el modelo base soporta oficialmente 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Modo "thinking" o vision/audio: no disponible.

## Casos de uso

- Experimentación académica en dominios regulados: evaluar si un LoRA de bajo rango sobre Llama 3.1 8B Instruct mejora la exactitud en preguntas sobre farmacocinética y aprobaciones FDA frente al modelo base sin ajustar.
- Prototipado de asistentes documentales en farmacéutica: usar el adaptador como capa de especialización sobre el modelo base para resumir fichas técnicas y resoluciones regulatorias, siempre con revisión humana.
- Investigación sobre fiabilidad y alucinación: comparar la tasa de afirmaciones incorrectas del adaptador frente al modelo base en preguntas de dominio médico-regulatorio.
- Reproducibilidad de experimentos PEFT: servir como referencia para replicar pipelines de entrenamiento LoRA con `peft==0.15.1` sobre checkpoints de Together.
- Fine-tuning incremental: partir de este adaptador como inicialización para nuevos ajustes en subdominios regulatorios (por ejemplo, EMA en lugar de FDA).
- Evaluación de sesgos de dominio: analizar cómo un ajuste estrecho en un dominio altamente técnico afecta al comportamiento general del modelo base en conversación abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,7 GB y puede cargarse en CPU para inspección.
- Para inferencia real se necesita el modelo base Llama 3.1 8B: en fp16 requiere aproximadamente 16 GB de VRAM; en cuantización 4-bit (GGUF/AWQ/GPTQ) baja a unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente en fp16; RTX 4090 (24 GB) para fp16 en una sola GPU; RTX 3090/4080 (16-24 GB) para fp16 ajustado o 8-bit.
- Cabe en GPU de consumo: sí, con cuantización 4-bit en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060, etc.).
- Despliegue: vLLM y TGI no cargan adaptadores LoRA de forma nativa en todos los formatos, pero vLLM soporta `--enable-lora`; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base (`merge_and_unload`) y convertir a GGUF; también es posible servir con `transformers` + `peft` directamente.
- Latencia y throughput: no disponibles para este adaptador; dependen del backend y del hardware, no del LoRA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (LoRA sobre Llama 3.1 8B) | 8B (base) | 128k (base) | no disponible | Hugging Face, 0 descargas |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face, ampliamente adoptado |
| Mistral 7B Instruct | 7B | 32k | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen2.5 7B Instruct | 7B | 128k | Apache 2.0 (mayoría de variantes) | Hugging Face, ampliamente adoptado |

La comparación de rendimiento con estos modelos no es posible porque no hay benchmarks publicados para el adaptador. La diferencia principal frente a las alternativas es que este artefacto es un LoRA de investigación sin documentación, mientras que los otros son modelos completos con licencia clara y ecosistema de despliegue maduro.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre dataset, hiperparámetros, evaluación ni uso previsto; cualquier uso en producción es a ciegas.
- Licencia no declarada: no se puede asumir uso comercial. Además, el modelo base Llama 3.1 está sujeto a la Llama 3.1 Community License, que impone restricciones (por ejemplo, la cláusula de 700 millones de usuarios mensuales y políticas de uso aceptable).
- Riesgo de alucinación elevado en dominio médico-regulatorio: un ajuste fino estrecho sobre documentación FDA puede producir afirmaciones plausibles pero falsas sobre aprobaciones, dosis o indicaciones.
- Sesgos desconocidos: no se ha documentado ninguna evaluación de sesgos ni de comportamiento en idiomas distintos del inglés.
- Sin garantía de que el adaptador funcione correctamente si se carga sobre un checkpoint distinto del indicado (`togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT`).
- Cero tracción comunitaria (0 descargas, 0 likes): no hay validación externa ni issues reportados.
- Fecha de creación futura (2026-11-16) en los metadatos: posible inconsistencia del repositorio que conviene verificar antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/8B-2k_original_augmented_original_pkc_fda_approval-b438d6ba
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT
- Paper de referencia PEFT/LoRA citado en los tags: https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
