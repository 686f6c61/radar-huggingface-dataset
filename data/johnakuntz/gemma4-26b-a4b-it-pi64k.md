# JohnAKuntz/Gemma4-26B-A4B-it-PI64K

## Resumen

Gemma4-26B-A4B-it-PI64K es una cuantización GGUF de precisión mixta del modelo `google/gemma-4-26B-A4B-it`, publicada por el usuario JohnAKuntz. El objetivo declarado es que el modelo pueda ejecutar su ventana de contexto completa de 65.536 tokens dentro de 16 GB de RAM, concretamente en una Raspberry Pi 5 de 16 GB, sin recurrir a swap. El archivo resultante pesa 10,57 GiB y mide 3,592 bits por peso (bpw) sobre los 25,23 mil millones de parámetros de texto.

La relevancia de esta ficha no reside en el modelo base, sino en la receta de cuantización: en lugar de aplicar una precisión uniforme, el autor distribuye los bits según la importancia de cada tensor. Los expertos enrutados (22,84 B de parámetros, el 90,5 % del total) soportan casi toda la compresión con tipos IQ2_S, IQ3_XXS e IQ4_NL, mientras que la atención, el embedding y el experto compartido se mantienen en Q6_K y Q8_0. El router y las normas quedan en F32.

El modelo base es un transformer de mezcla de expertos (MoE) con 26 B de parámetros totales y 4 B activos por token, según la nomenclatura A4B de Google. Esta cuantización conserva únicamente la torre de texto: el codificador visual es un `mmproj` separado que no se incluye en el repositorio. La licencia declarada es Apache 2.0 y el único idioma indicado en la model card es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), 30 capas, 128 expertos enrutados por capa |
| Parametros totales | 25.233.142.046 (25,23 B) |
| Parametros activos | 4 B (según nomenclatura A4B del modelo base) |
| Longitud de contexto | 65.536 tokens en esta cuantización (el modelo base soporta 262.144) |
| Tipos de cuantizacion | Precisión mixta: IQ2_S, IQ3_XXS, IQ4_NL, Q6_K, Q8_0, F32 (3,592 bpw medidos) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (658 tensores, 11.346.286.272 bytes) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura de mezcla de expertos con 30 capas, de las cuales 25 usan atención de ventana deslizante de 1024 tokens y solo 5 emplean atención completa. La bandera `attention_k_eq_v` está activa, lo que hace que las capas de atención completa compartan las proyecciones K y V. Esta configuración explica que el coste de contexto sea bajo en comparación con el coste de los pesos: la caché KV medida a 64 K es de unos 3,3 GiB (45,7 KiB por token), muy por encima de los ~0,4 GiB que predeciría el cálculo teórico con ventana deslizante, porque llama.cpp almacena K y V por separado y dimensiona una caché unificada por slot.

La distribución de parámetros del componente de texto es la siguiente: expertos enrutados 22,84 B (90,5 %), atención q/k/v/o 1,11 B (4,4 %), embedding de tokens ligado a la cabeza de salida 0,74 B (2,9 %), experto compartido denso siempre activo 0,54 B (2,1 %), y router más normas 0,01 B. El autor no documenta en la model card los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esa información no está disponible en el material proporcionado.

La innovación técnica de esta publicación es la receta de cuantización. La calibración emplea 150 fragmentos de 512 tokens (76.800 tokens) con un 35 % de prosa de Wikipedia, 25 % de código fuente, 30 % de chat renderizado con la plantilla real del modelo y 10 % de otros contenidos. La matriz de importancia se calcula con `llama-imatrix` sobre el modelo Q8_0 y la asignación se aplica con `llama-quantize --tensor-type-file` mediante expresiones regulares ancladas. La importancia por capa sitúa la capa 0 en 1,00 frente a ~0,47 del resto, seguidas de las capas 3, 22, 23, 6 y 4. El autor señala que el plan original preveía IQ2_S también para `ffn_down_exps`, pero `llama-quantize` informó de que 60 de 658 tensores requerían cuantización de reserva porque las filas de experto de anchura 704 no son múltiplo del bloque de 256 elementos de IQ2_S; esos 30 tensores se promovieron automáticamente a IQ4_NL, lo que elevó el archivo a 3,59 bpw en lugar de ~3,4. La compilación se realizó con llama.cpp `a8ad690` (build 1.1.0-dev) a partir de los safetensors bf16 oficiales.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia (`chat_template.jinja`) y soporte de `--jinja` en llama.cpp.
- Razonamiento de múltiples pasos y modo de pensamiento (thinking), ya que la evaluación del autor se realizó con el modo thinking desactivado, lo que implica que está disponible.
- Procesamiento de contexto largo de hasta 65.536 tokens en esta cuantización, adecuado para documentos extensos y conversaciones multi-turno.
- Mezcla de expertos con 4 B de parámetros activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño total.
- Capacidad multimodal de visión en el modelo base, no incluida en este repositorio: la torre visual es un `mmproj` separado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que permite servirlo detrás de una API compatible con OpenAI mediante `llama-server`.
- No se documenta en la información disponible soporte explícito de tool calling ni de function calling para esta cuantización concreta.

