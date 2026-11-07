# OpenRAL/rskill-robometer_4b-any-general-nf4

## Resumen

`OpenRAL/rskill-robometer_4b-any-general-nf4` es un modelo de recompensa (reward model) para robótica empaquetado como *rSkill* del ecosistema OpenRAL. No es un modelo de lenguaje de propósito general ni una política de control: es un estimador de progreso y éxito que, a partir de fotogramas RGB de una ejecución robótica (*rollout*) y la instrucción de la tarea, emite por fotograma una probabilidad de éxito y un progreso normalizado entre 0 y 1. El modelo subyacente es Robometer-4B, un *finetune* de `Qwen/Qwen3-VL-4B-Instruct` con tres cabezas de predicción (`progress_head`, `success_head`, `preference_head`) sobre una lectura con atención de *pooling* de fotogramas (`frame_pool_attn`).

El paquete que nos ocupa es una conversión cuantizada a NF4 (4 bits, bitsandbytes) del checkpoint original, publicada por OpenRAL con licencia Apache-2.0. Su relevancia práctica es que reduce el peso en disco a unos 3,3 GB y permite ejecutar el modelo de recompensa en GPUs de consumo —la propia model card reporta un pico de 3,79 GB en una RTX 4070 Laptop de 8 GB—, lo que abarata mantener un monitor de progreso en paralelo a una política VLA durante el despliegue.

La utilidad del modelo se entiende en su contexto de uso: una política VLA emite acciones pero no sabe si está teniendo éxito. Robometer convierte el flujo de cámara en una señal escalar de progreso y éxito que el *Reasoner* consulta bajo demanda para decidir si continuar, escalar a un VLM de escena, avanzar de subobjetivo o entrar en la escalera de replanificación. Es, por tanto, un componente de percepción de solo lectura, sin acceso a actuadores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-4B Instruct) con cabezas `progress_head`, `success_head` y `preference_head` sobre `frame_pool_attn`; `architectures: ["RFM"]` en el `config.json` |
| Parámetros totales | 2.628.534.813 (según safetensors); el nombre comercial indica 4B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana temporal de despliegue: `reward.frame_window_s` = 40 s) |
| Tipos de cuantización | NF4 (4 bits, bitsandbytes); el repo declara también 8-bit entre sus tags |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint NF4 pre-cuantizado, `dtype: int4`) |

## Arquitectura y entrenamiento

Robometer-4B parte de `Qwen/Qwen3-VL-4B-Instruct` (`model_type: qwen3_vl`) y añade tres cabezas de predicción sobre una lectura con atención de *pooling* de fotogramas. El objetivo de entrenamiento es doble: una pérdida de **progreso** a nivel de fotograma, anclada en datos de expertos, y una pérdida de **preferencia** por comparación de trayectorias que impone un ordenamiento global entre ejecuciones. Los datos provienen de RBM-1M, más de un millón de trayectorias de diversas *embodiments*, incluyendo ejecuciones fallidas, lo que es clave para que el modelo aprenda a distinguir éxito de fracaso y no solo a imitar al experto.

Un detalle de implementación relevante: el `config.json` del checkpoint en disco anuncia `architectures: ["RFM"]`, y OpenRAL lo carga mediante la clase en árbol de lerobot `lerobot.rewards.robometer.RobometerRewardModel` con `transformers` estándar, sin ejecutar el paquete `robometer` original ni requerir el pin `transformers==4.57.1` de la receta upstream. La model card indica que esta ruta es más ligera que el *loader* vendorizado original. El modelo es agnóstico a la *embodiment* (`embodiment:any`), lo que significa que no asume una morfología de robot concreta.

## Capacidades

- Estimación de **progreso por fotograma** en el rango normalizado 0–1 a lo largo de una ejecución.
- Estimación de **probabilidad de éxito por fotograma** (`success_now` sobre el último fotograma de la ventana).
- Detección de **estancamiento** (`stalled`) y de tendencias sobre una ventana temporal consultable.
- Puntuación de la **ejecución completa** desde el inicio hasta el instante actual, con ventana configurable (`reward.frame_window_s` = 40 s por defecto).
- Modelo de recompensa **agnóstico a la embodiment**: entrenado sobre trayectorias de múltiples robots.
- Integración como herramienta de solo lectura (`QueryTaskProgressTool`) consultable por el *Reasoner* de OpenRAL.
- Funcionamiento en paralelo a una política VLA, consumiendo el mismo tópico de cámara `sensor_msgs/Image`.
- Soporte en simulación y en hardware real (tee de percepción GStreamer en real, publicador de cámara del HAL en `deploy-sim`).
- Capacidad multimodal de visión heredada de Qwen3-VL, aunque el modelo está especializado en la tarea de recompensa y no en generación de texto libre.
- **No** dispone de *tool calling* general, ni de modo de razonamiento extendido, ni de salidas de audio; no es un agente conversacional.

## Casos de uso

