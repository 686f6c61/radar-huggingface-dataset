# jhyuckkim/DeepSeek-V2-Lite-Dense-3B-ACP-K6

## Resumen

DeepSeek-V2-Lite-Dense-3B-ACP-K6 es un modelo de lenguaje denso de 2.66 mil millones de parámetros, obtenido mediante poda y destilación del modelo Mixture-of-Experts (MoE) DeepSeek-V2-Lite (16B totales, 2.4B activos). Lo desarrolla el equipo de investigación de Krafton AI como parte del artículo *Pruning and Distilling Mixture-of-Experts into Dense Language Models* (arXiv:2605.28207). El objetivo del trabajo es estudiar cómo convertir arquitecturas MoE en densas preservando el conocimiento del profesor, comparando distintos métodos de selección de expertos bajo un presupuesto de destilación fijo y muy reducido (0.3B tokens de FineWeb-Edu). Este modelo concreto usa el método de puntuación ACP (Average Conditional Probability) y mantiene 6 expertos enrutados de los 64 originales, junto con 2 expertos compartidos, fusionados en 8 grupos densos. No ha recibido fine-tuning de instrucciones ni alineación, por lo que su calidad es muy inferior a la del profesor y a la de modelos preentrenados del mismo tamaño. Se publica como artefacto de investigación para reproducir experimentos, no como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención MLA (Multi-head Latent Attention) heredada de DeepSeek-V2-Lite, sin enrutamiento MoE (expertos fusionados en capas densas) |
| Parametros totales | 2.659.708.416 (~2,66B) |
| Parametros activos | No aplica (modelo denso, todos los parámetros activos) |
| Longitud de contexto | No disponible (el profesor DeepSeek-V2-Lite soporta 128K, pero no se especifica para este modelo) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en bfloat16, safetensors) |
| Idiomas soportados | No disponible |
| Licencia | deepseek (licencia propia de DeepSeek, ver enlace en la sección de enlaces) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un estudiante denso derivado del profesor DeepSeek-V2-Lite, que emplea la arquitectura DeepSeekMoE con atención MLA y 64 expertos enrutados más 2 compartidos. El proceso de poda selecciona los K=6 expertos enrutados más relevantes según el método ACP (Average Conditional Probability) y los fusiona en capas densas junto con los 2 expertos compartidos, formando 8 grupos. Los down-projections de los grupos enrutados se escalan por la probabilidad condicional promedio de cada experto. La destilación se realizó con 0.3B tokens del subconjunto `sample-10BT` de FineWeb-Edu, un presupuesto deliberadamente bajo para comparar métodos de puntuación en igualdad de condiciones. No se aplicó fine-tuning de instrucciones, RLHF ni DPO. El modelo conserva la clase de modelo original de DeepSeek (MLA y expertos compartidos intactos), por lo que requiere `trust_remote_code=True` para cargarse desde transformers.

## Capacidades

- Generación de texto causal (modelo base) sin alineación ni entrenamiento por instrucciones.
- Razonamiento limitado, condicionado por el bajo presupuesto de destilación (0.3B tokens).
- No soporta tool calling, function calling ni ejecución de agentes.
- No dispone de modo de pensamiento, visión, audio ni otras modalidades.
- Capacidades multilingües no confirmadas; el tokenizador heredado de DeepSeek podría soportar varios idiomas, pero no hay datos publicados.
- Uso principal: reproducir experimentos de poda y destilación MoE-a-denso, comparar métodos de selección de expertos y analizar la transferencia de conocimiento.

## Casos de uso

- Reproducción de experimentos del paper: permite verificar los resultados reportados para la configuración ACP con K=6, usando los pesos publicados y el código de entrenamiento disponible en GitHub.
- Comparación de métodos de poda de expertos: al existir otras configuraciones publicadas (SF, CP, DO-ACP), se pueden contrastar en igualdad de condiciones de datos y presupuesto.
- Estudio de destilación con presupuesto extremadamente bajo: investigar cómo afecta la cantidad de tokens de destilación (0.3B) a la calidad final del modelo denso.
- Desarrollo de técnicas de compresión MoE a denso: sirve como punto de partida para mejorar algoritmos de selección y escalado de expertos.
- Análisis de transferencia de conocimiento: estudiar qué capacidades del profesor se preservan en el estudiante denso y cuáles se pierden.
- Benchmarking de infraestructura de inferencia: al ser un modelo pequeño (2.66B), puede usarse para probar pipelines de inferencia con baja latencia en hardware modesto, aunque no es su finalidad principal.

## Benchmarks y rendimiento

La tabla siguiente muestra los resultados reportados en el paper (Tabla 17) para la configuración ACP K=6 (fila en negrita) junto con otras configuraciones del mismo estudio y el profesor. Las métricas son: Winogrande (5-shot), HellaSwag (10-shot), ARC-Easy (25-shot), ARC-Challenge (25-shot) y MMLU (5-shot). El promedio es la media aritmética de las cinco.

