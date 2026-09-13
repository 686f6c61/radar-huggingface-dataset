# nightmedia/Qwen3.5-9B-Theseus-1M-q8-mlx

## Resumen

Qwen3.5-9B-Theseus-1M-q8-mlx es un checkpoint experimental publicado por nightmedia, un laboratorio independiente con sede en Montana (EE. UU.) que trabaja exclusivamente sobre hardware Apple Silicon. Se trata de una fusión de cuatro modelos de aproximadamente 9 000 millones de parámetros: schneewolflabs/B0-9B, inclusionAI/UI-Venus-2-9B, OrionLLM/OxCoder-9B y nightmedia/Qwen3.5-9B-Holodeck-Lounge, todos ellos derivados o adaptaciones de Qwen3.5-9B. El resultado se distribuye en formato MLX con cuantización de 8 bits.

El modelo se presenta como una fusión "triple" orientada a tres ejes: automatización de interfaces (componente UI-Venus), generación de código (componente OxCoder) y razonamiento general con escritura creativa (componente Holodeck-Lounge), todo ello sobre un núcleo base B0-9B. El autor describe el proceso como una alineación vectorial en dos etapas mediante interpolación esférica numérica (NuSLERP) con mergekit, y etiqueta el resultado como compatible con multi-token prediction y decodificación especulativa. Las etiquetas del repositorio mencionan ventanas de contexto de 256k y 1M tokens, y el propio identificador del modelo incluye el sufijo "1M".

Su relevancia práctica es doble: por un lado, es un ejemplo de fusión de pesos orientada a recuperar capacidades especializadas y reinyectarlas en un modelo generalista; por otro, es un artefacto pensado para ejecución completamente local en Apple Silicon sin dependencias de nube. Conviene subrayar que se trata de un modelo experimental, con cero descargas y cero "likes" en el momento de redactar esta ficha, sin documentación de entrenamiento y sin evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. Fusión de modelos transformer de ~9B; la model card menciona soporte de multi-token prediction (MTP) y decodificación especulativa |
| Parametros totales | ~9B (deducido del identificador y del tamaño de los modelos base; no se declara cifra exacta) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | Etiquetado como "256k context" y "1M context"; el identificador incluye "1M". No se documenta la metodología de extensión ni la degradación esperada |
| Tipos de cuantizacion | MLX: q8, q8-hi, q6, q6-hi, qx86-hi, mxfp8, mxfp4; también se reportan resultados en bf16 |
| Idiomas soportados | Inglés (en), chino (zh), japonés (ja), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX cuantizado (el repositorio se publica como "-q8-mlx"); no se declara explícitamente safetensors ni GGUF |
| Libreria declarada | transformers |
| Pipeline declarado | image-text-to-text |
| Fecha de publicacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento. Lo que puede afirmarse a partir de la información publicada es que se trata de una fusión de pesos construida con mergekit a partir de cuatro checkpoints de ~9B: B0-9B, UI-Venus-2-9B, OxCoder-9B y Qwen3.5-9B-Holodeck-Lounge. El autor describe la técnica empleada como NuSLERP (Numerical Spherical Linear Interpolation) en dos etapas, con el objetivo declarado de "rescatar" capacidades hiperespecializadas de los modelos downstream (automatización de UI y código procedural) y reinyectarlas en un núcleo generalista. Las etiquetas del repositorio incluyen términos como SFT, LoRA, destilación (con referencias a "claude-distillation", "polaris" y "fable") y "1M context", pero no se aportan cifras de tokens de entrenamiento, composición del dataset ni detalles del pipeline de ajuste por preferencias.

Tampoco hay información verificable sobre si hubo RLHF o DPO, ni sobre la metodología concreta de extensión de contexto que justificaría la ventana de 1M tokens. La model card incluye una reseña atribuida a Gemini que describe el modelo como "un checkpoint híbrido con capacidades Vision-Language-Action y Multi-Token Prediction, optimizado para ejecución local sin dependencias de nube", pero se trata de material promocional del propio autor, no de una evaluación técnica independiente. Los únicos datos cuantitativos publicados son las tablas de "brainwaves" (métricas de precisión normalizada en tareas NLU clásicas) y de perplejidad/memoria/rendimiento por cuantización, reproducidas más abajo.

