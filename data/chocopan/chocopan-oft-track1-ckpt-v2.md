# chocopan/chocopan-oft-track1-ckpt-v2

## Resumen

chocopan-oft-track1-ckpt-v2 es un archivo de checkpoints periódicos de un ajuste fino con LoRA sobre el policy VLA `Sylvest/openvla-7b-oft-finetuned-libero-plus-mixdata`, es decir, un OpenVLA-7B optimizado con la receta OFT (Optimized Fine-Tuning) y ya entrenado previamente sobre LIBERO-plus. El modelo resuelve control robótico de manipulación guiado por instrucciones en lenguaje natural: recibe dos imágenes RGB de 224x224 (una vista en tercera persona y una vista de muñeca) más un vector propioceptivo de 8 dimensiones, y devuelve un chunk de 8 acciones de efector final de 7 dimensiones cada una. El autor es el usuario `chocopan` y la licencia declarada es MIT.

Es importante subrayar que no se trata de un modelo listo para cargar, sino de un archivo de checkpoints: cada directorio `step_<N>/` contiene únicamente el adaptador LoRA (rango 32, dropout 0,0, módulos objetivo `all-linear`) y las dos cabezas entrenadas (cabeza de acción por regresión L1 y proyector propioceptivo), y hay que fusionarlos con los pesos base antes de poder usarlo. La ejecución (`-v2`) es un ajuste más corto que el base, con tasa de aprendizaje más baja, un warmup breve y decaimiento por pasos, y continúa desde el paso absoluto 150.000 del modelo base; los checkpoints se escriben cada 100 pasos absolutos.

El repositorio ocupa 12,8 GB, contiene 4 checkpoints (`step_150100` a `step_150400`, a fecha de 2026-09-10) y acumula 0 descargas y 0 likes, por lo que no existe todavía validación por parte de la comunidad ni resultados de evaluación publicados. Su interés es de investigación: sirve para estudiar ajuste eficiente de políticas VLA en LIBERO-plus y comparar el efecto de una planificación de LR más corta sobre el checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language-action (VLA); backbone OpenVLA-7B con receta OFT, ajustado mediante LoRA mas dos cabezas (accion L1 y proyector propioceptivo) |
| Parametros totales | Aproximadamente 7.000 millones en el backbone base OpenVLA-7B; este repositorio solo almacena el adaptador LoRA (rango 32) y las dos cabezas. Recuento exacto de parametros entrenados: no disponible |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el ejemplo de inferencia usa `torch.bfloat16` |
| Idiomas soportados | no disponible (el unico formato de prompt documentado esta en ingles: `In: What action should...`) |
| Licencia | MIT |
| Formato de pesos | Adaptador LoRA en safetensors (`adapter_model.safetensors`); cabezas en PyTorch (`.pt`); los pesos fusionados del backbone se generan como safetensors en el paso de merge (el repo no incluye `config.json` ni `model*.safetensors`) |
| Entrada | 2 imagenes RGB de 224x224 (tercera persona + muñeca) y vector propioceptivo de 8 dimensiones: `[eef_xyz(3), eef_axis_angle(3), gripper_qpos(2)]` normalizado a [-1, 1] con los cuantiles q01/q99 de `dataset_statistics.json` |
| Salida | Chunk de 8 acciones de efector final de 7 dimensiones |
| Clave de des-normalizacion | `libero_10` (valida para todos los checkpoints del repo) |
| Punto de partida del entrenamiento | Paso absoluto 150.000 del modelo base |
| Checkpoints incluidos | `step_150100`, `step_150200`, `step_150300`, `step_150400` (cada 100 pasos absolutos) |
| Modelo base | `Sylvest/openvla-7b-oft-finetuned-libero-plus-mixdata`, revision `a85655ec941bae6644c9fbdf62db02b9726d7cf5` |
| Tamano del repositorio | 12,8 GB |
| Libreria | transformers (fork OpenVLA-OFT) |

## Arquitectura y entrenamiento

El modelo base es un policy OpenVLA-7B OFT ya ajustado sobre LIBERO-plus. Este run continúa el entrenamiento desde su paso absoluto 150.000 y entrena tres bloques: un adaptador LoRA de rango 32 con dropout 0,0 y módulos objetivo `all-linear` sobre el backbone VLA; la cabeza de acción de regresión L1 con todos sus parámetros; y el proyector propioceptivo, también completo. La interfaz es idéntica a la de la receta base: dos imágenes de 224x224 (vista en tercera persona y vista de muñeca), vector propioceptivo de 8 dimensiones y salida en forma de chunk de 8 acciones de 7 dimensiones.

