# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed2

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed2` es un adaptador LoRA (PEFT) desarrollado por el usuario jekunz sobre el modelo base `jekunz/new_scandimerge_2_360`, a su vez derivado de SmolLM2-360M-Instruct. El objetivo es la transferencia de capacidades linguísticas desde modelos entrenados en danés e islandés hacia el feroés, un idioma de bajos recursos, mediante una fusión TIES de los modelos escandinavos seguida de un ajuste fino específico sobre el subconjunto de feroés del corpus FineWeb-2.

El adaptador se ha entrenado con LoRA de rango 256 y alpha 512 sobre los módulos `up_proj`, `down_proj`, `gate_proj` y `o_proj`, con una época por idioma fuente y cinco épocas sobre feroés. El autor lo describe explícitamente como un artefacto de investigación sin evaluación amplia, por lo que debe tratarse como un experimento de transferencia linguística y no como un modelo listo para producción. La relevancia radica en su enfoque de bajo coste (una sola A100 de 40 GB) para idiomas de bajos recursos dentro de la familia escandinava.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato safetensors y una única lengua declarada (`fo`, feroés). Su tamaño de repositorio es de 0,4 GB, coherente con un adaptador LoRA sobre un modelo de 360 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360M en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | feroés (fo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. El autor construye primero un modelo intermedio (`jekunz/new_scandimerge_2_360`) mediante una fusión TIES con pesos iguales de modelos entrenados sobre las porciones danesa e islandesa de FineWeb-2. Sobre esa base se entrena el LoRA con rango 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y de atención de salida.

El entrenamiento usa una época por idioma fuente y cinco épocas sobre feroés, con tasa de aprendizaje 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 y acumulación de gradientes de 32 pasos (batch efectivo 256), en una única GPU A100 de 40 GB. La semilla es la 2 de tres semillas previstas para esta configuración. El corpus de ajuste es el subconjunto feroés de `HuggingFaceFW/fineweb-2`. No se documentan técnicas de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional, heredada de la base SmolLM2-360M-Instruct.
- Transferencia linguística al feroés a partir de conocimiento adquirido en danés e islandés.
- Ajuste fino sobre corpus web (FineWeb-2) para dominio general.
- Soporte de tool calling y function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al feroés según la model card; el resto de idiomas no se ha evaluado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación académica en transferencia entre lenguas escandinavas: el adaptador sirve para estudiar si el conocimiento danés/islandés mejora el rendimiento en feroés con un presupuesto de cómputo mínimo (una A100 de 40 GB).
- Generación de texto en feroés para prototipos: útil para crear borradores o completar textos en un idioma con pocos recursos, siempre con revisión humana dada la ausencia de evaluación.
- Aumento de datos sintéticos en feroés: el modelo puede generar corpus adicionales para entrenar otros sistemas, aunque requiere filtrado por posible ruido.
- Investigación sobre fusión de modelos (TIES): el pipeline completo (fusión + LoRA) es un caso reproducible para comparar estrategias de merge en idiomas de bajos recursos.
- Evaluación comparativa de semillas: al existir tres semillas de la misma configuración, permite medir varianza de entrenamiento en tareas de feroés.
- Base para ajustes posteriores: el adaptador puede servir como punto de partida para fine-tuning específico de dominio en feroés con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M en FP16 ocupa aproximadamente 0,7 GB de pesos; con overhead de activaciones y contexto de 2048 tokens, cabe holgadamente en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento se usó una A100 de 40 GB.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con al menos 4 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son viables tras fusionar el adaptador LoRA con el modelo base; PEFT permite cargarlo directamente en transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroés) | 360M | 2048 | fo | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct (base) | 360M | 2048 (según configuración de entrenamiento) | Multilingüe (no detallado) | Apache 2.0 | Hugging Face |
| Modelos específicos para feroés de tamano similar | no disponible | no disponible | fo | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo es para investigación y no ha sido evaluado ampliamente; no hay métricas de calidad en feroés.
- Riesgo elevado de alucinación y de mezcla de idiomas (danés, islandés, inglés) por el proceso de fusión y el ajuste sobre corpus web ruidoso.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo.
- Solo se declara feroés; el comportamiento en otros idiomas no está caracterizado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación previa.
- El adaptador depende del modelo base `jekunz/new_scandimerge_2_360`, que debe cargarse junto con el LoRA; no es un modelo autónomo.
- Corpus de entrenamiento web (FineWeb-2) sin filtrado documentado de sesgos o contenido tóxico.

## Enlaces

- [Hugging Face: jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed2](https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-2-scandimerge-new-seed2)
- [Modelo base: jekunz/new_scandimerge_2_360](https://huggingface.co/jekunz/new_scandimerge_2_360)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [SmolLM2 (familia de modelos)](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
