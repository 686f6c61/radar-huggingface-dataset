# IsValorum/Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF

## Resumen

Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF es una cuantización GGUF de precisión reducida del modelo Tiel-Coder-35B-A3B, un Mixture-of-Experts (MoE) orientado a programación agéntica y razonamiento, desarrollado originalmente por el usuario peculiar-ragdoll y cuantizado por IsValorum. El modelo base sigue la arquitectura Qwen3.5-MoE (etiquetada en la model card como `qwen3_5_moe` / `qwen35moe`), con 34.660.610.688 parámetros totales y una ventana de contexto que la model card no explicita numéricamente. Esta release concreta busca comprimir el backbone completo de 40 capas en aproximadamente 12,55 GB (11,69 GiB) para permitir inferencia en GPUs de consumo de 16 GB con streaming parcial a RAM del sistema.

La relevancia de esta ficha radica en su enfoque de cuantización quirúrgica: en lugar de aplicar una compresión uniforme de bajo bit, el autor preserva routers en `F32` sin comprimir y la cabeza de salida en `Q6_K`, mientras comprime los expertos MoE de forma selectiva. Según los datos publicados, el resultado se sitúa en 2,90 BPW con una perplejidad WikiText-2 de 8,2842 (±0,23432), equivalente a un tier Q4_K_M / Q4_K_L, y un 95,69 % en ARC-Challenge 0-shot. Es una opción pensada para desarrolladores que necesitan un modelo de código y agentes con huella de memoria muy reducida, sacrificando algo de fidelidad frente a la variante MiniPlus de 15,23 GB.

El modelo es multimodal (pipeline `image-text-to-text`), soporta razonamiento conversacional y está etiquetado para flujos de trabajo agénticos y SWE-bench. Se distribuye bajo licencia MIT y cubre trece idiomas, incluido el castellano. No obstante, la model card advierte explícitamente de que los resultados de perplejidad no establecen rendimiento en SWE-bench, por lo que las afirmaciones de capacidad agéntica deben validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.5-MoE, `qwen3_5_moe`), backbone de 40 capas, multimodal image-text-to-text |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible (A3B sugiere ~3 B activos, no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF APEX-I-NanoPlus a 2,90 BPW promedio; routers `gate_inp` en `F32`; cabeza de salida en `Q6_K`; expertos MoE comprimidos selectivamente; sin cabeza draft `blk.40` |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), repo de 13,2 GB, fichero principal de 12,55 GB (11,69 GiB) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts de la familia Qwen3.5-MoE con 34,66 mil millones de parámetros totales y una designación A3B que indica activación de aproximadamente 3 mil millones de parámetros por token, aunque el dato exacto de parámetros activos no se detalla en la información disponible. La arquitectura consta de 40 capas y un pipeline multimodal de imagen-texto, lo que implica un codificador visual integrado, si bien la model card no describe su estructura interna ni el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta el proceso de entrenamiento del modelo original más allá de las etiquetas de razonamiento, código agéntico y eficiencia de tokens.

La innovación principal de esta release es la cuantización APEX-I-NanoPlus, realizada con llama.cpp y herramientas de imatrix y cuantización dinámica de Unsloth. El autor elimina la cabeza de borrador MTP (`blk.40`) tras observar bajas tasas de aceptación en decodificación especulativa sobre esta arquitectura, recuperando unos 1,4 GB de almacenamiento y VRAM. La estrategia quirúrgica mantiene los routers de compuerta en `F32` sin comprimir y la cabeza de salida en `Q6_K`, mientras aplica compresión agresiva calibrada por importancia a los expertos. El resultado declarado es de 2,90 BPW con perplejidad WikiText-2 de 8,2842, frente a 7,46 del BF16 sin cuantizar, lo que supone un incremento del 11,05 %. El autor contrasta este resultado con cuantizaciones comunitarias IQ2_S genéricas, que atribuye a picos de ruido sintáctico.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con etiqueta explícita de modo razonamiento.
- Programación y código agéntico: etiquetas `coding`, `agentic-coding`, `agentic` y `swe-bench`.
- Capacidades multimodales de imagen a texto (pipeline `image-text-to-text`), con codificador visual.
- Soporte multilingüe en trece idiomas, incluidos castellano, inglés, chino, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Eficiencia de tokens declarada (`token-efficient`), orientada a reducir el consumo en flujos agénticos.
- Plantilla de chat endurecida para uso agéntico con control de esfuerzo de razonamiento (`reasoning effort`), según la model card.
- Compatibilidad con endpoints y API compatible con OpenAI mediante `llama-server`.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada, aunque la orientación agéntica y la plantilla de chat lo hacen plausible; debe verificarse.

## Casos de uso

- Asistencia de código en local con GPU de consumo: el fichero de 12,55 GB permite cargar el modelo completo en una GPU de 16 GB o hacer streaming desde RAM del sistema, habilitando autocompletado y generación de código sin depender de la nube.
- Refactorización y revisión de parches en pipelines de CI/CD: la orientación a `swe-bench` y código agéntico permite integrar el modelo en flujos que analizan diffs, proponen correcciones y validan cambios, siempre que se verifique su rendimiento real en tareas SWE.
- Agentes de desarrollo multi-paso: la plantilla de chat endurecida y el control de esfuerzo de razonamiento facilitan bucles de razonamiento y llamadas a herramientas en entornos de desarrollo local.
- Procesamiento de documentación técnica con imágenes: al ser un modelo image-text-to-text, puede extraer información de diagramas, capturas de pantalla y documentación visual junto con texto.
- Atención al cliente técnica multilingüe: los trece idiomas soportados permiten conversaciones multi-turno en castellano y otras lenguas, aunque la longitud de contexto no está documentada y limita la planificación.
- Despliegue en estaciones de trabajo con VRAM limitada: mediante `llama-server` con API compatible con OpenAI, se puede servir el modelo como backend local para herramientas de IDE o asistentes internos.
- Prototipado de investigación en entornos con recursos restringidos: la huella de 11,69 GiB permite experimentar con un MoE de 34,66 B en hardware de gama alta de consumo, a costa de un incremento de perplejidad del 11,05 % frente a BF16.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card del cuantizador, que miden perplejidad de modelado de lenguaje y una prueba de razonamiento, no rendimiento en código.

