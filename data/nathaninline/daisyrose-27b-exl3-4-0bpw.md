# nathaninline/DaisyRose-27B-exl3-4.0bpw

## Resumen

DaisyRose-27B-exl3-4.0bpw es una cuantizacion EXL3 (ExLlamaV3) de 4.0 bits por peso del modelo multimodal RadixArk/DaisyRose-27B, publicada por el usuario nathaninline. El modelo base es un transformer de tipo Qwen3.5 con capacidad de entrada imagen-texto (pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction) para decodificacion especulativa. La cuantizacion reduce el peso a aproximadamente 16 GB conservando el torre de vision y la cabeza MTP en el mismo repositorio, lo que permite desplegar el modelo completo en GPUs de consumo.

El interes practico de esta publicacion no esta en el modelo en si, sino en la comparacion directa que ofrece frente al GGUF oficial Q4_K_M: segun el autor, ambas cuantizaciones estan estadisticamente empatadas en divergencia KL respecto a BF16 (0.0147 frente a 0.0151 de media), pero la version EXL3 decodifica un 23 % mas rapido en el mismo hardware (50,0 frente a 40,7 tok/s). Es, por tanto, una alternativa orientada a rendimiento para servir el modelo con ExLlamaV3 o TabbyAPI.

El modelo se publica bajo licencia Apache 2.0, heredada del modelo base, y esta pensado para escenarios conversacionales multimodales con contexto de hasta 16.384 tokens segun la configuracion de ejemplo del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con torre de vision y cabeza MTP (multi-token prediction) |
| Parametros totales | 8.175.129.984 (pesos safetensors del repositorio cuantizado); el modelo base se anuncia como 27B |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (segun `max_seq_len` del ejemplo de TabbyAPI) |
| Tipos de cuantizacion | EXL3 4.0 bpw (decoder), 5 bpw (cabeza de salida), 6 bpw (torre de vision), 4 bpw (cabeza MTP), embeddings en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base RadixArk/DaisyRose-27B es un transformer de la familia Qwen3.5 con modulo de vision para entrada de imagenes y una cabeza MTP que permite decodificacion especulativa con tokens borrador. La cuantizacion EXL3 aplica un codebook `mul1` con calibracion por defecto (250 filas de 2048 tokens) y `--out_scales always`, con precision diferenciada por modulo: 4.0 bpw en las capas del decoder, 5 bpw en la cabeza de salida, 6 bpw en la torre de vision y 4 bpw en la cabeza MTP, manteniendo los embeddings en 16 bits.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, uso de RLHF o DPO) en la informacion proporcionada. La innovacion tecnica documentada en esta publicacion es la preservacion de la cabeza MTP dentro de la cuantizacion, lo que habilita decodificacion especulativa con 2 o 3 tokens borrador y un incremento medido de velocidad de decodificacion de aproximadamente 1,23x frente al GGUF Q4_K_M en el mismo hardware.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes junto con texto (pipeline `image-text-to-text`).
- Razonamiento con modo "thinking" activable (el autor menciona `reasoning on` en las pruebas de velocidad).
- Decodificacion especulativa mediante cabeza MTP integrada.
- Generacion de codigo (3 de los 4 prompts de la prueba de velocidad son de codigo).
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistencia conversacional multimodal: el modelo acepta imagenes y texto en el mismo prompt, lo que permite construir asistentes que respondan a capturas de pantalla, diagramas o fotografias con contexto de hasta 16.384 tokens.
- Servicio de inferencia de baja latencia en GPUs de consumo: con 16 GB de pesos y decodificacion a ~50 tok/s en una RTX 5060 Ti de 16 GB mas una RTX 3070 de 8 GB, es viable montar un endpoint de chat en hardware de gama media.
- Generacion de codigo en local: los prompts de codigo usados en la prueba de velocidad sugieren un uso previsto para autocompletado y explicacion de codigo, desplegable con TabbyAPI como backend compatible con la API de OpenAI.
- Analisis de documentos con imagenes: extraccion y descripcion de contenido visual combinado con texto, aprovechando la torre de vision cuantizada a 6 bpw.
- Despliegue en produccion con decodificacion especulativa: la cabeza MTP incluida permite activar `draft_mode: mtp` en TabbyAPI y obtener aproximadamente un 23 % mas de throughput que el GGUF equivalente sin cambiar de modelo.
- Evaluacion comparativa de cuantizaciones: el repositorio documenta la metodologia de medicion de divergencia KL contra BF16, util como referencia para equipos que comparen EXL3 frente a GGUF en sus propios pipelines.
- Prototipado de investigación multimodal: al ser Apache 2.0 y caber en dos GPUs de consumo, sirve para experimentar con modelos imagen-texto sin infraestructura de centro de datos.

