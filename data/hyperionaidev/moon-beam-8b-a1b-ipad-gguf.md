# hyperionaidev/Moon-Beam-8B-A1B-ipad-GGUF

## Resumen

Moon-Beam-8B-A1B-ipad-GGUF es una cuantización GGUF extrema del modelo MoE tablinum/Moon-Beam-8B-A1B-Preview, publicada por hyperionaidev dentro del proyecto smolmaxxing. El objetivo no es servir el modelo en infraestructura convencional, sino demostrar que un modelo de 7.744.178.176 parámetros totales puede ejecutarse en un iPad Air de 2013 (Apple A7 de dos núcleos, 1 GB de RAM, iOS 12.5.7 con jailbreak), un dispositivo que el llama.cpp estándar ni siquiera puede cargar porque iOS 12 limita el mapeo de un proceso a unos 1,7 GB y el fichero ocupa 2,75 GB.

La solución técnica pasa por reorganizar el GGUF: los expertos se colocan al final del fichero, de modo que solo los primeros 474 MB (parte no experta en Q4_K) deben mapearse en memoria, y cada experto (0,774 MB) se lee desde flash cuando el router lo selecciona. Los expertos están cuantizados a Q2_K con una imatrix derivada de una muestra de Wikipedia y Project Gutenberg, mientras que atención, DeltaNet, experto compartido, embeddings y cabeza de salida se mantienen en Q4_K. La cabeza de salida está podada a 60.000 de las 157.184 filas del vocabulario original.

Es relevante como referencia de ingeniería para despliegue en el extremo: documenta latencias reales (3,5 tok/s con 8 expertos por token), curvas de calidad frente a velocidad (perplejidad de 18,52 con 8 expertos hasta 23,60 con 4) y un parche específico de llama.cpp para iOS 12. No es un artefacto para producción general: requiere el llama.cpp parcheado del repositorio y el fichero `mb-q2-h60-lut.gguf` tiene los expertos reempaquetados para un kernel de tabla de búsqueda (`vqtbl1q`), por lo que en cualquier otro llama.cpp la salida es basura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer con DeltaNet; cuantización GGUF para llama.cpp |
| Parametros totales | 7.744.178.176 |
| Parametros activos | 8 expertos por token recomendado (configurable entre 4 y 8 en el pager) |
| Longitud de contexto | 512 tokens en la configuración medida (`-c 512`); no se documenta el máximo del modelo base |
| Tipos de cuantizacion | Expertos Q2_K (con imatrix); resto (atención, DeltaNet, experto compartido, embeddings, cabeza) en Q4_K |
| Idiomas soportados | No disponible (la model card no lo especifica) |
| Licencia | MIT |
| Formato de pesos | GGUF (`mb-q2-h60-lut.gguf` y `mb-q2-h60-xl.gguf`), 2,75 GB cada uno |

## Arquitectura y entrenamiento

El modelo base es un MoE de aproximadamente 8B parámetros totales con componentes de atención y DeltaNet, según se deduce de la descripción de las capas no expertas. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO; esa información corresponde al modelo original tablinum/Moon-Beam-8B-A1B-Preview y no se reproduce aquí. Lo que sí documenta esta publicación es el proceso de cuantización y reempaquetado.

La innovación principal es el diseño de layout para memoria restringida: los expertos se sitúan al final del fichero (`tools/gguf_experts_last.py`) para que el mapeo inicial se limite a 474 MB, y en la variante `lut` los bloques Q2_K de cada experto se reagrupan en 16 filas × 256 columnas para un kernel de tabla de búsqueda con `vqtbl1q` (`tools/gguf_q2lut.py`). El reempaquetado altera la perplejidad solo un +0,1 % respecto al kernel estándar. La cabeza de salida se poda a 60.000 filas más un tensor `output_ids`. El runtime usa un pager de expertos con pool en RAM, prefetch de la siguiente capa, política de expulsión LFU (0,95) y un sesgo de enrutado (`GGML_MOE_BIAS`) que favorece expertos ya residentes en memoria.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento básico verificado en tres preguntas de prueba: un dato factual, una explicación y recuperación de la primera pregunta del contexto.
- Ejecución en modo sin *thinking* (`--no-think`), con penalización de repetición configurable.
- Enrutado MoE con selección dinámica de expertos por token y ajuste del número de expertos activos en tiempo de ejecución.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües explícitas.
- El vocabulario de generación está restringido a las 60.000 filas de la cabeza podada; los prompts pueden usar todos los tokens, pero la salida no.

## Casos de uso

- Investigación de despliegue en el extremo: reproducir el experimento en un iPad Air de 2013 con jailbreak para estudiar el compromiso entre RAM mapeada, lecturas desde flash y velocidad de generación; el modelo sirve como banco de pruebas reproducible con cifras publicadas.
- Docencia sobre cuantización MoE: ilustrar cómo Q2_K con imatrix en los expertos y Q4_K en el resto afecta a la perplejidad (18,52 con 8 expertos frente a 23,60 con 4), con una curva medida token a token.
- Evaluación de políticas de caché de expertos: el runtime expone pool, prefetch, LFU y sesgo de enrutado, lo que permite medir hits, misses y tiempo de flash con `GGML_MOE_STATS=1` en hardware con almacenamiento lento.
- Pruebas de concepto de asistentes conversacionales offline en dispositivos antiguos: con 3,5 tok/s y 600-625 MB de RSS pico, es viable para respuestas cortas en contextos de 512 tokens sin conexión.
- Desarrollo de kernels específicos para ARMv8 sin dotprod: el kernel de tabla de búsqueda `vqtbl1q` sirve de referencia para optimizar matmuls cuantizados en CPUs sin instrucciones vectoriales modernas.
- Validación de pipelines de conversión GGUF: los scripts `gguf_experts_last.py` y `gguf_q2lut.py` permiten experimentar con reordenación de tensores y verificar que la perplejidad se mantiene dentro del +0,1 %.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos medidos que sí se publican son de rendimiento y perplejidad en el dispositivo:

