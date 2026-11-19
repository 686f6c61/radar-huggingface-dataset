# daemonix/GLM-5.3-Flash-abliterated-Q4-GGUF-antirez-DS4

## Resumen

GLM-5.3-Flash-abliterated-Q4-GGUF-antirez-DS4 es una conversión a formato GGUF Q4_K del checkpoint abliterado GLM-5.3-Flash, publicada por el usuario daemonix y empaquetada específicamente para el motor de inferencia DS4 (DwarfStar) de antirez, con backend Metal para Apple Silicon. El modelo original procede de Z.ai (GLM-5.3-Flash) y la abliteración (eliminación direccional del comportamiento de rechazo) fue realizada por mrfakename. Esta variante no introduce cambios en los pesos más allá de la cuantización y el reempaquetado para DS4.

Se trata de un modelo multimodal image-text-to-text de gran escala: el checkpoint en safetensors declara 320.759.404.382 parámetros totales, lo que lo sitúa en la categoría de modelos densos de más de 300 mil millones de parámetros. El repositorio ocupa 192 GB e incluye el archivo principal Q4_K (aproximadamente 190,88 GB / 177,77 GiB) más un codificador visual BF16 separado de unos 1,13 GB. La conversión conserva embeddings, cabeza de salida y tensores de atención lineal en BF16 nativo, mientras que los expertos enrutados se cuantizan a Q4_K.

Su relevancia es doble: por un lado, permite ejecutar un modelo de 320B en hardware Apple Silicon de gama alta (validado en un Mac M3 Ultra con 512 GiB de memoria unificada); por otro, ofrece una variante sin rechazos orientada a investigación sobre alineamiento, seguridad y comportamiento de modelos abliterados. La licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atención lineal y bloque MTP embebido; detalles completos de la arquitectura base no disponibles |
| Parámetros totales | 320.759.404.382 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de ejecución usa `--ctx 32768`) |
| Tipos de cuantización | Q4_K (expertos enrutados); BF16 nativo en embeddings, cabeza de salida y tensores de atención lineal; formatos de mayor precisión en proyecciones de atención y expertos compartidos; existe también una versión Q2 publicada por separado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (un único archivo principal más codificador visual GGUF separado) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base GLM-5.3-Flash más allá de su naturaleza multimodal (procesa imagen y texto) y de la presencia de tensores de atención lineal, expertos enrutados y expertos compartidos, lo que sugiere una estructura con componentes de mezcla de expertos. El bloque MTP (multi-token prediction) está incluido en el archivo GGUF y puede activarse con el flag `--mtp` para decodificación especulativa con un borrador embebido.

El proceso de abliteración aplicado por mrfakename elimina direccionalmente el comportamiento de rechazo manteniendo el mismo formato y layout FP8/BF16 que el original, de modo que carga en cualquier entorno donde cargue el modelo base. La conversión a Q4_K se realizó directamente desde el checkpoint abliterado FP8/BF16 sin matriz de activación (imatrix). No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original.

## Capacidades

- Generación de texto conversacional en modo chat y en modo razonamiento (thinking).
- Procesamiento de imágenes mediante el codificador visual separado, con pipeline image-text-to-text.
- Razonamiento multi-paso con modo thinking, incluyendo la posibilidad de usar el bloque MTP para decodificación especulativa.
- Capacidades de código: la model card menciona explícitamente la retención de habilidad de programación como criterio de selección del checkpoint.
- Comportamiento sin rechazos (abliterado): responde a peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un sistema abliterado a gran escala, comparando tasas de rechazo y calidad de respuesta frente al checkpoint original en entornos controlados.
- Evaluación de cuantización Q4 en modelos de 320B: sirve para medir la pérdida de calidad de Q4_K frente a FP8/BF16 en tareas de razonamiento y código, usando el motor DS4 como referencia.
- Inferencia local en Apple Silicon de gama alta: con 512 GiB de memoria unificada (M3 Ultra) el modelo Q4 cabe y se ejecuta vía Metal, lo que permite desplegar un modelo de 320B sin GPUs dedicadas.
- Análisis de imágenes con contexto textual: gracias al codificador visual separado, puede emplearse para descripción de imágenes, extracción de información de documentos escaneados o preguntas sobre capturas, siempre que se active `--vision`.
- Generación de código en pipelines internos: la retención de capacidad de programación declarada por el autor lo hace apto para tareas de autocompletado y revisión de código en entornos donde la licencia MIT y la ausencia de rechazos sean aceptables.
- Experimentación con decodificación especulativa: el bloque MTP embebido permite probar técnicas de aceleración de inferencia y medir su impacto en latencia sobre hardware Apple.
- Prototipado de asistentes conversacionales sin restricciones de contenido: útil en entornos de investigación creativa o generación de contenido donde los filtros del modelo base resultan un obstáculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este modelo Q4 ni de la conversión DS4 en la información disponible. La model card incluye únicamente resultados de abliteración del checkpoint upstream (no de esta cuantización) medidos sobre DeepSeek V4.1 Flash, que se reproducen a modo de contexto y no deben interpretarse como rendimiento de este modelo:

| Test (DeepSeek V4.1 Flash, no este modelo) | Original | Mrfakename | Pqhaz heretic | MoonMath |
|---|---:|---:|---:|---:|
| HarmBench chat | 16,3% | 93,8% | 93,8% | 92,1% |
| HarmBench thinking | 3,8% | 86,7% | 72,9% | 82,5% |
| MITRE substantive assistance | 16,2% | 84,2% | 82,8% | 83,1% |
| Rechazos ante prompts benignos | no reportado | 0/750 | 0/750 | 0/750 |

El autor advierte explícitamente que estos datos corresponden a checkpoints completos de DeepSeek V4.1 Flash probados con SGLang en una H200, no a esta conversión GLM ni a su cuantización Q4, y que no evalúan retención de conocimiento ni de código.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo Q4_K ocupa aproximadamente 190,88 GB (177,77 GiB) más 1,13 GB del codificador visual; se necesita memoria unificada o VRAM suficiente para alojar el modelo completo más el contexto.
- Validación oficial: el autor verificó la inferencia greedy con Metal y el bloque MTP en un Mac M3 Ultra con 512 GiB de memoria unificada.
- GPUs recomendadas: no disponibles en la información proporcionada; el empaquetado está orientado a DS4 con backend Metal en Apple Silicon.
- ¿Cabe en GPU de consumo? No en tarjetas consumer convencionales (24 GB o menos); requiere hardware de gama alta con memoria muy superior.
- Opciones de despliegue: motor DS4 (DwarfStar) de antirez con backend Metal; otros motores GGUF no están documentados para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (GLM-5.3-Flash-abliterated Q4 DS4) | 320,76B | no disponible | GGUF Q4_K | MIT | Abliterado, empaquetado para DS4/Metal |
| mrfakename/GLM-5.3-Flash-abliterated | no disponible | no disponible | FP8/BF16 | MIT | Checkpoint upstream abliterado, misma familia |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | Modelo original de Z.ai, con rechazos |
| mrfakename/GLM-5.3-Flash-abliterated-GGUF | no disponible | no disponible | GGUF | MIT | Quants GGUF alternativos del mismo checkpoint |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: la eliminación del comportamiento de rechazo implica que puede generar contenido dañino, ilegal o inseguro; no es apto para despliegues públicos sin filtros externos.
- Riesgo de alucinación: no evaluado en esta conversión; el autor señala que la abliteración no garantiza la retención de conocimiento.
- Razonamiento incompleto: en las pruebas relacionadas con DeepSeek V4.1 Flash, el checkpoint de mrfakename produjo 21 casos sin respuesta final por agotar el presupuesto de tokens razonando; el problema no se elimina con la abliteración.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- La validación realizada cubre únicamente carga e inferencia básica (1.412 layouts de tensores, 90 payloads abliterados y 36 expertos muestreados verificados byte a byte), no una evaluación amplia de calidad.
- Los benchmarks incluidos en la model card corresponden a otro modelo (DeepSeek V4.1 Flash) y no miden esta conversión Q4 ni DS4.
- Requiere una versión reciente de DS4 con soporte para GLM-5.3 Flash; motores GGUF alternativos no están validados.
- Licencia MIT permite uso comercial, pero la responsabilidad legal y ética del contenido generado recae en el desplegador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/daemonix/GLM-5.3-Flash-abliterated-Q4-GGUF-antirez-DS4
- Modelo base abliterado: https://huggingface.co/mrfakename/GLM-5.3-Flash-abliterated
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Quants GGUF alternativos: https://huggingface.co/mrfakename/GLM-5.3-Flash-abliterated-GGUF
- Motor DS4 (DwarfStar): https://github.com/antirez/ds4
- Documentación de modelos de DS4: https://github.com/antirez/ds4/blob/main/docs/MODELS.md
- Comparativa DeepSeek V4.1 Flash en Reddit: https://www.reddit.com/r/LocalLLaMA/comments/1xyv1oc/
- Discord del autor: https://discord.com/invite/foss
