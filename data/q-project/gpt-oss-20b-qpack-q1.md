# q-project/gpt-oss-20b-qpack-q1

## Resumen

gpt-oss-20b-qpack-q1 es una versión cuantizada a 1 bit del modelo openai/gpt-oss-20b, publicada por el proyecto q-project (Q-Project-LM). El objetivo es demostrar que un modelo MoE de 20.000 millones de parámetros puede comprimirse post-entrenamiento hasta caber en una GPU legacy de 8 GB (una Tesla P4, Pascal, sin tensor cores) sin ningún reentrenamiento, midiendo de forma explícita el coste en calidad que ello supone. El resultado es un fichero único de 8.082,5 MiB (8.475.165.248 bytes) en el contenedor propietario `.qpack`, que integra tokenizer y pesos en formato mmap-able.

La aproximación es agresiva y selectiva: los expertos del MoE (alrededor del 90 % de los bytes) se recuantizan por experto bajo un presupuesto de tamaño, mezclando expertos exactos en MXFP4 original, expertos en dos planos de 1 bit con cuantizador Lloyd de 4 niveles y expertos en un solo plano de 1 bit con escala fp16. La atención se guarda en int8 con escala fp16 por cada 32 columnas, el embedding en f16 en host y el router en f32.

Es relevante ahora porque explora los límites prácticos de la cuantización extrema en arquitecturas MoE y porque publica resultados honestos de perplejidad en lugar de ocultar la degradación: el modelo es entre 1,7 y 3,6 veces peor que la referencia en perplejidad de texto crudo, con un impacto especialmente severo en ruso. No es un reemplazo directo del modelo base, sino una release de investigación con pérdida de calidad real y documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base: gpt-oss-20b, 24 capas, 32 expertos, top-4) |
| Parametros totales | 20.000 millones (modelo base) |
| Parametros activos | top-4 de 32 expertos por token (modelo base) |
| Longitud de contexto | 4.096 tokens en el modelo base; en la practica se recomienda `-c 512` en GPU de 8 GB por limite de KV cache |
| Tipos de cuantizacion | 1-bit (un plano), 2-bit (dos planos, Lloyd de 4 niveles), MXFP4 exacto en expertos; int8 en atencion; f16 en embedding; f32 en router |
| Idiomas soportados | en, ru (segun model card; el calibrado uso textos en ingles y ruso) |
| Licencia | Apache-2.0 (sujeta a la politica de uso de gpt-oss del modelo base) |
| Formato de pesos | `.qpack` (contenedor propietario, fichero unico `gptoss-20b.c8b.qpack`, mmap-able, tokenizer incluido) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 24 capas con 32 expertos y enrutamiento top-4, cuyos expertos vienen originalmente en MXFP4. Sobre esa base, q-project aplica una cuantizacion post-entrenamiento por experto, sin ningún paso de entrenamiento adicional. De los 768 expertos totales, 249 se conservan exactos en MXFP4 (4,25 bits), 227 se almacenan en dos planos de 1 bit con un cuantizador Lloyd de 4 niveles (aproximadamente 2,25 bits) y 292 se reducen a 1 bit por peso con una escala fp16 por cada 128 columnas.

La asignación de qué expertos permanecen exactos se decide a partir de la energía de salida enrutada normalizada por token, mediante una asignación convexa bajo un presupuesto de tamaño. Los expertos en 1 bit y en dos planos aplican feedback de error al estilo GPTQ, usando una matriz Hessiana por capa calculada a partir de activaciones de entrada del router capturadas sobre 16.000 tokens de texto en inglés y ruso (Wikipedia y libros de dominio público). La atención se cuantiza a int8 con escala fp16 por cada 32 columnas (`q8g`), el embedding se mantiene en f16 en host para reducir el uso de VRAM a aproximadamente 6,8 GiB y el router se guarda en f32. Un dato relevante del proceso: solo unos 2.800 de los 16.000 tokens de calibración eran en ruso, lo que probablemente explica la degradación desproporcionada en ese idioma.

## Capacidades

- Generación de texto en inglés y ruso, heredada del modelo base gpt-oss-20b.
- Razonamiento y matemáticas: capacidades del modelo base, aunque degradadas por la cuantización; no se han publicado evaluaciones downstream (MMLU, GSM8K) para este fichero.
- Generación de código: capacidad del modelo base, no medida en esta release.
- Tool calling / function calling: el template de chat es el formato harmony del modelo original, que detiene la generación en `<|return|>` y `<|call|>`, por lo que el soporte de llamadas a herramientas se mantiene a nivel de formato.
- Multilingüe limitado a en y ru según la model card, con calidad notablemente inferior en ruso.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Investigación en cuantización extrema: el fichero sirve como referencia reproducible para estudiar el impacto de la cuantización por experto en MoE, con perplejidades publicadas en cinco corpus distintos y comparación contra la referencia MXFP4.
- Despliegue en hardware legacy: ejecutar un modelo de 20.000 millones de parámetros en una Tesla P4 de 8 GB (Pascal, sin tensor cores) a unos 49,9 tok/s, útil para prototipos y entornos con GPUs antiguas.
- Experimentos de asignación de bits: la release documenta la asignación por experto y deja claro que una asignación manual previa por capa (6,3–6,5 GiB) obtenía mejores resultados en cuatro de cinco textos, lo que permite reproducir y comparar estrategias de asignación.
- Validación de motores de inferencia: al incluir comparación CUDA vs CPU (40/40 tokens top-1 coincidentes, max |Δlogit| 0,0067 en un test de 40 tokens), es útil para verificar la corrección de implementaciones del contenedor `.qpack`.
- Pruebas de compresión de almacenamiento: la herramienta `qpack-pack in out --only scales,embed` permite codificar entrópicamente escalas y embedding sin pérdida (−581 MiB en disco), útil para estudiar formatos de almacenamiento de pesos cuantizados.
- Docencia y divulgación: ejemplo concreto y medido de los compromisos entre tamaño, velocidad y calidad en cuantización de modelos grandes, con cifras de perplejidad y throughput verificables.
- Generación de texto corta en inglés: la comprobación de chat de una frase ("What is the capital of France?") devuelve una respuesta correcta, aunque no se han evaluado generaciones largas.

