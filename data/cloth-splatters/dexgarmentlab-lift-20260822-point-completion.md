# Cloth-splatters/dexgarmentlab-lift-20260822-point-completion

## Resumen

DexGarmentLab Lift — point-completion network es una red neuronal de completado de nubes de puntos para prendas de tela deformables, publicada por el usuario Cloth-splatters en HuggingFace. No es un modelo de lenguaje: es el componente de "completion" del baseline CR (completion + registration, seccion V-B) del paper ClothAtlas, y su funcion es reconstruir la superficie completa de una prenda a partir de una nube parcial captada por un sensor, con oclusiones y ruido.

La arquitectura combina un codificador PointNet++ con un decodificador estilo PCN que emite 512 puntos gruesos y una rejilla de plegado 2 x 2 alrededor de cada uno de ellos, hasta 2048 puntos finos. Se entrena con distancia de Chamfer L1 simetrica sobre ambas salidas. La entrada es una nube parcial de 2048 puntos con la corrupcion del estimador (jitter, dropout aleatorio y en cuña, outliers), escalada conjuntamente entre 0,8 y 1,25, rotada en yaw junto a su objetivo, centrada y con mascara de validez.

Es relevante en el contexto de robotica de manipulacion de tejidos y gemelos digitales textiles: el baseline CR completo (esta red mas un registro no rigido de la malla canonica) alcanza una Chamfer de superficie de 16,0 mm sobre 7.537 fotogramas de test. El repositorio pesa 0,0 GB y no se listan pesos descargables, por lo que el checkpoint se obtiene a traves del codigo del proyecto UniClothDiff.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet++ (codificador) + decodificador estilo PCN con plegado (folding) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada: una nube parcial de 2048 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo geometrico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0,0 GB y no se listan ficheros de pesos) |
| Tarea | Completado de nubes de puntos (point completion) de prendas deformables |
| Entrada | Nube parcial de 2048 puntos, centrada, remuestreada, con mascara de validez; escala conjunta 0,8-1,25 y yaw alineado con el objetivo |
| Salida | 512 puntos gruesos + 2048 puntos finos (rejilla 2 x 2 por punto grueso) |
| Funcion de perdida | Distancia de Chamfer L1 simetrica sobre salida gruesa y fina |
| Dataset de entrenamiento | 128.136 fotogramas de entrenamiento (stride 5); dataset asociado Cloth-splatters/dexgarmentlab-lift-correspondence-20260822 |
| Validacion | 3.535 fotogramas |
| Test | 7.537 fotogramas |
| Checksum de pesos | SHA-256 d67ecfcc63cbb68dd596c5a852cfe690ab498f0f02e8676436a1ae31306a7363 |
| Pipeline declarado en HuggingFace | no disponible |

## Arquitectura y entrenamiento

El modelo se implementa en `src/models/point_completion.py` como `PointCompletionNet`. El codificador es un PointNet++ que consume la nube parcial; el decodificador sigue el esquema PCN: genera primero 512 puntos gruesos y, a continuacion, una rejilla de plegado 2 x 2 alrededor de cada punto grueso para producir 2048 puntos finos. La supervision es una Chamfer L1 simetrica aplicada de forma conjunta a las dos salidas (gruesa y fina), lo que fuerza coherencia entre la prediccion global y el refinamiento local. El preprocesado es relevante para la reproducibilidad: la nube de entrada incorpora la corrupcion de entrenamiento del estimador (jitter, dropout aleatorio, dropout en cuña y outliers), se escala de forma conjunta con su objetivo en el rango 0,8-1,25, se rota en yaw de forma solidaria con el objetivo, se centra y se remuestrea a 2048 puntos con mascara de validez. El objetivo son 2048 muestras sobre la superficie de ground truth en el mismo sistema de referencia.

El entrenamiento se lanzo con `scripts/train_point_completion.py`, job 1152819, finalizado el 8 de septiembre de 2026 con una duracion de 1 hora y 44 minutos sobre una sola GPU GH200. Se usaron 128.136 fotogramas de entrenamiento (stride 5), 20 epocas, batch de 64, AdamW con learning rate 3e-4 y weight decay 0,05, una epoca de warm-up, schedule coseno, autocast en bf16 y semilla 0. La mejor epoca fue la 18, con una mediana de Chamfer fina de 13,33 mm en validacion (20,13 mm para la salida gruesa) sobre 3.535 fotogramas. En el pipeline CR completo, esta red se sigue de un registro no rigido de la malla canonica a la nube completada (`scripts/eval_reconstruction_completion.py`), con peso de deformacion por aristas 0 y peso laplaciano 100, elegidos sobre el split de validacion. No se documenta RLHF, DPO ni decodificacion especulativa, ya que no aplican a este dominio.

