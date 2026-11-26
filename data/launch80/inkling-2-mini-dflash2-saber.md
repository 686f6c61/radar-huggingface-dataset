# Launch80/Inkling-2-Mini-DFlash2-SABER

## Resumen

Inkling-2-Mini-DFlash2-SABER es un paquete de pesos empaquetado por el usuario Launch80 para el motor de inferencia Saber, un runtime nativo de ROCm orientado a GPUs AMD RDNA4. No se trata de un modelo generativo completo, sino de un *drafter* de decodificación especulativa: los cinco capas ventaneadas (con ventana de 2.048 filas) que proponen 7 tokens por ronda a partir de cuatro tomas de estados ocultos del modelo objetivo. El checkpoint original es `incoai/Inkling-2-Mini-DFlash2`, publicado bajo licencia Apache-2.0, y este paquete lo reempaqueta en formato propietario del motor Saber junto con una versión int8 de sus matrices para el camino W8A8.

El interés de este artefacto es doble. Por un lado, demuestra una técnica de aceleración de inferencia —decodificación especulativa con verificación por parte del modelo objetivo— que, según las mediciones del autor, eleva el throughput de decodificación un 12,9 % en un solo stream y hasta un 77-79 % en prompts largos de 32K tokens sobre una Radeon AI PRO R9700. Por otro, reduce el consumo de VRAM del drafter en el rango 0 de 8,56 GiB a 1,58 GiB, lo que libera memoria para el modelo principal.

