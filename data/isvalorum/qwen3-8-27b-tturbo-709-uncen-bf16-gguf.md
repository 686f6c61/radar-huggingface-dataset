# IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-BF16-GGUF

## Resumen

Qwen3.8-27B-TTURBO-709-Uncen-BF16-GGUF es una conversión a formato GGUF en precisión BF16 del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, un fine-tune sin censura (uncensored) de la familia Qwen 3.8 con 27.320.697.856 parámetros. Lo publica IsValorum dentro de su serie "APEX Quantization Series", que distribuye pesos en GGUF calculados en clústeres de nube propios. El modelo resuelve el problema de disponer de una referencia BF16 íntegra y verificable para despliegues con llama.cpp, manteniendo la plantilla de chat DAU y el proyector de visión originales.

La relevancia de esta ficha es doble: por un lado, es la referencia de precisión completa frente a las variantes cuantizadas MiniPlus y NanoPlus V3 del mismo autor; por otro, conserva los 15 tensores de Multi-Token Prediction (MTP) en `blk.64.*` dentro del propio GGUF, sin necesidad de un fichero draft separado. El pipeline declarado es image-text-to-text, por lo que el modelo admite entradas de imagen y texto, y los idiomas soportados según la model card son inglés y chino.

Se trata de un modelo derivado de Qwen 3.8 con modificaciones de fine-tuning y etiquetado "uncensored", lo que implica que se han reducido o eliminado las capas de rechazo del modelo original. La licencia declarada es Apache-2.0, heredada del modelo base, y el repositorio ocupa 54,7 GB, correspondientes a un único fichero GGUF de 54.657.743.648 bytes más la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.8) con proyector de vision y cabezas MTP; no se detalla en la informacion disponible la configuracion exacta de capas y atencion |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens en los ejemplos de uso de la model card (`-c 32768`); no se confirma un maximo oficial distinto |
| Tipos de cuantizacion | BF16 (esta release); el autor menciona tiers MiniPlus y NanoPlus V3 como builds de despliegue, sin detallar sus tipos |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (BF16), 866 tensores de texto mas tensores MTP; plantilla de chat en `chat_template.jinja`; proyector de vision en `mmproj-BF16.gguf` separado |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer de la familia Qwen 3.8 con 27.320.697.856 parametros, convertido a GGUF con llama.cpp master. El modelo incorpora un proyector de vision (mmproj) que habilita el pipeline image-text-to-text, y conserva 15 tensores MTP en `blk.64.*` integrados en el mismo fichero GGUF, lo que permite decodificacion especulativa multi-token sin un fichero draft independiente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por RLHF, DPO u otras tecnicas de alineacion. El fine-tune original es de DavidAU (TWIN-TURBO Fable Cold Fusion 709 L Uncensored), y esta release de IsValorum es unicamente una conversion de precision a BF16 con la plantilla de chat DAU embebida. El SHA256 del fichero GGUF es `d2932275ad1a4316f482967b1cde41a5e5461b12965b4f558ba91eab1095c36f`.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat DAU embebida.
- Razonamiento e instrucciones en modo "reasoning/instruct" segun la plantilla DAU.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el proyector `mmproj-BF16.gguf`.
- Decodificacion especulativa multi-token (MTP) integrada en el GGUF, sin fichero draft separado.
- Comportamiento sin censura (uncensored) sobre el fine-tune base de DavidAU.
- Soporte bilingue limitado a ingles y chino segun la model card.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documenta soporte explicito de tool calling o function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o multi-step reasoning mas alla del modo reasoning de la plantilla.

## Casos de uso

