# SeanWang0027/babyai-rose-s5t5-1p7b

## Resumen

babyai-rose-s5t5-1p7b es un checkpoint de investigación publicado por el usuario SeanWang0027 en HuggingFace. Se trata de un fine-tuning de Qwen/Qwen3-1.7B entrenado sobre el entorno BabyAI, en la partición de 810 tareas de AgentGym-RL, como una de las tres ramas de comparación descritas en el fichero `babyai/THREE_ARMS.md` del repositorio `cl-from-nothing/online-rose` (commit 01aaed5).

El modelo corresponde a la rama ROSE multiturno denominada "s5t5". En el esquema de entrenamiento, el estudiante (Qwen3-1.7B) juega 5 turnos en el entorno BabyAI en vivo, después el profesor (Qwen3-32B) continúa sobre el mismo entorno otros 5 turnos, y la entropía cruzada se aplica únicamente a los turnos del profesor. El entrenamiento usó 810 tareas, batch 32, learning rate 1e-5 y 3 épocas, lo que resultó en 75 actualizaciones, con el modo "thinking" desactivado.

Su relevancia es acotada y de carácter experimental: no es un modelo de propósito general, sino un artefacto reproducible para estudiar aprendizaje online multiturno y destilación profesor-estudiante en entornos de agentes. Alcanza un 67,5 % de éxito en el `official_test` de 90 tareas de BabyAI (4 muestras por tarea). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado pipeline ni idiomas soportados en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, arquitectura Qwen3 (heredada del modelo base; el fine-tuning no la modifica) |
| Parámetros totales | 2.031.739.904 (≈2,03 B), según los pesos safetensors publicados |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-1.7B declara 32.768 tokens nativos |
| Tipos de cuantización | No disponible: el repo solo publica pesos safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible; el entorno de entrenamiento (BabyAI) emplea instrucciones en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 4,1 GB) |
| Modelo base | Qwen/Qwen3-1.7B |
| Checkpoint de origen | `global_step_75/actor.hf` |
| Tarea de entrenamiento | BabyAI, partición de 810 tareas de AgentGym-RL |
| Fecha de publicación | 2026-09-18 (última actualización: 2026-09-18) |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B, un transformer decoder denso de aproximadamente 2,03 mil millones de parámetros. El autor no introduce cambios estructurales: el checkpoint es el resultado de un proceso de ajuste sobre esa base. El tag `qwen3` y el campo `base_model: Qwen/Qwen3-1.7B` confirman la procedencia, mientras que `base_model:finetune:Qwen/Qwen3-1.7B` indica que se trata de un fine-tuning y no de una mera conversión de formato.

El método de entrenamiento es el que el autor denomina ROSE multiturno, en su variante "s5t5". La dinámica es la siguiente: el estudiante Qwen3-1.7B ejecuta 5 turnos en el entorno BabyAI en vivo; a continuación, el profesor Qwen3-32B retoma el mismo entorno durante 5 turnos adicionales; la función de pérdida de entropía cruzada se calcula exclusivamente sobre los turnos generados por el profesor. Los hiperparámetros declarados son 810 tareas, batch de 32, learning rate 1e-5 y 3 épocas, lo que da un total de 75 actualizaciones, con el modo de razonamiento extendido ("thinking") desactivado.

No se detalla en la model card la composición exacta del dataset más allá de la partición de tareas de BabyAI, ni si hubo etapas adicionales de RLHF, DPO u otro tipo de alineamiento. Tampoco se documenta la expansión del acrónimo ROSE ni innovaciones de inferencia como decodificación especulativa o atención lineal. Toda la información metodológica adicional referenciada apunta al fichero `THREE_ARMS.md` del repositorio `cl-from-nothing/online-rose`.

## Capacidades

