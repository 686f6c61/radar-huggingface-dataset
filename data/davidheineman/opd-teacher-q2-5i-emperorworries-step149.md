# davidheineman/opd-teacher-Q2.5I-EmperorWorries-step149

## Resumen

`opd-teacher-Q2.5I-EmperorWorries-step149` es un modelo de lenguaje de 1.543.714.304 parametros publicado por David Heineman (investigador de Stanford) como parte de una coleccion de 32 "teachers" (profesores) para un experimento de destilacion on-policy. No es un modelo de proposito general: es un artefacto de investigacion construido a partir de `Qwen/Qwen2.5-1.5B-Instruct` y entrenado con RLVE (aprendizaje por refuerzo con entornos verificables) sobre un unico entorno denominado `EmperorWorries`, a dificultad 0.

El entrenamiento consistio en 150 actualizaciones de GRPO, y el repositorio contiene el checkpoint final (`step149`, indice basado en cero). Los pesos se convirtieron desde el checkpoint nativo a safetensors de Hugging Face y se validaron contra los nombres y formas de tensor del modelo base, por lo que la estructura de pesos coincide con la de Qwen2.5-1.5B-Instruct.

Su relevancia es metodologica, no de rendimiento: sirve como profesor en un pipeline de destilacion on-policy que recorre 32 entornos y como punto de partida reproducible (con run de W&B y codigo de entrenamiento publicados) para estudiar como se comporta un modelo pequeno tras RL sobre una unica tarea. La model card no publica resultados de evaluacion, benchmarks ni detalles del dataset de entrenamiento mas alla del entorno utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, heredada del modelo base); detalles de capas no especificados en la ficha |
| Parametros totales | 1.543.714.304 (~1,54 B), segun safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del modelo; el modelo base Qwen2.5-1.5B-Instruct documenta 32.768 tokens nativos |
| Tipos de cuantizacion | No se publican versiones cuantizadas (GGUF, AWQ, GPTQ ni otras) en el repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 3,1 GB; se incluye `LICENSE` de Qwen) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de ~1,54 B de parametros con atencion por consulta agrupada (GQA) y embeddings rotatorios (RoPE), segun la documentacion publica de Qwen. La ficha de este repositorio no describe la configuracion de capas ni introduce modificaciones estructurales: los pesos fueron convertidos desde el checkpoint nativo del entrenamiento a safetensors y validados contra los nombres y formas de tensor del modelo base.

