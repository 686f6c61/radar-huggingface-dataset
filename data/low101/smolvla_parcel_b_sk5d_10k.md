# Low101/smolvla_parcel_b_sk5d_10k

## Resumen

smolvla_parcel_b_sk5d_10k es un modelo de vision-lenguaje-accion (VLA) afinado por el usuario Low101 sobre la base SmolVLA de LeRobot, orientado a una tarea concreta de robotica manipulativa: la clasificacion y el volteo de paquetes con un brazo robotico SO-101. El modelo parte de `lerobot/smolvla_base` y se entrena por imitacion sobre 189 episodios propios, con el objetivo de que un unico brazo coja un paquete de un monton, lo coloque en una zona de volteo, lo gire si la etiqueta queda hacia arriba y lo empuje fuera de la mesa con la etiqueta hacia abajo.

Tecnicamente es un SmolVLA de aproximadamente 450 millones de parametros, con un experto de accion de unos 100 millones que es la parte que se entrena mientras el codificador de vision permanece congelado. Es relevante no por su rendimiento generalista, sino como ejemplo reproducible de adaptacion de un VLA pequeno a una tarea industrial de picking y sorting, entrenable en una GPU de portatil de 6 GB en unas 3,4 horas.

El modelo esta publicado bajo licencia Apache 2.0, con pesos en formato safetensors y dependencia estricta de la libreria LeRobot en un commit concreto. Su alcance es deliberadamente limitado: una escena, una iluminacion, un operador y un conjunto de paquetes fabricados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer con experto de accion; codificador de vision congelado |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE; el autor indica que el experto de accion de 100M es la parte entrenada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo consume textos de habilidad en ingles predefinidos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un SmolVLA, una arquitectura de vision-lenguaje-accion que combina un codificador visual con un componente de lenguaje y un experto de accion que produce las consignas articulares. En este afinamiento, el experto de accion (aproximadamente 100 millones de parametros) es el unico bloque que se entrena; el codificador de vision se mantiene congelado. La entrada consta de tres camaras a 30 fps (`observation.images.top` a 848x480, `observation.images.wrist` y `observation.images.side` a 640x480), el estado de las 6 articulaciones del seguidor SO-101 y un texto de habilidad. La salida son las consignas objetivo de las 6 articulaciones.

El entrenamiento se realizo por imitacion sobre 189 episodios, con un texto de habilidad distinto por episodio, durante 10.000 pasos con tamano de lote 12, en 3,4 horas sobre una GPU de portatil de 6 GB. El punto de partida fue el checkpoint `smolvla_parcel_b_80k` y se uso LeRobot en el commit `64b23178`. El autor define cinco textos de habilidad fijos (box, bag, top, far, push) y advierte que el modelo solo ha aprendido esos textos exactos. Los procesadores guardados renombran las camaras top, wrist y side a camera1, camera2 y camera3, y conservan el tokenizador.

## Capacidades

- Control robotico por imitacion: genera consignas de las 6 articulaciones del brazo SO-101 a partir de tres vistas de camara y del estado articular.
- Condicionamiento por texto de habilidad: distingue cinco habilidades concretas (caja rigida, bolsa blanda, carton superior, borde lejano y empuje de objeto aislado) mediante textos fijos en ingles.
- Percepcion multi-camara: integra simultaneamente vista cenital, vista de muneca y vista lateral a 30 fps.
- Ejecucion de una secuencia de tarea completa: coger, colocar, voltear y empujar un paquete en un episodio.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento explicito ni capacidades de agente multi-paso mas alla de la politica de control.
- Capacidades multilingues: no disponibles; el condicionamiento textual se limita a los cinco textos de habilidad en ingles.
- No soporta vision generalista, audio ni generacion de texto libre.

## Casos de uso

