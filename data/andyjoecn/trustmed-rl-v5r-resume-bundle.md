# andyjoecn/TrustMed-RL-v5r-resume-bundle

## Resumen

TrustMed-RL v5r resume bundle es un repositorio de artefactos publicado por el usuario andyjoecn el 11 de septiembre de 2026. No contiene un modelo entrenado con pesos utilizables, sino el conjunto de punteros y ficheros auxiliares necesarios para reproducir desde cero, en un entorno limpio, el experimento de aprendizaje por refuerzo denominado v0910 (v5r) de cuatro brazos sobre el pipeline TrustMed-RL. El repositorio ocupa 2,2 GB e incluye, entre otros elementos, una copia del paquete de código `grpo_gigpo_code.tgz`, un archivo de imagenes `images_full256_v4.tar` que debe desplegarse en `/workspace/images`, y referencias a los checkpoints SFT base, al corpus de recuperacion y a la telemetria de la ronda anterior.

El pipeline se apoya en checkpoints SFT derivados de Qwen3-VL-8B (`andyjoecn/TrustMed-SFT-seed1-Qwen3VL-8B` y su variante seed2) y en un corpus de recuperacion medica de 121 GB alojado en otros repositorios de HuggingFace. El entrenamiento emplea GRPO/GiGPO con un juez externo basado en `gpt-4.1-mini` para el calculo de recompensas, con un coste declarado de aproximadamente 6 dolares por brazo y 30 pasos.

