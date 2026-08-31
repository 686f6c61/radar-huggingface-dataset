# jhyuckkim/GPT-OSS-20B-Dense-4B-CP-K4

## Resumen

GPT-OSS-20B-Dense-4B-CP-K4 es un modelo denso de 4.190 millones de parámetros obtenido mediante poda y destilación del modelo de mezcla de expertos (MoE) `openai/gpt-oss-20b`. Lo desarrolla el equipo de investigación de KRAFTON AI (Junhyuck Kim y colaboradores) como artefacto para reproducir los experimentos del artículo *Pruning and Distilling Mixture-of-Experts into Dense Language Models* (arXiv:2605.28207). El objetivo de esta línea de trabajo es estudiar cómo convertir un MoE grande en un modelo denso compacto preservando la mayor parte de su calidad con un presupuesto de destilación muy limitado.

Este modelo concreto utiliza la configuración CP (correlation-based pruning) con K=4 expertos conservados, y se destila únicamente con 0,3 mil millones de tokens de FineWeb-Edu. La model card advierte explícitamente de que se trata de un artefacto de investigación, no de un asistente general: no ha recibido ajuste por instrucciones ni alineación, y su calidad absoluta es muy inferior a la del profesor y a la de modelos preentrenados del mismo tamaño. Su relevancia radica en que permite comparar métodos de puntuación y agrupación de expertos bajo un presupuesto de destilación idéntico, lo que lo convierte en una herramienta valiosa para la comunidad de investigación en compresión de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GptOssForCausalLM (densa, con `num_local_experts=1`) |
| Parametros totales | 4.185.089.880 (4,19 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura base de GPT-OSS-20B pero con una única ruta densa: mantiene la activación con puerta (gated activation), los sesgos por capa, la atención con ventana deslizante (sliding-window attention) y la codificación posicional rotatoria YaRN RoPE. El proceso de poda selecciona 4 de los 8 expertos del profesor (K=4) y fusiona sus proyecciones down con escalado uniforme, eliminando la capa de enrutamiento MoE.

El entrenamiento consiste en una destilación supervisada desde el profesor hacia el estudiante denso, utilizando 0,3 mil millones de tokens del subconjunto `sample-10BT` de FineWeb-Edu. No se aplicó ajuste por instrucciones ni alineación (RLHF/DPO). La elección de un presupuesto de tokens tan reducido (0,3B) es deliberada: permite comparar métodos de puntuación de expertos (SF, CP, ACP, DO-ACP) bajo condiciones equitativas, aunque sacrifica calidad absoluta. El resultado es un modelo que reproduce la estructura de GPT-OSS pero sin la capacidad de razonamiento del profesor.

## Capacidades

- Generación de texto base en modo de finalización (completion mode), sin plantilla de chat.
- Conserva la activación gated y la atención sliding-window del profesor, lo que permite procesar secuencias largas con la misma mecánica posicional (YaRN RoPE).
- No dispone de soporte para tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio).
- Su capacidad multilingüe no está documentada; el entrenamiento se realizó sobre FineWeb-Edu, predominantemente en inglés.
- No es adecuado para uso conversacional o como asistente, al carecer de ajuste por instrucciones.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de referencia para estudiar el impacto de la poda de expertos y la destilación en la calidad final, comparando configuraciones (SF, CP, ACP, DO-ACP) bajo presupuestos de tokens idénticos.
- Reproducción de experimentos académicos: los pesos permiten verificar los resultados de la Tabla 18 del artículo *Pruning and Distilling Mixture-of-Experts into Dense Language Models*.
- Análisis de la transferencia de conocimiento MoE→denso: permite estudiar qué conocimientos del profesor se conservan al fusionar expertos y cómo afecta la elección del método de puntuación.
- Desarrollo de técnicas de poda: puede usarse como base para probar nuevos algoritmos de selección de expertos o de escalado de proyecciones.
- Benchmarking de eficiencia de inferencia: al ser un modelo denso de 4B parámetros, permite medir la latencia y el throughput frente al MoE original de 20B en tareas de generación de texto.
- Educación y divulgación: útil como ejemplo práctico de destilación de MoE en cursos o talleres sobre compresión de modelos de lenguaje.

## Benchmarks y rendimiento

La model card proporciona resultados en cinco benchmarks de razonamiento y comprensión, comparando varias configuraciones de poda y el profesor original. La fila correspondiente a este modelo (CP, K=4) se muestra en negrita:

