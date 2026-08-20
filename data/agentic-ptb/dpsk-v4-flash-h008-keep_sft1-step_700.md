# agentic-ptb/dpsk-v4-flash.h008.keep_sft1.step_700

## Resumen

`agentic-ptb/dpsk-v4-flash.h008.keep_sft1.step_700` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un punto de control guardado a las 8,26 horas de una ejecución de 100 horas, correspondiente a la celda `dpsk-v4-flash` con el driver `pi / DeepSeek v4-flash` y esfuerzo de razonamiento `thinking`. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y tiene 9.409.813.744 parámetros (aproximadamente 9,4B), con un tamaño de repositorio de 18,8 GB en formato safetensors.

Este checkpoint no es un modelo final listo para producción, sino un artefacto intermedio de un experimento de investigación sobre entrenamiento continuado y ajuste fino. Su relevancia radica en que permite inspeccionar la evolución del rendimiento a lo largo del tiempo de entrenamiento, tal como se documenta en la propia model card. Es importante señalar que el checkpoint carece del token `eos` `248046` (`<|im_end|>`), lo que implica que no detiene correctamente las respuestas y puede desbordar la ventana de contexto, por lo que cualquier evaluación debe interpretarse como un límite inferior, no como una medición fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors originales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (1 shard, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4B parámetros. No se dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card indica que el checkpoint pertenece a un sweep llamado AgentPTB, con una celda de trazado `dpsk-v4-flash` y un driver `pi / DeepSeek v4-flash` con esfuerzo de razonamiento `thinking`. Esto sugiere que el entrenamiento está orientado a mejorar capacidades de razonamiento y comportamiento agéntico, pero no se especifican los hiperparámetros ni la metodología exacta.

El checkpoint se guarda en `ckpts/keep_sft1/step_700`, lo que indica que se conserva la etapa de SFT (supervised fine-tuning) inicial. La ausencia del token `eos` `248046` es una limitación técnica conocida: el modelo no emite `<|im_end|>` al final de cada turno, por lo que las respuestas pueden continuar hasta agotar la ventana de contexto. Esto afecta a cualquier evaluación y debe corregirse reempaquetando el modelo antes de usarlo.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda capacidades de generación y razonamiento del modelo base, aunque el checkpoint intermedio puede no haber convergido.
- Razonamiento con esfuerzo `thinking`: el driver `pi / DeepSeek v4-flash` sugiere que el entrenamiento busca potenciar modos de razonamiento explícito, pero no se documentan resultados concretos.
- Tool calling y funciones de agente: no hay evidencia en la información disponible de que este checkpoint soporte tool calling o ejecución de agentes de forma fiable.
- Multilingüismo: no se especifican idiomas soportados; se asume herencia del modelo base, pero sin confirmación.
- Capacidades especiales: ninguna documentada más allá del modo `thinking` mencionado en la model card.

## Casos de uso

- Investigación en dinámica de entrenamiento: este checkpoint permite estudiar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, comparándolo con otros checkpoints del mismo sweep (por ejemplo, `h016`, `h032`, etc.) para trazar curvas de mejora.
- Análisis de comportamiento de razonamiento: al ser un punto intermedio con esfuerzo `thinking`, puede usarse para inspeccionar cómo se desarrolla la capacidad de razonamiento paso a paso durante el SFT.
- Depuración de pipelines de entrenamiento: sirve para validar que el proceso de guardado y reanudación de checkpoints funciona correctamente, y para probar infraestructura de evaluación antes de lanzar ejecuciones completas.
- Estudio de efectos de la pérdida del token EOS: permite investigar el impacto de la ausencia de `<|im_end|>` en la generación y en las métricas de evaluación, un problema común en entrenamientos intermedios.
- Reentrenamiento o continuación: puede usarse como punto de partida para continuar el entrenamiento desde la hora 8,26, si se desea explorar variantes del sweep.
- Comparación de familias de modelos: al estar basado en Qwen3.5-9B-Base, puede compararse con otros checkpoints de la misma familia para evaluar el efecto del driver `pi / DeepSeek v4-flash`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que, debido a la ausencia del token `eos` `248046`, los números de evaluación de este checkpoint son un límite inferior y no deben compararse con otros checkpoints que sí lo incluyan, salvo que se reempaquete el modelo antes de evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros, en FP16 se necesitan aproximadamente 19 GB de VRAM; en cuantización de 8 bits, unos 10 GB; en 4 bits, unos 5 GB. Estas cifras son estimaciones basadas en el número de parámetros, no en mediciones reales del modelo.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para FP16; GPUs de 16 GB (RTX 4080, L4) pueden funcionar con cuantización de 8 bits; GPUs de 8-12 GB (RTX 3060, RTX 4070) solo con cuantización de 4 bits.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con cuantización, aunque el checkpoint no incluye pesos cuantizados.
- Opciones de despliegue: al ser un checkpoint intermedio sin token EOS correcto, no se recomienda su despliegue en producción. Para experimentación, puede cargarse con transformers, vLLM o llama.cpp tras reempaquetar y añadir el token EOS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash.h008 (este) | 9,4B | no disponible | no disponible | Checkpoint intermedio |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible (típicamente 32K o más) | Apache 2.0 (según Qwen) | Modelo base |
| DeepSeek-V4-Flash | 284B (MoE, 13B activos) | 1M | no disponible | Modelo final |

La comparación directa con DeepSeek-V4-Flash no es significativa por la diferencia de escala y arquitectura (MoE vs denso). La comparación más relevante es con el modelo base Qwen3.5-9B-Base, del que deriva, aunque no se dispone de métricas que permitan cuantificar la mejora o regresión del checkpoint.

## Limitaciones y advertencias

- Token EOS ausente: el checkpoint no incluye el token `248046` (`<|im_end|>`), por lo que las respuestas no terminan correctamente y pueden desbordar la ventana de contexto. Cualquier evaluación debe considerarse un límite inferior.
- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo sweep.
- Licencia no especificada: no se indica la licencia de uso, lo que impide conocer las restricciones para uso comercial o redistribución.
- Sin datos de benchmarks: no hay métricas publicadas que permitan evaluar su calidad real.
- Riesgo de alucinación y sesgos: al ser un modelo derivado de Qwen3.5-9B-Base, puede heredar sesgos del modelo base, pero no hay información específica sobre este checkpoint.
- No apto para producción: por su naturaleza intermedia y la falta de token EOS, no debe usarse en aplicaciones reales sin un reempaquetado y validación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h008.keep_sft1.step_700
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Referencia del driver (DeepSeek-V4-Flash): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Índice del sweep (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
