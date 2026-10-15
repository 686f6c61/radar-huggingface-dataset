# kiroaiseoul/NAJY_act_all11_c100_gist30_nohot_16D_60k_s1000

## Resumen

NAJY_act_all11_c100_gist30_nohot_16D_60k_s1000 es un checkpoint de politica robotica basada en ACT (Action Chunking with Transformers) entrenado con la libreria LeRobot de Hugging Face. Lo publica el usuario kiroaiseoul dentro de una serie de experimentos denominada NAJY, asociada al proyecto trossen-mobile-ai (robot movil de Trossen Robotics), y corresponde a un entrenamiento de 60.000 pasos sobre una configuracion de 11 tareas o conjuntos de datos. El modelo tiene 51.689.104 parametros (unos 51,7 millones) y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB.

No es un modelo de lenguaje: es una politica de control visuomotor que consume estado propioceptivo y tres flujos de imagen de 480x640 y produce vectores de accion de 16 dimensiones. La entrada se define como `observation.state` de 16 dimensiones, tres camaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) a 480x640 con 3 canales, y una salida `action` de 16 dimensiones. Esto lo situa en la categoria de modelos de imitacion (behavior cloning) para manipulacion robotica, no en la de asistentes conversacionales.

Su relevancia es acotada y muy especifica: la propia model card indica que se sube "para analisis y puntuacion" y que es independiente de la confirmacion de un candidato para despliegue real, ademas de referenciar el documento `docs/mobile_base_investigation.md` seccion 94 del proyecto trossen-ai-simulation. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de investigacion interna y no de un modelo con adopcion publica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers, implementacion de LeRobot) |
| Parametros totales | 51.689.104 (51,7 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de observacion y el tamano de chunk no se documentan en la model card) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica: politica robotica visuomotora, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `0188942dd36c0801bc1d26011da7faadc14c49b9c7bc8b22f1cd39f38e812249`) |
| Entrada: estado | `observation.state`, vector de 16 dimensiones |
| Entrada: vision | `observation.images.cam_high`, `observation.images.cam_left_wrist`, `observation.images.cam_right_wrist`, 3x480x640 cada una |
| Salida | `action`, vector de 16 dimensiones |
| Pasos de entrenamiento | 60.000 |
| Run asociado | `exp_all11_c100_gist30_nohot_s1000`, step 60000 |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

ACT es una politica de imitacion basada en transformer que combina un codificador estilo CVAE (que recibe la secuencia de acciones de demostracion durante el entrenamiento y se descarta o condiciona en inferencia) con un decodificador transformer que predice un bloque o "chunk" de acciones futuras en lugar de una sola accion por paso. Esta prediccion por bloques reduce el error de composicion acumulado tipico de las politicas de un solo paso y permite control a mayor frecuencia efectiva. La implementacion concreta de este checkpoint corresponde a la integracion de ACT en LeRobot, cuya configuracion por defecto se situa en torno a los 52 millones de parametros, coherente con los 51.689.104 declarados en el archivo safetensors.

La informacion disponible sobre el entrenamiento es fundamentalmente de trazabilidad, no de composicion de datos: se conoce el numero de pasos (60.000), el identificador de ejecucion, el hash de commit del codigo (`git df9bebe`), el manifiesto de dataset (`configs/datasets/all11_tr_nohot_gist30.json`, sha256 `88546020e2921d90`) y la linea de lanzamiento con marca temporal `2026-10-14T13:28:20+00:00`. El sufijo `all11` sugiere un entrenamiento agregado sobre once tareas o subconjuntos, `nohot` apunta a la ausencia de algun elemento etiquetado como "hot" en el pipeline y `16D` coincide con las 16 dimensiones de estado y accion, pero la model card no define estos terminos, por lo que no se pueden dar por confirmados. No se documentan numero de tokens, numero de episodios, composicion del dataset, ni el uso de RLHF, DPO o cualquier etapa de ajuste por preferencias, que en cualquier caso no aplican al paradigma de behavior cloning.

## Capacidades

- Control visuomotor de manipulacion: genera comandos de accion de 16 dimensiones a partir de tres vistas de camara y del estado propioceptivo de 16 dimensiones.
- Aprendizaje por imitacion: reproduce comportamientos derivados de demostraciones teleoperadas, no comportamientos especificados por texto ni por recompensa.
- Prediccion por bloques de accion (action chunking), orientada a reducir la acumulacion de error en horizontes largos.
- Integracion de multiples camaras: una vista alta o global y dos vistas de muneca (izquierda y derecha), lo que aporta informacion de agarre y de contexto de escena.
- Compatibilidad con el ecosistema LeRobot: el repositorio tiene estructura `pretrained_model`, de modo que puede cargarse directamente con las utilidades de LeRobot.
- Verificacion de integridad: la model card publica el sha256 de `model.safetensors` y la herramienta de puntuacion del autor lee los flags desde `multi_manifest.json` en la misma carpeta.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso, agentes y capacidades conversacionales: no disponible (no aplica).
- Capacidades multilingues, vision general, audio o modo de pensamiento: no disponible (no aplica; la vision se limita a la entrada de politica).

## Casos de uso

- Manipulacion robotica de base movil: es su proposito declarado, ligado al proyecto trossen-mobile-ai y al documento `mobile_base_investigation.md`; se usaria como politica de control que traduce observaciones de camara y estado en acciones de 16 grados de actuacion.
- Punto de partida para ajuste fino (fine-tuning) en tareas nuevas: al ser un ACT de 51,7 M de parametros con licencia Apache-2.0, es viable reentrenarlo o continuar su entrenamiento sobre un dataset propio con la misma firma de observaciones.
- Reproduccion de experimentos de investigacion: el checkpoint incluye hashes de pesos, de manifiesto de dataset y del commit de codigo, lo que permite auditar y replicar el resultado concreto de los 60.000 pasos.
- Comparacion de variantes dentro de la familia NAJY: puede contrastarse con los otros checkpoints publicados por el mismo autor (por ejemplo las variantes de 27 dimensiones) para aislar el efecto de la configuracion de acciones o de chunking sobre la tasa de exito en simulacion.
- Base para evaluacion en simulacion antes de despliegue fisico: dado que la model card lo presenta como artefacto de analisis y puntuacion, su uso natural es servir de material de evaluacion con las herramientas del propio autor antes de considerar un candidato definitivo.
- Docencia y prototipado en robotica con presupuesto reducido: con 0,2 GB de repositorio y ~52 M de parametros puede ejecutarse en hardware de consumo, lo que lo hace util para cursos o laboratorios de imitation learning sin acceso a GPU de datacenter.
- Componente de pipelines de investigacion en bases moviles: al integrarse con LeRobot, encaja en flujos de recogida de datos teleoperados, entrenamiento y evaluacion periodica como el que describe el entrenamiento en una unidad DGX del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de exito, errores de seguimiento de trayectoria, ni comparaciones con otras politicas, y los resultados de busqueda web no aportan metricas del modelo.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,2 GB para los pesos (51,7 M de parametros x 4 bytes), mas activaciones de tres imagenes de 480x640 y del transformer; en la practica, por debajo de 1-2 GB en funcion del tamano de lote y de la implementacion.
- VRAM estimada en fp16/bf16: en torno a 0,1 GB de pesos; el cuello de botella real es el preprocesado de imagen, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo es deliberadamente ligero y no requiere aceleradores de datacenter.
- Cabe en GPU de consumo: si, con margen amplio en practicamente cualquier GPU discreta moderna, e incluso es plausible su ejecucion en CPU para inferencia a baja frecuencia, aunque esto no se documenta en la informacion disponible.
- Opciones de despliegue: libreria LeRobot (carga directa desde `pretrained_model`); despliegue en PyTorch es el camino documentado. Exportacion a ONNX, TorchScript, TensorRT o integraciones con vLLM, llama.cpp, Ollama o TGI: no disponible (no aplican a una politica de control; vLLM, llama.cpp y Ollama estan orientados a modelos de lenguaje).
- Latencia y throughput: no disponible. No se publican mediciones de frecuencia de control, tiempo de inferencia por chunk ni rendimiento en Hz.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de accion | Entrada | Licencia | Estado |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_gist30_nohot_16D_60k_s1000 (este) | 51,7 M | 16D | estado 16D + 3 camaras 480x640 | apache-2.0 | 0 descargas, 0 likes |
| kiroaiseoul/NAJY_act_all11_c100_gist30_dq_27D_60k_s1000 | no disponible | 27D (segun nombre) | no disponible | no disponible | publicado por el mismo autor |
| kiroaiseoul/NAJY_act_all11_c100_m1_27D_60k_s2000 | no disponible | 27D (segun nombre) | no disponible | no disponible | publicado por el mismo autor |
| ACT de referencia (LeRobot, configuracion por defecto) | ~52 M | configurable | configurable | Apache-2.0 | implementacion de codigo abierto |