## Benchmarks y rendimiento

Perplejidad con `qpack-perplexity -c 256 --chunks 4` (4 × 256 tokens por texto, texto crudo sin template de chat; valores absolutos altos, comparar columnas). Referencia = mismo motor con expertos MXFP4 originales y atención/embedding f16.

| Modelo | wikiEN | wikiRU | fiction | extEN | extRU |
|---|---|---|---|---|---|
| Referencia (13,8 GB) | 40,2 | 29,7 | 53,1 | 26,8 | 31,7 |
| Este fichero (8,5 GB) | 67,1 | 107,7 | 119,8 | 49,0 | 84,0 |
| Ratio | 1,7× | 3,6× | 2,3× | 1,8× | 2,7× |

Velocidad con decodificación greedy sobre el mismo fichero:

| Backend | tok/s | Nota |
|---|---|---|
| NVIDIA Tesla P4 (8 GB, Pascal, sin tensor cores) | 49,9 | mediana de 3×5 ejecuciones intercaladas, 1113 MHz, 84–85 °C |
| CPU, Xeon de 32 hilos | ≈ 13–17 | host compartido y ruidoso |

El rendimiento en P4 es aproximadamente el 74 % del límite teórico de ancho de banda de memoria para este fichero (≈ 67 tok/s con ≈ 150 GB/s medidos). No hay resultados de benchmarks downstream (MMLU, GSM8K, HumanEval) para este fichero.

## Requisitos de hardware

- VRAM estimada: ≈ 6,8 GiB en GPU (embedding en f16 alojado en host), fichero en disco de 8.082,5 MiB.
- GPU recomendadas: NVIDIA Tesla P4 (8 GB, Pascal) es el objetivo declarado y validado; cualquier GPU Pascal o posterior con al menos 8 GB debería poder ejecutarlo con el motor qpack.
- Cabe en GPU consumer de 8 GB (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070) siempre que se use el motor qpack; no es cargable con transformers ni llama.cpp.
- Opciones de despliegue: exclusivamente el motor qpack (CPU o CUDA, compilado con CMake y `-DQPACK_CUDA=ON` para GPU). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Contexto: usar `-c 512` en tarjetas de 8 GB; con el valor por defecto de 4096, la KV cache más los pesos agotan la memoria en la P4.
- Latencia y throughput: ≈ 49,9 tok/s en Tesla P4 y ≈ 13–17 tok/s en CPU Xeon de 32 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gpt-oss-20b-qpack-q1 | 20B MoE (top-4) | 4.096 (recomendado 512 en 8 GB) | `.qpack` | Apache-2.0 | Perplejidad 1,7–3,6× peor que la referencia; ≈ 50 tok/s en P4 |
| openai/gpt-oss-20b (referencia) | 20B MoE (top-4) | 4.096 | safetensors (MXFP4) | Apache-2.0 | 13,8 GB; calidad de referencia; requiere más VRAM |
| Asignación manual previa del mismo proyecto | 20B MoE | no disponible | `.qpack` | Apache-2.0 | 6,3–6,5 GiB; 1,0–1,6× la referencia en cuatro de cinco textos (fiction 3,5×); ficheros perdidos, no incluidos en la release |
| Otras alternativas de 20B en 8 GB | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Pérdida de calidad sustancial y documentada: perplejidad entre 1,7 y 3,6 veces peor que la referencia, con especial impacto en ruso (3,6× en wikiRU y 2,7× en extRU).
- No es un reemplazo directo del modelo base; para producción donde la calidad importa, debe usarse openai/gpt-oss-20b original.
- No hay reevaluación de seguridad del modelo cuantizado; los sesgos y comportamientos del base pueden alterarse de forma no medida.
- La perplejidad se calcula sobre 1.024 tokens por texto y solo texto crudo; no hay evaluación downstream (MMLU, GSM8K, HumanEval) ni de generaciones largas.
- Solo se ha validado una respuesta de chat de una frase; el comportamiento en conversaciones multi-turno o generaciones extensas no está caracterizado.
- Requiere el motor qpack (CPU o CUDA, Pascal o posterior); no es cargable con transformers, llama.cpp, vLLM, Ollama ni TGI, lo que limita su integración en stacks estándar.
- El calibrado usó solo unos 2.800 tokens en ruso de 16.000, lo que probablemente explica la degradación en ese idioma; el autor lo señala como explicación plausible pero no verificada.
- La cuantización 1-bit sin feedback de error destruye el modelo (perplejidad ≈ 10⁶–10⁸) y los intentos de ajuste de escala/sesgo empeoraron el resultado; el margen de mejora sin reentrenamiento es estrecho.
- El presupuesto experimental fue de 3 horas de GPU, lo que limita la exploración de asignaciones y calibraciones alternativas.
- La licencia Apache-2.0 del fichero está sujeta a la política de uso de gpt-oss del modelo base; conviene revisar sus términos para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q-project/gpt-oss-20b-qpack-q1
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio del motor qpack: https://github.com/Q-Project-LM/qpack
- Otro modelo del proyecto: https://huggingface.co/q-project/N-Q-164M-Chat
- Descripción del formato: `QPACK2.md` (incluido en el repositorio qpack)