## Casos de uso

- Inferencia en Raspberry Pi 5 de 16 GB: el caso de uso central del autor. Con `--ctx-size 65536 --parallel 1 --cache-type-k q4_0 --cache-type-v q4_0 --ubatch-size 256`, el pico de RSS medido es de 15,02 GiB sobre ~15,6 GiB utilizables, unos 0,6 GiB de margen. Sirve para desplegar un asistente local sin conexión en hardware de bajo consumo.
- Asistente conversacional de contexto largo en dispositivos edge: la ventana de 64 K permite mantener conversaciones multi-turno extensas o procesar documentos completos sin truncar, algo inusual en un equipo de 16 GB.
- Procesamiento de documentación técnica y código: la calibración incluye un 25 % de código fuente y el modelo base pertenece a la familia Gemma 4, por lo que es adecuado para resumir repositorios, explicar fragmentos y responder preguntas sobre documentación dentro de la ventana de contexto.
- Servicio de API local compatible con OpenAI: `llama-server` con `--host 0.0.0.0 --port 8080` y `--jinja` permite exponer el modelo a aplicaciones existentes que consuman la API de OpenAI, útil para prototipado y entornos de desarrollo aislados.
- Evaluación y comparación de cuantizaciones: el archivo sirve como referencia para estudiar el impacto de la precisión mixta guiada por matriz de importancia frente a cuantizaciones uniformes como Q4_0, con una diferencia medida de 71,7 % frente a 75,0 % en un test MMLU de 60 preguntas.
- Despliegue en entornos con restricciones de memoria y sin GPU: al ejecutarse íntegramente en CPU con mmap+mlock, encaja en servidores pequeños, contenedores con límite de RAM o placas SBC donde no hay acelerador disponible.
- Investigación sobre arquitecturas MoE de bajo rango de bits: la tabla de tipos por tensor y la descomposición de memoria documentada facilitan reproducir y auditar la receta de cuantización en otros modelos MoE.

## Benchmarks y rendimiento

El autor publica una evaluación tipo MMLU con 60 preguntas de opción múltiple, decodificación greedy, thinking desactivado, 4 materias × 15 preguntas (matemáticas universitarias, física universitaria, historia mundial de secundaria y derecho profesional), semilla fija y prompts idénticos para ambos modelos.

| Modelo | Tamano | Precisión | Sin parsear |
|---|---:|---:|---:|
| Esta cuantización (PI64K) | 10,57 GiB | 43/60 = 71,7 % | 0 |
| Q4_0 oficial (control) | 13,62 GiB | 45/60 = 75,0 % | 5 |

| Materia | PI64K | Q4_0 |
|---|---:|---:|
| Matemáticas universitarias | 10/15 | 8/15 |
| Física universitaria | 11/15 | 11/15 |
| Historia mundial de secundaria | 13/15 | 14/15 |
| Derecho profesional | 9/15 | 12/15 |