Los dos checkpoints NAJY de 27 dimensiones y pasos de entrenamiento distintos (60.000 con sufijo `s1000` frente a 60.000 con sufijo `s2000`) parecen variantes del mismo estudio, pero la informacion disponible no incluye sus especificaciones ni metricas, por lo que la comparacion cuantitativa no es posible con los datos proporcionados.

## Limitaciones y advertencias

- Artefacto de investigacion, no de produccion: la propia model card indica que se sube para analisis y puntuacion, y que es independiente de la confirmacion de un candidato para despliegue real.
- Sin adopcion verificable: 0 descargas y 0 likes, sin evaluaciones de terceros ni resultados de benchmarks publicados.
- Acoplamiento estricto a la interfaz: exige exactamente `observation.state` de 16 dimensiones, tres camaras concretas (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) a 480x640 y una salida de 16 dimensiones. Cambiar la configuracion de sensores o el numero de grados de libertad invalida el checkpoint.
- Riesgo de desajuste de dominio (domain shift): una politica de imitacion entrenada sobre un conjunto concreto de demostraciones degrada su comportamiento ante iluminacion, fondo, posicion de camara o dinamica del robot distintas de las del entrenamiento.
- Terminologia del nombre no documentada: el significado de `c100`, `gist30`, `nohot`, `s1000` o `all11` no se define en la informacion disponible, por lo que no deben interpretarse como garantia de tamano de chunk, filtrado de datos ni numero de tareas sin confirmacion del autor.
- Opacidad del dataset: no se publican numero de episodios, duracion de demostraciones, diversidad de escenas ni criterios de curacion (`nohot` sugiere algun filtrado, pero no se especifica cual).
- Sesgos: no disponible. No se documentan sesgos, pero al derivar de teleoperacion humana hereda los sesgos de las demostraciones (estrategias preferidas del operador, escenas sobrerrepresentadas).
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos de lenguaje; el riesgo equivalente es la generacion de acciones plausibles pero fisicamente invalidas fuera de la distribucion de entrenamiento, con posible dano al robot o al entorno.
- Limitaciones de contexto e idioma: no aplica idioma; la ventana de observacion y el horizonte de prediccion no se documentan.
- Licencia: Apache-2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y derechos de autor. Conviene verificar la licencia de los datasets de teleoperacion subyacentes, que puede ser distinta de la del checkpoint.
- Verificacion de integridad recomendada: la model card pide comprobar `sha256sum model.safetensors` contra `0188942dd36c0801bc1d26011da7faadc14c49b9c7bc8b22f1cd39f38e812249` antes de usarlo.
- Despliegue fisico: ninguna fuente proporcionada acredita que este checkpoint haya sido validado sobre hardware real; las marcas temporales de creacion y actualizacion (14 de octubre de 2026) y el contexto de simulacion apuntan a un uso en evaluacion, no en robot fisico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_nohot_16D_60k_s1000
- Checkpoint relacionado: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_dq_27D_60k_s1000
- Checkpoint relacionado: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_m1_27D_60k_s2000
- Documento de referencia citado en la model card: `trossen-ai-simulation`, `docs/mobile_base_investigation.md`, seccion 94 (URL publica no disponible en la informacion proporcionada)
- Otros resultados de busqueda (nyaa.net, kbjradar.com, skbj.tv): no relevantes para este modelo, descartados por no guardar relacion con robotica ni con ACT.
