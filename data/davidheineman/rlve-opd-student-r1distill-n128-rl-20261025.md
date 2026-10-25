# davidheineman/rlve-opd-student-R1Distill-n128-rl-20261025

## Resumen

`davidheineman/rlve-opd-student-R1Distill-n128-rl-20261025` es un ajuste fino de investigación publicado por David Heineman (usuario `davidheineman`) sobre el modelo destilado `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Se trata del checkpoint final del experimento original de escalado de datos RLVE ("data-scaling"), en el que se entrenan actores con aprendizaje por refuerzo conjunto (GRPO) sobre 128 entornos de entrenamiento, todos ellos inicializados desde cero a partir del mismo modelo base destilado.

El modelo tiene 1.777.088.000 parámetros reales según los pesos en safetensors (aproximadamente 1,78 mil millones), una arquitectura Qwen2 (etiqueta `qwen2` en el repositorio) y se distribuye en formato `safetensors` para la librería `transformers`, con pipeline `text-generation` y compatibilidad declarada con Text Generation Inference y endpoints. El repositorio ocupa 3,6 GB e incluye pesos, tokenizador, configuración y los ficheros `training_run.json` y `training_config.yaml` con la configuración exacta del experimento; no incluye estado de optimizador ni de dataloader.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para estudiar cómo escala el aprendizaje por refuerzo con el número de entornos de entrenamiento en modelos pequeños, y para analizar el comportamiento de un modelo de 1,5B destilado de razonamiento cuando se le somete a RL multi-entorno. No es un modelo orientado a producción: no declara licencia, idiomas ni resultados de benchmarks, y su model card se limita a documentar el protocolo de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (etiqueta `qwen2`; el modelo base es un destilado de DeepSeek-R1 sobre Qwen2) |
| Parametros totales | 1.777.088.000 (dato real de los safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no documentada en el repositorio; la card no la especifica) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se incluyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; la etiqueta `conversational` es la única indicación) |
| Licencia | no disponible (el repositorio no declara licencia; debe verificarse con el autor y con la licencia del modelo base) |
| Formato de pesos | safetensors (`transformers`), mas tokenizador y ficheros de configuracion |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base, un transformer decoder-only de la familia Qwen2 con 1,5B parámetros, destilado por DeepSeek a partir de las trazas de razonamiento de DeepSeek-R1. Sobre esos pesos, este repositorio aplica un ajuste fino con refuerzo mediante GRPO en modo "joint RL": todos los actores del experimento se inicializan de nuevo desde `DeepSeek-R1-Distill-Qwen-1.5B`, es decir, no hay inicialización a partir de checkpoints intermedios de otras fases.

El protocolo de entrenamiento, según la model card, usa 128 entornos con dificultad fija y equilibrada (etiquetas 0/1). La generación emplea 1024 tokens iniciales más una continuación configurada de 128 tokens para forzar la respuesta. El presupuesto total fue de 64.000 rollouts, con la última actualización de checkpoint en el paso 499 (indexado desde cero), lo que corresponde exactamente a esos 64.000 rollouts. La validación se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt, y existe además un conjunto de test compartido de 32 prompts sobre entornos no vistos. Las muestras de validación no computan en el presupuesto de entrenamiento. La configuración exacta y la lista de entornos están en `training_run.json` y `training_config.yaml`, y el registro del run está en Weights & Biases (grupo `data-scaling-v1-n128-20261022-225839`). No se documentan en la información disponible el volumen de tokens de preentrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO más allá del GRPO descrito.

## Capacidades

- Generación de texto conversacional multiturno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento tipo cadena de pensamiento heredado del destilado de DeepSeek-R1, con generación de una respuesta final forzada tras la fase de razonamiento.
- Resolución de tareas definidas por entornos con recompensa verificable (el modelo fue entrenado con RL sobre 128 entornos de dificultad equilibrada).
- Generalización a entornos no vistos: el propio experimento incluye un conjunto de test de 32 prompts sobre entornos no vistos.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado formalmente; el entrenamiento multi-entorno con GRPO está relacionado con habilidades de resolución de tareas, pero no se declaran capacidades agénticas.
- Capacidades multilingües: no disponibles (sin declaración de idiomas).
- Capacidades especiales (modo thinking explícito, visión, audio): no documentadas; el modelo base es solo texto.

## Casos de uso

- Investigación sobre escalado de RL: reproducir o comparar curvas de rendimiento frente a número de entornos usando este checkpoint como punto final de la configuración `n128`, junto con los ficheros `training_run.json` y `training_config.yaml` para reconstruir el experimento.
- Estudio de la dinámica de GRPO en modelos pequeños: analizar cómo un modelo de 1,78B destilado distribuye su presupuesto de 1024 tokens de razonamiento antes de la continuación de 128 tokens de respuesta forzada.
- Evaluación de generalización a entornos no vistos: usar el conjunto compartido de 32 prompts de entornos no vistos para medir transferencia entre tareas con recompensa verificable.
- Baseline académico para ablaciones de data-scaling: comparar este `n128` con otras configuraciones de número de entornos del mismo grupo de runs (`data-scaling-v1-n128-20261022-225839`) manteniendo constante el modelo base.
- Generación de razonamiento matemático y lógico de dominio acotado: útil como generador de trazas de razonamiento para destilación o para construir datasets sintéticos de problemas con respuesta verificable, dado su origen tipo R1.
- Prototipado de bajo coste en local: con ~1,78B parámetros se puede servir en una sola GPU de consumo para experimentos de decodificación y comparación de prompts, sin pretensiones de producción.
- Análisis de robustez y alucinación en modelos RL pequeños: al ser un checkpoint de investigación con validación registrada cada 50 pasos, permite estudiar la evolución del comportamiento y los modos de fallo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de validación (32 prompts × 8 respuestas cada 50 actualizaciones, más un test de 32 prompts sobre entornos no vistos) y enlaza al run de Weights & Biases, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de las métricas de los entornos RLVE. No se inventan valores.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 1,777 mil millones de parámetros; no publicadas por el autor): ~3,6 GB en BF16/FP16 solo para pesos, ~1,9 GB en cuantización de 8 bits y ~1,0-1,1 GB en 4 bits, a lo que hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto (no documentada).
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 permite servir el modelo en BF16 con contexto moderado y margen de sobra; A100 o H100 son innecesarias para este tamaño y solo se justifican para evaluación por lotes a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB en FP16 con contexto corto, y en 6-8 GB con cuantización de 8 bits; en 4 bits podría ejecutarse incluso en GPUs de 4-6 GB, aunque esas variantes no están publicadas en el repositorio.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), Text Generation Inference (la card declara `text-generation-inference` y `endpoints_compatible`) y, previa conversión a GGUF, llama.cpp u Ollama; no hay artefactos GGUF publicados, por lo que la conversión correría por cuenta del usuario.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-student-R1Distill-n128-rl (este) | 1,777 mil millones | no disponible | GRPO joint RL sobre 128 entornos, 64.000 rollouts | no disponible | HuggingFace, 0 descargas, 0 likes |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | ~1,5 mil millones (no confirmado en la informacion disponible) | no disponible | Destilacion de trazas de razonamiento de DeepSeek-R1 sobre Qwen2 | no verificada en la informacion disponible | Publico en HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1,5 mil millones (no confirmado en la informacion disponible) | no disponible | Ajuste instructivo general | no verificada en la informacion disponible | Publico en HuggingFace |
| DeepSeek-R1-Distill-Qwen-7B | ~7 mil millones (no confirmado en la informacion disponible) | no disponible | Destilacion de razonamiento, misma familia | no verificada en la informacion disponible | Publico en HuggingFace |

La comparación relevante es con el modelo base: este checkpoint parte exactamente de `DeepSeek-R1-Distill-Qwen-1.5B` y añade una fase de RL con GRPO sobre 128 entornos. Frente a alternativas instructivas generalistas de tamaño similar, la diferencia esperada está en el sesgo hacia razonamiento explícito y tareas con recompensa verificable, no en cobertura general ni en soporte de herramientas, aspectos que la model card no documenta.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre uso comercial, redistribución ni obligaciones de atribución. Es imprescindible consultar al autor y verificar la licencia del modelo base antes de cualquier uso.
- Idiomas no declarados: se desconoce la cobertura multilingüe real y el comportamiento fuera del inglés.
- Longitud de contexto no documentada: no se puede planificar el dimensionamiento de la caché KV ni el truncado sin consultar la configuración del repositorio.
- Riesgo de alucinación: al ser un destilado de razonamiento de 1,5B, es esperable que genere cadenas de razonamiento plausibles pero incorrectas, especialmente en dominios fuera de los entornos de entrenamiento; no se han publicado evaluaciones de fiabilidad.
- Sesgos: no se documenta ningún análisis de sesgos, filtrado de datos ni evaluación de seguridad.
- Especialización estrecha: el entrenamiento se realizó sobre 128 entornos con formato de generación fijo (1024 tokens iniciales + 128 tokens de continuación forzada), por lo que el rendimiento fuera de ese formato de prompt no está caracterizado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas, más allá del registro de Weights & Biases enlazado.
- Repositorio sin tracción ni mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en octubre de 2026; no hay garantía de soporte, issues atendidos ni correcciones.
- No incluye estado de optimizador ni de dataloader, por lo que no es reanudable tal cual; solo permite inferencia o un nuevo ajuste desde los pesos finales.
- Advertencia sobre la búsqueda web: los resultados obtenidos en la búsqueda no guardan relación con el modelo (contenido para adultos y discusiones ajenas) y se han descartado por completo; no se han incorporado como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-student-R1Distill-n128-rl-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-students-v1/runs/ac3f9b5c
- Ficheros de configuración del experimento (en el repositorio): `training_run.json` y `training_config.yaml`
- Papers, blogs, repositorios o demos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes para este modelo)
