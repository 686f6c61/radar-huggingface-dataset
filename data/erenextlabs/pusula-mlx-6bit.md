# erenextlabs/pusula-mlx-6bit

## Resumen

Pusula MLX 6-bit es una distribucion cuantizada del modelo de decision Decision 3.0 (vllm-sr/d3), un transformer de 26.000 millones de parametros con licencia Apache-2.0, adaptado por el laboratorio de IA de Erenext para responder preguntas tipadas con una probabilidad por opcion en un unico forward pass, sin generacion de texto. El repositorio combina el backbone de texto de d3 cuantizado a 6 bits con MLX (cuantizacion afina, group size 64) junto con el adaptador LoRA de Pusula v2.0 (rank 32) sin modificar, y esta pensado para ejecutarse en un Mac con Apple silicon mediante el paquete `pusula`, sin necesidad de servidor GPU.

El modelo resuelve un problema concreto de enrutamiento y clasificacion: dada una pregunta con opciones cerradas sobre un mensaje, devuelve la distribucion de probabilidad sobre cada opcion, lo que permite tomar decisiones deterministas y calibradas (se reporta ECE) en lugar de depender de la generacion libre de texto. La version 6 bits se presenta como la recomendada por el autor: queda a 0,06 puntos de la GPU en BF16 en precision micro y macro, y a menos de 0,5 puntos por tipo de pregunta, con pesos mas ligeros que la variante de 8 bits.

