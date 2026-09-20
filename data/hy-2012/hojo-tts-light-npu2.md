# HY-2012/Hojo-TTS-Light-NPU2

## Resumen

Hojo-TTS-Light-NPU2 es un paquete de despliegue precompilado para el SoC Axera AX650 del modelo de síntesis de voz Hojo-TTS-Light-40M, un sistema TTS de 40 millones de parámetros que genera audio a 24 kHz en chino e inglés con 15 voces disponibles. Lo publica el usuario HY-2012 sobre el trabajo previo de AXERA-TECH, y su unica diferencia funcional respecto a la version de referencia es el modo de planificacion de NPU: `--npu_mode NPU2` en lugar de NPU3, es decir, el modelo se reparte entre 2 de los 3 nucleos NPU del AX650 y deja el tercero libre para otras tareas.

La relevancia de esta publicacion es de ingenieria de despliegue, no de modelado: demuestra que es posible ejecutar toda la cadena TTS (LM de 10 capas, modulo fine_local y vocoder decoder) integramente en NPU con cuantizacion mixta —s8 en el LM, INT8 en fine_local y SmoothQuant+U16 en el decoder— reservando capacidad de computo para cargas concurrentes, algo critico en dispositivos de borde donde el presupuesto de silicio es fijo.

El repositorio incluye los axmodel precompilados, un SDK C++ para AX650/aarch64, los embeddings de texto, los vectores de locutor y audio de ejemplo generado en placa. Esta construido sobre la revision `9616435bd7` (2026-08-06) del modelo upstream de HojoAI, no sobre la revision posterior del 2026-08-19, y el autor advierte explicitamente de que los assets de ambas revisiones no son intercambiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en tres subgrafos: LM decode-only de 10 capas (ax-llm, llm_build2), modulo fine_local y decoder/vocoder |
| Parametros totales | 40 M aproximados, segun la denominacion del modelo; el repositorio no desglosa el reparto por subgrafo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el consumo se especifica en `max_new_tokens`, con una estimacion de 50 tokens por segundo de audio |
| Tipos de cuantizacion | LM en s8 con hidden bf16; fine_local en INT8; decoder en SmoothQuant+U16 |
| Idiomas soportados | Chino (zh) e ingles (en), segun las etiquetas del repositorio; la ficha de HuggingFace no detalla mas idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | axmodel precompilado (AX Engine) para LM, fine_local y decoder; ficheros auxiliares `embed_tokens.bin`, `speaker_vecs.bin`, `id2code.bin`, `voice.npz` |
| Frecuencia de muestreo de salida | 24 kHz |
| Numero de voces | 15 (indices 0-14) |
| Tamano del repositorio | 0,2 GB |
| Herramienta de conversion | Pulsar2 7.0-patch1 (commit `29f4c81a`), imagen `pulsar2:7.0-patch1` |
| Modelo upstream | `HojoAI/Hojo-TTS-Light-40M` @ `9616435bd7` (2026-08-06) |

## Arquitectura y entrenamiento

La arquitectura es una cadena de tres subgrafos que se ejecuta de forma secuencial en la NPU. El primero es un modelo de lenguaje decode-only de 10 capas (denominado `lm_s8` en el paquete) construido con la ruta `llm_build2` de la toolchain de Axera, cuantizado a s8 con activaciones internas en bf16, que genera la secuencia de tokens acusticos a partir del embedding BF16 del texto de entrada. El segundo, `fine_local`, es un modulo cuantizado a INT8 que refina esa representacion. El tercero, `decoder_sq.axmodel`, actua como vocoder y produce la forma de onda, cuantizado con SmoothQuant en U16. El paquete no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica del repositorio no esta en el modelo sino en el empaquetado: el modo `npu_mode` es una decision de compilacion que queda grabada dentro del axmodel (campo `build_info.npu_mode`), de modo que no hay que modificar el arranque del runtime (`AX_ENGINE_Init` / `eHardMode`) para cambiar el reparto de nucleos; se reutiliza el mismo binario C++ que la version de referencia. El autor documenta con detalle la verificacion de equivalencia funcional entre NPU2 y NPU3: decodificacion argmax en placa identica en 60 de 60 tokens probados con prompts en chino e ingles, y coincidencia en los primeros 30 pasos frente al ONNX fp32 en modo greedy para un prompt en ingles.

## Capacidades

