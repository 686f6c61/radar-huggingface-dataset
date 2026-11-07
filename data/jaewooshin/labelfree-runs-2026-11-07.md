# JaeWooShin/labelfree-runs-2026-11-07

## Resumen

`JaeWooShin/labelfree-runs-2026-11-07` no es un modelo entrenado para uso directo, sino un espejo de checkpoints intermedios y logs generados durante experimentos de aprendizaje por refuerzo con verificación (RLVR, Reinforcement Learning with Verifiable Rewards) sin etiquetas, partiendo de `Qwen/Qwen2.5-Math-1.5B` en la revisión `4a83ca6e4526a4f2da3aa259ec36c259f66b2ab2`. El autor, Jae Woo Shin, publica los artefactos crudos de dos ejecuciones de 300 pasos entrenadas con el kit `labelfree_runs_kit_2026-11-07` usando la librería verl, con el objetivo de permitir la reproducción y el análisis de las dinámicas de entrenamiento en lugar de ofrecer un checkpoint listo para producción.

El interés del repositorio reside en el método: una de las ejecuciones aplica GRPO con voto por mayoría (majority-vote) sin etiquetas y una penalización de rango 1 fuera de banda (off-band) alrededor de la dirección del gradiente de entropía (λ = 1); la otra implementa INTUITOR, una recompensa basada en la autocerteza del modelo descrita por Zhao et al. en el artículo arXiv:2505.19590. Ambos experimentos exploran cómo obtener señal de recompensa sin supervisión externa, un problema abierto en el ajuste de modelos de razonamiento matemático.

El tamaño del repositorio es de 1,1 GB e incluye pesos en formato de state dict de FSDP2 (no en formato `transformers`), estados del optimizador AdamW, estados del dataloader y logs. La licencia declarada es Apache 2.0, heredada del modelo base Qwen2.5-Math-1.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Math-1.5B) |
| Parametros totales | 1,5 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato FSDP2, no cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | State dict FSDP2 (`.pt`) por rango; incluye `fsdp_config.json` y carpeta `huggingface/` con config y tokenizer |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Math-1.5B, un transformer decoder-only de 1,5 mil millones de parámetros especializado en matemáticas. Sobre él se aplican dos recetas de RLVR sin etiquetas mediante verl: la primera combina GRPO con voto por mayoría y una penalización de rango 1 fuera de banda en la dirección del gradiente de entropía (λ = 1); la segunda usa INTUITOR, que sustituye la recompensa verificable por una señal de autocerteza del propio modelo (Zhao et al., arXiv:2505.19590).

La configuración de entrenamiento es idéntica en ambas ejecuciones: 64 prompts × 16 muestras por paso, tasa de aprendizaje constante de 5e-7, sin término KL, temperatura 1, 300 pasos, checkpoint cada 50 pasos y FSDP2 sobre una única GPU. No se especifica el número total de tokens de entrenamiento ni la composición del dataset de prompts. Cada carpeta de checkpoint contiene los pesos del actor, el estado del optimizador AdamW, el estado extra de FSDP2, la configuración de FSDP, la configuración y el tokenizer en formato Hugging Face, y el estado del dataloader (`data.pt`). Los archivos se verifican por hash antes de eliminar la copia local.

## Capacidades

- Generación de texto y razonamiento matemático, heredados del modelo base Qwen2.5-Math-1.5B.
- Los checkpoints son estados intermedios de un proceso de RL; no se ha validado su calidad final ni su estabilidad.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de lo que ofrece el modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Reproducción de experimentos de RLVR sin etiquetas: los checkpoints y logs permiten reanudar o auditar las ejecuciones de 300 pasos con verl, comparando la receta de voto por mayoría con penalización de entropía frente a INTUITOR.
- Investigación sobre recompensas sin supervisión: el par de ejecuciones sirve para estudiar si la autocerteza (INTUITOR) es una señal viable frente al voto por mayoría en tareas matemáticas.
- Análisis de dinámicas de entrenamiento: los checkpoints cada 50 pasos y los logs (`train.log`, `run.json`) permiten trazar la evolución de la entropía, la recompensa y la precisión a lo largo del entrenamiento.
- Estudio de la penalización off-band en el gradiente de entropía: la ejecución `qwen_band_entropy_grad_s0` permite aislar el efecto de λ = 1 sobre el colapso de entropía en GRPO.
- Desarrollo de kits de entrenamiento: el repositorio documenta el layout exacto de salida de verl con FSDP2, útil para validar herramientas de conversión de checkpoints a formato `transformers`.
- Comparación de metodologías RLVR: los artefactos permiten contrastar ambas recetas con otras publicaciones que usan el mismo modelo base, siempre que se conviertan los pesos FSDP2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una carpeta `eval_step300/` con una batería de benchmarks y un archivo `lead_u_cosine_vs_true.json` que se generan al finalizar cada ejecución, pero no se incluyen los valores en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo de 1,5 mil millones de parámetros en FP16 se requiere aproximadamente 3 GB de pesos, pero los checkpoints distribuidos están en formato FSDP2 y requieren conversión previa.
- GPU recomendadas: el entrenamiento se realizó con FSDP2 sobre una única GPU, sin especificar el modelo exacto.
- Compatibilidad con GPU de consumo: no confirmada; depende de la conversión de los pesos FSDP2 a `transformers` o GGUF.
- Opciones de despliegue: no se documentan; los pesos no están en formato `transformers` ni GGUF, por lo que no son directamente utilizables con vLLM, llama.cpp, Ollama o TGI sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `JaeWooShin/labelfree-runs-2026-11-07` | 1,5 B (base) | no disponible | Apache 2.0 | Checkpoints FSDP2, no listos para inferencia |
| `Qwen/Qwen2.5-Math-1.5B` | 1,5 B | no disponible | Apache 2.0 | Pesos en formato `transformers`, listos para uso |
| Otros modelos RLVR de 1,5 B | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas RLVR del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los checkpoints no están en formato `transformers` ni GGUF; requieren conversión desde el state dict FSDP2 antes de poder usarse para inferencia.
- Son estados intermedios de un proceso de RL de 300 pasos; no se ha validado su calidad, estabilidad ni ausencia de degradación respecto al modelo base.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe específicos de estos checkpoints.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Math-1.5B tiene sus propias condiciones que deben respetarse.
- El repositorio no incluye una model card de uso; está pensado para investigación y reproducción, no para despliegue en producción.
- La fecha de creación indicada (2026-11-07) y el nombre del kit sugieren un entorno experimental; conviene verificar la integridad de los archivos antes de reutilizarlos.
- No se especifican los prompts de entrenamiento ni el dataset, lo que limita la reproducibilidad completa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JaeWooShin/labelfree-runs-2026-11-07
- Perfil del autor: https://huggingface.co/JaeWooShin/models
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Artículo INTUITOR (Zhao et al.): https://arxiv.org/abs/2505.19590
