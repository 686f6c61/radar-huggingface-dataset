# kiroaiseoul/NAJY_act_all11_r3_27D_60k_s1000

## Resumen

NAJY_act_all11_r3_27D_60k_s1000 es un checkpoint de politica robotica ACT (Action Chunking with Transformers) publicado por el usuario kiroaiseoul en HuggingFace, dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un modelo de imitacion (imitation learning) que mapea observaciones multimodales de un robot movil con dos brazos (estado de 27 dimensiones, estado de entorno de 11 dimensiones y tres camaras RGB a 480x640) a un vector de accion de 17 dimensiones. El checkpoint corresponde al paso 60.000 del run `exp_all11_tph_env_dropall30_s1000` y esta entrenado para cubrir las 11 etapas de la tarea de laboratorio del proyecto "Mobile AI" de Trossen.

Su relevancia es acotada y experimental: el propio autor indica en la model card que la subida tiene fines de analisis y puntuacion ("analisis y evaluacion"), y que no equivale a la confirmacion de un candidato para despliegue en hardware real. Se trata, por tanto, de un artefacto de investigacion util para reproducir, auditar y comparar variantes de entrenamiento de ACT sobre un mismo conjunto de datos de 11 etapas, no de un modelo listo para produccion.

El modelo tiene 51.636.369 parametros totales, un repositorio de 0,2 GB, licencia Apache 2.0 y se distribuye en formato safetensors con la estructura `pretrained_model` de LeRobot. Las fechas de creacion y actualizacion registradas en HuggingFace son el 8 de octubre de 2026, y el log de entrenamiento arranca el 7 de octubre de 2026 con el commit `0aea39b`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementacion LeRobot |
| Parametros totales | 51.636.369 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; politica de horizonte de accion, no modelo autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en el layout `pretrained_model`) |
| Idiomas soportados | no aplica / no disponible (modelo de politica robotica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), estructura `pretrained_model` de LeRobot |
| Tamano del repositorio | 0,2 GB |
| Run / paso del checkpoint | `exp_all11_tph_env_dropall30_s1000`, step 60000 |
| Hash sha256 de los pesos | `e78b5e5ca5cc102b72796b786dfb604cdab4fec44f7e54436bf69aa29608b815` |
| Espacio de observacion | `observation.state` [27], `observation.environment_state` [11], `observation.images.cam_high` [3, 480, 640], `observation.images.cam_left_wrist` [3, 480, 640], `observation.images.cam_right_wrist` [3, 480, 640] |
| Espacio de accion | `action` [17] |
| Flags del manifiesto | `trim_idle: true`, `pad_hold: true`, `progress: true`, `env_stage_token: true`, `image_dropout.all: 0.3` |
| Pipeline / libreria | robotics / lerobot |
| Descargas / likes | 11 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una politica de imitacion basada en transformer que predice un "chunk" de acciones futuras en lugar de una unica accion por paso, con el objetivo de reducir el error de acumulacion y mejorar la estabilidad en tareas de manipulacion de precision. En LeRobot la implementacion habitual combina codificadores visuales convolucionales (tipo ResNet) por camara, un codificador de estado y un transformer que produce la secuencia de acciones. Esta descripcion corresponde a la arquitectura ACT de referencia y al tag `act` declarado en el repositorio; la model card de este checkpoint no detalla la configuracion concreta de capas, dimensiones ocultas ni horizonte de chunking, por lo que esos datos deben considerarse "no disponibles" en la informacion proporcionada.

Los datos de entrenamiento disponibles son los siguientes: el manifiesto es `configs/datasets/all11_tr_hot_tph_env_dropall30.json`, el log comienza con `=== launch 2026-10-07T07:26:31+00:00 git 0aea39b manifest configs/datasets/all11_tr_hot_tph_env_dropall30.json`, y el checkpoint es el paso 60.000 del run `exp_all11_tph_env_dropall30_s1000`. El sufijo `dropall30` y el flag `image_dropout: {"all": 0.3}` indican una augmentation de dropout aplicada al 30 % a las tres camaras durante el entrenamiento, presumiblemente para aumentar la robustez ante perdida o degradacion de senal visual. El flag `env_stage_token` sugiere la incorporacion de un token de etapa del entorno, coherente con una tarea estructurada en 11 etapas; `trim_idle` y `pad_hold` apuntan a recorte de tramos inactivos y relleno de tramos de espera en las trayectorias; y `progress` sugiere el uso de una senal de progreso de tarea. No se especifica el numero de episodios, el numero de tokens ni la composicion del dataset mas alla del nombre del manifiesto. No hay informacion sobre RLHF, DPO ni ningun tipo de ajuste por refuerzo; se trata de aprendizaje por imitacion supervisado.

## Capacidades