- Sintesis de voz texto-a-audio a 24 kHz con 15 voces seleccionables por indice.
- Soporte bilingue chino-ingles en el mismo paquete, con prompts de texto en ambos idiomas.
- Generacion de audio de duracion variable: aproximadamente 50 tokens por cada segundo de audio, controlable mediante `max_new_tokens`.
- Decodificacion con muestreo configurable (temperatura 0.8, top_p 0.95, repetition_penalty 1.1 por defecto) o con decodificacion greedy determinista.
- Ejecucion integra en NPU sin intervencion de CPU para los tres subgrafos, con salida WAV directa desde el ejecutable C++.
- Ejecucion en un subconjunto de los nucleos NPU del SoC (2 de 3), lo que permite co-residencia con otras cargas.
- No dispone de capacidades de vision, audio de entrada, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Asistente de voz embebido sin conectividad: el paquete corre integramente en el AX650 del dispositivo, de modo que la sintesis no depende de la nube ni expone texto del usuario a servicios externos.
- Lectura de notificaciones y avisos en dispositivos IoT o electrodomesticos: con 15 voces y salida a 24 kHz, el modelo cubre avisos cortos con un coste de computo bajo y un RTF por debajo de 1.
- Generacion de audio para accesibilidad en terminales de punto de venta o paneles industriales: la ventana de generacion es configurable por `max_new_tokens`, por lo que se puede acotar la latencia para frases cortas.
- Locucion de contenidos en chino e ingles con un unico binario: util en productos destinados a ambos mercados sin duplicar el runtime ni el modelo.
- Escenarios de borde multimodal donde la NPU tambien ejecuta vision: al confinar el TTS a 2 nucleos, el tercero queda disponible para otro modelo, segun indica el autor del paquete.
- Integracion en pipelines de CI de producto embarcado: el SDK C++ (`hojo_tts_cpp`, `tts_driver`) permite automatizar pruebas de regresion acustica comparando la transcripcion ASR de las muestras generadas.
- Prototipado y evaluacion de una cadena TTS completa en NPU antes de comprometerse a un ASIC o a un SoC concreto, gracias a que el flujo de conversion con Pulsar2 esta documentado y es reproducible.

## Benchmarks y rendimiento

Verificacion de precision frente a fp32 y frente a la version de referencia (misma entrada fija):

| Subgrafo | Comparacion | Resultado |
|---|---|---|
| LM (ax-llm) | NPU2 vs referencia NPU3, argmax en placa | 60/60 tokens identicos (prompt en chino y en ingles) |
| LM (ax-llm) | NPU2 vs ONNX fp32 greedy (prompt en ingles) | Primeros 30 pasos identicos |
| fine_local | NPU2 vs ONNX fp32 (tramas validas) | cos 0,999649 |
| fine_local | Referencia NPU3 vs ONNX fp32 (tramas validas) | cos 0,999673 |
| fine_local | NPU2 vs referencia NPU3 | cos 0,999361; tasa de bits identicos 99,47% |
| Decoder | NPU2 vs ONNX fp32 (tramas validas) | log-mag 0,999991 / mag 0,999866 / phase 0,999950 |
| Decoder | Referencia NPU3 vs ONNX fp32 (tramas validas) | log-mag 0,995626 / mag 0,951169 / phase 0,967563 |

Prueba en placa AX650N (`Ax_Version V3.10.2_20260323224507`), transcripcion con SenseVoiceSmall y comparacion contra la version de referencia:

| Ejemplo | Similitud de transcripcion NPU2 | Referencia NPU3 |
|---|---|---|
| Frase corta en chino | 100,0% | 100,0% |
| Frase corta en ingles | 88,9% | 87,1% |
| Frase larga en chino | 83,9% | 79,6% |
| Frase larga en ingles | 88,7% | 88,3% |

Rendimiento medido: RTF de 0,49-0,60 en NPU2 frente a 0,44-0,53 en la referencia NPU3, lo que supone un incremento de tiempo de aproximadamente el 12-15% al usar 2 nucleos en lugar de 3. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que no aplican a un modelo TTS.

## Requisitos de hardware