- Ejecución de episodios multiturno en el entorno BabyAI: el modelo está ajustado específicamente para interactuar con este entorno en secuencias de 5 turnos como estudiante.
- Aprendizaje por imitación de un profesor de mayor tamaño: el entrenamiento optimiza la predicción de los turnos del profesor Qwen3-32B, no los del propio estudiante.
- Seguimiento de instrucciones dentro del dominio de la tarea: las 810 tareas de AgentGym-RL incluyen instrucciones asociadas a objetivos del entorno.
- Modo "thinking" desactivado: el entrenamiento se realizó sin razonamiento extendido, por lo que no se debe esperar comportamiento de cadena de pensamiento largo.
- Soporte de tool calling / function calling: no disponible; la model card no lo declara ni lo menciona.
- Soporte de agentes y razonamiento multi-step: parcial y restringido al dominio BabyAI; el esquema s5t5 es explícitamente multiturno, pero no hay evidencia de generalización a otros entornos.
- Capacidades multilingües: no disponibles; el material de entrenamiento descrito está en inglés.
- Visión, audio o modalidades adicionales: no disponibles.
- Generación de código, matemáticas o conocimiento general: no evaluadas y no declaradas por el autor; el checkpoint está especializado en la tarea de BabyAI.

## Casos de uso

- Replicación de experimentos de aprendizaje online multiturno: el checkpoint es el brazo "s5t5" de una comparación de tres brazos documentada en `THREE_ARMS.md`, por lo que sirve para reproducir o auditar los resultados del estudio en su commit 01aaed5.
- Investigación en destilación profesor-estudiante: permite analizar cómo un estudiante de 2,03 B absorbe el comportamiento de un profesor de 32 B cuando la pérdida se aplica solo a los turnos del profesor, un diseño poco habitual que este checkpoint materializa.
- Línea base para nuevas variantes de ROSE: cualquier experimento que cambie el número de turnos, la proporción estudiante/profesor o la política de asignación de pérdida puede compararse contra este modelo con su 67,5 % de éxito en `official_test`.
- Estudio de asignación de crédito en secuencias multiturno: el esquema s5t5 separa estrictamente los turnos del estudiante y del profesor, lo que lo convierte en un banco de pruebas para investigar problemas de atribución de recompensa en diálogos con entorno.
- Evaluación de generalización fuera de distribución dentro de BabyAI: con 810 tareas de entrenamiento y 90 de test, el checkpoint permite medir la brecha de generalización entre particiones del mismo entorno.
- Generación de trayectorias sintéticas para entornos de agentes: las interacciones producidas por el modelo pueden usarse como datos de partida para entrenar o preentrenar otros agentes en BabyAI, siempre con validación manual de la calidad de los episodios.
- Docencia y divulgación sobre entrenamiento de agentes: el tamaño reducido (2,03 B) y su licencia apache-2.0 facilitan su uso en cursos o talleres donde se quiera ilustrar un ciclo completo de fine-tuning con profesor y entorno interactivo.
- Comparación de coste/beneficio entre estudiante y profesor: permite cuantificar cuánto del rendimiento del profesor de 32 B se retiene en un estudiante de 2,03 B bajo este régimen de entrenamiento concreto.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalles |
|---|---|---|
| BabyAI `official_test` (90 tareas) | 67,5 % de éxito | Evaluado con 4 muestras por tarea |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro benchmark de propósito general para este checkpoint. El único dato de rendimiento declarado es la tasa de éxito en el test oficial de BabyAI. Tampoco se proporcionan métricas de los otros dos brazos de la comparación, por lo que no es posible situar este resultado respecto a sus alternativas dentro del mismo estudio.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 4,1 GB solo para pesos (el repo ocupa 4,1 GB), más el coste de activaciones y caché KV; en la práctica, unos 5-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: del orden de 2,5-3 GB, incluyendo overhead de runtime.
- VRAM estimada en cuantización de 4 bits: del orden de 1,5-2 GB; requiere convertir los pesos, ya que no se publican ficheros GGUF en el repositorio.
- GPU recomendadas: cabe con holgura en GPU de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090; en entornos de servidor, A100, H100, L40S o similares son suficientes y quedan sobredimensionadas para un modelo de este tamaño.
- Compatibilidad con GPU de consumo: sí. Es un modelo de aproximadamente 2 B de parámetros, por lo que entra en cualquier GPU con 6 GB o más de VRAM en precisión completa y en GPUs de 4 GB con cuantización.
- Apple Silicon: viable en equipos con 8-16 GB de memoria unificada tras convertir a GGUF o ejecutando en bf16.
- Opciones de despliegue: HuggingFace Transformers, vLLM y TGI admiten el formato safetensors publicado; llama.cpp y Ollama requieren una conversión previa a GGUF que el autor no ha publicado.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones de tokens por segundo ni de latencia por turno.
- Nota sobre el entrenamiento: el autor no documenta el hardware utilizado para el fine-tuning (810 tareas, batch 32, 75 actualizaciones), por lo que no se puede estimar el coste de reproducirlo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| babyai-rose-s5t5-1p7b | ≈2,03 B | No especificado en la model card (base Qwen3-1.7B: 32.768 tokens) | apache-2.0 | HuggingFace, 0 descargas | Especializado en BabyAI, 67,5 % de éxito en `official_test`; sin benchmarks generales |
| Qwen/Qwen3-1.7B (base) | ≈2,03 B | 32.768 tokens nativos | apache-2.0 | HuggingFace, ampliamente distribuido | Modelo de propósito general; sirve como referencia del punto de partida antes del fine-tuning |
| Qwen2.5-1.5B-Instruct | ≈1,54 B | 32.768 tokens | apache-2.0 | HuggingFace | Alternativa de tamaño comparable para tareas generales de instrucción; no entrenada en BabyAI |
| SmolLM2-1.7B-Instruct | ≈1,71 B | 8.192 tokens | apache-2.0 | HuggingFace | Alternativa de tamaño similar con contexto más corto; tampoco cubre el dominio de agentes de BabyAI |

