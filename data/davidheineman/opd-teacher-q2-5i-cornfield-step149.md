# davidheineman/opd-teacher-Q2.5I-Cornfield-step149

## Resumen

opd-teacher-Q2.5I-Cornfield-step149 es un ajuste fino de Qwen2.5-1.5B-Instruct publicado por David Heineman como modelo profesor (teacher) dentro de un experimento de destilacion on-policy sobre 32 entornos. El entrenamiento se realizo con el framework RLVE del propio autor y el algoritmo GRPO durante 150 actualizaciones sobre el entorno denominado Cornfield, en dificultad 0. El checkpoint publicado (step149) corresponde a la actualizacion final, con indexacion basada en cero.

No es un modelo de proposito general ni un asistente listo para produccion: su funcion es actuar como referencia que genere trayectorias y senales de aprendizaje para entrenar un modelo estudiante en el citado experimento de destilacion. Con 1.543.714.304 parametros (~1,54 B) y licencia Apache-2.0 heredada del modelo base, es un artefacto de investigacion reproducible: el autor enlaza el run de Weights & Biases y el codigo de entrenamiento.

Su relevancia es metodologica mas que de rendimiento: forma parte de una familia de checkpoints hermanos (CRT, Integral, Circuit, Differentiate) que permiten comparar el efecto de distintos entornos de RL sobre un mismo modelo base pequeno, algo util para investigadores que estudian RL con recompensas verificables y destilacion on-policy con presupuesto de computo reducido. No se han publicado resultados de benchmarks ni metricas de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen2, sin MoE) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens heredados de Qwen2.5-1.5B-Instruct; no confirmado en la informacion proporcionada |
| Tipos de cuantizacion | no publicados en el repositorio; los pesos se distribuyen en bf16 (repo de ~3,1 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only denso. La configuracion habitual de ese modelo base es de 28 capas, hidden size de 1536, 12 cabezas de atencion con atencion de consultas agrupadas (GQA) y 2 cabezas KV, intermediate size de 8960, normalizacion RMSNorm, activacion SwiGLU, RoPE y embeddings atados con un vocabulario de 151.936 tokens. Estos detalles de configuracion no se detallan en la model card y se listan aqui como datos heredados del modelo base, no verificados en la informacion proporcionada.

El entrenamiento se hizo con RLVE y GRPO (Group Relative Policy Optimization) durante 150 actualizaciones sobre el entorno Cornfield a dificultad 0. La model card no describe la composicion del dataset, el numero de tokens vistos, el diseno de la recompensa ni la naturaleza concreta del entorno Cornfield: toda esa informacion es no disponible. Los pesos se convirtieron desde el checkpoint nativo final a safetensors y, segun el autor, se validaron contra los nombres y formas de tensor del modelo base, lo que sugiere que no hubo cambios estructurales en la arquitectura.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones basicas (modelo -Instruct de partida).
- Comportamiento especializado en el entorno Cornfield tras el ajuste con GRPO, orientado a producir salidas que sirvan de referencia en destilacion on-policy.
- Uso como modelo profesor: generacion de trayectorias y distribuciones para entrenar un estudiante.
- Soporte de tool calling / function calling: no documentado en la informacion disponible. El modelo base Qwen2.5-Instruct lo soporta, pero no hay confirmacion de que este ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: la model card solo declara ingles (`en`).
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles.

## Casos de uso

- Destilacion on-policy como profesor: es el uso previsto por el autor. El modelo genera las salidas de referencia del entorno Cornfield que se usan para supervisar al estudiante en el experimento de 32 entornos.
- Generacion de datos sinteticos para RL: al haber sido ajustado con GRPO sobre Cornfield, puede emplearse para producir trayectorias candidatas que alimenten posteriores rondas de entrenamiento o de filtrado por recompensa.
- Estudio comparativo de entornos de RL: junto a los checkpoints hermanos (CRT, Integral, Circuit, Differentiate) permite aislar el efecto del entorno de entrenamiento manteniendo constante el modelo base y el presupuesto de actualizaciones (150).
- Reproduccion de experimentos: el autor publica el run de Weights & Biases y el repositorio de codigo, de modo que un equipo puede replicar el pipeline completo con el mismo modelo base de 1,5 B.
- Prototipado de asistentes conversacionales en ingles con recursos limitados: con ~3,1 GB en bf16 cabe en GPUs de gama media y permite montar demos de chat rapidamente.
- Baseline para investigacion en RLHF/GRPO: sirve como punto de partida de bajo coste para medir el impacto de cambios en el algoritmo o en la funcion de recompensa antes de escalar a modelos mayores.
- Inferencia local o en el borde: cuantizado a 4 bits ocupa alrededor de 1 GB, lo que habilita despliegues en equipos sin GPU dedicada para tareas de generacion de texto no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se proporcionan curvas de recompensa o de perdida mas alla del enlace al run de Weights & Biases.

## Requisitos de hardware

- VRAM estimada en bf16 (pesos sin cuantizar): ~3,1 GB solo para los pesos; con cache KV y activaciones, entre 4 y 6 GB en contextos cortos.
- Cache KV estimada: con 28 capas, 2 cabezas KV y head dim de 128, cada token ocupa unos 28 KB en fp16, es decir, aproximadamente 0,9 GB para una secuencia completa de 32.768 tokens. Son estimaciones derivadas de la configuracion del modelo base, no medidas publicadas.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En A100 y H100 el modelo es claramente sobredimensionado para su tamano y se usaria solo por agregacion de muchas instancias.
- Cabe en GPU de consumo: si, en bf16 en tarjetas de 8-12 GB y, cuantizado a 4 bits (~1 GB), incluso en iGPUs y CPU.
- Opciones de despliegue: transformers, text-generation-inference (la etiqueta `text-generation-inference` y `endpoints_compatible` aparecen en el repositorio), vLLM, y llama.cpp/Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-Cornfield-step149 | 1,54 B | 32.768 tokens (heredado, no confirmado) | Apache-2.0 | HuggingFace, safetensors | no disponibles |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,54 B | 32.768 tokens, ampliable con YaRN | Apache-2.0 | HuggingFace, safetensors/GGUF/AWQ/GPTQ | si, publicados por Qwen |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | Apache-2.0 | HuggingFace | si, publicados por Qwen |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace, GGUF | si, publicados por Meta |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (segun la ficha de HuggingFace del modelo) | Apache-2.0 | HuggingFace, GGUF | si, publicados por HuggingFace |

Los datos de contexto y licencia de los modelos comparados son valores de referencia de sus respectivas fichas publicas y no proceden de la informacion proporcionada en esta busqueda. La comparativa de rendimiento no puede completarse porque este checkpoint no publica metricas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks ni metricas publicadas, no hay evidencia de que el ajuste con RLVE/GRPO haya mejorado (o al menos no degradado) las capacidades del modelo base.
- Riesgo de olvido catastrofico: un ajuste con GRPO de 150 actualizaciones sobre un unico entorno puede estrechar el comportamiento del modelo hacia las tareas de Cornfield y degradar el rendimiento general. Es un riesgo esperable, no una medicion confirmada.
- Riesgo de alucinacion: inherente a los modelos de 1,5 B de la familia Qwen2.5, especialmente en tareas de conocimiento factual y razonamiento de varios pasos.
- Idioma: la model card declara unicamente ingles. Aunque el modelo base es multilingue, no hay garantia de que el ajuste conserve ese comportamiento.
- Especificidad del entorno: no se describe que es Cornfield, cual es la funcion de recompensa ni como se define la dificultad 0, por lo que el modelo no es reutilizable de forma directa fuera de ese contexto sin reentrenamiento.
- Uso previsto restringido: es un checkpoint intermedio de un experimento de destilacion, no un modelo final orientado a usuario.
- Licencia: Apache-2.0 permite uso comercial, pero el repositorio incluye la licencia original de Qwen y el usuario debe cumplirla; conviene revisar `LICENSE` antes de un despliegue en produccion.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentacion adicional mas alla de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Cornfield-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/f079b511
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Checkpoints hermanos de la misma familia:
  - https://huggingface.co/davidheineman/opd-teacher-Q2.5I-CRT-step149
  - https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Integral-step149
  - https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Circuit-step149
  - https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
- Grupo de sweep de W&B: `opd-teachers-20260927-191939`
