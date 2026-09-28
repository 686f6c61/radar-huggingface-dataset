# davidheineman/opd-teacher-Q2.5I-EightDigitPuzzle-step149

## Resumen

opd-teacher-Q2.5I-EightDigitPuzzle-step149 es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por David Heineman (Allen Institute for AI) como modelo "profesor" dentro de un experimento de destilacion on-policy (OPD, on-policy distillation) con 32 entornos. El modelo se ha entrenado con GRPO sobre el entorno `EightDigitPuzzle` a dificultad 0, y su proposito declarado es servir de profesor en ese experimento de destilacion, no como asistente de proposito general.

El checkpoint publicado corresponde al paso 149 (indice basado en cero, es decir, la actualizacion numero 150) de una ejecucion de 150 actualizaciones con GRPO. Los pesos se convirtieron desde el checkpoint nativo final a safetensors de Hugging Face y se validaron contra los nombres y formas de tensor del modelo base. Los tags del repositorio incluyen `rlve`, `grpo` y `opd-teacher`.

Se trata, por tanto, de un modelo de investigacion con un dominio de especializacion muy estrecho: tareas de razonamiento resueltas mediante RL con recompensa verificable. Con 1.543.714.304 parametros y licencia Apache 2.0, su relevancia actual es metodologica (recetas de RLVE/GRPO y destilacion on-policy en modelos pequenos), no de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2`); heredada de Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (repositorio publicado en safetensors; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`); tamano del repositorio 3,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only denso de 1,5 mil millones de parametros. No se documenta en la informacion disponible ninguna modificacion estructural (atencion lineal, SSM, hibridos ni decodificacion especulativa) respecto al modelo base. El ajuste es de pesos completos y se valido comprobando que los nombres y las formas de los tensores coinciden con los del modelo base, lo que indica que no hubo cambios en el grafo de computacion.

El entrenamiento consistio en 150 actualizaciones de GRPO (Group Relative Policy Optimization) sobre el entorno `EightDigitPuzzle` a dificultad 0, dentro del marco RLVE. El checkpoint `step149` es el ultimo de la ejecucion (indice basado en cero). No se especifican en la informacion disponible el numero de tokens vistos, la composicion del dataset, el tamano de grupo de GRPO, la funcion de recompensa concreta ni si hubo fases adicionales de SFT, DPO o RLHF. La ejecucion se registro en Weights & Biases con el identificador `292a246b`, dentro del grupo de barrido `opd-teachers-20260927-191939`.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Razonamiento sobre el entorno `EightDigitPuzzle` (puzle de deslizamiento de 8 fichas): es la unica tarea para la que se ha optimizado explicitamente con RL.
- Resolucion de problemas paso a paso mediante trazas de razonamiento, en la medida en que la politica resultante de GRPO las produzca (no documentado de forma explicita en la model card).
- Funcion como modelo profesor: generacion de trayectorias y respuestas de alta recompensa para destilar su comportamiento en otro modelo.
- Soporte de tool calling / function calling: no disponible (no se documenta; el ajuste GRPO sobre un unico entorno puede degradar capacidades generales).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general documentada; el entrenamiento es de un unico paso de entorno.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Destilacion on-policy como profesor: el modelo genera respuestas sobre `EightDigitPuzzle` que sirven de objetivo para entrenar un modelo alumno, que es exactamente el proposito declarado del checkpoint.
- Generacion de datos sinteticos de razonamiento: producir trayectorias de solucion del puzle para construir datasets de RLVR o de SFT supervisado en modelos pequenos.
- Reproducibilidad de recetas GRPO/RLVE: comparar curvas de recompensa y comportamiento entre los 32 profesores del grupo de barrido `opd-teachers-20260927-191939`.
- Estudios de especializacion y olvido catastrófico: medir cuanto pierde un modelo de 1,5B de parametros en capacidades generales tras 150 pasos de GRPO en un unico entorno estrecho.
- Evaluacion de verificadores y funciones de recompensa: usar las respuestas del modelo como entradas para validar un reward model o un comprobador de soluciones del puzle.
- Prototipado en hardware de consumo: al ocupar 3,1 GB en precision completa, permite experimentos de RL e inferencia en una unica GPU de gama media.
- Punto de partida para RL posterior: continuar el entrenamiento con otros entornos o dificultades partiendo de este checkpoint ya alineado con el formato de tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica el numero de actualizaciones (150), el entorno (`EightDigitPuzzle`, dificultad 0) y el enlace al registro de Weights & Biases; no incluye valores de MMLU, HumanEval, GSM8K ni de exito en el puzle.

## Requisitos de hardware

- Pesos en precision completa (fp16/bf16): aproximadamente 3,1 GB, coherente con el tamano del repositorio.
- VRAM estimada en fp16 con KV cache para contextos cortos: del orden de 4 a 6 GB.
- VRAM estimada en cuantizacion de 8 bits: del orden de 2 a 3 GB; en 4 bits, del orden de 1,5 a 2,5 GB (estimaciones aritmeticas a partir del numero de parametros; no hay cuantizaciones oficiales publicadas).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En 4 bits es viable en GPUs de 6-8 GB.
- GPU de datacenter: A100, H100, L40S y similares sin problema, con margen para lotes grandes.
- Opciones de despliegue: la libreria declarada es `transformers` y el repositorio esta marcado como `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con Inference Endpoints. vLLM y llama.cpp/Ollama requeririan conversion previa a los formatos correspondientes (no se proporcionan GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-EightDigitPuzzle-step149 | 1.543.714.304 | No disponible | GRPO sobre `EightDigitPuzzle` (150 pasos) | Apache 2.0 | Safetensors en Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5B (aprox.) | No disponible en la informacion proporcionada | SFT + preferencias sobre datos generales | Apache 2.0 | Safetensors en Hugging Face |
| Otros profesores del grupo `opd-teachers-20260927-191939` | No disponible | No disponible | GRPO sobre otros entornos del conjunto de 32 | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo frente al modelo base u otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de investigacion con un unico dominio: solo se ha optimizado con RL en el entorno `EightDigitPuzzle` a dificultad 0; no esta pensado como asistente general.
- Riesgo de degradacion de capacidades generales tras RL en una tarea estrecha; no se documenta ninguna evaluacion al respecto.
- Riesgo de alucinacion: no se han publicado tasas de error ni evaluaciones de fidelidad; el modelo puede producir soluciones del puzle incorrectas con formato plausible.
- Idioma: unicamente ingles declarado; no hay garantia de comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto: no documentada en la model card; conviene verificarla contra el modelo base antes de usarlo en produccion.
- Sesgos: no disponibles; no se ha publicado ningun analisis de sesgos.
- Licencia Apache 2.0, lo que permite uso comercial segun los terminos de dicha licencia, pero la model card no ofrece ninguna garantia de idoneidad para produccion.
- Trazabilidad: el checkpoint no incluye semilla, hiperparametros ni funcion de recompensa detallados en la informacion disponible; la reproducibilidad depende del registro externo en Weights & Biases y del repositorio de codigo.
- Fecha de publicacion en el repositorio: 28 de septiembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-EightDigitPuzzle-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Ejecucion de entrenamiento en Weights & Biases (id. 292a246b): https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/292a246b
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Perfil del autor: https://davidheineman.com/
- Repositorio de terceros con material OPD/teacher_model (no verificado): https://github.com/ilovecplusplus230/-OPD/tree/main/teacher_model
