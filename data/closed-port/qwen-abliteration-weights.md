# closed-port/Qwen-abliteration-weights

## Resumen

`closed-port/Qwen-abliteration-weights` es un repositorio de pesos publicados en Hugging Face por el usuario `closed-port`, etiquetado como investigación (`research`) y orientado a `refusal-robustness` sobre la familia Qwen. El repositorio declara como modelo base principal `Qwen/Qwen3-1.7B` (y su versión cuantizada), aunque en los metadatos figuran también referencias a `Qwen/Qwen3.5-2B`, `Qwen/Qwen3-4B`, `Qwen/Qwen3.5-9B` y `Qwen/Qwen3.8-27B`, lo que sugiere un conjunto de artefactos derivados de varios tamanos de la familia Qwen en lugar de un unico modelo.

El dato verificable de parametros en safetensors es de 2.031.739.904 parametros (~2,03 mil millones), coherente con un transformer denso de la clase Qwen3-1.7B tras posibles modificaciones. El repositorio ocupa 20,1 GB e incluye pesos en `safetensors` y `gguf`, lo que permite tanto inferencia con frameworks de alto rendimiento como despliegue en CPU/consumer. La licencia declarada es Apache 2.0.

La relevancia de este repositorio es acotada y fundamentalmente experimental: se trata de un artefacto de investigación sobre robustez frente a rechazos (abliteration), no de un modelo de proposito general validado. El acceso esta restringido (gated) y no consta pipeline declarado, idiomas soportados ni documentacion tecnica de entrenamiento. Cualquier evaluacion de produccion debe partir de esa base: es material de estudio, no un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B; detalles no disponibles) |
| Parametros totales | 2.031.739.904 (~2,03 B) |
| Parametros activos | no disponible (no es MoE segun los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF incluido en el repo; niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de lo inferible de su modelo base: la familia Qwen3 emplea transformers densos con atencion por grupos (GQA) y tokenizer BPE multilingue, pero el repositorio no documenta configuracion, numero de capas, dimensiones ocultas ni vocabulario. El recuento de parametros en safetensors (~2,03 B) es el unico dato estructural verificable.

Tampoco hay informacion sobre el proceso de entrenamiento: no consta numero de tokens, composicion del dataset, ni si hubo etapas de RLHF, DPO o fine-tuning supervisado. La etiqueta `refusal-robustness` y el nombre del repositorio indican que el artefacto procede de una intervencion de tipo abliteration (modificacion de direcciones de activacion para reducir el comportamiento de rechazo), pero no se publican ni la metodologia exacta, ni los datos de calibracion, ni metricas de evaluacion del efecto. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Razonamiento basico y respuesta a instrucciones a escala de ~2 B de parametros.
- Generacion de codigo y matematicas elementales, limitada por el tamano del modelo.
- Soporte de tool calling: no confirmado en la documentacion del repositorio.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles en los metadatos (el modelo base Qwen3 es multilingue, pero el efecto de la intervencion sobre idiomas no esta documentado).
- Comportamiento de rechazo alterado por diseno (objetivo declarado del artefacto), sin metricas publicadas de robustez ni de utilidad tras la intervencion.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el artefacto sirve para estudiar como varia la tasa de rechazo de un modelo Qwen3-1.7B tras una intervencion de abliteration, comparando respuestas benignas y adversarias frente al modelo original.
- Analisis de robustez de filtros de seguridad: permite evaluar si clasificadores o guardrails externos siguen detectando contenido problematico cuando el modelo subyacente ha perdido parte de su comportamiento de rechazo.
- Experimentos academicos reproducibles: con ~2 B de parametros y pesos GGUF, se puede ejecutar en una sola GPU consumer o en CPU para estudios de mecanistica interpretativa sobre direcciones de activacion.
- Evaluacion de tecnicas de red-teaming: util como contraparte controlada en pruebas de pipelines de moderacion, midiendo falsos negativos de sistemas de filtrado.
- Prototipado de bajo coste en local: los GGUF permiten probar rapidamente variantes de prompting sobre un modelo pequeno sin infraestructura dedicada, siempre con fines de investigacion.
- Estudio de degradacion de capacidades: comparar benchmarks de utilidad (razonamiento, codigo) antes y despues de la intervencion para cuantificar el coste de la abliteration en un modelo de ~2 B.
- Docencia sobre seguridad en IA: ejemplo practico de como se modifica el comportamiento de rechazo de un LLM y que implicaciones tiene para el despliegue responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 4-5 GB solo para pesos (2,03 B x 2 bytes) mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2-2,5 GB; en 4 bits: aproximadamente 1,2-1,5 GB (estimaciones teoricas, no verificadas contra el repo).
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para FP16; A100/H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, practicamente en toda la gama actual con cuantizacion; en FP16 requiere al menos 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp u Ollama para los GGUF; vLLM o TGI para los safetensors; transformers para uso directo en investigacion.
- Latencia y throughput estimados: no disponibles (dependen del hardware y la cuantizacion; no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| closed-port/Qwen-abliteration-weights | ~2,03 B | no disponible | Apache 2.0 | Gated en Hugging Face | Artefacto de investigacion, sin benchmarks |
| Qwen/Qwen3-1.7B | ~1,7 B | no disponible en esta ficha | Apache 2.0 | Publico | Modelo base original, con comportamiento de rechazo intacto |
| Qwen/Qwen3-4B | ~4 B | no disponible en esta ficha | Apache 2.0 | Publico | Misma familia, mayor capacidad y coste |
| Llama 3.2 1B / 3B | 1-3 B | 128 K (segun ficha oficial de Meta) | Llama Community License | Publico (gated) | Alternativa de escala similar; licencia mas restrictiva que Apache 2.0 |

La comparacion directa de rendimiento no es posible: el repositorio no publica evaluaciones y su proposito (modificar el comportamiento de rechazo) no es equiparable al de los modelos base de referencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el modelo conserve capacidades de razonamiento, codigo o matematicas tras la intervencion.
- Objetivo declarado de reducir rechazos: el modelo puede producir contenido que el modelo base rechazaria, con implicaciones legales y de seguridad en cualquier uso orientado al publico.
- Sesgos conocidos: no documentados; los sesgos del modelo base Qwen3-1.7B se heredan y pueden amplificarse por la intervencion, sin que exista evaluacion al respecto.
- Riesgo de alucinacion: elevado por el tamano (~2 B) y sin datos de mitigacion; no hay evaluaciones de factualidad.
- Idiomas soportados no declarados: no se puede garantizar el comportamiento multilingue ni la calidad en castellano.
- Contexto no documentado: se desconoce la ventana efectiva, lo que impide planificar casos de uso con contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el acceso esta restringido (gated) y el artefacto es de investigacion; el uso comercial sin evaluacion previa de seguridad es desaconsejable.
- Metadatos inconsistentes: figuran cinco modelos base distintos y el recuento de parametros (~2,03 B) no coincide exactamente con Qwen3-1.7B, lo que dificulta la trazabilidad del artefacto.
- Sin pipeline declarado ni documentacion de entrenamiento: imposible auditar la metodologia de abliteration aplicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/closed-port/Qwen-abliteration-weights
- Modelo base principal: https://huggingface.co/Qwen/Qwen3-1.7B
- Otros modelos base referenciados: https://huggingface.co/Qwen/Qwen3-4B
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen
