# kiroaiseoul/NAJY_act_task02_c100_gist30_solo_16D_60k_s1000

## Resumen

NAJY_act_task02_c100_gist30_solo_16D_60k_s1000 es un checkpoint de politica robotica basado en ACT (Action Chunking Transformer) publicado en Hugging Face por el usuario kiroaiseoul dentro del ecosistema LeRobot. No es un modelo de lenguaje: es una politica visomotora que, a partir de tres camaras RGB y un vector de estado propioceptivo de 16 dimensiones, predice directamente vectores de accion de 16 dimensiones para un robot bimanual. Tiene 51.689.104 parametros y se distribuye en safetensors con la estructura `pretrained_model` que espera LeRobot.

El checkpoint corresponde a la tarea "task02" (recogida y colocacion de tubos, `task02_pickup_tubes_gist`) del banco de pruebas Mobile AI de Trossen. Segun la propia model card, fue entrenado en una unidad DGX_1 con el nombre de ejecucion `t43_task02_c100_gist30_solo_60k_s1000` hasta el paso 60.000, y se ha subido "para analisis y puntuacion", no como candidato de despliegue confirmado. Es un artefacto de investigacion de un flujo de trabajo interno (NAJY, 11 etapas de ACT) mas que un modelo de proposito general.

Su relevancia es acotada y de nicho: sirve como referencia reproducible para investigacion en imitacion bimanual, para comparar variantes de ACT (distintos tamanos de chunk, semillas y dimensiones de accion) y para reproducir el pipeline de entrenamiento y evaluacion de LeRobot sobre el kit Trossen Mobile AI. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye metricas de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), politica visomotora de imitacion |
| Parametros totales | 51.689.104 (dato del fichero safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica robotica; consume una ventana de observaciones, no texto) |
| Tipos de cuantizacion | no disponible (solo se documenta el checkpoint en safetensors; sin variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), estructura `pretrained_model` de LeRobot |
| Pasos de entrenamiento | 60.000 (segun el identificador de ejecucion y la model card) |
| Dimension del estado de observacion | 16 |
| Dimension de la accion | 16 |
| Entradas de vision | 3 camaras RGB: `cam_high`, `cam_left_wrist`, `cam_right_wrist`, a 3x480x640 |
| Tamano del repositorio | 0,2 GB |
| sha256 de `model.safetensors` | 33cf8f02197a02cfa56ebc7182742efca4992574757468aa7050c5e9068488de |
| Libreria | lerobot |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

Nota sobre el identificador: `c100` se interpreta como tamano de chunk de 100 acciones, `60k` como 60.000 pasos y `s1000` como semilla 1000. Estos valores proceden del nombre del modelo y de la model card, no de documentacion adicional verificada.

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder disenado para imitacion en robotica: un encoder visual (tipicamente ResNet) procesa las imagenes de camaras mas el estado propioceptivo, y un decoder transformer genera un chunk de acciones futuras de una sola vez, en lugar de una accion por paso. Este enfoque de "action chunking" reduce el error de compounding y permite ejecutar el chunk en lazo abierto durante varias decenas de pasos, lo que resulta critico en tareas bimanuales donde pequeñas desviaciones se acumulan. En este checkpoint las dimensiones declaradas son estado de 16 y accion de 16, con tres vistas RGB de 480x640, coherente con una plataforma de dos brazos con camara frontal alta y una camara en cada muneca.

El nombre de la ejecucion (`t43_task02_c100_gist30_solo_60k_s1000`) indica un entrenamiento por imitacion supervisada sobre el dataset `task02_pickup_tubes_gist`, publicado por kiroaiseoul junto con GIST AI Lab, que cubre escenas de recogida y colocacion bimanual con multiples vistas y anotacion completa del estado de movimiento. No se documentan en la informacion disponible el numero de tokens o episodios, la composicion exacta del dataset, ni si hubo etapas de RLHF, DPO o ajuste por refuerzo (en ACT lo habitual es entrenamiento puramente conductual clonado, pero no se confirma). La model card tampoco especifica la configuracion de la red (numero de capas, dimensiones internas, estrategia de decodificacion: media vs. CVAE), por lo que esos detalles quedan como no disponibles. La primera linea del registro de entrenamiento aparece como `?`, lo que sugiere metadatos incompletos en el artefacto subido.

## Capacidades

