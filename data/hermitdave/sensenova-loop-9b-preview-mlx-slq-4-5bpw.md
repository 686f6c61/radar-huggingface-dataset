# hermitdave/SenseNova-Loop-9B-Preview-MLX-slq-4.5bpw

## Resumen

SenseNova-Loop-9B-Preview-MLX-slq-4.5bpw es una cuantizacion estadisticamente casi sin perdida (SLQ, Statistically-Lossless Quantization) del modelo SenseNova-Loop-9B-Preview, publicada por el usuario hermitdave. El artefacto esta empaquetado especificamente para MLX-LM, el framework de inferencia de Apple para chips Apple Silicon, y emplea una asignacion de bitwidth mixta por capa con una media de 4,5 bits por peso (bpw). El modelo base pertenece a la familia SenseNova y se apoya en un backbone de texto Qwen3.5 con una arquitectura hibrida de atencion lineal y atencion completa, ademas de un esquema de ejecucion en bucle (looped execution) que reutiliza capas.

El interes de esta ficha reside en que no se trata de un modelo nuevo, sino de un artefacto de cuantizacion con metodologia documentada y metricas de fidelidad medidas: ratio de perplejidad de 1,0141, KLD simetrica de 0,1699 y recuperacion media zero-shot de 0,9623 en tres tareas. Es relevante para desarrolladores que quieran ejecutar un modelo de ~9B en Macs con memoria unificada limitada, ya que el artefacto empaquetado ocupa 7,631 GiB frente a los 38,1 GiB del BF16 original, una compresion de aproximadamente 5x.

Conviene subrayar que el modelo no es task-lossless segun los propios criterios del autor: la recuperacion en arc_challenge cae al 0,8936. Ademas, el checkpoint requiere `trust_remote_code=True` por un fichero de arquitectura personalizado, lo que anade una dependencia de codigo de terceros en el pipeline de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3.5-text, 32 capas distintas (56 ejecuciones virtuales), atencion hibrida lineal + completa, two-stream mHC |
| Parametros totales | ~9B (6,912B cuantizables); safetensors reporta 3.124.769.664 tensores de parametros empaquetados |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el autor documenta un coste de KV cache de ~728 KB/token, ~3,05 GB a 4K de contexto) |
| Tipos de cuantizacion | SLQ 4,5 bpw con asignacion mixta: 6-bit (16 capas, 8,0%), 5-bit (114 capas, 57,0%), 4-bit (70 capas, 35,0%) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors empaquetado en formato MLX (`nn.QuantizedLinear` + `mx.quantized_matmul`) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B-Preview emplea un backbone de texto Qwen3.5 con 32 capas distintas que se ejecutan hasta 56 veces en virtud de un esquema de bucle (las capas del rango [4, 28) se ejecutan dos veces). Combina atencion lineal con atencion completa y utiliza un mecanismo two-stream mHC. Esta variante cuantizada conserva la arquitectura pero sustituye las proyecciones cuantizables por capas `QuantizedLinear` de MLX, con un total de 200 proyecciones cuantizadas. Quedan excluidas de la cuantizacion los routers mHC (criticos en FP32 por su normalizacion Sinkhorn), las normas, el embedding, el LM head, el codificador de vision y la cabeza MTP.

