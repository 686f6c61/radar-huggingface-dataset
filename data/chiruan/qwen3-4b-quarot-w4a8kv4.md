# chiruan/Qwen3-4B-QuaRot-W4A8KV4

## Resumen

Qwen3-4B-QuaRot-W4A8KV4 es una version cuantizada del modelo denso Qwen3-4B de Alibaba Qwen, publicada por el usuario chiruan en HuggingFace. Aplica el metodo QuaRot (rotaciones ortogonales tipo Hadamard) combinado con GPTQ para producir un esquema de cuantizacion W4A8KV4: pesos de 4 bits, activaciones de 8 bits y cache KV de 4 bits. El objetivo es reducir el coste de memoria y computo de la inferencia conservando la calidad del modelo original.

El checkpoint declara 4.411.424.256 parametros repartidos en 36 capas, licencia Apache-2.0 y pesos en safetensors con un tamano de repositorio de 8,8 GB. Un detalle critico es que se trata de "fake quantization": los pesos se almacenan descomprimidos en BF16 tras simular la cuantizacion, no en kernels INT4 empaquetados. Por tanto, no reduce la huella de memoria frente a un BF16 equivalente; es un artefacto de investigacion, no una optimizacion lista para produccion.

Su relevancia es doble: permite reproducir y auditar el pipeline RECAP/QuaRot aplicado a Qwen3, y sirve como base para estudiar la degradacion de precision en esquemas W4A8KV4 sobre modelos de 4B. No declara idiomas soportados y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3-4B) |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del autor; el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | W4A8KV4 simulada (fake quantization): W4 simetrica por canal con GPTQ, A8 asimetrica por token, K4/V4 asimetrica en grupos de 128 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (8,8 GB, 399 tensores indexados) |

## Arquitectura y entrenamiento

No hay entrenamiento desde cero: se trata de una cuantizacion post-entrenamiento (PTQ) de Qwen3-4B, un transformer denso de 36 capas. El pipeline aplica rotaciones QuaRot para eliminar valores atipicos antes de cuantizar, y despues ajusta los pesos con GPTQ simetrico por canal (clipping y damping de 0,01). Las activaciones se cuantizan a 8 bits de forma asimetrica por token con clipping de 0,9. La cache KV usa 4 bits asimetricos en grupos de 128 con clipping de 0,95, con TP=1 (sin tensor parallelism documentado). El ajuste de pesos de QuaRot se calcula con precision A16/K16/V16 y en inferencia se instalan A8/K4/V4.

La calibracion se realizo sobre WikiText-2 raw train: 128 ventanas de 2048 tokens con semilla 0. Los pesos finales se guardan descomprimidos en BF16, lo que confirma que no se emplean kernels INT4 empaquetados. El runtime incluido (quarot_runtime/) instala las rotaciones online de Qwen3 y los cuantizadores A/K/V, manteniendo la normalizacion nativa de Q/K. El autor reporta una comprobacion numerica: carga completa del checkpoint (399 tensores indexados) y decodificacion con cache de 16 tokens con semilla 42; se trata de un chequeo corto, no de una validacion de contexto completo ni de una puntuacion de benchmark. La alineacion conversacional y de razonamiento se hereda integramente de Qwen3-4B.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiqueta "conversational" del repositorio).
- Razonamiento (etiqueta "reasoning"); el modelo base Qwen3 incorpora modos de pensamiento explicito.
- Codigo y matematicas basicas heredados de Qwen3-4B.
- Tool calling / function calling: no documentado para esta version; el modelo base Qwen3-4B si lo soporta.
- Agentes y razonamiento multi-paso: no documentado para esta version.
- Capacidades multilingues: no disponible.
- Vision y audio: no soportados (no hay indicios en las etiquetas ni en la ficha).
- Particularidad tecnica: cuantizadores de cache KV a 4 bits integrados en el runtime, con rotaciones QuaRot aplicadas en cada capa.

## Casos de uso

