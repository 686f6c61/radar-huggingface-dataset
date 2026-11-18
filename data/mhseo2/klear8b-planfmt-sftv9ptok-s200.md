# mhseo2/klear8b-planfmt-sftv9ptok-s200

## Resumen

`klear8b-planfmt-sftv9ptok-s200` es un checkpoint intermedio de ajuste supervisado (SFT) publicado por el usuario `mhseo2` en Hugging Face. Se trata del paso 200 de un total de 387 de un entrenamiento que parte de `Klear-Reasoner-8B-SFT-ptok` y aplica una receta interna denominada "v8b" sobre un formato de planificación basado en un token especial `<|plan|>` con id 151669. El modelo tiene 8.190.735.360 parámetros reales según los pesos en safetensors y ocupa 16,4 GB en el repositorio.

El interés de esta publicación es acotado: no es un modelo listo para producción ni una release oficial, sino un artefacto de investigación que documenta una etapa concreta de un pipeline de entrenamiento orientado a estructurar el razonamiento en formato de plan antes de la respuesta final. La model card indica que el entrenamiento se realizó sobre 12.408 filas del dataset `mhseo2/klear-planfmt-pgdpo-pairs` (partición `plan_gepa/v8_full/merged_ptok`), con 2x H100, FSDP2 y Ulysses SP 1, y una longitud máxima de 32.768 tokens.

Por la etiqueta `qwen3` y el tamaño de parámetros, el modelo base parece derivar de la familia Qwen3-8B, aunque el autor no lo confirma explícitamente. No hay información publicada sobre licencia, idiomas soportados, benchmarks ni pipeline de inferencia, por lo que cualquier evaluación de capacidades debe hacerse empíricamente por parte de quien lo descargue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, segun tag `qwen3`; detalles no disponibles) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste SFT sobre `Klear-Reasoner-8B-SFT-ptok`, que a su vez parte de una base de la familia Qwen3 de 8B parámetros según la etiqueta del repositorio. La receta "v8b" introduce un formato de planificación con un único token `<|plan|>` (id 151669) que estructura la salida del modelo en secciones de plan, decisión y decisión continuada, con proporciones de datos de estructura 20, decisión 5 y decisión continuada 5. Se aplica además un "plan contrast shift" con margen 0,1 y peso 1, presumiblemente para separar representaciones de planes correctos e incorrectos.

El entrenamiento se ejecutó sobre 12.408 filas de entrenamiento del dataset `mhseo2/klear-planfmt-pgdpo-pairs`, con batch de 32, learning rate 2e-5 con decaimiento coseno (ratio mínimo 0,5, warmup 11 pasos), weight decay 0,01, gradient clipping 1 y longitud máxima de 32.768 tokens. La infraestructura fueron 2 GPU H100 con FSDP2 y Ulysses SP 1, partiendo del commit `mopdRL 27d80cd9`. Este checkpoint corresponde al paso 200 de 387, por lo que es un estado intermedio y no el modelo final de la receta.

## Capacidades

- Generación de texto y razonamiento en formato de planificación estructurada mediante el token especial `<|plan|>`.
- Producción de trazas de decisión y decisión continuada, según el esquema de datos de entrenamiento (structure 20 / decision 5 / decision_continue 5).
- Razonamiento multi-paso orientado a descomponer problemas antes de emitir una respuesta, derivado de la base Klear-Reasoner.
- Herencia potencial de las capacidades del modelo base Qwen3-8B (código, matemáticas, multilingüismo), aunque no verificadas ni documentadas por el autor.
- Soporte de tool calling y function calling: no disponible en la información publicada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Investigación sobre formatos de planificación: el modelo sirve para estudiar cómo un token `<|plan|>` dedicado afecta a la estructura del razonamiento, comparando este checkpoint intermedio con el modelo base y con el checkpoint final del paso 387.
- Experimentos de destilación de trazas de plan: las salidas estructuradas en plan/decisión pueden usarse como datos sintéticos para entrenar modelos más pequeños en razonamiento paso a paso.
- Evaluación de recetas SFT: al ser un paso intermedio con hiperparámetros documentados (lr, batch, warmup, clipping), permite reproducir y analizar la curva de aprendizaje de la receta v8b.
- Análisis de sesgos en razonamiento estructurado: comparar si el formato de plan reduce alucinaciones frente a la generación directa en tareas de matemáticas y lógica.
- Base para ajuste fino posterior: al estar en safetensors y con 8B parámetros, puede recargarse con FSDP2 o DeepSpeed para continuar el entrenamiento desde el paso 200.
- Estudio de datasets de preferencias (PGDPO): el dataset de pares `klear-planfmt-pgdpo-pairs` permite analizar cómo se transfieren preferencias al formato de plan en un SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto corto y 40-80 GB para contexto largo (32.768 tokens).
- GPU recomendadas: H100 o A100 80 GB para contexto completo en precisión nativa; A100 40 GB o L40S para contextos moderados.
- GPU de consumo: posible en RTX 4090 (24 GB) solo con cuantización a 8 bits o 4 bits, que no está publicada por el autor y requeriría conversión manual a GGUF o AWQ/GPTQ.
- Opciones de despliegue: vLLM, TGI o llama.cpp tras conversión; el autor no publica configuración de inferencia ni plantilla de chat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| klear8b-planfmt-sftv9ptok-s200 | 8,19B | 32.768 (entrenamiento) | no disponible | Hugging Face, safetensors |
| Qwen3-8B (base probable) | ~8B | hasta 32.768 o más según variante | Apache 2.0 (según release oficial) | Hugging Face, ampliamente disponible |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6B | 32.768 | MIT (según release oficial) | Hugging Face, GGUF disponibles |
| Klear-Reasoner-8B-SFT-ptok (modelo de partida) | ~8B | no disponible | no disponible | Hugging Face |

La comparación con Qwen3-8B y DeepSeek-R1-Distill-Qwen-7B es orientativa por tamaño y familia; no hay benchmarks publicados de este checkpoint que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 200 de 387): no representa el estado final del entrenamiento y su calidad puede ser inferior a la del modelo completado.
- Sin licencia publicada: no se puede asumir uso comercial permitido; hay que contactar con el autor o verificar la licencia del modelo base.
- Sin model card completa: no se documentan idiomas, sesgos, plantilla de chat ni formato de prompt esperado, lo que dificulta el uso reproducible.
- Riesgo de alucinación inherente a los modelos de 8B en razonamiento; el formato de plan no garantiza corrección factual.
- El token especial `<|plan|>` (id 151669) requiere que el tokenizador y la plantilla de chat se configuren correctamente; un uso incorrecto produce salidas degeneradas.
- Entrenado sobre un dataset pequeño (12.408 filas) y específico, con posible sobreajuste al formato y dominio de `plan_gepa/v8_full`.
- Sin cuantizaciones publicadas: el despliegue en hardware de consumo exige trabajo adicional de conversión y validación.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de comunidad ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/klear8b-planfmt-sftv9ptok-s200
- Dataset de entrenamiento: https://huggingface.co/datasets/mhseo2/klear-planfmt-pgdpo-pairs
- Modelo de partida: `Klear-Reasoner-8B-SFT-ptok` (referenciado en la model card; URL no disponible)
