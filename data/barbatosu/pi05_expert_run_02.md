# Barbatosu/pi05_expert_run_02

## Resumen

Barbatosu/pi05_expert_run_02 es un fine-tuning del modelo π₀.₅ (pi05), un modelo Vision-Language-Action (VLA) desarrollado originalmente por Physical Intelligence y adaptado al ecosistema open source mediante la librería LeRobot de Hugging Face. El modelo base, lerobot/pi05_base, está diseñado para generalización en entornos abiertos, es decir, para ejecutar tareas de manipulación robótica en situaciones y escenarios no vistos durante el entrenamiento. Esta versión concreta ha sido ajustada por el usuario Barbatosu para una tarea específica de manipulación: introducir un cubo azul en una caja blanca, utilizando un robot de tipo `so_follower` (basado en la plataforma SO de LeRobot).

El modelo procesa imágenes de dos cámaras (frontal y de muñeca, ambas a 480x640 píxeles) junto con el estado articular del robot (6 grados de libertad) y genera comandos de acción de 6 dimensiones. Con aproximadamente 4.143 millones de parámetros en pesos safetensors (9,4 GB de repositorio), es un modelo de tamaño considerable que requiere GPU para inferencia en tiempo real. Su relevancia radica en que demuestra el flujo completo de imitación learning con VLA de última generación: grabación de demostraciones, fine-tuning desde un modelo base preentrenado y despliegue en hardware robótico real, todo con herramientas open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acción robótica; instrucciones de tarea en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors |

Datos adicionales de inferencia:

| Parametro | Valor |
|---|---|
| Robot compatible | `so_follower` |
| Camaras | `front`, `wrist` (480x640, 3 canales) |
| Dimension del estado de entrada | 6 |
| Dimension de la accion de salida | 6 |
| Libreria | LeRobot 0.6.2 |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

π₀.₅ es la evolución de π₀, un modelo VLA de Physical Intelligence que combina un backbone de visión-lenguaje con una cabeza de acción para generar comandos de control continuo en robots reales. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. El modelo consume observaciones multimodales (imágenes de cámaras RGB y estado proprioceptivo) y produce trayectorias de acción, entrenándose mediante imitación learning a partir de demostraciones humanas.

En este caso concreto, el fine-tuning se realizó sobre el dataset `Barbatosu/record-test_20261026_201007`, que contiene 50 episodios y 24.746 frames grabados a 30 FPS de la tarea "Put the blue cube into the white box". La configuración de entrenamiento fue: 10.000 pasos, batch size 2, optimizador AdamW con learning rate de 2,5e-05 y semilla 1000. No se dispone de información sobre el número de tokens del preentrenamiento original de π₀.₅ ni sobre el uso de RLHF/DPO (no aplicable en este contexto de control robótico).

## Capacidades

- Generación de acciones de control continuo (6 dimensiones) para manipulación robótica en tiempo real.
- Comprensión visual del entorno mediante dos cámaras RGB: vista frontal y vista de muñeca, ambas a resolución 480x640.
- Ejecución de la tarea aprendida: localizar un cubo azul, agarrarlo y depositarlo en una caja blanca.
- Generalización a nuevas posiciones de objetos y condiciones del entorno, heredada del preentrenamiento de π₀.₅ en entornos abiertos (el grado real de generalización de este fine-tuning concreto no ha sido evaluado).
- Seguimiento de instrucciones de tarea en lenguaje natural (la tarea se especifica como texto: "Put the blue cube into the white box").
- Compatibilidad con el ecosistema LeRobot: rollout, grabación de episodios y re-entrenamiento desde el mismo modelo base.

## Casos de uso

- **Automatización de tareas de pick-and-place en laboratorio:** el modelo puede ejecutar de forma autónoma la tarea de colocar un objeto específico en un contenedor, útil para prototipado de celdas robóticas de manipulación ligera con el brazo SO Follower.
- **Investigación en imitación learning:** sirve como punto de partida o baseline para experimentar con técnicas de fine-tuning de políticas VLA, comparando hiperparámetros, tamaños de dataset y tasas de éxito.
- **Prototipado rápido de políticas robóticas:** gracias a la integración con LeRobot, un desarrollador puede grabar 50 demostraciones de una tarea similar y re-entrenar desde lerobot/pi05_base siguiendo el mismo flujo documentado.
- **Educación y formación en robótica:** el pipeline completo (grabación de dataset, entrenamiento, despliegue) está documentado en las guías de LeRobot, lo que lo hace adecuado como caso práctico en cursos de robótica con aprendizaje por imitación.
- **Evaluación de generalización fuera de distribución:** se puede testear si la política mantiene la tarea ante cambios de iluminación, posición inicial del cubo o distractors, midiendo la tasa de éxito en trials reales.
- **Benchmarking de hardware de inferencia:** con 4.143 millones de parámetros, es un caso realista para medir latencia de inferencia VLA en GPUs de consumo frente a GPUs de servidor, un factor crítico para control robótico a 30 FPS.
- **Base para tareas derivadas:** partiendo de este checkpoint se puede continuar el fine-tuning con variaciones de la tarea (otros colores, otros contenedores) ampliando el dataset de demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "_No evaluation results have been provided for this policy yet._" Tampoco se han publicado tasas de éxito en el robot real (trials/successes) para la tarea "Put the blue cube into the white box".

