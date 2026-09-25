# rookierufus/sarm-wire-brown

## Resumen

`rookierufus/sarm-wire-brown` es un modelo de recompensa (reward model) entrenado con la libreria LeRobot bajo la modalidad SARM (`annotation_mode=dual`) sobre demostraciones de manipulacion bimanual con el brazo SO-101. El modelo se publica como un checkpoint de reinforcement-learning cuyo objetivo es puntuar el progreso de una politica o de una trayectoria, no generar texto ni acciones directamente. Su entrenamiento se realizo exclusivamente con la camara cenital (`observation.images.left_top`), es decir, con una unica vista aerea del entorno de trabajo.

El checkpoint corresponde al paso 2500 de entrenamiento con un tamano de lote de 128, y el repositorio ocupa aproximadamente 0,5 GB. El dato real de parametros extraido del fichero safetensors es de 119.180.551 parametros, lo que situa al modelo en la franja de los 119 millones, un orden de magnitud propio de una columna visual con dos cabezas de prediccion y perfectamente asumible en hardware de consumo.

La relevancia de esta publicacion es acotada y muy especifica: no es un modelo de proposito general, sino un artefacto de investigacion ligado a un montaje concreto (SO-101 bimanual, tarea de manipular un cable marron) y a la version del pipeline de LeRobot disponible en la fecha de creacion (25 de septiembre de 2026). Resulta util para quien quiera reproducir o continuar un flujo de RL basado en recompensa aprendida con LeRobot, y mucho menos util fuera de ese contexto. No se declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de recompensa con dos cabezas (dual-head) sobre columna visual; entrenado con LeRobot SARM. Detalle interno no disponible en la model card |
| Parametros totales | 119.180.551 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre observaciones) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors, sin variantes cuantizadas |
| Idiomas soportados | No disponible (modelo no linguistico) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Tarea declarada | `reinforcement-learning` |
| Modalidad de anotacion | `dual` (SARM dual-head) |
| Entrada visual | Camara cenital, clave `observation.images.left_top` |
| Checkpoint final | Paso 2500, lote 128 |
| Tamano del repositorio | 0,5 GB |
| Etiquetas | `sarm`, `reward-model`, `so101`, `lerobot`, `region:us` |

## Arquitectura y entrenamiento

La model card no detalla la topologia interna. Lo que se puede afirmar con los datos disponibles es que se trata de un modelo de recompensa con dos cabezas, entrenado mediante la implementacion SARM de LeRobot con `annotation_mode=dual`, sobre demostraciones bimanuales del robot SO-101. La entrada se limita a la vista de camara cenital etiquetada como `observation.images.left_top`, lo que implica que el modelo no consume imagenes de muneca ni estado proprioceptivo adicional, al menos segun la configuracion declarada. El entrenamiento alcanzo los 2500 pasos con lotes de 128, y ese checkpoint es el que se publica como version final.

Conviene no confundir el acronimo. Existe un trabajo academico titulado "Interpretable Reward Model via Sparse Autoencoder", aceptado como oral en AAAI 2026, que tambien usa la sigla SARM, pero la model card de este repositorio no cita ese articulo ni describe un autoencoder disperso. Por tanto, la relacion entre ambos no esta confirmada y no debe asumirse. Tampoco se documentan en la informacion disponible el numero de tokens o transiciones de entrenamiento, la composicion exacta del dataset, ni el uso de RLHF, DPO u otras tecnicas de alineacion, que en un modelo de recompensa robótico no serian de aplicacion directa.

## Capacidades

- Estimacion de recompensa por etapa y progreso (stage-and-progress) sobre trayectorias de manipulacion bimanual.
- Procesamiento de observaciones visuales provenientes de una camara cenital (`observation.images.left_top`).
- Salida dual: dos cabezas de prediccion, presumiblemente orientadas a distinguir etapa de la tarea y grado de avance dentro de ella.
- Integracion nativa con el ecosistema LeRobot para entrenamiento de politicas por refuerzo con recompensa aprendida.
- Uso como funcion de recompensa en bucles de RL o como criterio de filtrado y puntuacion de demostraciones.
- No dispone de generacion de texto, razonamiento linguistico, codigo ni matematicas: no es un LLM.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta capacidad multilingue ni multimodalidad mas alla de la vision ya descrita.

## Casos de uso

