# hermitdave/Inkling-2-Mini-MLX-RCO-3.5bpw

## Resumen

Inkling-2-Mini-MLX-RCO-3.5bpw es una cuantización mixta de precisión del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario hermitdave mediante su pipeline `rco-mlx` sobre Apple Silicon. No se trata de un modelo nuevo, sino de una redistribución comprimida del checkpoint original de Thinking Machines Lab, orientada a la inferencia local en hardware Apple mediante la librería `mlx-lm`. El resultado ocupa 13,63 GB frente a los 19,53 GB del checkpoint publicado, lo que supone una reducción de aproximadamente el 30 % del peso en disco y en memoria.

El modelo base es un transformer con mezcla de expertos (MoE) y arquitectura de tipo looped-transformer, con 26.388.641.280 parámetros totales según los safetensors del repositorio. La cuantización se ha construido con una asignación de bits por tensor que va de 3 a 8 bits, con todos los tensores de expertos enrutados fijados al suelo de 3 bits y las proyecciones de atención repartidas entre 4, 6 y 8 bits. El resto de componentes críticos (embeddings, lm_head, RMSNorm, router, torre de visión) se mantienen en BF16.

La relevancia de esta ficha es doble: por un lado, documenta un punto de operación de cuantización extrema (3,53 bpw reales sobre los pesos cuantizados) que permite ejecutar un modelo de más de 26 000 millones de parámetros en equipos con memoria unificada limitada; por otro, expone una cadena de procedencia poco habitual, ya que el checkpoint original no existe en BF16 y los expertos han tenido que dequantizarse desde NVFP4 y MXFP8 antes de recuantizarse. Esa reconstrucción condiciona el techo de calidad alcanzable, tal y como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con looped-transformer (familia Inkling 2) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín mixta por tensor: 3, 4, 6 y 8 bits (RCO); componentes en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Inkling 2 de Thinking Machines Lab y combina un esquema de mezcla de expertos con una topología de transformer con bucles (looped-transformer), según las etiquetas y la nomenclatura del repositorio (`inkling2_loop`, `moe`, `looped-transformer`). El checkpoint publicado distribuye los expertos enrutados en 24 capas, con los expertos de las capas 0 a 19 almacenados en NVFP4 y los de las capas 20 a 23 en MXFP8, mientras que el resto de tensores ya estaban en BF16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica de esta publicación no reside en el entrenamiento sino en el pipeline de cuantización. RCO (rate-constrained optimisation) asigna bits por tensor resolviendo un problema de asignación bajo una restricción de tasa: con un objetivo nominal de 3,3 bpw y un suelo de 3 bits, el asignador reparte 8 bits a 32 tensores, 6 bits a 24, 4 bits a 120 y 3 bits a 48, resultando en 3,53 bpw reales sobre los pesos cuantizados y 4,13 bpw sobre el checkpoint completo. Los 48 tensores de expertos enrutados quedan todos en el suelo de 3 bits, lo que constituye la mayor fuente de degradación potencial. El autor descarta explícitamente la cuantización afín a 2 bits por considerarla no validada en esta familia y catastrófica en mediciones previas. La reconstrucción de los expertos desde NVFP4 y MXFP8 a BF16 es exacta respecto al checkpoint distribuido, pero incorpora el redondeo original, de modo que en las 20 capas NVFP4 el resultado puede igualar al nativo pero no superarlo.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Inkling-2-Mini.
- Procesamiento de visión: el repositorio conserva la torre de visión completa en BF16, por lo que la modalidad visual se mantiene operativa.
- Mezcla de expertos con enrutamiento por token, lo que permite activar solo una fracción de los parámetros por paso de inferencia.
- Procesamiento de contexto largo: no se dispone de la longitud exacta, pero la arquitectura looped-transformer del modelo base está diseñada para extender el cómputo por capas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Decodificación especulativa: el checkpoint no incluye el draft DSpark (`mtp.safetensors`), ya que el módulo Inkling 2 de `mlx-lm` no tiene cabecera MTP.

## Casos de uso