## Requisitos de hardware

- **VRAM estimada para inferencia:** con 4.143 millones de parametros en pesos safetensors, se estima del orden de 8-10 GB en FP16/BF16 para los pesos, mas memoria adicional para activaciones y procesamiento de las dos camaras (no hay cifra oficial publicada).
- **GPU recomendadas:** una GPU de gama alta de consumo como la RTX 4090 (24 GB) deberia ser suficiente para inferencia; para entrenamiento se recomienda una GPU con mas VRAM (A100, H100) o entrenamiento prolongado en consumer GPU dada la configuracion de batch size 2.
- **Consumer GPU:** el modelo deberia caber en GPUs de 24 GB (RTX 3090, RTX 4090) para inferencia; en GPUs de 16 GB podria requerir optimizaciones no documentadas para este checkpoint.
- **Despliegue:** mediante la libreria LeRobot (version 0.6.2), usando el comando `lerobot-rollout` con `--policy.path=Barbatosu/pi05_expert_run_02` y `--policy.device=cuda`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplicables a modelos de politica robotica).
- **Latencia y throughput:** no disponibles. Para control a 30 FPS, la inferencia debe completarse en menos de ~33 ms por paso o usar horizontes de accion; LeRobot gestiona esta ejecucion, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Barbatosu/pi05_expert_run_02 | 4.143 M | VLA (pi05 fine-tuned) | Pick-and-place especifica (cubo azul a caja blanca) | gemma | Publico en Hugging Face |
| lerobot/pi05_base | 4.143 M (estimado, mismo base) | VLA base preentrenado | General, multitarea, open-world | gemma | Publico en Hugging Face |
| Otros fine-tunings de pi05 en LeRobot | ~4.143 M | VLA (pi05 fine-tuned) | Depende del dataset de cada autor | gemma | Varios repos publicos |

Notas de la comparativa: este modelo se distingue del base en que esta especializado en una unica tarea con un dataset de 50 episodios, por lo que deberia ofrecer mayor fiabilidad en esa tarea concreta a costa de la versatilidad. No hay datos de rendimiento comparativo publicados entre ellos.

## Limitaciones y advertencias

- **Alcance muy restringido:** la politica fue entrenada con un solo dataset de 50 episodios de una unica tarea. No debe esperarse que generalice a otras tareas, objetos o robots sin re-entrenamiento.
- **Hardware especifico:** esta ligada al robot `so_follower` y a la configuracion de camaras `front` y `wrist`; los nombres de las camaras deben coincidir exactamente con las claves de observacion del entrenamiento.
- **Sin evaluacion publicada:** no existen tasas de exito medidas, por lo que su fiabilidad en produccion es desconocida. Se recomienda ejecutar trials controlados antes de cualquier uso real.
- **Licencia gemma:** el modelo hereda la licencia Gemma, que incluye restricciones de uso (prohibiciones de ciertos usos, aceptacion de terminos). Revisa los terminos antes de cualquier despliegue comercial.
- **Riesgo de fallo fisico:** al tratarse de una politica de control en robot real, los fallos del modelo pueden provocar colisiones o danos en el hardware; se recomienda supervision y mecanismos de parada de emergencia.
- **Descargas muy bajas (30) y sin comunidad activa:** es un checkpoint experimental de un usuario individual, sin validacion de terceros ni mantenimiento garantizado.
- **Dependencia de version:** entrenado con LeRobot 0.6.2; versiones posteriores de la libreria podrian introducir incompatibilidades en el formato del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Barbatosu/pi05_expert_run_02
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Barbatosu/record-test_20261026_201007
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Barbatosu/record-test_20261026_201007
- Blog de Physical Intelligence sobre pi05: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Walkthrough de imitacion learning: https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- CLI cheat-sheet: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
