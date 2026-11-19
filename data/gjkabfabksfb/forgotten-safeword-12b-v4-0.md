# gjkabfabksfb/Forgotten-Safeword-12B-v4.0

## Resumen

Forgotten-Safeword-12B-v4.0 es un ajuste fino (finetune) del modelo TheDrummer/UnslopNemo-12B-v3, publicado por el usuario gjkabfabksfb en Hugging Face. Se trata de un modelo de 12.247.782.400 parámetros (aproximadamente 12,2 mil millones) orientado explícitamente a roleplay para adultos, contenido NSFW y narrativa explícita, según declara el propio autor en las etiquetas y en la model card. La arquitectura subyacente es de tipo transformer, heredada de la familia Mistral, tal como indican las etiquetas del repositorio.

El modelo se presenta como una variante "unaligned" y "dangerous", sin ningún tipo de alineamiento de seguridad, y su model card lo describe como un modelo entrenado para generar contenido explícito de forma deliberada. El autor indica que la versión 4.0 está "sobrecocinada" (overcooked) y recomienda usar otro modelo base (ReadyArt/Forgotten-Abomination-12B-v4.0) y cambiar a Safeword solo cuando se busque un comportamiento más desinhibido.

La relevancia de esta ficha es fundamentalmente documental y de evaluación de riesgos: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, sin pipeline de inferencia declarado y con una model card que contiene principalmente maquetación HTML/CSS y texto humorístico en lugar de información técnica verificable. Su interés para desarrolladores e investigadores radica en entender los límites del ecosistema de modelos abiertos y los riesgos asociados a finetunes sin alineamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral, según etiquetas; detalles no disponibles) |
| Parámetros totales | 12.247.782.400 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada; la model card enlaza colecciones EXL2 y GGUF de un tercero (ReadyArt) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta "mistral" y del modelo base declarado, TheDrummer/UnslopNemo-12B-v3, que a su vez es un finetune de un modelo de 12B de la familia Mistral. No se especifican el número de capas, la dimensión del modelo, el número de cabezas de atención ni la longitud de contexto nativa. El tamaño del repositorio (24,5 GB) es coherente con pesos en precisión de 16 bits para 12,2 mil millones de parámetros.

Respecto al entrenamiento, la model card menciona de forma genérica la "reintegración de escenarios de la V1.2" y la "inyección directa del dataset Safeword" en el modelo, pero no aporta cifras de tokens, composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card está dominada por estilos CSS y texto promocional, sin datos verificables de entrenamiento.

## Capacidades

- Generación de texto narrativo y de roleplay en inglés, orientado a contenido explícito para adultos.
- Generación de contenido NSFW y ERP (erotic roleplay), según las etiquetas del repositorio.
- Comportamiento "unaligned": el autor declara explícitamente la ausencia de alineamiento de seguridad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo puede emplearse como caso de estudio de finetunes sin salvaguardas, para analizar qué tipos de contenido genera un modelo "unaligned" y diseñar filtros o clasificadores de contenido que los detecten.
- Roleplay narrativo para adultos en entornos controlados: el modelo está entrenado específicamente para conversaciones de rol explícitas en inglés, con escenarios reincorporados de versiones anteriores según el autor.
- Evaluación de técnicas de moderación: sirve como entrada adversaria para probar sistemas de moderación de contenido y pipelines de filtrado en producción.
- Estudio de linaje de finetunes: permite trazar la cadena UnslopNemo-12B-v3 → Forgotten-Safeword-12B-v4.0 y analizar cómo se degradan o modifican las capacidades del modelo base tras sucesivos ajustes.
- Generación de narrativa ficcional explícita en inglés: el modelo está orientado a la escritura de escenas de rol adultas, aunque el autor advierte que la versión 4.0 está "sobrecocinada" y recomienda otro modelo para un comportamiento más equilibrado.
- Pruebas de robustez de despliegues: útil para verificar que un pipeline de inferencia (vLLM, llama.cpp, etc.) maneja correctamente pesos safetensors de 12B sin salvaguardas integradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 24,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 32 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 13-14 GB; en 4 bits: alrededor de 7-8 GB (estimaciones teóricas basadas en el número de parámetros, no verificadas con este modelo concreto).
- GPU recomendadas: A100 40/80 GB, H100, o configuraciones multi-GPU para FP16; RTX 4090 (24 GB) puede alojar el modelo en cuantizaciones de 8 o 4 bits, no en FP16 completo.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones de 4-8 bits en GPUs con 12-24 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090), aunque no se han verificado latencias concretas.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; EXL2 mediante ExLlamaV2 (el autor enlaza colecciones EXL2 y GGUF de un tercero); vLLM y TGI para safetensors, sujeto a compatibilidad con la arquitectura Mistral subyacente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Orientación | Disponibilidad |
|---|---|---|---|---|---|
| Forgotten-Safeword-12B-v4.0 | 12,2B | No disponible | Apache 2.0 | Roleplay NSFW, unaligned | Hugging Face (0 descargas) |
| TheDrummer/UnslopNemo-12B-v3 (base) | ~12B | No disponible | No disponible en la información | Roleplay, finetune | Hugging Face |
| ReadyArt/Forgotten-Abomination-12B-v4.0 | ~12B | No disponible | No disponible en la información | Roleplay, recomendado por el autor como alternativa | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) para ninguno de los modelos de la tabla en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de alineamiento de seguridad: el modelo está etiquetado como "unaligned" y "dangerous", y genera contenido explícito sin filtros.
- Riesgo elevado de contenido dañino: la model card advierte explícitamente de que el modelo genera contenido que "requiere lejía cerebral de grado industrial", en tono humorístico pero señalando el riesgo real.
- Sesgos conocidos: no documentados, pero al ser un finetune de rol explícito en inglés, es probable que reproduzca sesgos de género y de representación del dataset de entrenamiento (no verificado).
- Riesgo de alucinación: no evaluado; al no haber benchmarks, no hay medida de fiabilidad factual.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial según los términos de la licencia, pero el contenido generado puede infringir normativas sobre material para adultos y las políticas de las plataformas de despliegue.
- Advertencia de producción: cero descargas y cero likes en el momento de la consulta; sin pipeline de inferencia declarado; sin benchmarks; model card sin información técnica verificable. No recomendable para despliegues en producción sin una evaluación de seguridad independiente.
- La model card contiene principalmente HTML/CSS y texto promocional, no documentación técnica; cualquier integración debe basarse en la inspección directa de los pesos y la configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gjkabfabksfb/Forgotten-Safeword-12B-v4.0
- Modelo base: https://huggingface.co/TheDrummer/UnslopNemo-12B-v3
- Modelo alternativo recomendado por el autor: https://huggingface.co/ReadyArt/Forgotten-Abomination-12B-v4.0
- Configuración de inferencia recomendada por el autor: https://huggingface.co/sleepdeprived3/Mistral-V3-Tekken-E
- Colección EXL2 (tercero): https://huggingface.co/collections/ReadyArt/forgotten-safeword-12b-v40-exl2-67d93e5cc37d05ff0ab0dae9
- Colección GGUF (tercero): https://huggingface.co/collections/ReadyArt/forgotten-safeword-12b-v40-gguf-67d93e69d4759ebc68802944
