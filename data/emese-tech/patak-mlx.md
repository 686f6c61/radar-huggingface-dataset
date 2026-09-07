# emese-tech/patak-mlx

## Resumen

Emese-Patak (9.15B) es un modelo de lenguaje instructivo en húngaro desarrollado por emese-tech a partir del modelo base EuroLLM-9B de utter-project. Se ha entrenado mediante un pipeline que combina continued pre-training (CPT), fine-tuning supervisado (SFT) y optimización de preferencias (DPO), y se distribuye en formato MLX con cuantización q8, pensado para su ejecución eficiente en dispositivos Apple Silicon. El modelo ofrece una ventana de contexto de 32.768 tokens y una licencia Apache 2.0, lo que lo hace adecuado para aplicaciones comerciales y de investigación. Su relevancia radica en ser un modelo de 9.152 millones de parámetros especializado en húngaro con capacidades de instrucción, optimizado para hardware de Apple, y con resultados destacados en el benchmark interno emese-bench v1 (413/500, 83%).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en EuroLLM-9B, arquitectura tipo Llama según tags) |
| Parametros totales | 9.152.319.488 (9.15B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | q8 (MLX, group size 64); bf16 disponible en el repositorio patak/ |
| Idiomas soportados | Húngaro (hu) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX q8) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de EuroLLM-9B, un modelo de lenguaje de 9.152 millones de parámetros. El proceso de entrenamiento incluye una fase de CPT con 5,1 millones de tokens y 5.000 iteraciones, seguida de un SFT con el dataset instruct_v18b durante 1 época (rank 16, scale 32, learning rate 1,5e-5) y una fase de DPO con 36 pares alfa durante 120 iteraciones (rank 16, scale 32, learning rate 5e-6). Una innovación técnica destacable es que tanto el SFT como el DPO se entrenaron directamente sobre la versión cuantizada q8 del modelo, en lugar de entrenar en bf16 y cuantizar después. Esto hace que la precisión q8 sea la precisión nativa del modelo, no una conversión posterior. El contexto máximo es de 32.768 tokens, el nativo de EuroLLM-9B.

## Capacidades

- Generación de texto instructivo en húngaro con plantilla ChatML.
- Razonamiento y seguimiento de instrucciones gracias al entrenamiento con SFT y DPO.
- Capacidad de procesar documentos largos gracias a la ventana de contexto de 32.768 tokens.
- El benchmark interno emese-bench v1 evalúa categorías como lectura, código, seguridad, honestidad e inglés, lo que sugiere cierta capacidad en estas áreas.
- Soporte de tool calling / function calling: no se menciona en la información disponible.
- Soporte de agentes y multi-step reasoning: no se menciona en la información disponible.

## Casos de uso

- Asistente conversacional en húngaro: el modelo puede mantener conversaciones multi-turno usando la plantilla ChatML, con un contexto de 32.768 tokens que permite gestionar diálogos largos.
- Análisis de documentos extensos: la ventana de contexto de 32k tokens permite procesar informes, contratos o artículos largos en húngaro sin perder información relevante.
- Generación de código y asistencia en programación: el benchmark emese-bench v1 incluye una categoría de código, lo que indica que puede ayudar en tareas de desarrollo de software.
- Aplicaciones locales en Apple Silicon: al estar en formato MLX q8, se puede ejecutar de forma eficiente en Macs con chips M1, M2, M3 o M4, sin necesidad de GPU externa ni conexión a la nube.
- Investigación en NLP para húngaro: sirve como modelo de referencia para tareas de comprensión y generación en húngaro, con licencia Apache 2.0 que facilita su uso en proyectos académicos y comerciales.
- Sistemas de moderación y control de seguridad: el benchmark destaca un rendimiento casi perfecto en seguridad y honestidad, lo que lo hace adecuado para filtrar contenido o verificar respuestas en aplicaciones de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta los siguientes resultados en su benchmark interno emese-bench v1:

| Benchmark | Resultado |
|---|---|
| emese-bench v1 (consolidado Ultimate+BlindSpot, 500 puntos) | 413/500 (83%) |
| Prueba interna bf16 vs q8 (250 puntos) | 218 (bf16) vs 217 (q8) |
| Resultados mencionados en el README: "218/250 Ultimate · 302/376 BlindSpot" | No se especifica el contexto exacto |

## Requisitos de hardware

- VRAM estimada para inferencia: para el formato MLX q8, el modelo ocupa ~9,1 GB en disco, por lo que se necesita al menos 9-10 GB de memoria unificada en Apple Silicon. Para la versión bf16, se requieren ~17 GB.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con 16 GB o más de RAM unificada. No se recomiendan GPUs NVIDIA para este repositorio, ya que es exclusivo de MLX.
- Cabe en consumer GPU: sí, en Macs con 16 GB de RAM unificada. En GPUs NVIDIA no directamente; se puede usar el repositorio patak (bf16) con vLLM o TGI.
- Opciones de despliegue: mlx_lm (Apple Silicon). Para despliegue con transformers, vLLM o TGI, se debe usar el repositorio patak (bf16).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos similares. El modelo es una adaptación directa de utter-project/EuroLLM-9B, por lo que comparte arquitectura y tamaño, pero no hay datos comparativos de rendimiento frente a otras alternativas en la información disponible.

## Limitaciones y advertencias

- Este repositorio es exclusivo para mlx_lm; no se puede cargar con transformers, vLLM o TGI porque la cuantización MLX q8 no es compatible con esas librerías.
- El idioma principal es el húngaro; no se garantiza un rendimiento adecuado en otros idiomas, aunque el benchmark interno incluye pruebas en inglés.
- El modelo puede sufrir alucinaciones, como cualquier modelo de lenguaje generativo.
- No se documentan sesgos específicos, pero al estar entrenado con datos de un dominio concreto, puede presentar sesgos no evaluados.
- El entrenamiento se realizó sobre una base cuantizada q8, lo que podría afectar la calidad en comparación con un entrenamiento en bf16, aunque el autor reporta una diferencia mínima (1 punto en una prueba interna).
- La licencia Apache 2.0 permite uso comercial, pero no incluye garantías ni soporte oficial por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/emese-tech/patak-mlx
- Página del proyecto: https://emese.tech/patak
- Organización en HuggingFace: https://huggingface.co/emese-tech
- Modelo base: https://huggingface.co/utter-project/EuroLLM-9B
