# moonbox-dev/flint-MLX

## Resumen

Flint MLX es una colección de builds cuantizados en formato MLX del modelo Flint, desarrollado por Recursive. Flint es un modelo de mezcla de expertos (MoE) de 40B parámetros totales con 2,5B parámetros activos, diseñado específicamente para agentes de programación, con capacidades de razonamiento y llamadas a herramientas. Moonbox es el autor de estas conversiones, pensadas para ejecutarse en Macs con Apple Silicon mediante la librería mlx-vlm.

El modelo base RecursiveSI/flint resuelve el problema de desplegar un MoE de gran tamaño en hardware de consumo Apple: al tener solo 2,5B parámetros activos por token, la inferencia es comparativamente ligera pese al tamaño total de 40B. Las builds de Moonbox ofrecen precisiones de 8 bits y 6 bits, cada una como una carpeta autocontenida con pesos, configuración, tokenizer, plantilla de chat y ajustes de generación.

La relevancia actual radica en que permite ejecutar un modelo orientado a agentes de código en Apple Silicon sin depender de GPUs NVIDIA, con métricas de degradación explícitas frente al modelo original en bf16 (KL, acuerdo top-1 y perplejidad). No se trata de un lanzamiento oficial de Recursive, sino de una conversión de terceros publicada bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer; conversión MLX para mlx-vlm |
| Parámetros totales | 40B (según model card: "40B-A2.5B") |
| Parámetros activos | 2,5B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits y 6 bits (builds MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con config.json, tokenizer.json y chat_template.jinja |

## Arquitectura y entrenamiento

Flint es un modelo de mezcla de expertos con 40B parámetros totales y 2,5B activos por token, orientado a agentes de programación con razonamiento y llamadas a herramientas. La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO; esa información correspondería a la model card del modelo base RecursiveSI/flint, que no se proporciona aquí.

La innovación técnica de esta publicación es la conversión a MLX para Apple Silicon mediante mlx-vlm, con builds autocontenidos que incluyen pesos, configuración, tokenizer de Recursive, plantilla de chat y ajustes de generación. Moonbox reporta métricas de fidelidad frente al original en bf16: para 8 bits, KL de 0,050 nats (p95 0,074), acuerdo top-1 del 93,51 % y perplejidad 22,57 frente a 22,55; para 6 bits, KL de 0,077 nats (p95 0,136), acuerdo top-1 del 90,82 % y perplejidad 22,66 frente a 22,55.

## Capacidades

- Generación de texto con modo de razonamiento (reasoning), según la descripción del modelo base.
- Llamadas a herramientas (tool calls) y function calling, orientado a agentes de programación.
- Razonamiento multi-paso para tareas de agente.
- Generación y asistencia en código, dado su enfoque como modelo para coding agents.
- Ejecución en Apple Silicon mediante MLX y mlx-vlm.
- Capacidades multilingües: no disponible.
- Capacidades de visión: la etiqueta mlx-vlm sugiere soporte del runtime, pero no se confirma visión en la información disponible.

## Casos de uso

- Asistente de programación local en Mac: ejecutar Flint MLX en un Mac con Apple Silicon para autocompletar, refactorizar y explicar código sin enviar datos a la nube, aprovechando la build de 6 bits para reducir el uso de memoria.
- Agente de código con tool calling: integrar el modelo en un bucle de agente que invoque herramientas (ejecución de tests, lectura de ficheros, llamadas a API) gracias a su soporte de tool calls y razonamiento multi-paso.
- Automatización de tareas de desarrollo en local: usar el modelo para generar parches o scripts en un pipeline interno, con la ventaja de que los 2,5B parámetros activos mantienen la latencia baja pese al tamaño total de 40B.
- Prototipado de agentes en Apple Silicon: emplear mlx-vlm para cargar la build de 8 bits y validar flujos de agente antes de desplegar en infraestructura mayor.
- Evaluación de cuantizaciones: comparar las builds de 8 y 6 bits con las métricas de KL y acuerdo top-1 publicadas para decidir el equilibrio entre calidad y memoria en un Mac concreto.
- Investigación sobre MoE en hardware de consumo: estudiar el comportamiento de un MoE 40B-A2.5B en Apple Silicon con distintas precisiones, usando las métricas de fidelidad frente a bf16 como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de fidelidad de la cuantización frente al original en bf16:

| Build | KL (nats) | KL p95 | Acuerdo top-1 | Perplejidad | Perplejidad original |
|---|---|---|---|---|---|
| 8 bits | 0,050 | 0,074 | 93,51 % | 22,57 | 22,55 |
| 6 bits | 0,077 | 0,136 | 90,82 % | 22,66 | 22,55 |

## Requisitos de hardware

- Hardware objetivo: Macs con Apple Silicon (etiqueta apple-silicon); no está pensado para GPUs NVIDIA.
- VRAM/memoria unificada estimada: la build de 8 bits ocupa aproximadamente 43,5 GB en pesos (suma de los shards: 4,60 + 5,30 × 7 + 0,88 GB), por lo que requiere un Mac con al menos 48 GB de memoria unificada; la build de 6 bits ocupa aproximadamente 19,5 GB en pesos, apta para Macs de 24-32 GB.
- GPU recomendadas: no disponible; el runtime es MLX sobre Apple Silicon.
- Cabe en GPU de consumo: sí, en Apple Silicon con memoria unificada suficiente; no se indica compatibilidad con RTX 4090 u otras GPUs de consumo NVIDIA.
- Opciones de despliegue: mlx-vlm (librería indicada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| Flint MLX (esta ficha) | 40B | 2,5B | no disponible | Apache 2.0 | MLX, Apple Silicon |
| RecursiveSI/flint (base) | 40B | 2,5B | no disponible | no disponible | safetensors (bf16) |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Recursive: son builds de terceros (Moonbox) y pueden diferir del modelo base.
- La cuantización introduce degradación: la build de 6 bits baja el acuerdo top-1 al 90,82 % frente al 93,51 % de 8 bits.
- La build de 8 bits requiere aproximadamente 43,5 GB solo en pesos, lo que limita su uso a Macs de gama alta con memoria unificada amplia.
- Solo funciona en Apple Silicon mediante MLX/mlx-vlm; no hay builds para CUDA ni otros runtimes en la información disponible.
- Idiomas soportados no documentados; riesgo de comportamiento deficiente en idiomas distintos del entrenamiento original.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; aplican los del modelo base, no detallados aquí.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base RecursiveSI/flint antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/flint-MLX
- Modelo base: https://huggingface.co/RecursiveSI/flint
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
