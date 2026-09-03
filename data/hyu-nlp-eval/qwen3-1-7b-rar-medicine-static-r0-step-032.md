# HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-032

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-032` es un checkpoint de política (policy checkpoint) derivado del modelo base `Qwen/Qwen3-1.7B`, entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization). El entrenamiento se realizó sobre un dominio de medicina (RaR Medicine) utilizando una rúbrica estática congelada (R0) como recompensa, dentro de un experimento diseñado para estudiar la saturación de recompensas y el estancamiento de rúbricas durante la optimización de políticas. Este checkpoint corresponde al paso 32 de optimización.

El modelo tiene 1.720.574.976 parámetros (aproximadamente 1,72 mil millones) y se distribuye en formato BF16 safetensors. Es un artefacto de investigación académica del grupo HYU-NLP-EVAL, no un modelo pensado para producción. Su relevancia radica en que sirve como punto de auditoría para analizar cómo evoluciona una política cuando la recompensa es una rúbrica fija, un problema común en pipelines de RLHF/GRPO cuando las rúbricas no se actualizan. No se proporcionan datos sobre la longitud de contexto, idiomas soportados ni cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer decoder-only `Qwen/Qwen3-1.7B`, que pertenece a la familia Qwen3. La arquitectura interna (número de capas, cabezas de atención, dimensiones ocultas) no se detalla en la información proporcionada, pero se hereda del modelo base. El entrenamiento se realizó con GRPO, un algoritmo de optimización de políticas que agrupa respuestas para estimar ventajas relativas. La recompensa utilizada fue una rúbrica inicial estática (R0) congelada, específica para cada prompt, en el dominio médico (RaR Medicine). El checkpoint corresponde al paso 32 de entrenamiento, con semilla 11.

No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron otras técnicas como DPO o RLHF adicional. El repositorio incluye pesos, configuración, tokenizador y plantilla de chat, pero excluye optimizador, scheduler, estado del entrenador, rollouts, rúbricas y datos de evaluación. El propósito declarado es servir como artefacto de investigación para estudiar la saturación de recompensas y el estancamiento de rúbricas estáticas.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Qwen3-1.7B.
- Conversación multi-turno mediante la plantilla de chat incluida.
- Generación de respuestas en el dominio médico (RaR Medicine) según el entrenamiento recibido.
- Capacidades de tool calling y function calling: no documentadas en la información proporcionada.
- Soporte para agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no especificadas (dependen del modelo base).
- Modo thinking o capacidades especiales (visión, audio): no documentadas.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el checkpoint permite analizar cómo una política se comporta cuando la recompensa es una rúbrica estática, comparando pasos de entrenamiento para estudiar la saturación de recompensa y el estancamiento de la rúbrica.
- Auditoría de pipelines de RLHF/GRPO: sirve como punto de control para reproducir experimentos y verificar la evolución de la política en dominios específicos como medicina.
- Estudio de la deriva de políticas: con checkpoints en diferentes pasos (por ejemplo, paso 32 frente a otros), se puede medir la divergencia respecto al modelo base y el sobreajuste a la recompensa.
- Evaluación de la calidad de respuestas médicas: aunque no es un dispositivo médico, puede usarse en entornos de investigación para comparar la fluidez y coherencia de respuestas generadas bajo diferentes regímenes de recompensa.
- Desarrollo de métodos de alineación: el checkpoint es útil para probar nuevas métricas de evaluación de alineación o para calibrar detectores de alucinación en dominios especializados.
- Reproducibilidad de experimentos: al ser un checkpoint público con configuración y tokenizador, permite reproducir el estado exacto de la política en el paso 32 y usarlo como baseline en investigaciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 3,5 GB en BF16. Con overhead de KV cache y activaciones, se estima un mínimo de 6-8 GB de VRAM para inferencia en precisión BF16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, por ejemplo NVIDIA RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10, A100 (para mayor throughput).
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más, como RTX 3060, RTX 4060, RTX 4070, RTX 4080, RTX 4090.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF), Ollama (tras conversión) o directamente con la librería `transformers` de Hugging Face.
- Latencia y throughput estimados: no hay datos publicados. En una GPU RTX 4090, un modelo de 1,7B en BF16 suele generar entre 50 y 150 tokens por segundo, dependiendo de la longitud de la secuencia y el batch size. Estos valores son orientativos y no provienen de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,72B | no disponible (según documentación oficial de Qwen3, 32k) | Apache 2.0 | Hugging Face | Modelo base sin fine-tuning RL |
| HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-032 | 1,72B | no disponible | Apache 2.0 | Hugging Face | Checkpoint RL sobre medicina |
| Llama-3.2-1B (referencia) | 1,23B | 128k (según documentación oficial) | Llama 3.2 Community License | Hugging Face | Modelo pequeño de Meta, diferente familia |

No se dispone de resultados de benchmarks comparativos entre estos modelos. La comparación se limita a parámetros, licencia y disponibilidad. El checkpoint analizado es un artefacto de investigación y no está diseñado para competir en tareas generales.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un producto listo para producción. Su propósito es estudiar la dinámica de optimización con rúbricas estáticas, no ofrecer respuestas médicas fiables.
- No es un dispositivo médico y no debe usarse como sustituto de asesoramiento profesional sanitario, tal como advierte la model card.
- El entrenamiento con una rúbrica estática congelada puede provocar sobreajuste a esa recompensa y comportamientos de saturación (reward hacking), lo que puede degradar la calidad de las respuestas fuera del dominio de entrenamiento.
- No se especifican los datos de entrenamiento ni la composición del dataset de medicina, por lo que no se puede evaluar el sesgo potencial en las respuestas.
- La longitud de contexto y los idiomas soportados no están documentados, lo que limita su uso en aplicaciones multilingües o con contextos largos.
- Solo se distribuye en BF16 safetensors; no hay versiones cuantizadas (GGUF, INT8, etc.) disponibles en el repositorio.
- Ausencia de benchmarks públicos: no hay métricas objetivas de rendimiento (MMLU, HumanEval, GSM8K, etc.) que permitan comparar su calidad con otros modelos.
- El checkpoint corresponde a un paso intermedio (step 32) de un experimento; su comportamiento puede no ser representativo del modelo final o de la política óptima.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-032
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
