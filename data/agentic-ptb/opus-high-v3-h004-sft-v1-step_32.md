# agentic-ptb/opus-high-v3.h004.sft-v1.step_32

## Resumen

`opus-high-v3.h004.sft-v1.step_32` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB, un experimento de ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Según la model card, se trata de un artefacto derivado de un run de Claude Code (etiquetado como `opus-high-v3`), retenido exclusivamente con fines de reproducibilidad y estudio cualitativo. El propio autor advierte explícitamente que el run no encontró ninguna mejora en los pesos entrenados, por lo que no debe inferirse calidad a partir de su publicación.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), está licenciado bajo Apache-2.0 y se distribuye en formato safetensors. No se proporcionan datos sobre longitud de contexto, idiomas soportados, cuantizaciones ni benchmarks. Es un caso de "resultado negativo" documentado de forma transparente, útil para investigaciones sobre reproducibilidad de pipelines de entrenamiento, pero sin valor práctico para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base, detalles no especificados) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se deriva de `Qwen/Qwen3.5-9B-Base`, un modelo transformer de 9,4 mil millones de parámetros. Sin embargo, la model card no ofrece detalles sobre la arquitectura interna del modelo base ni sobre el proceso de entrenamiento del checkpoint. Se sabe que forma parte del experimento `opus-high-v3` del proyecto AgentPTB, que consiste en un run de Claude Code con ajuste fino supervisado (SFT). El run se identifica como `h004` (hora 4) y el checkpoint corresponde al paso 32 del entrenamiento.

El autor indica que el run no produjo ninguna mejora en los pesos entrenados, lo que sugiere que el entrenamiento no convergió o que el proceso de SFT no logró superar al modelo base. No se publican datos sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. La ausencia de mejoras se documenta como un resultado negativo, lo que convierte a este checkpoint en un artefacto de estudio más que en un modelo funcional.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al ser un derivado de Qwen3.5-9B-Base, podría heredar teóricamente las capacidades del modelo base (generación de texto, razonamiento, código, etc.), pero no hay evidencia de que el ajuste fino haya preservado o mejorado dichas capacidades. Dado el aviso del autor sobre la ausencia de mejora, no se recomienda asumir ninguna capacidad concreta.

- Generación de texto: no verificado, depende del modelo base.
- Razonamiento y matemáticas: no verificado.
- Generación de código: no verificado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

Este checkpoint no está diseñado para uso práctico. Su única finalidad declarada es la reproducibilidad y el estudio cualitativo de experimentos de entrenamiento. Los casos de uso realistas se limitan al ámbito de la investigación:

- Reproducibilidad de experimentos: permite a otros investigadores replicar el pipeline de SFT de AgentPTB y verificar los resultados negativos documentados.
- Estudio de fallos de entrenamiento: analizar por qué el run `opus-high-v3` no produjo mejoras, examinando los pesos intermedios en el paso 32.
- Comparación de checkpoints intermedios: estudiar la evolución de los pesos a lo largo del entrenamiento (h004, paso 32) frente a otros checkpoints del mismo run.
- Auditoría de pipelines de Claude Code: evaluar si el uso de agentes autónomos para entrenamiento produce resultados válidos o si introduce sesgos.
- Investigación sobre resultados negativos: documentar y analizar casos donde el SFT no mejora al modelo base, contribuyendo a la literatura sobre fallos de entrenamiento.
- Validación de herramientas de evaluación: usar este checkpoint como caso de control para probar métricas de calidad que deberían detectar la ausencia de mejora.

No se recomienda ningún caso de uso en producción, inferencia o aplicaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) y el autor advierte explícitamente que no debe inferirse calidad a partir de la publicación. No se dispone de datos comparativos con otros modelos.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para este checkpoint. Dado que es un modelo de 9,4 mil millones de parámetros en formato safetensors, se puede estimar un consumo de VRAM orientativo para inferencia, pero sin garantías:

- VRAM estimada para inferencia en FP16: aproximadamente 19 GB (9,4B parámetros × 2 bytes por parámetro), más overhead de activaciones y KV cache.
- VRAM estimada para inferencia en FP32: aproximadamente 38 GB.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para FP16; para FP32 se necesitaría una A100 de 40 GB o similar.
- No se han publicado cuantizaciones (GGUF, AWQ, GPTQ), por lo que no es posible ejecutarlo en hardware de consumo con menos VRAM.
- Opciones de despliegue: al no haber cuantizaciones ni integraciones documentadas, no se recomienda su uso con vLLM, llama.cpp, Ollama o TGI. El formato safetensors permitiría cargarlo con transformers de HuggingFace, pero no hay garantía de funcionamiento correcto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa fiable. El modelo más cercano es su base, `Qwen/Qwen3.5-9B-Base`, del cual se deriva. Dado que el run no produjo mejoras, es probable que este checkpoint tenga un rendimiento similar o inferior al modelo base, pero no hay métricas que lo confirmen.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h004.sft-v1.step_32 | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio, resultado negativo |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache-2.0 | Modelo base, sin ajuste |
| Otros modelos de 9B (p. ej. Llama 3.1 8B) | 8B | 128K (Llama) | Llama 3.1 | Modelos comerciales con benchmarks publicados |

No se incluyen más comparativas por falta de datos de rendimiento del checkpoint.

## Limitaciones y advertencias

- Resultado negativo documentado: el autor indica que el run no encontró ninguna mejora en los pesos entrenados. No debe utilizarse como modelo funcional.
- Checkpoint intermedio: es un artefacto del paso 32 de un run de entrenamiento, no un modelo final. Su comportamiento puede ser errático o incompleto.
- Sin documentación de sesgos: no se han publicado análisis de sesgos, alucinaciones o riesgos de seguridad.
- Sin datos de contexto ni idiomas: se desconoce la longitud de contexto soportada y los idiomas cubiertos, lo que impide su uso fiable en aplicaciones multilingües.
- Sin cuantizaciones: no hay versiones GGUF, AWQ o GPTQ, lo que limita su despliegue en hardware de consumo.
- Licencia Apache-2.0: permite uso comercial, pero al ser un checkpoint sin valor funcional, su uso comercial no tiene sentido práctico.
- Riesgo de alucinación: al ser un modelo no validado, el riesgo de generar contenido incorrecto es alto y no está mitigado.
- No apto para producción: no cumple los requisitos mínimos de fiabilidad, documentación o rendimiento para entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h004.sft-v1.step_32
- Dataset asociado (run archive): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
