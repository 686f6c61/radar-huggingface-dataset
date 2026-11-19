# prabanta-dev/DeepSeek-V4-Flash-JNS

## Resumen

DeepSeek-V4-Flash-JNS es una conversión al formato JNS del modelo DeepSeek-V4-Flash de DeepSeek, realizada por el desarrollador independiente prabanta-dev para su motor de inferencia Janas-LLM, escrito en C. El objetivo no es reentrenar ni modificar el modelo, sino permitir su ejecución en ordenadores de consumo, incluidos portátiles sin GPU dedicada, mediante lectura bajo demanda de los expertos desde el disco NVMe. Los pesos son los originales de DeepSeek, cuantizados de forma equivalente a la del checkpoint publicado.

El modelo base es un Mixture-of-Experts de 284.000 millones de parámetros totales con 13.000 millones activos por token, distribuidos en 43 capas y 256 expertos enrutados (6 por token más un experto compartido). La innovación del formato JNS radica en que Janas-LLM puede mantener en memoria RAM únicamente los expertos necesarios y leer el resto (unos 147 GB en total) desde el SSD cuando se requieren, lo que reduce el requisito de memoria a 32 GB.

Es relevante porque demuestra la viabilidad de ejecutar un MoE de gran escala en hardware modesto con velocidades de decodificación de aproximadamente 2 tokens por segundo, gracias al uso del bloque de predicción multi-token (MTP) como decodificación especulativa. El repositorio ocupa 159,1 GB y solo es utilizable con el motor Janas-LLM, no con llama.cpp, vLLM ni otras herramientas convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`deepseek4`), 43 capas, hyper-connections de Sinkhorn con cuatro flujos residuales |
| Parametros totales | 284.000 millones (284B) |
| Parametros activos | 13.000 millones (13B) por token |
| Longitud de contexto | no disponible (ventana de atención local de 128 posiciones sobre latentes comprimidos; índice que selecciona 512 latentes) |
| Tipos de cuantizacion | MXFP4 (E2M1 con escala potencia de dos por cada 32) en expertos enrutados; Q8_0 en matrices densas, embeddings y cabeza de salida; F32 en router y normas; I32 en tablas token-experto |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JNS (formato propio de Janas-LLM); no compatible con safetensors, GGUF ni otros formatos estándar |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash es un transformer con mezcla de expertos: 43 capas, 256 expertos enrutados de los que se activan 6 por token, más un experto compartido siempre activo. Las tres primeras capas seleccionan expertos mediante una tabla indexada por identificadores de token en lugar de un router aprendido. La atención opera sobre un latente por posición, con una ventana local de 128 posiciones, latentes comprimidos y un indexador que elige 512 latentes relevantes. El residual se gestiona con hyper-connections de Sinkhorn que mezclan cuatro flujos.

La conversión realizada por prabanta-dev preserva los pesos enrutados bit a bit (mismos códigos y bytes de escala MXFP4, con los nibbles reordenados) y recuantiza las matrices densas de FP8 E4M3 con escala por bloque de 128x128 a Q8_0 con bloques de 32. Los embeddings y la cabeza de salida en BF16 se escriben como Q8_0, el router y las normas se ensanchan a F32 y las tablas token-experto pasan de I64 a I32. El repositorio incluye además un bloque MTP (multi-token prediction) de 3,61 GB cuyos borradores el motor verifica, actuando como decodificación especulativa.

No se dispone de información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, según el uso previsto en el pipeline `text-generation`.
- Razonamiento y respuesta en conversaciones de chat, con soporte de respuestas largas (se cita una prueba de 200 tokens).
- Decodificación especulativa mediante el bloque MTP, que acelera la generación de respuestas largas (2,2 tok/s frente a 1,8 tok/s sin MTP en el hardware de referencia).
- Ejecución en CPU sin GPU, con lectura bajo demanda de expertos desde almacenamiento NVMe.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Inferencia local de un MoE de gran escala en portátiles: el modelo permite ejecutar un modelo de 284B parámetros en una máquina con 32 GB de RAM y SSD NVMe, leyendo los expertos desde disco según se necesitan, lo que resulta adecuado para desarrolladores que quieren probar modelos grandes sin infraestructura de GPU.
- Experimentación e investigación sobre decodificación especulativa: el bloque MTP incluido permite estudiar el impacto del draft-and-verify en la velocidad de generación sobre hardware de consumo, comparando configuraciones con y sin MTP.
- Evaluación de motores de inferencia alternativos: sirve para comparar el rendimiento de Janas-LLM frente a llama.cpp en modelos reducidos (el autor realizó una comparación sobre tres capas con una coincidencia de 2.359 de 2.400 tokens en el token más probable), útil para validar la fidelidad de la conversión.
- Generación de texto offline en entornos sin conectividad: al ejecutarse íntegramente en local con el binario de Janas-LLM para Linux x86-64, puede desplegarse en estaciones de trabajo aisladas para tareas de redacción o asistencia conversacional.
- Pruebas de concepto de despliegue en CPU: adecuado para prototipos donde no hay GPU disponible y la latencia de aproximadamente 2 tok/s es aceptable, como generación de borradores o resúmenes no interactivos.
- Validación de conversiones de pesos: el repositorio documenta verificaciones SHA-256 por shard y comprobaciones de filas de tensores contra el checkpoint original, lo que lo convierte en una referencia para auditar pipelines de conversión de FP4/FP8 a formatos de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son medidas de velocidad y fidelidad en el hardware de referencia (Intel Core Ultra 9 185H, 32 GB DDR5-5600, SSD NVMe de 1 TB a ~5,7 GB/s):

