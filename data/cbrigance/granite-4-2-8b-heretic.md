# cbrigance/granite-4.2-8b-heretic

## Resumen

`cbrigance/granite-4.2-8b-heretic` es una variante "abliterated" (tambien etiquetada como "heretic") del modelo `ibm-granite/granite-4.2-8b` de IBM, publicada por el usuario cbrigance en Hugging Face. El modelo base pertenece a la familia Granite 4.2 de IBM, orientada a generacion de texto conversacional y tareas empresariales, y esta disponible bajo licencia Apache 2.0. La variante heretic aplica tecnicas de ablacion de direcciones de rechazo (refusal directions) para reducir el comportamiento de negativa del modelo ante peticiones que el modelo original rechazaria.

El modelo cuenta con 8.791.592.960 parametros segun los pesos en safetensors, con un tamano de repositorio de 17,6 GB, lo que sugiere pesos en precision bf16/fp16. La informacion publicada no detalla la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados de benchmarks de esta variante especifica.

Es relevante para desarrolladores e investigadores interesados en estudiar el comportamiento de rechazo en modelos alineados, en la evaluacion de tecnicas de ablacion y en casos de uso donde las negativas del modelo base resultan excesivamente restrictivas. No obstante, la etiqueta `not-for-all-audiences` y el acceso restringido (gated) indican que su uso esta pensado para investigacion controlada y no para despliegues de produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: familia IBM Granite 4.2, transformer decoder-only) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors (repo de 17,6 GB, compatible con bf16/fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna de esta variante en la ficha de Hugging Face. El modelo base `ibm-granite/granite-4.2-8b` pertenece a la familia Granite de IBM, que emplea arquitecturas transformer decoder-only orientadas a generacion de texto; sin embargo, los detalles concretos de capas, atencion y dimensiones no se incluyen en la informacion proporcionada.

Respecto al entrenamiento, la etiqueta "heretic" y "abliterated" indica que se ha aplicado una modificacion post-entrenamiento sobre el modelo base para eliminar o atenuar las direcciones de activacion asociadas al rechazo de peticiones. No se especifica en la informacion disponible el metodo exacto de ablacion, el volumen de datos utilizado, ni si hubo fases adicionales de fine-tuning, RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Granite 4.2.
- Razonamiento y respuesta a instrucciones propias de un modelo de 8B parametros.
- Reduccion del comportamiento de rechazo respecto al modelo base, gracias a la ablacion aplicada.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta al comportamiento del modelo base en tareas de evaluacion de seguridad y utilidad.
- Evaluacion comparativa de variantes abliterated: util para medir diferencias de rendimiento y calidad entre el modelo original y la variante heretic en benchmarks controlados.
- Generacion de texto creativo sin restricciones excesivas: en entornos de investigacion donde las negativas del modelo base interfieren con la generacion de narrativa o dialogos.
- Analisis de robustez y jailbreak: sirve como referencia para estudiar la eficacia de tecnicas de ablacion frente a mecanismos de seguridad.
- Prototipado de asistentes conversacionales en ingles: aprovecha los 8,79B parametros del modelo base para tareas de dialogo en entornos de laboratorio.
- Fine-tuning posterior controlado: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para experimentos de ajuste supervisado en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 17,6 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion 8 bits: alrededor de 9-10 GB, aunque no se confirma la disponibilidad de pesos cuantizados oficiales.
- VRAM estimada en cuantizacion 4 bits: alrededor de 5-6 GB, sujeta a conversion manual con herramientas como bitsandbytes o GPTQ.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de mayor throughput; RTX 4090 (24 GB) viable en bf16 para inferencia individual.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16; en GPUs de 12-16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (soporte nativo indicado), vLLM, TGI y llama.cpp tras conversion a GGUF; Ollama requeriria conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cbrigance/granite-4.2-8b-heretic | 8,79B | no disponible | Apache 2.0 | Variante abliterated, acceso gated, solo ingles |
| ibm-granite/granite-4.2-8b | no disponible en esta ficha | no disponible | Apache 2.0 | Modelo base original, alineado y con rechazos |
| Otras variantes abliterated de 7-8B (p. ej. Llama o Mistral abliterated) | ~7-8B | variable | variable | Alternativas de la misma categoria; datos concretos no disponibles en esta busqueda |

## Limitaciones y advertencias

- La ablacion de rechazos puede degradar la calidad general del modelo y aumentar la probabilidad de respuestas inapropiadas o daninas.
- Etiqueta `not-for-all-audiences`: no apto para entornos sin supervision ni para aplicaciones de cara al publico sin filtros adicionales.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga.
- Riesgo de alucinacion inherente a modelos de 8B; no se documentan evaluaciones especificas de fidelidad.
- Soporte limitado al ingles segun la etiqueta de idioma; no se garantiza calidad en castellano u otros idiomas.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated conlleva riesgos reputacionales y de cumplimiento que deben evaluarse.
- No se dispone de informacion sobre el contexto maximo, lo que dificulta planificar despliegues con ventanas largas.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/cbrigance/granite-4.2-8b-heretic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Paper referenciado en tags (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
