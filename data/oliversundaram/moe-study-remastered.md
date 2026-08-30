# OliverSundaram/MoE-Study-Remastered

## Resumen

MoE-Study-Remastered es un modelo de lenguaje de tipo mixture-of-experts (MoE) disperso, desarrollado por OliverSundaram como una reconstrucción corregida de su anterior modelo MoE-Study. Con 201 millones de parámetros totales y solo 69 millones activos por token (una escasez de 2,9 veces), está diseñado para demostrar que es posible entrenar un MoE funcional desde cero con recursos de hardware modestos: se entrenó en 21 horas en una única RTX 4060 con 8 GB de VRAM, sobre 645 millones de tokens del dataset Ultra-FineWeb-L1. El modelo es un transformer decoder-only que incorpora codificación posicional RoPE, FFN con activación SwiGLU, normalización RMSNorm y atención multi-query, junto con un tokenizador BPE personalizado de 32 768 tokens. Tiene una longitud de contexto de 1024 tokens y está licenciado bajo MIT, lo que permite uso comercial y modificación libre.

La relevancia de este modelo radica en su doble propósito: por un lado, sirve como banco de pruebas para estudiar el comportamiento de arquitecturas MoE a pequeña escala; por otro, documenta explícitamente las correcciones técnicas aplicadas sobre su predecesor (promediado y escalado de la pérdida auxiliar de balanceo de carga, sustitución de embeddings posicionales aprendidos por RoPE, etc.). Aunque no es un modelo competitivo frente a los grandes LLM actuales, sí ofrece una referencia útil para investigadores y desarrolladores interesados en entrenar o ajustar MoE compactos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (8 expertos, top-k 2), RoPE, SwiGLU, RMSNorm, Multi-Query Attention |
| Parametros totales | 201 398 784 (según safetensors; el README indica 201 267 712) |
| Parametros activos | 69 147 136 por token |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (no se menciona en la documentación) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura decoder-only con capas MoE dispersas: cada capa contiene 8 expertos y selecciona los 2 mejores por token mediante una función de routing. La atención es multi-query (MQA) para reducir el costo de memoria y cómputo. La codificación posicional emplea RoPE (Rotary Positional Embeddings) en lugar de embeddings aprendidos, lo que permite extrapolar más allá de la longitud de entrenamiento sin necesidad de retreinar las tablas posicionales. La normalización usa RMSNorm, y la FFN de cada experto está implementada con SwiGLU, una unidad lineal con compuerta que mejora la expresividad frente a activaciones clásicas como GELU.

El entrenamiento se realizó desde cero con 645 millones de tokens del dataset Ultra-FineWeb-L1, en 21 horas en una RTX 4060 con 8 GB de VRAM. Se utilizó una pérdida auxiliar de balanceo de carga promediada sobre todas las capas MoE y escalada por un hiperparámetro pequeño, corrigiendo los errores del modelo original donde esta pérdida dominaba la pérdida de entropía cruzada. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales. El tokenizador es un BPE personalizado con vocabulario de 32 768 tokens, más compacto que el de GPT-2 (50 257), lo que reduce el tamaño de la matriz de embeddings y el costo del softmax final.

## Capacidades