| Configuracion | Wino | Hella | ARC-E | ARC-C | MMLU | Avg |
|---|---|---|---|---|---|---|
| SF, K=4 | 51.6 | 29.4 | 34.0 | 22.4 | 23.3 | 32.15 |
| SF, K=8 | 51.6 | 29.3 | 33.3 | 21.7 | 22.8 | 31.72 |
| **CP, K=4** | **50.9** | **30.4** | **36.4** | **23.0** | **23.6** | **32.86** |
| CP, K=8 | 49.7 | 29.3 | 32.2 | 23.2 | 23.1 | 31.49 |
| ACP, K=4 | 53.0 | 31.9 | 35.6 | 23.0 | 23.3 | 33.36 |
| ACP, K=8 | 53.1 | 30.5 | 33.6 | 23.3 | 23.7 | 32.82 |
| DO-ACP, K=4 | 53.0 | 32.1 | 36.7 | 23.2 | 23.7 | 33.71 |
| DO-ACP, K=8 | 51.3 | 29.9 | 33.5 | 22.5 | 23.3 | 32.11 |
| Random FFN + teacher attn | 50.2 | 27.5 | 28.5 | 23.0 | 23.2 | 30.46 |
| Random initialization | 50.0 | 26.0 | 25.8 | 25.3 | 23.0 | 30.02 |
| Teacher (GPT-OSS-20B) | 59.3 | 39.9 | 80.9 | 53.7 | 49.6 | 56.67 |

Los resultados se obtuvieron con Winogrande 5-shot, HellaSwag 10-shot, ARC-Easy 25-shot, ARC-Challenge 25-shot y MMLU 5-shot. El profesor se evaluó en modo finalización para mantener coherencia con los estudiantes; en su formato nativo (con plantilla de chat) alcanza un MMLU del 72%, muy por encima de los 49,6 puntos en modo finalización. Este modelo (CP, K=4) obtiene una media de 32,86, ligeramente superior a otras configuraciones de poda pura pero claramente por debajo del profesor y de los métodos más avanzados (DO-ACP).

## Requisitos de hardware

No se han publicado requisitos específicos de hardware en la información disponible. Al tratarse de un modelo denso de 4,19 B parámetros, es plausible que pueda ejecutarse en GPUs de consumo con cuantización (por ejemplo, 8 bits o 4 bits), pero no hay datos confirmados sobre VRAM mínima, latencia o throughput. La inferencia puede realizarse con la librería `transformers` cargando los pesos en bfloat16, tal como se muestra en el ejemplo de uso de la model card. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No existen modelos comparables directos en la literatura abierta, ya que este es un artefacto de investigación específico para estudiar la destilación MoE→denso. La comparación más relevante es con su profesor, `openai/gpt-oss-20b`, y con otras configuraciones de poda del mismo estudio:

| Modelo | Parametros | Contexto | Avg (5 benchmarks) | Licencia |
|---|---|---|---|---|
| GPT-OSS-20B (profesor) | 20 B (MoE) | No disponible | 56,67 (modo finalizacion) | Apache 2.0 |
| Este modelo (CP, K=4) | 4,19 B (denso) | No disponible | 32,86 | Apache 2.0 |
| DO-ACP, K=4 (mejor configuracion) | 4,19 B (denso) | No disponible | 33,71 | Apache 2.0 |
| Random initialization (baseline) | 4,19 B (denso) | No disponible | 30,02 | Apache 2.0 |

La diferencia de 24 puntos en promedio entre el profesor y el mejor estudiante evidencia la pérdida de calidad inherente a la destilación con un presupuesto tan reducido. No se dispone de datos de otros modelos densos de ~4B preentrenados desde cero para comparar.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general: no ha recibido ajuste por instrucciones ni alineación, por lo que no debe usarse como asistente conversacional.
- La calidad absoluta es muy baja en comparación con el profesor y con modelos preentrenados del mismo tamaño; los benchmarks lo confirman (media de 32,86 frente a 56,67 del profesor).
- El presupuesto de destilación de solo 0,3B tokens es deliberadamente pequeño para permitir comparaciones equitativas entre métodos, pero limita severamente la capacidad del modelo.
- No se documentan sesgos específicos, pero al entrenarse sobre FineWeb-Edu, puede heredar sesgos presentes en ese corpus.
- Existe riesgo de alucinación y de incoherencia en tareas de generación abierta, dada la falta de ajuste por instrucciones.
- No se ha evaluado su comportamiento en contextos largos ni en idiomas distintos del inglés; los datos de idioma y contexto no están disponibles.
- La licencia Apache 2.0 permite uso comercial, pero la model card desaconseja explícitamente su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jhyuckkim/GPT-OSS-20B-Dense-4B-CP-K4
- Artículo en arXiv: https://arxiv.org/abs/2605.28207
- Repositorio de código (krafton-ai/moe-to-dense): https://github.com/krafton-ai/moe-to-dense
- Modelo base (OpenAI GPT-OSS-20B): https://huggingface.co/openai/gpt-oss-20b
