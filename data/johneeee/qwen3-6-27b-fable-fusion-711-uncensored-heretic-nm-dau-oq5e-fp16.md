# Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e-fp16

## Resumen

El modelo `Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e-fp16` es una cuantizacion mixta de 5 bits en formato MLX del modelo base `DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP`, un fine-tune de 27.000 millones de parametros sobre la arquitectura Qwen3.6 (tipo `qwen3_5`). El trabajo original de DavidAU combina un multi-stage fine-tune y merge de varios modelos, y es notable por ser el primer modelo open source de su clase en superar la barrera de 700 puntos en el benchmark ARC-C, tanto en cuantizacion de 8 bits como de 4 bits.

La version publicada por Johneeee aplica la herramienta oQ (oMLX v0.5.4.dev1) con cuantizacion de 5 bits y group size 64, optimizada para ejecucion en hardware Apple Silicon mediante la libreria MLX. El repositorio ocupa 19.2 GB y los safetensors cuantizados contienen 5.212.596.224 parametros (pesos cuantizados). La model card del autor incluye notas polemicas sobre la destilacion de datos de modelos propietarios, un aspecto a considerar antes de su adopcion en entornos corporativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (tipo `qwen3_5`), transformer con atencion por capas |
| Parametros totales | 27.000 millones (modelo base); safetensors cuantizados: 5.212.596.224 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ 5-bit, group size 64, mixed precision (fp16 y 5-bit) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base indica apache-2.0 en algunos repositorios) |
| Formato de pesos | MLX safetensors (oQ) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.6-27B, una arquitectura transformer con atencion por capas y soporte para razonamiento multi-etapa. David aplico un proceso de entrenamiento en varias fases (multi-stage fine-tune) combinado con un merge de multiples modelos, incluyendo tecnicas de "abliteration" para eliminar los filtros de seguridad estandar. La cuantizacion de Johneeee se realizo con la libreria oMLX, que implementa cuantizacion de precision mixta: capas criticas se mantienen en fp16 y el resto se cuantizan a 5 bits con group size 64. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplico RLHF o DPO; la model card menciona un efecto de "destilacion" de modelos frontier (Qwen, OpenAI, Anthropic) pero sin especificar metodologia.

## Capacidades

- Generacion de texto y razonamiento complejo: segun la model card, obtiene un 88.0% en MMLU y un 70.0% en MMLU_PRO.
- Generacion de codigo: 89.6% en HumanEval.
- Razonamiento cientifico y logico: el modelo base supera el umbral de 700 en ARC-C (0.711 en 8-bit, 0.701 en 4-bit), siendo el primer modelo open source de 27B en lograrlo.
- Capacidad de "thinking mode" heredada de Qwen3.6: el modelo puede alternar entre respuestas rapidas y razonamiento profundo multi-paso.
- Etiquetado como "uncensored": el fine-tune incluye ablacion de filtros de seguridad, permitiendo generar contenido que los modelos estandar rechazarian.
- Sin soporte de vision ni audio: el modelo es exclusivamente texto.

## Casos de uso

- **Razonamiento cientifico y matematico**: el rendimiento en ARC-C (0.711) y MMLU (88.0%) permite su uso en sistemas de analisis de datos complejos, demostracion de teoremas o resolucion de problemas de logica en entornos de investigacion.
- **Generacion de codigo en produccion**: con un 89.6% en HumanEval, puede integrarse en pipelines de CI/CD para autocompletado de codigo, generacion de tests unitarios o refactorizacion automatizada, siempre que se ejecute en un servidor con suficiente memoria.
- **Prototipado rapido en Apple Silicon**: al ser un modelo MLX de 5 bits, puede ejecutarse en Mac con chip M1/M2/M3 (16-32 GB de RAM unificada) para experimentos de NLP sin necesidad de GPU NVIDIA.
- **Investigacion sobre destilacion de modelos**: el modelo es un caso de estudio sobre como los fine-tunes pueden aproximar el comportamiento de modelos frontier mediante destilacion de outputs, aunque esto plantea cuestiones legales.
- **Analisis de contenido sin filtros**: para tareas de moderacion o analisis de textos sensibles donde los filtros de seguridad de los modelos convencionales interfieren con la tarea.
- **Benchmarking y evaluacion**: su rendimiento en MMLU, HumanEval y ARC-C lo convierte en un candidato para evaluar la degradacion de precision en cuantizaciones de 5 bits frente a 8 bits o 4 bits.

