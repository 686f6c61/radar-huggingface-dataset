# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-icelandic-seed1

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre SmolLM2-135M-Instruct, un modelo de lenguaje de 135 millones de parámetros desarrollado originalmente por Hugging Face. El adaptador, publicado por el usuario `jekunz`, aplica una transferencia de conocimiento en dos fases: primero un ajuste fino sobre la porción islandesa de FineWeb-2 y después sobre la porción feroesa del mismo corpus, con el objetivo de dotar al modelo base de capacidad de generación de texto en feroés (código ISO `fo`).

El resultado es un adaptador PEFT (rank 256, alpha 512) que se carga sobre el modelo base ya ajustado en islandés, no sobre SmolLM2 original. Esto implica una cadena de dependencias: para reproducir el modelo final es necesario cargar primero el adaptador islandés y después este adaptador feroés. El autor lo describe explícitamente como un artefacto de investigación sin evaluación amplia.

La relevancia es acotada pero concreta: se trata de un experimento de adaptación lingüística de bajo coste (entrenado en una única A100 de 40 GB) para una lengua de bajos recursos como el feroés, usando datos de FineWeb-2 y una estrategia de transferencia desde una lengua germánica cercana (islandés). No hay benchmarks publicados ni métricas de calidad asociadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parámetros totales | 135M en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada durante el entrenamiento) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | feroés (`fo`) como objetivo; el modelo base soporta inglés y otros idiomas no documentados aquí |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rank 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyección de salida de atención. El adaptador se entrena sobre el checkpoint ya ajustado en islandés (`jekunz/smollm-135m-lora-fineweb-icelandic`), configurando una transferencia secuencial islandés → feroés.

El entrenamiento usa el dataset `HuggingFaceFW/fineweb-2`, con 1 época sobre la porción islandesa y 5 épocas sobre la feroesa. Hiperparámetros: learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo 256), longitud máxima de contexto 2048 tokens, semilla 1 (una de tres semillas de esta configuración) y una única GPU A100 de 40 GB. No se documenta el número de tokens de entrenamiento, la composición exacta del subset feroés ni si hubo etapas de alineación adicionales (RLHF/DPO) más allá del ajuste supervisado sobre texto.

## Capacidades

- Generación de texto en feroés, objetivo principal del ajuste.
- Generación de texto conversacional, heredada de la naturaleza Instruct del modelo base.
- Continuación de texto y modelado de lenguaje sobre corpus tipo web (FineWeb-2).
- Capacidad multilingüe limitada: el adaptador está etiquetado solo para `fo`; el comportamiento en otros idiomas no está documentado.
- Soporte de tool calling / function calling: no disponible (no documentado para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de texto en feroés para experimentación lingüística: el adaptador permite producir texto en feroés con un modelo de 135M parámetros, útil para prototipos de generación en una lengua de bajos recursos donde los modelos grandes no cubren bien el idioma.
- Aumento de datos sintéticos en feroés: puede emplearse para generar corpus adicionales de texto feroés que alimenten posteriores entrenamientos o evaluaciones, dado su bajo coste de inferencia.
- Investigación en transferencia entre lenguas germánicas: la cadena islandés → feroés sirve como caso de estudio reproducible para medir cuánto conocimiento lingüístico se transfiere entre lenguas cercanas con pocos datos.
- Experimentos de adaptación de bajo coste: con 135M parámetros y un adaptador LoRA, es viable ejecutarlo en hardware modesto para estudiar técnicas PEFT sin grandes presupuestos de cómputo.
- Completado de texto y autocompletado en aplicaciones feroesas de nicho: con contexto de 2048 tokens puede asistir en tareas de redacción breve o sugerencia de texto.
- Base para ablaciones de semillas e hiperparámetros: al existir tres semillas de la misma configuración, permite estudiar la varianza del ajuste fino en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M parámetros ocupa aproximadamente 0,27 GB en fp16 y alrededor de 0,14 GB en int8; sumando el adaptador LoRA (repo de 0,2 GB) el consumo total es inferior a 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`; para cuantización e inferencia ligera puede combinarse con llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF (proceso no documentado por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-135M + LoRA feroés) | 135M base + LoRA | 2048 | fo | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct (modelo base) | 135M | 8192 (según ficha original de Hugging Face) | inglés y multilingüe | Apache 2.0 | Hugging Face |
| Adaptador islandés (`jekunz/smollm-135m-lora-fineweb-icelandic`) | 135M base + LoRA | 2048 | is | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo es para investigación y no ha sido evaluado de forma amplia; no hay métricas de calidad, perplejidad ni evaluaciones humanas.
- Riesgo elevado de alucinación y de generar texto incoherente en feroés, dado el tamaño reducido del modelo base (135M) y el ajuste sobre datos web sin filtrado documentado.
- El adaptador depende del checkpoint islandés intermedio: no puede cargarse directamente sobre SmolLM2 original sin pasar por esa cadena.
- Contexto limitado a 2048 tokens durante el entrenamiento; usos con ventanas mayores no están validados.
- Cobertura lingüística restringida a feroés; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Sesgos potenciales heredados de FineWeb-2 (texto web sin curación específica) y del modelo base, no documentados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación previa.
- Solo se publica una de tres semillas; la variabilidad entre semillas no está cuantificada.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-icelandic-seed1
- Modelo base del adaptador (islandés): https://huggingface.co/jekunz/smollm-135m-lora-fineweb-icelandic
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia de modelos de Hugging Face): no disponible en la información proporcionada.
