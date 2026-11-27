# richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic

## Resumen

Olmo-3.1-32B-Instruct-SOM-heretic es un ajuste fino del modelo allenai/Olmo-3.1-32B-Instruct publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "heretic" o "abliterated", es decir, un modelo al que se le ha aplicado una tecnica de desalineacion (abliteration) para reducir los rechazos y el comportamiento censurado del modelo original, manteniendo en lo posible sus capacidades generales. El modelo conserva la arquitectura y el tamano del original: 32.233.522.176 parametros (aproximadamente 32,2 mil millones).

El modelo base, Olmo-3.1-32B-Instruct, pertenece a la familia Olmo de Allen Institute for AI (AI2), una linea de modelos abiertos disenada para ser reproducible de extremo a extremo (datos, codigo de entrenamiento y pesos publicos). Esta variante concreta se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

La relevancia de esta ficha radica en que documenta una modificacion de la comunidad sobre un modelo abierto de gran tamano, con implicaciones claras: se gana libertad de respuesta y se pierden garantias de seguridad alineadas. Es un modelo orientado a generacion de texto conversacional en ingles, con pesos en safetensors y compatibilidad con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, segun modelo base) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base allenai/Olmo-3.1-32B-Instruct, un transformer decoder-only de aproximadamente 32,2 mil millones de parametros. La informacion disponible no detalla la configuracion interna (numero de capas, dimension oculta, atencion, tipo de positional encoding) ni la longitud de contexto nativa, por lo que estos datos deben consultarse en la ficha del modelo base.

Sobre el proceso de ajuste: la etiqueta "heretic" y "abliterated" indica que se ha aplicado una tecnica de abliteration, que consiste en identificar y neutralizar las direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder a ciertos prompts. El autor no publica en la informacion disponible el detalle del dataset, el numero de tokens de ajuste ni si hubo RLHF/DPO adicional. El tag `dataset:allenai/Dolci-Instruct-RL` apunta a que el modelo base fue entrenado con ese conjunto de instrucciones, pero no confirma que esta variante lo haya usado directamente. No hay datos sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno.
- Razonamiento general e instrucciones, heredado del modelo Instruct base.
- Generacion de codigo y matematicas (capacidad esperable del base, no verificada con benchmarks en esta ficha).
- Modo "uncensored": responde a peticiones que el modelo original rechazaria, gracias a la abliteration.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue gestionado.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como contrapunto "abliterated" frente al base alineado, permitiendo estudiar como cambia el comportamiento al eliminar la direccion de rechazo en un modelo de 32B.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido adulto donde el modelo base se negaria; adecuado por su tamano y capacidad de seguir instrucciones largas.
- Evaluacion de robustez de filtros: usar el modelo para generar respuestas que prueben sistemas de moderacion y clasificadores de contenido en pipelines de produccion.
- Red teaming interno: simular ataques de prompt y medir la eficacia de guardrails en aplicaciones que usan modelos alineados.
- Analisis de sesgos y refusal behavior: comparar las respuestas de esta variante con las del base para cuantificar el efecto de la abliteration en dominios sensibles.
- Prototipado de asistentes conversacionales en ingles: al ser compatible con transformers y endpoints, puede integrarse rapidamente en demos donde la censura no sea un requisito, aceptando las advertencias de licencia y uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 64,5 GB de pesos, por lo que se necesitan al menos 2 GPU de 40 GB (A100 40GB, A6000) o una H100 80GB para caber con margen para el KV cache.
- Cuantizacion a 8 bits: alrededor de 32-34 GB, viable en una A100 40GB o RTX 6000 Ada 48GB.
- Cuantizacion a 4 bits: alrededor de 16-18 GB, viable en una RTX 4090 24GB o RTX 3090 24GB, con contexto limitado.
- GPU recomendadas: H100 80GB, A100 80GB, A100 40GB (multi-GPU), RTX 6000 Ada, RTX 4090 para cuantizaciones agresivas.
- Despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible, aunque al ser safetensors de un transformer estandar son opciones plausibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic | 32,2B | no disponible | Apache 2.0 (gated) | Variante abliterated del Olmo 3.1 32B Instruct |
| allenai/Olmo-3.1-32B-Instruct | 32,2B | no disponible | no disponible en esta ficha | Modelo base alineado, con rechazos |
| Otras variantes abliterated de 32B (p. ej. de Qwen o Llama) | ~32B | variable | variable | Misma tecnica de abliteration sobre otros bases |

La comparacion cuantitativa de rendimiento no esta disponible porque no se han publicado benchmarks para esta variante.

## Limitaciones y advertencias

- La abliteration elimina parte de las salvaguardas del modelo base; puede generar contenido danino, ofensivo o ilegal si se le solicita.
- Riesgo elevado de alucinacion, como en cualquier LLM de este tamano, agravado por la falta de benchmarks que verifiquen su calidad tras el ajuste.
- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta garantizado.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado en produccion.
- Aunque la licencia es Apache 2.0, el uso comercial debe evaluarse con cuidado por el contenido que el modelo puede producir y por las condiciones del modelo base.
- No hay datos publicados sobre contexto maximo, tool calling ni cuantizaciones oficiales; verificar antes de desplegar.
- Repositorio con 0 likes y 495 descargas: ecosistema de validacion muy limitado, sin garantias de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper referenciado (arxiv:2512.13961): https://arxiv.org/abs/2512.13961
- Paper referenciado (arxiv:2611.17846): https://arxiv.org/abs/2611.17846
