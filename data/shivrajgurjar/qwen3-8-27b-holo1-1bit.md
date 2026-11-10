# shivrajgurjar/Qwen3.8-27B-HOLO1-1Bit

## Resumen

Qwen3.8-27B-HOLO1-1Bit es una compresión extrema del modelo Qwen/Qwen3.8-27B (BF16, 53,79 GB) realizada por el usuario shivrajgurjar mediante el procedimiento denominado Project HOLO-1. El resultado es un checkpoint de 3,56 GB (1,059 bits por peso, factor de compresión 15,11x) que, según la model card, preserva la funcionalidad del modelo original con una similitud coseno de 99,9925% en una capa individual y 99,8154% en el bloque SwiGLU completo. El objetivo declarado es ejecutar un modelo de gran tamaño en una única GPU AMD Instinct MI300X sin descomprimir matrices completas a BF16.

La innovación técnica se concentra en cuatro piezas: una transformación Walsh-Hadamard diagonal por bloques aleatorizada (R-BDWHT, B=128) para destruir outliers, un plano de bits primario empaquetado en uint32 con escalas uint8 por grupo de 256 y escalado por columna, un ancla factual en subespacio ortonormal de base compartida con asignación asimétrica de rango Khatri-Rao, y un kernel Triton específico para gfx942 que opera directamente sobre los bit-planes empaquetados en HBM3.

Es relevante ahora porque demuestra que la cuantización a ~1 bit por peso, combinada con kernels a medida, puede acercarse a la paridad numérica con BF16 en una arquitectura AMD de datacenter, un terreno donde las herramientas de cuantización extrema están menos maduras que en el ecosistema NVIDIA. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y su utilidad práctica depende de disponer de hardware MI300X y del kernel Triton asociado, que no se distribuye en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 1.127.578.496 (según safetensors del checkpoint comprimido); el modelo base Qwen3.8-27B declara 27B en su nombre, discrepancia no aclarada en la model card |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 1-bit (1,059 bpw): plano de bits empaquetado en uint32, escalas uint8 por grupo de 256, escalado por columna, ancla de subespacio int8 (U_r_i8, V_r_i8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3,6 GB de repositorio; 3,56 GB / 3,32 GiB de checkpoint) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo base Qwen/Qwen3.8-27B, no un modelo entrenado desde cero. La arquitectura subyacente pertenece a la familia Qwen3.5 (tag `qwen3_5`), pero la model card no detalla número de capas, dimensión oculta ni mecanismo de atención. El proceso HOLO-1 aplica primero una Randomized Block-Diagonal Walsh-Hadamard Transform con bloques de tamaño B=128 para redistribuir outliers antes de la cuantización, y después representa cada matriz como un plano de bits primario empaquetado en uint32 más escalas uint8 por grupo de 256 elementos y un factor de escala por columna.

Sobre esa representación se superpone un ancla factual en subespacio ortonormal de base compartida (U_r_i8 y V_r_i8) con asignación asimétrica de rango Khatri-Rao: r=32 sobre las matrices de dimensión K=5120 y r=192 sobre las matrices post-SwiGLU con K=17408. La inferencia se realiza con un kernel Triton escrito para gfx942 que consume los bit-planes empaquetados directamente desde HBM3, sin descomprimir la matriz completa a BF16. La model card menciona además una verificación sobre un estado recurrente Gated DeltaNet de 64 pasos, lo que sugiere que el modelo base incorpora componentes de atención lineal o híbridos, aunque no se especifica su configuración.

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, ya que se trata de una compresión de un modelo preexistente.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.8-27B, sujetos a la fidelidad de la compresión (similitud coseno de 99,8154% en bloque SwiGLU y divergencia KL de logits de 0,003641).
- Ejecución de inferencia directa desde bit-planes empaquetados mediante kernel Triton para gfx942, sin expansión a BF16.
- Preservación verificada de estados recurrentes (Gated DeltaNet, 64 pasos, similitud coseno 99,9870%).
- Capacidades de tool calling, agentes, multilingüismo, visión o audio: no disponibles en la información proporcionada; dependen del modelo base, cuya model card no se incluye.
- Modo thinking: no disponible.

## Casos de uso