## Capacidades

- Generación de texto conversacional con ajuste por instrucciones, orientada a usos generales ("All use cases" según las etiquetas).
- Razonamiento explícito con cadena de pensamiento: las etiquetas incluyen reasoning, chain-of-thought y long-cot.
- Generación y asistencia en código: integra el componente OxCoder-9B, especializado en código procedural.
- Automatización de interfaces: integra UI-Venus-2-9B, orientado a tareas de tipo Vision-Language-Action sobre capturas de pantalla.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text, con resultado en formato de conversación.
- Matemáticas y disciplinas STEM, según las etiquetas math y stem.
- Escritura creativa y de ficción: plot generation, sub-plot generation, story generation, scene continue, roleplaying y "vivid prosing".
- Soporte multilingüe en inglés, chino, japonés y español.
- Multi-token prediction y compatibilidad con decodificación especulativa, según las etiquetas del repositorio.
- Soporte de tool calling o function calling: no disponible en la información publicada.
- Modo "thinking" explícito o audio: no disponible en la información publicada.

## Casos de uso

- Asistencia de programación en local: el componente OxCoder-9B permite usar el modelo como autocompletado y generación de código dentro de un IDE sobre un Mac, sin enviar código propietario a servicios externos. Encaja bien en equipos con requisitos estrictos de confidencialidad.
- Automatización de interfaces gráficas: gracias al componente UI-Venus-2-9B y al pipeline image-text-to-text, puede emplearse en agentes que interpretan capturas de pantalla y deciden acciones sobre formularios, paneles de administración o aplicaciones internas sin API.
- Análisis de repositorios completos: con la ventana declarada de 1M tokens, es viable cargar árboles de código extensos para responder preguntas sobre arquitectura, dependencias o impacto de un cambio, siempre que se valide empíricamente la calidad en contextos muy largos.
- Escritura de ficción de largo aliento: las etiquetas y la model card inciden en generación de tramas, subtramas, continuación de escenas y roleplay. Un uso realista es mantener una biblia narrativa de decenas de miles de tokens en contexto y generar capítulos coherentes con ella.
- Motor de agentes con estado persistente: el autor lo presenta como núcleo para arquitecturas de agente local con memoria (menciona el "Holodeck Framework" sobre PostgreSQL y Haskell). Encaja cuando se necesita un modelo que resida en la misma máquina que el orquestador y mantenga contexto entre turnos.
- Procesamiento de documentación técnica mixta (texto e imágenes): extracción de datos de capturas, diagramas o documentación escaneada combinada con texto, aprovechando el pipeline multimodal.
- Investigación en geometría de espacios latentes y fusión de modelos: dado su carácter experimental y las tablas comparativas por cuantización, sirve como caso de estudio para medir cómo afecta cada esquema de cuantización a métricas NLU concretas.
- Asistente conversacional multilingüe (en/zh/ja/es): atención y consultas en cuatro idiomas con ejecución local, adecuado para entornos donde no se permite tráfico saliente a APIs.

## Benchmarks y rendimiento

Las métricas publicadas son de dos tipos. El primero, las tablas "brainwaves", con precisión normalizada en siete tareas: ARC, ARC-Easy, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande (las abreviaturas son las publicadas por el autor). El segundo, medidas de perplejidad, memoria pico y velocidad de generación por esquema de cuantización. Todos los valores proceden de la model card; no hay evaluación independiente. El hardware sobre el que se midieron los tokens por segundo no se especifica.

Comparativa con el modelo base declarado (Qwen3.5-9B Instruct) en las tareas publicadas:

| Modelo | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Theseus (bf16) | 0,674 | 0,857 | 0,898 | 0,773 | 0,496 | 0,802 | 0,716 |
| Theseus (q8) | 0,673 | 0,859 | 0,900 | 0,772 | 0,500 | 0,803 | 0,714 |
| Theseus (mxfp8) | 0,673 | 0,858 | 0,906 | 0,771 | 0,496 | 0,804 | 0,708 |
| Theseus (mxfp4) | 0,663 | 0,851 | 0,894 | 0,767 | 0,508 | 0,803 | 0,709 |
| Qwen3.5-9B Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |

