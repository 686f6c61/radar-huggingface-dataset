# JigSawPT/DeepSeek-V4.1-Flash-GGUF

## Resumen

DeepSeek-V4.1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, con 552 000 millones de parámetros totales y una arquitectura de 40 capas que incorpora 384 expertos enrutados, hyper-connections, atención dispersa CSA2 y una memoria condicional de n-gramas (engram) de 189 GiB. Esta ficha describe la conversión a GGUF publicada por el usuario JigSawPT, pensada para ejecutar el modelo en llama.cpp sin alterar la precisión del checkpoint original: los expertos enrutados se reempaquetan de forma sin pérdida desde los bloques MXFP4 liberados, mientras que la atención y los pesos densos se dequantizan de fp8 a Q8_0/BF16.

La relevancia de esta publicación es práctica: demuestra que un modelo de 552B puede ejecutarse en una única GPU de consumo (RTX 5090 con 31,8 GiB de VRAM) más 125,7 GiB de RAM, mediante streaming de expertos desde disco a través de una caché en VRAM y una capa intermedia en memoria anclada. El repositorio ocupa 501,8 GB repartidos en 11 shards y requiere una rama específica del runtime (`dsv41-porte`) que todavía no está fusionada en llama.cpp upstream.

La conversión es solo de texto: el conversor omite la torre de visión, por lo que la entrada de imágenes no está soportada en este conjunto de archivos. La licencia del modelo base y de la conversión es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 40 capas, 384 expertos enrutados, hyper-connections, atención dispersa CSA2 y memoria condicional de n-gramas (engram) |
| Parámetros totales | 754 638 981 608 (dato real de safetensors); la model card indica 552B para el modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 8192`) |
| Tipos de cuantización | MXFP4 (expertos enrutados, repack sin pérdida), Q8_0/BF16/F32 (atención, expertos compartidos, router, hyper-connections, normas, proyecciones engram, embedding y cabeza de salida), fp8 crudo (tablas engram) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (11 shards, 502 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 40 capas con 384 expertos enrutados por capa, hyper-connections para el flujo residual y atención dispersa CSA2. Incorpora además una memoria condicional de n-gramas (engram) de 189 GiB distribuida en dos tablas (capas 1 y 14), que se leen mediante memory-mapping a razón de 48 filas por token. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La conversión conserva la precisión del checkpoint liberado: los expertos enrutados son un reempaquetado sin pérdida de los bloques MXFP4 originales (verificado bloque por bloque, 480/480 idénticos), la atención y los pesos densos se dequantizan de fp8 a Q8_0/BF16, y las tablas engram viajan como bytes fp8 crudos con sus escalas. El conjunto contiene 1012 tensores y ningún tensor de visión o proyector. La correlación de logits frente a la implementación de referencia es de 0,9967 a 1401 tokens, comparable a la reproducibilidad del propio port entre dos ejecuciones (0,9959).

## Capacidades

- Generación de texto conversacional en modo chat (`--reasoning off` es la configuración medida).
- Modo de razonamiento (thinking mode), aunque la model card advierte que a temperatura 0 entra en bucles con prompts vagos.
- Razonamiento multi-paso y contenido mixto, según el benchmark del autor (4 prompts de contenido mixto por 3 rondas).
- Memoria condicional de n-gramas (engram) para recuperación de contexto a largo plazo.
- Capacidad de visión presente en el modelo base, pero no soportada en esta conversión GGUF (torre de visión omitida).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Endpoints compatibles (`endpoints_compatible` en los tags).

## Casos de uso

- Inferencia local de un modelo de 552B en hardware de consumo: con una RTX 5090 (31,8 GiB), 125,7 GiB de RAM y NVMe PCIe 5, el modelo genera 5,1 tokens/s en contenido nuevo y 21,4 tokens/s en contenido residente, lo que permite experimentar con un MoE de gran escala sin clúster.
- Evaluación e investigación de arquitecturas MoE con memoria condicional: las tablas engram en fp8 crudo y su lectura de 48 filas por token permiten estudiar el comportamiento de la memoria de n-gramas en tareas de contexto largo.
- Servicio de chat conversacional con `llama-server`: el ejemplo de ejecución expone una API HTTP en `127.0.0.1:8080`, adecuada para prototipos de atención al cliente o asistentes internos con presupuesto de hardware limitado.
- Reproducción de resultados científicos: con `--moe-stream-io-threads 1` las ejecuciones son bit a bit reproducibles a 3,6 tokens/s, útil para experimentos que requieran determinismo.
- Procesamiento por lotes de contenido mixto: el benchmark del autor usa 4 prompts de contenido mixto por 3 rondas, un patrón representativo de pipelines de generación por lotes.
- Validación de ports de runtime: la correlación de logits de 0,9967 frente a la referencia permite usar este GGUF como artefacto de verificación para desarrolladores que trabajen en el soporte upstream de V4.1 en llama.cpp.
- Despliegue con decodificación especulativa: la cabeza draft se publica por separado (DeepSeek-V4.1-Flash-DSpark-GGUF), aunque en este hardware es neutra en contenido mixto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento medidos por el autor son los siguientes:

| Métrica | Valor |
|---|---|
| Decodificación, contenido nuevo (4 prompts mixtos x 3 rondas) | 5,1 tokens/s |
| Decodificación, contenido residente (mismo prompt repetido) | 21,4 tokens/s |
| Time to first token, contenido nuevo | 7,7 s |
| Time to first token, contenido residente | 0,26 s |
| Techo de la arquitectura en esta máquina (ruta de lectura con búfer, sin fallos de disco) | 6,2 tokens/s |
| Decodificación con `--moe-stream-direct` en primera pasada | 8,9–10,0 tokens/s |
| Decodificación residente con `--moe-stream-direct` | 19–22 tokens/s |
| Correlación de logits frente a la referencia (1401 tokens) | 0,9967 |
| Correlación del port consigo mismo entre dos ejecuciones | 0,9959 |

Hardware de medida: una RTX 5090 (31,8 GiB de VRAM), 125,7 GiB de RAM y el archivo en un NVMe PCIe 5.

## Requisitos de hardware

- VRAM: la configuración medida usa una caché de expertos de 18 GiB en VRAM (aproximadamente 25 slots de experto por capa). El mínimo es de 18 slots por capa (`--moe-stream-cache 18s`), unos 13 GiB.
- RAM: 72 GiB de capa intermedia anclada (`--moe-stream-l2 72`); superar los 72 GiB en una máquina de 125,7 GiB es más lento porque roba page cache a las tablas engram.
- Almacenamiento: 502 GB en 11 shards; se recomienda NVMe PCIe 5.
- GPU recomendadas: RTX 5090 (configuración medida). Otras GPU no están documentadas en la información disponible.
- Cabe en GPU de consumo: sí, con streaming de expertos desde disco; nada del modelo cabe entero en RAM + VRAM y no es necesario.
- Opciones de despliegue: llama.cpp únicamente, en la rama `dsv41-porte` de JigSawPT/llama.cpp. Upstream llama.cpp no tiene runtime para V4.1 todavía. El PR abierto #28696 almacena las tablas engram de forma distinta y sus archivos no son intercambiables con estos.
- Latencia y throughput: 5,1 tokens/s en decodificación de contenido nuevo y 21,4 tokens/s en residente; TTFT de 7,7 s y 0,26 s respectivamente. El modo de razonamiento está desactivado en la configuración medida.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento de modelos alternativos de la misma categoría que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo texto: la torre de visión fue omitida en la conversión; la entrada de imágenes no está soportada. Existe un conjunto alternativo de la comunidad (smalinin/DeepSeek-V4.1-Flash-GGUF, solo CUDA, con archivo mmproj) que el autor no ha probado.
- Dependencia de un runtime no upstream: requiere la rama `dsv41-porte` de JigSawPT/llama.cpp; los archivos no son intercambiables con los del PR #28696 ni con los de otros conversores.
- El modo de razonamiento a temperatura 0 entra en bucles con prompts vagos; la configuración medida es modo chat.
- Rendimiento muy dependiente del almacenamiento: sin `--moe-stream-direct`, la primera pasada es de 3,9–4,9 tokens/s; el techo con lectura con búfer es de 6,2 tokens/s.
- Configurar `--moe-stream-l2` por encima de 72 GiB en una máquina de 125,7 GiB degrada el rendimiento.
- La variante sin tablas engram (299 GB) no se publica porque, aunque anular la memoria es la identidad exacta del módulo, el modelo resultante no reproduce las salidas del modelo liberado.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Idiomas soportados: no disponible.
- Licencia MIT, que permite uso comercial; conviene verificar los términos del modelo base deepseek-ai/DeepSeek-V4.1-Flash por si difirieran.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JigSawPT/DeepSeek-V4.1-Flash-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Rama del runtime: https://github.com/JigSawPT/llama.cpp (rama `dsv41-porte`)
- PR de conversión upstream: https://github.com/ggml-org/llama.cpp/pull/28696
- Informe técnico del port: https://github.com/JigSawPT/deepseek-v41-flash-on-5090
- Cabeza draft: https://huggingface.co/JigSawPT/DeepSeek-V4.1-Flash-DSpark-GGUF
- Runtime alternativo con visión: https://github.com/smalinin/llama.cpp/tree/my_build_deepseek41
- GGUF alternativo con visión: https://huggingface.co/smalinin/DeepSeek-V4.1-Flash-GGUF
- Parche de streaming de expertos (Crow): https://github.com/nibor1896/Crow
