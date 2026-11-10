# JerryKingNo1/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una cuantización GGUF en formato Q4_K_M de un modelo de lenguaje de aproximadamente 9.197 millones de parámetros (9,2 B), derivado de la familia Qwen3.5 y publicado por el usuario JerryKingNo1 en Hugging Face. El modelo se presenta como una variante "abliterated" (sin censura), obtenida a partir del repositorio intermedio `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`. El nombre comercial mezcla referencias a DeepSeek y a Qwen, pero la model card no documenta la composición real del entrenamiento ni confirma qué pesos base se han utilizado.

El interés técnico de esta publicación no reside en el modelo en sí, sino en la corrección de un fallo de conversión: el GGUF original generado por mradermacher declaraba `mtp_num_hidden_layers=1` en `config.json` (33 capas, incluida la capa de borrador MTP) pero había perdido los 15 tensores `mtp.*` durante la conversión, lo que provocaba que llama.cpp fallara al cargar con el error `missing tensor blk.32.attn_norm.weight`. Esta versión se reconvierte desde los safetensors corregidos del autor upstream, que restauran `model-mtp.safetensors`, de modo que el modelo puede cargarse y ejecutarse en llama.cpp.

No hay información publicada sobre arquitectura interna, datos de entrenamiento, benchmarks ni idiomas soportados más allá de las etiquetas de Hugging Face. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño total es de 5,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | other (sin detallar términos) |
| Formato de pesos | GGUF (safetensors en el repositorio upstream) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo. La model card no describe el tipo de transformer, el número de capas, la dimensión oculta ni el mecanismo de atención. La única referencia arquitectónica concreta es la presencia de una capa MTP (multi-token prediction) de borrador, indicada por `mtp_num_hidden_layers=1` y por los 15 tensores `mtp.*` que se restauraron en esta conversión. La existencia de MTP sugiere soporte para decodificación especulativa en llama.cpp, aunque no se documenta su uso efectivo.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. La etiqueta "abliterated" indica que se ha aplicado alguna técnica de eliminación de direcciones de rechazo en el espacio de activaciones, pero no se especifica el método ni su alcance. La etiqueta "heretic" y el nombre "DeepSeek-V4-Pro" no van acompañados de documentación que los respalde.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Generación de texto autoregresiva estándar en llama.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidad de decodificación especulativa potencial gracias a la capa MTP restaurada, aunque no verificada.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad multilingüe específica.
- No se documenta visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Experimentación con modelos "abliterated": el modelo permite estudiar el comportamiento de un modelo sin rechazos en entornos de investigación controlados, comparando respuestas frente a la variante original.
- Pruebas de carga en llama.cpp: sirve como caso de validación de la corrección del bug de tensores MTP y de la integración de capas de borrador en el pipeline de llama.cpp.
- Prototipado local en hardware de consumo: con un archivo Q4_K_M de 5,5 GB, puede ejecutarse en GPUs con 8 GB o más de VRAM para pruebas de generación de texto.
- Generación de texto creativo sin restricciones de contenido: para entornos donde se requiere explorar respuestas no filtradas, con las advertencias de seguridad correspondientes.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre el safetensors original y la versión Q4_K_M en tareas de generación libre.
- Docencia y demostraciones de conversión GGUF: ejemplifica el proceso de reconversión desde safetensors corregidos y la verificación de integridad de tensores en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB con Q4_K_M, dependiendo de la longitud de contexto y del tamaño del KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM, siempre que se limite el contexto.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por compatibilidad GGUF también Ollama y otros runners basados en llama.cpp. No se documenta soporte en vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (este) | 9,2 B | no disponible | other | GGUF Q4_K_M | Variante abliterated, corrección de tensores MTP |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo base oficial de Alibaba, con benchmarks publicados |
| Llama 3.1 8B Instruct | 8,0 B | 131.072 tokens | Llama 3.1 Community | safetensors, GGUF | Amplia documentación y ecosistema |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia de modelos densos de 7B |

La comparación con estos modelos es orientativa: no hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación sobre entrenamiento, datos y evaluación: no es posible verificar la calidad, los sesgos ni el comportamiento real del modelo.
- Riesgo elevado de alucinación y de respuestas incoherentes, dado que no hay benchmarks ni evaluación publicada.
- El nombre del modelo mezcla referencias a DeepSeek y Qwen sin aclarar la procedencia real de los pesos; no debe asumirse que sea un modelo oficial de ninguna de las dos familias.
- La variante "abliterated" elimina los mecanismos de rechazo, lo que puede producir contenido dañino, ilegal o inexacto sin advertencia.
- Licencia "other" sin términos publicados: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Contexto máximo no documentado; el uso con contextos largos puede degradar el rendimiento o fallar.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- La corrección del bug de MTP está documentada solo en la model card; conviene verificar la integridad de los tensores antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/JerryKingNo1/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo upstream: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
