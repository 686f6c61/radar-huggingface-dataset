# marcsun13/topk-metal

## Resumen

`marcsun13/topk-metal` es un kernel de Metal para Apple Silicon que implementa la operación top-k sobre una fila pequeña de logits, pensado específicamente para el enrutamiento de expertos en modelos de arquitectura MoE (Mixture of Experts). Lo desarrolla Marc Sun (marcsun13), ingeniero de Hugging Face, y se distribuye como un paquete de kernels cargable mediante la librería `kernels` de Hugging Face.

El problema que resuelve es el cuello de botella en la selección de expertos: tanto `ggml` como `torch.mps.topk` realizan una ordenación completa de la fila (bitonic sort) para extraer los k valores más altos, lo cual es innecesario cuando k y n son pequeños (por ejemplo, 8 de 256). Este kernel realiza únicamente las comparaciones necesarias (k*n) y, opcionalmente, aplica softmax sobre los k valores seleccionados, evitando una segunda pasada. El resultado son 26 microsegundos frente a los 71 de una ordenación completa, una mejora de 2,7 veces por capa y por token.

El kernel devuelve los índices como enteros de 32 bits (`int32`), el formato que espera un matmul enrutado por expertos, eliminando así cualquier conversión adicional. Está diseñado para integrarse en pipelines de inferencia de modelos MoE en dispositivos Apple con GPU Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de computo Metal (no es un modelo de lenguaje) |
| Parametros totales | no disponible (no aplica, es codigo de kernel) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica, opera sobre tensores f32) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | Codigo fuente Metal (compilado en tiempo de ejecucion) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un kernel de computo escrito en Metal Shading Language. Su diseño se basa en un threadgroup por fila de logits, con una pasada de reduccion por cada salida deseada. Para cada uno de los k elementos seleccionados, realiza k*n comparaciones, pero como k y n son pequenos (tipicamente k=8, n=256), el coste de lanzamiento del kernel domina sobre el de las comparaciones. El kernel incluye una variante que aplica softmax sobre los k valores seleccionados, lo que evita una segunda llamada al kernel y reduce la latencia total.

No hay datos de entrenamiento, ya que no es un modelo neuronal. La innovacion tecnica principal es evitar la ordenacion completa de la fila, que es lo que hacen `ggml` (con `kernel_argsort_f32_i32_desc`) y `torch.mps.topk`. Al seleccionar solo los k mayores sin ordenar el resto, se reduce el numero de operaciones y se mejora la latencia en un factor de 2,7 en el caso medido (26 us frente a 71 us).

## Capacidades

- Seleccion de los k valores mas altos de una fila de logits (tipicamente logits de router MoE).
- Softmax opcional sobre los k valores seleccionados, integrado en el mismo kernel.
- Devolucion de indices en formato `int32`, listos para un matmul enrutado por expertos sin conversion adicional.
- Optimizado para GPU Metal en Apple Silicon (MPS).
- Interfaz sencilla via `get_kernel("marcsun13/topk-metal", version=1)` y llamada `top_k(logits, k, softmax=False)`.
- Soporta multiples filas (batch) mediante un threadgroup por fila.

## Casos de uso

- Enrutamiento MoE en modelos de lenguaje grandes: en cada capa, el router produce logits de tamano n (numero de expertos) y el kernel selecciona los k expertos activos. Es el caso de uso principal y el que motiva el diseno.
- Inferencia de modelos como DeepSeek-V3 o Mixtral en Apple Silicon: estos modelos usan routers MoE con cientos de expertos; este kernel reduce la latencia de seleccion en cada token y capa.
- Optimizacion de pipelines de generacion de texto con modelos MoE: al reducir el tiempo de enrutamiento, se mejora el throughput global en dispositivos Mac.
- Prototipado de kernels personalizados: como ejemplo de implementacion eficiente de top-k en Metal, puede servir de referencia para otros desarrolladores que necesiten operaciones similares.
- Integracion en librerias de inferencia como `llama.cpp` o `mlx` que soporten kernels externos: aunque no es un port, puede adaptarse para sustituir la ordenacion completa en entornos Metal.
- Investigacion en eficiencia de routers MoE: permite experimentar con diferentes valores de k y n midiendo la latencia real en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la informacion disponible. El autor menciona en la model card una medicion puntual: seleccionar los 8 mayores de 256 logits tarda 26 microsegundos con este kernel, frente a 71 microsegundos con una ordenacion completa (ya sea `ggml` o `torch.mps.topk`). Esta cifra corresponde a una sola fila y una sola pasada, sin softmax. No hay datos comparativos con otros kernels top-k especificos para Metal.

## Requisitos de hardware

- Requiere un dispositivo Apple con GPU compatible con Metal (Apple Silicon: M1, M2, M3, M4 o posteriores).
- No requiere VRAM dedicada adicional, ya que opera sobre tensores ya residentes en memoria de la GPU.
- No es aplicable a GPUs NVIDIA o AMD, al estar escrito en Metal.
- Para su uso, se necesita un entorno con la libreria `kernels` de Hugging Face instalada y un runtime que soporte la carga de kernels Metal (por ejemplo, PyTorch con backend MPS).
- La latencia medida (26 us) corresponde a una fila de 256 logits y k=8; el rendimiento escala con el numero de filas (batch) y el tamano de n.

## Comparativa con modelos similares

No existen kernels top-k equivalentes publicados como modelos en Hugging Face con la misma finalidad. Las alternativas mas cercanas son:

| Alternativa | Descripcion | Ventaja | Desventaja |
|---|---|---|---|
| `ggml` (`GGML_OP_TOP_K`) | Ordenacion bitonic completa de la fila | Funciona en multiples backends (CPU, CUDA, Metal) | Mas lento para k pequeno (71 us) |
| `torch.mps.topk` | Ordenacion completa en MPS | Integrado en PyTorch | Misma latencia que ggml, no optimizado para MoE |
| `marcsun13/topk-metal` | Seleccion directa sin ordenar | 2,7x mas rapido, softmax integrado, indices int32 | Solo Metal, solo filas pequenas |

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con Metal; no es portable a CUDA o ROCm.
- Diseñado para filas pequenas (n tipicamente 256 o menos) y k pequeno (8-16); para filas grandes, una ordenacion parcial podria ser mas eficiente.
- No incluye soporte para cuantizacion ni para otros tipos de datos que no sean f32.
- El softmax integrado solo se aplica sobre los k valores seleccionados, no sobre toda la fila; si se necesita softmax completo, habria que usar otra operacion.
- Al ser un kernel de bajo nivel, requiere conocimientos de la libreria `kernels` de Hugging Face y del ecosistema Metal para su integracion.
- No hay garantias de soporte a largo plazo ni documentacion extensa mas alla de la model card.
- La licencia MIT permite uso comercial, pero el autor no ofrece mantenimiento activo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/marcsun13/topk-metal
- Perfil del autor: https://huggingface.co/marcsun13
- Lista de modelos del autor: https://huggingface.co/marcsun13/models
- Referencia a kernel similar en tt-metal (DeepSeek V3): https://github.com/tenstorrent/tt-metal/blob/main/models/demos/deepseek_v3_b1/kernel_includes/tt_llk/tt_llk_blackhole/common/inc/sfpu/ckernel_sfpu_deepseek_moe_gate_topk_single_face.h
