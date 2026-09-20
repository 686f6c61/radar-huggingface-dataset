# NaaaaaiVe6/franka-10demos-normal_task13_cartesian_20260913T212156Z-step-10000

## Resumen

Este repositorio contiene un checkpoint de un modelo de vision-lenguaje-accion (VLA) especializado en control robotico del brazo Franka, entrenado con la libreria openpi y la arquitectura pi05. Se trata de un ajuste fino derivado de la familia pi05 (asociada a Physical Intelligence y distribuida como codigo abierto en openpi), orientado a ejecutar una tarea concreta (identificada como "task13") a partir de diez demostraciones ("10demos"). El checkpoint corresponde al paso 10.000 de entrenamiento y su representacion de acciones es cartesiana absoluta, no deltas del controlador.

El modelo tiene 3.616.757.520 parametros (aproximadamente 3,6 mil millones) almacenados en safetensors y convertidos de JAX a PyTorch en bfloat16. La salida del modelo genera un trozo de acciones ("action chunk") de 50 pasos y 32 coordenadas, de las cuales solo las ocho primeras corresponden a acciones reales del robot: posicion XYZ absoluta, cuaternion xyzw y senal binaria de pinza (-1/+1). El resto de coordenadas forma parte del formato interno del modelo y no debe interpretarse como acciones.

Su relevancia es acotada pero util: es un ejemplo reproducible de como se publica un ajuste fino de pi05 sobre un unico brazo Franka con muy pocas demostraciones, lo que sirve como referencia practica para quien quiera replicar pipelines de imitacion en robotica con openpi. No es un modelo de proposito general ni un modelo de lenguaje: es un controlador de politica ("policy") ligado a la configuracion de entrenamiento original y a las estadisticas de normalizacion incluidas en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-lenguaje-accion (VLA) pi05 sobre openpi; no se detalla la composicion interna en la model card |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors (convertidos de JAX a PyTorch en bfloat16) |
| Libreria | openpi |
| Salida de acciones | 50 pasos x 32 coordenadas; las 8 primeras son acciones del robot (XYZ absoluto + cuaternion xyzw + pinza binaria -1/+1) |
| Tamano del repositorio | 7,2 GB |
| Paso de entrenamiento | 10.000 |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

La model card describe el modelo como un checkpoint pi05 dentro del ecosistema openpi, etiquetado con los tags `robotics` y `pi05`. El autor indica que el modelo fue convertido de JAX a PyTorch bfloat16 conservando la configuracion original de entrenamiento para Franka. No se aportan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por imitacion supervisado mas alla de las diez demostraciones mencionadas en el nombre del repositorio.

El aspecto tecnico mas relevante que si se documenta es el formato de accion: representacion cartesiana absoluta (XYZ mas cuaternion xyzw mas pinza binaria), explicitamente distinta de las acciones delta de controlador. El modelo emite un horizonte de 50 pasos con 32 coordenadas, donde solo las ocho primeras son acciones validas del robot. La model card remite a `log.txt` para el layout de salida, la frontera de normalizacion, las entradas de camara y estado, y las convenciones del controlador que quedan pendientes de confirmar, e indica que debe usarse el fichero `assets/franka/norm_stats.json` junto con las transformaciones de entrenamiento correspondientes. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones de control para un brazo Franka en espacio cartesiano absoluto (XYZ, cuaternion xyzw, pinza binaria).
- Ejecucion de una tarea especifica adquirida a partir de diez demostraciones (identificada como "task13").
- Prediccion de trozos de accion de 50 pasos con 32 coordenadas, de las que 8 son acciones utilizables.
- Consumo de entradas multimodales de robot: la model card menciona entradas de camara y de estado, aunque no detalla el numero ni la resolucion.
- Conversion JAX a PyTorch ya realizada, lo que facilita su carga en entornos PyTorch.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de politica robotica, no un asistente conversacional.
- No se documentan modos especiales (thinking mode, vision general, audio) mas alla del uso previsto como politica VLA.

## Casos de uso