Es importante subrayar que este repositorio no contiene un modelo autónomo: sus ficheros solo cargan en el motor Saber, depende del paquete objetivo `Launch80/Inkling-2-Mini-NVFP4-SABER` y no incluye embeddings ni `lm_head` (los toma del objetivo). Su utilidad práctica está acotada al despliegue de Inkling-2-Mini en hardware AMD RDNA4 con Saber.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 5 capas ventaneadas (ventana de 2.048 filas), drafter de decodificación especulativa con selector de candidatos sobre cabeza podada de 32.768 ids |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el drafter opera sobre las tomas de estados ocultos del objetivo; las pruebas usan prompts de 32K tokens) |
| Tipos de cuantizacion | bf16 (bytes originales del checkpoint) e int8 (códigos int8 con escalas bf16 por bloque k de 32, forma W8A8 para matrix cores) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.bin` propietario del motor Saber (81 tensores bf16 + 36 pares `.w8.bin`/`.w8s.bin`), `manifest.json` con formato `ink2-dflash2/1`; no usa safetensors ni GGUF |
| Tamano del repositorio | 1,39 GB |
| Modelo base | incoai/Inkling-2-Mini-DFlash2 (revision `4f9088ea`) |
| Profundidad de borrador | 7 tokens por ronda (configurable vía `--ink-mtp`) |
| Gate por defecto | `prod:0.4:2` |
| Ubicación de shards | `{"tp2": [0], "tp1": [0]}` (el drafter se ejecuta entero en el rango 0) |

## Arquitectura y entrenamiento

El drafter es una red de cinco capas con atención ventaneada de 2.048 filas que consume cuatro tomas de estados ocultos del modelo objetivo y propone 7 tokens por ronda. Incorpora un selector de candidatos que opera sobre una cabeza podada de 32.768 ids y reutiliza el embedding y el `lm_head` del modelo objetivo, que no se incluyen en este repositorio. El paquete ofrece dos formas numéricas: los tensores bf16 originales del checkpoint público y una forma int8 (códigos int8 con escalas bf16 por bloque de 32 elementos en la dimensión k, calculadas como el menor bf16 mayor o igual a amax/127 con redondeo half-even) que cubre las proyecciones `fc`, q, k, v, o, gate, up y down. La sección `iu8` del manifiesto declara la forma W8A8 para matrix cores con parámetros de workgroup por registro, y el motor rechaza la forma si hay cualquier discrepancia.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en la información proporcionada. El autor incluye scripts de construcción y verificación (`build_ink2_dflash2.py` y `check_ink2_dflash2.py`, solo numpy, ~5 s) que reconstruyen el paquete a partir del `model.safetensors` y `config.json` públicos y comprueban que cada registro bf16 coincide byte a byte con la fuente, que cada par de 8 bits se re-deriva de la ley de cuantización y que no hay registros extra; el chequeo reporta 153 registros PASS y dos controles negativos detectados.

## Capacidades

- Decodificación especulativa: propone 7 tokens por ronda que el modelo objetivo verifica, manteniendo la misma secuencia de tokens que la decodificación sin drafter en modo greedy y con semilla fija.
- Aceleración de throughput en decodificación: +12,9 % en un solo stream y +7,3 % en concurrencia 8 (TP=2) frente al drafter empaquetado por defecto del objetivo.
- Mejora acusada en prompts largos: +77 % en código y +79 % en prosa con prompts de 32K tokens y 4.096 tokens greedy (TP=2); +70 % y +66 % respectivamente en TP=1.
- Ahorro de VRAM: reduce el consumo del drafter en el rango 0 de 8,56 GiB a 1,58 GiB en configuración TP=2 con 8 secuencias de 40.960 slots.
- Forma int8 W8A8 con matrix cores para las capas del drafter, seleccionable mediante `--ink-draft-layers iu8`.
- No es un modelo de propósito general: no genera texto de forma autónoma, no soporta tool calling ni agentes por sí mismo, y no tiene capacidades multimodales, de visión ni de audio.
- Idiomas soportados: no disponible.

## Casos de uso

- Aceleración de servidores de inferencia en AMD RDNA4: desplegar Inkling-2-Mini con el motor Saber en una o dos Radeon AI PRO R9700 y activar este drafter para elevar el throughput de decodificación entre un 7 % y un 13 % en cargas interactivas, manteniendo la fidelidad de la salida verificada por el objetivo.
- Procesamiento de documentos largos: con prompts de 32K tokens, el drafter casi duplica la velocidad de generación (91,1 tok/s en código frente a 51,4 del drafter anterior), lo que resulta adecuado para resumen y extracción sobre contratos, informes o código fuente extenso.
- Generación de código en pipelines internos: la mejora del 77 % en decodificación de código con contexto largo permite iterar más rápido en asistentes de programación autoalojados sobre hardware AMD, sin depender de GPUs NVIDIA.
- Despliegue con restricciones de VRAM: al reducir el drafter de 8,56 GiB a 1,58 GiB en el rango 0, libera casi 7 GiB que pueden destinarse a mayor contexto, más secuencias concurrentes o al propio modelo objetivo.
- Servicio multiinquilino con concurrencia 8: las pruebas muestran igualdad de tokens con la ejecución sin drafter en 72 de 72 peticiones concurrentes y needle 16/16, lo que respalda su uso en APIs de chat con varias sesiones simultáneas.
- Validación reproducible de cuantización: los scripts de construcción y verificación permiten auditar la integridad del empaquetado int8 en entornos de investigación que necesiten garantías byte a byte sobre los pesos desplegados.
- Retroceso controlado en producción: el flag `--ink-drafter dspark` permite volver al drafter empaquetado del objetivo sin cambiar el resto del despliegue, útil para comparativas A/B en producción.

## Benchmarks y rendimiento

Mediciones del autor en Saber con 2x y 1x Radeon AI PRO R9700 a 210 W (25 de noviembre de 2026), frente al drafter empaquetado por defecto del objetivo:

| Celda | Drafter empaquetado | Este paquete (iu8, profundidad 7, `prod:0.4:2`) | Cambio |
|---|---|---|---|
| BetterBench `--quick`, un stream, TP=2 (t/s mediana de decodificación) | 141,5 / 136,4 | 153,7 / 160,1 | +12,9 % |
| BetterBench `--quick`, concurrencia 8, TP=2 (t/s agregados) | 291,1 / 294,9 | 313,6 / 315,3 | +7,3 % |
| TTFT p50, un stream / conc-8 (ms) | 76 / 72; 141 / 145 | 81 / 84; 143 / 145 | +8,5 ms en un stream, empate en conc-8 |
| Prompt de 32K tokens + 4.096 tokens greedy, código / prosa, TP=2 (tok/s) | 51,4 / 36,0 | 91,1 / 64,4 | +77 % / +79 % |
| Igual, TP=1 (una tarjeta, 2 x 40.960 slots) | 37,5 / 28,3 | 63,7 / 46,9 | +70 % / +66 % |
| VRAM del drafter en rango 0, TP=2, 8 x 40.960 | 8,56 GiB | 1,58 GiB | -6,98 GiB |

Garantías de fidelidad reportadas: ids greedy 40/40 iguales a la ejecución sin drafter en todos los cortes de `max_tokens` (1 a 11), tres semillas, cadenas de parada, stream igual a no-stream y semilla repetida dos veces; 72/72 peticiones concurrentes iguales a sin drafter; needle 16/16 con concurrencia 8; sha256 de los ids de las celdas de 32K igual al de la ejecución sin drafter en TP=2 y TP=1. Los borradores coinciden en un 97,4 % con un oráculo f32 en host del checkpoint (la cifra aparece truncada en la model card). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo evaluable de forma autónoma.

## Requisitos de hardware

- VRAM estimada del drafter: 1,58 GiB en rango 0 con TP=2 y 8 x 40.960 slots; el paquete completo ocupa 1,39 GB en disco.
- GPU soportadas: AMD RDNA4, en concreto Radeon AI PRO R9700 (objetivo `gfx1201`) con ROCm; el autor mide con una y dos tarjetas a 210 W.
- No cabe ni está pensado para GPUs de consumo NVIDIA: el motor Saber es nativo de ROCm y los ficheros solo cargan en él.
- Despliegue: motor Saber con el brazo DFlash2 (versiones INK48 + INK50; el drafter por defecto requiere INK51). Se coloca junto al paquete objetivo en `$SABER_PACKS/inkling-2-mini-dflash2` o en `<target pack>/dflash2`; `tools/fetch_packs.sh inkling` lo descarga junto con el objetivo.
- Comando de referencia: `saber engine --pack <target pack> --tp 2 ... --ink-serve 8080 --ink-serve-seqs 8 --ink-drafter dflash2 --ink-dflash2-path <carpeta> --ink-mtp 7 --ink-mtp-gate prod:0.4:2 --ink-draft-layers iu8`. En una sola tarjeta: `--pack <target pack>/tp1 --tp 1`.
- Throughput medido: 153,7-160,1 t/s en un stream y 313,6-315,3 t/s agregados con concurrencia 8 en TP=2; TTFT p50 de 81-84 ms en un stream.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para este formato propietario.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-DFlash2-SABER | Drafter especulativo empaquetado para Saber (int8/bf16) | no disponible | no disponible | +12,9 % decodificación un stream; +77-79 % en 32K (TP=2) | Apache-2.0 | Solo motor Saber, ROCm RDNA4 |
| Drafter empaquetado por defecto del objetivo (dspark) | Drafter especulativo del paquete objetivo | no disponible | no disponible | Línea base de las mediciones anteriores | Apache-2.0 (presumible, no confirmado) | Motor Saber |
| incoai/Inkling-2-Mini-DFlash2 | Checkpoint drafter original en safetensors | no disponible | no disponible | No medido en la información disponible | Apache-2.0 | Hugging Face, formato estándar |

No se dispone de datos de otros drafters comparables (EAGLE, Medusa, Lookahead) en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint de propósito general: sus ficheros solo cargan en el motor Saber y dependen del paquete objetivo `Launch80/Inkling-2-Mini-NVFP4-SABER`; no incluye embedding ni `lm_head`.
- Requiere hardware AMD RDNA4 con ROCm (objetivo `gfx1201`); no funciona en GPUs NVIDIA ni en CPUs.
- La fidelidad de la salida depende de la verificación del modelo objetivo; el drafter solo propone y no debe usarse de forma aislada.
- El rendimiento reportado procede de mediciones del propio autor en un entorno concreto (2x/1x R9700, 210 W, Saber, 25-11-2026); las celdas de 32K del drafter empaquetado no se reejecutaron contra el mismo binario, según admite la model card.
- La cifra de coincidencia con el oráculo f32 (97,4 %) aparece truncada en la información disponible.
- Idiomas soportados, sesgos y riesgo de alucinación: no disponibles; al no ser un modelo generativo autónomo, estas propiedades las determina el modelo objetivo.
- Licencia Apache-2.0 heredada del checkpoint fuente, que permite uso comercial, pero sujeta a las restricciones del motor Saber, cuyo licenciamiento no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Launch80/Inkling-2-Mini-DFlash2-SABER
- Modelo base: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Paquete objetivo: https://huggingface.co/Launch80/Inkling-2-Mini-NVFP4-SABER
- Script de construcción: `scripts/build_ink2_dflash2.py` (sha256 `24e4fd3feb9e0d0fcea12be5889dc4ef1ad069e64f18ec68a1543a926502ef6d`)
- Script de verificación: `scripts/check_ink2_dflash2.py` (sha256 `5b36c50d37f7e1468c67cb6e9f92be617c1c8310ba813cc7c7147b8b1c75f885`)
- Manifiesto: `manifest.json` (sha256 `115cf0633333121f2e1ce3ff8d31efb5bebda2fc0ff9bd42cee0c1d574500dfe`)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
