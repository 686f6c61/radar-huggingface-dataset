# bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision-mtp

## Resumen

Qwen3.8-27B-Uncensored-W4A16-vision-mtp es una cuantizacion W4A16 (4 bits, grupo de 128) del modelo JonathanColetti/Qwen3.8-27B-Uncensored, que a su vez es una version abliterada (sin censura) del Qwen/Qwen3.8-27B original de Alibaba. El trabajo de este repositorio consiste en el pipeline de cuantizacion, la separacion del tower de vision antes de la calibracion y el reempaquetado posterior que reincorpora el vision tower en bf16 al stack de texto cuantizado.

El modelo mantiene la arquitectura hibrida de Qwen3.8 (16 capas de atencion completa y 48 de atencion lineal sobre 64 capas totales), una ventana de contexto nativa de 262 144 tokens y capacidades de vision-lenguaje. Esta variante concreta incluye la cabeza MTP (multi-token prediction) de 849 MB, que puede usarse con decodificacion especulativa en vLLM. El repositorio ocupa 18,6 GB en disco y esta verificado para servir en 2×RTX 3090 con tensor parallelism 2.

La relevancia de este modelo radica en combinar tres propiedades poco frecuentes: cuantizacion 4-bit eficiente para GPU de consumo, ausencia de rechazos por abliteracion y capacidades multimodales (imagen y video) con contexto largo. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 hibrida: 16 capas full attention + 48 capas linear attention (64 capas), vision-language |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | W4A16, group size 128 (formato AutoRound/AutoGPTQ, kernel Marlin) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura hibrida de atencion: 16 de las 64 capas usan atencion completa (full attention) y las 48 restantes usan atencion lineal (linear attention), lo que reduce el coste computacional en contextos largos. El modelo base original fue entrenado por Alibaba con razonamiento configurable (thinking mode) y una ventana nativa de 262K tokens.

La cadena de derivacion es triple. Primero, JonathanColetti aplico abliteracion sobre Qwen3.8-27B usando la herramienta Heretic con una busqueda Pareto de 200 pruebas, eliminando los rechazos del modelo sin reentrenamiento. Segundo, este repositorio cuantizo el resultado a W4A16 con AutoRound, usando calibracion solo de texto sobre 256 muestras de 2048 tokens del dataset NeelNanda/pile-10k. Tercero, el vision tower se elimino antes de la cuantizacion (para evitar que AutoRound detectara el modelo como MLLM y cambiara la calibracion) y se reincorporo despues en bf16 sin cuantizar.

Detalles tecnicos relevantes del proceso: las capas `linear_attn.in_proj_a` e `in_proj_b` se excluyen de la cuantizacion en todas las capas de atencion lineal, ya que cuantizarlas rompe el modelo. La cabeza MTP se copia directamente del checkpoint fuente sin cuantizar. El tiempo total de cuantizacion fue de aproximadamente 4 horas en 2×RTX 3090 (1 hora de calibracion, 3 horas de optimizacion AutoRound, 10 minutos de reempaquetado).

## Capacidades

- Generacion de texto y razonamiento con modo thinking configurable (el template de chat de Qwen3.8 abre un bloque `thinking` por defecto; puede separarse del cuerpo de la respuesta con `--reasoning-parser qwen3` en vLLM).
- Comprension de imagenes: acepta hasta 8 imagenes por peticion con un maximo de 2 097 152 pixeles (aproximadamente 1448×1448 o capturas de pantalla alargadas de 900×2300).
- Entrada de video: soporta hasta 2 videos por peticion, activando la ruta de video en vLLM con `--limit-mm-per-prompt`.
- Tool calling y function calling: compatible con `--enable-auto-tool-choice` y el parser `qwen3_coder` en vLLM.
- Capacidades de agente: razonamiento multi-paso y ejecucion de tareas de largo horizonte gracias al contexto de 262K tokens.
- Multilingue limitado a ingles y chino.
- Sin censura: la abliteracion elimina los rechazos del modelo base, permitiendo generar contenido que el modelo original rechazaria.
- Decodificacion especulativa opcional mediante la cabeza MTP incluida en esta variante (849 MB adicionales).

## Casos de uso

- Asistentes de vision-lenguaje con contexto largo: el modelo puede procesar documentos extensos con imagenes intercaladas (por ejemplo, manuales tecnicos o informes con graficos) gracias a sus 262K tokens de ventana y la entrada multimodal de hasta 8 imagenes por peticion.
- Analisis de capturas de pantalla y UI: con el limite de 2M pixeles por imagen, puede describir y razonar sobre interfaces de usuario completas, util para automatizacion de pruebas o accesibilidad.
- Generacion de codigo en produccion: soporta tool calling con el parser `qwen3_coder`, lo que permite integrarlo en pipelines de CI/CD para revision de codigo, generacion de tests o autocompletado contextual.
- Agentes autonomos de larga duracion: el contexto de 256K tokens permite mantener historiales de interaccion muy extensos, adecuado para agentes que ejecutan tareas de investigacion o automatizacion en multiples pasos.
- Procesamiento de video: acepta hasta 2 videos por peticion, habilitando resumenes, transcripcion descriptiva o extraccion de informacion de contenido audiovisual.
- Chat sin restricciones para investigacion: la abliteracion permite estudiar el comportamiento del modelo sin mecanismos de rechazo, util para investigacion en seguridad, alineacion o analisis de sesgos.
- Servicio de inferencia de alto rendimiento: con 16 peticiones concurrentes alcanza ~700 tok/s agregados en 2×RTX 3090, adecuado para front-ends de chat con multiples sesiones activas.