Los datos de entrenamiento son demostraciones "forward" de LIBERO-plus; la model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos no están disponibles. Los conjuntos de ajuste se sembraron con las estadísticas del checkpoint base, de modo que todas las entradas de `dataset_statistics.json` llevan los números del modelo base y la clave de des-normalización `libero_10` es correcta para cualquier checkpoint del repositorio. La variante `-v2` se distingue por un calendario más corto, una tasa de aprendizaje más baja, un warmup breve y decaimiento por pasos; la model card no especifica los valores numéricos de learning rate, número total de pasos ni composición del batch. Tampoco detalla innovaciones internas de decodificación (por ejemplo, decodificación paralela), más allá de que la interfaz de la receta OFT se mantiene sin cambios.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce chunks de 8 acciones de 7 dimensiones del efector final a partir de observaciones visuales y propioceptivas.
- Fusion multimodal de dos vistas: combina una camara en tercera persona y una camara de muñeca (2 x 224x224 RGB) en una sola politica.
- Integracion de propiocepcion: acepta un vector de 8 dimensiones con posicion del efector (3), angulo-eje (3) y posicion de la pinza (2).
- Seguimiento de instrucciones en lenguaje natural: el prompt documentado sigue el formato ingles `In: What action should...`.
- Control por chunks de acciones: la salida agrupada de 8 acciones permite ejecutar secuencias cortas sin re-inferencia en cada paso de control.
- Ajuste eficiente sobre un policy preentrenado: el LoRA de rango 32 mas las cabezas entrenadas permiten estudiar adaptaciones de bajo coste sobre el modelo base.
- Tool calling / function calling: no disponible; no se documenta ninguna capacidad de llamada a herramientas.
- Comportamiento agentico o razonamiento multi-paso explicito: no disponible; es una politica robotica, no un agente conversacional.
- Capacidades multilingues: no disponible; solo se documenta el prompt en ingles.
- Modo "thinking", vision general, audio: no disponible. La vision esta limitada a la entrada de las dos camaras del robot.

## Casos de uso

- Evaluacion de manipulacion en LIBERO-plus / LIBERO-10: cargar el checkpoint fusionado y ejecutar rollouts en el simulador para medir tasas de exito en las tareas de la suite, comparando `step_150100` con `step_150400` para ver el efecto del decaimiento de learning rate.
- Investigacion en ajuste eficiente de VLA: el repositorio permite reproducir un ajuste LoRA de rango 32 sobre un policy OpenVLA-OFT de 7B y analizar que capas `all-linear` concentran la adaptacion.
- Estudio de olvido catastrofico: al continuar desde el paso 150.000 del base, se puede comparar el rendimiento en LIBERO-plus antes y despues del ajuste para cuantificar si la especializacion degrada tareas ya aprendidas.
- Analisis de sensibilidad al checkpoint: al haber cuatro checkpoints separados 100 pasos, se puede trazar la evolucion de las predicciones de accion y de la perdida L1 a lo largo de la ejecucion `-v2`.
- Bucle de control en simulador: integrar el policy en un entorno de robotica simulado que consuma el chunk de 8x7 acciones y re-inferir cada 8 pasos de control, usando la clave `libero_10` para des-normalizar.
- Generacion de trayectorias de referencia: usar el modelo para producir rollouts sinteticos de LIBERO-plus que sirvan como datos auxiliares o como linea base para comparar con otras politicas.
- Transferencia a hardware real (experimental): el mismo pipeline de inferencia es aplicable a un brazo real con camara externa y camara de muñeca, aunque la model card no documenta calibracion, seguridad ni resultados fuera del simulador.
- Docencia y reproduccion de pipelines VLA: sirve como ejemplo completo de merge de LoRA, carga de cabezas `.pt` y construccion de observaciones multimodales con el fork OpenVLA-OFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en LIBERO-plus ni en LIBERO-10, ni metricas de perdida de validacion para los checkpoints `step_150100` a `step_150400`. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los enlaces recuperados corresponden a dominios ajenos al proyecto), por lo que no hay datos externos que citar.

## Requisitos de hardware

