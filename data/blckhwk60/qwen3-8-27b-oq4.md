# BLCKHWK60/Qwen3.8-27B-oQ4

## Resumen

El modelo `BLCKHWK60/Qwen3.8-27B-oQ4` es una cuantización mixta de precisión de un modelo de la familia Qwen (etiquetado como `qwen3_5`), realizada con la herramienta oQ (oMLX v0.6.0.dev1). El resultado son pesos en formato MLX safetensors con cuantización de 4 bits y grupo de tamaño 64, optimizados para ejecución en hardware Apple Silicon mediante la librería MLX. A pesar del nombre, los metadatos de safetensors indican 4.813.519.600 parámetros (aproximadamente 4.8B), lo que sugiere una discrepancia con la cifra "27B" del nombre; no hay información adicional que aclare esta inconsistencia. El repositorio tiene un tamaño de 16.7 GB y no se proporcionan licencia, idiomas ni descripción funcional. Su relevancia radica en ofrecer una versión cuantizada de un modelo Qwen para despliegue eficiente en entornos con memoria unificada de Apple, aunque la falta de documentación limita su evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, tipo `qwen3_5`, sin más detalles) |
| Parametros totales | 4.813.519.600 (según safetensors; el nombre sugiere 27B, discrepancia no aclarada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, cuantización mixta de precisión (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de la etiqueta `qwen3_5`, que sugiere una variante de la serie Qwen3. La cuantización se realizó con oQ (oMLX v0.6.0.dev1), una herramienta que aplica cuantización de precisión mixta, es decir, asigna diferentes niveles de bits a distintas capas o bloques según su sensibilidad. Los detalles del entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no están disponibles en la información proporcionada.

## Capacidades

- No se han documentado capacidades específicas en la model card.
- Al tratarse de una cuantización de un modelo Qwen, es probable que conserve las capacidades típicas de la serie (generación de texto, razonamiento, código, matemáticas), pero esto es una inferencia no confirmada.
- No hay información sobre soporte de tool calling, agentes, capacidades multilingües o modos especiales como thinking mode o visión.

## Casos de uso

Dado que no se especifican capacidades concretas, los casos de uso son hipotéticos y deben validarse con pruebas propias:

- Inferencia local en Apple Silicon: el formato MLX permite ejecutar el modelo en Mac con chip M-series, aprovechando la memoria unificada para tareas de generación de texto.
- Prototipado rápido en entornos de desarrollo: al ser una cuantización de 4 bits, podría usarse para experimentar con Qwen en equipos sin GPU dedicada.
- Despliegue en aplicaciones de escritorio que requieran generación de texto sin conexión, siempre que se verifique la calidad de salida.
- Investigación de técnicas de cuantización: el repositorio puede servir como ejemplo de aplicación de oQ a un modelo Qwen, aunque no se aportan métricas de degradación.
- Integración en pipelines de MLX (por ejemplo, con `mlx-lm`), para tareas de autocompletado o asistencia de código, si el modelo base lo soporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se pueden proporcionar cifras de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser formato MLX, está orientado a Apple Silicon (M1/M2/M3/M4). No se indica compatibilidad con CUDA.
- Estimación de memoria: con 4.8B parámetros y cuantización de 4 bits, los pesos ocupan aproximadamente 2.4 GB (4.8B × 0.5 bytes/parámetro). Añadiendo overhead de activaciones y KV cache, se recomienda al menos 8 GB de memoria unificada para contextos moderados.
- No se especifican GPUs concretas; en Apple Silicon, cualquier chip con 8 GB o más de RAM unificada podría ejecutarlo, aunque con limitaciones de velocidad.
- Opciones de despliegue: la librería MLX permite usar el modelo con `mlx-lm` o `mlx_lm.generate`. No hay soporte directo para vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos cuantizados de la misma familia (por ejemplo, otras cuantizaciones de Qwen en MLX). No se puede establecer una comparativa fiable sin datos de rendimiento y características del modelo base.

## Limitaciones y advertencias

- La discrepancia entre el nombre (27B) y los parámetros reales (4.8B) es preocupante; podría indicar un error de etiquetado o un modelo base distinto al esperado.
- No se proporciona licencia, lo que impide conocer las restricciones de uso comercial.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- La ausencia de benchmarks y documentación técnica dificulta evaluar la calidad de la cuantización y la fidelidad respecto al modelo original.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Al ser una cuantización de 4 bits con group size 64, puede presentar degradación en tareas de razonamiento complejo o generación de código, aunque no hay datos que lo confirmen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BLCKHWK60/Qwen3.8-27B-oQ4
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
