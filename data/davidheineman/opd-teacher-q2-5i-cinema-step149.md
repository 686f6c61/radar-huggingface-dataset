# davidheineman/opd-teacher-Q2.5I-Cinema-step149

## Resumen

opd-teacher-Q2.5I-Cinema-step149 es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por David Heineman como "modelo profesor" (teacher) dentro de un experimento de destilacion on-policy (OPD). El modelo se ha entrenado con RLVE y GRPO sobre el entorno `Cinema` del banco de tareas RLVE, a dificultad 0, durante 150 actualizaciones; el checkpoint `step149` es el ultimo indice basado en cero, es decir, la actualizacion numero 150. Los pesos se convirtieron desde el checkpoint nativo final a safetensors de Hugging Face y se validaron contra los nombres y formas de tensor del modelo base.

Se trata de un artefacto de investigacion, no de un modelo de proposito general: su funcion es servir como profesor en un experimento de destilacion on-policy que abarca 32 entornos. La relevancia actual reside en que forma parte de una linea de trabajo sobre metodos de entrenamiento y evaluacion de modelos fundacionales, y en que documenta de forma reproducible (con enlace al run de W&B y al codigo de entrenamiento) como se obtiene un profesor especializado por entorno mediante RL con verificacion.

Con 1.543.714.304 parametros y licencia Apache 2.0, es un modelo pequeno, en ingles, derivado de la familia Qwen2.5, cuyo interes no esta en el rendimiento generalista sino en su papel dentro de un pipeline de destilacion y en la reproducibilidad del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, derivada de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,54 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; heredada del modelo base Qwen2.5-1.5B-Instruct, que declara hasta 32.768 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos sin cuantizar en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, cargables con `transformers`; tamano del repositorio 3,1 GB |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de entrenamiento | GRPO con RLVE, 150 actualizaciones, entorno `Cinema` (dificultad 0) |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de Qwen2.5 con 1,54 mil millones de parametros. No se introducen cambios estructurales; lo que cambia es el ajuste de los pesos. El entrenamiento se realizo con GRPO (Group Relative Policy Optimization), una variante de optimizacion por politica proximal que estima la ventaja a partir de un grupo de muestras por prompt en lugar de mantener un modelo critico separado, sobre el marco RLVE y el entorno `Cinema`. Se ejecutaron 150 actualizaciones, y `step149` corresponde al checkpoint final en indexacion basada en cero.

La particularidad del artefacto esta en su rol dentro del experimento: es un profesor entrenado por entorno para un esquema de destilacion on-policy con 32 entornos, en el que cada profesor especializado genera senales de supervision sobre los datos que produce el propio estudiante. El autor documenta el run de W&B (`1cee0b19`, grupo de barrido `opd-teachers-20260927-191939`) y el codigo de entrenamiento en el repositorio `davidheineman/rlve`. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases adicionales de RLHF o DPO mas alla del propio GRPO.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-1.5B-Instruct y ajustada para el entorno `Cinema`.
- Ejecucion de la tarea del entorno `Cinema` a dificultad 0, para la que fue entrenado especificamente con recompensa verificable.
- Generacion de respuestas y trayectorias utilizables como supervision en destilacion on-policy (rol de profesor).
- Capacidades generales de razonamiento, codigo y matematicas: no verificadas en la informacion disponible para este checkpoint; el ajuste con GRPO sobre un entorno estrecho puede alterar el comportamiento respecto al modelo base.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento con entornos RLVE implica cierto grado de interaccion multi-paso, pero no se aportan detalles ni evaluaciones.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Destilacion on-policy como profesor: el modelo genera trayectorias y respuestas sobre el entorno `Cinema` que sirven de supervision para un modelo estudiante, que es exactamente el proposito con el que fue entrenado.
- Replicacion de experimentos de RL con recompensa verificable: sirve como punto de partida para reproducir el pipeline RLVE + GRPO descrito por el autor, comparando checkpoints intermedios frente a `step149`.
- Generacion de datos sinteticos especializados: al haber sido ajustado sobre un entorno concreto, puede producir ejemplos de ese dominio para aumentar datasets de entrenamiento o de evaluacion.
- Investigacion sobre metodos de entrenamiento: util para estudiar como se comporta GRPO en un modelo de 1,54 mil millones de parametros y 150 actualizaciones, con registro publico en W&B.
- Punto de partida para ajustes posteriores: al estar en safetensors y con licencia Apache 2.0, se puede continuar el entrenamiento (SFT, DPO, GRPO) sobre nuevas tareas sin restricciones de uso comercial.
- Despliegue local en entornos con recursos limitados: con 1,54 mil millones de parametros cabe en GPU de consumo, lo que permite prototipar asistentes conversacionales en ingles en hardware propio, asumiendo que el rendimiento generalista puede haberse degradado respecto al base.
- Linea base en comparativas internas: util como referencia de "modelo pequeno ajustado con RL" frente a modelos de tamano similar sin ajuste, siempre que la evaluacion se haga sobre tareas comparables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye en la model card metricas de MMLU, HumanEval, GSM8K ni de la tarea `Cinema` (por ejemplo, tasa de exito por episodio), y el repositorio no registra evaluaciones independientes. Tampoco se dispone de comparaciones numericas con el modelo base ni con otros checkpoints del mismo barrido, por lo que no es posible afirmar si el ajuste con GRPO mejora, mantiene o degrada las capacidades generales del modelo.

