# kernelpool/MiMo-V2.6-Flash-MOPD-MXFP4-GGUF

## Resumen

MiMo-V2.6-Flash-MOPD-MXFP4-GGUF es una cuantizacion en formato GGUF del checkpoint MiMo-V2.6-Flash-MOPD de Xiaomi, publicada por el usuario kernelpool. El modelo base es un transformer de gran escala con 309.766.601.088 parametros (aproximadamente 310 mil millones), disenado para tareas conversacionales y de agente, con soporte de tool calling, vision y decodificacion especulativa mediante bloques MTP (multi-token prediction) y un drafter DFlash. La variante MOPD es una actualizacion del checkpoint de RL de Xiaomi orientada a reducir las llamadas repetidas a herramientas en sesiones de agente.

Esta publicacion concreta no es un modelo nuevo, sino un empaquetado GGUF de 174,3 GB que preserva los bloques de expertos MXFP4 del checkpoint original sin recuantizar, mantiene la atencion y pesos densos en Q8_0 y los embeddings en BF16, e incluye por separado el drafter DFlash y el codificador de vision. Esta pensada exclusivamente para Metal, a traves del port DwarfStar (DS4) en la rama `kernelpool/ds4:mimo-v26`.

Su relevancia es doble: por un lado, permite ejecutar un modelo de 310 mil millones de parametros en un Mac con 192 GB o mas de memoria unificada, algo impensable con pesos en BF16; por otro, documenta un flujo de conversion reproducible que conserva bit a bit los expertos MXFP4 liberados por Xiaomi, lo que facilita la verificacion de la calidad frente al checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), bloques MTP, drafter DFlash y torre de vision (segun la model card del autor) |
| Parametros totales | 309.766.601.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos), Q8_0 (atencion, pesos densos y salida), BF16 (embeddings), F32 y Q8_0 (vision), Q8_0 (drafter DFlash) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`mimo2`, `dflash`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: el checkpoint original almacena los expertos en MXFP4 y esta publicacion los reempaqueta sin recuantizacion, preservando los bloques bit a bit. La atencion, los pesos densos y la proyeccion de salida se guardan en Q8_0, y los embeddings en BF16. El checkpoint incluye tres bloques MTP para decodificacion especulativa, un drafter DFlash independiente y una torre de vision que, segun el autor, conserva los mismos pesos que la version RL.

