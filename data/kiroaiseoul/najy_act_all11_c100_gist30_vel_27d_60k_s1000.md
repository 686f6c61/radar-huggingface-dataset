# kiroaiseoul/NAJY_act_all11_c100_gist30_vel_27D_60k_s1000

## Resumen

NAJY_act_all11_c100_gist30_vel_27D_60k_s1000 es un checkpoint de politica robotica basada en ACT (Action Chunking Transformer), publicado por el usuario kiroaiseoul en Hugging Face bajo la libreria LeRobot. No es un modelo de lenguaje: es un modelo de imitacion (behavior cloning) que mapea observaciones multimodales a comandos motores. Concretamente, toma un vector de estado de 27 dimensiones y tres imagenes RGB de 480x640 (camara alta y dos camaras de muneca, izquierda y derecha) y produce un vector de accion de 16 dimensiones. El checkpoint tiene 51.700.368 parametros (unos 51,7 millones) y el repositorio ocupa 0,2 GB.

El nombre del modelo codifica el contexto experimental: corresponde al proyecto NAJY, etapa 11 de tareas (`all11`), con los identificadores `c100` (probablemente tamano de chunk de acciones, no confirmado en la model card), `gist30`, `vel` (variante con informacion de velocidad), estado de 27 dimensiones (`27D`) y 60.000 pasos de entrenamiento (`60k`) con semilla o configuracion `s1000`. Segun la propia model card, esta escrito en coreano y fue entrenado en un sistema DGX identificado como `DGX_1`, y se sube explicitamente con fines de analisis y puntuacion, no como candidato definitivo para despliegue en hardware real.

El interes del checkpoint es doble. Por un lado, es un ejemplo de politica robotica compacta y abierta (licencia Apache 2.0) que cabe en GPUs de gama baja, lo que facilita la reproducibilidad y la experimentacion en laboratorios con recursos limitados. Por otro, forma parte de una familia de variantes del mismo autor (`vel`, `dq`, `sdrop70`) pensada para comparaciones controladas de hiperparametros y ablaciones, con una infraestructura de evaluacion propia que lee banderas desde un fichero `multi_manifest.json` y usa la herramienta `stage_cond_diag.py`. El contexto declarado es la investigacion sobre base movil documentada en `docs/mobile_base_investigation.md` §94 del proyecto `trossen-ai-simulation`, orientada a un montaje bimanual Trossen sobre plataforma movil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), politica de imitacion sobre transformer con codificador visual; no es un LLM |
| Parametros totales | 51.700.368 (aproximadamente 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de texto; el nombre incluye `c100`, que sugiere un horizonte de chunk de 100 acciones, no confirmado en la model card |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en precision original, sin variantes GGUF, INT8 ni INT4 documentadas |
| Idiomas soportados | no aplica (modelo de control robotico sin salida de texto); la model card esta redactada en coreano |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `3a1b10795eb727826b3f881bdb89646624d7fd10aeca49aceffec5a4ca844064`) |
| Dimension del estado de observacion | 27 (`observation.state`) |
| Dimension de la accion | 16 (`action`) |
| Entradas visuales | 3 camaras RGB 480x640: `cam_high`, `cam_left_wrist`, `cam_right_wrist` |
| Pasos de entrenamiento | 60.000 (run `exp_all11_c100_gist30_vel_s1000`) |
| Tamano del repositorio | 0,2 GB |
| Libreria de referencia | lerobot |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La familia ACT (Action Chunking Transformer) procede del trabajo de Zhao et al. (2023) sobre manipulacion bimanual de bajo coste. En lugar de predecir una unica accion, el modelo predice un bloque de acciones futuras (chunk), lo que reduce el error de acumulacion tipico del behavior cloning y permite ejecutar el modelo con una frecuencia de inferencia muy inferior a la frecuencia de control del robot. La variante publicada aqui integra un codificador visual que procesa tres flujos de imagen simultaneos (una vista cenital y dos vistas de muneca) junto con el vector de estado de 27 dimensiones, y emite un vector de accion de 16 dimensiones. El encuadre bimanual con camaras de muneca izquierda y derecha es coherente con un montaje de dos brazos sobre base movil.

Los datos de entrenamiento no estan documentados en la model card mas alla de la referencia al manifiesto `configs/datasets/all11_tr_hot_gist30_vel.json` y al identificador de commit `df9bebe`, asociado a la linea de log `=== launch 2026-10-14T13:25:48+00:00`. El prefijo `all11` sugiere que el conjunto abarca once tareas o etapas, y el sufijo `vel` apunta a que la variante incorpora informacion de velocidad en las observaciones o en los objetivos, pero ninguno de estos extremos se confirma en el texto publicado. Tampoco se indica el numero de episodios, el numero total de transiciones, la composicion del dataset, ni si se aplico algun tipo de regularizacion o ajuste posterior al entrenamiento supervisado. El unico dato operativo verificable es el numero de pasos (60.000) y el sistema de entrenamiento (un DGX).

