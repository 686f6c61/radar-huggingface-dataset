# Exile051112/franka-pico4-smolvla-c3-red-yellow-blue-edited

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo SmolVLA, especializado en una tarea de manipulación robótica con un brazo Franka y una cámara Pico 4. El adaptador corresponde a la condición `c3_red_yellow_blue_edited`, que combina objetos rojos y amarillos reales con un objeto azul editado sintéticamente. Está diseñado para cargarse junto con el repositorio base `Exile051112/franka-pico4-smolvla-base`, que contiene los pesos completos de la arquitectura SmolVLA de 16 capas, y con la metadata de configuración del VLM de `Exile051112/franka-pico4-smolvlm2-metadata`.

SmolVLA es un modelo visión-lenguaje-acción (VLA) eficiente y asequible, desarrollado por Hugging Face, que combina un VLM compacto preentrenado con un experto de acciones entrenado mediante flow matching. Este adaptador concreto se integra en el ecosistema LeRobot para controlar un robot Franka en un laboratorio, permitiendo ejecutar tareas de manipulación guiadas por instrucciones en lenguaje natural. La relevancia de este modelo radica en su enfoque de bajo coste: al ser un adaptador LoRA, no requiere reentrenar el modelo completo, lo que facilita su despliegue en entornos de investigación con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SmolVLA (VLM compacto + experto de acciones con flow matching) |
| Parametros totales | no disponible (adaptador LoRA, tamano del repo 0.0 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en la documentacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en SmolVLA, una arquitectura que parte de un VLM preentrenado (SmolVLM) y añade un experto de acciones que genera secuencias de acciones (chunks) mediante flow matching. El modelo recibe multiples imagenes y una instruccion en lenguaje natural, y produce una secuencia de acciones de control para el robot. En este caso, el adaptador LoRA ajusta el modelo base para la condicion especifica `c3_red_yellow_blue_edited`, que implica la manipulacion de objetos de colores rojo, amarillo y azul (este ultimo editado sinteticamente). No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens, ni el regimen de entrenamiento (hiperparametros, precision, etc.). La model card indica que se uso PEFT 0.20.0 y que el adaptador se carga con LeRobot.

## Capacidades

- Control de un brazo robotico Franka mediante instrucciones en lenguaje natural, integrado con el ecosistema LeRobot.
- Percepcion visual multi-imagen: procesa imagenes de camaras (en este caso, la Pico 4) para guiar la manipulacion.
- Ejecucion de tareas de manipulacion especificas: la condicion `c3_red_yellow_blue_edited` sugiere que el modelo esta entrenado para distinguir y manipular objetos de colores concretos, incluyendo un objeto azul generado por edicion sintetica.
- Generacion de secuencias de acciones (action chunks) mediante flow matching, lo que permite movimientos suaves y coordinados.
- Capacidad de adaptacion a nuevas condiciones mediante LoRA, sin necesidad de reentrenar el modelo completo.

## Casos de uso

- Investigacion en robotica de laboratorio: el adaptador permite reproducir experimentos de manipulacion con el brazo Franka, siguiendo el protocolo descrito en la model card (usando `lerobot-record` con la ruta del adaptador).
- Desarrollo de politicas de control para tareas de recogida y colocacion de objetos codificados por color, util en entornos de pruebas de vision por computador y aprendizaje por refuerzo.
- Evaluacion de tecnicas de edicion sintetica de datos: la condicion `blue edited` indica que el modelo fue entrenado con datos aumentados sinteticamente, lo que permite estudiar el impacto de la generacion de datos en el rendimiento de politicas roboticas.
- Benchmarking de modelos VLA eficientes: al ser un adaptador LoRA sobre SmolVLA, sirve como punto de partida para comparar el rendimiento de diferentes condiciones de entrenamiento en un mismo hardware.
- Integracion en pipelines de robotica con LeRobot: el adaptador se carga directamente con la herramienta `lerobot-record`, facilitando su uso en sistemas de grabacion y reproduccion de trayectorias.
- Prototipado rapido de nuevas tareas: al ser un adaptador ligero, se puede combinar con diferentes bases y metadata para probar variaciones de la tarea sin grandes costes de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, ni comparaciones con otros modelos. Tampoco se especifican datos de latencia o throughput.

## Requisitos de hardware

- No se proporcionan requisitos especificos de VRAM, GPU o latencia en la informacion disponible.
- Dado que se trata de un adaptador LoRA sobre SmolVLA (un modelo disenado para ser eficiente y asequible), es probable que pueda ejecutarse en GPUs de consumo medio, pero no hay datos concretos que lo confirmen.
- El despliegue se realiza a traves de LeRobot, que gestiona la carga del adaptador junto con el base y la metadata. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que el modelo no es un LLM generico sino una politica robotica.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para SmolVLA en tareas de manipulacion con Franka). La model card no referencia otros adaptadores ni modelos alternativos. Se puede mencionar que SmolVLA en su version base se compara con otros VLA como OpenVLA o RT-2, pero no hay datos especificos de este adaptador para establecer una comparativa directa.

## Limitaciones y advertencias

- El adaptador esta disenado exclusivamente para la condicion `c3_red_yellow_blue_edited`; no es generalizable a otras tareas sin un nuevo entrenamiento.
- Requiere la descarga y sincronizacion de tres repositorios (adaptador, base y metadata) en la misma revision para funcionar correctamente.
- No se especifica la licencia, por lo que el uso comercial puede estar restringido o requerir contacto con el autor.
- No hay informacion sobre sesgos, riesgos de alucinacion o limitaciones de idioma. Al ser un modelo de robotica, los riesgos principales estan asociados a la seguridad fisica del robot y su entorno.
- La model card esta incompleta: muchos campos aparecen como "[More Information Needed]", lo que limita la evaluacion de la calidad y robustez del modelo.
- El tamano del repositorio es 0.0 GB, lo que sugiere que el adaptador es muy pequeno, pero no se indica el numero de parametros del LoRA.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Exile051112/franka-pico4-smolvla-c3-red-yellow-blue-edited
- Repositorio base (pesos de SmolVLA): https://huggingface.co/Exile051112/franka-pico4-smolvla-base
- Metadata del VLM: https://huggingface.co/Exile051112/franka-pico4-smolvlm2-metadata
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Repositorio de ejemplo con LeRobot y Franka: https://github.com/wolfcanli/lerobot_franka
