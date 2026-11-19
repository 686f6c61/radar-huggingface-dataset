# mazuj2/Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF

## Resumen

Qwen3.8-27B-Qwopus-Swift-ThinkingCap es una cuantización GGUF con matriz de importancia (imatrix) calibrada para código del modelo RiderJones/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5, publicado por el usuario mazuj2. Se trata de un merge de tres fine-tunes sobre una base Qwen3.8-27B, combinados mediante la técnica dare_ties con densidades y pesos distintos para cada componente, orientado a generación de código de alta precisión, razonamiento estructurado y ejecución de proyectos complejos en una sola pasada.

El modelo resuelve un problema concreto: las variantes estándar de Qwen3.8-27B tienden a entrar en bucles de `<think>`, a derivar en la lógica de coordenadas a mitad de generación y a dejar código multi-sistema sin terminar, además de perder la cabeza nativa de decodificación especulativa MTP cuando se fusionan de forma ingenua. Este merge preserva los 15 tensores MTP (`blk.64.nextn.*`) dentro del GGUF, lo que permite decodificación especulativa sin modelo draft separado en llama.cpp.

El resultado es un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones) con licencia Apache 2.0, distribuido únicamente en inglés y en formato GGUF con cuantizaciones desde IQ3_S hasta Q8_0. La relevancia actual radica en que combina rendimiento de código de nivel frontier con velocidad de inferencia en hardware de consumo (40-60 t/s a Q8_0 en generación de código según el autor), algo poco habitual en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8-27B, con cabeza MTP (Multi-Token Prediction) preservada |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ3_S, Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con imatrix calibrada para codigo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de Qwen3.8-27B, sobre el que se aplica un merge de tres modelos mediante `mergekit` con el método `dare_ties`. Los tres componentes son: Jackrong/Qwopus3.8-27B-Coder-Flash (densidad 0,75, peso 0,60), que aporta la planificación arquitectónica y la estética de front-end; ukisai/Swift-1.5-Qwen3.8-27b (densidad 0,45, peso 0,25), destilado con RL para eliminar bucles de autocorrección y estabilizar la ejecución; y bottlecapai/ThinkingCap-Qwen3.8-27B (densidad 0,35, peso 0,15), que actúa como regularizador para evitar espirales de razonamiento excesivas.

La innovación técnica principal es la preservación de los 15 tensores nativos de Multi-Token Prediction (`blk.64.nextn.*` / MTP) dentro del GGUF, lo que habilita decodificación especulativa en llama.cpp sin necesidad de un modelo draft independiente. Las cuantizaciones se generaron con una imatrix filtrada por dominio y calibrada sobre 419 chunks (n_ctx=512) de razonamiento de código en formato ChatML, trazas de uso de herramientas y prompts técnicos, con una perplejidad de calibración BF16 de 3,4195 ± 0,02407. No se detalla el número de tokens de entrenamiento de los modelos originales ni la composición completa de sus datasets.

## Capacidades

- Generación de código en una sola pasada para aplicaciones y juegos complejos (el autor cita Choplifter con física de inercia, barracones destructibles, máquinas de estado de rescate y terreno con parallax; Space Invaders; utilidades multi-herramienta).
- Razonamiento estructurado con modo `<think>` de planificación top-down, que consume un 20-30 % más de tokens de pensamiento que fine-tunes podados pero evita la autocorrección repetitiva.
- Generación de interfaces HTML/CSS/JS con proporciones y estética limpias sin necesidad de prompt engineering adicional.
- Decodificación especulativa nativa mediante MTP en llama.cpp.
- Razonamiento matemático y espacial aplicado a física 2D y sistemas de coordenadas.
- Capacidad de tool calling y trazas de uso de herramientas (la imatrix se calibró sobre este tipo de datos).
- Soporte multilingüe limitado: solo inglés declarado.
- No se documentan capacidades de visión, audio ni agentes multi-paso autónomos.

## Casos de uso

