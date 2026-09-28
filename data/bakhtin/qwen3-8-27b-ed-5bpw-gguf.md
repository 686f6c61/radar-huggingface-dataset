# bakhtin/Qwen3.8-27B-ED-5bpw-GGUF

# Qwen3.8-27B-ED-5bpw-GGUF (bakhtin)

## Resumen

Qwen3.8-27B-ED-5bpw-GGUF es una cuantización GGUF de 5 bits por peso (5 bpw) del modelo Qwen3.8-27B, publicada por el usuario bakhtin sobre el archivo BF16 del repositorio ggml-org/Qwen3.8-27B-GGUF. No es un modelo entrenado desde cero ni un ajuste fino: el autor indica explícitamente que no se realizó ninguna ablación ni post-entrenamiento, y que la única diferencia respecto al original es la compresión con una Importance Matrix.

El interés práctico de esta versión es doble. Por un lado, reduce el peso del modelo a un archivo de 15,92 GiB, lo que permite ejecutar un modelo de 27.320.697.856 parámetros en una GPU de consumo con 16 GB de VRAM (el autor cita la RX 9070 XT) a velocidades de 20-30 t/s. Por otro, la matriz de importancia se calibró con tres focos concretos: lenguaje técnico en ruso, lenguajes de programación (C, C++, Objective-C, Bash, Python, JavaScript, TypeScript) y lógica formal.

Incluye además una capa MTP (multi-token prediction) ya embebida, por lo que no es necesario descargar por separado un modelo borrador para decodificación especulativa. Se trata de una publicación muy reciente (28 de septiembre de 2026) y con 0 descargas y 0 interacciones, por lo que carece todavía de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; deriva del modelo base Qwen3.8-27B e incluye una capa MTP embebida |
| Parámetros totales | 27.320.697.856 (~27,3 mil millones) |
| Parámetros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible como cifra oficial; el autor señala que trabajar por encima de 90k tokens es «prácticamente inútil» porque la velocidad cae a 15 t/s |
| Tipos de cuantización | GGUF 5 bpw «ED» con Importance Matrix. Variantes de referencia del mismo modelo citadas por el autor: UD-Q4_K_XL (16,34 GiB) y Q8_0 (26,62 GiB) |
| Idiomas soportados | ruso (ru) e inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo de 15,92 GiB; repositorio de 17,1 GB) |
| Tarea declarada (pipeline) | image-text-to-text |
| Modelo base | ggml-org/Qwen3.8-27B-GGUF (archivo BF16) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada: no se especifica si es un transformer denso, un MoE o un híbrido, ni el número de capas, cabezas de atención o tamaño del diccionario. Lo que sí se documenta es la presencia de una capa MTP (multi-token prediction) integrada en los pesos, que el autor distribuye ya incluida para no requerir la descarga de un modelo borrador aparte. El repositorio base es la cuantización BF16 publicada por ggml-org.