Como innovacion practica, el autor documenta un flujo de evaluacion reproducible: el fichero `multi_manifest.json` que acompana al checkpoint contiene banderas de configuracion, y la herramienta de puntuacion (`stage_cond_diag.py`, entre otras) puede apuntar directamente a la carpeta del checkpoint porque mantiene la estructura `pretrained_model` de LeRobot. El autor recomienda verificar la integridad del peso con `sha256sum model.safetensors` antes de usarlo.

## Capacidades

- Generacion de acciones de control: produce vectores de 16 dimensiones a partir de estado y vision, adecuados para un montaje bimanual sobre plataforma movil.
- Percepcion multimodal: consume tres vistas RGB de 480x640 en paralelo, incluyendo dos vistas de muneca que aportan realimentacion visual de agarre.
- Fusion de propiocepcion y vision: integra un vector de estado de 27 dimensiones con las imagenes.
- Prediccion por chunks: el identificador `c100` apunta a un horizonte de acciones agrupadas (no confirmado), lo que habilita control con inferencia de baja frecuencia.
- Multiples tareas: el sufijo `all11` sugiere cobertura de once etapas o tareas dentro de un mismo entrenamiento (no confirmado en la model card).
- Integracion con LeRobot: los pesos siguen la estructura esperada por la libreria, lo que facilita cargar la politica y ejecutarla en bucles de control.
- Evaluacion y diagnostico: compatible con el flujo de puntuacion del autor mediante `multi_manifest.json` y `stage_cond_diag.py`.
- No dispone de: generacion de texto, razonamiento simbolico, tool calling, function calling, agentes multi-paso, capacidades multilingues ni modo de pensamiento. No es un modelo de lenguaje y no debe evaluarse como tal.

## Casos de uso

- Manipulacion bimanual sobre base movil: el checkpoint esta entrenado para un montaje con dos brazos y tres camaras; se usaria como politica de imitacion en tareas de recogida y colocacion donde la base debe desplazarse hasta la zona de trabajo antes de manipular.
- Investigacion en behavior cloning: sirve como referencia de partida para estudiar el efecto del tamano de chunk, del horizonte de prediccion y de la inclusion de velocidad, comparandolo con las variantes `dq` y `sdrop70` del mismo autor.
- Ablaciones controladas de hiperparametros: al compartir nombre base (`all11_c100_gist30_27D_60k_s1000`) y diferir solo en un sufijo, la familia permite aislar el efecto de una unica decision de diseno manteniendo constantes pasos, datos y semilla.
- Evaluacion estandarizada en simulacion: el checkpoint se puede pasar directamente a las herramientas de diagnostico del proyecto `trossen-ai-simulation`, de modo que un evaluador obtiene puntuaciones comparables entre checkpoints sin reescribir el pipeline.
- Verificacion de integridad y trazabilidad en MLOps: el sha256 publicado y el manifiesto de banderas permiten construir comprobaciones automaticas en CI que rechacen artefactos corruptos o no coincidentes antes de un rollout.
- Punto de partida para ajuste fino: al ser un modelo de 51,7 M de parametros con licencia Apache 2.0, es un candidato razonable para reentrenar o afinar en un montaje propio con pocos recursos de computo.
- Reproduccion academica en laboratorios con pocos medios: su tamano permite ejecutar inferencia y experimentos de evaluacion en una unica GPU de consumo, sin acceso a clústeres.
- Analisis de investigacion sobre base movil: encaja en el estudio documentado en `mobile_base_investigation.md` §94, orientado a entender como se comporta una politica entrenada sobre un robot con desplazamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion, ni metricas de simulacion o de hardware real. Tampoco se aportan comparaciones numericas con las variantes `dq` o `sdrop70` del mismo autor, ni con otros checkpoints de ACT.

| Benchmark | Resultado |
|---|---|
| Tasa de exito en tareas reales | no disponible |
| Tasa de exito en simulacion | no disponible |
| Error de accion (MSE / L1) | no disponible |
| Comparacion con variantes del mismo autor | no disponible |

## Requisitos de hardware

