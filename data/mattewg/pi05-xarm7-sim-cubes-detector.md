# mattewg/pi05-xarm7-sim-cubes-detector

## Resumen

El modelo `mattewg/pi05-xarm7-sim-cubes-detector` es un detector de fallos en tiempo de ejecucion (runtime failure detector) disenado para monitorizar la politica pi0.5 durante tareas de manipulacion robotica. No es un modelo de lenguaje ni de vision generativo: es una red neuronal auxiliar que lee el embedding del experto de accion (*action expert*) que produce la politica en cada inferencia y emite una puntuacion de fallo continua en el intervalo [0, 1]. Su autor es mattewg y esta publicado bajo licencia Apache 2.0 con 0 descargas y 0 likes en el momento de la consulta.

El detector se enmarca dentro del metodo denominado Hide-and-Seek (referenciado en la model card como arXiv 2605.30834) y esta entrenado especificamente para el checkpoint pi0.5 `cubes_v2_mn` paso 20000 (`mattewg/pi05-xarm7-sim-cubes-step20000`) en un entorno simulado con un robot xArm7 y tres cubos. Es, por tanto, un componente fuertemente acoplado: los embeddings de cualquier otro checkpoint requieren reentrenar el detector.

Su relevancia practica reside en que permite abortar episodios condenados al fracaso de forma temprana, sin falsos positivos en la evaluacion publicada. Segun la model card, el detector confirma un fallo una vez que un exito ya se habria completado (no lo predice), con una mediana de alarma de 33,9 segundos, y no permite recuperar el episodio mediante rebobinado: su funcion es abortar, no corregir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal auxiliar sobre embeddings de la politica pi0.5; `hidden_size` 256, `context_length` 16, `input_dim` 1024 (tipo exacto de capas no disponible) |
| Parametros totales | no disponible (no se publica el recuento; configuracion: entrada 1024, oculta 256, contexto 16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16 (ventana temporal del detector, segun `config.context_length`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`state_dict` dentro de un diccionario con `input_dim` y `config`) |

## Arquitectura y entrenamiento

El detector consume el embedding del experto de accion de la politica pi0.5, que es un vector `float32[1024]` (`input_dim: 1024`). Segun los ficheros publicados, la red tiene `hidden_size` 256 y una `context_length` de 16, lo que indica que opera sobre una ventana temporal de hasta 16 embeddings consecutivos para emitir su puntuacion. El fichero `detector.pt` contiene un diccionario con `input_dim`, `config` y `state_dict`. No se detalla en la informacion disponible el tipo exacto de capas (transformer, GRU, MLP temporal, etc.) ni el numero de parametros resultante.

El entrenamiento se realizo sobre 600 rollouts en simulacion, con una distribucion de 160 exitos y 440 fallos. La politica base, pi0.5, es un modelo vision-lenguaje-accion (VLA) generalista de robotica que coentrena datos de demos roboticas, datos web y subtareas semanticas para generalizacion en manipulacion de horizonte largo, segun la documentacion de Qualcomm AI Hub. El detector no modifica la politica: se ejecuta como monitor de runtime y requiere un cambio en openpi para que `Policy.infer` devuelva el embedding. Ademas del `state_dict`, el repositorio incluye un `calibration.json` con bandas conformales por nivel alpha (0.15 / 0.20 / 0.25) para el bucle de simulacion, y un `metrics.json` con la evaluacion offline sobre el split reservado.

## Capacidades

- Deteccion de fallos en runtime: emite una puntuacion de fallo en [0, 1] a partir del embedding del experto de accion de pi0.5.
- Monitorizacion temporal: usa una ventana de contexto de 16 inferencias para estabilizar la decision.
- Regla de alarma configurable: la implementacion de referencia (`FailureMonitor`) dispara alarma cuando la puntuacion es mayor o igual a 0,5 durante 5 inferencias consecutivas.
- Calibracion conformal: incluye bandas de calibracion por nivel alpha para el bucle simulado.
- Integracion con openpi: requiere y aprovecha el cambio que hace que `Policy.infer` devuelva el embedding.
- No es un modelo generativo: no genera texto, codigo ni acciones; no soporta tool calling, agentes, vision ni audio por si mismo.
- Acoplamiento estricto a un unico checkpoint: solo es valido para pi0.5 `cubes_v2_mn` paso 20000.

## Casos de uso

- Aborto temprano de episodios fallidos en simulacion: integrado en el bucle de simulacion, el detector dispara una alarma que permite terminar el episodio antes de consumir mas tiempo de computo, segun los resultados en vivo (21 de 22 fallos detectados, 0 de 8 falsos positivos).
- Evaluacion automatizada de politicas roboticas: al puntuar cada inferencia, permite etiquetar rollouts como exitosos o fallidos sin inspeccion manual, usando el split reservado y `metrics.json` como referencia.
- Investigacion en seguridad robotica: sirve como ejemplo reproducible de monitor de runtime basado en representaciones internas de la politica, util para estudiar deteccion de fallos sin acceso a la recompensa.
- Benchmarking de detectores de fallo: la tasa de deteccion (162 de 176 fallos) y la tasa de falsos positivos (0 de 32) constituyen una linea base publicada para comparar metodos alternativos.
- Supervision de despliegues en simulacion con multiples rollouts: la mediana de alarma de 33,9 segundos permite dimensionar politicas de timeout en pipelines de evaluacion por lotes.
- Estudio de generalizacion de monitores: al depender de embeddings especificos de checkpoint, es un caso de estudio sobre el coste de reentrenar monitores cuando cambia la politica subyacente.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son los de la propia model card, correspondientes a la evaluacion del detector, no a benchmarks de lenguaje o codigo.

| Escenario | Fallos detectados | Falsos positivos | Notas |
|---|---|---|---|
| Split reservado (offline) | 162 / 176 | 0 / 32 | Con la regla de alarma de 5 inferencias consecutivas; mediana de alarma 33,9 s |
| Bucle en vivo (simulacion) | 21 / 22 | 0 / 8 | Ejecucion integrada en el bucle de simulacion |
| Entrenamiento | 600 rollouts | — | 160 exitos / 440 fallos |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, lo cual es coherente con la naturaleza no generativa del modelo.

## Requisitos de hardware

- VRAM del detector: muy baja; con `input_dim` 1024, `hidden_size` 256 y contexto 16, la red es de tamano reducido y cabe holgadamente en cualquier GPU consumer. No se publica un recuento de parametros exacto.
- VRAM de la politica base: el requisito dominante es el de pi0.5, que es un VLA de gran tamano; no se especifica en la informacion disponible la VRAM exacta necesaria para pi0.5.
- GPU recomendadas: no disponible de forma especifica; el detector se ejecuta junto a la politica, por lo que las GPU aptas son las que soporten pi0.5 (A100, H100, RTX 4090 u otras segun la variante y la cuantizacion).
- Cabe en GPU consumer: el detector si; la politica base depende de su configuracion y no se detalla.
- Opciones de despliegue: el codigo de referencia vive en `hide_and_seek/` (rama `detector/hide-and-seek`) del repositorio `KKallidromitis/xarm-robotics`, con `monitor.py`; requiere openpi modificado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia y throughput: no disponible; la unica metrica temporal publicada es la mediana de alarma de 33,9 segundos.

## Comparativa con modelos similares

No se dispone de detectores de fallo de runtime comparables publicados en la informacion proporcionada, por lo que la comparativa directa es "no disponible". Los elementos relacionados que si aparecen son los siguientes:

| Modelo / componente | Rol | Relacion con este modelo |
|---|---|---|
| pi0.5 (`cubes_v2_mn` paso 20000) | Politica VLA base | Checkpoint exacto sobre el que se entreno el detector; imprescindible |
| pi0.5 (Qualcomm AI Hub) | Modelo VLA generalista | Modelo base de la familia, publicado por Qualcomm AI Hub |
| mattewg/pi05-xarm7-sim-cubes-step20000 | Checkpoint concreto | Unica politica valida para este detector |
| mattewg/xarm7_sim_three_cubes | Dataset | Datos de manipulacion con xArm7 y tres cubos, 50 FPS, multiples camaras |

No se conocen, segun la informacion disponible, otros detectores de fallo para pi0.5 con los que comparar parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Acoplamiento a un unico checkpoint: los embeddings de cualquier otro checkpoint requieren un detector nuevo; no es reutilizable tal cual.
- Confirma, no predice: el detector confirma un fallo despues de que un exito ya se habria completado, por lo que no anticipa el resultado.
- No permite recuperacion: rebobinar al disparo de la alarma no recupera el episodio; la unica accion indicada es abortar.
- Entrenado solo en simulacion: los 600 rollouts son simulados (xArm7, tres cubos), por lo que la transferencia a hardware real no esta validada en la informacion disponible.
- Sensibilidad a falsos positivos con otros datos: aunque la evaluacion publicada reporta 0 falsos positivos, esta se limita al split reservado y al bucle simulado descritos.
- Sin datos de sesgo, idioma o cuantizacion: al no ser un modelo linguistico, no aplican sesgos linguisticos, pero tampoco se documentan otros sesgos.
- Dependencia de parches en openpi: requiere una modificacion del codigo de openpi para exponer el embedding, lo que puede complicar el mantenimiento.
- Licencia Apache 2.0: permite uso comercial del detector, pero el uso de la politica pi0.5 subyacente queda sujeto a la licencia de ese modelo, que no se detalla aqui.
- Repositorio vacio o minimo: el tamano del repo es 0,0 GB en la informacion proporcionada, lo que sugiere que los ficheros pueden no estar materializados o son de muy bajo peso.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mattewg/pi05-xarm7-sim-cubes-detector
- Checkpoint de la politica: https://huggingface.co/mattewg/pi05-xarm7-sim-cubes-step20000
- Codigo (rama `detector/hide-and-seek`): https://github.com/KKallidromitis/xarm-robotics
- Dataset: https://huggingface.co/datasets/mattewg/xarm7_sim_three_cubes
- Ficha del dataset en Claru: https://claru.ai/datasets/mattewg-xarm7-sim-three-cubes
- pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.ai/models/pi05
- Codigo de pi0.5 en Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
- Listado de modelos con tag xarm7 en HuggingFace: https://huggingface.co/models?other=xarm7
- Paper del metodo Hide-and-Seek: arXiv 2605.30834 (referencia citada en la model card)