| Metrica | APEX-I-NanoPlus | APEX-I-MiniPlus V2.1 | BF16 base | IQ2_S generico |
|---|---|---|---|---|
| Tamano en disco | 12,55 GB | 15,23 GB | ~71,0 GB | ~12,2 GB |
| Huella RAM/VRAM | 11,69 GiB | 14,18 GiB | ~66,2 GiB | ~11,4 GiB |
| BPW promedio | 2,90 | 3,43 | 16,00 | 2,56 |
| Perplejidad WikiText-2 | 8,2842 ± 0,23432 | 7,5117 ± 0,20722 | ~7,46 | > 8,10 (degradado) |
| Delta PPL vs BF16 | +0,8242 (+11,05 %) | +0,0517 (+0,69 %) | 0,000 | +0,64 o superior |
| Tier de calidad | Q4_K_M / Q4_K_L | Q5_K_L, cercano a Q6_K | Referencia | Inestable |

Además, la model card declara un 95,69 % en ARC-Challenge 0-shot sobre 1.172 preguntas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni SWE-bench en la información disponible, y el propio autor advierte que la perplejidad WikiText-2 no establece rendimiento en SWE-bench.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,69 GiB para el modelo completo en APEX-I-NanoPlus; con contexto y caché KV adicionales, se recomienda planificar por encima de 12 GB.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 4080 (16 GB) para carga completa; A100 y H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: sí, en GPUs de 16 GB como RTX 4080, RTX 4070 Ti Super o RTX 4060 Ti de 16 GB, con posible streaming parcial desde RAM del sistema.
- Opciones de despliegue: llama.cpp mediante `llama-cli` y `llama-server` con API compatible con OpenAI; el formato GGUF es compatible con Ollama y otras herramientas basadas en llama.cpp. vLLM y TGI no están confirmados para este fichero GGUF en la información disponible.
- Latencia y throughput: no disponibles. La model card menciona streaming rápido desde RAM del sistema y contexto masivo en 16 GB de VRAM, pero sin cifras de tokens por segundo.
- Advertencia de la model card: se recomienda ajustar la penalización por repetición y la sintaxis de código para evitar intercambio de caracteres en generación de código.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Huella | Calidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B APEX-I-NanoPlus | 34,66 B (MoE) | no disponible | 12,55 GB / 11,69 GiB | PPL 8,2842; ARC-Challenge 95,69 % | MIT | Hugging Face (GGUF) |
| Tiel-Coder-35B-A3B APEX-I-MiniPlus V2.1 | 34,66 B (MoE) | no disponible | 15,23 GB / 14,18 GiB | PPL 7,5117; tier Q5_K_L | MIT | Hugging Face (GGUF) |
| Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus | no disponible | no disponible | ~13,0 GB | tier Q4 a 2,93 BPW | no disponible | Hugging Face (GGUF) |
| Ornith 1.5 APEX-I-NanoPlus | no disponible | no disponible | no disponible | orientado a ingeniería de software | no disponible | Hugging Face (GGUF) |

Las alternativas de la misma familia y del mismo cuantizador son las más directamente comparables; no se dispone de datos de benchmarks cruzados con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2,90 BPW incrementa la perplejidad un 11,05 % frente a BF16, con posible degradación en tareas sensibles a precisión como código y matemáticas.
- El autor advierte que los resultados de WikiText-2 no establecen rendimiento en SWE-bench; las capacidades agénticas y de código no están validadas con benchmarks en la información disponible.
- La model card incluye una advertencia específica sobre intercambio de caracteres en generación de código si no se ajustan la sintaxis y la penalización por repetición.
- No se documenta la longitud de contexto ni los parámetros activos exactos, lo que dificulta planificar cargas de trabajo con contextos largos.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO); el riesgo de alucinación no está cuantificado.
- La licencia MIT permite uso comercial, pero el modelo base y sus dependencias deben verificarse de forma independiente; la model card no detalla restricciones adicionales.
- El soporte de tool calling no está confirmado explícitamente; debe probarse antes de usarlo en producción.
- La eliminación de la cabeza MTP implica renunciar a decodificación especulativa, lo que puede reducir el throughput frente a variantes con MTP.
- Es una cuantización de terceros: la calidad depende de las decisiones del cuantizador y no del autor original del modelo.

## Enlaces

- [Hugging Face: IsValorum/Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF](https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-NanoPlus-GGUF)
- [Modelo base: peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF](https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF)
- [Tiel-Coder-35B-A3B APEX-I-MiniPlus-V2.1](https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF)
- [Qwen3.6-35B-A3B-MTP APEX-I-NanoPlus](https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-NanoPlus-GGUF)
- [Ornith 1.5 APEX-I-NanoPlus](https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-NanoPlus-GGUF)
- [Occamy-1.0 APEX-I-NanoPlus](https://huggingface.co/IsValorum/Occamy-1.0-APEX-I-NanoPlus-GGUF)
- [Soporte del autor en Ko-fi](https://ko-fi.com/isvalorum)
