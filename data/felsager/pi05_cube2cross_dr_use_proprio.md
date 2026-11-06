# felsager/pi05_cube2cross_dr_use_proprio

## Resumen
π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos y situaciones no vistas durante el entrenamiento. Evoluciona π₀ incorporando mejoras para transferir conocimiento a nuevos escenarios roboticos. Esta ficha concreta corresponde a un fine-tuning especifico alojado en Hugging Face por el usuario felsager, entrenado sobre el modelo base `lerobot/pi05_base` y adaptado a una tarea de pick-and-place con un robot UR5e equipado con mano.

El modelo resuelve el problema de mapear observaciones multimodales (imagenes de camaras y estado de las articulaciones) directamente a acciones motoras de 10 dimensiones. Es relevante porque demuestra el flujo completo de LeRobot para entrenar politicas de imitacion sobre hardware real, con un dataset de casi mil episodios y 510.000 fotogramas a 30 FPS. El checkpoint tiene 4.143.404.816 parametros en formato safetensors y un tamano de repositorio de 24,5 GB.

La tarea aprendida es concreta: recoger un cubo de color (verde, azul, amarillo o rojo) y colocarlo sobre una cruz roja. El modelo incorpora el estado de propriocepcion como entrada, de ahi el sufijo `use_proprio` en el nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; las tareas se especifican en ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento
El modelo es un VLA de tipo transformer multimodal que combina un backbone vision-lenguaje con un cabezal de acciones. La implementacion procede del repositorio OpenPI de Physical Intelligence y ha sido portada a LeRobot. Las entradas son el estado de propriocepcion (`observation.state`, vector de 10 dimensiones) y dos flujos de imagen RGB de 3x480x640 procedentes de camaras `top` y `wrist`. La salida es un vector de accion de 10 dimensiones correspondiente al robot `ur5e_hand_e`.

El fine-tuning se realizo sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 fotogramas a 30 FPS, con cuatro variantes de tarea (cubo verde, azul, amarillo y rojo sobre cruz roja). La configuracion de entrenamiento fue de 30.000 pasos, batch size 4, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.2. No se documenta en la informacion disponible si hubo RLHF, DPO ni detalles sobre la composicion del dataset de preentrenamiento del modelo base.

## Capacidades
- Generacion de acciones motoras de 10 dimensiones a partir de observaciones visuales y de estado.
- Percepcion visual mediante dos camaras (vista superior y vista de muneca) a 480x640.
- Integracion de propriocepcion (estado articular) con vision para el control.
- Ejecucion de tareas de pick-and-place condicionadas por instruccion en lenguaje natural (cuatro tareas de cubo sobre cruz).
- Generalizacion a variaciones de color del objeto y posiciones dentro del dominio del dataset (`dr` sugiere domain randomization).
- Despliegue mediante `lerobot-rollout` sobre robot UR5e con mano.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni thinking mode, dado que es un modelo de robotica.

## Casos de uso
- Automatizacion de pick-and-place industrial: el modelo puede recoger cubos de distintos colores y depositarlos en una zona marcada (cruz roja) sobre un UR5e, usando las dos camaras para localizar objeto y destino.
- Prototipado rapido de politicas de imitacion: sirve como referencia de fine-tuning sobre `lerobot/pi05_base` para equipos que quieran adaptar un VLA a su propia celula robotica con pocos miles de episodios.
- Investigacion en generalizacion de VLA: el sufijo `dr` (domain randomization) y las cuatro variantes de color permiten estudiar robustez ante cambios de apariencia del objeto.
- Benchmark de pipelines LeRobot: util como caso de prueba end-to-end de grabacion de datos, entrenamiento y rollout con LeRobot 0.6.2.
- Formacion y docencia en robotica: ejemplo reproducible de entrenamiento de una politica VLA sobre hardware asequible (UR5e) con camaras estandar.
- Pruebas de integracion en laboratorio: validacion de la cadena de inferencia (observaciones -> accion) antes de desplegar politicas mas complejas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que aun no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4.140 millones de parametros, en fp16 serian necesarios aproximadamente 8,3 GB solo para pesos, mas memoria para activaciones de vision; en cuantizacion de 8 bits rondaria 4,2 GB y en 4 bits unos 2,1 GB, aunque estas cifras son estimaciones tecnicas y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100) seria adecuada para inferencia en fp16.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en fp16 y en GPUs de 12-16 GB con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: `lerobot-rollout` (comando documentado en la model card) y el ecosistema LeRobot; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_dr_use_proprio | 4.143 M | no disponible | VLA (fine-tuning de pi05) | gemma | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base | gemma | Hugging Face (modelo base) |
| π₀ (Pi0) | no disponible | no disponible | VLA | no disponible | OpenPI / Physical Intelligence |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo altamente especializado: solo cubre la tarea de colocar cubos de cuatro colores sobre una cruz roja con un UR5e; no es un modelo de proposito general.
- Sin resultados de evaluacion publicados: no hay tasas de exito en robot real, por lo que se desconoce su fiabilidad.
- Dependencia del hardware exacto: las observaciones esperadas (dos camaras `top` y `wrist` a 480x640, estado de 10 dimensiones) deben coincidir con la configuracion del robot; pequenas desviaciones pueden degradar el rendimiento.
- Riesgo de sobreajuste al dominio del dataset (`dr` sugiere domain randomization, pero no se detalla su alcance); el comportamiento fuera de las condiciones de entrenamiento es incierto.
- Licencia `gemma`: conviene revisar los terminos de la licencia Gemma antes de un uso comercial, ya que impone condiciones de uso y redistribucion.
- Sin informacion sobre sesgos, alucinacion en el sentido linguistico ni cobertura multilingue; el modelo no genera texto libre, sino acciones.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.
- El modelo base `lerobot/pi05_base` y el dataset asociado deben citarse adecuadamente segun la model card.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_dr_use_proprio
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
