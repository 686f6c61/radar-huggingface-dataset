# Lego-X/Lego-RL-Qwen3.5-35B-A3B-Mixed-step90

## Resumen

Lego-RL-Qwen3.5-35B-A3B-Mixed-step90 es un checkpoint de ajuste fino por refuerzo (RL) del modelo Qwen/Qwen3.5-35B-A3B, exportado por el colectivo Lego-X. No se trata de un modelo entrenado desde cero, sino de la política resultante del paso global 90 de un experimento de RL denominado "mixed-harness", en el que se entrenó al modelo para resolver tareas de programación a nivel de repositorio a través de tres arneses de agente distintos: OpenHands SDK, Claude Code y OpenCode. El objetivo es producir una política única capaz de operar con interfaces de herramientas heterogéneas sin promediar ni sumar modelos especialistas.

El modelo hereda la arquitectura Mixture of Experts (MoE) de Qwen3.5-35B-A3B, con aproximadamente 35.950 millones de parámetros totales según los safetensors publicados. El entrenamiento utilizó el estimador de ventajas GRPO con pérdida de política GSPO, backend de actualización VeOmni y backend de rollout vLLM, con una tasa de aprendizaje de 1e-6 y un límite de contexto de entrenamiento de 160.000 tokens (respuestas limitadas a 130.000). Los pesos se exportan en BF16.

Su relevancia radica en el enfoque "harness-native": el modelo se optimiza directamente contra los formatos de llamada a herramientas y los flujos multi-paso de arneses reales de agentes de código, en lugar de contra un formato sintético único. Esto lo hace interesante para quien despliegue agentes de programación autónomos en producción y necesite una política que generalice entre distintos entornos de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (Qwen3.5 MoE, clase `Qwen3_5MoeForConditionalGeneration`) |
| Parametros totales | 35.951.822.704 (~35,95 mil millones) |
| Parametros activos | no disponible (el identificador "A3B" sugiere ~3 mil millones activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | 160.000 tokens en entrenamiento (límite de respuesta 130.000); capacidad posicional en configuración del modelo no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, dos shards) + índice de pesos; tokenizer, processor, generation config y chat template incluidos |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B, un transformer con capas de mezcla de expertos y capacidad multimodal de entrada imagen-texto (tag `image-text-to-text`). Sobre esa base, Lego-X aplicó un ciclo de RL con estimador de ventajas GRPO y pérdida de política GSPO, actualizando pesos con VeOmni y generando rollouts con vLLM. La tasa de aprendizaje fue de 1e-6, con un mini-batch de política de 64 y un presupuesto de contexto de 160.000 tokens durante el entrenamiento.

La innovación principal es el entrenamiento "mixed-harness": la política se entrena conjuntamente contra tres arneses de agente (OpenHands SDK, Claude Code y OpenCode), de modo que el checkpoint resultante es un modelo entrenado de forma conjunta, no una media de parámetros ni una suma de especialistas. El checkpoint corresponde al paso global 90 de la ejecución `mixed-harness-q35-35b-4n-h20-20260905` (experimento `mixed-20260905-093027`). No se incluyen estados de optimizador ni del entrenador, y el autor declara que esta subida no incorpora una nueva ejecución de aceptación de inferencia o benchmarks.

## Capacidades

