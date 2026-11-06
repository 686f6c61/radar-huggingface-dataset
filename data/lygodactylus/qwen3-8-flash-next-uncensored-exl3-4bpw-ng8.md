# Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw-ng8

## Resumen

Qwen3.8-Flash-Next-Uncensored-exl3-4bpw-ng8 es una cuantizacion EXL3 (ExLlamaV3) del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, que a su vez es una version "abliterated" (con los mecanismos de rechazo eliminados) de Qwen/Qwen3.8-Flash-Next. El autor de la cuantizacion es Lygodactylus y esta pensada para su uso con ExLlamaV3 1.6.6 o superior. El modelo base es un transformer MoE multimodal (image-text-to-text) con 34.945.009.520 parametros totales y capacidad de generacion de texto e imagen a texto.

La particularidad de esta build frente a la version 4.05 bpw estandar es que la tabla n-gram (PLE) se almacena a 8 bits por peso en lugar de 6, lo que reduce el error de reconstruccion de la tabla de 0.01664 a 0.00433 (rfn), es decir, unas 3,8 veces menos error. El coste es un aumento del tamano en disco de 39,0 GB a 51,8 GB solo en la tabla n-gram, lo que eleva el repo a 121,9 GB y el modelo en disco a 114 GiB.

Es relevante para quienes necesitan ejecutar un modelo Qwen 3.8 Flash-Next sin censura en hardware con suficiente VRAM o RAM, con decodificacion especulativa mediante MTP y con la tabla n-gram cargada en RAM del sistema (`ngram_ram: true`). La licencia heredada es Qwen Community License 1.0, lo que impone restricciones para uso comercial que deben revisarse antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Qwen4ExpForConditionalGeneration), con capas QSA y decodificacion especulativa MTP; pesos cuantizados con EXL3 |
| Parametros totales | 34.945.009.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3: LM a 4.05 bpw, `lm_head` a 6 bpw, capas MTP a 8 bpw, tablas n-gram (PLE) a 8 bpw, torre de vision sin cuantizar (16 bits) |
| Idiomas soportados | en, fr, zh |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors (EXL3, para ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos (MoE) y capacidades multimodales (image-text-to-text), segun los tags del repo. La version aqui publicada es una cuantizacion EXL3 realizada con ExLlamaV3 1.6.6 sobre el checkpoint abliterated de orcarouter, que a su vez deriva de Qwen/Qwen3.8-Flash-Next. La cuantizacion emplea un corpus de calibracion por defecto de 250 filas x 2048 columnas y aplica precisiones diferenciadas por componente: 4.05 bpw para el modelo de lenguaje, 6 bpw para `lm_head`, 8 bpw para las capas MTP y para las tablas n-gram (PLE), y 16 bits para la torre de vision.

La innovacion tecnica principal de esta build es el uso de tablas n-gram a 8 bpw en lugar de 6 bpw, lo que reduce el error de reconstruccion relativo (Frobenius) de la tabla de 0.01664 a 0.00433. El autor advierte explicitamente de que esta metrica mide solo la tabla, no el efecto sobre la salida del modelo, y que no se ha ejecutado una comparacion KLD contra el BF16. El modelo soporta decodificacion especulativa mediante MTP (`draft_mode: mtp`) y permite cargar la tabla n-gram en RAM del sistema con `ngram_ram: true`, lo que anade unos 13 GB adicionales de RAM respecto a la build de 6 bpw. El soporte de tensor parallel requiere ExLlamaV3 1.5.1 o superior, ya que las capas QSA no se dividen; en versiones anteriores falla con `NotImplementedError`. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, frances y chino.
- Procesamiento de imagen a texto (pipeline `image-text-to-text`), con torre de vision sin cuantizar a 16 bits.
- Razonamiento y generacion de codigo, heredados del modelo base Qwen3.8-Flash-Next.
- Decodificacion especulativa mediante capas MTP (`draft_mode: mtp`), que acelera la generacion.
- Soporte de carga de la tabla n-gram en RAM (`ngram_ram: true`) para evitar streaming desde disco en cada forward.
- Compatibilidad con tensor parallel en ExLlamaV3 1.5.1+ (no probado por el autor).
- Ausencia de mecanismos de rechazo tras la abliteration: responde a solicitudes que el Qwen3.8-Flash-Next original rechazaria.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- Inferencia local de un modelo multimodal sin censura en una estacion de trabajo con suficiente VRAM: la cuantizacion EXL3 a 4.05 bpw permite cargar los 34,9 mil millones de parametros en GPUs de gama alta, con la tabla n-gram en RAM del sistema para reducir el uso de VRAM.
- Despliegue en un DGX Spark (GB10, aarch64): existe una imagen Docker publica (jayleaton/qwen38-flash-next-exl3-spark) que sirve esta familia de modelos con API compatible con OpenAI y decodificacion especulativa activada, lo que facilita poner el modelo en produccion con un solo `docker compose up`.
- Generacion de codigo y asistencia a la programacion en un entorno controlado: el modelo hereda las capacidades del Qwen3.8-Flash-Next base y puede integrarse en pipelines internos donde la ausencia de rechazos sea un requisito (por ejemplo, generacion de tests o refactorizacion sobre codigo propietario).
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y describir contenido de capturas, diagramas o PDFs renderizados, con la torre de vision a 16 bits para preservar calidad.
- Investigacion sobre alineacion y abliteration: util para estudiar el comportamiento de un modelo con los mecanismos de rechazo eliminados frente a la version original, comparando respuestas en los mismos prompts.
- Conversacion multilingue en ingles, frances y chino: adecuado para prototipos de atencion al cliente o asistentes internos en esos tres idiomas, con la advertencia de que no se documenta soporte de espanol.
- Escenarios de generacion creativa sin restricciones editoriales: el modelo acepta solicitudes que el modelo original rechazaria, lo que puede ser util en investigacion de narrativa o generacion de contenido adulto, siempre con moderacion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la build no ha sido medida ("Not run on this build yet") y que las cifras de velocidad de la build con tabla de 6 bpw estan en la model card de la version 4.05 bpw. Tampoco se ha ejecutado una comparacion KLD contra el BF16. Las cifras de abliteration son de orcarouter, medidas sobre el BF16 de origen, no sobre esta cuantizacion.

## Requisitos de hardware

- VRAM estimada: el modelo en disco ocupa 114 GiB; con `ngram_ram: true` la tabla n-gram (51,8 GB) se carga en RAM del sistema, por lo que la VRAM necesaria para los pesos del LM, `lm_head`, MTP y torre de vision ronda los 60-65 GB, aunque el autor no publica una cifra exacta.
- RAM del sistema: se recomienda al menos 64 GB para alojar la tabla n-gram de 51,8 GB, mas el margen del sistema operativo; el autor menciona "unos 13 GB extra" respecto a la build de 6 bpw.
- GPU recomendadas: no disponible de forma explicita; por el volumen de pesos, se requiere al menos una GPU con 80 GB (A100, H100) o un nodo multi-GPU con tensor parallel (ExLlamaV3 1.5.1+).
- Cabe en consumer GPU: no de forma individual; se necesitarian varias RTX 4090 (24 GB) con tensor parallel, opcion que el autor no ha probado.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3); existe una imagen Docker para DGX Spark (GB10, aarch64) con API compatible con OpenAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato EXL3 no es compatible con esos runtimes.
- Latencia y throughput: no disponibles para esta build; el autor remite a la model card de la version 4.05 bpw con tabla de 6 bpw para cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-exl3-4bpw-ng8 (este) | 34,9 B | no disponible | EXL3 4.05 bpw, tabla n-gram 8 bpw | Qwen Community 1.0 | Hugging Face, 61 descargas |
| Qwen3.8-Flash-Next-Uncensored-exl3-4bpw | 34,9 B | no disponible | EXL3 4.05 bpw, tabla n-gram 6 bpw | Qwen Community 1.0 | Hugging Face |
| Qwen3.8-Flash-Next-Uncensored-exl3-3bpw | 34,9 B | no disponible | EXL3 3 bpw | Qwen Community 1.0 | Hugging Face |
| Qwen3.8-Flash-Next-Uncensored-exl3-5bpw | 34,9 B | no disponible | EXL3 5.05 bpw | Qwen Community 1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | BF16 | Qwen Community 1.0 | Hugging Face, GitHub |

