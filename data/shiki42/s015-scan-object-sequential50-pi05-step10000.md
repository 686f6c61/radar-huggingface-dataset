# Shiki42/s015-scan-object-sequential50-pi05-step10000

## Resumen

El modelo `Shiki42/s015-scan-object-sequential50-pi05-step10000` es un checkpoint de inferencia de robótica publicado por el usuario Shiki42 (Shuyuan Hu) dentro del ecosistema OpenPI. Se trata de un ajuste fino mediante LoRA del modelo vision-language-action (VLA) PI0.5, entrenado en JAX sobre el conjunto de datos `Shiki42/ctr-scan-object-sequential50-20260921`, compuesto por 50 episodios y 17.008 fotogramas de una tarea de escaneo o barrido de objetos. El checkpoint corresponde al paso 10.000 de un total de 30.000 y forma parte del estudio denominado S015, en su rama "balanced Sequential50".

El paquete contiene unicamente el arbol de parametros de OpenPI y los activos de normalizacion; se excluyen explicitamente el estado del optimizador y el estado del cargador de datos de entrenamiento, por lo que su unico proposito declarado es la inferencia. No se publican resultados de evaluacion: la propia model card indica que la evaluacion esta pendiente y que no se reclama ninguna tasa de exito.

Su relevancia es acotada y de caracter experimental: sirve como artefacto reproducible para estudiar el efecto del ajuste LoRA sobre PI0.5 en una tarea concreta, y como punto de comparacion frente a otras variantes del mismo estudio, como la rama CTR50 sin IdleMask (E748). No es un modelo generalista listo para produccion ni un modelo de lenguaje al uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) PI0.5; ajuste LoRA sobre backbone JAX de OpenPI |
| Parametros totales | no disponible en la model card (el repositorio ocupa 6,3 GB) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye como arbol de parametros OpenPI, sin variantes cuantizadas publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | Arbol de parametros OpenPI (`params/`), mas activos de normalizacion (`assets/`), `resolved_config.json` y `training-provenance.json`; no se distribuye en safetensors ni GGUF |
| Libreria | openpi |
| Pipeline declarado | robotics |
| Tamano del repositorio | 6,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA de PI0.5, un modelo vision-language-action basado en PI0 que combina un backbone de vision-lenguaje con un experto de accion para producir comandos motores a partir de observaciones visuales e instrucciones en lenguaje natural. La implementacion concreta de este checkpoint es la de OpenPI en JAX, inicializada desde `XinY0201/openpi-pi05-base-jax` en la revision `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`, con el commit de OpenPI `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead`. La model card no detalla el numero de parametros, la longitud de contexto del backbone ni el tipo de dato de los pesos; el tamano del repositorio (6,3 GB) es compatible con un arbol de parametros en precision de 16 bits, pero el dato exacto no esta declarado.

El entrenamiento se realizo sobre el conjunto `Shiki42/ctr-scan-object-sequential50-20260921` (revision `1b24730ebff0ea3f91652a3806620fb682f413b0`), con 50 episodios y 17.008 fotogramas, repartidos en 25 episodios completos de izquierda a derecha y 25 de derecha a izquierda. Se uso semilla 87431, tamano de lote 16 y acumulacion de gradiente 1. La mascara de inactividad (IdleMask) esta desactivada, mientras que se mantiene la mascara estandar de relleno temporal. La normalizacion emplea cuantiles globales de NumPy al 1 % y al 99 % con interpolacion lineal (artefacto con SHA-256 `c52e2ec3795214b360821ad7c417297a1ab0b8b684a26fe1e9de55d072260b0d`). El runtime declarado es `2026-08-22.2` y el commit de CTR es `f802672965770e821f80769abf631780022af77e`. La verificacion del checkpoint consistio en recarga en proceso nuevo y comprobacion de parametros finitos en los pasos 10k, 20k y 30k; no se menciona ningun uso de RLHF ni de DPO.

