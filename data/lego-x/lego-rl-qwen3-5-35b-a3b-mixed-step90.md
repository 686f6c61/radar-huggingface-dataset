# Lego-X/Lego-RL-Qwen3.5-35B-A3B-Mixed-step90

## Resumen

Lego-RL-Qwen3.5-35B-A3B-Mixed-step90 es un checkpoint de ajuste fino mediante aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por Lego-X. Se trata de la exportación a Hugging Face del paso global 90 de un experimento de RL con múltiples arneses de agente (OpenHands SDK, Claude Code y OpenCode), orientado a tareas de programación a nivel de repositorio. El modelo conserva la arquitectura Mixture-of-Experts (MoE) del base, con 35.951.822.704 parámetros totales y pesos en BF16.

El interés de este checkpoint radica en su metodología de entrenamiento: no es una media de parámetros ni una suma de modelos especialistas, sino un modelo entrenado conjuntamente con tres arneses de agente distintos, lo que busca generalizar el comportamiento agéntico de codificación más allá de una única interfaz de herramientas. El entrenamiento emplea GSPO como estimador de ventaja y pérdida de política, con backend de actualización VeOmni y backend de rollout vLLM, una tasa de aprendizaje de 1e-6 y un contexto de entrenamiento de 160.000 tokens con límite de respuesta de 130.000.

El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines propios. Es relevante para equipos que necesitan un modelo de codificación agéntica con ventana de contexto muy amplia y que quieran evaluar políticas entrenadas con RL multi-arnés, si bien el autor advierte que no se incluye una ejecución de aceptación de inferencia ni de benchmarks en esta subida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3_5MoeForConditionalGeneration), multimodal image-text-to-text |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | 160.000 tokens de entrenamiento (límite de respuesta 130.000); capacidad posicional de la configuración no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, dos shards) + índice de pesos, tokenizer, processor, generation config y chat template |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-35B-A3B, un transformer con mezcla de expertos (MoE) y capacidad multimodal image-text-to-text, según la clase `Qwen3_5MoeForConditionalGeneration` referenciada en la model card. Los pesos se exportan en BF16 en dos shards de safetensors, junto con el índice de pesos, la configuración, el tokenizer, la configuración del processor, la configuración de generación y la plantilla de chat, preservados byte a byte del checkpoint original. Un `checkpoint_manifest.json` registra tamaños y hashes SHA-256 de esos ficheros.

