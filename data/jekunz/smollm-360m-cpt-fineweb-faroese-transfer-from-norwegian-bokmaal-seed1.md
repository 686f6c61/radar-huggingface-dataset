# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1

## Resumen

El modelo `smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1` es un ajuste fino de SmolLM2-360M-Instruct desarrollado por el usuario jekunz, orientado a la generación de texto en feroés (idioma `fo`). Se trata de un experimento de investigación sobre transferencia lingüística entre lenguas germánicas nórdicas: el modelo parte de un ajuste previo sobre el subconjunto en noruego bokmål de FineWeb-2 y posteriormente se entrena sobre el subconjunto en feroés del mismo corpus. El resultado es un modelo de 361,8 millones de parámetros con licencia Apache 2.0.

La relevancia de este modelo reside en su planteamiento metodológico más que en su rendimiento: explora si el preentrenamiento continuado (CPT) en una lengua con más recursos digitales, como el noruego bokmål, mejora la adaptación a una lengua de bajos recursos como el feroés, que cuenta con pocos corpus públicos de calidad. El autor publica tres semillas distintas de la misma configuración, lo que permite estudiar la variabilidad del entrenamiento.

Según la model card, el modelo no ha sido evaluado de forma amplia y está destinado únicamente a fines de investigación. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base SmolLM2-360M-Instruct) |
| Parámetros totales | 361.821.120 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (longitud máxima durante el entrenamiento) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; compatible con cuantizaciones estándar de llama.cpp/GGUF, aunque no se documentan en la model card) |
| Idiomas soportados | Feroés (`fo`) como objetivo; el modelo base es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,7 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo denso, heredado de SmolLM2-360M-Instruct, con 361,8 millones de parámetros. El entrenamiento se realizó en dos fases de preentrenamiento continuado (CPT) sobre el corpus FineWeb-2: primero una época sobre el subconjunto en noruego bokmål y después cinco épocas sobre el subconjunto en feroés. La configuración de entrenamiento incluye una tasa de aprendizaje de 5e-4 con scheduler coseno, un ratio de warmup de 0,05, batch size de 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), longitud máxima de contexto de 2048 tokens y ejecución en una única GPU A100 de 40 GB. El modelo corresponde a la semilla 1 de tres semillas publicadas para esta misma configuración.

No se detalla en la información disponible el volumen exacto de tokens utilizados en cada fase ni la composición concreta del dataset más allá de la referencia a FineWeb-2. No se documenta el uso de RLHF, DPO u otras técnicas de alineación posteriores al CPT. El planteamiento central es el de transferencia entre lenguas emparentadas (noruego bokmål a feroés) como estrategia para lenguas de bajos recursos.

## Capacidades

- Generación de texto conversacional en feroés, heredada del formato instruct de SmolLM2-360M-Instruct.
- Generación de texto general (continuación, resumen, redacción) en feroés.
- Capacidad multilingüe residual del modelo base, aunque el ajuste se centra en feroés.
- Soporte de conversación multi-turno en el formato de chat de SmolLM2.
- No se documenta soporte específico de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre transferencia lingüística entre lenguas nórdicas: el modelo sirve como punto de comparación para estudiar si el CPT en noruego bokmål mejora la adaptación al feroés frente a un CPT directo, gracias a la publicación de tres semillas de la misma configuración.
- Generación de texto en feroés para prototipos: permite experimentar con generación y continuación de texto en feroés sin depender de modelos multilingües de mayor tamaño, dado su reducido tamaño de 361,8 M de parámetros.
- Creación de corpus sintéticos en feroés: puede emplearse para aumentar datos de entrenamiento en una lengua de bajos recursos, con revisión humana posterior por el riesgo de alucinación.
- Evaluación de la variabilidad del entrenamiento: las tres semillas publicadas permiten analizar la estabilidad de los resultados de CPT en un modelo pequeño.
- Docencia y experimentación con modelos pequeños: su tamaño reducido y su licencia Apache 2.0 lo hacen adecuado para entornos académicos con recursos limitados.
- Base para futuros ajustes: puede servir como punto de partida para ajustes supervisados o alineación específica en feroés, dado que parte de un modelo instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB de pesos, con overhead adicional de activaciones y caché KV (el repo completo ocupa 0,7 GB).
- VRAM estimada en cuantización de 8 bits: en torno a 0,4 GB; en 4 bits, en torno a 0,2 GB (estimaciones a partir del número de parámetros; no documentadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para fp16; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documenta compatibilidad explícita con vLLM, llama.cpp u Ollama, aunque el formato safetensors y la arquitectura Llama permiten su conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1 | 361,8 M | 2048 | Feroés (objetivo) | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct (modelo base) | 361,8 M | 8192 (según documentación de SmolLM2) | Multilingüe | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-cpt-fineweb-norwegian-bokmaal (modelo base directo) | 361,8 M | 2048 | Noruego bokmål | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo está destinado a su investigación y no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación previa.
- Riesgo elevado de alucinación y de generar texto incoherente en feroés, dado el reducido tamaño del modelo y el limitado corpus de entrenamiento disponible en ese idioma.
- Sesgos potenciales heredados de FineWeb-2 y del modelo base SmolLM2-360M-Instruct, incluyendo sesgos de género, culturales y de representación.
- Contexto limitado a 2048 tokens durante el entrenamiento, lo que restringe tareas que requieran ventanas largas.
- El ajuste se centra en feroés; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad del modelo en aplicaciones reales.
- No se documentan procesos de alineación (RLHF/DPO) posteriores al CPT, por lo que el comportamiento conversacional puede ser inconsistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed1
- Modelo base directo (noruego bokmål): https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-norwegian-bokmaal
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base original SmolLM2-360M-Instruct: no disponible en la información proporcionada
