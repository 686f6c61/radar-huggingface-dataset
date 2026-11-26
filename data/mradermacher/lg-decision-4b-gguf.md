# mradermacher/lg-decision-4B-GGUF

## Resumen

lg-decision-4B es un modelo de lenguaje de aproximadamente 4.841 millones de parámetros (4,84B) desarrollado originalmente por el usuario dream-only y distribuido en formato GGUF por mradermacher. Está etiquetado como un modelo de decisión ("decision-model") con soporte para decisiones tipadas ("typed-decisions") y un índice de decisiones ("decision-index"), lo que sugiere un enfoque orientado a tareas de clasificación estructurada o toma de decisiones dentro de un pipeline, más que a generación de texto libre genérica. La ficha que nos ocupa corresponde a la cuantización del modelo base dream-only/lg-decision-4B.

El repositorio original está construido sobre la librería transformers y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas. El idioma declarado en la model card es únicamente inglés ("en"), aunque no se detalla la composición del corpus de entrenamiento ni el número de tokens utilizados.

La relevancia de esta ficha radica en que mradermacher ofrece la práctica totalidad de la matriz de cuantizaciones GGUF (desde Q2_K de 2,3 GB hasta f16 de 9,8 GB), lo que permite desplegar el modelo en hardware de consumo. No obstante, la información pública disponible sobre arquitectura interna, contexto y rendimiento es muy limitada, por lo que muchos campos de esta ficha se marcan explícitamente como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (deducida de la librería transformers; detalles internos no disponibles) |
| Parámetros totales | 4.841.450.496 (4,84B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (inglés) según model card; resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base emplea safetensors vía transformers |
| Tamaño del repo | 44,6 GB |
| Modelo base | dream-only/lg-decision-4B |
| Cuantizador | mradermacher |
| Descargas | 921 |
| Fecha de creación | 2026-11-19 |
| Última actualización | 2026-11-25 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo se carga mediante la librería transformers y que el modelo base emplea pesos en formato safetensors. Por el recuento de parámetros (4,84B) se trata de un transformer de tamaño medio, pero no se especifica el número de capas, dimensiones ocultas, tipo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Tampoco se documenta el proceso de entrenamiento: no hay datos sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Las etiquetas "decision-model", "typed-decisions" y "decision-index" apuntan a un entrenamiento orientado a producir salidas estructuradas de decisión, pero no se aporta ninguna descripción técnica de cómo se implementa ese mecanismo ni de los datos utilizados para ello.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" y "endpoints_compatible" indican que puede servirse en endpoints compatibles con APIs conversacionales.
- Modelo de decisión: orientado a tareas de toma de decisiones estructuradas ("decision-model").
- Decisiones tipadas: soporte declarado para "typed-decisions", es decir, salidas de decisión con tipos definidos.
- Índice de decisiones: la etiqueta "decision-index" sugiere un mecanismo de indexación o selección entre opciones de decisión.
- Capacidades multilingües: limitadas al inglés según la model card; no se documentan otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación y enrutamiento de decisiones en pipelines: dado que el modelo está etiquetado como "decision-model" con "typed-decisions", puede emplearse para seleccionar entre un conjunto predefinido de acciones o categorías en un flujo automatizado, devolviendo decisiones estructuradas en lugar de texto libre.
- Moderación o triaje de contenido: uso como clasificador de entrada para decidir si un contenido requiere revisión humana, aprovechando su orientación a decisiones tipadas.
- Enrutamiento de consultas en sistemas RAG: el modelo puede actuar como componente de decisión que determina qué fuente o herramienta consultar antes de invocar un modelo generativo mayor.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_M (3,2 GB) y Q4_K_S (3,0 GB), puede ejecutarse en GPUs de gama media para tareas de decisión de baja latencia.
- Prototipado de agentes con pasos discretos: integrado en un bucle de agente donde cada iteración requiere elegir una acción entre varias posibles, el modelo puede servir como política de selección.
- Evaluación e investigación de modelos de decisión: útil para investigadores que quieran estudiar el comportamiento de modelos pequeños especializados en decisiones estructuradas frente a LLM generalistas.
- Servicio en endpoints compatibles: al estar marcado como "endpoints_compatible", puede desplegarse detrás de APIs compatibles con el ecosistema transformers/OpenAI-like para integrarse en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~2,3 GB de pesos; ~3-4 GB de VRAM con contexto moderado.
  - Q4_K_M: ~3,2 GB de pesos; ~4-5 GB de VRAM.
  - Q8_0: ~5,3 GB de pesos; ~6-7 GB de VRAM.
  - f16: ~9,8 GB de pesos; ~11-12 GB de VRAM.
- GPU recomendadas: para Q4_K_M basta una RTX 3060 de 12 GB o superior; para f16 se recomienda RTX 4090 (24 GB) o GPUs de datacenter como A100/H100 si se busca mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones (Q2_K a Q8_0) en GPUs con 6-8 GB de VRAM; f16 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y servidores compatibles con GGUF; el modelo base puede servirse con transformers y, presumiblemente, vLLM/TGI, aunque no se documenta explícitamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lg-decision-4B (esta ficha) | 4,84B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en decisiones tipadas; solo inglés |
| Qwen2.5-3B / 7B | 3B / 7B | 32K (Qwen2.5) | Apache 2.0 (3B), licencia propia (7B) | safetensors, GGUF | LLM generalista con buen multilingüismo; no especializado en decisiones |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Generalista, restricciones de licencia para >700M usuarios |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF | Generalista con buen razonamiento; no orientado a decisiones estructuradas |

La comparación es aproximada: no se dispone de benchmarks del modelo de esta ficha, por lo que la comparativa se limita a parámetros, contexto y licencia. Los modelos alternativos son generalistas, mientras que lg-decision-4B está especializado en un dominio concreto (decisiones tipadas), lo que dificulta una comparación directa de rendimiento.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; no hay evidencia de soporte para castellano u otros idiomas, por lo que su uso en producción multilingüe es arriesgado.
- Contexto: se desconoce la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Sesgos: no se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento no es posible evaluar su comportamiento en dominios sensibles.
- Alucinación: al ser un modelo orientado a decisiones, el riesgo principal no es la alucinación de texto sino la emisión de decisiones incorrectas o mal tipadas; no hay métricas publicadas de precisión.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base (dream-only/lg-decision-4B) mantiene la misma licencia y que no haya restricciones adicionales en su model card original.
- Madurez: el repositorio tiene 0 likes y 921 descargas, lo que sugiere poca validación por parte de la comunidad; no se han publicado evaluaciones independientes.
- Producción: sin benchmarks ni documentación de arquitectura, no se recomienda su uso en producción crítica sin una evaluación propia previa.
- Cuantizaciones: las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el propio autor recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lg-decision-4B-GGUF
- Modelo base: https://huggingface.co/dream-only/lg-decision-4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#lg-decision-4B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
