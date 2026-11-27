# amd/granite-4.0-h-tiny-w8a8-llmcompressor

## Resumen

`amd/granite-4.0-h-tiny-w8a8-llmcompressor` es una versión cuantizada a INT8 (W8A8) del modelo `ibm-granite/granite-4.0-h-tiny` de IBM, publicada por AMD. El objetivo es doble: reducir el peso en disco y en memoria del modelo original (de 12,9 GiB a 6,6 GiB, un 49% menos) y habilitar inferencia eficiente en CPU sobre procesadores AMD EPYC mediante el stack ZenDNN/ZenTorch. Es, por tanto, una ficha orientada a despliegues de servidor sin GPU.

El modelo base es un híbrido Mamba-MoE: de sus 40 capas, 4 son de atención completa y 36 son bloques Mamba (atención lineal), y cada capa incorpora un bloque MoE de 64 expertos enrutados junto a un MLP compartido. Con 6.939.037.248 parámetros totales, se sitúa en la gama "tiny" de la familia Granite 4.0, pensada para cargas de trabajo de generación de texto conversacional con requisitos de hardware moderados.

La relevancia de esta publicación es fundamentalmente práctica: demuestra un pipeline reproducible de cuantización con LLM Compressor (RTN, sin calibración) y ofrece una receta concreta de qué se cuantiza y qué se mantiene en BF16 en una arquitectura híbrida MoE poco convencional. La licencia Apache 2.0 del modelo base se conserva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GraniteMoeHybridForCausalLM (híbrida Mamba-MoE: 36 capas Mamba + 4 capas de atención completa, MoE de 64 expertos por capa) |
| Parámetros totales | 6.939.037.248 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 W8A8 (pesos INT8 simétricos per-channel estáticos; activaciones INT8 simétricas per-token dinámicas); formato compressed-tensors |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, int-quantized) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura híbrida que combina bloques Mamba (atención lineal con estado) y bloques de atención completa en una proporción de 36 a 4 sobre 40 capas totales. Cada capa incluye además un bloque MoE con 64 expertos enrutados más un MLP compartido, lo que da lugar a una arquitectura con una huella de parámetros total alta pero un coste de cómputo por token controlado por el enrutamiento. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF/DPO) no están disponibles en la información proporcionada.

La aportación técnica de esta versión es el esquema de cuantización. Se aplicó LLM Compressor v0.13.0 con el algoritmo Round-to-Nearest (RTN), que es data-free: no requiere dataset de calibración. Se cuantizan los 64 expertos enrutados de cada capa (`block_sparse_moe.experts.*.{gate,up,down}_proj`), el MLP compartido (`shared_mlp.{input,output}_linear`), las proyecciones Mamba (`mamba.{in,out}_proj`) y las proyecciones `self_attn.{q,k,v,o}_proj` de las 4 capas de atención completa. Se mantienen en BF16 los routers MoE (`block_sparse_moe.router`), los internos del espacio de estados Mamba que no son capas lineales (`conv1d`, `A_log`, `D`, `dt_bias`, `mamba.norm`), `lm_head`, `embed_tokens` y las layer norms. La exclusión del router es deliberada: sus logits deciden la asignación de expertos y un error de redondeo de 8 bits puede alterar la selección top-k.

## Capacidades

