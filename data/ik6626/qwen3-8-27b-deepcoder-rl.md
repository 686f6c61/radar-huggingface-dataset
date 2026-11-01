# ik6626/Qwen3.8-27B-deepcoder-RL

## Resumen

Qwen3.8-27B-deepcoder-RL es un conjunto de adaptadores LoRA publicados por el usuario ik6626 sobre el modelo base Qwen/Qwen3.8-27B. El adaptador se ha entrenado con aprendizaje por refuerzo de estilo GRPO sobre problemas de programación competitiva extraídos de DeepCoder-Preview-Dataset, con un evaluador en sandbox que impide que el programa enviado haga trampas. El objetivo es mejorar la tasa de acierto en generación de código competitivo sin degradar otras capacidades del modelo base.

El repositorio contiene dos semillas de entrenamiento (seed 0 y seed 1), cada una con su checkpoint final (paso 100) y su checkpoint intermedio (paso 50), además de un script de conversión para SGLang. Cada adaptador pesa 862 MB y el repositorio completo ocupa 3,6 GB. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta una receta de RL aplicada a código con métricas de evaluación pareadas y control de regresiones; por otro, advierte de las peculiaridades de despliegue de un adaptador LoRA sobre un modelo con atención lineal híbrida (Gated DeltaNet), que requiere una conversión específica de tensores para SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer híbrido con atención lineal Gated DeltaNet (modelo base Qwen3.8-27B) |
| Parametros totales | No disponible para el adaptador (el base es de 27B según su denominación; el adaptador LoRA pesa 862 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el entrenamiento usa 12.288 tokens por respuesta |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-27B, un modelo con proyecciones de atención lineal fusionadas (`in_proj_qkv`) propias de Gated DeltaNet. El LoRA tiene rango 32 y alpha 32, y se aplica sobre las proyecciones de atención (`q/k/v/o_proj`), las de Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`), las capas MLP y `lm_head`. El entrenamiento usó RL de estilo GRPO con pérdida de importance sampling y sin penalización KL: 100 pasos con 50 problemas por paso y 4 rollouts por problema, tasa de aprendizaje 1e-5 y dos semillas independientes.

Los datos provienen de DeepCoder-Preview (primeintellect, taco, lcbv5), con 23.470 tareas tras eliminar los 500 problemas de validación retenidos, los 100 de validación y sus casi duplicados. La recompensa es binaria: 1 si el programa pasa todas las pruebas y 0 en caso contrario. Cada programa se ejecuta en un contenedor nuevo, sin red y de solo lectura, y sus salidas se comparan fuera del contenedor, de modo que las salidas anticipadas o la manipulación interna no otorgan recompensa. El prompting es de un solo turno, sin herramientas, con `reasoning_effort="low"` y 12.288 tokens por respuesta. El hardware por semilla fue una GPU de entrenamiento y dos de muestreo NVIDIA RTX PRO 6000 Blackwell, con unas 63 horas para 100 pasos.

## Capacidades

- Generación de código en Python para problemas de programación competitiva, con formato de respuesta que incluye un bloque de razonamiento breve seguido de un bloque ```python que lee de STDIN y escribe en STDOUT.
- Razonamiento de varios pasos orientado a la resolución de problemas algorítmicos.
- Mejora medida en Pass@1 sobre problemas retenidos de DeepCoder y sobre LiveCodeBench v5.
- Mantenimiento de capacidades generales del modelo base: HumanEval+, MBPP+, IFEval, MMLU-Pro y MATH-500 no caen más de 2 puntos en las comparaciones pareadas.
- No soporta tool calling ni function calling según la configuración de entrenamiento (prompt de un solo turno, sin herramientas).
- No se documentan capacidades multimodales, de audio ni de visión; el uso indicado es como LM causal de solo texto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de soluciones para jueces en línea y plataformas de práctica: el adaptador está entrenado con el formato de LiveCodeBench y produce programas completos listos para enviar, lo que encaja en pipelines de evaluación automática de problemas algorítmicos.
- Asistente de resolución de problemas en entornos de formación: se puede integrar en una herramienta interna que reciba el enunciado como mensaje de usuario y devuelva código con razonamiento breve, útil para comparar soluciones de referencia.
- Evaluación de recetas de RL sobre código: los checkpoints por semilla y por paso permiten reproducir curvas de aprendizaje y analizar la varianza entre semillas en experimentos de investigación.
- Servicio de inferencia con adaptadores múltiples: mediante SGLang con `--enable-lora` se puede servir el adaptador junto al base y seleccionarlo por petición, lo que facilita A/B testing entre el modelo base y la versión entrenada.
- Generación de datos sintéticos de código para ajuste fino posterior: las soluciones generadas con temperatura 1 y verificadas por el evaluador pueden filtrarse y reutilizarse como datos de entrenamiento supervisado.
- Automatización de pruebas de regresión de código: al no degradar HumanEval+ ni MBPP+, el adaptador puede sustituir al base en pipelines de generación de parches y tests sin penalizar la calidad general.

## Benchmarks y rendimiento

Pass@1 sobre 4 muestras a temperatura 1; ganancia en puntos con intervalo de confianza bootstrap pareado al 95 %.

| Conjunto retenido | Base | Seed 0 | Seed 1 |
|---|---|---|---|
| A: 500 problemas DeepCoder retenidos por problema | 0,480 | 0,621 (+14,1 [11,4; 16,9]) | 0,613 (+13,3 [10,5; 16,1]) |
| B: LiveCodeBench v5 test (279) | 0,609 | 0,690 (+8,1 [4,9; 11,3]) | 0,711 (+10,1 [7,0; 13,4]) |
| Codeforces, test DeepCoder (408 × 2) | 0,212 | 0,412 | 0,395 |
| A retenido en paso 50 | 0,480 | 0,598 (+11,8) | 0,598 (+11,8) |

Regresiones (adaptadores finales frente al base):

| Benchmark | Base | Seed 0 | Seed 1 |
|---|---|---|---|
| HumanEval+ (157 × 2) | 0,943 | 0,955 | 0,943 |
| MBPP+ (375 × 2) | 0,813 | 0,807 | 0,812 |
| IFEval (300, greedy) | 0,880 | 0,890 | 0,893 |
| MMLU-Pro (300, greedy) | 0,740 | 0,773 | 0,777 |
| MATH-500 (300, greedy) | 0,950 | 0,937 | 0,943 |

Ningún benchmark cae más de 2 puntos según los intervalos pareados. Alrededor de tres cuartas partes de la ganancia en el conjunto retenido provienen de mejores soluciones (tasa de acierto de respuestas que terminan: 0,597 → 0,706); el resto, de menos respuestas que agotan el límite de 12.288 tokens.

## Requisitos de hardware

- El adaptador LoRA pesa 862 MB por checkpoint; el modelo base de 27B en bfloat16 requiere aproximadamente 54 GB de VRAM solo para pesos, más memoria para KV cache y activaciones.
- GPU recomendadas para el base en bfloat16: A100 80 GB, H100 80 GB o RTX PRO 6000 Blackwell. En GPUs de 24 GB (RTX 4090) no cabe en bfloat16 sin cuantización.
- Para caber en GPU de consumo sería necesario cuantizar el modelo base (por ejemplo, a 4 bits), pero no se documentan recetas de cuantización para este adaptador.
- Despliegue: SGLang 0.5.21 es el motor usado en las evaluaciones, con `--enable-lora`, `--lora-target-modules all` y `--max-lora-rank 32`; requiere ejecutar antes `convert_to_sglang.py` para separar `in_proj_qkv` en `in_proj_q/k/v`. vLLM no está probado. La carga directa con `transformers` 5.12.1 y `peft` 0.21.2 funciona, pero es lenta.
- Latencia y throughput: con `generate` simple sobre una GPU, unos 8 tokens/s para el modelo de 27B; no se publican cifras de throughput con SGLang.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-deepcoder-RL (este) | 27B (base) + LoRA rango 32 | No disponible | RL sobre código competitivo | Apache 2.0 | HuggingFace, 21 descargas |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | LM general | No disponible en la información | HuggingFace |
| DeepCoder-Preview (referencia de datos) | No disponible | No disponible | Dataset de problemas de código | No disponible | HuggingFace Datasets |

No se dispone de datos de benchmarks de modelos alternativos comparables en la información proporcionada, por lo que la comparación cuantitativa se limita a las filas base frente a adaptador de la sección anterior.

## Limitaciones y advertencias

- Los conjuntos retenidos proceden de la misma distribución que los datos de entrenamiento (in-distribution); el rendimiento fuera de esa distribución no está caracterizado.
- El adaptador está entrenado para un formato de prompt muy concreto (un solo turno, `reasoning_effort="low"`, bloque ```python que lee STDIN y escribe STDOUT); usarlo con otros formatos puede degradar la calidad.
- El límite de 12.288 tokens por respuesta provoca que una parte de las respuestas no termine; el propio autor atribuye a esto una fracción de la ganancia.
- La evaluación en Codeforces es débil (una prueba mediana por problema), por lo que esas cifras deben tomarse con cautela.
- No se documentan sesgos conocidos, comportamiento multilingüe ni riesgos específicos de alucinación más allá de los propios de un modelo de código.
- La licencia Apache 2.0 se declara para el adaptador; conviene verificar la licencia del modelo base Qwen3.8-27B antes de uso comercial.
- El comando de despliegue con `--lora-paths` en SGLang no está probado tal cual; las evaluaciones cargaron el adaptador mediante la API de carga de tensores. vLLM no está probado.
- El adaptador se distribuye como PEFT/LoRA; no es un modelo autónomo y requiere el base para funcionar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ik6626/Qwen3.8-27B-deepcoder-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset
- Script de conversión para SGLang: https://huggingface.co/ik6626/Qwen3.8-27B-deepcoder-RL/blob/main/convert_to_sglang.py
