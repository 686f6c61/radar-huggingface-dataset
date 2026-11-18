# jekunz/smollm-135m-lora-fineweb-faroese-seed3

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-seed3` es un adaptador LoRA entrenado sobre `HuggingFaceTB/SmolLM2-135M-Instruct`, un transformer decoder-only de 135 millones de parámetros desarrollado originalmente por Hugging Face. El adaptador lo ha publicado el usuario jekunz como parte de una exploración de investigación sobre adaptación lingüística del modelo base al feroés (`fo`), utilizando la porción de ese idioma del corpus FineWeb-2. Se trata de la semilla 3 de tres configuraciones de entrenamiento equivalentes, lo que sugiere un experimento orientado a medir variabilidad entre ejecuciones.

El modelo no introduce arquitectura nueva: es un adaptador PEFT de rango 256 sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` del transformer subyacente. El objetivo declarado es el ajuste al feroés, un idioma de bajos recursos con escasa representación en los corpus de preentrenamiento mayoritarios, en un modelo deliberadamente pequeño que pueda ejecutarse en hardware muy modesto.

Su relevancia es principalmente metodológica: sirve como referencia para estudiar cómo se comporta el ajuste supervisado ligero en lenguas de bajos recursos con modelos de menos de 200M de parámetros, y como punto de partida reproducible (semillas fijas, hiperparámetros documentados) para quien quiera replicar o extender el experimento. No es un modelo listo para producción: el autor indica explícitamente que no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135M en el modelo base; el adaptador LoRA añade un numero no especificado (rango 256 sobre 4 modulos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | Feroes (`fo`) como objetivo del ajuste; el modelo base soporta ingles y otros idiomas, no detallados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only de 135M de parámetros, ajustado con instrucciones por Hugging Face. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512 (escala efectiva 2.0), dirigido a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas feed-forward y de atención de salida. No se congelan ni se modifican los pesos originales: el repositorio contiene únicamente los pesos del adaptador (0,2 GB).

El entrenamiento usa la porción feroesa del dataset `HuggingFaceFW/fineweb-2`, con 5 épocas, learning rate 8e-4, scheduler coseno, warmup ratio 0.05, batch size 8 y acumulación de gradientes de 32 pasos (batch efectivo 256), sobre una única A100 de 40 GB y con longitud máxima de 2048 tokens. La semilla es 3, una de tres ejecuciones de la misma configuración. No se documenta el número de tokens procesados, la composición exacta del subconjunto feroés, ni si hubo etapas de alineación adicionales (RLHF/DPO) más allá del ajuste supervisado sobre texto. Tampoco se especifica la función de pérdida ni si se enmascaró el prompt.

## Capacidades

- Generación de texto en feroés, heredando la capacidad generativa del modelo base y adaptándola al dominio del corpus FineWeb-2.
- Conversación multi-turno en formato instruct, ya que el modelo base es `-Instruct` y el pipeline declarado es `text-generation` con tag `conversational`.
- Razonamiento básico y respuesta a instrucciones sencillas, limitado por el tamaño de 135M de parámetros.
- Generación de código y matemáticas: capacidad muy limitada por el tamaño; no hay evidencia de que el ajuste en feroés la preserve o mejore.
- Tool calling / function calling: no documentado; el modelo base no lo declara de forma explícita.
- Soporte de agentes y razonamiento multi-paso: no documentado y poco probable a esta escala.
- Capacidades multilingües: centradas en feroés; el resto de idiomas del modelo base no se detallan.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio de adaptación de lenguas de bajos recursos: usar el adaptador como referencia reproducible (semilla 3 de 3) para medir la varianza entre ejecuciones de LoRA sobre feroés con el mismo corpus e hiperparámetros.
- Generación de texto feroés en entornos con recursos mínimos: el modelo completo en fp16 ocupa del orden de 270 MB, por lo que puede ejecutarse en CPU o en GPUs de gama baja para tareas de relleno o paráfrasis.
- Prototipado de asistentes conversacionales en feroés: con 2048 tokens de contexto y formato instruct, sirve para validar flujos de chat antes de invertir en modelos mayores.
- Aumento de datos sintéticos en feroés: generar borradores de texto para filtrar y revisar manualmente en la construcción de corpus.
- Investigación sobre olvido catastrófico: comparar el rendimiento del adaptador frente al modelo base en inglés y otras tareas para medir cuánto se degrada la capacidad original tras el ajuste en feroés.
- Docencia y experimentación con PEFT: ejemplo completo y documentado de configuración LoRA (rango, alpha, módulos objetivo, scheduler) para prácticas de ajuste eficiente.
- Evaluación comparativa de semillas: al existir tres semillas de la misma configuración, permite analizar la estabilidad del entrenamiento y la sensibilidad a la inicialización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,2 GB; el modelo base en fp16 ocupa aproximadamente 270 MB y en fp32 unos 540 MB. La VRAM total necesaria es del orden de 1 GB o menos, incluyendo overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el modelo base); conversión a GGUF y uso con llama.cpp u Ollama es posible pero no está documentada por el autor; vLLM y TGI no están verificados para este adaptador.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-seed3 | 135M (base) + LoRA | 2048 (entrenamiento) | Apache 2.0 | Ajuste específico en feroés, sin evaluar |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible en la información | Apache 2.0 | Modelo base; multilingüe general, sin foco en feroés |
| SmolLM2-360M-Instruct | 360M | no disponible en la información | Apache 2.0 | Alternativa mayor de la misma familia, mayor capacidad a costa de más recursos |
| Modelos especializados en feroés (p. ej. adaptaciones de modelos mayores) | variable | variable | variable | No disponibles en la información proporcionada para comparación directa |

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es para su investigación y que no ha sido evaluado de forma amplia; no hay métricas publicadas.
- Riesgo elevado de alucinación y de respuestas incoherentes por el tamaño reducido del modelo base (135M) y por el ajuste sobre texto web sin filtrado documentado.
- El ajuste en feroés puede degradar el rendimiento del modelo base en inglés y otros idiomas (olvido catastrófico), algo no medido en la model card.
- El contexto efectivo de entrenamiento es de 2048 tokens; no se garantiza un comportamiento correcto más allá de esa longitud.
- La calidad del feroés generado depende de la porción de FineWeb-2 utilizada, cuya composición y tamaño no se documentan; puede contener sesgos y ruido del corpus web.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo no está validado para producción.
- Es un adaptador LoRA: requiere cargar el modelo base `SmolLM2-135M-Instruct` por separado; no es un modelo autónomo.
- Solo se ha publicado la semilla 3; las otras dos semillas de la misma configuración no se listan en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-seed3
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio PEFT: https://github.com/huggingface/peft