Su relevancia es fundamentalmente operativa y de reproducibilidad: documenta por que la ronda de entrenamiento previa fallo y como relanzarla. Los cuatro brazos v0910 terminaron entre los pasos 21 y 31 por un evento etiquetado como `collapse: kl_jump`, con `best_value` entre 0,27 y 0,32, y el autor diagnostica un falso positivo del detector de colapso (el `kl_loss` derivaba de forma natural hacia 0,10-0,12 frente a una base de 0,10). No se publican pesos finales: el mejor resultado revirtio al checkpoint SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable al bundle. El pipeline parte de checkpoints SFT basados en Qwen3-VL-8B (no se detalla la arquitectura interna en la informacion disponible) |
| Parametros totales | No disponible para el bundle. El checkpoint base se identifica como Qwen3VL-8B (8B) |
| Parametros activos | No aplicable (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible. La configuracion de entrenamiento RL usa MAX_PROMPT_LEN=15360 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | El bundle no contiene pesos de modelo. Incluye `grpo_gigpo_code.tgz` (codigo) e `images_full256_v4.tar` (imagenes) |
| Tamano del repositorio | 2,2 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

El bundle no define una arquitectura de red neuronal propia. Su funcion es agrupar los artefactos de un experimento de RL: el codigo de entrenamiento GRPO/GiGPO (liberado como `grpo_gigpo_code.tgz` en la release `b200-package-20260910` del repositorio de GitHub `Trustmed-RL/TrustMed-RL`, con copia en este repositorio), los manifiestos de datos (`pool`, `schedule_v5`, `donors`, `pack_manifest`), el checkpoint SFT de partida y los recursos de retrieval. El modelo sobre el que se entrena se identifica en los nombres de los repositorios como Qwen3-VL-8B, en dos semillas SFT distintas.

En cuanto al procedimiento, el autor describe un entrenamiento de cuatro brazos (combinaciones de GiGPO y GRPO con las semillas 1 y 2) con recompensa calculada por un juez externo (`gpt-4.1-mini`). La receta de despliegue incluye requisitos concretos: arquitectura `sm_103` con el conjunto GB300, aplicacion obligatoria de `patch_fork.py` tras sustituir el codigo, `ray_init.num_cpus=32`, `MAX_PROMPT_LEN=15360` y `FLAG_HALT_SHARE=0.10`. La innovacion documentada no es algorítmica sino diagnostica: el autor aporta la telemetria de la ronda fallida y propone dos correcciones de configuracion, elevar `KL_JUMP_BASE` de 0,10 a 0,30 o fijar `MAX_COLLAPSES=1`, para evitar que el detector de colapso aborte el entrenamiento por una deriva normal del `kl_loss`.

## Capacidades

- No se describe ninguna capacidad funcional del modelo en la informacion disponible.
- El bundle no es un modelo invocable: no expone generacion de texto, razonamiento, codigo ni matematicas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues.
- El unico componente multimodal identificable es el uso de Qwen3-VL-8B como base SFT y la presencia de un archivo de imagenes (`images_full256_v4.tar`), lo que sugiere entrada visual en el pipeline de entrenamiento, aunque no se detalla su tratamiento.
- La capacidad efectivamente cubierta por el bundle es la reproducibilidad de un experimento de RL con retrieval medico.

## Casos de uso

- Reproduccion de experimentos de RL: el bundle permite levantar el pipeline v0910 (v5r) de cuatro brazos en un entorno nuevo sin reconstruir manualmente el codigo, los manifiestos de datos ni las rutas del corpus, lo que reduce el tiempo de puesta en marcha y los errores de configuracion.
- Analisis de fallos de entrenamiento: la telemetria incluida de los cuatro brazos permite estudiar el evento `collapse: kl_jump` y validar la hipotesis del autor sobre el falso positivo del detector, comparando `ppo_kl`, `clipfrac` y `kl_loss` paso a paso.
- Ajuste de hiperparametros de estabilidad: sirve como base para relanzar las cuatro corridas con `KL_JUMP_BASE=0,30` o `MAX_COLLAPSES=1` y medir si el entrenamiento supera el paso 31 sin abortar.
- Investigacion en RL con recompensa por juez externo: el esquema de evaluacion con `gpt-4.1-mini` y un coste estimado de unos 6 dolares por brazo y 30 pasos es directamente reutilizable como plantilla para experimentos similares con presupuesto acotado.
- Despliegue en infraestructura Blackwell: los requisitos `sm_103`/GB300 y el documento `B300_RL_DEPLOYMENT.md` convierten el bundle en una guia operativa para reproducir entrenamientos RL en hardware GB300 con Ray.
- Auditoria de pipelines medicos con retrieval: la referencia al corpus de 121 GB y a los manifiestos de datos permite auditar que fuentes documentales alimentan el entrenamiento de un sistema orientado al dominio medico.
- Reutilizacion de harness de evaluacion: el codigo de GRPO/GiGPO y el sistema de puntuacion pueden adaptarse a otros dominios sustituyendo el corpus y el juez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de rendimiento es el `best_value` del entrenamiento por recompensa: 0,27-0,32 en los cuatro brazos v0910, con terminacion entre los pasos 21 y 31. Los indicadores de estabilidad reportados en el momento del fallo son `ppo_kl <= 0,005` y `clipfrac <= 0,007`, con un `kl_loss` que derivo hacia 0,10-0,12. No se proporcionan metricas tipo MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El bundle no contiene pesos de modelo que ejecutar.
- GPU objetivo del entrenamiento: arquitectura `sm_103` con el conjunto GB300, segun la documentacion de despliegue referenciada (`B300_RL_DEPLOYMENT.md`).
- Compatibilidad con GPU de consumo: no documentada y no esperada, dado que el pipeline de RL apunta a hardware GB300.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. El despliegue descrito se basa en Ray (`ray_init.num_cpus=32`) y en la aplicacion de `patch_fork.py` tras la sustitucion de codigo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 2,2 GB; el corpus de recuperacion asociado se declara de 121 GB, por lo que el espacio total necesario es muy superior al del bundle.
- Coste de evaluacion: aproximadamente 6 dolares por brazo y 30 pasos, con la necesidad de una clave de OpenAI con saldo suficiente para el juez `gpt-4.1-mini`.

## Comparativa con modelos similares

No disponible. No se han localizado en la informacion proporcionada bundles equivalentes de artefactos RL con los que establecer una comparacion directa. Como referencia interna del propio ecosistema, el autor menciona los siguientes repositorios relacionados:

| Repositorio | Funcion | Relacion con este bundle |
|---|---|---|
| andyjoecn/TrustMed-SFT-seed1-Qwen3VL-8B | Checkpoint SFT base (semilla 1) | Punto de partida del entrenamiento RL |
| andyjoecn/TrustMed-SFT-seed2-Qwen3VL-8B | Checkpoint SFT base (semilla 2) | Punto de partida del entrenamiento RL |
| andyjoecn/TrustMed-RL-gigpo-seed1-v5r-Qwen3VL-8B | Brazo GiGPO, semilla 1 | Contiene telemetria de la ronda fallida |
| andyjoecn/TrustMed-RL-gigpo-seed2-v5r-Qwen3VL-8B | Brazo GiGPO, semilla 2 | Contiene telemetria de la ronda fallida |
| andyjoecn/TrustMed-RL-grpo-seed1-v5r-Qwen3VL-8B | Brazo GRPO, semilla 1 | Contiene telemetria de la ronda fallida |
| andyjoecn/TrustMed-RL-grpo-seed2-v5r-Qwen3VL-8B | Brazo GRPO, semilla 2 | Contiene telemetria de la ronda fallida |
| Lyra-stellAI/trustmed-medical-retrieval-2026-07 | Corpus de recuperacion | Fuente documental del pipeline |
| trustmed-local-corpus-2026-07 | Corpus local de recuperacion | Fuente documental del pipeline |

No se dispone de datos de parametros, contexto, rendimiento ni licencia de estos repositorios.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado ni pesos finales: el autor indica explicitamente que el mejor resultado revirtio al checkpoint SFT y que no se conservaron pesos entrenados.
- Ausencia total de licencia declarada, lo que impide determinar si el uso comercial esta permitido.
- No se declaran idiomas soportados, pipeline ni tipos de cuantizacion.
- Sin descargas ni likes registrados y con fecha de creacion y actualizacion el mismo dia, no existe validacion externa de su funcionamiento.
- Sesgos conocidos: no disponibles. Al tratarse de un pipeline con curation de corpus medico, el riesgo de sesgo depende del corpus de 121 GB referenciado, cuyos criterios de composicion no se detallan en esta informacion.
- Riesgo de alucinacion: no evaluable en este bundle, ya que no se distribuye un modelo para inferencia.
- La receta de despliegue depende de rutas y ficheros concretos (`/workspace/images`, `patch_fork.py`, `ray_init.num_cpus=32`) y de una arquitectura `sm_103`/GB300, lo que limita severamente la portabilidad a otras plataformas.
- El entrenamiento documentado fallo en los cuatro brazos por un evento de colapso que el autor atribuye a un falso positivo; la solucion propuesta (`KL_JUMP_BASE=0,30` o `MAX_COLLAPSES=1`) es una hipotesis no verificada en la informacion disponible.
- La evaluacion depende de un servicio externo de pago (`gpt-4.1-mini`), lo que introduce dependencia de terceros, coste por ejecucion y posible variabilidad del juez.
- Fechas de creacion y actualizacion en 2026: conviene verificar la vigencia de los enlaces y del corpus antes de reutilizar el material.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente paginas sin relacion), por lo que no ha sido posible contrastar ni ampliar la informacion de la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/andyjoecn/TrustMed-RL-v5r-resume-bundle
- Repositorio de codigo y release referenciados en la model card: `b200-package-20260910` en `Trustmed-RL/TrustMed-RL` (GitHub); no se proporciona URL directa en la informacion disponible.
- Checkpoint SFT base (semilla 1): https://huggingface.co/andyjoecn/TrustMed-SFT-seed1-Qwen3VL-8B
- Checkpoint SFT base (semilla 2): https://huggingface.co/andyjoecn/TrustMed-SFT-seed2-Qwen3VL-8B (ruta indicada como `-seed2-...`)
- Telemetria brazo GiGPO semilla 1: https://huggingface.co/andyjoecn/TrustMed-RL-gigpo-seed1-v5r-Qwen3VL-8B
- Telemetria brazo GiGPO semilla 2: https://huggingface.co/andyjoecn/TrustMed-RL-gigpo-seed2-v5r-Qwen3VL-8B
- Telemetria brazo GRPO semilla 1: https://huggingface.co/andyjoecn/TrustMed-RL-grpo-seed1-v5r-Qwen3VL-8B
- Telemetria brazo GRPO semilla 2: https://huggingface.co/andyjoecn/TrustMed-RL-grpo-seed2-v5r-Qwen3VL-8B
- Corpus de recuperacion medico: https://huggingface.co/Lyra-stellAI/trustmed-medical-retrieval-2026-07
- Corpus local de recuperacion: `trustmed-local-corpus-2026-07` (sin URL directa en la informacion disponible; se descarga mediante `pull_prebuilt.sh`)
- Documentacion de despliegue: `B300_RL_DEPLOYMENT.md` (referenciado en el repositorio de GitHub, no enlazado directamente)
- Paper, blog o demo: no disponibles en la informacion proporcionada.
