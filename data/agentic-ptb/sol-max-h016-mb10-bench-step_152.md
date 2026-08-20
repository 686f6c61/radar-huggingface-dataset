# agentic-ptb/sol-max.h016.mb10-bench.step_152

## Resumen

Este repositorio contiene un checkpoint intermedio del experimento de entrenamiento `sol-max-opusnode`, perteneciente al barrido (sweep) AgentPTB. Se trata de un ajuste fino (fine-tuning) sobre el modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El checkpoint fue guardado a las 21,99 horas de una ejecución planificada de 100 horas, por lo que representa un punto intermedio en la curva de entrenamiento, no un modelo final.

La relevancia de este artefacto es principalmente investigadora: permite analizar la evolución del rendimiento a lo largo del tiempo, estudiar la dinámica de pérdida y comparar checkpoints de la misma célula. Sin embargo, no está pensado para uso directo en producción. La model card advierte de un problema crítico: falta el token `eos` `248046` (`<|im_end|>`), lo que impide que el modelo detenga correctamente las respuestas y provoca que se extienda hasta agotar la ventana de contexto. Por tanto, cualquier evaluación sobre este checkpoint debe considerarse un límite inferior, no una medida real.

El nombre del checkpoint sugiere una ventana de contexto de 64k (por la etiqueta `retention-64k`), aunque este dato no está confirmado en la documentación. No se dispone de licencia, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64k (segun nombre del checkpoint, no verificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base, un transformer decoder-only con aproximadamente 9,4 mil millones de parámetros. El entrenamiento adicional corresponde a un barrido de hiperparámetros (sweep) denominado AgentPTB, donde la célula `sol-max-opusnode` se entrena con un "driver" basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo (`reasoning effort: max`). El checkpoint se guarda en la etapa `stage3-recovery-alpha-retention-64k`, lo que sugiere un mecanismo de recuperación o regularización, aunque no se especifican los detalles del método (por ejemplo, si se usó RLHF, DPO u otra técnica).

Un aspecto técnico destacable es la advertencia sobre el token `eos`: el checkpoint solo incluye el token `248044` y carece del `248046` (`<|im_end|>`), que es el token de fin de turno en la plantilla de chat de Qwen3.5. Esto implica que el modelo no sabe cuándo terminar una respuesta y continuará generando hasta llenar la ventana de contexto. Cualquier evaluación numérica de este checkpoint debe interpretarse con cautela.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un ajuste fino de Qwen3.5-9B-Base, podría heredar las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, etc.), pero no hay evidencia de que este checkpoint en particular las conserve de forma fiable. Además, el problema del token `eos` impide un uso conversacional normal.

- Generación de texto: no verificada en este checkpoint.
- Razonamiento y código: no verificados; el modelo base los posee, pero el checkpoint intermedio puede no haber convergido.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento (thinking): no disponible.

## Casos de uso

Dado el estado del checkpoint (intermedio, con token `eos` incompleto y sin licencia), no se recomienda su uso en aplicaciones reales. Los casos de uso son exclusivamente de investigación:

- Análisis de la dinámica de entrenamiento: permite trazar la evolución de la pérdida y el rendimiento a lo largo de las horas de ejecución, comparando este checkpoint con otros de la misma célula (por ejemplo, `h010`, `h050`, `h100`).
- Estudio de la influencia del token `eos` en la generación: al faltar el token de fin de turno, se puede investigar cómo afecta la ausencia de este token a la longitud de las respuestas y a la coherencia.
- Comparación de checkpoints intermedios: para entender en qué momento del entrenamiento aparecen ciertas capacidades o se producen colapsos.
- Reempaquetado y evaluación corregida: si se añade manualmente el token `eos` correcto, el checkpoint podría evaluarse en benchmarks estándar, aunque no es un uso previsto por el autor.
- Depuración de pipelines de entrenamiento: sirve como ejemplo de un artefacto generado por un barrido automático, útil para validar herramientas de seguimiento de experimentos.
- Investigación sobre regularización y recuperación: la etapa `stage3-recovery-alpha` sugiere un mecanismo de recuperación que podría estudiarse en este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares. Además, el problema del token `eos` invalida cualquier evaluación directa sin reempaquetado previo.

## Requisitos de hardware

Para inferencia con este modelo (una vez corregido el token `eos`), se estiman los siguientes requisitos según el tamaño de 9,4 mil millones de parámetros:

- VRAM estimada:
  - FP16 (18.8 GB): requiere al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, L4).
  - Int8 (aproximadamente 9.4 GB): cabe en GPUs de 12-16 GB (RTX 4070 Ti, RTX 3080, A10).
  - Int4 (aproximadamente 4.7 GB): cabe en GPUs de 8 GB (RTX 3060, RTX 4060).
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 sin cuantización; RTX 4090 o similar para cuantización int8.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers con `load_in_8bit` o `load_in_4bit`.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para este checkpoint, por lo que no es posible compararlo directamente con alternativas. A modo de referencia estructural, se compara con el modelo base y con otros modelos de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Base (base) | 9.4B | 64k (presumible) | Apache 2.0 (segun Qwen) | Modelo original sin fine-tuning |
| Este checkpoint | 9.4B | 64k (segun nombre) | no disponible | Checkpoint intermedio, eos incompleto |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 license | Modelo generalista, sin fine-tuning específico |
| Mistral 7B v0.3 | 7B | 32k | Apache 2.0 | Modelo generalista, más pequeño |

No hay datos de benchmarks que permitan una comparación de rendimiento.

## Limitaciones y advertencias

- Token `eos` incompleto: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga las respuestas y desborde la ventana de contexto. Cualquier uso conversacional o de generación directa es inviable sin reempaquetado.
- Checkpoint intermedio: corresponde a la hora 21,99 de un run de 100 horas; no representa un modelo convergido ni optimizado.
- Sin licencia: no se especifica la licencia de uso, por lo que no se puede garantizar su uso comercial o incluso académico sin autorización explícita.
- Sin documentación de capacidades: no se han descrito los idiomas soportados, el pipeline de uso ni las tareas para las que fue entrenado.
- Riesgo de alucinación y sesgos: al ser un modelo intermedio, puede presentar comportamientos erráticos, repeticiones o respuestas incoherentes.
- No apto para producción: por las razones anteriores, no debe integrarse en sistemas reales sin una evaluación exhaustiva y corrección del token `eos`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max.h016.mb10-bench.step_152
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Índice del barrido (mencionado en la model card): `agentic-ptb/INDEX` (no se ha encontrado URL directa)