- Reproduccion de experimentos QuaRot/RECAP: el checkpoint y el runtime permitidos permiten replicar la calibracion W4A8KV4 sobre Qwen3-4B y verificar hashes y posiciones de calibracion desde calibration-manifest.json.
- Evaluacion de degradacion de precision: comparar la salida de esta version frente a Qwen/Qwen3-4B en BF16 para medir el impacto del esquema W4A8KV4 en tareas de razonamiento y generacion.
- Investigacion sobre rotaciones online: estudiar como las rotaciones Hadamard interactuan con la normalizacion nativa de Q/K y con la cuantizacion de la cache KV.
- Analisis de cache KV de 4 bits: medir el efecto de K4/V4 en la estabilidad de la atencion en generaciones largas, aunque el peso BF16 no ahorre VRAM.
- Prototipado conversacional en laboratorio: usar el runtime incluido y generate.py para pruebas de dialogo con prompts cortos sobre GPU unica.
- Generacion de codigo y tareas de matematicas en entornos de investigacion, asumiendo la perdida de calidad derivada de la cuantizacion simulada.
- Base para futuras tecnicas de compresion: punto de partida para comparar QuaRot con AWQ, GPTQ o SmoothQuant sobre la misma familia Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato empirico reportado por el autor es una comprobacion numerica: carga de los 399 tensores indexados y decodificacion con 16 tokens en cache con semilla 42. El propio autor aclara que no constituye una puntuacion de benchmark ni una validacion de generacion con contexto completo.

## Requisitos de hardware

- VRAM para pesos: los pesos se almacenan en BF16, unos 8,8 GB; no hay reduccion efectiva frente a un BF16 estandar por tratarse de fake quantization.
- VRAM total estimada para inferencia: en torno a 10-12 GB con contexto corto (estimacion no confirmada por el autor); crece con el contexto por la cache KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G/L4 para uso en servidor; en consumer, RTX 3090 o RTX 4090 (24 GB) son adecuadas.
- GPU consumer: cabe en 24 GB sin problema; en 16 GB (RTX 4080, 4070 Ti) es ajustado y depende del contexto; en 12 GB (RTX 3060) probablemente no sea viable.
- Despliegue: requiere el runtime incluido (quarot_runtime/) junto con transformers y el script generate.py; no hay pesos GGUF, por lo que llama.cpp y Ollama no son compatibles de forma directa. La compatibilidad con vLLM o TGI no esta confirmada, pese a la etiqueta text-generation-inference.
- Latencia y throughput: no disponible; solo se documenta la ejecucion con TP=1 y sin mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-4B-QuaRot-W4A8KV4 | 4,41 B | no disponible (base: 32.768 nativos) | W4A8KV4 simulada, pesos BF16 | Apache-2.0 | safetensors (BF16) |
| Qwen/Qwen3-4B | no disponible cifra exacta en la informacion proporcionada | 32.768 nativos / 131.072 con YaRN | ninguna (BF16) | Apache-2.0 | safetensors |
| Variantes GGUF de Qwen3-4B (comunidad) | sin dato preciso | 32.768 | Q4_K_M, Q5_K_M, Q8_0, etc. | Apache-2.0 | GGUF |

No hay datos de rendimiento publicados para esta version, por lo que la comparacion se limita a parametros, contexto, licencia y formato. Frente a las variantes GGUF o AWQ/GPTQ, la diferencia practica es que esta version no reduce memoria (pesos BF16) y exige un runtime especifico con rotaciones, mientras que las alternativas en GGUF se ejecutan con llama.cpp u Ollama sin dependencias adicionales.

## Limitaciones y advertencias

- Fake quantization: los pesos se guardan en BF16 descomprimido, por lo que no hay ahorro de memoria ni aceleracion por kernels INT4.
- Dependencia de runtime: la carga exige el runtime incluido con rotaciones QuaRot y cuantizadores A/K/V; no es un checkpoint plug-and-play en pipelines estandar.
- Sin benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni similares; la unica validacion es un chequeo de 16 tokens.
- Sin validacion de contexto largo: no se ha verificado la generacion con contexto completo.
- Idiomas no declarados: no se especifica el conjunto de lenguas soportadas.
- Sesgos heredados: al derivar de Qwen3-4B, arrastra los sesgos del modelo base, no documentados en esta ficha.
- Riesgo de alucinacion: presente como en cualquier LLM, y potencialmente agravado por la cuantizacion agresiva de pesos y cache KV.
- Restricciones de uso: la licencia del modelo es Apache-2.0 y permite uso comercial, pero conviene revisar las licencias y procedencias del runtime empaquetado en quarot_runtime/.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- TP=1: no se documenta soporte de tensor parallelism para despliegues multi-GPU.
- Fecha de publicacion reciente (15 de septiembre de 2026), sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chiruan/Qwen3-4B-QuaRot-W4A8KV4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Codigo RECAP (commit referenciado): https://github.com/chi558/RECAP/tree/932b3556cfa4fd947e91155fb195dc8bd76e353d
- Referencia del metodo QuaRot (paper): https://arxiv.org/abs/2404.00456
