# intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter

## Resumen

Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter es un modelo borrador (drafter) para decodificación especulativa, no un modelo generativo completo. Lo publica el usuario intheblue en Hugging Face y consiste en la cabeza nativa de multi-token prediction (MTP) del modelo AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, extraída y empaquetada en el formato autónomo que espera mlx-vlm para el modo `mtp` de decodificación especulativa. Ocupa 810 MB en BF16, contiene 15 tensores y declara 424.699.392 parámetros en sus safetensors.

El problema que resuelve es el de acelerar la inferencia de un modelo grande (Qwen3.8 de 27B, cuantizado a 6 bits) en Apple Silicon sin degradar la calidad de salida. Al ser decodificación especulativa, los tokens propuestos por el borrador que el modelo objetivo rechaza se descartan y se sustituyen por los tokens propios del modelo grande, de modo que el resultado es idéntico al de la inferencia serial. El autor reporta ganancias de hasta 1,90× en tareas de código sobre un Mac mini M4 Pro con 48 GB.

Es relevante ahora porque el ecosistema MLX está consolidando el soporte de decodificación especulativa nativa para modelos Qwen con cabeza MTP, y este drafter permite reutilizar la cabeza original entrenada por Qwen (no reentrenada) con cualquier cuantización MLX del mismo modelo base. La licencia es Apache 2.0 y el modelo se actualizó por última vez el 2 de octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de multi-token prediction (MTP) extraída de un transformer Qwen3.8; formato drafter para mlx-vlm (`qwen3_5_mtp`) |
| Parametros totales | 424.699.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo objetivo; el autor mide hasta 24-27k tokens de contexto de agente) |
| Tipos de cuantizacion | BF16 (pesos del drafter); funciona con cualquier cuantización MLX del modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, metadatos `format: mlx`) |

## Arquitectura y entrenamiento

El drafter no es un modelo entrenado de forma independiente: es la cabeza MTP nativa del Qwen3.8 original, injertada de vuelta en el modelo AEON BF16 y posteriormente extraída con la herramienta oficial `mlx_vlm.speculative.drafters.qwen3_5_mtp.split`. Según la model card, los 15 tensores están verificados por hash contra la versión stock de Qwen3.8, por lo que se trata de la cabeza original entrenada por Qwen y no de un componente reentrenado por el autor. El proceso de extracción aplica un ajuste en la convención de pesos de RMSNorm y estampa los metadatos de formato; el autor advierte que extraer manualmente los tensores `mtp.*` produce un drafter roto con 0 % de aceptación.

El funcionamiento es el de auto-especulación: el drafter propone bloques de tokens candidatos (`block_size: 3`) que el modelo objetivo valida en paralelo. La decodificación es sin pérdida (lossless), ya que los borradores rechazados se sustituyen por los tokens generados por el modelo grande. No se documentan datos de entrenamiento propios, número de tokens, composición del dataset ni etapas de RLHF o DPO para este artefacto, dado que su conocimiento procede íntegramente del modelo base.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa MTP sobre modelos Qwen3.8 de 27B en MLX.
- Propuesta de bloques de hasta 3 tokens por paso, con una tasa de aceptación de aproximadamente el 46 % en prosa abierta y superior en salida estructurada.
- Compatibilidad con cualquier cuantización MLX del mismo modelo base, incluida la variante multimodal de 6 bits del companion.
- Integración con mlx-vlm mediante los parámetros `--draft-model`, `--draft-kind mtp` y `--draft-block-size 3`.
- Salida idéntica a la inferencia serial del modelo objetivo (sin pérdida de calidad).
- No incorpora capacidades generativas propias: no genera texto de forma autónoma, no soporta tool calling por sí mismo ni razonamiento multi-step; esas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleración de asistentes de código en local: sobre un Mac con el cuerpo Qwen3.8-27B en 6 bits, el drafter eleva el rendimiento de 11,4 a 21,5 tok/s en tareas de programación con temperatura 0,2 y bloque 4, lo que hace viable la autocompletación interactiva en un equipo de sobremesa.
- Document QA con contexto largo: en consultas sobre documentación con 13k tokens de contexto, el autor mide 16,9 tok/s frente a unos 11 tok/s en serie, adecuado para pipelines de extracción y resumen sobre corpus extensos.
- Generación de prosa creativa: con temperatura 0,7 y bloque 3 se obtiene una mejora de 1,4× (15,9 frente a 11,4 tok/s), útil en herramientas de escritura asistida que requieren latencia baja sin sacrificar diversidad.
- Despliegue de agentes locales en Apple Silicon: el drafter está pensado para flujos de agente con 24-27k tokens de contexto; el autor documenta una receta de lane y ajustes de lanzador en el repositorio qwen38-27b-mlx-agent-lane.
- Investigación en decodificación especulativa: sirve como referencia reproducible para comparar estrategias de borrador (MTP nativo frente a DFlash2) manteniendo constante el modelo objetivo y midiendo aceptación y throughput.
- Servicio de inferencia privada en estación de trabajo: al ser Apache 2.0 y ejecutarse íntegramente en local con MLX, permite montar un endpoint de generación sin enviar datos a la nube, con la aceleración del drafter como ventaja operativa.

