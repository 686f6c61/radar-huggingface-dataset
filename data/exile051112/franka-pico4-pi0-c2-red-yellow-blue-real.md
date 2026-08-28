# Exile051112/franka-pico4-pi0-c2-red-yellow-blue-real

## Resumen

Este repositorio contiene un adaptador PEFT LoRA para el modelo base `lerobot/pi0_base`, desarrollado por el usuario Exile051112. Se trata de un ajuste fino especifico para control robotico de un brazo Franka equipado con una camara Pico4, entrenado para la tarea `c2_red_yellow_blue_real` (manipulacion de objetos de colores rojo, amarillo y azul en un entorno real). El adaptador no es un modelo autonomo, sino que debe cargarse sobre el modelo base gated `lerobot/pi0_base` mediante la libreria LeRobot.

El modelo resuelve el problema de generar acciones de control (TCP de 10 dimensiones) a partir de observaciones visuales de dos camaras (top y wrist) y un estado de 17 dimensiones. Su relevancia radica en ser un ejemplo de aplicacion de aprendizaje por imitacion con arquitecturas VLA (Vision-Language-Action) en robotica real, aunque su alcance esta limitado a la tarea y configuracion especificas para las que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `lerobot/pi0_base` (arquitectura del modelo base no especificada) |
| Parametros totales | No disponible (el adaptador pesa 5.6 MB, pero no se indica el numero de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en bfloat16, pero no se especifican cuantizaciones para inferencia) |
| Idiomas soportados | No disponible (modelo de robotica, no de lenguaje) |
| Licencia | Gemma |
| Formato de pesos | Safetensors (`adapter_model.safetensors`), junto con configuracion JSON y tokenizer |

## Arquitectura y entrenamiento

El adaptador se entrena como un LoRA (Low-Rank Adaptation) sobre el modelo base `lerobot/pi0_base`, que es un modelo VLA de la familia pi0. El entrenamiento se realizo con PyTorch LeRobot durante 10,000 pasos, con un batch size de 4, precision bfloat16 y gradient checkpointing. El dataset utilizado es `c2_red_yellow_blue_real`, que corresponde a una tarea de manipulacion de objetos de colores en un entorno real con un brazo Franka y una camara Pico4. La configuracion del adaptador usa `r=16` y `lora_alpha=16`. No se proporcionan detalles adicionales sobre la arquitectura interna del modelo base ni sobre el proceso de entrenamiento (como tecnicas de RLHF o DPO).

## Capacidades

- Generacion de acciones de control TCP (10 dimensiones) para un brazo robotico Franka.
- Procesamiento de dos flujos de imagen RGB (camara superior y camara de muneca) junto con un estado de 17 dimensiones.
- Ejecucion de tareas de manipulacion especificas (recogida y colocacion de objetos de colores) en un entorno real.
- Integracion con el ecosistema LeRobot para cargar y ejecutar politicas de robotica.
- No incluye capacidades de lenguaje, vision general, tool calling ni razonamiento multimodal fuera del ambito robotico.

## Casos de uso

- Manipulacion robotica de objetos de colores: el adaptador permite que un brazo Franka identifique y manipule objetos rojos, amarillos y azules en una configuracion real, generando acciones TCP precisas a partir de las imagenes de las camaras.
- Tareas de pick and place en entornos controlados: adecuado para automatizar procesos de recogida y colocacion de piezas en lineas de montaje o laboratorios, siempre que la configuracion de camaras y estado coincida con la entrenada.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo de como adaptar un modelo VLA base a una tarea especifica con LoRA, util para estudios comparativos de eficiencia de parametros.
- Desarrollo de politicas de control para robots Franka: el adaptador puede servir como punto de partida para transferir el aprendizaje a tareas similares, aunque requiere reentrenamiento para nuevas configuraciones.
- Prototipado rapido en robotica: al ser un adaptador ligero (5.6 MB), permite iterar rapidamente sobre el modelo base sin necesidad de reentrenar todos los parametros.
- Automatizacion de procesos de clasificacion por color: en entornos industriales donde se requiere separar objetos por color, el modelo puede integrarse en un sistema de control robotico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de informacion especifica sobre requisitos de VRAM, GPUs recomendadas o latencia.
- Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base `lerobot/pi0_base`, que es un modelo VLA de gran tamano (no se especifican sus requisitos). Se asume que se necesita una GPU con suficiente memoria para el modelo base, aunque no se proporcionan datos concretos.
- El despliegue se realiza mediante la libreria LeRobot, que soporta PyTorch. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generico.

## Comparativa con modelos similares

No disponible. No se ha proporcionado informacion sobre otros adaptadores o modelos comparables en la misma categoria.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo; requiere el modelo base `lerobot/pi0_base`, que esta sujeto a control de acceso (gated) en Hugging Face.
- Esta entrenado exclusivamente para la tarea `c2_red_yellow_blue_real` con una configuracion especifica de camaras (top y wrist), estado de 17 dimensiones y accion TCP de 10 dimensiones. Cualquier variacion en la configuracion del robot o del entorno puede invalidar su funcionamiento.
- No se han documentado sesgos, pero al ser un modelo de robotica, su comportamiento depende de los datos de entrenamiento y puede fallar ante objetos o condiciones no vistas.
- La licencia Gemma puede imponer restricciones de uso comercial; se recomienda revisar los terminos de la licencia antes de su despliegue en produccion.
- Es necesario validar la calibracion de camaras, el orden de los estados y acciones, y los limites de seguridad antes de usar el modelo en un robot real.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Exile051112/franka-pico4-pi0-c2-red-yellow-blue-real
- Modelo base (gated): https://huggingface.co/lerobot/pi0_base
