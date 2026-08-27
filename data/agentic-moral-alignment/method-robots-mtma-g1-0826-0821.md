# agentic-moral-alignment/method-robots-mtma-g1-0826-0821

## Resumen

`method-robots-mtma-g1-0826-0821` es un conjunto de adaptadores LoRA desarrollado por el equipo `agentic-moral-alignment`, que se integra sobre el modelo base `Qwen/Qwen3.5-4B-Base`. El objetivo es alinear el comportamiento de un agente con principios morales deontológicos blandos en entornos simulados de robots. El entrenamiento se realiza mediante aprendizaje por refuerzo con verificación de reglas (RLVR), utilizando un método de optimización de política de grupo (GRPO) sobre una ventana de contexto de 45.056 tokens.

La relevancia de este modelo radica en su enfoque experimental: en lugar de usar RLHF clásico o DPO, se aplica un método híbrido que combina objetivos de tarea y restricciones morales en un entorno interactivo. Es un caso de estudio para la investigación en alineación de agentes, especialmente relevante para la comunidad de seguridad de IA y robótica autónoma. Los adaptadores se publican en cinco puntos de control (step_20 a step_40), lo que permite evaluar la evolución del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B-Base (Transformer) con adaptadores LoRA |
| Parametros totales | No disponible (modelo base: 4B; adaptadores: 0.6 GB) |
| Parametros activos | No disponible (solo adaptadores LoRA) |
| Longitud de contexto | 45.056 tokens (config `MAX_MODEL_LEN`) |
| Tipos de cuantizacion | No disponible (adaptadores en fp16/fp32) |
| Idiomas soportados | No disponible (probablemente ingles, no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (via PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B-Base, un transformer causal de 4 mil millones de parametros, y se le anaden adaptadores LoRA con rango 32 y alfa 64. El entrenamiento se realizo con el framework verl (FSDP) en un entorno de simulacion de robots (`GAMES: robots`), con 64 turnos maximos por episodio y 8 entornos paralelos. Se aplico un metodo de aprendizaje por refuerzo con retorno de recompensa acumulada (`RETURN_FN: reward_to_go`), normalizacion de linea base por estado (`BASELINE_FN: state_mean`), y un factor de descuento gamma de 1.0. La funcion de moral se configuro como `deon_soft`, lo que implica una restriccion deontologica suave sobre las acciones del agente.

El entrenamiento se realizo en 40 pasos con un learning rate de 1.5e-5, top-p de 0.95, y una longitud de respuesta maxima de 40.960 tokens. Se activo el modo de pensamiento (`THINKING: True`) con un maximo de 4.096 tokens por turno para razonamiento interno. Los logs por episodio estan disponibles en el dataset `mtma` en Hugging Face.

## Capacidades

- Generacion de texto y razonamiento de largo alcance con contexto de hasta 45.056 tokens.
- Razonamiento moral deontologico en entornos de simulacion de robots (decisiones con restricciones eticas).
- Soporte de multi-turno (hasta 64 turnos) con memoria de largo plazo.
- Capacidad de pensamiento interno (thinking mode) con hasta 4.096 tokens por turno.
- Adaptadores LoRA intercambiables por checkpoint (step_20 a step_40) para analisis de la evolucion del entrenamiento.
- No se ha confirmado soporte para tool calling, vision ni audio.

## Casos de uso

- Investigacion en alineacion moral de agentes: el modelo permite estudiar como un agente aprende a seguir reglas deontologicas en entornos simulados, util para laboratorios de IA segura.
- Evaluacion de metodos RLVR: los adaptadores en diferentes pasos permiten comparar la evolucion de la politica y la convergencia de la moral aprendida.
- Simulacion de robots con etica: se puede integrar en entornos de simulacion (por ejemplo, MuJoCo o ROS) para probar comportamientos seguros en tareas de navegacion o manipulacion.
- Generacion de datasets de decisiones morales: los rollouts del entrenamiento pueden usarse para crear datasets de decisiones etiquetadas para otros modelos.
- Benchmarking de metodos de alineacion: comparar este enfoque hbrido (GRPO + moral deontologica) contra otros metodos (DPO, RLHF) en tareas de agentes.
- Desarrollo de agentes con restricciones de seguridad: en aplicaciones donde el agente debe evitar acciones daninas, como en sistemas de control de acceso o gestion de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. La unica fuente de evaluacion son los logs de entrenamiento por episodio, que no incluyen metricas de rendimiento general.

## Requisitos de hardware

- VRAM estimada: para inferencia con el modelo base (4B) en fp16 se requieren ~8-10 GB de VRAM, mas el overhead de los adaptadores LoRA (0.6 GB). Con cuantizacion 4-bit se puede reducir a ~4-5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3070/4070, A10, A100). Para entrenamiento completo se necesitan GPUs con 24 GB (RTX 3090/4090, A100).
- Compatibilidad con GPU de consumo: si, con cuantizacion en 4-bit se puede ejecutar en RTX 3060 (12 GB) o incluso RTX 2060 (6 GB) con limitaciones.
- Opciones de despliegue: se puede usar con Hugging Face Transformers + PEFT, o vLLM (con advertencia de no-op). No se ha probado con llama.cpp u Ollama.
- Latencia y throughput: no disponible, dependera del hardware y la configuracion de decodificacion.

## Comparativa con modelos similares

No disponible. Este modelo es un adaptador LoRA especifico para un experimento de alineacion moral, sin comparables directos en la misma categoria. Los modelos alternativos serian otros adaptadores LoRA para Qwen3.5-4B o modelos de alineacion como Zephyr-4B o Mistral-7B-Instruct, pero no comparten el mismo objetivo ni metodologia.

## Limitaciones y advertencias

- Es un modelo experimental, no apto para produccion. Solo se ha entrenado en un entorno de robots simulado y no se ha validado en tareas reales.
- Sesgos de entrenamiento: el entorno `robots` es un dominio limitado; el modelo puede no generalizar a otros dominios.
- Riesgo de alucinacion: al ser un modelo base sin instruccion, puede generar contenido inconsistente o falso si se usa fuera de su dominio.
- Limitaciones de idioma: no se ha especificado soporte multilingue; probablemente solo ingles.
- Licencia no disponible: no se puede determinar si el uso comercial es permitido. Se recomienda contactar con el autor.
- Advertencia de vLLM: los adaptadores no funcionan con vLLM sin fusionar previamente el modelo (merge_and_unload).
- Los adaptadores no estan actualizados: el repositorio se creo en 2026 y no tiene descargas ni likes, por lo que puede ser experimental y no mantenido.

## Enlaces

- Hugging Face: https://huggingface.co/agentic-moral-alignment/method-robots-mtma-g1-0826-0821
- Dataset de logs de entrenamiento: https://huggingface.co/datasets/agentic-moral-alignment/mtma
- Paper relacionado: Hybrid Approaches for Moral Value Alignment in AI Agents: a Manifesto - https://arxiv.org/abs/2312.01818
- Blog del paper: https://liza-tennant.github.io/publication/2023-hybrid