## Benchmarks y rendimiento

Los datos que se muestran a continuacion provienen de la model card del autor y de la busqueda web sobre el modelo base. No se han realizado evaluaciones independientes de esta cuantizacion especifica de 5 bits.

| Benchmark | Resultado (modelo base, 8-bit) | Resultado (modelo base, 4-bit) |
|---|---|---|
| MMLU | 88.0% | no disponible |
| MMLU_PRO | 70.0% | no disponible |
| HumanEval | 89.6% | no disponible |
| ARC-C | 0.711 | 0.701 |

Nota: estos datos se refieren al modelo base de DavidAU, no a esta cuantizacion de 5 bits de Johneeee. No se han publicado resultados especificos de la version oQ5e.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 19.2 GB; para inferencia con MLX se necesitan al menos 20-24 GB de memoria unificada (RAM + VRAM) en Apple Silicon. En GPU NVIDIA no se puede ejecutar directamente, ya que el formato MLX es especifico de Apple.
- **Hardware recomendado**: Mac con Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3 Max) con 32 GB o mas de RAM unificada. Para cuantizacion de 4 bits (no esta version) se podria bajar a 16 GB, pero esta version de 5 bits requiere mas.
- **Opciones de despliegue**: exclusivamente con la libreria MLX (mlx-lm, oMLX). No compatible con vLLM, llama.cpp, Ollama o TGI en su forma actual.
- **Latencia y throughput**: no se ha publicado datos de latencia para esta cuantizacion. En Apple M2 Max se puede esperar una velocidad de 20-30 tokens/seg para modelos de 27B en 5 bits, pero no es un dato verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | MMLU | HumanEval | ARC-C |
|---|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion (este) | 27B | no disponible | Apache 2.0 (indicado) | 88.0% | 89.6% | 0.711 (8-bit) |
| Qwen3-27B (base original) | 27B | 128K | Apache 2.0 | ~82-85% | ~75-80% | no disponible |
| Llama 3.3-27B | 27B | 128K | Llama 3.3 | ~88% | ~88% | no disponible |

La comparativa es aproximada, ya que los datos de Llama y Qwen base provienen de fuentes publicas y pueden variar. El modelo Fable Fusion destaca por su rendimiento en ARC-C, pero carece de datos oficiales de contexto y de una licencia claramente verificable en esta cuantizacion.

## Limitaciones y advertencias

- **Licencia no confirmada**: aunque el modelo base indica apache-2.0 en algunos repositorios, la model card de esta cuantizacion no declara licencia. Verificar antes de uso comercial.
- **Contenido sin filtros**: el modelo se etiqueta como "uncensored" y "heretic", lo que implica que puede generar contenido inapropiado, ofensivo o peligroso sin los filtros de seguridad estandar. No es apto para aplicaciones orientadas al publico general sin un sistema de moderacion adicional.
- **Riesgo de alucinacion**: como todo LLM, puede inventar hechos. El autor admite que el modelo no es "mas conocedor" que su base, solo mas compatible con flujos de trabajo de modelos frontier.
- **Notas legales del autor**: la model card contiene declaraciones sobre la destilacion de datos de modelos de OpenAI, Anthropic y Google, y defiende su legitimidad. Esto plantea riesgos legales potenciales para el uso en produccion corporativa.
- **Solo Apple Silicon**: el formato MLX limita el despliegue a hardware Apple, no es portable a GPUs NVIDIA o AMD sin conversion previa.
- **Contexto no documentado**: no se ha publicado la longitud de contexto del modelo, lo que impide planificar casos de uso con ventanas largas.
- **Sesgos no evaluados**: no se ha publicado ninguna evaluacion de sesgos o toxicidad. Dado el fine-tune "uncensored", es probable que presente sesgos amplificados.

## Enlaces

- [Modelo en HuggingFace (Johneeee)](https://huggingface.co/Johneeee/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-oQ5e-fp16)
- [Modelo base (DavidAU)](https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP)
- [Version GGUF del modelo base](https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF)
- [Repositorio oQ (oMLX)](https://github.com/jundot/omlx)
- [Articulo en HackerNoon: "Qwen3.6-27B Fable Fusion Breaks the 700 ARC-C Barrier"](https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier)
- [Video de YouTube sobre el modelo](https://www.youtube.com/watch?v=9EM5I7dJN4Q)
- [Ficha en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-neo-max-mtp-gguf-davidau)
