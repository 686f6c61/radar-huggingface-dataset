# DavidAU/NVIDIA-Nemotron-3.5-Bolt-Turbo-Brilliance-50x-74B-A9B-24GB-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-Turbo-Brilliance-50x-74B-A9B-24GB-GGUF es una cuantización GGUF de tipo IQ2 QAT (quantization-aware training) del modelo base nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16, publicada por el creador independiente DavidAU. El modelo original, desarrollado por NVIDIA, es un transformer de mezcla de expertos (MoE) con 74.042.720.848 parametros totales y 9.000 millones de parametros activos por token, disenado para tareas multimodales de imagen-texto a texto en ingles, espanol, frances, aleman, italiano y japones.

La propuesta de esta publicacion es comprimir un modelo de 74B en un repositorio de 24,8 GB manteniendo, segun el autor, una precision comparable al BF16 gracias al entrenamiento con quantizacion (QAT) y a la calibracion NEO Imatrix / NEO Imatrix MAX. Sobre esa base cuantizada, DavidAU superpone un sistema propietario denominado Turbo Brilliance que anade 27 modos de razonamiento y 27 modos de instruccion conmutables en el propio prompt o por API, ademas de 15 "AI Constructs" (perfiles de comportamiento de 2000-4000 tokens cada uno) orientados a tareas como agentes, programacion o ensenanza.

Su relevancia practica es doble: por un lado demuestra que un MoE de 74B y contexto largo puede ejecutarse en una unica GPU de consumo con 24 GB de VRAM; por otro, ilustra una tendencia de la comunidad a envolver modelos base de laboratorio con capas de prompting estructurado empaquetadas dentro del propio artefacto de pesos. Conviene tratarlo como un derivado comunitario, no como una version oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), multimodal imagen-texto a texto |
| Parametros totales | 74.042.720.848 |
| Parametros activos | 9.000 millones (A9B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_S (IQ2 QAT), pesos GGUF; el repositorio tiene 24,8 GB |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (etiquetada como "other" en la model card) |
| Formato de pesos | GGUF (safetensors solo como referencia de parametros del modelo base) |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 |
| Pipeline | image-text-to-text |
| Dataset de referencia | nvidia/nemotron-pre-training-datasets, nvidia/nemotron-post-training-v3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos con 74B parametros totales y activacion dispersa de aproximadamente 9B por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. El modelo es multimodal (entrada de imagen y texto, salida de texto) y fue entrenado por NVIDIA sobre sus propios conjuntos pre y post-entrenamiento (nemotron-pre-training-datasets y nemotron-post-training-v3), con etapas de ajuste posteriores no detalladas en la informacion disponible.

La innovacion diferencial de esta publicacion no esta en el modelo base sino en la capa de cuantizacion y en el sistema Turbo Brilliance. La cuantizacion IQ2_S se apoya en quantization-aware training para minimizar la perdida de calidad a 2 bits por peso, calibrada con las matrices de importancia NEO Imatrix y NEO Imatrix MAX del autor. Sobre el modelo cuantizado se inyectan, antes de la fase de razonamiento, entre cientos y miles de tokens de instrucciones segun el modo seleccionado (27 modos de razonamiento y 27 de instruccion), junto con los 15 AI Constructs. El autor reporta 150 tokens por segundo en una RTX 5090 sin decodificacion especulativa, y menciona un decodificador especulativo propio ("LiLiCorr") alojado en su repositorio. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modos de razonamiento conmutables (desde sin razonamiento hasta "xhigh" y combinaciones de alta intensidad).
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text).
- Generacion y asistencia en codigo, reforzada por el modo Coder AI Construct.
- Comportamiento de agente y descomposicion de tareas mediante el Agent AI Construct.
- Funciones de ensenanza y explicacion pedagogica mediante el Universal Teacher AI Construct.
- Ideacion y lluvia de ideas, tanto general como de negocio, mediante los constructos Brainstorm y Brainstorm Business.
- Multilingue en ingles, espanol, frances, aleman, italiano y japones.
- Soporte de system prompts extensos inyectados dinamicamente por prompt o por API.
- Compatibilidad declarada con endpoints estandar (tag endpoints_compatible) y con flujos de vLLM.
- Capacidad conversacional multi-turno (tag conversational).
- No se documenta en la informacion disponible soporte nativo de tool calling, function calling ni audio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno en seis idiomas y alternar entre modo de respuesta directa y razonamiento segun la complejidad de la consulta, lo que permite ajustar latencia y coste por interaccion.
- Despliegue en estacion de trabajo con GPU de consumo: al ocupar 24,8 GB en IQ2, cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 5090, lo que habilita prototipado local de un MoE de 74B sin infraestructura de centro de datos.
- Asistencia a programacion en local: el Coder AI Construct y los modos de instruccion permiten generar, revisar y explicar codigo dentro de un IDE o pipeline, con la ventaja de que los pesos no salen de la maquina.
- Analisis de documentos con imagenes: al aceptar entrada imagen-texto, sirve para extraer y razonar sobre capturas, diagramas o formularios escaneados combinados con texto.
- Generacion de material didactico: el Universal Teacher AI Construct esta disenado para explicar conceptos con progresion pedagogica, util en plataformas de formacion tecnica.
- Ideacion de producto y negocio: los constructos Brainstorm permiten sesiones estructuradas de generacion de ideas con un marco de comportamiento predefinido, sin necesidad de escribir prompts largos cada vez.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores pueden medir la degradacion real de un MoE de 74B a 2 bits QAT frente al BF16 original usando los mismos benchmarks del modelo base.

## Benchmarks y rendimiento

La model card incluye una imagen de "accuracy" que compara la cuantizacion QAT de 2 bits con BF16, pero no se proporcionan en la informacion disponible los valores numericos de MMLU, HumanEval, GSM8K ni de otros benchmarks. El autor afirma que los resultados de Turbo Brilliance seran iguales o mejores que los publicados por NVIDIA para el modelo base, pero no aporta cifras. El unico dato de rendimiento concreto es la velocidad de 150 tokens por segundo en una RTX 5090 sin decodificacion especulativa.

| Benchmark | Resultado | Nota |
|---|---|---|
| MMLU | no disponible | no se publican cifras |
| HumanEval | no disponible | no se publican cifras |
| GSM8K | no disponible | no se publican cifras |
| Throughput | 150 t/s | RTX 5090, sin decodificacion especulativa |

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 24,8 GB, por lo que la inferencia completa requiere al menos 24 GB de VRAM con margen minimo para cache KV; con contexto largo el consumo crece y puede superar esos 24 GB.
- GPU de consumo compatibles: RTX 4090 (24 GB) y RTX 5090 (32 GB); en la primera el margen para contexto es muy ajustado.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S son adecuadas y dejan espacio para contextos amplios y mayor paralelismo.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio) para GGUF; vLLM esta mencionado por el autor para la conmutacion de modos por API, aunque la compatibilidad de vLLM con este GGUF concreto no esta verificada en la informacion disponible.
- Throughput reportado: 150 tokens por segundo en RTX 5090 sin decodificacion especulativa; con el decodificador "LiLiCorr" del mismo autor no se aportan cifras.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-Turbo-Brilliance-50x (esta ficha) | 74B | 9B | no disponible | openmdw-1.1 | GGUF IQ2 QAT | Capa Turbo Brilliance y 15 constructos |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16 | 74B | 9B | no disponible | openmdw-1.1 | safetensors BF16 | Modelo base oficial, sin capas adicionales, requiere ~148 GB en BF16 |
| Otros MoE cuantizados de la comunidad DavidAU (familia Turbo Brilliance) | variable | variable | no disponible | variable | GGUF | Mismo sistema de modos aplicado a otras familias (Qwen, Gemma, Mistral, GLM, Llama) segun el autor |
| Modelos densos de ~70B en 4 bits | ~70B | denso | no disponible | variable | GGUF | Mayor coste por token al no tener activacion dispersa; no se dispone de comparacion de rendimiento |

## Limitaciones y advertencias

- Es un derivado comunitario no oficial: NVIDIA no avala ni mantiene esta cuantizacion ni la capa Turbo Brilliance.
- La cuantizacion a 2 bits, incluso con QAT, implica perdida de fidelidad respecto al BF16; no se publican metricas numericas que cuantifiquen esa degradacion.
- Los 27 modos de razonamiento y los 15 AI Constructs son mecanismos de prompting empaquetados, no capacidades entrenadas; su eficacia depende de la implementacion del autor y no ha sido validada de forma independiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en dominios especializados y en contextos muy largos.
- La longitud de contexto no se documenta, lo que dificulta planificar despliegues con ventanas extensas.
- El soporte multilingue declarado se limita a seis idiomas; el rendimiento fuera de ellos no esta caracterizado.
- La licencia openmdw-1.1 debe revisarse antes de uso comercial; la model card la etiqueta como "other", lo que anade ambiguedad.
- El margen de VRAM en GPUs de 24 GB es minimo; contextos largos o lotes mayores pueden provocar desbordamiento a memoria del sistema y caidas severas de rendimiento.
- No hay evidencia publicada de soporte robusto de tool calling o function calling en esta variante.
- El modelo base depende de pesos en BF16 para validacion; comparar resultados contra el original exige infraestructura muy superior a la de consumo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/NVIDIA-Nemotron-3.5-Bolt-Turbo-Brilliance-50x-74B-A9B-24GB-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de pre-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Paper referenciado (arXiv 2605.07182): https://arxiv.org/abs/2605.07182
- Paper referenciado (arXiv 2601.20088): https://arxiv.org/abs/2601.20088
- Paper referenciado (arXiv 2502.02631): https://arxiv.org/abs/2502.02631
- Paper referenciado (arXiv 2502.05003): https://arxiv.org/abs/2502.05003