- Generación de texto y conversación multi-turno.
- Programación y tareas de código a nivel de repositorio mediante arneses de agente.
- Operación con interfaces de herramientas de OpenHands SDK, Claude Code y OpenCode.
- Razonamiento multi-paso orientado a agentes (planificación, edición de ficheros, ejecución de comandos según el arnés).
- Entrada multimodal imagen-texto (heredada de la arquitectura base, tag `image-text-to-text`).
- Soporte de tool calling / function calling a través del chat template y el formato de cada arnés.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de resolución de incidencias en repositorios: el modelo puede recibir un issue y navegar el código, editar ficheros y proponer un parche usando el arnés OpenHands, aprovechando su contexto de entrenamiento de hasta 160.000 tokens para repositorios grandes.
- Automatización de refactorizaciones en CI/CD: integrado vía OpenCode o Claude Code, puede ejecutar tareas de modificación de código acotadas y devolver diffs verificables en pipelines.
- Asistente de programación en IDE con tool calling: al estar entrenado contra interfaces de herramientas reales, encaja en flujos donde el modelo debe invocar funciones (leer ficheros, ejecutar tests) en lugar de solo generar texto.
- Migración de código entre arneses: al ser una política mixta, sirve para equipos que quieren un único modelo desplegado detrás de varios entornos de agente sin mantener especialistas separados.
- Evaluación de agentes de código: útil como política de referencia para comparar el rendimiento de distintos arneses y configuraciones de servicio sobre la misma base.
- Tareas de análisis de repositorio con contexto largo: lectura y razonamiento sobre múltiples ficheros dentro de la ventana de 160.000 tokens de entrenamiento.
- Prototipado de agentes multimodales: la entrada imagen-texto permite escenarios donde el agente recibe capturas o diagramas junto con instrucciones de código (sujeto a validación, ya que no hay benchmarks publicados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta subida no incluye una ejecución de aceptación de inferencia ni de benchmarks, y que la evaluación depende del arnés, la interfaz de herramientas, el presupuesto de tareas y la configuración de servicio.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 72 GB solo para pesos (35,95 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 80 GB y preferiblemente múltiples GPU.
- Cuantización: no se documentan tipos de cuantización; para reducir VRAM habría que convertir los pesos a formatos como GGUF o AWQ por cuenta propia (no verificado por el autor).
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16; configuraciones multi-GPU para contextos largos cercanos a 160.000 tokens.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; requeriría cuantización agresiva no documentada.
- Despliegue: transformers (versión que soporte `Qwen3_5MoeForConditionalGeneration`, el export original registra Transformers 5.4.0) y vLLM; otros motores no confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lego-RL-Qwen3.5-35B-A3B-Mixed-step90 | ~35,95 B (MoE) | 160.000 en entrenamiento | RL mixto sobre arneses de agente | Apache 2.0 | Hugging Face (141 descargas) |
| Qwen/Qwen3.5-35B-A3B (base) | ~35,95 B (MoE) | no disponible | Modelo base multimodal | no disponible en la informacion | Hugging Face |
| Lego-X/qwen3_5_35b_a3b_oc_200k_rl | no disponible | no disponible | RL específico de OpenCode | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No hay benchmarks ni ejecución de aceptación publicados para este checkpoint; el rendimiento real debe validarse en el arnés de destino.
- El autor advierte que la evaluación depende del arnés, la interfaz de herramientas, el presupuesto de tareas y la configuración de servicio; los resultados no son directamente transferibles entre entornos.
- El límite de contexto de entrenamiento (160.000 tokens) no debe confundirse con la capacidad posicional de la configuración del modelo.
- Es un checkpoint intermedio (paso 90) de un experimento de RL; no se garantiza que sea el mejor punto de la ejecución.
- No se incluyen estados de optimizador ni del entrenador, lo que limita la reanudación del entrenamiento.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera de los idiomas cubiertos por el modelo base.
- Riesgo de alucinación inherente a modelos de lenguaje; en tareas de código puede generar parches incorrectos que requieren verificación con tests.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-35B-A3B.
- El nombre "Lego-X" no guarda relación con la marca LEGO; los resultados de búsqueda sobre la tienda oficial son ruido y no aportan información técnica.

## Enlaces

- Hugging Face: https://huggingface.co/Lego-X/Lego-RL-Qwen3.5-35B-A3B-Mixed-step90
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Dashboard de entrenamiento: https://rl-dashboard-mixed.legox.net/
- Código fuente de Lego-RL: https://github.com/LegoX/Lego-RL
- Colección Lego-RL: https://huggingface.co/collections/Lego-X/lego-rl
- Modelo relacionado (OpenCode RL): https://huggingface.co/Lego-X/qwen3_5_35b_a3b_oc_200k_rl
