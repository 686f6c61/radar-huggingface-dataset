# kernelpool/MiMo-V2.6-Flash-MOPD-MXFP4-GGUF

## Resumen

MiMo-V2.6-Flash-MOPD-MXFP4-GGUF es una cuantizacion en formato GGUF del checkpoint MiMo-V2.6-Flash-MOPD de Xiaomi, publicada por el usuario kernelpool. No se trata de un modelo nuevo ni de un entrenamiento propio: es un trabajo de conversion y empaquetado de pesos orientado exclusivamente a Metal, para el runtime DwarfStar (DS4) en su rama `kernelpool/ds4:mimo-v26`. El checkpoint de origen es la actualizacion MOPD del modelo MiMo-V2.6 Flash, que segun Xiaomi reduce la repeticion de llamadas a herramientas en sesiones de agente.

El modelo tiene 309.766.601.088 parametros totales (~309,8 B) y una arquitectura de mezcla de expertos (MoE), a juzgar por la presencia de bloques de expertos en MXFP4 que el conversor conserva bit a bit sin recuantizar. La model card menciona ademas tres bloques MTP (multi-token prediction), un drafter DFlash para decodificacion especulativa y una torre de vision, lo que lo situa como un modelo multimodal con capacidades de agente.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~310 B en un Mac de 192 GB o mas de memoria unificada, sin GPUs dedicadas, manteniendo los expertos en MXFP4 tal como los libero Xiaomi. Reemplaza a la version anterior del mismo autor (`kernelpool/MiMo-V2.6-Flash-MXFP4-GGUF`) y mantiene su mismo layout de ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con bloques MTP, drafter DFlash y torre de vision; numero de capas y expertos no disponible |
| Parametros totales | 309.766.601.088 (~309,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos del checkpoint, reempaquetados sin recuantizar), Q8_0 (attention, capas densas y salida), BF16 (embeddings); vision en F32 (sin perdida) o Q8_0; drafter DFlash en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del checkpoint original de Xiaomi) |
| Formato de pesos | GGUF, con layouts `mimo2` (modelo principal) y `dflash` (sidecar del drafter) |

Detalle de los ficheros del repositorio:

| Fichero | Tamano | Contenido |
|---|---:|---|
| `MiMo-V2.6-Flash-MOPD-MXFP4.gguf` | 157,4 GiB | Modelo principal en layout `mimo2`: expertos MXFP4 del checkpoint reempaquetados sin recuantizar, attention/densas/salida en Q8_0, embeddings BF16 y los tres bloques MTP |
| `MiMo-V2.6-Flash-MOPD-DFlash-Q8_0.gguf` | 1,5 GiB | Sidecar del drafter DFlash (layout `dflash`), mas el mask embedding y el value scale que requiere DS4 |
| `MiMo-V2.6-Flash-MOPD-Vision-F32.gguf` | 2,7 GiB | Encoder de vision sin perdida (recomendado) |
| `MiMo-V2.6-Flash-MOPD-Vision-Q8_0.gguf` | 0,7 GiB | Encoder de vision con matrices Q8_0, mas pequeno y mediblemente menos exacto |

Tamano total del repositorio: 174,3 GB.

## Arquitectura y entrenamiento

El checkpoint de origen es un modelo de mezcla de expertos (MoE) con pesos de expertos almacenados en MXFP4. La conversion a GGUF no recuantiza esos bloques: el script `gguf-tools/mimo26_quantize.py` los conserva bit a bit desde la revision `2479e2d0029eca9a34cc7e7f55a121925f81908e` de `XiaomiMiMo/MiMo-V2.6-Flash-MOPD`, y ademas desintercala los fragmentos de paralelismo tensorial de la proyeccion QKV fusionada. El resto de pesos (attention, capas densas y proyeccion de salida) se empaquetan en Q8_0, y los embeddings se mantienen en BF16.