- Generación de texto conversacional en inglés (pipeline `text-generation`, tarea `conversational`).
- Razonamiento aritmético y matemático de varios pasos, evidenciado por la evaluación en GSM8K.
- Razonamiento sobre arquitecturas MoE con enrutamiento por token; el modelo conserva los routers en BF16 para preservar la selección de expertos.
- Inferencia en CPU sobre AMD EPYC con ZenDNN, sin necesidad de GPU.
- Compatibilidad con vLLM v0.29.0 y con el ecosistema `transformers` (`AutoModelForCausalLM`, `trust_remote_code=True`).
- Soporte de tool calling, function calling, agentes, modo thinking, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Servicio de chat en CPU para entornos sin GPU: el modelo se ejecuta sobre AMD EPYC con ZenDNN y vLLM, lo que permite desplegar generación de texto en servidores de propósito general donde no hay aceleradores disponibles.
- Reducción de coste de memoria en despliegues multi-instancia: al pasar de 12,9 GiB a 6,6 GiB, se pueden alojar aproximadamente el doble de réplicas del modelo por nodo, lo que mejora la densidad de servicio en un clúster de CPU.
- Razonamiento matemático en pipelines por lotes: con una recuperación del 99,71% en GSM8K 5-shot respecto al BF16, es adecuado para tareas de resolución de problemas aritméticos donde el throughput importa más que la latencia interactiva.
- Prototipado y evaluación de arquitecturas híbridas Mamba-MoE: sirve como referencia para estudiar cómo afecta la cuantización INT8 a un modelo con 64 expertos por capa y solo 4 capas de atención completa.
- Backend de generación de texto en herramientas internas de documentación o resumen, en inglés, con hardware AMD estándar y sin aprovisionar GPU.
- Base para experimentos de cuantización reproducible: la receta publicada (dos entradas de `ignore`, RTN data-free, guardado en `int-quantized`) permite replicar el proceso sobre el modelo base o adaptarlo a otros modelos MoE.

## Benchmarks y rendimiento

| Benchmark | BF16 baseline | W8A8 (este modelo) | Recuperación |
|---|---|---|---|
| GSM8K (5-shot) | 0.8203 | 0.8180 | 99,71% |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks adicionales.

## Requisitos de hardware

- Hardware objetivo: CPU AMD EPYC. Sistema operativo preferido: Linux.
- VRAM: no aplica; la inferencia está pensada para CPU. El peso en disco es de 6,6 GiB (frente a 12,9 GiB del BF16), y el repositorio ocupa 7,1 GB.
- GPU: no se documentan requisitos de GPU; el stack declarado es ZenDNN v6.1.0, ZenTorch v2.13.0.0 y PyTorch v2.13.0.0 sobre CPU.
- Stack de software: vLLM v0.29.0, LLM Compressor v0.13.0, `torch==2.13.0.0`, `zentorch==2.13.0.0`.
- Configuración de OpenMP: se recomienda exportar `LD_PRELOAD` apuntando a `libomp.so` (LLVM OpenMP) o `libiomp5.so` (Intel OpenMP) antes de lanzar vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| amd/granite-4.0-h-tiny-w8a8-llmcompressor | 6.939.037.248 | no disponible | INT8 W8A8 | apache-2.0 | CPU AMD EPYC |
| ibm-granite/granite-4.0-h-tiny (base) | 6.939.037.248 | no disponible | BF16 | apache-2.0 | GPU/CPU genérica |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación natural es contra el modelo base sin cuantizar, del que esta versión se diferencia únicamente en el esquema de cuantización y en el stack de inferencia optimizado para ZenDNN. No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Bloqueo de versión: la model card advierte explícitamente de un "version lock"; el modelo requiere versiones concretas de torch, zentorch, vllm y llmcompressor, y puede no funcionar correctamente con otras.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas en la información disponible.
- Sesgos: no se documentan sesgos conocidos en la model card; deben asumirse los del modelo base y los de su corpus de entrenamiento, no disponible.
- Asignación de expertos: aunque los routers se mantienen en BF16 para evitar cambios en la selección top-k, la cuantización de los expertos enrutados puede introducir degradaciones no medidas más allá de GSM8K.
- Evaluación limitada: solo se publica un benchmark (GSM8K 5-shot); no hay datos de MMLU, HumanEval, tareas multilingües ni de robustez.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (ZenDNN, ZenTorch) en producción.
- Contexto: la longitud de contexto del modelo base no se especifica en la información disponible, lo que impide planificar cargas con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/granite-4.0-h-tiny-w8a8-llmcompressor
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-tiny
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
