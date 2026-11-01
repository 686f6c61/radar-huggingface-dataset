# Dvidia/piper-block-placement-v01

## Resumen

PiPER block placement v0.1 es un artefacto de investigacion publicado por Dvidia en HuggingFace bajo el pipeline `robotics`. No es un modelo de lenguaje ni un modelo generativo multimodal, sino una politica de control motor aprendida por imitacion para una tarea muy concreta: la colocacion de un bloque rigido de 40 g en dos destinos conocidos mediante un brazo robotico PiPER en simulacion. La politica seleccionada se describe como una primitiva de movimiento feedforward RBF condicionada por tiempo, con 16 terminos espaciales cubicos y 401 centros temporales (sigma = 0,025 s), serializada bajo el esquema `dvidia.piper-motor-primitive/v2`.

El modelo se entrena a partir de demostraciones generadas por un profesor sintetico escrito a mano que opera en el simulador con acceso a datos privilegiados (posiciones de articulaciones, TCP, objeto y contacto). La politica final, sin embargo, solo consume la posicion XY inicial del objeto, una de las dos coordenadas de destino conocidas y el tiempo transcurrido; las posiciones articulares en vivo se usan unicamente por los topes nativos de objetivo articular. Es relevante ahora como ejemplo reproducible de destilacion de trayectorias en simulacion con controles negativos explicitos (modelo con etiquetas barajadas, apertura de pinza, retencion), y no como un sistema listo para robot fisico.

El repositorio tiene un tamano declarado de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y se publica con licencia MIT para los ficheros originales de DVIDIA. La model card es inusualmente explicita sobre lo que el artefacto no demuestra: no hay aprendizaje desde video humano, ni control solo con camara, ni rendimiento en robot fisico, ni preparacion para hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Primitiva de movimiento feedforward RBF condicionada por tiempo (16 terminos espaciales cubicos x 401 centros temporales, sigma = 0,025 s); esquema `dvidia.piper-motor-primitive/v2` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT (ficheros originales DVIDIA; el modelo PiPER y componentes upstream conservan sus propias licencias) |
| Formato de pesos | JSON (`model/model.json`) |
| Entradas de la politica | XY inicial del objeto, una de dos coordenadas de destino conocidas, tiempo transcurrido |
| Salidas | Referencias de trayectoria feedforward para servos nativos |
| Entorno de ejecucion | Simulacion nativa fijada (pinned), Python 3.12 o superior |
| Hardware fisico | No conecta con robot real |

## Arquitectura y entrenamiento

La politica seleccionada no es una red neuronal profunda en el sentido habitual, sino una primitiva de movimiento parametrizada por funciones de base radial. Combina 16 terminos espaciales cubicos con 401 centros temporales y un ancho de banda de 0,025 s, lo que produce una representacion de alta resolucion temporal condicionada por el instante de ejecucion. La entrada se limita a la posicion XY de reinicio del objeto, una de las dos coordenadas de destino conocidas y el reloj medido; no consume estimaciones de TCP ni de contacto, y no aprende retroalimentacion de contacto ni recuperacion. Los servos nativos y el limitador de tasa siguen siendo codigo escrito a mano, y el estudiante no invoca al profesor, a la maquina de fases ni a la cinematica inversa.

El entrenamiento es por imitacion a partir de demostraciones generadas por un profesor sintetico autorado que opera en el simulador con datos privilegiados. El dataset conserva todas las demostraciones programadas, checkpoints candidatos MLP fallidos con sus trazas de desarrollo y todos los intentos de confirmacion. Se retiene ademas un modelo con etiquetas barajadas como control negativo. La fase de confirmacion encontro un problema de serializacion: la configuracion en vivo usaba tuplas mientras que el JSON persistido usaba listas; un adaptador acotado verifico el error exacto y los bindings congelados y reanudo la puntuacion desde cada cinta de episodio nativo ya guardada, sin reejecutar fisica (cero cintas completadas reejecutadas, segun el resumen de recuperacion).

## Capacidades

- Generacion de referencias de trayectoria feedforward para colocacion de un bloque rigido de 40 g en dos destinos entrenados.
- Interpolacion desde posiciones iniciales dentro del rango evaluado (por ejemplo, inicio en x = 0,30, y = -0,03 con destino 0).
- Condicionamiento temporal de alta resolucion (401 centros, sigma = 0,025 s) para temporizar la primitiva.
- Ejecucion en simulacion nativa fijada mediante la CLI `dvidia-piper-learned`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No incluye vision, audio ni modo de razonamiento.
- No aprende correccion reactiva de contacto ni recuperacion.