Con variante de 1M tokens de contexto:

| Modelo | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Theseus 1M (mxfp8) | 0,671 | 0,854 | 0,901 | 0,770 | 0,492 | 0,806 | 0,702 |
| Theseus 1M (q8) | 0,677 | 0,857 | 0,901 | 0,773 | 0,494 | 0,803 | 0,713 |
| Theseus 1M (qx86-hi) | 0,673 | 0,858 | 0,900 | 0,773 | 0,498 | 0,804 | 0,713 |
| Theseus 1M (q6) | 0,670 | 0,858 | 0,901 | 0,772 | 0,500 | 0,804 | 0,711 |
| Theseus 1M (mxfp4) | 0,663 | 0,851 | 0,894 | 0,767 | 0,508 | 0,803 | 0,709 |

Perplejidad, memoria pico y velocidad (valores publicados por el autor):

| Cuantizacion | Perplejidad | Memoria pico | Tokens/s |
|---|---|---|---|
| mxfp8 | 4,269 ± 0,028 | 16,02 GB | 607 |
| q8-hi | 4,148 ± 0,026 | 16,86 GB | 683 |
| mxfp4 | 4,502 ± 0,030 | 11,55 GB | 641 |
| 1M mxfp8 | 4,277 ± 0,028 | 16,01 GB | 601 |
| 1M q8-hi | 4,155 ± 0,027 | 16,85 GB | 625 |
| 1M q8 | 4,153 ± 0,026 | 16,29 GB | 632 |
| 1M qx86-hi | 4,158 ± 0,027 | 15,71 GB | 648 |
| 1M q6-hi | 4,155 ± 0,027 | 14,61 GB | 633 |
| 1M q6 | 4,160 ± 0,027 | 14,05 GB | 674 |
| 1M mxfp4 | 4,503 ± 0,030 | 11,54 GB | 627 |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni de evaluaciones generativas o de código, a pesar de que el modelo se promociona explícitamente para código y matemáticas.

## Requisitos de hardware

- Memoria: el propio autor mide 16,29 GB de memoria pico para q8 en la variante de 1M, 14,05 GB para q6 y 11,54 GB para mxfp4. Añadiendo el contexto, el tokenizador y los buffers del runtime, se recomienda un mínimo de 24 GB de memoria unificada para q8 y de 16 GB para mxfp4.
- Plataforma: el repositorio se distribuye en formato MLX, lo que en la práctica limita la ejecución nativa a Apple Silicon (series M). El laboratorio autor declara trabajar sobre un MacBook Pro de 128 GB.
- GPU de clase servidor (A100, H100, RTX 4090): no disponible. No se publican pesos GGUF ni instrucciones de despliegue para CUDA, por lo que no puede confirmarse su funcionamiento en esas plataformas sin convertir los pesos.
- Viabilidad en GPU de consumo: no confirmada para NVIDIA. En Apple Silicon, un equipo con 32 GB o más de memoria unificada es el escenario realista para la variante q8.
- Opciones de despliegue: MLX (mlx-lm) es la vía natural dada la extensión del repositorio. La librería declarada es transformers, por lo que la carga es posible en entornos compatibles, aunque el formato cuantizado es MLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: entre 601 y 683 tokens/s en las mediciones del autor para las cuantizaciones de 8 bits, y entre 627 y 674 tokens/s para q6 y mxfp4. El hardware de medida no se especifica, por lo que estos valores no son extrapolables a otros equipos.

## Comparativa con modelos similares

No se dispone de datos independientes de modelos comparables de terceros. La comparación más rigurosa posible es contra los propios componentes de la fusión y el modelo base, usando las cifras que publica el autor:

