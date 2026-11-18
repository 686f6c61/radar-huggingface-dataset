# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed2

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed2` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `jekunz/new_scandimerge_equal_135`, que a su vez deriva de SmolLM2-135M-Instruct. Lo desarrolla el usuario jekunz con fines de investigación y su objetivo es transferir capacidades multilingües escandinavas al feroés mediante un ajuste secuencial: primero un merge TIES con pesos iguales de modelos entrenados en danés, islandés, noruego bokmål, noruego nynorsk y sueco, y después un ajuste específico sobre la porción en feroés de FineWeb-2.

Se trata de un experimento de transferencia lingüística de bajo coste: en lugar de entrenar un modelo feroés desde cero, se aprovecha el conocimiento ya adquirido en lenguas germánicas nórdicas cercanas. El resultado es un adaptador de pequeño tamaño (repo de 0,2 GB) que se aplica sobre un modelo base de 135 millones de parámetros, pensado para generación de texto y conversación en feroés.

Su relevancia es acotada pero interesante para quien investigue transferencia entre lenguas de bajos recursos: demuestra una receta reproducible (LoRA de rango 256, tres semillas distintas, una sola A100 de 40 GB) y publica el adaptador con licencia Apache 2.0. No obstante, el autor indica explícitamente que no ha sido evaluado de forma amplia, por lo que no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135M en el modelo base; el adaptador LoRA añade parámetros adicionales (cantidad exacta no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en el entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización dependerá del modelo base y del runtime) |
| Idiomas soportados | Feroés (fo); el modelo base se entrenó con datos de danés, islandés, noruego bokmål, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se construyó `jekunz/new_scandimerge_equal_135` mediante un merge TIES con pesos iguales de cinco modelos entrenados en las porciones de danés, islandés, noruego bokmål, noruego nynorsk y sueco de FineWeb-2. Sobre ese merge se aplicó un ajuste LoRA con rango 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, entrenado después sobre la porción en feroés de FineWeb-2.

La configuración de entrenamiento incluye una época por lengua de origen y cinco épocas en feroés, tasa de aprendizaje 8e-4 con scheduler coseno, warmup del 5 %, batch size 8 con acumulación de gradientes de 32 pasos (batch efectivo 256), contexto máximo de 2048 tokens y una única GPU A100 de 40 GB. La semilla es la 2, una de las tres semillas publicadas para esta misma configuración. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado.

## Capacidades

- Generación de texto en feroés, heredando la capacidad conversacional del modelo base SmolLM2-135M-Instruct.
- Conversación multi-turno (pipeline `text-generation` con etiqueta `conversational`).
- Transferencia de conocimiento desde lenguas escandinavas cercanas hacia el feroés.
- Capacidades del modelo base (razonamiento básico, código y matemáticas elementales) presumiblemente degradadas o no evaluadas tras el ajuste; no hay datos que lo confirmen.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Investigación en transferencia entre lenguas de bajos recursos: sirve como punto de partida reproducible para estudiar cómo un merge multilingüe escandinavo facilita el aprendizaje del feroés con un presupuesto de cómputo mínimo (una A100 de 40 GB).
- Generación de texto sintético en feroés para aumento de datos: el modelo puede producir borradores que, tras revisión humana, amplíen corpus de entrenamiento para modelos mayores.
- Prototipado de asistentes conversacionales en feroés: con 2048 tokens de contexto permite mantener diálogos breves en entornos de demostración o pruebas internas.
- Experimentos de ablación con semillas: al existir tres semillas de la misma configuración, permite medir la varianza del entrenamiento y la estabilidad del ajuste LoRA.
- Evaluación comparativa de estrategias de merge (TIES con pesos iguales frente a otras variantes): el adaptador sirve como referencia en estudios sobre fusión de modelos.
- Despliegue en dispositivos con recursos muy limitados: al partir de un modelo de 135M, es viable ejecutarlo en CPU o GPU de gama baja para pruebas de latencia y calidad en feroés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M ocupa aproximadamente 270 MB en fp16 y alrededor de 140 MB en cuantización de 8 bits; el adaptador LoRA añade una sobrecarga pequeña (tamaño exacto no disponible).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de ese nivel.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: vLLM, llama.cpp (previa conversión del modelo fusionado a GGUF), Ollama y TGI; el adaptador PEFT debe fusionarse con el modelo base o cargarse con la librería `peft`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed2 | 135M (base) + LoRA | 2048 | Feroés | Apache 2.0 | Hugging Face (adaptador PEFT) |
| SmolLM2-135M-Instruct | 135M | 8192 (según model card oficial) | Multilingüe (principalmente inglés) | Apache 2.0 | Hugging Face |
| Modelos específicos para feroés de tamaño similar | No disponible | No disponible | Feroés | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara que el modelo es para su investigación y no ha sido evaluado de forma amplia; no hay garantías de calidad ni de robustez.
- Riesgo de alucinación y de degradación del rendimiento fuera del dominio de FineWeb-2, especialmente en tareas de razonamiento, código o matemáticas.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida al feroés; el comportamiento en otras lenguas no está documentado y podría ser deficiente.
- Posibles sesgos heredados de FineWeb-2 y del modelo base SmolLM2, no analizados en la model card.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del dataset FineWeb-2 antes de un uso comercial.
- El adaptador requiere fusionarse con el modelo base `jekunz/new_scandimerge_equal_135` o cargarse junto a él; no es un modelo autónomo.
- No apto para producción sin una evaluación previa específica del caso de uso.

## Enlaces

- [Hugging Face: jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed2](https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-equal-scandimerge-new-seed2)
- [Modelo base: jekunz/new_scandimerge_equal_135](https://huggingface.co/jekunz/new_scandimerge_equal_135)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