- Generación de videojuegos completos en un solo archivo: el modelo puede producir prototipos jugables con física, colisiones y máquinas de estado en una única generación, lo que lo hace adecuado para game jams y validación rápida de ideas.
- Desarrollo de front-end de producción: genera HTML/CSS/JS con estética cuidada sin instrucciones adicionales, útil para prototipado de interfaces y componentes de UI.
- Asistentes de código integrados en IDE: con decodificación especulativa MTP a 40-60 t/s en Q8_0, ofrece latencia interactiva para autocompletado y generación de funciones en local.
- Herramientas CLI y utilidades multi-componente: la capacidad de completar builds de múltiples sistemas en una pasada encaja con la generación de scripts y utilidades con varias dependencias internas.
- Razonamiento técnico con planificación explícita: el modo `<think>` estructurado sirve para tareas de diseño de arquitectura de software, análisis de casos límite y descomposición de problemas.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS (20-24 GB de VRAM) permiten ejecutar el modelo en una RTX 4090 para tareas de código sin depender de la nube.
- Pipelines de CI/CD con verificación de código: el soporte de tool calling y las trazas de uso de herramientas permiten integrarlo en flujos automatizados de revisión y generación de parches.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de velocidad de inferencia y de perplejidad de calibración:

| Metrica | Valor |
|---|---|
| Perplejidad de calibracion (BF16, imatrix) | 3,4195 ± 0,02407 |
| Throughput en generacion de codigo/HTML (Q8_0, MTP) | 40-60 t/s |
| Throughput en texto general (Q8_0, MTP) | 25-40 t/s |

No se aportan cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada según cuantización (según el autor): Q8_0 requiere 32 GB o más; Q6_K entre 24 y 32 GB; Q5_K_M unos 24 GB; Q4_K_M e IQ4_XS entre 20 y 24 GB; Q3_K_M e IQ3_S unos 16 GB.
- GPU recomendadas: A100 o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q5_K_M, Q4_K_M e IQ4_XS; GPU de 16 GB para IQ3_S y Q3_K_M.
- Cabe en GPU de consumo: sí, en RTX 4090 con Q4_K_M o IQ4_XS, y en GPU de 16 GB con IQ3_S.
- Opciones de despliegue: llama.cpp (con soporte de `draft-mtp` para decodificación especulativa); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: 40-60 t/s en generación de código/HTML y 25-40 t/s en texto general a Q8_0 con MTP, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Qwopus-Swift-ThinkingCap (este) | ~27,3 B | no disponible | Apache 2.0 | GGUF | Merge dare_ties con MTP preservado, imatrix de código |
| Jackrong/Qwopus3.8-27B-Coder-Flash | ~27 B (base Qwen3.8-27B) | no disponible | no disponible | no disponible | Componente principal del merge; orientado a código y front-end |
| ukisai/Swift-1.5-Qwen3.8-27b | ~27 B (base Qwen3.8-27B) | no disponible | no disponible | no disponible | Destilado con RL para eliminar bucles de razonamiento |
| bottlecapai/ThinkingCap-Qwen3.8-27B | ~27 B (base Qwen3.8-27B) | no disponible | no disponible | no disponible | Fine-tune para podar cadenas de pensamiento desbocadas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés de forma declarada; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser un merge de fine-tunes, puede heredar sesgos de los tres modelos componentes, no documentados por el autor.
- Riesgo de alucinación inherente a modelos de 27 B; el autor no reporta tasas de error ni evaluaciones de fidelidad.
- El modo `<think>` consume un 20-30 % más de tokens que fine-tunes podados, lo que incrementa coste y latencia en producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos componentes del merge, no detalladas en la información disponible.
- La longitud de contexto no está especificada; planificar el despliegue con margen para KV-cache es responsabilidad del operador.
- El repositorio ocupa 195,1 GB, por lo que conviene descargar solo la cuantización necesaria mediante `--include`.
- El modelo tiene muy poca tracción comunitaria (1 like, 2.568 descargas en el momento de la consulta), lo que reduce la validación independiente de sus afirmaciones.

## Enlaces

- Hugging Face: https://huggingface.co/mazuj2/Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF
- Modelo base del merge: https://huggingface.co/RiderJones/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5
- Componente 1: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Componente 2: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Componente 3: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- llama.cpp: https://github.com/ggml-org/llama.cpp
