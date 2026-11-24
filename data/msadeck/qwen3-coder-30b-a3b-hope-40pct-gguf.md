# MSadeck/Qwen3-Coder-30B-A3B-HOPE-40pct-GGUF

## Resumen

Qwen3-Coder-30B-A3B-HOPE-40pct-GGUF es una variante comprimida del modelo de código Qwen3-Coder-30B-A3B-Instruct de Alibaba Qwen, publicada por el usuario MSadeck. Sobre la arquitectura original `Qwen3MoeForCausalLM` de 48 capas y 128 expertos enrutados por capa, se aplica una poda estructural del 40% de los expertos mediante el método HOPE (Higher-Order Pruning of Experts) de AWS Labs, descrito en el preprint arXiv:2609.18916. El resultado conserva 77 expertos por capa y reduce el total de parámetros de aproximadamente 30,5B a unos 18,7B, manteniendo 8 expertos activos por token (unos 3,3B de parámetros activos).

El modelo se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M (10,75 GiB), pensado para ejecutarse en máquinas con 16 GB de RAM sin GPU, integrándose con asistentes de código como Cline a través de un servidor `llama-server` compatible con la API de OpenAI. La poda se calibró con prompts de ingeniería de software multilingüe, de modo que la selección de expertos retenidos está orientada a tareas de programación.

Su relevancia radica en que permite desplegar un modelo MoE de código de gama media-alta en hardware de consumo muy limitado, a costa de una pérdida de capacidad que el autor no cuantifica con benchmarks. Es un artefacto experimental (0 descargas, 0 likes en el momento de la consulta) y no una versión oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3MoeForCausalLM (transformer MoE, 48 capas) |
| Parametros totales | ~18,7B (18.975.995.904 según safetensors del repo) |
| Parametros activos | ~3,3B por token (top_k = 8) |
| Longitud de contexto | No disponible en la model card; la configuración recomendada usa 12.288 tokens |
| Tipos de cuantizacion | Q4_K_M GGUF (única publicada, 10,75 GiB) |
| Idiomas soportados | No disponible (el calibrado de poda usó prompts de software multilingües) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); el modelo base en BF16 no se incluye en este repo |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer de mezcla de expertos con 48 capas, 128 expertos enrutados por capa y 8 expertos activos por token, vocabulario BPE de 151.936 tokens. Este repositorio no entrena el modelo desde cero ni hace fine-tuning: aplica una poda estructural de expertos capa por capa mediante una implementación en streaming de HOPE (Higher-Order Pruning of Experts, awslabs/HOPE, arXiv:2609.18916). El proceso consta de tres pasos: calibración con prompts de ingeniería de software multilingüe para capturar la co-activación de segundo orden de los expertos y las estadísticas de norma de salida; resolución de un programa cuadrático binario por capa con ratio de poda 0,40 para seleccionar 77 expertos óptimos; y poda física recortando los pesos de la puerta del router y reindexando los expertos retenidos, preservando las capas de atención y los embeddings.

