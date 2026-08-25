# ncylich/temporal-moe-extras

## Resumen

`ncylich/temporal-moe-extras` es un repositorio de artefactos de soporte para los experimentos del proyecto Temporal-MoE, desarrollado por ncylich como una bifurcación personal de FLAME-MoE (arXiv:2505.20225). No contiene checkpoints de entrenamiento en sí, sino capturas de ejecución, tablas de resultados, figuras y un modelo fusionado derivado de OLMoE-1B-7B-0924 con un router adaptado mediante un procedimiento de «bake» de cross-entropy. El objetivo del proyecto es reducir la memoria de servicio de los MoE haciendo que solo los expertos activos permanezcan residentes en memoria, en lugar de todo el pool de expertos.

El repositorio incluye 248 archivos con un peso total de 39.78 GiB (55.1 GB según la metadata de HuggingFace) y se complementa con otros tres repositorios: checkpoints de entrenamiento (Megatron), adaptaciones del router en safetensors y el corpus de entrenamiento tokenizado. La pieza central es `merged_ce_model/`, un modelo OLMoE con el router fusionado que es cargable directamente con la librería `transformers`. Es un recurso orientado a investigación y reproducibilidad, más que a despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con restricción de residencia temporal; base OLMoE-1B-7B-0924 |
| Parámetros totales | 7B (aprox., según OLMoE-1B-7B) |
| Parámetros activos | 1B (aprox., según OLMoE-1B-7B) |
| Longitud de contexto | no disponible (el modelo base OLMoE usa 4096 tokens) |
| Tipos de cuantización | no disponible (los artefactos son safetensors, no hay GGUF) |
| Idiomas soportados | no disponible (el modelo base OLMoE está entrenado principalmente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo fusionado) y archivos `.pt` (checkpoints Megatron, capturas) |

## Arquitectura y entrenamiento

Temporal-MoE introduce una restricción de residencia rodante durante el entrenamiento: por cada capa, solo los `k` expertos activos del token actual permanecen en memoria residente, y como máximo un experto se intercambia por token. Esto permite que el experto entrante se cargue «detrás» del cómputo de los expertos ya activos, de modo que la memoria de servicio escala con los parámetros activos en lugar de con los totales. El proyecto es una bifurcación de FLAME-MoE (arXiv:2505.20225) y utiliza OLMoE-1B-7B-0924 como backbone.

El repositorio contiene el resultado de un procedimiento de «bake» del router: se fusionan los pesos del backbone OLMoE con un router adaptado mediante cross-entropy (bake-CE). No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el número de tokens utilizados en la adaptación, pero el repositorio incluye el corpus tokenizado en `ncylich/temporal-moe-corpus` y logs de entrenamiento completos en cada directorio de ejecución.

## Capacidades

- Generación de texto autoregresiva: el modelo fusionado es un MoE de 1B activos que puede generar texto de forma estándar.
- Razonamiento y comprensión del lenguaje: hereda las capacidades del OLMoE-1B-7B, aunque no se han publicado evaluaciones específicas para esta variante.
- Código y matemáticas: el modelo base OLMoE tiene un rendimiento moderado en tareas de programación y razonamiento matemático, pero no hay datos concretos para esta fusión.
- Soporte de tool calling y function calling: no disponible (el modelo base no incluye este tipo de soporte nativo).
- Capacidades multilingües: no disponible (OLMoE está entrenado predominantemente en inglés).
- Capacidades especiales: no hay modos de pensamiento, visión ni audio. El interés principal es la investigación sobre eficiencia de memoria en MoE, no capacidades específicas de tarea.

## Casos de uso

