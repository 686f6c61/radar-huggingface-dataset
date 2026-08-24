# agentic-ptb/opus-high-v2.h004.sft_v2.step_120

## Resumen

El modelo `agentic-ptb/opus-high-v2.h004.sft_v2.step_120` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro de un experimento de entrenamiento agéntico denominado AgentPTB. Se trata de un fine-tuning (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y pesos en formato safetensors. El autor lo etiqueta explícitamente como "intermediate" (rol intermedio) y advierte que no es un artefacto final: en la propia model card se indica que todos los checkpoints SFT de esta celda regresaron frente a los tensores base, y que el artefacto recomendado es `base_real`, es decir, el modelo base sin modificaciones.

Este checkpoint se generó a partir de datos producidos por Claude Opus 5 (configuración `claude-opus-5` con effort `high`) durante una ejecución de 100 horas, en el paso 120 de la fase `sft_v2`. El autor publica estos checkpoints porque fueron producidos y medidos, no porque sean útiles: el mejor de ellos obtuvo un 17,2% frente al 29,1% del modelo base en 285 tareas emparejadas de SWE-bench Verified. Por tanto, no se recomienda su uso en producción ni como base para comparaciones, y la ficha refleja esta situación con datos limitados y advertencias claras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B-Base`, que es un transformer denso de 9.400 millones de parámetros. No se dispone de detalles sobre la arquitectura interna del base (número de capas, heads, etc.) más allá de lo que publica Qwen. El entrenamiento se realizó con datos generados por Claude Opus 5 (configuración `claude-opus-5` con effort `high`) dentro de un pipeline agéntico llamado AgentPTB, en una celda de 100 horas de ejecución. El checkpoint corresponde al paso 120 de la fase `sft_v2`.

El autor no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Lo único que se sabe con certeza es que el proceso de SFT produjo una regresión significativa frente al modelo base: en 285 tareas emparejadas de SWE-bench Verified, el mejor checkpoint SFT obtuvo un 17,2% frente al 29,1% del base. Esto sugiere que el fine-tuning no fue efectivo, posiblemente por problemas de calidad de los datos o de configuración del entrenamiento.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al ser un fine-tuning del base Qwen3.5-9B-Base, podría heredar las capacidades generales de ese modelo (generación de texto, razonamiento, código, etc.), pero no hay evidencia de que este checkpoint las conserve o las mejore. Dado que el autor reporta una regresión en SWE-bench, es probable que el rendimiento en tareas de código y razonamiento sea inferior al del base. No se dispone de información sobre tool calling, capacidades agénticas, multilingüismo o modos especiales.

## Casos de uso

Dado el carácter experimental y la regresión documentada, este checkpoint no es adecuado para aplicaciones prácticas. Los casos de uso realistas se limitan al ámbito de la investigación:

- **Investigación sobre fine-tuning agéntico**: puede servir para estudiar por qué un SFT con datos generados por un modelo de alto rendimiento (Claude Opus 5) produce regresión en tareas de código. Permite analizar la dinámica de pérdida y las diferencias con el modelo base.
- **Análisis de degradación de modelos**: comparar las activaciones y salidas de este checkpoint con el base para identificar qué capas o patrones se vieron afectados por el entrenamiento.
- **Reproducción de experimentos**: el autor publica el registro de ejecución (`agentic-ptb/opus-high-v2-record`) y un índice (`agentic-ptb/INDEX`), lo que permite reproducir el pipeline completo y verificar los resultados.
- **Evaluación de pipelines de datos**: si se quiere entender cómo la calidad de los datos sintéticos afecta al rendimiento, este checkpoint es un ejemplo de un caso fallido.
- **Desarrollo de técnicas de mitigación**: probar métodos como la interpolación de pesos, el merging con el base o el fine-tuning selectivo para recuperar el rendimiento.
- **Benchmarking de herramientas de evaluación**: usar este checkpoint como caso límite en suites de evaluación para verificar que los benchmarks detectan correctamente la degradación.

## Benchmarks y rendimiento

El único dato de rendimiento disponible proviene de la model card del autor, que reporta resultados en SWE-bench Verified (285 tareas emparejadas):

| Modelo | SWE-bench Verified (285 tareas) |
|---|---|
| `opus-high-v2.h004.sft_v2.step_120` (mejor checkpoint SFT) | 17,2% |
| `Qwen/Qwen3.5-9B-Base` (base sin modificar) | 29,1% |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) para este checkpoint. La regresión es notable: el fine-tuning redujo el rendimiento en más de 11 puntos porcentuales. El autor indica que el artefacto recomendado es `base_real` (el base sin modificar), lo que confirma que este checkpoint no es competitivo.

## Requisitos de hardware

Dado que el modelo tiene 9.409.813.744 parámetros y el repositorio pesa 18,8 GB (lo que sugiere pesos en FP16 o BF16), se pueden estimar los requisitos de inferencia:

- **VRAM estimada**: en FP16/BF16, aproximadamente 19 GB (9,4 GB de pesos + overhead de activaciones y KV cache). En cuantización int8, unos 10 GB; en int4, unos 5 GB. No se proporcionan cuantizaciones oficiales, pero se podrían generar con herramientas como llama.cpp o GPTQ.
- **GPU recomendadas**: para FP16, una GPU con 24 GB o más (RTX 3090, RTX 4090, A10G, A100 40GB). Para int8, una GPU de 12-16 GB (RTX 3080, RTX 4070 Ti). Para int4, una GPU de 8 GB (RTX 3060, RTX 4060).
- **Compatibilidad con GPU de consumo**: sí, es posible ejecutarlo en GPUs de consumo con cuantización, aunque no hay archivos GGUF ni AWQ publicados.
- **Opciones de despliegue**: al ser un modelo estándar de safetensors, se puede cargar con Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay configuraciones específicas publicadas.
- **Latencia y throughput**: no se dispone de datos medidos. Para un modelo de 9,4B en una GPU moderna, se puede esperar un throughput del orden de 20-50 tokens/s en FP16 con batch pequeño, pero esto es una estimación genérica.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría. El único punto de referencia fiable es el modelo base `Qwen/Qwen3.5-9B-Base`, que es claramente superior en SWE-bench Verified. Se podría comparar con otros modelos de ~9B como Llama 3.1 8B o Mistral 7B, pero no hay resultados publicados de este checkpoint en los mismos benchmarks. Por tanto, la comparativa se limita a:

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|
| `opus-high-v2.h004.sft_v2.step_120` | 9,4B | no disponible | 17,2% | no disponible |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible | 29,1% | no disponible |

## Limitaciones y advertencias

- **Regresión documentada**: el autor confirma que este checkpoint SFT regresó frente al modelo base en SWE-bench Verified (17,2% vs 29,1%). No es apto para tareas de código ni razonamiento.
- **Checkpoint intermedio**: no es un artefacto final. El autor recomienda usar `base_real` (el base sin modificar) en su lugar.
- **Sin licencia**: no se especifica ninguna licencia, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- **Sin información de contexto**: se desconoce la longitud de contexto soportada, lo que dificulta su uso en aplicaciones que requieran ventanas largas.
- **Sin datos de sesgos o alucinación**: no se han publicado evaluaciones de sesgos, toxicidad o fiabilidad. Dado que es un modelo experimental, es probable que herede los sesgos del base y que su tasa de alucinación sea alta.
- **Riesgo de confusión**: al estar publicado en Hugging Face con un nombre que sugiere calidad ("opus-high"), podría inducir a error a quien no lea la model card. Es crucial revisar la documentación antes de usarlo.
- **Sin soporte**: al ser un experimento de un usuario individual, no hay mantenimiento, actualizaciones ni canal de soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/agentic-ptb/opus-high-v2.h004.sft_v2.step_120)
- [Registro de ejecución (run record)](https://huggingface.co/agentic-ptb/opus-high-v2-record)
- [Índice de AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelo base Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
