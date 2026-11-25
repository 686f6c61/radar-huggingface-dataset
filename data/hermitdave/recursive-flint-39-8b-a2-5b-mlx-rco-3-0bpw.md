# hermitdave/Recursive-Flint-39.8B-A2.5B-MLX-RCO-3.0bpw

## Resumen
Recursive-Flint-39.8B-A2.5B-MLX-RCO-3.0bpw es una cuantizacion de precision mixta en formato MLX del modelo RecursiveSI/flint, un transformer MoE de 39.800 millones de parametros totales con unos 2.500 millones activos por token. La produce el usuario hermitdave mediante el pipeline RCO (rate-constrained optimization), que asigna bitwidths de forma diferenciada por grupo (layer, projection) segun su sensibilidad al error. El resultado es un checkpoint de 17,6 GB con un bpw efectivo de 3,0722 y un pico de memoria medido de unos 17 GB en Apple Silicon.

El interes practico esta en que permite ejecutar un MoE de casi 40.000 millones de parametros en equipos con memoria unificada de 64 GB, manteniendo una velocidad de decodificacion de 83,6 tok/s con mlx-lm, cifra muy proxima a la variante de 4,0 bpw (85,7 tok/s). La calidad se valida frente a un teacher BF16 mediante KL forward de 0,875 y una concordancia top-1 del 65,8 % sobre WikiText-2.

Es una pieza pensada para el ecosistema Apple (MLX), no para CUDA, y su licencia es "other", heredada del modelo base, lo que obliga a revisar los terminos del autor original antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (49 capas: 2 densas + 47 MoE), atencion hibrida 35 sliding-window (513) + 14 full |
| Parametros totales | 39.785.287.456 (39,8 B) |
| Parametros activos | ~2,5 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO mixed-precision: 3-bit (27.136 tensores), 2-bit (8.960), 8-bit (491); group size 64; escala bfloat16; embeddings y lm_head en BF16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (mlx-lm) |

## Arquitectura y entrenamiento
El modelo base es un transformer de mezcla de expertos con 49 capas, de las cuales 2 son densas y 47 son MoE. Cada capa MoE enruta 256 expertos con top-6 y ademas incluye un experto compartido siempre activo, lo que explica la relacion entre 39,8 B totales y ~2,5 B activos. El vocabulario es de 150.144 tokens y el hidden size de 2048. La atencion es hibrida: 35 capas usan ventana deslizante de 513 tokens y 14 capas usan atencion completa.

Sobre el entrenamiento del modelo original no se ha proporcionado informacion (numero de tokens, composicion del dataset, RLHF/DPO); no disponible. Lo que si documenta esta ficha es el proceso de cuantizacion: el pipeline RCO asigna bitwidths mediante programacion dinamica guiada por una base de datos de errores, usando una imatrix construida con 512 filas de 2048 tokens de FineWeb-Edu y el tokenizador propio del checkpoint. Los expertos se cuantizan por grupo (layer, projection) y todos los expertos apilados en un mismo tensor switch_mlp comparten bitwidth. La cobertura de expertos es de 36.093 de 36.096 claves activas; un experto (3 claves) nunca fue enrutado y lleva el fallback agregado por capa.

## Capacidades
- Generacion de texto autoregresiva con mlx-lm estandar.
- Razonamiento y conocimiento general medido en tareas zero-shot (arc, hellaswag, winogrande, mmlu).
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o thinking mode: no disponible.
- Eficiencia de inferencia propia de un MoE con top-6 sobre 256 expertos y experto compartido.

## Casos de uso
- Inferencia local en Mac con memoria unificada: con un pico de ~17 GB cabe en equipos de 32 GB o mas y permite ejecutar un MoE de 39,8 B en un portatil Apple Silicon sin GPU dedicada.
- Prototipado rapido de asistentes conversacionales: 83,6 tok/s de decodificacion en mlx-lm hacen viable la interaccion en tiempo real en local.
- Evaluacion comparativa de tecnicas de cuantizacion: al compartir asignacion con la variante de 4,0 bpw, sirve para medir el coste real de bajar un bit en 8.960 grupos manteniendo 491 tensores sensibles a 8-bit.
- Despliegue en entornos con restricciones de memoria: el checkpoint de 16 GB y el pico de 17 GB permiten servirlo en maquinas modestas donde un BF16 de 74 GB seria inviable.
- Investigacion sobre modelos MoE de grano fino: la configuracion de 256 expertos con top-6 y experto compartido permite estudiar el comportamiento del enrutado en un entorno cuantizado.
- Generacion de texto por lotes en local: la velocidad sostenida y el bajo coste de memoria lo hacen adecuado para tareas de sintesis de texto fuera de la nube.

