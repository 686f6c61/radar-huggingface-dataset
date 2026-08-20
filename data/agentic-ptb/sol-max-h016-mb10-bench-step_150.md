# agentic-ptb/sol-max.h016.mb10-bench.step_150

## Resumen

`agentic-ptb/sol-max.h016.mb10-bench.step_150` es un checkpoint intermedio generado durante un barrido de hiperparámetros (sweep) del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un artefacto de investigación, no de un modelo final listo para producción: corresponde a la hora 16,26 de un run de 100 horas, dentro de la celda `sol-max` (driver Codex / gpt-5.6-sol con razonamiento `max`). El modelo base es `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors.

La relevancia de este checkpoint es metodológica: su identificador codifica la hora del run (`h016`), lo que permite mapearlo directamente sobre las curvas de rendimiento del sweep. Sin embargo, presenta una advertencia crítica: el `eos_token_id` está incompleto (falta el token `248046`, correspondiente a `<|im_end|>`), por lo que el modelo no detiene correctamente las respuestas y puede desbordar la ventana de contexto. Esto invalida cualquier evaluación directa como medición fiable, y lo desaconseja para uso práctico sin un reempaquetado previo.

No se dispone de licencia, idiomas soportados, ni pipeline declarados en la ficha de HuggingFace. Toda la información técnica disponible proviene de la model card del autor y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer decoder-only de 9.400 millones de parámetros. No se han publicado detalles sobre la configuración exacta de capas, cabezas de atención o dimensiones ocultas en la información disponible.

El entrenamiento forma parte de un barrido de AgentPTB: un run de 100 horas dirigido por un agente (driver) basado en Codex / gpt-5.6-sol con razonamiento `max`. El checkpoint se escribió a las 16,26 horas del run (h016), en la celda `sol-max`. No se especifica el conjunto de datos utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF, DPO o SFT convencional. La model card indica que la celda "murió" alrededor de la hora 16, con paneles demasiado pequeños para clasificar, lo que sugiere que el entrenamiento no completó su curso.

Una innovación destacable es el sistema de nomenclatura del repositorio: `{cell}.h{HHH}.{family}.{step}`, donde `hHHH` es la hora del run, lo que permite situar cada checkpoint en el eje temporal de las gráficas de evaluación del sweep.

## Capacidades

Al tratarse de un checkpoint intermedio con el `eos_token_id` incompleto, no se han evaluado ni documentado capacidades específicas. Las capacidades observables serían las heredadas del modelo base `Qwen/Qwen3.5-9B-Base`, pero no se dispone de datos verificados sobre ellas en esta ficha. Se puede afirmar únicamente que:

- El modelo es capaz de generar texto, pero no detiene correctamente las respuestas (falta el token de fin de turno).
- No se ha verificado soporte para tool calling, razonamiento multi-paso, ni capacidades multilingües.
- No se ha confirmado ningún modo especial (thinking, visión, audio, etc.).

Cualquier uso práctico requiere reempaquetar el modelo añadiendo el token `eos` faltante y re-evaluar.

## Casos de uso

Dado su carácter de artefacto de investigación y su estado incompleto, los casos de uso son limitados y orientados a análisis técnico:

- **Análisis de dinámicas de entrenamiento**: estudiar cómo evoluciona el rendimiento a lo largo de las horas del run, comparando este checkpoint (h016) con otros de la misma celda o de celdas diferentes.
- **Investigación sobre curvas de pérdida y sobreajuste**: examinar si a las 16 horas el modelo muestra signos de subentrenamiento o de colapso, dado que la celda "murió" en ese punto.
- **Estudio de la sensibilidad al token EOS**: analizar el impacto de la ausencia del token `<|im_end|>` en la generación y en las métricas de evaluación, como caso de estudio de errores de configuración.
- **Desarrollo de pipelines de reempaquetado**: usar este checkpoint como caso de prueba para corregir el `eos_token_id` y validar procedimientos de post-procesado.
- **Comparación de checkpoints dentro del sweep**: alinear este checkpoint con otros de la misma familia (`mb10-bench`) para trazar la progresión temporal.
- **Reproducibilidad de experimentos**: servir como referencia para reproducir el pipeline de AgentPTB y verificar la consistencia de los artefactos generados.

No es adecuado para aplicaciones de producción, atención al cliente, generación de código o cualquier tarea que requiera respuestas completas y fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "suelo, no una medición", debido al `eos_token_id` incompleto, y solo deberían compararse con otros checkpoints con el mismo estado de EOS. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 9.409.813.744 parámetros y 18,8 GB en safetensors, la inferencia en FP16 requiere aproximadamente 19-20 GB de VRAM (más overhead de activaciones). En cuantización 8-bit se reduciría a ~9,5 GB, y en 4-bit a ~4,7 GB, pero no se ofrecen cuantizaciones oficiales.
- **GPU recomendadas**: una A100 de 40 GB o 80 GB, o una RTX 4090 de 24 GB (con cuantización) podrían ejecutar el modelo. Una RTX 3090 de 24 GB también sería viable en FP16 con márgenes ajustados.
- **¿Cabe en GPU de consumo?**: sí, en una RTX 4090 o 3090 con cuantización 8-bit o 4-bit, aunque no se proporcionan pesos cuantizados.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama o TGI podrían cargar el modelo, pero el `eos_token_id` incompleto hará que las respuestas no terminen correctamente, por lo que no se recomienda su despliegue sin corrección previa.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `agentic-ptb/sol-max.h016.mb10-bench.step_150` | 9,4B | no disponible | no disponible | Checkpoint intermedio, EOS incompleto |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible | no disponible | Modelo base, completo |
| Otros checkpoints de AgentPTB (misma familia) | 9,4B | no disponible | no disponible | Checkpoints intermedios, distintos estados |

No se dispone de información suficiente para comparar rendimiento con modelos similares de la misma categoría (p. ej., Llama 3.1 8B, Mistral 7B, etc.), ya que no hay benchmarks publicados. La comparación más relevante sería contra el modelo base `Qwen/Qwen3.5-9B-Base`, pero no se han facilitado métricas de ninguno de los dos.

## Limitaciones y advertencias

- **Token EOS incompleto**: falta el token `248046` (`<|im_end|>`), por lo que el modelo no detiene las respuestas y desborda la ventana de contexto. Cualquier evaluación o uso es inválido sin reempaquetado.
- **Checkpoint intermedio**: no es un modelo final; la celda "murió" alrededor de la hora 16, lo que sugiere que el entrenamiento no se completó correctamente.
- **Sin licencia declarada**: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o de redistribución.
- **Sin datos de evaluación**: no hay benchmarks ni métricas fiables; los números existentes son un "suelo" no representativo.
- **Sin información de sesgos o alucinación**: al no haber evaluación, se desconocen los riesgos de sesgo o de generación de contenido falso.
- **No apto para producción**: su uso en aplicaciones reales puede producir respuestas interminables o corruptas.
- **Idiomas y capacidades no verificados**: no se ha confirmado qué idiomas soporta ni qué tareas puede realizar de forma fiable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max.h016.mb10-bench.step_150
- Índice del proyecto (mencionado en la model card, sin URL directa): `agentic-ptb/INDEX` (no disponible en la información proporcionada)