- Referencia de precision para validacion de cuantizaciones: este GGUF BF16 sirve como baseline para medir la perdida de calidad de las variantes MiniPlus y NanoPlus V3 del mismo autor, comparando salidas token a token en llama.cpp.
- Despliegue local con llama.cpp: mediante `llama-server` con `--mmproj mmproj-BF16.gguf --jinja -ngl 99 -c 32768`, adecuado para entornos donde se quiere control total del binario y de los pesos sin dependencias de servicios en la nube.
- Procesamiento de documentos con imagen: al aceptar image-text-to-text, puede emplearse para extraer informacion de capturas, diagramas o documentos escaneados en ingles o chino, siempre que la calidad del proyector de vision sea suficiente para el caso concreto.
- Investigacion sobre modelos sin censura: util para estudiar el comportamiento de modelos con capas de rechazo reducidas y comparar respuestas frente al Qwen 3.8 original en tareas sensibles dentro de un marco de evaluacion controlado.
- Generacion asistida con decodificacion especulativa: los tensores MTP integrados permiten acelerar la generacion en llama.cpp sin gestionar un modelo draft aparte, lo que simplifica pipelines de inferencia con latencia ajustada.
- Experimentacion bilingue en y zh: para prototipos de asistentes conversacionales en esos dos idiomas, con la ventaja de disponer de pesos abiertos y plantilla de chat incluida.
- Fine-tuning posterior o destilacion: al ser BF16 y estar en GGUF, puede servir como fuente para conversiones a otros formatos o para extraer pesos de referencia en estudios de destilacion, aunque la conversion GGUF a safetensors requiere herramientas adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los benchmarks del modelo base son autodeclarados por DavidAU y que la vision y el MTP no han sido evaluados de forma independiente en este archivo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: al menos 54,7 GB solo para los pesos del fichero GGUF, mas overhead de contexto KV y el proyector de vision; en la practica se necesita una GPU con 80 GB (A100 80GB, H100 80GB) o varias GPU para mantener 32.768 tokens de contexto.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB) para repartir capas con `-ngl`.
- No cabe en una unica GPU consumer de 24 GB en BF16; para consumer se requieren las variantes cuantizadas (MiniPlus, NanoPlus V3) que el autor menciona como builds de despliegue.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) segun los ejemplos de la model card; no se documentan otros motores como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles; dependen del hardware, del numero de capas descargadas a GPU (`-ngl`) y del uso de MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-BF16-GGUF | 27,32 B | 32.768 (ejemplos) | Apache-2.0 | GGUF BF16 | Referencia BF16 con MTP y vision |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | 27,32 B | no disponible | Apache-2.0 | safetensors (base) | Modelo base del que deriva esta conversion |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF | 27,32 B | no disponible | Apache-2.0 | GGUF | Repositorio del que procede el `mmproj-BF16.gguf` |
| Qwen 3.8 original (familia) | ~27 B (segun el nombre) | no disponible | no disponible en la informacion | no disponible | Modelo de referencia alineado, sin modificaciones uncensored |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo "uncensored": se han reducido o eliminado las capas de rechazo, por lo que puede generar contenido que el Qwen 3.8 original rechazaria; requiere filtros y politicas de uso en produccion.
- Los benchmarks del modelo base son autodeclarados por DavidAU y no han sido verificados de forma independiente.
- La vision y el MTP no han sido evaluados de forma independiente en este archivo, segun la propia model card.
- Idiomas limitados a ingles y chino; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- El contexto de 32.768 tokens aparece solo en los ejemplos de uso, no como maximo oficial confirmado; conviene validar el comportamiento en contextos largos antes de desplegar.
- La licencia Apache-2.0 se hereda del modelo base, pero el caracter uncensored puede entrar en conflicto con las politicas de uso de plataformas de despliegue o con requisitos regulatorios.
- El fichero BF16 de 54,7 GB no es adecuado para hardware consumer sin cuantizar; el autor remite a los tiers MiniPlus y NanoPlus V3 para despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- El SHA256 del GGUF esta publicado, pero no se aportan pruebas de reproducibilidad de la conversion mas alla de la declaracion del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Qwen3.8-27B-TTURBO-709-Uncen-BF16-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Repositorio GGUF del que procede el proyector de vision: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF/blob/main/mmproj-BF16.gguf
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
