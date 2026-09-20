# NaaaaaiVe6/franka-30demos-normal_task13_cartesian_20260911T023711Z-step-10000

## Resumen

Este repositorio contiene un checkpoint de politica robotica entrenado para un brazo Franka, publicado por el usuario NaaaaaiVe6 bajo la familia openpi y la etiqueta pi05. No es un modelo de lenguaje: es un modelo vision-lenguaje-accion (VLA) orientado al control de manipuladores, con 3.616.757.520 parametros (unos 3,6 mil millones) almacenados en safetensors, un tamano de repositorio de 7,2 GB y salida de acciones en representacion cartesiana absoluta. El checkpoint corresponde al paso 10000 de entrenamiento y fue convertido de JAX a PyTorch en bfloat16 manteniendo la configuracion original del modelo Franka.

Su relevancia es practica para investigacion en robotica: proporciona una politica entrenada con 30 demostraciones sobre una tarea concreta (task13) y una convencion de acciones cartesianas explicitamente documentada, lo que permite reproducir el pipeline de inferencia con la libreria openpi. La representacion de acciones es XYZ cartesiano absoluto mas cuaternion xyzw mas pinza binaria (-1/+1); el autor advierte de que no son acciones delta del controlador, un detalle critico para integrarlo con un controlador real.

