# IndexTeam/Index-Translate-omni-9B

## Resumen

Index-Translate-Omni 9B es un modelo multimodal de traduccion desarrollado por IndexTeam, publicado en Hugging Face bajo el identificador `IndexTeam/Index-Translate-omni-9B`. Forma parte de la familia Index-Translate-Omni, que incluye variantes de 2B, 9B y 35BA3B, y extiende el modelo puramente textual Index-Translate anadiendo capacidades de traduccion de imagen a texto, reconocimiento automatico de voz (ASR) y traduccion bidireccional chino-ingles por voz. El modelo resuelve el problema de unificar traduccion textual, traduccion de imagenes y procesamiento de voz en un unico checkpoint, manteniendo restricciones de terminologia, formato y estilo en la traduccion.

La arquitectura subyacente se apoya en los modelos Qwen3.5 (las comparativas de imagen del model card usan Qwen3.5-2B, Qwen3.5-9B y Qwen3.5-35B-A3B como referencias base), con un tronco de texto congelado y cabezas o adaptadores especificos para vision y audio. El modelo de 9B es la variante intermedia de la familia y obtiene los mejores resultados en traduccion de imagen dentro de su categoria de tamano segun los datos publicados por el autor.

Es relevante ahora porque combina en un solo modelo tareas que habitualmente requieren pipelines separados (MT + OCR + ASR + speech translation), lo que simplifica despliegues de traduccion multilingue con entrada multimodal. No obstante, la model card indica explicitamente que la subida de pesos, archivos de carga y manifiesto final sigue en curso, por lo que el repositorio (4,3 GB) no esta completo para uso inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal sobre tronco de texto congelado (familia Qwen3.5) con componentes de vision y audio; detalles exactos no disponibles |
| Parametros totales | 9B (segun denominacion del modelo) |
| Parametros activos | no disponible (no se especifica si es MoE; la variante 35BA3B si lo es) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en (chino e ingles) |
| Licencia | no disponible |
| Formato de pesos | pytorch (safetensors/bin no confirmado); repositorio de 4,3 GB |
| Pipeline | translation |
| Tareas declaradas | translation, image-to-text, automatic-speech-recognition |
| Estado del repositorio | subida en curso (pesos y manifiesto incompletos) |

## Arquitectura y entrenamiento

El modelo se presenta como un sistema multimodal que comparte un tronco de texto congelado entre las distintas tareas (texto, imagen y voz), segun la nota del autor sobre la variante 35BA3B ("comparten tronco de texto congelado"). Las comparativas de traduccion de imagen enfrentan las variantes Omni contra los modelos Qwen3.5 originales sobre las mismas muestras, lo que sugiere que Index-Translate-Omni se construye sobre dicha familia como base y anade adaptadores o cabezas para vision y audio entrenados especificamente para traduccion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). La model card solo referencia un documento de inferencia nativa (`NATIVE_INFERENCE.md`) para el uso del modelo. Tampoco se detalla el proceso de alineacion ni las tecnicas de fusion multimodal empleadas.

## Capacidades

- Traduccion de texto multilingue con soporte de restricciones de terminologia, formato y estilo, segun la descripcion del autor.
- Traduccion de imagen a texto (image-to-text): lectura y traduccion de contenido textual presente en imagenes.
- Reconocimiento automatico de voz (ASR) en chino e ingles.
- Traduccion de voz bidireccional chino-ingles (speech-to-text translation en ambos sentidos).
- Evaluacion reportada en tareas de traduccion de memes (metrica MEME) y traduccion de imagenes renderizadas (FLORES-rendered, Vistra, MMTIT).
- Capacidades multilingues limitadas a zh y en segun los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, modo de razonamiento explicito ni agentes multi-paso.

## Casos de uso

- Traduccion de documentacion tecnica con terminologia controlada: el modelo acepta restricciones de terminologia y formato, lo que permite integrarlo en pipelines de localizacion donde se exige consistencia de glosario entre versiones.
- Localizacion de interfaz de usuario a partir de capturas: gracias a la traduccion de imagen a texto, se pueden procesar mockups o capturas de aplicaciones y extraer el texto traducido sin un OCR separado.
- Subtitulado y traduccion de reuniones chino-ingles: la combinacion de ASR y traduccion de voz bidireccional permite transcribir y traducir audio en un unico paso para actas o subtitulos.
- Atencion al cliente bilingue: gestion de conversaciones en chino e ingles con traduccion de mensajes y de imagenes adjuntas (capturas, documentos escaneados) enviadas por el usuario.
- Traduccion de contenido en redes sociales y memes: la metrica MEME reportada (0.7387 en el 9B) indica que el modelo se ha evaluado especificamente en este tipo de contenido, util para moderacion o localizacion de publicaciones.
- Procesamiento de material audiovisual para e-learning: transcripcion ASR del audio y traduccion de las diapositivas mostradas en pantalla, combinando las dos modalidades de entrada.
- Traduccion de imagenes de documentos escaneados en flujos administrativos: extraccion y traduccion de texto en formularios o facturas en chino e ingles.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (no verificados de forma independiente).