- Peso de los parametros en memoria: aproximadamente 207 MB en fp32, 103 MB en fp16/bf16 y 52 MB en int8, calculado a partir de los 51.700.368 parametros.
- VRAM estimada para inferencia: en el orden de 1 a 2 GB con lote 1, dominada por las activaciones del codificador visual al procesar tres imagenes de 480x640 mas que por los pesos. Es una estimacion derivada del recuento de parametros y de la resolucion de entrada, no un dato publicado.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para inferencia. Para evaluaciones con varios rollouts en paralelo o ajuste fino, son adecuadas RTX 3060 12 GB, RTX 4090, A100 o H100. El autor indica que el entrenamiento original se hizo en un sistema DGX.
- GPU de consumo: si, cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y similares. En iGPU o CPU la inferencia es posible pero probablemente demasiado lenta para control en tiempo real.
- Opciones de despliegue: la libreria LeRobot es la via natural de carga; tambien es viable PyTorch nativo, exportacion a ONNX o TorchScript para servir en un nodo de control, e integracion con ROS 2. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El diseno por chunks implica que la politica no necesita ejecutarse en cada paso de control, pero no se publica ninguna cifra de latencia, frecuencia de inferencia ni rendimiento por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|
| NAJY_act_all11_c100_gist30_vel_27D_60k_s1000 (este) | 51,7 M | `c100` en el nombre, no confirmado | apache-2.0 | Hugging Face, 0 descargas |
| NAJY_act_all11_c100_gist30_dq_27D_60k_s1000 | no disponible | `c100`, no confirmado | apache-2.0 (segun etiqueta del autor) | Hugging Face |
| NAJY_act_all11_c100_gist30_sdrop70_27D_60k_s1000 | no disponible | `c100`, no confirmado | apache-2.0 (segun etiqueta del autor) | Hugging Face |
| ACT original (Zhao et al., 2023) | no disponible en las fuentes consultadas | chunk de acciones | investigacion publica | paper y repositorio del proyecto original |

Las tres variantes de NAJY comparten datos, pasos y semilla, y difieren en un unico sufijo, por lo que constituyen el grupo de comparacion mas directo. No se dispone de cifras de rendimiento de ninguna de ellas, de modo que la comparacion queda limitada a la nomenclatura y a la licencia. Frente al ACT original, este checkpoint se distingue por su integracion con LeRobot, su publicacion en safetensors y su adaptacion a un montaje concreto de tres camaras y 27 dimensiones de estado.

## Limitaciones y advertencias

- Naturaleza del modelo: es una politica de imitacion, no un modelo generativo de texto. Aplicarle criterios de evaluacion de LLM (MMLU, HumanEval, GSM8K) carece de sentido.
- Sesgos de datos: el comportamiento queda determinado por el dataset `all11_tr_hot_gist30_vel`, no documentado. Cualquier sesgo de las demostraciones (posiciones iniciales, iluminacion, objetos, operador) se hereda directamente.
- Riesgo de alucinacion en sentido amplio: en behavior cloning, el equivalente es la extrapolacion fuera de distribucion, que produce acciones incoherentes o inseguras cuando la escena difiere de la vista en entrenamiento.
- Ausencia de metricas: no hay tasas de exito publicadas ni en simulacion ni en hardware, por lo que no es posible estimar la fiabilidad del checkpoint.
- Estado declarado por el autor: la propia model card indica que la subida es para analisis y puntuacion, y que no equivale a confirmar el checkpoint como candidato de despliegue real. No deberia usarse en un robot fisico sin una validacion previa.
- Ambiguedad de nomenclatura: componentes como `gist30`, `c100` o `s1000` no estan definidos en la documentacion disponible, lo que dificulta reproducir la configuracion exacta de entrenamiento.
- Idiomas y documentacion: la model card esta en coreano y no existe version en castellano ni en ingles publicada por el autor.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime de responsabilidad sobre el comportamiento del robot ni sobre los datos de entrenamiento subyacentes, cuya licencia no se especifica.
- Produccion: antes de cualquier despliegue conviene verificar el sha256 del peso, comprobar compatibilidad de la version de LeRobot con la estructura `pretrained_model` y establecer limites de parada de seguridad independientes del modelo.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validaciones externas conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_vel_27D_60k_s1000
- Variante `dq` del mismo autor: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_dq_27D_60k_s1000
- Variante `sdrop70` del mismo autor: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_sdrop70_27D_60k_s1000
- Documentacion de referencia citada en la model card: `trossen-ai-simulation`, `docs/mobile_base_investigation.md` §94 (ruta mencionada por el autor; no se ha encontrado URL publica en los resultados de busqueda)
- Paper original de la arquitectura ACT (Zhao et al., 2023): no se ha encontrado enlace en los resultados de busqueda