- Generación de texto autocompletiva en inglés, con capacidad de continuar secuencias de hasta 1024 tokens.
- Razonamiento básico y comprensión de lenguaje a nivel de un modelo pequeño entrenado con pocos datos.
- Soporte de código limitado: al estar entrenado con texto web general, puede producir fragmentos de código simples, pero sin garantías de calidad.
- No dispone de soporte para tool calling, function calling, agentes ni razonamiento multi-paso estructurado.
- No es multilingüe: solo inglés.
- No incluye capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación educativa en arquitecturas MoE: el modelo sirve como ejemplo de referencia para estudiar el efecto del balanceo de carga, la selección de top-k o el impacto de RoPE en modelos pequeños.
- Prototipado rápido de aplicaciones de generación de texto: gracias a su tamaño reducido y licencia MIT, se puede integrar en demos o pruebas de concepto sin requerir infraestructura costosa.
- Fine-tuning ligero para tareas específicas en inglés: por ejemplo, clasificación de texto, generación de respuestas cortas o resúmenes de documentos breves, siempre que el contexto no supere 1024 tokens.
- Benchmarking de eficiencia en hardware de consumo: permite comparar el rendimiento de inferencia entre diferentes frameworks (llama.cpp, vLLM, etc.) en GPUs de gama baja o CPU.
- Estudio de técnicas de cuantización y compresión: al ser un modelo pequeño y abierto, es adecuado para experimentar con cuantización GPTQ, AWQ o GGUF sin coste de cómputo elevado.
- Desarrollo de pipelines de evaluación para MoE: puede usarse como modelo de prueba en suites de evaluación como lm-evaluation-harness para validar la configuración antes de aplicarla a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La documentación indica que el modelo fue evaluado con lm-evaluation-harness v0.4.12 en tareas como hellaswag (5-shot) y arc_challenge (15-shot), comparándolo con pythia-160m bajo un presupuesto de tokens igualado, pero no se proporcionan las puntuaciones concretas. Por tanto, no es posible presentar una tabla comparativa con datos verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 201 M parámetros, en FP32 ocupa aproximadamente 805 MB; en FP16 o BF16 unos 402 MB; con cuantización de 8 bits o 4 bits (si se aplica) cabría en menos de 200 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se ha entrenado en una RTX 4060 de 8 GB, por lo que la inferencia es viable en GPUs integradas o incluso en CPU.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier GPU moderna, incluidas las de gama de entrada como GTX 1650 o RTX 3050.
- Opciones de despliegue: compatible con transformers de Hugging Face, vLLM, llama.cpp (si se convierte a GGUF), Ollama y TGI, aunque no se han publicado configuraciones específicas.
- Latencia y throughput: no se proporcionan datos medidos; dado su tamaño, se espera una latencia de decodificación de pocos milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoE-Study-Remastered | 201 M (69 M activos) | 1024 | MoE, 8 expertos top-2 | MIT | Hugging Face |
| Pythia-160m | 160 M (dense) | 2048 | Transformer dense | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1 B (dense) | 2048 | Transformer dense | Apache 2.0 | Hugging Face |

La comparación directa con Pythia-160m es la más pertinente, ya que el autor evaluó el modelo contra esa referencia, pero no se han publicado los resultados numéricos. TinyLlama es un modelo más grande y con más contexto, pero no es un MoE. No se dispone de datos objetivos de rendimiento para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Contexto limitado a 1024 tokens, lo que impide manejar conversaciones largas o documentos extensos sin truncamiento.
- Entrenado exclusivamente con texto en inglés, por lo que su rendimiento en otros idiomas es nulo o muy deficiente.
- El volumen de datos de entrenamiento (645 M tokens) es muy reducido para un modelo de 200 M de parámetros, lo que probablemente cause un alto grado de alucinación y falta de conocimiento factual.
- No se ha realizado ningún proceso de alineación (RLHF, DPO), por lo que puede generar contenido sesgado, ofensivo o inexacto.
- La discrepancia entre el número de parámetros reportado en el README (201 267 712) y el real según los safetensors (201 398 784) sugiere una posible inconsistencia en la documentación; se recomienda verificar antes de usar en producción.
- Al ser un modelo de investigación, no está pensado para uso en entornos productivos sin una evaluación exhaustiva previa.
- No se han publicado resultados de benchmarks, por lo que su rendimiento real en tareas estándar es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliverSundaram/MoE-Study-Remastered
- Repositorio GitHub del modelo: https://github.com/OliverSundaram/MoE-Study-Remastered
- Modelo predecesor en Hugging Face: https://huggingface.co/OliverSundaram/MoE-Study
- Repositorio GitHub del predecesor: https://github.com/OliverSundaram/MoE-Study
- Dataset de entrenamiento: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L1
- Papers de referencia (según tags): arxiv:2505.05427, arxiv:2104.09864, arxiv:2002.05202, arxiv:1910.07467, arxiv:1701.06538, arxiv:2101.03961, arxiv:2304.01373
