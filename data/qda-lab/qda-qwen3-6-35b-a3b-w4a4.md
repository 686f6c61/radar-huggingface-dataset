# qda-lab/QDA-Qwen3.6-35B-A3B-W4A4

## Resumen

QDA-Qwen3.6-35B-A3B-W4A4 es una cuantizacion NVFP4 (4 bits en pesos y activaciones, con algunas capas en FP8) del modelo multimodal Qwen/Qwen3.6-35B-A3B, desarrollada por qda-lab para GPUs NVIDIA Blackwell. El modelo base es un Mixture-of-Experts (MoE) de la familia Qwen3.6 con capacidad image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto. La cuantizacion reduce el peso de 71,9 GB en BF16 a 24,1 GB, un factor de 3,0x, manteniendo segun el autor el 99,0 % de la precision del modelo original.

La relevancia de esta ficha es practica: permite desplegar un MoE multimodal de gran contexto en hardware Blackwell con un consumo de VRAM muy inferior al del checkpoint BF16, usando vLLM y el formato compressed-tensors. La receta de cuantizacion se genero mediante busqueda automatizada con agentes (QDA), y el autor afirma que una reconstruccion desde la receta fue byte-identica al checkpoint publicado en una GB300.

El modelo se distribuye bajo licencia Apache-2.0, la misma que el modelo base, y esta pensado para inferencia nativa en FP4 sobre B200, GB300 y RTX PRO 6000. No se proporcionan datos sobre idiomas soportados ni sobre el proceso de entrenamiento del modelo base en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con atencion lineal (Gated DeltaNet) y atencion completa; tag `qwen3_5_moe` |
| Parametros totales | 19.845.695.344 (segun safetensors); el nombre comercial indica 35B-A3B |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, sin confirmar en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (E2M1 pesos, escala E4M3 por 16 entradas, escala tensor FP32) en expertos enrutados y lineales del decoder; FP8 W8A8 en `in_proj_qkv`, `in_proj_z`, `out_proj` y `lm_head`; BF16 en proyecciones de self-attention, expertos compartidos, puertas Gated DeltaNet, routers, embeddings y torre de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE multimodal de la familia Qwen3.6 que combina atencion lineal (Gated DeltaNet) con atencion completa y una torre de vision para entrada image-text-to-text. Esta version no reentrena el modelo: aplica cuantizacion post-entrenamiento. Los expertos enrutados y el resto de lineales del decoder se cuantizan en NVFP4, mientras que las proyecciones de atencion lineal y el `lm_head` pasan a FP8 W8A8 (pesos por canal, activaciones dinamicas por token). Las proyecciones de self-attention, expertos compartidos, puertas Gated DeltaNet, routers, embeddings y la torre de vision permanecen en BF16.

Los pesos se cuantizaron con GPTQ y la receta fue seleccionada por la busqueda automatizada de QDA bajo un presupuesto de tamano fijo. Segun el autor, la reconstruccion desde la receta en una GB300 tarda unos 9 minutos y produce un checkpoint byte-identico. No se dispone de informacion sobre tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (los benchmarks se reportan con thinking mode activado).
- Razonamiento matematico de competicion (AIME 2025, HMMT) y cientifico (GPQA-Diamond).
- Generacion de codigo (LiveCodeBench) y seguimiento de instrucciones (IFBench).
- Entrada multimodal image-text-to-text mediante torre de vision en BF16.
- Conocimiento general y profesional (MMLU-Pro).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Inferencia nativa FP4 en GPUs NVIDIA Blackwell (B200, GB300, RTX PRO 6000) mediante vLLM.

## Casos de uso

- Razonamiento matematico y cientifico en produccion: el modelo mantiene 89,8 en AIME 2025 y 84,9 en GPQA-Diamond tras la cuantizacion, por lo que es adecuado para asistentes de resolucion de problemas con cadenas de razonamiento largas (hasta 81.920 tokens de salida en la evaluacion).
- Analisis de documentos con imagenes: al ser image-text-to-text, puede procesar capturas, diagramas o formularios junto a texto, util para extraccion de datos en pipelines documentales.
- Generacion de codigo asistida: con 80,8 en LiveCodeBench, sirve para autocompletado y generacion de funciones en entornos de desarrollo, desplegado con vLLM.
- Evaluacion y benchmarking de cuantizaciones: su receta reproducible y su comparativa frente a otras NVFP4 lo convierten en referencia para validar pipelines de cuantizacion en Blackwell.
- Despliegue en hardware limitado: al ocupar 24,1 GB, cabe en una sola GPU Blackwell de gama profesional (RTX PRO 6000) para prototipos y servicios de baja concurrencia.
- Servicio de inferencia de alto rendimiento: vLLM 0.33.0 sobre GB300 permite servir el modelo con kernels FP4 nativos, adecuado para cargas con requisitos de latencia ajustados.
- Tareas de instrucciones complejas: con 66,0 en IFBench, es util para asistentes que deben seguir restricciones de formato y contenido en prompts largos.

