# jkkonrad/untrusted-monitoring-deepseek-v31-adapters

## Resumen

`jkkonrad/untrusted-monitoring-deepseek-v31-adapters` es una colección de 17 adaptadores LoRA (rank 32, fp32, formato PEFT) entrenados sobre `deepseek-ai/DeepSeek-V3.1`. No es un modelo autónomo, sino un conjunto de artefactos de investigación publicados como parte del proyecto SPAR 2026 *Evaluating Collusion in Untrusted Monitoring* (paper arXiv:2602.20628). Los adaptadores fueron entrenados con Tinker (Thinking Machines) y exportados sin modificar cuando Tinker retiró el soporte para DeepSeek-V3.1; solo se rellenó el campo `base_model_name_or_path`, que el export deja vacío.

La mayoría de los adaptadores son monitores de auto-reconocimiento (self-recognition monitors) afinados con SFT para determinar si un fragmento de código fue escrito por el propio modelo o por un generador honeypot, evaluados sobre APPS, BigCodeBench y BashArena, y en distintas variantes de signal-jamming (raw, minified, paraphrased/summarised). Los adaptadores con prefijo `rl_*` provienen de experimentos de RL sobre señales de colusión. El objetivo es estudiar si un monitor no fiable puede coludir con el modelo monitorizado y cómo resiste (o no) la manipulación de la señal.

El interés práctico es acotado: no es un modelo para producción general, sino material reproducible para investigación en AI control y seguridad de modelos. Su utilidad depende de disponer de DeepSeek-V3.1 y de un stack de serving con soporte de LoRA sobre capas MoE, o de fusionar los adaptadores en los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE DeepSeek-V3.1 |
| Parametros totales | no disponible (adaptadores: ~12,4 GB por adaptador) |
| Parametros activos | no disponible (depende del modelo base DeepSeek-V3.1) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (adaptadores en fp32; cuantizacion del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT: `adapter_config.json` + `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rank 32 en fp32 en formato PEFT. La cobertura abarca capas de atención, MLP denso y expertos MoE; aproximadamente el 97% de los 12,4 GB de cada adaptador corresponde a LoRA sobre expertos. Se entrenaron sobre `deepseek-ai/DeepSeek-V3.1` mediante Tinker y se exportaron sin cambios, rellenando únicamente el campo `base_model_name_or_path`.

El entrenamiento combina SFT para tareas de auto-reconocimiento (distinguir código generado por el propio modelo frente a un generador honeypot) sobre APPS, BigCodeBench y BashArena, en variantes de señal raw, minified y paraphrased/summarised, con experimentos de RL sobre señales de colusión (adaptadores `rl_*`, con barridos de learning rate y configuraciones frozen/joint). La carpeta `david/apps_sweep_*` y `david/apps_side_*` contienen barridos sobre tamaño del conjunto de entrenamiento (n55 a n406), semillas, datos y transformaciones; `neelasha/` recoge adaptadores piloto de auto-reconocimiento, muestras benignas y RL con señal reescrita. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Clasificación de auto-reconocimiento: determinar si un fragmento de código fue generado por el propio modelo o por un generador honeypot.
- Evaluación de robustez frente a signal-jamming: variantes raw, minified y paraphrased/summarised del código de entrada.
- Experimentos de colusión en entornos de untrusted monitoring: adaptadores entrenados con señales de RL para estudiar comportamiento colusivo.
- Barridos controlados de entrenamiento: tamaño de dataset (n55 a n406), semillas y transformaciones.
- No se documentan capacidades de generación general, tool calling, agentes, visión, audio ni multilingüismo propias de estos adaptadores; dependen del modelo base.

## Casos de uso

- Investigación en AI control: usar los adaptadores como monitores no fiables en experimentos que miden si un modelo monitorizado puede inducir colusión con el monitor. Es el propósito original del proyecto SPAR 2026.
- Reproducción del paper arXiv:2602.20628: cargar los adaptadores con los mismos subfolders y configuraciones para replicar los resultados de colusión y signal-jamming.
- Estudio de robustez de monitores: comparar el rendimiento de los adaptadores raw, minified y paraphrased sobre APPS y BigCodeBench para cuantificar la degradación bajo transformaciones de la señal.
- Análisis de escalado de datos de entrenamiento: emplear los barridos `david/apps_sweep_*` (n55 a n406) para estudiar cómo varía la capacidad de auto-reconocimiento con el tamaño del conjunto de entrenamiento.
- Evaluación de políticas de RL: usar los adaptadores `rl_*` con distintos learning rates (1e-5, 5e-5, 1,5e-4) y configuraciones frozen/joint para analizar la estabilidad del entrenamiento con refuerzo sobre señales de colusión.
- Benchmarking de stacks de serving con LoRA MoE: probar si un stack concreto (o la fusión en los pesos base) preserva el comportamiento de los adaptadores, dado que el 97% del peso está en LoRA de expertos.
- Docencia y formación en seguridad de IA: material reproducible para ejercicios sobre monitores no fiables y colusión en pipelines de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los adaptadores no se pueden ejecutar solos: requieren cargar el modelo base DeepSeek-V3.1, cuyos requisitos de VRAM no se detallan en la información disponible.
- Cada adaptador ocupa aproximadamente 12,4 GB en fp32; el repo completo suma 917,7 GB, por lo que el almacenamiento es un factor relevante.
- El serving requiere un stack con soporte de LoRA sobre capas MoE de DeepSeek, o bien fusionar los adaptadores en los pesos base antes de desplegar.
- No se especifican GPU recomendadas, latencia ni throughput en la información disponible.
- No se confirma que quepa en GPU de consumo; depende del modelo base y del método de serving.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jkkonrad/untrusted-monitoring-deepseek-v31-adapters | LoRA sobre DeepSeek-V3.1 | no disponible (adaptador ~12,4 GB) | no disponible | MIT | Hugging Face |
| deepseek-ai/DeepSeek-V3.1 | Modelo base MoE | no disponible en la información | no disponible | no disponible | Hugging Face |
| Adaptadores LoRA de AI control comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros conjuntos de adaptadores equivalentes para untrusted monitoring con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: sin DeepSeek-V3.1 los adaptadores no son funcionales.
- Solo se ha verificado el campo `base_model_name_or_path`; el resto del export proviene de Tinker sin modificaciones.
- El 97% del peso está en LoRA de expertos MoE, lo que exige stacks de serving específicos o fusión previa; un stack sin soporte MoE LoRA no los cargará correctamente.
- El propósito es experimental (colusión y monitores no fiables); no hay evidencia de calidad para uso en producción general.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe de los adaptadores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.
- La licencia MIT permite uso comercial, pero el modelo base puede tener condiciones propias que deben verificarse por separado.
- El tamaño del repo (917,7 GB) puede implicar costes de almacenamiento y descarga considerables.

## Enlaces

- Hugging Face: https://huggingface.co/jkkonrad/untrusted-monitoring-deepseek-v31-adapters
- Paper: https://arxiv.org/abs/2602.20628
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.1
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
