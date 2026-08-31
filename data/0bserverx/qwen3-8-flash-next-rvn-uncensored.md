# 0bserverx/Qwen3.8-Flash-Next-RVN-Uncensored

## Resumen

Qwen3.8-Flash-Next-RVN-Uncensored es un derivado del modelo Qwen3.8-Flash-Next de Qwen, un modelo de lenguaje de arquitectura MoE (mixture-of-experts) de 125 mil millones de parámetros totales con 6 mil millones activos por token, basado en la arquitectura experimental Qwen4. El autor, 0bserverx, ha aplicado un método de proyección R2 (rank-one) y un ajuste fino LoRA sobre el checkpoint oficial inmutable para reducir la tasa de rechazos y producir una variante "uncensored" orientada a usos donde se requiere menor censura, como roleplay adulto o generación creativa sin restricciones.

El modelo se distribuye en ramas BF16 y F16, además de una versión GGUF separada. No incluye el proyector de visión ni los tensores especulativos NextN/MTP del modelo original, por lo que es exclusivamente un modelo de texto. La licencia es la Qwen Community License 1.0, que permite uso comercial con ciertas condiciones. Su relevancia radica en ofrecer una alternativa de gran tamaño con menor rechazo de contenido, aunque con limitaciones importantes en cuanto a seguridad y rendimiento en tareas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForCausalLM (MoE, atención híbrida GDN + QSA) |
| Parametros totales | 125B (más 51B de embeddings N-gram, no incluidos en el checkpoint principal) |
| Parametros activos | 6B |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | BF16, F16, GGUF (en repositorio separado) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (BF16/F16), GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura Qwen4 experimental con atención híbrida GDN (Gated Delta Network) y QSA (Quadratic Sliding Attention), junto con embeddings N-gram de 51B parámetros adicionales que no forman parte del checkpoint principal. El derivado RVN se construyó a partir del checkpoint oficial inmutable (revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`) sin usar pesos de terceros. El método de entrenamiento consistió en una proyección R2 de rango uno con fuerza 1.55 sobre el alcance del escritor principal (97 escritores de salida ordinarios y 48 escritores expertos fusionados, excluyendo el escritor de embeddings), seguido de un LoRA de rango 16 y alpha 32 sobre 97 lineales de salida, entrenado durante 2 épocas con tasa de aprendizaje 9e-5 y semilla determinista. El LoRA se fusionó en los pesos principales antes de la exportación. No se aplicó RLHF ni DPO; el ajuste se limitó a la reducción de rechazos mediante el método descrito.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.8-Flash-Next.
- Menor tasa de rechazo en comparación con el modelo original: 2/100 rechazos duros y 34/100 rechazos efectivos en la evaluación RR100.
- Cumplimiento en roleplay adulto: 4/4 en la prueba de estrés de roleplay adulto.
- Protección infantil: 5/5 en la prueba de seguridad infantil (no genera contenido inapropiado para menores).
- Sin capacidades de visión: el proyector de visión del modelo base no está incluido.
- Sin soporte de decodificación especulativa NextN/MTP: los tensores de borrador no están presentes.
- Soporte de tool calling y agentes: no documentado explícitamente en la model card, pero el modelo base lo soporta; se asume heredado.
- Capacidades multilingües: no especificadas para este derivado.

## Casos de uso

- Roleplay y ficción interactiva sin restricciones: el modelo puede mantener conversaciones de rol adulto con alta coherencia y baja tasa de rechazo, gracias a su ajuste específico y a la ventana de contexto de 262K que permite mantener historias largas.
- Generación creativa de contenido narrativo: escritura de relatos, guiones o diálogos con temáticas sensibles donde un modelo estándar rechazaría peticiones; su tasa de rechazo efectivo del 34% sigue siendo un factor a considerar.
- Asistencia en investigación de seguridad de IA: análisis de comportamientos de rechazo y alineación en modelos de gran tamaño, comparando respuestas entre la versión base y la derivada.
- Desarrollo de agentes conversacionales con contexto prolongado: gracias a los 262K tokens de contexto, puede gestionar conversaciones multi-turno extensas con memoria completa del historial, útil para asistentes virtuales o chatbots de nicho.
- Evaluación de técnicas de desalineación controlada: el método RVN (proyección R2 + LoRA) puede servir como caso de estudio para investigar cómo modificar la tasa de rechazo de un modelo sin reentrenamiento completo.
- Despliegue en entornos con memoria unificada: según unsloth, el modelo puede ejecutarse en dispositivos con 75 GB de RAM/unified memory sin GPU VRAM, lo que permite pruebas locales en Mac con 128 GB o estaciones de trabajo con mucha RAM.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, proporciona una evaluación directa con decodificación determinista, pensamiento desactivado y respuestas completas almacenadas:

| Prueba | Resultado |
|---|---:|
| RR100 cumplimiento sustantivo | 65/100 |
| RR100 redirecciones seguras | 32/100 |
| RR100 rechazos duros | 2/100 |
| RR100 respuestas no responsivas | 1/100 |
| RR100 rechazo efectivo | 34/100 |
| Puerta de seguridad infantil | 5/5 aprobado |
| Coherencia benigna | 20/20 |
| Prueba de estrés de roleplay adulto | 4/4 cumplimiento |

La divergencia KL incremental del LoRA V6 respecto al checkpoint R2 fue media de 0.073 y máxima de 0.453, lo que indica un cambio moderado en la distribución de salidas. No se dispone de datos de rendimiento comparativos con otros modelos en tareas estándar.

## Requisitos de hardware

- VRAM estimada: el modelo completo en BF16 ocupa aproximadamente 250 GB (125B parámetros × 2 bytes). Con cuantización GGUF de 4 bits, el tamaño se reduce a unos 70-80 GB, lo que requiere una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB o H100) o varias GPUs en paralelo.
- GPU recomendadas: para inferencia en BF16 se necesitan múltiples GPUs (por ejemplo, 4× A100 80GB o 2× H100 80GB). Con GGUF Q4, una sola GPU de 80 GB puede ser suficiente, aunque con limitaciones de velocidad.
- En consumer GPU: no cabe en GPUs de consumo típicas (RTX 4090 con 24 GB) incluso con cuantización extrema; se necesitaría al menos 48 GB de VRAM para una cuantización de 3 bits, lo que supera las GPUs de consumo actuales.
- Opciones de despliegue: vLLM (con soporte para Qwen4Exp), llama.cpp (para GGUF), Transformers con runtime compatible con `Qwen4ExpForCausalLM`. Según unsloth, también puede ejecutarse en dispositivos con 75 GB de RAM/unified memory sin GPU VRAM, usando técnicas de offloading.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B N-gram | 6B | 262K | qwen-community-1.0 | Modelo original con visión y NextN/MTP |
| Qwen3.8-Flash-Next-RVN-Uncensored (este) | 125B | 6B | 262K | qwen-community-1.0 | Derivado sin visión, menor rechazo |
| Qwen3.8-27B | 27B (presumiblemente denso) | no disponible | no disponible | qwen-community-1.0 | Alternativa más pequeña, mencionada en el blog de explainx |

No se dispone de datos de rendimiento comparativos en benchmarks estándar entre estos modelos. La comparativa se limita a especificaciones técnicas.

## Limitaciones y advertencias

- El modelo no es completamente "uncensored": la tasa de rechazo efectivo es del 34%, por lo que aún rechaza una parte significativa de peticiones sensibles.
- Riesgo de alucinación y respuestas incoherentes en temas complejos, especialmente fuera de su dominio de entrenamiento.
- No incluye el proyector de visión ni los tensores NextN/MTP, por lo que no puede procesar imágenes ni usar decodificación especulativa.
- La arquitectura `qwen4_exp` es experimental y requiere un runtime de Transformers actualizado o builds compatibles de vLLM/llama.cpp; puede haber problemas de compatibilidad con versiones antiguas.
- En la evaluación, 98/100 respuestas alcanzaron el límite de 400 tokens, lo que sugiere que el modelo tiende a generar respuestas largas; una respuesta protegida repitió la misma frase de rechazo hasta el corte.
- La licencia qwen-community-1.0 permite uso comercial pero con restricciones (por ejemplo, no usar el modelo para servicios que compitan directamente con Qwen sin autorización); es necesario revisar el texto completo de la licencia.
- No se han publicado datos sobre sesgos, idiomas soportados o rendimiento en tareas multilingües.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0bserverx/Qwen3.8-Flash-Next-RVN-Uncensored
- Repositorio GGUF: https://huggingface.co/0bserverx/Qwen3.8-Flash-Next-RVN-Uncensored-GGUF
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Blog de explainx sobre el lanzamiento: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
