# davidheineman/rlve-opd-teacher-R1Distill-087-InversionPair-20261025

## Resumen

`davidheineman/rlve-opd-teacher-R1Distill-087-InversionPair-20261025` es un checkpoint de pesos finales publicado por David Heineman como parte de un experimento de *data scaling* con RLVE. No es un modelo de propósito general, sino un "teacher" (modelo profesor) especializado, entrenado con GRPO sobre un único entorno de entrenamiento de dificultad equilibrada 0/1, en la tarea identificada como "InversionPair". El punto de partida es `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, del que hereda la arquitectura Qwen2 (transformer decoder-only denso) y los 1.777.088.000 parámetros totales.

El interés del checkpoint es metodológico: documenta de forma explícita el presupuesto de entrenamiento (4.000 rollouts, última actualización de checkpoint en el paso 499) y el criterio de parada (alcanzar pass@1 >= 0,98 en validación ID, evaluada con 32 prompts y 8 respuestas por prompt cada 50 actualizaciones). Es, por tanto, una pieza reproducible para estudiar cómo escala el rendimiento de un profesor de RL con datos y cómputo controlados, y una fuente potencial de datos sintéticos o de destilación hacia modelos menores.

Es relevante ahora porque los *teachers* especializados con protocolos de entrenamiento auditables son útiles para pipelines de destilación y generación de datos, y porque el repositorio incluye `training_run.json` y `training_config.yaml` con la configuración exacta, además de un enlace al run de W&B. Conviene subrayar que no hay model card descriptiva de capacidades, ni licencia declarada, ni resultados de benchmarks publicados más allá del criterio de parada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (tag `qwen2`; derivado de DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no declarada en la informacion proporcionada; se hereda del modelo base y no se confirma) |
| Tipos de cuantizacion | No se publican versiones cuantizadas; pesos en safetensors (precision del repo: 3,6 GB para 1,78 B de parametros, compatible con bf16/fp16). Convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | No disponible (no declarado) |
| Licencia | No disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | safetensors (repositorio de 3,6 GB; incluye tokenizer y ficheros de configuracion) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,78 B de parametros densos, inicializado desde `DeepSeek-R1-Distill-Qwen-1.5B`. Todos los actores del experimento se inicializaron de nuevo desde ese mismo modelo base, de modo que las diferencias observadas entre checkpoints son atribuibles al entrenamiento por RL y no a un preentrenamiento distinto. El método declarado es "GRPO specialist" (optimizacion de politica conGroup Relative Policy Optimization) sobre un unico entorno de entrenamiento, con dificultad fija y equilibrada 0/1.

El protocolo de generacion es llamativo y condiciona el comportamiento del modelo: 1.024 tokens iniciales de generacion mas una continuacion configurada de 128 tokens con *answer forcing* (forzado de respuesta). El presupuesto se fijo en 4.000 rollouts; la ultima actualizacion de checkpoint es el paso 499 (indexado desde cero), que corresponde exactamente a esos 4.000 rollouts. Los profesores se detenian al alcanzar 4.000 rollouts o al obtener pass@1 >= 0,98 en validacion ID; la validacion usa 32 prompts con 8 respuestas por prompt cada 50 actualizaciones, y esas muestras no computan contra el presupuesto de entrenamiento. No se documentan en la informacion disponible el volumen de tokens de preentrenamiento, la composicion del dataset, ni fases de RLHF/DPO; el repositorio contiene solo pesos, tokenizer y configuracion, sin estado de optimizador ni de dataloader.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional (tag `conversational` en los metadatos).
- Razonamiento con cadena de pensamiento heredado de la destilacion de DeepSeek-R1, sujeto al condicionamiento del entrenamiento GRPO especializado.
- Ejecucion de una tarea concreta ("InversionPair") dentro de un entorno unico de dificultad equilibrada 0/1, con protocolo de respuesta forzada de 128 tokens.
- Generacion de rollouts completos de 1.024 + 128 tokens, apta para producir trayectorias de entrenamiento o de evaluacion.
- Capacidad declarada de servir como *teacher* paraExperimentos de data scaling y, potencialmente, para destilacion (tag `opd-teacher`).
- Compatibilidad con Text Generation Inference y endpoints (tags `text-generation-inference` y `endpoints_compatible`).
- Tool calling / function calling: no disponible (no declarado).
- Capacidades de agente multi-paso: no disponible (no declarado).
- Vision, audio u otras modalidades: no disponibles (modelo exclusivamente de texto).
- Cobertura multilingue: no disponible (no declarada).

## Casos de uso

- Reproduccion del experimento de data scaling: cargar el checkpoint como profesor numero 87 (variante InversionPair) y comparar su comportamiento con el resto de profesores del grupo `data-scaling-v1-n128-20261022-225839`, usando el run de W&B como referencia de curvas de validacion.
- Generacion de datos sinteticos de entrenamiento: producir pares de inversion etiquetados con el protocolo 1.024 + 128 tokens y filtrar por acierto para construir datasets de destilacion con supervision densa.
- Destilacion hacia modelos menores: usar el checkpoint como profesor en un pipeline de imitation learning o KL-divergence sobre un alumno de menor tamano, aprovechando que el profesor esta especializado en una unica tarea y por tanto emite distribuciones poco ruidosas.
- Baseline de GRPO: servir como condicion de control a 4.000 rollouts frente a otros checkpoints del mismo experimento, para medir el efecto del presupuesto de entrenamiento sin confundirlo con cambios de inicializacion.
- Validacion de harnesses de evaluacion: probar implementaciones de pass@1 con 32 prompts y 8 respuestas por prompt, y verificar que el *answer forcing* de 128 tokens se aplica correctamente en el pipeline de generacion.
- Prototipado local e investigacion en una sola GPU: con 1,78 B de parametros el modelo se puede ejecutar en GPUs de consumo para iterar rapido sobre prompts y criterios de parada antes de escalar a modelos mayores.
- Inicializacion para un nuevo ciclo de RL: al ser pesos finales de un profesor, sirve como punto de partida (o como *warm start*) para experimentos posteriores de GRPO sobre entornos distintos.
- Inferencia de servicio ligero: desplegarlo con TGI o vLLM para exponer un endpoint compatible con el cliente de Hugging Face, dado el tag `endpoints_compatible`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica descrita es el criterio de parada del entrenamiento: pass@1 >= 0,98 en validacion ID (32 prompts, 8 respuestas por prompt, cada 50 actualizaciones), que actua como umbral de corte y no como resultado reportado. No se indica el valor final alcanzado, ni mediciones en MMLU, HumanEval, GSM8K o similares.

| Metrica | Valor | Notas |
|---|---|---|
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | No disponible | No publicados en la informacion proporcionada |
| Pass@1 en validacion ID | No disponible (solo el umbral >= 0,98 como criterio de parada) | 32 prompts x 8 respuestas, cada 50 actualizaciones |
| Rollouts de entrenamiento | 4.000 | Ultima actualizacion: paso 499 (indexado desde cero) |
| Entornos de entrenamiento | 1 | Dificultad fija y equilibrada 0/1 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los 1,777 B de parametros ocupan aproximadamente 3,6 GB, por lo que el peso del modelo cabe en ~4 GB y el consumo total depende del *KV cache* y de la longitud de contexto efectiva. En cuantizacion de 8 bits, ~1,9 GB; en 4 bits, ~1,0-1,2 GB.
- GPU recomendadas: para servicio en bf16, una A10G (24 GB), L4 (24 GB) o A100/H100 sobran; el modelo no requiere tensor parallelism ni particionado.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, y en tarjetas de 8 GB si se cuantiza a 8 o 4 bits. En 6 GB solo con cuantizacion agresiva.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (tag `text-generation-inference`), endpoints compatibles, y conversion a GGUF para llama.cpp, Ollama o LM Studio mediante herramientas estandar (no se distribuyen ficheros GGUF en el repositorio).
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni comparativas de serving para este checkpoint.
- Almacenamiento: 3,6 GB para el repositorio completo; el estado del optimizador y del dataloader no esta incluido, por lo que no se puede reanudar el entrenamiento tal cual.

## Comparativa con modelos similares

Datos de los comparables tomados de documentacion publica de sus respectivas familias; no verificados en esta ficha. La licencia del checkpoint analizado figura como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Perfil |
|---|---|---|---|---|---|
| rlve-opd-teacher-R1Distill-087-InversionPair (este modelo) | 1,78 B (denso) | No disponible | No disponible | Publico en HF, 0 descargas, 0 likes | Profesor RL especializado en una tarea (InversionPair), pesos finales de un experimento de data scaling |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (modelo base) | 1,78 B (denso) | No verificado | MIT (segun el autor del modelo base) | Ampliamente disponible | Modelo de razonamiento destilado de proposito general |
| Qwen2.5-1.5B-Instruct | 1,54 B (denso) | 32 768 tokens (familia Qwen2.5) | Apache 2.0 | Ampliamente disponible | Instruccion generalista, multilingue, con soporte de tool calling |
| Qwen2.5-Math-1.5B | 1,54 B (denso) | 32 768 tokens (familia Qwen2.5) | Apache 2.0 | Ampliamente disponible | Especializado en matematicas, antecesor de la linea de destilados R1 |

La diferencia practica frente a los tres alternativas es de regimen: los comparables son modelos de proposito general o de dominio amplio, mientras que este checkpoint esta entrenado para un unico entorno con un protocolo de generacion fijo y un presupuesto de 4.000 rollouts. No hay datos publicos que permitan afirmar que supere o iguale a los comparables fuera de esa tarea.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir uso comercial. Hay que contactar con el autor o verificar la licencia del modelo base (MIT para DeepSeek-R1-Distill-Qwen-1.5B) antes de cualquier despliegue productivo; la licencia del derivado no queda automaticamente cubierta.
- Es un artefacto de investigacion: 0 descargas y 0 likes en el momento del analisis, sin model card descriptiva de capacidades, idiomas o limitaciones.
- Especializacion estrecha: entrenado en un unico entorno con dificultad fija 0/1 y una tarea concreta (InversionPair). Es esperable una degradacion de capacidades generales tras el ajuste con GRPO, aunque no se aportan mediciones que lo cuantifiquen.
- Protocolo de generacion acoplado: la ventana de 1.024 tokens iniciales mas 128 tokens de continuacion con *answer forcing* condiciona el formato de salida; usarlo fuera de ese esquema puede producir respuestas truncadas o mal formadas.
- Riesgo de alucinacion: inherente a un modelo de 1,78 B con razonamiento destilado; no se documentan evaluaciones de factualidad ni de calibracion.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad, ni la composicion de los datos de entrenamiento del modelo base.
- Idiomas: no se declara cobertura multilingue; el tag `conversational` no implica soporte mas alla del ingles.
- Sin tool calling ni capacidades de agente declaradas: no conviene integrarlo en pipelines que dependan de function calling sin verificacion previa.
- Longitud de contexto no confirmada: no se especifica en la model card; debe medirse empiricamente antes de disenar prompts largos.
- Imposible reanudar el entrenamiento: el repositorio no incluye estado de optimizador ni de dataloader, solo pesos, tokenizer y configuracion.
- Anomalia de metadatos: la fecha de creacion figura como 2026-10-25, posterior a la fecha habitual de publicacion; conviene tratarla con cautela al citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-087-InversionPair-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de W&B del entrenamiento: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/ecb9c165
- Grupo de W&B: `data-scaling-v1-n128-20261022-225839` (accesible desde el proyecto https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1)
- Configuracion del run en el repositorio: `training_run.json` y `training_config.yaml`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