- Clasificacion de paquetes en linea de picking: el modelo ejecuta la secuencia de coger un paquete de un monton y depositarlo en una zona de volteo, usando la vista cenital para localizar el objeto y la de muneca para el agarre fino.
- Volteo de paquetes con etiqueta mal orientada: cuando la etiqueta queda hacia arriba, el modelo aplica la habilidad de volteo antes de empujar el paquete fuera de la mesa con la etiqueta hacia abajo.
- Manipulacion de objetos deformables: la habilidad "bag" permite pellizcar una bolsa blanda por el borde y soltarla sobre la mesa, un caso donde el agarre rigido falla.
- Desapilado de cartones: la habilidad "top" levanta el carton superior de una pila apilada, util en escenarios de desapilado previo a la clasificacion.
- Alimentacion de celdas de empaquetado: la habilidad "push" barre un objeto aislado mas alla del borde de la mesa, lo que sirve como paso de descarga hacia una cinta o contenedor.
- Base para afinamiento en demos propias: el autor lo plantea explicitamente como punto de partida para reentrenar con demostraciones de otra celda robotica, gracias a su bajo coste de entrenamiento (3,4 h en una GPU de 6 GB).
- Prueba de pipelines de LeRobot: sirve para validar la instalacion, el formateo de checkpoints y los scripts de ejecucion de un flujo VLA completo antes de invertir en datos propios.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K u otros), sino resultados cualitativos de su propia tarea:

| Prueba | Resultado |
|---|---|
| Preferencia de texto para la habilidad "bag" | 89 % de los fotogramas de bolsa |
| Preferencia de texto para la habilidad "box" | 74 % de los fotogramas de caja |
| Desviacion de texto (text shift) | 3,49 grados |
| Habilidades nuevas (borde lejano y sobre la mesa, 13-16 episodios cada una) | no aprendidas |

No se han publicado resultados de benchmarks estandar en la informacion disponible. El propio autor advierte que la mayoria de las pruebas roboticas tienen pocos ensayos y un solo monton por modelo, por lo que son indicativas y no una comparacion controlada.

## Requisitos de hardware

- Entrenamiento: una GPU de portatil con 6 GB de VRAM fue suficiente para 10.000 pasos con lote 12 en 3,4 horas.
- Inferencia: no se especifica VRAM concreta; con 450 millones de parametros en safetensors (repo de 0,9 GB), cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- GPU recomendadas: no disponibles de forma explicita; el autor solo documenta el entrenamiento en una GPU de portatil de 6 GB.
- Cabe en GPU de consumo: si, segun el tamano del modelo y el repo de 0,9 GB.
- Despliegue: LeRobot en el commit `64b23178`, con los scripts del repositorio del autor y descarga via `hf download` al layout `outputs/train/smolvla_parcel_b_sk5d_10k/checkpoints/last/pretrained_model`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_parcel_b_sk5d_10k | 450M | no disponible | VLA para sorting de paquetes con SO-101 | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base generalista de LeRobot | no disponible en la informacion | Hugging Face |
| smolvla_parcel_b_80k | no disponible en la informacion | no disponible | Checkpoint previo del mismo proyecto | no disponible en la informacion | Referenciado por el autor |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sobreajuste a una unica escena: el modelo aprendio una bandeja, unas poses de camara, una iluminacion y unos paquetes concretos; en otro montaje probablemente no funcionara tal cual.
- Dataset pequeno: 189 episodios, un solo operador y una sola configuracion de recogida.
- Textos de habilidad cerrados: solo funciona con los cinco textos exactos en ingles; cualquier variacion puede degradar el comportamiento.
- Habilidades no aprendidas: las dos habilidades nuevas (borde lejano y sobre la mesa) no se adquirieron con 13-16 episodios; el autor estima que se necesitan unos 20 episodios buenos por habilidad.
- Evaluacion debil: pocos ensayos y un solo monton por modelo, sin comparacion controlada.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si en la generacion de consignas articulares fuera de distribucion, que pueden producir movimientos no deseados.
- Sesgos conocidos: no documentados mas alla de la dependencia de la escena y del operador.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la validez practica del modelo esta limitada por su especificidad de escena.
- Dependencia de version: requiere LeRobot en el commit `64b23178`; otras versiones pueden romper la carga de procesadores y checkpoints.
- Para produccion: no recomendado sin reentrenamiento con datos propios y una evaluacion controlada con multiples ensayos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Low101/smolvla_parcel_b_sk5d_10k
- Repositorio GitHub del proyecto: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm
- Pagina del proyecto: https://timeisgold5168.github.io/
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Instrucciones de instalacion: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm#installation
