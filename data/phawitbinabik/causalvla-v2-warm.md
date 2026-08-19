# phawitbinabik/causalvla-v2-warm

## Resumen

**causalvla-v2-warm** es una politica de robotica de tipo Vision-Language-Action (VLA) causal desarrollada por Phawit Boonrat (phawitbinabik) y entrenada con el framework LeRobot de Hugging Face. El modelo aprende tareas de manipulacion espacial pick-and-place sobre un robot Panda de 7 grados de libertad, procesando dos camaras (frontal y de muneca) a 256x256 píxeles junto con el estado del robot (8 dimensiones) para generar acciones de 7 dimensiones. Con aproximadamente 450 millones de parametros, el modelo se entrena sobre el conjunto de datos LIBERO spatial, compuesto por 432 episodios y 52 970 fotogramas a 10 FPS, en tareas que implican recoger cuencos negros y colocarlos en un plato en distintas posiciones espaciales.

La relevancia del modelo radica en su arquitectura causal aplicada al aprendizaje de politicas VLA, un area emergente en robotica. Se distribuye bajo licencia Apache-2.0 y se integra nativamente con LeRobot, lo que permite tanto la ejecucion en robot real (Panda) como la reentrenamiento con datos propios. El repositorio incluye pesos en formato safetensors, con un tamano total de 8,1 GB, y no se han publicado resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | causal_vla_warm (VLA causal) |
| Parametros totales | 450 046 432 (~450 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una politica VLA causal que consume tres entradas: dos imagenes RGB de 256x256 (camara frontal y camara de muneca) y un vector de estado del robot de 8 dimensiones. La salida es un vector de accion de 7 dimensiones correspondiente a las articulaciones del robot Panda. La arquitectura se basa en un enfoque causal para el procesamiento secuencial de observaciones y generacion de acciones, integrado dentro del ecosistema LeRobot.

El entrenamiento se realizo con el conjunto de datos LIBERO spatial (432 episodios, 52 970 fotogramas a 10 FPS), que contiene 10 tareas de manipulacion espacial con variaciones en la posicion de los objetos. Se utilizaron 25 000 pasos de entrenamiento con un batch size de 16, optimizador AdamW y tasa de aprendizaje de 0,0001, con semilla fija 1000. La version de LeRobot utilizada fue la 0.6.1. No se especifica en la informacion disponible si se emplearon tecnicas como RLHF o DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Manipulacion robotica pick-and-place sobre mesa con razonamiento espacial.
- Procesamiento de observaciones visuales duales (camara frontal y de muneca).
- Control de robot Panda de 7 grados de libertad mediante acciones de 7 dimensiones.
- Ejecucion de 10 tareas espaciales distintas del benchmark LIBERO (recoger y colocar cuencos en posiciones concretas).
- Integracion con el framework LeRobot para entrenamiento, evaluacion y rollout en robot real.
- Reentrenamiento y fine-tuning con datos propios mediante el comando lerobot-train.
- No soporta tool calling ni capacidades de lenguaje natural; es un modelo puramente de control robotico.

## Casos de uso

- **Manipulacion pick-and-place en entornos de mesa**: el modelo puede ejecutar tareas de recoger un objeto de una posicion especifica y colocarlo en un destino concreto, como se demuestra en las tareas de LIBERO spatial. Adecuado para estaciones de trabajo robotizadas con un robot Panda.
- **Investigacion en aprendizaje por imitacion**: al estar entrenado con LeRobot, sirve como punto de partida para experimentos de aprendizaje por imitacion, comparacion de politicas VLA y estudio de generalizacion espacial.
- **Benchmark de politicas VLA**: el modelo puede utilizarse como baseline en el conjunto de evaluacion LIBERO spatial, permitiendo comparar su rendimiento con otras politicas del ecosistema.
- **Desarrollo de sistemas robot con LeRobot**: al ser compatible con el pipeline completo de LeRobot (instalacion, hardware, grabacion de datos y entrenamiento), es adecuado para equipos que ya trabajan con este framework y necesitan una politica pre-entrenada.
- **Prototipado de soluciones de automatizacion**: puede integrarse en prototipos de automatizacion de procesos de mesa (clasificacion, recogida y colocacion de objetos) en entornos de investigacion o laboratorio.
- **Investigacion en arquitecturas causales para robotica**: el modelo, junto con el repositorio causalvla de su autor, permite estudiar la aplicacion de arquitecturas causales a problemas de control robotico, incluyendo la prediccion de estados futuros y la generacion de acciones condicionadas a observaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluacion de la politica en robot real todavia.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 450 M de parametros, el modelo ocupa aproximadamente 1,8 GB en FP32 y 0,9 GB en FP16. El tamano del repositorio (8,1 GB) sugiere que pueden incluirse multiples checkpoints o estados del optimizador, pero la inferencia puede ejecutarse con menos de 4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4090) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8-12 GB de VRAM (RTX 3070 o superior) para acomodar el batch size de 16.
- **GPU consumer**: si cabe en GPUs de gama media y alta para consumer.
- **Opciones de despliegue**: LeRobot soporta ejecucion en robot real (Panda) mediante el comando `lerobot-rollout`, y entrenamiento con `lerobot-train`. No es compatible con vLLM, llama.cpp u Ollama, al ser un modelo de robotica, no un LLM.
- **Latencia y throughput**: no disponible. Dependera del hardware y del framework de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| causalvla-v2-warm | ~450 M | LIBERO spatial | 10 tareas pick-and-place | Apache-2.0 | Hugging Face |
| causalvla-object-v2 | ~450 M (estimado) | LIBERO object | 10 tareas de manipulacion de objetos | Apache-2.0 | Hugging Face |
| Otras politicas VLA de LeRobot | variable | variable | variable | variable | Hugging Face |

Nota: la comparativa se basa en la informacion disponible. El modelo causalvla-object-v2, del mismo autor, comparte arquitectura y se diferencia en el conjunto de datos de entrenamiento (LIBERO object en lugar de spatial). No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo se entrena exclusivamente en el conjunto de datos LIBERO spatial, por lo que su comportamiento esta limitado a las 10 tareas especificas de pick-and-place con cuencos negros y platos. No generalizara a otros objetos, escenarios o configuraciones sin reentrenamiento.
- **Riesgo de alucinacion**: no aplica directamente, al ser un modelo de control robotico. Sin embargo, en tareas fuera de su distribucion de entrenamiento, las acciones generadas pueden ser incorrectas o inseguras.
- **Limitaciones de contexto**: el modelo no procesa texto ni lenguaje natural. No tiene capacidad de razonamiento simbolico ni de comprension de instrucciones verbales.
- **Restricciones de licencia**: licencia Apache-2.0, que permite uso comercial, modificacion y distribucion, siempre que se incluya el aviso de licencia original. No se identifican restricciones adicionales.
- **Caveats de produccion**: no se han publicado evaluaciones en robot real, por lo que el rendimiento real puede diferir del esperado. El modelo esta pensado para robot Panda con camaras configuradas especificamente (frontal y de muneca); usar otros robots o configuraciones de camara requerira adaptacion. El entrenamiento se realizo con LeRobot 0.6.1, por lo que versiones posteriores pueden requerir ajustes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/phawitbinabik/causalvla-v2-warm
- Modelo relacionado (LIBERO object): https://huggingface.co/phawitbinabik/causalvla-object-v2
- Repositorio GitHub del autor: https://github.com/phawitb/causalvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Cheat-sheet CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero_spatial_image
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/libero_spatial_image
- Paper relacionado (CausalVAE en world models): https://arxiv.org/abs/2604.07712
