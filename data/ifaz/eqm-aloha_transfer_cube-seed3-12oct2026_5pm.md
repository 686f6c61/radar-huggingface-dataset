# iFaz/eqm-aloha_transfer_cube-seed3-12oct2026_5pm

## Resumen

El modelo `iFaz/eqm-aloha_transfer_cube-seed3-12oct2026_5pm` es una política de control robótico entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Lo publica el usuario iFaz y está etiquetado con el tipo de política `eqm`, aunque la propia plantilla de la model card advierte de que el tipo de modelo no fue reconocido al generar la documentación, por lo que no hay descripción oficial de su arquitectura interna.

El modelo resuelve una tarea concreta del benchmark ALOHA simulado: `transfer_cube`, es decir, la transferencia de un cubo entre efectores en el entorno `lerobot/aloha_sim_transfer_cube_human`, con datos de demostraciones humanas. Se trata por tanto de un artefacto de investigación reproducible (incluye semilla y fecha en el nombre, `seed3-12oct2026_5pm`), no de un modelo de propósito general.

Con 18.808.824 parámetros reales en safetensors y un repositorio de 0,1 GB, es un modelo muy pequeno, apto para entrenamiento e inferencia en hardware modesto. Su relevancia es acotada: sirve para reproducir y comparar políticas de imitación sobre una tarea estándar de manipulación bimanual, y su licencia Apache 2.0 facilita su reutilización. No se han publicado idiomas soportados, contexto, cuantizaciones ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de robótica de LeRobot, tipo `eqm`; arquitectura interna no documentada |
| Parametros totales | 18.808.824 (~18,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el horizonte de observación y el chunk de acciones no se especifican) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no aplica: modelo de control robótico, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | lerobot/aloha_sim_transfer_cube_human |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna. La model card se generó automáticamente con la plantilla de LeRobot y muestra el aviso «Model type not recognized — please update this template», de modo que no hay detalle sobre el tipo de red (transformer, difusión, modelo equivariante u otro), el número de capas, el mecanismo de atención ni el diseño del cabezal de acciones. El tag `eqm` es el único indicio del tipo de política, pero el README no lo desarrolla.

Respecto al entrenamiento, lo único confirmado es el dataset de demostraciones humanas `lerobot/aloha_sim_transfer_cube_human` (entorno ALOHA simulado, tarea de transferencia de cubo) y el uso del flujo de entrenamiento de LeRobot. No se indican tokens ni episodios vistos, composición del dataset, número de pasos de entrenamiento, ni si hubo etapas de refinamiento tipo RLHF o DPO (poco habituales en políticas de imitación). El sufijo `seed3` sugiere que se fijó la semilla 3 para hacer el resultado reproducible, y la marca temporal `12oct2026_5pm` apunta a una ejecución concreta de un barrido de experimentos.

Cabe senalar una inconsistencia en la propia model card: el ejemplo de entrenamiento incluido usa `--policy.type=act`, mientras que los tags y el nombre indican `eqm`. Esto sugiere que el README es la plantilla por defecto sin adaptar y que el comando de ejemplo no corresponde necesariamente al modelo publicado.

## Capacidades

