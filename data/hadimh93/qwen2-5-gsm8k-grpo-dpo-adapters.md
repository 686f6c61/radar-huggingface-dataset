# hadimh93/qwen2.5-gsm8k-grpo-dpo-adapters

## Resumen

Este repositorio contiene ocho adaptadores LoRA en formato PEFT, derivados del artículo *Reasoning-Answer Entailment Under GRPO and DPO Fine-Tuning* (Mohammadi y Giachanou, INLG 2026). El trabajo compara dos estrategias de post-entrenamiento —GRPO (Group Relative Policy Optimization) y DPO (Direct Preference Optimization)— aplicadas a modelos de la familia Qwen2.5-Instruct en cuatro escalas distintas (1.5B, 3B, 7B y 14B), utilizando datos derivados de GSM8K para entrenar el razonamiento matemático con cadenas de pensamiento (chain-of-thought).

La relevancia de este conjunto de adaptadores radica en que ofrece una comparación controlada y reproducible de dos métodos de alineación ampliamente usados, bajo un presupuesto de una sola GPU mediante QLoRA. Cada adaptador se puede cargar sobre el modelo base correspondiente con la librería `peft`, lo que permite evaluar el impacto de cada técnica en el rendimiento de razonamiento sin necesidad de reentrenar el modelo completo. El repositorio incluye código, datos de evaluación por ejemplo y el pipeline completo en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre Qwen2.5-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (los adaptadores son de bajo rango; el tamaño del repo es 1.9 GB para los ocho) |
| Parametros activos | No aplica (son adaptadores, no modelos MoE) |
| Longitud de contexto | No especificada para los adaptadores; el modelo base Qwen2.5-Instruct soporta hasta 32 768 tokens |
| Tipos de cuantizacion | Entrenados con QLoRA sobre bases cuantizadas a 4 bits; los adaptadores se aplican a bases en bf16 o fp16 |
| Idiomas soportados | No disponibles (depende del modelo base, que soporta principalmente inglés y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

Los adaptadores se entrenaron con QLoRA sobre versiones cuantizadas a 4 bits de los modelos Qwen2.5-Instruct (específicamente las variantes `unsloth` con bnb-4bit). Se usaron dos métodos de post-entrenamiento: GRPO, que optimiza directamente la recompensa mediante aprendizaje por refuerzo con un grupo de respuestas, y DPO, que alinea preferencias sin necesidad de un modelo de recompensa explícito. Los datos de entrenamiento provienen de GSM8K, un conjunto de problemas matemáticos de nivel escolar, y se estructuraron con etiquetas específicas para separar el razonamiento de la respuesta final: GRPO usa `<start_working_out>`/`<end_working_out>` y `<SOLUTION>`, mientras que DPO usa `<reasoning>`/`<answer>`.

Cada adaptador tiene una configuración de rango y alpha distinta: los de GRPO usan r=16, α=32, y los de DPO r=32, α=64. Los checkpoints seleccionados varían según la escala (por ejemplo, el adaptador GRPO de 1.5B se guardó en el paso 57, mientras que los de 3B, 7B y 14B en el paso 114; los de DPO van desde el paso 274 hasta el 411). El entrenamiento se realizó con un presupuesto de una sola GPU, lo que demuestra la viabilidad de estos métodos en entornos con recursos limitados.

## Capacidades

- Razonamiento matemático: los adaptadores están especializados en problemas de aritmética y álgebra del estilo GSM8K, con generación de cadenas de pensamiento explícitas.
- Generación de texto: heredan las capacidades del modelo base Qwen2.5-Instruct, incluyendo generación de texto general, código y comprensión del lenguaje.
- Razonamiento multi-paso: gracias al entrenamiento con GRPO y DPO, los modelos tienden a producir razonamientos más fieles a la respuesta final, reduciendo la desconexión entre el proceso de pensamiento y el resultado.
- Soporte de tool calling: no disponible específicamente para estos adaptadores; depende del modelo base, que sí soporta function calling en sus versiones instruct.
- Capacidades multilingües: no especificadas para los adaptadores; el modelo base Qwen2.5-Instruct soporta principalmente inglés y chino, con algo de otros idiomas.
- Formato de salida estructurado: los adaptadores generan respuestas con etiquetas específicas (`<reasoning>`, `<answer>`, etc.), lo que facilita el parseo automático en pipelines.

## Casos de uso

- Evaluación de métodos de alineación: investigadores pueden comparar directamente GRPO vs DPO en términos de precisión de razonamiento y fidelidad de la cadena de pensamiento, usando los ocho adaptadores como referencia controlada.
- Fine-tuning selectivo para matemáticas: desarrolladores que necesiten un modelo pequeño (1.5B o 3B) con capacidades mejoradas en problemas aritméticos pueden cargar el adaptador correspondiente sobre el base y desplegarlo en entornos con recursos limitados.
- Generación de soluciones explicadas: en aplicaciones educativas, el modelo puede generar respuestas paso a paso para problemas de matemáticas, con el razonamiento separado de la respuesta final, útil para sistemas de tutoría automática.
- Investigación en razonamiento fiel (faithful reasoning): el artículo se centra en la implicación entre razonamiento y respuesta; estos adaptadores sirven para estudiar cómo reducir alucinaciones en el proceso de pensamiento.
- Prototipado rápido con PEFT: al ser adaptadores LoRA, se pueden combinar con otros adaptadores o intercambiar fácilmente sobre el mismo modelo base, facilitando experimentos de composición de habilidades.
- Benchmarking de hardware: al tener cuatro escalas distintas, se puede medir el rendimiento y la latencia en diferentes GPUs, desde tarjetas de consumo hasta GPUs de datacenter, para decidir qué tamaño usar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas numéricas de precisión en GSM8K ni comparaciones con otros modelos. Se recomienda consultar el artículo de INLG 2026 o el repositorio de GitHub para obtener datos de evaluación detallados.

## Requisitos de hardware

- Los adaptadores en sí ocupan muy poca memoria (cada uno del orden de decenas de MB), pero requieren cargar el modelo base completo.
- Para el adaptador de 1.5B: se puede ejecutar en GPUs con 4-6 GB de VRAM en cuantización 4-bit, o 8 GB en bf16. Tarjetas como RTX 3060 o superiores son suficientes.
- Para el adaptador de 3B: se recomienda al menos 8 GB de VRAM en 4-bit, o 12-16 GB en bf16. RTX 4070 o A10 son adecuadas.
- Para el adaptador de 7B: se necesitan 12-16 GB de VRAM en 4-bit, o 24 GB en bf16. RTX 4090, A100 40GB o similares.
- Para el adaptador de 14B: se requieren 24 GB de VRAM en 4-bit, o 40-48 GB en bf16. A100 40GB/80GB, H100 o múltiples GPUs.
- Opciones de despliegue: al ser adaptadores PEFT, se pueden cargar con `transformers` y `peft` en pipelines de Hugging Face, o exportar a GGUF para usar con llama.cpp u Ollama (requiere fusionar el adaptador con el base).
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño del modelo base.

## Comparativa con modelos similares

| Modelo | Tamaño base | Método | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hadimh93/qwen2.5-gsm8k-grpo-dpo-adapters | 1.5B-14B | GRPO y DPO | 32k (base) | MIT | Hugging Face |
| sarthak247/qwen2.5-grpo-gsm8k-250steps-lora-adapters | 3B | GRPO | 32k (base) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1.5B | Instruct (SFT+RLHF) | 32k | Apache 2.0 | Hugging Face |

La comparativa directa no está disponible porque no se han publicado métricas. Sin embargo, la principal diferencia frente a otros adaptadores de GSM8K es que este repositorio ofrece una comparación sistemática de dos métodos (GRPO y DPO) en cuatro escalas, lo que permite aislar el efecto del método y del tamaño. El adaptador de sarthak247 es un caso similar pero solo para 3B y con GRPO, sin la comparación con DPO.

## Limitaciones y advertencias

- Los adaptadores están especializados en GSM8K; su rendimiento en otros dominios matemáticos o tareas generales puede degradarse respecto al modelo base.
- No se han publicado métricas de rendimiento en el repositorio, por lo que es necesario evaluar cada adaptador en el caso de uso concreto antes de desplegarlo en producción.
- El entrenamiento se realizó con QLoRA sobre bases cuantizadas a 4 bits; al aplicar los adaptadores a bases en bf16, pueden aparecer pequeñas diferencias numéricas en las salidas.
- Los adaptadores requieren el uso de plantillas de prompt específicas (con etiquetas como `<reasoning>` o `<start_working_out>`) para funcionar correctamente; usarlos sin estas plantillas puede producir salidas inconsistentes.
- El modelo base Qwen2.5-Instruct puede presentar sesgos y alucinaciones, especialmente en contextos no matemáticos; estos adaptadores no corrigen esos problemas.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2.5-Instruct está bajo Apache 2.0, que también permite uso comercial con atribución; verificar los términos de cada componente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hadimh93/qwen2.5-gsm8k-grpo-dpo-adapters
- Código y pipeline de evaluación: https://github.com/mohammadi-hadi/grpo_dpo_comparison
- Paper (INLG 2026): *Reasoning-Answer Entailment Under GRPO and DPO Fine-Tuning* (Mohammadi y Giachanou) — no se ha encontrado enlace directo al PDF en la búsqueda web.
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