- **Monitorización de éxito en despliegue VLA**: el modelo se ejecuta en paralelo a la política y responde a consultas del *Reasoner* del tipo "¿cómo va el éxito ahora / en los últimos X segundos?", permitiendo detectar rollouts que se están estancando antes de agotar el tiempo límite.
- **Disparo de replanificación ante fallo**: cuando `success_now` cae o `stalled` se activa, el sistema puede escalar a un VLM de escena (`query_scene`) o entrar en la escalera de replanificación en lugar de ejecutar hasta el *timeout*.
- **Segmentación automática de subobjetivos**: la curva de progreso por fotograma permite decidir cuándo un subobjetivo está completado y avanzar al siguiente, útil en tareas de manipulación de varios pasos como "coger el cuenco negro y dejarlo en el plato".
- **Evaluación offline de políticas**: dado un conjunto de trayectorias grabadas, el modelo puntúa progreso y éxito por fotograma, sirviendo como métrica automática de calidad de una política sin anotación humana.
- **Filtrado y curación de datasets de robótica**: con más de un millón de trayectorias en RBM-1M como referencia, el modelo puede puntuar trayectorias propias y descartar episodios fallidos o mal etiquetados antes de reentrenar.
- **Investigación en aprendizaje por refuerzo con recompensa aprendida**: la señal de progreso continua (0–1) es un candidato natural como recompensa densa en pipelines de RL, aunque la model card lo presenta como componente de solo lectura y no como recompensa de entrenamiento.
- **Despliegue en robótica de bajo coste**: con un pico de 3,79 GB en una RTX 4070 Laptop de 8 GB, es viable montar el monitor de recompensa en estaciones de trabajo con GPU de consumo, sin necesidad de A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una comprobación cualitativa sobre un clip de `LIBERO libero_spatial` (tarea "pick up the black bowl and place it on the plate"), en la que el progreso asciende de 0,44 en el primer 20 % de fotogramas a 0,72 en el último 20 %, con un pico de memoria de 3,79 GB en una RTX 4070 Laptop de 8 GB. No hay cifras de MMLU, HumanEval, GSM8K ni de métricas específicas de éxito en robótica.

## Requisitos de hardware

- **VRAM mínima declarada**: 5,5 GB (`min_vram_gb` en los metadatos de OpenRAL).
- **Pico medido**: 3,79 GB con el *backbone* Qwen3-VL-4B en NF4 sobre una RTX 4070 Laptop de 8 GB.
- **GPU recomendadas**: cualquier GPU de consumo con 8 GB o más (RTX 4070, 4060 Ti 16 GB, 3080, 3090); en el extremo profesional, A100 o H100 si se comparte con otros componentes del *stack*.
- **Cabe en GPU de consumo**: sí, según la medición del autor en una RTX 4070 Laptop.
- **Latencia declarada**: 3.000 ms (`latency_ms`) por consulta, coherente con un rol S2 de razonamiento lento a 0,2–1 Hz.
- **Runtime**: PyTorch con `dtype: int4`; requiere el paquete de cuantización de **OpenRAL Pro**, ya que la edición open source solo carga pesos fp32, fp16 y bf16 (ADR-0123).
- **Opciones de despliegue**: nodo `openral_perception_ros.reward_monitor_node` en proceso, cargando `lerobot.rewards.robometer.RobometerRewardModel` con `transformers` estándar. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- **Throughput**: no disponible; el diseño es de consulta bajo demanda, no de streaming continuo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `OpenRAL/rskill-robometer_4b-any-general-nf4` | 2.628.534.813 (~4B nominales) | No disponible (ventana de 40 s) | NF4 (4 bits), también 8-bit | Apache-2.0 | Hugging Face; requiere OpenRAL Pro para cargar pesos cuantizados |
| `robometer/Robometer-4B` (base) | ~4B | No disponible | fp16/bf16 presumiblemente | Apache-2.0 (heredada) | Hugging Face; runtime upstream `robometer` |
| Política VLA genérica (p. ej. familia OpenVLA) | No disponible en esta búsqueda | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra el checkpoint base `robometer/Robometer-4B`: misma arquitectura y licencia, pero el paquete NF4 reduce el peso en disco a 3,3 GB y elimina la dependencia del paquete `robometer` original y del pin `transformers==4.57.1`. No se dispone de datos de benchmarks para establecer una comparación cuantitativa de rendimiento entre ambos.

## Limitaciones y advertencias

- **Requiere OpenRAL Pro**: la edición open source de OpenRAL solo carga pesos fp32, fp16 y bf16; los formatos cuantizados como NF4 necesitan el paquete de cuantización comercial (ADR-0123). Esto limita el uso del paquete en despliegues puramente open source.
- **Solo inglés**: el modelo declara únicamente `en` como idioma soportado, lo que restringe las instrucciones de tarea a ese idioma.
- **Advisory-only**: no acciona motores ni controla joints de `ros2_control`; su salida es informativa y el sistema de control debe implementar la lógica de decisión.
- **Riesgo de alucinación en la señal de recompensa**: al ser un modelo aprendido, puede producir curvas de progreso plausibles pero incorrectas en escenarios fuera de la distribución de RBM-1M (nuevas *embodiments*, iluminación, tareas no vistas).
- **Dependencia de la cámara**: en `deploy-sim` solo los robots que renderizan cámara exponen fotogramas; la ausencia de estos produce `ROSPerceptionStale`, lo que puede dejar el monitor sin señal.
- **Latencia de 3 s**: adecuada para consultas a 0,2–1 Hz, pero insuficiente para control reactivo de alta frecuencia.
- **Ventana temporal limitada**: la ventana por defecto de 40 s acota el horizonte de evaluación; tareas más largas requieren configuración adicional o consultas encadenadas.
- **Sesgos**: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre trayectorias de robots, puede heredar sesgos de las morfologías y entornos sobrerrepresentados en RBM-1M.
- **Licencia Apache-2.0**: permite uso comercial, pero conviene verificar la licencia del checkpoint base `robometer/Robometer-4B` y de `Qwen3-VL-4B-Instruct` antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-robometer_4b-any-general-nf4
- Repositorio del rSkill en GitHub: https://github.com/OpenRAL/openral/tree/master/rskills/robometer-4b/
- Modelo base: https://huggingface.co/robometer/Robometer-4B
- Modelo de visión subyacente: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Paper de Robometer: arXiv 2603.02115 (referenciado en la model card; no verificado en esta búsqueda)
- Documentación de lerobot: https://github.com/huggingface/lerobot
- Documentación de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
