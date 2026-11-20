# prithivMLmods/Domyn-Edge-Teacher-Code-GGUF

## Resumen

Domyn-Edge-Teacher-Code es un modelo denso de 4B parámetros (3.928.787.968 pesos en safetensors) desarrollado por Domyn como parte de su pipeline de post-entrenamiento Multi-Teacher On-Policy Distillation (MOPD). No es un asistente generalista: es un "teacher" especializado en código y ingeniería de software cuyo cometido es puntuar token a token los rollouts de los modelos estudiantes durante la destilación. Se construye sobre Domyn Edge SFT y se publica como parte del segundo bundle Domyn Edge junto con su dataset de entrenamiento (`Domyn-Edge-Teacher-Code-Mix`).

La versión aquí descrita es la cuantización GGUF publicada por prithivMLmods, que convierte los pesos originales en bfloat16 a una familia completa de cuantizaciones (de Q3_K_M a BF16) para su uso con llama.cpp y TGI. El modelo conserva la arquitectura, el tokenizer y la plantilla de chat con modo `<think>` del modelo base, y se distribuye bajo licencia Apache 2.0, lo que lo hace plenamente utilizable en entornos comerciales.

Es relevante ahora porque combina un tamaño reducido (apto para GPU de consumo) con un entrenamiento específico en código (SFT a 64k de contexto sobre programación competitiva, CUDA y repositorios completos) seguido de GRPO asíncrono recompensado por tests unitarios. Según la model card, supera a Qwen3.5 4B en HumanEval (92,1%), MBPP sanitized (82,9%) y LiveCodeBench Qwen set (53,1%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), basado en Domyn Edge SFT |
| Parametros totales | 3.928.787.968 (~4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 64k durante entrenamiento SFT; 16.384 tokens en la prueba de inferencia documentada |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M |
| Idiomas soportados | en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~4B parámetros que hereda exactamente la arquitectura, el tokenizer y la plantilla de chat con razonamiento `<think>` de Domyn Edge SFT. El post-entrenamiento se estructura en dos fases: primero, una época de SFT especializado en código con longitud de contexto de 64k sobre programación competitiva, código general, CUDA y software engineering a nivel de repositorio; después, GRPO (Group Relative Policy Optimization) asíncrono cuya función de recompensa es la fracción de tests unitarios superados. El dataset empleado es `Domyn-Edge-Teacher-Code-Mix`.

La innovación principal no está en la arquitectura sino en el rol: el modelo está diseñado para puntuar rollouts token a token dentro de un pipeline MOPD (Multi-Teacher On-Policy Distillation), no para conversar de forma generalista. El uso de recompensa basada en tests unitarios en GRPO alinea el comportamiento con código que realmente compila y pasa pruebas, no solo con código plausible. La model card reporta que, respecto a Domyn Edge SFT, mejora GPQA Diamond pass@1 en +9,1 puntos (hasta 65,4%) y AIME 2026 avg@10 en +5,0 puntos (hasta 66,3%).

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en programación competitiva y código general.
- Razonamiento matemático y de problemas tipo competición (AIME, GPQA según la model card).
- Programación CUDA y código de bajo nivel.
- Software engineering a nivel de repositorio (contexto de hasta 64k tokens en entrenamiento).
- Modo de razonamiento explícito mediante la plantilla de chat `<think>`.
- Multilingüismo en 13 idiomas (en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr).
- Puntuación token a token de rollouts para destilación on-policy (su función principal en el pipeline MOPD).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Destilación on-policy de modelos estudiantes: el modelo actúa como teacher que puntúa token a token los rollouts generados por el estudiante dentro de un pipeline MOPD, usando su especialización en código para guiar la política del alumno.
- Generación de código en producción con validación por tests: su entrenamiento GRPO recompensado por tests unitarios lo hace adecuado para pipelines donde el código generado se valida automáticamente antes de integrarse.
- Asistencia en programación competitiva: resolución de problemas algorítmicos con razonamiento `<think>` y contexto largo, útil en plataformas de práctica y evaluación automatizada.
- Revisión y generación de código CUDA: su SFT específico en CUDA permite asistir en kernels y optimizaciones de bajo nivel que los modelos generalistas suelen fallar.
- Trabajo sobre repositorios completos: con contexto de hasta 64k tokens puede procesar múltiples ficheros y dependencias en una sola pasada para tareas de refactorización o comprensión de código.
- Evaluación automática de calidad de código: puede emplearse como juez o scorer de soluciones generadas por otros modelos, dado su rol nativo de puntuación de rollouts.
- Despliegue local en estaciones de trabajo: con cuantizaciones de 2,16 a 4,18 GB cabe en GPU de consumo, lo que permite integrarlo en entornos de desarrollo sin infraestructura de servidor.

## Benchmarks y rendimiento

Resultados reportados en la model card (comparación con Domyn Edge SFT y Qwen3.5 4B):

| Benchmark | Domyn-Edge-Teacher-Code | Referencia |
|---|---|---|
| HumanEval | 92,1% | supera a Qwen3.5 4B |
| MBPP sanitized | 82,9% | supera a Qwen3.5 4B |
| LiveCodeBench Qwen set | 53,1% | supera a Qwen3.5 4B |
| GPQA Diamond pass@1 | 65,4% | +9,1 pts sobre Domyn Edge SFT |
| AIME 2026 avg@10 | 66,3% | +5,0 pts sobre Domyn Edge SFT |

Rendimiento de inferencia medido con Q4_K_M en una NVIDIA RTX PRO 6000 Blackwell (96 GB VRAM), llama-cli, `-ngl 99`, contexto 16.384, KV cache `q8_0`:

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.065,42 tokens/s |
| Velocidad media de generación | 267,64 tokens/s |
| Tiempo total | 44,8 s |
| VRAM pico | 4,24 GiB |
| Uso pico de GPU | 91% |
| Capas offloaded | 99 |

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF): Q3_K_M ~2 GB, Q4_K_M ~2,42 GB, Q5_K_M ~2,81 GB, Q6_K ~3,23 GB, Q8_0 ~4,18 GB, BF16 ~7,87 GB.
- En la prueba documentada con Q4_K_M el pico de VRAM fue de 4,24 GiB incluyendo KV cache a 16.384 tokens con `q8_0`, por lo que el margen sobre el tamaño del fichero es moderado.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q6/Q8 o contextos largos. En servidor, A100/H100 no son necesarias por tamaño, pero permiten contextos de 64k y mayor concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp (probado), Ollama (formato GGUF compatible), text-generation-inference (tag del repo), transformers con los pesos originales en safetensors.
- Latencia y throughput: 267,64 tokens/s de generación y 1.065,42 tokens/s de prompt processing en RTX PRO 6000 Blackwell con Q4_K_M; en GPU de consumo el throughput será sensiblemente menor y no se dispone de cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Codigo (HumanEval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Domyn-Edge-Teacher-Code | ~4B denso | 64k (entrenamiento) | 92,1% | Apache 2.0 | GGUF + safetensors |
| Qwen3.5 4B | ~4B | no disponible | inferior según model card | no disponible | no disponible |
| Domyn Edge SFT | ~4B | no disponible | no disponible | no disponible | base del modelo |

No se dispone de datos de benchmarks de Qwen3.5 4B ni de Domyn Edge SFT en la información proporcionada más allá de las comparaciones cualitativas de la model card; no se inventan cifras adicionales.

## Limitaciones y advertencias

- El modelo está diseñado como teacher para destilación, no como asistente generalista; su comportamiento fuera del dominio de código y razonamiento puede ser subóptimo.
- Riesgo de alucinación en APIs, librerías y firmas de funciones, especialmente en código de repositorio o CUDA poco representado.
- Sesgos conocidos: no disponible en la información proporcionada.
- Aunque soporta 13 idiomas, el entrenamiento se centra en código y razonamiento; el rendimiento en idiomas distintos del inglés puede degradarse y no hay benchmarks por idioma.
- La ventana de contexto de 64k corresponde al entrenamiento; la prueba de inferencia documentada usa 16.384 tokens, y no se garantiza un rendimiento estable a 64k en todas las configuraciones.
- Las cifras de throughput corresponden a hardware de gama alta (RTX PRO 6000 Blackwell); en GPU de consumo el rendimiento será menor.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset `Domyn-Edge-Teacher-Code-Mix` si se reutiliza para reentrenamiento.
- El repo GGUF tiene 0 descargas y 2 likes en el momento de la consulta; es una publicación reciente y poco validada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Domyn-Edge-Teacher-Code-GGUF
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-Teacher-Code
- Dataset de entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-Code-Mix
- llama.cpp: https://github.com/ggml-org/llama.cpp