- Generacion de acciones bimanuales: produce vectores de accion de 16 dimensiones para un robot de dos brazos, presumiblemente 6-7 grados de libertad por brazo mas pinzas.
- Percepcion visomotora con tres camaras: `cam_high` (vista frontal/elevada) y dos camaras de muneca (`cam_left_wrist`, `cam_right_wrist`) a 480x640 RGB.
- Fusion de estado propioceptivo: incorpora un vector de estado de 16 dimensiones junto con la informacion visual.
- Action chunking: predice bloques de acciones (chunk, presumiblemente 100 segun el identificador) y los ejecuta secuencialmente.
- Especializacion en una tarea concreta: recogida y colocacion de tubos en el entorno de laboratorio del kit Trossen Mobile AI.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, function calling, capacidad de agentes ni soporte multilingue. No es un modelo de proposito general y no debe evaluarse como tal.
- No se documentan capacidades multimodales adicionales (audio, lenguaje, deteccion semantica abierta).

## Casos de uso

- Manipulacion bimanual en laboratorio: ejecutar la tarea de recogida y colocacion de tubos (`task02_pickup_tubes_gist`) con un robot de dos brazos equipado con las tres camaras especificadas, usando el checkpoint como politica de control directa.
- Evaluacion y puntuacion de checkpoints: el propio autor indica que el artefacto se sube para analisis y puntuacion, de modo que encaja como entrada de herramientas de diagnostico (por ejemplo `stage_cond_diag.py`) que leen el manifiesto `multi_manifest.json` de la carpeta del checkpoint.
- Estudios de ablation sobre ACT: comparar el efecto del tamano de chunk (`c100`), la semilla (`s1000`) y el numero de pasos (60.000) frente a la variante de 27 dimensiones o a la de 120.000 pasos del mismo autor.
- Ajuste fino especifico de tarea: partir de estos 51,7 millones de parametros para adaptar la politica a una variante de la tarea con menos datos que un entrenamiento desde cero.
- Recoleccion de datos guiada: usar el modelo en modo evaluacion para detectar los tramos de la tarea donde falla y dirigir la recogida de episodios adicionales (DAgger o correccion humana).
- Validacion en simulacion: probar la politica en el entorno `trossen-ai-simulation` antes de cualquier prueba fisica, dado que la model card referencia su documentacion interna.
- Docencia y reproducion: material de partida para cursos o talleres de aprendizaje por imitacion con LeRobot, dado su tamano reducido (0,2 GB) y su licencia permisiva.
- Despliegue en estaciones de robot de bajo coste: al ocupar unos 207 MB en FP32, se puede servir desde una GPU de gama media o incluso desde plataformas embebidas, siempre que se cumplan los requisitos de latencia de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion, ni comparaciones cuantitativas; solo aporta el identificador de la ejecucion, los pasos de entrenamiento, el hash del fichero y la lista de caracteristicas de entrada y salida. Tampoco se documentan metricas de evaluacion offline ni de despliegue en el robot real.

| Metrica | Resultado |
|---|---|
| Tasa de exito en la tarea | no disponible |
| Error de posicion de efector final | no disponible |
| Evaluacion offline (error L1/L2 sobre acciones) | no disponible |
| Latencia de inferencia | no disponible |

## Requisitos de hardware

- Memoria de pesos: 51.689.104 parametros equivalen a aproximadamente 207 MB en FP32 y 103 MB en FP16. El cuello de botella real no son los pesos, sino las activaciones del encoder visual sobre tres imagenes de 480x640, que dominan el consumo de VRAM en inferencia.
- VRAM estimada: no disponible de forma oficial. En la practica, una GPU con 8-12 GB deberia ser suficiente para inferencia en FP16 con las tres camaras a resolucion completa, aunque no se ha verificado con datos del autor.
- GPU recomendadas: no especificadas por el autor. Por tamano y tipo de carga, una RTX 3060/4060 de 8-12 GB es un punto de partida razonable para inferencia; GPU de datacenter (A100, H100) solo tendrian sentido para reentrenamiento o para servir varias politicas en paralelo.
- GPU de consumo: si cabe. El checkpoint completo ocupa 0,2 GB en disco y 207 MB en FP32, por lo que cabe incluso en portatiles con GPU discreta moderada.
- CPU y embebidos: no hay datos de latencia en CPU ni en Jetson. Con 51,7 millones de parametros y tres flujos de imagen, es plausible una ejecucion en CPU a baja frecuencia de control, pero no esta confirmado y probablemente no alcance los regimenes tipicos de control (10-50 Hz).
- Opciones de despliegue: libreria `lerobot` (scripts de evaluacion y grabacion de LeRobot), PyTorch como backend. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a una politica robotica. La exportacion a ONNX o TensorRT es posible en principio, pero no esta documentada para este checkpoint.
- Latencia y throughput: no disponible. El rendimiento dependera de la frecuencia de control del robot, del tamano de chunk efectivo y del hardware de inferencia.

