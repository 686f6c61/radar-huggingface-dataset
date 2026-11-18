# jekunz/smollm-360m-lora-fineweb-faroese-seed3

## Resumen

`jekunz/smollm-360m-lora-fineweb-faroese-seed3` es un adaptador LoRA de investigación publicado por el usuario jekunz, construido sobre el modelo instructivo `HuggingFaceTB/SmolLM2-360M-Instruct` de Hugging Face. El adaptador se ha entrenado sobre la porción en feroés (código ISO `fo`) del corpus `HuggingFaceFW/fineweb-2`, con el objetivo de adaptar un modelo pequeño de propósito general a un idioma de bajos recursos. Se trata de uno de los tres adaptadores generados con la misma configuración y distintas semillas (este corresponde a la semilla 3), lo que sugiere un experimento de reproducibilidad o de promediado de semillas.

El modelo base, SmolLM2-360M-Instruct, es un transformer decoder-only de 360 millones de parámetros diseñado para ejecutarse en hardware modesto, con una ventana de contexto nativa de 8.192 tokens. El adaptador LoRA emplea un rango de 256 y alpha de 512 sobre los módulos `up_proj`, `down_proj`, `gate_proj` y `o_proj`, y se ha entrenado durante 5 épocas con una longitud máxima de secuencia de 2.048 tokens en una única A100 de 40 GB.

La relevancia de esta ficha es acotada: no es un modelo de producción, sino un artefacto de investigación sin evaluación pública. Su interés radica en documentar el proceso de adaptación lingüística de un modelo pequeño a una lengua escandinava de bajos recursos y en servir como referencia para quienes quieran reproducir o extender el experimento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360 M en el modelo base; el adaptador LoRA añade un número de parámetros no especificado en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en el modelo base; el entrenamiento del adaptador usó 2.048 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el modelo base admite las cuantizaciones habituales de su ecosistema) |
| Idiomas soportados | Feroés (`fo`) como idioma de adaptación; el modelo base es multilingüe, aunque la cobertura real en feroés no está evaluada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only con atención causal estándar y 360 millones de parámetros. La configuración LoRA especificada por el autor es rango 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyección de salida de la atención, sin tocar las proyecciones de query, key ni value.

El entrenamiento se realizó durante 5 épocas sobre la porción feroesa de `HuggingFaceFW/fineweb-2`, con learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8, acumulación de gradientes de 32 pasos (batch efectivo de 256), longitud máxima de 2.048 tokens y una única GPU A100 de 40 GB. La semilla empleada es la 3, una de las tres semillas de la misma configuración. No se documenta el número total de tokens de entrenamiento, la composición exacta del subconjunto feroés ni si hubo etapas de alineación adicionales (RLHF/DPO) sobre el adaptador.

## Capacidades

- Generación de texto conversacional en feroés, heredando la naturaleza instructiva del modelo base.
- Generación de texto general y respuesta a instrucciones, con la salvedad de que la calidad en feroés no ha sido evaluada.
- Razonamiento básico y tareas de conocimiento general limitadas por el tamaño de 360 M parámetros del modelo base.
- Soporte de conversaciones multi-turno, sujeto a la ventana de contexto del modelo base.
- Capacidades multilingües residuales del modelo base, no garantizadas tras el ajuste específico en feroés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre adaptación lingüística de modelos pequeños: el adaptador sirve como punto de partida para estudiar cómo un modelo de 360 M responde a un ajuste LoRA sobre una lengua de bajos recursos como el feroés.
- Experimentos de reproducibilidad y promediado de semillas: al existir tres adaptadores con la misma configuración y semillas distintas, permite analizar la varianza entre ejecuciones y evaluar técnicas de merging de adaptadores.
- Generación de texto exploratoria en feroés: útil para prototipos internos de redacción o completado de texto en feroés, siempre con revisión humana dada la ausencia de evaluación.
- Base para ajuste adicional (continued fine-tuning): el adaptador puede servir como inicialización para tareas downstream en feroés con presupuesto de cómputo reducido.
- Docencia y demostraciones de PEFT: su tamaño reducido (0,4 GB de repositorio) y su configuración LoRA explícita lo hacen adecuado para explicar el flujo de trabajo de adaptadores en cursos o talleres.
- Evaluación comparativa de corpus: permite medir el impacto de entrenar sobre FineWeb-2 en feroés frente a otros corpus o configuraciones, dentro de un pipeline de experimentación.
- Despliegue en entornos con recursos muy limitados: al combinar un modelo base de 360 M con un adaptador, puede ejecutarse en CPU o GPUs de gama baja para pruebas de concepto, aunque sin garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360 M en fp16 ocupa aproximadamente 0,7 GB de pesos; en cuantización de 8 bits alrededor de 0,4 GB, y en 4 bits alrededor de 0,2 GB, a lo que se suma el adaptador LoRA (tamaño exacto no disponible) y el overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de portátil con 6-8 GB de VRAM e incluso en CPU para inferencia de baja latencia no crítica.
- Cabe en GPU consumer: sí, holgadamente, en cualquier GPU con 4 GB o más de VRAM.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` y `peft`; para servir en producción puede combinarse con vLLM o TGI tras fusionar el adaptador en el modelo base, o con llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Evaluación pública |
|---|---|---|---|---|---|
| jekunz/smollm-360m-lora-fineweb-faroese-seed3 | 360 M (base) + LoRA | 8.192 (base) / 2.048 (entrenamiento) | Feroés (adaptación) | Apache 2.0 | No |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M | 8.192 | Multilingüe (énfasis en inglés) | Apache 2.0 | Sí, publicada por Hugging Face |
| Otros adaptadores LoRA de la misma serie (seed 1 y seed 2) | 360 M (base) + LoRA | Igual que este | Feroés | Apache 2.0 | No |

La comparación con modelos de mayor tamaño o con modelos específicos para lenguas nórdicas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el propio autor advierte de que no se ha evaluado más allá del entrenamiento, por lo que no debe usarse en producción sin una validación propia.
- Riesgo de alucinación elevado por el tamaño reducido del modelo base (360 M parámetros), especialmente en tareas de conocimiento factual.
- Cobertura idiomática limitada: aunque el adaptador se entrena en feroés, no hay métricas que confirmen la calidad ni la fluidez en ese idioma, y el ajuste puede degradar capacidades en otros idiomas del modelo base.
- Ventana de contexto efectiva reducida: el entrenamiento usó 2.048 tokens, por debajo de los 8.192 del modelo base, lo que puede limitar el rendimiento en secuencias largas.
- Sesgos heredados del corpus FineWeb-2 y del modelo base, no documentados ni mitigados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo no está validado para tales fines.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar y cargar `HuggingFaceTB/SmolLM2-360M-Instruct` y aplicar PEFT, lo que añade complejidad al despliegue.
- Ausencia de información sobre el volumen de datos de entrenamiento y la composición del subconjunto feroés, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-seed3
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Librería PEFT: https://github.com/huggingface/peft
