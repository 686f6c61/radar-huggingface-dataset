# cygnal/Qwen3.8-Flash-Next-Heretic2-IQ4XS-Halogen

## Resumen

Qwen3.8-Flash-Next-Heretic2-IQ4XS-Halogen es una cuantización GGUF del modelo Qwen3.8-Flash-Next publicada por el usuario cygnal. No se trata de un modelo entrenado desde cero, sino de un derivado en dos pasos: primero se aplicó una eliminación de dirección de rechazo (abliteration) con Heretic v1.3.0 sobre los pesos BF16, dando lugar a la variante que el autor denomina "Heretic2", y después se re-cuantizó ese resultado a IQ4_XS con overrides de tipo por tensor. El objetivo declarado no es la calidad máxima, sino conseguir que un modelo de ~166.000 millones de parámetros quepa y funcione con buen rendimiento en una única máquina con memoria unificada AMD Strix Halo.

Arquitectónicamente hereda el diseño qwen4exp del modelo base: 48 bloques, 512 expertos con 10 activos por token y una mezcla híbrida de DeltaNet, SSM y atención. El resultado son ~166B parámetros totales y ~27B activos, con una ventana de contexto de 262.144 tokens. El archivo final pesa 93 GB (95.074 MiB) a 4,51 bits por peso, frente a los 176 GB del GGUF Q8_0 del que parte, lo que libera unos 83 GB de memoria para caché KV y contexto.