## Benchmarks y rendimiento

Resultados publicados por el autor (thinking mode, pass@1 promediado sobre los draws; temperatura 1,0, top-p 0,95, top-k 20):

| Benchmark | Problemas x draws | BF16 (71,9 GB) | QDA W4A4 (24,1 GB) | NVIDIA NVFP4 (23,4 GB) | RedHatAI NVFP4 (25,0 GB) | unsloth NVFP4 (23,6 GB) |
|---|---:|---:|---:|---:|---:|---:|
| AIME 2025 | 30 x 32 | 89,3 | 89,8 | 89,4 | 88,5 | 89,0 |
| HMMT Feb 2026 | 33 x 32 | 81,8 | 80,2 | 79,1 | 74,8 | 77,9 |
| GPQA-Diamond | 198 x 16 | 86,0 | 84,9 | 85,0 | 83,7 | 84,5 |
| IFBench | 300 x 16 | 67,6 | 66,0 | 66,6 | 66,2 | 67,9 |
| MMLU-Pro | 12.032 x 1 | 85,2 | 85,0 | 84,9 | 84,1 | 84,9 |
| LiveCodeBench | 454 x 4 | 81,8 | 80,8 | 81,4 | 80,1 | 81,0 |
| Media | | 81,9 | 81,1 | 81,1 | 79,6 | 80,9 |

## Requisitos de hardware

- VRAM estimada: 24,1 GB de pesos en el repositorio; se necesita margen adicional para KV cache y activaciones, por lo que se recomienda al menos 32-48 GB de VRAM para contexto largo.
- GPUs compatibles: NVIDIA Blackwell con soporte FP4 nativo, es decir, B200, GB300 y RTX PRO 6000. Evaluado con vLLM 0.33.0 sobre GB300.
- Consumer GPU: no cabe en GPUs de consumo actuales sin FP4 nativo; el modelo requiere hardware Blackwell.
- Despliegue: vLLM (`vllm serve qda-lab/QDA-Qwen3.6-35B-A3B-W4A4`) y transformers. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.
- Reconstruccion: QDA 0.1.0 sobre una sola GPU Blackwell, aproximadamente 9 minutos.

## Comparativa con modelos similares

| Modelo | Tamano | Precision | Media benchmarks | Licencia |
|---|---:|---|---:|---|
| QDA-Qwen3.6-35B-A3B-W4A4 | 24,1 GB | NVFP4 W4A4 + FP8 | 81,1 | Apache-2.0 |
| NVIDIA NVFP4 (Qwen3.6-35B-A3B) | 23,4 GB | NVFP4 | 81,1 | Apache-2.0 |
| RedHatAI NVFP4 (Qwen3.6-35B-A3B) | 25,0 GB | NVFP4 | 79,6 | Apache-2.0 |
| unsloth NVFP4 (Qwen3.6-35B-A3B) | 23,6 GB | NVFP4 | 80,9 | Apache-2.0 |
| Qwen3.6-35B-A3B BF16 | 71,9 GB | BF16 | 81,9 | Apache-2.0 |

## Limitaciones y advertencias

- Dependencia de hardware: la inferencia FP4 nativa solo funciona en GPUs NVIDIA Blackwell; en otras arquitecturas el modelo no se puede ejecutar en su formato previsto.
- Perdida de precision: la media baja de 81,9 a 81,1 frente a BF16; HMMT Feb 2026 cae 1,6 puntos y LiveCodeBench 1,0 punto.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos del modelo base ni de la cuantizacion.
- Idiomas: no se especifican los idiomas soportados, lo que limita la planificacion de despliegues multilingues.
- Contexto: no se indica la longitud maxima de contexto, dato critico para dimensionar KV cache.
- Tool calling y agentes: no confirmados; conviene validarlos antes de usarlos en produccion.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.6-35B-A3B.
- Madurez: el repositorio tiene 185 descargas y 0 likes, y fue creado en noviembre de 2026; la validacion externa es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Dataset de receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
