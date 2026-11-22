# barozp/Inkling-2-Mini-MTPLX-3bit

## Resumen

Inkling-2-Mini-MTPLX-3bit es un empaquetado cuantizado a 3 bits del modelo thinkingmachines/Inkling-2-Mini, preparado por el usuario barozp para su uso con MTPLX 2.13 o superior en Apple Silicon. Se trata de un modelo multimodal image-text-to-text con arquitectura MoE de tipo looped-transformer, que incorpora la cabeza de borrador DSpark del propio modelo para decodificacion especulativa. El pack incluye tanto el tronco cuantizado en precision mixta (GPTQ, 3 bits) como la cabeza draft (`mtp.safetensors`, 0,64 GB), con un total de 25.815.417.876 parametros y 15,24 GB en disco.

La relevancia de este release radica en que reduce el tamano por debajo de los 16,0 GB del pack oficial Bare Speed de MTPLX, manteniendo las proyecciones de atencion y short-conv en 8 bits, lo que lo hace viable en Macs con 24 GB de memoria unificada. Los pesos cuantizados son los codigos GPTQ del release MLX-3bit trasladados bit a bit, sin paso de desquantizacion y recuantizacion intermedio.

El modelo base Inkling-2-Mini esta desarrollado por Thinking Machines y se distribuye bajo licencia Apache 2.0. Esta variante concreta esta pensada para decodificacion especulativa en Apple Silicon, con un rendimiento medido de 36,5 tok/s de media (1,43x frente a autoregresivo) en un M5 Pro de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con looped-transformer y vision (image-text-to-text) |
| Parametros totales | 25.815.417.876 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han probado prompts de hasta 31.543 tokens en retrieval) |
| Tipos de cuantizacion | GPTQ 3 bits de precision mixta (atencion y short-conv en 8 bits; proyecciones sink en BF16) |
| Idiomas soportados | no disponible (se han publicado pruebas en ingles y turco) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, pack MTPLX con cabeza DSpark) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura MoE con looped-transformer, es decir, bloques de transformer reutilizados en bucle, combinada con capacidades de vision para entrada image-text-to-text. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica el numero de parametros activos por token ni la configuracion exacta de expertos.

La innovacion tecnica destacable de este release es la inclusion de DSpark, una cabeza de borrador de 3 capas (`mtp.safetensors`, 0,64 GB) que propone hasta siete tokens que el modelo completo verifica en una sola pasada, preservando la distribucion original del modelo. Esta cabeza se combina con el tronco cuantizado a 3 bits mediante decodificacion especulativa en MTPLX. Los pesos cuantizados son los codigos GPTQ del release MLX-3bit, trasladados sin recuantizar; la unica diferencia es que las 32 proyecciones de atencion-sink y short-conv, que en el release MLX estan en 8 bits, aqui provienen directamente de la fuente en BF16.

## Capacidades

- Generacion de texto conversacional y explicativa, con soporte de chat template.
- Generacion de codigo en Python y JavaScript (probado en los benchmarks del autor).
- Razonamiento de tipo multiple-choice y conocimiento general (evaluado en MMLU, ARC, HellaSwag, WinoGrande).
- Capacidades de vision: pipeline image-text-to-text, aunque la informacion disponible no detalla tareas concretas.
- Recuperacion de informacion en contexto largo (needle retrieval 3/3 a 7.931 y 31.543 tokens).
- Decodificacion especulativa con la cabeza DSpark (hasta 7 tokens propuestos por ronda, verificados en una pasada).
- Soporte multilingue parcial: se han publicado pruebas en turco, aunque no se especifica la lista completa de idiomas.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso agentico en la informacion disponible.

## Casos de uso

