# ceselder/muse-spark-olens-qwen-reader

## Resumen

Muse Spark olens Qwen reader es un adaptador LoRA (rsLoRA de rango 64) publicado por el usuario `ceselder` bajo el paraguas del proyecto Muse Spark Open. No es un modelo generativo autónomo, sino un componente de interpretabilidad: un *lector* entrenado para verbalizar, en forma de una única viñeta de texto, lo que el modelo Muse Spark Open está a punto de generar. Para ello, toma las activaciones de la capa 40 del modelo Muse (8.192 dimensiones), las proyecta mediante un mapa afín aprendido (8.192 → 5.120) al espacio de la capa 42 de Qwen3.6-27B y las inyecta en ese modelo base en la posición de un token marcador, de modo que el adaptador LoRA sobre Qwen produce la predicción textual.

La relevancia técnica del artefacto es doble. Por un lado, demuestra que es posible transferir información entre espacios de activación de modelos distintos (cross-model) mediante un mapa lineal más un adaptador entrenado, lo que abarata enormemente la experimentación en interpretabilidad: en lugar de ejecutar rollouts de Muse (que requieren un nodo de 8×B200 por brazo), el lector se entrena sobre Qwen3.6-27B con 8×B200 a 7,7 s por paso SFT de 2.048 filas y 17-18 s por paso RL de 256×8. Por otro, publica el pipeline completo (mapa ridge, checkpoint SFT, checkpoint RL) con métricas de reconstrucción y de un benchmark propio, WorkspaceBench.

El repositorio (4,2 GB) contiene tres carpetas: `ridge_map/` (mapa afín en forma cerrada), `sft_final/` (adaptador tras un pase limpio sobre 2.899.968 objetivos) y `release/` (checkpoint tras RL con CISPO, paso 250). La licencia es doble, `muse-model-license-and-apache-2.0`, al ser un derivado tanto de Muse Spark Open como de Qwen3.6-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador rsLoRA (rango 64, alpha 16) sobre Qwen3.6-27B, con mapa afín aprendido Muse h40 → Qwen h42 e inyección por hook en la salida del bloque decodificador 1 |
| Parametros totales | 466,9 M en el adaptador LoRA (el modelo base Qwen3.6-27B no se incluye en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | `muse-model-license-and-apache-2.0` (licencia doble: derivado de Muse Spark Open y de Qwen3.6-27B) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `affine.pt` en PyTorch) |

## Arquitectura y entrenamiento

El sistema consta de tres piezas encadenadas. Primero, un mapa afín `A(h) = W h + b` (W de 5.120×8.192, b de 5.120) ajustado en forma cerrada por ridge sobre 1.856.828 pares alineados por bytes entre posiciones de Muse y de Qwen; la validación sobre 4.096 posiciones alcanza coseno centrado 0,713, FVE 0,524 y coseno bruto 0,875 (0,705 en el fichero held-out). Segundo, un adaptador rsLoRA de rango 64 y alpha 16 (466,9 M de parámetros) sobre Qwen3.6-27B, coentrenado con el mapa durante un pase limpio sobre 2.899.968 objetivos verbatim de Muse deduplicados, con entropía cruzada held-out de 2,7491. Tercero, una fase de RL con CISPO contra el reconstructor de Muse `ar1c` (lr 6e-6 para el adaptador, 2e-5 para el mapa), de la que se publica el paso 250.

La inyección sigue la receta del *one-bullet lens* de Qwen: un forward hook en la salida del bloque decodificador 1 sustituye la activación en la posición del token marcador `㈜` (id 158983) por `h + ||h|| · unit(A(h_muse))`, es decir, una suma normalizada en norma. Las activaciones de Muse se capturan sobre ids de token planos (sin BOS ni plantilla) con el fork `vllm-metamodels` de `muse-spark`, con norma típica de 64. El mapa se ajustó en fp64 con momentos centrados por desplazamiento y lambda = 0,03 × media de la diagonal de Cxx (la rejilla 1e-5 a 0,1 es plana dentro de 0,001). Como referencia zero-shot, el lens SFT de Qwen alimentado con `A(h40)` alcanza CE 3,739 sobre continuaciones de Muse, comparable al propio estado de la capa 42 de Qwen en la misma posición (3,804), frente a 5,710 con estados barajados y 5,144 sin inyección.

