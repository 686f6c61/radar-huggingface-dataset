# hermitdave/LFM2.5-8B-A1B-MLX-RCO-4bpw

## Resumen

LFM2.5-8B-A1B-MLX-RCO-4bpw es una cuantizacion de precision mixta del modelo LiquidAI/LFM2.5-8B-A1B, publicada por el usuario hermitdave. El modelo base es un transformer hibrido con arquitectura `lfm2_moe` que combina capas de convolucion corta con atencion completa y un bloque de mezcla de expertos (MoE). Cuenta con 8.467.856.832 parametros totales, de los cuales aproximadamente 1.500 millones estan activos por token gracias al enrutamiento top-4 sobre 32 expertos. Esta pensado para generacion de texto conversacional y razonamiento con cadena de pensamiento.

La relevancia de esta publicacion reside en el metodo de cuantizacion: RCO (rate-constrained optimization) con asignacion de precision mixta por tensor, que combina bitwidths de 3, 4, 6 y 8 bits segun la sensibilidad medida de cada capa, con un promedio de 3,97 bpw en parametros cuantizados y 4,34 bpw en el checkpoint completo. El resultado ocupa 4,8 GB frente a los 16,9 GB del modelo BF16, y esta empaquetado en formato MLX affine para su uso directo con la libreria `mlx_lm` en Apple Silicon, sin necesidad de `trust_remote_code`.