La relevancia actual reside en que permite desplegar un modelo de 26B en hardware de consumo Apple (medido en un M3 Max con 36 GB de memoria unificada) manteniendo un rendimiento casi identico al de BF16 en GPU. El ambito linguistico es exclusivamente turco y la tarea es clasificacion, no generacion, lo que acota mucho su uso pero lo hace muy adecuado para pipelines de routing y decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone de texto de Decision 3.0 / vllm-sr/d3) con atencion no causal segun el contrato de prompt d3, mas adaptador LoRA (rank 32) y code readout |
| Parametros totales | 25.624.595.456 (25,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explicita; el benchmark usa un presupuesto de tokens de 4096 |
| Tipos de cuantizacion | MLX affine 6 bits, group size 64; existen variantes 4 bits (14,4 GB) y 8 bits (27,3 GB) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); backbone cuantizado 20,9 GB + adaptador en `adapter/` 0,9 GB (descarga total 21,7 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de 26B cuyo backbone de texto procede de Decision 3.0 (vllm-sr/d3). Sobre el se aplica, en tiempo de ejecucion y en precision completa, el adaptador LoRA de Pusula v2.0 (rank 32) junto con un code readout; la atencion no causal forma parte del contrato de prompt de d3 y la gestion de estos componentes la realiza `pusula.mlx_d3`, no `mlx-lm` generico. El backbone se cuantizo una sola vez con `python -m pusula.mlx_d3 convert --bits 6` usando cuantizacion afina de MLX con group size 64.

No se realizo ningun entrenamiento para este repositorio: el adaptador es el Pusula v2.0 sin cambios y su entrenamiento se describe en la model card de Pusula. El modelo produce, para cada pregunta tipada, una probabilidad por opcion en un unico forward pass, sin decodificacion autoregresiva de texto. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion y decision sobre preguntas tipadas: devuelve una probabilidad para cada opcion en un solo forward pass.
- Enrutamiento (routing) de mensajes hacia opciones predefinidas con puntuaciones calibradas (se reporta ECE de 0,031).
- Evaluacion por lotes de ficheros de preguntas desde linea de comandos mediante `python -m pusula.mlx_d3 eval`.
- Modo base alternativo: con `--base` se desactiva el adaptador y se obtiene Decision 3.0 base.
- Capacidad multilingue limitada al turco.
- No soporta generacion de texto libre, tool calling, agentes ni razonamiento multi-paso; la tarea es exclusivamente de clasificacion.

## Casos de uso

- Enrutamiento de tickets de soporte en turco: el modelo asigna a cada mensaje una distribucion de probabilidad sobre categorias o colas predefinidas, lo que permite umbralizar y derivar automaticamente sin generacion de texto.
- Moderacion y triaje de contenido: clasificar mensajes entrantes en opciones cerradas (por ejemplo, tipo de incidencia o nivel de riesgo) usando las probabilidades por opcion y su calibracion.
- Clasificacion por lotes en local: procesar ficheros de preguntas con `pusula.mlx_d3 eval` en un Mac con Apple silicon, sin depender de un servidor GPU, para tareas de etiquetado o auditoria.
- Segmentacion de encuestas o formularios: responder preguntas tipadas sobre respuestas de texto libre en turco para codificar variables categoricas.
- Pre-filtrado en pipelines de datos: usar las probabilidades por opcion como senal previa para decidir que mensajes requieren revision humana o pasan a un modelo generativo mayor.
- Evaluacion y calibracion de sistemas de decision: comparar predicciones frente a BF16 en GPU o frente al modelo base mediante las herramientas del repositorio, aprovechando la concordancia casi total en precision micro y macro.

## Benchmarks y rendimiento

Resultados del Turkish Decision Benchmark (2.194 mensajes, 19.861 preguntas) en un Apple M3 Max con 36 GB de memoria unificada. Precision micro (%) / macro (%) / ECE (15 bins):

| Ejecucion | Decision 3.0 base | Pusula | Ganancia Pusula (micro) |
|---|---|---|---|
| MLX 6 bits (este repositorio) | 87,48 / 88,50 / 0,011 | 91,42 / 92,23 / 0,031 | +3,94 |
| GPU BF16 | 87,50 / 88,52 / 0,009 | 91,41 / 92,22 / 0,031 | +3,91 |

Con la configuracion v2.0 (preguntas personalizadas respondidas por Decision 3.0 base), la precision macro es de 92,06. La concordancia por pregunta con BF16 en GPU no se ha medido todavia. Memoria y velocidad en el M3 Max con 36 GB: pesos de 20,9 GB, pico de memoria de 26,8 GB (presupuesto de 4096 tokens, limite de 2 GB de cache, 100 preguntas) y 162 tokens de prompt por segundo para Decision 3.0 base.

## Requisitos de hardware

- VRAM/memoria: pesos de 20,9 GB; pico medido de 26,8 GB con presupuesto de 4096 tokens en un M3 Max de 36 GB.
- Hardware medido: Apple M3 Max con 36 GB de memoria unificada; no se han medido maquinas mas pequenas.
- GPU dedicadas: no aplica a esta variante MLX; la version BF16 en GPU es la referencia de comparacion.
- Cabe en GPU de consumo: no disponible para esta variante MLX; requiere Apple silicon con memoria unificada suficiente.
- Despliegue: paquete `pusula` con extra MLX (`pip install "pusula[mlx] @ git+https://github.com/erenextlabs/pusula@v2.1`); `mlx-lm` generico no es suficiente. La interfaz `D3Engine` y el servidor HTTP `pusula-serve` no funcionan en MLX.
- Rendimiento: 162 tokens de prompt por segundo para el modelo base en M3 Max; no se reporta throughput para el adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (micro/macro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pusula MLX 6 bits (este repositorio) | 25,6B | no disponible (presupuesto de 4096 tokens en benchmark) | 91,42 / 92,23 | Apache-2.0 | Hugging Face, MLX |
| Pusula MLX 4 bits | 25,6B | no disponible | no disponible | Apache-2.0 | Hugging Face, MLX (14,4 GB) |
| Pusula MLX 8 bits | 25,6B | no disponible | no disponible | Apache-2.0 | Hugging Face, MLX (27,3 GB) |
| Decision 3.0 base (GPU BF16) | 26B | no disponible | 87,50 / 88,52 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Se aplican las limitaciones de Pusula v2.0 descritas en su model card.
- `pusula.mlx_d3` solo puntua ficheros de preguntas desde linea de comandos; `D3Engine` y el servidor HTTP `pusula-serve` no funcionan en MLX.
- Memoria y velocidad se midieron unicamente en un M3 Max con 36 GB; no hay datos para maquinas menores.
- Los resultados se midieron solo en el Turkish Decision Benchmark; se recomienda evaluar en datos propios antes de desplegar.
- La concordancia por pregunta con BF16 en GPU no se ha medido.
- El modelo solo soporta turco y solo realiza clasificacion sobre opciones cerradas; no genera texto libre ni soporta tool calling o agentes.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada, aunque al no generar texto el riesgo se limita a la asignacion de probabilidades.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `vllm-sr/d3` y del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/erenextlabs/pusula-mlx-6bit
- Modelo base Pusula: https://huggingface.co/erenextlabs/pusula
- Decision 3.0 (vllm-sr/d3): https://huggingface.co/vllm-sr/d3
- Variante 4 bits: https://huggingface.co/erenextlabs/pusula-mlx-4bit
- Variante 8 bits: https://huggingface.co/erenextlabs/pusula-mlx-8bit
- Dataset de benchmark: https://huggingface.co/datasets/erenextlabs/turkish-decision-benchmark
- Repositorio de codigo: https://github.com/erenextlabs/pusula
- Guia MLX: https://github.com/erenextlabs/pusula/blob/v2.1/benchmark/README_MLX.md
- MLX: https://github.com/ml-explore/mlx