## Capacidades

- Completado de nubes de puntos parciales: reconstruye la superficie de una prenda de tela a partir de una observacion incompleta de 2048 puntos.
- Robustez a oclusiones y ruido: entrenado explicitamente con jitter, dropout aleatorio, dropout en cuña y outliers, imitando la corrupcion del estimador de estado.
- Prediccion jerarquica en dos niveles: 512 puntos gruesos para la estructura global y 2048 puntos finos para el detalle local.
- Invariancia aproximada a escala y orientacion dentro del rango de entrenamiento (escala 0,8-1,25, alineacion en yaw con el objetivo).
- Integracion en un pipeline de reconstruccion: su salida alimenta un registro no rigido posterior que recupera la superficie de la malla canonica.
- Procesamiento de fotogramas individuales de secuencias de manipulacion de prendas (no se documenta soporte de secuencias temporales ni memoria entre fotogramas).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento: es un modelo puramente geometrico.
- No se documentan capacidades de vision 2D, audio ni generacion de texto.

## Casos de uso

- Estimacion de estado en robotica de manipulacion de tejidos: el modelo completa la nube parcial de la prenda cuando la pinza o el brazo robotico ocluyen buena parte de la superficie, proporcionando una representacion completa utilizable por un planificador de agarre.
- Gemelo digital textil: a partir de escaneos parciales de una prenda real se reconstruye una superficie completa que puede registrarse contra una malla canonica para simular su comportamiento fisico.
- Generacion de objetivos para politicas de manipulacion: en tareas tipo lift de DexGarmentLab, la nube completada sirve como estado objetivo o como referencia de error para la politica.
- Baseline academico reproducible: el modelo y su job de entrenamiento documentado permiten comparar nuevos metodos de completado de deformables contra una referencia con metricas publicadas sobre 7.537 fotogramas de test.
- Etiquetado y aumento de datos: completar nubes parciales para generar pares entrada-salida adicionales que alimenten el entrenamiento de estimadores de estado o de registradores no rigidos.
- Inspeccion en confeccion y control de calidad: reconstruir la geometria tridimensional de una prenda colgada o extendida para detectar deformaciones o pliegues anomalos respecto a un patron esperado.
- Probador virtual y realidad aumentada: completar el escaneo parcial de una prenda sobre un usuario para ajustar la malla simulada, aunque sin validacion publicada en ese dominio.
- Planificacion de puntos de agarre libres de oclusion: la nube completada ofrece puntos en zonas no observadas, lo que permite elegir puntos de contacto alejados de la zona ya cogida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es linguistico. Se presentan las metricas geometricas reportadas por el autor.

| Metrica | Valor | Split / condicion |
|---|---|---|
| Chamfer fina (mediana) | 13,33 mm | Validacion, mejor epoca (18), 3.535 fotogramas |
| Chamfer gruesa (mediana) | 20,13 mm | Validacion, mejor epoca (18), 3.535 fotogramas |
| Chamfer de superficie (pipeline CR) | 16,0 mm | Test, 7.537 fotogramas |
| Chamfer en region ocluida (pipeline CR) | 16,0 mm | Test |
| Chamfer en decil peor de region ocluida (pipeline CR) | 37,4 mm | Test |
| Error de vertice p90 (pipeline CR) | 332 mm | Test; el registro recupera la superficie, no la correspondencia |

No se proporcionan comparaciones con otros metodos de completado dentro de la informacion disponible.

## Requisitos de hardware