| Configuración | Wino | Hella | ARC-E | ARC-C | MMLU | Avg |
|---|---|---|---|---|---|---|
| SF, K=6 | 54.9 | 38.9 | 52.4 | 27.1 | 26.9 | 40.04 |
| SF, K=12 | 56.9 | 41.1 | 54.8 | 28.4 | 24.6 | 41.16 |
| CP, K=6 | 53.0 | 36.9 | 49.4 | 25.7 | 25.3 | 38.07 |
| CP, K=12 | 55.6 | 40.2 | 53.5 | 26.6 | 26.8 | 40.53 |
| **ACP, K=6** | **56.8** | **38.6** | **51.0** | **27.5** | **28.1** | **40.37** |
| ACP, K=12 | 57.1 | 40.9 | 52.9 | 27.4 | 26.4 | 40.93 |
| DO-ACP, K=6 | 60.3 | 41.0 | 53.7 | 28.2 | 28.7 | 42.39 |
| DO-ACP, K=12 | 59.0 | 41.5 | 51.7 | 26.2 | 26.9 | 41.07 |
| Random FFN + teacher attn | 50.6 | 25.6 | 30.6 | 20.9 | 23.6 | 30.25 |
| Random initialization | 50.1 | 25.4 | 28.8 | 24.1 | 22.9 | 30.27 |
| Teacher (DeepSeek-V2-Lite) | 76.2 | 80.5 | 84.4 | 56.3 | 58.0 | 71.09 |

El rendimiento del estudiante es notablemente inferior al del profesor (40.37 frente a 71.09 de promedio), lo que refleja el presupuesto de destilación extremadamente bajo. No se han publicado resultados de benchmarks adicionales fuera de este artículo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~5.3 GB (2.66B parámetros × 2 bytes). Con cuantización a 4 bits (no oficial), se podría reducir a ~1.4 GB, pero no se proporcionan archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060, RTX 4060, A10, etc.). Para cuantización de 4 bits, GPUs con 4-6 GB serían suficientes.
- Cabe en GPUs de consumo de gama media; no requiere hardware de datacenter.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI o convertirse a GGUF para llama.cpp/Ollama, aunque no hay conversiones oficiales publicadas.
- Latencia y throughput: no hay datos oficiales. Dado su tamaño reducido y arquitectura densa, se espera baja latencia (del orden de decenas de ms por token) en GPUs modernas, pero son estimaciones orientativas.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otras configuraciones del mismo paper y con el profesor original. No se dispone de datos de otros modelos densos de tamaño similar (p. ej., Qwen2.5-3B) en la información proporcionada.

| Modelo | Parámetros | Contexto | Avg (5 benchmarks) | Licencia |
|---|---|---|---|---|
| DeepSeek-V2-Lite-Dense-3B-ACP-K6 (este) | 2.66B | No disponible | 40.37 | deepseek |
| DeepSeek-V2-Lite-Dense-3B-SF-K6 | 2.66B | No disponible | 40.04 | deepseek |
| DeepSeek-V2-Lite-Dense-3B-CP-K6 | 2.66B | No disponible | 38.07 | deepseek |
| DeepSeek-V2-Lite-Dense-3B-DO-ACP-K6 | 2.66B | No disponible | 42.39 | deepseek |
| Teacher (DeepSeek-V2-Lite) | 16B (2.4B activos) | 128K | 71.09 | deepseek |

El modelo ACP K=6 ocupa una posición intermedia entre las variantes SF y CP, y es superado por DO-ACP. Todas las variantes densas quedan muy por debajo del profesor, como era esperable por el bajo presupuesto de destilación.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general. No debe usarse como asistente conversacional ni en aplicaciones de producción.
- No tiene fine-tuning de instrucciones ni alineación; las respuestas pueden ser incoherentes o de baja calidad.
- La calidad es muy inferior a la del profesor y a la de modelos preentrenados del mismo tamaño, debido al presupuesto de destilación de solo 0.3B tokens.
- No se han evaluado sesgos ni riesgos de alucinación; al ser un modelo base sin alineación, es probable que presente sesgos heredados de FineWeb-Edu y del profesor.
- Licencia deepseek: puede imponer restricciones al uso comercial; se debe revisar el texto completo de la licencia antes de cualquier uso.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código personalizado incluido en el repositorio; se recomienda auditar ese código antes de usarlo en entornos no controlados.
- No se garantiza la longitud de contexto efectiva; aunque el profesor soporta 128K, no se ha validado en este estudiante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhyuckkim/DeepSeek-V2-Lite-Dense-3B-ACP-K6
- Paper (arXiv): https://arxiv.org/abs/2605.28207
- Código de destilación y poda: https://github.com/krafton-ai/moe-to-dense
- Modelo base (DeepSeek-V2-Lite): https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL
