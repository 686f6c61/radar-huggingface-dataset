# nilgeoutim/RLCR-lr1e-6-math

## Resumen

El modelo **RLCR-lr1e-6-math** es un ajuste fino del modelo base **Qwen2.5-3B**, desarrollado por el usuario **nilgeoutim** y publicado en Hugging Face. Se ha entrenado con **GRPO** (*Group Relative Policy Optimization*), una técnica de aprendizaje por refuerzo introducida en el paper *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*, con el objetivo de mejorar el razonamiento matemático. El modelo se presenta como un experimento de investigación que aplica RL a un modelo de 3.000 millones de parámetros, una escala mucho más accesible que los modelos grandes.

La relevancia de este modelo radica en que permite estudiar cómo el refuerzo de políticas puede incrementar las capacidades de razonamiento en modelos pequeños, sin necesidad de etiquetado manual de pasos intermedios. Arquitectónicamente, hereda el transformer denso de Qwen2.5-3B, con un total de **3.397.103.616 parámetros** según los *safetensors* del repositorio. La ventana de contexto, los idiomas soportados y la licencia no se han especificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-3B) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de **Qwen2.5-3B**, un modelo de lenguaje autoregresivo basado en la arquitectura transformer densa (sin mezcla de expertos). El entrenamiento se realizó con la librería **TRL** de Hugging Face, usando el algoritmo **GRPO**, que estima la ventaja muestreando un grupo de respuestas generadas por la política actual y comparándolas entre sí, en lugar de usar un crítico externo. Este método fue introducido en *DeepSeekMath* y está pensado para optimizar el razonamiento matemático sin necesidad de anotaciones de proceso.

Según la información publicada, el entrenamiento se ejecutó con **Transformers 4.48.3**, **PyTorch 2.5.1+cu124**, **Datasets 4.0.0** y **Tokenizers 0.21.1**, y los resultados están registrados en una run de **Weights & Biases**. No se han publicado detalles sobre el dataset de entrenamiento, la composición de datos ni el número de tokens utilizados. El nombre del modelo sugiere una tasa de aprendizaje de LR = 1e-6, y la orientación principal es el dominio matemático.

## Capacidades

- Generación de texto autoregresiva en formato conversacional, compatible con el pipeline `text-generation` de Transformers.
- Entrenado específicamente para mejorar el razonamiento matemático mediante GRPO, en línea con la metodología de DeepSeekMath.
- Soporta la entrada de mensajes estructurada por roles (`user`, `assistant`), como se muestra en el ejemplo de `quick start` de la model card.
- No se ha documentado en la información disponible ningún soporte para tool calling, uso de agentes, visión, audio ni modos de pensamiento especiales.

## Casos de uso

- **Tutor personalizado de matemáticas**: el modelo puede explicar paso a paso problemas de álgebra, cálculo o estadística en lenguaje natural. Su tamaño de 3B permite desplegarlo en entornos con recursos limitados, y el formato conversacional facilita el diálogo estudiante-máquina.
- **Generación de ejercicios con soluciones razonadas**: ideal para plataformas educativas que necesitan crear problemas matemáticos variados junto con sus soluciones detalladas. El modelo puede generar texto coherente que después puede ser validado por sistemas de evaluación automática.
- **Asistente en foros académicos**: en comunidades de preguntas y respuestas, el modelo puede redactar respuestas razonadas a consultas matemáticas. Su ligereza y bajo coste de inferencia lo hacen viable para servir a muchos usuarios simultáneamente.
- **Prototipado de agentes de razonamiento**: al estar entrenado con RL, el modelo puede actuar como componente de razonamiento en pipelines que combinan herramientas externas mediante prompts. Es una base útil para experimentar con sistemas de resolución de problemas en entornos de investigación.
- **Investigación en RL para modelos pequeños**: el modelo sirve como referencia para comparar configuraciones de GRPO, datasets e hiperparámetros. El enlace al run de Weights & Biases permite reproducir o analizar el entrenamiento, lo que es valioso para la comunidad académica.
- **Soporte didáctico en aplicaciones móviles**: gracias a su tamaño de 3B, puede ejecutarse en GPUs modestas en la nube, permitiendo incorporar tutoría matemática en aplicaciones de aprendizaje con un coste por consulta relativamente bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en fp16 ocupan aproximadamente 6,8 GB, por lo que se necesitan entre 8 y 10 GB de VRAM para un despliegue con margen para activaciones. En una cuantización a 4 bits (no incluida en el repositorio), la carga se reduciría a unos 2-3 GB.
- **GPU recomendadas**: una NVIDIA RTX 3060 de 12 GB es suficiente para ejecutar el modelo en fp16. También son adecuadas GPU como A10G, T4 o L4.
- **Compatibilidad con GPU de consumo**: sí, el modelo puede ejecutarse en tarjetas gráficas de consumo de 12 GB o superiores, aunque con una latencia mayor que con GPUs profesionales.
- **Opciones de despliegue**: el modelo es compatible con `transformers` (pipeline), `vLLM`, `TGI` y, tras conversión a GGUF, con `llama.cpp` u `Ollama`.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RLCR-lr1e-6-math | 3.397.103.616 | no disponible | no disponible | Hugging Face |
| Qwen2.5-3B (base) | ~3,09B | 32k | Apache 2.0 | Hugging Face |
| Llama-3.2-3B | ~3,21B | 128k | Llama 3.2 Community | Hugging Face |
| Phi-3-mini | ~3,82B | 128k | MIT | Hugging Face |

En cuanto al rendimiento, no se han publicado resultados de benchmarks para ninguno de los modelos en la información disponible.

## Limitaciones y advertencias

- **Sesgos conocidos**: no disponible. No se han publicado evaluaciones de sesgos.
- **Riesgo de alucinacion**: inherente a los modelos de lenguaje de 3B, especialmente fuera de su dominio de entrenamiento matemático. Es recomendable validar las respuestas en contextos críticos.
- **Limitaciones de contexto e idioma**: no especificadas en la información disponible; es probable que herede las capacidades lingüísticas de Qwen2.5-3B, pero no hay garantías.
- **Restricciones de licencia**: la licencia figura como "no disponible". Esto implica que no se puede asumir un uso comercial sin el consentimiento explícito del autor.
- **Produccion**: es un modelo experimental de investigación, sin pruebas de robustez ni evaluaciones exhaustivas. Antes de desplegarlo, se debe contrastar con otros modelos y validar su comportamiento en tareas no matemáticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nilgeoutim/RLCR-lr1e-6-math
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Paper de DeepSeekMath (GRPO): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/1904167037-the-university-of-hong-kong/RLCR/runs/2zoi9bk9
- Variante relacionada RLCR-math: https://huggingface.co/nilgeoutim/RLCR-math
