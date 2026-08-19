# erlidev/Qwen3.8-27B-DSpark-GGUF

## Resumen

El modelo `erlidev/Qwen3.8-27B-DSpark-GGUF` es una conversión a formato GGUF del modelo `RadixArk/Qwen3.8-27B-DSpark`, un modelo auxiliar (drafter) diseñado para acelerar la inferencia del modelo principal `Qwen/Qwen3.8-27B` mediante decodificación especulativa con la técnica DSpark. Este drafter, con aproximadamente 1,36 mil millones de parámetros, genera secuencias de tokens candidatas que el modelo grande verifica en paralelo, reduciendo la latencia total de generación.

La conversión, realizada por erlidev, incluye dos versiones cuantizadas: una en BF16 (2,73 GB) y otra en Q8_0 (1,46 GB), ambas compatibles con llama.cpp a partir de la versión que incorpora el PR #25173. La licencia Apache-2.0 permite su uso comercial sin restricciones significativas.

Este modelo es relevante para desarrolladores que despliegan Qwen3.8-27B en entornos de producción y buscan reducir costes de inferencia o mejorar la experiencia de usuario con respuestas más rápidas, especialmente en tareas de razonamiento y código donde la decodificación especulativa muestra mayores ganancias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo drafter para decodificación especulativa DSpark (detalles internos no disponibles) |
| Parámetros totales | 1.359.284.737 |
| Parámetros activos | No aplica (no especificado) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, Q8_0 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un drafter especializado para decodificación especulativa DSpark. Su función es generar borradores de tokens que el modelo principal `Qwen3.8-27B` acepta o rechaza. Con solo 1.359.284.737 parámetros, es significativamente más pequeño que el modelo objetivo, lo que permite generar candidatos rápidamente. La técnica DSpark se emplea para optimizar el proceso de decodificación especulativa, aunque no se han publicado detalles técnicos específicos sobre su funcionamiento.

No se dispone de información detallada sobre el proceso de entrenamiento, el dataset utilizado ni las técnicas de alineación (RLHF, DPO, etc.). El modelo está diseñado para funcionar con el tokenizador de Qwen3.8-27B, como se indica en el proceso de conversión.

## Capacidades

- Aceleración de inferencia para Qwen3.8-27B mediante decodificación especulativa.
- Compatible con llama.cpp a partir del PR #25173 (merged 2026-07-28).
- Soporta el modo `draft-dflash` en la configuración de decodificación especulativa.
- Configuración recomendada: `--spec-draft-n-max 7` y `-ngld 99`.
- Métricas de acceptance length reportadas en múltiples benchmarks (ver sección de rendimiento).
- No es un modelo de generación autónoma; requiere el modelo principal para funcionar.

## Casos de uso

- Despliegue de Qwen3.8-27B en producción con menor latencia: al usar el drafter, las respuestas se generan más rápido, mejorando la experiencia del usuario en aplicaciones de chat y asistentes virtuales.
- Reducción de costes de inferencia: al acelerar la generación, se reduce el tiempo de cómputo por petición, lo que permite servir más peticiones con los mismos recursos.
- Procesamiento por lotes en tiempo real: en sistemas que requieren respuestas inmediatas, como atención al cliente o soporte técnico, la menor latencia permite mantener conversaciones fluidas.
- Integración en pipelines de generación de código: los benchmarks muestran acceptance length elevados en HumanEval (3,47) y MBPP (3,67), lo que indica buena eficiencia en tareas de programación.
- Razonamiento matemático y científico: con acceptance length de 4,57 en GSM8K y 4,08 en MATH-500, es adecuado para aplicaciones de tutoría o resolución de problemas.
- Optimización de inferencia en hardware limitado: al reducir el número de pasos de decodificación del modelo grande, se puede ejecutar Qwen3.8-27B en GPUs con menor VRAM o incluso en CPU con cuantización.

## Benchmarks y rendimiento

El modelo reporta métricas de acceptance length (longitud media de tokens aceptados por el modelo principal) en diversos benchmarks. Estas métricas indican cuántos tokens del borrador son aceptados de media, lo que se traduce en una mayor aceleración.

| Benchmark | Acceptance length |
|---|---:|
| GSM8K | 4,57 |
| MATH-500 | 4,08 |
| MBPP | 3,67 |
| HumanEval | 3,47 |
| AIME 2025 | 3,28 |
| MT-Bench | 3,10 |
| AIME 2026 | 3,07 |
| LBPP | 3,03 |
| Alpaca | 2,95 |
| LiveCodeBench | 2,94 |
| Arena-Hard-v2 | 2,71 |

Las condiciones de evaluación fueron: modelo objetivo en FP8, drafter en BF16, bloque de tamaño 7, temperatura 0,6, top-k 20 y top-p 0,95. No se han publicado resultados de benchmarks tradicionales (MMLU, HumanEval pass@1, etc.) porque el modelo no es autónomo.

## Requisitos de hardware

- Tamaño de los archivos: BF16 2,73 GB, Q8_0 1,46 GB. El archivo Q8_0 puede cargarse en GPUs consumer con al menos 4 GB de VRAM, considerando overhead de runtime; para BF16 se recomiendan al menos 6 GB.
- GPU recomendadas: cualquier GPU compatible con CUDA o Metal con VRAM suficiente. Modelos como RTX 4060, RTX 3060 o superiores son adecuadas para la versión Q8_0.
- También puede ejecutarse en CPU con llama.cpp, aunque la velocidad dependerá del número de núcleos y de la memoria RAM disponible.
- Opciones de despliegue: llama.cpp (a partir del PR #25173), que soporta la carga de este drafter como modelo auxiliar.
- Latencia y throughput: no se proporcionan datos directos, pero la aceleración esperada depende de la acceptance length y del tamaño del bloque. Con una acceptance length media de ~3-4 tokens y un bloque de 7, se puede esperar una reducción de latencia del 30-50% en tareas típicas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos drafter como EAGLE o Medusa, ya que no se han publicado métricas comparativas en la misma configuración. Se recomienda evaluar en el entorno específico de despliegue.

## Limitaciones y advertencias

- Es un modelo auxiliar: no puede generar texto por sí solo; requiere el modelo principal Qwen3.8-27B.
- Dependencia de una versión específica de llama.cpp: requiere el PR #25173, que puede no estar disponible en todas las distribuciones.
- No hay información sobre sesgos o alucinaciones, ya que el modelo no genera contenido de forma autónoma; los riesgos asociados al contenido provienen del modelo principal.
- La acceptance length varía según la tarea; en tareas de conversación general (Alpaca, Arena-Hard) es menor (~2,7-3,0), lo que reduce la ganancia de velocidad.
- El uso comercial está permitido bajo Apache-2.0, pero se recomienda revisar la licencia del modelo principal Qwen3.8-27B si se utiliza en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erlidev/Qwen3.8-27B-DSpark-GGUF
- Modelo base (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo principal (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- PR de llama.cpp #25173: https://github.com/ggml-org/llama.cpp/pull/25173
