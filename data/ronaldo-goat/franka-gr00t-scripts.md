# Ronaldo-GOAT/franka-gr00t-scripts

## Resumen

Ronaldo-GOAT/franka-gr00t-scripts no es un modelo de pesos, sino un repositorio de codigo (scripts de Python y ficheros de lanzamiento) para el despliegue en robot real, la inferencia de referencia y el posprocesado de datos del modelo GR00T-N1.5 de NVIDIA sobre un rig Franka con efector final (configuracion DROID). Lo publica el usuario Ronaldo-GOAT, sin pipeline declarado, sin licencia explicitada en la ficha y con cero descargas y cero likes en el momento de la consulta.

El repositorio se organiza en cuatro bloques: my_scripts/ (driver principal de despliegue Franka-EEF sin tactil), john_scripts/ (driver de despliegue de john sobre groot_dust con control de posicion articular y recorte de seguridad por posicion medida), default_inference/ (driver base DROID del que se bifurco my_scripts y la referencia upstream de NVIDIA con servicio de inferencia, serve_policy y exportacion ONNX/TensorRT) y lerobot_conversion/ (convertidores de teleoperacion a LeRobot y utilidades de extraccion de video y concatenacion de shards).

Su relevancia es de ingenieria mas que de modelado: aporta codigo de integracion listo para un rig concreto, con control por posicion cartesiana y objetivos absolutos del efector final, ademas de una variante en modo velocidad que el propio autor advierte que deriva con este checkpoint. No incluye pesos ni diferencias de tokens FLARE, que el autor declara explicitamente fuera del alcance del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de codigo; el modelo objetivo del despliegue es GR00T-N1.5 de NVIDIA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha; la referencia de NVIDIA incluida en default_inference/nvidia_mygr00t/ conserva sus cabeceras Apache-2.0 |
| Formato de pesos | no aplica: el repositorio no contiene pesos, solo scripts de Python, ficheros .sh, .txt y documentacion |

Otros datos de la ficha de HuggingFace: ID Ronaldo-GOAT/franka-gr00t-scripts, autor Ronaldo-GOAT, pipeline no disponible, idiomas no disponibles, descargas 0, likes 0, etiqueta region:us. Fechas declaradas: creacion 2026-09-11T15:29:35Z y actualizacion 2026-09-11T15:29:37Z.

## Arquitectura y entrenamiento

No se describe en la informacion disponible ninguna arquitectura propia de red neuronal, ni datos de entrenamiento, ni numero de tokens, ni fases de RLHF/DPO, ni innovaciones de atencion. El repositorio es exclusivamente codigo de despliegue e integracion alrededor de politicas GR00T-N1.5 ya existentes y de checkpoints concretos (se mencionan un checkpoint de posiciones absolutas del efector final y el checkpoint groot_dust).

Estructuralmente, el bloque default_inference/nvidia_mygr00t/ reproduce la referencia upstream de NVIDIA, que incluye un servicio de inferencia (inference_service.py), un script de servicio de politica (serve_policy.py) y un directorio deployment_scripts/ con exportacion e inferencia mediante ONNX y TensorRT. El bloque my_scripts/ anade al driver base control por cartesian_position con objetivos absolutos del efector final, un argumento --task para instruccion no interactiva, un limite de movimiento por paso (--max_trans_per_step) medido contra la posicion real del efector final, retorno a posicion de origen al inicio y al final, y apertura unicamente de las dos camaras indicadas por --left_camera_id y --wrist_camera_id. La variante deploy_franka_eef_velocity.py emplea cartesian_velocity con recorte de accion en [-1, 1], el camino habitual en GR00T/openpi, pero el autor advierte que el checkpoint usado emite posiciones absolutas y que el modo velocidad deriva, por lo que queda solo para observacion. El bloque john_scripts/ usa control de posicion articular con un recorte de seguridad calibrado a partir de datos de bucle cerrado reales.

## Capacidades

- Despliegue en robot real de politicas GR00T-N1.5 sobre un rig Franka con efector final mediante control cartesiano de posicion y objetivos absolutos.
- Ejecucion en bucle cerrado con entrada de dos camaras simultaneas (camara izquierda y camara de muneca) seleccionables por identificador.
- Variante de control en velocidad cartesiana con recorte de accion, con la advertencia de deriva indicada por el autor.
- Inferencia completa en bucle cerrado con robot y camaras simulados (full_inference_mock.py), util para validar la tuberia sin hardware.
- Servicio de politica e inferencia de referencia de NVIDIA, con exportacion y ejecucion mediante ONNX y TensorRT.
- Conversion de datos de teleoperacion al formato LeRobot, con variantes para el rig Franka (posicion articular y posicion cartesiana) y un convertidor de pi0.5.
- Utilidades de posprocesado: extraccion de video (extract_video.py) y concatenacion de shards LeRobot (concat_lerobot_files.py).
- Sin capacidades declaradas de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingueismo, al no tratarse de un modelo de lenguaje publicado.

## Casos de uso