En cuanto al proceso de cuantización, la información es concreta: se aplicó una Importance Matrix calibrada sobre tres dominios (ruso técnico, los lenguajes de programación C, C++, Objective-C, Bash, Python, JavaScript y TypeScript, y lógica formal con construcción de conexiones lógicas). El autor no realizó ablación ni post-entrenamiento posterior, de modo que las capacidades del modelo son las del Qwen3.8-27B original, únicamente afectadas por la pérdida de precisión de la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Entrada multimodal imagen-texto, según la etiqueta de pipeline `image-text-to-text`; el alcance exacto (resolución, tipos de tarea visual) no está documentado.
- Razonamiento formal y lógica: la matriz de importancia se calibró específicamente en lógica formal y construcción de conexiones lógicas, por lo que se espera un comportamiento relativamente preservado en tareas de deducción estructurada.
- Generación y comprensión de código en C, C++, Objective-C, Bash, Python, JavaScript y TypeScript, los lenguajes usados en la calibración.
- Procesamiento de lenguaje técnico en ruso, además de inglés.
- Capa MTP embebida, que evita tener que gestionar un modelo borrador externo para decodificación especulativa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Traducción y redacción técnica ruso-inglés: el modelo está calibrado sobre ruso técnico, de modo que resulta adecuado para traducir documentación de ingeniería, especificaciones o notas de versión entre ambos idiomas manteniendo terminología especializada.
- Asistencia de programación en local: con soporte declarado para C, C++, Objective-C, Bash, Python, JavaScript y TypeScript, puede usarse como autocompletado, generador de tests o revisor de parches dentro de un IDE sin enviar código a servicios externos.
- Migración de código heredado: el foco en Objective-C y C/C++ lo hace útil para tareas de conversión o modernización de bases de código antiguas, donde el contexto largo (hasta ~90k tokens) permite cargar varios ficheros relacionados a la vez.
- Análisis de documentación extensa: con una ventana utilizable en la práctica de decenas de miles de tokens, puede resumir informes técnicos, actas o manuales largos en una sola pasada, siempre que se acepte la caída de velocidad en contextos grandes.
- Verificación de argumentaciones y especificaciones formales: la calibración en lógica formal lo hace apropiado para comprobar consistencia de reglas de negocio, contratos o aserciones lógicas expresadas en lenguaje natural.
- Asistente conversacional autoalojado: al caber en 16 GB de VRAM, permite desplegar un chatbot interno en una estación de trabajo o servidor pequeño con GPU de consumo, sin coste de API y con los datos permaneciendo en la infraestructura propia.
- Interpretación de imágenes técnicas: gracias a la tarea `image-text-to-text`, puede emplearse para extraer información de capturas de pantalla, diagramas o documentación escaneada y combinarla con texto, aunque no hay documentación sobre su precisión en esta modalidad.
- Generación de datos sintéticos en ruso para ajuste fino: al ser un modelo abierto con licencia apache-2.0, puede utilizarse como generador o anotador de corpus en ruso técnico, sujeto a la verificación de la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, GSM8K, HumanEval, etc.) en la información disponible. Los únicos datos publicados son métricas de fidelidad de la cuantización (medidas con `llama-perplexity`) y de velocidad (medidas con `llama-bench`).

Métricas de fidelidad de la cuantización frente al modelo base:

| Estadística | UD-Q4_K_XL (16,34 GiB) | ED-5bpw (15,92 GiB) | Q8_0 (26,62 GiB) |
|---|---|---|---|
| Cor(ln(PPL(Q)), ln(PPL(base))) | 97,78 % | 98,12 % | 99,10 % |
| Media PPL(Q)-PPL(base) | 0,010224 | 0,009144 | 0,013471 |
| KLD media | 0,028143 | 0,027261 | 0,007148 |
| KLD máxima | 31,597418 | 31,554943 | 24,629694 |
| KLD 99,9 % | 6,144548 | 6,126769 | 0,773549 |
| Media Δp | -0,120 | -0,128 | -0,031 |
| RMS Δp | 4,530 | 4,363 | 1,802 |
| Same top p | 97,574 | 97,573 | 99,215 |

Velocidad de inferencia (`llama-bench`, en tokens por segundo):

| Test | UD-Q4_K_XL (16,34 GiB) | ED-5bpw (15,92 GiB) | Q8_0 (26,62 GiB) |
|---|---|---|---|
| pp512 | 524,39 | 1238,60 | 319,07 |
| tg128 | 24,16 | 25,29 | 4,35 |
| pp512 @ d16384 | 470,08 | 1080,62 | 297,60 |
| tg128 @ d16384 | 16,90 | 20,01 | 4,03 |
| pp512 @ d32768 | 430,21 | 946,29 | 279,84 |
| tg128 @ d32768 | 14,30 | 16,48 | 3,86 |

Nota: las tablas no indican explícitamente el hardware empleado; el texto del autor menciona una RX 9070 XT como referencia de ejecución a 20-30 t/s. Las cifras de la tabla son sensiblemente superiores en prefill (pp512) para la versión ED-5bpw respecto a UD-Q4_K_XL.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 15,92 GiB (repositorio completo de 17,1 GB), por lo que se necesita una GPU con al menos 16 GB de VRAM para pesos más caché KV reducida.
- GPU recomendadas por el autor: tarjetas de consumo de 16 GB, con la RX 9070 XT como ejemplo explícito. El rendimiento indicado en ese hardware es de 20-30 t/s según el llenado del KV cache.
- Compatibilidad con GPU de consumo: sí, es el objetivo declarado del repositorio. Cualquier GPU con 16 GB o más (por ejemplo, gamas de 16 GB de AMD o NVIDIA) debería poder cargar los pesos, aunque no se documentan pruebas en otras tarjetas.
- Aceleradores profesionales (A100, H100, RTX 4090): no se documentan mediciones en la información disponible.
- Opciones de despliegue: el formato GGUF y el uso de las herramientas `llama-perplexity` y `llama-bench` confirman compatibilidad con el ecosistema llama.cpp y runtimes derivados. El repositorio incluye la etiqueta `endpoints_compatible`. No se documenta soporte para vLLM o TGI.
- Rendimiento observado: 1238,60 t/s en prefill (pp512) y 25,29 t/s en generación (tg128) con contexto corto; 946,29 t/s y 16,48 t/s respectivamente a 32.768 tokens de profundidad.
- Advertencia de contexto: el autor indica que superar los 90k tokens de contexto es «prácticamente inútil», ya que la velocidad de inferencia cae hasta 15 t/s.