## Requisitos de hardware

- VRAM estimada (estimaciones derivadas de los 1.543.714.304 parametros; no son cifras publicadas por el autor): en BF16/FP16, aproximadamente 3,1 GB solo para pesos y en torno a 4 GB con contexto corto y cache KV; en cuantizacion de 8 bits, aproximadamente 1,8-2 GB; en 4 bits, aproximadamente 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente en BF16 para inferencia con contexto moderado; A100, H100 o L40S permiten ademas servir muchas replicas concurrentes.
- GPU de consumo: si cabe en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 o Apple Silicon con memoria unificada de 8 GB o mas, especialmente usando cuantizacion.
- Opciones de despliegue: `transformers` de forma nativa (formato publicado); vLLM o TGI para servicio con batching continuo; llama.cpp u Ollama requieren convertir previamente los pesos a GGUF, conversion que no esta publicada en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones; el rendimiento dependera del motor, del backend de atencion y de la longitud de contexto efectiva.
- Almacenamiento: el repositorio ocupa 3,1 GB, por lo que la descarga y el almacenamiento no son un cuello de botella.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparativa se limita a caracteristicas verificables. Los datos de los modelos de referencia corresponden a sus propias fichas publicas.

| Modelo | Parametros | Contexto | Licencia | Rol y disponibilidad |
|---|---|---|---|---|
| opd-teacher-Q2.5I-Cinema-step149 | 1,54 mil millones | no disponible (heredado del base) | Apache 2.0 | Profesor especializado para destilacion on-policy; artefacto de investigacion, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 mil millones | hasta 32.768 tokens | Apache 2.0 | Modelo generalista de instrucciones; base directa de este checkpoint |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 mil millones | hasta 128.000 tokens | Licencia comunitaria Llama 3.2 | Alternativa generalista de tamano similar, con condiciones de uso propias |
| google/gemma-2-2b-it | 2,6 mil millones | hasta 8.000 tokens | Licencia Gemma | Alternativa generalista algo mayor, con terminos de uso especificos |

No hay resultados de benchmarks que permitan comparar rendimiento entre estas opciones en igualdad de condiciones.

## Limitaciones y advertencias

- Es un artefacto de investigacion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni evaluaciones publicadas.
- El ajuste con GRPO sobre un unico entorno (`Cinema`, dificultad 0) puede degradar capacidades generales del modelo base (olvido catastrofico); no hay evaluaciones que lo confirmen o descarten.
- Modelo exclusivamente en ingles segun la etiqueta de idioma del repositorio; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion: inherente a un modelo de 1,54 mil millones de parametros; no se documentan medidas de mitigacion ni tasas de error.
- Longitud de contexto efectiva no documentada para este checkpoint; aunque el modelo base soporta ventanas largas, el ajuste puede haber alterado su uso.
- Soporte de tool calling, agentes y modo de razonamiento extendido: no documentado; no debe asumirse su funcionamiento en produccion.
- Licencia Apache 2.0, por lo que el uso comercial esta permitido; el repositorio incluye la licencia original de Qwen en el archivo `LICENSE`, que conviene revisar antes de redistribuir.
- No se documentan sesgos especificos del ajuste, pero persisten los sesgos del modelo base y los introducidos por los datos del entorno de entrenamiento.
- No se publican pesos en GGUF, AWQ ni GPTQ: cualquier despliegue cuantizado exige una conversion propia y su validacion.
- La model card no especifica composicion del dataset, numero de tokens ni hiperparametros completos, lo que dificulta la reproducibilidad estricta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Cinema-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/1cee0b19
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Perfil del autor: https://davidheineman.com/
- Perfil del autor en Hugging Face: https://huggingface.co/davidheineman
- Repositorio relacionado con OPD (relevancia no confirmada): https://github.com/ilovecplusplus230/-OPD/tree/main/teacher_model
- Repositorio de benchmark OPD (relevancia no confirmada): https://github.com/SemiAnalysisAI/opd-benchmark/