- Entrenamiento por refuerzo de una politica bimanual SO-101: el modelo actua como funcion de recompensa densa, puntuando cada transicion o fragmento de trayectoria y permitiendo optimizar la politica sin definir a mano una funcion de recompensa especifica de la tarea.
- Etiquetado automatico de progreso en demostraciones: dado un conjunto de episodios grabados con camara cenital, el modelo asigna puntuaciones de avance que permiten segmentar las trayectorias en etapas sin anotacion manual.
- Filtrado de calidad de datos antes del entrenamiento: las trayectorias con puntuacion baja o incoherente pueden descartarse, reduciendo ruido en el dataset de imitacion o de RL.
- Evaluacion comparativa de politicas: usar la recompensa media por episodio como metrica objetiva para seleccionar entre dos checkpoints de politica entrenados sobre la misma tarea.
- Recompensa intermedia en aprendizaje por refuerzo con recompensa escasa: al estimar progreso por etapas, mitiga el problema de la recompensa solo al final del episodio, acelerando la convergencia en tareas largas de manipulacion.
- Reproduccion de un pipeline SARM completo: sirve como referencia de checkpoint final (paso 2500, lote 128) para comparar configuraciones de entrenamiento dentro de LeRobot.
- Investigacion en modelos de recompensa visuales: al ser pequeno (119 M de parametros) y de una sola vista, es un banco de pruebas economico para estudiar generalizacion entre tareas, camaras o morfologias de robot.
- Seleccion de acciones en tiempo de inferencia (best-of-n): muestrear varias trayectorias candidatas y quedarse con la mejor puntuada por el modelo, siempre que la latencia del modelo lo permita en el bucle de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, correlacion con recompensa humana, ni comparaciones cuantitativas con otras funciones de recompensa. Tampoco se aportan curvas de entrenamiento ni metricas de validacion del checkpoint del paso 2500.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,48 GB en fp32 y 0,24 GB en fp16/bf16, calculado a partir de los 119.180.551 parametros. El repositorio completo ocupa 0,5 GB.
- VRAM total recomendada: 2-4 GB contando pesos, activaciones del codificador visual y buffers de inferencia. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 son mas que suficientes y dejaran la GPU infrautilizada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos ocho anos, e incluso en CPU para inferencia por lotes pequenos.
- Aceleradores de datacenter (A100, H100): no son necesarios para inferencia; solo tendrian sentido si se usa el modelo como parte de un pipeline masivo de puntuacion de datos junto a otros componentes.
- Opciones de despliegue: la libreria `lerobot` sobre PyTorch es la via documentada. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje. Para reducir latencia cabria exportar a ONNX o TensorRT, aunque no se documenta ninguna exportacion oficial.
- Latencia y throughput: no disponible. Dependen del codificador visual, de la resolucion de entrada y del hardware, ninguno de los cuales se especifica.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de recompensa de LeRobot ni variantes SARM con las que comparar parametros, contexto, rendimiento o licencia. Como referencia de categoria, cabe senalar que existen funciones de recompensa aprendidas de uso comun en robotica (por ejemplo, clasificadores de exito o modelos de recompensa basados en representaciones visuales), pero no se dispone de datos verificables de sus especificaciones en esta busqueda, por lo que cualquier tabla comparativa seria inventada.

## Limitaciones y advertencias

- Especificidad extrema: entrenado para una tarea y un montaje concretos (cable marron, SO-101 bimanual, camara cenital `left_top`). La transferencia a otras tareas, objetos o disposiciones de camara no esta demostrada y probablemente sea pobre.
- Dependencia de una unica vista: al usar solo la camara cenital, pierde informacion de profundidad y de oclusiones que otras vistas resolverian; cualquier cambio de iluminacion o de posicion de camara degradara las puntuaciones.
- Sin licencia declarada: la ausencia de licencia implica que no se conceden derechos de uso, modificacion ni redistribucion de forma explicita. No debe asumirse uso comercial permitido.
- Sin datos de rendimiento: no hay benchmarks, tasas de exito ni validacion cruzada que respalden la calidad de las recompensas. Usarlo en produccion sin evaluacion propia es arriesgado.
- Riesgo de recompensa mal especificada (reward hacking): como todo modelo de recompensa aprendido, una politica optimizada contra el puede explotar sesgos del modelo en lugar de resolver la tarea; se recomienda monitorizacion con metricas externas.
- Riesgo de sobreajuste al dataset de demostraciones: 2500 pasos sobre un unico conjunto bimanual y una sola camara favorecen el ajuste a las condiciones exactas de recogida.
- Sesgos de datos: no se documenta la diversidad de demostraciones (operadores, posiciones iniciales, variaciones de objeto), por lo que se desconoce el sesgo sistematico hacia determinadas trayectorias.
- Alcance nulo fuera de la robotica: no debe evaluarse como modelo de lenguaje ni esperarse de el capacidades de texto, codigo o razonamiento.
- Reproducibilidad: se desconoce la version exacta de LeRobot, el commit y los hiperparametros completos, lo que dificulta replicar el entrenamiento.
- Madurez: cero descargas y cero interacciones en el momento de la ficha, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rookierufus/sarm-wire-brown
- Perfil del autor: https://huggingface.co/rookierufus/models
- Dataset asociado (Plug_out_wire_brown_20260917_140911): https://huggingface.co/datasets/rookierufus/Plug_out_wire_brown_20260917_140911
- Repositorio del paper SARM (AAAI 2026 Oral, "Interpretable Reward Model via Sparse Autoencoder", relacion no confirmada con este modelo): https://github.com/schrieffer-z/sarm
