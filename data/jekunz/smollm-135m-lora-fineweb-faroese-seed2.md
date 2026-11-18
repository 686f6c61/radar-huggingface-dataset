# jekunz/smollm-135m-lora-fineweb-faroese-seed2

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-seed2` es un adaptador LoRA entrenado sobre `HuggingFaceTB/SmolLM2-135M-Instruct` para mejorar el rendimiento en feroés (código ISO `fo`). Lo publica el usuario `jekunz` como parte de una serie de experimentos de ajuste fino sobre la porción feroesa del corpus FineWeb-2. El repositorio contiene únicamente los pesos del adaptador PEFT (0,2 GB), no el modelo base completo, por lo que para su uso es necesario cargar primero SmolLM2-135M-Instruct y superponer el LoRA.

Se trata de un experimento de investigación de escala muy reducida: 135 millones de parámetros en el modelo base, contexto de entrenamiento de 2048 tokens y un único A100 de 40 GB. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia y que su uso previsto es la investigación interna. Este repositorio corresponde a la semilla 2 de una configuración de tres semillas, lo que sugiere que forma parte de un estudio de robustez o variabilidad del entrenamiento.

Su relevancia actual es acotada pero concreta: sirve como referencia para quienes trabajan en adaptación de modelos pequeños a lenguas de bajos recursos como el feroés, y como ejemplo de receta LoRA reproducible (rango 256, alpha 512, módulos MLP) sobre un modelo de 135 M. No está pensado como modelo de producción ni como base para aplicaciones comerciales de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135 M en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en entrenamiento; la del modelo base SmolLM2-135M-Instruct es mayor, pero no se documenta aquí |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | feroés (`fo`); el modelo base es multilingüe pero el ajuste se centra en feroés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256 y alpha 512, dirigido a los módulos `up_proj`, `down_proj`, `gate_proj` y `o_proj` (las proyecciones de las capas MLP y la proyección de salida de atención). Esta elección concentra la adaptación en las capas feed-forward y en la salida de atención, dejando intactas las proyecciones Q/K/V.

El entrenamiento se realizó durante 5 épocas sobre la porción feroesa de `HuggingFaceFW/fineweb-2`, con learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 y acumulación de gradientes de 32 pasos (batch efectivo 256), en un único A100 de 40 GB y con contexto máximo de 2048 tokens. La semilla 2 indica que existen al menos otras dos ejecuciones con la misma configuración. No se documentan datos sobre número total de tokens vistos, composición exacta del subconjunto feroés ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional en feroés, heredada del ajuste de instrucciones del modelo base.
- Adaptación específica al dominio y estilo del corpus FineWeb-2 en feroés (texto web).
- Capacidad multilingüe residual del modelo base SmolLM2-135M-Instruct, aunque el ajuste prioriza el feroés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), visión, audio ni otras modalidades.
- No se documentan capacidades especiales adicionales.

## Casos de uso

- Investigación en adaptación de lenguas de bajos recursos: el adaptador sirve como punto de partida reproducible para estudiar cómo un LoRA de rango alto sobre un modelo de 135 M modifica el comportamiento en feroés, comparando las tres semillas publicadas.
- Generación de texto auxiliar en feroés: redacción de borradores, resúmenes o paráfrasis de contenido web feroés, aprovechando que el ajuste se hizo sobre FineWeb-2 en ese idioma.
- Experimentos de comparación de semillas: al existir ejecuciones con semilla 1, 2 y 3 de la misma configuración, permite medir la varianza del entrenamiento y la estabilidad del ajuste.
- Base para ajustes posteriores: al ser un adaptador PEFT ligero (0,2 GB), se puede superponer o combinar con otros adaptadores sobre SmolLM2-135M-Instruct para tareas específicas en feroés.
- Docencia y prototipado: su tamaño reducido permite ejecutarlo en hardware modesto para demostrar el flujo completo de carga de un modelo base más un adaptador LoRA con `peft`.
- Evaluación de calidad lingüística en feroés: útil como referencia para construir conjuntos de evaluación o comparar con otros modelos ajustados al mismo idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135 M en fp16 ocupa aproximadamente 0,27 GB de pesos; en fp32, unos 0,54 GB. El adaptador LoRA añade una cantidad no especificada, pero al ser de rango 256 sobre cuatro módulos, es previsible que sea del orden de decenas de megabytes.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o incluso una GTX 1650 de 4 GB permiten la inferencia en fp16.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM.
- Opciones de despliegue: `transformers` con `peft` (carga del adaptador sobre el modelo base), y potencialmente `llama.cpp` u Ollama si se convierte el modelo fusionado a GGUF, aunque no se publican versiones GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-seed2 | 135 M (base) + LoRA | 2048 (entrenamiento) | Apache 2.0 | Hugging Face (adaptador PEFT) |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | no disponible en esta ficha | Apache 2.0 | Hugging Face (modelo completo) |
| Otros adaptadores LoRA de la misma serie (semillas 1 y 3) | 135 M (base) + LoRA | 2048 (entrenamiento) | Apache 2.0 | Hugging Face (adaptadores PEFT) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia; no hay métricas publicadas de calidad en feroés ni en otros idiomas.
- Riesgo de alucinación elevado por el tamaño reducido del modelo base (135 M) y por el ajuste sobre texto web sin verificación factual.
- Sesgos potenciales heredados de FineWeb-2 y del modelo base, incluyendo sesgos de dominio, género y representación cultural; no se documentan análisis al respecto.
- El ajuste se limita al feroés; el rendimiento en otros idiomas puede degradarse respecto al modelo base original.
- Contexto de entrenamiento de 2048 tokens; no se documenta el comportamiento más allá de esa longitud.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación desaconseja su uso en producción sin validación previa.
- Al ser un adaptador, requiere cargar el modelo base SmolLM2-135M-Instruct; no es un modelo autónomo.
- No se publican versiones cuantizadas ni formatos GGUF, lo que limita su despliegue en entornos sin `transformers`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-seed2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Librería PEFT: https://github.com/huggingface/peft
