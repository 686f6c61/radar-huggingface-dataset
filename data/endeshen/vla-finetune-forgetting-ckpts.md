# endeshen/vla-finetune-forgetting-ckpts

## Resumen

`endeshen/vla-finetune-forgetting-ckpts` es una colección de checkpoints finales de ajuste fino del modelo vision-language-action pi0.5 sobre tareas del benchmark LIBERO, publicada por el usuario endeshen. No es un modelo base nuevo, sino un conjunto de exportaciones en PyTorch (formato openpi) que documentan una línea de experimentos de RL (GRPO) y SFT sobre el checkpoint `pi05_libero`, usado como punto de partida (`step20`). El repositorio incluye resultados sobre LIBERO-10 tarea 8 ("put both moka pots on the stove") y LIBERO-90 tareas 38, 60 y 64.

El interés del repositorio es principalmente empírico y de investigación: permite estudiar fenómenos de olvido catastrófico y transferencia durante el ajuste fino de políticas robóticas, comparando GRPO con SFT sobre rollouts propios o demos humanas, con distintas semillas, tasas de aprendizaje y resoluciones de imagen (128 px frente a 256 px). Cada carpeta contiene `model.safetensors`, `config.json` y estadísticas de normalización en `assets/`, con la configuración `pi05_libero`.

El tamaño del repositorio es de 338,7 GB, coherente con el almacenamiento de decenas de checkpoints completos de un VLA de tamaño moderado. La licencia es Apache-2.0, aunque los pesos derivan de PaliGemma y quedan también sujetos a los Gemma Terms of Use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5 (openpi), basada en PaliGemma |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0, sujeta además a Gemma Terms of Use |
| Formato de pesos | safetensors (exportación PyTorch de openpi, con `config.json` y `assets/`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es pi0.5, un modelo vision-language-action de openpi construido sobre PaliGemma, que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras para control robótico. La configuración utilizada en todos los checkpoints es `pi05_libero`, es decir, la variante ajustada para el benchmark LIBERO. Los pesos base proceden de `gs://openpi-assets/checkpoints/pi05_libero`, convertidos a PyTorch.

El entrenamiento documentado en este repositorio parte del checkpoint `step20`, obtenido mediante GRPO (implementado con RLinf) sobre LIBERO-10 tarea 8 en la iteración 20. A partir de ahí se ramifican dos familias de experimentos: por un lado, GRPO adicional sobre las tareas 64 y 38, con distintas iteraciones y niveles de ruido (sigma 0.25); por otro, SFT sobre rollouts exitosos propios, rollouts exitosos de GRPO, demos humanas a 128 px y 256 px, y combinaciones de demos de varias tareas, con múltiples semillas y tasas de aprendizaje (1e-6, 1e-5, 2e-6, además de una variante de learning rate alto). Los checkpoints intermedios de algunas ejecuciones se publican en `endeshen/vla-finetune-forgetting-ckpts-intermediate` y los datos de entrenamiento en `endeshen/vla-finetune-rollouts`.

## Capacidades

- Generación de acciones robóticas a partir de instrucciones en lenguaje natural e imágenes (visión-lenguaje-acción).
- Ejecución de tareas de manipulación del benchmark LIBERO: LIBERO-10 tarea 8 y LIBERO-90 tareas 38, 60 y 64.
- Ajuste fino supervisado (SFT) y aprendizaje por refuerzo (GRPO) sobre rollouts propios y demos humanas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el modelo es una política de control, no un agente conversacional.
- Capacidades multilingües: no disponible.
- Capacidades especiales: exportación compatible con openpi en PyTorch, con estadísticas de normalización incluidas para despliegue reproducible.

## Casos de uso

- Investigación sobre olvido catastrófico en VLAs: comparar los checkpoints de SFT y GRPO sobre la misma tarea permite medir cuánto se degrada el rendimiento en tareas previas (por ejemplo, tarea 8) tras ajustar en tareas nuevas (38, 60, 64) bajo distintas recetas.
- Estudio de RL frente a SFT para políticas robóticas: los pares `task2b_A_*` (GRPO) y `task2b_sft_B_RL*` (SFT sobre rollouts de GRPO) permiten aislar el efecto del algoritmo con datos equivalentes.
- Análisis de sensibilidad a hiperparámetros: las variantes con semillas múltiples (`_s1`, `_s2`), tasas de aprendizaje (1e-6, 1e-5, 2e-6, learning rate alto) y ruido sigma 0.25 permiten estudiar varianza y estabilidad del entrenamiento.
- Evaluación del efecto de la resolución de entrada: la comparación entre demos a 128 px (`task2b_sft_C*`) y 256 px (`task2b_sft_C256*`) sirve para analizar cómo afecta la resolución al rendimiento y a la transferencia.
- Reproducción de experimentos de ajuste fino con openpi: cada carpeta es un export listo para cargar con la configuración `pi05_libero`, con estadísticas de normalización incluidas, lo que facilita replicar resultados en entornos de simulación LIBERO.
- Estudio de mezcla de datos humanos y sintéticos: las variantes `task2b_sft_D` (demos a 256 px más rollouts propios de la tarea 8) y `task2b_sft_D_demos` (demos a 256 px más demos humanas de la tarea 8) permiten comparar el impacto de cada fuente de datos en el olvido de la tarea original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de pi0.5, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exportación PyTorch de openpi con configuración `pi05_libero`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a políticas VLA).
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 338,7 GB, por lo que conviene descargar solo las carpetas de checkpoints necesarias.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|
| endeshen/vla-finetune-forgetting-ckpts | Checkpoints de ajuste fino de pi0.5 (VLA) | LIBERO-10 tarea 8; LIBERO-90 tareas 38, 60, 64 | Apache-2.0 + Gemma Terms of Use | Hugging Face |
| openpi `pi05_libero` (checkpoint base) | VLA pi0.5 ajustado a LIBERO | Benchmark LIBERO completo | Apache-2.0 + Gemma Terms of Use | gs://openpi-assets |
| endeshen/vla-finetune-forgetting-ckpts-intermediate | Checkpoints intermedios de los mismos runs | Subconjunto de las mismas tareas | Apache-2.0 + Gemma Terms of Use | Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento comparativo de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo base ni un modelo de propósito general: son checkpoints de investigación para tareas concretas de LIBERO, no aptos para despliegue en robótica real sin validación adicional.
- El nombre del repositorio sugiere que el fenómeno estudiado es el olvido durante el ajuste fino; es esperable que varios checkpoints hayan perdido rendimiento en tareas previas, por lo que no deben usarse a ciegas como políticas finales.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de las tareas entrenadas.
- Idiomas y contexto no están especificados; el uso de instrucciones en lenguaje natural queda limitado a lo observado en LIBERO.
- La licencia Apache-2.0 se combina con los Gemma Terms of Use por derivar de PaliGemma; es necesario revisar ambas antes de cualquier uso comercial.
- El tamaño del repositorio (338,7 GB) y la multiplicidad de checkpoints dificultan su descarga y gestión; conviene seleccionar carpetas concretas.
- No hay métricas publicadas de éxito por tarea, latencia ni robustez, lo que impide evaluar su calidad sin ejecutar los experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/endeshen/vla-finetune-forgetting-ckpts
- Checkpoints intermedios: https://huggingface.co/endeshen/vla-finetune-forgetting-ckpts-intermediate
- Datos de entrenamiento (rollouts): https://huggingface.co/endeshen/vla-finetune-rollouts
- Pesos base openpi `pi05_libero`: gs://openpi-assets/checkpoints/pi05_libero
