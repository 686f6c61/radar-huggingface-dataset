# AndreGaio/pi05_packing_lora

## Resumen

El modelo `AndreGaio/pi05_packing_lora` es un adaptador LoRA de fine-tuning sobre π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para la generalización en entornos abiertos. La implementación se apoya en el ecosistema LeRobot de Hugging Face, que adapta el repositorio OpenPI de Physical Intelligence. El adaptador se ha entrenado para una tarea concreta de manipulación robótica: cargar gomas de borrar en un contenedor, utilizando un robot tipo `so_follower` con tres cámaras (frontal, superior y de muñeca).

El modelo base `lerobot/pi05_base` es un VLA de aproximadamente 3 mil millones de parámetros, compuesto por un backbone PaliGemma-2B y un experto de acción de 300 millones de parámetros, según referencias de la comunidad. El adaptador LoRA, de solo 0.1 GB, se ha subido al Hub de Hugging Face bajo licencia Apache 2.0 y está listo para ser usado con LeRobot. Su relevancia radica en demostrar un flujo completo de entrenamiento por imitación con una cantidad muy reducida de datos (50 episodios, 134.745 frames) y un ajuste de 1000 pasos, lo que lo convierte en un ejemplo práctico de fine-tuning eficiente de un modelo VLA en un dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en PaliGemma-2B con experto de accion de 300M (π0.5) |
| Parametros totales | 3B (segun referencia de la arquitectura base; el adaptador LoRA es de 0.1 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el modelo base `lerobot/pi05_base`, que implementa π0.5, un VLA con un backbone de vision-lenguaje (PaliGemma de 2B) y un experto de accion de 300 millones de parametros. Segun la referencia del proyecto `pi05-lora-finetune-libero`, el fine-tuning LoRA se aplica inyectando adaptadores en ambos modulos: rango 16 en el backbone PaliGemma y rango 32 en el experto de accion. Sin embargo, en este repo concreto no se especifican los rangos de LoRA utilizados; solo se indica que es un fine-tuning de `lerobot/pi05_base`.

El entrenamiento se realizo con LeRobot 0.6.2, un optimizador AdamW, una tasa de aprendizaje de 0.0001, batch size de 8 y 1000 pasos de entrenamiento, con una semilla fija de 1000. El dataset de entrenamiento, `AndreGaio/test-packing_3cam_20260605_140000`, contiene 50 episodios y 134.745 frames a 30 FPS, con la tarea "Load erasers into bin". No se menciona el uso de RLHF, DPO ni otras tecnicas de post-entrenamiento; es un ajuste de imitacion puro.

## Capacidades

- Control de robot manipulador: genera acciones de 6 dimensiones (posicion y orientacion del efector) a partir de observaciones de estado y vision.
- Percepcion multimodal: procesa tres flujos de imagen (frontal, superior y de muñeca) con resoluciones de 640x480 y 480x640.
- Aprendizaje por imitacion: ejecuta la tarea especifica de cargar gomas en un contenedor, aprendida de demostraciones humanas.
- Integracion con LeRobot: compatible con el pipeline de rollout y entrenamiento de LeRobot para robots tipo `so_follower`.
- Fine-tuning eficiente: al ser un adaptador LoRA, permite actualizaciones de bajo costo sobre el modelo base π0.5.
- Sin capacidades de generacion de texto o razonamiento general: es un modelo de accion visual, no un LLM generativo.

## Casos de uso

- Automatizacion de tareas de empaquetado en entornos industriales: el modelo puede controlar un robot para colocar objetos pequeños (gomas) en contenedores, reduciendo la intervencion manual en lineas de montaje.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo de fine-tuning de un VLA con datos muy limitados (50 episodios), util para estudiar la transferencia de politicas de robot.
- Prototipado de soluciones roboticas en laboratorio: permite validar rapidamente la viabilidad de un sistema de manipulacion antes de escalar a tareas mas complejas.
- Demostracion de integracion LeRobot: se puede ejecutar con `lerobot-rollout` para probar el control del robot en tiempo real, evaluando la precision de la tarea.
- Base para experimentos de generalizacion: al ser un adaptador, se puede combinar con otros LoRA para adaptar el mismo modelo base a multiples tareas de manipulacion.
- Educacion en robotica: util para ensenar flujos de trabajo de captura de datos, entrenamiento de politicas y despliegue en robots fisicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion del robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- El adaptador LoRA ocupa solo 0.1 GB, pero el modelo base π0.5 de 3B requiere una GPU con al menos 8-12 GB de VRAM para inferencia en precision FP16 (estimacion orientativa, no confirmada por el autor).
- La referencia de fine-tuning de π0.5 en el proyecto `pi05-lora-finetune-libero` menciona que el entrenamiento de 30k pasos con batch 64 tarda unas 58 horas en una GPU A100, lo que sugiere que el modelo base necesita al menos 40 GB de VRAM para entrenamiento completo.
- Para inferencia en tiempo real con LeRobot, se recomienda una GPU de nivel de centro de datos como A100 o H100, aunque podria caber en GPUs de consumo como RTX 4090 (24 GB) si se usa cuantizacion o offloading de memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), que usa PyTorch y CUDA. Tambien es posible usar el framework OpenPI (JAX) para otros flujos de trabajo.
- No se dispone de datos de latencia o throughput especificos para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AndreGaio/pi05_packing_lora` | Adaptador LoRA de π0.5 | 3B (base) | no disponible | Apache-2.0 | Hugging Face |
| `andlyu/pi05_pack3_lora` | Adaptador LoRA de π0.5 | 3B (base) | no disponible | Apache-2.0 | Hugging Face |
| `lerobot/pi05_base` | Modelo base VLA | 3B | no disponible | Apache-2.0 | Hugging Face |

La comparacion se limita a otros adaptadores del mismo modelo base; no se han encontrado modelos de la misma categoria con datos de rendimiento publicados. El adaptador de `andlyu` parece tener una tarea similar (packing), pero no se dispone de detalles de su entrenamiento.

## Limitaciones y advertencias

- Dataset muy pequeno (50 episodios) y entrenamiento corto (1000 pasos), lo que aumenta el riesgo de sobreajuste y limita la generalizacion a variaciones de la tarea no vistas en el entrenamiento.
- No se han proporcionado resultados de evaluacion en robot real; el rendimiento en el mundo fisico no esta verificado.
- La tarea esta restringida a un unico tipo de objeto (gomas) y un robot especifico (`so_follower`), por lo que no es directamente transferible a otros robots o tareas sin reentrenamiento.
- Riesgo de alucinacion en la accion si las condiciones de iluminacion o posicion de las camaras difieren de las del dataset de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base π0.5 puede tener restricciones adicionales de Physical Intelligence; se debe revisar la licencia del modelo base.
- No se incluye informacion sobre sesgos, pero al ser un modelo de control robotico, los sesgos se manifiestan en la robustez de las acciones ante variaciones del entorno.
- El adaptador solo es util con el modelo base `lerobot/pi05_base`; no funciona de forma autonoma.

## Enlaces

- [Hugging Face - AndreGaio/pi05_packing_lora](https://huggingface.co/AndreGaio/pi05_packing_lora)
- [Dataset de entrenamiento - AndreGaio/test-packing_3cam_20260605_140000](https://huggingface.co/datasets/AndreGaio/test-packing_3cam_20260605_140000)
- [Modelo base - lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Pagina de Pi0.5 de Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [LeRobot - GitHub](https://github.com/huggingface/lerobot)
- [Proyecto de referencia de fine-tuning LoRA de π0.5 - Yaneosian/pi05-lora-finetune-libero](https://github.com/Yaneosian/pi05-lora-finetune-libero)
