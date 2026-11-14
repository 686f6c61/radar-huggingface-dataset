# cbrigance/granite-4.1-3b-heretic

## Resumen

Granite-4.1-3b-heretic es una variante "abliterated" del modelo ibm-granite/granite-4.1-3b de IBM, publicada por el usuario cbrigance en Hugging Face. La modificacion consiste en la eliminacion de la direccion de rechazo (refusal direction) del modelo original mediante tecnicas de abliteration, de modo que el modelo deja de negarse a responder a ciertas peticiones que el modelo base rechazaria. El resultado es un fine-tune que conserva la arquitectura y el conocimiento del modelo Granite 4.1 de 3B pero con un comportamiento alineado distinto.

El modelo cuenta con 3.402.836.480 parametros (aproximadamente 3,4 mil millones) almacenados en formato safetensors, con un tamano de repositorio de 6,8 GB, lo que sugiere pesos en precision bf16/fp16. Esta etiquetado como "not-for-all-audiences" y "abliterated", y su acceso esta restringido (gated) en Hugging Face, requiriendo la aceptacion de condiciones por parte del usuario.

Es relevante para investigadores interesados en estudiar los mecanismos de alineacion y rechazo en modelos de lenguaje, asi como para desarrolladores que necesiten un modelo de 3B sin filtros de rechazo para tareas de generacion de texto controladas. Al derivar de Granite 4.1, hereda la arquitectura transformer decoder-only de IBM y su entrenamiento base, aunque la informacion disponible sobre el proceso de abliteration concreto no esta detallada en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de IBM Granite 4.1) |
| Parametros totales | 3.402.836.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del IBM Granite 4.1 3B, un transformer decoder-only de aproximadamente 3,4 mil millones de parametros. La modificacion principal es la abliteration: una tecnica que identifica y elimina la direccion de activacion asociada al rechazo de peticiones, de forma que el modelo pierde la tendencia a negarse a responder. El repositorio incluye la etiqueta "heretic", que hace referencia a la herramienta Heretic de abliteration automatizada, aunque no se detalla en la informacion disponible la metodologia exacta, el numero de tokens de entrenamiento adicional ni si hubo RLHF o DPO en esta variante.

No se dispone de informacion sobre la composicion del dataset de entrenamiento, el numero de tokens utilizados en el fine-tune de abliteration ni innovaciones tecnicas adicionales mas alla de la propia eliminacion de la direccion de rechazo. El modelo base Granite 4.1 de IBM esta referenciado con el paper arXiv:2406.11717, que describe la familia Granite, pero los detalles especificos de esta variante no estan publicados en la ficha.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Granite 4.1 3B.
- Razonamiento y respuesta a instrucciones sin los filtros de rechazo del modelo original (comportamiento abliterated).
- Soporte de conversaciones multi-turno (etiqueta "conversational").
- Compatible con endpoints de Hugging Face (etiqueta "endpoints_compatible").
- Capacidades de tool calling y function calling: no confirmadas en la informacion disponible para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idiomas.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento generativo, comparando respuestas con el modelo base Granite 4.1 3B en conjuntos de prompts controlados.
- Generacion de texto creativo sin restricciones: util para escritura de ficcion, guiones o contenido narrativo donde el modelo base podria rechazar tematicas sensibles, con la advertencia de que el contenido generado requiere revision humana.
- Analisis de sesgos y seguridad: investigadores pueden emplear el modelo para auditar que tipo de contenido produce un modelo sin alineacion de rechazo, como parte de estudios de red-teaming.
- Prototipado de chatbots de dominio especifico: al ser un modelo de 3,4B, cabe en GPUs de consumo y permite iterar rapidamente en entornos de desarrollo con requisitos de contenido menos restrictivos.
- Experimentos de destilacion y comparacion: sirve como punto de comparacion frente al modelo base para medir el impacto de la abliteration en benchmarks de conocimiento y razonamiento.
- Despliegue local en entornos de investigacion: con 6,8 GB de pesos en safetensors, puede ejecutarse en estaciones de trabajo con una sola GPU de 16 GB o superior, facilitando experimentos reproducibles sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,8 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 10-12 GB de VRAM para contexto moderado.
- VRAM estimada con cuantizacion a 8 bits: aproximadamente 3,5-4 GB para los pesos.
- VRAM estimada con cuantizacion a 4 bits: aproximadamente 2-2,5 GB para los pesos.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) para inferencia en precision completa sin problemas; GPUs de 16 GB como RTX 4080 o A4000 son suficientes en bf16 con contexto limitado.
- Cabe en GPUs de consumo: si, en tarjetas con 12 GB o mas en bf16, y en tarjetas de 8 GB con cuantizacion a 4 bits.
- Opciones de despliegue: transformers (libreria indicada en la ficha), vLLM, llama.cpp u Ollama si se generan cuantizaciones GGUF (no disponibles en el repositorio actual), TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cbrigance/granite-4.1-3b-heretic | 3,4B | no disponible | apache-2.0 | Gated en HF | Variante abliterated de Granite 4.1 3B |
| ibm-granite/granite-4.1-3b | 3,4B | no disponible | apache-2.0 | Publico en HF | Modelo base con alineacion estandar |
| Llama 3.2 3B | 3,2B | 128K (segun ficha oficial) | Llama 3.2 Community License | Publico en HF | Modelo generalista de Meta, con filtros de rechazo |
| Qwen2.5 3B | 3,1B | 32K (segun ficha oficial) | Apache 2.0 | Publico en HF | Modelo multilingue con alineacion estandar |

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido sensible, ofensivo o inapropiado; esta etiquetado como "not-for-all-audiences".
- Riesgo elevado de alucinacion, comun en modelos de 3B y potencialmente agravado por la perdida de coherencia asociada a la abliteration.
- Idiomas soportados limitados al ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia apache-2.0: permite uso comercial, pero el despliegue de un modelo sin filtros de rechazo puede incumplir politicas de plataformas o normativas locales; se recomienda evaluacion legal antes de produccion.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos.
- Sin datos de benchmarks publicados para esta variante, por lo que no es posible cuantificar la degradacion respecto al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbrigance/granite-4.1-3b-heretic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b
- Paper de referencia de la familia Granite: https://arxiv.org/abs/2406.11717
