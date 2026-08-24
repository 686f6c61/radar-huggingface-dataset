# iFaz/eqm-aloha_transfer_cube-seed3-half

## Resumen

El modelo `iFaz/eqm-aloha_transfer_cube-seed3-half` es una política de aprendizaje por imitación (imitation learning) diseñada para controlar un brazo robótico bimanual en el entorno simulado AlohaTransferCube-v0 de MuJoCo. Desarrollado por el autor iFaz y entrenado con la librería LeRobot de Hugging Face, el modelo ejecuta la tarea de transferir un cubo de un brazo al otro, un benchmark clásico de manipulación robótica bimanual. Se basa en una política de tipo EQM (Equilibrium Matching) y cuenta con 18,7 millones de parámetros, un tamaño reducido que permite su ejecución en hardware modesto. Su relevancia radica en servir como referencia para la investigación en aprendizaje por imitación aplicado a robótica, así como para comparar diferentes arquitecturas de políticas en entornos simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EQM (política de aprendizaje por imitación, sin detalles adicionales en la documentación) |
| Parametros totales | 18.700.608 |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del dataset, aunque el modelo no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política EQM se entrena mediante aprendizaje por imitación supervisado sobre un dataset de demostraciones humanas (`lerobot/aloha_sim_transfer_cube_human`). El entrenamiento se realizó durante 80.000 pasos con un batch size de 8, semilla 3, y una resolución de imagen de entrada de 96×96 píxeles. No se detallan en la documentación las capas internas de la red ni si se emplean técnicas como atención, convoluciones o MLP, aunque por el nombre EQM se infiere una arquitectura basada en emparejamiento de representaciones (equívoco) entre observaciones y acciones. El modelo se guarda en formato safetensors y se carga mediante la librería LeRobot, que gestiona el pipeline de entrenamiento, evaluación y despliegue. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al entrenamiento supervisado.

## Capacidades

- Control de un brazo robótico bimanual para la tarea de transferencia de cubo en el entorno simulado AlohaTransferCube-v0 de MuJoCo.
- Generación de acciones de control (posiciones y fuerzas de los actuadores) a partir de observaciones visuales (imágenes de las cámaras) y posiblemente del estado del sistema.
- Aprendizaje por imitación de demostraciones humanas recogidas en simulación.
- Ejecución de la tarea con una tasa de éxito del 60% en evaluación (5 episodios).
- Compatible con el framework LeRobot para entrenamiento, evaluación y despliegue en simulación.
- No soporta generación de texto, razonamiento, código, visión general ni tool calling, ya que es un modelo de control motor específico.

## Casos de uso

- **Investigación en aprendizaje por imitación**: sirve como punto de partida para comparar políticas EQM con otras arquitecturas (ACT, diffusion) en el mismo entorno de simulación, permitiendo estudiar qué métodos generalizan mejor en manipulación bimanual.
- **Desarrollo de controladores para robots bimanuales en simulación**: el modelo puede integrarse en entornos MuJoCo o gym-aloha para probar algoritmos de control y planificación de movimientos antes de trasladarlos a hardware real.
- **Generación de datos de entrenamiento**: se puede utilizar para generar trayectorias de demostración automáticas que alimenten otros modelos de imitación o de aprendizaje por refuerzo.
- **Benchmark de robustez**: evaluar la política bajo perturbaciones (ruido en las observaciones, cambios de iluminación o de posición inicial) para medir su capacidad de generalización.
- **Educación y prototipado**: permite a estudiantes y desarrolladores experimentar con políticas de robótica sin necesidad de un robot físico, solo con un ordenador con GPU y el entorno de simulación.
- **Comparación de arquitecturas de políticas**: al ser un modelo pequeño y abierto, sirve como baseline de referencia para probar nuevas técnicas de aprendizaje por imitación en el mismo benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible más allá de la evaluación incluida en la model card. El modelo alcanzó un 60% de éxito en 5 episodios de evaluación en la tarea AlohaTransferCube-v0, con una recompensa media de 178,60 y una recompensa máxima media de 3,00. No se proporcionan comparaciones con otros modelos en la documentación.

## Requisitos de hardware

- Con 18,7 millones de parámetros, el modelo tiene un tamaño de pesos en fp32 de aproximadamente 75 MB, lo que lo hace apto para ejecutarse en GPUs de consumo medio e incluso en CPU para inferencia en tiempo real en simulación.
- VRAM estimada: menos de 1 GB para inferencia en fp32 (sin cuantización).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, etc.) para inferencia fluida; se puede usar una RTX 4090 o A100 para entrenamiento o evaluación en lote.
- El modelo cabe en GPUs de consumo como la serie RTX 30 o 40, y también en plataformas sin GPU si se usa CPU (aunque la latencia será mayor).
- Opciones de despliegue: al estar basado en LeRobot, se puede cargar con `pytorch_model_hub_mixin` y ejecutar en entornos Python. No se menciona soporte para vLLM, Ollama o TGI (orientados a LLM). Para robótica, se integra con MuJoCo y gym-aloha.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Existen modelos alternativos para la misma tarea, como `iFaz/diffusion-aloha_transfer_cube-seed42` (política de difusión) y modelos basados en ACT (Action Chunking Transformer), pero no se han publicado resultados comparativos entre ellos en la documentación. La siguiente tabla resume los modelos mencionados en la búsqueda web, aunque sin datos de rendimiento detallados:

| Modelo | Arquitectura | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| iFaz/eqm-aloha_transfer_cube-seed3-half | EQM | 18,7M | apache-2.0 | Hugging Face |
| iFaz/diffusion-aloha_transfer_cube-seed42 | Diffusion policy | no disponible | apache-2.0 | Hugging Face |
| act_aloha_sim_transfer_cube_human (ACT) | Action Chunking Transformer | no disponible | no disponible | AIBase |

## Limitaciones y advertencias

- **Tarea específica**: el modelo está entrenado exclusivamente para la tarea de transferencia de cubo en el entorno simulado AlohaTransferCube-v0. No generaliza a otras tareas ni a entornos reales sin reentrenamiento.
- **Dependencia del simulador**: está diseñado para MuJoCo y gym-aloha; su uso fuera de este entorno requiere adaptación del interfaz de observaciones y acciones.
- **Sesgos del dataset**: las demostraciones humanas en simulación pueden tener sesgos en la forma de ejecutar la tarea (posturas, velocidades, etc.), lo que limita la robustez del modelo ante variaciones no vistas.
- **Rendimiento limitado**: la tasa de éxito del 60% en evaluación indica que falla en el 40% de los episodios, lo que no es adecuado para aplicaciones de producción sin un sistema de recuperación o supervisión.
- **Sin soporte multilingüe ni lenguaje natural**: no procesa texto ni entradas de lenguaje; su única interfaz es la observación del estado del robot y las imágenes de las cámaras.
- **Licencia abierta pero sin garantías**: aunque la licencia apache-2.0 permite uso comercial y modificación, el autor no ofrece garantías de funcionamiento ni de seguridad en aplicaciones reales.
- **No se especifican cuantizaciones**: no hay versiones cuantizadas publicadas, lo que podría limitar su despliegue en dispositivos con memoria restringida (aunque el tamaño es pequeño).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-half
- Documentación de la tarea Transfer Cube en gym-aloha: https://deepwiki.com/huggingface/gym-aloha/3.2-transfer-cube-task
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo alternativo de difusión: https://huggingface.co/iFaz/diffusion-aloha_transfer_cube-seed42
- Modelo ACT similar: https://model.aibase.com/models/details/1915692733462896642
