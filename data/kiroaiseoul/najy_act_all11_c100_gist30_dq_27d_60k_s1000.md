# kiroaiseoul/NAJY_act_all11_c100_gist30_dq_27D_60k_s1000

## Resumen

NAJY_act_all11_c100_gist30_dq_27D_60k_s1000 es un checkpoint de politica robotica entrenado con la libreria LeRobot mediante el algoritmo ACT (Action Chunking Transformer). Lo publica el usuario kiroaiseoul en HuggingFace y esta pensado como artefacto de analisis y evaluacion dentro de un flujo de trabajo interno de robotica con robots Trossen Mobile AI. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 0,2 GB.

A diferencia de los modelos de lenguaje, este modelo no genera texto: consume observaciones (estado del robot de 27 dimensiones y tres flujos de imagen de 480x640) y produce un vector de accion de 16 dimensiones. El checkpoint corresponde al paso 60.000 de la ejecucion `exp_all11_c100_gist30_dq_s1000`, con 51.700.368 parametros totales. La model card indica explicitamente que se sube para analisis y puntuacion, y que no equivale a la confirmacion de un candidato para despliegue en hardware real.

Su relevancia es acotada pero concreta: sirve para reproducir una politica de manipulacion entrenada sobre 11 fases o tareas (`all11`), con tres camaras (alta, muneca izquierda y muneca derecha) y licencia Apache 2.0, lo que permite inspeccionar, evaluar y reutilizar el checkpoint sin restricciones comerciales. La nomenclatura del `run` sugiere un tamano de chunk de 100 acciones (`c100`), aunque este dato no se confirma de forma explicita en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), implementacion de la libreria LeRobot |
| Parametros totales | 51.700.368 (aprox. 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de observacion y el tamano de chunk no estan documentados) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye pesos en safetensors; no se listan versiones GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (modelo de politica robotica; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Espacio de observacion | `observation.state`: 27 dimensiones; `observation.images.cam_high`, `cam_left_wrist`, `cam_right_wrist`: 3x480x640 cada una |
| Espacio de accion | 16 dimensiones |
| Paso de entrenamiento | 60.000 |
| Tamano del repositorio | 0,2 GB |
| Checksum publicado | `model.safetensors` sha256 `bb1d3981570dea83b28ac5e4893db3b4e35248a5385dd719c5ce911efed4d44b` |

## Arquitectura y entrenamiento

La arquitectura declarada en las etiquetas es ACT, un transformer de troceado de acciones (Action Chunking Transformer) integrado en LeRobot. El modelo recibe como entrada un vector de estado del robot de 27 dimensiones junto con tres imagenes RGB de 480x640 (camara alta, muneca izquierda y muneca derecha) y emite un vector de accion de 16 dimensiones. El numero total de parametros, 51.700.368, es coherente con una red de politica compacta que combina un encoder visual y un transformer de decodificacion de acciones; la composicion exacta de capas, dimensiones y cabezas de atencion no se detalla en la model card.

Los datos de entrenamiento estan definidos por el manifiesto `configs/datasets/all11_tr_hot_gist30_dq.json`, referenciado en la primera linea del registro de entrenamiento (`=== launch 2026-10-11T17:13:54+00:00 git 8f411d9 manifest configs/datasets/all11_tr_hot_gist30_dq.json sha256 8dc2df6d7943459e`). El sufijo `all11` apunta a una combinacion de 11 tareas o fases, y `hot_gist30` sugiere alguna forma de resumen o destilado de instrucciones, pero la informacion disponible no describe la composicion del dataset, el numero de episodios, el numero de tokens o frames procesados, ni si se aplicaron etapas de RLHF o DPO, algo por otra parte poco habitual en politicas de imitacion. El checkpoint se entreno en un nodo identificado como DGX_1 (1.ª unidad) y existe un fondo documental asociado en `trossen-ai-simulation`, concretamente en `docs/mobile_base_investigation.md` seccion 94. La model card menciona ademas un fichero `multi_manifest.json` con indicadores de evaluacion y un script `stage_cond_diag.py` que consume el checkpoint con la estructura `pretrained_model`.

## Capacidades

- Generacion de acciones de control continuo: produce vectores de 16 dimensiones a partir de observaciones multimodales, adecuado para control de manipuladores.
- Percepcion visual multi-camara: procesa simultaneamente tres flujos de imagen de 480x640, lo que permite cubrir vista global y ambas munescas.
- Fusion de estado propioceptivo y vision: integra un vector de estado de 27 dimensiones con las imagenes en una unica politica.
- Ejecucion de politicas troceadas (action chunking): la nomenclatura `c100` del `run` sugiere prediccion de secuencias de 100 acciones, aunque no se confirma en la model card.
- Cobertura multi-tarea: el identificador `all11` indica entrenamiento sobre 11 tareas o fases agregadas en un mismo manifiesto.
- Compatibilidad con el ecosistema LeRobot: el repositorio sigue la estructura `pretrained_model`, por lo que se puede cargar directamente en herramientas de evaluacion del propio framework.
- Soporte de tool calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes basados en texto; el razonamiento se limita a la planificacion implicita de la secuencia de acciones.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no se declaran modos de pensamiento, audio ni vision generativa.

## Casos de uso

- Evaluacion comparativa de checkpoints de ACT: el repositorio incluye un checksum sha256 publicado y un `multi_manifest.json` con indicadores, de modo que un equipo puede verificar la integridad del fichero y puntuar el checkpoint frente a otras variantes del mismo entrenamiento.
- Manipulacion bimanual sobre plataforma Trossen Mobile AI: al disponer de una accion de 16 dimensiones y tres camaras (incluidas las de ambas munescas), el modelo encaja en tareas de recogida y colocacion con dos brazos.
- Control de robot movil con base: la referencia a `mobile_base_investigation.md` y el estado de 27 dimensiones sugieren uso en plataformas con base movil, donde la politica aprende a coordinar desplazamiento y manipulacion.
- Reentrenamiento con fine-tuning sobre datos propios: al ser un checkpoint intermedio de 51,7 M de parametros y licencia Apache 2.0, es viable reentrenarlo con grabaciones nuevas de una celda de trabajo concreta.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del numero de tareas (`all11`), del resumen de instrucciones (`gist30`) o del preprocesado (`dq`) sobre el rendimiento de una politica ACT.
- Simulacion y validacion previa al despliegue: cargando el checkpoint en un simulador se puede comprobar el comportamiento de la politica antes de autorizar su uso en el robot fisico, algo coherente con la advertencia de la model card de que el modelo se sube para analisis.
- Diagnostico de politicas condicionadas por etapa: la mencion a `stage_cond_diag.py` indica que el checkpoint se usa en herramientas de diagnostico de condicionamiento por etapa, util para depurar por que una fase concreta falla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion ni comparaciones numericas con otras politicas; solo indica que el modelo se sube para analisis y puntuacion, y que el sistema de evaluacion lee los indicadores de `multi_manifest.json`, fichero que no se detalla en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parametros, los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16 o bf16. Sumando activaciones de tres imagenes de 480x640, el consumo real se mantiene por debajo de 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en terminos de memoria. Para latencia baja en bucle de control son preferibles RTX 4090, RTX 3090, A100 o H100; para entrenamiento, el autor uso un nodo DGX.
- Viabilidad en GPU de consumo: si, cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en equipos con graficas integradas modestas si se acepta mayor latencia.
- Opciones de despliegue: LeRobot (carga como `pretrained_model`), PyTorch con TorchScript o exportacion a ONNX, y en general cualquier runtime que ejecute redes de vision y transformadores. No aplica vLLM, TGI ni Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia por chunk ni rendimiento en Hz.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa. La comparacion siguiente es de categoria y debe tomarse como orientativa, ya que los datos de las alternativas no se han verificado en la informacion proporcionada.

| Modelo | Tipo | Parametros | Espacio de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_gist30_dq_27D_60k_s1000 | ACT (LeRobot) | 51,7 M | 16 dimensiones, estado de 27 | Apache 2.0 | HuggingFace |
| Otros checkpoints ACT de LeRobot | ACT (LeRobot) | no disponible | no disponible | habitualmente Apache 2.0 | HuggingFace |
| Diffusion Policy | politica generativa por difusion | no disponible | no disponible | no disponible | implementaciones publicas |
| SmolVLA | vision-language-action | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- La propia model card advierte que el checkpoint se sube para analisis y puntuacion, y que no constituye la confirmacion de un candidato para despliegue en el robot real.
- No se documentan sesgos del dataset de entrenamiento, ni su composicion demografica, de iluminacion, de objetos o de entornos; esto limita la confianza en la generalizacion fuera de las condiciones de recogida.
- Riesgo de alucinacion en el sentido clasico no aplica, pero si existe riesgo de acciones incorrectas o inseguras cuando la politica se enfrenta a observaciones fuera de distribucion.
- La tarea de evaluar el modelo exige respetar el espacio de observacion exacto: estado de 27 dimensiones y tres imagenes de 480x640 (`cam_high`, `cam_left_wrist`, `cam_right_wrist`); cualquier cambio de camaras o de orden de dimensiones invalida el checkpoint.
- No se documenta la semantica de las 16 dimensiones de accion ni de las 27 de estado, por lo que la integracion con un robot concreto requiere ingenieria inversa o acceso al codigo de entrenamiento.
- No se declaran idiomas soportados porque el modelo no procesa lenguaje; cualquier modulo de instrucciones en lenguaje natural (`gist30`) es externo al fichero de pesos.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero no se ofrece ninguna garantia de seguridad funcional ni de idoneidad para produccion; la responsabilidad de validar el comportamiento en hardware real recae en quien lo despliega.
- El repositorio no incluye versiones cuantizadas ni formatos alternativos, lo que obliga a exportar el modelo si se necesita desplegar en hardware embebido.
- No hay datos publicos de rendimiento, tasa de exito ni latencia, por lo que no es posible estimar su fiabilidad en produccion a partir de la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_dq_27D_60k_s1000
- Documentacion de referencia citada por el autor: `trossen-ai-simulation`, `docs/mobile_base_investigation.md`, seccion 94 (no se proporciona URL directa en la informacion disponible)
- Libreria LeRobot (framework de carga y evaluacion): no se proporciona URL en la informacion disponible
- Paper de ACT (Action Chunking Transformer): no se proporciona URL en la informacion disponible
