# Exile051112/franka-pico4-smolvla-c2-red-yellow-blue-real

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo de visión-lenguaje-acción (VLA) SmolVLA, desarrollado por el usuario Exile051112. El adaptador está diseñado específicamente para la condición `c2_red_yellow_blue_real`, que corresponde a una tarea de manipulación robótica con objetos rojos, amarillos y azules reales en un robot Franka Pico4. Se integra con el framework LeRobot y requiere el repositorio base compartido `Exile051112/franka-pico4-smolvla-base` para funcionar.

El modelo se enmarca en la línea de investigación de SmolVLA, un VLA eficiente y asequible presentado en el artículo arXiv 2506.01844, que adapta modelos de visión-lenguaje preentrenados para control robótico. Este adaptador concreto es un componente de un sistema mayor de despliegue en laboratorio, donde la configuración de la VLM y el tokenizador provienen de un repositorio de metadatos separado. La relevancia de este modelo radica en su enfoque práctico: permite ejecutar políticas robóticas condicionadas por lenguaje natural en un robot real sin necesidad de cargar pesos completos de VLM de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre SmolVLA (16 capas, configuracion VLM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura SmolVLA, un modelo de vision-lenguaje-accion que parte de un VLM preentrenado y lo adapta para generar acciones de control robotico. Segun el articulo de referencia (arXiv 2506.01844), SmolVLA utiliza una arquitectura transformer con 16 capas y esta disenado para ser eficiente y asequible, evitando los costes de los VLA mas grandes. El adaptador LoRA de este repositorio se entrena especificamente para la condicion `c2_red_yellow_blue_real`, que implica la manipulacion de objetos de tres colores (rojo, amarillo y azul) en un escenario real.

El entrenamiento se realiza dentro del ecosistema LeRobot, como indica el comando `lerobot-record` en la model card. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens, ni el regimen de entrenamiento (si hubo RLHF, DPO u otras tecnicas). El adaptador se carga junto con el repositorio base `Exile051112/franka-pico4-smolvla-base`, que contiene todos los pesos de la arquitectura de 16 capas, y el repositorio de metadatos `Exile051112/franka-pico4-smolvlm2-metadata` para la configuracion de la VLM y el tokenizador.

## Capacidades

- Control robotico condicionado por lenguaje natural: el modelo genera acciones para un robot Franka Pico4 a partir de instrucciones visuales y textuales.
- Percepcion visual de objetos de colores especificos (rojo, amarillo y azul) en entornos reales.
- Integracion con LeRobot para despliegue en laboratorio mediante el comando `lerobot-record`.
- Adaptacion eficiente mediante LoRA: no requiere cargar pesos completos de VLM de gran tamano, solo el adaptador y el repositorio base.
- Soporte de configuracion de camara y caracteristicas del robot a traves de la calibracion de LeRobot.
- Capacidad de ejecucion offline manteniendo la coherencia entre adaptador, base y metadatos en la misma revision.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo permite que un robot Franka Pico4 ejecute tareas de recogida y colocacion de objetos de colores especificos (rojo, amarillo, azul) en entornos reales, guiado por lenguaje natural.
- Investigacion en robotica VLA: sirve como punto de partida para experimentos con SmolVLA en configuraciones de bajo coste, ya que el adaptador LoRA reduce los requisitos de memoria frente a modelos completos.
- Evaluacion de politicas condicionadas por color: el adaptador esta especializado en la condicion `c2_red_yellow_blue_real`, lo que permite aislar el efecto del color en el rendimiento de la politica.
- Despliegue reproducible en robots Franka Pico4: el flujo de trabajo con LeRobot y los repositorios separados (adaptador, base, metadatos) facilita la replicacion del entorno en otros laboratorios.
- Desarrollo de sistemas de control por lenguaje: el modelo puede integrarse en pipelines de robotica que requieran interpretar instrucciones como "coge el objeto rojo" y traducirlas en secuencias de acciones.
- Formacion de nuevas politicas: el adaptador puede servir como inicializacion para fine-tuning en condiciones similares, aprovechando el conocimiento de manipulacion de objetos de colores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de robotica como tasa de exito en tareas de manipulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que es un adaptador LoRA sobre SmolVLA de 16 capas, los requisitos seran significativamente menores que un VLA completo, pero no se especifican cifras concretas.
- GPU recomendadas: no disponible. SmolVLA esta disenado para ser eficiente, por lo que es probable que funcione en GPUs de consumo medio, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: no confirmada. La ausencia de informacion sobre cuantizacion y tamano de pesos impide determinar si cabe en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: LeRobot (comando `lerobot-record`), con integracion del repositorio base y de metadatos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo es un adaptador LoRA especifico para una condicion de robotica, y no se conocen alternativas publicadas con las mismas caracteristicas (mismo robot, misma condicion de colores, mismo framework). Se podria comparar con otros adaptadores del mismo autor para condiciones diferentes (por ejemplo, `c1_red_yellow_blue_real` u otras), pero no estan documentados en la informacion proporcionada. Tampoco hay datos de rendimiento para comparar con otros VLA como OpenVLA o RT-2.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al estar entrenado para una condicion concreta (objetos rojos, amarillos y azules reales), su comportamiento fuera de ese escenario es impredecible.
- Riesgo de alucinacion: no aplica directamente, pero el modelo podria generar acciones incorrectas si la entrada visual o textual no coincide con la condicion de entrenamiento.
- Limitaciones de contexto e idioma: no se especifican los idiomas soportados ni la longitud de contexto; se asume que el modelo funciona con las instrucciones en ingles utilizadas en el entrenamiento de SmolVLA.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido.
- Dependencia de repositorios externos: el adaptador no funciona sin el repositorio base `Exile051112/franka-pico4-smolvla-base` y el de metadatos `Exile051112/franka-pico4-smolvlm2-metadata`. Si estos cambian o se eliminan, el adaptador queda inutilizable.
- Coherencia de versiones: es obligatorio mantener la misma revision entre adaptador, base y metadatos para evitar incompatibilidades.
- Uso fuera de laboratorio: el modelo esta disenado para un robot Franka Pico4 con calibracion especifica; su transferencia a otros robots o entornos requiere recalibracion y posiblemente reentrenamiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Exile051112/franka-pico4-smolvla-c2-red-yellow-blue-real
- Repositorio base (mencionado en la model card): https://huggingface.co/Exile051112/franka-pico4-smolvla-base
- Repositorio de metadatos (mencionado en la model card): https://huggingface.co/Exile051112/franka-pico4-smolvlm2-metadata
- Articulo de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de SmolVLA en Hugging Face: https://huggingface.co/blog/smolvla
