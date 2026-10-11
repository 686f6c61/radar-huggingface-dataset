# RoboColosseum/DROID-models

## Resumen

DROID-models es una coleccion publicada por RoboColosseum en HuggingFace que reune cinco modelos de vision-lenguaje-accion (VLA) ajustados para tareas de manipulacion robotica sobre el brazo Franka, dentro del benchmark RoboColosseum. El repositorio, de 60,8 GB y asociado a la libreria LeRobot, no contiene un unico modelo, sino varias variantes organizadas en la jerarquia `<modelo>/<tarea>/`, cada una con los pesos de inferencia de la ultima epoca y los ficheros de configuracion necesarios para cargar el modelo.

Los cinco VLAs se ajustan desde checkpoints base publicos: GR00T N1.7 de 3B (NVIDIA), π0.5 (openpi), G0.5 (OpenGalaxea), MolmoAct2 (Allen AI) y LingBot-VLA v2 de 6B. Todos emplean la misma receta y las mismas tasas de aprendizaje que el repositorio hermano BimanualYAM-models, con entrenamiento en 2 GPU durante 5 epocas. Las tareas cubiertas son MugOnCoaster y CloseLaptop, registradas a 30 fps con camaras exteriores izquierda y derecha y camara de muneca.

Su relevancia actual reside en que ofrece pesos de inferencia listos para tareas de manipulacion concretas y una comparativa controlada entre arquitecturas VLA punteras bajo un protocolo de ajuste identico. No se especifica el idioma de los modelos ni se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en transformer; codificador de vision, backbone de lenguaje y cabeza/experto de accion (los detalles varian por modelo base) |
| Parametros totales | Variable por modelo: GR00T N1.7 ~3B y LingBot-VLA v2 ~6B; π0.5, G0.5 y MolmoAct2 no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cada variante es un modelo de vision-lenguaje-accion (VLA) que combina un codificador visual con un backbone de lenguaje y una cabeza o experto de accion que produce posiciones articulares. La receta de ajuste actua sobre distintas partes segun el modelo: en GR00T N1.7 se entrena de forma completa el backbone VLM (LLM y vision) junto con la cabeza de accion; en π0.5 se ajusta el modelo completo de openpi con EMA 0.99; en G0.5 se entrena todo con FSDP y una tasa de aprendizaje de vision reducida a x0.1; en MolmoAct2 se usa una tasa distinta por componente (LLM 2e-5, ViT 1e-5, conector 1e-5, experto de accion 1e-4); y en LingBot-VLA v2 se entrena todo con optimizador Muon.

La entrada sensorial combina camaras exteriores izquierda y derecha y camara de muneca, todas a 360x640. El estado y la accion se representan como 8 posiciones articulares absolutas (7 del brazo Franka mas 1 del gripper). El entrenamiento usa pesos maestros en fp32 con computo en bf16, se ejecuta en 2 GPU H100 o H200 por ejecucion y dura 5 epocas en todos los casos. Los registros de entrenamiento estan en el proyecto de W&B `shaileshxml-nus/RoboColosseum`.

| Modelo | Camaras | Partes entrenadas | GBS | LR maxima |
|---|---|---|---|---|
| GR00T N1.7 | left, wrist | Completo: backbone VLM (LLM + vision) + cabeza de accion | 32 | 1e-4, cosine, 5% warmup |
| π0.5 | left, wrist | Completo (openpi), EMA 0.99 | 32 | 2.5e-5, cosine a 2.5e-6, 1k warmup |
| G0.5 | left, wrist | Completo (vision LR x0.1), FSDP | 16 | 4e-5, cosine, 200 warmup, wd 0.03 |
| MolmoAct2 | left, right, wrist | Completo | 64 | LLM 2e-5, ViT 1e-5, conector 1e-5, experto de accion 1e-4 |
| LingBot-VLA v2 | left, right, wrist | Completo | 32 | 1.25e-5, constante, Muon |

## Capacidades

- Generacion de acciones de manipulacion robotica en formato de 8 posiciones articulares absolutas (7 del brazo Franka mas 1 del gripper).
- Percepcion visual multi-camara (exterior izquierda, exterior derecha y muneca, a 360x640), segun la configuracion de cada modelo.
- Ejecucion de tareas guiadas por instruccion en lenguaje natural: "mug on coaster" (MugOnCoaster) y "close laptop" (CloseLaptop).
- Ajuste por imitacion a partir de demostraciones: cada tarea se define con 100 episodios (41.227 frames en MugOnCoaster, 27.649 frames en CloseLaptop).
- Inferencia a 30 fps conforme al formato de datos de LeRobot v3.0.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible, no se especifica idioma.
- Modos especiales (thinking, vision adicional, audio): no disponible.

## Casos de uso