- Despliegue de una politica GR00T-N1.5 en un Franka real: se usaria deploy_franka_eef.py con control cartesiano de posicion, pasando la instruccion de la tarea con --task y fijando --max_trans_per_step para limitar el desplazamiento por paso respecto a la posicion medida del efector final, lo que reduce el riesgo de movimientos bruscos.
- Validacion de la tuberia de inferencia sin robot: full_inference_mock.py permite ejecutar el bucle cerrado completo con robot y camaras simulados, de modo que se puede comprobar el flujo de observaciones, acciones y camaras antes de tocar hardware.
- Depuracion de un checkpoint concreto: la variante en velocidad (deploy_franka_eef_velocity.py) sirve para inspeccionar el comportamiento de un checkpoint de posiciones absolutas bajo el camino estandar de GR00T/openpi, asumiendo que la deriva es esperada y que solo se usa con fines de observacion.
- Adaptacion a otro rig con control articular: la ruta de john_scripts/ muestra como integrar un recorte de seguridad por posicion medida calibrado con datos reales de bucle cerrado, patron reutilizable para otros brazos o configuraciones.
- Exportacion y servicio de politica en produccion: el bloque default_inference/nvidia_mygr00t/ aporta el patron de serve_policy e inference_service junto con exportacion a ONNX y TensorRT, util para servir la politica con menor latencia en un equipo con GPU NVIDIA.
- Preparacion de datasets de robotica: los convertidores de lerobot_conversion/ transforman teleoperacion en bruto a formato LeRobot, tanto en espacio articular como cartesiano, lo que facilita el entrenamiento o la evaluacion posterior de politicas.
- Curacion de grabaciones: extract_video.py y concat_lerobot_files.py permiten extraer video de las grabaciones y unir shards de datos, paso previo habitual antes de subir un dataset o de reentrenar.
- Punto de partida para replicar el despliegue: el repositorio documenta el driver base DROID del que se bifurco my_scripts, lo que permite comparar la version original con la adaptacion al rig Franka sin tactil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de tasa de exito, ni comparativas con otras politicas, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no declara requisitos de memoria ni tamanos de checkpoint.
- GPU recomendadas: no disponible de forma explicita. La ruta de referencia de NVIDIA incluida (deployment_scripts/ con exportacion e inferencia ONNX y TensorRT) apunta a GPUs NVIDIA como plataforma natural, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue documentadas: servicio de inferencia y servicio de politica de NVIDIA (inference_service.py, serve_policy.py), exportacion e inferencia en ONNX y TensorRT, y ejecucion directa del driver de politica en Python sobre el robot.
- Latencia y throughput: no disponible.
- Requisitos no cubiertos: el repositorio asume acceso a un rig Franka con efector final, dos camaras identificables y la pila de control correspondiente; no documenta requisitos de CPU, RAM ni sistema operativo.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ronaldo-GOAT/franka-gr00t-scripts | Repositorio de scripts de despliegue (no contiene pesos) | no disponible | no disponible | no publicado | no disponible en la ficha | HuggingFace, 0 descargas y 0 likes |
| Referencia upstream de NVIDIA (default_inference/nvidia_mygr00t/) | Codigo de servicio y exportacion para politicas GR00T | no disponible | no disponible | no disponible | Apache-2.0 en las cabeceras | Incluida dentro de este repositorio |
| Driver base DROID (default_inference/gr00t_action_quantization/) | Driver de inferencia original del que se bifurco my_scripts | no disponible | no disponible | no disponible | no disponible en la informacion | Incluida dentro de este repositorio |

No se dispone de datos de otros modelos o repositorios comparables externos a la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; las diferencias de pesos y de tokens FLARE quedan explicitamente fuera de su alcance segun el autor.
- La licencia no aparece declarada en la ficha de HuggingFace, lo que impide asumir permisos de uso comercial del conjunto del repositorio; las cabeceras Apache-2.0 solo se indican para la referencia de NVIDIA incluida.
- La variante en modo velocidad (cartesian_velocity) deriva con el checkpoint de posiciones absolutas usado; el autor la marca para observacion y no para operacion.
- El codigo esta ajustado a un rig concreto (Franka con efector final, configuracion DROID, sin tactil) y depende de identificadores de camara y de una pila de control especifica, por lo que la portabilidad a otro hardware requiere adaptacion.
- No se publican resultados de evaluacion, tasas de exito ni comparativas, de modo que no hay evidencia cuantitativa de robustez en produccion.
- Un control de robot real conlleva riesgo fisico: los limites por paso y los recortes de seguridad dependen de una calibracion (en el caso de john_scripts/) obtenida de datos de bucle cerrado reales, y su traslado a otro entorno puede no ser valido.
- No hay datos sobre sesgos, alucinacion o cobertura idiomatica porque no se trata de un modelo de lenguaje.
- La informacion de la ficha es muy escasa (sin pipeline, sin idiomas, sin licencia) y contiene fechas de creacion y actualizacion de 2026, lo que conviene verificar antes de tomarla como referencia.

## Enlaces

- HuggingFace: https://huggingface.co/Ronaldo-GOAT/franka-gr00t-scripts
- No se han encontrado en la busqueda web enlaces relevantes al modelo o al repositorio: los resultados devueltos corresponden a paginas sobre Cristiano Ronaldo (Wikipedia en ingles y frances, Instagram, web oficial y canal de YouTube) y no guardan relacion con este contenido tecnico.