## Comparativa con modelos similares

La información proporcionada permite comparar esta cuantización con otras versiones del mismo modelo base, pero no incluye datos de rendimiento de tareas frente a modelos de otras familias. La comparación con alternativas de la misma categoría (modelos de ~27-32 mil millones de parámetros) no está disponible en la documentación consultada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bakhtin/Qwen3.8-27B-ED-5bpw-GGUF | ~27,3 B | no disponible | apache-2.0 | GGUF 5 bpw, 15,92 GiB |
| Qwen3.8-27B-GGUF UD-Q4_K_XL (Unsloth AI) | mismo modelo base | no disponible | no disponible | GGUF 4 bits, 16,34 GiB |
| Qwen3.8-27B-GGUF Q8_0 | mismo modelo base | no disponible | no disponible | GGUF 8 bits, 26,62 GiB |

Frente a UD-Q4_K_XL, la versión ED-5bpw ocupa ligeramente menos espacio (15,92 GiB frente a 16,34 GiB), obtiene mejor correlación de perplejidad (98,12 % frente a 97,78 %), menor KLD media (0,027261 frente a 0,028143) y un prefill mucho más rápido (1238,60 t/s frente a 524,39 t/s en pp512). Frente a Q8_0, la cuantización de 5 bpw pierde fidelidad (KLD media 0,027261 frente a 0,007148) pero ocupa un 40 % menos de espacio y genera a 25,29 t/s frente a 4,35 t/s.

## Limitaciones y advertencias

- El autor declara que no se realizó ninguna ablación ni post-entrenamiento: la calidad final depende íntegramente del modelo base Qwen3.8-27B y de la pérdida introducida por la cuantización.
- La pérdida de fidelidad es medible: la KLD media de esta versión (0,027261) es casi cuatro veces la de Q8_0 (0,007148), y la KLD máxima supera ligeramente la de UD-Q4_K_XL. Para tareas sensibles a la precisión, una cuantización mayor puede ser preferible.
- Idiomas declarados: únicamente ruso e inglés. El comportamiento en castellano no está documentado ni respaldado por la calibración, que se centró en ruso técnico.
- Contexto práctico limitado: por encima de 90k tokens la velocidad cae a 15 t/s según el autor, lo que desaconseja su uso para tareas de contexto muy largo en producción.
- No hay benchmarks de tareas publicados (MMLU, GSM8K, HumanEval, razonamiento visual), por lo que no es posible cuantificar su calidad real frente a alternativas.
- Riesgo de alucinación: inherente a los modelos generativos y no evaluado en esta publicación; conviene añadir verificación en flujos críticos.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar la ficha, y una antigüedad de minutos u horas, por lo que no existe retroalimentación de terceros sobre su comportamiento real.
- Licencia: el repositorio declara apache-2.0, pero al ser una cuantización derivada conviene verificar las condiciones del modelo base Qwen3.8-27B antes de un uso comercial.
- Entradas multimodales: la etiqueta de pipeline indica `image-text-to-text`, pero no hay ninguna documentación sobre el rendimiento, la resolución soportada o los formatos de imagen admitidos.
- Al ser una cuantización de 5 bpw orientada a GPUs de 16 GB, no se debe asumir que ofrece el mismo comportamiento que la versión BF16 en tareas de nicho fuera de los dominios de calibración (ruso técnico, lenguajes de programación citados y lógica formal).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bakhtin/Qwen3.8-27B-ED-5bpw-GGUF
- Modelo base (ggml-org): https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Cuantizaciones de referencia de Unsloth AI: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
