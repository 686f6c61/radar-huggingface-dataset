# rapid-mlx/Qwen3.8-27B-4bit-MTP-fp16-MLX

## Resumen

Este modelo es una adaptación para MLX del modelo Qwen3.8-27B, creada por rapid-mlx. Se trata de una variante que conserva los pesos objetivo en cuantización 4-bit y un sidecar de Multi-Token Prediction (MTP) para decodificación especulativa, pero almacena todos los tensores no cuantizados en FP16 en lugar de BF16. El objetivo es mejorar la compatibilidad con los chips Apple Silicon M1 y M2, que no aceleran la multiplicación de matrices en BF16. El modelo se sirve a través de la herramienta rapid-mlx y permite generar texto en inglés y chino. Con 27.356.728.560 parámetros y un tamaño de repositorio de 16,3 GB, está pensado para ejecutarse localmente en Macs con memoria unificada limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (pesos objetivo) y FP16 (tensores no cuantizados) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model-*.safetensors y mtp/model.safetensors) |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero, sino una conversión de precisión del checkpoint BF16 original (rapid-mlx/Qwen3.8-27B-4bit-MTP-MLX). El proceso de conversión transformó 1.705 tensores BF16 a FP16 y preservó 506 tensores no-BF16 con los mismos nombres, formas, dtypes y valores, incluidos los pesos cuantizados empaquetados en U32. La arquitectura subyacente es la del modelo Qwen3.8-27B, aunque la información proporcionada no detalla si se trata de un transformer denso, MoE o híbrido. La innovación principal es el sidecar MTP (Multi-Token Prediction), un drafter que permite decodificación especulativa: la salida aceptada es idéntica a la decodificación autoregresiva greedy. No se dispone de información sobre los datos de entrenamiento ni sobre procesos de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Decodificación especulativa mediante MTP, que puede acelerar la generación en Macs compatibles.
- Compatibilidad con la herramienta rapid-mlx, que permite desactivar el modo de pensamiento con `--no-think` y desactivar la decodificación especulativa con `--no-spec-decode`.
- No se han confirmado capacidades de tool calling, function calling ni soporte de agentes.
- No se dispone de información sobre capacidades de visión o audio.

## Casos de uso

- Asistente conversacional local en Macs M1/M2: el modelo puede ejecutarse con 16 GB de memoria unificada gracias a la cuantización 4-bit, ideal para aplicaciones de chat sin conexión.
- Generación de contenido bilingüe inglés-chino: gracias a su soporte de ambos idiomas, puede usarse para redactar textos, traducir o revisar contenido en dos idiomas.
- Investigación en decodificación especulativa: el sidecar MTP permite estudiar el rendimiento de la decodificación especulativa en Apple Silicon, comparando la salida con la autoregresiva.
- Prototipado de aplicaciones de razonamiento: con el modo de pensamiento (desactivable con `--no-think`), puede explorarse el comportamiento del modelo en tareas de razonamiento paso a paso.
- Despliegue de modelos de gran tamaño en entornos con recursos limitados: la combinación de 4-bit y FP16 permite ejecutar un modelo de 27B en hardware de consumo, en lugar de servidores dedicados.
- Validación de conversiones de precisión: este modelo sirve como referencia para probar la equivalencia entre FP16 y BF16 en chips M1/M2, ya que el README documenta la conversión y verificación de los tensores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README menciona que, en una prueba con un M3 Ultra, dos de tres prompts greedy fueron byte-idénticos al checkpoint BF16 original y el tercero difirió en una frase semánticamente equivalente, pero no se trata de un benchmark formal.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 16,3 GB, por lo que se necesitará una memoria unificada similar o superior para la inferencia.
- GPU recomendadas: Apple Silicon M1 y M2 (esta variante FP16). En M3 y posteriores se recomienda usar el checkpoint BF16 original.
- ¿Cabe en consumer GPU? No está indicado. Está diseñado para MLX en Macs, no para GPUs NVIDIA.
- Opciones de despliegue: rapid-mlx serve (por ejemplo, `rapid-mlx serve rapid-mlx/Qwen3.8-27B-4bit-MTP-fp16-MLX --no-think`). También puede cargarse con la librería MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rapid-mlx/Qwen3.8-27B-4bit-MTP-fp16-MLX | 27.356.728.560 | no disponible | 4-bit + FP16 | Apache 2.0 | HuggingFace |
| rapid-mlx/Qwen3.8-27B-4bit-MTP-MLX (BF16) | no disponible | no disponible | 4-bit + BF16 | Apache 2.0 | HuggingFace |
| mlx-community/Qwen3.8-27B-MTP-4bit | no disponible | no disponible | 4-bit | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas.
- Limitaciones de idioma: solo se indican inglés y chino. No se confirma soporte para otros idiomas.
- Contexto: se desconoce la longitud de contexto, por lo que no se puede garantizar un comportamiento adecuado en conversaciones muy largas.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, pero el README indica que las licencias y limitaciones del modelo upstream siguen aplicando.
- Advertencia de precisión: esta variante FP16 está pensada para M1/M2. En M3 y más nuevos, el checkpoint BF16 original es la opción recomendada. No se garantiza identidad byte a byte con el BF16 en todos los casos.
- MTP: la decodificación especulativa puede no ser beneficiosa en todos los workloads; el comando `--no-spec-decode` está disponible para desactivarla.

## Enlaces

- HuggingFace: https://huggingface.co/rapid-mlx/Qwen3.8-27B-4bit-MTP-fp16-MLX
- Modelo base (BF16): https://huggingface.co/rapid-mlx/Qwen3.8-27B-4bit-MTP-MLX
- Modelo comunitario relacionado: https://huggingface.co/mlx-community/Qwen3.8-27B-MTP-4bit
