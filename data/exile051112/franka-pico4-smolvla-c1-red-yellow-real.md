# Exile051112/franka-pico4-smolvla-c1-red-yellow-real

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo SmolVLA, un modelo de visión-lenguaje-acción (VLA) eficiente desarrollado por Hugging Face. El adaptador, creado por el usuario Exile051112, está diseñado específicamente para la condición `c1_red_yellow_real` (objetos rojos y amarillos reales) en un robot Franka equipado con cámara Pico4. Se integra con el ecosistema LeRobot, cargándose junto con el repositorio base `Exile051112/franka-pico4-smolvla-base` y la configuración de metadatos `Exile051112/franka-pico4-smolvlm2-metadata`.

La relevancia de este adaptador radica en que demuestra cómo personalizar un VLA de tamaño reducido (SmolVLA tiene aproximadamente 1.5B parámetros, aunque el dato exacto no se confirma en la información disponible) para tareas de manipulación robótica específicas, sin necesidad de entrenar un modelo completo. El tamaño del repositorio es de 0.0 GB, lo que indica que solo contiene los pesos del adaptador LoRA, no el modelo base completo. La licencia no está especificada, y no se proporcionan datos sobre idiomas soportados ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre SmolVLA (VLA basado en SmolVLM2, 16 capas) |
| Parametros totales | no disponible (el adaptador LoRA es pequeño; el modelo base SmolVLA tiene ~1.5B, sin confirmar) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors para PEFT) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en SmolVLA, un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje pequeño (SmolVLM2) y un modulo de accion para generar comandos de control robotico a partir de observaciones visuales e instrucciones en lenguaje natural. SmolVLA esta disenado para ser eficiente y ejecutarse en hardware asequible, a diferencia de otros VLA mas grandes. El adaptador LoRA se entrena sobre el modelo base con datos de demostracion especificos para la condicion `c1_red_yellow_real`, que implica la manipulacion de objetos rojos y amarillos en un entorno real con un robot Franka y camara Pico4. No se proporcionan detalles sobre el dataset de entrenamiento, hiperparametros, ni el regimen de entrenamiento (fp16, bf16, etc.). La integracion con LeRobot sugiere que el entrenamiento se realizo siguiendo el flujo de trabajo de LeRobot para politicas VLA.

## Capacidades

- Control robotico de manipulacion: genera acciones de control (posiciones de articulaciones o efector final) a partir de imagenes y texto.
- Especifico para la condicion `c1_red_yellow_real`: disenado para tareas que involucran objetos rojos y amarillos reales, probablemente recogida o colocacion de objetos.
- Integracion con LeRobot: se carga como politica en el framework LeRobot, permitiendo su uso en robots reales o simulados.
- No se documentan capacidades adicionales como tool calling, agentes, o soporte multilingue.

## Casos de uso

- Manipulacion robotica en laboratorio: el adaptador permite que un robot Franka realice tareas de recogida y colocacion de objetos rojos y amarillos, guiado por instrucciones en lenguaje natural, gracias a la integracion con LeRobot.
- Investigacion en VLA eficientes: sirve como ejemplo de como adaptar un modelo base pequeno a una tarea especifica con un coste de entrenamiento reducido, util para grupos de investigacion con recursos limitados.
- Despliegue en entornos de produccion robotica: al ser un adaptador LoRA, puede actualizarse o cambiarse rapidamente sin reentrenar el modelo completo, facilitando iteraciones en entornos industriales o academicos.
- Evaluacion de politicas VLA en robots reales: permite probar el rendimiento de SmolVLA en un escenario fisico concreto, comparando con otros VLA o con politicas clasicas.
- Educacion y formacion en robotica: puede usarse en cursos o talleres para ensenar el flujo de trabajo de LeRobot y el ajuste fino de VLA con PEFT.
- Reproducibilidad de experimentos: al estar publicados los adaptadores y el modelo base, otros investigadores pueden reproducir los resultados y extenderlos a otras condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre tasas de exito, metricas de control, ni comparaciones con otros modelos en tareas de manipulacion. Se recomienda consultar el paper de SmolVLA (arxiv 2506.01844) para resultados generales del modelo base, pero no hay datos especificos para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen principalmente del modelo base SmolVLA. SmolVLA esta disenado para ser eficiente y ejecutarse en GPUs de consumo, aunque no se especifican requisitos exactos en la informacion disponible.
- Para inferencia con LeRobot, se necesita una GPU con al menos 8-12 GB de VRAM para el modelo base (estimacion basada en el tamano de ~1.5B parametros en precision fp16), aunque no se confirma.
- El adaptador LoRA anade una sobrecarga minima de memoria.
- Opciones de despliegue: LeRobot (framework principal), posiblemente vLLM o TGI si se usa como modelo de lenguaje, pero no se documenta.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No hay informacion suficiente para realizar una comparativa con otros modelos. El adaptador es especifico para una tarea y no se conocen alternativas publicadas con la misma condicion. Se podria comparar con otros VLA como OpenVLA o RT-2, pero no se dispone de datos de rendimiento de este adaptador en tareas equivalentes.

## Limitaciones y advertencias

- Especificidad de la tarea: el adaptador solo funciona para la condicion `c1_red_yellow_real`; no es generalizable a otros colores, objetos o entornos sin reentrenamiento.
- Dependencia del modelo base: requiere el repositorio base `Exile051112/franka-pico4-smolvla-base` y los metadatos `Exile051112/franka-pico4-smolvlm2-metadata`; si estos cambian, el adaptador puede no funcionar.
- Licencia no especificada: no se indica si el adaptador puede usarse comercialmente; se recomienda contactar al autor antes de usarlo en produccion.
- Sin datos de evaluacion: no hay evidencia publica de que el adaptador funcione correctamente en entornos distintos al del laboratorio del autor.
- Riesgo de alucinacion en instrucciones: como cualquier VLA, puede malinterpretar instrucciones ambiguas, aunque no se documentan casos concretos.
- Sesgos: no se han evaluado sesgos relacionados con colores, iluminacion o variaciones del entorno.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Exile051112/franka-pico4-smolvla-c1-red-yellow-real
- Repositorio base (modelo completo): https://huggingface.co/Exile051112/franka-pico4-smolvla-base
- Repositorio de metadatos VLM: https://huggingface.co/Exile051112/franka-pico4-smolvlm2-metadata
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Repositorio LeRobot (framework): https://github.com/zyqdragon/lerobot_smolvla (y https://github.com/wolfcanli/lerobot_franka)