- Inferencia local en Mac con memoria unificada: con 13,63 GB de pesos, el modelo cabe en equipos de 32 GB o 64 GB de memoria unificada, lo que permite ejecutar un MoE de 26 000 millones de parámetros en un portátil o un Mac Studio sin GPU dedicada.
- Prototipado rápido de aplicaciones multimodales: la torre de visión en BF16 permite experimentar con tareas de imagen y texto en local antes de migrar a infraestructura con GPU, reduciendo el coste de iteración.
- Evaluación de cuantizaciones extremas: el punto de operación de 3,53 bpw sirve como referencia para estudiar la degradación de calidad de un MoE grande cuando los expertos se fijan al suelo de 3 bits, comparándolo con el checkpoint nativo NVFP4.
- Investigación en pipelines de cuantización: el histograma de bits y la metodología RCO documentados permiten reproducir o modificar la asignación de bits por tensor con la herramienta `rco-mlx` del mismo autor.
- Desarrollo de asistentes con contexto largo en entornos sin conectividad: al ejecutarse íntegramente en local, es adecuado para flujos de trabajo que no pueden enviar datos a la nube, siempre que se valide la calidad tras la compresión.
- Docencia y demostraciones: permite mostrar el comportamiento de un MoE multimodal de gran tamaño en hardware de consumo, con un coste de descarga de 13,7 GB frente a los 19,53 GB del original.
- Pruebas de integración con `mlx-lm`: útil para validar las PRs de soporte de Inkling 2 en `mlx-lm` antes de que se fusionen, ya que el autor proporciona un árbol parcheado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de métricas con valores marcados como `TBD` (perplejidad en WikiText-2, KL frente al checkpoint NVFP4 nativo, acuerdo top-1, recuperación zero-shot en cinco tareas, tokens por segundo en `mlx_lm` local y pico de RAM), pero ninguno de ellos está medido todavía.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 13,63 GB solo para los pesos; con overhead de activaciones, caché KV y contexto, se recomienda un mínimo de 24 GB y, para contextos largos, 32 GB o más.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX está pensado para Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra).
- Cabe en GPU de consumo: no en el sentido de CUDA; en Apple Silicon cabe en equipos con 32 GB de memoria unificada o superior. En 16 GB es inviable por el tamaño de los pesos.
- Opciones de despliegue: `mlx-lm` exclusivamente, con soporte de Inkling 2 pendiente de fusión (PRs ml-explore/mlx-lm#2086 y #2061). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es safetensors MLX y no GGUF.
- Latencia y throughput: no disponibles; los valores de tokens por segundo están marcados como `TBD` en la model card.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hermitdave/Inkling-2-Mini-MLX-RCO-3.5bpw | 26,39 B | no disponible | 3,53 bpw reales (mixta 3-8 bits) | Apache 2.0 | MLX, requiere PRs de `mlx-lm` |
| thinkingmachines/Inkling-2-Mini (checkpoint publicado) | 26,39 B | no disponible | NVFP4 (capas 0-19) y MXFP8 (capas 20-23) | Apache 2.0 | Pesos originales, 19,53 GB |
| Cuantización MLX 4.5 bpw del mismo modelo | 26,39 B | no disponible | 4,46 bpw sobre pesos cuantizados | Apache 2.0 | MLX, 16,57 GB |

La comparación directa con alternativas de otros fabricantes no está disponible en la información proporcionada. La única comparación documentada es interna a la familia: frente al checkpoint publicado, esta versión reduce el tamaño un 30 % a costa de fijar los expertos al suelo de 3 bits; frente a la cuantización de 4,5 bpw, ahorra 2,94 GB adicionales.

## Limitaciones y advertencias

- La procedencia de los pesos es problemática: no existe una versión BF16 del modelo base, por lo que los expertos se dequantizaron desde NVFP4 y MXFP8. En las 20 capas NVFP4, la cuantización a 3 bits añade una pérdida real de calidad sobre un peso que ya venía redondeado.
- Todos los tensores de expertos enrutados están a 3 bits, y los expertos representan el 92,6 % de los parámetros. Esta es la principal fuente de degradación y el autor la señala explícitamente como el coste de calidad del checkpoint.
- No se han medido métricas de calidad: perplejidad, KL frente al nativo, acuerdo top-1 y recuperación zero-shot están sin publicar. No hay evidencia empírica de que el modelo siga siendo utilizable en tareas exigentes.
- El soporte en `mlx-lm` depende de dos PRs en estado de borrador (#2086 y #2061) más un remapeo `inkling2_loop → inkling2`. Hasta que se fusionen, es necesario cargar un árbol parcheado, lo que complica la reproducibilidad y el despliegue en producción.
- No se incluye el draft DSpark (`mtp.safetensors`), por lo que no hay decodificación especulativa disponible con este checkpoint.
- El formato es exclusivamente MLX: no hay GGUF ni safetensors estándar para CUDA, lo que limita su uso a hardware Apple Silicon.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse empíricamente antes de cualquier uso en producción.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento aceptable en castellano sin evaluación previa.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre la calidad del resultado tras la cuantización.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/Inkling-2-Mini-MLX-RCO-3.5bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Organización del modelo base: https://thinkingmachines.ai
- Pipeline de cuantización: https://github.com/hermitdave/rco-mlx
- PR de soporte Inkling 2 en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2086
- PR base apilada: https://github.com/ml-explore/mlx-lm/pull/2061