## Capacidades

- Generacion de acciones roboticas: el modelo es una politica que traduce observaciones visuales e instrucciones en lenguaje natural a comandos motores, no un generador de texto.
- Ejecucion de la tarea especifica "scan object" del estudio S015, con episodios de barrido o escaneo de objetos.
- Robustez direccional entrenada: la particion 25 L→R y 25 R→L busca equilibrio entre ambas direcciones del movimiento.
- Inferencia con activos de normalizacion incluidos, lo que permite reproducir el preprocesado exacto del entrenamiento.
- Punto de partida para ajuste posterior (continuar el entrenamiento desde el paso 10.000 o aplicar nuevos LoRA).
- Soporte de tool calling / function calling: no disponible; no es una capacidad de esta clase de modelo ni se declara en la documentacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la model card; el modelo base PI0.5 aborda tareas de horizonte largo segun la literatura, pero este checkpoint concreto no documenta esa capacidad.
- Capacidades multilingues: no; el unico idioma declarado es ingles.
- Capacidades especiales: no se declara modo de pensamiento, vision general, audio ni decodificacion especulativa.

## Casos de uso

- Investigacion reproducible en VLA: el paquete incluye `training-provenance.json` con semilla, dataset, revisiones y hashes, lo que permite replicar exactamente el ajuste y auditar la procedencia del checkpoint en un estudio comparativo.
- Ablacion de enmascaramiento temporal: al existir una variante hermana sin IdleMask (E748, `s015-scan-object-ctr50-nomask-pi05-step10000`), este checkpoint sirve para medir el efecto de la mascara de inactividad en la tasa de exito de la tarea.
- Analisis de simetria direccional: la particion equilibrada 25 L→R / 25 R→L permite estudiar si la politica generaliza igual de bien en ambos sentidos del barrido o si hereda sesgos de la recoleccion de datos.
- Punto de partida para ajuste posterior: al ser un LoRA sobre `openpi-pi05-base-jax` en el paso 10.000 de 30.000, se puede continuar el entrenamiento con datos propios, anadir un nuevo LoRA o fusionar los pesos para comparar con el modelo base.
- Despliegue en banco de pruebas robotico: el arbol de parametros es cargable por el runtime de OpenPI en JAX, por lo que puede ejecutarse en un entorno de laboratorio controlado para validar la politica antes de escalar a otras tareas.
- Comparacion de checkpoints intermedios: al haberse verificado los pasos 10k, 20k y 30k, el mismo flujo permite estudiar la curva de aprendizaje y el sobreajuste en funcion del paso de entrenamiento.
- Reutilizacion del preprocesado: los activos de normalizacion (`assets/`) con cuantiles al 1 % y 99 % pueden reutilizarse para normalizar nuevas observaciones del mismo dominio sin recalcular estadisticos.
- Docencia y divulgacion tecnica: como ejemplo completo de pipeline OpenPI con procedencia verificable, resulta util para explicar la estructura de un checkpoint VLA frente a un checkpoint de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que la evaluacion esta pendiente y que no se reclama ninguna tasa de exito, por lo que no existen datos de exito de tarea, ni comparaciones con PI0.5 base u otras variantes del estudio S015.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa y no confirmada, un arbol de parametros de 6,3 GB en precision de 16 bits suele requerir entre 8 y 12 GB de VRAM sumando pesos, activaciones y buffers de inferencia.
- GPU recomendadas: no declaradas por el autor. Para un modelo de este orden de magnitud, una GPU con al menos 16 GB de memoria suele ser suficiente; tarjetas tipo RTX 4090, RTX 3090 o A100/H100 cubririan el escenario con holgura, pero esto es una extrapolacion, no un dato del repositorio.
- Compatibilidad con GPU de consumo: probable si se confirma el orden de magnitud de 6,3 GB de pesos, pero no verificado ni documentado.
- Opciones de despliegue: runtime de OpenPI en JAX, que es la libreria declarada. No aplican las pilas habituales de servido de LLM (vLLM, llama.cpp, Ollama, TGI) porque el formato es un arbol de parametros OpenPI y la salida son acciones, no texto.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia por paso ni rendimiento en Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Dataset / rama | Paso | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| s015-scan-object-sequential50-pi05-step10000 (este) | LoRA PI0.5 JAX | Sequential50 balanceado, IdleMask off | 10.000 / 30.000 | Pendiente, sin tasa de exito | no disponible | Publico en HuggingFace |
| Shiki42/s015-scan-object-ctr50-nomask-pi05-step10000 | LoRA PI0.5 JAX | CTR50 sin IdleMask | 10.000 | No consta | no disponible | Publico en HuggingFace |
| XinY0201/openpi-pi05-base-jax | PI0.5 base | No aplica (modelo base) | No aplica | No disponible en esta busqueda | no disponible | Publico en HuggingFace |
| PI0.5 (referencia del paper arXiv:2504.16054) | VLA fundacional | Co-entrenamiento heterogeneo (demos de robot, web, subtareas semanticas) | No aplica | Si, en el paper | No disponible en esta busqueda | Paper y ficha en Qualcomm AI Hub |

