# kvnloo/zha-routers-qwen-small

## Resumen

ZHA routers para modelos Qwen pequeños es un conjunto de pesos de enrutamiento para la arquitectura Zyphra Hierarchical Attention (ZHA), descrita en el paper arXiv:2610.42112. No se trata de un modelo completo, sino de los únicos componentes entrenables de ZHA: 16 consultas de referencia por cabeza KV en cada capa de atención completa. El autor, kvnloo, los entrena mediante destilación con una reimplementación independiente de la sección III del paper, y advierte explícitamente de que no son los pesos de Zyphra, que no ha publicado ninguno.

El modelo base es Qwen/Qwen3-0.6B (revisión `c1899de`), un transformer denso de 0,6 mil millones de parámetros. Los routers añaden 458.752 parámetros entrenables y se distribuyen en dos geometrías: `deep-c4l6` (chunk de 4, seis niveles) y `wide-c256l1` (chunk de 256, un nivel). El objetivo es sustituir la atención densa de las capas completas por una atención jerárquica dispersa que reduzca el coste computacional en contextos largos, manteniendo la fidelidad respecto a la atención densa original mediante la minimización de la divergencia KL.

La relevancia es doble: por un lado, ofrece una reproducción abierta y verificable de una técnica de atención jerárquica publicada; por otro, lo hace sobre un modelo pequeño y con licencia Apache 2.0, lo que facilita la experimentación. No obstante, el presupuesto de entrenamiento es muy reducido (4,9 millones de tokens frente a los aproximadamente 4.000 millones del paper) y la evaluación se limita a RULER-13 a 4K/8K y un subconjunto pequeño de MMLU-Pro, sin kernels ni métricas de latencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Routers de atención jerárquica dispersa (ZHA) sobre transformer denso Qwen3-0.6B |
| Parámetros totales | 458.752 parámetros entrenables (routers); el modelo base Qwen3-0.6B no se incluye en el repo |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado a 8K; el paper original usa 32K; no se especifica el máximo soportado |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-0.6B, no documentados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

ZHA sustituye la atención completa por una atención jerárquica en árbol: cada capa de atención completa se divide en niveles con un tamaño de chunk configurable, y el router (16 consultas de referencia por cabeza KV) decide qué nodos del árbol atender. Las consultas se expresan en el espacio post-`q_norm` y pre-RoPE del modelo base, y se rotan a la última posición de cada nodo del árbol en el momento de uso. La correspondencia entre `reference_queries[i]` y `layer_ids[i]` está en `config.json`. Las dos geometrías disponibles son `deep-c4l6` (chunk 4, seis niveles) y `wide-c256l1` (chunk 256, un nivel).

El entrenamiento se realizó por destilación con una KL por nivel contra la atención densa del modelo congelado. Se usaron entre 3 y 5 millones de tokens de libros de dominio público de Project Gutenberg a contexto de 8K, con AdamW (betas 0.9 y 0.95, eps 1e-15), LR pico de 3,2e-2 con schedule WSD y recorte de gradiente de 1,0. La KL final suma 0,359 para `deep-c4l6` y 0,076 para `wide-c256l1`, lo que indica una fidelidad notablemente mayor de la geometría ancha en este presupuesto. El paper original empleó unos 4.000 millones de tokens de una mezcla de mid-training a 32K, de modo que este entrenamiento es aproximadamente tres órdenes de magnitud menor.

## Capacidades

- Enrutamiento de atención jerárquica dispersa sobre las capas de atención completa de Qwen3-0.6B, con dos geometrías de árbol seleccionables.
- Destilación de atención densa a dispersa mediante KL por nivel, con métricas de fidelidad publicadas (0,359 y 0,076).
- Integración con el modelo base Qwen3-0.6B, del que hereda generación de texto, razonamiento básico, código y matemáticas a escala 0,6B.
- No incluye tool calling, function calling ni soporte de agentes propio; dependería de las capacidades del modelo base, no documentadas aquí.
- Capacidades multilingües no documentadas en la model card.
- No dispone de kernels optimizados, modo thinking, visión ni audio.

## Casos de uso