El checkpoint esta orientado a inferencia local en hardware de Apple mediante MLX. La model card reporta metricas de fidelidad medidas (KL 0,121 y top-1 de 80,7% frente a la referencia BF16) y datos de rendimiento en un M3 Max con 64 GB de memoria unificada, lo que permite evaluar el coste real de la compresion en terminos de velocidad de decodificacion y calidad de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2_moe` (hibrida: convolucion corta + GQA + MoE) |
| Parametros totales | 8.467.856.832 (8,47 B) |
| Parametros activos | ~1,5 B (top-4 de 32 expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO de precision mixta: 3-bit (23,6%), 4-bit (68,0%), 6-bit (0,5%), 8-bit (4,9%), BF16 (3,1%); group size 64 por defecto, 32/64/128 por tensor segun sensibilidad |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX packed (`mlx-packed-affine`), safetensors |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B emplea una arquitectura hibrida de 24 capas: 18 capas con convolucion corta y 6 capas con atencion completa (GQA), mas 2 capas FF densas. El tamano oculto es de 2048 y el bloque MoE contiene 32 expertos enrutados con seleccion top-4 por token. No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Esta publicacion concreta no es un fine-tune, sino una compresion con perdida del modelo base. El metodo RCO asigna precision por tensor a partir de una tabla medida de error de reconstruccion, combinada con seleccion de escalas ponderadas por imatrix por grupo (`--per-group-clip`) y dimensionado de grupo por tensor segun sensibilidad (`--per-tensor-group-size`). La calibracion se realizo con WikiText (128 muestras de 2048 tokens con BOS) y la importancia se capturo localmente como energia de activacion por columna agregada por experto enrutado. Las escalas y sesgos se almacenan en float16, con fallback a fp32 si algun valor excede el rango de fp16 (no ocurre en este checkpoint).

## Capacidades

- Generacion de texto conversacional y de razonamiento con cadena de pensamiento: la model card indica explicitamente que es un modelo de razonamiento que espera chain of thought, y recomienda usar `tokenizer.apply_chat_template()` para turnos de chat y razonamiento.
- Razonamiento multi-paso y uso como modelo agentico, segun la propia model card.
- Soporte de plantilla de chat mediante `chat_template.jinja` incluida en el tokenizer.
- Carga directa con `mlx_lm` estandar, sin codigo personalizado ni `trust_remote_code`.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado en MLX affine y se carga con `mlx_lm.load()` directamente, lo que permite ejecutar un modelo de 8,47 B parametros (1,5 B activos) en un Mac con memoria unificada sin GPU dedicada. Es el caso de uso principal de esta publicacion.
- Desarrollo y prototipado de agentes en local: al ser un modelo de razonamiento con soporte de plantilla de chat, puede emplearse para iterar sobre flujos agenticos multi-paso en un portatil antes de desplegar en infraestructura mayor, con un coste de memoria de 4,8 GB.
- Evaluacion de tecnicas de cuantizacion: el checkpoint incluye en su model card las metricas de fidelidad (KL, top-1, PPL) y puntos operativos alternativos (3,0, 3,5 y 4,25 bpw), lo que lo convierte en un caso de referencia para comparar metodos de compresion sobre arquitecturas MoE hibridas.
- Generacion de texto conversacional en entornos con recursos limitados: la ventana de 4,8 GB en disco y memoria permite desplegar un modelo conversacional en equipos donde un BF16 de 16,9 GB no cabria.
- Scoring de prompts en bruto: la model card documenta que el tokenizer define `bos_token_id` pero no lo anade en `encode()`, por lo que para scoring con prompts crudos debe anteponerse `<|startoftext|>` manualmente; util para pipelines de evaluacion y comparacion de modelos.
- Investigacion sobre decodificacion y latencia: los datos medidos en M3 Max (prefill 1377,3 tok/s, decode 53,00 tok/s frente a 1424,5 y 75,09 tok/s del BF16) permiten estudiar el coste de desquantizacion en tiempo de decodificacion sobre MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card si reporta metricas de fidelidad de la cuantizacion y de rendimiento en hardware concreto:

| Metrica | Referencia BF16 | Este checkpoint (4,0 bpw) |
|---|---:|---:|
| Perplejidad (WikiText) | 47,23 | 47,16 |
| KL vs referencia | — | 0,121 |
| Top-1 agreement | — | 80,7% |
| Prefill (M3 Max, 64 GB) | 1424,5 tok/s | 1377,3 tok/s |
| Decode (M3 Max, 64 GB) | 75,09 tok/s | 53,00 tok/s |
| Tamano en disco | 16,9 GB | 4,8 GB |

Puntos operativos alternativos medidos con el mismo protocolo:

| Objetivo | bpw efectivo | Tamano | KL | Top-1 |
|---|---:|---:|---:|---:|
| 3,0 | 3,41 | ~3,8 GB | 0,329 | 69,9% |
| 3,5 | 3,87 | 4,3 GB | 0,197 | 74,5% |
| 4,0 | 4,34 | 4,8 GB | 0,121 | 80,7% |

La model card advierte que la perplejidad no es un discriminador util para este modelo: todos los checkpoints cuantizados leen una PPL ligeramente inferior a la referencia mientras KL y top-1 se degradan claramente. Recomienda usar KL, top-1 y calidad de generacion. Tambien senala que el checkpoint de 4,25 bpw (KL 0,078, top-1 83,4%, 5,0 GB) es el punto operativo recomendado actualmente frente a este de 4,0 bpw.

## Requisitos de hardware

- Memoria: el checkpoint ocupa 4,8 GB en disco y permanece empaquetado en memoria; el modelo base BF16 ocupa 16,9 GB.
- Hardware de referencia medido: Apple Silicon M3 Max con 64 GB de memoria unificada.
- Compatibilidad: disenado para MLX, por lo que el hardware objetivo son chips de Apple (serie M). No se proporcionan datos de compatibilidad con GPU NVIDIA o AMD.
- Despliegue: `mlx_lm` (carga estandar con `mlx_lm.load()` y generacion con `mlx_lm.generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput medidos (stream unico, decodificacion greedy, prompt fijo de 512 tokens, 128 tokens de decodificacion, 3 ejecuciones tras warmup): prefill 1377,3 tok/s y decode 53,00 tok/s. El prefill esta saturado por ancho de banda y practicamente a la par del BF16; la decodificacion paga el coste de desquantizacion (~30% mas lenta que BF16).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este checkpoint (RCO 4bpw) | 8,47 B | ~1,5 B | no disponible | MLX packed | MIT | KL 0,121 / top-1 80,7%; 4,8 GB; decode 53,00 tok/s en M3 Max |
| LFM2.5-8B-A1B (BF16) | 8,47 B | ~1,5 B | no disponible | safetensors | MIT | Referencia sin comprimir; 16,9 GB; decode 75,09 tok/s en M3 Max |
| LFM2.5-8B-A1B-MLX-RCO-4.25bpw | 8,47 B | ~1,5 B | no disponible | MLX packed | MIT | Punto operativo recomendado por el autor; KL 0,078 / top-1 83,4%; 5,0 GB |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- No es un fine-tune: es una compresion con perdida del modelo base. La calidad de generacion puede diferir de la referencia BF16.
- KL 0,121 no equivale a una perdida nula en tareas: la model card indica explicitamente que no es task-lossless.
- El checkpoint de 3,0 bpw esta visiblemente roto (genera tokens `<|endoftext|>`/`<|startoftext|>` y entra en bucles); el autor recomienda 4,0 bpw como minimo y 4,25 bpw como punto operativo actual.
- El tokenizer define `bos_token_id` pero no lo anade en `encode()`: en scoring con prompts crudos debe anteponerse `<|startoftext|>` manualmente o el modelo divaga. `mlx_lm.generate` no lo anade.
- La perplejidad no es un indicador fiable de calidad en este modelo; deben usarse KL, top-1 y evaluacion cualitativa de generacion.
- El modelo empaquetado permanece empaquetado en memoria y en disco.
- Idiomas soportados: no disponible, por lo que no puede confirmarse cobertura multilingue.
- Longitud de contexto: no disponible.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Licencia MIT en el checkpoint; debe verificarse la licencia del modelo base LiquidAI/LFM2.5-8B-A1B para uso comercial.
- Dependencia de MLX limita el despliegue a hardware Apple; no hay datos de rendimiento en otras plataformas.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/hermitdave/LFM2.5-8B-A1B-MLX-RCO-4bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Repositorio de cuantizacion rco-mlx: https://github.com/hermitdave/rco-mlx
