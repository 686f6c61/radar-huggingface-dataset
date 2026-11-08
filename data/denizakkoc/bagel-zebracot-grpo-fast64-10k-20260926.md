# denizakkoc/BAGEL-ZebraCoT-GRPO-Fast64-10k-20260926

## Resumen

BAGEL-ZebraCoT-GRPO-Fast64-10k-20260926 es un archivo de checkpoints de investigación publicado por el usuario denizakkoc en Hugging Face. No se trata de un modelo autónomo listo para usar, sino de un conjunto de pesos entrenables (adaptadores LoRA de rango 64 y alpha 128) aplicados sobre el modelo base multimodal `multimodal-reasoning-lab/Bagel-Zebra-CoT`, que a su vez deriva de la arquitectura BAGEL. El repositorio contiene tres checkpoints supervivientes del segmento de entrenamiento de septiembre de 2026, con un total de 3,9 GB.

El objetivo del experimento es el ajuste fino mediante GRPO (Group Relative Policy Optimization) con LoRA sobre tareas de razonamiento visual, usando el dataset Zebra-CoT. El entrenamiento completa exactamente una pasada ordenada de 10 000 ejemplos, con configuraciones de 32 GPUs de política y 32 GPUs juez dedicadas, y un tramo final de 16 ejemplos con 16 GPUs. La relevancia actual es limitada: se trata de un checkpoint de investigación que preserva variantes intermedias y estados del optimizador, no de un modelo optimizado para producción.

La model card es explícita: son checkpoints de adaptadores/pesos entrenables personalizados, no modelos fusionados independientes ni exportaciones estándar de PEFT `save_pretrained`. Para utilizarlos es imprescindible descargar el modelo base y cargar los pesos con el código personalizado del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BAGEL multimodal (base `multimodal-reasoning-lab/Bagel-Zebra-CoT`); adaptadores LoRA sobre expertos de comprensión y generación |
| Parametros totales | no disponible (el repo contiene solo los pesos entrenables LoRA, 3,9 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en el formato original del estado entrenable de BAGEL) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | estado de diccionario de parámetros entrenables de BAGEL (no safetensors estándar, no GGUF, no exportación PEFT) |

## Arquitectura y entrenamiento

El modelo base es BAGEL-Zebra-CoT, una arquitectura multimodal de la familia BAGEL que combina expertos de comprensión y generación. Sobre ella se aplican adaptadores LoRA de rango 64 y alpha 128, adaptando ambos expertos. El entrenamiento emplea GRPO con dos rollouts por prompt, usando GPUs NVIDIA A100 en el clúster CINECA Leonardo. Las GPUs de política ejecutan el modelo entrenable y las GPUs juez ejecutan modelos de recompensa congelados, en concreto Qwen2.5-VL-72B-AWQ en los experimentos de octubre.

El segmento documentado arranca de la ejecución del paper fixed-v3 en 3 360 ejemplos, conservando pesos y estado de Adam. Procesa 6 624 ejemplos adicionales con 32 GPUs de política y 32 GPUs juez, y los 16 finales con 16 GPUs. Los checkpoints de septiembre usaron comúnmente resolución de 256 px, ocho pasos de difusión y dos candidatos, configuración que no debe confundirse con el entrenamiento de octubre a 512 px, 50 pasos y seis candidatos. El dataset principal de 10 000 ejemplos cubre 13 categorías: búsqueda visual, puzles, ajedrez, tetris, cifrados, laberintos, matrices estilo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva. El hash de orden del dataset es `36d8d46fa8cb9c832f75554806188221b33cc673b21d2a46945ddf6b9d43dd43`.

## Capacidades

- Razonamiento visual multimodal sobre tareas de búsqueda visual, matrices de Raven, ARC-AGI, geometría y física.
- Resolución de puzles estructurados: ajedrez, tetris, laberintos, cifrados y jigsaw.
- Razonamiento algorítmico y programación competitiva.
- Cadena de pensamiento visual (Zebra-CoT) como formato de razonamiento intermedio.
- Generación multimodal mediante el experto de generación del modelo base BAGEL.
- Ajuste orientado a recompensa mediante GRPO, lo que favorece respuestas con mayor tasa de acierto en tareas verificables.
- Soporte de tool calling, agentes y multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Investigación en razonamiento visual con RL: el checkpoint sirve para reproducir o comparar trayectorias de entrenamiento GRPO sobre el dataset Zebra-CoT, ya que conserva estados intermedios y metadatos de configuración.
- Evaluación de métodos de reward modeling multimodal: permite estudiar cómo influyen los jueces congelados (Qwen2.5-VL-72B-AWQ) en la optimización de políticas con LoRA.
- Análisis de sensibilidad a batch y world size: el autor documenta que cambiar el tamaño de lote altera la trayectoria de optimización, por lo que el checkpoint es útil para estudiar estabilidad del entrenamiento.
- Reproducción de experimentos con ARC-AGI y matrices de Raven: el dataset incluye estas categorías, adecuadas para medir razonamiento abstracto en modelos multimodales.
- Estudio de adaptadores LoRA sobre arquitecturas multimodales con expertos separados de comprensión y generación.
- Base para experimentos de continuación de entrenamiento: el manifiesto incluye cursores de datos y metadatos que permiten reanudar desde un punto exacto.
- Docencia e investigación académica sobre GRPO multimodal, dado que el archivo preserva variantes fallidas e intermedias en lugar de solo el mejor checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible. La model card menciona que existen "evaluaciones almacenadas", pero el fragmento proporcionado se interrumpe antes de mostrar las puntuaciones. No se deben inferir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base BAGEL-Zebra-CoT completo, no solo de los adaptadores LoRA de 3,9 GB.
- GPU recomendadas: el entrenamiento se realizó en NVIDIA A100 en CINECA Leonardo; para inferencia se requiere hardware capaz de ejecutar el modelo base multimodal completo.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo base no se especifica en la información proporcionada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor indica que requiere código personalizado y el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-Fast64-10k-20260926 | no disponible (LoRA sobre base BAGEL) | no disponible | apache-2.0 | Checkpoints de investigación, 0 descargas | Requiere modelo base y código personalizado |
| multimodal-reasoning-lab/Bagel-Zebra-CoT | no disponible | no disponible | no disponible | Modelo base referenciado | Punto de partida del ajuste |
| BAGEL (original) | no disponible | no disponible | no disponible | Repositorio público del proyecto | Arquitectura multimodal base |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base `multimodal-reasoning-lab/Bagel-Zebra-CoT` y código personalizado para cargar los pesos.
- Los checkpoints no son exportaciones estándar de PEFT; no funcionan con `save_pretrained` ni con pipelines convencionales de Hugging Face sin adaptación.
- Solo se soporta inglés según la metadata del repositorio.
- El autor advierte que la exposición a datos SFT públicos y el solapamiento semántico con benchmarks no se han descartado, lo que puede inflar resultados aparentes.
- Cambiar el tamaño de lote o el world size altera la trayectoria de optimización, por lo que la reproducibilidad exacta exige replicar la configuración original.
- Las etiquetas de checkpoint de septiembre cuentan pasos de imagen en rank cero, no ejemplos, lo que complica la comparación directa entre ejecuciones.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible.
- Aunque la licencia es apache-2.0, conviene verificar la licencia del modelo base antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni resultados de benchmarks publicados en el fragmento disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-Fast64-10k-20260926
- Perfil del autor: https://huggingface.co/denizakkoc
- Datasets del autor: https://huggingface.co/denizakkoc/datasets
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-Zebra-CoT
- Dataset Zebra-CoT: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