- Investigación en cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar el impacto de 1,059 bpw sobre la calidad de un modelo de 27B, comparando las métricas publicadas (coseno por capa, coseno de bloque, divergencia KL de logits) con las de otras técnicas.
- Despliegue en un único AMD Instinct MI300X: con 3,56 GB de pesos, el modelo deja prácticamente libres los 192 GB de HBM3 para caché KV y lotes grandes, lo que permite servir contexto largo o alta concurrencia en una sola GPU.
- Validación de kernels Triton para gfx942: el repositorio documenta una latencia de 0,510 ms por operación del kernel bit-serial, útil como caso de prueba para desarrolladores que optimicen operadores de cuantización en ROCm.
- Evaluación de la técnica R-BDWHT: equipos que investiguen transformaciones Hadamard para destrucción de outliers pueden replicar el procedimiento sobre otros modelos y comparar la deriva de logits frente al objetivo de paridad INT8 (< 0,01).
- Prototipado de pipelines de inferencia de bajo consumo de memoria: en entornos con restricciones de VRAM donde no se requiere la fidelidad absoluta de BF16, el checkpoint permite experimentar con el modelo base a una fracción del coste de almacenamiento.
- Benchmarking de hardware AMD frente a NVIDIA: al ser una compresión diseñada específicamente para MI300X, permite medir latencia y throughput de un modelo de 27B en ROCm y contrastarlos con despliegues equivalentes en GPUs NVIDIA.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de fidelidad de la compresión y latencia del kernel, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---|
| Tamano original BF16 | 53,79 GB (50,10 GiB) |
| Tamano comprimido | 3,56 GB (3,32 GiB) |
| Bits por peso | 1,059 bpw |
| Factor de compresion | 15,11x |
| Similitud coseno por capa vs BF16 | 99,9925% |
| Similitud coseno bloque SwiGLU vs BF16 | 99,8154% |
| Divergencia KL de logits de salida | 0,003641 (objetivo de paridad INT8: < 0,01) |
| Similitud coseno estado recurrente Gated DeltaNet (64 pasos) | 99,9870% |
| Latencia del kernel bit-serial en MI300X | 0,510 ms |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: 3,56 GB de pesos en el formato comprimido; el espacio adicional para caché KV y activaciones no está documentado.
- GPU recomendada: AMD Instinct MI300X (192 GB HBM3, gfx942), única plataforma para la que existe el kernel Triton bit-serial.
- Compatibilidad con GPUs de consumo: no disponible; el kernel está escrito específicamente para gfx942 y no se indica soporte para otras arquitecturas AMD o NVIDIA.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato empaquetado en uint32 y el kernel a medida implican que las herramientas estándar no pueden cargarlo sin adaptación.
- Latencia: 0,510 ms por operación de kernel en MI300X según la model card; throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-27B-HOLO1-1Bit | 1.127.578.496 en checkpoint; base declarada 27B | no disponible | safetensors, 1,059 bpw | Apache 2.0 | AMD MI300X (gfx942) |
| Qwen/Qwen3.8-27B (base BF16) | 27B (según nombre) | no disponible | BF16 | no disponible en la información | GPU con ~54 GB de VRAM |
| Otras cuantizaciones de 1 bit del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables de cuantización extrema en el ecosistema AMD para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El checkpoint declara 1.127.578.496 parámetros en safetensors, mientras que el modelo base se denomina Qwen3.8-27B; la discrepancia no se explica en la model card y debe verificarse antes de asumir que la compresión cubre todos los pesos del original.
- La fidelidad se mide con similitud coseno y divergencia KL sobre capas y logits, no con evaluaciones de tareas; no hay evidencia publicada de que el rendimiento en razonamiento, código o matemáticas se mantenga.
- El kernel Triton para gfx942 no se incluye en el repositorio; sin él, los pesos empaquetados en uint32 no son cargables por herramientas estándar como llama.cpp o vLLM.
- Dependencia de hardware: el modelo está diseñado para AMD Instinct MI300X y no se documenta compatibilidad con otras GPUs.
- Idiomas soportados no especificados; el comportamiento multilingüe heredado del modelo base no está verificado tras la compresión.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; se heredan del modelo base y pueden amplificarse por la cuantización extrema.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del checkpoint comprimido.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de las métricas declaradas.
- Fecha de creación y actualización (2026-11-10) coherente con el tag `qwen3_5`, pero sin confirmación externa del modelo base referenciado.

## Enlaces

- Hugging Face: https://huggingface.co/shivrajgurjar/Qwen3.8-27B-HOLO1-1Bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Project HOLO-1: no disponible (no se enlaza paper, blog ni repositorio en la información proporcionada)
- Kernel Triton gfx942: no disponible
- Demos: no disponible