| Modelo | Parametros | Contexto | arc / arc-e / boolq | Licencia | Formato publicado |
|---|---|---|---|---|---|
| Theseus 1M (q8) | ~9B | 1M (declarado) | 0,677 / 0,857 / 0,901 | Apache 2.0 | MLX cuantizado |
| Qwen3.5-9B-B0-Holodeck-Lounge-Venus | ~9B | No disponible | 0,670 / 0,854 / 0,905 (mxfp8) | No disponible | No disponible |
| Qwen3.5-9B-Holodeck-Lounge | ~9B | No disponible | 0,656 / 0,831 / 0,896 (q8-hi) | No disponible | No disponible |
| OrionLLM/OxCoder-9B | ~9B | No disponible | 0,568 / 0,720 / 0,895 (mxfp8) | No disponible | No disponible |
| Qwen3.5-9B Instruct (base) | ~9B | No disponible | 0,571 / 0,719 / 0,895 (mxfp8) | No disponible | No disponible |

Los datos sugieren que la fusión mejora de forma apreciable las métricas de razonamiento clásico respecto al modelo base y respecto a OxCoder-9B aislado, pero la comparación procede íntegramente del autor y no ha sido replicada. Frente a alternativas de terceros de tamaño similar (por ejemplo, otros modelos de 7-9B de la familia Qwen, Llama o Mistral), no hay datos disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal. No hay evaluación independiente, ni informe de entrenamiento, ni proceso de alineación documentado.
- Ausencia de tracción verificable: cero descargas y cero "likes" en el momento de redactar la ficha. No hay evidencia de uso en producción por terceros.
- Riesgo de alucinación: no se publica ningún dato de calibración, tasas de error factual ni evaluaciones de fidelidad. Los benchmarks presentados son de comprensión de lenguaje clásica, no de generación veraz.
- Métricas limitadas: las tareas "brainwaves" (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, Winogrande) no cubren código, matemáticas, multilingüismo real ni generación de ficción, precisamente las capacidades que se promocionan.
- Contexto declarado sin verificación: las etiquetas indican 256k y 1M tokens, pero no se documenta cómo se logró esa ventana ni si la calidad se mantiene a longitudes extremas. Las diferencias entre las tablas "sin 1M" y "1M" son mínimas, pero no prueban calidad en contexto largo, ya que las tareas usadas son de contexto corto.
- Idiomas: solo se declaran en, zh, ja y es. No hay datos de calidad por idioma ni advertencias sobre sesgos culturales o lingüísticos.
- Licencia: el repositorio se publica bajo Apache 2.0, pero es una fusión de cuatro modelos cuyas licencias individuales no se detallan en la información disponible. Antes de un uso comercial conviene verificar los términos de schneewolflabs/B0-9B, inclusionAI/UI-Venus-2-9B, OrionLLM/OxCoder-9B y nightmedia/Qwen3.5-9B-Holodeck-Lounge.
- Portabilidad: los pesos están en formato MLX cuantizado. Ejecutarlo en CUDA, ROCm o CPU requiere conversión, sin garantía de que el resultado sea equivalente.
- Ruido promocional: la model card incluye reseñas generadas por otros modelos y referencias culturales, sin separar claramente las afirmaciones verificables de las marketing. Las expresiones como "VLA" o "soberanía local" no van acompañadas de especificaciones técnicas.
- Estabilidad de la fusión: los merges de pesos pueden degradar capacidades no medidas (seguridad, seguimiento de instrucciones, coherencia en turnos largos) sin que ello se refleje en las métricas publicadas.
- Búsqueda web: los resultados recuperados durante la elaboración de esta ficha no guardan relación con el modelo (contenido enciclopédico sobre Taiwán), por lo que no aportan información adicional ni enlaces relevantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Qwen3.5-9B-Theseus-1M-q8-mlx
- Modelo base 1: https://huggingface.co/schneewolflabs/B0-9B
- Modelo base 2: https://huggingface.co/inclusionAI/UI-Venus-2-9B
- Modelo base 3: https://huggingface.co/OrionLLM/OxCoder-9B
- Modelo base 4: https://huggingface.co/nightmedia/Qwen3.5-9B-Holodeck-Lounge
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
- Demos: no disponible en la información proporcionada.
- Resultados de búsqueda web: no relevantes para este modelo.