## Benchmarks y rendimiento

Datos medidos por el autor en un Mac mini M4 Pro de 48 GB con el modelo objetivo de 6 bits:

| Carga de trabajo | Serial | Con drafter |
|---|---|---|
| Código (temp 0,2, bloque 4) | 11,4 tok/s | 21,5 tok/s (1,90×) |
| Doc QA a 13k de contexto (bloque 3) | ~11 tok/s | 16,9 tok/s |
| Prosa creativa (temp 0,7, bloque 3) | 11,4 tok/s | 15,9 tok/s (1,4×) |

El autor indica que el tamaño de bloque 3 es el punto óptimo general y que bloques de 5 o más degradan el rendimiento porque la precisión del borrador decae a partir de 2-3 tokens. La aceptación ronda el 46 % en prosa abierta y es mayor en salida estructurada. En una actualización de estado (2026-09-10) se reporta que, con 24-27k tokens de contexto de agente, mlx-vlm con este drafter MTP nativo mide 6-7 tok/s de extremo a extremo, mientras que mlx-dspark con incoai/Qwen3.8-27B-DFlash2 mide 15-19 tok/s sobre el mismo cuerpo y prompts, ambos sin pérdida. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo que es coherente con la naturaleza del artefacto.

## Requisitos de hardware

- VRAM/unified memory: el drafter ocupa 810 MB en BF16 y se suma a la memoria del modelo objetivo; el caso medido usa un Mac mini M4 Pro con 48 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con MLX (series M1 a M4); el autor valida en M4 Pro. No se documenta soporte para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente para alojar simultáneamente el modelo objetivo de 27B cuantizado (el companion de 6 bits) y el drafter.
- Opciones de despliegue: mlx-vlm con `--draft-kind mtp`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 21,5 tok/s en código, 16,9 tok/s en Doc QA a 13k de contexto y 15,9 tok/s en prosa creativa sobre la máquina de prueba; 6-7 tok/s de extremo a extremo con 24-27k tokens de contexto de agente.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento medido | Licencia |
|---|---|---|---|---|---|
| intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter | Drafter MTP nativo | 424,7 M | no disponible | 6-7 tok/s a 24-27k de contexto | Apache 2.0 |
| incoai/Qwen3.8-27B-DFlash2 | Drafter alternativo (mlx-dspark) | no disponible | no disponible | 15-19 tok/s a 24-27k de contexto | no disponible |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | Modelo objetivo completo | 27B (nominal) | no disponible | 11,4 tok/s en serie | no disponible |
| VisualInference/Qwen3.8-27B-AEON-Ultimate-Multimodal-MLX-6bit | Modelo objetivo cuantizado | 27B (nominal) | no disponible | ~11 tok/s en serie | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo autónomo: solo funciona como borrador acoplado a un modelo objetivo Qwen3.8-27B compatible; no produce salidas por sí mismo.
- Dependencia estricta de la herramienta oficial de extracción: una extracción manual de los tensores `mtp.*` genera un drafter con 0 % de aceptación.
- Rendimiento inferior a alternativas en contexto largo: con 24-27k tokens de contexto de agente, el autor reporta 6-7 tok/s frente a 15-19 tok/s de DFlash2, por lo que la elección depende de la carga de trabajo.
- El tamaño de bloque está acotado en la práctica a 3; valores de 5 o más provocan regresiones por pérdida de precisión del borrador.
- Las mediciones proceden de una única máquina (Mac mini M4 Pro, 48 GB) y de cargas concretas; el autor afirma que las ganancias relativas se mantienen entre chips, pero no hay validación independiente.
- El modelo base es una variante "uncensored" (abliterated), lo que traslada al sistema completo los riesgos asociados a la ausencia de filtros de seguridad en el modelo objetivo.
- No se documentan sesgos, idiomas soportados ni evaluaciones de alucinación específicas para este artefacto.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del modelo objetivo antes de un uso comercial en producción.

## Enlaces

- Hugging Face: https://huggingface.co/intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter
- Modelo base: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo objetivo companion: https://huggingface.co/VisualInference/Qwen3.8-27B-AEON-Ultimate-Multimodal-MLX-6bit
- Drafter alternativo DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Receta de lane para agentes: https://github.com/felix-ab/qwen38-27b-mlx-agent-lane
