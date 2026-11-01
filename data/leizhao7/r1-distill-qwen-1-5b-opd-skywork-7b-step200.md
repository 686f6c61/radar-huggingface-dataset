# leizhao7/R1-Distill-Qwen-1.5B-OPD-Skywork-7B-Step200

## Resumen

R1-Distill-Qwen-1.5B-OPD-Skywork-7B-Step200 es un checkpoint de investigación de 1.78 mil millones de parámetros publicado por el usuario leizhao7 en HuggingFace. Se trata de un modelo estudiante obtenido mediante destilación on-policy (OPD, on-policy distillation) a partir de deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, usando como profesor fijo el modelo Skywork-OR1-Math-7B. El checkpoint corresponde al paso 200 de entrenamiento, el punto final del experimento descrito en el paper "Why On-Policy Distillation Sometimes Fails: Vanishing Learning Signals" (arXiv:2610.11247).

Su propósito principal es reproducir y estudiar los efectos de la destilación on-policy sobre el razonamiento matemático en modelos pequeños. Tras 200 actualizaciones, la precisión media (avg@8) macro sobre AIME24, AIME25 y AMC23 pasó del 39,85 % del estudiante inicial al 46,12 %, una mejora de 6,27 puntos porcentuales. El modelo conserva la arquitectura Qwen2 del estudiante base y hereda sus capacidades de razonamiento tipo DeepSeek-R1, por lo que resulta relevante para investigadores que trabajan en destilación de modelos de razonamiento compactos y para quienes buscan un modelo matemático ligero con pesos bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder denso, familia de DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no disponible (no es MoE; es un modelo denso, todos los parámetros están activos) |
| Longitud de contexto | no disponible (el entrenamiento usó máximos de 1.024 tokens de prompt y 21.000 de respuesta; el contexto nativo de Qwen2-1.5B es 131.072, pero no consta en la ficha) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión original; el repo ocupa 3,6 GB, compatible con bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (con atribuciones upstream: MIT de DeepSeek y Apache-2.0 del ancestro Qwen2.5-Math-1.5B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de DeepSeek-R1-Distill-Qwen-1.5B, que a su vez desciende de Qwen2.5-Math-1.5B mediante destilación de razonamiento de DeepSeek-R1. La arquitectura subyacente es un transformer decoder denso de la familia Qwen2, sin mezcla de expertos ni mecanismos de atención lineal. No hay cambios arquitectónicos respecto al estudiante inicial: la mejora proviene exclusivamente del entrenamiento.

El entrenamiento aplicó 200 actualizaciones de destilación on-policy con objetivo KL inverso, aproximado usando los 16 tokens superiores del estudiante (receta pública `r1_top16`), con pesos basados en probabilidades del estudiante y media global sobre los tokens de respuesta válidos. Las respuestas generadas por el propio estudiante sirven como prefijos para la supervisión del profesor fijo Skywork-OR1-Math-7B. Los datos de entrenamiento provienen del dataset BytedTsinghua-SIA/DAPO-Math-17k con el preprocesado de prompts matemáticos del paper DAPO. Se usó el optimizador AdamW con learning rate constante de 1e-6, batch de 64 prompts con 1 rollout por prompt, temperatura de muestreo 1.0, y máximos de 1.024 tokens de prompt y 21.000 de respuesta. No se menciona RLHF ni DPO adicionales. La plantilla de chat es la de razonamiento de DeepSeek-R1-Distill, y la model card advierte expresamente no relabelarla como modelo Qwen3 non-thinking.

## Capacidades

- Razonamiento matemático: resolución de problemas de competición (AIME, AMC) mediante cadenas de razonamiento estilo DeepSeek-R1 con tokens de reflexión.
- Generacion de texto conversacional en inglés mediante la plantilla de chat guardada en el repositorio.
- Generacion de respuestas largas: entrenado con respuestas de hasta 21.000 tokens, adecuado para cadenas de razonamiento extensas.
- No hay soporte documentado de tool calling, function calling ni capacidades de agente multi-paso.
- Sin capacidades multimodales: es un modelo de texto puro (text-generation).
- No está orientado a uso general: es un checkpoint de investigación centrado en razonamiento matemático.

## Casos de uso

- Investigacion en destilacion on-policy: es el artefacto central del paper; permite reproducir los experimentos de señales de aprendizaje desvanecientes en OPD y comparar contra otras recetas de destilación.
- Benchmarking de modelos matematicos pequenos: al disponer de métricas archivadas en AIME24/25 y AMC23, sirve como punto de comparación para modelos de ~1,5B en razonamiento matemático.
- Resolucion de problemas de olimpiadas matematicas: dada una pregunta tipo AIME/AMC en inglés, genera una cadena de razonamiento larga y una respuesta final, con temperatura 0,7 y top-p 0,95 recomendadas.
- Estudio de la degradacion o mejora de la perdida KL: el checkpoint incluye `validation.json` y `SHA256SUMS`, útil para analizar la relación entre pérdida top-16 y precisión downstream.
- Prototipado ligero de razonamiento en local: con 1,78B de parámetros y 3,6 GB de pesos, cabe en GPUs de consumo para experimentar con razonamiento matemático sin infraestructura cara.
- Base para nuevos fine-tunings matematicos: al partir de un modelo ya afinado en DAPO-Math-17k con OPD, puede servir como inicialización para experimentos adicionales de RL o destilación en el dominio matemático.

## Benchmarks y rendimiento

Resultados archivados del run del paper en el checkpoint paso 200. La métrica es avg@8 (media de acierto sobre 8 muestras, macro-promediada sobre los tres benchmarks), no pass@k. Evaluación con temperatura 0,7, top-p 0,95 y longitud máxima de respuesta de validación de 31.744 tokens.

| Benchmark | avg@8 (%) |
|---|---:|
| AIME24 | 39,17 |
| AIME25 | 29,17 |
| AMC23 | 70,03 |
| **Media macro** | **46,12** |

El estudiante inicial (paso 0) obtenía 39,85 % de media macro, por lo que la mejora tras 200 pasos es de +6,27 puntos porcentuales. La pérdida top-16 final registrada fue 0,16015582, un 23,9 % menor que en la actualización 1 (el checkpoint final no coincide con el mínimo de pérdida observado durante el entrenamiento, y la pérdida registrada no es la KL sobre el vocabulario completo). No hay comparativas publicadas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,78B de parámetros en bf16 (3,6 GB de pesos), se estima en torno a 4-6 GB de VRAM incluyendo KV cache; con cuantización a 4 bits (no publicada oficialmente) cabría en ~2 GB, aunque no hay cuantizaciones oficiales disponibles.
- GPUs recomendadas: cualquier GPU de consumo con 6 GB o más es suficiente (RTX 3060, RTX 4060, RTX 4090); no se requieren A100 ni H100 para inferencia.
- Cabe con holgura en GPUs de consumo: sí, en prácticamente cualquier GPU moderna de 6 GB o más; también es viable en CPU mediante llama.cpp si se convierte a GGUF (conversión no publicada oficialmente).
- Opciones de despliegue: Transformers 4.56.2 o superior con PyTorch y Accelerate (ejemplo oficial en la model card con `AutoModelForCausalLM` y `AutoTokenizer`); compatible con text-generation-inference y endpoints de HuggingFace según los tags del repo; no hay soporte oficial documentado para vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo denso de 1,78B, se esperan latencias bajas en GPU de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Enfoque | Notas |
|---|---|---|---|---|
| R1-Distill-Qwen-1.5B-OPD-Skywork-7B-Step200 | 1,78 B | MIT | Razonamiento matemático vía OPD (profesor Skywork-OR1-Math-7B) | avg@8 macro 46,12 % (AIME24/25, AMC23); checkpoint de investigación |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | MIT | Razonamiento general vía destilación de DeepSeek-R1 | Estudiante inicial de este checkpoint; 39,85 % avg@8 macro según el paper |
| Skywork/Skywork-OR1-Math-7B | 7 B | no disponible | Razonamiento matemático (profesor del OPD) | Cuatro veces mayor; no se incluyen sus pesos en este repo |

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un producto: el paper reporta un único run por condición con un horizonte fijo de 200 actualizaciones, por lo que los resultados no establecen rendimiento de propósito general ni seguridad.
- El checkpoint exportado no ha sido re-evaluado de forma independiente durante el empaquetado; las métricas son del run archivado del paper.
- Hereda todas las limitaciones del estudiante inicial DeepSeek-R1-Distill-Qwen-1.5B y puede producir respuestas o código incorrectos; existe riesgo de alucinación, especialmente fuera del dominio matemático.
- La receta pública `r1_top16` es un lanzador reconstruido por conveniencia, no el comando histórico exacto que produjo el checkpoint.
- La pérdida top-16 registrada no es la KL de vocabulario completo, y el checkpoint final no es el de pérdida mínima; interpretar la curva de pérdida requiere leer el paper.
- Restricciones de licencia: aunque el modelo es MIT, hay que preservar el copyright/licencia MIT de DeepSeek y la atribución Apache-2.0 del ancestro Qwen2.5-Math-1.5B (ver `LICENSE`, `UPSTREAM_ATTRIBUTION.md` y `LICENSE-QWEN-APACHE-2.0`).
- Orientado a inglés; el rendimiento en otros idiomas, incluido el castellano, no está evaluado.
- Usa la plantilla de chat de razonamiento de DeepSeek-R1-Distill; no debe relabelarse como modelo Qwen3 non-thinking.
- Las respuestas de razonamiento pueden ser muy largas (hasta ~21.000-31.000 tokens en evaluación), lo que incrementa la latencia real pese al tamaño reducido del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leizhao7/R1-Distill-Qwen-1.5B-OPD-Skywork-7B-Step200
- Paper (arXiv): https://arxiv.org/abs/2610.11247
- Pagina del proyecto: https://leizhao7.github.io/opd-learning-signals/
- Codigo y resultados numericos: https://github.com/leizhao7/opd-learning-signals
- Mapa de experimentos: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/EXPERIMENTS.md
- Notas de reproducibilidad: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/REPRODUCIBILITY.md
- Estudiante inicial: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Profesor (referencia publica): https://huggingface.co/Skywork/Skywork-OR1-Math-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
