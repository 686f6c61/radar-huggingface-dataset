# msr-spare/msr-agentic-ptb-opus-high

## Resumen

El modelo `msr-spare/msr-agentic-ptb-opus-high` es un checkpoint de post-entrenamiento derivado de `Qwen/Qwen3.5-9B-Base`, generado como parte del benchmark experimental "agentic-PTB". El objetivo de este benchmark es evaluar si un agente autónomo (en este caso, Claude Code con el modelo `claude-opus-5[1m]` a esfuerzo de razonamiento alto) puede mejorar un modelo base mediante aprendizaje por refuerzo (GRPO) para tareas de ingeniería de software (SWE-bench) y trabajo en terminal, usando 4 GPUs y 100 horas de cómputo autónomo.

El checkpoint presentado, `checkpoints/step20_swe8pct`, fue seleccionado como la mejor iteración tras 20 pasos de GRPO, según una evaluación en un subconjunto reservado de SWE-smith. Sin embargo, los resultados del propio autor indican que no se observó una mejora estadísticamente significativa sobre el modelo base en las suites de evaluación principales: la diferencia puntual fue de +0.90 puntos porcentuales en 500 tareas pareadas, con un intervalo de confianza que cruza cero (p=0.51). El valor principal de este artefacto es metodológico: documenta un proceso de medición riguroso y advierte sobre sesgos en la selección de tareas de SWE-bench.