Su relevancia es doble. Por un lado, documenta un caso práctico de cuantización con restricciones de kernel muy concretas: el tensor `per_layer_token_embd.weight` debe ser obligatoriamente IQ4_NL porque Halogen lo lee in-place vía mmap con el kernel `k_embed_gather`, y usar Q8_0 provoca un fallo de página en la GPU. Por otro, incluye mediciones de throughput prefill y decode contra llama-server en hardware gfx1151, que muestran aceleraciones de hasta 7,7x en prefill. Es, por tanto, un artefacto muy especializado: 0 descargas y 0 "me gusta" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp: hibrida DeltaNet/SSM/atencion, 48 bloques, 512 expertos, 10 activos por token |
| Parametros totales | ~166.000 millones (166B) |
| Parametros activos | ~27.000 millones (27B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ4_XS en expertos, con overrides por tensor: IQ4_NL (`per_layer_token_embd.weight`), Q8_0 (capas densas/troncales), Q6_K (`output.weight`), BF16 (embeddings y proyecciones del indexer), F32 (normas y `ple_conv1d`). 4,51 bits por peso. Origen: Q8_0 |
| Idiomas soportados | en (unico idioma declarado en la model card y en los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (1.224 tensores, 95.074 MiB / 93 GB) |
| Autor de la cuantizacion | cygnal |
| Modelo base | Qwen/Qwen3.8-Flash-Next (finetune: abliterado con Heretic v1.3.0) |
| Pipeline | text-generation |
| Runtime objetivo | Halogen Flash Server (peonist-ai) v0.11.4 o superior, kernels personalizados gfx1151 |
| Fecha de publicacion | 18 de septiembre de 2026 (actualizado el mismo dia) |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea la arquitectura qwen4exp, una mezcla de expertos con 512 expertos por capa de los que se activan 10 por token, distribuidos en 48 bloques, y con una combinación híbrida de capas DeltaNet, SSM y atención. Esa combinación explica el ratio de activación: ~27B parámetros activos sobre ~166B totales, lo que sitúa el coste de cómputo por token en el rango de un modelo denso de ~27B mientras la huella de memoria es la de un modelo casi siete veces mayor.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos no están disponibles en la información facilitada. Lo que sí se documenta con detalle es la cadena de transformación posterior. Sobre los pesos BF16 del modelo base se aplicó Heretic v1.3.0, un procedimiento de eliminación de dirección (*direction-removal*) que da lugar al build "Heretic2"; después se convirtió a Q8_0 con la herramienta estándar de llama.cpp (176 GB) y finalmente se re-cuantizó con `llama-quantize --allow-requantize` y un mapa de tipos por tensor para producir el GGUF de 93 GB.

La innovación técnica destacable no está en el modelo sino en el pipeline de cuantización y en el runtime. El autor documenta que `per_layer_token_embd.weight`, un tensor de 26,8 GiB, se lee directamente desde el archivo mapeado en memoria por el kernel `k_embed_gather` de Halogen y no se reempaqueta al arrancar; por eso debe usar la misma estructura de bloques que IQ4_NL (type_id=20) y no Q8_0, que provocaría un fallo de página en la GPU. El resto de categorías aceptadas por el modo BYO GGUF de Halogen son IQ4_NL, IQ4_XS, IQ3_S y Q4_0 para expertos, Q8_0 obligatorio para capas densas, Q6_K para la proyección de salida, BF16 para las proyecciones del indexer y F32 para normas. Reproducir el build requiere un `llama-quant.cpp` parcheado con las líneas 330-331 comentadas (exclusiones hardcodeadas de las proyecciones del indexer).

## Capacidades

- Generación de texto autoregresiva, con 262.144 tokens de ventana de contexto, lo que permite introducir documentos o bases de código muy extensas en una sola petición.
- Inferencia eficiente en memoria gracias al enrutado MoE: solo se activan 10 de los 512 expertos por token, de modo que el coste de cómputo se aproxima al de un modelo de ~27B aunque los pesos ocupen 93 GB.
- Modo sin rechazos como consecuencia del abliterado: el modelo no incorpora la dirección de rechazo eliminada por Heretic, por lo que responde a peticiones que el modelo base tendería a declinar.
- Decodificación especulativa mediante cabeza MTP: con el fichero `qwen38-flash-next-mtp.hgn` (1,5 GB) y la compartición de caché KV consciente de MTP, el autor reporta ~32 tok/s de decode frente a ~24 tok/s en modo serial.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (la model card no lo menciona ni lo descarta).
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modos de razonamiento tipo *thinking*: no disponible en la información proporcionada.
- Capacidades multilingües: el autor declara únicamente inglés (`language: en`); no se documenta soporte de otros idiomas.

## Casos de uso

- Asistente de código sobre repositorios completos: con 262.144 tokens de contexto es posible cargar decenas de ficheros fuente de un proyecto mediano en una sola ventana, de forma que el modelo razona sobre dependencias cruzadas sin necesidad de un pipeline de recuperación. Los ~27B parámetros activos mantienen la latencia de generación en el rango de un modelo mucho menor.
- Análisis de documentación técnica y legal extensa: contratos, normativas o manuales de cientos de páginas caben en contexto y permiten extracción de cláusulas, resúmenes jerárquicos o comparación entre versiones de un mismo documento.
- Generación de datos sintéticos a gran escala: el throughput de prefill medido en Halogen con MTP alcanza 10.857 tok/s con prompts de 8K y 67.637 tok/s con prompts de 16K, lo que hace viable procesar lotes grandes de entradas largas para producir corpus etiquetados o pares de instrucciones.
- Investigación sobre alineación y abliteración: al ser un modelo con la dirección de rechazo eliminada y con los pesos abiertos, sirve como sujeto de estudio para medir qué comportamientos cambian tras el procedimiento Heretic, comparando contra el modelo base sin abliterar.
- Evaluación de kernels y cuantizaciones en AMD gfx1151: el artefacto incluye el mapa exacto de tipos aceptados por Halogen y métricas contra llama-server, por lo que es un banco de pruebas para quien desarrolle o valide kernels ROCm en Strix Halo.
- Asistente conversacional de uso privado en una única máquina: todo el cómputo ocurre sobre memoria unificada local (~117 GB en el sistema de referencia) sin enviar datos a la nube, lo que encaja en entornos con requisitos de confidencialidad estrictos.
- Procesamiento de registros largos o logs de sistemas: la combinación de contexto de 262.144 tokens y prefill rápido a secuencias largas permite analizar trazas completas de incidencias, no solo fragmentos recortados.
- Reescritura y transformación de texto sin restricciones temáticas, útil en creación literaria o en tareas de reescritura donde los filtros de seguridad de un modelo alineado resultan un obstáculo para el flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son de rendimiento de inferencia, medidas sobre un AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) y ~117 GB de memoria unificada.

Throughput de prefill (tokens por segundo):

| Tokens de prompt | llama-server (Q8_0) | Halogen serial (IQ4_XS) | Halogen MTP | Aceleracion serial |
|:---:|:---:|:---:|:---:|:---:|
| 512 | 281,5 | 643,1 | 738,0 | 2,28x |
| 2K | 372,1 | 1.050,7 | 854,6 | 2,82x |
| 8K | 309,7 | 1.511,1 | 10.857,8 | 4,88x |
| 16K | 306,7 | 2.363,0 | 67.637,5 | 7,70x |

Throughput de decode (tokens por segundo), con prompts de 512 tokens:

| Runtime | Decode (tok/s) |
|:---:|:---:|
| llama-server | 24,1 |
| Halogen serial | 24,4 ± 4,4 |
| Halogen MTP | 32,0 ± 4,8 |

Observaciones del autor: la ventaja de Halogen en prefill crece con la longitud de la secuencia (de 2,28x a 512 tokens hasta 7,70x a 16K tokens), mientras que en decode los modos seriales están limitados por el ancho de banda de la memoria unificada y se quedan en ~24 tok/s en ambos runtimes. La cabeza MTP aporta aproximadamente un 33% adicional en decode y multiplica el prefill a partir de 8K. El uso de IQ4_XS reduce la huella de 176 GB a 93 GB, liberando ~83 GB para contexto y caché.

## Requisitos de hardware

- VRAM/memoria estimada: 93 GB solo para los pesos en IQ4_XS, más la caché KV correspondiente al contexto configurado. En la configuración de referencia se despliega sobre ~117 GB de memoria unificada. La variante Q8_0 del mismo modelo requiere 176 GB.
- GPU recomendada: AMD Radeon 8060S integrada en el Ryzen AI Max+ 395 (gfx1151), que es el hardware sobre el que se han validado los kernels. No se documentan otras GPU compatibles.
- GPU de consumo con VRAM dedicada: no cabe. 93 GB superan con holgura los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090, incluso antes de sumar caché KV. Un despliegue con offloading parcial a RAM del sistema no está documentado para este artefacto.
- Despliegue: Halogen Flash Server v0.11.4 o superior es el runtime objetivo y el único con kernels gfx1151 probados; se ofrece imagen Docker en `ghcr.io/peonist-ai/halogen-flash-server:0.11.4`. llama-server (vía ROCm) funciona como alternativa genérica y es el punto de comparación de los benchmarks, pero sin las optimizaciones específicas. Soporte en vLLM, TGI u Ollama: no disponible en la información proporcionada.
- Requisitos adicionales: ROCm operativo, acceso a `/dev/kfd` y `/dev/dri`, y el fichero de cabeza MTP `qwen38-flash-next-mtp.hgn` (1,5 GB, de peonist-ai) si se quiere la decodificación especulativa.
- Configuración de referencia documentada: `HALOGEN_CTX=262144`, `HALOGEN_MAX_TOK=32768`, `HALOGEN_PREFILL_CHUNK=32768`, `HALOGEN_KV_SLOTS=4`, `HALOGEN_GGUF_CACHE=1`, puerto de API 8096.
- Latencia y throughput: decode de ~24 tok/s en modo serial y ~32 tok/s con MTP; prefill desde 643 tok/s con prompts de 512 tokens hasta 67.637 tok/s con prompts de 16K en modo MTP. No se han publicado cifras de latencia por petición ni de *time to first token*.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Estado |
|---|---|---|---|---|---|---|
| cygnal/Qwen3.8-Flash-Next-Heretic2-IQ4XS-Halogen | ~166B totales / ~27B activos | 262.144 | IQ4_XS con overrides por tensor (4,51 BPW) | 93 GB | apache-2.0 | Publicado en HuggingFace; 0 descargas; requiere Halogen y gfx1151 |
| Qwen/Qwen3.8-Flash-Next (GGUF Q8_0 usado como origen) | ~166B totales / ~27B activos | 262.144 | Q8_0 | 176 GB | apache-2.0 | Modelo base, sin abliterar |
| Heretic2 BF16 (pesos de origen del abliterado) | ~166B totales / ~27B activos | 262.144 | BF16 | no disponible | apache-2.0 (heredada del base) | Punto de partida del build, no es el artefacto publicado |
| GGUF UD-IQ4_XS oficial de unsloth | ~166B totales / ~27B activos | 262.144 | IQ4_XS dinamico | no disponible | apache-2.0 | Citado por el autor como confirmacion de que `per_layer_token_embd.weight` es IQ4_NL; sin abliterar |

No se dispone de datos de benchmarks de calidad para ninguno de estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, cuantización, tamaño y licencia.

## Limitaciones y advertencias

- Modelo abliterado: la dirección de rechazo ha sido eliminada con Heretic v1.3.0. Esto implica que puede generar contenido que el modelo base rechazaría, incluyendo material dañino, ilegal o inseguro. No incorpora salvaguardas de moderación y no debería exponerse a usuarios finales sin una capa de filtrado propia.
- Sin evaluación de calidad publicada: no hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad. Se desconoce cuánto degrada el abliterado y la cuantización IQ4_XS a 4,51 BPW las capacidades de razonamiento y de seguimiento de instrucciones.
- Riesgo de alucinación: no cuantificado ni documentado por el autor. Con una ventana de 262.144 tokens, el riesgo de perder información intermedia del contexto no está evaluado.
- Idioma: solo se declara inglés. El uso en castellano u otros idiomas no está soportado de forma explícita y su rendimiento es desconocido.
- Fuerte acoplamiento al runtime: el artefacto está construido para el modo BYO GGUF de Halogen con kernels gfx1151. El tensor `per_layer_token_embd.weight` debe ser IQ4_NL; usar Q8_0 provoca un fallo de página en la GPU y el cierre del proceso. La portabilidad a otros runtimes GGUF no está garantizada.
- Dependencia del hardware: el mejor rendimiento documentado requiere un Ryzen AI Max+ 395 con Radeon 8060S y ~117 GB de memoria unificada. En otras GPU no hay cifras y el despliegue puede ser inviable por tamaño.
- Reproducibilidad del build: la recuantización exige un `llama-quant.cpp` parcheado (líneas 330-331 comentadas) y un mapa de tipos por tensor muy específico. No es un proceso estándar de `llama-quantize`.
- Licencia: apache-2.0 permite uso comercial, modificación y redistribución, pero se ofrece sin garantías. La responsabilidad legal y ética derivada de los contenidos generados por un modelo abliterado recae íntegramente en quien lo despliega.
- Madurez: publicado el 18 de septiembre de 2026, con 0 descargas y 0 "me gusta". No ha pasado por validación de la comunidad ni por auditoría independiente.
- Versionado: se requiere Halogen Flash Server v0.11.4 o superior. Cambios de versión del runtime pueden alterar el comportamiento o romper la compatibilidad del GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cygnal/Qwen3.8-Flash-Next-Heretic2-IQ4XS-Halogen
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Heretic v1.3.0 (utor del abliterado): https://huggingface.co/cygnal/Heretic-v1.3.0
- Halogen Flash Server (repositorio): https://github.com/peonist-ai/halogen-flash-server
- Imagen Docker de Halogen Flash Server: ghcr.io/peonist-ai/halogen-flash-server:0.11.4
- Cabeza MTP `qwen38-flash-next-mtp.hgn`: distribuida por peonist-ai (1,5 GB), sin URL directa en la model card
- Paper, blog o demo adicionales: no disponible. La búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo o su modelo base.
