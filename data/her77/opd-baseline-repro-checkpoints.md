# Her77/opd-baseline-repro-checkpoints

## Resumen

El repositorio `Her77/opd-baseline-repro-checkpoints` contiene los checkpoints generados por el proyecto `opd-baseline-repro`, un overlay reproducible del baseline *response-only* del método OPD (On-Policy Distillation) desarrollado por el grupo THUNLP. Este baseline entrena un modelo estudiante (Qwen2.5-3B-Instruct) mediante destilación on-policy desde un modelo profesor, utilizando aprendizaje por refuerzo con un curriculum de tareas en el entorno AlfWorld. El objetivo es validar y reproducir de forma fiable los resultados publicados por THUNLP/OPD, fijando versiones de código, runtime y datos de entrenamiento.

El repositorio almacena 81,5 GB de pesos en formato safetensors, con acceso restringido (gated) en HuggingFace. Está pensado para investigadores que necesitan reproducir el pipeline completo de OPD, incluyendo la fase de entrenamiento de tres pasos y el entrenamiento completo, en entornos multi-GPU. Su relevancia radica en que proporciona una base verificable para estudiar la destilación on-policy en agentes de razonamiento y toma de decisiones, un área activa en IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5, basada en el modelo base Qwen/Qwen2.5-3B-Instruct) |
| Parametros totales | 3 000 millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B-Instruct, tipicamente 32 768 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y chino, pero no se especifica para estos checkpoints) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar. El entrenamiento sigue el paradigma de destilación on-policy (OPD): un modelo profesor genera respuestas en el entorno AlfWorld, y el modelo estudiante (Qwen2.5-3B-Instruct) se entrena mediante aprendizaje por refuerzo para imitar esas respuestas, pero solo sobre las respuestas (response-only), no sobre los razonamientos intermedios. El pipeline incluye un curriculum de tareas y una fase de validación multi-GPU. No se han publicado detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO; la información disponible se limita a la descripción del repositorio de reproducción.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-3B-Instruct, incluyendo generación de texto coherente y razonamiento básico.
- Razonamiento multi-paso: el entrenamiento con OPD en AlfWorld implica tareas de navegación y manipulación de objetos, lo que sugiere capacidad para razonamiento secuencial en entornos simulados.
- Aprendizaje por refuerzo: el modelo está entrenado para optimizar recompensas en tareas de interacción con el entorno, lo que lo hace adecuado para agentes que ejecutan acciones.
- Soporte de tool calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes: orientado a agentes que operan en AlfWorld, un entorno de simulación de tareas domésticas.
- Capacidades multilingües: no especificadas para estos checkpoints; el modelo base soporta principalmente inglés y chino.
- Capacidades especiales: no se documentan modos de thinking, visión ni audio.

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio está diseñado para reproducir exactamente el baseline OPD de THUNLP, permitiendo a investigadores verificar resultados y comparar variantes.
- Estudio de destilación on-policy: permite analizar cómo el estudiante aprende de las respuestas del profesor en entornos de interacción, útil para investigar eficiencia de muestreo y transferencia de conocimiento.
- Desarrollo de agentes para entornos simulados: el modelo puede servir como punto de partida para agentes que operan en AlfWorld o entornos similares, evaluando su capacidad de planificación y ejecución de acciones.
- Benchmarking de algoritmos de RL: al ser un baseline reproducible, se puede usar como referencia para comparar nuevos algoritmos de aprendizaje por refuerzo en tareas de navegación y manipulación.
- Validación de infraestructura multi-GPU: el repositorio incluye launchers para entrenamiento en múltiples GPUs, útil para probar configuraciones de hardware y software.
- Investigación en curriculum learning: el pipeline incluye curriculum de tareas, lo que permite estudiar el efecto de la ordenación de tareas en el rendimiento final del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento (como éxito en AlfWorld, MMLU, HumanEval, etc.) en la documentación accesible. Se recomienda consultar el repositorio original THUNLP/OPD para obtener datos comparativos, aunque no están disponibles en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende de la cuantización; el modelo base de 3B en FP16 requiere aproximadamente 6-8 GB de VRAM, pero no se especifica para estos checkpoints).
- GPU recomendadas: el entrenamiento multi-GPU sugiere al menos 2 GPUs con 24 GB de VRAM cada una (por ejemplo, RTX 3090, RTX 4090, A10G o A100). Para inferencia, una GPU con 8-12 GB de VRAM podría ser suficiente en FP16.
- Compatibilidad con GPU de consumo: sí, una RTX 3060 de 12 GB o superior podría ejecutar inferencia en FP16, aunque el entrenamiento completo requeriría GPUs de mayor capacidad.
- Opciones de despliegue: al ser checkpoints de entrenamiento, no se proporcionan configuraciones de inferencia específicas. Se puede usar transformers con `from_pretrained` o exportar a GGUF para llama.cpp/Ollama, pero no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos. El modelo base Qwen2.5-3B-Instruct se puede comparar con otros modelos de 3B como Llama-3.2-3B o Phi-3-mini, pero los checkpoints OPD son específicos para el entorno AlfWorld y no se han publicado métricas comparativas. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated en HuggingFace, por lo que se requiere aceptar condiciones de uso antes de descargar.
- Licencia no especificada: no se indica la licencia, lo que impide conocer restricciones de uso comercial o modificación.
- Sesgos y alucinaciones: no se han evaluado; el modelo base Qwen2.5 puede presentar sesgos típicos de los modelos entrenados con datos web, y el entrenamiento en AlfWorld no corrige estos problemas.
- Limitaciones de contexto: no se especifica la longitud de contexto de los checkpoints; se asume la del modelo base (32 768 tokens), pero no está confirmado.
- Riesgo de sobreajuste al entorno: al estar entrenado específicamente para AlfWorld, el modelo puede no generalizar bien a otras tareas o entornos.
- Tamaño del repositorio: 81,5 GB, lo que requiere espacio de almacenamiento significativo y ancho de banda para la descarga.
- Falta de documentación técnica: no se proporcionan detalles sobre hiperparámetros, número de pasos de entrenamiento ni configuración exacta del curriculum, lo que limita la reproducibilidad fuera del overlay proporcionado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Her77/opd-baseline-repro-checkpoints
- Repositorio GitHub del overlay: https://github.com/Sisyphe-lee/opd-baseline-repro
- README del overlay: https://github.com/Sisyphe-lee/opd-baseline-repro/blob/main/README.md
- Repositorio original THUNLP/OPD: no disponible en la información proporcionada (se menciona en el README del overlay, pero no se incluye la URL directa)