El autor advierte que con n=60 el error estándar es elevado, por lo que las diferencias por materia deben interpretarse con cautela. No se han publicado en la información disponible resultados de benchmarks estándar del modelo base (MMLU completo, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo pesa 10,57 GiB. A 64 K de contexto, el autor mide un pico de RSS de 15,02 GiB en una Raspberry Pi 5 de 16 GB, descompuesto en pesos 10,57 GiB + caché KV ~3,3 GiB + buffers de cómputo ~1,0 GiB + sistema operativo ~0,3 GiB. La ley empírica medida en cuatro compilaciones es `pico_GiB ≈ pesos_GiB + 4,4` a 64 K.
- GPU recomendadas: no se documentan en la información disponible. El diseño está orientado a CPU (Raspberry Pi 5), y no se aportan datos de rendimiento en A100, H100 o RTX 4090.
- ¿Cabe en GPU de consumo? No hay datos publicados. Por tamaño de pesos (10,57 GiB) cabría en GPUs con 12 GB o más de VRAM, pero el autor no verifica esta opción ni publica latencias.
- Opciones de despliegue: llama.cpp, concretamente `llama-server` con la configuración documentada (`--ctx-size 65536 --parallel 1 --threads 4 --threads-batch 4 --batch-size 512 --ubatch-size 256 --flash-attn on --cache-type-k q4_0 --cache-type-v q4_0 --cont-batching --jinja --load-mode mmap+mlock`). El tag `endpoints_compatible` sugiere compatibilidad con APIs de endpoints. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Notas de memoria: usar `--parallel 1` es obligatorio en el objetivo de 16 GB, porque los 4 slots por defecto multiplican la caché KV por cuatro y llevan el modelo por encima de 18 GiB. Reducir `ubatch` a 128 no recupera memoria según el autor. Si no se necesita 64 K, a 32 K la caché se reduce a la mitad y cabría una compilación de 13 GB con mayor precisión en los expertos (IQ3_S / IQ3_XXS).
- Latencia y throughput: no se publican valores de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión MMLU-60 | Licencia | Formato |
|---|---|---:|---:|---|---|
| Gemma4-26B-A4B-it-PI64K (esta ficha) | 25,23 B totales / 4 B activos | 65.536 | 71,7 % | Apache 2.0 | GGUF 3,592 bpw, 10,57 GiB |
| Gemma4-26B-A4B-it Q4_0 oficial | 25,23 B totales / 4 B activos | no disponible en la información | 75,0 % | Apache 2.0 | GGUF Q4_0, 13,62 GiB |
| Gemma4-26B-A4B-it bf16 (modelo base) | 25,23 B totales / 4 B activos | 262.144 | no disponible | Apache 2.0 | safetensors |

La comparación relevante es interna a la familia: frente al Q4_0 oficial, esta cuantización ocupa 3,05 GiB menos (10,57 frente a 13,62 GiB) a costa de 3,3 puntos porcentuales en el test de 60 preguntas, con la ventaja de cero respuestas sin parsear frente a cinco del control. No se dispone de datos de benchmarks de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en` como idioma soportado, por lo que el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Pérdida de precisión medible: 71,7 % frente a 75,0 % del Q4_0 en el test MMLU-60, con un tamaño de muestra pequeño (n=60) que limita la significación estadística de la diferencia.
- Sin capacidad de visión: la torre visual es un `mmproj` separado que no se incluye en el repositorio; esta cuantización es solo de texto.
- Contexto reducido respecto al modelo base: 65.536 tokens frente a los 262.144 del original, una cuarta parte.
- Margen de memoria mínimo en el hardware objetivo: 15,02 GiB de 15,6 GiB utilizables en Raspberry Pi 5 de 16 GB, sin espacio para otros procesos. Cualquier aumento de `--parallel`, del contexto o de los buffers puede provocar swap o fallo de asignación.
- Configuración sensible: los 4 slots por defecto de `llama-server` multiplican la caché KV y superan los 18 GiB; es imprescindible `--parallel 1`.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones de veracidad ni de sesgos en la información disponible.
- Sesgos conocidos: no documentados en la model card. Al ser una cuantización del modelo base de Google, hereda los sesgos de este, pero no se aportan análisis específicos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base `google/gemma-4-26B-A4B-it`, ya que la model card de la cuantización no detalla condiciones adicionales de Google.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- El autor reconoce una desviación del plan de cuantización (promoción automática de 30 tensores de IQ2_S a IQ4_NL), que eleva el tamaño final a 3,59 bpw; es un comportamiento documentado, no un fallo, pero afecta a la reproducibilidad exacta de la receta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JohnAKuntz/Gemma4-26B-A4B-it-PI64K
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- llama.cpp (herramientas `llama-imatrix`, `llama-quantize`, `llama-server`): https://github.com/ggerganov/llama.cpp
- Documentación de cuantizaciones GGUF en llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/docs/quantization.md