- Control robótico por imitación: genera acciones motrices a partir de observaciones del entorno ALOHA simulado para la tarea de transferencia de cubo.
- Ejecución autónoma de una política entrenada: puede desplegarse con `lerobot-record` para rodar episodios de evaluación (por ejemplo, 10 episodios) y registrar los resultados.
- Aprendizaje a partir de demostraciones humanas: la política se ha entrenado sobre un dataset de teleoperación humana en simulación.
- Reproducibilidad experimental: la semilla y la fecha quedan fijadas en el identificador del repositorio.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni soporte multilingüe: es un modelo de control, no un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos en robótica: sirve como checkpoint de referencia para replicar los resultados de una ejecución concreta (semilla 3) sobre la tarea `transfer_cube` en ALOHA simulado, comparando contra otras semillas o variantes.
- Comparación de políticas de imitación en LeRobot: puede evaluarse frente a políticas ACT, Diffusion Policy u otras del mismo framework sobre el mismo dataset, usando el mismo protocolo de `lerobot-record`.
- Docencia y formación en aprendizaje por imitación: al ser un modelo de 18,8 M de parámetros y 0,1 GB, es adecuado para que estudiantes inspeccionen pesos, ejecuten el pipeline completo de LeRobot y observen el ciclo entrenamiento-evaluación en simulación.
- Pruebas de integración de infraestructura de evaluación: útil para validar pipelines de CI que descargan checkpoints, lanzan simulaciones y verifican tasas de éxito sin consumir recursos de GPU relevantes.
- Investigación en robustez y variabilidad de semilla: permite estudiar cuánto varía el rendimiento de una misma política según la inicialización, sirviendo de punto de partida para análisis estadísticos multi-semilla.
- Base para fine-tuning en tareas de manipulación relacionadas: al estar bajo Apache 2.0 y en formato safetensors compatible con LeRobot, puede reentrenarse o ajustarse sobre otros datasets de ALOHA o de robots SO-100/SO-101, aunque requeriría confirmar la compatibilidad de la arquitectura `eqm`.
- Prototipado de despliegue en robot real: el flujo documentado de LeRobot permite conectar un seguidor tipo `so100_follower` con `--policy.path` apuntando a este checkpoint, si bien la política se entrenó en simulación y necesitaría evaluación previa al transfer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 18,8 M de parámetros, la huella de pesos es de aproximadamente 75 MB en fp32 y 38 MB en fp16; sumando activaciones y buffer de observaciones, el consumo real es del orden de cientos de MB, no de GB.
- GPU recomendadas: cualquier GPU con soporte CUDA funciona; una RTX 3060, RTX 4060 o superior es más que suficiente. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos anos, e incluso en CPU para inferencia a baja frecuencia de control.
- Opciones de despliegue: LeRobot (`lerobot-record` para evaluación e inferencia, `lerobot-train` para reentrenamiento), con `--policy.device=cuda` o CPU. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a políticas de robótica.
- Latencia y throughput estimados: no disponible. Dependen del entorno de simulación y del bucle de control, no del modelo, dado su tamano reducido.
- Nota: el despliegue real requiere además el entorno de simulación o el robot físico correspondiente, cuyo coste computacional suele superar con creces el del propio modelo.

## Comparativa con modelos similares

No se dispone de cifras verificables de modelos comparables en la información proporcionada. La comparación se limita a dimensiones conocidas.

| Modelo | Tipo de política | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| iFaz/eqm-aloha_transfer_cube-seed3 | eqm (LeRobot) | 18,8 M | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot | ACT | no disponible | Apache 2.0 (framework) | Framework LeRobot |
| Diffusion Policy de LeRobot | difusión | no disponible | Apache 2.0 (framework) | Framework LeRobot |
| Otras políticas LeRobot (VQ-BeT, TDMPC, etc.) | varias | no disponible | Apache 2.0 (framework) | Framework LeRobot |

La única comparación fiable es funcional: todas ellas se entrenan y evalúan con el mismo flujo de LeRobot sobre datasets como `aloha_sim_transfer_cube_human`, por lo que son intercambiables en el pipeline aunque sus arquitecturas difieran.

## Limitaciones y advertencias

- Ámbito muy restringido: la política está entrenada para una única tarea (`transfer_cube`) en un entorno simulado ALOHA. No generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Brecha simulación-realidad: al proceder de demostraciones humanas en simulación, el rendimiento en un robot físico no está garantizado y requeriría validación.
- Documentación insuficiente: la model card es la plantilla por defecto de LeRobot, con el aviso de tipo de modelo no reconocido y un ejemplo de entrenamiento que usa `--policy.type=act`, incoherente con el tag `eqm`. No hay información sobre arquitectura, hiperparámetros ni datos de entrenamiento.
- Ausencia de métricas: sin benchmarks ni tasas de éxito publicadas, no es posible valorar la calidad de la política a priori.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.
- Riesgo de sesgo: los datos de demostración humana pueden incorporar sesgos de trayectoria y de posicionamiento propios de la persona que teleoperó; no hay análisis de este extremo.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera lenguaje), pero sí existe riesgo de acciones erráticas o fuera de distribución ante observaciones no vistas.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y de copyright. No se identifican restricciones adicionales, pero conviene verificar que el dataset de origen no imponga condiciones extra.
- Advertencia de producción: para uso real debería congelarse una versión del entorno de LeRobot y del dataset, y establecerse un protocolo de evaluación con episodios suficientes antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-12oct2026_5pm
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre la política `eqm`; los únicos resultados obtenidos correspondían a servicios de VPN sin relación con el modelo. No se han localizado papers, blogs ni demos adicionales.
