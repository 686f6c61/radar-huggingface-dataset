# QZWang/Awomo-0.6-RoboTwin-AP338

## Resumen

Awomo-0.6 RoboTwin AP338 es un checkpoint de inferencia publicado por el usuario QZWang en Hugging Face. Se trata de un modelo de política visomotora (vision-language-action, VLA) orientado a manipulación robótica, inicializado a partir de 100.000 actualizaciones de preentrenamiento y afinado posteriormente sobre el benchmark RoboTwin durante 40.000 actualizaciones adicionales. El checkpoint evaluado corresponde a `epoch_1_step_39999`.

El modelo se apoya en componentes de terceros: un VAE de FLUX.2-klein-base-4B y Qwen3-VL-4B-Instruct como base visión-lenguaje, además de un mecanismo denominado "Action-as-Patch" del que no se detalla la implementación. La model card reporta una tasa de éxito del 86,47% agregada sobre 10.000 episodios (50 tareas × 100 episodios × 2 condiciones), con un 88,16% en condición limpia y un 84,78% en condición aleatoria.

La relevancia de esta publicación es limitada y fundamentalmente experimental: el repositorio no incluye el código de inferencia, las instrucciones de carga verificadas ni el estado del optimizador, y el propio autor advierte que la equivalencia con el protocolo oficial del leaderboard de RoboTwin no ha sido verificada de forma independiente. Es, por tanto, un artefacto de investigación reproducible solo parcialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en Qwen3-VL-4B-Instruct con "Action-as-Patch" y VAE de FLUX.2-klein-base-4B (detalles no disponibles) |
| Parametros totales | no disponible (el backbone VLM declarado es de 4B; el total del sistema no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (incluye `ema/`, `vl_lora/ema.safetensors`, `model/` y ficheros de normalización) |

## Arquitectura y entrenamiento

La información disponible describe un pipeline de entrenamiento en dos fases: 100.000 actualizaciones de preentrenamiento seguidas de 40.000 actualizaciones de ajuste fino sobre RoboTwin. El checkpoint evaluado es `epoch_1_step_39999`. Los pesos evaluados son la EMA principal en `ema/` (con `sigma_rel` 0.1) junto con el adaptador LoRA `vl_lora/ema.safetensors`, ambos con 40.000 actualizaciones.

El sistema combina un backbone visión-lenguaje (Qwen3-VL-4B-Instruct), un VAE procedente de FLUX.2-klein-base-4B y un mecanismo llamado "Action-as-Patch" para la generación de acciones. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El repositorio conserva los ficheros originales de `model/`, los pesos EMA de evaluación, el adaptador LoRA y los ficheros de normalización, pero no el estado del optimizador ni la EMA secundaria, por lo que no permite reanudar el entrenamiento.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales e instrucciones en lenguaje natural, en el entorno del benchmark RoboTwin.
- Evaluación sobre 50 tareas de manipulación con 100 episodios por tarea y condición (limpia y aleatoria).
- Integración de percepción visual y comprensión lingüística mediante el backbone Qwen3-VL-4B-Instruct.
- Ajuste específico mediante LoRA sobre el componente visión-lenguaje.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso agéntico, multilingüismo ni modos de "thinking".
- No se documentan capacidades de visión general, audio u otras modalidades fuera del ámbito robótico.

## Casos de uso

- Evaluación comparativa en RoboTwin: el checkpoint puede emplearse para reproducir o contrastar los resultados reportados (86,47% agregado) frente a otras políticas VLA en el mismo benchmark, siempre que se reconstruya el pipeline de inferencia.
- Investigación en políticas visomotoras: sirve como punto de partida para estudiar el efecto del ajuste fino LoRA sobre un backbone Qwen3-VL en tareas de manipulación.
- Análisis de robustez ante variaciones de condición: la separación entre condición limpia (88,16%) y aleatoria (84,78%) permite estudiar la degradación del rendimiento bajo distribución desplazada.
- Estudio de EMA en entrenamiento de políticas: al publicarse los pesos EMA con `sigma_rel` 0.1, permite analizar el impacto de la media móvil exponencial en la estabilidad de la política resultante.
- Reproducción de experimentos de "Action-as-Patch": útil para grupos que investiguen esta técnica de tokenización de acciones, aunque requerirán implementar el código de inferencia por su cuenta.
- Base para ajuste fino posterior en dominios robóticos propios: al incluir el adaptador LoRA y los ficheros de normalización, puede servir de inicialización para experimentos adicionales, asumiendo la ausencia de estado del optimizador.

## Benchmarks y rendimiento

| Evaluacion | Exitos / episodios | Tasa de exito |
|---|---:|---:|
| Condicion limpia (Clean) | 4408 / 5000 | 88,16% |
| Condicion aleatoria (Random) | 4239 / 5000 | 84,78% |
| Agregado (Overall) | 8647 / 10000 | 86,47% |

La evaluación empleó 50 tareas con 100 episodios por tarea y condición. Cada combinación tarea-condición usa un prefijo histórico de 10 casos y 90 casos adicionales cualificados por expertos; las excepciones en la fase de experto se omitieron y registraron. El autor indica explícitamente que la equivalencia con el protocolo oficial del leaderboard y el procedimiento de replay recuperado no ha sido verificada de forma independiente, y no se reclama aceptación en el leaderboard. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 32,1 GB e incluye pesos del backbone, EMA, LoRA y ficheros de normalización; como referencia, un backbone de 4B en precisión de 16 bits requiere del orden de 8 GB solo para pesos, a lo que se suma el VAE de FLUX.2-klein-base-4B y el resto de componentes.
- GPU recomendadas: no disponible. Por el tamaño agregado del repositorio, es previsible que se requieran GPU con 24 GB o más de VRAM, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada. No se documenta si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no disponible. No se publican instrucciones de carga ni código de inferencia; se requiere "código compatible con Action-as-Patch", el VAE de FLUX.2-klein-base-4B y Qwen3-VL-4B-Instruct. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Awomo-0.6 RoboTwin AP338 | no disponible (backbone 4B) | no disponible | 86,47% en RoboTwin (no verificado) | no disponible | Checkpoint de inferencia en HF, sin código |
| Políticas VLA comparables en RoboTwin | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han incluido alternativas concretas para no inventar datos.

## Limitaciones y advertencias

- El autor advierte que la equivalencia con el protocolo oficial del leaderboard de RoboTwin y el procedimiento de replay no han sido verificados de forma independiente; no se reclama aceptación en el leaderboard.
- El repositorio no incluye el código de inferencia ni instrucciones de carga verificadas de extremo a extremo, lo que impide su uso directo sin trabajo adicional de ingeniería.
- No es un checkpoint completo de reanudación de entrenamiento: faltan el estado del optimizador y la EMA secundaria.
- Las siete rutas internas de `config.yaml` se han sustituido por marcadores de variable de entorno; es necesario configurarlas manualmente antes de usar la configuración.
- La licencia no está declarada, lo que impide determinar si se permite uso comercial.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas.
- El ámbito de aplicación está restringido a tareas de manipulación del benchmark RoboTwin; no hay evidencia de generalización fuera de ese dominio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/QZWang/Awomo-0.6-RoboTwin-AP338
- Pull request con resultados y conteos por tarea: https://github.com/RoboTwin-Platform/RoboTwin-Platform.github.io/pull/1
- Repositorio del benchmark RoboTwin: no disponible en la información proporcionada
- Paper de RoboTwin: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible
