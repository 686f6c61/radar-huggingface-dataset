# mradermacher/gemma-4-26B-A4B-it-abliterated-v3-i1-GGUF

## Resumen

`mradermacher/gemma-4-26B-A4B-it-abliterated-v3-i1-GGUF` es una versión cuantizada en formato GGUF de un modelo derivado de la familia Gemma, en concreto un ajuste "abliterated" (sin censura) del modelo `gemma-4-26B-A4B-it`, publicado por el usuario `jsantillana` y cuantizado por `mradermacher`. El nombre sugiere una arquitectura Mixture of Experts (MoE) con aproximadamente 26 mil millones de parámetros totales y unos 4 mil millones activos por token (el sufijo A4B), aunque esta información no está confirmada en los datos disponibles.

El modelo base aparente es una variante instructiva de Gemma 4, y la versión "abliterated-v3" implica que se ha aplicado una técnica de eliminación de direcciones de rechazo en el espacio de activaciones para reducir las negativas del modelo ante ciertas peticiones. El repositorio contiene únicamente pesos cuantizados en GGUF, sin model card descriptiva más allá de metadatos de cuantización.

La relevancia de esta ficha es limitada por la escasez de información verificable: no hay datos publicados sobre licencia, idiomas, benchmarks ni especificaciones oficiales del modelo base en la información proporcionada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicación muy reciente o de baja difusión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE, sin confirmar) |
| Parámetros totales | 28.444.095 (dato del safetensors del repo; no coincide con el "26B" del nombre, probablemente por ser un fragmento o metadato parcial) |
| Parámetros activos | no disponible (el nombre "A4B" sugiere ~4B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de información verificable sobre la arquitectura del modelo base. El nombre `gemma-4-26B-A4B-it` sugiere una arquitectura Mixture of Experts con 26 mil millones de parámetros totales y 4 mil millones activos, pero no hay confirmación en la información proporcionada. La variante "abliterated-v3" indica que se ha aplicado una técnica de abliteración (eliminación de la dirección de rechazo en el espacio de activaciones) sobre el modelo instructivo original, presumiblemente mediante ajuste o modificación de pesos.

El proceso de cuantización ha sido realizado por `mradermacher` utilizando cuantizaciones ponderadas con imatrix, lo que típicamente mejora la calidad de las cuantizaciones de baja precisión (Q2, Q3, IQ1, IQ2). No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO en el modelo original.

## Capacidades

- Generación de texto instructiva (el sufijo "it" indica ajuste para instrucciones).
- Razonamiento y conversación multi-turno (presumible por el ajuste instructivo).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Efecto de la abliteración: se espera una reducción de las negativas del modelo ante peticiones que el modelo original rechazaría, aunque esto no está documentado en la información disponible.

## Casos de uso

- Experimentación con modelos sin censura: investigadores interesados en estudiar el efecto de la abliteración sobre el comportamiento del modelo pueden usar estas cuantizaciones para ejecutar el modelo en hardware de consumo y comparar respuestas con la versión original.
- Despliegue en hardware limitado: las cuantizaciones Q2/IQ2 y Q3 permiten ejecutar un modelo de ~26B (o ~4B activos si es MoE) en GPUs de consumo con 8-12 GB de VRAM, facilitando pruebas locales.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido que el modelo original podría rechazar por sus filtros de seguridad, aunque con las advertencias éticas y legales correspondientes.
- Investigación sobre alineación y seguridad: análisis de cómo la eliminación de la dirección de rechazo afecta a la utilidad y a los sesgos del modelo en distintas tareas.
- Prototipado rápido con llama.cpp/Ollama: al estar en GGUF, se integra fácilmente en herramientas de inferencia local para pruebas de concepto.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un amplio espectro de cuantizaciones (desde IQ1_S hasta Q6_K), lo que permite estudiar el compromiso entre tamaño, velocidad y calidad en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, asumiendo ~26B totales):
  - IQ1_S / IQ1_M / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: aproximadamente 7-10 GB.
  - Q2_K / Q2_K_S / Q3_K_S / IQ3_XXS / IQ3_XS: aproximadamente 10-13 GB.
  - Q3_K_M / IQ3_M / IQ3_S / Q3_K_L: aproximadamente 13-16 GB.
  - Q4_0 / Q4_1 / Q4_K_S / IQ4_XS / small-IQ4_NL: aproximadamente 15-18 GB.
  - Q4_K_M / Q5_K_S / Q5_K_M: aproximadamente 18-22 GB.
  - Q6_K: aproximadamente 22-25 GB.
  - (Estimaciones orientativas; no confirmadas por el autor.)
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones medias-altas; A100/H100 para Q6_K o precisión completa.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2-Q4 en GPUs de 12-16 GB; Q5-Q6 requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, entre otros compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/gemma-4-26B-A4B-it-abliterated-v3-i1-GGUF | ~26B (nombre), 28.444.095 (safetensors) | no disponible | no disponible | GGUF | Hugging Face |
| gemma-4-26B-A4B-it (base, presumible) | ~26B | no disponible | no disponible | safetensors | no confirmado |
| Otras variantes abliterated de Gemma | no disponible | no disponible | no disponible | GGUF/safetensors | Hugging Face |

No se dispone de información suficiente para una comparativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- La abliteración elimina o reduce los mecanismos de rechazo del modelo, lo que puede aumentar el riesgo de generar contenido dañino, ofensivo o ilegal. No se recomienda su uso en producción sin filtros externos.
- Riesgo de alucinación: no evaluado en la información disponible; los modelos abliterated pueden mostrar comportamientos menos alineados y mayor propensión a inventar datos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. El modelo base Gemma suele tener licencia propia con restricciones; verificar antes de cualquier uso comercial.
- Idiomas no documentados: no se puede garantizar el rendimiento en castellano u otros idiomas.
- El dato de parámetros totales del safetensors (28.444.095) no coincide con el "26B" del nombre, lo que sugiere que el metadato puede ser parcial o erróneo; no se debe tomar como spec fiable.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de calidad.
- Sin benchmarks publicados: no hay evidencia de rendimiento frente a alternativas.
- El uso de cuantizaciones muy bajas (IQ1, IQ2) degrada notablemente la calidad; se recomienda Q4_K_M o superior para uso práctico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-abliterated-v3-i1-GGUF
- Modelo base citado en la model card: https://huggingface.co/jsantillana/gemma-4-26B-A4B-it-abliterated-v3
