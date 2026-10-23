# Binade/Qwen3.5-9B

## Resumen

Binade/Qwen3.5-9B es el checkpoint del modelo Qwen3.5-9B (organización Qwen) recomprimido sin pérdida con Binade, una herramienta de compresión e inferencia desarrollada por Guy Shafir y Tulber. No se trata de un modelo nuevo ni de un afinado: es el mismo conjunto de pesos BF16, empaquetado en tensores uint8 mediante una codificación del exponente por rango de frecuencia que conserva signo y mantisa, y decodificado dentro de las propias multiplicaciones de matrices en tiempo de inferencia.

El interés es doble. Por un lado, reduce el checkpoint de 19,31 GB a 13,27 GB (10,722 bits por peso en los tensores empaquetados) manteniendo los pesos originales bit a bit, recuperables con `binade unpack`. Por otro, y esto es lo diferencial frente a una cuantización al uso, la salida es idéntica bit a bit a la del modelo BF16: los logits coinciden en 16.352 de 16.352 posiciones de WikiText-2 y 32 de 32 generaciones greedy de 128 tokens son idénticas, tanto en Apple M4 Max como en NVIDIA RTX PRO 6000 Blackwell.

El modelo declarado tiene 10.485.553.060 parámetros según los safetensors, pese al sufijo "9B" del nombre comercial. La model card no aporta datos sobre arquitectura interna, longitud de contexto, composición del corpus de entrenamiento ni resultados de benchmarks de calidad, por lo que esta ficha se limita a lo verificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (tag `qwen3_5`); capas, cabezas y detalles internos no disponibles |
| Parametros totales | 10.485.553.060 (~10,49 B) segun safetensors; el nombre comercial indica 9B |
| Parametros activos | No aplica: no se indica que sea un modelo MoE (no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No es una cuantizacion: BF16 comprimido sin perdida a 10,722 bits/peso. Se cita MLX 8-bit solo como referencia comparativa (con perdida) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 en los pesos (heredada del modelo base); Binade es Apache-2.0 |
| Formato de pesos | safetensors con tensores uint8 empaquetados (formato Binade 2, commit `2096638`); `binade unpack` restaura BF16 bit a bit |
| Tamano del checkpoint | 13,27 GB empaquetado (13,3 GB de repo) frente a 19,31 GB en BF16 |
| Pesos incluidos | Todos los tensores del original, incluidos los de vision y multi-token prediction |
| Pesos servidos en runtime | Solo el modelo de texto, cargado via mlx-lm |
| Libreria | `binade` (extra `binade[cuda]` para Linux + CUDA 12) |
| Requisitos de runtime | MLX 0.32.2 y mlx-lm 0.31.3 (instalados por `pip install binade`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base no se detalla en la informacion disponible; el tag `qwen3_5` y el enlace a Qwen/Qwen3.5-9B sitúan el checkpoint en la familia Qwen3.5, con pesos adicionales de vision y de prediccion multi-token presentes en el repositorio. No hay datos sobre número de tokens de entrenamiento, composición del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones de atención del modelo base.

La innovación técnica documentada pertenece a la capa de compresión. Binade codifica el exponente de cada peso por su rango de frecuencia y deja intactos signo y mantisa; los kernels decodifican los pesos dentro de los productos de matrices y acumulan los productos en el mismo orden que los kernels BF16 del framework, de modo que logits y tokens generados coinciden con el original. La verificación reportada incluye 775 tensores desempaquetados y comparados con el checkpoint original con 0 valores distintos, 16.352 posiciones de WikiText-2 con logits bit-idénticos en Apple M4 Max y en NVIDIA RTX PRO 6000 Blackwell, y 32 generaciones greedy de 128 tokens idénticas en tokens y log-probabilidades. Frente a esto, la cuantización MLX 8-bit usada como contraste no reproduce ninguna de las 16.352 posiciones (98,2 % de acuerdo en argmax).

## Capacidades

- Generación de texto y conversación multi-turno: el modelo se sirve con `mlx_lm.generate` aplicando la plantilla de chat del tokenizador.
- Salida determinista bit a bit respecto al BF16 original en decodificación greedy, incluidas las log-probabilidades.
- Recuperación exacta del checkpoint original: `binade unpack Binade/Qwen3.5-9B --out Qwen3.5-9B-bf16` restaura todos los tensores, visión y predicción multi-token incluidos.
- Ejecución en Apple Silicon (kernels de prompt fusionados en GPUs M3 y M4) y en NVIDIA con el extra CUDA.
- Capacidades heredadas del modelo base (razonamiento, código, matemáticas, multilingüismo, tool calling, agentes): no documentadas en esta model card, por lo que no se pueden afirmar.
- Procesamiento de imagen: los pesos de visión están en el checkpoint, pero el runtime solo carga el modelo de texto; no hay soporte de visión en inferencia según la información disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: un Mac equipado con M3 o M4 puede cargar el checkpoint de 13,27 GB y generar a 34,4 tok/s en greedy, sin renunciar a la fidelidad numérica del BF16.
- Servicio de chat en produccion sobre Apple Silicon: al usar los kernels de prompt fusionados en GPUs M3/M4, se evita la reconstrucción de pesos BF16 en cada prompt y se mantiene la equivalencia exacta con el modelo original.
- Reproducibilidad y auditoría de resultados: al ser la salida bit-idéntica, los experimentos de evaluación y las comparativas entre ejecuciones no se ven contaminadas por variaciones de cuantización.
- Evaluación de modelos con presupuesto de almacenamiento reducido: 13,27 GB frente a 19,31 GB (−31 %) permite mantener más checkpoints en disco o en un registro de artefactos sin perder fidelidad.
- Despliegue en GPU NVIDIA (RTX PRO 6000 Blackwell, L4, A100 verificadas) para pipelines de generación de texto donde se exige equivalencia numérica con el BF16 de referencia.
- Docencia e investigación sobre compresión: el par (checkpoint empaquetado, resultado de roundtrip y de exactitud) sirve como caso de estudio reproducible de compresión sin pérdida aplicada a pesos de LLM.
- Generación de texto en pipelines de CI con verificación de regresión: al ser determinista frente al BF16, se pueden fijar salidas esperadas y detectar cambios reales del modelo o del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos reportados son de exactitud, tamano y velocidad:

| Metrica | Resultado |
|---|---|
| Tensores desempaquetados y comparados con el original | 775 tensores, 0 valores distintos |
| Logits en 16.352 posiciones de WikiText-2 (Apple M4 Max) | 16.352 / 16.352 bit-idénticos |
| Generaciones greedy de 128 tokens (Apple M4 Max) | 32 / 32 idénticas en tokens y log-probabilidades |
| Logits en 16.352 posiciones (NVIDIA RTX PRO 6000 Blackwell) | 16.352 / 16.352 bit-idénticos; 32 / 32 generaciones |
| MLX 8-bit (referencia con perdida) | 0 / 16.352 posiciones idénticas; 98,2 % de acuerdo en argmax |
| Checkpoint BF16 | 19,31 GB |
| Checkpoint Binade | 13,27 GB (10,722 bits/peso) |
| Decodificacion greedy, Apple M4 Max, BF16 | 26,9 tok/s |
| Decodificacion greedy, Apple M4 Max, Binade | 34,4 tok/s |
| Decodificacion greedy, Apple M4 Max, MLX 8-bit | 48,7 tok/s |

## Requisitos de hardware

- VRAM/espacio en disco: 13,27 GB de pesos empaquetados; el BF16 desempaquetado ocupa 19,31 GB. Para inferencia hay que anadir la memoria de activaciones, KV cache (longitud de contexto no disponible) y overhead del runtime; el checkpoint empaquetado deja margen en GPUs de 16 GB, el BF16 no.
- Apple Silicon: GPUs M3 y M4 ejecutan los kernels de prompt fusionados; las pruebas de exactitud y velocidad se hicieron en un M4 Max.
- NVIDIA verificadas: RTX PRO 6000 Blackwell Server Edition, L4 y A100. En otras GPUs los prompts reconstruyen pesos BF16: el resultado es exacto pero mas lento.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el checkpoint empaquetado o incluso el BF16 desempaquetado, aunque la exactitud solo esta verificada en las GPUs citadas.
- Opciones de despliegue: `pip install binade` (Apple Silicon) o `pip install "binade[cuda]"` (Linux + CUDA 12), con MLX 0.32.2 y mlx-lm 0.31.3; el CLI `binade unpack` para recuperar BF16. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput conocido: 34,4 tok/s en greedy sobre M4 Max (frente a 26,9 tok/s del BF16 y 48,7 tok/s del MLX 8-bit). No hay datos de latencia de prefill, throughput con batching ni cifras para NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Velocidad (M4 Max, greedy) | Exactitud vs BF16 | Licencia |
|---|---|---|---|---|---|---|
| Binade/Qwen3.5-9B | 10,49 B | no disponible | 13,27 GB | 34,4 tok/s | bit-idéntica | Apache-2.0 |
| Qwen/Qwen3.5-9B (BF16) | 10,49 B | no disponible | 19,31 GB | 26,9 tok/s | referencia | Apache-2.0 |
| Qwen3.5-9B en MLX 8-bit (con perdida) | 10,49 B | no disponible | no disponible | 48,7 tok/s | 0 / 16.352 posiciones; 98,2 % argmax | Apache-2.0 |

No se dispone de datos de arquitectura, contexto o benchmarks de calidad del modelo base ni de alternativas de otros desarrolladores, por lo que no es posible una comparativa funcional con modelos de la misma categoria.

## Limitaciones y advertencias

- La exactitud esta ligada a los kernels de MLX: los requisitos fijan MLX 0.32.2 y mlx-lm 0.31.3, y cambios de version pueden romper la equivalencia bit a bit.
- Solo se sirve el modelo de texto a traves de mlx-lm; los pesos de vision y de prediccion multi-token estan en el checkpoint pero no se cargan en inferencia. La exactitud solo se verifico en generacion de texto.
- En GPUs NVIDIA no listadas (RTX PRO 6000, L4, A100), los kernels de prompt no estan verificados y reconstruyen pesos BF16: resultados exactos pero mas lentos.
- El repositorio aparece etiquetado como "8-bit" y el recuento de parametros del Hub se calcula por bytes (tensores uint8); no debe interpretarse como una cuantizacion a 8 bits. Los pesos son BF16 completos.
- La model card no documenta sesgos, tasas de alucinacion, idiomas soportados ni limitaciones de contexto del modelo base; no se pueden evaluar con la informacion disponible.
- Dependencia de una libreria y un formato poco extendidos (`binade`, formato 2), sin soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que limita su integracion en stacks convencionales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de terceros mas alla de los resultados publicados por el autor.
- Licencia Apache-2.0 en los pesos y en Binade, sin restricciones adicionales documentadas para uso comercial; conviene revisar el fichero LICENSE del repositorio antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Binade/Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de Binade: https://github.com/GuyShafir/binade
- Paper de Binade: https://github.com/GuyShafir/binade/blob/main/paper/binade.pdf
- Verificacion de roundtrip: https://github.com/GuyShafir/binade/blob/main/results/Qwen3.5-9B/roundtrip_v2.md
- Exactitud en Apple Silicon: https://github.com/GuyShafir/binade/blob/main/results/Qwen3.5-9B/exactness_scale.md
- Exactitud en CUDA: https://github.com/GuyShafir/binade/blob/main/results/cuda/Qwen3.5-9B/exactness_scale.md
- Velocidad de decodificacion: https://github.com/GuyShafir/binade/blob/main/results/Qwen3.5-9B/decode_speed.md
- Resultados en NVIDIA: https://github.com/GuyShafir/binade/tree/main/results
- Licencia: https://huggingface.co/Binade/Qwen3.5-9B/blob/main/LICENSE
