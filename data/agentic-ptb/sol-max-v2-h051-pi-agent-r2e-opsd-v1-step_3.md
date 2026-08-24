# agentic-ptb/sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_3

## Resumen

`sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_3` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9,4B) construido a partir de `Qwen/Qwen3.5-9B-Base`, y corresponde a la hora 51,95 de un run de 100 horas dentro de la celda experimental `sol-max-v2`, dirigida por un driver basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento `max`.

El checkpoint está pensado como material de evaluación intermedia dentro de un pipeline de investigación sobre entrenamiento de agentes. Su identificador codifica la hora del run (`h051`), la familia (`pi-agent-r2e-opsd-v1`) y el paso (`step_3`), lo que permite situarlo directamente sobre la curva de rendimiento temporal de los experimentos. No es un modelo final listo para producción, sino un artefacto de investigación con utilidad principal para reproducir o comparar resultados del sweep.

La relevancia actual del modelo es limitada fuera del contexto del proyecto AgentPTB: no se han publicado benchmarks, licencia ni documentación de capacidades más allá de la model card. Su interés radica en que ejemplifica un patrón de publicación de checkpoints intermedios con metadatos precisos de entrenamiento, y en que hereda la arquitectura vision de Qwen3.5-9B-Base, aunque sin el preprocesador de imágenes exportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vision, con tower de vision presente en los pesos) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B-Base, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, que emplea la arquitectura `Qwen3_5ForConditionalGeneration`, una variante con torre de visión integrada. Según la model card, la torre de visión está presente en los pesos de este checkpoint, pero el proyecto `prime-rl` no exporta `preprocessor_config.json`, por lo que el modelo no puede procesar imágenes tal como se distribuye y debe servirse como texto puro.

El entrenamiento se enmarca en un barrido experimental del proyecto AgentPTB. El run completo dura 100 horas; este checkpoint se escribió a las 51,95 horas. El driver del experimento es un agente basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento `max`, lo que sugiere que el entrenamiento involucra generación de datos o evaluación guiada por un modelo de alto razonamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El `eos_token_id` es `248046` (`<|im_end|>`), correcto para la plantilla de chat de Qwen3.5, lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

- Generación de texto autoregresiva basada en la arquitectura Qwen3.5-9B-Base, con soporte de plantilla de chat (`<|im_end|>` como token de fin de turno).
- Razonamiento multi-paso: el checkpoint proviene de un run orientado a agentes, por lo que se espera cierta capacidad de razonamiento encadenado, aunque no hay evidencia publicada de ello.
- Capacidades de visión teóricamente presentes en la arquitectura, pero inutilizables en la práctica por la ausencia de `preprocessor_config.json`.
- Sin soporte declarado de tool calling, function calling, ni modos especiales (thinking, audio, etc.) en la información disponible.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite replicar o continuar el barrido AgentPTB en la hora 51,95, comparando métricas con otros checkpoints del mismo run.
- Evaluación de curvas de rendimiento temporal: al codificar la hora en el identificador, sirve para trazar la evolución de capacidades a lo largo del entrenamiento de 100 horas.
- Análisis de dinámicas de entrenamiento con agentes: útil para estudiar cómo un driver de alto razonamiento (Codex / gpt-5.6-sol) influye en la calidad de los checkpoints intermedios.
- Pruebas de servido con vLLM en modo texto: puede desplegarse como modelo de chat de 9,4B usando el flag `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para evitar errores de carga.
- Comparación de checkpoints con y sin `eos_token_id` correcto: la model card advierte que los checkpoints sin `248046` sobrepasan el contexto, por lo que este sirve como referencia de evaluación válida.
- Desarrollo de pipelines de publicación de checkpoints intermedios: su esquema de nombres (`{cell}.h{HHH}.{family}.{step}`) es un ejemplo de trazabilidad reproducible para otros proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. El único dato de rendimiento indirecto es la advertencia sobre el `eos_token_id`: al ser correcto, las evaluaciones que se realicen sobre este checkpoint serán mediciones válidas, no suelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; para un modelo de 9,4B en FP16 se estiman aproximadamente 19-20 GB de VRAM, y en cuantización INT4 alrededor de 6-7 GB, pero no hay datos confirmados del proyecto.
- GPU recomendadas: no especificadas; por tamaño, una GPU con 24 GB (RTX 3090/4090, A10G) podría servir en FP16, y GPUs de 8-12 GB con cuantización.
- Cabe en GPU de consumo: probablemente sí con cuantización (por ejemplo, GGUF), aunque no se han publicado conversiones.
- Opciones de despliegue: vLLM es la opción documentada en la model card, con el flag obligatorio `--limit-mm-per-prompt`. También podría usarse llama.cpp u Ollama si se convierte a GGUF, pero no hay soporte oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un checkpoint intermedio de un proyecto de investigación sin benchmarks publicados, por lo que no se puede comparar con alternativas de la misma categoría (por ejemplo, otros fine-tunes de Qwen3.5-9B-Base) de forma objetiva. Se recomienda consultar el índice `agentic-ptb/INDEX` para localizar otros checkpoints del mismo sweep y compararlos entre sí.

## Limitaciones y advertencias

- Modelo intermedio: no es un release final; fue diseñado para evaluación dentro de un barrido, no para uso en producción.
- Sin licencia declarada: no se puede determinar si su uso comercial está permitido; se debe contactar al autor antes de cualquier despliegue.
- Sin preprocesador de visión: aunque la arquitectura incluye torre de visión, el modelo no puede procesar imágenes tal como se distribuye; forzar el modo texto es obligatorio en vLLM.
- Riesgo de alucinación y sesgos: no evaluados; al ser un checkpoint de entrenamiento, no hay garantías de seguridad ni de alineación.
- Contexto y eos: aunque el `eos_token_id` es correcto, la longitud de contexto no está documentada; se recomienda no exceder los límites típicos de Qwen3.5-9B-Base sin verificación.
- Reproducibilidad limitada: los datos de entrenamiento (tokens, dataset, hiperparámetros) no están publicados, lo que impide replicar el entrenamiento completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h051.pi-agent-r2e-opsd-v1.step_3
- Índice de checkpoints AgentPTB (referenciado en la model card): `agentic-ptb/INDEX` (no se ha encontrado URL directa en la búsqueda)
- Búsqueda de modelos con tag `agentic-ptb`: https://huggingface.co/models?other=agentic-ptb
