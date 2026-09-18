# jungwook2358/allex-eef-N-h16

## Resumen

allex-eef-N-h16 es un checkpoint de tipo *mid-train* (paso 30000) de un modelo visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario jungwook235 en HuggingFace. Se construye sobre el modelo base RLDX-1-PT-IMG y pertenece a la familia ALLEX, especializada en generar acciones de control para robots manipuladores bimanuales. El modelo predice acciones expresadas como poses absolutas de efector final (EEF) en un espacio de 50 dimensiones.

El modelo tiene 6.912.896.320 parámetros (unos 6,91 mil millones) en formato safetensors, con un repositorio de 57,5 GB. Su rasgo distintivo es la definición del espacio de acción: 50 dimensiones que combinan 9 grados de libertad de muñeca izquierda respecto a la base, 9 de muñeca derecha, 15 articulaciones de mano izquierda, 15 de mano derecha y 2 articulaciones de cuello, excluyendo explícitamente la cintura. El horizonte de predicción es de 16 pasos.

Es relevante ahora porque ejemplifica el patrón habitual de entrenamiento en dos etapas de los modelos VLA: se parte de un VLM preentrenado (aquí congelado) y se entrena únicamente la cabeza de acción sobre datos mixtos de robot y humanos. Además, publica advertencias explícitas de compatibilidad (dimensión de acción 50 frente a 48, necesidad de portar el cargador de estadísticas) que resultan críticas para quien intente reutilizarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en RLDX-1-PT-IMG; VLM congelado con cabeza de accion entrenada |
| Parametros totales | 6.912.896.320 (~6,91 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; repositorio de 57,5 GB) |
| Idiomas soportados | no disponible (modelo orientado a accion robotica; hereda las capacidades del VLM base) |
| Licencia | other (otra; consultar los terminos del repositorio) |
| Formato de pesos | safetensors |
| Dimension de accion | 50D (poses absolutas EEF: 9 + 9 + 15 + 15 + 2, sin cintura) |
| Horizonte de accion | 16 pasos |
| Embodiment tag | GENERAL_EMBODIMENT |
| Camaras de entrada | 2 (ego izquierda / ego derecha) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de un VLA de dos etapas. La etapa 2, documentada por el autor, parte del checkpoint base RLDX-1-PT-IMG y congela por completo el componente VLM (`tune_llm=False`, `tune_visual=False`, `tune_top_llm_layers=0`), de modo que el entrenamiento se concentra en la cabeza de acción que traduce las representaciones visuales y lingüísticas a comandos motores. La entrada visual consiste en dos cámaras en primera persona (ego izquierda y derecha), con `video_length 1` (un único frame), y una etiqueta de embodiment fija (`GENERAL_EMBODIMENT`).

En cuanto a los datos, el entrenamiento combina tres fuentes con proporción 0,50 : 0,25 : 0,25: datos de robot ALLEX v1–v6, datos humanos HMD y UMI v1–v12 con filtro LPF. La normalización aplicada es del tipo q99, con la transformación `2*(x-q01)/(q99-q01)-1` y recorte a [-1, 1], usando estadísticas fusionadas de las tres fuentes y sin relativización. Los hiperparámetros principales son: batch global de 256, tasa de aprendizaje 1e-4 y `state_dropout` de 0,3. Se activó la opción `--override-pretraining-statistics` durante el entrenamiento. Entre las innovaciones destacables figura la formulación de la acción como pose absoluta de efector final en 50D con estadísticas q99 fusionadas, así como la mezcla explícita de datos humanos y de robot para ampliar la cobertura de comportamientos.

## Capacidades

- Generacion de acciones de control robotico bimanual en un espacio de 50 dimensiones, expresadas como poses absolutas de efector final.
- Prediccion de horizontes de 16 pasos de accion, util para planificacion a corto plazo en tareas de manipulacion.
- Control conjunto de dos brazos, dos manos (15 articulaciones cada una) y cuello (2 articulaciones), con exclusión de la cintura.
- Procesamiento de entrada visual multcamara en primera persona (dos vistas ego).
- Acondicionamiento por instruccion en lenguaje natural, heredado del VLM base RLDX-1-PT-IMG.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se documentan idiomas).
- Modo de razonamiento explicito (*thinking mode*), vision o audio mas alla de la entrada visual de control: no disponible.

## Casos de uso