- Generacion de codigo en local sobre Apple Silicon: con 47,6 tok/s en prompts de codigo en un M5 Pro de 24 GB, es adecuado para asistentes de programacion que se ejecutan integramente en el portatil sin conexion.
- Chat conversacional de proposito general en Macs de 24 GB: el pack cabe en memoria unificada y ofrece 34,6 tok/s en prompts explicativos, suficiente para interaccion en tiempo real.
- Procesamiento de documentos largos con recuperacion: el modelo mantiene needle retrieval 3/3 a 31.543 tokens, util para resumir o consultar contratos, informes o documentacion tecnica extensa.
- Analisis de imagenes con texto asociado: al ser image-text-to-text, puede emplearse para describir capturas, extraer informacion de diagramas o responder preguntas sobre imagenes en flujos de trabajo locales.
- Prototipado de pipelines de decodificacion especulativa: sirve como banco de pruebas para desarrolladores que quieran evaluar MTPLX y la cabeza DSpark antes de pasar a packs mayores.
- Asistencia multilingue ligera: las pruebas en turco (30,6 tok/s con DSpark) sugieren utilidad para consultas en idiomas distintos del ingles, aunque sin garantias de cobertura completa.
- Experimentacion en investigacion: la fidelidad medida (KL 0,0125 en texto crudo, 96,36% de acuerdo top-1) permite usar el modelo cuantizado como aproximacion del original en estudios que no requieran pesos completos.

## Benchmarks y rendimiento

Calidad (medida sobre el hermano MLX-3bit, mismos codigos cuantizados; lm-evaluation-harness 0.4.13, 0-shot, loglikelihood, chat template OFF):

| Tarea | Metrica | Fuente (20 GB) | Este tronco | Delta | ± stderr |
|---|---|---:|---:|---:|---:|
| mmlu (2.847 preguntas) | acc | 0,7954 | 0,7940 | -0,0014 | 0,0072 |
| arc_challenge (1.172 preguntas) | acc_norm | 0,6971 | 0,6911 | -0,0060 | 0,0135 |
| winogrande (1.267 preguntas) | acc | 0,7253 | 0,7245 | -0,0008 | 0,0126 |
| hellaswag (1.000 preguntas) | acc_norm | 0,6620 | 0,6560 | -0,0060 | 0,0150 |
| Media | | 0,7200 | 0,7164 | -0,0036 | |

Fidelidad frente a la fuente (teacher forcing, mlx-lm): divergencia KL 0,0125 en texto crudo y 0,0729 en conversaciones con chat template; acuerdo top-1 del 96,36% y 91,17%; needle retrieval 3/3 a 7.931 y 31.543 tokens.

Velocidad en Apple M5 Pro, 24 GB, macOS 27.2.1, MTPLX 2.13.0, perfil `serve`, chunks de prefill de 512 tokens, decodificacion greedy, profundidad DSpark 3, 256 tokens nuevos:

| Prompt | AR tok/s | DSpark tok/s | vs AR | Tokens por ronda de verificacion | Borradores aceptados |
|---|---:|---:|---:|---:|---:|
| Funcion Python (codigo) | 25,3 | 47,6 | 1,88x | 3,31 | 178/230 |
| Por que el cielo es azul | 25,7 | 34,6 | 1,35x | 2,37 | 148/323 |
| Pregunta en turco | 25,8 | 30,6 | 1,19x | 2,10 | 134/365 |
| Consejos de JavaScript | 25,4 | 33,2 | 1,31x | 2,31 | 145/330 |
| Media | 25,6 | 36,5 | 1,43x | 2,52 | 605/1248 (48,5%) |

Memoria pico de 17,1 GB en estos prompts y 18,1 GB con un prompt de 3.779 tokens. Carga en unos 50 s. Frente al hermano MLX-3bit en mlx-lm en el mismo Mac (38,2 tok/s, prefill 956 tok/s), la ruta de un token de MTPLX es mas lenta (25,6 tok/s), pero DSpark supera a mlx-lm en un 25% en codigo. El prefill es varias veces mas lento: 20,4 s para 3.779 tokens mas 64 nuevos, frente a unos 6 s en mlx-lm.

Aceptacion de la cabeza draft en CUDA (via ruta portable MLX de MTPLX 2.13 en A100 80 GB, greedy, profundidad 3, 200 tokens nuevos):

| Prompt | AR tok/s | D3 tok/s | vs AR | Tokens por ronda | Borradores aceptados |
|---|---:|---:|---:|---:|---:|
| Funcion Python | 3,30 | 5,11 | 1,55x | 3,03 | 134/197 |
| Por que el cielo es azul | 3,35 | 5,60 | 1,67x | 2,63 | 124/228 |
| Pregunta en turco | 3,41 | 4,76 | 1,40x | 2,12 | 105/280 |
| Consejos de JavaScript | 3,35 | 4,83 | 1,44x | 2,15 | 107/276 |
| Media | 3,35 | 5,08 | 1,51x | 2,48 | 470/981 (47,9%) |