Traduccion de texto:

| Modelo | FLORES COMET22↑ | WMT24++ COMET22↑ | WMT26 Judge↑ | MEME↑ |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |

Voz (CER en %, menor es mejor; traduccion como BLEU / chrF2 / CER objetivo):

| Modelo | N | ASR chino CER↓ | ASR ingles CER↓ | en→zh | zh→en |
|---|---:|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 30 | 13.8113 | 34.2560 | 36.982 / 30.357 / 43.3452 | 30.747 / 51.152 / 48.0670 |
| Index-Translate-Omni 9B | 30 | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 35BA3B | 300 | 18.6803 | 15.0850 | 42.081 / 35.836 / 49.2490 | 36.404 / 57.323 / 45.1546 |

Traduccion de imagen (COMET22 ×100, mayor es mejor; entre parentesis, numero de muestras):

| Modelo | MMTIT↑ | FLORES-rendered↑ | Vistra↑ |
|---|---:|---:|---:|
| Qwen3.5-2B | 52.164 (249) | 50.187 (120) | 55.326 (305) |
| Index-Translate-Omni 2B | 65.809 (249) | 53.612 (120) | 65.596 (305) |
| Qwen3.5-9B | 73.814 (248) | 67.804 (119) | 68.963 (305) |
| Index-Translate-Omni 9B | 77.604 (248) | 68.438 (119) | 71.815 (305) |
| Qwen3.5-35B-A3B | 75.602 (191) | 70.005 (118) | 71.067 (292) |
| Index-Translate-Omni 35BA3B | 77.011 (191) | 69.891 (118) | 71.482 (292) |

Advertencias del propio autor: los tamanos de muestra difieren entre variantes y no deben usarse para rankings cruzados; los resultados de imagen de 35BA3B reutilizan mediciones previas con 73 casos UNKNOWN; no representan una evaluacion completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa para un modelo de 9B en precision completa (fp16), se requeririan aproximadamente 18 GB solo para pesos, mas memoria para vision, audio y cache de contexto; estas cifras son una estimacion generica y no un dato del autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, un modelo de 9B en fp16 encaja en A100 40GB, H100 y RTX 4090 (24 GB) con margen limitado; en cuantizacion de 8 bits o inferior podria caber en GPUs consumer de 16 GB, pero no hay confirmacion.
- Cabe en GPU consumer: probablemente en RTX 4090 y RTX 3090 con cuantizacion, pero no confirmado por el autor.
- Opciones de despliegue: el autor remite a `NATIVE_INFERENCE.md` para inferencia nativa. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Traduccion imagen (MMTIT) | Idiomas | Licencia |
|---|---|---|---|---|---|
| Index-Translate-Omni 9B | 9B | no disponible | 77.604 | zh, en | no disponible |
| Qwen3.5-9B (base de referencia) | 9B | no disponible | 73.814 | no disponible | no disponible |
| Index-Translate-Omni 2B | 2B | no disponible | 65.809 | zh, en | no disponible |
| Index-Translate-Omni 35BA3B | 35B (3B activos) | no disponible | 77.011 | zh, en | no disponible |

La comparativa se limita a la propia familia y a los modelos Qwen3.5 usados como referencia en la model card, ya que no se dispone de datos de otros modelos de traduccion multimodal comparables en la informacion proporcionada. En traduccion de texto, el 9B queda por debajo del 35BA3B en FLORES, WMT26 Judge y MEME, y practicamente empatado en WMT24++; en traduccion de imagen supera ligeramente al 35BA3B en MMTIT y Vistra.

## Limitaciones y advertencias

- Repositorio incompleto: la model card advierte que la subida de pesos, archivos de carga y manifiesto final sigue en curso; no debe usarse hasta que se retire el aviso.
- Idiomas limitados a chino e ingles; no se declara soporte de otras lenguas pese a la vocacion multilingue de la familia Index-Translate.
- Resultados de benchmarks con tamanos de muestra pequenos (N=30 en voz, 118-305 en imagen) y advertencia explicita del autor de que no permiten rankings cruzados fiables.
- Resultados de imagen de la variante 35BA3B reutilizan mediciones parciales con 73 casos UNKNOWN; la evaluacion no es completa.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Riesgo de alucinacion en traduccion de imagenes con texto poco legible o en audio con ruido; no se documentan tasas de error en esos escenarios.
- No se documentan sesgos conocidos, politicas de seguridad ni evaluaciones de robustez.
- Ausencia de informacion sobre tool calling, agentes o razonamiento multi-paso limita su uso en flujos automatizados complejos.
- El rendimiento en ASR chino del 9B (CER 17.89) es peor que el del 2B (CER 13.81) en la muestra reportada, lo que sugiere que el escalado no mejora uniformemente todas las tareas.

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-omni-9B
- Coleccion Index-Translate: https://huggingface.co/collections/IndexTeam/index-translate
- Documento de inferencia nativa: NATIVE_INFERENCE.md (referenciado en la model card; no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