No se especifican en la información disponible el número de tokens de calibración, la composición exacta del dataset de calibración ni si hubo etapas posteriores de RLHF o DPO (el modelo base Qwen3-Coder sí las incorpora, pero no se documentan aquí). La innovación técnica destacable es la poda de expertos guiada por objetivos de segundo orden en lugar de por magnitud de pesos, junto con la conversión y cuantización a Q4_K_M mediante llama.cpp.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del modelo base Qwen3-Coder.
- Razonamiento y resolución de problemas de programación, con capacidad de explicar y refactorizar código.
- Conversación multi-turno (tag `conversational` en el repo).
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible`), lo que permite usarlo con clientes que hablan el protocolo de OpenAI.
- Integración con asistentes de código agénticos como Cline en VS Code.
- Tool calling / function calling: no confirmado explícitamente en la model card para esta variante podada; el modelo base lo soporta, pero la poda puede degradar esta capacidad y no se documenta su preservación.
- Capacidades multilingües: no disponibles como lista cerrada; el calibrado de poda usó prompts de software multilingües.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente de código local en portátiles sin GPU: con 10,75 GiB en Q4_K_M y 16 GB de RAM, se puede ejecutar `llama-server` en CPU y conectarlo a Cline para autocompletado, generación de funciones y explicación de código sin enviar el código a la nube.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para equipos que no pueden enviar código propietario a APIs externas.
- Refactorización y revisión de código en el editor: la ventana de 12.288 tokens configurada permite incluir varios ficheros y el historial de conversación en una misma sesión.
- Generación de tests unitarios y documentación técnica a partir de fragmentos de código, aprovechando la calibración orientada a ingeniería de software.
- Prototipado rápido en estaciones de trabajo modestas: sirve para validar flujos agénticos de código antes de migrar a un modelo mayor en GPU.
- Servicio interno de bajo coste: desplegado con `llama-server` en un servidor CPU, puede atender a varios desarrolladores mediante la API compatible con OpenAI.
- Educación y experimentación: permite estudiar el efecto de la poda de expertos en un MoE real sin necesidad de hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base; solo se documenta la reducción de parámetros (de ~30,5B a ~18,7B) y el tamaño del fichero cuantizado.

## Requisitos de hardware

- VRAM/RAM estimada: 10,75 GiB para los pesos en Q4_K_M; con contexto de 12.288 tokens y caché KV en q8_0, el autor indica un uso total de unos 14,5 GB de RAM.
- Hardware objetivo declarado: máquina con 16 GB de RAM y CPU únicamente, sin GPU.
- GPU: no se documentan requisitos de GPU; el modelo está pensado para CPU. En GPU, los 10,75 GiB caben en tarjetas con 12 GB o más (por ejemplo RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100, H100), aunque no se han publicado mediciones.
- Despliegue: llama.cpp (`llama-server`) es la vía documentada; la compatibilidad con vLLM, TGI u Ollama no se menciona en la información disponible.
- Configuración recomendada por el autor: `--ctx-size 12288`, `--cache-type-k q8_0`, `--cache-type-v q8_0`, `--flash-attn`, `--threads 6`, `--threads-batch 12`, `--temp 0.6`, `--top-p 0.95`, `--min-p 0.01`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos/token | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (HOPE-40pct Q4_K_M) | ~18,7B | ~3,3B | 12.288 recomendado (no confirmado el máximo) | GGUF Q4_K_M | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-Coder-30B-A3B-Instruct (base) | ~30,5B | ~3,3B | No disponible en esta ficha | BF16 safetensors (~61,1 GB) | Apache 2.0 | Hugging Face, oficial de Qwen |
| Alternativas de código de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación principal es con su modelo base: misma arquitectura y mismos expertos activos por token, pero un 40% menos de expertos totales y un tamaño cuantizado unas 5,7 veces menor. No se dispone de datos de rendimiento que permitan cuantificar la pérdida de calidad frente al base.

## Limitaciones y advertencias

- La poda del 40% de expertos puede degradar capacidades del modelo base, especialmente en tareas fuera del dominio de calibración (código); no hay benchmarks que lo cuantifiquen.
- El calibrado se hizo con prompts de ingeniería de software, por lo que el rendimiento en otros dominios (redacción general, matemáticas, razonamiento no técnico) es incierto.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documenta mitigación específica.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Idiomas: no se publica una lista de idiomas soportados; el soporte multilingüe no está garantizado tras la poda.
- Tool calling y comportamiento agéntico: no confirmados para esta variante podada; conviene validarlos antes de usarla en producción.
- Artefacto experimental de un autor individual (MSadeck), con 0 descargas y 0 likes en el momento de la consulta; no es una publicación oficial de Qwen.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar que el modelo base Qwen3-Coder no imponga condiciones adicionales.
- El contexto máximo real del modelo no se documenta; 12.288 tokens es solo la configuración recomendada para 16 GB de RAM, no necesariamente el límite del modelo.
- El repositorio solo contiene pesos GGUF Q4_K_M; no hay versiones en otros formatos ni safetensors completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MSadeck/Qwen3-Coder-30B-A3B-HOPE-40pct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio HOPE (AWS Labs): https://github.com/awslabs/HOPE
- Paper HOPE: arXiv:2609.18916 (Higher-Order Pruning of Experts in Mixture-of-Experts Language Models)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Cline: https://cline.bot
