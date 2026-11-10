# sari-abdan/vial-sort-pi05-ws220-b-16000

## Resumen

`sari-abdan/vial-sort-pi05-ws220-b-16000` es un checkpoint de investigacion de un modelo vision-language-action (VLA) construido sobre π0.5 (`lerobot/pi05_base`), desarrollado por el usuario sari-abdan y publicado en Hugging Face. El modelo ha sido afinado completamente (full fine-tune) para una tarea robotica concreta: mover un vial de una ranura nombrada a otra, o a un contenedor, usando un brazo de bajo coste SO-101. Con 4.143.404.816 parametros, se distribuye en safetensors bajo la libreria LeRobot y ocupa 9,4 GB en el repositorio.

El modelo parte de un checkpoint previo entrenado con 100 demostraciones y se reentrena sobre 220 demostraciones del dataset `sari-abdan/vial-sort-slots-220` durante 16.000 pasos. La particularidad del dataset es que 150 de las demostraciones registran el mismo layout tres veces con tres destinos distintos, de modo que el destino solo puede inferirse a partir del prompt en lenguaje natural. Esto convierte al modelo en un banco de pruebas para la condicionalidad por instruccion en politicas VLA, no en un sistema de produccion.

El propio autor advierte que es un checkpoint de investigacion que **no completa la tarea de forma fiable**. En las pruebas reales sobre el robot, de 24 tomas puntuadas, agarro el vial correcto en 18 y lo solto en la ranura solicitada en 7. El autor recomienda usar el checkpoint hermano `vial-sort-pi05-ws220-a-16000` en su lugar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (π0.5, basada en PaliGemma/Gemma) con salida de acciones en chunks |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 durante el entrenamiento) |
| Idiomas soportados | no disponible (prompts en ingles segun la gramatica de entrenamiento) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de π0.5, una politica VLA que combina un backbone vision-language derivado de PaliGemma/Gemma con una cabeza que genera acciones motoras. La entrada esta compuesta por cinco camaras de color a 640×480 (top_down, left_top, left_bottom, right y wrist), las 6 posiciones articulares del brazo SO-101 y un prompt en lenguaje natural. La salida son 6 objetivos articulares en chunks de 50 pasos; en las pruebas se ejecuto con `n_action_steps=15` en modo sincrono.

El entrenamiento se realizo sobre 220 demostraciones (113.010 frames tras recortar el inicio y el final inactivos), con 16.000 pasos a batch size 16 (unas 2,3 pasadas), optimizador AdamW, learning rate 1e-05 y bfloat16. Se ejecuto en una unica A100 de 80 GB durante 21,5 horas repartidas en dos trabajos de 12 horas, a 4,81 s por paso y 37,8 GiB de memoria. Un detalle tecnico relevante: los rangos articulares usados para escalar estado y accion se revirtieron a los del modelo de partida, porque la fusion de datasets habia ampliado el rango del gripper de 37,4° a 50,8°, y un modelo entrenado a partir de otro conserva su escala.

La gramatica de prompt del entrenamiento sigue el formato "Move the vial from position 3 of the right rack to slot 6 of the left rack" o "Move the vial from position 4 of the left rack to the bin". Las ranuras de origen son 1, 3, 4 y 6; las de destino, 1, 3 y 6, o el contenedor. Las ranuras 2 y 5 no aparecen en ningun prompt de entrenamiento de forma deliberada.

## Capacidades

- Control robotico de manipulacion: genera trayectorias articulares de 6 grados de libertad para un brazo SO-101.
- Condicionalidad por instruccion en lenguaje natural: el destino del vial se especifica mediante prompt, no por el layout visual.
- Percepcion multi-camara: integra cinco vistas simultaneas (cenital, dos laterales, derecha y muneca).
- Generacion de acciones en chunks: emite secuencias de 50 pasos con ejecucion sincrona de 15.
- Discriminacion de ranuras y contenedor: distingue entre ranuras de origen (1, 3, 4, 6) y de destino (1, 3, 6, contenedor).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vision generalista fuera del control motor.

## Casos de uso