El repositorio contiene además los checkpoints `step60` y `step80`, junto con registros detallados del experimento (`records/`). El modelo se distribuye en formato safetensors y está etiquetado como compatible con `transformers` y con `endpoints_compatible`, aunque no se especifican licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9B (estimado del modelo base, no confirmado en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (sin cuantizacion especifica declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Transformer de `Qwen/Qwen3.5-9B-Base` (9 mil millones de parametros). El proceso de entrenamiento consistio en un post-entrenamiento mediante GRPO (Group Relative Policy Optimization) directamente sobre el modelo base, sin una etapa previa de SFT (supervised fine-tuning). El entrenamiento se ejecuto durante 100 horas autonomas en 4 GPUs, con el agente Claude Code (`claude-opus-5[1m]`) a alto esfuerzo de razonamiento como conductor del proceso.

Se realizaron 80 pasos de GRPO en total, pero el checkpoint seleccionado como envio fue el paso 20, elegido mediante una evaluacion en una particion reservada de SWE-smith (imagenes 9-24). Los pasos 60 y 80 tambien estan disponibles, pero no superaron al paso 20. El autor senala que el nombre del directorio (`step20_swe8pct`) contiene una lectura temprana que luego fue retractada por el propio experimento, por lo que debe tratarse como una etiqueta opaca y no como un indicador de rendimiento.

Una innovacion metodologica destacable es la medicion del "ruido de fondo" del harness: al ejecutar el mismo modelo con el mismo harness dos veces, se observo una variacion de ±1.1 puntos porcentuales. Esto establece un umbral de significancia practica para cualquier comparacion futura.

## Capacidades

- El modelo esta disenado para tareas de agente de ingenieria de software (SWE-bench) y trabajo en terminal, aunque no se han publicado capacidades especificas mas alla del contexto del benchmark.
- Al ser un checkpoint de RL sobre un modelo base de 9B, conserva las capacidades generativas del base, pero no se han documentado habilidades concretas de tool calling, razonamiento multi-paso o soporte de agentes.
- No se ha confirmado soporte para vision, audio u otras modalidades.
- El modelo no incluye un `generation_config.json` (el autor menciona que el base lo tiene ausente), lo que puede afectar a la reproducibilidad en inferencia.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: el checkpoint sirve como referencia para estudiar el efecto de GRPO en un modelo base de 9B para tareas de SWE-bench, especialmente para analizar la varianza de las evaluaciones y los sesgos de seleccion de tareas.
- Benchmarking de protocolos de evaluacion: dado el detalle de los registros, puede utilizarse para calibrar harnesses y protocolos de medicion en entornos de investigacion.
- Comparacion de esfuerzos de razonamiento en agentes de RL: junto con el checkpoint de `msr-agentic-ptb-opus-max` (mismo driver a esfuerzo maximo), permite estudiar diferencias metodologicas, aunque el autor advierte que no son directamente comparables por diferencias en las condiciones del experimento.
- Reproduccion de experimentos: los checkpoints y registros permiten reproducir el proceso de seleccion de checkpoints y verificar los resultados reportados.
- Educacion en evaluacion de modelos: el caso documenta como una mejora aparente puede desvanecerse al ampliar el conjunto de evaluacion, un ejemplo util para ensenar sobre significancia estadistica.
- No se recomienda su uso en produccion: al no haber evidencia de mejora sobre el base y carecer de licencia e idiomas definidos, no es adecuado para aplicaciones comerciales.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el README. Se presentan tal cual, sin interpretacion adicional.

| Eje de comparacion | Comparacion | Resultado | Verdict |
|---|---|---|---|
| Pesos | base → step_20, 500 tareas pareadas | +0.90pp [−1.60, +3.30] p=0.51 | nulo |
| Harness | afinado vs stock, mismos pesos, n=500 | +2.50pp [+0.20, +4.80] p=0.036 | marginal |
| terminal-bench-2 | base → step_20, 89 tareas avg@2 | +1.69pp [0.00, +3.93] p=0.096 | no establecido |
| Ruido de fondo | mismos pesos, mismo harness, dos ejecuciones | ±1.1pp | medido, no asumido |

Ademas, el autor documenta la evolucion del estimador pareado a medida que se anadian tareas: +3.90 (n=77), −0.60 (n=168), −2.87 (n=279), −0.60 (n=498). Esto muestra que la mejora inicial de +3.50pp en 200 tareas no sobrevivio al conjunto completo.

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- No se proporcionan datos oficiales de requisitos de hardware para este checkpoint.
- Dado que el modelo base es de 9B parametros, una estimacion razonable para inferencia en FP16 seria ~18 GB de VRAM, lo que cabria en una GPU consumer de gama alta (RTX 4090 con 24 GB) o en GPUs profesionales como A100 (40/80 GB) o H100.
- Con cuantizacion a 8 bits, la VRAM necesaria se reduce a ~9-10 GB, permitiendo ejecucion en GPUs consumer de 12 GB (RTX 3080/3090, RTX 4070 Ti). Con 4 bits, ~5-6 GB, aunque no se ha confirmado la compatibilidad con formatos GGUF o AWQ.
- El entrenamiento se realizo con 4 GPUs, pero no se especifica el modelo exacto ni la memoria de cada una.
- Para despliegue, al ser un modelo de la familia Qwen, es probable que sea compatible con vLLM, llama.cpp, Ollama y TGI, pero no se ha verificado.
- La latencia y el throughput no se han medido publicamente.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables, ya que se trata de un checkpoint experimental sin publicaciones de referencia. Como referencia contextual, el modelo base `Qwen/Qwen3.5-9B-Base` es el punto de partida natural para comparar cualquier diferencia. Otros modelos de agente como Claude Opus 4.7 (mencionado en busquedas web) tienen un rendimiento muy superior en SWE-bench Verified (87.6%), pero no son comparables en tamano ni en proposito. Por tanto, se indica "no disponible" para una comparativa formal.

## Limitaciones y advertencias

- El propio autor concluye que "el checkpoint de RL es direccionalmente mejor en ambas suites y ninguna diferencia esta estadisticamente resuelta... consistente con una mejora pequena, no evidencia de una".
- El nombre del directorio `step20_swe8pct` es enganoso: refleja una lectura temprana que fue retractada. No debe interpretarse como un indicador de rendimiento.
- El experimento no incluyo SFT; el entrenamiento fue GRPO directo desde el base, lo que limita la generalizacion de los resultados a otros metodos de RL.
- Las tasas base son dependientes del protocolo: el mismo modelo base obtiene 5.00% con `max_concurrent=32` y 9.10% bajo el protocolo final avg@2. Solo son comparables resultados dentro de un mismo harness y protocolo.
- No se proporcionan licencia, idiomas soportados ni informacion sobre sesgos o alucinaciones.
- El checkpoint `step_40` no esta disponible (fue eliminado por la rotacion `keep_last=3` de prime-rl), lo que impide replicar la curva completa de entrenamiento.
- No se ha confirmado la compatibilidad con herramientas de inferencia estandar ni con cuantizaciones distintas a safetensors.
- Al ser un artefacto de investigacion, no se recomienda su uso en entornos de produccion sin una evaluacion adicional exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/msr-spare/msr-agentic-ptb-opus-high
- Write-up del experimento (Claude artifact): https://claude.ai/code/artifact/95e75b6b-a5cd-4172-b165-c9f4d0673b25
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Referencia a benchmarks de agentes (mencionada en busquedas): https://subscriptions.msrresearch.com/reports/tech-scout/2026-04-21 (informacion sobre Claude Opus 4.7 en SWE-bench)
