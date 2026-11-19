# netprojects/Qwen3.8-27B-DSpine-b16-MLX

## Resumen

Qwen3.8-27B-DSpine-b16-MLX es la conversión al formato MLX del drafter DSpine de Tencent Hunyuan para el modelo Qwen3.8-27B. No se trata de un modelo generativo completo, sino de un modelo auxiliar de decodificación especulativa: un transformer pequeño de 5 capas y aproximadamente 2.025 millones de parámetros (2,0B) que propone bloques de tokens que el modelo objetivo de 27B verifica en una sola pasada. El resultado es la salida exacta del modelo de 27B, pero con una velocidad de decodificación entre 2 y 4 veces mayor en Apple Silicon.

El modelo base, Qwen3.8-27B, es una arquitectura híbrida con 48 capas de GatedDeltaNet (atención lineal) y 16 capas de atención completa, lo que hace que el soporte de decodificación especulativa requiera un rollback exacto del estado de atención lineal. Este drafter incorpora una ventana deslizante de 8192 tokens y lee las activaciones de las capas 1, 16, 31, 46 y 61 del modelo objetivo para generar sus propuestas.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B con aceleración especulativa en hardware de consumo de Apple (MacBook Pro con chip M5 Max), algo que hasta ahora requería GPUs de datacenter. La licencia Apache-2.0 y la integración con el paquete `dspine_mlx` de Tencent facilitan su adopción en producción local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas (drafter de decodificación especulativa DSpine) |
| Parametros totales | 2.025.912.064 (2,0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 8192 tokens en el drafter; contexto del objetivo Qwen3.8-27B no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); el drafter puede ejecutarse en 4, 8 o 16 bits mediante `--draft-bits` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout MLX), 4,05 GB en bf16 |

## Arquitectura y entrenamiento

El drafter DSpine es un transformer de 5 capas y 2,0B parámetros que opera como modelo de borrador en un esquema de decodificación especulativa por bloques. En cada ronda propone un bloque de tokens (por defecto 16, configurable con `--block-size`), y el modelo objetivo Qwen3.8-27B verifica el bloque completo en una sola pasada forward. El drafter lee las activaciones internas de las capas 1, 16, 31, 46 y 61 del objetivo, lo que le permite condicionar sus propuestas al estado real del modelo grande. Incorpora una ventana deslizante de 8192 tokens.

