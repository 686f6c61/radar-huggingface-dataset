# ReadyArt/Wicked-Tutu-26B-A4B-Final

## Resumen

Wicked-Tutu-26B-A4B-Final es un ajuste fino (finetune) del modelo google/gemma-4-26B-A4B-it, publicado por ReadyArt bajo licencia Apache 2.0. El modelo hereda la arquitectura del Gemma 4 de Google (etiqueta gemma4 y nomenclatura A4B en el nombre, que en la familia Gemma designa variantes con mezcla de expertos y un subconjunto reducido de parámetros activos) y cuenta con 25.805.936.206 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los 26B. El repositorio ocupa 51,6 GB.

El propósito declarado del autor es el roleplay explícito, el contenido erótico (ERP), el terror y la violencia, además de un comportamiento "unaligned" (con menos rechazos ante peticiones sensibles). Está etiquetado como NSFW y `not-for-all-audiences`, y solo declara soporte para inglés. No es un modelo de propósito general: está claramente orientado a generación de texto conversacional sin filtros para narrativa adulta.

Su relevancia ahora es de nicho: la comunidad de roleplay y narrativa explícita busca variantes de modelos grandes recientes con menos restricciones y este es un ejemplo temprano sobre Gemma 4. No obstante, la model card visible no aporta detalles sobre dataset, contexto, benchmarks ni proceso de entrenamiento, por lo que la evaluación técnica queda muy limitada con la información pública disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; basada en google/gemma-4-26B-A4B-it (etiqueta gemma4). La nomenclatura A4B sugiere MoE con parámetros activos reducidos, sin confirmación en la model card |
| Parametros totales | 25.805.936.206 (25,8B) |
| Parametros activos | No disponible en la model card (la nomenclatura A4B sugiere ~4B activos, dato no confirmado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican GGUF ni otras variantes) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B-it, un transformer de la familia Gemma 4 de Google. El sufijo A4B del nombre, habitual en la nomenclatura de variantes con mezcla de expertos de esta familia, apunta a una arquitectura MoE con un número reducido de parámetros activos por token, aunque la model card no explicita el número exacto ni la configuración de expertos. Los pesos publicados suman 25,8B de parámetros totales y 51,6 GB en safetensors, coherente con pesos en precisión de 16 bits.

El entrenamiento consiste en un finetune del modelo base orientado a roleplay, contenido erótico, terror y violencia, con un sesgo declarado hacia el comportamiento "unaligned". No se detalla en la información disponible el volumen de tokens de ajuste, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o preferencias. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) más allá de las que herede del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay e interpretación de personajes.
- Contenido erótico y explícito (ERP), con menor tasa de rechazo que el modelo base según la intención declarada por el autor ("unaligned").
- Narrativa de terror y violencia explícita, según las etiquetas del repositorio.
- Redacción creativa en inglés, idioma único declarado.
- Soporte de tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multimodales (visión, audio): no documentadas en esta variante.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está afinado específicamente para mantener personajes y dinámicas multi-turno, lo que lo hace adecuado para plataformas de roleplay con memoria de contexto (siempre que se valide la ventana real del modelo base).
- Ficción erótica asistida: escritura de narrativa adulta con continuidad de personajes y tono, donde el ajuste "unaligned" reduce los bloqueos que aparecen en modelos alineados.
- Narrativa de terror y violencia: generación de escenas de horror explícito, útil para guionistas de ficción, videojuegos o podcasts de terror que necesiten material sin filtros previos.
- Prototipado de videojuegos narrativos para adultos: generación de diálogos ramificados y descripciones de escenas en motores tipo Ren'Py o similares, usando una única GPU con cuantización agresiva.
- Investigación sobre alineamiento y seguridad: como caso de estudio de un finetune "unaligned" para medir la degradación de los mecanismos de rechazo respecto al modelo base, en entornos controlados.
- Generación de contenido para comunidades de fan fiction: borradores de capítulos y continuaciones con estilo consistente, dado el soporte conversacional del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones específicas de roleplay o preferencias humanas, ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 52 GB solo para pesos, más overhead de KV cache según contexto (no publicado el tamaño de contexto, por lo que el cálculo de memoria de caché no es posible con precisión).
- VRAM estimada en cuantización de 8 bits: aproximadamente 26-30 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 14-16 GB, lo que permitiría ejecutarlo en GPUs de consumo de gama alta si se generan pesos GGUF (no publicados en el repositorio).
- GPUs recomendadas: A100 80GB o H100 para FP16; 2x RTX 4090 (24 GB cada una) para FP16 con sharding; una única RTX 4090 o RTX 3090 viable con cuantización de 4-8 bits.
- Despliegue: vLLM, TGI o SGLang para safetensors en servidor; llama.cpp u Ollama si se convierte a GGUF. El repositorio no incluye pesos GGUF ni plantillas de chat de Ollama.
- Latencia y throughput: no disponibles. Al tratarse presumiblemente de una arquitectura MoE con subconjunto activo reducido, el throughput por token podría ser superior al de un denso equivalente de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/Wicked-Tutu-26B-A4B-Final | 25,8B totales (activos no confirmados) | No disponible | Roleplay NSFW/ERP, unaligned | Apache 2.0 | HuggingFace, 158 descargas, 2 likes |
| google/gemma-4-26B-A4B-it (modelo base) | 25,8B totales | No disponible | Asistente general alineado | Gemma (consultar términos del modelo base) | HuggingFace, modelo oficial |
| Otros finetunes de roleplay sobre modelos de ~24-30B | No disponible | No disponible | Roleplay NSFW | Variable | No disponible en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría (finetunes NSFW sobre modelos de 20-30B) no está disponible: no se han publicado benchmarks ni datos de rendimiento que permitan una tabla comparativa fiable.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está marcado como NSFW y `not-for-all-audiences`; no debe exponerse a menores ni usarse en productos sin control de edad.
- Comportamiento "unaligned": el ajuste reduce los rechazos, lo que implica mayor probabilidad de generar contenido dañino, ilegal o éticamente problemático si se usa sin moderación externa.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en roleplay puede manifestarse como incoherencias de personaje, saltos narrativos o invención de hechos.
- Idioma: solo declara inglés; el rendimiento en castellano no está garantizado y probablemente sea degradado.
- Contexto: se desconoce la ventana real de contexto del ajuste; aunque el modelo base pueda soportar ventanas amplias, no hay confirmación de que el finetune las preserve.
- Licencia: el repositorio declara Apache 2.0, pero al derivar de google/gemma-4-26B-A4B-it conviene verificar los términos del modelo base (Gemma tiene su propia licencia de uso) antes de un despliegue comercial.
- Sesgos: no documentados por el autor; los finetunes de roleplay suelen arrastrar sesgos de género, estereotipos y representaciones problemáticas de la violencia y la sexualidad.
- Sin datos de entrenamiento: la ausencia de información sobre el dataset impide evaluar riesgo de memorización, contaminación o contenido ilegal en los datos de ajuste.
- Trazabilidad y soporte: 158 descargas y 2 likes; proyecto de nicho sin garantías de mantenimiento ni actualizaciones.

## Enlaces

- HuggingFace: https://huggingface.co/ReadyArt/Wicked-Tutu-26B-A4B-Final
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