El proceso de cuantizacion es un pipeline de cinco etapas implementado en slq-mlx: GPTQ por capa a bitwidths {2, 3, 4, 5, 6, 8} con group size 128 y calibracion sobre FineWeb-Edu (8192 tokens, secuencia de 256); construccion de una base de datos de error por capa; busqueda greedy por capa para alcanzar una media de 4,5 bpw; empaquetado en streaming capa a capa para evitar OOM en un M3 Max de 64 GB; y validacion zero-shot. El mapa de bitwidths por capa se guarda en `slq_bits` dentro de `config.json`. No se documenta en la informacion disponible el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation`, `conversational`).
- Arquitectura con codificador de vision integrado en el modelo base (excluido de la cuantizacion), aunque no se detalla en la informacion disponible el alcance real de las capacidades multimodales del checkpoint empaquetado.
- Cabeza MTP (multi-token prediction) presente en la arquitectura base, excluida de la cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el artefacto esta empaquetado para MLX-LM y ocupa 7,631 GiB, por lo que se puede cargar en Macs con memoria unificada de 16 GB o superior, evitando depender de GPUs dedicadas para prototipado.
- Evaluacion de tecnicas de cuantizacion: util para investigadores que quieran reproducir o comparar la metodologia SLQ frente a cuantizacion uniforme RTN de 4 bits, dado que el autor documenta el pipeline completo y las metricas de fidelidad.
- Despliegue de asistentes conversacionales en estaciones de trabajo Mac: el pipeline `conversational` y la ventana de contexto del modelo base permiten mantener dialogos multi-turno en local sin enviar datos a la nube.
- Prototipado rapido de aplicaciones de texto antes de migrar a produccion: al ser un checkpoint de preview, sirve para validar prompts y flujos con un coste de hardware bajo, sustituyendolo despues por el BF16 o una version task-lossless.
- Investigacion sobre arquitecturas con ejecucion en bucle: el modelo permite estudiar el impacto del esquema looped (56 ejecuciones virtuales sobre 32 capas) en calidad y coste de KV cache (~728 KB/token).
- Pruebas de robustez de cuantizacion en tareas de razonamiento: las metricas por tarea (arc_challenge, hellaswag, winogrande) permiten medir la degradacion esperada antes de adoptar el checkpoint en un caso concreto.

## Benchmarks y rendimiento

Metricas de fidelidad de la cuantizacion medidas por el autor (calibracion FineWeb-Edu, 256 secuencias):

| Metrica | Valor |
|---|---|
| Ratio de perplejidad (PPL ratio) | 1,0141 |
| KLD simetrica | 0,1699 |
| EAR | 0,9382 |
| Recuperacion media zero-shot (3 tareas, n=100) | 0,9623 |
| Veredicto task-lossless | No |

Recuperacion zero-shot por tarea (cap de 100 ejemplos por tarea):

| Tarea | BF16 | SLQ 4,5 bpw | Recuperacion | Diferencia pareada | IC 95% |
|---|---|---|---|---|---|
| arc_challenge | 0,4700 | 0,4200 | 0,8936 | −0,0500 ± 0,0332 | [−0,1150, +0,0150] |
| hellaswag | 0,4700 | 0,4500 | 0,9574 | −0,0200 ± 0,0141 | [−0,0477, +0,0077] |
| winogrande | 0,5600 | 0,5800 | 1,0357 | +0,0200 ± 0,0316 | [−0,0420, +0,0820] |

El autor advierte que los conjuntos completos tienen ~15,5k ejemplos por tarea y que esta ejecucion usa un cap de 100 ejemplos por velocidad. No se han publicado resultados de throughput (tok/s): la tabla de rendimiento del model card figura como TBD para BF16, SLQ 4,5 bpw y 4-bit uniforme RTN.

## Requisitos de hardware

- VRAM/memoria estimada: 7,631 GiB para el artefacto empaquetado, frente a 38,1 GiB del BF16 base (compresion ~5x).
- El autor valido el empaquetado en un M3 Max de 64 GB; el pack en streaming se diseno precisamente para evitar OOM en esa configuracion.
- Cabe en Macs con memoria unificada de 16 GB o mas, aunque el KV cache adicional por el esquema looped (~728 KB/token, ~3,05 GB a 4K de contexto) debe tenerse en cuenta al dimensionar.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable directamente, ya que el artefacto es formato MLX para Apple Silicon. Para CUDA habria que usar el modelo base o generar otra cuantizacion.
- Opciones de despliegue: MLX-LM (libreria declarada) con `trust_remote_code=True` obligatorio por el fichero `slq_model.py`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (pendientes de medicion por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / ecosistema | Licencia | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-MLX-slq-4.5bpw (este) | ~9B (6,912B cuantizables) | no disponible | MLX, 4,5 bpw mixto | MIT | Requiere `trust_remote_code`; recuperacion zero-shot 0,9623 |
| sensenova/SenseNova-Loop-9B-Preview (base BF16) | ~9B | no disponible | safetensors BF16 | MIT (segun este derivado) | Referencia de calidad; 38,1 GiB |
| Cuantizacion uniforme 4-bit RTN del mismo base | ~9B | no disponible | MLX / otros | MIT | El autor la menciona como comparacion, pero sin metricas publicadas (TBD) |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros fabricantes del mismo tamano (por ejemplo, variantes de 7B-9B de otras familias); se indica como no disponible.

## Limitaciones y advertencias

- No es task-lossless: la recuperacion media zero-shot es 0,9623 y arc_challenge cae a 0,8936, por debajo del objetivo >=0,99 del criterio del autor.
- La validacion se hizo con un conjunto de calibracion pequeno (32x256); calibraciones mayores podrian mejorar el EAR.
- Requiere `trust_remote_code=True` por el fichero `slq_model.py`, que envuelve `mlx_lm.models.qwen3_5`; implica ejecutar codigo de terceros al cargar el modelo.
- El esquema de ejecucion en bucle (capas [4, 28) ejecutadas dos veces) incrementa el footprint de KV cache (~728 KB/token, ~3,05 GB a 4K de contexto).
- Artefacto especifico de MLX: no es portable a CUDA ni a otros runtimes sin reconvertir.
- Idiomas soportados no documentados; riesgo de comportamiento degradado en lenguas distintas de las mayoritarias del dataset de entrenamiento del base (no disponible).
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, pero aplicables por herencia del modelo base.
- Licencia MIT permite uso comercial, pero al ser un checkpoint "Preview" conviene validar calidad en el dominio concreto antes de produccion.
- Sin metricas de throughput publicadas (TBD), por lo que no se puede estimar latencia en produccion.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/hermitdave/SenseNova-Loop-9B-Preview-MLX-slq-4.5bpw
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Pipeline de cuantizacion slq-mlx: https://github.com/hermitdave/slq-mlx
- Atribucion del pipeline (Hermes Agent): https://github.com/nousresearch/hermes-agent