La innovación técnica principal es el soporte de rollback exacto del estado de atención lineal de las 48 capas GatedDeltaNet del modelo objetivo. Esto es necesario porque la verificación especulativa requiere retroceder el estado cuando se rechazan tokens propuestos, y en arquitecturas híbridas con atención lineal ese estado no es trivialmente reversible. El soporte fue integrado en el paquete `dspine_mlx` de Tencent (PR #3). Los pesos publicados son el checkpoint bf16 original de Tencent (revisión `ea909c0`), sin modificar, únicamente reorganizados en el layout que MLX carga directamente. No se dispone de información sobre el dataset de entrenamiento del drafter ni sobre si se usó RLHF o DPO.

## Capacidades

- Decodificación especulativa por bloques con verificación exacta: la salida es la del modelo objetivo Qwen3.8-27B en greedy, salvo redondeos bf16 en empates casi exactos.
- Aceleración de generación de texto en Apple Silicon mediante MLX, con speedups medidos de ×2,03 a ×4,31 según la cuantización del objetivo.
- Soporte de modo "thinking on" y "thinking off" (este último con `--adaptive` para la decodificación greedy más rápida).
- Gestión de prompts largos: probado con prompts de 33k tokens manteniendo speedups de ×2,02 a ×2,85.
- Compatible con cualquier build MLX de Qwen3.8-27B (4-bit, 8-bit, bf16).
- No es un modelo de propósito general: no genera texto de forma autónoma sin el modelo objetivo, no soporta tool calling por sí mismo ni capacidades de visión o audio.

## Casos de uso

- Inferencia local de Qwen3.8-27B en MacBook Pro: usar el drafter para acelerar de 31,9 a 64,7 tok/s con objetivo 4-bit, haciendo viable la generación interactiva de un modelo de 27B en hardware de consumo Apple.
- Generación de código en local: con speedups de ×2 a ×4 en HumanEval y MBPP, permite iterar sobre funciones Python (por ejemplo, comprobar si un número es primo) con latencia aceptable en un portátil.
- Razonamiento matemático asistido: los tests sobre GSM8K y MATH-500 muestran 90% de precisión en GSM8K con objetivo 4-bit, adecuado para resolver problemas paso a paso en local sin depender de la nube.
- Procesamiento de documentos largos: con prompts de 33k tokens y 57,3 tok/s en 4-bit, sirve para resumir o extraer información de contratos, informes o código extenso en una sola sesión.
- Despliegue de asistentes conversacionales multi-turno en Apple Silicon: la ventana deslizante de 8192 tokens del drafter y el contexto del objetivo permiten mantener conversaciones con historial sin degradar el throughput.
- Evaluación y benchmarking de modelos en local: el flag `--baseline` permite comparar decodificación plana frente a especulativa en el mismo hardware, útil para investigación sobre técnicas de aceleración.
- Prototipado de pipelines de agentes en local: al ejecutar el 27B con latencia reducida, se pueden probar bucles multi-paso de razonamiento antes de migrar a infraestructura de producción.

## Benchmarks y rendimiento

Rendimiento medido en MacBook Pro M5 Max, 128 GB, v0.2, greedy, 512 tokens nuevos, 10 prompts (2 de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench), drafter 4-bit por defecto:

| Build del objetivo | mlx-lm plano | Con DSpine | Speedup | Bloque de verificación |
|---|---|---|---|---|
| 4-bit | 31,9 tok/s | 64,7 tok/s | ×2,03 | 5 |
| 8-bit | 17,9 tok/s | 52,1 tok/s | ×2,91 | 5 |
| bf16 | 9,1 tok/s | 39,1 tok/s | ×4,31 | 16 |

Thinking off con `--adaptive`: 4-bit 32,0 → 71,0 tok/s (×2,22); 8-bit 18,0 → 54,0 tok/s (×3,00). Prompts largos (33k tokens, thinking off, 256 tokens nuevos): 4-bit 28,3 → 57,3 tok/s (×2,02), 8-bit 16,7 → 47,7 tok/s (×2,85); memoria pico 29 GB y 42 GB respectivamente.

Aceptación y calidad (thinking off, drafter bf16, bloque completo de 16 tokens, primeras 50 preguntas de test de GSM8K):

| Build del objetivo | Tokens por ronda | Precisión GSM8K |
|---|---|---|
| 4-bit | 7,25 | 90% |
| 8-bit | 7,32 | 84% |
| bf16 | 7,33 | 86% |
| Model card de Tencent (GSM8K, T=0) | 7,20 | no disponible |

## Requisitos de hardware

- VRAM/memoria unificada: el drafter ocupa 4,05 GB en bf16. La memoria total depende del objetivo: 29 GB de pico con objetivo 4-bit y prompt de 33k tokens; 42 GB con objetivo 8-bit.
- GPU recomendadas: Apple Silicon exclusivamente (MLX). Los benchmarks se realizaron en MacBook Pro M5 Max con 128 GB. No hay soporte para CUDA ni ROCm en este repositorio.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada suficiente: un Mac con 32 GB puede ejecutar el objetivo 4-bit con prompts moderados; 64 GB o más es recomendable para prompts largos y objetivo 8-bit.
- Opciones de despliegue: `dspine-hybrid-mlx` (instalación de una línea, añade `--adaptive`) o el paquete oficial `dspine_mlx` de Tencent. Requiere una build MLX de Qwen3.8-27B como objetivo (por ejemplo, `mlx-community/Qwen3.8-27B-4bit`).
- Latencia y throughput: 64,7 tok/s con objetivo 4-bit y thinking on; 71,0 tok/s con thinking off y `--adaptive`; 39,1 tok/s con objetivo bf16. El coste de un forward del objetivo 4-bit es de 34 ms para 1 token, 42 ms para 5 y 89 ms para 16, lo que justifica el bloque de 5 por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-DSpine-b16-MLX (este) | 2,0B (drafter) | ventana 8192 | Decodificación especulativa para Qwen3.8-27B en MLX | Apache-2.0 | Hugging Face, MLX |
| tencent/Qwen3.8-27B-DSpine-b16 | 2,0B (drafter) | ventana 8192 | Drafter original bf16 para Qwen3.8-27B | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | 27B (objetivo) | no disponible | Modelo generativo híbrido GatedDeltaNet + atención completa | no disponible | Hugging Face |
| mlx-community/Qwen3.8-27B-4bit | 27B (objetivo cuantizado) | no disponible | Build MLX 4-bit del objetivo, sin aceleración especulativa | no disponible | Hugging Face |

No se dispone de información sobre otros drafters especulativos comparables (EAGLE, Medusa) en formato MLX para este modelo concreto.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere siempre un build MLX de Qwen3.8-27B como objetivo. No puede usarse para generación de texto por sí solo.
- Exclusivo de Apple Silicon: depende de MLX; no hay soporte para CUDA, ROCm ni CPU convencional en este repositorio.
- La salida puede diferir del objetivo en empates casi exactos por redondeo bf16, aunque en la práctica es la salida greedy del objetivo.
- La ventana deslizante del drafter es de 8192 tokens; con prompts muy largos el beneficio depende de la gestión del estado del objetivo, no del drafter.
- Idiomas soportados no documentados: la cobertura multilingüe hereda la del objetivo Qwen3.8-27B, pero no se especifica en la model card.
- No hay datos publicados sobre sesgos del drafter ni sobre su dataset de entrenamiento.
- Riesgo de alucinación: heredado del modelo objetivo Qwen3.8-27B; el drafter no lo mitiga ni lo agrava.
- La licencia Apache-2.0 cubre el drafter, pero el uso del objetivo Qwen3.8-27B está sujeto a su propia licencia, que no se detalla en la información disponible.
- El proyecto no está afiliado a Tencent, Alibaba/Qwen ni Apple; el soporte y mantenimiento dependen de NetProjects y de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Modelo base (drafter original de Tencent): https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Modelo objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del runtime MLX: https://github.com/internet-projects/dspine-hybrid-mlx
- Repositorio oficial de Tencent DSpine: https://github.com/Tencent/DSpine
- PR de soporte híbrido en Tencent DSpine: https://github.com/Tencent/DSpine/pull/3
- mlx-lm: https://github.com/ml-explore/mlx-lm
- NetProjects: https://netprojects.com
