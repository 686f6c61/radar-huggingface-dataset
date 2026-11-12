# robinwuzy/BAGEL-VLM-GRPO-LoRA-Sweep

## Resumen

BAGEL-VLM-GRPO-LoRA-Sweep es una colección de deltas de entrenamiento (adaptadores LoRA junto con parámetros de reconstrucción) aplicados sobre el modelo base ByteDance-Seed/BAGEL-7B-MoT, un modelo multimodal de 7B parámetros con arquitectura Mixture-of-Transformers (MoT). El autor, robinwuzy, publica aquí los resultados de un barrido de rangos LoRA (16, 32 y 64) entrenados con GRPO (Group Relative Policy Optimization) sobre un epoch de 20.000 imágenes, con el objetivo de explorar el efecto del rango de adaptación en el ajuste fino multimodal.

El repositorio no contiene un modelo autónomo: cada variante es un delta de parámetros entrenables que requiere el modelo base, el código del proyecto BAGEL-VLM (fork de arj-shriv) y la inyección LoRA implementada en `train_closed_loop.launch`. Además de los tensores LoRA de atención de Qwen2, cada delta incluye los parámetros completos de la ruta de reconstrucción en bucle cerrado de BAGEL (`llm2vae`, `vae2llm`, `latent_pos_embed`, `time_embedder`), lo que lo aleja de un adaptador PEFT estándar.

La relevancia es fundamentalmente metodológica: documenta recetas reproducibles de GRPO con LoRA sobre un VLM de 7B, con manifiestos de hashes, auditorías de integridad y snapshots intermedios (step 200/250/300/312/374) para estudiar la dinámica de entrenamiento. El autor no reclama mejoras de calidad downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre BAGEL-7B-MoT (Mixture-of-Transformers multimodal, atención Qwen2) |
| Parametros totales | No disponible (el modelo base BAGEL-7B-MoT tiene 7B; los deltas publicados oscilan entre 39,0 M y 69,3 M de parámetros entrenables) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 (usado en los snapshots Step-4b); no se documentan otras |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (deltas convertidos desde checkpoints .pt no publicados) |

## Arquitectura y entrenamiento

El modelo base es BAGEL-7B-MoT, un transformer multimodal de tipo Mixture-of-Transformers con dos expertos (comprensión y generación) que comparten atención. Sobre él se inyectan adaptadores LoRA en las capas de atención y MLP de Qwen2, además de entrenar por completo la ruta de reconstrucción en bucle cerrado (`llm2vae`, `vae2llm`, `latent_pos_embed`, `time_embedder`), necesaria para la decodificación visual del modelo.

El entrenamiento usa GRPO (optimización de política con recompensa relativa de grupo) sobre un epoch de 20.000 imágenes. El barrido legacy cubre rangos LoRA 16, 32 y 64 con alpha efectivo 32, 64 y 128 respectivamente, 233 tensores por variante y entre 39,0 M y 69,3 M de parámetros entrenables. Los snapshots Step-4b (recipe `bfab210`) usan NF4, `alpha_rec=0`, `beta_kl=0.02` y `num_checkpointed=2`, con 374 pasos finales. Los snapshots Step-4c (recipe `4deac22`) usan `lora_targets="attn_mlp_und"`, `grad_accum_steps=48`, `total_steps=312` y 401 tensores (392 LoRA + 9 de reconstrucción), ejecutados en 2 nodos (16 GPU). El autor verifica conversión bit a bit a safetensors y comprueba que los pesos LoRA A/B cambian, pero no reclama mejoras de calidad downstream.

## Capacidades

- Ajuste fino multimodal sobre BAGEL-7B-MoT: los deltas modifican la comprensión visión-lenguaje y la ruta de reconstrucción visual del modelo base.
- Entrenamiento con GRPO: la receta está orientada a optimización con recompensas relativas de grupo, típica de tareas de razonamiento y alineación.
- Barrido reproducible de rangos LoRA: permite comparar rank 16, 32 y 64 con idénticas condiciones salvo rango y alpha.
- Snapshots intermedios: se publican puntos de control en distintos pasos (200, 250, 300, 312, 374) para estudiar la evolución del entrenamiento.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingües: no disponible (no documentado).
- Capacidades especiales (thinking mode, audio): no disponible (no documentado).

## Casos de uso