- Generacion de acciones de control robotico: produce un vector de accion de 17 dimensiones a partir de observaciones de estado y vision, apto para control continuo de un robot movil con manipuladores.
- Percepcion multimodal: procesa tres flujos de imagen RGB de 480x640 (camara alta y dos camaras de muneca) junto con estado propioceptivo de 27 dimensiones y estado de entorno de 11 dimensiones.
- Ejecucion de tareas multi-etapa: el flag `env_stage_token` y el nombre `all11` indican cobertura de las 11 etapas de la tarea de laboratorio "Mobile AI" de Trossen en un unico checkpoint.
- Manipulacion movil: el contexto del repositorio (`trossen-mobile-ai`, `mobile_base_investigation.md`) apunta a una plataforma con base movil, aunque la ficha no documenta la distribucion exacta de las 17 dimensiones de accion.
- Tolerancia a dropout visual: el entrenamiento con `image_dropout.all = 0.3` busca mantener el rendimiento cuando alguna camara falta o se degrada.
- Herramientas de evaluacion offline: la model card indica que el repositorio incluye `multi_manifest.json` para que la herramienta de puntuacion lea los flags del manifiesto, y que puede usarse con `stage_cond_diag.py` sin reestructurar el checkpoint.
- No soporta: tool calling, function calling, agentes, razonamiento multi-paso simbolico, generacion de texto, codigo, matematicas ni capacidades multilingues. Estas capacidades no aplican a un modelo de politica robotica.

## Casos de uso

- Automatizacion de rutinas de laboratorio en 11 etapas: el checkpoint cubre las 11 etapas de la tarea Mobile AI en un solo modelo, lo que permite ejecutar una secuencia completa de laboratorio sin cambiar de politica entre etapas.
- Reproduccion de experimentos de imitacion: dado que se publica el manifiesto, el flag set y el hash sha256, es un artefacto apto para reproducir el run `exp_all11_tph_env_dropall30_s1000` paso 60.000 y verificar integridad de pesos con `sha256sum`.
- Evaluacion offline con `stage_cond_diag.py`: la model card indica que el checkpoint conserva la estructura `pretrained_model`, de modo que puede alimentarse directamente a las utilidades de diagnostico condicionado por etapa sin conversion previa.
- Analisis de ablaciones de robustez visual: al haberse entrenado con 30 % de dropout en las tres camaras, sirve como referencia para estudiar degradacion de politica en escenarios de oclusion o fallo de camara.
- Punto de partida para fine-tuning con LeRobot: al ser compatible con la libreria lerobot y licencia Apache 2.0, puede reentrenarse sobre datasets adicionales de la misma plataforma (nuevas etapas, nuevas disposiciones del laboratorio) partiendo de los 60k pasos ya aprendidos.
- Comparacion de semillas y longitudes de entrenamiento: los repositorios hermanos (`hot_27D_120k_s1000`, `hot_27D_120k_s2000`) permiten comparar este checkpoint de 60k pasos frente a runs de 120k pasos y distintas semillas para estudiar rendimiento en etapas de locomocion.
- Validacion en simulacion antes de hardware real: el repositorio de referencia `trossen-ai-simulation` (documento `mobile_base_investigation.md` §94) sugiere un flujo de evaluacion en simulacion, util para descartar politicas inestables antes de desplegarlas.
- Recogida de datos asistida: la politica puede usarse para predecir la accion siguiente durante teleoperacion o para generar trayectorias sinteticas que un operador corrige, acelerando la recoleccion de nuevas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de exito por etapa, errores de seguimiento, ni comparaciones cuantitativas con otros checkpoints. Unicamente se menciona de forma cualitativa, en repositorios hermanos, que la semilla 1000 de 120k pasos "es la mejor semilla offline en etapas de locomocion", pero no se aportan cifras para este checkpoint de 60k pasos.

## Requisitos de hardware

Nota: al no publicarse cifras oficiales de VRAM ni latencia, los valores siguientes son estimaciones derivadas del numero de parametros (51,6 M) y de la resolucion de entrada; deben validarse en el entorno de destino.

