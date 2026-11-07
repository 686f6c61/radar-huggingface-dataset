# dddddsds31341/RLinf-RECAP-Franka-Bread-Value-Step-2000

## Resumen

RLinf-RECAP-Franka-Bread-Value-Step-2000 es un checkpoint de inferencia publicado en Hugging Face por el usuario dddddsds31341. No es un modelo de lenguaje ni una política de acciones robóticas: es un modelo de valor (crítico) entrenado para puntuar observaciones dentro del pipeline RLinf RECAP, asociado a una tarea de manipulación con un brazo Franka sobre el objeto "bread". El checkpoint corresponde al paso de optimizador 2000 de una ejecución de 2000 pasos del experimento recap-bread-value-g4-20261106-v1.

El modelo combina un codificador visual SigLIP2, un backbone de lenguaje Gemma3-270M y una cabeza de valor de 201 bins definida sobre el intervalo [-1, 0]. Su función es estimar retornos normalizados para observaciones compuestas por imágenes y prompt, lo que lo hace útil únicamente como componente de evaluación o entrenamiento dentro del ecosistema RLinf, no como modelo autónomo.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados. El propio autor advierte que no se incluye ningún loader genérico de Transformers, que los assets de SigLIP2, Gemma3 y el tokenizer deben obtenerse por separado y que no se reclama ninguna tasa de éxito robótica ni capacidad de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador visual SigLIP2 + backbone de lenguaje Gemma3-270M + cabeza de valor de 201 bins sobre [-1, 0] |
| Parametros totales | no disponible (el backbone Gemma3 aporta 270M; el total del conjunto no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en full_weights.pt, formato PyTorch) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (los componentes base conservan sus licencias originales) |
| Formato de pesos | PyTorch (full_weights.pt); sin safetensors ni GGUF |
| Tamano del repositorio | 1.8 GB |
| Pipeline declarado | robotics |
| Libreria | pytorch |
| Paso de optimizador | 2000 (ejecución de 2000 pasos) |
| Split de entrenamiento | 270 episodios / 57472 frames |
| Split de validación | 30 episodios / 6213 frames |
| Rango de retorno de entrenamiento | [-554.0, 0.0] |
| Estado incluido | Solo state dict de evaluación; sin optimizador, scheduler ni RNG |

## Arquitectura y entrenamiento

La arquitectura es un modelo de valor para aprendizaje por refuerzo en robótica. La entrada se procesa con SigLIP2 para las imágenes y con Gemma3-270M para la componente textual del prompt; la salida se discretiza en una cabeza de 201 bins definida sobre el intervalo [-1, 0], lo que permite estimar un retorno normalizado mediante una distribución categórica. El autor indica explícitamente que se debe seguir la implementación y el preprocesado del modelo de valor de RLinf RECAP, y que las rutas locales de SigLIP, Gemma y el tokenizer deben adaptarse, ya que esos assets se distribuyen por separado.

El entrenamiento se realizó sobre el split registrado de 270 episodios y 57472 frames, con validación sobre 30 episodios y 6213 frames. Las estadísticas de retorno se conservan en `return_stats.json`, con un rango de entrenamiento de [-554.0, 0.0], que es el que debe usarse para la normalización en evaluación. El repositorio incluye `config.yaml` con el modelo y el nombre del archivo de pesos archivado, `training_config.yaml` con la instantánea Hydra original, `train_info.json`, `val_info.json` y `code.zip`, que corresponde a la release existente recap-bread-value-20261106-v2-code.zip. No se documenta el número total de tokens de entrenamiento, la composición del dataset más allá de los episodios, ni si hubo RLHF o DPO; tampoco se describe ninguna innovación técnica adicional como decodificación especulativa o atención lineal.

## Capacidades

- Puntuación de observaciones: estima un valor o retorno normalizado a partir de imágenes y un prompt, actuando como crítico dentro del pipeline RLinf RECAP.
- Procesamiento multimodal de entrada: combina codificación visual con SigLIP2 y procesamiento textual con Gemma3-270M.
- Salida discreta sobre 201 bins en el intervalo [-1, 0], apta para normalización con las estadísticas de retorno incluidas.
- Integración con el código de RLinf RECAP: el repositorio incluye `code.zip` con la implementación de referencia del modelo de valor.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso de propósito general.
- No se declaran capacidades multilingües.
- No es una política de acciones: no genera comandos motores para el robot.

## Casos de uso

