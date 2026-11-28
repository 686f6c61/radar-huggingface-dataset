# kingjones777/Ling-3.0-flash-Research-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

Ling-3.0-flash Research ROCmFP4 STRIX_LEAN es una cuantizacion GGUF del checkpoint `inclusionAI/Ling-3.0-flash`, publicada por el usuario kingjones777 como parte de una familia de builds experimentales orientados a hardware AMD Strix Halo (gfx1151). No se trata de un modelo nuevo ni de una variante reentrenada: los pesos, el alineamiento y el comportamiento son identicos a los del checkpoint original; lo que cambia es la receta de cuantizacion. En concreto, esta build ejecuta la ruta "bare ftype 106" sin `--output-tensor-type`, lo que deja la cabeza LM (`output.weight`) en 4 bits con el tipo `Q4_0_ROCMFP4_FAST` (101) en lugar del `Q6_K` (14) que emplea la build de servicio del mismo autor.

El modelo base es un transformer de tipo MoE con arquitectura `bailingmoe3`, 127.486.405.600 parametros totales, 43 bloques y una cabeza MTP (`nextn_predict_layers = 1`) en el bloque 42, con una longitud de contexto declarada de 262.144 tokens. El repo pesa 68,0 GB y contiene 938 tensores en formato GGUF, lo que situa la cuantizacion en torno a 4,27 bits por peso.

