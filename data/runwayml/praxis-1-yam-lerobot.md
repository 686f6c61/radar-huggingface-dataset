# runwayml/praxis-1-yam-lerobot

## Resumen

Praxis-1 YAM (LeRobot) es la version empaquetada para LeRobot de `runwayml/praxis-1-yam`, una politica robotica de difusion de video desarrollada por Runway ML. El modelo resuelve el problema del control motor bimano: recibe observaciones visuales de tres camaras y un estado de 14 dimensiones, y genera secuencias de acciones de 24 pasos a 15 Hz para un rig YAM de dos brazos. No es un modelo de lenguaje generalista, sino una politica de accion (policy) entrenada especificamente para manipulacion robotica.

Tecnicamente es una mezcla de expertos (MoE) de 27.200 millones de parametros con un tronco causal por chunks y un experto de accion de 0.300 millones de parametros. Usa un VAE de video Wan2.2 y un codificador de texto Qwen3.5-2B como dependencias congeladas, que se descargan por separado del Hub. Los pesos son identicos a los de `praxis-1-yam`, pero este repositorio anade el `config.json` de LeRobot (un `PraxisConfig`) y los preprocesadores y posprocesadores serializados, lo que permite cargarlo directamente con la libreria LeRobot.

Su relevancia actual radica en que Runway publica bajo licencia Apache 2.0 una politica bimana de gran escala con un formato de integracion estandar (LeRobot), lo que facilita su evaluacion y despliegue en laboratorios de robotica sin necesidad de reimplementar el pipeline de inferencia. El checkpoint esta en bf16, ocupa 54,4 GB en 17 shards safetensors y requiere una GPU de 80 GB para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de difusion de video: tronco causal por chunks + experto de accion de 0.3B |
| Parametros totales | 27.202.463.488 (27.2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (chunks de accion de 24 pasos a 15 Hz) |
| Tipos de cuantizacion | bf16 (unico formato publicado; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible (prompts de texto en lenguaje natural via Qwen3.5-2B) |
| Licencia | Apache 2.0 (dependencias congeladas bajo sus propias licencias) |
| Formato de pesos | safetensors (17 shards, `model.safetensors.index.json`), bf16, 54.4 GB |

## Arquitectura y entrenamiento

El modelo es una politica de difusion de video con arquitectura MoE. El tronco es causal por chunks y procesa las tres vistas de camara (`observation.images.top_left`, `observation.images.wrist_left`, `observation.images.wrist_right`) junto con el estado del robot. Un experto de accion de 0.300 millones de parametros genera los chunks de accion de 24 pasos. El preprocesador ajusta las tres vistas a mosaicos de 256x416 píxeles, aceptando cualquier resolucion de entrada con relacion 16:10. El estado y la accion son de 14 dimensiones: `[x, y, z, roll, pitch, yaw, gripper]` del brazo izquierdo seguido del derecho, en el marco de referencia mundial del rig.

El sampler utiliza los ajustes de servicio del checkpoint (`configs/serve_yam.yaml`): 2 pasos, flow shift 1.0 y sin guiado (guidance). Las dependencias congeladas no estan en este repositorio: el VAE de video Wan2.2 y el codificador de texto `Qwen/Qwen3.5-2B` se descargan del Hub. El checkpoint fue entrenado con captions como "Pick up the pen from the center of the table, then place the pen in the bag" (sin punto final), por lo que se recomienda enviar los prompts en ese formato. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de acciones motoras bimanuales: produce chunks de 24 pasos a 15 Hz para dos brazos YAM con pinza.
- Control basado en vision: integra tres vistas de camara (superior, muneca izquierda, muneca derecha) en un unico espacio latente.
- Seguimiento de instrucciones en lenguaje natural: los prompts de texto se envian literalmente al codificador Qwen3.5-2B.
- Manipulacion de objetos guiada por descripcion: entrenado con captions de tareas como coger un boligrafo y colocarlo en una bolsa.
- Inferencia con sampler de 2 pasos y flow shift 1.0, sin guiado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni vision generalista fuera del dominio roboticos.

## Casos de uso

- Manipulacion bimana en laboratorio: el modelo genera acciones coordinadas para dos brazos YAM a partir de instrucciones de texto y tres camaras, adecuado para tareas de pick-and-place con objetos descritos en el prompt.
- Evaluacion de politicas de robotica: sirve como referencia para comparar arquitecturas de difusion de video frente a politicas mas clasicas en entornos controlados.
- Fine-tuning para nuevos rigs: partiendo de `praxis-1-base` o de este checkpoint, se puede adaptar el modelo a configuraciones de camaras o efectores distintos; LeRobot soporta fine-tuning de un solo brazo por ahora.
- Investigacion en MoE aplicado a robotica: permite estudiar el comportamiento de un tronco causal por chunks con un experto de accion dedicado en tareas de control continuo.
- Despliegue en entornos de simulacion o laboratorio con GPU de 80 GB: el formato LeRobot permite integrar el modelo en pipelines de evaluacion estandarizados sin reimplementar el preprocesado.
- Reproducibilidad de experimentos: los pesos identicos a `praxis-1-yam` y el codigo de referencia en `praxis-1-oss` permiten replicar resultados de inferencia y servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: una GPU de 80 GB para inferencia en bf16 (indicado explicitamente en la model card).
- GPU recomendadas: A100 80 GB, H100 80 GB o similares con 80 GB de memoria.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en el formato publicado.
- Opciones de despliegue: LeRobot con el extra `lerobot[praxis]` (`PraxisPolicy.from_pretrained`) o las CLIs de LeRobot con `--policy.path=runwayml/praxis-1-yam-lerobot`. El codigo de referencia de inferencia, servicio y fine-tuning esta en `runwayml/praxis-1-oss`.
- Latencia y throughput: no disponibles. El sampler usa 2 pasos con flow shift 1.0 y sin guiado, lo que reduce el coste frente a samplers de mas pasos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / control | Licencia | Disponibilidad |
|---|---|---|---|---|
| Praxis-1 YAM (LeRobot) | 27.2B (MoE) | chunks de 24 pasos a 15 Hz | Apache 2.0 | Hugging Face, formato LeRobot |
| Praxis-1 DROID | no disponible | un solo brazo (DROID) | Apache 2.0 | Hugging Face (`runwayml/praxis-1-droid`) |
| Praxis-1 Base | no disponible | sin cabezas de accion | Apache 2.0 | Hugging Face (`runwayml/praxis-1-base`) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Requiere una GPU de 80 GB para inferencia; no es desplegable en hardware de consumo en el formato publicado.
- El fine-tuning a traves de LeRobot es solo de un brazo por ahora, lo que limita la adaptacion bimana.
- Depende de dos modelos externos (VAE Wan2.2 y Qwen3.5-2B) con sus propias licencias, que deben revisarse por separado para uso comercial.
- El modelo esta especializado en el rig YAM bimano; no es un modelo de proposito general ni un LLM.
- Los prompts deben seguir el formato de los captions de entrenamiento (sin punto final); desviarse de ese formato puede degradar el rendimiento.
- No se documentan sesgos, tasas de alucinacion ni comportamiento fuera del dominio roboticos; no hay datos de robustez en entornos no vistos.
- El estado y la accion asumen el marco de referencia mundial del rig y una convencion concreta de ejes; un rig distinto requiere recalibracion o fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/runwayml/praxis-1-yam-lerobot
- Modelo original: https://huggingface.co/runwayml/praxis-1-yam
- Modelo base: https://huggingface.co/runwayml/praxis-1-base
- Modelo base en formato LeRobot: https://huggingface.co/runwayml/praxis-1-base-lerobot
- Politica DROID: https://huggingface.co/runwayml/praxis-1-droid
- Politica DROID en formato LeRobot: https://huggingface.co/runwayml/praxis-1-droid-lerobot
- Conjuntos de evaluacion: https://huggingface.co/datasets/runwayml/praxis-1-eval
- Codigo de referencia: https://github.com/runwayml/praxis-1-oss
