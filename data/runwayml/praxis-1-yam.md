# runwayml/praxis-1-yam

## Resumen

Praxis-1 YAM es una política robótica de tipo video-diffusion desarrollada por RunwayML, afinada específicamente para la plataforma bimanual YAM (dos brazos YAM, una cámara cenital y dos cámaras de muñeca). Se trata de un modelo de 27.202.463.488 parámetros (aproximadamente 27,2 mil millones) con arquitectura Mixture of Experts (MoE) que combina un tronco causal por chunks con un experto de acción de unos 0,3 mil millones de parámetros. El modelo parte de `runwayml/praxis-1-base` y se distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema de generar secuencias de acciones motoras para un robot bimanual a partir de instrucciones en lenguaje natural e imágenes de varias cámaras. En lugar de predecir acciones paso a paso, emite chunks de 24 pasos a 15 Hz, lo que reduce la latencia de control y mejora la estabilidad temporal. El espacio de acción es de 20 dimensiones (por cada brazo: posición xyz, rotación en 6D y apertura de pinza), expresado en el marco de referencia del propio rig.

Su relevancia actual radica en que RunwayML libera no solo el checkpoint afinado, sino también el modelo base, la política para DROID, el código de referencia de inferencia, servicio y fine-tuning, y los conjuntos de evaluación. Esto permite a investigadores y desarrolladores reproducir el pipeline y adaptar la política a nuevos robots. El modelo requiere una GPU de 80 GB para inferencia, lo que lo sitúa en el terreno de investigación y despliegue en estaciones de trabajo o servidores, no en robótica de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE video-diffusion policy: tronco causal por chunks + experto de acción de 0,3B |
| Parametros totales | 27.202.463.488 (27,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (prompts en lenguaje natural, presumiblemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 17 shards, 54,4 GB) |

Especificaciones adicionales del sistema:

| Parametro | Valor |
|---|---|
| Embodiment | bimanual, cámaras `top_left`, `wrist_left`, `wrist_right` |
| Canvas de entrada | tres tiles de 256x416 (256x1248 total), vistas 16:10 |
| Control | 15 Hz, chunks de 24 pasos |
| Espacio de acción | 20-D: por brazo xyz(3) + rot6d(6) + grip(1); relativo a la pose de inicio del chunk, pinzas absolutas |
| Marco de pose | `rig` (marco del propio rig, sin conversión) |
| Dependencias congeladas | VAE Wan2.2, text encoder `Qwen/Qwen3.5-2B` (no incluidas en el repo) |

## Arquitectura y entrenamiento

Praxis-1 YAM es una política de difusión de vídeo con arquitectura MoE. El tronco procesa secuencias de vídeo de forma causal por chunks, lo que permite generar predicciones consistentes a lo largo del tiempo sin depender de un contexto completo de vídeo. El experto de acción, de aproximadamente 0,3 mil millones de parámetros, se encarga de mapear las representaciones latentes del tronco al espacio de acción de 20 dimensiones. La entrada visual se organiza como tres tiles de 256x416 yuxtapuestos horizontalmente (256x1248), correspondientes a las cámaras cenital y de muñeca izquierda y derecha. El texto se procesa mediante el encoder congelado `Qwen/Qwen3.5-2B`, y las imágenes pasan por el VAE congelado Wan2.2.

El modelo se obtiene por fine-tuning de `runwayml/praxis-1-base`, que no incluye cabezas de acción y sirve como punto de partida para nuevas plataformas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que los prompts deben enviarse tal cual, sin punto final, con el formato de las captions de entrenamiento (por ejemplo, "Pick up the pen from the center of the table, then place the pen in the bag"). Las estadísticas de normalización y el códec de acciones están en `config.json`, y no se necesitan estadísticas del dataset en inferencia.

## Capacidades

- Generación de trayectorias de acción bimanual en chunks de 24 pasos a 15 Hz para dos brazos YAM.
- Control de pinzas absoluto y de pose relativo al inicio de cada chunk, en el marco del rig.
- Procesamiento multimodal: tres vistas de cámara (cenital y dos de muñeca) más instrucción en lenguaje natural.
- Difusión de vídeo como mecanismo de predicción, lo que permite modelar la evolución temporal de la escena.
- Fine-tuning sobre el modelo base para adaptación a nuevas plataformas robóticas.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito.
- No se ha documentado capacidad multilingüe; los prompts de entrenamiento están en inglés.
- No se ha documentado soporte de audio ni otras modalidades.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo puede ejecutar tareas como recoger un objeto y colocarlo en un contenedor con dos brazos coordinados, usando las tres cámaras para localizar el objeto y planificar la trayectoria en chunks de 24 pasos.
- Investigación en políticas de imitación: sirve como referencia para comparar arquitecturas de difusión de vídeo frente a políticas más ligeras, gracias a la disponibilidad del modelo base y los conjuntos de evaluación `praxis-1-eval`.
- Adaptación a nuevos robots: partiendo de `praxis-1-base`, un equipo puede afinar la política para su propia plataforma bimanual siguiendo el código de `praxis-1-oss`, que incluye utilidades de fine-tuning.
- Despliegue en estaciones de trabajo con GPU de 80 GB: el modelo puede servirse con `configs/serve_yam.yaml` del repositorio de referencia para controlar un rig YAM real en tiempo de investigación.
- Evaluación de robustez ante variaciones de iluminación y posiciones: al recibir tres vistas, el modelo puede emplearse para estudiar cómo afectan las condiciones visuales a la precisión de las acciones generadas.
- Generación de datos sintéticos de acción: las trayectorias producidas pueden usarse como referencia o para aumentar datasets de imitación en estudios de robótica bimanual.
- Estudio de latencia y throughput en control a 15 Hz: el modelo permite medir si un esquema de chunks de 24 pasos es viable en hardware de 80 GB para tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: se requiere una GPU de 80 GB según la model card; los pesos en bf16 ocupan 54,4 GB, por lo que no cabe en GPUs de consumo de 24 GB o 48 GB sin cuantización, y no se documentan formatos cuantizados.
- GPU recomendadas: A100 80 GB, H100 80 GB, o GPUs profesionales con 80 GB de memoria.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16.
- Opciones de despliegue: el repositorio `runwayml/praxis-1-oss` incluye el código de inferencia y servicio, con el fichero `configs/serve_yam.yaml` para el rig YAM. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el control opera a 15 Hz con chunks de 24 pasos, pero no se proporcionan medidas de latencia por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Praxis-1 YAM | 27,2B (MoE) | no disponible | Política bimanual YAM | Apache 2.0 | Hugging Face |
| Praxis-1 DROID | no disponible | no disponible | Política monobrazo DROID | Apache 2.0 (presumible) | Hugging Face |
| Praxis-1 Base | no disponible | no disponible | Modelo base sin cabezas de acción | Apache 2.0 (presumible) | Hugging Face |
| Políticas de imitación tipo diffusion policy (genéricas) | típicamente <1B | no aplica | Manipulación | variable | variable |

No se dispone de datos de rendimiento comparativo entre Praxis-1 YAM y alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está afinado exclusivamente para el rig YAM bimanual con una configuración de cámaras concreta; no es directamente transferible a otras plataformas sin fine-tuning.
- Requiere una GPU de 80 GB para inferencia, lo que limita su uso a entornos de investigación con hardware especializado.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con captions en inglés, los prompts en otros idiomas pueden degradar el rendimiento.
- Riesgo de alucinación motora: como política generativa, puede producir trayectorias no válidas o inseguras; se recomienda supervisión humana y límites de seguridad en el robot.
- Las dependencias congeladas (VAE Wan2.2 y `Qwen/Qwen3.5-2B`) se distribuyen por separado bajo sus propias licencias, que deben revisarse antes de uso comercial.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte por parte de RunwayML.
- No se documentan mecanismos de cuantización ni despliegue en GPUs de consumo, lo que restringe la reproducibilidad en laboratorios con hardware limitado.
- El formato de los prompts debe respetar el estilo de entrenamiento (sin punto final); desviarse puede afectar a la calidad de las acciones.

## Enlaces

- [Hugging Face: runwayml/praxis-1-yam](https://huggingface.co/runwayml/praxis-1-yam)
- [Modelo base: runwayml/praxis-1-base](https://huggingface.co/runwayml/praxis-1-base)
- [Política DROID: runwayml/praxis-1-droid](https://huggingface.co/runwayml/praxis-1-droid)
- [Política DROID en formato LeRobot: runwayml/praxis-1-droid-lerobot](https://huggingface.co/runwayml/praxis-1-droid-lerobot)
- [Conjuntos de evaluación: runwayml/praxis-1-eval](https://huggingface.co/datasets/runwayml/praxis-1-eval)
- [Código de referencia: runwayml/praxis-1-oss](https://github.com/runwayml/praxis-1-oss)