- Investigación académica en eficiencia de MoE: el repositorio está diseñado para reproducir los experimentos del paper Temporal-MoE, incluyendo tablas de resultados y figuras que respaldan las afirmaciones sobre la reducción de memoria de servicio.
- Análisis mecanístico del router: los archivos `run_captures/*/router_log.pt` permiten trazar las decisiones del router token a token, lo que facilita estudios de interpretabilidad sobre la asignación de expertos.
- Evaluación de la fusión de routers: `merged_ce_model/` es un modelo cargable con `transformers` que permite probar la calidad de un router adaptado mediante cross-entropy sin necesidad de regenerar los pesos del backbone.
- Reproducibilidad de resultados: el repositorio incluye manifiestos SHA-256 y una columna `cited` que distingue las ejecuciones que respaldan números publicados de las de validación de infraestructura, lo que permite verificar la trazabilidad de cada dato.
- Desarrollo de técnicas de streaming de expertos: los archivos de calibración y las evaluaciones de bits-per-byte pueden servir para comparar estrategias de intercambio de expertos en entornos con memoria limitada.
- Formación en sistemas de inferencia distribuida: los logs de entrenamiento y las capturas de ejecución son útiles para estudiar el comportamiento de un MoE bajo restricciones de residencia en clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio contiene tablas de resultados en `ablations/*.csv` y figuras en `figures/`, pero los datos numéricos no han sido extraídos en la documentación accesible. No se pueden proporcionar cifras de MMLU, HumanEval o GSM8K sin inventar datos.

## Requisitos de hardware

- El modelo base OLMoE-1B-7B requiere aproximadamente 14 GB de VRAM en FP16 para inferencia (7B parámetros), y unos 4 GB en cuantización de 4 bits.
- El repositorio contiene artefactos de entrenamiento y evaluación, por lo que se recomienda una GPU con al menos 24 GB de VRAM para cargar el modelo fusionado en FP16 (por ejemplo, RTX 4090, A100 40GB, L40S).
- Para reproducir los experimentos de entrenamiento (checkpoints Megatron), se necesitaría un clúster con múltiples GPUs (por ejemplo, 8× A100 80GB) y la infraestructura de Megatron-LM.
- Opciones de despliegue: el modelo fusionado puede cargarse con `transformers` y servirse con vLLM o TGI si se convierte a los formatos adecuados; no se han incluido versiones GGUF para llama.cpp.
- La latencia y el throughput no están documentados para esta variante específica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMoE-1B-7B-0924 (base) | 1B activos / 7B totales | 4096 | Apache 2.0 | Modelo de referencia de Allen AI, sin restricción de residencia |
| Temporal-MoE (este repo) | 1B activos / 7B totales | no disponible | no disponible | Variante con restricción de residencia temporal |
| FLAME-MoE (upstream) | no disponible | no disponible | no disponible | Plataforma original sobre la que se bifurca este proyecto |

No hay disponibles comparativas de rendimiento numérico entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: el repositorio está orientado a investigación y reproducción de experimentos, no a despliegue en aplicaciones reales.
- Licencia no especificada: el autor no ha declarado la licencia, por lo que su uso comercial es incierto; se debe consultar al autor antes de utilizarlo en proyectos con fines lucrativos.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos ni de tasas de alucinación para esta variante; el modelo base OLMoE puede presentar sesgos típicos de los modelos entrenados en datos web en inglés.
- Contexto limitado: la ventana de contexto del modelo base es de 4096 tokens, lo que limita aplicaciones de memoria larga.
- Dependencia del backbone: la calidad del modelo fusionado depende del OLMoE-1B-7B-0924, que no es un modelo de última generación en comparación con los LLMs actuales.
- Los artefactos no son checkpoints de entrenamiento: los archivos en este repositorio son capturas y resultados; los checkpoints reales están en `ncylich/temporal-moe-ckpts`.
- Discrepancia de tamaño: el README indica 39.78 GiB mientras que la metadata de HuggingFace muestra 55.1 GB; esto puede deberse a diferencias en el cómputo del tamaño.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ncylich/temporal-moe-extras
- Código del proyecto: https://github.com/ncylich/temporal-moe
- Paper FLAME-MoE: https://arxiv.org/abs/2505.20225
- Modelo base OLMoE-1B-7B-0924: https://huggingface.co/allenai/OLMoE-1B-7B-0924
- Checkpoints de entrenamiento (repositorio complementario): https://huggingface.co/ncylich/temporal-moe-ckpts
- Router adaptado en safetensors (repositorio complementario): https://huggingface.co/ncylich/temporal-moe-router-adapt
- Corpus tokenizado (repositorio complementario): https://huggingface.co/datasets/ncylich/temporal-moe-corpus