Los datos de los modelos de la comparativa distintos del modelo base proceden de la documentación pública de cada proyecto y no forman parte de la información proporcionada en esta búsqueda. No se dispone de una comparación directa de rendimiento en BabyAI entre este checkpoint y otros modelos públicos, porque los otros dos brazos del estudio (`THREE_ARMS.md`) no se detallan en la model card.

## Limitaciones y advertencias

- Modelo de nicho: es un checkpoint de investigación para la tarea BabyAI, no un asistente de propósito general. Su uso fuera de ese dominio no está validado y probablemente produzca resultados pobres.
- Ausencia de benchmarks generales: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, por lo que no se puede caracterizar su comportamiento fuera del entorno de entrenamiento.
- Riesgo de alucinación: no evaluado ni documentado por el autor. En tareas de agente, el fallo típico sería la emisión de acciones inválidas o incoherentes con el estado del entorno, más que alucinación factual en lenguaje natural.
- Sesgos conocidos: no documentados. Al derivar de Qwen3-1.7B, el checkpoint podría heredar sesgos del modelo base, pero no se ha realizado ninguna evaluación al respecto.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni longitud de contexto tras el fine-tuning; el entorno de entrenamiento usa instrucciones en inglés. El entrenamiento se hizo con "thinking" desactivado, por lo que no cabe esperar razonamiento extendido.
- Riesgo de sobreajuste al profesor: al aplicar entropía cruzada solo sobre los turnos del profesor, el modelo puede imitar el estilo del Qwen3-32B sin haber aprendido necesariamente la política óptima del entorno.
- Reproducibilidad parcial: la información metodológica completa vive en `THREE_ARMS.md` del repositorio `cl-from-nothing/online-rose` en el commit 01aaed5; si ese repositorio no es accesible o cambia, la reproducibilidad queda comprometida.
- Licencia: apache-2.0 permite uso comercial y modificación, pero al derivar de Qwen3-1.7B conviene verificar las condiciones de la licencia del modelo base y citar adecuadamente ambos.
- Adopción nula: 0 descargas y 0 likes implican que no hay validación independiente por parte de la comunidad; cualquier uso en producción debería ir precedido de una evaluación propia.
- Contexto del resultado: el 67,5 % de éxito se obtuvo con 4 muestras por tarea sobre 90 tareas, una muestra pequeña; la varianza de la estimación no se documenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/babyai-rose-s5t5-1p7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio citado en la model card: `cl-from-nothing/online-rose`, commit 01aaed5 (fichero `babyai/THREE_ARMS.md`); no se proporciona URL directa en la información disponible.
- Paper de AgentGym-RL (partición de 810 tareas empleada en el entrenamiento): no disponible en la información proporcionada.
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre escuelas de la ciudad de Berna) y se descartan por no ser relevantes.
