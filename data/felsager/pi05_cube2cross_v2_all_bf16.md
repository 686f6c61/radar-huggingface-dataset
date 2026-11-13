# felsager/pi05_cube2cross_v2_all_bf16

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para generalizar a entornos y situaciones no vistos durante el entrenamiento. Este repositorio concreto, `felsager/pi05_cube2cross_v2_all_bf16`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la libreria LeRobot de Hugging Face. El modelo resuelve una tarea de manipulacion robotica concreta: recoger un cubo de un color determinado y colocarlo sobre una cruz roja, usando un robot UR5e con pinza.

El modelo cuenta con 4.143.404.816 parametros (aproximadamente 4,1 mil millones) almacenados en formato safetensors bf16, con un tamano de repositorio de 24,5 GB. Consume observaciones compuestas por el estado del robot (vector de 10 dimensiones) y dos imagenes de camara (vista superior y vista de muneca, 3x480x640 cada una), y produce un vector de accion de 10 dimensiones. Es relevante ahora porque demuestra el flujo completo de fine-tuning de un VLA de proposito general sobre un dataset de imitacion pequeno y especifico, un patron cada vez mas comun en robotica open source.

La licencia es `gemma`, heredada del modelo base, lo que impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue productivo. El modelo no incluye resultados de evaluacion publicados en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, la implementacion en LeRobot del VLA π₀.₅ de Physical Intelligence, adaptada desde su repositorio OpenPI. π₀.₅ evoluciona π₀ con el objetivo de generalizar a entornos y situaciones completamente nuevos no vistos en entrenamiento. La arquitectura combina un backbone vision-language con un cabezal de acciones que mapea observaciones multimodales (estado del robot e imagenes) a comandos motores continuos. No se dispone de detalles adicionales sobre la composicion interna del transformer ni sobre el mecanismo de atencion en la informacion proporcionada.

El fine-tuning se realizo sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 frames a 30 FPS, con cuatro tareas de picking and placing de cubos de colores (azul, verde, amarillo y rojo) sobre una cruz roja. La configuracion de entrenamiento fue: 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 0, sobre LeRobot 0.6.2. No se especifica si hubo RLHF, DPO ni otras etapas de alineacion adicionales.

## Capacidades

- Control robotico de manipulacion: genera acciones de 10 dimensiones para un robot UR5e con pinza a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa simultaneamente dos camaras (vista superior y vista de muneca) a resolucion 480x640.
- Ejecucion de tareas de picking and placing condicionadas por instruccion en lenguaje natural (cuatro tareas de cubo sobre cruz).
- Politica de imitacion entrenada end-to-end sobre demostraciones reales.
- Integracion con el ecosistema LeRobot para rollout y entrenamiento via CLI (`lerobot-rollout`, `lerobot-train`).
- No se dispone de informacion sobre soporte de tool calling, agentes multi-paso, capacidades multilingues generales ni modos de razonamiento extendido, ya que es un modelo de accion y no un LLM conversacional.

## Casos de uso

- Automatizacion de picking and placing en laboratorio: el modelo ejecuta la tarea de recoger un cubo de color y depositarlo sobre una cruz roja, adecuado para prototipos de manipulacion en entornos controlados con un UR5e.
- Generacion de datos de evaluacion para investigacion en VLA: sirve como politica de referencia para comparar metodos de imitacion sobre el mismo dataset y robot.
- Base para fine-tuning con nuevos objetos o posiciones: al partir de `lerobot/pi05_base`, permite reentrenar con datasets propios siguiendo el flujo documentado de LeRobot.
- Demostraciones reproducibles en robotica open source: el repositorio incluye comandos de rollout completos que permiten replicar la inferencia en hardware real.
- Benchmarking de infraestructura de inferencia robotica: permite medir latencia y throughput de un VLA de 4,1 mil millones de parametros en bf16 sobre GPU.
- Educacion y formacion: ilustra el ciclo completo de recogida de datos, entrenamiento y despliegue de una politica de imitacion con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,3 GB solo para pesos (4,14 mil millones de parametros x 2 bytes), mas overhead de activaciones y buffers de imagen; se recomienda al menos 16 GB de VRAM para operar con margen.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para inferencia comoda en bf16; GPUs con 16 GB o mas (RTX 4080, RTX A4000) podrian ser suficientes segun el resto del pipeline.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM en bf16; en cuantizaciones menores no se dispone de pesos publicados en este repositorio.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), que es el metodo documentado; no se especifican integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_bf16 | 4.143.404.816 | no disponible | VLA manipulacion (UR5e) | gemma | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA proposito general | gemma | Hugging Face |
| π₀ (Pi0) | no disponible | no disponible | VLA proposito general | no disponible | OpenPI (Physical Intelligence) |

La comparativa se limita a los modelos citados en la informacion disponible; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Especializacion estrecha: la politica esta entrenada exclusivamente para cuatro tareas de cubos sobre cruz con un robot UR5e y una configuracion de camaras concreta; no generalizara a otros objetos, robots o disposiciones sin reentrenamiento.
- Sin resultados de evaluacion: no hay tasas de exito publicadas, por lo que se desconoce su fiabilidad real en produccion.
- Dependencia de hardware: requiere un UR5e con pinza y dos camaras con nombres e indices que coincidan con las claves de observacion (`observation.images.top`, `observation.images.wrist`).
- Licencia `gemma`: impone restricciones de uso comercial heredadas del modelo base; es obligatorio revisar los terminos de la Gemma License antes de cualquier despliegue comercial.
- Riesgo de alucinacion motora: como toda politica de imitacion, puede generar acciones fuera de distribucion ante estados visuales no vistos, con riesgo para el robot y el entorno.
- Sesgos de dataset: 1000 episodios de un unico entorno fisico implican sesgo hacia condiciones de iluminacion, posiciones y distractores presentes en la recogida de datos.
- Idiomas: no se dispone de informacion sobre capacidades multilingues; las instrucciones de tarea estan en ingles.
- Sin cuantizaciones publicadas: solo se ofrecen pesos bf16, lo que limita el despliegue en hardware de baja VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_bf16
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
