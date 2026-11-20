# IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

KAT-Coder-V2.5-Dev APEX-I-MiniPlus-V2.1 es una cuantización GGUF del modelo Kwaipilot/KAT-Coder-V2.5-Dev, publicada por el usuario IsValorum bajo el marco de cuantización propio denominado APEX-I. El modelo base es un Mixture-of-Experts (MoE) de aproximadamente 34.660 millones de parámetros totales, orientado a generación de texto, razonamiento y código, con licencia Apache 2.0. La versión cuantizada busca preservar la fidelidad del modelo original dentro de un envoltorio de 13-14 GB, lo que permite ejecutarlo en estaciones de trabajo con GPUs de 24 GB de VRAM.

La relevancia de esta ficha radica en que el autor aplica una cuantización "quirúrgica" tensor a tensor (con mapa de cuantización auditado desde el propio GGUF), emplea imatrix y ajusta de forma selectiva las capas y los micro-expertos para reducir la deriva del estado de recurrencia en arquitecturas MoE. Además, el autor afirma que el modelo permite ejecutar el contexto completo de 256K tokens en 24 GB de VRAM, lo que lo convierte en una opción interesante para desarrollo de software y agentes autónomos en hardware de consumo.

No obstante, conviene subrayar que la mayor parte de las afirmaciones técnicas (mejoras de perplejidad, benchmarks propios, rendimiento) provienen exclusivamente de la model card del autor y no han sido verificadas de forma independiente. El modelo base procede de Kwaipilot y la cuantización es un trabajo derivado no oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen35moe`; familia Qwen3.5 MoE). 40 capas y 256 micro-expertos según la model card |
| Parámetros totales | 34.660.610.688 (dato de safetensors del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | 256K tokens (afirmado en la model card del cuantizador; no verificado de forma independiente) |
| Tipos de cuantización | GGUF con esquema APEX-I-MiniPlus V2.1 (cuantización mixta tensor a tensor con imatrix; niveles concretos por tensor no detallados en la información disponible) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base KAT-Coder-V2.5-Dev es un transformer de tipo Mixture-of-Experts. Los tags del repositorio indican `qwen35moe`, es decir, una arquitectura de la familia Qwen3.5 MoE, con 40 capas y 256 micro-expertos según lo descrito por el cuantizador. El dato de parámetros totales (34.660 millones) procede de los safetensors del modelo original. No se dispone en la información proporcionada del número de parámetros activos por token, del número de tokens de entrenamiento, de la composición del dataset ni de si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se detalla si el modelo incorpora decodificación especulativa o atención lineal.

La innovación principal de esta release es la cuantización. El autor describe un proceso "tensor a tensor" con auditoría matemática de cada tensor de las 40 capas y los 256 micro-expertos, orientado a maximizar la precisión del razonamiento y a eliminar la deriva del estado de recurrencia. Se emplea imatrix y un mapa de cuantización auditado directamente desde el GGUF resultante. El autor también menciona la integración de MTP (multi-token prediction) "donde esté soportado" en su línea de releases, aunque no queda claro si esta variante concreta lo incorpora. Todas estas afirmaciones proceden de la model card del cuantizador y no han sido validadas de forma independiente.

## Capacidades

- Generación de texto conversacional y razonamiento, con etiqueta `reasoning` en el repositorio.
- Generación y asistencia en código, dado que el modelo base es un coder (KAT-Coder).
- Soporte de tool calling y function calling: el autor publica una plantilla de chat "endurecida" para uso agéntico, lo que sugiere soporte de flujos con herramientas.
- Razonamiento multi-paso y flujos de agente, según la orientación del modelo base y la plantilla de chat incluida.
- Capacidades multilingües en 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su despliegue como servicio.
- No se indica soporte de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistencia de programación en local: el modelo puede integrarse en editores o terminales mediante llama.cpp para autocompletado, refactorización y explicación de código, aprovechando su naturaleza de coder y su ventana de contexto larga (hasta 256K según el autor) para trabajar sobre varios archivos a la vez.
- Agentes autónomos de software: con la plantilla de chat agéntica incluida y soporte de tool calling, puede orquestar llamadas a herramientas (ejecución de tests, lectura de ficheros, comandos de shell) en bucles multi-paso para tareas de ingeniería.
- Revisión de repositorios completos: con contexto de 256K tokens, es posible cargar fragmentos amplios de un repositorio y pedir análisis de coherencia, detección de bugs o generación de documentación, siempre que el hardware lo permita.
- Despliegue en estaciones de trabajo de 24 GB: la afirmación del autor de ejecutar el contexto completo en 24 GB de VRAM lo hace adecuado para equipos con RTX 4090 o similares, sin necesidad de clústeres.
- Atención al cliente técnica multilingüe: los 13 idiomas soportados permiten construir asistentes de soporte para productos software en mercados diversos, con conversaciones multi-turno.
- Generación de código en pipelines de CI/CD: mediante endpoints compatibles (por ejemplo, con llama.cpp server o vLLM si soporta GGUF), puede automatizar la generación de parches, mensajes de commit o tests unitarios en integración continua.
- Inferencia con offload a RAM del sistema: el autor indica que el diseño es apto para inferencia total o parcial en RAM, lo que permite ejecutarlo en máquinas sin GPU dedicada potente a costa de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una sección de "Empirical Benchmarks & Fidelity Verification" y comparaciones de perplejidad WikiText-2 frente a otras cuantizaciones, pero los valores concretos para este modelo no se han proporcionado en la información disponible. El autor menciona mejoras de perplejidad en otros modelos de su línea (por ejemplo, +13,21 % frente a GSQ-RCO IQ3_S en Qwen3.8 27B), pero no se trasladan cifras específicas a esta ficha.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,9 GB; el autor enmarca la release en un "envoltorio de 13-14 GB", por lo que se necesita al menos esa cantidad de VRAM para carga completa en GPU, más overhead de contexto KV.
- GPU recomendadas: RTX 4090 (24 GB) y GPUs profesionales como A100 o H100 para mayor throughput; el autor titula una sección "The 24GB Miracle: Full 256K Context Runs In VRAM!", lo que sugiere que una GPU de 24 GB es el objetivo de referencia.
- Cabe en GPU de consumo: sí, según el autor, en GPUs de 24 GB (RTX 4090, RTX 3090). Para GPUs de 16 GB o menos sería necesario offload parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), servidores compatibles con endpoints, y potencialmente otros runners que acepten GGUF. El autor menciona explícitamente llama.cpp.
- Latencia y throughput: el autor incluye una sección de "Hardware Throughput & Offload Benchmarks (RTX 30 / 40 / 50 & RAM Streaming)", pero las cifras concretas no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev APEX-I-MiniPlus-V2.1 (esta ficha) | 34,66B (MoE) | 256K (según autor) | Apache 2.0 | GGUF | Cuantización no oficial de IsValorum |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 | ~35B (MoE, A3B) | no disponible | Apache 2.0 (presumible, no confirmado) | GGUF | Misma línea del mismo autor; orientado a razonamiento general, agentes y tool calling |
| Ornith 1.5 35B-A3B APEX-I-MiniPlus-V2.1 | ~35B (MoE, A3B) | no disponible | no disponible | GGUF | Misma línea; especializado en ingeniería de software a escala de repositorio |
| Tiel Coder 35B-A3B APEX-I-MiniPlus-V2.1 | ~35B (MoE, A3B) | no disponible | no disponible | GGUF | Misma línea; especialista en programación agéntica |

Las alternativas listadas son releases del mismo autor con el mismo esquema de cuantización, por lo que la comparación se limita a la orientación funcional declarada. No se dispone de datos de rendimiento comparativo verificables en la información proporcionada.

## Limitaciones y advertencias

- Las afirmaciones de rendimiento, fidelidad y capacidad de contexto (256K en 24 GB) proceden únicamente de la model card del cuantizador y no han sido verificadas de forma independiente.
- Al ser una cuantización, existe una pérdida inevitable de precisión respecto al modelo original; el grado exacto de degradación no está cuantificado en la información disponible.
- El autor advierte explícitamente sobre un problema de sintaxis en código y sobre el uso de repeat penalty, que puede provocar "intercambio de caracteres" en la generación de código; es una advertencia importante para producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y la cuantización deben atribuirse correctamente; conviene revisar los términos del modelo original Kwaipilot/KAT-Coder-V2.5-Dev.
- El modelo base está orientado a código y razonamiento; su comportamiento en dominios especializados (medicina, derecho) no está evaluado.
- La plantilla de chat es una modificación del cuantizador ("hardened agentic chat template"); usar la plantilla original del modelo base puede dar resultados distintos.
- El repositorio tiene un tamaño de 15,9 GB, lo que requiere espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/KAT-Coder-V2.5-Dev-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Colección APEX-I MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-standard-moe-6acfee77961c8c0cf5a083b5
- Qwen3.8 27B MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 Abliterated: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Ornith 1.5 APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Tiel Coder APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
