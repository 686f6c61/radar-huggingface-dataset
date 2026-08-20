# ceselder/olens-rl-grpo-trajectory-qwen36-27b

## Resumen

`olens-rl-grpo-trajectory-qwen36-27b` es un adaptador LoRA de interpretabilidad desarrollado por el usuario ceselder, que forma parte del proyecto *oracle lens* (olens). El adaptador se entrena mediante GRPO sobre el modelo base `Qwen/Qwen3.6-27B` y tiene la función de inyectar la activación cruda del estado residual de la capa 42 en un token marcador (U+3289, id 158983) dentro de un prompt de chat de cuatro viñetas, para que el modelo emita cuatro bullets que describen lo que está a punto de generar. Es decir, actúa como una sonda interpretable que traduce la representación interna de una capa concreta en texto legible.

El problema que resuelve es el de la interpretabilidad mecanicista aplicada a modelos de lenguaje de gran tamaño: permite observar y verbalizar qué información codifica una activación concreta del modelo en un paso de generación. Su relevancia radica en que combina entrenamiento por refuerzo (GRPO) con una recompensa basada en la varianza explicada fraccional (FVE) de la activación inyectada, un enfoque poco habitual y novedoso para alinear la descripción textual con la representación interna. El repositorio contiene la trayectoria completa de 39 checkpoints de entrenamiento (pasos 10 a 390), lo que permite estudiar la evolución de la sonda durante el aprendizaje.

Es un proyecto de investigación, no un modelo de generación de propósito general, y está pensado para desarrolladores e investigadores que trabajan en interpretabilidad, alineación y análisis mecanicista de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre base Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA es de bajo rango; el modelo base tiene 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 junto al base) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT LoRA, subcarpetas `step_000K0/`) |

## Arquitectura y entrenamiento

El adaptador es una LoRA que se aplica sobre el modelo base `Qwen/Qwen3.6-27B`, un transformer decoder-only de 27B parámetros. La innovación principal es el *oracle lens*: durante la generación, se inyecta la activación cruda del estado residual de la capa 42 en un token marcador (U+3281, id 158983) dentro de un prompt de chat con formato FOUR_BULLET, y el modelo debe emitir cuatro viñetas que describen qué está a punto de generar. El entrenamiento se realiza con GRPO (Group Relative Policy Optimization), con una recompensa basada en la FVE (Fraction of Variance Explained) compuesta y normalizada: las cuatro viñetas emitidas se re-codifican mediante un lector autorregresivo jacobiano congelado de la capa 42, y la recompensa mide cuánto reconstruye la activación inyectada.

La política base (paso 0) es un adaptador SFT previo (`iter_0000390`), resultado de un proceso de destilación experta best-of-N. La configuración de entrenamiento incluye temperatura 1.0, 16 activaciones por 64 rollouts por paso, 400 pasos en total, y se ejecutó en 4 GPU B200 con DDP bit-synced. El learning rate es 1e-4, alto para RL (el autor indica que se planea un control a 3e-5/1e-5). La recompensa media pasó de 0.33 a ~0.50 (mejor 0.573), acercándose al límite de reconstrucción de una sola activación (~0.55), lo que sugiere que la recompensa está saturada por la información contenida en la activación individual.

## Capacidades

- Emisión de cuatro viñetas textuales que describen la información contenida en una activación específica (capa 42) del modelo base durante la generación.
- Actúa como sonda interpretativa: permite observar qué información codifica un estado residual concreto en un punto de la generación.
- Soporta la inyección de activaciones crudas en un token marcador dentro del prompt, sin modificar el modelo base.
- Funciona como adaptador PEFT, por lo que se puede cargar y descargar de forma modular sobre el base.
- Capacidad de análisis de la evolución del entrenamiento mediante los checkpoints intermedios (paso 10 a 390) y el log de recompensas (`rl4gpu_fve.jsonl`).
- No es un modelo de generación de texto general: no soporta tool calling, agentes ni razonamiento multi-paso por sí mismo, sino que actúa como instrumento de interpretación.

## Casos de uso