- Investigación sobre GRPO en VLMs: usar los snapshots para analizar cómo evoluciona la política con recompensas de grupo en un modelo de 7B, comparando los pasos 200, 250 y 312 con las mismas condiciones.
- Estudio del efecto del rango LoRA: comparar rank 16 frente a 32 y 64 manteniendo el resto de hiperparámetros, para decidir el compromiso entre capacidad de adaptación y coste de almacenamiento (98 MB frente a 219 MB por delta).
- Reproducción de recetas de ajuste multimodal: el repositorio documenta hiperparámetros, hashes y auditorías, lo que permite replicar el pipeline en 16 GPU con el código de BAGEL-VLM.
- Base para ajuste posterior con RLHF/DPO: los deltas GRPO pueden servir como punto de partida para etapas adicionales de alineación sobre BAGEL-7B-MoT.
- Evaluación de integridad de entrenamiento: los manifiestos con SHA256 y las comprobaciones bit a bit sirven como referencia para auditar pipelines de conversión de checkpoints.
- Desarrollo de adaptadores no PEFT: el caso ilustra cómo empaquetar deltas que incluyen parámetros de reconstrucción fuera de las capas LoRA estándar, útil para ingeniería de modelos multimodales con rutas VAE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama mejoras de calidad downstream y que la validación se limita a comprobaciones de integridad (valores finitos, pesos LoRA modificados, conversión bit a bit).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los deltas; requiere cargar el modelo base BAGEL-7B-MoT completo (7B parámetros) más los tensores del delta.
- GPU recomendadas: el entrenamiento se ejecutó en 2 nodos con 16 GPU en total (Step-4c); no se especifica el modelo de GPU.
- ¿Cabe en GPU consumer?: no disponible; el modelo base de 7B podría caber en GPUs de 24 GB con cuantización, pero no se documenta para estos deltas.
- Opciones de despliegue: no disponible; el autor indica que `PeftModel.from_pretrained()` no es suficiente y que se requiere el código de BAGEL-VLM con la inyección LoRA de `train_closed_loop.launch`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BAGEL-VLM-GRPO-LoRA-Sweep (este) | Deltas de 39,0 M a 69,3 M sobre base 7B | No disponible | Apache 2.0 | safetensors | Adaptadores GRPO no PEFT con ruta de reconstrucción |
| ByteDance-Seed/BAGEL-7B-MoT (base) | 7B (MoT) | No disponible | Apache 2.0 | safetensors | Modelo multimodal original sin ajuste GRPO |
| Adaptadores PEFT estándar sobre VLMs de 7B | Depende del rango | Depende del base | Depende del base | safetensors | Compatibles con `PeftModel.from_pretrained()`; este repositorio no lo es |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No son modelos autónomos: cada delta requiere el modelo base ByteDance-Seed/BAGEL-7B-MoT y el código de BAGEL-VLM; no funcionan con `PeftModel.from_pretrained()`.
- No son adaptadores PEFT estándar: incluyen parámetros de reconstrucción (`llm2vae`, `vae2llm`, `latent_pos_embed`, `time_embedder`) que deben copiarse con el rango LoRA correcto.
- Sin evidencia de mejora downstream: el autor declara explícitamente que no reclama mejoras de calidad; la validación es solo de integridad.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible para estos deltas; heredable del modelo base.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia: Apache 2.0, permite uso comercial, pero conviene verificar la licencia del modelo base y del código de BAGEL-VLM.
- Caveat de producción: los checkpoints originales en .pt no se publican; los snapshots legacy y los nuevos usan recetas distintas (NF4, `alpha_rec=0`, `beta_kl=0.02` en Step-4b) que no deben mezclarse.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/robinwuzy/BAGEL-VLM-GRPO-LoRA-Sweep
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Código del proyecto BAGEL-VLM: https://github.com/arj-shriv/BAGEL-VLM
- Receta Step-4c: https://huggingface.co/robinwuzy/BAGEL-VLM-GRPO-LoRA-Sweep/tree/main/step4c_4deac22/README.md
- Manifiesto Step-4c: https://huggingface.co/robinwuzy/BAGEL-VLM-GRPO-LoRA-Sweep/tree/main/step4c_4deac22/manifest.json
- Receta Step-4b: https://huggingface.co/robinwuzy/BAGEL-VLM-GRPO-LoRA-Sweep/tree/main/step4_bfab210/README.md
- Manifiesto Step-4b: https://huggingface.co/robinwuzy/BAGEL-VLM-GRPO-LoRA-Sweep/tree/main/step4_bfab210/manifest.json
