# Interchained/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini-GGUF es la distribucion cuantizada en formato GGUF del modelo thinkingmachines/Inkling-2-Mini, un modelo multimodal de proposito general desarrollado por Thinking Machines Lab y publicado bajo licencia Apache-2.0. La conversion y cuantizacion la ha realizado Interchained mediante su herramienta Hearth, partiendo del checkpoint oficial en precision mixta NVFP4/MXFP8. El modelo base es un transformer decoder-only de 24 capas y 26.400 millones de parametros totales, con aproximadamente 3.400 millones de parametros activos por token, lo que lo situa en la categoria de modelos Mixture-of-Experts (MoE) de eficiencia alta.

La innovacion principal del modelo es su arquitectura "looped": las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de solo 24 conjuntos de pesos. Cada token se enruta a 8 de 128 expertos MoE, y la atencion combina capas locales (ventana de 1024 tokens) con capas globales. El contexto nativo es de 1.000.000 de tokens.

Esta release GGUF esta pensada exclusivamente para inferencia de texto: el proyector de vision (mmproj) no se incluye, por lo que la entrada de imagenes no esta habilitada en estos ficheros. Es relevante ahora porque permite ejecutar un modelo de 26.4B parametros con contexto de un millon de tokens en hardware de consumo, siempre que se use una build de llama.cpp con soporte para la arquitectura `inkling2_loop`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas "looped" (arquitectura `inkling2_loop`), MoE, atencion local/global mixta |
| Parametros totales | 26.070.385.152 (26.4B) |
| Parametros activos | ~3.4B por token |
| Longitud de contexto | 1.000.000 tokens (nativo) |
| Tipos de cuantizacion | q8_0, q6_k, q5_k_m, q4_k_m, q4_0, q3_k_m, q2_k, tq1_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base original en safetensors, precision mixta NVFP4/MXFP8) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 24 capas con 26.4B parametros totales y ~3.4B activos por token. Su rasgo distintivo es el bucle de capas: las 12 capas centrales se aplican tres veces compartiendo pesos, lo que produce 48 aplicaciones de capa por token a partir de 24 conjuntos de pesos. La capa MoE enruta cada token a 8 de 128 expertos. La atencion alterna capas locales con ventana de 1024 tokens y capas globales, lo que permite sostener un contexto nativo de 1.000.000 de tokens. El modelo base fue publicado por Thinking Machines Lab en precision mixta NVFP4/MXFP8 bajo licencia Apache-2.0; los GGUFs de esta ficha se generaron a partir de ese checkpoint oficial.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. En el proceso de cuantizacion, los tensores de down-projection de los expertos tienen 1152 filas, cantidad que los tamanos de bloque de los K-quants no pueden dividir; por ello, en los K-quants el cuantizador de llama.cpp asigna tipos de respaldo a 120 de los 694 tensores (tipos de clase Q5_0/Q4_0 en esos tensores). Es el comportamiento estandar del cuantizador para esta arquitectura y queda reflejado en las cifras de BPW efectivos.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y tareas de conocimiento general propias de un modelo de 26.4B parametros con ~3.4B activos.
- Contexto largo: ventana nativa de 1.000.000 de tokens gracias a la combinacion de atencion local y global.
- Capacidad multimodal en el modelo base (proyector de vision), no habilitada en esta release GGUF al no incluirse mmproj.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: con 1.000.000 de tokens de contexto nativo, el modelo puede procesar libros tecnicos completos, expedientes o bases de codigo en una sola pasada sin fragmentacion, lo que reduce la perdida de contexto entre trozos.
- Asistente conversacional de larga duracion: el contexto de un millon de tokens permite mantener historiales de conversacion muy extensos sin resumir, util en atencion al cliente o soporte tecnico con trazas largas.
- Procesamiento de texto en hardware de consumo: la cuantizacion q4_k_m (16.19 GiB, 5.33 BPW) cabe en una GPU de 24 GB con margen para contexto, lo que permite desplegar un modelo de 26.4B en una RTX 4090 o similar.
- Despliegue en servidores con GPU de 32 GB: en una Tesla V100 de 32 GB caben todas las cuantizaciones de la tabla, incluida q8_0 (25.83 GiB), lo que facilita servir la version de mayor fidelidad en infraestructura existente.
- Investigacion sobre arquitecturas looped: el modelo sirve como banco de pruebas para estudiar el comportamiento de capas recurrentes con pesos compartidos y enrutamiento MoE disperso (8 de 128 expertos) en tareas de generacion.
- Prototipado local con llama.cpp: mediante `llama-server` o `hearth serve` se puede levantar un endpoint HTTP compatible con la API de OpenAI para integrar el modelo en pipelines de desarrollo sin depender de servicios en la nube.
- Escenarios con restriccion de memoria muy severa: la cuantizacion tq1_0 (8.25 GiB, 2.72 BPW) permite ejecutar el modelo en GPUs de 12 GB o menos, asumiendo perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero GGUF): q8_0 25.83 GiB, q6_k 21.80 GiB, q5_k_m 18.45 GiB, q4_k_m 16.19 GiB, q4_0 13.81 GiB, q3_k_m 12.69 GiB, q2_k 10.02 GiB, tq1_0 8.25 GiB. Hay que sumar la memoria para la cache KV del contexto configurado.
- GPU recomendadas: una Tesla V100 de 32 GB aloja todas las cuantizaciones completas en VRAM; una GPU de 24 GB (RTX 4090, A10G 24GB) admite q4_k_m con margen para contexto, segun el autor.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con q4_k_m y en tarjetas de 12 GB o menos con q3_k_m, q2_k o tq1_0 (con perdida de calidad en las mas agresivas).
- Opciones de despliegue: llama.cpp (obligatorio con soporte para `inkling2_loop`, PR #32695, integrado en el fork aiassistsecure/llama.cpp), `llama-server` y Hearth (`hearth serve`). vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Requisito critico de runtime: las builds estandar de llama.cpp sin el PR #32695 no cargaran estos ficheros.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini (esta ficha) | 26.4B | ~3.4B | 1.000.000 | Apache-2.0 | GGUF / safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Esta release es solo de texto: el proyector de vision (mmproj) no se incluye, por lo que no se puede usar entrada de imagenes aunque el modelo base sea multimodal.
- Requiere una build especifica de llama.cpp con soporte para `inkling2_loop` (PR #32695). Las releases estandar no cargaran los ficheros, lo que complica el despliegue en entornos gestionados.
- En los K-quants, 120 de 694 tensores reciben tipos de respaldo por la forma de los tensores de down-projection de los expertos (1152 filas); esto puede introducir diferencias de calidad respecto a una cuantizacion ideal.
- La cuantizacion tq1_0 (ternaria, 1-bit) conlleva perdida de calidad esperada; el propio autor lo advierte.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingue sin datos.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; el modelo base tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-21); se trata de una publicacion muy reciente sin validacion comunitaria.
- El contexto nativo es de 1.000.000 de tokens, pero la cache KV a esa longitud puede exceder la VRAM disponible; en la practica habra que limitar `-c` segun el hardware.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Interchained/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Organizacion Thinking Machines Lab: https://huggingface.co/thinkingmachines
- Herramienta Hearth (Interchained): https://github.com/Eth-Interchained/hearth
- Fork de llama.cpp con soporte Inkling 2: https://github.com/aiassistsecure/llama.cpp
- PR de llama.cpp #32695 (soporte Inkling 2): https://github.com/ggml-org/llama.cpp/pull/32695