- Investigación en atención dispersa: reproducir y comparar las geometrías `deep-c4l6` y `wide-c256l1` sobre el mismo modelo base para estudiar el compromiso entre profundidad del árbol y fidelidad de la KL, usando el harness de z0evals.
- Experimentos de contexto largo en hardware modesto: aplicar los routers a Qwen3-0.6B para probar atención jerárquica a 8K en una GPU de consumo, sin necesidad de implementar kernels propios.
- Docencia y divulgación: ilustrar cómo se destila atención densa en atención dispersa con un ejemplo abierto, pequeño y con licencia permisiva.
- Validación de técnicas publicadas: servir como referencia independiente frente a los resultados del paper arXiv:2610.42112 en la sección III, con la salvedad del presupuesto de entrenamiento reducido.
- Base para fine-tuning de routers: al ser el único componente entrenable (458.752 parámetros), permite experimentar con nuevas geometrías o datasets sin reentrenar el modelo base.
- Pruebas de integración en pipelines de evaluación: incorporar los routers a un harness de RULER o MMLU-Pro para medir la degradación respecto a la atención densa antes de invertir en entrenamientos mayores.

## Benchmarks y rendimiento

La model card indica que la evaluación se realizó únicamente en RULER-13 a 4K/8K y en un subconjunto pequeño de MMLU-Pro, pero no publica los valores numéricos en la información disponible. El único dato cuantitativo de rendimiento es la KL final por suma de niveles:

| Geometría | Parámetros | Tokens de entrenamiento | KL final (suma de niveles) |
|---|---:|---:|---:|
| deep-c4l6 | 458.752 | 4.915.200 | 0,359 |
| wide-c256l1 | 458.752 | 4.915.200 | 0,076 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, RULER) con valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-0.6B en FP16 requiere aproximadamente 1,2 GB de pesos; en cuantización de 8 bits, unos 0,6 GB, y en 4 bits, unos 0,3 GB. Los routers añaden 458.752 parámetros (menos de 2 MB en FP32), por lo que el coste adicional es despreciable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes. Para contextos de 8K, la memoria de activaciones y caché KV es el factor limitante, no los pesos.
- Cabe en GPU de consumo: sí, en todas las GPU consumer con 4 GB o más, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: al ser pesos PyTorch sin kernels específicos, la integración requiere el código de referencia de z0evals. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que ZHA no es una arquitectura estándar en esos motores.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se hacen afirmaciones de latencia y que no se incluyen kernels.

## Comparativa con modelos similares

No hay modelos directamente comparables en el ecosistema abierto: ZHA es una arquitectura de atención jerárquica sin implementaciones publicadas por terceros y Zyphra no ha liberado pesos. La comparación más razonable es con el modelo base y con variantes de atención dispersa sobre Qwen3-0.6B.

| Modelo | Parámetros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| ZHA routers (este repo) | 458.752 (routers) + 0,6B base | 8K entrenado | Jerárquica dispersa | Apache 2.0 | Pesos PyTorch, sin kernels |
| Qwen/Qwen3-0.6B | 0,6B | 32K (según Qwen3) | Densa | Apache 2.0 | Amplia, soporte en vLLM, llama.cpp, Ollama |
| Otras variantes de atención dispersa sobre Qwen3-0.6B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Artefacto de investigación: presupuesto de entrenamiento de 4,9 millones de tokens frente a los aproximadamente 4.000 millones del paper, lo que limita la fidelidad de la destilación.
- Evaluación muy reducida: solo RULER-13 a 4K/8K y un subconjunto pequeño de MMLU-Pro, sin valores publicados en la información disponible.
- Sin kernels ni afirmaciones de latencia: no se puede esperar una aceleración real sin implementar kernels específicos para ZHA.
- No son los pesos oficiales de Zyphra; cualquier comparación con resultados del paper debe tener en cuenta la reimplementación independiente.
- Riesgo de alucinación heredado del modelo base Qwen3-0.6B, agravado por la posible degradación de la atención destilada.
- Idiomas soportados no documentados; se asumen los del modelo base, sin garantía.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de kernels y de evaluación extensa desaconseja su uso en producción sin validación previa.
- La integración requiere cargar `reference_queries[i]` según `layer_ids[i]` de `config.json` y respetar el espacio post-`q_norm` y pre-RoPE; un uso incorrecto produce resultados inválidos.

## Enlaces

- HuggingFace: https://huggingface.co/kvnloo/zha-routers-qwen-small
- Paper ZHA: https://arxiv.org/abs/2610.42112v1
- Estudio de reproducción z0evals: https://github.com/kvnloo/z0evals/tree/main/studies/zha-reproduction-v0
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
