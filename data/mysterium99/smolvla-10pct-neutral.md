# mysterium99/smolvla-10pct-neutral

## Resumen

El modelo `mysterium99/smolvla-10pct-neutral` es una política de aprendizaje por imitación para robótica basada en SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por el equipo de LeRobot/Hugging Face. El usuario `mysterium99` ha publicado este checkpoint, que está finetuneado a partir del modelo base `lerobot/smolvla_base` y licenciado bajo Apache 2.0. El modelo toma observaciones multimodales (el estado del robot y tres imágenes de cámara) y produce acciones de control de seis dimensiones.

Se entrenó sobre el dataset `default_merged`, compuesto por 150 episodios y 83.987 frames, para tareas concretas de manipulación como empujar bloques, recoger cubos y colocar objetos en contenedores. Con unos 450 millones de parámetros, está orientado a ejecutarse en hardware de consumo, lo que lo hace relevante para la investigación en robótica accesible y para el desarrollo de sistemas de manipulación en entornos de laboratorio o educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de vision-lenguaje-accion (VLA) compacto basado en SmolVLA. Detalles de arquitectura interna no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo orientado a acciones roboticas, no a tareas linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo como SmolVLA, un VLA compacto y eficiente. La informacion proporcionada no detalla la arquitectura interna (tipo de transformer, mecanismos de atencion, etc.). El modelo recibe como entrada el estado del robot (6 valores) y tres imagenes RGB de 256x256 píxeles (camara1, camara2 y camara3). Como salida, genera una accion de 6 dimensiones.

Esta politica se ha entrenado mediante fine-tuning con la libreria LeRobot a partir del checkpoint `lerobot/smolvla_base`. El dataset utilizado es `default_merged`, con 150 episodios, 83.987 frames, una tasa de 30 FPS y tres tareas: "Push block into area marked with tape", "Pick up the cube and put it into the cup" y "Put all the yellow blocks into the bin". La configuracion de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador AdamW, tasa de aprendizaje 0.0001 y semilla 0. No se mencionan procesos de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Generacion de acciones de control para robotica: predice acciones de 6 dimensiones a partir de observaciones multimodales.
- Percepcion visual: procesa simultaneamente tres entradas de imagen RGB a resolucion 256x256.
- Ejecucion de tareas de manipulacion concretas: empuje de bloques hacia una zona marcada, recogida de cubos y colocacion en una taza, y ordenacion de bloques amarillos en un contenedor.
- Inferencia en tiempo real: el dataset de entrenamiento se registro a 30 FPS, lo que sugiere que la politica puede ejecutarse a esa frecuencia.
- Aprendizaje por imitacion: entrenado con demostraciones humanas mediante LeRobot, por lo que puede replicar comportamientos observados.
- Fine-tuning: puede adaptarse a nuevas tareas o dominios mediante entrenamiento adicional con LeRobot.
- No se dispone de soporte de tool calling, agentes autonomos o razonamiento de lenguaje natural en la informacion proporcionada; el modelo esta orientado a politicas de accion.

## Casos de uso

- Automatizacion de tareas de pick-and-place en almacenes: el modelo puede recoger objetos de una superficie y colocarlos en contenedores o zonas designadas, gracias a sus salidas de accion de 6 dimensiones y su capacidad de percepcion visual.
- Asistencia en ensamblaje de piezas en laboratorios: tareas como introducir un cubo en una taza o colocar bloques en posiciones concretas pueden desempenarse con el robot tipo Follower, aprovechando el aprendizaje por imitacion de demostraciones humanas.
- Investigacion en aprendizaje por imitacion: con 450 millones de parametros y un diseno compacto, este checkpoint sirve como baseline para comparar tecnicas de entrenamiento o como punto de partida para explorar generalizacion en nuevas tareas.
- Educacion y formacion en robotica: al ser un modelo VLA de tamano reducido y estar integrado en el ecosistema LeRobot, es adecuado para cursos universitarios o talleres donde el alumnado puede ejecutar y modificar la politica en robots de bajo coste.
- Prototipado rapido en startups de robotica: el formato safetensors y la licencia Apache 2.0 permiten integrar el modelo en pipelines propietarias y realizar pruebas funcionales sin coste de licencia.
- Robotica domestica asistencial: las habilidades de manipulacion mostradas en el dataset (recoger, empujar, colocar objetos) pueden extrapolarse a tareas de asistencia en el hogar, como organizar objetos en superficies o contenedores.
- Desarrollo de robots autonomos de bajo coste: el modelo se define como usable en hardware de consumo, por lo que puede desplegarse en plataformas roboticas economicas para validaciones de campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponibles.
- El repositorio pesa 0,9 GB, lo que sugiere un modelo relativamente ligero, pero no se especifican tensores concretos ni requisitos de memoria.
- La model card indica que SmolVLA puede desplegarse en hardware de consumo, aunque no se detallan las GPU compatibles.
- Opciones de despliegue: la politica se puede ejecutar mediante la libreria LeRobot, usando comandos como `lerobot-rollout` para inferencia y `lerobot-train` para fine-tuning.
- Requiere un robot tipo Follower y una configuracion de camaras compatible con las tres entradas visuales del modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| mysterium99/smolvla-10pct-neutral | 450.046.176 | No disponible | Apache 2.0 | No disponible |
| mysterium99/smolvla-pre-25pct | No disponible | No disponible | Apache 2.0 | No disponible |
| mysterium99/smolvla-0pct-different | No disponible | No disponible | Apache 2.0 | No disponible |
| lerobot/smolvla_base (modelo base) | No disponible | No disponible | Apache 2.0 | No disponible |

Todos los modelos de la serie comparten la misma arquitectura SmolVLA y se ejecutan con la libreria LeRobot. El checkpoint `smolvla-10pct-neutral` esta finetuneado a partir de `lerobot/smolvla_base`. No se dispone de mas datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: la model card declara que no se han facilitado metricas de exito en robot, por lo que el rendimiento real no ha sido cuantificado.
- Dataset reducido y especifico: entrenado en solo 150 episodios para tres tareas concretas, lo que limita la generalizacion a objetos, entornos o configuraciones distintas.
- Dependencia de la libreria LeRobot: el modelo esta en el formato de esa libreria, por lo que integrarlo en otros frameworks (por ejemplo, ROS, PyTorch puro) puede requerir conversion o adaptacion.
- Requiere un hardware robotico especifico: para ejecutar la politica es necesario un robot tipo Follower y camaras compatibles con las entradas visuales entrenadas; sin este equipamiento, el modelo no puede emplearse.
- Al ser un modelo de acciones, no es util para generar texto, codigo o razonamiento simbolico; su ambito se limita a la generacion de politicas de control.
- Posibilidades de acciones incoherentes fuera de distribucion: si las observaciones (iluminacion, posiciones de objetos, distorsiones) difieren significativamente del dataset de entrenamiento, la politica podria producir acciones no deseadas o no seguras.
- Licencia Apache 2.0: aunque permite uso comercial, se debe mantener la atribucion al autor original y al modelo base, asi como el aviso de licencia en redistribuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla-10pct-neutral
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelo hermano (pre-25pct): https://huggingface.co/mysterium99/smolvla-pre-25pct
- Modelo hermano (0pct-different): https://huggingface.co/mysterium99/smolvla-0pct-different