- Replicacion de experimentos de imitacion con pocas demostraciones: el checkpoint permite reproducir el resultado de entrenar pi05 con diez demostraciones sobre un Franka y comparar el paso 10.000 con otros checkpoints intermedios.
- Evaluacion de representaciones cartesianas absolutas frente a deltas de controlador: dado que la model card insiste en que no son acciones delta, sirve como caso de estudio para medir estabilidad y precision en control cartesiano.
- Benchmark interno de pipelines openpi: al estar ya convertido a PyTorch bfloat16, puede integrarse en pruebas de carga, latencia y compatibilidad dentro de una infraestructura openpi existente.
- Control de un brazo Franka en laboratorio para una tarea concreta de manipulacion, siempre que se reutilicen las estadisticas de normalizacion (`assets/franka/norm_stats.json`) y las transformaciones de entrenamiento originales.
- Estudio de robustez ante variaciones de camara o estado: al depender estrictamente de las entradas y convenciones de entrenamiento, es util para analizar la sensibilidad del modelo a cambios en la percepcion.
- Base para ajuste posterior ("fine-tuning") de una tarea nueva: el checkpoint puede servir como punto de partida para reentrenar con mas demostraciones o con otra tarea, aprovechando la inicializacion pi05.
- Auditoria de formato de salida en robotica: el layout de 50 x 32 con solo 8 acciones validas es un ejemplo tipico de trampa de integracion, util para validar codigo de parseo en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion, ni comparaciones cuantitativas con otros checkpoints o modelos.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: los 3.616.757.520 parametros ocupan aproximadamente 7,2 GB solo en pesos; sumando activaciones y buffers de inferencia conviene reservar del orden de 12-16 GB, aunque no hay medicion oficial publicada.
- GPU profesionales: A100, H100 y L40S son opciones sobradas para el tamano del modelo; no se documenta ninguna configuracion de referencia.
- GPU de consumo: cabe previsiblemente en una RTX 4090 (24 GB) e incluso en tarjetas de 16 GB si el runtime lo permite; no hay confirmacion del autor ni cifras de latencia.
- Opciones de despliegue: la libreria declarada es openpi; al distribuirse pesos PyTorch en safetensors, es integrable en runtimes PyTorch, pero no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son runtimes de modelos de lenguaje y no aplican directamente a un controlador VLA con salida de acciones).
- Latencia y throughput: no disponibles. Al tratarse de un controlador que predice trozos de 50 pasos, la latencia de inferencia es critica para el bucle de control, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (franka-10demos, task13, step 10000) | 3,62 B | VLA pi05 ajustado a Franka | no disponible | no disponible | HuggingFace, safetensors |
| pi05 base (openpi) | no disponible en esta busqueda | VLA pi05 | no disponible | no disponible | repositorio openpi |
| Otros ajustes de openpi para Franka | no disponible | VLA pi05 | no disponible | no disponible | HuggingFace |
| OpenVLA | 7 B (referencia general) | VLA sobre VLM | no disponible | no disponible | publico |

No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. Cualquier cifra de rendimiento relativo requeriria una evaluacion propia en el mismo banco de tareas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse con diez demostraciones de una unica tarea y un unico montaje, el modelo hereda los sesgos de esa recogida (posiciones, iluminacion, disposicion de camaras, estilo de demostracion).
- Riesgo de generalizacion nula fuera de la tarea: un ajuste con diez demostraciones produce una politica muy especializada; no debe esperarse transferencia a otras tareas, objetos o brazos.
- Ambiguedad en el formato de salida: se emiten 32 coordenadas por paso, pero solo 8 son acciones validas. Interpretar las 24 restantes como senales de control es un error de integracion probable.
- Dependencia estricta de la normalizacion: es obligatorio usar `assets/franka/norm_stats.json` y las transformaciones de entrenamiento originales; omitirlos invalida las predicciones.
- Convenciones del controlador pendientes de confirmar: la propia model card remite a `log.txt` y admite que hay convenciones sin verificar, lo que supone un riesgo para despliegue en hardware real.
- Licencia no disponible: sin una licencia explicita no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Conviene contactar con el autor antes de cualquier uso productivo.
- Idiomas no disponibles: no se especifica ningun idioma de instrucciones ni capacidad multilingue.
- Sin benchmarks ni validacion publicada: no hay evidencia cuantitativa de tasa de exito, por lo que no es apto como componente de un sistema en produccion sin evaluacion previa.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.
- Fecha de creacion inusualmente futura (2026-09-19) respecto al identificador del checkpoint (20260913), lo que puede indicar un entorno de entrenamiento con relojes desincronizados o un artefacto de nombrado automatico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task13_cartesian_20260913T212156Z-step-10000
- Fichero de estadisticas de normalizacion citado en la model card: `assets/franka/norm_stats.json` (dentro del repositorio)
- Fichero de registro citado en la model card: `log.txt` (dentro del repositorio)
- Libreria openpi: no se proporciona URL en la informacion disponible
- Paper, blog o demo asociados: no disponibles en la informacion proporcionada
