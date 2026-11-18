# jekunz/smollm-135m-lora-fineweb-faroese-seed1

## Resumen

`jekunz/smollm-135m-lora-fineweb-faroese-seed1` es un adaptador LoRA entrenado sobre el modelo base `HuggingFaceTB/SmolLM2-135M-Instruct` para mejorar sus capacidades en feroés (código ISO `fo`). Lo publica el usuario `jekunz` como parte de una serie de experimentos de ajuste fino sobre el subconjunto en feroés del corpus `HuggingFaceFW/fineweb-2`. El modelo está pensado, según el propio autor, para investigación interna y no ha sido evaluado de forma amplia.

Técnicamente es un adaptador PEFT de rango 256 (alpha 512) aplicado sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` del transformer de SmolLM2-135M-Instruct. El entrenamiento se realizó durante 5 épocas con una tasa de aprendizaje de 8e-4, batch efectivo de 256 y longitud máxima de contexto de 2048 tokens, sobre una única GPU A100 de 40 GB. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada pero concreta: SmolLM2-135M es uno de los modelos instructivos más pequeños y desplegables en cualquier dispositivo, y el feroés es un idioma de bajos recursos con poca representación en los corpus de preentrenamiento. Este adaptador explora si un ajuste LoRA ligero sobre datos web filtrados de FineWeb-2 puede mejorar el comportamiento del modelo en ese idioma sin reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre SmolLM2-135M-Instruct) |
| Parametros totales | 135M en el modelo base; el adaptador LoRA añade un numero no especificado de parametros entrenables (rango 256) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens durante el entrenamiento; la del modelo base SmolLM2-135M-Instruct es no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Feroes (`fo`); el modelo base soporta ingles y otros idiomas no detallados |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. El ajuste es un LoRA con rango 256 y alpha 512, dirigido exclusivamente a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas del modelo. No se modifican los pesos base, de modo que el adaptador debe cargarse junto con `HuggingFaceTB/SmolLM2-135M-Instruct` mediante la librería `peft`.

El entrenamiento se realizó sobre el subconjunto en feroés de `HuggingFaceFW/fineweb-2`, un corpus web multilingüe filtrado. Se ejecutaron 5 épocas con learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 y acumulación de gradientes de 32 pasos (batch efectivo 256), sobre una A100 de 40 GB. La longitud máxima de contexto durante el entrenamiento fue de 2048 tokens. Este repositorio corresponde a la semilla 1 de tres semillas de entrenamiento con la misma configuración, lo que sugiere un experimento de robustez o reproducibilidad. No se documentan etapas de RLHF, DPO ni preferencias humanas; el ajuste es de tipo supervisado sobre texto.

## Capacidades

- Generación de texto conversacional en feroés, heredando la naturaleza instructiva del modelo base.
- Generación de texto general y continuación de texto en feroés sobre dominios cubiertos por FineWeb-2.
- Conversación multi-turno básica (capacidad del modelo base, no validada específicamente en feroés).
- Razonamiento y matemáticas elementales: capacidad limitada por el tamaño de 135M del modelo base.
- Generación de código: capacidad muy limitada por el tamaño del modelo base; no es un objetivo del ajuste.
- Tool calling / function calling: no documentado para este adaptador; el modelo base SmolLM2-135M-Instruct no lo garantiza de forma fiable.
- Capacidades de agente y razonamiento multi-paso: no documentadas y previsiblemente muy limitadas por el tamaño.
- Capacidades multilingües: el feroés es el idioma objetivo; el resto de idiomas depende del modelo base y no se ha evaluado.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Experimentación académica sobre adaptación de modelos pequeños a lenguas de bajos recursos: el adaptador sirve como punto de partida reproducible (semilla 1 de 3) para estudiar el efecto de LoRA sobre feroés con SmolLM2-135M.
- Generación de texto auxiliar en feroés para prototipos: borradores, resúmenes o paráfrasis de documentos en feroés en entornos de investigación donde no se requiere calidad de producción.
- Evaluación comparativa de semillas: al existir tres semillas de la misma configuración, permite medir la varianza del ajuste fino en un corpus de bajos recursos.
- Despliegue en dispositivos de recursos muy limitados: al ser un adaptador sobre un modelo de 135M, puede ejecutarse en CPU o GPUs de gama baja para demos y pruebas de concepto en feroés.
- Filtrado o clasificación ligera de texto en feroés: el modelo puede usarse como base para tareas de etiquetado simple tras un ajuste adicional específico.
- Investigación sobre corpus FineWeb-2: permite analizar qué tipo de texto web en feroés aprende un modelo pequeño y con qué fidelidad.
- Generación de datos sintéticos en feroés para aumentar corpus de entrenamiento de otros modelos, con revisión humana obligatoria dada la fiabilidad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M en precisión completa (fp32) ocupa aproximadamente 0,5 GB; en fp16/bf16 unos 0,27 GB; en cuantizaciones de 8 bits o 4 bits, por debajo de 0,2 GB. El adaptador LoRA añade una sobrecarga pequeña (repositorio de 0,2 GB).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una A100, H100 o RTX 4090 está sobradamente dimensionada. El entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, etc.) e incluso en iGPU o CPU.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el modelo base; `llama.cpp` u `Ollama` si se fusiona el adaptador con el modelo base y se convierte a GGUF; `vLLM` y `TGI` son posibles pero sobredimensionados para este tamaño.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia será muy baja en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jekunz/smollm-135m-lora-fineweb-faroese-seed1` | 135M (base) + LoRA r=256 | 2048 (entrenamiento) | Feroés | Apache 2.0 | Hugging Face |
| `HuggingFaceTB/SmolLM2-135M-Instruct` (base) | 135M | No disponible en la informacion proporcionada | Multilingüe (no detallado) | Apache 2.0 | Hugging Face |
| `HuggingFaceTB/SmolLM2-360M-Instruct` | 360M | No disponible en la informacion proporcionada | Multilingüe (no detallado) | Apache 2.0 | Hugging Face |
| Adaptadores LoRA similares para lenguas de bajos recursos sobre SmolLM2 | Variable | Variable | Variable | Variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado benchmarks de este adaptador ni de alternativas equivalentes en feroés.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es para investigación y no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación propia.
- Riesgo elevado de alucinación y de errores gramaticales en feroés, dado el tamaño del modelo base (135M) y la naturaleza del corpus web de FineWeb-2.
- Sesgos heredados del corpus FineWeb-2 (texto web filtrado) y del modelo base SmolLM2; no se documenta ningún proceso de mitigación.
- Contexto limitado a 2048 tokens durante el entrenamiento; secuencias más largas pueden degradar la calidad.
- El adaptador solo cubre feroés de forma específica; el comportamiento en otros idiomas no está validado.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo en feroés no está garantizada para aplicaciones comerciales sin validación adicional.
- El repositorio corresponde a una sola semilla de tres; los resultados pueden variar entre semillas.
- No se documentan limitaciones específicas de tool calling ni de agentes, pero el tamaño del modelo hace poco fiable su uso en esos escenarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-seed1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Librería PEFT: https://github.com/huggingface/peft
