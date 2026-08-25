# Lego-X/qwen3_5_35b_a3b_base_cc_200k_rl

## Resumen

Lego-RL-Qwen3.5-35B-A3B es un modelo de lenguaje especializado en la resolución de issues de repositorios de software, desarrollado por el equipo LegoX. Se construye sobre el modelo base Qwen/Qwen3.5-35B-A3B, un MoE de 35B parámetros totales y 3B activos, y se entrena mediante aprendizaje por refuerzo online (GSPO) dentro del harness de Claude Code sin modificar. El entrenamiento usa 2.699 issues reales de repositorios, con la suite de pruebas de cada issue como señal de recompensa binaria, a una longitud de contexto de 200K tokens y 200 turnos por episodio.

El modelo destaca por su mejora en SWE-bench Verified: pasa de 62.4 (punto de partida) a 68.2 (+5.8) en el harness de Claude Code, sin usar reward model, similaridad con parches de referencia ni reescritura del harness. La relevancia actual radica en que demuestra que el harness de ejecución es parte del entorno de entrenamiento y que optimizar bajo un harness específico produce ganancias reales en tareas de codificación agéntica. Se libera bajo licencia Apache-2.0 y está orientado a su uso como política de agente, no como modelo de chat.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con gated delta networks, 256 expertos, 8 activos |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B (8 de 256 expertos) |
| Longitud de contexto | 200K tokens (entrenamiento), 256K tokens (máximo en vLLM) |
| Tipos de cuantizacion | No especificados en la documentación; se sirve en bfloat16 |
| Idiomas soportados | Ingles (modelo base Qwen3.5 multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3.5-35B-A3B: un transformer de mezcla de expertos (MoE) con 256 expertos y 8 activos por token, con gated delta networks. El entrenamiento de Lego-RL se realiza con el algoritmo GSPO (sequence-level surrogate policy optimization), usando ventaja relativa de grupo sobre 8 rollouts por tarea. Cada episodio consiste en que el agente resuelve un issue real en un repositorio dentro de un sandbox fresco, y la suite de pruebas del propio issue produce la recompensa binaria {0, 1}. No se usan reward models, similaridad de parches ni LLM judges.

El entrenamiento se ejecuta a 200K de contexto y 200 turnos, con un lote de 64 prompts × 8 respuestas = 512 trial/step, 3 épocas (126 pasos), y un lr constante de 1e-6. El backend usa FSDP con Ulysses SP=8 y R3 rollout routing replay, con asincronía completa (staleness 1). El dataset de entrenamiento, Lego-X/Lego-RL-2699, está disjunto de SWE-bench Verified a nivel de repositorio y de instancia. El checkpoint liberado corresponde al paso global 110.

## Capacidades

- Resolución de issues de repositorios Python: el modelo puede editar archivos, ejecutar comandos de shell y aplicar parches para resolver problemas reales en un entorno de sandbox.
- Soporte de tool calling: entrenado con el parser `qwen3_coder`, permite integración con herramientas como Claude Code, OpenHands SDK y OpenCode.
- Razonamiento multi-paso y agéntico: el modelo aprende a desplegar largas trayectorias de hasta 200 turnos, con planificación y ejecución de acciones.
- Generación de código: hereda las capacidades del base Qwen3.5 para generación de código y razonamiento matemático, aunque el fine-tune se centra en tareas de edición de código.
- Multilingüismo limitado: la model card indica idioma `en`, aunque el base Qwen3.5 soporta más idiomas.
- No se especifican capacidades de visión o audio en este checkpoint, aunque el base es multimodal; el fine-tuning se orienta a texto.

## Casos de uso

- Resolución automatizada de bugs en repositorios Python: el modelo puede recibir un issue con descripción y test suite, explorar el código, modificar archivos y verificar la corrección con las pruebas.
- Agente de codificación en CI/CD: integrado en pipelines de integración continua para proponer parches automáticos cuando fallan los tests.
- Asistente de desarrollo en línea de comandos: mediante el harness de Claude Code, el modelo actúa como un programador autónomo que ejecuta comandos, edita archivos y ejecuta pruebas.
- Análisis de código legacy: puede localizar la causa raíz de errores en proyectos grandes (hasta 200K tokens de contexto) y sugerir modificaciones.
- Generación de parches para repositorios open-source: el modelo puede producir parches candidatos para issues reportados en proyectos públicos, reduciendo el tiempo de triaje.
- Evaluación de robustez de agentes: al ser un checkpoint entrenado con RL, sirve como referencia para medir el impacto de diferentes harnesses en el rendimiento de agentes de codificación.

## Benchmarks y rendimiento

Según la model card, el modelo fue evaluado en SWE-bench Verified con un protocolo compartido: temperatura 0.7, 200 turnos, 200K contexto. Los resultados se presentan en la siguiente tabla, comparando con el punto de partida y otros modelos de la misma familia.

| Modelo | OpenHands SDK | Claude Code | OpenCode |
| :--- | ---: | ---: | ---: |
| Qwen3.5-35B-A3B (punto de partida) | 64.0 | 62.4 | 57.2 |
| Qwen3.6-35B-A3B (siguiente base) | 67.4 | 63.4 | 60.6 |
| KAT-Coder-V2.5-Dev (post-train de Qwen3.6) | 67.0 | 66.8 | 64.8 |
| **Lego-RL-Qwen3.5-35B-A3B** | **70.4** | **68.2** | **66.6** |

Nota: el checkpoint de este repositorio es el run de Claude Code (68.2). No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Para inferencia con vLLM, se recomienda `--tensor-parallel-size 4`, lo que implica al menos 4 GPUs con 80 GB de VRAM (A100/H100) para el modelo en bfloat16.
- Con cuantización a 4 bits (por ejemplo, AWQ o GPTQ) se podría reducir la VRAM a ~20 GB, permitiendo ejecución en una sola GPU de 24 GB (RTX 3090/4090), aunque no se documenta oficialmente.
- Se recomienda usar vLLM con `--enable-expert-parallel` para optimizar el MoE.
- El despliegue puede hacerse con vLLM, llama.cpp (si se convierten a GGUF), o a través de Ollama si se genera un GGUF.
- Latencia y throughput no están especificados en la documentación.

## Comparativa con modelos similares

La siguiente tabla compara el modelo con alternativas de la misma familia (mismos parámetros o misma tarea). Los datos provienen de la model card del autor.

| Modelo | Parametros | Contexto | SWE-bench Verified (Claude Code) | Licencia |
| --- | --- | --- | --- | --- |
| Qwen3.5-35B-A3B (base) | 35.95B (3B activos) | 256K | 62.4 | Apache-2.0 |
| Qwen3.6-35B-A3B (next-gen base) | 35.95B (3B activos) | 256K | 63.4 | Apache-2.0 |
| KAT-Coder-V2.5-Dev (post-train de Qwen3.6) | 35.95B (3B activos) | 256K | 66.8 | Apache-2.0 |
| **Lego-RL-Qwen3.5-35B-A3B (este)** | 35.95B (3B activos) | 200K (entrenamiento) | **68.2** | Apache-2.0 |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el harness de Claude Code. Los runs para OpenHands SDK y OpenCode son checkpoints separados; usar este checkpoint con otro harness degrada el rendimiento (por ejemplo, en OpenCode baja a 66.6).
- Requiere presupuesto de 200 turnos y 200K contexto; presupuestos cortos truncarán sus trayectorias y perderán la mayor parte de la ganancia.
- El dominio de entrenamiento se limita a repositorios Python y issues del estilo SWE-bench/OpenSWE. No se garantiza generalización a otros lenguajes o tipos de tareas.
- La recompensa binaria de test suites puede inducir a que el modelo sobreajuste a los tests de entrenamiento, aunque el conjunto es disjunto de SWE-bench Verified.
- No se recomienda su uso como modelo de chat o generación de texto general; es una política de agente de codificación.
- El comportamiento de seguridad, multilingüismo y conocimiento general provienen del modelo base, pero no se han evaluado en este contexto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Lego-X/qwen3_5_35b_a3b_base_cc_200k_rl)
- [Paper](https://arxiv.org/abs/2608.17393)
- [Código del proyecto](https://github.com/LegoX/Lego-RL)
- [Documentación](https://lego-rl.pages.dev)
- [Colección de modelos](https://huggingface.co/collections/Lego-X/lego-rl)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Lego-X/Lego-RL-2699)
- [Base del modelo](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