## Casos de uso

- Reproduccion de experimentos de imitacion en robotica: el paquete `dvidia-training[arm]` y la CLI `dvidia-piper-learned` permiten ejecutar la politica en simulacion nativa fijada, lo que facilita replicar el protocolo y comparar con los controles negativos publicados.
- Docencia e investigacion sobre destilacion de trayectorias: el artefacto incluye el profesor sintetico, las demostraciones, los checkpoints fallidos y las trazas, lo que lo convierte en material didactico para estudiar como se destila una politica feedforward desde un controlador autorado.
- Estudio de controles negativos en aprendizaje por imitacion: las variantes `open_jaw`, `hold` y `shuffled_labels` con 0/12 exitos permiten analizar la sensibilidad del protocolo y detectar fugas de informacion.
- Analisis de contrato de entradas en politicas roboticas: la separacion explicita entre datos privilegiados del dataset y las entradas reales de la politica seleccionada sirve para auditar que informacion consume realmente el estudiante.
- Pruebas de integracion de pipelines de simulacion: el comando `dvidia-robot-sim fetch piper` y la ejecucion local permiten validar entornos de simulacion antes de escalar a otras tareas.
- Referencia para diseno de esquemas de serializacion: el incidente de tuplas frente a listas y el adaptador de recuperacion documentado en `sources/piper_imitation_driver.py` y `driver-recovery.json` son un caso practico de gestion de errores de serializacion en evaluaciones congeladas.

## Benchmarks y rendimiento

Resultados de exito declarados en el informe del autor (5 variantes, 7 entradas de limitaciones):

| Variante | Exitos / programados |
|---|---:|
| learned | 5 / 12 |
| teacher | 12 / 12 |
| open_jaw | 0 / 12 |
| hold | 0 / 12 |
| shuffled_labels | 0 / 12 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el peso es un fichero JSON de primitiva RBF, no un modelo neuronal de gran tamano.
- GPU recomendadas: no disponible; la model card indica que los minimos de CPU/GPU no estan certificados.
- Cabe en GPU consumer: no disponible; el cuello de botella es la simulacion fisica nativa, no la politica.
- Opciones de despliegue: ejecucion local mediante Python 3.12+, el wheel `dvidia-training[arm]` y las CLI `dvidia-robot-sim` y `dvidia-piper-learned`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles; la latencia de computo excluye sensing, procesamiento de camara, comunicacion y actuacion fisica.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros artefactos de colocacion de bloques con brazo PiPER ni politicas comparables con las que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Las demostraciones son de estado/accion sinteticos generados por un controlador PiPER autorado, no video humano ni teleoperacion.
- Los candidatos MLP anteriores usaron medidas privilegiadas de simulador (articulaciones, TCP, objeto y contacto); no se entreno ningun pipeline de vision. Esa afirmacion amplia del informe describe esos candidatos, no el contrato de entradas de la primitiva v2 seleccionada.
- Solo se evalua interpolacion de posicion inicial para un bloque rigido de 40 g y dos destinos entrenados.
- El servo nativo fijado y el limitador de tasa siguen siendo control de bajo nivel autorado; el estudiante no llama al profesor, a la maquina de fases ni a la cinematica inversa.
- Friccion, contactos y actuadores simulados sin calibrar; no hay cualificacion en robot fisico ni transferencia a otro brazo.
- La latencia de computo excluye sensing, procesamiento de camara, comunicacion y actuacion fisica; los minimos de CPU/GPU no estan certificados.
- Es exclusivamente simulacion: destilacion de trayectorias condicionadas por tiempo desde demostraciones de un controlador sintetico autorado. No hay retroalimentacion de contacto aprendida, recuperacion, aprendizaje desde camara ni cualificacion en robot fisico.
- La licencia MIT cubre los ficheros originales de DVIDIA; el modelo PiPER y otros componentes upstream conservan sus propias licencias, que deben verificarse para uso comercial.
- Riesgo de alucinacion y sesgos linguisticos: no aplica, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dvidia/piper-block-placement-v01
- Dataset de demostraciones: https://huggingface.co/datasets/Dvidia/piper-block-placement-demonstrations-v01
- Visor de replay grabado: https://dvidia-robot-simulation-lab.static.hf.space/learned-placement/v01/viewer/index.html
- Wheel de entrenamiento: https://github.com/Dvidia-Inference/dvidia-training/releases/download/piper-imitation-v0.1/dvidia_training-0.1.0-py3-none-any.whl
- Pesos de la politica: https://huggingface.co/Dvidia/piper-block-placement-v01/resolve/main/model/model.json
