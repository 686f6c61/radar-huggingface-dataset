# onemira/diar-streaming-sortformer-4spk-v2.1-gguf

## Resumen

`onemira/diar-streaming-sortformer-4spk-v2.1-gguf` es una distribucion en formato GGUF de un modelo de diarizacion de hablantes (speaker diarization) en streaming, derivado del modelo `nvidia/diar_streaming_sortformer_4spk-v2.1` de NVIDIA. El artefacto lo publica el usuario `onemira` y su aportacion no es un reentrenamiento ni una cuantizacion nueva: segun la propia model card, se limita a congelar y redistribuir un fichero GGUF ya convertido localmente con anterioridad, sin receta de conversion reproducible.

El modelo pertenece a la familia Sortformer de NVIDIA, orientada a resolver la diarizacion de hasta cuatro hablantes de forma integrada y en modo streaming, es decir, asignando etiquetas de hablante a lo largo del tiempo sobre audio continuo en lugar de esperar a disponer de la grabacion completa. El fichero publicado pesa 147.076.352 bytes (unos 147 MB) y corresponde a una cuantizacion Q8_0, con un total de 122.862.212 parametros (aproximadamente 123 millones).

Su relevancia es limitada y muy especifica: al tratarse de un espejo inmutable de un GGUF concreto, su interes practico radica en la trazabilidad del artefacto (hash SHA-256 fijado y revision upstream referenciada), mas que en una mejora de calidad o de eficiencia. No presenta un numero de descargas ni de valoraciones, y su utilidad esta condicionada a que exista un runtime capaz de ejecutar la arquitectura Sortformer en formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (diarizacion de hablantes en streaming); detalle interno no disponible en la informacion proporcionada |
| Parametros totales | 122.862.212 (aprox. 123 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de diarizacion sobre tramas de audio, no un modelo de lenguaje) |
| Tipos de cuantizacion | Q8_0 (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible (la tarea de diarizacion es independiente del idioma, pero no se declara soporte explicito) |
| Licencia | nvidia-open-model-license (etiquetada como `license: other`) |
| Formato de pesos | GGUF (fichero `sortformer.gguf`) |
| Tamano del repositorio | 0,1 GB |
| Tamano del fichero GGUF | 147.076.352 bytes (aprox. 147 MB) |
| SHA-256 del fichero | ce0b583e90957f1d753f69ab20bc8ab064653c2838c06b92381cd1c8bc319e97 |
| Modelo base | nvidia/diar_streaming_sortformer_4spk-v2.1 |
| Revision upstream de referencia | cd03eee90fbec18297ac31b8c21546e596b7f71c |
| Numero de hablantes | 4 (segun nomenclatura del modelo base, "4spk") |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento, y este repositorio no introduce cambios de pesos ni de cuantizacion respecto al artefacto original. Lo unico verificable es que se trata de un derivado del modelo NVIDIA Streaming Sortformer 4-speaker v2.1, un sistema de diarizacion de hablantes disenado para operar en regimen de streaming sobre hasta cuatro interlocutores. La denominacion "Sortformer" hace referencia a la familia de modelos de diarizacion de NVIDIA; para conocer el detalle de capas, encoder y estrategia de ordenacion de hablantes hay que remitirse a la model card y documentacion del modelo base.

En cuanto al entrenamiento, no se aporta en la informacion disponible el numero de tokens o de horas de audio utilizadas, la composicion del dataset, ni si se emplearon tecnicas de ajuste como RLHF o DPO (poco habituales en tareas de diarizacion). La model card indica explicitamente que el comando de conversion original no se conservo, que este repositorio no reclama una receta de conversion reproducible y que no garantiza igualdad byte a byte con otros GGUF listados en el indice upstream del runtime. Se incluyen ficheros de procedencia (`SOURCE.json`), licencia (`LICENSE.html`) y model card upstream (`UPSTREAM_MODEL_CARD.md`).

## Capacidades

- Diarizacion de hablantes: asignacion de etiquetas de hablante a segmentos de audio, con soporte para hasta cuatro hablantes segun la nomenclatura del modelo base.
- Procesamiento en streaming: orientado a audio continuo, no requiere disponer de la grabacion completa antes de emitir etiquetas.
- Integracion con pipelines de audio: pensado para alimentar tareas posteriores como transcripcion con atribucion de hablante.
- Formato GGUF: artefacto autocontenido y de bajo peso, adecuado para distribucion y ejecucion en entornos con recursos limitados.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio generativo, tool calling, function calling y razonamiento multi-paso: no aplica (no es un modelo de lenguaje ni multimodal generativo).
- Capacidades multilingues: no disponibles.
- Capacidad especial: mode "streaming" de diarizacion; otros modos (thinking, vision) no aplican.

## Casos de uso

- Transcripcion con atribucion de hablante: se combina el modelo con un sistema ASR para etiquetar cada fragmento transcrito con su interlocutor, util en actas de reuniones y entrevistas.
- Analisis de reuniones de hasta cuatro participantes: permite separar intervenciones en llamadas de equipo o sesiones de trabajo para generar resumenes por persona.
- Atencion al cliente y centros de contacto: la diarizacion en streaming posibilita separar las voces de agente y cliente en tiempo real para su analisis posterior.
- Subtitulado y postproduccion de audio: identificacion de quien habla en podcasts, entrevistas o contenido audiovisual con varios locutores.
- Investigacion en procesamiento de habla: uso como referencia reproducible (hash fijado) en experimentos de diarizacion y en comparativas de cuantizacion.
- Despliegue en entornos con recursos limitados: al ocupar unos 147 MB en Q8_0, puede ejecutarse en dispositivos de borde o en CPU donde no cabe un modelo mayor.
- Indexacion y busqueda de archivos de audio: etiquetado por hablante para facilitar la recuperacion de fragmentos por interlocutor, condicionado a que el runtime soporte la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero GGUF ocupa 147 MB, por lo que la huella de memoria sera muy reducida.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; no se requiere hardware de gama alta (A100, H100 o RTX 4090 no son necesarios).
- Consumer GPU: cabe en practicamente cualquier GPU de consumo y tambien en CPU, dado su tamano.
- Opciones de despliegue: depende de que exista un runtime que soporte la arquitectura Sortformer en formato GGUF. No se confirma compatibilidad con llama.cpp, Ollama, vLLM o TGI, que estan orientados a modelos de lenguaje y no necesariamente implementan diarizacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onemira/diar-streaming-sortformer-4spk-v2.1-gguf | 122.862.212 (aprox. 123 M) | no disponible | GGUF (Q8_0) | nvidia-open-model-license | HuggingFace (0 descargas, 0 likes) |
| nvidia/diar_streaming_sortformer_4spk-v2.1 | 122.862.212 (aprox. 123 M) | no disponible | safetensors (modelo base) | nvidia-open-model-license | HuggingFace (modelo base) |
| Otras alternativas (por ejemplo, familias de diarizacion de terceros) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni multimodal generativo: solo realiza diarizacion de hablantes, por lo que no genera texto, codigo ni respuestas.
- Limite de cuatro hablantes: la nomenclatura del modelo base ("4spk") indica soporte para hasta cuatro interlocutores; superarlo queda fuera de su alcance declarado.
- Trazabilidad y reproducibilidad: la model card advierte de que el comando de conversion original no se conservo y de que no se garantiza una receta reproducible ni la igualdad byte a byte con otros GGUF.
- Artefacto espejo: no aporta cambios de pesos ni de cuantizacion respecto al material original, por lo que no debe esperarse una mejora de rendimiento.
- Soporte de runtime incierto: la ejecucion requiere un runtime compatible con Sortformer en GGUF; no se confirma compatibilidad con las herramientas habituales de inferencia de LLM.
- Idiomas: no se declara soporte explicito por idioma; no hay datos de rendimiento por lengua.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible.
- Licencia: la `nvidia-open-model-license` es una licencia personalizada (etiquetada como `license: other`); conviene revisar el texto completo enlazado antes de cualquier uso comercial.
- Ausencia de senales de adopcion: 0 descargas y 0 valoraciones, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onemira/diar-streaming-sortformer-4spk-v2.1-gguf
- Modelo base en HuggingFace: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- Licencia (fichero en el repositorio): https://huggingface.co/onemira/diar-streaming-sortformer-4spk-v2.1-gguf/blob/main/LICENSE.html
- Revision upstream de referencia: `cd03eee90fbec18297ac31b8c21546e596b7f71c`
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron contenido no relacionado con el modelo y han sido descartadas.
