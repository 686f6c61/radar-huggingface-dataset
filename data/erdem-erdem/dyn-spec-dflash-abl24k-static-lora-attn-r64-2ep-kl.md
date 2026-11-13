# erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r64-2ep-kl

## Resumen

`dyn-spec-dflash-abl24k-static-lora-attn-r64-2ep-kl` es un checkpoint de entrenamiento publicado por el usuario erdem-erdem dentro de la familia de experimentos `dyn-spec` sobre decodificacion especulativa. No es un modelo de lenguaje generativo: es un *drafter* (modelo borrador) LoRA adaptado para acelerar la inferencia del modelo objetivo Qwen/Qwen3-8B mediante decodificacion especulativa con el metodo DFlash. El repositorio contiene el estado completo de una ejecucion de entrenamiento, incluidos el checkpoint con estado del optimizador, los resultados, las evaluaciones offline y la procedencia de los datos.

El artefacto corresponde al brazo `fresh_lora` en la etapa de preentrenamiento, con 2667 actualizaciones, semilla 42 y un adaptador LoRA de rango 64 sobre las capas de atencion. El modelo base del drafter es `z-lab/Qwen3-8B-DFlash-b16`, fijado en el commit `9b41424b7109f9c5413454f481b09a82b85333f4`, y la tienda de activaciones empleada es `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`.

