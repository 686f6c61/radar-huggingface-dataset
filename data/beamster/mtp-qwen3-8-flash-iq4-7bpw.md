# beamster/mtp-qwen3.8-flash-iq4.7bpw

## Resumen

Este repositorio no contiene un modelo completo, sino un paquete de actualizacion compuesto por tres shards de safetensors (`model-00006`, `model-00010` y `model-00012`) que sustituyen parcialmente los pesos de `ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw`. Lo que cambia respecto al modelo base es unicamente el mezclador MTP (multi-token prediction): sus dos proyecciones y su normalizacion. El resto de tensores de los shards se conserva intacto. El objetivo es mejorar el rendimiento de la decodificacion especulativa nativa sin alterar la salida del modelo.

El MTP es el componente que permite predecir varios tokens por paso y alimentar un mecanismo de decodificacion especulativa, de modo que el modelo pueda generar mas tokens por segundo manteniendo la misma distribucion de salida. Este paquete esta pensado para el motor de inferencia Sushi sobre Apple Silicon (formato MLX) y es especifico de la cuantizacion iQ4.7bpw: el propio autor advierte que no debe mezclarse con packs Sushi de 2, 2.6, 3 o 4 bpw ni con otras cuantizaciones.

Su relevancia es practica y acotada: no es un modelo nuevo ni un fine-tuning de capacidades, sino un ajuste de infraestructura orientado a acelerar la inferencia local en Mac con decodificacion especulativa. El repositorio pesa 1,2 GB y solo tiene sentido si ya se dispone del modelo base completo; la licencia Qwen Community 1.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8 Flash Next con mezclador MTP ajustado; el paquete solo modifica el MTP (dos proyecciones y una normalizacion) |
| Parametros totales | no disponible (este repositorio contiene tres shards parciales, no el modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para este paquete; el modelo base Flash Next empaquetado para Sushi soporta 250k tokens a KV de 8 bits y 450k a 4 bits en un Mac de 64 GB, y 1M tokens en Macs de 96 GB y 128 GB |
| Tipos de cuantizacion | iQ4.7bpw (MLX, aproximadamente 4,7 bits por peso); compatible con KV cache de 8 bits (`--kv-quant 8`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (MLX), tres shards de reemplazo |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la serie Qwen3.8 (que incluye Qwen3.5, Qwen3.6 y Qwen3.8) y se distribuye aqui en una variante "Flash Next" empaquetada para el motor Sushi, un motor de inferencia nativo para Apple Silicon. El unico elemento modificado en este repositorio es el mezclador MTP, responsable de la prediccion multi-token que habilita la decodificacion especulativa. Concretamente, se han ajustado las dos proyecciones y la normalizacion del MTP; el resto de la red permanece congelada.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO para el modelo base. Tampoco se especifica el procedimiento de ajuste del MTP mas alla de que fue "tuned" (ajustado). La verificacion de compatibilidad se hizo contra la revision `dafff5c3d8168c9d13275661153911096499a80a` del modelo base, comprobando que los hashes de los shards originales, el config y el indice de tensores coincidian con el modelo usado durante el ajuste.

La validacion reportada por el autor se realizo con la inferencia MTP nativa de Sushi, comparando el MTP original frente al ajustado mediante `llmprobe` en un rango de 512 a 32k tokens de contexto. En la prueba de profundidad fija, las 24 respuestas greedy retenidas (textos y secuencias de tokens) coincidieron con las del original, lo que indica que el ajuste no altera el comportamiento de muestreo del modelo base.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.8 Flash Next; este paquete no anade capacidades nuevas.
- Decodificacion especulativa con MTP: predice varios tokens por paso para acelerar la generacion mediante el modo MTP nativo de Sushi.
- Inferencia local en Apple Silicon: empaquetado en formato MLX y destinado al motor Sushi.
- Razonamiento de contexto largo: el modelo base soporta ventanas de 250k a 450k tokens en un Mac de 64 GB (segun configuracion de KV) y hasta 1M en Macs de 96 GB y 128 GB.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas soportados no se detallan.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Aceleracion de inferencia local en Mac: el proposito principal del paquete es sustituir el mezclador MTP del modelo base para mejorar la velocidad de decodificacion especulativa con Sushi, aprovechando la GPU unificada de los chips Apple Silicon.
- Asistentes de codigo en local: la pagina de MTPLX reporta 125 tok/s sobre Flash Next en OpenCode con MTP nativo en un M5 Max, lo que lo hace util para completado de codigo interactivo sin depender de la nube.
- Procesamiento de documentos largos: con ventanas de 250k a 1M tokens segun el Mac, permite resumir o consultar repositorios de documentacion extensos en una sola pasada.
- Desarrollo de agentes conversacionales multi-turno: un contexto amplio y una generacion rapida facilitan mantener historiales largos de conversacion en aplicaciones de asistencia.
- Despliegue en equipos de desarrollo sin GPU dedicada: al ejecutarse sobre MLX en Mac, evita la necesidad de hardware NVIDIA para prototipado y pruebas.
- Evaluacion de tecnicas de decodificacion especulativa: sirve como caso de estudio reproducible para medir el impacto del ajuste del MTP frente al original en distintos niveles de contexto (512 a 32k tokens).
- Pipelines de generacion de texto offline: util para tareas por lotes (traduccion, resumen, clasificacion) donde se prioriza la velocidad por token sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento disponible es de la pagina de MTPLX, referido al ecosistema y no a este paquete concreto: 125 tok/s sobre Qwen3.8 Flash Next en OpenCode y 87,6 tok/s sobre Qwen3.8 27B, medidos en un Apple M5 Max. El autor de este paquete indica expresamente que el rendimiento varia segun la carga de trabajo y la profundidad adaptativa del borrador, y que no se midio el rendimiento con mlx-serve.

## Requisitos de hardware

- El paquete en si ocupa 1,2 GB, pero requiere descargar el modelo base completo (revision `dafff5c3...`) antes de usarse.
- Hardware objetivo: equipos Apple Silicon con formato MLX. El modelo base Flash Next esta pensado para un Mac de 64 GB para contexto largo (250k con KV de 8 bits, 450k con KV de 4 bits).
- Macs de 96 GB y 128 GB pueden ejecutar la ventana completa de 1M tokens del modelo base.
- No aplica a GPUs NVIDIA (A100, H100, RTX 4090) ni a backends CUDA; este paquete es especifico de MLX y de la cuantizacion iQ4.7bpw.
- Despliegue mediante el motor Sushi con el comando `sushi serve --model "$MODEL_DIR" --mtp --kv-quant 8`.
- VRAM/ memoria unificada estimada: no disponible especificamente para este pack; depende del modelo base y de la configuracion de KV cache.
- Latencia y throughput: no medidos de forma oficial para este paquete; el autor remite a la variabilidad segun carga y profundidad de borrador.

## Comparativa con modelos similares

| Modelo / pack | Base | Cuantizacion | Contexto objetivo | Licencia |
|---|---|---|---|---|
| beamster/mtp-qwen3.8-flash-iq4.7bpw (este) | ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw | iQ4.7bpw | Depende del base (250k-1M) | qwen-community-1.0 |
| beamster/Qwen3.8-Flash-Next-Sushi-2.6bpw | Qwen/Qwen3.8-Flash-Next | 2.6 bpw | 250k (KV 8 bits) / 450k (KV 4 bits) en Mac de 64 GB; 1M en 96/128 GB | no disponible |
| beamster/Qwen3.8-Flash-Next-Sushi-3bpw | Qwen/Qwen3.8-Flash-Next | 3 bpw | no disponible | no disponible |
| Qwen/Qwen3.8-27B (via unsloth/Qwen3.8-27B-GGUF) | Qwen | GGUF | 262k (con flags de KV) en tarjeta de 24 GB | no disponible |

Nota: la comparativa se limita al ecosistema Qwen3.8 documentado en la busqueda; no hay datos de rendimiento comparables para este pack concreto.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base completo `ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw`; sin el, los shards no son utilizables.
- Incompatible con otros packs: no debe mezclarse con packs Sushi 2/2.6/3/4 bpw ni con otras cuantizaciones; el autor lo advierte explicitamente.
- Compatibilidad fijada a una revision concreta (`dafff5c3d8168c9d13275661153911096499a80a`); si el modelo base cambia de revision, los shards pueden no coincidir.
- Alcance del ajuste: solo se modifican el mezclador MTP (dos proyecciones y una normalizacion); no se alteran las capacidades del modelo base ni sus sesgos.
- Sesgos conocidos: no disponible; no se documentan sesgos especificos en la informacion proporcionada.
- Riesgo de alucinacion: no documentado para este paquete; es inherente al modelo base, cuyas caracteristicas de generacion no se detallan aqui.
- Limitaciones de contexto o idioma: la ventana depende del hardware y de la configuracion de KV cache; los idiomas soportados no se especifican.
- Rendimiento no verificado en todos los backends: las pruebas se hicieron con la inferencia MTP nativa de Sushi; el rendimiento con mlx-serve no se midio.
- Licencia: se aplican los terminos de la Qwen Community License 1.0 del modelo base; conviene revisarlos antes de un uso comercial, ya que HuggingFace la etiqueta como "other".
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beamster/mtp-qwen3.8-flash-iq4.7bpw
- Modelo base en HuggingFace: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw
- Licencia del modelo base: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw/blob/main/LICENSE
- Pack relacionado beamster/Qwen3.8-Flash-Next-Sushi-2.6bpw: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-2.6bpw
- Pack relacionado beamster/Qwen3.8-Flash-Next-Sushi-3bpw: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-3bpw
- Repositorio oficial QwenLM/Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio qwen38-mtp (MTP y flags de KV cache): https://github.com/sudoingX/qwen38-mtp
- MTPLX, motor MTP para Mac: https://www.mtplx.com/
- Pesos GGUF de Qwen3.8-27B (referencia externa): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
