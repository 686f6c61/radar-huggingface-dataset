# hmkang/wam_ctxpool_xattn

## Resumen

WAM_DIT4DIT es un modelo de mundo de video (video world model) desarrollado por el autor hmkang, basado en Wan2.2-TI2V-5B, un Diffusion Transformer (DiT) de 5 mil millones de parametros. El modelo ha sido afinado sobre el entorno RoboCasa, centrado en escenas de cocina, para predecir la evolucion de un video a partir de un historial de frames condicionantes. La innovacion principal es un mecanismo de context pooling que comprime tres frames de contexto en un unico frame de movimiento usando un pooler de atencion cruzada dedicado, con 24 cabezas y rope 3D sobre consultas y claves, y una salida inicializada a cero.

El problema que resuelve es la necesidad de modelar el entorno y anticipar consecuencias visuales de acciones en robotica domesica, sin depender de un modelo de lenguaje. Es relevante porque propone una arquitectura de pooling de contexto para ventanas largas de video en modelos de difusion, reduciendo el coste computacional de la historia sin perder informacion. El repositorio contiene pesos en formato safetensors, con checkpoints cada 20k pasos, y el codigo fuente esta disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video DiT (Diffusion Transformer) con context pooling y pooler de atencion cruzada |
| Parametros totales | 5B (Wan2.2-TI2V-5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de video; usa historial de 4 frames con pooled motion frame) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Wan2.2-TI2V-5B, un video DiT afinado sobre RoboCasa con la configuracion base, batch efectivo de 64 y una historia de 4 frames (`nin=25/nout=41`, `fdf=2`). Antes del bloque L=3, los 3 frames latentes condicionantes pasados se combinan en un unico frame de movimiento mediante un ContextPooler que suma la media de los frames pasados (mean pooling) con una atencion cruzada que toma como consulta los tokens del frame actual y como claves y valores los tokens de los frames pasados. El pooler usa 24 cabezas con rope 3D en consultas y claves, y una salida con inicializacion a cero, de modo que en el paso 0 se comporta como un promedio simple. Existen dos variantes: `xattn_L3` (solo atencion cruzada) y `xattn_ffn_L3` (atencion cruzada mas una red FFN de refinamiento con 4x hidden y salida zero-init). Los checkpoints se guardan cada 20.000 pasos. No se proporcionan datos de composicion exacta del dataset ni se menciona RLHF o DPO.

## Capacidades

- Prediccion de video de mundo: genera secuencias de video futuras a partir de un historial de frames condicionantes y acciones.
- Modelado espacial-temporal: procesa informacion de multiples frames pasados para anticipar movimiento en entornos de cocina.
- Compresion de contexto: el pooler reduce la historia de video a un unico frame de movimiento mediante atencion cruzada, manteniendo informacion relevante sin expandir el contexto.
- Integracion con pipelines de robotica: pensado para actuar como modelo de mundo en entornos simulados (RoboCasa).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni ofrece capacidades de vision, audio o razonamiento simbolico.

## Casos de uso

- Planificacion de tareas roboticas en cocinas: el modelo puede predecir el video resultante de una propuesta de accion, permitiendo a un agente validar planes antes de ejecutarlos en el mundo real.
- Generacion de datos sinteticos de entrenamiento: a partir de un contexto de video, el modelo produce secuencias sinteticas que amplian conjuntos de demostraciones para entrenar politicas roboticas en RoboCasa.
- Modelado del entorno en simulacion: como modelo de mundo, puede responder a acciones hipoteticas y generar trayectorias visuales, permitiendo entrenar agentes en un bucle de simulacion sin interaccion fisica.
- Entrenamiento de politicas de manipulacion: las predicciones de video del modelo pueden usarse como senal de recompensa o como dato de imitacion en aprendizaje por refuerzo para tareas como recoger objetos o manipular utensilios de cocina.
- Validacion en linea de secuencias de acciones: un robot puede consultar el modelo para anticipar las consecuencias de sus proximas acciones y detectar colisiones o fallos antes de que ocurran.
- Investigacion en compresion de contexto: la tecnica de pooling con atencion cruzada resulta util para estudiar como comprimir historiales largos de video en modelos de difusion, un problema relevante en simuladores con ventanas de tiempo extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales. Para un modelo de 5B en fp16, los pesos ocupan aproximadamente 10 GB. Teniendo en cuenta las activaciones del DiT y las operaciones de atencion cruzada del pooler, se estima un minimo de 16 a 24 GB de VRAM.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) es adecuada para inferencia de un solo checkpoint. Para lotes mayores o entrenamiento, se recomiendan A100 o H100 con 40-80 GB.
- Puede ejecutarse en una GPU de consumo, siempre que se disponga de suficiente VRAM para las activaciones de video.
- Opciones de despliegue: no se mencionan herramientas como vLLM, llama.cpp, Ollama o TGI. El modelo es un DiT de video y requiere codigo personalizado o Diffusers para cargar los pesos. El repositorio de GitHub contiene la implementacion del pooler.
- Latencia y throughput: no disponibles. Al ser un modelo de video con atencion sobre tokens espaciales y temporales, la latencia depende de la longitud de la secuencia (nin=25/nout=41) y de la GPU.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la informacion disponible. El modelo es una variante especifica de Wan2.2-TI2V-5B con un pooler de contexto dedicado para RoboCasa, sin datos publicados de otras alternativas con la misma arquitectura o tarea.

## Limitaciones y advertencias

- Entrenado exclusivamente en RoboCasa (escenas de cocina), lo que puede limitar la generalizacion a otros entornos o tipos de tareas domesticas.
- No se han publicado evaluaciones ni benchmarks, por lo que el rendimiento real en tareas de robotica es desconocido.
- La prediccion de video puede generar artefactos visuales o alucinaciones en escenas no vistas durante el entrenamiento.
- No es un modelo de lenguaje; no es adecuado para tareas de texto, tool calling o razonamiento simbolico.
- El comportamiento con historiales de video mas largos que los usados en entrenamiento (4 frames) no esta validado.
- El repositorio tiene un tamano de 64.2 GB debido a multiples checkpoints, lo que puede complicar el despliegue si no se selecciona un unico checkpoint.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero el autor no proporciona garantias sobre robustez ni seguridad del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/hmkang/wam_ctxpool_xattn
- Repositorio GitHub con el codigo: https://github.com/HEMMO0208/wam