## Benchmarks y rendimiento
Validacion frente a teacher BF16 (8 filas de WikiText-2 x 512 tokens, mismo protocolo para teacher y student):

| Metrica | Valor |
|---|---|
| KL forward (BF16 ‖ quant) | 0,875 |
| Concordancia top-1 | 65,8 % |
| Perplejidad | 33,47 |

Zero-shot (5 tareas x 400, precision bruta, sin referencia BF16):

| Tarea | Precision |
|---|---|
| arc_challenge | 0,4225 |
| arc_easy | 0,7375 |
| hellaswag | 0,4500 |
| winogrande | 0,5050 |
| mmlu | 0,4225 |
| Media | 0,5075 |

Throughput (mlx-lm, 2 calentamientos + 3 mediciones, 128 tokens de decodificacion):

| Version | tok/s decodificacion |
|---|---|
| 3,0 bpw | 83,6 (83,2–83,9) |
| 4,0 bpw | 85,7 (85,0–86,3) |
| 4,5 bpw | 82,1 (80,8–83,0) |

## Requisitos de hardware
- VRAM / memoria: checkpoint de 16 GB, pico medido de ~17 GB.
- GPU: el autor valida en Apple Silicon con 64 GB de memoria unificada; no se documenta soporte CUDA.
- GPU de consumo: cabe en Mac con 32 GB o mas de memoria unificada; en GPU dedicada no hay datos.
- Despliegue: mlx-lm (carga y genera con el stack estandar). vLLM, llama.cpp, Ollama y TGI no estan documentados para este checkpoint.
- Latencia y throughput: 83,6 tok/s de decodificacion en el equipo de validacion del autor.
- Nota: el flint-int4 de Recursive no es comparable porque usa el motor rec (weight_format mlx-affine-int4, embeddings sin empaquetar) y no carga en mlx-lm.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Recursive-Flint 3,0 bpw (esta ficha) | 39,8 B | ~2,5 B | no disponible | other | MLX safetensors | 83,6 tok/s, PPL 33,47, KL 0,875 |
| Recursive-Flint 4,0 bpw | 39,8 B | ~2,5 B | no disponible | other | MLX safetensors | 85,7 tok/s, misma asignacion con menos grupos degradados |
| Recursive-Flint 4,5 bpw | 39,8 B | ~2,5 B | no disponible | other | MLX safetensors | 82,1 tok/s |
| RecursiveSI/flint BF16 | 39,8 B | ~2,5 B | no disponible | other | safetensors | 74 GB, no residente en 64 GB; teacher de referencia |

## Limitaciones y advertencias
- La licencia es "other" y proviene del modelo base; es imprescindible revisar los terminos de RecursiveSI/flint antes de uso comercial.
- La validacion de calidad se hizo sobre solo 8 filas de WikiText-2 x 512 tokens; es una muestra pequena y puede no reflejar el comportamiento general.
- Las cifras zero-shot son precision bruta sin referencia BF16, por lo que no miden la degradacion respecto al modelo original.
- La concordancia top-1 del 65,8 % frente al teacher implica divergencias notables en la distribucion de siguiente token.
- El 2-bit aplicado a 8.960 tensores y el 3-bit a 27.136 puede degradar tareas sensibles no cubiertas por los benchmarks.
- Un experto (3 claves) nunca fue enrutado durante la calibracion y usa fallback agregado por capa.
- Solo se documenta ejecucion en MLX/mlx-lm; no hay soporte confirmado para vLLM, llama.cpp, Ollama o TGI.
- Idiomas soportados y longitud de contexto no estan documentados.
- Riesgo de alucinacion inherente al modelo base, no evaluado en esta cuantizacion.

## Enlaces
- Hugging Face: https://huggingface.co/hermitdave/Recursive-Flint-39.8B-A2.5B-MLX-RCO-3.0bpw
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Imatrix: https://huggingface.co/datasets/hermitdave/flint-imatrix
