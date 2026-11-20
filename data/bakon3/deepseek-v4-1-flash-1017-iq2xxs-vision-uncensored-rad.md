# bakon3/DeepSeek-V4.1-Flash-1017-IQ2XXS-vision-uncensored-rad

## Resumen

DeepSeek-V4.1-Flash-1017-IQ2XXS-vision-uncensored-rad es un contenedor de pesos cuantizados del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, empaquetado por el usuario bakon3 para el motor de inferencia radiance sobre GPUs AMD RDNA4 con ROCm. No se trata de un modelo nuevo, sino de una redistribucion del checkpoint oficial re-cuantizada en un unico fichero `.rad` de 259,09 GiB, con la direccion de rechazo editada (abliteration) en 18 proyecciones de salida de atencion y con el codificador de vision de 32 capas conservado en bf16 para admitir imagenes a traves de la API de chat.

El interes tecnico esta en el empaquetado: mezcla por tensor de cuantizadores GGML (expertos enrutados en IQ2_XXS a ~2,06 bits por peso, atencion en q6_K y q5_K, expertos compartidos en q6_K y q8_0, embeddings y salida en q6_K, normas y routers en f32), una tabla Engram de 103 GiB reconstruida desde el tokenizador y un drafter DSpark en MXFP4. Todo ello pensado para ejecutarse en cuatro Radeon AI PRO R9700 de 32 GiB en TP4.

Es relevante ahora porque demuestra un caso real de despliegue de un modelo de gran tamano con vision sobre hardware AMD consumer/prosumer, algo poco habitual en un ecosistema dominado por CUDA, y porque documenta mediciones concretas (56,9 tok/s de decodificacion, TTFT de 7,03 s con un prompt de 24.013 tokens). La licencia MIT del modelo base se mantiene sobre el contenedor y sus modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos enrutados (MoE) y capas DSpark; codificador de vision ViT de 32 bloques |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se documenta un prompt medido de 24.013 tokens) |
| Tipos de cuantizacion | Mezcla por tensor: IQ2_XXS (expertos enrutados, ~2,06 bits/peso), q6_K, q5_K, q8_0, iq4_nl (tabla Engram), MXFP4/fp4_e2m1 (drafter DSpark), bf16 (vision y capas DSpark 40-42), f32 (normas y routers) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (contenedor del motor radiance), dividido en 6 partes de 45 GiB (la ultima de 34,09 GiB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer con mezcla de expertos (MoE) cuyos pesos oficiales se distribuyen en fp8 para las capas densas y fp4 para los expertos enrutados. Este contenedor re-cuantiza esos expertos enrutados a IQ2_XXS mediante busqueda de cuantizacion, mientras que la atencion se mantiene en q6_K (capas 0-26) y q5_K (capas 27-39), y las capas DSpark 40-42 en bf16. Los expertos compartidos usan q6_K y q8_0, y las normas y routers se conservan en f32 para preservar estabilidad numerica.

La innovacion principal del empaquetado es la inclusion del codificador de vision del release original en bf16 (32 bloques, hidden 1024, 16 cabezas de ancho 64, patch 14, RoPE 2D y aligner 3x3, 0,904 GiB almacenados), junto con 259 tensores de vision, cuatro tensores de aligner, tres vectores de delimitador y 43 vectores `bias_vl` anadidos tras la conversion. El autor indica que el fichero solo-IQ2 no puede procesar imagenes. Ademas, se genera una tabla Engram de 103 GiB a partir del tokenizador del release, ya que el modelo original no la incluye. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el proceso de RLHF/DPO del modelo base.

La modificacion de abliteration afecta a `attn_output_b` de las capas 11-28 con alpha 0,75; las otras 18 capas permanecen intactas. El drafter DSpark se mantiene en MXFP4 tal como se publico (6,72 GiB).

## Capacidades

- Generacion de texto conversacional a traves de una API compatible con OpenAI (`/v1/chat/completions`, `/v1/models`).
- Procesamiento de imagenes mediante partes de contenido `image` en la API de chat; las imagenes son solo de prefill y estan limitadas a 1.024 tokens de imagen por imagen.
- Razonamiento y generacion de codigo heredados del modelo base DeepSeek-V4.1-Flash-1017 (no se detallan capacidades especificas en la informacion disponible).
- Decodificacion especulativa mediante el drafter DSpark y especulacion n-gram de 5 tokens.
- Modo "uncensored": la direccion de rechazo se ha editado en 18 proyecciones de atencion, lo que reduce los rechazos del modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Inferencia de un modelo de gran tamano sobre hardware AMD: el contenedor esta disenado para cuatro Radeon AI PRO R9700 con ROCm 10.1+, lo que permite desplegar un MoE con vision en un entorno sin CUDA. Es adecuado para laboratorios que ya tienen infraestructura RDNA4.
- Procesamiento de documentos con imagenes: la ruta de vision admite hasta 1.024 tokens de imagen por imagen a traves de la API de chat, util para extraer informacion de capturas, diagramas o formularios en pipelines internos.
- Investigacion sobre abliteration y seguridad: al editar la direccion de rechazo en 18 capas y mantener las otras 18 intactas, sirve como caso de estudio para analizar el efecto de la abliteration parcial en el comportamiento del modelo.
- Evaluacion de tecnicas de cuantizacion extrema: la mezcla IQ2_XXS en expertos con q6_K/q5_K en atencion permite estudiar el impacto de la cuantizacion agresiva en calidad y velocidad en un MoE grande.
- Servicio de chat compatible con OpenAI: el servidor expone `/v1/chat/completions`, por lo que puede integrarse como backend en aplicaciones existentes que ya usan el SDK de OpenAI, con el nombre de modelo `DeepSeek-V4.1-Flash`.
- Pruebas de decodificacion especulativa: con el drafter DSpark y la especulacion n-gram de 5 tokens, es un banco de pruebas para medir ganancias de throughput en hardware AMD (56,9 tok/s medidos en decodificacion de 256 tokens).
- Despliegue con contexto largo: el TTFT medido de 7,03 s para un prompt de 24.013 tokens lo hace viable para tareas de resumen o analisis de documentos extensos en entornos con NVMe para la tabla Engram.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta mediciones de inferencia en su configuracion de hardware:

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion | 56,9 tok/s | 256 tokens generados, TP4, especulacion n-gram 5 |
| TTFT | 7,03 s | Prompt de 24.013 tokens |
| Tamano del contenedor | 259,09 GiB (278.197.639.056 bytes) | 6 partes |
| Tabla Engram | 103 GiB | Reconstruida desde el tokenizador |
| Codificador de vision | 0,904 GiB | bf16, 32 bloques |
| Drafter DSpark | 6,72 GiB | MXFP4 |

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 259,09 GiB; la configuracion de referencia usa cuatro AMD Radeon AI PRO R9700 de 32 GiB (128 GiB totales) en TP4, con `--host-pool-mib 57344` (56 GiB de pool en host).
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, RDNA4) en configuracion de cuatro tarjetas; no se documenta soporte para otras GPU.
- GPU consumer: no cabe en una GPU consumer individual; requiere multiples tarjetas de 32 GiB.
- RAM de host: 64 GiB recomendados.
- Almacenamiento: NVMe para el contenedor de 259 GiB y la tabla Engram de 103 GiB; el autor usa `--ngram-placement disk`.
- Software: ROCm 10.1+, rama `deepseek41-wip` del repositorio `bakon/radiance` (la rama `main` no incluye el plugin `arch/deepseek41`).
- Opciones de despliegue: exclusivamente el motor radiance con el plugin `arch/deepseek41`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 56,9 tok/s de decodificacion y TTFT de 7,03 s con prompt de 24.013 tokens en la configuracion TP4 descrita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-IQ2XXS-vision-uncensored-rad (este) | no disponible | no disponible | IQ2_XXS + q6_K/q5_K/q8_0 + bf16 vision | MIT | 4x Radeon AI PRO R9700, ROCm |
| DeepSeek-V4.1-Flash-1017-uncensored-rad (mismo autor) | no disponible | no disponible | UD-IQ1_S, 251,13 GiB | MIT | radiance, AMD |
| DeepSeek-V4.1-Flash-1017 (base oficial) | no disponible | no disponible | fp8 / fp4 expertos | MIT | no disponible |

