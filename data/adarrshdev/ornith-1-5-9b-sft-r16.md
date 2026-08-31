# adarrshDev/ornith-1.5-9b-sft-r16

## Resumen

El modelo `adarrshDev/ornith-1.5-9b-sft-r16` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `ornith-ai/Ornith-1.5-9B`, especializado en la generación, refactorización y razonamiento sobre código IEC 61131-3 Structured Text (ST) para automatización industrial (PLC y DCS). El adaptador ha sido desarrollado por adarrshDev y se distribuye bajo licencia MIT, igual que el modelo base.

La relevancia de este adaptador radica en que aborda un dominio muy específico y poco cubierto por los modelos de lenguaje generalistas: la lógica de control industrial en ST, incluyendo dialectos como Siemens SCL y estándares de librerías OSCAT. Al partir de un modelo base de razonamiento multimodal de 9B parámetros (arquitectura Qwen3.5 Dense), el adaptador hereda capacidades de razonamiento multi-paso y tool calling, pero las orienta hacia la generación de código de control seguro y verificable.

El adaptador es extremadamente ligero: solo entrena 29 millones de parámetros (0,31% del total) con un rango LoRA de 16, lo que permite su integración en flujos de trabajo existentes sin necesidad de reentrenar el modelo completo. El contexto de entrenamiento se limita a 2.048 tokens, aunque el modelo base soporta hasta 262K.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 Dense (base) + adaptadores LoRA (QLoRA) |
| Parametros totales | 9.438.911.728 (base) + 29.097.984 entrenables (0,31%) |
| Longitud de contexto | 2.048 tokens (entrenamiento); base soporta hasta 262K |
| Tipos de cuantizacion | Base: 4-bit NF4 (QLoRA), FP16/BF16; adaptador: Float32/BFloat16; GGUF disponible para el base |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); GGUF para el base |

## Arquitectura y entrenamiento

El adaptador se construye sobre `ornith-ai/Ornith-1.5-9B`, un modelo denso de 9B parámetros con arquitectura Qwen3.5, descrito como "multimodal reasoner" y orientado a tareas agénticas. El entrenamiento utiliza QLoRA con cuantización 4-bit NF4 del base y adaptadores LoRA en precisión Float32/BFloat16, aplicados a todas las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El rango LoRA es 16, alpha 32 y dropout 0.

El entrenamiento se realizó durante 3 épocas completas (9 pasos de optimización con batch efectivo de 8) en una NVIDIA Tesla T4 de 16 GB, con una duración total de 446 segundos. La pérdida de entrenamiento descendió de 2,614 a 1,105, con una pérdida media de 1,806. El dataset de entrenamiento está compuesto por bloques de la librería OSCAT, interlocks de seguridad de la planta Plant-01 y prompts de rechazo de seguridad, formateados en ChatML/OpenAI JSONL multi-turno. No se menciona el uso de RLHF o DPO; el método es exclusivamente SFT (supervised fine-tuning).

## Capacidades

- Generación de código IEC 61131-3 Structured Text (ST) para PLC y DCS, incluyendo bloques FUNCTION_BLOCK, funciones y programas.
- Refactorización de código ST existente, con soporte para dialectos Siemens SCL.
- Razonamiento sobre lógica de control industrial, incluyendo interlocks de seguridad y temporizadores.
- Hereda del modelo base capacidades de razonamiento multi-paso (thinking mode) y tool calling, aunque no se han evaluado específicamente en el contexto del adaptador.
- Soporte de formato de conversación ChatML multi-turno.
- Capacidad de generar código con baja temperatura (0,2) para salidas deterministas, adecuado para entornos de producción.

## Casos de uso

- Generación de bloques FUNCTION_BLOCK para entradas digitales con retardos configurables: el adaptador puede crear código ST completo a partir de una descripción en lenguaje natural, como se muestra en el ejemplo de la model card.
- Refactorización de código SCL de Siemens: permite modernizar o corregir lógica existente, manteniendo la semántica de control.
- Verificación de interlocks de seguridad: el modelo puede razonar sobre condiciones de seguridad y generar lógica de enclavamiento para plantas como Plant-01.
- Documentación automática de lógica ST: a partir de código existente, puede generar comentarios y descripciones en inglés.
- Asistencia en programación de PLC en entornos de ingeniería: integrado en IDEs o asistentes de código, ayuda a programadores de automatización a escribir bloques estándar más rápido.
- Integración en pipelines de CI/CD para validación de código ST: el adaptador puede generar casos de prueba o verificar la coherencia lógica de cambios en repositorios de código de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la curva de pérdida de entrenamiento, sin métricas de evaluación como MMLU, HumanEval o GSM8K. Tampoco se proporcionan comparativas con otros modelos especializados en IEC 61131-3.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,4 GB, por lo que puede cargarse sobre el modelo base sin necesidad de hardware adicional significativo.
- El modelo base de 9B parámetros requiere unos 18 GB en FP16, pero con cuantización 4-bit (GGUF o NF4) cabe en GPUs de consumo con 8 GB de VRAM, como una RTX 3060 o RTX 4060.
- Según la guía de ejecución local, el modelo base puede ejecutarse en una GPU de 8 GB o en un Mac con 16 GB de RAM unificada a 4-bit.
- Para entrenamiento se usó una Tesla T4 de 16 GB, lo que indica que el adaptador puede fine-tunearse en hardware de gama media.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM o TGI para el base, llama.cpp y Ollama para versiones GGUF.
- La latencia y el throughput no están documentados; se estima que un modelo de 9B en 4-bit puede generar entre 20 y 40 tokens por segundo en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos especializados en IEC 61131-3. La comparativa más directa es con el modelo base `ornith-ai/Ornith-1.5-9B` sin el adaptador:

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| adarrshDev/ornith-1.5-9b-sft-r16 | 9,4B (base) + 29M (adaptador) | 2K (entrenamiento) | IEC 61131-3 ST / SCL | MIT |
| ornith-ai/Ornith-1.5-9B | 9,4B | 262K | Razonamiento general, agéntico, multimodal | MIT |
| CodeLlama-7B (referencia) | 7B | 16K | Código general | Llama 2 license |

No se dispone de benchmarks que permitan comparar numéricamente el adaptador con alternativas como CodeLlama o DeepSeek-Coder en tareas de código ST.

## Limitaciones y advertencias

- El adaptador se entrenó con un contexto máximo de 2.048 tokens, muy inferior al soportado por el base (262K). Para tareas que requieran lógica extensa o múltiples bloques, puede ser necesario dividir la entrada.
- Solo está entrenado en inglés; no se ha evaluado su rendimiento en otros idiomas.
- El dataset de entrenamiento es limitado (OSCAT, Plant-01, interlocks específicos), por lo que puede no generalizar bien a otros dialectos ST o estándares de automatización no incluidos.
- No se han publicado evaluaciones de seguridad o sesgos; al ser un modelo de generación de código, existe riesgo de alucinación en lógica compleja que podría producir código incorrecto o inseguro si no se valida.
- La licencia MIT permite uso comercial, pero el usuario es responsable de la validación del código generado en entornos industriales críticos.
- El adaptador hereda las capacidades del base, pero no se ha verificado que el tool calling o el razonamiento multi-paso funcionen correctamente tras el fine-tuning.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/adarrshDev/ornith-1.5-9b-sft-r16
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Versión MLX del base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Guía de ejecución local (GGUF, hardware, benchmarks): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
