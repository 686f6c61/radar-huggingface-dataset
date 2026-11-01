# lhl616/qwen3-critic-rollout-repeat-20261006-checkpoints

## Resumen

`qwen3-critic-rollout-repeat-20261006-checkpoints` es un archivo de checkpoints de investigación publicado por el usuario lhl616 en HuggingFace. No se trata de un modelo listo para usar con `from_pretrained`, sino de una colección de estados intermedios de entrenamiento derivados de Qwen/Qwen3-4B-Base, organizados por experimento (ramas nativas y de learning rate reducido a la mitad, con una nueva semilla de rollout). El repositorio ocupa 83,6 GB e incluye tanto shards originales de actor y crítico en FP32 como exportaciones BF16 separadas.

El interés técnico reside en que documenta un pipeline de aprendizaje por refuerzo de la familia PPO/VERL sobre una base Qwen3-4B, con críticos que no son modelos causales convencionales sino modelos de valor por token (con cabeza escalar o con cabeza HL-Gauss de 101 logits sobre bins en [-1,2; 1,2]). Es material relevante para investigadores que quieran reproducir, auditar o reutilizar estados de entrenamiento RL, no para desarrolladores que busquen un modelo de inferencia estándar.

La licencia es Apache-2.0 según la model card, aunque se retiene la atribución y licencia de Qwen. No se redistribuye dataset de entrenamiento ni estados de optimizador, lo que limita la continuidad exacta del entrenamiento. La publicación es explícitamente un archivo de checkpoints experimentales, sin reclamación de mejoras de rendimiento estables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3-4B); críticos con cabeza de valor escalar o HL-Gauss de 101 logits |
| Parámetros totales | 4B (modelo base Qwen3-4B-Base; no se detalla variación por checkpoint) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen FP32 original y exportaciones BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con atribución Qwen retenida) |
| Formato de pesos | safetensors (exportaciones BF16), `.pt` (shards FSDP actor/crítico), JSON de configuración y tokenizer |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de un pipeline de RL de la familia PPO implementado con VERL, partiendo de Qwen/Qwen3-4B-Base. Se organizan en cuatro rutas: `lr_half/checkpoints/global_step_308`, `models/lr_half`, `models/native` y `native/checkpoints/global_step_308`. Los actores se guardan como shards FSDP (`model_world_size_4_rank_*.pt`), que requieren las cuatro particiones y utilidades de carga o merge compatibles con PyTorch/VERL. El subdirectorio `huggingface/` contiene solo configuración y tokenizer, no pesos fusionados.

Los críticos son modelos de valor por token, no modelos causales: la variante nativa usa una cabeza escalar; la variante HL-Gauss usa 101 logits sobre bins que cubren [-1,2; 1,2], con centros en `-1,2 + (i+0,5)*2,4/101` y valor calculado como media ponderada por softmax FP32 de esos centros. Los objetivos gaussianos usan sigma `0,75*2,4/101`. El archivo categórico incluye además una implementación matemática de referencia pequeña que depende del entorno VERL original para sus hooks de entrenamiento. No se incluyen estados de optimizador (muchos estados Adam ya se habían eliminado antes de la publicación), por lo que la continuación exacta no es posible aunque se conserven archivos pequeños de RNG, scheduler y dataloader.

## Capacidades

- Almacenamiento de estados de entrenamiento RL: actores y críticos en distintas ramas experimentales (nativa y learning rate a la mitad).
- Evaluación de modelos de valor por token: críticos con cabeza escalar o HL-Gauss para estimación de retorno.
- Exportación BF16 de actores para evaluación separada de los shards FP32 originales.
- Implementación de referencia matemática para la cabeza categórica HL-Gauss.
- No es un modelo causal listo para generación de texto, tool calling, agentes ni razonamiento directo.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales: thinking mode, visión o audio no disponibles.

## Casos de uso