- VRAM estimada para los pesos: aproximadamente 0,21 GB en fp32, 0,10 GB en fp16/bf16 y 0,05 GB en int8. El grueso de la memoria en inferencia proviene de las activaciones de los tres flujos de imagen a 480x640.
- VRAM estimada en inferencia end-to-end: del orden de 1 a 3 GB, dependiendo del tamano de lote, del horizonte de chunking y de si los codificadores visuales se ejecutan a resolucion completa.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y 4 GB o mas de memoria es suficiente. Para despliegue en el robot, una plataforma embebida tipo Jetson Orin es adecuada por consumo y tamano; para entrenamiento o evaluacion masiva, RTX 3060/4090, A100 o H100 funcionan pero estan sobredimensionadas para 51,6 M de parametros.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1650 4 GB y superiores), y tambien en CPU para evaluacion offline no acoplada al robot.
- Opciones de despliegue: LeRobot (PyTorch) como ruta principal, dado que el repo usa la estructura `pretrained_model`; el checkpoint no esta en formato GGUF ni es compatible con vLLM, TGI, Ollama ni llama.cpp, que son stacks de modelos de lenguaje y no aplican. La exportacion a ONNX o TensorRT para reducir latencia en el robot es plausible pero no esta documentada en la informacion disponible.
- Latencia y throughput: no disponible. En control robotico la frecuencia de inferencia es critica y depende del hardware de a bordo, del preprocesado de las tres camaras y del horizonte de chunking, ninguno de los cuales se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Datos de rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_r3_27D_60k_s1000 (este) | 51.636.369 | ACT, 11 etapas tarea Mobile AI, 60k pasos, seed 1000 | no disponible | apache-2.0 | HuggingFace, repo de 0,2 GB |
| kiroaiseoul/NAJY_act_all11_hot_27D_120k_s1000 | no disponible | ACT, 11 etapas, 120k pasos, seed 1000; candidato a despliegue segun el autor | cualitativo: mejor semilla offline en etapas de locomocion | no disponible en la informacion recogida | HuggingFace |
| kiroaiseoul/NAJY_act_all11_hot_27D_120k_s2000 | no disponible | ACT, 11 etapas, 120k pasos, seed 2000 | no disponible | no disponible en la informacion recogida | HuggingFace, repo de 207 MB |
| Implementaciones ACT de referencia en LeRobot | variable segun configuracion | ACT generico para manipulacion (p. ej. tareas tipo Aloha) | no disponible | Apache 2.0 en el repositorio LeRobot | HuggingFace / GitHub |

La comparacion es limitada: los tres checkpoints NAJY comparten arquitectura y tarea, y difieren en longitud de entrenamiento (60k frente a 120k pasos), semilla (1000 frente a 2000) y configuracion del manifiesto (`r3_27D` frente a `hot_27D`). No hay metricas publicadas que permitan ordenarlos por rendimiento.

## Limitaciones y advertencias

- Alcance experimental: la propia model card advierte que la subida es para analisis y puntuacion, y que no constituye la confirmacion de un candidato para despliegue en robot real. No deberia tratarse como un modelo validado para produccion.
- Especificidad de tarea y plataforma: la politica esta entrenada para las 11 etapas de la tarea del laboratorio Mobile AI sobre la plataforma Trossen, con un espacio de accion de 17 dimensiones y un espacio de observacion fijo. No generaliza a otros robots, otras camaras ni otras tareas sin reentrenamiento.
- Dependencia del manifiesto: las herramientas de puntuacion leen los flags desde `multi_manifest.json` en la misma carpeta. Mover o renombrar archivos puede romper la evaluacion y la trazabilidad del checkpoint.
- Riesgo de fallo silencioso en control: al ser una politica de imitacion, puede producir acciones plausibles pero incorrectas ante situaciones fuera de la distribucion de entrenamiento. No existe senal de confianza ni mecanismo de abnegacion documentado.
- Riesgo de sobreajuste a la escena: con solo tres camaras y una unica configuracion de laboratorio, cambios de iluminacion, disposicion de objetos o calibracion pueden degradar el rendimiento. El dropout de imagen al 30 % mitiga, pero no elimina, este riesgo.
- Integridad de los pesos: la model card recomienda verificar el hash `e78b5e5c...` con `sha256sum` tras la descarga. Omitir esta comprobacion impide detectar ficheros corruptos o manipulados.
- Idiomas: no aplica, pero conviene senalar que no hay capacidades de procesamiento de lenguaje, por lo que no puede recibir instrucciones en lenguaje natural.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no exime de cumplir las obligaciones de atribucion ni de las condiciones de las licencias de las dependencias (LeRobot y sus componentes).
- Datos no documentados: se desconoce el numero de episodios de entrenamiento, la composicion exacta del dataset, el horizonte de chunking, la configuracion de capas y cualquier metrica de exito. La evaluacion en produccion requiere generarlos.
- Fechas atipicas: los metadatos indican creacion en octubre de 2026, lo que puede deberse a un reloj de sistema incorrecto en el entorno de publicacion y complica la trazabilidad temporal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_r3_27D_60k_s1000
- Checkpoint hermano (120k pasos, seed 1000): https://huggingface.co/kiroaiseoul/NAJY_act_all11_hot_27D_120k_s1000
- Checkpoint hermano (120k pasos, seed 2000, arbol de ficheros): https://huggingface.co/kiroaiseoul/NAJY_act_all11_hot_27D_120k_s2000/tree/main
- Repositorio de simulacion de referencia citado en la model card: `trossen-ai-simulation`, documento `docs/mobile_base_investigation.md` §94 (URL no proporcionada en la informacion disponible)
- LeRobot (libreria y framework de entrenamiento): no se ha proporcionado URL en los resultados de busqueda
- Paper de ACT (Action Chunking with Transformers): no se ha proporcionado URL en los resultados de busqueda
- Otros resultados de busqueda recuperados (documentacion de Kiro, Google Gemini, catalogo de modelos de Essa Mamdani) no son fuentes relevantes para este modelo y se omiten.
