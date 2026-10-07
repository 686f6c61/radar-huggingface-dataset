# 5hadytru/so101_bench_InternW0-Delta

## Resumen

SO-101 Bench: InternW0-Δ full fine-tune es un modelo de politica visomotora (world-action model) publicado por el usuario 5hadytru en HuggingFace. Se trata de un post-entrenamiento completo (full fine-tune, no LoRA ni adaptadores) del checkpoint InternRobotics/InternW0-Delta-Base sobre el conjunto de teleoperacion simulado SO-101 Bench (`5hadytru/so101_bench_sim`), compuesto por 3.629 episodios y 1.996.120 fotogramas capturados con camara cenital y camara de muneca.

El modelo hereda la arquitectura del InternW0-Δ base: un experto de video derivado de Wan2.2-TI2V-5B, un experto de accion de 1,2B de parametros y un VLM RynnBrain1.1-2B. Su funcion es generar trayectorias de control para un brazo robotico SO-101 en tareas de manipulacion simulada, emitiendo chunks de 32 acciones a 30 Hz expresadas como objetivos articulares absolutos de 6 grados de libertad en unidades LeRobot, de las cuales se ejecutan 16 por cada replanificacion.

Su relevancia es doble: por un lado, ofrece una linea base reproducible y con hiperparametros publicos (config.yaml resuelto de Hydra, dataset_stats.json de normalizacion y receta de entrenamiento) para investigacion en world-action models aplicados a robotica; por otro, documenta de forma inusualmente honesta el compromiso entre checkpoint final y checkpoint seleccionado por validacion, ya que el paso 16.000 obtiene mejor tasa de exito que el paso final 18.200. El repositorio tiene 24,8 GB y, en el momento de la consulta, cero descargas y cero likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model multimodal: experto de video derivado de Wan2.2-TI2V-5B + experto de accion de 1,2B + VLM RynnBrain1.1-2B |
| Parametros totales | No disponible (el autor no publica el total; componentes declarados: ~5B de video, 1,2B de accion y ~2B de VLM) |
| Parametros activos | No aplica (no se describe una arquitectura de mezcla de expertos dispersa tipo MoE) |
| Longitud de contexto | No disponible en terminos de contexto textual; la memoria de acondicionamiento es por fotogramas: primer fotograma del episodio y fotograma de 32 pasos atras |
| Tipos de cuantizacion | No disponible (unicamente se publican pesos en `model.pt`; sin versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible (modelo de politica robotica; los metadatos no declaran idiomas) |
| Licencia | `other` (terminos no detallados en la informacion disponible; requiere revision del propietario antes de uso comercial) |
| Formato de pesos | PyTorch (`model.pt`), acompanado de `config.yaml` (configuracion Hydra resuelta) y `dataset_stats.json` (normalizacion) |
| Tamano del repositorio | 24,8 GB |
| Modelo base | InternRobotics/InternW0-Delta-Base |
| Entrada sensorial | Camara cenital y camara de muneca, compuestas en un lienzo de 384x256 (192x256 cada una) |
| Salida de control | Chunks de 32 acciones a 30 Hz, objetivos articulares absolutos de 6 grados de libertad en unidades LeRobot, 16 acciones ejecutadas por replanificacion |
| Dataset de ajuste | `5hadytru/so101_bench_sim`: 3.629 episodios, 1.996.120 fotogramas, teleoperacion simulada |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes: un experto de video procedente de Wan2.2-TI2V-5B, que modela la dinamica visual; un experto de accion de 1,2B de parametros, que produce las trayectorias motoras; y el VLM RynnBrain1.1-2B, que aporta la comprension visual-linguistica de la escena y de la tarea. Las entradas se organizan en un lienzo de 384x256 pixeles que yuxtapone la vista cenital y la vista de muneca, cada una a 192x256. El modelo mantiene una memoria de acondicionamiento por fotogramas compuesta por el primer fotograma del episodio y el fotograma situado 32 pasos atras, lo que le permite anclar la prediccion en el estado inicial de la tarea y en el contexto inmediato. La salida son objetivos articulares absolutos de 6 grados de libertad en unidades LeRobot, emitidos en chunks de 32 acciones a 30 Hz, de los cuales se ejecutan 16 antes de volver a planificar.

El post-entrenamiento se realizo en modalidad full fine-tune desde `InternRobotics/InternW0-Delta-Base` sobre el dataset de teleoperacion simulado SO-101 Bench. El run duro 36 horas en 4x A100-80GB, con batch global de 128, optimizador AdamW y tasa de aprendizaje 5e-5 con scheduler coseno, durante aproximadamente 1,17 epocas. El checkpoint oficial publicado en la raiz del repositorio es el paso 18.200, ultimo del entrenamiento, con una tasa de exito de 20/39 (51,3%) sobre el conjunto de validacion de 39 episodios de SO-101 Bench. El autor conserva ademas `step016000/` como alternativa seleccionada por validacion, con 22/39 (56,4%), lo que indica que el rendimiento se degrada ligeramente en la fase final del entrenamiento. No se documentan etapas de RLHF, DPO ni aprendizaje por refuerzo; el ajuste es puramente de imitacion supervisada sobre demostraciones.

## Capacidades

- Generacion de trayectorias de manipulacion robotica: produce chunks de 32 acciones a 30 Hz como objetivos articulares absolutos de 6 grados de libertad en unidades LeRobot, con replanificacion cada 16 acciones.
- Control visomotor con doble camara: consume simultaneamente vista cenital y vista de muneca, compuestas en un lienzo de 384x256.
- Memoria de episodio: utiliza el primer fotograma del episodio y el fotograma de 32 pasos atras para condicionar la prediccion, lo que aporta coherencia temporal a lo largo de la tarea.
- Modelado de dinamica visual: el experto de video heredado de Wan2.2-TI2V-5B permite representar la evolucion esperada de la escena.
- Comprension visual-linguistica: el componente RynnBrain1.1-2B aporta representaciones alineadas entre imagen y lenguaje.
- Reentrenamiento y ajuste fino: al publicarse `config.yaml` y `dataset_stats.json`, el checkpoint es reutilizable como punto de partida para nuevos fine-tunes sobre dominios o tareas distintas.
- Tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en el sentido de agentes LLM: no disponible (el modelo es una politica de control, no un agente conversacional).
- Capacidades multilingues: no disponible.
- Capacidad especial: modo de memoria de acondicionamiento por fotogramas con anclaje al inicio del episodio, documentado por el autor.

## Casos de uso

- Investigacion en world-action models: el checkpoint sirve como linea base reproducible sobre SO-101 Bench, con hiperparametros, configuracion resuelta y estadisticas de normalizacion publicadas, lo que permite replicar o superar el resultado de 22/39 en validacion.
- Benchmarking de politicas visomotoras: el script servidor `scripts/internw0_server.py` del repositorio SO-101 Bench facilita desplegar el modelo como servicio de inferencia y compararlo contra otras politicas bajo el mismo protocolo de evaluacion.
- Teleoperacion simulada en tareas de pick-and-place: el modelo genera objetivos articulares absolutos que un simulador puede ejecutar directamente, adecuado para automatizar episodios de recogida y colocacion sin intervencion humana.
- Ajuste fino sobre nuevos dominios: partiendo del checkpoint y de `dataset_stats.json` para la normalizacion, un equipo puede reentrenar el modelo sobre su propio conjunto de demostraciones con un coste de computo acotado (el run original requirio 36 horas en 4x A100-80GB, aproximadamente 1,17 epocas).
- Estudio de la brecha simulacion-realidad: dado que el ajuste se realizo exclusivamente sobre datos simulados, el modelo es util para medir cuanto rendimiento se pierde al transferir la politica a un brazo SO-101 fisico antes de invertir en datos reales.
- Seleccion de checkpoints y analisis de sobreajuste: la publicacion conjunta del paso 18.200 y del paso 16.000 permite estudiar empiricamente por que la seleccion por validacion supera al checkpoint final en tareas de imitacion robotica.
- Evaluacion de arquitecturas con memoria por fotogramas: al documentarse explicitamente el uso del primer fotograma y del fotograma de 32 pasos atras, sirve para experimentos de ablacion sobre el esquema de memoria temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ya que se trata de un modelo de politica robotica y no de un modelo de lenguaje. El unico dato de rendimiento publicado es la tasa de exito en el conjunto de validacion de SO-101 Bench (39 episodios):

| Checkpoint | Paso | Episodios resueltos | Tasa de exito |
|---|---|---|---|
| `step016000/` (seleccionado por validacion) | 16.000 | 22/39 | 56,4% |
| Raiz del repositorio (checkpoint oficial, ultimo paso) | 18.200 | 20/39 | 51,3% |

No se dispone de comparaciones con otras politicas sobre el mismo conjunto de validacion en la informacion proporcionada.

## Requisitos de hardware

- Entrenamiento reproducido por el autor: 4x A100-80GB, 36 horas, batch global 128, aproximadamente 1,17 epocas. Este es el unico dato de computo confirmado.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, sumando los componentes declarados (~5B de experto de video, 1,2B de experto de accion y ~2B de VLM, en total del orden de 8,2B de parametros) los pesos ocuparian aproximadamente 16,4 GB en bf16/fp16, a lo que hay que anadir las activaciones del decodificador de video y las memorias de acondicionamiento. Se trata de una estimacion derivada, no de una cifra publicada.
- GPU recomendadas: A100-80GB y H100 son las plataformas confirmadas para el entrenamiento. Para inferencia no se especifica hardware objetivo.
- Compatibilidad con GPU de consumo: no confirmada. Una RTX 4090 con 24 GB podria ser suficiente en bf16 si la suma de pesos y activaciones cabe en memoria, pero no hay ninguna validacion publicada al respecto.
- Opciones de despliegue: PyTorch con los pesos en `model.pt`, mas el servidor de inferencia `scripts/internw0_server.py` del repositorio SO-101 Bench. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, herramientas que ademas no aplican de forma estandar a un world-action model de robotica.
- Latencia y throughput: no disponibles como medida publicada. Por el diseno de control, con chunks de 32 acciones a 30 Hz y 16 acciones ejecutadas por replanificacion, la ventana entre replanificaciones es de aproximadamente 0,53 segundos (16/30), lo que fija el presupuesto temporal que debe cumplir la inferencia en tiempo real.
- Almacenamiento: el repositorio ocupa 24,8 GB, por lo que conviene reservar ese espacio como minimo para pesos y artefactos asociados.

## Comparativa con modelos similares

No se dispone de datos comparativos de otras familias de modelos de politica robotica (por ejemplo, VLA genericos) en la informacion proporcionada. La unica comparacion documentada es contra el modelo base del que deriva:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 5hadytru/so101_bench_InternW0-Delta (este modelo) | No disponible (componentes: ~5B video + 1,2B accion + ~2B VLM) | Memoria por fotogramas: primer fotograma + fotograma de 32 pasos atras | 22/39 (56,4%) en validacion SO-101 Bench con el paso 16.000; 20/39 (51,3%) con el paso 18.200 | `other` (terminos no detallados) | Publico en HuggingFace, 0 descargas, 0 likes, 24,8 GB |
| InternRobotics/InternW0-Delta-Base | No disponible (misma arquitectura base declarada) | No disponible | No disponible (no se publica tasa de exito para el modelo base) | No disponible en la informacion proporcionada | Publico en HuggingFace como modelo base |

Comparativa con alternativas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Entrenamiento exclusivamente simulado: el ajuste se hizo sobre teleoperacion simulada, por lo que existe una brecha simulacion-realidad no cuantificada en la informacion disponible.
- Evidencia estadistica limitada: el conjunto de validacion tiene solo 39 episodios; una diferencia de 2 episodios entre el paso 16.000 y el 18.200 (56,4% frente a 51,3%) esta dentro del ruido esperable de una muestra tan pequena y no deberia interpretarse como una mejora solida.
- Degradacion en el tramo final del entrenamiento: el checkpoint oficial (paso 18.200) rinde peor que el checkpoint intermedio (paso 16.000), un indicador clasico de sobreajuste o inestabilidad tardia que debe tenerse en cuenta al elegir pesos para produccion.
- Adopcion nula verificable: cero descargas y cero likes en el momento de la consulta implican que el modelo no ha sido validado de forma independiente por la comunidad.
- Licencia restrictiva o ambigua: los metadatos declaran `other` sin detallar los terminos. Es imprescindible revisar las condiciones del propietario antes de cualquier uso comercial o redistribucion, y verificar tambien las licencias heredadas del modelo base y de los componentes Wan2.2 y RynnBrain.
- Especificidad de hardware robotico: las salidas son objetivos articulares absolutos de 6 grados de libertad en unidades LeRobot, por lo que el modelo no es trasladable directamente a otras morfologias o grados de libertad sin reentrenamiento.
- Dependencia de la configuracion de camaras: el modelo espera una vista cenital y una vista de muneca compuestas en un lienzo de 384x256; cambiar la disposicion, la resolucion o el numero de camaras invalida el acondicionamiento aprendido.
- Ausencia de datos de sesgo, alucinacion y robustez: no se han publicado analisis de sesgo, de comportamiento ante escenas fuera de distribucion ni de modos de fallo.
- Sin cuantizaciones publicadas: al distribuirse unicamente `model.pt`, no existen versiones optimizadas para inferencia en hardware limitado, lo que dificulta el despliegue en plataformas embebidas.
- Idiomas no declarados: no aplica soporte multilingue en el sentido convencional, ya que el modelo no es conversacional.
- Resultados de busqueda web no relevantes: las consultas realizadas devolvieron exclusivamente resultados de carreras de caballos, sin ninguna fuente tecnica utilizable sobre el modelo.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/5hadytru/so101_bench_InternW0-Delta
- Modelo base: https://huggingface.co/InternRobotics/InternW0-Delta-Base
- Dataset de ajuste SO-101 Bench sim: https://huggingface.co/datasets/5hadytru/so101_bench_sim
- Repositorio de codigo de InternW0-Delta (referencia de commit `90801ba`): https://github.com/InternRobotics/InternW0-Delta
- Repositorio SO-101 Bench (receta de ajuste en `scripts/InternW0_fine_tuning/` y servidor en `scripts/internw0_server.py`): no disponible (el autor lo menciona sin enlace en la model card)
- Paper, blog o demo asociados: no disponible
- Resultados de busqueda web relevantes: no disponible (las busquedas devolvieron unicamente resultados de carreras, sin relacion con el modelo)