La innovacion principal de esta revision respecto a la version anterior es MOPD, una actualizacion del checkpoint de RL de MiMo-V2.6 Flash que, segun el blog de Xiaomi, reduce las llamadas a herramientas repetidas en sesiones de agente. Solo cambio el modelo principal: los bloques MTP, el drafter DFlash y la torre de vision conservan los mismos pesos que la version RL. Para acelerar la inferencia, el runtime DS4 admite dos modos de decodificacion especulativa: usar los bloques MTP internos del fichero principal (`--mtp`, la opcion mas rapida) o el sidecar DFlash (`--mtp-model`). En ambos casos la verificacion se hace contra el modelo objetivo, de modo que la salida con temperatura cero coincide con la decodificacion normal. La torre de vision se convierte por separado con `gguf-tools/mimo26_vision.py`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el detalle de las fases de RLHF o DPO del checkpoint original en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y el runtime DS4 expone `ds4-server` para servicio.
- Razonamiento de multiples pasos y uso de agentes: MOPD esta especificamente orientado a reducir la repeticion de llamadas a herramientas en sesiones de agente, lo que implica soporte de tool calling y de bucles de accion multi-turno.
- Llamada a herramientas (tool calling / function calling): capacidad asumida por el proposito declarado de la actualizacion MOPD.
- Vision: incluye torre de vision con dos variantes de cuantizacion (F32 sin perdida y Q8_0), por lo que admite entradas de imagen cuando se carga con `--vision`.
- Decodificacion especulativa: soporte de MTP interno y de drafter DFlash, ambos verificados contra el modelo objetivo.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes autonomos con muchas llamadas a herramientas: MOPD se diseno para reducir la repeticion de tool calls, de modo que un agente que encadena decenas de invocaciones (busqueda, calculo, APIs internas) genera menos llamadas redundantes y sesiones mas cortas y baratas.
- Automatizacion de tareas sobre capturas o documentos escaneados: la torre de vision permite alimentar imagenes al modelo junto con instrucciones de texto, util para extraer datos de formularios o facturas dentro de un flujo local.
- Asistentes conversacionales de larga duracion: al ejecutarse en memoria unificada de un Mac de 192 GB o mas, el modelo puede mantenerse residente y atender conversaciones multi-turno sin depender de servicios en la nube.
- Procesamiento por lotes sensible a la privacidad: al ser un despliegue puramente local en Metal y con licencia MIT, encaja en entornos donde los datos no pueden salir de la maquina (legal, sanidad, analisis interno).
- Prototipado e investigacion sobre modelos de ~310 B: el repositorio permite reproducir experimentos con un modelo grande en hardware de escritorio de gama alta de Apple, comparando el comportamiento de MOPD frente a la version RL previa.
- Evaluacion de decodificacion especulativa: los dos modos (`--mtp` con bloques internos y `--mtp-model` con DFlash) permiten medir en la practica el impacto de cada drafter sobre la latencia con salida identica a temperatura cero.
- Servicio HTTP local: `ds4-server` levanta un endpoint compatible con el ecosistema de endpoints, util para integrar el modelo como backend de una aplicacion interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion reportada por el autor es una prueba de calidad propia:

| Prueba | Metodologia | Resultado declarado |
|---|---|---|
| Calidad de continuaciones | 100 continuaciones oficiales de la plataforma Xiaomi, con el fixture `gguf-tools/quality-testing/mimo-v2.6-flash-20260922` | El fichero MOPD puntua a la par que la version RL |
| Fidelidad del encoder de vision | Comparacion sobre entradas identicas | La torre de vision reproduce la del checkpoint |

No se dispone de cifras numericas concretas de estas pruebas ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Memoria: el fichero principal ocupa 157,4 GiB y, segun la model card, requiere un Mac con 192 GB de memoria unificada o mas. Sumando el drafter DFlash (1,5 GiB) y el encoder de vision F32 (2,7 GiB), el conjunto completo ronda los 161,6 GiB de pesos.
- GPU dedicadas: no hay soporte declarado. La build es exclusiva de Metal, por lo que no se puede desplegar en A100, H100, RTX 4090 ni similares con este repositorio.
- GPU de consumo: no cabe. El modelo no es ejecutable en ninguna GPU de consumo actual con este formato y runtime (una RTX 4090 dispone de 24 GB, muy por debajo de los 157,4 GiB del fichero principal).
- Hardware recomendado: Mac con 192 GB de memoria unificada como minimo; la propia model card no menciona otras plataformas.
- Opciones de despliegue: DwarfStar (DS4), rama `kernelpool/ds4:mimo-v26`, con los binarios `ds4` (CLI) y `ds4-server` (servidor). No se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI, y los layouts `mimo2` y `dflash` son especificos de DS4.
- Latencia y throughput: no disponible. La model card solo indica que `--mtp` es la opcion mas rapida frente al sidecar DFlash, sin cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a las dos variantes directamente relacionadas:

| Modelo | Parametros | Formato | Licencia | Runtime | Notas |
|---|---|---|---|---|---|
| `kernelpool/MiMo-V2.6-Flash-MOPD-MXFP4-GGUF` (este) | ~309,8 B | GGUF `mimo2` + `dflash` | MIT | DS4, Metal | Incluye la actualizacion MOPD; sustituye al lanzamiento anterior |
| `kernelpool/MiMo-V2.6-Flash-MXFP4-GGUF` | ~309,8 B (mismo checkpoint base en su version RL) | GGUF, mismo layout | MIT | DS4, Metal | Version previa, reemplazada por este repositorio |
| `XiaomiMiMo/MiMo-V2.6-Flash-MOPD` | ~309,8 B | safetensors (checkpoint original) | MIT | Frameworks estandar | Checkpoint de origen; MTP, DFlash y vision identicos a la version RL |
| Otros modelos de ~300 B de la misma categoria | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Disponibilidad exclusiva para Metal: los ficheros estan pensados para el runtime DS4 en macOS con memoria unificada. No hay soporte ni validacion en CUDA, ROCm ni CPU, lo que limita drasticamente el hardware utilizable.
- Umbral de memoria muy alto: requiere 192 GB o mas de memoria unificada, lo que excluye cualquier equipo de consumo estandar y encarece el despliegue.
- Formato no estandar: los layouts `mimo2` y `dflash` y el modo `--mtp` son especificos de la rama DS4 del autor; la interoperabilidad con otras herramientas GGUF no esta garantizada.
- Riesgo de alucinacion: no disponible. No se han publicado evaluaciones de fidelidad factual del checkpoint.
- Sesgos: no disponible. No hay informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- Idiomas y contexto: no disponible. Se desconocen los idiomas soportados y la longitud maxima de contexto, dato critico para planificar despliegues.
- Fiabilidad de la cuantizacion: la model card advierte de que la variante Q8_0 del encoder de vision es "mediblemente menos exacta" que la F32; para uso en produccion se recomienda la F32.
- Trazabilidad de la conversion: los pesos provienen de la revision `2479e2d0029eca9a34cc7e7f55a121925f81908e` del checkpoint de Xiaomi y la revision queda registrada en los metadatos GGUF. Se trata de un repositorio de terceros, con 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente conocida.
- Licencia: MIT, heredada del checkpoint original, por lo que no hay restricciones declaradas de uso comercial. Conviene verificar igualmente los terminos del checkpoint de origen de Xiaomi si se va a explotar comercialmente.
- Fechas: el repositorio figura creado y actualizado en septiembre de 2026, con la advertencia de que la rama DS4 enlazada remite a una pull request cuyo enlace aun estaba marcado como pendiente (TODO) en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kernelpool/MiMo-V2.6-Flash-MOPD-MXFP4-GGUF
- Repositorio anterior reemplazado: https://huggingface.co/kernelpool/MiMo-V2.6-Flash-MXFP4-GGUF
- Checkpoint base en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- DwarfStar (DS4): https://github.com/antirez/ds4
- Rama DS4 para MiMo-V2.6: https://github.com/kernelpool/ds4/tree/mimo-v26
- Documentacion de MiMo-V2.6 en DS4: https://github.com/kernelpool/ds4/blob/mimo-v26/docs/MIMO_V26.md
- Blog de Xiaomi sobre MOPD y repeticion de llamadas a herramientas: https://mimo.xiaomi.com/blog/mimo-v2-6-tool-call-repetition
