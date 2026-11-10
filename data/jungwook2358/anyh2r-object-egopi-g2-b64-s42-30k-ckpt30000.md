# jungwook2358/anyh2r-object-egopi-g2-b64-s42-30k-ckpt30000

## Resumen

El modelo `anyh2r-object-egopi-g2-b64-s42-30k-ckpt30000`, publicado por el usuario jungwook2358 en Hugging Face, es un checkpoint de un modelo de visión-lenguaje-acción (VLA) orientado a robótica. Se trata de una réplica de un experimento de entrenamiento previo (celda de diversidad de tareas "object-egopi") cuyo objetivo es entrenar una política que traduzca instrucciones en lenguaje natural e imágenes en secuencias de acciones motoras. El pipeline declarado es `robotics` y el artefacto principal es el checkpoint número 30.000 de un entrenamiento de 30.000 pasos.

La relevancia del modelo es acotada: no es un modelo de propósito general, sino un checkpoint de investigación reproducible. La model card documenta explícitamente que el código, los datos preparados, el entorno Python y los hiperparámetros son idénticos a los de un experimento original, con la única diferencia del propietario de la salida y el nombre del trabajo. Esto lo convierte en material útil para trazabilidad y reproducción de experimentos, más que para despliegue directo en producción.

El repositorio ocupa 13,8 GB e incluye pesos en safetensors, configuraciones del entrenador, el tokenizador de acciones propio del proyecto (100k) y contratos de inferencia y de diversidad de datos. No se proporcionan datos sobre arquitectura interna, número de parámetros, longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (VLA, vision-lenguaje-acción; detalles internos no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (3 shards + índice) |

## Arquitectura y entrenamiento

La información disponible describe un modelo de tipo VLA (vision-language-action) entrenado sobre el framework RLDX-1, partiendo de un estado inicial identificado como `RLDX-1-PT-IMG`. El entrenamiento se realizó con 2 GPU, batch global de 64, semilla 42 y 30.000 pasos. La política genera chunks de 16 acciones y se desactiva la renovación de instrucciones durante el entrenamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; la model card remite a `diversity_contract.json` para las especificaciones del dataset, pero su contenido no se detalla.

El checkpoint incluye el estado del entrenador de Hugging Face (3 shards safetensors, `config.json`, `processor/`, `experiment_cfg/` con estadísticas del dataset, `trainer_state`, scheduler y recibo de transferencia). Se excluyen explícitamente los estados del optimizador de DeepSpeed (`global_step30000/`) y los estados RNG. El tokenizador de acciones es propio del proyecto (split-decoder, 100k) e incluye `actlat/model.safetensors`, `egopi_prq_stats.json` y un recibo de finalización. Como innovación destacable, el `INFERENCE_CONTRACT.json` fija los normalizadores, activos geométricos y la etiqueta de despliegue necesarios para la inferencia, lo que facilita la reproducibilidad.

## Capacidades

- Generación de acciones motoras a partir de instrucciones en lenguaje natural e imágenes (política VLA para robótica).
- Producción de chunks de 16 acciones por paso de inferencia.
- Uso de un tokenizador de acciones específico (split-decoder, 100k).
- Integración con contratos de inferencia que fijan normalizadores y activos geométricos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): visión implícita por su naturaleza VLA, sin detalles publicados.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite replicar el entrenamiento de la celda "object-egopi" con código, datos y entorno idénticos, gracias a la fijación por sha256 de los tars de código.
- Evaluación de diversidad de tareas en políticas VLA: el `diversity_contract.json` documenta las especificaciones del dataset, lo que permite analizar cómo afecta la diversidad de tareas al rendimiento de la política.
- Punto de partida para fine-tuning en robótica: al ser un checkpoint intermedio de un entrenamiento VLA, puede servir como inicialización para tareas específicas de manipulación con instrucciones en lenguaje natural.
- Auditoría de trazabilidad: la inclusión de `trainer_state`, scheduler y recibo de transferencia permite verificar la configuración exacta del entrenamiento (2 GPU, batch 64, seed 42, 30k pasos).
- Desarrollo de pipelines de inferencia reproducibles: el `INFERENCE_CONTRACT.json` define normalizadores y activos geométricos, lo que facilita construir un entorno de despliegue consistente con el entrenamiento.
- Investigación sobre tokenización de acciones: el tokenizador propio (100k, split-decoder) con estadísticas PRQ permite estudiar la discretización de acciones continuas en políticas VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros ni cuantizaciones).
- GPU recomendadas: no disponible; el entrenamiento se realizó con 2 GPU, sin especificar modelo.
- ¿Cabe en consumer GPU?: no disponible.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| anyh2r-object-egopi-g2-b64-s42-30k-ckpt30000 | no disponible | no disponible | other | Hugging Face (0 descargas) |
| RLDX-1 (base declarada) | no disponible | no disponible | no disponible | referencia interna del proyecto |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos VLA.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial requiere consultar al autor antes de cualquier despliegue.
- Checkpoint intermedio (paso 30.000) de un experimento de investigación; no se documenta su calidad final ni su robustez.
- Excluye estados del optimizador y RNG, por lo que no es reanudable directamente para continuar el entrenamiento sin reconstruir esos estados.
- No se declaran idiomas soportados, lo que impide garantizar un comportamiento multilingüe.
- Sin datos de benchmarks, parámetros ni arquitectura interna: riesgo alto de comportamiento impredecible fuera del dominio de entrenamiento.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- El tokenizador de acciones es propio del proyecto y no estándar, lo que añade dependencia de código específico para la inferencia.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/anyh2r-object-egopi-g2-b64-s42-30k-ckpt30000
- Repositorio de referencia del experimento original: jun-brro/RLDX-1-egopi (rama feat/anyh2r-diversity-training, commit @fc72b51), mencionado en la model card; no se proporciona URL directa.
