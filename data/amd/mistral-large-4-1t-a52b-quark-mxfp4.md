# amd/Mistral-Large-4-1T-A52B-Quark-MXFP4

## Resumen

`amd/Mistral-Large-4-1T-A52B-Quark-MXFP4` es una versión cuantizada del modelo `mistralai/Mistral-Large-4-1T-A52B` de Mistral AI, publicada por AMD. Se trata de un modelo multimodal (texto e imagen) de arquitectura Mixture-of-Experts con 1 billón de parámetros totales y 52 mil millones de parámetros activos por token. AMD aplica su herramienta Quark para cuantizar únicamente los pesos y activaciones de los expertos enrutados en formato OCP MXFP4, manteniendo el resto de capas (atención, shared experts, vision encoder, cabezal de decodificación especulativa) en su precisión original.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala frontera en hardware AMD Instinct MI350/MI355 con vLLM sobre ROCm 10.0, reduciendo el espacio de pesos respecto al checkpoint original. El repositorio ocupa 577,9 GB en safetensors, lo que da una idea de la huella en disco. La model card reporta una recuperación de rendimiento muy alta respecto al modelo base (entre el 98,9 % y el 100 % en los benchmarks evaluados), lo que convierte esta variante en una opción atractiva para despliegues en infraestructura AMD sin renunciar prácticamente a calidad.

El modelo soporta contexto largo (hasta 262 144 tokens según el ejemplo de servidor vLLM) y dispone de niveles de esfuerzo de razonamiento (`low`/`medium`/`high`) a través del tokenizador Tekken v15. Está orientado a cargas de trabajo de razonamiento, matemáticas, código, visión y agentes, con decodificación especulativa DSpark integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PixtralForConditionalGeneration (transformer MoE multimodal, texto + imagen) |
| Parametros totales | 1 billón (1T) |
| Parametros activos | 52B (A52B) |
| Longitud de contexto | 262 144 tokens (configurado en el ejemplo vLLM); el buscador externo menciona 1 048 576, no confirmado en la model card |
| Tipos de cuantizacion | MXFP4 (OCP) en pesos y activaciones de expertos enrutados; resto de capas en precisión original |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 577,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts multimodal de Mistral AI con 1T de parámetros totales y 52B activos. La arquitectura `PixtralForConditionalGeneration` procesa entradas de texto e imagen y genera texto, incorporando un vision encoder, un patch merger y un adaptador visión-lenguaje. Los expertos enrutados son los únicos módulos cuantizados en esta variante; la atención, los shared experts, las capas feed-forward no enrutadas, las puertas (`gate`), la capa de salida y los módulos de visión se conservan en su precisión original.

La cuantización se realizó con AMD Quark (versión 0.14, aún no publicada en el momento de la model card) mediante un flujo fichero a fichero: cada shard safetensors se cuantiza individualmente, de modo que el modelo de 1T nunca se materializa completo en memoria. Los pesos de los expertos enrutados usan MXFP4 estático y las activaciones MXFP4 dinámico. El checkpoint incluye un cabezal de borrador (`mtp_dspark.*`) para decodificación especulativa DSpark, excluido de la cuantización. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso con niveles de esfuerzo configurables (`low`, `medium`, `high`).
- Razonamiento matemático de alta exigencia (evaluado en AIME26 y GPQA Diamond).
- Generación y verificación de código científico (evaluado en SciCode-Verified).
- Comprensión de imágenes y razonamiento visual (MMMU Pro en modalidad Standard y Vision).
- Seguimiento de instrucciones complejas (IFBench).
- Razonamiento sobre contexto largo (AA-LCR con ventanas extensas).
- Decodificación especulativa DSpark con profundidad de borrador de 3 tokens.
- Soporte de caché KV en fp8 y bf16.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Razonamiento científico y matemático asistido: el modelo obtiene 98,75 en AIME26 (mean@8) y 88,13 en GPQA Diamond, por lo que es adecuado para resolución de problemas de nivel experto con cadenas de razonamiento largas (más de 10 000 tokens de salida por respuesta en GPQA).
- Análisis de documentación técnica con imágenes: gracias a su naturaleza multimodal y a MMMU Pro Vision (74,22), puede procesar diagramas, gráficos y capturas junto con texto en flujos de ingeniería.
- Generación de código en pipelines de I+D: SciCode-Verified mide la capacidad de resolver problemas científicos con subproblemas; el modelo mantiene el mismo pass rate que el base (77,34 % en problema principal, 90,16 % en subproblemas), útil para asistentes de código especializado.
- Evaluación de instrucciones y agentes: IFBench (74,87) y AA-LCR (78,44) indican buen desempeño en tareas de seguimiento estricto de instrucciones y razonamiento sobre contextos extensos, adecuado para orquestación de agentes multi-paso.
- Despliegue en clústeres AMD Instinct: pensado para servirse con vLLM sobre 4× MI355X con tensor parallelism 4 y monokernel, lo que lo hace idóneo para entornos que ya operan hardware AMD y quieren evitar reescrituras de infraestructura.
- Servicio de inferencia a gran escala con contexto largo: la configuración de ejemplo admite `--max-model-len 262144` y caché KV en fp8, útil para análisis de contratos, corpus legales o bases de código extensas.
- Investigación en cuantización: sirve como referencia reproducible de cómo Quark cuantiza un MoE de 1T sin materializarlo, útil para equipos que estudian técnicas de compresión a escala frontera.

