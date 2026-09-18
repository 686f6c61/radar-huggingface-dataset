# Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_SmolVLA_bs32_step5000

## Resumen

Este repositorio contiene un checkpoint de SmolVLA, un modelo de visión-lenguaje-acción (VLA) orientado a control robótico, publicado por el usuario Dongkkka. Se trata de un ajuste fino específico para la tarea denominada Peanut Pick & Place (recogida y colocación de cacahuetes), entrenado con la librería LeRobot 0.6.1 sobre el dataset `Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern`. No es un modelo de propósito general: es una política de manipulación entrenada para un montaje concreto con tres cámaras (cam_left_head, cam_left_wrist, cam_right_wrist).

El modelo tiene 450.046.176 parámetros (~450 M) en formato safetensors, con un tamaño de repositorio de 1,2 GB. El autor publica únicamente el mejor checkpoint de validación, correspondiente al paso 5000, de un entrenamiento que se detuvo de forma temprana en el paso 45.000 con batch size 32. La pérdida de validación registrada es de 0,1093 y el error absoluto medio (MAE) en lazo abierto sobre episodios reservados (estáticos, izquierda y derecha) es de 0,015023.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de ajuste fino de un VLA compacto sobre un dataset propio de robótica, y como referencia de evaluación en lazo abierto para quien trabaje con SmolVLA y LeRobot. Al no declarar licencia, idiomas ni cuantizaciones, y al acumular cero descargas y cero valoraciones positivas en el momento de la consulta, debe tratarse como un artefacto experimental no validado por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) de la familia SmolVLA; detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (~450 M, dato de safetensors) |
| Parametros activos | No aplica (no se documenta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria de inferencia | LeRobot 0.6.1 |
| Tamano del repositorio | 1,2 GB |
| Camaras de entrada | cam_left_head, cam_left_wrist, cam_right_wrist |
| Dataset de entrenamiento | Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern (revision 05286a17a145234ed80870702f4d9757f00194c3) |
| Batch size | 32 |
| Paso del checkpoint | 5000 (mejor validacion) |
| Paso de finalizacion | 45000 (parada temprana, early stopped: true) |
| Perdida de validacion | 0,1093 |
| MAE en lazo abierto (tarea 4) | 0,015023 |

## Arquitectura y entrenamiento

SmolVLA es una familia de politicas VLA compactas que combinan un codificador visual, un modelo de lenguaje pequeno y un modulo de generacion de acciones. El rasgo distintivo de la familia es su tamano reducido (~450 M de parametros) frente a alternativas de miles de millones, lo que permite inferencia en hardware de consumo. La informacion aportada no detalla la composicion de capas, el numero de tokens de entrenamiento, la mezcla de datos ni si se aplicaron tecnicas de RLHF o DPO; por tanto, esos aspectos quedan como no disponibles en esta ficha.

Lo que si esta documentado es el proceso de ajuste fino de este checkpoint concreto: se partio de un modelo SmolVLA y se entreno sobre el dataset indicado con LeRobot 0.6.1, batch size 32, usando tres flujos de camara como entrada. El entrenamiento alcanzo el paso 45.000 con parada temprana, pero el autor publica el checkpoint del paso 5000 por ser el de mejor perdida de validacion (0,1093). El repositorio excluye explicitamente estados de optimizador y checkpoints intermedios: contiene solo el checkpoint seleccionado para inferencia, lo que explica que ocupe 1,2 GB. No se documenta ninguna innovacion tecnica propia anadida por el autor mas alla del ajuste fino.

## Capacidades

- Generacion de acciones de manipulacion robótica: produce comandos motores a partir de observaciones visuales de tres camaras y de la tarea objetivo, segun el pipeline `robotics` de LeRobot.
- Ejecucion de una tarea concreta de pick & place: recogida y colocacion de cacahuetes (Peanut Pick & Place), definida en el dataset de origen.
- Inferencia en lazo abierto evaluable: el autor reporta MAE de 0,015023 sobre episodios reservados estaticos, izquierda y derecha, lo que permite medir desviacion respecto a las acciones de referencia.
- Compatibilidad con el ecosistema LeRobot: el checkpoint esta preparado para los scripts de evaluacion e inferencia de LeRobot 0.6.1.
- Vision multi-camara: consume simultaneamente una vista de cabeza (cam_left_head) y dos vistas de muneca (cam_left_wrist, cam_right_wrist).
- Reajuste posterior: al ser un checkpoint en safetensors sobre LeRobot, es reutilizable como punto de partida para ajustes finos en tareas similares.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, audio, vision general): no disponibles.

## Casos de uso