Su relevancia es acotada pero tecnica: sirve como material reproducible para investigadores que trabajan en decodificacion especulativa y quieren inspeccionar el efecto de un calentamiento LoRA sobre la tasa de aceptacion del drafter. El autor advierte explicitamente de que no es un paquete de servicio (el export de serving de DFlash aun no esta portado), por lo que no debe desplegarse como modelo de chat o de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa DFlash con adaptador LoRA (rango 64) sobre capas de atencion; modelo objetivo Qwen3-8B |
| Parametros totales | no disponible (repositorio de 0.1 GB; el adaptador LoRA r64 es una fraccion del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de serving |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | z-lab/Qwen3-8B-DFlash-b16 (commit 9b41424b7109f9c5413454f481b09a82b85333f4) |
| Brazo / etapa | fresh_lora / pretraining |
| Actualizaciones | 2667 |
| Semilla | 42 |
| Git SHA | f4bfe7c430aab1f245f24c076b18eaab03e81e09 |
| SHA256 del checkpoint | 259a3b22f6e9477514d8c8d8104c76cbc0c3596e442ae3f83ad289719c025d67 |
| Tienda de activaciones | erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k |

## Arquitectura y entrenamiento

El objeto entrenado es un drafter DFlash, es decir, un modelo auxiliar que propone tokens candidatos que el modelo objetivo Qwen3-8B verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida del modelo grande. Sobre el drafter base `z-lab/Qwen3-8B-DFlash-b16` se aplica un adaptador LoRA de rango 64 restringido a las capas de atencion (variante `attn`), en el brazo `fresh_lora`, lo que implica inicializar el adaptador desde cero en lugar de reutilizar pesos de una etapa previa.

El entrenamiento se realizo durante 2667 actualizaciones con semilla 42 y utiliza una tienda de activaciones precalculada (`mix24k`, 24 000 muestras) que contiene las activaciones del modelo objetivo necesarias para el ajuste. La model card menciona una perdida con componente KL, coherente con el sufijo `kl` del identificador, y el repositorio incluye el comando de entrenamiento (`train_command.txt`) y un parche (`speculators.patch`) para reproducir la ejecucion. No se detallan en la informacion disponible el numero total de tokens procesados, la composicion exacta del dataset ni si hubo etapas posteriores de RLHF o DPO; el propio autor indica que se trata de un checkpoint de preentrenamiento.

## Capacidades

- No es un modelo de proposito general: no genera respuestas de chat ni resuelve tareas de forma autonoma.
- Funciona como drafter de decodificacion especulativa para Qwen3-8B, proponiendo tokens que el modelo objetivo valida.
- El adaptador LoRA esta especializado en capas de atencion con rango 64, segun la nomenclatura del repositorio.
- La evaluacion se desglosa por dominios (chat, code, math, stem), lo que sugiere que el drafter fue entrenado y medido sobre esa mezcla de tareas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se documentan capacidades multilingues especificas.

## Casos de uso

- Investigacion en decodificacion especulativa: el repositorio permite reproducir el entrenamiento del adaptador LoRA sobre el drafter DFlash y comparar la tasa de aceptacion antes y despues del ajuste, usando los ficheros `train_command.txt` y `speculators.patch`.
- Analisis de ablaciones: el nombre del experimento (`abl24k-static-lora-attn-r64-2ep-kl`) y la presencia de resultados offline en `run/offline_eval/` permiten estudiar el efecto del rango LoRA, la ventana de entrenamiento y la perdida KL sobre el rendimiento del drafter.
- Aceleracion de inferencia de Qwen3-8B en produccion: una vez portado el export de serving de DFlash (aun no disponible), el drafter podria reducir la latencia de generacion de Qwen3-8B en despliegues con vLLM, segun la procedencia de lanzamiento incluida en `provenance/store/`.
- Auditoria de procedencia de datos: los ficheros de identidad de la tienda de activaciones, el registro del extractor y los registros de llenado permiten verificar que activaciones se usaron y como se generaron.
- Reproduccion de experimentos: el `MANIFEST.json` con tamano y SHA256 de cada fichero, junto con el SHA del checkpoint y el Git SHA, facilita la verificacion de integridad en replicaciones.
- Docencia y formacion tecnica: como ejemplo completo de una ejecucion de entrenamiento de un drafter especulativo, con checkpoint, metricas, tiempos y procedencia en un unico repositorio.

## Benchmarks y rendimiento

La model card incluye una validacion sobre 200 filas fijas, con una fila por LoRA y metrica `full_acc`, comparando el estado inicial (update 0) con el estado final (update 2667):

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5340 | 7.889 | 0.3513 | 0.6060 | 0.6842 | 0.4944 |

El ajuste produce una mejora modesta pero consistente: +0.0075 en `full_acc`, +0.186 en longitud media de aceptacion (τ) y mejoras en los cuatro dominios evaluados. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no tendria sentido aplicarlos a un drafter.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el drafter de forma aislada; al operar junto a Qwen3-8B, el requisito dominante es el del modelo objetivo (aproximadamente 16 GB en FP16 para los pesos de 8B, mas cache KV).
- GPU recomendadas: no disponibles en la informacion proporcionada. La procedencia de lanzamiento de vLLM esta incluida en `provenance/store/`, pero no se detalla el hardware empleado.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo objetivo Qwen3-8B, que en cuantizaciones de 4 bits puede caber en GPUs de 12-24 GB, pero el drafter no dispone de export de serving.
- Opciones de despliegue: el autor indica que el export de serving de DFlash no esta portado, por lo que no hay bundle listo para vLLM, llama.cpp, Ollama ni TGI. El repositorio contiene un checkpoint de entrenamiento en `checkpoint.pt`.
- Latencia y throughput: no disponibles. La metrica τ (longitud media de aceptacion) de 7.889 en el estado final es un indicador indirecto del potencial de aceleracion, no una medida de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-abl24k-static-lora-attn-r64-2ep-kl | Drafter LoRA para DFlash sobre Qwen3-8B | no disponible (repo de 0.1 GB) | no disponible | no disponible | Checkpoint de entrenamiento, sin export de serving |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base para Qwen3-8B | no disponible | no disponible | no disponible | Modelo base del que parte este experimento |
| Qwen/Qwen3-8B | Modelo objetivo (LLM denso) | 8B | no disponible en esta ficha | no disponible en esta ficha | Modelo de servicio completo |

No se dispone de datos de rendimiento comparables entre alternativas en la informacion proporcionada; la unica comparacion cuantitativa disponible es la del propio experimento (update 0 frente a update 2667).

## Limitaciones y advertencias

- No es un modelo de servicio: el autor advierte de que el export de serving de DFlash no esta portado, por lo que no puede desplegarse directamente como endpoint de generacion.
- El checkpoint incluye estado del optimizador, lo que aumenta el tamano y no es el formato adecuado para inferencia.
- La licencia no esta declarada, lo que impide determinar si el uso comercial es posible; debe consultarse con el autor antes de cualquier uso en produccion.
- El rendimiento medido se limita a 200 filas fijas de validacion; no hay evaluacion a gran escala ni en dominios fuera de chat, code, math y stem.
- La mejora sobre el estado inicial es pequena (+0.0075 en `full_acc`), por lo que el beneficio practico del ajuste debe validarse en el escenario de despliegue concreto.
- Al ser un drafter, su calidad afecta a la velocidad pero no a la correccion final de las respuestas, que depende de la verificacion del modelo objetivo Qwen3-8B.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas propias; estos riesgos recaen sobre el modelo objetivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r64-2ep-kl
- Tienda de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