El entrenamiento es lo distintivo: 150 actualizaciones con GRPO sobre el entorno `EmperorWorries` a dificultad 0, dentro del marco RLVE (reinforcement learning with verifiable environments) descrito en arXiv:2511.07317. Este checkpoint concreto es uno de los 32 profesores de la coleccion "RLVE OPD Teachers" y esta pensado para un experimento de destilacion on-policy con 32 entornos; es decir, el modelo aprendio a resolver una sola tarea verificable, no un espectro amplio de tareas. No se documentan en la ficha datos de preentrenamiento, composicion del dataset, numero de tokens, ni fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste por instrucciones de Qwen2.5-1.5B-Instruct.
- Ejecucion de la tarea del entorno `EmperorWorries` a dificultad 0, para la que fue optimizado mediante GRPO. La ficha no describe en que consiste dicho entorno.
- Generacion de rollouts o trayectorias utilizables como senal de profesor en destilacion on-policy.
- Razonamiento de un solo dominio: el entrenamiento RL se limita a un entorno, por lo que la especializacion es estrecha por diseno.
- Tool calling / function calling: no documentado en esta ficha; el modelo base Qwen2.5-1.5B-Instruct si documenta soporte de function calling, pero no hay confirmacion de que se conserve tras el RL.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Destilacion on-policy como profesor: el modelo genera trayectorias en el entorno `EmperorWorries` que se usan como senal de supervision para entrenar un alumno, que es exactamente el proposito declarado del repositorio.
- Generacion de datos sinteticos verificables: al proceder de RLVE, sus salidas en el entorno pueden filtrarse con un verificador automatico antes de incorporarlas a un dataset de entrenamiento.
- Reproduccion de experimentos de RL: junto con el run de W&B `60a5f5ea` y el repositorio `davidheineman/rlve`, permite rehacer el entrenamiento y comparar el checkpoint final con intermedios.
- Ablacion entre entornos: al existir 31 profesores mas en la coleccion, este checkpoint sirve como una de las 32 condiciones experimentales para medir cuanto transfiere cada entorno a un alumno.
- Baseline de GRPO: util como referencia de "modelo tras 150 updates de GRPO en una tarea" frente al modelo base sin entrenamiento RL.
- Prototipado local de un asistente de dominio concreto: con ~3,1 GB en safetensors, cabe en una GPU de consumo y permite iterar rapidamente sobre un unico flujo conversacional en ingles.
- Estudio de degradacion o especializacion de comportamiento: comparar las respuestas del modelo base y de `step149` permite analizar que cambia en un modelo de 1,5 B tras RL intensivo sobre una tarea unica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas del entorno `EmperorWorries`, y no se proporcionan cifras de recompensa, tasa de exito ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos calculados a partir del numero de parametros; no confirmados por el autor): ~3,1 GB en bf16/fp16 (coincide con el tamano del repositorio), ~1,6 GB en cuantizacion de 8 bits y ~0,9 GB en 4 bits, mas overhead de cache KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16. Una RTX 3060, RTX 4060, RTX 4070 o superior es suficiente. En entornos de servidor, A100, H100 o L40S sobran para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas, e incluso en iGPU con memoria compartida suficiente en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatibles (`endpoints_compatible`), vLLM y llama.cpp/Ollama solo si se generan conversiones GGUF propias, ya que el repositorio no publica pesos cuantizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de su documentacion publica y no forman parte de la informacion proporcionada sobre este modelo.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| opd-teacher-Q2.5I-EmperorWorries-step149 | ~1,54 B | no disponible en la ficha (base: 32.768) | apache-2.0 | Profesor de investigacion para destilacion on-policy; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | apache-2.0 | Modelo base; ajuste por instrucciones generalista y multilingue |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Alternativa generalista de tamano similar; contexto mayor |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens | apache-2.0 | Alternativa abierta orientada a despliegue ligero |

En terminos de rendimiento no es posible comparar: no hay benchmarks publicados para este checkpoint, y su valor esta en el pipeline de destilacion, no en tareas generales.

## Limitaciones y advertencias

- Especializacion extrema: fue entrenado con GRPO sobre un unico entorno (`EmperorWorries`) a dificultad 0, por lo que su comportamiento fuera de ese dominio puede degradarse respecto al modelo base.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones externas ni informes de terceros.
- Sin benchmarks: no hay ninguna medicion publicada de calidad, seguridad o robustez.
- Riesgo de alucinacion: inherente a un modelo de 1,5 B de parametros; el RL sobre un entorno no corrige este comportamiento fuera de el.
- Sesgos: no documentados por el autor; al derivar de Qwen2.5-1.5B-Instruct hereda los sesgos de sus datos de preentrenamiento, no publicados.
- Idioma: solo ingles declarado; no hay soporte multilingue garantizado.
- Contexto: la ficha no especifica la ventana de contexto y no esta claro si el entrenamiento RL preserva el comportamiento de contexto largo del modelo base.
- Licencia: apache-2.0 permite uso comercial, pero al ser un artefacto de investigacion sin evaluacion de seguridad, su uso en produccion requiere validacion propia.
- Uso previsto: el autor lo declara explicitamente como profesor para un experimento de destilacion; emplearlo como asistente general no es el proposito para el que fue disenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-EmperorWorries-step149
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Run de entrenamiento en W&B (60a5f5ea): https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/60a5f5ea
- Codigo de entrenamiento (rlve): https://github.com/davidheineman/rlve
- Paper de RLVE: https://arxiv.org/abs/2511.07317
- Pagina del autor: https://davidheineman.com/
- Google Scholar del autor: https://scholar.google.com/citations?user=JO2Q6CUAAAAJ&hl=en
