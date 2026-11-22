# moeshawky/Qwen3.8-Flash-Next-Uncensored-NVFP4

## Resumen

Qwen3.8-Flash-Next-Uncensored-NVFP4 es una cuantizacion y modificacion del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario moeshawky en Hugging Face. Se trata de una variante "abliterated" y "uncensored" del modelo base de Alibaba (Qwen), orientada explicitamente a tareas de red teaming y ai-red-team segun sus propios tags. El modelo conserva la pipeline image-text-to-text del original, por lo que mantiene capacidad de vision ademas de generacion de texto.

Tecnicamente es un modelo de arquitectura MoE (mixture of experts) con aproximadamente 180.000 millones de parametros totales, cuantizado en formatos NVFP4/FP4/FP8 mediante compressed-tensors y empaquetado en safetensors para su uso con transformers y vLLM. El repositorio ocupa 183,5 GB, lo que refleja la mezcla de pesos de alta y baja precision.

Su relevancia actual es doble: por un lado, ofrece una via de despliegue de un modelo de ~180B en infraestructura con aceleracion FP4 (Blackwell de NVIDIA), y por otro, la variante "uncensored" resulta de interes para investigadores que estudian alineamiento, seguridad y comportamiento de modelos sin filtros. La licencia es Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) transformer multimodal, variante de Qwen3.8-Flash-Next |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, FP4, FP8 (compressed-tensors); tag 8-bit |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de tipo MoE desarrollado por Qwen (Alibaba), con capacidad image-text-to-text. La variante publicada por moeshawky aplica una cuantizacion NVFP4/FP8 sobre los pesos originales, empleando el ecosistema compressed-tensors para mantener la compatibilidad con vLLM y transformers. Ademas, incorpora una modificacion de tipo "abliterated", una tecnica de edicion de pesos que elimina direcciones de rechazo en el espacio de activaciones para reducir las respuestas de negativa del modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base dentro de la informacion proporcionada. Tampoco se detalla el proceso exacto de "abliteration" aplicado ni los hiperparametros de la cuantizacion (grupos, escalas, calibracion). Los tags indican soporte de reasoning, function-calling y vision-language, lo que sugiere que el modelo base conserva capacidades de razonamiento multi-paso y llamada a funciones.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento (tag "reasoning") y resolucion de problemas multi-paso.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text).
- Soporte de function calling / tool calling (tag "function-calling").
- Capacidades de agente y razonamiento encadenado derivadas del modelo base.
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones, orientado a red teaming.
- Compatibilidad con endpoints (tag "endpoints_compatible") y despliegue en vLLM.
- Capacidades multilingues limitadas a en y zh segun los metadatos.

## Casos de uso

- Red teaming y evaluacion de seguridad: el caracter "uncensored" permite a equipos de seguridad explorar respuestas del modelo ante prompts adversarios y comparar con la version alineada del modelo base, midiendo el efecto de la abliteration.
- Investigacion sobre alineamiento: util para estudiar como la eliminacion de direcciones de rechazo afecta a la utilidad, la coherencia y la seguridad en un modelo de ~180B.
- Despliegue de vision-lenguaje en produccion con FP4: la cuantizacion NVFP4 permite servir un modelo multimodal grande en GPUs Blackwell con menor huella de memoria que el modelo en BF16.
- Asistencia conversacional multilingue (ingles/chino): atencion al cliente o asistentes internos en entornos donde solo se requieren esos dos idiomas.
- Automatizacion con tool calling: integracion en pipelines que requieren llamadas a funciones o APIs externas, aprovechando el soporte de function-calling del modelo base.
- Procesamiento de documentos con imagenes: extraccion y razonamiento sobre capturas, formularios o diagramas gracias a la pipeline image-text-to-text.
- Experimentacion en investigacion academica: base para estudios comparativos entre modelos cuantizados en FP4 frente a sus equivalentes en BF16/FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 183,5 GB en safetensors; la inferencia en NVFP4 requiere aproximadamente esa cifra de memoria, mientras que una ejecucion en FP8 o BF16 del modelo base necesitaria considerablemente mas (no disponible el dato exacto).
- GPU recomendadas: GPUs NVIDIA Blackwell (serie B200/B100/RTX 50) para aprovechar NVFP4 de forma nativa; GPUs Hopper (H100/H200) para FP8.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) sin offloading o cuantizaciones adicionales no incluidas en este repo.
- Opciones de despliegue: vLLM (soporte de compressed-tensors y NVFP4), transformers. No se confirma soporte de llama.cpp u Ollama para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-NVFP4 (este) | ~180B | no disponible | Apache 2.0 | safetensors NVFP4/FP8 | Variante uncensored cuantizada, acceso gated |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B | no disponible | Apache 2.0 | safetensors | Modelo original alineado, sin cuantizar |
| Otras variantes abliterated de Qwen | no disponible | no disponible | variable | variable | No se dispone de datos concretos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": la eliminacion de mecanismos de rechazo aumenta el riesgo de generar contenido danino, sesgado o inapropiado; no recomendado para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo elevado de alucinacion inherente a los modelos de lenguaje, no mitigado por la cuantizacion.
- Idiomas limitados a en y zh; el rendimiento en castellano no esta garantizado ni documentado.
- La cuantizacion NVFP4 puede degradar ligeramente la calidad respecto al modelo base en BF16; no se han publicado evaluaciones de esta perdida.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado en pipelines.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por una variante sin alineamiento recae en el desplegador.
- No se dispone de informacion sobre la longitud de contexto efectiva, los parametros activos del MoE ni el proceso de calibracion de la cuantizacion.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion comunitaria de su calidad o estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/moeshawky/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
