# aplominski/TinyTransformer-Pre-LayerNorm-5M-TinyStories

## Resumen

El modelo TinyTransformer-Pre-LayerNorm-5M-TinyStories es un transformer decoder-only de aproximadamente 5,47 millones de parámetros, desarrollado por aplominski como parte de una serie de investigación sobre estrategias de normalización en arquitecturas transformer de pequeña escala. Entrenado exclusivamente sobre el dataset TinyStories (historias cortas en inglés generadas sintéticamente), este modelo aplica Layer Normalization antes de cada subcapa del transformer (pre-normalización), en contraste con la normalización posterior o la ausencia de normalización.

La relevancia de este modelo reside en su propósito experimental: permite aislar el efecto de la colocación de la normalización en el rendimiento y la estabilidad del entrenamiento de modelos pequeños. Al ser extremadamente ligero, es adecuado para entornos educativos, prototipado rápido y estudios comparativos de arquitecturas. Su licencia OpenMDW-1.1 permite uso comercial con atribución, aunque su capacidad generativa es limitada por diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Pre-LayerNorm |
| Parametros totales | 5.467.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar, con la particularidad de que la normalización de capa (LayerNorm) se aplica antes de cada subcapa (atención y feed-forward), en lugar de después. Esta configuración, conocida como pre-normalización, se ha popularizado en modelos modernos por su estabilidad durante el entrenamiento. El modelo no incorpora mecanismos de atención lineal, decodificación especulativa ni otras innovaciones; su interés radica en el estudio controlado de la normalización.

El entrenamiento se realizó sobre el dataset TinyStories, compuesto por millones de historias cortas en inglés generadas por modelos de lenguaje grandes, diseñado específicamente para evaluar la capacidad de modelos pequeños para producir texto coherente. No se especifican el número de tokens, la configuración de hiperparámetros ni el uso de técnicas como RLHF o DPO en la información disponible. La tarea declarada es masked language modeling, aunque al ser un decoder-only, probablemente se trate de modelado de lenguaje autorregresivo.

## Capacidades

- Generacion de texto en ingles: capaz de producir historias cortas y coherentes dentro del dominio de TinyStories (vocabulario y estructuras simples).
- Razonamiento basico: limitado a patrones aprendidos de las historias, sin capacidades de razonamiento complejo.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agentes ni multi-step reasoning.
- Multilingue: no, solo ingles.
- Sin modo de pensamiento (thinking mode), vision ni audio.

## Casos de uso

- Investigacion academica sobre normalizacion: el modelo sirve como punto de comparacion en estudios que analizan el impacto de la colocacion de LayerNorm en transformers pequenos. Se puede entrenar y evaluar junto a los otros modelos de la serie (Baseline, Post-LayerNorm, Pre-RMSNorm, etc.) para medir diferencias en convergencia y calidad del texto generado.
- Educacion en arquitecturas transformer: al ser un modelo de 5M de parametros, es ideal para que estudiantes implementen y depuren pipelines de entrenamiento, visualicen atencion o estudien el efecto de la normalizacion en entornos con recursos limitados.
- Prototipado de generacion de texto simple: puede usarse como base para generar historias infantiles o contenido narrativo breve en ingles, aunque su calidad es inferior a modelos comerciales.
- Pruebas de infraestructura: sirve para validar despliegues en CPU o GPU de baja gama, probar frameworks de inferencia (llama.cpp, vLLM) o medir latencias en entornos de edge.
- Generacion de datos sinteticos para entrenamiento: las historias generadas pueden emplearse como aumentacion de datos en tareas de comprension lectora o clasificacion de texto en ingles.
- Benchmark de eficiencia: al ser extremadamente pequeno, permite comparar el rendimiento de diferentes backends de inferencia (ONNX, TensorRT, etc.) sin coste computacional significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. La unica metrica mencionada en la model card es "accuracy", pero sin valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en FP32 (5,47M parametros * 4 bytes ≈ 22 MB). Cabe en cualquier GPU, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, o incluso CPU sola.
- Compatible con consumer GPU: si, todas (RTX 2060, GTX 1650, etc.).
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI, o directamente con PyTorch/HuggingFace Transformers.
- Latencia y throughput: no se han publicado mediciones, pero al ser un modelo de 5M, la generacion es practicamente instantanea en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Normalizacion | Contexto | Licencia |
|---|---|---|---|---|
| TinyTransformer-Baseline-5M | 5M | Sin normalizacion | no disponible | OpenMDW-1.1 |
| TinyTransformer-Pre-LayerNorm-5M | 5,47M | Pre-LayerNorm | no disponible | OpenMDW-1.1 |
| TinyTransformer-Post-LayerNorm-5M | 5M | Post-LayerNorm | no disponible | OpenMDW-1.1 |
| TinyTransformer-Pre-RMSNorm-5M | 5M | Pre-RMSNorm | no disponible | OpenMDW-1.1 |
| TinyTransformer-Post-RMSNorm-5M | 5M | Post-RMSNorm | no disponible | OpenMDW-1.1 |
| TinyTransformer-Baseline-10M | 10M | Sin normalizacion | no disponible | OpenMDW-1.1 |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a la arquitectura y el tamano.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente con TinyStories, el modelo refleja los sesgos del dataset, que contiene historias generadas por IA con un vocabulario y tematica limitados (mundo infantil, lenguaje simplificado).
- Riesgo de alucinacion: alto en contextos fuera del dominio de TinyStories; el modelo puede generar texto incoherente o factualmente incorrecto si se le pide algo que no ha visto.
- Limitaciones de contexto: la longitud de contexto no se especifica, pero por el tamano del modelo es probable que sea muy corta (tipicamente 128-512 tokens en modelos de esta escala).
- Restricciones de licencia: OpenMDW-1.1 permite uso comercial, pero requiere atribucion y puede imponer condiciones sobre modificaciones y redistribucion. Se recomienda revisar el texto completo de la licencia.
- Caveat para produccion: no es adecuado para tareas reales de generacion de texto de calidad; su uso es exclusivamente investigador o educativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aplominski/TinyTransformer-Pre-LayerNorm-5M-TinyStories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories: https://arxiv.org/abs/2305.07759
- Paper Attention Is All You Need: https://arxiv.org/abs/1706.03762
- Paper Layer Normalization: https://arxiv.org/abs/1607.06450
- Paper RMSNorm: https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
