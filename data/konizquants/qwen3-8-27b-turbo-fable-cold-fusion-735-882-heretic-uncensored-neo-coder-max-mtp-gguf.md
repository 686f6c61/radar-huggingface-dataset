# konizquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario konizquants a partir de un ajuste fino de DavidAU sobre la familia Qwen3, con 26.895.998.464 parámetros reales (≈26,9 mil millones) y licencia Apache 2.0. El repositorio no contiene pesos originales en precisión completa, sino variantes GGUF "regular" y "MTP" generadas con imatrix y "DI-MATRIX" (doble imatrix), con un tamaño de repositorio de 389 GB.

El modelo subyacente es un ajuste fino en múltiples etapas ("multi-stage tune" y "multi-state merge") que combina técnicas propietarias denominadas COLD FUSION (GAIN + Unsloth) y Fable Fusion 711. Sus objetivos declarados son aumentar la inteligencia general, reducir el bloque de razonamiento entre 1/2 y 1/10 respecto a Qwen 3.8 27B (mediana declarada de 2/3), acelerar la generación de tokens mediante MTP (multi-token prediction) y mantener o elevar los benchmarks. El autor lo presenta como un modelo orientado a código, escritura creativa, rol y razonamiento, con tres modos de pensamiento.

La relevancia del repositorio radica en que ofrece pesos cuantizados de un modelo de 27B que, según la model card, alcanza ARC-C 735 en 8 bits y 719 en 4 bits, lo que lo situaría en el rango declarado de modelos cerrados. Estas cifras proceden exclusivamente de la documentación del autor, no se han verificado de forma independiente y el repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un artefacto sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de la familia Qwen3 (según la model card); no se detallan capas, atención ni configuración interna: no disponible |
| Parametros totales | 26.895.998.464 (≈26,9 mil millones) |
| Parametros activos | No procede: no se indica que sea un modelo MoE (no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en variantes "regular" y "MTP", con imatrix y DI-MATRIX (doble imatrix); el autor cita ejemplos en Q4 (Q4KS) y afirma resultados en 4 y 8 bits; el modelo base se distribuye en bfloat16 |
| Idiomas soportados | Inglés (en) y chino (zh), según los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo de origen en safetensors/bfloat16 |
| Tamano del repositorio | 389,0 GB |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Fecha de creacion (metadatos) | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer denso de 27B derivado de Qwen3, construido mediante un proceso de ajuste fino y fusión en múltiples etapas. No se proporcionan datos sobre número de capas, cabezas de atención, tipo de atención (completa, lineal o híbrida), tamaño del vocabulario ni configuración del tokenizador, por lo que la arquitectura interna concreta queda como no disponible. El autor menciona tres modos de operación de pensamiento y una decodificación basada en MTP (multi-token prediction) destinada a acelerar la generación, pero no especifica el runtime que la soporta ni el factor de aceleración medido.

En cuanto al entrenamiento, se citan dos métodos propietarios: COLD FUSION, descrito como la combinación del componente "GAIN" (un programa que modifica dinámicamente el entrenamiento muestra a muestra en tiempo real según aprende el modelo) con los entrenadores de Unsloth, y Fable Fusion 711. Los conjuntos de datos declarados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. El autor afirma explícitamente que no se ha hecho "benchmaxing" y que el ajuste está orientado a reducir el sobredimensionamiento del bloque de razonamiento. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto conversacional en inglés y chino, con soporte declarado de razonamiento en modo "thinking" y tres modos de operación diferenciados.
- Generación de código y tareas de programación, enfatizadas por el sufijo NEO-CODER MAX y las etiquetas "coder" y "all use cases".
- Escritura creativa, narrativa, ficción y roleplaying, según las etiquetas "creative writing", "all genres", "story" y "roleplaying".
- Reducción del consumo de tokens de pensamiento: el autor declara recortes de entre 1/2 y 1/10 respecto a Qwen 3.8 27B, con una mediana aproximada de 2/3.
- Decodificación mediante MTP (multi-token prediction) para acelerar la generación de tokens.
- Modelo "abliterated" / "uncensored" mediante técnicas denominadas heretic y ara: se ha eliminado total o parcialmente el comportamiento de rechazo ante peticiones que el modelo base denegaría.
- Compatibilidad declarada con endpoints (etiqueta "endpoints_compatible").
- La etiqueta de pipeline es "image-text-to-text", lo que sugeriría entrada de imagen y texto, pero ni las etiquetas ni la model card describen capacidades de visión: discrepancia sin resolver, tratar como no disponible.
- No se documenta soporte explícito de tool calling, function calling ni de flujos de agente multi-paso en la información disponible, aunque el autor menciona en un aviso que la pestaña "community" incluye "third party benchmarks" con resultados de tool calling sin cifras concretas.

## Casos de uso

- Generación de código en producción: el modelo está afinado específicamente para código (NEO-CODER MAX) y puede usarse como asistente de autocompletado y refactorización en IDE o como generador de parches dentro de pipelines de integración continua. Al ser GGUF, se despliega en servidores con llama.cpp sin necesidad de GPUs de datacenter.
- Escritura creativa y narrativa larga: el ajuste incluye datasets orientados a ficción de todos los géneros, con lo que resulta adecuado para generar relatos, tramas y diálogos con alto nivel de detalle, tal como ilustran los ejemplos incluidos en la model card.
- Roleplaying y personajes persistentes: los modos de razonamiento y la reducción del bloque de pensamiento permiten mantener conversaciones multi-turno con menor latencia y menor coste por respuesta que el modelo base, útil en aplicaciones de entretenimiento conversacional.
- Generación de documentación técnica y comentarios de código: combinando la capacidad de código y la de redacción, puede producir documentación de API, guías de integración y mensajes de commit a partir de diffs.
- Razonamiento asistido con presupuesto de tokens ajustado: para entornos con límites estrictos de tokens de salida (por ejemplo, APIs de bajo coste), la reducción declarada del bloque de pensamiento permite mantener calidad con menos tokens consumidos.
- Procesamiento de texto en inglés y chino: aplicaciones de traducción, resumen o atención al cliente bilingüe en esos dos idiomas, que son los únicos declarados en los metadatos.
- Experimentación e investigación sobre alineación y "abliteration": al ser un modelo "uncensored" derivado de Qwen3, sirve como sujeto de estudio para analizar cómo las técnicas de abliteration afectan al rendimiento y a los sesgos, siempre en entornos controlados.
- Despliegue local en hardware de consumo: las cuantizaciones de 4 bits permiten ejecutar un modelo de 27B en una GPU de gama alta de consumo, lo que habilita prototipado sin coste de API.

## Benchmarks y rendimiento

La model card declara los siguientes resultados. No se especifica metodología, versión del harness ni condiciones de evaluación, y no hay verificación independiente en la información disponible.

| Benchmark | Valor declarado por el autor | Nota |
|---|---|---|
| ARC-C (8 bits) | 735 | El autor afirma que es el primer fine tune en superar 730 |
| ARC-C (4 bits) | 719 | Sobre cuantización de 4 bits (1/4 de precisión completa) |
| ARC-E | 880 | El autor lo sitúa en la "zona de inteligencia" de OpenAI, Claude y Gemini |
| Comparación global | Supera, según el autor, los 7 benchmarks críticos de Qwen 3.8 27B, Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B | Sin tabla de resultados publicada en la información disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible. Tampoco se aportan cifras de latencia, throughput ni de la aceleración real obtenida con MTP.

## Requisitos de hardware

Las siguientes estimaciones se derivan del recuento de parámetros (26,9 mil millones) y no de mediciones publicadas por el autor:

- Precisión completa (bf16/fp16): aproximadamente 54 GB solo para pesos, más caché KV y overhead; requiere 1x H100 80 GB, 2x A100 40 GB o 1x A6000 48 GB con margen limitado.
- Cuantización de 8 bits (Q8_0): aproximadamente 28-29 GB de pesos; encaja en 1x A100 40 GB o en 2x RTX 4090 de 24 GB.
- Cuantización de 4 bits (Q4_K_M): aproximadamente 15-16 GB de pesos; cabe en una RTX 4090, RTX 3090 o RTX 4080 de 16 GB, aunque con contexto largo la caché KV puede agotar la VRAM.
- El autor afirma que el modelo está pensado para hardware de consumo y que fue entrenado en hardware de consumo mediante Unsloth, pero no publica requisitos mínimos concretos.
- La longitud de contexto no está disponible, por lo que no es posible estimar el consumo de VRAM de la caché KV en escenarios de contexto largo.
- Opciones de despliegue para los GGUF de este repositorio: llama.cpp, Ollama y LM Studio. Para el modelo base en safetensors: vLLM o TGI, si bien no se documenta compatibilidad específica.
- La variante MTP requiere un runtime que soporte multi-token prediction; no se especifica cuál ni qué ganancia de throughput aporta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información disponible solo permite comparar contra los modelos que el propio autor cita. No se aportan especificaciones de licencia ni de contexto de esos modelos en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (NEO-CODER MAX MTP GGUF) | 26,9 B (dato real) | no disponible | ARC-C 735 (8 bits) / 719 (4 bits); ARC-E 880 | Apache 2.0 | Repositorio GGUF con 0 descargas |
| Qwen 3.8 27B (modelo base de referencia) | 27 B (según nomenclatura) | no disponible | Inferior en los 7 benchmarks críticos, según el autor | no disponible | no disponible |
| Qwen3.6 27B | no disponible | no disponible | Inferior, según el autor | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35 B totales, A3B activos (MoE) | no disponible | Inferior, según el autor | no disponible | no disponible |
| Qwen 3.5 27B | no disponible | no disponible | Inferior, según el autor | no disponible | no disponible |

No se dispone de datos verificables de MMLU, HumanEval o GSM8K para ninguno de estos modelos en la información proporcionada, por lo que la comparación se limita a afirmaciones del autor sin respaldo numérico detallado.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": se ha reducido o eliminado el comportamiento de rechazo. No es adecuado para despliegues de cara al público sin una capa de moderación externa, y puede generar contenido ofensivo, ilegal o dañino.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual ni de calibración de la confianza.
- Cobertura idiomática limitada a inglés y chino según los metadatos; el comportamiento en castellano no está documentado y probablemente sea inferior.
- Las afirmaciones de rendimiento (ARC-C 735, ARC-E 880, superioridad en 7 benchmarks) provienen únicamente de la model card del autor, sin metodología, sin réplicas independientes y sin verificación por terceros.
- El repositorio acumula 0 descargas y 0 likes, con fecha de creación en los metadatos del 22 de septiembre de 2026: no existe validación comunitaria ni histórico de uso.
- Tamaño del repositorio de 389 GB: la descarga completa es inviable para la mayoría de usuarios; conviene seleccionar una única cuantización.
- Licencia Apache 2.0 declarada, pero derivada de la familia Qwen3 y de un modelo base de terceros (DavidAU): conviene verificar las condiciones de la cadena completa antes de uso comercial.
- Cadena de dependencias larga (varios ajustes finos y fusiones sucesivas) con documentación técnica parcial: es difícil atribuir comportamientos concretos a una etapa específica del entrenamiento.
- La etiqueta de pipeline "image-text-to-text" sugiere capacidades multimodales que no se describen en ningún otro punto de la model card: verificar antes de asumir soporte de visión.
- No se documentan mecanismos de tool calling ni de uso agéntico, pese a que el autor menciona en un aviso la existencia de pruebas de terceros sobre tool calling sin publicar cifras.
- Las técnicas COLD FUSION, Fable Fusion 711, GAIN y DI-MATRIX son propietarias y no están descritas con suficiente detalle para reproducir el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/konizquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo predecesor citado por el autor (Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Conjuntos de datos citados: DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets (rutas en HuggingFace no verificadas en la información disponible)
- La búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo: los resultados obtenidos tratan sobre Wikipedia y no guardan relación con la ficha. No se dispone de papers, blogs ni demos adicionales.