Su relevancia es metodologica, no de producto: existe para medir de forma empirica el coste de proteger la cabeza de salida frente a dejarla en 4 bits. Segun las mediciones del autor, la proteccion cuesta aproximadamente 1,3 t/s de velocidad de decodificacion y 116 MB de espacio, a cambio de evitar un riesgo de calidad que el propio autor describe como severo. Es, por tanto, la mitad "rapida y barata" de un par emparejado, pensada para estudiar ese efecto y no para servir usuarios en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, archivo GGUF `bailingmoe3`, 43 bloques, cabeza MTP en `blk.42` |
| Parametros totales | 127.486.405.600 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (declarada en el GGUF); 131.072 tokens cargados en la medicion del autor |
| Tipos de cuantizacion | `Q4_0_ROCMFP4_STRIX_LEAN` (ftype 106); `output.weight` en `Q4_0_ROCMFP4_FAST` (101); `token_embd.weight` en `Q5_K` (13); ~4,27 BPW |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (requiere build de llama.cpp con soporte ROCmFPX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint `inclusionAI/Ling-3.0-flash`, identificada en el GGUF como `bailingmoe3`: un transformer con mezcla de expertos, 43 bloques y una cabeza de prediccion multi-token (`nextn_predict_layers = 1`) situada en el bloque 42, que habilita decodificacion especulativa con un drafter integrado. El archivo contiene 938 tensores y la fuente es el BF16 GGUF de 255.091.083.232 bytes derivado del checkpoint `inclusionAI/Ling-3.0-flash` en la revision `42766a814ab117e75e2e61465d5e131b72d931a3`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineamiento (RLHF, DPO) del modelo base en la informacion proporcionada. La innovacion tecnica documentada en esta publicacion no reside en el entrenamiento sino en la cuantizacion: el uso de los formatos ROCm-FP4 (ROCmFPX) integrados en llama.cpp para hardware AMD gfx1151, y la comparacion controlada entre dos recetas que solo difieren en el tipo del tensor de salida. El comando exacto de construccion fue `llama-quantize` con tipo `Q4_0_ROCMFP4_STRIX_LEAN` y 16 hilos, omitiendo deliberadamente `--output-tensor-type`.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo, con hasta 262.144 tokens de ventana declarada.
- Modo de razonamiento ("thinking") activable por peticion mediante `chat_template_kwargs.enable_thinking`; desactivado por defecto en el comando de ejemplo.
- Soporte de tool calling: el autor reporta 7/8 llamadas correctas tanto en modo requerido como en modo automatico.
- Decodificacion especulativa mediante la cabeza MTP integrada (`nextn_predict_layers = 1`); en las mediciones el drafter figura como desactivado.
- Cache de prompt funcional: 6.972 de 6.996 tokens reutilizados en el segundo turno.
- Generacion de codigo: medida especifica de 41,6 t/s sobre dos prompts de codigo.
- Capacidades multilingues: no disponible.

## Casos de uso

- Estudio del impacto de la cuantizacion de la cabeza LM: este build existe precisamente para comparar contra la build de servicio del mismo autor y cuantificar la perdida de calidad al dejar `output.weight` en 4 bits. Es su proposito principal y el unico recomendado por el autor.
- Evaluacion de formatos ROCm-FP4 en hardware AMD: sirve para medir en gfx1151 el rendimiento y la fidelidad de los tipos `Q4_0_ROCMFP4_FAST` frente a alternativas como `Q6_K`, con cifras reproducibles de bytes y velocidades.
- Pruebas de decodificacion especulativa con MTP: la cabeza `nextn_predict_layers = 1` permite experimentar con drafters integrados sobre un modelo de 127.000 millones de parametros en una sola maquina con 128 GB de memoria unificada.
- Validacion de tool calling en local: los resultados de 7/8 en modo requerido y automatico permiten comprobar pipelines de function calling sin depender de APIs externas, siempre con la cautela de que la cabeza en 4 bits puede degradar la fiabilidad.
- Benchmarking de motores de inferencia: el autor publica cifras de Super Roc 0.20.0 (453,3 t/s de prompt a 1k, 203,8 t/s a 8k, 44,99 t/s de generacion a 1k, 40,0 t/s a 8k) que sirven como referencia para comparar otros motores sobre el mismo hardware.
- Docencia e investigacion sobre cuantizacion: el par de builds con y sin proteccion de cabeza constituye un caso de estudio con "receipts" verificables (sha256, tipos por nombre exacto de tensor, bytes exactos) para explicar como una decision de un solo tensor afecta a la calidad percibida.
- Integracion en flujos de trabajo con Lemonade: el autor documenta `lemonade pull` y `lemonade chat` apuntando a un binario ROCm de llama.cpp, util para prototipar interfaces de chat locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas son de rendimiento y de integridad del archivo, medidas por el autor en un Ryzen AI Max+ 395 con 128 GB y Super Roc 0.20.0, una peticion a la vez, el 2026-11-23.

| Metrica | Valor |
|---|---|
| Bytes del archivo | 68.020.249.248 |
| sha256 | `f7eff54932de653b7ac2b1ee04d0f5d0d9c26a94b484bbcea07a110fef6588e8` |
| `general.file_type` | 106 |
| Tamano en dry-run → construido | 64.862,93 MiB (4,27 BPW) → +6,235 MiB |
| Decodificacion (build research) | 32,0 t/s |
| Decodificacion (build de servicio, referencia) | 30,7 t/s |
| Prompt (build research) | 103,4 t/s |
| Tiempo de carga | 124 s |
| Prompt tok/s (p1k) | 453,3 |
| Prompt tok/s (p8k) | 203,8 |
| Generacion tok/s (p1k) | 44,99 |
| Generacion tok/s (p8k) | 40,0 |
| Generacion de codigo tok/s | 41,6 (media de 2 prompts) |
| Tool calls (requerido / automatico) | 7/8 / 7/8 |
| Cache de prompt, turno 2 | 6.972 / 6.996 tokens |
| Contexto cargado | 131.072 tokens |

## Requisitos de hardware

- VRAM o memoria unificada: el archivo ocupa 68,0 GB, por lo que la inferencia requiere al menos esa cantidad mas el espacio de contexto. El autor lo ejecuta con 131.072 tokens de contexto en un sistema con 128 GB de memoria unificada.
- GPU objetivo: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151). Es el hardware sobre el que estan tomadas todas las mediciones.
- GPU NVIDIA: no hay datos publicados. El formato ROCmFP4 y los tipos de tensor empleados no estan en llama.cpp mainline, por lo que el soporte en CUDA no esta documentado.
- GPU de consumo: no cabe en ninguna GPU de consumo con memoria dedicada actual, dado el tamano de 68 GB. Solo es viable en sistemas con memoria unificada grande o en configuraciones multi-GPU con al menos 68 GB agregados.
- Opciones de despliegue: exclusivamente builds de llama.cpp con soporte ROCmFPX. El autor proporciona el motor Super Roc (`superroc serve`) y una integracion con Lemonade. llama.cpp estandar, Ollama y LM Studio no pueden cargar el archivo.
- Latencia y throughput: carga en 124 s; 453,3 t/s de prompt a 1k y 203,8 t/s a 8k; 44,99 t/s de generacion a 1k y 40,0 t/s a 8k; 32,0 t/s de decodificacion en la medicion de construccion. Una peticion concurrente a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.0-flash Research ROCmFP4 STRIX_LEAN (este) | 127,49 B | 262.144 | GGUF, ftype 106, cabeza LM en 4 bits | MIT | 32,0 t/s de decodificacion; 68.020.249.248 bytes |
| Ling-3.0-flash ROCmFP4 STRIX_LEAN (build de servicio del mismo autor) | 127,49 B | 262.144 | GGUF, cabeza LM en `Q6_K` | MIT | 30,7 t/s de decodificacion; 68.136.565.408 bytes; recomendada para uso real |
| inclusionAI/Ling-3.0-flash (checkpoint base) | 127,49 B | 262.144 | BF16 GGUF / safetensors | MIT | 255.091.083.232 bytes en BF16; sin cuantizar |
| Otras alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La cabeza LM en 4 bits es un riesgo de calidad real y documentado por el propio autor: afirma haber visto cabezas sin proteger llevar un modelo de 4/5 a 1/5 en sus propias evaluaciones. Este build no debe usarse para servir usuarios.
- Requiere una build de llama.cpp con soporte ROCmFPX. llama.cpp estandar, Ollama y LM Studio no cargan el archivo, lo que limita la portabilidad y complica el mantenimiento.
- El rendimiento esta medido unicamente en gfx1151 (Strix Halo) con Super Roc. No hay datos de latencia ni de calidad en otras plataformas.
- No se han publicado evaluaciones de calidad estandarizadas (MMLU, HumanEval, GSM8K) ni resultados de sesgos o tasas de alucinacion en la informacion disponible.
- Los idiomas soportados no estan documentados, por lo que no puede asumirse cobertura multilingue verificada.
- El modelo base es un MoE de 127.000 millones de parametros: el coste de memoria (68 GB en esta cuantizacion) lo excluye de estaciones de trabajo convencionales y de GPU de consumo.
- La licencia MIT del repositorio de cuantizacion aplica al artefacto publicado; conviene verificar los terminos del checkpoint base `inclusionAI/Ling-3.0-flash` antes de un uso comercial.
- El autor advierte explicitamente de que "Research" se refiere a la receta de cuantizacion y no a una variante sin censura ni a un modelo modificado; quien busque un modelo alterado no lo encontrara aqui.
- Las mediciones de throughput corresponden a una sola peticion concurrente; no hay datos de rendimiento bajo carga concurrente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Ling-3.0-flash-Research-ROCmFP4-STRIX_LEAN-GGUF
- Build de servicio recomendada: https://huggingface.co/kingjones777/Ling-3.0-flash-ROCmFP4-STRIX_LEAN-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentacion de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- Formatos ROCm-FP4 (ROCmFPX): https://github.com/charlie12345/ROCmFPX
