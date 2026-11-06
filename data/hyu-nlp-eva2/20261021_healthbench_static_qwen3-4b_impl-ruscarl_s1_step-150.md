# HYU-NLP-EVA2/20261021_healthbench_static_qwen3-4b_impl-ruscarl_s1_step-150

## Resumen

Este repositorio contiene un checkpoint de entrenamiento intermedio (step 150) del modelo Qwen3-4B-Instruct-2507, afinado por el grupo HYU-NLP-EVA2 dentro de un pipeline experimental de aprendizaje por refuerzo con verificación de recompensa (RLVR) aplicado al dominio sanitario. El identificador del repositorio indica el uso del framework RUSCARL y del conjunto de evaluación HealthBench en su variante estática, por lo que el checkpoint está orientado a mejorar el razonamiento clínico del modelo base mediante optimización con señales de recompensa derivadas de evaluaciones médicas.

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 262.144 tokens y licencia Apache 2.0. Sobre esa base, el entrenamiento de refuerzo no altera la arquitectura ni el tamaño del modelo, sino únicamente los pesos, que se han optimizado para tareas de salud evaluadas con HealthBench.

Es relevante porque documenta un caso concreto de RL aplicado a un modelo pequeño (4B) en un dominio de alto riesgo como es el sanitario, y porque el repositorio preserva el estado completo del entrenamiento (pesos, optimizador, RNG y dataloader cuando están presentes) en lugar de exportar un modelo listo para inferencia. Esto lo convierte en material útil para reproducibilidad e investigación, pero no en un artefacto desplegable directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), decoder-only, con atención completa y modo de razonamiento |
| Parametros totales | Aproximadamente 4.000 millones (heredados de Qwen3-4B-Instruct-2507) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base (no confirmado tras el afinado) |
| Tipos de cuantizacion | No disponible en el repositorio; el modelo base admite GGUF, AWQ y GPTQ en la práctica |
| Idiomas soportados | No disponibles en la model card; el modelo base Qwen3 es multilingüe (más de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint FSDP/VERL original (no safetensors fusionado ni GGUF); requiere conversión con el merger de VERL |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer decoder-only denso con atención por cabezas agrupadas (GQA), normalización RMSNorm y activación SwiGLU, entrenado por Alibaba Qwen con un corpus multilingüe masivo y posteriormente alineado mediante instrucciones y preferencias. El checkpoint aquí publicado no modifica esa arquitectura; solo contiene los pesos resultantes del proceso de RL.

El entrenamiento se ha realizado con RUSCARL (según el identificador del repositorio), un esquema de aprendizaje por refuerzo con recompensas verificables orientado a dominios con criterios de evaluación objetivos. La señal de recompensa proviene de HealthBench en su variante estática, un benchmark de conversaciones clínicas con rúbricas de evaluación por criterios. El repositorio corresponde al step 150 de la primera etapa (s1) del pipeline. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de RL, ni si se aplicaron etapas adicionales de DPO o RLHF más allá del propio RLVR.

El aspecto técnico más relevante es la preservación del estado completo de entrenamiento: el manifiesto `checkpoint_manifest.json` incluye tamaño en bytes y SHA-256 de cada fichero, y se conservan estados de optimizador, RNG y dataloader cuando existen en la instantánea local. Los pasos tempranos, como este step 150, suelen contener solo los pesos del modelo y no constituyen checkpoints completos para reanudar el entrenamiento. Para inferencia es imprescindible convertir el directorio `actor/` con el merger de modelo FSDP de VERL; el repositorio no es un export de Transformers ni de vLLM.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento clínico y respuesta a preguntas de salud, presumiblemente reforzado mediante RL con recompensas de HealthBench (no verificado con evaluaciones publicadas).
- Modo de razonamiento (thinking mode) del modelo base Qwen3, activable o desactivable según la configuración de inferencia.
- Soporte de tool calling y function calling, heredado del modelo base.
- Capacidades multilingües del modelo base (más de 100 idiomas según Qwen), aunque la model card no las documenta para este checkpoint.
- Generación de código y matemáticas a nivel de un modelo de 4B, sin datos específicos de este checkpoint.

## Casos de uso

- Investigación en RL para dominios sanitarios: el checkpoint permite reproducir y analizar la evolución del entrenamiento con recompensas de HealthBench, comparando el step 150 con el modelo base y con pasos posteriores.
- Evaluación de metodologías RLVR: sirve como punto de comparación para estudiar cómo afecta RUSCARL a un modelo de 4B en tareas con rúbricas verificables, midiendo la ganancia respecto a Qwen3-4B-Instruct-2507.
- Estudio de la dinámica de entrenamiento: al conservar estados de optimizador y RNG cuando están presentes, permite inspeccionar trayectorias de actualización de pesos y diagnosticar inestabilidades.
- Base para experimentos de destilación o merging: los pesos del step 150 pueden fusionarse con otros checkpoints para explorar técnicas de model merging en el dominio clínico.
- Generación de respuestas clínicas de apoyo (con supervisión humana): tras la conversión a un formato de inferencia, podría emplearse en entornos de simulación para generar borradores de respuestas a preguntas médicas, siempre con validación por profesionales.
- Docencia y formación en NLP aplicado a salud: útil como ejemplo práctico de pipeline completo (entrenamiento RL, checkpoints intermedios, evaluación con HealthBench) en cursos de posgrado o talleres técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo para pesos, más overhead de KV cache; en la práctica, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB; en 4 bits (GGUF Q4_K_M), alrededor de 2,5-3 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 para FP16; RTX 3090/4080 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores con cuantización, y en RTX 4090 sin cuantizar con contextos moderados.
- Opciones de despliegue: primero es obligatorio convertir el checkpoint con el merger FSDP de VERL; después puede servirse con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama.
- Latencia y throughput: no disponibles para este checkpoint; en el modelo base Qwen3-4B se sitúan en decenas de tokens por segundo en GPU de consumo y cientos en A100/H100 con vLLM, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Este checkpoint (step 150) | ~4B | 262.144 (base) | Apache 2.0 | Checkpoint de entrenamiento, no export de inferencia | Requiere conversión VERL |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | 262.144 | Apache 2.0 | Modelo base listo para inferencia | Referencia directa; sin RL sanitario |
| Qwen/Qwen3-4B-Thinking-2507 | ~4B | 262.144 | Apache 2.0 | Modelo con razonamiento extendido | Alternativa oficial de Qwen con modo thinking reforzado |
| Meta Llama 3.2 3B Instruct | ~3B | 131.072 | Llama 3.2 Community License | Modelo listo para inferencia | Menor contexto y licencia más restrictiva |

## Limitaciones y advertencias

- No es un modelo listo para producción: el repositorio contiene checkpoints FSDP/VERL originales y exige conversión con el merger correspondiente antes de cualquier inferencia.
- El step 150 puede contener solo los pesos del modelo, sin estados de optimizador ni RNG, por lo que no sirve para reanudar el entrenamiento de forma completa.
- No hay evaluaciones publicadas de este checkpoint; se desconoce si el RL con HealthBench mejora, degrada o deja intactas las capacidades del modelo base.
- Riesgo de alucinación clínica: cualquier uso en salud requiere supervisión profesional y no debe emplearse para decisiones diagnósticas o terapéuticas.
- Sesgos heredados del modelo base Qwen3 y del corpus de HealthBench, que puede no representar poblaciones ni sistemas sanitarios diversos.
- La model card no documenta idiomas soportados tras el afinado; el entrenamiento con HealthBench (en inglés) podría haber degradado el rendimiento multilingüe del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del checkpoint y la ausencia de validación desaconsejan su despliegue directo en productos sanitarios.
- El tamaño del repositorio (17,7 GB) incluye estados de entrenamiento, no solo pesos, lo que complica su distribución y almacenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HYU-NLP-EVA2/20261021_healthbench_static_qwen3-4b_impl-ruscarl_s1_step-150
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- HealthBench (OpenAI): https://openai.com/index/healthbench/
- VERL (framework de RL para LLMs): https://github.com/volcengine/verl
- Qwen3 (blog técnico): https://qwenlm.github.io/blog/qwen3/