- Investigación en interpretabilidad mecanicista: permite estudiar qué información codifica la capa 42 de Qwen3.6-27B en distintos momentos de la generación, facilitando el mapeo de circuitos internos.
- Depuración de modelos: al describir qué va a generar el modelo antes de que lo haga, se pueden detectar desviaciones o comportamientos inesperados en la representación interna.
- Auditoría de sesgos: las viñetas pueden revelar qué atributos de la entrada (por ejemplo, género, tono, tópico) están representados en la activación, ayudando a identificar sesgos latentes.
- Entrenamiento de sondas de alineación: el adaptador puede servir para entrenar lectores de activaciones que traduzcan estados internos a texto, útil para alinear el comportamiento del modelo con intenciones humanas.
- Estudio del efecto del RL en la representación interna: la trayectoria de checkpoints permite analizar cómo cambia la información de la capa 42 conforme avanza el entrenamiento GRPO.
- Generación de explicaciones para sistemas de IA responsable: las viñetas emitidas pueden usarse como justificación textual de decisiones de generación en contextos de auditoría o cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la evaluación significativa es el *workspace-bench* downstream, no la recompensa FVE, pero no se proporcionan datos numéricos de ese benchmark.

## Requisitos de hardware

- El adaptador LoRA es de tamaño reducido (el repositorio indica 0.0 GB, aunque la carpeta de un checkpoint concreto puede ocupar algunos MB), pero requiere el modelo base Qwen3.6-27B completo.
- Para inferencia con el base en bfloat16 se necesitan aproximadamente 54-60 GB de VRAM, lo que requiere GPUs de clase A100 80GB, H100, o varias RTX 4090 (24GB) con tensor parallelism.
- Con cuantización (por ejemplo, 4-bit o 8-bit) se puede reducir la huella a unos 16-18 GB, lo que permite ejecutarlo en una RTX 4090 o RTX 3090, aunque la cuantización puede afectar a la fidelidad de las activaciones inyectadas.
- El entrenamiento descrito en la model card se realizó en 4 GPU B200 con DDP bit-synced, lo que indica que el entrenamiento es costoso y requiere hardware de gama alta.
- Para el despliegue del adaptador, se usa la librería PEFT de HuggingFace con `PeftModel`, y es compatible con `transformers` y `accelerate`. No se menciona soporte para vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. El *oracle lens* es una técnica de interpretabilidad muy específica y no se han publicado modelos comparables en la información disponible. Se podría comparar con otras sondas de interpretabilidad (por ejemplo, sondas lineales o atribución de activaciones), pero no hay datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere el modelo base `Qwen/Qwen3.6-27B` para funcionar.
- La recompensa FVE está saturada por la información de una sola activación (límite de ~0.55), por lo que la mejora en el entrenamiento no es directamente comparable con métricas de calidad de generación.
- El modelo es una herramienta de investigación, no está pensado para producción ni para tareas de generación general.
- No se dispone de información sobre sesgos del adaptador; hereda los sesgos del modelo base Qwen3.6-27B, que no están documentados en el repositorio.
- Riesgo de alucinación: las viñetas emitidas son interpretaciones de la activación, no descripciones garantizadas de la generación real; pueden contener información falsa o incompleta.
- La licencia MIT permite uso comercial y modificación, pero no hay garantía de soporte ni de mantenimiento del proyecto.
- Los idiomas soportados no están especificados; se asume que el base Qwen3.6-27B soporta múltiples idiomas, pero no se ha validado el comportamiento del adaptador en idiomas distintos del inglés.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/olens-rl-grpo-trajectory-qwen36-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (referencia del autor)
- Proyecto relacionado del autor: https://huggingface.co/ceselder/skip-lens-olens-pi0-100k-qwen36-27b
- Guía de despliegue de Qwen3.6-27B (tercera): https://dredyson.com/how-i-solved-the-qwen3-6-27b-performance-and-deployment-problems-a-complete-step-by-step-beginners-guide-to-configuration-benchmarks-troubleshooting-and-getting-maximum-throughput-on-dual-node/
- Guía de despliegue de Qwen3.6-27B (segunda): https://dredyson.com/how-i-solved-the-qwen3-6-27b-performance-and-deployment-problem-a-complete-step-by-step-beginners-guide-to-configuration-benchmarking-and-real-world-results/