## Comparativa con modelos similares

Los unicos modelos comparables identificados son otros checkpoints del mismo autor y de la misma familia NAJY/ACT. Los datos de la tabla proceden de los nombres de modelo y de las model cards publicas, y en varios casos se infieren del identificador.

| Modelo | Parametros | Dim. estado/accion | Pasos | Semilla | Notas |
|---|---|---|---|---|---|
| NAJY_act_task02_c100_gist30_solo_16D_60k_s1000 (este) | 51.689.104 | 16 / 16 | 60.000 | 1000 | Tarea task02, tres camaras, subido para analisis y puntuacion |
| NAJY_act_all11_c100_gist30_dq_27D_60k_s1000 | no disponible | 27 / 27 (inferido del identificador) | 60.000 | 1000 | Cubre las 11 etapas de la tarea; mas dimensiones de estado y accion |
| NAJY_act_all11_hot_27D_120k_s1000 | no disponible | 27 / 27 (inferido del identificador) | 120.000 | 1000 | La model card lo describe como candidato de despliegue y mejor semilla en etapas de locomocion |

No se dispone de comparaciones con politicas ACT de otros autores (por ejemplo, los checkpoints de referencia de LeRobot o de ALOHA) dentro de la informacion proporcionada, ni de metricas homogeneas que permitan situar este checkpoint frente a alternativas externas.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para `task02` (recogida y colocacion de tubos). Fuera de esa distribucion de objetos, posiciones e iluminacion se espera un fallo sistematico, no una degradacion gradual.
- Dependencia del montaje fisico: las entradas estan fijadas a tres camaras concretas (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) a 480x640. Cambiar camaras, su posicion o el robot invalida el checkpoint.
- Dimensiones rigidas: estado y accion de 16 dimensiones. Un robot con otra cinematica no puede consumir el modelo sin reentrenar las capas de entrada y salida.
- Riesgo de fallo silencioso: en action chunking la politica ejecuta bloques de acciones en lazo abierto, de modo que un error al inicio del chunk se propaga durante decenas de pasos sin correccion. Es imprescindible un lazo de seguridad externo (limites de par, parada de emergencia, supervision).
- Sin evidencia de rendimiento: 0 descargas, 0 likes y ninguna metrica publicada. No hay validacion independiente ni resultados de despliegue en robot fisico. El autor indica explicitamente que el checkpoint se sube para analisis y puntuacion y que no equivale a una confirmacion de candidato de despliegue.
- Metadatos incompletos: la primera linea del registro de entrenamiento figura como `?` y el primer elemento de los flags del manifiesto es un objeto vacio `{}`. Conviene verificar `sha256sum model.safetensors` contra el hash publicado antes de usar el artefacto.
- Sesgos: no hay evaluacion de sesgos. En robotica, los sesgos relevantes son de distribucion de datos (posiciones, texturas, iluminacion, operadores) y no se documentan.
- Contexto e idioma: no aplica. El modelo no procesa lenguaje ni mantiene contexto textual; las limitaciones de "ventana de contexto" no son pertinentes.
- Licencia: apache-2.0 permite uso comercial y modificacion siempre que se conserve el aviso de licencia y se indique los cambios. No obstante, la licencia no aporta garantias y el modelo no incluye documentacion suficiente para un despliegue en produccion.
- Caveat de produccion: antes de cualquier uso real se recomienda validar el checkpoint en simulacion, comprobar el hash, verificar que el dataset de entrenamiento y las estadisticas de normalizacion acompanan al checkpoint (no confirmado en la informacion disponible) y establecer un controlador de seguridad independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/NAJY_act_task02_c100_gist30_solo_16D_60k_s1000
- Checkpoint hermano de 27 dimensiones, 60.000 pasos: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_dq_27D_60k_s1000
- Checkpoint hermano de 27 dimensiones, 120.000 pasos: https://huggingface.co/kiroaiseoul/NAJY_act_all11_hot_27D_120k_s1000
- Noticia sobre el dataset `task02_pickup_tubes_gist` (kiroaiseoul y GIST AI Lab): https://www.5radar.com/dataopensource/news/463902/
- Referencia interna citada en la model card: repositorio `trossen-ai-simulation`, fichero `docs/mobile_base_investigation.md`, seccion 94 (ruta mencionada por el autor; no se ha localizado ni verificado la URL publica del repositorio)
- Paper de ACT (Action Chunking with Transformers): no incluido en la model card ni localizado en la busqueda web proporcionada