| Medida | Resultado |
|---|---|
| Escritura en caché fría (64 tokens, caché de expertos de 9 GB) | ~2,1 tok/s |
| Respuesta de chat de 200 tokens con MTP | 2,2 tok/s (1,8 tok/s sin MTP) |
| Coincidencia del token más probable frente a llama.cpp (3 capas, 2.400 tokens) | 2.359 de 2.400 |
| Diferencia media de logits frente a llama.cpp (modelo reducido de 3 capas) | 0,028 |

## Requisitos de hardware

- Memoria RAM: 32 GB son suficientes para ejecutar el modelo, ya que los expertos (unos 147 GB) se leen desde el SSD bajo demanda.
- Almacenamiento: se requieren 159,1 GB libres para los dos ficheros JNS (155,48 GB el principal y 3,61 GB el bloque MTP), preferiblemente en SSD NVMe; el autor cita ~5,7 GB/s de lectura.
- CPU: el hardware medido es un Intel Core Ultra 9 185H con AVX2, FMA, F16C y AVX-VNNI; no se especifican otros requisitos de ISA.
- GPU: no se requiere GPU; la información no detalla el comportamiento con aceleración gráfica más allá de indicar que el motor funciona "con o sin GPU".
- Cabe en GPU de consumo: no disponible (el modelo completo no cabe en ninguna GPU de consumo; el formato está pensado para CPU).
- Opciones de despliegue: exclusivamente Janas-LLM (binario Linux x86-64, Ubuntu 22.04, Debian 12 o posterior), mediante `janas-get` y `janas-chat`, o conversión propia con `hf2jns_ds4`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 2,1-2,2 tok/s en el portátil de referencia; el rendimiento depende sobre todo de cuántos expertos caben en memoria y de la velocidad del disco.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-JNS | 284B / 13B | no disponible | JNS (solo Janas-LLM) | MIT | Hugging Face, 0 descargas |
| DeepSeek-V4-Flash (original) | 284B / 13B | no disponible | safetensors (checkpoint original) | MIT | Hugging Face (deepseek-ai) |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de otros modelos comparables, por lo que no es posible establecer una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros JNS solo los lee Janas-LLM; no funcionan con llama.cpp, vLLM, Ollama, TGI ni otras herramientas estándar.
- Rendimiento muy bajo para uso interactivo: ~2 tok/s en el hardware de referencia, lo que limita su uso a tareas no interactivas o de prueba.
- Dependencia del disco: la velocidad depende críticamente del ancho de banda del SSD y de cuántos expertos caben en caché; en discos lentos o con poca RAM el rendimiento puede degradarse notablemente.
- Conversión no validada a escala completa: la comparación con llama.cpp se hizo sobre un modelo reducido de tres capas, no sobre los pesos completos, por lo que la fidelidad global no está verificada empíricamente.
- Licencia: los pesos son de DeepSeek bajo MIT, pero el motor Janas es GPL-3.0-or-later; conviene revisar las implicaciones si se integra el binario en productos propios.
- Idiomas soportados: no disponibles, por lo que no se puede garantizar un comportamiento adecuado en castellano u otras lenguas.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al ser una conversión de pesos sin ajuste adicional, hereda las características del modelo base, que no se documentan aquí.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Fecha de creación futura (19 de noviembre de 2026): conviene verificar la integridad y procedencia de los ficheros antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prabanta-dev/DeepSeek-V4-Flash-JNS
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Motor Janas (repositorio): https://github.com/prabanta-dev/janas
- README de Janas: https://github.com/prabanta-dev/janas#readme
- Binario Janas-LLM para Linux x86-64: https://github.com/prabanta-dev/janas/releases/latest/download/janas-linux-x86_64.tar.gz