La comparacion cuantitativa de parametros, contexto y rendimiento entre estas alternativas no es posible con la informacion disponible, ya que ni la model card ni los resultados de busqueda aportan cifras de benchmark para las variantes de Shiki42.

## Limitaciones y advertencias

- Ausencia de licencia: la model card no declara licencia, por lo que el uso comercial y la redistribucion quedan en un limbo juridico; conviene contactar con el autor antes de cualquier uso productivo.
- Evaluacion pendiente: no existe ninguna tasa de exito publicada, de modo que se desconoce si la politica funciona correctamente en la tarea para la que fue entrenada.
- Checkpoint intermedio: corresponde al paso 10.000 de 30.000, es decir, a un tercio del entrenamiento previsto; el rendimiento puede mejorar en pasos posteriores.
- Dataset muy reducido: 50 episodios y 17.008 fotogramas es un volumen pequeno, con riesgo elevado de sobreajuste al entorno y a la disposicion de objetos de la recoleccion.
- Dominio estrecho: la politica esta especializada en la tarea "scan object" con un balance direccional concreto; no hay evidencia de generalizacion a otras tareas, objetos o entornos.
- Solo ingles: las instrucciones en lenguaje natural deben formularse en ingles.
- Formato no estandar: al distribuirse como arbol de parametros OpenPI, no es directamente cargable en herramientas de inferencia convencionales y requiere el runtime de OpenPI en JAX.
- Sin datos de sesgo: no se documenta ningun analisis de sesgo, y en robótica esto se traduce en posibles asimetrias de comportamiento entre direcciones, objetos o condiciones de iluminacion.
- Riesgo de alucinacion de acciones: en un modelo de politica, el equivalente a la alucinacion es la ejecucion de trayectorias plausibles pero incorrectas; al no haber evaluacion, este riesgo no esta cuantificado.
- Artefacto de investigacion: no se declara soporte, mantenimiento ni compatibilidad con versiones futuras del runtime.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/s015-scan-object-sequential50-pi05-step10000
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-sequential50-20260921
- Modelo base de inicializacion: https://huggingface.co/XinY0201/openpi-pi05-base-jax
- Variante hermana (CTR50 sin IdleMask, E748): https://huggingface.co/Shiki42/s015-scan-object-ctr50-nomask-pi05-step10000
- Perfil del autor en HuggingFace: https://huggingface.co/Shiki42/models
- Perfil del autor en GitHub: https://github.com/Shiki42/
- Paper de PI0.5 (arXiv:2504.16054): https://arxiv.org/abs/2504.16054
- Ficha de Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
