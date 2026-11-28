# Autism-Skill-Issue/pi05-lora-napkin-clean-tradeshow-ur12e-3cam-60fps-policy-20000

## Resumen

`pi05-lora-napkin-clean-tradeshow-ur12e-3cam-60fps-policy-20000` es un checkpoint de entrenamiento de robótica publicado en Hugging Face por el usuario Autism-Skill-Issue. Se trata de una política de control visuomotor derivada de pi0.5 (pi05), el modelo vision-language-action (VLA) de Physical Intelligence, adaptada mediante LoRA a una tarea concreta: la limpieza de servilletas ("napkin clean") en un entorno de feria o exposición ("tradeshow"), sobre un brazo robótico Universal Robots UR12e con tres cámaras y captura a 60 fps. El checkpoint corresponde al paso 20000 de entrenamiento.

El modelo no es un LLM de propósito general, sino una política de imitación que mapea observaciones visuales y de estado del robot a acciones de control de bajo nivel. Su relevancia es acotada: sirve como artefacto reproducible para quien quiera desplegar o continuar el entrenamiento de esta tarea específica con el framework openpi, y como ejemplo de adaptación LoRA de un VLA de gran tamaño a un dominio robótico concreto.

La información pública disponible es mínima: la model card solo documenta el contenido del repositorio (`params/` y `assets/`), el comando de descarga y el comando de servicio. No se publican detalles de arquitectura, dataset, hiperparámetros ni resultados de evaluación, por lo que muchos campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5 (pi05) con adaptadores LoRA; detalles internos no disponibles |
| Parametros totales | no disponible (tamano del repo: 6,3 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | no disponible |
| Formato de pesos | pesos en `params/` para el framework openpi; formato de serialización no especificado |

## Arquitectura y entrenamiento

El modelo se basa en pi0.5 (pi05), un modelo vision-language-action de Physical Intelligence que combina un backbone de visión-lenguaje con un experto de acción para generar comandos motores a partir de imágenes y del estado del robot. En este caso se ha aplicado un ajuste fino con LoRA (low-rank adaptation) sobre la tarea "napkin clean" en un escenario de feria, con tres cámaras a 60 fps y un brazo UR12e.

El entrenamiento se realizó con el framework openpi, que gestiona el pipeline de datos, la normalización (guardada en `assets/`) y el servicio de políticas (`serve_policy.py`). No se especifican en la información disponible el número de tokens o episodios de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RL o solo imitación supervisada. El checkpoint corresponde al paso 20000.

## Capacidades

- Control visuomotor de un brazo robótico UR12e para la tarea específica de limpiar servilletas en un entorno de exposición.
- Consumo de observaciones de tres cámaras a 60 fps y del estado del robot.
- Generación de acciones de control de bajo nivel (trayectorias del efector final) mediante inferencia de política.
- Servicio como política desplegable a través de `scripts/serve_policy.py` de openpi.
- Punto de partida para ajuste fino adicional o evaluación en tareas similares.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni razonamiento simbólico.

## Casos de uso

- Reproducción de experimentos: cargar el checkpoint con el comando de descarga y servirlo con openpi para replicar el comportamiento entrenado en el paso 20000, útil para auditar resultados de un pipeline de entrenamiento.
- Demostración en feria o exposición: desplegar la política en un UR12e con tres cámaras para ejecutar la tarea de limpieza de servilletas como demo interactiva.
- Ajuste fino posterior: usar el checkpoint como inicialización LoRA para entrenar variantes de la misma tarea con cambios de iluminación, disposición de objetos o cámaras.
- Evaluación comparativa de políticas VLA: comparar el rendimiento de esta adaptación LoRA frente a otras políticas pi0.5 o pi0 en el mismo entorno UR12e.
- Generación de datos sintéticos: ejecutar la política en simulación o en bucle abierto para producir trayectorias de referencia que alimenten otros entrenamientos.
- Integración en pipelines de robótica de investigación: incorporar el servicio de política en un stack ROS/openpi para pruebas de control en laboratorio.
- Estudio de robustez de LoRA en VLA: analizar cómo un adaptador de bajo rango afecta al comportamiento de un modelo base grande en una tarea física concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 6,3 GB, lo que da una cota inferior aproximada del espacio necesario para pesos en precisión nativa, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es plausible que requiera GPUs de gama alta (A100, H100 o RTX 4090), pero no hay confirmación en la información.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: el autor documenta únicamente `scripts/serve_policy.py` del framework openpi, que requiere un checkout local de openpi y la configuración de entrenamiento correspondiente (`pi05-lora-napkin-clean-tradeshow-ur12e-3cam-60fps-policy`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles; la captura a 60 fps sugiere requisitos de tiempo real, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-lora-napkin-clean-tradeshow-ur12e-3cam-60fps-policy-20000 | Política VLA pi0.5 con LoRA | no disponible | no disponible | no disponible | Hugging Face (openpi) |
| pi0.5 (base, Physical Intelligence) | VLA base | no disponible en esta ficha | no disponible | no disponible en esta ficha | Referencia pública de Physical Intelligence |
| Otras políticas openpi para UR12e | Políticas VLA ajustadas | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("napkin clean") en un entorno de feria con un UR12e y tres cámaras a 60 fps; no se espera que generalice a otras tareas, robots o configuraciones de cámara.
- Sin licencia declarada: la ausencia de licencia impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Sin evaluación publicada: no hay métricas de éxito, robustez ni análisis de fallos, lo que impide valorar su fiabilidad.
- Riesgo de sobreajuste al entorno: al ser un ajuste LoRA sobre una tarea concreta, es probable que sea sensible a cambios de iluminación, fondo, posición de objetos o calibración de cámaras.
- Dependencia de openpi: el despliegue requiere un checkout local de openpi y la configuración de entrenamiento exacta; no es un artefacto autónomo.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; en robótica, los fallos de política pueden provocar colisiones o daños físicos, por lo que se recomienda supervisión y límites de seguridad en el robot.
- Fecha de creación futura (2026-11-28) en los metadatos: conviene verificar la autenticidad y el estado del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/Autism-Skill-Issue/pi05-lora-napkin-clean-tradeshow-ur12e-3cam-60fps-policy-20000
- Framework openpi (referencia del autor, sin enlace directo en la model card): no disponible
- Paper de pi0.5 / Physical Intelligence: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible
