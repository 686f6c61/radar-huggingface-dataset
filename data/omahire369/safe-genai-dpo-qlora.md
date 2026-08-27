# OmAhire369/safe-genai-dpo-qlora

## Resumen

`safe-genai-dpo-qlora` es un adaptador QLoRA (4-bit) entrenado con Direct Preference Optimisation (DPO) sobre el modelo base `gpt2-medium`, con el objetivo de alinear las respuestas del modelo frente a prompts dañinos o que activan estereotipos. El autor, OmAhire369, lo presenta como parte de un estudio comparativo entre PPO y DPO para alineación de seguridad, incluyendo un modelo de recompensa Bradley-Terry, un bucle PPO escrito a mano y un objetivo DPO también implementado manualmente, junto con un barrido de cuatro estrategias de fine-tuning (full, prefix, LoRA y QLoRA).

El modelo no es un LLM independiente, sino un conjunto de adaptadores PEFT que deben cargarse sobre `gpt2-medium`. Con solo 4,325 millones de parámetros entrenables (1,2% del total), el adaptador modifica el estilo y la seguridad de las respuestas, pero no convierte al modelo base en un sistema factual ni listo para producción. La licencia MIT permite uso comercial sin restricciones, y el repositorio incluye el código del estudio en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 medium (transformer decoder) con adaptadores QLoRA |
| Parametros totales | 359,15 M (modelo base) + 4,325 M entrenables (adaptador) |
| Parametros activos | 359,15 M (todos los parámetros del base están activos; el adaptador añade 4,325 M) |
| Longitud de contexto | 1024 tokens (contexto del modelo base GPT-2 medium) |
| Tipos de cuantizacion | QLoRA 4-bit (adaptadores en 4 bits) |
| Idiomas soportados | No disponible (el modelo base GPT-2 medium está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo base es `gpt2-medium`, un transformer decoder de 359 millones de parámetros con 24 capas y 1024 tokens de contexto. Sobre este base se aplican adaptadores QLoRA, que congelan los pesos originales y añaden matrices de bajo rango cuantizadas a 4 bits. El entrenamiento utiliza Direct Preference Optimisation (DPO), un método de alineación que optimiza directamente la preferencia humana sin necesidad de un modelo de recompensa explícito durante el ajuste, aunque en este estudio se entrena previamente un modelo de recompensa Bradley-Terry para evaluar.

Los datos de preferencia provienen de "Cultural Kaleidoscope", con 4000 pares de respuestas preferidas y rechazadas. El entrenamiento duró 3435,65 segundos (aproximadamente 57 minutos) con un pico de memoria GPU de 8540,3 MB. El resultado reportado es una mejora de 9,73 puntos en la puntuación del modelo de recompensa respecto al paso 0, alcanzando 4,17 tras el entrenamiento. No se especifica el número de épocas ni el tamaño de lote.

## Capacidades

- Generación de texto autoregresiva: el modelo base GPT-2 medium genera texto coherente en inglés, y el adaptador modifica el estilo para evitar respuestas dañinas o estereotipadas.
- Alineación de seguridad: entrenado específicamente para rechazar o reformular respuestas a prompts que solicitan contenido dañino o que activan estereotipos.
- Fine-tuning eficiente: al ser un adaptador QLoRA, puede cargarse y usarse con pocos recursos, y es fácilmente combinable con otros adaptadores.
- No soporta tool calling, ni razonamiento multi-paso, ni visión, ni audio. Es un modelo de texto puro con capacidades limitadas por su tamaño y falta de instruction tuning.

## Casos de uso

- Investigación en alineación de modelos: el adaptador sirve como banco de pruebas para comparar DPO frente a PPO en un entorno controlado, como se documenta en el repositorio del autor.
- Evaluación de métodos de fine-tuning eficiente: permite estudiar el impacto de QLoRA frente a LoRA, prefix tuning o fine-tuning completo en tareas de seguridad.
- Prototipado de sistemas de moderación de contenido: aunque no es robusto, puede usarse como demostración de cómo un modelo pequeño puede ajustarse para evitar respuestas dañinas en entornos de baja exigencia.
- Educación y formación en RLHF/DPO: el código y los adaptadores son un recurso didáctico para entender el flujo completo de alineación con preferencias.
- Comparación de estrategias de alineación: junto con los modelos `safe-genai-ppo-qlora` y `safe-genai-reward-full` del mismo autor, permite analizar diferencias entre métodos.
- Experimentos de transferencia de adaptadores: al ser un adaptador PEFT, puede combinarse con otros adaptadores sobre el mismo base para estudiar composición de habilidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la puntuación del modelo de recompensa interno, que pasó de un valor inicial (no especificado) a 4,17 tras el entrenamiento, con una mejora de 9,73 puntos. Este dato no es comparable con benchmarks públicos y solo es útil dentro del contexto del estudio del autor.

## Requisitos de hardware

- VRAM estimada: el pico de memoria durante el entrenamiento fue de 8540,3 MB, por lo que la inferencia con el adaptador cargado sobre GPT-2 medium debería requerir menos de 4 GB en FP16, y menos de 2 GB en 4-bit.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, T4) es suficiente para inferencia. Para entrenamiento, se usó una GPU con ~8,5 GB, como una RTX 3070 o similar.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` de Hugging Face y ejecutarse con `transformers`. También puede exportarse a GGUF para usar con llama.cpp u Ollama, aunque no se proporciona un archivo GGUF preconvertido.
- Latencia y throughput: no disponibles, pero dado el tamaño del modelo (359 M), la generación es rápida en GPU, del orden de decenas de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

| Modelo | Base | Método | Parámetros entrenables | Licencia | Contexto |
|---|---|---|---|---|---|
| `safe-genai-dpo-qlora` (este) | GPT-2 medium | DPO + QLoRA | 4,325 M | MIT | 1024 |
| `safe-genai-ppo-qlora` (mismo autor) | GPT-2 medium | PPO + QLoRA | No disponible | MIT | 1024 |
| `safe-genai-reward-full` (mismo autor) | GPT-2 medium | Fine-tuning completo (reward model) | No disponible | MIT | 1024 |

Los tres modelos del autor comparten base y objetivo (alineación de seguridad), pero difieren en el método de entrenamiento. No se dispone de comparativas con modelos externos de la misma categoría (por ejemplo, otros adaptadores de seguridad sobre GPT-2) en la información proporcionada.

## Limitaciones y advertencias

- El modelo base `gpt2-medium` es pequeño y desactualizado, sin instruction tuning, por lo que las respuestas pueden ser incoherentes o poco útiles fuera del ámbito de seguridad.
- La alineación solo modifica el estilo y la seguridad; no mejora la factualidad ni la capacidad de razonamiento.
- El modelo de recompensa utilizado para evaluar hereda los sesgos de anotación de los datos de preferencia, por lo que no debe tratarse como un clasificador de seguridad general.
- No se han evaluado sesgos específicos del adaptador; el modelo base GPT-2 ya presenta sesgos de género, raza y religión que pueden persistir.
- Riesgo de alucinación: inherente a todos los modelos generativos, y más acusado en modelos pequeños.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de seguridad ni soporte.
- El adaptador no está pensado para producción; es un artefacto de investigación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OmAhire369/safe-genai-dpo-qlora)
- [Modelo PPO QLoRA del mismo autor](https://huggingface.co/OmAhire369/safe-genai-ppo-qlora)
- [Modelo de recompensa full del mismo autor](https://huggingface.co/OmAhire369/safe-genai-reward-full)
- [Repositorio GitHub del proyecto](https://github.com/Omahire369/safety-alignment-llm)
- [README de la aplicación en GitHub](https://github.com/Omahire369/safety-alignment-llm/blob/main/app/README.md)