La ficha disponible es muy escasa: no se declaran licencia, idiomas, benchmarks ni detalles del dataset de entrenamiento, y el autor remite a un archivo `log.txt` del repositorio para el layout de salida, el limite de normalizacion, las entradas de camara y estado y las convenciones del controlador que quedan pendientes de confirmacion. Las descargas y likes son cero en el momento de la consulta, y la busqueda web no ha devuelto ningun enlace relevante al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) de la familia openpi / pi05; convertida de JAX a PyTorch bfloat16 con la configuracion original del modelo Franka. Detalle interno de capas no disponible |
| Parametros totales | 3.616.757.520 (segun safetensors) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en bfloat16 (safetensors). No se documentan otras cuantizaciones (int8, int4, GGUF) |
| Idiomas soportados | No disponible (modelo de accion robotica; el componente de lenguaje no se documenta) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (repo de 7,2 GB), cargable con la libreria openpi |
| Dimension de salida de acciones | 50 pasos y 32 coordenadas; solo las 8 primeras coordenadas corresponden a acciones del robot |
| Representacion de acciones | XYZ cartesiano absoluto + cuaternion xyzw + pinza binaria (-1/+1); no son acciones delta del controlador |
| Normalizacion | Requiere `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes |
| Entradas | Camaras y estado del robot (detalle en `log.txt` del repositorio) |
| Pipeline declarado | robotics |
| Etiquetas | openpi, safetensors, robotics, pi05, region:us |

## Arquitectura y entrenamiento

La model card indica que el checkpoint se obtuvo convirtiendo un modelo entrenado en JAX a PyTorch en bfloat16, conservando la configuracion del modelo Franka utilizada en el entrenamiento original. La etiqueta `pi05` y la libreria `openpi` lo situan en la familia de politicas VLA de openpi, que combinan un codificador visual, un componente de lenguaje y un modulo de generacion de acciones; sin embargo, la informacion proporcionada no detalla el numero de capas, el mecanismo de atencion, el tipo de cabecera de acciones (por ejemplo, flow matching frente a regresion directa) ni la composicion exacta del backbone.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, la resolucion de las camaras, la frecuencia de control objetivo ni si hubo etapas de ajuste tipo RLHF, DPO o fine-tuning por imitacion mas alla de las 30 demostraciones mencionadas en el nombre del repositorio. Lo unico verificable sobre el entrenamiento es el punto de control (paso 10000) y que la politica se entreno con acciones absolutas en espacio cartesiano, lo que implica un mapeo directo entre la observacion y la pose del efector final.

La innovacion destacable, y a la vez el principal riesgo de integracion, es la convencion de acciones: 50 pasos de prediccion con 32 coordenadas, de las cuales solo las 8 primeras son acciones del robot. El resto de coordenadas no se describe en la model card. El autor remite explicitamente a `log.txt` para el layout de salida y las convenciones del controlador que todavia requieren confirmacion.

## Capacidades

- Generacion de secuencias de accion para un brazo Franka en espacio cartesiano absoluto (XYZ + cuaternion xyzw + pinza binaria).
- Prediccion de horizontes de 50 pasos con 32 coordenadas de salida, de las que las 8 primeras son las acciones efectivas del robot.
- Control de pinza binaria con valores -1/+1.
- Consumo de observaciones multimodales: imagenes de camara y estado del robot, segun lo indicado en `log.txt`.
- Ejecucion de una tarea especifica de manipulacion (task13) aprendida a partir de 30 demostraciones, en el punto de entrenamiento 10000.
- Integracion con el ecosistema openpi mediante la libreria homonima y los pesos en safetensors.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento. No hay informacion sobre capacidades multilingues.
- No se documentan capacidades de generalizacion a otras tareas, otros robots o nuevos objetos mas alla de lo implicito en el entrenamiento de la tarea concreta.

## Casos de uso

- Investigacion en politicas VLA: usar el checkpoint como punto de partida reproducible para estudiar el comportamiento de un modelo pi05 entrenado con pocas demostraciones, cargandolo con openpi y comparando variantes de inferencia.
- Manipulacion de sobremesa con Franka: ejecutar la tarea task13 en un banco de laboratorio, enviando poses cartesianas absolutas del efector final y comandos de pinza al controlador del robot.
- Evaluacion de conversion JAX a PyTorch: verificar que la inferencia en bfloat16 reproduce las salidas del modelo original en JAX, util para equipos que migran pipelines de entrenamiento a PyTorch.
- Reentrenamiento o fine-tuning posterior: partir del paso 10000 y continuar el entrenamiento con nuevas demostraciones de la misma tarea, reutilizando `norm_stats.json` y las transformaciones originales.
- Validacion de convenciones de controlador: emplear el modelo para contrastar si un controlador concreto acepta poses absolutas o requiere acciones delta, uno de los puntos que la model card deja pendiente de confirmacion.
- Docencia y prototipado en robotica: demostrar un pipeline completo de vision-lenguaje-accion con pesos abiertos, sin depender de modelos propietarios, en asignaturas o talleres de manipulacion robotica.
- Pruebas de sim-a-real: ejecutar la politica primero en simulador con la misma interfaz de observaciones y acciones cartesianas antes de desplegarla en el Franka fisico.
- Recogida de datos comparativa: usar las predicciones del modelo como referencia para comparar con las trayectorias humanas de las 30 demostraciones y detectar desviaciones del comportamiento esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion, ni metricas de simulacion o de robot real, y la busqueda web no ha devuelto ningun resultado relacionado con el modelo.

## Requisitos de hardware

- Peso de los parametros: 3.616.757.520 parametros en bfloat16 equivalen a unos 7,2 GB, coherente con el tamano del repositorio.
- VRAM estimada para inferencia: alrededor de 8-10 GB solo para pesos y estados; con activaciones del codificador visual y buffers de atencion, es razonable reservar 12-16 GB. No hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con 16 GB o mas de VRAM. Cabe en RTX 4090 y RTX 3090 (24 GB), A100 (40/80 GB) y H100 (80 GB).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y modelos con al menos 16 GB. En GPUs de 8-12 GB probablemente requiera cuantizacion, que no esta documentada.
- Opciones de despliegue: la libreria openpi (referenciada como `library_name` del repositorio) es la via documentada. vLLM, llama.cpp, Ollama o TGI no son aplicables a un modelo de accion robotica sin una conversion adicional no descrita.
- Dependencias de ejecucion: el archivo `assets/franka/norm_stats.json` es obligatorio para la normalizacion, junto con las transformaciones de entrenamiento originales.
- Latencia y throughput: no disponibles. Dependen en gran medida del controlador del robot y del bucle de control, no solo de la GPU.
- Almacenamiento: 7,2 GB para el repositorio completo, mas el espacio de las dependencias de openpi y de los datos de camara en tiempo real.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados comparativos. La tabla siguiente recoge solo lo verificable del modelo evaluado; los datos de las alternativas se marcan como no disponibles y deben confirmarse en sus fuentes originales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05, Franka cartesiano, paso 10000) | 3.616.757.520 | No disponible | Manipulacion Franka, acciones cartesianas absolutas | No disponible | Hugging Face, via openpi |
| openpi pi05 (modelo base de la familia) | No disponible en la informacion proporcionada | No disponible | VLA para robotica | No disponible | Repositorio openpi |
| Otras politicas VLA abiertas (por ejemplo, familias tipo OpenVLA o RDT) | No disponible en la informacion proporcionada | No disponible | Manipulacion robotica | No disponible | No verificado en esta busqueda |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse, el uso comercial queda en un limbo legal y no puede asumirse permisivo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de exito ni de robustez de la politica.
- Checkpoint intermedio: el paso 10000 puede corresponder a un modelo no convergido; no hay informacion sobre la curva de entrenamiento ni sobre si existen checkpoints posteriores.
- Entrenamiento con solo 30 demostraciones: la generalizacion a objetos, posiciones, iluminacion o configuraciones de camara distintas de las del dataset es previsiblemente baja.
- Representacion de acciones absolutas: no son acciones delta del controlador, por lo que enviarlas a un controlador que espere incrementos puede provocar movimientos bruscos o inestabilidad.
- Ambiguedad en la salida: de las 32 coordenadas de salida solo 8 son acciones del robot; interpretar mal el layout puede derivar en comandos invalidos. El autor remite a `log.txt` para el formato exacto.
- Dependencia de la normalizacion: omitir `assets/franka/norm_stats.json` o usar transformaciones distintas invalida las predicciones.
- Convenciones del controlador pendientes de confirmacion, segun la propia model card.
- Sin informacion sobre sesgos: no se documentan sesgos del componente de lenguaje ni del dataset de demostraciones.
- Riesgo de alucinacion aplicado a robotica: la politica puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribucion, con riesgo fisico asociado.
- Plataforma unica: no se documenta soporte para otros brazos robotico ni para otras tareas.
- Idiomas no disponibles: no se puede evaluar el comportamiento del componente de lenguaje en castellano ni en ningun otro idioma.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task13_cartesian_20260911T023711Z-step-10000
- Archivo de registro de convenciones: `log.txt` dentro del repositorio del modelo
- Estadisticas de normalizacion: `assets/franka/norm_stats.json` dentro del repositorio del modelo
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