Con los pesos fuente oficiales, la misma prueba da 2,29 tokens por ronda (441/1066 aceptados, 41,4%), lo que indica que el tronco a 3 bits mantiene la aceptacion de la cabeza draft.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 15,24 GB en disco; pico medido de 17,1 GB en prompts cortos y 18,1 GB con prompt de 3.779 tokens. Pensado para Macs de 24 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M5 Pro de 24 GB probado; el autor lo dimensiona para Macs de 24 GB). En CUDA se ha probado mediante la ruta portable MLX en A100 80 GB, con rendimiento muy inferior (3,35 tok/s AR) que no representa el rendimiento nativo en CUDA.
- Cabe en GPU de consumo: si, en Macs con 24 GB de memoria unificada. No se documenta compatibilidad con GPUs NVIDIA de consumo.
- Opciones de despliegue: MTPLX 2.13 o superior (perfil `serve` recomendado con `--prefill-chunk-tokens 512` en Macs de 24 GB). Para mlx-lm sin cabeza draft, usar el hermano MLX-3bit. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 36,5 tok/s de media con DSpark en M5 Pro (47,6 tok/s en codigo); 25,6 tok/s en autoregresivo; prefill de 956 tok/s en mlx-lm y varias veces mas lento en MTPLX (20,4 s para 3.779 tokens mas 64 nuevos). Carga del pack en unos 50 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MTPLX-3bit (este) | 25,8 B | no disponible | MTPLX + DSpark, 15,24 GB | Apache 2.0 | Decodificacion especulativa, Macs de 24 GB |
| Inkling-2-Mini-MLX-3bit (hermano) | 25,8 B | no disponible | MLX, 14,65 GB | Apache 2.0 | mlx-lm sin draft; 38,2 tok/s, prefill 956 tok/s |
| Inkling-2-Mini (fuente) | 25,8 B | no disponible | safetensors, ~20 GB | Apache 2.0 | Pesos completos; referencia de calidad |
| Pack oficial Bare Speed de MTPLX | no disponible | no disponible | MTPLX, 16,0 GB | no disponible | Punto de partida oficial de MTPLX |

No se dispone de datos de benchmarks de modelos de terceros comparables en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Cuantizacion agresiva a 3 bits: la media de benchmarks cae 0,0036 respecto a la fuente, con perdidas de hasta 0,0060 en ARC-Challenge y HellaSwag; la divergencia KL sube a 0,0729 en conversaciones con chat template.
- Prefill lento en MTPLX: 20,4 s para 3.779 tokens mas 64 nuevos, frente a unos 6 s en mlx-lm. Los prompts largos penalizan mucho en esta ruta.
- Riesgo de swap en Macs de 24 GB si se omite `--prefill-chunk-tokens 512`: el autor midio 24,5 GB de pico con prefill de una sola pasada en un prompt de 3.779 tokens, lo que provoca swapping.
- Plataforma limitada: disenado para Apple Silicon via MTPLX; en CUDA solo funciona por la ruta portable MLX con rendimiento muy bajo (3,35 tok/s AR). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Idiomas: no se publica la lista de idiomas soportados; las pruebas se limitan a ingles y turco, con menor velocidad en este ultimo (1,19x frente a AR).
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni tasas de alucinacion; el modelo base es conversacional y de conocimiento general, por lo que se aplican los riesgos habituales.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del pack cuantizado en produccion.
- Cabeza draft especifica de MTPLX: no es reutilizable en otros runtimes; para mlx-lm hay que usar el hermano MLX-3bit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/barozp/Inkling-2-Mini-MTPLX-3bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Hermano MLX-3bit: https://huggingface.co/barozp/Inkling-2-Mini-MLX-3bit
- Variante sin censura (referenciada en la model card): https://huggingface.co/barozp/Inkling-2-Mini-Uncensored-MTPLX-3bit
- Repositorio MTPLX: https://github.com/youssofal/mtplx
- PR de mlx-lm #2086 (soporte MLX, referenciado en la model card): no disponible como enlace directo en la informacion proporcionada
