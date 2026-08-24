# agentic-ptb/opus-high-v2.h009.sft_sst.step_60

## Resumen

`agentic-ptb/opus-high-v2.h009.sft_sst.step_60` es un checkpoint intermedio de fine-tuning supervisado (SFT) publicado por el proyecto AgentPTB, una iniciativa de investigación que explora el entrenamiento de modelos mediante procesos agénticos. El modelo parte de `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros) y corresponde al paso 60 de una ejecución SFT dentro de la celda `opus-high-v2`, generada con Claude Code / `claude-opus-5` a esfuerzo alto durante un run de 100 horas.

El propio autor advierte en la model card que este checkpoint no es un artefacto de producción: en esta celda, todas las ejecuciones SFT regresaron frente a los tensores base, y el artefacto recomendado es `base_real` (el modelo base sin modificaciones). El checkpoint `sft_*` se publica únicamente porque fue producido y medido, no porque sea útil. En una evaluación de 285 tareas pareadas de SWE-bench-verified, el mejor checkpoint SFT obtuvo un 17,2% frente al 29,1% del modelo base, lo que evidencia una degradación significativa.

Su relevancia es principalmente metodológica: documenta un caso real de regresión en fine-tuning agéntico y sirve como referencia para estudiar por qué el SFT puede empeorar el rendimiento en tareas de razonamiento y codificación. No se recomienda su uso en aplicaciones prácticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Qwen3.5-9B-Base, sin especificar) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Al ser un fine-tuning de `Qwen/Qwen3.5-9B-Base`, hereda la arquitectura de dicho modelo base, pero la model card no especifica si se trata de un transformer denso, MoE o cualquier otra variante. Tampoco se documentan los datos de entrenamiento, el numero de tokens, ni el proceso de alineacion (RLHF, DPO, etc.).

El entrenamiento corresponde a un paso concreto (`step_60`) de un proceso SFT dentro del framework AgentPTB, que utiliza un modelo de Claude (Claude Code / `claude-opus-5` con esfuerzo alto) para generar datos de entrenamiento. El autor indica que en esta celda "cada ejecucion SFT regreso contra los tensores base", lo que sugiere que el fine-tuning no logro mejorar el rendimiento y, de hecho, lo empeoro. No se proporcionan detalles sobre la composicion del dataset ni sobre tecnicas de regularizacion.

## Capacidades

No se han documentado capacidades especificas para este checkpoint. Al ser un fine-tuning de Qwen3.5-9B-Base, podria heredar capacidades generales de generacion de texto, razonamiento y codificacion del modelo base, pero no hay datos que lo confirmen. La unica medicion disponible (SWE-bench-verified) indica un rendimiento inferior al del base, por lo que no se puede afirmar ninguna capacidad destacable.

## Casos de uso

No se recomienda ningun caso de uso practico para este checkpoint. El autor desaconseja explicitamente su utilizacion, indicando que el artefacto valido es el modelo base sin modificar. Los posibles usos son exclusivamente de investigacion:

- Estudio de regresion en fine-tuning: analizar por que el SFT degrada el rendimiento en tareas de codificacion y razonamiento, comparando este checkpoint con el modelo base.
- Reproduccion de experimentos: servir como punto de referencia para replicar el proceso AgentPTB y verificar los resultados publicados en el run record.
- Analisis de artefactos intermedios: examinar los pesos y configuraciones de un checkpoint intermedio para entender la dinamica del entrenamiento agéntico.

## Benchmarks y rendimiento

La model card reporta un unico dato de evaluacion, correspondiente a 285 tareas pareadas de SWE-bench-verified:

| Modelo | Tasa de exito (285 tareas) |
|---|---|
| Qwen3.5-9B-Base (base_real) | 29,1% |
| Mejor checkpoint SFT (el mas suave) | 17,2% |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. El dato de SWE-bench-verified es el unico disponible y muestra una clara regresion del SFT respecto al base.

## Requisitos de hardware

No se dispone de informacion oficial sobre requisitos de hardware. A partir del tamaño del repositorio (18,8 GB) y de los 9.409.813.744 parametros, se puede estimar que los pesos en precision FP16 o BF16 ocupan aproximadamente 18,8 GB, lo que requeriria una GPU con al menos 20 GB de VRAM para inferencia sin cuantizacion. Con cuantizacion a 8 bits (unos 9,4 GB) o 4 bits (unos 4,7 GB) podria ejecutarse en GPUs de consumo como una RTX 3090 o RTX 4090, pero no hay datos confirmados. No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni metricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El unico modelo directamente comparable es `Qwen/Qwen3.5-9B-Base`, del cual deriva, pero no se tienen especificaciones tecnicas de ese modelo base en la informacion proporcionada. Existen otros modelos de la misma familia (por ejemplo, `Jackrong/Qwopus3.6-27B-v2`, que integra trayectorias de razonamiento de Claude), pero no se dispone de datos de rendimiento comparables. Por tanto, la comparativa se limita a la regresion observada frente al base.

## Limitaciones y advertencias

- Regresion de rendimiento: el autor confirma que el SFT empeoro el rendimiento frente al modelo base (17,2% vs 29,1% en SWE-bench-verified). No debe usarse en produccion.
- Checkpoint intermedio: es un artefacto de un proceso de 100 horas, no un modelo final. No ha pasado por evaluaciones exhaustivas ni por alineacion.
- Licencia no especificada: no se indica la licencia, por lo que no se puede garantizar su uso comercial ni su redistribucion.
- Sin documentacion de sesgos o alucinaciones: no hay informacion sobre sesgos conocidos, riesgos de alucinacion o limitaciones de idioma.
- Dependencia del modelo base: cualquier limitacion de Qwen3.5-9B-Base (contexto, idiomas, sesgos) se hereda, pero no se documenta.
- Advertencia del autor: la model card recomienda leer `SUBMISSION.md` del run record antes de comparar este checkpoint con cualquier otro modelo, y desaconseja su uso.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v2.h009.sft_sst.step_60
- Run record: https://huggingface.co/agentic-ptb/opus-high-v2-record
- Index del proyecto: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
