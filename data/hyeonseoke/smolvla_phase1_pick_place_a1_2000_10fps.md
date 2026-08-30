# HyeonseokE/smolvla_phase1_pick_place_A1_2000_10fps

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, diseñado para ejecutarse en hardware de consumo. El autor, HyeonseokE, ha ajustado el modelo base `lerobot/smolvla_base` sobre un dataset de 100 episodios de una tarea de pick-and-place en un robot SO-101, recogido mediante el pipeline SCRAPE-IsaacLab en Isaac Sim 5.1. La tarea concreta consiste en recoger un bloque rojo y colocarlo sobre un plato azul, y el modelo genera acciones de 6 grados de libertad a partir de observaciones de estado y tres cámaras.

La relevancia de este modelo radica en demostrar el fine-tuning eficiente de un VLA de tamaño reducido sobre un dataset simulado de pocas muestras, lo que permite a desarrolladores e investigadores experimentar con políticas robóticas sin necesidad de infraestructura de alto coste. Al estar basado en SmolVLA, hereda su arquitectura eficiente y su licencia Apache 2.0, lo que facilita su uso y modificación. El repositorio incluye los pesos en formato safetensors y se integra con el ecosistema LeRobot para entrenamiento y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, optimizado para reducir el coste computacional y permitir su despliegue en GPUs de consumo. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face, y este repositorio contiene un fine-tuning supervisado sobre un dataset de imitación de 100 episodios (28.459 frames a 10 FPS) de la tarea de pick-and-place. El dataset fue generado mediante SCRAPE-IsaacLab, un pipeline de replay de código-como-políticas que se ejecuta en Isaac Sim 5.1, lo que proporciona datos de alta calidad con anotaciones de acciones.

El entrenamiento se realizó con LeRobot 0.6.0 durante 22.200 pasos, con un batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 2000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; se trata de un fine-tuning estándar de aprendizaje por imitación. La arquitectura consume tres imágenes de 256x256 píxeles y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones.

## Capacidades

- Generacion de acciones de control robotico: el modelo produce comandos de 6 grados de libertad para el robot SO-101, adecuados para tareas de manipulacion.
- Percepcion multimodal: procesa tres imagenes RGB (256x256) y un vector de estado del robot, lo que permite integrar informacion visual y propioceptiva.
- Ejecucion de tareas de pick-and-place: entrenado especificamente para recoger un bloque rojo y colocarlo en un plato azul, con capacidad de generalizar dentro de la variabilidad del dataset.
- Integracion con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales o simulados.
- Eficiencia computacional: al ser SmolVLA, puede ejecutarse en hardware de consumo, aunque no se especifican requisitos exactos en este repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue, ya que el modelo esta orientado exclusivamente a control robotico.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos simulados: el modelo puede integrarse en Isaac Sim para validar politicas de manipulacion antes de transferirlas a un robot fisico, reduciendo costes y riesgos.
- Prototipado rapido de control robotico con LeRobot: los desarrolladores pueden cargar este modelo con `lerobot-rollout` y probarlo en un robot SO-101 con camaras top y left_wrist, ajustando los parametros de puerto y camaras segun su configuracion.
- Fine-tuning para tareas similares: al ser un checkpoint de SmolVLA, puede servir como punto de partida para adaptar la politica a otras tareas de manipulacion con pocos datos, usando el flujo de entrenamiento de LeRobot.
- Investigacion en aprendizaje por imitacion: el modelo y su dataset asociado permiten estudiar el efecto del numero de episodios, la tasa de frames y la semilla en el rendimiento de politicas VLA, comparando con otras variantes del mismo autor.
- Evaluacion de generalizacion en robotica: al estar entrenado en simulacion, puede usarse para analizar la brecha sim-to-real y probar tecnicas de domain randomization o adaptacion.
- Educacion y demostraciones: por su tamano reducido y licencia permisiva, es adecuado para cursos y talleres de robotica con IA, donde se puede desplegar en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica. No se proporcionan metricas de exito en la tarea ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion del repositorio. Dado que el modelo tiene 450 millones de parametros, en FP32 ocuparia aproximadamente 1,8 GB, y en FP16 unos 0,9 GB, pero no se confirma el formato de precision de los pesos.
- GPU recomendadas: no se especifican. Por las caracteristicas de SmolVLA, se espera compatibilidad con GPUs de consumo como RTX 3060 o superiores, pero no hay datos oficiales.
- Opciones de despliegue: el modelo se integra con LeRobot, que permite ejecucion en GPU via CUDA. No se mencionan otros motores como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El autor ha publicado otras dos variantes de este mismo fine-tuning, que se diferencian en la semilla o en la configuracion del dataset:

| Modelo | Semilla | Dataset | Notas |
|---|---|---|---|
| HyeonseokE/smolvla_phase1_pick_place_A1_2000_10fps | 2000 | phase1_pick_place_A1_10fps | Este modelo |
| HyeonseokE/smolvla_phase1_pick_place_A1_1000_10fps | 1000 | phase1_pick_place_A1_10fps | Misma tarea, distinta semilla |
| HyeonseokE/smolvla_phase1_pick_place_A2_2000_10fps | 2000 | phase1_pick_place_A2_10fps | Posiblemente variante del dataset A2 |

No se dispone de informacion detallada sobre las diferencias de rendimiento entre estas variantes. El modelo base `lerobot/smolvla_base` es el punto de partida comun, pero no se proporcionan comparativas cuantitativas.

## Limitaciones y advertencias

- Sin resultados de evaluacion: no hay metricas de exito en la tarea, por lo que el rendimiento real no esta verificado. Se recomienda evaluar el modelo en el robot o en simulacion antes de usarlo en produccion.
- Entrenado en simulacion: el dataset proviene de Isaac Sim, lo que puede provocar una brecha sim-to-real. La transferencia a un robot fisico puede requerir calibracion adicional o domain randomization.
- Tarea muy especifica: el modelo solo ha sido entrenado para recoger un bloque rojo y colocarlo en un plato azul. No generaliza a otros objetos, colores o disposiciones sin un nuevo fine-tuning.
- Dependencia de la configuracion de sensores: las entradas esperan tres camaras con resolucion 256x256 y un estado de 6 dimensiones. Cambios en el hardware o en la disposicion de las camaras invalidaran el modelo.
- Licencia del dataset: aunque el modelo tiene licencia Apache 2.0, el dataset asociado puede tener restricciones adicionales. Se debe verificar la licencia del dataset antes de un uso comercial.
- Fecha de creacion futura: el repositorio indica una fecha de creacion de agosto de 2026, lo que sugiere que puede ser un artefacto de prueba o un error de metadatos. Se recomienda verificar la autenticidad del modelo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A1_2000_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A1_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