- Manipulacion de objetos sobre superficie: el modelo GR00T N1.7 ajustado a MugOnCoaster permite colocar una taza sobre un posavasos a partir de la instruccion "mug on coaster", usando las camaras exteriores y de muneca.
- Cierre de portatiles en entornos de laboratorio: las variantes ajustadas a CloseLaptop (GR00T N1.7 y π0.5) ejecutan la instruccion "close laptop" sobre un brazo Franka con acciones de 8 grados de libertad.
- Investigacion comparativa de arquitecturas VLA: al compartir receta, tareas y numero de epocas, la coleccion permite comparar GR00T N1.7, π0.5, G0.5, MolmoAct2 y LingBot-VLA v2 bajo condiciones controladas.
- Reentrenamiento o ajuste fino sobre tareas propias: los pesos de la ultima epoca y los ficheros de configuracion permiten partir de estos checkpoints para nuevas tareas de manipulacion con Franka.
- Prototipado en robotica de imitacion end-to-end: util para validar pipelines de vision-lenguaje-accion con datos a 30 fps y multiples camaras antes de escalar a produccion.
- Estudio de transferencia de modelos base a tareas especificas: dado que cada variante parte de un checkpoint publico distinto (NVIDIA, openpi, OpenGalaxea, Allen AI, robbyant), sirve para analizar el comportamiento de cada base cuando se ajusta a un mismo par de tareas.
- Evaluacion en el benchmark RoboColosseum: los pesos estan pensados para alimentar dicho benchmark de manipulacion, por lo que funcionan como punto de partida para reproducir sus evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento (segun la model card): 2 GPU por ejecucion, H100 o H200, con pesos maestros en fp32 y computo en bf16, durante 5 epocas.
- Tamano del repositorio: 60,8 GB en total (incluye los cinco modelos y sus tareas).
- VRAM estimada para inferencia: no disponible como dato oficial; de forma orientativa y a partir del recuento de parametros en bf16, el modelo de 3B (GR00T N1.7) rondaria los 6-7 GB y el de 6B (LingBot-VLA v2) unos 12 GB, sin contar buffers de activaciones ni el coste de las camaras.
- GPU recomendadas: no disponible de forma explicita para inferencia; el entrenamiento se realizo en H100 y H200.
- Compatibilidad con GPU de consumo: no disponible; no se confirma soporte en RTX 4090 u otras GPU de gama consumer.
- Opciones de despliegue: el repositorio usa la libreria LeRobot; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI (orientadas a LLM de texto y no necesariamente aplicables a VLA con cabeza de accion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa interna entre las cinco variantes VLA incluidas en la coleccion (misma receta, mismo par de tareas, mismo protocolo de 5 epocas):

| Modelo (carpeta) | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 (`gr00t/`) | `nvidia/GR00T-N1.7-3B` | ~3B | no disponible | other | MugOnCoaster y CloseLaptop |
| π0.5 (`pi05/`) | `gs://openpi-assets/checkpoints/pi05_base` | no disponible | no disponible | other | CloseLaptop |
| G0.5 (`g05/`) | `OpenGalaxea/G05` (g05-base) | no disponible | no disponible | other | ninguna tarea subida |
| MolmoAct2 (`molmoact2/`) | `allenai/MolmoAct2` | no disponible | no disponible | other | MugOnCoaster |
| LingBot-VLA v2 6B (`lingbot-vla-v2/`) | `robbyant/lingbot-vla-v2-6b` | ~6B | no disponible | other | MugOnCoaster |

## Limitaciones y advertencias

- Licencia "other": no se detallan los terminos exactos, por lo que hay que revisar las condiciones del repositorio y de cada checkpoint base antes de cualquier uso comercial.
- Se desconoce el idioma o idiomas soportados; no hay informacion sobre capacidades multilingues.
- No se han publicado resultados de benchmarks, por lo que no es posible cuantificar el rendimiento frente a alternativas.
- El alcance es muy especifico: cada variante esta ajustada a una sola tarea de manipulacion (MugOnCoaster o CloseLaptop) sobre brazo Franka, con 100 episodios por tarea, lo que limita la generalizacion mas alla de esos escenarios.
- La coleccion esta incompleta: G0.5 no tiene tareas subidas y varias combinaciones modelo/tarea figuran como pendientes de entrenamiento o en cola.
- Riesgo de alucinacion y sesgos: no disponible; no se documentan en la informacion proporcionada.
- Sin datos de contexto maximo ni de tipos de cuantizacion, no es posible planificar despliegues con memoria ajustada a partir de la informacion publicada.
- Los pesos estan orientados a inferencia sobre robots Franka con estado y accion de 8 dimensiones; su reutilizacion fuera de ese formato requiere adaptacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RoboColosseum/DROID-models
- Repositorio hermano (misma receta y LR): https://huggingface.co/RoboColosseum/BimanualYAM-models
- Dataset MugOnCoaster: https://huggingface.co/datasets/aarontung/droid-mug-on-coaster
- Dataset CloseLaptop: https://huggingface.co/datasets/aarontung/droid-close-laptop
- Checkpoint base GR00T N1.7: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint base MolmoAct2: https://huggingface.co/allenai/MolmoAct2
- Checkpoint base LingBot-VLA v2 6B: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Checkpoint base G0.5: https://huggingface.co/OpenGalaxea/G05
- Logs de entrenamiento (W&B): https://wandb.ai/shaileshxml-nus/RoboColosseum
