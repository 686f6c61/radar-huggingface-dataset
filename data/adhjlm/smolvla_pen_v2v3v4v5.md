# adhjlm/smolvla_pen_v2v3v4v5

## Resumen

El modelo `adhjlm/smolvla_pen_v2v3v4v5` es un fine-tuning del modelo base `lerobot/smolvla_base`, un vision-language-action model (VLA) compacto de 450 millones de parametros desarrollado por Hugging Face. Este ajuste especifico ha sido entrenado por el usuario `adhjlm` sobre el dataset `adhjlm/so101_pen_pick_place_v2v3v4v5`, que contiene 138 episodios de demostraciones de un robot SO-101 realizando la tarea de recoger un boligrafo y colocarlo en una posicion objetivo. El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para su ejecucion en hardware de consumo, lo que lo hace relevante para la comunidad de robotica open source que busca politicas de control eficientes y economicas.

La arquitectura de SmolVLA combina un modelo de lenguaje y vision preentrenado con un "action expert" entrenado mediante flow matching, que genera secuencias de acciones a partir de multiples imagenes y una instruccion en lenguaje natural. En esta version ajustada, el modelo recibe el estado del robot (6 dimensiones) y dos imagenes de camaras (frontal y de muneca) a 480x640 pixeles, y produce una accion de 6 dimensiones. El entrenamiento se realizo con 10.000 pasos, batch size 8, learning rate 1e-4 y optimizador AdamW, usando la libreria LeRobot 0.6.1.

Aunque no se han publicado resultados de evaluacion en la model card, el modelo representa un ejemplo practico de como adaptar un VLA generalista a una tarea de manipulacion especifica con un volumen de datos relativamente pequeno, manteniendo un tamano de 450 millones de parametros que permite su despliegue en GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA: VLM compacto + action expert con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un VLA ligero compuesto por un modelo de lenguaje y vision preentrenado y un modulo de accion entrenado con flow matching. Dadas varias imagenes y una instruccion textual, el modelo genera un fragmento de acciones (action chunk). En este fine-tuning, el modelo base `lerobot/smolvla_base` se ha ajustado sobre el dataset de demostraciones de pick-and-place de un boligrafo, con 138 episodios y 83.024 frames a 30 FPS. La configuracion de entrenamiento incluye 10.000 pasos, batch size 8, optimizador AdamW con learning rate 0.0001 y semilla 1000. El robot utilizado es el `so_follower` (SO-101), con dos camaras: frontal y de muneca. Las entradas son el estado del robot (vector de 6 dimensiones) y dos imagenes de 3x480x640, y la salida es una accion de 6 dimensiones.

## Capacidades

- Control robotico de 6 grados de libertad: genera acciones de posicion y orientacion del efector final a partir del estado y las imagenes.
- Percepcion visual con dos camaras (frontal y de muneca) a resolucion 480x640.
- Ejecucion de tareas de manipulacion guiadas por instruccion en lenguaje natural, especificamente "recoger el boligrafo y colocarlo en la posicion objetivo".
- Generacion de secuencias de acciones (action chunking) mediante flow matching, lo que permite movimientos suaves y coherentes.
- No incluye capacidades de chat, generacion de texto libre ni razonamiento general fuera del contexto robotico.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en un brazo SO-101 para mover objetos de una posicion a otra, util en lineas de montaje o laboratorios de prueba.
- Prototipado rapido de politicas robotica: gracias a su tamano reducido y al flujo de entrenamiento con LeRobot, permite iterar sobre nuevas tareas con pocas horas de datos.
- Investigacion en robotica de bajo coste: al ejecutarse en hardware de consumo, es adecuado para laboratorios academicos sin acceso a GPUs de alta gama.
- Educacion y formacion en robotica: puede usarse en cursos de aprendizaje por imitacion para demostrar el ciclo completo de recogida de datos, entrenamiento y despliegue.
- Evaluacion de metodos de fine-tuning de VLA: sirve como punto de partida para comparar estrategias de adaptacion a tareas especificas con datasets pequenos.
- Despliegue en robots de asistencia o demostradores: permite probar capacidades de manipulacion en robots colaborativos de bajo coste antes de escalar a sistemas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- No se proporcionan datos especificos de VRAM en la informacion disponible, pero al tratarse de un modelo de 450 millones de parametros, se estima que puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM en precision FP16, y menos con cuantizacion.
- GPUs recomendadas: tarjetas de gama media como RTX 3060, RTX 4060, RTX 4070, o superiores. No se requiere una A100 o H100 para inferencia.
- El modelo esta disenado para consumer-grade hardware, segun la documentacion de SmolVLA.
- Opciones de despliegue: el flujo estandar es mediante la libreria LeRobot, con comandos como `lerobot-rollout` para ejecutar la politica en el robot. Tambien puede cargarse con la API de LeRobot en Python.
- No se dispone de datos de latencia o throughput especificos para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `adhjlm/smolvla_pen_v2v3v4v5` | 450M | No disponible | Apache 2.0 | Fine-tuning de SmolVLA para pick-and-place |
| SmolVLA base (`lerobot/smolvla_base`) | 450M | No disponible | Apache 2.0 | VLA generalista preentrenado |
| OpenVLA | 7B | No disponible | MIT (con restricciones) | VLA de gran tamano para manipulacion |
| RT-2 | 55B | No disponible | Propietario | VLA de Google, no open source |

La comparativa se limita a parametros y licencia, ya que no hay datos de rendimiento publicados para este fine-tuning. SmolVLA destaca por su tamano reducido frente a alternativas como OpenVLA o RT-2, lo que facilita su despliegue en hardware accesible.

## Limitaciones y advertencias

- El modelo esta ajustado exclusivamente para la tarea de recoger un boligrafo y colocarlo en una posicion objetivo; no es generalizable a otras tareas sin reentrenamiento.
- No se han publicado resultados de evaluacion en el robot real, por lo que el rendimiento en entornos no vistos (cambios de iluminacion, posiciones de objetos, distractores) es incierto.
- El dataset de entrenamiento es pequeno (138 episodios), lo que puede limitar la robustez frente a variaciones del entorno.
- La instruccion de la tarea esta fijada en ingles ("Pick up the pen and place it in the target location."); no se ha probado con otras formulaciones o idiomas.
- No se dispone de informacion sobre sesgos especificos del modelo, pero al ser un sistema de control robotico, el riesgo principal es la generacion de acciones incorrectas o inseguras en situaciones no contempladas.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el uso cumple con las normativas de seguridad aplicables a robotica.

## Enlaces

- Repositorio del modelo: https://huggingface.co/adhjlm/smolvla_pen_v2v3v4v5
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/adhjlm/so101_pen_pick_place_v2v3v4v5
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