## Benchmarks y rendimiento

Resultados reportados en la model card comparando el modelo base y esta variante MXFP4, con las mismas tareas y parámetros de muestreo:

| Benchmark | Base `Mistral-Large-4-1T-A52B` | MXFP4 (este modelo) | Recuperación |
|---|---:|---:|---:|
| GPQA Diamond (mean@8) | 88,89 | 88,13 | 99,15 % |
| AIME26 (mean@8) | 98,75 | 98,75 | 100,00 % |
| MMMU Pro Standard (mean@2) | 77,66 | 77,37 | 99,63 % |
| MMMU Pro Vision (mean@2) | 74,60 | 74,22 | 99,49 % |
| SciCode-Verified main (mean@4) | 77,34 | 77,34 | 100,00 % |
| AA-LCR (mean@16) | 79,31 | 78,44 | 98,90 % |
| IFBench prompt_level_loose (mean@5) | 75,27 | 74,87 | 99,47 % |
| MMLU-Pro chat (mean@1) | 85,40 | 85,04 | 99,58 % |

Datos adicionales: en GPQA Diamond el maj@8 sube de 89,39 a 89,90 con MXFP4; en AIME26 el maj@8 es 100,00 en ambos. En SciCode-Verified el pass rate de subproblemas mejora de 88,41 a 90,16. El consumo medio de tokens de salida es similar entre ambos checkpoints (por ejemplo, 10 389 vs 10 505 en GPQA; 12 032 vs 12 574 en AIME26).

## Requisitos de hardware

- VRAM estimada: el buscador externo indica aproximadamente 636 GB a Q4_K_M para el modelo base, cifra no confirmada en la model card para esta variante MXFP4. El repo ocupa 577,9 GB en safetensors.
- GPU recomendadas: AMD Instinct MI350/MI355 (gfx950). El ejemplo oficial usa 4× MI355X con `--tensor-parallel-size 4`.
- No cabe en GPU de consumo (RTX 4090, etc.) por el tamaño del checkpoint y la necesidad de hardware AMD específico.
- Opciones de despliegue: vLLM sobre ROCm 10.0 (HIP runtime 7.15.26333), PyTorch 2.13.0+rocm10.0.0, Transformers 5.20.2, imagen `vllm/vllm-openai-rocm:nightly-rocm100-...`. También se referencia SGLang cookbook.
- Flags relevantes: `--monokernel` (solo MI350X/MI355X, TP=4), `--kv-cache-dtype fp8`, `--max-model-len 262144`, `--max-num-batched-tokens 8192`, `--gpu-memory-utilization 0.85`, `--reasoning-parser mistral`, `--speculative-config '{"method": "dspark", "num_speculative_tokens": 3}'`.
- Tokenizador: `mistral-common[image]>=1.13.0` (Tekken v15).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| `amd/Mistral-Large-4-1T-A52B-Quark-MXFP4` | 1T | 52B | 262 144 (config. vLLM) | no disponible | AMD MI350/MI355 |
| `mistralai/Mistral-Large-4-1T-A52B` (base) | 1T | 52B | no disponible | no disponible | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar esta variante con su modelo base, sobre el que se observa una recuperación de rendimiento de entre el 98,9 % y el 100 % en los benchmarks evaluados. No se dispone de datos de otros modelos comparables de 1T de parámetros en la información disponible.

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés (`en`); el rendimiento en castellano u otros idiomas no está evaluado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base `mistralai/Mistral-Large-4-1T-A52B` antes de producción.
- Hardware restringido: `--monokernel` solo funciona en MI350X/MI355X (gfx950, 256 CUs) con TP=4; no es portable a otras GPU sin reconfigurar el despliegue.
- Dependencia de versiones concretas: ROCm 10.0, PyTorch 2.13.0+rocm10.0.0, Transformers 5.20.2, `mistral-common>=1.13.0` y una imagen nightly de vLLM; la madurez de estas versiones puede afectar a la estabilidad.
- Riesgo de alucinación: no cuantificado en la model card; como todo modelo generativo de gran escala, requiere verificación en dominios críticos.
- La cuantización MXFP4 solo afecta a expertos enrutados; el resto de capas mantiene precisión original, lo que limita la reducción total de memoria respecto a una cuantización completa.
- En SciCode-Verified, el modelo MXFP4 alcanzó 7 pasos que superaron el límite de tiempo de evaluación (1 800 s por entorno) frente a 4 del base, lo que puede indicar cierta variabilidad en latencia bajo cargas de razonamiento prolongado.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Mistral-Large-4-1T-A52B-Quark-MXFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Documentación de AMD Quark: https://quark.docs.amd.com/latest/index.html
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/mistralai/Mistral-Large-4-1T-A52B
- Cookbook de SGLang: https://docs.sglang.io/cookbook/
- Referencia externa (VRAM y despliegue): https://llmconfigurator.com/en/models/mistral-large-4/mistral-large-4-1t-a52b