- Entrenamiento documentado: una unica GPU GH200 durante 1 hora y 44 minutos para 20 epocas con batch 64 sobre 128.136 fotogramas en bf16.
- VRAM de inferencia: no disponible. No se han publicado mediciones; por el tamano de la entrada (2048 puntos) y la naturaleza del backbone, es previsible que quepa en GPUs de consumo, pero no hay cifras confirmadas en la informacion disponible.
- GPUs recomendadas: no disponible. La unica referencia publicada es la GH200 usada en entrenamiento; no se documentan pruebas en A100, H100, RTX 4090 ni similares.
- Opciones de despliegue: no hay integracion con vLLM, llama.cpp, Ollama ni TGI. La carga se realiza mediante `resolve_checkpoint` del modulo `src.hub` y la clase `PointCompletionNet` del repositorio de codigo, por lo que el despliegue exige clonar el proyecto UniClothDiff (rama `icra`) y sus dependencias.
- Latencia y throughput: no disponible. Solo se conoce el tiempo total de entrenamiento (1 h 44 min para 20 epocas), del que no se puede derivar una latencia de inferencia fiable.
- Almacenamiento: el repositorio de HuggingFace ocupa 0,0 GB, por lo que no se puede confirmar la presencia de los pesos en el hub.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada / salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DexGarmentLab Lift point completion (este modelo) | PointNet++ + decodificador PCN con folding | Nube parcial de 2048 puntos / 512 gruesos + 2048 finos | no aplica | MIT | Repositorio HF de 0,0 GB; pesos via `resolve_checkpoint` en UniClothDiff |
| PCN (familia de referencia del decodificador) | PointNet + decodificador con folding | Nube parcial / puntos gruesos y finos | no aplica | no disponible | no disponible |
| PoinTr y variantes basadas en transformer | Transformer sobre nubes de puntos | Nube parcial / nube completa | no aplica | no disponible | no disponible |
| Metodos de completion especificos de tela deformable | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de metricas comparables publicadas en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio de HuggingFace ocupa 0,0 GB y no se listan ficheros de pesos; no se puede verificar que el checkpoint sea descargable directamente desde el hub.
- El uso requiere el codigo del proyecto UniClothDiff (rama `icra`) y el modulo `src.hub.resolve_checkpoint`; no hay formato de pesos estandarizado (safetensors, GGUF) declarado.
- No es un modelo de lenguaje: no admite prompting, tool calling, agentes ni razonamiento multi-paso, por lo que no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Sesgos de dominio: el modelo esta entrenado con la corrupcion concreta del estimador de estado de DexGarmentLab (jitter, dropout aleatorio, dropout en cuña, outliers) y sobre el dataset ClothAtlas; su comportamiento fuera de esa distribucion de prendas, sensores y condiciones de iluminacion no esta validado.
- Riesgo de geometria plausible pero incorrecta: como cualquier decodificador generativo, puede producir superficie verosimil en zonas nunca observadas que no corresponda a la prenda real. Es el equivalente geometrico a una alucinacion.
- Oclusiones severas: el decil peor de la region ocluida alcanza 37,4 mm de Chamfer, mas del doble que la mediana global, lo que limita su uso en escenarios con oclusion muy agresiva.
- El error de vertice p90 de 332 mm en el pipeline CR indica que el registro recupera la superficie pero no la correspondencia; cualquier aplicacion que necesite correspondencia densa entre malla y prenda no puede apoyarse en esta salida.
- Dependencia del preprocesado: la entrada debe centrarse, remuestrearse a exactamente 2048 puntos, incluir mascara de validez y respetar el rango de escala 0,8-1,25; saltarse estos pasos degrada el resultado sin aviso.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia del dataset asociado y de la malla canonica puede ser distinta y debe comprobarse por separado.
- No hay informacion sobre idiomas (no aplica), sesgos sociales ni evaluaciones de robustez adversarial en la documentacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cloth-splatters/dexgarmentlab-lift-20260822-point-completion
- Dataset asociado: https://huggingface.co/datasets/Cloth-splatters/dexgarmentlab-lift-correspondence-20260822
- Codigo (rama `icra` del proyecto UniClothDiff): https://github.com/jsll/UniClothDiff/tree/icra
- Implementacion del modelo: `src/models/point_completion.py` del repositorio anterior
- Script de entrenamiento: `scripts/train_point_completion.py`
- Script de evaluacion del pipeline CR: `scripts/eval_reconstruction_completion.py`
- Nota sobre la busqueda web: no se han encontrado enlaces tecnicos relevantes al modelo; los resultados devueltos corresponden a definiciones genericas del termino "cloth" (Wikipedia, Cambridge Dictionary, Merriam-Webster, WordReference) y a un mod de Minecraft (Cloth Config API), sin relacion con este modelo.
