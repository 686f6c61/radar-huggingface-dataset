# omkarpatil/pick-blue-cylinder-right-arm-dp-wristnp-diffusion

## Resumen

El modelo `omkarpatil/pick-blue-cylinder-right-arm-dp-wristnp-diffusion` es una política de difusión (Diffusion Policy) entrenada con la librería LeRobot para controlar un brazo robótico ROBOTIS FFW SG2 Rev1 en la tarea de recoger un cilindro azul con el brazo derecho. Fue desarrollado por omkarpatil y publicado bajo licencia Apache-2.0. La política utiliza tres cámaras (dos de muñeca y una de cabeza) y no emplea propriocepción (el estado de observación está anulado). Este modelo forma parte de un grupo de composición (grupo B) junto con otras dos tareas relacionadas, compartiendo estadísticas de normalización agrupadas sobre 11.870 fotogramas.

El modelo se enmarca en el paradigma de diffusion policies para control robótico, que modela la distribución de acciones condicionada a observaciones visuales mediante un proceso de denoising. Con 274,49 millones de parámetros, fue entrenado durante 100.000 pasos con el optimizador Adam (lr 1e-4) y un scheduler de ruido DDPM, alcanzando una pérdida final de 0,003. Su relevancia actual reside en la tendencia de compartir políticas robóticas entrenadas en simuladores o entornos reales, permitiendo a la comunidad reproducir y componer comportamientos de manipulación sin necesidad de entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) |
| Parametros totales | 274.492.048 (según safetensors) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión-accion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy estándar implementada en LeRobot 0.6.1 (fork ROBOTIS `lerobot-cyclo`). El modelo condiciona la generación de acciones (posiciones del brazo) a partir de observaciones visuales de tres cámaras: `cam_left_wrist`, `cam_right_wrist` y una cámara de cabeza (resolución nativa 376x672). Dado que las cámaras de muñeca tienen una resolución distinta (424x240) y Diffusion Policy exige resoluciones uniformes, las vistas se re-codificaron a un tamaño común en la variante de tres cámaras. El estado de observación (propriocepción) está anulado (zeroed), por lo que la política depende exclusivamente de la información visual.

El entrenamiento se realizó con el dataset en formato LeRobot v3.0 (convertido desde v2.1), con estadísticas de normalización agrupadas para el grupo de composición B (miembros: `pick-blue-cylinder-left-arm`, `pick-blue-cylinder-right-arm` y `blue-cylinder-handover`). Estas estadísticas se calcularon sobre 11.870 fotogramas de todos los miembros y se escribieron idénticamente en cada dataset. La política se entrenó durante 100.000 pasos con batch size 8, optimizador Adam (betas 0,95 y 0,999, weight decay 1e-6) y scheduler DDPM. La pérdida final de entrenamiento fue 0,003.

## Capacidades

- Control robótico de manipulación: la política genera comandos de acción para el brazo derecho del robot ROBOTIS FFW SG2 Rev1, permitiendo la tarea de recoger un cilindro azul.
- Percepción visual multi-cámara: utiliza tres cámaras (dos de muñeca y una de cabeza) para inferir la posición del objeto y generar la trayectoria de agarre.
- Composición de tareas: el modelo está diseñado para componerse con otras políticas del mismo grupo (p. ej., `pick-blue-cylinder-left-arm` y `blue-cylinder-handover`) mediante estadísticas de normalización compartidas.
- Sin propriocepción: al anular el estado de observación, la política es puramente visual, lo que puede facilitar la transferencia a otros robots con cinemática similar.
- Generación de acciones por denoising: emplea el proceso de difusión DDPM para muestrear secuencias de acciones condicionadas a las observaciones.

## Casos de uso

- Automatización de pick-and-place en entornos industriales: el modelo puede integrarse en una celda robótica para recoger cilindros de una posición conocida, reduciendo el tiempo de programación manual.
- Investigación en aprendizaje por demostración: sirve como punto de partida para estudiar la composición de políticas y la transferencia entre tareas de manipulación.
- Desarrollo de robots de servicio: en tareas domésticas como recoger objetos de una mesa, la política puede adaptarse a otros robots con configuraciones similares de cámaras.
- Benchmarking de diffusion policies: al ser un modelo publicado con estadísticas y configuración detalladas, puede usarse como referencia para comparar arquitecturas de control.
- Entrenamiento por refuerzo con guía de políticas: la política preentrenada puede usarse como inicialización para fine-tuning con aprendizaje por refuerzo en tareas más complejas.
- Composición de comportamientos: junto con las otras políticas del grupo B, permite construir secuencias de manipulación más largas (p. ej., recoger con un brazo y pasar a otro).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica la pérdida final de entrenamiento (0,003), pero no proporciona métricas de éxito en la tarea (p. ej., tasa de éxito en episodios de evaluación).

## Requisitos de hardware

- El modelo tiene 274,49 millones de parámetros en safetensors, con un tamaño de repositorio de 1,1 GB. En precisión FP32, el peso del modelo ocupa aproximadamente 1,1 GB; en FP16, unos 550 MB.
- Para inferencia, una GPU con al menos 4 GB de VRAM sería suficiente para cargar el modelo en FP16, aunque no se especifica un requisito mínimo oficial.
- Dado que es una diffusion policy, la inferencia requiere varias pasadas de denoising (típicamente 10-100 pasos), lo que aumenta la latencia en comparación con políticas de una sola pasada.
- No se dispone de datos de latencia o throughput medidos.
- Opciones de despliegue: el modelo se carga con la librería LeRobot (Python) y puede ejecutarse en cualquier máquina con PyTorch y una GPU NVIDIA con CUDA. No se mencionan compatibilidades con vLLM, llama.cpp u otras herramientas de inferencia para LLMs.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. El modelo pertenece a una categoría muy específica (diffusion policies para un robot concreto) y no se dispone de datos de otros modelos similares para comparar parámetros, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recoger un cilindro azul con el brazo derecho en el robot ROBOTIS FFW SG2 Rev1. No generaliza a otros objetos, colores, posiciones o robots sin un reentrenamiento o adaptación.
- La variante de tres cámaras requiere que todas las vistas se re-codifiquen a una resolución común, lo que puede perder información de las cámaras de muñeca (originalmente 424x240) y afectar a la precisión en entornos reales.
- Al anular la propriocepción, la política depende completamente de la visión; si las cámaras se mueven o se obstruyen, la política puede fallar.
- La composición con otras políticas solo es válida dentro del mismo grupo (grupo B) y con la misma arquitectura (diffusion con diffusion). No es compatible con políticas GR00T que usan estadísticas diferentes.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías de rendimiento en entornos de producción.
- No se proporcionan datos de sesgos o alucinación (conceptos propios de modelos de lenguaje), pero sí hay riesgo de fallos en la ejecución si las condiciones de iluminación o fondo difieren de las del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/omkarpatil/pick-blue-cylinder-right-arm-dp-wristnp-diffusion
- Model card en HuggingFace (incluye detalles de entrenamiento y composición): https://huggingface.co/omkarpatil/pick-blue-cylinder-right-arm-dp-wristnp-diffusion/blob/main/README.md
