# asher577/scaling_signed_dcp_d2048_L2_t125000000_s0_mlpsigned_strong5

## Resumen

`scaling_signed_dcp_d2048_L2_t125000000_s0_mlpsigned_strong5` es un transformer con dispersión de pesos (weight-sparse) entrenado por el usuario asher577 siguiendo el procedimiento descrito por Gao et al. (2025). No se trata de un modelo de propósito general ni de un asistente conversacional: es un artefacto de investigación a pequeña escala, con solo 2 capas, dimensión de modelo 2048 y una ventana de contexto de 512 tokens, diseñado para estudiar el comportamiento de la dispersión estructurada en pesos y activaciones durante el entrenamiento.

El modelo se entrena sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`, un corpus sintético de historias cortas en inglés, y acumula 125 millones de tokens vistos. Su vocabulario es de solo 4096 entradas, lo que refuerza su carácter experimental: no está pensado para uso en producción ni para tareas abiertas de lenguaje natural.

La relevancia es puramente metodológica. El nombre codifica los hiperparámetros del experimento (dimensión 2048, 2 capas, 125M tokens, semilla 0, variante "mlpsigned_strong5"), y el objetivo es medir cómo afecta una fracción L0 objetivo de 0,01 en los pesos a la capacidad del modelo. No hay model card con resultados de evaluación, benchmarks ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dispersión de pesos y activaciones (weight-sparse, activation-sparse) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintético en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |
| Capas | 2 |
| Dimension del modelo | 2048 |
| Dimension de cabeza | 16 |
| Tamano de vocabulario | 4096 |
| Fraccion L0 objetivo | 0,01 |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimensión de modelo 2048 y dimensión de cabeza 16, entrenado con el procedimiento de dispersión de pesos de Gao et al. (2025). El modelo declara simultáneamente dispersión de pesos (`Weight Sparsity: True`) y dispersión de activaciones (`Activation Sparsity: True`), con una fracción L0 objetivo de 0,01, es decir, aproximadamente un 1 % de los pesos no nulos por bloque o unidad según la formulación del paper. El sufijo "mlpsigned_strong5" del identificador sugiere una variante concreta del esquema de firma/regularización aplicado a las capas MLP, aunque la model card no detalla la implementación exacta.

El entrenamiento consume 125 millones de tokens del dataset `jacobcd52/simplestories-tokenized`, tokenizado con `SimpleStories/SimpleStories-1.25M` (vocabulario de 4096). No se menciona en la información disponible el uso de RLHF, DPO, ni ninguna fase de ajuste fino posterior. Tampoco se documentan innovaciones adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. El run de entrenamiento está registrado en Weights & Biases (`asher577/scd_scaling`, run `t1qgo0wm`), que es la única fuente potencial de curvas de pérdida y métricas de entrenamiento.

## Capacidades

- Generación de texto autoregresiva a nivel de token sobre el dominio de historias sintéticas simples (SimpleStories).
- Modelado de lenguaje de siguiente token; no se documenta ninguna capacidad de instrucciones, diálogo o razonamiento.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingüe: no disponible; el corpus de entrenamiento es sintético y en inglés.
- No se documentan modos especiales (thinking, visión, audio) ni capacidades multimodales.
- El interés técnico reside en la propia dispersión de pesos y activaciones, no en las capacidades lingüísticas resultantes.

## Casos de uso

- Estudio de escalado de dispersión: reproducir el experimento de Gao et al. (2025) variando dimensión, capas y fracción L0 para analizar la relación entre dispersión y pérdida de validación en el régimen de 125M tokens.
- Investigación sobre dispersión de activaciones: instrumentar el modelo para medir qué porcentaje de activaciones permanece activo y compararlo con la fracción L0 declarada.
- Baseline de juguete para ablaciones: usar este checkpoint como referencia "strong5" frente a otras variantes del mismo autor (semillas, dimensiones o esquemas de firma distintos) en estudios controlados.
- Validación de pipelines de entrenamiento disperso: comprobar que el código de entrenamiento, el tokenizador SimpleStories y el dataset tokenizado producen checkpoints cargables y reproducibles.
- Docencia e ilustración de transformers pequeños: con 2 capas y vocabulario de 4096, sirve para explicar atención, MLP y dispersión en un entorno de bajo coste computacional.
- Análisis de eficiencia teórica: estimar el ahorro de FLOPs y memoria que cabría esperar de una fracción L0 de 0,01 antes de trasladar la técnica a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,8 GB en `pytorch_model.bin`; en FP32 la inferencia requiere aproximadamente 1 GB de VRAM, y en FP16 alrededor de 0,5 GB, sin contar overhead de activaciones (contexto de solo 512 tokens, por lo que el overhead es mínimo).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo sin dificultad. No requiere A100 ni H100.
- Cabe holgadamente en GPU consumer, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la model card solo documenta carga mediante `torch.load` y `hf_hub_download`, requiriendo la clase `SparseGPT` del repositorio del autor. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y es improbable sin conversión a formatos estándar.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scaling_signed_dcp_d2048_L2_t125000000_s0_mlpsigned_strong5 | no disponible (2 capas, d=2048) | 512 | Transformer disperso, experimental | no disponible | Hugging Face |
| Otras variantes del mismo autor (`asher577/scaling_*`) | variables | 512 | Transformer disperso, experimental | no disponible | Hugging Face |
| Modelos de juguete tipo TinyStories / SimpleStories | ~1M–30M | 512–1024 | Transformer denso pequeño | variable (habitualmente MIT/Apache) | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros estructurales y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación con 2 capas y 512 tokens de contexto: no es apto para producción, atención al cliente ni generación de código.
- Vocabulario de 4096 tokens y entrenamiento sobre SimpleStories: el dominio está limitado a historias sintéticas simples; el comportamiento fuera de distribución es impredecible.
- Riesgo elevado de alucinación y de texto incoherente fuera del dominio de entrenamiento.
- Licencia no declarada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier uso más allá de la investigación.
- Idiomas soportados no declarados; no hay evidencia de capacidad multilingüe.
- No se publican benchmarks, curvas de evaluación ni métricas de calidad, lo que impide verificar el efecto real de la dispersión.
- La carga requiere una clase `SparseGPT` específica del repositorio del autor; no es un checkpoint estándar de `transformers`.
- Sesgos conocidos: no documentados, pero el corpus sintético puede introducir sesgos de plantilla y estilo propios de SimpleStories.

## Enlaces

- Hugging Face: https://huggingface.co/asher577/scaling_signed_dcp_d2048_L2_t125000000_s0_mlpsigned_strong5
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/t1qgo0wm
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