- Plataforma objetivo: SoC Axera AX650 / AX650N con 3 nucleos NPU; este paquete ocupa 2 de ellos.
- VRAM de GPU: no aplica. El paquete es un artefacto precompilado para NPU de Axera y no incluye pesos en safetensors ni GGUF para ejecucion en GPU.
- GPU de consumo: no soportado. No se documenta ruta de ejecucion en RTX, A100, H100 ni similares para estos axmodel.
- Memoria en dispositivo: el repositorio completo ocupa 0,2 GB, lo que da una cota superior holgada del conjunto de pesos y assets, aunque no se detalla el consumo en tiempo de ejecucion ni el pico de memoria.
- Opciones de despliegue: SDK C++ propio (`bin/hojo_tts_cpp` y `tts_driver`) compilado para AX650/aarch64. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato axmodel es propietario.
- Conversion y recompilacion: Pulsar2 7.0-patch1 (commit `29f4c81a`), imagen `pulsar2:7.0-patch1`, con el flujo documentado en el repositorio de GitHub.
- Latencia y throughput: RTF de 0,49-0,60 en AX650N con `Ax_Version V3.10.2_20260323224507`, es decir, entre 1,7 y 2 veces mas rapido que el tiempo real. Usar 2 nucleos en vez de 3 anade un 12-15% de tiempo.
- Restriccion de convivencia: los modos NPU2 y NPU3 ocupan 2 y 3 nucleos respectivamente; cargar simultaneamente modelos compilados en ambos modos puede exceder el numero de nucleos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Voces | Nucleos NPU | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|---|
| HY-2012/Hojo-TTS-Light-NPU2 | 40 M | zh, en | 15 | 2 de 3 | Apache 2.0 | axmodel | Deja un nucleo libre; RTF 0,49-0,60 |
| AXERA-TECH/Hojo-TTS-Light (NPU3) | 40 M | zh, en | 15 | 3 de 3 | Apache 2.0 | axmodel | Version de referencia; RTF 0,44-0,53 |
| HojoAI/Hojo-TTS-Light-40M (revision 20260819) | 40 M | zh, en | 15 | No aplica (modelo upstream) | No disponible en la informacion proporcionada | No disponible | Revision posterior con pesos y `voice.npz` distintos; no mezclar assets con la revision 08-06 |

## Limitaciones y advertencias

- El ejecutable `bin/` incluido ignora el campo `enable_temperature: false` de `post_config.json` en el entorno probado (AX650N / SDK V3.10.2), de modo que sigue muestreando. Para forzar decodificacion argmax hay que desactivar tambien top_p y top_k con la configuracion completa indicada por el autor.
- La decodificacion puramente greedy degenera en repeticion de codigos de silencio con textos largos, un fenomeno ya registrado en el proyecto original. El autor recomienda mantener la configuracion de muestreo (temperatura 0,8 / top_p 0,95 / repetition_penalty 1,1) para entradas largas.
- La version NPU2 no produce salidas identicas bit a bit a la NPU3: fine_local presenta alrededor de un 0,53% de bits invertidos y el coseno de la forma de onda extremo a extremo bajo argmax es de aproximadamente 0,76. El vocoder es sensible al error numerico de fase, por lo que la diferencia numerica no implica necesariamente diferencia audible, pero tampoco se ha hecho evaluacion subjetiva de escucha.
- Con un modelo de 40 M, la calidad se resiente en ingles y en frases largas: la similitud de transcripcion cae al 83,9-88,9%. El autor atribuye parte del error al propio modelo y al reconocedor ASR, y senala dificultades con nombres de marca, no al cambio de modo NPU.
- Riesgo de mezcla de assets: la revision 08-06 y la revision 20260819 del modelo upstream tienen pesos y `voice.npz` diferentes. Combinar axmodel, `embed_tokens.bin`, `speaker_*.bin` o `voice.npz` de revisiones distintas produce resultados invalidos.
- El modo de NPU es una decision de compilacion grabada en el axmodel; no se puede cambiar en tiempo de ejecucion con `eHardMode`, por lo que cada configuracion de reparto de nucleos requiere recompilar.
- No hay datos publicados sobre sesgos del modelo, composicion del dataset de entrenamiento ni evaluacion de robustez frente a entradas adversarias.
- La licencia Apache 2.0 del repositorio de despliegue no aclara por si sola la licencia ni las condiciones de los pesos del modelo upstream; conviene verificar la ficha de `HojoAI/Hojo-TTS-Light-40M` antes de un uso comercial.
- El repositorio no tiene descargas ni valoraciones en el momento de la consulta, por lo que no existe validacion independiente de la comunidad sobre este paquete concreto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HY-2012/Hojo-TTS-Light-NPU2
- Version de referencia en NPU3: https://huggingface.co/AXERA-TECH/Hojo-TTS-Light
- Modelo upstream: https://huggingface.co/HojoAI/Hojo-TTS-Light-40M
- Repositorio de conversion y reproduccion: https://github.com/ml-inory/hojo-tts-light.axera
- La busqueda web realizada no ha devuelto resultados relevantes sobre el modelo; los enlaces obtenidos corresponden a temas homonimos sin relacion (Citroen HY, el grupo musical HY y canales de YouTube ajenos al proyecto).