## Benchmarks y rendimiento

La model card describe la metodologia de evaluacion pero no incluye los numeros completos en la informacion disponible. Los datos publicados se produjeron con thinking ON y temperature 0, y no deben compararse directamente con leaderboards que usan thinking OFF. Las comparaciones validas son: (1) contra el Qwen3.8-27B base sin modificar con la misma cuantizacion, mismo harness y misma semilla, y (2) contra los numeros publicos de Qwen para Qwen3.8-27B como comprobacion aproximada.

Datos de rendimiento medidos en 2×RTX 3090 (NVLink, TP=2):

| Metrica | Valor |
|---|---|
| Decodificacion, peticion unica con thinking ON | 66-68 tok/s |
| Decodificacion, 16 peticiones concurrentes | ~700 tok/s agregados |
| Prefill (pico) | 3300 tok/s por peticion |
| Pesos en GPU por rank | 8,87 GiB |
| KV cache disponible por rank | 12,93 GiB |
| Pool KV total | 415 125 tokens entre ambos ranks |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Configuracion verificada: 2×NVIDIA RTX 3090 24 GB con NVLink, tensor parallelism 2 (GPU 0 y 2), vLLM 0.20.2 con compute en float16.
- VRAM estimada: 8,87 GiB por rank para pesos (17,74 GiB totales), mas espacio para KV cache. Con `--gpu-memory-utilization 0.95` quedan 12,93 GiB por rank para cache, lo que permite 415 125 tokens de pool KV.
- GPU compatibles: cualquier par de GPU con 24 GB o mas (RTX 3090, RTX 4090, A100, H100). En una sola GPU de 24 GB no cabe con contexto completo; se necesitarian al menos 2 GPU o reducir `--max-model-len`.
- Espacio en disco: 18,6 GB para el repositorio (19 GB para la variante con MTP segun la model card).
- Opciones de despliegue: vLLM (verificado, con flags especificos para multimodalidad y tool calling). Compatible con transformers y safetensors; el formato AutoGPTQ/Marlin requiere vLLM o librerias compatibles con kernel Marlin.
- Flags criticos en vLLM: `--mm-processor-kwargs '{"max_pixels": 2097152}'` es obligatorio para imagenes grandes (sin el, falla con `Mismatch in image token count`); `--limit-mm-per-prompt '{"image": 8, "video": 2}'` activa la ruta de video; `--reasoning-parser qwen3` separa el bloque `thinking` de la respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 27B | 262K | bf16 (original) | Apache 2.0 | Modelo base de Alibaba, con censura |
| JonathanColetti/Qwen3.8-27B-Uncensored | 27B | 262K | bf16 (original) | Apache 2.0 | Abliterado via Heretic, sin cuantizar |
| bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision-mtp | 27B | 262K | W4A16 (4-bit) | Apache 2.0 | Abliterado + cuantizado, con MTP y vision tower en bf16 |
| bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision | 27B | 262K | W4A16 (4-bit) | Apache 2.0 | Igual pero sin cabeza MTP (18 GB) |

La comparacion directa con otros modelos de 27B de la misma categoria no esta disponible en la informacion proporcionada. La diferencia principal entre las dos variantes de este repositorio es la cabeza MTP (849 MB), que solo se activa con decodificacion especulativa explicita en vLLM; sin ella, ambos se comportan de forma identica.

## Limitaciones y advertencias

- La abliteracion puede degradar capacidades en ciertas tareas; la model card recomienda comparar contra el base cuantizado con el mismo harness para aislar el coste real de abliteracion + cuantizacion.
- La cuantizacion W4A16 introduce perdida de precision respecto al modelo en bf16. Las capas `linear_attn.in_proj_a/b` se mantienen sin cuantizar, pero el resto del stack de texto esta en 4 bits.
- Los resultados de evaluacion se produjeron con thinking ON; comparar con leaderboards que usan thinking OFF dara diferencias de 5-10 puntos en conjuntos de opcion multiple y no es una comparacion valida.
- Solo soporta ingles y chino; no hay capacidad multilingue para otros idiomas.
- La cabeza MTP no esta cuantizada y anade 849 MB; vLLM ignora los tensores `mtp.*` salvo que se habilite decodificacion especulativa explicitamente.
- El despliegue multimodal requiere flags especificos en vLLM; sin `--mm-processor-kwargs` con `max_pixels`, las imagenes grandes fallan con un error de truncamiento del tokenizador.
- Al ser un modelo sin censura, puede generar contenido inapropiado, ofensivo o peligroso. No es adecuado para despliegues publicos sin moderacion adicional.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo (por ejemplo, la IA Act europea) al desplegar un modelo sin salvaguardas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bowmanslayer/Qwen3.8-27B-Uncensored-W4A16-vision-mtp
- Modelo base abliterado: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de abliteracion Heretic: https://github.com/p-e-w/heretic
- Repositorio oficial Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Pagina de Qwen3.8 en openlm.ai: https://openlm.ai/qwen3.8/
- Articulo sobre Qwen3.8-27B en Gigazine: https://gigazine.net/gsc_news/en/20260817-qwen3-8-27b
- Ficha de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