- Reproduccion de la tarea Peanut Pick & Place: cargar el checkpoint en LeRobot 0.6.1 y ejecutar la politica sobre el mismo montaje de camaras y robot para el que fue entrenado, aprovechando que el autor declara el mejor checkpoint de validacion.
- Banco de pruebas de evaluacion en lazo abierto: usar el MAE de 0,015023 sobre episodios reservados como linea base para comparar nuevas versiones del mismo ajuste, midiendo si un cambio en datos o hiperparametros mejora la desviacion de acciones.
- Punto de partida para ajuste fino en tareas de recogida similares: reentrenar sobre un dataset propio con objetos, alturas o posiciones distintas, partiendo de un modelo ya especializado en manipulacion fina en lugar de la base generalista.
- Investigacion en destilacion y compresion de politicas VLA: al ser un modelo de 450 M de parametros, es un candidato manejable para estudiar cuantizacion o destilacion desde politicas mayores.
- Validacion de pipelines de datos de robotica: comprobar que un dataset grabado con LeRobot (episodios, camaras, frecuencia de control) es coherente con lo que espera SmolVLA, usando este checkpoint como referencia funcional.
- Demostraciones docentes en robotica: ilustrar en un aula o laboratorio el ciclo completo de captura de datos, entrenamiento de una politica VLA y evaluacion con una metrica objetiva, con un coste computacional bajo.
- Automatizacion de clasificacion y colocacion de piezas pequenas: en entornos controlados y con el mismo tipo de objeto, emplear la politica para tareas repetitivas de pick & place, siempre con supervision y parada de emergencia.
- Comparacion de estrategias de parada temprana: el contraste entre el mejor paso (5000) y la finalizacion (45000) permite analizar sobreajuste y politicas de seleccion de checkpoint en entrenamientos de robotica.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida de validacion | 0,1093 | Mejor checkpoint, paso 5000 |
| MAE en lazo abierto (media) | 0,015023 | Tarea 4, episodios reservados estaticos/izquierda/derecha |
| MMLU, HumanEval, GSM8K y similares | No disponibles | No aplicables a una politica VLA de control motor |
| Comparativas publicas frente a otras politicas | No disponibles | No se han publicado en la informacion proporcionada |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los pesos de 450 M de parametros ocupan aproximadamente 0,9 GB; con activaciones de vision y buffers de accion, una estimacion prudente es de 2 a 4 GB de VRAM. En fp32 serian unos 1,8 GB solo de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente por capacidad de modelo; una RTX 3060 12 GB, RTX 4060, RTX 4090 o una A100/H100 quedan holgadamente por encima del requisito.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna y en placas integradas tipo Jetson Orin, aunque el rendimiento de control dependera mas de la latencia del bucle de robotica y de la captura de camaras que de la GPU.
- Opciones de despliegue: los scripts de inferencia y evaluacion de LeRobot 0.6.1. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni exportacion a TensorRT u ONNX en la informacion disponible.
- Latencia y throughput: no disponibles. No se aportan mediciones de frecuencia de inferencia ni de tiempo por accion para este checkpoint.
- Almacenamiento: 1,2 GB de repositorio, mas el espacio del dataset de origen si se quiere reevaluar.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Dongkkka) | ~450 M | VLA ajustado a una tarea | No disponible | No disponible | Hugging Face, 0 descargas |
| SmolVLA base | ~450 M (misma familia) | VLA generalista preentrenado | No disponible | No verificada en la informacion disponible | Hugging Face |
| OpenVLA | ~7 B | VLA de proposito general | No disponible | No verificada en la informacion disponible | Hugging Face |
| pi0 / pi0.5 | Orden de miles de millones | VLA con flow matching | No disponible | No verificada en la informacion disponible | Publicacion y pesos parcialmente abiertos |

Nota: los datos de modelos distintos de este checkpoint provienen de conocimiento publico general sobre la familia SmolVLA y otras politicas VLA, no de la informacion aportada en esta consulta; los campos marcados como no verificados deberian confirmarse en las fichas oficiales antes de tomar decisiones. La diferencia fundamental de este repositorio frente a los anteriores es que no es un modelo generalista, sino un ajuste fino de tarea unica con metricas de validacion concretas.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para una unica tarea (Peanut Pick & Place) con un montaje de camaras y un robot concretos. Fuera de esa configuracion su comportamiento no esta caracterizado.
- Senales de sobreajuste: el mejor checkpoint es el paso 5000 de un entrenamiento que llego al 45.000, una diferencia de 40.000 pasos que sugiere que el modelo dejo de mejorar muy pronto o que la validacion se estanco.
- Metrica limitada: el 0,015023 de MAE es una evaluacion en lazo abierto, que mide desviacion respecto a acciones de referencia y no exito real de la tarea en el robot. No se reporta tasa de exito en lazo cerrado.
- Riesgo de alucinacion de acciones: como toda politica de control, puede generar comandos plausibles pero incorrectos ante observaciones fuera de distribucion (iluminacion distinta, objeto desplazado, oclusiones), con riesgo fisico asociado.
- Sesgos: no se documenta composicion del dataset, diversidad de escenas ni posibles sesgos de posicion o apariencia del objeto; no se pueden evaluar.
- Licencia no declarada: al no especificarse licencia, el uso comercial queda en una zona legal indeterminada. Debe aclararse con el autor antes de cualquier despliegue productivo.
- Idiomas: no disponibles; no hay evidencia de que acepte instrucciones en castellano ni en ningun otro idioma concreto.
- Sin validacion externa: cero descargas y cero valoraciones en el momento de la consulta; no hay terceros que hayan reproducido los resultados.
- Documentacion incompleta: no hay contexto maximo, cuantizaciones soportadas, requisitos de hardware ni guia de seguridad. Cualquier uso en un robot real exige limites de par, parada de emergencia y supervision humana.
- Fecha de creacion futura en los metadatos (2026-09-18), lo que indica que la ficha y sus campos deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern_SmolVLA_bs32_step5000
- Dataset de entrenamiento: https://huggingface.co/datasets/Dongkkka/Task_000004_Peanut_Pick_Place_lerobot_Intern
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados correspondian a paginas de soporte de Microsoft sin relacion con el contenido de esta ficha.