El entrenamiento es un experimento de RL denominado `mixed-harness-q35-35b-4n-h20-20260905` (experimento `mixed-20260905-093027`), correspondiente al checkpoint `global_step_90/actor/huggingface`. Se usa GSPO como pérdida de política y estimador de ventaja basado en GRPO, con VeOmni como backend de actualización de política y vLLM como backend de rollout. La tasa de aprendizaje es 1e-6 y el mini-batch de actualización de política es de 64. El contexto de entrenamiento es de 160.000 tokens con un límite de respuesta de 130.000. El ajuste se realiza conjuntamente con tres arneses de agente (OpenHands SDK, Claude Code y OpenCode) para tareas de codificación a nivel de repositorio; no se incluyen el estado del optimizador ni del entrenador.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados del modelo base Qwen3.5-35B-A3B.
- Codificación agéntica a nivel de repositorio: el modelo fue entrenado específicamente para resolver tareas de código mediante arneses de agente.
- Soporte de múltiples interfaces de herramientas: entrenado con OpenHands SDK, Claude Code y OpenCode, lo que implica familiaridad con distintos formatos de tool calling y flujos de agente.
- Razonamiento multi-paso y ejecución de tareas con presupuesto amplio: contexto de entrenamiento de 160.000 tokens y respuestas de hasta 130.000 tokens.
- Capacidad multimodal image-text-to-text, según la arquitectura y el pipeline declarado del modelo base.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir el contexto del repositorio (hasta 160.000 tokens) y ejecutar pasos de edición, búsqueda y test mediante un arnés de agente como OpenHands, lo que encaja con su entrenamiento específico en tareas de código a nivel de repositorio.
- Integración en Claude Code u OpenCode como política subyacente: al haber sido entrenado con esos arneses, es adecuado para flujos de trabajo agénticos en terminal donde el modelo debe emitir llamadas a herramientas de edición y ejecución de comandos.
- Refactorización de código en producción: con respuestas de hasta 130.000 tokens, puede generar parches extensos y multi-fichero en pipelines de CI/CD, aunque requiere validación humana y tests automáticos por el riesgo de alucinación.
- Generación de tests y corrección de fallos: el modelo puede analizar trazas de error y código fuente en una ventana amplia y proponer correcciones verificables mediante ejecución de la suite de tests en el arnés.
- Asistente de revisión de código en pull requests: puede procesar diffs grandes y contexto del repositorio para señalar problemas de corrección, estilo o seguridad, integrándose en herramientas de revisión automatizada.
- Evaluación comparativa de arneses de agente: al ser un checkpoint multi-arnés, sirve para estudiar cómo varía el rendimiento de una misma política según la interfaz de herramientas, el presupuesto de tareas y la configuración de servicio.
- Investigación en RL para agentes: útil como punto de partida o referencia para experimentos de GSPO/GRPO con backend VeOmni y rollout vLLM en tareas de codificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que esta subida no incluye una nueva ejecución de aceptación de inferencia ni de benchmarks, y que la evaluación depende del arnés, la interfaz de herramientas, el presupuesto de tareas y la configuración de servicio.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 y 35.951.822.704 parámetros, se requieren aproximadamente 72 GB solo para pesos, más memoria para KV cache y activaciones; el repo ocupa 71,9 GB.
- Cuantización: no se han publicado tipos de cuantización para este checkpoint; sería necesario generarlos a partir de los pesos BF16 (por ejemplo, GGUF o AWQ) para reducir requisitos.
- GPU recomendadas: para BF16 en un solo nodo, GPU de 80 GB como A100 80GB o H100 80GB, probablemente con tensor parallelism para acomodar KV cache en contextos largos; en consumer GPU no cabe en BF16 con una sola RTX 4090 (24 GB).
- Consumer GPU: solo viable tras cuantización agresiva (no publicada) y con contexto reducido; no hay datos de viabilidad en la información disponible.
- Opciones de despliegue: transformers (se registra Transformers 5.4.0) y vLLM, que soporta la clase `Qwen3_5MoeForConditionalGeneration`; otros motores como llama.cpp, Ollama o TGI no están confirmados para esta arquitectura.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lego-RL-Qwen3.5-35B-A3B-Mixed-step90 | 35.951.822.704 | 160.000 de entrenamiento | Apache 2.0 | Hugging Face, transformers/vLLM | Checkpoint RL multi-arnés, sin benchmarks publicados |
| Qwen/Qwen3.5-35B-A3B (base) | 35.951.822.704 | no disponible | no disponible | Hugging Face | Modelo base sin el ajuste RL; referencia directa |
| Alternativas de codificación agéntica de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- No se han publicado benchmarks ni una ejecución de aceptación de inferencia para este checkpoint; el rendimiento real debe validarse en el arnés y la configuración de servicio concretos.
- El autor advierte que la evaluación depende del arnés, la interfaz de herramientas, el presupuesto de tareas y la configuración de servicio, por lo que los resultados no son directamente transferibles entre entornos.
- El límite de contexto de entrenamiento (160.000 tokens) no debe confundirse con la capacidad posicional registrada en la configuración del modelo.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en generación de código y parches; se recomienda validación mediante tests y revisión humana en producción.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingüe uniforme.
- Requiere versiones de Transformers o vLLM compatibles con `Qwen3_5MoeForConditionalGeneration`; versiones antiguas pueden no cargar el modelo.
- Es necesario preservar el tokenizer, la plantilla de chat y la configuración de RoPE suministrados; alterarlos puede degradar el comportamiento entrenado.
- Licencia Apache 2.0: permite uso comercial, pero se deben cumplir las obligaciones de atribución y aviso de la licencia.
- No se incluyen el estado del optimizador ni del entrenador, por lo que no es directamente reanudable para continuar el entrenamiento sin reconstruir ese estado.

## Enlaces

- Hugging Face: https://huggingface.co/Lego-X/Lego-RL-Qwen3.5-35B-A3B-Mixed-step90
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Dashboard de entrenamiento: https://rl-dashboard-mixed.legox.net/
- Código fuente de Lego-RL: https://github.com/LegoX/Lego-RL
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
