# jsuheb/HeresyAgent-8B

## Resumen

HeresyAgent-8B es un modelo de lenguaje de aproximadamente 8.000 millones de parámetros publicado por el usuario jsuheb en Hugging Face. No se trata de un entrenamiento desde cero, sino de un merge de modelos construido con las herramientas mergekit y lazymergekit, que combina pesos de cuatro modelos base de la familia Qwen3-8B: miromind-ai/MiroThinker-v1.0-8B, nvidia/Orchestrator-8B (Nemotron-Orchestrator-8B), rl-research/DR-Tulu-8B y csalab/Qwen3-8B. La etiqueta "moe" y "frankenmoe" sugiere que la fusión emplea una estrategia de tipo frankenmerge orientada a mezclar expertos o capas de los modelos origen.

El modelo resulta relevante para la comunidad porque agrupa en un único checkpoint características especializadas de sus componentes: razonamiento profundo y búsqueda (MiroThinker), orquestación de agentes y tool calling (Orchestrator), y entrenamiento con refuerzo para tareas de investigación (DR-Tulu), todo sobre la base multilingüe de Qwen3-8B. Es, por tanto, un experimento de fusión orientado a cargas de trabajo agénticas y de razonamiento multi-paso en un tamaño manejable para hardware de consumo.

La información pública es muy limitada: el repositorio está restringido (gated) y no se han publicado fichas técnicas, resultados de benchmarks ni detalles del método de merge. La licencia declarada es Apache 2.0 y el modelo se distribuye en formato de pesos de Hugging Face, presumiblemente safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 con fusión estilo frankenmerge/MoE (mergekit, lazymergekit); detalles no disponibles |
| Parametros totales | ~8B (derivado de la nomenclatura; no confirmado en ficha oficial) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los modelos base Qwen3-8B soportan hasta 32K de forma nativa y 128K con YaRN; no confirmado para este merge) |
| Tipos de cuantizacion | no disponible (al ser pesos estándar, admite cuantización a GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | no disponible (heredados presumiblemente de Qwen3-8B, multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estándar de Hugging Face; no confirmado explícitamente) |

## Arquitectura y entrenamiento

HeresyAgent-8B no se entrena con un pipeline propio, sino que se genera mediante fusión de pesos (model merging) con mergekit y lazymergekit. Las etiquetas indican una estrategia "frankenmoe", que normalmente consiste en combinar capas o bloques de distintos modelos para construir una arquitectura híbrida con comportamiento similar a un mixture-of-experts, donde diferentes segmentos del modelo aportan especializaciones distintas. Los cuatro modelos origen comparten la base Qwen3-8B, lo que hace viable la fusión al tener espacios de parámetros compatibles.

Los componentes aportan perfiles diferenciados: MiroThinker-v1.0-8B está orientado a razonamiento profundo con búsqueda; Nemotron-Orchestrator-8B se centra en orquestación de agentes y uso de herramientas; DR-Tulu-8B proviene de investigación con aprendizaje por refuerzo para tareas de búsqueda y razonamiento; y csalab/Qwen3-8B actúa como base generalista. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO específicas para este merge. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia estrategia de fusión.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredado de los componentes MiroThinker y DR-Tulu.
- Soporte de tool calling y function calling, presumiblemente reforzado por Nemotron-Orchestrator-8B.
- Capacidades agénticas y de orquestación para flujos con múltiples herramientas.
- Razonamiento orientado a búsqueda e investigación (search-augmented reasoning).
- Capacidades multilingües heredadas de Qwen3-8B (no verificadas en este merge).
- Generación de código y matemáticas a nivel de un modelo de 8B de la familia Qwen3 (no verificado).
- Modo "thinking" o razonamiento extendido: no confirmado para este checkpoint.

## Casos de uso

- Orquestación de agentes: el modelo puede actuar como planificador central que decide qué herramienta invocar en cada paso, aprovechando el componente Orchestrator para encadenar llamadas a APIs y funciones.
- Asistentes de investigación con búsqueda: integrado en pipelines RAG o de búsqueda web, puede razonar sobre resultados recuperados y sintetizar respuestas, apoyándose en el perfil de DR-Tulu y MiroThinker.
- Automatización de tareas multi-paso en entornos de desarrollo: con tool calling, puede conectarse a terminales, repositorios o servicios de CI/CD para ejecutar y verificar acciones de forma secuencial.
- Generación y revisión de código en producción: al heredar la base Qwen3-8B, es adecuado para autocompletado, refactorización y revisión en IDE o pipelines, con la ventaja de un tamaño desplegable en una sola GPU.
- Chat de atención al cliente con contexto medio: útil para conversaciones multi-turno donde se requiere razonamiento y llamadas a sistemas internos (consultas de pedidos, estado de cuentas) mediante function calling.
- Prototipado de agentes autónomos en investigación: sirve como banco de pruebas para evaluar estrategias de fusión de modelos especializados en razonamiento y orquestación sin incurrir en costes de entrenamiento.
- Despliegue en local para experimentación: al ser un modelo de 8B, puede ejecutarse en GPUs de consumo con cuantización, lo que facilita pruebas de flujos agénticos en estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 16 GB de pesos, más overhead de KV cache; se recomienda al menos 20-24 GB.
- VRAM en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en producción con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y tarjetas con 12-16 GB usando cuantización de 4-8 bits.
- Opciones de despliegue: vLLM y TGI para serving de alto throughput; llama.cpp y Ollama para ejecución local cuantizada; transformers para prototipado.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del backend, aunque un 8B denso típico rinde decenas de tokens por segundo en una RTX 4090 en FP16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HeresyAgent-8B | ~8B | no disponible | Apache 2.0 | Gated en HF | Merge frankenmoe de cuatro modelos Qwen3-8B |
| Qwen3-8B (csalab) | 8B | 32K nativo / 128K YaRN | Apache 2.0 | Público | Base generalista, sin especialización agéntica |
| MiroThinker-v1.0-8B | 8B | no disponible | no disponible | Público | Especializado en razonamiento con búsqueda |
| Nemotron-Orchestrator-8B | 8B | no disponible | no disponible | Público | Orientado a orquestación de agentes y tool calling |
| DR-Tulu-8B | 8B | no disponible | no disponible | Público | Entrenado con RL para investigación y búsqueda |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real del merge es desconocido y puede degradarse respecto a los modelos origen.
- Las fusiones frankenmoe pueden producir comportamientos inconsistentes, con capas que no cooperan bien entre sí.
- Riesgo de alucinación inherente a los modelos de 8B, agravado por la mezcla de pesos sin validación documentada.
- El repositorio está restringido (gated): es necesario aceptar condiciones en Hugging Face para acceder a los pesos, lo que puede limitar su uso automatizado.
- No hay información sobre sesgos, idiomas efectivamente soportados ni evaluación de seguridad.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los modelos base (algunos pueden tener condiciones adicionales) antes de un uso comercial.
- La fecha de creación (diciembre de 2025) y la ausencia de descargas sugieren un modelo experimental sin validación por la comunidad.

## Enlaces

- [Hugging Face: jsuheb/HeresyAgent-8B](https://huggingface.co/jsuheb/HeresyAgent-8B)
- [Árbol de archivos del repositorio](https://huggingface.co/jsuheb/HeresyAgent-8B/tree/main)
- [miromind-ai/MiroThinker-v1.0-8B](https://huggingface.co/miromind-ai/MiroThinker-v1.0-8B)
- [nvidia/Orchestrator-8B (Nemotron-Orchestrator-8B)](https://huggingface.co/nvidia/Orchestrator-8B)
- [rl-research/DR-Tulu-8B](https://huggingface.co/rl-research/DR-Tulu-8B)
- [csalab/Qwen3-8B](https://huggingface.co/csalab/Qwen3-8B)
- [mergekit (arcee-ai)](https://github.com/arcee-ai/mergekit)