La variante MOPD es una actualizacion del checkpoint de RL de Xiaomi cuyo objetivo declarado es reducir las llamadas repetidas a herramientas en sesiones de agente; solo cambia el modelo principal, mientras que los bloques MTP, el drafter DFlash y la torre de vision mantienen los pesos de la version RL. La conversion la realizan los scripts `gguf-tools/mimo26_quantize.py` y `gguf-tools/mimo26_vision.py` a partir de la revision `2479e2d0029eca9a34cc7e7f55a121925f81908e` de `XiaomiMiMo/MiMo-V2.6-Flash-MOPD`, desintercalando los fragmentos de paralelismo tensorial de la proyeccion QKV fusionada. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion empleadas (RLHF, DPO u otras).

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Razonamiento y uso de herramientas: la variante MOPD esta especificamente optimizada para reducir llamadas repetidas a herramientas en sesiones de agente.
- Tool calling y function calling: el modelo base esta disenado para sesiones de agente con herramientas, aunque la model card no detalla el formato exacto.
- Vision: incluye un codificador de vision separado, disponible en F32 (sin perdida) o Q8_0 (mas pequeno y menos exacto).
- Decodificacion especulativa: soporta bloques MTP internos (`--mtp`) o el drafter DFlash como sidecar (`--mtp-model`), ambos verificados contra el modelo objetivo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes con herramientas en produccion: la variante MOPD reduce las llamadas repetidas a herramientas, lo que abarata y acelera sesiones de agente multi-paso con muchas invocaciones encadenadas.
- Asistentes conversacionales de contexto largo: el modelo esta etiquetado como conversacional y su tamano permite mantener dialogos extensos, aunque la longitud exacta de contexto no esta documentada.
- Automatizacion con vision: el codificador de vision F32 permite procesar imagenes junto con texto en flujos como extraccion de datos de documentos o inspeccion visual asistida.
- Desarrollo local en estaciones Mac: con 192 GB o mas de memoria unificada, se puede ejecutar el modelo completo en un Mac Studio o Mac Pro sin GPU dedicada, usando el servidor `ds4-server`.
- Evaluacion e investigacion de modelos MoE de gran escala: el empaquetado GGUF con expertos MXFP4 intactos permite estudiar el comportamiento del checkpoint sin depender del formato original.
- Servicio compatible con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con APIs tipo OpenAI a traves de `ds4-server`, util para prototipos de aplicaciones que ya consumen ese formato.
- Pruebas de decodificacion especulativa: los bloques MTP y el drafter DFlash permiten comparar estrategias de aceleracion manteniendo la salida identica a temperatura cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que, evaluado sobre 100 continuaciones oficiales de la plataforma de Xiaomi con el fixture `gguf-tools/quality-testing/mimo-v2.6-flash-20260922`, el archivo MOPD obtiene una puntuacion equiparable a la version RL, y que el codificador de vision reproduce la torre del checkpoint con entradas identicas.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo principal ocupa 157,4 GiB y el autor indica que requiere un Mac con 192 GB o mas de memoria unificada.
- El drafter DFlash anade 1,5 GiB y el codificador de vision entre 0,7 GiB (Q8_0) y 2,7 GiB (F32).
- GPU recomendadas: exclusivamente Metal; el autor declara el port como "Metal only". No hay soporte documentado para CUDA, ROCm ni CPU.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones multi-GPU convencionales segun la informacion disponible.
- Opciones de despliegue: DwarfStar (DS4), rama `kernelpool/ds4:mimo-v26`, con los binarios `ds4` y `ds4-server`.
- Latencia y throughput: no disponibles. El autor senala que `--mtp` es la opcion mas rapida frente al sidecar DFlash.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-MOPD-MXFP4-GGUF (este) | 309,8 mil millones | no disponible | MIT | GGUF (MXFP4/Q8_0/BF16) | Solo Metal, requiere 192 GB |
| kernelpool/MiMo-V2.6-Flash-MOPD-GGUF | no disponible | no disponible | MIT | GGUF (Q4 y Q2) | Requantizacion del mismo checkpoint, menor huella |
| kernelpool/MiMo-V2.6-Flash-MXFP4-GGUF | no disponible | no disponible | MIT | GGUF | Version anterior, sustituida por esta |
| XiaomiMiMo/MiMo-V2.6-Flash-MOPD | 309,8 mil millones | no disponible | MIT | safetensors | Checkpoint original de Xiaomi |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de la equivalencia de calidad declarada por el autor.

## Limitaciones y advertencias

- Dependencia de plataforma: el port DS4 es exclusivamente Metal, por lo que no funciona en Linux con CUDA ni en Windows con GPU dedicada.
- Requisito de memoria elevado: 192 GB o mas de memoria unificada en Mac, lo que excluye la mayoria de equipos de consumo.
- Rama no fusionada: el codigo de DS4 vive en una rama de un repositorio de terceros y el propio autor deja el enlace al pull request como "TODO", lo que implica un riesgo de mantenimiento y estabilidad.
- Idiomas y contexto no documentados: no hay informacion sobre cobertura linguistica ni longitud de contexto, lo que dificulta planificar su uso en produccion multilingue o con documentos largos.
- Riesgo de alucinacion: no evaluado en la informacion disponible; como todo modelo generativo, requiere verificacion en dominios factuales.
- Sesgos: no documentados.
- Calidad de vision: la variante Q8_0 del codificador de vision es "mediblemente menos exacta" segun el autor; se recomienda la F32.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base y de las dependencias del port DS4.
- Fecha de publicacion en 2026 y ausencia de benchmarks publicos: la madurez del ecosistema en torno a este checkpoint es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kernelpool/MiMo-V2.6-Flash-MOPD-MXFP4-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Version anterior sustituida: https://huggingface.co/kernelpool/MiMo-V2.6-Flash-MXFP4-GGUF
- Requantizaciones Q4 y Q2: https://huggingface.co/kernelpool/MiMo-V2.6-Flash-MOPD-GGUF
- Repositorio DwarfStar (DS4): https://github.com/antirez/ds4
- Rama del port: https://github.com/kernelpool/ds4/tree/mimo-v26
- Documentacion del port: https://github.com/kernelpool/ds4/blob/mimo-v26/docs/MIMO_V26.md
- Blog de Xiaomi sobre repeticion de tool calls: https://mimo.xiaomi.com/blog/mimo-v2-6-tool-call-repetition
