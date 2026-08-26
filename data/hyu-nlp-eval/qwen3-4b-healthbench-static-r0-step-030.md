# HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-030

## Resumen

Este checkpoint, `HYU-NLP-EVAL/qwen3-4b-healthbench-static-r0-step-030`, es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por HYU-NLP-EVAL como parte de un experimento de investigación sobre optimización de políticas con aprendizaje por refuerzo (RL). Se trata del paso 30 de un entrenamiento que utiliza una rúbrica estática específica para cada prompt del benchmark HealthBench, en lugar de rúbricas dinámicas. El modelo parte de la base `Qwen/Qwen3-4B-Instruct-2507` y se publica con licencia Apache 2.0, en formato `safetensors` y con pesos en BF16.

El objetivo del proyecto es estudiar la "obsolescencia" de las rúbricas proxy durante la optimización de políticas, es decir, cómo evoluciona el rendimiento cuando las recompensas se fijan de antemano. No se trata de un modelo médico ni de un producto clínico, sino de un artefacto de investigación para analizar el comportamiento de RL en dominios sanitarios. Su relevancia actual radica en que HealthBench es un benchmark de referencia para medir seguridad y rendimiento en conversaciones clínicas, y este checkpoint contribuye a entender los límites de los métodos de RL basados en rúbricas estáticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, basada en Qwen3) |
| Parametros totales | 4.022.468.096 (4.02B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | BF16 (exportación oficial); no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponibles (el modelo base Qwen3 soporta multilingüismo, pero no se especifica para este checkpoint) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento
El modelo es un fine-tune completo de `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only con atención causal. El entrenamiento se realizó con aprendizaje por refuerzo (RL) de modelo completo, con un optimizador que aplica 30 actualizaciones de política. La recompensa proviene de una rúbrica estática específica para cada prompt (`R0(x)`), congelada durante todo el proceso. El conjunto de entrenamiento de políticas consta de 256 prompts de HealthBench, y la ejecución se identifica como `pilot-static-r0-100step-20260821`.

La configuración técnica usa VERL FSDP v1 con world size 1 y state dict FP32, exportado posteriormente a BF16. No se han documentado innovaciones arquitectónicas adicionales; el interés del experimento está en la metodología de RL con rúbricas estáticas, no en cambios estructurales del modelo.

## Capacidades
- Generación de texto conversacional en el dominio de salud, con respuestas a preguntas clínicas y de pacientes.
- Razonamiento en escenarios médicos de múltiples turnos, entrenado con conversaciones de HealthBench.
- Soporte de tool calling y function calling: no se menciona en la información disponible; el modelo base Qwen3 sí lo soporta, pero no está confirmado para este checkpoint.
- Capacidades multilingües: no confirmadas para este checkpoint específico; el modelo base Qwen3 es multilingüe.
- No incluye capacidades de visión, audio ni modo de pensamiento explícito (thinking mode) según la documentación.

## Casos de uso
- Investigación en seguridad de IA clínica: permite estudiar cómo el RL con rúbricas estáticas afecta a la calidad de respuestas médicas en comparación con rúbricas dinámicas, útil para laboratorios de investigación en alineación.
- Desarrollo de agentes conversacionales de salud: puede servir como punto de partida para fine-tune adicionales en entornos sanitarios de baja escala, aunque requiere validación clínica.
- Evaluación de benchmarks sanitarios: se puede utilizar para reproducir experimentos de RL sobre HealthBench y comparar el efecto de la congelación de rúbricas.
- Análisis de estabilidad del entrenamiento RL: investigadores pueden estudiar cómo cambia la política a lo largo de los pasos de optimización usando los checkpoints intermedios.
- Generación de datos sintéticos de conversación médica: el modelo puede generar diálogos hipotéticos que luego se etiquetan y revisan por expertos.
- Educación y formación de profesionales sanitarios: como generador de casos clínicos simulados para prácticas de diagnóstico, siempre con supervisión humana.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El modelo card indica explícitamente que la mejora en la recompensa de rúbrica estática no establece por sí sola una mejora contra la verdad de terreno independiente de HealthBench. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks comparativos.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo tiene 4,02B parámetros en BF16, lo que ocupa aproximadamente 8 GB de memoria solo para pesos. Con overhead de activaciones, se recomienda al menos 12-16 GB de VRAM para inferencia cómoda en secuencias largas.
- GPU recomendadas: RTX 4090 (24 GB) o A100 (40 GB) para inferencia sin cuantización adicional; en GPUs de 8 GB podría usarse con cuantización de 8 bits o 4 bits, aunque no se documenta compatibilidad oficial.
- Sí cabe en GPUs de consumo como RTX 4070 Ti (12 GB) con cuantización, pero no está optimizado para ello.
- Opciones de despliegue: compatible con Hugging Face Transformers (carga directa con `AutoModelForCausalLM`), y puede desplegarse con vLLM, TGI o llama.cpp mediante conversión a GGUF (no incluido).
- Latencia y throughput: no disponible; depende del hardware y del framework de inferencia.

## Comparativa con modelos similares
No disponible de forma directa. Se puede comparar con el modelo base `Qwen/Qwen3-4B-Instruct-2507`, que es el punto de partida y no ha sufrido el entrenamiento RL sobre HealthBench. Otras alternativas de tamaño similar (4-5B) como Llama-3.2-3B o Ministral-4B tienen arquitecturas y licencias distintas, pero no hay datos de rendimiento comparado en HealthBench para este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Apache 2.0 | Modelo instruct sin RL sobre HealthBench |
| HYU-NLP-EVAL/qwen3-4b-healthbench-static-rl-step-030 | 4,02B | no disponible | Apache 2.0 | Fine-tune RL con rúbrica estática |
| Llama-3.2-4B | 4B | 128k | Llama 3.2 | Alternativa de 4B, sin fine-tune específico |

## Limitaciones y advertencias
- No es un dispositivo médico: el modelo card advierte explícitamente que no debe usarse como sustituto de consejo médico profesional.
- La mejora en la recompensa de rúbrica estática no implica necesariamente un mejor rendimiento en HealthBench real; hay riesgo de sobreajuste a la rúbrica congelada.
- No se documentan sesgos específicos, pero el modelo hereda los sesgos del modelo base Qwen3-4B-Instruct-2507 y del dataset HealthBench, que puede no ser representativo de todas las poblaciones.
- Riesgo de alucinación en temas médicos: al ser un modelo de lenguaje general sin validación clínica, puede generar información incorrecta o peligrosa.
- Limitación de idioma: no se confirma el soporte multilingüe del checkpoint; el modelo base es multilingüe, pero el entrenamiento RL sobre HealthBench (en inglés) puede afectar el comportamiento en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el uso médico requiere validación adicional y cumplimiento normativo (no es un dispositivo médico).
- Solo se ha publicado un paso intermedio (step 30 de 100); el comportamiento puede variar en pasos posteriores.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-healthbench-static-rl-step-030
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper de HealthBench: https://arxiv.org/abs/2505.08775
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
