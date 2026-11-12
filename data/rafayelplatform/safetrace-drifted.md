# rafayelplatform/safetrace-drifted

## Resumen

safetrace-drifted es un modelo publicado en Hugging Face por el usuario rafayelplatform bajo el identificador `rafayelplatform/safetrace-drifted`. La etiqueta `cohere2` en sus metadatos indica que la arquitectura declarada se corresponde con la familia Cohere 2 (Command R), aunque no se ha publicado documentación oficial que lo confirme. El repositorio contiene pesos en formato safetensors con un total de 3.349.227.520 parámetros (aproximadamente 3,35 mil millones), lo que lo sitúa en la gama de modelos pequeños/medianos aptos para inferencia en hardware de consumo.

El modelo no dispone de pipeline declarado, licencia especificada, idiomas documentados ni tarjeta de modelo con información técnica. Tampoco se han publicado resultados de benchmarks, detalles de entrenamiento o instrucciones de uso. La información disponible se limita a los metadatos del repositorio y al recuento de parámetros extraído de los pesos.

Por su tamaño y formato, el modelo es potencialmente desplegable con herramientas estándar de inferencia (transformers, vLLM, llama.cpp tras conversión), pero cualquier evaluación de calidad, seguridad o idoneidad para producción queda bloqueada por la ausencia de documentación. Se recomienda tratarlo como un artefacto experimental sin garantías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | cohere2 (según tag de Hugging Face; no confirmado por documentación) |
| Parametros totales | 3.349.227.520 (~3,35 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF oficial) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 40,2 GB |
| Pipeline declarado | no disponible |
| Descargas | 90 |
| Likes | 0 |
| Fecha de creacion | 2026-11-09 |
| Ultima actualizacion | 2026-11-12 |

## Arquitectura y entrenamiento

El único indicio arquitectónico es el tag `cohere2`, que en Hugging Face se asocia a la arquitectura de los modelos Command R de Cohere (transformer decoder-only con atención por grupos y RoPE). No obstante, no se ha publicado ninguna confirmación de que el modelo siga esa arquitectura en la práctica, ni detalles sobre número de capas, dimensión oculta, cabezas de atención o vocabulario.

No hay información sobre el corpus de entrenamiento (número de tokens, composición, filtrado), sobre si se aplicaron técnicas de alineación como RLHF, DPO o SFT, ni sobre innovaciones técnicas (atención lineal, decodificación especulativa, modo thinking). El nombre "safetrace-drifted" sugiere un posible fine-tuning o variante derivada, pero no se aporta ninguna explicación al respecto.

## Capacidades

- Generación de texto autoregresiva: asumible por la arquitectura declarada, pero no verificada empíricamente.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Prototipado experimental de pipelines de inferencia: el modelo puede cargarse con `transformers` para validar la integración de la arquitectura cohere2 en un entorno de desarrollo, dado su tamaño manejable de 3,35 B de parámetros.
- Evaluación comparativa de arquitecturas: útil como punto de referencia en estudios internos que comparen variantes de la familia Cohere 2 frente a otros modelos de tamaño similar, siempre que se asuma la falta de documentación.
- Fine-tuning supervisado sobre dominio específico: por su tamaño, es viable ajustarlo con LoRA o QLoRA en una única GPU de 24-48 GB para tareas verticales, aunque la ausencia de licencia debe resolverse antes de cualquier uso comercial.
- Despliegue en entornos con recursos limitados: 3,35 B de parámetros permite inferencia en GPU de consumo (RTX 3090/4090) tras cuantización, adecuado para demos o entornos de laboratorio.
- Investigación sobre seguridad y sesgos: el modelo puede servir como sujeto de estudio para analizar el comportamiento de checkpoints sin tarjeta de modelo ni documentación de alineación.
- Pruebas de reproducibilidad de artefactos: útil para auditar cómo se comportan modelos publicados sin información de entrenamiento, en el marco de estudios sobre transparencia en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~6,7 GB solo para pesos, más overhead de activaciones y KV cache (estimación orientativa de 8-12 GB según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: ~3,4 GB para pesos, más overhead (estimación de 5-8 GB).
- VRAM estimada en cuantización de 4 bits: ~1,7 GB para pesos, más overhead (estimación de 3-5 GB).
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4, A100 40/80 GB para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB en FP16 con contexto corto, y en RTX 3090/4090 con margen amplio; en 4 bits cabría incluso en GPUs de 8 GB.
- Opciones de despliegue: `transformers` (con `trust_remote_code` si la arquitectura lo requiere), vLLM (previa verificación de soporte de cohere2), TGI (sujeto a compatibilidad), llama.cpp/Ollama solo tras conversión manual a GGUF, ya que no se distribuyen pesos cuantizados oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rafayelplatform/safetrace-drifted | ~3,35 B | no disponible | no disponible | Hugging Face (repo safetensors) |
| Cohere Command R (referencia de arquitectura) | 35 B | 128k | CC-BY-NC 4.0 | Hugging Face |
| Qwen2.5-3B | 3,09 B | 32k | Apache 2.0 | Hugging Face |
| Llama 3.2 3B | 3,21 B | 128k | Llama 3.2 Community License | Hugging Face |

La comparación es puramente estructural: no hay datos de rendimiento del modelo evaluado que permitan contrastarlo con las alternativas. Los modelos Cohere Command R, Qwen2.5-3B y Llama 3.2 3B cuentan con documentación técnica, benchmarks publicados y licencias definidas, mientras que safetrace-drifted carece de todo ello.

## Limitaciones y advertencias

- Ausencia total de tarjeta de modelo: no hay información sobre entrenamiento, datos, alineación ni evaluación.
- Licencia no especificada: no puede asumirse uso comercial; en ausencia de licencia explícita, los derechos de uso quedan indeterminados.
- Idiomas no declarados: no se puede garantizar calidad multilingüe ni siquiera en inglés.
- Riesgo elevado de alucinación y comportamientos no alineados: sin documentación de RLHF/DPO, no hay garantías de seguridad.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Nombre "drifted" sugiere posible degradación o desviación respecto al modelo base, sin aclaración por parte del autor.
- Solo 90 descargas y 0 likes: sin validación comunitaria ni reportes de uso.
- No hay pesos GGUF ni cuantizaciones oficiales: el despliegue en CPU o GPUs pequeñas requiere conversión manual y validación.
- El tag `cohere2` no garantiza compatibilidad real con la implementación oficial de Cohere; verificar `config.json` antes de asumir soporte en vLLM o TGI.
- Fecha de creación en 2026: comprobar que el repositorio sigue activo y que los pesos no han sido retirados.

## Enlaces

- Hugging Face: https://huggingface.co/rafayelplatform/safetrace-drifted
- Repositorio de Cohere Command R (referencia de arquitectura): https://huggingface.co/CohereForAI/c4ai-command-r-v01
- Documentación de transformers sobre arquitecturas Cohere: https://huggingface.co/docs/transformers/model_doc/cohere
- No se han encontrado papers, blogs, repositorios de código ni demos asociados al modelo en la información disponible.