La unica comparativa documentada es con el contenedor text-only del mismo autor (UD-IQ1_S, 251,13 GiB, misma abliteration, mayor ancho en expertos enrutados pero sin vision) y con el checkpoint oficial. No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion IQ2_XXS de los expertos enrutados (~2,06 bits por peso) degrada la calidad respecto al checkpoint oficial; no se han publicado evaluaciones de la perdida.
- La abliteration en 18 capas puede aumentar respuestas no filtradas o inapropiadas; el modelo se etiqueta explicitamente como "uncensored" y no es apto para aplicaciones que requieran salvaguardas estrictas.
- El motor radiance no esta en la rama `main`; hay que compilar la rama `deepseek41-wip`, lo que implica riesgo de inestabilidad y falta de soporte.
- El despliegue exige hardware AMD RDNA4 con ROCm 10.1+ y cuatro tarjetas de 32 GiB; no hay soporte documentado para CUDA ni para GPU consumer.
- Las imagenes son solo de prefill y estan limitadas a 1.024 tokens por imagen; no se documenta procesamiento de video ni audio.
- La tabla Engram de 103 GiB se reconstruye desde el tokenizador y no procede del release oficial, lo que introduce una fuente adicional de divergencia.
- No se dispone de informacion sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- La licencia MIT del modelo base se mantiene, pero el autor no ofrece garantias sobre el contenedor; conviene verificar el cumplimiento en uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- [Hugging Face: bakon3/DeepSeek-V4.1-Flash-1017-IQ2XXS-vision-uncensored-rad](https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-IQ2XXS-vision-uncensored-rad)
- [Modelo base: deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)
- [Contenedor text-only del mismo autor: DeepSeek-V4.1-Flash-1017-uncensored-rad](https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-uncensored-rad)
- [Coleccion: DeepSeek-V4.1-Flash radiance](https://huggingface.co/collections/bakon3/deepseek-v41-flash-radiance-6af1ddf468e089a2acfccafd)
- [Motor radiance (Codeberg)](https://codeberg.org/bakon/radiance)
- RUNNING.md: incluido en el repositorio del modelo (no se proporciona URL directa)
