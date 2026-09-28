# davidheineman/opd-teacher-Q2.5I-CapitalCityEffect-step149

## Resumen

opd-teacher-Q2.5I-CapitalCityEffect-step149 es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por David Heineman como parte de un experimento de destilación on-policy (OPD, on-policy distillation). El modelo actúa como "profesor" dentro de un conjunto de 32 entornos de entrenamiento con recompensas verificables, y en concreto fue entrenado sobre el entorno `CapitalCityEffect` en dificultad 0. No es un modelo de propósito general: es un artefacto de investigación diseñado para generar trayectorias que después se destilan en modelos estudiantes.

El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) durante 150 actualizaciones, y el repositorio publica el checkpoint final con indexación basada en cero (`step149`, es decir, la actualización número 150). Los pesos se convirtieron desde el checkpoint nativo a safetensors y se validaron contra los nombres y formas de tensor del modelo base. El resultado es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) con licencia Apache 2.0 y repositorio de 3,1 GB.

Su relevancia es metodológica más que de producto: forma parte del conjunto de profesores RLVE (Reinforcement Learning with Verifiable Environments) asociado al paper arXiv:2511.07317, que estudia cómo entrenar profesores especializados por entorno y destilarlos después. Para desarrolladores, el interés práctico está en reproducir o extender el pipeline de RL y destilación, no en desplegarlo como asistente generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (modelo base: Qwen/Qwen2.5-1.5B-Instruct); detalles de configuración (capas, cabezas, GQA) no disponibles en la información proporcionada |
| Parametros totales | 1.543.714.304 (≈1,54 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada para este checkpoint (el modelo base Qwen2.5-1.5B-Instruct documenta hasta 32.768 tokens en su propia model card) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en precisión completa (safetensors). No se han publicado versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.543.714.304 parámetros. Sobre esa base no se aplicó ninguna modificación estructural: el trabajo consiste en un ajuste por aprendizaje por refuerzo que conserva íntegramente los nombres y las formas de los tensores del modelo original, tal y como se verificó durante la conversión a safetensors.

El método de entrenamiento es GRPO sobre el entorno `CapitalCityEffect` con dificultad 0, durante 150 actualizaciones (el checkpoint `step149` es el último, con indexación basada en cero). No se especifica en la información disponible el número de tokens consumidos, la composición del dataset, ni si hubo fases previas de SFT, DPO o RLHF. El modelo se enmarca en la iniciativa RLVE del autor, cuyo paper asociado es arXiv:2511.07317, y pertenece a una colección de profesores entrenados sobre 32 de los 400 entornos del proyecto. La innovación técnica relevante no está en la arquitectura, sino en el uso del modelo como profesor dentro de un esquema de destilación on-policy: se generan trayectorias con este checkpoint y se usan como señal de supervisión para modelos estudiantes.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-1.5B-Instruct.
- Ejecución de la tarea específica del entorno `CapitalCityEffect`, que da nombre al checkpoint. El detalle exacto de la tarea (reglas, formato de respuesta, esquema de recompensa) no se describe en la información proporcionada.
- Generación de trayectorias para destilación on-policy: es la función principal del modelo dentro del pipeline RLVE/OPD.
- Soporte de tool calling / function calling: no documentado para este checkpoint. El modelo base lo soporta, pero el ajuste con GRPO sobre un único entorno puede haber degradado esa capacidad y no se ha publicado ninguna evaluación al respecto.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: el modelo está etiquetado únicamente como `en`; no se declara soporte de otros idiomas.
- Capacidades especiales (vision, audio, modo thinking explícito, decodificación especulativa): no disponibles / no documentadas.

## Casos de uso

- Generación de datos sintéticos para destilación: el modelo se usa como profesor que produce trayectorias sobre `CapitalCityEffect`, que después se emplean para entrenar un modelo estudiante más pequeño mediante destilación on-policy. Es su propósito declarado.
- Reproducción de experimentos de RL con recompensas verificables: sirve como punto de partida para replicar el entrenamiento GRPO de 150 actualizaciones descrito en el run de W&B, útil en investigación sobre estabilidad y dinámica de aprendizaje.
- Estudio del sobreajuste a un único entorno: al haberse entrenado exclusivamente sobre un entorno a dificultad 0, es un caso de estudio controlado para medir cuánto se especializa un modelo de 1,5B y qué capacidades generales pierde.
- Baseline en experimentos de comparación de profesores: dentro de la colección RLVE OPD Teachers, permite comparar el comportamiento de un profesor entrenado sobre `CapitalCityEffect` frente a los otros 31 entornos.
- Inicialización para ajustes posteriores: al conservar la estructura de tensores del modelo base, puede cargarse como checkpoint de partida para nuevos entrenamientos con GRPO u otras técnicas, siempre que se respete la licencia Apache 2.0.
- Inferencia local de bajo coste para pruebas de pipeline: con 1,54B parámetros cabe en GPUs de consumo, lo que permite validar rápidamente el formateo de prompts, el parseo de respuestas y la integración con frameworks de RL antes de escalar a modelos mayores.
- Validación de infraestructura de entrenamiento: útil para comprobar que un stack de RL (generación, verificación de recompensas, actualización de política) funciona de extremo a extremo sin necesidad de clústeres grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia el run de W&B `a6b44439` del grupo de barrido `opd-teachers-20260927-191939`, sin incluir métricas numéricas, y el repositorio registra 0 descargas y 0 likes, por lo que no existen evaluaciones de terceros. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada para este checkpoint.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parámetros (1.543.714.304). No proceden de mediciones publicadas por el autor, que no documenta latencia ni throughput.

- VRAM en FP16/BF16: aproximadamente 3,1 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica entre 4 y 6 GB según longitud de contexto y tamaño de lote.
- VRAM en INT8: aproximadamente 1,6 GB de pesos; en torno a 2,5-3,5 GB con overhead.
- VRAM en INT4: aproximadamente 0,8-0,9 GB de pesos; en torno a 1,5-2,5 GB con overhead. Requiere cuantización por parte del usuario, ya que no se publican pesos cuantizados.
- Cabe en GPU de consumo: sí. Es viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de 8 GB si se cuantiza. También es ejecutable en CPU mediante llama.cpp u Ollama tras convertir los pesos a GGUF.
- GPU de centro de datos (A100, H100, L40S): compatibles y sobredimensionadas para inferencia; su interés aquí es el entrenamiento, dado que GRPO requiere generar muestras y actualizar la política, lo que multiplica los requisitos de memoria respecto a la inferencia.
- Opciones de despliegue: transformers (formato publicado), vLLM y TGI (soportan la arquitectura Qwen2), y llama.cpp/Ollama mediante conversión a GGUF. El repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus respectivas model cards públicas y no forman parte de la información proporcionada sobre este modelo; se incluyen como referencia de categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| opd-teacher-Q2.5I-CapitalCityEffect-step149 | 1,54B | No disponible en la información (base: 32.768) | Apache 2.0 | Hugging Face, safetensors |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Hugging Face, safetensors y GGUF; ampliamente desplegado |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 | Licencia comunitaria de Llama 3.2 (con restricciones) | Hugging Face, safetensors y GGUF |
| google/gemma-2-2b-it | 2,61B | 8.192 | Gemma Terms of Use | Hugging Face, safetensors y GGUF |

La diferencia fundamental no es de rendimiento, sino de propósito: los tres alternativos son asistentes generalistas con evaluaciones publicadas, mientras que este checkpoint es un profesor especializado en un único entorno, sin benchmarks ni garantías de comportamiento fuera de él. Su ventaja es la reproducibilidad del pipeline RLVE; su desventaja, la ausencia total de datos comparativos de calidad.

## Limitaciones y advertencias

- Especialización extrema: 150 actualizaciones de GRPO sobre un único entorno a dificultad 0 implican un riesgo alto de sobreajuste y de olvido catastrófico de las capacidades generales del modelo base.
- Sin benchmarks: no existe ninguna evaluación publicada de MMLU, generación de código, matemáticas, seguridad o seguimiento de instrucciones para este checkpoint.
- Idiomas: etiquetado exclusivamente como `en`. No hay evidencia de funcionamiento correcto en castellano ni en otros idiomas.
- Alucinación: al ser un modelo de 1,5B ajustado con RL sobre una tarea concreta, la propensión a generar contenido plausible pero incorrecto fuera del entorno de entrenamiento es elevada y no está medida.
- Capacidades de tool calling, agentes y razonamiento multi-paso: no documentadas y potencialmente degradadas por el ajuste. No deben asumirse en producción.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o alineación para este checkpoint; hereda los del modelo base sin que se haya aplicado ninguna salvaguarda adicional conocida.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones de royalties, pero el autor conserva el aviso de que la licencia original de Qwen se incluye en el fichero `LICENSE` del repositorio.
- Advertencia de producción: con 0 descargas y 0 likes, no hay validación comunitaria. No se recomienda su uso como componente crítico sin una evaluación propia previa.
- Trazabilidad: el modelo depende de un run de W&B y de un repositorio de código externos; si estos desaparecen, se pierde parte del contexto de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-CapitalCityEffect-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/a6b44439
- Código de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper asociado: https://arxiv.org/abs/2511.07317
- Perfil del autor: https://huggingface.co/davidheineman
