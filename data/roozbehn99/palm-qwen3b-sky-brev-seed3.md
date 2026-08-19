# roozbehn99/palm-qwen3b-sky-brev-seed3

## Resumen

Este repositorio contiene un portfolio de 13 políticas de lenguaje obtenidas por fine-tuning completo de `Qwen/Qwen2.5-3B-Instruct` mediante GRPO, con el objetivo de estudiar la alineación multi-objetivo en el plano *helpfulness* (medida por un reward model) frente a *brevity* (recompensa verificable). Cada modelo corresponde a un vector de pesos distinto sobre el simplex de dos objetivos, generado por el Algoritmo 1 del método PALM (ε=0.4, δ=0.2). El resultado es un conjunto de 13 puntos de equilibrio entre respuestas útiles y concisas, pensado para experimentos de alineación y poda de carteras de modelos.

Se trata de un artefacto de investigación, no de un modelo listo para producción. La model card indica explícitamente que no está ajustado para seguridad más allá del modelo base y que no está destinado a despliegue. Todos los modelos comparten la misma configuración de entrenamiento, diferenciándose únicamente en el vector de pesos y en la semilla de entrenamiento (este repo usa seed=3; existen repos hermanos con otras semillas).

La relevancia actual radica en que aborda un problema abierto en alineación: cómo generar un conjunto de políticas que cubran todo el frente de Pareto entre objetivos en conflicto, en lugar de un único modelo comprometido. Esto permite a investigadores evaluar *trade-offs* y seleccionar la política más adecuada según la aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B-Instruct base) |
| Parametros totales | 3.000 millones (aprox., del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 32K, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | bf16 (formato de almacenamiento) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato transformers, bf16) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen2.5-3B-Instruct`, un transformer denso de 3.000 millones de parámetros con arquitectura estándar (atención causal, sin mecanismos especiales como MoE o SSM). Sobre él se aplica fine-tuning completo con GRPO (Group Relative Policy Optimization), una variante de RLHF que optimiza la política comparando respuestas dentro de un grupo. La recompensa escalar es una combinación lineal de dos objetivos: `R1` (helpfulness, medida por el reward model `Skywork/Skywork-Reward-Llama-3.1-8B`) y `R2` (brevity, una recompensa verificable que premia respuestas cortas). Ambos rewards se normalizan min-max a [0,1] durante el entrenamiento.

El entrenamiento usa los datasets `allenai/RLVR-GSM` y `allenai/RLVR-MATH` para la fase de entrenamiento y el test de `RLVR-GSM` para evaluación. Se realizan 40.000 episodios (208 pasos de optimización) con una tasa de aprendizaje de 5e-7, batch de 4 con grad accumulation de 4, 4 muestras por prompt y longitud máxima de respuesta de 256 tokens. El coeficiente KL (β) es 0.05. El hardware utilizado fueron 4 GPUs NVIDIA A100-80GB o 4 H100. La innovación principal no está en la arquitectura, sino en el método de generación de carteras: el Algoritmo 1 de PALM produce 13 vectores de pesos sobre el simplex de dos objetivos, cubriendo el frente de Pareto de forma sistemática.

## Capacidades

- Generación de texto y razonamiento matemático: entrenado específicamente en problemas de GSM y MATH, por lo que muestra competencia en tareas aritméticas y de razonamiento simbólico.
- Equilibrio controlable entre helpfulness y brevity: según el submodelo elegido (idx0 a idx12), el modelo prioriza respuestas más extensas y detalladas (mayor w_help) o respuestas más cortas y directas (mayor w_brev).
- Alineación multi-objetivo: cada política representa un punto distinto del frente de Pareto, permitiendo estudiar el *trade-off* entre utilidad percibida y concisión.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni modo *thinking*.
- Multilingüismo: no especificado, aunque el modelo base Qwen2.5-3B-Instruct es multilingüe; no hay evidencia de evaluación en otros idiomas en esta ficha.

## Casos de uso

- Experimentos de alineación multi-objetivo: investigadores pueden usar las 13 políticas para analizar cómo varía la calidad de las respuestas al cambiar el peso entre helpfulness y brevity, y validar métodos de selección de carteras.
- Estudio de *trade-offs* en sistemas conversacionales: comparar respuestas generadas con distintos pesos permite cuantificar la pérdida de utilidad al imponer restricciones de longitud.
- Poda de carteras de modelos: el portfolio completo puede servir como *benchmark* para algoritmos que eligen un subconjunto de políticas que maximice la utilidad esperada bajo restricciones de presupuesto.
- Reproducibilidad en RLHF: al ser un artefacto de investigación con configuración documentada, es útil para replicar experimentos de GRPO multi-objetivo y verificar la influencia de la semilla.
- Análisis de robustez frente a la semilla: comparando con los repos hermanos (seed2, etc.) se puede estudiar la variabilidad del entrenamiento y la estabilidad del frente de Pareto.
- Desarrollo de reward models: el conjunto de políticas puede usarse como conjunto de validación para nuevos reward models de helpfulness o brevity, evaluando su correlación con las preferencias humanas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La tabla de evaluación post-hoc de la model card incluye columnas para `R1` (helpfulness) y `R2` (brevity) sobre el test de RLVR-GSM (1.319 prompts, muestreo con T=0.7, 256 tokens máximos), pero todos los valores aparecen vacíos (guiones). Tampoco se proporcionan métricas estándar como MMLU, HumanEval o GSM8K. No se puede afirmar ningún rendimiento cuantitativo sin inventar datos.

## Requisitos de hardware

- Inferencia: al ser un modelo de 3.000 millones de parámetros en bf16, el peso ocupa aproximadamente 6 GB. Cabe en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB) sin cuantización. Con cuantización a int8 (≈3 GB) o int4 (≈1.5 GB) podría ejecutarse en GPUs con menos VRAM, aunque no se han publicado cifras oficiales.
- Entrenamiento: la model card indica que se usaron 4 GPUs NVIDIA A100-80GB o 4 H100, con 3 GPUs para entrenamiento y 1 para vLLM (serving durante el entrenamiento).
- Opciones de despliegue: al estar en formato transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). No se mencionan configuraciones específicas de latencia o throughput.
- Para uso en producción se recomienda cuantizar y probar en hardware objetivo, pero el propio autor desaconseja el despliegue.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar cuantitativamente con otros modelos de la misma categoría (fine-tunes de Qwen2.5-3B-Instruct). Cualitativamente, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | 32K | Pre-entrenamiento + instruct | Apache-2.0 | Producción general |
| Este portfolio (idx0-12) | 3B | No disponible | GRPO multi-objetivo (helpfulness × brevity) | Apache-2.0 | Investigación en alineación |
| Otros fine-tunes de Qwen2.5-3B | 3B | Variable | Variable | Variable | Variable |

No hay modelos comparables directos en la información proporcionada, ya que la mayoría de fine-tunes de Qwen2.5-3B se centran en un único objetivo (p.ej. instruct, chat, código) y no en carteras multi-objetivo.

## Limitaciones y advertencias

- No está ajustado para seguridad: la model card indica que no se aplicó *safety tuning* más allá del modelo base, por lo que puede generar contenido inapropiado o sesgado.
- No está destinado a despliegue: es un artefacto de investigación; usarlo en producción requeriría una evaluación exhaustiva y mitigaciones adicionales.
- Sin evaluación publicada: la tabla de resultados post-hoc está vacía, por lo que no hay evidencia de rendimiento real sobre los objetivos declarados.
- Sesgos del modelo base: Qwen2.5-3B-Instruct puede arrastrar sesgos de género, etnia o idioma; este fine-tuning no los corrige.
- Riesgo de alucinación: al ser un modelo de 3B, puede generar respuestas plausibles pero incorrectas, especialmente en dominios no cubiertos por los datos de entrenamiento (GSM/MATH).
- Limitaciones de idioma: aunque el base es multilingüe, el entrenamiento se realizó con datos en inglés (RLVR-GSM/MATH), por lo que el rendimiento en otros idiomas no está garantizado.
- Restricciones de uso: la licencia Apache-2.0 permite uso comercial, pero el autor declara que no es apto para producción; el usuario asume la responsabilidad de validarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-seed3
- Repositorio hermano (seed 2): https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Reward model usado: https://huggingface.co/Skywork/Skywork-Reward-Llama-3.1-8B
- Código de entrenamiento: fork de AI2 open-instruct (no se proporciona URL directa en la información disponible)
