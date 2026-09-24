# Feyd89/Qwen3.8-27B-QUASAR-QAT-nvfp4-NInfer

## Resumen

Qwen3.8-27B QUASAR-QAT NVFP4 NInfer es un artefacto de pesos cuantizados en formato `.ninfer` v3, publicado por el usuario Feyd89, que empaqueta el checkpoint QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 para el runtime NInfer en su variante de paralelismo tensorial a dos GPUs (fork `ValerioDolci/ninfer-tp2`). No es un modelo nuevo ni un entrenamiento propio: es una conversión de formato que preserva la cuantización NVFP4 de origen (entrenamiento consciente de cuantización, QAT) en las 512 proyecciones del modelo, y que reduce el peso en disco a 17,0 GiB frente a los 20,9 GiB del artefacto oficial equivalente.

La relevancia práctica está en el ahorro de memoria: en la configuración medida sobre dos RTX 5070 Ti de 16 GB, este artefacto ocupa 13.083 / 12.743 MiB por placa, frente a 15.035 / 14.695 del artefacto oficial. Ese margen permite servir el contexto completo de 262.144 tokens con torre de visión y 8 slots de estado de dispositivo, o bien mantener el modelo en placas de 16 GB con holgura.

El modelo subyacente es Qwen3.8-27B (27.000 millones de parámetros, licencia Apache-2.0), con torre de visión y cabecera MTP (multi-token prediction) para decodificación especulativa. La model card publica una comparación pareada exhaustiva frente a vLLM 0.30 y frente al artefacto NVFP4 oficial, con diferencias dentro del ruido estadístico en GSM8K, MMLU-Pro e IFEval, y una mejora de velocidad de decodificación del 9-18 % y de prefill de hasta el 25 %. El repositorio, creado y actualizado el 24 de septiembre de 2026, registra 0 descargas y 0 «likes» en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada en detalle; artefacto con componentes de texto, visión y MTP, con proyecciones GDN en las capas |
| Parametros totales | 27.000 millones (27B, segun la denominacion del modelo) |
| Parametros activos | No aplica: no se documenta una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | 262.144 tokens (maximo del runtime con este artefacto); la configuracion de produccion medida sirve 196.608 tokens con vision y 4 slots de estado |
| Tipos de cuantizacion | NVFP4 (512 proyecciones), FP8 (lm_head y embeddings), BF16 (proyecciones GDN a/b, normas), Q4-Q8 (torre de vision y cabecera MTP); KV cache INT8 |
| Idiomas soportados | No disponible (no se declara lista de idiomas; se publican evaluaciones de traduccion italiano-ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` v3 (17,4 GB en disco); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El artefacto no introduce arquitectura propia: es una reempaquetado del checkpoint QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4, que a su vez parte de Qwen/Qwen3.8-27B. La cuantizacion se ha realizado mediante entrenamiento consciente de cuantizacion (QAT) por parte de los autores de QUASAR, con todas las proyecciones de cada capa en NVFP4. La conversion a `.ninfer` importa las proyecciones NVFP4 tal y como las codifica QUASAR (codigos, escalas de bloque y escala global), sin recuantizar. El `lm_head` y los embeddings se mantienen en filas FP8, siguiendo el metodo del artefacto oficial. Las proyecciones GDN `a` y `b` se decodifican de NVFP4 a BF16 porque el runtime las requiere sin cuantizar, y las normas se conservan tal cual.

La torre de vision y la cabecera MTP se leen de las copias en BF16 presentes en el checkpoint QUASAR y se cuantizan con las elecciones `_optional` oficiales (Q4-Q8). El artefacto incluye los componentes `text`, `vision` y `mtp`; el borrador DFlash2 no esta incluido. La revision de origen es `15d2e47b`. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base, mas alla de que la cuantizacion se obtuvo por QAT. El proceso de conversion se ejecuta con `--device cpu` en unos dos minutos con 0,75 GB de RAM, sin necesidad de una copia BF16 de Qwen3.8-27B.

## Capacidades

- Generacion de texto y razonamiento con modo «thinking» activable (las evaluaciones de GSM8K, MMLU-Pro e IFEval se realizaron con thinking activado).
- Razonamiento matematico: 0,985 en GSM8K (200 ejemplos, 5-shot, thinking).
- Vision: el artefacto incluye torre de vision y se sirve con `--vision`, con un limite de 4.096 tokens de vision en la configuracion medida.
- Decodificacion especulativa mediante la cabecera MTP incluida (`--spec mtp --draft-tokens 3`).
- Compatibilidad con la API de OpenAI: la sonda de compatibilidad cubre chat, streaming, tool calls, vision y salidas de 32k tokens, con 12/12 pruebas superadas (thinking desactivado).
- Tool calling / function calling mediante la plantilla de chat `qwen3_8.jinja` incluida como recurso en la conversion.
- Traduccion automatica: COMET (wmt22-comet-da) sobre FLORES-200 devtest, 200 frases por direccion, thinking off: it→en 0,8850 y en→it 0,8910.
- Contexto largo: suite sintetica de aguja y multi-hop con distractores, 12 ensayos por longitud, thinking off: 1,000 global a 8k y 0,667 a 126k.
- Capacidades multilingues: no documentadas en la model card; solo hay evidencia publicada para el par italiano-ingles.

## Casos de uso

- Servicio local de un modelo de 27B en dos GPUs de gama alta de consumo: el artefacto ocupa 13.083 / 12.743 MiB por placa en 2× RTX 5070 Ti de 16 GB sin P2P, lo que permite ejecutar el modelo completo sin recurrir a instancias en nube.
- Contexto muy largo con vision activada: el runtime admite 262.144 tokens de contexto con torre de vision y 8 slots de estado de dispositivo, adecuado para analisis de documentos extensos o repositorios de codigo acompanados de capturas.
- Atencion al cliente automatizada con contexto multi-turno: la ventana de 196.608 tokens de la configuracion de produccion permite mantener historiales largos, aunque conviene asumir la degradacion medida a 126k (0,667 en la suite de contexto largo) y evitar el multi-hop en esa franja.
- Traduccion automatica italiano-ingles en produccion: las puntuaciones COMET de 0,8850 (it→en) y 0,8910 (en→it) son practicamente identicas a las del artefacto NVFP4 oficial, por lo que puede sustituirlo sin perdida medible de calidad.
- Asistentes con function calling integrados en flujos de automatizacion: la sonda de compatibilidad con la API de OpenAI cubre tool calls y salidas de hasta 32k tokens, lo que facilita conectarlo a orquestadores de agentes existentes.
- Razonamiento matematico y resolucion de problemas paso a paso: el 0,985 en GSM8K con thinking permite usarlo en tareas de verificacion aritmetica o generacion de soluciones razonadas en entornos educativos o de analisis financiero.
- Reduccion de huella de memoria en despliegues existentes: al necesitar 17,0 GiB de pesos en lugar de 20,9, libera aproximadamente 2 GiB por placa que pueden reasignarse a cache KV adicional o a mayor concurrencia.
- Inferencia de baja latencia con decodificacion especulativa: el uso de la cabecera MTP con 3 tokens de borrador y la mejora del 9-18 % en decodificacion respecto al artefacto oficial lo hacen adecuado para servicios interactivos.
- Evaluacion comparativa de runtimes: sirve como artefacto de referencia para comparar el rendimiento de NInfer frente a vLLM 0.30 con exactamente los mismos pesos QUASAR.

## Benchmarks y rendimiento

Comparacion pareada por item frente a los mismos pesos QUASAR servidos por vLLM 0.30 (prueba exacta de McNemar; una ejecucion por tarea, T = 0):

| Tarea | NInfer tp2 | vLLM 0.30 | Diferencia (IC 95 %) | p McNemar |
|---|---:|---:|---:|---:|
| GSM8K (200, 5-shot, thinking) | 0,985 | 0,975 | +1,0 pt [−1,4, +3,4] | 0,69 |
| MMLU-Pro (308 = 22 × 14 categorias, CoT, thinking) | 0,789 | 0,802 | −1,3 pt [−4,0, +1,4] | 0,48 |
| IFEval (200, estricto a nivel de prompt, thinking) | 0,870 | 0,880 | −1,0 pt [−5,6, +3,6] | 0,83 |

Frente a los pesos NVFP4 oficiales (`unsloth/Qwen3.8-27B-NVFP4` sobre vLLM): MMLU-Pro −1,0 pt (p 0,65), IFEval ±0 (p 1,00), GSM8K +0,5 (p 1,00).

| Metrica adicional | Este artefacto | Referencia oficial |
|---|---:|---:|
| COMET it→en (FLORES-200 devtest) | 0,8850 | 0,8847 |
| COMET en→it (FLORES-200 devtest) | 0,8910 | 0,8918 |
| Contexto largo global a 8k | 1,000 | 1,000 (+1 ensayo a favor del oficial) |
| Contexto largo global a 126k | 0,667 | 0,667 |
| Multi-hop a 126k | 0/4 | 0/4 |
| Sonda de compatibilidad OpenAI | 12/12 | no disponible |

Rendimiento de servicio en `--tp 2` (relojes eco, 2.100 MHz): decodificacion entre un 9 % y un 18 % superior al artefacto NVFP4 oficial; prefill de 4.892 t/s a 8k (oficial 3.920 t/s) y 2.521 t/s a 126k (oficial 2.238 t/s). Nota metodologica del autor: con `max_gen_toks 8192` y lectura de la respuesta solo desde `content`, las respuestas vacias por agotar el presupuesto de thinking cuentan como incorrectas (15/308 en MMLU-Pro y 10/200 en IFEval en este artefacto, frente a 16/308 y 10/200 en vLLM). La regla preregistrada del autor marcaba como «indeterminada» una desviacion conjunta MMLU-Pro + IFEval superior a −2 pt frente a vLLM; la suma medida es −2,3 pt (23 frente a 17 items discordantes sobre 508, p ≈ 0,43).

## Requisitos de hardware

- VRAM de los pesos: 17,0 GiB (artefacto oficial de referencia: 20,9 GiB). Tamano en disco: 17,4 GB.
- Configuracion verificada: 2× RTX 5070 Ti de 16 GB con `--tp 2`, sin P2P, con 13.083 / 12.743 MiB por placa usando `--kv-dtype int8 --max-context 196608 --kv-capacity 196608 --device-state-slots 4 --max-concurrency 1 --spec mtp --draft-tokens 3 --vision --vision-device 0 --max-vision-tokens 4096`.
- Contexto completo: 262.144 tokens con `--vision` y 8 slots de estado de dispositivo tambien caben en ese hardware.
- Monoplaca: `--tp 1` deberia caber en una tarjeta `sm_120a` (Blackwell) de 24 GB o mas; el autor indica que no esta probado.
- La cuantizacion NVFP4 exige arquitectura `sm_120a` (Blackwell); no hay soporte declarado para generaciones anteriores.
- Rendimiento medido: prefill de 4.892 t/s a 8k y 2.521 t/s a 126k; decodificacion un 9-18 % mas rapida que el artefacto oficial en las mismas condiciones.
- Opciones de despliegue: `ninfer-serve` del fork `ValerioDolci/ninfer-tp2` (commit `d24bffd2` o posterior para las proyecciones partidas NVFP4), con el runtime monoplaca de `Neroued/ninfer` como alternativa sin verificar. vLLM 0.30 se uso unicamente como referencia de comparacion con los pesos QUASAR, no con este artefacto `.ninfer`.
- Conversion: `python3 -m tools.convert` con la receta `quasar_recipe.py`; con `--device cpu` tarda unos dos minutos y consume 0,75 GB de RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso / VRAM | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este artefacto (Feyd89, `.ninfer` v3) | 27B | 262.144 tokens | 17,0 GiB; 13.083 / 12.743 MiB por placa a `--tp 2` | NVFP4 en 512 proyecciones, FP8 en head/embeddings, BF16 en GDN a/b | Apache-2.0 | Publicado; 0 descargas y 0 likes |
| `qwen3_8_27b_nvfp4.ninfer` oficial | 27B | 262.144 tokens | 20,9 GiB; 15.035 / 14.695 MiB por placa a `--tp 2` | NVFP4 en MLP de capas 0-55, FP8 en el resto | Apache-2.0 | Artefacto de referencia del runtime |
| `unsloth/Qwen3.8-27B-NVFP4` | 27B | no disponible | no disponible | NVFP4 | Apache-2.0 | Pesos NVFP4 para vLLM |
| `QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4` (checkpoint fuente) | 27B | no disponible | no disponible | NVFP4 (QAT) mas vision, MTP y head en BF16 | Apache-2.0 | Checkpoint de origen |
| `Qwen/Qwen3.8-27B` (modelo base) | 27B | no disponible | no disponible | BF16 | Apache-2.0 | Modelo base original |

En calidad medida, la comparativa frente a los pesos NVFP4 oficiales arroja diferencias no significativas (MMLU-Pro −1,0 pt con p 0,65; IFEval ±0 con p 1,00; GSM8K +0,5 con p 1,00), y frente a vLLM 0.30 las tres tareas quedan dentro del ruido pareado. La ventaja diferencial es de memoria y velocidad, no de precision.

## Limitaciones y advertencias

- Verificado unicamente con el modo de dos GPUs del fork sobre placas `sm_120a` (Blackwell). El runtime monoplaca de upstream deberia cargarlo por compartir el formato v3, pero no se ha probado.
- No incluye el componente DFlash2; la model card menciona una variante adicional cuyo texto queda truncado («A variant with...»).
- Degradacion en contexto largo: la suite sintetica baja de 1,000 a 8k a 0,667 a 126k, y el multi-hop a 126k obtiene 0/4 tanto con este artefacto como con los pesos oficiales. No es fiable para razonamiento multi-salto en ventanas muy extensas.
- Respuestas vacias por agotamiento del presupuesto de thinking: 15/308 en MMLU-Pro y 10/200 en IFEval, contabilizadas como incorrectas. En produccion conviene monitorizar y ampliar el presupuesto de generacion.
- La configuracion medida usa `--max-concurrency 1`, lo que limita el despliegue a cargas de baja concurrencia en ese hardware.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes) y ausencia de validacion independiente: todas las metricas proceden del propio autor, con una unica ejecucion por tarea.
- No hay informacion declarada sobre sesgos, datos de alineacion, RLHF/DPO ni lista de idiomas soportados; solo hay evidencia publicada para italiano e ingles en traduccion.
- Riesgo de alucinacion no cuantificado en la informacion disponible. Como en cualquier modelo de 27B servido en produccion, requiere verificacion de salidas en dominios factuales.
- Requiere hardware Blackwell (`sm_120a`) por la cuantizacion NVFP4; no es desplegable en GPUs anteriores.
- Licencia Apache-2.0 en todos los componentes de la cadena (modelo base, checkpoint QUASAR, runtime NInfer y este artefacto), por lo que el uso comercial esta permitido, pero el autor del artefacto no reclama credito sobre la cuantizacion y no ofrece garantias.
- El repositorio solo contiene el artefacto `.ninfer`, la receta de conversion y la plantilla de chat; no se distribuyen pesos en safetensors ni GGUF, lo que impide usarlo con llama.cpp, Ollama o TGI.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Feyd89/Qwen3.8-27B-QUASAR-QAT-nvfp4-NInfer
- Checkpoint fuente (QUASAR-QAT): https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos NVFP4 oficiales usados como referencia: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Runtime monoplaca (Neroued/ninfer): https://github.com/Neroued/ninfer
- Fork de dos GPUs con paralelismo tensorial: https://github.com/ValerioDolci/ninfer-tp2
- Receta de conversion: `quasar_recipe.py`, en la raiz del repositorio de HuggingFace
- No se han encontrado enlaces adicionales (papers, blogs o demos) en la busqueda web; los resultados devueltos fueron paginas genericas sin contenido relevante sobre el modelo.