No se dispone de datos de rendimiento comparativo entre estas variantes; el autor solo publica el error de reconstruccion de la tabla n-gram (0.01664 a 6 bpw frente a 0.00433 a 8 bpw) y advierte de que no mide el efecto sobre la salida.

## Limitaciones y advertencias

- La alineacion de seguridad ha sido eliminada sustancialmente mediante abliteration: el modelo cumplira solicitudes que el Qwen3.8-Flash-Next original rechaza y no tiene guardarrailes internos significativos. Es obligatorio anadir una capa de moderacion externa antes de cualquier despliegue.
- Riesgo de alucinacion no cuantificado: no se han publicado benchmarks ni evaluaciones de calidad sobre esta cuantizacion.
- El error de reconstruccion de la tabla n-gram se ha medido solo sobre la tabla, no sobre la salida del modelo; no hay comparacion KLD contra el BF16.
- Idiomas limitados a ingles, frances y chino; no se documenta soporte de espanol.
- La licencia Qwen Community License 1.0 impone restricciones para uso comercial que deben revisarse; el campo `license: other` en Hugging Face refleja que no es una licencia estandar de codigo abierto.
- El formato EXL3 solo es compatible con ExLlamaV3; no funciona con vLLM, llama.cpp, Ollama ni TGI.
- El tensor parallel requiere ExLlamaV3 1.5.1 o superior y no ha sido probado por el autor; en versiones anteriores falla con `NotImplementedError`.
- El modelo en disco ocupa 114 GiB y la tabla n-gram anade 51,8 GB de RAM si se usa `ngram_ram: true`, lo que limita el despliegue a hardware de gama alta.
- Las cifras de abliteration son de orcarouter y se midieron sobre el BF16, no sobre esta cuantizacion.
- El modelo tiene solo 61 descargas y 2 likes en el momento de la ficha, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw-ng8
- Modelo base (abliterated): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repo GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Variante 4.05 bpw (tabla 6 bpw): https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw
- Variante 2 bpw: https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-2bpw
- Variante 3 bpw: https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-3bpw
- Variante 5.05 bpw: https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-5bpw
- Imagen Docker para DGX Spark: https://github.com/jayleaton/qwen38-flash-next-exl3-spark
- Ficha en abliteration.org: https://abliteration.org/models/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw
