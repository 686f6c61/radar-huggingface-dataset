# brandonmusic/Qwen3-30B-A3B-ShapleyMCG-K34-Validation-Reconstruction

## Resumen

Este repositorio contiene el modelo de validación exacto en BF16 utilizado en el experimento de reconstrucción de matrices de expertos con el método ShapleyMCG sobre el modelo base Qwen3-30B-A3B-Base. No se trata de un modelo entrenado ni de un checkpoint cuantizado compacto, sino de un artefacto de investigación que instala las matrices de expertos reconstruidas (seleccionadas mediante asignación causal Aumann–Shapley/Fisher) en el checkpoint original de Transformers, con el fin de reproducir de forma independiente los logits de estudiante medidos en el experimento de KLD sobre WikiText.

El modelo tiene 30.532.122.624 parámetros totales (30,5B) y es una arquitectura MoE con 3B de parámetros activos, según la nomenclatura del modelo base. El repositorio ocupa 122,1 GB porque almacena las reconstrucciones en BF16, no en un formato compacto de 3,5 bits por elemento. La licencia es Apache 2.0 y el formato de pesos es safetensors. Fue creado en agosto de 2026 y no tiene descargas ni valoraciones.

La relevancia de este modelo es estrictamente científica: permite verificar los resultados reportados en el artículo arXiv 2607.12266 sobre cuantización aditiva y asignación causal de bits en modelos MoE. No está pensado para uso en producción ni para tareas de generación de texto generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3-30B-A3B-Base |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3B (según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (reconstrucciones de matrices de expertos; no es un checkpoint cuantizado compacto) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una reconstrucción del checkpoint Qwen3-30B-A3B-Base, un transformer MoE con 30,5B parámetros totales y 3B activos. La arquitectura subyacente es la misma que la del modelo base de Qwen3, con capas de atención y mezcla de expertos. Sin embargo, este repositorio no contiene pesos entrenados, sino matrices de expertos reconstruidas mediante el método ShapleyMCG, que asigna tasas de bits de forma causal (Aumann–Shapley/Fisher) a cada matriz de experto, manteniendo una tasa lógica promedio de 3,5 bits por elemento. Las reconstrucciones se almacenan en BF16, por lo que el tamaño del repositorio es similar al del modelo base.

No se realizó ningún entrenamiento adicional (ni RLHF, ni DPO, ni fine-tuning). El experimento se centra en la asignación de matrices de expertos (9.216 matrices K3 y 9.216 matrices K4) y en la medición de la divergencia KLD frente a un teacher BF16 sellado. La innovación técnica principal es la aplicación de la asignación causal de Shapley para reducir la pérdida de información en la cuantización, en lugar de la asignación heurística basada en Hessian o router.

## Capacidades

- Reproducción independiente de los logits de estudiante del experimento KLD sobre WikiText-2-raw-v1.
- Verificación de la asignación causal de matrices de expertos (Aumann–Shapley/Fisher) frente a la asignación histórica (Hessian/router).
- Cálculo de métricas de divergencia (KLD media, mediana, P95, máxima) y acuerdo top-1.
- No está diseñado para generación de texto, razonamiento, código, tool calling, agentes ni capacidades multilingües.
- No soporta modos de pensamiento, visión ni audio.

## Casos de uso

- Reproducción de experimentos de cuantización: investigadores pueden cargar este checkpoint y comparar los logits generados con los del teacher BF16 sellado para verificar los resultados reportados.
- Análisis de asignación de bits en MoE: permite estudiar cómo la asignación causal de Shapley afecta a la divergencia KLD y al acuerdo top-1 en comparación con métodos heurísticos.
- Desarrollo de metodologías de cuantización: sirve como referencia para validar nuevas técnicas de reconstrucción de matrices de expertos.
- Auditoría de resultados científicos: los sellos criptográficos y los artefactos de reproducibilidad permiten verificar la integridad de los datos del experimento.
- Investigación en teoría de la información aplicada a LLMs: el modelo proporciona un caso concreto de asignación de tasas de bits basada en valores de Shapley.
- Benchmarking de implementaciones de atención: el experimento usa SDPA de Transformers, por lo que puede compararse con implementaciones nativas como ExLlamaV3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos resultados reportados son métricas de KLD y acuerdo top-1 sobre WikiText-2-raw-v1:

| Metrica | Valor |
|---|---|
| Mean KLD (ventana de 2.047 posiciones) | 0,0550610707425 |
| Median KLD | 0,0129405570572 |
| P95 KLD | 0,246331153046 |
| Maximum KLD | 3,09338690461 |
| Top-1 agreement (causal) | 0,912066438691 |
| Top-1 agreement (histórico) | 0,90131900342 |

En la réplica de 20.480 posiciones, la asignación causal obtiene una KLD media de 0,0452937027269 y un acuerdo top-1 de 0,910888671875, frente a 0,049088886473 y 0,908203125 de la asignación histórica.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 122,1 GB en BF16, por lo que se necesitan al menos 4 GPUs de 40 GB (por ejemplo, A100 40GB) o 2 GPUs de 80 GB (A100 80GB, H100) para cargar el modelo completo en memoria.
- GPU recomendadas: A100 80GB, H100 80GB o varias RTX 4090 (24GB) en configuración multi-GPU.
- No cabe en una GPU de consumo estándar (16-24 GB) sin cuantización adicional, pero el modelo no está pensado para inferencia ligera.
- Opciones de despliegue: se puede cargar con `transformers` usando `device_map="auto"` para distribución automática entre GPUs. No se recomienda vLLM, llama.cpp u Ollama porque el checkpoint no está optimizado para runtime.
- Latencia y throughput: no disponibles, ya que el propósito es la reproducción de experimentos, no la inferencia de producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Base (modelo base) | 30,5B totales, 3B activos | 32K (según documentación de Qwen3) | Apache 2.0 | safetensors | Modelo base para fine-tuning |
| Este repositorio (ShapleyMCG) | 30,5B totales, 3B activos | no disponible | Apache 2.0 | safetensors (BF16) | Artefacto de investigación para reproducibilidad |
| Otros checkpoints cuantizados de Qwen3-30B-A3B (p.ej. GGUF) | 30,5B totales, 3B activos | 32K | Apache 2.0 | GGUF | Inferencia en consumer hardware |

La comparativa se limita al modelo base y a versiones cuantizadas estándar. Este repositorio no es comparable en rendimiento porque no está diseñado para uso práctico, sino para validación científica.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un artefacto de investigación para reproducir un experimento concreto.
- No está runtime-qualified: la model card indica explícitamente que no es un checkpoint compacto de 3,5 bits y que no está preparado para ejecución en tiempo real.
- No se han evaluado sesgos, alucinaciones ni comportamientos de generación, ya que no es un modelo de generación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no tiene utilidad práctica fuera del ámbito de investigación.
- El contexto y los idiomas no están especificados en el repositorio; se heredan del modelo base, pero no se garantiza su funcionamiento.
- Los resultados de KLD dependen de la implementación de atención SDPA de Transformers; no son directamente comparables con implementaciones nativas como ExLlamaV3.
- El tamaño del repositorio (122 GB) puede dificultar su descarga y almacenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brandonmusic/Qwen3-30B-A3B-ShapleyMCG-K34-Validation-Reconstruction
- Dataset de reproducibilidad: https://huggingface.co/datasets/brandonmusic/shapleymcg-qwen3-30b-a3b-reproducibility
- Código y metodología (GitHub): https://github.com/brandonmmusic-max/shapleymcg
- Ejemplo de configuración TOML: https://github.com/brandonmmusic-max/shapleymcg/blob/main/examples/qwen3-30b-a3b.toml
- Paper de referencia (arXiv): https://arxiv.org/abs/2607.12266
- Modelo base Qwen3-30B-A3B-Base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Colección Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