## Capacidades

- Verbalización de activaciones: produce una única viñeta (`* ...`) que describe lo que Muse Spark Open se dispone a generar a partir de su activación de la capa 40.
- Lectura cross-model: traduce representaciones internas de un modelo (Muse, 8.192 d) al espacio de otro (Qwen3.6-27B, 5.120 d) mediante un mapa afín aprendido.
- Reconstrucción de contenido: la métrica principal es la reconstrucción held-out de las viñetas greedy, con recompensa 0,3269 y coseno centrado 0,561 sobre 256 filas.
- Evaluación en benchmark propio: WorkspaceBench, con 21 familias sin variantes de errata y 24 en total.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking de forma documentada; es un artefacto de interpretabilidad, no un asistente.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en interpretabilidad: inspeccionar qué información contiene la activación de la capa 40 de Muse Spark Open sin ejecutar el modelo completo, usando Qwen3.6-27B como lector barato.
- Monitorización de rollouts de Muse: sustituir parte del coste de un nodo 8×B200 por brazo por inferencia sobre Qwen con el adaptador, manteniendo la recompensa calculada por el reconstructor de Muse.
- Estudio de transferencia entre espacios latentes: usar `ridge_map/` como línea base lineal y comparar con `sft_final/` y `release/` para medir cuánto aporta el ajuste no lineal vía LoRA.
- Auditoría de alineación: detectar anticipadamente contenido problemático en la generación de Muse a partir de la verbalización de su estado interno antes de que se materialice el texto.
- Desarrollo de métodos de activation verbalization: reutilizar el pipeline (captura de activaciones, alineamiento por bytes, mapa ridge, inyección normalizada, SFT y RL con CISPO) para otros pares de modelos.
- Evaluación comparativa de lectores: contrastar este lector con el lens nativo de Muse y con el lector de Kimi sobre Kimi-K3 en WorkspaceBench para estudiar qué arquitecturas de lector generalizan mejor.
- Docencia y divulgación: demostrar de forma reproducible cómo se verbalizan activaciones internas con un coste de entrenamiento acotado (7,7 s por paso SFT en 8×B200).

## Benchmarks y rendimiento

| Checkpoint | CE held-out (1.024 objetivos) | Reconstrucción held-out de viñetas greedy: recompensa / ccos (256 filas) | WorkspaceBench sin errata (21) [IC 95%] / las 24 / solo workspace (11) | Tasa de alucinación |
|---|---|---|---|---|
| `sft_final` (etiqueta `xqm_rl_a_step0000`) | 2,7491 | 0,1985 / 0,425 | 0,248 [0,233; 0,262] / 0,228 / 0,118 | 0,430 |
| `release` = `rl_step_0250` | no disponible | 0,3269 / 0,561 | 0,378 [0,360; 0,395] / 0,425 / 0,311 | 0,428 |
| Lens nativo de Muse, release (brazo F paso 300) | no disponible | 0,3307 / 0,565 | 0,440 / 0,481 / 0,378 | 0,498 |
| Lector de Kimi sobre Kimi-K3 | no disponible | no disponible | 0,370 / 0,425 | no disponible |

