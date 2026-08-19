# eniairaph07/qwen3.8-27b-fable5-rl-sft-steps

## Resumen

El repositorio `eniairaph07/qwen3.8-27b-fable5-rl-sft-steps` contiene checkpoints de un adaptador LoRA (rank 64) entrenado sobre el modelo base **Qwen/Qwen3.8-27B** mediante **Group Relative Policy Optimization (GRPO)**, una técnica de aprendizaje por refuerzo. El objetivo es mejorar el razonamiento y la toma de decisiones en tareas de terminal (terminal-bench), con un énfasis especial en la generación de comandos y la verificación de la integridad de las respuestas. El autor, eniairaph07, publica dos checkpoints (paso 5 y paso 10) junto con los logs de entrenamiento y las trazas de rollout.

El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros, de tipo vision-language, con una ventana de contexto de 262 000 tokens y licencia Apache 2.0. Está diseñado para codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. El adaptador LoRA presentado aquí busca afinar estas capacidades para entornos de línea de comandos, donde la precisión en la ejecución de comandos y la coherencia multi-paso son críticas.

Este proyecto es relevante porque explora la aplicación de GRPO con recompensas continuas (no binarias) en dominios de terminal, un área poco cubierta por los fine-tunings tradicionales. Aunque el modelo no tiene descargas ni likes en el momento de la consulta, su enfoque metodológico puede interesar a investigadores que trabajan en RL para agentes y en la optimización de modelos para tareas de automatización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27 000 millones (modelo base) + adaptador LoRA (rank 64, nº de parámetros no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (según fuentes no oficiales del modelo base) |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base admite cuantización estándar (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponibles (el modelo base soporta múltiples idiomas, pero no se indica en el repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Qwen3.8-27B, un transformer denso con atención de tiempo completo, diseñado para procesar tanto texto como imágenes. El fine-tuning se realiza mediante **LoRA** (Low-Rank Adaptation) con rango 64, lo que permite ajustar el modelo con un número reducido de parámetros adicionales.

El entrenamiento combina **SFT** (Supervised Fine-Tuning) y **RL** (GRPO). La función de recompensa está compuesta por tres componentes:
- **Estructura y razonamiento** (+0.20): premia la coherencia estructural del razonamiento generado.
- **Similitud continua de tokens de comando** (+0.50): compara los tokens de comando generados con una ruta canónica, con normalización de opciones.
- **Integridad de sumisión y puerta anti-gaming** (+0.30, o -0.50 si se detecta un intento prematuro de completar la tarea): penaliza los intentos de reclamar éxito sin evidencia suficiente.

Los checkpoints se guardan en los pasos 5 y 10 del entrenamiento RL, junto con los logs de rollout y las trazas verificadas. No se especifica el tamaño del dataset de entrenamiento ni el número total de pasos.

## Capacidades

- **Razonamiento multi-paso**: el entrenamiento GRPO se centra en tareas de terminal que requieren planificar y ejecutar secuencias de comandos.
- **Generación de comandos**: mejora la capacidad de producir comandos de shell válidos y correctos para tareas dadas.
- **Verificación de integridad**: la recompensa anti-gaming fomenta que el modelo no declare completada una tarea sin haber ejecutado realmente los pasos necesarios.
- **Hereda las capacidades del modelo base**: al ser un adaptador sobre Qwen3.8-27B, conserva las habilidades de generación de texto, razonamiento, código, matemáticas y visión del modelo original (aunque el adaptador no ha sido entrenado específicamente para estas tareas).
- **Tool calling**: el modelo base soporta tool calling y uso de funciones, aunque no se ha verificado específicamente en el adaptador.
- **Contexto largo**: la ventana de 262K tokens permite manejar historiales extensos de interacción con el terminal.

## Casos de uso

- **Automatización de tareas de administración de sistemas**: el modelo puede interpretar descripciones de tareas (p. ej., "buscar archivos modificados en las últimas 24 horas y comprimirlos") y generar la secuencia de comandos adecuada, gracias a su entrenamiento en terminal-bench.
- **Agentes de línea de comandos interactivos**: integrado en un bucle agéntico, puede recibir feedback del entorno (salida de comandos) y decidir el siguiente paso, aprovechando la ventana de contexto de 262K tokens para mantener el historial completo.
- **Asistente de desarrollo para DevOps**: ayuda a los ingenieros a construir pipelines de CI/CD generando comandos de shell, Docker, Kubernetes, etc., con validación de integridad.
- **Entrenamiento y evaluación de políticas RL**: el repositorio proporciona logs y trazas que pueden servir como referencia para investigadores que estudian GRPO con recompensas continuas.
- **Prototipado rápido de agentes de terminal**: gracias a su tamaño (27B) y a la posibilidad de cuantización, puede desplegarse en entornos de desarrollo para probar flujos de automatización antes de escalar a modelos mayores.
- **Análisis forense de comandos**: el modelo puede generar explicaciones paso a paso de secuencias de comandos, útil para auditar scripts o entender acciones realizadas en un sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este adaptador LoRA en la información disponible. Los datos de rendimiento del modelo base Qwen3.8-27B, según fuentes no oficiales, incluyen:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores corresponden al modelo base y no al adaptador entrenado con RL. No hay evidencia de que el adaptador mejore o degrade estas métricas en tareas generales; su objetivo es específicamente terminal-bench.

## Requisitos de hardware

- **VRAM estimada**: el modelo base en FP16 requiere aproximadamente 54 GB de VRAM. Con cuantización de 4 bits (GGUF Q4_K_M) se reduce a unos 16-18 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3090/4090 (24 GB) o incluso en tarjetas de 16 GB con cuantización más agresiva.
- **GPU recomendadas**: NVIDIA A100/H100 para inferencia sin cuantizar; RTX 4090, RTX 3090 o AMD Radeon RX 7900 XTX para cuantización 4-bit. También es compatible con AMD Ryzen AI Max (APU) según el anuncio de AMD.
- **Despliegue**: el adaptador LoRA puede cargarse con bibliotecas como `peft` sobre el modelo base. Para inferencia, se puede usar vLLM, llama.cpp (con conversión a GGUF), Ollama o TGI. En Jetson (NVIDIA) también hay soporte.
- **Latencia y throughput**: no disponibles para el adaptador. Para el modelo base, se estima una latencia de decodificación de ~20-40 ms/token en una A100 con FP16, y ~50-100 ms/token en una RTX 4090 con cuantización 4-bit, dependiendo de la implementación.

## Comparativa con modelos similares

El modelo base Qwen3.8-27B compite con otros modelos densos de ~27B, como Llama 3.1 8B (no comparable por tamaño) o Qwen2.5-27B (versión anterior). Dado que el adaptador es específico para terminal-bench, la comparación más relevante es con el propio modelo base y con otros fine-tunings RL para tareas de agente.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Generalista, visión-lenguaje |
| Qwen3.8-27B + adaptador Fable5 | 27B + LoRA | 262K | Apache 2.0 | Tareas de terminal (RL) |
| Qwen2.5-27B (base) | 27B | 128K | Apache 2.0 | Generalista, sin visión |

No se dispone de comparativas de rendimiento entre el adaptador y otros modelos en terminal-bench.

## Limitaciones y advertencias

- **Adaptador LoRA, no modelo completo**: el repositorio solo contiene los pesos del adaptador; es necesario cargar el modelo base Qwen3.8-27B para utilizarlo.
- **Datos de entrenamiento no especificados**: no se indica el tamaño ni la composición del dataset de terminal-bench utilizado, lo que dificulta evaluar su generalización.
- **Riesgo de sobreajuste**: el entrenamiento RL con recompensas específicas puede hacer que el modelo se especialice en exceso en las tareas de terminal, degradando su rendimiento en otras áreas.
- **Alucinaciones**: como cualquier modelo generativo, puede producir comandos incorrectos o inexistentes; la puerta anti-gaming reduce la probabilidad de declarar éxito sin evidencia, pero no la elimina por completo.
- **Sesgos del modelo base**: el modelo base puede tener sesgos lingüísticos o culturales heredados de sus datos de entrenamiento, que el adaptador no corrige.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base (también Apache 2.0).
- **Soporte de idiomas**: no se ha confirmado qué idiomas soporta el adaptador; el modelo base es multilingüe, pero el entrenamiento RL puede haberse realizado solo en inglés (común en terminal-bench).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/eniairaph07/qwen3.8-27b-fable5-rl-sft-steps
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B (asumido, no verificado)
- Blog de AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de despliegue local (swfte.com): https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Página de Jetson AI Lab para Qwen3.8-27B: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Guía completa de Qwen3.8-27B (lovableapp.org): https://lovableapp.org/blog/qwen3-8-27b
