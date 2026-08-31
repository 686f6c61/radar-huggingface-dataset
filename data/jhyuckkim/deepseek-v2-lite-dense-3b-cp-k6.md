# jhyuckkim/DeepSeek-V2-Lite-Dense-3B-CP-K6

## Resumen

DeepSeek-V2-Lite-Dense-3B-CP-K6 es un modelo de lenguaje denso de 2.66 mil millones de parámetros obtenido mediante poda y destilación del modelo Mixture-of-Experts (MoE) DeepSeek-V2-Lite, de 16B parámetros totales y 2.4B activos. Lo desarrolla Junhyuck Kim y colaboradores (Krafton AI) como artefacto de investigación para el artículo *Pruning and Distilling Mixture-of-Experts into Dense Language Models* (arXiv:2605.28207). El objetivo del trabajo es comparar métodos de puntuación y agrupación de expertos bajo un presupuesto de destilación fijo y reducido (0.3B tokens de FineWeb-Edu), por lo que la calidad absoluta es muy inferior a la del profesor y a la de modelos preentrenados del mismo tamaño. No se aplicó ajuste por instrucciones ni alineación, y el modelo se publica exclusivamente para reproducibilidad experimental, no como asistente de propósito general.

La arquitectura conserva la atención MLA (Multi-head Latent Attention) y los expertos compartidos del profesor, pero elimina el enrutamiento MoE y convierte el modelo en denso. El sufijo CP-K6 indica el método de puntuación de expertos (Conditional Probability) y la retención de 6 expertos enrutados (más 2 compartidos, total 8 grupos). El modelo se distribuye en formato safetensors con código remoto de DeepSeek, y requiere `trust_remote_code=True` para cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención MLA y expertos compartidos (derivado de DeepSeek-V2-Lite) |
| Parametros totales | 2.659.708.416 (~2.66B) |
| Parametros activos | Todos (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificado en la informacion) |
| Tipos de cuantizacion | no disponible (solo safetensors en bf16) |
| Idiomas soportados | no disponible |
| Licencia | DeepSeek (license_name: deepseek, enlace: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del profesor MoE DeepSeek-V2-Lite y lo convierte en un Transformer denso mediante poda estructural de los expertos enrutados. Se conservan los 2 expertos compartidos y se seleccionan 6 de los 64 expertos enrutados originales usando el método de puntuación CP (Conditional Probability). Los grupos de expertos enrutados se escalan en su proyección descendente (down-projection) por la probabilidad condicional promedio, mientras que los expertos compartidos se copian sin escalar. La atención MLA se mantiene intacta, al igual que la clase de modelo de DeepSeek, por lo que se requiere el código remoto incluido en el repositorio.

El entrenamiento consiste en una destilación pura sobre FineWeb-Edu (muestra `sample-10BT`) con un presupuesto de solo 0.3B tokens, deliberadamente pequeño para comparar métodos de poda en igualdad de condiciones. No se realizó RLHF, DPO ni ningún ajuste por instrucciones. El resultado es un modelo de baja capacidad absoluta, pensado únicamente para medir el efecto relativo de las distintas estrategias de selección y agrupación de expertos descritas en el paper.

## Capacidades

- Generación de texto autoregresiva básica, sin ajuste instructivo ni conversacional.
- Razonamiento elemental y comprensión lectora limitada, muy por debajo de modelos preentrenados de tamaño similar.
- Capacidad multilingüe no documentada; el modelo base DeepSeek-V2-Lite soporta inglés y chino, pero no se especifica para este estudiante.
- Sin soporte de tool calling, function calling ni uso como agente.
- Sin modo de razonamiento extendido (thinking mode), visión ni audio.
- Útil exclusivamente para reproducir experimentos de poda y destilación MoE-a-denso.

## Casos de uso

- Reproducción de experimentos académicos: permite replicar los resultados de la tabla 17 del paper, comparando el método CP con otras configuraciones (SF, ACP, DO-ACP) bajo el mismo presupuesto de destilación.
- Estudio de técnicas de destilación: sirve como base para analizar cómo afecta la selección de expertos a la calidad final de un modelo denso derivado de un MoE.
- Investigación sobre poda estructural: útil para evaluar el impacto de escalar down-projections y de agrupar expertos enrutados en la retención de conocimiento.
- Comparación de métodos de puntuación de expertos: al liberar varias variantes (SF, CP, ACP, DO-ACP), se pueden contrastar métricas de selección sin necesidad de reentrenar.
- Desarrollo de algoritmos de compresión de modelos: como punto de partida para probar nuevas estrategias de conversión MoE a denso con presupuestos de tokens reducidos.
- Docencia y formación: material didáctico para ilustrar conceptos de destilación, poda y evaluación de modelos en entornos de investigación.

## Benchmarks y rendimiento

Los resultados publicados en el paper (tabla 17) para esta configuración concreta (CP, K=6) son los siguientes, comparados con otras variantes del mismo estudio y con el profesor:

| Configuracion | Wino (5-shot) | Hella (10-shot) | ARC-E (25-shot) | ARC-C (25-shot) | MMLU (5-shot) | Avg |
|---|---|---|---|---|---|---|
| **CP, K=6 (este modelo)** | **53.0** | **36.9** | **49.4** | **25.7** | **25.3** | **38.07** |
| SF, K=6 | 54.9 | 38.9 | 52.4 | 27.1 | 26.9 | 40.04 |
| SF, K=12 | 56.9 | 41.1 | 54.8 | 28.4 | 24.6 | 41.16 |
| CP, K=12 | 55.6 | 40.2 | 53.5 | 26.6 | 26.8 | 40.53 |
| ACP, K=6 | 56.8 | 38.6 | 51.0 | 27.5 | 28.1 | 40.37 |
| ACP, K=12 | 57.1 | 40.9 | 52.9 | 27.4 | 26.4 | 40.93 |
| DO-ACP, K=6 | 60.3 | 41.0 | 53.7 | 28.2 | 28.7 | 42.39 |
| DO-ACP, K=12 | 59.0 | 41.5 | 51.7 | 26.2 | 26.9 | 41.07 |
| Random FFN + teacher attn | 50.6 | 25.6 | 30.6 | 20.9 | 23.6 | 30.25 |
| Random initialization | 50.1 | 25.4 | 28.8 | 24.1 | 22.9 | 30.27 |
| Teacher (DeepSeek-V2-Lite) | 76.2 | 80.5 | 84.4 | 56.3 | 58.0 | 71.09 |

El modelo CP K=6 obtiene el peor promedio entre las variantes con selección de expertos, y queda muy por debajo del profesor. No se han publicado resultados en otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5.3 GB en bf16 (tamaño del repositorio, que incluye pesos y código). Con cuantización a 8 bits podría reducirse a ~2.7 GB, y a 4 bits a ~1.4 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier tarjeta con al menos 6 GB de VRAM, por ejemplo RTX 3060, RTX 4060, RTX 3090 o superiores. En GPUs de datacenter como A100 o H100 cabe sin problemas.
- Cabe en GPUs de consumo (consumer) como RTX 3060 12GB o RTX 4070, incluso en bf16.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio), y potencialmente TGI o vLLM si se adapta el código remoto. No se documenta compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño (2.66B) y denso, la inferencia es rápida en hardware moderno, pero no hay mediciones oficiales.