| Expertos por token | Sesgo de caché | tok/s en iPad | Perplejidad | Delta frente a 8 expertos |
|---|---|---|---|---|
| 8 (recomendado) | 0,03 | 3,47-3,60 | 18,52 | ±0 |
| 7 | 0,05 | 4,02-4,04 | 18,70 | +0,4 % |
| 6 | 0,05 | 4,32 | 19,33 | +3,8 % |
| 5 | 0,03 | 4,54 | 20,54 | +10 % |
| 4 | 0,03 | 4,92-5,12 | 23,60 | +27 % |

Datos adicionales medidos: prompt a 4,2-4,3 tok/s; RSS pico de 600-625 MB; perplejidad de referencia de 18,62 con 8 expertos y sin sesgo; desglose por token de aproximadamente 0,3 s, con unos 130 ms de espera de lecturas de flash (unos 53 MB por token a 266 MB/s), 109 ms de matmuls Q4_K no expertos y 60 ms de expertos Q2_K. La variante `xl` sin kernel de tabla de búsqueda es un 4 % más lenta (2,94 tok/s frente a 3,06 tok/s en la misma prueba de top-4 con prefetch).

## Requisitos de hardware

- VRAM/RAM: el diseño apunta a 1 GB de RAM total en el dispositivo; el RSS pico medido es de 600-625 MB con pool de 14 expertos.
- GPU recomendadas: no aplica; el artefacto está pensado para CPU ARM (Apple A7). No hay datos de ejecución en A100, H100 o RTX 4090.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo; el fichero `lut` no funciona en llama.cpp estándar, LM Studio ni Ollama.
- Despliegue: exclusivamente llama.cpp parcheado del repositorio smolmaxxing (commit `1945793` con `ipad-air/patches/llama.cpp-ios12.patch`), compilado con el SDK de iPhoneOS de Xcode 15.4, firmado con `ldid -Sent.xml` y ejecutado vía SSH sobre USB. No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: 3,47-3,60 tok/s con 8 expertos y sesgo 0,03; hasta 4,92-5,12 tok/s con 4 expertos a cambio de +27 % de perplejidad; prompt a 4,2-4,3 tok/s.
- Advertencias de estabilidad: no aumentar el pool por encima de 14 ni fijar los pesos en RAM; ambas acciones provocaron kernel panic en el iPad según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B-ipad-GGUF | 7.744.178.176 totales, 8 expertos activos | 512 en la config medida | MIT | GGUF con llama.cpp parcheado | Optimizado para iPad Air 2013, 3,5 tok/s, 600-625 MB RSS |
| tablinum/Moon-Beam-8B-A1B-Preview | 8B MoE (según nombre) | No disponible | MIT | Pesos originales | Modelo base; sin datos de rendimiento en esta información |
| hyperionaidev/Moon-Beam-8B-A1B-tvbox-GGUF | Mismo modelo base | No disponible | MIT | GGUF para TV box | Fichero del que derivan estos; sin cifras comparativas publicadas |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de otros autores en la información proporcionada, por lo que no es posible una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Requiere obligatoriamente el llama.cpp parcheado del repositorio smolmaxxing; con llama.cpp estándar, LM Studio u Ollama el fichero `lut` produce salida corrupta porque los expertos están reempaquetados para el kernel `vqtbl1q`.
- La cabeza de salida está podada a 60.000 de 157.184 filas: el modelo no puede generar tokens fuera de ese subconjunto del vocabulario.
- La cuantización Q2_K en los expertos degrada la calidad de forma medible: pasar de 8 a 4 expertos incrementa la perplejidad un 27 % (de 18,52 a 23,60).
- El contexto medido es de 512 tokens; no se documenta el máximo soportado por el modelo base en esta configuración.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni evaluación de seguridad en la model card.
- Las cifras de velocidad y estabilidad provienen de un único dispositivo (iPad Air 2013 con jailbreak); no son extrapolables a otro hardware.
- El pool de expertos no debe superar 14 ni los pesos deben fijarse en RAM: ambas configuraciones provocaron kernel panic en las pruebas del autor.
- Aunque la licencia es MIT, el uso en producción requeriría verificar la licencia y condiciones del modelo base tablinum/Moon-Beam-8B-A1B-Preview, cuya model card completa no se incluye aquí.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hyperionaidev/Moon-Beam-8B-A1B-ipad-GGUF
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Fichero TV box de origen: https://huggingface.co/hyperionaidev/Moon-Beam-8B-A1B-tvbox-GGUF
- Repositorio smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Documento de experimentos (secciones 21.8-21.10): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Instrucciones de compilación para iPad: https://github.com/hyperionaidev/smolmaxxing/blob/main/ipad-air/README.md