## Benchmarks y rendimiento

| Metrica | GGUF Q4_K_M oficial (llama.cpp) | EXL3 4.0 bpw (este modelo) |
|---|---|---|
| Divergencia KL vs BF16, media | 0.0151 | 0.0147 |
| Divergencia KL vs BF16, mediana | 0.0043 | 0.0043 |
| Divergencia KL vs BF16, percentil 99 | 0.144 | 0.155 |
| Mismo token top que BF16 | 95,5 % | 95,3 % |
| Velocidad de decodificacion | 40,7 tok/s | 50,0 tok/s (1,23x) |
| Tamano de fichero | 16,6 GB (sin vision) | 16 GB (con vision) |

Mediciones realizadas en RTX 5060 Ti 16 GB + RTX 3070 8 GB, con decodificacion especulativa MTP de 2 tokens borrador, temperatura 1 y razonamiento activado, sobre 4 prompts (3 de codigo, 1 de explicacion) de 600 tokens cada uno, dos pasadas. La divergencia KL se midio sobre WikiText-2 raw (40 filas de 2048 tokens, puntuando la segunda mitad de cada fila, 40.920 tokens) contra los pesos BF16 originales ejecutados con ExLlamaV3.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB de pesos mas cache KV; con `cache_mode: "8,8"` y `max_seq_len: 16384` el consumo adicional depende del lote y la longitud de secuencia.
- GPU recomendadas: RTX 5060 Ti 16 GB, RTX 4090 24 GB, RTX 5090 32 GB, A100 40/80 GB, H100 80 GB.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas; el autor lo ejecuta repartido entre una RTX 5060 Ti de 16 GB y una RTX 3070 de 8 GB.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI (soporte nativo EXL3); no es compatible con llama.cpp, Ollama ni vLLM en formato EXL3.
- Latencia y throughput: ~50 tok/s de decodificacion con 2 tokens borrador MTP y ~51 tok/s con 3 tokens borrador en el hardware indicado; el autor senala que 2 y 3 tokens estan dentro del ruido.
- Configuracion de referencia: `tensor_parallel: true`, `gpu_split_auto: true`, `draft_mode: mtp`, `draft_num_tokens: 2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Calidad (KLD media vs BF16) | Velocidad | Licencia |
|---|---|---|---|---|---|---|
| DaisyRose-27B-exl3-4.0bpw (este) | 8,17B en safetensors cuantizados (base 27B) | 16.384 | EXL3 safetensors | 0.0147 | 50,0 tok/s | Apache 2.0 |
| DaisyRose-27B-GGUF Q4_K_M | no disponible | no disponible | GGUF | 0.0151 | 40,7 tok/s | Apache 2.0 |
| RadixArk/DaisyRose-27B (BF16) | 27B (anunciado) | no disponible | safetensors | referencia | no disponible | Apache 2.0 |

No se dispone de datos de otros modelos multimodales comparables (por ejemplo, de la familia Qwen-VL o similares) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye model card propia del modelo base: no hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion no cuantificado; no se han publicado evaluaciones de fidelidad factual.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del ingles sin pruebas propias.
- El contexto de 16.384 tokens es el valor del ejemplo de configuracion, no una especificacion confirmada del modelo base.
- Formato EXL3 propietario de ExLlamaV3: no se puede cargar con llama.cpp, Ollama, vLLM ni TGI, lo que limita la portabilidad del despliegue.
- La cuantizacion a 4 bpw introduce divergencia respecto a BF16 (percentil 99 de KLD de 0.155, ligeramente peor que el GGUF oficial en la cola); no es adecuada para tareas que exijan maxima fidelidad numerica.
- El autor indica que la cabeza MTP y la torre de vision estan incluidas, pero no documenta pruebas de calidad especificas para vision.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base RadixArk/DaisyRose-27B antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nathaninline/DaisyRose-27B-exl3-4.0bpw
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- GGUF oficial del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