La continuación propia de Muse como referencia de reconstrucción marca 0,1706. El checkpoint de mayor rendimiento en el bench del brazo es el paso 200 (0,404 / 0,451), pero fue seleccionado sobre el propio bench, por lo que la cifra es optimista por construcción y no se publica. El paso 250 se eligió por máxima reconstrucción held-out (los pasos 225-300 quedan dentro de 0,006, el ruido de 256 filas).

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 466,9 M de parámetros (aproximadamente 0,9 GB en fp16) más el mapa afín (W de 5.120×8.192 y b de 5.120, unos 84 MB en fp32). El modelo base Qwen3.6-27B debe cargarse aparte; en bf16 requiere del orden de 54 GB solo para pesos, más caché KV y activaciones.
- GPU recomendadas: el autor reporta entrenamiento en 8×B200 (7,7 s por paso SFT de 2.048 filas; 17-18 s por paso RL de 256×8). Para inferencia del lector se necesita al menos una GPU con capacidad para Qwen3.6-27B completo.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en bf16 sin cuantizar el modelo base; no se documenta ninguna cuantización del lector.
- Opciones de despliegue: no se documentan explícitamente; el uso previsto es mediante la librería `peft` sobre el modelo base Qwen/Qwen3.6-27B, con hooks personalizados para la inyección.
- Latencia y throughput: no disponibles para inferencia; solo se publican tiempos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Base | Parámetros del adaptador | Contexto | WorkspaceBench (24) | Licencia |
|---|---|---|---|---|---|
| Muse Spark olens Qwen reader (este) | Qwen3.6-27B | 466,9 M (rsLoRA r64) | no disponible | 0,425 | muse-model-license-and-apache-2.0 |
| Lens nativo de Muse Spark Open | Muse Spark Open | no disponible | no disponible | 0,481 | muse-model-license |
| Lector de Kimi sobre Kimi-K3 | Kimi-K3 | no disponible | no disponible | 0,425 | no disponible |

El lens nativo supera al lector cross-model en WorkspaceBench (0,481 frente a 0,425) y en reconstrucción (0,3307 / 0,565 frente a 0,3269 / 0,561), pero exige ejecutar Muse para cada evaluación. El lector de Kimi iguala en WorkspaceBench con las 24 familias (0,425) y queda por debajo sin erratas (0,370 frente a 0,378). El lector cross-model ofrece así un equilibrio entre coste y fidelidad.

## Limitaciones y advertencias

- Es un artefacto de interpretabilidad, no un modelo de propósito general: no debe usarse como asistente, para generación libre ni para tareas de código o matemáticas.
- Tasa de alucinación elevada: 0,428 en el checkpoint publicado, similar a la del SFT (0,430) y algo menor que la del lens nativo (0,498).
- El checkpoint publicado se eligió por reconstrucción held-out, no por rendimiento en el bench; las cifras de WorkspaceBench del paso 200 están sesgadas por selección y no se publican.
- El mapa afín se ajusta sobre pares alineados por bytes, con un 95,9% de coincidencia en fragmentos verificados manualmente; las discrepancias de pre-tokenización (números partidos en grupos de tres, sufijos como `'s`) introducen ruido.
- El adaptador depende de un fork específico de vLLM (`vllm-metamodels`, `muse-spark`) para capturar las activaciones de Muse, lo que limita la portabilidad.
- Licencia doble y restrictiva en la parte Muse: es necesario revisar `LICENSE.md` antes de cualquier uso comercial, ya que el artefacto es derivado tanto de Muse Spark Open como de Qwen3.6-27B.
- No se documentan idiomas soportados ni longitud de contexto; el comportamiento fuera del dominio de verbalización de Muse no está caracterizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ceselder/muse-spark-olens-qwen-reader
- Lens de Muse Spark Open: https://huggingface.co/ceselder/muse-spark-olens-lens
- Colección Muse Spark olens: https://huggingface.co/collections/ceselder/muse-spark-olens-6adfd563a2ccaa4deb299019
- Repositorio de entrenamiento (referenciado en la model card): `ceselder/muse-olens`, commit `46b1c0b`
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia: `LICENSE.md` en el repositorio del modelo
