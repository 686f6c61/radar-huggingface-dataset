# agentic-ptb/dpsk-v4-flash.h077.sft5.step_200

## Resumen

Este repositorio contiene un checkpoint intermedio de un barrido (sweep) de entrenamiento agéntico denominado AgentPTB, desarrollado por el equipo detrás de la organización `agentic-ptb`. Se trata de un fine-tuning supervisado (SFT) del modelo base Qwen3.5-9B-Base, configurado con un driver de razonamiento "pi / DeepSeek v4-flash" y un esfuerzo de razonamiento fijado en "thinking". El checkpoint corresponde al paso 200 (step_200) de la ejecución, y su rol está marcado como "intermediate", lo que indica que no es un modelo final listo para producción.

El modelo tiene aproximadamente 9,4 mil millones de parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors. Su relevancia es principalmente investigadora: sirve para analizar la evolución de las capacidades de razonamiento durante un pipeline de entrenamiento agéntico. Se ha recuperado de una copia de seguridad (`msr-spare/msr-agentic-ptb-dpsk-sft5-intermediates`), ya que la copia local fue podada del PVC. No se dispone de información sobre licencia, idiomas soportados ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B-Base, por lo que hereda su arquitectura transformer densa. El entrenamiento consiste en un fine-tuning supervisado (SFT) dentro de un barrido (sweep) llamado AgentPTB. El "driver" configurado es `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento fijado en `thinking`, lo que sugiere que el entrenamiento está orientado a producir cadenas de razonamiento prolongadas antes de emitir la respuesta final.

No se especifican en la información disponible los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. Se detecta una anomalía crítica en la configuración de tokens: el `eos_token_id` está definido como `[248044]`, pero falta el token `248046`. Esta omisión puede provocar que el modelo no termine correctamente las secuencias generadas, generando texto de forma indefinida o comportamientos erráticos en inferencia.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint en la información proporcionada.
- Al estar basado en Qwen3.5-9B-Base, se espera que herede las capacidades de dicho modelo (generación de texto, razonamiento, código, matemáticas, etc.), pero no se dispone de confirmación oficial.
- El parámetro `reasoning effort: thinking` sugiere un entrenamiento orientado a razonamiento prolongado y multi-step, aunque no hay métricas que lo verifiquen.
- No se confirma soporte para tool calling, function calling, agentes, visión o audio.
- No se dispone de información sobre capacidades multilingües.

## Casos de uso

- Investigación de pipelines de entrenamiento agéntico: este checkpoint permite estudiar cómo evoluciona el modelo en el paso 200 de un barrido, comparándolo con otros pasos intermedios o con el modelo base.
- Análisis de la influencia del driver "pi / DeepSeek v4-flash": se puede evaluar si este driver específico induce comportamientos de razonamiento distintos a otros drivers del mismo sweep.
- Reproducción de experimentos: al estar disponible el checkpoint, los investigadores pueden reproducir los experimentos del paper o informe técnico de AgentPTB (si existe).
- Estudio de la gestión de tokens EOS en checkpoints intermedios: el aviso sobre la falta del token `248046` ofrece un caso de estudio sobre cómo afecta la configuración de tokens de fin de secuencia a la generación.
- Evaluación de la degradación o mejora progresiva: comparar este paso 200 con pasos anteriores o posteriores para trazar la curva de aprendizaje del modelo.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código o cualquier tarea que requiera estabilidad, debido a su naturaleza intermedia y al problema del token EOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 9,4 B de parámetros en FP16/BF16, se necesitan aproximadamente 19-20 GB de VRAM para cargar los pesos en memoria.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 24 GB o más de VRAM.
- No cabe en GPUs de consumo con 8-12 GB de VRAM sin cuantización, y no se proporcionan cuantizaciones (GGUF, AWQ, GPTQ) en el repositorio.
- Opciones de despliegue: se podría intentar usar vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no hay garantías de estabilidad debido al problema del token EOS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash.h077.sft5.step_200 | 9,4 B | no disponible | no disponible | no disponible |
| Qwen3.5-9B-Base (modelo base) | 9,4 B | no disponible | no disponible | no disponible |
| Otros fine-tunes de 9B (p.ej. Llama-3.1-8B-Instruct) | 8 B | 128 K (conocido) | MIT (conocido) | MMLU ~68 (conocido) |

La comparativa es limitada porque no se dispone de datos de rendimiento ni de licencia para este checkpoint. Arquitectónicamente es un transformer denso de 9,4 B, similar a otros modelos de su rango, pero su naturaleza intermedia y la falta de validación (0 descargas, 0 likes) lo hacen incomparable en términos prácticos con modelos finales como Llama-3.1-8B-Instruct.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final, no ha pasado por un proceso de alineación completo ni por evaluación exhaustiva.
- Token EOS incompleto: falta el `eos_token_id` 248046, lo que puede provocar generaciones sin fin o respuestas truncadas incorrectamente.
- Licencia no disponible: no se puede determinar si su uso comercial está permitido, lo que supone un riesgo legal para cualquier aplicación.
- Sin datos de sesgos ni alucinación: no se ha evaluado el modelo en estos aspectos.
- Repo sin validación comunitaria: 0 descargas y 0 likes, lo que indica que no ha sido probado ni validado por otros usuarios.
- Fecha de creación futura (2026-08-20): la información puede ser experimental o de un entorno de investigación no consolidado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h077.sft5.step_200
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Origen del checkpoint (backup): `msr-spare/msr-agentic-ptb-dpsk-sft5-intermediates` (no se proporciona URL directa)
- No se han encontrado papers, blogs, demos o repositorios adicionales en la información proporcionada.
