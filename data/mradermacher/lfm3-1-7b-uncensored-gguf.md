# mradermacher/LFM3-1.7B-Uncensored-GGUF

## Resumen

LFM3-1.7B-Uncensored-GGUF es una colección de cuantizaciones en formato GGUF del modelo OpenIntelligenceNet/LFM3-1.7B-Uncensored, publicada por mradermacher. El modelo base deriva de la familia LFM3 de Liquid AI, una arquitectura híbrida (etiquetada como `hybrid-architecture` en los tags) orientada a despliegue en el borde (`edge-ai`), y ha sido modificado mediante técnicas de abliteration/decensoring (`heretic`, `abliterated`, `uncensored`) para eliminar los mecanismos de rechazo del modelo original. Cuenta con 1.728.801.600 parámetros totales según los pesos en safetensors.

El aporte de esta ficha no es un modelo nuevo, sino el trabajo de cuantización estática de mradermacher, que ofrece doce variantes GGUF desde Q2_K (0,9 GB) hasta f16 (3,6 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidos equipos de consumo sin GPU dedicada. La relevancia actual reside en la combinación de un modelo pequeño con arquitectura híbrida y una versión sin censura, lo que lo hace atractivo para experimentación con roleplay, generación creativa sin filtros y despliegue local en entornos con recursos limitados.

No se dispone de información sobre la longitud de contexto, la licencia ni los detalles del entrenamiento original en la documentación proporcionada; el autor de la cuantización no incluye la model card completa del modelo base, solo referencias al repositorio de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (tag `hybrid-architecture`; detalles concretos no disponibles) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM3 de Liquid AI, etiquetada como `hybrid-architecture` y `edge-ai`, lo que sugiere una combinación de capas de atención y mecanismos de estado recurrente o convolucional diseñados para reducir el coste computacional en inferencia. No obstante, la información proporcionada no detalla la proporción exacta de capas, el tipo de atención ni la composición del dataset de entrenamiento. El modelo ha sido sometido a un proceso de abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) que da lugar a la variante `Uncensored`, y el tag `heretic` apunta al uso de la herramienta Heretic para dicho proceso.

El trabajo de mradermacher consiste en cuantizaciones estáticas (no weighted/imatrix; estas últimas se publican en un repositorio separado `LFM3-1.7B-Uncensored-i1-GGUF`). No se especifica el número de tokens de entrenamiento, la presencia de RLHF/DPO ni innovaciones técnicas adicionales como decodificación especulativa. El tag `reasoning` sugiere capacidades de razonamiento, pero no se documenta el mecanismo.

## Capacidades

- Generación de texto causal y conversacional (`text-generation`, `conversational`, `causal-lm`).
- Razonamiento (`reasoning` según los tags del autor).
- Roleplay y generación creativa sin restricciones de contenido, gracias al proceso de decensoring.
- Capacidades multilingües limitadas al inglés (`language: en`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Roleplay y narrativa interactiva local: el modelo, al estar decensored, permite conversaciones multi-turno sin rechazos temáticos, y su tamaño de 1,7 B parámetros posibilita ejecutarlo en portátiles con 8 GB de RAM usando Q4_K_M (1,2 GB).
- Generación creativa sin filtros: escritura de ficción, guiones o contenido para adultos donde los modelos alineados rechazarían la petición; la cuantización Q6_K (1,5 GB) ofrece un buen equilibrio calidad/tamaño.
- Prototipado de chatbots en el borde: despliegue en dispositivos con recursos limitados (Raspberry Pi 5, mini-PC) mediante llama.cpp u Ollama, aprovechando la arquitectura híbrida orientada a edge-ai.
- Experimentación con técnicas de abliteration: investigadores pueden comparar el comportamiento del modelo base frente a la variante uncensored para estudiar la eficacia del proceso de eliminación de rechazos.
- Evaluación de cuantizaciones: el repositorio ofrece doce variantes que permiten medir la degradación de perplejidad entre Q2_K y f16 en un modelo pequeño, útil para calibrar pipelines de cuantización.
- Filtrado y generación de datos sintéticos en inglés: con Q8_0 (1,9 GB) se puede generar texto a buen throughput en CPU para tareas de aumento de dataset, siempre que el contenido no requiera alineación de seguridad.
- Asistente personal offline: integración en aplicaciones de escritorio o móviles que requieran privacidad total, sin llamadas a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB. Añadir overhead de contexto (KV cache) según la longitud de contexto efectiva, no documentada.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM puede ejecutar Q4_K_M con contexto moderado; RTX 3060/4060, RTX 4090, A100 o H100 no son necesarias y quedan sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, etc.); también en CPU pura con 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa (requerirían el modelo base en safetensors).
- Latencia y throughput: no disponibles en la información proporcionada; en CPU moderna se espera decenas de tokens/s para Q4_K_M en un modelo de 1,7 B, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Uncensored-GGUF | 1,73 B | no disponible | no disponible | GGUF | Variante decensored de LFM3 |
| OpenIntelligenceNet/LFM3-1.7B-Uncensored | 1,73 B | no disponible | no disponible | safetensors | Modelo base sin cuantizar |
| mradermacher/LFM3-1.7B-Uncensored-i1-GGUF | 1,73 B | no disponible | no disponible | GGUF (imatrix) | Cuantizaciones ponderadas, mayor calidad por tamaño |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma familia en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration/decensoring elimina los rechazos de seguridad, por lo que el modelo puede generar contenido dañino, ilegal o sexualmente explícito; no es apto para producción orientada al público sin capas de moderación externas.
- Riesgo elevado de alucinación: con 1,7 B parámetros, la fiabilidad factual es limitada; no debe usarse como fuente de verdad.
- Solo soporta inglés; el rendimiento en castellano no está validado y probablemente sea deficiente.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; verificar la licencia del modelo base (Liquid AI) antes de cualquier despliegue comercial.
- Longitud de contexto no documentada; asumir ventanas cortas (probablemente 32K o menos según la familia LFM3, pero sin confirmación).
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; para uso serio, emplear Q4_K_M o superior.
- El repositorio tiene pocas descargas (1.279) y un solo like, lo que indica escasa validación comunitaria.
- El tag `custom_code` implica que la carga requiere `trust_remote_code=True` en transformers, con el riesgo de seguridad asociado.

## Enlaces

- Hugging Face (cuantizaciones estáticas): https://huggingface.co/mradermacher/LFM3-1.7B-Uncensored-GGUF
- Hugging Face (cuantizaciones imatrix): https://huggingface.co/mradermacher/LFM3-1.7B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/LFM3-1.7B-Uncensored
- Página de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-Uncensored-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