- **Investigacion en politicas VLA condicionadas por lenguaje**: el modelo sirve para estudiar si una politica puede seleccionar el destino a partir del prompt cuando el layout visual es identico, gracias al diseno del dataset con tres destinos por layout.
- **Benchmark de generalizacion a ranuras no vistas**: las ranuras 2 y 5 se excluyen del entrenamiento a proposito, lo que permite medir la extrapolacion a posiciones no presentes en los datos.
- **Reproduccion de experimentos de fine-tuning con LeRobot**: los checkpoints se generan con `lerobot-train` y se cargan con las clases de politica de LeRobot, lo que facilita replicar el pipeline en otros brazos o tareas.
- **Prototipado de bajo coste con SO-101**: el uso de un brazo economico y cinco camaras de color convencionales hace que el montaje sea accesible para laboratorios con presupuesto limitado.
- **Analisis de fallos de agarre**: el autor documenta que 7 de los movimientos fallaron en el agarre, la mayoria desde la ranura 6, lo que convierte al modelo en material para estudiar modos de fallo en manipulacion.
- **Comparacion de checkpoints intermedios**: al existir versiones a 12.000 y 16.000 pasos y una variante `a-16000`, permite analizar la evolucion del rendimiento con el numero de pasos y la inicializacion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tomas puntuadas (16k pasos) | 24 |
| Vial correcto agarrado | 18 de 24 |
| Soltado en la ranura solicitada | 7 de 24 |
| Movimientos evaluados por el operador (8-9 nov.) | 31 |
| Viales en la ranura solicitada (vs. modelo from-base) | 11 (frente a 21 del modelo from-base) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un modelo robotico. Las cifras anteriores son evaluaciones de rollout sobre el robot real, puntuadas por un script que lee las poses articulares y no ve el vial; el criterio "soltado en la ranura solicitada" significa que el brazo abrio el gripper alli. El autor advierte que son pruebas de desarrollo y no una evaluacion planificada, con numeros pequenos.

## Requisitos de hardware

- **Entrenamiento**: una A100 de 80 GB, 37,8 GiB de memoria, 4,81 s por paso, 21,5 horas para 16.000 pasos.
- **Inferencia**: no se documenta VRAM especifica de inferencia; con 4.143 millones de parametros en bfloat16 se estima un requisito en torno a 8-10 GB solo para pesos, mas el coste de las cinco imagenes de entrada.
- **GPU recomendadas**: el autor solo documenta A100 80 GB para entrenamiento. Para inferencia, una RTX 4090 (24 GB) o superior seria suficiente por capacidad de memoria, aunque no esta verificado en la informacion disponible.
- **Consumer GPU**: previsiblemente cabe en GPUs de 24 GB o mas, pero no se confirma en la documentacion.
- **Despliegue**: LeRobot (`lerobot-train`, `lerobot-rollout`) con las clases de politica del proyecto. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de control motor.
- **Latencia**: no disponible para inferencia; el entrenamiento registro 4,81 s por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vial-sort-pi05-ws220-b-16000` (este) | 4.143 M | Mover vial entre ranuras | no disponible | Gemma | Hugging Face |
| `vial-sort-pi05-ws220-a-16000` | no disponible | Misma tarea | no disponible | Gemma | Hugging Face (recomendado por el autor) |
| `vial-sort-pi05-ws100-canon-12000` | no disponible | Misma tarea, 100 demos | no disponible | Gemma | Hugging Face (checkpoint de partida) |
| `lerobot/pi05_base` | no disponible | Politica VLA general | no disponible | Gemma | Hugging Face (modelo base) |

No se dispone de datos de parametros ni benchmarks de los modelos comparables en la informacion proporcionada. La comparacion se limita a la relacion de linaje y a la recomendacion explicita del autor de preferir la variante `a-16000`.

## Limitaciones y advertencias

- **No completa la tarea de forma fiable**: el propio autor lo declara explicitamente; es un checkpoint de investigacion, no un producto.
- **Sesgo hacia el centro de la estanteria**: el destino sigue al prompt pero se desplaza hacia el centro; la ranura 3 suele acabar en la 2, y la 6 en la 3 o la 5.
- **Fallos de agarre**: 7 de los movimientos fallaron al agarrar, la mayoria desde la ranura 6.
- **Ranuras no entrenadas**: las ranuras 2 y 5 no aparecen en ningun prompt de entrenamiento, por lo que su comportamiento no esta caracterizado.
- **Evaluacion limitada**: 24 tomas puntuadas por script sin vision del vial y 31 movimientos observados por el operador; no es una evaluacion planificada.
- **Idioma**: los prompts de entrenamiento estan en ingles; no se documenta soporte multilingue.
- **Licencia**: sujeta a los Gemma Terms of Use, con implicaciones para uso comercial que deben revisarse en el aviso `NOTICE` del repositorio.
- **Reproducibilidad parcial**: los scripts de rollout y evaluacion del proyecto no estan publicados todavia.
- **Sin datos de sesgo general**: no se documentan sesgos sociales ni de dominio mas alla del comportamiento fisico descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sari-abdan/vial-sort-pi05-ws220-b-16000
- Checkpoint recomendado por el autor: https://huggingface.co/sari-abdan/vial-sort-pi05-ws220-a-16000
- Checkpoint de partida: https://huggingface.co/sari-abdan/vial-sort-pi05-ws100-canon-12000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sari-abdan/vial-sort-slots-220
- Documentacion del proyecto: https://sariabdan.github.io/vial-sort/docs/
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
