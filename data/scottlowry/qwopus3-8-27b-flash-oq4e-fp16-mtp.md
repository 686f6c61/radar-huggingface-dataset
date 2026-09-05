# scottlowry/Qwopus3.8-27B-Flash-oQ4e-fp16-mtp

## Resumen

Qwopus3.8-27B-Flash-oQ4e-fp16-mtp es una cuantización 4-bit del modelo Qwopus3.8-27B-Flash, creada por scottlowry mediante la herramienta oQ (oMLX v0.6.4). El modelo base, desarrollado por Jackrong, se etiqueta con la arquitectura qwen3_5 y tiene 27.781.427.952 parámetros. Esta versión cuantizada utiliza un esquema de cuantización mixta de precisión con group size 64 y se distribuye en formato MLX safetensors, lo que la hace adecuada para su ejecución en dispositivos Apple Silicon mediante la librería MLX. El repositorio ocupa 17.9 GB. No se dispone de información sobre el contexto, los idiomas, la licencia o las capacidades específicas del modelo, por lo que su evaluación requiere consultar la documentación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (oQe, mixed-precision, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La cuantización se realizó con oQ (oMLX v0.6.4), una herramienta de cuantización de precisión mixta. El modelo resultante usa 4 bits con group size 64, lo que reduce el peso total a 17.9 GB. El modelo base, Jackrong/Qwopus3.8-27B-Flash, se identifica con la arquitectura qwen3_5, pero no se han publicado detalles sobre su construcción, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación como RLHF o DPO. El sufijo "MTP" en el nombre podría referirse a multi-token prediction, pero no está confirmado en la información disponible.

## Capacidades

- No se dispone de información documentada sobre las capacidades específicas del modelo cuantizado.
- El modelo hereda las capacidades del modelo base Qwopus3.8-27B-Flash, pero no hay documentación accesible que las detalle.
- No se puede confirmar soporte de tool calling, function calling, agentes, razonamiento multi-step, visión o audio.
- Las capacidades multilingües no están documentadas.
- El nombre sugiere posible soporte de multi-token prediction (MTP), pero no está confirmado.

## Casos de uso

Los siguientes casos de uso son potenciales, basados en las características generales de un LLM de 27B cuantizado. No han sido confirmados por el autor.

- Ejecución local en Apple Silicon: al estar cuantizado en formato MLX, el modelo puede cargarse en Macs con memoria unificada de al menos 18 GB, lo que permite experimentar con un LLM de 27B sin necesidad de servidores dedicados.
- Investigación en cuantización: sirve como ejemplo de cuantización mixta de precisión con oQ, útil para estudiar el efecto de group size 64 en modelos de 27B.
- Prototipado de aplicaciones de texto: como LLM de gran tamaño, podría emplearse en tareas de generación de texto, resumen o clasificación, siempre que se valide su rendimiento previamente.
- Despliegue en entornos con restricciones de memoria: la cuantización reduce el peso del modelo a 17.9 GB, lo que permite ejecutarlo en hardware con memoria limitada.
- Evaluación de modelos cuantizados: puede utilizarse para comparar el rendimiento de la cuantización oQe frente a otros métodos de compresión.
- Aprendizaje y experimentación con MLX: el formato safetensors y la librería MLX permiten cargar el modelo en aplicaciones Python para pruebas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es 17.9 GB, por lo que se necesitará al menos esa cantidad de memoria para cargar los pesos.
- GPU recomendadas: no disponible. Al ser un modelo MLX, está orientado a Apple Silicon (M1 o posterior).
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: MLX y oMLX. No se mencionan vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables ni resultados de rendimiento del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia: no disponible. Al no especificarse licencia, el uso comercial es incierto y requiere contacto con el autor.
- El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad.
- Al ser una cuantización no oficial, la calidad y fidelidad respecto al modelo base no están garantizadas.
- La fecha de creación es futura (2026-09-05), lo que puede indicar un error en los metadatos o que el modelo es muy reciente.

## Enlaces

- HuggingFace: https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-oQ4e-fp16-mtp
- Colección de scottlowry: https://huggingface.co/collections/scottlowry/qwen38-27b-oqe-mtp
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