- Manipulacion robotica bimanual en laboratorio: el modelo genera poses absolutas de ambos efectores finales con horizonte de 16 pasos, lo que permite ejecutar tareas de ensamblaje o recogida de objetos coordinando izquierda y derecha en un unico vector de accion de 50D.
- Investigacion en aprendizaje por imitacion con datos humanos: la mezcla de datos de robot ALLEX (50 %) y datos humanos HMD/UMI (50 % combinado) lo hace adecuado para experimentos sobre transferencia de habilidades desde demostraciones humanas a politicas roboticas.
- Control de manos articuladas de alta dimension: con 30 dimensiones dedicadas a articulaciones de mano (15 por mano), es apropiado para tareas que requieren destreza fina como reorientar objetos o manejar herramientas.
- Teleoperacion asistida y aprendizaje autonomo: puede utilizarse como politica de partida (mid-train) para afinar con datos especificos de una celda de trabajo antes de desplegar en el robot final.
- Evaluacion de modelos VLA en entornos controlados: al tratarse de un checkpoint intermedio con configuracion documentada, sirve como referencia reproducible en estudios comparativos de arquitecturas VLA.
- Tareas que no requieren movimiento de cintura: dado que el espacio de accion excluye explicitamente la cintura, encaja en plataformas cuyo torso es fijo y la manipulacion recae en brazos, manos y cuello.
- Fine-tuning sobre nuevas morfologias: la etiqueta GENERAL_EMBODIMENT y el uso de estadisticas q99 fusionadas facilitan adaptarlo a otros robots dentro del ecosistema RLDX/ALLEX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, tasas de acierto ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de 6,91 mil millones de parametros, no confirmada por el autor): en FP16 en torno a 14 GB de pesos, mas el coste de activaciones y buffers; en INT8 alrededor de 7 GB; en INT4 alrededor de 3,5–4 GB.
- Almacenamiento: el repositorio pesa 57,5 GB, por lo que se necesita espacio en disco suficiente para el checkpoint completo antes de cualquier conversion.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano de parametros, el modelo es compatible con GPUs de centro de datos (A100, H100) y, en FP16, podria ajustarse a GPUs de gama alta para consumidor con 24 GB (por ejemplo RTX 3090 o RTX 4090), sujeto a la validacion del cargador de acciones.
- Compatibilidad con GPU de consumidor: probable en tarjetas de 24 GB en FP16 si se resuelve la carga del espacio de accion; en cuantizaciones menores, mas holgada.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor referencia codigo propio de inferencia en los repositorios `jungwook235/RLDX-1-egopi` (rama `feat/allex-eef-h16-midtrain`) y `jungwook235/action-tokenizer`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Horizonte de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| allex-eef-N-h16 | 6,91 mil millones | no disponible | 16 pasos | other | HuggingFace (0 descargas) |
| RLDX-1-PT-IMG (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros VLA de la familia ALLEX/RLDX de 48D | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas externas (OpenVLA, RDT, pi0, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de parametros, contexto, rendimiento, licencia o disponibilidad de modelos comparables dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no puede completarse.

## Limitaciones y advertencias

- Es un checkpoint *mid-train* (paso 30000), no un modelo final; el rendimiento puede no corresponder al de una version completamente entrenada.
- La dimension de accion es 50, no 48. El propio autor advierte que no debe cargarse como 48D, ya que pertenece a un linaje distinto del run previo de allex (48D con cintura incluida).
- Para usar el brazo AB en inferencia es necesario portar el cargador de acciones de allex 50D/q99, porque `load_merged_prq_action_minmax` tiene PRQ_KEYS y valores min/max codificados de forma fija.
- El VLM esta congelado, por lo que las capacidades de lenguaje y vision quedan limitadas a las del modelo base RLDX-1-PT-IMG.
- No se documentan idiomas soportados; el material de la model card esta redactado principalmente en coreano.
- No se publican benchmarks ni tasas de exito, por lo que no es posible evaluar la calidad de las politicas generadas a partir de la informacion disponible.
- Licencia "other": al no ser una licencia estandar, deben revisarse los terminos exactos antes de cualquier uso comercial.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada, aunque al tratarse de un modelo de accion, el riesgo principal es la generacion de trayectorias fisicamente invalidas o inseguras.
- No se especifican requisitos de seguridad ni limites de par/velocidad para el despliegue en robots reales, algo imprescindible antes de operar hardware fisico.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (solo paginas de ayuda de YouTube), por lo que no hay informacion externa de contraste.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/allex-eef-N-h16
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT-IMG
- Codigo de etapa 2: repositorio `jungwook235/RLDX-1-egopi`, rama `feat/allex-eef-h16-midtrain`
- Scripts y documentacion: repositorio `jungwook235/action-tokenizer`, rutas `gpu26-server/submit/allex_eef_*` y `docs/allex_eef_midtrain/README.md`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada (la busqueda web no devolvio resultados relevantes).
