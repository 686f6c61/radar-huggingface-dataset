# JaeWooShin/grpo-math-models

## Resumen

`grpo-math-models` es una colección de checkpoints de investigación publicada por el usuario JaeWooShin en Hugging Face. No se trata de un modelo único, sino de un repositorio que agrupa los pesos finales en bf16 de varias ejecuciones de fine-tuning con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos English DAPO-Math, con una carpeta independiente por ejecución. Cada carpeta se carga de forma individual mediante `AutoModelForCausalLM.from_pretrained` indicando el subdirectorio correspondiente.

El repositorio contiene al menos dos familias de modelos base: variantes derivadas de `meta-llama/Llama-3.2-3B-Instruct` (identificadas con el prefijo `llama-3.2-3b-instruct_*`) y variantes derivadas de `Qwen/Qwen3-4B-Base` (prefijo `qwen3-4b-base_*`). El propósito declarado es servir como material de investigación sobre el efecto de GRPO en el razonamiento matemático, no como modelos listos para producción.

La relevancia de esta publicación es acotada: el autor advierte explícitamente de que son checkpoints de investigación y que algunos son "baselines deliberadamente degenerados", lo que los descarta para despliegue. La ficha se limita a los datos disponibles en la model card y en los metadatos de Hugging Face; no hay información publicada sobre benchmarks, composición exacta del dataset ni hiperparámetros de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de los modelos base: Llama 3.2 3B Instruct y Qwen3 4B Base) |
| Parametros totales | 3B (variantes `llama-3.2-3b-instruct_*`) y 4B (variantes `qwen3-4b-base_*`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el dataset de entrenamiento es English DAPO-Math, en inglés) |
| Licencia | Llama 3.2 Community License para las variantes Llama; Apache-2.0 para las variantes Qwen3 (según modelo base) |
| Formato de pesos | safetensors en bf16, organizados en subcarpetas por ejecución |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-09 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de los modelos base empleados: transformers decoder-only densos de 3B parámetros (Llama 3.2 3B Instruct) y 4B parámetros (Qwen3 4B Base). El repositorio no introduce cambios arquitectónicos propios; su aportación es el proceso de ajuste. El método de entrenamiento es GRPO, una variante de optimización por política proximal que estima la ventaja relativa dentro de grupos de respuestas muestreadas, sin necesidad de un modelo crítico separado, y que se ha popularizado para el entrenamiento de razonamiento matemático con recompensas verificables.

El dataset de entrenamiento es English DAPO-Math, un conjunto de problemas matemáticos en inglés asociado a la línea de trabajo DAPO. No se especifican en la model card el número de tokens, la composición exacta del dataset, la función de recompensa empleada, los hiperparámetros de GRPO (tamaño de grupo, coeficiente KL, tasa de aprendizaje) ni si hubo etapas adicionales de SFT o DPO. Tampoco se documenta la innovación técnica concreta de cada ejecución más allá de la variación de configuración implícita en la existencia de múltiples carpetas.

## Capacidades

- Generación de texto y razonamiento matemático: el ajuste con GRPO sobre DAPO-Math está orientado a la resolución de problemas matemáticos en inglés.
- Razonamiento multi-paso: GRPO se aplica habitualmente a tareas que requieren cadenas de razonamiento; la model card no detalla si los checkpoints producen trazas de razonamiento explícitas.
- Herencia de capacidades del modelo base: las variantes Llama 3.2 3B Instruct conservan el formato de instrucciones y el soporte de conversación del modelo original; las variantes Qwen3 4B Base parten de un modelo base, por lo que su comportamiento conversacional depende del ajuste recibido.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible; el autor indica que son checkpoints de investigación, no para despliegue.
- Capacidades multilingües: no documentadas; el entrenamiento se realizó sobre datos en inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación sobre GRPO: comparar el efecto de distintas configuraciones de GRPO sobre un mismo modelo base cargando cada subcarpeta y evaluando su precisión en problemas matemáticos de validación.
- Reproducción de experimentos: utilizar los pesos finales en bf16 como punto de partida para replicar o extender los resultados de ajuste con DAPO-Math en entornos académicos.
- Análisis de degradación de modelos: estudiar los "baselines deliberadamente degenerados" mencionados por el autor para caracterizar modos de fallo típicos del entrenamiento con recompensas verificables (colapso de formato, respuestas triviales, sobreajuste a la recompensa).
- Estudio comparativo Llama vs. Qwen: contrastar cómo responde un modelo de 3B ajustado por instrucciones frente a un base de 4B ante el mismo pipeline de GRPO.
- Docencia y formación: emplear los checkpoints como ejemplo práctico de fine-tuning con RL en cursos de aprendizaje automático, dado su tamaño reducido.
- Evaluación de metodologías de recompensa: probar funciones de recompensa alternativas sobre estos checkpoints para medir su impacto en la calidad de las soluciones matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6-7 GB para las variantes de 3B y 8-9 GB para las de 4B, incluyendo overhead de activaciones y caché KV en contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB (3B) y 5 GB (4B); en 4 bits, aproximadamente 2,5 GB y 3 GB respectivamente, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM para bf16 sin cuantizar; RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100 son suficientes. Cabe en GPU de consumo con cuantización.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` indicando el subdirectorio de la ejecución; vLLM y TGI pueden cargar los pesos si se apunta al subdirectorio correcto. No se documenta compatibilidad con llama.cpp u Ollama al no haber GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grpo-math-models (Llama 3.2 3B) | 3B | no disponible | GRPO sobre DAPO-Math | Llama 3.2 Community License | Hugging Face, checkpoints de investigación |
| grpo-math-models (Qwen3 4B) | 4B | no disponible | GRPO sobre DAPO-Math | Apache-2.0 (base) | Hugging Face, checkpoints de investigación |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128K (según model card oficial) | SFT + RLHF generalista | Llama 3.2 Community License | Hugging Face, uso general |
| Qwen/Qwen3-4B-Base | 4B | 32K (según model card oficial) | Preentrenamiento generalista | Apache-2.0 | Hugging Face, uso general |

La comparativa se limita a los modelos base de los que derivan los checkpoints, ya que no se dispone de datos de rendimiento de las variantes ajustadas ni de modelos comparables de la misma categoría (checkpoints de investigación con GRPO sobre matemáticas).

## Limitaciones y advertencias

- El autor declara explícitamente que son checkpoints de investigación y no para despliegue en producción.
- Algunos checkpoints son "baselines deliberadamente degenerados", es decir, configuraciones diseñadas para fallar o mostrar comportamientos indeseados; no deben evaluarse sin conocer qué carpeta corresponde a cada caso.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de seguridad.
- El entrenamiento se realizó exclusivamente sobre datos en inglés (English DAPO-Math), por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- La licencia de las variantes Llama 3.2 Community License impone restricciones de uso comercial y obligaciones de atribución; las variantes Qwen3 heredan Apache-2.0, pero el autor no aclara si los pesos ajustados mantienen esa licencia.
- No hay información sobre el contexto máximo efectivo tras el ajuste, ni sobre la estabilidad de las respuestas en conversaciones multi-turno.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No se publican hiperparámetros, curvas de entrenamiento ni métricas de evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JaeWooShin/grpo-math-models
- Modelo base Llama 3.2 3B Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Modelo base Qwen3 4B Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Licencia Llama 3.2 Community License: https://www.llama.com/llama3_2/license/
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Paper de DAPO: https://arxiv.org/abs/2503.14476