- VRAM para inferencia: estimacion propia, no indicada en la model card. Un backbone de 7B en `bfloat16` ronda los 14-15 GB solo en pesos; sumando el vision backbone, las dos cabezas, las activaciones y el contexto de imagenes, conviene reservar del orden de 18-24 GB.
- VRAM para el merge: la model card indica que `merge_lora_weights_and_save.py` mueve el modelo a `cuda`, por lo que el proceso de fusion requiere una GPU CUDA (no se documenta una ruta solo-CPU).
- GPU recomendadas: una unica GPU con 24 GB o mas (RTX 3090, RTX 4090, A5000, L40S) es suficiente para inferencia en `bfloat16`; A100 40/80 GB o H100 dan margen adicional para lotes mayores y evaluacion por lotes.
- GPU de consumo: si cabe en tarjetas de 24 GB en `bfloat16`; en GPUs de 16 GB exigiria tecnicas de reduccion de memoria no documentadas en la model card.
- Opciones de despliegue: el unico camino documentado es el fork OpenVLA-OFT de `transformers`, fijado al commit `bc339d9ad707454c0c115970db43c260067c61ab`, mas los scripts de `moojink/openvla-oft` en el commit `e4287e94541f459edc4feabc4e181f537cd569a8`, con `trust_remote_code=True` y carga de las cabezas `.pt` por separado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que el modelo requiere codigo de modelado propio y cabezas de accion externas, no es previsible un soporte directo en esos runtimes.
- Latencia y throughput: no disponible. La unica referencia de rendimiento indirecta es la salida en chunks de 8 acciones, que reduce el numero de inferencias necesarias por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|---|
| chocopan/chocopan-oft-track1-ckpt-v2 | ~7B (solo LoRA rango 32 + cabezas en el repo) | no disponible | LoRA sobre LIBERO-plus "forward", continuacion desde el paso 150.000 | MIT | no disponible | Repositorio de checkpoints; 0 descargas, requiere merge manual |
| Sylvest/openvla-7b-oft-finetuned-libero-plus-mixdata (modelo base) | ~7B | no disponible | Ajuste OFT sobre LIBERO-plus (mixdata) | no disponible en la informacion proporcionada | no disponible | Pesos base publicos; usado como punto de partida de este run |
| openvla/openvla-7b (OpenVLA original) | ~7B | no disponible | Preentrenamiento Open X-Embodiment y ajuste posterior | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Referencia de la familia OpenVLA; esta ficha no verifica sus numeros |

No se dispone de datos suficientes para comparar parametros de contexto, licencias o resultados de benchmarks de forma verificada; las celdas marcadas como no disponibles reflejan la ausencia de esa informacion en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo cargable directamente: el repositorio no contiene `config.json` ni `model*.safetensors`, solo el adaptador LoRA y las dos cabezas. Hay que fusionar con los pesos base antes de cualquier uso.
- Dependencia estricta de codigo: requiere el fork OpenVLA-OFT de `transformers` y los scripts de OpenVLA-OFT en commits concretos, con `trust_remote_code=True`. Actualizar cualquiera de las dos piezas puede romper la carga.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de reproducibilidad.
- Sin benchmarks: no hay tasas de exito en LIBERO-plus ni metricas de perdida publicadas para ninguno de los cuatro checkpoints.
- Interfaz fija y poco flexible: dos imagenes de 224x224 y un vector propioceptivo de 8 dimensiones. Cualquier configuracion de sensores distinta exige reentrenamiento.
- Espacio de acciones ligado a LIBERO: la des-normalizacion depende de la clave `libero_10` y los valores q01/q99 heredados del modelo base; usarla con otra convencion de acciones o con otro robot produce acciones mal escaladas.
- Sesgo de datos: entrenado unicamente con demostraciones "forward" de LIBERO-plus, por lo que puede degradarse fuera de esa distribucion de tareas, objetos y puntos de vista.
- Olvido catastrofico no evaluado: al continuar el ajuste desde el paso 150.000, la model card no reporta si se conservan las capacidades del checkpoint base.
- Idioma: solo se documenta el formato de prompt en ingles; no hay evidencia de soporte multilingue.
- Alucinacion en el sentido clasico (texto falso) no aplica a una politica de acciones, pero si existe el riesgo analogo de acciones incoherentes o fuera de distribucion ante observaciones no vistas; no hay ninguna salvaguarda documentada.
- Licencia: el repositorio declara MIT, pero conviene verificar los terminos del modelo base y del backbone derivado de un LLM de 7B antes de un uso comercial, ya que no se detallan en la informacion proporcionada.
- Despliegue fisico: no se documentan protocolos de seguridad, limites de par, calibracion ni paradas de emergencia; usar estos checkpoints en un robot real sin capas de seguridad adicionales es responsabilidad del integrador.
- Documentacion incompleta: el fragmento de model card disponible se corta a mitad del ejemplo de inferencia, por lo que el flujo completo de construccion del prompt y de las observaciones no puede verificarse aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chocopan/chocopan-oft-track1-ckpt-v2
- Modelo base en HuggingFace: https://huggingface.co/Sylvest/openvla-7b-oft-finetuned-libero-plus-mixdata (revision `a85655ec941bae6644c9fbdf62db02b9726d7cf5`)
- Repositorio OpenVLA-OFT: https://github.com/moojink/openvla-oft (commit `e4287e94541f459edc4feabc4e181f537cd569a8`)
- Fork de transformers para OpenVLA-OFT: https://github.com/moojink/transformers-openvla-oft (commit `bc339d9ad707454c0c115970db43c260067c61ab`)
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; el resto de resultados correspondian a dominios ajenos al proyecto y no se incluyen.