- Auditoría de pipelines RL: inspeccionar los checkpoints de actor y crítico para verificar la evolución del entrenamiento PPO/VERL sobre Qwen3-4B y detectar divergencias entre ramas.
- Reproducción parcial de experimentos: cargar los shards FSDP con las cuatro particiones y utilidades VERL para reanudar evaluación, asumiendo que no hay continuación exacta por falta de estado de optimizador.
- Investigación sobre funciones de valor: comparar la cabeza escalar nativa con la cabeza HL-Gauss de 101 bins en términos de calibración y distribución de retornos.
- Desarrollo de utilidades de merge: usar los shards y las exportaciones BF16 como casos de prueba para herramientas de fusión de checkpoints FSDP.
- Estudio de recetas de RL: analizar el efecto de reducir el learning rate a la mitad y cambiar la semilla de rollout en las curvas de entrenamiento archivadas.
- Docencia y formación: material didáctico sobre estructura de checkpoints VERL, diferencias FP32/BF16 y dependencias del entorno de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama restauración ni validación de forward pass por la publicación, y que no se afirman mejoras de rendimiento estables ni superioridad causal.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repo completo ocupa 83,6 GB y contiene múltiples checkpoints, no un único modelo desplegable.
- GPU recomendadas: no disponible; el entrenamiento VERL/FSDP con `model_world_size_4` sugiere al menos 4 rangos, pero no se especifican GPUs concretas.
- Cabe en GPU consumer: no disponible; los shards FSDP y los archivos `.pt` no están pensados para inferencia directa en consumer.
- Opciones de despliegue: carga mediante PyTorch/VERL y utilidades de merge compatibles; vLLM, llama.cpp, Ollama o TGI no son aplicables sin fusionar y convertir previamente los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-critic-rollout-repeat-20261006-checkpoints | 4B (base) | no disponible | Checkpoints RL (actor/crítico) | Apache-2.0 | HuggingFace, repo de 83,6 GB |
| Qwen/Qwen3-4B-Base | 4B | no disponible en esta ficha | Modelo causal base | Apache-2.0 (según Qwen) | HuggingFace |
| Otros checkpoints VERL/PPO sobre Qwen3-4B | 4B | no disponible | Checkpoints RL | variable | no disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo `from_pretrained`: el root del repositorio no constituye un modelo Transformers único; requiere organización por experimento y checkpoint.
- Los actores FSDP requieren las cuatro particiones `model_world_size_4_rank_*.pt` y utilidades compatibles con PyTorch/VERL.
- Los críticos no son modelos causales: la cabeza escalar o HL-Gauss debe interpretarse según la fórmula indicada; no generan texto.
- No se incluyen estados de optimizador, por lo que la continuación exacta del entrenamiento no es posible.
- No se reclama validación de restauración ni de forward pass; la publicación por sí sola no garantiza que los checkpoints carguen correctamente.
- Solo deben cargarse artefactos `.pt` basados en pickle en entornos de confianza.
- Posibles rutas internas redactadas en copias JSON de configuración, indicadas en `archive_manifest.json`; los tensores originales no se modifican.
- El manifiesto describe cobertura completa prevista, pero las subidas pueden estar en curso; no todos los archivos listados pueden estar presentes.
- Riesgo de alucinación y sesgos: no aplica directamente al no ser un modelo generativo desplegable; cualquier evaluación de sesgo debe hacerse sobre el actor fusionado.
- Restricciones de licencia: Apache-2.0 con atribución Qwen retenida; no se redistribuye dataset de entrenamiento.
- Las ramas de continuación y las muestras de política propia no son evaluaciones emparejadas intercambiables.

## Enlaces

- HuggingFace: https://huggingface.co/lhl616/qwen3-critic-rollout-repeat-20261006-checkpoints
- Modelo base citado: https://huggingface.co/Qwen/Qwen3-4B-Base
- VERL (framework de entrenamiento RL mencionado): no disponible en la información proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