- Evaluación de políticas en RLinf RECAP: el checkpoint puntúa observaciones durante la evaluación de una política Franka sobre la tarea "bread", usando el rango de retorno [-554.0, 0.0] para normalizar las estimaciones.
- Crítico en entrenamiento por refuerzo: puede emplearse como modelo de valor congelado para calcular ventajas o retornos en fases de ajuste posteriores, siempre con la implementación de RLinf RECAP.
- Reproducción de experimentos: combinado con `training_config.yaml` y `return_stats.json`, permite reproducir el estado de evaluación del paso 2000 del experimento recap-bread-value-g4-20261106-v1.
- Validación de preprocesado: sirve para verificar que el pipeline de imágenes y prompts (SigLIP2, Gemma3 y tokenizer) produce entradas coherentes antes de desplegar modelos de valor propios.
- Depuración de recompensas: al puntuar observaciones con un valor escalar normalizado, ayuda a inspeccionar si las trayectorias del robot reciben estimaciones plausibles dentro del rango de entrenamiento.
- Investigación en robótica con Franka: referencia para estudiar modelos de valor multimodales de pequeño tamaño (backbone de 270M) en tareas de manipulación, sin necesidad de infraestructura de gran escala.
- Comparación de checkpoints: al ser un estado intermedio (paso 2000 de 2000), permite contrastar su comportamiento con otros checkpoints del mismo experimento si se publican.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reclama tasa de éxito robótica ni capacidad de generalización, y no se proporcionan métricas de MMLU, HumanEval, GSM8K ni de evaluación robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 1.8 GB, por lo que los pesos en precisión original podrían caber en GPUs de consumo con 8-12 GB, pero el total depende de los assets separados de SigLIP2 y Gemma3-270M y del código de preprocesado.
- GPU recomendadas: no disponibles; por el tamaño del backbone (270M) y del codificador visual, una GPU de consumo media podría ser suficiente, aunque no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, pero no está verificado ni documentado.
- Opciones de despliegue: no se ofrece loader genérico de Transformers; es necesario usar la implementación de RLinf RECAP incluida en `code.zip` y adaptar las rutas locales de SigLIP, Gemma y tokenizer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RECAP-Franka-Bread-Value-Step-2000 | Modelo de valor (crítico) para robótica | no disponible (backbone 270M) | no disponible | no disponible | Hugging Face, 0 descargas |
| Franka-Wipe-Whiteboard-pi05-step-5000 | Política de acciones OpenPI/Orbax | no disponible | no disponible | no disponible | Hugging Face |
| Franka-Tennis-pi05-step-5000 | Política de acciones OpenPI/Orbax | no disponible | no disponible | no disponible | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y comparten el ecosistema Franka, pero son políticas de acción con checkpoints Orbax, no modelos de valor; la comparación directa de rendimiento no es posible con la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una política: solo puntúa observaciones; no genera texto ni acciones.
- Sin licencia declarada: no se especifican condiciones de uso comercial; los componentes base (SigLIP2, Gemma3) conservan sus licencias originales, que deben revisarse por separado.
- Sin loader estándar: no funciona con AutoModel de Transformers; requiere la implementación de RLinf RECAP y assets externos (SigLIP, Gemma, tokenizer) con rutas adaptadas manualmente.
- Estado incompleto para reanudar entrenamiento: no incluye optimizador, scheduler ni RNG.
- Normalización obligatoria: debe usarse el rango de retorno de entrenamiento [-554.0, 0.0] de `return_stats.json`; ignorarlo produce estimaciones inválidas.
- Sin garantías de rendimiento: el autor no reclama tasa de éxito ni generalización; no hay benchmarks publicados.
- Riesgo de sobreajuste al dominio: entrenado sobre 270 episodios de una tarea concreta (Franka, "bread"); su validez fuera de ese dominio no está demostrada.
- Sesgos y alucinación: no documentados; al ser un modelo de valor, el riesgo se manifiesta como estimaciones de retorno sesgadas, no como texto inventado.
- Advertencia de seguridad robótica: cualquier uso en hardware real debe validar orden de observaciones, unidades, estadísticas de normalización y límites del espacio de trabajo en un entorno controlado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RECAP-Franka-Bread-Value-Step-2000
- Modelo relacionado (Franka-Wipe-Whiteboard-pi05-step-5000): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000
- Modelo relacionado (Franka-Tennis-pi05-step-5000): https://huggingface.co/dddddsds31341/Franka-Tennis-pi05-step-5000
