# cbrigance/Granite-4.1-30b-heretic-v2-W4A16-NVFP4

## Resumen

Granite-4.1-30b-heretic-v2-W4A16-NVFP4 es una derivacion del modelo ibm-granite/granite-4.1-30b, publicado por el usuario cbrigance en Hugging Face. Se trata de una version "abliterated" (con las direcciones de rechazo eliminadas mediante tecnicas de abliteration) y posteriormente cuantizada en formato NVFP4 con esquema W4A16 (pesos a 4 bits, activaciones a 16 bits) usando NVIDIA ModelOpt. El resultado es un checkpoint de aproximadamente 16.000 millones de parametros efectivos segun los safetensors del repositorio, con un tamano de repo de 20,7 GB.

El modelo resuelve el problema de desplegar un LLM conversacional de tamano medio en hardware NVIDIA Blackwell con precision FP4, manteniendo la ventana de contexto y las capacidades del modelo base Granite 4.1 de IBM, pero con las restricciones de rechazo relajadas por la abliteration. Es relevante para desarrolladores que quieran evaluar inferencia a 4 bits nativa (NVFP4) en GPUs de ultima generacion y para investigadores interesados en estudiar el efecto de la abliteration sobre el comportamiento del modelo.

La licencia declarada es apache-2.0, heredada del modelo base, pero el acceso esta restringido (gated) y el modelo esta etiquetado como "not-for-all-audiences" por la naturaleza de la abliteration. El idioma declarado es unicamente ingles. No hay descargas ni likes registrados en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Granite 4.1); no disponible detalle exacto de capas/heads |
| Parametros totales | 15.980.826.624 (~16 B) segun safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 con esquema W4A16 (pesos 4 bits, activaciones 16 bits), generado con NVIDIA ModelOpt; tag "8-bit" presente en metadatos |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), cuantizado NVFP4 |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint ibm-granite/granite-4.1-30b, que pertenece a la familia Granite 4.1 de IBM. Los metadatos indican una arquitectura transformer densa con aproximadamente 16.000 millones de parametros efectivos almacenados. La innovacion principal de esta ficha no esta en la arquitectura sino en el pipeline de post-procesado: primero se aplico abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones, metodologia "heretic"), y despues se cuantizo a NVFP4 mediante NVIDIA ModelOpt con esquema W4A16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en esta derivacion concreta. El modelo base Granite 4.1 de IBM si documenta su pipeline de entrenamiento, pero esos datos no estan incluidos en la informacion proporcionada. La referencia arxiv:2406.11717 aparece en los tags y corresponde a un paper citado por el autor, pero su contenido no se detalla aqui.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, tag "conversational").
- Razonamiento y generacion de codigo heredados del modelo base Granite 4.1.
- Capacidades multilingues limitadas al ingles segun los metadatos.
- Comportamiento "abliterated": se espera una reduccion de rechazos ante peticiones que el modelo base declinaria, aunque no hay evaluacion publicada que lo cuantifique.
- Compatibilidad con endpoints (tag "endpoints_compatible") para despliegue via API.
- No se documentan explicitamente tool calling, function calling, agentes, vision ni audio en esta ficha; deben asumirse como no disponibles salvo verificacion contra el modelo base.

## Casos de uso

- Investigacion sobre abliteration: comparar respuestas del modelo abliterated frente al Granite 4.1 original para estudiar como cambia la distribucion de rechazos y la calidad en tareas sensibles.
- Evaluacion de inferencia NVFP4 en Blackwell: medir throughput y latencia de un modelo de ~16 B en FP4 nativo frente a FP16/BF16 en GPUs NVIDIA de nueva generacion.
- Despliegue conversacional en ingles: usar el modelo como chatbot de proposito general en ingles cuando se requiera un checkpoint compacto (~20,7 GB) compatible con transformers.
- Generacion de codigo asistida: aprovechar las capacidades de codigo del base Granite 4.1 en pipelines internos donde la relajacion de rechazos sea aceptable.
- Benchmarking de cuantizacion: comparar calidad de NVFP4 W4A16 frente a otras cuantizaciones (GPTQ, AWQ, GGUF) del mismo modelo base.
- Experimentacion con endpoints: integrar el modelo en servidores compatibles con la API de transformers para pruebas de concepto de agentes conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 20,7 GB, por lo que se necesita al menos ~21-24 GB de VRAM para cargar los pesos NVFP4 en memoria; overhead adicional de activaciones y KV cache segun contexto.
- GPU recomendadas: GPUs NVIDIA Blackwell (serie RTX 50, B200, GB200) por el soporte nativo de NVFP4; GPUs Hopper/Ada pueden requerir conversion o fallback.
- Consumer GPU: previsiblemente cabe en RTX 5090 (32 GB) y RTX 5080 (16 GB) con margen ajustado; en RTX 4090 (24 GB) la compatibilidad NVFP4 no esta garantizada.
- Despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cbrigance/Granite-4.1-30b-heretic-v2-W4A16-NVFP4 | ~16 B | no disponible | apache-2.0 | gated | Abliterated + NVFP4 |
| ibm-granite/granite-4.1-30b | no disponible | no disponible | apache-2.0 (segun base) | publico en HF | Modelo base sin abliteration ni cuantizacion NVFP4 |
| Otras cuantizaciones del mismo base (GPTQ/AWQ/GGUF) | ~16 B | no disponible | apache-2.0 | variable | No disponibles en la informacion proporcionada |

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Etiqueta "not-for-all-audiences": la abliteration reduce rechazos, lo que puede producir contenido sensible o inapropiado en produccion.
- Idioma: solo ingles declarado; no se garantiza calidad en castellano ni otros idiomas.
- Riesgo de alucinacion: inherente a los LLM; la abliteration puede aumentar respuestas confiadas pero incorrectas en dominios donde el modelo base era cauteloso.
- Sesgos: no evaluados en esta ficha; se heredan los del modelo base Granite 4.1 sin mitigaciones adicionales documentadas.
- Licencia apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo abliterated recae en el desplegador.
- Compatibilidad hardware limitada: NVFP4 esta optimizado para Blackwell; en otras arquitecturas puede requerir conversion o no funcionar.
- Cero descargas y cero likes: no hay evidencia de validacion comunitaria ni de reproducibilidad verificada por terceros.
- No se documentan evaluaciones de calidad post-cuantizacion ni post-abliteration.

## Enlaces

- Hugging Face: https://huggingface.co/cbrigance/Granite-4.1-30b-heretic-v2-W4A16-NVFP4
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-30b
- Paper referenciado en tags: https://arxiv.org/abs/2406.11717
- NVIDIA ModelOpt (herramienta de cuantizacion): https://github.com/NVIDIA/TensorRT-Model-Optimizer