## Comparativa con modelos similares

Comparación con el profesor y con otros estudiantes densos del mismo paper (misma arquitectura y presupuesto de destilación):

| Modelo | Parametros | Metodo de poda | Wino | Hella | ARC-E | ARC-C | MMLU | Avg |
|---|---|---|---|---|---|---|---|---|
| DeepSeek-V2-Lite (teacher) | 16B (MoE, 2.4B activos) | - | 76.2 | 80.5 | 84.4 | 56.3 | 58.0 | 71.09 |
| Dense-3B-SF-K6 | 2.66B | SF (K=6) | 54.9 | 38.9 | 52.4 | 27.1 | 26.9 | 40.04 |
| **Dense-3B-CP-K6 (este modelo)** | **2.66B** | **CP (K=6)** | **53.0** | **36.9** | **49.4** | **25.7** | **25.3** | **38.07** |
| Dense-3B-ACP-K6 | 2.66B | ACP (K=6) | 56.8 | 38.6 | 51.0 | 27.5 | 28.1 | 40.37 |
| Dense-3B-DO-ACP-K6 | 2.66B | DO-ACP (K=6) | 60.3 | 41.0 | 53.7 | 28.2 | 28.7 | 42.39 |

No se dispone de comparación con modelos densos preentrenados de tamaño similar (p. ej. Qwen2.5-3B, Llama-3.2-3B) en la información proporcionada. El modelo es claramente inferior a cualquier alternativa preentrenada, como advierte el propio autor.

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo de propósito general: el autor desaconseja explícitamente usarlo como asistente fuera del ámbito académico.
- No ha recibido ajuste por instrucciones ni alineación, por lo que no sigue instrucciones complejas y puede generar contenido incoherente o no deseado.
- Calidad muy baja en benchmarks estándar (MMLU 25.3, HellaSwag 36.9), muy por debajo de modelos preentrenados de 3B.
- Riesgo elevado de alucinación y de errores factuales, agravado por la falta de alineación.
- Sesgos no documentados; al entrenarse solo con FineWeb-Edu (datos web filtrados) puede reflejar sesgos del corpus, pero no se analizan.
- Longitud de contexto no especificada; aunque hereda la arquitectura del teacher (128K), no se garantiza el mismo comportamiento.
- Licencia DeepSeek: requiere revisar los términos del LICENSE-MODEL de DeepSeek-V2 para uso comercial; puede haber restricciones.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código no verificado del repositorio.
- Sin soporte de cuantizaciones oficiales ni integración con frameworks estándar como llama.cpp.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhyuckkim/DeepSeek-V2-Lite-Dense-3B-CP-K6
- Paper (arXiv): https://arxiv.org/abs/2605.28207
- Código del paper: https://github.com/krafton-ai/moe-to-dense
- Modelo base (teacher): https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL
